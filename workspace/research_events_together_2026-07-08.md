# Research — Events / Together: safe + exciting real-world + online meetups for an anonymous UK women's app — 08/07/2026

## Question
FemWell is building a robust "Events / Together" feature: browse/discover events, RSVP/"I'm going", see who else is going, form a small "go together" pod, external ticket links (no in-app payment), online + in-person meetups. It is anonymous/pseudonymous, women-only, 18+, UK, NHS-grounded, warm "smart-friend" tone. This brief gathers cited evidence on (1) in-person women's-meetup safety, (2) UK legal/duty-of-care, (3) event discovery + link-out ticketing + public APIs, (4) RSVP/"who's going"/small-group formation, (5) online-event formats, (6) warmth/"why go" framing — then turns it into a ranked, buildable roadmap, an explicit safety-model spec, warm mechanics, and online-format ideas.

## Sources consulted
- Meetup — groups & events policies (fetched 08/07/2026, page 403 to fetch; summarised via search): https://help.meetup.com/hc/en-us/articles/360002897712-Meetup-groups-and-events-policies
- Meetup — community guidelines section (08/07/2026): https://help.meetup.com/hc/en-us/sections/360000683791-Community-Guidelines
- Meetup — "Safely meeting in person" blog (fetched 08/07/2026; note: COVID-era, limited): https://www.meetup.com/blog/safely-meeting-in-person-how-to-navigate-the-new-normal/
- Bumble — "What you need to know about safety" (fetched 08/07/2026): https://bumble.com/en-us/the-buzz/safety
- Bumble — "Our safety features" support (08/07/2026, 403 to fetch; corroborated via search + ExpressVPN): https://support.bumble.com/hc/en-us/articles/28537051467293-Our-safety-features
- ExpressVPN — "Is Bumble safe?" (Share Date, Deception Detector, verification) (08/07/2026): https://www.expressvpn.com/blog/is-bumble-safe/
- Bumble BFF support — new-to-BFF navigation tips (08/07/2026): https://support.bumbleforfriends.com/hc/en-us/articles/12303712404509
- Tinder — safety features (08/07/2026): https://policies.tinder.com/community-resources/safety-features
- Peanut — Wikipedia (selfie verification, live audio, local meetups) (08/07/2026): https://en.wikipedia.org/wiki/Peanut_App
- Girl Gone International — About (volunteer local managers, 1 host event/month, "come strangers, leave friends") (08/07/2026): https://girlgoneinternational.com/aboutus/
- Online Safety Act 2023 — GOV.UK explainer (fetched 08/07/2026): https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer
- Online Safety Act 2023 — Wikipedia (duty tiers, penalties £18m/10%, senior-manager liability) (08/07/2026): https://en.wikipedia.org/wiki/Online_Safety_Act_2023
- Eventbrite — Search API deprecation (removed 12/12/2019, off 20/02/2020) (08/07/2026): https://github.com/Automattic/eventbrite-api/issues/83
- Eventbrite — API reference / auth (OAuth Bearer) (08/07/2026): https://www.eventbrite.com/platform/api
- Eventbrite — event accessibility listing guidance (ramps/stairs/toilets/parking/seating) (08/07/2026): https://www.eventbrite.com/blog/event-accessibility-checklist/
- Ticketmaster — Discovery API v2 (apikey param, 5000/day, 5 req/s, 429) (08/07/2026): https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- Meetup — API access (Feb 2025 GraphQL migration, Pro-gated OAuth consumers) (08/07/2026): https://help.meetup.com/hc/en-us/articles/41453576628749-How-can-I-get-access-to-Meetup-s-API
- Skiddle — Events API (free API key, RESTful, location/date/type filters) (08/07/2026): https://www.skiddle.com/api/ ; wiki https://github.com/Skiddle/web-api/wiki/Events-API
- Fatsoma — event widgets + SSR API (08/07/2026): https://ticketing.fatsoma.com/f/event-widgets ; https://github.com/velohost/astro-fatsoma
- Campaign to End Loneliness — 3.83m chronically lonely; women 56% vs men 43%; 16–29 highest (08/07/2026): https://www.campaigntoendloneliness.org/press-release/half-a-million-more-people-are-lonely-all-or-most-of-the-time/
- Focusmate — virtual body-doubling, declare intention → accountability (08/07/2026): https://www.focusmate.com/
- FLOWN — body doubling / virtual co-working for focus (08/07/2026): https://flown.com/
- VIDA Virtual — body-doubling co-working FOR WOMEN (08/07/2026): https://vidacoworking.com/vidavirtual/
- parkrun — free, weekly, 5k, volunteer-run, 2000+ locations (08/07/2026): https://en.wikipedia.org/wiki/Parkrun
- Prior FemWell brief (reuse, do not re-derive): OSA duties, EHRC single-sex, moderation, weak-ties-reduce-loneliness — `workspace/research_talk_rooms_2026-07-08.md`

