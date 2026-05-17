# FemWell — App Structure Map

_Last updated 2026-05-17 by Cowork. Read this on any session start when you need the full picture of every page, what it captures, and how data flows between them. Living doc — append entries when new pages land or routes are removed._

This is the cross-page cohesion baseline. Anything you ship into one page should consult this map first — most "new" capture surfaces already have a home, and most data the founder wants surfaced already exists elsewhere in the app.

---

## Conventions and shared scaffolding

- All pages live in `src/pages/*.jsx` and are routed off the top-level layout. The visible chrome is a unified 5-slot bottom nav (Today · Lifestyle · Jess · Profile · Menu) — same at mobile, tablet, and desktop. There is no desktop sidebar.
- Data layer: `import { base44 } from "@/api/base44Client"`. Pages call `base44.entities.<Name>.filter/list/create/update/delete`. Auth is `base44.auth.me()`. File uploads route through `base44.integrations.Core.UploadFile`. Server-side logic is `base44.functions.invoke(name, payload)`.
- The Planner is governed by `getPlannerConfig(lifeStage, conditions)` in `src/utils/plannerAdapter.js`. Every Planner child consults the returned config rather than reading `profile.life_stage` directly (so the DEV stage override and first-launch picker continue to work).
- DEV state for stage and conditions is held in `src/utils/devStageStore.js` — a module-level singleton with synchronous subscriber notification. localStorage keys: `femwell_dev_life_stage`, `femwell_dev_conditions`. There is also a 500ms localStorage poll inside Planner as belt-and-braces.
- Design tokens are CSS variables on `:root` (cream, plum, blush, sage, mauve, gold, rose). No emoji codepoints in product — Lucide icons + SVG only.

---

## Bottom-nav surfaces (the spine)

### Today.jsx
**Purpose.** Daily landing page. The single screen where the user lands on launch — surfaces today's plan, captures the daily check-in, and exposes quick-access tiles into the rest of the app.

**Reads.** `UserProfile`, `DailyCheckins` (today's row, then 30-day window for context), `InsightCards` (one unread top), `WeeklyInsights`, `HydrationLog` (today's count), `Programs`/`UserPrograms` (active program), `ContentItems` (recommendations), `LifestyleItems` (Daily Story strip), `OnThisDay`/`Friend6Months`/`UnsealedLetter` mirrors, `PanicSessions` (Panic Mode entry).

**Writes.** `DailyCheckins` (via `CheckinModal` — captures mood 1–5, energy 1–5, sleep_hours, stress, symptoms[], cramps/headache/bloating/breast_tenderness/pain individual severities 0–5, notes). `HydrationLog` (+/− glasses). `PanicSessions` if Panic Mode is opened.

**Sub-blocks rendered.** `TodayHeroSection` (Jess narrative greeting), `SmartContextBanner`, `DailyInsightBanner`, `DailyPhaseBrief`, `PillarsDeck` (6 lifestyle pillars status snapshot), `WeeklyInsightCard` (cycle-aware copy, stage-scrubbed for non-cycle stages), `DailyPlanCard`, `DailyStoriesStrip`, `TodayDailyChapterCard` (Daily Story serial reader entry), `RecommendedForYouSection`, `QuickMealLog`, `ActiveProgramCard`, `HydrationRing`, `QuickActionsRow` (4 tiles: Log meal → Nutrition, Add water, Journal, Symptom). Three engagement mirrors: `OnThisDayLastCycleCard`, `FriendFrom6MonthsAgoCard`, `UnsealedLetterCard`. `TodayFertilityBanner` for cycle-aware stages. `TrackTab` for the inline track-detail variant.

**Cross-page outlets.**
- Hydration writes here render on `Nutrition` (today tab) and reflect back into `Pulse` weekly stats.
- Check-in mood/energy/symptoms become the source-of-truth for `Insights`, `Trends`, `Pulse`, `DoctorExport`, and the Cycle ribbon on `Planner`.
- "Symptom" quick action deep-links into `Today?open_log=1` (opens CheckinModal inline) — this is the canonical capture path; do NOT add a second symptom-log entry surface elsewhere.

### Lifestyle.jsx
**Purpose.** The editorial / content destination. Five-tab hybrid magazine + data-mirror page. Houses every long-form read, every audio destination, every Daily Story episode, and the Horoscope.

**Tabs (URL-state via `?tab=`).** For You · Browse · Listen · Daily Story · Horoscope.

**Reads.** `LifestyleItems` (the canonical content row — articles, fiction chapters, podcast episodes, video summaries). `LifestyleSources` (curated source feeds — RSS / YouTube / podcast / TikTok). `Podcasts`. `Books` (Gutenberg pointer rows). Horoscope reads from `HoroscopeCharts`, `Profections`, `Compatibility`, `AtelierReadings`, `OneShotPurchases`.

