import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, BookOpen, User, Menu } from "lucide-react";
import { createPageUrl } from "@/utils";
import MenuSheet from "@/components/layout/MenuSheet";
import { FlowerGlyph, CornerSprig } from "@/components/brand/flora";
import { T } from "@/components/journal/Editorial";

// ── Liquid active-pill motion spec (for the brand bible motion section) ───────
// ONE persistent wide STADIUM pill (radius 9999, hugs the item like the IG
// reference) that MIGRATES between all 5 items. Motion = a real PHYSICS SPRING
// sampled at 60fps into a Web Animations API keyframe set (compositor-only
// transform → genuinely 60fps, no per-frame React/layout work). The liquid feel
// comes from a velocity-coupled squash-stretch: the pill stretches along travel
// in proportion to its instantaneous speed and relaxes to 1×1 as the spring
// settles — fluid, never a blobby pulse.
//   spring     : stiffness 320, damping 32, mass 1 (snappy, ~critically damped,
//                a hair of life). Distance-independent feel; longer hops just
//                take a little longer to settle.
//   stretch    : scaleX 1→1.16 / scaleY 1→0.94 at peak velocity (volume-ish),
//                eased back to 1×1 at rest.
//   reduced-motion: no spring — the pill moves instantly (clean, no animation).
const SPRING = { stiffness: 320, damping: 32, mass: 1 };
const PILL_INSET = 5;    // px gap between the pill and the item edges
const PILL_HEIGHT = 46;  // wide stadium that hugs the item (radius 9999)

// Sample a critically-damped-ish spring from `fromX`→`toX` at 60fps and emit a
// WAAPI keyframe array (transform only). Each frame's scaleX/scaleY is coupled
// to the spring's instantaneous velocity, so the pill "flows" — stretching when
// fast, settling round when slow.
function springPillKeyframes(fromX, toX) {
  const dt = 1 / 60;
  const { stiffness: k, damping: c, mass: m } = SPRING;
  const samples = [];
  let x = fromX, v = 0, t = 0;
  for (let i = 0; i < 90; i++) {
    const a = (-k * (x - toX) - c * v) / m;
    v += a * dt;
    x += v * dt;
    samples.push({ x, v });
    t += dt;
    if (Math.abs(x - toX) < 0.15 && Math.abs(v) < 1) break;
  }
  samples.push({ x: toX, v: 0 });
  const maxV = Math.max(1, ...samples.map((s) => Math.abs(s.v)));
  const frames = samples.map((s) => {
    const speed = Math.abs(s.v) / maxV; // 0..1
    const sx = 1 + speed * 0.16;
    const sy = 1 - speed * 0.06;
    return { transform: `translateX(${s.x}px) scaleX(${sx}) scaleY(${sy})` };
  });
  return { frames, duration: Math.max(260, samples.length * (1000 / 60)) };
}

