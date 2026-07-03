import { notFound } from "next/navigation";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PublicHeader from "../../../components/PublicHeader";
import DecisionCTA from "../../../components/DecisionCTA";
import {
  decisions,
  getDecisionBySlug,
  getRelatedDecisions,
  SITE_URL,
} from "../../../lib/decisions";
import {
  GROUND,
  SURFACE,
  PARCHMENT,
  MUTED,
  FAINT,
  EMBER,
  EMBER_SOFT,
  SAGE,
  SAGE_SOFT,
  BORDER,
  BORDER_SOFT,
  FONTS,
} from "../../../lib/theme";
import Link from "next/link";

export function generateStaticParams() {
  return decisions.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }) {
  const decision = getDecisionBySlug(params.slug);
  if (!decision) return {};

  const url = `${SITE_URL}/decisions/${decision.slug}`;

  return {
    title: decision.metaTitle,
    description: decision.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: decision.metaTitle,
      description: decision.metaDescription,
      url,
      type: "article",
      publishedTime: decision.datePublished,
    },
    twitter: {
      card: "summary_large_image",
      title: decision.metaTitle,
      description: decision.metaDescription,
    },
  };
}

function Eyebrow({ children, color = MUTED }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

export default function DecisionPage({ params }) {
  const decision = getDecisionBySlug(params.slug);
  if (!decision) notFound();

  const related = getRelatedDecisions(decision);
  const url = `${SITE_URL}/decisions/${decision.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: decision.question,
    description: decision.metaDescription,
    datePublished: decision.datePublished,
    dateModified: decision.datePublished,
    author: { "@type": "Organization", name: "Threshold" },
    publisher: { "@type": "Organization", name: "Threshold" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: decision.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Decision Library", item: `${SITE_URL}/decisions` },
      { "@type": "ListItem", position: 3, name: decision.question, item: url },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: GROUND }}>
      <style>{`${FONTS} * { box-sizing: border-box; }`}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <PublicHeader />

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 60px" }}>
        <Breadcrumbs
          trail={[
            { label: "Home", href: "/" },
            { label: "Decision Library", href: "/decisions" },
            { label: decision.question },
          ]}
        />

        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: EMBER,
            marginBottom: 10,
          }}
        >
          {decision.category}
        </div>

        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.22,
            color: PARCHMENT,
            margin: "0 0 20px",
          }}
        >
          {decision.question}
        </h1>

        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 34,
          }}
        >
          <Eyebrow color={EMBER}>Short answer</Eyebrow>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, lineHeight: 1.55, color: PARCHMENT, margin: 0 }}>
            {decision.shortAnswer}
          </p>
        </div>

        <section style={{ marginBottom: 34 }}>
          <Eyebrow color={SAGE}>Biblical principles</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {decision.principles.map((p, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${SAGE}`, paddingLeft: 14 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14.5, color: PARCHMENT, marginBottom: 3 }}>
                  {p.title}
                </div>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, margin: "0 0 4px" }}>{p.body}</p>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: FAINT }}>
                  {p.reference}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <Eyebrow>Relevant scriptures</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {decision.scriptures.map((s, i) => (
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
                  {s.reference} · KJV
                </div>
                <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 15.5, lineHeight: 1.55, color: PARCHMENT, margin: "0 0 12px" }}>
                  "{s.kjv}"
                </p>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: FAINT,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  AMPC
                </div>
                <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.55, color: MUTED, margin: 0 }}>
                  "{s.ampc}"
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 34, background: "rgba(36,26,16,0.03)", border: `1px solid ${BORDER_SOFT}`, borderRadius: 14, padding: 18 }}>
          <Eyebrow>Reflection questions</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {decision.reflectionQuestions.map((q, i) => (
              <p key={i} style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: PARCHMENT, margin: 0 }}>
                {q}
              </p>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 34, background: EMBER_SOFT, border: `1px solid rgba(232,84,30,0.25)`, borderRadius: 14, padding: 18 }}>
          <Eyebrow color={EMBER}>A prayer</Eyebrow>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: PARCHMENT, margin: 0 }}>{decision.prayer}</p>
        </section>

        <section style={{ marginBottom: 34 }}>
          <Eyebrow color={SAGE}>Common mistakes</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {decision.commonMistakes.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: SAGE,
                    flexShrink: 0,
                    marginTop: 8,
                  }}
                />
                <p style={{ fontSize: 14.5, color: PARCHMENT, lineHeight: 1.55, margin: 0 }}>{m}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <Eyebrow>Frequently asked questions</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {decision.faqs.map((f, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14.5, color: PARCHMENT, marginBottom: 5 }}>
                  {f.q}
                </div>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section style={{ marginBottom: 8 }}>
            <Eyebrow>Related decisions</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/decisions/${r.slug}`}
                  style={{
                    display: "block",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`,
                    color: PARCHMENT,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  {r.question}
                </Link>
              ))}
            </div>
          </section>
        )}

        <DecisionCTA />
      </main>
    </div>
  );
}
