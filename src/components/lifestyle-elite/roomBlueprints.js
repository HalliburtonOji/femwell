// Exact authored pools and safety selectors from the eleven inventoried room pages.
// Kept as shared pure data for the Ideas renderer; no page mounts or background effects.
export const Mirror = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};

const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  // include summary/excerpt so the body-neutral denylist catches diet-culture that hides in
  // body copy (which renders on the card), not only in the title. Err toward safety.
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));

// the measured filters — kept in sync with measure_mirror2.mjs
const SKINCARE = ["skin", "skincare", "acne", "breakout", "glow", "complexion", "serum", "moisturis", "spf", "sunscreen", "retinol", "cleanser", "derma", "pores", "hydrat"];
const HAIR = ["hair", "curl", "scalp", "frizz"];
const FASHION = ["fashion", "wardrobe", "outfit", "capsule", "what to wear", "dress for", "denim", "tailoring", "closet", "personal style", "get dressed", "getting dressed", "co-ord", "dresses", "loungewear", "chic"];
const FICTION = /between us|tide comes back|orchard|salt air|all my songs/i;
// body-neutral: exclude diet-culture / weight-loss / GLP-1 outright (anti-pattern gate)
const DIET_DENY = ["glp-1", "glp1", "ozempic", "wegovy", "lose weight", "weight loss", "slimmer", "size 4", "calorie", "diet ", "scale swing", "weight rises", "weight shifts", "ballmaxxing", "bulky", "get judged"];

// mood → the vibe she wants to feel today (self-directed, never prescriptive), each with a
// warm line and the fashion keywords that surface matching reads.
const MOODS = [
  { key: "bright", label: "Bright & bold", icon: "Sun", cw: "gold", line: "Colour, a statement, the thing you keep saving and never wearing. Today's the day.", kws: ["colour", "bold", "print", "bright", "statement", "red", "dress"] },
  { key: "soft", label: "Soft & cosy", icon: "Wind", cw: "blush", line: "Cocoon dressing — nothing to prove, everything to feel good in.", kws: ["loungewear", "knit", "cosy", "co-ord", "soft", "comfort", "track"] },
  { key: "sharp", label: "Pulled-together", icon: "Shirt", cw: "plum", line: "The uniform that makes the day feel handled. Clean lines, one good piece.", kws: ["tailoring", "capsule", "office", "chic", "denim", "elegant", "blazer"] },
  { key: "play", label: "Playful", icon: "Sparkles", cw: "sage", line: "Try the thing. Clash the colours. Dressing is allowed to be fun.", kws: ["trend", "vinted", "fun", "print", "summer", "accessor"] },
];

// skin genuinely shifts across the cycle (cited: oestrogen glow follicular/ovulatory,
// progesterone sebum luteal, menstrual dryness) — framed as understanding, never flaws.
// "many women notice", not "your skin will" (2025 scoping review caveat).
const SKIN_NOTE = {
  menstrual: "Skin can feel drier and more reactive this week. Many women lean gentle and rich here — less is kinder than a full active routine.",
  follicular: "Rising oestrogen often brings a natural glow. A light week — let your skin do its thing.",
  ovulatory: "Often skin's easiest few days. Nothing to fix; enjoy it.",
  luteal: "Progesterone can mean more oil and the odd breakout for many — that's chemistry, not a failing. Be steady with it.",
};
const SKIN_LABEL = { menstrual: "Bleed week", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };


return {dayOffset,rotateDaily,txtOf,hasAny,SKINCARE,HAIR,FASHION,FICTION,DIET_DENY,MOODS,SKIN_NOTE,SKIN_LABEL};
})();
export const Move = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  // include summary/excerpt too — the denylist must catch diet-culture tone that hides in the
  // body copy (which renders on the card), not only the title. Err toward safety on this domain.
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));

