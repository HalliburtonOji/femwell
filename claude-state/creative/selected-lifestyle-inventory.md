# Selected Lifestyle completion inventory — 6 October 2026

Owner: Mr Lead Manager / Codex child audit. Parent production claim: `6e2f2f2`.

Scope: **finish Sky with Petal Observatory × Star Press, then the other Lifestyle sections**. Source audit only: no browser, no remote entity reads/writes, no paid actions, no promotion. The committed entities and code show implementation capability; they do not prove a live deployment or account data. No hot document or production source edited by this audit.

Contract read: AGENTS → CLAUDE → onboarding → STATUS → five-sky-worlds plan → relevant BRAND_IDENTITY rules, plus Mr Lead Manager spec. The current direct repository workflow supersedes historical paste-only delegation. Conformance targets: §11 lifecycle, §15.6/§17.6 living bible, §17.3 no strip, §19 bespoke stateful complete surfaces, §19.7 composition and §19.8 two-way connections. The selected demo stays in Ideas · Dev; main stays held until Halli approves.

## Carry-forward inventory

Sky is already a substantial page. A redesign must retain all of these, including functions that are currently imperfectly wired:

| Movement | Existing substance and state | Source |
|---|---|---|
| Living header | Actual Moon phase, art direction, phase/date, flower language, replay, section selection and focused actions | Lifestyle shell and Sky world header components |
| Today's reading | Real owner birth chart/reading, complete narrative, power/pressure/trouble, date, share, optional birth-time/place editing | `SkyFocus.jsx` |
| Today's lesson | Authored source-linked lesson catalogue; five-card daily deck; swipe; date-change prompt; canonical keeps; private reflection drafts, errors and previous notes | `sky/DailySkyLesson.jsx` |
| Private sky notebook | Owner SkyNote creation, latest notes, earlier-note expansion, visible write errors | `sky/PrivateSkyNotes.jsx` |
| Sky and body | Independent cycle and lunar rings; real observed diary; expandable observations; refresh after cycle changes | `SkyFocus.jsx`, `sky/ObservedSkyDiary.jsx` |
| Chart | Sun/Moon/rising, degree, element, modality, ruler, birth-time/place; three expandable explanations; six goddess/asteroid readings | `SkyFocus.jsx` |
| Reading actions | Reflect, Community composer, Jess, mark read/Garden; mood/energy and Moon-sign music | `SkyFocus.jsx:168`, `:327` |
| Red/white Moon | Existing owner classification hook plus persisted classification and CycleEvents; currently not connected to this presentation | `horoscope/hooks/useRedWhiteMoon.js`; `SkyFocus.jsx:348` |
| Annual sky | Profection house/time lord, annual reading, Saturn-return ages | `sky/SkyMovements.jsx` |
| Ask the sky | Real askStars request and AdviceThreads/AdviceMessages history, answer expansion, visible submit errors | `sky/SkyMovements.jsx` |
| Compatibility | Name/birthday controls, real generated reading, four relationship dimensions and shared-link prefill | `sky/SkyMovements.jsx:220` |
| Monthly letter | Existing Entitlements and owner AtelierLetters pipeline, published body, existing sanitiser; current Sky caller supplies no letter | `horoscope/sections/AtelierReading.jsx:86`; `SkyFocus.jsx:383` |
| Your way | Quiet/soft preferences, science explanation, privacy/terms links | `sky/SkyMovements.jsx:369` |

Full lower-section inventories:

- **Read:** own summary; continue-reading cards; leading article; remaining articles/guides; fictional stories; full readers, kept items and real empty state. `ReadFocus.jsx`; adapters and continuation in `LifestyleEliteShell.jsx:206`, `:947`.
- **Listen:** leading listen or watch; other audio/shows; watch shelf; inline media when the source is playable; honest external show links; full media directories. `ListenFocus.jsx:31`; shell audio/video adapters and directory navigation at `:1641`.
- **Books:** preserve the accepted table/reading-room artwork and all existing canonical UserBook statuses, current club pick, Gutenberg chapters, progress, position-gated club checkpoints, reading reflection and Planner creation. Do not replace these with a generic filtered shelf.
- **Good life:** time picker, real suggestions, pleasure/permission slips with DO and cited Why, day/try Planner writes, and eleven doors: Mirror, Move, Kindred, Curious, Delight, Nest, Tonight, Becoming, Make, Outside, Money. `GoodLifeFocus.jsx`; shell `:797`, `:806`, `:816`.
- **Yours:** retained reads/listens/watches/books/stories, phase cards, real kept Sky lessons and their return route, own counts. `YoursFocus.jsx`; shell `:1205`, `:1644`.
- **Shared chrome:** two section-specific focused pills, section summary, Jess digest, full section selection, whole-life doors, readers/sheets, floating navigation. Keep all existing capability; moving a feature into another labelled step is not automatically an improvement.

## Completion repairs supported by source

These are atom-sized, testable repairs. They are not evidence that the live app has been re-proved in this audit.