**Writes.** `UserProfile.saved_item_ids` (canonical saved-content array). `UserProfile.smart_save_phase` (phase chooser on save). `ContentBookmarks` is a legacy entity — phase out in passing, not in bulk.

**Sub-blocks.** `ForYouTab` (bento + hero + save heart + smart-save phase chooser), `BrowseTab` (search + filter + categories), `ListenTab` (Podcasts + TikTok shelves, sticky filter row), `DailyStoryReader` (multi-chapter reader, 5-level font, immersive mode, bookmarks at `fw_reader_position_<id>`), `HoroscopeTabImpl` (Plum Night theme — only surface that breaks cream day-mode). `ArticleSheet` (full-screen reader for non-Daily-Story articles).

**Cross-page outlets.**
- Save heart writes flow back into `Saved.jsx` (LIFESTYLE tab) and `Profile`'s saved counts.
- Daily Story reader emits `ContentHistory` rows that the `Today` recommendations watch, and bookmark positions are written to localStorage — `Today` shows "continue chapter X" via `TodayDailyChapterCard`.
- Horoscope hub fan-out: Compatibility, Ask The Sky (`base44.functions.invoke('askTheSky')`), Sky Diary, Profections. £19/£29/£55 paid surfaces route to `OneShotThankYou`.

### Planner.jsx
**Purpose.** The life-stage adapter's home surface. Two top-level tabs (Today + Cycle), 12 life stages, 8+ condition modifiers, and 20+ stage-specific cards mounted conditionally. This is the most-modified page in the app and the canonical example of the adapter pattern.

**Tabs.** `?view=today` and `?view=cycle`. Both tabs render some shared scaffolding (DevStageSwitcher pill, stage cards hoisted above the tab conditional so they survive both tabs).

**Reads.** `UserProfile` (life_stage, conditions/condition_flags, pregnancy_due_date, pregnancy_start_date, postpartum_due_date, perimenopause_started_at, cycle_avg_length, period_length, last_period_start_date). `PlannerItems` (the schedule rows the founder is rethinking — date + repeat: none/daily/weekdays/weekly/monthly). `MedicationReminders`. `CycleEvents`, `SymptomLogs`, `HabitLogs`, `MedicationLogs`, `DailyCheckins`, `JournalEntries` (mood/cycle data for ribbons + correlation). Stage-conditional: `BbtLog` (TTC), `OpkLog` (TTC), `SupplementLog` (pre-TTC), `KickLog` (T3 pregnancy), `HrtLog` (peri/meno), `ContraceptionMemory` (reproductive/pre-TTC). EPDS uses `localStorage` only — never written to base44 (privacy carve-out).

**Writes.** PlannerItems (add/complete/snooze tasks). MedicationReminders. BBT/OPK/Kick/HRT/Contraception entries via stage-specific cards.

**Big sub-blocks.** `PlannerTabs` (Today/Cycle toggle), `JessNarrativeHero`, `PillarsDeck`, `CapacityTaxBar`, `ConsistencyCard`, `SmartViewCard`, `RitualReframeShimmer`, `TonightCard` + `ShutdownRitualCard` (warmth bundle), `RitualBundlesCarousel`, `CycleMirrorSundayTile`. Cycle-side: `MonthRibbon` (cycle stages), `SymptomRibbon` (peri/meno), `HrtLogCard`, `ContraceptionCard`, `FertileWindowCard` (TTC), `PreTtcCards` (FolicAcid + AMH + SupplementStack), `SupplementTrackerCard`, `DoctorReadyDiaryCard` (NICE NG23 PDF), `GpExportButton` / `MergedExportSheet` (Sprint 6B — combined health + diary export), `SavedRhythmsCarousel`, `WhatsUnfinishedCard`, `WeekAheadCard`, `AstraSidecar`, `PlanMyNextCycleCTA`. Stage cards (mounted unconditionally above the tab wrapper): `KickCounterCard` (T3), `EpdsScreenCard` (postpartum, localStorage-only), `HrtCorrelationCard` (peri), `PregnancyTimelineCard` (any pregnancy trimester — replaces MonthRibbon).

**Cross-page outlets.**
- Stage selection from `Profile`'s `FirstLaunchStagePicker` / stage edit modal feeds straight into `getPlannerConfig`, which reshapes every Planner card. Same for the DEV switcher.
- `MergedExportSheet` reuses `buildSnapshot` + `buildGpPdf` (from `GpExportButton`) and `buildDiaryPdf` (from `DoctorReadyDiaryCard`) — both are exported PDF builders. The Combined PDF falls back to dual download because jsPDF has no cross-instance merge.
- Date picker on add-task modals (Sprint 6B Batch 1, commit `398c08f`) writes `date` into `PlannerItems`. Repeat dropdown gained "weekdays" alongside none/daily/weekly/monthly.
- Add medication writes `MedicationReminders`, which `DoctorExport` and `Profile` later read.

