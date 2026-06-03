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

## ALWAYS USE THE NAMED AGENT ROSTER (every relevant task):
FemWell has a standing team of named subagents, bound by specs at `.claude/agents/*.md` (+ `TEAM.md` in repo root). Dispatch them BY NAME on every relevant task — do not hand-write specs/research/verification/craft yourself when a teammate owns it. Read the spec file before dispatching (it encodes tools, output contract, rules). Core roster: **Mr Lead Manager** (scope/spec each MP), **Ms Deep Search** (non-generic research), **Ms Verify** (live/exit-gate verification — runs after every build/ship), **Mr Fix-it** (trivial ≤2-file edits), **Ms Atelier** (UI/UX craft + brand gate, model: opus), plus Mx Storyteller, Ms Accessibility, Mr Performance, Ms Data, Mr Tester, Ms Strategy (and Mr Lucha, paused). For any visual change: **Ms Atelier crafts, Ms Verify checks it (against the reference/spec) before ship.** Memory: `feedback_femwell_agent_team.md`.

## APP DETAILS:
- Live at: femwells.com
- Base44 App ID: 69a9891a6ccccc1822bbb4bc
- Design tokens: --femwell-cream #F4EDDB, --femwell-espresso #3A2C1A, --femwell-blush #E8B4B8, --femwell-sage #8FAF8F, --femwell-muted #9B8B7A, gold #D4AF37
- 11 life stages: teen, reproductive, pre-ttc, ttc, pregnant-t1/t2/t3, postpartum, perimenopause, menopause, post-menopause
- Test user: ojihalliburton57 / ojihalliburton57@gmail.com
- Market is UK (NHS, GMC/NMC/HCPC, £, UK GDPR). No emoji anywhere (Fraunces + Inter + Lucide/SVG only). One unified bottom nav at all viewports.

## WHEN DISPATCH (ORCHESTRATOR) RESETS:
If you see "This session is being continued from a previous conversation that ran out of context" — you have reset. STOP. Tell the user: "I've just reset and lost workflow memory. I'm reading STATUS.md + ONBOARDING_READ_FIRST.md for the rules and current state. Ready to continue — what's next?" Then wait for instruction before doing anything.

## PUBLISH WORKAROUND
UI "Publish App" button regularly hangs on "Publishing..." because of a stale base44 preview-mode lint auto-fix loop. Deploy via direct API instead:
```
POST https://app.base44.com/api/apps/69a9891a6ccccc1822bbb4bc/deploy
Authorization: Bearer <base44_access_token from localStorage>
```
Returns 200 in ~5s. Live bundle hash flips ~60-90s later. Verify:
`curl -s https://femwells.com/ | grep -oE 'index-[A-Za-z0-9_-]+\.js'` (hash changes when the new bundle is live) — then record that hash in STATUS.md per the BATON RULE.
