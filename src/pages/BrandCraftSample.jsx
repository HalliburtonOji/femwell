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
    <div style={{ position: "relative", display: "inline-block", width: size, height: Math.round(size * 1.05), lineHeight: 0 }}>
      {/* shadow in its OWN static svg — isolated so the breathing head never
          re-rasterises the blur filter per frame (the one perf trap, avoided) */}
      {soft && (
        <svg viewBox="0 0 100 105" width={size} height={Math.round(size * 1.05)} aria-hidden style={{ position: "absolute", inset: 0 }}>
          <defs><filter id={`bl-${gid}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.9" /></filter></defs>
          <ellipse cx={cx} cy={97} rx={20} ry={4.6} fill="#2E261B" opacity="0.22" filter={`url(#bl-${gid})`} />
        </svg>
      )}
      <svg viewBox="0 0 100 105" width={size} height={Math.round(size * 1.05)} aria-hidden style={{ position: "relative", overflow: "visible" }}>
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
      </defs>

      {/* warm radial glow (shadow is in the isolated svg above) */}
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
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: `fwcBreath 6s ease-in-out infinite`, animationDelay: delay } : undefined}>
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
    </div>
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

// ── BOTANICAL LEAF LIBRARY — varied species, finer & varied venation, vein gradient ─────────────
// Drawn in a 40×56 box, base at (20,53), tip up. Research: Art Nouveau took organic growth as
// structural logic (a line "is a force") and varied real plant forms — not one repeated shape.
const LEAF_DEFS = {
  ovate: { label: "Ovate", outline: "M20 53 C 7 45 5 24 20 4 C 35 24 33 45 20 53 Z", veins: ["M20 52 C 19.5 36 20 18 20 6", "M20 44 C 15 42 12 39 10.5 34", "M20 35 C 14.5 33 11.5 30 10 25", "M20 27 C 15.5 25.5 13.5 23 12.5 19", "M20 44 C 25 42 28 39 29.5 34", "M20 35 C 25.5 33 28.5 30 30 25", "M20 27 C 24.5 25.5 26.5 23 27.5 19"], fill: true },
  willow: { label: "Willow", outline: "M20 53 C 14 44 13 22 20 4 C 27 22 26 44 20 53 Z", veins: ["M20 52 C 19.7 34 20 16 20 6", "M20 46 C 17 45 15.5 43 14.5 40", "M20 38 C 17 37 15.5 35 14.7 32", "M20 30 C 17.5 29 16.2 27 15.4 24", "M20 46 C 23 45 24.5 43 25.5 40", "M20 38 C 23 37 24.5 35 25.3 32", "M20 30 C 22.5 29 23.8 27 24.6 24"], fill: true },
  serrate: { label: "Serrate", outline: "M20 53 L 12 45 L 15 42 L 9 36 L 13 33 L 8 26 L 12 23 L 9 16 L 14 13 L 16 8 L 20 4 L 24 8 L 26 13 L 31 16 L 28 23 L 32 26 L 27 33 L 31 36 L 25 42 L 28 45 Z", veins: ["M20 51 C 19.6 36 20 18 20 6", "M20 44 C 16 43 13 41 11 38", "M20 35 C 16 34 13.5 32 11 29", "M20 27 C 16.5 26 14.5 24.5 12.5 22", "M20 44 C 24 43 27 41 29 38", "M20 35 C 24 34 26.5 32 29 29", "M20 27 C 23.5 26 25.5 24.5 27.5 22"], fill: true },
  cordate: { label: "Cordate", outline: "M20 50 C 16 49 11 48 8 43 C 3 35 5 17 16 7 C 18 5 20 6 20 10 C 20 6 22 5 24 7 C 35 17 37 35 32 43 C 29 48 24 49 20 50 Z", veins: ["M20 48 C 18 36 19 22 20 9", "M20 48 C 16 42 12 33 9.5 23", "M20 48 C 24 42 28 33 30.5 23", "M20 47 C 14.5 41 11.5 32 10.5 25", "M20 47 C 25.5 41 28.5 32 29.5 25"], fill: true },
  frond: { label: "Fern frond", outline: "", veins: ["M20 53 C 19 38 20 18 20 5", "M20 47 C 15 47 11 45 8 41", "M20 41 C 15.5 41 12 39.5 9.5 36", "M20 35 C 16 35 13 33.5 11 31", "M20 29 C 16.5 29 14 28 12.5 26", "M20 23 C 17 23 15.2 22.2 14 20.5", "M20 47 C 25 47 29 45 32 41", "M20 41 C 24.5 41 28 39.5 30.5 36", "M20 35 C 24 35 27 33.5 29 31", "M20 29 C 23.5 29 26 28 27.5 26", "M20 23 C 23 23 24.8 22.2 26 20.5"] },
  sprig: { label: "Sprig", outline: "M20 53 C 19 42 21 33 20 25", veins: ["M16 39 C 11 39 8 36.5 7 32 C 12 32 15.5 35 16 39 Z", "M24 44 C 29 44 32 41.5 33 37 C 28 37 24.5 40 24 44 Z", "M20 26 C 19.6 22 20 18 20 14"], dots: [{ cx: 20, cy: 13, r: 2.6 }, { cx: 16.2, cy: 16, r: 1.2 }, { cx: 23.8, cy: 16, r: 1.2 }] },
};
function LeafGlyph({ variant = "ovate", size = 46, color = T.sage, opacity = 0.92, animate = false, idx = 0 }) {
  const v = LEAF_DEFS[variant] || LEAF_DEFS.ovate;
  const gid = `lg-${variant}-${idx}`;
  return (
    <svg viewBox="0 0 40 56" width={size} height={Math.round(size * 1.4)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "bottom center", willChange: "transform", animation: "fwcLeaf 9s ease-in-out infinite", animationDelay: `${(idx % 5) * 0.8}s` } : undefined}>
      <defs>
        <linearGradient id={`vg-${gid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={darken(color, 0.06)} stopOpacity={opacity} />
          <stop offset="100%" stopColor={lighten(color, 0.24)} stopOpacity={opacity * 0.55} />
        </linearGradient>
      </defs>
      {v.fill && v.outline && <path d={v.outline} fill={`url(#vg-${gid})`} opacity="0.1" />}
      {v.outline && <path d={v.outline} fill="none" stroke={`url(#vg-${gid})`} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />}
      {v.veins.map((d, i) => <path key={i} d={d} fill="none" stroke={`url(#vg-${gid})`} strokeWidth={v.outline ? 0.6 : 0.85} strokeLinecap="round" opacity="0.85" />)}
      {(v.dots || []).map((c, i) => <circle key={`d${i}`} cx={c.cx} cy={c.cy} r={c.r} fill={color} opacity={opacity * 0.85} />)}
    </svg>
  );
}

// ── CORNER-TREATMENT SYSTEM — sprig / carved ornament / tendril (drawn for a corner; rotate) ──────
// Research: ornamental corners "grow" from the corner; Art Nouveau whiplash = an asymmetric,
// accelerating S-curve. Carved = an engraved double-rule with a light bevel (no blur).
function CornerSprig({ variant = "sprig", color = T.gold, size = 74, opacity = 0.7, corner = "tl", idx = 0 }) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[corner] || 0;
  const gid = `cs-${variant}-${corner}-${idx}`;
  const stroke = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", opacity };
  let body;
  if (variant === "sprig") {
    body = (
      <g {...stroke} strokeWidth="1.1">
        {/* whiplash stem out of the corner */}
        <path d="M6 6 C 22 10 34 22 40 42 C 43 52 49 58 60 60" />
        {/* leaves along it (varied) + a bud */}
        <path d="M20 9 C 26 6 33 8 36 15 C 29 17 22 14 20 9 Z" />
        <path d="M20 9 C 27 11 32 13 36 15" strokeWidth="0.6" />
        <path d="M37 30 C 34 24 36 17 43 13 C 45 20 43 27 37 30 Z" />
        <path d="M37 30 C 38 24 40 19 43 14" strokeWidth="0.6" />
        <path d="M41 47 C 47 44 54 46 57 53 C 50 55 43 52 41 47 Z" />
        <circle cx="60" cy="60" r="2.4" fill={color} stroke="none" />
        <circle cx="6" cy="6" r="1.6" fill={color} stroke="none" />
      </g>
    );
  } else if (variant === "tendril") {
    body = (
      <g {...stroke} strokeWidth="1.05">
        <path d="M5 5 C 24 9 40 24 48 46" />
        {/* coiling whiplash curl */}
        <path d="M48 46 C 52 56 62 58 66 50 C 69 44 64 38 58 40 C 53 41.5 53 48 58 48" />
        <path d="M22 8 C 28 6 33 9 34 15" strokeWidth="0.8" />
        <path d="M40 26 C 46 24 51 27 51 33" strokeWidth="0.8" />
        <circle cx="5" cy="5" r="1.5" fill={color} stroke="none" />
      </g>
    );
  } else { // carved — engraved double-rule with a light bevel + a small leaf at the elbow
    body = (
      <g>
        {/* light bevel pass (offset), then the ink rule — reads carved without a blur */}
        <g fill="none" stroke="#FFFDF7" strokeWidth="1.1" strokeLinecap="round" opacity={Math.min(0.5, opacity)} transform="translate(0.7 0.7)">
          <path d="M8 64 L 8 8 L 64 8" /><path d="M14 64 L 14 14 L 64 14" />
        </g>
        <g fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity={opacity}>
          <path d="M8 64 L 8 8 L 64 8" /><path d="M14 64 L 14 14 L 64 14" />
          {/* small leaf nestled in the elbow */}
          <path d="M14 14 C 24 16 30 22 31 32 C 22 31 16 24 14 14 Z" />
          <path d="M14 14 C 21 19 27 25 31 32" strokeWidth="0.55" />
          <circle cx="8" cy="8" r="1.7" fill={color} stroke="none" />
        </g>
      </g>
    );
  }
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden style={{ transform: `rotate(${rot}deg)`, display: "block" }} id={gid}>{body}</svg>
  );
}

