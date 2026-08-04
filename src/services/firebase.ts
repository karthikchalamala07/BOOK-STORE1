import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKey_ForBookOSDevelopmentOnly",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "storyvault-bookos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "storyvault-bookos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "storyvault-bookos.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:fakeapp"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Audit checks for missing configuration or local placeholders
export const isFirebaseConfigValid = 
  !!(import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY.trim() !== "" && 
  !import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey") && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID.trim() !== "");

export const firebaseInitializationError = isFirebaseConfigValid 
  ? null 
  : "Firebase configuration variables are missing or using placeholder values.";

if (!isFirebaseConfigValid) {
  console.warn("Firebase config is placeholder/invalid. STORYVAULT runs in local offline preservation mode.");
}

export default app;
