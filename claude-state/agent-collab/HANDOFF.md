# HANDOFF — full context for the other agent

> **Read `AGENTS.md` (repo root) first — it's the contract. This file is the context dump behind it.**
> Order: `AGENTS.md` → `CLAUDE.md` → `claude-state/ONBOARDING_READ_FIRST.md` → **`claude-state/STATUS.md`
> top block** → the relevant plan doc below → `claude-state/BRAND_IDENTITY.md`.
> Last updated: **2026-09-27** (Claude, Cowork build session).

---

## 1. The product in one page

**FemWell** — a UK **whole-life wellness app for women**. The positioning line that governs every
build: *health is one room, not the house*. It is **not** a period tracker with extras; it's a warm,
editorial, beautiful app about a whole life — relationships, work, money, friendship, rest, joy,
identity, creativity — with cycle/health as one room among them.

- **Live:** femwells.com · **Platform:** Base44 · **App ID:** `69a9891a6ccccc1822bbb4bc`
- **Market:** UK (NHS, £, UK GDPR). **Buyer demo ~November 2026** — coherence and finish matter more
  than feature count.
- **Reviewer:** Halli reviews **on an iPhone**. Mobile pixels are the truth.
- **Test user:** `ojihalliburton57` / `ojihalliburton57@gmail.com`.
- **Voice:** warm smart-friend, UK English, **no emoji**, no scoreboards/streaks/guilt.

**The brand in one line:** *"Your life, in bloom — a living garden that grows as you do."* Cream/ink
world, one gold (`#A8893F`), one crimson heart (`#BC2E27`), Cormorant + Ephesis + system sans, a
real botanical flora system (64 species, meaning-bearing), and cards as a first-class pillar.
Full canon: **`claude-state/BRAND_IDENTITY.md`** (§1–§10 = the brand, §11–§18 = how we build,
§19 = the smartness standard). **If code and the bible disagree, the bible wins.**

---

## 2. The Lifestyle arc (the work of the last stretch) — read this before touching Lifestyle

Lifestyle is the **reference implementation** for the whole app. The arc, in order:

1. **Motherboard + per-board builds** — the page was mapped as atoms, then 11 whole-life boards were
   built one at a time (Mirror · Move · Kindred · Curious · Delight · Nest · Tonight · Becoming ·
   Make · Outside · Money).
2. **Chip-focus** — tap a section chip → the page focuses that section → tap a card → the exact item
   opens. No horizontal sliders in the focused view.
3. **§19 SMARTNESS STANDARD** (now canon) — each section must be its **own bespoke, complete**
   surface, deliberately ordered, stateful, wired end to end. No "jump to" + generic shelf.
4. **The visual reset — "clean & classy" (§2.7)** — Halli: *"cream on cream doesn't look good"*,
   *"remove that burnt look"*. Retired: cream-on-cream cards, the 40% paper-texture multiply, oxblood
   running text, the letterpress heading shadow, per-card rainbow stripes. Adopted: **alabaster
   ground `#F5F4F1`**, **white surfaces**, neutral **ink `#191510`** / **slate `#6E6A61`**, one clean
   shadow, generous spacing — **with the flora kept present** (a real meaning-bloom, the carved
   heart, botanical dividers, a framed feature card, a meaning-rosette per card eyebrow).
   Implementation: `src/components/brand/cleanTokens.js` + `cleanKit.jsx`, behind a **`clean` prop**.
5. **The whole-page pass** — Halli: *"the page fights itself."* Fixed as ONE thing: **one header**
   (the section still via `SectionHeader` + placeholder stills from the real species library — the
   old photo/video hero and the separate script-title block are gone in clean mode), one language
   across every band, and the horoscope **composed into eight movements** at full 18-element parity
   (§19.7).
6. **Per-section deep passes** (current phase) — each section gets **cited research → a reported
   plan → build → real-pixel verify**. **Books is done** (see §4). **Read is next**, then Listen ·
   Story · Good life · Yours; Sky to be audited against the same bar.

**Status of the clean page:** it is **demo-only** at `/LifestyleBespokeDemo`. Live `/Lifestyle`
passes no `clean`/`layout` props and is untouched. **Going live is a one-line prop change** in
`src/pages/LifestyleElite.jsx` — awaiting Halli.

---

## 3. The standards, in short (full text in BRAND_IDENTITY.md)

