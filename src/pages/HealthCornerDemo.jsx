// ─────────────────────────────────────────────────────────────────────────────
// HealthCornerDemo — tabbed Health Corner hub on /Ideas (FoundersOS).
//
// v4.1 (2026-05-28) — Conversational layout removed and replaced by a new
// Letter layout (paper-on-surface effect, drop caps, botanical dividers,
// dateline, sign-off). The remaining four layouts (Magazine · Card Grid ·
// Timeline · Dashboard) get distinctive backgrounds and inline SVG visual
// assets — grain hero, section numbers, sparklines, animated pulse dots,
// circular cycle progress, ruled journal lines, dot grid, status dots.
//
// Single FemWell brand palette throughout (cream, espresso, blush, sage,
// gold, muted). What changes per theme is the visual structure plus its
// signature asset — not the palette.
//
// All v3 content preserved: hormone curve, cervical mucus table, life
// stage detail, hormonal acne mechanisms, oestrogen + brain neurobiology,
// estrobolome, blood-test guidance, HRT conversation script. Sticky phase
// context bar, news strip, and expert quote per tab still present (each
// re-skinned by the active layout).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, useContext, useRef, useCallback, createContext } from "react";
import { Link } from "react-router-dom";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles, FileText, ChevronRight, ChevronDown, ExternalLink, Stethoscope, Quote } from "lucide-react";

// ─── BRAND PALETTE — single source of truth ─────────────────────────
const T = {
  cream:      "#F4EDDB",
  paper:      "#FBF6E6",
  jessBg:     "#EDE5CC",
  espresso:   "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:      "#9B8B7A",
  mutedSoft:  "#B5A998",
  border:     "#D4C9B4",
  gold:       "#D4AF37",
  goldSoft:   "rgba(212,175,55,0.16)",
  sage:       "#8FAF8F",
  sageBg:     "rgba(143,175,143,0.18)",
  blush:      "#E8B4B8",
  blushBg:    "rgba(232,180,184,0.22)",
  blushLight: "#F0CACA",
  blushDeep:  "#D4909A",
};

// ─── LAYOUT THEMES ──────────────────────────────────────────────────
const LAYOUTS = [
  { id: "magazine",  icon: "📰", label: "Magazine" },
  { id: "card-grid", icon: "▦",  label: "Card Grid" },
  { id: "timeline",  icon: "◎",  label: "Timeline" },
  { id: "dashboard", icon: "⊞",  label: "Dashboard" },
  { id: "letter",    icon: "📜", label: "Letter" },
];
const DEFAULT_LAYOUT = "card-grid";

// Magazine + Letter layouts force every section open (no collapse).
const FORCE_OPEN_LAYOUTS = new Set(["magazine", "letter"]);

// ─── PER-LAYOUT BACKGROUNDS ─────────────────────────────────────────
// SVG-as-data-URL backgrounds (no external files). Each background is
// quiet and palette-faithful so it reads as texture, not decoration.
const LAYOUT_BG = {
  magazine:  "#FDFCFA",
  "card-grid": `radial-gradient(rgba(155,139,122,0.18) 1px, transparent 1px) #F4EDDB`,
  timeline:  `repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(155,139,122,0.14) 31px, rgba(155,139,122,0.14) 32px) #FAF7F2`,
  dashboard: "#F0EDE6",
  letter:    "#F5EDD8",
};
const LAYOUT_BG_SIZE = {
  "card-grid": "18px 18px",
};

// ─── SECTION COLOR MAP (Card Grid accent bands) ─────────────────────
const SECTION_COLORS = {
  // Cycle
  "hormone-curve":           "#D4AF37",  // gold
  "fertility-signs":         "#8FAF8F",  // sage
  "cycle-health-indicators": "#E8B4B8",  // blush
  "luteal-phase-defect":     "#E8B4B8",  // blush
  "phase-food-movement":     "#D4AF37",  // gold
  // Skin & Hair
  "how-hormones-skin":       "#D4AF37",
  "hormonal-acne":           "#E8B4B8",
  "phase-skincare":          "#8FAF8F",
  "hair-science":            "#D4AF37",
  "acne-tracker":            "#E8B4B8",
  "supplements":             "#8FAF8F",
  // Body
  "symptom-intro":           "#8FAF8F",
  "ranked-symptoms":         "#D4AF37",
  "symptom-calendar":        "#E8B4B8",
  "hot-flash-physiology":    "#E8B4B8",
  "pcos":                    "#D4AF37",
  "endometriosis":           "#E8B4B8",
  "pmdd":                    "#E8B4B8",
  // Mind
  "oestrogen-brain":         "#D4AF37",
  "cognition-by-phase":      "#8FAF8F",
  "hpa-hpg":                 "#E8B4B8",
  "mood-energy-30":          "#D4AF37",
  "sleep-14":                "#8FAF8F",
  "sleep-cycle":             "#8FAF8F",
  "pmdd-neurosteroid":       "#E8B4B8",
  "stress-stage":            "#D4AF37",
  "nervous-system":          "#8FAF8F",
  "brain-fog":               "#D4AF37",
  // Nourishment
  "phase-nutrition":         "#8FAF8F",
  "estrobolome":             "#D4AF37",
  "seed-cycling":            "#8FAF8F",
  "blood-sugar":             "#E8B4B8",
  "edcs":                    "#D4AF37",
  // Care
  "blood-tests":             "#8FAF8F",
  "hormonal-panel":          "#D4AF37",
  "range-vs-optimal":        "#8FAF8F",
  "hrt-conversation":        "#D4AF37",
  "supplement-stacking":     "#8FAF8F",
  "gp-prep":                 "#D4AF37",
  "meds-adherence":          "#8FAF8F",
  "to-discuss":              "#E8B4B8",
};
const SECTION_ICON = {
  "hormone-curve":           "🌀",
  "fertility-signs":         "🌱",
  "cycle-health-indicators": "🩺",
  "luteal-phase-defect":     "🌙",
  "phase-food-movement":     "🍽",
  "how-hormones-skin":       "✨",
  "hormonal-acne":           "🪞",
  "phase-skincare":          "🧴",
  "hair-science":            "🪮",
  "acne-tracker":            "📊",
  "supplements":             "💊",
  "symptom-intro":           "📓",
  "ranked-symptoms":         "📈",
  "symptom-calendar":        "🗓",
  "hot-flash-physiology":    "🔥",
  "pcos":                    "⚖",
  "endometriosis":           "🌹",
  "pmdd":                    "🌧",
  "oestrogen-brain":         "🧠",
  "cognition-by-phase":      "📖",
  "hpa-hpg":                 "⚡",
  "mood-energy-30":          "🌤",
  "sleep-14":                "🌙",
  "sleep-cycle":             "💤",
  "pmdd-neurosteroid":       "🧬",
  "stress-stage":            "🌿",
  "nervous-system":          "🌊",
  "brain-fog":               "☁",
  "phase-nutrition":         "🥗",
  "estrobolome":             "🌾",
  "seed-cycling":            "🌻",
  "blood-sugar":             "🍯",
  "edcs":                    "🧪",
  "blood-tests":             "🩸",
  "hormonal-panel":          "📋",
  "range-vs-optimal":        "📐",
  "hrt-conversation":        "💬",
  "supplement-stacking":     "💊",
  "gp-prep":                 "📝",
  "meds-adherence":          "💊",
  "to-discuss":              "🗒",
};
const SECTION_BADGE = {
  "hormone-curve":     "EVIDENCE-BASED",
  "fertility-signs":   "TRACKED",
  "hormonal-acne":     "EXPERT",
  "hair-science":      "EVIDENCE-BASED",
  "oestrogen-brain":   "EXPERT",
  "estrobolome":       "EVIDENCE-BASED",
  "blood-tests":       "EXPERT",
  "hrt-conversation":  "EXPERT",
  "pmdd-neurosteroid": "EVIDENCE-BASED",
  "endometriosis":     "EXPERT",
};

// ─── KEY FACTS — one per section (Letter layout shows always-visible) ──
const KEY_FACTS = {
  // Cycle
  "hormone-curve":           "Oestrogen peaks at ovulation, driving your best energy and mood — progesterone dominates the second half.",
  "fertility-signs":         "Egg-white cervical mucus = peak fertility. BBT rise confirms ovulation happened, but can't predict it.",
  "cycle-health-indicators": "Healthy: 21–35 day cycle, 3–7 days bleed, 12–16 day luteal. Bleed-through every hour or 3-month absence are red flags.",
  "luteal-phase-defect":     "Day 21 progesterone should be above 30 nmol/L. Below 10 days luteal may explain short cycles or trouble conceiving.",
  "phase-food-movement":     "Your fuel and movement needs shift with each phase — eat for what your hormones are doing right now.",
  // Skin & Hair
  "how-hormones-skin":       "Oestrogen stimulates fibroblasts — the cells that make collagen. Post-menopause: 30% collagen loss in 5 years.",
  "hormonal-acne":           "Jaw/chin breakouts peak 7–10 days before your period. Salicylic acid penetrates pores because it's lipid-soluble.",
  "phase-skincare":          "Follicular = actives window. Luteal = barrier focus, no new actives. Match the active to the phase.",
  "hair-science":            "Ferritin under 70 µg/L causes hair loss even when GP says 'normal'. Ask for ferritin by name, not just full blood count.",
  "acne-tracker":            "3+ logged breakouts a month is a pattern, not noise — worth a phase-synced protocol.",
  "supplements":             "Zinc, omega-3 EPA and vitamin C have real evidence. Biotin only helps if you're deficient.",
  // Body
  "symptom-intro":           "Where in your cycle a symptom shows up tells you its likely cause — perimenstrual, mid-cycle, or constant.",
  "ranked-symptoms":         "Patterns over 2–3 cycles are the most diagnostic thing you can show a GP.",
  "symptom-calendar":        "Visual 30-day load makes hormonal clusters obvious — and easier to explain in a 10-minute appointment.",
  "hot-flash-physiology":    "Hot flashes happen because oestrogen's thermal zone narrows — tiny temperature shifts now trigger full cooling.",
  "pcos":                    "PCOS affects 1 in 10 women. Insulin resistance is the driver in most cases — not just the ovaries.",
  "endometriosis":           "Endo takes 7–9 years to diagnose. Pain outside your period window is the biggest red flag, not severity alone.",
  "pmdd":                    "PMDD isn't bad PMS — it's an abnormal brain sensitivity to normal progesterone. Luteal-only SSRIs are first-line.",
  // Mind
  "oestrogen-brain":         "Oestrogen receptors are throughout your hippocampus, prefrontal cortex and amygdala — mood and memory are biology.",
  "cognition-by-phase":      "Verbal memory peaks follicular. Spatial reasoning peaks ovulatory. Detail focus peaks early luteal.",
  "hpa-hpg":                 "Chronic stress directly suppresses the hormones that drive ovulation. Cortisol and progesterone share precursors.",
  "mood-energy-30":          "30 days is the minimum window where hormonal patterns become visible above day-to-day noise.",
  "sleep-14":                "Less than 7h sleep three nights in a row measurably lowers mood and increases cortisol the next day.",
  "sleep-cycle":             "Progesterone is sedative via GABA. Late-luteal sleep disruption is hormonal, not behavioural.",
  "pmdd-neurosteroid":       "Allopregnanolone is normally calming — in PMDD it's paradoxically dysregulating. SSRIs reset the system.",
  "stress-stage":            "Many women are prescribed antidepressants when HRT would be more appropriate. Know which lever fits.",
  "nervous-system":          "Physiological sighs and cold exposure activate the vagus nerve faster than any other technique.",
  "brain-fog":               "Brain fog tracks sleep quality more than anything else — treat sleep first, then look at oestrogen.",
  // Nourishment
  "phase-nutrition":         "Follicular = cruciferous + zinc. Luteal = protein + magnesium + B6. Same body, different needs.",
  "estrobolome":             "Gut bacteria recirculate up to 30% of your oestrogen. 30+ plant foods a week is the strongest lever.",
  "seed-cycling":            "If it works, give it 3 months. Flax + pumpkin in follicular, sunflower + sesame in luteal.",
  "blood-sugar":             "Progesterone reduces insulin sensitivity. Protein before carbs cuts post-meal glucose by up to 30%.",
  "edcs":                    "Plastic-free hot food storage and unscented products are the two highest-leverage EDC swaps.",
  // Care
  "blood-tests":             "Ferritin, vitamin D, B12 and full thyroid panel aren't included by default. Ask by name.",
  "hormonal-panel":          "Day 2–3 + day 21 progesterone for cycling. Day 2–3 FSH for perimenopause. Timing matters.",
  "range-vs-optimal":        "'Reference range' is what 95% of tested people have, not what's optimal. The two are very different.",
  "hrt-conversation":        "Transdermal oestrogen + micronised progesterone is body-identical. The 2002 WHI was a different drug, different cohort.",
  "supplement-stacking":     "Iron + calcium block each other. Vitamin D needs K2 and magnesium to work. Sequence matters as much as substance.",
  "gp-prep":                 "10-minute appointments respond best to one primary concern, written symptoms, and tracked data.",
  "meds-adherence":          "Adherence patterns are clinical data. Bring the chart, not the impression.",
  "to-discuss":              "Three items max. Flagged from your own logs is more powerful than a vague 'something's off'.",
};
function firstSentenceFromBody(body) {
  // Fallback keyFact derivation when the section id isn't in KEY_FACTS.
  // The body is JSX, so we keep this minimal — caller passes the section title.
  return null;
}

// ─── LETTER CONTEXT — progressive disclosure across registered sections ──
const LetterContext = createContext(null);

// ─── PHASE DOT COLOR MAP (Timeline) ─────────────────────────────────
const PHASE_DOT_COLOR = {
  follicular: "#8FAF8F",  // sage
  ovulatory:  "#D4AF37",  // gold
  luteal:     "#E8B4B8",  // blush
  menstrual:  "#9B8B7A",  // muted
};

// ─── Tab + semantic constants ────────────────────────────────────────
const HC_TABS = [
  { id: "overview",    label: "Overview" },
  { id: "cycle",       label: "Cycle" },
  { id: "life-stage",  label: "Life Stage" },
  { id: "skin-hair",   label: "Skin & Hair" },
  { id: "body",        label: "Body" },
  { id: "mind",        label: "Mind" },
  { id: "nourishment", label: "Nourishment" },
  { id: "care",        label: "Care" },
];

const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);
const CYCLING_STAGES = new Set(["reproductive", "ttc", "pre-ttc", "teen"]);

