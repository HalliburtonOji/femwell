---
name: LingoTrip app on base44
description: Travel-phrase-learning app; app id 69e16dd9053192415a7be3ef; owner flashsnipper@gmail.com
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
LingoTrip is a travel-focused language-learning app the user is iterating on alongside FemWell.

**Why:** User asked Claude to "build it mega prompt after mega prompt, review and fix whatever is missed" within a shared 50-build-point budget (≤10 mega-prompts, aim for 5).

**How to apply:**
- App id: `69e16dd9053192415a7be3ef`
- Editor: `https://app.base44.com/apps/69e16dd9053192415a7be3ef/editor/preview`
- **Live URL**: `https://speak-journey-pro.base44.app` (discovered 2026-04-17 via Publish dialog — prior attempts at `lingotrip-*` all failed)
- Core entities: User (native_language, target_languages), Trip (destination, target_language, country_code, dates), DestinationPack (country_code, language as ISO, total_phrases), Phrase, SavedPhrase, PhraseCategory (has slug after Build #2), Lesson (category is slug after Build #2), LessonItem, Conversation, AppEvent, Subscription.
- Canonical slugs for PhraseCategory: greetings_basics, airport_transport, hotel_accommodation, restaurant_food, shopping_payment, directions_getting_around, emergency_health, small_talk_social, numbers_time, local_etiquette.
- Full roadmap lives in `/sessions/relaxed-loving-brahmagupta/lingotrip_plan.md` (originally 37+ builds — now re-scoped to ≤10 mega-prompts).
- Languages normalized to ISO 639-1 codes (en/es/fr/it/ja/de/pt/th/ko/vi/zh/ar/tr/el/id); country codes to ISO 3166-1 alpha-2 (FR/ES/JP/etc).
