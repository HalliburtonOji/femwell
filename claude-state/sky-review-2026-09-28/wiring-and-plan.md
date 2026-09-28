# Sky: wiring inventory and build plan

Mr Lead Manager · 28 September 2026 · baseline `0ca46a5` (scope claim), previous application release `8caf8bc`.

## Scope and evidence

Halli has corrected the sequence: Sky/horoscope is unfinished and remains the active section. Read does not take priority over it. Every build and its research/verification belong in the organised Ideas Dev area; promotion into the main page requires Halli's explicit go-ahead. The two focused action pills stay present and change their jobs with the selected section. No feature removal is authorised.

This is a **static source audit**, not authenticated live verification. Read the current SkyFocus and SkyMovements in full, their hooks, chart sheet, original modular HoroscopeTab, relevant original sections, three generation endpoints, purchase endpoint, schemas and receiving routes. Historical v2 specs/audits are useful inventories, not proof of current behaviour. The parent owns deployment, shared memory and live checks. No application code, function, schema or shared memory was edited by this agent. No payment, profile write, Community age acceptance or account probe was performed.

Brand gates: §2.7 clean surfaces; §6.7.0a two focused pills; §6.7.8 reader; §10.4 hope-only rails; §§11–12 atoms, sources and truthful content; §§14–16 backend limits, proof and identity; §17 preservation; §19 composed, connected, functional. This audit finds failures against these gates; it does **not** certify conformance.

## What actually renders

- `/LifestyleBespokeDemo` uses the shared shell's clean focused layout. Shell `LifestyleEliteShell.jsx:1589` mounts `SkyFocus` for `focusSection=sky`.
- The shell's sky overlay also renders clean SkyFocus (`LifestyleEliteShell.jsx:1688`), despite its stale comments describing the old full reader. Summary row uses a separate compact `ReadingSheet` (`:1726`). A successful overlay tap does not prove the inline callback path, and a successful compact sheet does not prove full Sky.
- Original modular `components/horoscope/HoroscopeTab.jsx` supplies a useful no-strip baseline: chart/triad, goddess bench, weather, cycle dial, historical diary, red-white classification, annual profections, compatibility, ask, quiet settings, science/privacy, published Atelier, paid shelf and content actions. Some of its own logic is defective, so copy neither its presentation nor its bugs wholesale.
- The clean component's comments claim eighteen-part parity. The implementation contradicts that: fixed null props, fabricated diary data and mismatched contracts prevent parity.

## Atom inventory: every current Sky interaction

All paths below are statically traced. Live rendering, authorisation and successful persistence still need proof.

