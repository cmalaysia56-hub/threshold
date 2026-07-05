// Storage adapter — routes to Firestore when someone is signed in,
// localStorage otherwise. Same get/set/delete/list interface either way,
// so nothing in components/ThresholdApp.jsx needs to know or care which
// backend is actually in use.
//
// Known gap, not yet built: existing localStorage data is NOT automatically
// carried over to Firestore the first time someone signs in. Guest data
// (before sign-in) and signed-in data are currently separate stores. A
// one-time "import my local journal" migration on first sign-in would be
// the natural follow-up.
import { auth, db, isConfigured } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
  documentId,
} from "firebase/firestore";

const STORE_KEY = "threshold:store:v1";

// Tracked at module level so every storage call can check "is someone
// signed in right now" without every call site needing to know about auth.
let currentUid = null;

// onAuthStateChanged is asynchronous — even when a session already exists,
// Firebase takes a moment to confirm it. Without waiting for that first
// confirmation, a storage call made right after page load (or right after
// clicking "Save") could run while currentUid is still null, silently
// writing to localStorage instead of Firestore even though the person is
// signed in — and a later read might come from the other backend, making
// the save look like it did nothing. authReady resolves once Firebase has
// given its first definitive answer, and every storage call now waits on
// it before deciding which backend to use.
let resolveAuthReady;
const authReady = new Promise((resolve) => {
  resolveAuthReady = resolve;
});

if (isConfigured && auth) {
  onAuthStateChanged(auth, (u) => {
    currentUid = u ? u.uid : null;
    resolveAuthReady();
  });
} else {
  resolveAuthReady();
}

function firestoreReady() {
  return Boolean(isConfigured && db && currentUid);
}

/* ---------- localStorage backend (guests, or Firebase not configured) ---------- */

function readAll() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeAll(store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    /* storage full or unavailable — fail silently, same as before */
  }
}

const localBackend = {
  async get(key) {
    const store = readAll();
    if (!(key in store)) throw new Error(`Key not found: ${key}`);
    return { key, value: store[key] };
  },
  async set(key, value) {
    const store = readAll();
    store[key] = value;
    writeAll(store);
    return { key, value };
  },
  async delete(key) {
    const store = readAll();
    const existed = key in store;
    delete store[key];
    writeAll(store);
    return { key, deleted: existed };
  },
  async list(prefix = "") {
    const store = readAll();
    const keys = Object.keys(store).filter((k) => k.startsWith(prefix));
    return { keys, prefix };
  },
};

/* ---------- Firestore backend (signed-in users) ----------
   Each key/value pair lives at users/{uid}/kv/{key}, matching the
   security rules already in firestore.rules — each user can only ever
   read or write documents under their own uid. */

const firestoreBackend = {
  async get(key) {
    const ref = doc(db, "users", currentUid, "kv", key);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Key not found: ${key}`);
    return { key, value: snap.data().value };
  },
  async set(key, value) {
    const ref = doc(db, "users", currentUid, "kv", key);
    await setDoc(ref, { value, updatedAt: new Date().toISOString() });
    return { key, value };
  },
  async delete(key) {
    const ref = doc(db, "users", currentUid, "kv", key);
    await deleteDoc(ref);
    return { key, deleted: true };
  },
  async list(prefix = "") {
    const colRef = collection(db, "users", currentUid, "kv");
    const q = query(colRef, orderBy(documentId()), startAt(prefix), endAt(prefix + "\uf8ff"));
    const snap = await getDocs(q);
    const keys = snap.docs.map((d) => d.id);
    return { keys, prefix };
  },
};

export const storage = {
  async get(key) {
    await authReady;
    return firestoreReady() ? firestoreBackend.get(key) : localBackend.get(key);
  },
  async set(key, value) {
    await authReady;
    return firestoreReady() ? firestoreBackend.set(key, value) : localBackend.set(key, value);
  },
  async delete(key) {
    await authReady;
    return firestoreReady() ? firestoreBackend.delete(key) : localBackend.delete(key);
  },
  async list(prefix = "") {
    await authReady;
    return firestoreReady() ? firestoreBackend.list(prefix) : localBackend.list(prefix);
  },
};
