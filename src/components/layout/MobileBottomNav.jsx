import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, BookOpen, Newspaper, Utensils, User } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

function AssistantOrbIcon({ active }) {
  return (
    <div style={{ position: "relative", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes orb-pulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.35);opacity:0.15} }
        @keyframes orb-core { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>
      {active && (
        <div style={{ position: "absolute", inset: -4, borderRadius: "50%", backgroundColor: "var(--rose-dust)", animation: "orb-pulse 2s ease-in-out infinite", pointerEvents: "none" }} />
      )}
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: active
          ? "radial-gradient(circle at 38% 32%, rgba(232,196,208,0.9) 0%, var(--rose-dust) 60%, #8A3858 100%)"
          : "radial-gradient(circle at 38% 32%, rgba(196,132,154,0.4) 0%, rgba(130,70,100,0.3) 100%)",
        animation: active ? "orb-core 2s ease-in-out infinite" : "none",
        boxShadow: active ? "0 0 8px rgba(196,132,154,0.5)" : "none",
      }} />
    </div>
  );
}

export default function MobileBottomNav({ currentPageName }) {
  const [assistantName, setAssistantName] = useState("Assistant");

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      if (!u?.id) return;
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
      if (profiles[0]?.ai_assistant_name) setAssistantName(profiles[0].ai_assistant_name);
    }).catch(() => {});
  }, []);

  const TABS = [
    { label: "Today",     icon: null,     page: "Today",     isOrb: false, IconComp: Sun },
    { label: "Lifestyle", icon: null,     page: "Lifestyle", isOrb: false, IconComp: BookOpen },
    { label: assistantName, icon: null,   page: "Assistant", isOrb: true,  IconComp: null },
    { label: "Nutrition", icon: null,     page: "Nutrition", isOrb: false, IconComp: Utensils },
    { label: "Profile",   icon: null,     page: "Profile",   isOrb: false, IconComp: User },
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
        {TABS.map(({ label, page, isOrb, IconComp }) => {
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
              {isOrb ? (
                <AssistantOrbIcon active={active} />
              ) : (
                <IconComp
                  style={{ width: 22, height: 22, color: active ? "var(--rose-dust)" : "var(--mauve)" }}
                  strokeWidth={active ? 2.5 : 1.5}
                />
              )}
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