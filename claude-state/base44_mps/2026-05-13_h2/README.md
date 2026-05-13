# H2 — Horoscope v2 build prompts (2026-05-13)

Paste each prompt into base44 builder one at a time. Wait for build to finish,
verify on live, push to git, then move on.

Authoritative refs:
- Spec: `mnt/femwell/horoscope_v2_spec.md`
- Decisions (overrides spec/demo on conflicts): `mnt/femwell/H2_DECISIONS.md`
- v2.1 demo: `mnt/femwell/femwell_horoscope_v2_demo.html`
- Atelier visual spec: `mnt/femwell/atelier_horoscope_v2_spec.md`
- Research v1 + v2 + FINAL: `mnt/femwell/research_horoscope_v2*.md`

## Sequence

| # | File | What | Why | Status |
|---|---|---|---|---|
| 1 | `H2a-1.md` | Split god-component, no behaviour change | Refactor prerequisite | **SENT 2026-05-13 02:27 UTC** |
| 2 | `H2a-2.md` | Purge emoji + UK locale + race fix + askStars persistence | P0/P1 bug pass | staged |
| 3 | `H2b-1.md` | Twilight hero + Triad + Today's Weather + Cycle×Moon dial + A5 Spotify link | Visual lift, first 4 sections | staged |
| 4 | `H2b-2.md` | Goddess Bench + asteroid signs schema | Category-original wow feature | staged |
| 5 | `H2c-1.md` | Sky Diary + Red/White Moon (incl. A4 Void-of-Course pip) | Cycle×Sky data layer | staged |
| 6 | `H2c-2.md` | Annual Profections (incl. A1 Saturn Return Letter) + Compatibility (Time label, D1) + Ask The Sky + Quiet Mode (incl. A3 Soft-Sky) + Science footer (incl. A2 LSA chip) + Privacy line | Programmed-classical layer + Quiet Mode wiring | staged |
| 7 | `H2d-1.md` | Atelier Reading card + AtelierLetters entity + monthly draft cron | Paid surfaces #1 | staged |
| 8 | `H2d-2.md` | Paid Shelf (£19/£29/£55) + OneShotPurchases + simulated Stripe | Paid surfaces #2 | staged |

## Brand-voice and decision rules carried into every prompt

These MUST be obeyed in all H2 builds — restate in every paste:
- UK English. £. en-GB dates ("14 Jun 1999" not "Jun 14, 1999").
- **No emoji codepoints anywhere** — Lucide icons + Fraunces + Inter only.
- Plum Night palette (cream stays default day-mode).
- "Ask The Sky" (not "Ask The Stars"). "Tell us when" (not "Unlock my chart"). "Astra" (the named astrologer persona).
- Atelier attribution: "Backed by Astra Cole, MA, FAS" (NOT "Backed by Skyfield" — see D2).
- Compatibility 4th dim UI label: **Time** (DB field stays `grow_score` — see D1).
- Black Moon Lilith for the Goddess Bench (lunar apogee, not asteroid #1181 — see D3).
- Annual Profections: math-correct house computation (demo's example copy was illustrative — see D4).
