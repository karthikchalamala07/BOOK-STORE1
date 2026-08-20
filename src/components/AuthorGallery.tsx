import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FEATURED_AUTHORS } from "../services/booksDb";
import { BookOpen, MapPin } from "lucide-react";
import { Book } from "../types";

interface AuthorGalleryProps {
  onBookSelect: (book: Book) => void;
  localBooks: Book[];
}

export default function AuthorGallery({ onBookSelect, localBooks }: AuthorGalleryProps) {
  const navigate = useNavigate();
  
  // Track image load state for skeleton loader
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (authorId: string) => {
    setLoadedImages(prev => ({ ...prev, [authorId]: true }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Prevent infinite loop if default fallback also fails
    if (e.currentTarget.src.includes("default-author.webp")) return;
    e.currentTarget.src = "/authors/default-author.webp";
  };

  const handleBookClick = (bookTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const found = localBooks.find(b => b.title.toLowerCase() === bookTitle.toLowerCase());
    if (found) {
      onBookSelect(found);
    }
  };

  const handleExploreWorks = (authorName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/library", { state: { author: authorName } });
  };

  return (
    <section id="authors" className="py-24 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-radial-gold-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-gold uppercase tracking-[0.25em] block mb-3">
            Hall of Curators
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primaryText">
            Author Gallery
          </h2>
          <p className="text-secondaryText text-sm max-w-md mx-auto mt-4 font-sans leading-relaxed">
            Stand in the digital portraits hall of history's legendary thinkers and storytellers.
          </p>
        </div>

        {/* Portraits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {FEATURED_AUTHORS.map((author, idx) => {
            const authorBooks = localBooks.filter(
              b => b.author.toLowerCase() === author.name.toLowerCase()
            );
            const booksInLibraryCount = authorBooks.length;
            const isImageLoaded = loadedImages[author.id] || false;
            
            // Format Birth-Death string
            const birthStr = author.birthYear < 0 ? `${Math.abs(author.birthYear)} BC` : String(author.birthYear);
            const deathStr = author.deathYear === null 
              ? "Present" 
              : (author.deathYear < 0 ? `${Math.abs(author.deathYear)} BC` : String(author.deathYear));
            const birthDeathYears = `${birthStr} - ${deathStr}`;

            return (
              <div 
                key={author.id}
                className="relative aspect-[3/4] bg-surface rounded-lg border-4 border-customBorder hover:border-gold hover:shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all duration-500 overflow-hidden group flex flex-col justify-end cursor-pointer"
              >
                {/* Skeleton Loader overlay */}
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-[#252525] animate-pulse z-10 flex items-center justify-center">
                    <span className="font-mono text-[9px] text-gold/60 uppercase tracking-widest">
                      Cataloging Portrait...
                    </span>
                  </div>
                )}

                {/* Author Portrait Image */}
                <img loading="lazy" decoding="async" 
                  src={author.portrait} 
                  alt={author.name}
                  onLoad={() => handleImageLoad(author.id)}
                  onError={handleImageError}
                  className={`absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:scale-110 group-hover:brightness-95 transition-all duration-700 ease-out z-0 ${
                    isImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Black Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                {/* Biography Details (Slides upwards on hover) */}
                <div className="relative z-20 p-5 flex flex-col justify-end min-h-[50%] translate-y-[68%] group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black via-black/95 to-black/85 text-left">
                  
                  {/* Author Header */}
                  <div className="mb-2">
                    <h3 className="font-serif text-lg font-bold text-primaryText leading-tight">
                      {author.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-[9px] text-gold uppercase tracking-wider">
                        {birthDeathYears}
                      </span>
                      <span className="flex items-center space-x-1 font-mono text-[8px] text-secondaryText/80 uppercase tracking-widest bg-customBorder/30 px-2 py-0.5 rounded border border-customBorder/40">
                        <MapPin size={8} className="text-gold" />
                        <span>{author.nationality}</span>
                      </span>
                    </div>
                  </div>

                  {/* Biography & Metadata (Fades in on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 overflow-hidden">
                    {/* Bio */}
                    <p className="text-secondaryText text-[11px] mt-2 mb-3 leading-relaxed font-sans max-h-[64px] overflow-y-auto pr-1">
                      {author.biography}
                    </p>

                    {/* Book counts metadata */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-customBorder/30 text-mono text-[8px] uppercase tracking-wider text-secondaryText">
                      <div className="flex flex-col">
                        <span>Works Written:</span>
                        <span className="text-gold font-bold text-[10px] mt-0.5">{author.booksWritten}</span>
                      </div>
                      <div className="flex flex-col border-l border-customBorder/30 pl-2">
                        <span>Sanctuary Vault:</span>
                        <span className="text-gold font-bold text-[10px] mt-0.5">{booksInLibraryCount} {booksInLibraryCount === 1 ? "Vol" : "Vols"}</span>
                      </div>
                    </div>

                    {/* Featured books list */}
                    {author.featuredBooks && author.featuredBooks.length > 0 && (
                      <div className="mt-3">
                        <span className="font-mono text-[8px] text-gold uppercase tracking-wider block mb-1">
                          Featured Titles
                        </span>
                        <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1">
                          {author.featuredBooks.map((bookTitle: string, bIdx: number) => (
                            <button
                              key={bIdx}
                              onClick={(e) => handleBookClick(bookTitle, e)}
                              className="text-left text-primaryText hover:text-gold text-[10px] font-serif font-semibold italic flex items-center space-x-1.5 cursor-pointer w-full"
                            >
                              <BookOpen size={9} className="text-gold" />
                              <span className="truncate">{bookTitle}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explore Works Button */}
                    <button
                      onClick={(e) => handleExploreWorks(author.name, e)}
                      className="mt-4 w-full bg-gold hover:bg-gold/90 text-background hover:text-black font-mono text-[9px] uppercase font-bold tracking-widest py-2 rounded transition-all duration-300 cursor-pointer text-center"
                    >
                      Explore Works
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
