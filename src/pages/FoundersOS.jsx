// ─────────────────────────────────────────────────────────────────────────────
// FoundersOS — dark espresso mini-app. Mounted at /Ideas.
//
// COMPLETE VISUAL REWRITE on 2026-05-24 per Halli's spec:
//   - dark espresso background, gold accents, cream text
//   - fixed top bar + sticky horizontal tab rail
//   - 7 tab panels with proper visual treatments (not a bland white doc)
//
// Tab panels:
//   Lab        — feature cards in 2-col grid (1-col mobile), gold left
//                border, status dot + label
//   Pages      — dark data-flow table with sage/blush read/write pills,
//                + 8 numbered Critical Data Rules cards
//   Roadmap    — vertical sprint timeline w/ gold dots + connecting line
//   Ideas      — colour-coded priority backlog (red/gold/sage left
//                borders), Add Idea row; persists to
//                UserProfile.founder_ideas + femwell_ideas localStorage
//   Strategy   — 2-col stat cards (big gold numbers) + competitor strip
//   Legal      — checklist w/ custom dark checkboxes + gold progress
//                bar; persists to localStorage femwell_founder_checks
//   Decisions  — decision log cards w/ 3px gold left border
//
// Auth: only halliburtonoji@gmail.com or ojihalliburton57@gmail.com get
// the OS. Anyone else gets a "page is private" card on the same dark bg.
//
// Self-contained — no imports from Ideas.jsx, Design Lab, or any other
// FemWell component. Source of truth for content:
//   /sessions/relaxed-loving-brahmagupta/mnt/.claude/skills/FOUNDERS_OS.md
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
// In-app readable mirrors of the canonical claude-state plan docs (Phase 1c).
import CommunityPlanDoc from "@/components/founders/CommunityPlanDoc";
import WholeLifeDoc from "@/components/founders/WholeLifeDoc";
import AudioPlanDoc from "@/components/founders/AudioPlanDoc";
import BuildPlanDoc from "@/components/founders/BuildPlanDoc";
import JournalAuditDoc from "@/components/founders/JournalAuditDoc";
import ExpertGovernanceDoc from "@/components/founders/ExpertGovernanceDoc";
import GroupsLibraryGamesDoc from "@/components/founders/GroupsLibraryGamesDoc";
import IntegrationAuditDoc from "@/components/founders/IntegrationAuditDoc";
import ConnectivityMapDoc from "@/components/founders/ConnectivityMapDoc";
import SharingProposalDoc from "@/components/founders/SharingProposalDoc";
import HomeRedesignDoc from "@/components/founders/HomeRedesignDoc";
import AppHealthAuditDoc from "@/components/founders/AppHealthAuditDoc";
import NutritionPlanDoc from "@/components/founders/NutritionPlanDoc";
import NutritionMasterPlanDoc from "@/components/founders/NutritionMasterPlanDoc";
// BrandIdentityDoc + FloraMeaningDoc folded into the single Brand Bible (brand-bible.html)
import NurtureCompanionDoc from "@/components/founders/NurtureCompanionDoc";
import FeatureIdeasDoc from "@/components/founders/FeatureIdeasDoc";
import CompanionVisionDoc from "@/components/founders/CompanionVisionDoc";
import CompanionVisionV2Doc from "@/components/founders/CompanionVisionV2Doc";
import BooksBookClubsDoc from "@/components/founders/BooksBookClubsDoc";
import NativeWidgetDoc from "@/components/founders/NativeWidgetDoc";
import ArchitectureDoc from "@/components/founders/ArchitectureDoc";
import TodayMegaPlanDoc from "@/components/founders/TodayMegaPlanDoc";
import BottomNavPlanDoc from "@/components/founders/BottomNavPlanDoc";
// Full brand HTML docs (self-contained — inline CSS + live flora SVGs + the omen
// script). Imported as raw strings and rendered in an auto-sized srcdoc iframe so
// their styling AND interactivity are preserved verbatim in-app on Halli's phone.
import brandBibleHtml from "@/components/founders/brandDocs/brand-bible.html?raw";
import pageBrandAuditHtml from "@/components/founders/brandDocs/page-brand-audit.html?raw";
import intentionsGoalsHtml from "@/components/founders/brandDocs/intentions-goals.html?raw";
import connectDaysMissionsHtml from "@/components/founders/brandDocs/connect-days-missions.html?raw";
// HealthCornerDemo was the multi-layout preview. The canonical health
// experience now lives at /Health (src/pages/Health.jsx). The Health Corner
// tab in /Ideas renders <HealthCornerRedirectCard /> instead.
// import HealthCornerDemo from "./HealthCornerDemo";

// ─── Tokens (BRAND CREAM — 2026-06-18 rebuild) ──────────────────────────
// FoundersOS was dark espresso on the RETIRED palette (#D4AF37/#F4EDDB/#9B8B7A).
// Flipped to the canonical brand cream system (BRAND_IDENTITY.md §2): one gold
// #A8893F, one crimson #BC2E27, cream #ECE7DA, ink #0B0805. Sage/blush are
// deepened so they stay legible as TEXT on cream (the brand's light sage/blush
// are background-only hues). Every tab reads from this one object, so the whole
// OS flips to brand in a single edit. `crimson`/`espresso`/`muted` were
// referenced but never defined before (silent undefined → invisible accent
// buttons) — now defined, killing that latent bug.
const T = {
  bg:         "#ECE7DA",   // paper / cream — page background
  surface:    "#F4EFE3",   // paperHi — cards
  surfaceHi:  "#FBF8F0",   // elevated cards / table header / modals
  border:     "#D8CFBC",   // paperDeep — hairline
  textHi:     "#0B0805",   // ink — primary text
  textMid:    "#3A3025",   // muted ink — body text
  textMuted:  "#7A6A4E",   // secondary text (readable on cream)
  gold:       "#A8893F",   // brand gold (single)
  goldSoft:   "rgba(168,137,63,0.14)",
  blush:      "#B5616C",   // readable rose on cream (brand blush #E8B4B8 = bg-only)
  blushSoft:  "rgba(181,97,108,0.12)",
  sage:       "#5F7A5F",   // readable sage on cream (brand sage #8FAF8F = bg-only)
  sageSoft:   "rgba(95,122,95,0.14)",
  red:        "#BC2E27",   // brand crimson (alerts)
  redSoft:    "rgba(188,46,39,0.10)",
  crimson:    "#BC2E27",   // brand heart / crimson accent
  espresso:   "#2E261B",   // dark accent (demo rims)
  muted:      "#7A6A4E",   // alias of textMuted (legacy refs)
};

const ALLOWED = new Set([
  "halliburtonoji@gmail.com",
  "ojihalliburton57@gmail.com",
]);

const HOME = "__home__";

// ─── CATALOG (single source of truth for the whole OS) ───────────────────
// Every reachable thing — previews, demos, specs, plans, tools — is ONE entry.
// The home screen renders + searches this; nothing else drives navigation.
//   kind "route" → opens a real app route (href) in place (an <a>).
//   kind "doc"   → renders an in-page tab component; `key` MUST match the
//                  switch in FoundersInner exactly.
// status: live | new | candidate | approval | updated | archive | null.
// group order here = section order on the home screen.
// Two-tier IA (2026-06-20 de-clutter): CURRENT = what's actually active for
// review now; BRANDDOCS = the ONE consolidated bible; the standing reference
// groups; then ARCHIVE = every old/superseded/passed-on demo, collapsed by
// default. (CAT.PREVIEW retired — all its demos moved to ARCHIVE.)
const CAT = {
  CURRENT:   "Current — active for review",
  BRANDDOCS: "Brand",
  SPECS:     "Plans & specs",
  BRAND:     "Companion & UX",
  VISION:    "Vision & Concepts",
  BUILD:     "Build status",
  ARCHIVE:   "Archive",
};
const GROUP_ORDER = [CAT.CURRENT, CAT.BRANDDOCS, CAT.SPECS, CAT.BRAND, CAT.VISION, CAT.BUILD, CAT.ARCHIVE];
const GROUP_BLURB = {
  [CAT.CURRENT]:   "What's live for your review right now — the demos and plans waiting on you.",
  [CAT.BRANDDOCS]: "One brand home — the consolidated Brand Bible (the old Living-Ecosystem / Brand Identity / Flora docs are folded into it).",
  [CAT.SPECS]:     "Standing plans, specs and audits — the reference for what we're building.",
  [CAT.BRAND]:     "Companion vision, cross-app UX patterns and the PWA/widget plan.",
  [CAT.VISION]:    "Bigger-picture concepts awaiting a build decision.",
  [CAT.BUILD]:     "The living build map — features, sprints, data flow, decisions, legal.",
  [CAT.ARCHIVE]:   "Older / superseded / passed-on demos — kept for history, nothing deleted. Tap to expand.",
};
// Groups that start collapsed (secondary) on the home screen.
const COLLAPSED_BY_DEFAULT = new Set([CAT.ARCHIVE]);

