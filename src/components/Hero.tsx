import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { FAMOUS_QUOTES } from "../services/booksDb";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Rotate quotes every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % FAMOUS_QUOTES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const activeQuote = FAMOUS_QUOTES[quoteIndex];

  const handleMouseMove = (e: React.MouseEvent) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Pull intensity
    setMagneticPos({ x: x * 0.28, y: y * 0.28 });
  };

  const handleMouseLeave = () => {
    setMagneticPos({ x: 0, y: 0 });
  };

  const handleExploreClick = () => {
    navigate("/library");
  };

  return (
    <section className="min-h-screen pt-28 pb-16 px-6 md:px-12 flex items-center bg-background relative overflow-hidden select-none">
      
      {/* Background radial spotlight flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-radial-gold-glow pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
        
        {/* Left Side: Typography */}
        <div className="space-y-8 text-left">
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-mono text-xs text-gold uppercase tracking-[0.3em] block mb-4"
            >
              Unlock Timeless Stories
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-serif text-5xl md:text-7xl font-bold text-primaryText leading-[1.1] tracking-tight"
            >
              Where Literature <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryText via-gold to-primaryText">
                Breathes.
              </span>
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-secondaryText text-base md:text-lg max-w-lg leading-relaxed font-sans"
          >
            Explore the world's greatest public-domain classics through an immersive, cinematic reading experience designed as a digital literary sanctuary.
          </motion.p>

          {/* Magnetic CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              ref={buttonRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ x: magneticPos.x, y: magneticPos.y }}
              transition={{ type: "spring", stiffness: 120, damping: 15, mass: 0.1 }}
              onClick={handleExploreClick}
              className="bg-transparent text-primaryText border border-gold/40 hover:border-gold hover:text-background hover:bg-gold py-4 px-10 rounded-full font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center space-x-3 cursor-pointer shadow-gold-glow hover:shadow-gold-glow-lg group"
            >
              <BookOpen size={14} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Explore Library</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right Side: Floating 3D Book */}
        <div className="flex justify-center items-center h-[500px] relative">
          
          {/* Subtle gold spotlight circle */}
          <div className="absolute w-[350px] h-[350px] bg-gold opacity-[0.04] rounded-full blur-[80px] pointer-events-none" />

          {/* 3D Book Canvas Container */}
          <motion.div
            animate={{
              y: [-12, 12, -12],
              rotateZ: [-1, 1, -1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="perspective-1500 w-[280px] h-[380px] relative"
          >
            <div 
              className="relative w-full h-full transform-style-3d transition-transform duration-[1200ms]"
              style={{
                transform: bookOpen ? "rotateX(15deg) rotateY(-20deg)" : "rotateX(12deg) rotateY(-5deg)",
              }}
            >
              {/* Back Book Cover */}
              <div 
                className="absolute inset-0 rounded-r-md border border-[#2E2E2E] shadow-2xl origin-left"
                style={{
                  backgroundColor: "#161616",
                  transform: bookOpen ? "rotateY(0deg) translateZ(-4px)" : "rotateY(0deg)",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.85)"
                }}
              />

              {/* Stacked Pages Inner */}
              <div
                className="absolute inset-y-1.5 left-1 right-2 bg-[#FAF6EE] rounded-r shadow-inner origin-left paper-texture transform-style-3d"
                style={{
                  transform: "translateZ(-2px)",
                }}
              >
                {/* Book Text rendering when open */}
                <AnimatePresence>
                  {bookOpen && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 grid grid-cols-2 p-5 text-[#111111]"
                    >
                      {/* Left Page content */}
                      <div className="border-r border-black/10 pr-3 flex flex-col justify-between py-4 text-left h-full">
                        <div>
                          <span className="font-mono text-[7px] uppercase tracking-wider text-[#C9A227]">
                            SV Museum
                          </span>
                          <p className="text-[9px] font-sans text-black/70 leading-relaxed mt-4 font-medium">
                            A curated archival display of historical texts, preserved in original formatting.
                          </p>
                        </div>
                        <span className="text-[8px] font-mono text-black/40">Page VII</span>
                      </div>

                      {/* Right Page (Famous Quote Content) */}
                      <div className="pl-3 flex flex-col justify-center py-4 text-left h-full">
                        <span className="text-xs font-serif italic text-black/80 font-bold leading-normal block">
                          "{activeQuote.text}"
                        </span>
                        <span className="text-[9px] font-mono text-[#C9A227] tracking-wider uppercase font-semibold mt-2 block">
                          — {activeQuote.author}
                        </span>
                        <span className="text-[7px] font-serif text-black/50 block italic">
                          From {activeQuote.book}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Front Book Cover */}
              <div 
                className="absolute inset-0 rounded-r-md border border-[#2E2E2E] origin-left transform-style-3d transition-transform duration-[1200ms] cursor-pointer"
                onClick={() => setBookOpen(!bookOpen)}
                style={{
                  backgroundColor: "#1F1F1F",
                  backgroundImage: "radial-gradient(circle at center, rgba(201, 162, 39, 0.05) 0%, transparent 80%)",
                  transform: bookOpen ? "rotateY(-160deg)" : "rotateY(0deg)",
                  zIndex: bookOpen ? 5 : 10,
                  boxShadow: bookOpen ? "0 10px 30px rgba(0,0,0,0.5)" : "0 25px 45px rgba(0,0,0,0.7)"
                }}
              >
                {/* Embossed Gold Stamp */}
                <div className="absolute inset-4 border border-[#C9A227]/25 flex flex-col justify-between items-center py-10 px-4">
                  <span className="text-[8px] font-mono text-gold tracking-widest uppercase">
                    First Edition
                  </span>
                  
                  <div className="text-center">
                    <span className="font-serif text-5xl text-gold font-bold italic leading-none">
                      S
                    </span>
                    <span className="text-[11px] font-mono tracking-widest text-primaryText block mt-3">
                      STORYVAULT
                    </span>
                  </div>

                  <span className="text-[8px] font-mono text-secondaryText tracking-widest uppercase">
                    Preserved Classic
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