// Slot order (left → right): Today · Lifestyle · Jess bloom · Profile · Menu.
// Four calm destinations + the centre Jess bloom + the "More" door (Menu) —
// the overflow sections live behind Menu, never a sideways-scrolling bar.
const SLOTS = [
  { kind: "link", label: "Today",     page: "Today",     icon: Sun },
  { kind: "link", label: "Lifestyle", page: "Lifestyle", icon: BookOpen },
  { kind: "fab",  label: "Jess" },
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

  // Frosted-glass needs backdrop-filter. Feature-detect once; when unsupported
  // (older browsers, some Android webviews) we fall back to a near-opaque cream
  // capsule so labels never sit on a see-through, low-contrast surface.
  const [supportsBlur] = useState(() =>
    typeof window !== "undefined" &&
    typeof window.CSS !== "undefined" &&
    typeof window.CSS.supports === "function" &&
    (window.CSS.supports("backdrop-filter", "blur(2px)") ||
      window.CSS.supports("-webkit-backdrop-filter", "blur(2px)"))
  );

  // ── Liquid active-pill migration ──────────────────────────────────────────
  const slotRefs = useRef([]);
  const pillRef = useRef(null);
  const prevLeftRef = useRef(null); // last resting pill X (null = pill hidden)
  // The assistant (Jess) overlay open-state lives in Layout; mirror it here via
  // the same window events so the pill can sit on Jess while it's open.
  const [assistantOpen, setAssistantOpen] = useState(false);
  useEffect(() => {
    const open = () => setAssistantOpen(true);
    const close = () => setAssistantOpen(false);
    window.addEventListener("fw_open_assistant", open);
    window.addEventListener("fw_close_assistant", close);
    return () => {
      window.removeEventListener("fw_open_assistant", open);
      window.removeEventListener("fw_close_assistant", close);
    };
  }, []);

  // The pill highlights the CURRENT destination across ALL 5 items:
  //   Menu open  → Menu · Jess overlay open → Jess · else the route's link.
  // (Menu/Jess are transient — the pill returns to the route when they close;
  // on a non-nav page with nothing open there's no destination, so it hides.)
  const linkIndex = SLOTS.findIndex((s) => s.kind === "link" && s.page === currentPageName);
  const menuIndex = SLOTS.findIndex((s) => s.kind === "menu");
  const fabIndex = SLOTS.findIndex((s) => s.kind === "fab");
  const activeIndex = menuOpen ? menuIndex : assistantOpen ? fabIndex : linkIndex;
  const hasActive = activeIndex >= 0;

  // Measure the active slot and migrate the pill there. useLayoutEffect so we
  // read geometry + start the animation before paint (no flash). offsetLeft/
  // offsetWidth are pre-transform layout values, so the shrink-on-scroll scale
  // never throws the geometry off.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    if (!hasActive) {
      pill.style.opacity = "0";
      prevLeftRef.current = null;
      return;
    }
    const slot = slotRefs.current[activeIndex];
    if (!slot) return;

    const toX = slot.offsetLeft + PILL_INSET;
    const w = slot.offsetWidth - PILL_INSET * 2;
    pill.style.width = `${w}px`;
    pill.style.opacity = "1";

    const fromX = prevLeftRef.current;
    // Cancel any in-flight migration so rapid taps don't stack.
    pill.getAnimations?.().forEach((a) => a.cancel());

    if (fromX == null || reduceMotion || fromX === toX) {
      // First appearance, reduced motion, or no move → settle instantly.
      pill.style.transform = `translateX(${toX}px) scaleX(1) scaleY(1)`;
    } else {
      // Genuine spring (sampled at 60fps) with velocity-coupled liquid stretch.
      pill.style.transform = `translateX(${toX}px) scaleX(1) scaleY(1)`; // rest after anim
      const { frames, duration } = springPillKeyframes(fromX, toX);
      pill.animate(frames, { duration, easing: "linear", fill: "none" });
    }
    prevLeftRef.current = toX;
  }, [activeIndex, hasActive, reduceMotion]);

  // Keep the pill aligned if the viewport (and thus the capsule width) changes.
  useEffect(() => {
    const onResize = () => {
      const pill = pillRef.current;
      const slot = slotRefs.current[activeIndex];
      if (!pill || !hasActive || !slot) return;
      const toX = slot.offsetLeft + PILL_INSET;
      pill.style.width = `${slot.offsetWidth - PILL_INSET * 2}px`;
      pill.style.transform = `translateX(${toX}px)`;
      prevLeftRef.current = toX;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, hasActive]);

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
      {/* Kill the GLOBAL red focus ring (index.css `:focus-visible{outline:2px
          solid #E11D48}`) for nav items — it renders as an off-brand red box
          (e.g. around Menu when focus returns after the sheet closes). Replace
          it with a calm on-brand gold ring: no red box in any state, while
          keeping a visible keyboard focus indicator (a11y — never outline:none).
          The active state stays the wax pill + plum label, set inline below. */}
      <style>{`
        nav[aria-label="Primary"] a:focus-visible,
        nav[aria-label="Primary"] button:focus-visible {
          outline: 2px solid var(--gold) !important;
          outline-offset: 3px;
          border-radius: 14px;
        }
      `}</style>
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
            position: "relative",
            pointerEvents: "auto",
            width: "calc(100% - 28px)",   // 14px gutter each side
            maxWidth: 480,
            margin: "0 auto",
            height: 62,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            paddingInline: 8,
            // ── Frosted glass: a THIN translucent cream veil (lit top edge →
            //    slightly creamier base) leaning hard on a strong backdrop blur,
            //    so the page reads through it (true frosted glass, not a near-
            //    solid bar). Alpha kept ~0.26–0.40 — low enough to see through,
            //    high enough (with blur+saturate) to keep icon/label contrast.
            //    Base is a touch denser so the labels (which sit low) stay legible.
            //    Falls back to opaque cream when backdrop-filter is unsupported.
            background: supportsBlur
              ? "linear-gradient(177deg, rgba(255,255,255,0.34) 0%, rgba(248,243,232,0.26) 42%, rgba(236,231,218,0.40) 100%)"
              : "var(--surface)",
            backdropFilter: supportsBlur ? "blur(22px) saturate(165%)" : undefined,
            WebkitBackdropFilter: supportsBlur ? "blur(22px) saturate(165%)" : undefined,
            border: "1px solid rgba(168,137,63,0.42)",    // 1px gold hairline
            borderRadius: 9999,
            // Layered depth: lit inner top highlight + soft inner bottom shade
            //    (the 3D glass bevel) over a soft outer drop shadow.
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 2px rgba(168,137,63,0.12), inset 0 8px 18px -12px rgba(255,255,255,0.55), 0 12px 32px -10px rgba(74,42,58,0.34), 0 3px 10px rgba(11,8,5,0.12)",
            transform: isCompact ? `scale(${COMPACT_SCALE})` : "scale(1)",
            transformOrigin: "bottom center",
            transition: reduceMotion
              ? "none"
              : "transform .28s cubic-bezier(.32,.72,.24,1)",
            willChange: "transform",
          }}
        >
          {/* Subtle botanical brand touch — a faint gold sprig tucked into each
              rounded end, clipped to the pill, behind the row (decorative). */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0, borderRadius: 9999,
              overflow: "hidden", pointerEvents: "none", zIndex: -1,
            }}
          >
            <div style={{ position: "absolute", left: -8, bottom: -12, opacity: 0.12 }}>
              <CornerSprig variant="sprig" color={T.gold} corner="bl" size={56} opacity={1} />
            </div>
            <div style={{ position: "absolute", right: -8, bottom: -12, opacity: 0.12, transform: "scaleX(-1)" }}>
              <CornerSprig variant="sprig" color={T.gold} corner="bl" size={56} opacity={1} />
            </div>
          </div>

          {/* The migrating active pill — ONE wide STADIUM that flows between all
              5 items (filled wax/gold pill hugging the item, behind icon+label,
              echoing the IG reference). Position/size/spring are driven
              imperatively from the layout effect above (WAAPI). */}
          <div
            ref={pillRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: (62 - PILL_HEIGHT) / 2,
              height: PILL_HEIGHT,
              width: 72,
              borderRadius: 9999,   // wide stadium pill, like the reference
              opacity: 0,
              transformOrigin: "center center",
              willChange: "transform, opacity",
              zIndex: 0,
              // Brand wax/gold pill: warm cream fill, lit top, soft gold ring.
              background:
                "linear-gradient(180deg, rgba(244,239,227,0.95) 0%, rgba(230,219,199,0.96) 100%)",
              border: "1px solid rgba(168,137,63,0.34)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 3px rgba(74,42,58,0.14)",
              transition: reduceMotion ? "opacity .12s linear" : "opacity .2s ease",
            }}
          />

          {SLOTS.map((slot, i) => {
            if (slot.kind === "fab") {
              return (
                <button
                  key="fab"
                  ref={(el) => (slotRefs.current[i] = el)}
                  type="button"
                  aria-label="Open Jess"
                  onClick={handleJessTap}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    minHeight: 56,
                  }}
                >
                  {/* Jess = the centre item, now a crimson BRAND BLOOM (cosmos —
                      the cleanest flower silhouette at small size) instead of the
                      heart. Sits flush in the row at the others' 32px band; a soft
                      blush halo gives it presence without a heavy disc. Static SVG
                      (no animation/blur) so it's free. */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "relative",
                      width: 32, height: 32, borderRadius: 9999,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute", inset: 0, borderRadius: 9999,
                        background: "radial-gradient(circle at 50% 46%, rgba(232,180,184,0.55) 0%, rgba(232,180,184,0.18) 55%, rgba(232,180,184,0) 78%)",
                      }}
                    />
                    <FlowerGlyph variant="cosmos" size={30} color={T.crimson} accent="#A8893F" idx={7} />
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
                  ref={(el) => { menuButtonRef.current = el; slotRefs.current[i] = el; }}
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(true)}
                  style={{
                    position: "relative",
                    zIndex: 1,
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
                      // Active highlight is the migrating stadium pill behind it now.
                      background: "transparent",
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
                ref={(el) => (slotRefs.current[i] = el)}
                to={createPageUrl(slot.page)}
                aria-label={`Go to ${slot.label}`}
                aria-current={active ? "page" : undefined}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", minHeight: 56,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 44, height: 32, borderRadius: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    // Active highlight is the migrating pill behind the item now.
                    background: "transparent",
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
