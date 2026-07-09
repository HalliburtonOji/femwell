# Research — Community CIRCLES: robust cohort feature for an anonymous women's app — 09/07/2026

## Question
FemWell is making its curated CIRCLES feature robust — stage/condition/interest cohorts a woman opts into, each with a lurkable feed + join-to-post. This brief gathers cited, live-verified evidence on cohort/group models, sensitive special-category health circles, matching/discovery, per-circle engagement/warmth, safety, and cross-app ties, then turns it into ranked buildable recommendations, a robust v1, warm mechanics, and a sensitive-circle safety+warmth playbook.

**Already built (do not re-derive — ground on this):** a static curated `CIRCLES` catalogue (`src/components/community/circlesConfig.js`) with 12 circles across Life stages / Living with (sensitive) / Shared loves; a `CircleMembership` entity (RLS-locked, no `Circle` DB entity by design); circle-scoped `CommunityPost.circle`; a `sensitive` flag + `SENSITIVE_CONSENT()` copy + consent-on-join gate; device-local `isJoined`; and `suggestedCircles(profile)` matching on `life_stage` + `followed_categories`. The anonymity / OSA / single-sex / moderation-floor / crisis-precheck canon is fully covered in the sibling brief `research_talk_rooms_2026-07-08.md` — this brief cites it rather than repeating it.

## Sources consulted
- Peanut App — Wikipedia (Groups = life-stage/location/interest sub-sections; anonymous posts, non-anon replies) (fetched 09/07/2026): https://en.wikipedia.org/wiki/Peanut_App
- TechCrunch — Peanut Menopause launch (why a separate stigmatised-stage space; demand emerged organically) (fetched 09/07/2026): https://techcrunch.com/2021/09/07/social-network-peanut-expands-to-include-more-women-with-launch-of-peanut-menopause/
- HealthUnlocked — Communities index (charity-hosted, moderated condition forums) (fetched 09/07/2026): https://healthunlocked.com/communities
- HealthUnlocked — Endometriosis UK (moderated charity forum on the platform) (fetched 09/07/2026): https://healthunlocked.com/endometriosis-uk
- PMC — qualitative study, peer-to-peer online support for women with PCOS (fetched 09/07/2026): https://pmc.ncbi.nlm.nih.gov/articles/PMC3867626/
- JMIR 2025 — Quality & Misinformation in Online Peer Support Groups: Scoping Review (fetched 09/07/2026): https://www.jmir.org/2025/1/e71140 ; PMC mirror: https://pmc.ncbi.nlm.nih.gov/articles/PMC12125560/
- ACM CSCW 2010 — empirical study of critical mass & online community survival (fetched 09/07/2026): https://dl.acm.org/doi/10.1145/1718918.1718932
- Together Institute (Medium) — critical mass rules of thumb for communities (fetched 09/07/2026): https://medium.com/together-institute/paying-attention-to-critical-mass-in-communities-networks-b4d83bcf0c5f
- FluentCommunity — community onboarding mechanics (welcome space, first-post, buddy, survey-to-space) (fetched 09/07/2026): https://fluentcommunity.co/blog/community-onboarding-strategies/
- Bettermode — onboarding: strategically surface only relevant groups, not all (fetched 09/07/2026): https://bettermode.com/blog/onboarding-community-members
- Education Express (UTS) — content warnings: neutral, preparatory, let people engage or disengage (fetched 09/07/2026): https://educationexpress.uts.edu.au/blog/2023/10/31/navigating-sensitive-topics/
- Mumsnet — Talk forums (staff-curated topic structure, user threads) (fetched 09/07/2026): https://www.mumsnet.com/talk
- **Prior FemWell brief (cited, not repeated):** `workspace/research_talk_rooms_2026-07-08.md` — anonymity models, OSA duties, single-sex framing, moderation floor, crisis pre-check, believed-by-default report→hide, botanical alias, no-post-left-unanswered.

---

## 1. Cohort / group models for support communities