const PHASE_LABEL  = { follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal", menstrual: "Menstrual" };
const PHASE_EMOJI  = { follicular: "🌱", ovulatory: "☀️", luteal: "🌙", menstrual: "🩸" };
const PHASE_COLOUR = { follicular: T.sage, ovulatory: T.gold, luteal: T.blush, menstrual: T.muted };
const MOOD_EMOJI = ["😔", "😐", "🙂", "😊", "✨"];

const LIFE_STAGE_LABEL = {
  teen: "Teen", reproductive: "Reproductive", "pre-ttc": "Pre-conception",
  ttc: "Trying to conceive",
  "pregnant-t1": "Pregnant · T1", "pregnant-t2": "Pregnant · T2",
  "pregnant-t3": "Pregnant · T3", pregnancy: "Pregnant",
  postpartum: "Postpartum",
  perimenopause: "Perimenopause", menopause: "Menopause", "post-menopause": "Post-menopause",
};
const LIFE_STAGE_KEYS = [
  "teen", "reproductive", "pre-ttc", "ttc",
  "pregnant-t1", "pregnant-t2", "pregnant-t3",
  "postpartum", "perimenopause", "menopause", "post-menopause",
];

// Phase-smart default open section per tab.
const DEFAULT_OPEN = {
  cycle: {
    menstrual:  "cycle-health-indicators",
    follicular: "fertility-signs",
    ovulatory:  "fertility-signs",
    luteal:     "luteal-phase-defect",
  },
  "skin-hair": {
    menstrual:  "phase-skincare", follicular: "phase-skincare",
    ovulatory:  "hormonal-acne",  luteal:     "hormonal-acne",
  },
  mind: {
    menstrual:  "nervous-system",
    follicular: "cognition-by-phase", ovulatory: "cognition-by-phase",
    luteal:     "pmdd-neurosteroid",
  },
  nourishment: {
    menstrual:  "phase-nutrition", follicular: "phase-nutrition",
    ovulatory:  "estrobolome",     luteal:     "blood-sugar",
  },
  body: {
    menstrual:  "symptom-intro", follicular: "symptom-intro", ovulatory: "symptom-intro",
    luteal:     "hot-flash-physiology",
  },
  care: {
    menstrual:  "blood-tests", follicular: "blood-tests",
    ovulatory:  "gp-prep",     luteal:     "supplement-stacking",
  },
};

// ─── Content (v3, preserved verbatim) ────────────────────────────────
const PHASE_CONTENT = {
  follicular: { summary: "Days 6–13 typically. Oestrogen rises; energy returns.", food: "Your body is rebuilding. Iron-rich foods (lentils, spinach, lean meat) replenish what was lost during menstruation — pair with vitamin C to triple absorption. Fermented foods support gut health and oestrogen metabolism. Light proteins and complex carbs give sustained energy.", movement: "Rising energy makes this a great time for strength training, new fitness challenges, and HIIT. Your body recovers faster and tolerates higher intensity well." },
  ovulatory:  { summary: "Days 12–16 typically. Oestrogen peaks, brief LH surge.", food: "Raw or lightly cooked vegetables support liver function during the oestrogen surge. Zinc-rich foods (pumpkin seeds, chickpeas) support egg quality and progesterone production. Stay hydrated.", movement: "Peak performance window. Competitive sports, high-intensity cardio, team activities. Pain tolerance is higher and reaction time is at its monthly best." },
  luteal:     { summary: "Days 17–28 typically. Progesterone dominates.", food: "Magnesium (dark chocolate, avocado, almonds) reduces PMS and improves sleep. Complex carbohydrates stabilise blood sugar. Reduce caffeine and alcohol. B6 (salmon, banana, potato) is evidence-supported for PMS.", movement: "Moderate intensity — yoga, pilates, swimming, walking. Avoid overtraining; cortisol is more reactive. If strength training, lower reps with longer recovery." },
  menstrual:  { summary: "Days 1–5 typically. Oestrogen and progesterone bottom out.", food: "Prioritise iron (red meat, tofu, dark leafy greens) and vitamin C for absorption. Omega-3s (oily fish, flaxseed) reduce prostaglandin production and ease cramping. Warm soups and broths. Avoid alcohol.", movement: "Gentle movement — restorative yoga, slow walks, light stretching. Drop intensity 20–30% and listen on day 1–2." },
};

const HORMONE_CURVE = [
  { range: "Days 1–5 · Menstruation",      text: "Oestrogen and progesterone are at their lowest. FSH starts rising to begin recruiting follicles. You may feel more inward, fatigued, or emotional — this is hormonal, not weakness." },
  { range: "Days 6–13 · Follicular phase", text: "Oestrogen rises steadily as your dominant follicle grows. This is when most women feel sharpest, most energetic, most socially confident. Oestrogen stimulates dopamine, serotonin, and verbal memory centres. Skin often looks best now." },
  { range: "Day 14 · Ovulation",            text: "A surge of LH triggers ovulation. Oestrogen peaks, then drops briefly. Testosterone also spikes around ovulation — many women notice heightened libido and assertiveness. BBT rises by 0.2–0.5°C after ovulation." },
  { range: "Days 15–28 · Luteal phase",    text: "Progesterone rises significantly. It's calming, warming, and appetite-increasing. In some women progesterone's metabolite allopregnanolone disrupts GABA receptors, causing anxiety or mood changes. PMS symptoms peak in the final few days." },
];

const CERVICAL_MUCUS_TABLE = [
  { phase: "Menstrual phase",        signal: "Blood present" },
  { phase: "Post-period (days 4–8)", signal: "Dry or minimal — low fertility" },
  { phase: "Pre-ovulatory (9–12)",   signal: "Creamy, white/yellow, lotion-like — some fertility" },
  { phase: "Peak (days 12–14)",      signal: "Clear, stretchy, like raw egg white — peak fertility window" },
  { phase: "Post-ovulation",         signal: "Returns to thick / sticky / absent within 24 hours" },
];

const CYCLE_HEALTHY_BULLETS = [
  "Length: 21–35 days.",
  "Duration: 3–7 days of bleeding.",
  "Flow: 30–80ml total. Soaking more than 1 pad/tampon per hour for several hours is heavy.",
  "Pain: mild cramping manageable with paracetamol or ibuprofen.",
  "PMS: mild symptoms acceptable. PMDD is a recognised condition with treatment options.",
];
const CYCLE_RED_FLAGS = [
  "Periods stopping for 3+ months (not due to pregnancy).",
  "Sudden change in cycle length or flow.",
  "Bleeding between periods or after sex.",
  "Period pain getting progressively worse year-on-year.",
  "Very short luteal phase (under 10 days).",
];

const HORMONES_CONTROL_SKIN = "Oestrogen is arguably your skin's most important hormone. It stimulates fibroblasts — the cells that make collagen — to produce collagen, elastin, and hyaluronic acid. This is why skin in the follicular phase often looks plumper, clearer, and more luminous, and why post-menopausal women lose approximately 30% of skin collagen in the first five years after menopause — that's not ageing in the abstract, it's oestrogen withdrawal. Progesterone in the luteal phase changes your skin's behaviour: sebum production increases, the skin barrier shifts, and for women prone to breakouts, this is the breakout window.";

const HORMONAL_ACNE_CONTENT = [
  { title: "Where it shows up",            body: "Hormonal acne tends to cluster along the jaw, chin, and lower cheeks — the areas with the highest density of androgen-sensitive sebaceous glands. It typically peaks in the 7–10 days before your period." },
  { title: "Why salicylic acid works",     body: "It's lipid-soluble, meaning it can penetrate sebum-filled pores and dissolve the plug from the inside. AHAs work on the surface but can't penetrate the pore as effectively." },
  { title: "Retinoids vs benzoyl peroxide",body: "For hormonal acne, retinoids (retinol, tretinoin) are superior — they regulate cell turnover. Benzoyl peroxide is better for inflammatory/pustular acne." },
  { title: "Niacinamide",                  body: "Reduces sebum production by ~52% in clinical studies at 2% concentration. Also strengthens the barrier and reduces hyperpigmentation post-breakout." },
];

const PHASE_SKIN_PROTOCOL = {
  menstrual:  "Skin is most sensitive now. Stick to gentle cleansing, ceramide-rich moisturiser, and avoid introducing new actives.",
  follicular: "Oestrogen rising = skin's best window. Introduce or resume actives — retinol, AHAs, vitamin C.",
  ovulatory:  "Skin often at its best. Maintain your routine.",
  luteal:     "Progesterone rises, sebum increases. Switch to lighter moisturisers. Use salicylic acid from day 17. Hold off on new actives.",
};

const HAIR_SCIENCE = [
  { title: "Hair grows in cycles",                          body: "Anagen (active growth, 2–7 years — oestrogen extends this phase), catagen (transition), telogen (resting, 3 months, then the hair sheds). At any time, ~85% of your hairs should be in anagen." },
  { title: "Postpartum hair loss",                          body: "During pregnancy, elevated oestrogen keeps most hairs in anagen. Post-birth, oestrogen crashes and a mass cohort of hairs simultaneously enter telogen. Three months later, they all shed. Peaks at 3–4 months postpartum." },
  { title: "Telogen effluvium vs female pattern hair loss", body: "TE = diffuse shed across the scalp, often triggered by an event. Female pattern hair loss = progressive thinning at the crown and parting, DHT-driven follicle miniaturisation." },
  { title: "The DHT mechanism",                              body: "In genetically susceptible follicles, DHT binds to androgen receptors and progressively shortens the anagen phase. Minoxidil extends anagen. Finasteride/dutasteride block 5-alpha-reductase." },
  { title: "The ferritin factor",                            body: "Ferritin is the most commonly missed variable in hair loss. Lab 'normal' can be as low as 12 µg/L, but optimal for hair appears to be 70 µg/L or above." },
];

const SKIN_HAIR_SUPPLEMENTS = [
  { name: "Zinc",                  benefit: "Inhibits 5-α-reductase, regulates sebum.",        note: "Evidence for acne and female pattern hair loss. 25mg/day." },
  { name: "Omega-3 (EPA dominant)",benefit: "Anti-inflammatory on sebaceous glands.",          note: "EPA reduces inflammatory acne and improves scalp blood flow. 2,000mg/day." },
  { name: "Biotin",                benefit: "Only useful if deficient.",                       note: "Supplementing when levels are normal has no evidence for hair growth." },
  { name: "Evening primrose oil",  benefit: "For hormonal skin dryness, eczema.",              note: "GLA converts to anti-inflammatory prostaglandins. 1,000–3,000mg/day." },
  { name: "Vitamin C",             benefit: "Cofactor for collagen synthesis.",                note: "Body cannot make collagen without it. 500–1,000mg/day." },
];

const SYMPTOM_NOTES = {
  hot_flash:  "Hot flashes are the most common perimenopause symptom, affecting 75% of women in the transition. Triggered by a narrowing of the thermoregulatory zone in the hypothalamus caused by oestrogen fluctuation.",
  headache:   "Hormonal headaches typically cluster around menstruation and mid-luteal phase. Magnesium 400mg glycinate has strong evidence for prevention.",
  migraine:   "Menstrual migraine is driven by the drop in oestrogen 2–3 days before bleeding. Frovatriptan or naproxen taken pre-emptively can reduce severity.",
  fatigue:    "Persistent fatigue across a cycle deserves attention — iron, ferritin, B12, vitamin D and thyroid function are the first labs.",
  bloating:   "Bloating typically peaks in the luteal phase due to progesterone-driven water retention.",
  brain_fog:  "Brain fog is driven by oestrogen's role in supporting neurotransmitter function. Sleep quality is the highest-impact factor.",
  cramps:     "Primary dysmenorrhoea is driven by prostaglandins. NSAIDs, heat, and omega-3s are evidence-based interventions.",
  acne:       "Hormonal acne clusters along the jawline and tends to flare in the luteal phase.",
  insomnia:   "Sleep disruption during late luteal phase and around menstruation is often hormonal.",
  anxiety:    "Cyclical anxiety often spikes in the luteal phase as progesterone falls.",
  mood_swings:"Late-luteal mood shifts are common — falling progesterone and serotonin interactions.",
  cravings:   "Luteal cravings are real and hormonally driven. Balancing blood sugar with protein at each meal reduces them.",
};
const fallbackSymptomNote = (sym) => `${prettyName(sym)} is something I'm keeping track of. If it's affecting your daily life, raise it with your GP.`;

const HOT_FLASH_PHYSIOLOGY = "A hot flash isn't random. Oestrogen acts as a thermostat, maintaining a 'thermoregulatory zone' of approximately 0.4°C within which your body doesn't trigger cooling or heating mechanisms. As oestrogen declines in perimenopause and menopause, this zone narrows to near zero — meaning the smallest rise in core body temperature triggers the full heat-dissipation response. This is why hot flashes are worst at night. Reducing external heat triggers helps, as does HRT.";

const PCOS_CONTENT = {
  intro: "PCOS is a complex metabolic and hormonal condition. The Rotterdam criteria require 2 of 3: irregular/absent ovulation, elevated androgens, polycystic ovaries on ultrasound. You can have PCOS without visible cysts.",
  symptoms: [
    "Cycle: irregular, long, or absent periods; anovulatory cycles",
    "Androgen excess: hormonal acne, excess facial/body hair, scalp hair thinning",
    "Metabolic: insulin resistance (even in lean women), acanthosis nigricans",
    "Mood: higher rates of anxiety and depression",
  ],
  driver: "Insulin resistance is the driver in most cases. Managing it through nutrition (low-GI diet, reducing refined carbohydrates) and exercise improves most PCOS symptoms. Inositol (myo-inositol, 2–4g/day) has good evidence for improving insulin sensitivity and restoring ovulation.",
};

const ENDO_CONTENT = {
  intro: "Endometriosis affects 1 in 10 women but takes 7–9 years to diagnose. Endometrial-like tissue grows outside the uterus and bleeds with each cycle, causing inflammation, adhesions, and pain.",
  symptoms: [
    "Painful periods that are severe and/or progressively worsening",
    "Pain outside menstruation — mid-cycle, during sex, with bowel movements",
    "Deep pelvic pain",
    "Fatigue that is severe and cyclic",
    "Bloating (the 'endo belly')",
    "Recurrent UTI symptoms without infection",
    "Difficulty conceiving",
  ],
  diagnosis: "Key distinction from primary dysmenorrhoea: normal period pain is consistent year on year. Endo pain often worsens. Pain outside the period window is the most important red flag. Diagnosis requires laparoscopy.",
};

const PMDD_CONTENT = "PMDD is not 'bad PMS.' It's a severe cyclical condition where women experience significant mood disruption — depression, anxiety, rage, hopelessness — in the luteal phase that remits within days of menstruation. The mechanism involves abnormal brain sensitivity to normal progesterone fluctuations. SSRIs taken only in the luteal phase (day 14 to menstruation) are first-line and highly effective.";

const OESTROGEN_BRAIN = "Oestrogen receptors are found throughout the brain, particularly in the hippocampus (memory), prefrontal cortex (executive function), and amygdala (emotional processing). This is why oestrogen fluctuations affect mood, memory, and cognition — it's literally in your brain tissue.";
const COGNITION_BY_PHASE = [
  { phase: "Follicular · rising oestrogen", body: "Peak verbal fluency, working memory, and verbal memory. Many women feel sharpest now." },
  { phase: "Ovulatory",                     body: "Spatial reasoning and coordination peak (possibly androgen-influenced)." },
  { phase: "Luteal · rising progesterone",  body: "Detail-oriented focus improves; some feel more cautious. Late-luteal: attention and executive function dip." },
  { phase: "Perimenstrual",                  body: "Lowest oestrogen, potential for brain fog and emotional sensitivity." },
];
const HPA_HPG = "Chronic stress is one of the most common causes of cycle disruption. The HPA axis (stress) and the HPG axis (reproductive hormones) share regulatory pathways. CRH, elevated under chronic stress, directly suppresses GnRH, which drives LH pulsatility. Elevated cortisol also suppresses progesterone synthesis directly.";
const SLEEP_CYCLE = "Progesterone has sedative properties — it stimulates GABA-A receptors. In late luteal (5–7 days before your period), the crash in both oestrogen and progesterone disrupts sleep architecture. During perimenopause, night sweats directly fragment sleep. Oestrogen therapy dramatically improves sleep quality for most women.";
const NS_REGULATION = [
  { title: "Physiological sigh",        body: "Double inhale through the nose, then a long slow exhale. Triggers the greatest vagal activation of any breathing pattern. 1–3 reps have measurable effect." },
  { title: "Cold water on face/wrists", body: "Activates the mammalian dive reflex — heart rate slows via vagal activation. Effective for acute anxiety spikes." },
  { title: "Extended exhale breathing", body: "Any ratio where exhale is longer than inhale activates the parasympathetic system. 4:6 is effective and sustainable." },
  { title: "Timing matters",            body: "These techniques have greater effect when used preventively during high-risk luteal days rather than mid-panic." },
];

const PHASE_NUTRITION_WHY = {
  menstrual:  "You're losing iron with blood. Haem iron (red meat, sardines) or non-haem iron (legumes, tofu, spinach) paired with vitamin C to triple absorption. Anti-inflammatory foods reduce prostaglandin-driven cramping.",
  follicular: "Support oestrogen metabolism. Cruciferous vegetables contain DIM which helps the liver process oestrogen via the protective 2-OH pathway. Flaxseeds contain lignans. Zinc-rich foods support progesterone production for the upcoming luteal phase.",
  ovulatory:  "Energy needs slightly higher (BBT rises). Fibre helps the gut excrete used oestrogen rather than recirculating it. Probiotic foods support the estrobolome.",
  luteal:     "Progesterone increases insulin resistance — blood sugar regulation matters. Protein at every meal. Magnesium-rich foods support the nervous system. B6 is a cofactor for serotonin synthesis.",
};

const ESTROBOLOME = "The estrobolome is the collection of gut bacteria that metabolise oestrogen. The liver processes used oestrogen for excretion in the bile. In the gut, beta-glucuronidase — produced by certain bacteria — can deconjugate oestrogen, allowing it to be reabsorbed. High beta-glucuronidase activity means you reabsorb more oestrogen than intended.";
const ESTROBOLOME_DISRUPT = ["Antibiotics.", "Low-fibre diet.", "Alcohol.", "High saturated fat diet."];
const ESTROBOLOME_SUPPORT = ["30+ different plant foods per week.", "Fermented foods: kefir, yogurt, sauerkraut, kimchi, miso.", "Prebiotic fibres: garlic, onion, leeks, asparagus, oats.", "Calcium D-glucarate (500–1,000mg/day) inhibits beta-glucuronidase directly."];

const SEED_CYCLING = [
  { phase: "Follicular (days 1–14)", body: "1 tbsp ground flaxseed + 1 tbsp raw pumpkin seeds daily. Flax has lignans plus omega-3 (ALA). Pumpkin seeds are rich in zinc." },
  { phase: "Luteal (days 15–28)",     body: "1 tbsp raw sunflower seeds + 1 tbsp sesame seeds daily. Sunflower seeds: selenium and vitamin E. Sesame: lignans that support progesterone." },
  { phase: "Important",                body: "Seeds should be ground. Effect, if any, is cumulative — give it 3 months before evaluating." },
];

const BLOOD_SUGAR_LUTEAL = "Insulin resistance increases in the luteal phase — progesterone reduces insulin sensitivity. Practical: never skip breakfast, eat protein before carbohydrates (reduces post-meal glucose spike by up to 30%), cinnamon (½ tsp/day) has modest evidence, chromium (200mcg) for cravings.";

const EDC_LIST = [
  { name: "BPA",          found: "Plastic containers, tin can linings, thermal receipt paper", swap: "Glass or stainless containers for hot foods. BPA-free canned goods. Avoid thermal receipts." },
  { name: "Phthalates",   found: "Flexible plastics, synthetic fragrance in cosmetics",        swap: "Unscented or naturally-fragranced products. Glass food storage." },
  { name: "Parabens",     found: "Preservatives in cosmetics (weak oestrogen activity)",       swap: "Paraben-free formulations for products used daily." },
  { name: "Pesticides",   found: "Dirty Dozen: strawberries, spinach, peppers, grapes",        swap: "Buy organic where practical for the Dirty Dozen specifically." },
];

const BLOODS_CORE = [
  { name: "Full blood count (FBC) + Ferritin", body: "Ferritin often not automatically included — ask by name. Aim for 70+ µg/L for hair and energy." },
  { name: "Vitamin D",                          body: "Deficiency near-universal in UK. Optimal 75–150 nmol/L. If deficient, may need 5,000 IU/day to correct." },
  { name: "B12",                                body: "Important for women who don't eat meat regularly or take the pill. Optimal 400–700 pg/mL." },
  { name: "Thyroid (TSH + free T4)",            body: "TSH alone misses early thyroid dysfunction. Push for free T3 and TPOAb if symptomatic." },
];

const BLOODS_HORMONAL = [
  { name: "Reproductive age",  body: "Day 2–3: LH, FSH, oestradiol, AMH. Day 21 progesterone confirms ovulation." },
  { name: "TTC",               body: "Add AMH. TSH, rubella immunity, full STI screen." },
  { name: "Perimenopause",     body: "Day 2–3 FSH. Above 10 IU/L suggests early peri; above 30 with clinical picture suggests late peri." },
  { name: "Post-menopause",    body: "Lipid panel, HbA1c, DEXA, testosterone if symptoms of deficiency." },
];

const RANGE_VS_OPTIMAL = [
  { test: "Ferritin",             range: "12–300 µg/L",   optimal: "70+ µg/L for hair and energy" },
  { test: "Vitamin D",            range: "50–200 nmol/L", optimal: "75–150 nmol/L" },
  { test: "TSH",                  range: "0.5–4.5 mIU/L", optimal: "Below 2.5 if symptomatic" },
  { test: "Day 21 progesterone",  range: "Above 5 nmol/L",optimal: "30+ nmol/L for adequacy" },
];

const HRT_CONVERSATION = [
  { title: "What to say",       body: "'I believe I'm experiencing perimenopause symptoms. I've read the NICE guidelines and would like to discuss HRT as a treatment option.'" },
  { title: "What to ask for",   body: "Transdermal oestrogen (patch or gel) rather than oral. Micronised progesterone (Utrogestan) if you have a uterus. A review in 3 months." },
  { title: "If dismissed",      body: "You have the right to a second opinion. Menopause specialists and private clinics can prescribe if your GP is not supportive." },
  { title: "Contraindications", body: "Current or recent breast cancer, unexplained vaginal bleeding, active blood clot. Most others require individual assessment." },
];

const SUPP_STACK_SEPARATE = [
  "Iron + calcium: calcium inhibits iron absorption. Take iron with vitamin C; calcium at a different meal.",
  "Iron + zinc: compete for the same absorption transporter.",
  "Zinc + copper: high-dose zinc depletes copper. If zinc above 25mg/day, pair with 1–2mg copper.",
];
const SUPP_STACK_SYNERGY = [
  "Vitamin D + K2 + magnesium: K2 directs calcium to bones; magnesium activates vitamin D.",
  "Iron + vitamin C: vitamin C enhances iron absorption 2–3 fold.",
  "B vitamins: work as a complex.",
];
const SUPP_TIMING = [
  "Fat-soluble vitamins (A, D, E, K): take with a meal containing fat.",
  "Iron: best on empty stomach; with food if nausea.",
  "Magnesium glycinate: evening — glycine supports sleep quality.",
];

const GP_APPT_BRING = [
  "A written symptom list — when started, severity (1–10), daily impact.",
  "Your cycle tracking data — printed or on your phone.",
  "Current medication and supplement list.",
  "One primary concern and one secondary — GPs work best with focused questions.",
];
const GP_APPT_LANGUAGE = [
  "'This is significantly affecting my quality of life'.",
  "'I've been tracking this for X months' — demonstrates seriousness.",
  "'I'd like to be tested for X specifically'.",
  "'I've read about [condition] and would like to discuss it.'",
];

const LIFE_STAGE_CONTENT = {
  teen: {
    oneliner: "Your first few years of periods are your body learning. Cycles of 21–45 days are normal in the first 2 years.",
    sections: [
      { title: "What's actually going on", body: "Your hormones are calibrating. Cycle length will vary widely during the first 18–24 months — this is the hypothalamic-pituitary-ovarian feedback loop learning its rhythm." },
      { title: "What's normal vs not", body: "Cramping on day 1–2 — normal. Mood changes — normal. NOT normal: vomiting from pain, fainting, missing school regularly, periods soaking through a pad in under 2 hours." },
      { title: "Early PCOS signs to know", body: "Irregular periods past the first 2 years, acne resistant to skincare, excess hair growth, or difficulty losing weight despite healthy lifestyle." },
      { title: "Iron in teenage years", body: "Heavy periods + a growing body + low-iron diets makes iron deficiency common. If tired, breathless, or unusually pale, ask your GP for a ferritin test." },
      { title: "Talking to a GP", body: "You can see a GP independently from age 13 in most situations in the UK — your GP is bound by confidentiality. School nurses and Brook are also good resources." },
    ],
    redFlags: ["Severe pain that stops you doing normal things","Periods stopping for 3+ months (pregnancy excluded)","Soaking through a super pad in under 2 hours","Persistent periods longer than 7 days","Cycles shorter than 21 days or longer than 45 days after the first 2 years"],
  },
  reproductive: {
    oneliner: "Optimising what's working. Knowing what's actually normal — and what isn't.",
    sections: [
      { title: "Your cycle is a vital sign", body: "As informative as blood pressure or heart rate. A regular, healthy cycle says your hormones are broadly functioning well." },
      { title: "What healthy actually looks like", body: "25–35 days, 3–7 days of bleeding, manageable pain, a clear mid-cycle fertile window, and a luteal phase of 12–16 days." },
      { title: "Symptoms in a healthy cycle", body: "Some cramping early in the period. Mild breast tenderness in luteal. Mood shifts around menstruation. None of these should stop your life." },
      { title: "Red flags at this stage", body: "Periods stopping or becoming irregular without pregnancy. Heavy periods. Worsening pain over time." },
      { title: "Contraception note", body: "Hormonal birth control suppresses ovulation. What you bleed on the pill is a withdrawal bleed, not a true period." },
      { title: "Lifestyle leverage", body: "Sleep regularity, protein intake, strength training, and stress management all measurably affect cycle health." },
    ],
    redFlags: ["Heavy bleeding (soaking a pad/tampon in under 2 hours)","Periods lasting longer than 7 days","Severe pelvic pain that disrupts daily life","Spotting between periods or after sex","Cycles consistently shorter than 21 or longer than 35 days","Pain during sex"],
  },
  "pre-ttc": {
    oneliner: "The 3 months before you start trying matter as much as conception itself. Egg quality takes ~90 days to develop.",
    sections: [
      { title: "Why 3 months matters", body: "Egg quality is set roughly 3 months before ovulation." },
      { title: "Core supplement stack", body: "Folate 400mcg minimum (5mg if previous NTD history). Vitamin D, CoQ10 ubiquinol 200–600mg/day, omega-3 DHA 1,000mg/day, zinc 15–25mg/day." },
      { title: "Lifestyle leverage", body: "Reducing alcohol improves egg quality. Smoking is directly damaging. Excess exercise can suppress ovulation. Cortisol suppresses LH and progesterone." },
      { title: "Pre-conception bloods", body: "Ferritin, vitamin D, thyroid (TSH + free T4), HbA1c." },
      { title: "Your partner matters", body: "Sperm quality also takes ~3 months. Male factors account for 30–40% of fertility issues." },
    ],
    redFlags: ["Cycles outside 21–35 days","BMI under 19 or over 30","Untreated thyroid or autoimmune conditions","Family history of recurrent miscarriage","Medications not pregnancy-safe"],
  },
  ttc: {
    oneliner: "Your fertile window is about 6 days per cycle.",
    sections: [
      { title: "The fertile window", body: "5 days before ovulation plus ovulation day. Sperm survive 3–5 days; egg lives 12–24 hours." },
      { title: "Identifying ovulation", body: "Cervical mucus, BBT rise, mid-cycle twinges, OPKs detect LH surge 24–36h before ovulation." },
      { title: "Male factor matters", body: "40–50% of fertility challenges involve male factors. Semen analysis is quick, inexpensive, non-invasive." },
      { title: "What to investigate early", body: "Day 2–3 FSH, LH, AMH. Day 21 progesterone. Thyroid, rubella, chlamydia." },
      { title: "Mental health during TTC", body: "Limit symptom-spotting, avoid early testing, have a plan for negative-test days." },
      { title: "When to seek help", body: "12 months under 35, 6 months 35+, 3 months 40+." },
    ],
    redFlags: ["No conception in expected timeframes for your age","Cycles consistently irregular while trying","Severe pelvic pain or pain during sex","2+ miscarriages","Untreated PCOS, endometriosis, or thyroid issues"],
  },
  "pregnant-t1": {
    oneliner: "Weeks 1–12. Everything is changing fast.",
    sections: [
      { title: "What's normal", body: "Extreme tiredness, nausea (peaks weeks 6–10), breast tenderness, frequent urination, smell sensitivity, food aversions." },
      { title: "Morning sickness truth", body: "Can be all day. Small frequent meals + protein nearby. Hyperemesis gravidarum needs medical treatment." },
      { title: "What to do now", body: "400mcg folic acid. Stop alcohol. Avoid soft cheeses/pâté/raw fish/undercooked meat. Vitamin D 10mcg daily." },
      { title: "First appointments", body: "Booking 8–10 weeks. Dating scan 11–13 weeks." },
      { title: "Mental health from day one", body: "If history of depression, anxiety, OCD, or eating disorders, tell your midwife — perinatal services can support you proactively." },
    ],
    redFlags: ["Heavy bleeding with cramps or pain","Severe one-sided pelvic pain (rule out ectopic)","Vomiting preventing fluids","Fainting, dizziness, or shoulder-tip pain","High fever or signs of infection"],
  },
  "pregnant-t2": {
    oneliner: "Weeks 13–27. The 'easier' trimester for most.",
    sections: [
      { title: "Anomaly scan", body: "Around 20 weeks. Checks fetal development." },
      { title: "First movements", body: "Typically 18–22 weeks. By week 24 consistent daily. Reduced movements need same-day assessment." },
      { title: "Iron and pregnancy", body: "Iron requirements double. Bloods at 28 weeks check for anaemia." },
      { title: "Skin and hair", body: "Pregnancy glow, melasma, linea nigra, thicker hair. Most resolves postpartum." },
      { title: "Pain that's normal — and isn't", body: "Back pain and pelvic girdle pain are common. NHS physiotherapy available." },
    ],
    redFlags: ["Reduced fetal movement after week 24","Persistent severe headaches","Vision changes or swelling","Vaginal bleeding","Severe itching on palms/soles"],
  },
  "pregnant-t3": {
    oneliner: "Weeks 28–40+. Preparing for birth.",
    sections: [
      { title: "What's normal", body: "Shortness of breath, heartburn, sleep difficulty, Braxton Hicks, swollen ankles." },
      { title: "Antenatal classes", body: "Weeks 28–36. NCT paid; NHS free." },
      { title: "Recognising labour", body: "Regular contractions intensifying. 'Show'. Waters breaking. Braxton Hicks are irregular." },
      { title: "When to phone maternity", body: "Contractions 5 min apart for an hour. Waters breaking, bleeding, reduced movements." },
      { title: "Birth plans", body: "Preferences and contingencies. A conversation document, not a contract." },
      { title: "Postnatal preparation", body: "Easy meals, baby admin, identify your 'low-bar' people. PND affects 1 in 5." },
    ],
    redFlags: ["Reduced fetal movement","Severe headaches, vision changes, swelling","Severe itching on palms/soles","Vaginal bleeding","Waters breaking but no contractions in 24h","Anything that feels wrong"],
  },
  postpartum: {
    oneliner: "The fourth trimester. You are also the patient.",
    sections: [
      { title: "The hormone crash", body: "Within 72 hours of birth, oestrogen and progesterone drop to near zero. This causes baby blues in days 3–5, affecting 80% of women." },
      { title: "Baby blues vs PND", body: "Baby blues pass within 2 weeks. PND is persistent. PND affects 1 in 10 and responds well to treatment." },
      { title: "Postpartum hair loss", body: "Telogen effluvium — mass shedding around 3–4 months. Most regrows by 12 months." },
      { title: "Physical recovery", body: "Pelvic floor takes 12 weeks minimum. Returning to impact exercise before then risks long-term damage." },
      { title: "Breastfeeding and fertility", body: "Prolactin suppresses ovulation — but not reliably enough to use as contraception." },
      { title: "Help is not failure", body: "Lactation consultants. NHS pelvic health physio. NCT helpline. PND treatment is effective." },
    ],
    redFlags: ["Persistent low mood, hopelessness, intrusive thoughts (any time in first year)","Heavy bleeding soaking a pad in an hour","Fever over 38°C","Severe headache, vision changes","Painful, hot, swollen calf","Severe breast pain with fever"],
  },
  perimenopause: {
    oneliner: "Begins early 40s, lasts 2–12 years. Oestrogen fluctuates erratically.",
    sections: [
      { title: "The full symptom picture", body: "Vasomotor (hot flashes, night sweats), sleep (insomnia, early waking), mood (anxiety, rage), cognitive (brain fog), musculoskeletal (joint aches, frozen shoulder), urogenital (vaginal dryness, recurring UTIs), cycle changes, skin/hair, palpitations, tinnitus, formication." },
      { title: "HRT — what's actually available", body: "Transdermal oestrogen (patches, gel) has better cardiovascular profile than oral. Micronised progesterone (Utrogestan): better tolerated than synthetic progestogens. Mirena IUS can serve as progesterone component. Testosterone increasingly prescribed off-label." },
      { title: "Modern HRT evidence", body: "The 2002 WHI study enrolled women aged 63 on outdated synthetic hormones. Modern evidence shows body-identical HRT started within 10 years of menopause has a favourable risk/benefit profile." },
      { title: "Natural approaches with evidence", body: "Isoflavones: modest evidence. CBT: NICE-recommended for hot flashes and mood. Magnesium glycinate: sleep. Weight-bearing exercise: bone density." },
      { title: "Many women are misdiagnosed", body: "Anxiety and mood symptoms treated with antidepressants when HRT would be more appropriate. Advocate for yourself." },
    ],
    redFlags: ["Cycles becoming heavier or longer","Bleeding after sex or between periods (especially after 45)","Symptoms severely affecting daily functioning","Mood crisis — perimenopause linked to increased suicide risk","Joint pain not responding to usual measures"],
  },
  menopause: {
    oneliner: "12 months after your final period.",
    sections: [
      { title: "Genitourinary Syndrome of Menopause", body: "Vaginal dryness, recurrent UTIs, bladder urgency. Local vaginal oestrogen is extremely effective and safe even for most women who can't use systemic HRT." },
      { title: "Bone density", body: "Menopause accelerates bone loss — 10–20% in the first 5 years. Calcium, vitamin D, weight-bearing exercise are foundational." },
      { title: "Cardiovascular risk", body: "Women's cardiovascular risk rises to equal men's by their late 60s. Annual BP, cholesterol, HbA1c." },
      { title: "Brain", body: "Most women's cognition returns to baseline within a few years. HRT within 10 years appears protective against Alzheimer's." },
      { title: "HRT after the transition", body: "The 'lowest dose for shortest time' messaging is outdated. No automatic age cap." },
    ],
    redFlags: ["Any postmenopausal bleeding — urgent","Sudden or severe joint pain","New or severe headaches","Persistent low mood","Symptoms of POI (menopause under 40)"],
  },
  "post-menopause": {
    oneliner: "The longest chapter for most women. Monitoring and maintenance.",
    sections: [
      { title: "Bone health long-term", body: "DEXA every 2 years if not on HRT. Bisphosphonates if osteoporosis. Weight-bearing exercise preserves bone density." },
      { title: "Cardiovascular", body: "Annual BP, periodic cholesterol and HbA1c. Statins at lower thresholds — discuss QRISK3." },
      { title: "Cognitive health", body: "Education + social engagement + cardiovascular health + sleep + Mediterranean diet + exercise." },
      { title: "Sexual health continues to matter", body: "Vaginal oestrogen, lubricants, addressing libido changes." },
      { title: "Testosterone in post-menopause", body: "Off-label but increasingly common — improves libido, energy, mood." },
      { title: "Annual monitoring to request", body: "FBC, lipid panel, HbA1c, vitamin D, thyroid, blood pressure. Mammogram per NHS schedule." },
    ],
    redFlags: ["Any vaginal bleeding (urgent)","New, severe, or persistent headaches","Bowel habit changes lasting 3+ weeks","Unexplained weight loss","Falls"],
  },
};

const NEWS_BY_TAB = {
  cycle: [
    { headline: "PCOS affects 1 in 10 women — new guidance on diagnosis", source: "The Guardian", date: "Jan 2025", url: "https://www.theguardian.com/society/2025/jan/01/pcos-diagnosis-guidance" },
    { headline: "Why your period pain might be endometriosis",            source: "NHS",            date: "2024",     url: "https://www.nhs.uk/conditions/endometriosis/" },
  ],
  "skin-hair": [
    { headline: "The truth about biotin supplements for hair loss",                    source: "Healthline", date: "",     url: "https://www.healthline.com/health/biotin-hair-growth" },
    { headline: "Hormonal acne: what actually works, according to dermatologists",     source: "Healthline", date: "",     url: "https://www.healthline.com/health/beauty-skin-care/hormonal-acne" },
  ],
  "life-stage": [
    { headline: "HRT: the evidence women need to make informed decisions",  source: "The Menopause Charity", date: "", url: "https://themenopausecharity.org/hrt-evidence/" },
    { headline: "NICE menopause guidelines — what they mean for you",       source: "British Menopause Society", date: "", url: "https://thebms.org.uk/publications/nice-guidelines/" },
  ],
  body: [
    { headline: "Endometriosis diagnosis still takes 8 years on average", source: "BBC Health", date: "", url: "https://www.bbc.co.uk/news/health" },
    { headline: "PMDD: the premenstrual disorder that disrupts daily life", source: "NHS", date: "", url: "https://www.nhs.uk/mental-health/conditions/premenstrual-dysphoric-disorder/" },
  ],
  mind: [
    { headline: "Perimenopause brain fog: what's happening and what helps", source: "Dr Louise Newson", date: "", url: "https://www.menopausedoctor.co.uk/" },
    { headline: "Exercise and mood in the luteal phase",                    source: "Women's Health Mag", date: "", url: "https://www.womenshealthmag.com/" },
  ],
  nourishment: [
    { headline: "The gut-hormone connection: why your microbiome affects your cycle", source: "Healthline", date: "", url: "https://www.healthline.com/nutrition/gut-microbiome-and-hormones" },
    { headline: "Anti-inflammatory eating for endometriosis", source: "Endometriosis UK", date: "", url: "https://www.endometriosis-uk.org/" },
  ],
  care: [
    { headline: "What blood tests should women ask for?",          source: "Patient.info",   date: "", url: "https://patient.info/" },
    { headline: "HRT and breast cancer risk: what does the evidence say?", source: "The Guardian", date: "", url: "https://www.theguardian.com/society" },
  ],
};

const QUOTES_BY_TAB = {
  cycle:       { quote: "The menstrual cycle is a vital sign — just as important as blood pressure or heart rate. If it's disrupted, your body is trying to tell you something.", attribution: "Dr Lara Briden, naturopathic doctor and author of Period Repair Manual" },
  "skin-hair": { quote: "Ferritin is the single most underdiagnosed cause of hair loss in women. The lab 'normal' range is not the same as the optimal range for hair.", attribution: "Dr Dina Eliash, dermatologist" },
  "life-stage":{ quote: "The 2002 WHI trial used outdated hormones in women who were, on average, 63 years old. It has no relevance to body-identical HRT started in women in their 40s and 50s.", attribution: "Dr Louise Newson, GP and menopause specialist" },
  mind:        { quote: "PMDD is not 'bad PMS.' It's a biological disorder of the brain's response to normal hormonal changes — and it's treatable.", attribution: "Dr Andrea Rapkin, UCLA obstetrics and gynaecology" },
  body:        { quote: "Endometriosis takes on average 7–9 years to diagnose. The most common reason for this delay is patients and doctors assuming severe period pain is normal.", attribution: "Endometriosis UK" },
  nourishment: { quote: "What you eat affects your oestrogen levels more directly than most women realise. The gut microbiome is a key regulator of circulating oestrogen.", attribution: "Dr Aviva Romm, integrative physician" },
  care:        { quote: "Women deserve to know what their blood results actually mean, not just whether they're 'normal.' Normal and optimal are very different things.", attribution: "Dr Jolene Brighten, functional medicine doctor" },
};

// ─── Helpers ──────────────────────────────────────────────────────────
function todayLocal() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function isoOf(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function todayIso() { return isoOf(todayLocal()); }
function lastNDayKeys(n) {
  const out = []; const today = todayLocal();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push(isoOf(d));
  }
  return out;
}
function dateKeyOf(r)  { return r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0,10) : "") || (r?.created_date ? String(r.created_date).slice(0,10) : ""); }
function readMood(r)   { const v = r?.mood_score ?? r?.mood;     return v != null ? Number(v) : null; }
function readEnergy(r) { const v = r?.energy_level ?? r?.energy; return v != null ? Number(v) : null; }
function avg(arr) { const v = (arr || []).filter((x) => x != null); return v.length ? v.reduce((s, x) => s + Number(x), 0) / v.length : null; }
function prettyName(s) { return String(s || "").replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); }
function severityIsSerious(s) { return /severe|very/i.test(String(s || "")); }
function resolveLifeStageKey(profile) {
  const stage = profile?.life_stage || "reproductive";
  if (stage === "pregnancy") {
    const w = Number(profile?.pregnancy_week);
    if (w && w <= 12) return "pregnant-t1";
    if (w && w <= 27) return "pregnant-t2";
    if (w) return "pregnant-t3";
    return "pregnant-t2";
  }
  return stage;
}
function moodTint(v) {
  if (v == null) return "transparent";
  const x = Math.max(1, Math.min(5, Math.round(v)));
  return ["#F7E0E1", "#F2C5C9", "#EBA9AF", "#E08993", "#C4636F"][x - 1];
}
function energyTint(v) {
  if (v == null) return "transparent";
  const x = Math.max(1, Math.min(5, Math.round(v)));
  return ["#E6EEE6", "#C8DDC8", "#A8C9A8", "#8FAF8F", "#6F9070"][x - 1];
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function HealthCornerDemo({ profile, checkins = [], symptoms = [], meals = [], meds = [], supps = [], habits = [], skinLogs = [] }) {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [active, setActive] = useState("overview");
  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "follicular";
  const stage = profile?.life_stage || "reproductive";
  const isMeno = MENO_STAGES.has(stage);
  const isCycling = CYCLING_STAGES.has(stage);

  const props = {
    layout,
    profile, checkins, symptoms, meals, meds, supps, habits, skinLogs,
    cycle, phase, stage, isMeno, isCycling,
    setActive,
  };

  return (
    <div>
      {/* Global injected styles — animations + drop caps. Kept inline so the
          file remains self-contained and survives the base44 build pipeline. */}
      <style>{`
        @keyframes hcdemo-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(212,175,55,0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(212,175,55,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
        }
        .hcdemo-pulse-dot { animation: hcdemo-pulse 1.8s infinite; }
        .hcdemo-letter-paper p.hcdemo-lede:first-letter,
        .hcdemo-magazine-prose p.hcdemo-lede:first-letter {
          float: left;
          font-family: "Fraunces", Georgia, serif;
          font-size: 56px;
          line-height: 0.9;
          padding: 6px 10px 0 0;
          color: ${T.gold};
          font-weight: 700;
        }
        .hcdemo-letter-link {
          color: ${T.gold};
          font-style: italic;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
        }
      `}</style>

      <DemoPill />

      <article style={canvasStyle(layout)}>
        <LayoutPicker active={layout} setActive={setLayout} />

        <nav style={{
          position: "sticky", top: 0, zIndex: 11,
          background: T.cream,
          borderBottom: `1px solid ${T.border}`,
          padding: "10px 8px",
          overflowX: "auto", scrollbarWidth: "none",
        }}>
          <div style={{ display: "flex", gap: 6, minWidth: "max-content" }}>
            {HC_TABS.map((t) => {
              const on = active === t.id;
              return (
                <button key={t.id} onClick={() => setActive(t.id)} style={{
                  padding: "6px 12px", borderRadius: 999,
                  background: on ? T.espresso : "transparent",
                  color: on ? T.cream : T.muted,
                  border: "none", cursor: "pointer",
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 12, fontWeight: on ? 700 : 500,
                  letterSpacing: 0.2, whiteSpace: "nowrap",
                }}>{t.label}</button>
              );
            })}
          </div>
        </nav>

        <PhaseBar phase={phase} cycle={cycle} stage={stage} isMeno={isMeno} />

        {layout === "magazine" && <MagazineRunningHeader />}

        <div style={{ padding: "6px 0 24px" }}>
          <LayoutFrame layout={layout} profile={profile} phase={phase} cycle={cycle} stage={stage} isMeno={isMeno} active={active}>
            {active === "overview"    && <OverviewTab    {...props} />}
            {active === "cycle"       && <CycleTab       {...props} />}
            {active === "life-stage"  && <LifeStageTab   {...props} />}
            {active === "skin-hair"   && <SkinHairTab    {...props} />}
            {active === "body"        && <BodyTab        {...props} />}
            {active === "mind"        && <MindTab        {...props} />}
            {active === "nourishment" && <NourishmentTab {...props} />}
            {active === "care"        && <CareTab        {...props} />}
          </LayoutFrame>
        </div>
      </article>

      <ReviewerNote>
        v4.1 — Letter layout added (paper-on-surface, drop caps, botanical dividers, dateline, sign-off).
        Conversational layout retired. Magazine grows a grain hero + section numbers + running header;
        Card Grid grows section color bands + dot-grid background + EXPERT badges; Timeline grows a gold
        pulsing dot, phase-color milestones, journal-rule background; Dashboard grows sparklines, trend
        arrows, and a circular cycle progress arc. Single brand palette throughout — only structure
        and signature asset change per layout.
      </ReviewerNote>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LAYOUT FRAME — wraps tab content per-layout (Letter paper, Magazine prose)
// ═══════════════════════════════════════════════════════════════════════
function LayoutFrame({ layout, profile, phase, cycle, stage, isMeno, active, children }) {
  if (layout === "letter") {
    return (
      <LetterPaper profile={profile} phase={phase} cycle={cycle} stage={stage} isMeno={isMeno} tab={active}>
        {children}
      </LetterPaper>
    );
  }
  if (layout === "magazine") {
    return (
      <div className="hcdemo-magazine-prose">
        {children}
      </div>
    );
  }
  return children;
}

// ═══════════════════════════════════════════════════════════════════════
// LETTER PAPER — paper-floating-on-surface effect + progressive disclosure
//   • Provides LetterContext so each <Section> can register itself,
//     toggle its expanded state, and render its keyFact callout.
//   • Renders the Table of Contents and "Expand / Collapse all" controls
//     between the salutation and the registered sections.
//   • Applies phase-smart default expansions on first registration of
//     each tab so the letter opens as a focused 2-section piece.
// ═══════════════════════════════════════════════════════════════════════
function LetterPaper({ profile, phase, cycle, stage, isMeno, tab, children }) {
  const today = new Date();
  const dateline = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const phaseLabel = PHASE_LABEL[phase] || prettyName(phase);
  const day = cycle?.cycleDay || cycle?.dayInCycle;
  const name = profile?.preferred_name || profile?.full_name?.split?.(" ")?.[0] || "friend";

  // ─── registry of sections that have mounted under this letter ──
  const [registry, setRegistry] = useState([]);
  // ─── expanded state (id → bool) ──
  const [expanded, setExpanded] = useState({});
  // ─── track first init per tab so user toggles don't get clobbered ──
  const initialisedRef = useRef(null);

  // Reset everything whenever the user switches tabs (children change).
  useEffect(() => {
    setRegistry([]);
    setExpanded({});
    initialisedRef.current = null;
  }, [tab]);

  const registerSection = useCallback((descriptor) => {
    setRegistry((prev) => {
      if (prev.find((s) => s.id === descriptor.id)) return prev;
      return [...prev, descriptor];
    });
  }, []);

  // After sections have registered for the active tab, apply phase-smart
  // defaults exactly once. Two sections open on load — the phase default,
  // plus the first section as anchor.
  useEffect(() => {
    if (!registry.length) return;
    if (initialisedRef.current === tab) return;
    initialisedRef.current = tab;
    const defaults = {};
    const phaseId = DEFAULT_OPEN[tab]?.[phase];
    if (phaseId && registry.find((s) => s.id === phaseId)) defaults[phaseId] = true;
    if (registry[0] && !defaults[registry[0].id]) defaults[registry[0].id] = true;
    setExpanded(defaults);
  }, [registry, tab, phase]);

  const toggle      = useCallback((id) => setExpanded((p) => ({ ...p, [id]: !p[id] })), []);
  const expandAll   = useCallback(() => {
    setExpanded(Object.fromEntries(registry.map((s) => [s.id, true])));
  }, [registry]);
  const collapseAll = useCallback(() => setExpanded({}), []);

  const ctxValue = useMemo(() => ({
    expanded, toggle, expandAll, collapseAll, registerSection, registry,
  }), [expanded, toggle, expandAll, collapseAll, registerSection, registry]);

  return (
    <LetterContext.Provider value={ctxValue}>
      <div style={{
        maxWidth: 680, margin: "20px auto 24px",
        background: "#FEFAF2",
        padding: "48px 52px",
        boxShadow: "0 18px 44px rgba(58,44,26,0.18), 0 4px 10px rgba(58,44,26,0.10)",
        borderRadius: 4,
        position: "relative",
      }} className="hcdemo-letter-paper">
        {/* Letterhead */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 26, fontWeight: 700, letterSpacing: 3,
            color: T.espresso, textTransform: "uppercase",
          }}>FEMWELL</div>
          <div style={{
            fontSize: 10, letterSpacing: 4, textTransform: "uppercase",
            color: T.muted, fontWeight: 600, marginTop: 4,
          }}>Personal Health Guide</div>
        </div>
        <BotanicalDivider />

        {/* Dateline */}
        <div style={{
          fontSize: 12.5, color: T.muted, fontStyle: "italic",
          fontFamily: 'Georgia, serif',
          textAlign: "right", marginTop: 18, marginBottom: 22,
          letterSpacing: 0.2,
        }}>
          {dateline}
          {!isMeno && day && (
            <>
              <br />
              <span style={{ color: T.gold }}>{phaseLabel} · Day {day}</span>
            </>
          )}
        </div>

        {/* Salutation */}
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: 18, fontStyle: "italic",
          color: T.espresso, marginBottom: 18,
        }}>
          Dear {name},
        </div>

        {/* ── Table of Contents (populates after first useEffect pass) ── */}
        <LetterTOC />

        {/* Body */}
        <div className="hcdemo-letter-body" style={{ fontFamily: 'Georgia, serif', color: T.espresso, lineHeight: 1.75, fontSize: 15 }}>
          {children}
        </div>

        {/* Sign-off */}
        <BotanicalDivider />
        <div style={{
          marginTop: 22, fontFamily: 'Georgia, serif', fontSize: 14.5,
          color: T.espresso, lineHeight: 1.6,
        }}>
          <div style={{ fontStyle: "italic" }}>With care,</div>
          <div style={{ marginTop: 6, fontFamily: '"Fraunces", Georgia, serif', fontStyle: "italic", fontSize: 16, color: T.gold }}>
            Your FemWell Health Guide
          </div>
        </div>
      </div>
    </LetterContext.Provider>
  );
}