const MOVE_KW = ["yoga", "pilates", "walk", "dance", "stretch", "mobility", "strength", "workout", "barre", "swim", "run", "hiit", "cardio"];
// the hard content-safety gate — movement as capability, never shrinking/punishment
const DENY = ["calorie", "burn ", "burning", "torch", "shred", "fat loss", "fat burn", "belly fat", "bounce back", "weight loss", "lose weight", "slim", "snatched", "flat tummy", "flat stomach", "beach body", "summer body", "bikini body", "bikini", "melt", "blast", "shrink", "get lean", "no excuses", "guilt", "earn your", "punish", "trim", "drop a dress", "waist", "abs in", "red carpet", "sculpt", "toned", "tone up", "snap back", "snapback", "transformation", "before and after", "get ready",
  // aesthetic body-part / body-sculpting framing — movement-as-shrinking by another name
  "booty", "peachy", "bubble butt", "bum workout", "six pack", "six-pack", "abs workout", "ab workout", "flat abs", "hourglass"];

// how do you want to move today — feeling-led, self-directed (low energy is a valid answer
// that gets a KIND response, never guilt). Each maps to content keywords + a warm line.
const FEELINGS = [
  { key: "energy", label: "Full of it", icon: "Zap", cw: "gold", kws: ["strength", "hiit", "cardio", "dance", "full body", "power"], line: "Good — spend it. Something that asks a lot of you and gives it back." },
  { key: "willing", label: "Low but willing", icon: "Wind", cw: "sage", kws: ["walk", "gentle", "beginner", "yoga", "mobility", "10 min", "low impact"], line: "Then keep it small and kind. A walk counts. Ten minutes counts. Showing up IS the win." },
  { key: "tense", label: "Wound up", icon: "FeatherIcon", cw: "plum", kws: ["stretch", "mobility", "yoga", "release", "restorative", "flexibility"], line: "Let it out through your body — stretch, release, unclench. Nothing to achieve." },
  { key: "foggy", label: "Foggy-headed", icon: "Cloud", cw: "sky", kws: ["walk", "outdoor", "run", "fresh air", "cardio"], line: "Move to clear it, not to fix it. A walk changes a mood faster than a to-do list." },
  { key: "play", label: "Playful", icon: "Sparkles", cw: "blush", kws: ["dance", "barre", "fun", "beginner"], line: "Then play. Dance it out, no one's watching, no form to get right." },
  { key: "rest", label: "Not today", icon: "Moon", cw: "lavender", kws: ["restorative", "gentle", "yoga", "breath", "stretch"], line: "Rest IS training — it's where you get stronger. Maybe just breathe and stretch, or nothing at all. That's allowed." },
];

// the ONE truthful cycle line — mostly mood + energy, never "you're stronger in X" (weak evidence)
const ENERGY_NOTE = {
  menstrual: "Bleed week — energy can dip and that's information, not weakness. Gentle movement often eases cramps and lifts mood; push only if it feels good.",
  follicular: "Energy often builds this week for many women. If you feel like doing more, this can be a good window — but the science on 'phase-programming' is weak, so go by how you actually feel.",
  ovulatory: "Often a high-energy stretch. Enjoy it if it's there — no need to chase it if it isn't.",
  luteal: "Energy can taper and your body runs a touch warmer (real, from progesterone). Be kind with intensity; movement still lifts mood reliably — that part IS well evidenced.",
};
const NOTE_LABEL = { menstrual: "Bleed week", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };

// evidence-backed micro-movement — ≤5 min bouts genuinely improve mood/fitness (2022 Nature Med)
const SNACKS = [
  "One song — put it on and dance the whole thing. That's a complete workout for your mood.",
  "A five-minute walk round the block. No shoes-and-kit ritual, just out the door.",
  "Ten slow shoulder rolls and a big stretch upward. Undo the desk.",
  "Take the stairs like you mean it — one flight, a little out of breath, done.",
  "Stand up and shake out every limb for 60 seconds. Silly on purpose.",
  "A doorway chest stretch, both sides, and three deep breaths. Open you back up.",
];


return {dayOffset,rotateDaily,txtOf,hasAny,MOVE_KW,DENY,FEELINGS,ENERGY_NOTE,NOTE_LABEL,SNACKS};
})();
export const Kindred = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");

