# Living Lifestyle, connected — 5 October 2026

Status: revised after the live visual and backend-contract audit on5 October. Halli approves Sky Living as the design base. Exactly five new connected visual demos are requested; they are not yet built by this plan. Main-page promotion remains separate. Working assumption: each direction covers all five Lifestyle sections, using Sky as the first proof. Existing base and older comparisons stay available outside the five. Engineering evidence and unresolved repairs: claude-state/connected-life/reality-audit-2026-10-05.md. Detailed per-atom queue: claude-state/connected-life/atom-workflow.md.

## The outcome

A beautiful page should lead to something meaningful: a saved thought, a conversation about the exact thing, an invitation, a shared activity, and a useful return. No extra social feed on every page. No automatic sharing. Phase-based recommendations alone do not constitute connection.

## 0. What the actual app changes about this plan

Read the live pages before designing their connections. This pass inspected signed-in Lifestyle’s main page and the five Living sections, Today, Journal, Nutrition’s cooking and planning views, Health, Pulse, Insights, Planner, Programs, Profile, Doctor Export’s selection stage, Events, Deals, Garden and Jess. It traced routed handlers and checked 23 deployed data models without querying private records. Community and DMs remain behind the 18+ confirmation: room and recipient journeys are not visually verified yet. This is a baseline inventory, not proof every button persists or every state works.

| Existing place | What is really there | What the next work changes |
|---|---|---|
| Sky | Full personal reading, chart, diary and questions; phase lesson deep inside the cycle card. | Give the public daily lesson a clear place near its reading, preserving the entire private cycle feature. Save the lesson itself; conversation returns to it. |
| Books | Serial, monthly choice and club are three separate books/objects. A raw heading appears where the chapter excerpt belongs. | Repair the excerpt and resolve the live club pick/checkpoint. Each action names its actual book; no copied generic discussion. |
| Listen | Inline players, external shows and videos; playback persistence is implemented in source, with resume still to prove. | Resume the real paused episode in the existing lead. Keep all items; make secondary presentation less repetitive. |
| Good life | Time bands, joys and eleven rooms; the few-minutes selection offers a 45-minute episode. | First make available time match real duration or time remaining. Plan the chosen activity directly, with a real time choice. |
| Read / Yours | Essays, stories, continuation and saves; more than one saved-item system. | Reconcile the saved object and exact reading place. Measure editorial breadth and duration before ordering; keep existing content. |
| Today | Existing day/loop/across-your-day slots already span the app. | Replace vague resumptions in those slots with exact saved items, accepted plans or source-specific replies. No additional feed. |
| Journal | Private pages plus existing Echo/Witness/Threads/circle flows and source-linked reflections. | Preserve its consent chooser; keep an optional return to the original lesson/session. Private writing does not automatically become social. |
| Nutrition | Pantry, real recipe video/ingredients, shopping, saved weeks and a planning sheet. Kitchen-table sharing currently keeps a private note. | Reuse the existing kitchen journey with exact recipe identity. Repair the misleading sharing promise before adding Community delivery. |
| Health / Pulse / Insights | Letters, pattern evidence and private export actions; some context and summary statements disagree. | Align personal context and evidence first. Offer a selected experiment or editable appointment question, with source dates visible. |
| Planner / Programs | Real day boards, active programme, reminders and linked reflections. | Repair mismatched planning/progress fields, then exact session/source return and deduplicated chosen times. |
| Profile / Doctor Export | Identity/privacy controls; account export says future update. Doctor Export has explicit section selection. | Verify privacy promises and preserve selected inclusion. Never treat the visible account-export button as a completed download. |
| Community / DMs | Existing rooms, request/accept/block/report infrastructure in source; live audit stops at age check. | Prove recipient consent, delivery, isolation and the return before adding rich content invitations. |
| Events / Deals | Save/share/destination controls; events mix past and upcoming listings. Existing RSVP and go-together groups exist. | Freshness and stable identity first. Reuse RSVP/pods; verify exact product offers and endorsements. |
| Garden / Jess / notifications | Existing activity readback, assistant actions and notification routes. | Correct provenance and context; one useful continuation, truthful success and private lock-screen wording. |

