---
name: FemWell master plan is a living doc — update on every brainstorm + every shipped MP
description: The master plan at mnt/femwell/femwell_master_plan_2026-05-13.md is the foundational direction doc. Treat it as a living file: bump version on every touch, add changelog line, fold in new ideas as they land.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
The master plan now lives in-repo at **`claude-state/master-plan.md`** (rev 5, 2026-05-14) — that is the foundational whole-app direction doc. _(Pointer corrected 2026-06-09: the old `/sessions/relaxed-loving-brahmagupta/mnt/femwell/femwell_master_plan_2026-05-13.md` sandbox path is DEAD — do not use it.)_ It's a living doc — bump version + add a changelog line on every touch. **Note:** the canonical current-state baton + plan index is `claude-state/STATUS.md`; master-plan is the strategy ledger and currently needs a rev-6 (Echo Wall + Witness shipped 2026-06-08; the 2026-06-09 whole-life correction is unabsorbed).

**Why this exists:** User said "i would be getting crazy ideas to add on and our deep brainstorming would be uncovering new stuff the mega plan needs to be flexable and updated constantly like an md file, itll help us control the project too." The doc is how we keep direction coherent across many MPs, demos, brainstorm passes, and surface redesigns.

**How to apply (the update protocol — also embedded in the doc itself):**
- **User has a crazy idea, deep search finds something, agent brainstorm uncovers a feature** → add to the doc's §6 Engagement Layer or §10 Roadmap with a `(captured YYYY-MM-DD)` tag. Don't leave it in chat.
- **An MP ships** → strike the relevant Phase A/B/C/D row, move it to a "Shipped" subsection inside that phase with the commit SHA.
- **User makes a strategic decision** (yes/no, pivot, scope cut) → update the relevant section, bump version line at top, log a Changelog line.
- **Every 2-4 weeks** → read the whole doc, prune what's wrong, surface contradictions to the user.
- **Bibliography §13** is append-only — every doc that touches the plan gets a row.

**Sale window aim (locked 2026-05-13):** 6-month target (2026-11-13), 9-month soft cap (2027-02-13). This drives the Phase D-in-parallel-with-Phase-C scheduling.

**Phase locks (as of 2026-05-13):**
- Phase A: H2 follow-ups + Listen Seed re-run + Atelier AI-final wire-up + pipeline fixes (gate lifted) + content auditor agent.
- Phase B: surface redesigns — **Planner first** (tasks #192-#194), then Profile, then Sessions / Skin & Hair / Life Stage / Community v2 / Journal v2 / Onboarding / Settings / Panic Mode ordered by impact-on-sale.
- Phase C: engagement layer (Cycle Mirror, Echo Wall, Witness, Phase Twin) — in parallel with end of Phase B.
- Phase D: pre-sale polish (a11y, perf, tracking, DD pack, brand voice consolidation) — runs in parallel with Phase C from month 3.

**Open questions at next review:** Atelier human-sign-off legal cover at DD (pre-sale); whether Planner build folds in Rituals / Smart Nudges or stays scoped. Both surface in the doc's "Open at next review" subsection.
