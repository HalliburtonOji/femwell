import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, BookOpen, Utensils, User, Menu } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function MobileBottomNav({ currentPageName }) {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    base44.auth.me().then(u => { if (u?.id) setUserId(u.id); }).catch(() => {});
  }, []);
  const TABS = [
    { label: "Today",     page: "Today",     IconComp: Sun      },
    { label: "Lifestyle", page: "Lifestyle", IconComp: BookOpen },
    { label: "menu",      page: null,        IconComp: Menu,    isMenu: true },
    { label: "Nutrition", page: "Nutrition", IconComp: Utensils },
    { label: "Profile",   page: "Profile",   IconComp: User     },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        backgroundColor: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 6px" }}>
        {userId && <div style={{ paddingBottom: 2 }}><NotificationBell userId={userId} /></div>}
        {TABS.map(({ label, page, IconComp, isMenu }) => {
          if (isMenu) {
            return (
              <button
                key="menu"
                onClick={() => window.dispatchEvent(new Event('open-nav-drawer'))}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 3, padding: "4px 10px", background: "none", border: "none",
                  cursor: "pointer", WebkitTapHighlightColor: "transparent", userSelect: "none",
                }}
              >
                <IconComp style={{ width: 22, height: 22, color: "var(--mauve)" }} strokeWidth={1.5} />
                <span style={{ fontSize: 10, fontWeight: 500, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Menu</span>
              </button>
            );
          }
          const active = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 3, padding: "4px 10px", textDecoration: "none",
                WebkitTapHighlightColor: "transparent", userSelect: "none",
              }}
            >
              <IconComp
                style={{ width: 22, height: 22, color: active ? "var(--rose-dust)" : "var(--mauve)" }}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? "var(--rose-dust)" : "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
                maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}