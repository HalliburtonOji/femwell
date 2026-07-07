// ─────────────────────────────────────────────────────────────────────────────
// PageTop.jsx — the CANONICAL brand SIGNATURE top (BRAND_IDENTITY §6.8).
//
// Every primary page opens with the SAME signature:
//   1) FLORA HERO  — the BLOSSOMING-BRANCH plant (a fuller flowering bough with a
//      grass bed, leaves and buds — NO dashed ring), carrying the page's bloom
//      (species / mood tint / openness), the single carved Heart (§3), an Ephesis
//      script page title and a short warm line. The branch FRAMING rotates through
//      6 approved variants (a constantly-changing MIX) — see floraBranch.js.
//   2) ONE SUMMARY CARD  — rendered by the page (brand/Card.jsx SummaryCard).
//   3) page-specific content BELOW.
//
// The bloom (RichBloomV2) still supports openness (tap-to-rebloom), the colourway
// mood tint, and the companion creature — every variant preserves them, so the
// Nutrition hero (and every page) keeps working. Reuses flora.jsx + floraBranch.js.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { T, SCRIPT, Heart as BrandHeart } from "@/components/journal/Editorial";
import { RichBloomV2, SwayBloom, Pollinator, FlowerGlyph, cwOf, floraKeyframes } from "@/components/brand/flora";
import { BRANCH_DEFS, BRANCH_VARIANTS, ROLE_OPEN, pickBranchVariant } from "@/components/brand/floraBranch";

// stage coordinate space (matches floraBranch.js placements)
const STAGE_W = 300, STAGE_H = 290, BLOOM_BASE = 150;

function FoliageLayer({ svg, z, extra }) {
  return (
    <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", zIndex: z, ...(extra || {}) }}
      dangerouslySetInnerHTML={{ __html: BRANCH_DEFS + svg }} />
  );
}

// FwFloraHero — the signature flora hero (now the rotating blossoming branch).
//   title/line   : the page title (Ephesis script) + a short warm line.
//   bloom        : RichBloomV2 form (the page's flower) — used by EVERY bloom in the branch.
//   colorway     : a §2.5 colourway key — the page character / mood tint of the bloom.
//   flankL/R     : optional FlowerGlyph variants flanking the title.
//   butterfly    : show the companion creature (default true).  creature: which one.
//   openness     : the MAIN bloom's stage (0→1) — the tap-to-rebloom control (preserved).
//   variant      : optional pin (0–5) for a specific branch framing; omit to auto-rotate.
//   ringSize/bloomSize/idx/titleColor : kept for API compatibility (no page breaks).
export function FwFloraHero({
  title, line, bloom = "daisy", colorway = "gold",
  flankL = "iris", flankR = "sunflower", butterfly = true, creature = "butterfly",
  ringSize = 244, bloomSize = 170, idx = "hero", titleColor = T.ink, openness = 1, variant,
}) {
  const cw = cwOf(colorway);
  // pick a branch framing ONCE per mount (stable while mounted; advances each mount)
  const [vIndex] = useState(() => (typeof variant === "number" ? variant : pickBranchVariant()));
  const V = BRANCH_VARIANTS[((vIndex % BRANCH_VARIANTS.length) + BRANCH_VARIANTS.length) % BRANCH_VARIANTS.length];

  const bloomAt = (b, i) => {
    const isMain = b.role === "main";
    const o = isMain ? openness : ROLE_OPEN[b.role];
    const node = (
      <RichBloomV2 form={bloom} color={cw.petal} color2={cw.tip} accent={T.gold}
        size={BLOOM_BASE} soft animate={isMain} idx={isMain ? idx : `${idx}-c${i}`} openness={o} />
    );
    return (
      <div key={`b${i}`} style={{ position: "absolute", left: b.left, top: b.top, transform: `translate(-50%,-50%) scale(${b.scale}) rotate(${b.rot || 0}deg)`, transformOrigin: "center", zIndex: 2 }}>
        {isMain ? <SwayBloom animate idx={3}>{node}</SwayBloom> : node}
      </div>
    );
  };
  const creatureNode = (c, kind, key) => {
    if (!butterfly) return null;
    const size = kind === "ladybird" ? 26 : kind === "dragonfly" ? 46 : kind === "butterfly" ? 38 : 40;
    const col = kind === "bee" ? T.gold : kind === "ladybird" ? T.crimson : kind === "butterfly" ? "#8E6E8E" : cw.petal;
    const col2 = kind === "butterfly" ? T.gold : cw.tip;
    return (
      <div key={key} style={{ position: "absolute", left: c.left, top: c.top, transform: `scale(${c.scale || 1})`, transformOrigin: "center", zIndex: 4, pointerEvents: "none" }}>
        <Pollinator kind={kind} size={size} color={col} color2={col2} pattern="bands" animate idx={`${idx}-${key}`} />
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
      <style>{floraKeyframes}</style>
      <div style={{ position: "relative", width: STAGE_W, maxWidth: "100%", height: STAGE_H, margin: "0 auto" }}>
        {/* soft warm glow — grounds the plant without a ring */}
        <div aria-hidden style={{ position: "absolute", top: "44%", left: "50%", width: 240, height: 220, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${cw.petal}30 0%, ${T.sage}18 46%, transparent 70%)`, animation: "fwcGlow 7s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        {V.back && <FoliageLayer svg={V.back} z={1} extra={cssFromStyle(V.backStyle)} />}
        <FoliageLayer svg={V.main} z={1} />
        {V.blooms.map(bloomAt)}
        {V.front && <FoliageLayer svg={V.front} z={3} />}
        {creatureNode(V.creature, creature, "bf")}
        {V.bfly && creatureNode(V.bfly, "butterfly", "bf2")}
      </div>
      {/* carved heart (§3) + Ephesis script title + flanking meaning-blooms */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 2, flexWrap: "wrap", justifyContent: "center" }}>
        {flankL && <FlowerGlyph variant={flankL} size={22} color={cwOf("plum").petal} color2={cwOf("plum").tip} idx={`${idx}-fl`} />}
        <BrandHeart size={16} />
        <div style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 44, lineHeight: 1.05, color: titleColor }}>{title}</div>
        {flankR && <FlowerGlyph variant={flankR} size={22} color={cwOf("gold").petal} color2={cwOf("gold").tip} idx={`${idx}-fr`} />}
      </div>
      {line && <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: T.muted, marginTop: 9, textAlign: "center", maxWidth: 330, lineHeight: 1.5 }}>{line}</div>}
    </div>
  );
}

// parse the tiny inline-style strings from floraBranch ("opacity:.7;filter:blur(.6px)") into a style object
function cssFromStyle(s) {
  if (!s) return undefined;
  const o = {};
  s.split(";").filter(Boolean).forEach((decl) => {
    const [k, ...rest] = decl.split(":");
    if (!k || !rest.length) return;
    const prop = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[prop] = rest.join(":").trim();
  });
  return o;
}