// a card framed with four delicate corner sprigs (the "frame" option)
function BrandFrame({ children, color = T.gold, variant = "sprig", opacity = 0.6, size = 60 }) {
  return (
    <div style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "22px 20px", overflow: "hidden" }}>
      {["tl", "tr", "br", "bl"].map((c) => (
        <div key={c} style={{ position: "absolute", pointerEvents: "none", ...(c.includes("t") ? { top: 4 } : { bottom: 4 }), ...(c.includes("l") ? { left: 4 } : { right: 4 }) }}>
          <CornerSprig variant={variant} color={color} corner={c} size={size} opacity={opacity} idx={c} />
        </div>
      ))}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

// ── DIVIDERS & FLOURISHES — fleuron history: an inline ornament that divides without a heavy rule ─
function SprigDivider({ color = T.gold, w = 240 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "24px 0 18px" }}>
      <svg width={w} height="26" viewBox="0 0 240 26" aria-hidden fill="none" stroke={color} strokeLinecap="round">
        <defs>
          <linearGradient id="sprigfade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0" /><stop offset="22%" stopColor={color} stopOpacity="0.55" /><stop offset="50%" stopColor={color} stopOpacity="0.7" /><stop offset="78%" stopColor={color} stopOpacity="0.55" /><stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M8 13 H 232" stroke="url(#sprigfade)" strokeWidth="1" />
        {/* leaves alternating along the centre, fading via the rule's gradient feel */}
        <g stroke={color} strokeWidth="0.9" opacity="0.7">
          <path d="M120 13 C 116 7 116 2 120 -1" transform="translate(0 2)" />
          <path d="M120 13 C 113 12 108 9 105 4 C 111 4 117 8 120 13 Z" />
          <path d="M120 13 C 127 12 132 9 135 4 C 129 4 123 8 120 13 Z" />
          <path d="M101 13 C 96 13 92 11 90 7 C 95 7 99 9 101 13 Z" opacity="0.6" />
          <path d="M139 13 C 144 13 148 11 150 7 C 145 7 141 9 139 13 Z" opacity="0.6" />
          <circle cx="120" cy="3" r="1.6" fill={color} stroke="none" />
        </g>
      </svg>
    </div>
  );
}
function FleuronDivider({ color = T.gold, w = 200 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "24px 0 18px" }}>
      <span style={{ width: w * 0.34, height: 1, background: color, opacity: 0.4 }} />
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.8">
        {/* a small four-petal fleuron / quatrefoil leaf ornament */}
        <path d="M11 11 C 11 5 14 2 18 3 C 17 7 14 10 11 11 Z" />
        <path d="M11 11 C 17 11 20 14 19 18 C 15 17 12 14 11 11 Z" />
        <path d="M11 11 C 11 17 8 20 4 19 C 5 15 8 12 11 11 Z" />
        <path d="M11 11 C 5 11 2 8 3 4 C 7 5 10 8 11 11 Z" />
        <circle cx="11" cy="11" r="1.3" fill={color} stroke="none" />
      </svg>
      <span style={{ width: w * 0.34, height: 1, background: color, opacity: 0.4 }} />
    </div>
  );
}
// two mirrored sprigs flanking a header
function HeaderFlourish({ children, color = T.gold }) {
  const sprig = (flip) => (
    <svg width="56" height="20" viewBox="0 0 56 20" aria-hidden fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.62" style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <path d="M54 10 C 38 9 26 11 8 10" />
      <path d="M30 10 C 26 5 26 3 28 -0.5" strokeWidth="0.8" transform="translate(0 1.5)" />
      <path d="M22 10 C 18 6 16 5 12 4 C 14 8 18 10 22 10 Z" />
      <path d="M34 10 C 38 6 40 5 44 4 C 42 8 38 10 34 10 Z" />
      <circle cx="8" cy="10" r="1.5" fill={color} stroke="none" />
    </svg>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
      {sprig(false)}{children}{sprig(true)}
    </div>
  );
}

