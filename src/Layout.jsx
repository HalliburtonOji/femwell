import { useEffect, useState } from "react";
import { PageLoader } from './components/common/LoadingSpinner';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import FloatingSidebar from "./components/layout/FloatingSidebar";

const HIDE_NAV = ["Onboarding", "ContentPlayer", "CycleSettings"];
const LITE_NAV = ["ProgramDay", "ProgramDetail"];
const NO_GUARD = ["Onboarding", "CycleSettings"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV.includes(currentPageName) || LITE_NAV.includes(currentPageName);
  const navMode = LITE_NAV.includes(currentPageName) ? "lite" : "full";
  const [checking, setChecking] = useState(!NO_GUARD.includes(currentPageName));
  const navigate = useNavigate();

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
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        if (cancelled) return;
        if (profiles.length === 0) {
          // Retry once after 800ms to guard against race conditions
          await new Promise(r => setTimeout(r, 800));
          if (cancelled) return;
          const retry = await base44.entities.UserProfile.filter({ user_id: u.id });
          if (!cancelled && retry.length === 0) {
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
      {showNav && <div className="no-print"><FloatingSidebar currentPageName={currentPageName} mode={navMode} /></div>}
      <div className={`${navMode === "full" ? "lg:pl-64" : ""} ${showNav ? "pb-8" : ""}`}>
        {children}
      </div>
    </div>
  );
}