---

## 1. IN-PERSON WOMEN'S MEETUP SAFETY — the canonical model

**What the market actually enforces (cited):**
- **Every event must have a present, identifiable host who is the point of contact and, at minimum, tells members the location** — Meetup's core rule (source: https://help.meetup.com/hc/en-us/articles/360002897712-Meetup-groups-and-events-policies). GGI operationalises this as **volunteer local managers who each host at least one event/month** — a named human, not a faceless listing (source: https://girlgoneinternational.com/aboutus/).
- **Public, well-lit venue for a first meet; low-pressure format (walk, tea, coffee)** — Bumble's canonical first-meet guidance (source: https://bumble.com/en-us/the-buzz/safety). Bumble explicitly suggests "a walk, a cup of tea, or a cocktail" as low-pressure openers (source: same; https://support.bumbleforfriends.com/hc/en-us/articles/12303712404509).
- **Tell a trusted person where you are + when you'll be home.** Bumble: "Tell somebody close to you your date's name, where you're going, and when, and that you'll contact them once you're home" (source: https://bumble.com/en-us/the-buzz/safety). Tinder recommends using the phone's built-in location share with a trusted contact during a date (source: https://policies.tinder.com/community-resources/safety-features).
- **Never leak home/office/precise-location; abstract personal details.** Bumble: "Don't give out private information about yourself, like your home or office address, right away," and list vague occupation, and omit photos that reveal a place you frequent — "your go-to dog park or local bar" (source: https://bumble.com/en-us/the-buzz/safety).
- **A named "check-in / share my whereabouts" feature is now table-stakes.** Bumble ships **"Share Date"** — lets a trusted person know your whereabouts (source: https://www.expressvpn.com/blog/is-bumble-safe/; https://support.bumble.com/hc/en-us/articles/28537051467293). This is the pattern FemWell's "Get home safe" check-in should copy.
- **Identity/trust signals: verification before meeting.** Bumble ships **photo verification** + **ID verification**; recommends asking a match to verify before meeting (source: https://bumble.com/en-us/the-buzz/safety; https://www.expressvpn.com/blog/is-bumble-safe/). Peanut requires **selfie verification** for all profiles and runs sensitive-content masking + zero-tolerance abuse policy (source: https://en.wikipedia.org/wiki/Peanut_App). NOTE: FemWell is anonymous — so verification must be a **liveness/human-check gate for HOSTS and for pod-forming**, not public identity exposure (see safety spec §C).
- **Robust block & report + "leave anytime" agency.** Bumble ships an Unmatch feature + "robust Block & Report system" and normalises leaving: "Always feel free to politely leave… put yourself first" (source: https://bumble.com/en-us/the-buzz/safety; https://support.bumble.com/hc/en-us/articles/28537051467293).
- **In-app comms before contact-info exchange.** Bumble offers in-app video/voice "without sharing your phone number or email" (source: https://bumble.com/en-us/the-buzz/safety). Meetup tells organisers/members to keep to in-app messaging until trust is established (source: https://help.meetup.com/hc/en-us/sections/360000683791-Community-Guidelines).
- **Code of conduct is a hard gate, not decoration.** Meetup prohibits content/events that "threaten public or personal safety" and requires local-law compliance; unsafe conduct is reportable to Meetup AND to local authorities (source: https://help.meetup.com/hc/en-us/articles/360002897712-Meetup-groups-and-events-policies).

**The gap the market leaves (our opportunity):** none of these do **venue-level-only** disclosure well for anonymous women — most assume real names. FemWell can lead by making **pseudonymous + venue-level-only + host-verified** the default.

---

## 2. UK LEGAL / DUTY-OF-CARE (not legal advice — flag for real UK counsel)

- **The OSA 2023 governs online content, not the offline meeting itself.** The GOV.UK explainer contains **no guidance on facilitating in-person meetings**; the Act "focuses on online content and user interaction within digital platforms rather than offline activities users may subsequently undertake" (source: https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer). So the app's OSA exposure is about the **on-platform** event listings, comments, RSVPs and DMs — not liability for what happens at a café.
- **But the app IS a user-to-user service and must:** run an **illegal-content risk assessment**, take proportionate measures to reduce illegal offending (priority offences named include **harassment, stalking, controlling behaviour, intimate-image abuse** — all disproportionately affecting women), remove illegal content, and provide **effective reporting + redress** (source: https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer). Non-compliance risk: fines up to **£18m or 10% of global turnover**, plus **senior-manager criminal liability** for repeated failures (source: https://en.wikipedia.org/wiki/Online_Safety_Act_2023).
- **"We host events" vs "we surface/link events" is the pivotal liability distinction.** If FemWell **hosts** (creates the event, appoints the host, controls attendance), it takes on organiser-style duty-of-care and a stronger safeguarding posture. If it **surfaces/links** third-party events (Eventbrite/Meetup/Skiddle listings with a link-out ticket), it is closer to a **directory/aggregator** and can disclaim that it is not the organiser and does not vet the event. **Recommendation: default to the surface/link-out model; treat FemWell-native meetups (pods, walks) as the higher-duty tier with the full safety spec (§ below) enforced.** (Real UK legal review needed — flag.)
- **Design choices that reduce risk (all buildable):** (a) clear "FemWell does not organise, vet, or endorse third-party events; you attend at your own discretion" disclaimer on every link-out; (b) a **safety interstitial** before first RSVP; (c) code-of-conduct acceptance gate; (d) no in-app payment (already decided — keeps FemWell out of consumer-contract/refund liability); (e) robust report/block on every event, comment and pod; (f) age-18+ gate (already in place). **Flag:** single-sex "women-only" events rely on the Equality Act sex/gender-reassignment single-sex exceptions — same EHRC ground already logged in `research_talk_rooms_2026-07-08.md`; carry that framing over. Get UK counsel to sign the disclaimer + safeguarding copy.

---

## 3. EVENT DISCOVERY & TICKETING (link-out model) — API reality

**Hard finding — the two biggest names are effectively closed to a public discovery feed:**
- **Eventbrite: NO public event-search API.** The `GET /v3/events/search/` endpoint was removed 12/12/2019 and switched off 20/02/2020; "as of 2024 there is no public API endpoint for searching events across the platform." Remaining endpoints fetch by event ID / venue / organisation only, and cross-creator retrieval requires their **distribution partner programme** (source: https://github.com/Automattic/eventbrite-api/issues/83; https://www.eventbrite.com/platform/api). Auth is OAuth Bearer token (source: same). → **You cannot build an Eventbrite "browse events near me" feed off the public API.**
- **Meetup: gated behind Meetup Pro + GraphQL/OAuth since Feb 2025.** REST retired; meaningful data needs a paid Pro organiser subscription to create OAuth consumers (source: https://help.meetup.com/hc/en-us/articles/41453576628749-How-can-I-get-access-to-Meetup-s-API). → Not viable as a free discovery source.

**What IS openly usable (the buildable path):**
- **Ticketmaster Discovery API v2** — genuinely open: register → get a Consumer/API key, pass as `apikey` query param; search by location/date/keyword; **5,000 calls/day, 5 req/s, 429 on overage** (source: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/). Good for big ticketed events (gigs, comedy, theatre) — the "fun/entertainment" life-domain, not just wellness.
- **Skiddle Events API** — UK-native, **free API key on application**, RESTful, filters by location/date/event-type; PHP SDK provided (source: https://www.skiddle.com/api/; https://github.com/Skiddle/web-api/wiki/Events-API). Strong UK coverage of club nights, festivals, local events. **Best single free UK source.**
- **Fatsoma** — UK events; SSR/API + embeddable event widgets (source: https://ticketing.fatsoma.com/f/event-widgets; https://github.com/velohost/astro-fatsoma). Usable for embed/link-out.
- **Council/library/community listings** — mostly no clean API; treat as **manually-curated FemWell-editorial listings** (a small entity you populate), which doubles as the women-only/wellness-tilted feed the big APIs won't give you.

**→ Backend/creds implication (flag for Mr Lead Manager):** a live third-party discovery feed needs **(a) a backend function to hold API keys server-side** (never ship keys client-side) for Ticketmaster + Skiddle, and **(b) a normalisation layer** mapping their schemas to one FemWell `Event` shape. If that's too heavy for v1, ship **curated + FemWell-native events only** (client/entity-driven, zero external creds) and add API feeds in a later pass.

**Metadata that matters per listing (build the entity to hold all of it):** title, blurb, **venue name + area only (NOT full precise address until RSVP/opt-in)**, date/time, price (or "free"), **ticket link-out URL**, **online vs in-person**, **women-only vs mixed** (FemWell tag — the APIs won't give this, so it's a FemWell editorial field), **accessibility** (step-free / wheelchair toilet / accessible parking / seating — Eventbrite's own checklist fields are the model: ramps, stairs, toilets, parking, seating; source: https://www.eventbrite.com/blog/event-accessibility-checklist/), host/organiser, capacity, and a "who's going" count (see §4 — handle carefully).

**Link-out safety:** every external link goes through a **confirmation interstitial** ("You're leaving FemWell — this is a third-party site we don't control; never pay outside the official ticketer") and opens in-browser, not in-app-webview-that-looks-native (reduces phishing confusion).

---

## 4. RSVP / "WHO'S GOING" / SMALL-GROUP FORMATION — privacy-preserving

- **Low-pressure RSVP beats hard commitment.** Bumble's whole first-meet ethos is low-pressure openers + "always free to leave" (source: https://bumble.com/en-us/the-buzz/safety). Mirror this: RSVP states should be **"I'm going" / "Maybe / interested" / "Can't this time"** — soft, changeable, no penalty, no "you flaked" shaming.
- **Show warmth, hide the scoreboard (anti-vanity).** RSVP/member counts ARE publicly parseable on Meetup event pages (source: https://help.meetup.com/hc/en-us/articles/41455194927373) — but big raw counts intimidate anxious/lonely first-timers. **Recommendation:** show **presence, not a leaderboard** — e.g. "8 women going, 3 first-timers like you" or fuzzy bands ("a small group", "filling up") rather than a precise vanity number. This directly serves the loneliness cohort (§6).
- **Pseudonymous "who's going" — show pseudonyms/avatars only, never real names, never precise location, never contact info.** GGI's "come strangers, leave friends" works precisely because you show up and meet — you don't pre-exchange identities (source: https://girlgoneinternational.com/aboutus/). Peanut's selfie-verified-but-first-name model is the safety floor; FemWell goes further with pseudonyms (source: https://en.wikipedia.org/wiki/Peanut_App).
- **"Go together" pod = opt-in, small, in-app-only coordination.** Pattern: a first-timer taps "I'd like to go with someone" → she's placed in / offered a **small pod (3–6) for that specific event**, chatting **in-app only** (no phone/email/social handles — Bumble's "meet without sharing your phone number or email" principle; source: https://bumble.com/en-us/the-buzz/safety). Pod dissolves after the event unless members mutually opt to keep talking. **No location sharing between pod members beyond the public venue.**
- **What feels creepy (avoid):** exact-location pins of who's going; showing a stranger's home area; auto-matching without consent; persistent "seen you at 3 events" tracking; exposing that a specific named user RSVP'd to a sensitive-topic event (e.g. a menopause or fertility meetup) — **RSVP visibility to sensitive/health events must be private-by-default** (OSA priority-harm + dignity). Style/hobby/social events can be more open; health-tilted events lean private. (This is the whole-life-tint rule applied to privacy.)

---

## 5. ONLINE EVENTS — formats that build belonging

- **Body-doubling / virtual co-working is the proven low-social-cost belonging format.** Focusmate/FLOWN/VIDA all show the same mechanic: **declare your intention at the start → accountability + belonging, cameras optional, chat-only allowed, "no one's looking at you because everyone's focusing"** (source: https://www.focusmate.com/; https://flown.com/; https://vidacoworking.com/vidavirtual/). VIDA runs this **specifically for women** — direct precedent. This is perfect for anxious/lonely users: presence without performance.
- **Free + weekly + volunteer-run + same-time-every-week = the parkrun formula.** parkrun scaled to 2,000+ locations on free, weekly, volunteer-hosted, non-competitive repetition (source: https://en.wikipedia.org/wiki/Parkrun). The lesson for online: **a recurring, fixed-slot, free, low-stakes ritual** beats one-off spectaculars for belonging.
- **Live audio rooms are an established women's-community format.** Peanut added live audio rooms on motherhood/pregnancy topics (source: https://en.wikipedia.org/wiki/Peanut_App; corroborated in `research_talk_rooms_2026-07-08.md`).
- **Safety to run online events:** host present + moderator; **no-recording norm stated up front** (reduces disclosure risk for anonymous women); in-app only, no external links dropped in chat; report/mute controls; keep to pseudonyms.

---

## 6. WARMTH & "WHY GO" — the loneliness case + first-timer welcome

- **The need is huge and skews female + young.** 3.83m UK adults chronically lonely (up ~500k since the pandemic); **56% of women vs 43% of men report some loneliness**; **16–29s are the loneliest age band** (source: https://www.campaigntoendloneliness.org/press-release/half-a-million-more-people-are-lonely-all-or-most-of-the-time/). FemWell's demographic is squarely the highest-need group — the "why go" writes itself, but the framing must lower the threat, not tout scale.
- **Reassurance beats hype.** GGI's promise is emotional, not metric: "come strangers, leave friends" + "feel at home wherever you are" (source: https://girlgoneinternational.com/aboutus/). Bumble frames first meets as tiny and reversible: a walk, a tea, "always free to leave" (source: https://bumble.com/en-us/the-buzz/safety).
- **First-timer welcome + "go with someone" is the anti-anxiety lever** — a named host to look for, a pod so you don't arrive alone, "first-timers welcome" badges, and **fuzzy/warm counts instead of vanity numbers** (see §4).

---

## RANKED BUILDABLE RECOMMENDATIONS (impact × effort)

Legend: **[C]** client/device-local now · **[E]** new data entity · **[F]** new backend function · **[K]** external API creds.

| # | Recommendation | Impact | Effort | Build class |
|---|---|---|---|---|
| 1 | **Safety interstitial + code-of-conduct gate before first RSVP/first pod** (the numbered safety spec below, one-time + refresher) | High | Low | [C] |
| 2 | **`Event` entity** holding all §3 metadata incl. `online/inPerson`, `womenOnly/mixed`, venue-area-only, accessibility fields, ticket link-out URL | High | Med | [E] |
| 3 | **Curated + FemWell-native events feed** (editorial + native pods/walks) — ships with ZERO external creds | High | Med | [E] |
| 4 | **Soft RSVP (going / maybe / can't) with anti-vanity fuzzy counts** ("a small group · 3 first-timers") | High | Low | [C]+[E] |
| 5 | **Link-out confirmation interstitial** ("leaving FemWell · third-party · pay only on the official ticketer") | High | Low | [C] |
| 6 | **"Go together" pod: opt-in, 3–6, pseudonymous, in-app-only chat, dissolves post-event** | High | Med | [E]+[F] |
| 7 | **"Get home safe" check-in** (Bumble "Share Date" pattern) — set an expected-back time, optional trusted-contact reminder | High | Med | [C] (device share) / [F] (reminders) |
| 8 | **Report/block on every event, comment, pod + RSVP privacy-by-default on health-tilted events** (OSA compliance) | High | Med | [E]+[F] |
| 9 | **Host verification gate** — liveness/human-check for anyone hosting a FemWell-native meetup or opening a pod (verify the host, not the crowd) | High | Med | [F]+[K] (verification vendor) |
| 10 | **Online body-doubling / co-working rooms + recurring fixed-slot ritual** (parkrun/VIDA formula) | High | Med | [E]+[F] |
| 11 | **Ticketmaster Discovery + Skiddle live feed** via server-side key + normalisation layer (defer to a later pass) | Med | High | [F]+[K] |
| 12 | **First-timer welcome layer** (host-to-look-for, "first-timers welcome" badge, gentle reminders, post-event "reconnect?") | Med | Low | [C]+[E] |
| 13 | **Central "Jump to" switcher** for Events sub-areas (Discover / Going / Pods / Online / My events) per the app-wide multi-layer rule | Med | Low | [C] |

**v1 cut line (my recommendation):** ship **1–8 + 12–13** (all entity/client/light-function, NO external API creds, NO payment) as a self-sufficient, safe, warm feature. Add **9** (host verification) as the gate that unlocks native in-person pods. Defer **11** (external live feeds) — it's the only item needing external creds and a normalisation layer, and Eventbrite/Meetup are closed anyway, so the ROI is only Ticketmaster+Skiddle.

---

## THE SAFETY MODEL — numbered spec the feature MUST enforce (in-person women's meetups)

**A. Location & data minimisation**
1. **Venue-level only, never precise.** Show venue name + area (e.g. "a café in Shoreditch") until the user has RSVP'd; reveal the exact address only after RSVP + only in-app. Never show a user's home area.
2. **No contact-info leakage — ever, by default.** Pod/coordination chat is in-app only; no phone, email, or social handles surfaced or auto-shared (Bumble "meet without sharing your phone number or email"; source: https://bumble.com/en-us/the-buzz/safety).
3. **Pseudonyms + avatars only** in "who's going" and pods — never real names, never precise locations.

**B. Public-venue & first-meet norms**
4. **In-person meets happen in public, well-lit venues.** FemWell-native meetups must select a public venue; the safety interstitial states this (source: https://bumble.com/en-us/the-buzz/safety).
5. **Low-pressure, ideally daytime first meet** (walk/tea/coffee framing) — and "you're always free to leave" is stated (source: https://bumble.com/en-us/the-buzz/safety).
6. **Bring-a-friend / go-as-a-pod encouraged** — never arrive alone if you'd rather not (pod feature, §6 above).

**C. Trust & verification**
7. **Every FemWell-native event has a named, present host** who is the in-app point of contact (Meetup's core rule; source: https://help.meetup.com/hc/en-us/articles/360002897712-Meetup-groups-and-events-policies).
8. **Hosts and pod-openers pass a liveness/human verification** (verify the organiser, not the anonymous crowd — reconciles anonymity with safety).

**D. Tell-a-friend / check-in**
9. **"Get home safe" check-in**: set an expected-return time; optional reminder + one-tap "I'm safe"; optional trusted-contact share (Bumble "Share Date"; source: https://www.expressvpn.com/blog/is-bumble-safe/).

**E. Reporting, conduct, agency**
10. **Code-of-conduct acceptance gate** before first RSVP; conduct that "threatens personal safety" is prohibited (Meetup; source: https://help.meetup.com/hc/en-us/articles/360002897712-Meetup-groups-and-events-policies).
11. **Report + block on every surface** (event, comment, pod, user); serious/illegal conduct routed to FemWell moderation AND signposted to report to police (Meetup pattern + OSA duty; sources above).
12. **RSVP privacy-by-default on health/sensitive-topic events** — who's attending a menopause/fertility meetup is not publicly listed.

**F. Link-out & payments**
13. **No in-app payment.** External ticket links pass through a "you're leaving FemWell / third-party / pay only on the official ticketer" interstitial.
14. **Disclaimer on third-party events:** FemWell does not organise, vet, or endorse them; attend at your own discretion. (Get UK counsel to sign copy.)

---

## WARM / FUN MECHANICS (5–8, whole-life not health-only)

1. **"Come strangers, leave friends" first-timer badge** — events show "first-timers welcome · you won't be the only new one" (GGI framing; source: https://girlgoneinternational.com/aboutus/).
2. **"Go with someone" pod invite** — one warm tap: "Fancy going together? I'll pop you in a little group so you don't arrive alone."
3. **Fuzzy warmth counts, not vanity numbers** — "a cosy group forming · 3 first-timers like you" instead of "27 attending."
4. **Recurring fixed-slot rituals** across life domains — a weekly online co-working hour, a monthly city walk, a book-club call, a "Friday wind-down" watch-along (parkrun/VIDA repetition formula; sources above). Let life-stage gently tint, never gate.
5. **Gentle, non-nagging reminders** — "Your walk's tomorrow at 10 · here's your host to look for · reply MAYBE if plans changed, no pressure."
6. **Post-event reconnection** — after an event: "Lovely having you. Want to stay in your pod, or find the next one?" (no forced friending).
7. **Interest-led, not symptom-led events** — fashion swap, career coffee, crafting hour, gig/comedy meet-up (Ticketmaster feed), gardening walk — span relationships/career/hobbies/joy, not just cycle/health (whole-life rule).
8. **"Two ways in" for the anxious** — every in-person event offers an **online sibling** (join the walk, or join the after-chat online) so nervous users can dip a toe first.

---

## ONLINE-EVENT FORMAT IDEAS (belonging-first, safe)

- **Body-doubling / co-working hours** — cameras optional, chat-only allowed, declare-your-intention open, no-recording norm (VIDA-for-women precedent; sources above).
- **Book-club / watch-along video calls** — shared low-stakes focus; host-moderated.
- **Guided workshops + AMAs** — a warm expert or peer host; pseudonyms; no recording.
- **Virtual walks / "walk-and-talk"** — audio-first, phones in pockets; pairs the parkrun ritual with body-doubling accessibility.
- **Live audio rooms by life-domain** — Love & Work & Style & The Lighter Side, not only health (Peanut audio-room precedent; source: https://en.wikipedia.org/wiki/Peanut_App), reusing the Talk-rooms infrastructure.
- **"Cycle-sync" gentle sessions** — health-tinted but optional, private RSVP, low-key.

## Recommended next steps for Mr Lead Manager
1. Spec the **`Event` entity** (§3 metadata incl. online/inPerson, womenOnly/mixed, venue-area-only, accessibility, ticket link-out, RSVP-privacy flag) + **`Pod`** (3–6, pseudonymous, in-app chat, event-scoped, auto-dissolve).
2. v1 = **curated + FemWell-native feed, soft RSVP, fuzzy counts, pods, safety interstitial + code-of-conduct gate, get-home-safe check-in, report/block everywhere, link-out interstitial** — **zero external creds, no payment**.
3. Gate native in-person pods behind **host liveness verification** ([F]+[K] vendor).
4. **Defer external live feeds** (Ticketmaster + Skiddle only — Eventbrite/Meetup are closed) to a later pass needing a **server-side key function + normalisation layer**.
5. **Flag for UK legal counsel:** surface-vs-host liability line, third-party disclaimer + safeguarding copy, single-sex "women-only" Equality Act basis, OSA illegal-content risk assessment coverage of event listings/comments/pods.

## Sentiment / precedent quotes
- Girl Gone International (site, 08/07/2026): "come strangers, leave friends" — the emotional promise that scaled 160+ communities, 4,000 free events/year (https://girlgoneinternational.com/aboutus/).
- Bumble safety (08/07/2026): "Always feel free to politely leave the date. If you don't feel comfortable, it's important for you to put yourself first" (https://bumble.com/en-us/the-buzz/safety).
