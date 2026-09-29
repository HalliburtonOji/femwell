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

**Protocol:** add a row before you start; commit the claim; remove it when the work lands (and record
the landing in STATUS.md). If a surface is claimed, don't touch its files — propose instead.

| Agent | Surface | Files | Started | State |
|---|---|---|---|---|
| Codex team | Celestial Sky craft and human app-wide voice | `src/pages/SkyConceptDemo*`, `src/components/lifestyle-elite/{LifestyleEliteShell,SkyFocus}.jsx`, `src/components/lifestyle-elite/sky/`, `src/pages/FoundersOS.jsx`, `claude-state/sky-review-2026-09-28/`, `claude-state/{BRAND_IDENTITY,STATUS}.md`, `CLAUDE.md`, `src/components/founders/brandDocs/brand-bible.html`, `public/sky-review/` | 2026-09-29 | In flight: research-led celestial preview and voice canon; full inline capabilities, no main promotion. |
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
