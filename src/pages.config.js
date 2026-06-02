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
import LifeStageCare from './pages/LifeStageCare';
import Lifestyle from './pages/Lifestyle';
import Nutrition from './pages/Nutrition';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import ProgramDay from './pages/ProgramDay';
import ProgramDetail from './pages/ProgramDetail';
import ProgramsHub from './pages/ProgramsHub';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "BreathworkAudioManager": BreathworkAudioManager,
    "ContentPlayer": ContentPlayer,
    "CycleSettings": CycleSettings,
    "Explore": Explore,
    "Journal": Journal,
    "LifeStageCare": LifeStageCare,
    "Lifestyle": Lifestyle,
    "Nutrition": Nutrition,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "ProgramDay": ProgramDay,
    "ProgramDetail": ProgramDetail,
    "ProgramsHub": ProgramsHub,
    "Today": Today,
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
    "Community": Community,
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
    // HealthDashboard intentionally NOT registered — see import comment above.
    // "HealthDashboard": HealthDashboard,
}

export const pagesConfig = {
    mainPage: "Today",
    Pages: PAGES,
    Layout: __Layout,
};