// FloraCover — the on-brand, in-app ECOSYSTEM cover for articles/write-ups. Piece 1 of the
// Lifestyle level-up. REPLACES external stock/OG images: a cover is COMPOSED from the real
// brand ecosystem language — flora (blooms, buds, sprigs, vines), FAUNA (butterflies, bees,
// dragonflies, moths, ladybirds), landscape (the real dusk meadow+bough FLORA_SCENE, a sky
// wash, a moon + stars, a wax-rose seal) — never fetched, never off-brand art.
//
// v2 refinements (Halli 2026-07-15): (1) MORE VARIATION — 10 scene archetypes + wide seeded
// variation (horizontal flip, creature picked from a scene set, bloom count, secondary buds,
// sprig corner) so covers rarely repeat. (2) MORE REALISTIC — a soft out-of-focus BACK bloom
// for depth-of-field + a ground contact shadow + stronger drop shadows, natural edge-anchored
// placement. (3) READABILITY — a strong adaptive foot scrim guarantees the title sits on
// near-solid paper, and the eyebrow colour is darkened until it meets WCAG AA (4.5:1) on that
// scrim, on EVERY colourway/scene (incl. the light ones).
//
// SEGMENTED: scene + colourway are chosen by the content's category/mood/type, so a Story
// (dusk + wax seal) reads visibly different from Movement (meadow) from Astrology (night sky)
// from Love (a gathered posy). DETERMINISTIC: same item id -> same cover (hashSeed/seededRng
// frozen in useMemo). Reduced-motion-safe; role="img" + aria-label; title = real DOM text.
//
//   <FloraCover title="She left the party early" eyebrow="Story · 8 min"
//               category="fiction" seed={item.id} />
//
// Props: title, eyebrow, colorway?, category?, seed?, scene?, species?, combo?, width?, height?,
//        radius?, roundTop?, titleFont? ("auto"|"fraunces"|"script"), showTitle?, animate?, idx?
import { useMemo } from "react";
import {
  RichBloomV2, Bouquet, Pollinator, CornerSprig, VineMotifV2,
  cwOf, hashSeed, seededRng, floraKeyframes, lighten, darken,
} from "@/components/brand/flora";
import { FLORA_STAGE, FLORA_SCENE_DEFS, FLORA_SCENE, FLORA_SCENE_KEYFRAMES, Bud } from "@/components/brand/floraScene";
import { T, SERIF, SCRIPT, UI } from "@/components/journal/Editorial";

// ── colourway → the §2.5.1 VIVID TWO-TONE combo (petal → lit tip / jewelled heart) ──
const COMBO = {
  crimson:  { color: "#C33A2C", color2: "#E8895F", accent: "#D4AF37" },
  coral:    { color: "#E86A44", color2: "#F6C066", accent: "#B8502E" },
  gold:     { color: "#E8A24E", color2: "#F8CE9A", accent: "#C05A4E" },
  blush:    { color: "#E098B0", color2: "#F8DCE6", accent: "#A83E5E" },
  plum:     { color: "#C63A75", color2: "#F4DCE6", accent: "#8E2E52" },
  lavender: { color: "#8A63B4", color2: "#CBB8E4", accent: "#E8C766" },
  sky:      { color: "#7C8CC8", color2: "#C0CAE6", accent: "#E8C766" },
  sage:     { color: "#7FA07F", color2: "#CDE0CD", accent: "#C08A3F" },
  cream:    { color: "#D9C79E", color2: "#F2EAD6", accent: "#A8893F" },
};
const comboOf = (key) => COMBO[key] || COMBO.gold;

const COVER_SPECIES = ["peony", "rose", "sunflower", "tulip", "magnolia", "dahlia", "poppy", "ranunculus", "camellia", "anemone", "cosmos", "marigold"];
const pickFrom = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

