// FemWell brand flora — the canonical, reusable craft components.
// Promoted from pages/BrandCraftSample.jsx so production surfaces (Today, Garden…)
// import the SAME approved bloom + colourway grammar instead of re-deriving.
// Spec: claude-state/BRAND_IDENTITY.md §2.5 (colourways), §5 (bloom), §5.2 (fingerprint).
//
// NOTE: BrandCraftSample.jsx still holds its own copies of the wider glyph set
// (FlowerGlyph/Creature/leaf/corner/divider/MiniGarden). This module exports the
// pieces production needs now — RichBloomV2 + the colourway/fingerprint grammar.
// De-dup the sample to import from here in a later pass.

import React from "react";
import { T } from "@/components/journal/Editorial";

// ── colour helpers ──────────────────────────────────────────────────────────
export function lighten(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amt));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amt));
  const b = Math.min(255, (n & 255) + Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
export function darken(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 255) - Math.round(255 * amt));
  const g = Math.max(0, ((n >> 8) & 255) - Math.round(255 * amt));
  const b = Math.max(0, (n & 255) - Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ── the 9 colourways (BRAND_IDENTITY §2.5) — colour carries meaning ───────────
export const COLORWAYS = [
  { key: "crimson", label: "Crimson", meaning: "love · remembrance", petal: "#BC2E27", tip: "#D9554E", accent: "#2E261B" },
  { key: "blush", label: "Blush", meaning: "grace · tenderness", petal: "#E8B4B8", tip: "#F4D9DC", accent: "#A8893F" },
  { key: "gold", label: "Gold", meaning: "joy · radiance", petal: "#D4AF37", tip: "#E8CE78", accent: "#6B5840" },
  { key: "sage", label: "Sage", meaning: "renewal · hope", petal: "#8FAF8F", tip: "#B6CDB6", accent: "#2E261B" },
  { key: "plum", label: "Plum", meaning: "dignity · wisdom", petal: "#8E6E8E", tip: "#B196B1", accent: "#D4AF37" },
  { key: "lavender", label: "Lavender", meaning: "devotion · serenity", petal: "#B6A6C9", tip: "#D4C9E2", accent: "#8E6E8E" },
  { key: "cream", label: "Cream", meaning: "purity · a fresh start", petal: "#E4DAC1", tip: "#F2EAD6", accent: "#A8893F" },
  { key: "coral", label: "Coral", meaning: "warmth · enthusiasm", petal: "#E08A6A", tip: "#F0B79E", accent: "#8E3B2C" },
  { key: "sky", label: "Sky", meaning: "trust · constancy", petal: "#9FB6C9", tip: "#C3D2DE", accent: "#5F7E8E" },
];
export const cwOf = (key) => COLORWAYS.find((c) => c.key === key) || COLORWAYS[0];

// ── per-user flora fingerprint (deterministic; same garden on every device) ───
export function hashSeed(s) { let h = 2166136261; for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function seededRng(seed) { let x = (seed || 1) >>> 0; return () => { x = (Math.imul(x, 1103515245) + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }
// Stable per-user colourway for the companion bloom (the fingerprint's signature hue).
export function fingerprintColourway(userId) { return COLORWAYS[hashSeed(userId || "femwell") % COLORWAYS.length]; }

// ── keyframes (inject once per page that renders a RichBloomV2) ───────────────
export const floraKeyframes = `@keyframes fwcBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@keyframes fwcSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg) translateY(-1px)}}@keyframes fwcShimmer{0%,100%{opacity:.45}50%{opacity:.85}}@media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}}`;

// ── RichBloomV2 — the canonical crafted bloom (BRAND_IDENTITY §5) ─────────────
const PETAL_BLOOM_CX = 50, PETAL_BLOOM_CY = 50;
function petalPath(len, wid) {
  const w = wid, L = len;
  return `M0 0
    C ${-w} ${-L * 0.30} ${-w * 0.92} ${-L * 0.80} ${-w * 0.34} ${-L * 0.95}
    Q 0 ${-L * 0.86} ${w * 0.34} ${-L * 0.95}
    C ${w * 0.92} ${-L * 0.80} ${w} ${-L * 0.30} 0 0 Z`;
}
export function RichBloomV2({ color = T.blush, color2 = null, accent = "#CBA24E", size = 150, animate = true, soft = true, idx = 0 }) {
  const cx = PETAL_BLOOM_CX, cy = PETAL_BLOOM_CY;
  const lightest = color2 || lighten(color, 0.52), light = lighten(color, 0.34), mid = lighten(color, 0.14), deep = color, deeper = darken(color, 0.13);
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
      {soft && (
        <svg viewBox="0 0 100 105" width={size} height={Math.round(size * 1.05)} aria-hidden style={{ position: "absolute", inset: 0 }}>
          <defs><filter id={`bl-${gid}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.9" /></filter></defs>
          <ellipse cx={cx} cy={97} rx={20} ry={4.6} fill="#2E261B" opacity="0.22" filter={`url(#bl-${gid})`} />
        </svg>
      )}
      <svg viewBox="0 0 100 105" width={size} height={Math.round(size * 1.05)} aria-hidden style={{ position: "relative", overflow: "visible" }}>
        <defs>
          <linearGradient id={`pO-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={mid} /><stop offset="52%" stopColor={deep} /><stop offset="100%" stopColor={deeper} /></linearGradient>
          <linearGradient id={`pM-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={light} /><stop offset="50%" stopColor={mid} /><stop offset="100%" stopColor={deep} /></linearGradient>
          <linearGradient id={`pI-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lightest} /><stop offset="60%" stopColor={light} /><stop offset="100%" stopColor={mid} /></linearGradient>
          <radialGradient id={`gl-${gid}`} cx="50%" cy="46%" r="52%"><stop offset="0%" stopColor={lightest} stopOpacity="0.30" /><stop offset="100%" stopColor={color} stopOpacity="0" /></radialGradient>
          <radialGradient id={`ct-${gid}`} cx="50%" cy="42%" r="60%"><stop offset="0%" stopColor={lighten(accent, 0.3)} /><stop offset="100%" stopColor={accent} /></radialGradient>
          <linearGradient id={`st-${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8FAF8F" /><stop offset="100%" stopColor="#5F7E5F" /></linearGradient>
          <linearGradient id={`lf-${gid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9DBE9D" /><stop offset="100%" stopColor="#6E8E6E" /></linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r="36" fill={`url(#gl-${gid})`} />
        <path d={`M48.4 97 C 47.9 84 49.4 70 49 60 L 51 60 C 51.4 70 52 84 51.5 97 Z`} fill={`url(#st-${gid})`} />
        <g>
          <path d="M49 78 C 37 74 29 77 26 86 C 37 88 47 83 49 77 Z" fill={`url(#lf-${gid})`} opacity="0.95" />
          <path d="M49 78 C 41 79 33 82 27 86" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M42 79 L 39 76 M37 81 L 34 79 M33 83 L 31 82" stroke="#5F7E5F" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M51 71 C 63 67 71 70 74 79 C 63 81 53 76 51 70 Z" fill={`url(#lf-${gid})`} opacity="0.9" />
          <path d="M51 71 C 59 72 67 75 73 79" stroke="#5F7E5F" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65" />
        </g>
        <g style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: `fwcBreath 6s ease-in-out infinite`, animationDelay: delay } : undefined}>
          {ring(11, 30, 8.5, `pO-${gid}`, 0.97, 0, deeper)}
          {ring(10, 23, 7, `pM-${gid}`, 0.98, 18, deep)}
          {ring(7, 15, 5.4, `pI-${gid}`, 0.99, 9, mid)}
          <circle cx={cx} cy={cy} r="6.6" fill={`url(#ct-${gid})`} />
          {Array.from({ length: 9 }).map((_, i) => { const a = i * 40 * Math.PI / 180; const rr = 4.6; return <circle key={`stm${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="1.05" fill={darken(accent, 0.12)} opacity="0.85" />; })}
          <circle cx={cx} cy={cy} r="2.2" fill={lighten(accent, 0.28)} />
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

// a bloom that gently sways around its stem base (wrap RichBloomV2)
export function SwayBloom({ children, animate = true, idx = 0 }) {
  return (
    <div style={animate ? { display: "inline-block", transformOrigin: "bottom center", animation: "fwcSway 8s ease-in-out infinite", animationDelay: `${(idx % 5) * 0.9}s` } : { display: "inline-block" }}>
      {children}
    </div>
  );
}

// ── BOTANICAL BRAND-IMAGE GLYPHS (BRAND_IDENTITY §4) — corners · dividers · motifs · leaves ────────
// Promoted from BrandCraftSample so production surfaces (Today…) render the real craft.

// elevated vine motif — tapered gradient stem, veined leaves, tendril + bud (low-opacity page texture)
export function VineMotifV2({ color = T.gold, color2, opacity = 0.5, w = 130, flip = false, idx = 0 }) {
  const c2 = color2 || color, gid = `vm${idx}${flip ? "f" : ""}`;
  return (
    <svg width={w} height={w} viewBox="0 0 140 140" aria-hidden style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <defs>
        <linearGradient id={`vs-${gid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" /><stop offset="32%" stopColor={color} stopOpacity={opacity} /><stop offset="100%" stopColor={c2} stopOpacity={opacity * 0.72} />
        </linearGradient>
      </defs>
      <path d="M10 132 C 30 112 34 86 28 62 C 24 44 32 28 50 18 L 52.6 19.6 C 35 30 27 45 31 62 C 37 86 33 112 12.4 133 Z" fill={`url(#vs-${gid})`} />
      <g fill="none" stroke={`url(#vs-${gid})`} strokeWidth="1.05" strokeLinecap="round">
        <path d="M29 64 C 16 60 9 49 11 38 C 23 42 30 52 29 64 Z" />
        <path d="M29 64 C 23 56 17 49 12 39" strokeWidth="0.8" />
        <path d="M24 56 L 19 56 M21 50 L 16 49 M19 45 L 15 43" strokeWidth="0.6" opacity="0.8" />
        <path d="M31 50 C 45 47 53 38 54 26 C 42 29 33 38 31 50 Z" />
        <path d="M31 50 C 39 43 47 36 53 27" strokeWidth="0.8" />
        <path d="M40 42 L 41 37 M45 38 L 47 33 M49 34 L 52 30" strokeWidth="0.6" opacity="0.8" />
        <path d="M27 92 C 15 89 8 80 10 70 C 22 74 28 82 27 92 Z" />
        <path d="M27 92 C 22 84 16 77 11 71" strokeWidth="0.8" />
        <path d="M50 18 C 58 14 64 17 66 24 C 67 29 63 33 59 31 C 56 29.5 57 25 61 26" strokeWidth="0.9" />
        <circle cx="50" cy="18" r="2.1" fill={color} stroke="none" opacity={opacity} />
        <circle cx="61" cy="26" r="1.3" fill={c2} stroke="none" opacity={opacity * 0.8} />
      </g>
    </svg>
  );
}

// leaf-rule divider (a hairline broken by one veined leaf-eye)
export function LeafDivider({ color = T.gold, my = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: `${my}px 0` }}>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
      <svg width="30" height="16" viewBox="0 0 30 16" fill="none" stroke={color} strokeWidth="1.1" aria-hidden opacity="0.8">
        <path d="M3 8 C 9 1 21 1 27 8 C 21 15 9 15 3 8 Z" /><path d="M3 8 H 27" strokeWidth="0.8" />
        <path d="M9 5 L 11 8 M14 4 L 15 8 M19 5 L 18 8 M23 6 L 21 8" strokeWidth="0.55" opacity="0.8" />
      </svg>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
    </div>
  );
}

// sprig divider — a fading stem with alternating leaves
export function SprigDivider({ color = T.gold, w = 240, my = 22 }) {
  const u = `sf${String(color).replace("#", "")}`;
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: `${my}px 0` }}>
      <svg width={w} height="26" viewBox="0 0 240 26" aria-hidden fill="none" stroke={color} strokeLinecap="round">
        <defs>
          <linearGradient id={u} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0" /><stop offset="22%" stopColor={color} stopOpacity="0.55" /><stop offset="50%" stopColor={color} stopOpacity="0.7" /><stop offset="78%" stopColor={color} stopOpacity="0.55" /><stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M8 13 H 232" stroke={`url(#${u})`} strokeWidth="1" />
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

// fleuron divider — a quatrefoil ornament between two short rules (chapter-grade break)
export function FleuronDivider({ color = T.gold, w = 200, my = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: `${my}px 0` }}>
      <span style={{ width: w * 0.34, height: 1, background: color, opacity: 0.4 }} />
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.8">
        <path d="M11 11 C 11 5 14 2 18 3 C 17 7 14 10 11 11 Z" /><path d="M11 11 C 17 11 20 14 19 18 C 15 17 12 14 11 11 Z" />
        <path d="M11 11 C 11 17 8 20 4 19 C 5 15 8 12 11 11 Z" /><path d="M11 11 C 5 11 2 8 3 4 C 7 5 10 8 11 11 Z" />
        <circle cx="11" cy="11" r="1.3" fill={color} stroke="none" />
      </svg>
      <span style={{ width: w * 0.34, height: 1, background: color, opacity: 0.4 }} />
    </div>
  );
}

// corner-treatment — sprig / carved / tendril (drawn for a corner; rotate for the others)
export function CornerSprig({ variant = "sprig", color = T.gold, size = 74, opacity = 0.7, corner = "tl", idx = 0 }) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[corner] || 0;
  const stroke = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", opacity };
  let body;
  if (variant === "tendril") {
    body = (
      <g {...stroke} strokeWidth="1.05">
        <path d="M5 5 C 24 9 40 24 48 46" />
        <path d="M48 46 C 52 56 62 58 66 50 C 69 44 64 38 58 40 C 53 41.5 53 48 58 48" />
        <path d="M22 8 C 28 6 33 9 34 15" strokeWidth="0.8" /><path d="M40 26 C 46 24 51 27 51 33" strokeWidth="0.8" />
        <circle cx="5" cy="5" r="1.5" fill={color} stroke="none" />
      </g>
    );
  } else if (variant === "carved") {
    body = (
      <g>
        <g fill="none" stroke="#FFFDF7" strokeWidth="1.1" strokeLinecap="round" opacity={Math.min(0.5, opacity)} transform="translate(0.7 0.7)"><path d="M8 64 L 8 8 L 64 8" /><path d="M14 64 L 14 14 L 64 14" /></g>
        <g fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity={opacity}>
          <path d="M8 64 L 8 8 L 64 8" /><path d="M14 64 L 14 14 L 64 14" />
          <path d="M14 14 C 24 16 30 22 31 32 C 22 31 16 24 14 14 Z" /><path d="M14 14 C 21 19 27 25 31 32" strokeWidth="0.55" />
          <circle cx="8" cy="8" r="1.7" fill={color} stroke="none" />
        </g>
      </g>
    );
  } else {
    body = (
      <g {...stroke} strokeWidth="1.1">
        <path d="M6 6 C 22 10 34 22 40 42 C 43 52 49 58 60 60" />
        <path d="M20 9 C 26 6 33 8 36 15 C 29 17 22 14 20 9 Z" /><path d="M20 9 C 27 11 32 13 36 15" strokeWidth="0.6" />
        <path d="M37 30 C 34 24 36 17 43 13 C 45 20 43 27 37 30 Z" /><path d="M37 30 C 38 24 40 19 43 14" strokeWidth="0.6" />
        <path d="M41 47 C 47 44 54 46 57 53 C 50 55 43 52 41 47 Z" />
        <circle cx="60" cy="60" r="2.4" fill={color} stroke="none" /><circle cx="6" cy="6" r="1.6" fill={color} stroke="none" />
      </g>
    );
  }
  return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden style={{ transform: `rotate(${rot}deg)`, display: "block" }}>{body}</svg>;
}

// a delicate single corner ornament positioned in a card corner (absolute; pass into a relative card)
export function CardCorner({ variant = "sprig", color = T.gold, size = 52, opacity = 0.5, corner = "tr" }) {
  const pos = { ...(corner.includes("t") ? { top: 0 } : { bottom: 0 }), ...(corner.includes("l") ? { left: 0 } : { right: 0 }) };
  return <div style={{ position: "absolute", pointerEvents: "none", zIndex: 0, ...pos }}><CornerSprig variant={variant} color={color} corner={corner} size={size} opacity={opacity} /></div>;
}

// a feature card framed with four delicate corner sprigs
export function BrandFrame({ children, color = T.gold, variant = "sprig", opacity = 0.55, size = 58, style }) {
  return (
    <div style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 20, padding: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)", ...style }}>
      {["tl", "tr", "br", "bl"].map((c) => (
        <div key={c} style={{ position: "absolute", pointerEvents: "none", ...(c.includes("t") ? { top: 3 } : { bottom: 3 }), ...(c.includes("l") ? { left: 3 } : { right: 3 }) }}>
          <CornerSprig variant={variant} color={color} corner={c} size={size} opacity={opacity} />
        </div>
      ))}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