The biggest prerequisite is consistency: one selected personal profile, one date/phase result, honest unknowns, stable content IDs and correct read/write/return contracts. Smart connections built on conflicting context would amplify the error. Fixing these does not mean removing features.

## 1. Exactly five design demos

Same features and real states in every demo: full title/heart/species/profile; section selection; context and Everything; both contextual actions; complete glance/Jess; continuous content; meaning, motion/reduced-motion and failure recovery. One comparison control in Ideas; no new navigation inside Sky.

| Direction | What changes materially | Botanical language | Watch for |
|---|---|---|---|
| Open Letter | White reading/summary surface meets the open masthead; actions sit at the transition. | Growth crosses behind the surface edge; the page feels like a personal letter. | No aged paper, generic seals or duplicated summary. |
| Garden Horizon | Wide, shallow asymmetric scene; full wording in a clear interval; useful content arrives earlier. | Each section has a distinct horizontal silhouette and light continuing into controls. | Must not become a boxed banner or crop text. |
| Quiet Observatory | Title first, a centred meaningful focal object, full profile and actions, then full-width reading. | Sky's real Moon; botanical structure/rhythm gives other sections their own focal gesture. | No identical wreaths or huge circular badges. |
| Field Notes | Type leads; compact complete header, direct actions and early summary; living margins. | Recognisable veins, bells, tendrils and petals at useful phone scale. | Compact must not mean sparse, clinical or stripped. |
| Garden Path | One diagonal botanical gesture relates the header, actions and summary, with clear text spaces. | Bespoke silhouettes guide the eye down the existing continuous page. | No false progress trail, clutter or extra taps. |

Across all five: Read = iris / curiosity and noticing; Listen = bluebell / sound and attention; Books and Story = jasmine / a place in a story; Sky = morning glory / measured Moon and lightly mythical wonder; Good life = marigold / warmth and small pleasures. Yours retains forget-me-not where surfaced. Preserve full existing headings and profiles; vary short supporting lines, not substantive information. Human, concise, educative and occasionally funny; original approved Living remains the reference. Current Bible type/colour rules override stale roster tokens.

Sky parity checklist for every variant: chart setup/edit and unknown birth-time handling; full reading and explanations; Moon lessons; private reflections and read state; yearly movements and full diary; questions and their history; compatibility; existing atelier; preferences and all meaning controls. Keep their real handlers and honesty/availability states.

Each demo must show the whole connected page, not a detached header picture. Capture all five sections at 360/390/430, long names/headings, empty/loading/error states and actual taps. The five must be recognisably different even in greyscale. Review one complete direction before polishing all five, without claiming that intermediate build fulfils the five-demo request.

## 2. One smart daily Sky lesson

Replace the current eight-button phase grid presentation with an authored lesson deck inside the existing Sky section. Retain all eight phase explanations in the deck/archive. One daily lead lesson; manual swipe reveals genuinely different lessons, not fragments of one explanation. Previous/next buttons, position text and keyboard controls provide the same access. No autoplay, locked sequence or extra Sky subsection.

Each lesson: stable ID/version, title, 35–65-word idea, one useful observation, source, astronomy/folklore/reflection label where relevant, and optional rosette explanation. Example: **The Moon does mornings, too.** Around last quarter it generally rises near midnight and sets near midday. “Night sky” was never an exclusive contract. Local visibility still depends on place, weather and horizon.

Daily rule: use the person's configured timezone, with explicit fallback; choose deterministically by local date from an editorial sequence, favour a relevant current-phase lesson when available. Explain the selection in a short “Why today?” note. One lead lesson per day; stable across reloads and devices. Do not rotate every refresh, reset the card being read at midnight, repeat one definition throughout a week-long phase, or invent a streak. Offer the new lesson after midnight when the user returns to the lead position. Saved lessons keep their version. Propose an initial 32-piece reviewed collection: existing 8 phase explanations plus 24 distinct topics; measure and author the collection before claiming daily depth.

