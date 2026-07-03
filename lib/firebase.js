// Firebase client init.
//
// Deliberately guarded: if the NEXT_PUBLIC_FIREBASE_* env vars aren't set
// (e.g. before Firebase project setup is finished, or on any deploy that
// hasn't added them yet), this file exports auth/db as null instead of
// throwing. Every place that uses auth/db checks isConfigured first, so
// the app keeps working exactly as it does today — localStorage-backed,
// no accounts — until Firebase is actually wired up on the hosting side.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only ever initialize in the browser, and only if the required keys are
// present. Never runs during the Next.js server build.
const isConfigured =
  typeof window !== "undefined" &&
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;

if (isConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    // If Firebase fails to init for any reason, the app should still run —
    // it just falls back to behaving as if accounts aren't set up yet.
    console.error("Firebase failed to initialize:", e);
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db, isConfigured };
