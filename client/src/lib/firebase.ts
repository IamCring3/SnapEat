// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzwVTCkbbzY7disGMLqzwN9_r5znNLzNM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "snapeat-2288d.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://snapeat-2288d-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "snapeat-2288d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "snapeat-2288d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "567797575571",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:567797575571:web:b44e2b034dc0a7fd510266",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C3YVWELGN6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize analytics only if supported (prevents errors in SSR/Vercel environment)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Initialize and configure Auth
export const auth = getAuth(app);
// Set persistence to LOCAL to keep the user logged in even after browser refresh
import { browserLocalPersistence, setPersistence } from "firebase/auth";
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase Auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Initialize other Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app); // Realtime Database

// Using production Firebase configuration

// Log Firebase initialization
console.log("Firebase initialized with config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId
});