// ── WCAG contrast (accurate relative luminance) — guarantees legible text on any grade ──
const SCRIM = T.paperHi; // #F4EFE3 — the near-solid paper the title sits on
function _lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function relLum(hex) { const n = parseInt(String(hex).replace("#", ""), 16); return 0.2126 * _lin((n >> 16) & 255) + 0.7152 * _lin((n >> 8) & 255) + 0.0722 * _lin(n & 255); }
function contrast(a, b) { const la = relLum(a), lb = relLum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
// darken a colour until it meets `target` contrast on `bg` (for the accent eyebrow on light paper)
function legibleOn(hex, bg = SCRIM, target = 4.6) {
  let c = hex;
  for (let i = 0; i < 14 && contrast(c, bg) < target; i++) c = darken(c, 0.11);
  return contrast(c, bg) >= target ? c : T.ink;
}

// ── SEGMENTATION — category/mood/type → { scene, cw } ──
const SEGMENTS = [
  { re: /story|fiction|letter|chapter|novel|diary|memoir/, scene: "duskletter", cw: "plum" },
  { re: /astrolog|horoscope|moon|zodiac|sky|cosmic|spirit|manifest|ritual|tarot/, scene: "nightsky", cw: "lavender" },
  { re: /love|relationship|dating|marriage|romance|partner|intimacy|sex/, scene: "gathering", cw: "crimson" },
  { re: /friend|belong|community|social|connection|support|circle/, scene: "posy", cw: "coral" },
  { re: /career|work|money|finance|ambition|success|productivity|business|study/, scene: "bough", cw: "gold" },
  { re: /creativ|art|craft|write|music|make|hobby|design|paint/, scene: "wildflower", cw: "plum" },
  { re: /beauty|fashion|style|skin|hair|glow|makeup|wardrobe/, scene: "wildflower", cw: "blush" },
  { re: /rest|calm|mind|sleep|recovery|anxiety|breathe|meditat|wellbeing|self.?care|stress/, scene: "windowsill", cw: "sky" },
  { re: /nature|outdoor|garden|walk|movement|body|energy|exercise|fitness|yoga/, scene: "meadow", cw: "sage" },
  { re: /food|nutrition|nourish|cook|recipe|eat|meal|kitchen/, scene: "hedgerow", cw: "gold" },
  { re: /read|book|essay|guide|learn|longread|explain/, scene: "bough", cw: "cream" },
];
const CW_KEYS = ["crimson", "coral", "gold", "blush", "plum", "lavender", "sky", "sage", "cream"];
const SCENE_KEYS = ["bough", "meadow", "hedgerow", "posy", "gathering", "wildflower", "duskletter", "nightsky", "windowsill", "still"];
function segmentFor(category, seedStr) {
  const c = String(category || "").toLowerCase();
  for (const s of SEGMENTS) if (s.re.test(c)) return { scene: s.scene, cw: s.cw };
  const h = hashSeed(category || seedStr || "femwell");
  return { scene: SCENE_KEYS[h % SCENE_KEYS.length], cw: CW_KEYS[(h >> 3) % CW_KEYS.length] };
}

// scene-appropriate creature sets (seeded pick widens variety)
const CREATURES = {
  bough: ["bee", "butterfly", "ladybird"], meadow: ["butterfly", "dragonfly", "bee"],
  hedgerow: ["butterfly", "bee", "ladybird"], still: ["ladybird", "bee"],
  windowsill: ["ladybird", "butterfly"], wildflower: ["dragonfly", "butterfly"],
  posy: ["butterfly", "bee"], gathering: ["butterfly"], nightsky: ["moth", "dragonfly"],
};

// ── reusable landscape: the REAL dusk meadow + bough (FLORA_SCENE), bottom-anchored ──
function MeadowBand({ opacity = 0.6, heightPct = 76 }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${heightPct}%`, opacity, pointerEvents: "none" }}>
      <svg viewBox={`0 0 ${FLORA_STAGE.w} ${FLORA_STAGE.h}`} preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: "block" }}
        dangerouslySetInnerHTML={{ __html: FLORA_SCENE_DEFS + FLORA_SCENE }} />
    </div>
  );
}

// ── on-brand sky primitives (built, not fetched; gold/cream, carved) ──
function Moon({ size = 40, x = "70%", y = "16%", accent = "#E8C766", uid = "m" }) {
  const gid = `moon-${uid}`;
  return (
    <div aria-hidden style={{ position: "absolute", left: x, top: y, width: size, height: size, pointerEvents: "none" }}>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <defs><radialGradient id={gid} cx="42%" cy="38%" r="62%"><stop offset="0%" stopColor={lighten(accent, 0.4)} /><stop offset="100%" stopColor={accent} /></radialGradient></defs>
        <circle cx="20" cy="20" r="12" fill={`url(#${gid})`} opacity="0.95" />
        <circle cx="20" cy="20" r="12" fill="none" stroke={lighten(accent, 0.5)} strokeWidth="0.6" strokeOpacity="0.6" />
        <circle cx="16" cy="17" r="1.6" fill={darken(accent, 0.12)} opacity="0.3" /><circle cx="23" cy="22" r="1.1" fill={darken(accent, 0.12)} opacity="0.25" />
      </svg>
    </div>
  );
}
function Stars({ rnd, n = 8, accent = "#E8C766", W, H }) {
  const pts = Array.from({ length: n }).map(() => ({ x: 6 + rnd() * (W - 12), y: 5 + rnd() * (H * 0.48), r: 0.7 + rnd() * 1.2, o: 0.4 + rnd() * 0.5 }));
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={accent} opacity={p.o} />)}
    </svg>
  );
}
function WaxSeal({ size = 46, x = "68%", y = "26%", color = "#BC2E27" }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: x, top: y, width: size, height: size, filter: "drop-shadow(0 3px 6px rgba(46,38,27,0.22))", pointerEvents: "none" }}>
      <svg viewBox="0 0 46 46" width={size} height={size}>
        <circle cx="23" cy="23" r="20" fill={color} />
        <circle cx="23" cy="23" r="20" fill="none" stroke={darken(color, 0.14)} strokeWidth="1.4" />
        <circle cx="23" cy="23" r="15.5" fill="none" stroke={lighten(color, 0.28)} strokeWidth="0.8" strokeOpacity="0.7" strokeDasharray="1.5 2.2" />
        <path d="M23 30 C 17 25.5 15.5 21 18 18.5 C 19.6 16.9 21.6 17.4 23 19.4 C 24.4 17.4 26.4 16.9 28 18.5 C 30.5 21 29 25.5 23 30 Z" fill={lighten(color, 0.34)} opacity="0.92" />
      </svg>
    </div>
  );
}
// a soft ground contact shadow — grounds a bloom so it doesn't float (realism)
function GroundShadow({ w = 90, top, right, left }) {
  const pos = left != null ? { left } : { right };
  return <div aria-hidden style={{ position: "absolute", top, ...pos, width: w, height: w * 0.28, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%, rgba(46,38,27,0.22), rgba(46,38,27,0))", pointerEvents: "none" }} />;
}

// ── bloom with optional out-of-focus BACK bloom (depth) + drop shadow (realism) ──
function bloomEl(ctx, { size, top, right, left, rot = 0, openness = 1, form, key, back = false }) {
  const pos = left != null ? { left } : { right };
  return (
    <div key={key} style={{ position: "absolute", top, ...pos, transform: `rotate(${rot}deg)`, pointerEvents: "none" }}>
      {back && (
        <div style={{ position: "absolute", top: "10%", left: "26%", opacity: 0.5, filter: "blur(1.6px) saturate(0.85)", transform: "scale(0.66)" }}>
          <RichBloomV2 form={ctx.v.backForm} color={lighten(ctx.cb.color, 0.1)} color2={ctx.cb.color2} accent={ctx.cb.accent} size={size} openness={0.7} soft animate={false} headOnly idx={`${ctx.uid}-${key}-bk`} />
        </div>
      )}
      <div style={{ position: "relative", filter: "drop-shadow(0 8px 15px rgba(46,38,27,0.18))" }}>
        <RichBloomV2 form={form || ctx.species} color={ctx.cb.color} color2={ctx.cb.color2} accent={ctx.cb.accent} size={size} openness={openness} soft animate={ctx.animate} headOnly idx={`${ctx.uid}-${key}`} />
      </div>
    </div>
  );
}
function faunaEl(ctx, { kind, size, top, right, left, color, color2, key }) {
  const pos = left != null ? { left } : { right };
  return (
    <div key={key} style={{ position: "absolute", top, ...pos, filter: "drop-shadow(0 3px 5px rgba(46,38,27,0.14))", pointerEvents: "none" }}>
      <Pollinator kind={kind} size={size} color={color || ctx.cb.color} color2={color2 || ctx.cb.color2} pattern="bands" animate={ctx.animate} idx={`${ctx.uid}-${key}`} />
    </div>
  );
}

const SCENES = {
  // read / career / generic — a bough with a hero bloom (depth) grounded, + a seeded creature
  bough: (ctx) => ({ layers: [
    <MeadowBand key="m" opacity={0.5 + ctx.v.mo} heightPct={72} />,
    <GroundShadow key="gs" w={ctx.H * 0.62} top={`${ctx.H * 0.5}px`} right={`${2 + ctx.j.x}%`} />,
    bloomEl(ctx, { key: "b1", size: Math.round(ctx.H * 1.0), top: `${-10 - ctx.j.y}%`, right: `${-4 - ctx.j.x}%`, rot: ctx.j.rot, back: true }),
    faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 26, top: `${12 + ctx.v.fy}%`, left: `${10 + ctx.v.fx}%`, color: ctx.cb.accent }),
  ] }),
  // movement / nature — the meadow, brighter, a creature
  meadow: (ctx) => ({ layers: [
    <MeadowBand key="m" opacity={0.72 + ctx.v.mo} heightPct={82} />,
    bloomEl(ctx, { key: "b1", size: Math.round(ctx.H * 0.86), top: `${4 + ctx.j.y}%`, right: `${4 + ctx.j.x}%`, rot: ctx.j.rot, back: ctx.v.blooms > 1 }),
    faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 34, top: `${12 + ctx.v.fy}%`, left: `${10 + ctx.v.fx}%`, color: "#8E6E8E", color2: ctx.cb.accent }),
  ] }),
  // reading / food — a hedgerow: a row of mixed small blooms along the lower third + a creature
  hedgerow: (ctx) => ({ layers: [
    <MeadowBand key="m" opacity={0.5 + ctx.v.mo} heightPct={70} />,
    bloomEl(ctx, { key: "h1", size: Math.round(ctx.H * 0.64), top: "34%", left: `${10 + ctx.v.fx}%`, rot: -8, form: ctx.species, openness: 0.9 }),
    bloomEl(ctx, { key: "h2", size: Math.round(ctx.H * 0.74), top: "26%", left: "40%", rot: ctx.j.rot, form: "cosmos" }),
    bloomEl(ctx, { key: "h3", size: Math.round(ctx.H * 0.58), top: "38%", right: "10%", rot: 10, form: "ranunculus", openness: 0.85 }),
    faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 26, top: "12%", right: "24%", color: ctx.cb.accent }),
  ] }),
  // friendship / beauty — a gathered posy + a creature
  posy: (ctx) => ({ layers: [
    <GroundShadow key="gs" w={ctx.H * 0.72} top={`${ctx.H * 0.62}px`} right="8%" />,
    <div key="bq" style={{ position: "absolute", top: "50%", right: "2%", transform: "translateY(-50%)", filter: "drop-shadow(0 7px 13px rgba(46,38,27,0.15))" }}>
      <Bouquet items={[{ form: ctx.species, colorway: ctx.cw }, { form: "cosmos", colorway: ctx.cw }, { form: "ranunculus", colorway: ctx.cw }]} size={Math.round(ctx.H * 1.02)} animate={ctx.animate} idx={`${ctx.uid}-bq`} />
    </div>,
    faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 30, top: `${14 + ctx.v.fy}%`, left: `${12 + ctx.v.fx}%`, color: ctx.cb.color, color2: ctx.cb.color2 }),
  ] }),
  // love / relationships — a fuller posy + two butterflies
  gathering: (ctx) => ({ layers: [
    <GroundShadow key="gs" w={ctx.H * 0.82} top={`${ctx.H * 0.64}px`} right="6%" />,
    <div key="bq" style={{ position: "absolute", top: "52%", right: "0%", transform: "translateY(-50%)", filter: "drop-shadow(0 7px 14px rgba(46,38,27,0.15))" }}>
      <Bouquet items={[{ form: ctx.species, colorway: ctx.cw }, { form: "rose", colorway: ctx.cw }, { form: "peony", colorway: ctx.cw }, { form: "cosmos", colorway: ctx.cw }]} size={Math.round(ctx.H * 1.1)} animate={ctx.animate} idx={`${ctx.uid}-bq`} />
    </div>,
    faunaEl(ctx, { key: "f1", kind: "butterfly", size: 32, top: `${11 + ctx.v.fy}%`, left: `${10 + ctx.v.fx}%`, color: ctx.cb.color, color2: ctx.cb.accent }),
    faunaEl(ctx, { key: "f2", kind: "butterfly", size: 22, top: "30%", left: "24%", color: ctx.cb.color2, color2: ctx.cb.color }),
  ] }),
  // creativity / fashion — flanking vines + two blooms at different heights + a dragonfly
  wildflower: (ctx) => ({ layers: [
    <div key="vL" style={{ position: "absolute", left: -6, bottom: -6, opacity: 0.5, pointerEvents: "none" }}><VineMotifV2 color={ctx.cb.accent} color2={ctx.cb.color2} opacity={0.6} w={Math.round(ctx.H * 0.7)} idx={`${ctx.uid}-vL`} /></div>,
    <div key="vR" style={{ position: "absolute", right: -6, top: -6, opacity: 0.42, pointerEvents: "none" }}><VineMotifV2 color={ctx.cb.accent} color2={ctx.cb.color2} opacity={0.55} w={Math.round(ctx.H * 0.6)} flip idx={`${ctx.uid}-vR`} /></div>,
    bloomEl(ctx, { key: "b1", size: Math.round(ctx.H * 0.8), top: `${-4 + ctx.j.y}%`, right: "6%", rot: ctx.j.rot, back: true }),
    bloomEl(ctx, { key: "b2", size: Math.round(ctx.H * 0.56), top: "42%", right: "34%", rot: -ctx.j.rot, form: "cosmos", openness: 0.8 }),
    faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 34, top: `${16 + ctx.v.fy}%`, left: `${10 + ctx.v.fx}%`, color: ctx.cb.accent, color2: ctx.cb.color }),
  ] }),
  // story / letter — warm dusk grade + a wax-rose seal + a closed bud + a faint sprig
  duskletter: (ctx) => ({
    bg: `radial-gradient(130% 100% at 78% 24%, ${ctx.cb.color2}3A 0%, ${ctx.cb.color2}00 56%), linear-gradient(168deg, #EFE6D4 0%, ${ctx.cb.accent}1F 44%, ${ctx.cb.color}30 100%)`,
    layers: [
      <div key="sprig" style={{ position: "absolute", left: -4, bottom: -4, opacity: 0.3, pointerEvents: "none" }}><CornerSprig variant="sprig" color={ctx.cb.accent} size={Math.round(ctx.H * 0.5)} corner="bl" idx={`${ctx.uid}-sp`} /></div>,
      <div key="bud" style={{ position: "absolute", top: "42%", right: "30%", transform: `rotate(${ctx.j.rot}deg)`, filter: "drop-shadow(0 4px 7px rgba(46,38,27,0.16))" }}><Bud petal={ctx.cb.color} tip={ctx.cb.color2} rot={-8} size={Math.round(ctx.H * 0.28)} /></div>,
      <WaxSeal key="seal" size={Math.round(ctx.H * 0.32)} x="60%" y="15%" color={ctx.cw === "plum" ? "#8E2E52" : "#BC2E27"} />,
    ],
  }),
  // astrology / sky — a twilight top wash + moon + stars + a moth/dragonfly
  nightsky: (ctx) => ({
    bg: `linear-gradient(180deg, ${darken(ctx.cb.color, 0.2)}CC 0%, ${ctx.cb.color}55 34%, ${T.paperHi} 82%)`,
    layers: [
      <Stars key="stars" rnd={ctx.rnd} n={8} accent={ctx.cb.accent} W={ctx.W} H={ctx.H} />,
      <Moon key="moon" size={Math.round(ctx.H * 0.3)} x={`${58 + ctx.v.fx}%`} y="13%" accent={ctx.cb.accent} uid={ctx.uid} />,
      <div key="sprig" style={{ position: "absolute", left: -3, bottom: -3, opacity: 0.42, pointerEvents: "none" }}><CornerSprig variant="sprig" color={darken(ctx.cb.color, 0.1)} size={Math.round(ctx.H * 0.46)} corner="bl" idx={`${ctx.uid}-sp`} /></div>,
      faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 32, top: "40%", left: `${12 + ctx.v.fx}%`, color: lighten(ctx.cb.color, 0.2), color2: ctx.cb.accent }),
    ],
  }),
  // rest / calm — a soft sky + one serene bloom (grounded) + a resting ladybird
  windowsill: (ctx) => ({
    bg: `radial-gradient(120% 96% at 26% 18%, ${ctx.cb.color2}3C 0%, ${ctx.cb.color2}00 58%), linear-gradient(160deg, ${T.paperHi} 0%, ${ctx.cb.color}14 60%, ${ctx.cb.color}22 100%)`,
    layers: [
      <GroundShadow key="gs" w={ctx.H * 0.58} top={`${ctx.H * 0.52}px`} right={`${4 + ctx.j.x}%`} />,
      bloomEl(ctx, { key: "b1", size: Math.round(ctx.H * 0.9), top: `${2 + ctx.j.y}%`, right: `${4 + ctx.j.x}%`, rot: ctx.j.rot, openness: 0.92, back: ctx.v.blooms > 1 }),
      <div key="sprig" style={{ position: "absolute", left: -4, top: -4, opacity: 0.34, pointerEvents: "none" }}><CornerSprig variant="sprig" color={ctx.cb.accent} size={Math.round(ctx.H * 0.44)} corner="tl" idx={`${ctx.uid}-sp`} /></div>,
      faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 18, top: "56%", right: "34%", color: T.crimson }),
    ],
  }),
  // nutrition-ish still life — a warm bloom + a couple of buds + a ladybird
  still: (ctx) => ({ layers: [
    <MeadowBand key="m" opacity={0.42 + ctx.v.mo} heightPct={66} />,
    <GroundShadow key="gs" w={ctx.H * 0.6} top={`${ctx.H * 0.52}px`} right={`${2 + ctx.j.x}%`} />,
    bloomEl(ctx, { key: "b1", size: Math.round(ctx.H * 0.92), top: `${-2 + ctx.j.y}%`, right: `${2 + ctx.j.x}%`, rot: ctx.j.rot, back: true }),
    <div key="bud1" style={{ position: "absolute", bottom: "22%", right: "30%" }}><Bud petal={ctx.cb.color} tip={ctx.cb.color2} rot={-14} size={26} /></div>,
    <div key="bud2" style={{ position: "absolute", bottom: "30%", right: "22%" }}><Bud petal={ctx.cb.color} tip={ctx.cb.color2} rot={12} size={20} /></div>,
    faunaEl(ctx, { key: "f", kind: ctx.v.creature, size: 20, top: `${22 + ctx.v.fy}%`, left: `${14 + ctx.v.fx}%`, color: T.crimson }),
  ] }),
};

