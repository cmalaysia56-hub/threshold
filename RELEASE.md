# Threshold — Version 1.0 Release Notes

**Status:** Frozen. This document describes the codebase exactly as it stands at the point of freeze. No functionality described here should change without a version bump.

**Stack:** Next.js 14 (App Router), React 18, server-rendered/statically generated, deployable on Vercel. AI guidance powered by the Anthropic API via a private server route. Persistence via a swappable storage adapter (currently `localStorage`; see Roadmap 1.1 for accounts).

---

## 1. Core Decision Engine

- **Two entry paths** into every session: free-text ("Tell me what's going on") or a guided 4-question flow ("Walk me through it"), with an optional life-area tag (Relationships, Work & Calling, Money & Provision, Family, Health & Body, A Conflict, A Major Change, Something Else).
- **Guidance generation**: a server-side API route (`/api/guidance`) sends the situation to Claude with a fixed system prompt and returns a structured response — a reflection, exactly 2 scripture passages (KJV and AMPC), exactly 3 action steps, one reflection question, and a short prayer. The API key never reaches the browser.
- **Crisis safety net**: situation text is checked against a crisis-language pattern; if matched, a persistent 988 Suicide & Crisis Lifeline banner surfaces automatically regardless of entry path.

## 2. Action Plan

- Each of the 3 generated steps is individually checkable.
- Completion state persists to the saved journal entry if the reflection has been saved; otherwise it lives in session memory until saved.
- A live "X of Y done" counter tracks progress per reflection.
- Backward-compatible: older saved entries (plain-string steps) are normalized on load with no migration needed.

## 3. Journal (Decision History)

- Save, revisit, and delete any reflection.
- Each saved record stores: area, original narrative, full guidance result, save timestamp, action plan state, and follow-up responses.
- "Recent" preview on the Home screen surfaces the last 2 saved reflections.

## 4. Decision Timeline

- The Journal screen offers category filter chips, built dynamically from whatever categories actually exist in the user's saved history (not hardcoded), so old and new data both filter correctly.
- Distinct empty states for "no journal entries at all" vs. "no entries under this filter."

## 5. Follow-Up System

- Automatic in-app check-in prompts at 7 days, 30 days, 90 days, 6 months, and 1 year after a decision is saved, computed from the save timestamp (no external scheduler required).
- Each check-in asks: Did you make the decision? How did it go? Would you change anything? What did God teach you?
- Answered check-ins are logged with date and summary beneath the prompt. "Not right now" defers without marking answered.

## 6. Scripture Presentation

- Every scripture passage is shown in both KJV and AMPC, toggleable via a pill switch.

## 7. Design System

- Vibrant, warm palette: bright cream background, saturated coral-orange primary accent, vibrant teal secondary accent, red for crisis/emphasis. Deep espresso text (not flat black).
- Typography: Fraunces (display/serif), Inter (body), IBM Plex Mono (labels/citations/eyebrows).
- All tokens centralized in `lib/theme.js` — a single source of truth shared by the app and the public site.
- Mobile-first single-column layout throughout.

## 8. Public Decision Library

- **4 published topics** at launch: *Should I leave my church?*, *How do I forgive someone who hurt me?*, *How do I hear God's voice?*, *Should Christians date unbelievers?*
- Each page includes: Question, Short Answer, Biblical Principles, Relevant Scriptures (KJV + AMPC), Reflection Questions, Prayer, Common Mistakes, Related Decisions, FAQ, and a closing CTA back into the app.
- `/decisions` — library index, grouped by category.
- `/decisions/[slug]` — individual pages, statically generated at build time (confirmed via production build).
- Content lives in one flat data file (`lib/decisions.js`) in a predictable shape, so a future admin CMS can read/write the same records without page code changes.

## 9. SEO Infrastructure

- Per-page `<title>`, meta description, canonical URL, Open Graph and Twitter Card metadata.
- Dynamic, branded Open Graph image generated per decision page.
- Structured data (JSON-LD) on every decision page: `Article`, `FAQPage`, and `BreadcrumbList`.
- Auto-generated `/sitemap.xml`, rebuilt from the same content list — adding a topic to `lib/decisions.js` adds it to the sitemap automatically.
- Auto-generated `/robots.txt` pointing to the sitemap.
- All verified against a live-served production build, not inferred from source.

## 10. Production Architecture

- Real Next.js App Router project — not a preview artifact. Deployable to Vercel with zero additional config beyond an environment variable.
- Storage and AI-call logic isolated into single-responsibility modules (`lib/storage.js`, `app/api/guidance/route.js`) specifically so they can be swapped for real infrastructure later without touching UI code.

---

## Known Limitations in 1.0

- **No real user accounts.** Journal data lives in browser `localStorage` — tied to one device/browser, not synced across devices, lost if browser storage is cleared.
- **No Firebase or any database.** Not yet built.
- **No admin interface.** New Decision Library content requires a code change and redeploy.
- **No in-app or site-wide search.**
- **No monetization.** No premium tier, no payment infrastructure.
- **No push notifications.** Follow-Up System is in-app only, surfaced on next visit.
- **Decision Library has 4 topics**, not the thousands needed for the stated SEO scale goal.
- **`SITE_URL` is a placeholder** (`https://example.com`) and must be set to the real domain before deployment.

## File Manifest

```
threshold-app/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── robots.js
│   ├── sitemap.js
│   ├── api/guidance/route.js
│   └── decisions/
│       ├── page.js
│       └── [slug]/
│           ├── page.js
│           └── opengraph-image.jsx
├── components/
│   ├── ThresholdApp.jsx
│   ├── PublicHeader.jsx
│   ├── Breadcrumbs.jsx
│   └── DecisionCTA.jsx
├── lib/
│   ├── theme.js
│   ├── storage.js
│   └── decisions.js
├── .env.example
├── package.json
└── README.md
```
