---
name: Planner is two tabs — Today + Cycle (signed off 2026-05-14)
description: Halli flagged decision fatigue on the single-scroll Phase 2 v2 demo, then signed off on the two-tab split. Today = next 24h (action). Cycle = bigger arc (pattern). Future Planner work MUST respect this split.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
The Planner has **two tabs** at the top of `/planner` via a segmented control. Halli signed off on this 2026-05-14 after rejecting the single-scroll Phase 2 v2 ("everything on one page is decision fatigue and might be confusing").

**Today tab** (default, `?view=today`) — the next 24 hours, action-scoped:
- Fresh-Start banner (conditional)
- Smart View "right now" card + 5-state chip row (idle / streaky / stuck / drifting / quiet)
- Good-for chips (capacity-composite)
- Morning stack (with ANCHOR / SOFTEN cue chips)
- Programme card
- Today's meals
- Tonight's Window (with HRT row + "Share with my GP" cross-tab link)
- Evening stack
- Shutdown ritual
- Plan-with-Jess (today-scoped message)

**Cycle tab** (`?view=cycle`) — the bigger arc, pattern-scoped:
- Month ribbon (Shape C, the hero)
- Capacity Tax bar (with one-tap Defer N)
- Quiet Mode banner (when auto-fired)
- Week Ahead card (with confidence + Jess-nudge)
- What's Unfinished card
- Saved rhythms / bundles carousel (incl. Pacing Bank "Low Spoons")
- This week's rhythm (28-day consistency, period-week auto-freeze)
- Cycle-Mirror Sunday tile (only renders on Sundays + ≥4 cycles)
- Doctor-Ready Diary export (NICE-NG23 PDF)
- Astra Cole horoscope sidecar (deep-links to Lifestyle)
- Plan-my-next-cycle CTA

**Cross-tab stitching** (so nothing feels stranded):
- Today's "Share this week with my GP" deep-links to `?view=cycle&scrollTo=doctor`
- Cycle's month ribbon tap retargets Today on the chosen date and switches view
- Cycle's Capacity Tax "Defer N" returns to Today with a "N items moved" toast

**URL state:** `?view=today` default, persist last view to `localStorage.fw_planner_view`.

**Build path:** Planner-A sequence is now C0–C9. C0 is **MP-A0 tab shell + routing** (added at top after this sign-off). C1–C9 each know which tab their surface mounts on. See `claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md`.

**Why:** Halli explicitly chose this split to reduce decision fatigue while keeping all 9 Phase-2 mechanics. The split is by **time horizon** (Today = action, Cycle = pattern), not by data type — this is the only valid split unless Halli explicitly redirects.

**How to apply:**
- Any new Planner surface must declare which tab it lives on.
- Pattern: if it answers "what should I do in the next 24 hours?" → Today. If it answers "where am I in the arc / what's the bigger pattern?" → Cycle.
- Never propose a third tab without flagging the split conflict.
- Demo canvas: `mnt/femwell/femwell_planner_phase2_demo.html` (two phones side-by-side, signed off 2026-05-14 — same canvas convention as `feedback_signed_off_demo_is_canvas.md`).
- Bottom nav still says "Planner" (single entry); the tab split is internal to the route.
