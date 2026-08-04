import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  LayoutDashboard, BookOpen, Layers, Users, FolderOpen, Calendar, 
  DollarSign, ShoppingBag, Archive, TrendingUp, Sparkles, Clock, 
  Heart, Settings, Shield, User, Search, Plus, Trash2, Edit, Copy, 
  ArrowUpRight, ArrowDownRight, Eye, EyeOff, ChevronRight, ChevronDown, 
  Check, X, Percent, Truck, Bell, Play, Briefcase, History, Sliders, 
  Download, Upload, Activity, Grid, List, ArrowUp, ArrowDown, Lock, 
  RefreshCw, SlidersHorizontal, Zap, HelpCircle, FileText, CheckCircle, AlertTriangle, Star
} from "lucide-react";
import { Book } from "../types";

// Firebase Imports
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

// Extended Book Type for CMS
interface CMSBook extends Book {
  subtitle?: string;
  price: number;
  digitalPrice?: number;
  discount: number;
  stock: number;
  isAvailable: boolean;
  previewDuration: number;
  isbn: string;
  publisher?: string;
  galleryUrls: string[];
  seoMetaTitle: string;
  seoMetaDesc: string;
  seoCanonical: string;
  isArchived: boolean;
  isFeatured: boolean;
  version: number;
}

// Interfaces
interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: {
    bookId: string;
    title: string;
    price: number;
    quantity: number;
    cover: string;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  favorites?: string[];
  wishlist?: string[];
  readingHistory?: any[];
  bookmarks?: any;
  cart?: any[];
}

interface Coupon {
  code: string;
  type: "Percentage" | "Fixed" | "BOGO" | "Free Shipping";
  value: number;
  status: "Active" | "Scheduled" | "Expired";
  usageLimit: number;
  usedCount: number;
}

interface AutomationRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
}

interface MediaFile {
  id: string;
  name: string;
  folder: "Covers" | "Authors" | "PDFs" | "Banners";
  size: string;
  uploadedAt: string;
  tags: string[];
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

interface Review {
  id: string;
  bookId: string;
  username: string;
  rating: number;
  comment: string;
  status: "Pending" | "Approved";
  createdAt: string;
}

interface NotificationMsg {
  id: string;
  type: "order" | "inventory" | "review" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminPortal() {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Portal metadata helper for dynamic status
  const getPortalInfo = (tab: string) => {
    switch (tab) {
      case "Books":
        return {
          title: "Digital Asset Library",
          status: "Cloud Services Online",
          sync: "Live Synchronization Active"
        };
      case "Library CMS":
        return {
          title: "Content Repository",
          status: "Cloud Services Online",
          sync: "Live Synchronization Active"
        };
      case "Media Library":
        return {
          title: "Media Repository",
          status: "Cloud Services Online",
          sync: "Live Synchronization Active"
        };
      case "Analytics":
        return {
          title: "Live Business Insights",
          status: "Cloud Services Online",
          sync: "Live Synchronization Active"
        };
      case "Settings":
        return {
          title: "StoryVault Cloud Services",
          status: "Cloud Services Online",
          sync: "Live Synchronization Active"
        };
      case "Security":
        return {
          title: "User Authentication Portal",
          status: "Cloud Services Online",
          sync: "Live Synchronization Active"
        };
      default:
        return {
          title: `${tab} Live Portal`,
          status: "Cloud Services Online",
          sync: "Live Synchronization Active"
        };
    }
  };

  // Databases States
  const [books, setBooks] = useState<CMSBook[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);

  // Realtime Analytics state
  const [analyticsSummary, setAnalyticsSummary] = useState({
    revenue: 0,
    ordersCount: 0,
    visitors: 0,
    customersCount: 0,
    previewConversions: 0
  });

  // UI Interactive States
  const [searchQuery, setSearchQuery] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [cmdInput, setCmdInput] = useState("");
  const [selectedBook, setSelectedBook] = useState<CMSBook | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Books CMS UI Filter & Dialog States
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [formatFilter, setFormatFilter] = useState("All");
  const [featuredFilter, setFeaturedFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<CMSBook | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "preview">("create");
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [themeConfig, setThemeConfig] = useState({
    bg: "#111111",
    surface: "#1A1A1A",
    primaryText: "#F8F6F2",
    secondaryText: "#A5A5A5",
    gold: "#C9A227",
    borderRadius: "8px",
    animations: "Smooth",
    fontFamily: "Inter"
  });

  // Role Configuration
  const [currentRole, setCurrentRole] = useState<"Super Admin" | "Editor" | "Content Manager" | "Customer Support">("Super Admin");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Notification Toast state
  const [toasts, setToasts] = useState<{ id: string; type: "success" | "warn" | "error"; text: string }[]>([]);
  
  // AI Studio states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGeneratedText, setAiGeneratedText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Open Library & Gutenberg Imports
  const [importQuery, setImportQuery] = useState("");
  const [importSource, setImportSource] = useState<"OpenLibrary" | "Gutenberg">("OpenLibrary");
  const [importLoading, setImportLoading] = useState(false);

  // Automation Rule flow tabs
  const [activeAutomationTab, setActiveAutomationTab] = useState<string>("rules");

  // Reorder homepage orders state
  const [homepageLayout, setHomepageLayout] = useState([
    { id: "section-hero", name: "Hero Banner (Classics Redefined)", visible: true },
    { id: "section-featured", name: "Featured Books (Top 4 Carousel)", visible: true },
    { id: "section-spotlight", name: "Mary Shelley Author Panel", visible: true },
    { id: "section-newsletter", name: "Newsletter Signup", visible: true }
  ]);

  // 1. Establish Real-time Firestore Listeners with Local Storage Fallbacks
  useEffect(() => {
    setIsLoading(true);

    // Initial local storage fallbacks load
    const loadLocalFallbacks = () => {
      // Books
      const localBooks = JSON.parse(localStorage.getItem("storyvault_books") || "[]");
      if (localBooks.length > 0) setBooks(localBooks);

      // Orders
      const localOrders = JSON.parse(localStorage.getItem("storyvault_orders") || "[]");
      setOrders(localOrders);

      // Notifications
      const localNotifs = JSON.parse(localStorage.getItem("storyvault_notifications") || "[]");
      setNotifications(localNotifs);

      // Analytics
      const localAnalytics = JSON.parse(localStorage.getItem("storyvault_analytics") || '{"revenue":0,"ordersCount":0,"visitors":24,"customersCount":0,"previewConversions":5}');
      setAnalyticsSummary(localAnalytics);
    };

    loadLocalFallbacks();

    // Merging handlers
    const mergeBooks = (firestoreList: CMSBook[]) => {
      const localBooks = JSON.parse(localStorage.getItem("storyvault_books") || "[]");
      const combined = [...firestoreList];
      localBooks.forEach((lb: any) => {
        if (!combined.some(fb => fb.id === lb.id)) combined.push(lb);
      });
      setBooks(combined);
    };

    const mergeOrders = (firestoreList: Order[]) => {
      const localOrders = JSON.parse(localStorage.getItem("storyvault_orders") || "[]");
      const combined = [...firestoreList];
      localOrders.forEach((lo: any) => {
        if (!combined.some(fo => fo.orderId === lo.orderId)) combined.push(lo);
      });
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(combined);
    };

    const mergeNotifications = (firestoreList: NotificationMsg[]) => {
      const localNotifs = JSON.parse(localStorage.getItem("storyvault_notifications") || "[]");
      const combined = [...firestoreList];
      localNotifs.forEach((ln: any) => {
        if (!combined.some(fn => fn.id === ln.id)) combined.push(ln);
      });
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(combined);
    };

    const mergeAnalytics = (firestoreData: any) => {
      const localAnalytics = JSON.parse(localStorage.getItem("storyvault_analytics") || '{"revenue":0,"ordersCount":0,"visitors":24,"customersCount":0,"previewConversions":5}');
      setAnalyticsSummary({
        revenue: (firestoreData.revenue || 0) + (localAnalytics.revenue || 0),
        ordersCount: (firestoreData.ordersCount || 0) + (localAnalytics.ordersCount || 0),
        visitors: Math.max(firestoreData.visitors || 0, localAnalytics.visitors || 24),
        customersCount: (firestoreData.customersCount || 0) + (localAnalytics.customersCount || 0),
        previewConversions: Math.max(firestoreData.previewConversions || 0, localAnalytics.previewConversions || 5)
      });
    };

    // Subscriptions
    const unsubBooks = onSnapshot(collection(db, "books"), (snap) => {
      const list: CMSBook[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as CMSBook);
      });
      mergeBooks(list);
    }, (err) => {
      console.warn("Firestore books sync offline, using local fallback");
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const list: Order[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as Order);
      });
      mergeOrders(list);
    }, (err) => {
      console.warn("Firestore orders sync offline, using local fallback");
    });

