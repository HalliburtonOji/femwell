# Research — Reader + Content Cards — 16/07/2026

## Question
FemWell ships content in expandable cards opening into readers (book, daily story). v1 shipped; this pass sources what to ADD. Three areas: reader UX (pagination/scroll, progress, resume, controls); reader typography (measure, leading, indents, cream paper, serif); card preview copy.

**Prior art — NOT re-derived.** `claude-state/research_ereader_ux.md` (12/05/2026) is canon for reader *chrome + architecture*: page-IS-screen, hide-chrome-on-tap, bottom-sheet settings, live-preview slider, foliate-js `#anchor` resize contract, measurement-based pagination, exact Apple/Kindle sepia hexes. This file covers only what that one doesn't answer.

## Sources consulted (all fetched 16/07/2026)
- Joshi, Casiez & Vogel, **CHI EA '25**, "Is Pagination Better than Scrolling when Reading on a Phone?" — full PDF read.
- Ahmad, Hellgren & Said, **UMAP Adjunct '25**, "Tell Me the Good Stuff" — full PDF read.
- *Scientific Reports* 2025, "When curiosity gaps backfire" (PMC mirror).
- NN/g — Dark Mode; Better Link Labels; Information Scent; Glanceable Fonts.
- Baymard (line length); Butterick (indents/paragraph space); Good e-Reader + MakeUseOf (Kindle progress); a11y-blog.dev (sepia — **flagged anecdotal**).

## 1. Reader UX