Executable selection proposal: publish a versioned editorial date-to-lesson schedule, with phase relevance curated into that schedule. The scheduled ID wins; current phase never replaces it midway through a day. All devices resolve the same configured timezone/date and schedule version. If a scheduled source is unavailable, use a deterministic date-indexed evergreen lesson from a reviewed fallback list; show its actual title, never a fabricated daily lesson. Rotate topics before repeats; after the reviewed library is exhausted, label revisits honestly. Do not claim personalised unseen filtering without persisted read state. Keep saved lesson IDs/versions and offer substantive revisions explicitly; factual corrections must remain discoverable. All eight phase explanations remain directly findable in the archive.

Save privately to Yours, return to the same lesson from Today, optionally schedule an observation in Planner. Sharing a public lesson never shares the personal horoscope/chart, cycle dates or private reflection. Exact local sky predictions require their own data; decorative stars are not predictions.

## 3. One connection contract, bespoke journeys

Use a stable typed reference for a piece of content or an activity, not copied titles or a URL containing private prose. Proposed fields: kind, ID, version/checkpoint, safe title, canonical destination, access class. The server resolves what the current viewer may see. Private annotations are separate records, never an attachment's default payload. Existing book IDs/Gutenberg IDs and Planner source/ref must be reconciled, not replaced.

The UI should show relevant context where it belongs: **Continue your conversation**, **Open this lesson**, **Plan a time**, or **Read from this chapter**. A generic “Discuss” link alone is not completion. Replies and accepted invitations return to the source item; private completion and public participation remain separate. Receiving a recommendation does not auto-save, auto-join or add a calendar item.

| Lifestyle section | Meaningful shared object and activity | Return to her own life |
|---|---|---|
| Read | Exact article/authorised excerpt → topic discussion or accepted DM, with her optional message. | Reply attached to article; private reflection; save/resume exact item. |
| Listen / Watch | Episode/video and optional timestamp → discuss a moment or invite someone to listen. | Reopen the timestamp, independently schedule; no synchronised playback claim until implemented. |
| Books / Story | Existing book + chapter/checkpoint → club/buddy discussion with spoiler position. | Same shelf/reader position; accepted reading slot in Today/Planner. |
| Sky | Public authored lesson → discussion, observation invitation or accepted DM. | Replies reopen lesson/date; personal chart and horoscope excluded by default. |
| Good life | Real activity/recipe/event → optional invitation with an agreed time. | Each person accepts and schedules independently; private reflection afterwards. |
| Yours | Private library of saved and deliberately accepted incoming items. | Exact-item reopen, source conversation where permitted, remove without notifying others. |

Three first journeys to prove: lesson→save/reflection→discussion→reply→lesson; book/episode→conversation→agreed time→Planner/Today→resume; Good life activity→invitation→independent acceptance→shared plan→private follow-through.

## 4. Whole-app roles

| Surface | Reads / writes / social boundary |
|---|---|
| Today | Resume actual saved content, accepted plans and reply summaries; link to exact source; no invented activity. |
| Journal | Private reflections tied to a source; only an explicitly selected extract may be shared; sharing the source reveals no entry. |
| Community | Item-specific conversations and activity invitations; returns to original content; pseudonymous identity remains consistent with consent. |
| DMs | Accepted one-to-one conversation with safe source context; message requests, decline/block/report/leave; no automatic move from public interaction. |
| Nutrition | Recipe/cooking activity → meal plan, ingredients and optional invitation; logs/allergies/health details stay private by default. |
| Lifestyle | The section-specific journeys above; common references, bespoke interactions. |
| Health | Private chosen goals/actions can inform personal planning; no automatic symptom/cycle disclosure or social inference. |
| Pulse / Trends / Insights | Explain private patterns and link to underlying records; user explicitly chooses any shareable extract. |
| Planner | Exact source references and agreed activities; per-person acceptance; reschedule/cancel reflected where relevant. |
| Profile | Manage identity, contact preferences, invitations and sharing defaults; defaults do not silently rewrite past item permissions. |
| Programs | Specific session/cohort invitation → own plan and return to session; public participation separately consented, no leaderboard. |
| Doctor Export | Deliberately selected health information for the chosen recipient; exclude social history, astrology and lessons automatically. |
| Jess | Retain requested source context and suggest an actionable next step; never message, post, invite or reveal private DM content on her behalf without instruction. |
| Events | Invite/RSVP/plan/updates use one event reference; attendance and precise location are audience-controlled. |
| Deals | Deliberately share a real offer/product; no health-targeted disclosure or automatic purchase/activity announcements. |
| Garden / progress | Reflect verified private participation without scores/streaks; social display of activity is separately chosen. |
| Notifications | Actionable replies, accepted invitations and changed plans; correct exact destination, deduplication, quiet/mute controls, private lock-screen wording. |

