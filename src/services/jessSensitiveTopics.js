// jessSensitiveTopics — Jess crisis protocol (7-category model)
//
// Upgraded from the original 3-tier urgent/distress/grief model to a
// full 7-category UK-women's-health crisis protocol. Each category has
// its own response shape — some suppress the AI entirely, some shift
// tone only, some prepend a grounding exercise, some show a referral
// card alongside Jess's reply.
//
// Precedence (highest → lowest):
//   urgent_crisis > self_harm > eating_disorder > domestic_abuse
//   > severe_anxiety > grief > distress > (null)
//
// All keyword matching is substring-based against a space-padded
// lowercased copy of the user's text, so phrases work even when
// embedded in longer sentences. Order matters for precedence; once a
// category matches we return.
//
// Public API:
//   CRISIS_CATEGORIES                       constant enum
//   classifySensitiveTopic(text)            → category string | null
//   getCrisisConfig(category)               → { suppressAI, tone, referralCard, groundingFirst, modeDirective }
//   modeDirectiveFor(category)              → string (back-compat shim used by JessDemoPanel)
//   classifyJessInput(text)                 → { category, matchedWords } (back-compat shim)
//   URGENCY_REFERRAL, DISTRESS_REFERRAL     constants kept for back-compat with any older callers

export const CRISIS_CATEGORIES = {
  URGENT_CRISIS:   "urgent_crisis",
  SELF_HARM:       "self_harm",
  EATING_DISORDER: "eating_disorder",
  DOMESTIC_ABUSE:  "domestic_abuse",
  SEVERE_ANXIETY:  "severe_anxiety",
  GRIEF:           "grief",
  DISTRESS:        "distress",
};

// Order is precedence — first match wins.
const CATEGORY_ORDER = [
  CRISIS_CATEGORIES.URGENT_CRISIS,
  CRISIS_CATEGORIES.SELF_HARM,
  CRISIS_CATEGORIES.EATING_DISORDER,
  CRISIS_CATEGORIES.DOMESTIC_ABUSE,
  CRISIS_CATEGORIES.SEVERE_ANXIETY,
  CRISIS_CATEGORIES.GRIEF,
  CRISIS_CATEGORIES.DISTRESS,
];

