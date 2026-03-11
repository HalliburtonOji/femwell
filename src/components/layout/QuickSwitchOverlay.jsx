import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { BookOpen, Compass, Map, MessageCircle, Sparkles, Sun, Utensils, X, Zap } from "lucide-react";

const PAGE_META = {
  Today: { label: "Today", emoji: "🌅" },
  Nutrition: { label: "Nutrition", emoji: "🍽️" },
  ProgramsHub: { label: "Programs", emoji: "🗺️" },
  Explore: { label: "Explore", emoji: "✨" },
  Lifestyle: { label: "Lifestyle", emoji: "📖" },
  Journal: { label: "Journal", emoji: "📓" },
  Profile: { label: "Profile", emoji: "👤" },
  Assistant: { label: "Assistant", emoji: "🪄" },
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
    const next = [currentPageName, ...existing.filter((page) => page !== currentPageName)].slice(0, 6);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setRecentPages(next.filter((page) => page !== currentPageName));
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
        .filter((entry) => entry.status === "active" || entry.is_saved)
        .sort((a, b) => (b.last_activity_date || "").localeCompare(a.last_activity_date || "") || (b.current_day || 1) - (a.current_day || 1))[0];

      if (nextProgram) {
        const program = programs.find((item) => item.id === nextProgram.program_id);
        if (program?.program_key) {
          setContinueHref(createPageUrl(`ProgramDay?key=${program.program_key}&day=${nextProgram.current_day || 1}`));
          setContinueLabel(`Day ${nextProgram.current_day || 1}`);
        }
      }

      const resetItem = contentItems
        .filter((item) => ["BREATHWORK", "MEDITATION"].includes(item.content_type))
        .sort((a, b) => (a.duration_minutes || 99) - (b.duration_minutes || 99))[0];

      if (resetItem?.content_key) {
        setResetHref(createPageUrl(`ContentPlayer?key=${resetItem.content_key}`));
      }
    })();
  }, []);

  const shortcuts = useMemo(
    () => [
      { label: continueLabel, href: continueHref, icon: <Map className="h-4 w-4 text-rose-500" />, tone: "bg-rose-50 text-rose-700" },
      { label: "1-minute reset", href: resetHref, icon: <Zap className="h-4 w-4 text-amber-500" />, tone: "bg-amber-50 text-amber-700" },
      { label: "Log meal", href: createPageUrl("Nutrition"), icon: <Utensils className="h-4 w-4 text-emerald-500" />, tone: "bg-emerald-50 text-emerald-700" },
      { label: "Write journal", href: createPageUrl("Journal"), icon: <BookOpen className="h-4 w-4 text-sky-500" />, tone: "bg-sky-50 text-sky-700" },
      { label: "Open lifestyle", href: createPageUrl("Lifestyle"), icon: <Compass className="h-4 w-4 text-violet-500" />, tone: "bg-violet-50 text-violet-700" },
      { label: "Ask assistant", href: createPageUrl("Assistant"), icon: <MessageCircle className="h-4 w-4 text-fuchsia-500" />, tone: "bg-fuchsia-50 text-fuchsia-700" },
    ],
    [continueHref, continueLabel, resetHref]
  );

  const pinnedActions = [
    { label: "Start day", href: createPageUrl("Today") },
    { label: "Programs", href: createPageUrl("ProgramsHub") },
    { label: "Explore", href: createPageUrl("Explore") },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-5 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-white/92 px-4 shadow-xl ring-1 ring-rose-100 backdrop-blur-xl transition-transform active:scale-95"
      >
        <Sparkles className="h-4 w-4 text-rose-500" />
        <span className="text-sm font-semibold text-gray-700">Quick Switch</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-white p-5 shadow-2xl"
            >
              <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Always available</p>
                    <h2 className="text-xl font-bold text-gray-900">Quick Switch</h2>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {shortcuts.map((shortcut) => (
                    <a
                      key={shortcut.label}
                      href={shortcut.href}
                      className={`rounded-3xl p-4 shadow-sm ${shortcut.tone}`}
                    >
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
                        {shortcut.icon}
                      </div>
                      <p className="text-sm font-semibold">{shortcut.label}</p>
                    </a>
                  ))}
                </div>

                {recentPages.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Recent pages</p>
                    <div className="flex flex-wrap gap-2">
                      {recentPages.filter((page) => PAGE_META[page]).slice(0, 5).map((page) => (
                        <a
                          key={page}
                          href={createPageUrl(page)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-gray-700"
                        >
                          <span>{PAGE_META[page].emoji}</span>
                          {PAGE_META[page].label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Pinned actions</p>
                  <div className="flex flex-wrap gap-2">
                    {pinnedActions.map((action) => (
                      <a
                        key={action.label}
                        href={action.href}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
                      >
                        <Sun className="h-3.5 w-3.5 text-rose-500" />
                        {action.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}