“Everything connected” means every feature has a considered role. It does not mean every private record becomes social.

## 5. Privacy is part of the journey

Public editorial objects, personal actions, private reflections, shared extracts and accepted plans are separate. Before sending: show the exact object/text, identity and audience; exclude sensitive fields by default. Anonymous Community identity never silently resolves to a name/email. Receiving is not consent to chat. Use existing request/accept/block/report/leave infrastructure and repair its actual gates first.

Server tests must prove sender and recipient eligibility, participant isolation, persistent blocked-pair checks even after leaving/re-requesting, preference enforcement, rate limiting, moderation before delivery and safe moderation-unavailable handling. Private source titles and notification previews must not leak across accounts. Deleted/revoked sources render a neutral unavailable state. Revoking an in-app attachment cannot recall screenshots or copied text; distinguish access revocation from deleting a historical message.

Selected Journal/Pulse extracts refer only to separately approved, consented internal flows. Preserve the existing external-sharing wall for journal entries, anonymous/member material and other private sources; this plan does not authorise external export of those records. Personal horoscope readings remain private by default. Any future exception needs explicit policy and implementation review.

Existing DMs are text-only. Typed internal content references are a proposed bounded extension, not permission for arbitrary files/media/URLs. Schema changes and identity decisions require a separate concrete review before deployment. No new Base44 function names; extend current dispatchers.

## 6. Source audit: repair before expansion

The new reality audit records visual, source and deployed-schema evidence separately, plus unresolved P1/P2 repairs. No live exploit or passed two-account audit is claimed. Its prerequisites include inconsistent profile selection/phase fallback, Jess/Planner field mismatch, duplicate saves and playback paths, programme-status mismatch, event identity/freshness, truthful Nutrition sharing and privacy acknowledgements, and source-linked private evidence. The original destination findings below remain unresolved:

- SkyFocus.jsx:177 sends room=the-sky; Community.jsx:3171 room allowlist does not accept it.
- SkyFocus.jsx:178 sends Jess detail.seed; ContentActionBar.jsx:62 sends context; Layout.jsx:36 only consumes prompt/initialPrompt. Consolidate one structured context contract.
- createCommunityPost/entry.ts:422 sends DM notification to ?view=dm; Community.jsx:3187–3188 only parses bookclub/mentor there.
- PlannerItems.jsonc:39–45 supports source/ref; Books writes them; Planner.jsx:2028–2053 lacks a content-opening action. Good life Planner writes at LifestyleEliteShell.jsx:787–800 omit source/ref.
- dm.request at dispatcher314–356 needs preference and persistent-block review; duplicate matching considers pending/active. Moderation-unavailable delivery at403–415 and client-side age comment at285 require targeted tests and correction before expansion.
- shareCard.js:17–38 broadly allows horoscope despite named personal-source exclusions; distinguish public lesson from private reading.
- Message.jsonc has text body/status, no typed content attachment; current source plans must not claim otherwise.

Reuse existing ContentActionBar, UserBook shelf, BookClubPick/checkpoints, PlannerItems, Conversation/Message and createCommunityPost dispatcher. Older APP_CONNECTIVITY_MAP.html proposed outbound action bars; this plan adds exact identity, receiving, permissions and the return loop rather than creating another parallel system.

## 7. Delivery and acceptance

Acceptance checklist, not a build sequence; §10 is the authoritative foundation-first order, with visual comparisons allowed in parallel.

