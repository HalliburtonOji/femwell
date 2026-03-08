import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import FloatingSidebar from "./components/layout/FloatingSidebar";

const HIDE_NAV = ["Onboarding", "ContentPlayer", "ProgramDay", "ProgramDetail", "CycleSettings"];
const NO_GUARD = ["Onboarding", "CycleSettings"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV.includes(currentPageName);
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
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen femwell-gradient">
      {showNav && <FloatingSidebar currentPageName={currentPageName} />}
      {/* On desktop push content right of the 256px sidebar */}
      <div className={`${showNav ? "lg:pl-64" : ""} ${showNav ? "pb-8" : ""}`}>
        {children}
      </div>
    </div>
  );
}