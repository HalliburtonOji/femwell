// FloraCover — the on-brand, in-app article/write-up cover. Piece 1 of the Lifestyle
// level-up (BRAND_IDENTITY §3.2 of the plan). REPLACES external stock/OG images for
// FemWell-authored content: a cover is COMPOSED, never fetched — a colour-graded paper
// gradient in the item's colourway + a two-tone RichBloomV2 flora head + a garden sprig +
// a Fraunces/Ephesis title lockup. Fully DETERMINISTIC (same seed → same cover, every
// device, every render) so a piece always wears the same face, and reduced-motion-safe.
//
// Reusable + additive: nothing else imports it yet. Piece 2 (the big ArticleCard deck)
// drops it in as the card cover. No backend, no network, no live-Lifestyle changes.
//
//   <FloraCover title="The quiet art of a slow Sunday" eyebrow="Essay · 6 min"
//               category="rest & recovery" seed={item.id} />
//
// Props:
//   title      : the write-up title (rendered in the title lockup).            [string]
//   eyebrow    : small kicker over the title, e.g. "Essay · 6 min".            [string?]
//   colorway   : one of the 9 §2.5 colourway keys (crimson/blush/gold/sage/    [string?]
//                plum/lavender/cream/coral/sky). Wins over `category`.
//   category   : a LifestyleItems.category — mapped to a colourway when         [string?]
//                `colorway` is absent (keyword map + deterministic fallback).
//   seed       : deterministic seed (pass item.id). Same seed → same species,  [string|number?]
//                sprig corner, and micro-jitter. Falls back to the title.
//   species    : explicit flora form (e.g. "rose","peony","sunflower"); else   [string?]
//                chosen deterministically from a curated cover set by seed.
//   combo      : explicit two-tone {color,color2,accent}; else the colourway's  [object?]
//                §2.5.1 vivid combo.
//   width      : css width (default "100%").                                    [number|string?]
//   height     : cover height in px (default 168).                             [number?]
//   radius     : corner radius (default 16). `roundTop` keeps only the top      [number?]
//                corners round (for sitting atop a card body).
//   roundTop   : round only the top two corners.                              [bool?]
//   titleFont  : "fraunces" (default) | "script" (Ephesis, for stories).       [string?]
//   showTitle  : render the title lockup (default true; false = art-only art).  [bool?]
//   animate    : subtle bloom breath (default false — covers are calm).        [bool?]
//   idx        : uniqueness token for gradient ids (default derived from seed). [string?]
import { useMemo } from "react";
import { RichBloomV2, CornerSprig, cwOf, hashSeed, seededRng, floraKeyframes, lighten } from "@/components/brand/flora";
import { T, SERIF, SCRIPT, UI } from "@/components/journal/Editorial";

// ── colourway → the §2.5.1 VIVID TWO-TONE combo (petal → lit tip / jewelled heart) ──
// One combo per colourway so colour still carries meaning (§2.5); richer than the flat tones.
const COMBO = {
  crimson:  { color: "#C33A2C", color2: "#E8895F", accent: "#D4AF37" }, // crimson + gold
  coral:    { color: "#E86A44", color2: "#F6C066", accent: "#B8502E" }, // coral → gold
  gold:     { color: "#E8A24E", color2: "#F8CE9A", accent: "#C05A4E" }, // amber + rose
  blush:    { color: "#E098B0", color2: "#F8DCE6", accent: "#A83E5E" }, // blush → deep-rose
  plum:     { color: "#C63A75", color2: "#F4DCE6", accent: "#8E2E52" }, // magenta → cream
  lavender: { color: "#8A63B4", color2: "#CBB8E4", accent: "#E8C766" }, // violet + butter
  sky:      { color: "#7C8CC8", color2: "#C0CAE6", accent: "#E8C766" }, // periwinkle + gold
  sage:     { color: "#7FA07F", color2: "#CDE0CD", accent: "#C08A3F" }, // sage + warm gold heart
  cream:    { color: "#D9C79E", color2: "#F2EAD6", accent: "#A8893F" }, // cream + gold heart
};
const comboOf = (key) => COMBO[key] || COMBO.gold;

// ── curated cover species (all render a recognisable head in RichBloomV2) ──
const COVER_SPECIES = ["peony", "rose", "sunflower", "tulip", "magnolia", "dahlia", "poppy", "ranunculus", "camellia", "anemone", "cosmos", "marigold"];

// ── category → colourway (keyword map; deterministic fallback keeps every item warm) ──
const CW_KEYS = ["crimson", "coral", "gold", "blush", "plum", "lavender", "sky", "sage", "cream"];
const CATEGORY_CW = [
  [/love|relationship|dating|marriage|romance|partner/, "crimson"],
  [/friend|community|social|belong|connection/, "coral"],
  [/career|work|money|finance|ambition|success|productivity/, "gold"],
  [/beauty|fashion|style|skin|hair|glow/, "blush"],
  [/creativ|art|craft|write|music|make|hobby|interest/, "plum"],
  [/astrolog|horoscope|moon|sky|spirit|ritual|manifest/, "lavender"],
  [/mind|calm|rest|sleep|recovery|anxiety|breathe|meditat|wellbeing|self.?care/, "sky"],
  [/nature|outdoor|garden|walk|movement|body|energy|nourish|food|nutrition/, "sage"],
  [/read|book|story|fiction|learn|essay|guide/, "cream"],
];
function colourwayForCategory(category, seed) {
  const c = String(category || "").toLowerCase();
  for (const [re, cw] of CATEGORY_CW) if (re.test(c)) return cw;
  return CW_KEYS[hashSeed(category || seed || "femwell") % CW_KEYS.length];
}

