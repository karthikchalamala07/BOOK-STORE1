import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, Globe, Loader2 } from "lucide-react";
import { Book } from "../types";
import { searchOpenLibrary } from "../services/api";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  localBooks: Book[];
  onBookSelect: (book: Book) => void;
}

export default function SearchPanel({
  isOpen,
  onClose,
  localBooks,
  onBookSelect
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [openLibraryResults, setOpenLibraryResults] = useState<Book[]>([]);

  // Debounce the input query to prevent lag on keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when search panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Real-time search processing
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults(localBooks);
      setOpenLibraryResults([]);
      return;
    }

    // Filter local books
    const localFiltered = localBooks.filter(book => {
      const matchText = `${book.title} ${book.author} ${book.genre} ${book.year}`.toLowerCase();
      const matchesQuery = matchText.includes(debouncedQuery.toLowerCase());
      const matchesGenre = genreFilter === "All" || book.genre === genreFilter;
      return matchesQuery && matchesGenre;
    });
    setSearchResults(localFiltered);

    // Fetch Open Library API
    if (debouncedQuery.length > 2) {
      setLoading(true);
      searchOpenLibrary(debouncedQuery).then((apiBooks) => {
        const filteredApi = apiBooks.filter(
          apiBook => !localBooks.some(local => local.title.toLowerCase() === apiBook.title.toLowerCase())
        );
        setOpenLibraryResults(filteredApi);
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [debouncedQuery, genreFilter, localBooks]);

  const genres = ["All", ...Array.from(new Set(localBooks.map(b => b.genre)))];

  const handleSelectBook = (book: Book) => {
    onBookSelect(book);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#111111]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
        >
          {/* Close Area */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Search Box Container */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-4xl bg-surface border border-customBorder rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header / Input */}
            <div className="p-6 border-b border-customBorder flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-grow mr-4">
                <Search className="text-gold" size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by title, author, genre, or publication year..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-primaryText text-lg font-sans w-full focus:outline-none placeholder:text-secondaryText/40"
                />
              </div>
              <button
                onClick={onClose}
                className="text-secondaryText hover:text-gold p-2 hover:bg-[#252525] rounded-full cursor-pointer transition-colors duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters Row */}
            <div className="px-6 py-3 bg-[#151515] border-b border-customBorder flex items-center space-x-3 overflow-x-auto">
              <span className="font-mono text-[9px] uppercase tracking-wider text-secondaryText shrink-0">
                Genre Filter:
              </span>
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setGenreFilter(genre)}
                  className={`py-1 px-3 rounded-full font-mono text-[8px] uppercase tracking-widest border transition-all duration-300 shrink-0 cursor-pointer ${
                    genreFilter === genre
                      ? "border-gold bg-gold text-background font-bold"
                      : "border-customBorder text-secondaryText hover:border-gold hover:text-gold"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Local Preserved Sanctuary Classics */}
              <div>
                <h4 className="font-serif text-xs text-gold uppercase tracking-[0.2em] mb-4 border-b border-customBorder pb-1">
                  Preserved Classics ({searchResults.length})
                </h4>
                {searchResults.length === 0 ? (
                  <p className="text-secondaryText/60 text-xs font-mono py-2">
                    No local archives match the query.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map(book => (
                      <div
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        className="flex items-center space-x-4 p-3 bg-[#151515] hover:bg-[#222222] border border-customBorder hover:border-gold/30 rounded-lg cursor-pointer transition-all duration-300 group"
                      >
                        <img loading="lazy"
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded shadow border border-customBorder group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <h5 className="font-serif text-sm font-bold text-primaryText truncate">
                            {book.title}
                          </h5>
                          <p className="font-sans text-xs text-secondaryText truncate">
                            {book.author}
                          </p>
                          <span className="font-mono text-[8px] text-gold uppercase tracking-wider block mt-1">
                            {book.genre} • {book.year > 0 ? book.year : "BC"}
                          </span>
                        </div>
                        <BookOpen size={14} className="text-secondaryText group-hover:text-gold transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Open Library & Gutenberg Universal Archives */}
              <div>
                <div className="flex items-center space-x-3 mb-4 border-b border-customBorder pb-1">
                  <h4 className="font-serif text-xs text-gold uppercase tracking-[0.2em]">
                    Universal Digital Archives ({openLibraryResults.length})
                  </h4>
                  {loading && <Loader2 size={12} className="animate-spin text-gold" />}
                </div>
                
                {debouncedQuery.length <= 2 ? (
                  <p className="text-secondaryText/40 text-xs font-mono py-2">
                    Type at least 3 characters to search the global Open Library and Project Gutenberg registries.
                  </p>
                ) : openLibraryResults.length === 0 && !loading ? (
                  <p className="text-secondaryText/60 text-xs font-mono py-2">
                    No remote volumes returned for this register.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {openLibraryResults.map(book => (
                      <div
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        className="flex items-center space-x-4 p-3 bg-[#151515] hover:bg-[#222222] border border-customBorder hover:border-gold/30 rounded-lg cursor-pointer transition-all duration-300 group"
                      >
                        <img loading="lazy"
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded shadow border border-customBorder"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <h5 className="font-serif text-sm font-bold text-primaryText truncate">
                            {book.title}
                          </h5>
                          <p className="font-sans text-xs text-secondaryText truncate">
                            {book.author}
                          </p>
                          <span className="font-mono text-[8px] text-[#A5A5A5] uppercase tracking-wider block mt-1 flex items-center">
                            <Globe size={8} className="mr-1 text-gold" />
                            {book.genre} • {book.year}
                          </span>
                        </div>
                        <BookOpen size={14} className="text-secondaryText group-hover:text-gold transition-colors duration-300" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}