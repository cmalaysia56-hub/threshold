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

## Firebase setup (accounts + database)

The app runs fine without this — it just won't offer accounts until it's done.

1. Go to https://console.firebase.google.com and create a project
2. In the project, go to **Build > Authentication**, click **Get started**, and enable **Email/Password** and **Google** as sign-in providers
3. Go to **Build > Firestore Database**, click **Create database**, start in production mode
4. In Firestore, go to the **Rules** tab and paste in the contents of `firestore.rules` from this repo, then **Publish**
5. Go to **Project settings** (gear icon) > scroll to **Your apps** > click the web icon (`</>`) to register a web app
6. Copy the config values shown into your `.env.local` (or Vercel environment variables):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
7. Redeploy. A "Sign in" link will now work in the app header.

Note: journal data still saves to `localStorage` at this stage — accounts exist, but nothing is migrated to Firestore yet. That's the next step.

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
