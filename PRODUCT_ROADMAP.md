# Threshold — Product Roadmap: v1.1 → v2.0

This roadmap builds forward from the frozen v1.0 baseline (see `RELEASE.md`). Nothing here is implemented yet. Features are grouped by version, and within each version, ordered by recommended build sequence — later items in a version often depend on earlier ones.

**Prioritization lens used throughout:** business impact (does this move acquisition, retention, or revenue) weighed against technical complexity and dependency risk. Infrastructure that blocks other high-value features is pulled earlier even when it isn't user-visible on its own.

---

## Long-term vision

Threshold should become the largest searchable Christian decision library on the internet.

The Public Decision Library is not simply content. **It is the primary customer acquisition engine for the platform.** Every decision page is an entry point into Threshold — a person arrives through a search engine looking for an answer to one specific question, reads guidance that's genuinely useful on its own, and is offered a natural next step into the full decision experience.

This reframes how content work should be judged throughout this roadmap: growing the library isn't a content task that finishes and moves on to the next feature. It's an ongoing publishing strategy that runs continuously alongside every other version, scaling from the 4 seed pages in v1.0 toward 10,000+ pages by v2.0 and beyond.

### Content strategy standard

Every published decision page — regardless of when it's added or by whom (hand-written today, admin-published later, or eventually pipeline-generated) — must include, with no exceptions:

- SEO title
- Meta description
- Structured data (JSON-LD)
- Canonical URL
- Internal links
- Related decisions
- Reflection questions
- Prayer
- Call-to-action into the Threshold decision experience

This is already the standard the 4 v1.0 seed pages were built to. Every feature below that touches content (Content Expansion, Admin CMS, Decision Library at scale) inherits this same requirement — it is a floor, not a v2.0 aspiration.

---

## Version 1.1 — Accounts, Findability & Content Foundation

*Theme: nothing else scales without real accounts, a way to publish without a code deploy, and a way for users to actually find what's been published as the library grows.*

