---
name: FemWell mobile loading bug (Apr 2026)
description: 90% of FemWell pages hang on "Loading" on mobile; only Today/Lifestyle/Community/Planner load. Desktop fine.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
On mobile (femwells.com), ~90% of pages get stuck on a loading state. Only **Today**, **Lifestyle**, **Community**, and **Planner** render. All other pages (Track, Nutrition, Menu, Profile, Panic Mode, Calm Cards etc.) spin indefinitely. Desktop renders everything fine.

**Why:** User flagged this explicitly on 2026-04-17 while off at work — it's a P0 UX bug blocking mobile usage. The fact that desktop works but mobile doesn't suggests a viewport-conditional code path: possibly a mobile-only layout component that never resolves, a media-query gated import, a service worker caching stale mobile chunks, or an auth/entity query that fails under mobile's stricter CORS/cookie rules.

**How to apply:**
- Reproduce first: load femwells.com with a mobile user-agent + 390×844 viewport; open DevTools network + console to catch failing requests/errors.
- Suspect list (in priority order): (1) mobile bottom-nav or layout wrapper that throws and unmounts children, (2) a page-level `useEffect` that never finishes a fetch on mobile, (3) a missing feature flag/entity read gated by `window.innerWidth`, (4) stale PWA service worker serving an old build, (5) Layout.jsx splitting desktop vs. mobile and the mobile branch having a runtime error.
- Fix should ideally be direct code edits (Read `pages/<page>.jsx` + `Layout.jsx` + `components/mobile/*` in the repo) to save base44 build points.
