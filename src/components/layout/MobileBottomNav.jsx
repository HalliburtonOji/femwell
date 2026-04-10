import { Link } from "react-router-dom";
import { Sun, BookOpen, Utensils, User, Menu } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function MobileBottomNav({ currentPageName }) {
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
      <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 6px" }}>
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