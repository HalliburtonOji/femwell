# Research — Library / Book Club ("attach a book, others talk about it") for an anonymous women's whole-life community — 09/07/2026

## Question
FemWell is building a robust Library / Book Club under the Community "Together" shelf. Halli's example: "let users attach books and others talk about it." This brief gathers cited, live-verified evidence on (1) personal bookshelf / "attach-a-book" models, (2) book metadata/search/cover APIs and which need creds/a backend function, (3) per-book discussion + spoiler safety + anonymity, (4) read-along / buddy-read rhythm + completion vs drop-off, (5) mood/theme/life-stage discovery kept whole-life not clinical, (6) warmth + safety mechanics — then turns it into a ranked buildable set, a minimal-but-robust v1, the exact API to pick, and warm mechanics.

## Prior canon (reuse, don't re-derive)
- **Together shelf brief** (`workspace/research_together_shelf_2026-07-08.md`): Book club is pillar #2. Async-first; per-chapter threads; spoiler-safe openers; no leaderboards/streak-shame; fuzzy "we" counts; anti-ghost-town seeding. This brief deepens the *book* layer only.
- **Existing Book Club** (`base44/entities/BookClubPick.jsonc` + `src/components/community/bookClubConfig.js`): today it is ONE curated pick (Little Women, Gutenberg id 514), read in the existing `/BookReader`, Jess-hosted, device-local self-attested checkpoint progress, "no books-read counts ever." Halli's new ask *extends* this into user-attached books + personal shelves + per-book talk. Carry the checkpoint/spoiler/no-count DNA forward.