| Atom / visible action | Handler and destination | Read/write contract and finding |
|---|---|---|
| No-chart summary | `SkyFocus:214` | Computed lunar phase; honest birth-date requirement, but most original no-chart preview content has disappeared behind early return. |
| Set up your sky | `SkyFocus:220` → BirthDataSheet | Sheet opens; actual save is AstroProfile create. Sign-in guard at save. |
| Edit your chart | `SkyFocus:254` → same sheet | Existing AstroProfile update, then generation invocation. Derived chart fields remain stale after changed birth inputs; see P1. |
| Date/day/month/year controls | `BirthDataSheet:44–151` | Day clamp happens on day/month changes, not after changing year. Save only tests nonempty ISO, not valid calendar date/future date. |
| Birth time and place | `BirthDataSheet:176–223,369–394` | Place searches public Nominatim after 350ms, selected label only; coordinates/timezone are not retained. No keyboard option navigation implemented. |
| Save/update chart | `BirthDataSheet:304–330` | Writes user_id/date/time/place/sun, then fire-and-forget generateHoroscopeReading; generation errors swallowed. Returned chart local state does not refresh generated placements. |
| Cancel / close / backdrop | `BirthDataSheet:337–349,400–406` | Close callbacks; safe-sheet class present, no evidenced focus trap/restoration. |
| Share today's sky | `SkyFocus:233,248` → ShareButton | Headline artifact; shared URL is site root, not this reading. Inspect shared renderer/mobile share/cancel separately. |
| Today / You / Tides / Year / Ask / Atelier / Yours jump strip | `SkyFocus:60–76` | Scrolls local refs; functional native action, no current-section state and sub-44px estimated button height. Must test clipping/keyboard/reduced motion. |
| Sun triad | `SkyFocus:85,295` | Expands description only if reading has one; button otherwise silently does nothing. |
| Moon / rising triad | `SkyFocus:296–297` | Missing placement opens chart sheet; existing placement unfolds description. Missing birth-time versus failed chart generation is not distinguished. |
| Goddess role buttons | `SkyFocus:141` | Toggles local selected asteroid; shows estimated sign and authored archetype. No explicit approximation/source label. |
| Spotify sound | `SkyFocus:275` | Static playlist ID by natal moon sign; external new tab, not current moon. Availability of each actual playlist unverified. |
| Reflect | `SkyFocus:170` → `/Journal?compose=1&type=horoscope&seed=…` | Journal `:314–326` handles compose/seed/type. It decodes URLSearchParams output again; a literal percent in source can abort opening. Genre `horoscope` mapping in composer requires proof. No journal save occurs until user saves. |
| Discuss | `SkyFocus:171` → `/Community?room=the-sky&seed=…` | **Broken destination**: Community `:3171` whitelist lacks `the-sky`; loses room and seed. Original horoscope uses supported `lighter`. Never bypass 18+ consent. |
| Ask Jess | `SkyFocus:172` | Dispatches `detail.seed`; Layout `:35` reads `prompt`/`initialPrompt` only. Overlay opens without intended context. Event dispatch with no listener does not throw, so its fallback is ineffective. |
| Mark read | `SkyFocus:285` → `recordProgress('your-sky',0,userId)` | Local UI goes Read; helper keys the same book/chapter forever, first date only. Subsequent days never nourish new reading days; UI resets on remount. Device key has no user/date partition. |
| Cycle × moon / Add dates | `SkyFocus:311–312` | Valid helper moon shape; own duplicated cycle math. Missing data opens Health root, not a proven exact date editor. Moon/cycle memo does not update at midnight. |
| Red & white moon | `SkyFocus:301` | **Always null**; permanently empty even with historical data. Existing `useRedWhiteMoon(userId)` unused here. |
| Annual house/time lord | `SkyMovements:20–41` | Hook exists; renderer asks for `house_label/theme`, utility returns `lit_house_copy/time_lord_copy/house_sign/unlocks_on`. Substance is lost. |
| Saturn return letter | `SkyMovements:45–60` | Age27–30 gate, approximate birthday+29.5yr ±1.5yr window, not computed natal Saturn return. Presented without approximation cue. |
| Twelve-cycle diary | `SkyFocus:192–205` | **Fabricated** Array.from bars/dots, not CycleEvents/readings hook. Unmeasured claim that cycles ran steady. |
| Diary transit dots | `SkyMovements:65–78` | Decorative spans with title, no tap selection. Void-of-course permanently null from caller. Existing detailed timeline is not carried forward. |
| Ask question textarea | `SkyMovements:173` | No explicit label; placeholder only. Question has no client length bound. |
| Ask starter chips | `SkyMovements:178` | Directly submit example, do not merely prefill. Not disabled while requesting; duplicate/racing responses possible. |
| Ask the sky submit | `SkyMovements:154–169,181` → `askStars` | user guard; `{user_id,question}` → answer; endpoint creates AdviceThreads/AdviceMessages. Error visible, no persistence-failure disclosure if endpoint returns answer with null thread or messages. |
| Ask history | `SkyMovements:130–146,195–207` | Scoped threads then thread-id messages, restores stored Q/A. Backend RLS required; no live evidence. Shows3 of max5. State not cleared immediately when user changes. |
| Compatibility name/date | `SkyMovements:245–255` | Raw day/year digit inputs. No calendar/future validation, no full accessible labels for name. |
| Read this pairing | `SkyMovements:226–239` → `generateCompatibility` | API contract exists but chart is sun-only, returns `narrative` and scores0–100. UI expects summary/body and displays `/10`, clamps bar at10: narrative missing and ordinary scores fill every bar. |
| Shared compatibility prefill | `SkyMovements:211–221` | atob URL query fills fields only; comment says auto-run, code does not. No active sky focus encoded. |
| Copy a link to this reading | `SkyMovements:240–244` | Copies plaintext-equivalent base64 name+birthday, not stored reading. Drops existing query including focus. btoa fails for many Unicode names, errors swallowed. Recipient computes own pairing rather than sender's reading. |
| Unlock Atelier | `SkyMovements:315` → stripeCheckout | plan plus → url contract matches endpoint; user guard exists server-side. Preview always calls with null letter and wrong entitlement source; paid entitlement can still see lock. Errors only console. Billing remains parked by standing rule; no transaction test without separate scope. |
| Three one-shot prices | `SkyMovements:328` → createOneShotCheckout | **Broken** sends product_key, endpoint reads product (`:64`). UI expects url but endpoint returns checkout_url or simulated thank_you_url (`:98,:157`). No visible error. |
| Published letter | `SkyFocus:334`, `SkyMovements:304–307` | null forever; wrong `letter.body` instead of actual body_html; excerpt truncates460 chars without full reader. Existing entitled/awaiting-publish/full-read/admin publish paths not preserved. |
| Quiet / Soft sky toggles | `SkyMovements:359–395` | Reads newest-created preferences, updates/creates optimistically; failures swallowed, no rollback/loading/concurrency control. Switching quiet off clears soft. Toggle has no switch role/aria-checked. |
| Science references | `SkyMovements:397–403` | Author-year text only, no source links; does not state observational limits/sample caveats. Ms Deep Search owns fresh evidence appraisal. |
| Privacy line | `SkyMovements:404–406` | No privacy controls/link. Claims need reconciliation with actual processors/chart generation/location search and shared birthday URLs. |

