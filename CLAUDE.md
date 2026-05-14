# FemWell — Claude Code orientation

Welcome. This file is the entry point for any Claude session — both **Claude Code** running locally in this repo, and **Claude Cowork** running in a sibling chat session. Read this first, then load `claude-state/master-plan.md` for the strategic view and `.claude/memory/MEMORY.md` for the rolling memory index.

---

## What FemWell is

UK women's wellness app on the base44 platform. App id `69a9891a6ccccc1822bbb4bc`. Live at **femwells.com**. Building toward a **£1M sale within 6 months** (target 2026-11-13, 9-month soft cap 2027-02-13).

**Brand voice:** Fraunces + Inter typography, cream/plum/rose/gold palette, calm-but-substantive — closer to a New Yorker science feature than a wellness influencer. UK English. £. en-GB dates. **No emoji codepoints anywhere** (Lucide icons + SVG only). See `.claude/memory/feedback_no_emoji_in_femwell.md` for the regex sweep rule.

**Architecture:** Today / Lifestyle / Jess / Profile / Menu — 5-slot unified bottom nav at mobile + tablet + desktop. **No desktop sidebar.** Width-constrain content at large viewports per `feedback_femwell_multiplatform.md`.

---

## The dual-Claude workflow

You may be running as:
- **Claude Code** (local terminal / VS Code) — direct file edits, git ops, vite/eslint, test runs. Best for shipping.
- **Claude Cowork** (web app) — strategy, brainstorms, MP authoring, master-plan iteration, research, long-form thinking. Best for planning.

Both share:
- This repo (`github.com/HalliburtonOji/femwell.git`)
- The 11 agent specs at `.claude/agents/*.md`
- Memory at `.claude/memory/*.md`
- Planning docs at `claude-state/`
- The handoff folder at `claude-handoff/`

**Communicate via the repo.** When one Claude finishes work the other needs to know about, drop a file in `claude-handoff/` named `from-<source>-to-<target>-<YYYY-MM-DD>-<topic>.md`. The other Claude reads it next session.

---

## Hybrid build rule (mode-switched 2026-05-13)

| Change type | How it ships |
|---|---|
| Trivial text / single-line CSS / typo fix | Direct repo edit → `git push` → publish via base44 builder |
| Single-section JSX edit ≤ 50 lines, no schema change | Direct repo edit |
| New section, refactor, schema change, function entry.ts change, LLM prompt change | Author a paste-ready mega prompt in `claude-state/base44_mps/<date>_<codename>/` — **user pastes it into base44 themselves** |
| Anything risky or uncertain | MP, not direct. When in doubt, MP. |

**This is currently OVERRIDDEN for LC-2 through LC-5.** User said 2026-05-13: "we are doing the other lc without prompts, so live verify and stuff, previous set up i will say when to switch again, just be really detailed this time." So all four remaining Lifestyle close-out items ship as direct repo edits with full live verification (mobile + tablet + desktop screenshots).

**Reverts:** if the user says "Lucha is back" / "ship it directly" / "back to MPs only" / etc., adjust mode immediately. See `.claude/memory/feedback_hybrid_repo_plus_mp_workflow.md`.

---

## The 11-agent team

Specs at `.claude/agents/*.md`. Each spec is a full operating manual: pre-flight checks, operating procedure, verification gates, handoff contracts, base44 awareness, failure modes. Dispatch by name.

| Agent | Role | Dispatch when |
|---|---|---|
| Mr Lead Manager | MP author + plan owner | Any substantive change needs a spec. Pre-flight for every MP. |
| Ms Deep Search | Research + brainstorm | New feature scope; deep competitor / open-source / forum mining |
| Ms Atelier | UI/UX craft | Pre-MP visual review; post-build craft pass; spec accountability for tokens, hierarchy, motion |
| Mr Fix-it | Trivial repo edits | ≤2 files, ≤50 lines, no schema, no function entry.ts, no LLM prompt — strict envelope |
| Ms Verify | Live walks | Post-publish verification at mobile/tablet/desktop; punch-list output |
| Mr Tester | vitest + Playwright | Regression gates; "when test fails, propose fix as MP not direct edit" |
| Ms Data | Entity / schema | Schema MPs (never direct edits to `base44/entities/*`) |
| Mr Performance | Bundle + Lighthouse + Web Vitals | Perf audits |
| Ms Accessibility | WCAG 2.1 AA audit | A11y reviews |
| Mx Storyteller | Long-form narrative | Daily Story chapters, fiction, content quality |
| Ms Strategy | Sale-readiness + DD prep | Master plan ownership, sale narrative |

Mr Lucha (autonomous multi-file shipping) is **paused, not retired**. Reactivate when the user explicitly says so.

---

## Live-walk is the exit gate

Per `.claude/memory/feedback_live_walk_after_every_build.md`:

**vite + eslint green is NOT done.** Done is a screenshot of the live page at mobile (~380px), tablet (~768px), desktop (~1280px) on femwells.com proving the change rendered correctly. Bake this into every agent dispatch.

In Claude Code: you do the walk in your own browser. In Cowork: it's MCP-driven and flaky. Either way, no green-CI-shortcut.

---

## Critical files — read these before non-trivial work

