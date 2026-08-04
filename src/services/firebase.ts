import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export let app: any = null;
export let db: Firestore = null as any;
export let auth: Auth = null as any;
export let storage: FirebaseStorage = null as any;
export let isFirebaseConfigValid = true;
export let firebaseInitializationError: string | null = null;

// Audit checks for missing configuration or local placeholders
const isConfigMissing = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.trim() === "" || 
  firebaseConfig.apiKey.includes("FakeKey") || 
  !firebaseConfig.projectId || 
  firebaseConfig.projectId.trim() === "";

if (isConfigMissing) {
  isFirebaseConfigValid = false;
  firebaseInitializationError = "Firebase configuration variables are missing or using placeholder values.";
  console.warn("Firebase config is invalid. STORYVAULT runs in local offline preservation mode.");
} else {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (err: any) {
    isFirebaseConfigValid = false;
    firebaseInitializationError = err.message || "Failed to initialize Firebase app.";
    console.error("Firebase Initialization Exception:", err);
  }
}

export default app;
