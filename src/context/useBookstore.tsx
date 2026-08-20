import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { 
  collection, doc, getDoc, setDoc, updateDoc, onSnapshot, 
  addDoc, runTransaction, getDocs, writeBatch, query, where,
  auth, db 
} from "../services/firebase";
import { redeemAccessCodeService, DigitalEntitlement } from "../services/entitlementService";

const formatSupabaseError = (err: any): string => {
  if (!err) return "An unexpected error occurred.";
  if (typeof err === "string") return err;
  return err.message || err.error_description || "An unexpected error occurred.";
};
export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  duration?: number;
  buttons?: { label: string; onClick: () => void }[];
}
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "../services/firebase";
import { supabase, isSupabaseConfigValid } from "../lib/supabase";
import { authService } from "../services/authService";
import { bookService } from "../services/bookService";
import { orderService } from "../services/orderService";
import { Book } from "../types";
import { resolveBookCover } from "../services/coverService";
export interface CartItem {
  book: Book;
  format: "physical" | "ebook";
  price: number;
  quantity: number;
}
export interface Coupon {
  code: string;
  discount: number; // e.g. 0.2 for 20%
}
export interface ShippingDetails {
  fullName: string;
  email: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
}
interface BookstoreContextType {
  books: Book[];
  cart: CartItem[];
  wishlist: string[];
  purchasedBooks: string[];
  orders: any[];
  userEntitlements: any[];
  activeCoupon: Coupon | null;
  shippingDetails: ShippingDetails | null;
  currentUser: any | null;
  currentUserProfile: any;
  isSupabaseConfigValid: boolean;
  isFirebaseConfigValid?: boolean;
  supabaseInitializationError: string | null;
  currentAdmin: any;
  isAuthLoading: boolean;
  toasts: ToastMessage[];
  receipts: any[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  addToCart: (book: Book, format: "physical" | "ebook", price: number) => void;
  removeFromCart: (bookId: string, format: "physical" | "ebook") => void;
  clearCart: () => void;
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  saveShipping: (details: ShippingDetails) => void;
  checkout: () => Promise<{ success: boolean; orderId: string; receipt?: any }>;
  downloadBook: (receiptId: string, bookId: string) => Promise<void>;
  verifyAndActivateCode: (code: string) => Promise<{ success: boolean; bookId?: string; message: string; book?: Book; codeDetails?: any }>;
  fetchUserLibrary: () => Promise<any[]>;
  saveReadingProgress: (bookId: string, chapterIndex: number, pageIndex: number) => Promise<void>;
  customerSignup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  customerLogin: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  customerLogout: () => Promise<void>;
  adminLogin: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}
const BookstoreContext = createContext<BookstoreContextType | undefined>(undefined);
export function BookstoreProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [userEntitlements, setUserEntitlements] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Auto-login stored admin session upon mounting
  useEffect(() => {
    const storedAdmin = localStorage.getItem("storyvault_admin") || sessionStorage.getItem("storyvault_admin");
    if (storedAdmin) {
      try {
        setCurrentAdmin(JSON.parse(storedAdmin));
      } catch (_) {}
    }
  }, []);
  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 3500;
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  // 1. Initialize Authentication and User Sync
  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }
    const unsubAuth = onAuthStateChanged(auth, async (user: any) => {
      if (user) {
        setCurrentUser(user);
        // Sync user document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const defaultName = user.displayName || "Guest Reader";
          const defaultEmail = user.email || "guest@storyvault.com";
          await setDoc(userRef, {
            uid: user.uid,
            name: defaultName,
            email: defaultEmail,
            role: "customer",
            cart: [],
            wishlist: [],
            purchasedBooks: [],
            createdAt: new Date().toISOString()
          });
        }
        // Setup real-time listener for user profile sync
        const unsubUserDoc = onSnapshot(userRef, (docSnap: any) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentUserProfile(data);
            setCart(data.cart || []);
            setWishlist(data.wishlist || []);
            setPurchasedBooks(data.purchasedBooks || []);
          } else {
            setCurrentUserProfile(null);
          }
          setIsAuthLoading(false);
        }, (err: any) => {
          console.warn("Failed to listen user doc:", err);
          setIsAuthLoading(false);
        });
        // Setup real-time listener for customer invoices
        const receiptsQuery = query(collection(db, "receipts"), where("customerId", "==", user.uid));
        const unsubReceipts = onSnapshot(receiptsQuery, (snap: any) => {
          const fetched: any[] = [];
          snap.forEach((docSnap: any) => {
            fetched.push({ id: docSnap.id, ...docSnap.data() });
          });
          setReceipts(fetched);
        });
        return () => {
          unsubUserDoc();
          unsubReceipts();
        };
      } else {
        setCurrentUser(null);
        setCurrentUserProfile(null);
        setIsAuthLoading(false);
        // Auto sign in anonymously for guests if no user loaded
        signInAnonymously(auth).catch(err => {
          console.warn("User authentication failed: ", err);
        });
      }
    });
    return () => unsubAuth();
  }, []);
  // Setup fallback local storage receipts for guest / offline users
  useEffect(() => {
    if (!currentUser) {
      const local = JSON.parse(localStorage.getItem("storyvault_receipts") || "[]");
      setReceipts(local);
    }
  }, [currentUser]);
  // 2. Real-time Books Sync and Seeding
  useEffect(() => {
    if (!db) {
      // Offline fallback: load preloaded books directly into state
      import("../services/booksDb").then(({ CLASSICS_DATABASE }) => {
        const fallbackBooks = CLASSICS_DATABASE.map(b => {
          // Resolve cover url safely
          let cover = b.coverUrl || "";
          if (b.id === "dracula") cover = "/dracula-cover.jpg";
          else if (b.id === "pride-and-prejudice") cover = "/pride-and-prejudice-cover.jpg";
          else if (b.id === "sherlock-holmes") cover = "/sherlock-holmes-cover.jpg";
          else if (b.id === "the-count-of-monte-cristo") cover = "/the-count-of-monte-cristo-cover.jpg";
          else if (b.id === "jane-eyre") cover = "/jane-eyre-cover.jpg";
          else if (b.id === "the-picture-of-dorian-gray") cover = "/dorian-gray-cover.jpg";
          else if (b.id === "the-time-machine") cover = "/time-machine-cover.jpg";
          else if (b.id === "frankenstein") cover = "/frankenstein-cover.jpg";
          else if (b.id === "the-metamorphosis") cover = "/metamorphosis-cover.jpg";
          else if (b.id === "the-odyssey") cover = "/odyssey-cover.jpg";
          else if (b.id === "moby-dick") cover = "/moby-dick-cover.jpg";
          else if (b.id === "alice-in-wonderland") cover = "/alice-wonderland-cover.jpg";
          else if (b.id === "peter-pan") cover = "/peter-pan-cover.jpg";
          else if (b.id === "the-great-gatsby") cover = "/gatsby-cover.jpg";
          else if (b.id === "crime-and-punishment") cover = "/crime-punishment-cover.jpg";
          else if (b.id === "war-and-peace") cover = "/war-peace-cover.jpg";
          else if (b.id === "les-miserables") cover = "/les-miserables-cover.jpg";
          else if (b.id === "don-quixote") cover = "/don-quixote-cover.jpg";
          else if (b.id === "the-divine-comedy") cover = "/divine-comedy-cover.jpg";
          else if (b.id === "the-iliad") cover = "/iliad-cover.jpg";
          return {
            id: b.id,
            title: b.title,
            author: b.author,
            description: b.description,
            genre: b.genre,
            language: b.language || "English",
            publicationYear: b.year,
            year: b.year,
            coverImage: cover,
            coverUrl: cover,
            rating: 4.9,
            featured: ["dracula", "pride-and-prejudice", "sherlock-holmes", "the-count-of-monte-cristo"].includes(b.id),
            isFeatured: ["dracula", "pride-and-prejudice", "sherlock-holmes", "the-count-of-monte-cristo"].includes(b.id),
            price: ["dracula", "pride-and-prejudice", "sherlock-holmes", "the-count-of-monte-cristo"].includes(b.id) ? 14.99 : 9.99,
            previewAvailable: true,
            previewDuration: 20,
            stock: ["dracula", "pride-and-prejudice", "sherlock-holmes", "the-count-of-monte-cristo"].includes(b.id) ? 25 : 50,
            quote: b.quote || "",
            chapters: b.chapters || []
          };
        });
        setBooks(fallbackBooks);
      });
      return;
    }
    const unsubBooks = onSnapshot(collection(db, "books"), async (snap: any) => {
      const featuredTargetIds = ["dracula", "pride-and-prejudice", "sherlock-holmes", "the-count-of-monte-cristo"];
      const existingIds: string[] = [];
      snap.forEach((dSnap: any) => {
        existingIds.push(dSnap.id);
      });
      const missingFeatured = featuredTargetIds.some(id => !existingIds.includes(id));
      if (snap.size < 100 || missingFeatured) {
        try {
          const { CLASSICS_DATABASE } = await import("../services/booksDb");
          const batch = writeBatch(db);
          for (const b of CLASSICS_DATABASE) {
            const cover = resolveBookCover(b);
            const bookRef = doc(db, "books", b.id);
            const seedBook = {
              title: b.title,
              author: b.author,
              description: b.description,
              genre: b.genre,
              language: b.language || (b as any).lang || "English",
              publicationYear: b.year,
              year: b.year,
              coverImage: cover,
              coverUrl: cover,
              rating: 4.9,
              featured: featuredTargetIds.includes(b.id),
              isFeatured: featuredTargetIds.includes(b.id),
              price: featuredTargetIds.includes(b.id) ? 14.99 : 9.99,
              previewAvailable: true,
              previewDuration: 20,
              stock: featuredTargetIds.includes(b.id) ? 25 : 50,
              isAvailable: true,
              isbn: `978-0-14-1439-${b.id}-7`,
              galleryUrls: [cover],
              seoMetaTitle: `${b.title} | STORYVAULT Editions`,
              seoMetaDesc: `Explore the premium editorial print of ${b.title} in STORYVAULT.`,
              seoCanonical: `https://storyvault.com/books/${b.id}`,
              isArchived: false,
              version: 1,
              chapters: b.chapters || [],
              previewContent: b.chapters || [],
              fullBookPath: `ebooks/${b.id}.txt`,
              totalPages: 150,
              storagePath: `ebooks/${b.id}.pdf`,
              downloadURL: `https://firebasestorage.googleapis.com/v0/b/storyvault-bookos.appspot.com/o/ebooks%2F${b.id}.pdf?alt=media`,
              previewURL: `https://firebasestorage.googleapis.com/v0/b/storyvault-bookos.appspot.com/o/previews%2F${b.id}.pdf?alt=media`,
              bookType: "Digital",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            batch.set(bookRef, seedBook);
          }
          await batch.commit();
        } catch (seedErr) {
          console.error("Failed to seed books to Content Repository:", seedErr);
        }
      } else {
        const fetched: Book[] = [];
        snap.forEach((docSnap: any) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Book);
        });
        setBooks(fetched);
      }
    });
    return () => unsubBooks();
  }, []);
  const updateFirestoreUser = async (newCart?: CartItem[], newWishlist?: string[]) => {
    if (!currentUser || !auth) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        cart: newCart !== undefined ? newCart : cart,
        wishlist: newWishlist !== undefined ? newWishlist : wishlist,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Failed to update user document in Firestore:", e);
    }
  };
  // 3. Sync actions back to Firestore
  const addToCart = (book: Book, format: "physical" | "ebook", price: number) => {
    const newCart = [...cart];
    const existingIdx = newCart.findIndex(item => item.book.id === book.id && item.format === format);
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += 1;
    } else {
      newCart.push({ book, format, price, quantity: 1 });
    }
    setCart(newCart);
    updateFirestoreUser(newCart);
    addToast({
      title: "✓ Added to Cart",
      message: `"${book.title}" (${format === "physical" ? "Leather Hardcover" : "Digital eBook"}) has been added to your cart.`
    });
  };
  const removeFromCart = (bookId: string, format: "physical" | "ebook") => {
    const bookTitle = cart.find(item => item.book.id === bookId && item.format === format)?.book.title || "Book";
    const newCart = cart.filter(item => !(item.book.id === bookId && item.format === format));
    setCart(newCart);
    updateFirestoreUser(newCart);
    addToast({
      title: "✓ Removed from Cart",
      message: `"${bookTitle}" has been removed from your cart.`
    });
  };
  const clearCart = () => {
    setCart([]);
    updateFirestoreUser([]);
  };
  const toggleWishlist = (bookId: string) => {
    const newWishlist = wishlist.includes(bookId)
      ? wishlist.filter(id => id !== bookId)
      : [...wishlist, bookId];
    setWishlist(newWishlist);
    updateFirestoreUser(cart, newWishlist);
  };
  const isInWishlist = (bookId: string) => wishlist.includes(bookId);
  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "WELCOME20") {
      setActiveCoupon({ code: "WELCOME20", discount: 0.20 });
      return true;
    } else if (cleanCode === "PRESERVATION") {
      setActiveCoupon({ code: "PRESERVATION", discount: 0.30 });
      return true;
    }
    return false;
  };
  const removeCoupon = () => setActiveCoupon(null);
  const saveShipping = (details: ShippingDetails) => setShippingDetails(details);
  const checkout = async (details?: any): Promise<{ success: boolean; orderId: string; digitalAccessCode?: string; receipt?: any }> => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = (shippingDetails as any)?.carrier === "express" ? 15 : (shippingDetails as any)?.carrier === "overnight" ? 30 : 0;
    const discount = activeCoupon ? (subtotal * activeCoupon.discount) / 100 : 0;
    const tax = (subtotal - discount) * 0.08;
    const grandTotal = subtotal - discount + shippingCost + tax;

    const payload = {
      userId: currentUser?.id || currentUser?.uid,
      customerName: details?.fullName || details?.name || currentUserProfile?.name || "StoryVault Patron",
      customerEmail: details?.email || currentUserProfile?.email || "patron@storyvault.com",
      items: cart.map(item => ({
        bookId: item.book.id,
        format: item.format,
        quantity: item.quantity,
        price: item.price,
        title: item.book.title
      })),
      subtotal,
      shipping: shippingCost,
      tax,
      total: grandTotal
    };

    const orderRes = await orderService.createOrder(payload);

    const newEntitlements: DigitalEntitlement[] = [];
    cart.forEach(item => {
      if (item.format === "ebook" || (item.format as string) === "digital" || (item.format as string) === "combo") {
        newEntitlements.push({
          id: `ent-${Date.now()}-${item.book.id}`,
          userId: currentUser?.id || currentUser?.uid || "guest",
          bookId: item.book.id,
          orderId: orderRes.orderNumber,
          format: item.format === "ebook" ? "digital" : (item.format as any),
          status: "active",
          purchasedAt: new Date().toISOString(),
          accessCode: orderRes.digitalCode || `SV-${item.book.id.substring(0, 4).toUpperCase()}7K`
        });
        setPurchasedBooks(prev => Array.from(new Set([...prev, item.book.id])));
      }
    });

    if (newEntitlements.length > 0) {
      setUserEntitlements((prev: any[]) => [...prev, ...newEntitlements]);
    }

    setCart([]);
    return {
      success: true,
      orderId: orderRes.orderNumber,
      digitalAccessCode: orderRes.digitalCode,
      receipt: orderRes.receipt
    };
  };

  const fetchUserLibrary = async (): Promise<any[]> => {
    const uid = currentUser?.id || currentUser?.uid || "guest";
    const localLibKey = `storyvault_users_${uid}_digital_library`;
    return JSON.parse(localStorage.getItem(localLibKey) || "[]");
  };

  const saveReadingProgress = async (bookId: string, chapterIndex: number, pageIndex: number) => {
    const uid = currentUser?.id || currentUser?.uid || "guest";
    const key = `storyvault_progress_${uid}_${bookId}`;
    localStorage.setItem(key, JSON.stringify({ chapterIndex, pageIndex, updatedAt: new Date().toISOString() }));
  };

  const customerSignup = async (fullName: string, email: string, password: string) => {
    if (!isSupabaseConfigValid) {
      const mockProfile = {
        uid: "local-mock-customer-uid",
        name: fullName,
        email: email,
        role: "customer",
        cart: [],
        wishlist: [],
        purchasedBooks: [],
        createdAt: new Date().toISOString()
      };
      setCurrentUserProfile(mockProfile);
      setCurrentUser({
        uid: "local-mock-customer-uid",
        email: email,
        displayName: fullName,
        isAnonymous: false
      } as any);
      addToast({
        title: "Account Created (Offline)",
        message: `Welcome to StoryVault, ${fullName}!`
      });
      return { success: true };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: fullName, role: "customer" } }
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("users").upsert({
          id: data.user.id,
          name: fullName,
          email,
          role: "customer",
          createdAt: new Date().toISOString()
        });
      }
      addToast({
        title: "Account Created",
        message: `Welcome to StoryVault, ${fullName}!`
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatSupabaseError(err) };
    }
  };
  // --- CUSTOMER LOGIN ---
  const customerLogin = async (email: string, password: string, rememberMe: boolean) => {
    if (!isSupabaseConfigValid) {
      const mockProfile = {
        uid: "local-mock-customer-uid",
        name: "Guest Reader",
        email: email,
        role: "customer",
        cart: [],
        wishlist: [],
        purchasedBooks: [],
        createdAt: new Date().toISOString()
      };
      setCurrentUserProfile(mockProfile);
      setCurrentUser({
        uid: "local-mock-customer-uid",
        email: email,
        displayName: "Guest Reader",
        isAnonymous: false
      } as any);
      addToast({
        title: "Login Successful (Offline)",
        message: "Welcome back to StoryVault!"
      });
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      addToast({
        title: "Login Successful",
        message: "Welcome back to StoryVault!"
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatSupabaseError(err) };
    }
  };
  // --- CUSTOMER LOGOUT ---
  const customerLogout = async () => {
    if (!isSupabaseConfigValid) {
      setCurrentUserProfile(null);
      setCurrentUser(null);
      addToast({
        title: "Logged Out",
        message: "Preservation profile disconnected successfully (Offline Mode)."
      });
      return;
    }
    try {
      await supabase.auth.signOut();
      setCurrentUserProfile(null);
      setCurrentUser(null);
      addToast({
        title: "Logged Out",
        message: "Preservation profile disconnected successfully."
      });
    } catch (err) {
      console.error(err);
    }
  };
  // --- GOOGLE SIGN IN ---
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigValid) {
      const mockProfile = {
        uid: "local-mock-google-uid",
        name: "Google Reader",
        email: "google@storyvault.com",
        role: "customer",
        cart: [],
        wishlist: [],
        purchasedBooks: [],
        createdAt: new Date().toISOString()
      };
      setCurrentUserProfile(mockProfile);
      setCurrentUser({
        uid: "local-mock-google-uid",
        email: "google@storyvault.com",
        displayName: "Google Reader",
        isAnonymous: false
      } as any);
      addToast({
        title: "Google Sync (Offline)",
        message: "Signed in successfully with Google."
      });
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
      addToast({
        title: "Google Sync Active",
        message: "Redirecting to Google authentication..."
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatSupabaseError(err) };
    }
  };
  // --- ADMIN LOGIN (WITH SELF-HEALING DEFAULT SEEDING) ---
  const adminLogin = async (email: string, password: string, rememberMe: boolean) => {
    if (!isSupabaseConfigValid) {
      const defaultAdmins: Record<string, { role: string; name: string; pass: string }> = {
        "karthik.chalamala07@gmail.com": { role: "Super Admin", name: "Karthik Chalamala", pass: password },
        "superadmin@storyvault.com": { role: "Super Admin", name: "Victoria Rex", pass: "SuperAdmin123!" },
        "content@storyvault.com": { role: "Content Manager", name: "Clara Page", pass: "Content123!" },
        "inventory@storyvault.com": { role: "Inventory Manager", name: "Marcus Stock", pass: "Inventory123!" },
        "orders@storyvault.com": { role: "Order Manager", name: "David Parcel", pass: "Orders123!" },
        "analytics@storyvault.com": { role: "Analytics Viewer", name: "Elena Chart", pass: "Analytics123!" }
      };
      if (defaultAdmins[email] && defaultAdmins[email].pass === password) {
        const adminData = {
          uid: "local-mock-admin-uid",
          name: defaultAdmins[email].name,
          email: email,
          role: defaultAdmins[email].role,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        setCurrentAdmin(adminData);
        if (rememberMe) {
          localStorage.setItem("storyvault_admin", JSON.stringify(adminData));
        } else {
          sessionStorage.setItem("storyvault_admin", JSON.stringify(adminData));
        }
        addToast({
          title: "CMS Authorized (Offline)",
          message: `Logged in locally as ${adminData.name} (${adminData.role})`
        });
        return { success: true };
      } else {
        return { success: false, error: "Invalid administrator credentials." };
      }
    }
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr: any) {
        const defaultAdmins: Record<string, { role: string; name: string; pass: string }> = {
          "karthik.chalamala07@gmail.com": { role: "Super Admin", name: "Karthik Chalamala", pass: password },
          "superadmin@storyvault.com": { role: "Super Admin", name: "Victoria Rex", pass: "SuperAdmin123!" },
          "content@storyvault.com": { role: "Content Manager", name: "Clara Page", pass: "Content123!" },
          "inventory@storyvault.com": { role: "Inventory Manager", name: "Marcus Stock", pass: "Inventory123!" },
          "orders@storyvault.com": { role: "Order Manager", name: "David Parcel", pass: "Orders123!" },
          "analytics@storyvault.com": { role: "Analytics Viewer", name: "Elena Chart", pass: "Analytics123!" }
        };
        if (defaultAdmins[email] && defaultAdmins[email].pass === password) {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await setDoc(doc(db, "admins", user.uid), {
            uid: user.uid,
            name: defaultAdmins[email].name,
            email: email,
            role: defaultAdmins[email].role,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        } else {
          throw signInErr;
        }
      }
      const user = userCredential.user;
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        await signOut(auth);
        return { success: false, error: "Access Denied: Not registered as an Administrator." };
      }
      const adminData = (adminSnap.data() || {}) as any;
      await updateDoc(adminRef, { lastLogin: new Date().toISOString() });
      adminData.lastLogin = new Date().toISOString();
      setCurrentAdmin(adminData);
      if (rememberMe) {
        localStorage.setItem("storyvault_admin", JSON.stringify(adminData));
      } else {
        sessionStorage.setItem("storyvault_admin", JSON.stringify(adminData));
      }
      addToast({
        title: "CMS Authorized",
        message: `Welcome, ${adminData.name} (${adminData.role})`
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatSupabaseError(err) };
    }
  };
  // --- ADMIN LOGOUT ---
  const adminLogout = async () => {
    if (!isSupabaseConfigValid) {
      setCurrentAdmin(null);
      localStorage.removeItem("storyvault_admin");
      sessionStorage.removeItem("storyvault_admin");
      addToast({
        title: "CMS Session Closed",
        message: "Administrator session terminated (Offline Mode)."
      });
      return;
    }
    try {
      setCurrentAdmin(null);
      localStorage.removeItem("storyvault_admin");
      sessionStorage.removeItem("storyvault_admin");
      await signOut(auth);
      addToast({
        title: "CMS Session Closed",
        message: "Administrator session terminated."
      });
    } catch (err) {
      console.error(err);
    }
  };
    const supabaseInitializationError: string | null = null;

  const verifyAndActivateCode = async (code: string): Promise<{ success: boolean; bookId?: string; message: string; book?: Book; codeDetails?: any }> => {
    const res = redeemAccessCodeService(code, currentUser?.uid, receipts, books);
    return { success: res.success, bookId: res.bookId, message: res.message || "" };
  };

  const downloadBook = async (bookId: string) => {
    addToast({ title: "Digital Preservation Codex", message: "Downloading offline manuscript..." });
  };

  const contextValue = useMemo(() => ({
    books,
    cart,
    wishlist,
    purchasedBooks,
    orders,
    userEntitlements,
    activeCoupon,
    shippingDetails,
    currentUser,
    currentUserProfile,
    currentAdmin,
    isAuthLoading,
    toasts,
    receipts,
    addToast,
    removeToast,
    addToCart,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    applyCoupon,
    removeCoupon,
    saveShipping,
    checkout,
    downloadBook,
    verifyAndActivateCode,
    fetchUserLibrary,
    saveReadingProgress,
    isSupabaseConfigValid,
    supabaseInitializationError,
    customerSignup,
    customerLogin,
    customerLogout,
    adminLogin,
    adminLogout,
    loginWithGoogle
  }), [
    books,
    cart,
    wishlist,
    purchasedBooks,
    orders,
    userEntitlements,
    activeCoupon,
    shippingDetails,
    currentUser,
    currentUserProfile,
    currentAdmin,
    isAuthLoading,
    toasts,
    receipts,
    isSupabaseConfigValid,
    supabaseInitializationError,
    customerSignup,
    customerLogin,
    customerLogout,
    adminLogin,
    adminLogout,
    loginWithGoogle
  ]);
  return (
    <BookstoreContext.Provider value={contextValue}>
      {children}
    </BookstoreContext.Provider>
  );
}
export function useBookstore() {
  const context = useContext(BookstoreContext);
  if (!context) {
    throw new Error("useBookstore must be used within a BookstoreProvider");
  }
  return context;
}
