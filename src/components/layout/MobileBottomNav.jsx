import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, BookOpen, User, Menu } from "lucide-react";
import { createPageUrl } from "@/utils";
import MenuSheet from "@/components/layout/MenuSheet";
import { FlowerGlyph, CornerSprig } from "@/components/brand/flora";
import { T } from "@/components/journal/Editorial";

// ── Active-pill motion spec (for the brand bible motion section) ──────────────
// ONE persistent wide STADIUM pill (radius 9999) that nearly FILLS the active
// item (≈full width, ~3px side inset; full height, ~4px even top/bottom) and
// SLIDES between items — the way IG/Material nav indicators do it. The slide is
// a single CSS transform transition (translateX only → compositor 60fps), tight
// + snappy, NO squash-stretch (that's what read as clunky).
//   slide  : transform .18s cubic-bezier(.33,1,.68,1) (silky GPU ease-out glide).
//            FLIP: `left` is a calc() from activeIndex so the pill ALWAYS lands on
//            the right slot (container-relative, no measurement, no wrong-slot);
//            the visual move is a compositor `transform` so it never stutters even
//            while a heavy page mounts on the main thread.
//   reduced-motion: no transition — the pill moves instantly.
// Decisive DEFAULTS below; the `?navtune=1` panel can override them (persisted
// in localStorage) so Halli can pick the exact size/speed live.
const _tune = (() => {
  try { return JSON.parse(localStorage.getItem("fw_navtune") || "null") || {}; }
  catch { return {}; }
})();
const PILL_INSET = _tune.side ?? 1;      // px side gap — pill effectively edge-to-edge
const PILL_HEIGHT = _tune.height ?? 60;  // near-full height — ~1px even top/bottom inset
const PILL_SLIDE = `transform ${_tune.slideMs ?? 180}ms cubic-bezier(.33,1,.68,1)`; // easeOutCubic — silky (GPU)
const NAV_ICON = _tune.icon ?? 24;       // icon size — bigger/bolder active slot

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

