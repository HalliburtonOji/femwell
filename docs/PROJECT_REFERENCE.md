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

---

# Sprint state — 2026-05-17 (life-stage adapter sprint)

Current sprint focus: **stage-specific persistence + insights**. We are 3 sprints deep into the life-stage adapter rebuild — `getPlannerConfig(lifeStage, conditions)` is now the single source of truth that reshapes the entire Planner.

## Sprint 3 — done (today)

| # | Build | Commit | Notes |
|---|---|---|---|
| 1 | TTC: BBT/OPK persistence + 14-day SVG chart | `8566904`…`896ea0e` (Code) | `BbtChart.jsx`, `BbtLog.jsonc`, `OpkLog.jsonc`. Graceful entity-missing fallback. |
| 2 | Pre-TTC: SupplementTrackerCard daily compliance | `655a70c` (Code) | `SupplementLog.jsonc`. Adds Selenium row when `conditions` includes `thyroid`. |
| 3 | Pregnancy T3: KickCounterCard with NHS signpost | `443b24e` (Code) | `KickLog.jsonc`. <10 kicks in 2h → midwife signpost. |
| 4 | Postpartum: EPDS 10-question wellbeing check-in | `868c6a8` (Cowork) | localStorage-only. Q10 safety-flag escalates regardless of total. Three bands → NHS signpost. |
| 5 | Perimenopause: HRT × symptom 30-day correlation | `7ff2526` (Cowork) | Pure-SVG chart. HRT overlay step line when `conditions.includes('hrt')`. Data-driven insight copy. |

## Sprint 2 — done (2026-05-17 earlier)

| # | Build | Commit |
|---|---|---|
| 1 | ContraceptionCard history shell + drift fix | `4a34d1d` + `f8225d8` |
| 2 | TTC FertileWindowCard v1 (7-day strip + local-stub BBT/OPK) | `c1cc602` |
| 3 | Pregnancy due-date countdown card (Today variant) | `541e239` |
| 4 | Profile Stage edit modal lift | `5e651c5` |
| 5 | GP-ready PDF: pregnancy + pre-TTC variants | `040dc31` |

## Sprint 1 — done (2026-05-17 morning)

Pregnancy bugs (`337159e`, `b057a11`, `b660832`) · Jess hero DEV-override fix (`a5a9d80`) · peri/meno banners (`212f778`) · onboarding life-stage step + FirstLaunchStagePicker (`5c0c809`) · ContraceptionMemory entity + card (`bd141b3`) · DevStageSwitcher conditions picker (`4be1851`) · Pre-TTC mode richer config + FolicAcid/AMH/SupplementStack cards (`08611a5`) · IntentionCard gate (`edbd441`).

---

## Workflow now — direct GitHub commits

The 2026-05-13 "hybrid" rule above still applies in spirit, but **all five Sprint 3 builds shipped as direct repo commits**. Halli publishes on base44 herself after each commit — no paste-ready prompts unless schema migration is involved. Pattern:

1. Edit files in this repo.
2. `npm run build` — must exit 0.
3. `git commit -m "<conventional message>"` with the Claude Code-Authored-By trailer.
4. `git push origin main`.
5. **Halli publishes** on base44 (Preview → Publish → Publish App).
6. Live walk on femwells.com via the Claude-in-Chrome MCP using the DEV switcher to QA every stage/condition combo.

Two-agent rebase rule: if `git push` rejects because Code agent pushed in parallel, `git rebase --abort` + `git reset --hard origin/main` + rebuild your changes on top. Their factoring usually wins.

---

## Life stages — 12 enum values

