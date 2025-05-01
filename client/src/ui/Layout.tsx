import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import { store } from "../lib/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { getUserInfo } = store();

  // Listen for auth state changes and update user info
  useEffect(() => {
    console.log("Setting up auth state listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
      if (user) {
        // User is signed in, load their data
        getUserInfo(user.uid);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [getUserInfo]);

  return (
    <>
      <Header />
      {children}
      <Footer />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        toastOptions={{
          style: {
            backgroundColor: "black",
            color: "white",
          },
        }}
      />
    </>
  );
};

export default Layout;
