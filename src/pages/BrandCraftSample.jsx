// BrandCraftSample — Phase-1 craft-direction sample for the canonical brand system.
// PREVIEW ONLY (self-contained, no backend). Reachable via IDEAS → Brand & UX → Previews.
// Shows: (A) the CURRENT flat bloom vs an UPGRADED realistic bloom (3-stop petal gradient,
// soft grounding shadow, breath/sway, prefers-reduced-motion gated); (B) a tasteful botanical
// line-motif background; (C) the carved heart mark in context; (D) a LIVE perf measurement.
// Conforms to claude-state/BRAND_IDENTITY.md (type roles, tokens, no emoji). Live UI untouched.

import { useState, useEffect, useRef } from "react";
import { T, SERIF, UI, SCRIPT, Heart, Eyebrow, Script, Hand, PAPER_BG, useEditorialFonts } from "@/components/journal/Editorial";

// ── shared craft helpers ──────────────────────────────────────────────────────────────────────
function lighten(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amt));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amt));
  const b = Math.min(255, (n & 255) + Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
function petal(px, py, len, wid, ang, fill, o, key) {
  return <ellipse key={key} cx={px} cy={py - len / 2} rx={wid} ry={len / 2} fill={fill} opacity={o}
    transform={`rotate(${ang} ${px} ${py})`} />;
}

// ── (A1) CURRENT flat bloom — solid fill, no gradient/shadow/animation (the "generic" baseline) ─
function FlatBloom({ color = T.blush, accent = "#8E6E8E", size = 150 }) {
  const cx = 50, cy = 46;
  const ring = (count, len, wid, rad, fill, o) => Array.from({ length: count }).map((_, i) => {
    const ang = i * (360 / count); const a = (ang - 90) * Math.PI / 180;
    return petal(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, len, wid, ang, fill, o, `${count}-${i}`);
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <path d="M50 86 C 49 70 51 60 50 54" stroke="#8FAF8F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <g>
        {ring(9, 22, 6.5, 9, color, 0.94)}
        {ring(7, 15, 5, 5, color, 0.94)}
        <circle cx={cx} cy={cy} r="5" fill={accent} />
      </g>
    </svg>
  );
}

// ── (A2) UPGRADED realistic bloom — 3-stop petal gradient + soft grounding shadow + glow +
//        specular crown + breath/sway (GPU-cheap CSS transforms, prefers-reduced-motion gated) ──
function RichBloom({ color = T.blush, accent = "#8E6E8E", size = 150, animate = true, idx = 0 }) {
  const cx = 50, cy = 46;
  const light = lighten(color, 0.42), mid = lighten(color, 0.16), deep = color;
  const gid = `b${idx}`;
  const ring = (count, len, wid, rad, fill, o) => Array.from({ length: count }).map((_, i) => {
    const ang = i * (360 / count); const a = (ang - 90) * Math.PI / 180;
    return petal(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, len, wid, ang, fill, o, `${count}-${i}`);
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <defs>
        {/* 3-stop petal gradient: lit tip → mid → deep base (dimensional, non-flat) */}
        <linearGradient id={`pet-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light} /><stop offset="55%" stopColor={mid} /><stop offset="100%" stopColor={deep} />
        </linearGradient>
        {/* soft radial glow behind the head */}
        <radialGradient id={`glow-${gid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        {/* grounding shadow — ONE radial-gradient ellipse (NO blur filter; GPU-cheap depth) */}
        <radialGradient id={`sh-${gid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2E261B" stopOpacity="0.28" /><stop offset="70%" stopColor="#2E261B" stopOpacity="0.08" /><stop offset="100%" stopColor="#2E261B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* drop-shadow on the ground */}
      <ellipse cx={cx} cy={90} rx={22} ry={5.5} fill={`url(#sh-${gid})`} />
      <circle cx={cx} cy={cy} r="34" fill={`url(#glow-${gid})`} />
      {/* stem + two leaves */}
      <path d="M50 88 C 49 72 51 60 50 54" stroke="#7E9A7E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M50 72 C 39 68 33 71 31 78 C 40 79 48 76 50 71 Z" fill="#8FAF8F" opacity="0.92" />
      <path d="M50 66 C 61 62 67 65 69 72 C 60 73 52 70 50 65 Z" fill="#7A9A7A" opacity="0.86" />

      {/* flower head — the only animated group (breath); sway on the whole svg via class */}
      <g style={animate ? { transformOrigin: `${cx}px ${cy}px`, animation: "fwcBreath 6s ease-in-out infinite" } : undefined}>
        {ring(9, 24, 7, 9.5, `url(#pet-${gid})`, 0.96)}
        {ring(7, 16, 5.4, 5, light, 0.95)}
        {/* specular crown — a soft lit highlight near the top of the head */}
        <ellipse cx={cx} cy={cy - 9} rx="9" ry="5" fill="#FFFDF7" opacity="0.22" />
        <circle cx={cx} cy={cy} r="5" fill={accent} />
        <circle cx={cx - 1.4} cy={cy - 1.4} r="1.6" fill="#FFFDF7" opacity="0.5" />
      </g>
    </svg>
  );
}

function Card({ children, label, accent = T.gold }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 18, padding: "16px 16px 14px", textAlign: "center" }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// a hairline botanical vine (stroke-only line-art) — the motif spec, in code
function VineMotif({ color = T.gold, opacity = 0.5, w = 120, flip = false }) {
  return (
    <svg width={w} height={w} viewBox="0 0 120 120" aria-hidden style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity={opacity}>
        <path d="M8 112 C 30 96 36 70 30 48 C 26 32 34 18 52 10" />
        <path d="M30 70 C 18 66 12 56 14 46 C 24 50 30 58 30 70 Z" />
        <path d="M31 52 C 44 50 52 42 53 31 C 42 33 33 41 31 52 Z" />
        <path d="M27 92 C 16 90 10 82 11 73 C 21 76 27 83 27 92 Z" />
        <path d="M40 26 C 50 22 58 24 62 32" />
        <circle cx="52" cy="10" r="2.2" />
      </g>
    </svg>
  );
}

// a leaf divider — a hairline rule broken by one leaf-eye
function LeafDivider({ color = T.gold }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 18px" }}>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.45 }} />
      <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke={color} strokeWidth="1.2" aria-hidden opacity="0.75">
        <path d="M2 7 C 8 1 18 1 24 7 C 18 13 8 13 2 7 Z" /><path d="M2 7 H 24" />
      </svg>
      <span style={{ flex: 1, height: 1, background: color, opacity: 0.45 }} />
    </div>
  );
}

export default function BrandCraftSample() {
  useEditorialFonts();
  const [animate, setAnimate] = useState(true);
  const [fps, setFps] = useState(null);
  const [reduced, setReduced] = useState(false);
  const measuredRef = useRef(false);

  useEffect(() => {
    try { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { /* ignore */ }
  }, []);

  // measure average FPS over ~1.5s while the sample blooms animate
  const measure = () => {
    if (measuredRef.current) return; measuredRef.current = true;
    setFps(null);
    let frames = 0; let start = null;
    const step = (ts) => {
      if (start == null) start = ts;
      frames += 1;
      const elapsed = ts - start;
      if (elapsed < 1500) { requestAnimationFrame(step); }
      else { setFps(Math.round((frames / elapsed) * 1000)); measuredRef.current = false; }
    };
    requestAnimationFrame(step);
  };
  useEffect(() => { const id = setTimeout(measure, 600); return () => clearTimeout(id); }, []);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
      {/* breath/sway keyframes — ONE shared block, reduced-motion gated */}
      <style>{`@keyframes fwcBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}@keyframes fwcSway{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}@media (prefers-reduced-motion:reduce){.fwc-anim *{animation:none!important}}`}</style>

      {/* dev ribbon */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: T.ink, color: T.paper, padding: "8px 12px", fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Brand craft sample — approve the direction (preview only)
      </div>

      {/* a tasteful botanical motif in the page corners (low opacity, stroke-only) */}
      <div style={{ position: "absolute", top: 44, right: -10, pointerEvents: "none" }}><VineMotif color={T.sage} opacity={0.18} w={150} /></div>
      <div style={{ position: "absolute", bottom: 10, left: -14, pointerEvents: "none" }}><VineMotif color={T.gold} opacity={0.14} w={150} flip /></div>

      <div className={animate && !reduced ? "fwc-anim" : ""} style={{ maxWidth: 460, margin: "0 auto", padding: "18px 16px 0", position: "relative" }}>
        {/* page title with the heart in context */}
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <Heart size={16} />
            <Script size={42} color={T.ink}>The craft direction</Script>
            <Heart size={16} />
          </div>
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 4 }}>more real, more us — same calm.</Hand>
        </div>

        {/* (A) BLOOM — flat vs upgraded */}
        <Eyebrow mb={10} color={T.gold}>The bloom — current vs upgraded</Eyebrow>
        <div style={{ display: "flex", gap: 12 }}>
          <Card label="Current (flat)" accent={T.paperDeep}><FlatBloom size={140} /></Card>
          <Card label="Upgraded (depth + light)" accent={T.sage}>
            <div style={animate && !reduced ? { animation: "fwcSway 8s ease-in-out infinite", transformOrigin: "70px 90px" } : undefined}>
              <RichBloom size={140} animate={animate && !reduced} idx={1} />
            </div>
          </Card>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.55, margin: "12px 2px 0" }}>
          The upgrade adds a 3-stop petal gradient (lit tip → deep base), a specular crown, a soft radial glow, and a grounding shadow — depth without a single blur filter. It breathes (scale) and sways (rotate) on GPU-cheap CSS transforms only.
        </div>

        {/* scale row + motion toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 14 }}>
          {[64, 96, 130].map((s) => <RichBloom key={s} size={s} animate={animate && !reduced} idx={`s${s}`} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <button onClick={() => setAnimate((v) => !v)} style={{ background: animate ? T.sage : "transparent", color: animate ? "#fff" : T.muted, border: `1.5px solid ${T.sage}`, borderRadius: 99, padding: "6px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Motion: {animate ? "on" : "off"}
          </button>
        </div>
        {reduced && <div style={{ textAlign: "center", fontFamily: UI, fontSize: 13, color: T.muted, marginTop: 6 }}>Your device requests reduced motion — animation is off automatically.</div>}

        <LeafDivider />

        {/* (B) BOTANICAL MOTIF sample */}
        <Eyebrow mb={10} color={T.gold}>Botanical motif — vines, veins, leaf line-art</Eyebrow>
        <div style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "18px 16px", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -8, right: -8, pointerEvents: "none" }}><VineMotif color={T.sage} opacity={0.3} w={120} /></div>
          <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>A page, framed not filled</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, marginTop: 6, position: "relative" }}>
            One trailing vine in a corner, a leaf divider between sections, a tendril at a card edge — hairline strokes in ink, gold or sage at low opacity. Never behind reading text, never a repeating wallpaper, never filled. It sits over the paper grain and breathes with it.
          </div>
        </div>
        <div style={{ fontFamily: UI, fontSize: 13, color: T.muted, lineHeight: 1.5, marginTop: 10 }}>
          DO: one motif per screen · stroke-only · opacity 0.06–0.12 for backgrounds, ~0.3 for a divider · ink/gold/sage. &nbsp; DON'T: emoji, filled/3D leaves, wallpaper tiles, blur filters, anything that competes with the text.
        </div>

        <LeafDivider />

        {/* (C) HEART MARK in context */}
        <Eyebrow mb={10} color={T.gold}>The heart mark — the single pop</Eyebrow>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "16px" }}>
          {/* a mock primary-page header */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
            <Heart size={18} />
            <span style={{ fontFamily: SCRIPT, fontSize: 30, color: T.ink }}>Today</span>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "12px 0" }}>
            One carved crimson heart in every primary header, and in the footer signature — exactly one per surface. Always crimson <span style={{ color: T.crimson, fontWeight: 700 }}>#BC2E27</span>, tilted, with its tiny light. Never recoloured, never scattered, never the plain outline icon.
          </div>
          {/* sizes */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", padding: "6px 0 10px" }}>
            <Heart size={13} /><Heart size={16} /><Heart size={20} /><Heart size={28} />
          </div>
          {/* footer signature mock */}
          <div style={{ textAlign: "center", paddingTop: 12, borderTop: `1px solid ${T.paperDeep}`, fontFamily: UI, fontSize: 13, color: T.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            Made with <Heart size={14} /> FemWell
          </div>
        </div>

        <LeafDivider />

        {/* (D) PERFORMANCE */}
        <Eyebrow mb={10} color={T.gold}>Performance — measured, on this device</Eyebrow>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${T.sage}`, borderRadius: 18, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: SCRIPT, fontSize: 48, color: T.sage, lineHeight: 1 }}>{fps == null ? "…" : fps}</span>
            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted }}>fps with {4} animated blooms on screen</span>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.55, marginTop: 8 }}>
            The upgraded bloom is GPU-cheap: gradients + CSS transforms composite on the GPU, depth comes from ONE gradient-ellipse shadow (no blur filter), and a single shared keyframe block drives every bloom. Impact is negligible.
          </div>
          <ul style={{ fontFamily: UI, fontSize: 13, color: T.muted, lineHeight: 1.6, margin: "10px 0 0", paddingLeft: 18 }}>
            <li>No <code>feGaussianBlur</code> across many nodes — the expensive trap, avoided.</li>
            <li>Animate the bloom GROUP, not each petal; one <code>&lt;style&gt;</code> keyframe block per page.</li>
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