// kept as a guard even though live content measured clean (0 hits) — new ingests could carry it
const DENY = ["keep a man", "keep him", "keep your man", "how to get a man", "make him", "get him back", "high value", "high-value", "pick me", "pick-me", "manifest a man", "trap him", "wife him", "boyfriend material", "play hard to get", "make him chase", "make him jealous", "leave him on read", "mind games", "how to be irresistible", "land a man", "why you're still single", "cure for loneliness", "sigma", "alpha male", "feminine energy to attract"];

const CONN = ["friendship", "friend", "family", "loneli", "lonely", "belong", "dating", "marriage", "divorce", "breakup", "partner", "connection", "estrange", "solitude", "alone", "mother", "sister", "attachment", "desire", "couple", "caregiv", "neighbour", "community"];

// what's your heart asking for — spans ALL connection types, incl. solitude as first-class.
// "solitude" gives a warm editorial answer and suppresses any reach-out nudge.
const HEART = [
  { key: "friend", label: "A friend", icon: "Users", cw: "gold", kws: ["friendship", "best friend", "female friendship", "making friends", "friend breakup"], line: "Friendship is first-class here — not the runner-up to romance. Reach for a friend today.", nudge: true },
  { key: "family", label: "Family", icon: "Home", cw: "sage", kws: ["family", "mother", "sister", "daughter", "parent", "sibling", "caregiv", "estrange", "grandmother"], line: "Family is complicated for most of us. Closeness, distance, and everything between are all allowed.", nudge: false },
  { key: "love", label: "Love", icon: "Heart", cw: "crimson", kws: ["dating", "marriage", "partner", "romantic", "attachment", "desire", "couple", "breakup"], line: "Love, honestly — attachment and desire, not tactics. However yours looks right now.", nudge: false },
  { key: "belong", label: "To belong", icon: "HandHeart", cw: "plum", kws: ["loneli", "lonely", "belong", "community", "neighbour", "gathering", "isolat"], line: "Wanting to belong is one of the most human things there is. You're not the only one feeling it — the young feel it most of all.", nudge: true },
  { key: "solitude", label: "Just solitude", icon: "Leaf", cw: "lavender", kws: [], line: "Then solitude it is — and that's not a lesser answer. Being good company for yourself is its own kind of full. Nothing to reach for today.", nudge: false },
];

// honest, cited notes — permission, never pressure
const REACH_OUT = "One small, evidence-backed thing: people are happier to hear from you than you'd ever guess — someone measured it. No pressure. But maybe text them.";


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,DENY,CONN,HEART,REACH_OUT};
})();
export const Curious = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");
// health content lives in Health, not Curious
const HEALTH = ["cycle", "hormone", "period", "menstrual", "estrogen", "oestrogen", "ovulation", "luteal", "follicular", " pms ", "menopause", "perimenopause", "libido", "your body", "body image", "fertility", "pregnan", "postpartum", "symptom"];
// productivity-guilt / hustle / credentialism / must-be-useful
const DENY = ["side hustle", "side-hustle", "monetize", "monetise", "passive income", "side income", "make money from", "turn your hobby", "turn your passion into", "10x", "optimize your", "optimise your", "productivity hack", "girlboss", "level up your career", "upskill", "up-skill", "falling behind", "fix yourself", "best version of yourself", "upgrade yourself", "self-optimi", "skills that pay", "in-demand skills", "future-proof", "get ahead", "hustle culture", "keep your brain young", "stave off", "cognitive decline"];
const IDEAS = ["science", "history", "psychology", "philosophy", "the story of", "how it", "explained", "deep dive", "decoder", "fascinating", "the truth about", "documentary", "language", "space", "the brain", "culture", "art history", "big idea", "curious", "the history of", "why we"];

