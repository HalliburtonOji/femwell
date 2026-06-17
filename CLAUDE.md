# FEMWELL WORKFLOW — READ THIS FIRST

> **This file = workflow RULES only. It deliberately holds NO "current state."**
> Project state lives in ONE place: **`claude-state/STATUS.md`** (the shared baton). Read its top block first.
> Keeping state out of this file is intentional — it's what stops CLAUDE.md and STATUS.md from contradicting
> each other and making Halli re-explain things after a reset.

## IF YOU ARE STARTING A NEW SESSION OR JUST RESET:
1. Read `claude-state/ONBOARDING_READ_FIRST.md` (2-minute self-onboard).
2. Read the top block of `claude-state/STATUS.md` (authoritative current state + ship log).
3. `git log -8 --oneline` to confirm HEAD matches what STATUS.md claims.
4. Then proceed.

## THE ONLY WAY TO BUILD FEATURES:
1. Edit code directly in this repo (React app synced to Base44)
2. Commit each build with git
3. Do NOT use the Base44 web editor chat interface — it costs paid build points
4. Do NOT search for local paths — you already have the repo open
5. Do NOT spin up new task sessions — work happens here

## THE BATON RULE — UPDATE STATUS.md CONSTANTLY (not at session end):
Update `claude-state/STATUS.md` IMMEDIATELY after EVERY build / fix / ship — the moment a change is made, not batched up for later. Each entry records all four: (1) what changed + commit hash, (2) shipped-vs-demo, (3) live bundle hash after deploy, (4) verification (live-walk / build / Ms Verify). If you don't log all four right away, the baton is broken and the next (possibly reset) session loses the thread. No exceptions. This rule exists because state went stale before and Halli had to re-explain.

## BRAND GATE — READ BRAND_IDENTITY.md BEFORE ANY UI / VISUAL WORK:
Before ANY UI/visual work or visual scan (building a page/component, restyling, adding a bloom/motif/heart, reviewing a screenshot for craft), **read `claude-state/BRAND_IDENTITY.md` first and conform to it.** It is the **COMPLETE canonical master** (self-sufficient for building): typography (the actual fonts + the `.fw-*` cascade + the role-based type scale — no free-floating font-sizes), colour (tokens — one gold `#A8893F`, one crimson `#BC2E27`, one cream `#ECE7DA`, retire the legacy duplicates — plus the phase hues AND the 9 colourways), the carved-crimson heart mark, the botanical brand-image system (leaves/corners/dividers/flourishes), the flora backbone/meaning + per-user fingerprint + variety counts, spacing/cards, AND a component map of what to reuse. `claude-state/BRAND_FLORA.md` and `BRAND_IMAGE_RESEARCH.md` are deep/cited appendices it links. If code disagrees with that file, the file wins (and the code is a fix target). Run its §0 pre-build checklist every time. Mirrored in-app at Founders → Brand & UX → Brand Identity and → Flora & Meaning.

## ALWAYS USE THE NAMED AGENT ROSTER (every relevant task):
FemWell has a standing team of named subagents, bound by specs at `.claude/agents/*.md` (+ `TEAM.md` in repo root). Dispatch them BY NAME on every relevant task — do not hand-write specs/research/verification/craft yourself when a teammate owns it. Read the spec file before dispatching (it encodes tools, output contract, rules). Core roster: **Mr Lead Manager** (scope/spec each MP), **Ms Deep Search** (non-generic research), **Ms Verify** (live/exit-gate verification — runs after every build/ship), **Mr Fix-it** (trivial ≤2-file edits), **Ms Atelier** (UI/UX craft + brand gate, model: opus), plus Mx Storyteller, Ms Accessibility, Mr Performance, Ms Data, Mr Tester, Ms Strategy (and Mr Lucha, paused). For any visual change: **Ms Atelier crafts, Ms Verify checks it (against the reference/spec) before ship.** Memory: `feedback_femwell_agent_team.md`.

## APP DETAILS:
- Live at: femwells.com
- Base44 App ID: 69a9891a6ccccc1822bbb4bc
- Design tokens (CANONICAL — see `claude-state/BRAND_IDENTITY.md` §2; these supersede the old values): paper/cream #ECE7DA, paperHi #F4EFE3, paperDeep #D8CFBC, ink #0B0805, muted #2E261B, gold #A8893F, crimson #BC2E27 (the heart), blush #E8B4B8, sage #8FAF8F. (Legacy #F4EDDB / #D4AF37 / #9B8B7A / #3A2C1A are RETIRED — do not use.) Phase hues are a separate semantic set (menstrual #BC2E27 · follicular #8FAF8F · ovulatory #D4AF37 · luteal #8E6E8E).
- 11 life stages: teen, reproductive, pre-ttc, ttc, pregnant-t1/t2/t3, postpartum, perimenopause, menopause, post-menopause
- Test user: ojihalliburton57 / ojihalliburton57@gmail.com
- **Founders docs (Ideas / Design Lab) access — use the floating "IDEAS" pill, do NOT deep-link.** The founder doc tabs live behind the **floating "IDEAS" pill** (dark button bottom-right of the app shell; aria "Open Ideas (Design Lab — dev only)"). Canonical path to open/verify a tab: load /Today as the test user → wait for hydration → CLICK the IDEAS pill (it client-pushes to /Ideas + mounts FoundersOS) → select the tab. **Route behaviour (honest, measured 2026-06-16):** `/FoundersOS` always 404s (no `pages.config` entry); `/Ideas` and `/Founders` DID resolve on cold loads in the test-user Playwright browser (Base44 SPA-fallback + the pagesConfig catch-all; no service worker), BUT Halli reports they don't work for him, and the page is gated to founder emails (others get "This page is private"). So the deep-links are UNRELIABLE across accounts/sessions — always use the pill.
- Market is UK (NHS, GMC/NMC/HCPC, £, UK GDPR). No emoji anywhere (Fraunces + Inter + Lucide/SVG only). One unified bottom nav at all viewports.

