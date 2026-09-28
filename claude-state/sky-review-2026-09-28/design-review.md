# Sky craft review — 28 September 2026

**Verdict: BLOCK main-page promotion. Approve the section-aware two-pill direction, subject to real interaction proof.** This is a source-led review, not a live visual sign-off. Parent owns browser verification. Current source proves important features are present in the layout but incompletely connected. A polished screenshot would not close these gaps.

## Preservation inventory

Read `SkyFocus.jsx` and `sky/SkyMovements.jsx` end-to-end. Preserve: onboarding/birth sheet; Jess arrival banner; personalised headline/state; share; chart editing; movement navigation; daily narrative/signature; energy/mood/sound; pressure/trouble observation; Reflect/Discuss/Ask Jess/mark-read; expandable Sun/Moon/Rising; six goddess archetypes; red/white moon; cycle/lunar dial; annual profection; Saturn letter; twelve-cycle diary/right-now/void-of-course; question input/suggestions/answer/history; pairing inputs/results/glossary/share link; monthly Atelier letter/entitlement; three purchase offers; Quiet/Soft preferences; science/privacy footers. Preserve the shell header/controllers, summary/Jess swipe, both action slots, and original chapter/time actions on the landing and Handy paths.

Presence does not establish functional parity: diary, red/white classification and monthly letter currently fail that distinction.

## What is in the way

| Priority | Source evidence | User consequence and required design response |
|---|---|---|
| P0 trust | `SkyFocus.jsx:191–205` constructs twelve synthetic bars and says cycles have been steady. | False personal history. Reconnect `useSkyDiary`; show only actual dated observations and an honest insufficient-data state. Keep the diary feature, never invented bars. |
| P1 | `SkyFocus.jsx:301` always passes `rw={null}`; `:334` always passes `letter={null}` and uses `user.has_atelier`. | Existing users cannot receive their classification/letter. Reuse classification and entitlement hooks, then explicit loading/error/empty/available states. |
| P1 | `SkyMovements.jsx:288–294`, `:373–385` swallow checkout and preference failures. | Taps appear to do nothing or falsely look saved. Show saving/saved/retry; revert unsuccessful toggles; keep typed content. |
| P1 | `SkyFocus.jsx:49–55` independently calculates cycle phase; `:188,285` read-state lives only in component state. | App sections can disagree; returning forgets completion. Use shared cycle and reading state. |
| P1 | `SkyMovements.jsx:239–243` copies current path with only `?compat=` and silently ignores failures. | Fresh recipient may never focus Sky; Unicode names can fail encoding. Share link must resolve directly to the pairing, with visible copy failure and manual fallback. |
| P1 | `SkyMovements.jsx:169,250` have placeholder-only fields; `:342–350` toggles lack state semantics. | Labels disappear; assistive technology cannot identify switch state. Add persistent labels and switch semantics. |
| P2 | `SkyFocus.jsx:66–70` hides horizontal scrollbar; many `SkyMovements` labels are 10.5–11.5px. | Last movement is undiscoverable; phone text too small. Wrap compact movement controls or provide a visible overflow cue, and obey chrome floors. |

Also audit the unverified “written, not generated” and named professional credentials (`SkyMovements.jsx:280–302`) before selling. They are product promises requiring evidence, not decorative copy. Do not silently remove paid features; make fulfilment and availability truthful.

## The focused pills

Current shell `LifestyleEliteShell.jsx:1422–1426` hardcodes chapter/time regardless of focus. **Sky proposal: plum “Ask the sky” and gold “Edit your chart”.** The first focuses the real question field and exposes its movement without submitting; the second opens the existing BirthDataSheet directly. Register actual component actions in the shell; avoid unhandled global events or duplicate Sky overlays. On no-chart state, use “Set up your sky” and a real explanatory birth-details action. Labels must follow the actual state, not promise unavailable readings.

For subsequent sections, select actions from actual content: Read → resume/open the selected article; Listen → play the chosen audio; Books → today's chapter plus schedule a reading block; Good life → time picker plus a real small joy; Yours → reopen a saved item plus its collection controls. These are recommendations, not approval to deepen those sections now. Retain both slots throughout loading; show short loading labels then honest empty-state actions. Never route an empty shelf to a fabricated item.

## Coherent composition

Keep a single directed sequence: **today's meaning → do something with it → understand your chart → observe your own tides → longer patterns → ask/connect → Atelier → preferences/evidence/privacy**. Existing botanical dividers and open editorial blocks fit this. The top pair provides useful shortcuts while the entire experience remains inline. Make glossary terms understandable where used; show dated readings and distinguish measured astronomy, traditional symbolism and authored reflection. The dial must never imply clinical prediction.

Add usefulness before adding modules: dated history, return-to-position, honest saved feedback, recovery from failed loading, and correctly seeded Journal/Jess/Community journeys. Avoid another recommendation shelf, scoring system, or extra summary card.

## Mobile acceptance

At 360/390/430px: equal-weight pill slots, minimum 48px height, short labels with deliberate wrapping; no horizontal page overflow; visible keyboard focus; labels persist after entry; sheets clear bottom navigation and software keyboard. Test section switch → action → cancel/return → same section and place. Loading, unavailable data, failed save, retry, successful save and reload must each be demonstrable. Pairing must reject impossible dates. Ask suggestions must not issue overlapping requests. Clipboard failure and checkout failure must be visible. No Community age consent on Halli's behalf.

These proposals follow [W3C form labels](https://www.w3.org/WAI/tutorials/forms/labels/), [form feedback](https://www.w3.org/WAI/tutorials/forms/notifications/), [target sizing](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), and [unobscured focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum). FemWell's 48px pill rule is stricter than the WCAG minimum. Confirm contrast numerically; this review has not measured it.

## Brand and delivery gate

Conformance target: bible §§1, 2.7, 6.7.0a, 11, 15, 16, 17.3, 19.1–19.9. Legacy role instructions naming Fraunces/Inter/rose are superseded by current typography/clean tokens. Bible §2.7.2 still says hide summary/pills; §19.9 and Halli's present instruction override that. Keep them, make them contextual. The current instruction also makes Ideas Dev the review destination for every build; main promotion requires Halli's explicit go-ahead, superseding immediate-main wording.

**Done:** preservation inventory, source-backed craft blockers, focused-action proposal and acceptance criteria. **Queued:** parent integrates this into the phone-readable Ideas review; fixes wiring by priority; proves authenticated taps and pixels; Halli reviews. Sky remains unfinished; Read is not the active build.