const LENS = [
  { key: "science", label: "Science & nature", icon: "Telescope", cw: "sky", kws: ["science", "nature", "space", "the brain", "climate", "physics", "biology", "animal", "ocean", "universe"], line: "The world is stranger and more wonderful than it lets on. Go and be amazed." },
  { key: "history", label: "History & people", icon: "Landmark", cw: "gold", kws: ["history", "the story of", "biography", "the history of", "century", "ancient", "war", "empire"], line: "Everyone who ever lived thought their time was the normal one. Go and meet them." },
  { key: "mind", label: "The mind", icon: "Brain", cw: "plum", kws: ["psychology", "the psychology of", "why we", "behaviour", "behavior", "the mind", "emotion", "memory"], line: "Why you do the things you do — half the fun is recognising yourself in it." },
  { key: "arts", label: "Arts & culture", icon: "Palette", cw: "crimson", kws: ["art", "music", "film", "book", "language", "culture", "design", "architecture", "poetry", "theatre"], line: "The things people make, and why they matter. No degree required — just taste and time." },
  { key: "surprise", label: "Surprise me", icon: "Shuffle", cw: "sage", kws: [], line: "The anti-algorithm. Something you'd never have gone looking for — that's the whole joy of it." },
];


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,HEALTH,DENY,IDEAS,LENS};
})();
export const Delight = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");

const HEALTH = ["cycle", "hormone", "period", "menstrual", "estrogen", "ovulation", "luteal", "follicular", "menopause", "fertility", "pregnan", "postpartum", "symptom"];
const FUN = ["tv show", "tv series", "television", "new show", "best show", "watch this", "to watch", "film", "movie", "netflix", "streaming", "reality tv", "sitcom", "comedy", "funny", "hilarious", "laugh", "humour", "humor", "game", "puzzle", "quiz", "board game", "playlist", "new music", "album", "concert", "pop culture", "celebrity", "gossip", "red-carpet", "binge", "drama series", "must-see", "feel-good", "joy of", "fun "];
const EXCLUDE = ["science", "the history of", "philosophy", "psychology", "the mind", "relationship", "marriage", "dating", "friendship", "estrange", "biography", "politics", " war ", "climate", "the brain", "decoder ring", "mating in captivity", "how democracy"];
// guilty-pleasure / productive-relaxation / FOMO / status / food-diet-edge
const DENY = ["guilty pleasure", "guilt-free", "guilt free", "no shame", "productive rest", "productive relaxation", "must-watch", "must watch", "you need to watch", "don't miss", "before everyone else", "binge the entire", "everything you need to watch", "complete guide to", "you have to see", "cheat day", "you've earned", "you have earned", "earned it", "skinny", "calorie", "kcal", "everyone's obsessed"];

const FANCY = [
  { key: "watch", label: "To watch", icon: "Tv", cw: "crimson", kws: ["tv", "television", "show", "film", "movie", "netflix", "streaming", "reality", "sitcom", "series", "watch", "drama"], line: "Sit down, switch off. No must-see list, no keeping up — just what takes your fancy tonight." },
  { key: "laugh", label: "A laugh", icon: "Laugh", cw: "gold", kws: ["comedy", "funny", "hilarious", "laugh", "humour", "humor", "comic", "sitcom"], line: "The best kind of medicine, and the only kind with no side effects. Go on, have a proper laugh." },
  { key: "pop", label: "Pop culture & gossip", icon: "Star", cw: "plum", kws: ["celebrity", "gossip", "pop culture", "interview", "red carpet", "star", "reality"], line: "The good kind of gossip — delighting in other people's lives, no cruelty required. It's practically a love language." },
  { key: "music", label: "Music", icon: "Music", cw: "sage", kws: ["music", "playlist", "album", "song", "concert", "dance"], line: "Turn it up. A song can change a whole evening — no reason needed beyond it feeling good." },
  { key: "surprise", label: "Surprise me", icon: "Shuffle", cw: "sky", kws: [], line: "Can't decide? Neither could I. Here's something — the joy is in not choosing." },
];


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,HEALTH,FUN,EXCLUDE,DENY,FANCY};
})();
export const Nest = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");

