// jessSensitiveTopics — Jess v2 J2-3
//
// Lightweight client-side classifier for the user's chat message
// BEFORE it reaches the agent. Three categories:
//
//   • urgent    — medical emergency language. Short-circuits the agent
//                 call entirely; the chat surfaces an urgent referral
//                 card (GP / 111 / A&E).
//   • distress  — mental-health distress. Agent call proceeds in a
//                 gentler mode; after the reply, a mind.org.uk
//                 referral card is appended.
//   • grief     — loss / bereavement language. Agent call proceeds
//                 in a "compassionate listening" mode with no tips
//                 unless asked.
//   • normal    — everything else; existing behaviour unchanged.
//
// Order matters: urgency wins, then distress, then grief.

const KEYWORDS = {
  urgent: [
    "bleeding heavily", "severe pain", "chest pain", "can't breathe",
    "cant breathe", "emergency", "passing out", "fainting", "loss of consciousness",
    "blood in vomit", "vomiting blood",
  ],
  distress: [
    "can't cope", "cant cope", "really struggling", "depressed", "anxious",
    "panic attack", "panic attacks", "overwhelmed", "crying all the time",
    "don't want to", "dont want to", "self harm", "hopeless",
  ],
  grief: [
    "miscarriage", "miscarried", "grief", "devastated", "lost my baby",
    "stillbirth", "still birth", "loss of", "lost my", "passed away",
    "bereaved", "bereavement",
  ],
};

function lc(s) { return String(s || "").toLowerCase(); }

function findMatches(text, words) {
  const lower = " " + lc(text) + " ";
  return words.filter((w) => lower.includes(" " + w + " ") || lower.includes(w));
}

// Returns { category, matchedWords }. category is "urgent" | "distress" |
// "grief" | "normal".
//
// Precedence (QA Fix 2 — 2026-05-24):
//   urgent > grief > distress > normal
//
// Grief is now checked BEFORE distress so messages like "I had a
// miscarriage and I'm depressed about it" route into compassionate
// listening mode (no referral card) rather than the distress branch
// (which appends a mind.org.uk card). Grief is a more specific
// emotional context than the generic distress keywords and should win
// when both are present.
export function classifyJessInput(text) {
  if (!text) return { category: "normal", matchedWords: [] };
  const urgent = findMatches(text, KEYWORDS.urgent);
  if (urgent.length) return { category: "urgent", matchedWords: urgent };
  const grief = findMatches(text, KEYWORDS.grief);
  if (grief.length) return { category: "grief", matchedWords: grief };
  const distress = findMatches(text, KEYWORDS.distress);
  if (distress.length) return { category: "distress", matchedWords: distress };
  return { category: "normal", matchedWords: [] };
}

// Returns extra system-prompt lines to append based on the category.
// `grief` and `distress` shift Jess's voice; `urgent` is handled by the
// chat shell (short-circuit) so we never call the agent.
export function modeDirectiveFor(category) {
  if (category === "grief") {
    return (
      "[MODE: GRIEF / LOSS]\n" +
      "The user has mentioned grief, loss, or bereavement. " +
      "Respond with extra warmth. Do NOT offer tips, advice, or solutions " +
      "unless they explicitly ask. Listen, acknowledge, sit with them. " +
      "One short paragraph. Use their words back to them where possible."
    );
  }
  if (category === "distress") {
    return (
      "[MODE: MENTAL HEALTH SUPPORT]\n" +
      "The user is expressing distress. Validate first. Do not minimise. " +
      "Do not diagnose. One short paragraph of warm acknowledgement. " +
      "A separate referral card is shown to the user automatically; do not " +
      "duplicate it in your reply."
    );
  }
  return "";
}

// UK referral copy. Centralised here so the chat shell + the urgency
// short-circuit both render identical text.
export const URGENCY_REFERRAL = {
  title: "This sounds urgent",
  body:
    "Please contact your GP, call 111, or go to A&E if it's an emergency. " +
    "Jess is a wellness companion — she can't help with medical emergencies.",
};

export const DISTRESS_REFERRAL = {
  title: "It might help to talk to someone",
  body:
    "Your GP can refer you to talking therapy. Mind has free resources at mind.org.uk. " +
    "Samaritans are available 24/7 on 116 123 — free from any phone.",
};
