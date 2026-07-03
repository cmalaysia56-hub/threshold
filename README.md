# Threshold

A decision platform grounded in biblical wisdom. This is the deployable
version of the app — same screens, same design, same features as before,
now running as a real Next.js site instead of a Claude.ai artifact.

## What changed in this migration (and why)

Two things had to change for the app to work outside Claude.ai's sandbox.
Nothing else did — same colors, same type, same screens, same logic.

1. **Storage.** The artifact used a special `window.storage` API that only
   exists inside Claude.ai's preview. This version uses `lib/storage.js`,
   a localStorage-backed adapter with the exact same interface, so your
   journal, saved decisions, and follow-ups persist on your device.
   When you're ready for real accounts and cross-device sync, swap the
   inside of that one file for real API calls — nothing in
   `components/ThresholdApp.jsx` has to change.

2. **AI guidance calls.** The artifact could call Anthropic's API directly
   from the browser with no key because Claude.ai handled that invisibly.
   A real site can't expose an API key in browser code, so guidance
   requests now go through `app/api/guidance/route.js`, a small server
   route that holds your key privately.

## Setup

```bash
npm install
cp .env.example .env.local
# then open .env.local and paste your Anthropic API key
npm run dev
```

Visit `http://localhost:3000`.

Get an API key at https://console.anthropic.com if you don't have one.

## Deploy (Vercel)

1. Push this project to a GitHub repo.
2. Import it at https://vercel.com/new.
3. In the project's Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` — your key
4. Deploy. Vercel detects Next.js automatically, no other config needed.

## Project structure

```
app/
  layout.js          root layout, page title
  page.js             renders the app at "/"
  api/guidance/route.js   server-side guidance endpoint (holds the API key)
components/
  ThresholdApp.jsx    the full app — all screens, all logic
lib/
  theme.js            design tokens (colors, fonts) — shared source of truth
  storage.js           local persistence adapter
```

## What's next

This is the foundation Phase 3 (the public Decision Library and SEO work)
needs — real routing, real server rendering, a real deployable domain.
Nothing in that phase has been built yet; this migration only makes it
possible to build it honestly.
