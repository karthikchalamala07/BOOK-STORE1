import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Book } from "../types";
import { useBookstore } from "../context/useBookstore";
import { getBookPricing } from "../services/booksDb";
import { Search, Star, Heart, ShoppingBag, BookOpen, SlidersHorizontal, ArrowDownAZ } from "lucide-react";


// Premium Shimmer skeleton image loader to prevent layout shifts
const ImageWithPlaceholder = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full bg-[#1A1A1A]">
      {!loaded && <div className="absolute inset-0 animate-shimmer" />}
      <img
        loading="lazy"
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

interface LibraryPageProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

const CATEGORY_LIST = [
  "All", "Classic Literature", "Mystery", "Horror", "Fantasy", "Adventure", 
  "Science Fiction", "Philosophy", "Poetry", "Children's Books", 
  "History", "Drama", "Romance", "Mythology", "Travel", "Strategy", "Education"
];

const GENRE_LIST = [
  "All", "Classic Literature", "Mystery", "Horror", "Fantasy", "Adventure",
  "Science Fiction", "Philosophy", "Poetry", "Children's Books",
  "History", "Drama", "Romance", "Mythology"
];

const LANGUAGE_LIST = [
  "All", "English", "Italian", "Spanish", "Old English", "French"
];

export default function LibraryPage({ books, onBookSelect }: LibraryPageProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useBookstore();
  const location = useLocation();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Advanced filters
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedYearRange, setSelectedYearRange] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedMinRating, setSelectedMinRating] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [sortBy, setSortBy] = useState<"title" | "year-new" | "pages">("title");

  // Pagination limit (Performance lazy load)
  const [visibleCount, setVisibleCount] = useState(12);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

  // Reset pagination when filter parameters change
  useEffect(() => {
    setVisibleCount(12);
  }, [
    searchQuery, selectedCategory, selectedGenre, selectedLanguage,
    selectedYearRange, selectedAvailability, selectedMinRating,
    selectedPriceRange, sortBy
  ]);

  // Sync selected author from navigation state to the search query (author name search only)
  useEffect(() => {
    if (location.state?.author) {
      setSearchQuery(location.state.author);
    }
  }, [location.state]);

  // Filter and sort computation
  const filteredSortedBooks = useMemo(() => {
    let result = [...books];

    // Search query filter (searches Title, Author, Genre, Publication Year)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        b => b.title.toLowerCase().includes(q) || 
             b.author.toLowerCase().includes(q) ||
             b.genre.toLowerCase().includes(q) ||
             String(b.year).includes(q)
      );
    }

    // Category filter (badges)
    if (selectedCategory !== "All") {
      result = result.filter(b => b.genre === selectedCategory);
    }

    // Genre dropdown filter
    if (selectedGenre !== "All") {
      result = result.filter(b => b.genre.toLowerCase() === selectedGenre.toLowerCase());
    }

    // Language dropdown filter
    if (selectedLanguage !== "All") {
      result = result.filter(b => b.language.toLowerCase().includes(selectedLanguage.toLowerCase()));
    }

    // Year Range filter dropdown
    if (selectedYearRange !== "All") {
      if (selectedYearRange === "before-1800") {
        result = result.filter(b => b.year < 1800);
      } else if (selectedYearRange === "1800-1900") {
        result = result.filter(b => b.year >= 1800 && b.year <= 1900);
      } else if (selectedYearRange === "after-1900") {
        result = result.filter(b => b.year > 1900);
      }
    }

    // Availability filter dropdown
    if (selectedAvailability !== "All") {
      if (selectedAvailability === "preview") {
        result = result.filter(b => b.gutenbergId || b.id === "dracula" || b.id === "pride-and-prejudice" || b.id === "sherlock-holmes");
      }
    }

    // Rating filter dropdown (deterministic mock rating)
    if (selectedMinRating > 0) {
      result = result.filter(b => {
        const rating = 4.0 + ((b.year * 7) % 11) * 0.1; // 4.0 - 5.0
        return rating >= selectedMinRating;
      });
    }

    // Price filter dropdown
    if (selectedPriceRange !== "All") {
      result = result.filter(b => {
        const pricing = getBookPricing(b.id);
        const price = pricing.physicalPrice;
        if (selectedPriceRange === "under-15") {
          return price < 15.0;
        } else if (selectedPriceRange === "15-25") {
          return price >= 15.0 && price <= 25.0;
        } else if (selectedPriceRange === "over-25") {
          return price > 25.0;
        }
        return true;
      });
    }

    // Sorting
    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "year-new") {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === "pages") {
      result.sort((a, b) => (b.year % 50) - (a.year % 50));
    }

    return result;
  }, [
    books, searchQuery, selectedCategory, selectedGenre, selectedLanguage,
    selectedYearRange, selectedAvailability, selectedMinRating,
    selectedPriceRange, sortBy
  ]);

  const displayedBooks = filteredSortedBooks.slice(0, visibleCount);
  const hasMore = filteredSortedBooks.length > visibleCount;

  const handleLoadMore = () => {
    setIsInfiniteLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 12);
      setIsInfiniteLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-background relative overflow-hidden select-none">
      {/* Spotlight */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-radial-gold-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 z-10 relative">
        
        {/* Title */}
        <div className="text-left mb-12">
          <span className="font-mono text-xs text-gold uppercase tracking-[0.25em] block mb-2">
            STORYVAULT Preserves
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primaryText">
            The Digital Library
          </h1>
          <p className="text-secondaryText text-sm max-w-lg mt-3 leading-relaxed">
            Browse our full registry of public-domain editions. Apply filters, try 5-minute previews, or acquire volumes.
          </p>
        </div>

        {/* SEARCH AND FILTERS TOOLBAR */}
        <div className="bg-[#151515] border border-customBorder rounded-2xl p-6 mb-12 space-y-6">
          
          <div className="flex flex-col xl:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full xl:flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryText" size={16} />
              <input
                type="text"
                placeholder="Search by title, author name, genre, or publication year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-customBorder rounded-lg py-3 pl-11 pr-4 text-xs font-sans text-primaryText focus:outline-none focus:border-gold placeholder:text-secondaryText/40"
              />
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 w-full xl:w-auto">
              
              {/* Genre filter selector */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-background border border-customBorder rounded-lg p-2.5 text-[10px] font-mono text-primaryText focus:outline-none focus:border-gold"
              >
                <option value="All">All Genres</option>
                {GENRE_LIST.slice(1).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {/* Language filter selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-background border border-customBorder rounded-lg p-2.5 text-[10px] font-mono text-primaryText focus:outline-none focus:border-gold"
              >
                <option value="All">All Languages</option>
                {LANGUAGE_LIST.slice(1).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              {/* Year filter selector */}
              <select
                value={selectedYearRange}
                onChange={(e) => setSelectedYearRange(e.target.value)}
                className="bg-background border border-customBorder rounded-lg p-2.5 text-[10px] font-mono text-primaryText focus:outline-none focus:border-gold"
              >
                <option value="All">All Years</option>
                <option value="before-1800">Before 1800</option>
                <option value="1800-1900">1800 - 1900</option>
                <option value="after-1900">After 1900</option>
              </select>

              {/* Price filter selector */}
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="bg-background border border-customBorder rounded-lg p-2.5 text-[10px] font-mono text-primaryText focus:outline-none focus:border-gold"
              >
                <option value="All">All Prices</option>
                <option value="under-15">Under $15</option>
                <option value="15-25">$15 - $25</option>
                <option value="over-25">Over $25</option>
              </select>

              {/* Rating filter selector */}
              <select
                value={selectedMinRating}
                onChange={(e) => setSelectedMinRating(Number(e.target.value))}
                className="bg-background border border-customBorder rounded-lg p-2.5 text-[10px] font-mono text-primaryText focus:outline-none focus:border-gold"
              >
                <option value="0">All Ratings</option>
                <option value="4.5">4.5 & up</option>
                <option value="4.0">4.0 & up</option>
                <option value="3.5">3.5 & up</option>
              </select>

              {/* Availability selector */}
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="bg-background border border-customBorder rounded-lg p-2.5 text-[10px] font-mono text-primaryText focus:outline-none focus:border-gold"
              >
                <option value="All">Availability</option>
                <option value="preview">Instant Preview</option>
              </select>

            </div>

            {/* Sort selector */}
            <div className="flex items-center space-x-2 w-full xl:w-auto border-t xl:border-t-0 xl:border-l border-customBorder/60 pt-4 xl:pt-0 xl:pl-4">
              <ArrowDownAZ size={14} className="text-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full xl:w-36 bg-background border border-customBorder rounded-lg p-2.5 text-[10px] font-mono text-primaryText focus:outline-none focus:border-gold"
              >
                <option value="title">Sort: Alpha</option>
                <option value="year-new">Sort: Newest</option>
                <option value="pages">Sort: Pages</option>
              </select>
            </div>
          </div>

          {/* Category Badges Filter */}
          <div className="border-t border-customBorder/60 pt-4 text-left">
            <span className="font-mono text-[9px] uppercase tracking-wider text-secondaryText block mb-3">
              Categories:
            </span>
            <div className="flex flex-wrap gap-2 max-h-[90px] overflow-y-auto pr-1">
              {CATEGORY_LIST.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-4 rounded-full font-mono text-[8px] uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat
                      ? "border-gold bg-gold text-background font-bold"
                      : "border-customBorder text-secondaryText hover:border-gold hover:text-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RESULTS GRID */}
        <div className="space-y-12">
          {displayedBooks.length === 0 ? (
            <div className="text-center py-20 text-secondaryText/60 font-mono text-xs border border-dashed border-customBorder rounded-lg">
              No volumes match the search filter parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedBooks.map(book => {
                const pricing = getBookPricing(book.id);
                const isWish = isInWishlist(book.id);
                const isInstantPreview = !!book.gutenbergId || book.id === "dracula" || book.id === "pride-and-prejudice" || book.id === "sherlock-holmes";
                const mockRating = (4.0 + ((book.year * 7) % 11) * 0.1).toFixed(1);

                return (
                  <div 
                    key={book.id}
                    className="group bg-[#151515] border border-customBorder hover:border-gold rounded-xl p-4 hover:shadow-[0_0_20px_rgba(201,162,39,0.15)] transition-all duration-500 flex flex-col justify-between select-text"
                  >
                    {/* Cover image container */}
                    <div 
                      onClick={() => onBookSelect(book)}
                      className="aspect-[3/4] rounded-lg overflow-hidden border border-customBorder/50 relative cursor-pointer transform group-hover:scale-[1.02] transition-all duration-500 shadow-md"
                    >
                      <ImageWithPlaceholder 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:brightness-90 transition-all" 
                      />
                      
                      {/* Preview Badge */}
                      {isInstantPreview && (
                        <span className="absolute top-3 left-3 bg-gold text-background text-[8px] font-mono uppercase font-bold px-2 py-0.5 rounded tracking-widest shadow">
                          Preview Available
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <BookOpen size={20} className="text-gold animate-pulse" />
                      </div>
                    </div>

                    {/* Meta details */}
                    <div className="text-left mt-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 
                          onClick={() => onBookSelect(book)}
                          className="font-serif text-sm font-bold text-primaryText line-clamp-1 cursor-pointer hover:text-gold transition-colors"
                        >
                          {book.title}
                        </h4>
                        <p className="font-sans text-[11px] text-secondaryText/80 mt-0.5 line-clamp-1">
                          by {book.author}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-[9px] bg-customBorder/40 border border-customBorder/60 text-secondaryText px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                            {book.genre}
                          </span>
                          <span className="text-[9px] text-[#A5A5A5] font-mono">
                            {book.year < 0 ? `${Math.abs(book.year)} BC` : book.year}
                          </span>
                        </div>
                      </div>

                      {/* Stars & Price */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-customBorder/40">
                        <div className="flex items-center space-x-1">
                          <Star size={10} fill="#C9A227" className="text-gold" />
                          <span className="font-mono text-[9px] text-secondaryText">{mockRating}</span>
                        </div>
                        <span className="font-mono text-xs text-gold font-bold">
                          ${pricing.physicalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 space-y-2">
                      {/* Add to Cart & Wishlist row */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => onBookSelect(book)}
                          className="col-span-2 py-2 bg-[#222222] hover:bg-[#303030] text-primaryText hover:text-gold text-[9px] font-mono uppercase tracking-wider rounded flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <BookOpen size={10} />
                          <span>Preview</span>
                        </button>
                        
                        <button
                          onClick={() => addToCart(book, "physical", pricing.physicalPrice)}
                          className="py-2 bg-[#222222] hover:bg-[#303030] text-primaryText hover:text-gold rounded flex items-center justify-center cursor-pointer transition-colors"
                          title="Add to Cart"
                        >
                          <ShoppingBag size={11} />
                        </button>

                        <button
                          onClick={() => toggleWishlist(book.id)}
                          className="py-2 bg-[#222222] hover:bg-[#303030] text-primaryText hover:text-gold rounded flex items-center justify-center cursor-pointer transition-colors"
                          title="Wishlist"
                        >
                          <Heart size={11} fill={isWish ? "#C9A227" : "none"} className={isWish ? "text-gold" : ""} />
                        </button>
                      </div>

                      {/* Buy Now direct button */}
                      <button
                        onClick={() => {
                          addToCart(book, "physical", pricing.physicalPrice);
                          onBookSelect(book);
                        }}
                        className="w-full py-2 bg-gold hover:bg-gold-hover text-background hover:text-black text-[9px] font-mono uppercase font-bold tracking-widest rounded transition-all cursor-pointer text-center"
                      >
                        Buy Now
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isInfiniteLoading}
              className="py-4 px-10 border border-gold/40 hover:border-gold text-primaryText hover:text-background hover:bg-gold font-mono text-xs uppercase tracking-widest font-bold rounded-full transition-all duration-300 cursor-pointer shadow-gold-glow flex items-center space-x-2 mx-auto disabled:opacity-50"
            >
              <span>{isInfiniteLoading ? "Cataloging Volumes..." : "Load More Volumes"}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
