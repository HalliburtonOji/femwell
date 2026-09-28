# Sky preview verification — 28 September 2026

This is a partial preview verification, not a full Sky sign-off. Source build `90fef6d` deployed as `index-BdjvhrFU.js`; viewport repair `b94aef5` deployed as `index-CltNMQ0M.js`. Final publication details belong in the latest STATUS block.

## Automated and source checks

- Node24 production builds pass. Full Vitest suite: 36/36, including eight new meaningful action tests: direct/disabled action, exact selected item after closing, no replay after cancelling, Escape/X focus restoration, empty collection, custom content, close-before-open handoff and updated data while open.
- Explicit `previewActions` defaults off and is enabled only by LifestyleBespokeDemo. Chart portal is also preview-only. Main Lifestyle has not been promoted. No backend functions, schemas or billing configuration changed.
- Saved reads use the actual article/daily_story mapping; all saved items are available through the action rather than the ten-item visible shelf limit.

## Actual signed-in browser interactions

| Check | Evidence / result |
|---|---|
| Sky deep-link | Matching Sky selection and Morning glory header observed. |
| Ask the sky, 360/390/430 | Real taps focus the labelled question textarea and bring it into view. No question submitted. |
| Edit chart, 360/390/430 | After viewport repair, existing chart editor and Close/Cancel/Update controls visually fit. Cancel tapped successfully at all three widths without saving. |
| Section return | Books → Sky does not replay the prior chart action. |
| Read | Choose a read opens actual reading choices; Saved reads opens honest empty state for this account. |
| Listen | Both pills open their separate actual episode/video collections. Playback/external availability not certified. |
| Books | Choose a book → selected Pride and Prejudice opens its exact existing content; Today's chapter opens today's actual chapter sheet. No read mark submitted. |
| Good life | Time picker opens; selecting Fifteen minutes changes its suggested reading. A small joy → selected walk opens its existing activity with save action. No Planner/save write submitted. |
| Yours | Your saved entry switches pills; Open your saves and Continue reading show honest empty states for this account. Populated resume persistence not tested live. |
| Ideas | Actual Ideas card opens the public review; its preview link opens Sky. Dedicated Sky dashboard group added after this check, to recheck after final deploy. |
| Review report | Phone rendering inspected at 360; document has no horizontal overflow, wide audit tables and navigation intentionally scroll inside their own containers. |

## Defect caught and corrected

AX showed the old birth editor as open, but pixels showed only a dimmed page. DOM geometry proved a transformed animated ancestor made its fixed overlay span the entire long page: 6902px high, with dialog starting at y5662. The preview now portals the same editor outside that ancestor. Re-tested with real taps and screenshots at all three widths. This is why an AX success alone is not a pass.

## Independent visual review

Ms Verify inspected six private captures: chart viewport repair and focused question field at each width. Verdict: visual pass with one P2. The floating Ideas · Dev pill overlaps part of question history at 360/390; this remains open. Captures contain test-account data and remain ignored under `.tmp/sky-review/`, never published in the public report.

## Remaining limits and findings

- This was a Chromium in-app browser at phone-sized viewports, not a physical iPhone/Safari or keyboard-open test.
- Birth editor keyboard trap/restoration, no-chart setup, invalid dates, changed chart, account switching, empty/error/stale readings, preferences, saved history, compatibility, payment fulfilment, Garden and cross-app round trips still need their planned tests. No transaction or profile change was made to obtain a pass.
- Existing Good-life time lens offered a 45-minute episode in its few-minutes band. Record for that section's deeper repair; the new action correctly exposes the existing picker, but recommendation duration is not certified.
- Existing expanded readers and chapter sheet retain their earlier design language. This action pass does not claim those sections' redesign is complete.
- Source audit's P0 candidates require authorised identity/isolation verification; no exploited exposure was established. P1 fabricated history, incomplete feature data and contract/provenance gaps remain open.
- Read remains queued behind Sky. All main-page promotion and previously held product decisions remain Halli's.

Brand references: §2.7 clean treatment, §6.7.0a two context-aware pills, §11 Ideas verification lifecycle, §17/§19.9 preservation, §19 section-specific functionality. This scoped action pass respects these; the full Sky audit records remaining nonconformance rather than certifying the whole page.
