// Sprint C C2 — Centralised GDPR consent helpers. Single source of truth
// for the 6 consent flags FemWell stores on UserProfile. All consent
// readers default to `false` so a missing/unmigrated profile is treated
// as "no consent given" rather than implicit yes.

export const CONSENT_FIELDS = [
  {
    key: "consent_health_data",
    label: "Health data",
    description: "Allow FemWell to store your symptoms, medications, and conditions.",
  },
  {
    key: "consent_cycle_data",
    label: "Cycle data",
    description: "Allow FemWell to store your period dates and cycle tracking.",
  },
  {
    key: "consent_mood_data",
    label: "Mood & energy",
    description: "Allow FemWell to store your daily mood and energy logs.",
  },
  {
    key: "consent_location_data",
    label: "Location data",
    description: "Not collected today — reserved for future location-aware features.",
  },
  {
    key: "consent_ai_processing",
    label: "AI insights (Jess & Astra)",
    description: "Allow Jess and Astra to read your data so they can write personalised insights.",
  },
  {
    key: "consent_marketing",
    label: "Marketing & newsletter",
    description: "Receive occasional product updates and FemWell newsletters.",
  },
];

export function hasConsent(profile, key) {
  if (!profile) return false;
  // Default-deny: undefined / null / missing all count as "no consent".
  return profile[key] === true;
}

export function hasAiConsent(profile) {
  return hasConsent(profile, "consent_ai_processing");
}

export function emptyConsentRow() {
  return CONSENT_FIELDS.reduce((acc, f) => {
    acc[f.key] = false;
    return acc;
  }, {});
}