| Gate | Where | The short version |
|---|---|---|
| **No-strip** | §17.3 · §19.9 | Never remove a shipped feature. A rule you invent never outranks this. |
| **Build lifecycle** | §11 | motherboard atoms → researched brainstorm → substance not shells → drop live → real-pixel + real-tap verify → adversarial P0/P1/P2 audit. |
| **Conformance** | §11.0 · §15.6 | Not done until it conforms to the bible **and the report names the §s**. |
| **Living bible** | §17.6 | Every new direction is written into the bible **the same cycle**. |
| **Smartness** | §19 | Bespoke · ordered · stateful · own summary · wired · rebuilt-not-embedded. |
| **Composed** | §19.7 | A rich surface is one directed page of named movements, not a stack. |
| **Connected** | §19.8 | Sweep for existing touchpoints; wire two-way; reconcile duplicates. |
| **Cards** | §6.7 | Never hand-roll a `<div>` card. Typed variants, real hook + inline action, no empty containers. |
| **Reading craft** | §6.7.8 | All long-form goes through `ReadingColumn`; measure in `ex`; 38–42 CPL is honest at 390px; read-time is permission when small. |
| **Content honesty** | §12 | Measure content **before** designing a shelf (raw counts overstate 3–5×). Never fake a shelf. |

---

## 4. The book systems map (produced 2026-09-27 — the model for future sweeps)

The sweep that proved Books was siloed. **Four parallel systems existed; they are now one.**

| System | Where | Owns |
|---|---|---|
| **Lifestyle Books** | `src/components/lifestyle-elite/BooksStoryFocus.jsx` | The serial, her reading position, the capacity row, the month's picks (`src/components/lifestyle/booksMonthly.js`) |
| **Community Library** | `src/components/community/LibraryTogether.jsx` + `bookshelf.js` | The **cross-device shelf** (`UserBook`: reading / want / finished / set_aside), buddy reads, k-floored "reading along" cohort |
| **The Book Club** | `src/pages/Community.jsx:838` + `bookClubConfig.js` | `BookClubPick` / `ClubCheckpoint` / `ClubNote`, self-attested spoiler-safe checkpoints (`clubReached`) |
| **Weekly curator** | `base44/functions/weeklyBookCurator` → `WeeklyBookPick` | Phase-tagged weekly picks — **PARKED** (commercial ISBNs; surfacing them = a shop) |

**Now wired (both directions):** Books ↔ the shelf (same `UserBook` rows) · Books → club + this
book's **readers' corner** (`dailyReadClubKey`) · **Library → "Your reading corner"** (the first
Community→Lifestyle link ever) · Books → **Planner** (a reading block; the club's six weeks as one
row per checkpoint) · **Today** → the live `BookClubPick` + a real continue-reading row · Books →
**Garden** read-back.

**Key readers/entities:** `BookReader` (Gutendex, real chapter detection, chapter-end reflections,
bookmarks, resume) · `DailyStoryReader` (paginated serial) · device-local `fw_reader_pos_*` /
`fw_read_chapter_*` / `fw_read_reflect_*` · `readingActivity.js` → `createCommunityPost` actions
`readingActivity.record | .cohort | .prediction` → feeds the Garden's reading area.

**Measured content reality:** **0 published FemWell fiction**, so the month's set is **curated
public-domain classics** (Gutendex returns 2,216 for `topic=women` — a live fetch is a dump, not
curation, hence the authored `booksMonthly.js`). **No audiobook exists** anywhere — don't claim one.

**The research behind the Books design:** `mnt/femwell/research_books_section.md` (17 sources). The
reframe that drives it: **the barrier to reading is CAPACITY, not motivation** — 7.3m UK adults say
mental-health issues prevent them reading; 4.96m stopped after life events/ill health/bereavement.
Hence the "Not much in the tank?" row, one featured book (not four), doorway-not-genre, and a hard
line: **no generative AI writing about her reading** (the Fable incident, Jan 2025).

---

## 5. Where everything lives

**Contract + state**
- `AGENTS.md` (root) — the cross-agent contract · `CLAUDE.md` — workflow rules (no state)
- `claude-state/STATUS.md` — **the living shared memory**; top block = current state
- `claude-state/ONBOARDING_READ_FIRST.md` — 2-minute self-onboard
- `claude-state/agent-collab/` — this file + the IN FLIGHT table + `transcripts/`

**Brand + operating canon**
- `claude-state/BRAND_IDENTITY.md` — the one bible (edited in place; never spawn a parallel doc)
- `claude-state/BRAND_FLORA.md` · `BRAND_IMAGE_RESEARCH.md` — cited appendices
- `TEAM.md` + `.claude/agents/*.md` — the named subagent roster (Ms Deep Search, Ms Verify, Ms
  Atelier, Mr Lead Manager, …). Dispatch by name; read the spec before dispatching.

**Design + research output** (phone-readable HTML, also wired into the in-app IDEAS pill)

> ⚠️ **Two folders share this name.** `femwell-handoff/` **inside the repo** is what travels with git —
> the recent design docs were copied in on 2026-09-27 so Codex can actually read them. Halli also keeps
> a `femwell-handoff` folder **outside** the repo (his phone-readable exports). **Write new docs to
> both**, or they never reach the other agent.