// keep OTHER domains' content out (this pool is polluted with fitness/fashion/music/diet)
const NOT = ["workout", "kettlebell", "dumbbell", "strength program", "cardio", "yoga", "pilates", "fitness", "blazer", "wardrobe", "outfit", "denim", "jeans", "skirt", "taylor swift", "album", "celebrity", "cycle", "hormone", "menopause"];
// the FOOD → DIET-CULTURE firewall (the sharpest edge). Comfort food is JOY, never a ledger.
const DIET = ["calorie", "kcal", "clean eating", "clean-eating", "weight loss", "lose weight", "healthy swap", "guilt-free", "guilt free", "low-cal", "low-calorie", "portion", "cheat meal", "cheat day", "macro", "detox", "eat this not that", "skinny", "slimming", "slim down", "flat tummy", "belly fat", "fat-burning", "burn fat", "diet plan", "shed", "glp-1", "glp1", "fasting", "superfood", "insulin", "gut health", "gut doctor", "probiotic", "protein", "fibermaxx", "food noise", "blue zone"];
const HOME_KW = ["cosy", "cozy", "hygge", "home decor", "interior", "homemaking", "slow living", "candle", "nesting", "make your home", "reading nook", "houseplant", "living room", "your space", "the home", "homeware", "sanctuary", "at home"];
const FOOD_KW = ["comfort food", "baking", "bake ", "home cooking", "home-cooked", "recipe", "one-pot", "one pound meals", "soup", "stew", "roast", "sunday lunch", "cocktail", "warming", "hearty", "in the kitchen with"];

// THE SPINE — editorial cosy rituals. Free/cheap, renter-friendly, never a chore or a "buy".
// Cosiness is a lamp and a blanket, not a Pinterest board or a budget.
const RITUALS = [
  "The lamp instead of the big light. Instantly kinder to the whole room.",
  "The good blanket out of the cupboard — the one you're 'saving'. Save it for tonight.",
  "A pot of something on the stove, just for the smell. It doesn't have to be dinner.",
  "Proper thick socks. The whole mood shifts, honestly.",
  "Tidy one surface — not the house, one surface — and let that be enough.",
  "Light a candle at 4pm, when the daylight goes flat.",
  "Make the bed properly once, so tonight you get into a made bed.",
  "A hot drink in your nicest mug, sat down, not carried around half-finished.",
  "Draw the curtains before dark and shut the day out.",
  "Move one chair to face the window.",
  "Put on the album that makes the place feel like yours.",
  "A hot water bottle — even in summer, even if it's just for your feet.",
  "One sprig of something green in a glass. That absolutely counts as flowers.",
  "Warm the room before you need it, so coming home feels like an arrival.",
  "Fairy lights are not only for Christmas. Say it with me.",
  "The soft playlist, low, while you potter about.",
  "Change the pillowcase — the small luxury of a fresh one against your face.",
  "Phone in another room for one hour. Let the room go quiet.",
  "The dressing gown at 6pm. No apology, no notes.",
  "Heat up soup and call it plenty. It is plenty.",
  "Rearrange one shelf so it pleases you every time you pass it.",
  "Ten minutes in the comfiest seat doing absolutely nothing useful.",
];


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,NOT,DIET,HOME_KW,FOOD_KW,RITUALS};
})();
export const Tonight = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");

// keep cycle-health + philosophy + optimisation pollution out of the calm shelf
const NOT = ["cycle", "estrogen", "oestrogen", "menstrual", "follicular", "luteal", "ovulation", "hormone", "menopause", "perimenopause", "productive", "productivity", "workout", "fitness", "calorie", "weight loss", "space and time", "attracted to a person", "vinted", "being lived", "democracy"];
const DENY = ["optimi", "sleep score", "sleep debt", "biohack", "5am club", "5 am club", "perfect night's sleep", "perfect sleep", "sleep hack", "hack your sleep", "wrecking your", "ruining your sleep", "you're sleeping wrong", "revenge bedtime", "grind", "hustle", "track your sleep", "sleep tracker"];
const CALM = ["meditation", "mindful", "breath", "body scan", "yoga nidra", "restorative", "soothing", "yoga", "calm", "relax", "sleep meditation", "gentle", "unwind", "lullab"];

