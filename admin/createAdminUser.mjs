import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration - updated for new project
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main function to create admin user
const createAdminUser = async () => {
  try {
    console.log("=== Create Admin User ===");

    // Get user input
    const email = await prompt("Enter admin email: ");
    const password = await prompt("Enter admin password: ");
    const firstName = await prompt("Enter first name: ");
    const lastName = await prompt("Enter last name: ");

    // Create user with email and password
    console.log("\nCreating user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user data to Firestore with admin role
    console.log("Setting admin role...");
    await setDoc(doc(db, "users", user.uid), {
      email,
      firstName,
      lastName,
      role: "admin",
      id: user.uid,
      createdAt: new Date().toISOString(),
    });

    console.log(`\nAdmin user created successfully!`);
    console.log(`User ID: ${user.uid}`);
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    rl.close();
    process.exit(0);
  }
};

// Run the function
createAdminUser();
