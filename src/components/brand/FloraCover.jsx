// FloraCover — the on-brand, in-app ECOSYSTEM cover for articles/write-ups. Piece 1 of the
// Lifestyle level-up (expanded per Halli 2026-07-14: "the WHOLE ecosystem, not just a flower —
// 5x the variety, segmented properly"). REPLACES external stock/OG images: a cover is COMPOSED
// from the real brand ecosystem language — flora (blooms, buds, sprigs, vines), FAUNA
// (butterflies, bees, dragonflies, moths, ladybirds), landscape (the real dusk meadow+bough
// FLORA_SCENE, a sky wash, a moon + stars, a wax-rose seal) — never fetched, never off-brand art.
//
// SEGMENTED: the cover's SCENE + colourway are chosen by the content's CATEGORY/MOOD/TYPE, so a
// Story (dusk + wax seal) reads visibly different from Movement (meadow + butterfly) from
// Astrology (night sky + moon) from Love (a gathered posy). 9 scene archetypes x 9 colourways x
// seeded variation (species / creature / counts / positions) = a large, varied space.
//
// DETERMINISTIC: same item id -> same cover, every device/render (hashSeed/seededRng frozen in a
// useMemo; no seededRng-in-render drift). Reduced-motion-safe; role="img" + aria-label.
// Additive/reusable — piece 2 (the big ArticleCard deck) drops it in. No backend, no network.
//
//   <FloraCover title="She left the party early" eyebrow="Story · 8 min"
//               category="fiction" seed={item.id} />   // -> dusk letter scene, plum, script title
//
// Props: title, eyebrow, colorway?, category?, seed?, scene?, species?, combo?, width?, height?,
//        radius?, roundTop?, titleFont? ("fraunces"|"script"|"auto"), showTitle?, animate?, idx?
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

// ── SEGMENTATION — category/mood/type → { scene, cw }. Different content → different world. ──
// Ordered; first match wins. `scene` = an ecosystem archetype (below); `cw` = colourway.
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
  { re: /food|nutrition|nourish|cook|recipe|eat|meal|kitchen/, scene: "still", cw: "gold" },
  { re: /read|book|essay|guide|learn|longread|explain/, scene: "bough", cw: "cream" },
];
const CW_KEYS = ["crimson", "coral", "gold", "blush", "plum", "lavender", "sky", "sage", "cream"];
const SCENE_KEYS = ["bough", "meadow", "still", "posy", "gathering", "wildflower", "duskletter", "nightsky", "windowsill"];
function segmentFor(category, seedStr) {
  const c = String(category || "").toLowerCase();
  for (const s of SEGMENTS) if (s.re.test(c)) return { scene: s.scene, cw: s.cw };
  const h = hashSeed(category || seedStr || "femwell");
  return { scene: SCENE_KEYS[h % SCENE_KEYS.length], cw: CW_KEYS[(h >> 3) % CW_KEYS.length] };
}

