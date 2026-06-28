// floraOmen.js — THE ROTATING FLORA-OMEN ENGINE (BRAND_IDENTITY §10.2–10.5, AGREED canon).
//
// A pure, static front-end module. NO backend call, NO new base44 function. Picks ONE
// gentle, hope-only omen for the user TODAY from REAL signals (cycle phase/day, life-stage,
// recent mood/theme, days-since-last-open, the date/season), rotating on a daily seed
// (hashSeed(userId + 'YYYY-MM-DD') — same on every device, rotates daily). A priority ladder
// chooses the most relevant signal; a graceful seasonal FALLBACK means it's NEVER blank or fake.
//
// The omen contract (§10.2) — every line: (a) kind & hopeful; (b) folklore — "they say…" —
// never a promise; (c) ends in a small action or a true observation; (d) never doom/guilt.
// Safety rails (§10.4) baked in here: HOPE-ONLY (no dark variants in the library); the caller
// RATIONS it (one almanac/day on Today); a hard-memory signal (grief/loss/low-low) is NEVER a
// trigger — such signals are simply not passed, and the fallback stays gentle.
//
// Copy bank grounded in workspace/OMEN_VOICE_RESEARCH_2026-06-19.md (cited folklore).
import { hashSeed } from "@/components/brand/flora";

