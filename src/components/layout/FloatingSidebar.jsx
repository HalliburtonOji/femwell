import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Compass, User, BookOpen, Newspaper, Utensils, X, Map, Sparkles } from "lucide-react";

const FULL_NAV = [
  { label: "Today", icon: Sun, page: "Today" },
  { label: "Nutrition", icon: Utensils, page: "Nutrition" },
  { label: "Programs", icon: Map, page: "ProgramsHub" },
  { label: "Explore", icon: Compass, page: "Explore" },
  { label: "Lifestyle", icon: BookOpen, page: "Lifestyle" },
  { label: "Journal", icon: Newspaper, page: "Journal" },
  { label: "Assistant", icon: Sparkles, page: "Assistant" },
  { label: "Profile", icon: User, page: "Profile" },
];

// 4-tab mobile bottom nav
const BOTTOM_NAV = [
  { label: "Today", page: "Today" },
  { label: "Cycle", page: "Track" },
  { label: "Explore", page: "Explore" },
  { label: "Me", page: "Profile" },
];

function DesktopSidebar({ currentPageName }) {
  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 z-30"
      style={{ background: "#13131F", borderRight: "1px solid #242436" }}
    >
      <div className="px-6 pt-10 pb-6" style={{ borderBottom: "1px solid #242436" }}>
        <div className="w-10 h-10 rounded-2xl mb-3" style={{ background: "#C96B9E" }} />
        <h2 className="text-xl font-black" style={{ color: "#F2F2FF", letterSpacing: "-0.04em" }}>
          FemWell
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "#4A4A65" }}>
          Your wellness companion
        </p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {FULL_NAV.map(({ label, icon: Icon, page }) => {
          const active = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all"
              style={{
                background: active ? "#C96B9E" : "transparent",
                color: active ? "#fff" : "#4A4A65",
              }}
            >
              <Icon size={17} style={{ color: active ? "#fff" : "#4A4A65" }} />
              <span className="font-semibold text-sm" style={{ color: active ? "#fff" : "#8A8AAA" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4" style={{ borderTop: "1px solid #242436" }}>
        <p className="text-[10px] text-center" style={{ color: "#4A4A65" }}>
          FemWell · Your wellness, your way
        </p>
      </div>
    </aside>
  );
}

export default function FloatingSidebar({ currentPageName, mode = "full" }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const openDrawer = () => setDrawerOpen(true);
    window.addEventListener("open-nav-drawer", openDrawer);
    return () => window.removeEventListener("open-nav-drawer", openDrawer);
  }, []);

  return (
    <>
      {mode === "full" && <DesktopSidebar currentPageName={currentPageName} />}

      {/* Mobile bottom tab bar — 4 tabs */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        style={{
          background: "#13131F",
          borderTop: "1px solid #242436",
          height: 64,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {BOTTOM_NAV.map(({ label, page }) => {
          const active = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              className="flex flex-col items-center gap-1 flex-1 py-2"
              style={{ color: active ? "#C96B9E" : "#4A4A65" }}
            >
              {/* 20x20 placeholder square — Prompt 13 replaces with Phosphor icons */}
              <div
                className="w-5 h-5 rounded-sm"
                style={{ background: active ? "#C96B9E" : "#4A4A65", transition: "background 0.1s" }}
              />
              {active && (
                <span className="text-[11px] font-semibold" style={{ color: "#C96B9E" }}>
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Slide-out full drawer (triggered by open-nav-drawer event) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.6)" }}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col"
              style={{ background: "#13131F", borderRight: "1px solid #242436" }}
            >
              <div
                className="flex items-center justify-between px-6 pt-14 pb-5"
                style={{ borderBottom: "1px solid #242436" }}
              >
                <div>
                  <h2 className="text-xl font-black" style={{ color: "#F2F2FF" }}>
                    FemWell
                  </h2>
                  <p className="text-xs" style={{ color: "#4A4A65" }}>
                    Your wellness companion
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#1C1C2E" }}
                >
                  <X size={16} style={{ color: "#8A8AAA" }} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {FULL_NAV.map(({ label, icon: Icon, page }) => {
                  const active = currentPageName === page;
                  return (
                    <Link
                      key={page}
                      to={createPageUrl(page)}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all"
                      style={{ background: active ? "#C96B9E" : "transparent" }}
                    >
                      <Icon size={17} style={{ color: active ? "#fff" : "#4A4A65" }} />
                      <span className="font-semibold text-sm" style={{ color: active ? "#fff" : "#8A8AAA" }}>
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}