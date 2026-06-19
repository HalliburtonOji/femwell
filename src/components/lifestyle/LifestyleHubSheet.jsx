// LifestyleHubSheet — the universal "Jump to" switcher for the Lifestyle hub.
//
// Mirrors JournalHubSheet / NutritionHubSheet exactly (the app-wide jump-to pattern):
// a bottom-sheet with a "Discover / Jump to" header, a 2-col grid of destinations
// (icon + label + one-line sub), Editorial cream/plum tokens, useEscape, scroll-lock,
// and onSelect(id) → close. Destinations = the Lifestyle tabs (For You / Read / Listen /
// Daily Story / Horoscope); onSelect(id) calls the page's setTab(id).
//
// Props: { open, onClose, onSelect }
import { X, Sparkles, BookOpen, Headphones, Feather, Moon, Book } from "lucide-react";
import { T, UI, HAND, PRESS, useEscape } from "../journal/Editorial";
import { useScrollLock } from "@/utils/useScrollLock";

const DESTINATIONS = [
  { id: "for_you",     icon: Sparkles,   label: "For You",     sub: "Picked for your day" },
  { id: "read",        icon: BookOpen,   label: "Read",        sub: "Essays & long reads" },
  { id: "listen",      icon: Headphones, label: "Listen",      sub: "Podcasts & audio" },
  { id: "books",       icon: Book,       label: "Books",       sub: "Read along, chapter by chapter" },
  { id: "daily_story", icon: Feather,    label: "Daily Story", sub: "Today's chapter" },
  { id: "horoscope",   icon: Moon,       label: "Horoscope",   sub: "Your sky tonight" },
];

export default function LifestyleHubSheet({ open, onClose, onSelect }) {
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
        role="dialog" aria-modal="true" aria-label="Lifestyle menu"
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
          paddingBottom: "var(--fw-sheet-safe)",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, paddingBottom: 14,
          borderBottom: `1px solid ${T.paperDeep}`,
        }}>
          <div>
            <div style={{
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", color: T.muted, marginBottom: 2,
            }}>Discover</div>
            <div style={{
              fontFamily: HAND, fontSize: 24, fontWeight: 700, color: T.ink, textShadow: PRESS,
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
                  fontFamily: HAND, fontWeight: 700, fontSize: 18,
                  color: T.ink, textShadow: PRESS, marginBottom: 2, lineHeight: 1.2,
                }}>{a.label}</div>
                <div style={{
                  fontFamily: UI, fontSize: 12, color: T.muted,
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
