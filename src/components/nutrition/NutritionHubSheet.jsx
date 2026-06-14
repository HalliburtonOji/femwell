// NutritionHubSheet — the universal "Jump to" switcher for the Nutrition hub.
//
// Mirrors src/components/journal/JournalHubSheet.jsx exactly: a bottom-sheet with a
// "Your Nutrition / Jump to" header, a 2-col grid of destinations (icon + label +
// one-line sub), Editorial cream/plum tokens, useEscape, and onSelect(id) → close.
//
// Destinations mirror the hub's SURFACES (Log, Today, My Plan, Recipes, AI Plan,
// Shop, Progress, Insights). onSelect(id) lets the hub open that surface's sheet.
//
// Props: { open, onClose, onSelect }
import {
  X, UtensilsCrossed, Target, BookOpen, CalendarDays,
  ShoppingBasket, TrendingUp, Sparkles,
} from "lucide-react";
import { T, UI, HAND, PRESS, useEscape } from "../journal/Editorial";
import { useScrollLock } from "@/utils/useScrollLock";

// Destinations = the hub's SURFACES, each with icon + label + a one-line sub.
const DESTINATIONS = [
  { id: "log",      icon: UtensilsCrossed, label: "Log",      sub: "Add a meal in seconds" },
  { id: "today",    icon: UtensilsCrossed, label: "Today",    sub: "Your plate so far" },
  { id: "plan",     icon: Target,          label: "My Plan",  sub: "A guide, never a cap" },
  { id: "recipes",  icon: BookOpen,        label: "Recipes",  sub: "Cook what you have in" },
  { id: "mealgen",  icon: CalendarDays,    label: "AI Plan",  sub: "A gentle week" },
  { id: "shopping", icon: ShoppingBasket,  label: "Shop",     sub: "Sorted by aisle" },
  { id: "progress", icon: TrendingUp,      label: "Progress", sub: "Patterns, not scores" },
  { id: "insights", icon: Sparkles,        label: "Insights", sub: "Nourishment for your stage" },
];

export default function NutritionHubSheet({ open, onClose, onSelect }) {
  useEscape(open ? onClose : null);
  useScrollLock(open);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(51,41,28,0.45)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-label="Nutrition menu"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.paperHi,
          width: "100%",
          borderRadius: "18px 18px 0 0",
          padding: "20px 16px 36px",
          maxHeight: "82vh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(36px + env(safe-area-inset-bottom, 0))",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, paddingBottom: 14,
          borderBottom: `1px solid ${T.paperDeep}`,
        }}>
          <div>
            <div style={{
              fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", color: T.muted, marginBottom: 2,
            }}>Your Nutrition</div>
            <div style={{
              fontFamily: HAND, fontSize: 22, fontWeight: 700, color: T.ink, textShadow: PRESS,
            }}>Jump to</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: T.muted, padding: 4, display: "inline-flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Destination grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {DESTINATIONS.map((a) => {
            const Ic = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => { onSelect(a.id); onClose(); }}
                style={{
                  background: T.paperHi, border: `1px solid ${T.paperDeep}`,
                  borderRadius: 12, padding: "16px 14px",
                  textAlign: "left", cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Ic size={20} style={{ color: T.gold }} />
                </div>
                <div style={{
                  fontFamily: HAND, fontWeight: 700, fontSize: 17,
                  color: T.ink, textShadow: PRESS, marginBottom: 2, lineHeight: 1.2,
                }}>{a.label}</div>
                <div style={{
                  fontFamily: UI, fontSize: 11, color: T.muted,
                  lineHeight: 1.4,
                }}>{a.sub}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
