import React, { useRef } from "react";
import { TIMELINE_EVENTS } from "../services/booksDb";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { Book } from "../types";

interface LiteraryTimelineProps {
  onBookSelect: (bookId: string) => void;
  localBooks: Book[];
}

export default function LiteraryTimeline({ onBookSelect, localBooks }: LiteraryTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth * 0.4 
        : scrollLeft + clientWidth * 0.4;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleTimelineItemClick = (bookId: string) => {
    // If the book exists locally, select it
    onBookSelect(bookId);
  };

  return (
    <section id="timeline" className="py-24 px-6 md:px-12 bg-[#0B0B0B] border-t border-b border-customBorder/50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227] opacity-[0.01] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="text-left">
            <span className="font-mono text-xs text-gold uppercase tracking-[0.25em] block mb-3">
              Chronicles of Thought
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primaryText">
              Literary Timeline
            </h2>
            <p className="text-secondaryText text-sm max-w-md mt-4 font-sans leading-relaxed">
              Trace the evolution of public-domain literature, from early strategic treatises to the rise of gothic horror.
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex space-x-3 mt-6 md:mt-0">
            <button
              onClick={() => scroll("left")}
              className="p-3 border border-customBorder hover:border-gold text-secondaryText hover:text-gold rounded-full transition-all duration-300 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 border border-customBorder hover:border-gold text-secondaryText hover:text-gold rounded-full transition-all duration-300 cursor-pointer"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Horizontal Timeline Scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-12 pb-10 scrollbar-none snap-x relative"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Central Line connecting items */}
          <div className="absolute left-0 right-0 top-[60px] h-[1px] bg-gradient-to-r from-transparent via-gold/45 to-transparent z-0 pointer-events-none" />

          {TIMELINE_EVENTS.map((event, idx) => {
            const bookDetails = localBooks.find(b => b.id === event.bookId);
            
            return (
              <div 
                key={idx}
                className="min-w-[280px] md:min-w-[340px] snap-start relative z-10 flex flex-col items-center text-center group"
              >
                {/* Year Indicator Node */}
                <div className="w-14 h-14 rounded-full bg-surface border-2 border-customBorder group-hover:border-gold flex items-center justify-center mb-6 shadow-lg transition-all duration-500 transform group-hover:scale-110 z-10 relative">
                  <Calendar size={16} className="text-secondaryText group-hover:text-gold transition-colors duration-300" />
                  {/* Subtle pulsing glow */}
                  <div className="absolute inset-0 rounded-full border border-gold opacity-0 group-hover:opacity-40 animate-ping" />
                </div>

                {/* Timeline Box Content */}
                <div 
                  onClick={() => handleTimelineItemClick(event.bookId)}
                  className="bg-surface border border-customBorder group-hover:border-gold/30 p-6 rounded-lg shadow-xl text-left w-full cursor-pointer hover:shadow-gold-glow/5 transition-all duration-300"
                >
                  <span className="font-mono text-2xl font-bold text-gold tracking-wider">
                    {event.year > 0 ? event.year : `${Math.abs(event.year)} BC`}
                  </span>
                  
                  <h4 className="font-serif text-lg font-bold text-primaryText mt-2 leading-snug group-hover:text-gold transition-colors duration-300">
                    {event.title}
                  </h4>
                  
                  <span className="text-[10px] font-mono text-secondaryText uppercase tracking-wider block mt-1">
                    {event.author}
                  </span>

                  <p className="text-secondaryText/80 text-xs mt-3 leading-relaxed font-sans">
                    {event.description}
                  </p>

                  {/* Related Book Cover Preview */}
                  {bookDetails && (
                    <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-customBorder/50">
                      <img loading="lazy" 
                        src={bookDetails.coverUrl} 
                        alt={bookDetails.title} 
                        className="w-8 h-11 object-cover rounded shadow"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-gold uppercase tracking-wider block">
                          Read Preserved Volume
                        </span>
                        <span className="text-xs font-serif font-bold text-primaryText block truncate">
                          {bookDetails.title}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}