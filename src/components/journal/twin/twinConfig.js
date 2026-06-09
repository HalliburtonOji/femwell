// twinConfig — constants + the 12 daily prompts for Phase Twin (Q4).
//
// Two women in the same cycle phase are paired for 12 days. Each day a single
// shared prompt; you answer; your twin's answer stays blurred until you write
// yours. Day 12 archives the pairing. Anonymous, hashes-only, no handles, no
// free chat — one prompt, one answer each, mutual. Whole-life prompts (per the
// FemWell correction: life, not just the cycle). UK, no emoji.

// ── gate ─────────────────────────────────────────────────────────────────────
// OFF until the TwinPair/TwinEntry entities + joinTwin/postTwinEntry/getTwinDay
// functions are deployed AND probe-verified (200) by Halli. With this false the
// Phase Twin entry point does not appear and nothing calls the (absent) functions.
export const TWIN_ENABLED = true;

// ── shape ────────────────────────────────────────────────────────────────────
export const TWIN_DAYS = 12;            // a pairing runs 12 days
export const MAX_ANSWER_CHARS = 800;    // soft cap on a daily answer
export const ABANDON_HOURS = 72;        // a pending (unpaired) request lapses after this

// ── the 12 shared prompts (whole-life, gentle, one per day) ──────────────────
export const PROMPTS = [
  { key: "d1",  text: "What made today feel like itself — one small, specific thing." },
  { key: "d2",  text: "Where did your energy actually go today, versus where you meant it to go?" },
  { key: "d3",  text: "Name something your body asked for today. Did you give it?" },
  { key: "d4",  text: "Who or what was easy to be around today — and who wasn't?" },
  { key: "d5",  text: "What did you say yes to that you wanted to say no to (or the reverse)?" },
  { key: "d6",  text: "A thing you're quietly proud of this week, however small." },
  { key: "d7",  text: "What would make tomorrow 5% kinder to yourself?" },
  { key: "d8",  text: "Something you're looking forward to, and something you're avoiding." },
  { key: "d9",  text: "When did you feel most like yourself today?" },
  { key: "d10", text: "What's taking up space in your head that you haven't said out loud?" },
  { key: "d11", text: "What do you want more of, and less of, after this stretch?" },
  { key: "d12", text: "Twelve days on — what's one thing you'd tell the you from day one?" },
];

export function promptForDay(day) {
  const i = Math.max(1, Math.min(TWIN_DAYS, Number(day) || 1)) - 1;
  return PROMPTS[i] || PROMPTS[0];
}

// ── phase cohort copy (reused tone from Echo/Witness) ────────────────────────
export const PHASE_COHORT = {
  menstrual:  "a twin in her inner winter",
  follicular: "a twin in her inner spring",
  ovulatory:  "a twin in her inner summer",
  luteal:     "a twin in her inner autumn",
  unknown:    "a twin across the cycle",
};