const CATALOG = [
  // (The live Nutrition + Today pages used to be listed here — removed; they're
  //  reachable from the real bottom nav, so listing them in the Ideas hub was
  //  pure clutter. Everything below is a demo/preview/plan/tool.)
  // ── Today (home) directions ───────────────────────────────────────────
  { kind: "route", href: "/TodayOption2", group: CAT.ARCHIVE, sub: "Today (home) directions", status: "new", accent: "gold",
    title: "Today — Option 2 (single smart slider)", desc: "One sliding row, one card per app section, daily-changing suggestions + inline actions (play a podcast, log water, answer the room). Compare with the live Today." },
  { kind: "route", href: "/TodayDemo1", group: CAT.ARCHIVE, sub: "Today (home) directions", accent: "crimson",
    title: "Today Demo 1 — Calm single-focus hub", desc: "One main thing: greeting + phase line, a single focus card, garden footer, everything else behind a 'more' disclosure." },
  { kind: "route", href: "/TodayDemo2", group: CAT.ARCHIVE, sub: "Today (home) directions", accent: "gold",
    title: "Today Demo 2 — Cycle-led day", desc: "A phase-ring hero; focus chosen by phase; a switcher shows menopause/pregnancy reskinning the same spine." },
  { kind: "route", href: "/TodayDemo3", group: CAT.ARCHIVE, sub: "Today (home) directions", accent: "blush",
    title: "Today Demo 3 — Companion / garden-led", desc: "Your garden greets you in her voice; the day's focus is gentle 'tending'; resting season is celebrated, never dies." },
  { kind: "route", href: "/TodayDemo4", group: CAT.ARCHIVE, sub: "Today (home) directions", accent: "sage",
    title: "Today Demo 4 — Card-slider / deck", desc: "A short swipeable deck reusing the Hero-Card-Slider language; top card is the focus, next peeks." },
  { kind: "route", href: "/TodayDemo5", group: CAT.ARCHIVE, sub: "Today (home) directions", accent: "crimson",
    title: "Today Demo 5 — Editorial 'your day'", desc: "A dated dispatch in Jess's voice; greeting + phase + one suggestion woven into prose with inline doorways." },
  // ── Journal previews ──────────────────────────────────────────────────
  { kind: "route", href: "/JournalRedesign1", group: CAT.ARCHIVE, sub: "Journal", status: "approval", accent: "blush",
    title: "Journal — redesign preview", desc: "The demos' richer component language (hero cards, sheets, calmer density) on Journal — carved masthead + identity preserved. Not yet live." },
  { kind: "route", href: "/JournalHubDemo", group: CAT.ARCHIVE, sub: "Journal", accent: "blush",
    title: "Journal — Hub style (rich header + all features)", desc: "Rich reflection header + big sliding cards for the full set: Write · Echo Wall · Witness · Phase Twin · Insights · On This Day · Sealed Letters · Threads · Cycle Mirror · Burn." },
  { kind: "route", href: "/JournalControlDemo", group: CAT.ARCHIVE, sub: "Journal", accent: "blush",
    title: "Journal — Control-Center concept", desc: "Reflection-state header + a floating card: 2-col peek grid (Write/Echo/Witness/Twin/Insights/On-This-Day/Letters/Burn/Threads) + a right jump rail." },
  // (Journal theme demos appended programmatically below from JOURNAL_DEMOS)
  // ── Community previews ────────────────────────────────────────────────
  { kind: "route", href: "/CommunityDemo6", group: CAT.ARCHIVE, sub: "Community", status: "candidate", accent: "crimson",
    title: "Community — Demo 6 (production candidate)", desc: "★ The chosen direction: Rooms + Tabs hybrid, OPEN comments (poster can switch off), backend auto-moderation, Jess as host + active inline support. Crisis-safe, no counts." },
  { kind: "route", href: "/CommunityRedesign1", group: CAT.ARCHIVE, sub: "Community", status: "approval", accent: "gold",
    title: "Community — redesign preview", desc: "Demo 6's rooms elevated with a calm hero, a peeking room slider and bottom sheets — anonymity / 18+ / crisis routing / Jess preserved. Not yet live." },
  { kind: "route", href: "/CommunityHubDemo", group: CAT.ARCHIVE, sub: "Community", accent: "sage",
    title: "Community — Hub style (rich header + all rooms)", desc: "Rich header (season/circle · Jess welcome · QOTD · invite) + big sliding cards for every surface: Lounge · Echo · Lighter Side · Library · Circles · Love · Money · Style · Health · Talk." },
  { kind: "route", href: "/CommunityControlDemo", group: CAT.ARCHIVE, sub: "Community", accent: "sage",
    title: "Community — Control-Center concept", desc: "Welcome header + floating card: 2-col peek grid (Lounge/Echo/Lighter/Library/Circles/Love/Money/Style/Health/Talk) + right jump rail. Anonymous-first." },
  // (Community UX demos 1–5 appended programmatically below from COMMUNITY_DEMOS)
  // ── Nutrition concept demos ───────────────────────────────────────────
  { kind: "route", href: "/NutritionControlDemo", group: CAT.ARCHIVE, sub: "Nutrition", accent: "crimson",
    title: "Nutrition — Control-Center concept", desc: "Daily-Hub header + a full-cover floating card holding a 2-col peek grid (Log/Today/Plan/Recipes/Shop/Progress/Insights/For-your-stage) + a right jump rail." },
  { kind: "route", href: "/NutritionHubDemo", group: CAT.ARCHIVE, sub: "Nutrition", accent: "gold",
    title: "Nutrition — Hub style (reference)", desc: "Reference only — the live Nutrition page already uses this. Daily-Hub plate header + big sliding cards (Log/Today/Plan/Recipes/Shop/Progress/Insights)." },
  // (Nutrition UX demos 1–5 appended programmatically below from NUTRITION_DEMOS)
  // ── Page-redesign demos (full-page redesign directions) ───────────────
  // New full-page demos slot in HERE — add a route entry with
  // sub: "Page-redesign demos" and it appears under that heading automatically.
  // (More coming from a parallel session: Pulse, Planner, others.)
  { kind: "route", href: "/HealthDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "crimson",
    title: "Health — redesign demo", desc: "Vertical editorial 'letters' layout — the Health hub read as a sequence of warm letters rather than a dashboard." },
  { kind: "route", href: "/ProfileDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "blush",
    title: "Profile — redesign demo", desc: "Identity card + flora fingerprint + a bento grid — Profile as a personal, expressive home, not a settings list." },
  { kind: "route", href: "/DoctorExportDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "sage",
    title: "Doctor Export — redesign demo", desc: "A live document builder — watch the GP export assemble itself as you choose what to include." },
  { kind: "route", href: "/ProgramsDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "gold",
    title: "Programs — redesign demo", desc: "A streaming-style gallery — programmes browsed like a streaming service, rich cover cards and rails." },
  { kind: "route", href: "/GardenDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "sage",
    title: "Garden — redesign demo", desc: "An immersive garden scene — the companion garden as a living, full-bleed place rather than a card." },
  { kind: "route", href: "/PulseDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "espresso",
    title: "Pulse — redesign demo", desc: "Insight dashboard — mood/energy sparklines, pattern mini-bars, consistency dots and a phase tile." },
  { kind: "route", href: "/PlannerDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "sage",
    title: "Planner — redesign demo", desc: "Week-strip + agenda timeline with inline check-off and add. A fresh concept; the live Planner is untouched." },
  { kind: "route", href: "/ExploreDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "gold",
    title: "Explore — redesign demo", desc: "Search-first discovery masonry spanning every life domain — not just health." },
  { kind: "route", href: "/SavedDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "blush",
    title: "Saved — redesign demo", desc: "Collections library — per-type cards with spine-stacks plus a filtered list." },
  { kind: "route", href: "/DealsDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "gold",
    title: "Deals — redesign demo", desc: "Voucher wallet — perforated ticket cards for the real partner deals." },
  { kind: "route", href: "/EventsDemo", group: CAT.ARCHIVE, sub: "Page-redesign demos", status: "new", accent: "crimson",
    title: "Events — redesign demo", desc: "Date-grouped agenda / poster feed with online / in-person / free filters." },

  // ── Card-system demos (BRAND_IDENTITY §6.7/§6.8 applied per page) ──────
  // These apply the APPROVED card family + flora-hero/summary signature, for
  // approval BEFORE the live page is rebuilt. New ones slot in HERE with
  // sub: "Card-system demos (pending rebuild)". Seeded with sample content so the full
  // experience (inline players, daily-story-first, real horoscope) is visible.
  { kind: "route", href: "/LifestyleCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "gold",
    title: "Lifestyle — card-system demo ★ for approval", desc: "The approved card system on Lifestyle: flora-hero + summary card, per-type sliding rows (Articles/Books/Watch/Listen/Stories/Your sky), inline video + audio that play in-card, book cards that open THAT book, Daily Story first, a real horoscope snippet. Approve this and it gets applied live." },
  { kind: "route", href: "/CommunityCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "crimson",
    title: "Community — card-system demo ★ for approval", desc: "Whole-life rooms (Dating · Career & Money · Friendship · Just Venting), trending-thread cards that open the exact thread, an anonymous 'share something' card, and member-story cards — all in the card family." },
  { kind: "route", href: "/NutritionCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "sage",
    title: "Nutrition — card-system demo ★ for approval", desc: "Joyful, whole-life food: recipe cards (cook this → the recipe), quick & joyful treats, an inline hydration log-card, a phase-aware row, and a 'pudding counts' card. Not a clinical macro tracker." },
  { kind: "route", href: "/JournalCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "blush",
    title: "Journal — card-system demo ★ for approval", desc: "A quick-write card, life-spanning prompt cards (gratitude · love · career · vent), recent-entry cards, and collection cards — every one opening the exact prompt/entry/collection." },
  { kind: "route", href: "/ProfileCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "blush",
    title: "Profile — card-system demo ★ for approval", desc: "Identity-first, not a settings list: a 'this is you today' summary, an inline intentions card, and 'your spaces' tiles (garden · people · saved · privacy) as rich cards." },
  { kind: "route", href: "/ProgramsCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "gold",
    title: "Programs — card-system demo ★ for approval", desc: "Guided arcs across body, mindset, rest and money: a Continue card → the exact session, plus per-category rows where every card opens THAT programme." },
  { kind: "route", href: "/GardenCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "sage",
    title: "Garden — card-system demo ★ for approval", desc: "Companion-led: an inline 'tend the garden' card, a 'leave a line' card, what's-growing cards, milestones, and a private share — the rituals as the card family." },
  { kind: "route", href: "/PulseCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "plum",
    title: "Pulse — card-system demo ★ for approval", desc: "Your week read back gently: insight cards (mood · energy · rest), patterns-worth-knowing cards, and a phase card — life-spanning, not a clinical chart wall." },
  { kind: "route", href: "/PlannerCardsDemo", group: CAT.ARCHIVE, sub: "Card-system demos (pending rebuild)", status: "approval", accent: "sage",
    title: "Planner (content) — card-system demo ★ for approval", desc: "The CONTENT side of Planner as cards: add-an-intention, today's gentle intentions, your rituals, and soft reminders. NOT the calendar/day-view (those stay as-is)." },
  { kind: "route", href: "/PlannerClipboardDemo", group: CAT.CURRENT, status: "new", accent: "plum",
    title: "Planner — TRUE FULL PARITY rebuild ★ for approval", desc: "The Planner rebuilt to the v4 bible at TRUE full parity — fixing the prior demo, which stripped features Halli named. The two restored with the REAL live components, made prominent: ★CAPACITY planning (the real CapacityTaxBar — phase-aware load vs capacity + the 'Defer N' pill) and ★VOICE-TO-PLAN (the real VoiceScheduler — speak → it plans — opened by an OBVIOUS primary mic button in the signature top, not a buried tile). Everything else present: flora-hero + omen header + summary; Today/Cycle; an Insights NESTED CardDeck (swipe Jess·sky·recovery WITHIN the card); hour-by-hour day view; cycle calendar; lists; body; care (meds/contraception/symptom/body-scan/GP export/doctor diary); rituals (stack/bundle/consistency/builder); nourishment; mind; tonight/Jess; plan-a-day; settings/customise; add FAB; confidence/energy/week-ahead; saved-rhythms; what's-unfinished; cycle-mirror; quiet-mode; pre-TTC; fertile-window; HRT; symptom-ribbon; pregnancy-timeline; kick-counter; EPDS/annual-health. Clipboard + CardDeck spine, ~2 screens. Demo-first; live Planner untouched." },
  { kind: "route", href: "/PlannerRedesignDemo", group: CAT.CURRENT, status: "approval", accent: "plum",
    title: "Planner — full-parity rebuild (v2, self-contained) ★ compare", desc: "A SECOND full-parity Planner rebuild to compare against /PlannerClipboardDemo (Halli asked to keep both side-by-side). Same v4 spine (flora-hero + tap-to-reveal omen + summary; Today/Cycle; clipboard boards). Restores the two the first pass dropped: ★CAPACITY — a dedicated 'Capacity & energy' board on the new in-card CardDeck sub-slider (capacity-tax bar w/ 100% tick · protect-your-energy Light/Moderate/Full · Defer N · 7-day energy forecast); ★VOICE-TO-PLAN — an OBVIOUS primary mic button high under the summary, co-equal with Plan-a-day. Plus quiet-mode note, Lists, Your-Day quick-popups, hour-by-hour day view, cycle calendar, prediction confidence, Care (meds/contraception/HRT/symptom/body-scan/doctor-ready diary/GP export/conditions), Rituals (consistency/saved-rhythms/what's-unfinished/builder), Nourishment, Mind, Tonight & Jess, customise, Add FAB. This one re-implements capacity/voice in-page (seeded) rather than mounting the live components; the sibling demo mounts the REAL CapacityTaxBar/VoiceScheduler. No new function; live Planner untouched." },
  { kind: "route", href: "/PlannerLiveTest", group: CAT.CURRENT, status: "new", accent: "plum",
    title: "Planner — clipboard rebuild · LIVE TEST (authed click-test)", desc: "The integrated clipboard Planner rebuild on a PARALLEL live route, rendering the REAL authenticated data (same loader as /Planner). For genuine click-testing on the signed-in app — Plan-a-day date/time, +Add, every tile's save/persist, modals-in-front — before any swap. Live /Planner stays on the proven shell until this passes. One-line revert kept." },
  { kind: "route", href: "/NutritionRedesignDemo", group: CAT.CURRENT, status: "new", accent: "gold",
    title: "Nutrition — v4 redesign (clipboard, ease-first) ★ for approval", desc: "The live Nutrition (Hub) rebuilt to the v4 Brand Bible and optimised for EASE OF USE. Flora-hero + a signature glance (energy ring + protein/fibre/iron macros + water) + ONE summary, then the two everyday actions as BIG OBVIOUS buttons — 'Log a meal' + 'Log water' (plus voice 'Say it' and a 'Jump to' switcher listing all 8 areas by name; nothing hidden behind a vague 'more'). Everything else lives in two titled §6.10 clipboard sliders: 'Eat today' (Log — 6 methods search/recents/favourites/snap/say/scan → draft · Today — quick water +250/+500, drink log, logged meals + remove, recents · My plan — protein/carbs/fats/fibre/iron/water targets, a guide never a cap) and 'Plan & explore' (Recipes — saved+ratings+log, cook-what-you-have, generate, guided cook · AI meal plan — weekly grid, lock cells, wellness goal, dietary, regenerate week/day/slot · Shop — aisle list, check, build-from-plan, add, pantry · Progress — nested CardDeck: energy sparkline/patterns/body-metric/cycle-lens · Insights — nested CardDeck: Jess weekly story/stage nudges iron·folate·calcium/cycle memory). §6.7.6 quick popups, suggested-dinner one-tap, add FAB. Compact ~2 screens; demo-first (seeded, no live writes); live Nutrition untouched." },
  { kind: "route", href: "/TodayRitualDemo", group: CAT.CURRENT, status: "new", accent: "crimson",
    title: "Today — Ritual Builder (Clipboard slider) ★ for approval", desc: "The live Today (Demo 6) with the 'Your day' to-do turned into a §6.10 Clipboard Stack Slider — slide LEFT to reveal the ritual builder: a clipboard of 4 phase-aware ritual cards, each a §6.7.6 quick-action popup (do it in place → it ticks) tied to garden growth (waters the companion; a pollinator visits after a few). Everything else on Today (hero, day-paragraph, Your-Day list, calendar, sections) is unchanged — additive. For your approval before it goes live on the real Today." },
  { kind: "route", href: "/JournalClipboardDemo", group: CAT.CURRENT, status: "new", accent: "gold",
    title: "Journal — Clipboard rebuild (compact ~2 screens) ★ for approval", desc: "The live Journal (Hub) rebuilt to the v4 Brand Bible and made COMPACT — slide sideways instead of scrolling down. A flora-hero (carved heart + bloom-in-ring) + ONE summary card, then a §6.10 Clipboard Stack Slider through 'Write & reflect' / 'Your circle' / 'Keep & see' boards of uniform 365×488 tiles. EVERY feature preserved (write · echo wall · witness · phase twin · threads · sealed letters · cycle mirror · on-this-day · insights · tonight — each tile opens the FULL real surface) + a §6.7.6 quick-line popup (leave a line in place → saves as a pressed flower). Uniform cards throughout; live Journal untouched." },
  { kind: "route", href: "/TodayClipboardDemo", group: CAT.CURRENT, status: "new", accent: "sage",
    title: "Today — Clipboard COMPACT (less scroll) ★ for approval", desc: "The live Today (the Growth-loaded one) made COMPACT — was a long downward scroll, now ~2 phone screens. Masthead kept (date · hero bloom-in-ring · Jess's day paragraph), then the mid-page sections ride a §6.10 Clipboard Stack Slider sideways instead of stacking down: Board 1 'Your day' (the checklist) · Board 2 'Today's loop' (the Growth Phase-0 daily loop — intention · line of the day · tiny mission · a day for you · someone like you, preserved verbatim) · Board 3 'Cycle & body'. The 'Across your day' per-section slider + 'A few things I noticed' + calendar/sheets all kept. NOTHING stripped; live Today untouched. After approval it replaces live Today." },
  { kind: "route", href: "/ProfileClipboardDemo", group: CAT.CURRENT, status: "new", accent: "blush",
    title: "Profile — segmented, nothing-hidden rework ★ for approval", desc: "Reworked per Halli's note (important things — esp. SETTINGS — were buried in a 'More areas' overlay). Now: a flora-hero (blush/gold camellia + butterfly + carved heart, identity + live phase chips) + ONE summary card, then a MIX of card shapes — BOX tiles in a §6.10 clipboard slider for personalisation (You: stage/assistant/tone/birthday/city/goals, each a §6.7.6 quick-edit popup · Account: plan/anonymous/export/delete), AND full-width STRIP rows in four clearly-labelled segments that SURFACE everything that was hidden: 'Settings' (Settings · Cycle settings · Reminders · Health & conditions · Redo onboarding) · 'Health & cycle' (Pulse · Skin & Hair · Doctor export · Pregnancy/Menopause · Partner) · 'Your spaces' (Community · Saved · Sealed letters · Deals · Events) · 'Account' (Sign out · Terms · Privacy). NOTHING is hidden behind a 'more' tap now; nothing stripped; live Profile untouched." },
  { kind: "route", href: "/RitualBuilderDemo", group: CAT.CURRENT, status: "approval", accent: "sage",
    title: "Ritual Builder — habit-loop demo ★ for approval", desc: "The daily tending loop: a one-tap ritual on Today (phase/time aware), the same RitualCard contextualised across surfaces (Nutrition=water · Journal=three lines · Pulse=pause · Community=one kind message · Garden=tend companion), the §6.7.6 quick-action popup (do it in place → it ticks), and the living-ecosystem tie (each kept ritual grows a bloom; three earns a visitor). Builder lives in Planner. Rides existing RitualsTick/HabitLogs — no new function." },
  { kind: "route", href: "/GrowthDemo", group: CAT.CURRENT, status: "new", accent: "gold",
    title: "Growth & Connection — Phase 0 demos ★ for approval", desc: "The approved intentions/goals + connection/days/missions directions, BUILT demo-first and baked into existing pages (no new nav tab): daily intentions (set·carry·reflect) · the line of the day · goals (long=tree, short=annual) · tiny missions (done → a bloom grows) · the big-life BUCKET LIST (e.g. 'go to Spain' = a tree/long arc) · solo days-off activities (one pick, found for her) · Tier 0 ANONYMOUS connection (resonance + async prompt rooms, no 1:1). Open this hub, then tap any surface card to open its per-surface demo (Today/Garden/Planner/Lifestyle/Community/Profile — all 6 reachable from here). The gated 1:1/pen-pal/matching tiers are HELD pending your safety call (moderation · 18+ · no location). Rides existing dispatchers — no new function." },
  { kind: "route", href: "/PenPalDemo", group: CAT.CURRENT, status: "new", accent: "crimson",
    title: "Gated 1:1 connection (Phase 2) — pen-pal + moderated rooms ★ for approval", desc: "Your safety dials applied: 18+ ONLY (opens behind the real AgeGate) · NO LOCATION ever (matched by season/life-stage/language only) · BACKEND MODERATION (every letter/answer shown going through a 'checked before it's sent' step). Two gentle, anonymous, async surfaces: the moderated SEALED-LETTER PEN-PAL ('a letter to a woman like you' — write, it's checked, then delivered in her time; break the seal on letters that find you; reply with a gentle line) and moderated THEMED PROMPT ROOMS. NO open matching/DMs/profiles. Live build rides EXISTING moderated functions (screenContent + createCommunityPost for rooms; the Witness service path for the pen-pal) — NO new function; new entity only. Demo-first; approve to wire live." },
  { kind: "route", href: "/CommunityV4Demo", group: CAT.CURRENT, status: "new", accent: "sage",
    title: "Community redesign (v4) + Connection fold-in ★ for approval", desc: "The whole Community, redesigned to the v4 bible AND with 1:1 connection folded in — demo-first, nothing stripped. 18+ AgeGate → flora hero + carved heart + ONE summary card → a §6.10 clipboard slider of three boards: CONNECTION (NEW: moderated 1:1 MESSAGING — request-to-connect, every message checked before it reaches her, 'how you want to connect' preferences, block/report; + the sealed-letter pen-pal + 'someone like you' resonance) · THE ROOMS (QOTD + Echo + the 9 whole-life rooms as a CardDeck) · TOGETHER (Circles, Library/Clubs, Games, Wisdom, Pool, Close-the-week, Witness). Rails: 18+ · NO location (season/stage match only) · backend moderation. Also fixes the live sealed-letters wiring (user_id). Live build rides screenContent + createCommunityPost/answerQotd + the Witness path — NO new function; new entity only." },

  // ── Brand ─────────────────────────────────────────────────────────────
  { kind: "route", href: "/FloraLabDemo", group: CAT.CURRENT, status: "new", accent: "sage",
    title: "Flora Lab — elevated bloom library", desc: "The elevated flora system in one place: 20 realistic RichBloomV2 forms, the 9 colourways, 24 meaning-bloom glyph species, and every pollinator (butterfly · bee · dragonfly · moth · ladybird). The realism + variety lift, catalogued." },
  { kind: "route", href: "/BrandCraftSample", group: CAT.ARCHIVE, sub: "Brand", status: "approval", accent: "crimson",
    title: "Brand Craft Sample ★ for approval", desc: "The canonical brand-system craft direction: flat vs upgraded realistic bloom, a botanical line-motif, the carved heart in context, and a live on-device perf measurement." },

  // ── Brand identity — the ONE consolidated bible ───────────────────────
  { kind: "doc", key: "Brand Bible", group: CAT.BRANDDOCS, status: "new", accent: "crimson",
    title: "The Brand Bible", desc: "The ONE source of truth — soul · voice · type · colour · the full flora system (recognisability + the 64-flower library + lifecycle + meaning) · cards + the quick-action popup · page structure · components · nav. Agreed canon, plus a clearly-marked 'Proposed — awaiting sign-off' section. Renders in-app with live flora. (The old separate Living-Ecosystem / Brand Identity / Flora & Meaning docs are folded in here — one brand home.)" },

  // ── Specs & Plans (in-page docs) ──────────────────────────────────────
  { kind: "doc", key: "Page Brand Audit", group: CAT.CURRENT, status: "new", accent: "sage",
    title: "Per-Page Brand Audit & Fix Plan (v4)", desc: "Every page audited vs the full bar (the 64-flower library · the quick-action popup · the living-ecosystem layer) + the in-flight features. Foundation offenders ranked + a per-page uplift matrix; Planner/Jess detail; Ritual Builder demo. For approval." },
  { kind: "doc", key: "Intentions & Goals", group: CAT.CURRENT, status: "new", accent: "crimson",
    title: "Intentions, the Line of the Day & Goals", desc: "Daily intentions, a user-specific soulful 'line of the day', and whole-life goals — baked into Today/Planner/Garden/Profile with NO new nav tab, on the living-ecosystem grammar. Live flora growth sketches; cited goal-science. For your reaction." },
  { kind: "doc", key: "Connect, Days & Missions", group: CAT.CURRENT, status: "new", accent: "sage",
    title: "No Garden Grows Alone", desc: "Connecting women (safe Tier 0→2 ladder, no open matchmaking), days-off activities found FOR her, and no-guilt tiny missions that grow the garden — baked into Community/Today/Lifestyle/Garden/Planner with NO new nav tab. Cited research + the UK Online-Safety/ICO legal flags and the dials for you." },
  { kind: "doc", key: "Bottom-Nav Plan", group: CAT.CURRENT, status: "new", accent: "gold",
    title: "Bottom-Nav Plan", desc: "Floating cream capsule + shrink-on-scroll, reject horizontal-scroll nav. Research, honest drawbacks and a phased plan. Awaiting your approval." },
  { kind: "doc", key: "Today Mega-Plan", group: CAT.SPECS, accent: "gold",
    title: "Today — Mega-Plan", desc: "The full plan for the Today home surface." },
  { kind: "doc", key: "Journal", group: CAT.SPECS, accent: "gold",
    title: "Journal — Master Plan", desc: "Every Journal feature researched, surfaced and structured. The most complete spec in the app." },
  { kind: "doc", key: "Journal Audit", group: CAT.SPECS, accent: "gold",
    title: "Journal — Audit", desc: "State-of-the-Journal audit against the master plan." },
  { kind: "doc", key: "Nutrition Master Plan", group: CAT.SPECS, accent: "sage",
    title: "Nutrition — Master Plan", desc: "The complete nutrition vision and build plan." },
  { kind: "doc", key: "Nutrition Plan", group: CAT.SPECS, accent: "sage",
    title: "Nutrition — Plan", desc: "The working nutrition build plan." },
  { kind: "doc", key: "Community Plan", group: CAT.SPECS, accent: "sage",
    title: "Community — Plan", desc: "The community build spec." },
  { kind: "doc", key: "Books & Book Clubs", group: CAT.SPECS, accent: "gold",
    title: "Books & Book Clubs", desc: "Reading + book-club plan across Lifestyle and Community." },
  { kind: "doc", key: "Build Plan", group: CAT.SPECS, accent: "gold",
    title: "Build Plan", desc: "Cross-app build sequencing." },
  { kind: "doc", key: "Expert Governance", group: CAT.SPECS, accent: "crimson",
    title: "Expert Governance", desc: "Clinical credibility, expert review and medical-claims governance." },
  { kind: "doc", key: "Library & Groups", group: CAT.SPECS, accent: "sage",
    title: "Library, Groups & Games", desc: "Community library, circles and the non-clinical games plan." },
  { kind: "doc", key: "Integration Audit", group: CAT.SPECS, accent: "gold",
    title: "Integration Audit", desc: "How the surfaces are (and aren't) wired together." },
  { kind: "doc", key: "Connectivity Map", group: CAT.SPECS, accent: "gold",
    title: "Connectivity Map", desc: "The cross-page data + signal flow map." },
  { kind: "doc", key: "Sharing", group: CAT.SPECS, accent: "blush",
    title: "Sharing Proposal", desc: "What can be shared, with whom, and how privacy is held." },
  { kind: "doc", key: "Home Redesign", group: CAT.SPECS, accent: "gold",
    title: "Home Redesign", desc: "The home/Today redesign proposal." },
  { kind: "doc", key: "Whole-Life", group: CAT.SPECS, accent: "sage",
    title: "Whole-Life Rebalance", desc: "Spanning life domains, not just health — the rebalance plan." },
  { kind: "doc", key: "Audio", group: CAT.SPECS, accent: "blush",
    title: "Audio Plan", desc: "Listen / podcasts / voice plan across Lifestyle." },
  { kind: "doc", key: "Architecture", group: CAT.SPECS, accent: "espresso",
    title: "Architecture", desc: "The app's technical architecture overview." },
  { kind: "doc", key: "Health Audit", group: CAT.SPECS, accent: "crimson",
    title: "App Health Audit", desc: "Health-surface audit and findings." },

  // ── Brand & UX ────────────────────────────────────────────────────────
  // (former "Brand Identity" + "Flora & Meaning" entries folded into the single Brand Bible above)
  { kind: "doc", key: "UX & Design", group: CAT.BRAND, accent: "gold",
    title: "UX & Design — patterns from everywhere", desc: "25 cross-category UX patterns (Oura, Spotify, Notion, Monzo, Wordle…) translated for FemWell." },
  { kind: "doc", key: "Nurture Companion", group: CAT.BRAND, accent: "blush",
    title: "Nurture Companion", desc: "The companion/garden design doc." },
  { kind: "doc", key: "Companion Vision", group: CAT.BRAND, accent: "blush",
    title: "Companion Vision", desc: "The original companion vision." },
  { kind: "doc", key: "Companion Vision v2", group: CAT.BRAND, accent: "blush",
    title: "Companion Vision v2", desc: "The evolved companion vision." },
  { kind: "doc", key: "Widget & PWA", group: CAT.BRAND, accent: "gold",
    title: "Widget & PWA", desc: "Native widget + progressive-web-app plan." },

  // ── Vision & Concepts ─────────────────────────────────────────────────
  { kind: "doc", key: "Another You", group: CAT.VISION, accent: "espresso",
    title: "Another You", desc: "The shadow/mirror/oracle page concept — the most ambitious page in the app. Research complete, awaiting build approval." },
  { kind: "doc", key: "Wholeness", group: CAT.VISION, accent: "sage",
    title: "Wholeness", desc: "From cycle app to women's app — the 10 life dimensions FemWell should hold." },
  { kind: "doc", key: "LGBTQ+", group: CAT.VISION, accent: "blush",
    title: "LGBTQ+ inclusion plan", desc: "Full inclusion plan — research, quick wins, structural changes, what not to do." },
  { kind: "doc", key: "Feature Ideas", group: CAT.VISION, accent: "gold",
    title: "Feature Ideas", desc: "The running feature-ideas doc." },

  // ── Build Status (tools) ──────────────────────────────────────────────
  { kind: "doc", key: "Lab", group: CAT.BUILD, accent: "sage",
    title: "Lab — feature status", desc: "Every feature, shipped vs next vs planned, with commit hashes." },
  { kind: "doc", key: "Roadmap", group: CAT.BUILD, accent: "gold",
    title: "Roadmap", desc: "The sprint timeline, complete → current → planned → launch." },
  { kind: "doc", key: "Pages", group: CAT.BUILD, accent: "gold",
    title: "Pages — data-flow map", desc: "Every surface, what it reads and writes, + the critical cross-page data rules." },
  { kind: "doc", key: "Decisions", group: CAT.BUILD, accent: "gold",
    title: "Decisions", desc: "The locked architecture decision log." },
  { kind: "doc", key: "Strategy", group: CAT.BUILD, accent: "crimson",
    title: "Strategy", desc: "Market signals, the competitor strip and the investor narratives." },
  { kind: "doc", key: "Legal", group: CAT.BUILD, accent: "crimson",
    title: "Legal — pre-launch gates", desc: "The 15-item launch checklist with your-action flags (persists)." },
  { kind: "doc", key: "Ideas", group: CAT.BUILD, accent: "gold",
    title: "Ideas backlog", desc: "The priority backlog — add your own (persists to your profile)." },

  // ── Archive ───────────────────────────────────────────────────────────
  { kind: "doc", key: "Health Corner", group: CAT.ARCHIVE, status: "archive", accent: "espresso",
    title: "Health Corner (redirects to /Health)", desc: "Superseded — the Letter-format Health hub now lives at its own /Health page." },
];

// The data-driven demo families live in the catalog too (so they're searchable)
// without re-typing each one. Built LAZILY in a function — the *_DEMOS arrays are
// declared lower in this file, so referencing them at module top-level would hit
// the temporal dead zone. demoCatalogEntries() is only called at render time.
function demoCatalogEntries() {
  return [
    ...JOURNAL_DEMOS.map((d) => ({
      kind: "route", href: `/${d.slug}`, group: CAT.ARCHIVE, sub: "Journal", accent: "blush",
      title: `Journal theme demo ${d.n} — ${d.title}`, desc: `${d.subtitle}. ${d.body}`,
    })),
    ...COMMUNITY_DEMOS.filter((d) => d.slug !== "CommunityDemo6").map((d) => ({
      kind: "route", href: `/${d.slug}`, group: CAT.ARCHIVE, sub: "Community", accent: "sage",
      title: `Community UX demo ${d.n} — ${String(d.title).replace(/^UX \d+ — /, "")}`, desc: `${d.subtitle}. ${d.body}`,
    })),
    ...NUTRITION_DEMOS.map((d) => ({
      kind: "route", href: `/${d.slug}`, group: CAT.ARCHIVE, sub: "Nutrition", accent: "gold",
      title: `Nutrition UX demo ${d.n} — ${d.title}`, desc: `${d.subtitle}. ${d.body}`,
    })),
  ];
}

// Sub-section order within the Archive group (keeps the old demos organised when expanded).
const ARCHIVE_SUB_ORDER = [
  "Page-redesign demos",
  "Card-system demos (pending rebuild)",
  "Today (home) directions",
  "Journal", "Community", "Nutrition",
  "Brand",
];

const accentColor = (a) => ({ gold: T.gold, sage: T.sage, blush: T.blush, crimson: T.crimson, espresso: T.espresso }[a] || T.gold);
const STATUS_CHIP = {
  live:      { label: "Live",       bg: T.sage,    fg: "#fff" },
  new:       { label: "New",        bg: T.gold,    fg: "#fff" },
  candidate: { label: "Candidate",  bg: T.crimson, fg: "#fff" },
  approval:  { label: "For approval", bg: "transparent", fg: T.gold, border: T.gold },
  updated:   { label: "Updated",    bg: T.goldSoft, fg: T.gold, border: T.gold },
  archive:   { label: "Archived",   bg: "transparent", fg: T.textMuted, border: T.border },
};
const lc = (s) => String(s || "").toLowerCase();
const matchesQuery = (e, q) =>
  !q || [e.title, e.desc, e.group, e.sub, e.href].some((f) => lc(f).includes(q));

// Light reading panel for the self-contained docs (those that don't use DocKit's
// DocShell) so their dark ink prose reads on the dark FoundersOS page. Matches
// DocShell's treatment. The wrapped docs supply their own centered inner column.
function DocSurface({ children }) {
  return (
    <div style={{
      background: "#ECE7DA",
      borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
      padding: "18px 0 40px", margin: "2px 0 8px",
    }}>{children}</div>
  );
}

const IDEAS_KEY  = "femwell_ideas";
const CHECKS_KEY = "femwell_founder_checks";

// ─── DATA ──────────────────────────────────────────────────────────────