// ── Temporary live tuner (dev-only, behind ?navtune=1) ────────────────────────
// Lets Halli pick the exact pill size + slide speed without another round-trip.
// Writes choices to localStorage and reloads (the nav reads them at load).
const TUNE_DEFAULTS = { side: 1, height: 60, slideMs: 180, icon: 24 };
const SHOW_TUNER = typeof window !== "undefined" && /(\?|&)navtune\b/.test(window.location.search);
function NavTuner() {
  const cur = { ...TUNE_DEFAULTS, ..._tune };
  const set = (patch) => {
    const next = { ...cur, ...patch };
    try { localStorage.setItem("fw_navtune", JSON.stringify(next)); } catch { /* ignore */ }
    window.location.reload();
  };
  const reset = () => { try { localStorage.removeItem("fw_navtune"); } catch { /* ignore */ } window.location.reload(); };
  const Row = ({ label, k, opts, unit = "" }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "5px 0" }}>
      <span style={{ width: 86, fontSize: 11, opacity: 0.85 }}>{label}</span>
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => set({ [k]: o })}
          style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, cursor: "pointer",
            border: "1px solid rgba(0,0,0,0.18)",
            background: cur[k] === o ? "#A8893F" : "#fff",
            color: cur[k] === o ? "#fff" : "#333", fontWeight: cur[k] === o ? 700 : 500 }}>
          {o}{unit}
        </button>
      ))}
    </div>
  );
  return (
    <div style={{ position: "fixed", top: "calc(env(safe-area-inset-top,0px) + 8px)", left: 8, right: 8,
      zIndex: 99999, background: "rgba(255,255,255,0.97)", border: "1px solid #A8893F", borderRadius: 12,
      padding: "8px 10px", boxShadow: "0 6px 24px rgba(0,0,0,0.2)", fontFamily: "system-ui, sans-serif", color: "#222" }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
        Nav tuner — side {cur.side} · h {cur.height} · {cur.slideMs}ms · icon {cur.icon}
      </div>
      <Row label="Side inset" k="side" opts={[0, 1, 2]} unit="px" />
      <Row label="Height" k="height" opts={[58, 60, 62]} unit="px" />
      <Row label="Speed" k="slideMs" opts={[150, 180, 210]} unit="ms" />
      <Row label="Icon" k="icon" opts={[22, 24, 26]} unit="px" />
      <button type="button" onClick={reset}
        style={{ marginTop: 4, fontSize: 11, padding: "3px 10px", borderRadius: 8, cursor: "pointer",
          border: "1px solid rgba(0,0,0,0.18)", background: "#f3efe6" }}>
        Reset to default
      </button>
    </div>
  );
}

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

  // ── Active-pill (CSS-calc positioned, GPU transform slide) ─────────────────
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

  // Pill positioning — FULLY DECLARATIVE so it's immune to main-thread blocks
  // (a heavy keep-alive page mounting on nav). We measure ONLY the column width
  // (one number, via ResizeObserver so scroll-lock/viewport changes update it),
  // then React sets the pill's `transform: translateX(activeIndex * colW)` inline
  // and the GPU runs the transition on the compositor — never freezes, always
  // lands exactly on the active slot.
  const capsuleRef = useRef(null);
  const [colW, setColW] = useState(0);
  useLayoutEffect(() => {
    const cap = capsuleRef.current;
    if (!cap) return;
    const measure = () => {
      // clientWidth = content+padding (excludes border); grid content = − 2×8 padding.
      const w = (cap.clientWidth - 16) / 5;
      setColW((prev) => (Math.abs(prev - w) > 0.1 ? w : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(cap);
    return () => ro.disconnect();
  }, []);
  // Enable the slide only after first paint, so the pill places instantly on
  // load (no stray slide-in) but slides on every later nav.
  const [slideReady, setSlideReady] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setSlideReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

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
      {SHOW_TUNER && <NavTuner />}
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
          ref={capsuleRef}
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

          {/* The active pill — ONE wide STADIUM that nearly fills the active item
              and SLIDES between all 5 (light wax/gold, behind icon+label, like
              the IG reference). Positioned PURELY with CSS calc() from
              activeIndex: width = one grid column minus the side inset; transform
              = translateX by N columns (translateX % is the pill's own width, +
              the per-column inset gap). This auto-tracks ANY capsule width change
              (scroll-lock, page mounts) with no JS measurement — so it can never
              land on the wrong slot — and the slide stays a GPU transform. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 8 + PILL_INSET,                 // capsule padding (8) + side inset (fixed)
              top: (62 - PILL_HEIGHT) / 2,
              height: PILL_HEIGHT,
              // Width + slot position from the MEASURED column width (px), set
              // declaratively → React renders translateX, the GPU runs the slide.
              width: Math.max(0, colW - PILL_INSET * 2),
              borderRadius: 9999,                   // wide stadium pill, like the reference
              transform: `translateX(${Math.max(0, activeIndex) * colW}px)`,
              opacity: hasActive ? 1 : 0,
              willChange: "transform, opacity",
              zIndex: 0,
              // Soft, LIGHT active pill like the reference — a pale cream/gold
              // wash (not a dark slab). It reads against the translucent glass
              // because it's near-opaque with a DELICATE gold edge + a faint lift.
              background:
                "linear-gradient(180deg, rgba(247,241,227,0.94) 0%, rgba(238,228,203,0.95) 100%)",
              border: "1px solid rgba(168,137,63,0.45)",
              boxShadow:
                "inset 0 1px 0 rgba(255,253,247,0.85), 0 1px 4px rgba(120,90,40,0.14)",
              transition: reduceMotion
                ? "opacity .12s linear"
                : slideReady
                  ? `${PILL_SLIDE}, opacity .2s ease`
                  : "opacity .2s ease",  // place instantly on first paint, slide after
            }}
          />

          {SLOTS.map((slot, i) => {
            if (slot.kind === "fab") {
              return (
                <button
                  key="fab"
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
                    <FlowerGlyph variant="cosmos" size={34} color={T.crimson} accent="#A8893F" idx={7} />
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
                    <Icon size={NAV_ICON} strokeWidth={1.75} style={{ color: menuOpen ? "var(--plum-deep)" : "var(--plum-mute)" }} />
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
                onClick={() => {
                  // Tapping a destination from the always-visible nav closes any
                  // open overlay so you navigate cleanly (not under an open sheet).
                  setMenuOpen(false);
                  if (assistantOpen) window.dispatchEvent(new CustomEvent("fw_close_assistant"));
                }}
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
                  <Icon size={NAV_ICON} strokeWidth={1.75} style={{ color: active ? "var(--plum-deep)" : "var(--plum-mute)" }} />
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