1. **Design comparison:** exactly 5 connected demos in Ideas, approved base separate. Same capabilities across variants, all section species/voice intact. Halli chooses direction; no automatic main promotion.
2. **Repair connection foundations:** route/context/Planner return defects, privacy and DM gates. Test allowlisted destinations, cross-account denial, blocks/retries and moderation failure. No new social capability until gates pass.
3. **Daily lessons:** authored sources, date-stable selection, swipe/tap/keyboard, archive/save. Tests for timezone/midnight, reload stability, unavailable content and font/gesture/reduced-motion behaviour.
4. **One complete Sky journey:** source→conversation→recipient→reply→source, plus optional private planning. Two test accounts; no real messages during verification without explicit test-send authorisation.
5. **Books/Listen and Good life journeys:** preserve spoiler state, source IDs and independent acceptance; then add adapters for all surfaces in the matrix.

Per piece: mapped atoms → cited research → meaningful implementation → Ideas review →360/390/430 actual taps → independent P0/P1/P2 audit → evidence and Bible updates. Proposed atoms: five full-page compositions; daily selector; lesson card/source/help; deck controls; saves/archive; typed reference resolver; permission preview; content discussion; consented DM attachment; recipient inbox; return links; accepted plan synchronisation; notification destination/muting; per-surface adapters. Each carries loading/empty/error/permission-denied/deleted states. New schemas/backend delivery remain separately scoped.

The earlier pass produced five craft briefs and the initial Ideas plan. This correction adds the live-screen/backend-contract map and microscopic workshop protocol. Still requested: five built demos, lesson implementation and connection repairs/journeys. No claim those are already delivered by planning.

## 8. Big map, then minuscule by minuscule

Every feature starts with its actual screenshot, record and callback. Before each small build, complete one worksheet: current job; exact item and owner; useful relationship; private outcome; optional other-person loop; placement; added taps/decisions/height; permission and disclosed fields; loading/empty/error/stale/offline/denied states; undo; focused research; alternatives; proof. “None useful” is a valid social decision for a private feature. Nothing gets a generic share strip just to look connected.

For each atom, compare two or three concrete alternatives, choose the smallest useful experiment, build it with real substance, then read what the result actually does to the whole page. Use current state, not a hypothetical perfect page. Reopen the brainstorm when a new relationship or obstruction is discovered. The master map guides the work; it does not replace this thinking.

| First workshop | Alternatives we will test | Useful correlation and placement | Proof before the next atom |
|---|---|---|---|
| Daily Sky lesson | Below the daily reading; beside its carry-it actions; current cycle placement retained as comparison. | Public lesson/date/version and chosen observation. Concise lead, manual swipe/tap, small meaning dot. Personal cycle card stays complete. | Whole-page phone comparison; all eight definitions reachable; no swipe-only access or automatic sharing. |
| Keep this lesson | Existing local saved library; unified saved reference after reconciliation; separate lesson library rejected unless a real gap remains. | Save the exact lesson/version beside it; optional private note in existing reflection flow. | Save/undo/reload/device return, content correction and unavailable states; no chart attached. |
| Resume this episode | Existing first/new episode; actual paused episode as lead; compact resume line above current lead. | PodcastListens plus supported episode identity/position. Direct play remains visible; secondary details keep transcript/source. | Same position through Listen/Good life/Today, unsupported provider honesty and user-controlled playback. |
| Talk at this checkpoint | Generic room; exact existing club checkpoint; consented buddy invitation later. | Same book/pick plus explicit reached position. Improve the existing club action; no additional book feed. | Correct spoiler gate, another-account receiving, reply notification and return to the same checkpoint. |
| A small joy → a time | Immediate default appointment; inline time choice; existing planning sheet with exact activity. | User-selected activity and accepted time; action belongs on that chosen card. | No unexpected time; persisted source, repeat-tap deduplication, failure/undo and exact return. |
| A recipe → the week | Copy its title; reference actual recipe; stable ingredient snapshot when source cannot persist. | Pantry/ingredients plus actual selected week. Existing recipe shopping and Plan sheet do the work. | Correct recipe opens, list deduplicates, saved-week date clear, private dietary fields excluded from sharing. |

