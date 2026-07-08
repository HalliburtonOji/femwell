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
import { RichBloomV2, Pollinator, FlowerGlyph, cwOf, floraKeyframes } from "@/components/brand/flora";
import { FLORA_STAGE, FLORA_SCENE_DEFS, FLORA_SCENE, FLORA_BLOOMS, FLORA_CREATURE, FLORA_HEAD_OFF, bloomLocalOpen, Bud, FLORA_SCENE_KEYFRAMES } from "@/components/brand/floraScene";

// FwFloraHero — the signature flora hero (finalised: realistic bough · dusk
// meadow · big distributed blooms · one→many · animated).
//   title/line : page title (Ephesis) + a short warm line.
//   bloom      : RichBloomV2 form (the page's flower).  colorway: §2.5 key (mood tint).
//   openness   : 0→1 — drives how many blooms are open along the bough (tap-to-rebloom).
//   butterfly  : show the companion creature (default true).  creature: which one.
//   flankL/R   : optional FlowerGlyph flanking the title.
//   ringSize/bloomSize/idx/titleColor/variant : kept for API compatibility (no page breaks).
export function FwFloraHero({
  title, line, bloom = "daisy", colorway = "gold",
  flankL = "iris", flankR = "sunflower", butterfly = true, creature = "butterfly",
  ringSize = 244, bloomSize = 170, idx = "hero", titleColor = T.ink, openness = 1, variant,
}) {
  const cw = cwOf(colorway);
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
        {/* the realistic bough + dusk-meadow scene (static SVG) */}
        <svg viewBox={`0 0 ${FLORA_STAGE.w} ${FLORA_STAGE.h}`} aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", zIndex: 1 }}
          dangerouslySetInnerHTML={{ __html: sceneHtml }} />
        {/* the BIG two-tone blooms distributed along the bough — open ONE → MANY */}
        {FLORA_BLOOMS.map((b, i) => {
          const lo = bloomLocalOpen(openness, b.order);
          const fy = b.top - FLORA_HEAD_OFF * b.scale;
          return (
            <div key={`bl${i}`}>
              {/* the open flower head (fades in as it opens) */}
              <div style={{ position: "absolute", left: b.left, top: b.top, transform: `translate(-50%,-50%) scale(${b.scale})`, transformOrigin: "center", zIndex: 2, opacity: Math.min(1, lo * 2.2), transition: "opacity .45s ease", pointerEvents: "none" }}>
                <RichBloomV2 form={bloom} color={cw.petal} color2={cw.tip} accent={cw.accent} size={150} soft={false} headOnly animate idx={`${idx}-b${i}-${uid}`} openness={Math.max(0.02, lo)} />
              </div>
              {/* the closed bud (fades out as it opens) */}
              <div style={{ position: "absolute", left: b.left, top: fy, transform: `translate(-50%,-50%) scale(${b.scale})`, transformOrigin: "center", zIndex: 2, opacity: 1 - Math.min(1, lo * 2.6), transition: "opacity .45s ease", pointerEvents: "none" }}>
                <Bud petal={cw.petal} tip={cw.tip} rot={b.budRot} />
              </div>
            </div>
          );
        })}
        {/* the companion creature (drifts) */}
        {butterfly && (
          <div style={{ position: "absolute", left: FLORA_CREATURE.left, top: FLORA_CREATURE.top, transform: `scale(${FLORA_CREATURE.scale})`, transformOrigin: "center", zIndex: 4, pointerEvents: "none" }}>
            <Pollinator kind={creatureKind} size={cSize} color={cCol} color2={cCol2} pattern="bands" animate idx={`${idx}-cr-${uid}`} />
          </div>
        )}
      </div>
      {/* carved heart (§3) + Ephesis script title + flanking meaning-blooms */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 2, flexWrap: "wrap", justifyContent: "center" }}>
        {flankL && <FlowerGlyph variant={flankL} size={22} color={cwOf("plum").petal} color2={cwOf("plum").tip} idx={`${idx}-fl-${uid}`} />}
        <BrandHeart size={16} />
        <div style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 44, lineHeight: 1.05, color: titleColor }}>{title}</div>
        {flankR && <FlowerGlyph variant={flankR} size={22} color={cwOf("gold").petal} color2={cwOf("gold").tip} idx={`${idx}-fr-${uid}`} />}
      </div>
      {line && <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: T.muted, marginTop: 9, textAlign: "center", maxWidth: 330, lineHeight: 1.5 }}>{line}</div>}
    </div>
  );
}