export default function FloraCover({
  title = "",
  eyebrow = "",
  colorway,
  category,
  seed,
  scene,
  species,
  combo,
  width = "100%",
  height = 168,
  radius = 16,
  roundTop = false,
  titleFont = "auto",
  showTitle = true,
  animate = false,
  idx,
}) {
  const seedStr = seed != null ? String(seed) : (title || "femwell");
  const seg = useMemo(() => segmentFor(category, seedStr), [category, seedStr]);
  const sceneKey = scene || seg.scene;
  const cwKey = colorway || seg.cw;
  const cw = cwOf(cwKey);
  const cb = combo || comboOf(cwKey);
  const uid = idx || `fc${hashSeed(seedStr + sceneKey) % 100000}`;

  // deterministic per-item variation — frozen so re-renders never drift (seededRng is stateful)
  const jitter = useMemo(() => {
    const rnd = seededRng(hashSeed(seedStr + sceneKey) ^ 0x9e3779b9);
    const sp = species || pickFrom(COVER_SPECIES, rnd);
    const v = {
      flip: rnd() < 0.5,
      creature: pickFrom(CREATURES[sceneKey] || ["butterfly"], rnd),
      backForm: pickFrom(COVER_SPECIES, rnd),
      blooms: rnd() < 0.5 ? 1 : 2,
      mo: (rnd() - 0.5) * 0.14,   // meadow opacity nudge
      fx: (rnd() - 0.5) * 10,     // fauna x nudge (%)
      fy: (rnd() - 0.5) * 8,      // fauna y nudge (%)
    };
    return { sp, x: 3 + rnd() * 8, y: 4 + rnd() * 10, rot: -6 + rnd() * 12, v };
  }, [seedStr, sceneKey, species]);

  const built = useMemo(() => {
    const rnd = seededRng(hashSeed(seedStr + sceneKey + "scene"));
    const W = 320, H = 180;
    const ctx = { cb, cw: cwKey, W, H, rnd, animate, uid, species: jitter.sp, j: jitter, v: jitter.v };
    return (SCENES[sceneKey] || SCENES.bough)(ctx);
  }, [seedStr, sceneKey, cwKey, animate, uid, jitter, cb]);

  const rad = roundTop ? `${radius}px ${radius}px 0 0` : `${radius}px`;
  const wantScript = titleFont === "script" || (titleFont === "auto" && sceneKey === "duskletter");
  const titleFam = wantScript ? SCRIPT : SERIF;
  const titleSize = wantScript ? Math.round(height * 0.2) : Math.round(height * 0.135);
  const eyebrowColor = useMemo(() => legibleOn(cb.accent), [cb.accent]); // WCAG AA on the paper scrim

  const baseBg = built.bg
    || `radial-gradient(120% 96% at 80% 20%, ${cb.color2}40 0%, ${cb.color2}00 58%), linear-gradient(158deg, ${T.paperHi} 0%, ${cb.color}12 46%, ${cb.color}26 100%)`;

  // flip only the ecosystem art (not the title) for mirror variety, on scenes that read well flipped
  const flippable = !["duskletter", "nightsky"].includes(sceneKey);
  const artStyle = (jitter.v.flip && flippable) ? { position: "absolute", inset: 0, transform: "scaleX(-1)" } : { position: "absolute", inset: 0 };

  return (
    <div
      role="img"
      aria-label={title || `A ${cw.label.toLowerCase()} ${sceneKey} cover`}
      className={animate ? "fwc-anim" : undefined}
      style={{
        position: "relative", width, height, borderRadius: rad, overflow: "hidden",
        background: baseBg,
        boxShadow: `inset 0 0 0 1px ${cb.color}1F, inset 0 1px 0 ${lighten(cb.color2, 0.3)}55`,
        isolation: "isolate",
      }}
    >
      {animate && <style>{floraKeyframes + FLORA_SCENE_KEYFRAMES}</style>}

      {/* the ecosystem scene (mirrored for some seeds) */}
      <div aria-hidden style={artStyle}>{built.layers}</div>

      {/* strong ADAPTIVE foot scrim — near-solid paper where the title sits, so dark ink always
          meets WCAG AA regardless of the scene/colourway (incl. the light ones). */}
      {showTitle && (title || eyebrow) && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${SCRIM} 0%, ${SCRIM} 30%, ${SCRIM}E6 46%, ${SCRIM}00 70%)`, pointerEvents: "none" }} />
      )}

      {/* title lockup — real DOM text; T.ink title (~17:1) + AA-guaranteed eyebrow */}
      {showTitle && (title || eyebrow) && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 14px 13px", zIndex: 3 }}>
          {eyebrow && <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: eyebrowColor, marginBottom: 3 }}>{eyebrow}</div>}
          {title && (
            <div style={{
              fontFamily: titleFam, fontWeight: wantScript ? 400 : 600, fontSize: titleSize,
              lineHeight: wantScript ? 1.05 : 1.2, color: T.ink,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{title}</div>
          )}
        </div>
      )}
    </div>
  );
}

// named exports so piece 2 / the preview can enumerate the vocabulary
export const FLORA_COVER_SCENES = SCENE_KEYS;
export const FLORA_COVER_SEGMENTS = SEGMENTS.map((s) => ({ scene: s.scene, cw: s.cw, match: String(s.re) }));
