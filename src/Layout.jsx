import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sun, Compass, User, Activity, Layers } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV = [
  { label: "Today", icon: Sun, page: "Today" },
  { label: "Track", icon: Activity, page: "Track" },
  { label: "Explore", icon: Compass, page: "Explore" },
  { label: "Programs", icon: Layers, page: "ProgramsHub" },
  { label: "Profile", icon: User, page: "Profile" },
];

const HIDE_NAV = ["Onboarding", "ContentPlayer", "ProgramDay", "ProgramDetail", "CycleSettings", "Journal"];
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
        // Only redirect to onboarding if the user has never completed it (no profile at all)
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
      <div className={showNav ? "pb-24" : ""}>{children}</div>
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-rose-100 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="flex items-center justify-around max-w-md mx-auto px-2">
            {NAV.map(({ label, icon: Icon, page }) => {
              const active = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex flex-col items-center gap-0.5 py-3 px-3 min-w-0 transition-all ${active ? "text-rose-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : ""}`} />
                  <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>{label}</span>
                  {active && <div className="w-1 h-1 rounded-full bg-rose-500 mt-0.5" />}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}