| Key | Label | Tab | Ribbon type | Banner |
|---|---|---|---|---|
| `none` | Not set | Cycle | cycle | — (first-launch modal fires) |
| `teen` | Teen | Cycle | cycle | Parent Bridge — Mum can see: dates only. |
| `reproductive` | Reproductive years | Cycle | cycle | — |
| `pre-ttc` | Pre-TTC | **Prepare** | cycle | Pre-TTC Mode — building your baseline for when you're ready |
| `ttc` | Trying to conceive | **Clinical** | cycle | — |
| `pregnant-t1` | Pregnant · T1 | **Journey** | pregnancy | Pregnancy Mode · First Trimester — cycle tracking is paused. |
| `pregnant-t2` | Pregnant · T2 | Journey | pregnancy | Pregnancy Mode · Second Trimester — cycle tracking is paused. |
| `pregnant-t3` | Pregnant · T3 | Journey | pregnancy | Pregnancy Mode · Third Trimester — cycle tracking is paused. |
| `postpartum` | Postpartum | **Recovery** | event | Postpartum Mode — period may not have returned, and that's expected. |
| `perimenopause` | Perimenopause | **Patterns** | symptom | Perimenopause Mode — symptoms over predictions. |
| `menopause` | Menopause | Patterns | symptom | Menopause Mode — focused on long-term health, not cycle. |
| `post-menopause` | Post-menopause | **Health** | health | No cycle ribbon — centred on long-term health. |

`pregnancy` exists as a legacy alias for pregnant-t1/2/3.

---

## Conditions — 8 cross-cutting modifiers

`pcos`, `endo`, `pmdd`, `fibroids`, `thyroid`, `hrt`, `cancer-survivor`, `ha`.

Conditions stack on top of the stage config. PCOS adds the `"PCOS Mode — we are not predicting your next period."` banner unless overridden by a protected stage. HA adds `"Recovery mode — we will not predict your cycle."` and reshapes voice entirely. HRT activates the HrtLog card on peri/meno surfaces and the HrtCorrelationCard overlay on the Today tab.

**Protected stages** (whose `bannerText`, `ribbonType`, `cycleTabName`, `cycleTabMode`, `eyebrowPrefix` survive a condition override): `pregnant-t1/t2/t3`, `pregnancy`, `postpartum`, `post-menopause`. See `PROTECTED_STAGES` + `PROTECTED_KEYS` in plannerAdapter.

---

## plannerAdapter pattern (read before editing any Planner surface)

`src/utils/plannerAdapter.js` exports `getPlannerConfig(lifeStage, conditions)`. **Every Planner child should consult the returned config object — never read `profile.life_stage` directly**, because that bypasses the DEV override and (in production) the first-launch modal flow.

Returned shape:

```js
{
  ribbonType:     "cycle" | "symptom" | "pregnancy" | "event" | "health",
  pillarSet:      ["Sleep", "Energy", ...],         // 6 PillarsDeck tiles
  eyebrowPrefix:  "TODAY · PERI",                    // string above Jess hero
  cycleTabName:   "Patterns" | "Journey" | "Clinical" | "Prepare" | "Recovery" | "Health" | "Cycle",
  cycleTabMode:   "ribbon" | "heatmap" | "timeline" | "events" | "health",
  hiddenFeatures: ["periodLogging", "phaseSignedIntention", ...],
  contentTags:    ["any", "perimenopause", "hrt"],
  jessContext:    "Plain-English prompt fragment for the Jess LLM",
  bannerText:     "Perimenopause Mode — symptoms over predictions." | null,
}
```

In Planner.jsx, the chain looks like:

```js
const realLifeStage    = profile?.life_stage ?? null;
const effectiveLifeStage = devStageOverride || realLifeStage || "reproductive";
const realConditions     = profile?.conditions ?? profile?.condition_flags ?? [];
const effectiveConditions = devConditionsOverride !== null ? devConditionsOverride : realConditions;
const plannerConfig = useMemo(
  () => getPlannerConfig(effectiveLifeStage, effectiveConditions),
  [effectiveLifeStage, effectiveConditions]
);
```

Pass `plannerConfig` (and where needed, `effectiveLifeStage` + `effectiveConditions`) down as props.

**Hidden-features gate pattern:** `{!plannerConfig?.hiddenFeatures?.includes('periodLogging') && <Component />}`. Hidden features currently in use: `periodLogging`, `fertileWindow`, `cyclePhaseRibbon`, `ovulationWindow`, `planNextCycle`, `savedRhythms`, `contraception`, `phaseSignedIntention`, `smartViewPhaseChips`, `phaseColors`, `phaseColorsDominant`, `cycleRibbon`, `phasePrediction`, `ttc`, `pregnancy`, `partnerSync`, `hrt`.

