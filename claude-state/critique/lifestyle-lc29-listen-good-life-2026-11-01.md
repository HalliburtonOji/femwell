# LC29 — Listen first choice and Good life shared source · 1 November 2026

Status: candidate until normal push, Base44 site deploy and deployed mobile reproof. Claim `558b7a0d`; source `d76af1a7` plus seventh-row follow-up. Main route is `/Lifestyle`; Ideas receipt is `/lifestyle-content/index.html#lc29-listen-rooms`. Scheduler remains paused.

## Motherboard, complete touched inventory and mapped atoms

| Atom | Source and opened journey | Preserved depth | Candidate change |
|---|---|---|---|
| LC29-A01 | Listen `grouped.audio` → `audioCards` → first action sheet → `ExpandDetailCard`/FloraAudio | Existing RSS rows, static show directories, inline/global player, Details, Save, publisher exit, watch and full `WatchListen` directory | First chooser accepts timed `audioSrc` rows only; one qualifying row opens directly. Search playable rows before six-row cap; retain old first six in Browse. |
| LC29-A02 | Nine dedicated Good life full routes → identical `LifestyleItems.filter({status:'PUBLISHED'},'-engagement_score',500)` → each room's distinct lens, shelves, detail, save and onward actions | Exact 500-row limit and sort; room-specific filters and all 11 rooms; Mirror's distinct 400-row query | Shared TanStack request with 30-second freshness; no schema, new function or saved-content change. |
| LC29-A03 | `/Becoming` catalogue failure → lens/shelf/Retry | Questions, Journal action, full shelves, detail and saves | Failed read has visible error and Retry; auth/profile read is separate so Retry does not repeat it. |

Source audit: `audioCards` contained up to six published feed episodes plus six static external show directories. The first action offered both, so a chosen directory required another source and episode selection. The full Listen page and Browse retain the directories. Ten Good life routes fetched 400–500 broad published rows on mount: nine used the exact same 500-row request, Mirror used 400 and Make had no catalogue. Curious also runs a separate 60-row PODCAST request, unchanged. These rows are global published content; `UserProfile`/saves still use their existing owner-bound calls. A cache of a failed request would be wrong; the helper rejects and TanStack retries on the next visit. No source row, archive, feature or secondary return was removed.

## Focused research and design choice

- [Base44 SDK entity methods](https://docs.base44.com/developers/references/sdk/docs/type-aliases/entities) support bounded list/filter work; the nine identical 500-row requests are a local source observation, not an invoice. Base44's [credits documentation](https://docs.base44.com/Account-and-billing/Credits) separates own-database operations from metered backend/integration work; actual account usage and provider costs are unmeasured.
- [TanStack Query `fetchQuery`](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientfetchquery) reuses fresh cached data and a matching in-flight request; `staleTime` bounds reuse. The existing app already has a QueryClient. This permits a short, session-local reuse without a new database, entity or dispatcher.
- [W3C audio-only transcript guidance](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html) is why `audioSrc` plus a duration field qualifies only for first-tap ordering, not a claim of complete accessibility or publisher rights. Episode playback, transcript, source rights and signed-in read-back remain separate proof.

Design: the first action names one job. When more than one real episode exists, the sheet offers concise titles; with one, it opens the exact episode. The room's floral header and inline player stay; show homepages are optional depth. In Good life, the same source rows feed each bespoke room rather than a generic shelf. A failed read is a distinct state, not a claim that the library is empty.

## Checks, cost and independent critique

- Six focused files: **85/85** after seventh-row correction. Final local build `index-BS5SMAZR.js`; scoped lint zero errors, 18 existing unused warnings in the large shell. Deployed proof is recorded in STATUS when complete.
- Controlled Chrome mobile touch at **360/390/430**: Listen chooser opened with two exact timed episodes, no show directory, closed; zero sampled overflow/page errors, one document load. At all three widths, Good life → each of 11 full rooms → named Back passed with no extra document load. Screenshots: `workspace/verify_screenshots/lc29-listen-{360,390,430}.png`; mock account/source, not native iPhone or real media.
- Critic reproduced two **P2** source issues before correction: Becoming's failed 500-row read looked like empty content, and six untimed rows hid a seventh timed episode from the first chooser. Becoming now shows Retry and recovers on the second request. Independent rebuilt mobile reproof at 360/390/430 opened the seventh exact episode, bound the player to its fixture URL, and preserved the first-six and show directories in Browse. **Final candidate verdict: P0 none, P1 none, P2 none**. The mock media URL deliberately cannot stream, so real playback is unproved.
- Controlled Move → Nest → Outside within eight seconds made **one** exact 500-row request across those rooms; other app requests still occur. The test fixture has tiny mock rows. Real response bytes, cold/return frequency, paid function units, external media transfer, invoices and supported-user capacity are **unknown**. Do not claim a money saving or universal performance improvement.

## Self critique and carry-forward

Eligibility still trusts the stored URL and duration; a dead stream or missing transcript can fail at play time. One episode direct action removes a choice sheet but opens the existing detail owner, which must retain all tools and Back. The 30-second edition may display recently replaced published content until its next fetch; publication cadence and actual freshness need a measured policy. Read's six other original essays and shared voice default remain held. Full earlier Lifestyle and legacy secondary audit remains in the rolling plan; this release does not claim the whole app's content is finished.

Conformance: Brand Bible §§2.7, 10.5.22–23, 10.5.29–30, 10.5.81–84, 11, 17.3, 19.7–9. No-strip: static directories, first-six cards, all full room features and history remain reachable.