## Priority catalogue

### P0: security gate before asserting production readiness

**P0-01 — Missing explicit authentication rejection on three sensitive endpoints.** `generateHoroscopeReading/entry.ts:224–238`, `askStars/entry.ts:125–140`, `generateCompatibility/entry.ts:139–152` catch auth failure as null, reject only when `me` is truthy and mismatched, then use service-role reads/writes for request-supplied user_id. This proves a source-level auth gap; exploitability depends on Base44 ingress/deployed code and was **not tested**. Verify gateway and service-to-service identity contract with isolated fixtures. Require self/admin identity for interactive operations and an explicitly verified scheduled caller for daily batch. Do not solve by rejecting the legitimate orchestrator blindly. No extra function name required.

**P0-02 — Unscoped shell reading.** `LifestyleEliteShell.jsx:570` calls HoroscopeReading.filter({}, '-reading_date', 1) without user or day; `:591` assigns that row to summary/cards/ReadingSheet. The hook inside SkyFocus is scoped, but this parent query is not. Client breach of bible§16.5 is certain; actual cross-account exposure depends on deployed RLS and has not been probed. Require scoped identity/date query and zero-row/error handling before claiming personal summaries correct.

### P1: trust, core task and data correctness

1. **Fabricated personal history**: `SkyFocus:192–205`. Replace with measured CycleEvents/reading windows using existing hook. Sparse data stays sparse; preserve diary with honest insufficient-history state. Do not reuse older SkyDiary's synthetic padding as observed history (`sections/SkyDiary:89–102`).
2. **Null-wired features**: RedWhite at `SkyFocus:301`; Atelier at `:334`; profection contract at `SkyMovements:32–36` versus `lib/astrology/profections:148–158`. Bind existing hooks and correct fields; retain all old substance and states in clean layout.
3. **Broken Discuss and Jess context**: `SkyFocus:171–172`; Community `:3171`; Layout `:35`. Existing supported lighter room and prompt event are available. Re-prove composer seed without publishing and Jess input without sending.
4. **Compatibility rendering contract**: `SkyMovements:200–205,261–266` versus backend `generateCompatibility:192–226`. Correct0–100 units and narrative. Keep score feature pending Halli's explicit product decision; do not delete it because no-score language conflicts. Mark symbolic, never a verdict. Give scores a reason to exist or propose alternative for approval.
5. **Compatibility share does not share what it says**: `SkyMovements:240–244`. Design explicit consent and share contract before building: safe artifact snapshot or link explaining it is input prefill; don't expose birthday in URL by default. This needs a content-sharing decision, not secret schema expansion.
6. **Paid calls/entitlements broken**: `SkyMovements:284–292,315–328`, `SkyFocus:334`, `createOneShotCheckout:64,98,157`. Preserve parked preview functionality and clearly disclose its state. Only wire real purchase when Halli approves activation; no charging in verification.
7. **Untruthful authorship claim**: UI says Written, not generated/Astra Cole MA FAS (`SkyMovements:299–302`); `draftAtelierLetter:275–291` calls OpenAI and saves draft:false/signed_by automatically. The source does not evidence a human author or credential. Reconcile current product decision and provenance; author attribution must be true. Historical plan saying human signoff is not implemented fact.
8. **Fabricated astronomy**: `generateHoroscopeReading:173,212–216` estimates natal placements by LLM; `:365` explicitly invites plausible/literary transits when unknown; `:414–422` scaffolds transit fallback. Separate literary interpretation from computed data and provenance. No label can make false dated transits correct. Research established ephemeris/licensing/backend fit before replacement.
9. **Chart correction stale all day or indefinitely**: sheet writes birth inputs but leaves old moon/rising/mercury; endpoint `:264–269` returns cached complete chart, `:291–299` fills only missing fields. Changed birthday/time/place needs deterministic invalidation/recompute and current-reading refetch; generation failures must remain visible/retryable.
10. **Preferences can lie**: `SkyMovements:373–385` silently swallows save failures; existing reading does not react to toggle; API daily cache checked before reading preferences (`generateHoroscopeReading:255–282`). Local UserPreferences schema lacks horoscope_quiet_mode/horoscope_soft_sky fields. Verify deployed schema read-only; flag delta for signoff, do not silently push. Add loading/save/revert/error states, row selection consistency and cache invalidation/effective-on messaging.
11. **Progress stamps only first-ever day and shared device**: `SkyFocus:285`, `readingActivity:29–37,67–73`. Give each dated reading its own identity and user-scoped state; read back persisted/local truth on remount. Reconcile old keys rather than duplicate progress systems. Use existing dispatcher after its contract/security review.
12. **Cycle state can disagree with app**: `SkyFocus:49–55` own fixed-day logic instead of canonical useCycleDay and no life-stage/tracking-enabled check. Hook `useBirthChart:51–56` requests one UserProfile row; bible§16.1 requires pickProfile across candidates. Profile passed by shell reduces one read risk but backend/hook standalone still violate it.
13. **Today changes while app stays open**: mount-only moon and date-scoped reading subscription at `SkyFocus:184` and `useBirthChart:105–119`; UTC today keys vs local UK calendar. Define one day contract, refetch after midnight/focus, account for BST and birthday boundaries; no claim of exact ephemeris accuracy from mean-month approximation.
14. **No-chart regression and false-ready generation**: `SkyFocus:210–224` collapses old rich SkyPreview into setup-only copy. Hook `.catch(()=>{})` and fallback reading copy blur no data, loading and failure. Preserve usable computed-sky content, expose retry/error, never let manufactured filler look like the personal reading.

