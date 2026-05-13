---
name: FemWell Lifestyle content pipeline is broken — investigate before more UI rebuilds
description: User flagged 2026-05-06 that Lifestyle content (books, news, videos, summaries, automations) is fundamentally broken. Pause visual MPs (Browse / Listen / Daily Story / Horoscope) until the pipeline is audited and rebuilt.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
User said on 2026-05-06: "books and articles and all that stuff [doesn't] function well... so many dead links, books with just summary and read more goes nowhere, book of the day is not as engaging, the whole setup lets me down, news (nothing recent or isn't even there), no proper sources just like 1 or two that don't even do well, videos go [to] read more when its links to youtube of which some are 30 second shorts but the summary on my app is saying something else, or 1hr videos (no one wants to sit through that), also the automations that constantly fail or don't write completely. The whole set up needs investigating and rebuilding honestly."

**Hard gate (locked 2026-05-06) — LIFTED 2026-05-13.** H2 (Horoscope v2) shipped on top of the still-broken pipeline and nothing exploded on live. User formally lifted the gate; pipeline fixes (Listen Seed re-run, ingestRSS field-mismatch, `created_at` null, Sessions chip taxonomy) move into the **Phase A** lane of the master plan rather than blocking visual MPs. Surface the remaining bugs in the Phase A queue, but don't treat them as blockers anymore. See `mnt/femwell/femwell_master_plan_2026-05-13.md` §12 answer #7.

Original gate (preserved for context, no longer in force):
1. The content pipeline (ingestion, scoring, summarization, source curation) is audited end-to-end.
2. The actual data state is understood (broken links, mismatched summaries, video duration vs content drift, sparse News sources, Books-with-no-destinations).
3. The failing automations are identified, root-caused, and a rebuild plan is signed off.
4. Source curation is fixed — current "1 or 2 sources that don't even work well" is not enough.

**Why this matters:** Beautiful UI amplifies content quality. If the underlying content is broken, every visual MP makes the brokenness more visible and more disappointing.

**Known specific failures (as flagged by user):**
- Books: dead "Read more" links, summaries with no destination, Book of the Day not engaging
- News: nothing recent, sparse sources, only 1–2 working sources
- Videos: 30-second YouTube Shorts whose app-side summary describes longer content; 1-hour videos that no one watches; summary/duration mismatch
- Automations: failing constantly, writing partial data, missing scheduled runs
- Source variety: needs a plethora across multiple categories, not 1–2 outliers

**Investigation tracks dispatched 2026-05-06:**
1. **Live data audit** (general-purpose agent + base44 MCP) — sample LifestyleItems by content_type, find broken content_urls, flag summary/duration mismatches, check WeeklyBookPick state, count active LifestyleSources by category.
2. **Codebase + automations audit** (Plan agent / Mr Lead Manager) — read base44/functions/* for the ingestion + scoring + summarization automations. Find the schedules, the failure modes, the partial-write patterns. Read the source-curation logic.
3. **"What good looks like" research** (Ms Deep Search) — best practices for women's-wellness content pipelines: source curation, dead-link detection, video deduplication + length-filtering, summary quality control, book-of-the-day editorial framing, RSS health monitoring.

After all three reports are in, build a rebuild plan with phased MPs. Visual Lifestyle MPs (Browse, Listen, Daily Story, Horoscope rebuild) only resume after the rebuild plan is signed off and at least the foundational pipeline fixes have shipped.

**What is already known to work at the visual layer (MP 1 For-You shipped clean):**
The hero / bento / save heart / smart-save phase chooser / phase pill / cycle utility are all live and rendering correctly. The chrome is good. It's the substance pouring through it that needs work.
