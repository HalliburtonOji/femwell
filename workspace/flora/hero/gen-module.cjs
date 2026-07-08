const fs=require("fs");
const D=JSON.parse(fs.readFileSync("scene-out.json","utf8"));
const mod = `// ─────────────────────────────────────────────────────────────────────────────
// floraScene.jsx — the finalised FLORA HERO scene (BRAND_IDENTITY §6.8).
// A realistic tapered diagonal bough growing out of a dusk wildflower-meadow
// patch (yarrow · cow-parsley · layered seed-grasses · depth), with BIG two-tone
// blooms DISTRIBUTED along the bough (+ a side twig) that open ONE → MANY.
// GENERATED (workspace/flora/hero/gen-scene.cjs) — the scene is a static SVG
// string; FwFloraHero (PageTop.jsx) renders it + places RichBloomV2 (headOnly)
// blooms at FLORA_BLOOMS and animates the one→many open via \`openness\`.
// Foliage is green/independent of the page colourway; only the blooms retint.
// ─────────────────────────────────────────────────────────────────────────────

export const FLORA_STAGE = { w: 300, h: 300 };
export const FLORA_SCENE_DEFS = ${JSON.stringify(D.defs)};
export const FLORA_SCENE = ${JSON.stringify(D.sceneInner)};
export const FLORA_BLOOMS = ${JSON.stringify(D.blooms)};
export const FLORA_CREATURE = ${JSON.stringify(D.creature)};
export const FLORA_N = FLORA_BLOOMS.length;
// the head sits this many px above the bloom-div centre (RichBloomV2 headOnly box)
export const FLORA_HEAD_OFF = 19;

// ONE → MANY: for a global openness (0..1) and a bloom's open-order, the bloom's
// LOCAL open amount (0 = closed bud → 1 = full). Blooms open in sequence down the
// bough; overlapping windows keep it smooth. openness=1 → every bloom fully open.
export function bloomLocalOpen(openness, order, n = FLORA_N) {
  const t0 = (order / n) * 0.82;            // when this bloom starts opening
  const win = 1 / n + 0.2;                  // soft, overlapping window
  return Math.max(0, Math.min(1, (openness - t0) / win));
}

// a small closed flower BUD (shown while a slot is still closed; cross-fades to
// the open RichBloomV2 as it opens), coloured by the two-tone combo.
export function Bud({ petal, tip, rot = 0, size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="-17 -22 34 26" aria-hidden
      style={{ overflow: "visible", display: "block", transform: \`rotate(\${rot}deg)\` }}>
      <path d="M0 -3 C -3.4 -5 -4.4 -10 -3.4 -14 C -2.6 -17 -1.2 -18.5 0 -19 C 1.2 -18.5 2.6 -17 3.4 -14 C 4.4 -10 3.4 -5 0 -3 Z" fill={petal} stroke="#7A3A50" strokeWidth="0.5" strokeOpacity="0.35" />
      <path d="M0 -8 C -1.3 -11.5 -1.3 -15 0 -17.5" fill="none" stroke={tip} strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
      <path d="M0 -3 C -2.8 -3 -4.4 -6 -4 -9 M0 -3 C 2.8 -3 4.4 -6 4 -9 M0 -2 L0 -8" fill="none" stroke="#6E8358" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

// extra scene animation (added to floraKeyframes): a gentle meadow breeze + a
// soft float for open blooms. Reduced-motion is gated by the hero wrapper.
export const FLORA_SCENE_KEYFRAMES = \`
@keyframes fwHeroBreeze { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(0.8deg) } }
@keyframes fwBloomFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.5px) } }
@media (prefers-reduced-motion: reduce) { .fw-hero *, .fw-hero { animation: none !important; transition: none !important } }
\`;
`;
fs.writeFileSync("C:/Users/Halli/femwell-work/src/components/brand/floraScene.jsx", mod);
console.log("wrote floraScene.jsx", (mod.length/1024).toFixed(0)+"KB");
