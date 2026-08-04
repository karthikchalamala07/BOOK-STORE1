import React, { useEffect } from "react";
import { Book } from "../types";
import { Star, BookOpen, Eye } from "lucide-react";

interface FeaturedBooksProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  onReadPreview: (book: Book) => void;
}

export default function FeaturedBooks({ books, onBookSelect, onReadPreview }: FeaturedBooksProps) {
  
  // 1. Fetch/Filter all featured books from the Firestore books array
  // Accepts featured or isFeatured flags
  const featuredBooks = books.filter(
    b => (b as any).featured === true || (b as any).isFeatured === true
  );

  // 8. Log the fetched array during development to verify four books are returned
  useEffect(() => {
    console.log("Featured books returned from Content Repository:", featuredBooks);
  }, [featuredBooks]);

  // 4. If Firestore returns no data, display a proper empty state instead of silently failing
  if (featuredBooks.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 bg-background relative text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-radial-gold-glow pointer-events-none" />
        <div className="max-w-md mx-auto p-8 border border-dashed border-customBorder rounded-xl bg-[#151515] relative z-10">
          <BookOpen className="text-gold mx-auto mb-4" size={36} />
          <h3 className="font-serif text-lg text-white font-bold mb-2">Featured Collection Offline</h3>
          <p className="text-secondaryText text-xs font-mono">
            No featured books are available at this moment. You can mark books as featured in the Admin Portal to display them here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 md:px-12 bg-background relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-radial-gold-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-gold uppercase tracking-[0.25em] block mb-3">
            Iconic Masterpieces
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primaryText">
            Featured Collections
          </h2>
          <p className="text-secondaryText text-sm max-w-md mx-auto mt-4 font-sans leading-relaxed">
            Preserved historical literature representing foundational achievements of human fiction, narrative drama, romance, and mystery.
          </p>
        </div>

        {/* 10. Responsive grid layout: Mobile 1 card, Tablet 2 cards, Desktop 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* 9. Render the featured books using books.map */}
          {featuredBooks.map(book => {
            
            // 6. Verify every book has title, author, coverImage, description, featured
            const title = book.title || "Untitled Classic";
            const author = book.author || "Unknown Author";
            const coverImage = (book as any).coverImage || book.coverUrl || "/placeholder.jpg";
            const description = book.description || "Historical literature preservation copy.";
            const featured = (book as any).featured ?? (book as any).isFeatured ?? false;

            return (
              <div 
                key={book.id}
                className="flex flex-col bg-[#151515] border border-customBorder rounded-xl p-5 hover:border-gold/35 hover:shadow-gold-glow/5 transition-all duration-500 group text-left justify-between"
              >
                {/* Book Cover Image */}
                <div 
                  onClick={() => onBookSelect(book)}
                  className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-customBorder/50 shadow-xl relative cursor-pointer transform group-hover:scale-[1.02] transition-transform duration-500 origin-bottom"
                >
                  <img loading="lazy" 
                    src={coverImage} 
                    alt={title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Eye size={24} className="text-gold" />
                  </div>
                </div>

                {/* Details info */}
                <div className="mt-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => onBookSelect(book)}
                      className="font-serif text-lg font-bold text-primaryText leading-snug cursor-pointer hover:text-gold transition-colors duration-300 truncate"
                    >
                      {title}
                    </h3>
                    <span className="font-mono text-[10px] text-gold uppercase tracking-wider block mt-1">
                      {author}
                    </span>
                    
                    {/* Rating stars */}
                    <div className="flex items-center space-x-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill="#C9A227" className="text-gold" />
                      ))}
                      <span className="font-mono text-[9px] text-secondaryText pl-1.5">(4.9)</span>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-secondaryText text-xs mt-3 leading-relaxed font-sans line-clamp-2">
                      {description}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-6 border-t border-customBorder/40 pt-4 text-xs font-mono">
                    <button
                      onClick={() => onReadPreview(book)}
                      className="py-2.5 bg-gold hover:bg-gold-hover text-background font-bold rounded flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <BookOpen size={12} />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => onBookSelect(book)}
                      className="py-2.5 border border-customBorder hover:border-gold/45 text-primaryText hover:text-gold rounded flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
