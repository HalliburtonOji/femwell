// Controlled vocabulary for symptom logging.
// Slug → display label. Keep slugs stable — UI translates for display.

export const SYMPTOM_VOCAB = [
  "cramps",
  "headache",
  "bloating",
  "nausea",
  "fatigue",
  "back_pain",
  "breast_tenderness",
  "mood_swings",
  "anxiety",
  "acne",
  "discharge",
  "spotting",
  "hot_flashes",
  "night_sweats",
  "insomnia",
];

const LABELS = {
  cramps: "Cramps",
  headache: "Headache",
  bloating: "Bloating",
  nausea: "Nausea",
  fatigue: "Fatigue",
  back_pain: "Back pain",
  breast_tenderness: "Breast tenderness",
  mood_swings: "Mood swings",
  anxiety: "Anxiety",
  acne: "Acne",
  discharge: "Discharge",
  spotting: "Spotting",
  hot_flashes: "Hot flashes",
  night_sweats: "Night sweats",
  insomnia: "Insomnia",
};

export function symptomLabel(slug) {
  return LABELS[slug] || slug;
}

export function isValidSymptom(slug) {
  return SYMPTOM_VOCAB.includes(slug);
}