// ─────────────────────────────────────────────────────────────────────────────
// PageTop.jsx — the CANONICAL brand SIGNATURE top (BRAND_IDENTITY §6.8).
//
// FLORA HERO (`FwFloraHero`): the page's flower on a REALISTIC diagonal bough
// growing out of a dusk WILDFLOWER MEADOW, carrying BIG two-tone blooms
// DISTRIBUTED along the bough (+ a side twig) that open ONE → MANY (openness
// drives how many are open, not size). Then the carved Heart (§3), an Ephesis
// script title, a short warm line. NO dashed ring. Tasteful motion (blooms
// breathe, buds open in sequence, the creature drifts); prefers-reduced-motion
// gated. Every existing prop preserved — species/colourway/openness are the
// page's; tap-to-rebloom still driven by `openness`. Scene: flora/floraScene.jsx.
// ─────────────────────────────────────────────────────────────────────────────
import { useId, useMemo } from "react";
import { T, SCRIPT, Heart as BrandHeart } from "@/components/journal/Editorial";
import { RichBloomV2, Pollinator, FlowerGlyph, cwOf, floraKeyframes, lighten } from "@/components/brand/flora";
import { FLORA_STAGE, FLORA_SCENE_DEFS, FLORA_SCENE, FLORA_BLOOMS, FLORA_CREATURE, FLORA_HEAD_OFF, bloomLocalOpen, Bud, FLORA_SCENE_KEYFRAMES } from "@/components/brand/floraScene";

// FwFloraHero — the signature flora hero (finalised: realistic bough · dusk
// meadow · big distributed blooms · one→many · animated).
//   title/line : page title (Ephesis) + a short warm line.
//   bloom      : RichBloomV2 form (the page's flower).  colorway: §2.5 key (mood tint).
//   openness   : 0→1 — drives how many blooms are open along the bough (tap-to-rebloom).
//   butterfly  : show the companion creature (default true).  creature: which one.
//   flankL/R   : optional FlowerGlyph flanking the title.
//   ringSize/bloomSize/idx/titleColor/variant : kept for API compatibility (no page breaks).
// ── THE GARDEN LAYER (BRAND_IDENTITY §6.8 · brand-gated by Ms Atelier) ────────
// Canon's north star is a GARDEN ("many beds, not one bloom"). Today's hero is one
// diagonal bough over a dusk meadow — a single plane. A garden is DEPTH + BREADTH,
// never more COUNT: three planes at three scales, with the bough untouched as hero.
//
//   BACK  · 5–6 suggestion heads 11–15px, lifted toward paperHi, opacity .44
//   MID   · 3 companion species 33–40px, quieter than the hero
//   FRONT · a BROKEN ground band (never a continuous horizon) + blades crossing
//           the bough foot — the front-crossers are what make it read 3-D
//
// HARD RULES (Ms Atelier's gate): ≤16 heads at 390px · NOTHING sized 46–100px (the
// scale gap IS the hierarchy) · foliage stays GREEN whatever the colourway · exactly
// ONE creature (pollinators are earned, never wallpaper) · zero filter nodes (depth
// comes from colour, never blur) · no new motion · top-left and top-right-above-the-
// tip stay bare cream. Opt-in: no `garden` prop → the hero renders exactly as before.
const GARDEN_STEM = "#5E7350";   // foliage green — invariant, never retinted
const GARDEN_LEAF = "#84986C";
const GARDENS = {
  // Lifestyle — the cottage border in full flower; the most expressive of the set
  // (§5.3: Lifestyle is "editorial, varied"). Tallest, loosest back spires.
  lifestyle: {
    back: [
      { x: 22, y: 50, s: 13, v: "lavender" }, { x: 44, y: 43, s: 12, v: "cornflower" },
      { x: 63, y: 39, s: 11, v: "lavender" }, { x: 8, y: 57, s: 14, v: "chamomile" },
      { x: 88, y: 49, s: 12, v: "cornflower" }, { x: 34, y: 55, s: 11, v: "clover" },
    ],
    mid: [
      { x: 13, y: 74, s: 40, v: "dahlia" }, { x: 57, y: 80, s: 35, v: "ranunculus" },
      { x: 88, y: 70, s: 33, v: "anemone" },
    ],
    ground: [18, 46, 82],   // broken anchors — bare cream between, never a lawn stripe
    front: [95, 126],       // blades crossing IN FRONT of the bough foot
  },
};

