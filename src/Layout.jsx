import { useEffect, useState } from "react";
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
    (async () => {
      try {
        const u = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        if (profiles.length === 0) {
          navigate(createPageUrl("Onboarding"), { replace: true });
        }
      } catch {
        // not logged in — platform handles redirect
      }
      setChecking(false);
    })();
  }, [currentPageName]);

  if (checking && !NO_GUARD.includes(currentPageName)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
      </div>
    );
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