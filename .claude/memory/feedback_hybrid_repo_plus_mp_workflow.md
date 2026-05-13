---
name: Hybrid workflow — direct repo edits for safe stuff, paste-ready mega prompts for risky stuff
description: Pivot 2026-05-13. User no longer trusts autonomous direct-build for substantive changes after H2 live-walk failures. New mode: I write what I can in repo + author paste-ready MPs they paste into base44 themselves.
type: feedback
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
User pivoted on 2026-05-13 after H2 shipped (eventually) with three rounds of live-walk regressions: "all works now, unfortunately i cannot trust you for future builds so we are pivoting to using detailed mega prompts i can paste to base44."

**This pivot is temporary and user-reversible.** The user clarified: "the pivot is only temporary and i can change it at anytime." Don't frame Lucha as "retired" or the hybrid mode as permanent. If the user reactivates autonomous multi-file shipping (says "Lucha is back" / "you can build it directly" / etc.), drop back to the previous mode immediately — the older `feedback_build_direct_not_builder.md` rule takes precedence again.

**2026-05-13 14:00 — MODE SWITCHED BACK to direct-repo for LC-2 through LC-5.** User said: "we are doing the other lc without prompts, so live verify and stuff, previous set up i will say when to switch again, just be really detailed this time." So:
- LC-1 was MP-paste (already pasted, building on base44).
- **LC-2, LC-3, LC-4, LC-5 are direct-repo edits with full live verification.** Build → push → publish via Chrome MCP → walk live at mobile/tablet/desktop → screenshot every changed surface → save_to_disk: true → DOM grep for acceptance criteria → only then declare done.
- This mode holds until the user explicitly says to switch back to MP mode.
- **"Be really detailed this time"** = don't take shortcuts on the live walk. The previous failures were cream-on-cream invisibility (didn't walk), squished mini desktop (didn't test desktop), MAR/APR/MAY overflow (didn't test narrow widths). Every verification must spot those classes of bug before the user does.

**The new mode:**

| Change type | How it ships |
|---|---|
| Trivial text / copy / single-line CSS / typo fix | I edit the repo, commit, push, publish. |
| Single-section JSX edit ≤ 50 lines, no schema change | I edit the repo, commit, push, publish. |
| New section, refactor, schema change, function entry.ts change, LLM prompt change, anything with multi-file blast radius | I author a **paste-ready mega prompt** in `mnt/femwell/base44_mps/<date>_<codename>/` and the user pastes it into base44 themselves. |
| Anything risky or where I'm uncertain | MP, not direct. When in doubt, MP. |

**Why:** I burned the user's trust by shipping H2 with cream-on-cream text twice and a "squeshed mini" desktop layout. Each round of regression came from me declaring "vite + eslint green = done." The user's correction: I am not the executor for risky changes — they are. I am the planner / researcher / spec-author. They paste, base44 builds, they verify in the preview themselves before publishing.

**How a mega prompt must be structured (mandatory):**
1. **Title** — codename + one-line goal.
2. **Pre-flight** — what files the base44 agent should read first; any schema state to verify before editing.
3. **Constraints** — UK English, no emoji, Plum Night palette, en-GB dates, etc. Restate the locked-in `H2_DECISIONS.md` rules and `feedback_*` rules that apply.
4. **Diff plan** — file-by-file: NEW / EDIT / DELETE with exact paths, line ranges where applicable, full code for NEW files, surgical edits for EDIT files. Don't write fluff — write what base44 needs to type into its editor.
5. **Schema changes** — `base44/entities/*.jsonc` deltas spelled out.
6. **LLM prompt changes** — full diff of system prompt / response schema.
7. **Visual acceptance test** — explicit per-section "this must render this way" so the user can spot regressions in preview. Must specify **all three viewports** (mobile / tablet / desktop) since base44 has the device toggle.
8. **Rollback** — one paragraph: how to undo if it breaks.
9. **No "Run the build, then publish"** at the end — the user decides when to publish.

**What I keep doing:**
- Research, spec-writing, brainstorming, audit, doc-coauthoring.
- Direct repo edits within the "trivial / single-section" envelope above.
- Live walks via Chrome MCP when asked to verify something the user has just pasted.

**What I stop doing:**
- Dispatching agents that ship code without my own live walk first.
- Multi-file refactors via direct push without an MP option.
- Declaring "done" on green CI alone.

**Companion docs:**
- `mnt/femwell/research_base44_platform.md` — base44 deep-dive so MPs are technically accurate.
- `.claude/agents/*.md` — every team agent's spec upgraded by 3 levels (pre-flight + operating procedure + verification gates + handoff contract + base44 awareness + failure modes + MP-authorship-capability where relevant).
