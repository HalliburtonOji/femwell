// communityConfig — production Community constants (M1).
//
// Content (rooms, masthead, comment copy, UK resources, footer) is reused from the
// approved Demo 6 source (communityShared.js). The PRODUCTION-only bits live here:
// the daily QOTD rotation, the k-anon presence buckets (never a count small enough
// to identify), the reaction lexicon, and the shared crisis check.

import { crisisCheck as journalCrisisCheck } from "@/components/journal/echo/echoScrub";
import {
  MASTHEAD, ROOMS, ECHO_REACTIONS, COMMENT_DISCLAIMER, COMMENT_KINDNESS, COMMENT_MAX,
  COMMENT_EMPTY, MOD_REMOVED, UK_RESOURCES, FOOTER_LINE,
} from "@/pages/communityShared";

export {
  MASTHEAD, ROOMS, ECHO_REACTIONS, COMMENT_DISCLAIMER, COMMENT_KINDNESS, COMMENT_MAX,
  COMMENT_EMPTY, MOD_REMOVED, UK_RESOURCES, FOOTER_LINE,
};

export const REACTIONS = ECHO_REACTIONS;       // held / me too / hear you / saved
export const POST_MAX = 800;
export const PRESENCE_WINDOW_HRS = 12;         // "active" = posted/answered in the last N hrs

// M4 async voice-notes — DORMANT until an STT provider key exists. Capture/store/UI are
// fully built; this flag keeps them out of the live app. Flip to true ONLY together with
// the server `TRANSCRIPTION_ENABLED` env + an STT key — otherwise nothing is ever
// delivered (postVoiceNote holds every note). See MORNING_LIST_FOR_HALLI.md.
export const VOICE_NOTES_ENABLED = false;

// The room the Lounge maps to + the daily rooms shown as doors (Demo 6 order).
export const ROOM_KEYS = ROOMS.map((r) => r.key);

// ── Question of the Day — a static whole-life rotation (no prompt entity needed) ─
export const QOTD_PROMPTS = [
  { key: "q1",  text: "What small thing lifted you today?" },
  { key: "q2",  text: "What did you say no to this week — and how did it feel?" },
  { key: "q3",  text: "Who made you feel seen lately?" },
  { key: "q4",  text: "What's one thing you're quietly proud of right now?" },
  { key: "q5",  text: "What would make tomorrow 5% kinder to yourself?" },
  { key: "q6",  text: "What are you looking forward to, however small?" },
  { key: "q7",  text: "When did you last laugh properly? At what?" },
  { key: "q8",  text: "What's taking up space in your head today?" },
  { key: "q9",  text: "What does 'enough' look like for you this week?" },
  { key: "q10", text: "What's one kind thing you'd tell a friend in your shoes?" },
];

// Deterministic prompt for a given local day (rotates daily, same for everyone).
export function qotdForDay(dateISO) {
  const day = dateISO || new Date().toISOString().split("T")[0];
  const epoch = Math.floor(new Date(day + "T00:00:00Z").getTime() / 86400000);
  const i = ((epoch % QOTD_PROMPTS.length) + QOTD_PROMPTS.length) % QOTD_PROMPTS.length;
  return { day, ...QOTD_PROMPTS[i] };
}

// ── k-anon presence — bucketed, never an identifying count ───────────────────
// We NEVER show an exact small number. 0 = quiet · 1-4 = "a few" · 5+ = "several".
// v2: warmer + gently time-aware (evening = "tonight", otherwise "today"). Still purely
// bucketed — the wording never narrows to an identifying number.
export function presenceLine(activeCount, now) {
  const n = Number(activeCount) || 0;
  const hr = (now instanceof Date ? now : new Date()).getHours();
  const evening = hr >= 18 || hr < 5;
  const when = evening ? "tonight" : "today";
  if (n <= 0) return evening
    ? "It's quiet here tonight — a good time to leave the first word for whoever comes next."
    : "It's quiet here right now — a good time to leave the first word.";
  if (n < 5) return `A few women are around ${when} — you're not the only one here.`;
  if (n < 15) return `Several women are here ${when}. You're in good company.`;
  return `The rooms are full of women ${when} — plenty of company, no names, no count.`;
}

// Re-export the proven Journal crisis check so Community matches it exactly.
export const crisisCheck = journalCrisisCheck;
