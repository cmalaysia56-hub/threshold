import { ImageResponse } from "next/og";
import { decisions, getDecisionBySlug } from "../../../lib/decisions";

export const runtime = "edge";
export const alt = "Threshold — a decision explored through Scripture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return decisions.map((d) => ({ slug: d.slug }));
}

export default function OpengraphImage({ params }) {
  const decision = getDecisionBySlug(params.slug);
  const question = decision ? decision.question : "Threshold";
  const category = decision ? decision.category : "Decision Library";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFF9F0",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 30,
            color: "#241A10",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#E8541E",
            }}
          />
          Threshold
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#E8541E",
              fontWeight: 600,
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: 56,
              lineHeight: 1.2,
              color: "#241A10",
              fontWeight: 600,
              maxWidth: 1000,
            }}
          >
            {question}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#6E5A48" }}>
          Wisdom for the decision in front of you.
        </div>
      </div>
    ),
    { ...size }
  );
}
