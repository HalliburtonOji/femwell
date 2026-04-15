import { Toaster } from "@/components/ui/toaster"
import { PageLoader } from './components/common/LoadingSpinner';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ThemeProvider } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Saved from './pages/Saved';
import Deals from './pages/Deals';
import Events from './pages/Events';
import WeeklyInsights from './pages/WeeklyInsights';
import LifestyleDetail from './pages/LifestyleDetail';
import SkinHair from './pages/SkinHair';
import AdminMigrations from './pages/AdminMigrations';
import DoctorExport from './pages/DoctorExport';
import PartnerSettings from './pages/PartnerSettings';
import PartnerView from './pages/PartnerView';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // One-time onboarding check after auth resolves (sessionStorage survives refreshes within session)
  useEffect(() => {
    if (isLoadingAuth || authError) return;
    if (sessionStorage.getItem('fw_ob_ok') === '1') return;
    if (location.pathname === '/Onboarding') return;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.id) return;
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        const isComplete = profiles.some(p => p?.onboarding_complete === true);
        if (isComplete) {
          sessionStorage.setItem('fw_ob_ok', '1');
        } else {
          navigate('/Onboarding?mode=signup', { replace: true });
        }
      } catch {}
    })();
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

  // Render the main app
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: 12, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -12, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ minHeight: "100vh" }}
      >
        <Routes location={location}>
          <Route path="/" element={
            <LayoutWrapper currentPageName={mainPageKey}>
              <MainPage />
            </LayoutWrapper>
          } />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              }
            />
          ))}
          <Route path="/Track" element={<Navigate to="/Today" replace />} />
          <Route path="/Saved" element={<LayoutWrapper currentPageName="Saved"><Saved /></LayoutWrapper>} />
          <Route path="/Deals" element={<LayoutWrapper currentPageName="Deals"><Deals /></LayoutWrapper>} />
          <Route path="/Events" element={<LayoutWrapper currentPageName="Events"><Events /></LayoutWrapper>} />
          <Route path="/WeeklyInsights" element={<LayoutWrapper currentPageName="WeeklyInsights"><WeeklyInsights /></LayoutWrapper>} />
          <Route path="/LifestyleDetail" element={<LayoutWrapper currentPageName="LifestyleDetail"><LifestyleDetail /></LayoutWrapper>} />
          <Route path="/SkinHair" element={<LayoutWrapper currentPageName="SkinHair"><SkinHair /></LayoutWrapper>} />
          <Route path="/admin/migrations" element={<AdminMigrations />} />
          <Route path="/DoctorExport" element={<LayoutWrapper currentPageName="DoctorExport"><DoctorExport /></LayoutWrapper>} />
          <Route path="/PartnerSettings" element={<LayoutWrapper currentPageName="PartnerSettings"><PartnerSettings /></LayoutWrapper>} />
          <Route path="/PartnerView" element={<PartnerView />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};


function App() {

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App