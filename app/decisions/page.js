import Link from "next/link";
import Breadcrumbs from "../../components/Breadcrumbs";
import PublicHeader from "../../components/PublicHeader";
import DecisionCTA from "../../components/DecisionCTA";
import { decisions, getAllCategories, SITE_URL } from "../../lib/decisions";
import { GROUND, SURFACE, PARCHMENT, MUTED, FAINT, EMBER, BORDER, FONTS } from "../../lib/theme";

export const metadata = {
  title: "Decision Library — Biblical Wisdom for Real-Life Questions | Threshold",
  description:
    "Browse honest, Scripture-grounded answers to the real questions Christians wrestle with — church, relationships, calling, forgiveness, and more.",
  alternates: { canonical: `${SITE_URL}/decisions` },
  openGraph: {
    title: "Decision Library | Threshold",
    description:
      "Browse honest, Scripture-grounded answers to the real questions Christians wrestle with.",
    url: `${SITE_URL}/decisions`,
    type: "website",
  },
};

export default function DecisionsIndexPage() {
  const categories = getAllCategories();

  return (
    <div style={{ minHeight: "100vh", background: GROUND }}>
      <style>{`${FONTS} * { box-sizing: border-box; }`}</style>
      <PublicHeader />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" }}>
        <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Decision Library" }]} />

        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.2,
            color: PARCHMENT,
            margin: "0 0 12px",
          }}
        >
          The Decision Library
        </h1>
        <p style={{ fontSize: 15.5, color: MUTED, lineHeight: 1.6, margin: "0 0 36px", maxWidth: 480 }}>
          Honest, Scripture-grounded answers to the questions Christians actually wrestle with. Every
          situation is different — but you're probably not the first person to face this one.
        </p>

        {categories.map((category) => (
          <div key={category} style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: EMBER,
                marginBottom: 12,
              }}
            >
              {category}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {decisions
                .filter((d) => d.category === category)
                .map((d) => (
                  <Link
                    key={d.slug}
                    href={`/decisions/${d.slug}`}
                    style={{
                      display: "block",
                      background: SURFACE,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 14,
                      padding: "16px 18px",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, color: PARCHMENT, marginBottom: 4 }}>
                      {d.question}
                    </div>
                    <div style={{ fontSize: 13.5, color: FAINT }}>
                      {d.shortAnswer.slice(0, 90)}…
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}

        <DecisionCTA />
      </main>
    </div>
  );
}