// Tab 1 — Lab (feature cards)
const LAB = [
  { name: "Planner v2",                status: "Shipped",      tone: "sage",  desc: "Unified daily planner — 12 rows, cycle-aware, life-stage adaptive. All rows wired and live.", commits: "41f9173 · dff4791 · bc7834d" },
  { name: "Jess AI — Features 1–4",    status: "Shipped",      tone: "sage",  desc: "Conversation history with auto-naming, JessMemory recall, voice logging, For You tab.",       commits: "2359640" },
  { name: "Jess Action Layer",         status: "Shipped",      tone: "sage",  desc: "JSON envelope so Jess can write logs from chat. 16 action types, confidence-gated execution.", commits: "be67567 · cd4fef8" },
  { name: "Voice Companion Mode",      status: "Shipped",      tone: "sage",  desc: "Full-screen mic conversation with Jess — Web Speech in, speech synthesis out, actions execute live.", commits: "be67567" },
  { name: "Crisis Protocol (7-cat)",   status: "Shipped",      tone: "sage",  desc: "Sensitive-topic classifier + UK referral cards per category, Samaritans hard-stop for urgent crisis.", commits: "31f0db0 · 3bd95f6" },
  { name: "FoundersOS",                status: "Shipped",      tone: "sage",  desc: "This page. Living mind map of the build — pages, sprints, ideas, strategy, legal, decisions.",   commits: "b55437b (this rewrite)" },
  { name: "Sprint 7 — Voice to Schedule", status: "Next",       tone: "gold",  desc: "Mic on Planner → speech → NLP intent → confirm sheet → write task. Web Speech API only (no third-party).", commits: "—" },
  { name: "Sprint 8 — Morning Brief auto-launch", status: "Planned", tone: "gold", desc: "First open each day → Morning Brief instead of Planner home. Skip if already opened today.", commits: "—" },
  { name: "Sprint 9 — Perimenopause depth", status: "Planned", tone: "gold",  desc: "HRT tracker, hot flash log, brain-fog ribbon, Menopause Rating Scale, peri Jess persona.",        commits: "—" },
  { name: "Sprint 10 — Partner Sync",   status: "Planned",     tone: "gold",  desc: "Partner-facing page. Currently 404. Cycle phase view, mood signal, what-support-helps cards.",   commits: "—" },
  { name: "Sprint 11 — Pre-launch compliance", status: "Required", tone: "blush", desc: "ICO registration, DPA signed, DPIA, granular consent, account-deletion cascade, data export.", commits: "—" },
  { name: "Ritual Builder on /Track",   status: "In Progress", tone: "gold",  desc: "Bundle entry exists on Planner; /Track wire-up still pending so habits route to same surface.",   commits: "e4f1563 (planner side)" },
];

// Tab 2 — Pages (data flow map)
const PAGE_MAP = [
  { page: "Today",         url: "/Today",        reads: "DailyCheckins, SymptomLogs, MealLog, HydrationLog, HabitLogs, MedicationLogs, CycleRecord", writes: "DailyCheckins, SymptomLogs, MealLog, HydrationLog, HabitLogs, MedicationLogs" },
  { page: "Planner",       url: "/Planner",      reads: "DailyCheckins, PersonalTasks, HabitLogs, MealLog, PlannerItems, CycleRecord, Events",        writes: "PersonalTasks, HabitLogs, DailyCheckins" },
  { page: "Pulse",         url: "/Pulse",        reads: "DailyCheckins, SymptomLogs, HabitLogs, CycleRecord, SessionLogs, MealLog",                    writes: "— (read-only)" },
  { page: "Journal",       url: "/Journal",      reads: "JournalEntries",                                                                                writes: "JournalEntries" },
  { page: "Nutrition",     url: "/Nutrition",    reads: "MealLog, HydrationLog",                                                                         writes: "MealLog, HydrationLog" },
  { page: "Doctor Export", url: "/DoctorExport", reads: "DailyCheckins, SymptomLogs, MedicationLogs, SessionLogs, CycleRecord",                          writes: "— (export only)" },
  { page: "Skin & Hair",   url: "/SkinHair",     reads: "DailyCheckins (skin/hair fields)",                                                              writes: "— (logged in Today)" },
  { page: "Profile",       url: "/Profile",      reads: "UserProfile",                                                                                   writes: "UserProfile (life stage, conditions, cycle)" },
  { page: "Track",         url: "/Track",        reads: "CycleRecord, SymptomLogs, HabitLogs, MedicationLogs, SessionLogs",                              writes: "CycleRecord, HabitLogs, MedicationLogs, SessionLogs" },
  { page: "Explore",       url: "/Explore",      reads: "ContentLibrary",                                                                                 writes: "SessionLogs (on session complete)" },
  { page: "Jess",          url: "overlay",       reads: "All entities (context), JessMemory, JessConversations",                                          writes: "JessMemory, JessConversations, DailyCheckins/MealLog/etc (action layer)" },
  { page: "Community",     url: "/Community",    reads: "CommunityPosts",                                                                                 writes: "CommunityPosts" },
  { page: "Life Stage Care", url: "/LifeStageCare", reads: "UserProfile, DailyCheckins",                                                                  writes: "UserProfile (due date)" },
  { page: "Founders OS",   url: "/Ideas",        reads: "UserProfile.founder_ideas, UserProfile.founder_checks",                                          writes: "UserProfile.founder_ideas, UserProfile.founder_checks" },
  { page: "Partner Sync",  url: "/PartnerSync",  reads: "— (not built, 404)",                                                                             writes: "—" },
];

const DATA_RULES = [
  "Today check-in → radiates to Planner body tiles, Pulse, Skin & Hair, Doctor Export, Journal Insights, Jess context.",
  "Life stage (Profile) reshapes every page — every build must be tested across stage changes.",
  "Habit completions on Today AND Planner write to the SAME HabitLogs entity.",
  "Hydration on Today AND Nutrition write to the SAME HydrationLog entity.",
  "Meal logging on Today AND Nutrition write to the SAME MealLog entity.",
  "GP Report is accessible from 3 places (Menu → Care Bridge, Planner Journey, Planner HRT). All routes hit /DoctorExport.",
  "Cycle period logged triggers phase recalc across Today, Planner, Pulse, Explore, Nutrition, Lifestyle.",
  "Jess reads cycle phase, life stage, today's mood/energy, recent symptoms, memory — new entities MUST be exposed to Jess context.",
];

// Tab 3 — Roadmap (vertical timeline)
const ROADMAP = [
  { sprint: "Sprint 1–4",  state: "complete", title: "Core shell + Today + Journal + Planner v1", note: "Auth, life stage onboarding, symptom logging, mood/energy, nutrition, meds, habit streaks, cycle calendar." },
  { sprint: "Sprint 5",    state: "complete", title: "GP Export + Skin & Hair + Pulse",            note: "Read-only Pulse dashboard, Skin & Hair page reads DailyCheckins, Doctor Export bundle." },
  { sprint: "Sprint 6A",   state: "complete", title: "Universal Logger FAB + date pickers",        note: "Cross-page logging, export merge surface." },
  { sprint: "Sprint 6B",   state: "complete", title: "Ritual Builder + Planner v2 full rebuild",    note: "All 12 Planner rows wired; ritual bundles drop-in (no streak)." },
  { sprint: "Sprint 6C",   state: "complete", title: "Jess F1–4 + 7-cat crisis protocol",           note: "History, memory, voice logger, For You tab + Wings." },
  { sprint: "Sprint 5 (Jess Action Layer)", state: "complete", title: "JSON envelope + voice mode + 16 action types", note: "Hybrid envelope, confidence-gated writes, full-screen voice companion." },
  { sprint: "Sprint 7",    state: "current",  title: "Voice to Schedule",                           note: "Mic on Planner → speech → NLP intent → confirm sheet → write task. Web Speech API only." },
  { sprint: "Sprint 8",    state: "planned",  title: "Morning Brief auto-launch",                   note: "First open of the day → Morning Brief instead of Planner home." },
  { sprint: "Sprint 9",    state: "planned",  title: "Perimenopause & menopause depth",              note: "HRT, hot flash, brain fog, MRS, peri Jess persona." },
  { sprint: "Sprint 10",   state: "planned",  title: "Partner Sync page",                            note: "Partner-facing view: phase, mood signal, what helps. Currently 404." },
  { sprint: "Sprint 11",   state: "required", title: "Pre-launch compliance + legal gates",          note: "ICO, DPA, DPIA, granular consent, deletion cascade, data export, teen consent." },
  { sprint: "Launch",      state: "planned",  title: "App Store / Play Store — late 2026",          note: "Capacitor wrap → TestFlight → store submission." },
];

// Tab 4 — Ideas backlog (15+ ideas with priority bucket)
const IDEAS_INITIAL = [
  // High priority — red
  { id: 1,  title: "Unified Health Page",      description: "Single dashboard aggregating ALL health data: cycle, mood/energy trends, symptoms, nutrition, medication, sleep — one place to see the whole picture.", status: "high" },
  { id: 2,  title: "Morning Brief auto-launch", description: "First open of the day auto-launches Morning Brief instead of Planner home. Skip if already opened today.",                                          status: "high" },
  { id: 3,  title: "B2B / employer pathway",    description: "FemWell as a workplace women's health benefit. Enterprise pricing, anonymised aggregate HR reporting. Strong investor narrative thread.",            status: "high" },
  // Planned — gold
  { id: 4,  title: "Pattern Nudges (Jess)",     description: "Jess proactively notices patterns across cycles (e.g. 'you feel tired on days 19–21 consistently — that's your luteal dip'). Max 1 unsolicited message/day.", status: "planned" },
  { id: 5,  title: "Predictive Phase Prep",     description: "Uses the user's own cycle history to prepare them for what's physically coming. No competitor does this well.",                                      status: "planned" },
  { id: 6,  title: "Jess Memory Cards",         description: "Visible summary of what Jess has learned about you — vegetarian, low-energy in luteal, TTC since March, etc.",                                       status: "planned" },
  { id: 7,  title: "Daily Opening Card",        description: "Jess's first message streams in as you open the app. Perceptual step-change vs waiting for a typed reply.",                                          status: "planned" },
  { id: 8,  title: "Astra deep-link",           description: "From any Jess conversation, 'Talk to Astra about this >' hands off to a clinical-style Astra session with full context.",                            status: "planned" },
  { id: 9,  title: "Perimenopause companion",   description: "Jess adapts entirely: no cycle references, brain-fog empathy, HRT support, Menopause Rating Scale.",                                                 status: "planned" },
  { id: 10, title: "Partner Sync",              description: "Partner-facing view: cycle phase, how partner is feeling, what support helps. Currently 404.",                                                       status: "planned" },
  { id: 11, title: "Full data export",          description: "GDPR Art. 20 right to portability. JSON export of every entity tied to the user.",                                                                   status: "planned" },
  { id: 12, title: "Teen companion mode",       description: "Under-18 specific experience, age-appropriate language, parental consent flow, stricter data handling. Legal requirement pre-launch.",                status: "planned" },
  // Future — sage
  { id: 13, title: "Skin & Hair phase guide",   description: "Cycle-aware skincare. Currently a passive read-only page; should become a guide.",                                                                   status: "future" },
  { id: 14, title: "Wearable / device sync",    description: "Apple Health, Garmin, Fitbit ingestion for richer health context (HRV, sleep, steps).",                                                              status: "future" },
  { id: 15, title: "Offline mode",              description: "Cached content + last-N-days data for no-signal use.",                                                                                                status: "future" },
];

// Tab 5 — Strategy (stat cards + competitor strip)
const STATS = [
  { number: "45%",  label: "Flo MAU growth", source: "After LLM fine-tuning deployed in 2024" },
  { number: "57%",  label: "Flo WAU growth", source: "Same deployment window" },
  { number: "$2.6B", label: "Femtech AI invested 2024", source: "+55% YoY (PitchBook)" },
  { number: "7%",   label: "Femtech focused on menopause", source: "~1B affected women globally" },
  { number: "11",   label: "Life stages FemWell covers", source: "Teen → post-menopause. No competitor matches." },
  { number: "Late '26", label: "App Store target", source: "6–8 months from Jan 2026" },
];

const COMPETITORS = [
  { name: "Flo",            theirs: "Cycle + AI assistant",       ours: "Full life stage + warm companion + perimenopause depth" },
  { name: "Clue",            theirs: "Cycle + research-grade data", ours: "AI companion + multi-stage adaptation + UK trust posture" },
  { name: "Natural Cycles",  theirs: "Contraception (FDA-cleared)",  ours: "Holistic wellness, not contraception" },
  { name: "Noom",            theirs: "Behaviour change for weight",  ours: "Women-specific + cycle-aware + perimenopause specialist" },
  { name: "Elvie",           theirs: "Hardware (pelvic floor, pump)", ours: "Software companion that pairs with any hardware" },
];

const NARRATIVES = [
  { title: "Trust window — ICO is live",        body: "UK ICO opened a fertility-app investigation in Dec 2024. Police can now access menstrual data. FemWell ships an explicit law-enforcement data policy. Trust posture = differentiator." },
  { title: "Menopause whitespace",              body: "Only 7% of femtech apps focus on menopause; 1B women affected, no dominant AI companion. FemWell's perimenopause depth claims that space." },
  { title: "Investor narrative",                body: "AI-first + clinically credible + perimenopause whitespace + B2B employer pathway. Each leg defendable. Each leg already in the build plan." },
  { title: "Business model",                    body: "Freemium with £4.99–9.99/month premium tier. Pricing locked AFTER full build + cost analysis. Apple 30% cut (15% after year 1) factored in. No paywalls yet." },
];

// Tab 6 — Legal (15-item checklist)
const LEGAL = [
  { id: "ico-reg",        text: "ICO registration",                                  founder: true },
  { id: "dpia",           text: "DPIA completed",                                    founder: true },
  { id: "base44-dpa",     text: "Base44 DPA signed",                                 founder: true },
  { id: "privacy-policy", text: "Privacy Policy live in-app",                        founder: false },
  { id: "terms",          text: "Terms & Conditions live in-app",                    founder: false },
  { id: "consent-flag",   text: "Granular consent flag on every new data collection point", founder: false },
  { id: "account-del",    text: "Account deletion cascade-deletes all user data (no soft delete)", founder: false },
  { id: "teen-gate",      text: "Teen age gate + parental consent (UK GDPR Art. 8 / AADC)", founder: false },
  { id: "data-export",    text: "Full data export (GDPR Art. 20 — Download my data)", founder: false },
  { id: "privacy-email",  text: "Privacy contact email visible in app",              founder: false },
  { id: "jess-notice",    text: "Jess data notice in Jess header",                   founder: false },
  { id: "crisis-qa",      text: "Crisis protocol QA verified end-to-end",            founder: false },
  { id: "analytics-opt",  text: "Analytics opt-out toggle for users",                founder: false },
  { id: "trademark",      text: "Trademark search — FemWell, UK health/wellness",    founder: true },
  { id: "store-rating",   text: "App Store rating review (expect 12+ for health data)", founder: false },
];

// Tab 7 — Decisions (architecture log)
const DECISIONS = [
  { title: "PlannerV2Shell self-contained",  body: "Locked row order — never import from planner-v2/ row files (dead code). One file, one shell." },
  { title: "Planner row order — locked",     body: "Hero → Lists → Schedule → Your Day → Body Today → Stage → Condition → Rituals → Nourishment → Mind & Insight → Care → Tonight & Tomorrow." },
  { title: "Jess is a wellness companion",   body: "Never diagnostic. Every output reads 'not medical advice'. MHRA risk if Jess sounds clinical." },
  { title: "Freemium split deferred",        body: "Pricing locked AFTER full build + cost analysis. No paywalls in the codebase yet." },
  { title: "Teen life stage = biggest exposure", body: "Parental consent flow before launch. Under-13 = parental consent required. Stricter data handling." },
  { title: "Stay in Base44 for full build",  body: "Don't export mid-build. Capacitor + native shell at the very end of the cycle." },
  { title: "Jess action envelope = Option C", body: "Hybrid JSON: { message, actions[] }. Single API call. Client parses + executes entity writes." },
  { title: "No HTML files for Halli",        body: "Halli is on her phone — HTML files don't render. Interactive tools must ship as real app pages." },
  { title: "Base44 Issues — Resolve with AI", body: "Click 'Resolve with AI' on the Issues dialog. Free. If the tab freezes, reload it." },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function loadIdeasFromCache() {
  try {
    const raw = window.localStorage?.getItem(IDEAS_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : null;
  } catch { return null; }
}
function saveIdeasToCache(arr) {
  try { window.localStorage?.setItem(IDEAS_KEY, JSON.stringify(arr || [])); } catch { /* swallow */ }
}
function loadChecksFromCache() {
  try {
    const raw = window.localStorage?.getItem(CHECKS_KEY);
    if (!raw) return [];
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch { return []; }
}
function saveChecksToCache(arr) {
  try { window.localStorage?.setItem(CHECKS_KEY, JSON.stringify(arr || [])); } catch { /* swallow */ }
}

function statusTone(status) {
  if (status === "high")    return { border: T.red,   pill: T.redSoft,   text: T.red,   label: "High priority" };
  if (status === "planned") return { border: T.gold,  pill: T.goldSoft,  text: T.gold,  label: "Planned" };
  if (status === "future")  return { border: T.sage,  pill: T.sageSoft,  text: T.sage,  label: "Future" };
  return { border: T.border, pill: T.surfaceHi, text: T.textMuted, label: status || "Idea" };
}

function labTone(tone) {
  switch (tone) {
    case "sage":  return T.sage;
    case "gold":  return T.gold;
    case "blush": return T.blush;
    default:      return T.textMuted;
  }
}

function roadmapDot(state) {
  if (state === "complete") return { fill: T.sage, ring: T.sageSoft,  label: "Complete" };
  if (state === "current")  return { fill: T.gold, ring: T.goldSoft,  label: "Current" };
  if (state === "required") return { fill: T.blush, ring: T.blushSoft, label: "Required" };
  return { fill: T.textMuted, ring: "transparent", label: "Planned" };
}

// ─── Reusable shell pieces ────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: 0.7, textTransform: "uppercase",
      color: T.textMuted, marginBottom: 12, fontWeight: 600,
    }}>{children}</div>
  );
}

function PageHeader({ title, subtitle, badge, badgeTone = "red" }) {
  const tone = badgeTone === "gold"
    ? { bg: T.goldSoft, fg: T.gold, border: T.gold }
    : badgeTone === "sage"
      ? { bg: T.sageSoft, fg: T.sage, border: T.sage }
      : { bg: T.redSoft, fg: T.red, border: T.red };
  return (
    <div style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "22px 22px 20px",
      marginBottom: 22,
    }}>
      <div style={{
        fontSize: 28, fontWeight: 700, color: T.gold,
        letterSpacing: -0.4, lineHeight: 1.15, marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontSize: 13, color: T.textMid, lineHeight: 1.55, marginBottom: badge ? 14 : 0,
      }}>{subtitle}</div>
      {badge && (
        <div style={{
          display: "inline-block",
          background: tone.bg, color: tone.fg,
          border: `1px solid ${tone.border}`,
          borderRadius: 6, padding: "5px 12px",
          fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
          textTransform: "uppercase",
        }}>{badge}</div>
      )}
    </div>
  );
}

function FeatureCard({ n, name, tagline, body, tier }) {
  const tierStyle = tier === "addon"
    ? { bg: T.surfaceHi, fg: T.textMuted, border: T.border, label: "Addon" }
    : { bg: T.goldSoft, fg: T.gold, border: T.gold, label: "Core" };
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "18px 20px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: tier === "addon" ? T.surfaceHi : T.goldSoft,
          color: tier === "addon" ? T.textMuted : T.gold,
          border: `1px solid ${tier === "addon" ? T.border : T.gold}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, flexShrink: 0,
        }}>{n}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            {tier && (
              <span style={{
                background: tierStyle.bg, color: tierStyle.fg,
                border: `1px solid ${tierStyle.border}`,
                padding: "2px 8px", borderRadius: 999,
                fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2,
                textTransform: "uppercase",
              }}>{tierStyle.label}</span>
            )}
            <div style={{
              fontSize: 18, fontWeight: 700, color: T.textHi,
              letterSpacing: -0.1, lineHeight: 1.25,
            }}>{name}</div>
          </div>
          {tagline && (
            <div style={{
              fontSize: 13.5, fontStyle: "italic", color: T.blush,
              lineHeight: 1.5, marginBottom: 8,
            }}>{tagline}</div>
          )}
        </div>
      </div>
      <p style={{
        fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0,
      }}>{body}</p>
    </article>
  );
}

function StatusDot({ color }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 99,
      backgroundColor: color, display: "inline-block",
      boxShadow: `0 0 0 3px ${color}26`,
    }} />
  );
}

// ─── Main export ──────────────────────────────────────────────────────
export default function FoundersOS() {
  const { user, loading } = useAuth();
  const email = String(user?.email || "").trim().toLowerCase();

  if (loading) {
    return <FullBleed><div style={{ color: T.textMuted, padding: 24 }}>Loading…</div></FullBleed>;
  }

  if (!ALLOWED.has(email)) {
    return <NotAuthorised />;
  }

  return <FoundersInner user={user} />;
}

// Full-bleed dark page wrapper (no chrome).
function FullBleed({ children }) {
  return (
    <div style={{
      backgroundColor: T.bg,
      color: T.textHi,
      minHeight: "100vh",
      width: "100%",
      }}>{children}</div>
  );
}

function NotAuthorised() {
  return (
    <FullBleed>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}>
        <div style={{
          backgroundColor: T.surface, borderRadius: 14,
          padding: "32px 24px", maxWidth: 360, width: "100%",
          border: `1px solid ${T.border}`, textAlign: "center",
        }}>
          <div style={{
            fontSize: 22, fontWeight: 600, color: T.gold, marginBottom: 10,
          }}>This page is private</div>
          <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
            Founders OS is only accessible to the FemWell founder. If you reached here by accident, head back to the rest of the app.
          </div>
          <a href="/Today" style={{
            display: "inline-block", padding: "10px 18px", borderRadius: 999,
            backgroundColor: T.gold, color: "#1C1410", textDecoration: "none",
            fontWeight: 600, fontSize: 13, letterSpacing: 0.3,
          }}>Back to Today</a>
        </div>
      </div>
    </FullBleed>
  );
}

// Carved crimson heart brand mark (§3) — single colour pop in the masthead.
function HeartMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path d="M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.5 4.8 5.1 7 4.8 8.7 6 12 9.2 15.3 6 17 4.8 19.2 5.1c3.2.4 4.2 3.9 2.8 6.7C19.5 16.4 12 21 12 21z" fill={T.crimson} />
    </svg>
  );
}

function StatusChip({ status }) {
  const s = STATUS_CHIP[status];
  if (!s) return null;
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
      color: s.fg, background: s.bg,
      border: s.border ? `1px solid ${s.border}` : "1px solid transparent",
      borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0,
    }}>{s.label}</span>
  );
}

const CLAMP2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const SERIF_STACK = '"Cormorant Garamond", Georgia, serif';

// One catalog row — a route (real <a>) or an in-page doc (button → setTab).
function EntryCard({ e, onOpen }) {
  const accent = accentColor(e.accent);
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.textHi, lineHeight: 1.25, fontFamily: SERIF_STACK }}>{e.title}</span>
        <StatusChip status={e.status} />
      </div>
      <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.5, ...CLAMP2 }}>{e.desc}</div>
      <div style={{ marginTop: 9, fontSize: 12.5, fontWeight: 700, color: accent }}>
        {e.kind === "route" ? "Open →" : "Read →"}
      </div>
    </>
  );
  const cardStyle = {
    display: "block", textAlign: "left", width: "100%", boxSizing: "border-box",
    background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${accent}`,
    borderRadius: 12, padding: "13px 15px", cursor: "pointer",
    textDecoration: "none", color: "inherit", font: "inherit", fontFamily: "inherit",
  };
  if (e.kind === "route") return <a href={e.href} style={cardStyle}>{inner}</a>;
  return <button type="button" onClick={() => onOpen(e)} style={cardStyle}>{inner}</button>;
}

