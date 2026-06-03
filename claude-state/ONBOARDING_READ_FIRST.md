# FemWell — READ THIS FIRST (reset-proof self-onboarding)

**Purpose:** a fresh session (Cowork or Code) reads this + the top of `STATUS.md` and is fully current with zero hand-holding. ~2 minutes.

## 1. What FemWell is
A UK women's wellness app — cycle / hormone / perimenopause-menopause tracking + an AI assistant named **Jess** (and a horoscope persona, **Astra**). Built on **Base44** (low-code), React app synced to this repo, live at **femwells.com**. Goal: product depth + craft for a buyer demo / sale (target sale window ~Nov 2026, soft cap ~Feb 2027). Halli is the solo builder.

## 2. The two-Claude workflow
- **Cowork (desktop, this is usually where Halli talks to you):** planning, research, live-walks via Chrome, design demos, doc/baton upkeep, memory. Can deploy via the base44 deploy API.
- **Code (CLI):** heavy code, base44 functions via `npx base44 exec`, schema work.
- They coordinate **only** through `claude-state/STATUS.md`. Halli should never relay status between them.
- **git push is the Code side's lane.** Cowork sandboxes often have NO git credentials — if `git push` fails with "could not read Username", that's expected: commit + export a patch (`git format-patch`) to the workspace and hand it to Code, who pushes. Cowork's lane is deploy-via-API + Chrome publish, not push.

## 3. Where state lives (and the anti-staleness rule)
- **`claude-state/STATUS.md` top block = the single source of truth** for "where we are / what's next / what shipped." If anything else disagrees, STATUS wins.
- **`CLAUDE.md` = workflow rules only, no state** (on purpose — prevents contradictions).
- **THE BATON RULE:** every commit that lands on `main` gets a SHIP LOG line in STATUS.md: commit hash + summary, shipped-vs-demo, live bundle hash after deploy, verification. Always. This is what keeps the baton from going stale.

## 4. Hard rules (don't violate)
- **Never type into the Base44 web editor chat** — it costs paid build points. Build by editing this repo + git, or (Cowork) deploy via the API.
- **Publish via the deploy API**, not the hang-prone UI button (see CLAUDE.md). Then record the new bundle hash in STATUS.md.
- **Market = UK.** NHS, GMC/NMC/HCPC, £, UK GDPR. No Nigerian/other framing without asking.
- **No emoji anywhere.** Fraunces + Inter + Lucide/SVG glyphs only.
- **One unified bottom nav** at mobile/tablet/desktop — no desktop sidebar.
- **Live-walk before calling anything "done."** A green build is not done; a Chrome screenshot of the live page is. The site has a daily **"Start my day" gate** on full reload — click through it to reach the app shell + bottom nav. Some routes 404 on direct deep-link (e.g. `/Programs` → real route `/ProgramsHub`); navigate in-app or via the known route.
- **Paywall / Plus tier is parked** until the sale window — don't pre-build it.

## 5. How to get current at session start (copy/paste mental checklist)
1. `git pull` (or fresh `git clone https://github.com/HalliburtonOji/femwell.git`).
2. Read the **top block of `claude-state/STATUS.md`** (current state + ship log + open questions).
3. `git log -8 --oneline` — confirm HEAD matches STATUS.
4. `curl -s https://femwells.com/ | grep -oE 'index-[A-Za-z0-9_-]+\.js'` — confirm the live bundle matches STATUS.
5. Skim the **OPEN QUESTIONS / NEEDS-HALLI** list in STATUS — surface anything stale proactively.

## 6. Key references
- Repo: `github.com/HalliburtonOji/femwell.git`
- Baton: `claude-state/STATUS.md`
- This doc: `claude-state/ONBOARDING_READ_FIRST.md`
- Design demos + research: `claude-state/` (and the Cowork OneDrive workspace mirror)
- Agent roster Halli uses by name: Mr Lead Manager (planning/MPs) · Ms Deep Search (research) · Ms Verify (verification) · Mr Fix-it (fixes) · Ms Atelier (UI/UX craft)
