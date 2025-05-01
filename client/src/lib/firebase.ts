// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzwVTCkbbzY7disGMLqzwN9_r5znNLzNM",
  authDomain: "snapeat-2288d.firebaseapp.com",
  databaseURL: "https://snapeat-2288d-default-rtdb.firebaseio.com",
  projectId: "snapeat-2288d",
  storageBucket: "snapeat-2288d.firebasestorage.app",
  messagingSenderId: "567797575571",
  appId: "1:567797575571:web:b44e2b034dc0a7fd510266",
  measurementId: "G-C3YVWELGN6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
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