1. **Pagination does NOT beat scrolling for comprehension on a phone — the received wisdom is refuted.** 2025 replication, n=100 (51 scroll / 49 page), ten ~1,500-word stories on participants' own phones: **no significant difference** in comprehension (m=14.8 sd=2.6 vs m=14.7 sd=2.6), duration (7.3 vs 8.3 min), or any workload metric incl. Mental Demand (3.6 vs 3.9) (source: https://nikhitajoshi.ca/papers/scroll-vs-page.pdf). Authors: smartphone ubiquity "has made it easier for people to create mental representations of the text."
2. **So paginate for FEEL, not for a comprehension claim.** Same paper's open-ended data: pagination gave "a sense of progression" (P34), made "the process less intimidating" (P12), "the story more digestible" (P43), helped "focus even more" (P32). That is FemWell's warm/calm register — a legitimate reason, honestly stated.
3. **Ship both.** Paper's own recommendation: "giving users the option to switch between pagination and scrolling modes… may further improve user experience" (source: as above).
4. **Fiction-vs-article split is UNRESOLVED — don't claim it.** Limitations section: they used 8th-grade short stories; "prior work primarily focused on non-fiction and scientific documents"; "it is possible that scrolling and pagination may lead to more pronounced effects for different reading types" (skimming, goalless browsing). Honest read: paginate Book + Daily Story (deep, goal-led); scroll essays (often skimmed).
5. **Progress: % is the floor, "time left" is the delight — and must be dismissible.** Kindle estimates time-left from *the reader's own page-turn speed* (source: https://goodereader.com/blog/kindle/amazon-kindle-reading-progress-explained). Reception is mixed — loved, but accuracy is the standing complaint; Kindle ships a tap shortcut to kill it without leaving the page (source: https://www.makeuseof.com/show-reading-progress-kindle/). Add "N min left", one tap cycles time → % → nothing.
6. **Time-left beats page count for us.** "Page N of M" is meaningless under reflow; % is honest but cold; time-left answers the question a woman with ten minutes asks. It's also *additive*, not scoring — consistent with the kind-growth contract in `research_personal_flora_identity.md`.
7. **Resume silently, never prompt.** Reopen to exact anchor (`#anchor` Range|Element|fraction — https://github.com/johnfactotum/foliate-js/blob/main/README.md); "start from the beginning?" is a quiet secondary, never a modal.
8. **Minimum viable controls = size, theme, line-spacing.** Size has the largest measured effect (source: https://www.nngroup.com/articles/glanceable-fonts/, MIT AgeLab, p<0.01); theme is what NN/g demands for long-form (rule 13); line-spacing is a WCAG lever (1.5em — https://baymard.com/blog/line-length-readability). Typeface + margin: ship, but demote.
9. **Top web-reader mistakes** (per `research_ereader_ux.md`, 12/05/2026): card-on-background instead of page-is-screen; undismissable chrome; missed tap targets (~50% hit rate, iOS 16 Books — https://basicappleguy.com/basicappleblog/build-a-better-books); tight side margins at large type; hard cuts where a 200–300ms slide belongs.

## 2. Typography + page design

10. **Measure: 50–75 CPL, ~66 ideal; WCAG caps at 80** (source: https://baymard.com/blog/line-length-readability, citing Ruder + WCAG 1.4.8); traceable to Bringhurst (source: https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/). **On 390px the risk inverts:** Baymard notes portrait mobile rarely *exceeds* the cap — our danger is falling **under 45 CPL**. At 390px with ~24px margins, Fraunces ~18px gives ~34–40 CPL (per `research_ereader_ux.md`). A card inside a viewport double-frames and starves the measure.
11. **Line-height ≥1.5; paragraph spacing ~2em** (source: as above).
12. **Indent XOR space — never both.** Butterick: "If you use a first-line indent on a paragraph, don't use space between. And vice versa." Indent 1–4× point size; space 50–100% of body size; first paragraph needs none (sources: https://practicaltypography.com/first-line-indents.html; https://practicaltypography.com/space-between-paragraphs.html). **Story/book → indent, no space. Essays → space, no indent.** Cheapest "real book" signal available.
13. **16px is the floor, not the target.** ≈ book-printed size; browser default for 20+ years; below it iOS Safari auto-zooms fields and mobile-friendliness is penalised (source: https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html; https://uxwest.com/fonts-should-be-16px-including-mobile-and-email/). Immersive reading defaults **above** it — 18px.
14. **Serif vs sans for long-form: evidence is genuinely WEAK — be honest.** A 2026 *Behaviour & IT* study found **no interaction between reading format and font type**; reviews conclude "there is no evidence that serif or sans-serif significantly impacts readability"; the one eye-tracking study favouring sans is limited by small n (sources: https://www.tandfonline.com/doi/full/10.1080/0144929X.2026.2678378; https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9680897/). **Fraunces/Cormorant are a BRAND decision, not a legibility one — never defend them with fake science.** What does matter: x-height, letter spacing, contrast, line length, line spacing.
15. **Cream over white is defensible on POLARITY, weakly on "sepia".** Solid: NN/g — positive polarity (dark-on-light) "won across all dimensions" for acuity and proofreading; pupil contracts giving "greater depth of field… without tiring the eyes"; and **"the positive-polarity advantage increased linearly as the font size was decreased"** (source: https://www.nngroup.com/articles/dark-mode/). Weak: sepia eye-strain claims are anecdotal — the main a11y write-up self-describes as "personal opinion and experience" (source: https://a11y-blog.dev/en/articles/is-sepia-mode-essential/). **Position: #ECE7DA is brand + glare-softening, and keeps us in the measurably better polarity. Don't overclaim sepia.**
16. **Ship dark mode anyway — NN/g names our category:** "applications meant for long-form reading (such as book readers, magazines…) should offer a dark-mode feature", and users should always be able to switch (source: as above). Trap: participants "did not report any difference in their perception of text readability" despite performing better in light mode — preference ≠ performance. Offer, don't default.
17. **Drop caps: no reading evidence either way — I searched and found none.** Claim dropped rather than invented. Treat ornaments as brand craft under `BRAND_IDENTITY.md`. Tasteful test: an ornament marking *structure* (chapter open, section break) earns its place; one decorating *mid-flow* interrupts the eye path.

## 3. Cards + preview copy

18. **A preview is a promise — NN/g's 4 Ss:** **Specific** ("communicate what they'll find"), **Sincere** ("a link is a promise" setting "expectations that will be instantly met"), **Substantial** (stands alone), **Succinct** (source: https://www.nngroup.com/articles/better-link-labels/). Direct hit on our model: supporting text "should be entirely supplementary" — **if the summary is needed to understand the title, the title has failed.**
19. **Information scent = label + context + prior experience.** Needs clear labels, accurate visual cues, **descriptive snippets** ("brief summaries that provide content previews before users commit to clicking"), consistent patterns. "Generic terms have low information scent: users… are reluctant to click" (sources: https://www.nngroup.com/articles/information-scent/; https://www.nngroup.com/articles/learn-more-links/).
20. **The curiosity gap has a measured optimum — vagueness backfires.** *Scientific Reports* 2025 analysed **8,977 A/B tests / 35,910 headlines** (Upworthy Research Archive). Concreteness→CTR is **inverted-U**: below ~2.58 concreteness, more concrete *raises* CTR; above ~3.06, more concrete *lowers* it; between, no effect. "Headlines that convey just the right amount of information maximize clickthrough rates at scale" — and **"there is such a thing as omitting too much information"** (source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11704130/). **A good honest summary does NOT cost taps; under-informing does. This kills the "don't spoil it" instinct.**
21. **Clickbait costs trust, measurably:** 54.5% report *decreased* trust in publications frequently using it (source: as above). For a UK women's wellness app, trust is the product — disqualifying, not a trade-off.
22. **"Why you're seeing this" builds trust — keep it positive and personal.** Explanations improve subjective understanding and generally lift trust, though trust/usability effects are inconsistent; **personalised explanations boost trust more than impersonal**; Herlocker: **simple, transparent justifications were more persuasive and trustworthy than abstract ones** (source: https://arxiv.org/pdf/2207.12515). Style evidence: n=129, **one-sided (purely positive) explanations beat two-sided on trust, transparency, effectiveness AND satisfaction** in low-stakes recommendation (source: https://arxiv.org/pdf/2505.03376). Caveat: authors flag confounds (item familiarity, placement of negatives); low-stakes ≠ health.
23. **Tintarev & Masthoff's seven aims** (transparency, scrutability, trust, effectiveness, persuasiveness, efficiency, satisfaction) **conflict** — "an explanation that increases transparency does not necessarily increase trust if the explanation is not understandable" (source: https://arxiv.org/pdf/2207.12515). **Scrutability is the one we'll skip: let her CORRECT the reason, not just read it.**
24. **Metadata that earns pixels:** read time (the phone decision-maker), type, date (only where staleness matters), author/source (trust). Read-time is the honest cousin of time-left.
25. **Truncation: clamp to 2 lines, "Read more" on its own line** (sources: https://www.nngroup.com/articles/learn-more-links/; https://thumbprint.design/guidelines/truncation). No authoritative number for card-preview line count exists — I searched; **claim dropped**. Rule instead: write TO the clamp so no ellipsis ever appears.

## Evidence-strength table (be honest internally)
| Claim we might make | Evidence | Strength |
|---|---|---|
| Pagination aids comprehension | CHI EA '25, n=100 | **Refuted** |
| Pagination aids focus/progression | Same, qualitative | Suggestive |
| 50–75 CPL, 66 ideal | Bringhurst → Ruder → WCAG | Strong |
| Light/positive polarity wins | NN/g / Piepenbrock | Strong |
| Cream/sepia reduces strain | Blogs, self-declared anecdote | **Weak — don't overclaim** |
| Serif better for long-form | Tandfonline 2026: no interaction | **Null — brand call only** |
| Drop caps aid reading | None found | **Dropped** |
| Honest summaries don't cost taps | Sci Reports, 8,977 tests | Strong |
| Positive "why this" lifts trust | UMAP '25 n=129 + Herlocker | Moderate |

## The ADD list

**Reader**
- **A1 — Reading-mode toggle** (paginate ↔ scroll), persisted per content type; default paginate Book/Daily Story, scroll essays. (1–4)
- **A2 — "N min left in chapter"** from her own measured turn-speed; one tap cycles time → % → off. (5–6)
- **A3 — Silent auto-resume** to anchor; "from the beginning" as quiet secondary. (7)
- **A4 — Controls trimmed** to size/theme/line-spacing; typeface + margin under "More". (8)
- **A5 — Indent-XOR-space split by type** — indent for story/book, spaced for essays. (12)
- **A6 — Reader dark mode** — offer, don't default. (16)

**Cards**
- **A7 — Audit + kill any card whose summary restates its title** (4 Ss: Substantial). (18)
- **A8 — Write a real 2-line snippet TO the clamp** — concrete, not coy. (20–21, 25)
- **A9 — "Why this, for you"** — one sentence, positive, personal, concrete: "Because you saved two pieces on sleep this month," not "Recommended for you." (22)
- **A10 — Scrutability control** on the why-line: "more/less like this". (23)
- **A11 — Read-time on every card.** (24)

## Per-type preview contract
| Type | Lead with | Metadata |
|---|---|---|
| Essay | Concrete claim/tension (not a question) | read time · author |
| Book | Where she is + what's next | time left · progress |
| Daily Story | First real line of prose (true excerpt) | read time |
| Recipe | Outcome + effort + constraint | prep time · key ingredient |
| Audio/Video | Inline player + real 8–12s hook | duration |
| Horoscope | The specific line, not "your reading awaits" | date |

## What most apps miss
1. **Progress is framed as scoring, not permission.** "62%" scores her; "6 min left" gives her permission to start. On a phone the enemy isn't comprehension — it's not opening it. Every finding (time-left, read-time, "less intimidating", "more digestible") says: **sell the SIZE of the commitment, honestly.**
2. **Apps hide the good bit and call it curiosity.** The 8,977-test inverted-U rebuts it: over-vagueness *lowers* CTR and clickbait halves trust. Nobody optimises the honest middle — open lane for a warm UK brand.
3. **"Why you're seeing this" ships as decoration, never a control.** Everyone prints the reason; almost nobody lets you correct it (scrutability).
4. **Everyone defends a typeface with fake science.** The serif evidence is null. "We chose Fraunces because it's beautiful and it's ours" is more honest — and more distinctive — than a citation that doesn't exist.
5. **Readers optimise the page and forget the doorway.** The card IS the reader's first page. A double-framed card starves the measure (10) *and* under-informs (20) — one component, both failures.

## Sentiment quotes
- **P34** (CHI EA '25, 2025): pagination gave "a sense of progression"; **P12**: "the process less intimidating"; **P43**: "the story more digestible"; **P32**: helped "focus even more" (https://nikhitajoshi.ca/papers/scroll-vs-page.pdf).
- **P36** (same): "I found myself wanting to read more of the story at once, without having to stop and scroll and re-find my position that I was reading."
- **P5** (same, dissenting — keep the toggle): pagination "made it even more difficult to keep track of everything."
- **P100** (same): "being able to scroll while reading was effortless."
- Kindle user via MakeUseOf (fetched 16/07/2026): "Time left in chapter is never accurate either… Turned it off immediately its percentage only over here." (https://www.makeuseof.com/how-to-reset-kindle-reading-time/) — the argument for A2's cycle-to-off.

---
Self-audit: every claim carries a URL; three claims (drop caps, card-preview line count, sepia science) **dropped or flagged weak** rather than asserted; all sources verified 16/07/2026; prior research cited, not re-derived.