// ─── LETTER SECTION — registers itself + handles read-more/read-less ───
function LetterSection({ id, title, category, keyFact, children }) {
  const ctx = useContext(LetterContext);
  // Register on mount; re-register if id/title/category/keyFact identity changes.
  useEffect(() => {
    if (!ctx) return;
    ctx.registerSection({ id, title, category, keyFact });
  }, [ctx, id, title, category, keyFact]);

  const isExpanded = !!ctx?.expanded?.[id];
  const onToggle   = () => ctx?.toggle(id);

  // Index in the registry → use this to decide whether to render a
  // botanical divider above (every section except the first).
  const registryIdx = ctx?.registry?.findIndex((s) => s.id === id) ?? -1;
  const showDividerAbove = registryIdx > 0;

  return (
    <>
      {showDividerAbove && (
        <div style={{ margin: "8px 0 -8px" }}>
          <BotanicalDivider color={T.muted} />
        </div>
      )}
    <section
      id={`letter-section-${id}`}
      style={{ marginTop: 32, marginBottom: 8, scrollMarginTop: 110 }}
      className="hcdemo-letter-section"
    >
      {/* Section header — category eyebrow + Georgia serif title */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          fontSize: 10, color: T.muted, letterSpacing: 2,
          textTransform: "uppercase", marginBottom: 4,
          fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 700,
        }}>{category}</div>
        <div style={{
          fontSize: 19, fontWeight: 700, color: T.espresso,
          fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.3, letterSpacing: -0.2,
        }}>{title}</div>
      </div>

      {/* Key insight — always visible, gold left border */}
      {keyFact && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(212,175,55,0.08)",
          borderLeft: `3px solid ${T.gold}`,
          borderRadius: "0 4px 4px 0",
          marginBottom: 12,
        }} className="hcdemo-letter-keyfact">
          <span style={{
            fontSize: 11, color: T.muted, letterSpacing: 1.3,
            textTransform: "uppercase", marginRight: 8, fontWeight: 700,
          }}>Key insight</span>
          <span style={{
            fontSize: 13.5, color: T.espresso,
            fontFamily: 'Georgia, serif', fontStyle: "italic",
          }}>{keyFact}</span>
        </div>
      )}

      {/* Body — collapsed by default, with a discreet read-more link */}
      {isExpanded ? (
        <div>
          <div style={{ color: T.espresso, fontFamily: 'Georgia, serif', lineHeight: 1.78, fontSize: 15 }}>
            {children}
          </div>
          <button onClick={onToggle} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontSize: 13, color: T.muted, fontFamily: "Georgia, serif", fontStyle: "italic",
            display: "block", marginTop: 10,
          }}>— read less</button>
        </div>
      ) : (
        <button onClick={onToggle} style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontSize: 13, color: T.gold, fontFamily: "Georgia, serif", fontStyle: "italic",
          display: "block", marginTop: 4,
        }}>— read more</button>
      )}
    </section>
    </>
  );
}