| Priority / atom | Proven problem | Necessary repair and proof |
|---|---|---|
| P1 — real red/white state | `SkyFocus.jsx:348` supplies `rw={null}`. `SkyMovements.jsx:92–93` says red=full/white=new; both the classifier and legacy presentation use the opposite mapping. The new map omits `purple_moon`. | Connect the existing owner hook; show actual observed phases/sample size and honest insufficient-history/error states. Resolve naming with cited research before printing an archetype. Do not infer personality from bleed timing. Check all emitted classifications, empty account and owner switching. |
| P1 — real monthly letter | `SkyFocus.jsx:383` always supplies `letter={null}` and reads `user.has_atelier`. Existing code uses Entitlements and `plusUnlocked`; `PLUS_PARKED` is true. | Reuse owner letter/entitlement loaders and the published-body sanitiser, rebuild the presentation in the chosen world, show the real dated letter or a concise empty state. Keep parked access parked. Do not purchase, generate an unsolicited letter, expose other owners' drafts or invent publication timing. |
| P1 — honest attribution | `SkyMovements.jsx:285,304` promises “written, not generated”; `draftAtelierLetter/entry.ts` actually invokes a language model and writes `draft:false` at `:289`. | Remove untrue attribution in the selected demo and flag the generation-vs-brand rule conflict explicitly for its owner. No silent pipeline rewrite. Existing product capability is retained, but checkout is not part of this cycle. |
| P1 — own reading | Shared shell loader uses `HoroscopeReading.filter({}, …)` at `LifestyleEliteShell.jsx:586`; its glance/deck can select another owner's reading even though Sky's own hook is scoped. | Fetch after auth with owner identity; clear on owner changes; retain each summary and reading action. Prove two-owner separation and no-auth state. |
| P1 — preferences actually save | `SkyMovements.jsx:369–383` reads one ordering, writes optimistically, swallows failures, and can create competing preference rows. Generator chooses newest updated row. | Await a serialised owner write, prevent simultaneous creation, align selection ordering, roll back/show retry. Explain future-reading effect accurately. Test forced failure and rapid taps. |
| P1 — Garden day provenance | `SkyFocus.jsx:327` calls `recordProgress("your-sky",0,…)`; `readingActivity.js:24,67` permanently records one chapter key. Later daily readings cannot add a new day. | Use an exact reading/date identity while retaining old records. A remount should read existing completion, not invent a new completion. Test two dates, same-date repeat and owner scope. |
| P1 — real full keeps | Shell saves to `UserProfile.saved_item_ids` at `:746`; `savedCards` resolves a capped current pool at `:1205`. `/Saved` only reads SavedItems at `Saved.jsx:36`. | Resolve real legacy kept IDs beyond the loaded engagement window and make the full destination display both existing stores deliberately. Preserve all IDs. Do not silently migrate/delete or count only the displayed ten. |
| P1 — exact Planner return | `/Planner` renders PlannerEliteShell (`Planner.jsx:447,1242`). Its adapter at `PlannerEliteShell.jsx:165` drops existing source/ref/notes; edits at `:230` overwrite notes. | Preserve provenance through load/edit and add an allowlisted ref resolver before introducing more scheduling. Use existing PlannerItems.source/ref; no schema needed. Prove Books return first, then exact public Sky lesson return. |
| P2 — usable compatibility links | `SkyMovements.jsx:244` uses `btoa(name|birthday)` and silently catches clipboard failure at `:247`; raw calendar parts accept impossible dates. | UTF-8-safe URL payload, valid calendar date, accessible input names, visible copy result/manual fallback. Round-trip Arabic and accented names, malformed link and 31 February. |
| P2 — meaningful shared destination | `SkyFocus.jsx:272` shares homepage URL. Current selected demo Lounge/Jess wiring works, but it carries only a short headline. | Public lessons get exact stable lesson references; owner-private reading stays owner-private. A public link must show its lesson, not imply access to another woman's personal reading. |
| P2 — exact old reflection return | `DailySkyLesson.jsx:128` opens `/Journal`, not the existing note. JournalHub only explicitly handles composer and witness/twin at `:226`. | Add a narrow owner-checked existing-entry route if this atom is included; otherwise label the current destination honestly. Never duplicate the note to simulate a return path. |
| P2 — Jess receives the content | `Layout.jsx:37` accepts prompt/initialPrompt; some older ContentActionBar callers send context. | Pass the actual short prompt/reference through the accepted interface. Selected Sky already uses prompt; avoid breaking it while repairing later Read actions. |
| P2 — Listen / Good life truth | `ListenFocus.jsx:32,71` repeats a featured video in its watch shelf when audio is absent, and says every item continuously plays. Good-life `glTick` marks done before awaiting save (`shell:816`). | De-duplicate within a directed page; describe playable media vs show link correctly. Separate “planned” from “done”; await save with rollback/retry. |

Red/white naming note: source proves an internal contradiction, not which folklore convention is authoritative. That decision requires the cited research gate. The old classifier's data can be rendered as observed phase counts without borrowing its personality claims.

## Existing connectivity graph — practical, not a new social system

