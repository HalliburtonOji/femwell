// echoConfig — constants, lexicons and UK crisis resources for the Echo Wall.
//
// Echo Wall is the first social-tier surface (Phase 3). Everything here is the
// tunable safety + brand surface for it, kept in one place so the rails are
// auditable. No emoji anywhere (Lucide only in the UI). UK market.

// ── lifetime + pacing ────────────────────────────────────────────────────────
export const FADE_HOURS = 48;                 // an echo fades 48h after it goes live
export const COOL_MINUTES_BASE = 10;          // cooling pause before an echo goes live
export const COOL_MINUTES_LATE_LUTEAL = 30;   // longer pause in late luteal (d22+)
export const NIGHT_START_HOUR = 22;           // 22:00 local
export const NIGHT_END_HOUR = 6;              // 06:00 local
export const LATE_LUTEAL_DAY = 22;            // cycle day from which "late luteal" applies

// ── limits ───────────────────────────────────────────────────────────────────
export const MAX_ECHO_LEN = 180;              // a single line
export const DAILY_ECHO_LIMIT = 5;            // master plan: 5 echoes/day
export const REPORT_AUTOHIDE_THRESHOLD = 2;   // reports needed to auto-hide an echo

// ── feed weighting (soft phase-sister boost, never a hard filter) ────────────
export const PHASE_MATCH_BOOST = 600;         // score points added when echo.phase === viewer phase
export const LIFE_STAGE_BOOST = 150;          // smaller boost for same life stage
export const RECENCY_HALFLIFE_MIN = 360;      // recency score halves every 6h

// ── the reaction lexicon (master plan: same · hold · hear you · saved) ────────
// Emotional, not transactional; no free text. "same"/"hold" reuse the original
// metoo_count/held_count fields (no data loss on existing echoes); "hearyou" and
// "saved" use two additive Echo fields (see base44/entities/Echo.jsonc).
export const REACTIONS = [
  { id: "same",    label: "Same",     field: "metoo_count"   },
  { id: "hold",    label: "Hold",     field: "held_count"    },
  { id: "hearyou", label: "Hear you", field: "hearyou_count" },
  { id: "saved",   label: "Saved",    field: "saved_count"   },
];

// ── phase cohort copy ────────────────────────────────────────────────────────
export const PHASE_COHORT = {
  menstrual:  "women in their inner winter",
  follicular: "women in their inner spring",
  ovulatory:  "women in their inner summer",
  luteal:     "women in their inner autumn",
  unknown:    "sisters across the cycle",
};

// ── UK crisis resources (shown by the crisis intercept; never posted) ────────
// Long-established UK helplines. Surfaced when a draft reads as crisis, instead
// of letting it become a public echo. Numbers verified against the spec's
// NHS / Samaritans / Mind requirement.
export const CRISIS_RESOURCES = [
  { name: "Samaritans", detail: "Call 116 123 — free, any time, day or night.", tel: "116123" },
  { name: "NHS 111",    detail: "Call 111 and choose the mental health option.", tel: "111" },
  { name: "Shout",      detail: "Text SHOUT to 85258 for free, 24/7 text support.", sms: "85258" },
  { name: "Mind",       detail: "Call 0300 123 3393 (Mon-Fri, 9am-6pm).", tel: "03001233393" },
];

// ── crisis lexicon (keyword + light context; on-device only) ─────────────────
// Deliberately broad: a false positive only routes a sister to support instead
// of the wall, which is the safe direction to fail.
export const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i,
  /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
  /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i,
  /\bnothing\s+to\s+live\s+for\b/i,
  /\bhe\s+(hits|beats|hurts)\s+me\b/i,
  /\bnot\s+safe\s+(at home|here|with him|with her)\b/i,
];