export default function FloraCover({
  title = "",
  eyebrow = "",
  colorway,
  category,
  seed,
  species,
  combo,
  width = "100%",
  height = 168,
  radius = 16,
  roundTop = false,
  titleFont = "fraunces",
  showTitle = true,
  animate = false,
  idx,
}) {
  const seedStr = seed != null ? String(seed) : (title || "femwell");
  const cwKey = colorway || colourwayForCategory(category, seedStr);
  const cw = cwOf(cwKey);
  const cb = combo || comboOf(cwKey);
  const uid = idx || `fc${hashSeed(seedStr) % 100000}`;

  // deterministic per-item choices (species · sprig corner · gentle jitter) — frozen so
  // re-renders never drift (seededRng is stateful; compute once).
  const d = useMemo(() => {
    const rnd = seededRng(hashSeed(seedStr) ^ 0x9e3779b9);
    const sp = species || COVER_SPECIES[Math.floor(rnd() * COVER_SPECIES.length)];
    const corners = ["tl", "bl"]; // the sprig sits opposite the bloom (top-right)
    const corner = corners[Math.floor(rnd() * corners.length)];
    const jx = 4 + rnd() * 8;     // bloom x nudge (%)
    const jy = 6 + rnd() * 10;    // bloom y nudge (%)
    const rot = -6 + rnd() * 12;  // bloom tilt
    const open = 0.86 + rnd() * 0.14;
    return { sp, corner, jx, jy, rot, open };
  }, [seedStr, species]);

  const bloomSize = Math.round(height * 1.02);
  const rad = roundTop ? `${radius}px ${radius}px 0 0` : `${radius}px`;
  const titleFam = titleFont === "script" ? SCRIPT : SERIF;
  const titleSize = titleFont === "script" ? Math.round(height * 0.19) : Math.round(height * 0.135);

  // layered colour grade: paper → colourway wash, a warm radial glow behind the bloom,
  // and a soft light scrim at the foot so the ink title always sits on calm ground.
  const bg = [
    `radial-gradient(120% 96% at ${82 - d.jx}% ${18 + d.jy}%, ${cb.color2}44 0%, ${cb.color2}00 58%)`,
    `linear-gradient(158deg, ${T.paperHi} 0%, ${cb.color}12 46%, ${cb.color}26 100%)`,
  ].join(", ");

  return (
    <div
      role="img"
      aria-label={title || `A ${cw.label.toLowerCase()} flora cover`}
      className={animate ? "fwc-anim" : undefined}
      style={{
        position: "relative",
        width,
        height,
        borderRadius: rad,
        overflow: "hidden",
        background: bg,
        boxShadow: `inset 0 0 0 1px ${cb.color}1F, inset 0 1px 0 ${lighten(cb.color2, 0.3)}55`,
        isolation: "isolate",
      }}
    >
      {animate && <style>{floraKeyframes}</style>}

      {/* garden sprig — a faint corner of the flora world, opposite the bloom */}
      <div style={{ position: "absolute", [d.corner.includes("t") ? "top" : "bottom"]: -4, [d.corner.includes("l") ? "left" : "right"]: -4, opacity: 0.34, pointerEvents: "none" }}>
        <CornerSprig variant="sprig" color={cb.accent} size={Math.round(height * 0.5)} opacity={0.7} corner={d.corner} idx={`${uid}-sprig`} />
      </div>

      {/* the bloom head — the cover's illustrated subject, one bloom (§2.5.1 rule), top-right */}
      <div style={{ position: "absolute", top: `${-d.jy}%`, right: `${-4 - d.jx}%`, transform: `rotate(${d.rot}deg)`, filter: "drop-shadow(0 6px 12px rgba(46,38,27,0.14))", pointerEvents: "none" }}>
        <RichBloomV2 form={d.sp} color={cb.color} color2={cb.color2} accent={cb.accent} size={bloomSize} openness={d.open} soft animate={animate} headOnly idx={`${uid}-bloom`} />
      </div>

      {/* foot scrim for legibility on lighter grades */}
      {showTitle && (title || eyebrow) && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${T.paperHi}F0 0%, ${T.paperHi}66 26%, transparent 58%)`, pointerEvents: "none" }} />
      )}

      {/* title lockup — real DOM text (selectable, translatable), Fraunces by default */}
      {showTitle && (title || eyebrow) && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 14px 13px", zIndex: 2 }}>
          {eyebrow && (
            <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: cb.accent, marginBottom: 3 }}>{eyebrow}</div>
          )}
          {title && (
            <div style={{
              fontFamily: titleFam, fontWeight: titleFont === "script" ? 400 : 600, fontSize: titleSize,
              lineHeight: titleFont === "script" ? 1.05 : 1.2, color: T.ink,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{title}</div>
          )}
        </div>
      )}
    </div>
  );
}
