import React, { useState, useEffect } from "react";
import { FAMOUS_QUOTES } from "../services/booksDb";
import { Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuotesSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % FAMOUS_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const active = FAMOUS_QUOTES[index];

  return (
    <section className="py-24 px-6 md:px-12 bg-[#0B0B0B] border-t border-b border-customBorder/50 relative overflow-hidden text-center flex flex-col items-center justify-center">
      {/* Background Lighting */}
      <div className="absolute w-[600px] h-[300px] bg-radial-gold-glow pointer-events-none" />

      <div className="max-w-4xl mx-auto z-10 relative">
        <Quote size={40} className="text-gold/20 mx-auto mb-6" />

        <div className="min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="space-y-4"
            >
              <h3 className="font-serif text-2xl md:text-4xl italic leading-relaxed text-primaryText font-light">
                "{active.text}"
              </h3>
              <div className="flex items-center justify-center space-x-2 pt-4">
                <span className="w-6 h-[1px] bg-gold/50" />
                <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">
                  {active.author}
                </span>
                <span className="w-6 h-[1px] bg-gold/50" />
              </div>
              <span className="text-[10px] font-serif text-secondaryText italic block">
                From {active.book}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {FAMOUS_QUOTES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === index ? "bg-gold w-6" : "bg-customBorder hover:bg-gold/45"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}