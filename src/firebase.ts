import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  enableIndexedDbPersistence,
  getDocFromServer
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

let app;
let db: any = null;
let auth: any = null;
let isFirebaseAvailable = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  isFirebaseAvailable = true;
} catch (error) {
  console.error("Firebase initialization failed. Falling back to local storage.", error);
}

// Attempt offline persistence FIRST, before any other calls
if (db) {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
      } else if (err.code === "unimplemented") {
        console.warn("The current browser does not support all of the features required to enable persistence.");
      } else {
        console.warn("Offline persistence could not be enabled:", err.message);
      }
    });
  } catch (e) {
    console.error("Could not enable offline persistence:", e);
  }
}

// Validate Connection to Firestore on startup
if (db && isFirebaseAvailable) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.error("Please check your Firebase configuration.");
      }
    }
  };
  testConnection();
}

export { db, auth, isFirebaseAvailable };

// Standard categories defaults
export const DEFAULT_CATEGORIES = [
  { id: "cat_rent", name: "Rent", color: "#6366f1", icon: "Home", limit: 1500 },
  { id: "cat_utilities", name: "Utilities", color: "#3b82f6", icon: "Droplet", limit: 300 },
  { id: "cat_groceries", name: "Groceries", color: "#10b981", icon: "ShoppingCart", limit: 500 },
  { id: "cat_dining", name: "Dining Out", color: "#f59e0b", icon: "Utensils", limit: 300 },
  { id: "cat_entertainment", name: "Entertainment", color: "#ec4899", icon: "Sparkles", limit: 200 },
  { id: "cat_transport", name: "Transport", color: "#14b8a6", icon: "Car", limit: 200 },
  { id: "cat_shopping", name: "Shopping", color: "#a855f7", icon: "ShoppingBag", limit: 400 },
  { id: "cat_misc", name: "Miscellaneous", color: "#6b7280", icon: "HelpCircle", limit: 150 }
];

// Helper to check if online
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}
