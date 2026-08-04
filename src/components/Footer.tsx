import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#0B0B0B] border-t border-customBorder/60 py-16 px-6 md:px-12 mt-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#C9A227] opacity-[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        {/* Left Column - Brand & Philosophy */}
        <div className="flex flex-col space-y-4">
          <span className="font-serif text-3xl font-bold tracking-widest text-primaryText">
            STORYVAULT
          </span>
          <p className="text-secondaryText text-sm max-w-sm leading-relaxed font-sans">
            A digital sanctuary dedicated to public-domain literature. We celebrate timeless masterpieces as functional art, unlocking the great works of human imagination for readers everywhere.
          </p>
          <span className="text-[11px] font-mono text-gold tracking-widest uppercase mt-4 block">
            © 2026 STORYVAULT • PUBLIC DOMAIN PRESERVATION
          </span>
        </div>

        {/* Middle Column - Navigation and Info */}
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col space-y-3">
            <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">
              The Archives
            </span>
            <a href="#shelves-section" className="text-secondaryText hover:text-primaryText text-sm transition-colors duration-300">
              Wooden Shelves
            </a>
            <a href="#timeline" className="text-secondaryText hover:text-primaryText text-sm transition-colors duration-300">
              Literary Timeline
            </a>
            <a href="#authors" className="text-secondaryText hover:text-primaryText text-sm transition-colors duration-300">
              Author Profiles
            </a>
          </div>

          <div className="flex flex-col space-y-3">
            <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">
              Legality
            </span>
            <span className="text-secondaryText text-sm leading-relaxed">
              All books listed are certified public-domain documents in the United States and most other territories.
            </span>
          </div>
        </div>

        {/* Right Column - Newsletter Subscription */}
        <div className="flex flex-col space-y-4">
          <span className="font-serif text-xl font-bold text-primaryText">
            Join the Sanctuary
          </span>
          <p className="text-secondaryText text-sm leading-relaxed">
            Receive curated notifications when new historical transcripts are added to our digital archives.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex items-center mt-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface text-primaryText placeholder:text-secondaryText/50 border border-customBorder rounded-full py-3 px-5 pr-12 w-full text-sm font-sans focus:outline-none focus:border-gold transition-colors duration-300"
              required
            />
            <button
              type="submit"
              className="absolute right-1 p-2 bg-gold hover:bg-gold-hover text-background rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              {subscribed ? (
                <span className="text-xs px-2 font-mono font-bold uppercase">Sent</span>
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          </form>
          {subscribed && (
            <span className="text-xs font-mono text-gold animate-pulse">
              Thank you. You have been added to our literary registry.
            </span>
          )}
        </div>
      </div>

      {/* Decorative Golden Divider */}
      <div className="max-w-7xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-16" />
    </footer>
  );
}