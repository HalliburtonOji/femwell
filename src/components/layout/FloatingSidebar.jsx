import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Compass, User, BookOpen, Newspaper, Utensils, X, Menu, Map, Sparkles
} from "lucide-react";

const NAV = [
  { label: "Today",     icon: Sun,       page: "Today" },
  { label: "Nutrition", icon: Utensils,  page: "Nutrition" },
  { label: "Programs",  icon: Map,       page: "ProgramsHub" },
  { label: "Explore",   icon: Compass,   page: "Explore" },
  { label: "Lifestyle", icon: BookOpen,  page: "Lifestyle" },
  { label: "Journal",   icon: Newspaper, page: "Journal" },
  { label: "Assistant", icon: Sparkles,  page: "Assistant" },
  { label: "Profile",   icon: User,      page: "Profile" },
];

/* ── Desktop sidebar ───────────────────────────────────────────────────────── */
function DesktopSidebar({ currentPageName }) {
  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 z-30"
      style={{
        backgroundColor: "var(--surface)",
        borderRight: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Brand */}
      <div className="px-7 pt-10 pb-7" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}
        >
          <span style={{ color: "var(--rose-dust)", fontSize: "1.1rem", fontWeight: 600, fontFamily: "serif" }}>F</span>
        </div>
        <h2
          className="text-xl font-bold leading-tight"
          style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}
        >
          FemWell
        </h2>
        <p className="text-xs mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
          Private wellness
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, icon: Icon, page }) => {
          const active = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 group"
              style={{
                backgroundColor: active ? "var(--plum)" : "transparent",
                color: active ? "white" : "var(--mauve)",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "var(--ivory-dark)"; e.currentTarget.style.color = "var(--plum)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--mauve)"; }}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />
              <span className="font-medium text-sm" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.005em" }}>
                {label}
              </span>
              {active && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-7 py-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <p className="text-xs" style={{ color: "var(--mauve-light)", fontFamily: "'Inter', sans-serif" }}>
          FemWell · Your wellness, your way
        </p>
      </div>
    </aside>
  );
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */
export default function FloatingSidebar({ currentPageName, mode = "full" }) {
  const [open, setOpen] = useState(false);
  const currentNav = NAV.find((n) => n.page === currentPageName);
  const CurrentIcon = currentNav?.icon;

  useEffect(() => {
    const openDrawer = () => setOpen(true);
    window.addEventListener("open-nav-drawer", openDrawer);
    return () => window.removeEventListener("open-nav-drawer", openDrawer);
  }, []);

  return (
    <>
      {mode === "full" && <DesktopSidebar currentPageName={currentPageName} />}

      {/* Mobile trigger — subtle pill bottom right */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-6 right-5 z-50 flex items-center gap-2 h-12 px-4 rounded-full transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: open ? "var(--plum)" : "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          color: open ? "white" : "var(--plum)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && currentNav && (
          <span className="text-xs font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
            {currentNav.label}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(42,32,53,0.35)", backdropFilter: "blur(4px)" }}
            />

            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 340 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                backgroundColor: "var(--surface)",
                borderRight: "1px solid var(--border)",
                boxShadow: "var(--shadow-lg)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
            >
              <div className="px-7 pt-14 pb-7" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}
                >
                  <span style={{ color: "var(--rose-dust)", fontSize: "1.1rem", fontWeight: 600, fontFamily: "serif" }}>F</span>
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}
                >
                  FemWell
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--mauve)" }}>Private wellness</p>
              </div>

              <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
                {NAV.map(({ label, icon: Icon, page }) => {
                  const active = currentPageName === page;
                  return (
                    <Link
                      key={page}
                      to={createPageUrl(page)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-150"
                      style={{
                        backgroundColor: active ? "var(--plum)" : "transparent",
                        color: active ? "white" : "var(--mauve)",
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2 : 1.5} />
                      <span className="font-medium text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-7 py-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <p className="text-xs" style={{ color: "var(--mauve-light)" }}>FemWell · Your wellness, your way</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}