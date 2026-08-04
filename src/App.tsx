import React, { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedBooks from "./components/FeaturedBooks";
import QuotesSection from "./components/QuotesSection";
import AuthorGallery from "./components/AuthorGallery";
import ReadingJourney from "./components/ReadingJourney";
import Footer from "./components/Footer";
import { useFavorites, useBookmarks, useReadingHistory } from "./hooks/useLocalStorage";
import { useBookstore } from "./context/useBookstore";
import { Book } from "./types";

// Lazy-loaded pages and heavy overlays
const LibraryPage = lazy(() => import("./components/LibraryPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const Book3DViewer = lazy(() => import("./components/Book3DViewer"));
const CheckoutFlow = lazy(() => import("./components/CheckoutFlow"));
const WishlistDrawer = lazy(() => import("./components/WishlistDrawer"));
const ReceiptView = lazy(() => import("./components/ReceiptView"));
const ReceiptVerification = lazy(() => import("./components/ReceiptVerification"));
const DigitalVault = lazy(() => import("./components/DigitalVault"));
const PurchasedReader = lazy(() => import("./components/PurchasedReader"));
const BookDetails = lazy(() => import("./components/BookDetails"));
const SearchPanel = lazy(() => import("./components/SearchPanel"));
const AdminPortal = lazy(() => import("./components/AdminPortal"));

// Framer Motion page transition parameters (300ms fade-out, 400ms fade-in)
const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

// Component to scroll to top automatically on route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);


  // E-commerce states
  const [selectedDetailsBook, setSelectedDetailsBook] = useState<Book | null>(null);
  const [checkoutInitialStep, setCheckoutInitialStep] = useState<"cart" | "shipping">("cart");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Local storage hooks (now synced to Firestore)
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { addBookmark, removeBookmark, getBookmark } = useBookmarks();
  const { history, updateReadingProgress, clearHistory } = useReadingHistory();

  // Load live books, cart, and wishlist from BookstoreProvider
  const { books, cart, wishlist, toasts, removeToast, fetchUserLibrary, currentUser } = useBookstore();

  const [unlockedBookIds, setUnlockedBookIds] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadUnlocked() {
      try {
        const lib = await fetchUserLibrary();
        setUnlockedBookIds(lib.map((item: any) => item.bookId));
      } catch (e) {
        console.warn("Failed to load user digital library:", e);
      }
    }
    loadUnlocked();
  }, [currentUser, fetchUserLibrary, activeBook]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorHovered, setCursorHovered] = useState(false);
  const [flyingBook, setFlyingBook] = useState<{ cover: string; x: number; y: number } | null>(null);

  // Custom Cursor mouse listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer")
      ) {
        setCursorHovered(true);
      } else {
        setCursorHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    document.body.classList.add("custom-cursor-enabled");

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.classList.remove("custom-cursor-enabled");
    };
  }, []);

  const triggerFlyToCart = (e: React.MouseEvent, cover: string) => {
    setFlyingBook({
      cover,
      x: e.clientX,
      y: e.clientY
    });

    setTimeout(() => {
      setFlyingBook(null);
    }, 850);
  };

  const handleOpenBookReader = (book: Book) => {
    setActiveBook(book);
    setSelectedDetailsBook(null);
  };

  const handleBuyNowAndCheckout = () => {
    setSelectedDetailsBook(null);
    setCheckoutInitialStep("shipping"); // Bypasses cart directly to shipping details
    setIsCartOpen(true);
  };

  const cartItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="relative bg-background text-primaryText min-h-screen selection:bg-gold selection:text-background overflow-hidden">
      <ScrollToTop />

      {/* Premium Toast Notifications Overlay */}
      <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts && toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full bg-[#121212] border border-gold/45 rounded-xl p-5 shadow-2xl flex flex-col gap-3 text-left relative overflow-hidden"
              style={{
                boxShadow: "0 10px 30px rgba(201, 162, 39, 0.1), 0 1px 3px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Left Accent Gold Line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
              
              <div className="pl-2">
                <h4 className="font-serif text-sm font-bold text-gold flex items-center gap-2">
                  {toast.title}
                </h4>
                <p className="font-sans text-xs text-secondaryText/90 mt-1.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              {toast.buttons && toast.buttons.length > 0 && (
                <div className="flex items-center gap-2 mt-2 pl-2">
                  {toast.buttons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        btn.onClick();
                        removeToast(toast.id);
                      }}
                      className="py-1.5 px-3 border border-gold/40 hover:border-gold hover:bg-gold/15 text-gold font-mono text-[9px] uppercase font-bold tracking-wider rounded cursor-pointer transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Custom Cursor follower */}
      <div 
        className="hidden md:block fixed pointer-events-none z-50 rounded-full transition-all duration-150 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          width: cursorHovered ? "48px" : "24px",
          height: cursorHovered ? "48px" : "24px",
          border: "1px solid #C9A227",
          backgroundColor: cursorHovered ? "rgba(201, 162, 39, 0.08)" : "transparent",
          boxShadow: cursorHovered ? "0 0 15px rgba(201, 162, 39, 0.3)" : "none",
        }}
      />
      <div 
        className="hidden md:block fixed w-1.5 h-1.5 bg-gold rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
        }}
      />

      {/* FLY TO CART COVER ELEMENT */}
      <AnimatePresence>
        {flyingBook && (
          <motion.div
            initial={{ left: flyingBook.x - 20, top: flyingBook.y - 30, scale: 1, rotate: 0, opacity: 1 }}
            animate={{
              left: window.innerWidth - 120, 
              top: 30,
              scale: 0.15,
              rotate: 360,
              opacity: 0.2
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed z-50 pointer-events-none w-12 h-16 rounded shadow-2xl bg-cover border border-gold bg-no-repeat bg-center"
            style={{ backgroundImage: `url(${flyingBook.cover})` }}
          />
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <Navbar 
        onSearchClick={() => setIsSearchOpen(true)}
        onWishlistClick={() => {
          setIsWishlistOpen(true);
        }}
        onCartClick={() => {
          setCheckoutInitialStep("cart");
          setIsCartOpen(true);
        }}
        onHistoryClick={() => {
          navigate("/");
          setTimeout(() => {
            const el = document.getElementById("timeline");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }}
        cartCount={cartItemsCount}
        wishlistCount={wishlist.length}
      />

      {/* Animated Route transitions */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* HOMEPAGE VIEW */}
          <Route 
            path="/" 
            element={
              <motion.div
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="pt-20"
              >
                {/* Hero Banner */}
                <Hero />

                {/* 4 Iconic Featured Books */}
                <FeaturedBooks 
                  books={books}
                  onBookSelect={setSelectedDetailsBook}
                  onReadPreview={handleOpenBookReader}
                />

                {/* Fading Quotes Slider */}
                <QuotesSection />



                {/* Personal logs and history stats */}
                <ReadingJourney 
                  history={history}
                  favorites={favorites}
                  localBooks={books}
                  onBookSelect={setSelectedDetailsBook}
                  toggleFavorite={toggleFavorite}
                  clearHistory={clearHistory}
                  onViewReceipt={setSelectedReceipt}
                />
                
                {/* Footer */}
                <Footer />
              </motion.div>
            } 
          />

          {/* DEDICATED AUTHORS GALLERY VIEW */}
          <Route 
            path="/authors" 
            element={
              <motion.div
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="pt-20"
              >
                <AuthorGallery 
                  localBooks={books}
                  onBookSelect={setSelectedDetailsBook}
                />
                
                {/* Footer */}
                <Footer />
              </motion.div>
            }
          />

          {/* DEDICATED ABOUT STORYVAULT VIEW */}
          <Route 
            path="/about" 
            element={
              <motion.div
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AboutPage />
                <Footer />
              </motion.div>
            }
          />

          {/* DEDICATED LIBRARY VIEW */}
          <Route 
            path="/library" 
            element={
              <motion.div
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="pt-20"
              >
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center font-mono text-gold text-xs uppercase tracking-widest animate-pulse bg-background">
                    Loading Library Index...
                  </div>
                }>
                  <LibraryPage 
                    books={books}
                    onBookSelect={setSelectedDetailsBook}
                  />
                </Suspense>

                {/* Footer */}
                <Footer />
              </motion.div>
            }
          />

          {/* BOOKOS ADMIN CMS PORTAL VIEW */}
          <Route 
            path="/admin" 
            element={
              <motion.div
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center font-mono text-gold text-xs uppercase tracking-widest animate-pulse bg-[#111111]">
                    Booting BookOS Admin Portal...
                  </div>
                }>
                  <AdminPortal />
                </Suspense>
              </motion.div>
            }
          />
          {/* QR RECEIPT VERIFICATION VIEW */}
          <Route 
            path="/receipt/:receiptNumber" 
            element={
              <motion.div
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center font-mono text-gold text-xs uppercase tracking-widest animate-pulse bg-background">
                    Verifying Purchase Authenticity...
                  </div>
                }>
                  <ReceiptVerification />
                </Suspense>
              </motion.div>
            }
          />

          {/* DIGITAL VAULT ROUTE */}
          <Route 
            path="/digital-vault" 
            element={
              <motion.div
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center font-mono text-gold text-xs uppercase tracking-widest animate-pulse bg-background">
                    Decrypting Codex Sanctum...
                  </div>
                }>
                  <DigitalVault onReadPreview={handleOpenBookReader} />
                </Suspense>
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>

      {/* Overlay Dialogs (Lazy Loaded & Mounted on demand) */}
      <Suspense fallback={null}>
        {isSearchOpen && (
          <SearchPanel 
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            localBooks={books}
            onBookSelect={setSelectedDetailsBook}
          />
        )}
        {selectedDetailsBook && (
          <BookDetails
            book={selectedDetailsBook}
            isOpen={!!selectedDetailsBook}
            onClose={() => setSelectedDetailsBook(null)}
            onReadPreview={() => handleOpenBookReader(selectedDetailsBook)}
            onBuyNowClick={handleBuyNowAndCheckout}
            triggerFlyAnimation={(e) => triggerFlyToCart(e, selectedDetailsBook.coverUrl)}
          />
        )}
        {isCartOpen && (
          <CheckoutFlow
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            initialStep={checkoutInitialStep}
          />
        )}
        {isWishlistOpen && (
          <WishlistDrawer
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
            onReadPreview={handleOpenBookReader}
            onBuyNowClick={handleBuyNowAndCheckout}
          />
        )}
        {selectedReceipt && (
          <ReceiptView
            receipt={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
        {activeBook && (
          unlockedBookIds.includes(activeBook.id) ? (
            <PurchasedReader 
              book={activeBook}
              onClose={() => setActiveBook(null)}
            />
          ) : (
            <Book3DViewer 
              book={activeBook}
              onClose={() => setActiveBook(null)}
              onBookmarkAdd={addBookmark}
              onBookmarkRemove={removeBookmark}
              isBookmarked={isFavorite(activeBook.id)}
              savedBookmark={getBookmark(activeBook.id)}
              onProgressUpdate={updateReadingProgress}
            />
          )
        )}
      </Suspense>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