---

## Entity pattern (base44 SDK)

All new code talks to base44 via `import { base44 } from "@/api/base44Client";`. Legacy code uses `window.ezsite.apis.*` — phase out in passing, don't grand-refactor.

Canonical graceful-degradation helper for any entity that might not exist on base44 yet:

```js
function safeEntity(name) {
  try {
    const ent = base44?.entities?.[name];
    if (!ent || typeof ent.filter !== "function") return null;
    return ent;
  } catch { return null; }
}

// In a component:
const ent = safeEntity("BbtLog");
if (!ent) { setEntityMissing(true); return; }
try {
  const rows = await ent.filter({ user_id: userId }, "-date", 60);
  setLogs(Array.isArray(rows) ? rows : []);
} catch (err) {
  const msg = String(err?.message || err || "");
  if (/not\s*found|unknown|404|400|BbtLog/i.test(msg)) setEntityMissing(true);
}
```

Every new entity-backed card MUST render a friendly "Coming soon" placeholder when the entity is missing on base44. Reference implementations: `HrtLogCard.jsx`, `ContraceptionCard.jsx`, `FertileWindowCard.jsx`, `HrtCorrelationCard.jsx`.

**Privacy carve-out:** EPDS / mental-health screens are localStorage-only. Never persist to base44. See `EpdsScreenCard.jsx`.

Schema source-of-truth lives in `base44/entities/*.jsonc` (committed for traceability) but the live schema is on base44. To make an entity exist:
1. Add the `.jsonc` schema file.
2. Write a paste-ready prompt at `claude-handoff/from-cowork-to-base44-ai-YYYY-MM-DD-<name>.md`.
3. Build the UI shell with graceful fallback so the card renders before the entity exists.
4. Halli pastes the prompt into the base44 AI builder and republishes.

---

## DevStageSwitcher pattern

`src/components/planner/DevStageSwitcher.jsx` is the floating pill on the Planner page. Halli uses it to QA every stage + condition combo without touching the backend.

Keys + events:
- `localStorage.femwell_dev_life_stage` (string) — DEV stage override.
- `localStorage.femwell_dev_conditions` (JSON array) — DEV conditions override. Empty array means "override on but no conditions"; absent key means "use real conditions".
- `femwell_dev_stage_change` and `femwell_dev_conditions_change` — same-tab custom events. Cross-tab uses native `storage` event. 1.5s polling fallback in Planner.jsx as belt-and-braces.

Exported helpers: `readDevStageOverride()`, `writeDevStageOverride(stage)`, `readDevConditionsOverride()`, `writeDevConditionsOverride(arr)`.

---

## Design tokens

```
--femwell-cream:    #F4EDDB    page background
--femwell-paper:    #FBF6E6    card background
--femwell-espresso: #3A2C1A    primary text
--femwell-plum:     #4A2A3A    secondary text
--femwell-blush:    #E8B4B8    postpartum, soft warm accent
--femwell-sage:     #8FAF8F    peri, TTC, good-news accent
--femwell-muted:    #9B8B7A    italic meta text
--femwell-gold:     #A6862B    eyebrows, peak markers, accent borders
--femwell-rose:     #D45E52    primary CTAs
```

**Cycle phase palette** (Le Menu × Phase Sun):

```
menstrual  #9A2845
follicular #D4745A
ovulatory  #C8A040
luteal     #7B5E9A
none       #A6862B
```

**Typography:** Fraunces (italic serif for hero titles + insights) + Inter (everything else) + Lucide icons. **No emoji codepoints in product** — Lucide / SVG glyph fallback only.

---

## SVG chart convention

No external chart libraries — bundle stays small. Pattern:

```jsx
const W = 320; const H = 110;
const PAD_X = 16; const PAD_TOP = 18; const PAD_BOTTOM = 20;
const innerW = W - PAD_X * 2;
const innerH = H - PAD_TOP - PAD_BOTTOM;
const xFor = (i) => PAD_X + (i / Math.max(1, series.length - 1)) * innerW;
const yFor = (v) => PAD_TOP + ((MAX - v) / (MAX - MIN)) * innerH;

// Connect consecutive non-null points so logging gaps render as breaks:
const segments = [];
let cur = [];
series.forEach((d, i) => {
  if (d.value != null) cur.push({ x: xFor(i), y: yFor(d.value) });
  else if (cur.length > 0) { segments.push(cur); cur = []; }
});
if (cur.length > 0) segments.push(cur);
```

