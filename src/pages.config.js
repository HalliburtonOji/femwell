/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import BreathworkAudioManager from './pages/BreathworkAudioManager';
import ContentPlayer from './pages/ContentPlayer';
import CycleSettings from './pages/CycleSettings';
import Explore from './pages/Explore';
import Journal from './pages/Journal';
import JournalHub from './pages/JournalHub';
import CommunityHub from './pages/CommunityHub';
import CommunityEliteShell from './components/community-elite/CommunityEliteShell';
import LifeStageCare from './pages/LifeStageCare';
import Lifestyle from './pages/Lifestyle';
// NOTE: the old Nutrition page (./pages/Nutrition) is intentionally NO LONGER
// IMPORTED/ROUTED — the "Nutrition" route now renders NutritionHub (the chosen
// Daily-Hub + Hero-Card-Slider hybrid). The old file is kept in the repo as a
// fallback; re-add this import + map "Nutrition" back to it to revert.
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import ProgramDay from './pages/ProgramDay';
import ProgramDetail from './pages/ProgramDetail';
import ProgramsHub from './pages/ProgramsHub';
// LOCK+SWAP: the "Today" route renders **TodayClipboardDemo** (see the Pages map below —
// superseded TodayDemo6 on 2026-06-22). BOTH ./pages/Today and TodayDemo6 are intentional
// UNROUTED FALLBACKS — to revert, map "Today" back to whichever you want.
// ⚠️ THE MAP BELOW IS THE ONLY SOURCE OF TRUTH. This comment previously still named
// TodayDemo6 months after the swap and cost a real debugging session: a fix was written
// into TodayDemo6, verified as "shipped", and changed nothing live because the route
// never loaded that file. Before editing ANY page, grep the Pages map for its route key.
import Today from './pages/Today';