// ─── LETTER TABLE OF CONTENTS + Expand/Collapse all controls ───────
function LetterTOC() {
  const ctx = useContext(LetterContext);
  if (!ctx) return null;
  const { registry, expandAll, collapseAll, toggle, expanded } = ctx;
  if (!registry.length) {
    // Skeleton placeholder — keeps layout stable while sections register.
    return (
      <div style={{
        margin: "10px 0 28px", padding: "16px 20px",
        background: "rgba(232,220,200,0.30)",
        border: "1px solid #E8DCC8",
        borderRadius: 4, minHeight: 60,
      }} aria-hidden="true">
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase" }}>
          In this letter
        </div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: T.muted, fontStyle: "italic" }}>
          Compiling sections…
        </div>
      </div>
    );
  }
  return (
    <div style={{
      margin: "10px 0 28px",
      padding: "16px 20px",
      background: "rgba(232,220,200,0.30)",
      borderRadius: 4,
      border: "1px solid #E8DCC8",
    }}>
      <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
        In this letter
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {registry.map((s, i) => (
          <a
            key={s.id}
            href={`#letter-section-${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              if (!expanded[s.id]) toggle(s.id);
              const el = document.getElementById(`letter-section-${s.id}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 13.5, color: T.espresso,
              fontFamily: 'Georgia, serif', fontStyle: "italic",
              textDecoration: "none",
            }}
          >
            <span style={{
              fontSize: 10, color: T.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontStyle: "normal", minWidth: 22,
            }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ flex: 1 }}>{s.title}</span>
            <span style={{ fontSize: 11, color: T.gold }} aria-hidden="true">↓</span>
          </a>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(232,220,200,0.7)" }}>
        <button onClick={expandAll} style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontSize: 12, color: T.gold, fontFamily: "Georgia, serif", fontStyle: "italic",
        }}>Expand all sections</button>
        <span style={{ color: "#E8DCC8" }} aria-hidden="true">·</span>
        <button onClick={collapseAll} style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontSize: 12, color: T.muted, fontFamily: "Georgia, serif", fontStyle: "italic",
        }}>Collapse all</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAGAZINE RUNNING HEADER
