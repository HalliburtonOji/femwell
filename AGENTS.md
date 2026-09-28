# AGENTS.md — the FemWell cross-agent contract

> **Read this first, every session, before touching anything.** Codex auto-reads this file; Claude
> sessions are pointed at it by `CLAUDE.md`. It is the shared operating agreement between the two
> agents building FemWell. If this file and your own habits disagree, **this file wins**.

FemWell is a UK **whole-life wellness app for women** (not a clinical tracker — *health is one room,
not the house*). Live at **femwells.com**, built on **Base44**. There is a buyer demo around
**November 2026**, so shipped quality and coherence matter more than feature count.

---

## 1. Who's who

| Agent | Where it runs | Can it `git push`? | Typical work |
|---|---|---|---|
| **Claude** | Cowork / Dispatch build sessions (in-repo working tree) | **No** — sandboxed, and the branch is usually diverged. Claude commits locally and exports a **patch**. | Deep build passes, research-driven design, real-pixel verification, brand/canon updates, `base44 site deploy` |
| **Codex** | Halli's laptop (Code side) | **Yes** — Codex/the laptop is the push path | Applying patches, pushing to GitHub, laptop-side builds, anything needing real git write access |

**Consequence:** Claude produces commits + a `.patch`; **Codex applies and pushes**. Never assume a
Claude commit has reached GitHub — check `git status -sb` for `ahead/behind`.

---

## 2. The baton — the read-order every session follows

**This chain is the single source of truth. Both agents read it at session start, in this order:**

1. **`CLAUDE.md`** (repo root) — the workflow RULES. Deliberately holds **no** state.
2. **`claude-state/ONBOARDING_READ_FIRST.md`** — the 2-minute self-onboard after a reset.
3. **`claude-state/STATUS.md` — the top current-state block** — the authoritative *state* + ship log.
4. **`claude-state/` plan docs** — the per-area specs/brainstorms (see §7 for the map).
5. **`claude-state/BRAND_IDENTITY.md`** — the brand + operating bible (hard gates live here).

**Then confirm reality before trusting the docs:** `git log -8 --oneline` should match what STATUS.md
claims, and `curl -s https://femwells.com/ | grep -oE 'index-[A-Za-z0-9_-]+\.js'` should match the
live bundle hash STATUS.md records.

**APPEND, don't rewrite.** Every decision, ship and correction goes into **STATUS.md immediately** —
not batched at session end. Each entry records: **what changed + commit hash · shipped-vs-demo ·
live bundle hash after deploy · how it was verified**. A decision that lives only in a chat message
is a decision we *will* forget, and Halli will have to repeat himself — which is itself a defect.

---

## 3. THE HARD GATES — both agents obey these

Pulled from `claude-state/BRAND_IDENTITY.md`. These are not preferences; each one exists because it
was a repeated miss.

