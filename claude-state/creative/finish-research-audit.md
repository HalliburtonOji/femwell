# Finish pass — adversarial source/regression audit, 7 October 2026

Read-only implementation audit by Mr Fix-it / Ms Verify; edits limited to delegated dedicated tests and this report. Root owns source fixes and native/deployed verification. Audit followed the actual current source while root worked; superseded observations are explicitly corrected below.

## Current findings

**P0:** none demonstrated in the inspected source or isolated regressions. This does not certify deployed rendering, authentication or real remote writes.

**P1 — open at this report's snapshot:**

1. `LifestyleEliteShell.jsx:1311–1322`, missing-source profile keep removal: `_raw` is absent for an unavailable source, so the `_keep` branch deletes physical SavedItems records and removes the display row but never updates `_keep._profileId` / `saved_item_ids`. A profile-only missing keep is acknowledged as removed and returns on reload. Preserve the profile reference through unavailable states and remove both stores before acknowledging; read back any successful portion after a partial failure.
2. `LifestyleEliteShell.jsx:882`, Gutenberg callback mismatch: `openBook` accepts `it.gutenbergId` but constructs the query from `_gutenbergId` only. A classic card uses the accepted property and can route to `gutenberg_id=undefined`. Resolve every supported id field before generating the precise reader URL.

**P1 — found, fixed by root, checked again:**

- `LifestylePlanSheet.jsx:15`: chosen 5/15-minute duration originally encoded as `d:15 · …`, incompatible with V2's semicolon control parser. Root now emits `d:15;…`; all four chosen durations pass plannedRows → actual V2 adapter regression.
- `LifestylePlanSheet.jsx:20,43–52`: id-only/wrong-owner/wrong-source acknowledgements and a changed account during a checkpoint batch could report completion. Exact owner/fields and created-id read-back validation now gate acceptance. A submitted-id map prevents duplicate create on an uncertain acknowledgement; accepted entries remain untouched during Retry. Wrong created id originally failed its regression; root's `actual.id===saved.id` fix passes.
- `LifestyleEliteShell.jsx:1164,1173–1178`: quiet-hour plan reference had no return source, and a rotated-out permission fallback substituted its sentence for its actionable quiet-hour title. Root added the quiet-hour source and preserves the original actionable title/kind. The fallback can now resolve outside the daily selection.
- Earlier concern that physical-only saved rows were not recognised by the toggle is **withdrawn**: current `isSaved` at line618 includes `archiveKeeps` as well as profile ids.

**P2:**

- `ListenFocus.jsx:65` originally labelled an active global episode as Today's watch when the feed had no audio; root now keys the title to the featured content type. Rechecked current source.
- `expandCards.jsx:820,920`: an already kept item still has accessible label `Save` while its action removes the keep. Consider a truthful removal label/pressed state. Existing visual and persistence controls remain present.
- The existing Planner duplicate `boxSizing` warning is outside these atoms; no body/header controls removed to silence it.

## Evidence added

**25 tests pass across `finishLifestyle.test.js`, `LifestylePlanSheet.test.jsx` and `FinishBodies.test.jsx`; targeted lint passes.** Meaningful interactions use the real CoverCard/ExpandDetailCard and body components: direct Read versus separate Details; current global episode precedes new feed cards and toggles the same player; planning versus joy details preserves all 11 room doors; physical-only archive return and both-store duplicate reconciliation; pending save and false acknowledgement; exact time bounds; stable authored identity across changed deck positions; chosen time/duration/spacing; partial plan Retry; unknown acknowledgement read-back Retry without duplicate create; wrong owner/source/id rejection; between-row account switch; pending chosen-time controls locked.

Archive reconciliation retains every physical `_savedRecords` entry and `_profileId` for explicit removal. Read keeps resume, featured/fresh/stories and full tools. Listen keeps podcasts/watches and the global player. Good keeps the time lens, joys and all existing room links. Yours keeps all recognised groups, extra keep kinds, phase discoveries and separate tools. No module-scope central-shell import or newly introduced TDZ was found in the reviewed diff.

These tests prove source contracts and local action state, not rendered iPhone pixels or authenticated persistence. Root still owns 360/390/430 real taps, native source destinations, chosen-plan read-back, both-store removal read-back and the final P0/P1/P2 closeout. Current Bible/new direction takes precedence over older agent workflow notes; main Lifestyle promotion remains held for Halli.

## Correction / P1 closeout — later in the same cycle

Both P1s above were fixed by root and re-proved; the earlier snapshot is retained for provenance.

