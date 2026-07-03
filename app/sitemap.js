import { decisions, SITE_URL } from "../lib/decisions";

export default function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/decisions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  const decisionRoutes = decisions.map((d) => ({
    url: `${SITE_URL}/decisions/${d.slug}`,
    lastModified: d.datePublished,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...decisionRoutes];
}
