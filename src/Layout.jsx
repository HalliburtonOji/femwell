import { useEffect, useState } from "react";
import { PageLoader } from './components/common/LoadingSpinner';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import FloatingSidebar from "./components/layout/FloatingSidebar";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import CheckinModal from "./components/today/CheckinModal";

const HIDE_NAV = ["Onboarding", "ContentPlayer", "CycleSettings"];
const LITE_NAV = ["ProgramDay", "ProgramDetail"];
const NO_GUARD = ["Onboarding", "CycleSettings"];

const todayStr = new Date().toISOString().split("T")[0];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV.includes(currentPageName) || LITE_NAV.includes(currentPageName);
  const navMode = LITE_NAV.includes(currentPageName) ? "lite" : "full";
  const [checking, setChecking] = useState(!NO_GUARD.includes(currentPageName));
  const navigate = useNavigate();
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogTab, setQuickLogTab] = useState("cycle");
  const [quickLogUserId, setQuickLogUserId] = useState(null);

  const openQuickLog = (tabId = "cycle") => {
    setQuickLogTab(tabId);
    setShowQuickLog(true);
    if (!quickLogUserId) {
      base44.auth.me().then(u => { if (u?.id) setQuickLogUserId(u.id); }).catch(() => {});
    }
  };

  useEffect(() => {
    if (NO_GUARD.includes(currentPageName)) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u?.id) { setChecking(false); return; }
        let profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        if (cancelled) return;
        const needsOnboarding = (p) => p.length === 0 || p[0]?.onboarding_complete !== true;
        if (needsOnboarding(profiles)) {
          // Retry up to 3 times with 600ms delay to avoid post-signup race conditions
          for (let attempt = 0; attempt < 3 && !cancelled && needsOnboarding(profiles); attempt++) {
            await new Promise(r => setTimeout(r, 600));
            if (cancelled) return;
            profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
          }
          if (!cancelled && needsOnboarding(profiles)) {
            navigate(createPageUrl("Onboarding"), { replace: true });
          }
        }
      } catch {
        // not logged in — platform handles redirect
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [currentPageName]);

  if (checking && !NO_GUARD.includes(currentPageName)) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>
      {showNav && <div className="no-print"><FloatingSidebar currentPageName={currentPageName} mode={navMode} openQuickLog={openQuickLog} /></div>}
      <div className={`${navMode === "full" ? "lg:pl-64" : ""} ${showNav ? "pb-24 lg:pb-8" : ""}`}>
        {children}
      </div>
      {showNav && <MobileBottomNav currentPageName={currentPageName} />}
      {showQuickLog && (
        <CheckinModal
          existing={null}
          onClose={() => setShowQuickLog(false)}
          onSave={async () => { setShowQuickLog(false); }}
          userId={quickLogUserId}
          dateStr={todayStr}
          initialTab={quickLogTab}
        />
      )}
    </div>
  );
}