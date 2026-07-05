"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isConfigured } from "./firebase";

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: false,
  authEnabled: false,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().isAdmin === true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signUp(email, password) {
    if (!auth) throw new Error("Accounts aren't set up yet.");
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function signIn(email, password) {
    if (!auth) throw new Error("Accounts aren't set up yet.");
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    if (!auth) throw new Error("Accounts aren't set up yet.");
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  async function signOutUser() {
    if (!auth) throw new Error("Accounts aren't set up yet.");
    return firebaseSignOut(auth);
  }

  const value = {
    user,
    isAdmin,
    loading,
    authEnabled: isConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
