// BrandCraftSample — craft-direction sample for the canonical brand system.
// PREVIEW ONLY (self-contained, no backend). Reachable via IDEAS → Brand & UX → Previews.
//
// ELEVATED PASS (2026-06-17): the bloom, motifs and heart pushed two genuine
// levels — from "good" to "wow" — while staying performant. Shows:
//   (A) the bloom's progression: flat icon → v1 (good) → v2 (elevated, lifelike);
//   (B) the elevated botanical motif (gradient-stroke vine + veined leaves);
//   (C) the crafted crimson heart vs the old flat one;
//   (D) a LIVE perf readout measured with a grid of animating blooms.
// Conforms to claude-state/BRAND_IDENTITY.md (type roles, tokens, no emoji). Live UI untouched.

import { useState, useEffect, useRef } from "react";
import { T, SERIF, UI, SCRIPT, Heart, Eyebrow, Script, Hand, PAPER_BG, useEditorialFonts } from "@/components/journal/Editorial";

// ── colour helpers ──────────────────────────────────────────────────────────────────────────────
function lighten(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amt));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amt));
  const b = Math.min(255, (n & 255) + Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
function darken(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 255) - Math.round(255 * amt));
  const g = Math.max(0, ((n >> 8) & 255) - Math.round(255 * amt));
  const b = Math.max(0, (n & 255) - Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ── (A0) FLAT bloom — solid-fill ellipse petals, no depth/motion (the generic baseline) ───────────
function FlatBloom({ color = T.blush, accent = "#8E6E8E", size = 140 }) {
  const cx = 50, cy = 46;
  const petal = (px, py, len, wid, ang, fill, o, key) => (
    <ellipse key={key} cx={px} cy={py - len / 2} rx={wid} ry={len / 2} fill={fill} opacity={o} transform={`rotate(${ang} ${px} ${py})`} />
  );
  const ring = (count, len, wid, rad, fill, o) => Array.from({ length: count }).map((_, i) => {
    const ang = i * (360 / count); const a = (ang - 90) * Math.PI / 180;
    return petal(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, len, wid, ang, fill, o, `${count}-${i}`);
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <path d="M50 86 C 49 70 51 60 50 54" stroke="#8FAF8F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <g>{ring(9, 22, 6.5, 9, color, 0.94)}{ring(7, 15, 5, 5, color, 0.94)}<circle cx={cx} cy={cy} r="5" fill={accent} /></g>
    </svg>
  );
}

// ── (A1) v1 "good" bloom — ellipse petals + 3-stop gradient + glow + gradient shadow ──────────────
function RichBloom({ color = T.blush, accent = "#8E6E8E", size = 140, animate = true, idx = 0 }) {
  const cx = 50, cy = 46;
  const light = lighten(color, 0.42), mid = lighten(color, 0.16), deep = color, gid = `v1${idx}`;
  const petal = (px, py, len, wid, ang, fill, o, key) => (
    <ellipse key={key} cx={px} cy={py - len / 2} rx={wid} ry={len / 2} fill={fill} opacity={o} transform={`rotate(${ang} ${px} ${py})`} />
  );
  const ring = (count, len, wid, rad, fill, o) => Array.from({ length: count }).map((_, i) => {
    const ang = i * (360 / count); const a = (ang - 90) * Math.PI / 180;
    return petal(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, len, wid, ang, fill, o, `${count}-${i}`);
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id={`pet-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={light} /><stop offset="55%" stopColor={mid} /><stop offset="100%" stopColor={deep} /></linearGradient>
        <radialGradient id={`glow-${gid}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" /></radialGradient>
        <radialGradient id={`sh-${gid}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#2E261B" stopOpacity="0.28" /><stop offset="70%" stopColor="#2E261B" stopOpacity="0.08" /><stop offset="100%" stopColor="#2E261B" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={cx} cy={90} rx={22} ry={5.5} fill={`url(#sh-${gid})`} />
      <circle cx={cx} cy={cy} r="34" fill={`url(#glow-${gid})`} />
      <path d="M50 88 C 49 72 51 60 50 54" stroke="#7E9A7E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M50 72 C 39 68 33 71 31 78 C 40 79 48 76 50 71 Z" fill="#8FAF8F" opacity="0.92" />
      <path d="M50 66 C 61 62 67 65 69 72 C 60 73 52 70 50 65 Z" fill="#7A9A7A" opacity="0.86" />
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "center", animation: "fwcBreath 6s ease-in-out infinite" } : undefined}>
        {ring(9, 24, 7, 9.5, `url(#pet-${gid})`, 0.96)}{ring(7, 16, 5.4, 5, light, 0.95)}
        <ellipse cx={cx} cy={cy - 9} rx="9" ry="5" fill="#FFFDF7" opacity="0.22" />
        <circle cx={cx} cy={cy} r="5" fill={accent} /><circle cx={cx - 1.4} cy={cy - 1.4} r="1.6" fill="#FFFDF7" opacity="0.5" />
      </g>
    </svg>
  );
}

// ── (A2) v2 ELEVATED bloom — real notched petal PATHS, 3 layered rings with multi-stop gradients,
//        warm centre, dewy speculars, refined tapered stem + veined leaves, ONE soft-blur grounding
//        shadow. Motion: breath (scale) + multi-axis sway (rotate+nod) + faint dew shimmer. ────────
const PETAL_BLOOM_CX = 50, PETAL_BLOOM_CY = 50;
function petalPath(len, wid) {
  // base at (0,0), notched (heart-cupped) tip up at -len — organic, not a flat oval
  const w = wid, L = len;
  return `M0 0
    C ${-w} ${-L * 0.30} ${-w * 0.92} ${-L * 0.80} ${-w * 0.34} ${-L * 0.95}
    Q 0 ${-L * 0.86} ${w * 0.34} ${-L * 0.95}
    C ${w * 0.92} ${-L * 0.80} ${w} ${-L * 0.30} 0 0 Z`;
}
function RichBloomV2({ color = T.blush, accent = "#CBA24E", size = 150, animate = true, soft = true, idx = 0 }) {
  const cx = PETAL_BLOOM_CX, cy = PETAL_BLOOM_CY;
  const lightest = lighten(color, 0.52), light = lighten(color, 0.34), mid = lighten(color, 0.14), deep = color, deeper = darken(color, 0.13);
  const gid = `v2${idx}`;
  const delay = `${(idx % 5) * 0.7}s`;
  const ring = (count, len, wid, gradId, op, rot, edge) => Array.from({ length: count }).map((_, i) => {
    const ang = rot + i * (360 / count);
    return <path key={`${gradId}-${i}`} d={petalPath(len, wid)} fill={`url(#${gradId})`} opacity={op}
      stroke={edge} strokeWidth={edge ? 0.4 : undefined} strokeOpacity={edge ? 0.16 : undefined}
      transform={`translate(${cx} ${cy}) rotate(${ang})`} />;
  });
  return (
    <svg viewBox="0 0 100 105" width={size} height={size * 1.05} aria-hidden style={{ overflow: "visible" }}>
      <defs>
        {/* petal gradients — outer reads deepest/in-shadow at the base, inner the lightest crown */}
        <linearGradient id={`pO-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={mid} /><stop offset="52%" stopColor={deep} /><stop offset="100%" stopColor={deeper} /></linearGradient>
        <linearGradient id={`pM-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={light} /><stop offset="50%" stopColor={mid} /><stop offset="100%" stopColor={deep} /></linearGradient>
        <linearGradient id={`pI-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lightest} /><stop offset="60%" stopColor={light} /><stop offset="100%" stopColor={mid} /></linearGradient>
        {/* warm radial glow + soft centre */}
        <radialGradient id={`gl-${gid}`} cx="50%" cy="46%" r="52%"><stop offset="0%" stopColor={lightest} stopOpacity="0.30" /><stop offset="100%" stopColor={color} stopOpacity="0" /></radialGradient>
        <radialGradient id={`ct-${gid}`} cx="50%" cy="42%" r="60%"><stop offset="0%" stopColor={lighten(accent, 0.3)} /><stop offset="100%" stopColor={accent} /></radialGradient>
        {/* tapered stem + leaf gradients */}
        <linearGradient id={`st-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8FAF8F" /><stop offset="100%" stopColor="#5F7E5F" /></linearGradient>
        <linearGradient id={`lf-${gid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9DBE9D" /><stop offset="100%" stopColor="#6E8E6E" /></linearGradient>
        {/* the ONE allowed soft blur — only the grounding shadow node */}
        {soft && <filter id={`bl-${gid}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.9" /></filter>}
      </defs>

      {/* grounding shadow — one soft-blurred ellipse (perf: a single static blur node) */}
      <ellipse cx={cx} cy={97} rx={20} ry={4.6} fill="#2E261B" opacity="0.22" filter={soft ? `url(#bl-${gid})` : undefined} />
      <circle cx={cx} cy={cy} r="36" fill={`url(#gl-${gid})`} />

      {/* refined tapered stem (filled sliver, gentle S) + two veined leaves */}
      <path d={`M48.4 97 C 47.9 84 49.4 70 49 60 L 51 60 C 51.4 70 52 84 51.5 97 Z`} fill={`url(#st-${gid})`} />
      <g>
        <path d="M49 78 C 37 74 29 77 26 86 C 37 88 47 83 49 77 Z" fill={`url(#lf-${gid})`} opacity="0.95" />
        <path d="M49 78 C 41 79 33 82 27 86" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M42 79 L 39 76 M37 81 L 34 79 M33 83 L 31 82" stroke="#5F7E5F" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M51 71 C 63 67 71 70 74 79 C 63 81 53 76 51 70 Z" fill={`url(#lf-${gid})`} opacity="0.9" />
        <path d="M51 71 C 59 72 67 75 73 79" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65" />
      </g>

      {/* flower head — the only transformed group (breath); sway is on the wrapper div */}
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "center", animation: `fwcBreath 6s ease-in-out infinite`, animationDelay: delay } : undefined}>
        {/* outer ruff (deep, in shadow) → mid → inner curled crown (lightest) */}
        {ring(11, 30, 8.5, `pO-${gid}`, 0.97, 0, deeper)}
        {ring(10, 23, 7, `pM-${gid}`, 0.98, 18, deep)}
        {ring(7, 15, 5.4, `pI-${gid}`, 0.99, 9, mid)}
        {/* warm centre cluster + golden stamen dots */}
        <circle cx={cx} cy={cy} r="6.6" fill={`url(#ct-${gid})`} />
        {Array.from({ length: 9 }).map((_, i) => { const a = i * 40 * Math.PI / 180; const rr = 4.6; return <circle key={`stm${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="1.05" fill={darken(accent, 0.12)} opacity="0.85" />; })}
        <circle cx={cx} cy={cy} r="2.2" fill={lighten(accent, 0.28)} />
        {/* dewy speculars — light from top-left; gently shimmer */}
        <g style={animate ? { animation: `fwcShimmer 5s ease-in-out infinite`, animationDelay: delay } : undefined}>
          <ellipse cx={cx - 7} cy={cy - 11} rx="6.5" ry="3.4" fill="#FFFDF7" opacity="0.30" transform={`rotate(-24 ${cx - 7} ${cy - 11})`} />
          <circle cx={cx - 9} cy={cy - 6} r="1.5" fill="#FFFFFF" opacity="0.65" />
          <circle cx={cx + 6} cy={cy - 9} r="1.0" fill="#FFFFFF" opacity="0.45" />
        </g>
      </g>
    </svg>
  );
}

// a bloom that sways (wrapper handles the multi-axis sway around the stem base)
function SwayBloom({ children, animate, idx = 0 }) {
  return (
    <div style={animate ? { display: "inline-block", transformOrigin: "bottom center", animation: "fwcSway 8s ease-in-out infinite", animationDelay: `${(idx % 5) * 0.9}s` } : { display: "inline-block" }}>
      {children}
    </div>
  );
}

function Card({ children, label, accent = T.gold }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 18, padding: "16px 12px 14px", textAlign: "center" }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// ── (B) ELEVATED botanical motif — gradient-stroke vine, tapered main stem, veined leaves, tendril
function VineMotifV2({ color = T.gold, color2, opacity = 0.5, w = 130, flip = false, idx = 0 }) {
  const c2 = color2 || color, gid = `vm${idx}${flip ? "f" : ""}`;
  return (
    <svg width={w} height={w} viewBox="0 0 140 140" aria-hidden style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <defs>
        <linearGradient id={`vs-${gid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" /><stop offset="32%" stopColor={color} stopOpacity={opacity} /><stop offset="100%" stopColor={c2} stopOpacity={opacity * 0.72} />
        </linearGradient>
      </defs>
      {/* tapered main stem — filled sliver so it reads thick→thin, with a gradient */}
      <path d="M10 132 C 30 112 34 86 28 62 C 24 44 32 28 50 18 L 52.6 19.6 C 35 30 27 45 31 62 C 37 86 33 112 12.4 133 Z" fill={`url(#vs-${gid})`} />
      <g fill="none" stroke={`url(#vs-${gid})`} strokeWidth="1.05" strokeLinecap="round">
        {/* leaves with a midrib + side veins (finer linework) */}
        <path d="M29 64 C 16 60 9 49 11 38 C 23 42 30 52 29 64 Z" />
        <path d="M29 64 C 23 56 17 49 12 39" strokeWidth="0.8" />
        <path d="M24 56 L 19 56 M21 50 L 16 49 M19 45 L 15 43" strokeWidth="0.6" opacity="0.8" />
        <path d="M31 50 C 45 47 53 38 54 26 C 42 29 33 38 31 50 Z" />
        <path d="M31 50 C 39 43 47 36 53 27" strokeWidth="0.8" />
        <path d="M40 42 L 41 37 M45 38 L 47 33 M49 34 L 52 30" strokeWidth="0.6" opacity="0.8" />
        <path d="M27 92 C 15 89 8 80 10 70 C 22 74 28 82 27 92 Z" />
        <path d="M27 92 C 22 84 16 77 11 71" strokeWidth="0.8" />
        {/* a tendril curl + bud */}
        <path d="M50 18 C 58 14 64 17 66 24 C 67 29 63 33 59 31 C 56 29.5 57 25 61 26" strokeWidth="0.9" />
        <circle cx="50" cy="18" r="2.1" fill={color} stroke="none" opacity={opacity} />
        <circle cx="61" cy="26" r="1.3" fill={c2} stroke="none" opacity={opacity * 0.8} />
      </g>
    </svg>
  );
}

// leaf divider with the elevated (veined) leaf-eye
function LeafDivider({ color = T.gold }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 18px" }}>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
      <svg width="30" height="16" viewBox="0 0 30 16" fill="none" stroke={color} strokeWidth="1.1" aria-hidden opacity="0.8">
        <path d="M3 8 C 9 1 21 1 27 8 C 21 15 9 15 3 8 Z" /><path d="M3 8 H 27" strokeWidth="0.8" />
        <path d="M9 5 L 11 8 M14 4 L 15 8 M19 5 L 18 8 M23 6 L 21 8" strokeWidth="0.55" opacity="0.8" />
      </svg>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
    </div>
  );
}

// ── (C) CRAFTED heart — hand-cut crimson with a carved gradient, top sheen + lower bevel ──────────
function CraftedHeart({ size = 24, idx = 0 }) {
  const gid = `ch${idx}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle" }} aria-hidden>
      <defs>
        <linearGradient id={`hf-${gid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={lighten(T.crimson, 0.16)} /><stop offset="48%" stopColor={T.crimson} /><stop offset="100%" stopColor={darken(T.crimson, 0.18)} />
        </linearGradient>
        <radialGradient id={`hs-${gid}`} cx="34%" cy="28%" r="40%"><stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" /><stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform="rotate(-6 12 12)">
        {/* hand-cut, slightly asymmetric silhouette */}
        <path d="M12 20.6 C 6.6 16.7 3.3 13.9 3.3 9.6 C 3.3 7.0 5.3 5.2 7.8 5.2 C 9.5 5.2 11.0 6.1 11.8 7.6 C 12.0 7.95 12.15 7.95 12.35 7.6 C 13.15 6.0 14.6 5.1 16.3 5.1 C 18.85 5.1 20.8 7.0 20.8 9.7 C 20.8 13.95 17.3 16.8 12 20.6 Z"
          fill={`url(#hf-${gid})`} />
        {/* carved lower bevel (a touch darker) for depth */}
        <path d="M12 20.6 C 9.4 18.7 7.3 17.0 5.8 15.3 C 8.0 17.6 10.0 19.2 12 20.6 Z" fill={darken(T.crimson, 0.22)} opacity="0.5" />
        {/* soft top-left sheen + a tiny specular */}
        <ellipse cx="8.6" cy="9.4" rx="3.4" ry="2.4" fill={`url(#hs-${gid})`} transform="rotate(-28 8.6 9.4)" />
        <circle cx="8.8" cy="9.0" r="1.05" fill="#FFFFFF" opacity="0.9" />
      </g>
    </svg>
  );
}

// phase-ish palette for the perf grid (calm set; ovulatory #D4AF37 is the phase hue, fine here)
const GRID_BLOOMS = [
  { color: T.blush, accent: "#CBA24E" }, { color: T.sage, accent: "#CBA24E" },
  { color: "#D4AF37", accent: "#A8893F" }, { color: "#8E6E8E", accent: "#CBA24E" },
  { color: lighten(T.blush, 0.1), accent: "#CBA24E" }, { color: lighten(T.sage, 0.08), accent: "#CBA24E" },
  { color: "#C98A9B", accent: "#CBA24E" }, { color: "#9DB89D", accent: "#CBA24E" },
];

export default function BrandCraftSample() {
  useEditorialFonts();
  const [animate, setAnimate] = useState(true);
  const [fps, setFps] = useState(null);
  const [reduced, setReduced] = useState(false);
  const measuredRef = useRef(false);

  useEffect(() => {
    try { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { /* ignore */ }
  }, []);

  // measure average FPS over ~1.6s while the blooms animate
  const measure = () => {
    if (measuredRef.current) return; measuredRef.current = true;
    setFps(null);
    let frames = 0; let start = null;
    const step = (ts) => {
      if (start == null) start = ts;
      frames += 1;
      const elapsed = ts - start;
      if (elapsed < 1600) { requestAnimationFrame(step); }
      else { setFps(Math.round((frames / elapsed) * 1000)); measuredRef.current = false; }
    };
    requestAnimationFrame(step);
  };
  useEffect(() => { const id = setTimeout(measure, 700); return () => clearTimeout(id); }, []);

  const motion = animate && !reduced;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
      {/* ONE shared keyframe block — breath (scale) · sway (multi-axis) · dew shimmer · settle. Reduced-motion gated. */}
      <style>{`
        @keyframes fwcBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
        @keyframes fwcSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg) translateY(-1px)}}
        @keyframes fwcShimmer{0%,100%{opacity:.45}50%{opacity:.85}}
        @keyframes fwcSettle{0%{transform:translateY(6px) scale(.97);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        .fwc-settle{animation:fwcSettle .8s cubic-bezier(.16,1,.3,1) both}
        @media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}.fwc-settle{animation:none!important}}
      `}</style>

      {/* dev ribbon */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: T.ink, color: T.paper, padding: "8px 12px", fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Brand craft sample — elevated pass (preview only)
      </div>

      {/* one tasteful motif per corner (low opacity, stroke-only, never behind reading text) */}
      <div style={{ position: "absolute", top: 44, right: -14, pointerEvents: "none" }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.18} w={160} idx={1} /></div>
      <div style={{ position: "absolute", bottom: 8, left: -18, pointerEvents: "none" }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.13} w={150} flip idx={2} /></div>

      <div className={motion ? "fwc-anim" : ""} style={{ maxWidth: 460, margin: "0 auto", padding: "18px 16px 0", position: "relative" }}>
        {/* title with the crafted heart in context */}
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <CraftedHeart size={16} idx="t1" />
            <Script size={42} color={T.ink}>The craft, elevated</Script>
            <CraftedHeart size={16} idx="t2" />
          </div>
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 4 }}>good → amazing — same calm.</Hand>
        </div>

        {/* (A) THE SHOWPIECE — the elevated bloom, large, breathing + swaying */}
        <Eyebrow mb={10} color={T.gold}>The bloom — the centrepiece</Eyebrow>
        <div className="fwc-settle" style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
          <SwayBloom animate={motion} idx={0}><RichBloomV2 size={208} animate={motion} soft idx="hero" /></SwayBloom>
        </div>

        {/* the two-level jump: flat → good → elevated */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <Card label="Flat (generic)" accent={T.paperDeep}><FlatBloom size={108} /></Card>
          <Card label="v1 — good" accent={T.gold}><RichBloom size={108} animate={motion} idx="cmp1" /></Card>
          <Card label="v2 — amazing" accent={T.sage}><SwayBloom animate={motion} idx={3}><RichBloomV2 size={108} animate={motion} soft idx="cmp2" /></SwayBloom></Card>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.55, margin: "12px 2px 0" }}>
          The petals are now real notched shapes — three layered rings (a deep outer ruff, a mid layer, a lit curled crown), each with its own multi-stop gradient so light falls from tip to base. A warm gold centre with stamen dots, dewy speculars that softly shimmer, a refined tapered stem with veined leaves, and a single soft-blurred grounding shadow. It breathes, sways on a gentle nod, and settles on arrival.
        </div>

        {/* scale row + motion toggle */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, marginTop: 16 }}>
          {[60, 92, 128].map((s, i) => <SwayBloom key={s} animate={motion} idx={i + 1}><RichBloomV2 size={s} animate={motion} soft idx={`sc${s}`} /></SwayBloom>)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <button onClick={() => setAnimate((v) => !v)} style={{ background: animate ? T.sage : "transparent", color: animate ? "#fff" : T.muted, border: `1.5px solid ${T.sage}`, borderRadius: 99, padding: "6px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Motion: {animate ? "on" : "off"}
          </button>
        </div>
        {reduced && <div style={{ textAlign: "center", fontFamily: UI, fontSize: 13, color: T.muted, marginTop: 6 }}>Your device requests reduced motion — animation is off automatically.</div>}

        <LeafDivider />

        {/* (B) BOTANICAL MOTIF */}
        <Eyebrow mb={10} color={T.gold}>Botanical motif — finer, gracefully veined</Eyebrow>
        <div style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "18px 16px", overflow: "hidden", minHeight: 132 }}>
          <div style={{ position: "absolute", top: -10, right: -10, pointerEvents: "none" }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.34} w={128} idx={3} /></div>
          <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, position: "relative" }}>A page, framed not filled</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, marginTop: 6, position: "relative", maxWidth: "78%" }}>
            One trailing vine — a tapered stem with a faint gradient, leaves with a midrib and fine side-veins, a small tendril and a bud. Hairline strokes in gold/sage at low opacity, never behind reading text, never filled wallpaper.
          </div>
        </div>
        <div style={{ fontFamily: UI, fontSize: 13, color: T.muted, lineHeight: 1.5, marginTop: 10 }}>
          DO: one motif per screen · stroke-only with a gentle taper + gradient · veined leaves · opacity 0.06–0.12 bg, ~0.3 divider. &nbsp; DON'T: emoji, filled/3D leaves, wallpaper tiles, blur on strokes, anything competing with text.
        </div>

        <LeafDivider />

        {/* (C) HEART MARK — crafted vs old flat */}
        <Eyebrow mb={10} color={T.gold}>The heart mark — crafted, not generic</Eyebrow>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "16px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <Card label="Old (flat)" accent={T.paperDeep}><div style={{ padding: "8px 0" }}><Heart size={40} /></div></Card>
            <Card label="Crafted (carved)" accent={T.crimson}><div style={{ padding: "8px 0" }}><CraftedHeart size={40} idx="big" /></div></Card>
          </div>
          {/* a mock primary-page header */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
            <CraftedHeart size={18} idx="hd" />
            <span style={{ fontFamily: SCRIPT, fontSize: 30, color: T.ink }}>Today</span>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "12px 0" }}>
            A hand-cut, slightly asymmetric silhouette with a carved crimson gradient (lit top → <span style={{ color: T.crimson, fontWeight: 700 }}>#BC2E27</span> → deeper base), a lower bevel for depth, and a soft top-left sheen. Still one crimson pop per surface — never recoloured, never the plain outline icon.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", padding: "6px 0 10px" }}>
            <CraftedHeart size={13} idx="s1" /><CraftedHeart size={16} idx="s2" /><CraftedHeart size={20} idx="s3" /><CraftedHeart size={28} idx="s4" />
          </div>
          <div style={{ textAlign: "center", paddingTop: 12, borderTop: `1px solid ${T.paperDeep}`, fontFamily: UI, fontSize: 13, color: T.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            Made with <CraftedHeart size={14} idx="ft" /> FemWell
          </div>
        </div>

        <LeafDivider />

        {/* (D) PERFORMANCE — measured with a grid of animating blooms */}
        <Eyebrow mb={10} color={T.gold}>Performance — measured, on this device</Eyebrow>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${T.sage}`, borderRadius: 18, padding: "16px" }}>
          {/* the stress grid — 8 elevated blooms animating at once */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, justifyItems: "center", marginBottom: 12 }}>
            {GRID_BLOOMS.map((b, i) => <SwayBloom key={i} animate={motion} idx={i}><RichBloomV2 size={72} color={b.color} accent={b.accent} animate={motion} soft idx={`g${i}`} /></SwayBloom>)}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: SCRIPT, fontSize: 48, color: T.sage, lineHeight: 1 }}>{fps == null ? "…" : fps}</span>
            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted }}>fps with {GRID_BLOOMS.length} elevated blooms animating (plus the samples above)</span>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.55, marginTop: 8 }}>
            Depth comes from gradients + exactly ONE soft-blurred shadow node per bloom (static, rasterised once). Motion is GPU-cheap CSS transforms + a faint opacity shimmer; only the head group transforms, never each petal. One shared keyframe block drives the whole page.
          </div>
          <ul style={{ fontFamily: UI, fontSize: 13, color: T.muted, lineHeight: 1.6, margin: "10px 0 0", paddingLeft: 18 }}>
            <li>One <code>feGaussianBlur</code> per bloom — only the shadow; never across petals.</li>
            <li>Animate the bloom GROUP, not each petal; one <code>&lt;style&gt;</code> block per page.</li>
            <li><code>prefers-reduced-motion</code> turns all motion off automatically{reduced ? " (active now)" : ""}.</li>
          </ul>
          <button onClick={() => { measuredRef.current = false; measure(); }} style={{ marginTop: 12, background: "transparent", color: T.sage, border: `1.5px solid ${T.sage}`, borderRadius: 99, padding: "6px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Re-measure
          </button>
        </div>

        <div style={{ textAlign: "center", margin: "26px 0 8px" }}>
          <Hand size={14} color={T.muted}>Full spec: claude-state/BRAND_IDENTITY.md · Founders → Brand &amp; UX → Brand Identity</Hand>
        </div>
      </div>
    </div>
  );
}
