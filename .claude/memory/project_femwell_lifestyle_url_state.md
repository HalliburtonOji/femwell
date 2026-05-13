---
name: FemWell Lifestyle URL state
description: How Lifestyle tab+filter persist in the URL so back-stack works. Reference when touching tab switching or adding new tabs/filters.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
`src/pages/Lifestyle.jsx` keeps `tab` in `?tab=<id>` (omitted when "for_you", the default). `src/components/lifestyle/browse/BrowseTab.jsx` keeps the chip in `?filter=<chip>` AND sets `?tab=browse` to keep the parent in sync.

setTab uses **pushState** (not replace) so the back-stack remembers tab switches. A `popstate` listener re-reads `?tab` on browser back/forward to keep React state honest.

**Why:** before this, opening a book from Browse > Books then hitting ← in FictionReader popped back to `/Lifestyle` with no tab param, falling through to For-You (the bug user reported 2026-05-12).

**How to apply:**
- Any new tab added to TABS must work with this same URL pattern — its id becomes the `?tab=` value.
- Any sub-tab/chip in a child component should write its slug to `?filter=` AND also set `?tab=<parent-tab-id>` in its replaceState call, so the parent tab is preserved when the user navigates away.
- DO NOT use `history.replaceState` for primary tab switches — pushState is the contract.

Fixed in commit ed0a97f (2026-05-12).