**Findings**
- **Life-stage + interest cohorts are the proven organising axis for a women's app.** Peanut structures the whole product around life stages (TTC · pregnancy · motherhood · menopause) plus interest and location Groups — "sub-sections of users focused on specific topics, including … life stage, pregnancy due date, and interests or hobbies" (source: https://en.wikipedia.org/wiki/Peanut_App). FemWell's three-axis split (Life stages / Living with / Shared loves) mirrors this exactly and is well-founded.
- **Curated beats user-created for a small, safe, women-only app.** Mumsnet's structure is staff-curated topics with user-generated threads inside — the category set is "curator-managed by Mumsnet staff rather than … user-created boards" (source: https://www.mumsnet.com/talk). HealthUnlocked's condition communities are charity-hosted and moderated, not open user creation (source: https://healthunlocked.com/communities). Curation removes circle-creation moderation, dead-circle sprawl, and vanity "create a circle" surfaces — exactly FemWell's existing decision (circlesConfig.js header). **Keep it curated.**
- **A separate stigmatised-stage space is justified when demand emerges organically.** Peanut added Menopause because women "were already … discussing" it and there was no dedicated space; a distinct room signals "this belongs here, you're not off-topic" (source: https://techcrunch.com/2021/09/07/social-network-peanut-expands-to-include-more-women-with-launch-of-peanut-menopause/). Validates giving perimenopause and menopause their own circles rather than one "midlife" bucket.
- **How many circles is right — fewer, warmer.** Critical-mass research: a small community only needs **10–20 active people to feel alive**, but expect only **10–30% of members to show up** to any given thread/event (2–10% in low-engagement networks) (source: https://medium.com/together-institute/paying-attention-to-communities…, https://dl.acm.org/doi/10.1145/1718918.1718932). Corollary for a small app: **too many circles dilutes the crowd below the aliveness floor.** 12 curated circles is at the upper edge for an early community — resist adding more until the core ones are warm. **Poster heterogeneity (variety of voices), not raw count, is the earliest predictor of survival — visible within 2 hours of a channel's life** (source: https://dl.acm.org/doi/10.1145/1718918.1718932).
- **Lurking-first is correct and should be designed for, not tolerated.** FemWell already lets a woman read a circle without joining (join = permission to post). This is the healthy default: most members lurk; the goal is a low-friction path from lurk → first post, not to shame lurkers.
- **What makes a cohort feel alive vs dead:** alive = enough diverse voices that "participation becomes infectious"; dead = a channel with no recent posts, or one dominant voice, that new arrivals read as "a freak event" and don't ape (source: https://medium.com/together-institute/…). The killer for a small app is an **empty circle** — a woman opens it, sees nothing, and never returns.

## 2. Sensitive / special-category health circles (PCOS · endo · PMDD · fertility · menopause)

**Findings**
- **The benefit is real and specific: "believed here."** PCOS peer-support study — women valued being able "to discuss issues with people who completely understand," because "people cannot fully understand unless they too suffer with it"; the forum gave information their own clinicians lacked ("I did not know anything really about PCOS and neither did the people giving me the diagnosis") and made them "want to fight it even more" (source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3867626/). This is the exact emotional promise in FemWell's endo line ("The pain that gets dismissed. Here it's believed.") — the research backs the copy.
- **But condition communities carry named risks — build mitigations, not just a feed:**
  - **Misinformation is a public-health-level concern.** JMIR 2025 scoping review (14 studies): misinformation is "a problem, which is a matter of public health concern"; low-quality/"potentially harmful" advice found across conditions; correction happens two ways that FemWell can lean on — **peer correction** ("users … corrected misinformation … through replying") and **surfacing good info** (Reddit-style upvoting floats quality up) (source: https://www.jmir.org/2025/1/e71140). Design implication: FemWell has **no upvote/count** (k-anon), so it needs a *different* quality lever — a light NHS-grounded info anchor per condition circle + easy peer correction + a report path for dangerous claims.
  - **Anxiety contagion.** PCOS study: reading severe cases "makes you feel more anxious … about other people's … more severe problems" (source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3867626/). Mitigation: content-warning affordance on heavy posts; gentle framing.
  - **Cliques exclude newcomers.** "Sometimes there are cliques … and you can't infiltrate them" (source: same). Mitigation: a warm first-post welcome + host, so a newcomer isn't left outside an in-group.
- **UK special-category framing.** PCOS/endo/PMDD/fertility data are health data = **special-category personal data under UK GDPR**; joining reveals a condition. FemWell already gates these behind explicit consent-on-join (`sensitive: true` + `SENSITIVE_CONSENT()`), which is the right lawful-basis posture (explicit consent) — keep the consent copy factual and add a "you can leave any time, and leaving removes you from the member list" line. OSA user-to-user duties (live 17/03/2025) apply to these circles as to any (full canon: `research_talk_rooms_2026-07-08.md` §2). Take UK legal advice on the consent wording before public launch.
- **Content-warning pattern (evidence-based):** a content warning should be **neutral, preparatory, and non-coercive** — it "flag[s] the contents … so readers can prepare themselves to adequately engage or disengage as needed," and neutral "content warning" wording is now preferred over "trigger warning" (source: https://educationexpress.uts.edu.au/blog/2023/10/31/navigating-sensitive-topics/). So: a soft, optional "Sensitive — tap to read" veil on heavy posts (loss, self-harm-adjacent, graphic pain), author-set, never a hard block.
- **How comparable apps do it safely + warmly:** HealthUnlocked runs condition communities as **charity-partnered, moderated** spaces (Endometriosis UK, Verity for PCOS) — the warmth comes from peers, the safety from a named moderating body (source: https://healthunlocked.com/endometriosis-uk, https://healthunlocked.com/communities). FemWell can borrow the *posture* (an NHS/charity-grounded info anchor per condition circle) without hosting a charity.

## 3. Matching / discovery (opt-in, not creepy, whole-life)

**Findings**
- **Surface a few relevant circles, never the whole catalogue.** Onboarding best practice: "strategically surface only the most relevant [groups] … rather than bombarding new members with every group" (source: https://bettermode.com/blog/onboarding-community-members). FemWell's `suggestedCircles(profile)` already does this from `life_stage` + `followed_categories` — the pattern is right; the *presentation* should be "a few for you," not a wall.
- **Progressive discovery keeps it exciting, not overwhelming** — reveal depth over time; "in the first 24 hours a new member should only need to … complete their profile, introduce themselves, and explore one piece of content" (source: https://fluentcommunity.co/blog/community-onboarding-strategies/). Don't push a woman to join 6 circles on day one.
- **A short taste survey is the least-creepy matcher.** "A short onboarding survey … three to five questions can tell you exactly what your members are hoping to get" then "direct members to the Spaces … most relevant" (source: https://fluentcommunity.co/blog/community-onboarding-strategies/). This is opt-in and self-declared — far warmer than inferring a condition from tracked symptoms. **Never suggest a *condition* circle from health-tracking data** (creepy + special-category inference); only suggest condition circles if the woman self-declares the condition or opens it herself.
- **Whole-life balance is a discovery-design duty, not an afterthought.** When FemWell shows "circles for you," it must **interleave a Shared-loves circle beside a Life-stage/condition one** — a Creativity or Books circle next to Menopause — so discovery never reads as "here's your illness." This is the whole-life mandate applied to the suggestion list: the ratio shown should lean interest/stage, with condition circles offered gently and last.

## 4. Per-circle engagement (what keeps a cohort warm)

**Findings**
- **A host / seeded activity is what prevents the empty-circle death spiral.** Critical mass fizzles from "insufficient participation frequency" and low contribution in new formats (source: https://medium.com/together-institute/…). For a small app the fix is a **host presence** — Jess (clearly-labelled AI) seeds a circle-specific prompt and guarantees no post sits at zero (the "no post left unanswered" backstop, canon in talk_rooms §4/R4). Peanut similarly runs expert-hosted Pods inside its stages (source: https://en.wikipedia.org/wiki/Peanut_App).
- **Circle-specific rituals build rhythm.** Repeatable, low-barrier prompts tuned to the circle: Books → "what wrecked you this week"; TTC → "one kind thing you did for yourself in the wait"; Perimenopause → "the symptom no one warned you about." (Ritual-prompt evidence + Mighty Networks canon in talk_rooms §4.) Rituals mark belonging and give lurkers an easy on-ramp.
- **Welcome the first post, per circle.** First-post care is the biggest retention lever (talk_rooms §4). FluentCommunity: a "'Congrats on your first post!' … creates an emotional connection," and a two-week buddy/"Welcome! Let me know if you have any questions" message "can be the difference between a member who disappears and one who becomes a regular" (source: https://fluentcommunity.co/blog/community-onboarding-strategies/). In an anonymous app the "buddy" = the host/Jess + a warm auto-welcome, not a named person.
- **Fuzzy presence, no vanity counts.** FemWell already bans member counts. Keep it: show *that* a circle is warm ("a few women posted here this week"), never *how many* joined. Counts on a small community read as *dead* ("3 members") and shame lurkers. k-anon presence shimmer (talk_rooms §4/R10) is the warm alternative.
- **What kills a circle:** (a) **empty feed** on first open — seed every live circle so it's never zero; (b) **one dominant voice** — the host should amplify quiet newcomers, and reaction-only/thread-lock (talk_rooms §5) blunts a monopoliser; (c) **over-medicalising** — a condition circle that's only symptom-swap curdles into anxiety contagion (§2); tint it with life beyond the condition (a PCOS circle can also talk recipes, dating, work).

## 5. Safety & warmth (the calm "safe on the surface" model, applied to circles)

All the heavy safety machinery is shared with the rest of Community and is fully specced in `research_talk_rooms_2026-07-08.md` — **reuse, don't rebuild:** OpenAI Moderation on publish (free, OSA "systems to reduce illegal content"), crisis pre-check → Samaritans 116 123 / NHS 111 / Shout 85258 / Mind, believed-by-default report→hide, hide-author-hash / mute, reaction-only + thread-lock, rate-limit, botanical alias, single-sex + 18+ policy page. **Circle-specific additions on top of that floor:**
- **Consent-on-join for sensitive circles** (already built) — keep, and add "leaving removes you from the member list."
- **Author-set content-warning veil** on heavy posts in sensitive circles — neutral, "tap to read," never a hard block (source: https://educationexpress.uts.edu.au/blog/…).
- **A per-condition NHS/charity info anchor** (one calm line + a link) at the top of each condition circle — the k-anon substitute for upvoting good info, and a misinformation counterweight (source: https://www.jmir.org/2025/1/e71140).
- **First-timer welcome tone:** "you're not too much / it's believed here" — evidence-backed by the PCOS "completely understand" finding (source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3867626/). Warm, never clinical.
- **No exact counts anywhere** — reinforced by both the k-anon stance and the small-community "3 members looks dead" risk (§4).

## 6. Ties into the rest of the app (whole-life, not a symptom tracker)

- **Profile / onboarding → discovery:** `suggestedCircles(profile)` already reads `life_stage` + `followed_categories`. Extend the *interest* map, and **only** infer condition circles from self-declaration (§3).
- **Journal → circle:** "whisper this to your circle anonymously" from a journal entry (strip identity, keep the words) — the highest-leverage first-post bridge (talk_rooms §6). A TTC journal entry can whisper to the TTC circle.
- **Health / conditions → condition circle (opt-in only):** if a woman has self-declared PCOS/endo/PMDD in Health, offer (never auto-join) the matching circle with the consent gate. Never surface a condition circle from *tracked symptoms* (special-category inference, creepy).
- **Life-stage → stage circle:** a stage change (e.g. entering perimenopause) can gently offer the matching circle — offer, not tint-everything.
- **Programs / Events / Library:** a circle thread can surface a relevant Program (perimenopause sleep → Sleep program) or a local Event as a soft inline card, never a hard sell. **Books circle already hosts the seasonal shared read** (BooksCircleSharedRead → Jess-hosted Book Club) — this is the template for interest circles tying into Library/Events.
- **Jess:** per-circle host — seeds the ritual prompt, backstops "no post left unanswered," and can drop ONE supportive reply on a heavier post (clearly labelled AI; misinformation/false-dependency guardrails from talk_rooms §3).
- **Pulse / Trends:** aggregate, k-anon circle sentiment ("the Menopause circle has been talking about sleep this week") feeds Pulse **without** surfacing any individual or any count.

---

## Ranked recommendations (impact × effort)

| # | Recommendation | Impact | Effort | New entity / fn / creds? | Source |
|---|---|---|---|---|---|
| C1 | **Seed every live circle so no circle is ever empty on first open** (host/Jess starter posts + ritual prompt) | High | Med | Reuse Jess + CommunityPost; no new entity | Empty circle = death (https://medium.com/together-institute/…; https://dl.acm.org/doi/10.1145/1718918.1718932) |
| C2 | **Per-circle host + "no post left unanswered" backstop** (Jess, clearly-labelled) | High | Med | Reuse Jess; no new entity | Host prevents fizzle; first-post care (FluentCommunity; talk_rooms §4) |
| C3 | **Circle-specific ritual prompt** (rotating, life-tinted, one per circle) | High | Med | New: `circlePrompts` static map + a `dailyPrompt` slot; no entity | Rituals build rhythm (Mighty/SDT, talk_rooms §4) |
| C4 | **Warm first-post welcome per circle** ("Congrats on your first post" + "believed here" tone) | High | Low | Reuse createCommunityPost hook; no entity | Biggest retention lever (FluentCommunity; PCOS study) |
| C5 | **Author-set content-warning veil** on heavy posts in sensitive circles (neutral "tap to read") | High | Med | New field `CommunityPost.content_warning` (bool/label) | CW best practice (https://educationexpress.uts.edu.au/…) |
| C6 | **Per-condition NHS/charity info anchor** (one calm line + link atop each condition circle) | High | Low | Static map in circlesConfig; no entity | Misinformation counterweight (https://www.jmir.org/2025/1/e71140) |
| C7 | **"A few circles for you" discovery card** — surface `suggestedCircles`, interleave a Shared-love beside stage/condition, offer condition circles gently+last | High | Low | Reuse suggestedCircles; no entity | Surface few not all; whole-life (Bettermode; whole-life mandate) |
| C8 | **Journal → "whisper to your circle" bridge** | High | Med | Reuse createCommunityPost; no entity | First-post bridge (talk_rooms §6) |
| C9 | **k-anon circle warmth cue** ("a few women posted here this week" — never counts/members) | Med | Low | Reuse post query; no entity | No vanity counts; small-count looks dead (§4) |
| C10 | **Short taste survey → circle suggestions** (3–5 Q, opt-in) if profile taste is thin | Med | Med | Reuse followed_categories write; no entity | Least-creepy matcher (FluentCommunity) |
| C11 | **Leave-removes-you consent line** on sensitive-circle consent copy | Med | Low | Copy-only edit to SENSITIVE_CONSENT | UK GDPR special-category posture (§2) |
| C12 | **Reaction-only / thread-lock reuse in circles** (blunt a dominant voice) | Med | Low | Reuse comments_mode already on composer | One-voice kills circles (§4; talk_rooms §5) |
| C13 | **Pulse: k-anon per-circle sentiment strip** ("Menopause talked about sleep") | Med | Med | Aggregate query; no entity | Whole-life tie, no individual/count (§6) |
| C14 | **Interest → circle map expansion** (more `followed_categories` → circle mappings) | Low | Low | Edit INTEREST_TO_CIRCLE | Better discovery (§3) |

**Legend:** Nearly everything is **buildable now on existing entities** (CIRCLES catalogue, CircleMembership, CommunityPost, Jess, suggestedCircles). Only C5 needs a **new field** (`CommunityPost.content_warning`). No new DB *entity*, no external creds beyond the already-in-plan OpenAI Moderation key (talk_rooms/R1). Do **not** add a `Circle` entity (existing decision, circlesConfig.js).

## Recommended robust v1 (5–7 items)
1. **C1 — Seed every live circle** so it's never empty (the single highest-impact anti-death move).
2. **C2 — Per-circle Jess host + no-post-left-unanswered** backstop.
3. **C4 — Warm first-post welcome** per circle ("believed here" tone).
4. **C6 — Per-condition NHS/charity info anchor** (misinformation counterweight + calm).
5. **C7 — "A few circles for you" discovery card**, whole-life interleaved, condition circles gentle+last.
6. **C5 — Author-set content-warning veil** on heavy posts in sensitive circles.
7. **C3 — Circle-specific ritual prompt** (rhythm for lurkers to step in).

This gives: never-empty circles, a host that guarantees a reply, a warm door for first-timers, a misinformation guard, opt-in whole-life discovery, sensitive-post care, and a repeatable reason to return — all on existing entities bar one field.

## 6–8 warm mechanics to build
1. **Circle host "first light"** — Jess opens every live circle with one warm, on-topic post so it's never zero; posts a rotating ritual prompt.
2. **"Congrats on your first post"** whisper the moment a woman first posts in a circle — plus a "you're not too much / it's believed here" welcome line in sensitive circles.
3. **Circle ritual of the week** — one low-barrier prompt per circle (Books: "what wrecked you"; TTC: "one kind thing in the wait"; Perimenopause: "the symptom no one warned you about").
4. **"Tap to read" content veil** — author-set, neutral, on heavy/graphic posts; lets a woman prepare or skip, never a hard block.
5. **k-anon warmth shimmer** — "a few women posted here this week" / "someone's reading now" — presence without any count or member number.
6. **Whisper from Journal** — end a journal entry with "keep this private, or whisper it to your [TTC] circle anonymously?"
7. **A few circles for you** — a gentle discovery card (interest circle beside stage circle; condition circles offered softly, last), never the whole wall, never inferred from symptoms.
8. **Quiet peer-correction affordance** — an easy, kind way to add "actually, my GP said…" under a shaky health claim (the k-anon substitute for upvoting good info).

## Keeping sensitive circles safe + warm (playbook)
- **Consent-on-join** (built) + add "leaving removes you from the member list" — explicit consent is the UK GDPR special-category posture.
- **Never infer a condition circle from tracked symptoms** — only self-declaration or the woman opening it herself. Inference is both creepy and special-category profiling.
- **Per-condition NHS/charity info anchor** — one calm, evidence-grounded line + link at the top; the misinformation counterweight in a no-upvote app.
- **Author-set content-warning veil** on heavy posts — neutral, preparatory, optional.
- **Warm first-timer tone** — "believed here," never clinical; the PCOS "completely understand" finding is the emotional spec.
- **Tint the condition circle with life** — recipes, dating, work belong in a PCOS circle too; a pure symptom-swap curdles into anxiety contagion.
- **Shared safety floor** — OpenAI Moderation on publish, crisis pre-check, believed-by-default report→hide, hide-author-hash, reaction-only/lock, no counts (all reused from talk_rooms; do not rebuild).
- **Legal review** of the sensitive-consent wording + single-sex/age framing before public launch (not legal advice).

## Sentiment quotes (women on condition peer support)
- PCOS forum member, via PMC qualitative study: it is "fantastic to be able to discuss issues with people who completely understand," because "people cannot fully understand unless they too suffer with it" (https://pmc.ncbi.nlm.nih.gov/articles/PMC3867626/).
- PCOS forum member, same study, on empowerment: "Knowing what things should be done allows you to be more assertive" with clinicians (https://pmc.ncbi.nlm.nih.gov/articles/PMC3867626/).
- PCOS forum member, same study, the risk side: reading severe cases "makes you feel more anxious when you read about other people's … more severe problems," and "sometimes there are cliques … and you can't infiltrate them" (https://pmc.ncbi.nlm.nih.gov/articles/PMC3867626/).

## Recommended approach for Mr Lead Manager
Spec as **one MP on top of the Community safety floor** (which ships first from talk_rooms MP-A). CIRCLES v1 = C1, C2, C4, C6, C7, C5, C3. All buildable now on `CIRCLES` + `CircleMembership` + `CommunityPost` + Jess + `suggestedCircles`; the only schema change is `CommunityPost.content_warning` (C5). No new DB entity (keep the curated-catalogue decision). Whole-life gate: the discovery card (C7) MUST interleave a Shared-loves circle beside any stage/condition one, and condition circles are offered gently and last — never inferred from health tracking.
