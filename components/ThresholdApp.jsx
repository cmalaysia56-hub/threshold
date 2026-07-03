"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sun,
  MessageSquare,
  ListChecks,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Clock,
  Bookmark,
  X,
  Loader2,
  Phone,
  Trash2,
  Check,
  Bell,
  User,
} from "lucide-react";
import {
  GROUND,
  SURFACE,
  SURFACE_RAISED,
  PARCHMENT,
  MUTED,
  FAINT,
  EMBER,
  EMBER_SOFT,
  SAGE,
  SAGE_SOFT,
  CLAY,
  CLAY_SOFT,
  BORDER,
  BORDER_SOFT,
  FONTS,
} from "../lib/theme";
import { storage } from "../lib/storage";
import { useAuth } from "../lib/auth-context";
import AuthModal from "./AuthModal";

const AREAS = [
  "Relationships",
  "Work & Calling",
  "Money & Provision",
  "Family",
  "Health & Body",
  "A Conflict",
  "A Major Change",
  "Something Else",
];

const CRISIS_PATTERN =
  /(kill myself|end my life|ending it all|suicid|want to die|don'?t want to (be alive|live)|hurt myself|self[\s-]?harm|no reason to live|better off dead)/i;

// Follow-Up System: rather than relying on push notifications (not available
// in this environment), Threshold surfaces a check-in prompt inside the app
// once enough time has passed since a decision was saved. Ordered soonest
// to furthest out — getDueFollowUp returns the earliest one that's both
// elapsed and not yet answered.
const FOLLOW_UP_WINDOWS = [
  { key: "day7", days: 7, label: "7 Days" },
  { key: "day30", days: 30, label: "30 Days" },
  { key: "day90", days: 90, label: "90 Days" },
  { key: "month6", days: 182, label: "6 Months" },
  { key: "year1", days: 365, label: "1 Year" },
];

function getDueFollowUp(savedAt, followUps) {
  if (!savedAt) return null;
  const daysElapsed = (Date.now() - new Date(savedAt).getTime()) / 86400000;
  for (const w of FOLLOW_UP_WINDOWS) {
    const done = followUps && followUps[w.key] && followUps[w.key].answered;
    if (daysElapsed >= w.days && !done) return w;
  }
  return null;
}

// Steps arrive from guidance as plain strings, and older saved journal
// entries only ever stored plain strings. Normalizing to {id, text, done}
// here — once, at the point of entry — keeps every downstream screen simple
// and keeps existing saved records readable without a migration.
function normalizeSteps(steps) {
  return (steps || []).map((s, i) =>
    typeof s === "string" ? { id: i, text: s, done: false } : { id: i, ...s }
  );
}

// The system prompt and Anthropic call now live server-side in
// app/api/guidance/route.js, since a real deployed site can't expose an
// API key in browser code the way the Claude.ai artifact sandbox could.
// This function's contract to the rest of the component is unchanged.
async function askForGuidance({ area, narrative }) {
  const response = await fetch("/api/guidance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ area, narrative }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data;
}

/* ============================================================
   Small building blocks
   ------------------------------------------------------------ */

function Eyebrow({ children, color = MUTED }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        marginBottom: 10,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, icon, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "15px 20px",
        borderRadius: 12,
        border: "none",
        background: disabled ? "rgba(232,84,30,0.35)" : EMBER,
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: 15,
        cursor: disabled ? "default" : "pointer",
        transition: "transform 0.15s ease, background 0.15s ease",
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
      {icon}
    </button>
  );
}

function GhostButton({ children, onClick, icon, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "13px 18px",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: "transparent",
        color: PARCHMENT,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: 14,
        cursor: "pointer",
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function DawnBar({ animated = true }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 3,
        width: "100%",
        borderRadius: 2,
        background: `linear-gradient(90deg, ${EMBER} 0%, #FFB627 35%, ${SAGE} 70%, ${EMBER} 100%)`,
        backgroundSize: "220% 100%",
        animation: animated ? "dawnShift 7s ease-in-out infinite" : "none",
      }}
    />
  );
}

