// Mirrors the async get/set/delete/list interface Threshold used inside
// the Claude.ai artifact sandbox (window.storage), backed by localStorage
// instead. Kept deliberately swappable: once Threshold has real user
// accounts, replace the bodies of these four functions with fetch() calls
// to a real API — nothing in components/ThresholdApp.jsx has to change,
// since it only ever talks to this module.

const STORE_KEY = "threshold:store:v1";

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
    /* storage full or unavailable — fail silently, same as the artifact adapter did */
  }
}

export const storage = {
  async get(key) {
    const store = readAll();
    if (!(key in store)) {
      throw new Error(`Key not found: ${key}`);
    }
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