### P2: craft, findability and resilience

- Top two pills are generic Story/time on every section (`LifestyleEliteShell:1425–1426`). User explicitly asks section-specific jobs; proposed immediate preview scope below.
- Deep-link controller mismatch: `LifestyleEliteShell:1245` looks up a HERO_CARDS index (includes Story), then render indexes heroCards (Story removed with layout). Sky deep-link index4 therefore displays Good life header; good index5 falls back to Read. Use the rendered heroCards mapping, not stale source index. Query updates/back navigation also deserve testing.
- ReadingSheet's Sky diary callback `LifestyleEliteShell:1729` uses jumpTo(4); BOARD_TO_SECTION4 is books (`:1228`). In focused preview this sends the user to Books rather than Sky notes.
- Jump chips are scroll-only and small; selected position, focus ring, hit target and reduced-motion support need tap testing. No-state toggle semantics at `SkyMovements:342–350`; input labels/history announcements and modal focus need accessibility pass.
- Share root URL and multiple old-reader entry paths make it hard to return to the exact reading. Preserve features, converge destinations deliberately.
- Two meanings of Sky diary: saved SkyNote composer in old shell (`LifestyleEliteShell:738,1550,2121`) and historical chart timeline in focus. Inline clean page has no SkyNote composer. Keep and name both: Your sky notes / Your cycle history.
- Natal moon playlists labelled A sound for today are static associations, not daily selections. Explain intent and verify external availability; no new audio system.
- Birthplace network request has no abort/out-of-order protection. Request0 may replace later request1 suggestions. Need keyboard/touch selection and agreed provider usage review by research agent.
- Source/approximation labels for asteroids, Saturn and sun-based profection fallback are absent. Precise-looking degrees/dates must not imply exact chart computation.