// ── FLOWER TYPES — distinct silhouettes tied to the flora map (poppy/snowdrop/sunflower/dahlia/
//    lotus/forget-me-not). Lightweight stroke+gradient glyphs; meaning lives in the choice. ───────
function FlowerGlyph({ variant = "poppy", size = 52, color = T.crimson, accent = "#2E261B", idx = 0 }) {
  const gid = `fg-${variant}-${idx}`;
  const cx = 20, cy = 20;
  const grad = (
    <radialGradient id={`fgr-${gid}`} cx="50%" cy="42%" r="62%">
      <stop offset="0%" stopColor={lighten(color, 0.32)} /><stop offset="100%" stopColor={color} />
    </radialGradient>
  );
  let body;
  if (variant === "poppy") {
    body = (<g>
      {[18, 100, 182, 264].map((a, i) => <ellipse key={i} cx={cx} cy={cy - 9} rx="8.2" ry="10" fill={`url(#fgr-${gid})`} opacity="0.95" transform={`rotate(${a} ${cx} ${cy})`} />)}
      <circle cx={cx} cy={cy} r="4.2" fill={darken(color, 0.34)} />
      {Array.from({ length: 8 }).map((_, i) => { const a = i * 45 * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a) * 3} cy={cy + Math.sin(a) * 3} r="0.7" fill={lighten(color, 0.2)} />; })}
    </g>);
  } else if (variant === "snowdrop") {
    body = (<g>
      <path d="M20 3 C 18.5 11 20 17 20 22" fill="none" stroke="#7E9A7E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M20 13 C 14 12 11 15 11 20 C 16 20 19 17 20 13 Z" fill="#8FAF8F" opacity="0.85" />
      <g fill={`url(#fgr-${gid})`} opacity="0.96">
        <path d="M20 23 C 15.5 24 14 30 17 35 C 19.5 33 20 28 20 23 Z" />
        <path d="M20 23 C 24.5 24 26 30 23 35 C 20.5 33 20 28 20 23 Z" />
        <path d="M20 24 C 18 26 18 32 20 36 C 22 32 22 26 20 24 Z" fill={lighten(color, 0.12)} />
      </g>
      <path d="M17 33 L 20 35 L 23 33" fill="none" stroke="#8FAF8F" strokeWidth="0.6" opacity="0.7" />
    </g>);
  } else if (variant === "sunflower") {
    body = (<g>
      {Array.from({ length: 18 }).map((_, i) => { const a = i * 20; return <ellipse key={i} cx={cx} cy={cy - 11} rx="2.4" ry="7" fill={`url(#fgr-${gid})`} opacity="0.95" transform={`rotate(${a} ${cx} ${cy})`} />; })}
      <circle cx={cx} cy={cy} r="6.4" fill={darken(accent, 0)} />
      <circle cx={cx} cy={cy} r="6.4" fill="none" stroke={darken(color, 0.2)} strokeWidth="0.5" opacity="0.5" />
      {Array.from({ length: 10 }).map((_, i) => { const a = i * 36 * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a) * 3.6} cy={cy + Math.sin(a) * 3.6} r="0.8" fill={lighten(accent, 0.18)} />; })}
    </g>);
  } else if (variant === "dahlia") {
    const petal = "M0 0 C -2.6 -4 -2.4 -9 0 -13 C 2.4 -9 2.6 -4 0 0 Z";
    body = (<g>
      {Array.from({ length: 12 }).map((_, i) => <path key={`o${i}`} d={petal} fill={color} opacity="0.9" transform={`translate(${cx} ${cy}) rotate(${i * 30}) translate(0 -3)`} />)}
      {Array.from({ length: 9 }).map((_, i) => <path key={`m${i}`} d={petal} fill={`url(#fgr-${gid})`} opacity="0.95" transform={`translate(${cx} ${cy}) rotate(${i * 40 + 18}) scale(0.7) translate(0 -3)`} />)}
      <circle cx={cx} cy={cy} r="2.6" fill={darken(color, 0.28)} />
    </g>);
  } else if (variant === "lotus") {
    const pet = (s, dy, fill, o) => <path d="M0 0 C -5 -6 -5 -16 0 -22 C 5 -16 5 -6 0 0 Z" fill={fill} opacity={o} transform={`translate(${cx} ${cy + dy}) scale(${s})`} />;
    body = (<g>
      <path d="M20 20 C 6 16 2 20 2 20 C 6 26 14 24 20 20 Z" fill={color} opacity="0.55" />
      <path d="M20 20 C 34 16 38 20 38 20 C 34 26 26 24 20 20 Z" fill={color} opacity="0.55" />
      {[-32, 32].map((a, i) => <path key={i} d="M0 0 C -4 -6 -4 -15 0 -20 C 4 -15 4 -6 0 0 Z" fill={color} opacity="0.7" transform={`translate(${cx} ${cy + 1}) rotate(${a})`} />)}
      {pet(1, 1, `url(#fgr-${gid})`, 0.96)}
      <circle cx={cx} cy={cy - 5} r="1.6" fill={lighten(accent, 0.2)} />
    </g>);
  } else { // forgetmenot — 5 small round petals + a warm eye (plum, on-brand)
    body = (<g>
      {Array.from({ length: 5 }).map((_, i) => { const a = i * 72 * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a - Math.PI / 2) * 7} cy={cy + Math.sin(a - Math.PI / 2) * 7} r="4.4" fill={`url(#fgr-${gid})`} opacity="0.95" />; })}
      <circle cx={cx} cy={cy} r="3" fill={T.gold} /><circle cx={cx} cy={cy} r="1.3" fill={lighten(T.gold, 0.25)} />
    </g>);
  }
  return <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden><defs>{grad}</defs>{body}</svg>;
}

