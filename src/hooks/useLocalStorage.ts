import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db, auth, isFirebaseConfigValid } from "../services/firebase";
import { ReadingState } from "../types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!auth || !isFirebaseConfigValid) return;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setFavorites(docSnap.data().favorites || []);
          }
        });
        return () => unsubDoc();
      } else {
        setFavorites([]);
      }
    });

    return () => unsubAuth();
  }, []);

  const toggleFavorite = async (bookId: string) => {
    const newFavorites = favorites.includes(bookId)
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId];
    
    setFavorites(newFavorites);

    const user = auth?.currentUser;
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), { favorites: newFavorites });
      } catch (e) {
        console.warn("Favorites update offline fallback:", e);
      }
    }
  };

  const isFavorite = (bookId: string) => favorites.includes(bookId);

  return { favorites, toggleFavorite, isFavorite };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Record<string, { chapterIndex: number; pageIndex: number }>>({});

  useEffect(() => {
    if (!auth || !isFirebaseConfigValid) return;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setBookmarks(docSnap.data().bookmarks || {});
          }
        });
        return () => unsubDoc();
      } else {
        setBookmarks({});
      }
    });

    return () => unsubAuth();
  }, []);

  const addBookmark = async (bookId: string, chapterIndex: number, pageIndex: number) => {
    const newBookmarks = {
      ...bookmarks,
      [bookId]: { chapterIndex, pageIndex }
    };
    setBookmarks(newBookmarks);

    const user = auth?.currentUser;
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), { bookmarks: newBookmarks });
      } catch (e) {
        console.warn("Bookmarks update offline fallback:", e);
      }
    }
  };

  const removeBookmark = async (bookId: string) => {
    const newBookmarks = { ...bookmarks };
    delete newBookmarks[bookId];
    setBookmarks(newBookmarks);

    const user = auth?.currentUser;
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), { bookmarks: newBookmarks });
      } catch (e) {
        console.warn("Bookmarks remove offline fallback:", e);
      }
    }
  };

  const getBookmark = (bookId: string) => bookmarks[bookId] || null;

  return { bookmarks, addBookmark, removeBookmark, getBookmark };
}

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingState[]>([]);

  useEffect(() => {
    if (!auth || !isFirebaseConfigValid) return;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setHistory(docSnap.data().readingHistory || []);
          }
        });
        return () => unsubDoc();
      } else {
        setHistory([]);
      }
    });

    return () => unsubAuth();
  }, []);

  const updateReadingProgress = async (bookId: string, chapterIndex: number, pageIndex: number) => {
    const filtered = history.filter(item => item.bookId !== bookId);
    const newState: ReadingState = {
      bookId,
      currentChapterIndex: chapterIndex,
      currentPageIndex: pageIndex,
      lastReadTime: Date.now()
    };
    const newHistory = [newState, ...filtered];
    setHistory(newHistory);

    const user = auth?.currentUser;
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), { readingHistory: newHistory });
      } catch (e) {
        console.warn("History update offline fallback:", e);
      }
    }
  };

  const getBookProgress = (bookId: string) => {
    return history.find(item => item.bookId === bookId) || null;
  };

  const clearHistory = async () => {
    setHistory([]);
    const user = auth?.currentUser;
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), { readingHistory: [] });
      } catch (e) {
        console.warn("History clear offline fallback:", e);
      }
    }
  };

  return { history, updateReadingProgress, getBookProgress, clearHistory };
}