function CrisisBanner({ onDismiss }) {
  return (
    <div
      style={{
        background: CLAY_SOFT,
        border: `1px solid rgba(224,49,61,0.4)`,
        borderRadius: 14,
        padding: "16px 16px",
        marginBottom: 20,
        position: "relative",
      }}
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "none",
          border: "none",
          color: MUTED,
          cursor: "pointer",
          padding: 4,
        }}
      >
        <X size={15} />
      </button>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingRight: 20 }}>
        <Phone size={17} color={CLAY} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: PARCHMENT, marginBottom: 4 }}>
            You don't have to carry this alone
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, lineHeight: 1.6, color: MUTED, margin: 0 }}>
            If you're thinking about suicide or self-harm, please reach out right now — call or text{" "}
            <strong style={{ color: PARCHMENT }}>988</strong> (Suicide & Crisis Lifeline), free and available
            any hour, day or night.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Main app
   ------------------------------------------------------------ */

export default function Threshold() {
  const { user, signOutUser } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [screen, setScreen] = useState("home"); // home | free | guided | loading | result | history
  const [area, setArea] = useState(null);
  const [freeText, setFreeText] = useState("");
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedArea, setGuidedArea] = useState(null);
  const [guidedAnswers, setGuidedAnswers] = useState({ decision: "", pull1: "", pull2: "", fear: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [translation, setTranslation] = useState("kjv");
  const [showCrisis, setShowCrisis] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [savedThisResult, setSavedThisResult] = useState(false);
  const [pendingMeta, setPendingMeta] = useState(null); // { area, narrative }
  const [currentReflectionId, setCurrentReflectionId] = useState(null);
  const [currentSavedAt, setCurrentSavedAt] = useState(null);
  const [currentFollowUps, setCurrentFollowUps] = useState({});
  const [followUpFormOpen, setFollowUpFormOpen] = useState(false);
  const [followUpDraft, setFollowUpDraft] = useState({ decisionMade: null, howItWent: "", wouldChange: "", whatGodTaught: "" });
  const [dismissedFollowUpKey, setDismissedFollowUpKey] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("All");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
  }, [screen]);

  const loadHistory = useCallback(async () => {
    try {
      const listing = await storage.list("reflections:");
      const keys = (listing && listing.keys) || [];
      const items = [];
      for (const k of keys) {
        try {
          const got = await storage.get(k);
          if (got && got.value) items.push(JSON.parse(got.value));
        } catch (e) {
          /* skip unreadable entry */
        }
      }
      items.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      setHistory(items);
    } catch (e) {
      setHistory([]);
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function resetFlow() {
    setArea(null);
    setFreeText("");
    setGuidedStep(0);
    setGuidedArea(null);
    setGuidedAnswers({ decision: "", pull1: "", pull2: "", fear: "" });
    setResult(null);
    setError(null);
    setShowCrisis(false);
    setSavedThisResult(false);
    setPendingMeta(null);
    setCurrentReflectionId(null);
    setCurrentSavedAt(null);
    setCurrentFollowUps({});
    setFollowUpFormOpen(false);
    setFollowUpDraft({ decisionMade: null, howItWent: "", wouldChange: "", whatGodTaught: "" });
    setDismissedFollowUpKey(null);
  }

  async function submitNarrative(narrativeArea, narrative) {
    if (CRISIS_PATTERN.test(narrative)) setShowCrisis(true);
    setPendingMeta({ area: narrativeArea, narrative });
    setCurrentReflectionId(null);
    setCurrentSavedAt(null);
    setCurrentFollowUps({});
    setFollowUpFormOpen(false);
    setDismissedFollowUpKey(null);
    setSavedThisResult(false);
    setScreen("loading");
    setError(null);
    try {
      const guidance = await askForGuidance({ area: narrativeArea, narrative });
      setResult({ ...guidance, steps: normalizeSteps(guidance.steps) });
      setScreen("result");
    } catch (e) {
      setError("Something interrupted that. Try again in a moment.");
      setScreen("free");
    }
  }

  // Opens a previously saved journal entry into the result screen, restoring
  // which record it belongs to so Action Plan checkbox changes and Follow-Up
  // responses save back to the same entry instead of creating a duplicate.
  function openSavedResult(record) {
    setResult({ ...record.result, steps: normalizeSteps(record.result.steps) });
    setPendingMeta({ area: record.area, narrative: record.narrative });
    setCurrentReflectionId(record.id);
    setCurrentSavedAt(record.savedAt);
    setCurrentFollowUps(record.followUps || {});
    setFollowUpFormOpen(false);
    setDismissedFollowUpKey(null);
    setSavedThisResult(true);
    setScreen("result");
  }

  async function saveCurrentReflection() {
    if (!result || !pendingMeta) return;
    try {
      const id = currentReflectionId || `reflections:${Date.now()}`;
      const savedAt = currentSavedAt || new Date().toISOString();
      const record = {
        id,
        area: pendingMeta.area,
        narrative: pendingMeta.narrative,
        result,
        savedAt,
        followUps: currentFollowUps,
      };
      const res = await storage.set(id, JSON.stringify(record));
      if (res) {
        setCurrentReflectionId(id);
        setCurrentSavedAt(savedAt);
        setSavedThisResult(true);
        loadHistory();
      }
    } catch (e) {
      /* silent — saving is a nicety, not the core function */
    }
  }

  // Toggles one Action Plan step's completion state. If this reflection is
  // already saved to the journal, the change is persisted immediately so
  // progress isn't lost; if it isn't saved yet, the toggle just lives in
  // local state until the person chooses to save.
  function toggleStep(index) {
    setResult((prev) => {
      if (!prev) return prev;
      const updatedSteps = prev.steps.map((s, i) => (i === index ? { ...s, done: !s.done } : s));
      const updated = { ...prev, steps: updatedSteps };
      if (currentReflectionId && pendingMeta) {
        const record = {
          id: currentReflectionId,
          area: pendingMeta.area,
          narrative: pendingMeta.narrative,
          result: updated,
          savedAt: currentSavedAt || new Date().toISOString(),
          followUps: currentFollowUps,
        };
        storage.set(currentReflectionId, JSON.stringify(record)).then(() => loadHistory());
      }
      return updated;
    });
  }

  // Records a check-in response for whichever follow-up window is currently
  // due (7 days, 30 days, 90 days, 6 months, 1 year) and persists it onto
  // the saved decision record.
  async function submitFollowUp(windowKey) {
    if (!currentReflectionId || !pendingMeta) return;
    const entry = { ...followUpDraft, answered: true, respondedAt: new Date().toISOString() };
    const updatedFollowUps = { ...currentFollowUps, [windowKey]: entry };
    setCurrentFollowUps(updatedFollowUps);
    setFollowUpFormOpen(false);
    setFollowUpDraft({ decisionMade: null, howItWent: "", wouldChange: "", whatGodTaught: "" });
    try {
      const record = {
        id: currentReflectionId,
        area: pendingMeta.area,
        narrative: pendingMeta.narrative,
        result,
        savedAt: currentSavedAt,
        followUps: updatedFollowUps,
      };
      await storage.set(currentReflectionId, JSON.stringify(record));
      loadHistory();
    } catch (e) {
      /* silent — the response still lives in local state for this session */
    }
  }

  async function deleteReflection(id) {
    try {
      await storage.delete(id);
      setHistory((h) => h.filter((r) => r.id !== id));
      if (currentReflectionId === id) {
        setCurrentReflectionId(null);
        setCurrentSavedAt(null);
        setCurrentFollowUps({});
      }
    } catch (e) {
      /* no-op */
    }
  }

  const guidedQuestions = [
    { key: "decision", label: "What's the decision in front of you?", placeholder: "Say it plainly, even if it's messy." },
    { key: "pull1", label: "What's pulling you toward one option?", placeholder: "The reasons, the hopes, the pressure." },
    { key: "pull2", label: "What's pulling you toward the other?", placeholder: "The other side of it." },
    { key: "fear", label: "What are you most afraid might happen?", placeholder: "Optional, but often the real thing." },
  ];

  function guidedNarrativeText() {
    return [
      `Decision: ${guidedAnswers.decision}`,
      guidedAnswers.pull1 ? `Pulling one way: ${guidedAnswers.pull1}` : null,
      guidedAnswers.pull2 ? `Pulling the other way: ${guidedAnswers.pull2}` : null,
      guidedAnswers.fear ? `Underlying fear: ${guidedAnswers.fear}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const page = {
    minHeight: "100vh",
    background: GROUND,
    color: PARCHMENT,
    fontFamily: "'Inter', sans-serif",
  };

  const shell = {
    maxWidth: 480,
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const header = (
    <div style={{ padding: "18px 20px 0" }}>
      <DawnBar animated={screen === "loading"} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0 18px",
        }}
      >
        <button
          onClick={() => {
            resetFlow();
            setScreen("home");
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 0,
          }}
        >
          <Sun size={18} color={EMBER} />
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 18,
              fontWeight: 500,
              color: PARCHMENT,
              letterSpacing: "0.01em",
            }}
          >
            Threshold
          </span>
        </button>
        {screen !== "history" && (
          <button
            onClick={() => setScreen("history")}
            aria-label="Your journal"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: MUTED,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Clock size={16} />
            Journal
          </button>
        )}
        <button
          onClick={() => (user ? signOutUser() : setAuthModalOpen(true))}
          aria-label={user ? "Sign out" : "Sign in"}
          title={user ? user.email : "Sign in"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: user ? EMBER : MUTED,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            marginLeft: 14,
          }}
        >
          <User size={16} />
          {user ? "Sign out" : "Sign in"}
        </button>
      </div>
    </div>
  );

  /* ---------------- HOME ---------------- */
  function HomeScreen() {
    return (
      <div style={{ padding: "8px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ marginTop: 18, marginBottom: 34 }}>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: "normal",
              fontWeight: 500,
              fontSize: 32,
              lineHeight: 1.18,
              margin: "0 0 14px",
              color: PARCHMENT,
            }}
          >
            You're standing at a <em style={{ fontStyle: "italic", color: EMBER }}>threshold.</em>
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: MUTED, margin: 0, maxWidth: 380 }}>
            Bring what you're facing. Leave with clarity, Scripture, and a next step you can actually take.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => setScreen("free")}
            style={{
              textAlign: "left",
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: EMBER_SOFT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MessageSquare size={18} color={EMBER} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15.5, color: PARCHMENT, marginBottom: 4 }}>
                Tell me what's going on
              </div>
              <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>
                Write it in your own words, however it comes out.
              </div>
            </div>
            <ArrowRight size={17} color={FAINT} style={{ marginLeft: "auto", marginTop: 8, flexShrink: 0 }} />
          </button>

          <button
            onClick={() => setScreen("guided")}
            style={{
              textAlign: "left",
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: SAGE_SOFT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ListChecks size={18} color={SAGE} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15.5, color: PARCHMENT, marginBottom: 4 }}>
                Walk me through it
              </div>
              <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>
                A few short questions, if a blank page feels harder.
              </div>
            </div>
            <ArrowRight size={17} color={FAINT} style={{ marginLeft: "auto", marginTop: 8, flexShrink: 0 }} />
          </button>
        </div>

        {historyLoaded && history.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <Eyebrow>Recent</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.slice(0, 2).map((r) => (
                <button
                  key={r.id}
                  onClick={() => openSavedResult(r)}
                  style={{
                    textAlign: "left",
                    background: "transparent",
                    border: `1px solid ${BORDER_SOFT}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    cursor: "pointer",
                    color: MUTED,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: PARCHMENT, fontWeight: 500 }}>{r.area || "A decision"}</span>
                  {" — "}
                  {r.narrative.slice(0, 60)}
                  {r.narrative.length > 60 ? "…" : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 30 }}>
          <a
            href="/decisions"
            style={{
              display: "inline-block",
              fontSize: 13,
              color: SAGE,
              textDecoration: "none",
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Browse the Decision Library →
          </a>
          <p style={{ fontSize: 12, color: FAINT, lineHeight: 1.6, margin: 0 }}>
            Threshold offers guidance rooted in Scripture. It isn't a substitute for your pastor, counselor,
            or doctor — especially in a crisis.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- FREE TEXT ---------------- */
  function FreeScreen() {
    const wordOk = freeText.trim().length > 0;
    return (
      <div style={{ padding: "8px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
        <button
          onClick={() => setScreen("home")}
          style={{ background: "none", border: "none", color: MUTED, display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 22, cursor: "pointer", fontSize: 13 }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 24, margin: "0 0 8px", color: PARCHMENT }}>
          What's going on?
        </h2>
        <p style={{ fontSize: 14, color: MUTED, margin: "0 0 18px", lineHeight: 1.55 }}>
          Say as much or as little as you need to. No detail is too small.
        </p>

        <div style={{ marginBottom: 16 }}>
          <Eyebrow>Life area (optional)</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {AREAS.map((a) => (
              <button
                key={a}
                onClick={() => setArea(area === a ? null : a)}
                style={{
                  padding: "8px 13px",
                  borderRadius: 20,
                  border: `1px solid ${area === a ? EMBER : BORDER}`,
                  background: area === a ? EMBER_SOFT : "transparent",
                  color: area === a ? EMBER : MUTED,
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="I've been offered a job in another city, and I don't know if I should take it because..."
          rows={9}
          style={{
            width: "100%",
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: 16,
            color: PARCHMENT,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14.5,
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ color: CLAY, fontSize: 13, marginTop: 10 }}>{error}</p>
        )}

        <div style={{ marginTop: 20 }}>
          <PrimaryButton
            disabled={!wordOk}
            onClick={() => submitNarrative(area, freeText.trim())}
            icon={<ArrowRight size={17} />}
          >
            Get guidance
          </PrimaryButton>
        </div>
      </div>
    );
  }

  /* ---------------- GUIDED ---------------- */
  function GuidedScreen() {
    if (guidedArea === null) {
      return (
        <div style={{ padding: "8px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
          <button
            onClick={() => setScreen("home")}
            style={{ background: "none", border: "none", color: MUTED, display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 22, cursor: "pointer", fontSize: 13 }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 24, margin: "0 0 8px" }}>
            What area of life is this?
          </h2>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 20px", lineHeight: 1.55 }}>
            This helps shape the questions that follow.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {AREAS.map((a) => (
              <button
                key={a}
                onClick={() => setGuidedArea(a)}
                style={{
                  textAlign: "left",
                  padding: "15px 16px",
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  background: SURFACE,
                  color: PARCHMENT,
                  fontSize: 14.5,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {a}
                <ArrowRight size={15} color={FAINT} />
              </button>
            ))}
          </div>
        </div>
      );
    }

    const q = guidedQuestions[guidedStep];
    const isLast = guidedStep === guidedQuestions.length - 1;
    const currentVal = guidedAnswers[q.key];
    const canAdvance = q.key === "fear" ? true : currentVal.trim().length > 0;

    return (
      <div style={{ padding: "8px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
        <button
          onClick={() => (guidedStep === 0 ? setGuidedArea(null) : setGuidedStep((s) => s - 1))}
          style={{ background: "none", border: "none", color: MUTED, display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 22, cursor: "pointer", fontSize: 13 }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
          {guidedQuestions.map((_, i) => (
            <div
              key={i}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 2,
                background: i <= guidedStep ? SAGE : BORDER,
              }}
            />
          ))}
        </div>

        <Eyebrow color={SAGE}>{guidedArea}</Eyebrow>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 23, margin: "0 0 18px", lineHeight: 1.3 }}>
          {q.label}
        </h2>

        <textarea
          value={currentVal}
          onChange={(e) => setGuidedAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
          placeholder={q.placeholder}
          rows={6}
          autoFocus
          style={{
            width: "100%",
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: 16,
            color: PARCHMENT,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14.5,
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div style={{ marginTop: 20 }}>
          <PrimaryButton
            disabled={!canAdvance}
            onClick={() => {
              if (isLast) {
                submitNarrative(guidedArea, guidedNarrativeText());
              } else {
                setGuidedStep((s) => s + 1);
              }
            }}
            icon={<ArrowRight size={17} />}
            style={{ background: canAdvance ? SAGE : "rgba(14,149,148,0.35)" }}
          >
            {isLast ? "Get guidance" : "Next"}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  /* ---------------- LOADING ---------------- */
  function LoadingScreen() {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <Loader2 size={26} color={EMBER} style={{ animation: "spin 1.4s linear infinite", marginBottom: 18 }} />
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 17, color: MUTED, textAlign: "center" }}>
          Weighing it in the light of Scripture…
        </p>
      </div>
    );
  }

  /* ---------------- RESULT ---------------- */
  function ResultScreen() {
    if (!result) return null;
    return (
      <div style={{ padding: "8px 20px 50px", flex: 1 }}>
        {showCrisis && <CrisisBanner onDismiss={() => setShowCrisis(false)} />}

        <Eyebrow color={EMBER}>What's really going on</Eyebrow>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19, lineHeight: 1.5, color: PARCHMENT, margin: "0 0 30px" }}>
          {result.reflection}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Eyebrow>What Scripture says</Eyebrow>
          <div style={{ display: "flex", gap: 4, background: SURFACE, borderRadius: 20, padding: 3 }}>
            {["kjv", "ampc"].map((t) => (
              <button
                key={t}
                onClick={() => setTranslation(t)}
                style={{
                  padding: "5px 11px",
                  borderRadius: 16,
                  border: "none",
                  background: translation === t ? EMBER : "transparent",
                  color: translation === t ? "#FFFFFF" : MUTED,
                  fontSize: 11,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
          {(result.scriptures || []).map((s, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18 }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: EMBER,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {s.reference}
              </div>
              <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 15.5, lineHeight: 1.55, color: PARCHMENT, margin: "0 0 10px" }}>
                "{translation === "kjv" ? s.kjv : s.ampc}"
              </p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: 0 }}>{s.why}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <Eyebrow color={SAGE}>Action plan</Eyebrow>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: FAINT, letterSpacing: "0.04em" }}>
            {(result.steps || []).filter((s) => s.done).length} of {(result.steps || []).length} done
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}>
          {(result.steps || []).map((step, i) => (
            <button
              key={step.id ?? i}
              onClick={() => toggleStep(i)}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                background: step.done ? "rgba(14,149,148,0.06)" : "transparent",
                border: "none",
                borderRadius: 10,
                padding: "6px 8px",
                margin: "0 -8px",
                cursor: "pointer",
                textAlign: "left",
                width: "calc(100% + 16px)",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: step.done ? SAGE : SAGE_SOFT,
                  color: step.done ? "#FFFFFF" : SAGE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                  flexShrink: 0,
                  marginTop: 1,
                  transition: "background 0.15s ease",
                }}
              >
                {step.done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </div>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: step.done ? FAINT : PARCHMENT,
                  textDecoration: step.done ? "line-through" : "none",
                  margin: 0,
                }}
              >
                {step.text}
              </p>
            </button>
          ))}
        </div>

        <div style={{ background: "rgba(240,233,218,0.04)", borderRadius: 14, padding: 18, marginBottom: 18, border: `1px solid ${BORDER_SOFT}` }}>
          <Eyebrow>Sit with this</Eyebrow>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: PARCHMENT, margin: 0 }}>
            {result.reflectionQuestion}
          </p>
        </div>

        <div style={{ background: EMBER_SOFT, borderRadius: 14, padding: 18, marginBottom: 30, border: `1px solid rgba(232,84,30,0.25)` }}>
          <Eyebrow color={EMBER}>A prayer</Eyebrow>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: PARCHMENT, margin: 0 }}>{result.prayer}</p>
        </div>

        {savedThisResult && currentReflectionId && (() => {
          const dueWindow = getDueFollowUp(currentSavedAt, currentFollowUps);
          const answeredEntries = FOLLOW_UP_WINDOWS.filter(
            (w) => currentFollowUps[w.key] && currentFollowUps[w.key].answered
          );

          return (
            <div style={{ marginBottom: 30 }}>
              <Eyebrow color={SAGE}>Follow-up</Eyebrow>

              {dueWindow && dismissedFollowUpKey !== dueWindow.key && !followUpFormOpen && (
                <div style={{ background: SAGE_SOFT, border: `1px solid rgba(14,149,148,0.35)`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Bell size={16} color={SAGE} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: PARCHMENT, marginBottom: 4 }}>
                        {dueWindow.label} check-in
                      </div>
                      <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: "0 0 14px" }}>
                        It's been at least {dueWindow.label.toLowerCase()} since you brought this decision. Worth a moment to look back.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <GhostButton
                          onClick={() => setFollowUpFormOpen(true)}
                          style={{ padding: "9px 14px", fontSize: 13, borderColor: SAGE, color: SAGE }}
                        >
                          Answer now
                        </GhostButton>
                        <GhostButton
                          onClick={() => setDismissedFollowUpKey(dueWindow.key)}
                          style={{ padding: "9px 14px", fontSize: 13 }}
                        >
                          Not right now
                        </GhostButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dueWindow && followUpFormOpen && (
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: PARCHMENT, marginBottom: 14 }}>
                    {dueWindow.label} check-in
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 13.5, color: MUTED, margin: "0 0 8px" }}>Did you make the decision?</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["Yes", "No", "Still deciding"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFollowUpDraft((d) => ({ ...d, decisionMade: opt }))}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 18,
                            border: `1px solid ${followUpDraft.decisionMade === opt ? SAGE : BORDER}`,
                            background: followUpDraft.decisionMade === opt ? SAGE_SOFT : "transparent",
                            color: followUpDraft.decisionMade === opt ? SAGE : MUTED,
                            fontSize: 12.5,
                            cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {[
                    { key: "howItWent", label: "How did it go?" },
                    { key: "wouldChange", label: "Would you change anything?" },
                    { key: "whatGodTaught", label: "What did God teach you through it?" },
                  ].map((f) => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 13.5, color: MUTED, margin: "0 0 8px" }}>{f.label}</p>
                      <textarea
                        value={followUpDraft[f.key]}
                        onChange={(e) => setFollowUpDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                        rows={3}
                        style={{
                          width: "100%",
                          background: GROUND,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 10,
                          padding: 12,
                          color: PARCHMENT,
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          lineHeight: 1.55,
                          resize: "vertical",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryButton
                      onClick={() => submitFollowUp(dueWindow.key)}
                      style={{ background: SAGE, flex: 1 }}
                    >
                      Save check-in
                    </PrimaryButton>
                    <GhostButton onClick={() => setFollowUpFormOpen(false)} style={{ padding: "13px 18px" }}>
                      Cancel
                    </GhostButton>
                  </div>
                </div>
              )}

              {answeredEntries.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {answeredEntries.map((w) => {
                    const entry = currentFollowUps[w.key];
                    return (
                      <div key={w.key} style={{ border: `1px solid ${BORDER_SOFT}`, borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: SAGE, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {w.label} check-in
                          </span>
                          <span style={{ fontSize: 11, color: FAINT }}>
                            {new Date(entry.respondedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.decisionMade && (
                          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 4px" }}>
                            Decision made: <span style={{ color: PARCHMENT }}>{entry.decisionMade}</span>
                          </p>
                        )}
                        {entry.howItWent && (
                          <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.5 }}>{entry.howItWent}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!dueWindow && answeredEntries.length === 0 && (
                <p style={{ fontSize: 13, color: FAINT, margin: 0 }}>
                  Nothing due yet — the first check-in appears 7 days after you save a decision.
                </p>
              )}
            </div>
          );
        })()}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <GhostButton
            onClick={saveCurrentReflection}
            icon={<Bookmark size={16} color={savedThisResult ? EMBER : PARCHMENT} fill={savedThisResult ? EMBER : "none"} />}
            style={{ borderColor: savedThisResult ? EMBER : BORDER }}
          >
            {savedThisResult ? "Saved to your journal" : "Save to your journal"}
          </GhostButton>
          <PrimaryButton
            onClick={() => {
              resetFlow();
              setScreen("home");
            }}
          >
            Bring another decision
          </PrimaryButton>
        </div>
      </div>
    );
  }

  /* ---------------- HISTORY / TIMELINE ---------------- */
  function HistoryScreen() {
    const filterOptions = ["All"];
    history.forEach((r) => {
      const label = r.area || "Other";
      if (!filterOptions.includes(label)) filterOptions.push(label);
    });
    const filteredHistory =
      historyFilter === "All" ? history : history.filter((r) => (r.area || "Other") === historyFilter);

    return (
      <div style={{ padding: "8px 20px 40px", flex: 1 }}>
        <button
          onClick={() => setScreen("home")}
          style={{ background: "none", border: "none", color: MUTED, display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 22, cursor: "pointer", fontSize: 13 }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 24, margin: "0 0 20px" }}>
          Your journal
        </h2>

        {!historyLoaded && (
          <p style={{ color: MUTED, fontSize: 14 }}>Loading…</p>
        )}

        {historyLoaded && history.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px", color: FAINT }}>
            <BookOpen size={26} style={{ marginBottom: 12, opacity: 0.6 }} />
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Nothing saved yet. Reflections you save will gather here, so you can look back on what you were
              given.
            </p>
          </div>
        )}

        {historyLoaded && history.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {filterOptions.map((label) => (
              <button
                key={label}
                onClick={() => setHistoryFilter(label)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 20,
                  border: `1px solid ${historyFilter === label ? EMBER : BORDER}`,
                  background: historyFilter === label ? EMBER_SOFT : "transparent",
                  color: historyFilter === label ? EMBER : MUTED,
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {historyLoaded && history.length > 0 && filteredHistory.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: FAINT }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Nothing saved under "{historyFilter}" yet.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredHistory.map((r) => (
            <div
              key={r.id}
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: 16,
                position: "relative",
              }}
            >
              <button
                onClick={() => openSavedResult(r)}
                style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer", padding: 0, paddingRight: 26 }}
              >
                <div style={{ fontSize: 11, color: EMBER, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>
                  {r.area || "A decision"} · {new Date(r.savedAt).toLocaleDateString()}
                </div>
                <p style={{ fontSize: 14, color: PARCHMENT, margin: 0, lineHeight: 1.5 }}>
                  {r.narrative.slice(0, 110)}
                  {r.narrative.length > 110 ? "…" : ""}
                </p>
              </button>
              <button
                onClick={() => deleteReflection(r.id)}
                aria-label="Delete"
                style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: FAINT, cursor: "pointer" }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  let body;
  if (screen === "home") body = HomeScreen();
  else if (screen === "free") body = FreeScreen();
  else if (screen === "guided") body = GuidedScreen();
  else if (screen === "loading") body = LoadingScreen();
  else if (screen === "result") body = ResultScreen();
  else if (screen === "history") body = HistoryScreen();

  return (
    <div style={page}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::placeholder { color: ${FAINT}; }
        textarea:focus, input:focus { border-color: ${EMBER} !important; }
        @keyframes dawnShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
      `}</style>
      <div ref={scrollRef} style={shell}>
        {header}
        {body}
      </div>
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
