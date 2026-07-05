import Link from "next/link";
import { Sun } from "lucide-react";
import { GROUND, EMBER, PARCHMENT, BORDER } from "../lib/theme";

export default function PublicHeader() {
  return (
    <header style={{ borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "18px 20px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <Sun size={18} color={EMBER} />
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 18,
              fontWeight: 500,
              color: PARCHMENT,
            }}
          >
            Threshold
          </span>
        </Link>
      </div>
    </header>
  );
}