### 1. Firebase Auth + Firestore (real accounts, cross-device sync)
- **Purpose:** Replace the `localStorage` adapter with real user accounts and a real database, so journal data survives device changes and browser data clears.
- **Business value:** High. This is the single biggest retention risk in v1.0 — users currently lose everything if they switch devices or clear their browser. It's also a hard dependency for personalization, admin tooling, analytics tied to real users, and monetization.
- **Technical complexity:** Medium-High. Firestore schema design, security rules, auth UI (sign-in/sign-up screens don't currently exist), and migrating `lib/storage.js` internals without touching the rest of the app.
- **Dependencies:** None (this is foundational).
- **Estimated development priority:** P0.
- **Recommended implementation order:** 1st.

### 2. Admin CMS (Decision Library: create, edit, publish, unpublish, categories, tags)
- **Purpose:** Let content be added to the Decision Library without a code change and redeploy.
- **Business value:** High. v1.0 has 4 topics; SEO-driven acquisition requires this to scale continuously (see Content Expansion, below). Manual code edits don't scale past a handful of pages.
- **Technical complexity:** Medium. CRUD interface, moving `lib/decisions.js` from a static file to Firestore-backed content, auth-gated admin routes.
- **Dependencies:** Firebase Auth + Firestore (#1) — admin access needs real authentication and a real database to write to.
- **Estimated development priority:** P0.
- **Recommended implementation order:** 2nd.

### 3. Search (in-app + library)
- **Purpose:** Let users find relevant guidance and library content by keyword, scripture, or topic instead of only browsing.
- **Business value:** Medium-High, and time-sensitive. As the Public Decision Library grows, users need to be able to quickly find relevant decision pages — search needs to be in place *before* the library scales past a size where browsing alone works, not after. It also improves engagement and lays groundwork for future site-search-driven SEO signals.
- **Technical complexity:** Medium. Needs an index (Firestore full-text search is limited — likely requires Algolia or a similar search service). Buildable now against the current 4-page library and admin-managed content, and simply gets more valuable as content volume grows.
- **Dependencies:** Admin CMS (#2), since search should index admin-managed content, not just the static seed file.
- **Estimated development priority:** P0.
- **Recommended implementation order:** 3rd — deliberately sequenced *before* Content Expansion (#4), so findability is solved before volume makes its absence a bigger problem.

### 4. Content Expansion (4 → 50 → 250 → 1,000 → 5,000 → 10,000+)
- **Purpose:** Give the SEO engine enough surface area to actually generate organic traffic, treated as an ongoing publishing strategy rather than a one-time milestone.
- **Business value:** Very high. Directly drives user acquisition — this is the payoff for all the SEO infrastructure already built in v1.0, and per the long-term vision above, it is the platform's primary acquisition engine, not a side task.
- **Technical complexity:** Low per-page (content work, not engineering), but the milestones scale into a real engineering problem — see Decision Library at scale (#13) in v2.0 for the infrastructure required once volume passes roughly 1,000 pages (sitemap sharding, ISR instead of full-rebuild SSG, etc.). The v1.1 phase (4 → 50) works fine on the existing SSG setup; later phases don't, without #13.
- **Dependencies:** Admin CMS (#2) strongly recommended first. Search (#3) should exist before this phase completes, per the reordering above.
- **Estimated development priority:** P0.
- **Recommended implementation order:** 4th.
- **Note:** This item does not "complete" at the end of v1.1. The 4 → 50 phase belongs here; 250 → 1,000 continues through v1.2/v1.3; 1,000 → 10,000+ requires the scale infrastructure in v2.0 (#13). It is listed once here as the phase that starts the strategy, and referenced again at the point where it requires new infrastructure.

### 5. Analytics (privacy-respecting: most-viewed pages, most-searched questions, most common struggles, category trends)
- **Purpose:** Give visibility into what's actually being used, searched, and struggled with, so ongoing content expansion (#4) is guided by real demand rather than guesswork from the start.
- **Business value:** High in this position. Moved earlier than originally scoped specifically because content expansion is now understood as continuous — analytics should inform *which* topics get written from early on, not arrive after hundreds of pages have already been published without that signal.
- **Technical complexity:** Medium. Needs an analytics pipeline (privacy-conscious, anonymized/aggregated — no individual reflection content should be tracked).
- **Dependencies:** Firebase (#1) for consistent user/session identity; Search (#3) is a natural source of "most-searched" signal.
- **Estimated development priority:** P1.
- **Recommended implementation order:** 5th.

---

## Version 1.2 — Engagement & Content Depth

*Theme: give returning users more reasons to come back and more reasons to share. Content Expansion (#4) continues in the background throughout this version.*

### 6. Prayer Generator (standalone: save, favorite, print, share)
- **Purpose:** Elevate the prayer already generated per-guidance into its own saveable, shareable artifact.
- **Business value:** High. Shareable content (especially "print" and "share") is a low-friction viral acquisition loop — prayers get shared far more readily than full decision reflections, which are often private.
- **Technical complexity:** Low-Medium. Mostly UI work plus a share/print target; builds directly on data already being generated.
- **Dependencies:** Firebase accounts (#1) for a real "favorites" collection.
- **Estimated development priority:** P1.
- **Recommended implementation order:** 1st.

### 7. Scripture Explorer (cross-references, Strong's Concordance, Greek/Hebrew, commentaries)
- **Purpose:** Deepen Bible study within the app beyond the two translations shown per guidance.
- **Business value:** Medium-High. Strong differentiator versus competitors who only quote verses; increases session depth and time-on-app, which supports both retention and a future premium tier.
- **Technical complexity:** High. Requires licensing or sourcing a Strong's/original-language dataset and commentary content — this is a data-acquisition problem as much as an engineering one.
- **Dependencies:** None technically, but should follow accounts (#1) if study progress/notes are to be saved.
- **Estimated development priority:** P2.
- **Recommended implementation order:** 2nd.

### 8. Related Content Engine (similar questions, related scriptures, related prayers, related decision journeys)
- **Purpose:** Automatically surface related material across the app and the public library, replacing the current hand-curated `relatedSlugs` field.
- **Business value:** Medium-High. Increases pages-per-session on the public library (SEO/engagement benefit) and surfaces relevant journal history in-app. Also directly reinforces the content strategy standard's "related decisions" and "internal links" requirements at scale, once manual curation stops being practical.
- **Technical complexity:** Medium. Needs either embedding-based similarity or a tagging/category system robust enough to drive recommendations.
- **Dependencies:** Content Expansion (#4) and Admin CMS tagging (#2) — recommendations need enough tagged content to be meaningful.
- **Estimated development priority:** P2.
- **Recommended implementation order:** 3rd.

---

## Version 1.3 — Monetization & Retention Infrastructure

*Theme: the app now has enough depth and enough users to justify a paid tier and real reminders. Content Expansion (#4) continues in the background, now informed by two full versions of Analytics (#5) data.*

### 9. Premium tier (subscriptions: unlimited decisions, PDF export, personalized study plans, advanced tools)
- **Purpose:** First monetization surface for the platform.
- **Business value:** High. Direct revenue. Also the first version where "unlimited" implies v1.0's free tier gets a usage cap — a product decision worth making deliberately, not by default.
- **Technical complexity:** Medium-High. Payment processor integration (Stripe likely), subscription state tied to Firebase accounts, feature-gating throughout the app.
- **Dependencies:** Firebase accounts (#1) is a hard dependency — there's no subscription without a persistent user identity.
- **Estimated development priority:** P0 (once accounts and enough retained users exist to monetize).
- **Recommended implementation order:** 1st.

### 10. Decision Map (visual flow: Situation → Core Issue → Fear → Principles → Choices → Outcomes → Reflection → Prayer → Decision → 30-Day Follow-Up)
- **Purpose:** The most visually distinctive planned feature — turns a single guidance response into a full visual decision journey.
- **Business value:** Medium-High. Strong differentiator and a natural premium-tier feature (see #9); also highly shareable/marketable (screenshots of a decision map are strong organic marketing material).
- **Technical complexity:** High. New visual component, likely a guided multi-step wizard rather than a single AI call, and needs its own data model layered onto the existing reflection record.
- **Dependencies:** Premium tier (#9) if gated as a paid feature; Follow-Up System (already in v1.0) for the 30-day step.
- **Estimated development priority:** P1.
- **Recommended implementation order:** 2nd.

### 11. Guided Discernment (clarifying follow-up questions before generating guidance, instead of answering immediately)
- **Purpose:** Improve guidance quality and perceived thoughtfulness by having the app ask 1-2 clarifying questions before generating a full response, rather than answering a sparse free-text entry immediately.
- **Business value:** Medium. Improves output quality and differentiates from "instant answer" competitors, at some cost to speed/friction — needs care to avoid feeling like a delay tactic.
- **Technical complexity:** Medium. Requires a multi-turn conversation state in the guidance API route instead of the current single-shot call.
- **Dependencies:** None strictly, but best sequenced after the core experience is well-established so quality changes can be measured against Analytics (#5).
- **Estimated development priority:** P2.
- **Recommended implementation order:** 3rd.

### 12. Real Follow-Up notifications (email and/or push, instead of in-app-only)
- **Purpose:** Convert the Follow-Up System from "surfaces when you happen to open the app" to an actual reminder that brings users back.
- **Business value:** High for retention specifically — this is the most direct lever available for bringing lapsed users back on a schedule.
- **Technical complexity:** Medium. Needs an email service (e.g., Resend, SendGrid) at minimum; push notifications require either a PWA service worker or a native app wrapper (see v2.0 #16).
- **Dependencies:** Firebase accounts (#1) for a real email address/device token to notify.
- **Estimated development priority:** P1.
- **Recommended implementation order:** 4th.

---

## Version 2.0 — Platform Scale

*Theme: the infrastructure and business model are proven; now scale content, reach, and operations toward the long-term vision of the largest searchable Christian decision library on the internet.*

### 13. Decision Library at scale (1,000 → 5,000 → 10,000+ pages, programmatic content pipeline, sitemap sharding)
- **Purpose:** Carry the Content Expansion strategy (#4) through its final, highest-volume phase — this is where the "largest searchable Christian decision library on the internet" ambition either becomes real or doesn't.
- **Business value:** Very high, if execution holds quality — this is the primary long-term organic acquisition channel, and every page published under it functions as a standalone entry point into Threshold per the long-term vision.
- **Technical complexity:** High. A single `sitemap.xml` and flat content file stop scaling well past a few thousand entries; needs sitemap index files (sharded sitemaps), likely a move from build-time SSG to on-demand ISR (Incremental Static Regeneration) so thousands of pages don't require a full rebuild per publish, and real content-quality controls (this is also an editorial/quality-control problem, not just an engineering one — thousands of shallow pages can hurt SEO rather than help it). Every page at this scale must still meet the content strategy standard defined above — scale is not an excuse to drop SEO title, structured data, related decisions, or CTA.
- **Dependencies:** Admin CMS (#2), Search (#3), Related Content Engine (#8), Analytics (#5) to guide which topics are worth writing at this volume.
- **Estimated development priority:** P0 for this version.
- **Recommended implementation order:** 1st.

### 14. Full admin dashboard (featured images, internal link management, scheduled publication, prompt/settings management)
- **Purpose:** Complete the admin tooling scoped loosely in v1.1 (#2) into the full operational control panel originally envisioned.
- **Business value:** Medium-High. Operational efficiency — enables non-technical team members to manage content and settings without engineering involvement, which matters directly once content operates at the volume described in #13.
- **Technical complexity:** Medium-High, mostly in scope/surface area rather than any single hard problem.
- **Dependencies:** Admin CMS (#2), content scale (#13).
- **Estimated development priority:** P1.
- **Recommended implementation order:** 2nd.

### 15. Personalized study plans & growth insights dashboard
- **Purpose:** Use accumulated journal/follow-up history to generate a personalized view of a user's spiritual growth and suggested next studies.
- **Business value:** Medium-High. Strong retention feature and a natural premium upsell; also the most "personalized" surface in the app, which supports long-term engagement.
- **Technical complexity:** High. Needs meaningful historical data per user (depends on accounts having been live for a while) and a recommendation model of some kind.
- **Dependencies:** Firebase accounts (#1) with real usage history, Analytics (#5), Scripture Explorer (#7) for study content to recommend.
- **Estimated development priority:** P1.
- **Recommended implementation order:** 3rd.

### 16. Native mobile app wrapper & real push notifications
- **Purpose:** Move from "mobile-optimized web app" to an actual installable app with real OS-level push notifications for follow-ups.
- **Business value:** Medium-High. Push notification reach is significantly stronger than email for re-engagement; app-store presence is also a discovery/legitimacy channel.
- **Technical complexity:** High. Either a PWA with service-worker push (lighter lift, but limited on iOS) or a full native wrapper (React Native/Capacitor), plus app store submission/review process.
- **Dependencies:** Real Follow-Up notifications infra (#12) should exist first in email form before adding push.
- **Estimated development priority:** P2.
- **Recommended implementation order:** 4th.

### 17. Multi-language support (localization)
- **Purpose:** Open the platform to the global Christian population beyond English speakers.
- **Business value:** High long-term, but back-loaded — this is a large addressable-market unlock, not a quick win.
- **Technical complexity:** High. Every piece of content (Library, guidance prompts, UI strings) needs translation infrastructure; scripture translations in other languages need sourcing (equivalent of the KJV/AMPC licensing question, multiplied by language).
- **Dependencies:** Content scale (#13) and Admin CMS (#14) should exist first — localizing a mature content pipeline is far easier than localizing while the pipeline is still being built.
- **Estimated development priority:** P2.
- **Recommended implementation order:** 5th.

### 18. Additional monetization: affiliate links, blog engine
- **Purpose:** Diversify revenue beyond subscriptions (referral/affiliate placements, a content-marketing blog channel feeding the Decision Library funnel).
- **Business value:** Medium. Incremental revenue and an additional acquisition channel, but secondary to the subscription model (#9) and content scale (#13).
- **Technical complexity:** Medium. Blog engine can likely reuse the Decision Library's page infrastructure; affiliate link management is primarily an admin-tooling feature.
- **Dependencies:** Premium tier (#9), Admin CMS (#14).
- **Estimated development priority:** P2.
- **Recommended implementation order:** 6th.

---

## Summary priority table

| # | Feature | Version | Priority | Business impact |
|---|---|---|---|---|
| 1 | Firebase Auth + Firestore | 1.1 | P0 | Retention, unblocks everything |
| 2 | Admin CMS | 1.1 | P0 | Content scalability |
| 3 | Search | 1.1 | P0 | Findability, ahead of content scale |
| 4 | Content Expansion (4→50, ongoing) | 1.1 → 2.0 | P0 | Acquisition (primary engine) |
| 5 | Analytics | 1.1 | P1 | Decision support for content strategy |
| 6 | Prayer Generator (standalone) | 1.2 | P1 | Viral acquisition |
| 7 | Scripture Explorer | 1.2 | P2 | Differentiation, retention |
| 8 | Related Content Engine | 1.2 | P2 | Engagement, SEO |
| 9 | Premium tier | 1.3 | P0 | Revenue |
| 10 | Decision Map | 1.3 | P1 | Differentiation, marketing |
| 11 | Guided Discernment | 1.3 | P2 | Quality |
| 12 | Real Follow-Up notifications | 1.3 | P1 | Retention |
| 13 | Decision Library at scale (1,000→10,000+) | 2.0 | P0 | Acquisition (primary channel, full scale) |
| 14 | Full admin dashboard | 2.0 | P1 | Operations |
| 15 | Study plans & growth insights | 2.0 | P1 | Retention, upsell |
| 16 | Native app + push | 2.0 | P2 | Retention, reach |
| 17 | Multi-language support | 2.0 | P2 | Market expansion |
| 18 | Affiliate links, blog engine | 2.0 | P2 | Revenue diversification |

---

*No implementation has begun on any item in this document. Per instruction, this roadmap is for planning only.*
