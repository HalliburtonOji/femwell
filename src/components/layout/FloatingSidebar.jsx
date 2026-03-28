import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Compass, User, BookOpen, Newspaper, Utensils, X, MoreHorizontal,
  Map, Sparkles, Activity, ChevronRight
} from "lucide-react";

const PRIMARY_NAV = [
  { label: "Today",     icon: Sun,       page: "Today" },
  { label: "Explore",   icon: Compass,   page: "Explore" },
  { label: "Programs",  icon: Map,       page: "ProgramsHub" },
  { label: "Journal",   icon: Newspaper, page: "Journal" },
  { label: "Me",        icon: User,      page: "Profile" },
];

const MORE_NAV = [
  { label: "Nutrition",  icon: Utensils,  page: "Nutrition" },
  { label: "Lifestyle",  icon: BookOpen,  page: "Lifestyle" },
  { label: "Assistant",  icon: Sparkles,  page: "Assistant" },
];

const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];

/* ── Desktop sidebar ─────────────────────────────────────────── */
function DesktopSidebar({ currentPageName }) {
  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 z-30"
      style={{ background: "#13131F", borderRight: "1px solid #242436" }}>
      <div className="px-6 pt-10 pb-6" style={{ borderBottom: "1px solid #242436" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, #C96B9E, #7C6AF5)" }}>
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-black" style={{ color: "#F2F2FF" }}>FemWell</h2>
        <p className="text-xs mt-0.5" style={{ color: "#4A4A65" }}>Your wellness companion</p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {ALL_NAV.map(({ label, icon: Icon, page }) => {
          const active = currentPageName === page;
          return (
            <Link key={page} to={createPageUrl(page)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group"
              style={{
                background: active ? "rgba(201,107,158,0.15)" : "transparent",
                color: active ? "#C96B9E" : "#8A8AAA",
              }}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              <span className="font-medium text-sm">{label}</span>
              {active && <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4" style={{ borderTop: "1px solid #242436" }}>
        <p className="text-[10px] text-center" style={{ color: "#2E2E45" }}>FemWell · Your wellness, your way</p>
      </div>
    </aside>
  );
}

/* ── Mobile bottom tab bar ───────────────────────────────────── */
export default function FloatingSidebar({ currentPageName, mode = "full" }) {
  const [showMore, setShowMore] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Collapse on scroll down, reveal on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 8) setVisible(false);
      else if (y < lastScrollY.current - 8) setVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Listen for programmatic open
  useEffect(() => {
    const openDrawer = () => setShowMore(true);
    window.addEventListener("open-nav-drawer", openDrawer);
    return () => window.removeEventListener("open-nav-drawer", openDrawer);
  }, []);

  return (
    <>
      {mode === "full" && <DesktopSidebar currentPageName={currentPageName} />}

      {/* More drawer backdrop */}
      <AnimatePresence>
        {showMore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* More drawer — slides up from above the bottom bar */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="lg:hidden fixed z-40 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              bottom: "calc(72px + env(safe-area-inset-bottom, 0px) + 8px)",
              left: "50%", transform: "translateX(-50%)",
              background: "#1C1C2E",
              border: "1px solid #2E2E45",
              minWidth: 220,
            }}
          >
            {MORE_NAV.map(({ label, icon: Icon, page }) => {
              const active = currentPageName === page;
              return (
                <Link key={page} to={createPageUrl(page)} onClick={() => setShowMore(false)}
                  className="flex items-center gap-3 px-5 py-3.5 transition-all"
                  style={{ color: active ? "#C96B9E" : "#8A8AAA", borderBottom: "1px solid #242436" }}>
                  <Icon style={{ width: 18, height: 18 }} />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <motion.div
        animate={{ y: visible ? 0 : 80 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch"
        style={{
          height: "calc(64px + env(safe-area-inset-bottom, 0px))",
          background: "#13131F",
          borderTop: "1px solid #242436",
        }}
      >
        <div className="flex flex-1 items-center justify-around px-1"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {PRIMARY_NAV.map(({ label, icon: Icon, page }) => {
            const active = currentPageName === page;
            return (
              <Link key={page} to={createPageUrl(page)}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95"
                style={{ color: active ? "#C96B9E" : "#4A4A65" }}>
                <Icon style={{ width: 20, height: 20 }} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium"
                  style={{ color: active ? "#C96B9E" : "#4A4A65" }}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95"
            style={{ color: showMore ? "#C96B9E" : "#4A4A65" }}>
            <MoreHorizontal style={{ width: 20, height: 20 }} strokeWidth={showMore ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium" style={{ color: showMore ? "#C96B9E" : "#4A4A65" }}>
              More
            </span>
          </button>
        </div>
      </motion.div>
    </>
  );
}