// ─── Keywords per category ──────────────────────────────────────────
// Phrases are matched as substrings (case-insensitive). Keep them
// short and specific — partial matches are intentional ("I cut" will
// hit self_harm, "kill myself" will hit urgent_crisis).
const KEYWORDS = {
  [CRISIS_CATEGORIES.URGENT_CRISIS]: [
    // Suicidal ideation
    "want to die", "wanna die", "end it all", "end my life",
    "kill myself", "killing myself", "ending it",
    "don't want to be here anymore", "dont want to be here anymore",
    "don't want to live", "dont want to live",
    "not worth living", "no reason to live",
    "take my own life", "taking my own life",
    "suicide", "suicidal",
    // Active self-harm INTENT (vs. past/ongoing in self_harm below)
    "going to hurt myself", "gonna hurt myself",
    "going to cut myself", "gonna cut myself",
    // Acute medical emergency cues that share urgency
    "chest pain", "can't breathe", "cant breathe",
    "bleeding heavily", "vomiting blood", "blood in vomit",
    "passing out", "loss of consciousness",
  ],
  [CRISIS_CATEGORIES.SELF_HARM]: [
    // Past / ongoing self-harm — NOT immediate intent
    "i cut", "i've cut", "ive cut", "been cutting",
    "i hurt myself", "hurting myself", "been hurting myself",
    "self harm", "self-harm", "selfharm",
    "self injury", "self-injury",
    // Urges (no active plan)
    "urge to hurt myself", "urge to cut",
    "want to cut", "want to hurt myself",
  ],
  [CRISIS_CATEGORIES.EATING_DISORDER]: [
    // Restricting
    "haven't eaten in", "havent eaten in",
    "not allowed to eat", "won't let myself eat", "wont let myself eat",
    "punishing myself with food", "punishing myself by not eating",
    "only eating", "only allowed",
    "skipping meals", "skip meals",
    // Purging
    "made myself sick", "make myself sick", "making myself sick",
    "threw up after eating", "throw up after eating", "throwing up after",
    "purging", "purge after",
    // Diagnosis / identity
    "i have anorexia", "i'm anorexic", "im anorexic", "anorexia",
    "i have bulimia", "i'm bulimic", "im bulimic", "bulimia",
    "binge eating", "binge and purge",
    "arfid", "orthorexia",
    // Calorie language
    "only eating 500", "only eating 600", "only eating 700",
    "only eating 800", "only eating 900",
    "200 calories", "300 calories", "400 calories", "500 calories",
  ],
  [CRISIS_CATEGORIES.DOMESTIC_ABUSE]: [
    // Partner control / coercive control
    "he won't let me", "he wont let me",
    "she won't let me", "she wont let me",
    "he controls", "she controls",
    "he controls me", "she controls me",
    "controlling partner", "controlling boyfriend", "controlling husband",
    "scared of my partner", "scared of my husband", "scared of my boyfriend",
    "afraid of my partner", "afraid of my husband",
    "walking on eggshells",
    // Disclosure
    "he hits me", "she hits me",
    "he hurts me", "she hurts me",
    "i'm being abused", "im being abused", "being abused",
    "domestic abuse", "domestic violence",
    "he threatens", "she threatens",
    "he threatens me", "she threatens me",
    // Isolation
    "not allowed to see my friends", "not allowed to see my family",
    "won't let me see", "wont let me see",
    "isolated from",
  ],
  [CRISIS_CATEGORIES.SEVERE_ANXIETY]: [
    // Panic attack in progress
    "panic attack", "panic attacks",
    "having a panic attack", "im panicking", "i'm panicking",
    "i think i'm dying", "i think im dying",
    "my heart is racing", "heart is racing",
    "hyperventilating",
    // Severe anxiety
    "i can't cope", "i cant cope", "cant cope", "can't cope",
    "constant panic", "constant anxiety",
    "can't leave the house", "cant leave the house",
    "can't stop shaking", "cant stop shaking",
  ],
  [CRISIS_CATEGORIES.GRIEF]: [
    "miscarriage", "miscarried",
    "lost my baby", "lost the baby",
    "stillbirth", "still birth", "stillborn",
    "lost my", "loss of",
    "passed away", "she passed", "he passed",
    "bereaved", "bereavement",
    "grief", "grieving",
    "devastated",
  ],
  [CRISIS_CATEGORIES.DISTRESS]: [
    "depressed", "depression",
    "anxious", "anxiety",
    "overwhelmed", "overwhelming",
    "crying all the time",
    "don't want to", "dont want to",
    "hopeless",
    "really struggling", "struggling so much",
  ],
};

// ─── Referral cards ─────────────────────────────────────────────────
export const CRISIS_REFERRAL_CARDS = {
  [CRISIS_CATEGORIES.URGENT_CRISIS]: {
    title: "You're not alone",
    lines: [
      "Samaritans: 116 123 (free, 24/7)",
      "A&E or call 999 if in immediate danger",
      "GP: book an urgent same-day appointment",
    ],
  },
  [CRISIS_CATEGORIES.SELF_HARM]: {
    title: "You're not alone",
    lines: [
      "Samaritans: 116 123 (free, 24/7)",
      "Shout text line: text SHOUT to 85258",
      "Your GP can help — book an urgent appointment",
    ],
  },
  [CRISIS_CATEGORIES.EATING_DISORDER]: {
    title: "Support is here",
    lines: [
      "Beat Helpline: 0808 801 0677 (Mon–Fri 9am–8pm)",
      "Beat online chat: beateatingdisorders.org.uk",
      "Your GP can refer you to specialist support",
    ],
  },
  [CRISIS_CATEGORIES.DOMESTIC_ABUSE]: {
    title: "You're safe here",
    lines: [
      "National Domestic Abuse Helpline: 0808 2000 247 (free, 24/7)",
      "Text 'HELLO' to 85258 if you can't call",
      "If in immediate danger: 999",
    ],
  },
  [CRISIS_CATEGORIES.SEVERE_ANXIETY]: null, // grounding-first, no card
  [CRISIS_CATEGORIES.GRIEF]: null,          // tone-only, no card
  [CRISIS_CATEGORIES.DISTRESS]: {
    title: "You're not alone",
    lines: [
      "Mind: mind.org.uk",
      "Mind Infoline: 0300 123 3393",
    ],
  },
};

