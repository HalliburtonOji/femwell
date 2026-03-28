import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { BookOpen, Compass, Map, MessageCircle, Sparkles, Sun, Utensils, X, Zap, Newspaper } from "lucide-react";

const PAGE_META = {
  Today:      { label: "Today",     icon: Sun },
  Nutrition:  { label: "Nutrition", icon: Utensils },
  ProgramsHub:{ label: "Programs",  icon: Map },
  Explore:    { label: "Explore",   icon: Compass },
  Lifestyle:  { label: "Lifestyle", icon: BookOpen },
  Journal:    { label: "Journal",   icon: Newspaper },
  Assistant:  { label: "Assistant", icon: Sparkles },
};

export default function QuickSwitchOverlay({ currentPageName }) {
  const [open, setOpen] = useState(false);
  const [recentPages, setRecentPages] = useState([]);
  const [continueHref, setContinueHref] = useState(createPageUrl("ProgramsHub"));
  const [continueLabel, setContinueLabel] = useState("Continue Program");
  const [resetHref, setResetHref] = useState(createPageUrl("Explore"));

  useEffect(() => {
    const storageKey = "quick_switch_recent_pages";
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const next = [currentPageName, ...existing.filter((p) => p !== currentPageName)].slice(0, 6);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setRecentPages(next.filter((p) => p !== currentPageName));
  }, [currentPageName]);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return;
      const [programs, userPrograms, contentItems] = await Promise.all([
        base44.entities.Programs.list("-created_date", 50),
        base44.entities.UserPrograms.filter({ user_id: user.id }),
        base44.entities.ContentItems.list("-created_date", 120),
      ]);
      const nextProgram = userPrograms
        .filter((e) => e.status === "active" || e.is_saved)
        .sort((a, b) => (b.last_activity_date || "").localeCompare(a.last_activity_date || ""))[0];
      if (nextProgram) {
        const prog = programs.find((p) => p.id === nextProgram.program_id);
        if (prog?.program_key) {
          setContinueHref(createPageUrl(`ProgramDay?key=${prog.program_key}&day=${nextProgram.current_day || 1}`));
          setContinueLabel(`Day ${nextProgram.current_day || 1}`);
        }
      }
      const resetItem = contentItems
        .filter((i) => ["BREATHWORK", "MEDITATION"].includes(i.content_type))
        .sort((a, b) => (a.duration_minutes || 99) - (b.duration_minutes || 99))[0];
      if (resetItem?.content_key) setResetHref(createPageUrl(`ContentPlayer?key=${resetItem.content_key}`));
    })();
  }, []);

  const shortcuts = useMemo(() => [
    { label: continueLabel, href: continueHref, icon: Map, color: "#C96B9E" },
    { label: "1-min reset",  href: resetHref,    icon: Zap, color: "#E8B84B" },
    { label: "Log meal",     href: createPageUrl("Nutrition"), icon: Utensils, color: "#4ABFA3" },
    { label: "Journal",      href: createPageUrl("Journal"),   icon: BookOpen, color: "#7C6AF5" },
    { label: "Lifestyle",    href: createPageUrl("Lifestyle"),  icon: Compass,  color: "#E8956D" },
    { label: "Assistant",    href: createPageUrl("Assistant"),  icon: MessageCircle, color: "#9B8AE0" },
  ], [continueHref, continueLabel, resetHref]);

  return (
    <>
      {/* Compact trigger pill — sits above bottom nav on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed z-40 flex items-center gap-1.5 transition-all active:scale-95"
        style={{
          bottom: "calc(72px + env(safe-area-inset-bottom, 0px) + 10px)",
          right: 16,
          background: "#1C1C2E",
          border: "1px solid #2E2E45",
          borderRadius: 999,
          padding: "8px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <Zap style={{ width: 13, height: 13, color: "#C96B9E" }} />
        <span className="text-xs font-semibold" style={{ color: "#8A8AAA" }}>Quick</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="fixed inset-x-0 z-50 mx-auto"
              style={{
                bottom: "calc(72px + env(safe-area-inset-bottom, 0px) + 8px)",
                maxWidth: 420,
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(100% - 32px)",
              }}
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: "#1C1C2E", border: "1px solid #2E2E45" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3"
                  style={{ borderBottom: "1px solid #242436" }}>
                  <p className="text-sm font-bold" style={{ color: "#F2F2FF" }}>Quick Switch</p>
                  <button onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "#242436" }}>
                    <X style={{ width: 13, height: 13, color: "#8A8AAA" }} />
                  </button>
                </div>

                {/* Shortcuts grid */}
                <div className="grid grid-cols-3 gap-2 p-3">
                  {shortcuts.map(({ label, href, icon: Icon, color }) => (
                    <a key={label} href={href} onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-2 rounded-2xl py-3 px-2 transition-all active:scale-95"
                      style={{ background: "#13131F" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}20` }}>
                        <Icon style={{ width: 16, height: 16, color }} />
                      </div>
                      <span className="text-[11px] font-medium text-center leading-tight"
                        style={{ color: "#8A8AAA" }}>{label}</span>
                    </a>
                  ))}
                </div>

                {/* Recent pages */}
                {recentPages.filter((p) => PAGE_META[p]).length > 0 && (
                  <div className="px-3 pb-3">
                    <p className="text-[10px] uppercase font-semibold mb-2 px-1"
                      style={{ color: "#4A4A65", letterSpacing: "0.1em" }}>Recent</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentPages.filter((p) => PAGE_META[p]).slice(0, 4).map((page) => {
                        const { label, icon: Icon } = PAGE_META[page];
                        return (
                          <a key={page} href={createPageUrl(page)} onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
                            style={{ background: "#242436", color: "#8A8AAA" }}>
                            <Icon style={{ width: 11, height: 11 }} />
                            {label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}