// ── BUTTERFLY — transformation + return. Static by default; gentle drift + faint flutter, isolated.
function Butterfly({ size = 46, color = "#8E6E8E", color2 = T.gold, animate = true, idx = 0 }) {
  const gid = `bf-${idx}`;
  const wingL = (<g>
    <path d="M24 15 C 17 6 5 5 3 13 C 2 19 11 22 24 20 Z" fill={`url(#bw-${gid})`} />
    <path d="M24 21 C 15 22 8 28 12 34 C 16 38 23 31 24 24 Z" fill={`url(#bw2-${gid})`} />
    <path d="M24 16 C 18 12 11 11 6 14" stroke={darken(color, 0.1)} strokeWidth="0.5" fill="none" opacity="0.5" />
    <circle cx="9" cy="13" r="1.5" fill="#FFFDF7" opacity="0.6" /><circle cx="15" cy="30" r="1.1" fill={color2} opacity="0.7" />
  </g>);
  return (
    <svg viewBox="0 0 48 42" width={size} height={Math.round(size * 0.88)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 7s ease-in-out infinite", animationDelay: `${(idx % 4) * 0.9}s` } : undefined}>
      <defs>
        <linearGradient id={`bw-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lighten(color, 0.28)} /><stop offset="100%" stopColor={color} /></linearGradient>
        <linearGradient id={`bw2-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={darken(color, 0.12)} /></linearGradient>
      </defs>
      {/* left + right wing groups flutter gently (scaleX about the body) */}
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "right center", animation: "fwcFlutter 0.9s ease-in-out infinite" } : undefined}>{wingL}</g>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "left center", animation: "fwcFlutter 0.9s ease-in-out infinite" } : undefined} transform="translate(48 0) scale(-1 1)">{wingL}</g>
      {/* body + antennae */}
      <path d="M24 11 C 22.8 19 22.8 28 24 34 C 25.2 28 25.2 19 24 11 Z" fill="#2E261B" />
      <circle cx="24" cy="11" r="1.6" fill="#2E261B" />
      <path d="M24 10 C 22 6 20 4 18 3" stroke="#2E261B" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <path d="M24 10 C 26 6 28 4 30 3" stroke="#2E261B" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="3" r="0.9" fill="#2E261B" /><circle cx="30" cy="3" r="0.9" fill="#2E261B" />
    </svg>
  );
}

