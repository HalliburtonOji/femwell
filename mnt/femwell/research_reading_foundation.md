# Research — Shared Reading Foundation — 16/07/2026

## Question
Six reading surfaces (article, fiction, book, daily story, horoscope, in-card expand) need ONE craft foundation so measure/leading/size can't drift. Three gaps: enforcing measure in CSS; article-vs-book reader; tokens that prevent drift.

**Prior art — NOT re-derived.** `mnt/femwell/research_reader_and_cards.md` (16/07/2026) owns 45–75 CPL + the 390px inversion, pagination-vs-scroll (CHI '25 null), progress-as-permission, indent-XOR-space (Butterick), resume, controls, positive polarity. Cited by item number below.

All sources fetched 16/07/2026.

## 1. Enforcing measure

1. **`1ch` = the advance measure of the `0` glyph (U+0030)**; where undeterminable, "assumed to be `0.5em` wide by `1em` tall" (source: https://developer.mozilla.org/en-US/docs/Web/CSS/length). Not an average character.
2. **`ch` runs 20–30% WIDE.** Meyer: "in proportional typefaces, `1ch` is *usually* wider than the average character width, usually by around 20-30%" (to 50%); "if you want an 80-character column width… aim for about `60ch`" (source: https://meyerweb.com/eric/thoughts/2018/06/28/what-is-the-css-ch-unit/). **`max-width: 66ch` therefore yields ~80–85 real characters — at/over the WCAG 80 cap, not 66.**
3. **Rutter: don't use `ch` for measure.** "A width of `66ch` will probably not give you a line containing 66 characters" — Bringhurst's 66 *characters* misread as a `ch` count. Recommends `max-inline-size: 30rem`: tied to text size, independent of font design (source: https://clagnut.com/blog/2432).
4. **USWDS tokenises measure in `ex`:** "Measure is output in `ex` units" — `measure-1` 44ex, **`measure-2` 60ex**, `-3` 64ex, `-4` 68ex, `-5` 72ex, `-6` 88ex (source: https://designsystem.digital.gov/design-tokens/typesetting/measure/). Readable range "45 (measure 1) to 90 characters (measure 5)"; **"a good target for long texts is 66 characters"** = measure-2 (source: https://designsystem.digital.gov/components/typography/). **Correction factor: 66 chars ≈ 60ex.**
5. **The nesting trap: `ch`/`ex` resolve against the CURRENT element's font-size.** Comeau: "if you had a `<figcaption>` with smaller text and gave it `width: 65ch`, it would wind up being a different size" (source: https://www.joshwcomeau.com/css/full-bleed/). Our double-framing bug is this error one level up.
6. **Robust pattern = `min()` + one owner.** `grid-template-columns: 1fr min(65ch, 100%) 1fr` — fixed on wide screens, shrinks on mobile, full-bleed children escape "without hacky negative margins" (source: as above). `min(X, 100%)` self-clamps; `max-width` under a padded ancestor does not.

### Mobile measure — the honest answer
**45 CPL is unreachable at 390px with readable type; no source claims otherwise.** Arithmetic (**derived, not cited**): a serif averages ≈0.5em/char → 18px ≈ 9px/char; (390 − 2×24) ÷ 9 ≈ **38 CPL**, matching the ~34–40 CPL measured in prior item 10. Reaching 45 needs ~16px type *and* ~16px margins (358 ÷ 8 ≈ 44.8) — breaching the 18px immersive default (item 13) and looking cramped.

**Don't shrink type to buy characters.** (a) The <45 danger is desktop-derived; Baymard notes portrait mobile rarely *exceeds* the cap (item 10). (b) NN/g: "the positive-polarity advantage increased linearly as the font size was decreased" (item 15) — cream pays most exactly where mobile is weakest. **At 390px max-width never binds: padding IS measure.** The lever is structural — one padding owner.

## 2. Article vs book reader

7. **Article progress bars: no evidence found — DROPPED.** Adjacent evidence warns: across **32 experiments**, "progress bars negatively impacted completion when people felt the survey required high early investment"; they "backfire when expectations for early progress aren't met" (source: https://irrationallabs.com/blog/knowledge-cuts-both-ways-when-progress-bars-backfire/). A long article is high early investment. **No default top progress bar on articles.**
8. **Read-time has NO strong evidence, and one finding cuts against it.** Medium: ~275 WPM plus image seconds; purpose modest — engineers were "sick of having to scroll all the way down the page to see how long a story was", giving "a ballpark figure so you can decide whether you have time to read one more story before the bus comes" (source: https://medium.com/blog/read-time-and-you-bc2048ab620c). The **"+40% engagement" figure is vendor marketing** — Simpleview via MarTech, no link, no methodology, no n (source: https://martech.org/estimated-reading-times-increase-engagement/) — **DROPPED**. Against it: Irrational Labs — stating a task took **10 minutes made FEWER people complete it**; "people became too focused on the time cost vs the upside benefit" (source: as above).
9. **So read-time is permission when SMALL, deterrent when LARGE** — qualifies A2/A11 in the prior file. Show "4 min read"; at ≥10 min show section units ("6 min to the next break"), never one intimidating total.
10. **Article resume: precedent yes, evidence no.** Pocket syncs reading position across devices; Instapaper ships "Return to Position" plus a dots indicator showing progress and comparative length (source: https://zapier.com/blog/instapaper-vs-pocket/). Ship silent resume (item 7, prior file); claim no measured benefit.
11. **Article = spaced/no indent; fiction = indent/no space** — sourced to Butterick, prior item 12. The one typographic switch separating our readers.

## 3. Tokens + drift

12. **Tokenise MEASURE, not just size/leading — USWDS is the precedent** (4). Most systems token size/weight/leading and leave measure to whoever writes the page. That is how six surfaces drift.
13. **One long-form component is documented precedent.** Tailwind Typography: "beautiful typographic defaults for HTML you don't control, like HTML rendered from Markdown, or pulled from a CMS" — one `prose` class carrying max-width, rhythm, colour; "each size modifier comes with a baked in `max-width`" (source: https://github.com/tailwindlabs/tailwindcss-typography). Its default is `maxWidth: '65ch'` (verified in source: https://raw.githubusercontent.com/tailwindlabs/tailwindcss-typography/master/src/styles.js, line 1414) — i.e. **even the reference implementation ships the ~20–30% overshoot at item 2.**
14. **Ship escape hatches WITH it or teams fork it.** Tailwind's two: `not-prose` to "sandbox" embedded markup, `max-w-none` to drop the cap (source: as above). A component with no legal exit gets copy-pasted and mutated — that IS drift.
15. **Named failure mode: "intent drift".** Without review, "one-off" text styles appear, roles overlap, and unclear intent makes "every usage… a local judgement call" accumulating into inconsistency (source: https://designsystems.surf/articles/typography-system-101-a-step-by-step-guide).

## Comparative table
| System | Reach | Last update | Measure pattern | Notable |
|---|---|---|---|---|
| Tailwind Typography | 6.4k★ | v0.5.20, 08/06/2026 | `max-width: 65ch`, one `prose` class | ships `not-prose` + `max-w-none` escapes |
| USWDS | US federal standard | live 16/07/2026 | measure **token**, `ex`, 44–88ex | only system tokenising measure |
| Comeau pattern | article | 16/07/2026 | `1fr min(65ch,100%) 1fr` | full-bleed without negative margins |

## Evidence strength
| Claim | Evidence | Strength |
|---|---|---|
| `1ch` = "0" advance, ~20–30% wide | MDN + Meyer | **Strong** |
| `66ch` ≈ 66 chars | Meyer/Rutter refute | **False** |
| Measure belongs in tokens | USWDS shipped | Strong (precedent) |
| Article progress bars help | None found | **Dropped** |
| Time-cost disclosure backfires | 32 experiments + IL test | Moderate (surveys ≠ articles) |
| Read-time lifts engagement +40% | Vendor, no method | **Dropped** |
| 45 CPL reachable at 390px | Arithmetic + prior measurement | **False — accept 38–42** |

## What `<ReadingColumn>` must enforce
The ONLY thing allowed to set measure, padding or leading on any of the six surfaces.
1. **`width: min(var(--fw-measure), 100%)`; `margin-inline: auto`** — self-clamping (6). Never `max-width` + ancestor padding.
2. **`--fw-measure` as a token, in `ex`, calibrated to Fraunces — not `65ch`.** Start at USWDS measure-2 = **60ex** ≈ 66 chars (4); verify by counting real characters, since `ch`/`ex` are font-specific (2, 5).
3. **Sole padding owner** — no parent card/sheet/safe-area adds side padding. The double-framing fix; at 390px padding IS measure.
4. **Type floor 18px immersive / 16px absolute** — never shrink to buy CPL; accept 38–42 CPL at 390px.
5. **Leading ≥1.5** (prior item 11).
6. **One `variant` prop, switching only indent-XOR-space:** `article|horoscope|card` → spaced; `fiction|book|dailyStory` → indent (11).
7. **Escape hatches day one:** `bleed` + `measure="none"` (14).
8. **No article progress bar; read-time only where the number is small** (7–9).

---
Self-audit: every claim carries a URL or an explicit cite to `research_reader_and_cards.md`; **three claims dropped** (article progress bars; +40% read-time; Google Fonts measure guidance — JS-rendered, unfetchable, so not cited); the 390px arithmetic **flagged derived, not sourced**; all sources verified 16/07/2026.
