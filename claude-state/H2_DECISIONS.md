# Horoscope v2 — Build decisions (locked 2026-05-13)

These resolutions take precedence over the spec, the demo, and the research where they
conflict. Operator should treat this file as authoritative for H2 construction.

## Contradictions resolved

### D1 — Compatibility 4th dimension is **Time**, not Grow
- Demo (femwell_horoscope_v2_demo.html L1046) says **Time**. User said no cuts.
- Atelier spec and entity field `grow_score` stay internally — but every UI label is **Time**.
- Render at `sections/Compatibility.jsx`: `label="Time"`, prop reads `grow_score`. Add `// internal: stored as grow_score — see H2_DECISIONS.md D1` comment.
- No DB migration. Rename is a UI-only label.

### D2 — Atelier card attribution is **"Backed by Astra Cole, MA, FAS"**, not "Backed by Skyfield"
- We are not shipping real Swiss Ephemeris in H2 (AGPL, Deno-runtime).
- The moat we're cashing in on is the named astrologer (research v2, §"named astrologer authorship pattern").
- Demo's "Backed by Skyfield" chip → swap to "Backed by Astra Cole, MA, FAS".
- Real ephemeris is H3 territory.

### D3 — Lilith is **Black Moon Lilith** (lunar apogee)
- Modern feminist usage = Black Moon Lilith, not the asteroid #1181.
- Compute as the moon's apogee on the natal date.
- Copy table in `src/lib/astrology/asteroids.js` reads from Black Moon archetype canon (Demetra George + AstroStyle as cited).

### D4 — Annual Profections ships **mathematically correct**
- Demo's example for age 27 (5th house, Venus) was illustrative copy, not a real chart.
- Correct math: `(age % 12) + 1` for age 27 = 4th house, ruler of natal 4th sign.
- Ship the correct math; demo's example copy will shift when a real chart computes — operator should expect that.

### D5 — `audit_horoscope_v2.md` line numbers are off by 1
- No action. Mr Fix-it cited 116-124; actual file is 115-125. Operator: trust the file, not the audit's line citations.

### D6 — Atelier Reading is AI-final for now (added 2026-05-13)
- User pivoted: AI drafts the monthly Atelier letter, no human-in-the-loop required. We can revisit later.
- **Implication for the H2d-1 build:** the current code writes `draft: true` and surfaces an "Awaiting Astra's sign-off" banner until an operator flips it. Under D6, the banner should never render — the cron should write `draft: false, published_at: now()` directly. The operator panel stays available as a curation tool for the future, but is not on the critical path.
- **Follow-up MP needed** (Phase A item): edit `base44/functions/draftAtelierLetter/entry.ts` to ship letters published-by-default, and edit `src/components/horoscope/sections/AtelierReading.jsx` to drop the "Awaiting sign-off" banner.
- **Legal exposure (R3):** the "Astra Cole, MA, FAS" credentials still need to hold up at DD. If we go to sale and the persona isn't backed by a real contracted astrologer, swap the attribution to "Backed by FemWell's editorial astrology team" or similar before the DD pack lands. Re-ask this question 4-6 weeks before the sale window opens.

---

## Additive items folded in from `research_horoscope_v2_FINAL.md`

These are **additions on top of v2.1 demo** — they do not replace anything.

### A1 — Saturn Return Letter (free birthday unlock, ages 27-30)
- **Where:** `sections/AnnualProfections.jsx` — when `age in [27, 28, 29, 30]`, prepend a "Your Saturn Return" pane above the standard profections card.
- **Copy:** signed by Astra. Frames the Saturn return as a structural realignment (not a doom-myth). UK-tone: "This is the moon putting your house back on its foundations, not knocking it down."
- **Data:** computed client-side from `userProfile.birthday` only. No new entity needed.
- **Why folded:** zero build cost, large emotional/retention lift; competitor Co-Star paywalled their version 2026-04-01 so this is now a clean differentiator.

### A2 — Frank Clifford / London School of Astrology positioning chip
- **Where:** `sections/ScienceFooter.jsx` — under the Helfrich-Förster + Cajochen citations, add one line: *"Astra's craft trained in the London School of Astrology tradition (Clifford, est. 1948 lineage)."*
- **Why folded:** UK-credibility wedge; The Mountain Astrologer relaunched there June 2025; gives the £1M-sale story a named institutional anchor without any contracted partnership obligation.
- **Caveat:** copy must be factually accurate — "trained in the tradition" not "endorsed by". Cole's bio at H2d should reference TMA only if it's true.

### A3 — Quiet Mode "Soft-Sky" sub-tier
- **Where:** `sections/QuietModeToggle.jsx` — Quiet Mode is one toggle. Soft-Sky is a second toggle below it: "Hide retrogrades from the daily reading."
- **Wires:** writes to `UserPreferences.horoscope_soft_sky` (boolean, default false). Read by `generateHoroscopeReading/entry.ts` — when true, transit prompt instruction adds "Do not mention retrogrades or storm windows."
- **Why folded:** research v2 FINAL §1 found this is the #1 most-requested setting on r/astrology; Pattern's documented exit-survey reason for cancellation. Two-line build cost.

### A4 — Void-of-Course Moon decision pip
- **Where:** `sections/SkyDiary.jsx` "Right Now" card — when moon is void-of-course, append a small dotted pip with text "Void-of-Course · 14:30-18:12 BST · best not to lock plans".
- **Computes:** client-side from moon position + next aspect to a major planet.
- **Why folded:** category-original; no competitor ships this clearly; UK time-zone aware framing.

### A5 — Spotify Cosmic Playlist deep link (no licensing)
- **Where:** `sections/TodaysWeather.jsx` — under the Astra-signed weather line, add a single text link "Astra's sound for today →" that opens a Spotify URL (curated playlist seeded by moon sign).
- **Implementation:** static map of `moon_sign → spotify_playlist_url` (Astra-curated, public Spotify URIs).
- **Why folded:** zero licensing risk (Spotify URIs are public); huge engagement lift per research v2 FINAL §8.

### Deferred to H3 (not folded — recorded so we don't lose them)
- Hildegard Viriditas perimenopause card (heavy copy; needs medical review).
- £45 Birth-Time Rectification add-on (operationally heavy — wraps Cosmic Birthtime API).
- Chronotype micro-survey (better as a separate Lifestyle sleep-tab feature).
- Cycle-phase × Lilith tag on the Goddess Bench (subtle, requires both natal Lilith + live cycle math; H3).

---

## Build sequence (locked)

H2a → H2b → H2c → H2d. **Folded items A1-A5 ship inside the natural H2x they belong to:**
- A1, A2 → H2c (Annual Profections + Science Footer)
- A3 → H2c (Quiet Mode)
- A4 → H2c (Sky Diary)
- A5 → H2b (Today's Weather)

Operator: run H2a-1 and H2a-2 first. Verify, publish, walk live, then proceed to H2b.

---

## Brand voice notes (re-affirmed)

- UK English. £. en-GB dates ("14 Jun 1999").
- No emoji codepoints anywhere. Lucide icons + Fraunces + Inter only.
- Plum Night palette (cream theme stays as the default day-mode; Plum Night is the night/immersive theme).
- "Ask The Sky" (not "Ask The Stars"). "Tell us when" (not "Unlock my chart"). "Astra" (not "the stars").
- Calm-but-substantive. Closer to a New Yorker science feature than to a woo app.
