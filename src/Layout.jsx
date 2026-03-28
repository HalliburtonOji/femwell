import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import FloatingSidebar from "./components/layout/FloatingSidebar";
import QuickSwitchOverlay from "./components/layout/QuickSwitchOverlay";

const HIDE_NAV = ["Onboarding", "ContentPlayer", "CycleSettings"];
const LITE_NAV = ["ProgramDay", "ProgramDetail"];
const NO_GUARD = ["Onboarding", "CycleSettings"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV.includes(currentPageName) || LITE_NAV.includes(currentPageName);
  const navMode = LITE_NAV.includes(currentPageName) ? "lite" : "full";
  const showQuickSwitch = !NO_GUARD.includes(currentPageName);
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
      <div className="min-h-screen flex items-center justify-center" style={{background:'#0C0C1A'}}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:'#242436',borderTopColor:'#C96B9E'}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen femwell-gradient">
      {showNav && <FloatingSidebar currentPageName={currentPageName} mode={navMode} />}
      {showQuickSwitch && <QuickSwitchOverlay currentPageName={currentPageName} />}
      {/* On desktop push content right of the 256px sidebar */}
      <div className={`${navMode === "full" ? "lg:pl-64" : ""} ${showNav ? "pb-20" : ""}`}>
        {children}
      </div>
    </div>
  );
}