- `femwell-handoff/*.html` — plans and exemplars. Most relevant now:
  `LIFESTYLE-WHOLE-PAGE-REDESIGN.html` · `BOOKS-RESEARCH-AND-PLAN.html` ·
  `BOOKS-CONNECTED-MAP.html` · `BOOKS-STORY-EXEMPLAR.html` · `SKY-CLEAN-CLASSY-EXEMPLAR.html` ·
  `CLEAN-CLASSY-VISUAL-RESET.html`
- `femwell-handoff/IDEAS-LINKS-FOR-FOUNDERSOS.md` — the queue of docs to wire into the IDEAS pill
- `mnt/femwell/research_*.md` — cited research (books, daily-story ritual, reader craft, platform)

**Verification scripts** (run these, don't re-invent)
- `scripts/verify-lifestyle-clean.mjs` — whole-page capture + assertions at 360/390/430
- `scripts/verify-story-rotation.mjs` — the serial's model (24/24: daily rotation, month-end close,
  and *her position never jumps ahead*)

**Key source files**
- `src/components/lifestyle-elite/LifestyleEliteShell.jsx` — **the live Lifestyle page** (hot file)
- `src/components/lifestyle-elite/{BooksStoryFocus,SkyFocus,ReadFocus,ListenFocus,GoodLifeFocus,YoursFocus}.jsx`
- `src/components/lifestyle-elite/sky/SkyMovements.jsx` — horoscope movements V–VIII
- `src/components/brand/{cleanTokens.js,cleanKit.jsx,flora.jsx,floraLibrary.jsx,Card.jsx,expandCards.jsx,ReadingColumn.jsx}`
- `src/components/lifestyle/{dailyStory.js,booksMonthly.js}` · `src/components/community/{bookshelf.js,bookClubConfig.js,readingActivity.js}`

---

## 6. IN FLIGHT — claim a surface before you edit it

2026-10-07 staged delivery claim **RELEASED**: source7e511b1/299cbde/liveindex-BHA53SUl.js, independent review and actual three-width founder navigation proved. Next saved stage queued. Scope: BUILD_PLAN/CLAUDE, critique workflow/state/learning, persona, STATUS/Bible/mirror, CritiqueDoc, phone plan and existing heartbeat; main features/four-hour cadence preserved.

2026-10-07 finish release: Claims08c67e6 /93b7f8e /6f187e1 and the four active finish rows below are RELEASED. Source98b1604 final live index-Ct5Eb3OV.js,357 tests, actual six-room mobile taps and independent craft reproof. Default Planner Elite exact short activity return is proved; import-only earlier route inference is superseded. See creative/finish-verification.md and STATUS top for bounded evidence/remaining social/iPhone/main-approval work.

2026-10-07 correction / claim: Codex owns src/components/planner-elite/PlannerEliteShell.jsx and its regression tests. Full default-prop branch inspection proves /Planner defaults to Elite, not the Clipboard import alias. Carry exact joy returns and actual short duration into Elite; preserve all existing controls. Earlier Clipboard changes remain valid for /PlannerLiveTest; its route inference above is superseded.

2026-10-07 extension: Ms Deep Search / Mr Fix-it owns `src/components/planner-v2/PlannerV2ShellClipboard.jsx` and its dedicated regression tests for the exact-source/duration prerequisite. Live taps proved `/Planner` imports that file under the V2 alias; the sibling-only repair must be carried into the actual default route without changing its design. Root owns integration and native re-proof.


Additional claim, 6 October 2026: **Codex** owns `src/Layout.jsx` for new SkyWorldsDemo navigation identity only (preview treated as Lifestyle). RELEASED:6997e0a claim,34cd6a1 repair, native preview nav reproof. Found by live audit; main routing/appearance unchanged.

Current claim, 6 October 2026: **Codex + Creative Director** own five complete Sky visual worlds, Books demo voice correction and review records. Files: `src/components/lifestyle-elite/`, `src/pages/{SkyWorldsDemo,FoundersOS}.jsx`, `src/pages.config.js`, `claude-state/creative/`, `claude-state/{STATUS,BRAND_IDENTITY}.md`, Bible HTML mirror, `public/images/sky-worlds/`, `public/sky-worlds/`. RELEASED:source00d7728 + final repairs b84ad39; live index-rEG30ljq.js. Native all15 headers, all5 lessons/charts, exact kept-return and independent audit;145 tests. See creative/sky-worlds-verification.md. Main held. Preserve every existing feature; no main promotion. Creative/Atelier are read-only until separately delegated an isolated file surface.

**Protocol:** add a row before you start; commit the claim; remove it when the work lands (and record
the landing in STATUS.md). If a surface is claimed, don't touch its files — propose instead.

