import { Droplets, BookOpen, Utensils, Map, Compass, Activity } from "lucide-react";
import { createPageUrl } from "@/utils";

const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" };

const QUICK_ITEMS = (onCycleClick) => [
  { lab: "Cycle",     Icon: Droplets, action: onCycleClick,                   bg: "var(--rose-dust-subtle)", fg: "var(--rose-dust)" },
  { lab: "Journal",   Icon: BookOpen,  href: createPageUrl("Journal"),          bg: "#E8F4FF",               fg: "#5B9BD5" },
  { lab: "Nutrition", Icon: Utensils,  href: createPageUrl("Nutrition"),        bg: "var(--sage-subtle)",    fg: "var(--sage)" },
  { lab: "Programs",  Icon: Map,       href: createPageUrl("ProgramsHub"),      bg: "var(--ivory-dark)",     fg: "var(--mauve)" },
  { lab: "Explore",   Icon: Compass,   href: createPageUrl("Explore"),          bg: "var(--ivory-dark)",     fg: "var(--mauve)" },
  { lab: "Pulse",     Icon: Activity,  href: createPageUrl("Pulse"),            bg: "var(--rose-dust-subtle)", fg: "var(--rose-dust)" },
];

export default function QuickAccessGrid({ onCycleClick }) {
  const items = QUICK_ITEMS(onCycleClick);
  return (
    <div style={{ marginBottom: "16px" }}>
      <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", marginBottom: "12px" }}>
        Quick access
      </p>
      <div className="grid grid-cols-3 gap-3">
        {items.map((a) => {
          const inner = (
            <>
              <div style={{ width: "36px", height: "36px", borderRadius: "12px", backgroundColor: a.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <a.Icon className="w-4 h-4" style={{ color: a.fg }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--plum)", textAlign: "center" }}>{a.lab}</p>
            </>
          );
          return a.href ? (
            <a key={a.lab} href={a.href} className="flex flex-col items-center rounded-[20px] p-4 text-center block" style={{ ...card, textDecoration: "none" }}>
              {inner}
            </a>
          ) : (
            <button key={a.lab} onClick={a.action} className="flex flex-col items-center rounded-[20px] p-4 text-center w-full" style={card}>
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}