// THE SPINE — evening-specific wind-down rituals. Gentle, low-demand, permission-based. Includes
// explicit lines for the not-sleeping (a baby, a hot flush, a racing mind) — never smug.
const RITUALS = [
  "Big light off, lamps on — tell your body the day is closing.",
  "Phone on charge across the room, out of arm's reach.",
  "A warm shower about an hour before bed; it's the cool-down after that makes you sleepy.",
  "Write tomorrow's worries on paper and shut them in a drawer till morning.",
  "Ten slow breaths, the out-breath longer than the in. That's the whole practice.",
  "Socks and the good blanket — being warm is half of falling asleep.",
  "One chapter, on paper if you have it, screen dimmed if you don't.",
  "Let the house stay a bit messy tonight. It'll keep.",
  "Dim everything for the last hour — your eyes tell your brain it's night.",
  "The to-do list is closed. Nothing productive past this point, by order.",
  "Say one kind thing about how you got through today.",
  "A body scan from your toes up — you rarely make it as far as your head.",
  "Whatever you didn't finish today is allowed to be unfinished.",
  "Some quiet music or a soft voice, low, on a timer.",
  "Tomorrow-you will handle tomorrow. Tonight-you only has to rest.",
  "Crack the window — a cool room sleeps better than a warm one.",
  "If sleep won't come, rest still counts. Lying warm and quiet is not nothing.",
  "Not sleeping tonight — a baby, a hot flush, a racing mind? You're not failing at this. Be as gentle with yourself as you'd be with a friend.",
  "Unclench your jaw, drop your shoulders. You've been holding the whole day in your body.",
  "Put tomorrow's clothes out, then stop planning and let the evening be yours.",
];


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,NOT,DENY,CALM,RITUALS};
})();
export const Becoming = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");

const NOT = ["cycle", "estrogen", "oestrogen", "menstrual", "follicular", "luteal", "ovulation", "hormone", "menopause", "perimenopause", "pcos", "endometriosis", "fertility", "pregnan", "postpartum", "workout", "kettlebell", "calorie", "glp-1", "recipe", "skincare", "wardrobe"];
// DENY tightened so it can't false-positive on the exact content this board exists for:
// "optimize your"/"self-optimi" (NOT bare "optimi" → kept "optimism"); "manifest it/your/ing"
// + "law of attraction" (NOT bare "manifest" → kept "manifesto").
const DENY = ["level up", "grind ", "hustle", "optimize your", "optimise your", "self-optimi", "optimize you", "10x your", "high performer", "become the best version", "best version of yourself", "upgrade yourself", "biohack", "5am club", "girlboss", "crush your goals", "manifest it", "manifest your", "manifesting", "law of attraction", "good vibes only", "positive vibes only", "raise your vibration", "the universe will provide", "fix yourself", "you are broken", "become who you're meant", "behind on life", "married by", "on track for", "falling behind", "everything happens for a reason", "just think positive"];
const SELF = ["identity", "who am i", "who you are", "self-discovery", "sense of self", "reinvention", "self-trust", "self-compassion", "self-acceptance", "authentic", "purpose", "values", "confidence", "self-worth", "self-esteem", "growth", "boundaries", "self-belief", "midlife", "reinvent", "finding yourself", "who i am", "self-knowledge", "personal growth", "self-doubt", "imposter", "imperfection", "enough"];

const LENS = [
  { key: "trust", label: "Self-trust", icon: "HeartHandshake", cw: "plum", kws: ["self-trust", "self-compassion", "self-acceptance", "self-worth", "self-esteem", "self-belief", "self-doubt", "confidence", "imperfection", "enough as you"], line: "The quiet sense that you can be trusted with your own life. It grows the more you listen to it — not the more you fix." },
  { key: "who", label: "Who you are", icon: "Fingerprint", cw: "sky", kws: ["identity", "who am i", "who you are", "sense of self", "authentic", "self-knowledge", "who i am", "self-discovery"], line: "Not who you were told to be — who you actually are, under all that. Worth getting to know slowly." },
  { key: "purpose", label: "Purpose & values", icon: "Compass", cw: "gold", kws: ["purpose", "values", "meaning", "what matters", "calling", "why"], line: "What matters to you, honestly — not what's supposed to. Your compass, never anyone else's map." },
  { key: "new", label: "New chapters", icon: "Sprout", cw: "sage", kws: ["reinvention", "reinvent", "midlife", "starting over", "new chapter", "second act", "transition", "change"], line: "Starting again, at any age, isn't being behind. There's no timeline here — only your own unfolding." },
  { key: "boundaries", label: "Boundaries", icon: "Shield", cw: "crimson", kws: ["boundaries", "boundary", "saying no", "people-pleas", "over-giving"], line: "The kind 'no' that protects your yes. Where you end and other people begin — and that you're allowed one." },
];

