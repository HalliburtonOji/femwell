import { Toaster } from "@/components/ui/toaster"
import { PageLoader } from './components/common/LoadingSpinner';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
// Sprint 10 — public partner-view route, mounted OUTSIDE the auth gate.
import Partner from './pages/Partner';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { flushPending } from '@/utils/pendingQueue';
import { scheduleNotifications } from '@/utils/notifications';
// next-themes removed — caused duplicate React instance (invalid hook call)
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Saved from './pages/Saved';
import Search from './pages/Search';
import Deals from './pages/Deals';
import Events from './pages/Events';
import WeeklyInsights from './pages/WeeklyInsights';
import LifestyleDetail from './pages/LifestyleDetail';
import SkinHair from './pages/SkinHair';
import Health from './pages/Health';
import AdminMigrations from './pages/AdminMigrations';
import AdminJessConversations from './pages/AdminJessConversations';
import DoctorExport from './pages/DoctorExport';
import PartnerSettings from './pages/PartnerSettings';
import PartnerView from './pages/PartnerView';
import Community from './pages/Community';
import CommunityMP8 from './pages/CommunityMP8';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Upgrade from './pages/Upgrade';
import Planner from './pages/Planner';
import SealedLetters from './pages/SealedLetters';
import BookReader from './pages/BookReader';
import UnifiedTabLogger from './components/UnifiedTabLogger';
import MorningBriefSheet from './components/planner/MorningBriefSheet';
import JessErrorBoundary from '@/components/jess/JessErrorBoundary';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// KEEP-ALIVE — the primary nav-tab pages stay MOUNTED once visited (visibility-
// toggled) so returning to them is INSTANT: no remount, no refetch (every page
// here fetches raw on mount, so a remount = a full reload). They're also warmed
// during idle after first paint so even the first tap is instant. Everything
// else routes normally (mount/unmount) through the animated swap below.
const KEEP_ALIVE = ["Today", "Lifestyle", "Profile"];
const PAGE_ALIASES = { CommunityMP8: "Community", terms: "Terms", privacy: "Privacy", SkinHairLegacy: "SkinHair" };
const pageNameFromPath = (pathname) => {
  const seg = pathname === "/" ? mainPageKey : pathname.replace(/^\//, "").split("/")[0];
  return PAGE_ALIASES[seg] || seg;
};

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Sprint 8 — Morning Brief gating helpers.
// `localKey(uid)` returns the once-per-day localStorage key. Day-of is
// derived from local calendar components so a midnight BST flip doesn't
// hide today's brief from a user on the UK side of the dateline.
function morningBriefKey(uid) {
  if (!uid) return null;
  const d = new Date();
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `femwell_morning_brief_${uid}_${ymd}`;
}
function hasSeenMorningBrief(uid) {
  if (typeof window === "undefined" || !window.localStorage) return true;
  const k = morningBriefKey(uid);
  if (!k) return true;
  try { return window.localStorage.getItem(k) === "seen"; }
  catch { return true; }
}
function markMorningBriefSeen(uid) {
  if (typeof window === "undefined" || !window.localStorage) return;
  const k = morningBriefKey(uid);
  if (!k) return;
  try { window.localStorage.setItem(k, "seen"); } catch { /* swallow */ }
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPageName = pageNameFromPath(location.pathname);

  // Keep-alive bookkeeping — which keep-alive pages have been mounted ("warmed").
  const [warm, setWarm] = useState(() => new Set([currentPageName]));
  useEffect(() => {
    setWarm((w) => (w.has(currentPageName) ? w : new Set(w).add(currentPageName)));
  }, [currentPageName]);
  // Warm the other nav tabs during idle after first paint so the FIRST tap to
  // each is already instant (not just returns). requestIdleCallback so it never
  // competes with the landing page's own load.
  useEffect(() => {
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const warmAll = () => setWarm((w) => {
      const n = new Set(w);
      KEEP_ALIVE.forEach((k) => n.add(k));
      return n;
    });
    const id = ric(warmAll, { timeout: 3000 });
    return () => cancel(id);
  }, []);
  // Sprint 8 — once-per-day Morning Brief auto-launch.
  // We resolve user + profile in a tiny background effect so the brief
  // is data-aware (cycle phase, display name) without blocking router
  // render. `showBrief` starts false; flips true only when (a) auth is
  // settled, (b) we're not in onboarding, (c) the user hasn't seen
  // today's brief yet.
  const [briefUser,    setBriefUser]    = useState(null);
  const [briefProfile, setBriefProfile] = useState(null);
  const [showBrief,    setShowBrief]    = useState(false);
  useEffect(() => {
    if (isLoadingAuth || authError) return;
    if (location.pathname === "/Onboarding") return;
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (!u?.id || cancelled) return;
        if (hasSeenMorningBrief(u.id)) return;
        const profiles = await base44.entities.UserProfile
          .filter({ user_id: u.id }, null, 1)
          .catch(() => []);
        if (cancelled) return;
        setBriefUser(u);
        setBriefProfile(profiles?.[0] || null);
        setShowBrief(true);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [isLoadingAuth, authError, location.pathname]);
  // One-time onboarding check after auth resolves (sessionStorage survives refreshes within session)
  useEffect(() => {
    if (isLoadingAuth || authError) return;
    if (sessionStorage.getItem('fw_ob_ok') === '1') return;
    if (location.pathname === '/Onboarding') return;
    // Run onboarding check in background — never blocks page render
    const timeout = setTimeout(async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.id) return;
        const [profiles, checkins] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: user.id }, "-date", 1).catch(() => []),
        ]);
        const isComplete = profiles.some(p => p?.onboarding_complete === true);
        const hasData = checkins.length > 0;
        if (isComplete || hasData) {
          if (hasData && !isComplete && profiles[0]) {
            base44.entities.UserProfile.update(profiles[0].id, { onboarding_complete: true }).catch(() => {});
          } else if (hasData && !profiles[0]) {
            base44.entities.UserProfile.create({ user_id: user.id, onboarding_complete: true }).catch(() => {});
          }
          sessionStorage.setItem('fw_ob_ok', '1');
        } else {
          navigate('/Onboarding?mode=signup', { replace: true });
        }
      } catch {}
    }, 100);
    return () => clearTimeout(timeout);
  }, [isLoadingAuth]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <PageLoader />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Persistent-shell routing — the ONE <Layout> (nav/sidebar/footer) lives ABOVE
  // the page transition so it never unmounts between routes (keeps the nav +
  // liquid pill mounted, kills double-Layout churn). `currentPageName` derived
  // at the top of the component.

  // Bare routes render with NO app shell (public partner view / admin tools).
  if (location.pathname === "/PartnerView") return <PartnerView />;
  if (location.pathname === "/admin/migrations") return <AdminMigrations />;
  if (location.pathname === "/admin/jess-conversations") return <AdminJessConversations />;

  // Render the main app
  return (
    <>
      {/* Sprint 8 — Morning Brief sits above the routed app on first
          open per day. Dismissal sets a localStorage flag so it stays
          gone until tomorrow. */}
      {showBrief && briefUser && (
        // Sprint 3 S3-3 — variant="hidden" so a crash silently skips
        // the overlay rather than blocking the rest of the app.
        <JessErrorBoundary variant="hidden" label="MorningBriefSheet">
          <MorningBriefSheet
            user={briefUser}
            profile={briefProfile}
            onDismiss={() => {
              markMorningBriefSeen(briefUser.id);
              setShowBrief(false);
            }}
          />
        </JessErrorBoundary>
      )}
    {/* ONE persistent shell (nav/sidebar/footer) wraps the animated page swap.
        The page cross-fades; the nav stays put + its active pill migrates. */}
    <LayoutWrapper currentPageName={currentPageName}>
      {/* reducedMotion="user" → under prefers-reduced-motion framer drops the
          y-slide and the swap becomes a plain opacity cross-fade. */}
      <MotionConfig reducedMotion="user">
      {/* KEEP-ALIVE nav tabs — mounted once warmed, visibility-toggled so
          switching between them is INSTANT (no remount/refetch) and scroll
          position is preserved. The non-keep-alive routes swap below. */}
      {KEEP_ALIVE.map((name) => {
        const PageComp = Pages[name];
        if (!PageComp || !warm.has(name)) return null;
        const active = currentPageName === name;
        return (
          <div
            key={name}
            data-keepalive={name}
            aria-hidden={active ? undefined : true}
            style={{ display: active ? "block" : "none" }}
          >
            <PageComp />
          </div>
        );
      })}
      {/* Everything else: animated mount/unmount swap. Not rendered while on a
          keep-alive tab, so the active tab never double-mounts. */}
      {!KEEP_ALIVE.includes(currentPageName) && (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12, ease: "easeIn" } }}
        >
          <Routes location={location}>
            <Route path="/" element={<MainPage />} />
            {Object.entries(Pages).filter(([path]) => !KEEP_ALIVE.includes(path)).map(([path, Page]) => (
              <Route key={path} path={`/${path}`} element={<Page />} />
            ))}
            <Route path="/Track" element={<Navigate to="/Today" replace />} />
            <Route path="/Saved" element={<Saved />} />
            <Route path="/Deals" element={<Deals />} />
            <Route path="/Events" element={<Events />} />
            <Route path="/WeeklyInsights" element={<WeeklyInsights />} />
            <Route path="/LifestyleDetail" element={<LifestyleDetail />} />
            <Route path="/Health" element={<Health />} />
            <Route path="/health" element={<Navigate to="/Health" replace />} />
            <Route path="/SkinHair" element={<Navigate to="/Health" replace />} />
            <Route path="/SkinHairLegacy" element={<SkinHair />} />
            <Route path="/LifeStageCare" element={<Navigate to="/Health" replace />} />
            <Route path="/HealthDashboard" element={<Navigate to="/Health" replace />} />
            <Route path="/CareBridge" element={<Navigate to="/DoctorExport" replace />} />
            <Route path="/Care-Bridge" element={<Navigate to="/DoctorExport" replace />} />
            <Route path="/DoctorExport" element={<DoctorExport />} />
            <Route path="/PartnerSettings" element={<PartnerSettings />} />
            {/* M1 route correction: /Community now serves the editorial hybrid (Community.jsx).
                MP8 (the retired likes-forum) kept at /CommunityMP8 only for reference. */}
            <Route path="/Community" element={<Community />} />
            <Route path="/CommunityMP8" element={<CommunityMP8 />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/Upgrade" element={<Upgrade />} />
            <Route path="/Planner" element={<Planner />} />
            {/* V3 sprint Task 4 — Search across journal/symptoms/meals/tasks. */}
            <Route path="/Search" element={<Search />} />
            <Route path="/SealedLetters" element={<SealedLetters />} />
            <Route path="/BookReader" element={<BookReader />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      )}
      </MotionConfig>
    </LayoutWrapper>
    </>
  );
};


