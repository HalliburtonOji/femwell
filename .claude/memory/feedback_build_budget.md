---
name: Build budget + mega-prompt cadence across apps
description: How to budget edit_base44_app calls and sequence work across LingoTrip, FemWell, and LiveMore
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
Budget is measured in **50 build points total**, not 50 builds. Target ≤ 10 mega-prompts per app, aim for 5 if possible. Write code directly (Read/Edit/Write) whenever feasible because direct code edits do NOT consume build points — only `edit_base44_app` calls do.

**Why:** User corrected my interpretation: "budget is not 50 builds its 50 build points. target is ideally no more than 10 mega prompts although make this lesser if possible. take turns on this and implementing femwell fix and improvement from the audit (10 mega prompt at most too. aim for 5 if possible write code directly as it doesnt consume point)". They want maximum value per build by bundling heavily and preferring direct code edits.

**How to apply:**
- **Turn-take** between LingoTrip and FemWell (both getting ≤10 mega-prompts, aim for 5 each). Don't monopolize one app.
- **Bundle aggressively** — each mega-prompt should deliver a whole phase's worth of changes, not one screen.
- **Approve base44 builds yourself** when the builder surfaces an approval prompt. Don't stop and wait for the user.
- After both apps are at a good state, do the **LiveMore audit** (same format as FemWell: extensive page-by-page + features-to-add, rendered as interactive HTML dashboard).
- When writing code directly avoids a build altogether, do it (e.g., small CSS/layout tweaks, copy changes, utility files).