- **Missing-source profile-only removal:** current `LifestyleEliteShell.jsx:1312` routes any Lifestyle `_keep.item_id` through `toggleSave`, even when `_raw` is absent. A new integration regression mounts the actual selected owning shell, loads a profile-only unavailable source, opens its real Details, presses the existing save/removal control, and requires `UserProfile.update('profile', {saved_item_ids: []})`. It passes; no source record or physical SavedItems deletion was invented.
- **Gutenberg precise route:** current `finishLifestyle.js:13` validates all four actual id placements; the shared `openBook` consumes this validated href at shell line883. Eight new cases prove direct/raw `gutenbergId` and `_gutenbergId` resolve 1342 exactly, while missing, zero and injected values never yield a fabricated URL.

**Full-suite investigation:** Community.books and FinishBodies passed together with one worker and bounded test timeouts. A verbose one-worker full run completed in 96.49 seconds: 30 files / 342 tests passed, with only a transient test-fixture syntax error from this agent's concurrent edit. That syntax was immediately fixed; FinishBodies then passed all seven cases, including the real owning-shell removal above. No production render/effect loop was reproduced. The run log is `C:/Users/Halli/femwell-handoff/finish-testhang-full.log`; isolated fixed-file proof is `finish-reproof.log` beside it. JSDOM's unimplemented Window.scrollTo messages are diagnostic noise rather than evidence of an app loop; tests and assertions were not weakened or skipped. A final unchanged, two-worker full run is being recorded separately before its result is appended.

**Final unchanged full-suite result:** **31 files / 349 tests passed in 48.85 seconds**, two workers, 10-second per-test and hook limits. Complete proof: `C:/Users/Halli/femwell-handoff/finish-testhang-final.log`. No hang, unresolved P1 in the reported source atoms, skipped test, weakened assertion or new application edit. Dedicated-test lint also passes. Native/deployed/authenticated proof remains explicitly separate.

## Native route correction — Clipboard prerequisite, 7 October

The preceding source snapshot did not establish default Planner coverage. Root's native audit found the default route imports `PlannerV2ShellClipboard` under the `PlannerV2Shell` alias (`Planner.jsx:48`). The prior sibling-module tests therefore could not prove that live surface. Native five-minute joy plan appeared on the timeline, but its editor lacked the precise duration read-back and exact return. This is a P1 and an audit correction, not a reason to switch the approved default design.

Claim `93b7f8e` covers the port into **the actual Clipboard module**. Shared adapter at lines 55/661 now preserves source/ref and encoded duration; update at 1233 preserves the original minute, notes, type/anchor, recurrence and identity before closing. Exact returns remain separate from timeline edit controls (5350), Plan-a-day completion (1607), tomorrow row (4887) and busy editor (5509). Dynamic duration options include the current value rather than visually selecting 15. The existing early-hour data is included in the timeline without removing the 6–23 rail.

The real Plan-a-day regression additionally proved a pre-existing P1: setting `nextDone` inside a state updater could construct the server payload before the assignment, writing false when the user checked the item. The same-file correction at 1523 computes it from the actual row first. Failed editor save/removal retains the draft and source, with an identical retry rather than silently closing.

**Five suites / 35 dedicated regressions pass in 26.06 seconds**, including **six new actual Clipboard cases**: real tile → 5-minute editor→save with 19:10 round-trip; failure→same-payload retry; unusual 7-minute selection; failed Delete; actual Plan-a-day completion and exact joy; tomorrow canonical club. Targeted implementation/test lint and whitespace check pass. Log: `C:/Users/Halli/femwell-handoff/finish-clipboard-return.log`. No assertion was weakened. Root's browser test originally created 19:00; 19:10 is a local round-trip fixture only. Deployment/authenticated pixels and actual destination re-proof are pending root; pre-existing identical duplicate `boxSizing` remains P2 outside this atom. No new function/schema, removed feature, route flip or Lifestyle promotion.

## Final complete regression proof after Clipboard and last body refinements

Root's later failed run reached a complete 32-suite result. Its owning-shell case failed at the initial asynchronous `Details & tools` query, before the saved-toggle interaction. Bundled Node 24 reproduced that one-second archive-loading deadline in isolation. The fixture now explicitly requires the actual owner's profile read, then allows the existing Details query five seconds for archive resolution. It still presses the truthful `Remove from saved` control and requires the same exact `UserProfile.update('profile', {saved_item_ids: []})`, with no physical record deletion. The expanded save case additionally requires the saved toggle's `aria-pressed=true`. No application source was changed to make these checks pass.

After root's final CSS/copy/save-label changes and the Clipboard port, **all 32 files / 355 tests pass in 78.18 seconds** with bundled Node 24, two workers and ten-second per-test/hook limits. Full proof: `C:/Users/Halli/femwell-handoff/finish-final-node24.log`. There are no skipped tests or weakened assertions; the owning-shell fixture's lint passes. No hang or production loop was reproduced. The small set of JSDOM scroll/navigation warnings and the pre-existing duplicate style key remain explicitly separate from native browser verification. Root still owns deployed/authenticated re-proof and the final ship decision.