## Whole-app connections: existing path and missing return

| Surface | Existing evidence / required role |
|---|---|
| Today | Reads HoroscopeReading (`TodayClipboardDemo:400`), links `/Lifestyle?tab=horoscope` (`:627,:716`). Reconcile with approved destination after promotion only; preview review link must stay Ideas-owned. Read mark/updated chart should refresh the day's summary. |
| Journal | Compose seed path exists. Verify seeded reflection/save/back flow with real account and unsaved changes. Retain private-by-default. |
| Community | Supported lighter feed already exists. No the-sky room. Route to real room, retain age/consent gate and no automatic post. Community return to exact Sky context still to specify. |
| Planner | Existing cycle AstraSidecar links Sky (`planner/cycle/WarmthBundleCycle:168`). Existing ReadingSheet savePlannerDay path (`LifestyleEliteShell:1728`) writes an intention, but clean Sky has no equivalent and back-reference needs checking. Reuse approved PlannerItems.source/ref capability, no duplicate scheduler. |
| Garden/progress | Existing reader-day integration exists but fixed your-sky key breaks repeat dates. Fix identity/readback, not a new scoring or streak feature. |
| Jess | Jess→Sky handoff exists (`assistant/JessDemoPanel:2102–2131`, JessAstraBanner). Sky→Jess drops seed. Keep astrology separate from clinical inference. |
| Profile | AstroProfile birth data separate from UserProfile birthday; decide visible source precedence and sync explanation, avoid silently rewriting profile. |
| Health | Read canonical opted-in cycle state. Date CTA should open the actual logging workflow; no fabricated phase for menopause/non-tracking. |
| Pulse / Doctor export | Do not treat astrology as a measured clinical signal or export it as evidence. Optional user-authored reflections can remain journal content. No automatic horoscope insertion proposed. |
| Nutrition / Programs | No necessary automatic content mutation. If relevant reflective actions exist, link exact opt-in action; do not turn horoscope into dietary/medical advice. |
| Events / Deals | No verified direct touchpoint found; no invented offers or forced commerce. Possible curated leisure suggestion only after source/availability/choice research. |
| Notifications | No new nudge approved. Retain held notification decision; don't piggyback Sky reminders on reading nudge. Existing dispatcher only if later authorised. |

## Focused pills: exact jobs using current capability

Labels below are implementation proposals, not new product decisions. Keep the two-pill presentation and summary/Jess row. Use the same underlying handlers as the section, exact content when known, honest empty state when absent. Scope new behaviour to the Ideas preview; production keeps its existing flag until Halli approves.

| Section | Pill 1 | Pill 2 | Existing capability / guard |
|---|---|---|---|
| Landing / Everything | Today's chapter | What do you have time for? | Preserve existing entry points; ensure time lens opens in focus-layout mode rather than scrolls to hidden board. |
| Sky | Read today's sky (or Set up your sky) | Ask the sky | First focuses/opens the actual reading or chart sheet; second focuses question input with visible Ask section. Neither opens generic time or story UI. Local ref/imperative callbacks are preferable to duplicate old overlay. |
| Read | Continue reading / Read today's pick | Choose a short read | openReadCard on actual continue item or first validated article; second opens exact shortest eligible article with duration/name visible. Empty data gives honest action state. |
| Listen | Listen to [short title] | Watch [short title] | Existing audioCards/videoCards exact item open/play handlers. A button named Play must actually start permitted media; otherwise label Open episode. Don't substitute arbitrary meditation. |
| Books / Story alias | Continue chapter N / Read chapter N | Open my current book / Open the library | Existing story position/onRead and openBook; honour unlocked chapter, never reset progress. Reuse current book; library fallback must genuinely expose library content (current `_library` routes Yours; investigate completeness). |
| Good life | Choose by time | Try a small joy | Existing TimePickerLens in place and PermissionSlipLens for a real ritual. No random fake action; retain completion state. |
| Yours | Reopen [saved title] | Continue [in-progress title] | Exact savedCards and continueCards items. No content = meaningful empty-state action leading to intentional discovery, never a dead disabled button without explanation. |

