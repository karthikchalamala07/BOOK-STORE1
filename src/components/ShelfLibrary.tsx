import React, { useState } from "react";
import { Book } from "../types";
import { CLASSICS_DATABASE } from "../services/booksDb";
import { Star, BookOpen, Clock } from "lucide-react";

interface ShelfLibraryProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export default function ShelfLibrary({
  books,
  onBookSelect,
  favorites,
  toggleFavorite
}: ShelfLibraryProps) {
  const [activeGenre, setActiveGenre] = useState<string>("All");
  
  // Custom spine designs for various books to make the shelf look realistic
  const getBookSpineStyles = (bookId: string) => {
    switch (bookId) {
      case "dracula":
        return {
          bg: "bg-gradient-to-b from-[#4A0E17] via-[#2A050A] to-[#150204]", // Deep Blood Red
          text: "text-[#C9A227]",
          trim: "border-[#C9A227]/30",
          stamp: "☦"
        };
      case "pride-and-prejudice":
        return {
          bg: "bg-gradient-to-b from-[#1C3A27] via-[#102417] to-[#0A160E]", // Deep Regency Green
          text: "text-[#FAF6EE]",
          trim: "border-[#FAF6EE]/20",
          stamp: "✿"
        };
      case "sherlock-holmes":
        return {
          bg: "bg-gradient-to-b from-[#1B325F] via-[#0E1E3F] to-[#050D1D]", // Victorian Navy
          text: "text-[#C9A227]",
          trim: "border-[#C9A227]/40",
          stamp: "🔍"
        };
      case "alice-in-wonderland":
        return {
          bg: "bg-gradient-to-b from-[#8C3061] via-[#5C1B3E] to-[#3B0E25]", // Whimsical Purple
          text: "text-[#F8F6F2]",
          trim: "border-[#F8F6F2]/30",
          stamp: "♠"
        };
      case "art-of-war":
        return {
          bg: "bg-gradient-to-b from-[#5C2E0B] via-[#3C1E07] to-[#251002]", // Imperial Silk Brown
          text: "text-[#C9A227]",
          trim: "border-[#C9A227]/40",
          stamp: "☯"
        };
      case "frankenstein":
        return {
          bg: "bg-gradient-to-b from-[#34495E] via-[#2C3E50] to-[#1A252F]", // Slate Grey / Monster Stitch
          text: "text-[#D5DBDB]",
          trim: "border-[#BDC3C7]/30",
          stamp: "⚡"
        };
      default:
        return {
          bg: "bg-gradient-to-b from-[#2C2C2C] via-[#1E1E1E] to-[#121212]", // Default Leather
          text: "text-[#C9A227]",
          trim: "border-customBorder",
          stamp: "📖"
        };
    }
  };

  const genres = ["All", ...Array.from(new Set(books.map(b => b.genre)))];
  
  const filteredBooks = activeGenre === "All" 
    ? books 
    : books.filter(b => b.genre === activeGenre);

  // Group books in rows of 4 for shelves
  const shelfRows: Book[][] = [];
  for (let i = 0; i < filteredBooks.length; i += 4) {
    shelfRows.push(filteredBooks.slice(i, i + 4));
  }

  return (
    <section id="shelves-section" className="py-24 px-6 md:px-12 bg-background relative">
      {/* Light glow on header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-gold-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 relative">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-gold uppercase tracking-[0.25em] block mb-3">
            The Sanctuary Archives
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primaryText">
            Interactive Library Shelves
          </h2>
          <p className="text-secondaryText text-sm max-w-md mx-auto mt-4 font-sans leading-relaxed">
            Hover any volume to slide it forward and reveal its catalog bindings. Select a classic to lift it into the reading spotlight.
          </p>

          {/* Genre Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`py-2 px-5 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
                  activeGenre === genre
                    ? "border-gold bg-gold text-background font-bold shadow-gold-glow"
                    : "border-customBorder text-secondaryText hover:border-gold hover:text-gold"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Shelves Layout */}
        <div className="space-y-24 mt-16">
          {shelfRows.length === 0 ? (
            <div className="text-center text-secondaryText font-mono py-12 border border-customBorder rounded">
              No volumes found matching the search register.
            </div>
          ) : (
            shelfRows.map((row, shelfIdx) => (
              <div key={shelfIdx} className="relative pt-12 pb-1">
                
                {/* Books Display */}
                <div className="flex justify-around items-end px-8 md:px-16 min-h-[300px] relative z-10">
                  {row.map(book => {
                    const spine = getBookSpineStyles(book.id);
                    const isFav = favorites.includes(book.id);
                    
                    return (
                      <div
                        key={book.id}
                        className="group relative cursor-pointer flex flex-col items-center select-none"
                        style={{ perspective: "1000px" }}
                      >
                        {/* Interactive Book Spine/Cover Body */}
                        <div
                          onClick={() => onBookSelect(book)}
                          className={`w-14 md:w-20 h-[220px] md:h-[260px] rounded-l ${spine.bg} border-l border-t border-b ${spine.trim} shadow-2xl relative flex flex-col justify-between py-6 px-1 md:px-2 transition-all duration-500 ease-out origin-bottom transform-style-3d group-hover:-translate-y-8 group-hover:translate-z-10 group-hover:rotate-y-12 group-hover:shadow-gold-glow-lg`}
                        >
                          {/* Book spine details */}
                          <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-black/40 border-r border-[#C9A227]/20" />
                          
                          {/* Gold stamps on Spine top/bottom */}
                          <div className={`text-center ${spine.text} font-mono text-[9px] md:text-xs font-bold`}>
                            {spine.stamp}
                          </div>

                          {/* Vertically written book title on spine */}
                          <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
                            <span 
                              className={`font-serif text-[10px] md:text-xs font-semibold tracking-wider ${spine.text} uppercase`}
                              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                            >
                              {book.title}
                            </span>
                          </div>

                          <div className={`text-center ${spine.text} font-mono text-[8px] tracking-tighter`}>
                            {book.year > 0 ? book.year : "CLASSIC"}
                          </div>
                        </div>

                        {/* Title Floating Fade-In (Hover details) */}
                        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 w-48 text-center bg-surface border border-gold/30 p-2.5 rounded shadow-xl">
                          <h4 className="font-serif text-sm font-bold text-primaryText leading-snug">
                            {book.title}
                          </h4>
                          <span className="text-[10px] font-mono text-gold uppercase tracking-wider block mt-1">
                            {book.author}
                          </span>
                          <span className="text-[9px] text-secondaryText block font-mono">
                            {book.genre}
                          </span>
                        </div>

                        {/* Quick Action Favorites Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(book.id);
                          }}
                          className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 rounded-full bg-surface border border-customBorder text-secondaryText hover:text-gold cursor-pointer"
                        >
                          <Star size={12} fill={isFav ? "#C9A227" : "none"} className={isFav ? "text-gold animate-bounce" : ""} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Wooden Shelf Structure */}
                <div className="w-full relative h-10 mt-[-10px] z-0">
                  {/* Shelf Top Face */}
                  <div className="h-4 bg-shelf-top border-t border-[#3d2a1c] border-b border-black rounded-t relative">
                    {/* Shadow cast on the wall */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                  </div>
                  {/* Shelf Front Bevel Edge */}
                  <div className="h-6 bg-shelf-wood border-t border-gold/15 shadow-2xl relative">
                    {/* Golden shine accent lining */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gold/20" />
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}