### 3.1 The no-strip rule (§17.3, §19.9)
**Never remove a shipped feature.** Default is **ADD / IMPROVE**. Before reworking a surface, **read
it in full and inventory every feature**, then carry them all forward. Only remove on Halli's
explicit say-so.
**§19.9 — a rule you invent NEVER outranks the no-strip rule.** If a new principle you're applying
would delete something that exists, **the feature stays and the principle bends** — then surface the
tension to Halli instead of resolving it by deletion. *(This was earned: a self-invented "one summary
per view" rule silently hid the Lifestyle summary card, the Jess digest and both ritual pills.)*

### 3.2 The build lifecycle (§11) — run it in order, per piece
1. **Atomic motherboard first** — lay the whole surface out as one board, then strip it into the
   smallest possible atoms. **Nothing gets built that isn't a mapped atom.**
2. **Focused brainstorm + cited research per atom** — *before* a line of it is built. Non-generic
   research is Ms Deep Search's job; every claim carries a URL.
3. **Substance, not shells** — *fewer and deeper* beats *many and hollow*. A page with twenty
   half-built surfaces is worse than five real ones.
4. **Publish each build to organised Ideas · Dev for Halli's verification first** (Halli, 28 September 2026). Include its preview, research/plan, verification status and known gaps. A deployed preview is not approval to promote it: the main page changes only after Halli's explicit go-ahead. Keep every preview reachable from the Ideas pill.
5. **Real-pixel verify** — headless at **360 / 390 / 430** with **actual taps**, never DOM-asserts
   alone. **Halli reviews on an iPhone**, so mobile/webkit-shaped viewports are the truth; a 390px
   desktop window reads ~40% larger than the phone.
6. **Adversarial audit at the end** — assume broken until proven; produce a **P0/P1/P2 catalogue**
   with proof per issue, fix in priority order, re-prove each fix.

### 3.3 Conformance + living bible (§11.0, §15.6, §17.6)
- **Brand-bible conformance gate:** an atom is not "done" until it conforms to the relevant
  `BRAND_IDENTITY.md` sections — **and its report names the §s it conforms to**. Non-conforming
  work is a defect, not a style note.
- **Living-bible rule:** every new direction/decision/correction from Halli is written into
  `BRAND_IDENTITY.md` **in the same work cycle it arrives**, before that cycle is called done.
  "Bible updated?" is part of the definition of done.

### 3.4 The smartness standard (§19)
Every section surface must be **bespoke and complete**, **deliberately ordered**, **read real user
state**, carry a **section-specific summary**, be **wired end-to-end with no dead ends**, and be
**rebuilt rather than embedded** when designs clash. **No lazy "jump to" + generic filtered shelf.**
Plus **§19.7 composed-not-stacked** (a rich surface is one directed page with named movements, not a
pile of blocks) and **§19.8 connected-not-siloed** (see §5 below).

---

## 4. Engineering constraints (the ones that bite)

- **50-FUNCTION CAP — hard, and we are AT it.** A net-new Base44 function is **rejected at deploy**.
  **Extend an existing dispatcher instead** (e.g. `createCommunityPost` is an action router with 40+
  branches; its own header notes the cap blocks new *names*, not updates). Scheduled work folds into
  an existing scheduled fn (e.g. `sendNotificationReminders`).
  ⚠️ `base44 functions list | wc -l` counts **lines (~2/fn)**, not functions — don't read headroom
  from it. **Entities are fine**: add/extend via `base44/entities/*.jsonc` + `npx base44 entities push`
  (a schema delta still gets flagged to Halli, never done silently).
- **Deploy = two steps.** Commit + **push** (Codex), then `npx base44 site deploy -y` for the
  frontend. `functions deploy <name>` and `entities push` are **separate surfaces** — don't ship a
  server fix with a site deploy alone. **Cowork/Claude cannot push**; deploys of the built `dist` do
  work from Claude's side.
- **The Base44 ↔ GitHub mirror can sever.** When it does, Halli reconnects it. Symptom: the remote
  gains commits nobody recognises (platform commits like *"Migrated N workflows"*, *"Update base44
  packages"*), or pushes are rejected as non-fast-forward. **Never force-push to resolve it.**
- **Routed-file delegation — `pages.config.js` comments go stale and LIE.** Resolve the Pages MAP,
  not the comment. Known: `/Lifestyle` → **`LifestyleEliteShell`** (`src/pages/Lifestyle.jsx` is a
  **DECOY** — edits there never load) · `/Today` → `TodayClipboardDemo` · `/Planner` → `Planner.jsx`
  · `/Community` → `Community.jsx`.
- **TDZ / ordering traps (real outages, twice).** In these big shells, a hook's **dependency array
  and any module-scope object are evaluated at their line**. Two that took down *every* route:
  referencing a `const` declared later (an array using `bookHref` 20 lines before its declaration —
  and `pages.config` imports every page, so one page's TDZ kills the app), and **using an imported
  binding at module scope** under a circular import. **Declare before use; build styles lazily.**
- **Other scars:** `seededRng()` is stateful — freeze seeded values in `useMemo`. Every sheet/modal
  uses `.fw-sheet-safe` so its last control clears the floating nav. `base44.entities.User.me()`
  doesn't exist → use `base44.auth.me()`. `index.html` has no cache-control; the in-app
  `liveBuildGuard` does a per-build cache-busting reload.
- **Honest auth limits.** Headless/localhost is usually **unauthed** — entity writes guarded on
  `user.id` silently no-op, and Community sits behind an **18+ age gate** (do **not** tap it on
  Halli's behalf). Say so plainly instead of marking such paths "verified".

---

## 5. §19.8 — connected, not siloed

A section is not done when its own surface is good; it's done when it **reads from and writes to the
rest of the app**. Before building, **sweep the codebase for existing touchpoints (grep, don't
assume)** and map the **two-way** wiring: Today · Planner · Community · Garden/progress ·
notifications · Jess.

Two rules learned the hard way on Books:
- **Reconcile duplicates — don't add another system.** Books had **four** parallel book systems, one
  of which (a weekly curator) had *zero* consumers, and **no Community→Lifestyle link existed at all**.
- **Prefer wiring what exists over building new.** The shelf, the club, the cohort and the dispatcher
  actions were already there.

---

## 6. Division of labour + handoff protocol

**Split by surface, not by file.** Whoever owns a surface owns every file under it for that cycle.

- **Claim before you edit.** Add a line to the **IN FLIGHT** table in
  `claude-state/agent-collab/HANDOFF.md` (agent · surface · files · started) and commit that claim
  first. If a surface is already claimed, **don't touch its files** — propose the change in your
  report instead.
- **Never double-edit these hot files** without a claim: `src/components/lifestyle-elite/LifestyleEliteShell.jsx`
  (~2,100 lines, every Lifestyle surface hangs off it), `src/pages/TodayClipboardDemo.jsx`,
  `src/pages/Community.jsx`, `claude-state/STATUS.md`, `claude-state/BRAND_IDENTITY.md`.
- **STATUS.md conflicts:** both agents append. Always add a **new block at the top** of the
  current-state section rather than editing an existing one, so merges stay trivial.
- **Patch exchange (the normal path):**
  1. Claude commits locally, then `git format-patch origin/main --stdout > femwell_<topic>_<date>.patch`
     and hands the file over.
  2. Codex: `git pull --rebase` → `git am --3way <patch>` (or `git apply --3way` for a raw diff) →
     resolve → **push**.
  3. Codex records the push (and any conflict resolution) in STATUS.md.
- **If the patch won't apply**, don't force it — report the conflicting files and let the owning
  agent re-cut it against current `origin/main`.
- **Deploy after a push:** `npx base44 site deploy -y`, then record the new `index-*.js` hash in
  STATUS.md. A no-op redeploy keeping the same hash is **success** (deterministic build).

---

## 7. Current state snapshot — 2026-09-27

*(Point-in-time. STATUS.md's top block is authoritative; re-verify the hash before trusting this.)*

- **Live bundle:** `index-BujbrBaE.js` · **local HEAD:** `aa549050` · branch `main`.
- **⚠️ Git divergence:** local is **ahead 53, behind 3**. The 3 remote commits are Base44 platform
  commits (*Migrated 29 workflows*, *boilerplate auth templates*, *Update base44 packages*).
  **Claude cannot push** (non-fast-forward). Codex should `git pull --rebase` then apply the patch.

**Just shipped — Books, connected across the app** (`21c0a173`):
- The sweep found **four disconnected book systems**; they're now one. **Lifestyle Books ↔ the
  Community `UserBook` shelf** (one cross-device shelf, statuses reading/want/finished/set_aside) **↔
  the Book Club** (spoiler-safe, position-gated checkpoints) **↔ Planner** (reading blocks + the
  club's six weeks as real `PlannerItems` rows) **↔ Today** (now uses the **live** `BookClubPick`; it
  had been shipping a hardcoded *Little Women*/514 while already fetching the real pick) **↔ Garden**
  (reading-day read-back).
- **`?tab=` revived** — the shell now resolves `?tab=`/`?section=`, so Today's links, DailyStoryReel's
  and **Jess's book suggestions** finally land instead of dumping her on the landing.
- **First Community→Lifestyle link ever** ("Your reading corner" in `LibraryTogether`).
- **Schema delta (approved + pushed):** `PlannerItems.source` + `.ref` ("kind:id") — so the planner
  deep-links back **and any content type can schedule itself**.
- **Weekly curator PARKED** (`weeklyBookCurator`/`WeeklyBookPick`) — its books are commercial ISBNs;
  surfacing them would turn the reading corner into a shop. The club pick is the featured book.
- Before it: a **regression fix** (`a6d3fec5`) restoring the summary card + Jess digest + ritual pills.

**In flight / next:**
- **HELD:** the Books **notification nudge** ("your next chapter is waiting") — it edits the existing
  `sendNotificationReminders`; awaiting Halli's word.
- **NEXT:** the deep research-driven pass on **Read**, then Listen · Story · Good life · Yours
  (Sky to be audited against the same bar).

**Open decisions for Halli:**
1. **Flip Books live** — the clean Lifestyle page is demo-only (`/LifestyleBespokeDemo`); going live
   is a one-line prop change in `src/pages/LifestyleElite.jsx`.
2. **The silent-backlog alternative** — "3 waiting for you" vs a silent backlog (our serial research
   prefers silent; Halli's direction was the count). One-line swap.
3. **The reading notification nudge** (above).
4. Two known nits on the clean header: the title wraps at 390 leaving the heart mid-line; the Sky
   jump strip's last chip clips (it scrolls).

---

## 8. Tone + product guardrails (never negotiable)

Warm **smart-friend** voice, never clinical. **UK English. No emoji** (Lucide/inline SVG only).
**No scoreboards, no streaks, no guilt** — a gap is weather, not failure. Anonymity-first Community
(consent-gated, moderated). **No generative AI writing *about* her** (recaps and blurbs are authored
or drawn from the source text). **Never fake a shelf** — measure real content first; a thin section
gets an honest empty state or a real deep-link, never filler.