For Sky, the primary reading/setup callback must be owned by SkyFocus because its astro/loading state is authoritative. Parent should not infer chart existence solely from a cached headline. Keyboard focus must move to the opened reading/ask control, not merely scroll unseen content.

## Feasible sequence and acceptance

**This cycle, preview only:** focused pills, organised current Sky review entry with research/atoms/wiring/issues/verification tabs or sections; explicit unfinished status. Parent owns this implementation. No backend/schema/billing activation is bundled into the pill fix.

**Pass1, trust foundation:** security contract verification/hardening; measured diary and classification; profile/day/cycle single sources; no fake loading fallback. Reuse useSkyDiary/useRedWhiteMoon but remove synthetic-history-as-fact behaviours. Same existing endpoints; deployed schema inventory required before writing fields.

**Pass2, full task loops:** chart edit→recompute→visible read; preference save→effective reading; compatible rendering/share contract; Journal/Community/Jess/Planner/Garden round trips. Restore no-chart rich preview, SkyNote writer and complete profection explanations. Do not silently build another system.

**Pass3, provenance and astronomy:** Ms Deep Search comparison of calculable sky versus symbolic authored interpretation, ephemeris options/licences, source cadence and confidence. Exact method/provenance UX, no arbitrary celestial dates. Product decisions to Halli where required; proposed calculation fields would be a flagged schema delta.

**Pass4, paid surfaces under existing parked policy:** reconcile actual author/credentials/provenance and entitlement state before any live commerce. Fix presentation/contract in preview with fixtures. No payment test on a real account, no activation implied by existing UI.

**Pass5, adversarial full review:** Mr Tester checks contract/date/identity/failure behaviours; Ms Atelier checks clean design, type, ordered movements, preserved content; Ms Verify real pixels and actual taps360/390/430 including long names/content. Run complete state matrix: no chart, date-only chart, complete chart, changed birth data, no cycles, sparse cycles, stale/missing/error reading, returning user, signed-out, account switch, delayed backend, duplicate clicks, offline/failed save, quiet on/off/soft, empty/populated history, invalid dates, Unicode share names, rejected clipboard, entitled/unentitled/unpublished. Do not cross Community gate or charge to make a checklist green.

**Promotion gate:** every P0/P1 closed or explicitly held by Halli with honest UI, each action proves intended outcome and persistence/return path where relevant, Ideas entry contains evidence and remaining P2s, then Halli gives go-ahead. Deploying an accessible review build is not promotion. Rollback is isolated commit/preview flag; keep production route default unchanged.

## Done / queued

The entire2217-line LifestyleEliteShell was subsequently read, including dormant helper definitions, to satisfy the pre-edit inventory gate. Preserve: flora/controller and phase row; glance/Jess/inner sheet; two pills; For-you; all six boards and focused surfaces; saved/phase content; podcasts/videos/trending/external shows; fiction/classics/serial immersive readers; time picker and permission/joy workflows; Sky overlays, compact reading sheet and note composer; Jump and Calendar; seventeen Handy destinations; save/expand/reader/toast paths. Some helper fallback no-ops are currently dormant and are not catalogued as proven reachable failures.

Implementation handoff clarification: parent favours **Sky Ask the sky + Edit your chart**, direct callbacks into SkyFocus, which is stronger than inferring chart availability from the unscoped parent reading. Existing helpers support preview action sheets without generic navigation: SavedLens(items,onOpen,onUnsave), BooksLens(booksRow,onOpen=openBook,onDaily), TimePickerLens(pickFor,isSaved,onSave=toggleSave,onOpen=openItem,onTry=saveTryThis), and exact setExpanded/openReadCard items. Do not call audio open Play unless playback really starts. Books and Story are merged in the clean controller; do not invent a new separate Story tab to satisfy the alias.

Done: source inventory and contract trace, P0/P1/P2 catalogue, cross-app map, pill capability proposals and phased plan. No application changes or live claims.

Queued: fresh cited research and craft merge by owning agents; parent preview actions/Ideas implementation; live state proof; sequential Sky fixes before Read. Three earlier held choices stay held. Any credential, billing or schema decision remains outside this read-only audit.
