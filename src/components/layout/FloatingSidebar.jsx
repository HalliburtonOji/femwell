import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Compass, User, BookOpen, Newspaper, Utensils, X, Menu } from "lucide-react";

const NAV = [
  { label: "Today", icon: Sun, page: "Today", emoji: "🌅" },
  { label: "Nutrition", icon: Utensils, page: "Nutrition", emoji: "🍽️" },
  { label: "Lifestyle", icon: BookOpen, page: "Lifestyle", emoji: "📖" },
  { label: "Explore", icon: Compass, page: "Explore", emoji: "✨" },
  { label: "Journal", icon: Newspaper, page: "Journal", emoji: "📓" },
  { label: "Profile", icon: User, page: "Profile", emoji: "👤" },
];

export default function FloatingSidebar({ currentPageName }) {
  const [open, setOpen] = useState(false);

  const currentNav = NAV.find((n) => n.page === currentPageName);

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl flex items-center justify-center text-white active:scale-95 transition-transform"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="menu"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Current page indicator pill (when sidebar closed) */}
      <AnimatePresence>
        {!open && currentNav && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-8 right-[76px] z-40 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 pointer-events-none"
          >
            <span className="text-sm">{currentNav.emoji}</span>
            <span className="text-xs font-semibold text-gray-700">{currentNav.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed top-0 left-0 bottom-0 z-40 w-72 bg-white/96 backdrop-blur-xl shadow-2xl flex flex-col"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              {/* Header */}
              <div className="px-6 pt-14 pb-5 border-b border-rose-50">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-2xl mb-3 shadow-sm">
                  🌸
                </div>
                <h2 className="text-xl font-black text-rose-900">FemWell</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your wellness companion</p>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV.map(({ label, icon: Icon, page, emoji }) => {
                  const active = currentPageName === page;
                  return (
                    <Link
                      key={page}
                      to={createPageUrl(page)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all ${
                        active
                          ? "bg-rose-500 text-white shadow-sm"
                          : "text-gray-600 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      <span className="text-xl w-6 text-center">{emoji}</span>
                      <span className="font-semibold text-sm">{label}</span>
                      {active && <div className="ml-auto w-2 h-2 rounded-full bg-white/60" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-rose-50">
                <p className="text-[10px] text-gray-300 text-center">FemWell · Your wellness, your way 🌸</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}