### Profile.jsx
**Purpose.** Identity + stage management + preferences + data export. Hosts the prominent life-stage gold card with a one-tap edit modal (lifted from the inline picker), the assistant-name/tone editor, and all data settings linking to per-page subroutes.

**Reads.** `UserProfile`, `UserPreferences`, `DailyCheckins` (last 90 days for the small "your recent activity" tile).

**Writes.** `UserProfile.avatar_url` (photo upload via `base44.integrations.Core.UploadFile`). `UserProfile.tone_preference` / `UserPreferences.coach_tone`. `UserProfile.assistant_name`, `birthday`, `city`, `goals[]`, `conditions[]` / `condition_flags[]`, `life_stage`. Also writes the DEV stage override on stage change so the Planner reactivity loop sees it immediately (via `writeDevStageOverride` from DevStageSwitcher).

**Sub-blocks.** `FirstLaunchStagePicker` (also surfaces in onboarding), `ProfileNavLinks` (deep-links to CycleSettings, PartnerSettings, DoctorExport, LifeStageCare, Settings sections), `ProfileDataModals` (export + delete), `ConditionHealthProfile`. STAGE_LABEL dictionary captures the 12 enum values + the legacy `pregnancy` alias.

**Cross-page outlets.**
- Stage edits propagate through `getPlannerConfig` to every Planner mount.
- Goals + conditions flow into Jess context, content recommendations on Today/Lifestyle, and program filtering on `ProgramsHub`.
- Tone preference is consumed by every Jess copy surface.

### Settings.jsx
**Purpose.** Account · Notifications · Privacy · Data · About — five sections in a sidebar+content layout, with deep-links from Profile (e.g. `Settings?section=privacy`).

**Reads.** `UserProfile`, `UserPreferences`, `NotificationLog` (preferences last-updated marker).

**Writes.** Notification toggles (`UserPreferences.notif_*` keys). Privacy toggles. Data export builds CSV/JSON via `@/lib/settingsExport` (`toCsv`, `withinLastMonths`) — pulls from `DailyCheckins`, `CycleEvents`, `SymptomLogs`, `HabitLogs`, `JournalEntries`. Delete-data flow.

**Cross-page outlets.** `Settings?section=about` links to `Privacy.jsx` and `Terms.jsx`. About section shows `APP_VERSION` constant. Data export is the canonical bulk-data-out path — DoctorExport is the doctor-facing summary path; Settings is the full dump.

---

## Capture / tracking surfaces

### Track.jsx
**Purpose.** Day-by-day log book with five tabs (Cycle · Symptoms · Habits · Meds · Sessions). User scrubs through dates with chevrons and adds rows per tab. This is the historical log alongside Today's "just for today" check-in.

**Reads + writes.** `CycleEvents` (PeriodStart / PeriodEnd / Spotting + flow_level). `SymptomLogs` (symptom_type, severity 1–5, notes — supports custom names alongside 15 common ones). `HabitLogs` (habit_name + completed boolean). `MedicationLogs`. `ContentHistory` (read-only — completed sessions list). Loads 90-day rolling `allHabitLogs` for streak calc.

**Sub-blocks.** `HabitCard` (with streak), `StreakMilestoneToast`.

**Cross-page outlets.** Period start/end on Cycle tab is the single canonical source for `MonthRibbon`, fertility prediction, cycle-day on every page. SymptomLogs is the only place individual symptom severity is captured by name (vs DailyCheckins which captures per-field severity); both flow into `Insights`/`Trends`/`Pulse`. HabitLogs becomes `ConsistencyCard` on Planner.

### Insights.jsx
**Purpose.** KPI dashboard summarising the user's logged data over rolling windows. The post-2025 redesign — separate from Pulse/Trends which are older.

**Reads only.** `UserProfile`, `DailyCheckins` (90-day window).