const slugify = (s) => "grp-" + String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-");

function CardGrid({ items, onOpen }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: 10 }}>
      {items.map((e) => <EntryCard key={(e.href || e.key) + e.title} e={e} onOpen={onOpen} />)}
    </div>
  );
}

// Renders a full self-contained HTML brand doc (raw string) inside an auto-sized
// srcdoc iframe. srcdoc inherits the parent origin, so the doc's inline CSS, live
// flora SVGs and the omen <script> all run — styling + interactivity preserved.
// We grow the iframe to its content height (re-measuring on load, font-ready,
// taps and any body resize) so the doc flows as one page with no nested scroll.
function BrandDocFrame({ html, title }) {
  const ref = useRef(null);
  useEffect(() => {
    const f = ref.current;
    if (!f) return;
    let ro;
    const fit = () => {
      try {
        const d = f.contentDocument;
        if (!d) return;
        const h = Math.max(
          d.documentElement?.scrollHeight || 0,
          d.body?.scrollHeight || 0,
          d.body?.offsetHeight || 0,
        );
        if (h) f.style.height = h + "px";
      } catch { /* same-origin guard */ }
    };
    const onLoad = () => {
      fit();
      try {
        const d = f.contentDocument;
        if (d?.body && typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(fit);
          ro.observe(d.body);
        }
        d?.fonts?.ready?.then(fit).catch(() => {});
        d?.addEventListener?.("click", () => setTimeout(fit, 80));
      } catch { /* ignore */ }
      [150, 500, 1100, 2200].forEach((t) => setTimeout(fit, t));
    };
    f.addEventListener("load", onLoad);
    // If the iframe is already loaded by the time the effect runs.
    if (f.contentDocument?.readyState === "complete") onLoad();
    return () => { f.removeEventListener("load", onLoad); if (ro) ro.disconnect(); };
  }, [html]);
  return (
    <div style={{
      background: "#ECE7DA", borderRadius: 16, overflow: "hidden",
      border: `1px solid ${T.border}`, boxShadow: "0 2px 12px rgba(11,8,5,0.10)",
    }}>
      <iframe
        ref={ref}
        title={title}
        srcDoc={html}
        loading="eager"
        style={{ width: "100%", border: 0, display: "block", minHeight: 520, background: "#ECE7DA" }}
      />
    </div>
  );
}