// ═══════════════════════════════════════════════════════════════════════
function MagazineRunningHeader() {
  const now = new Date();
  const month = now.toLocaleString("en-GB", { month: "long" }).toUpperCase();
  const year  = now.getFullYear();
  return (
    <div style={{
      borderBottom: `1px solid ${T.border}`,
      background: "#FDFCFA",
      padding: "10px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>
        FemWell Health Guide
      </div>
      <div style={{ fontSize: 10, letterSpacing: 3, color: T.gold, fontWeight: 700 }}>
        {month} {year}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VISUAL ASSET SVGs
// ═══════════════════════════════════════════════════════════════════════
function BotanicalDivider({ color = T.gold }) {
  return (
    <div style={{ textAlign: "center", margin: "16px 0 8px" }} aria-hidden="true">
      <svg width="140" height="18" viewBox="0 0 140 18" xmlns="http://www.w3.org/2000/svg">
        <line x1="0"   y1="9" x2="56"  y2="9" stroke={color} strokeWidth="0.8" opacity="0.6" />
        <line x1="84"  y1="9" x2="140" y2="9" stroke={color} strokeWidth="0.8" opacity="0.6" />
        {/* Centre flower */}
        <circle cx="70" cy="9" r="2.4" fill={color} />
        <ellipse cx="64" cy="9" rx="4" ry="1.8" fill={color} opacity="0.55" />
        <ellipse cx="76" cy="9" rx="4" ry="1.8" fill={color} opacity="0.55" />
        <ellipse cx="70" cy="4" rx="1.8" ry="3.5" fill={color} opacity="0.4" />
        <ellipse cx="70" cy="14" rx="1.8" ry="3.5" fill={color} opacity="0.4" />
        {/* End leaves */}
        <ellipse cx="0"   cy="9" rx="3.5" ry="1.6" fill={color} opacity="0.5" />
        <ellipse cx="140" cy="9" rx="3.5" ry="1.6" fill={color} opacity="0.5" />
      </svg>
    </div>
  );
}

function Sparkline({ values, width = 80, height = 26, stroke = T.gold }) {
  const clean = (values || []).map((v) => (v == null ? 0 : Number(v)));
  if (!clean.length) return null;
  const max = Math.max(...clean, 1);
  const step = clean.length > 1 ? width / (clean.length - 1) : width;
  const pts = clean.map((v, i) => `${i * step},${height - (v / max) * (height - 4) - 2}`).join(" ");
  const lastY = clean.length ? height - (clean[clean.length - 1] / max) * (height - 4) - 2 : height / 2;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(clean.length - 1) * step} cy={lastY} r="2.2" fill={stroke} />
    </svg>
  );
}

function CycleProgress({ day = 14, length = 28, size = 78 }) {
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const pct = Math.max(0, Math.min(1, day / Math.max(length, 1)));
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.gold} strokeWidth="3"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 3} textAnchor="middle"
        fontFamily='"Fraunces", Georgia, serif' fontSize="20" fontWeight="700" fill={T.espresso}>
        {day}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill={T.muted} fontWeight="600" letterSpacing="1.2">
        DAY
      </text>
    </svg>
  );
}

function TrendArrow({ direction = "up" }) {
  const color = direction === "up" ? T.sage : direction === "down" ? T.blushDeep : T.muted;
  const symbol = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return <span style={{ color, fontWeight: 700, fontSize: 13 }} aria-hidden="true">{symbol}</span>;
}

function StatusDot({ color }) {
  return (
    <span aria-hidden="true" style={{
      display: "inline-block", width: 12, height: 12, borderRadius: 999,
      background: color, marginRight: 8, verticalAlign: "middle",
      boxShadow: `0 0 0 2px ${color}25`,
    }} />
  );
}

