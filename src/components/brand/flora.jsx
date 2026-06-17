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
export const floraKeyframes = `@keyframes fwcBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@keyframes fwcSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg) translateY(-1px)}}@keyframes fwcShimmer{0%,100%{opacity:.45}50%{opacity:.85}}@keyframes fwcDrift{0%,100%{transform:translate(0,0) rotate(-3deg)}50%{transform:translate(4px,-5px) rotate(3deg)}}@keyframes fwcFlutter{0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.86)}}@keyframes fwcGlow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.72;transform:scale(1.04)}}@media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}}`;

// ── RichBloomV2 — the canonical crafted bloom (BRAND_IDENTITY §5) ─────────────
const PETAL_BLOOM_CX = 50, PETAL_BLOOM_CY = 50;
function petalPath(len, wid) {
  const w = wid, L = len;
  return `M0 0
    C ${-w} ${-L * 0.30} ${-w * 0.92} ${-L * 0.80} ${-w * 0.34} ${-L * 0.95}
    Q 0 ${-L * 0.86} ${w * 0.34} ${-L * 0.95}
    C ${w * 0.92} ${-L * 0.80} ${w} ${-L * 0.30} 0 0 Z`;
}
// per-FORM ring grammar — keeps the lush layered-ring craft, varies the silhouette to the
// companion's real form_key (BRAND_IDENTITY §5.2). [count, len, wid, rotation, gradCode, opacity].
// peony is the canonical default → identical to the original bloom, so other consumers are unaffected.
const FORM_RINGS = {
  peony:  [[11, 30, 8.5, 0, "O", 0.97], [10, 23, 7, 18, "M", 0.98], [7, 15, 5.4, 9, "I", 0.99]],
  poppy:  [[5, 34, 13, 0, "O", 0.96], [5, 21, 9.5, 36, "M", 0.98]],            // few big cupped petals, dark eye
  daisy:  [[17, 35, 3.5, 0, "O", 0.97], [17, 29, 3.0, 10.6, "M", 0.98]],       // many narrow rays, bright disc
  forget: [[5, 24, 11.5, 0, "O", 0.96], [5, 15, 7.5, 36, "M", 0.98]],          // 5 rounded petals, yellow eye
};
// which forms render a dedicated head (not petal rings)
const FORM_BELL = "foxglove", FORM_FERN = "fern";

