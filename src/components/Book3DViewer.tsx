import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Type, Loader2, Star, ShoppingCart, Lock, Sparkles, BookOpen, Search, FileText, Palette, Sun, Moon, Plus, Trash2 } from "lucide-react";
import { Book, Chapter } from "../types";
import { fetchGutenbergBook } from "../services/api";
import { useBookstore } from "../context/useBookstore";
import { getBookPricing } from "../services/booksDb";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

interface Book3DViewerProps {
  book: Book;
  onClose: () => void;
  onBookmarkAdd: (bookId: string, chapterIndex: number, pageIndex: number) => void;
  onBookmarkRemove: (bookId: string) => void;
  isBookmarked: boolean;
  savedBookmark: { chapterIndex: number; pageIndex: number } | null;
  onProgressUpdate: (bookId: string, chapterIndex: number, pageIndex: number) => void;
}

type ThemeMode = "light" | "sepia" | "dark";

export default function Book3DViewer({
  book,
  onClose,
  onBookmarkAdd,
  onBookmarkRemove,
  isBookmarked,
  savedBookmark,
  onProgressUpdate
}: Book3DViewerProps) {
  // Pre-loading states
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [chaptersLoaded, setChaptersLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chapters data
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  // Animation/Reader states
  const [currentPage, setCurrentPage] = useState(0); 
  const [isFlipping, setIsFlipping] = useState<"next" | "prev" | null>(null);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [theme, setTheme] = useState<ThemeMode>("sepia");

  // Advanced features: Notes & Search
  const [notes, setNotes] = useState<{ id: string; pageIndex: number; text: string; createdAt: string }[]>([]);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // E-commerce hooks
  const { purchasedBooks, addToCart, toggleWishlist, isInWishlist, addToast } = useBookstore();
  const pricing = getBookPricing(book.id);
  const isPurchased = purchasedBooks.includes(book.id);

  // Timer State (5 minutes = 300 seconds)
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [showWarning, setShowWarning] = useState(false);
  const [previewExpired, setPreviewExpired] = useState(false);

  // 1. Load fonts
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    }).catch(() => {
      setFontsLoaded(true);
    });
  }, []);

  // 2. Load cover image
  useEffect(() => {
    if (!book.coverUrl) {
      setCoverFailed(true);
      setCoverLoaded(true);
      return;
    }
    const img = new Image();
    img.src = book.coverUrl;
    img.onload = () => {
      setCoverLoaded(true);
    };
    img.onerror = () => {
      setCoverFailed(true);
      setCoverLoaded(true);
    };
  }, [book.coverUrl]);

  // 3. Load chapters (Preview Mode: Only load limited previewContent)
  useEffect(() => {
    async function loadContent() {
      const preview = book.previewContent || book.chapters || [];
      setChapters(preview);
      setChaptersLoaded(true);
    }
    loadContent();
  }, [book]);

  // 4. Resolve overall loading state
  useEffect(() => {
    if (coverLoaded && fontsLoaded && chaptersLoaded) {
      const t = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [coverLoaded, fontsLoaded, chaptersLoaded]);

  // 5. Structure final flat pages array
  const bookPages = useMemo(() => {
    if (chapters.length === 0) return [];
    
    const list: {
      type: "cover" | "inside-cover" | "title-page" | "content" | "back-cover";
      chapterTitle?: string;
      chapterIndex?: number;
      pageIndex?: number;
      content?: string[];
    }[] = [];
    
    // Page 0: Front Cover
    list.push({ type: "cover" });
    
    // Page 1: Inside Cover
    list.push({ type: "inside-cover" });
    
    // Page 2: Title Page
    list.push({ type: "title-page" });
    
    // Page 3+: Book Content pages
    chapters.forEach((chap, chapIdx) => {
      const paragraphs = chap.content;
      const itemsPerPage = fontSize === "small" ? 4 : fontSize === "medium" ? 3 : 2;
      
      let pIdx = 0;
      for (let i = 0; i < paragraphs.length; i += itemsPerPage) {
        list.push({
          type: "content",
          chapterTitle: chap.title,
          chapterIndex: chapIdx,
          pageIndex: pIdx,
          content: paragraphs.slice(i, i + itemsPerPage)
        });
        pIdx += itemsPerPage;
      }
    });
    
    // Ensure pages list after front cover is even so back cover aligns correctly
    if (list.length % 2 === 0) {
      list.push({
        type: "content",
        chapterTitle: "End of Volume",
        chapterIndex: chapters.length - 1,
        pageIndex: 9999,
        content: [""]
      });
    }
    
    // Page Last: Back Cover
    list.push({ type: "back-cover" });
    
    return list;
  }, [chapters, fontSize]);

  // Load Notes from user library
  useEffect(() => {
    const localLib = JSON.parse(localStorage.getItem("storyvault_user_library") || "[]");
    const uid = JSON.parse(localStorage.getItem("storyvault_current_user") || '{"uid":"guest"}').uid || "guest";
    const found = localLib.find((item: any) => item.bookId === book.id && item.userId === uid);
    if (found && found.notes) {
      setNotes(found.notes);
    }
  }, [book.id]);

  // Restore saved bookmark progress
  useEffect(() => {
    if (!loading && bookPages.length > 0 && savedBookmark) {
      const foundIdx = bookPages.findIndex(
        p => p.type === "content" && 
             p.chapterIndex === savedBookmark.chapterIndex && 
             p.pageIndex === savedBookmark.pageIndex
      );
      if (foundIdx !== -1) {
        setCurrentPage(foundIdx % 2 === 0 ? foundIdx - 1 : foundIdx);
      } else {
        setCurrentPage(1); 
      }
    } else if (!loading && bookPages.length > 0) {
      setCurrentPage(0); 
    }
  }, [loading, bookPages, savedBookmark]);

  // Preview countdown timer effect
  useEffect(() => {
    if (loading || isPurchased || currentPage === 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPreviewExpired(true);
          return 0;
        }
        if (prev === 61) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 8000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isPurchased, currentPage]);

  // Progress saver hook
  useEffect(() => {
    if (!loading && currentPage >= 1 && bookPages.length > 0) {
      const activePage = bookPages[currentPage];
      if (activePage && activePage.type === "content") {
        onProgressUpdate(book.id, activePage.chapterIndex || 0, activePage.pageIndex || 0);
      }
    }
  }, [currentPage, loading, bookPages, book.id]);

  const handleNextPage = () => {
    if (previewExpired || isFlipping) return;
    
    if (currentPage === 0) {
      setIsFlipping("next");
      setTimeout(() => {
        setCurrentPage(1);
        setIsFlipping(null);
      }, 700);
    } else if (currentPage + 2 < bookPages.length) {
      setIsFlipping("next");
      setTimeout(() => {
        setCurrentPage(prev => prev + 2);
        setIsFlipping(null);
      }, 700);
    }
  };

  const handlePrevPage = () => {
    if (previewExpired || isFlipping) return;
    
    if (currentPage === 1) {
      setIsFlipping("prev");
      setTimeout(() => {
        setCurrentPage(0);
        setIsFlipping(null);
      }, 700);
    } else if (currentPage - 2 >= 1) {
      setIsFlipping("prev");
      setTimeout(() => {
        setCurrentPage(prev => prev - 2);
        setIsFlipping(null);
      }, 700);
    }
  };

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      onBookmarkRemove(book.id);
    } else {
      const activePage = bookPages[currentPage];
      if (activePage && activePage.type === "content") {
        onBookmarkAdd(book.id, activePage.chapterIndex || 0, activePage.pageIndex || 0);
      } else {
        onBookmarkAdd(book.id, 0, 0);
      }
    }
  };

  const triggerCloseAnimation = () => {
    setCurrentPage(0);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const fontClass = fontSize === "small" 
    ? "text-xs md:text-sm leading-relaxed" 
    : fontSize === "medium" 
    ? "text-sm md:text-base leading-relaxed" 
    : "text-base md:text-lg leading-loose";

  // Resolve search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results: { pageIdx: number; chapterTitle: string; snippet: string }[] = [];
    bookPages.forEach((page, idx) => {
      if (page.type === "content" && page.content) {
        const matchingPara = page.content.find(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
        if (matchingPara) {
          const idxOf = matchingPara.toLowerCase().indexOf(searchQuery.toLowerCase());
          const start = Math.max(0, idxOf - 30);
          const end = Math.min(matchingPara.length, idxOf + 50);
          const snippet = (start > 0 ? "..." : "") + matchingPara.substring(start, end) + (end < matchingPara.length ? "..." : "");
          
          results.push({
            pageIdx: idx,
            chapterTitle: page.chapterTitle || "Content",
            snippet
          });
        }
      }
    });
    return results;
  }, [searchQuery, bookPages]);

  // Margin Notes triggers
  const handleSaveNote = () => {
    if (!activeNoteText.trim()) return;
    
    const id = `NTE-${Date.now()}`;
    const newNote = {
      id,
      pageIndex: currentPage,
      text: activeNoteText,
      createdAt: new Date().toISOString()
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setActiveNoteText("");
    setShowNoteForm(false);
    
    // Save to local storage userLibrary list
    const localLib = JSON.parse(localStorage.getItem("storyvault_user_library") || "[]");
    const uid = JSON.parse(localStorage.getItem("storyvault_current_user") || '{"uid":"guest"}').uid || "guest";
    const updatedLib = localLib.map((item: any) => {
      if (item.userId === uid && item.bookId === book.id) {
        return {
          ...item,
          notes: updatedNotes
        };
      }
      return item;
    });
    localStorage.setItem("storyvault_user_library", JSON.stringify(updatedLib));

    // Save to Firestore userLibrary subcollection document
    try {
      const userId = auth.currentUser?.uid || "guest";
      updateDoc(doc(db, "userLibrary", `${userId}_${book.id}`), {
        notes: updatedNotes
      });
    } catch (e) {
      console.warn("Firestore notes save failed:", e);
    }
    
    addToast({
      title: "✓ Note Preserved",
      message: "Margin note has been preserved successfully."
    });
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    
    // Sync local
    const localLib = JSON.parse(localStorage.getItem("storyvault_user_library") || "[]");
    const uid = JSON.parse(localStorage.getItem("storyvault_current_user") || '{"uid":"guest"}').uid || "guest";
    const updatedLib = localLib.map((item: any) => {
      if (item.userId === uid && item.bookId === book.id) {
        return { ...item, notes: updatedNotes };
      }
      return item;
    });
    localStorage.setItem("storyvault_user_library", JSON.stringify(updatedLib));

    // Sync Firestore
    try {
      const userId = auth.currentUser?.uid || "guest";
      updateDoc(doc(db, "userLibrary", `${userId}_${book.id}`), { notes: updatedNotes });
    } catch (e) {
      console.warn("Firestore notes update failed:", e);
    }
  };

  const isFavorited = isInWishlist(book.id);

  // Theme styling mapper
  const getThemeClasses = () => {
    if (theme === "light") {
      return {
        bg: "bg-white",
        text: "text-[#111111]",
        line: "border-black/5",
        creaseLeft: "page-shadow-right-light",
        creaseRight: "page-shadow-left-light",
        paperTexture: "paper-texture-light"
      };
    }
    if (theme === "dark") {
      return {
        bg: "bg-[#181818]",
        text: "text-[#dddddd]",
        line: "border-white/5",
        creaseLeft: "page-shadow-right-dark",
        creaseRight: "page-shadow-left-dark",
        paperTexture: "paper-texture-dark"
      };
    }
    // Sepia
    return {
      bg: "bg-[#faf4e6]",
      text: "text-[#222222]",
      line: "border-gold/15",
      creaseLeft: "page-shadow-right",
      creaseRight: "page-shadow-left",
      paperTexture: "paper-texture"
    };
  };

  const themeStyles = getThemeClasses();

  // Render individual page content helper
  const renderPage = (page: any, index: number) => {
    if (!page) return null;

    if (page.type === "inside-cover") {
      return (
        <div className={`w-full h-full flex flex-col justify-between border ${themeStyles.line} p-6 rounded-md ${themeStyles.bg} ${themeStyles.paperTexture} select-none text-left`}>
          <div className="text-center font-mono text-[9px] text-gold uppercase tracking-[0.25em]">
            StoryVault Codex Archive
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mb-2">
              <Sparkles size={20} className="text-gold" />
            </div>
            <span className="font-serif italic text-xs text-secondaryText">Ex Libris</span>
            <h4 className="font-serif text-lg font-bold text-gold tracking-widest uppercase">
              StoryVault
            </h4>
            <span className="w-16 h-[1px] bg-gold/30" />
            <p className="font-mono text-[8px] text-[#A5A5A5] uppercase tracking-widest">
              Digital Preservation Sanctuary
            </p>
          </div>

          <div className="text-center font-mono text-[8px] text-gold/40">
            STORYVAULT
          </div>
        </div>
      );
    }

    if (page.type === "title-page") {
      return (
        <div className={`w-full h-full flex flex-col justify-between border ${themeStyles.line} p-6 rounded-md ${themeStyles.bg} ${themeStyles.paperTexture} select-none text-left`}>
          <div className="text-center font-mono text-[9px] text-gold uppercase tracking-[0.25em]">
            Timeless Literature Volume
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center text-center space-y-4">
            <h1 className={`font-serif text-2xl md:text-3xl font-bold ${themeStyles.text} leading-tight tracking-wide`}>
              {book.title}
            </h1>
            <span className="w-12 h-[1px] bg-gold/40" />
            <p className="font-serif italic text-sm text-secondaryText">
              by {book.author}
            </p>
            <div className="flex items-center space-x-3 font-mono text-[8px] text-gold/50 uppercase tracking-widest pt-2">
              <span>{book.genre}</span>
              <span>•</span>
              <span>{book.year < 0 ? `${Math.abs(book.year)} BC` : book.year}</span>
            </div>
          </div>

          <div className="text-center font-mono text-[8px] text-gold/40 uppercase tracking-widest">
            First Codex edition
          </div>
        </div>
      );
    }

    if (page.type === "content") {
      const pageNotes = notes.filter(n => n.pageIndex === index);

      return (
        <div className={`w-full h-full flex flex-col justify-between text-left ${themeStyles.text}`}>
          <div className={`flex justify-between items-center border-b ${themeStyles.line} pb-2 text-[10px] uppercase font-mono tracking-widest text-[#888] select-none`}>
            <span className="truncate max-w-[150px]">{book.title}</span>
            <span className="truncate max-w-[150px]">{page.chapterTitle}</span>
          </div>

          <div className="flex-1 mt-6 overflow-y-auto pr-2 scrollbar-thin">
            <div className={`space-y-4 font-serif ${fontClass}`}>
              {page.content?.map((para: string, pIdx: number) => (
                <p key={pIdx} className="indent-4 leading-relaxed text-justify">
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className={`flex justify-between items-center text-[10px] font-mono text-secondaryText pt-4 border-t ${themeStyles.line} select-none`}>
            <span>Page {index}</span>
            <div className="flex items-center space-x-2">
              {pageNotes.map(n => (
                <div 
                  key={n.id} 
                  className="w-4.5 h-4.5 rounded bg-gold/15 border border-gold/30 flex items-center justify-center cursor-pointer"
                  title="View Margin Note"
                  onClick={() => alert(`Note for Page ${index}:\n"${n.text}"`)}
                >
                  <FileText size={10} className="text-gold" />
                </div>
              ))}
              <span>StoryVault Preserves</span>
            </div>
          </div>
        </div>
      );
    }

    if (page.type === "back-cover") {
      return (
        <div className={`w-full h-full flex flex-col justify-between border-4 border-double border-gold/20 p-8 rounded-md ${themeStyles.bg} ${themeStyles.paperTexture} select-none text-left`}>
          <div className="text-center font-mono text-[9px] text-gold uppercase tracking-[0.25em]">
            End of volume
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center mb-2">
              <Sparkles size={24} className="text-gold" />
            </div>
            <h4 className="font-serif text-base font-bold text-gold tracking-widest uppercase">
              StoryVault
            </h4>
            <span className="w-12 h-[1px] bg-gold/30" />
            <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-widest max-w-[180px] leading-relaxed mx-auto">
              Preserved in public domain literature archive
            </p>
          </div>

          <div className="text-center font-mono text-[8px] text-gold/40">
            STORYVAULT.COM
          </div>
        </div>
      );
    }

    return null;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0c0c] flex flex-col items-center justify-center space-y-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <Loader2 className="text-gold animate-spin" size={32} />
        </div>
        <div className="text-center space-y-2">
          <span className="font-mono text-[10px] text-gold uppercase tracking-[0.25em] block">
            STORYVAULT ARCHIVE
          </span>
          <h3 className="font-serif text-sm font-bold text-primaryText uppercase tracking-wider animate-pulse">
            Opening Historical Codex...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/95 backdrop-blur-md flex items-center justify-center overflow-hidden">
      
      {/* 60s WARNING FLOATING TOAST */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-surface border border-gold/40 text-primaryText rounded-xl p-4 shadow-gold-glow max-w-sm w-full text-center"
          >
            <span className="font-serif text-sm font-bold text-gold block mb-1">
              Enjoying this book?
            </span>
            <p className="font-sans text-xs text-secondaryText">
              Purchase the complete edition to continue reading when the trial expires.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER CONTROLS */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-40 bg-gradient-to-b from-[#111] to-transparent pointer-events-none">
        <button
          onClick={triggerCloseAnimation}
          className="flex items-center space-x-2 text-secondaryText hover:text-gold pointer-events-auto cursor-pointer font-mono text-xs uppercase tracking-widest bg-surface/50 border border-customBorder py-2 px-5 rounded-full"
        >
          <ArrowLeft size={14} />
          <span>Exit Vault</span>
        </button>

        {/* Reader Console Options */}
        {currentPage > 0 && (
          <div className="flex items-center space-x-6 pointer-events-auto">
            {!isPurchased && (
              <div className="flex items-center space-x-3 bg-surface/80 border border-gold/30 px-4 py-1.5 rounded-full">
                <span className="font-mono text-[9px] uppercase tracking-wider text-secondaryText">
                  Preview Remaining:
                </span>
                <span className={`font-mono text-sm font-bold ${secondsLeft <= 60 ? "text-red-500 animate-pulse" : "text-gold"}`}>
                  {formatTime(secondsLeft)}
                </span>
              </div>
            )}

            {isPurchased && (
              <div className="flex items-center space-x-2 bg-gold/10 border border-gold/35 px-4 py-1.5 rounded-full text-gold">
                <span className="font-mono text-[9px] uppercase tracking-wider">
                  Vault Activated
                </span>
              </div>
            )}

            {/* Reading theme selector */}
            <div className="flex items-center bg-surface/50 border border-customBorder px-2.5 py-1 rounded-full text-secondaryText">
              <Palette size={12} className="text-secondaryText mr-2" />
              <button 
                onClick={() => setTheme("light")} 
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors ${theme === "light" ? "bg-white text-black font-bold" : ""}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme("sepia")} 
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors ${theme === "sepia" ? "bg-[#faf4e6] text-[#222] font-bold" : ""}`}
              >
                Sepia
              </button>
              <button 
                onClick={() => setTheme("dark")} 
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors ${theme === "dark" ? "bg-black text-[#eee] font-bold" : ""}`}
              >
                Dark
              </button>
            </div>

            {/* Book text search toggler */}
            <button
              onClick={() => { setShowSearchPanel(!showSearchPanel); setShowNotesPanel(false); }}
              className={`p-2 border rounded-full cursor-pointer transition-colors ${showSearchPanel ? "bg-gold/10 border-gold text-gold" : "bg-surface/50 border-customBorder text-secondaryText hover:text-gold"}`}
              title="Search Book Text"
            >
              <Search size={14} />
            </button>

            {/* Notes panel toggler */}
            <button
              onClick={() => { setShowNotesPanel(!showNotesPanel); setShowSearchPanel(false); }}
              className={`p-2 border rounded-full cursor-pointer transition-colors ${showNotesPanel ? "bg-gold/10 border-gold text-gold" : "bg-surface/50 border-customBorder text-secondaryText hover:text-gold"}`}
              title="Margin Notes"
            >
              <FileText size={14} />
            </button>

            {/* Font size selectors */}
            <div className="flex items-center space-x-2 bg-surface/50 border border-customBorder px-3 py-1 rounded-full">
              <Type size={12} className="text-secondaryText" />
              <button 
                onClick={() => { setFontSize("small"); setCurrentPage(1); }}
                className={`text-[10px] font-mono p-1 ${fontSize === "small" ? "text-gold font-bold" : "text-secondaryText"}`}
              >
                A-
              </button>
              <button 
                onClick={() => { setFontSize("medium"); setCurrentPage(1); }}
                className={`text-xs font-mono p-1 ${fontSize === "medium" ? "text-gold font-bold" : "text-secondaryText"}`}
              >
                A
              </button>
              <button 
                onClick={() => { setFontSize("large"); setCurrentPage(1); }}
                className={`text-sm font-mono p-1 ${fontSize === "large" ? "text-gold font-bold" : "text-secondaryText"}`}
              >
                A+
              </button>
            </div>

            <button
              onClick={handleBookmarkToggle}
              className="p-2 bg-surface/50 border border-customBorder rounded-full text-secondaryText hover:text-gold cursor-pointer"
            >
              {isBookmarked ? <BookmarkCheck size={16} className="text-gold" /> : <Bookmark size={16} />}
            </button>
          </div>
        )}
      </div>

      {/* ADVANCED SIDEBAR: Search / Notes Panels */}
      <AnimatePresence>
        {showSearchPanel && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute left-6 top-24 bottom-24 w-80 bg-surface border border-customBorder rounded-2xl p-6 z-40 shadow-2xl flex flex-col justify-between"
          >
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="font-serif text-sm font-bold text-gold uppercase tracking-wider border-b border-customBorder/30 pb-3 mb-4 flex items-center">
                <Search size={14} className="mr-2" />
                Search Book Text
              </h4>

              <input
                type="text"
                placeholder="Type query to scan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-4 bg-background border border-customBorder rounded-lg font-sans text-xs text-primaryText focus:border-gold outline-none mb-4"
              />

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {searchQuery.trim() && searchResults.length === 0 ? (
                  <p className="text-[11px] text-secondaryText/60 font-mono text-center pt-8">No matching logs found.</p>
                ) : (
                  searchResults.map((r, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setCurrentPage(r.pageIdx);
                        setShowSearchPanel(false);
                      }}
                      className="p-3 bg-background hover:bg-[#202020] border border-customBorder rounded-lg cursor-pointer transition-colors text-left space-y-1.5"
                    >
                      <div className="flex justify-between font-mono text-[8px] text-gold uppercase">
                        <span>{r.chapterTitle}</span>
                        <span>Page {r.pageIdx}</span>
                      </div>
                      <p className="font-serif text-[11px] text-secondaryText italic line-clamp-2 leading-snug">
                        {r.snippet}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setShowSearchPanel(false)}
              className="w-full mt-4 py-2 border border-customBorder hover:border-[#aaa] text-secondaryText hover:text-white font-mono text-[9px] uppercase tracking-wider rounded"
            >
              Close Panel
            </button>
          </motion.div>
        )}

        {showNotesPanel && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute left-6 top-24 bottom-24 w-80 bg-surface border border-customBorder rounded-2xl p-6 z-40 shadow-2xl flex flex-col justify-between"
          >
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center border-b border-customBorder/30 pb-3 mb-4">
                <h4 className="font-serif text-sm font-bold text-gold uppercase tracking-wider flex items-center">
                  <FileText size={14} className="mr-2" />
                  Margin Notes
                </h4>
                
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="p-1 hover:bg-[#252525] border border-customBorder hover:border-gold/30 text-gold rounded"
                  title="Add Note to Current Page"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add Note inline block */}
              {showNoteForm && (
                <div className="p-3 bg-background border border-gold/30 rounded-lg space-y-2 mb-4">
                  <span className="font-mono text-[8px] text-gold uppercase block">Adding Note for Page {currentPage}</span>
                  <textarea
                    placeholder="Type margin note details here..."
                    value={activeNoteText}
                    onChange={(e) => setActiveNoteText(e.target.value)}
                    className="w-full h-18 bg-surface border border-customBorder focus:border-gold/30 rounded outline-none p-2 font-sans text-xs text-primaryText"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowNoteForm(false)} 
                      className="py-1 px-2.5 border border-customBorder text-[9px] font-mono text-secondaryText hover:text-white uppercase rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNote} 
                      className="py-1 px-3 bg-gold hover:bg-gold-hover text-[9px] font-mono text-background font-bold uppercase rounded"
                    >
                      Preserve Note
                    </button>
                  </div>
                </div>
              )}

              {/* Notes list */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {notes.length === 0 ? (
                  <p className="text-[11px] text-secondaryText/60 font-mono text-center pt-8">No margin notes cataloged.</p>
                ) : (
                  notes.map(n => (
                    <div 
                      key={n.id}
                      className="p-3 bg-background border border-customBorder rounded-lg text-left space-y-2 relative group/note"
                    >
                      <div className="flex justify-between font-mono text-[8px] text-gold uppercase">
                        <span onClick={() => setCurrentPage(n.pageIndex)} className="cursor-pointer hover:underline">Page {n.pageIndex}</span>
                        <button 
                          onClick={() => handleDeleteNote(n.id)}
                          className="opacity-0 group-hover/note:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <p className="font-sans text-xs text-primaryText leading-relaxed">
                        {n.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setShowNotesPanel(false)}
              className="w-full mt-4 py-2 border border-customBorder hover:border-[#aaa] text-secondaryText hover:text-white font-mono text-[9px] uppercase tracking-wider rounded"
            >
              Close Panel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN BOOK ANIMATION CONTAINER */}
      <div className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center justify-center px-4 perspective-1500">
        
        {/* CLOSED COVER STAGE (Page 0) */}
        {currentPage === 0 && (
          <motion.div
            onClick={handleNextPage}
            initial={{ scale: 0.8, rotateX: 10, rotateY: 5, y: 30 }}
            animate={isFlipping === "next"
              ? { scale: 0.95, rotateX: 5, rotateY: -15, y: 0 }
              : { scale: 1.05, rotateX: 12, rotateY: -10, y: 0 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-[280px] md:w-[320px] h-[380px] md:h-[440px] cursor-pointer transform-style-3d relative group shadow-2xl hover:shadow-[0_40px_80px_rgba(201,162,39,0.25)] transition-shadow duration-500"
          >
            {/* Ambient shadow behind book */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[#C9A227]/10 blur-[80px] -translate-x-12 -translate-y-12 pointer-events-none" />

            {/* Front Cover page card */}
            <motion.div
              animate={isFlipping === "next" ? { rotateY: -165 } : { rotateY: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 rounded-r-lg border border-[#2E2E2E] shadow-2xl origin-left z-30 transform-style-3d overflow-hidden"
              style={{
                boxShadow: "0 30px 65px rgba(0,0,0,0.9)",
              }}
            >
              {coverFailed ? (
                /* Premium Leather Fallback Cover */
                <div className="w-full h-full flex flex-col justify-between p-8 text-center bg-gradient-to-br from-[#1c1813] to-[#0c0a08] paper-texture">
                  <div className="font-mono text-[9px] text-gold uppercase tracking-[0.25em] border-b border-gold/10 pb-2">
                    StoryVault Preserves
                  </div>
                  
                  <div className="my-auto space-y-4">
                    <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center mx-auto bg-black/40 shadow-inner">
                      <Sparkles size={24} className="text-gold" />
                    </div>
                    <h2 className="font-serif text-xl font-bold tracking-widest text-gold leading-tight uppercase">
                      {book.title}
                    </h2>
                    <span className="w-12 h-[1px] bg-gold/30 mx-auto block" />
                    <p className="font-serif italic text-xs text-[#A5A5A5]">
                      by {book.author}
                    </p>
                  </div>

                  <div className="font-mono text-[8px] text-gold/60 uppercase tracking-widest pt-2 border-t border-gold/10">
                    Digital Preservation Codex
                  </div>
                </div>
              ) : (
                /* Cover Image Cover */
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${book.coverUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              {/* Spine edge details */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/60 border-r border-gold/20" />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors" />
            </motion.div>

            {/* Underneath page shown while cover flips */}
            <div 
              className="absolute inset-y-1 left-1 right-2 bg-[#faf4e6] border border-black/5 origin-left paper-texture shadow-lg rounded-r z-10 flex items-center justify-center text-center p-6"
              style={{
                boxShadow: "inset 10px 0 30px rgba(0,0,0,0.15)"
              }}
            >
              <div className="border border-gold/15 p-4 rounded-lg w-full h-full flex flex-col justify-center items-center">
                <span className="font-mono text-[8px] text-gold uppercase tracking-[0.2em] block mb-2">StoryVault Collection</span>
                <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center mb-3">
                  <Sparkles size={16} className="text-gold" />
                </div>
                <h4 className="font-serif text-sm font-bold text-black/75 tracking-wider uppercase">Inside Page</h4>
              </div>
            </div>
          </motion.div>
        )}

        {/* OPEN DIGITAL SPREAD STAGE (currentPage >= 1) */}
        {currentPage >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-5xl h-[90%] grid grid-cols-2 relative rounded-lg border border-black/15 shadow-2xl overflow-hidden transition-all duration-1000 ${themeStyles.bg} ${
              previewExpired ? "blur-[10px] select-none pointer-events-none" : ""
            }`}
          >
            {/* Spine Shadow crease */}
            <div className="absolute top-0 bottom-0 left-1/2 w-8 -ml-4 z-20 page-spine-shadow pointer-events-none" />

            {/* LEFT PAGE */}
            <div className="relative p-8 md:p-12 border-r border-black/5 flex flex-col justify-between h-full overflow-hidden">
              <div className={`absolute top-0 bottom-0 right-0 w-12 ${themeStyles.creaseLeft} pointer-events-none`} />
              {renderPage(bookPages[currentPage], currentPage)}
            </div>

            {/* RIGHT PAGE */}
            <div className="relative p-8 md:p-12 flex flex-col justify-between h-full overflow-hidden">
              <div className={`absolute top-0 bottom-0 left-0 w-12 ${themeStyles.creaseRight} pointer-events-none`} />
              {renderPage(bookPages[currentPage + 1], currentPage + 1)}
            </div>

            {/* Live page flip overlays */}
            {isFlipping && (
              <motion.div
                initial={isFlipping === "next" ? { rotateY: 0 } : { rotateY: -180 }}
                animate={isFlipping === "next" ? { rotateY: -180 } : { rotateY: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
                className={`absolute inset-y-0 right-0 w-1/2 ${themeStyles.bg} ${themeStyles.paperTexture} origin-left z-30 transform-style-3d`}
                style={{
                  backfaceVisibility: "hidden",
                  boxShadow: "-10px 0 25px rgba(0,0,0,0.15)"
                }}
              >
                {/* Back side of flipping page */}
                <div className={`absolute inset-0 backface-hidden ${themeStyles.bg} rotateY-180 p-8 md:p-12 flex flex-col justify-between text-left`}>
                  {isFlipping === "next" 
                    ? renderPage(bookPages[currentPage + 2], currentPage + 2)
                    : renderPage(bookPages[currentPage - 1], currentPage - 1)
                  }
                </div>
                
                {/* Front side of flipping page */}
                <div className={`absolute inset-0 ${themeStyles.bg} p-8 md:p-12 flex flex-col justify-between text-left`}>
                  {isFlipping === "next"
                    ? renderPage(bookPages[currentPage + 1], currentPage + 1)
                    : renderPage(bookPages[currentPage], currentPage)
                  }
                </div>
                <div className="absolute inset-0 page-spine-shadow" />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Navigation Arrows overlay */}
        {currentPage > 0 && !previewExpired && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
            <button
              onClick={handlePrevPage}
              disabled={isFlipping !== null || currentPage === 1}
              className="p-3 bg-surface border border-customBorder text-primaryText hover:text-gold rounded-full shadow-2xl pointer-events-auto cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:scale-105 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={isFlipping !== null || currentPage + 2 >= bookPages.length}
              className="p-3 bg-surface border border-customBorder text-primaryText hover:text-gold rounded-full shadow-2xl pointer-events-auto cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:scale-105 transition-transform"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

      </div>

      {/* Chapter Index Selector (at bottom, open book only) */}
      {currentPage > 0 && !previewExpired && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface/50 border border-customBorder rounded-full px-6 py-2 flex items-center space-x-3 text-xs">
          <span className="font-mono text-[9px] uppercase tracking-wider text-secondaryText">Chapter:</span>
          <select
            value={bookPages[currentPage]?.chapterIndex || 0}
            onChange={(e) => {
              const chIdx = Number(e.target.value);
              const foundIdx = bookPages.findIndex(
                p => p.type === "content" && p.chapterIndex === chIdx
              );
              if (foundIdx !== -1) {
                setCurrentPage(foundIdx % 2 === 0 ? foundIdx - 1 : foundIdx);
              }
            }}
            className="bg-transparent text-primaryText border-none outline-none font-serif font-bold text-xs cursor-pointer focus:ring-0"
          >
            {chapters.map((ch, idx) => (
              <option key={idx} value={idx} className="bg-surface text-primaryText">
                {ch.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Trial Expired dialog panel */}
      <AnimatePresence>
        {previewExpired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm"
          >
            <div className="max-w-md w-full bg-surface border border-gold/45 rounded-2xl p-8 text-center shadow-gold-glow flex flex-col items-center select-text">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-5 border border-gold/30">
                <Lock className="text-gold" size={24} />
              </div>
              
              <h3 className="font-serif text-2xl font-bold text-primaryText leading-snug">
                Preview Ended
              </h3>
              
              <p className="text-secondaryText text-xs font-sans mt-3 leading-relaxed">
                Your 5-minute complimentary preview of <strong>{book.title}</strong> has concluded. Purchase the complete edition to enjoy unrestricted access.
              </p>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <button
                  onClick={() => {
                    addToCart(book, "ebook", pricing.ebookPrice);
                    triggerCloseAnimation();
                  }}
                  className="py-3 px-4 bg-gold hover:bg-gold-hover text-background font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Buy Digital Edition (${pricing.ebookPrice})
                </button>
                <button
                  onClick={() => {
                    addToCart(book, "physical", pricing.physicalPrice);
                    triggerCloseAnimation();
                  }}
                  className="py-3 px-4 border border-gold hover:bg-gold/15 text-gold font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Buy Hardcover (${pricing.physicalPrice})
                </button>
              </div>

              <button
                onClick={triggerCloseAnimation}
                className="w-full py-3 mt-4 border border-customBorder hover:border-gold text-secondaryText hover:text-gold font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Return to Library
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
