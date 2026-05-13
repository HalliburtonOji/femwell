---
name: No stale features — every new thing must interact and do work
description: New features must be wired to real entities/flows and produce visible interactions across the app, never decorative dead UI.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
When a new feature lands in FemWell, it must actually DO something — read/write real entities, trigger real flows, surface in other pages where relevant. Decorative UI that exists only on its own page is a stale feature and must be avoided.

**Why:** User explicitly warned against "stale stuff." The pattern they want: introduce a new feature → it shows up in Today's nudges, in Jess's recommendations, in Profile's stats, in Smart Nudges, etc. Cross-cutting interaction is the proof of life.

**How to apply:**
- Every feature MP must specify: which entities does it read? which entities does it write? which other pages surface its state?
- Reject MPs that only add UI to one page without touching the data model or other surfaces.
- Example checks: A new "Ritual" entry should appear in Today's morning card, contribute to Lifestyle's streak counter, be visible in Profile, and be referenceable by Jess.
- For redesigns of existing pages, confirm all old interactions still work — don't accidentally orphan data.
- Build the entity/flow plumbing FIRST in the MP, then the visible UI on top, so dead UI is impossible.
