"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth-context";
import {
  GROUND,
  SURFACE,
  PARCHMENT,
  MUTED,
  FAINT,
  EMBER,
  EMBER_SOFT,
  BORDER,
} from "../lib/theme";

export default function AuthModal({ onClose }) {
  const { authEnabled, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter an email and password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      onClose();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(36,26,16,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: GROUND,
          borderRadius: "20px 20px 0 0",
          padding: "22px 20px 34px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 6 }}
          >
            <X size={18} />
          </button>
        </div>

        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 22,
            color: PARCHMENT,
            margin: "0 0 6px",
          }}
        >
          {mode === "signup" ? "Create an account" : "Welcome back"}
        </h2>
        <p style={{ fontSize: 13.5, color: MUTED, margin: "0 0 20px", lineHeight: 1.5 }}>
          {authEnabled
            ? "Sign in to keep your journal synced across devices."
            : "Accounts aren't set up on this deployment yet."}
        </p>

        {!authEnabled && (
          <p style={{ fontSize: 13, color: FAINT, marginBottom: 16 }}>
            This will work once Firebase is configured for this project. Until then, everything still
            saves normally on this device.
          </p>
        )}

        <div style={{ opacity: authEnabled ? 1 : 0.5, pointerEvents: authEnabled ? "auto" : "none" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle()}
          />

          {error && <p style={{ color: "#E0313D", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={busy}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: EMBER,
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 15,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {busy && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <button
            onClick={handleGoogle}
            disabled={busy}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              background: SURFACE,
              color: PARCHMENT,
              fontWeight: 500,
              fontSize: 14.5,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            Continue with Google
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: MUTED }}>
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              style={{ background: "none", border: "none", color: EMBER, fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              {mode === "signup" ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function inputStyle() {
  return {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
    background: SURFACE,
    color: PARCHMENT,
    fontSize: 14.5,
    fontFamily: "'Inter', sans-serif",
    marginBottom: 10,
    boxSizing: "border-box",
    outline: "none",
  };
}

function friendlyError(e) {
  const code = e?.code || "";
  if (code.includes("invalid-email")) return "That email doesn't look right.";
  if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential"))
    return "Email or password didn't match.";
  if (code.includes("email-already-in-use")) return "An account already exists with that email.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  return e?.message || "Something went wrong. Try again.";
}