// THE DAILY HOOK — an honest question, never a task. Open, gentle, self-trust-oriented.
const QUESTIONS = [
  "What would you do here, if you trusted yourself?",
  "Whose voice is that, really — is it even yours?",
  "What are you quietly pretending not to know?",
  "What did you love, before someone told you it was pointless?",
  "Where are you shrinking to keep someone else comfortable?",
  "What would 'enough' actually feel like — not look like, feel like?",
  "Who were you, before the world told you who to be?",
  "What are you outgrowing?",
  "What would you say to a friend in exactly your situation?",
  "What's the kind, true thing you'd never let yourself say to you?",
  "What are you allowed to change your mind about?",
  "If no one would ever know, what would you choose?",
];


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,NOT,DENY,SELF,LENS,QUESTIONS};
})();
export const Make = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};

// THE SPINE — Mx Storyteller's "make something" prompts. Permission-not-performance: badly is
// allowed, finishing optional, no one's watching, a biro and an envelope is enough.
const MAKES = [
  "Make something badly, on purpose. The wonk is the whole charm.",
  "Doodle in the margin of whatever's nearest. It doesn't have to become anything.",
  "Start something you have no intention of finishing. Stopping is allowed.",
  "Sing the wrong words, loudly, to whatever's on in the kitchen.",
  "Draw your cup of tea. Yes, badly. Especially badly.",
  "Scribble one shape over and over until your hand goes quiet.",
  "Squash a bit of leftover dough into a small, useless creature. Bin it after. That's fine.",
  "Write three sentences that go nowhere. Nobody's reading over your shoulder.",
  "Colour something in. Outside the lines, if you fancy it.",
  "Tear up an old magazine and glue the bits back down wrong.",
  "Make up a silly little tune and hum it once. It can leave forever after.",
  "Draw the view from your window with your eyes half on the page.",
  "Fold a bit of paper into something. It needn't be a swan. It needn't be anything.",
  "Mend a small thing with visible, wonky stitches. Let the repair show.",
  "Build a tiny tower out of whatever's on the table. Knock it down. Build it again.",
  "Write a note to no one. You don't have to keep it.",
  "Fill a page edge to edge with pattern — dots, loops, whatever your biro wants.",
  "Rearrange a shelf just for the pleasure of moving things about.",
  "Draw the same little flower five times and let each one be worse.",
  "Make a collage from the recycling. A cereal box is a perfectly good material.",
  "Hum along to something and get all the notes wrong. Gloriously wrong.",
  "Press a leaf, a petal, a receipt into a book and forget about it.",
  "Sketch someone's hands, or your own. Beginners welcome, forever.",
  "Make a small mess with colour and leave it unfinished on purpose.",
];


return {dayOffset,rotateDaily,MAKES};
})();
export const Outside = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");

// exclude "nature of X" philosophy + fitness + fashion + health-clinical pollution
const NOT = ["nature of", "true nature", "human nature", "second nature", "our nature", "workout", "kettlebell", "6-6-6", "romper", "cycle", "estrogen", "oestrogen", "menstrual", "hormone", "menopause", "calorie", "glp-1", "wardrobe", "outfit"];
const NATURE = ["outdoors", "the outdoors", "outside", "forest", "woodland", "hike", "hiking", "garden", "gardening", "allotment", "wild swim", "coast", "coastal", "fresh air", "birdsong", "green space", "national park", "being in nature", "time in nature", "walk outside", "the woods", "balcony garden", "houseplant", "grow your own", "wildflower", "getting outdoors", "the natural world"];

