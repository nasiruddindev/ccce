import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";

// Get Firebase configuration from Vite environment variables or localStorage fallback
export const getFirebaseConfig = () => {
  const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : (typeof process !== "undefined" ? process.env : {});

  // 1. Check Vite env variables (.env)
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: env.VITE_FIREBASE_APP_ID || ""
    };
  }

  // 2. Check saved localStorage config if user entered via UI settings
  const localSaved = typeof localStorage !== "undefined" ? localStorage.getItem("voltflow_firebase_config") : null;
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed.apiKey && parsed.projectId) return parsed;
    } catch {
      // fallback
    }
  }

  return null;
};

const config = getFirebaseConfig();

let app = null;
let auth = null;
let db = null;
let isFirebaseConfigured = false;

if (config && config.apiKey && config.projectId) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    // Set persistent session in localStorage
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Failed to set persistent auth state:", err);
    });
    db = getFirestore(app);
    isFirebaseConfigured = true;
  } catch (error) {
    console.warn("Firebase initialization notice:", error);
    isFirebaseConfigured = false;
  }
}

export { app, auth, db, isFirebaseConfigured };