function FoundersInner({ user }) {
  const [tab, setTab] = useState(HOME);
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set(COLLAPSED_BY_DEFAULT));
  const toggleGroup = useCallback((name) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }, []);

  const catalog = useMemo(() => [...CATALOG, ...demoCatalogEntries()], []);
  const query = lc(q).trim();
  const results = useMemo(() => catalog.filter((e) => matchesQuery(e, query)), [catalog, query]);

  const onOpen = useCallback((e) => { setTab(e.key); window.scrollTo?.(0, 0); }, []);
  const goHome = useCallback(() => { setTab(HOME); window.scrollTo?.(0, 0); }, []);
  const jumpTo = useCallback((name) => {
    setQ("");
    requestAnimationFrame(() => document.getElementById(slugify(name))?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const activeEntry = catalog.find((e) => e.kind === "doc" && e.key === tab);

  // Groups present (in fixed order), each with its matching entries.
  const groups = GROUP_ORDER
    .map((name) => ({ name, items: results.filter((e) => e.group === name) }))
    .filter((g) => g.items.length);

  // The in-page doc/tool render — kept verbatim from the prior shell, plus the
  // new Bottom-Nav Plan. `tab` keys match the catalog `key`s exactly.
  const detail = (
    <>
      {tab === "Lab"       && <LabTab />}
      {tab === "Pages"     && <PagesTab />}
      {tab === "Roadmap"   && <RoadmapTab />}
      {tab === "Health Audit" && <AppHealthAuditDoc />}
      {tab === "Nutrition Plan" && <NutritionPlanDoc />}
      {tab === "Community Plan" && <CommunityPlanDoc />}
      {tab === "Books & Book Clubs" && <BooksBookClubsDoc />}
      {tab === "Build Plan"     && <BuildPlanDoc />}
      {tab === "Journal Audit"  && <JournalAuditDoc />}
      {tab === "Expert Governance" && <ExpertGovernanceDoc />}
      {tab === "Library & Groups" && <GroupsLibraryGamesDoc />}
      {tab === "Integration Audit" && <IntegrationAuditDoc />}
      {tab === "Connectivity Map" && <ConnectivityMapDoc />}
      {tab === "Sharing" && <SharingProposalDoc />}
      {tab === "Home Redesign" && <HomeRedesignDoc />}
      {tab === "Whole-Life"     && <WholeLifeDoc />}
      {tab === "Audio"          && <AudioPlanDoc />}
      {tab === "Bottom-Nav Plan" && <DocSurface><BottomNavPlanDoc /></DocSurface>}
      {tab === "Brand Bible" && <BrandDocFrame html={brandBibleHtml} title="FemWell — Brand Bible" />}
      {tab === "Page Brand Audit" && <BrandDocFrame html={pageBrandAuditHtml} title="FemWell — Per-Page Brand Audit" />}
      {tab === "Intentions & Goals" && <BrandDocFrame html={intentionsGoalsHtml} title="FemWell — Intentions, Line of the Day & Goals" />}
      {tab === "Connect, Days & Missions" && <BrandDocFrame html={connectDaysMissionsHtml} title="FemWell — No Garden Grows Alone (Connection, Days Off & Tiny Missions)" />}
      {tab === "Ideas"     && <IdeasTab user={user} />}
      {tab === "Strategy"  && <StrategyTab />}
      {tab === "Legal"     && <LegalTab />}
      {tab === "Decisions" && <DecisionsTab />}
      {tab === "Journal"        && <JournalTab />}
      {tab === "Previews"       && <PreviewsTab />}
      {tab === "Nutrition Master Plan" && <NutritionMasterPlanDoc />}
      {/* Brand Identity + Flora & Meaning folded into the single Brand Bible */}
      {tab === "Feature Ideas" && <DocSurface><FeatureIdeasDoc /></DocSurface>}
      {tab === "Companion Vision" && <DocSurface><CompanionVisionDoc /></DocSurface>}
      {tab === "Companion Vision v2" && <DocSurface><CompanionVisionV2Doc /></DocSurface>}
      {tab === "Nurture Companion" && <NurtureCompanionDoc />}
      {tab === "Widget & PWA" && <NativeWidgetDoc />}
      {tab === "Architecture" && <ArchitectureDoc />}
      {tab === "Today Mega-Plan" && <TodayMegaPlanDoc />}
      {tab === "Journal Demos"  && <JournalDemosTab />}
      {tab === "Community Demos" && <CommunityDemosTab />}
      {tab === "Nutrition Demos" && <NutritionDemosTab />}
      {tab === "Another You"    && <AnotherYouTab />}
      {tab === "UX & Design" && <UxDesignTab />}
      {tab === "Wholeness"   && <WholenessTab />}
      {tab === "LGBTQ+"      && <LgbtqTab />}
      {tab === "Health Corner" && <HealthCornerRedirectCard />}
    </>
  );

  return (
    <FullBleed>
      {/* Masthead — brand cream, carved heart, search + Jump-to (the central switcher). */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        backgroundColor: T.bg,
        borderBottom: `1px solid ${T.border}`,
        padding: "16px 16px 12px",
        boxShadow: "0 2px 12px rgba(11,8,5,0.04)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HeartMark size={22} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF_STACK, fontSize: 23, fontWeight: 700, color: T.textHi, lineHeight: 1.05, letterSpacing: 0.2 }}>
                Founder OS
              </div>
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2, ...CLAMP2, WebkitLineClamp: 1 }}>
                Everything in one place — search or jump to a section
              </div>
            </div>
            {tab !== HOME && (
              <button type="button" onClick={goHome} style={{
                flexShrink: 0, background: T.surface, border: `1px solid ${T.border}`,
                color: T.textMid, borderRadius: 999, padding: "7px 13px",
                fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}>← All sections</button>
            )}
          </div>

          {tab === HOME && (
            <>
              {/* Search */}
              <div style={{ position: "relative", marginTop: 12 }}>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search previews, specs, demos, plans…"
                  aria-label="Search Founder OS"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "11px 38px 11px 14px",
                    background: T.surfaceHi, border: `1px solid ${T.border}`,
                    borderRadius: 12, color: T.textHi, fontSize: 15, outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                {q && (
                  <button type="button" onClick={() => setQ("")} aria-label="Clear search" style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    width: 24, height: 24, borderRadius: 999, border: "none",
                    background: T.border, color: T.textHi, cursor: "pointer",
                    fontSize: 14, lineHeight: 1, fontWeight: 700,
                  }}>×</button>
                )}
              </div>

              {/* Jump-to switcher (the multi-layer-page UX rule) */}
              {!query && (
                <div style={{ display: "flex", gap: 7, marginTop: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
                  {GROUP_ORDER.map((name) => (
                    <button key={name} type="button" onClick={() => jumpTo(name)} style={{
                      flexShrink: 0, padding: "6px 12px", borderRadius: 999,
                      background: "transparent", color: T.textMid,
                      border: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}>{name}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 96px" }}>
        {tab === HOME ? (
          <div>
            {query && (
              <div style={{ fontSize: 12.5, color: T.textMuted, margin: "2px 0 12px", letterSpacing: 0.3 }}>
                {results.length} {results.length === 1 ? "result" : "results"} for “{q.trim()}”
              </div>
            )}
            {groups.length === 0 && (
              <div style={{ padding: "32px 8px", textAlign: "center", color: T.textMuted, fontSize: 14 }}>
                Nothing matches “{q.trim()}”. Try a page name (Today, Journal, Nutrition…) or a kind (demo, plan, brand).
              </div>
            )}
            {groups.map((g) => {
              const collapsible = COLLAPSED_BY_DEFAULT.has(g.name) && !query;
              const isOpen = !collapsible || !collapsed.has(g.name);
              // Archive sub-groups by area (ordered), with a "More" bucket for
              // any entry without a listed sub so nothing is dropped.
              const subSections = (() => {
                if (g.name !== CAT.ARCHIVE) return null;
                const ordered = ARCHIVE_SUB_ORDER
                  .map((sub) => ({ sub, items: g.items.filter((e) => e.sub === sub) }))
                  .filter((s) => s.items.length);
                const placed = new Set(ordered.flatMap((s) => s.items));
                const rest = g.items.filter((e) => !placed.has(e));
                if (rest.length) ordered.push({ sub: "More", items: rest });
                return ordered;
              })();
              return (
                <section key={g.name} id={slugify(g.name)} style={{ marginBottom: 26, scrollMarginTop: 132 }}>
                  <button
                    type="button"
                    onClick={collapsible ? () => toggleGroup(g.name) : undefined}
                    aria-expanded={collapsible ? isOpen : undefined}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%",
                      background: "transparent", border: "none", padding: 0,
                      cursor: collapsible ? "pointer" : "default", textAlign: "left",
                    }}
                  >
                    {collapsible && (
                      <span aria-hidden="true" style={{ color: T.gold, fontSize: 12, fontWeight: 700, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}>▸</span>
                    )}
                    <SectionLabel>{g.name} · {g.items.length}{collapsible && !isOpen ? " · tap to show" : ""}</SectionLabel>
                  </button>
                  {!query && GROUP_BLURB[g.name] && (
                    <div style={{ fontSize: 12.5, color: T.textMuted, lineHeight: 1.5, margin: "-4px 0 12px" }}>{GROUP_BLURB[g.name]}</div>
                  )}
                  {isOpen && (
                    subSections ? (
                      subSections.map((s) => (
                        <div key={s.sub} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.gold, margin: "0 0 8px" }}>{s.sub}</div>
                          <CardGrid items={s.items} onOpen={onOpen} />
                        </div>
                      ))
                    ) : (
                      <CardGrid items={g.items} onOpen={onOpen} />
                    )
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div>
            {/* Detail back-bar / breadcrumb */}
            <button type="button" onClick={goHome} style={{
              display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14,
              background: "transparent", border: "none", color: T.gold,
              fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0,
            }}>
              ← {activeEntry ? `${activeEntry.group} · all sections` : "All sections"}
            </button>
            {detail}
          </div>
        )}
      </main>
    </FullBleed>
  );
}

// ─── Tab — Health Corner: now redirects to the real /Health page ─────
// The full health-letter experience lives at /Health. This tab just
// points users there so we don't ship two parallel UIs.
function HealthCornerRedirectCard() {
  return (
    <div style={{ padding: "40px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{
        maxWidth: 480,
        background: "#FEFAF2",
        border: "1px solid rgba(212,175,55,0.4)",
        borderRadius: 12,
        padding: "32px 28px",
        textAlign: "center",
        boxShadow: "0 10px 28px rgba(58,44,26,0.12)",
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 2, color: "#9B8B7A", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 8,
        }}>FemWell Health Letter</div>
        <div style={{
          fontSize: 22, fontWeight: 700, color: "#3A2C1A",
          marginBottom: 12, lineHeight: 1.3,
        }}>The Health hub now lives at its own page.</div>
        <p style={{
          fontSize: 15, lineHeight: 1.7, color: "#3A2C1A", marginBottom: 20,
        }}>
          The Letter-format Health page has replaced this preview, the old Skin &amp; Hair
          page, and Life Stage Care. It's a single hub with all eight tabs &mdash; Overview,
          Cycle, Life Stage, Skin &amp; Hair, Body, Mind, Nourishment, Care.
        </p>
        <a href="/Health" style={{
          display: "inline-block",
          padding: "10px 22px",
          background: "#3A2C1A",
          color: "#F4EDDB",
          textDecoration: "none",
          borderRadius: 999,
          fontSize: 13, fontWeight: 600, letterSpacing: 0.4,
        }}>Open Health &nbsp;&rarr;</a>
      </div>
    </div>
  );
}

// ─── Tab 1 — Lab (feature cards) ──────────────────────────────────────
function LabTab() {
  const shipped = LAB.filter((l) => l.status === "Shipped").length;
  return (
    <div>
      <SectionLabel>Lab · {LAB.length} features · {shipped} shipped</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
      }}>
        {LAB.map((card, i) => <LabCard key={i} card={card} />)}
      </div>
    </div>
  );
}

function LabCard({ card }) {
  const accent = labTone(card.tone);
  return (
    <article style={{
      backgroundColor: T.surface,
      borderRadius: 10,
      borderLeft: `3px solid ${accent}`,
      padding: "14px 16px 16px",
      border: `1px solid ${T.border}`,
      borderLeftWidth: 3,
      borderLeftColor: accent,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <StatusDot color={accent} />
        <span style={{
          fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase",
          color: accent, fontWeight: 600,
        }}>{card.status}</span>
      </div>
      <div style={{
        fontSize: 16, fontWeight: 600, color: T.textHi,
        marginBottom: 6, lineHeight: 1.3,
      }}>{card.name}</div>
      <div style={{ fontSize: 13.5, color: T.textMuted, lineHeight: 1.55, marginBottom: 10 }}>
        {card.desc}
      </div>
      <div style={{
        fontSize: 11, color: T.textMuted, letterSpacing: 0.3,
        fontFamily: '"SF Mono", "Roboto Mono", monospace',
      }}>
        {card.commits}
      </div>
    </article>
  );
}

// ─── Tab 2 — Pages (data flow map) ────────────────────────────────────
function PagesTab() {
  return (
    <div>
      <SectionLabel>Page Map · 15 surfaces</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        marginBottom: 28,
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse", minWidth: 720,
            fontSize: 13,
          }}>
            <thead>
              <tr style={{ backgroundColor: T.surfaceHi }}>
                <th style={thStyle}>Page</th>
                <th style={thStyle}>Reads from</th>
                <th style={thStyle}>Writes to</th>
              </tr>
            </thead>
            <tbody>
              {PAGE_MAP.map((row, i) => (
                <tr key={row.page} style={{
                  backgroundColor: i % 2 === 0 ? T.surface : T.bg,
                  borderTop: `1px solid ${T.border}`,
                }}>
                  <td style={pageNameCell}>
                    <div style={{ color: T.textHi, fontWeight: 600 }}>{row.page}</div>
                    <div style={{
                      color: T.textMuted, fontSize: 11, marginTop: 2,
                      fontFamily: '"SF Mono", "Roboto Mono", monospace',
                    }}>{row.url}</div>
                  </td>
                  <td style={pillCell}>
                    <Pills items={row.reads} tone="sage" />
                  </td>
                  <td style={pillCell}>
                    <Pills items={row.writes} tone="blush" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SectionLabel>Critical Data Rules · always respect these</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DATA_RULES.map((rule, i) => (
          <div key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "14px 16px",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <div style={{
              minWidth: 30, height: 30, borderRadius: 99,
              backgroundColor: T.goldSoft,
              color: T.gold,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13,
              flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.55 }}>{rule}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px 14px",
  textAlign: "left",
  color: T.gold,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};
const pageNameCell = {
  padding: "12px 14px",
  verticalAlign: "top",
  minWidth: 140,
};
const pillCell = {
  padding: "12px 14px",
  verticalAlign: "top",
};

function Pills({ items, tone }) {
  const list = String(items || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0 || list[0].startsWith("—") || list[0].toLowerCase().includes("not built")) {
    return <span style={{ color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>{items}</span>;
  }
  const bg = tone === "sage" ? T.sageSoft : T.blushSoft;
  const fg = tone === "sage" ? T.sage : T.blush;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {list.map((item, i) => (
        <span key={i} style={{
          backgroundColor: bg, color: fg,
          padding: "3px 8px", borderRadius: 4,
          fontSize: 11.5, fontWeight: 500,
          fontFamily: '"SF Mono", "Roboto Mono", monospace',
          letterSpacing: 0.1,
        }}>{item}</span>
      ))}
    </div>
  );
}

// ─── Tab 3 — Roadmap (vertical timeline) ──────────────────────────────
function RoadmapTab() {
  return (
    <div>
      <SectionLabel>Sprint Roadmap · {ROADMAP.length} milestones</SectionLabel>
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* vertical line */}
        <div style={{
          position: "absolute",
          left: 9, top: 6, bottom: 6,
          width: 2, backgroundColor: T.border,
        }} />
        {ROADMAP.map((s, i) => <RoadmapRow key={i} sprint={s} />)}
      </div>
    </div>
  );
}

function RoadmapRow({ sprint }) {
  const dot = roadmapDot(sprint.state);
  const isCurrent = sprint.state === "current";
  const isPlanned = sprint.state === "planned";
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <div style={{
        position: "absolute", left: -28, top: 14,
        width: 20, height: 20, borderRadius: 99,
        backgroundColor: dot.fill,
        boxShadow: `0 0 0 4px ${dot.ring}`,
        border: `2px solid ${T.bg}`,
      }} />
      <div style={{
        backgroundColor: isPlanned ? T.bg : T.surface,
        border: `1px solid ${isCurrent ? T.gold : T.border}`,
        borderRadius: 10,
        padding: "14px 16px 16px",
        opacity: isPlanned ? 0.78 : 1,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
          flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: 11, color: T.gold, letterSpacing: 0.5,
            textTransform: "uppercase", fontWeight: 700,
          }}>{sprint.sprint}</span>
          <span style={{
            backgroundColor: dot.ring, color: dot.fill,
            fontSize: 10.5, padding: "2px 8px", borderRadius: 99,
            fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase",
          }}>{dot.label}</span>
        </div>
        <div style={{
          fontSize: 15, fontWeight: 600, color: T.textHi,
          marginBottom: 4, lineHeight: 1.3,
        }}>{sprint.title}</div>
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>{sprint.note}</div>
      </div>
    </div>
  );
}

// ─── Tab 4 — Ideas backlog ────────────────────────────────────────────
function IdeasTab({ user }) {
  const [ideas, setIdeas] = useState(IDEAS_INITIAL);
  const [profileId, setProfileId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Hydrate from UserProfile → localStorage → defaults
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.entities?.UserProfile?.list?.();
        if (!cancelled && Array.isArray(list)) {
          const me = list.find((p) => p?.user_id === user?.id) || list[0];
          if (me?.id) setProfileId(me.id);
          if (Array.isArray(me?.founder_ideas) && me.founder_ideas.length > 0) {
            setIdeas(me.founder_ideas);
            saveIdeasToCache(me.founder_ideas);
            return;
          }
        }
      } catch { /* fall through */ }
      const cached = loadIdeasFromCache();
      if (!cancelled && Array.isArray(cached) && cached.length > 0) setIdeas(cached);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const persist = useCallback(async (nextArr) => {
    setIdeas(nextArr);
    saveIdeasToCache(nextArr);
    if (profileId) {
      try {
        await base44.entities?.UserProfile?.update?.(profileId, { founder_ideas: nextArr });
      } catch { /* swallow */ }
    }
  }, [profileId]);

  const onAdd = useCallback(async () => {
    const t = newTitle.trim();
    if (!t) return;
    setSaving(true);
    const idea = {
      id: Date.now(),
      title: t,
      description: newDesc.trim(),
      status: "planned",
      ts: Date.now(),
    };
    await persist([idea, ...ideas]);
    setNewTitle("");
    setNewDesc("");
    setSaving(false);
  }, [newTitle, newDesc, ideas, persist]);

  const counts = useMemo(() => ({
    high:    ideas.filter((i) => i.status === "high").length,
    planned: ideas.filter((i) => i.status === "planned").length,
    future:  ideas.filter((i) => i.status === "future").length,
  }), [ideas]);

  return (
    <div>
      <SectionLabel>
        Ideas backlog · {counts.high} high · {counts.planned} planned · {counts.future} future
      </SectionLabel>

      {/* Add Idea row */}
      <div style={{
        backgroundColor: T.surfaceHi,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 18,
      }}>
        <div style={{
          fontSize: 12, color: T.textMuted, marginBottom: 10,
          letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600,
        }}>Add a new idea</div>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title…"
          style={inputStyle}
        />
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="What is it? Why does it matter?"
          rows={2}
          style={{ ...inputStyle, marginTop: 8, resize: "vertical", fontFamily: "inherit" }}
        />
        <button
          onClick={onAdd}
          disabled={!newTitle.trim() || saving}
          style={{
            marginTop: 10,
            padding: "10px 18px",
            borderRadius: 999,
            backgroundColor: newTitle.trim() ? T.gold : T.surface,
            color: newTitle.trim() ? "#1C1410" : T.textMuted,
            border: "none",
            fontWeight: 600, fontSize: 13, letterSpacing: 0.3,
            cursor: newTitle.trim() ? "pointer" : "default",
          }}
        >{saving ? "Saving…" : "Add idea"}</button>
      </div>

      {/* Backlog */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: T.bg,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.textHi,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

function IdeaCard({ idea }) {
  const tone = statusTone(idea.status);
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderLeft: `4px solid ${tone.border}`,
      borderRadius: 10,
      padding: "14px 16px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 12, marginBottom: 6,
      }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: T.textHi, lineHeight: 1.3 }}>
          {idea.title}
        </div>
        <span style={{
          backgroundColor: tone.pill, color: tone.text,
          fontSize: 10.5, padding: "3px 9px", borderRadius: 99,
          fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>{tone.label}</span>
      </div>
      {idea.description ? (
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>
          {idea.description}
        </div>
      ) : null}
    </article>
  );
}

// ─── Tab 5 — Strategy ─────────────────────────────────────────────────
function StrategyTab() {
  return (
    <div>
      <SectionLabel>Market signals</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 10, marginBottom: 28,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "18px 16px 16px",
          }}>
            <div style={{
              fontSize: 30, fontWeight: 700, color: T.gold,
              lineHeight: 1.1, marginBottom: 8, letterSpacing: -0.5,
            }}>{s.number}</div>
            <div style={{
              fontSize: 13.5, color: T.textHi, fontWeight: 600,
              marginBottom: 4, lineHeight: 1.3,
            }}>{s.label}</div>
            <div style={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.4 }}>
              {s.source}
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Competitor strip · why FemWell wins each lane</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {COMPETITORS.map((c) => (
          <div key={c.name} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "14px 16px",
            display: "grid",
            gridTemplateColumns: "minmax(80px, 100px) 1fr 1fr",
            gap: 14, alignItems: "center",
          }}>
            <div style={{
              fontSize: 15, fontWeight: 600, color: T.gold, letterSpacing: 0.2,
            }}>{c.name}</div>
            <div>
              <div style={{
                fontSize: 10.5, color: T.textMuted, letterSpacing: 0.5,
                textTransform: "uppercase", fontWeight: 600, marginBottom: 4,
              }}>Their lane</div>
              <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.45 }}>{c.theirs}</div>
            </div>
            <div>
              <div style={{
                fontSize: 10.5, color: T.sage, letterSpacing: 0.5,
                textTransform: "uppercase", fontWeight: 600, marginBottom: 4,
              }}>FemWell wins because</div>
              <div style={{ fontSize: 13, color: T.textHi, lineHeight: 1.45 }}>{c.ours}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Narratives</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {NARRATIVES.map((n) => (
          <div key={n.title} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "14px 16px",
          }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: T.gold,
              marginBottom: 6, letterSpacing: 0.2,
            }}>{n.title}</div>
            <div style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.6 }}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 6 — Legal checklist ──────────────────────────────────────────
function LegalTab() {
  const [done, setDone] = useState(() => loadChecksFromCache());
  const toggle = useCallback((id) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveChecksToCache(next);
      return next;
    });
  }, []);
  const completed = LEGAL.filter((item) => done.includes(item.id)).length;
  const pct = Math.round((completed / LEGAL.length) * 100);

  return (
    <div>
      <SectionLabel>Pre-launch legal gates · {completed}/{LEGAL.length} complete</SectionLabel>

      {/* Progress bar */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 16, marginBottom: 18,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 13, color: T.textMuted }}>Progress to launch-ready</div>
          <div style={{ fontSize: 18, color: T.gold, fontWeight: 700 }}>{pct}%</div>
        </div>
        <div style={{
          width: "100%", height: 8, borderRadius: 99,
          backgroundColor: T.bg, overflow: "hidden",
        }}>
          <div style={{
            width: `${pct}%`, height: "100%",
            backgroundColor: T.gold,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LEGAL.map((item) => {
          const isDone = done.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", textAlign: "left",
                cursor: "pointer",
                color: T.textHi,
                fontFamily: "inherit",
              }}
            >
              {/* Custom checkbox */}
              <span style={{
                minWidth: 22, height: 22, borderRadius: 6,
                border: `1.5px solid ${isDone ? T.gold : T.border}`,
                backgroundColor: isDone ? T.gold : T.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}>
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L6 11L12 3" stroke="#1C1410" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
              <span style={{
                flex: 1, fontSize: 13.5, lineHeight: 1.45,
                color: isDone ? T.textMuted : T.textHi,
                textDecoration: isDone ? "line-through" : "none",
              }}>{item.text}</span>
              {item.founder ? (
                <span style={{
                  backgroundColor: T.blushSoft, color: T.blush,
                  fontSize: 10, padding: "3px 8px", borderRadius: 99,
                  fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>Your action</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 7 — Decisions ────────────────────────────────────────────────
function DecisionsTab() {
  return (
    <div>
      <SectionLabel>Architecture decisions · locked</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DECISIONS.map((d, i) => (
          <article key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.gold}`,
            borderRadius: 8,
            padding: "14px 16px",
          }}>
            <div style={{
              fontSize: 14.5, fontWeight: 600, color: T.textHi,
              marginBottom: 5, lineHeight: 1.35,
            }}>{d.title}</div>
            <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>{d.body}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — Journal · Master Plan
// ════════════════════════════════════════════════════════════════════════════
// Updated 2026-06-01. Phase 1 is in active build. Sections 2–10 collapsed
// by default; Section 1 (Vision) and Section 11 (Whole-App Vision Note) are
// always-open gold cards. Render via JournalTab().
const J_PHASE_PROMPTS = [
  { phase: "MENSTRUAL",     register: "inward · body-listening · rest-permission" },
  { phase: "FOLLICULAR",    register: "generative · expansive · curious" },
  { phase: "OVULATORY",     register: "relational · outward · celebratory" },
  { phase: "LUTEAL",        register: "editing · letting go · processing" },
];
const J_ENTRY_GROUPS = [
  {
    label: "CORE",
    items: [
      ["Free Write", "Open canvas, optional phase prompt, dismissible."],
      ["Gratitude", "4-field science-backed: what happened / why it matters / who contributed / how it changed you."],
      ["Reflection", "What went well / what you'd do differently / one thing to carry forward."],
      ["Mood Journal", "Mood context, what's driving it, what you need."],
      ["Voice Journal", "Speak it, Jess lightly reformats the transcription. User can revert to raw."],
      ["Dream Log", "Morning capture before it fades. Pregnancy variant for T1/T2 vivid dreams."],
    ],
  },
  {
    label: "ON THIS DAY",
    items: [["On This Day", "Auto-card from same cycle day last month. \"Reply to past self\" links a new entry. Dismissible."]],
  },
  {
    label: "LIFE DIMENSIONS · WHOLENESS",
    items: [
      ["Work & Career", "What's happening professionally, how does it feel."],
      ["Relationships", "People in life and how dynamics feel."],
      ["Money", "Financial state, anxiety, wins, decisions."],
      ["Creative", "What you're making, imagining, noticing."],
      ["Grief", "Dedicated container. No insights generated. No streak. Just holding."],
      ["Joy", "Mundane actual things. The coffee. The song. Not gratitude practice."],
      ["Identity", "Who you're becoming, what you're releasing."],
    ],
  },
  {
    label: "SHADOW · BURN",
    items: [
      ["Burn Mode", "User sets timer: 1hr / 24hr / specific date / tap to burn. Amber countdown. Fire animation on burn. Jess NEVER reads burn entries."],
      ["Night Self · 3AM Mode", "Auto-activates 11pm–4am. Full screen, one field, no prompts. Keep or Release."],
      ["Unsent Letter", "To someone you can't or won't send to. Cannot export. Cannot share."],
      ["Future Self Letter", "Sealed on write. Burns on chosen date or life stage transition. Arrival Ceremony on unlock."],
      ["Past Self Letter", "Write to yourself at a previous life stage. Self-compassion."],
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      ["Open Letter", "Published to Shared feed with your excerpt. 150-char replies only. Echo mechanic."],
      ["Writing Club", "5 women, same prompt, 48-hour window. No one sees each other's content. Jess synthesises themes only."],
    ],
  },
  {
    label: "GP",
    items: [["GP Note", "Natural-language symptom description → Jess reformats for clinical clarity → Doctor Export queue."]],
  },
];
const J_JESS_ROLES = [
  {
    label: "PROMPTER",
    body: "One phase-aware, life-stage-aware prompt on entry creation. Dismissible. 200 prompt variants (7 per phase × 4 phases × 7 entry types). Voice prompts when voice mode is active.",
  },
  {
    label: "WITNESS",
    body: "Weekly Still Point — one observation from the week's writing, never interpreted. \"You used the word 'invisible' four times this week.\" That's all. No recommendation.",
  },
  {
    label: "ANALYST",
    body: "Insights tab pattern detection, Monthly Cycle Letter, GP question surfacing. Always labelled as Jess's analysis. Always with \"not medical advice.\"",
  },
];
const J_JESS_NEVER = [
  "Repeats journal content back in chat unless asked.",
  "Says \"I noticed you wrote about X\" as an unprompted opener.",
  "Analyses Burn Mode, Night Self, or Grief entries.",
  "Shares journal themes with Doctor Export without explicit per-entry consent.",
  "Per-entry \"Not for Jess\" toggle excludes from all Jess context permanently.",
];
const J_TIERS = [
  {
    tier: "TIER 1 · from day 1",
    items: ["Writing rhythm calendar (7-day dots — never a zero counter; \"last wrote 3 days ago\" on break).", "Last entry mood tag.", "Phase write count."],
  },
  {
    tier: "TIER 2 · after 7 entries",
    items: ["Logged mood vs journal sentiment dual line chart, phase bands.", "Top themes this week (user can see and clear).", "Word count trend."],
  },
  {
    tier: "TIER 3 · after 1 complete cycle",
    items: ["Phase mood radar (6 axes: Body / Relationships / Work / Future / Rest / Emotions).", "Phase journalling frequency.", "Luteal theme extraction.", "Monthly Cycle Letter from Jess — warm narrative of the cycle that just passed."],
  },
  {
    tier: "TIER 4 · after 3 cycles",
    items: ["Cycle-over-cycle comparison.", "On This Day dual mode (calendar date + same cycle phase last cycle — FemWell-unique).", "Predictive prompts based on past patterns.", "Pattern insight card with \"Save for GP\" action."],
  },
];
const J_TIER_EXTRAS = [
  "Journal days vs non-journal days mood comparison.",
  "Skin/hair keyword detection → Skin & Hair page.",
  "Relationship map from Jess (names mentioned, available on request).",
];
const J_PHASE_ADAPTATION = [
  { phase: "MENSTRUAL",  body: "Quieter interface. Muted colours. Fewer prompts. Jess is gentle, slow. No streak pressure. Grace period — writing threshold drops, notifications pause." },
  { phase: "FOLLICULAR", body: "Warmer, crisper interface. Jess is curious and expansive. Prompts are generative. Community share nudge appears." },
  { phase: "OVULATORY",  body: "Most outward UI moment. Jess is warm and relational. Community share nudge strongest here. Prompts: connection, expression, celebration." },
  { phase: "LUTEAL",     body: "Editing energy. Jess is honest and grounding. IFS parts-work prompts appear. Prompts: letting go, completing, processing. Share nudge disappears." },
];
const J_CROSS_PAGE = [
  ["Journal ← Today",            "Opens with today's check-in pre-loaded as context card. \"You logged mood 2/5 today — write about it?\""],
  ["Journal → Planner",          "Overwhelm language → capacity softens. Packed planner → Jess prompt: \"How do you feel about today?\""],
  ["Journal → Pulse",            "Sentiment as second mood stream. Writing frequency as wellbeing signal."],
  ["Journal → Jess",             "Last 3–5 entries summarised in JessMemory. journal_recent_themes field."],
  ["Journal → Doctor Export",    "GP Note entries + pattern insights, with per-entry consent. \"Patient's own words\" section."],
  ["Journal → Health/Life Corner","Themes → content recommendations. Letters reference user's language."],
  ["Journal → Skin & Hair",      "Skin/hair keyword extraction surfaced in Skin & Hair page."],
  ["Journal → Partner Sync",     "Journal NEVER shared by default. Only Partner Note entry type can share."],
  ["Journal → Another You",      "Shadow Journal reads from JournalEntries. Burn Mode never read by anything."],
];
const J_UX_PATTERNS = [
  ["GOOGLE MAPS draggable card",     "Entry creation is a bottom sheet with 3 snap points: peek (type chips) → half (type + prompt + field) → full (composer)."],
  ["SNAPCHAT hold-to-record",        "Hold mic for voice journal. Release to finish. Jess lightly reformats."],
  ["APPLE NOTES text selection",     "Select text → contextual menu: \"Ask Jess about this\" / \"Save to GP notes\"."],
  ["INSTAGRAM stories tap-to-advance","On Insights tab, cards advance by tapping right edge."],
  ["SHOPIFY recovery",                "Streak break shows \"Last wrote 3 days ago — welcome back\" — not a zeroed counter."],
  ["SIGNAL disappearing",             "Burn Mode timer is a featured UI element (amber countdown dial), not a settings option."],
  ["TELEGRAM reactions",              "Swipe entry → quick emoji tag (heavy / good / confused / grateful)."],
];
const J_LGBTQ = [
  "Prompts use \"partner\" not \"him/her/boyfriend\".",
  "Cycle prompts use \"your cycle\" not \"your period\" where appropriate.",
  "Trans users on HRT get a separate prompt library using \"your HRT pattern\" as primary context.",
  "Partner Note entry type works for any relationship structure.",
];
const J_BUILD_PHASES = [
  {
    label: "PHASE 1 · NOW",
    status: "in build",
    items: [
      "Public/private tab architecture.",
      "Draggable bottom sheet composer.",
      "Phase-aware prompts (4 phases × 5 entry types).",
      "Burn Mode with user-set timer.",
      "On This Day (calendar mode).",
      "Writing rhythm dots (not counter).",
      "Life dimension entry types.",
      "Today context card cross-wired.",
      "Tier 1 + 2 insights.",
    ],
  },
  {
    label: "PHASE 2",
    status: "planned",
    items: [
      "Voice journalling.",
      "Tier 3 insights + Monthly Cycle Letter.",
      "Text selection actions (Ask Jess / GP).",
      "Night Self / 3AM Mode.",
      "Grief container.",
    ],
  },
  {
    label: "PHASE 3",
    status: "planned",
    items: [
      "Community features — Open Letters, Shared feed, Writing Club, Echo mechanic.",
      "Future Self Letters with Arrival Ceremony.",
      "Unsent Letters.",
    ],
  },
  {
    label: "PHASE 4",
    status: "planned",
    items: [
      "Tier 4 insights.",
      "Another You / Shadow Journal integration.",
      "Full phase UI adaptation.",
      "GP Note entry type.",
    ],
  },
];

function JournalAccordion({ id, title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id={`journal-${id}`}
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          color: T.textHi,
          font: '700 14.5px/1.3 "Fraunces", Georgia, serif',
          letterSpacing: 0.2,
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.5,
            background: T.goldSoft, padding: "3px 8px", borderRadius: 4,
          }}>{count}</span>
          <span>{title}</span>
        </span>
        <span style={{ color: T.gold, fontSize: 16, fontWeight: 700 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ paddingTop: 14 }}>{children}</div>
        </div>
      )}
    </section>
  );
}

function JournalTab() {
  return (
    <div>
      <PageHeader
        title="Journal — Master Plan"
        subtitle="Every feature researched, surfaced and structured. The most complete spec in the app."
        badge="PHASE 1 BUILD IN PROGRESS"
        badgeTone="gold"
      />

      {/* SECTION 1 — Vision (always open, gold) */}
      <SectionLabel>Section 1 · Vision</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 20,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          The Journal is the app's soul. Every other page in FemWell is data. The Journal is meaning — the texture
          of a woman's life across time. It holds what numbers can't. Done right, this is the feature no competitor
          can copy because it requires months of relationship, not months of data.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0 }}>
          <span style={{ color: T.gold, fontWeight: 700 }}>Three modes:</span>{" "}
          <span style={{ color: T.gold, fontWeight: 700 }}>PRIVATE</span> (default — the unsayable things, pure safety,
          never analysed without consent).{" "}
          <span style={{ color: T.gold, fontWeight: 700 }}>SHARED</span> (entries published to community with a
          user-chosen excerpt, 150-char reply cap, Echo not Likes).{" "}
          <span style={{ color: T.gold, fontWeight: 700 }}>SHADOW</span> (patterns Jess infers that the user hasn't
          articulated yet, in Another You).
        </p>
      </div>

      {/* SECTION 2 — Architecture */}
      <JournalAccordion id="arch" count="02" title="Architecture · Public vs Private">
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: "0 0 12px" }}>
          Two parallel journals via tab strip at top of page:
        </p>
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
          <li style={{ fontSize: 13, color: T.textHi, lineHeight: 1.6, marginBottom: 8 }}>
            <span style={{ color: T.gold, fontWeight: 700 }}>Private</span> (lock icon, default) — encrypted, never
            shown to anyone, full privacy guarantee.
          </li>
          <li style={{ fontSize: 13, color: T.textHi, lineHeight: 1.6 }}>
            <span style={{ color: T.gold, fontWeight: 700 }}>Shared</span> (community icon) — user chooses excerpt
            (max 200 words), rest stays private. Replies capped at 150 characters. Echo mechanic, not likes. Posts
            are pseudonymous (life stage visible if allowed, name never). Moderation: Jess passively flags crisis
            signals before publish.
          </li>
        </ul>
      </JournalAccordion>

      {/* SECTION 3 — Entry types */}
      <JournalAccordion id="entries" count="03" title="All Entry Types">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {J_ENTRY_GROUPS.map((g) => (
            <div key={g.label}>
              <div style={{
                fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.4,
                marginBottom: 8,
              }}>{g.label}</div>
              {g.items.map(([name, body]) => (
                <div key={name} style={{
                  borderLeft: `2px solid ${T.border}`,
                  paddingLeft: 12, marginBottom: 8,
                }}>
                  <div style={{ fontSize: 13, color: T.textHi, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 12.5, color: T.textMid, lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 4 — Jess's roles */}
      <JournalAccordion id="jess" count="04" title="Jess's Three Roles in Journal">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {J_JESS_ROLES.map((r) => (
            <div key={r.label} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
                {r.label}
              </div>
              <div style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65 }}>{r.body}</div>
            </div>
          ))}
        </div>
        <div style={{
          backgroundColor: T.surface,
          border: `1px dashed ${T.red}`,
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 10, color: T.red, fontWeight: 700, letterSpacing: 1.4, marginBottom: 8 }}>
            WHAT JESS NEVER DOES
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {J_JESS_NEVER.map((line) => (
              <li key={line} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 6,
              }}>
                <span aria-hidden="true" style={{ color: T.red, fontWeight: 700, flexShrink: 0 }}>✕</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </JournalAccordion>

      {/* SECTION 5 — Insights tiers */}
      <JournalAccordion id="insights" count="05" title="Insights · 4 Tiers">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {J_TIERS.map((t) => (
            <div key={t.tier} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.gold}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
                {t.tier}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {t.items.map((line) => (
                  <li key={line} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 4,
                  }}>
                    <span aria-hidden="true" style={{ color: T.gold, flexShrink: 0 }}>◆</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
          ADDITIONAL
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {J_TIER_EXTRAS.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 4,
            }}>
              <span aria-hidden="true" style={{ color: T.sage, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </JournalAccordion>

      {/* SECTION 6 — Phase adaptation */}
      <JournalAccordion id="phase" count="06" title="Phase Adaptation">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {J_PHASE_ADAPTATION.map((p) => (
            <div key={p.phase} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.blush, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
                {p.phase}
              </div>
              <div style={{ fontSize: 12.5, color: T.textHi, lineHeight: 1.6 }}>{p.body}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {J_PHASE_PROMPTS.map((p) => (
            <span key={p.phase} style={{
              fontSize: 10.5, color: T.textMid, background: T.surfaceHi,
              border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px",
            }}>{p.phase}: {p.register}</span>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 7 — Cross-page wiring */}
      <JournalAccordion id="wiring" count="07" title="Cross-Page Wiring">
        <div style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10, overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "minmax(170px, 220px) 1fr",
            background: T.surfaceHi, padding: "10px 14px",
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            textTransform: "uppercase", color: T.gold,
          }}>
            <div>Connection</div>
            <div>What flows</div>
          </div>
          {J_CROSS_PAGE.map(([key, body], i) => (
            <div key={key} style={{
              display: "grid", gridTemplateColumns: "minmax(170px, 220px) 1fr",
              gap: 14, padding: "10px 14px",
              borderTop: `1px solid ${T.border}`,
              background: i % 2 === 0 ? T.surface : T.surfaceHi,
            }}>
              <div style={{ fontSize: 12.5, color: T.gold, fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: 12.5, color: T.textHi, lineHeight: 1.55 }}>{body}</div>
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 8 — UX patterns */}
      <JournalAccordion id="ux" count="08" title="UX Patterns">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {J_UX_PATTERNS.map(([anchor, body]) => (
            <div key={anchor} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
                {anchor}
              </div>
              <div style={{ fontSize: 12.5, color: T.textHi, lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 9 — LGBTQ+ inclusion */}
      <JournalAccordion id="lgbtq" count="09" title="LGBTQ+ Inclusion">
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {J_LGBTQ.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              fontSize: 13, color: T.textHi, lineHeight: 1.65, marginBottom: 8,
            }}>
              <span aria-hidden="true" style={{ color: T.sage, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </JournalAccordion>

      {/* SECTION 10 — Build sequence */}
      <JournalAccordion id="seq" count="10" title="Build Sequence">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {J_BUILD_PHASES.map((p) => (
            <div key={p.label} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${p.status === "in build" ? T.gold : T.border}`,
              borderLeft: `3px solid ${p.status === "in build" ? T.gold : T.muted}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
              }}>
                <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 1.4 }}>
                  {p.label}
                </div>
                <span style={{
                  fontSize: 9.5, color: p.status === "in build" ? T.gold : T.textMid,
                  background: p.status === "in build" ? T.goldSoft : "transparent",
                  border: `1px solid ${p.status === "in build" ? T.gold : T.border}`,
                  borderRadius: 4, padding: "2px 6px",
                  textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700,
                }}>{p.status}</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {p.items.map((line) => (
                  <li key={line} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    fontSize: 12.5, color: T.textHi, lineHeight: 1.55, marginBottom: 4,
                  }}>
                    <span aria-hidden="true" style={{ color: T.gold, flexShrink: 0 }}>◆</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 11 — Whole-app vision note (always open, gold) */}
      <SectionLabel>Section 11 · Whole-App Vision Note</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 8,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          Halli confirmed <span style={{ color: T.gold, fontWeight: 700 }}>2026-06-01</span>: Wholeness applies to
          the whole app, not just one page. Health Corner renamed Life Corner. The app is becoming a life companion
          that understands health deeply — not a health app that occasionally touches on life.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          This philosophy reshapes:
        </p>
        <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none" }}>
          {[
            ["Today page", "life check-in, not just health"],
            ["Community", "life topics, not just cycle"],
            ["Explore", "career / creativity / relationship content at equal weight"],
            ["Planner", "life goals, not just health tasks"],
            ["Jess persona", "life companion, not health AI"],
            ["Navigation IA", "to be redesigned"],
          ].map(([k, v]) => (
            <li key={k} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              fontSize: 13, color: T.textHi, lineHeight: 1.6, marginBottom: 6,
            }}>
              <span aria-hidden="true" style={{ color: T.gold, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span><span style={{ color: T.gold, fontWeight: 700 }}>{k}</span> — {v}</span>
            </li>
          ))}
        </ul>
        <p style={{
          fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0,
          fontStyle: "italic",
        }}>
          Navigation restructure is an open question — awaiting founder direction.
        </p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// Tab — Previews (ONE place to reach every previewable route — no typing URLs)
// ════════════════════════════════════════════════════════════════════════════
// Single index of everything tap-through-able: the now-LIVE Nutrition Hub, the 5
// Nutrition UX demos, and the Journal + Community redesign previews. Each opens
// its real route. Keeps the per-area demo tabs too; this is the discoverable hub.
function PreviewLink({ slug, title, note, accent, live }) {
  return (
    <article style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderLeft: `4px solid ${accent}`, borderRadius: 12, padding: "13px 15px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.textHi }}>{title}</div>
        {live && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
            color: T.bg, background: T.sage, borderRadius: 9999, padding: "2px 7px",
          }}>Live</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.5, marginBottom: 10 }}>{note}</div>
      <a href={`/${slug}`} style={{
        display: "inline-block", background: accent, color: T.bg,
        borderRadius: 9999, padding: "7px 15px", fontSize: 12.5, fontWeight: 700, textDecoration: "none",
      }}>Open →</a>
    </article>
  );
}

function PreviewsTab() {
  return (
    <div>
      <PageHeader
        title="Previews — everything in one place"
        subtitle="Tap through to every previewable surface — no typing URLs. The chosen Nutrition direction is now the LIVE Nutrition page; the Journal and Community redesigns are previews awaiting your approval before they go live."
        badge="START HERE"
        badgeTone="gold"
      />

      <SectionLabel>Live now</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "8px 0 22px" }}>
        <PreviewLink live slug="Nutrition" accent={T.sage}
          title="Nutrition — the real page (Hub + Slider)"
          note="The chosen Demo 1 + 2 hybrid, now the live Nutrition page on real data: a calm Daily Hub, a Hero-Card-Slider spine, and every feature in bottom sheets. This is what's in the app's bottom nav." />
      </div>

      <SectionLabel>Brand identity — craft direction (Phase 1, approve before app-wide roll-out)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "8px 0 22px" }}>
        <PreviewLink slug="BrandCraftSample" accent={T.crimson} title="Brand Craft Sample ★ for approval" note="The canonical brand-system craft direction: current flat bloom vs upgraded realistic bloom (3-stop gradient, grounding shadow, breath/sway, reduced-motion-safe), a tasteful botanical line-motif, the carved heart mark in context, and a LIVE on-device perf measurement. Full spec: claude-state/BRAND_IDENTITY.md (mirrored in the Brand Identity tab)." />
      </div>

      <SectionLabel>Today (home) — redesign directions (the live /Today = Demo 6)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "8px 0 22px" }}>
        <PreviewLink slug="TodayOption2" accent={T.gold} title="Today — Option 2 (single smart slider) ★ NEW for comparison" note="One horizontal sliding row — the Journal slider's card size — with ONE card per app section (Lifestyle · Schedule · Nutrition · Community · Health · Journal · Programs · Pulse · Garden). Each card is a DAILY-CHANGING smart suggestion driven by real signals (cycle phase · new content · your schedule) with an INLINE action right on the card: play a podcast inline, quick-log water, check off the day's first thing, answer the room, leave a line, note a symptom, tend your companion. Link-outs are SPECIFIC deep-links (a book opens straight in the reader, full screen). 'Preview a different day' shows the rotation. Compare against the live /Today (Demo 6)." />
        <PreviewLink slug="TodayDemo6" accent="#8E6E8E" title="Today Demo 6 — Your day (SYNTHESISED) — LIVE /Today" note="The synthesis: companion bloom encircled by the cycle phase ring; Jess's day-paragraph (time-of-day aware); a gentle 'Your Day' checklist (in-app + out-app, ticks nourish the garden, add your own); per-area summary to action sliding pairs; smart cross-app suggestions. Calm by default. This is the current live Today." />
        <PreviewLink slug="TodayDemo1" accent={T.crimson} title="Today Demo 1 — Calm single-focus hub"  note="One main thing: greeting + phase line, a single focus card, garden footer, everything else behind a 'more' disclosure." />
        <PreviewLink slug="TodayDemo2" accent={T.gold}    title="Today Demo 2 — Cycle-led day"          note="A phase ring hero; focus chosen by phase; a switcher shows menopause/pregnancy reskinning the same spine." />
        <PreviewLink slug="TodayDemo3" accent={T.blush}   title="Today Demo 3 — Companion / garden-led"  note="Your garden greets you in her voice; the day's focus is gentle 'tending'; resting season celebrated (never dies)." />
        <PreviewLink slug="TodayDemo4" accent={T.sage}    title="Today Demo 4 — Card-slider / deck"      note="A short swipeable deck reusing the Hero-Card-Slider language; top card is the focus, next peeks." />
        <PreviewLink slug="TodayDemo5" accent={T.crimson} title="Today Demo 5 — Editorial 'your day'"    note="A dated dispatch in Jess's voice; greeting + phase + one suggestion woven into prose with inline doorways." />
      </div>

      <SectionLabel>Nutrition — 5 UX demo directions (mock data)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "8px 0 22px" }}>
        {NUTRITION_DEMOS.map((d) => (
          <PreviewLink key={d.slug} slug={d.slug} accent={d.accent}
            title={`Demo ${d.n} — ${d.title}`} note={d.subtitle} />
        ))}
      </div>

      <SectionLabel>Redesign previews — for your approval (live pages untouched)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        <PreviewLink slug="JournalRedesign1" accent={T.blush}
          title="Journal — redesign preview"
          note="The demos' richer component language (hero cards, sheets, calmer density) brought to Journal — carved masthead + identity preserved. Not yet live." />
        <PreviewLink slug="CommunityRedesign1" accent={T.gold}
          title="Community — redesign preview"
          note="Demo 6's rooms elevated with a calm hero, a peeking room slider, and bottom sheets — anonymity / 18+ / crisis routing / Jess preserved. Not yet live." />
      </div>

      <SectionLabel>Control-Center concept demos — pick-from (iOS Control Center, FemWell brand)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        <PreviewLink slug="NutritionControlDemo" accent={T.crimson}
          title="Nutrition — Control-Center concept"
          note="Daily-Hub header + a full-cover floating rounded card holding a 2-col peek grid (Log/Today/Plan/Recipes/Shop/Progress/Insights/For-your-stage) + a right jump rail. Cream/plum, not Apple glass." />
        <PreviewLink slug="JournalControlDemo" accent={T.blush}
          title="Journal — Control-Center concept"
          note="Reflection-state header + floating card: 2-col peek grid (Write/Echo/Witness/Twin/Insights/On-This-Day/Letters/Burn/Threads) + right jump rail." />
        <PreviewLink slug="CommunityControlDemo" accent={T.sage}
          title="Community — Control-Center concept"
          note="Circles/Jess welcome header + floating card: 2-col peek grid (Lounge/Echo/Lighter/Library/Circles/Love/Money/Style/Health/Talk) + right jump rail. Anonymous-first." />
      </div>

      <SectionLabel>Hub-style demos — rich header + big sliding cards (the live Nutrition direction, as one design system)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        <PreviewLink slug="JournalHubDemo" accent={T.blush}
          title="Journal — Hub style (rich header + ALL features)"
          note="RICH reflection header (phase · mood sparkline + how-the-week-felt · entries/last-entry/phase stats · Jess prompt card · On-This-Day peek) + big sliding cards for the FULL feature set: Write · Echo Wall · Witness · Phase Twin · Insights · On This Day · Sealed Letters · Threads · Cycle Mirror · Burn." />
        <PreviewLink slug="CommunityHubDemo" accent={T.sage}
          title="Community — Hub style (rich header + all rooms)"
          note="Rich Community header (season/circle · Jess welcome · Question of the Day · invite) + big sliding cards for every surface: QOTD · Lounge · Echo Wall · Lighter Side (games) · Library · Circles · Love · Money & Work · Style · Health Room · Talk It Out." />
        <PreviewLink slug="NutritionHubDemo" accent={T.gold}
          title="Nutrition — Hub style (reference; the live page already uses this)"
          note="Reference only — the live Nutrition page is already this style. Daily-Hub plate header + big sliding cards (Log/Today/Plan/Recipes/Shop/Progress/Insights)." />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — Journal Demos (4 fully interactive theme directions)
// ════════════════════════════════════════════════════════════════════════════
const JOURNAL_DEMOS = [
  {
    n: 1, slug: "JournalDemo1",
    title: "Editorial",
    subtitle: "Dramatic serif, layered colour stripes",
    accent: T.gold,
    body: "A literary magazine on warm paper. Cormorant dominant, large phase header, gold-underlined text CTAs, classic three-layer shadows, subtle alternating rotation. Now layered with per-type 4px coloured stripes (espresso · gold · blush · sage · teal · rose · bronze · amber · violet · bright-sage · muted) and a 4% tinted card body so each entry quietly carries its dimension.",
    tags: ["Cormorant dominant", "Per-type stripes + 4% tint", "Pull-quote On This Day", "Botanical dividers"],
  },
  {
    n: 2, slug: "JournalDemo2",
    title: "The Conversation",
    subtitle: "Chat-thread journal — you and yourself across time",
    accent: T.espresso,
    body: "Familiar UX (iMessage-style bubbles), completely new application. Right-aligned cream bubbles are you; left-aligned espresso bubbles are Jess, On This Day, and community signals. A fixed compose bar at the bottom replaces the blank page. Tap + to pick entry type + Burn. Jess prompt slides in above the compose bar like an iMessage app extension.",
    tags: ["Message bubbles", "Fixed compose bar", "Burn countdown bubble", "Inline Jess prompt banner"],
  },
  {
    n: 3, slug: "JournalDemo3",
    title: "The Canvas",
    subtitle: "Spatial constellation of your entries",
    accent: T.sage,
    body: "Entries are dots on a 2D map: X = time across the cycle, Y = mood. Dot size = word count, colour = entry type. Today pulses with a gold ring. Pan and zoom the canvas to see your emotional landscape. Phase bands wash the background. Tap any dot for the full entry. On This Day appears as a gold echo on the previous cycle's matching X position.",
    tags: ["Spatial X=time, Y=mood", "Pulsing today dot", "Pan + zoom", "Phase-band background"],
  },
  {
    n: 4, slug: "JournalDemo4",
    title: "The Wheel",
    subtitle: "Radial cycle interface — 28 segments",
    accent: T.blush,
    body: "Everything around the menstrual cycle as a wheel. 28 SVG segments coloured by phase (blush / sage / gold / muted). Entries fill their segment with the type colour. Today extends outward with a gold pulse ring. The centre holds Jess's insight. The wheel does a one-time settle animation on load. On This Day is a dashed gold ring on last cycle's segment. Only FemWell can do this.",
    tags: ["28-segment SVG", "Phase-coloured arcs", "Centre is insights", "On This Day echo ring"],
  },
];

function JournalDemosTab() {
  return (
    <div>
      <PageHeader
        title="Journal — 4 Theme Demos"
        subtitle="All features. Four completely different visual and UX directions. Pick one or combine."
        badge="INTERACTIVE"
        badgeTone="gold"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {JOURNAL_DEMOS.map((d) => (
          <article key={d.n} style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${d.accent}`,
            borderRadius: 14,
            padding: "18px 20px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: T.goldSoft, color: d.accent,
                border: `1px solid ${d.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 700, flexShrink: 0,
              }}>{d.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 19, fontWeight: 700, color: T.textHi,
                  letterSpacing: -0.1, lineHeight: 1.25,
                }}>
                  Demo {d.n} — {d.title}
                </div>
                <div style={{
                  fontStyle: "italic", fontSize: 13.5, color: d.accent,
                  marginTop: 2,
                }}>{d.subtitle}</div>
              </div>
            </div>
            <p style={{
              fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: "0 0 12px",
            }}>{d.body}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {d.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 10.5, color: T.textMid,
                  background: T.surfaceHi, border: `1px solid ${T.border}`,
                  borderRadius: 9999, padding: "3px 9px",
                  }}>{tag}</span>
              ))}
            </div>
            <a href={`/${d.slug}`} style={{
              display: "inline-block",
              background: d.accent, color: T.bg,
              border: "none", borderRadius: 9999,
              padding: "8px 16px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              textDecoration: "none",
            }}>Open demo →</a>
          </article>
        ))}
      </div>
      <div style={{
        background: T.surface, border: `1px dashed ${T.border}`,
        borderRadius: 12, padding: "12px 16px",
        fontSize: 12, color: T.textMid, lineHeight: 1.6,
      }}>
        All 4 demos share the same 9 features: compact insights card (tap to expand) ·
        Jess phase prompt · entry type chooser · entry list · Burn Mode indicator ·
        On This Day · community signal · full composer · writing rhythm dots.
        Every interaction is wired with useState; no real entities are queried.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — Nutrition Demos (5 decision-fatigue UX directions)
// ════════════════════════════════════════════════════════════════════════════
// Each demo is the SAME complete nutrition feature set (Today, Log w/ recents+
// favourites+photo+voice, My Plan, Recipes incl. AI, AI Meal Plan, Shop, Progress,
// Insights w/ women's stage micros) laid out under a DIFFERENT organising metaphor
// to kill decision fatigue. Mock data only (./nutritionDemoShared), no entities.
const NUTRITION_DEMOS = [
  { n: 1, slug: "NutritionDemo1", title: "Hero Card Slider", accent: T.gold,
    subtitle: "A big swipeable card slider is the spine",
    body: "The 7-tab bar is gone — a horizontal scroll-snap slider sits in the middle, each surface a tall rich card with the next peeking at the edge. One card, one obvious action, swipe for more. (Halli's “a lot on one line” idea.)",
    tags: ["card slider", "scroll-snap + peek", "one action per card"] },
  { n: 2, slug: "NutritionDemo2", title: "Daily Hub", accent: T.sage,
    subtitle: "One calm screen + bottom-sheet spokes",
    body: "Home shows a today's-plate ring, Jess's one line, a single “Log a meal” button and ONE suggested next action. The other surfaces are calm tiles that open as bottom sheets — never a wall of choices.",
    tags: ["hub-and-spoke", "one primary action", "bottom sheets"] },
  { n: 3, slug: "NutritionDemo3", title: "Log-First", accent: T.blush,
    subtitle: "A persistent + Log button + rich sheet",
    body: "Built around the one frequent job: logging in seconds. A pinned “+ Log” opens a segmented sheet (Search / Recents / Favourites / Photo / Voice / Barcode). Everything else lives behind one quiet “Everything else” menu.",
    tags: ["log-first", "FAB", "segmented quick-add"] },
  { n: 4, slug: "NutritionDemo4", title: "Day-as-a-Story Timeline", accent: T.gold,
    subtitle: "One vertical scroll — no tabs at all",
    body: "Your day told top-to-bottom on a timeline spine: meals as time-stamped entries, with Jess weaving hydration, an afternoon-dip note, an iron nudge and an evening recipe between them. Plan/Week/Insights unfold as section-breaks. You don't navigate — you scroll your day.",
    tags: ["single feed", "narrative order", "zero navigation"] },
  { n: 5, slug: "NutritionDemo5", title: "Editorial Magazine", accent: T.blush,
    subtitle: "Swipeable full-bleed magazine spreads",
    body: "Five immersive one-per-screen spreads — The Plate, The Kitchen, The Pantry, The Body, The Week — each a finished magazine page with a cover block, a big script title and one CTA. You read a spread, not a grid.",
    tags: ["magazine spreads", "segmented control", "immersive"] },
];

function NutritionDemosTab() {
  return (
    <div>
      <PageHeader
        title="Nutrition — 5 UX Demos"
        subtitle="Same full nutrition feature set, five genuinely different layouts — each designed to kill decision fatigue and use richer UI (sliders, sheets, timelines, spreads) instead of a 7-tab wall. Open each on your phone. Mock data, no entities queried."
        badge="INTERACTIVE"
        badgeTone="gold"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {NUTRITION_DEMOS.map((d) => (
          <article key={d.n} style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${d.accent}`,
            borderRadius: 14,
            padding: "18px 20px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: T.goldSoft, color: d.accent,
                border: `1px solid ${d.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 700, flexShrink: 0,
              }}>{d.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 19, fontWeight: 700, color: T.textHi,
                  letterSpacing: -0.1, lineHeight: 1.25,
                }}>
                  Demo {d.n} — {d.title}
                </div>
                <div style={{
                  fontStyle: "italic", fontSize: 13.5, color: d.accent,
                  marginTop: 2,
                }}>{d.subtitle}</div>
              </div>
            </div>
            <p style={{
              fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: "0 0 12px",
            }}>{d.body}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {d.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 10.5, color: T.textMid,
                  background: T.surfaceHi, border: `1px solid ${T.border}`,
                  borderRadius: 9999, padding: "3px 9px",
                  }}>{tag}</span>
              ))}
            </div>
            <a href={`/${d.slug}`} style={{
              display: "inline-block",
              background: d.accent, color: T.bg,
              border: "none", borderRadius: 9999,
              padding: "8px 16px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              textDecoration: "none",
            }}>Open demo →</a>
          </article>
        ))}
      </div>
      <div style={{
        background: T.surface, border: `1px dashed ${T.border}`,
        borderRadius: 12, padding: "12px 16px",
        fontSize: 12, color: T.textMid, lineHeight: 1.6,
      }}>
        All 5 demos share the SAME complete feature set: today's plate · frictionless
        logging (recents, favourites, photo, voice, barcode) · My Plan targets ·
        Recipes incl. an AI generator · AI meal plan · shopping list by aisle ·
        gentle progress (no streaks, no scores) · women's stage-aware micronutrient
        insights with Jess. Every interaction is wired with useState; no real entities
        are queried. Locked constraints held: cream/ink palette, Ephesis + Cormorant,
        Lucide/SVG only, no emoji, whole-life not clinical.
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionLabel>The chosen direction is now live</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <article style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${T.sage}`, borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: T.textHi }}>Nutrition — Demo 1 + 2 hybrid (Hub + Slider)</div>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.bg, background: T.sage, borderRadius: 9999, padding: "2px 7px" }}>Live</span>
            </div>
            <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.5, marginBottom: 9 }}>
              Halli chose the Daily-Hub + Hero-Card-Slider hybrid — it&apos;s now the real, live Nutrition page (in the app bottom nav), wired to real data with the full feature set. The 5 demos above were the mock-data explorations it came from.
            </div>
            <a href="/Nutrition" style={{
              display: "inline-block", background: T.sage, color: T.bg,
              borderRadius: 9999, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, textDecoration: "none",
            }}>Open live Nutrition →</a>
          </article>
          <div style={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.5 }}>
            Journal &amp; Community redesign previews live in the <b>Previews</b> tab (top of the rail) — awaiting your approval before they go live.
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — Community Demos (5 peer-shape design concepts)
// ════════════════════════════════════════════════════════════════════════════
// Each demo is the SAME complete whole-life Community (every feature) — they
// differ ONLY in UX/UI. Same palette, background and fonts throughout. Halli
// picks the UI direction. Shared content: src/pages/communityShared.js.
const COMMUNITY_DEMOS = [
  {
    n: 6, slug: "CommunityDemo6",
    title: "★ PRODUCTION CANDIDATE — Rooms + Tabs hybrid (with open comments, backend moderation, Jess host+support)",
    subtitle: "Halli's chosen direction — open this one",
    accent: T.crimson,
    body: "The chosen production direction: a ~65/35 HYBRID of Rooms-as-doors (Demo 2) + Tabbed (Demo 3). Home = a grid of doors (the jump-in); inside a room a sticky tab bar flicks between rooms (Lounge · Echo · Lighter · Share · Talk), a Doors pill returns home. COMMENTS are OPEN by default — anyone can write a comment — with the poster keeping the option to switch a post to reaction-only. BACKEND AUTO-MODERATION screens every comment and removes anything harmful or out of place (shown here as a gentle 'Removed by Jess' tombstone; real = OpenAI Moderation API + crisis check via a Base44 serverless fn — needs the OpenAI key). JESS is an ACTIVE participant, not just a gatekeeper — she chips in with warm support inline in threads, and hosts a gentle timed games-master round (simultaneous reveal, 'most of you said…', no winner). Flat, lurkable, no counts; crisis routes to UK support, never posts. Same palette / paper / Ephesis+Cormorant as the others.",
    tags: ["Rooms-as-doors + tabs-inside", "OPEN comments (poster can switch off)", "Backend auto-moderation (auto-removes)", "Jess: host + inline support", "Crisis-safe · no counts"],
  },
  {
    n: 1, slug: "CommunityDemo1",
    title: "UX 1 — Calm long-scroll editorial",
    subtitle: "The whole Community as a quiet magazine read",
    accent: T.sage,
    body: "The complete whole-life Community as one unbroken vertical read — sections stacked like a magazine, big carved Script headers, hairline rules, airy understated cards, no tabs or nav. Everything is visible by scrolling. Contains every feature (see below); this demo's only difference from the others is the long-scroll layout.",
    tags: ["Long-scroll / magazine", "No nav — scroll only", "Airy editorial cards"],
  },
  {
    n: 2, slug: "CommunityDemo2",
    title: "UX 2 — Rooms as doors (spatial)",
    subtitle: "The whole Community as doors you enter & leave",
    accent: T.blush,
    body: "The complete Community as a spatial grid of \"doors\" on the home; tapping a door opens it full-screen (with a Leave threshold bar) into that feature, then you step back out. Navigation = entering and leaving rooms. Same features as the others, arranged as a hallway of doors.",
    tags: ["Doors grid", "Enter / leave rooms", "Full-screen room views"],
  },
  {
    n: 3, slug: "CommunityDemo3",
    title: "UX 3 — Tabbed / segmented",
    subtitle: "The whole Community with a sticky pill-tab subnav",
    accent: T.gold,
    body: "The complete Community with a sticky segmented control pinned at the top (Home · Lounge · Rooms · Play · Share · Talk) for fast, app-like section switching. Compact and quick. Same features as the others, organised under sticky tabs.",
    tags: ["Sticky pill tabs", "Fast section switching", "App-like / compact"],
  },
  {
    n: 4, slug: "CommunityDemo4",
    title: "UX 4 — Jess-guided conversation",
    subtitle: "The whole Community walked through as a chat",
    accent: T.blush,
    body: "The complete Community revealed as a guided conversation — Jess (the warm host, scripted) walks you in, asks the Question of the Day, offers the Lounge, shows the rooms, the games, the four-lives choice, Witness and Talk-It-Out, each surfacing as an inline interactive card in the chat. Your taps appear as reply chips; a single \"show me more\" advances. Same features as the others, chat-led.",
    tags: ["Chat-led flow", "Jess bubbles + inline cards", "Progressive reveal"],
  },
  {
    n: 5, slug: "CommunityDemo5",
    title: "UX 5 — Bento dashboard",
    subtitle: "The whole Community as expandable tiles at a glance",
    accent: T.sage,
    body: "The complete Community as a bento grid — varied-size tiles, everything at a glance; tapping a tile expands it (a bottom-sheet overlay) into the full interactive feature, then collapses. Dashboard density, tap-to-expand. Same features as the others, tiled.",
    tags: ["Bento grid", "Tap-to-expand tiles", "At-a-glance dashboard"],
  },
];
// Every demo above contains ALL of: home masthead + ambient presence · Question
// of the Day · the whole-life rooms (Lounge, Circles, Love & Relationships, Money
// & Work, Style, The Lighter Side, Health) · Echo Wall · the non-clinical games
// (This-or-That, kind hot-takes, one-line story, role-play) · the "one entry,
// four lives" chooser · Witness · Audio "Talk It Out". Identical palette / paper
// background / Ephesis+Cormorant fonts. Only the UX/UI differs.

function CommunityDemosTab() {
  return (
    <div>
      <PageHeader
        title="Community — ★ Production Candidate (Demo 6) + earlier explorations"
        subtitle="THE CHOSEN DIRECTION is Demo 6 — the Rooms + Tabs hybrid, with OPEN comments, backend auto-moderation, and Jess as host + active support — pinned at the top (Open demo → /CommunityDemo6). The five UX directions below were the explorations Halli chose from (each the same complete whole-life Community in a different layout). Anonymous-first, 18+, no scoreboards. Mock data, no entities queried."
        badge="INTERACTIVE"
        badgeTone="gold"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {COMMUNITY_DEMOS.map((d) => (
          <article key={d.n} style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${d.accent}`,
            borderRadius: 14,
            padding: "18px 20px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: T.goldSoft, color: d.accent,
                border: `1px solid ${d.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 700, flexShrink: 0,
              }}>{d.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 19, fontWeight: 700, color: T.textHi,
                  letterSpacing: -0.1, lineHeight: 1.25,
                }}>
                  Demo {d.n} — {d.title}
                </div>
                <div style={{
                  fontStyle: "italic", fontSize: 13.5, color: d.accent,
                  marginTop: 2,
                }}>{d.subtitle}</div>
              </div>
            </div>
            <p style={{
              fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: "0 0 12px",
            }}>{d.body}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {d.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 10.5, color: T.textMid,
                  background: T.surfaceHi, border: `1px solid ${T.border}`,
                  borderRadius: 9999, padding: "3px 9px",
                  }}>{tag}</span>
              ))}
            </div>
            <a href={`/${d.slug}`} style={{
              display: "inline-block",
              background: d.accent, color: T.bg,
              border: "none", borderRadius: 9999,
              padding: "8px 16px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              textDecoration: "none",
            }}>Open demo →</a>
          </article>
        ))}
      </div>
      <div style={{
        background: T.surface, border: `1px dashed ${T.border}`,
        borderRadius: 12, padding: "12px 16px",
        fontSize: 12, color: T.textMid, lineHeight: 1.6,
      }}>
        All 5 demos reuse the shared Editorial kit (src/components/journal/Editorial.jsx) —
        Ephesis script · Cormorant serif (incl. italic voice) · Inter chrome, the frozen carved-ink
        treatment, no emoji. Every interaction is wired with useState; no real entities are
        queried and no new entities are created. Drawn from claude-state/COMMUNITY_BUILD_SPEC.md.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — Another You (Shadow / Mirror / Oracle page concept)
// ════════════════════════════════════════════════════════════════════════════
const ANOTHER_YOU_PAGE_TABS = [
  { name: "Mirror",    desc: "Archetype mapping, shadow cycle map, data reflection" },
  { name: "Shadow",    desc: "Shadow Letter, Burn Mode, Night Self / 3AM mode" },
  { name: "Oracle",    desc: "Data-wired horoscope, Human Design crosscheck, lunar sync" },
  { name: "Dark Moon", desc: "Collective Shadow, personalised ritual design" },
];

const ANOTHER_YOU_FEATURES = [
  { n: 1, tier: "core", name: "THE SHADOW LETTER", tagline: "Once per cycle, Jess writes as you — not to you.",
    body: "Analyses mood variance, journal tone gaps, habit abandonment, and symptom patterns to write a letter in first-person as the suppressed version of you. Types itself character-by-character. After reveal: \"Is this her?\" — saves or prompts reflection. Hard-private: never in Doctor Export, never in Partner Sync." },
  { n: 2, tier: "core", name: "SHADOW ACROSS THE CYCLE", tagline: "A map of when your shadow shows up.",
    body: "Algorithm computes per-day divergence between stated mood/energy and behavioural/linguistic signals (journal sentiment, habit compliance). Renders as a circular 28-day map — colour saturation deepens in high-divergence windows. After 3 cycles the pattern stabilises. Jess writes 2 sentences per peak window: \"Days 22-25: Your logs say 'fine.' Your patterns say otherwise.\"" },
  { n: 3, tier: "core", name: "THE DATA CONFESSION", tagline: "Monthly. One thing your data reveals that you haven't admitted.",
    body: "Jess finds the most significant behavioural pattern — systematic gaps, stated intentions that data contradicts, Monday crashes, things mentioned to Jess but never logged. One confession per month. Below it: \"What do you know about this that I don't?\" User responds or dismisses. Dismissed confessions never repeat." },
  { n: 4, tier: "core", name: "HOROSCOPE WIRED TO YOUR ACTUAL DATA", tagline: "Co-Star uses your birth chart. We use your last 7 days.",
    body: "Astra generates your horoscope using star sign PLUS current cycle phase, mood trend, most logged symptoms, energy trajectory, journal themes, shadow window position. Instead of \"Sagittarians may feel conflicted\" → \"Your data says your energy has been climbing since Tuesday. Your chart says this is your season for initiation. Something is trying to begin.\" Data and chart agreements/divergences both surfaced. Moves from Lifestyle to Another You as primary home." },
  { n: 5, tier: "core", name: "MOON × CYCLE × MOOD CORRELATION", tagline: "Your personal lunar sync. Not a theory — your data.",
    body: "Tracks moon phase as background variable (calculated from date, no API). After 3 cycles: \"Your period starts within 2 days of the new moon in 3 out of 4 cycles.\" Visual: two overlapping circles — lunar cycle and menstrual cycle — gold glow where they align. 24% of women under 35 show sync. FemWell finds out if you're one of them." },
  { n: 6, tier: "core", name: "THE NIGHT SELF / 3AM MODE", tagline: "Between 11pm and 4am, everything else disappears.",
    body: "Full-screen dark interface, single text field, immediate keyboard. One label: \"3am self. No analysis. No judgment. Write.\" Save (kept private, never analysed) or Release (instant burn). Monthly: if 3+ night entries, Jess writes one observation: \"I notice you're visiting them.\" Ends at 4am automatically." },
  { n: 7, tier: "core", name: "THE COLLECTIVE SHADOW", tagline: "Every week, thousands move through the same patterns. You won't know their names. You'll feel less alone.",
    body: "Anonymised aggregate of emotional themes across all Another You users — rendered as a written piece, not a data report. \"This week, thousands of you were in your shadow window. Tuesday felt heavier than you said it was.\" A word cloud of one-word responses from the collective. K-anonymity protected. Opt-in to contribute." },
  { n: 8, tier: "core", name: "ARCHETYPE MAPPING ACROSS YOUR CYCLE", tagline: "Not what the archetypes mean. What YOUR archetype is, based on your data.",
    body: "Eight archetypes: Menstrual (The Sage / The Hermit), Follicular (The Maiden / The Dreamer), Ovulatory (The Mother / The Performer), Luteal (The Crone / The Critic). Assigned from behavioural data — not self-report. The Dreamer if follicular shows aspiration language but low task completion. The Critic if luteal journal uses negative self-referential language. Shareable archetype wheel (image export, no health data visible)." },
  { n: 9, tier: "core", name: "RITUAL DESIGN PERSONALISED TO YOUR DATA", tagline: "Not a generic full-moon ritual. One designed for this window in your specific body.",
    body: "Jess pulls: current phase, moon phase, shadow window position, HD authority type, Data Confession pattern. Generates a 3–5 element ritual with reasons. Each element links to Explore content where possible. \"Save to Planner\" creates PlannerItems for the next 3 days." },
  { n: 10, tier: "addon", name: "HUMAN DESIGN CROSSCHECK", tagline: "50M HD charts globally. None of them checked against behavioural data.",
    body: "User enters birth date/time/place. FemWell calculates HD type, profile, authority. Jess cross-references against actual behavioural data: \"Your Projector design suggests working in bursts. Your habit data shows completions peak before 11am and almost never after 5pm. That's your design, not a character flaw.\"" },
  { n: 11, tier: "addon", name: "BURN MODE (user-set timer)", tagline: "Write knowing it will be gone. Burn in 1 hour / 24 hours / on a specific date / when you tap the flame.",
    body: "Entry lives with an amber countdown. On burn date: fire animation consuming the entry, \"Released.\" Only metadata kept (date created, date burned). Jess never reads Burn entries — explicit UI guarantee." },
  { n: 12, tier: "addon", name: "GUT FEELING TRACKER", tagline: "Log an intuition. Set a test date. Find out if you were right.",
    body: "Builds an evidence base for her specific intuition accuracy per category: body / relationships / health / situations. After 10 resolved predictions: \"Your body gut feelings are right 78% of the time. Your relationship gut feelings are right 41% — that might be fear, not intuition.\" Correlation with cycle phase after 3 months." },
];

const ANOTHER_YOU_COMPLIANCE = [
  "Birth data for Human Design requires explicit consent + GDPR Article 6(1)(a)",
  "Burn Mode: irretrievability must be disclosed before first use",
  "Crisis monitoring active in all entry modes",
  "Collective Shadow: k-anonymity, minimum group size 50 before aggregate shown",
  "Age gate recommendation: 18+ for Another You (the psychological depth)",
  '"Not medical advice" on all Jess-generated content',
];

function AnotherYouTab() {
  return (
    <div>
      <PageHeader
        title="Another You — /AnotherYou Page Concept"
        subtitle="The most ambitious page in the app. No competitor can build this — they don't have our data."
        badge="Research complete · awaiting build approval"
        badgeTone="red"
      />

      <SectionLabel>Strategic case</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.7, margin: 0 }}>
          FemWell has months of behavioural data. Co-Star uses birth chart data for 45M users and still writes generic copy.
          FemWell is the first app with both a behavioural data layer AND a spiritual/astrology persona (Astra). The Shadow page is where data becomes something uncanny.
        </p>
      </div>

      <SectionLabel>Page name</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginRight: 8 }}>Recommended</span>
          <span style={{ fontSize: 18, color: T.textHi, fontStyle: "italic" }}>"Another You"</span>
          <span style={{ color: T.textMuted, marginLeft: 8 }}>at /AnotherYou</span>
        </div>
        <p style={{
          fontSize: 15, fontStyle: "italic", color: T.blush,
          margin: "0 0 12px", lineHeight: 1.5,
        }}>"The version of you that your data has been quietly describing."</p>
        <p style={{ fontSize: 12.5, color: T.textMid, lineHeight: 1.6, margin: 0 }}>
          Design: deep indigo-black background (#0D0B14), smoke-like card surfaces, violet/silver/amber accents. Cormorant Garamond italic headers.
          Cards drift in (no bounce, no spring). Shadow Letter types itself 12 ms/character.
        </p>
      </div>

      <SectionLabel>4-tab structure (within the page)</SectionLabel>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 10, marginBottom: 22,
      }}>
        {ANOTHER_YOU_PAGE_TABS.map((t) => (
          <div key={t.name} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "14px 14px",
          }}>
            <div style={{
              fontSize: 18, color: T.gold, fontWeight: 600, marginBottom: 6,
              letterSpacing: -0.1,
            }}>[ {t.name} ]</div>
            <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.55 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <SectionLabel>The 12 top features</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
        {ANOTHER_YOU_FEATURES.map((f) => (
          <FeatureCard key={f.n} {...f} />
        ))}
      </div>

      <SectionLabel>Opt-out design</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0 }}>
          First visit: single card —{" "}
          <em style={{ color: T.blush }}>"Your data has been watching you. Not the version you show the world — the other one."</em>
          {" "}Button: <strong style={{ color: T.textHi }}>"Meet her"</strong> / <strong style={{ color: T.textHi }}>"Not now"</strong>.
          Hard disable in Settings removes the page from nav. Full data delete on disable.
        </p>
      </div>

      <SectionLabel>Compliance notes</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.blush}`,
        borderRadius: 12, padding: "16px 18px",
      }}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {ANOTHER_YOU_COMPLIANCE.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              fontSize: 12.5, color: T.textMid, lineHeight: 1.6, marginBottom: 8,
            }}>
              <span aria-hidden="true" style={{ color: T.blush, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — UX & Design (cross-category patterns)
// ════════════════════════════════════════════════════════════════════════════
const UX_ANCHORS = [
  {
    n: 1,
    title: "Oura Readiness → FemWell Vitality Score",
    what: "What Oura does: one number (0–100) synthesising sleep, HRV, recovery. Their entire premium hardware business sits on this single daily number.",
    translation: "A daily Vitality Score synthesising mood, energy, sleep, symptom load, cycle phase, and habit completion. \"Your Vitality today: 72 — you're in a high-output window.\" Shown in the Planner hero. Shareable. Makes the whole app's data into something a user can say out loud.",
    why: "Right now FemWell has 10 separate data streams with no synthesis. The Vitality Score is the marketing hook, the retention mechanism, and the \"one thing\" that makes the complexity legible.",
  },
  {
    n: 2,
    title: "Spotify Mini Player → Persistent Jess Bar",
    what: "The Now Playing mini-player persists across all navigation. Something important is always accessible without interrupting what you're doing.",
    translation: "A 44px Jess bar sitting above the tab bar on every page. Shows her current one-line observation. Tap to expand into full chat. Jess becomes the interface, not a feature buried in a menu.",
    why: "Currently Jess is a destination. Making her persistent makes her a companion. This is the single change that most clearly separates FemWell from every other cycle app.",
  },
  {
    n: 3,
    title: "Notion Slash Command → FemWell Quick Action",
    what: "Type \"/\" anywhere to surface a command palette — insert a table, create a page, change block type. Power-user shortcut that removes all navigation.",
    translation: "\"/\" or a swipe-up gesture from anywhere launches a quick-action bar: Log symptom · Start journal entry · Ask Jess · Add to planner · Check cycle day. 2 taps to any action from anywhere in the app.",
    why: "Currently every action requires navigating to the right page first. The slash command removes page-as-container entirely.",
  },
  {
    n: 4,
    title: "Wordle One-Thing-Per-Day → Jess Daily Intention",
    what: "One puzzle per day. No bingeing. Returns tomorrow. Creates daily habit without streaks or pressure.",
    translation: "One Jess-written intention per morning, delivered fresh based on phase + yesterday's mood. \"Today is a good day to start small and notice what actually feels good.\" Can't be advanced. Creates a reliable daily opening moment. Refreshes at 6am.",
    why: "The daily opening is the app's biggest retention lever. A reliable, fresh, personal thing every morning at the right moment — not a push notification, a card you find.",
  },
  {
    n: 5,
    title: "Monzo Notification → FemWell Micro-Alert",
    what: "\"You just spent £4.20 at Pret\" — immediate, contextual, friendly, deep-linked. Reads like a text from a smart friend who's been watching.",
    translation: "\"You've logged mood 2/5 three days in a row. Want to talk to Jess?\" / \"Your energy is climbing — this is your best window for the hard thing.\" Deep-links directly to the relevant action. Written like a message, not an alert.",
    why: "Current notifications are generic reminders. Monzo-style notifications are observations. The former is dismissed. The latter is read.",
  },
];

// 25 cross-category patterns — tier=top (8), strong (12), polish (5)
const UX_PATTERNS = [
  { n: 1,  tier: "top",    title: "OURA READINESS → VITALITY SCORE",
    body: "Synthesise all data into one daily number. Source: Oura Ring. Apply to: Planner hero card. Single most shareable feature." },
  { n: 2,  tier: "top",    title: "SPOTIFY MINI PLAYER → JESS BAR",
    body: "Persistent 44px Jess strip above tab bar on every page. Tap to expand. Source: Spotify Now Playing. Apply to: global app shell. Makes Jess the interface, not a feature." },
  { n: 3,  tier: "top",    title: "NOTION SLASH COMMAND → QUICK ACTION",
    body: "\"/\" or swipe-up from anywhere → log · journal · ask Jess · planner. Source: Notion, Linear, Raycast. Apply to: global. Removes page-as-container." },
  { n: 4,  tier: "top",    title: "GOOGLE MAPS DRAGGABLE CARD → LOGGING SHEETS",
    body: "Replace all logging forms as bottom sheets with snap points (peek / half / full). Drag up for more detail. Drag down to dismiss. Source: Google Maps place card. Apply to: Universal Logger, journal entry creation, GP question builder, habit completion." },
  { n: 5,  tier: "top",    title: "THINGS 3 NATURAL LANGUAGE → JESS VOICE INPUT",
    body: "\"Had a headache since noon\" parsed directly to SymptomLogs. \"Feeling pretty good, 4 out of 5\" to DailyCheckins. Source: Things 3, Todoist. Apply to: Jess chat (already partially built — make it the default logging UX, not secondary)." },
  { n: 6,  tier: "top",    title: "ROBINHOOD HAPTIC SCRUBBER → CYCLE CALENDAR",
    body: "As user drags finger across the cycle calendar, haptic ticks mark each day. Phase transitions get a distinct haptic. Source: Robinhood price chart. Apply to: Planner cycle calendar. Makes data tactile." },
  { n: 7,  tier: "top",    title: "MONZO CONTEXTUAL NOTIFICATION → FEMWELL MICRO-ALERT",
    body: "Written like a friend's text. Observation + one-tap action. Deep-linked. Source: Monzo. Apply to: all Jess-triggered notifications." },
  { n: 8,  tier: "top",    title: "WORDLE DAILY CONSTRAINT → JESS MORNING INTENTION",
    body: "One fresh phase-aware Jess line every morning. Can't be skipped. Creates the daily opening moment. Source: Wordle. Apply to: Planner hero." },
  { n: 9,  tier: "strong", title: "STRAVA PERSONAL BEST → FEMWELL PERSONAL RECORDS",
    body: "\"Your best mood week in 3 months.\" \"Longest habit streak.\" Personal records, not averages. Source: Strava segments. Apply to: Pulse insights." },
  { n: 10, tier: "strong", title: "VSCO FILM PRESETS → MOOD PRESETS",
    body: "Instead of a 1–5 slider, 6 named mood states with a visual: \"Steady ground\", \"Heavy weather\", \"Morning clarity\", \"Restless energy\", \"Tender\", \"Electric\". Source: VSCO. Apply to: mood logging everywhere." },
  { n: 11, tier: "strong", title: "INSTAGRAM STORIES TAP-TO-ADVANCE → HEALTH CORNER NAVIGATION",
    body: "Tap right side of letter to advance to next section. Tap left to go back. Hold to pause. Source: Instagram Stories. Apply to: Health Corner letters." },
  { n: 12, tier: "strong", title: "IMESSAGE TAPBACK → JESS MESSAGE REACTIONS",
    body: "One-tap reaction to Jess's observations. A heart for a helpful insight, a sad-face for one that missed. Trains Jess's context silently. Source: iMessage. Apply to: Jess chat." },
  { n: 13, tier: "strong", title: "AIRBNB DATE PICKER WITH CONTEXT → PREDICTED CYCLE CALENDAR",
    body: "Show predicted mood / energy / phase for each future date on the calendar so users can plan ahead. Source: Airbnb price-per-night calendar. Apply to: Planner schedule calendar." },
  { n: 14, tier: "strong", title: "APPLE WATCH ACTIVITY RINGS → DATA COMPLETION ARCS",
    body: "Three arcs on the Today page: Body (symptoms + check-in), Mind (journal or Jess), Nourishment (meals + hydration). Fill as you log. Source: Apple Watch rings. Apply to: Today page header." },
  { n: 15, tier: "strong", title: "BEREAL AUTHENTICITY CONSTRAINT → HONEST JOURNAL",
    body: "One journal entry per day where editing is disabled after 5 minutes. \"The unedited you.\" Opt-in entry type. Source: BeReal. Apply to: journal entry types." },
  { n: 16, tier: "strong", title: "SNAPCHAT HOLD-TO-RECORD → HOLD FOR VOICE JOURNAL",
    body: "Hold the mic button in journal → voice recording. Release → transcribes and presents for save / edit / burn. Source: Snapchat. Apply to: journal entry creation." },
  { n: 17, tier: "strong", title: "DUOLINGO LESSON COMPLETE → CHECK-IN CELEBRATION",
    body: "A dedicated full-screen moment when you complete your morning check-in. Not confetti on a card — a moment. Source: Duolingo. Apply to: Morning Brief completion." },
  { n: 18, tier: "strong", title: "SHOPIFY ABANDONED CART RECOVERY → STREAK PAUSE",
    body: "When a habit streak breaks, instead of resetting to zero, offer a \"Pause\" for up to 3 days. On return: \"Welcome back — your streak is safe.\" Source: Shopify recovery emails. Apply to: habits everywhere." },
  { n: 19, tier: "strong", title: "CALM DAILY CALM → JESS DAILY PIECE",
    body: "One fresh Jess-written piece of health content per day. Not a notification — a card that's always there. Source: Calm's Daily Calm. Apply to: Today page or Planner." },
  { n: 20, tier: "strong", title: "OBSIDIAN BACKLINKS → JOURNAL ENTRY CONNECTIONS",
    body: "When Jess detects you've written about the same person or theme in multiple entries, show \"You've written about this 3 times — see all.\" Source: Obsidian. Apply to: journal insights." },
  { n: 21, tier: "polish", title: "AMAZON 1-CLICK → SINGLE-TAP HABIT COMPLETION",
    body: "Completing a habit in Planner is one tap. No confirmation dialog. Undo toast appears for 3 seconds. Source: Amazon 1-click. Apply to: all habit completions." },
  { n: 22, tier: "polish", title: "APPLE NOTES TEXT SELECTION → JOURNAL SELECTION ACTIONS",
    body: "Select any text in a journal entry → contextual menu appears: \"Save to Health Notes\", \"Ask Jess about this\", \"Add to GP list\". Source: Apple Notes. Apply to: journal entries, Health Corner letters." },
  { n: 23, tier: "polish", title: "SIGNAL DISAPPEARING MESSAGES → BURN MODE",
    body: "Timed deletion with user-set timer. Already planned — make the timer dial beautiful (the burn date picker is a featured UI moment, not a settings option). Source: Signal. Apply to: Burn Mode." },
  { n: 24, tier: "polish", title: "SLACK THREADS → JESS OBSERVATION THREADS",
    body: "Reply directly to a specific Jess pattern observation without starting a new conversation. Source: Slack threads. Apply to: Jess For You tab observations." },
  { n: 25, tier: "polish", title: "TELEGRAM REACTIONS → JOURNAL EMOJI TAGS",
    body: "Quick reactions on journal entries instead of formal type labels. Storm = heavy day. Sun = good day. Spiral = confused. Heart = grateful. Source: Telegram reactions. Apply to: journal entry list." },
];

function UxPatternCard({ n, tier, title, body }) {
  const tones = {
    top:    { bg: T.goldSoft,   fg: T.gold,      border: T.gold,    label: "Top tier" },
    strong: { bg: T.sageSoft,   fg: T.sage,      border: T.sage,    label: "Strong"   },
    polish: { bg: T.surfaceHi,  fg: T.textMuted, border: T.border,  label: "Polish"   },
  };
  const t = tones[tier] || tones.strong;
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{n}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
              padding: "2px 8px", borderRadius: 999,
              fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2,
              textTransform: "uppercase",
            }}>{t.label}</span>
          </div>
          <div style={{
            fontSize: 14.5, fontWeight: 700, color: T.textHi,
            letterSpacing: -0.1, lineHeight: 1.3,
          }}>{title}</div>
        </div>
      </div>
      <p style={{
        fontSize: 12.5, color: T.textMid, lineHeight: 1.65,
        margin: "0 0 0 38px",
      }}>{body}</p>
    </article>
  );
}

function UxDesignTab() {
  return (
    <div>
      <PageHeader
        title="UX & Design — Patterns From Everywhere"
        subtitle="Not wellness apps. What every other category figured out that we haven't borrowed yet."
      />

      <SectionLabel>The principle</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.7, margin: 0 }}>
          The founder gave two examples — Safari's contextual action sheet and restaurant ordering flows. These were seeds, not the scope.
          The real question is: what has gaming, banking, social, music, maps, and e-commerce figured out that no health app has borrowed yet?
          These 25 patterns answer that.
        </p>
      </div>

      <SectionLabel>5 anchor translations</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
        {UX_ANCHORS.map((a) => (
          <article key={a.n} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "18px 20px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: T.goldSoft, color: T.gold,
                border: `1px solid ${T.gold}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, flexShrink: 0,
              }}>{a.n}</div>
              <div style={{
                fontSize: 19, fontWeight: 700, color: T.gold,
                letterSpacing: -0.2, lineHeight: 1.25, paddingTop: 2,
              }}>{a.title}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{
                  fontSize: 10, color: T.textMuted, fontWeight: 700,
                  letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
                }}>What they do</div>
                <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: 0 }}>{a.what}</p>
              </div>
              <div>
                <div style={{
                  fontSize: 10, color: T.gold, fontWeight: 700,
                  letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
                }}>FemWell translation</div>
                <p style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65, margin: 0 }}>{a.translation}</p>
              </div>
              <div>
                <div style={{
                  fontSize: 10, color: T.sage, fontWeight: 700,
                  letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
                }}>Why it matters</div>
                <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, fontStyle: "italic", margin: 0 }}>{a.why}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <SectionLabel>25 cross-category patterns</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 10, marginBottom: 22,
      }}>
        {UX_PATTERNS.map((p) => <UxPatternCard key={p.n} {...p} />)}
      </div>

      <SectionLabel>Bottom line</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.sage}`,
        borderRadius: 12, padding: "16px 18px",
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0 }}>
          The patterns wellness apps use — cards, sliders, modals, checklists — come from productivity and health admin.
          The patterns that create love — persistent companions, haptic feedback, daily rituals, synthesis scores, one-tap actions — come from everywhere else.{" "}
          <strong style={{ color: T.sage }}>FemWell should borrow from everywhere else.</strong>
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — Wholeness (from cycle app to women's app)
// ════════════════════════════════════════════════════════════════════════════
const WHOLENESS_DIMENSIONS = [
  {
    n: 1,
    name: "RELATIONSHIPS & FEMALE FRIENDSHIP",
    what: "The people in her life — romantic partnerships, friendships, family, community belonging. The loneliness epidemic disproportionately affects women.",
    why: "Female friendships are clinically protective (60% premature death risk reduction). Bumble BFF proved women want depth and context in connection, not swiping. No health app holds relationship health as a first-class dimension.",
    femwell: "A relationships log in journal (write about specific people over time, Jess notices recurring themes), a friendship appreciation feature, community spaces organized by life circumstance not just cycle phase.",
    cycle: "Ovulatory phase is naturally relational — the app can surface relationship prompts and social energy awareness during peak connection windows.",
  },
  {
    n: 2,
    name: "SEX & INTIMACY",
    what: "Desire, pleasure, confidence, the quality of intimate relationships — not just fertility and conception.",
    why: "Desire tracking is one of the most requested missing features in femtech. Libido fluctuates with cycle phase, life stress, relationship health, and medication. Currently FemWell has conception-framed intimacy content. Most women are not TTC.",
    femwell: "Desire log (how connected do I feel today, in my body, with my partner/self), intimacy reflection journal type, phase-aware desire patterns surfaced as insight, body confidence content that isn't about weight or symptoms.",
    cycle: "The cycle is the most powerful predictor of desire patterns — this is where phase intelligence is most directly applicable to something women actually feel.",
  },
  {
    n: 3,
    name: "CAREER & AMBITION",
    what: "Work satisfaction, career progression, workplace relationships, the negotiation gap, returning to work (postpartum, menopause), the ambition-guilt complex unique to women.",
    why: "Career decisions intersect constantly with reproductive health (fertility treatment + work travel, postpartum return, perimenopause cognitive symptoms affecting work performance). No app holds both sides of this.",
    femwell: "Career journal type, Jess who can hold a conversation about imposter syndrome without routing it through cycle data, a \"work capacity\" signal in the Planner (not just body capacity), a pre-negotiation confidence ritual.",
    cycle: "Cognitive phase patterns are clinically documented — follicular for strategy sessions, ovulatory for presentations, menstrual for deep thinking. This makes the cycle lens genuinely useful for career planning.",
  },
  {
    n: 4,
    name: "FINANCIAL HEALTH & CONFIDENCE",
    what: "Money management, wealth-building, financial anxiety, the gender wealth gap (21% in UK), financial decisions at life transitions (maternity leave, divorce, career change).",
    why: "Only 38% of Gen Z/Millennial women feel confident discussing money vs 56% of men. Financial anxiety is the top non-health stressor for women 25–45. It correlates with mood, sleep, and health outcomes. FemWell already tracks mood — financial stress should be part of what Jess understands.",
    femwell: "Financial stress as a DailyCheckins field (not financial advice — emotional state around money), a money journal type (\"what's my relationship with money this month\"), Jess awareness of financial stress as a life context.",
    cycle: "Luteal phase is documented as highest financial anxiety window for many women — validating this pattern is clinically and emotionally useful.",
  },
  {
    n: 5,
    name: "GRIEF & LOSS",
    what: "Pregnancy loss, fertility treatment grief, relationship endings, parent illness, job loss, the identity grief of life stage transitions (becoming a mother, entering perimenopause, children leaving home).",
    why: "The Pregnancy After Loss app closed in 2025, leaving a documented gap. Grief is one of the most common experiences FemWell's life stages will encounter — TTC users experience loss regularly, postpartum grief is real, perimenopause involves profound identity loss. No health app holds grief well.",
    femwell: "A dedicated grief container (separate from journal — specific, warm, no prompts to \"move on\"), a loss entry type that doesn't show up in insights or be analysed, Jess who can sit with grief without pivoting to health advice, crisis-adjacent resources for grief.",
    cycle: "Grief often maps to specific cycle phases (luteal heightens grief intensity). Understanding this pattern is validating — not reductive.",
  },
  {
    n: 6,
    name: "BODY CONFIDENCE & AESTHETICS ON HER OWN TERMS",
    what: "How she feels in and about her body — not as data, not clinically, but culturally, politically, personally. Beauty as self-expression, not performance.",
    why: "Body image is the most common self-esteem driver for women under 45. Current FemWell has skin + hair tracking (clinically framed). Missing: the experience of feeling powerful in your body, dressing for yourself, the political act of loving your body in a culture that profits from you not doing so.",
    femwell: "A body affirmation feature (not self-help platitudes — specific, earned, data-informed: \"your energy has been building all week. You know what that feels like in your body.\"), an aesthetic journal type (not skincare — how do I want to present today, what makes me feel like myself), beauty and culture content that treats women as subjects not objects.",
    cycle: "How a woman feels about her body maps closely to cycle phase. This intelligence, used gently and affirmingly, is a genuine differentiator.",
  },
  {
    n: 7,
    name: "CREATIVITY & SELF-EXPRESSION",
    what: "Making things, hobbies, art, writing, music, movement as creative expression — not just exercise.",
    why: "Creativity is a documented protective factor for mental health. Julia Cameron's research on morning pages showed creativity practice reduces anxiety and depression. Women historically have had less permission for creative time. A women's app that honours creative life is unusual.",
    femwell: "A creativity journal type (\"what did I make / imagine / notice today\"), a creative project log, content in the Health Corner letters about creativity and the feminine tradition, Jess who celebrates creative work without pivoting to productivity metrics.",
    cycle: "Follicular and ovulatory phases are peak creative windows (higher verbal fluency, spatial reasoning, collaborative thinking). Surfacing this makes creative life feel supported by the app.",
  },
  {
    n: 8,
    name: "CULTURAL & SEASONAL RHYTHMS",
    what: "The rhythms of a woman's year beyond her menstrual cycle — cultural seasons, personal anniversaries, collective moments, the social and cultural calendar she inhabits.",
    why: "Women don't only live by their biological cycle. They live by school years, cultural seasons, personal anniversaries, the rhythms of the communities they belong to. An app that only understands one rhythm feels incomplete.",
    femwell: "A personal seasonal calendar (her own significant dates — not birthdays only, but the date she moved out, the date she got diagnosed, the date she made a brave decision), cultural calendar awareness in content (the cultural mood of January vs June vs September), Jess who understands that December is hard for many women regardless of their cycle phase.",
    cycle: "The interaction between cultural seasons and cycle phase is genuinely interesting — women often notice their cycle feels different in winter. Surfacing this correlation adds depth.",
  },
  {
    n: 9,
    name: "IDENTITY, VALUES & BECOMING",
    what: "Who she is, what she stands for, who she's becoming. The questions that don't have quick answers and that health apps never ask.",
    why: "Perimenopause and postpartum are the two life stages with the highest identity disruption. Women in these stages consistently say they need space to process who they are now — not medical information about what's happening to their body.",
    femwell: "A values journal type, an identity prompt library (\"what am I willing to defend? what have I stopped pretending to care about?\"), Jess who can hold identity conversations without routing them through health context, a \"becoming\" archive — entries tagged as identity-shaping moments.",
    cycle: "The menstrual phase is the phase of integration and identity processing — the quieter inward days are actually ideal for this kind of reflection.",
  },
  {
    n: 10,
    name: "REST, PLAY & JOY",
    what: "Actual rest (not self-care-as-productivity), actual play (not optimised recreation), actual joy (the tiny mundane things). The right to waste time beautifully.",
    why: "Women are systematically under-rested and over-optimised. The wellness industry — including most health apps — makes rest a task. FemWell should be the one app that gives women permission to do nothing and celebrates it.",
    femwell: "An everyday joy log (not gratitude journalling — the tiny actual things: the coffee, the song, the good parking space), a \"nothing\" check-in option (no logging, no prompts — just the app acknowledging you showed up), Jess who can say \"that sounds like a good day\" without offering a health insight.",
    cycle: "The menstrual phase is rest-permission built into biology. Using the cycle to validate rest rather than just explain it is a genuinely different framing.",
  },
];

const WHOLENESS_LETTERS = [
  "A letter on relationships and friendship (as health)",
  "A letter on career and ambition through a women's lens",
  "A letter on money confidence",
  "A letter on creativity as a health practice",
  "A letter on grief and loss (not a crisis protocol — a considered, warm exploration)",
  "A letter on beauty and body on your own terms",
];

function DimensionField({ label, body, labelTone }) {
  const labelColor = labelTone === "blush" ? T.blush : labelTone === "sage" ? T.sage : T.gold;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 10, color: labelColor, fontWeight: 700,
        letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
      }}>{label}</div>
      <p style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65, margin: 0 }}>{body}</p>
    </div>
  );
}

function DimensionCard({ d }) {
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14, padding: "18px 20px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: T.goldSoft, color: T.gold,
          border: `1px solid ${T.gold}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, flexShrink: 0,
        }}>{d.n}</div>
        <div style={{
          fontSize: 17, fontWeight: 700, color: T.textHi,
          letterSpacing: 0.3, lineHeight: 1.3, paddingTop: 6,
        }}>{d.name}</div>
      </div>
      <DimensionField label="What" body={d.what} labelTone="gold" />
      <DimensionField label="Why it matters" body={d.why} labelTone="blush" />
      <DimensionField label="In FemWell" body={d.femwell} labelTone="sage" />
      <div>
        <div style={{
          fontSize: 10, color: T.gold, fontWeight: 700,
          letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
        }}>Cycle intelligence enhancement</div>
        <p style={{ fontSize: 13, color: T.gold, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>{d.cycle}</p>
      </div>
    </article>
  );
}

