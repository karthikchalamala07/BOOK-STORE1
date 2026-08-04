import React from "react";
import { Book, ReadingState } from "../types";
import { useBookstore } from "../context/useBookstore";
import { Clock, Star, BookOpen, Trash2, Award, Zap } from "lucide-react";

interface ReadingJourneyProps {
  history: ReadingState[];
  favorites: string[];
  localBooks: Book[];
  onBookSelect: (book: Book) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  onViewReceipt: (receipt: any) => void;
}

export default function ReadingJourney({
  history,
  favorites,
  localBooks,
  onBookSelect,
  toggleFavorite,
  clearHistory,
  onViewReceipt
}: ReadingJourneyProps) {
  const { receipts } = useBookstore();
  
  // Resolve books inside the history list
  const historyWithDetails = history.map(h => {
    const details = localBooks.find(b => b.id === h.bookId);
    return {
      ...h,
      details
    };
  }).filter(h => h.details !== undefined);

  const favoritedBooks = localBooks.filter(b => favorites.includes(b.id));

  // Calculate statistics
  const totalBooksStarted = history.length;
  const favoriteGenre = favoritedBooks.length > 0 
    ? favoritedBooks.reduce((acc, current) => {
        acc[current.genre] = (acc[current.genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : null;

  const topGenre = favoriteGenre 
    ? Object.entries(favoriteGenre).sort((a, b) => b[1] - a[1])[0][0]
    : "None Recorded";

  return (
    <section className="py-24 px-6 md:px-12 bg-background relative border-t border-customBorder/40">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-gold uppercase tracking-[0.25em] block mb-3">
            Personal Registry
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primaryText">
            Reading Journey & Statistics
          </h2>
          <p className="text-secondaryText text-sm max-w-md mx-auto mt-4 font-sans leading-relaxed">
            Review your digital progress, active bookmarks, favorite classics, and literary statistics.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Continue Reading (Active Bookmarks) */}
          <div className="bg-surface border border-customBorder/60 rounded-xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-customBorder/30">
                <h4 className="font-serif text-lg font-bold text-primaryText flex items-center">
                  <Clock size={16} className="text-gold mr-2" />
                  Continue Reading
                </h4>
              </div>
              
              {historyWithDetails.length === 0 ? (
                <div className="text-center py-12 text-secondaryText/60 font-mono text-xs border border-dashed border-customBorder rounded-lg">
                  No active bookmarks. Select a book from shelves to begin reading.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyWithDetails.slice(0, 2).map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onBookSelect(item.details!)}
                      className="flex items-center space-x-4 p-3 bg-[#151515] hover:bg-[#202020] border border-customBorder hover:border-gold/30 rounded-lg cursor-pointer transition-all duration-300 group"
                    >
                      <img loading="lazy" 
                        src={item.details!.coverUrl} 
                        alt={item.details!.title}
                        className="w-12 h-16 object-cover rounded shadow border border-customBorder" 
                      />
                      <div className="flex-1 text-left min-w-0">
                        <h5 className="font-serif text-sm font-bold text-primaryText truncate group-hover:text-gold transition-colors duration-300">
                          {item.details!.title}
                        </h5>
                        <p className="font-sans text-xs text-secondaryText truncate">
                          {item.details!.author}
                        </p>
                        <span className="font-mono text-[9px] text-gold uppercase tracking-wider block mt-1.5">
                          Chapter {item.currentChapterIndex + 1} • Page {item.currentPageIndex + 1}
                        </span>
                      </div>
                      <BookOpen size={14} className="text-secondaryText group-hover:text-gold transition-colors duration-300 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {historyWithDetails.length > 0 && (
              <button 
                onClick={() => onBookSelect(historyWithDetails[0].details!)}
                className="w-full mt-6 py-3 bg-gold hover:bg-gold-hover text-background font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-300 cursor-pointer shadow-gold-glow flex items-center justify-center"
              >
                Resume Latest Volume
              </button>
            )}
          </div>

          {/* Column 2: Favorites & Curator Picks */}
          <div className="bg-surface border border-customBorder/60 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-customBorder/30">
                <h4 className="font-serif text-lg font-bold text-primaryText flex items-center">
                  <Star size={16} className="text-gold mr-2" />
                  Your Favorites
                </h4>
                <span className="font-mono text-[10px] bg-[#2E2E2E] text-gold py-0.5 px-2.5 rounded-full font-bold">
                  {favoritedBooks.length}
                </span>
              </div>

              {favoritedBooks.length === 0 ? (
                <div className="text-center py-12 text-secondaryText/60 font-mono text-xs border border-dashed border-customBorder rounded-lg">
                  Archive empty. Click the star on book spines to build your collection.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {favoritedBooks.map(book => (
                    <div 
                      key={book.id}
                      onClick={() => onBookSelect(book)}
                      className="p-2.5 bg-[#151515] border border-customBorder hover:border-gold/30 rounded-lg flex items-center space-x-2.5 cursor-pointer hover:bg-[#202020] transition-all duration-300 group"
                    >
                      <img loading="lazy" 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-8 h-11 object-cover rounded shadow"
                      />
                      <div className="text-left min-w-0 flex-1">
                        <h6 className="font-serif text-xs font-bold text-primaryText truncate group-hover:text-gold transition-colors duration-300">
                          {book.title}
                        </h6>
                        <span className="text-[9px] font-sans text-secondaryText block truncate">
                          {book.author}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {favoritedBooks.length > 0 && (
              <span className="text-[10px] font-mono text-secondaryText text-center block mt-4 italic">
                * Starred books are saved locally.
              </span>
            )}
          </div>

          {/* Column 3: Stats Dashboard */}
          <div className="bg-surface border border-customBorder/60 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-customBorder/30">
                <h4 className="font-serif text-lg font-bold text-primaryText flex items-center">
                  <Award size={16} className="text-gold mr-2" />
                  Reading Stats
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Stat Card 1 */}
                <div className="p-4 bg-[#151515] border border-customBorder rounded-lg text-left">
                  <span className="text-secondaryText font-mono text-[9px] uppercase tracking-wider block">
                    Books Read / Started
                  </span>
                  <span className="font-serif text-2xl font-bold text-primaryText mt-1 block flex items-center space-x-1.5">
                    <Zap size={16} className="text-gold" />
                    <span>{totalBooksStarted}</span>
                  </span>
                </div>

                {/* Stat Card 2 */}
                <div className="p-4 bg-[#151515] border border-customBorder rounded-lg text-left">
                  <span className="text-secondaryText font-mono text-[9px] uppercase tracking-wider block">
                    Favorite Genre
                  </span>
                  <span className="font-serif text-base font-bold text-gold mt-2 block truncate">
                    {topGenre}
                  </span>
                </div>
              </div>

              {/* Progress Ring / Log Display */}
              <div className="mt-6 p-4 bg-[#151515] border border-customBorder rounded-lg text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-secondaryText font-mono text-[9px] uppercase tracking-wider">
                    Recent History Log
                  </span>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-secondaryText hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Clear History"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <span className="text-secondaryText/40 text-[10px] font-mono block">
                    No registry log found.
                  </span>
                ) : (
                  <div className="space-y-2 max-h-[90px] overflow-y-auto pr-1">
                    {historyWithDetails.map((h, index) => (
                      <div key={index} className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-primaryText truncate max-w-[150px]">
                          {h.details?.title}
                        </span>
                        <span className="text-gold shrink-0">
                          {new Date(h.lastReadTime).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Acquired Invoices & Receipts */}
        <div className="mt-16 bg-surface border border-customBorder/60 rounded-xl p-6 shadow-xl text-left no-print">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-customBorder/30">
            <h4 className="font-serif text-lg font-bold text-primaryText flex items-center">
              <Clock size={16} className="text-gold mr-2" />
              Acquired Receipts & Invoices
            </h4>
            <span className="font-mono text-[10px] bg-[#2E2E2E] text-gold py-0.5 px-2.5 rounded-full font-bold">
              {receipts && receipts.length}
            </span>
          </div>

          {(!receipts || receipts.length === 0) ? (
            <div className="text-center py-12 text-secondaryText/60 font-mono text-xs border border-dashed border-customBorder rounded-lg">
              No purchase invoices registered in your customer profile yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-customBorder/40 text-secondaryText uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-2">Invoice / Code</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Items / Format</th>
                    <th className="py-3">Amount Paid</th>
                    <th className="py-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBorder/30">
                  {receipts.map((rcp, idx) => {
                    const titles = rcp.books ? rcp.books.map((b: any) => b.title).join(", ") : "Book Details";
                    const format = rcp.bookType || "N/A";
                    
                    return (
                      <tr key={idx} className="hover:bg-[#151515] transition-colors">
                        <td className="py-4 px-2 font-bold text-primaryText">
                          {rcp.receiptNumber || rcp.digitalAccessCode || `RCP-${rcp.orderId}`}
                        </td>
                        <td className="py-4 text-secondaryText">
                          {new Date(rcp.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-primaryText max-w-[200px] truncate" title={titles}>
                          {titles} ({format === "Digital" ? "💻 eBook" : format === "Physical" ? "📚 Hardcover" : "📦 Mixed"})
                        </td>
                        <td className="py-4 text-gold font-bold">
                          ${rcp.amount.toFixed(2)}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => onViewReceipt(rcp)}
                            className="py-1 px-3 border border-gold hover:bg-gold/15 text-gold font-mono text-[9px] uppercase font-bold tracking-wider rounded cursor-pointer transition-colors"
                          >
                            View & Download
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}