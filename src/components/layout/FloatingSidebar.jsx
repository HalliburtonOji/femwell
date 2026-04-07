import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Compass, User, BookOpen, Newspaper, Utensils, X, Map, Activity, Feather, Sparkles, Heart
} from "lucide-react";

const NAV = [
  { label: "Today",     icon: Sun,       page: "Today" },
  { label: "Nutrition", icon: Utensils,  page: "Nutrition" },
  { label: "Programs",  icon: Map,       page: "ProgramsHub" },
  { label: "Explore",   icon: Compass,   page: "Explore" },
  { label: "Lifestyle", icon: BookOpen,  page: "Lifestyle" },
  { label: "Journal",   icon: Newspaper, page: "Journal" },
  { label: "Pulse",     icon: Activity,  page: "Pulse" },
  { label: "Skin & Hair", icon: Feather,  page: "SkinHair" },
  { label: "Life Stage", icon: Heart,    page: "LifeStageCare" },
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

const QUICK_ACTIONS = [
  { label: "Nutrition",  sub: "Log a meal",       icon: Utensils,  page: "Nutrition" },
  { label: "Journal",   sub: "Write a note",      icon: Newspaper, page: "Journal" },
  { label: "Lifestyle", sub: "Your feed",          icon: BookOpen,  page: "Lifestyle" },
  { label: "Assistant", sub: "Ask your guide",     icon: Sparkles,  page: "Assistant" },
];

/* ── Mobile ─────────────────────────────────────────────────────────────────── */
export default function FloatingSidebar({ currentPageName, mode = "full" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openDrawer = () => setOpen(true);
    window.addEventListener("open-nav-drawer", openDrawer);
    return () => window.removeEventListener("open-nav-drawer", openDrawer);
  }, []);

  return (
    <>
      {mode === "full" && <DesktopSidebar currentPageName={currentPageName} />}

      {/* Mobile FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed z-50 flex items-center justify-center"
        style={{
          bottom: 24, right: 20,
          width: 52, height: 52, borderRadius: 9999,
          backgroundColor: open ? "var(--plum)" : "var(--surface)",
          border: open ? "none" : "1px solid var(--border)",
          boxShadow: open ? "0 8px 28px rgba(42,32,53,0.28)" : "var(--shadow-md)",
          color: open ? "white" : "var(--plum)",
        }}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(6px)" }}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 overflow-y-auto"
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: "28px 28px 0 0",
                maxHeight: "88vh",
                boxShadow: "var(--shadow-lg)",
                paddingBottom: "env(safe-area-inset-bottom, 16px)",
              }}
            >
              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 8 }}>
                <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
              </div>

              <div style={{ padding: "8px 16px 20px" }}>
                {/* Section: Quick actions */}
                <p style={{ fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Quick actions</p>

                {/* Log today — full width */}
                <Link
                  to={createPageUrl("Today") + "?open_log=1"}
                  onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 14, borderRadius: 18, padding: "16px 18px", backgroundColor: "var(--plum)", textDecoration: "none", marginBottom: 10 }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Sun className="w-5 h-5" style={{ color: "white" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>Log today</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "'Inter', sans-serif" }}>Check in, meals, symptoms</p>
                  </div>
                </Link>

                {/* 2-col grid of 4 quick links */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {QUICK_ACTIONS.map(({ label, sub, icon: Icon, page }) => (
                    <Link
                      key={page}
                      to={createPageUrl(page)}
                      onClick={() => setOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 16, padding: "12px 14px", backgroundColor: "var(--ivory)", border: "1px solid var(--border)", textDecoration: "none" }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{label}</p>
                        <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: "var(--border-subtle)", marginBottom: 14 }} />

                {/* Section: Navigate */}
                <p style={{ fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Navigate</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {NAV.map(({ label, icon: Icon, page }) => {
                    const active = currentPageName === page;
                    return (
                      <Link
                        key={page}
                        to={createPageUrl(page)}
                        onClick={() => setOpen(false)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                          borderRadius: 14, padding: "12px 8px",
                          backgroundColor: active ? "var(--plum)" : "var(--ivory)",
                          border: `1px solid ${active ? "var(--plum)" : "var(--border)"}`,
                          textDecoration: "none",
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: active ? "white" : "var(--mauve)" }} strokeWidth={active ? 2 : 1.5} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: active ? "white" : "var(--mauve)", fontFamily: "'Inter', sans-serif", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}