// ── BLOSSOM TREE — the long arc (garden → tree → orchard). Hairline trunk + whiplash limbs + blossoms.
function BlossomTree({ size = 120, color = T.muted, blossom = T.blush, idx = 0 }) {
  const dots = [[30, 22], [42, 14], [54, 24], [22, 34], [62, 36], [38, 28], [50, 38], [28, 46], [58, 50], [44, 44], [34, 16], [48, 20], [66, 28], [20, 44], [70, 44]];
  return (
    <svg viewBox="0 0 90 100" width={size} height={Math.round(size * 1.1)} aria-hidden>
      <g fill="none" stroke={color} strokeLinecap="round" opacity="0.6">
        <path d="M45 96 C 44 80 45 70 45 60" strokeWidth="2.4" />
        <path d="M45 66 C 38 58 32 50 30 40 M45 70 C 52 60 60 52 62 42 M45 60 C 43 50 42 40 44 30 M45 64 C 36 56 28 50 22 46 M45 62 C 55 54 64 48 68 44" strokeWidth="1.4" />
        <path d="M30 40 C 27 36 26 32 27 28 M62 42 C 65 38 66 34 65 30 M44 30 C 43 26 44 22 47 19" strokeWidth="1" />
      </g>
      <g>{dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.6 : 1.9} fill={blossom} opacity={0.8 - (i % 4) * 0.1} />)}</g>
      {/* a few fallen petals at the base */}
      <g>{[[34, 90], [50, 92], [58, 88]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill={blossom} opacity="0.5" />)}</g>
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
        @keyframes fwcLeaf{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
        @keyframes fwcDrift{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(4px,-5px) rotate(3deg)}}
        @keyframes fwcFlutter{0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.86)}}
        @keyframes fwcSettle{0%{transform:translateY(6px) scale(.97);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        .fwc-settle{animation:fwcSettle .8s cubic-bezier(.16,1,.3,1) both}
        @media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}.fwc-settle{animation:none!important}}
      `}</style>

      {/* dev ribbon */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: T.ink, color: T.paper, padding: "8px 12px", fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Brand image showcase — botanical system (preview only)
      </div>

      {/* one tasteful motif per corner (low opacity, stroke-only, never behind reading text) */}
      <div style={{ position: "absolute", top: 44, right: -14, pointerEvents: "none" }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.18} w={160} idx={1} /></div>
      <div style={{ position: "absolute", bottom: 8, left: -18, pointerEvents: "none" }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.13} w={150} flip idx={2} /></div>

      <div className={motion ? "fwc-anim" : ""} style={{ maxWidth: 460, margin: "0 auto", padding: "18px 16px 0", position: "relative" }}>
        {/* title with the crafted heart in context */}
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <CraftedHeart size={16} idx="t1" />
            <Script size={42} color={T.ink}>The brand image</Script>
            <CraftedHeart size={16} idx="t2" />
          </div>
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 4 }}>the whole botanical language — bloom, leaves, corners, flourishes.</Hand>
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

        <FleuronDivider />

        {/* (A2) FLOWERS AS MEANING — the floral backbone */}
        <Eyebrow mb={4} color={T.gold}>Flowers as meaning — the floral backbone</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "2px 2px 12px" }}>
          Each bloom is chosen for what it <em>means</em> — so a sunflower always says <em>peak</em>, a forget-me-not always says <em>memory</em>, a butterfly always says <em>you changed and came back</em>. The bloom marks the day, the butterfly a moment, the tree the years. Full map: <span style={{ fontFamily: UI, fontSize: 13 }}>claude-state/BRAND_FLORA.md</span>.
        </div>
        {/* the four cycle-phase flowers */}
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "14px 8px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            {[["poppy", "Menstrual", "rest", T.crimson, "#2E261B"], ["snowdrop", "Follicular", "hope", "#9DB89D", "#2E261B"], ["sunflower", "Ovulatory", "radiance", "#D4AF37", "#6B5840"], ["dahlia", "Luteal", "strength", "#8E6E8E", "#2E261B"]].map(([v, ph, mng, c, ac], i) => (
              <div key={v} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                <FlowerGlyph variant={v} size={52} color={c} accent={ac} idx={i} />
                <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.muted, marginTop: 2 }}>{ph}</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.inkSoft }}>{mng}</div>
              </div>
            ))}
          </div>
        </div>
        {/* butterfly moment + flowering-tree arc, side by side */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 0, position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${"#8E6E8E"}`, borderRadius: 16, padding: "12px 12px 14px", textAlign: "center", overflow: "hidden" }}>
            <div style={{ position: "relative", height: 104 }}>
              <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }}><RichBloomV2 size={96} animate={motion} soft idx="flora-bloom" /></div>
              <div style={{ position: "absolute", top: 0, right: 6 }}><Butterfly size={44} color="#8E6E8E" animate={motion} idx={1} /></div>
            </div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.muted, marginTop: 4 }}>Butterfly</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, lineHeight: 1.4 }}>visits when you return</div>
          </div>
          <div style={{ flex: 1, minWidth: 0, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${T.sage}`, borderRadius: 16, padding: "12px 12px 14px", textAlign: "center" }}>
            <div style={{ height: 104, display: "grid", placeItems: "center" }}><BlossomTree size={96} /></div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.muted, marginTop: 4 }}>Flowering tree</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, lineHeight: 1.4 }}>the long arc — garden to orchard</div>
          </div>
        </div>
        {/* a meaningful combination */}
        <div style={{ marginTop: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${T.gold}`, borderRadius: 16, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <FlowerGlyph variant="forgetmenot" size={42} color="#8E6E8E" idx={9} />
            <span style={{ fontFamily: SERIF, fontSize: 18, color: T.muted }}>+</span>
            <LeafGlyph variant="sprig" size={34} color={T.sage} idx={9} />
            <span style={{ fontFamily: SERIF, fontSize: 18, color: T.muted }}>=</span>
            <span style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink }}>remembrance</span>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, marginTop: 8, textAlign: "center" }}>
            Forget-me-not (memory) + rosemary (remembrance) — a pairing the app can offer around grief or loss. Combinations make a sentence the way a bouquet does.
          </div>
        </div>

        <LeafDivider />

        {/* (B) THE LEAF LIBRARY — varied species + venation */}
        <Eyebrow mb={10} color={T.gold}>The leaf library — varied species, finer veins</Eyebrow>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "16px 8px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            {[["ovate", T.sage], ["willow", "#7E9A7E"], ["serrate", T.gold], ["cordate", "#8E6E8E"], ["frond", T.sage], ["sprig", T.gold]].map(([k, c], i) => (
              <div key={k} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                <LeafGlyph variant={k} size={42} color={c} animate={motion} idx={i} />
                <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginTop: 2 }}>{LEAF_DEFS[k].label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.55, margin: "12px 2px 0" }}>
          Six forms — ovate, willow, serrate, cordate, a fern frond and a sprig — each with its own venation (pinnate, palmate or parallel) in a fine vein-gradient stroke, darker at the base and fading to the tip. One shape is never just repeated; the set gives the brand range while staying one hand. (A gentle sway here shows life — in-app the motifs sit still.)
        </div>

        <SprigDivider />

        {/* (C) CORNER TREATMENTS */}
        <Eyebrow mb={10} color={T.gold}>Corner treatments — a framing system</Eyebrow>
        <div style={{ display: "flex", gap: 10 }}>
          {[["sprig", "Sprig", T.sage], ["carved", "Carved", T.gold], ["tendril", "Tendril", "#8E6E8E"]].map(([v, lbl, c]) => (
            <div key={v} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ position: "relative", height: 104, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 2, left: 2 }}><CornerSprig variant={v} color={c} corner="tl" size={68} opacity={0.8} idx={v} /></div>
                <div style={{ position: "absolute", bottom: 2, right: 2 }}><CornerSprig variant={v} color={c} corner="br" size={68} opacity={0.45} idx={`${v}b`} /></div>
              </div>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginTop: 6, textAlign: "center" }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <BrandFrame color={T.gold} variant="sprig" opacity={0.55} size={58}>
            <div style={{ textAlign: "center" }}>
              <HeaderFlourish color={T.gold}><span style={{ fontFamily: SCRIPT, fontSize: 28, color: T.ink, padding: "0 8px" }}>A framed page</span></HeaderFlourish>
              <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, marginTop: 8 }}>Four corner sprigs turn a feature card or page into a quiet frame — delicate, low-opacity, growing inward from each corner. Used on a hero, never on every card.</div>
            </div>
          </BrandFrame>
        </div>

        <FleuronDivider />

        {/* (D) DIVIDERS & FLOURISHES */}
        <Eyebrow mb={10} color={T.gold}>Dividers &amp; flourishes</Eyebrow>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "6px 16px 12px" }}>
          {[["Leaf rule", <LeafDivider key="d1" />], ["Sprig", <SprigDivider key="d2" w={220} />], ["Fleuron", <FleuronDivider key="d3" />]].map(([lbl, el]) => (
            <div key={lbl}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginTop: 8 }}>{lbl}</div>
              {el}
            </div>
          ))}
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginTop: 8 }}>Header flourish</div>
          <div style={{ padding: "8px 0 4px" }}><HeaderFlourish color={T.gold}><span style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink, padding: "0 8px" }}>Today</span></HeaderFlourish></div>
        </div>

        <LeafDivider />

        {/* (E) BOTANICAL MOTIF */}
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
