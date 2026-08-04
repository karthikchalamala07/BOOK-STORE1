import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Library, BookOpen, Trash2, CheckCircle2, AlertCircle, Sparkles, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { useBookstore } from "../context/useBookstore";
import { Book } from "../types";
import { auth } from "../services/firebase";

interface DigitalVaultProps {
  onReadPreview: (book: Book) => void;
}

export default function DigitalVault({ onReadPreview }: DigitalVaultProps) {
  const { books, verifyAndActivateCode, fetchUserLibrary, addToast } = useBookstore();
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unlockedBook, setUnlockedBook] = useState<Book | null>(null);
  const [activationDetails, setActivationDetails] = useState<any | null>(null);
  const [userLibrary, setUserLibrary] = useState<any[]>([]);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

  // Load user library
  const loadLibrary = async () => {
    const lib = await fetchUserLibrary();
    setUserLibrary(lib);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setCode(e.target.value.toUpperCase().replace(/\s/g, ""));
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUnlockedBook(null);

    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMsg("Please enter an activation code.");
      return;
    }

    if (!cleanCode.startsWith("SV-")) {
      setErrorMsg("Invalid format. Code must start with SV-");
      return;
    }

    setLoading(true);

    try {
      // Race the verification with a 2-second max timeout
      const verifyPromise = verifyAndActivateCode(cleanCode);
      const timeoutPromise = new Promise<any>((resolve) => 
        setTimeout(() => resolve({ success: false, message: "Verification timed out. Please try again." }), 2000)
      );

      const res = await Promise.race([verifyPromise, timeoutPromise]);
      setLoading(false);

      if (res.success && res.book) {
        setUnlockedBook(res.book);
        setActivationDetails(res.codeDetails);
        setAlreadyOwned(!!res.alreadyRedeemedBySelf);
        setCode("");
        // Reload shelf
        await loadLibrary();
      } else {
        setErrorMsg(res.message || "Invalid Activation Code.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("System error. Verification failed.");
    }
  };

  const handleRemove = async (bookId: string) => {
    try {
      const { deleteDoc, doc } = await import("firebase/firestore");
      const { db, auth } = await import("../services/firebase");
      const userId = auth.currentUser?.uid || "guest";
      await deleteDoc(doc(db, "users", userId, "digitalLibrary", bookId));
    } catch (e) {
      console.warn("Firestore delete failed, using local storage sync only:", e);
    }

    const uid = auth.currentUser?.uid || "guest";
    const localLibKey = `storyvault_users_${uid}_digital_library`;
    const localLib = JSON.parse(localStorage.getItem(localLibKey) || "[]");
    const updated = localLib.filter((item: any) => item.bookId !== bookId);
    localStorage.setItem(localLibKey, JSON.stringify(updated));

    addToast({
      title: "✓ Codex Removed",
      message: "Book removed from your digital library."
    });
    loadLibrary();
  };

  return (
    <div className="min-h-screen bg-background text-primaryText pt-28 pb-20 select-text">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        
        {/* Brand Header */}
        <div className="text-center mb-16 select-none">
          <h1 className="font-serif text-3xl font-bold tracking-widest text-gold uppercase">
            DIGITAL VAULT
          </h1>
          <p className="font-sans text-xs text-gray-400 mt-2">
            Unlock your purchased digital books securely.
          </p>
        </div>

        {/* Content switch */}
        <div className="max-w-xl mx-auto mb-16">
          <AnimatePresence mode="wait">
            {unlockedBook ? (
              /* Success Screen */
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#121212] border-2 border-gold rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(201,162,39,0.15)] flex flex-col items-center space-y-6"
              >
                <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center border border-gold">
                  <CheckCircle2 className="text-gold" size={30} />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-primaryText">
                    {alreadyOwned ? "✓ Already Unlocked" : "✓ Congratulations!"}
                  </h3>
                  <p className="font-sans text-xs text-secondaryText">
                    {alreadyOwned 
                      ? "This book is already in your Digital Library." 
                      : "Your purchase has been verified."
                    }
                  </p>
                </div>

                {/* Book Details display */}
                <div className="w-full bg-background border border-customBorder rounded-xl p-5 flex gap-4 text-left">
                  <div className="w-16 h-24 rounded overflow-hidden border border-customBorder/50 shadow shrink-0">
                    <img 
                      src={unlockedBook.coverUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center min-w-0">
                    <h4 className="font-serif text-base font-bold text-primaryText truncate">
                      {unlockedBook.title}
                    </h4>
                    <p className="font-sans text-xs text-secondaryText truncate mt-0.5">
                      by {unlockedBook.author}
                    </p>
                    <div className="mt-2.5 space-y-1 text-[10px] font-mono text-gray-400 leading-tight">
                      <div>
                        <span className="text-gold">Activated On:</span>{" "}
                        {new Date(activationDetails?.activatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                      <div>
                        <span className="text-gold">Activation Code:</span>{" "}
                        {activationDetails?.activationCode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Buttons */}
                <div className="grid grid-cols-2 gap-4 w-full pt-2">
                  <button
                    onClick={() => {
                      onReadPreview(unlockedBook);
                      setUnlockedBook(null);
                    }}
                    className="py-3.5 bg-gold hover:bg-gold-hover text-background font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1.5 animate-pulse"
                  >
                    <BookOpen size={12} />
                    <span>{alreadyOwned ? "Read Book" : "Read Now"}</span>
                  </button>

                  <button
                    onClick={() => setUnlockedBook(null)}
                    className="py-3.5 border border-customBorder hover:border-[#aaa] text-secondaryText hover:text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    {alreadyOwned ? "Open My Library" : "Go to My Library"}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Activation Form Chamber */
              <motion.div
                key="form-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#121212] border border-customBorder rounded-2xl p-8 text-center"
              >
                <span className="font-serif text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-4">
                  [ Enter Activation Code ]
                </span>

                <form onSubmit={handleUnlock} className="space-y-5">
                  <div className="relative group/input">
                    <input
                      type="text"
                      placeholder="SV-XXXXXX"
                      value={code}
                      onChange={handleInputChange}
                      disabled={loading}
                      maxLength={11}
                      className="w-full py-4 px-5 bg-background border border-customBorder focus:border-gold rounded-xl font-mono text-base text-center text-primaryText tracking-widest placeholder:text-secondaryText/35 focus:ring-1 focus:ring-gold outline-none transition-all focus:shadow-[0_0_15px_rgba(201,162,39,0.15)] disabled:opacity-50"
                    />
                  </div>

                  {/* Elegant Red Error screen block */}
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 bg-red-950/20 border border-red-900/60 rounded-xl p-3.5 text-left"
                    >
                      <AlertCircle className="text-red-500 shrink-0" size={16} />
                      <div className="space-y-0.5">
                        <span className="font-serif text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                          Activation Failed
                        </span>
                        <p className="font-sans text-[11px] text-gray-300 leading-snug">
                          {errorMsg}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gold hover:bg-gold-hover disabled:bg-gold/30 text-background font-mono text-xs uppercase tracking-widest font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 relative overflow-hidden"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin text-background" size={14} />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={14} />
                        <span>Unlock Book</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MY DIGITAL LIBRARY - Book Shelf redesign */}
        <div className="w-full border-t border-customBorder/30 pt-10 select-none">
          <div className="flex items-center space-x-2 mb-8">
            <Library className="text-gold" size={18} />
            <h3 className="font-serif text-lg font-bold tracking-wider text-primaryText uppercase">
              My Digital Library
            </h3>
            <span className="font-mono text-[9px] text-gray-500 bg-surface/50 border border-customBorder px-2.5 py-0.5 rounded-full ml-2">
              {userLibrary.length} Volumes
            </span>
          </div>

          {userLibrary.length === 0 ? (
            <div className="py-12 bg-[#121212]/30 border border-dashed border-customBorder rounded-xl text-center">
              <p className="font-sans text-xs text-secondaryText/60">
                No activated digital books on this account yet.
              </p>
            </div>
          ) : (
            /* Bookshelf Grid display */
            <div className="relative">
              {/* Books bookshelf grid container */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12 pb-1 text-left">
                {userLibrary.map((item, idx) => {
                  const book = books.find(b => b.id === item.bookId);
                  if (!book) return null;

                  // Progress computations
                  const progressPercent = item.pageIndex && book.chapters.length > 0
                    ? Math.min(100, Math.floor((item.chapterIndex / book.chapters.length) * 100))
                    : 0;

                  return (
                    <motion.div
                      key={item.bookId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="flex flex-col items-center justify-between group relative h-full"
                    >
                      {/* Book Cover structure */}
                      <div className="w-28 h-40 rounded-lg overflow-hidden border border-customBorder shadow-lg relative shrink-0 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(201,162,39,0.15)] bg-surface">
                        <img 
                          src={book.coverUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                        {/* Overlay delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(book.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-red-950 border border-customBorder/30 rounded-md text-gray-400 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from Library"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>

                      {/* Wood shelf shelf line behind book bottom */}
                      <div className="w-full h-2.5 bg-gradient-to-r from-[#1f1b13] via-[#352c1a] to-[#1f1b13] border-b border-gold/20 shadow mt-2 rounded" />

                      {/* Details */}
                      <div className="w-full text-center mt-3 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-xs font-bold text-primaryText truncate group-hover:text-gold transition-colors">
                            {book.title}
                          </h4>
                          <p className="font-sans text-[10px] text-secondaryText truncate">
                            {book.author}
                          </p>
                        </div>

                        {/* Progress meter */}
                        <div className="w-full mt-2.5 space-y-1.5">
                          <div className="w-full h-1 bg-[#202020] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold" 
                              style={{ width: `${progressPercent}%` }} 
                            />
                          </div>
                          <span className="font-mono text-[8px] text-gray-500 uppercase block tracking-wider">
                            {progressPercent}% Read
                          </span>
                        </div>

                        <button
                          onClick={() => onReadPreview(book)}
                          className="w-full mt-3 py-1.5 bg-[#151515] hover:bg-[#202020] border border-customBorder text-gold font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-colors cursor-pointer"
                        >
                          Continue Reading
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Spin loader svg
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