function MagazineHero({ title, kicker, intro }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        position: "relative",
        height: 140, borderRadius: 4, overflow: "hidden",
        background: `linear-gradient(135deg, ${T.blush} 0%, ${T.gold} 55%, ${T.sage} 100%)`,
      }}>
        {/* Grain overlay — inline SVG noise */}
        <svg width="100%" height="100%" viewBox="0 0 200 140" preserveAspectRatio="none"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.35 }}>
          <filter id="hcgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          </filter>
          <rect width="200" height="140" filter="url(#hcgrain)" />
        </svg>
        {/* Centred kicker */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 24px",
        }}>
          <div>
            {kicker && (
              <div style={{
                fontSize: 10, letterSpacing: 4, color: "#FFFFFF",
                textTransform: "uppercase", fontWeight: 700, marginBottom: 10,
                textShadow: "0 1px 3px rgba(58,44,26,0.3)",
              }}>{kicker}</div>
            )}
            <div style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: 32, fontWeight: 700, lineHeight: 1.1,
              color: "#FFFFFF", letterSpacing: -0.5,
              textShadow: "0 2px 6px rgba(58,44,26,0.35)",
            }}>{title}</div>
          </div>
        </div>
      </div>
      {intro && (
        <p className="hcdemo-lede" style={{
          marginTop: 20, marginBottom: 0,
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 19, lineHeight: 1.55, color: T.espresso,
        }}>{intro}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LAYOUT PICKER
// ═══════════════════════════════════════════════════════════════════════
function LayoutPicker({ active, setActive }) {
  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: `1px solid ${T.border}`,
      background: T.jessBg,
    }}>
      <div style={{
        fontSize: 10, color: T.muted,
        textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, fontWeight: 700,
      }}>Layout</div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {LAYOUTS.map((L) => {
          const on = active === L.id;
          return (
            <button key={L.id} onClick={() => setActive(L.id)} style={{
              flexShrink: 0,
              padding: "8px 14px", borderRadius: 999,
              background: on ? T.espresso : "transparent",
              color: on ? T.cream : T.espresso,
              border: on ? "none" : `1.5px solid ${T.border}`,
              cursor: "pointer", fontSize: 12, fontWeight: on ? 700 : 500,
              fontFamily: '"Inter", system-ui, sans-serif',
              whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6,
              transition: "all 0.15s ease",
            }}>
              <span aria-hidden="true" style={{ fontSize: 14 }}>{L.icon}</span>
              <span>{L.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE BAR
// ═══════════════════════════════════════════════════════════════════════
function PhaseBar({ phase, cycle, stage, isMeno }) {
  const phaseLabel = PHASE_LABEL[phase] || prettyName(phase);
  const phaseEmoji = PHASE_EMOJI[phase] || "🌿";
  const day = cycle?.cycleDay || cycle?.dayInCycle;
  const stageLbl = LIFE_STAGE_LABEL[stage] || prettyName(stage);
  const hasCycle = !isMeno && day;
  return (
    <div style={{
      position: "sticky", top: 56, zIndex: 10,
      background: T.espresso, color: T.cream,
      minHeight: 44,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 18px",
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
        {hasCycle ? <>
          <span style={{ fontSize: 16 }} aria-hidden="true">{phaseEmoji}</span>
          <span>{phaseLabel} · Day {day}</span>
        </> : <>
          <span style={{ fontSize: 16 }} aria-hidden="true">🌿</span>
          <span>{stageLbl}</span>
        </>}
      </div>
      <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>
        {hasCycle ? stageLbl : "FemWell"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION — renders differently per layout (the heart of v4.1)
// ═══════════════════════════════════════════════════════════════════════
function Section({ layout, id, title, jessIntro, open, onToggle, children, index = null, phase = null }) {
  const forcedOpen = FORCE_OPEN_LAYOUTS.has(layout);
  const isOpen = forcedOpen ? true : open;
  const sectionColor = SECTION_COLORS[id] || T.gold;
  const sectionIcon  = SECTION_ICON[id]   || null;
  const sectionBadge = SECTION_BADGE[id]  || null;

  // ─── MAGAZINE: editorial big headers + oversized quote marks + section number ───
  if (layout === "magazine") {
    return (
      <section style={{ marginBottom: 40, position: "relative" }}>
        {/* Decorative oversized section number — opacity 0.08, behind */}
        {index != null && (
          <div aria-hidden="true" style={{
            position: "absolute", top: -8, right: 0,
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 64, fontWeight: 700,
            color: T.espresso, opacity: 0.08,
            lineHeight: 1, letterSpacing: -2,
            pointerEvents: "none",
          }}>{String(index + 1).padStart(2, "0")}</div>
        )}
        <div style={{ height: 2, background: T.espresso, marginBottom: 18 }} />
        {sectionBadge && (
          <span style={{
            display: "inline-block", marginBottom: 12,
            padding: "3px 10px", borderRadius: 4,
            background: T.goldSoft, color: T.gold,
            fontSize: 10, letterSpacing: 1.6, fontWeight: 700, textTransform: "uppercase",
          }}>{sectionBadge}</span>
        )}
        <h2 style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 30, fontWeight: 700, letterSpacing: -0.5,
          color: T.espresso, lineHeight: 1.15,
          margin: "0 0 20px",
          maxWidth: "85%",
        }}>{title}</h2>
        <div style={{ fontSize: 15.5, lineHeight: 1.75 }}>{children}</div>
      </section>
    );
  }

  // ─── TIMELINE: vertical line + phase-coloured pulsing dot + medical caps ───
  if (layout === "timeline") {
    const dotColor = phase ? (PHASE_DOT_COLOR[phase] || T.gold) : (isOpen ? T.gold : T.muted);
    const goldFill = isOpen;
    return (
      <div style={{ position: "relative", paddingLeft: 44, marginBottom: 22 }}>
        {/* vertical line — gold fill when this section is the active one */}
        <div style={{
          position: "absolute", left: 9, top: 22, bottom: -22,
          width: 2,
          background: goldFill
            ? `linear-gradient(to bottom, ${T.gold} 0%, ${T.gold} 40%, ${T.border} 40%, ${T.border} 100%)`
            : T.border,
        }} />
        {/* dot — pulses when this is the active/open section */}
        <div className={goldFill ? "hcdemo-pulse-dot" : ""} style={{
          position: "absolute", left: 2, top: 12,
          width: 16, height: 16, borderRadius: 999,
          background: dotColor,
          border: `3px solid #FFFFFF`,
          boxShadow: goldFill ? `0 0 0 2px ${dotColor}` : `0 0 0 1px ${T.border}`,
        }} />
        {/* Date / phase side label */}
        <div style={{
          position: "absolute", left: -18, top: 32,
          width: 12, fontSize: 9, color: T.muted,
          letterSpacing: 1.2, textTransform: "uppercase",
          writingMode: "vertical-rl", transform: "rotate(180deg)",
          fontWeight: 700,
        }}>
          {phase ? (PHASE_LABEL[phase]?.slice(0, 5) || "") : ""}
        </div>
        <button onClick={() => onToggle(id)} style={{
          width: "100%", padding: "8px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "transparent", border: "none", cursor: forcedOpen ? "default" : "pointer",
          textAlign: "left", gap: 12, color: T.espresso,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.espresso, lineHeight: 1.4 }}>{title}</span>
          {!forcedOpen && (
            <ChevronDown size={14} style={{ color: T.muted, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }} />
          )}
        </button>
        <div style={{ maxHeight: isOpen ? 8000 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
          <div style={{ paddingTop: 10, fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{children}</div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD: flat panel + status dot + EXPERT/EVIDENCE badge ──
  if (layout === "dashboard") {
    return (
      <div style={{
        marginBottom: 12,
        background: "#FFFFFF",
        borderLeft: `4px solid ${sectionColor}`,
        borderTop: `1px solid ${T.border}`,
        borderRight: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        borderRadius: "0 4px 4px 0",
      }}>
        <button onClick={() => onToggle(id)} style={{
          width: "100%", padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <StatusDot color={sectionColor} />
              <span>{sectionBadge || "Panel"}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.espresso, lineHeight: 1.4 }}>{title}</div>
          </div>
          <ChevronDown size={16} style={{ color: T.muted, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }} />
        </button>
        <div style={{ maxHeight: isOpen ? 8000 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
          <div style={{ padding: "0 16px 14px", color: T.espresso }}>{children}</div>
        </div>
      </div>
    );
  }

  // ─── LETTER: progressive disclosure — register, key-fact, read more/less ───
  if (layout === "letter") {
    return <LetterSection
      id={id}
      title={title}
      category={sectionBadge || "Section"}
      keyFact={KEY_FACTS[id]}
    >{children}</LetterSection>;
  }

  // ─── CARD GRID (default): rounded card + 6px top accent + emoji + featured ───
  // When index is explicitly 0 the section is the tab's "featured" card.
  const isFeatured = index === 0;
  return (
    <div style={{
      marginBottom: 10,
      background: "#FFFFFF",
      borderRadius: 16,
      boxShadow: isFeatured ? "0 6px 18px rgba(58,44,26,0.12)" : "0 2px 8px rgba(58,44,26,0.08)",
      border: `1px solid ${T.border}`,
      borderTop: `6px solid ${sectionColor}`,
      overflow: "hidden",
    }}>
      <button onClick={() => onToggle(id)} style={{
        width: "100%", padding: "14px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "transparent", border: "none", cursor: "pointer",
        textAlign: "left", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          {sectionIcon && (
            <span aria-hidden="true" style={{
              flexShrink: 0,
              width: 36, height: 36, borderRadius: 10,
              background: `${sectionColor}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>{sectionIcon}</span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {sectionBadge && (
              <div style={{ fontSize: 9.5, letterSpacing: 1.5, color: sectionColor, fontWeight: 700, marginBottom: 3, textTransform: "uppercase" }}>
                {sectionBadge}
              </div>
            )}
            <span style={{ fontSize: 14, fontWeight: 700, color: T.espresso, lineHeight: 1.45 }}>{title}</span>
          </div>
        </div>
        <ChevronDown size={16} style={{ color: T.muted, flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }} />
      </button>
      <div style={{ maxHeight: isOpen ? 8000 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <div style={{ padding: "0 16px 16px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── GLANCE CARD — layout-aware ───────────────────────────────────
function GlanceCard({ layout, children }) {
  if (layout === "magazine") {
    return (
      <div style={{ padding: "8px 0 28px", borderBottom: `2px solid ${T.espresso}`, marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.muted, fontWeight: 700, marginBottom: 12 }}>At a glance</div>
        <p className="hcdemo-lede" style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 22, lineHeight: 1.45, color: T.espresso, fontWeight: 500 }}>{children}</p>
      </div>
    );
  }
  if (layout === "dashboard") {
    return (
      <div style={{ background: "#FFFFFF", borderLeft: `4px solid ${T.gold}`, border: `1px solid ${T.border}`, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center" }}>
          <StatusDot color={T.gold} />
          <span>Summary</span>
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.espresso }}>{children}</p>
      </div>
    );
  }
  if (layout === "timeline") {
    return (
      <div style={{ paddingLeft: 44, position: "relative", marginBottom: 24 }}>
        <div className="hcdemo-pulse-dot" style={{ position: "absolute", left: 2, top: 4, width: 16, height: 16, borderRadius: 999, background: T.gold, border: `3px solid #FFFFFF`, boxShadow: `0 0 0 2px ${T.gold}` }} />
        <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>Today</div>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 15, lineHeight: 1.65, color: T.espresso }}>{children}</p>
      </div>
    );
  }
  if (layout === "letter") {
    return (
      <p className="hcdemo-lede" style={{
        margin: "0 0 18px",
        fontFamily: 'Georgia, serif',
        fontSize: 17, lineHeight: 1.78,
        color: T.espresso,
      }}>{children}</p>
    );
  }
  // Card grid default
  return (
    <div style={{ background: T.blushBg, borderLeft: `3px solid ${T.blush}`, padding: "14px 16px", borderRadius: "0 12px 12px 0", marginBottom: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: T.blushDeep, fontWeight: 800, marginBottom: 6 }}>At a glance</div>
      <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 15, lineHeight: 1.65, color: T.espresso }}>{children}</p>
    </div>
  );
}

// ─── SECTION HEADER ─────────────────────────────────────────────
function SubHeader({ layout, children }) {
  if (layout === "magazine") {
    return <div style={{ padding: "14px 0 8px", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.muted, fontWeight: 700 }}>{children}</div>;
  }
  if (layout === "dashboard") {
    return <div style={{ padding: "12px 0 6px", fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.gold, fontWeight: 700, display: "flex", alignItems: "center" }}><StatusDot color={T.gold} />{children}</div>;
  }
  if (layout === "letter") {
    return <div style={{ marginTop: 18, marginBottom: 8, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: T.muted, fontWeight: 700, fontFamily: '"Inter", system-ui, sans-serif' }}>{children}</div>;
  }
  return <div style={{ padding: "14px 0 8px", fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, fontWeight: 700 }}>{children}</div>;
}

// ─── DASHBOARD WIDGETS ──────────────────────────────────────────
function WidgetRow({ widgets }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: 10, marginBottom: 14,
    }}>
      {widgets.map((w, i) => (
        <div key={i} style={{
          background: "#FFFFFF", border: `1px solid ${T.border}`,
          borderTop: `3px solid ${T.gold}`,
          padding: "14px 16px",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, fontWeight: 700, marginBottom: 4 }}>{w.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.1 }}>{w.value}</div>
          {w.trend && (
            <div style={{ marginTop: 6, fontSize: 11.5, color: T.muted }}>
              <TrendArrow direction={w.trend} /> <span style={{ marginLeft: 4 }}>{w.trendLabel || "7d"}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SparklineCard({ label, values, trend = "flat", stroke = T.gold, suffix = "" }) {
  const last = (values || []).slice().reverse().find((v) => v != null);
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${T.border}`, borderTop: `3px solid ${stroke}`, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, fontWeight: 700 }}>{label}</div>
        <TrendArrow direction={trend} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.1 }}>
          {last != null ? `${last}${suffix}` : "—"}
        </div>
        <Sparkline values={values} stroke={stroke} />
      </div>
    </div>
  );
}

function trendOf(values) {
  const clean = (values || []).filter((v) => v != null).map(Number);
  if (clean.length < 2) return "flat";
  const half = Math.floor(clean.length / 2);
  const earlier = clean.slice(0, half);
  const later = clean.slice(half);
  const avg = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const diff = avg(later) - avg(earlier);
  if (diff > 0.25) return "up";
  if (diff < -0.25) return "down";
  return "flat";
}

// ─── NEWS STRIP — layout-aware ──────────────────────────────────
function NewsStrip({ layout, tab }) {
  const items = NEWS_BY_TAB[tab];
  if (!items?.length) return null;

  if (layout === "magazine") {
    return (
      <div>
        <SubHeader layout={layout}>From the news desk</SubHeader>
        <div style={{ height: 2, background: T.espresso, marginBottom: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 18 }}>
          {items.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: T.espresso }}>
              <span style={{ display: "inline-block", marginBottom: 8, padding: "2px 9px", borderRadius: 3, background: T.goldSoft, color: T.gold, fontSize: 9, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase" }}>
                {tab.replace(/-/g, " ")}
              </span>
              <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 17, fontWeight: 700, color: T.espresso, marginBottom: 6, lineHeight: 1.35 }}>{item.headline}</div>
              <div style={{ fontStyle: "italic", fontSize: 12, color: T.muted }}>{item.source}{item.date ? ` · ${item.date}` : ""}</div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "dashboard") {
    return (
      <div>
        <SubHeader layout={layout}>Latest research</SubHeader>
        <div style={{ background: "#FFFFFF", border: `1px solid ${T.border}`, marginBottom: 14 }}>
          {items.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
              display: "grid", gridTemplateColumns: "1fr auto auto",
              gap: 12, alignItems: "center",
              padding: "10px 14px", borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.border}`,
              textDecoration: "none", color: T.espresso, fontSize: 13.5,
            }}>
              <div style={{ fontWeight: 600 }}>{item.headline}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{item.source}</div>
              <ExternalLink size={14} style={{ color: T.gold }} />
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "timeline") {
    return (
      <div>
        <SubHeader layout={layout}>In the news</SubHeader>
        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          {items.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
              display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 12,
              alignItems: "center", textDecoration: "none", color: T.espresso,
              padding: "10px 0", borderBottom: `1px dashed ${T.border}`,
            }}>
              <div style={{ fontSize: 11, color: T.muted, fontStyle: "italic" }}>{item.date || item.source}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.espresso, lineHeight: 1.4 }}>{item.headline}</div>
              <ExternalLink size={14} style={{ color: T.gold }} />
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "letter") {
    return (
      <div style={{ marginTop: 26 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: T.muted, fontWeight: 700, marginBottom: 8 }}>Further Reading</div>
        <ul style={{ margin: 0, padding: "0 0 0 0", listStyle: "none" }}>
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: 8, fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.6, color: T.espresso }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hcdemo-letter-link">
                {item.headline}
              </a>
              <span style={{ color: T.muted, fontStyle: "italic", marginLeft: 6, fontSize: 12.5 }}>— {item.source}{item.date ? `, ${item.date}` : ""}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Card grid default
  return (
    <div>
      <SubHeader layout={layout}>In the news</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {items.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
            background: T.cream, borderLeft: `3px solid ${T.blush}`,
            borderRadius: "0 10px 10px 0", padding: "12px 14px",
            textDecoration: "none", color: T.espresso,
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            border: `1px solid ${T.border}`,
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: T.espresso, marginBottom: 4, lineHeight: 1.4 }}>{item.headline}</div>
              <div style={{ fontSize: 11.5, color: T.muted }}>{item.source}{item.date ? ` · ${item.date}` : ""}</div>
            </div>
            <ExternalLink size={16} style={{ color: T.gold, flexShrink: 0 }} aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── EXPERT QUOTE — layout-aware ────────────────────────────────
function ExpertQuote({ layout, tab }) {
  const q = QUOTES_BY_TAB[tab];
  if (!q) return null;

  if (layout === "magazine") {
    return (
      <div style={{ position: "relative", padding: "30px 24px", textAlign: "center", marginBottom: 14 }}>
        {/* Oversized decorative quote mark — opacity 0.12 */}
        <div aria-hidden="true" style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 120, lineHeight: 1, color: T.gold,
          opacity: 0.12, fontWeight: 700, pointerEvents: "none",
        }}>“</div>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: "italic", fontSize: 22, color: T.espresso, marginBottom: 12, lineHeight: 1.5, position: "relative" }}>
          {q.quote}
        </div>
        <div style={{ fontSize: 12, color: T.muted, letterSpacing: 0.4 }}>— {q.attribution}</div>
      </div>
    );
  }

  if (layout === "dashboard") {
    return (
      <div style={{ background: "#FFFFFF", border: `1px solid ${T.border}`, borderTop: `3px solid ${T.sage}`, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Stethoscope size={16} style={{ color: T.sage }} />
          <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.sage, fontWeight: 700 }}>Expert insight</div>
        </div>
        <div style={{ background: T.sageBg, padding: "12px 14px", borderRadius: 8, marginBottom: 8, fontStyle: "italic", fontSize: 14, lineHeight: 1.65, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>"{q.quote}"</div>
        <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>— {q.attribution}</div>
        <div style={{ marginTop: 8, fontSize: 11, color: T.muted, fontStyle: "italic" }}>Not a FemWell endorsement.</div>
      </div>
    );
  }

  if (layout === "timeline") {
    return (
      <div style={{ paddingLeft: 16, borderLeft: `4px solid ${T.blush}`, marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, fontWeight: 700, marginBottom: 6 }}>What the experts say</div>
        <div style={{ fontStyle: "italic", fontSize: 15, color: T.espresso, lineHeight: 1.6, marginBottom: 8, fontFamily: '"Fraunces", Georgia, serif' }}>"{q.quote}"</div>
        <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>— {q.attribution}</div>
      </div>
    );
  }

  if (layout === "letter") {
    return (
      <blockquote style={{
        margin: "22px 0 8px",
        padding: "4px 0 4px 18px",
        borderLeft: `3px solid ${T.gold}`,
        fontFamily: 'Georgia, serif',
        fontStyle: "italic",
        color: T.espresso,
        lineHeight: 1.7, fontSize: 15.5,
      }}>
        <div style={{ marginBottom: 6 }}>"{q.quote}"</div>
        <cite style={{ fontStyle: "normal", fontSize: 12.5, color: T.muted, fontWeight: 600 }}>— {q.attribution}</cite>
      </blockquote>
    );
  }

  // Card grid default
  return (
    <div>
      <SubHeader layout={layout}>What the experts say</SubHeader>
      <div style={{ background: T.blushBg, borderRadius: 12, padding: "16px 18px", marginBottom: 6, border: `1px solid ${T.border}` }}>
        <div style={{ fontStyle: "italic", fontSize: 15, color: T.espresso, lineHeight: 1.65, marginBottom: 10, fontFamily: '"Fraunces", Georgia, serif' }}>"{q.quote}"</div>
        <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>— {q.attribution}</div>
      </div>
      <div style={{ fontSize: 11, color: T.muted, fontStyle: "italic", textAlign: "center", marginBottom: 14 }}>Not a FemWell endorsement — public statements by named experts.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB COMPONENTS — each takes `layout` and threads it to Section etc.
// ═══════════════════════════════════════════════════════════════════════

// ─── OVERVIEW ─────────────────────────────────────────────────────
function OverviewTab({ layout, profile, checkins, symptoms, habits, cycle, phase, stage, isMeno }) {
  const todayKey = todayIso();
  const todayChk = checkins.find((r) => dateKeyOf(r) === todayKey);
  const moodToday  = readMood(todayChk);
  const energyToday= readEnergy(todayChk);
  const symptomsToday = symptoms.filter((r) => dateKeyOf(r) === todayKey).length;

  const today = todayLocal();
  const cut7 = new Date(today); cut7.setDate(today.getDate() - 6);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });
  const symptoms7 = since(symptoms, cut7);

  const days7 = useMemo(() => lastNDayKeys(7), []);
  const mood7   = useMemo(() => alignDays(checkins, days7, readMood),   [checkins, days7]);
  const energy7 = useMemo(() => alignDays(checkins, days7, readEnergy), [checkins, days7]);

  const jess = useMemo(
    () => buildJessOverview(since(checkins, cut7), symptoms7, since(habits, new Date(new Date(today).setDate(today.getDate() - 29))), cycle, profile, stage),
    [checkins, symptoms7, habits, cycle, profile, stage]
  );

  const cycleDay = cycle?.cycleDay ?? cycle?.dayInCycle ?? null;

  const widgets = [
    { label: isMeno ? "Stage" : "Cycle day", value: isMeno ? prettyName(stage).split("-")[0] : (cycleDay ? `Day ${cycleDay}` : "—") },
    { label: "Mood",     value: moodToday != null ? MOOD_EMOJI[Math.max(0, Math.min(4, Math.round(moodToday) - 1))] : "—" },
    { label: "Energy",   value: energyToday != null ? `${energyToday}/5` : "—" },
    { label: "Symptoms", value: String(symptomsToday) },
  ];

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="Overview"
          title="Your week in your body"
          intro={jess}
        />
      )}
      <GlanceCard layout={layout}>{jess}</GlanceCard>

      {layout === "dashboard" ? (
        <>
          <WidgetRow widgets={widgets} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
            <SparklineCard label="Mood" values={mood7} trend={trendOf(mood7)} stroke={T.blush} />
            <SparklineCard label="Energy" values={energy7} trend={trendOf(energy7)} stroke={T.sage} />
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
          {widgets.map((w, i) => <Tile key={i} {...w} />)}
        </div>
      )}

      <SubHeader layout={layout}>This week at a glance</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14, border: `1px solid ${T.border}` }}>
        <WashRow label="Mood"   values={mood7}   tint={moodTint}   />
        <WashRow label="Energy" values={energy7} tint={energyTint} />
        <div style={{ marginTop: 10, fontSize: 13, color: T.muted }}>{symptoms7.length} symptom{symptoms7.length === 1 ? "" : "s"} logged this week.</div>
      </div>

      <SubHeader layout={layout}>Log something</SubHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <PillLink to="/Today?log=symptom">+ Symptom</PillLink>
        <PillLink to="/Today?log=mood">+ Mood</PillLink>
        <PillLink to="/Today?log=sleep">+ Sleep</PillLink>
        <PillLink to="/Today?log=medication">+ Medication</PillLink>
      </div>

      <FooterDisclaimer />
    </div>
  );
}

// ─── CYCLE ────────────────────────────────────────────────────────
function CycleTab({ layout, profile, cycle, phase, stage, isMeno }) {
  const phaseContent = PHASE_CONTENT[phase] || PHASE_CONTENT.follicular;
  const day = cycle?.cycleDay ?? cycle?.dayInCycle ?? null;

  const initialOpen = isMeno ? null : DEFAULT_OPEN.cycle[phase] || null;
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const glance = isMeno
    ? `You're in ${prettyName(stage)}. Hormones fluctuate unpredictably rather than cycling — that's the central thing to know.`
    : `You're in your ${PHASE_LABEL[phase].toLowerCase()} phase${day ? `, day ${day} of ${cycle?.cycleLen || 28}` : ""}. ${
        phase === "follicular" ? "Oestrogen is rising and this is typically when you feel most energetic and clear-headed." :
        phase === "ovulatory"  ? "Oestrogen has peaked and ovulation is at hand — this is your strongest window." :
        phase === "luteal"     ? "Progesterone dominates now — your body has shifted into preparation mode." :
        "You're bleeding. Iron is dipping; rest where you can."}`;

  const dashboardWidgets = [
    { label: "Day in cycle", value: day ? String(day) : "—" },
    { label: "Phase",        value: isMeno ? prettyName(stage).split("-")[0] : PHASE_LABEL[phase] },
    { label: "Fertile window", value: isMeno ? "—" : (cycle?.cycleLen ? `${Math.floor(cycle.cycleLen * 0.43) - 2}–${Math.floor(cycle.cycleLen * 0.5) + 1}` : "—") },
    { label: "Cycle length", value: profile?.cycle_avg_length ? `${profile.cycle_avg_length}d` : "—" },
  ];

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="The Cycle Issue"
          title="Your monthly rhythm, decoded"
          intro={glance}
        />
      )}
      <GlanceCard layout={layout}>{glance}</GlanceCard>

      {layout === "dashboard" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
            {!isMeno && day && <CycleProgress day={day} length={cycle?.cycleLen || 28} />}
            <WidgetRow widgets={dashboardWidgets} />
          </div>
        </>
      )}

      <Section index={0} phase={phase} layout={layout} id="hormone-curve" title="Why you feel different across the month — the hormone curve" jessIntro="Here's something most women aren't taught about their own cycle..." open={open === "hormone-curve"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: T.muted, lineHeight: 1.6, fontFamily: '"Fraunces", Georgia, serif' }}>
          Across a typical 28-day cycle, four hormones choreograph everything your body does:
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {HORMONE_CURVE.map((row, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.gold, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 }}>{row.range}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>{row.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="fertility-signs" title="Your body's fertility signals — what cervical mucus is telling you" jessIntro="Your body actually tells you when you're fertile. Most women have never been shown the signals — here they are." open={open === "fertility-signs"} onToggle={toggle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 8 }}>Cervical mucus — your most reliable real-time indicator</div>
        <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
          {CERVICAL_MUCUS_TABLE.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, fontSize: 13.5, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
              <div style={{ fontWeight: 600 }}>{row.phase}</div>
              <div style={{ color: T.muted }}>{row.signal}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Basal body temperature (BBT)</div>
        <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.65, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          Resting temperature rises 0.2–0.5°C after ovulation due to progesterone's thermogenic effect. A clear thermal shift confirms ovulation happened — it doesn't predict it.
        </p>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>OPK — ovulation predictor kits</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          Measures LH surge. Ovulation typically follows 24–36 hours after the surge begins. PCOS can cause multiple LH surges without ovulation.
        </p>
      </Section>

      <Section layout={layout} id="cycle-health-indicators" title="What healthy looks like — and the red flags worth taking seriously" jessIntro="A healthy cycle has a fairly narrow definition. Here's what 'normal' actually means — and the patterns I'd want you to flag to a GP." open={open === "cycle-health-indicators"} onToggle={toggle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 8 }}>A healthy cycle</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {CYCLE_HEALTHY_BULLETS.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 8 }}>Red flags</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {CYCLE_RED_FLAGS.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </Section>

      <Section layout={layout} id="luteal-phase-defect" title="When your luteal phase is too short — diagnosis and support" jessIntro="If your cycles run short and you're struggling to conceive, this is something worth knowing about." open={open === "luteal-phase-defect"} onToggle={toggle}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          The luteal phase normally lasts 12–16 days. If consistently under 10 days, or if progesterone levels are low in the mid-luteal phase, this may be luteal phase defect. Symptoms: spotting before periods, short cycles, difficulty conceiving, recurrent early miscarriage. A day 21 progesterone test measures this — optimal is above 30 nmol/L.
        </p>
      </Section>

      {!isMeno && (
        <Section layout={layout} id="phase-food-movement" title={`What to eat and how to move in your ${PHASE_LABEL[phase]?.toLowerCase()} phase`} jessIntro={`Today is ${PHASE_LABEL[phase].toLowerCase()} territory — your needs are different right now than they will be next week.`} open={open === "phase-food-movement"} onToggle={toggle}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>🍽️ What to eat</div>
          <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>{phaseContent.food}</p>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>🏃‍♀️ How to move</div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>{phaseContent.movement}</p>
        </Section>
      )}

      <ExpertQuote layout={layout} tab="cycle" />
      <NewsStrip layout={layout} tab="cycle" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── LIFE STAGE ────────────────────────────────────────────────────
function LifeStageTab({ layout, profile }) {
  const initialKey = resolveLifeStageKey(profile);
  const [selected, setSelected] = useState(initialKey);
  const content = LIFE_STAGE_CONTENT[selected] || LIFE_STAGE_CONTENT.reproductive;
  const isCurrent = selected === initialKey;
  const [open, setOpen] = useState(null);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const glance = `You're in your ${LIFE_STAGE_LABEL[initialKey]?.toLowerCase() || initialKey} years. ${LIFE_STAGE_CONTENT[initialKey]?.oneliner || "Your cycle is your most important health metric."}`;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="Life Stages"
          title={LIFE_STAGE_LABEL[initialKey] || prettyName(initialKey)}
          intro={glance}
        />
      )}
      <GlanceCard layout={layout}>{glance}</GlanceCard>

      <SubHeader layout={layout}>Browse life stages · your current is highlighted</SubHeader>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8, marginBottom: 14 }}>
        {LIFE_STAGE_KEYS.map((k) => {
          const on = selected === k;
          const current = k === initialKey;
          return (
            <button key={k} onClick={() => setSelected(k)} style={{
              flexShrink: 0, scrollSnapAlign: "start",
              padding: "8px 14px", borderRadius: 999,
              background: on ? T.espresso : current ? T.goldSoft : "transparent",
              color: on ? T.cream : current ? T.gold : T.muted,
              border: current && !on ? `1px solid ${T.gold}` : "none",
              cursor: "pointer", fontSize: 12, fontWeight: on ? 700 : 500,
              whiteSpace: "nowrap",
            }}>{LIFE_STAGE_LABEL[k] || prettyName(k)}{current ? " · you" : ""}</button>
          );
        })}
      </div>

      <div style={{ background: T.jessBg, borderRadius: 14, padding: "18px 20px", marginBottom: 14, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>
          {isCurrent ? "Your current life stage" : "Browsing"}
        </div>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 28, fontWeight: 600, color: T.espresso, marginBottom: 6, letterSpacing: -0.3 }}>
          {LIFE_STAGE_LABEL[selected] || prettyName(selected)}
        </div>
        <div style={{ fontSize: 14, color: T.espresso, lineHeight: 1.55, fontFamily: '"Fraunces", Georgia, serif' }}>{content.oneliner}</div>
      </div>

      {content.sections.map((sec, i) => (
        <Section layout={layout} key={i} id={`stage-${i}`} title={sec.title} jessIntro={`Here's what matters at this stage about ${sec.title.toLowerCase()}...`} open={open === `stage-${i}`} onToggle={toggle}>
          <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{sec.body}</p>
        </Section>
      ))}

      {Array.isArray(content.redFlags) && content.redFlags.length > 0 && (
        <>
          <SubHeader layout={layout}>When to see your GP</SubHeader>
          <div style={{ background: T.blushBg, border: `1px solid ${T.blush}`, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10, fontWeight: 700 }}>These warrant a GP conversation:</div>
            <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
              {content.redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
            </ul>
          </div>
        </>
      )}

      <ExpertQuote layout={layout} tab="life-stage" />
      <NewsStrip layout={layout} tab="life-stage" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── SKIN & HAIR ───────────────────────────────────────────────────
function SkinHairTab({ layout, symptoms, phase, stage, isMeno }) {
  const phaseLabel = isMeno ? prettyName(stage) : (PHASE_LABEL[phase] || prettyName(phase));
  const initialOpen = DEFAULT_OPEN["skin-hair"][phase] || null;
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);
  const acne = useMemo(() => symptoms.filter((r) => /acne|breakout/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms]);

  const glance = isMeno
    ? "Declining oestrogen means less collagen and natural oil. Hyaluronic acid, ceramides, and daily SPF are the highest-impact interventions."
    : phase === "follicular"
      ? "In the follicular phase, your skin's collagen production is supported by rising oestrogen. It's your best window for active ingredients like retinol."
      : phase === "luteal"
        ? "Progesterone is increasing sebum and shifting your skin barrier. Stick to a gentler, barrier-focused routine and resist introducing new actives."
        : phase === "menstrual"
          ? "Your skin is most sensitive now. Barrier-focused care, no new actives."
          : "Skin is often at its best around ovulation. Maintain your routine.";

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="Skin & Hair"
          title="Your skin is an endocrine organ"
          intro={glance}
        />
      )}
      <GlanceCard layout={layout}>{glance}</GlanceCard>

      <Section index={0} phase={phase} layout={layout} id="how-hormones-skin" title="How hormones control your skin — the mechanism" jessIntro="Your skin is an endocrine organ. Once you understand that, your routine changes." open={open === "how-hormones-skin"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{HORMONES_CONTROL_SKIN}</p>
      </Section>

      <Section layout={layout} id="hormonal-acne" title="Why you break out before your period — and what actually works" jessIntro="Hormonal acne is genuinely different from teenage acne. Here's why standard advice often fails for it." open={open === "hormonal-acne"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {HORMONAL_ACNE_CONTENT.map((c, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.blush}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{c.title}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="phase-skincare" title="Your phase-synced skincare protocol" jessIntro="Your cycle day matters more than you might think for what you put on your face." open={open === "phase-skincare"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {(isMeno ? [["meno", phaseLabel, "Hyaluronic acid serums, barrier-supporting moisturisers (ceramides), and daily SPF are the highest-impact interventions."]] : ["menstrual", "follicular", "ovulatory", "luteal"].map((p) => [p, PHASE_LABEL[p], PHASE_SKIN_PROTOCOL[p]])).map(([p, lbl, body]) => (
            <div key={p} style={{ border: !isMeno && p === phase ? `2px solid ${T.gold}` : `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }} aria-hidden="true">{isMeno ? "🌿" : PHASE_EMOJI[p]}</span>
                <strong style={{ fontSize: 14, color: T.espresso }}>{lbl}{!isMeno && p === phase ? " · Now" : ""}</strong>
              </div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: T.espresso }}>{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="hair-science" title="Hair science — cycles, postpartum shedding, DHT, ferritin" jessIntro="I want to tell you what the research actually says about ferritin and hair loss." open={open === "hair-science"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {HAIR_SCIENCE.map((h, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.sage}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{h.title}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{h.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="acne-tracker" title={`Your hormonal acne this month — ${acne.length} ${acne.length === 1 ? "entry" : "entries"}`} jessIntro={`I'm seeing ${acne.length} breakout ${acne.length === 1 ? "entry" : "entries"} this month — here's what that pattern is telling me.`} open={open === "acne-tracker"} onToggle={toggle}>
        <p style={{ margin: 0, padding: "10px 12px", background: T.blushBg, borderLeft: `3px solid ${T.blush}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.6, color: T.espresso, borderRadius: "0 8px 8px 0" }}>
          {acne.length >= 3
            ? "That's a pattern, not noise. Consider a salicylic acid serum from day 14 and discuss a GP referral if it's impacting quality of life."
            : "Keep tracking. Hormonal acne tends to cluster in the luteal phase — patterns become clear over 2–3 cycles."}
        </p>
      </Section>

      <Section layout={layout} id="supplements" title="Supplement evidence — zinc, omega-3, biotin, GLA, vitamin C" jessIntro="Some of these have real evidence. Some don't. Here's what's worth your money." open={open === "supplements"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {SKIN_HAIR_SUPPLEMENTS.map((s) => (
            <div key={s.name} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 14, color: T.espresso }}>{s.name}</strong>
                <span style={{ fontSize: 12, color: T.muted }}>{s.benefit}</span>
              </div>
              <div style={{ fontSize: 13, color: T.espresso, lineHeight: 1.6, fontFamily: '"Fraunces", Georgia, serif' }}>{s.note}</div>
            </div>
          ))}
        </div>
      </Section>

      <ExpertQuote layout={layout} tab="skin-hair" />
      <NewsStrip layout={layout} tab="skin-hair" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── BODY ──────────────────────────────────────────────────────────
function BodyTab({ layout, symptoms, phase, isMeno }) {
  const today = todayLocal();
  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });
  const symptoms30 = since(symptoms, cut30);
  const ranked = useMemo(() => {
    const counts = new Map();
    for (const r of symptoms30) {
      const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [symptoms30]);
  const topKey = ranked[0]?.[0];
  const topNote = topKey ? (SYMPTOM_NOTES[String(topKey).toLowerCase()] || fallbackSymptomNote(topKey))
                          : "Nothing logged this month yet. Track on /Today and I'll start to see the pattern.";

  const days30 = useMemo(() => lastNDayKeys(30), []);
  const symptomCountsByDay = useMemo(() => {
    const m = new Map(days30.map((d) => [d, { count: 0, severe: false }]));
    for (const r of symptoms30) {
      const k = dateKeyOf(r); if (!m.has(k)) continue;
      const e = m.get(k); e.count++; if (severityIsSerious(r?.severity)) e.severe = true;
    }
    return days30.map((d) => m.get(d));
  }, [symptoms30, days30]);

  const initialOpen = DEFAULT_OPEN.body[phase] || "symptom-intro";
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const symptomsToday = symptoms.filter((r) => dateKeyOf(r) === todayIso()).length;
  const glance = symptomsToday > 0
    ? `${symptomsToday} symptom${symptomsToday === 1 ? "" : "s"} logged today.`
    : `No logged symptoms today. Your body's inflammation is typically lowest in the ${phase} phase.`;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="Body"
          title="Symptoms as signals"
          intro={glance}
        />
      )}
      <GlanceCard layout={layout}>{glance}</GlanceCard>

      <Section index={0} phase={phase} layout={layout} id="symptom-intro" title="Understanding your symptoms — what to look for in patterns" jessIntro="Symptoms aren't inconveniences. They're signals — and the pattern matters more than any single day." open={open === "symptom-intro"} onToggle={toggle}>
        <p style={{ margin: "0 0 10px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          Symptoms are signals. When you log consistently over 2–3 cycles, patterns emerge that can be genuinely diagnostic.
        </p>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          <li><strong>Perimenstrual cluster:</strong> symptoms 7–10 days before your period point toward progesterone sensitivity or PMDD.</li>
          <li><strong>Mid-cycle spike:</strong> symptoms at ovulation may include mittelschmerz, mood sensitivity, or digestive changes.</li>
          <li><strong>Constant symptoms:</strong> present regardless of phase — point to thyroid, anaemia, or non-hormonal causes.</li>
        </ul>
      </Section>

      <Section layout={layout} id="ranked-symptoms" title={`Top symptoms this month — ${ranked.length === 0 ? "nothing logged" : ranked.slice(0, 3).map(([k, n]) => `${prettyName(k)} (${n})`).join(", ")}`} jessIntro="Here's what your data is telling me about this month..." open={open === "ranked-symptoms"} onToggle={toggle}>
        {ranked.length === 0
          ? <div style={{ fontSize: 13.5, color: T.muted }}>Nothing logged yet this month — track on /Today.</div>
          : <ol style={{ margin: 0, padding: "0 0 0 18px", listStyle: "decimal", color: T.espresso, fontSize: 14.5, lineHeight: 1.9 }}>
              {ranked.map(([sym, n]) => <li key={sym}><strong>{prettyName(sym)}</strong> — {n} time{n === 1 ? "" : "s"} this month</li>)}
            </ol>}
        {topKey && (
          <p style={{ margin: "14px 0 0", padding: "12px 14px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{topNote}</p>
        )}
      </Section>

      <Section layout={layout} id="symptom-calendar" title="Your symptom calendar — last 30 days" jessIntro="Your 30-day load at a glance — darker means heavier." open={open === "symptom-calendar"} onToggle={toggle}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {symptomCountsByDay.map((e, i) => (
            <div key={i} title={`${days30[i]} · ${e.count} log${e.count === 1 ? "" : "s"}${e.severe ? " · severe" : ""}`}
              style={{ aspectRatio: "1", borderRadius: 6,
                background: e.count === 0 ? "transparent" : e.severe ? T.blushDeep : e.count >= 3 ? T.blush : T.blushLight,
                border: e.count === 0 ? `1px solid ${T.border}` : "none" }} />
          ))}
        </div>
      </Section>

      {isMeno && (
        <Section layout={layout} id="hot-flash-physiology" title="Hot flash physiology — why it actually happens" jessIntro="Here's the actual mechanism behind a hot flash, which most women aren't told." open={open === "hot-flash-physiology"} onToggle={toggle}>
          <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{HOT_FLASH_PHYSIOLOGY}</p>
        </Section>
      )}

      <Section layout={layout} id="pcos" title="PCOS — more than irregular periods" jessIntro="PCOS isn't just about cysts. It's a metabolic and hormonal pattern — and it's far more common than diagnosis rates suggest." open={open === "pcos"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{PCOS_CONTENT.intro}</p>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {PCOS_CONTENT.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <p style={{ margin: 0, padding: "10px 12px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{PCOS_CONTENT.driver}</p>
      </Section>

      <Section layout={layout} id="endometriosis" title="Endometriosis — the delayed-diagnosis condition" jessIntro="If your period pain is severe or you have pain outside your period — this is what I'd want you to know." open={open === "endometriosis"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{ENDO_CONTENT.intro}</p>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {ENDO_CONTENT.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <p style={{ margin: 0, padding: "10px 12px", background: T.blushBg, borderLeft: `3px solid ${T.blush}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{ENDO_CONTENT.diagnosis}</p>
      </Section>

      <Section layout={layout} id="pmdd" title="When PMS becomes something more — understanding PMDD" jessIntro="PMDD isn't bad PMS. It's a biological condition with effective treatment." open={open === "pmdd"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{PMDD_CONTENT}</p>
      </Section>

      <ExpertQuote layout={layout} tab="body" />
      <NewsStrip layout={layout} tab="body" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── MIND ──────────────────────────────────────────────────────────
function MindTab({ layout, checkins, symptoms, phase, stage }) {
  const today = todayLocal();
  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });
  const checkins30 = since(checkins, cut30);
  const symptoms30 = since(symptoms, cut30);
  const days30 = useMemo(() => lastNDayKeys(30), []);
  const days14 = useMemo(() => lastNDayKeys(14), []);
  const mood30   = useMemo(() => alignDays(checkins30, days30, readMood),   [checkins30, days30]);
  const energy30 = useMemo(() => alignDays(checkins30, days30, readEnergy), [checkins30, days30]);
  const sleep14  = useMemo(() => alignDays(checkins, days14, (r) => r?.sleep_hours != null ? Number(r.sleep_hours) : null), [checkins, days14]);
  const sleepAvg = avg(sleep14);
  const brainFog = useMemo(() => symptoms30.filter((r) => /brain_fog|foggy|brain fog/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms30]);

  const initialOpen = DEFAULT_OPEN.mind[phase] || "cognition-by-phase";
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const glance = phase === "follicular"
    ? "Follicular phase: verbal memory and focus are at their peak. This is your best window for deep work and complex conversations."
    : phase === "ovulatory"
      ? "Ovulatory phase: spatial reasoning and coordination peak."
      : phase === "luteal"
        ? "Luteal phase: detail-oriented focus improves, but late-luteal can bring dips in attention."
        : "Menstrual phase: cognition often returns to baseline as oestrogen rebuilds.";

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="Mind"
          title="Your brain across the month"
          intro={glance}
        />
      )}
      <GlanceCard layout={layout}>{glance}</GlanceCard>

      {layout === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
          <SparklineCard label="Mood (30d)"   values={mood30}   trend={trendOf(mood30)}   stroke={T.blush} />
          <SparklineCard label="Energy (30d)" values={energy30} trend={trendOf(energy30)} stroke={T.sage} />
          <SparklineCard label="Sleep (14d)"  values={sleep14}  trend={trendOf(sleep14)}  stroke={T.gold} suffix="h" />
        </div>
      )}

      <Section index={0} phase={phase} layout={layout} id="oestrogen-brain" title="Oestrogen and your brain — the receptor map" jessIntro="Oestrogen receptors are literally in your brain tissue — here's where, and what it means." open={open === "oestrogen-brain"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{OESTROGEN_BRAIN}</p>
      </Section>

      <Section layout={layout} id="cognition-by-phase" title="Your cognitive peaks across the month" jessIntro="Your brain isn't the same every day. Here's how it shifts." open={open === "cognition-by-phase"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {COGNITION_BY_PHASE.map((c, i) => (
            <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{c.phase}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: T.espresso }}>{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="hpa-hpg" title="Why stress disrupts your cycle — the HPA–HPG axis" jessIntro="Chronic stress shows up in your cycle for a specific physiological reason." open={open === "hpa-hpg"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{HPA_HPG}</p>
      </Section>

      <Section layout={layout} id="mood-energy-30" title="Your mood and energy texture · last 30 days" jessIntro="Here's the past month at a glance." open={open === "mood-energy-30"} onToggle={toggle}>
        <SubHeader layout={layout}>Mood</SubHeader>
        <WashGrid values={mood30} days={days30} tint={moodTint} caption="Your emotional texture over 30 days." />
        <SubHeader layout={layout}>Energy</SubHeader>
        <WashGrid values={energy30} days={days30} tint={energyTint} caption="Your energy texture over 30 days." />
      </Section>

      <Section layout={layout} id="sleep-14" title={`Your sleep · 14-day chart · avg ${sleepAvg != null ? `${sleepAvg.toFixed(1)}h` : "—"}`} jessIntro="Sleep is the single biggest lever for mood and cognition. Here's your last 2 weeks." open={open === "sleep-14"} onToggle={toggle}>
        <svg viewBox="0 0 280 80" style={{ width: "100%", height: 90 }}>
          {sleep14.map((h, i) => {
            const x = 4 + i * 20;
            const height = h != null ? Math.max(4, Math.min(60, (h / 10) * 60)) : 0;
            const y = 70 - height;
            const fill = h == null ? "none" : h >= 7 ? T.sage : h >= 5 ? T.gold : T.blushLight;
            return <rect key={i} x={x} y={y} width={16} height={height || 4} fill={fill} stroke={h == null ? T.border : "none"} strokeDasharray="2 2" rx={3} />;
          })}
          <line x1={4} y1={70} x2={276} y2={70} stroke={T.border} strokeWidth={1} />
        </svg>
        <div style={{ marginTop: 8, fontSize: 13, color: T.muted }}>sage ≥7h · gold 5–7h · blush &lt;5h</div>
      </Section>

      <Section layout={layout} id="sleep-cycle" title="Sleep and your cycle — progesterone, GABA, and night sweats" jessIntro="Why your sleep changes across your cycle — and what to do about it." open={open === "sleep-cycle"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{SLEEP_CYCLE}</p>
      </Section>

      <Section layout={layout} id="pmdd-neurosteroid" title="PMDD and the neurosteroid mechanism — why intermittent SSRIs work" jessIntro="The science of PMDD is fascinating — and it changes the treatment approach." open={open === "pmdd-neurosteroid"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          In PMDD, progesterone converts to allopregnanolone, which normally calms via GABA-A receptors but appears paradoxically dysregulating in PMDD. SSRIs taken only in the luteal phase (day 14 to menstruation) are first-line and highly effective.
        </p>
      </Section>

      <Section layout={layout} id="stress-stage" title="Mental health · for your stage" jessIntro="What mental health looks like for your specific stage." open={open === "stress-stage"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          {stage === "perimenopause" || stage === "menopause"
            ? "Anxiety and mood changes are among the most underdiagnosed perimenopause symptoms. Oestrogen plays a key role in serotonin regulation. Many women are prescribed antidepressants when HRT would be more appropriate — advocate for yourself."
            : stage === "postpartum"
              ? "Postnatal depression affects 1 in 5 women and can develop up to a year after birth. Baby blues are normal; persistent low mood, anxiety, or intrusive thoughts warrant immediate GP contact."
              : "Luteal phase mood changes are driven by progesterone's effect on GABA and serotonin. If severe every cycle, PMDD may be worth exploring with a GP."}
        </p>
      </Section>

      <Section layout={layout} id="nervous-system" title="Nervous system regulation — techniques that actually work" jessIntro="Four techniques with real physiological mechanisms — useful for anxious days." open={open === "nervous-system"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {NS_REGULATION.map((n, i) => (
            <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{n.title}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: T.espresso }}>{n.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="brain-fog" title={`Brain fog this month — ${brainFog.length} day${brainFog.length === 1 ? "" : "s"} logged`} jessIntro="Your brain fog count from your logs." open={open === "brain-fog"} onToggle={toggle}>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 24, fontWeight: 600, color: T.gold, marginBottom: 4 }}>{brainFog.length}</div>
        <div style={{ fontSize: 13, color: T.muted }}>brain fog days logged in the last 30 days</div>
      </Section>

      <ExpertQuote layout={layout} tab="mind" />
      <NewsStrip layout={layout} tab="mind" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── NOURISHMENT ───────────────────────────────────────────────────
function NourishmentTab({ layout, checkins, meals, phase, isMeno }) {
  const initialOpen = DEFAULT_OPEN.nourishment[phase] || "phase-nutrition";
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const glance = phase === "follicular"
    ? "Today: support oestrogen metabolism with cruciferous vegetables (broccoli, kale) — their DIM compound helps the liver process oestrogen via the protective pathway."
    : phase === "ovulatory"
      ? "Today: prioritise zinc-rich foods (pumpkin seeds, chickpeas) to support progesterone for your upcoming luteal phase."
      : phase === "luteal"
        ? "Today: protein at every meal stabilises blood sugar better than any other macronutrient."
        : "Today: iron-rich foods replenish what's been lost. Pair with vitamin C to triple absorption.";

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="Nourishment"
          title="Eat with your cycle"
          intro={glance}
        />
      )}
      <GlanceCard layout={layout}>{glance}</GlanceCard>

      <Section index={0} phase={phase} layout={layout} id="phase-nutrition" title="Phase nutrition — the why behind the what" jessIntro="Your nutritional needs shift every phase — here's the mechanism, not just the list." open={open === "phase-nutrition"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {["menstrual", "follicular", "ovulatory", "luteal"].map((p) => (
            <div key={p} style={{ border: !isMeno && p === phase ? `2px solid ${T.gold}` : `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }} aria-hidden="true">{PHASE_EMOJI[p]}</span>
                <strong style={{ fontSize: 14, color: T.espresso }}>{PHASE_LABEL[p]}{!isMeno && p === phase ? " · Now" : ""}</strong>
              </div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: T.espresso }}>{PHASE_NUTRITION_WHY[p]}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="estrobolome" title="The estrobolome — your gut-hormone axis" jessIntro="Your gut bacteria directly regulate your oestrogen. Here's how, and what supports it." open={open === "estrobolome"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{ESTROBOLOME}</p>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>What disrupts the estrobolome</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {ESTROBOLOME_DISRUPT.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>What supports it</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {ESTROBOLOME_SUPPORT.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </Section>

      <Section layout={layout} id="seed-cycling" title="Seed cycling — protocol and mechanism" jessIntro="The theory behind seed cycling and how to actually do it." open={open === "seed-cycling"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {SEED_CYCLING.map((s, i) => (
            <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{s.phase}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: T.espresso }}>{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="blood-sugar" title="Blood sugar and your luteal phase" jessIntro="Why luteal cravings happen — and how to ride them rather than crash through them." open={open === "blood-sugar"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{BLOOD_SUGAR_LUTEAL}</p>
      </Section>

      <Section layout={layout} id="edcs" title="Endocrine disruptors — practical swaps" jessIntro="The reasonable, achievable changes that have evidence — not the panic-inducing list." open={open === "edcs"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.muted }}>
          Reducing high-exposure sources is practical and achievable. Perfection isn't necessary.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {EDC_LIST.map((e) => (
            <div key={e.name} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <strong style={{ fontSize: 14, color: T.espresso }}>{e.name}</strong>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}><strong>Found in:</strong> {e.found}</div>
              <div style={{ fontSize: 13, color: T.espresso, marginTop: 4, fontFamily: '"Fraunces", Georgia, serif' }}><strong>Swap:</strong> {e.swap}</div>
            </div>
          ))}
        </div>
      </Section>

      <ExpertQuote layout={layout} tab="nourishment" />
      <NewsStrip layout={layout} tab="nourishment" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── CARE ──────────────────────────────────────────────────────────
function CareTab({ layout, profile, symptoms, meds, stage, isMeno, phase }) {
  const today = todayLocal();
  const cut14 = new Date(today); cut14.setDate(today.getDate() - 13);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });
  const meds14 = since(meds, cut14);
  const medsByName = useMemo(() => {
    const m = new Map();
    for (const r of meds14) {
      const name = r?.medication_name || r?.med_name || r?.name; if (!name) continue;
      const k = dateKeyOf(r); if (!k) continue;
      if (!m.has(name)) m.set(name, { days: new Set(), last: k });
      const e = m.get(name); e.days.add(k); if (k > e.last) e.last = k;
    }
    return Array.from(m.entries()).map(([name, v]) => ({ name, days: v.days, adherence: Math.round((v.days.size / 14) * 100), last: v.last }));
  }, [meds14]);
  const days14 = useMemo(() => lastNDayKeys(14), []);

  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const symptoms30 = since(symptoms, cut30);
  const toDiscuss = useMemo(() => buildGPDiscussionList(symptoms30, profile, stage, isMeno), [symptoms30, profile, stage, isMeno]);

  const initialOpen = DEFAULT_OPEN.care[phase] || "blood-tests";
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const glance = `Based on your life stage — ${toDiscuss.length === 0 ? "no urgent care reminders" : `${toDiscuss.length} item${toDiscuss.length === 1 ? "" : "s"} flagged for your next GP visit`}. Cervical screening is on the NHS schedule from age 25.`;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {layout === "magazine" && (
        <MagazineHero
          kicker="Care"
          title="How to be heard in 10 minutes"
          intro={glance}
        />
      )}
      <GlanceCard layout={layout}>{glance}</GlanceCard>

      <Section index={0} phase={phase} layout={layout} id="blood-tests" title="Blood tests every woman should know — ask by name" jessIntro="These aren't included by default in most NHS panels. Ask for them by name." open={open === "blood-tests"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {BLOODS_CORE.map((b) => (
            <div key={b.name} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, background: T.cream }}>
              <strong style={{ fontSize: 14, color: T.espresso }}>{b.name}</strong>
              <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: T.espresso }}>{b.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="hormonal-panel" title="Hormonal panel — by life stage" jessIntro="What to test, and when, for your specific stage." open={open === "hormonal-panel"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {BLOODS_HORMONAL.map((b) => (
            <div key={b.name} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
              <strong style={{ fontSize: 14.5, color: T.espresso }}>{b.name}</strong>
              <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>{b.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="range-vs-optimal" title="How to read your results — range vs optimal" jessIntro="There's a difference between 'normal' on a lab report and 'optimal' for how you feel." open={open === "range-vs-optimal"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          Labs report a 'reference range' — the range seen in 95% of tested people, not the range for optimal function.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 8, fontSize: 12.5, color: T.muted, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
          <div>Test</div><div>Lab range</div><div>Optimal</div>
        </div>
        {RANGE_VS_OPTIMAL.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 8, fontSize: 13.5, color: T.espresso, padding: "6px 0", borderBottom: i === RANGE_VS_OPTIMAL.length - 1 ? "none" : `1px solid ${T.border}`, fontFamily: '"Fraunces", Georgia, serif' }}>
            <div style={{ fontWeight: 600 }}>{r.test}</div>
            <div style={{ color: T.muted }}>{r.range}</div>
            <div>{r.optimal}</div>
          </div>
        ))}
      </Section>

      <Section layout={layout} id="hrt-conversation" title="HRT — how to have the conversation with your GP" jessIntro="If you think you might be perimenopausal — here's how to walk in prepared." open={open === "hrt-conversation"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {HRT_CONVERSATION.map((h, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
              <strong style={{ fontSize: 14, color: T.espresso }}>{h.title}</strong>
              <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{h.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section layout={layout} id="supplement-stacking" title="Supplement stacking — what goes together, what doesn't" jessIntro="What you take together matters as much as what you take." open={open === "supplement-stacking"} onToggle={toggle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Take separately</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {SUPP_STACK_SEPARATE.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Synergistic combinations</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {SUPP_STACK_SYNERGY.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Timing</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {SUPP_TIMING.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </Section>

      <Section layout={layout} id="gp-prep" title="GP appointment prep — how to be heard in 10 minutes" jessIntro="The average GP appointment is 10 minutes. How you walk in determines what you get out." open={open === "gp-prep"} onToggle={toggle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Come with</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {GP_APPT_BRING.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Language that helps</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {GP_APPT_LANGUAGE.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </Section>

      <Section layout={layout} id="meds-adherence" title={`Your medications · last 14 days · ${medsByName.length} tracked`} jessIntro="Your current adherence at a glance." open={open === "meds-adherence"} onToggle={toggle}>
        {medsByName.length === 0
          ? <div style={{ fontSize: 13.5, color: T.muted }}>No medications logged in the last 14 days.</div>
          : (
            <div style={{ display: "grid", gap: 10 }}>
              {medsByName.map((m) => (
                <div key={m.name} style={{ background: T.cream, borderRadius: 10, padding: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong style={{ fontSize: 14.5, color: T.espresso }}>{prettyName(m.name)}</strong>
                    <span style={{ fontSize: 12, fontWeight: 600, color: m.adherence >= 80 ? T.sage : m.adherence >= 50 ? T.gold : T.muted }}>{m.adherence}% adherence</span>
                  </div>
                  <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                    {days14.map((d, i) => (
                      <div key={i} title={d} style={{
                        flex: 1, height: 10, borderRadius: 2,
                        background: m.days.has(d) ? T.sage : "transparent",
                        border: m.days.has(d) ? "none" : `1px solid ${T.border}`,
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>Last logged: {m.last}</div>
                </div>
              ))}
            </div>
          )}
      </Section>

      <Section layout={layout} id="to-discuss" title={`Things to discuss with your GP — ${toDiscuss.length} from your data`} jessIntro="Items I'd bring to your next appointment based on what I'm seeing." open={open === "to-discuss"} onToggle={toggle}>
        {toDiscuss.length === 0
          ? <div style={{ fontSize: 13.5, color: T.espresso }}>Nothing's flagging right now. If you have new or changing symptoms, log them and check back.</div>
          : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {toDiscuss.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i === toDiscuss.length - 1 ? 0 : 10 }}>
                  <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 3, width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${T.espresso}`, background: "#FFFFFF" }} />
                  <div style={{ fontSize: 14, color: T.espresso, lineHeight: 1.55, fontFamily: '"Fraunces", Georgia, serif' }}>{item}</div>
                </li>
              ))}
            </ul>
          )}
      </Section>

      <SubHeader layout={layout}>GP-ready summary</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <FileText className="w-5 h-5" style={{ marginTop: 2, color: T.gold }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 14, color: T.espresso }}>Generate your health summary for your GP</strong>
            <div style={{ marginTop: 4, fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
              A structured PDF of your symptoms, medications, sleep and mood.
            </div>
            <Link to="/DoctorExport" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 10, padding: "8px 14px", borderRadius: 999,
              background: T.espresso, color: T.cream, textDecoration: "none", fontSize: 13, fontWeight: 600,
            }}>Generate report <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>

      {isMeno && (
        <Link to="/LifeStageCare" style={{ display: "block", background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", textDecoration: "none", color: T.espresso, marginBottom: 14, border: `1px solid ${T.border}` }}>
          <strong style={{ fontSize: 14 }}>Take the MRS questionnaire →</strong>
          <div style={{ marginTop: 4, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
            A validated 11-symptom questionnaire to score your menopause symptom burden.
          </div>
        </Link>
      )}

      <ExpertQuote layout={layout} tab="care" />
      <NewsStrip layout={layout} tab="care" />
      <FooterDisclaimer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SHARED SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function DemoPill() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 11px", borderRadius: 999,
        background: T.goldSoft, color: T.gold,
        fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
        border: `1px solid ${T.gold}`,
      }}>
        <Sparkles className="w-3 h-3" /> Health Corner v4.1 · letter + visual assets
      </span>
      <span style={{ color: "#9B8B7A", fontSize: 12 }}>Magazine · Card Grid · Timeline · Dashboard · Letter</span>
    </div>
  );
}
function canvasStyle(layout = "card-grid") {
  const bg = LAYOUT_BG[layout] || T.paper;
  const bgSize = LAYOUT_BG_SIZE[layout];
  return {
    background: bg,
    backgroundSize: bgSize,
    color: T.espresso, borderRadius: 18,
    overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
    border: `1px solid rgba(212,175,55,0.22)`,
    fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
  };
}
function Tile({ icon, label, value }) {
  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      borderRadius: 12, padding: 14,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      border: `1px solid ${T.border}`,
    }}>
      {icon && <div style={{ fontSize: 22 }} aria-hidden="true">{icon}</div>}
      <div style={{ fontSize: 17, fontWeight: 700, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10.5, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
function WashRow({ label, values, tint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <div style={{ width: 52, fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {values.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: 18, borderRadius: 4,
            background: v == null ? "transparent" : tint(v),
            border: v == null ? `1px dashed ${T.border}` : "none",
          }} title={v == null ? "No log" : `${label} ${v}`} />
        ))}
      </div>
    </div>
  );
}
function WashGrid({ values, days, tint, caption }) {
  return (
    <div style={{ background: T.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 3 }}>
        {values.map((v, i) => (
          <div key={i} title={`${days[i]} · ${v ?? "no log"}`} style={{
            aspectRatio: "1", borderRadius: 3, minHeight: 12,
            background: v == null ? "transparent" : tint(v),
            border: v == null ? `1px dashed ${T.border}` : "none",
          }} />
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 12.5, color: T.muted, fontStyle: "italic" }}>{caption}</div>
    </div>
  );
}
function PillLink({ to, children }) {
  return (
    <Link to={to} style={{
      display: "inline-flex", alignItems: "center",
      padding: "8px 14px", borderRadius: 999,
      background: "transparent", color: T.espresso, fontSize: 13, fontWeight: 600,
      textDecoration: "none", border: `1.5px solid ${T.espresso}`,
    }}>{children}</Link>
  );
}
function FooterDisclaimer() {
  return (
    <div style={{
      marginTop: 10, padding: "10px 12px",
      fontSize: 11, color: T.muted, fontStyle: "italic",
      textAlign: "center",
    }}>
      Not medical advice — this is educational information only. Always discuss your symptoms and treatment with a qualified clinician.
    </div>
  );
}
function ReviewerNote({ children }) {
  return (
    <div style={{
      marginTop: 14, padding: "12px 14px",
      background: T.goldSoft, border: `1px dashed rgba(212,175,55,0.45)`,
      borderRadius: 10, fontSize: 12.5, lineHeight: 1.6, color: "#C4B69E",
    }}>
      <strong style={{ color: T.gold }}>Notes for review:</strong> {children}
    </div>
  );
}

// ─── Data helpers ─────────────────────────────────────────────────────
function alignDays(rows, days, read) {
  const m = new Map(days.map((k) => [k, null]));
  for (const r of rows) {
    const k = dateKeyOf(r); const v = read(r);
    if (m.has(k) && v != null) m.set(k, v);
  }
  return days.map((k) => m.get(k));
}

function buildJessOverview(checkins7, symptoms7, habits30, cycle, profile, stage) {
  const mood7 = avg(checkins7.map(readMood));
  const sleep7 = avg(checkins7.map((r) => r?.sleep_hours != null ? Number(r.sleep_hours) : null));
  const counts = new Map();
  for (const r of symptoms7) {
    const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  const parts = [];
  if (top && top[1] >= 3) parts.push(`Your ${prettyName(top[0]).toLowerCase()} has been more frequent this week — ${top[1]} in 7 days.`);
  else if (mood7 != null && mood7 <= 2) parts.push(`Your mood has been low this week — I've noticed.`);
  else if (mood7 != null && mood7 >= 4) parts.push(`Your mood has been bright this week. I want to name that.`);
  else parts.push(`Your week has been steady — no alarms on my watch.`);
  if (sleep7 != null && sleep7 >= 7) parts.push(`On the upside, your sleep has averaged ${sleep7.toFixed(1)} hours which is restorative.`);
  else if (habits30.length >= 10) parts.push(`On the upside, you've logged ${habits30.length} habit completions this month.`);
  if (MENO_STAGES.has(stage)) parts.push(`Your symptoms may not follow a predictable rhythm — that's the nature of this stage.`);
  else if (cycle?.phase === "follicular") parts.push(`You're in your follicular phase — energy should climb over the next few days.`);
  else if (cycle?.phase === "ovulatory")  parts.push(`Your strongest window.`);
  else if (cycle?.phase === "luteal")     parts.push(`Luteal phase — slowing down is what your body is asking for.`);
  else if (cycle?.phase === "menstrual")  parts.push(`On your period — be gentle with yourself.`);
  return parts.join(" ");
}

function buildGPDiscussionList(symptoms30, profile, stage, isMeno) {
  const counts = new Map();
  for (const r of symptoms30) {
    const k = String(r?.symptom_type || r?.symptom_name || "").toLowerCase(); if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const out = [];
  if ((counts.get("hot_flash") || 0) >= 7 || (counts.get("hot flash") || 0) >= 7) {
    out.push("Frequency and severity of hot flashes — bring counts and trigger patterns.");
  }
  if ((counts.get("brain_fog") || 0) >= 3 || (counts.get("brain fog") || 0) >= 3) {
    out.push("Cognitive changes — frequency and impact on daily functioning.");
  }
  if ((counts.get("cramps") || 0) >= 4 || (counts.get("cramping") || 0) >= 4) {
    out.push("Severe cyclical pain that isn't well-controlled with usual measures.");
  }
  if (isMeno && stage === "perimenopause" && !out.length) {
    out.push("Whether HRT is appropriate for your symptom profile.");
  }
  if (profile?.cycle_max_length && profile?.cycle_min_length && (profile.cycle_max_length - profile.cycle_min_length) > 7) {
    out.push("Cycle regularity — variation greater than 7 days month to month.");
  }
  return out.slice(0, 3);
}
