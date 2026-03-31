import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { BookOpen, Compass, Map, MessageCircle, Sparkles, Sun, Utensils, X, Zap } from "lucide-react";

const PAGE_META = {
  Today:       { label: "Today" },
  Nutrition:   { label: "Nutrition" },
  ProgramsHub: { label: "Programs" },
  Explore:     { label: "Explore" },
  Lifestyle:   { label: "Lifestyle" },
  Journal:     { label: "Journal" },
  Profile:     { label: "Profile" },
  Assistant:   { label: "Assistant" },
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
        base44.entities.ContentItems.list("-created_date", 40),
      ]);
      const nextProgram = userPrograms
        .filter((e) => e.status === "active" || e.is_saved)
        .sort((a, b) => (b.last_activity_date || "").localeCompare(a.last_activity_date || ""))[0];
      if (nextProgram) {
        const program = programs.find((p) => p.id === nextProgram.program_id);
        if (program?.program_key) {
          setContinueHref(createPageUrl(`ProgramDay?key=${program.program_key}&day=${nextProgram.current_day || 1}`));
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
    { label: continueLabel, href: continueHref, icon: <Map className="h-3.5 w-3.5" /> },
    { label: "1-min reset",  href: resetHref,    icon: <Zap className="h-3.5 w-3.5" /> },
    { label: "Log meal",     href: createPageUrl("Nutrition"), icon: <Utensils className="h-3.5 w-3.5" /> },
    { label: "Write journal",href: createPageUrl("Journal"),   icon: <BookOpen className="h-3.5 w-3.5" /> },
    { label: "Lifestyle",    href: createPageUrl("Lifestyle"), icon: <Compass className="h-3.5 w-3.5" /> },
    { label: "Ask assistant",href: createPageUrl("Assistant"), icon: <MessageCircle className="h-3.5 w-3.5" /> },
  ], [continueHref, continueLabel, resetHref]);

  return (
    <>
      {/* Trigger — small pill, bottom-left, above nav */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-5 z-50 flex items-center gap-1.5 h-9 px-3.5 rounded-full transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          color: "var(--mauve)",
        }}
      >
        <Sparkles className="h-3 w-3" style={{ color: "var(--rose-dust)" }} />
        <span className="text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif", color: "var(--plum)" }}>
          Quick Switch
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: "rgba(42,32,53,0.3)", backdropFilter: "blur(4px)" }}
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl"
              style={{
                backgroundColor: "var(--surface)",
                borderTop: "1px solid var(--border)",
                boxShadow: "var(--shadow-lg)",
                padding: "1.5rem 1.25rem 2rem",
              }}
            >
              <div className="mx-auto max-w-2xl">
                {/* Handle */}
                <div className="w-8 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: "var(--border)" }} />

                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                      Always available
                    </p>
                    <h2 className="text-lg font-semibold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>
                      Quick Switch
                    </h2>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                    style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Shortcuts grid */}
                <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6">
                  {shortcuts.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className="flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-150 text-center"
                      style={{
                        backgroundColor: "var(--ivory)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--plum)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--ivory-dark)"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--ivory)"; }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-xl"
                        style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}
                      >
                        {s.icon}
                      </div>
                      <p className="text-xs font-medium leading-tight" style={{ fontFamily: "'Inter', sans-serif", color: "var(--plum)" }}>
                        {s.label}
                      </p>
                    </a>
                  ))}
                </div>

                {/* Recent pages */}
                {recentPages.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                      Recent
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentPages.filter((p) => PAGE_META[p]).slice(0, 5).map((p) => (
                        <a
                          key={p}
                          href={createPageUrl(p)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: "var(--ivory)",
                            border: "1px solid var(--border)",
                            color: "var(--plum)",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {PAGE_META[p].label}
                        </a>
                      ))}
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