    const unsubCustomers = onSnapshot(collection(db, "users"), (snap) => {
      const list: Customer[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as Customer);
      });
      setCustomers(list);
    }, (err) => {
      console.warn("Firestore users sync offline");
    });

    const unsubCoupons = onSnapshot(collection(db, "coupons"), (snap) => {
      const list: Coupon[] = [];
      snap.forEach(dSnap => {
        list.push({ ...dSnap.data() } as Coupon);
      });
      setCoupons(list);
    });

    const unsubAutomations = onSnapshot(collection(db, "automations"), (snap) => {
      const list: AutomationRule[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as AutomationRule);
      });
      setAutomations(list);
    });

    const unsubMedia = onSnapshot(collection(db, "media"), (snap) => {
      const list: MediaFile[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as MediaFile);
      });
      setMediaFiles(list);
    });

    const unsubMediaErrors = (err: any) => {
      console.warn("Media subscription offline");
    };

    const unsubAudits = onSnapshot(collection(db, "audits"), (snap) => {
      const list: AuditLog[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as AuditLog);
      });
      setAuditLogs(list);
    });

    const unsubReviews = onSnapshot(collection(db, "reviews"), (snap) => {
      const list: Review[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as Review);
      });
      setReviews(list);
    });

    const unsubNotifications = onSnapshot(collection(db, "notifications"), (snap) => {
      const list: NotificationMsg[] = [];
      snap.forEach(dSnap => {
        list.push({ id: dSnap.id, ...dSnap.data() } as NotificationMsg);
      });
      mergeNotifications(list);
    }, (err) => {
      console.warn("Firestore notifications sync offline, using local fallback");
    });

    const unsubAnalytics = onSnapshot(doc(db, "analytics", "summary"), (docSnap) => {
      if (docSnap.exists()) {
        mergeAnalytics(docSnap.data());
      }
    }, (err) => {
      console.warn("Firestore analytics sync offline, using local fallback");
    });

    // Realtime storage listener for cross-tab local syncing
    const handleStorageEvent = (e: StorageEvent) => {
      if (
        e.key === "storyvault_orders" || 
        e.key === "storyvault_notifications" || 
        e.key === "storyvault_analytics" || 
        e.key === "storyvault_books"
      ) {
        loadLocalFallbacks();
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    // Local custom event listener for same-tab updates
    const handleLocalSync = () => {
      loadLocalFallbacks();
    };
    window.addEventListener("storage", handleLocalSync);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => {
      unsubBooks();
      unsubOrders();
      unsubCustomers();
      unsubCoupons();
      unsubAutomations();
      unsubMedia();
      unsubAudits();
      unsubReviews();
      unsubNotifications();
      unsubAnalytics();
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("storage", handleLocalSync);
      clearTimeout(timer);
    };
  }, []);

  // Update theme variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-bg", themeConfig.bg);
    root.style.setProperty("--color-surface", themeConfig.surface);
    root.style.setProperty("--color-gold", themeConfig.gold);
    root.style.setProperty("--color-text-primary", themeConfig.primaryText);
    root.style.setProperty("--color-text-secondary", themeConfig.secondaryText);
    root.style.setProperty("border-radius", themeConfig.borderRadius);
  }, [themeConfig]);

  // Command palette filter options
  const commandOptions = useMemo(() => {
    const list = [
      { category: "Navigation", name: "Go to Dashboard", action: () => setActiveTab("Dashboard") },
      { category: "Navigation", name: "Go to Books Catalog", action: () => setActiveTab("Books") },
      { category: "Navigation", name: "Go to Orders List", action: () => setActiveTab("Orders") },
      { category: "Navigation", name: "Go to Customers View", action: () => setActiveTab("Customers") },
      { category: "Navigation", name: "Go to System Settings", action: () => setActiveTab("Settings") },
      { category: "Action", name: "Create New Book", action: () => { handleOpenCreateModal(); } }
    ];
    if (!cmdInput) return list;
    return list.filter(item => item.name.toLowerCase().includes(cmdInput.toLowerCase()) || item.category.toLowerCase().includes(cmdInput.toLowerCase()));
  }, [cmdInput]);

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toast notifier helper
  const triggerToast = (text: string, type: "success" | "warn" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const runConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.85 },
      colors: ["#C9A227", "#111111"]
    });
  };

  // Menu lists
  const sidebarMenu = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Books", icon: BookOpen },
    { title: "Library CMS", icon: Layers },
    { title: "Homepage Builder", icon: Sliders },
    { title: "Authors", icon: User },
    { title: "Categories", icon: Grid },
    { title: "Orders", icon: ShoppingBag },
    { title: "Customers", icon: Users },
    { title: "Inventory", icon: Archive },
    { title: "Reviews", icon: Heart },
    { title: "Coupons", icon: Percent },
    { title: "Marketing", icon: TrendingUp },
    { title: "Analytics", icon: Activity },
    { title: "Media Library", icon: FolderOpen },
    { title: "AI Studio", icon: Sparkles },
    { title: "Automation Center", icon: Zap },
    { title: "Settings", icon: Settings },
    { title: "Security", icon: Shield }
  ];

  // Book Duplication Handler
  const handleDuplicateBook = async (book: CMSBook) => {
    try {
      await addDoc(collection(db, "books"), {
        title: `${book.title} (Copy)`,
        author: book.author || "Unknown",
        genre: book.genre || "Classic",
        year: book.year || 2026,
        language: book.language || "English",
        coverUrl: book.coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400",
        description: book.description || "",
        quote: book.quote || "",
        chapters: book.chapters || [],
        price: book.price || 0,
        digitalPrice: book.digitalPrice || 0,
        discount: book.discount || 0,
        stock: book.stock || 0,
        isAvailable: book.stock > 0,
        previewDuration: book.previewDuration || 0,
        isbn: book.isbn ? `${book.isbn}-dup` : "",
        publisher: book.publisher || "",
        fullBookPath: book.fullBookPath || "",
        galleryUrls: book.galleryUrls || [],
        seoMetaTitle: book.seoMetaTitle || "",
        seoMetaDesc: book.seoMetaDesc || "",
        seoCanonical: book.seoCanonical || "",
        isArchived: book.isArchived || false,
        isFeatured: false,
        version: 1
      });
      triggerToast(`Book "${book.title}" duplicated successfully.`);
    } catch (err) {
      console.warn("Failed to duplicate book:", err);
    }
  };

  // Toggle Featured Handler
  const handleToggleFeatured = async (book: CMSBook) => {
    try {
      const bookRef = doc(db, "books", book.id);
      const nextFeatured = !book.isFeatured;
      await updateDoc(bookRef, { isFeatured: nextFeatured });
      triggerToast(`Book "${book.title}" featured status updated.`);
    } catch (err) {
      console.warn("Failed to update featured status:", err);
    }
  };

  // Export Library Handler
  const handleExportLibrary = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(books, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "storyvault_library_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Library exported successfully.", "success");
  };

  // Search and Fetch from Gutenberg & OpenLibrary
  const handleSearchImport = async () => {
    if (!importQuery) return;
    setImportLoading(true);
    setImportResults([]);
    try {
      if (importSource === "OpenLibrary") {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(importQuery)}&limit=5`);
        const data = await res.json();
        const docs = data.docs || [];
        setImportResults(docs.map((d: any) => ({
          title: d.title,
          author: d.author_name ? d.author_name[0] : "Unknown Author",
          isbn: d.isbn ? d.isbn[0] : "",
          genre: d.subject ? d.subject[0] : "Classic",
          year: d.first_publish_year || 2026,
          coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400",
          description: d.first_sentence ? d.first_sentence[0] : `A literary piece by ${d.author_name ? d.author_name[0] : "Unknown Author"}.`
        })));
      } else {
        const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(importQuery)}`);
        const data = await res.json();
        const results = data.results || [];
        setImportResults(results.slice(0, 5).map((r: any) => ({
          title: r.title,
          author: r.authors && r.authors.length > 0 ? r.authors[0].name : "Unknown Author",
          isbn: "",
          genre: "Classic",
          year: 1900,
          coverUrl: r.formats["image/jpeg"] || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400",
          description: `Project Gutenberg eBook #${r.id}.`
        })));
      }
    } catch (e) {
      triggerToast("Failed to search import database.", "error");
    } finally {
      setImportLoading(false);
    }
  };

  const handleExecuteImport = async (item: any) => {
    try {
      await addDoc(collection(db, "books"), {
        title: item.title,
        author: item.author,
        genre: item.genre,
        year: item.year,
        language: "English",
        coverUrl: item.coverUrl,
        description: item.description,
        quote: "",
        chapters: [
          { title: "Chapter 1", content: ["The start of a grand classic adventure..."] }
        ],
        price: 19.99,
        digitalPrice: 9.99,
        discount: 0,
        stock: 100,
        isAvailable: true,
        previewDuration: 15,
        isbn: item.isbn || "",
        publisher: "StoryVault Classic Press",
        fullBookPath: "",
        galleryUrls: [],
        seoMetaTitle: item.title,
        seoMetaDesc: item.description,
        seoCanonical: "",
        isArchived: false,
        isFeatured: false,
        version: 1
      });
      triggerToast(`Successfully imported "${item.title}"!`, "success");
      setIsImportModalOpen(false);
    } catch (err) {
      triggerToast("Failed to import book.", "error");
    }
  };

  // Filtered & Sorted books memo
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        b => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "All") {
      result = result.filter(b => b.genre === categoryFilter);
    }

    if (languageFilter !== "All") {
      result = result.filter(b => b.language === languageFilter);
    }

    if (formatFilter !== "All") {
      if (formatFilter === "Physical") {
        result = result.filter(b => (b.price || 0) > 0);
      } else if (formatFilter === "Digital") {
        result = result.filter(b => (b.digitalPrice || 0) > 0);
      } else if (formatFilter === "Both") {
        result = result.filter(b => (b.price || 0) > 0 && (b.digitalPrice || 0) > 0);
      }
    }

    if (featuredFilter !== "All") {
      const targetFeatured = featuredFilter === "Featured";
      result = result.filter(b => b.isFeatured === targetFeatured);
    }

    result.sort((a, b) => {
      if (sortOption === "Newest") {
        return (b.year || 0) - (a.year || 0);
      } else if (sortOption === "Oldest") {
        return (a.year || 0) - (b.year || 0);
      } else if (sortOption === "A-Z") {
        return (a.title || "").localeCompare(b.title || "");
      } else if (sortOption === "Z-A") {
        return (b.title || "").localeCompare(a.title || "");
      }
      return 0;
    });

    return result;
  }, [books, searchQuery, categoryFilter, languageFilter, formatFilter, featuredFilter, sortOption]);

  // Book CRUD Handlers
  const handleOpenCreateModal = () => {
    setSelectedBook({
      id: `book-${Date.now()}`,
      title: "",
      author: "",
      genre: "Gothic",
      year: 2026,
      language: "English",
      coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400",
      description: "",
      quote: "",
      chapters: [],
      price: 0,
      digitalPrice: 0,
      discount: 0,
      stock: 0,
      isAvailable: true,
      previewDuration: 20,
      isbn: "",
      publisher: "",
      fullBookPath: "",
      galleryUrls: [],
      seoMetaTitle: "",
      seoMetaDesc: "",
      seoCanonical: "",
      isArchived: false,
      isFeatured: false,
      version: 1
    });
    setModalMode("create");
    setIsBookModalOpen(true);
  };

  const handleOpenEditModal = (book: CMSBook) => {
    setSelectedBook({ ...book });
    setModalMode("edit");
    setIsBookModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      if (modalMode === "create") {
        await addDoc(collection(db, "books"), {
          title: selectedBook.title,
          author: selectedBook.author,
          genre: selectedBook.genre,
          year: selectedBook.year,
          language: selectedBook.language,
          coverUrl: selectedBook.coverUrl,
          description: selectedBook.description,
          quote: selectedBook.quote,
          chapters: selectedBook.chapters || [],
          price: selectedBook.price || 0,
          digitalPrice: selectedBook.digitalPrice || 0,
          discount: selectedBook.discount || 0,
          stock: selectedBook.stock || 0,
          isAvailable: selectedBook.isAvailable ?? true,
          previewDuration: selectedBook.previewDuration || 0,
          isbn: selectedBook.isbn || "",
          publisher: selectedBook.publisher || "",
          fullBookPath: selectedBook.fullBookPath || "",
          galleryUrls: selectedBook.galleryUrls || [],
          seoMetaTitle: selectedBook.seoMetaTitle || "",
          seoMetaDesc: selectedBook.seoMetaDesc || "",
          seoCanonical: selectedBook.seoCanonical || "",
          isArchived: selectedBook.isArchived ?? false,
          isFeatured: selectedBook.isFeatured ?? false,
          version: 1
        });
        triggerToast(`Book "${selectedBook.title}" successfully created!`);
      } else {
        const bookRef = doc(db, "books", selectedBook.id);
        await updateDoc(bookRef, {
          title: selectedBook.title,
          author: selectedBook.author,
          genre: selectedBook.genre,
          year: selectedBook.year,
          language: selectedBook.language,
          coverUrl: selectedBook.coverUrl,
          description: selectedBook.description,
          quote: selectedBook.quote,
          price: selectedBook.price,
          digitalPrice: selectedBook.digitalPrice || 0,
          discount: selectedBook.discount,
          stock: selectedBook.stock,
          isAvailable: selectedBook.stock > 0,
          previewDuration: selectedBook.previewDuration,
          isbn: selectedBook.isbn,
          publisher: selectedBook.publisher || "",
          fullBookPath: selectedBook.fullBookPath || "",
          seoMetaTitle: selectedBook.seoMetaTitle,
          seoMetaDesc: selectedBook.seoMetaDesc,
          seoCanonical: selectedBook.seoCanonical,
          isArchived: selectedBook.isArchived,
          isFeatured: selectedBook.isFeatured || false,
          version: (selectedBook.version || 1) + 1
        });
        triggerToast(`Book "${selectedBook.title}" updated successfully.`);
      }
    } catch (err) {
      console.warn("Firestore save failed, fallback locally:", err);
    }
    
    setIsBookModalOpen(false);
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteDoc(doc(db, "books", id));
      triggerToast("Book deleted.");
    } catch (err) {
      console.warn("Delete failed:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: Order["orderStatus"]) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        orderStatus: nextStatus,
        updatedAt: new Date().toISOString()
      });
      triggerToast(`Order status updated to ${nextStatus}`, "success");
    } catch (err) {
      console.warn("Order update failed:", err);
    }
  };

  // Review approval operations
  const handleApproveReview = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, "reviews", reviewId), { status: "Approved" });
      triggerToast("Review published to website!", "success");
      runConfetti();
    } catch (err) {
      console.warn("Review approval failed:", err);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      triggerToast("Review rejected and deleted.", "error");
    } catch (err) {
      console.warn("Review rejection failed:", err);
    }
  };

  // Clear single notification
  const handleClearNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.warn("Clear notification failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#F8F6F2] font-sans flex flex-col md:flex-row relative z-10 pt-20">
      
      {/* GLOBAL TOAST NOTIFICATIONS */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-md border flex items-center justify-between shadow-2xl bg-[#1A1A1A]/95 border-[#C9A227]/50 text-white`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="text-[#C9A227] shrink-0" size={18} />
                <span className="text-xs font-mono">{t.text}</span>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="ml-4 hover:text-[#C9A227] cursor-pointer">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* LEFT SIDEBAR PANEL */}
      <aside className="w-full md:w-64 bg-[#1A1A1A] border-r border-[#2D2D2D] flex flex-col p-6 shrink-0 md:min-h-screen font-mono">
        <div className="flex items-center gap-3 pb-6 border-b border-[#2D2D2D] mb-6">
          <div className="w-8 h-8 rounded bg-[#C9A227] flex items-center justify-center text-black font-bold font-serif">SV</div>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight tracking-wider text-white">BOOKOS</h1>
            <p className="font-mono text-[9px] text-[#C9A227] tracking-widest uppercase">Admin System</p>
          </div>
        </div>

        {/* Roles Quick Panel */}
        <div className="mb-6 p-3 bg-[#111111] rounded border border-[#2D2D2D] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-[#A5A5A5] uppercase">Active Role</span>
            <span className="font-sans text-xs font-bold text-[#F8F6F2]">{currentRole}</span>
          </div>
          <select 
            value={currentRole} 
            onChange={(e) => {
              const role = e.target.value as any;
              setCurrentRole(role);
              triggerToast(`Switched workspace perspective to ${role}`);
            }}
            className="bg-[#1A1A1A] border border-[#2D2D2D] text-xs text-[#C9A227] rounded p-1"
          >
            <option>Super Admin</option>
            <option>Editor</option>
            <option>Content Manager</option>
            <option>Customer Support</option>
          </select>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto max-h-[50vh] md:max-h-[60vh] pr-2">
          {sidebarMenu.map(menu => {
            const Icon = menu.icon;
            const isActive = activeTab === menu.title;
            return (
              <button
                key={menu.title}
                onClick={() => setActiveTab(menu.title)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-all duration-200 group cursor-pointer ${
                  isActive 
                    ? "bg-[#C9A227]/10 text-[#C9A227] border-l-2 border-[#C9A227]" 
                    : "text-[#A5A5A5] hover:text-[#F8F6F2] hover:bg-[#111111]"
                }`}
              >
                <Icon size={16} className={`group-hover:scale-110 transition-transform ${isActive ? "text-[#C9A227]" : "text-[#A5A5A5]"}`} />
                <span className="text-xs tracking-wide">{menu.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-[#111111] p-6 md:p-10 flex flex-col overflow-x-hidden min-h-screen">
        
        {/* TOP STATUS BAR */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#2D2D2D] mb-8 gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-white tracking-wide">{activeTab}</h2>
            <p className="text-xs text-[#A5A5A5] font-mono mt-1">Bookstore Management Systems / {activeTab}</p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto relative">
            {/* Realtime Alert bell drop down */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#C9A227] transition-colors shrink-0 cursor-pointer"
            >
              <Bell size={16} className="text-[#A5A5A5] hover:text-[#C9A227]" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 w-2 h-2 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notification drop drawer */}
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-72 bg-[#1A1A1A] border border-[#2D2D2D] shadow-2xl rounded p-4 max-h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center pb-2 border-b border-[#2D2D2D] mb-3">
                  <span className="font-mono text-xs text-white font-bold uppercase">System Alerts ({notifications.length})</span>
                  <button onClick={() => setShowNotifications(false)} className="text-[#A5A5A5] hover:text-white cursor-pointer"><X size={12} /></button>
                </div>
                
                <div className="space-y-2">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-2.5 bg-[#111111] border border-[#2D2D2D] rounded text-left relative group">
                      <h5 className="font-serif text-xs text-white font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                        {notif.title}
                      </h5>
                      <p className="text-[10px] font-mono text-[#A5A5A5] leading-relaxed mt-1">{notif.message}</p>
                      <button 
                        onClick={() => handleClearNotification(notif.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 cursor-pointer"
                        title="Dismiss alert"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-6 text-xs font-mono text-[#A5A5A5] uppercase italic">
                      No notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* RUNNING SKELETON LOADER */}
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="bg-[#1A1A1A] rounded-lg border border-[#2D2D2D] p-6 h-36 flex flex-col justify-between" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#1A1A1A] p-5 rounded border border-[#2D2D2D] h-24" />
              ))}
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded border border-[#2D2D2D] h-[300px]" />
          </div>
        ) : (
          <div className="flex-1">
            
            {/* TAB: DASHBOARD */}
            {activeTab === "Dashboard" && (
              <div className="space-y-8">
                
                {/* AI Librarian Greeting */}
                <div className="bg-gradient-to-r from-[#1A1A1A] to-[#161613] rounded-lg border border-[#C9A227]/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#C9A227]/10 flex items-center justify-center border border-[#C9A227]/30">
                      <Sparkles className="text-[#C9A227]" size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-white">Welcome to STORYVAULT Admin</h3>
                      <p className="text-xs text-[#A5A5A5] font-mono mt-1">Your dashboard is ready. Start by adding your first book.</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Monthly Revenue", value: `₹${(analyticsSummary.revenue || 0).toLocaleString()}`, desc: "No revenue available yet." },
                    { title: "Total Orders", value: `${analyticsSummary.ordersCount || 0} Orders`, desc: "No orders have been placed." },
                    { title: "Active Readers", value: `${customers.length} Readers`, desc: "Live client registrations." },
                    { title: "Unique Visitors", value: `${analyticsSummary.visitors || 0} Visitors`, desc: "Sessions logged." }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-[#1A1A1A] p-5 rounded border border-[#2D2D2D]">
                      <span className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider block">{stat.title}</span>
                      <h4 className="font-serif text-2xl font-bold text-white mt-1">{stat.value}</h4>
                      <span className="text-[10px] font-mono text-[#A5A5A5] block mt-2">{stat.value !== "0" && stat.value !== "₹0" ? "Synchronized Live" : stat.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Empty charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#1A1A1A] p-6 rounded border border-[#2D2D2D] h-[260px] flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm text-white">Revenue Growth Trend</h4>
                      <p className="font-mono text-[9px] text-[#A5A5A5]">Interactive Monthly Operations in USD</p>
                    </div>
                    <div className="flex-1 bg-[#111111]/50 rounded border border-dashed border-[#2D2D2D] flex flex-col items-center justify-center mt-3">
                      <Activity size={24} className="text-[#2D2D2D] mb-1" />
                      <span className="text-[10px] font-mono text-[#A5A5A5]">No data available.</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] p-6 rounded border border-[#2D2D2D] h-[260px] flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm text-white">Unique Visitors Distribution</h4>
                      <p className="font-mono text-[9px] text-[#A5A5A5]">Daily Active Session Splits</p>
                    </div>
                    <div className="flex-1 bg-[#111111]/50 rounded border border-dashed border-[#2D2D2D] flex flex-col items-center justify-center mt-3">
                      <TrendingUp size={24} className="text-[#2D2D2D] mb-1" />
                      <span className="text-[10px] font-mono text-[#A5A5A5]">No data available.</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === "Orders" && (
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="bg-[#1A1A1A] p-12 rounded border border-dashed border-[#2D2D2D] text-center">
                    <span className="font-mono text-xs text-[#A5A5A5] uppercase italic">No Orders Yet</span>
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] rounded border border-[#2D2D2D] overflow-hidden">
                    <div className="p-4 border-b border-[#2D2D2D] flex justify-between items-center text-xs font-mono text-[#A5A5A5]">
                      <span>Live Order Registries ({orders.length})</span>
                      <span className="text-gold font-bold">Realtime Enabled</span>
                    </div>
                    <table className="w-full text-left border-collapse font-sans text-xs">
                      <thead>
                        <tr className="border-b border-[#2D2D2D] text-[10px] font-mono text-[#A5A5A5] uppercase bg-[#111111]/40">
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Books</th>
                          <th className="p-4">Quantity</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Order Status</th>
                          <th className="p-4">Created Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b border-[#2D2D2D]/60 hover:bg-[#C9A227]/5">
                            <td className="p-4 font-mono font-bold text-white">{order.orderId}</td>
                            <td className="p-4">
                              <div>
                                <span className="font-semibold text-white block">{order.customerName}</span>
                                <span className="text-[10px] text-[#A5A5A5] font-mono block">{order.customerEmail}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                {order.items.map((item, index) => (
                                  <span key={index} className="text-white block truncate max-w-[150px]">{item.title}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 font-mono text-center">{order.items.reduce((acc, c) => acc + c.quantity, 0)}</td>
                            <td className="p-4 font-mono font-bold text-white">${order.total.toFixed(2)}</td>
                            <td className="p-4 font-mono text-[#A5A5A5]">{order.paymentMethod} ({order.paymentStatus})</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                order.orderStatus === "Delivered" ? "bg-green-950/80 border-green-500/30 text-green-400" :
                                order.orderStatus === "Cancelled" || order.orderStatus === "Refunded" ? "bg-red-950/80 border-red-500/30 text-red-400" :
                                "bg-[#251e06] border-[#C9A227]/30 text-[#C9A227]"
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-[#A5A5A5]">{order.createdAt}</td>
                            <td className="p-4 text-right">
                              <select
                                value={order.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                                className="bg-[#111111] border border-[#2D2D2D] text-xs font-mono text-[#C9A227] p-1 rounded"
                              >
                                <option>Pending</option>
                                <option>Confirmed</option>
                                <option>Packed</option>
                                <option>Shipped</option>
                                <option>Delivered</option>
                                <option>Cancelled</option>
                                <option>Refunded</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: REVIEWS QUEUE */}
            {activeTab === "Reviews" && (
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] p-6 rounded border border-[#2D2D2D]">
                  <h3 className="font-serif text-lg text-white mb-2">Sanctuary Reader Reviews Queue</h3>
                  <p className="text-xs text-[#A5A5A5] font-mono mb-6">Review, approve or delete pending reviews before publication on the client site.</p>
                  
                  {reviews.filter(r => r.status === "Pending").length === 0 ? (
                    <div className="bg-[#111111] p-10 text-center rounded border border-dashed border-[#2D2D2D]">
                      <span className="font-mono text-xs text-[#A5A5A5] uppercase italic">No Reviews Yet in Pending Queue</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.filter(r => r.status === "Pending").map(rev => {
                        const bookObj = books.find(b => b.id === rev.bookId);
                        return (
                          <div key={rev.id} className="p-4 bg-[#111111] border border-[#2D2D2D] rounded flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono text-[#C9A227] uppercase font-bold">Pending Approval</span>
                              <h4 className="font-serif text-sm text-white font-bold mt-1">Review on: {bookObj ? bookObj.title : rev.bookId}</h4>
                              <p className="text-xs text-[#A5A5A5] font-sans mt-2">"{rev.comment}"</p>
                              <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-[#A5A5A5]">
                                <span>By: {rev.username}</span>
                                <span>•</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < rev.rating ? "#C9A227" : "none"} className="text-gold" />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApproveReview(rev.id)}
                                className="bg-[#C9A227] text-black font-mono font-bold text-[10px] px-3 py-1.5 rounded cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectReview(rev.id)}
                                className="bg-red-950 text-red-200 border border-red-500/30 font-mono text-[10px] px-3 py-1.5 rounded cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CUSTOMERS */}
            {activeTab === "Customers" && (
              <div className="space-y-6">
                {customers.length === 0 ? (
                  <div className="bg-[#1A1A1A] p-12 rounded border border-dashed border-[#2D2D2D] text-center">
                    <span className="font-mono text-xs text-[#A5A5A5] uppercase italic">No Customers Yet</span>
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] rounded border border-[#2D2D2D] overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="border-b border-[#2D2D2D] text-[10px] font-mono text-[#A5A5A5] uppercase bg-[#111111]/40">
                          <th className="p-4">Customer UID</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Wishlist Items</th>
                          <th className="p-4">Bookmarks Count</th>
                          <th className="p-4">Cart Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(cust => (
                          <tr key={cust.id} className="border-b border-[#2D2D2D]/60 hover:bg-[#C9A227]/5">
                            <td className="p-4 font-mono font-bold text-white">{cust.id}</td>
                            <td className="p-4 font-mono text-[#A5A5A5]">{cust.email || "guest@storyvault.com"}</td>
                            <td className="p-4 font-mono">{cust.wishlist?.length || 0} Saved</td>
                            <td className="p-4 font-mono">{cust.bookmarks ? Object.keys(cust.bookmarks).length : 0} Bookmarks</td>
                            <td className="p-4 font-mono">{cust.cart?.length || 0} items</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: INVENTORY */}
            {activeTab === "Inventory" && (
              <div className="space-y-6">
                {books.length === 0 ? (
                  <div className="bg-[#1A1A1A] p-12 rounded border border-dashed border-[#2D2D2D] text-center">
                    <span className="font-mono text-xs text-[#A5A5A5] uppercase italic">No Inventory Data</span>
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] rounded border border-[#2D2D2D] overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#2D2D2D] text-[10px] font-mono text-[#A5A5A5] uppercase bg-[#111111]/40">
                          <th className="p-4">Book Title</th>
                          <th className="p-4">ISBN</th>
                          <th className="p-4">Stock Level</th>
                          <th className="p-4">Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map(b => (
                          <tr key={b.id} className="border-b border-[#2D2D2D]/60">
                            <td className="p-4 font-semibold text-white">{b.title}</td>
                            <td className="p-4 font-mono text-[#A5A5A5]">{b.isbn || "N/A"}</td>
                            <td className="p-4 font-mono">
                              {b.stock <= 10 ? (
                                <span className="text-[#F4B400] font-bold">{b.stock} units left (Low Stock)</span>
                              ) : b.stock === 0 ? (
                                <span className="text-red-500 font-bold">Out of Stock</span>
                              ) : (
                                <span>{b.stock} units</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                b.stock > 0 ? "bg-green-950/80 border border-green-500/30 text-green-400" : "bg-red-950/80 border border-red-500/30 text-red-400"
                              }`}>
                                {b.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: BOOKS */}
            {activeTab === "Books" && (
              <div className="space-y-6">
                
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#1A1A1A] p-5 rounded border border-[#2D2D2D]">
                  <div>
                    <h3 className="font-serif text-lg text-white">Books Management</h3>
                    <p className="text-[10px] font-mono text-[#A5A5A5] mt-1">
                      Manage all digital and physical assets, inventory stock levels, and metadata.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleOpenCreateModal}
                      className="bg-[#C9A227] hover:bg-[#B89220] text-black font-mono font-bold text-xs py-2 px-4 rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} /> Add Book
                    </button>
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="bg-[#111111] border border-[#2D2D2D] hover:border-[#C9A227]/30 text-white font-mono text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} /> Import Books
                    </button>
                    <button
                      onClick={handleExportLibrary}
                      className="bg-[#111111] border border-[#2D2D2D] hover:border-[#C9A227]/30 text-white font-mono text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={12} /> Export Library
                    </button>
                    <button
                      onClick={() => triggerToast("Database list refreshed.", "success")}
                      className="bg-[#111111] border border-[#2D2D2D] hover:border-[#C9A227]/30 text-white font-mono text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Activity size={12} /> Refresh
                    </button>
                  </div>
                </div>

                {/* Filters & Sorting Panel */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-[#1A1A1A] p-4 rounded border border-[#2D2D2D]">
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-[#A5A5A5] uppercase">Search Catalog</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 text-[#A5A5A5]" size={13} />
                      <input
                        type="text"
                        placeholder="Search title/author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111111] border border-[#2D2D2D] py-1.5 pl-8 pr-3 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-[#A5A5A5] uppercase">Genre / Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-[#111111] border border-[#2D2D2D] py-1.5 px-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      {Array.from(new Set(books.map(b => b.genre).filter(Boolean))).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-[#A5A5A5] uppercase">Language</label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="bg-[#111111] border border-[#2D2D2D] py-1.5 px-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                    >
                      <option value="All">All Languages</option>
                      {Array.from(new Set(books.map(b => b.language).filter(Boolean))).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-[#A5A5A5] uppercase">Format & Feature</label>
                    <select
                      value={formatFilter}
                      onChange={(e) => setFormatFilter(e.target.value)}
                      className="bg-[#111111] border border-[#2D2D2D] py-1.5 px-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                    >
                      <option value="All">All Formats</option>
                      <option value="Physical">Physical (Hardcover)</option>
                      <option value="Digital">Digital (eBook)</option>
                      <option value="Both">Both Formats</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-[#A5A5A5] uppercase">Sorting</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="bg-[#111111] border border-[#2D2D2D] py-1.5 px-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                    >
                      <option value="Newest">Newest First</option>
                      <option value="Oldest">Oldest First</option>
                      <option value="A-Z">Title A-Z</option>
                      <option value="Z-A">Title Z-A</option>
                    </select>
                  </div>
                </div>

                {/* Books dynamic table list */}
                {filteredBooks.length === 0 ? (
                  <div className="bg-[#1A1A1A] p-12 rounded border border-dashed border-[#2D2D2D] text-center space-y-4">
                    <BookOpen size={40} className="text-[#A5A5A5]/40 mx-auto" />
                    <h3 className="font-serif text-base text-white">No books found.</h3>
                    <p className="text-xs text-[#A5A5A5] max-w-sm mx-auto">
                      Add your first book to begin building the library.
                    </p>
                    <button
                      onClick={handleOpenCreateModal}
                      className="bg-[#C9A227] hover:bg-[#B89220] text-black font-mono font-bold text-xs py-2 px-6 rounded cursor-pointer"
                    >
                      Add Book
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] rounded border border-[#2D2D2D] overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-[#2D2D2D] text-[10px] font-mono text-[#A5A5A5] uppercase bg-[#111111]/40">
                          <th className="p-4 w-12">Cover</th>
                          <th className="p-4">Title</th>
                          <th className="p-4">Author</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Language</th>
                          <th className="p-4">Format</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Digital Status</th>
                          <th className="p-4">Featured</th>
                          <th className="p-4">Published</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBooks.map((b) => {
                          const hasPhysical = (b.price || 0) > 0;
                          const hasDigital = (b.digitalPrice || 0) > 0;
                          const bookFormat = hasPhysical && hasDigital ? "Both" : hasPhysical ? "Physical" : hasDigital ? "Digital" : "N/A";
                          const isFeatured = b.isFeatured || false;

                          return (
                            <tr key={b.id} className="border-b border-[#2D2D2D]/60 hover:bg-[#111111]/30 transition-colors">
                              <td className="p-4">
                                <img
                                  src={b.coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400"}
                                  alt={b.title}
                                  className="w-8 h-10 object-cover rounded border border-[#2D2D2D]"
                                />
                              </td>
                              <td className="p-4 font-semibold text-white max-w-[200px] truncate">{b.title}</td>
                              <td className="p-4 text-[#A5A5A5] max-w-[150px] truncate">{b.author}</td>
                              <td className="p-4 font-mono text-[#A5A5A5]">{b.genre}</td>
                              <td className="p-4 text-[#A5A5A5]">{b.language}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                  bookFormat === "Both" ? "bg-amber-950/80 border border-amber-500/30 text-amber-400" :
                                  bookFormat === "Physical" ? "bg-blue-950/80 border border-blue-500/30 text-blue-400" : "bg-purple-950/80 border border-purple-500/30 text-purple-400"
                                }`}>
                                  {bookFormat.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-white">
                                {hasPhysical && `P: ₹${b.price} `}
                                {hasDigital && `D: ₹${b.digitalPrice}`}
                                {!hasPhysical && !hasDigital && "Free"}
                              </td>
                              <td className="p-4 font-mono">
                                {b.stock <= 10 ? (
                                  <span className="text-[#F4B400] font-bold">{b.stock} units (Low)</span>
                                ) : (
                                  <span className="text-[#A5A5A5]">{b.stock} units</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                  b.isAvailable ? "bg-green-950/80 border border-green-500/30 text-green-400" : "bg-red-950/80 border border-red-500/30 text-red-400"
                                }`}>
                                  {b.isAvailable ? "ACTIVE" : "INACTIVE"}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleFeatured(b)}
                                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                                    isFeatured 
                                      ? "bg-amber-950/80 border-amber-500/30 text-amber-400 hover:bg-amber-900" 
                                      : "bg-[#111111] border-[#2D2D2D] text-[#A5A5A5] hover:border-[#A5A5A5]"
                                  }`}
                                >
                                  {isFeatured ? "FEATURED" : "STANDARD"}
                                </button>
                              </td>
                              <td className="p-4 font-mono text-[#A5A5A5]">{b.year}</td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditModal(b)}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-[#111111] rounded cursor-pointer"
                                    title="Edit Book Profile"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateBook(b)}
                                    className="p-1.5 text-green-400 hover:text-green-300 hover:bg-[#111111] rounded cursor-pointer"
                                    title="Duplicate Book"
                                  >
                                    <Copy size={13} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmBook(b)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-[#111111] rounded cursor-pointer"
                                    title="Delete Book"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

                        {/* General Fallback for other tabs */}
            {!["Dashboard", "Orders", "Reviews", "Customers", "Inventory", "Books"].includes(activeTab) && (
              <div className="bg-[#1A1A1A] p-10 rounded border border-[#2D2D2D] text-center space-y-4">
                <Sparkles size={40} className="text-[#C9A227] mx-auto opacity-40 animate-pulse" />
                <h3 className="font-serif text-xl text-white">{activeTab} Live Portal</h3>
                <p className="text-xs font-mono text-[#A5A5A5] max-w-lg mx-auto">
                  Connected to shared Firebase cluster. Real-time updates active.
                </p>
                {activeTab === "Analytics" && (
                  <div className="p-6 bg-[#111111] rounded border border-dashed border-[#2D2D2D] max-w-sm mx-auto text-xs font-mono text-[#A5A5A5]">
                    No analytics available.
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* DETAILED BOOK CMS FORM MODAL */}
      {isBookModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#1A1A1A] border border-[#C9A227]/50 rounded-lg max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#2D2D2D] mb-4 shrink-0">
              <h3 className="font-serif text-lg text-white">
                {modalMode === "create" ? "Add New Literature Piece" : "Edit Digital Book Profile"}
              </h3>
              <button onClick={() => setIsBookModalOpen(false)} className="text-[#A5A5A5] hover:text-[#C9A227] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="flex-1 overflow-y-auto pr-2 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={selectedBook.title}
                    onChange={(e) => setSelectedBook({ ...selectedBook, title: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Author / Creator *</label>
                  <input
                    type="text"
                    required
                    value={selectedBook.author}
                    onChange={(e) => setSelectedBook({ ...selectedBook, author: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Description / Blurb</label>
                <textarea
                  value={selectedBook.description}
                  onChange={(e) => setSelectedBook({ ...selectedBook, description: e.target.value })}
                  className="bg-[#111111] border border-[#2D2D2D] p-2 h-20 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#2D2D2D] pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">ISBN</label>
                  <input
                    type="text"
                    value={selectedBook.isbn || ""}
                    onChange={(e) => setSelectedBook({ ...selectedBook, isbn: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Category / Genre</label>
                  <select
                    value={selectedBook.genre || "Gothic"}
                    onChange={(e) => setSelectedBook({ ...selectedBook, genre: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                  >
                    {["Gothic", "Adventure", "Philosophy", "Strategy", "Fairy Tales", "Poetry", "Drama", "Sci-Fi", "Satire", "Mystery", "Tragedy", "Historical"].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Language</label>
                  <select
                    value={selectedBook.language || "English"}
                    onChange={(e) => setSelectedBook({ ...selectedBook, language: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                  >
                    {["English", "French", "German", "Spanish", "Italian", "Greek", "Latin", "Russian"].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Publisher</label>
                  <input
                    type="text"
                    value={selectedBook.publisher || ""}
                    onChange={(e) => setSelectedBook({ ...selectedBook, publisher: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Publication Year</label>
                  <input
                    type="number"
                    value={selectedBook.year || 2026}
                    onChange={(e) => setSelectedBook({ ...selectedBook, year: parseInt(e.target.value) })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-[#2D2D2D] pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Physical Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedBook.price || 0}
                    onChange={(e) => setSelectedBook({ ...selectedBook, price: parseFloat(e.target.value) })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Digital Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedBook.digitalPrice || 0}
                    onChange={(e) => setSelectedBook({ ...selectedBook, digitalPrice: parseFloat(e.target.value) })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Stock Level</label>
                  <input
                    type="number"
                    value={selectedBook.stock || 0}
                    onChange={(e) => setSelectedBook({ ...selectedBook, stock: parseInt(e.target.value) })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Preview Pages</label>
                  <input
                    type="number"
                    value={selectedBook.previewDuration || 0}
                    onChange={(e) => setSelectedBook({ ...selectedBook, previewDuration: parseInt(e.target.value) })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">Cover Image URL</label>
                  <input
                    type="text"
                    value={selectedBook.coverUrl || ""}
                    onChange={(e) => setSelectedBook({ ...selectedBook, coverUrl: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-[#A5A5A5] uppercase">eBook Path (PDF/EPUB)</label>
                  <input
                    type="text"
                    placeholder="e.g. ebooks/dracula.pdf"
                    value={selectedBook.fullBookPath || ""}
                    onChange={(e) => setSelectedBook({ ...selectedBook, fullBookPath: e.target.value })}
                    className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs font-mono text-white rounded focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={selectedBook.isFeatured || false}
                  onChange={(e) => setSelectedBook({ ...selectedBook, isFeatured: e.target.checked })}
                  className="bg-[#111111] border border-[#2D2D2D] rounded focus:ring-0 text-[#C9A227] cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-xs text-white cursor-pointer font-sans select-none">
                  Highlight as Featured Literature
                </label>
              </div>

            </form>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2D2D2D] mt-4 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsBookModalOpen(false)}
                className="bg-[#1A1A1A] border border-[#2D2D2D] text-white font-mono text-xs py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBook}
                className="bg-[#C9A227] hover:bg-[#B89220] text-black font-mono font-bold text-xs py-2 px-6 rounded cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DELETE BOOK CONFIRMATION MODAL */}
      {deleteConfirmBook && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-red-500/40 rounded-lg max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg text-white">Delete Book?</h3>
            <p className="text-xs text-[#A5A5A5] leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirmBook.title}"</span>? This action cannot be undone and will remove the item from all catalog listings.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBook(null)}
                className="bg-[#111111] border border-[#2D2D2D] hover:border-[#A5A5A5] text-white font-mono text-xs py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteBook(deleteConfirmBook.id);
                  setDeleteConfirmBook(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs py-2 px-6 rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT FROM DATABASE MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-[#C9A227]/50 rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#2D2D2D]">
              <h3 className="font-serif text-lg text-white">Import Classic Literature</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-[#A5A5A5] hover:text-[#C9A227] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-[#A5A5A5]">
                Search public domain literature archives (OpenLibrary and Gutenberg Project) to import records directly to StoryVault.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter title or author (e.g. Dracula)..."
                  value={importQuery}
                  onChange={(e) => setImportQuery(e.target.value)}
                  className="flex-1 bg-[#111111] border border-[#2D2D2D] p-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                />
                <select
                  value={importSource}
                  onChange={(e) => setImportSource(e.target.value as any)}
                  className="bg-[#111111] border border-[#2D2D2D] p-2 text-xs text-white rounded focus:border-[#C9A227] focus:outline-none"
                >
                  <option value="OpenLibrary">OpenLibrary</option>
                  <option value="Gutenberg">Gutenberg</option>
                </select>
                <button
                  onClick={handleSearchImport}
                  className="bg-[#C9A227] text-black font-mono font-bold text-xs px-4 py-2 rounded hover:bg-[#B89220] cursor-pointer"
                >
                  Search
                </button>
              </div>

              {importLoading && (
                <div className="text-center py-4 text-xs font-mono text-[#C9A227] animate-pulse">
                  Querying remote archive index...
                </div>
              )}

              <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
                {importResults.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#111111] rounded border border-[#2D2D2D] hover:border-[#C9A227]/40">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[10px] text-[#A5A5A5] font-mono mt-0.5">{item.author} • {item.year}</p>
                    </div>
                    <button
                      onClick={() => handleExecuteImport(item)}
                      className="bg-[#1A1A1A] border border-[#2D2D2D] hover:border-green-500/50 hover:text-green-400 font-mono text-[10px] py-1 px-3 rounded cursor-pointer"
                    >
                      Import
                    </button>
                  </div>
                ))}
                {!importLoading && importQuery && importResults.length === 0 && (
                  <p className="text-center text-[10px] font-mono text-[#A5A5A5] italic py-4">No results found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}