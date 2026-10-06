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
