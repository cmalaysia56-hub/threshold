import Link from "next/link";
import { MUTED, PARCHMENT, FAINT } from "../lib/theme";

export default function Breadcrumbs({ trail }) {
  // trail: [{ label, href }] — last item has no href (current page)
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 22 }}>
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
          listStyle: "none",
          padding: 0,
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
        }}
      >
        {trail.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {item.href ? (
              <Link href={item.href} style={{ color: MUTED, textDecoration: "none" }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: PARCHMENT }}>{item.label}</span>
            )}
            {i < trail.length - 1 && <span style={{ color: FAINT }}>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
