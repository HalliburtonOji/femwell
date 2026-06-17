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
// LOCK+SWAP (2026-06-17): the "Today" route now renders TodayDemo6 (the chosen
// synthesised Today — real data + full brand image). The old ./pages/Today below
// is the intentional UNROUTED FALLBACK — to revert, map "Today" back to it.
import Today from './pages/Today';

import Trends from './pages/Trends';
import Upgrade from './pages/Upgrade';
import VideoManager from './pages/VideoManager';
import Assistant from './pages/Assistant';
import SkinHair from './pages/SkinHair';
import Pulse from './pages/Pulse';
import WeeklyInsights from './pages/WeeklyInsights';
import Saved from './pages/Saved';
import Deals from './pages/Deals';
import Events from './pages/Events';
import LifestyleDetail from './pages/LifestyleDetail';
import BookReader from './pages/BookReader';
import FictionReader from './pages/FictionReader';
import Track from './pages/Track';
import Community from './pages/Community';
import Planner from './pages/Planner';
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
// Brand craft sample (Phase-1 brand-identity craft direction — flat vs upgraded bloom,
// botanical motif, heart in context, live perf). Self-contained preview. Linked from Previews.
import BrandCraftSample from './pages/BrandCraftSample';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "BreathworkAudioManager": BreathworkAudioManager,
    "ContentPlayer": ContentPlayer,
    "CycleSettings": CycleSettings,
    "Explore": Explore,
    "Garden": Garden,
    "Journal": JournalHub,
    "JournalClassic": Journal,
    "LifeStageCare": LifeStageCare,
    "Lifestyle": Lifestyle,
    "Nutrition": NutritionHub,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "ProgramDay": ProgramDay,
    "ProgramDetail": ProgramDetail,
    "ProgramsHub": ProgramsHub,
    "Today": TodayDemo6,   // lock+swap — was `Today` (kept imported above as the one-line-revert fallback)
    "Trends": Trends,
    "Upgrade": Upgrade,
    "VideoManager": VideoManager,
    "Assistant": Assistant,
    "SkinHair": SkinHair,
    "Pulse": Pulse,
    "WeeklyInsights": WeeklyInsights,
    "Saved": Saved,
    "Deals": Deals,
    "Events": Events,
    "LifestyleDetail": LifestyleDetail,
    "BookReader": BookReader,
    "FictionReader": FictionReader,
    "Track": Track,
    "Community": CommunityHub,
    "CommunityClassic": Community,
    "Planner": Planner,
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
    "BrandCraftSample": BrandCraftSample,
    "NutritionHub": NutritionHub,
    "JournalRedesign1": JournalRedesign1,
    "CommunityRedesign1": CommunityRedesign1,
    "JournalControlDemo": JournalControlDemo,
    "CommunityControlDemo": CommunityControlDemo,
    "NutritionControlDemo": NutritionControlDemo,
    "JournalHubDemo": JournalHubDemo,
    "NutritionHubDemo": NutritionHubDemo,
    "CommunityHubDemo": CommunityHubDemo,
    // HealthDashboard intentionally NOT registered — see import comment above.
    // "HealthDashboard": HealthDashboard,
}

export const pagesConfig = {
    mainPage: "Today",
    Pages: PAGES,
    Layout: __Layout,
};