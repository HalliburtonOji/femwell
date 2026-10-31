# LC27 · approved Lifestyle consolidation · 31 October 2026

## Motherboard and boundary

Main `/Lifestyle` and the Calm demo already use the same six accepted room headers and clean shell. The remaining approved gap is the *journey*: Books choice still uses a generic expansion on main, Yours shows an older empty state, and several in-app room exits reload the document. The existing reader, 11 Good life rooms, club, saves, Sky, Planner and Today stay reachable. Six unreviewed original Read drafts and the account voice default stay in Ideas. No new entity, function, content generation or paid call is in this batch.

| Atom | Actual source → tap → destination/return | Acceptance |
|---|---|---|
| A · Books choice | Existing classic + owned shelf rows → Choose a book → exact serial/Gutenberg/book source | Main shares accepted labelled picker and direct opener; chapter, club and whole library retained. |
| B · Yours empty | Owned keeps/Sky results + wider library → Yours | Main uses accepted calm empty composition; loading, partial error, retry and discoveries retain priority. |
| C · In-app transitions | Good life 11 rooms, Sky tools, Books club, Saved Back → router destinations and exact origin | Avoid document reload and retain query, Back, source and external exits. No social post or age action. |
| D · Reader return | Observed scroll → route Back → owner-scoped local place | A route reset cannot overwrite a read place with zero. |

Focused research: [React Router `useNavigate`](https://reactrouter.com/api/hooks/useNavigate) is the established imperative route transition for button actions; we apply it only when the shell is routed and retain the standalone fallback. [NN/g interaction cost](https://www.nngroup.com/articles/interaction-cost-definition/) describes navigation effort; the inference here is that preserving the app document and returning to the exact room reduces that effort. [W3C WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) informs reachable mobile targets. Existing [LC05 research and source inventory](lifestyle-content-2026-10-14.md) supplies the room-specific content evidence. These sources do not prove a satisfaction gain.

Gate: source and unit tests, built bundle, actual 360/390/430 room→opened destination→Back, independent P0/P1/P2 catalogue and deployed reproof. Preserve owner writes and history. Cost delta expected: no extra reads/writes; confirm route changes do not trigger new full document loads in measured browser evidence. Main promotion is limited to these accepted parts; proposals for other pages remain separate.

## Local result and independent critique

The approved Books chooser is now shared by demo and main. Its full classic and shelf pools retain their distinct serial/Gutenberg/stored-book openers. Main Yours uses the accepted empty state while keeping loading, partial error, retry, saves and wider-library branches. The routed internal exits now include Good life's actual `FocusedLifestyleRooms` overlay, its Journal and Carry it on links, Books club, Sky Reflect/Discuss/Health/exact reading link, Saved Back and legacy QuickRow. External publisher links and modified anchors retain normal browser behaviour. The Read route records observed scroll before route teardown and tests its owner-scoped position.

Tests: four scoped files **148/148**, including previously failing routed Read Back/scroll cases; build and diff check passed. Controlled headless Chrome with mobile touch viewports **360/390/430**: main Books chooser → exact `gutenberg_id=1342` reader → Back to Books; Saved → exact Yours; Good life Becoming → Journal. These in-app taps added **zero document loads**, with zero horizontal overflow and page errors in sampled paths. Mocked content included a FICTION row in the chooser’s More choices and its in-place chapter. The independent critic reproduced **P1** Good life overlay Journal hard reload at 390, then re-proved its repair at all three widths. Final scoped catalogue: **P0 none; P1 none remaining; P2 none reproduced**. Viewed Good life overlay and Saved pixels showed clean surfaces, not a burnt underlay in those opened states.

Limits: controlled auth/content, Gutenberg text unavailable in fixture, no live saved-reading Sky, club age gate, physical iPhone/WebKit, owner-write or complete 11-room tap sweep. No measured database/paid-unit change or user-capacity claim. The 11 rooms, readers and archives remain accessible; the next larger build should deep-audit their real opened owners and right-person content, not infer all-app completion from this sample. Conformance checked against Brand Bible §§2.7, 10.5.22–23, 10.5.80–82, 11, 17.3 and 19.8.