## 9. How we keep the page welcoming

Keep the approved little-garden header, full glance/Jess and section-specific action pair. Make the useful first decision clear. Preserve all content and functions while testing compact secondary rows instead of repeating a large illustration and full player for every item. Source-linked actions live where the person is already reading, listening or planning; no separate dashboard of connections and no new subsections inside Sky.

Frequent actions stay visible and consistently placed. Secondary tools can use one clearly named contextual layer, with no long-press-only discovery. Reply or plan state appears only for the exact item and permitted audience; its absence must not leave empty social chrome. Measure added decisions, taps and vertical space against the current screen. A tiny botanical control retains a generous touch target. These presentation choices bend to the no-strip rule.

Smart, specific possibilities for later atoms: available minutes plus real time remaining; article plus its existing practical-session reference; pantry plus chosen recipe and week; programme day plus its linked private reflection; goal’s next action plus chosen task; current event plus RSVP and existing pod; observed pattern plus its contributing dates and a chosen experiment. None means an automatic panel or health-driven social suggestion.

## 10. Build order and honest checkpoints

1. Inventory current source and pixels; finish Community/recipient inspection after Halli completes the age check. Trace unclear promises and duplicate stores. Record evidence level per connection.
2. Repair one trustworthy-context atom, then planning/reference/return contracts and consent/delivery gates. Re-prove each repair; never batch several unproved connections into a polished shell.
3. In parallel with those foundations, produce exactly five distinct complete Living visual demos with clearly labelled prototype states where backend capability is unproved. Design work cannot claim a working social feature.
4. Start the daily lesson workshop: authored substance, placement alternatives, deck access, date identity, save/return, then optional observation plan. Each is its own researched atom.
5. Prove one complete source→person→response→return loop with two authorised test accounts. Extend Books/Listen/Good life and other surfaces only after their own minuscule brainstorms.

Each Ideas build includes its working preview, short research/decision record, verification and known gaps. Halli’s go-ahead is required for main promotion. This cycle delivers the grounded map and workflow; the five working demos, feature repairs, daily deck and two-account social proofs remain build work.

## Primary references, checked 5 October 2026

- NASA Moon phases: https://science.nasa.gov/moon/moon-phases/ — phase mechanics and broad rise/set relationships; no exact local forecast inferred.
- WAI carousel: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ — controls, slide identification and predictable focus.
- WAI pointer gestures: https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html — tap alternatives to swiping.
- StoryGraph buddy reads: https://thestorygraph.freshdesk.com/support/solutions/articles/79000141943-buddy-reads-and-readalongs-on-the-storygraph — book-specific discussions and checkpoints.
- Spotify Jam: https://support.spotify.com/uk/article/jam/ — explicit joining and participant control; not evidence FemWell supports synchronised playback.
- Discord Message Requests: https://support.discord.com/hc/en-us/articles/7924992471191-Message-Requests — recipient-controlled requests separate from shared Community membership.
- Strava activity privacy: https://support.strava.com/en-us/articles/15401987-how-do-my-activity-privacy-controls-work-on-strava — item-level audience control distinct from defaults.
- NN/g progressive disclosure: https://www.nngroup.com/articles/progressive-disclosure/ — frequent actions visible, specialised tools on demand; not authority to strip functions.
- NN/g contextual menus: https://www.nngroup.com/articles/contextual-menus/ — discoverable contextual commands and limited submenu depth.
- Frame.io timed comments: https://help.frame.io/en/articles/9105251-commenting-on-your-media — exact moment/range references and return; FemWell seeking remains provider-specific.
- Google Calendar invitations: https://support.google.com/calendar/answer/37135?hl=en — accept versus another-time proposals and clear response visibility.
- WAI status messages: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html — quiet accessible save/send/error feedback without focus theft.
- WAI target size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html — small visible ornaments still need usable target areas.

Product translations are our proposals, not claims these sources prove user demand or legal compliance. Bible conformance: §§1–3,2.7,10.5.9–11,11,15,17.3,19.7–9.