// ── reusable landscape: the REAL dusk meadow + bough (FLORA_SCENE), bottom-anchored ──
function MeadowBand({ opacity = 0.6, heightPct = 76 }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${heightPct}%`, opacity, pointerEvents: "none" }}>
      <svg viewBox={`0 0 ${FLORA_STAGE.w} ${FLORA_STAGE.h}`} preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: "block" }}
        dangerouslySetInnerHTML={{ __html: FLORA_SCENE_DEFS + FLORA_SCENE }} />
    </div>
  );
}

// ── on-brand sky primitives (built, not fetched; gold/cream, carved feel) ──
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
function Stars({ rnd, n = 7, accent = "#E8C766", W, H }) {
  const pts = Array.from({ length: n }).map(() => ({ x: 6 + rnd() * (W - 12), y: 6 + rnd() * (H * 0.5), r: 0.7 + rnd() * 1.1, o: 0.4 + rnd() * 0.5 }));
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
        {/* a small carved rose/heart at the centre — the sealed-letter mark */}
        <path d="M23 30 C 17 25.5 15.5 21 18 18.5 C 19.6 16.9 21.6 17.4 23 19.4 C 24.4 17.4 26.4 16.9 28 18.5 C 30.5 21 29 25.5 23 30 Z" fill={lighten(color, 0.34)} opacity="0.92" />
      </svg>
    </div>
  );
}

// ── the 9 ECOSYSTEM SCENES — each returns { bg?, layers } given the composed context ──
// ctx: { cb, cw, W, H, rnd, animate, uid, species }
function bloom(ctx, { size, top, right, left, rot = 0, openness = 1, form, key }) {
  const pos = left != null ? { left } : { right };
  return (
    <div key={key} style={{ position: "absolute", top, ...pos, transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 6px 12px rgba(46,38,27,0.14))", pointerEvents: "none" }}>
      <RichBloomV2 form={form || ctx.species} color={ctx.cb.color} color2={ctx.cb.color2} accent={ctx.cb.accent} size={size} openness={openness} soft animate={ctx.animate} headOnly idx={`${ctx.uid}-${key}`} />
    </div>
  );
}
function fauna(ctx, { kind, size, top, right, left, color, color2, key }) {
  const pos = left != null ? { left } : { right };
  return (
    <div key={key} style={{ position: "absolute", top, ...pos, pointerEvents: "none" }}>
      <Pollinator kind={kind} size={size} color={color || ctx.cb.color} color2={color2 || ctx.cb.color2} pattern="bands" animate={ctx.animate} idx={`${ctx.uid}-${key}`} />
    </div>
  );
}

const SCENES = {
  // read / career / generic — a bough with a hero bloom + a bee
  bough: (ctx) => ({ layers: [
    <MeadowBand key="m" opacity={0.5} heightPct={72} />,
    bloom(ctx, { key: "b1", size: Math.round(ctx.H * 1.0), top: `${-10 - ctx.j.y}%`, right: `${-4 - ctx.j.x}%`, rot: ctx.j.rot }),
    fauna(ctx, { key: "f", kind: "bee", size: 26, top: "16%", left: "12%", color: ctx.cb.accent }),
  ] }),
  // movement / nature — the meadow, brighter, a butterfly
  meadow: (ctx) => ({ layers: [
    <MeadowBand key="m" opacity={0.74} heightPct={82} />,
    bloom(ctx, { key: "b1", size: Math.round(ctx.H * 0.86), top: `${4 + ctx.j.y}%`, right: `${4 + ctx.j.x}%`, rot: ctx.j.rot }),
    fauna(ctx, { key: "f", kind: "butterfly", size: 34, top: "14%", left: "10%", color: "#8E6E8E", color2: ctx.cb.accent }),
  ] }),
  // nutrition / food — a warm bloom + a couple of buds (a little harvest) + a ladybird
  still: (ctx) => ({ layers: [
    <MeadowBand key="m" opacity={0.44} heightPct={68} />,
    bloom(ctx, { key: "b1", size: Math.round(ctx.H * 0.92), top: `${-2 + ctx.j.y}%`, right: `${2 + ctx.j.x}%`, rot: ctx.j.rot }),
    <div key="bud1" style={{ position: "absolute", bottom: "22%", right: "30%" }}><Bud petal={ctx.cb.color} tip={ctx.cb.color2} rot={-14} size={26} /></div>,
    <div key="bud2" style={{ position: "absolute", bottom: "30%", right: "22%" }}><Bud petal={ctx.cb.color} tip={ctx.cb.color2} rot={12} size={20} /></div>,
    fauna(ctx, { key: "f", kind: "ladybird", size: 20, top: "24%", left: "16%", color: T.crimson }),
  ] }),
  // friendship / beauty — a small gathered posy + a butterfly
  posy: (ctx) => ({ layers: [
    <div key="bq" style={{ position: "absolute", top: "50%", right: "2%", transform: "translateY(-50%)", filter: "drop-shadow(0 6px 12px rgba(46,38,27,0.13))" }}>
      <Bouquet items={[{ form: ctx.species, colorway: ctx.cw }, { form: "cosmos", colorway: ctx.cw }, { form: "ranunculus", colorway: ctx.cw }]} size={Math.round(ctx.H * 1.02)} animate={ctx.animate} idx={`${ctx.uid}-bq`} />
    </div>,
    fauna(ctx, { key: "f", kind: "butterfly", size: 30, top: "16%", left: "12%", color: ctx.cb.color, color2: ctx.cb.color2 }),
  ] }),
  // love / relationships — a fuller posy + two butterflies
  gathering: (ctx) => ({ layers: [
    <div key="bq" style={{ position: "absolute", top: "52%", right: "0%", transform: "translateY(-50%)", filter: "drop-shadow(0 6px 13px rgba(46,38,27,0.14))" }}>
      <Bouquet items={[{ form: ctx.species, colorway: ctx.cw }, { form: "rose", colorway: ctx.cw }, { form: "peony", colorway: ctx.cw }, { form: "cosmos", colorway: ctx.cw }]} size={Math.round(ctx.H * 1.1)} animate={ctx.animate} idx={`${ctx.uid}-bq`} />
    </div>,
    fauna(ctx, { key: "f1", kind: "butterfly", size: 32, top: "12%", left: "10%", color: ctx.cb.color, color2: ctx.cb.accent }),
    fauna(ctx, { key: "f2", kind: "butterfly", size: 22, top: "30%", left: "24%", color: ctx.cb.color2, color2: ctx.cb.color }),
  ] }),
  // creativity / fashion — flanking vines + two blooms at different heights + a dragonfly
  wildflower: (ctx) => ({ layers: [
    <div key="vL" style={{ position: "absolute", left: -6, bottom: -6, opacity: 0.5, pointerEvents: "none" }}><VineMotifV2 color={ctx.cb.accent} color2={ctx.cb.color2} opacity={0.6} w={Math.round(ctx.H * 0.7)} idx={`${ctx.uid}-vL`} /></div>,
    <div key="vR" style={{ position: "absolute", right: -6, top: -6, opacity: 0.42, pointerEvents: "none" }}><VineMotifV2 color={ctx.cb.accent} color2={ctx.cb.color2} opacity={0.55} w={Math.round(ctx.H * 0.6)} flip idx={`${ctx.uid}-vR`} /></div>,
    bloom(ctx, { key: "b1", size: Math.round(ctx.H * 0.8), top: `${-4 + ctx.j.y}%`, right: "6%", rot: ctx.j.rot }),
    bloom(ctx, { key: "b2", size: Math.round(ctx.H * 0.58), top: "40%", right: "34%", rot: -ctx.j.rot, form: "cosmos", openness: 0.8 }),
    fauna(ctx, { key: "f", kind: "dragonfly", size: 34, top: "18%", left: "10%", color: ctx.cb.accent, color2: ctx.cb.color }),
  ] }),
  // story / letter — a warm dusk grade + a wax-rose seal + a single closed bud + a faint sprig
  duskletter: (ctx) => ({
    bg: `radial-gradient(130% 100% at 78% 24%, ${ctx.cb.color2}3A 0%, ${ctx.cb.color2}00 56%), linear-gradient(168deg, #EFE6D4 0%, ${ctx.cb.accent}1F 44%, ${ctx.cb.color}30 100%)`,
    layers: [
      <div key="sprig" style={{ position: "absolute", left: -4, bottom: -4, opacity: 0.3, pointerEvents: "none" }}><CornerSprig variant="sprig" color={ctx.cb.accent} size={Math.round(ctx.H * 0.5)} corner="bl" idx={`${ctx.uid}-sp`} /></div>,
      <div key="bud" style={{ position: "absolute", top: "42%", right: "30%", transform: `rotate(${ctx.j.rot}deg)` }}><Bud petal={ctx.cb.color} tip={ctx.cb.color2} rot={-8} size={Math.round(ctx.H * 0.28)} /></div>,
      <WaxSeal key="seal" size={Math.round(ctx.H * 0.32)} x="60%" y="16%" color={ctx.cw === "plum" ? "#8E2E52" : "#BC2E27"} />,
    ],
  }),
  // astrology / sky — a twilight top wash + moon + stars + a moth
  nightsky: (ctx) => ({
    bg: `linear-gradient(180deg, ${darken(ctx.cb.color, 0.2)}CC 0%, ${ctx.cb.color}55 34%, ${T.paperHi} 82%)`,
    layers: [
      <Stars key="stars" rnd={ctx.rnd} n={8} accent={ctx.cb.accent} W={ctx.W} H={ctx.H} />,
      <Moon key="moon" size={Math.round(ctx.H * 0.3)} x="66%" y="14%" accent={ctx.cb.accent} uid={ctx.uid} />,
      <div key="sprig" style={{ position: "absolute", left: -3, bottom: -3, opacity: 0.42, pointerEvents: "none" }}><CornerSprig variant="sprig" color={darken(ctx.cb.color, 0.1)} size={Math.round(ctx.H * 0.46)} corner="bl" idx={`${ctx.uid}-sp`} /></div>,
      fauna(ctx, { key: "f", kind: "moth", size: 32, top: "40%", left: "14%", color: lighten(ctx.cb.color, 0.2), color2: ctx.cb.accent }),
    ],
  }),
  // rest / calm — a soft sky + one serene bloom + a resting ladybird
  windowsill: (ctx) => ({
    bg: `radial-gradient(120% 96% at 26% 18%, ${ctx.cb.color2}3C 0%, ${ctx.cb.color2}00 58%), linear-gradient(160deg, ${T.paperHi} 0%, ${ctx.cb.color}14 60%, ${ctx.cb.color}22 100%)`,
    layers: [
      bloom(ctx, { key: "b1", size: Math.round(ctx.H * 0.9), top: `${2 + ctx.j.y}%`, right: `${4 + ctx.j.x}%`, rot: ctx.j.rot, openness: 0.92 }),
      <div key="sprig" style={{ position: "absolute", left: -4, top: -4, opacity: 0.34, pointerEvents: "none" }}><CornerSprig variant="sprig" color={ctx.cb.accent} size={Math.round(ctx.H * 0.44)} corner="tl" idx={`${ctx.uid}-sp`} /></div>,
      fauna(ctx, { key: "f", kind: "ladybird", size: 18, top: "56%", right: "34%", color: T.crimson }),
    ],
  }),
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

  // deterministic per-item choices (species · jitter), frozen so re-renders never drift
  const jitter = useMemo(() => {
    const rnd = seededRng(hashSeed(seedStr + sceneKey) ^ 0x9e3779b9);
    const sp = species || pickFrom(COVER_SPECIES, rnd);
    return { sp, x: 3 + rnd() * 8, y: 4 + rnd() * 10, rot: -6 + rnd() * 12 };
  }, [seedStr, sceneKey, species]);

  // a fresh deterministic rng for scene-time scatter (stars etc.) — same seed → same scatter
  const built = useMemo(() => {
    const rnd = seededRng(hashSeed(seedStr + sceneKey + "scene"));
    const W = 320, H = 180; // scene svg coord space (aspect-agnostic; laid out in %)
    const ctx = { cb, cw: cwKey, W, H, rnd, animate, uid, species: jitter.sp, j: jitter };
    return (SCENES[sceneKey] || SCENES.bough)(ctx);
  }, [seedStr, sceneKey, cwKey, animate, uid, jitter, cb]);

  const rad = roundTop ? `${radius}px ${radius}px 0 0` : `${radius}px`;
  const wantScript = titleFont === "script" || (titleFont === "auto" && sceneKey === "duskletter");
  const titleFam = wantScript ? SCRIPT : SERIF;
  const titleSize = wantScript ? Math.round(height * 0.2) : Math.round(height * 0.135);

  const baseBg = built.bg
    || `radial-gradient(120% 96% at 80% 20%, ${cb.color2}40 0%, ${cb.color2}00 58%), linear-gradient(158deg, ${T.paperHi} 0%, ${cb.color}12 46%, ${cb.color}26 100%)`;

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

      {/* the ecosystem scene */}
      {built.layers}

      {/* foot scrim so the ink title always sits on calm ground */}
      {showTitle && (title || eyebrow) && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${T.paperHi}F2 0%, ${T.paperHi}70 26%, transparent 56%)`, pointerEvents: "none" }} />
      )}

      {/* title lockup — real DOM text (selectable/translatable) */}
      {showTitle && (title || eyebrow) && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 14px 13px", zIndex: 3 }}>
          {eyebrow && <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: cb.accent, marginBottom: 3 }}>{eyebrow}</div>}
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

// named export so piece 2 / the preview can enumerate the scene + segment vocabulary
export const FLORA_COVER_SCENES = SCENE_KEYS;
export const FLORA_COVER_SEGMENTS = SEGMENTS.map((s) => ({ scene: s.scene, cw: s.cw, match: String(s.re) }));
