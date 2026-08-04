import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, BookOpen, Heart, ArrowRight } from "lucide-react";
import { useBookstore } from "../context/useBookstore";
import { getBookPricing } from "../services/booksDb";
import { Book } from "../types";
import { useNavigate } from "react-router-dom";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReadPreview: (book: Book) => void;
  onBuyNowClick: () => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  onReadPreview,
  onBuyNowClick
}: WishlistDrawerProps) {
  const navigate = useNavigate();
  const { books, wishlist, addToCart, toggleWishlist } = useBookstore();

  // Map wishlist IDs to actual book objects
  const wishlistItems = books.filter(b => wishlist.includes(b.id));

  const handleMoveToCart = (book: Book) => {
    const pricing = getBookPricing(book.id);
    // Add to cart as Leather Hardcover
    addToCart(book, "physical", pricing.physicalPrice);
    // Remove from wishlist
    toggleWishlist(book.id);
  };

  const handleBuyNow = (book: Book) => {
    const pricing = getBookPricing(book.id);
    addToCart(book, "physical", pricing.physicalPrice);
    onClose();
    onBuyNowClick(); // Skips cart directly to shipping details
  };

  const handleExploreLibrary = () => {
    onClose();
    navigate("/library");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0c0c0c]/85 backdrop-blur-sm"
          />

          {/* Drawer Sidebar */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="w-full bg-surface border-l border-customBorder h-full flex flex-col shadow-2xl relative select-text"
            >
              {/* Header */}
              <div className="p-6 border-b border-customBorder/50 flex justify-between items-center bg-background/50">
                <div className="flex items-center space-x-2 text-gold">
                  <Heart size={18} fill="#C9A227" className="text-gold" />
                  <span className="font-serif text-lg font-bold text-primaryText">
                    Wishlist
                  </span>
                </div>
                
                <button
                  onClick={onClose}
                  className="text-secondaryText hover:text-gold p-1.5 hover:bg-[#252525] rounded-full cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {wishlistItems.length === 0 ? (
                  /* Empty state */
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-6 px-4 select-none">
                    <div className="w-16 h-16 rounded-full border border-customBorder flex items-center justify-center bg-[#151515]">
                      <Heart size={24} className="text-secondaryText/40" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-serif text-sm font-bold text-primaryText uppercase tracking-wider">
                        Your Wishlist is Empty
                      </p>
                      <p className="font-sans text-xs text-secondaryText/60 leading-relaxed max-w-[240px]">
                        No books have been added to your wishlist yet. Explore our digital preserves to start collecting.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleExploreLibrary}
                      className="py-3 px-8 border border-gold hover:bg-gold/10 text-gold font-mono text-[9px] uppercase tracking-widest font-bold rounded-lg cursor-pointer transition-all duration-300"
                    >
                      Explore Library
                    </button>
                  </div>
                ) : (
                  /* Items list */
                  wishlistItems.map(book => {
                    const pricing = getBookPricing(book.id);
                    // Mock date added deterministically based on book ID properties
                    const addedDaysAgo = (book.year % 5) + 1;
                    const dateAdded = new Date(Date.now() - addedDaysAgo * 24 * 60 * 60 * 1000);
                    const formattedDate = dateAdded.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });

                    return (
                      <div 
                        key={book.id}
                        className="bg-[#121212] border border-customBorder rounded-xl p-4 flex gap-4 relative group hover:border-gold/30 hover:shadow-gold-glow/5 transition-all duration-300 text-left"
                      >
                        {/* Book Cover */}
                        <div className="w-16 h-22 rounded shadow-md overflow-hidden border border-customBorder/50 shrink-0">
                          <img 
                            src={book.coverUrl} 
                            alt={book.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif text-sm font-bold text-primaryText truncate">
                              {book.title}
                            </h4>
                            <p className="font-sans text-[11px] text-secondaryText truncate">
                              by {book.author}
                            </p>
                            <span className="font-mono text-[9px] text-[#A5A5A5] mt-1 block">
                              Added: {formattedDate}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-customBorder/40">
                            <span className="font-mono text-xs text-gold font-bold">
                              ${pricing.physicalPrice}
                            </span>

                            {/* Move to Cart button */}
                            <button
                              onClick={() => handleMoveToCart(book)}
                              className="py-1 px-2.5 bg-[#252525] hover:bg-[#303030] border border-customBorder hover:border-gold/30 text-gold font-mono text-[8px] uppercase tracking-wider font-bold rounded flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Move to Cart"
                            >
                              <ShoppingBag size={8} />
                              <span>Move to Cart</span>
                            </button>
                          </div>

                          {/* Quick buttons bar */}
                          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-customBorder/20 text-[9px]">
                            <button
                              onClick={() => onReadPreview(book)}
                              className="flex items-center space-x-1 text-[#A5A5A5] hover:text-gold transition-colors cursor-pointer"
                            >
                              <BookOpen size={10} />
                              <span>Preview</span>
                            </button>
                            <span className="text-[#A5A5A5]/30">|</span>
                            <button
                              onClick={() => handleBuyNow(book)}
                              className="flex items-center space-x-1 text-gold hover:text-gold-hover transition-colors cursor-pointer font-bold"
                            >
                              <span>Buy Now</span>
                              <ArrowRight size={10} />
                            </button>
                            <span className="text-[#A5A5A5]/30">|</span>
                            <button
                              onClick={() => toggleWishlist(book.id)}
                              className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-auto"
                            >
                              <Trash2 size={10} />
                              <span>Remove</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {wishlistItems.length > 0 && (
                <div className="p-6 bg-background/50 border-t border-customBorder/50 space-y-3">
                  <button
                    onClick={handleExploreLibrary}
                    className="w-full py-3.5 border border-gold hover:bg-gold/10 text-gold font-mono text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-colors text-center"
                  >
                    Continue Browsing
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