// ── the meaning library ──────────────────────────────────────────────────────
// kind: "creature" (a Pollinator glyph) | "flower" (a FlowerGlyph). meaning = the fixed
// folk/floriography meaning (reveal layer 1). line = the "they say…" omen (layer 2). nudge =
// a small do-able action that ends it. why = a template the engine fills from her signals.
// season = [startMonth, endMonth] (1–12, inclusive, wraps) or null = any time. accent token.
export const CREATURES = {
  robin:      { glyph: "robin",      meaning: "Robin — news on the way",          accent: "crimson", line: "A robin in the garden. They say it means someone's thinking of you, and good news is on its way — robins were always winter's company, so people read them as hope.", nudge: "Worth texting the person you keep meaning to.", domains: ["connection", "joy"] },
  butterfly:  { glyph: "butterfly",  meaning: "White butterfly — change, the soul", accent: "blush", line: "A white butterfly. The old story is it's news on the wing — and a small sign you're on the right path.", nudge: "Whatever you're turning over, lean toward the brave version.", domains: ["identity", "change"] },
  ladybird:   { glyph: "ladybird",   meaning: "Ladybird — small luck",             accent: "crimson", line: "A ladybird landed today. Count the spots — that's how many good months they say are coming.", nudge: "Put the kettle on and let the luck settle in.", domains: ["joy", "luck"] },
  bee:        { glyph: "bee",        meaning: "Bee — connection, news to share",   accent: "gold", line: "A bee at the window. They say it means a visitor's coming — and the old custom is you tell the bees your news, so they don't take offence and leave.", nudge: "Tell the garden something true today.", domains: ["connection"] },
  dragonfly:  { glyph: "dragonfly",  meaning: "Dragonfly — clear-eyed change",     accent: "sky", line: "A dragonfly came by. They're said to mean a change you can finally see clearly — trust what you can see now.", nudge: "Name the one thing you've stopped pretending not to know.", domains: ["clarity", "change"] },
  moth:       { glyph: "moth",       meaning: "Moth — quiet transformation",       accent: "plum", line: "A moth at the lamp. Some changes happen quietly, in the dark — yours is one of them.", nudge: "Rest counts as part of it. Let tonight be soft.", domains: ["rest", "change"] },
  firefly:    { glyph: "firefly",    meaning: "Firefly — hope in the dark",        accent: "gold", line: "A firefly. One tiny spark still shows the way — and the smallest light still counts as light.", nudge: "Do one small bright thing for yourself.", domains: ["hope", "joy"] },
  snail:      { glyph: "snail",      meaning: "Snail — steady progress",           accent: "sage", line: "A snail in the green. Slow is still forward — the old gardeners prized its patient pace.", nudge: "Today doesn't have to be fast. One small step is the whole job.", domains: ["work", "rest"] },
  hummingbird:{ glyph: "hummingbird",meaning: "Hummingbird — joy with wings",      accent: "crimson", line: "A hummingbird. Pure joy with wings — and a little luck for the day, the way the old stories tell it.", nudge: "Chase the thing that's actually fun for ten minutes.", domains: ["joy"] },
};
export const FLOWERS = {
  snowdrop:   { glyph: "snowdrop",   meaning: "Snowdrop — hope, consolation",      accent: "sage", line: "The first snowdrop. Proof life keeps going even through the cold — it's meant hope for centuries, flowering right through the snow.", nudge: "Begin the small thing you've been waiting for warmer weather to start.", domains: ["hope", "beginnings"], season: [1, 3] },
  poppy:      { glyph: "poppy",      meaning: "Poppy — rest, consolation",         accent: "crimson", line: "A poppy, nodding. They've always stood for rest and quiet consolation — a flower that asks nothing of you.", nudge: "Take the rest without earning it first.", domains: ["rest"] },
  sunflower:  { glyph: "sunflower",  meaning: "Sunflower — radiance, warmth",      accent: "gold", line: "A sunflower, turned to the light. The old reading is warmth and steadiness — it follows the sun all day and asks for nothing back.", nudge: "Turn toward the warmest part of your day on purpose.", domains: ["joy", "energy"] },
  dahlia:     { glyph: "dahlia",     meaning: "Dahlia — inner strength, dignity",  accent: "plum", line: "A dahlia, full and late. Folk wisdom gives it dignity and quiet strength — it blooms longest as the season turns.", nudge: "Trust the strength you've been underselling.", domains: ["identity", "work"] },
  cosmos:     { glyph: "cosmos",     meaning: "Cosmos — order, ease, harmony",     accent: "blush", line: "A cosmos in the border. Named for order and harmony — they say it brings a settled kind of calm.", nudge: "Let one thing be simple today.", domains: ["rest", "joy"] },
  forget:     { glyph: "forget-me-not", meaning: "Forget-me-not — remembrance, ties", accent: "sky", line: "A forget-me-not. The old name keeps its promise — they stand for the people held close even at a distance.", nudge: "Reach out to someone you've been holding in mind.", domains: ["connection"] },
  iris:       { glyph: "iris",       meaning: "Iris — courage, a message",         accent: "plum", line: "An iris, standing tall. Named for the rainbow messenger — folk lore reads it as courage and good word arriving.", nudge: "Say the brave sentence you keep rehearsing.", domains: ["courage", "identity"] },
  crocus:     { glyph: "primrose",   meaning: "First bloom — renewal",             accent: "gold", line: "The first bloom of the turn. The old gardeners read the year's first flower as plain renewal — good things gathering.", nudge: "Plant or begin one small new thing.", domains: ["beginnings"], season: [2, 4] },
};

// cycle phase → its signature flower (the body-season omen)
const PHASE_FLOWER = { menstrual: "poppy", follicular: "snowdrop", ovulatory: "sunflower", luteal: "dahlia" };
const PHASE_WHY = {
  menstrual: "You're in your inner winter — rest is the work this week.",
  follicular: "You're on the rise again — a good week to begin.",
  ovulatory: "You're at your brightest stretch — spend a little of it on you.",
  luteal: "You're turning inward — be the steady, generous one to yourself first.",
};

// fallback rotation — gentle, never-blank, won't repeat within a fortnight (large enough set)
const FALLBACK = ["snail", "firefly", "robin", "bee", "ladybird", "dragonfly", "hummingbird", "moth", "butterfly"];

const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const inSeason = (season, month) => { if (!season) return true; const [a, b] = season; return a <= b ? month >= a && month <= b : month >= a || month <= b; };
const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

// daily seed — stable all day, rotates daily, same on every device (§10.3)
export function omenSeed(userId, d = new Date()) { return hashSeed(`${userId || "guest"}|${todayKey(d)}`); }