// one grass tuft: a few few-point paths (never per-petal circles — node budget)
function Tuft({ cx, tall = false }) {
  const h = tall ? 46 : 20;
  return (
    <g>
      <path d={`M${cx} 293 q -2 -${h * 0.6} -7 -${h}`} stroke={GARDEN_STEM} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d={`M${cx} 293 q 1 -${h * 0.7} 2 -${h * 1.05}`} stroke={GARDEN_LEAF} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d={`M${cx} 293 q 4 -${h * 0.55} 9 -${h * 0.86}`} stroke={GARDEN_STEM} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function FwGardenPlanes({ def, cw, idx, uid, plane }) {
  if (!def) return null;
  const pos = (b, z, op) => ({
    position: "absolute", left: `${b.x}%`, top: `${b.y}%`, transform: "translate(-50%,-50%)",
    zIndex: z, opacity: op, pointerEvents: "none",
  });
  if (plane === "back") {
    return (<>{def.back.map((b, i) => (
      <div key={`gb${i}`} aria-hidden style={pos(b, 0, 0.44)}>
        <FlowerGlyph variant={b.v} size={b.s} color={lighten(cw.petal, 0.5)} color2={lighten(GARDEN_LEAF, 0.3)} idx={`${idx}-gb${i}-${uid}`} />
      </div>
    ))}</>);
  }
  if (plane === "mid") {
    return (<>{def.mid.map((b, i) => (
      <div key={`gm${i}`} aria-hidden style={pos(b, 2, 0.92)}>
        <FlowerGlyph variant={b.v} size={b.s} color={cw.petal} color2={cw.tip} idx={`${idx}-gm${i}-${uid}`} />
      </div>
    ))}</>);
  }
  // FRONT — the broken ground band + the blades that cross the bough foot
  return (
    <svg aria-hidden viewBox={`0 0 ${FLORA_STAGE.w} ${FLORA_STAGE.h}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 4, overflow: "visible", pointerEvents: "none" }}>
      {def.ground.map((gx, i) => <Tuft key={`gg${i}`} cx={(gx / 100) * FLORA_STAGE.w} />)}
      {def.front.map((fx, i) => <Tuft key={`gf${i}`} cx={fx} tall />)}
    </svg>
  );
}

export function FwFloraHero({
  title, line, bloom = "daisy", colorway = "gold",
  flankL = "iris", flankR = "sunflower", butterfly = true, creature = "butterfly",
  ringSize = 244, bloomSize = 170, idx = "hero", titleColor = T.ink, openness = 1, variant,
  // 92 = two lines of 44px Ephesis at lh 1.05 + the flank row. Defaulted (not per-page
  // opt-in) so a controller card swapping a 1-line title for a 2-line one can never
  // shunt the summary card below it. Pass a number to override.
  titleMinHeight = 92,
  garden,   // opt-in garden key (see GARDENS) — absent → the hero renders exactly as before
}) {
  const cw = cwOf(colorway);
  const gardenDef = garden ? GARDENS[garden] : null;
  // Positions come from a 300-wide stage but the SVG scales to its container, so ABSOLUTE px
  // left/top drift off the bough below 300px. Express them as % of the stage instead.
  const pctL = (v) => `${(v / FLORA_STAGE.w) * 100}%`;
  const pctT = (v) => `${(v / FLORA_STAGE.h) * 100}%`;
  // the hero wants BIG, lush, colourful blooms on every phase — small/pale/pendant
  // species read washed-out/bud-like when distributed along the bough, so substitute
  // a full rounded form (keeping the page's COLOURWAY/mood tint = the phase meaning).
  const LUSH_HERO_FORM = { snowdrop: "camellia", "lily-of-the-valley": "peony", bluebell: "cosmos", cornflower: "cosmos", "forget-me-not": "cosmos", chamomile: "cosmos", daisy: "camellia" };
  const heroBloom = LUSH_HERO_FORM[bloom] || bloom;
  // namespace ALL scene + bloom gradient/filter ids per instance so two heroes on
  // one page (e.g. a hidden + a visible) never collide (collision → faint fills).
  const rawUid = useId();
  const uid = "h" + rawUid.replace(/[^a-zA-Z0-9]/g, "");
  const sceneHtml = useMemo(() => (FLORA_SCENE_DEFS + FLORA_SCENE)
    .replace(/id="([\w-]+)"/g, `id="$1-${uid}"`)
    .replace(/url\(#([\w-]+)\)/g, `url(#$1-${uid})`), [uid]);
  const creatureKind = creature || "butterfly";
  const cSize = creatureKind === "ladybird" ? 26 : creatureKind === "dragonfly" ? 46 : creatureKind === "butterfly" ? 38 : 40;
  const cCol = creatureKind === "bee" ? T.gold : creatureKind === "ladybird" ? T.crimson : creatureKind === "butterfly" ? "#8E6E8E" : cw.petal;
  const cCol2 = creatureKind === "butterfly" ? T.gold : cw.tip;

  return (
    <div className="fw-hero" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
      <style>{floraKeyframes + FLORA_SCENE_KEYFRAMES}</style>
      <div style={{ position: "relative", width: FLORA_STAGE.w, maxWidth: "100%", height: FLORA_STAGE.h, margin: "0 auto" }}>
        {/* soft warm glow — grounds the scene without a ring */}
        <div aria-hidden style={{ position: "absolute", top: "40%", left: "56%", width: 240, height: 210, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${cw.petal}26 0%, ${T.sage}16 46%, transparent 70%)`, animation: "fwcGlow 7s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        {/* BACK plane — distant suggestion heads, lifted toward the paper (garden only) */}
        <FwGardenPlanes def={gardenDef} cw={cw} idx={idx} uid={uid} plane="back" />
        {/* the realistic bough + dusk-meadow scene (static SVG) */}
        <svg viewBox={`0 0 ${FLORA_STAGE.w} ${FLORA_STAGE.h}`} aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", zIndex: 1 }}
          dangerouslySetInnerHTML={{ __html: sceneHtml }} />
        {/* MID plane — the companion species that make it a border, not a bough */}
        <FwGardenPlanes def={gardenDef} cw={cw} idx={idx} uid={uid} plane="mid" />
        {/* the BIG two-tone blooms distributed along the bough — open ONE → MANY */}
        {FLORA_BLOOMS.map((b, i) => {
          const lo = bloomLocalOpen(openness, b.order);
          const fy = b.top - FLORA_HEAD_OFF * b.scale;
          return (
            <div key={`bl${i}`}>
              {/* the open flower head (fades in as it opens) */}
              <div style={{ position: "absolute", left: pctL(b.left), top: pctT(b.top), transform: `translate(-50%,-50%) scale(${b.scale})`, transformOrigin: "center", zIndex: 3, opacity: Math.min(1, lo * 2.2), transition: "opacity .45s ease", pointerEvents: "none" }}>
                <RichBloomV2 form={heroBloom} color={cw.petal} color2={cw.tip} accent={cw.accent} size={150} soft={false} headOnly animate idx={`${idx}-b${i}-${uid}`} openness={Math.max(0.02, lo)} />
              </div>
              {/* the closed bud (fades out as it opens) */}
              <div style={{ position: "absolute", left: pctL(b.left), top: pctT(fy), transform: `translate(-50%,-50%) scale(${b.scale})`, transformOrigin: "center", zIndex: 3, opacity: 1 - Math.min(1, lo * 2.6), transition: "opacity .45s ease", pointerEvents: "none" }}>
                <Bud petal={cw.petal} tip={cw.tip} rot={b.budRot} />
              </div>
            </div>
          );
        })}
        {/* FRONT plane — the broken ground band + the blades crossing the bough foot */}
        <FwGardenPlanes def={gardenDef} cw={cw} idx={idx} uid={uid} plane="front" />
        {/* the companion creature (drifts) — still exactly ONE, earned, never wallpaper */}
        {butterfly && (
          <div style={{ position: "absolute", left: pctL(FLORA_CREATURE.left), top: pctT(FLORA_CREATURE.top), transform: `scale(${FLORA_CREATURE.scale})`, transformOrigin: "center", zIndex: 5, pointerEvents: "none" }}>
            <Pollinator kind={creatureKind} size={cSize} color={cCol} color2={cCol2} pattern="bands" animate idx={`${idx}-cr-${uid}`} />
          </div>
        )}
      </div>
      {/* carved heart (§3) + Ephesis script title + flanking meaning-blooms */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 2, flexWrap: "wrap", justifyContent: "center", ...(titleMinHeight ? { minHeight: titleMinHeight } : null) }}>
        {flankL && <FlowerGlyph variant={flankL} size={22} color={cwOf("plum").petal} color2={cwOf("plum").tip} idx={`${idx}-fl-${uid}`} />}
        <BrandHeart size={16} />
        <div style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 44, lineHeight: 1.05, color: titleColor }}>{title}</div>
        {flankR && <FlowerGlyph variant={flankR} size={22} color={cwOf("gold").petal} color2={cwOf("gold").tip} idx={`${idx}-fr-${uid}`} />}
      </div>
      {line && <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: T.muted, marginTop: 9, textAlign: "center", maxWidth: 330, lineHeight: 1.5 }}>{line}</div>}
    </div>
  );
}
