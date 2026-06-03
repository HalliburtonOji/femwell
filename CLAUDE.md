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

## THE BATON RULE (every ship updates STATUS.md):
After any commit that lands on `main`, append a SHIP LOG line to `claude-state/STATUS.md` with: (1) commit hash + summary, (2) shipped-vs-demo, (3) live bundle hash after deploy, (4) verification. If you don't log all four, the baton is broken. No exceptions.

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
