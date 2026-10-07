# S02 actual podcast provider regression gate — 7 October 2026

Mr Tester; isolated committed claim **61dce19**. Owns this report and `src/components/lifestyle/listen/PodcastPlayerProvider.test.jsx`; no production code, backend, schema or live rows changed. Root reported the full pre-authoring baseline **451 tests /37 files green**. Git preflight at61dce19 clean, two claimed commits ahead of origin; Vitest/React Testing Library/jsdom already configured.

## Reproduced baseline

Bundled Node invoked the actual provider test with `--maxWorkers=2 --testTimeout=15000`; initial23 cases exit1,19failed/4passed; expanded boundary gate exit1, **23 failed /5 passed /28 total**,3.01s. All cases import and render the real provider. SDK reads/writes and HTML media playback are simulated; the audio is a real `HTMLAudioElement` with real EventTarget events. Deferred promises reproduce races without network calls. Module state resets, mocks reset, singleton DOM removed and timers restored between cases.

Root specifically authorised leaving the new regressions active/red during immediate repair, rather than marking expected failures and hiding the active build gate. No production fixes by Tester.

### A03 — latest intention and saved place

- **Gesture:** delayed saved lookup leaves `audio.play` called0times, expected1 immediately. Source at baseline287–338 waits for saved lookup before play; preserve native gesture by starting promptly and let resume lookup refine place only when still current.
- **Cached metadata:** metadata arrives before saved read resolves; final time0, expected68. Listener is attached at321–325 after metadata already happened. Check readyState as well as future event, synchronise visible position.
- **A→B:** delayedA changesB currentTime24→68. **A→Close:** late result restarts paused audio after player cleared. Guard source/request identity and clear pending listeners when intention changes.
- **Pause/seek:** late resume overwrites deliberate pause or position32 with68; do not restart or seek after new intent.
- **Auth:** owner changes during saved lookup; previous owner’s68 seconds applies. Confirm current owner before applying saved position.
- Normal metadata-after-lookup also needs visibleposition68, not only the audio seek. A rejected oldplay promise must not write an error over the newer episode’s successful playback.

### A04 — acknowledged owner-safe persistence

- Failed lookup at104–118 currently becomes[] then pause/Close creates2rows. Failure is not confirmed absence; no write follows failed or malformed collection.
- null/non-array/[null]/foreign owner/wrong episode/identity-only records all reject in acceptance. Baseline instead creates/updates or resumes them. Validate actual array rows and exact owner+episode identity before use.
- New episode after auth switch still queries mount owner from88–94. Resolve current owner for each operation; preserve anonymous playback without cross-owner history.
- A second auth boundary changes owner while a persistence read is pending: baseline updates the old owner’s row; skip mutation after ownership changes.
- Deferred pause lookup plus Close creates prematurely while first absence unconfirmed. Serialise acknowledged writes per owner/episode, then re-read existing row; one create and later update. The deployed field contract, agreed by root, is `updated_at`, not current `last_played_at` at112. Test checks acknowledged payload field only; no schema addition.

### A04 — honest transport and finite state

- Infinity metadata leaks to contextduration at174; malformed seek must also remain finite. Unknown duration remains honest, no fabricated end-time.
- Current onPlay marks audible playback without waiting/playing state, and onErr at194 only sets a message. Agreed acceptance: `playbackStatus` idle/loading/buffering/playing/paused/failed/ended; existingisPlayingfalse duringwaiting andtrue onplaying, falseonerror.
- togglePlay at343–347 swallows a rejected play promise. Retry must expose failure and stopped state rather than a silent action.

## Existing capabilities protected —5 baseline passes

- Same episode resumes in place without source reload/new resume lookup.
- Completed saved episode starts afresh.
- One live audio element, episode, position and preferred1.5×rate survive provider remount.
- Existing one-minute sleep fade, cancel restoringvolume1, and timedpause restoringvolume1 remain.
- Anonymous playback remains available without owned resume/filter/create/update calls.

## Scope and handoff

Root repairs the scoped provider and consumers, then Tester re-runs this unchanged acceptance gate and records green proof. Current test source is not an end-to-end mobile or production-write claim. Native Safari gesture policy, real CDN buffering/network errors, background/lock-screen MediaSession, actual deployed RLS/atomic uniqueness and authenticated production writes remain separate integration proof boundaries. No source/transcript rendering or reader navigation coverage in this file; those remain root/independent critic work.

Conformance: mapped S02A03/A04 in BUILD_PLAN/run0002; **Bible§10.5.20–21** authorised bounded repairs/coherent stage, **§11.0–2** researched atom/regression gate, **§13–15** meaningful interaction/error proof, **§17.3/§19.9** preserved controls/singleton/sleep, **§19.8** correct owned resume/write contract. No satisfaction score or generic feature quota.

**Done this pass:** actual provider gate, red reproduction and concrete fix brief delivered to root.

**Queued:** implementation by owning root, green reproof, source/UI/backend integration and mobile evidence, final release report.

## First repair reproof and additional boundary audit

Root first implementation passed **30/30**,2.33s: original strict28 cases plus newest trusted duplicate and Close duringfade/newplay volume restoration. The exact query assertion changed to `{user_id,lifestyle_item_id},'-updated_at',10` to match the deployed timestamp and root’s newest-duplicate reconciliation; owner/identity acceptance remains strict. Received older19second row before newer87second row still resumes87 and later updates the newerID.

Read-only source review and four additional cases then produced **32passed/2failed/34total plus1unhandled rejection**,3.40s:

- **Metadata event auth rejection:** real listener calls async restore; rejected auth escapes its body and leaves `progressError` null. Test sees0safeaudioseconds but no recovery message; Vitest captures one unhandledrejection. Catch the event callback’s auth/readiness error, retain playback, expose saved-place recovery, no false sync.
- **Provider remount ownership:** live singleton/audio/currentposition42 survives, but `episodeOwnerRef` is not restored. Pause invokes nofilter/write. Restore/revalidate actual current ownership without inheriting a prior account’s history.
- **Green:** failed acknowledged write retains snapshot43; retry uses43 rather than newerunrecorded99 and clearsprogressError only after acknowledgedupdate. Undefined create acknowledgement remains unsynced until acknowledgedretry.

These boundary tests stay active until root repair. No production edits, account rows or live requests by Tester. Root notified with reproducible source branches.

## Independent critic’s two follow-up edges — reproduced before repair

Root fixed the metadata-listener rejection and remount-owner branches; the strict34-case gate passed again. The independent Critique Director then identified two more asynchronous ownership/readiness edges. Tester reproduced both against the real provider before root’s next patch: **34passed/2failed/36total**,2.48s, exit1.

- **Same episode, different account:** ownerA’s position68 is already loaded; pause; ownerchangesB; play the same episode. Current implementation sets the new owner but computes `resumeNeeded` before auth comparison and makes **0 resume queries** forB. Acceptance requires B’s exact owned lookup, resume24 and later persistence24 underB. Old position must not flow into B’s history.
- **Stale readiness after auth await:** E1confirmed[] enters deferred secondauthcheck; E2starts and awaits its savedplace; E1auth settles. Current check evaluates `isCurrent` beforeawait and then marks progressready with E1’s no-row result. Actual E2timeupdate12 subsequently **creates an E2row before its savedplace arrives**. Acceptance rechecks intent after everyawait, so no persistence/second E2query until its own lookup confirms readiness; its eventual owned42 resumes correctly.

Both active regressions delivered to root, no production edits. Earlier34 cases remain strict and green; no `fails`/skip markers conceal these release gates.

## Final bounded media queue/retry review — before root patch

Independent rerun confirmed the two previous edges repaired: **36/36passed**,2.71s. Per the independent critic’s queued-media-event hypothesis and explicit root request, Tester added only the relevant final three combinations. Against that implementation: **36passed/3failed/39total**,3.97s, exit1.

- **Queued old Pause:** nativepause sets `.paused=true` synchronously but event arrives after explicitsameepisodePlay has restarted audio and retried a previouslyfailedsavedlookup. Old pauseevent cancels currentresume; final0 instead of68 and stalepausedstatus. Accept current native `.paused`/episode state before applying a queuedevent.
- **Media error + changed owner:** A’s localerrorretry position68 is captured; currentB’s realownedlookup returns24. Retry currently prefers A’s68. Owner-bound retryposition must not be inherited byB; expect24.
- **Successful savedlookup retry:** previouslookup failed; deliberatePlayretry nowresolves68 withno pendingwrite, but `progressError` continues “Your saved place couldn’t load.” Clear the resolvedload-specificerror without hiding genuinelyunacknowledgedwrites.

FakeHTMLAudio `.load()` now also clears the simulated mediaerror, matching the native resource reset rather than retaining impossible staleerror. All prior36 acceptancecases remain green. No additional unrelatedsweep, source edits or realaudio/fault/write claims. Root notified; final greenreproof pending.

## Final independent reproof —41/41 green

Root fixed queued staleevents, owner-specificretry and resolvedload-error copy. Tester independently re-ran the strict39 cases: **39/39passed**,3.53s, no unhandlederrors. During that bounded source reproof, the newowner guard revealed one directlyintroduced sameowner regression: clearing `episodeOwnerRef` before authcomparison incorrectly treats even sameownererrorretry as changedowner. The added40thcase reproduced actuallocal74→olderpersisted68: **39passed/1failed/40total**,4.07s, before root’s nextrepair.

Root captured the retryowner **before clearing the source**, then allows localretryposition only when currentauth still matches that capturedowner. Tester expanded that same regression to local43 versus older20 and confirmedabsence[]; root’s patch had already landed before those two exactvariants ran, so no claim that both variants were independentlyred. The original74/68case is the actual pre-repair reproduction.

**Final independent gate:41/41passed**,4.77s, exit0, no unhandlederrors. Both sameowner43branches and changedownerB24 remain strict; all earlier acceptancecases preserved. Scoped ESLint testfile check also exits0 withnooutput. Real-provider imports, mockedSDK/media work, realHTMLElement/events, isolatedmodule/mocks/timers cleanup unchanged. No skip/fails markers. Covered scopes: cached/futuremetadata, latestplay/close/pause/seek/owner/authreadiness, stalepromiserejection/queuedpause, malformed/foreign/failedlookups, newesttrustedduplicate, serialacknowledgedwrites/retry, finiteunknownmedia, actualplaying/buffering/failurestates, sameepisode/completedrestart, anonymousplayback, singleton+ownedprogressremount, rate/sleepfade/Closevolume and load-error recovery.

**Limits remain:** controlled jsdom/media events are not nativeiPhone/Safari autoplay, actualCDN buffering/fault injection, background/OSMediaSession, end-to-end mobile navigation, deployedRLS/atomicuniqueness or realauthenticated production-write proof. Those integration/runtime surfaces belong to root/MsVerify/independentcritic and release ledger; no private rows or paid/social writes by Tester. No production changes, commits or deployments by Tester.

**Done:** owned regressiongate and report, red→green reproduced, final41/41 independentproof.

**Queued:** root’s whole-stagebuild/mobile/runtime/Ideas/release evidence. Tester returns ownership of the two files to root; root releases the committed HANDOFF claim alongside stagecompletion.