- **`claude-state/master-plan.md`** — the living direction doc. Update on every shipped MP, every crazy idea, every strategic decision. Bump version + add changelog line.
- **`claude-state/H2_DECISIONS.md`** — locked decisions for the Horoscope v2 build (D1-D6). D2 is permanent: attribution chip = "Backed by Astra Cole, MA, FAS" — NEVER "Backed by Skyfield."
- **`.claude/memory/MEMORY.md`** — rolling index of all memory files. Skim before deep work.
- **`claude-state/research_base44_platform.md`** — base44 deep-dive: builder UI, viewport toggle, schema editor, function editor, publish flow.
- **`claude-state/base44_mps/2026-05-13_lifestyle_closeout/README.md`** — the 5 LC MPs (LC-1 paste-ready and pasted; LC-2 already shipped to repo as `ea185fe`; LC-3/4/5 awaiting build).

---

## Current state (2026-05-13)

**Shipped + live on femwells.com:**
- H2 — Horoscope v2: Plum Night theme, Astra Cole authorship, 8 commits + 5 fix commits, 4 paid surfaces wired
- Lifestyle For You (bento + hero + save heart + smart-save phase chooser)
- Daily Story Reader v4d (chunky buttons + bookmarks + 5-level font + true immersive)
- Today / Lifestyle / Profile / Menu / Settings — signed off and largely live
- Sealed Letters (shipped as solo time-travel per demo intent)
- Three engagement mirrors: OnThisDay / Friend6Months / PhaseInbox

**On origin/main but publish in flight / pending:**
- LC-1 (`7795c90`..`3aa5a04`) — base44 bot pushed: PodcastRail, seedPodcasts function, schema additions, plus a bonus chunk of Horoscope improvements (HoroscopeToast, SectionSkeleton, GlossaryTip, BirthDataSheet Nominatim autocomplete, Compatibility rewrite).
- LC-2 (`ea185fe`) — direct repo: Atelier letter writes `draft:false, published_at:now()`; banner removed. Per `H2_DECISIONS.md D6`.

**Next up:**
- Publish LC-1 + LC-2 (base44 publish has been slow — close tab and reopen if stuck, per `feedback_mcp_stuck_recovery.md`)
- LC-3: Remove Sessions entirely (delete `/Sessions` route, kill Listen "SESSIONS" chip, migrate audio rows to a new "Practice" shelf below Podcasts on Listen)
- LC-4: TikTok ingest emoji strip (third-party text imports emoji from captions; strip on write)
- LC-5: Sweep — 7 pending Lifestyle phase verifies + real Spotify URLs + image_url backfill on ~80 empty Longreads rows
- Then: Planner (Phase B priority per master plan)

---

## Rules of engagement (binding)

1. **UK English.** Not US.
2. **No emoji codepoints anywhere** — Lucide icons or SVG.
3. **Plum Night palette is Horoscope-only.** Other surfaces stay on cream day-mode.
4. **Same 5-slot bottom nav at mobile + tablet + desktop.** No desktop sidebar.
5. **No "brick on bread"** — replace, don't pile (`.claude/memory/feedback_no_brick_on_bread.md`).
6. **No stale features** — every new entity must wire to data and surface across pages (`feedback_no_stale_features.md`).
7. **Live-walk every build** before declaring done.
8. **Build directly in this repo**, then `git push origin main`, then publish via base44 builder. **Never paste prompts into base44 yourself** — credits cost money (`feedback_build_direct_not_builder.md`). The user pastes MPs they want pasted; you don't.
9. **Don't auto-summarise after every response.** User finds it noisy. Short responses for short tasks.
10. **Save deliverables as you produce them** to `claude-state/` or repo paths — never wait for the user to ask (`feedback_save_as_you_go.md`).

---

## How to start a Claude Code session in this repo

1. **Read `claude-state/STATUS.md` first.** This is the shared baton between Cowork and Code — current commits, who owns what, what's next. Halli should never have to relay status between the two Claudes; this file is the source of truth.
2. Read `claude-state/master-plan.md` — version + changelog tell you the strategic direction.
3. Read `.claude/memory/MEMORY.md` — the rolling memory index. Skim each entry's one-line hook.
4. Check `claude-handoff/` for the latest `from-cowork-to-code-*.md` or `from-code-to-cowork-*.md` — these are point-in-time messages between Claudes (decisions, blockers, hot questions). STATUS.md is the rolling state; handoff files are the diff.
5. `git log --oneline -10` to confirm the repo position matches STATUS.md's "Just shipped" table.
6. Then propose the next step before touching anything.

If the user gives you an explicit task that doesn't match any pending handoff, just do that — the orientation above is for context, not a forced sequence.

---

## The STATUS.md contract (binding for both Claudes)

`claude-state/STATUS.md` is the rolling state file both Claudes maintain. Three rules:

1. **After every commit you push,** add a row to the top of "Just shipped" in STATUS.md with commit hash, author (Cowork / Code), and a one-line description. Commit STATUS.md in the same push or a tight follow-up — never let main land a commit that's not reflected in STATUS.md.
2. **When you pick up, finish, or hand off a task,** update "In flight" — move items between owners, add new ones, strike finished ones.
3. **Bump the "Last updated" line** at the top + add a one-line note under "Recent edits to this file" at the bottom whenever you change the file.

This means Halli never has to copy status from chat to chat. When either Claude says "what's next?" or "where are we?", the answer is in STATUS.md — both sides read the same file.

---

_Last updated 2026-05-14 by Cowork. If this file is more than two weeks old at read time, surface that to the user — direction docs decay fast on a 6-month sale runway._
