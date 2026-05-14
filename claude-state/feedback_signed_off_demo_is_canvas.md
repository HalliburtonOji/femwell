---
name: When a signed-off demo exists, build NEXT phase on top of it — don't author a parallel visual
description: User 2026-05-14 "this is the final we agreed to before and you were meant to build on that, what is going on". I authored a hollow new Phase 2 demo instead of using femwell_planner_final.html as the canvas. Don't repeat.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
When a phase has a signed-off demo file already in `mnt/femwell/`, the next-phase demo should:

1. **Reuse the existing composition** (same hero, same sections, same vertical order, same visual language) as the canvas.
2. **Annotate or modify only the surfaces that change** in this phase. Highlight the deltas with eyebrows like "NEW IN PHASE 2", "UPDATED", "REMOVED".
3. **Never strip out signed-off sections** to author a "minimalist" or "focused" parallel visual. The signed-off demo is the agreed product surface; phases are about which pieces ship when, not a different product.

**Why:** Halli signs off on visuals once, then phases roll out toward that signed-off vision. Re-inventing the visual at each phase forces re-sign-off and loses accumulated craft. It also wastes Atelier credit — Halli already made the design decisions.

**How to apply for FemWell specifically:**
- `mnt/femwell/femwell_planner_final.html` is canonical Planner visual (Shape C month ribbon hero, smart view 3-card stack, good-for chips, morning/evening stacks, program card, meals, tonight's window, ritual bundles carousel, gentle streaks, Plan-with-Jess card). Any future Planner phase demo MUST use this composition.
- Same for `femwell_horoscope_*.html` (Plum Night H2 sign-off), `femwell_lifestyle_*.html`, `femwell_profile_v2.html`, etc.
- If unsure which file is the signed-off reference, look in `feedback_femwell_design_status.md` or grep for "signed off" in claude-state/.

**The check before authoring any new demo:** `ls mnt/femwell/femwell_<page>_*.html` — pick the most-recently-signed-off file. Treat it as `body { ... }`; my work is the diff against it.

**Don't apply when:** there's no prior signed-off demo for this surface (first-pass design). Then a fresh visual is fine, but flag that explicitly to Halli before deep work.