**Sub-blocks.** `KpiCard` (4 cards: Days logged + 14-day sparkline, Top symptom, Avg mood out-of-10, Avg energy out-of-10 with deltas). `SymptomHeatmap` (14-day). `PhaseOverlayChart` (cycle-aware). `TrendCards` (7d vs prev 7d). `CorrelationsCard`. `DayDetailModal` (bottom sheet showing one day's check-in detail).

### Trends.jsx
**Purpose.** Recharts-driven older trend explorer with phase × metric bar chart, time series, and stress heatmap. Read-only.

**Reads.** `CycleEvents`, `DailyCheckins`, `SymptomLogs`, `HabitLogs`, `Correlations`.

**Sub-blocks.** `HealthOverviewSection`, `AIHealthSummaryCard`, plus inline recharts (BarChart, LineChart).

### Pulse.jsx
**Purpose.** Weekly insight reel + trends + condition pulse — the larger sibling of Insights/Trends. `WeeklyInsights.jsx` redirects here.

**Reads.** Same as Trends + `WeeklyInsights` (the rolling weekly summaries), `JournalEntries` weekly counts, `HabitLogs`, `MealLog`, condition-specific pulse data, wearable data.

**Sub-blocks.** `PeriodCountdownCard`, `PatternInsightCards`, `ConditionPulseCards`, `WearableWeekCard`, `PredictiveAnalysisCard`, `HealthOverviewSection`, `AIHealthSummaryCard`. Renders weekly-insight markdown blocks with simple inline formatter.

### DoctorExport.jsx
**Purpose.** A printable 90-day summary tailored for clinicians. Plain-text copyable + structured cards. Distinct from the Planner's `GpExportButton` (which is stage-specific PDF) and `DoctorReadyDiaryCard` (which is NICE NG23 appointment diary PDF). DoctorExport is the broadest survey.

**Reads.** `UserProfile`, `DailyCheckins`, `SymptomLogs`, `MedicationLogs`, `MedicationReminders`, `JournalEntries`, `Correlations`. 90-day cutoff.

**Output.** 6 sections: Overview, Symptoms (with avg severity + day counts), Mood & Energy by Month, Medications, Exercise stats, Recent Journal Excerpts. Copy-to-clipboard button writes the lot as plain text.

### Journal.jsx
**Purpose.** Free-form daily journal as a Pinterest-style 2-column masonry of "jotter cards". Multiple card types (free, gratitude, todo, mood, reflection, dream). Streak + pinned strip + filter pills + Insights sub-tab.

**Reads.** `JournalEntries` (200 latest), `UserProfile` (cycle phase tagging).

**Writes.** `JournalEntries` via `NewEntrySheet` — card_type, card_color, text, todo_items[], is_pinned, session_date. Pin/unpin, color change, delete, edit. Auto-tags entries with current cycle phase via `getCurrentPhase(profile)`.

**Sub-blocks.** `JotterCard`, `NewEntrySheet`, `JournalInsightsTab`.

**Cross-page outlets.** Journal entries surface in DoctorExport recent-excerpts, ProgramDay reflections write back here (with `program_key` + `day_number`), and Pulse pulls weekly count for the engagement tile.

---

## Content surfaces

### Explore.jsx
**Purpose.** Broader content browse — combines a curated YouTube video set (hardcoded `YOUTUBE_VIDEOS` constant) with `ContentItems` from base44. Pre-Lifestyle-redesign destination; still alive for discovery.

**Reads.** `ContentItems`, `UserProfile` (cycle phase for recommendation tags), `Entitlements` (paywall awareness — Plus features locked).

**Sub-blocks.** `FilterDrawer`, `ExploreContentCard`, `YouTubeVideoCard`.

### ContentPlayer.jsx
**Purpose.** The shared player surface — meditation/breathwork/workout/guide/video/audio. Resolves the content by `?key=<content_key>` or legacy `?id=<id>`.

**Reads.** `ContentItems`, `Entitlements` (free/plus/pro TIER_ORDER gate), `ContentBookmarks`, `SavedItems`, `UserProfile` (current cycle phase chip).

**Writes.** `ContentBookmarks` + `SavedItems` on bookmark toggle. `ContentItems.audio_file_url` after on-the-fly meditation audio generation via `base44.functions.invoke("generateAudio")` (caches a per-key clip).

**Sub-blocks (player variants).** `GuidedPlayer`, `AudioPlayer`, `BreathworkLoopPlayer`, `WorkoutPlayer`, `GuideReadingPlayer`. `ManualCompleteButton` writes session-complete rows.

**Cross-page outlets.** Phase recommendation chip shows on the player; ManualCompleteButton emits a `ContentHistory` row that Track / Today / Pulse all read.

### BookReader.jsx
**Purpose.** Project Gutenberg in-app reader. Route `/BookReader?gutenberg_id=N`. Fetches the book via `base44.functions.invoke("fetchGutenbergBook")`, splits into chapters with three regex patterns (or 500-word page fallback), feeds into `DailyStoryReader` with `kind: "book"`.

**Reads.** `LifestyleItems` (for the in-app catalog row that points at the Gutenberg ID), Gutenberg fetch result.

**Writes.** None — read position is held in `localStorage` by DailyStoryReader.

### FictionReader.jsx
**Purpose.** Kindle-style reader for FemWell-generated fiction (`LifestyleItems` where `provider` is in `FEMWELL_FICTION_*`). Multi-chapter via `chapters_json` field; otherwise paginates the `body`/`lede`/`summary` into ~450-word pages adjusted for text size (`WORDS_PER_PAGE_BY_SIZE`). Cover page before the reader opens. Text size persists in `localStorage` as `fw_reader_text_size`.

**Reads.** `LifestyleItems` by `?id=`.

**Writes.** None — bookmarks are localStorage.

### Saved.jsx
**Purpose.** The user's saved-items library across types. Tabs: Advice · Lifestyle · Sessions · Programs · Journal · (Events appears conditionally when any EVENT type is saved).

**Reads.** `SavedItems` by `user_id` (150 latest).

**Writes.** `SavedItems.delete` on remove.

**Sub-blocks.** `SavedItemCard`.

### Deals.jsx
**Purpose.** Member-perks marketplace. Categories: All · Supplements · Period care · Skincare · Fitness · Books. Each row has brand, image, discount text, external URL, verified flag.

**Reads.** `Deals` (where `is_active: true`).

### Events.jsx
**Purpose.** UK + online events feed (Dice, Fatsoma, Meetup, Time Out, RA, Fever — that's the visible platform set). Filters: price, tag, platform, online-only toggle.

**Reads.** `EventsItems`, `SavedItems` (item_type=EVENT) for the save heart.

**Writes.** `SavedItems` via `toggleSavedItem`.

### Community.jsx
**Purpose.** The newer community feed (real_talk, gratitude, question, cycle, PCOS, endo, PMDD, menopause, milestone categories). Sticky header with filter pills, FAB to compose, anonymous toggle, three reactions per post + report flag.

**Reads.** `Posts` (paginated 15 per page, filtered by `moderation_status: "approved"` + optional category), `UserProfile` for display_name fallback.

**Writes.** `Posts.create` on share, `Posts.update` on reaction, `Reports.create` on flag.

### CommunityMP8.jsx
**Purpose.** A parallel/alternative community page from MP#8 (kept alive — different schema). Categories: question/support/celebration/tip. Reads/writes `CommunityPosts` (different entity from `Posts` above).

### SealedLetters.jsx
**Purpose.** Letters-to-self time capsule. Compose-sheet → seal with future-open date → on/after that date the letter auto-unseals (`unsealed_at` written), is read in `UnsealedLetterReader`, and `UnsealedLetterCard` surfaces on Today when an unsealed letter is unread.

**Reads + writes.** `SealedLetters` (filter by user_id, mark `unsealed_at` when `readyToUnseal()` returns true).

**Sub-blocks.** `SealedLetterComposeSheet`, `SealedLetterList`, `SealedLettersEmptyState`, `UnsealedLetterReader`.

### Ideas.jsx (very large — 6491 lines)
**Purpose.** Interactive design lab. Four candidate Planner reskins (Le Menu × Phase Sun, The Interior, The Library, The Garden) plus Research, Life Stages, and Scheduling tabs that accumulate every brainstormed/researched/ideated feature. Read-only — no entity reads/writes. This is the founder's living scratchpad.

### DesignLab.jsx
**Purpose.** Five distinct visual concepts for the Cycle tab — Apothecary No. 09, Le Menu, Atelier Plain, Aurora Field, Maison Rouge. Shared mock data, fully different typographic + colour systems. Read-only design surface.

---

## Programs / structured journeys

### ProgramsHub.jsx
**Purpose.** Catalog of structured multi-day programs (Sleep, Stress, PMS, Mobility, Menopause, Postpartum etc). Filter by need, search, sort. Each tile shows progress if the user has a `UserPrograms` row.

**Reads.** `Programs`, `UserPrograms`, `Entitlements` (free/plus/pro), `ProgramDays`, `ProgramTasks`, `UserProfile` (current phase for recommendation strip).

**Writes.** None directly — start happens on ProgramDetail.

### ProgramDetail.jsx
**Purpose.** Single program landing page. Hero + tier badge + day-by-day roadmap + reminder time picker + start/resume/restart actions + save toggle.

**Reads.** `Programs`, `Entitlements`, `ProgramDays`, `ProgramTasks`, `UserPrograms`, `UserTaskCompletions`.

**Writes.** `UserPrograms` (create/update — status, current_day, started_at, is_saved, reminder_time, last_activity_date, streak_count). Calls `saveItem`/`removeSavedItem` to also mirror into `SavedItems`. `UserTaskCompletions.delete` (mass) on restart.

**Sub-blocks.** `ProgramDayPreviewCard`, `ProgramProgressBar`, `ProgramPageToolbar`.

### ProgramDay.jsx
**Purpose.** A single day inside a program. Hero + tasks + reflection + suggested next content. Streak math + milestone toast.

**Reads.** `Programs`, `Entitlements`, `ProgramDays`, `ProgramTasks`, `UserPrograms`, `UserTaskCompletions`, `ContentItems`, `JournalEntries` (this day's reflection row).

**Writes.** `UserTaskCompletions.create` per task. `UserPrograms.update` on day-complete (advance current_day, bump streak, set completed_at if last day). `JournalEntries.create`/`update` for the reflection prompt — tagged `program_key` + `day_number` so they surface in Journal under the program context.

**Sub-blocks.** `ProgramTaskCard`, `ProgramDayStickyNav`, `ProgramReflectionCard`, `MilestoneCelebrationModal` (`getMilestoneKey` decides when one is unshown).

---

## Health / specialty surfaces

### Nutrition.jsx
**Purpose.** Wellness Studio nutrition page — seven tabs (Today · My Plan · Recipes · AI Plan · Shop · Progress · Insights). Date scrubber on Today tab.

**Reads.** `UserProfile`, `NutritionProfile`, `DailyCheckins` (today). Tab children read `HydrationLog`, `MealLog`. Subscribes to `HydrationLog` and `MealLog` changes via `base44.entities.<X>.subscribe` to force re-render.

**Writes (via tab children).** `HydrationLog`, `MealLog`, `NutritionProfile`, `ShoppingList`. AI plan generation calls `base44.functions.invoke`.

**Sub-blocks.** `NutritionTodayTab`, `NutritionPlanTab`, `RecipeGeneratorTab`, `MealPlanGeneratorTab`, `ShoppingListTab`, `NutritionProgressTab`, `NutritionInsightsTab`.

**Cross-page outlets.** Hydration is the SAME data as Today's HydrationRing. Meals show on Today's QuickMealLog and ActiveProgramCard. Don't add a second meal-capture surface elsewhere.

### CycleSettings.jsx
**Purpose.** Three-slider editor for `cycle_avg_length`, `period_length`, `last_period_start_date`. Reached from Profile.

**Reads + writes.** `UserProfile`.

**Cross-page outlets.** These three fields are read by Today (phase calc), Planner (MonthRibbon + predictions), Journal (`getCurrentPhase`), ContentPlayer (phase recommendation chip), Pulse/Trends/Insights (phase windowing).

### LifeStageCare.jsx
**Purpose.** Standalone pregnancy + menopause support hub — pre-dates the Planner adapter rebuild. Tabs: Pregnancy / Menopause. Each tab is its own subcomponent with its own profile + daily log entity.

**Reads + writes.** `PregnancyProfile`, `PregnancyDailyLog`, `MenopauseProfile`, `MenopauseDailyLog`.

**Sub-blocks.** `PregnancySupportTab`, `MenopauseSupportTab`.

**Note.** Now partly overlapped by Planner pregnancy/menopause cards (KickCounter, HrtLog, PregnancyTimeline). LifeStageCare remains as a deep specialty surface; if you ship a new pregnancy/menopause card, decide which lives in Planner vs LifeStageCare — don't duplicate.

### SkinHair.jsx
**Purpose.** Phase-aware skincare + haircare guide. For each of the four phases (menstrual/follicular/ovulatory/luteal) it lists ingredients to use vs avoid with rationale. Recharts visualisations of phase-by-phase ingredient effectiveness.

**Reads.** `UserProfile` (cycle phase for default-open phase), `DailyCheckins` (skin-condition flags).

**Writes.** `SkinProfile` (skin type, concerns) — gated through onboarding's `skin_profile` step.

### Pulse.jsx, Trends.jsx, Insights.jsx — see "capture / tracking surfaces" above.

---

## Onboarding + entry

### Onboarding.jsx
**Purpose.** 13-step signup flow. Steps: welcome → cycle_basics → display_name → goals → location → interests → preferences → life_stage → conditions → setup → skin_profile → assistant_intro → done. Mode-gated: requires `?mode=signup` or `?mode=redo`, otherwise bounces to `/Today`. Conditions step keys map to plannerAdapter's CONDITION_OVERRIDES.

**Writes.** `UserProfile` (display_name, birthday, city, goals, interests, life_stage, conditions, tone_preference). `UserPreferences` (coach_tone, notification_time, hydration_target). `SkinProfile`. `NutritionProfile` partial. `GuideSettings` (assistant intro). Dispatches `FirstLaunchStagePicker`'s `life_stage` selection.

**Sub-blocks.** `CycleBasicsStep`, `GuideVoiceMode`.

**Cross-page outlets.** Every field captured here is the data the rest of the app reads back. If you find yourself adding a new "tell us about" prompt elsewhere, check this list first.

### OneShotThankYou.jsx
**Purpose.** Post-checkout landing for paid Horoscope products (year_ahead, chart_atelier, choose_the_day). Two states: simulated (no Stripe wired) and real-paid (Stripe success_url). Shows turnaround estimate.

**Reads.** `base44.auth.me()` for email display.

### Privacy.jsx, Terms.jsx
Static legal pages — lorem-ipsum stand-ins for now. Reached from Settings → About.

### Assistant.jsx
**Purpose.** Programmatic shim — fires `fw_open_assistant` event then renders "Assistant is open" + back link. The actual Jess UI lives in a global drawer, not here.

### WeeklyInsights.jsx
**Purpose.** Tiny redirect. `useEffect` → navigate to `Pulse`. Kept as a backward-compatible URL.

---

## Partner / sharing surfaces

### PartnerSettings.jsx
**Purpose.** Create read-only partner views. Per-partner row holds permissions (subset of cycle_phase/mood/energy/programs) + an access_token. Active/inactive flag. Copy-link to share `/PartnerView?token=<token>`.

**Reads + writes.** `PartnerAccess`.

### PartnerView.jsx
**Purpose.** Read-only landing for partner links. Token validates via `base44.functions.invoke("getPartnerView", { access_token })`. Renders phase + mood/energy emoji + active program + weekly message — and never shows symptom detail, journal entries, or sensitive data.

---

## Admin surfaces (auth-gated to `user.role === "admin"`)

### AdminMigrations.jsx
**Purpose.** One-time data migrations runner. Three idempotent runners: legacy category fix on LifestyleItems, PanicLog → PanicSessions consolidation, ContentItems category normalisation. Each writes to `MigrationLog` for audit. Admin-only.

### VideoManager.jsx
**Purpose.** Admin video uploader for WORKOUT ContentItems. YouTube URL parser auto-fills thumbnail; or upload file via `base44.integrations.Core.UploadFile`. Saves `embed_url`, `source_url`, `thumbnail_url`, `tags`, `play_mode: VIDEO` back to `ContentItems`. Admin-only.

### BreathworkAudioManager.jsx
**Purpose.** Admin audio uploader for BREATHWORK + MEDITATION ContentItems. Per-session audio segments (`AudioSegments` rows for roles MAIN/LOOP1/LOOP2/LOOP3) + bulk upload by filename pattern + per-session settings (player_style, accent_color, breath_pattern_label, breath_safety_note, target_seconds). Admin-only.

---

## Upgrade

### Upgrade.jsx
**Purpose.** Plus tier marketing page — Free / Plus / Pro plan cards, feature comparison grid, waitlist modal that writes a `NotificationLog` row with notification_type "waitlist". Reachable from any locked surface. Stripe + actual upgrade flow is parked until end-of-project (per memory: `feedback_plus_tier_parked_until_end`).

---

## Cross-page data flows — the load-bearing wires

These are the wires the founder explicitly wants every session to know about (no duplicate-capture, no stale-feature):

1. **`UserProfile.life_stage` + `conditions`** → `getPlannerConfig(...)` → every Planner card, Jess hero copy, Lifestyle content filter, Today fertility/menopause banners, ProgramsHub `filterProgramsByStage`, Profile stage card, DoctorExport summary line, Onboarding's choice of next step. Single source of truth. The DEV switcher mirrors this through `devStageStore` + localStorage.
2. **`UserProfile.last_period_start_date` + `cycle_avg_length` + `period_length`** → cycle phase derivation in Today (`getCyclePhase`), Journal (`getCurrentPhase`), ContentPlayer (phase chip), Planner (MonthRibbon, FertileWindow), Pulse/Trends/Insights phase windowing, SkinHair phase tabs. Captured via CycleSettings + Track Cycle tab.
3. **`DailyCheckins`** → Today (today's row + recommendations), Insights (KPIs, heatmap, trend cards), Trends (phase bar chart, line chart), Pulse (weekly insights, condition pulse), DoctorExport (symptoms, mood & energy by month), Settings export. Captured in Today's CheckinModal — DO NOT add a second capture path.
4. **`CycleEvents`** → Track (date-scrubbed), Trends (period-start anchor for cycle-day calc), Pulse (countdown), Planner (MonthRibbon + predictions). Captured in Track Cycle tab.
5. **`SymptomLogs`** → Track + DoctorExport. Distinct from per-field severities in `DailyCheckins`; both are read across surfaces. Don't merge without a migration.
6. **`UserProfile.saved_item_ids`** → Lifestyle save heart + Saved page (LIFESTYLE tab). Canonical save store for Lifestyle articles. `ContentBookmarks` is legacy ContentPlayer-only.
7. **`SavedItems`** → cross-type saved library (CONTENT, PROGRAM, EVENT, LIFESTYLE, JOURNAL). The `Saved.jsx` page reads this.
8. **`ContentHistory`** → emitted by ContentPlayer's ManualCompleteButton + DailyStoryReader. Read by Track Sessions tab + Today recommendations.
9. **`JournalEntries`** → Journal (browser), Pulse (weekly count), DoctorExport (excerpts), ProgramDay (reflection — tagged with `program_key` + `day_number` so they show under the program in Journal).
10. **`PlannerItems` + `MedicationReminders`** → Planner is the canonical schedule store. `Date` field (Sprint 6B Batch 1) is the next-step lever for the "unified scheduling brain" overhaul. Medication reminders also surface on DoctorExport.
11. **Pregnancy / TTC / Peri stage entities** (`BbtLog`, `OpkLog`, `KickLog`, `HrtLog`, `SupplementLog`, `ContraceptionMemory`, `PregnancyProfile`/`PregnancyDailyLog`, `MenopauseProfile`/`MenopauseDailyLog`) → only mounted by Planner stage cards and LifeStageCare. Decide which page hosts new stage-specific capture before adding a card.
12. **EPDS** (postpartum mental-health screening) → `localStorage` only, never `base44`. This is a deliberate privacy carve-out — keep it that way.

---

## Pages by route — quick file index

| Page | File | Route hint |
|---|---|---|
| Today | `Today.jsx` | `/Today` (`?open_log=1` opens CheckinModal) |
| Lifestyle | `Lifestyle.jsx` | `/Lifestyle?tab=for_you\|browse\|listen\|daily_story\|horoscope` |
| Planner | `Planner.jsx` | `/Planner?view=today\|cycle` |
| Profile | `Profile.jsx` | `/Profile` |
| Settings | `Settings.jsx` | `/Settings?section=account\|notifications\|privacy\|data\|about` |
| Track | `Track.jsx` | `/Track` — 5 tabs |
| Insights | `Insights.jsx` | `/Insights` |
| Trends | `Trends.jsx` | `/Trends` |
| Pulse | `Pulse.jsx` | `/Pulse` (WeeklyInsights redirects here) |
| Journal | `Journal.jsx` | `/Journal` |
| Nutrition | `Nutrition.jsx` | `/Nutrition?tab=hydration\|today\|plan\|recipes\|mealgen\|shopping\|progress\|insights` |
| Explore | `Explore.jsx` | `/Explore` |
| Saved | `Saved.jsx` | `/Saved` |
| Deals | `Deals.jsx` | `/Deals` |
| Events | `Events.jsx` | `/Events` |
| Community | `Community.jsx` | `/Community` |
| CommunityMP8 | `CommunityMP8.jsx` | older Community surface, kept alive |
| Sealed Letters | `SealedLetters.jsx` | `/SealedLetters` (`?compose=1`, `?open=<id>`) |
| Content Player | `ContentPlayer.jsx` | `/ContentPlayer?key=<content_key>` or `?id=<id>` |
| Book Reader | `BookReader.jsx` | `/BookReader?gutenberg_id=<n>` |
| Fiction Reader | `FictionReader.jsx` | `/FictionReader?id=<LifestyleItems.id>` |
| Skin & Hair | `SkinHair.jsx` | `/SkinHair` |
| Life Stage Care | `LifeStageCare.jsx` | `/LifeStageCare` |
| Cycle Settings | `CycleSettings.jsx` | `/CycleSettings` |
| Programs Hub | `ProgramsHub.jsx` | `/ProgramsHub` (`?program_key=<key>` jumps) |
| Program Detail | `ProgramDetail.jsx` | `/ProgramDetail?key=<program_key>` |
| Program Day | `ProgramDay.jsx` | `/ProgramDay?key=<program_key>&day=<n>` |
| Doctor Export | `DoctorExport.jsx` | `/DoctorExport` |
| Partner Settings | `PartnerSettings.jsx` | `/PartnerSettings` |
| Partner View | `PartnerView.jsx` | `/PartnerView?token=<token>` (read-only, no auth) |
| Onboarding | `Onboarding.jsx` | `/Onboarding?mode=signup\|redo` (mode-gated) |
| OneShot Thank You | `OneShotThankYou.jsx` | `/OneShotThankYou?product=<key>` |
| Upgrade | `Upgrade.jsx` | `/Upgrade` |
| Ideas (design lab) | `Ideas.jsx` | `/Ideas` |
| Design Lab | `DesignLab.jsx` | `/DesignLab` |
| Admin Migrations | `AdminMigrations.jsx` | `/AdminMigrations` (admin) |
| Video Manager | `VideoManager.jsx` | `/VideoManager` (admin) |
| Breathwork Audio Manager | `BreathworkAudioManager.jsx` | `/BreathworkAudioManager` (admin) |
| Lifestyle Detail | `LifestyleDetail.jsx` | `/LifestyleDetail?id=<LifestyleItems.id>` |
| Weekly Insights | `WeeklyInsights.jsx` | redirect → `/Pulse` |
| Privacy | `Privacy.jsx` | `/Privacy` |
| Terms | `Terms.jsx` | `/Terms` |
| Assistant | `Assistant.jsx` | `/Assistant` (event-fire shim) |

---

## House rules when adding to this map

- **No duplicate-capture surfaces.** Before adding a new symptom/check-in/journal/water/meal capture path, point at the existing one above.
- **No stale features.** Every new entity must be wired to one read surface AND surfaced on at least one other page.
- **Decide Planner vs LifeStageCare** when shipping new pregnancy or menopause capture. Both currently exist; don't add a third home.
- **Update this doc on every shipped MP.** Bump the date stamp at top, edit the affected section, append a line under "Cross-page data flows" if the wire changed.