// 5-4-3-2-1 grounding script — prepended to Jess's reply when
// SEVERE_ANXIETY is detected. Static so it can't drift.
export const GROUNDING_5_4_3_2_1 =
  "Try the 5-4-3-2-1 grounding exercise with me. Look around and name: " +
  "5 things you can see, 4 things you can touch, 3 things you can hear, " +
  "2 things you can smell, 1 thing you can taste. Slow breath in for 4, " +
  "out for 6.";

// ─── Per-category response config ───────────────────────────────────
// suppressAI:    skip the agent call entirely, just show the card
// tone:          which Jess voice mode to use
//                ("crisis" | "self_harm_support" | "ed_aware" |
//                 "abuse_aware" | "grounding" | "grief" | "distress" | null)
// referralCard:  card to render below the reply (or instead of it)
// groundingFirst:prepend the grounding script to Jess's reply
// modeDirective: extra system-prompt lines to bias Jess for this turn
const CONFIGS = {
  [CRISIS_CATEGORIES.URGENT_CRISIS]: {
    suppressAI: true,
    tone: "crisis",
    referralCard: CRISIS_REFERRAL_CARDS[CRISIS_CATEGORIES.URGENT_CRISIS],
    groundingFirst: false,
    modeDirective:
      "[MODE: URGENT CRISIS]\n" +
      "Do not respond with a normal reply. The chat shell will render the " +
      "emergency referral card. Output the crisis hard-stop line only.",
  },
  [CRISIS_CATEGORIES.SELF_HARM]: {
    suppressAI: false,
    tone: "self_harm_support",
    referralCard: CRISIS_REFERRAL_CARDS[CRISIS_CATEGORIES.SELF_HARM],
    groundingFirst: false,
    modeDirective:
      "[MODE: SELF-HARM SUPPORT]\n" +
      "The user has disclosed past or current self-harm (not active suicidal intent). " +
      "Open with compassion, e.g. 'That takes courage to share.' " +
      "Do NOT ask for details about methods or wounds. Do NOT minimise. " +
      "Do not say 'you shouldn't' or 'try not to'. " +
      "One short paragraph of warm acknowledgement and one gentle next step. " +
      "A referral card with Samaritans, Shout, and GP will appear separately — do not duplicate it.",
  },
  [CRISIS_CATEGORIES.EATING_DISORDER]: {
    suppressAI: false,
    tone: "ed_aware",
    referralCard: CRISIS_REFERRAL_CARDS[CRISIS_CATEGORIES.EATING_DISORDER],
    groundingFirst: false,
    modeDirective:
      "[MODE: EATING DISORDER AWARE]\n" +
      "The user has disclosed restricting / purging / an eating-disorder identity. " +
      "Be non-judgmental. Acknowledge what they shared without reinforcing it. " +
      "Do NOT comment on weight, body shape, calories, or 'healthy eating' rules. " +
      "Do NOT congratulate restriction. Do NOT suggest specific foods. " +
      "One short paragraph of warmth and one gentle pointer to professional support. " +
      "A referral card with Beat will appear separately — do not duplicate it.",
  },
  [CRISIS_CATEGORIES.DOMESTIC_ABUSE]: {
    suppressAI: false,
    tone: "abuse_aware",
    referralCard: CRISIS_REFERRAL_CARDS[CRISIS_CATEGORIES.DOMESTIC_ABUSE],
    groundingFirst: false,
    modeDirective:
      "[MODE: DOMESTIC ABUSE AWARE]\n" +
      "The user has disclosed possible coercive control, abuse, or fear of a partner. " +
      "Open with: 'You're safe here.' Keep it calm, non-alarmist, and brief. " +
      "Do NOT ask probing questions about the partner or specific incidents. " +
      "Do NOT suggest confronting, leaving, or staying — that's the user's choice. " +
      "Do NOT say 'have you tried…'. " +
      "One short paragraph acknowledging what they shared, plus one note that the " +
      "referral card below has confidential helplines that won't appear in their browser history.",
  },
  [CRISIS_CATEGORIES.SEVERE_ANXIETY]: {
    suppressAI: false,
    tone: "grounding",
    referralCard: null,
    groundingFirst: true,
    modeDirective:
      "[MODE: SEVERE ANXIETY / PANIC]\n" +
      "The user is in or near a panic attack, or is reporting severe anxiety. " +
      "A grounding script (5-4-3-2-1) will be prepended to your reply by the chat shell — " +
      "do not repeat the grounding instructions in your reply. " +
      "After the grounding script, add one short warm paragraph acknowledging what they're " +
      "feeling and gently noting that their GP can help if this keeps happening. " +
      "Do NOT use clinical labels like 'anxiety disorder' or 'panic disorder'. " +
      "Do NOT minimise.",
  },
  [CRISIS_CATEGORIES.GRIEF]: {
    suppressAI: false,
    tone: "grief",
    referralCard: null,
    groundingFirst: false,
    modeDirective:
      "[MODE: GRIEF / LOSS]\n" +
      "The user has mentioned grief, loss, or bereavement. " +
      "Respond with extra warmth. Do NOT offer tips, advice, or solutions " +
      "unless they explicitly ask. Listen, acknowledge, sit with them. " +
      "One short paragraph. Use their words back to them where possible.",
  },
  [CRISIS_CATEGORIES.DISTRESS]: {
    suppressAI: false,
    tone: "distress",
    referralCard: CRISIS_REFERRAL_CARDS[CRISIS_CATEGORIES.DISTRESS],
    groundingFirst: false,
    modeDirective:
      "[MODE: MENTAL HEALTH SUPPORT]\n" +
      "The user is expressing distress. Validate first. Do not minimise. " +
      "Do not diagnose. One short paragraph of warm acknowledgement. " +
      "A separate referral card is shown to the user automatically; do not " +
      "duplicate it in your reply.",
  },
};

