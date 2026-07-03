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
import { auth, isConfigured } from "./firebase";

const AuthContext = createContext({
  user: null,
  loading: false,
  authEnabled: false,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Starts "loading" only if Firebase is actually configured — otherwise
  // there's nothing to wait on, and the app renders immediately as before.
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
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
    if (!auth) return;
    return firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authEnabled: isConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
