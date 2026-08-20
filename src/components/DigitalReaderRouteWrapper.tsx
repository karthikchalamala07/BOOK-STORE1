import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookstore } from "../context/useBookstore";
import { canReadFullBook } from "../services/entitlementService";
import Book3DViewer from "./Book3DViewer";
import { Lock, ArrowLeft, BookX } from "lucide-react";

export default function DigitalReaderRouteWrapper() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books, purchasedBooks, orders, userEntitlements, currentUser, saveReadingProgress } = useBookstore();

  const selectedBook = useMemo(() => {
    if (!bookId) return null;
    return books.find(b => b.id === bookId || b.id.toLowerCase() === bookId.toLowerCase());
  }, [books, bookId]);

  const entitlementResult = useMemo(() => {
    if (!bookId) return { unlocked: false, reason: "NOT_FOUND" };
    return canReadFullBook(currentUser?.uid || "guest", bookId, purchasedBooks, orders, userEntitlements);
  }, [currentUser, bookId, purchasedBooks, orders, userEntitlements]);

  // Case 1: Book not found in catalog
  if (!selectedBook) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5F1E8] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
          <BookX className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#F8F6F2]">Book Not Found</h2>
          <p className="text-xs text-[#A5A5A5] max-w-md">
            The requested codex volume <span className="font-mono text-[#C9A227]">"{bookId}"</span> could not be located in the StoryVault archives.
          </p>
        </div>
        <button
          onClick={() => navigate("/digital-vault")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A227] text-[#0D0D0D] font-medium text-xs rounded-lg hover:bg-[#b08d20] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Digital Library
        </button>
      </div>
    );
  }

  // Case 2: Customer does not own the digital entitlement
  if (!entitlementResult.unlocked) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5F1E8] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-[10px] text-[#C9A227] uppercase tracking-widest">
            DIGITAL ACCESS REQUIRED
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#F8F6F2]">{selectedBook.title}</h2>
          <p className="text-xs text-[#A5A5A5] max-w-md">
            You do not currently own the digital edition entitlement for this preserved manuscript. Purchase the eBook format or enter an activation code to unlock full reading access.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate("/digital-vault")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] border border-[#2E2E2E] text-[#F8F6F2] font-medium text-xs rounded-lg hover:bg-[#252525] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Vault
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Customer has active digital entitlement -> Render 3D Book Reader
  return (
    <Book3DViewer
      book={selectedBook}
      onClose={() => navigate("/digital-vault")}
      onBookmarkAdd={() => {}}
      onBookmarkRemove={() => {}}
      isBookmarked={false}
      savedBookmark={null}
      onProgressUpdate={(bId, chapIdx, pageIdx) => {
        saveReadingProgress(bId, chapIdx, pageIdx);
      }}
    />
  );
}