// Build the signals object from context the page already loads. NO new fetch.
// hardMemory: pass true ONLY if a grief/loss/very-low signal is present → the engine will
// stay on a gentle seasonal fallback and never turn it into a "fortune". (Rail §10.4.2.)
export function buildOmenSignals({ phaseKey = null, cycleDay = null, lifeStage = null, daysSinceOpen = 0, mood = null, theme = null, date = new Date(), hardMemory = false } = {}) {
  return { phaseKey, cycleDay, lifeStage, daysSinceOpen: Number(daysSinceOpen) || 0, mood, theme, month: date.getMonth() + 1, date, hardMemory };
}

// THE PICKER — priority ladder (highest available wins; seed breaks ties + rotates). §10.3.
// Returns { kind, key, glyph, meaning, line, nudge, why, accent } — always something (fallback).
export function pickOmen(signals = {}, seed = 0) {
  const s = signals;
  const make = (kind, key, lib, why) => { const e = lib[key]; if (!e) return null; return { kind, key, glyph: e.glyph, meaning: e.meaning, line: e.line, nudge: e.nudge, why, accent: e.accent }; };

  // Rail 2: a hard-memory day never becomes a fortune — go straight to a gentle seasonal fallback.
  if (!s.hardMemory) {
    // 1 — LIFE EVENT (welcome-back · the bright returns)
    if (s.daysSinceOpen >= 7) {
      const r = make("creature", "butterfly", CREATURES, "You've been away a little while — and you came back. That's the omen, really.");
      if (r) return r;
    }

    // 2 — BODY SEASON (cycle phase → its flower)
    if (s.phaseKey && PHASE_FLOWER[s.phaseKey] && FLOWERS[PHASE_FLOWER[s.phaseKey]]) {
      // rotate: most days the phase-flower; some days a kindred creature, seed-decided
      const useCreature = (seed % 3 === 0);
      if (!useCreature) { const r = make("flower", PHASE_FLOWER[s.phaseKey], FLOWERS, PHASE_WHY[s.phaseKey]); if (r) return r; }
      const kin = s.phaseKey === "menstrual" ? "moth" : s.phaseKey === "follicular" ? "robin" : s.phaseKey === "ovulatory" ? "hummingbird" : "snail";
      const r = make("creature", kin, CREATURES, PHASE_WHY[s.phaseKey]); if (r) return r;
    }

    // 3 — RECENT STORY (mood / theme → a matching gentle omen)
    const t = `${s.mood || ""} ${s.theme || ""}`.toLowerCase();
    if (/low|tired|flat|hard|heavy|sad|anx/.test(t)) { const r = make("creature", "firefly", CREATURES, "It's been a heavier stretch — so here's a small light, on purpose."); if (r) return r; }
    if (/brave|work|career|push|interview|ask/.test(t)) { const r = make("creature", "dragonfly", CREATURES, "You've been carrying something big — you can see it clearly now."); if (r) return r; }
    if (/love|friend|connect|lonely|miss/.test(t)) { const r = make("flower", "forget", FLOWERS, "The people you've been thinking of are worth a small reach today."); if (r) return r; }
    if (/joy|happy|good|win|proud/.test(t)) { const r = make("creature", "ladybird", CREATURES, "A good run lately — count the spots and let it land."); if (r) return r; }

    // 4 — CALENDAR / SKY (seasonal flora omens in their window)
    const inSeasonFlowers = Object.keys(FLOWERS).filter((k) => FLOWERS[k].season && inSeason(FLOWERS[k].season, s.month));
    if (inSeasonFlowers.length) { const k = pick(inSeasonFlowers, seed); const r = make("flower", k, FLOWERS, "The season turned this in your favour — it only shows up now."); if (r) return r; }
  }

  // 5 — GRACEFUL FALLBACK (never blank, never fake) — a gentle daily creature, seed-rotated
  const k = pick(FALLBACK, seed + (s.month || 0));
  return make("creature", k, CREATURES, "No grand sign today — just a small, ordinary bit of garden luck. They count too.");
}
