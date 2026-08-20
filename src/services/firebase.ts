import { supabase, isSupabaseConfigValid } from "../lib/supabase";

export { supabase, isSupabaseConfigValid };
export const isFirebaseConfigValid = isSupabaseConfigValid;
export const db = null as any;
export const auth = null as any;
export const storage = null as any;
export const firebaseInitializationError = null;

export type User = any;
export const GoogleAuthProvider = class {};
export const signInWithPopup = async (...args: any[]) => ({ user: { uid: "local-user-id", email: "patron@storyvault.com", displayName: "StoryVault Patron" } });
export const signInWithRedirect = async (...args: any[]) => {};
export const getRedirectResult = async (...args: any[]) => null;
export const signInAnonymously = async (...args: any[]) => ({ user: { uid: "anon-user" } });
export const onAuthStateChanged = (...args: any[]) => (() => {});
export const createUserWithEmailAndPassword = async (...args: any[]) => ({ user: { uid: "new-user-id" } });
export const signInWithEmailAndPassword = async (...args: any[]) => ({ user: { uid: "user-id" } });
export const signOut = async (...args: any[]) => {};
export const updateProfile = async (...args: any[]) => {};
export const updatePassword = async (...args: any[]) => {};

export const collection = (...args: any[]) => ({});
export const doc = (...args: any[]) => ({});
export const getDoc = async (...args: any[]) => ({ exists: () => false, data: () => ({}) });
export const getDocs = async (...args: any[]) => ({ empty: true, docs: [], forEach: () => {} });
export const setDoc = async (...args: any[]) => ({});
export const updateDoc = async (...args: any[]) => ({});
export const deleteDoc = async (...args: any[]) => ({});
export const addDoc = async (...args: any[]) => ({});
export const writeBatch = (...args: any[]) => ({ set: (...args: any[]) => {}, update: (...args: any[]) => {}, delete: (...args: any[]) => {}, commit: async () => {} });
export const onSnapshot = (...args: any[]) => (() => {});
export const query = (...args: any[]) => ({});
export const where = (...args: any[]) => ({});
export const runTransaction = async (...args: any[]) => ({});
export const ref = (...args: any[]) => ({});
export const getDownloadURL = async (...args: any[]) => "";

export default supabase;