## WHOLE-LIFE WELLNESS — NOT A CLINICAL TRACKER (bake into EVERY build):
FemWell is a **whole-life wellness app for women, not a health/clinical tracker. Health is one room, not the house.** Women won't open a wholesome app just to log symptoms and discuss their cycle all day. Every feature, every page, and every cross-surface connection must span life domains — not just health.
- **The life domains to serve (alongside, not instead of, health/cycle):** relationships · dating/marriage · friendship · career/work · money/finance · interests/hobbies · fashion/beauty · creativity · identity/self-expression · joy/fun · entertainment · community/"gossip"/venting.
- **RULE 1 — span life, not just health.** Do NOT make features clinical-only. A game isn't a cycle quiz; a prompt isn't a symptom check; a community room isn't only "PMDD support." Add role-play, fashion, interests, career, friendship, lighthearted fun. **Lighthearted by default; let life-stage gently TINT, never dominate.**
- **RULE 2 — wire ALL the surfaces, every time.** The recurring failure is wiring only 2–3 (always the health) surfaces and ignoring the rest. Every cross-page design MUST account for ALL of: **Today · Journal · Community · Nutrition · Lifestyle (+ its sub-divisions: For You / Read / Listen / Daily Story / Horoscope) · Health · Pulse/Trends/Insights · Planner · Profile · Programs · Doctor Export · Jess · Events · Deals.** Name each surface's role explicitly; never default to Health/Cycle/Planner.
- **Voice + feel:** warm "smart-friend" tone, not a clinician; joyful, wholesome, anonymous-safe; never cold/clinical. Reference plan: `claude-state/WHOLE_LIFE_REBALANCE.html`.

## UX RULE — CENTRAL JUMP-TO SWITCHER ON EVERY MULTI-LAYER PAGE:
Any page with **multiple sections / rooms / tabs / sub-areas** (a "multi-layer" page) MUST have a **central "jump to any area" switcher** for easy jump-in — in addition to whatever doors/tabs it already has. Keep it **consistent across the app**: the canonical pattern is the Journal's `JournalHubSheet` (a bottom sheet titled "Jump to" with a 2-col grid of icon + label + sub, opened by a "Jump"/Hub button) — replicated on Community as `CommunityHubSheet`. Health uses the same intent via its letter tabs. **When you build or extend a multi-layer page, add (or reuse) this switcher** with the same editorial styling (Ephesis/Cormorant, Lucide, no emoji, cream/plum) and the same "Jump to" UX, so a user can always reach any section from one central control. Single-section pages are exempt.

## WHEN DISPATCH (ORCHESTRATOR) RESETS:
If you see "This session is being continued from a previous conversation that ran out of context" — you have reset. STOP. Tell the user: "I've just reset and lost workflow memory. I'm reading STATUS.md + ONBOARDING_READ_FIRST.md for the rules and current state. Ready to continue — what's next?" Then wait for instruction before doing anything.

## DEPLOY (one command — no Chrome, no builder)
The UI "Publish App" button regularly hangs ("Publishing…") on a stale preview-mode lint loop. Don't use it. Deploy with:
```
node scripts/deploy.mjs
```
It reads the platform OAuth token from `~/.base44/auth/auth.json`, auto-refreshes it when expired, POSTs `/api/apps/<id>/deploy` (the same call Publish makes), and polls femwells.com for the bundle flip.
- **Auth is a PLATFORM OAuth token, NOT the api_key** (api_key 401s on /deploy — it's only the SDK data API). One-time setup: `npm i -g base44 && base44 login` (confirm the device code at app.base44.com/login/device) → writes `~/.base44/auth/auth.json` (HOME, outside repo). Token lasts ~30 days + auto-refreshes; if it ever lapses, re-run `base44 login`.
- A no-op redeploy keeps the same `index-*.js` hash (deterministic build) — that's success, not failure. Record any new hash in STATUS.md per the BATON RULE.
- Memory: `base44-deploy-auth-mechanism.md`. (Old manual path still works: `POST app.base44.com/api/apps/<id>/deploy` with `Authorization: Bearer <platform token>`.)