// THE SPINE — access-first "get outside" prompts. No gear, no car, no garden required.
// A window and a minute count. (Written to hold for a city flat with ten spare minutes.)
const PROMPTS = [
  "Open a window and just listen for a minute. That's a start.",
  "Find the nearest tree and actually look at it — really look.",
  "A park bench counts as being in nature. So does a doorstep.",
  "Five minutes of fresh air, no destination. That's the whole thing.",
  "Notice the sky once today — its colour, its weather, whatever it's up to.",
  "Walk the long way round the block, just because.",
  "A single pot on a windowsill is a garden. Start there.",
  "Watch the birds for as long as they'll let you.",
  "Take your morning drink out to the step instead of the sink.",
  "Pick up a leaf, a stone, a conker — bring a bit of the outside in.",
  "Stand in the rain for thirty seconds on purpose. It washes something off.",
  "Look for the first green thing pushing up through a crack in the pavement.",
  "Find the moon tonight — it's out there whether you look or not.",
  "A windowsill herb: mint, basil, something you'll brush past and smell.",
  "Sit with your back against a tree. Old trick, still works.",
  "Notice what season it actually is by the trees, not the calendar.",
  "There's weather happening right now. Go and be in it for a minute.",
  "A balcony, a step, a shared yard, a scrap of verge — all of it counts.",
  "Eat one thing today by an open window, or outside if you can.",
  "No garden, no time, no green in sight? A patch of sky is still yours.",
];


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,NOT,NATURE,PROMPTS};
})();
export const Money = (() => {
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || ""));

const NOT = ["marketing budget", "cycle-sync", "follicular", "decoder ring", "tina turner", "glp-1", "peptide", "workout"];
const MONEY = ["money worries", "money mindset", "budgeting", "saving money", "savings", "pension", "cost of living", "personal finance", "financial wellbeing", "frugal", "money diary", "spending", "paycheck to paycheck", "money and mental", "household bills", "money anxiety", "financial cost of being a woman", "financial behavior", "financial behaviour"];

// gentle money-RITUALS (daily, no save). Shame-free, no "should save more", no hustle, no advice.
const RITUALS = [
  "Open the banking app, look, and close it. No action needed — just look without flinching.",
  "Move a fiver into savings, or don't. Either way, notice you got to choose.",
  "Cancel one thing you don't use. Or keep it. The point is you decided, calmly.",
  "Write one money worry down, then shut the notebook. It'll keep till you're ready.",
  "Notice one lovely thing today that money couldn't buy.",
  "A no-spend hour — not a no-spend life. Just an hour of not buying a thing.",
  "Say the number out loud, the one you avoid. It's usually smaller than the dread around it.",
  "Thank past-you for anything she put by, however small.",
  "Name one kind thing you'll spend on this week without a scrap of guilt.",
  "Check one bill you've been avoiding. Just the one. Then stop for today.",
  "Money is emotional, not only mathematical. Be as gentle with yourself here as anywhere.",
  "Unfollow one account that quietly makes you feel poor. Your feed, your call.",
  "A pound saved isn't a moral win, a pound spent isn't a sin. Loosen the grip a little.",
  "Look at what you value, not only what you owe. Money's meant to serve a life, not rule one.",
  "Ask for the discount, the payment plan, the help. It's not embarrassing — it's sensible.",
  "Let 'enough for now' be a real answer. Not everything needs optimising.",
  "If money feels frightening right now, that's real, and you're not the only one. One small thing. Be kind.",
  "Round up one thing you're genuinely glad you could afford this week.",
];

// gentle money-INTENTIONS — the pick-and-keep list. Kept ones save as Goal(domain:"Money").
const INTENTIONS = [
  "Build a tiny buffer — a little, whenever I can. A cushion, not a fortune.",
  "Open the banking app without dread.",
  "Do one kind money thing for myself this month.",
  "Know roughly where it goes — gently, no spreadsheet, no judgement.",
  "Forgive myself one past money mistake.",
  "Look at money without it looking back at me like a threat.",
];


return {dayOffset,rotateDaily,txtOf,hasAny,isFiction,NOT,MONEY,RITUALS,INTENTIONS};
})();
