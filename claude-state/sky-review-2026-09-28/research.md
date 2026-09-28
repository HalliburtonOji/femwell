# Sky: independent research and product gap pass

Ms Deep Search · 28 September 2026 · research/proposals, not approval or live verification.

**Delivery rule:** organise this work under Ideas Dev for Halli's verification. Main-page promotion needs his explicit go-ahead. Preserve existing features; repair their substance. No new backend function names.

## Questions and baseline

What should the two pills do? Which interactions actually complete? Which chart claims are justified? What can someone without birth time use? How can reflection reach Journal/Planner without leaking data? What should loading, failure and day rollover show? What would make Sky distinctive without another stack of features?

Reviewed: AGENTS, CLAUDE, onboarding, STATUS top, relevant brand §§2.7/6.7/10.4–5/12/15/16/19, three existing `research_horoscope_v2*.md` files, SkyFocus, SkyMovements, useBirthChart and BirthDataSheet. Existing research is historical input, not fresh evidence. Earlier competitor revenue/conversion, uniqueness and medical claims must not be copied as established facts. No forum sentiment is asserted here.

## What exists, and what blocks trust

Source observations, not live test results:

| Priority | Existing surface | Gap to repair |
|---|---|---|
| P1 | Eight movements; triad; diary; reading; settings; sharing | SkyFocus creates twelve diary columns from array indices, including invented slow stretches, and a fallback saying previous cycles were steady. Replace the demonstration data with real history; preserve the diary and give honest partial-history states. |
| P1 | Compatibility and copy link | `btoa(name\|birthday)` puts reversible personal details in the URL; the reader only pre-fills inputs, despite the button promising a link to a reading. Preserve sharing through a deliberately previewed, data-minimised artifact or appropriately protected share mechanism. |
| P1 | Quiet/Soft Sky settings | Writes are swallowed and local toggles appear successful. Confirm persistence, roll back errors, and prove changed preferences affect the currently visible content. |
| P1 | Atelier and paid products | Checkout errors/no URL only log to console. Authorship credentials and “written, not generated” require provenance. Existing memory records simulated purchases and unfinished delivery: audit current reality before accepting payment. Preserve the surface; show honest availability. |
| P1 | Chart loading and refresh | `refresh` changes booleans but the loading effect has no refresh dependency; network failures become empty arrays. Missing chart, permission failure and offline are not interchangeable. |
| P1 | Today, Reflect, Discuss, Jess, Garden | These controls exist. Destination query consumers, event listeners, persisted read-back and return journey still need proof. A dispatched event without a listener does not throw. |
| P2 | Daily/date context | UTC reading date, mounted-only moon value and local date labels can disagree near midnight. Define the reading's day/timezone, refresh on rollover and label older content. |

## Fresh findings → concrete design choices