Canonical implementations: `BbtChart.jsx` (14-day BBT with coverline), `HrtCorrelationCard.jsx`'s `CorrelationChart` (30-day severity + HRT overlay), Planner's `PregnancyTimelineCard` progress bar (40 segments).

---

## File structure quick-ref

```
femwell-repo/
├── CLAUDE.md                      ← this file
├── base44/entities/*.jsonc        ← entity schema sources
├── claude-handoff/                ← paste-ready prompts for base44 AI builder
├── claude-state/
│   ├── STATUS.md                  ← shared baton between Cowork + Code
│   ├── master-plan.md             ← strategic direction (versioned)
│   └── ...
├── .claude/memory/                ← rolling memory (read on session start)
└── src/
    ├── pages/
    │   ├── Planner.jsx            ← the central life-stage adapter consumer
    │   ├── Profile.jsx            ← stage gold card + edit modal
    │   ├── Today.jsx              ← daily check-in landing
    │   └── Onboarding.jsx         ← 11-stage life_stage step
    ├── components/planner/
    │   ├── DevStageSwitcher.jsx
    │   ├── FirstLaunchStagePicker.jsx
    │   ├── today/
    │   │   ├── JessNarrativeHero.jsx
    │   │   ├── PillarsDeck.jsx
    │   │   ├── KickCounterCard.jsx          (T3 only)
    │   │   ├── EpdsScreenCard.jsx           (postpartum only)
    │   │   └── HrtCorrelationCard.jsx       (peri only)
    │   └── cycle/
    │       ├── MonthRibbon.jsx              (cycle stages)
    │       ├── SymptomRibbon.jsx            (peri/meno)
    │       ├── HrtLogCard.jsx               (peri/meno HRT regimen)
    │       ├── ContraceptionCard.jsx        (repro / pre-ttc)
    │       ├── FertileWindowCard.jsx        (TTC)
    │       ├── BbtChart.jsx                 (shared SVG, extracted by Code)
    │       ├── PreTtcCards.jsx              (FolicAcid + AMH + SupplementStack)
    │       ├── SupplementTrackerCard.jsx    (pre-TTC daily compliance)
    │       ├── DoctorReadyDiaryCard.jsx     (NICE NG23 PDF)
    │       └── GpExportButton.jsx           (GP / midwife / pre-conception PDF)
    ├── utils/plannerAdapter.js     ← getPlannerConfig — the single source of truth
    └── api/base44Client.js         ← base44 SDK init
```

---

## What NOT to ship without explicit go-ahead

- **Stripe / paywall code** — Plus tier parked until end of project. No watermark wiring, upgrade sheets, Stripe price IDs.
- **Capacitor / native wrap** — likely needed for App Store IAP but not until paywall question lands.
- **Investment / financial advice** — never. App is health, not finance.
- **Auth-flow changes** — no OAuth additions, password resets, account-creation paths without explicit ask.
- **Emoji codepoints** — never, anywhere in product. Lucide / SVG only.

---

## Quick verification commands

```bash
# What life stages are wired in plannerAdapter?
grep -E "^  \"?[a-z-]+\"?: \{" src/utils/plannerAdapter.js

# Which cards render on each Cycle / Today path?
grep -nE "effectiveLifeStage === |ribbonType ===" src/pages/Planner.jsx

# Which entities does the app touch?
grep -rnE "base44\\.entities\\.[A-Z][a-zA-Z]+" src/ | grep -oE "base44\\.entities\\.[A-Z][a-zA-Z]+" | sort -u

# Build + test
npm run build           # must exit 0 before committing
npx eslint src/         # warnings OK, errors not

# Recent commits
git log --oneline -20
```

---

_Sprint 3 section added 2026-05-17 by Cowork. The 2026-05-14 orientation above remains canonical for workflow + agent team; this section is current state + adapter reference._

