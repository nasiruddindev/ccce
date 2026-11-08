import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

// Get saved Firebase configuration from localStorage or .env
export const getStoredFirebaseConfig = () => {
  const localSaved = localStorage.getItem("voltflow_firebase_config");
  if (localSaved) {
    try {
      return JSON.parse(localSaved);
    } catch {
      // fallback
    }
  }

  // Fallback to Vite env variables if provided
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
    };
  }

  return null;
};

let app = null;
let db = null;

export const initFirebase = (customConfig = null) => {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, isConfigured: false };
  }

  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    db = getFirestore(app);
    return { app, db, isConfigured: true };
  } catch (error) {
    console.warn("Firebase initialization warning:", error);
    return { app: null, db: null, isConfigured: false, error: error.message };
  }
};

// Initialize immediately if config exists
const initial = initFirebase();
app = initial.app;
db = initial.db;

export { app, db };
