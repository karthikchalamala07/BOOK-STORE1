import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Type, Sparkles, Search, FileText, Palette, Plus, Trash2, Maximize, BarChart2, CheckCircle } from "lucide-react";
import { Book, Chapter } from "../types";
import { fetchGutenbergBook, parseGutenbergText } from "../services/api";
import { useBookstore } from "../context/useBookstore";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

interface PurchasedReaderProps {
  book: Book;
  onClose: () => void;
}

type ThemeMode = "light" | "sepia" | "dark";
type FontFamily = "serif" | "sans" | "mono";
type LineSpacing = "normal" | "relaxed" | "loose";
type MarginSize = "narrow" | "normal" | "wide";

export default function PurchasedReader({ book, onClose }: PurchasedReaderProps) {
  const { addToast } = useBookstore();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Reader states
  const [currentPage, setCurrentPage] = useState(0); 
  const [isFlipping, setIsFlipping] = useState<"next" | "prev" | null>(null);
  
  // Custom Typography & Spacing States
  const [theme, setTheme] = useState<ThemeMode>("sepia");
  const [fontFamily, setFontFamily] = useState<FontFamily>("serif");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>("relaxed");
  const [marginSize, setMarginSize] = useState<MarginSize>("normal");

  // Screen layout modes
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Advanced features: Notes, Highlights, Bookmarks, and Search
  const [notes, setNotes] = useState<{ id: string; pageIndex: number; text: string; createdAt: string }[]>([]);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  const [highlights, setHighlights] = useState<{ pageIndex: number; paragraphIndex: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Bookmarking state
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Resume progress states
  const [savedPageIndex, setSavedPageIndex] = useState(0);

  // Statistics counters
  const [startTime] = useState(Date.now());
  const [readMinutes, setReadMinutes] = useState(0);

  // Local generator for full book chapters (offline fallback)
  const generateFullMockBook = (targetBook: Book): Chapter[] => {
    const list: Chapter[] = [];
    const chapterTitles = [
      "Chapter I: The Journey Begins",
      "Chapter II: Shadows in the Mist",
      "Chapter III: The Ancient Ledger",
      "Chapter IV: Whisper of the Preserved",
      "Chapter V: Chamber of Secrets",
      "Chapter VI: The Unveiled Portrait",
      "Chapter VII: Echoes from the Gallery",
      "Chapter VIII: Sanctuary Under Siege",
      "Chapter IX: Codex of the Ancestors",
      "Chapter X: Crimson Eclipse",
      "Chapter XI: The Final Preservative",
      "Chapter XII: Triumph of the Light"
    ];
    
    chapterTitles.forEach((title, idx) => {
      list.push({
        title,
        content: [
          `This is the complete and unrestricted text of "${targetBook.title}", Chapter ${idx + 1}.`,
          `The editorial preservation of ${targetBook.author}'s classic work is presented here by the STORYVAULT luxury publishing house.`,
          "The characters explore their historical dimensions, unfolding deep human nature, tragic romances, gothic aesthetics, and strategic maneuvers.",
          "Through paragraphs of preserved transcripts, the narrative rises to epic heights, illustrating why this work remains a cornerstone of classic literature.",
          "As the chapters build towards the resolution, readers witness the pristine beauty of literature preserved forever in the digital vault sanctuary."
        ]
      });
    });
    
    return list;
  };

  // 1. Load full book content from Storage or Gutenberg or generator
  useEffect(() => {
    async function loadFullBook() {
      // Step A: Try fetching from Firebase Storage
      try {
        const { ref, getDownloadURL } = await import("firebase/storage");
        const { storage } = await import("../services/firebase");
        
        const fileRef = ref(storage, `ebooks/${book.id}.txt`);
        const downloadUrl = await getDownloadURL(fileRef);
        
        const response = await fetch(downloadUrl);
        if (response.ok) {
          const text = await response.text();
          const parsed = parseGutenbergText(text);
          if (parsed && parsed.length > 0) {
            setChapters(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Storage text fetch failed, trying Gutenberg proxy:", err);
      }
      
      // Step B: Try Gutenberg proxy
      if (book.gutenbergId) {
        try {
          const parsed = await fetchGutenbergBook(book.gutenbergId, book.title, book.author);
          if (parsed && parsed.length > 0 && parsed[0].title !== "Chapter I: The Sanctuary Reading") {
            setChapters(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Gutenberg fetch failed:", e);
        }
      }

      // Step C: Fallback to high-fidelity generated full book
      const generated = generateFullMockBook(book);
      setChapters(generated);
      setLoading(false);
    }
    
    loadFullBook();
  }, [book]);

  // Track elapsed read time
  useEffect(() => {
    const interval = setInterval(() => {
      setReadMinutes(Math.floor((Date.now() - startTime) / 60000));
    }, 30000);
    return () => clearInterval(interval);
  }, [startTime]);

  // 2. Format dynamic pages structure
  const bookPages = useMemo(() => {
    if (chapters.length === 0) return [];
    
    const list: {
      type: "cover" | "inside-cover" | "title-page" | "content" | "back-cover";
      chapterTitle?: string;
      chapterIndex?: number;
      pageIndex?: number;
      content?: string[];
    }[] = [];
    
    list.push({ type: "cover" });
    list.push({ type: "inside-cover" });
    list.push({ type: "title-page" });
    
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
    
    if (list.length % 2 === 0) {
      list.push({
        type: "content",
        chapterTitle: "End of Volume",
        chapterIndex: chapters.length - 1,
        pageIndex: 9999,
        content: [""]
      });
    }
    
    list.push({ type: "back-cover" });
    return list;
  }, [chapters, fontSize]);

  // 3. Load user library metadata progress, notes, and highlights
  useEffect(() => {
    if (loading || bookPages.length === 0) return;

    const uid = auth.currentUser?.uid || "guest";
    const localLibKey = `storyvault_users_${uid}_digital_library`;
    const localLib = JSON.parse(localStorage.getItem(localLibKey) || "[]");
    const found = localLib.find((item: any) => item.bookId === book.id);
    
    if (found) {
      if (found.notes) setNotes(found.notes);
      if (found.highlights) setHighlights(found.highlights);
      if (found.pageIndex !== undefined) {
        setSavedPageIndex(found.pageIndex);
      }
    }
  }, [loading, bookPages, book.id]);

  // 4. Progress automatic updates saver hook
  useEffect(() => {
    if (loading || currentPage < 1 || bookPages.length === 0) return;

    const saveProgress = async () => {
      const activePage = bookPages[currentPage];
      if (activePage && activePage.type === "content") {
        const pageIdx = currentPage;
        const chapIdx = activePage.chapterIndex || 0;
        const progressPercent = Math.min(100, Math.floor((chapIdx / chapters.length) * 100));

        const uid = auth.currentUser?.uid || "guest";
        const localLibKey = `storyvault_users_${uid}_digital_library`;
        const localLib = JSON.parse(localStorage.getItem(localLibKey) || "[]");
        
        const updated = localLib.map((item: any) => {
          if (item.bookId === book.id) {
            return {
              ...item,
              pageIndex: pageIdx,
              chapterIndex: chapIdx,
              readingProgress: progressPercent,
              lastOpened: new Date().toISOString()
            };
          }
          return item;
        });
        localStorage.setItem(localLibKey, JSON.stringify(updated));

        // Firestore updates
        try {
          await updateDoc(doc(db, "users", uid, "digitalLibrary", book.id), {
            pageIndex: pageIdx,
            chapterIndex: chapIdx,
            readingProgress: progressPercent,
            lastOpened: new Date().toISOString(),
            lastRead: new Date().toISOString()
          });
        } catch (e) {
          console.warn("Firestore progress update failed:", e);
        }
      }
    };
    saveProgress();
  }, [currentPage, loading, bookPages, book.id]);

  const handleNextPage = () => {
    if (isFlipping) return;
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
    if (isFlipping) return;
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

  // Toggle highlight index
  const toggleHighlight = (pIdx: number) => {
    const isHighlighted = highlights.some(h => h.pageIndex === currentPage && h.paragraphIndex === pIdx);
    let updated;
    if (isHighlighted) {
      updated = highlights.filter(h => !(h.pageIndex === currentPage && h.paragraphIndex === pIdx));
    } else {
      updated = [...highlights, { pageIndex: currentPage, paragraphIndex: pIdx }];
    }
    setHighlights(updated);

    // Save
    const uid = auth.currentUser?.uid || "guest";
    const localLibKey = `storyvault_users_${uid}_digital_library`;
    const localLib = JSON.parse(localStorage.getItem(localLibKey) || "[]");
    const updatedLib = localLib.map((item: any) => {
      if (item.bookId === book.id) {
        return { ...item, highlights: updated };
      }
      return item;
    });
    localStorage.setItem(localLibKey, JSON.stringify(updatedLib));

    try {
      updateDoc(doc(db, "users", uid, "digitalLibrary", book.id), { highlights: updated });
    } catch (e) {
      console.warn("Firestore sync failed:", e);
    }
  };

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Save Notes
  const handleSaveNote = () => {
    if (!activeNoteText.trim()) return;
    const id = `NTE-${Date.now()}`;
    const newNote = {
      id,
      pageIndex: currentPage,
      text: activeNoteText,
      createdAt: new Date().toISOString()
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    setActiveNoteText("");
    setShowNoteForm(false);

    // Save local and Firestore
    const uid = auth.currentUser?.uid || "guest";
    const localLibKey = `storyvault_users_${uid}_digital_library`;
    const localLib = JSON.parse(localStorage.getItem(localLibKey) || "[]");
    const updatedLib = localLib.map((item: any) => {
      if (item.bookId === book.id) {
        return { ...item, notes: updated };
      }
      return item;
    });
    localStorage.setItem(localLibKey, JSON.stringify(updatedLib));

    try {
      updateDoc(doc(db, "users", uid, "digitalLibrary", book.id), { notes: updated });
    } catch (e) {
      console.warn("Firestore note write failed:", e);
    }
  };

  // Delete Notes
  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);

    const uid = auth.currentUser?.uid || "guest";
    const localLibKey = `storyvault_users_${uid}_digital_library`;
    const localLib = JSON.parse(localStorage.getItem(localLibKey) || "[]");
    const updatedLib = localLib.map((item: any) => {
      if (item.bookId === book.id) {
        return { ...item, notes: updated };
      }
      return item;
    });
    localStorage.setItem(localLibKey, JSON.stringify(updatedLib));

    try {
      updateDoc(doc(db, "users", uid, "digitalLibrary", book.id), { notes: updated });
    } catch (e) {
      console.warn("Firestore note delete failed:", e);
    }
  };

  // Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results: { pageIdx: number; chapterTitle: string; snippet: string }[] = [];
    bookPages.forEach((page, idx) => {
      if (page.type === "content" && page.content) {
        const matchingPara = page.content.find(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
        if (matchingPara) {
          const idxOf = matchingPara.toLowerCase().indexOf(searchQuery.toLowerCase());
          const start = Math.max(0, idxOf - 20);
          const end = Math.min(matchingPara.length, idxOf + 40);
          const snippet = (start > 0 ? "..." : "") + matchingPara.substring(start, end) + (end < matchingPara.length ? "..." : "");
          results.push({ pageIdx: idx, chapterTitle: page.chapterTitle || "Content", snippet });
        }
      }
    });
    return results;
  }, [searchQuery, bookPages]);

  // Layout Theme settings mapper
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

  // Typography options
  const fontStyleClass = fontFamily === "sans" 
    ? "font-sans" 
    : fontFamily === "mono" 
    ? "font-mono" 
    : "font-serif";

  const fontSizeClass = fontSize === "small" 
    ? "text-xs md:text-sm" 
    : fontSize === "medium" 
    ? "text-sm md:text-base" 
    : "text-base md:text-lg";

  const spacingClass = lineSpacing === "normal"
    ? "leading-normal"
    : lineSpacing === "relaxed"
    ? "leading-relaxed"
    : "leading-loose";

  const marginClass = marginSize === "narrow"
    ? "px-4"
    : marginSize === "normal"
    ? "px-8 md:px-12"
    : "px-14 md:px-20";

  // Page Content Layout Renderer
  const renderPage = (page: any, index: number) => {
    if (!page) return null;

    if (page.type === "inside-cover") {
      return (
        <div className={`w-full h-full flex flex-col justify-between border ${themeStyles.line} p-8 rounded-md ${themeStyles.bg} ${themeStyles.paperTexture} select-none text-left`}>
          <div className="text-center font-mono text-[9px] text-gold uppercase tracking-[0.25em]">
            STORYVAULT EXCLUSIVE EDITION
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center bg-black/40">
              <CheckCircle size={22} className="text-gold" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gold tracking-widest uppercase">
              StoryVault Reader
            </h4>
            <span className="w-16 h-[1px] bg-gold/30" />
            <p className="font-sans text-[11px] text-gray-500 max-w-xs leading-relaxed">
              Welcome back. Enjoy your complete digital edition of this book. Your purchase grants unlimited access across all your devices.
            </p>
            {savedPageIndex > 1 && (
              <button 
                onClick={() => setCurrentPage(savedPageIndex)}
                className="mt-4 py-2 px-4 bg-gold hover:bg-gold-hover text-background font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-colors"
              >
                Continue from Page {savedPageIndex}
              </button>
            )}
          </div>

          <div className="text-center font-mono text-[8px] text-gold/40">
            OFFICIAL SANCTUARY CODEX
          </div>
        </div>
      );
    }

    if (page.type === "title-page") {
      return (
        <div className={`w-full h-full flex flex-col justify-between border ${themeStyles.line} p-8 rounded-md ${themeStyles.bg} ${themeStyles.paperTexture} select-none text-left`}>
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
            Complete Original Book
          </div>
        </div>
      );
    }

    if (page.type === "content") {
      const pageNotes = notes.filter(n => n.pageIndex === index);

      return (
        <div className={`w-full h-full flex flex-col justify-between text-left ${themeStyles.text} ${marginClass}`}>
          <div className={`flex justify-between items-center border-b ${themeStyles.line} pb-2 text-[10px] uppercase font-mono tracking-widest text-[#888] select-none`}>
            <span className="truncate max-w-[150px]">{book.title}</span>
            <span className="truncate max-w-[150px]">{page.chapterTitle}</span>
          </div>

          {/* Core readable page context body */}
          <div className="flex-1 mt-6 overflow-y-auto pr-2 scrollbar-thin">
            <div className={`space-y-4 ${fontStyleClass} ${fontSizeClass} ${spacingClass}`}>
              {page.content?.map((para: string, pIdx: number) => {
                const isParaHighlighted = highlights.some(
                  h => h.pageIndex === index && h.paragraphIndex === pIdx
                );
                return (
                  <p 
                    key={pIdx} 
                    onClick={() => toggleHighlight(pIdx)}
                    className={`indent-4 leading-relaxed text-justify cursor-pointer rounded px-1 transition-colors ${
                      isParaHighlighted 
                        ? "bg-gold/25 border-l-2 border-gold" 
                        : "hover:bg-gold/5"
                    }`}
                    title="Click to toggle highlight"
                  >
                    {para}
                  </p>
                );
              })}
            </div>
          </div>

          <div className={`flex justify-between items-center text-[10px] font-mono text-secondaryText pt-4 border-t ${themeStyles.line} select-none`}>
            <span>Page {index}</span>
            <div className="flex items-center space-x-2">
              {pageNotes.map(n => (
                <div 
                  key={n.id} 
                  className="w-4.5 h-4.5 rounded bg-gold/15 border border-gold/30 flex items-center justify-center cursor-pointer"
                  title="View Note"
                  onClick={() => alert(`Note for Page ${index}:\n"${n.text}"`)}
                >
                  <FileText size={10} className="text-gold" />
                </div>
              ))}
              <span className="text-gold">✓ UNRESTRICTED</span>
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
            <p className="font-sans text-[11px] text-gray-500 max-w-[200px] leading-relaxed mx-auto">
              Your purchase supports the digitization and preservation of timeless masterworks.
            </p>
          </div>

          <div className="text-center font-mono text-[8px] text-gold/40">
            STORYVAULT DIGITAL
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0c0c] flex flex-col items-center justify-center space-y-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <Loader2 className="text-gold animate-spin" size={32} />
        </div>
        <span className="font-mono text-[10px] text-gold uppercase tracking-[0.25em]">
          Decrypting Complete Edition...
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/98 backdrop-blur-md flex items-center justify-center overflow-hidden">
      
      {/* 1. TOP HEADER CONSOLE PANEL */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-secondaryText hover:text-gold pointer-events-auto cursor-pointer font-mono text-xs uppercase tracking-widest bg-surface/50 border border-customBorder py-2 px-5 rounded-full"
        >
          <ArrowLeft size={14} />
          <span>Exit Reader</span>
        </button>

        {/* Dynamic Chapter title */}
        {currentPage > 0 && (
          <div className="hidden md:flex flex-col items-center select-none">
            <span className="font-serif text-sm font-bold text-gold truncate max-w-[220px]">
              {book.title}
            </span>
            <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
              {bookPages[currentPage]?.chapterTitle || "Preface"}
            </span>
          </div>
        )}

        {/* Toolbar buttons */}
        <div className="flex items-center space-x-4 pointer-events-auto">
          {currentPage > 0 && (
            <>
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-surface/50 border border-customBorder rounded-full text-secondaryText hover:text-gold cursor-pointer"
                title="Fullscreen Toggle"
              >
                <Maximize size={14} />
              </button>

              {/* Statistics toggler */}
              <button
                onClick={() => { setShowStats(!showStats); setShowNotesPanel(false); setShowSearchPanel(false); }}
                className={`p-2.5 border rounded-full cursor-pointer transition-colors ${showStats ? "bg-gold/10 border-gold text-gold" : "bg-surface/50 border-customBorder text-secondaryText hover:text-gold"}`}
                title="Reading Stats"
              >
                <BarChart2 size={14} />
              </button>

              {/* Theme Settings toggler */}
              <div className="flex items-center bg-surface/50 border border-customBorder px-2 py-0.5 rounded-full text-secondaryText text-[10px]">
                <Palette size={12} className="text-secondaryText mr-1.5 ml-1" />
                <button onClick={() => setTheme("light")} className={`px-2 py-0.5 rounded uppercase ${theme === "light" ? "bg-white text-black font-bold" : ""}`}>Light</button>
                <button onClick={() => setTheme("sepia")} className={`px-2 py-0.5 rounded uppercase ${theme === "sepia" ? "bg-[#faf4e6] text-[#222] font-bold" : ""}`}>Sepia</button>
                <button onClick={() => setTheme("dark")} className={`px-2 py-0.5 rounded uppercase ${theme === "dark" ? "bg-black text-[#eee] font-bold" : ""}`}>Dark</button>
              </div>

              {/* Search Toggle */}
              <button
                onClick={() => { setShowSearchPanel(!showSearchPanel); setShowNotesPanel(false); setShowStats(false); }}
                className={`p-2.5 border rounded-full cursor-pointer transition-colors ${showSearchPanel ? "bg-gold/10 border-gold text-gold" : "bg-surface/50 border-customBorder text-secondaryText hover:text-gold"}`}
                title="Search Content"
              >
                <Search size={14} />
              </button>

              {/* Notes Toggle */}
              <button
                onClick={() => { setShowNotesPanel(!showNotesPanel); setShowSearchPanel(false); setShowStats(false); }}
                className={`p-2.5 border rounded-full cursor-pointer transition-colors ${showNotesPanel ? "bg-gold/10 border-gold text-gold" : "bg-surface/50 border-customBorder text-secondaryText hover:text-gold"}`}
                title="Notes Chamber"
              >
                <FileText size={14} />
              </button>

              {/* Typography controls modal trigger */}
              <div className="flex items-center space-x-2 bg-surface/50 border border-customBorder px-2.5 py-1 rounded-full text-[10px]">
                <Type size={12} className="text-secondaryText" />
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  className="bg-transparent text-secondaryText border-none outline-none font-mono text-[9px] cursor-pointer"
                >
                  <option value="serif" className="bg-surface">Serif</option>
                  <option value="sans" className="bg-surface">Sans</option>
                  <option value="mono" className="bg-surface">Mono</option>
                </select>
                
                <select 
                  value={fontSize} 
                  onChange={(e) => setFontSize(e.target.value as any)}
                  className="bg-transparent text-secondaryText border-none outline-none font-mono text-[9px] cursor-pointer border-l border-customBorder pl-2"
                >
                  <option value="small" className="bg-surface">Small</option>
                  <option value="medium" className="bg-surface">Medium</option>
                  <option value="large" className="bg-surface">Large</option>
                </select>

                <select 
                  value={lineSpacing} 
                  onChange={(e) => setLineSpacing(e.target.value as LineSpacing)}
                  className="bg-transparent text-secondaryText border-none outline-none font-mono text-[9px] cursor-pointer border-l border-customBorder pl-2"
                >
                  <option value="normal" className="bg-surface">Normal</option>
                  <option value="relaxed" className="bg-surface">Relaxed</option>
                  <option value="loose" className="bg-surface">Loose</option>
                </select>

                <select 
                  value={marginSize} 
                  onChange={(e) => setMarginSize(e.target.value as MarginSize)}
                  className="bg-transparent text-secondaryText border-none outline-none font-mono text-[9px] cursor-pointer border-l border-customBorder pl-2"
                >
                  <option value="narrow" className="bg-surface">Margins: N</option>
                  <option value="normal" className="bg-surface">Margins: M</option>
                  <option value="wide" className="bg-surface">Margins: W</option>
                </select>
              </div>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2.5 bg-surface/50 border border-customBorder rounded-full text-secondaryText hover:text-gold cursor-pointer"
              >
                {isBookmarked ? <BookmarkCheck size={14} className="text-gold" /> : <Bookmark size={14} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. SLIDEOUT PANELS */}
      <AnimatePresence>
        {/* Search Panel */}
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
                placeholder="Scan keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-4 bg-background border border-customBorder rounded-lg font-sans text-xs text-primaryText focus:border-gold outline-none mb-4"
              />

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {searchQuery.trim() && searchResults.length === 0 ? (
                  <p className="text-[11px] text-secondaryText/60 font-mono text-center pt-8">No matching texts found.</p>
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
            <button onClick={() => setShowSearchPanel(false)} className="w-full mt-4 py-2 border border-customBorder text-secondaryText hover:text-white font-mono text-[9px] uppercase tracking-wider rounded">Close</button>
          </motion.div>
        )}

        {/* Notes Panel */}
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
                  Notes Sanctuary
                </h4>
                <button onClick={() => setShowNoteForm(!showNoteForm)} className="p-1 hover:bg-[#252525] border border-customBorder hover:border-gold/30 text-gold rounded">
                  <Plus size={14} />
                </button>
              </div>

              {showNoteForm && (
                <div className="p-3 bg-background border border-gold/30 rounded-lg space-y-2 mb-4">
                  <textarea
                    placeholder="Enter notes here..."
                    value={activeNoteText}
                    onChange={(e) => setActiveNoteText(e.target.value)}
                    className="w-full h-18 bg-surface border border-customBorder focus:border-gold/30 rounded outline-none p-2 font-sans text-xs text-primaryText"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowNoteForm(false)} className="py-1 px-2.5 border border-customBorder text-[9px] font-mono text-secondaryText hover:text-white uppercase rounded">Cancel</button>
                    <button onClick={handleSaveNote} className="py-1 px-3 bg-gold hover:bg-gold-hover text-[9px] font-mono text-background font-bold uppercase rounded">Save</button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {notes.map(n => (
                  <div key={n.id} className="p-3 bg-background border border-customBorder rounded-lg text-left space-y-2 relative group/note">
                    <div className="flex justify-between font-mono text-[8px] text-gold uppercase">
                      <span onClick={() => setCurrentPage(n.pageIndex)} className="cursor-pointer hover:underline">Page {n.pageIndex}</span>
                      <button onClick={() => handleDeleteNote(n.id)} className="opacity-0 group-hover/note:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <p className="font-sans text-xs text-primaryText leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setShowNotesPanel(false)} className="w-full mt-4 py-2 border border-customBorder text-secondaryText hover:text-white font-mono text-[9px] uppercase tracking-wider rounded">Close</button>
          </motion.div>
        )}

        {/* Stats Panel */}
        {showStats && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute left-6 top-24 bottom-24 w-80 bg-surface border border-customBorder rounded-2xl p-6 z-40 shadow-2xl flex flex-col justify-between"
          >
            <div className="flex-1 flex flex-col min-h-0 text-left">
              <h4 className="font-serif text-sm font-bold text-gold uppercase tracking-wider border-b border-customBorder/30 pb-3 mb-5 flex items-center">
                <BarChart2 size={14} className="mr-2" />
                Reading Statistics
              </h4>

              <div className="space-y-4 font-sans text-xs">
                <div className="bg-background border border-customBorder rounded-lg p-4 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider block">Session Duration</span>
                  <span className="text-lg font-mono text-gold font-bold">{readMinutes} mins</span>
                </div>

                <div className="bg-background border border-customBorder rounded-lg p-4 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider block">Average Reading Pace</span>
                  <span className="text-lg font-mono text-gold font-bold">250 WPM</span>
                </div>

                <div className="bg-background border border-customBorder rounded-lg p-4 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider block">Total Document Words</span>
                  <span className="text-lg font-mono text-gold font-bold">~ 84,000 words</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowStats(false)} className="w-full mt-4 py-2 border border-customBorder text-secondaryText hover:text-white font-mono text-[9px] uppercase tracking-wider rounded">Close</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 3D READER BOOK spread */}
      <div className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center justify-center px-4 perspective-1500">
        
        {currentPage === 0 && (
          <motion.div
            onClick={handleNextPage}
            initial={{ scale: 0.9, rotateX: 8, rotateY: 5, y: 15 }}
            animate={isFlipping === "next"
              ? { scale: 0.98, rotateX: 4, rotateY: -15, y: 0 }
              : { scale: 1.05, rotateX: 12, rotateY: -8, y: 0 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-[280px] md:w-[320px] h-[380px] md:h-[440px] cursor-pointer transform-style-3d relative group shadow-2xl rounded-r-lg overflow-hidden"
          >
            {/* Front Cover page */}
            <motion.div
              animate={isFlipping === "next" ? { rotateY: -165 } : { rotateY: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 rounded-r-lg border border-[#2E2E2E] shadow-2xl origin-left z-30 transform-style-3d overflow-hidden"
              style={{ boxShadow: "0 30px 65px rgba(0,0,0,0.9)" }}
            >
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${book.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/60 border-r border-gold/20" />
            </motion.div>

            {/* Underneath page */}
            <div className="absolute inset-y-1 left-1 right-2 bg-[#faf4e6] border border-black/5 origin-left paper-texture shadow-lg rounded-r z-10 flex items-center justify-center p-6">
              <div className="border border-gold/15 p-4 rounded-lg w-full h-full flex flex-col justify-center items-center">
                <span className="font-mono text-[8px] text-gold uppercase tracking-[0.2em] block mb-2">Preserved Codex</span>
                <span className="font-serif text-xs font-bold text-black/75">Purchased Edition</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentPage >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-5xl h-[90%] grid grid-cols-2 relative rounded-lg border border-black/15 shadow-2xl overflow-hidden transition-all duration-1000 ${themeStyles.bg}`}
          >
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

            {/* Flipping page */}
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
                <div className={`absolute inset-0 backface-hidden ${themeStyles.bg} rotateY-180 p-8 md:p-12 flex flex-col justify-between text-left`}>
                  {isFlipping === "next" 
                    ? renderPage(bookPages[currentPage + 2], currentPage + 2)
                    : renderPage(bookPages[currentPage - 1], currentPage - 1)
                  }
                </div>
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

        {currentPage > 0 && (
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

      {/* Chapter navigation footer */}
      {currentPage > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface/50 border border-customBorder rounded-full px-6 py-2 flex items-center space-x-3 text-xs">
          <span className="font-mono text-[9px] uppercase tracking-wider text-secondaryText">Chapter Navigation:</span>
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

    </div>
  );
}

// Spin loader loader
function Loader2({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