## Sources consulted
- Open Library — APIs index (free, no key, rate limits, User-Agent policy) — fetched (09/07/2026): https://openlibrary.org/developers/api
- Open Library — Covers API (URL construction, S/M/L sizes, 100 req/IP/5min limit, "please use a src URL that points to covers.openlibrary.org") — fetched (09/07/2026): https://openlibrary.org/dev/docs/api/covers
- Google Books — Using the API (search needs no auth header but "an API key for public data" expected) — fetched (09/07/2026): https://developers.google.com/books/docs/v1/using
- Google Books — Terms ("You may not charge users any fee for the use of your application" without Google's permission) — fetched (09/07/2026): https://developers.google.com/books/terms
- Google Books — quota corroboration (~1,000 req/day default; API key raises quota) via ttsforfree + Codementor (09/07/2026): https://ttsforfree.com/en/blogs/google-books-api-key-step-by-step/ ; https://www.codementor.io/@srvkataria/how-i-bypassed-google-books-api-rate-limits-or-quota-vpmra29q0
- Hardcover — API getting-started (free GraphQL, token from settings, "in beta… heavily in flux", "should only be used from a code backend — never from a browser") (09/07/2026): https://docs.hardcover.app/api/getting-started/ ; https://www.emgoto.com/hardcover-book-api/
- ISBNdb — pricing ($14.99–$299.99/mo, paid, 110M titles, 19 data points) (09/07/2026): https://isbndb.com/isbn-database
- Goodreads — API deprecation ("no longer issuing new developer keys" from 08/12/2020; "will not continue to support API endpoints") (09/07/2026): https://www.goodreads.com/topic/show/21788520-api-deprecation ; https://debugger.medium.com/goodreads-is-retiring-its-current-api-and-book-loving-developers-arent-happy-11ed764dd95
- The StoryGraph — shelves/moods/DNF (currently-reading / read / to-read / DNF, mood+pace filters, DNF excluded from goal) (09/07/2026): https://www.thestorygraph.com/ ; https://roadmap.thestorygraph.com/requests-ideas/posts/dnf-exclusion-count-toward-reading-goal
- The StoryGraph — buddy-read spoiler mechanics (up to 12, comment locked to a %/page, rounds up %, cross-edition warning, ratings hidden until all "read") (09/07/2026): https://thissplendidshambles.com/storygraph-buddy-reads/ ; https://roadmap.thestorygraph.com/requests-ideas/posts/add-visible-comments-to-buddy-reads
- Fable — social reading (integrated e-reader, "organized, spoiler-free chapter rooms and episode rooms", currently-reading/wishlist/finished shelves, no meetings/video required; disabled AI Jan 2025 after harmful outputs) (09/07/2026): https://bookriot.com/fable-book-club-app-review/ ; https://play.google.com/store/apps/details?id=co.fable.fable
- Reddit spoiler markdown (`>!spoiler!<`) + etiquette (09/07/2026): https://www.makeuseof.com/how-to-do-spoilers-on-reddit/
- Book-club failure modes (500pg picks kill completion; lack of lead; no variety; dominant member; too little/too much structure) (09/07/2026): https://bookdot.app/blog/how-to-start-run-successful-book-club/ ; https://www.viktorcessan.com/why-most-book-clubs-fail-and-what-learning-science-says-to-do-instead/ ; https://www.writercosmos.com/blog/when-book-clubs-go-bad-walkouts-feuds-friendships/
- Mood/theme discovery — WhichBook mood-emotion sliders (precedent); Goodreads/Penguin mood lists; "warm hug" comfort-read framing (09/07/2026): https://www.whichbook.net/mood-emotion/ ; https://www.goodreads.com/blog/show/2809-84-new-mood-based-reading-recommendations-across-genres ; https://adventuresinlit.com/2025/12/03/10-books-that-feel-like-a-warm-hug/

---

## 1. PERSONAL BOOKSHELF / "ATTACH A BOOK" — what the models teach

- **Add a book = search-first, manual-entry as a fallback.** StoryGraph/Fable/Goodreads all lead with a **title/author/ISBN search** against a catalogue; you tap a result to shelve it. Manual entry exists only for missing/obscure editions (source: https://www.thestorygraph.com/ ; https://bookriot.com/fable-book-club-app-review/). For FemWell, search against a free API (§2) and let the *attach* action be "search → tap → it's on your shelf." Manual entry (just a title + optional cover-less card) is a cheap safety net, not the primary path.
- **The four shelf states that matter (and only these).** Every serious tracker converges on **Want to read · Currently reading · Finished (Read) · Did not finish (DNF)** (source: https://www.thestorygraph.com/ — "currently reading, read, want to read, and DNF"; Fable: "currently reading, wishlist items, and finished books" https://bookriot.com/fable-book-club-app-review/). A gentle 5th — **Paused** — is one of StoryGraph's top user requests (https://roadmap.thestorygraph.com/requests-ideas/posts/book-status-of-paused) and reads warmer than "DNF"; consider "Set aside" as the FemWell label.
- **Progress is optional and low-friction.** Trackers offer page/%/audio-time, but the *hardcore* logging (pages, dates, sessions, stats) is exactly what a wellness app should NOT copy. Minimal warm version: a soft "how far are you?" (a few named checkpoints or a rough %/"just started / halfway / nearly done"), self-attested — which is *already* the FemWell pattern (`clubReached` device-local checkpoints). Keep that.
- **The profile shelf is a gentle social signal, not a trophy case.** "Currently reading" on a profile is the single most valuable social surface (it invites "oh, I read that!") without any vanity metric. **Do NOT** import Goodreads/StoryGraph's counts, yearly page goals, or reading-challenge bars — those are the shame engines (§4, §6).
- **DNF must never punish.** StoryGraph's most-upvoted asks are literally "DNF not counted toward reading goal" and "let us have a DNF shelf" (Goodreads users defect *to* StoryGraph over this) (source: https://roadmap.thestorygraph.com/requests-ideas/posts/dnf-exclusion-count-toward-reading-goal ; https://help.goodreads.com/s/question/0D58V00006ZRZxtSAH). Lesson: **"Set aside" is a first-class, no-guilt state**, never a failure.

**Minimal warm shelf for FemWell:** four states (Want to read · Reading · Finished · Set aside), search-to-attach, optional rough progress, a "currently reading" chip on the profile — and *no counts, no goals, no yearly challenge*.

## 2. BOOK METADATA / SEARCH / COVER APIs — the creds decision (this gates sign-off)

| API | Free? | Key / creds? | Backend function needed? | Rate limit | Cover terms | Verdict |
|---|---|---|---|---|---|---|
| **Open Library Search** (`openlibrary.org/search.json`) | Yes, fully | **No key** | **No** — CORS-friendly, callable from the client | 1 req/s anon; 3 req/s if you send a `User-Agent` + email; "don't bulk download… cache results" | n/a | **PICK for v1** |
| **Open Library Covers** (`covers.openlibrary.org/b/{isbn\|olid\|id}/{S\|M\|L}.jpg`) | Yes | **No key** | **No** — put the URL straight in `<img>` | 100 req/IP per 5 min for non-CoverID/OLID lookups → 403 if exceeded | "please use a src URL that points to covers.openlibrary.org"; courtesy back-link appreciated | **PICK for v1** |
| **Google Books** (`/books/v1/volumes?q=`) | Yes | Search works with **no auth header**, but Google "expect[s] an API key for public data"; keyless is throttled hard (~1,000 req/day, then 429/quota errors) | **Yes if you want reliable quota** — a key must live in a backend function, never the client | ~1,000/day keyless → 10,000/day with a key | **"You may not charge users any fee for the use of your application"** without Google's written permission — a real constraint for a paid-tier app | **Fallback only** (better covers for some titles) — but the no-charging term + key-in-function cost make it v1-avoid |
| **Hardcover** (GraphQL) | Yes | **Yes** — personal token | **Yes, mandatory** — docs: "should only be used from a code backend — never from a browser"; also "in beta… heavily in flux, anything you build could break" | (beta) | richer genre/rating data | **Defer** — richest data but beta-fragile + backend-only |
| **ISBNdb** | **No — paid** ($14.99–$299.99/mo) | Yes | Yes | plan-tiered | list price + covers | **Skip** — paid, no wellness upside |
| **Goodreads** | — | **Dead** — no new keys since 08/12/2020, endpoints unsupported | — | — | — | **Do not use** |

**The one clean fact for sign-off:** **Open Library needs NO key, NO backend function, NO creds, NO paid plan — search AND covers are callable straight from the FemWell client.** That means the entire "attach a book" surface is buildable now with zero external-creds sign-off. (Best practice: send a `User-Agent: FemWell (contact@femwells.com)` header for the 3×-faster tier, and **cache the metadata onto our own entity when a book is attached** so we don't re-hit their API — which also matches Open Library's "cache results, store records locally" request and makes covers reliable even if their CDN rate-limits.)

## 3. PER-BOOK DISCUSSION + SPOILER SAFETY + ANONYMITY

- **The winning spoiler mechanic is progress-locking, not just tags.** StoryGraph's buddy-read locks a comment to a **%/page**, and "anyone who is not up to chapter 5 yet won't be able to see that comment"; it **rounds the % up** for extra safety and warns when editions differ (source: https://thissplendidshambles.com/storygraph-buddy-reads/). **This is exactly FemWell's existing checkpoint model** (`clubReached` unlocks a checkpoint's discussion only when you self-attest you've reached it). Generalise it: per-attached-book discussion is organised by **checkpoint / chapter-range threads**, and a thread's content is hidden until you tap "I've reached here."
- **Fable's frame is the tone target:** "**organized, spoiler-free chapter rooms and episode rooms**" + "as easy as texting… but just for your fellow book club members" (source: https://bookriot.com/fable-book-club-app-review/). Warmth = it feels like texting friends, not posting to a forum.
- **Belt-and-braces spoiler blur for free-text.** Beyond checkpoint gating, offer an inline **spoiler blur** (Reddit's `>!…!<` → tap-to-reveal) for anything a user wants to hide within an allowed thread (source: https://www.makeuseof.com/how-to-do-spoilers-on-reddit/). Cheap, client-side, familiar.
- **Ratings/opinions hidden until finish.** StoryGraph hides ratings & reviews "until everyone… has marked the book as read" (source above) — a neat way to keep the *finished-book* verdict spoiler-safe. FemWell can gate a book's "how did it land?" reflections behind Finished state.
- **Anonymity + safety without killing warmth.** Carry the Community defaults (from `research_talk_rooms` / `research_events_together`): botanical pseudonyms, a **"…" menu with Report / Block / Mute** on every post, background moderation, per-book **content warnings** (already in `BookClubPick.trigger_warnings`), and **no dominant-voice risk** — the failure literature flags a "dominant member who monopolises discussions" as a top club-killer (source: https://www.writercosmos.com/blog/when-book-clubs-go-bad-walkouts-feuds-friendships/), which anonymity + async threads + a warm Jess host naturally defuse.

## 4. READ-ALONG / BUDDY READS / RHYTHM — completion vs drop-off

- **What kills completion (cited):** picking **long/ambitious books** ("500-page literary novels… busy members simply cannot finish, attendance drops, momentum collapses under guilt about falling behind"; 250–350pg accessible prose builds completion); **no one leading the conversation**; **book-choice fatigue / no variety**; and **too rigid OR too loose** structure (sources: https://bookdot.app/blog/how-to-start-run-successful-book-club/ ; https://www.viktorcessan.com/why-most-book-clubs-fail-and-what-learning-science-says-to-do-instead/). Direct build implications: keep picks **shorter & varied**, **Jess always leads** (never a silent room), and use **checkpoint prompts** (light structure) not a syllabus.
- **Async-first is correct for a small community.** StoryGraph buddy reads are **asynchronous** — everyone updates their own progress, comments unlock as each reader arrives, no simultaneity required (source: https://thissplendidshambles.com/storygraph-buddy-reads/). Fable needs "no meetings or video calls" (source: https://bookriot.com/fable-book-club-app-review/). This matches the Together brief's async-first mandate.
- **"I'm reading this too" is the core belonging signal.** A soft, fuzzy "**a few others are reading this now**" on a book (no exact count) turns a solo attach into a shared one — the Wordle "same page today" effect from the Together brief, applied per-book.
- **Cadence:** the existing model (per-checkpoint, "six weeks · no rush, no streak") is right. Keep **buddy reads (any user-attached book, small ad-hoc group)** *and* the **one curated club pick** as two rhythms: bottom-up (attach + invite) and top-down (Jess's monthly/6-weekly pick). Never weekly (the BookClubPick note already forbids it).
- **Completion nudges must be gentle, not streaks.** A warm "your book's been quiet — dip back in at your own pace?" beats any progress-shame bar. **No reading challenges, no streaks, no yearly goals** (§6).

## 5. RECOMMENDATIONS / DISCOVERY — warm, whole-life, not clinical

- **Mood/emotion discovery is the proven warm model.** WhichBook lets readers find books by **mood & emotion** sliders rather than genre trees (precedent; source: https://www.whichbook.net/mood-emotion/); Goodreads and Penguin both ship "**best books for every mood**" lists (sources: https://www.goodreads.com/blog/show/2809-84-new-mood-based-reading-recommendations-across-genres ; https://www.penguinrandomhouse.com/articles/the-best-books-to-read-based-on-your-mood/). Framing books by **the feeling they evoke** ("a warm hug," cosy, hopeful, page-turner, tender-but-uplifting) is inherently non-clinical and matches FemWell's smart-friend voice (source: https://adventuresinlit.com/2025/12/03/10-books-that-feel-like-a-warm-hug/).
- **Discover WITHOUT vanity metrics.** Surface "**books women here loved**" and "**others reading this now**" as fuzzy warmth ("a cosy group is reading this"), never ranked star-counts or "most popular" leaderboards (carry the Together anti-vanity rule).
- **Whole-life is the guardrail — do NOT over-tint to health.** The recurring FemWell failure is making everything clinical. Discovery shelves must span **fiction · romance · memoir · thrillers · cosy · career/money · grief · friendship · fun**, with life-stage as a *gentle optional tint* (e.g. a "perimenopause memoirs" shelf EXISTS but sits beside "swoony romance," "twisty thrillers," "quiet comfort reads," "books that made us laugh"). Never a "menopause reading list" as the front door.
- **Life-stage tint, done softly.** A woman in perimenopause might see a *quiet* "books others in this season reached for" rail — offered, dismissible, never the whole library, and always outnumbered by joy/fiction shelves.

## 6. WARMTH & SAFETY MECHANICS

- **First-timer welcome.** A one-line "new here? lurking counts — read along, no pressure to post" (matches existing `host_intro`: "lurking counts"). A "your first shelf" nudge: attach one book you loved.
- **"Currently reading" as a gentle signal**, not a stat — a soft chip on the profile + "a few others are reading this too."
- **Anti-vanity, hard-coded:** **no books-read counts, no yearly goal, no reading challenge, no streaks, no star-rank leaderboards** (already the entity's stated rule — "No 'books-read' counts ever"). This is the single biggest differentiator from Goodreads/StoryGraph and the reason women defect from them.
- **"Set aside" (not DNF) — a no-guilt state** with warm copy ("not every book is for right now").
- **Streak-freeze / forgiveness by absence** — because there IS no streak, a quiet week costs nothing; a gentle "pick it back up whenever" is the only nudge.
- **Content warnings per book** (existing `trigger_warnings`) surfaced *before* a heavy pick/thread (loss, fertility, trauma).
- **Report / Block / Mute in a "…" menu on every post** + background moderation + botanical aliases (carry Community safety canon).
- **Spoiler-safe by default** — checkpoint-gated threads + tap-to-reveal blur, so joining late is always safe (§3).
- **Jess always hosts / seeds** — no book thread ever shows zero; a warm host defuses the "no one leads / dominant voice" club-killers (§4).

---

## RANKED BUILDABLE FEATURE LIST (impact × effort)

Legend: **[C]** client-side now · **[E]** new/extended entity · **[F]** backend function · **[K]** external creds.
Build class reflects **Open Library = no key, no function** — most of this is buildable now.

| # | Feature | Impact | Effort | Build class | Notes |
|---|---|---|---|---|---|
| 1 | **Attach-a-book (Open Library search → tap to shelve) + cover via covers.openlibrary.org** | High | Low | **[C]+[E]** | No key/function. Cache metadata onto our entity on attach |
| 2 | **Personal shelf: 4 states** (Want / Reading / Finished / Set aside) | High | Low | **[E]** | Extend existing device-local + a `UserBook` entity |
| 3 | **Per-book discussion, checkpoint-gated (spoiler-safe)** | High | Low–Med | **[E]** | Generalise existing `clubReached` + `ClubNote` to any book |
| 4 | **"Others reading this now" fuzzy signal** | High | Low | **[E]** | Aggregate count, shown fuzzy ("a cosy group") |
| 5 | **Buddy read: attach a book + invite a small group (async, spoiler-locked)** | High | Med | **[E]** | StoryGraph model; ≤12; reuse checkpoint gating |
| 6 | **Tap-to-reveal spoiler blur in free-text** (`>!…!<`) | Med–High | Low | **[C]** | Belt-and-braces over gating |
| 7 | **Mood/theme discovery shelves (cosy/hopeful/thriller/romance/memoir/…)** | High | Med | **[E]** | Curated whole-life shelves; life-stage a soft tint |
| 8 | **"Currently reading" profile chip** | Med–High | Low | **[C]+[E]** | Gentle social signal, no count |
| 9 | **"…" Report/Block/Mute + content warnings on book threads** | High (safety) | Low | **[C]+[E]** | Reuse Community safety canon + existing `trigger_warnings` |
| 10 | **Optional rough progress (just started / halfway / nearly done)** | Med | Low | **[E]** | Self-attested; no pages/stats |
| 11 | **Jess-seeded per-book opener + first-timer welcome** | Med–High | Low | **[C]** | No book room ever empty |
| 12 | **Google Books cover fallback** (for titles OL lacks a cover) | Low–Med | Med | **[F]+[K]** | Needs key-in-function + no-charge term; **defer** |
| 13 | **Hardcover richer genre/rating data** | Low | High | **[F]+[K]** | Beta, backend-only; **defer** |
| 14 | **Integrated in-app e-reader for attached books** | Med | High | — | Fable-style; out of scope — keep the existing `/BookReader` for public-domain picks only |

---

## RECOMMENDED MINIMAL-BUT-ROBUST v1 (6 items)

1. **Attach-a-book via Open Library** (search → tap → shelved; cover from covers.openlibrary.org). *Why: it's Halli's exact ask, and it needs zero creds/keys/functions — buildable now.*
2. **Personal shelf, 4 warm states** (Want / Reading / Finished / Set aside). *Why: the whole point of "attach a book"; "Set aside" replaces shame-laden DNF.*
3. **Per-book, checkpoint-gated discussion** ("others talk about it," spoiler-safe). *Why: delivers the "others talk about it" half; reuses the proven StoryGraph lock + our existing checkpoint code.*
4. **"Others reading this now" fuzzy signal + "currently reading" profile chip**. *Why: turns a solo attach into belonging without any vanity metric.*
5. **Mood/theme discovery shelves (whole-life)**. *Why: warm, non-clinical discovery; the guardrail against health-over-tinting.*
6. **Safety + warmth layer**: "…" Report/Block/Mute, per-book content warnings, Jess-seeded openers, first-timer "lurking counts" welcome, spoiler blur. *Why: "safe by design" is non-negotiable; a hosted room never feels empty or unkind.*

(Buddy-read *invites* (item 5 in the table) are the natural v1.1 — v1 can ship the shared per-book thread first, then add small-group invites.)

## The exact API to pick for v1
**Open Library** — Search API (`https://openlibrary.org/search.json?q=…`) for attach, and the Covers API (`https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg`) for artwork.
- **No API key, no creds, no paid plan, no backend function** — both are CORS-friendly and callable straight from the FemWell client. **This means no external-creds sign-off is required to start building.**
- Send a `User-Agent: FemWell (hello@femwells.com)` header for the 3 req/s tier, and **cache metadata + cover onto the `UserBook`/`Book` entity on attach** (honours OL's "cache results / store locally" ask, dodges the 100-req/5-min cover limit, and makes covers reliable).
- Keep **Google Books as a documented fallback only** for missing covers — but note it needs a key-in-a-function AND its terms forbid charging users for the app, so it stays out of v1.

## 6–8 WARM MECHANICS (whole-life, anti-vanity)
1. **Search-to-attach that feels like texting** — "add a book you're loving," one tap to shelve, cover appears instantly.
2. **"Set aside," never "DNF"** — a first-class no-guilt state ("not every book is for right now").
3. **Fuzzy "others reading this now"** — belonging without a number ("a cosy group is on this one too").
4. **Checkpoint-gated, spoiler-safe talk** — you only unlock a thread by saying "I've reached here," so joining late is always safe.
5. **No counts, no goals, no streaks, no challenges** — the profile shows *what* you're reading, never *how many* (the anti-shame differentiator).
6. **Content-warning first, always** — heavy themes (loss, fertility, trauma) flagged before you open the pick or thread.
7. **Jess hosts every room** — a warm opener on each book so it's never empty and no single voice dominates.
8. **First-timer welcome: "lurking counts"** — read along with zero pressure to post; "attach one book you loved" as the gentle first step.

## Recommended next steps for Mr Lead Manager
1. **Spec a `UserBook` entity** (owner alias · book ref · state: want/reading/finished/set-aside · rough progress · attached_at) + a lightweight **`Book`** cache entity (open_library_id/isbn · title · author · cover_url · description · content_warnings) populated from Open Library **on attach** (no live API on read). Reuse `ClubNote` + `clubReached`-style checkpoint gating for discussion, generalised from `pick_key` to any book.
2. **No new backend function and no external creds needed for v1** — Open Library search + covers are client-callable. Flag this in the MP so build isn't blocked on sign-off.
3. **Carry ALL Community safety canon** (botanical aliases, "…" Report/Block/Mute, background moderation, per-book content warnings, OSA/EHRC defaults) from `research_talk_rooms_2026-07-08.md` / `research_events_together_2026-07-08.md`.
4. **Wire it into the Together shelf** as the deepened "Read-Along / Library" pillar (pillar #2 of the Together brief), with the central "Jump to" switcher, and link the demo into FoundersOS per the standing rule.
5. **Whole-life gate:** discovery shelves must be fiction/romance/memoir/thriller-forward; life-stage a *soft optional tint*, never the front door.

## Sentiment / precedent quotes
- Goodreads user, defecting to StoryGraph (Help forum, 09/07/2026): "Please let us have a DNF shelf if we so choose… the books on it still have to also be listed as on my TBR, currently reading, or read shelf, which messes up those shelves. This is the main reason I'm considering the StoryGraph." (https://help.goodreads.com/s/question/0D58V00006ZRZxtSAH)
- Hardcover docs (09/07/2026): "This should only be used from a code backend — never from a browser." — why Hardcover/Google-with-key need a function, and Open Library doesn't. (https://docs.hardcover.app/api/getting-started/)
- Book Riot on Fable (09/07/2026): conversations happen "in organized, spoiler-free chapter rooms… as easy as texting or commenting online — but just for your fellow book club members." — the warmth+spoiler-safety target. (https://bookriot.com/fable-book-club-app-review/)