function App() {
  // V3 sprint Task 6 — online/offline tracking + queue flush on reconnect.
  const [online, setOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const onOnline  = () => { setOnline(true);  flushPending(base44).catch(() => {}); };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    // Best-effort initial flush in case there's still a queue from a prior
    // offline session.
    if (navigator.onLine) flushPending(base44).catch(() => {});
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // V3 sprint Task 7 — schedule notifications on profile load. Fires when
  // the authenticated user's profile resolves and reschedules if the
  // notification_prefs JSON changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!me?.id || cancelled) return;
        const profiles = await base44.entities.UserProfile.filter({ user_id: me.id }).catch(() => []);
        if (cancelled) return;
        await scheduleNotifications(profiles?.[0] || null);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          {!online && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
                padding: "10px 16px", background: "#FFF1D6",
                borderBottom: "1px solid #F4B860", color: "#7A4A0A",
                fontSize: 13,
                textAlign: "center", fontWeight: 600,
              }}
            >
              You're offline — your logs are saved and will sync automatically.
            </div>
          )}
          {/* Sprint 10 — /partner?code=… is a public share-view route.
              Sprint 12 batch 1 — /Privacy, /Terms, /privacy, /terms are
              also public so prospective users can read the policies
              before signing up. All four bypass AuthenticatedApp's
              loading spinner so a non-logged-in visitor doesn't get
              stuck on the auth screen. */}
          <Routes>
            <Route path="/partner" element={<Partner />} />
            <Route path="/Privacy" element={<Privacy />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/Terms"   element={<Terms />} />
            <Route path="/terms"   element={<Terms />} />
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
        {/* Universal Logger — global gold + FAB available on every page.
            Module-level openLogger() lets any component trigger it. */}
        <UnifiedTabLogger />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App