| Agent | Surface | Files | Started | State |
|---|---|---|---|---|
| Codex / Mr Tester | B01-S01 present Moon clock and isolated producer regression | Codex: LifestyleEliteShell.jsx, sky/SkyFocus clock integration and new sky/useCurrentSkyDay.js/tests, generateHoroscopeReading/entry.ts. Mr Tester only: src/lib/skyProducerRecovery.test.js. | 2026-10-07 | ACTIVE. Critic CR-0005 frozen lunar facts verified in actual routed shell; Tester owns only producer harness/tests. Preserve all tools/aliases/accepted headers; no hot-file parallel edits. |
| Codex | B01-S01 shared reading freshness utility, actual path correction | src/components/lifestyle-elite/finishLifestyle.js and finishLifestyle.test.js; src/lib/skyProducerRecovery.test.js | 2026-10-07 | ACTIVE. Actual full-file resolution corrects earlier lib path; no new stores or schemas. |
| Codex | B01-S01 backend lookup guard and canonical exact lesson returns/freshness | base44/functions/generateHoroscopeReading/entry.ts; src/lib/{lifestyleReturns,savedCollections,finishLifestyle}.js and dedicated relevant tests | 2026-10-07 | ACTIVE. Extends4387308 after actual producer/consumer audit. Bounded reliability only; no function name/schema/privacy change, separate backend deploy/proof. |
| Codex | B01-S01 Sky refresh, failed reads and exact editions; CR-0003 Ideas status labels | sky/useSelectedSkyChart.js, DailySkyLesson.jsx, relevant Sky hooks/tests and SkyFocus integration; FoundersOS.jsx catalogue labels only; CritiqueDoc.jsx; critique/reports/state/learning, BUILD_PLAN, STATUS/Bible/mirror and phone plan | 2026-10-07 | ACTIVE. Inspect full inventory/research before repair; critic/research/lead read-only. Preserve every accepted header, tool and existing dispatcher. |
| Codex | Staged delivery, rolling build plan and concise progress contract | CLAUDE.md; claude-state/BUILD_PLAN.md; critique runbook/state/learning; critic persona; STATUS/Bible/mirror; CritiqueDoc.jsx; plan export; existing heartbeat | 2026-10-07 | RELEASED.7e511b1/299cbde/liveindex-BHA53SUl.js. Scheduler updated in place; independent workflow/pixels and actual three-width Ideas/plan returns. NextB01-S01-A01 queued; CR-0003 labels carried forward. |
| Codex | CR-0002 Ideas header Back/calendar collision | src/pages/FoundersOS.jsx header control spacing only; critique reports and STATE | 2026-10-07 | RELEASED.5faa13d/liveindex--ssQW2DJ.js.44px Back/14px gap/no overlap at360/390/430, native Back and calendar, independent pixels proved. |
| Codex | CR-0001 daily Sky lesson accessibility semantics | src/components/lifestyle-elite/sky/DailySkyLesson.jsx; existing DailySkyLesson regression checks | 2026-10-07 | RELEASED.724e7d8/liveindex--ssQW2DJ.js.33lesson checks, valid group/DIV structure, actual three-width controls and independent fresh pixels; all content/state retained. |
| Codex | Four-hour Critique Director, durable audit rotation, routine repair authority and Ideas report | .claude/agents/critique-director.md; TEAM.md; claude-state/critique/; claude-state/{STATUS,BRAND_IDENTITY}.md; Bible HTML mirror; src/pages/FoundersOS.jsx; src/components/founders/CritiqueDoc.jsx; scheduler configuration | 2026-10-07 | RELEASED.724e7d8/5faa13d/liveindex--ssQW2DJ.js. Four-hour thread heartbeat ACTIVE, first independent audit/two routine repairs proved; persona/canon/learning/Ideas saved. Next cursor Sky edge states then Read. |
| Codex | Selected main activity overlay header clearance | src/components/brand/FaceOverlay.jsx; existing root shell and promotion tests | 2026-10-07 | RELEASED. fd2784b/liveindex-C4ypRGFt.js. Selected64px inset/44px Back, old dimensions retained.8/8integration, actual native exit and independent six-region360/390/430 reproof closes P09/crop gap. |
| Mr Lead Manager / Mr Fix-it | Promotion Sky exact owned reading and parity | src/components/lifestyle-elite/SkyFocus.jsx, sky/useSelectedSkyChart.js, isolated Sky reading-query tests, creative/promotion-sky-* | 2026-10-07 | RELEASED.1d46eda/4a8fbd1/liveindex-C4ypRGFt.js. Exact owner/id/date recovery, preserved original main daily producer and newest shared glance.421complete checks plus final8 targeted; native current agreement. |
| Codex | Approved Lifestyle main promotion, no-strip parity, central wiring/design and delivery | src/pages/LifestyleElite.jsx, src/pages/SkyWorldsDemo.jsx, src/components/lifestyle-elite/LifestyleEliteShell.jsx, SelectedLifestyle.css, SkyWorlds.css, FocusLayouts.jsx, SelectedLifestyleHeader.jsx, shared section bodies, src/components/brand/expandCards.jsx, src/pages/FoundersOS.jsx, src/pages.config.js, public/{selected-lifestyle,lifestyle-workshop}/, src/pages/JournalHub.return.test.jsx, claude-state/{STATUS,BRAND_IDENTITY}.md, Bible HTML mirror, creative/promotion-* | 2026-10-07 | RELEASED.1d46eda/4a8fbd1/fd2784b; liveindex-C4ypRGFt.js.421full+8final targeted, native main tap/source proof, independent final pixels, Bible10.5.19/Ideas updated. Promotion-verification.md records parity/repaired catalogue and social/payment/iPhone limits. |
| Ms Deep Search / Mr Fix-it | Canonical production exact-source returns | src/lib/{lifestyleReturns,savedCollections}.js, src/components/lifestyle-elite/sky/{skyLessons,skySourceContracts}.js, sky/DailySkyLesson.jsx, sky/SavedSkyLessons.jsx, src/components/saved/SavedItemCard.jsx, relevant isolated return tests; creative/promotion-returns-* | 2026-10-07 | RELEASED.1d46eda/liveindex-C4ypRGFt.js. Exact canonical main sources, explicit previews/version/hash/date retained;18newreturncases within421 full checks. Native existing Planner→main joy and owned kept lesson source proved; no backend/schema/social send. |
| Codex | Finish selected six-section bodies, existing shared wiring and Ideas delivery | src/components/lifestyle-elite/ except delegated Sky files; src/pages/{LifestyleDetail,FoundersOS,Saved}.jsx; src/components/{planner-v2,community,brand}/ as mapped; claude-state/{STATUS,BRAND_IDENTITY}.md, creative/, connected-life/; Bible mirror; public/{selected-lifestyle,lifestyle-workshop}/ | 2026-10-06 | RELEASED. Source98b1604; live index-Ct5Eb3OV.js. 357 checks, native360/390/430 and independent craft reproof. Finish-verification.md records actual actions and limits; main/social follow-on held. |
| Mr Lead Manager / Mr Fix-it delegate | Sky completion atoms and local source-linked lesson paths | src/components/lifestyle-elite/SkyFocus.jsx, sky/ except skyLessons.js, dedicated Sky regression tests; claude-state/creative/finish-sky-* | 2026-10-06 | RELEASED. Source98b1604; live index-Ct5Eb3OV.js. 357 checks, native360/390/430 and independent craft reproof. Finish-verification.md records actual actions and limits; main/social follow-on held. |
| Ms Deep Search / Mr Fix-it | Prior research reconciliation and exact existing Planner V2 / Journal returns | claude-state/creative/finish-research-*, src/components/planner-v2/, src/pages/{Journal,JournalHub}.jsx, src/components/journal/EntryReader.jsx, src/lib/lifestyleReturns.js, dedicated return regression tests | 2026-10-06 | RELEASED. Source98b1604; live index-Ct5Eb3OV.js. 357 checks, native360/390/430 and independent craft reproof. Finish-verification.md records actual actions and limits; main/social follow-on held. |
| Creative Director / Ms Atelier + Mr Fix-it | Prior composition reconciliation, body craft and complete Books source/shelf/club | claude-state/creative/finish-craft-*, src/components/lifestyle-elite/BooksStoryFocus.jsx, src/components/community/{bookshelf,bookClubConfig,LibraryTogether}*, src/pages/Community.jsx (BookClubView, BooksCircleSharedRead and LibraryView club pick/checkpoint/link adapters only), dedicated Books tests | 2026-10-06 | RELEASED. Source98b1604; live index-Ct5Eb3OV.js. 357 checks, native360/390/430 and independent craft reproof. Finish-verification.md records actual actions and limits; main/social follow-on held. |
| Codex + Mr Lead Manager + Ms Deep Search + Creative Director / Ms Atelier | Approved Lifestyle headers; minute-detail section-body planning and Ideas workshop | claude-state/creative/section-detail-*, claude-state/{STATUS,BRAND_IDENTITY}.md, claude-state/creative/CONTEXT.md, src/components/founders/brandDocs/brand-bible.html, public/selected-lifestyle/index.html, public/lifestyle-workshop/, src/pages/FoundersOS.jsx | 2026-10-06 | RELEASED. Six-room detail workshop published; 48 source-audit atoms, 42 grouped work packages, primary research and craft pass. Root native three-width taps/pixels plus independent screenshot audit; repairs re-proved. Headers accepted; body implementation/main promotion still held. No backend/schema changes. |
| Codex + Ms Verify | Reader control tap-layer repair found in selected Books live verification | src/components/lifestyle/DailyStoryReader.jsx, src/components/lifestyle/__tests__/DailyStoryReader.test.jsx | 2026-10-06 | RELEASED. Source49bf504 + repairs1e10ed8/2e40e74; live index-tpCgLP8I.js. 230 tests, native360/390/430 and independent craft audit. See creative/selected-lifestyle-verification.md for actual taps and honest write/social/iPhone limits. Main aesthetic promotion held. |
| Codex + Creative Director | Selected Petal × Star Press Sky completion, then remaining Lifestyle sections | src/components/lifestyle-elite/, src/pages/{SkyWorldsDemo,FoundersOS}.jsx, src/pages.config.js, claude-state/creative/, claude-state/{STATUS,BRAND_IDENTITY}.md, Bible HTML mirror, public/sky-worlds/, public/images/sky-worlds/ | 2026-10-06 | RELEASED. Source49bf504 + repairs1e10ed8/2e40e74; live index-tpCgLP8I.js. 230 tests, native360/390/430 and independent craft audit. See creative/selected-lifestyle-verification.md for actual taps and honest write/social/iPhone limits. Main aesthetic promotion held. |
| Codex | Selected Lifestyle shared card presentation and review assets | src/components/brand/expandCards.jsx, public/images/selected-lifestyle/, public/selected-lifestyle/ | 2026-10-06 | RELEASED. Source49bf504 + repairs1e10ed8/2e40e74; live index-tpCgLP8I.js. 230 tests, native360/390/430 and independent craft audit. See creative/selected-lifestyle-verification.md for actual taps and honest write/social/iPhone limits. Main aesthetic promotion held. |
| Codex + Mr Fix-it | Existing Saved and Planner Lifestyle return paths | src/pages/Saved.jsx, src/components/planner-elite/PlannerEliteShell.jsx | 2026-10-06 | RELEASED. Source49bf504 + repairs1e10ed8/2e40e74; live index-tpCgLP8I.js. 230 tests, native360/390/430 and independent craft audit. See creative/selected-lifestyle-verification.md for actual taps and honest write/social/iPhone limits. Main aesthetic promotion held. |
| Lead returns (Codex delegate) | Saved record date and control truth | src/components/saved/SavedItemCard.jsx | 2026-10-06 | RELEASED. Source49bf504 + repairs1e10ed8/2e40e74; live index-tpCgLP8I.js. 230 tests, native360/390/430 and independent craft audit. See creative/selected-lifestyle-verification.md for actual taps and honest write/social/iPhone limits. Main aesthetic promotion held. |
| Codex | Existing Sky preference schema repair | base44/entities/UserPreferences.jsonc | 2026-10-06 | RELEASED. Source49bf504 + repairs1e10ed8/2e40e74; live index-tpCgLP8I.js. 230 tests, native360/390/430 and independent craft audit. See creative/selected-lifestyle-verification.md for actual taps and honest write/social/iPhone limits. Main aesthetic promotion held. |
| Codex + Creative Director | Continuous reading-room world and living Sky motion after Halli's whole-page correction | src/components/lifestyle-elite/, src/pages/{LivingReadingRoomDemo,FoundersOS}.jsx, src/pages.config.js, claude-state/creative/, claude-state/{STATUS,BRAND_IDENTITY}.md, brand Bible mirror, public/images/reading-room/, public/reading-room/ | 2026-10-06 | RELEASED. Source5208087 + review7abe60c, live index-JXnF2W0I.js. Whole Books room and finite Living Sky breeze; actual native360/390/430, direct reader/position refresh and independent audits. See reading-room-verification.md. Bible10.5.14 updated. Ideas board/brief verified; main aesthetic approval held. |
| Codex + Ms Verify | Reader chapter targeting repair discovered by actual Chapter 2 tap | src/components/lifestyle/DailyStoryReader.jsx, src/components/lifestyle/__tests__/DailyStoryReader.test.jsx | 2026-10-06 | RELEASED. Source196737d; numeric/object initialisation, resume/callback/save races and actual row identity repaired. Reader12 checks/full107, actual Chapter2 correct and immediate Books refresh at5208087. Rare simultaneous animated-flip/marks-jump race remains a separate atom. |
| Codex + Creative Director | Art-directed Lifestyle revision after rejected five demos | .claude/agents/creative-director.md, TEAM.md, claude-state/creative/, claude-state/{STATUS,BRAND_IDENTITY}.md, brand Bible mirror, src/components/lifestyle-elite/, src/pages/{LivingAtelierDemo,FoundersOS}.jsx, src/pages.config.js, public/images/living-atelier/, public/living-atelier/ | 2026-10-06 | RELEASED. Source04b3a19, live index-DxitWe4z.js. Dedicated creative memory, one Sky study, four further concepts;99 checks, native360/390/430, actual Ideas/exact-save return and independent source/craft audits. See creative/verification.md. Halli aesthetics/main promotion held. |
| Codex team | Five complete Living Lifestyle demos + daily Sky lesson | src/components/lifestyle-elite/ (root implementation), src/pages/{LivingLifestyleDemo,FoundersOS,WatchListen,Saved}.jsx (directory/saved query targeting only), src/pages.config.js, claude-state/connected-life/, claude-state/{BRAND_IDENTITY,STATUS}.md, brand Bible HTML mirror | 2026-10-05 | RELEASED. Source b12f997, live index-EpEVjvCd.js; 98 full / 20 targeted checks, 90 header views, actual save/journal/return and Jess count proved. See five-demos-verification.md. Demo-only, main held; wider connections remain staged. |
| Codex team | Reality-first connectivity audit and per-atom brainstorm workflow | claude-state/connected-life/, claude-state/{STATUS,BRAND_IDENTITY}.md, public/connected-life/, FoundersOS/Bible mirror; read-only app screens/backend | 2026-10-05 | COMPLETE planning pass: b87804f pushed/deployed as index-BokqKHj8.js; live Ideas entry/workshops/journeys/mobile checked. Claim released. Community visuals pending Halli's18+ check; recipient/persistence/iPhone proof, five working demos and daily deck remain build work. |
| Codex team | Approved Living base: five directions, daily lessons and connected-life plan | claude-state/connected-life/, claude-state/{STATUS,BRAND_IDENTITY}.md, src/components/founders/brandDocs/brand-bible.html, public/connected-life/, src/pages/FoundersOS.jsx; demo scope recorded in plan before source changes | 2026-10-05 | RELEASED planning: ff63b44 / liveBvrP168h; plan and Ideas board verified. Five demos, lessons and social implementation remain next; main held. |
| Codex team | Sky garden as page composition after stamped-image rejection | `src/components/lifestyle-elite/`, `src/pages/FloralDreamDemo*`, `src/pages/FoundersOS.jsx`, `public/images/flora-dream/`, `output/imagegen/flora-dream/`, `claude-state/flora-dream/`, `claude-state/{STATUS,BRAND_IDENTITY}.md`, brand Bible HTML mirror | 2026-10-02 | RELEASED: source516f816 / live5rTngpIJ; phone/tap and independent audit recorded in living-page-verification.md. P2 art risks and Halli review open; main held. |
| Codex team | Each whole header as a little garden | `src/components/lifestyle-elite/{GardenHeader*,LifestyleEliteShell.jsx}`, `src/pages/{FloralDreamDemo*,FoundersOS.jsx}`, `public/images/flora-dream/`, `output/imagegen/flora-dream/`, `claude-state/flora-dream/`, `claude-state/{BRAND_IDENTITY,STATUS}.md`, `src/components/founders/brandDocs/brand-bible.html` | 2026-10-02 | RELEASED: source3afd475 deployed index-s30mKDzI.js; five gardens in Ideas, final360/390/430 proofs and independent audit completed. Main held; Halli aesthetic review pending. |
| Codex team | Full Lifestyle composition comparison after Halli rejection | `src/pages/FloralDreamDemo*`, `src/components/lifestyle-elite/{LifestyleEliteShell,FirstFold*,AlmanacHeader}*`, `public/images/flora-dream/`, `output/imagegen/flora-dream/`, `src/pages/FoundersOS.jsx`, `claude-state/flora-dream/`, `claude-state/{BRAND_IDENTITY,STATUS}.md`, `src/components/founders/brandDocs/brand-bible.html` | 2026-10-02 | Released: source9bcb55c, index-CXIn92F5.js, 70/70 tests and phone360/390/430. Two proposals in Ideas; aesthetic approval and main promotion held. composition-verification.md records proof and design tradeoffs. |
| Codex team | Integrated botanical header correction | `src/pages/FloralDreamDemo*`, `src/components/lifestyle-elite/{LifestyleEliteShell,BotanicalSceneHeader}*`, `src/components/lifestyle-elite/sky/CelestialSky.jsx`, `src/pages/FoundersOS.jsx`, `claude-state/flora-dream/`, `claude-state/{BRAND_IDENTITY,STATUS}.md`, `src/components/founders/brandDocs/brand-bible.html` | 2026-09-30 | Released: 8997028 + b3e59d3 + 07e6234; live index-Lv48dQNS.js. Full62/62, final3/3, phone taps and independent final pixel reviews. Main held; integration-verification.md. |
| Codex team | Floral ecosystem dream study | `src/pages/FloralDreamDemo*`, `src/pages.config.js`, `src/components/brand/dream/`, `public/images/flora-dream/`, `claude-state/flora-dream/`, `src/pages/FoundersOS.jsx`, `claude-state/{BRAND_IDENTITY,STATUS}.md`, `src/components/founders/brandDocs/brand-bible.html` | 2026-09-29 | Released: b1e2fda + 938d9ca; live index-DNclx9An.js. Full58/58, actual360/390/430 taps and final independent pixels. Ideas review; main held. See flora-dream/verification.md. |
| Codex team | Botanical lunar clock, compact diary and meaning dots | `src/components/lifestyle-elite/sky/`, `src/components/lifestyle-elite/SkyFocus.jsx`, `src/pages/SkyConceptDemo*`, `src/pages/FoundersOS.jsx`, `public/sky-review/`, `public/images/sky/`, `claude-state/sky-review-2026-09-28/`, `claude-state/{BRAND_IDENTITY,STATUS}.md`, `src/components/founders/brandDocs/brand-bible.html` | 2026-09-29 | Released: efc9c4b; retained in index-DNclx9An.js. Full51/51 and final15/15; actual360/390/430 taps and independent pixels. Main held. |
| Codex team | Celestial Sky craft and human app-wide voice | `src/pages/SkyConceptDemo*`, `src/components/lifestyle-elite/{LifestyleEliteShell,SkyFocus}.jsx`, `src/components/lifestyle-elite/sky/`, `src/pages/FoundersOS.jsx`, `claude-state/sky-review-2026-09-28/`, `claude-state/{BRAND_IDENTITY,STATUS}.md`, `CLAUDE.md`, `src/components/founders/brandDocs/brand-bible.html`, `public/sky-review/` | 2026-09-29 | Released: source6123b3a; live index-DsQRGZUI.js. Final12/12 targeted tests and360/390/430 pixels verified. Main held; see STATUS and celestial-verification.md. |
| Codex team | Restore continuous Lifestyle Sky after rejected chapter demo | `src/pages/SkyConceptDemo*`, `src/components/lifestyle-elite/LifestyleEliteShell.jsx`, `src/components/lifestyle-elite/SkyFocus.jsx`, `src/pages/FoundersOS.jsx`, `CLAUDE.md`, `claude-state/BRAND_IDENTITY.md`, `claude-state/STATUS.md`, `public/sky-review/index.html` | 2026-09-28 | Released: `b774950` + `7d3cb84`, live `index-C4uxcHfw.js`, 41 tests and live phone taps. Current connected Sky restored within Lifestyle; old wiring/full historical parity remain open. Ideas only, no main promotion. |
| Codex team | Sky visual concept + founders boards | `src/pages/SkyConceptDemo.jsx`, `src/pages/FoundersOS.jsx`, `src/pages.config.js`, `claude-state/sky-review-2026-09-28/`, `claude-state/BRAND_IDENTITY.md`, `claude-state/STATUS.md`, `CLAUDE.md` | 2026-09-28 | Released: `fc12e00` + `ffc5237`; live `index-Dkg-Olf7.js`. Demo-first Sky board, 42 tests and 360/390/430 live taps/screenshots. Main promotion held; full Sky unfinished. |
| Codex team | Sky audit, focused actions and Ideas review workflow | `AGENTS.md`, `CLAUDE.md`, `claude-state/ONBOARDING_READ_FIRST.md`, `claude-state/STATUS.md`, `claude-state/BRAND_IDENTITY.md`, `src/components/lifestyle-elite/`, `src/pages/FoundersOS.jsx`, `public/sky-review/`, `claude-state/sky-review-2026-09-28/`, `C:/Users/Halli/femwell-handoff/sky-review-2026-09-28.html` | 2026-09-28 | Released 2026-09-28: scoped preview actions/research/audit delivered in Ideas; source a533e24, live index-CKvtIwXQ.js. Full Sky repairs remain queued; no main promotion without Halli. |
| Codex | Authentication verification record | `claude-state/STATUS.md` | 2026-09-28 | Record complete; claim released. Signed-in logout reaches login but account reappeared when Profile reopened. Cause unresolved; see STATUS top. No source changes. |
| Claude | Books (Lifestyle) | `BooksStoryFocus.jsx`, `booksMonthly.js`, `LifestyleEliteShell.jsx` | 2026-09-25 | **Landed** `21c0a173` — released |
| — | *(free)* | | | |

**Held / not started:** the Books **notification nudge** (edits `sendNotificationReminders`, awaiting
Halli) · the **Read** deep pass (next) · the **live clean flip** (one line, awaiting Halli).

---

## 7. Transcripts (backup only)

`claude-state/agent-collab/transcripts/` holds a **manifest**, not the raw logs — see
`transcripts/MANIFEST.md` for why and how to pull one on demand.

**The structured docs above are what to read FIRST.** They are the distilled, current truth. A
transcript is a raw, un-distilled archive of one session — useful only to answer "why did we decide
X?" when the docs don't say. **If a transcript and STATUS.md/the bible disagree, the docs win** (the
transcript is a point-in-time record and may contain superseded reasoning).
