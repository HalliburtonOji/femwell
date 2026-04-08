import { Link } from "react-router-dom";
import { Sun, BookOpen, Newspaper, Utensils, User } from "lucide-react";
import { createPageUrl } from "@/utils";

const TABS = [
  { label: "Today",     icon: Sun,       page: "Today"     },
  { label: "Lifestyle", icon: BookOpen,  page: "Lifestyle" },
  { label: "Journal",   icon: Newspaper, page: "Journal"   },
  { label: "Nutrition", icon: Utensils,  page: "Nutrition" },
  { label: "Profile",   icon: User,      page: "Profile"   },
];

export default function MobileBottomNav({ currentPageName }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        backgroundColor: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 6px" }}>
        {TABS.map(({ label, icon: Icon, page }) => {
          const active = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 3, padding: "4px 10px", textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
                userSelect: "none",
              }}
            >
              <Icon
                style={{ width: 22, height: 22, color: active ? "var(--rose-dust)" : "var(--mauve)" }}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? "var(--rose-dust)" : "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
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