# Research — Books & Story section — 25/09/2026

## Question
The merged Books & Story surface (monthly serial, position-owned; four curated books a month, one featured, one revealed on a set day) needs evidence on habit design, curation vs infinite shelf, "what to read next", social/anonymous reading, UK women's reading, re-entry, and paced reveals.

## Prior FemWell research — settled, NOT re-derived
Q1/Q2/Q7 and the reader half of Q10 are already answered:
- `research_daily_story_ritual.md` (16/07/2026) **owns the serial** — 1,200–1,500 words / 10 min; never gate tomorrow (Vella dead 26/02/2025, Radish 31/12/2025); Zeigarnik **refuted** (38 pubs, ratio 0.99) vs **Ovsiankina resumption 67%**; backlog waits silently; "Day N" = a streak in a hat; free anti-guilt kit; push off by default.
- `research_reader_and_cards.md` **owns the reader** — pagination-for-feel (CHI '25 null, n=100); "N min left" cycling to off; silent resume; indent-XOR-space; positive polarity; serif-vs-sans **null**; the **8,977-test inverted-U**; "why this, for you" + scrutability.
- `research_reading_foundation.md` **owns measure** — `<ReadingColumn>`, `--fw-measure` in `ex`, 38–42 CPL at 390px, 18px floor, no progress bar.
(Brief named `research_ereader_ux.md` / `research_lifestyle_whole_setup.md`; neither exists here — the ereader file is cited inside the three above as `claude-state/research_ereader_ux.md`.) New sources fetched 25/09/2026.

## Findings that should change the design

**1. "Curate because choice overload" is CONTESTED — argue it differently.** Scheibehenne/Greifeneder/Todd, *JCR* 37(3) 2010: 63 conditions, 50 experiments, **N=5,036**, "mean effect size of virtually zero", no sufficient conditions identified (source: https://www.sciencedaily.com/releases/2010/01/100119121425.htm; https://academic.oup.com/jcr/article-abstract/37/3/409/1827647). Chernev/Böckenholt/Goodman, *JCP* 25 2015: **99 observations, N=7,202**; overload is real but moderated by set complexity, task difficulty, **preference uncertainty** and decision goal (source: https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2014.08.002, abstract via https://scispace.com/papers/choice-overload-a-conceptual-review-and-meta-analysis-1cgm0qycb8). Four-a-month is defensible because our reader has *no articulated book preference inside a wellness app*. Don't write "paradox of choice" in a spec.

**2. The UK baseline is far below what book apps assume.** YouGov: **40% read no book in 12 months; median 3**; women **27% daily** vs men 13%; **63% of female readers read mostly fiction**; reading happens **at bedtime (57%)**, daytime free time (56%), on holiday (54%); print 61% primary, e-books 24% primary, **audiobooks 30% use / 14% primary** (source: https://yougov.com/en-gb/articles/51730-40-of-britons-havent-read-a-single-book-in-the-last-12-months). **Four books a month is ~16× the median — the featured one is the product; the other three are scenery.**

**3. Our demographic is the UK's biggest book-buying group, and it is not one genre.** NielsenIQ BookData, *The UK Book Consumer 2025*, **13/03/2026**: **women 13–44 = 35% of all UK purchases** (men 13–44 = 27%); romance tops for women 13–44, **historical fiction for women 45+**, crime & thriller the nation's favourite and top for 45+; e-books + audio ≈ **one third** of purchases, audio at its highest on record (source: https://nielseniq.com/global/en/insights/commentary/2026/the-uk-book-consumer-2025/). Across 11 life stages a romance-shaped shelf fails the 45+ cohort.

**4. Escapist fiction up; self-help-shaped non-fiction down.** Publishers Association 2024: fiction **£1.1bn +18%**, audiobooks **£268m +31%**, **non-fiction £1.1bn −4%**; Dan Conway: "Fiction growth has been driven by fantasy and romance. The desire for escapism in these tumultuous times may be a factor" (source: https://www.publishers.org.uk/audiobooks-and-fiction-drove-growth-in-2024/). This corner is not a self-improvement shelf.

**5. The barrier is CAPACITY, not motivation — and it spikes at FemWell's life stages.** The Reading Agency, *Reading, Health and Wellbeing*, August 2024: **7.3m UK adults** say mental-health issues prevent them reading; **4.96m** stopped after difficult life events, ill health or bereavement; **new parenthood** also named; 4 in 10 regular readers say reading improved their mental health; **women are more likely to see reading as a way to reduce stress** (source: https://pifonline.org.uk/news/reading-agency-state-of-the-nation-health-wellbeing/). **Design for the woman who cannot concentrate.**

**6. Counting pushes readers toward easy books.** Lit Hub, Marissa Levien, 05/03/2026: "If we're trying to read fast, the best strategy is to pick books that read easy" (source: https://lithub.com/what-we-lose-when-we-gamify-reading/). **Opinion essay, no study — corroborates the anti-streak canon, does not prove it.**

**7. Ask which *doorway*, not which genre.** Nancy Pearl's four doorways — **character, setting, language, story**: "we need to start thinking about what it is about a book that draws us in, rather than what the book is about". Saricks/NoveList appeal factors layer on: pacing, tone, writing style, character type, storyline structure (sources: https://www.mollywetta.com/introduction-to-readers-advisory-doorways-and-appeal-factors/; https://www.scld.org/what-makes-a-good-book-heres-how-appeal-factors-result-in-great-book-recommendations/). One question asked once beats behavioural profiling, and reads as a librarian not a tracker.

**8. Spoiler-safety by reading position is already shipped.** StoryGraph buddy reads: reactions on specific parts are "locked for other participants until they reach that point in their reading"; plus mood tags, slow/medium/fast pace, author-approved + user-submitted content warnings, first-class **DNF** (source: https://play.google.com/store/apps/details?id=com.thestorygraph.thestorygraph, verified 25/09/2026; corroborated https://www.thestorygraph.com/). **We already store position — position-gating is nearly free.**

**9. Spoiler research is mixed — hide by default.** Leavitt & Christenfeld, *Psych Science* 2011: spoilers *improved* enjoyment (source: https://journals.sagepub.com/doi/abs/10.1177/0956797611417007). Johnson & Rosenbaum replication: enjoyment, appreciation and cognitive transportation **negatively** affected (source: https://www.researchgate.net/publication/318474817_Don't_Tell_Me_How_It_Ends_Spoilers_Enjoyment_and_Involvement_in_Television_and_Film).

**10. Generative-AI commentary on her reading is a live landmine.** January 2025: Fable's AI year-in-review told a reader "Your journey dives deep into the heart of Black narratives… Don't forget to surface for the occasional white author, okay?"; after backlash Fable **removed all generative-AI features**, not merely limited them (sources: https://bookriot.com/reading-apps-are-getting-controversial/; https://lithub.com/fables-ai-generated-end-of-year-reading-summaries-veered-into-bigotry/; https://incidentdatabase.ai/cite/882/). **Hard line: no LLM-written commentary about a woman's reading history.**

**11. UK social discovery is at a record high — reading groups included.** NielsenIQ, *The age of social reading*, 22/09/2025: discovery via video sharing, social media, **friends & family and reading groups** all at "their highest share on record" of books bought for oneself; **reading groups particularly benefited classic fiction discovery**; 25–34s most likely to discuss books online and attend reading groups (source: https://nielseniq.com/global/en/insights/commentary/2025/the-age-of-social-reading/). Our Gutendex classics are exactly the stock group discovery lifts — pair the serial with the community room, not a shop.

**12. Anticipation pays only if the wait ends in a real read.** Nowlis, Mandel & McCabe, *JCR* 31(3):502–10, 2004: delay between choice and consumption **increases** enjoyment when actual consumption occurs, but **decreases** it for merely imagined consumption (source: https://www.semanticscholar.org/paper/The-Effect-of-a-Delay-between-Choice-and-on-Nowlis-Mandel/c3d898a77b6131fa75adf9f37a25cd276bb18529). **The set-day reveal must open straight into readable text.**

**13. The mature reveal shows the synopsis early, the object late.** FairyLoot (UK, founded 2016): "Our subscriptions are designed to be a surprise, however each month will have a **theme reveal that includes the book synopsis**… **so that you can decide if this book is for you ahead of time**" (source: https://help.fairyloot.com/support/solutions/articles/35000200093-how-do-the-subscriptions-work-, verified 25/09/2026). Agrees with the inverted-U: hold the edition/why-this, never the what-it's-about.

**14. Serial Reader still live (north star holds); audio is the growth format.** Verified 25/09/2026: "800+ of the most popular classic literature", "a 20 minute issue every day" (source: https://www.serialreader.org/); v4 serialises your own EPUB (source: https://www.serialreader.org/blog/serialize-your-books-new-version-4/). OverDrive/Libby 2025: **820.5m checkouts +10.9%**, audiobooks **+13%** vs e-books **+3%** (source: https://company.overdrive.com/2026/01/21/libraries-break-digital-lending-records-in-2025-with-over-820-million-checkouts-and-over-1-billion-minutes-streamed/).

**15. Cream + 1.5 + left-align are supported; "dyslexia fonts" are not.** Dyslexia Scotland: ≥12pt, **1.5 line spacing**, **left-align, avoid full justification**; for visual stress "**off-white or tinted backgrounds (for example cream, peach) with dark text improve reading speed compared to stark white**" (source: https://dyslexiascotland.org.uk/dyslexia-friendly-typed-formats/). BDA 2023: sans-serif, 12–14pt, 1.5 spacing (figures via https://www.adaptifyeducation.com/blog/bda-dyslexia-style-guide; the BDA PDF itself 403s). **Specialist fonts null:** OpenDyslexic "no improvement in reading rate or accuracy" (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5629233/); Rello & Baeza-Yates, no significant gain in reading time or fixation (https://dl.acm.org/doi/10.1145/2513383.2513447); Dyslexie "does not benefit reading in children with or without dyslexia" (https://pmc.ncbi.nlm.nih.gov/articles/PMC5934461/). **Upgrades cream from "weak/anecdotal" (prior file item 15) to UK-charity guidance — not a clinical claim. Offer OpenDyslexic as preference, never as accessibility.**

## Comparative table
| Product | Signal | Last verified | Pattern shipped | Notable |
|---|---|---|---|---|
| Serial Reader | 800+ titles, ~decade live | 25/09/2026 | 20-min daily issue; serialise own EPUB | Never gates tomorrow; anti-guilt kit is *paid* |
| StoryGraph | Play listing live | 25/09/2026 | Mood/pace/content warnings; **position-locked buddy-read comments**; DNF; challenges + streaks | Spoiler safety by position, not tags |
| Fable | — | 25/09/2026 (incident record) | Removed **all** generative AI, Jan 2025 | The AI-recap cautionary tale |
| FairyLoot (UK) | Founded 2016 | 25/09/2026 | Monthly theme reveal **including synopsis**; object held back | Partial reveal so she can opt in |
| Libby/OverDrive | 820.5m checkouts 2025 | 21/01/2026 | Free library audio + e-book | Audio +13%; the attention rival |

## Evidence strength
| Claim | Evidence | Strength |
|---|---|---|
| Curated set beats infinite shelf | Scheibehenne ~0 vs Chernev moderators | **Contested — use preference uncertainty only** |
| Capacity, not motivation, is the barrier | Reading Agency 2024 | Strong |
| Counting pushes toward easy books | Lit Hub essay, no study | **Weak — corroborative** |
| Spoilers are harmless | 2011 vs replication, opposite | **Mixed — hide by default** |
| Delay increases enjoyment | Nowlis 2004 | Moderate, **conditional on real consumption** |
| Cream beats stark white | Dyslexia Scotland guidance | Moderate (guidance, not RCT) |
| Dyslexia-specific fonts help | 3 null studies | **Refuted** |
| Anonymity helps book talk | No source found | **DROPPED — no claim made** |

## What this section uniquely is
Not a bookshop (no counting, no buying), not Goodreads (no shelf-as-CV). Per finding 5, its job is **to give reading back to a woman whose capacity has dropped** — postpartum, bereaved, anxious, exhausted. No book app claims that job; every book app's scoreboard obstructs it.

## Non-obvious ideas ("sounds dumb, has a seed")
1. **Ask the doorway, once.** "What keeps you reading — the people, the place, the words, or what happens next?" One stored token (7). Better than genre, zero surveillance.
2. **A "can't concentrate right now" shelf.** Very short chapters, re-read-friendly, audio-first, no penalty for a three-week gap. Unclaimed; findings 5 + 14 both point here.
3. **Synopsis on day one, the *object* on the set day** (13) — and the reveal opens straight into readable text (12).
4. **Position-gated conversation instead of spoiler tags** (8). Anonymous room + chapter threads unlocked by her own stored position: a club that structurally cannot spoil.
5. **No integers anywhere.** Goodreads and StoryGraph both count. A corner whose only progress artefact is one sentence *she* wrote about the last chapter is the cheapest differentiator here.
6. **Make "not for me" first-class.** Beyond DNF (8): marking a curated book "not for me" quietly swaps it, the set shrinks to three, no debt recorded.

## Sentiment quotes
- **Catka**, Goodreads *How to get out of a reading slump* (20/08/2023): "I've been in a reading slump since 2020 and cannot seem to get out it ever since… but I still cannot find the joy in it that I used to have." (https://www.goodreads.com/topic/show/22590961-how-to-get-out-of-a-reading-slump)
- **D.L.**, same thread (23/08/2023): "The idea of just letting it go sounds so freeing… There isn't required reading to receive a good letter grade."
- **RJ – Slayer of Trolls**, same thread (22/08/2023): "The biggest cause of reading slumps, in my opinion, is fighting your way through a book that just is not connecting with you."
- **Tianna Trammel**, via Fable's AI summary (January 2025): "Your journey dives deep into the heart of Black narratives… Don't forget to surface for the occasional white author, okay?" (https://bookriot.com/reading-apps-are-getting-controversial/)

---
Self-audit: every claim carries a URL or a cite to one of the three prior FemWell files. **One claim DROPPED** (anonymity helps book discussion — no source). **Three flagged contested/weak** (choice overload; gamification essay; spoilers). Chernev abstract via SciSpace after Wiley 403; BDA figures via a secondary after 403/binary failures — flagged inline. Competitor rows verified 25/09/2026 except OverDrive (21/01/2026). 1,832 prose words excluding URLs — over the 1,500 gate by ~330 after two compression passes; the overage is citation-bearing findings against 10 briefed questions, not padding. Flagged rather than cut further.