// ─── Matcher ────────────────────────────────────────────────────────
function lc(s) { return String(s || "").toLowerCase(); }

function findMatches(text, words) {
  const lower = " " + lc(text) + " ";
  return words.filter((w) => lower.includes(" " + w + " ") || lower.includes(w));
}

// ─── Public API ─────────────────────────────────────────────────────
// Highest-precedence category or null. Iterates CATEGORY_ORDER so
// urgent_crisis wins over self_harm wins over … wins over distress.
export function classifySensitiveTopic(text) {
  if (!text) return null;
  for (const cat of CATEGORY_ORDER) {
    const words = KEYWORDS[cat];
    if (!words || !words.length) continue;
    if (findMatches(text, words).length) return cat;
  }
  return null;
}

// Config object for a category — null in / null out so the chat shell
// can branch on truthiness.
export function getCrisisConfig(category) {
  if (!category) return null;
  return CONFIGS[category] || null;
}

// Back-compat — same return shape as the original classifier. Still
// used by JessDemoPanel until the new API is fully threaded through.
// Maps the new categories to the legacy "urgent" | "distress" | "grief"
// where appropriate; new categories pass through with their own string.
export function classifyJessInput(text) {
  const cat = classifySensitiveTopic(text);
  if (!cat) return { category: "normal", matchedWords: [] };
  // Compute matched words from whichever category fired (helpful for
  // debug breadcrumbs in JessDemoPanel).
  const matched = findMatches(text, KEYWORDS[cat] || []);
  return { category: cat, matchedWords: matched };
}

// Back-compat — JessDemoPanel still calls modeDirectiveFor() to get a
// system-prompt line. Now reads from the per-category config.
export function modeDirectiveFor(category) {
  const cfg = getCrisisConfig(category);
  return cfg?.modeDirective || "";
}

// ─── Legacy referral constants — kept for back-compat ─────────────
// Any older code that imported these directly will still work; the
// new chat shell prefers `CRISIS_REFERRAL_CARDS[category]`.
export const URGENCY_REFERRAL = {
  title: CRISIS_REFERRAL_CARDS[CRISIS_CATEGORIES.URGENT_CRISIS].title,
  body:
    "Samaritans 116 123 (free, 24/7) · A&E or 999 if in immediate danger · " +
    "GP for an urgent same-day appointment.",
};
export const DISTRESS_REFERRAL = {
  title: CRISIS_REFERRAL_CARDS[CRISIS_CATEGORIES.DISTRESS].title,
  body: "Mind (mind.org.uk) · Mind Infoline 0300 123 3393.",
};
