# Research — Card-style gallery breadth pass (30+ types) — 03/07/2026

## Question
FemWell has ~15 mocked card styles and wants 30+. Widen the gallery with cited card/component patterns pulled from wellness, fitness, finance, social, media, editorial, cooking and productivity apps. For each type: what it is · the interaction · 2+ real app examples (cited) · a one-line FemWell adaptation (cream paper bg, deep-oxblood #7A1A12 headings, gold, flora, warm "smart-friend" voice). Flag any that won't suit a calm cream app.

## Sources consulted
- NN/G — Cards: UI-Component Definition — canonical card definition + when-not-to-use (fetched 03/07/2026): https://www.nngroup.com/articles/cards-component/
- NN/G — Accordions on Mobile — accordion push-down vs overlay, tap-target rules (fetched 03/07/2026): https://www.nngroup.com/articles/mobile-accordions/
- Superdesign — How Airbnb Designs Their UI (2026) — listing card, heart toggle, no-chrome photo-led card (fetched 03/07/2026): https://superdesign.dev/blog/airbnb-design-system
- Layout Scene — Card UI Design Patterns Guide 2026 — masonry, hero, editorial card anatomy (fetched 03/07/2026): https://www.layoutscene.com/card-ui-design-patterns-guide-2026/
- Muzli — Mobile App Design Trends 2026 — glassmorphism overlay cards, kinetic editorial type, adaptive card reordering (fetched 03/07/2026): https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/
- Stan.vision — UI Card Design: Examples, Best Practices & Common Patterns — KPI/metric card layers (fetched 03/07/2026): https://www.stan.vision/journal/ui-card-design-examples-best-practices-and-common-patterns
- Shadcnblocks — Stats Card 2 (metric with sparkline) — sparkline anatomy (fetched 03/07/2026): https://www.shadcnblocks.com/block/stats-card2
- Lollypop — Investment Dashboard UX Design Guide (May 2026) — portfolio card w/ 12-month sparkline (fetched 03/07/2026): https://lollypop.design/blog/2026/may/investment-dashboard-ux-design-guide/
- Tubik — UI Experiments: Recipe Cards in a Food App — swipe-to-reveal recipe card, tap-ingredient overlay (fetched 03/07/2026): https://blog.tubikstudio.com/ui-experiments-options-for-recipe-cards-in-a-food-app/
- Toolv — Habit Tracker (heatmap + streak) — GitHub-style 5-level heatmap, streak counter (fetched 03/07/2026): https://toolv.com/en/app/habit-tracker
- Apple App Store — Habit Heatmap — heatmap card app (fetched 03/07/2026): https://apps.apple.com/us/app/habit-heatmap-habit-tracker/id6747598515
- GoodUX (Appcues) — Instagram's story swipe & tap protocol — tap forward/back, swipe between (fetched 03/07/2026): https://goodux.appcues.com/blog/instagrams-story-swipe-and-tap-protocol
- Bo Bayerl — Instagram: Patterns and Flows — story ring, feed media card anatomy (fetched 03/07/2026): https://bobayerl.medium.com/instagram-patterns-and-flows-927ee305c1b
- Spotify Support — Now Playing view / Play Queue — now-playing + reorderable queue card (fetched 03/07/2026): https://support.spotify.com/us/article/now-playing/
- MacRumors — Apple Music Spotify-like queue on iOS 18 — add-to-front/back, clear-all queue card (fetched 03/07/2026): https://forums.macrumors.com/threads/apple-music-features-improved-spotify-like-queue-system-on-ios-18.2428883/
- Elfsight — Before & After Slider widget (2026) — drag-divider reveal, horizontal/vertical (fetched 03/07/2026): https://elfsight.com/before-and-after-slider-widget/
- Apple App Store — Before After Slider — transformation compare app (fetched 03/07/2026): https://apps.apple.com/us/app/before-after-slider/id6757784683
- StriveCloud — Gamification Features for mHealth — badges, gentle progress micro-interactions (fetched 03/07/2026): https://www.strivecloud.io/blog/gamification-features-mhealth
- Medium (Nikita Saner) — Why Wellness Apps Are Failing Real People — SuperBetter/Headspace no-leaderboard, non-competitive badges (fetched 03/07/2026): https://medium.com/@nikitasaner.work/why-wellness-apps-are-failing-real-people-77a7e242f232
- Mobbin — Empty State UI Design (best practices + variants) (fetched 03/07/2026): https://mobbin.com/glossary/empty-state
- Medium (Somesh Patel, Apr 2026) — Nobody Designs the Empty State — biophilia in empty states (fetched 03/07/2026): https://medium.com/design-bootcamp/nobody-designs-the-empty-state-thats-exactly-why-your-app-feels-unfinished-da3396570de0
- Google Maps Platform — Places UI Kit — Place Details / Place List prebuilt cards (fetched 03/07/2026): https://mapsplatform.google.com/maps-products/places-ui-kit/
- Map UI Patterns — Marker / Search-this-area — marker → info panel card (fetched 03/07/2026): https://mapuipatterns.com/marker/
- Rationalgo — Journal App with AI Mood Analysis & Reflection Prompts — mood-then-note entry card + contextual prompt (fetched 03/07/2026): https://rationalgo.ai/resources/app-builder/journal-app-with-ai-mood-analysis-and-reflection-prompts
- Apple App Store — Daylio Journal (Mood Tracker) — tap-mood + activity-icon quick log, no typing (fetched 03/07/2026): https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242
- Harvard Sites Design System — Quote Card — image-left / attributed-quote-right editorial component (fetched 03/07/2026): https://designsystem.harvardsites.harvard.edu/quote-card
- Framer Marketplace — Quote Testimonial — one-at-a-time centred testimonial w/ blur transition (fetched 03/07/2026): https://www.framer.com/marketplace/components/quote-testimonial/

## The card baton — what "good" means (apply to every style below)
- A card is "a container for a few short, related pieces of information" that acts as a **linked entry point to detail**, not the detail itself — it summarises and entices the tap (source: https://www.nngroup.com/articles/cards-component/). Matches FemWell's own rule: every card open deep-links the EXACT item full-screen.
- Cards suit **mixed/heterogeneous content** (feeds, dashboards, discovery); use plain **lists** for homogeneous items users compare side-by-side — cards there hurt scannability and eat space (source: https://www.nngroup.com/articles/cards-component/). So: don't card-ify long uniform log lists.
- 2026 house style: depth from **photography + whitespace, not heavy shadows**; every interactive chip/heart fully rounded; chrome-free photo-led cards (source: https://superdesign.dev/blog/airbnb-design-system). FemWell already leans this way (paper bg, no hard borders).
- Touch targets ≥ 44–48px inside any card (source: https://www.nngroup.com/articles/mobile-accordions/).

---

## The gallery — additional card types (each with a FemWell adapt line)

### 1. CoverStory / editorial-hero
Full-bleed image with headline + kicker overlaid, one CTA; the single most-customised template of 2026 (editorial-minimal, video-led, split-screen variants), typography treated as a first-class element with kinetic type creeping into heroes (source: https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/; https://www.layoutscene.com/card-ui-design-patterns-guide-2026/). Tap = open the piece full-screen.
**FemWell adapt:** oxblood Fraunces kicker + serif headline over a botanical photo, gold hairline under the kicker — the Lifestyle "Daily Story" cover.

### 2. PullQuote / block-quote
A single sentence blown up as its own card; decorative open-quote glyph watermark or thick left rule, attribution below; used to break up long reads (source: https://designsystem.harvardsites.harvard.edu/quote-card; https://freefrontend.com/css-blockquotes/). Static, in-flow — pushes content down.
**FemWell adapt:** cream card, oversized gold serif quote-mark, oxblood quote text, small attribution in muted ink — drops into any Read/article body.

### 3. MasonryCollection (Pinterest waterfall)
Variable-height cards flow into balanced columns, minimising whitespace; ideal for image-led discovery, mood boards, galleries (source: https://www.layoutscene.com/card-ui-design-patterns-guide-2026/). Tap a tile = open; scroll loads more.
**FemWell adapt:** two-column flora/lifestyle discovery wall (recipes, reads, rituals) — tiles get flora corner motifs, no hard borders, paper gutters.

### 4. PhotoTile-save (Airbnb heart)
Photo-led card, no border/shadow, ~12–20px radius; a small fully-round heart toggle top-right saves without leaving the view; price/label sit below the photo (source: https://superdesign.dev/blog/airbnb-design-system). Heart = the only secondary action, keeping focus on tap-to-open.
**FemWell adapt:** carved-crimson heart mark as the save toggle (on-brand — the heart is literally the brand); saves to a "Kept" collection. **Note:** use FemWell's crimson #BC2E27, not Airbnb Rausch.

### 5. StoryCard (IG tap-through)
Circular avatar "ring" opens a full-screen sequence; **tap right/left = forward/back within, swipe = next author**; long-press pauses; a first-run coach overlay teaches the gestures (source: https://goodux.appcues.com/blog/instagrams-story-swipe-and-tap-protocol; https://bobayerl.medium.com/instagram-patterns-and-flows-927ee305c1b).
**FemWell adapt:** a calm "Today in a minute" ring at top of Today — tappable panes for horoscope, one read, one ritual. **Flag:** keep it optional and slow; the IG urgency/ephemerality vibe fights a calm app — no 24h-expiry pressure.

### 6. CollectionCard / folders
A cover made of a 2×2 mosaic of member thumbnails + a count ("12 saved"); represents a set, opens the set (Airbnb wishlists, Pinterest boards) (source: https://superdesign.dev/blog/airbnb-design-system).
**FemWell adapt:** "Kept" and themed collections (e.g. "Luteal comforts") — flora-tinted 2×2 mosaic cover, gold count chip.

### 7. VoiceCard (anonymous community quote)
A member's words presented as a standalone quote card — one testimonial at a time, centred, quotation-framed, soft blur/scale transitions (source: https://www.framer.com/marketplace/components/quote-testimonial/); community features lean on anonymous sharing boards + peer stories (source: https://medium.com/@nikitasaner.work/why-wellness-apps-are-failing-real-people-77a7e242f232).
**FemWell adapt:** anon Community "someone in your stage said…" card — no avatar, just handle-less warmth, oxblood quote, gentle "me too" tap. Wholesome-safe by design.

### 8. PollCard (vote on a face / option)
Question + 2–4 tappable options (emoji, image, or text); tap registers your vote then reveals the aggregate bar; drag-to-emoji and reaction-icon voting are the common social variants (source: https://techcrunch.com/2017/05/02/treeos-new-social-polling-game-lets-you-vote-with-emojis/; https://rahul-jaiswal.medium.com/using-emoji-reaction-voting-on-facebook-or-linkedin-then-you-are-probably-making-this-mistake-too-62683d4e048f).
**FemWell adapt:** lighthearted "this or that" (outfit, date-night plan, hot take) — **no emoji** (brand rule), use small illustrated/flora chips or text pills; result bars in gold. Spans life, not just health.

### 9. ComparisonCard / before-after slider
Two states with a draggable centre divider; drag reveals the difference; horizontal or vertical, boundary-blur for a natural seam (source: https://elfsight.com/before-and-after-slider-widget/; https://apps.apple.com/us/app/before-after-slider/id6757784683).
**FemWell adapt:** "then vs now" for gentle non-body wins — a room reorganised, a skill a year on, a garden through seasons. **Flag:** steer away from weight/body before-afters — clashes with FemWell's non-clinical, body-neutral stance.

### 10. MapCard (place / event)
A mini-map with a marker; tap marker → info panel/card with name, hours, distance, one CTA; "search this area" for discovery (source: https://mapsplatform.google.com/maps-products/places-ui-kit/; https://mapuipatterns.com/marker/).
**FemWell adapt:** Events/Deals surface — local women's meet-ups, classes; static styled map thumbnail (avoid live-map heaviness) with a flora pin, oxblood place name.

### 11. EmptyStateCard (done well)
Not a blank screen: explains why it's empty, one warm line + a single CTA, and an on-brand illustration; **biophilia** (nature imagery) measurably lowers stress on empty screens (source: https://mobbin.com/glossary/empty-state; https://medium.com/design-bootcamp/nobody-designs-the-empty-state-thats-exactly-why-your-app-feels-unfinished-da3396570de0).
**FemWell adapt:** biophilia is a gift here — a single line-art bloom, warm "smart-friend" line ("Nothing kept yet — start with today's story"), gold CTA. Applies to every empty surface (Kept, Journal, Community).

### 12. Timeline / streak / calendar-heatmap
GitHub-style grid, ~5 intensity levels, gray for none; paired with a streak counter that respects your schedule (weekend gaps don't break it) (source: https://toolv.com/en/app/habit-tracker; https://apps.apple.com/us/app/habit-heatmap-habit-tracker/id6747598515).
**FemWell adapt:** heatmap in **flora/paper tones** (pale sage → deep oxblood, never GitHub green) for gentle ritual consistency. **Flag:** frame as "your rhythm," not a streak you can "lose" — SuperBetter/Headspace show non-punitive framing retains better (source: https://medium.com/@nikitasaner.work/why-wellness-apps-are-failing-real-people-77a7e242f232).

### 13. Carousel-with-dots gallery
Horizontal swipe through photos within one card, pagination dots below; the photo-led card standard (Airbnb listing images) (source: https://superdesign.dev/blog/airbnb-design-system).
**FemWell adapt:** multi-image reads/recipes/lookbooks in one card; dots as tiny gold seeds; swipe stays inside the card, tap opens full.

### 14. Tag / chip filter card
A row of rounded, tappable filter chips (each ≥44px) that narrow a collection in place; toggled state uses one accent (source: https://superdesign.dev/blog/airbnb-design-system; https://www.nngroup.com/articles/mobile-accordions/).
**FemWell adapt:** "For You" filter row — mood/domain chips (Joy, Career, Rest, Cycle) in cream, active chip filled gold; scrollable, no emoji.

### 15. Progress-stepper
Horizontal numbered steps with a filling connector; shows position in a multi-step flow; progress fill after each step gives a dopamine beat (source: https://stormotion.io/blog/fitness-app-ux/; https://www.patternfly.org/patterns/dashboard/design-guidelines/).
**FemWell adapt:** onboarding / a guided Program's session steps — gold connector fills between oxblood dots; calm, not confetti.

### 16. Testimonial / rating card
Quote body + author name + avatar aligned as one unit; one-at-a-time editorial presentation with soft transitions; ratings shown as a small star/number line (source: https://www.framer.com/marketplace/components/quote-testimonial/; https://designsystem.harvardsites.harvard.edu/quote-card).
**FemWell adapt:** expert/GP-reviewed or member-loved rating on a Program or read — small gold star row, oxblood attribution; keep understated.

### 17. Leaderboard / community-rank (gentle)
Ranked list of members by a metric — **but wellness leaders (SuperBetter, Headspace) deliberately drop competitive leaderboards for non-competitive badges + supportive framing** (source: https://medium.com/@nikitasaner.work/why-wellness-apps-are-failing-real-people-77a7e242f232; https://www.strivecloud.io/blog/gamification-features-mhealth).
**FemWell adapt / FLAG:** **avoid a ranked leaderboard.** Replace with a collective "community together" card — "1,240 women journalled this week, you're one of them." Belonging, not rank. A true competitive leaderboard is off-brand for a calm app.

### 18. Recipe card
Photo-led card with time · difficulty · calories/nutrition · ingredient count; tap an ingredient for a detail overlay; swipe-down reveals hidden detail with a first-time hint animation; add-to-shopping-list + save actions (source: https://blog.tubikstudio.com/ui-experiments-options-for-recipe-cards-in-a-food-app/).
**FemWell adapt:** Nutrition surface — recipe card with a phase-tint band (e.g. "iron-rich, for your menstrual days"), gold time/serves chips, save = crimson heart; step view opens full.

### 19. Calendar-strip (week)
A horizontal 7-day strip, today highlighted, dots under days with content; tap a day to scope the view (mood/journal apps) (source: https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242).
**FemWell adapt:** Today/Planner header strip — days in Fraunces numerals, today in an oxblood pill, gold dot = an entry/event; phase colour underlines each day.

### 20. Metric-with-sparkline
Four layers: label · big value · comparison (±% vs benchmark) · a wordless 8–12-period sparkline showing whether the value is a blip or a trend (source: https://www.stan.vision/journal/ui-card-design-examples-best-practices-and-common-patterns; https://www.shadcnblocks.com/block/stats-card2; https://lollypop.design/blog/2026/may/investment-dashboard-ux-design-guide/).
**FemWell adapt:** Pulse/Trends — "Energy this month" big numeral + a tiny oxblood sparkline; green/red arrows become warm up/steady/down glyphs in gold/muted, never alarmist red.

### 21. Badge / achievement
A collectible mark celebrating a milestone; **non-competitive badges build self-esteem without ranking** (Headspace) (source: https://www.strivecloud.io/blog/gamification-features-mhealth; https://medium.com/@nikitasaner.work/why-wellness-apps-are-failing-real-people-77a7e242f232).
**FemWell adapt:** flora "blooms" you grow rather than badges you win — each milestone adds a bloom to your personal flora fingerprint (already a brand system). Perfect fit, zero gamified loudness.

### 22. Tabbed card
One card, an in-card segmented control switching content panes without navigating away (e.g. Overview / Ingredients / Reviews) (source: https://www.stan.vision/journal/ui-card-design-examples-best-practices-and-common-patterns; https://www.nngroup.com/articles/mobile-subnavigation/).
**FemWell adapt:** a Program card with "About / Sessions / What you'll feel" tabs; segmented control in gold underline, oxblood active label.

### 23. Accordion-list
Rows expand in place to reveal detail, **pushing content down rather than overlaying**; ≥48px targets; best for scannable Q&A / progressive disclosure (source: https://www.nngroup.com/articles/mobile-accordions/).
**FemWell adapt:** Health/FAQ "gentle answers" list, or a ritual's optional deeper notes — chevron rotates, hairline gold divider between rows. Calm-friendly.

### 24. Hero-video (play-on-cover)
Cover image with a centred play affordance; tapping plays inline in the card; video-led hero is a named 2026 variant (source: https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/; https://www.layoutscene.com/card-ui-design-patterns-guide-2026/). FemWell rule already: inline media plays IN the card.
**FemWell adapt:** Listen/guided-practice card — flora cover, gold play ring, plays inline; never bounces to a separate player.

### 25. Journal-entry card
A saved reflection shown as a card: date, mood glyph, snippet of the note, activity icons; tap opens the full entry; AI can surface a contextual follow-up prompt from what you wrote (source: https://rationalgo.ai/resources/app-builder/journal-app-with-ai-mood-analysis-and-reflection-prompts; https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242).
**FemWell adapt:** Journal feed card — Ephesis date, phase-tinted mood dot, two-line snippet, "Jess noticed…" gentle prompt chip; opens the entry full-screen.

### 26. Quick-log (± stepper)
Tap −/+ to log a count in one gesture, no keyboard; large touch targets, immediate visual feedback (source: https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242; https://www.nngroup.com/articles/mobile-accordions/).
**FemWell adapt:** log water/rest/walks with a gold ± stepper inline on a Today card; a filled pip animates per tap — small, warm, no confetti.

### 27. Rating / slider input
Drag a slider (or tap a scale) to set an intensity/mood; the primary no-typing capture in mood apps — "swipe to set your mood" (source: https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242; https://rationalgo.ai/resources/app-builder/journal-app-with-ai-mood-analysis-and-reflection-prompts).
**FemWell adapt:** "How's today feeling?" slider on Today — track in phase colours, oxblood thumb, label shifts from "tender" → "bright"; feeds Journal + Pulse.

### 28. Now-playing / queue
Persistent now-playing card (art + scrubber + transport) plus a reorderable queue with add-to-front/back and clear-all; both Spotify and Apple Music converged on this (source: https://support.spotify.com/us/article/now-playing/; https://forums.macrumors.com/threads/apple-music-features-improved-spotify-like-queue-system-on-ios-18.2428883/).
**FemWell adapt:** Listen surface mini-player docked above nav — flora art, gold scrubber; "Up next" as a calm reorderable list of practices/stories.

### 29. Daily-check-in / affirmation cover (already have — extend)
Muzli 2026: overlay/glass cards float above content for contextual moments (source: https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/).
**FemWell adapt:** you have affirmation + daily-check-in; add a **glass/paper overlay variant** for a gentle contextual nudge (e.g. post-event check-in) that floats without a full navigation.

### 30. Rich-summary "one card that reads back your day"
Mood apps generate an auto Weekly/Monthly review card that reads back entries in plain language (source: https://rationalgo.ai/resources/app-builder/journal-app-with-ai-mood-analysis-and-reflection-prompts).
**FemWell adapt:** already have SummaryCard as the canonical page-top — extend to a "Your week, gently" narrative card written in Jess's warm voice, one flora, one gold pull-stat.

---

## Won't-suit-a-calm-cream-app flags (collected)
- **Competitive leaderboard / rank (#17)** — off-brand; wellness leaders drop it. Use collective-belonging framing (source: https://medium.com/@nikitasaner.work/why-wellness-apps-are-failing-real-people-77a7e242f232).
- **Streak-you-can-lose framing (#12)** — keep the heatmap, drop the punitive "streak broken" pressure.
- **IG-style ephemeral urgency (#5)** — the ring is fine; the 24h-expiry / FOMO pressure is not.
- **Body before-after (#9)** — mechanic is good, but body/weight transformations clash with FemWell's non-clinical, body-neutral stance; use non-body "then vs now."
- **Emoji-vote polls (#8)** — the poll is great; emoji are a hard brand no — use flora/illustrated chips.
- **Alarmist red trend arrows (#20)** — keep sparklines, soften the up/down semantics away from clinical red-alert.
- **3D tilt / heavy glassmorphism / kinetic-type overload** (2026 trend, source: https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/) — use glass *surgically* for overlays only; loud motion fights the calm.

## Sharpest additions to build next (Mr Lead Manager)
Priority for a premium editorial-botanical women's app, highest-fit first:
1. CoverStory/editorial-hero · 2. PullQuote · 3. Recipe card · 4. Journal-entry card · 5. VoiceCard (anon community) · 6. Metric-with-sparkline · 7. Calendar-strip · 8. Badge-as-flora-bloom · 9. EmptyStateCard (biophilia) · 10. Carousel-with-dots · 11. Rating/slider input · 12. Now-playing/queue · 13. MasonryCollection · 14. Tag/chip filter · 15. Accordion-list · 16. Tabbed card · 17. CollectionCard (folders) · 18. PhotoTile-save (crimson heart) · 19. Quick-log (±) · 20. Timeline/heatmap (flora tones).
Handle with care / reframe: PollCard (no emoji), Comparison/before-after (non-body), StoryCard (no ephemerality), Leaderboard (→ belonging, not rank).
