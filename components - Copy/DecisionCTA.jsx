import Link from "next/link";
import { EMBER, EMBER_SOFT, PARCHMENT, MUTED } from "../lib/theme";

export default function DecisionCTA() {
  return (
    <div
      style={{
        background: EMBER_SOFT,
        border: `1px solid rgba(232,84,30,0.25)`,
        borderRadius: 16,
        padding: "26px 22px",
        textAlign: "center",
        marginTop: 40,
      }}
    >
      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500,
          fontSize: 21,
          color: PARCHMENT,
          margin: "0 0 8px",
        }}
      >
        Need guidance for your unique situation?
      </h2>
      <p style={{ fontSize: 14.5, color: MUTED, margin: "0 0 18px", lineHeight: 1.55 }}>
        This is general counsel. Your situation isn't general.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: EMBER,
          color: "#FFFFFF",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 15,
          textDecoration: "none",
          padding: "13px 26px",
          borderRadius: 12,
        }}
      >
        Start your Decision Journey inside Threshold
      </Link>
    </div>
  );
}