export function RichBloomV2({ color = T.blush, color2 = null, accent = "#CBA24E", size = 150, animate = true, soft = true, idx = 0, form = "peony" }) {
  const cx = PETAL_BLOOM_CX, cy = PETAL_BLOOM_CY;
  const lightest = color2 || lighten(color, 0.52), light = lighten(color, 0.34), mid = lighten(color, 0.14), deep = color, deeper = darken(color, 0.13);
  const gid = `v2${idx}`;
  const delay = `${(idx % 5) * 0.7}s`;
  const formKey = (typeof form === "string" ? form : form?.key) || "peony";
  const gradFor = (code) => code === "O" ? `pO-${gid}` : code === "M" ? `pM-${gid}` : `pI-${gid}`;
  const edgeFor = (code) => code === "O" ? deeper : code === "M" ? deep : mid;
  const ring = (count, len, wid, gradId, op, rot, edge) => Array.from({ length: count }).map((_, i) => {
    const ang = rot + i * (360 / count);
    return <path key={`${gradId}-${i}`} d={petalPath(len, wid)} fill={`url(#${gradId})`} opacity={op}
      stroke={edge} strokeWidth={edge ? 0.4 : undefined} strokeOpacity={edge ? 0.16 : undefined}
      transform={`translate(${cx} ${cy}) rotate(${ang})`} />;
  });

  // ── per-form HEAD renderers (all inside the breathing/swaying group) ──
  const petalHead = () => {
    const rings = FORM_RINGS[formKey] || FORM_RINGS.peony;
    const isPoppy = formKey === "poppy", isDaisy = formKey === "daisy", isForget = formKey === "forget";
    return (
      <>
        {rings.map(([count, len, wid, rot, code, op]) => (
          <React.Fragment key={`${code}-${rot}`}>{ring(count, len, wid, gradFor(code), op, rot, edgeFor(code))}</React.Fragment>
        ))}
        {isPoppy ? (
          <>
            <circle cx={cx} cy={cy} r="7.4" fill={darken(color, 0.46)} />
            {Array.from({ length: 11 }).map((_, i) => { const a = i * (360 / 11) * Math.PI / 180; const rr = 5.6; return <circle key={`stm${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r="0.9" fill={darken(color, 0.62)} opacity="0.9" />; })}
            <circle cx={cx} cy={cy} r="2.4" fill={darken(color, 0.3)} />
          </>
        ) : isForget ? (
          <>
            <circle cx={cx} cy={cy} r="3.9" fill="#F2D979" />
            <circle cx={cx} cy={cy} r="2.0" fill={lighten("#F2D979", 0.2)} />
            <circle cx={cx} cy={cy} r="0.9" fill="#FFFDF7" opacity="0.8" />
          </>
        ) : (
          <>
            <circle cx={cx} cy={cy} r={isDaisy ? 8.6 : 6.6} fill={`url(#ct-${gid})`} />
            {Array.from({ length: isDaisy ? 12 : 9 }).map((_, i) => { const a = i * (360 / (isDaisy ? 12 : 9)) * Math.PI / 180; const rr = isDaisy ? 6.2 : 4.6; return <circle key={`stm${i}`} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={isDaisy ? 1.2 : 1.05} fill={darken(accent, 0.12)} opacity="0.85" />; })}
            <circle cx={cx} cy={cy} r={isDaisy ? 3 : 2.2} fill={lighten(accent, 0.28)} />
          </>
        )}
        {/* dewy speculars — kept for petal forms */}
        <g style={animate ? { animation: `fwcShimmer 5s ease-in-out infinite`, animationDelay: delay } : undefined}>
          <ellipse cx={cx - 7} cy={cy - 11} rx="6.5" ry="3.4" fill="#FFFDF7" opacity="0.30" transform={`rotate(-24 ${cx - 7} ${cy - 11})`} />
          <circle cx={cx - 9} cy={cy - 6} r="1.5" fill="#FFFFFF" opacity="0.65" />
          <circle cx={cx + 6} cy={cy - 9} r="1.0" fill="#FFFFFF" opacity="0.45" />
        </g>
      </>
    );
  };
  const bellHead = () => {
    const bells = [
      { x: 50, y: 56, s: 1.18 }, { x: 42, y: 49, s: 1.02 }, { x: 57, y: 47, s: 0.96 },
      { x: 45, y: 39, s: 0.84 }, { x: 54, y: 33, s: 0.72 }, { x: 50, y: 26, s: 0.6 },
    ];
    return (
      <g>
        <path d="M50 62 C 49 46 51 30 50 18" stroke={`url(#st-${gid})`} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {bells.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
            <path d="M0 -7 C -5.2 -6 -6 0 -5 5.4 C -4 8.4 4 8.4 5 5.4 C 6 0 5.2 -6 0 -7 Z" fill={`url(#pM-${gid})`} stroke={deep} strokeWidth="0.3" strokeOpacity="0.22" />
            <ellipse cx="0" cy="5.6" rx="4.6" ry="1.9" fill={deeper} opacity="0.45" />
            <circle cx="-1.5" cy="3.2" r="0.5" fill={lightest} opacity="0.85" /><circle cx="1.5" cy="4.2" r="0.5" fill={lightest} opacity="0.75" />
            <ellipse cx="-2" cy="-3" rx="1.7" ry="1.05" fill="#FFFDF7" opacity="0.32" transform="rotate(-20 -2 -3)" />
          </g>
        ))}
      </g>
    );
  };
  const fernHead = () => {
    const frond = (rot, len, key) => {
      const pairs = 7;
      return (
        <g key={key} transform={`translate(${cx} 60) rotate(${rot})`}>
          <path d={`M0 0 Q 3 ${-len / 2} 1 ${-len}`} stroke={`url(#lf-${gid})`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {Array.from({ length: pairs }).map((_, i) => {
            const t = (i + 0.5) / pairs, yy = -len * t, ll = 5.6 * (1 - t * 0.66);
            return (
              <g key={i}>
                <ellipse cx={-ll * 0.7} cy={yy} rx={ll} ry={ll * 0.34} fill={`url(#lf-${gid})`} opacity="0.92" transform={`rotate(-32 ${-ll * 0.7} ${yy})`} />
                <ellipse cx={ll * 0.7} cy={yy} rx={ll} ry={ll * 0.34} fill={`url(#lf-${gid})`} opacity="0.92" transform={`rotate(32 ${ll * 0.7} ${yy})`} />
              </g>
            );
          })}
        </g>
      );
    };
    return <g>{frond(-20, 42, "fl")}{frond(0, 50, "fc")}{frond(20, 42, "fr")}</g>;
  };
  const head = formKey === FORM_BELL ? bellHead() : formKey === FORM_FERN ? fernHead() : petalHead();

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
          {head}
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

// ── CardFrame — the canonical "framed card" treatment (the Today bar): the §4.2 corner element in
// ALL FOUR corners, visible per the lush tone dial. Overlay it INSIDE a position:relative;
// overflow:hidden card (it doesn't impose a background, unlike BrandFrame). Set card content
// position:relative so it paints above the corners. Shared so every page frames cards identically.
export function CardFrame({ variant = "sprig", color = T.gold, opacity = 0.62, size = 50 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// ── clampLines — safe-text style: wrap + N-line clamp so nothing bleeds off a card/page (the Today
// overflow fix). Spread into a text node's style: {...clampLines(2)}. ───────────────────────────────
export function clampLines(n = 2) {
  return { minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" };
}

// ── FLOWER GLYPH — 18 species, colourway-parameterised (BRAND_IDENTITY §5.2) ──────────────────────
export function FlowerGlyph({ variant = "camellia", size = 52, color = T.crimson, color2 = null, accent = "#2E261B", idx = 0 }) {
  const gid = `fg-${variant}-${idx}`;
  const cx = 20, cy = 20;
  const grad = (
    <radialGradient id={`fgr-${gid}`} cx="50%" cy="40%" r="64%">
      <stop offset="0%" stopColor={color2 || lighten(color, 0.34)} /><stop offset="58%" stopColor={color} /><stop offset="100%" stopColor={darken(color, 0.08)} />
    </radialGradient>
  );
  let body;
  if (variant === "poppy") {
    body = (<g>{[18, 100, 182, 264].map((a, i) => <ellipse key={i} cx={cx} cy={cy - 9} rx="8.2" ry="10" fill={`url(#fgr-${gid})`} opacity="0.95" transform={`rotate(${a} ${cx} ${cy})`} />)}<circle cx={cx} cy={cy} r="4.2" fill={darken(color, 0.34)} />{Array.from({ length: 8 }).map((_, i) => { const a = i * 45 * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a) * 3} cy={cy + Math.sin(a) * 3} r="0.7" fill={lighten(color, 0.2)} />; })}</g>);
  } else if (variant === "sunflower") {
    body = (<g>{Array.from({ length: 18 }).map((_, i) => <ellipse key={i} cx={cx} cy={cy - 11} rx="2.4" ry="7" fill={`url(#fgr-${gid})`} opacity="0.95" transform={`rotate(${i * 20} ${cx} ${cy})`} />)}<circle cx={cx} cy={cy} r="6.4" fill={accent} /><circle cx={cx} cy={cy} r="6.4" fill="none" stroke={darken(color, 0.2)} strokeWidth="0.5" opacity="0.5" />{Array.from({ length: 10 }).map((_, i) => { const a = i * 36 * Math.PI / 180; return <circle key={i} cx={cx + Math.cos(a) * 3.6} cy={cy + Math.sin(a) * 3.6} r="0.8" fill={lighten(accent, 0.18)} />; })}</g>);
  } else if (variant === "dahlia") {
    const petal = "M0 0 C -2.6 -4 -2.4 -9 0 -13 C 2.4 -9 2.6 -4 0 0 Z";
    body = (<g>{Array.from({ length: 12 }).map((_, i) => <path key={`o${i}`} d={petal} fill={color} opacity="0.9" transform={`translate(${cx} ${cy}) rotate(${i * 30}) translate(0 -3)`} />)}{Array.from({ length: 9 }).map((_, i) => <path key={`m${i}`} d={petal} fill={`url(#fgr-${gid})`} opacity="0.95" transform={`translate(${cx} ${cy}) rotate(${i * 40 + 18}) scale(0.7) translate(0 -3)`} />)}<circle cx={cx} cy={cy} r="2.6" fill={darken(color, 0.28)} /></g>);
  } else if (variant === "lotus") {
    const pet = (s, dy, fill, o) => <path d="M0 0 C -5 -6 -5 -16 0 -22 C 5 -16 5 -6 0 0 Z" fill={fill} opacity={o} transform={`translate(${cx} ${cy + dy}) scale(${s})`} />;
    body = (<g><path d="M20 20 C 6 16 2 20 2 20 C 6 26 14 24 20 20 Z" fill={color} opacity="0.55" /><path d="M20 20 C 34 16 38 20 38 20 C 34 26 26 24 20 20 Z" fill={color} opacity="0.55" />{[-32, 32].map((a, i) => <path key={i} d="M0 0 C -4 -6 -4 -15 0 -20 C 4 -15 4 -6 0 0 Z" fill={color} opacity="0.7" transform={`translate(${cx} ${cy + 1}) rotate(${a})`} />)}{pet(1, 1, `url(#fgr-${gid})`, 0.96)}<circle cx={cx} cy={cy - 5} r="1.6" fill={lighten(accent, 0.2)} /></g>);
  } else if (variant === "cornflower") {
    body = (<g>{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M0 0 L -1.7 -10 L 0 -13 L 1.7 -10 Z" fill={`url(#fgr-${gid})`} opacity="0.92" transform={`translate(${cx} ${cy}) rotate(${i * 30})`} />)}{Array.from({ length: 6 }).map((_, i) => <path key={`b${i}`} d="M0 0 L -1.3 -6 L 0 -8 L 1.3 -6 Z" fill={darken(color, 0.12)} opacity="0.9" transform={`translate(${cx} ${cy}) rotate(${i * 60 + 30})`} />)}<circle cx={cx} cy={cy} r="2.6" fill={darken(color, 0.3)} /></g>);
  } else if (variant === "lavender") {
    body = (<g><path d="M20 38 C 20 30 20 22 20 12" fill="none" stroke="#7E9A7E" strokeWidth="1.3" strokeLinecap="round" /><path d="M20 30 C 14 30 12 27 12 23 M20 26 C 26 26 28 23 28 19" stroke="#8FAF8F" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8" />{Array.from({ length: 8 }).map((_, i) => <ellipse key={i} cx={20 + (i % 2 ? 2.6 : -2.6)} cy={6 + i * 1.7} rx="2.4" ry="3" fill={`url(#fgr-${gid})`} opacity="0.95" />)}</g>);
  } else if (variant === "rose") {
    body = (<g>{[0, 1].map((ring) => Array.from({ length: 5 }).map((_, i) => <path key={`${ring}-${i}`} d="M0 0 C -5 -3 -5 -9 0 -11 C 5 -9 5 -3 0 0 Z" fill={`url(#fgr-${gid})`} opacity={ring ? 0.98 : 0.88} transform={`translate(${cx} ${cy}) rotate(${i * 72 + ring * 36}) scale(${ring ? 0.62 : 1}) translate(0 -3)`} />))}<path d="M20 20 C 17 19 16 16 18 14 C 20 13 22 15 21 17 C 20.4 18 19 18 19 17" fill="none" stroke={darken(color, 0.2)} strokeWidth="0.8" opacity="0.6" /></g>);
  } else if (variant === "iris") {
    body = (<g>{[-18, 0, 18].map((a, i) => <ellipse key={`u${i}`} cx={cx} cy={cy - 9} rx="3.6" ry="7" fill={`url(#fgr-${gid})`} opacity="0.9" transform={`rotate(${a} ${cx} ${cy})`} />)}{[150, 180, 210].map((a, i) => <path key={`f${i}`} d="M0 0 C -3.4 4 -3 10 0 13 C 3 10 3.4 4 0 0 Z" fill={`url(#fgr-${gid})`} opacity="0.96" transform={`translate(${cx} ${cy}) rotate(${a - 180})`} />)}<path d="M20 20 C 19 24 19 28 20 31" stroke={lighten("#D4AF37", 0.1)} strokeWidth="1.4" fill="none" opacity="0.8" strokeLinecap="round" /></g>);
  } else if (variant === "primrose") {
    body = (<g>{Array.from({ length: 5 }).map((_, i) => { const a = (i * 72 - 90) * Math.PI / 180; return <ellipse key={i} cx={cx + Math.cos(a) * 8} cy={cy + Math.sin(a) * 8} rx="5" ry="6" fill={`url(#fgr-${gid})`} opacity="0.95" transform={`rotate(${i * 72} ${cx + Math.cos(a) * 8} ${cy + Math.sin(a) * 8})`} />; })}<circle cx={cx} cy={cy} r="3.4" fill="#D8C24E" /><circle cx={cx} cy={cy} r="1.4" fill={lighten("#D4AF37", 0.2)} /></g>);
  } else if (variant === "bluebell") {
    body = (<g><path d="M20 4 C 19 12 20 18 20 22" stroke="#7E9A7E" strokeWidth="1.1" fill="none" strokeLinecap="round" />{[[13, 16, -22], [20, 22, 4], [27, 17, 24]].map(([x, y, r], i) => <g key={i} transform={`rotate(${r} ${x} ${y})`}><path d={`M${x} ${y - 7} C ${x - 4} ${y - 6} ${x - 4} ${y} ${x - 3} ${y + 3} C ${x - 1.5} ${y + 5} ${x + 1.5} ${y + 5} ${x + 3} ${y + 3} C ${x + 4} ${y} ${x + 4} ${y - 6} ${x} ${y - 7} Z`} fill={`url(#fgr-${gid})`} opacity="0.95" /></g>)}</g>);
  } else if (variant === "violet") {
    body = (<g>{[[-7, -5], [7, -5], [-8, 3], [8, 3]].map(([dx, dy], i) => <ellipse key={i} cx={cx + dx} cy={cy + dy} rx="5.2" ry="6" fill={`url(#fgr-${gid})`} opacity="0.95" />)}<ellipse cx={cx} cy={cy + 8} rx="6.5" ry="7" fill={`url(#fgr-${gid})`} opacity="0.96" /><circle cx={cx} cy={cy} r="2.6" fill={lighten("#D4AF37", 0.1)} /></g>);
  } else { // camellia (default) — concentric rounded petals
    body = (<g>{[0, 1].map((ring) => Array.from({ length: 6 }).map((_, i) => <ellipse key={`${ring}-${i}`} cx={cx} cy={cy - (ring ? 5 : 8)} rx={ring ? 4.2 : 5.4} ry={ring ? 5 : 7} fill={`url(#fgr-${gid})`} opacity={ring ? 0.98 : 0.9} transform={`rotate(${i * 60 + ring * 30} ${cx} ${cy})`} />))}<circle cx={cx} cy={cy} r="3" fill={lighten("#D4AF37", 0.08)} /></g>);
  }
  return <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden><defs>{grad}</defs>{body}</svg>;
}

// ── BUTTERFLY — transformation + return. Gentle drift + faint flutter (isolated, reduced-motion-safe).
export function Butterfly({ size = 46, color = "#8E6E8E", color2 = T.gold, pattern = "spots", animate = true, idx = 0 }) {
  const gid = `bf-${idx}`;
  let marks;
  if (pattern === "bands") marks = <g fill="none" stroke={color2} strokeWidth="2.2" strokeLinecap="round" opacity="0.8"><path d="M7 11 C 12 13 17 14 22 15" /><path d="M11 31 C 15 30 19 28 22 26" /></g>;
  else if (pattern === "eyes") marks = <g><circle cx="10" cy="13" r="2.6" fill={color2} opacity="0.9" /><circle cx="10" cy="13" r="1.1" fill={darken(color, 0.3)} /><circle cx="14" cy="30" r="2" fill={color2} opacity="0.8" /><circle cx="14" cy="30" r="0.9" fill={darken(color, 0.3)} /></g>;
  else marks = <g><circle cx="9" cy="13" r="1.6" fill="#FFFDF7" opacity="0.6" /><circle cx="13" cy="11" r="1" fill={color2} opacity="0.7" /><circle cx="15" cy="30" r="1.2" fill={color2} opacity="0.7" /></g>;
  const wingL = (<g><path d="M24 15 C 17 6 5 5 3 13 C 2 19 11 22 24 20 Z" fill={`url(#bw-${gid})`} /><path d="M24 21 C 15 22 8 28 12 34 C 16 38 23 31 24 24 Z" fill={`url(#bw2-${gid})`} />{marks}</g>);
  return (
    <svg viewBox="0 0 48 42" width={size} height={Math.round(size * 0.88)} aria-hidden
      style={animate ? { transformBox: "fill-box", transformOrigin: "center", willChange: "transform", animation: "fwcDrift 7s ease-in-out infinite", animationDelay: `${(idx % 4) * 0.9}s` } : undefined}>
      <defs>
        <linearGradient id={`bw-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lighten(color, 0.28)} /><stop offset="100%" stopColor={color} /></linearGradient>
        <linearGradient id={`bw2-${gid}`} x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={darken(color, 0.12)} /></linearGradient>
      </defs>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "right center", animation: "fwcFlutter 0.9s ease-in-out infinite" } : undefined}>{wingL}</g>
      <g style={animate ? { transformBox: "fill-box", transformOrigin: "left center", animation: "fwcFlutter 0.9s ease-in-out infinite" } : undefined} transform="translate(48 0) scale(-1 1)">{wingL}</g>
      <path d="M24 11 C 22.8 19 22.8 28 24 34 C 25.2 28 25.2 19 24 11 Z" fill="#2E261B" /><circle cx="24" cy="11" r="1.6" fill="#2E261B" />
      <path d="M24 10 C 22 6 20 4 18 3" stroke="#2E261B" strokeWidth="0.7" fill="none" strokeLinecap="round" /><path d="M24 10 C 26 6 28 4 30 3" stroke="#2E261B" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    </svg>
  );
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
