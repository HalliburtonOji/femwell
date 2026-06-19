import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, BookOpen, User, Menu, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import MenuSheet from "@/components/layout/MenuSheet";

// Slot order (left → right): Today · Lifestyle · Jess heart · Profile · Menu.
// Four calm destinations + the centre heart + the "More" door (Menu) — the
// overflow sections live behind Menu, never a sideways-scrolling bar.
const SLOTS = [
  { kind: "link", label: "Today",     page: "Today",     icon: Sun },
  { kind: "link", label: "Lifestyle", page: "Lifestyle", icon: BookOpen },
  { kind: "fab",  label: "Jess",      icon: Sparkles },
  { kind: "link", label: "Profile",   page: "Profile",   icon: User },
  { kind: "menu", label: "Menu",      icon: Menu },
];

// Capsule shrinks to this scale on scroll-down. 0.8 = 20% smaller, the gentle
// end of the 20–30% brief. Tap targets are 56px at full size → 44.8px shrunk,
// so every target stays ≥ the 44px WCAG/HIG floor even when compact.
const COMPACT_SCALE = 0.8;
// Require a deliberate scroll delta before toggling so micro-scrolls never
// make the capsule flap (the jitter the plan warns about).
const SCROLL_THRESHOLD = 14;

const labelStyle = (active) => ({
  fontSize: 12,
  fontWeight: active ? 600 : 500,
  color: active ? "var(--plum-deep)" : "var(--plum-mute)",
  marginTop: 2,
  lineHeight: 1,
});

export default function MobileBottomNav({ currentPageName }) {
  useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const menuButtonRef = useRef(null);

  const handleJessTap = () => {
    // Open existing assistant overlay (Layout listens for this event)
    window.dispatchEvent(new CustomEvent("fw_open_assistant"));
  };

  // Honour prefers-reduced-motion: when set, the capsule never shrinks and the
  // size transition is disabled (Material: don't auto-move chrome for these users).
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Shrink-on-scroll-down / restore-on-scroll-up. rAF-throttled, passive listener,
  // anchored last-position so only a deliberate delta flips state. Snaps to full
  // at the very top. Skipped entirely under reduced motion.
  useEffect(() => {
    if (reduceMotion) {
      setCompact(false);
      return;
    }
    let lastY = window.scrollY || 0;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY || 0);
        if (y <= 8) {
          setCompact(false);          // always full at the top of the page
          lastY = y;
        } else {
          const dy = y - lastY;
          if (dy > SCROLL_THRESHOLD) { setCompact(true); lastY = y; }       // scrolling down
          else if (dy < -SCROLL_THRESHOLD) { setCompact(false); lastY = y; } // scrolling up
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  const isCompact = compact && !reduceMotion;

  return (
    <>
      {/* Outer rail spans full width but is click-through (pointerEvents:none) so
          taps in the side gutters fall to the page, not the nav. The capsule
          itself re-enables pointer events. */}
      <nav
        aria-label="Primary"
        className="fixed left-0 right-0 bottom-0 z-40"
        style={{
          paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            width: "calc(100% - 28px)",   // 14px gutter each side
            maxWidth: 480,
            margin: "0 auto",
            height: 62,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            paddingInline: 8,
            background: "var(--surface)",                 // warm cream paperHi, opaque for label contrast
            border: "1px solid rgba(168,137,63,0.40)",    // 1px gold hairline
            borderRadius: 9999,
            boxShadow:
              "0 10px 30px -10px rgba(74,42,58,0.30), 0 2px 8px rgba(11,8,5,0.10)",
            transform: isCompact ? `scale(${COMPACT_SCALE})` : "scale(1)",
            transformOrigin: "bottom center",
            transition: reduceMotion
              ? "none"
              : "transform .28s cubic-bezier(.32,.72,.24,1)",
            willChange: "transform",
          }}
        >
          {SLOTS.map((slot) => {
            if (slot.kind === "fab") {
              const Icon = slot.icon;
              return (
                <button
                  key="fab"
                  type="button"
                  aria-label="Open Jess"
                  onClick={handleJessTap}
                  style={{
                    position: "relative",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    minHeight: 56,
                  }}
                >
                  {/* Jess sits INSIDE the row, flush — same footprint as the other
                      items' 32px icon band. Still the one crimson colour pop (the
                      brand heart accent), just calm: small disc, no lift, soft shadow. */}
                  <span
                    aria-hidden="true"
                    style={{
                      width: 32, height: 32, borderRadius: 9999,
                      background: "var(--rose-primary)",
                      boxShadow: "0 2px 6px -2px rgba(212,94,82,0.45)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon size={18} color="white" strokeWidth={1.75} />
                  </span>
                  <span style={{ ...labelStyle(false), color: "var(--plum-deep)", fontWeight: 600 }}>
                    {slot.label}
                  </span>
                </button>
              );
            }

            if (slot.kind === "menu") {
              const Icon = slot.icon;
              return (
                <button
                  key="menu"
                  ref={menuButtonRef}
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(true)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    minHeight: 56,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 44, height: 32, borderRadius: 9999,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: menuOpen ? "var(--cream-2)" : "transparent",
                    }}
                  >
                    <Icon size={22} strokeWidth={1.75} style={{ color: menuOpen ? "var(--plum-deep)" : "var(--plum-mute)" }} />
                  </span>
                  <span style={labelStyle(menuOpen)}>{slot.label}</span>
                </button>
              );
            }

            // link
            const Icon = slot.icon;
            const active = currentPageName === slot.page;
            return (
              <Link
                key={slot.page}
                to={createPageUrl(slot.page)}
                aria-label={`Go to ${slot.label}`}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", minHeight: 56,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 44, height: 32, borderRadius: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? "var(--cream-2)" : "transparent",
                  }}
                >
                  <Icon size={22} strokeWidth={1.75} style={{ color: active ? "var(--plum-deep)" : "var(--plum-mute)" }} />
                </span>
                <span style={labelStyle(active)}>{slot.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <MenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
