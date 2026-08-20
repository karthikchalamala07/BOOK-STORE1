import { useState, useEffect } from "react";
import { ReadingState } from "../types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem("storyvault_favorites");
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("storyvault_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const isFavorite = (bookId: string) => favorites.includes(bookId);

  return { favorites, toggleFavorite, isFavorite };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Record<string, { chapterIndex: number; pageIndex: number }>>(() => {
    try {
      const item = localStorage.getItem("storyvault_bookmarks");
      return item ? JSON.parse(item) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("storyvault_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (bookId: string, location: { chapterIndex: number; pageIndex: number } | number) => {
    const locObj = typeof location === "number" ? { chapterIndex: 0, pageIndex: location } : location;
    setBookmarks(prev => ({ ...prev, [bookId]: locObj }));
  };

  const removeBookmark = (bookId: string) => {
    setBookmarks(prev => {
      const next = { ...prev };
      delete next[bookId];
      return next;
    });
  };

  const getBookmark = (bookId: string) => bookmarks[bookId] || null;

  return { bookmarks, addBookmark, removeBookmark, getBookmark };
}

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingState[]>(() => {
    try {
      const item = localStorage.getItem("storyvault_reading_history");
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("storyvault_reading_history", JSON.stringify(history));
  }, [history]);

  const updateProgress = (state: ReadingState) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.bookId !== state.bookId);
      return [state, ...filtered];
    });
  };

  const updateReadingProgress = (bookId: string, chapterIndex: number, pageIndex: number) => {
    updateProgress({ bookId, chapterIndex, pageIndex, currentChapterIndex: chapterIndex, currentPageIndex: pageIndex, lastReadTime: Date.now(), updatedAt: new Date().toISOString() });
  };

  const getProgress = (bookId: string) => history.find(h => h.bookId === bookId) || null;

  const clearHistory = () => setHistory([]);

  return { history, updateProgress, updateReadingProgress, getProgress, clearHistory };
}