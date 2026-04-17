// Normalized ContentItems category enum + mapping helpers.

export const CONTENT_CATEGORIES = [
  "nutrition",
  "movement",
  "mindfulness",
  "cycle_education",
  "mental_health",
  "sleep",
  "relationships",
  "hormones",
  "self_care",
  "other",
];

const CATEGORY_LABELS = {
  nutrition: "Nutrition",
  movement: "Movement",
  mindfulness: "Mindfulness",
  cycle_education: "Cycle education",
  mental_health: "Mental health",
  sleep: "Sleep",
  relationships: "Relationships",
  hormones: "Hormones",
  self_care: "Self-care",
  other: "Other",
};

// Maps legacy/free-form category strings → normalized slug.
// Returns null if no confident match (caller should default to "other" and log).
export function mapLegacyCategory(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase().trim();

  if (/(nutrition|food|meal|recipe|eat|diet)/.test(s)) return "nutrition";
  if (/(movement|exercise|fitness|workout|yoga|pilates|stretch|mobility)/.test(s)) return "movement";
  if (/(mindful|meditat|breathwork|breath|calm|grounding)/.test(s)) return "mindfulness";
  if (/(cycle|period|menstru|ovulat|phase)/.test(s)) return "cycle_education";
  if (/(mental|anxiety|depress|therapy|emotion|panic)/.test(s)) return "mental_health";
  if (/(sleep|insomnia|rest)/.test(s)) return "sleep";
  if (/(relation|partner|intimacy|dating|love)/.test(s)) return "relationships";
  if (/(hormon|pcos|endo|thyroid|menopause)/.test(s)) return "hormones";
  if (/(self[-_\s]?care|skin|hair|beauty|spa)/.test(s)) return "self_care";

  return null;
}

export function categoryLabel(slug) {
  return CATEGORY_LABELS[slug] || slug;
}