import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShoppingBag, Heart, BookOpen, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Book } from "../types";
import { useBookstore } from "../context/useBookstore";
import { getBookPricing } from "../services/booksDb";
import { collection, onSnapshot, addDoc, query, where } from "firebase/firestore";
import { db } from "../services/firebase";

interface BookDetailsProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onReadPreview: () => void;
  onBuyNowClick: () => void;
  triggerFlyAnimation: (e: React.MouseEvent) => void;
}

interface Review {
  id?: string;
  bookId: string;
  username: string;
  rating: number;
  comment: string;
  status: "Pending" | "Approved";
  createdAt: string;
}

export default function BookDetails({
  book,
  isOpen,
  onClose,
  onReadPreview,
  onBuyNowClick,
  triggerFlyAnimation
}: BookDetailsProps) {
  const { books, addToCart, toggleWishlist, isInWishlist, addToast } = useBookstore();
  const pricing = getBookPricing(book.id);
  const [purchaseFormat, setPurchaseFormat] = useState<"physical" | "ebook">("physical");

  // Dynamic reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState("");

  // Listen to approved reviews for this book in real-time
  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, "reviews"),
      where("bookId", "==", book.id),
      where("status", "==", "Approved")
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: Review[] = [];
      snap.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
      // Sort newest first
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(fetched);
    }, (err) => {
      console.warn("Reviews live sync failed:", err);
    });

    return () => unsub();
  }, [isOpen, book.id]);

  // Determine complementary books (Frequently Bought Together)
  // Fetch up to 2 books from the same genre, excluding current book from the live database
  const complementaryBooks = books.filter(
    b => b.genre === book.genre && b.id !== book.id
  ).slice(0, 2);

  const isFavorited = isInWishlist(book.id);

  // Math for bundle pricing (15% package discount)
  const bundleTotalPrice = (
    pricing.physicalPrice +
    complementaryBooks.reduce((acc, curr) => acc + getBookPricing(curr.id).physicalPrice, 0)
  );
  const bundleDiscountedPrice = (bundleTotalPrice * 0.85).toFixed(2);

  // Estimated Delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDelivery = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    triggerFlyAnimation(e);
    const price = purchaseFormat === "physical" ? pricing.physicalPrice : pricing.ebookPrice;
    addToCart(book, purchaseFormat, price);
  };

  const handleAddBundleToCart = () => {
    // Apply 15% discount directly on all books in the bundle
    const discMainPrice = parseFloat((pricing.physicalPrice * 0.85).toFixed(2));
    addToCart(book, "physical", discMainPrice);
    
    complementaryBooks.forEach(b => {
      const discCompPrice = parseFloat((getBookPricing(b.id).physicalPrice * 0.85).toFixed(2));
      addToCart(b, "physical", discCompPrice);
    });

    addToast({
      title: "📚 Preservation Bundle Added",
      message: "3 books have been added to your cart. 15% bundle discount applied successfully.",
      duration: 6000,
      buttons: [
        {
          label: "View Cart",
          onClick: () => {
            onBuyNowClick(); // Skip details and open Cart/Checkout
          }
        },
        {
          label: "Continue Shopping",
          onClick: () => {
            onClose(); // Close Details Drawer
          }
        }
      ]
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    setIsSubmittingReview(true);
    setSubmitSuccessMsg("");

    const newReview: Review = {
      bookId: book.id,
      username: reviewName,
      comment: reviewComment,
      rating: reviewRating,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save review to firestore reviews collection
      await addDoc(collection(db, "reviews"), newReview);
      
      // 2. Dispatch notification to Admin
      await addDoc(collection(db, "notifications"), {
        type: "review",
        title: "New Review Pending Approval",
        message: `${reviewName} submitted a ${reviewRating}-star review for ${book.title}.`,
        read: false,
        createdAt: new Date().toISOString()
      });

      setSubmitSuccessMsg("Review submitted for approval. It will appear once approved by admins.");
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      console.warn("Failed to save review in Firestore:", err);
      setSubmitSuccessMsg("Review submitted (offline fallback simulation).");
      setReviewName("");
      setReviewComment("");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-[#0c0c0c]/90 backdrop-blur-md flex justify-end overflow-hidden"
        >
          {/* Close Backdrop click */}
          <div className="absolute inset-0 z-0" onClick={onClose} />

          {/* Details Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="relative z-10 w-full max-w-2xl bg-surface border-l border-customBorder h-full flex flex-col overflow-y-auto shadow-2xl p-6 md:p-10 select-text"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-secondaryText hover:text-gold p-2 hover:bg-[#252525] rounded-full cursor-pointer transition-colors duration-300"
            >
              <X size={20} />
            </button>

            {/* Book Spine Details header */}
            <div className="flex flex-col md:flex-row gap-8 items-start mt-8">
              <img loading="lazy" src={book.coverUrl} className="w-40 h-56 object-cover rounded-lg shadow-2xl border border-customBorder" alt={book.title} />
              
              <div className="flex-1 text-left">
                <span className="font-mono text-xs text-gold uppercase tracking-widest block font-medium">
                  {book.genre}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2 leading-tight">
                  {book.title}
                </h2>
                <p className="font-serif italic text-secondaryText mt-1">
                  by {book.author}
                </p>
                <div className="flex items-center space-x-4 mt-3 font-mono text-[10px] text-secondaryText/80">
                  <span>Published: {book.year < 0 ? `${Math.abs(book.year)} BC` : book.year}</span>
                  <span>|</span>
                  <span>Language: {book.language}</span>
                </div>
                <p className="text-secondaryText text-sm leading-relaxed mt-4 font-sans max-h-32 overflow-y-auto pr-2">
                  {book.description}
                </p>
              </div>
            </div>

            {/* Formats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8 text-left">
              <button
                onClick={() => setPurchaseFormat("physical")}
                className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                  purchaseFormat === "physical"
                    ? "border-gold bg-[#201d16]/30"
                    : "border-customBorder bg-transparent hover:border-gold/30"
                }`}
              >
                <span className="font-mono text-[9px] text-[#A5A5A5] uppercase block">Collector Printed Copy</span>
                <span className="font-serif text-base text-primaryText font-bold block mt-1">Leather Hardcover</span>
                <span className="font-serif text-lg font-bold text-primaryText mt-2 block">
                  ${pricing.physicalPrice}
                </span>
                <span className="text-[10px] text-[#A5A5A5] mt-1 block">Ships from London archive</span>
              </button>

              <button
                onClick={() => setPurchaseFormat("ebook")}
                className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                  purchaseFormat === "ebook"
                    ? "border-gold bg-[#201d16]/30"
                    : "border-customBorder bg-transparent hover:border-gold/30"
                }`}
              >
                <span className="font-mono text-[9px] text-[#A5A5A5] uppercase block">Instant Digital Access</span>
                <span className="font-serif text-base text-primaryText font-bold block mt-1">Digital eBook</span>
                <span className="font-serif text-lg font-bold text-primaryText mt-2 block">
                  ${pricing.ebookPrice}
                </span>
                <span className="text-[10px] text-gold mt-1 block">Instant download</span>
              </button>
            </div>

            {/* Checkout actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-gold hover:bg-gold-hover text-background font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-gold-glow"
              >
                <ShoppingBag size={14} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  addToCart(book, purchaseFormat, purchaseFormat === "physical" ? pricing.physicalPrice : pricing.ebookPrice);
                  onBuyNowClick();
                }}
                className="flex-1 py-4 border border-gold hover:bg-gold/10 text-gold font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-customBorder/50">
              <button
                onClick={() => toggleWishlist(book.id)}
                className="py-2.5 px-4 border border-customBorder hover:border-gold/35 rounded-lg flex items-center justify-center space-x-2 text-xs font-mono text-secondaryText hover:text-gold cursor-pointer transition-colors"
              >
                <Heart size={12} fill={isFavorited ? "#C9A227" : "none"} className={isFavorited ? "text-gold" : ""} />
                <span>{isFavorited ? "Saved" : "Wishlist"}</span>
              </button>

              <button
                onClick={onReadPreview}
                className="py-2.5 px-4 bg-[#252525] hover:bg-[#303030] border border-customBorder hover:border-gold/45 rounded-lg flex items-center justify-center space-x-2 text-xs font-mono text-primaryText hover:text-gold cursor-pointer transition-colors"
              >
                <BookOpen size={12} className="text-gold" />
                <span>Read Preview</span>
              </button>
            </div>

            {/* E-Commerce trust symbols */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-customBorder/30 text-[9px] font-mono text-secondaryText/60 text-left">
              <span className="flex items-center"><Truck size={10} className="mr-1 text-gold" /> Estimated: {formattedDelivery}</span>
              <span className="flex items-center"><ShieldCheck size={10} className="mr-1 text-gold" /> Secure payment</span>
              <span className="flex items-center"><RefreshCw size={10} className="mr-1 text-gold" /> 30-day museum return</span>
            </div>

            {/* FREQUENTLY BOUGHT TOGETHER */}
            {complementaryBooks.length > 0 && (
              <div className="mt-8 text-left space-y-4">
                <h3 className="font-serif text-lg font-bold text-primaryText border-b border-customBorder/60 pb-2">
                  Frequently Bought Together
                </h3>

                <div className="bg-[#151515] border border-customBorder rounded-xl p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img loading="lazy" src={book.coverUrl} className="w-10 h-14 object-cover rounded shadow" />
                    <span className="text-gold font-bold text-lg">+</span>
                    {complementaryBooks.map(cb => (
                      <React.Fragment key={cb.id}>
                        <img loading="lazy" src={cb.coverUrl} className="w-10 h-14 object-cover rounded shadow" />
                        {cb.id !== complementaryBooks[complementaryBooks.length - 1].id && <span className="text-gold font-bold text-lg">+</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="text-left flex-1 min-w-0 md:pl-4">
                    <span className="font-mono text-[9px] text-gold uppercase tracking-widest block font-bold">
                      Preservation Bundle Discount
                    </span>
                    <p className="text-[#A5A5A5] text-[10px] leading-relaxed mt-1 font-sans">
                      Order these volumes together and receive an immediate 15% package reduction.
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-secondaryText line-through text-xs font-mono">${bundleTotalPrice.toFixed(2)}</span>
                    <span className="text-gold font-serif text-xl font-bold block">${bundleDiscountedPrice}</span>
                    <button
                      onClick={handleAddBundleToCart}
                      className="mt-2 py-1.5 px-4 bg-gold hover:bg-gold-hover text-background font-mono text-[9px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                    >
                      Buy Bundle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS SECTION */}
            <div className="mt-10 text-left space-y-4">
              <h3 className="font-serif text-lg font-bold text-primaryText border-b border-customBorder/60 pb-2">
                Sanctuary Reader Reviews
              </h3>

              {/* Dynamic Review List */}
              <div className="space-y-4">
                {reviews.map((rev, i) => (
                  <div key={rev.id || i} className="p-4 bg-[#151515] border border-customBorder rounded-lg">
                    <div className="flex justify-between items-center text-xs font-mono text-secondaryText">
                      <span className="text-gold font-bold">{rev.username}</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star key={starIdx} size={10} fill={starIdx < rev.rating ? "#C9A227" : "none"} className="text-gold" />
                      ))}
                    </div>
                    <p className="text-secondaryText/85 text-xs mt-2 font-sans italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="p-6 bg-[#151515]/30 border border-[#2D2D2D] rounded-lg text-center text-xs font-mono text-[#A5A5A5] italic">
                    No reviews published yet for this work.
                  </div>
                )}
              </div>

              {/* Write review form */}
              <form onSubmit={handleReviewSubmit} className="bg-[#151515] border border-customBorder rounded-lg p-5 mt-6 space-y-4">
                <span className="font-serif text-sm font-bold text-primaryText block border-b border-customBorder/40 pb-1">
                  Write a Sanctuary Review
                </span>
                
                {submitSuccessMsg && (
                  <div className="p-2.5 bg-[#C9A227]/15 border border-[#C9A227]/30 rounded text-gold text-xs font-mono">
                    {submitSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-secondaryText uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Collector_42"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="bg-[#111111] border border-customBorder p-2 text-xs font-sans text-white rounded focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-secondaryText uppercase">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                      className="bg-[#111111] border border-customBorder p-2 text-xs font-mono text-gold rounded focus:border-gold focus:outline-none"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                      <option value="3">⭐⭐⭐ (3 Stars)</option>
                      <option value="2">⭐⭐ (2 Stars)</option>
                      <option value="1">⭐ (1 Star)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-secondaryText uppercase">Comments / Observations</label>
                  <textarea
                    required
                    placeholder="Share details of typography, layout, or translation..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="bg-[#111111] border border-customBorder p-2 h-16 text-xs font-sans text-white rounded focus:border-gold focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2 bg-gold hover:bg-gold-hover text-background font-mono text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting Review..." : "Submit Review for Curator Review"}
                </button>
              </form>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
