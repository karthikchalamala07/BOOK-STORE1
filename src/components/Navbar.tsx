import React from "react";
import { Search, Heart, ShoppingBag, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavbarProps {
  onSearchClick: () => void;
  onWishlistClick: () => void;
  onCartClick: () => void;
  onHistoryClick: () => void;
  cartCount: number;
  wishlistCount: number;
}

export default function Navbar({
  onSearchClick,
  onWishlistClick,
  onCartClick,
  onHistoryClick,
  cartCount,
  wishlistCount
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isLibrary = location.pathname === "/library";
  const isAuthors = location.pathname === "/authors";
  const isAbout = location.pathname === "/about";
  const isVault = location.pathname === "/digital-vault";

  const handleNavClick = (page: "home" | "library" | "authors" | "about" | "vault", sectionId?: string) => {
    if (page === "home") {
      navigate("/");
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (page === "authors") {
      navigate("/authors");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "about") {
      navigate("/about");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "vault") {
      navigate("/digital-vault");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/library");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-panel h-20 border-b border-customBorder/50 flex items-center justify-between px-6 md:px-12">
      {/* Brand Logo */}
      <div 
        onClick={() => handleNavClick("home")}
        className="flex flex-col cursor-pointer group"
      >
        <span className="font-serif text-2xl font-bold tracking-widest text-primaryText group-hover:text-gold transition-colors duration-300">
          STORYVAULT
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-gold mt-0.5">
          Unlock Timeless Stories
        </span>
      </div>

      {/* Nav Navigation Links */}
      <div className="flex items-center space-x-8">
        <div className="hidden lg:flex items-center space-x-6">
          <button 
            onClick={() => handleNavClick("home")}
            className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 relative py-2 group cursor-pointer ${
              isHome ? "text-gold font-bold" : "text-secondaryText hover:text-gold"
            }`}
          >
            Home
            <span className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gold transition-transform duration-300 origin-left ${isHome ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
          </button>
          
          <button 
            onClick={() => handleNavClick("library")}
            className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 relative py-2 group cursor-pointer ${
              isLibrary ? "text-gold font-bold" : "text-secondaryText hover:text-gold"
            }`}
          >
            Library
            <span className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gold transition-transform duration-300 origin-left ${isLibrary ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
          </button>

          <button 
            onClick={() => handleNavClick("authors")}
            className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 relative py-2 group cursor-pointer ${
              isAuthors ? "text-gold font-bold" : "text-secondaryText hover:text-gold"
            }`}
          >
            Authors
            <span className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gold transition-transform duration-300 origin-left ${isAuthors ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
          </button>

          <button 
            onClick={() => handleNavClick("vault")}
            className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 relative py-2 group cursor-pointer ${
              isVault ? "text-gold font-bold" : "text-secondaryText hover:text-gold"
            }`}
          >
            Digital Vault
            <span className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gold transition-transform duration-300 origin-left ${isVault ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
          </button>

          <button 
            onClick={() => handleNavClick("library")}
            className="font-mono text-xs uppercase tracking-widest text-secondaryText hover:text-gold transition-colors duration-300 relative py-2 group cursor-pointer"
          >
            Categories
            <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </button>

          <button 
            onClick={() => handleNavClick("about")}
            className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 relative py-2 group cursor-pointer ${
              isAbout ? "text-gold font-bold" : "text-secondaryText hover:text-gold"
            }`}
          >
            About
            <span className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gold transition-transform duration-300 origin-left ${isAbout ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4 border-l border-customBorder/60 pl-6">
          <button
            onClick={onSearchClick}
            className="text-secondaryText hover:text-gold transition-colors duration-300 cursor-pointer p-2 hover:bg-surface rounded-full"
            title="Search Registry"
          >
            <Search size={18} />
          </button>
          
          <button
            onClick={onWishlistClick}
            className="text-secondaryText hover:text-gold transition-colors duration-300 cursor-pointer p-2 hover:bg-surface rounded-full relative"
            title="Wishlist"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-background text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onCartClick}
            className="text-secondaryText hover:text-gold transition-colors duration-300 cursor-pointer p-2 hover:bg-surface rounded-full relative"
            title="Shopping Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-background text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onHistoryClick}
            className="text-secondaryText hover:text-gold transition-colors duration-300 cursor-pointer p-2 hover:bg-surface rounded-full"
            title="Reading Logs"
          >
            <History size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