function WholenessTab() {
  return (
    <div>
      <PageHeader
        title="Wholeness — From Cycle App to Women's App"
        subtitle="Phase intelligence is a strength. The vision is bigger: hold the whole of what it means to be a woman."
      />

      <SectionLabel>The vision shift</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "18px 20px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          FemWell is currently an excellent cycle and health tracking app. The goal is to become something more:
          the companion that holds a woman's full life — her health, her relationships, her career, her grief, her
          creativity, her money, her identity, her joy. Cycle and phase remain central strengths. They enrich
          everything. But they should be one thread in a richer tapestry — not the whole tapestry.
        </p>
        <p style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.75, margin: "0 0 12px" }}>
          <span style={{ color: T.gold, fontWeight: 700 }}>Reference point: </span>
          Goop proved women will invest heavily in a platform that takes the full breadth of their lives seriously.
          FemWell has the health credibility Goop lacks. The question is whether FemWell expands to hold the rest.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
          Harvard Nurses' Health Study: female friendships reduce premature death risk by 60% — equivalent to
          quitting smoking. This finding alone is justification for a relationship dimension in a health app.
        </p>
      </div>

      <SectionLabel>The 10 dimensions FemWell should hold</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 26 }}>
        {WHOLENESS_DIMENSIONS.map((d) => (
          <DimensionCard key={d.n} d={d} />
        ))}
      </div>

      <SectionLabel>What this means for Jess</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.sage}`,
        borderRadius: 12, padding: "18px 20px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 10px" }}>
          <span style={{ color: T.sage, fontWeight: 700 }}>Jess v1: </span>
          a health companion who knows your cycle.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 14px" }}>
          <span style={{ color: T.sage, fontWeight: 700 }}>Jess v2 (Wholeness vision): </span>
          a life companion who happens to know your health deeply.
        </p>
        <p style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.75, margin: "0 0 12px" }}>
          The difference: Jess v2 can hold a conversation about a difficult work situation without pivoting to
          "here's how your cycle phase affects work performance." She can celebrate a creative win. She can sit with
          financial anxiety without suggesting a breathing exercise. She understands that sometimes the most helpful
          thing is to say "that sounds really hard" and mean it.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
          The Wholeness upgrade for Jess is not technical — it's a persona expansion. Her system prompt needs to
          explicitly grant her permission to be present in the full spectrum of a woman's life, not just her
          health data.
        </p>
      </div>

      <SectionLabel>What this means for the Health Corner letters</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "18px 20px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 14px" }}>
          The current 7 letters cover health topics well. The Wholeness vision expands them:
        </p>
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
          {WHOLENESS_LETTERS.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              fontSize: 13, color: T.textHi, lineHeight: 1.65, marginBottom: 9,
            }}>
              <span aria-hidden="true" style={{ color: T.gold, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
          These sit alongside the existing 7, not replacing them.
        </p>
      </div>

      <SectionLabel>The integration principle</SectionLabel>
      <div style={{
        backgroundColor: T.textHi,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "20px 22px", marginBottom: 8,
      }}>
        <p style={{ fontSize: 13.5, color: T.bg, lineHeight: 1.75, margin: "0 0 12px" }}>
          Phase intelligence doesn't disappear — it enriches every dimension. Career planning is richer with phase
          awareness. Grief is more understandable with cycle context. Relationships are deeper when she understands
          her relational energy across the month. Creativity is more sustainable when she works with her cycle not
          against it.
        </p>
        <p style={{
          fontSize: 14, color: T.bg, lineHeight: 1.65, margin: 0,
          fontStyle: "italic", fontWeight: 600,
        }}>
          The vision isn't less cycle. It's: cycle as one of many intelligent lenses FemWell uses to understand
          and serve the whole woman.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — LGBTQ+ full inclusion plan
// ════════════════════════════════════════════════════════════════════════════
const LGBTQ_FINDINGS = [
  "BMC Women's Health 2025: only 50% of 60 menstrual health apps use neutral or no pronouns. Minimum viable inclusion bar is low to clear.",
  "Bisexual women: 59% lifetime depression rate (highest of any group), 69% lifetime IPV exposure. Jess needs specific awareness.",
  "Trans women on HRT: experience monthly PMS-equivalent symptoms. Active cycle app users whose needs aren't served anywhere.",
  "Trans men on testosterone: 26.8% still bleed at 3 months. \"No cycle\" assumption is wrong.",
  "UK Online Safety Act obligations apply to LGBTQ+-targeted content moderation.",
];

const LGBTQ_QUICK = [
  "Pronoun choice in onboarding (they/them, she/her, he/him, custom) — used by Jess throughout",
  'Full copy audit: replace "husband/boyfriend" with "partner" throughout app',
  '"No current cycle" mode for trans women and trans men on T who have stopped periods',
  "LGBTQ+ crisis resources in Jess (Galop UK, MindOut) alongside Samaritans",
  "Donor insemination / IVF pathway in TTC life stage (for same-sex couples TTC via donor)",
];

const LGBTQ_STRUCTURAL = [
  { name: "Decouple cycle tracking from gender identity",
    body: "The app should not assume everyone who tracks a cycle identifies as a woman. Opt-in framing on cycle features." },
  { name: "Configurable life stages",
    body: 'The fixed 11-stage list doesn\'t serve all users. Life stages should be configurable or at least include: "Cycling but not a woman" / "Trans + HRT" / "Non-binary + menstruating"' },
  { name: "Jess LGBTQ+ awareness",
    body: "JESS_PERSONA updated to: know queer TTC pathways, not assume heterosexual relationships, use user's pronoun preference throughout, have specific empathy for bisexual mental health burden" },
  { name: "Partner Sync for same-sex couples",
    body: "Partner Sync should work for same-sex TTC couples including IUI timing, donor tracking" },
  { name: "Contextual LGBTQ+ content",
    body: 'Embedded throughout the Health Corner letters, not in a separate "LGBTQ+ section" (which always feels like a ghetto)' },
];

const LGBTQ_DONT = [
  "Do not add a pride flag in June and call it done.",
  'Do not create a separate "LGBTQ+ mode" — this segregates rather than includes.',
  "Do not ask about gender identity during onboarding then not use the answer anywhere in the app.",
];

function LgbtqTab() {
  return (
    <div>
      <PageHeader
        title="LGBTQ+ — Full Inclusion Plan"
        subtitle="8–12% of FemWell's UK target market. Currently the app would feel exclusionary to most of them."
      />

      <SectionLabel>Key research findings</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {LGBTQ_FINDINGS.map((line) => (
          <div key={line} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.gold}`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span aria-hidden="true" style={{ color: T.gold, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>◆</span>
            <span style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65 }}>{line}</span>
          </div>
        ))}
      </div>

      <SectionLabel>Quick wins · small, high visibility</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {LGBTQ_QUICK.map((line, i) => (
          <div key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.sage}`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span aria-hidden="true" style={{
              background: T.sageSoft, color: T.sage,
              border: `1px solid ${T.sage}`,
              borderRadius: "50%", width: 22, height: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65 }}>{line}</span>
          </div>
        ))}
      </div>

      <SectionLabel>Structural changes · bigger, require planning</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {LGBTQ_STRUCTURAL.map((row, i) => (
          <article key={row.name} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.blush}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
              <div style={{
                background: T.blushSoft, color: T.blush,
                border: `1px solid ${T.blush}`,
                borderRadius: "50%", width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{
                fontSize: 14, fontWeight: 600, color: T.textHi,
                lineHeight: 1.4, paddingTop: 2,
              }}>{row.name}</div>
            </div>
            <p style={{
              fontSize: 12.5, color: T.textMid, lineHeight: 1.65,
              margin: "0 0 0 40px",
            }}>{row.body}</p>
          </article>
        ))}
      </div>

      <SectionLabel>What NOT to do</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.red}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <div style={{
          display: "inline-block",
          background: T.redSoft, color: T.red,
          padding: "3px 10px", borderRadius: 6,
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
          textTransform: "uppercase", marginBottom: 12,
        }}>Amber warning</div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {LGBTQ_DONT.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 8,
            }}>
              <span aria-hidden="true" style={{ color: T.red, fontWeight: 700, flexShrink: 0 }}>✕</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <SectionLabel>Compliance note</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "16px 18px",
      }}>
        <p style={{ fontSize: 13, color: T.textHi, lineHeight: 1.7, margin: 0 }}>
          UK Equality Act 2010 protected characteristics include sexual orientation and gender reassignment. LGBTQ+ users reporting
          discrimination in community features must have a clear escalation path.{" "}
          <strong style={{ color: T.gold }}>Galop UK</strong> (not just Samaritans) should be in the crisis resources.
        </p>
      </div>
    </div>
  );
}