`Sky lesson (versioned public key)` → owner SavedItems / JournalEntries → Yours / Journal already exists. Public Community rooms, consent-based DM requests, participant-only messages and PlannerItems also exist. Finish their exact return paths rather than add parallel systems.

1. **Lesson → editable Community composer:** one short “Bring this to the lounge” action beside the current lesson, not another subsection. Include the exact public lesson title/key/URL and a blank space for her own line. `Community.jsx:3171` accepts only lounge/love/money/style/lighter/health. Current `lounge` is valid; legacy `the-sky` is not. User still presses Post. Private note, cycle timing and chart data never silently travel with it.
2. **Community → accepted DM → same lesson:** existing post-card Ask to chat privately calls `dmApi.request` with `target_post_id` (`Community.jsx:302`); server resolves recipient and requires consent. Use this existing graph. Once a conversation is active, an explicit message can contain a safe public reference using existing Message.body. A composer prefill and safe allowlisted link rendering are UI repairs; current Message/CommunityPost schemas contain no typed artifact object. Do not pretend structured attachment support exists, or invoke arbitrary-recipient chat from Sky.
3. **Lesson → chosen Planner slot → exact lesson:** preserve source/ref in Planner first. Then schedule the exact public lesson in a short inline date/time choice with existing PlannerItems; acknowledge only a successful write, prevent repeated-tap duplicates, and return from its block to that lesson. No generic “go to Lifestyle” substitute. Retain existing notes conventions during edits.
4. **Today / Jess / Garden:** consume the same lesson key and actual owner keep/reflection/read state. Avoid a second lesson catalogue, fabricated recaps or an additional notification system. The held reading nudge remains held. Jess should receive the title plus the user's question, not generate a story about her.
5. **Cross-section language:** the reusable action is a real object with provenance, not a reusable generic card. Read's object is an article/paragraph; Listen's is a real episode/time; Books' is a chapter/checkpoint; Good life's is a chosen action/plan; Yours retains those exact objects. Each may offer a contextual social action where there is something worth discussing, rather than five social buttons on every card.

Micro-atom delivery: map object → current state → short action → destination → owner/read/write boundary → return path → error/no-auth/empty state. Brainstorm and research that atom, build it, verify actual taps and pixels at 360/390/430, record P0/P1/P2 evidence, put its preview/research/gaps in Ideas · Dev. Repeat; do not fill the page with placeholders for the entire graph at once.

## Remaining Lifestyle order and creative constraints

After Sky: Read → Listen → Books conformance pass → Good life → Yours. Each keeps header + focused section rules but chooses its own composition. These are design briefs, not approval to replace functionality:

- **Read:** an editorial reading margin, pressed iris and imperfect paper marks, a genuinely ranked leading read and the actual last-open paragraph. Current `articleCards` is a capped engagement pool (`shell:947`), despite the Read comment calling it ranked; fix the data claim before saying “chosen for you”. Make the two focused actions resume/read and real keeps, with the choice close to the content.
- **Listen:** a listening nook with bluebell curves and a small moving sound detail tied to actual playback. Resume a real episode/time; watches can occupy their own compositional movement without duplicating the hero. External shows get “Open the show”, not a pretend player.
- **Books:** retain the accepted open-book/table/vase direction. Carry it down through bookmark edges and one purposeful upside-down book detail; not a pasted image repeated on each card. Real chapter/club/shelf state leads the page.
- **Good life:** a quieter chamomile still life whose small pleasures become actual plans or actions. A tea-ring edge or scattered leaf may connect movements. No claims that tapping Save means she completed it; no pile of permission copy.
- **Yours:** a forget-me-not drawer of real keeps, allowing the object itself to tell where it came from. Good order and exact return beat another summary and category maze. Different materials/spacing from Sky, same typography and subtle garden world.

Sky's selected hybrid should combine the living observational garden with Star Press's editorial rhythm: Moon/orbit/small shadow movement in the header; quiet petals or stems at meaningful edges; lesson typesetting that feels printed; one authored celestial ornament across the page. Every ornament must blend through colour, fade and material, reserve readable space, honour reduced motion and avoid moving interactive targets. Changing flower position alone is not a new design.

Voice examples are short and specific: “Keep this little sky fact”; “The Moon has phases. So do Tuesdays.”; “One line for your notebook?”; “Take it to the lounge”; “Your next page is here.” Keep educational content accurate. No design explanations in product copy, imaginary-scene disclaimers, long permission speeches, fake intimacy or astrology certainty.

## Held / beyond this cycle

- No main promotion until Halli's explicit go-ahead.
- No Plus reactivation, purchases, new paid products, new scheduled job or held reading notification.
- No new Base44 function names; existing entities and dispatchers suffice for the repairs above.
- Typed social artifact schemas, remote migration of two keep stores, classifier historical naming changes and monthly generation policy need explicit documented scope; do not silently apply them as styling.
- The report is not a live audit pass. Owner writes, 18+ Community entry, DM consent, WebKit pixels and cross-account returns need separate evidence from the production-owning agent. Never attest age, send another person a message or purchase on Halli's behalf.