**1. Separate sky facts from interpretation.** NASA explains phases as changing illumination, not personal predictions. Give lunar data a date/source and label interpretive prose as reflection; never borrow astronomical precision to imply astrological certainty. (source: https://science.nasa.gov/moon/moon-phases/)

**2. Repair the science footer.** The 2021 menstrual study examined 22 women's long-term records and explicitly did not establish causality. Max Planck's sleep investigation reported null findings and publication-bias concerns. The current “can nudge sleep” sentence overstates certainty. Proposed copy: “Researchers have explored links between lunar phases, sleep and menstrual timing, with mixed findings. This reading is for reflection, not a health prediction.” Keep sources in a short expandable note. (sources: https://pmc.ncbi.nlm.nih.gov/articles/PMC7840133/ ; https://www.mpg.de/8272089/full-moon-sleep)

**3. Make unknown time a first-class state.** CHANI acknowledges lower precision with an estimated time; its angles explainer says exact time/place determine chart angles. FemWell should explicitly distinguish known, approximate and unknown time; never silently treat noon as known. Show only supported placements, mark uncertain ones, explain why houses/rising may be unavailable, and permit editing. This is a design recommendation, not endorsement of chart validity. (sources: https://chaninicholas.zendesk.com/hc/en-us/articles/4411093003539-Unknown-Birth-Time ; https://www.chani.com/astro-education/new-mc-ic-and-dc-are-now-in-the-chani-app)

**4. Borrow complete reflection journeys, not health promises.** CHANI advertises daily readings, guided audio, journal prompts, weekly material and human authorship. This establishes a product pattern, not clinical benefit, retention or willingness to pay. FemWell already has comparable building blocks; complete reading → chosen reflection → saved note → revisit before adding new blocks. Authorship must match actual production. (source: https://www.chani.com/app)

**5. Minimise details and make sharing deliberate.** ICO guidance calls for privacy throughout the lifecycle and limiting personal information to each purpose. A birth town is different from live geolocation; explain the geocoding provider and what is stored. Keep someone else's birthday, birth place and private notes out of ordinary share URLs. Preview what leaves the app. Do not print absolute privacy promises until the data flow has been checked. (source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/)

**6. Make feedback perceivable.** W3C requires programmatically available status messages. Saving, failure, copied-link and generated-reading results need visible text plus suitable status semantics; do not move focus unnecessarily. Preserve entered questions and dates on error; retry the operation rather than resetting the whole page. (source: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

**7. Design for fingers and alternative input.** WCAG's AA target-size minimum is 24×24 CSS pixels, with exceptions; larger is preferable. Recommend 44px for principal controls, meaningful labels, focus indicators and selected-state semantics. Give swipe-driven cards tap alternatives; native overflow scrolling itself is exempt from the dragging criterion. Honour reduced motion and keep sheet controls above navigation/keyboard. (sources: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html ; https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

## Proposed composition and two pills

Keep all eight movements. Improve direction through a dated opening, contextual pair of actions and a readable contents strip; preserve the summary/Jess layer.

- **Sky pill 1: “Today's reading”** opens the exact dated reading in place. Without a chart: “Set up your sky”. During generation: truthful progress and retry, not generic horoscope filler.
- **Sky pill 2: “Reflect on this”** opens a private editable prompt tied to that reading; “Open your reflection” after a successful save. Journal must confirm persistence and return to the same Sky position.
- **Edit your chart** stays available beside chart identity. Other section pairs should use the same component but distinct labels, icons, destinations and user-state behaviour; no global chapter/time-picker pair.
- Each movement has one clear next action: read; inspect a placement; understand the dial; revisit a real diary date; ask a bounded reflective question; inspect genuine product availability; adjust settings.
- Add **Plan a moment** inside the reflection flow: user chooses their own time, saves an existing Planner item with source/ref, and can return to the source reading. No automatic “auspicious” appointment, notification or health inference.

## Optional ideas worth testing in Ideas Dev

These are hypotheses, not research findings or approved builds:

1. **“What didn't fit?”** beside a private reflection. Let her disagree with the reading; preserve her words rather than manufacture personality insights.
2. **A sky postcard:** share selected authored text and a botanical illustration, with birth/cycle details excluded by default and a preview before sharing.
3. **Window-seat mode:** a short sourced lunar observation plus an optional ordinary action, such as noticing the evening light. Useful without birth data or cycle logging.
4. **A return envelope:** privately revisit a reflection on a date she chooses. No streak, backlog badge, automatic grief resurfacing or reminder without opt-in.

## Avoid and sequence

Do not advance historical proposals for AI-recovered birth times, conception timing, age-inferred perimenopause, or lunar health predictions as validated features. Keep compatibility playful and nonfatalistic; scores are symbolic, never evidence of trustworthiness. Do not silently remove existing scores: surface that design tension to Halli. Quiet mode should add control, not be the only place harmful claims are avoided.

Build order: real data/error/privacy repairs → contextual pills and complete destination contracts → reading/chart clarity → mobile craft → optional depth. Review matrix: no chart/unknown time/full chart; zero/partial history; read generation/failure; save/reload/second device; timezone rollover; rapid repeat taps; keyboard open; 360/390/430px; each outbound/return link. Capture real pixels and actual outcomes. Main remains unchanged until Halli approves.

All external links above were opened or retrieved on **28 September 2026**. Recommendations conform to brand §§10.4–5, 12.4, 15.4, 16.2, 17.3 and 19; this document does not certify the implementation.