import Trends from './pages/Trends';
import Upgrade from './pages/Upgrade';
import VideoManager from './pages/VideoManager';
import Assistant from './pages/Assistant';
import SkinHair from './pages/SkinHair';
import Pulse from './pages/Pulse';
import PulseL2Demo from './pages/PulseL2Demo';
// ELITE (2026-06-28): /Pulse renders the elevated PulseEliteShell. ONE-LINE REVERT:
// map "Pulse" back to Pulse below. Old Pulse stays reachable at /PulseHub.
import PulseEliteShell from './components/pulse-elite/PulseEliteShell';
// ELITE (2026-06-28): /ProgramsHub renders the elevated ProgramsEliteShell. ONE-LINE REVERT:
// map "ProgramsHub" back to ProgramsHub below. Old hub stays reachable at /ProgramsHubClassic.
import ProgramsEliteShell from './components/programs-elite/ProgramsEliteShell';
import ProgramsL2Demo from './pages/ProgramsL2Demo';
import WeeklyInsights from './pages/WeeklyInsights';
import Saved from './pages/Saved';
import Deals from './pages/Deals';
import Events from './pages/Events';
import LifestyleDetail from './pages/LifestyleDetail';
import WatchListen from './pages/WatchListen';
import Mirror from './pages/Mirror';
import Move from './pages/Move';
import Kindred from './pages/Kindred';
import Curious from './pages/Curious';
import Delight from './pages/Delight';
import Nest from './pages/Nest';
import Tonight from './pages/Tonight';
import BookReader from './pages/BookReader';
import FictionReader from './pages/FictionReader';
import Track from './pages/Track';
import Community from './pages/Community';
import Planner from './pages/Planner';
import PlannerLiveTest from './pages/PlannerLiveTest';
import PlannerElite from './pages/PlannerElite';
import NutritionElite from './pages/NutritionElite';
import LifestyleElite from './pages/LifestyleElite';
import Insights from './pages/Insights.jsx';
import OneShotThankYou from './pages/OneShotThankYou';
// `Ideas` (the Design Lab component) is no longer routed — Halli's
// menu links go to /Ideas, and she needs that path to land on Founder
// OS, not on the old Design Lab. We keep the import commented so the
// file isn't removed by accident; if it ever needs to be reachable
// again, mount it at /DesignLab or similar.
// import Ideas from './pages/Ideas';
// /Ideas AND /Founders both render FoundersOS. /Founders is kept as
// an alias so any old bookmarks still work.
import FoundersOS from './pages/FoundersOS';
// 4 Journal theme demos (mounted at /JournalDemo1..4). Linked from the
// "Journal Demos" tab in FoundersOS. Mock data, no entity queries.
import JournalDemo1 from './pages/JournalDemo1';
import JournalDemo2 from './pages/JournalDemo2';
import JournalDemo3 from './pages/JournalDemo3';
import JournalDemo4 from './pages/JournalDemo4';
// 5 Community design demos (mounted at /CommunityDemo1..5). Linked from the
// "Community Demos" tab in FoundersOS. Self-contained, mock data, NO entity
// queries, no new entities — safe to deploy alongside production Community.
import CommunityDemo1 from './pages/CommunityDemo1';
import CommunityDemo2 from './pages/CommunityDemo2';
import CommunityDemo3 from './pages/CommunityDemo3';
import CommunityDemo4 from './pages/CommunityDemo4';
import CommunityDemo5 from './pages/CommunityDemo5';
import CommunityDemo6 from './pages/CommunityDemo6';   // production candidate: rooms+tabs hybrid + comments + games-master
// 5 Nutrition UX demos (mounted at /NutritionDemo1..5). Linked from the
// "Nutrition Demos" tab in FoundersOS. Self-contained, mock data only (all from
// ./pages/nutritionDemoShared), NO entity queries — 5 distinct decision-fatigue
// directions: 1 card-slider · 2 daily-hub · 3 log-first · 4 timeline · 5 magazine.
import NutritionDemo1 from './pages/NutritionDemo1';
import NutritionDemo2 from './pages/NutritionDemo2';
import NutritionDemo3 from './pages/NutritionDemo3';
import NutritionDemo4 from './pages/NutritionDemo4';
import NutritionDemo5 from './pages/NutritionDemo5';
// 6 Today-redesign preview demos (/TodayDemo1..6). Linked from FoundersOS → Previews.
// Self-contained, mock data only, NO entity queries. The live Today is untouched.
// Demo 6 = the SYNTHESISED "your day" (garden-led + cycle-led + actionable in one) — the
// candidate for the real Today.
import TodayDemo1 from './pages/TodayDemo1';
import TodayDemo2 from './pages/TodayDemo2';
import TodayDemo3 from './pages/TodayDemo3';
import TodayDemo4 from './pages/TodayDemo4';
import TodayDemo5 from './pages/TodayDemo5';
import TodayDemo6 from './pages/TodayDemo6';
// Today — Option 2 (single horizontal slider; one smart card per app section; daily-rotating
// suggestions + inline actions). PREVIEW route only, reached via FoundersOS → Previews.
import TodayOption2 from './pages/TodayOption2';
// Today — Ritual Builder DEMO: the live Today (Demo6) with the "Your day" list turned into a §6.10
// Clipboard Stack Slider — slide LEFT to reveal the ritual builder (4 ritual cards + quick-popups +
// garden growth). PREVIEW route only, reached via FoundersOS → Previews. Live Today untouched.
import TodayRitualDemo from './pages/TodayRitualDemo';
// BLOOMPRINT — the PERSONAL FLORA IDENTITY demo: each woman's signature bloom + garden that grows
// from real activity, gently-earned petals/rare-blooms/stars/seasons, her anonymous-but-unique
// presence in Community (3 disclosure tiers), and her Profile/Today avatar. Reads real Garden data
// (companion + milestones + chapters) with a seeded fallback. Preview route; live pages untouched.
import BloomprintDemo from './pages/BloomprintDemo';
// CLIPBOARD TAP-TO-EXPAND — a Breeze-inspired "browse cards → tap → big rich detail card"
// interaction on our ClipboardSlider, adapted fully to the FemWell brand for CONTENT (reads/
// listens/sessions/books/recipes/circles/discover) — flora covers, inline player, sticky
// actions, smooth expand/collapse. Preview route; live pages untouched.
import ClipboardExpandDemo from './pages/ClipboardExpandDemo';
// STACKED × EXPAND — the tap-to-expand cards married with our StackedCard: one big clipboard
// card split into TOP (articles) + BOTTOM (books) halves by the gold hairline, each a horizontal
// peek sub-slider → tap any cover → the shared full-screen expand. Preview route; live untouched.
import StackedExpandDemo from './pages/StackedExpandDemo';
// THE CARD SET (§6.7.1) — every content type the clipboard houses (article · book · audio ·
// session · daily story · video · ritual · quote · horoscope · recipe) on the ONE shared
// cover→expand pattern. Driven by CARD_TYPES + SAMPLE_CARDS in brand/expandCards.jsx.
import CardVariationsDemo from './pages/CardVariationsDemo';
import FloraCoverDemo from './pages/FloraCoverDemo';
import LifestyleDeckDemo from './pages/LifestyleDeckDemo';
// Garden + Jess redesign DEMOS (v4 bible: flora-hero + summary + living-ecosystem clipboard /
// on-brand chat shell; every existing feature preserved). Preview routes; live pages untouched.
import GardenClipboardDemo from './pages/GardenClipboardDemo';
import JessClipboardDemo from './pages/JessClipboardDemo';
// JESS ELITE — the LIVE elite Jess surface (approved JessClipboardDemo promoted to live;
// working assistant preserved verbatim). Flipped onto /Jess + /Assistant.
import JessEliteShell from './components/jess-elite/JessEliteShell';
import JessL2Demo from './pages/JessL2Demo';
// Batch-2 LEVEL-UP DEMOS (approved plans → demo-first; built on the elite card language, live pages untouched).
import NutritionL2Demo from './pages/NutritionL2Demo';
import NutritionV2Demo from './pages/NutritionV2Demo';
// UniversalCalendarDemo — demo-first preview of the "One Universal Calendar + Calendar-as-Logger"
// system (icon-top-right entry, tap-past/today→LOG, tap-future→PLAN gated by data type, Planner
// time-slot prefill, rebuilt log/plan modal). Seeded, NO base44 writes; live pages/logger untouched.
import UniversalCalendarDemo from './pages/UniversalCalendarDemo';
import LifestyleL2Demo from './pages/LifestyleL2Demo';
import HealthLettersDemo from './pages/HealthLettersDemo';
import CommunityL2Demo from './pages/CommunityL2Demo';
// Journal — Clipboard rebuild DEMO (compact, §6.10 clipboard slider; all features preserved). Preview route.
import JournalClipboardDemo from './pages/JournalClipboardDemo';
// Profile — Clipboard rebuild DEMO (compact §6.10 slider + flora hero + quick-edit popups; all features preserved). Preview route.
import ProfileClipboardDemo from './pages/ProfileClipboardDemo';
// Today — Clipboard COMPACT DEMO (live TodayDemo6 with the mid-page vertical stack moved into a §6.10 slider; all features + Growth loop preserved). Preview route.
import TodayClipboardDemo from './pages/TodayClipboardDemo';
// Planner — Clipboard TRUE-FULL-PARITY DEMO (v4 clipboard+CardDeck; REAL CapacityTaxBar + VoiceScheduler restored & prominent). Preview route.
import PlannerClipboardDemo from './pages/PlannerClipboardDemo';
import PulseClipboardDemo from './pages/PulseClipboardDemo';
import DoctorExportClipboardDemo from './pages/DoctorExportClipboardDemo';
// Canonical Doctor Export — the real 3-step builder, elevated to ELITE (flora hero + oxblood). Now routed at /DoctorExport.
import DoctorExport from './pages/DoctorExport';
import DoctorExportL2Demo from './pages/DoctorExportL2Demo';
import ProgramsClipboardDemo from './pages/ProgramsClipboardDemo';
// Brand craft sample (Phase-1 brand-identity craft direction — flat vs upgraded bloom,
// botanical motif, heart in context, live perf). Self-contained preview. Linked from Previews.
import BrandCraftSample from './pages/BrandCraftSample';
// Page redesign DEMOS (preview-only; adapt the Today/Journal/Community bar — hero + summary +
// per-section CardStack + central Jump-to + inline actions + specific deep-links). Live pages untouched.
import HealthDemo from './pages/HealthDemo';
import ProfileDemo from './pages/ProfileDemo';
import DoctorExportDemo from './pages/DoctorExportDemo';
import ProgramsDemo from './pages/ProgramsDemo';
import GardenDemo from './pages/GardenDemo';
import PulseDemo from './pages/PulseDemo';
import PlannerDemo from './pages/PlannerDemo';
import ExploreDemo from './pages/ExploreDemo';
import SavedDemo from './pages/SavedDemo';
import DealsDemo from './pages/DealsDemo';
import EventsDemo from './pages/EventsDemo';
// Card-system demos (BRAND_IDENTITY §6.7/§6.8 applied per page — preview-only, for
// approval before any live rebuild). Standalone routes; live pages untouched.
import LifestyleCardsDemo from './pages/LifestyleCardsDemo';
import CommunityCardsDemo from './pages/CommunityCardsDemo';
import NutritionCardsDemo from './pages/NutritionCardsDemo';
import JournalCardsDemo from './pages/JournalCardsDemo';
import ProfileCardsDemo from './pages/ProfileCardsDemo';
import ProgramsCardsDemo from './pages/ProgramsCardsDemo';
import GardenCardsDemo from './pages/GardenCardsDemo';
import PulseCardsDemo from './pages/PulseCardsDemo';
import PlannerCardsDemo from './pages/PlannerCardsDemo';
import FloraLabDemo from './pages/FloraLabDemo';
import RitualBuilderDemo from './pages/RitualBuilderDemo';
// Growth & Connection demos (Phase 0 — intentions/line-of-day/goals/tiny-missions/
// bucket-list/days-off/Tier-0 anonymous connection baked into existing pages, no new
// nav tab). Standalone preview routes; live pages untouched. Gated 1:1 tiers HELD.
import GrowthDemo from './pages/GrowthDemo';
import PenPalDemo from './pages/PenPalDemo';
import CommunityV4Demo from './pages/CommunityV4Demo';
import CommunityRedesignDemo from './pages/CommunityRedesignDemo';
import GrowthTodayDemo from './pages/GrowthTodayDemo';
import GrowthGardenDemo from './pages/GrowthGardenDemo';
import GrowthPlannerDemo from './pages/GrowthPlannerDemo';
import GrowthLifestyleDemo from './pages/GrowthLifestyleDemo';
import GrowthCommunityDemo from './pages/GrowthCommunityDemo';
import GrowthProfileDemo from './pages/GrowthProfileDemo';
import PlannerRedesignDemo from './pages/PlannerRedesignDemo';
// PlannerNewDemo = the GROUND-UP "The Day, Tended" Planner rebuild (NEW components — real
// time-blocking + capacity/energy + whole-life intentions; NOT a PlannerV2Shell reskin). Preview route.
import PlannerNewDemo from './pages/PlannerNewDemo';
// NutritionNewDemo / LifestyleNewDemo = the dense single-horizontal-slider rebuilds (planner pattern:
// vertical-segment cards, top chrome, unified calendar). Preview routes; live pages untouched.
import NutritionNewDemo from './pages/NutritionNewDemo';
import LifestyleNewDemo from './pages/LifestyleNewDemo';
// NutritionHub = the REAL new Nutrition page (Daily Hub + Hero Card Slider hybrid,
// wired to real entities, reuses the hardened nutrition components). Lives at
// /NutritionHub for live-verify; once verified it replaces the "Nutrition" route.
import NutritionHub from './pages/NutritionHub';
// Journal + Community design-uplift PREVIEWS (richer component language from the
// nutrition demos, identity preserved). Preview routes only — live pages untouched.
import JournalRedesign1 from './pages/JournalRedesign1';
import CommunityRedesign1 from './pages/CommunityRedesign1';
// Control-Center concept demos (iOS Control-Center reinterpreted in FemWell brand:
// header summary + a full-cover floating rounded card with a 2-col peek grid + right
// jump rail). Previewable routes only — mock data; linked from FoundersOS → Previews.
import JournalControlDemo from './pages/JournalControlDemo';
import CommunityControlDemo from './pages/CommunityControlDemo';
import NutritionControlDemo from './pages/NutritionControlDemo';
// "Rich header + big horizontal sliding cards" design-language demos (the live hub
// direction) for Journal + Nutrition — one shared kit so they read as one system.
// Previewable routes only — mock data; linked from FoundersOS → Previews.
import JournalHubDemo from './pages/JournalHubDemo';
import NutritionHubDemo from './pages/NutritionHubDemo';
import NutritionRedesignDemo from './pages/NutritionRedesignDemo';
import CommunityHubDemo from './pages/CommunityHubDemo';
// Sprint 10 — Partner Sync hub (user's share-code page). The
// matching public /partner?code=… read-only view (Partner.jsx) is
// wired separately in App.jsx OUTSIDE this PAGES map so it can run
// without the auth gate.
import PartnerSync from './pages/PartnerSync';
// Sprint 11 — legacy HealthDashboard ("Your Health Story" cycle calendar +
// mood charts). Superseded by /Health (Letter format). The /HealthDashboard
// route now redirects to /Health via App.jsx; this import is preserved
// commented out for history. The data-viz components inside the file
// (cycle calendar, mood charts) will be ported into the Health Letter as a
// future "Story" tab.
// import HealthDashboard from './pages/HealthDashboard';
import Garden from './pages/Garden';
// ELITE (2026-06-28): /Garden renders the elevated GardenEliteShell. ONE-LINE REVERT:
// map "Garden" back to Garden below. Old garden stays reachable at /GardenHub.
import GardenEliteShell from './components/garden-elite/GardenEliteShell';
import GardenL2Demo from './pages/GardenL2Demo';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BreathworkAudioManager": BreathworkAudioManager,
    "ContentPlayer": ContentPlayer,
    "CycleSettings": CycleSettings,
    "Explore": Explore,
    "Garden": GardenEliteShell,
    "GardenL2Demo": GardenL2Demo,
    "GardenElite": GardenEliteShell,
    "GardenHub": Garden,
    "Journal": JournalHub,
    "JournalClassic": Journal,
    "LifeStageCare": LifeStageCare,
    "Lifestyle": LifestyleElite,
    // LIVE FLIP (2026-06-28): /Lifestyle now renders the elevated, fully-wired LifestyleEliteShell.
    // ONE-LINE REVERT: change the line above back to `"Lifestyle": Lifestyle,`.
    "Nutrition": NutritionElite,
    // LIVE FLIP (2026-06-28): /Nutrition now renders the elevated, fully-wired NutritionEliteShell.
    // ONE-LINE REVERT: change the line above back to `"Nutrition": NutritionRedesignDemo,` (or `NutritionHub`).
    // NutritionHub stays live at /NutritionHub (real full surfaces; jump-to/explore tiles deep-link there).
    "Onboarding": Onboarding,
    "Profile": ProfileClipboardDemo,   // lock+swap 2026-06-22 (Halli-approved segmented rework) — `Profile` kept imported above as the one-line-revert fallback
    "ProgramDay": ProgramDay,
    "ProgramDetail": ProgramDetail,
    "ProgramsHub": ProgramsEliteShell,
    "ProgramsL2Demo": ProgramsL2Demo,
    "ProgramsElite": ProgramsEliteShell,
    "ProgramsHubClassic": ProgramsHub,
    "Today": TodayClipboardDemo,   // lock+swap 2026-06-22 (Halli-approved compact clipboard + nested loop deck) — TodayDemo6 kept imported above as the one-line-revert fallback
    "Trends": Trends,
    "Upgrade": Upgrade,
    "VideoManager": VideoManager,
    "Assistant": JessEliteShell,
    "AssistantClassic": Assistant,
    "Jess": JessEliteShell,
    "JessL2Demo": JessL2Demo,
    "JessElite": JessEliteShell,
    "SkinHair": SkinHair,
    "Pulse": PulseEliteShell,
    "PulseL2Demo": PulseL2Demo,
    "PulseElite": PulseEliteShell,
    "PulseHub": Pulse,
    "WeeklyInsights": WeeklyInsights,
    "Saved": Saved,
    "Deals": Deals,
    "Events": Events,
    "LifestyleDetail": LifestyleDetail,
    "WatchListen": WatchListen,
    "Mirror": Mirror,
    "Move": Move,
    "Kindred": Kindred,
    "Curious": Curious,
    "Delight": Delight,
    "Nest": Nest,
    "Tonight": Tonight,
    "BookReader": BookReader,
    "FictionReader": FictionReader,
    "Track": Track,
    "Community": Community,
    "CommunityElite": CommunityEliteShell,
    "CommunityHub": CommunityHub,
    "CommunityClassic": Community,
    "Planner": Planner,
    "PlannerLiveTest": PlannerLiveTest,
    "PlannerElite": PlannerElite,
    "NutritionElite": NutritionElite,
    "LifestyleElite": LifestyleElite,
    "Insights": Insights,
    "OneShotThankYou": OneShotThankYou,
    // /Ideas now renders FoundersOS — that's the path the in-app
    // menu link points at. /Founders keeps the same component as a
    // direct alias.
    "Ideas": FoundersOS,
    "Founders": FoundersOS,
    "PartnerSync": PartnerSync,
    "JournalDemo1": JournalDemo1,
    "JournalDemo2": JournalDemo2,
    "JournalDemo3": JournalDemo3,
    "JournalDemo4": JournalDemo4,
    "CommunityDemo1": CommunityDemo1,
    "CommunityDemo2": CommunityDemo2,
    "CommunityDemo3": CommunityDemo3,
    "CommunityDemo4": CommunityDemo4,
    "CommunityDemo5": CommunityDemo5,
    "CommunityDemo6": CommunityDemo6,
    "NutritionDemo1": NutritionDemo1,
    "NutritionDemo2": NutritionDemo2,
    "NutritionDemo3": NutritionDemo3,
    "NutritionDemo4": NutritionDemo4,
    "NutritionDemo5": NutritionDemo5,
    "TodayDemo1": TodayDemo1,
    "TodayDemo2": TodayDemo2,
    "TodayDemo3": TodayDemo3,
    "TodayDemo4": TodayDemo4,
    "TodayDemo5": TodayDemo5,
    "TodayDemo6": TodayDemo6,
    "TodayOption2": TodayOption2,
    "TodayRitualDemo": TodayRitualDemo,
    "BloomprintDemo": BloomprintDemo,
    "ClipboardExpandDemo": ClipboardExpandDemo,
    "StackedExpandDemo": StackedExpandDemo,
    "CardVariationsDemo": CardVariationsDemo,
    "FloraCoverDemo": FloraCoverDemo,
    "LifestyleDeckDemo": LifestyleDeckDemo,
    "GardenClipboardDemo": GardenClipboardDemo,
    "JessClipboardDemo": JessClipboardDemo,
    "NutritionL2Demo": NutritionL2Demo,
    "NutritionV2Demo": NutritionV2Demo,
    "UniversalCalendarDemo": UniversalCalendarDemo,
    "LifestyleL2Demo": LifestyleL2Demo,
    "HealthLettersDemo": HealthLettersDemo,
    "CommunityL2Demo": CommunityL2Demo,
    "JournalClipboardDemo": JournalClipboardDemo,
    "ProfileClipboardDemo": ProfileClipboardDemo,
    "TodayClipboardDemo": TodayClipboardDemo,
    "PlannerClipboardDemo": PlannerClipboardDemo,
    "PulseClipboardDemo": PulseClipboardDemo,
    "DoctorExportClipboardDemo": DoctorExportClipboardDemo,
    "DoctorExport": DoctorExport,   // canonical elite builder live at /DoctorExport (revert: map to DoctorExportClipboardDemo, kept imported above)
    "DoctorExportL2Demo": DoctorExportL2Demo,
    "ProgramsClipboardDemo": ProgramsClipboardDemo,
    "BrandCraftSample": BrandCraftSample,
    "HealthDemo": HealthDemo,
    "ProfileDemo": ProfileDemo,
    "DoctorExportDemo": DoctorExportDemo,
    "ProgramsDemo": ProgramsDemo,
    "GardenDemo": GardenDemo,
    "PulseDemo": PulseDemo,
    "PlannerDemo": PlannerDemo,
    "ExploreDemo": ExploreDemo,
    "SavedDemo": SavedDemo,
    "DealsDemo": DealsDemo,
    "EventsDemo": EventsDemo,
    "LifestyleCardsDemo": LifestyleCardsDemo,
    "CommunityCardsDemo": CommunityCardsDemo,
    "NutritionCardsDemo": NutritionCardsDemo,
    "JournalCardsDemo": JournalCardsDemo,
    "ProfileCardsDemo": ProfileCardsDemo,
    "ProgramsCardsDemo": ProgramsCardsDemo,
    "GardenCardsDemo": GardenCardsDemo,
    "PulseCardsDemo": PulseCardsDemo,
    "PlannerCardsDemo": PlannerCardsDemo,
    "FloraLabDemo": FloraLabDemo,
    "RitualBuilderDemo": RitualBuilderDemo,
    "GrowthDemo": GrowthDemo,
    "PenPalDemo": PenPalDemo,
    "CommunityV4Demo": CommunityV4Demo,
    "CommunityRedesignDemo": CommunityRedesignDemo,
    "GrowthTodayDemo": GrowthTodayDemo,
    "GrowthGardenDemo": GrowthGardenDemo,
    "GrowthPlannerDemo": GrowthPlannerDemo,
    "GrowthLifestyleDemo": GrowthLifestyleDemo,
    "GrowthCommunityDemo": GrowthCommunityDemo,
    "GrowthProfileDemo": GrowthProfileDemo,
    "PlannerRedesignDemo": PlannerRedesignDemo,
    "PlannerNewDemo": PlannerNewDemo,
    "NutritionNewDemo": NutritionNewDemo,
    "LifestyleNewDemo": LifestyleNewDemo,
    "NutritionHub": NutritionHub,
    "JournalRedesign1": JournalRedesign1,
    "CommunityRedesign1": CommunityRedesign1,
    "JournalControlDemo": JournalControlDemo,
    "CommunityControlDemo": CommunityControlDemo,
    "NutritionControlDemo": NutritionControlDemo,
    "JournalHubDemo": JournalHubDemo,
    "NutritionHubDemo": NutritionHubDemo,
    "NutritionRedesignDemo": NutritionRedesignDemo,
    "CommunityHubDemo": CommunityHubDemo,
    // HealthDashboard intentionally NOT registered — see import comment above.
    // "HealthDashboard": HealthDashboard,
}

export const pagesConfig = {
    mainPage: "Today",
    Pages: PAGES,
    Layout: __Layout,
};