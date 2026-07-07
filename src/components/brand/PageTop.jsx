// ─────────────────────────────────────────────────────────────────────────────
// PageTop.jsx — the CANONICAL brand SIGNATURE top (BRAND_IDENTITY §6.8).
//
// Every primary page opens with the SAME signature:
//   1) FLORA HERO  — a large brand bloom (a flower, per the page's §5.3 character /
//      the user's flora fingerprint) inside a purely DECORATIVE botanical ring
//      (NOT the cycle ring), soft glow, optional resting butterfly, the single
//      carved Heart (§3), an Ephesis script page title, and a short warm line.
//   2) ONE SUMMARY CARD  — rendered by the page (use brand/Card.jsx SummaryCard):
//      a signal-driven "what to do / what's here" glance, never hollow.
//   3) page-specific content BELOW (rich cards / per-type rows).
//
// This top is the consistent brand language across every page; the content below
// differs per page. The bloom ties the app↔user FLORA STORY together
// (BRAND_FLORA.md): the flower means something, and (future) reflects her garden.
//
// Reuses flora.jsx (RichBloomV2 / SwayBloom / Butterfly / FlowerGlyph / cwOf) +
// the carved Heart from Editorial. No cycle-phase encoding here — Today's hero
// owns the cycle ring; other pages use the decorative ring.
// ─────────────────────────────────────────────────────────────────────────────
import { T, SCRIPT, Heart as BrandHeart } from "@/components/journal/Editorial";
import { RichBloomV2, SwayBloom, Pollinator, FlowerGlyph, cwOf, floraKeyframes } from "@/components/brand/flora";

// FwFloraHero — the signature flora hero.
//   title     : the page title (short — Ephesis script).
//   line      : a short warm supportive line beneath.
//   bloom     : RichBloomV2 form (peony/daisy/poppy/foxglove/fern/forget…).
//   colorway  : a §2.5 colourway key (gold/sage/blush/plum/crimson/…) — the page character.
//   flankL/R  : optional FlowerGlyph variants flanking the title (meaning-blooms).
//   butterfly : show the resting butterfly (default true).
export function FwFloraHero({
  title, line, bloom = "daisy", colorway = "gold",
  flankL = "iris", flankR = "sunflower", butterfly = true, creature = "butterfly",
  ringSize = 244, bloomSize = 170, idx = "hero", titleColor = T.ink, openness = 1,
}) {
  const cw = cwOf(colorway);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
      <style>{floraKeyframes}</style>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
        {/* soft coloured glow */}
        <div aria-hidden style={{ position: "absolute", top: "48%", left: "50%", width: ringSize + 52, height: ringSize + 52, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${cw.petal}38 0%, ${T.sage}1F 44%, transparent 70%)`, animation: "fwcGlow 7s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        {butterfly && <div style={{ position: "absolute", top: "27%", left: "62%", transform: "translate(-50%,-50%)", zIndex: 3, pointerEvents: "none" }}><Pollinator kind={creature} size={creature === "ladybird" ? 28 : creature === "dragonfly" ? 48 : 40} color={creature === "bee" ? T.gold : creature === "ladybird" ? T.crimson : cw.petal} color2={cw.tip} pattern="bands" animate idx={`${idx}-bf`} /></div>}
        {/* DECORATIVE botanical ring (dashed gold + thin sage — no cycle markers) + the bloom */}
        <div style={{ position: "relative", zIndex: 1, width: ringSize, height: ringSize, display: "grid", placeItems: "center" }}>
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} aria-hidden style={{ position: "absolute", inset: 0 }}>
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringSize / 2 - 8} fill="none" stroke={T.gold} strokeWidth="1.5" opacity="0.5" strokeDasharray="2 9" strokeLinecap="round" />
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringSize / 2 - 20} fill="none" stroke={T.sage} strokeWidth="1" opacity="0.4" />
          </svg>
          <SwayBloom animate idx={3}>
            <RichBloomV2 form={bloom} color={cw.petal} color2={cw.tip} accent={T.gold} size={bloomSize} animate soft idx={idx} openness={openness} />
          </SwayBloom>
        </div>
      </div>
      {/* carved heart (§3) + Ephesis script title + flanking meaning-blooms */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: -2, flexWrap: "wrap", justifyContent: "center" }}>
        {flankL && <FlowerGlyph variant={flankL} size={22} color={cwOf("plum").petal} color2={cwOf("plum").tip} idx={`${idx}-fl`} />}
        <BrandHeart size={16} />
        <div style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 44, lineHeight: 1.05, color: titleColor }}>{title}</div>
        {flankR && <FlowerGlyph variant={flankR} size={22} color={cwOf("gold").petal} color2={cwOf("gold").tip} idx={`${idx}-fr`} />}
      </div>
      {line && <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: T.muted, marginTop: 9, textAlign: "center", maxWidth: 330, lineHeight: 1.5 }}>{line}</div>}
    </div>
  );
}
