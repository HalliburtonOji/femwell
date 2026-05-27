// ─────────────────────────────────────────────────────────────────────────────
// HealthCornerDemo — single FoundersOS tab opening a fully tabbed Health
// Corner hub with 8 inner tabs:
//
//   Overview · Cycle · Life Stage · Skin & Hair · Body · Mind ·
//   Nourishment · Care
//
// v3 (2026-05-27) — structural upgrade. v2 content is preserved verbatim;
// information architecture is upgraded with:
//
//   - Sticky phase context bar beneath the tab pill rail
//   - 3-tier progressive disclosure (Glance / Scan / Deep dive)
//   - Accordion sections with single-expand + phase-smart defaults
//   - Horizontal scroll-snap carousels for short-form sets of cards
//   - "In the news" static curated links at the bottom of each tab
//   - One "What the experts say" attributed quote per tab
//
// Data is fetched once at the FoundersOS level and passed in as props.
// All copy is educational; each tab carries a small footer disclaimer.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles, FileText, ChevronRight, ChevronDown, ExternalLink } from "lucide-react";

// ─── Tokens ──────────────────────────────────────────────────────────
const T = {
  cream:     "#F4EDDB",
  paper:     "#FBF6E6",
  jessBg:    "#EDE5CC",
  espresso:  "#3A2C1A",
  espressoDk:"#2A1E0E",
  muted:     "#9B8B7A",
  mutedSoft: "#B5A998",
  border:    "#D4C9B4",
  gold:      "#D4AF37",
  goldSoft:  "rgba(212,175,55,0.16)",
  sage:      "#8FAF8F",
  sageBg:    "rgba(143,175,143,0.18)",
  blush:     "#E8B4B8",
  blushBg:   "rgba(232,180,184,0.22)",
  blushLight:"#F0CACA",
  blushDeep: "#D4909A",
};

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
  teen: "Teen",
  reproductive: "Reproductive",
  "pre-ttc": "Pre-conception",
  ttc: "Trying to conceive",
  "pregnant-t1": "Pregnant · T1",
  "pregnant-t2": "Pregnant · T2",
  "pregnant-t3": "Pregnant · T3",
  pregnancy: "Pregnant",
  postpartum: "Postpartum",
  perimenopause: "Perimenopause",
  menopause: "Menopause",
  "post-menopause": "Post-menopause",
};
const LIFE_STAGE_KEYS = [
  "teen", "reproductive", "pre-ttc", "ttc",
  "pregnant-t1", "pregnant-t2", "pregnant-t3",
  "postpartum", "perimenopause", "menopause", "post-menopause",
];

// Phase-smart default open section per tab — v3 progressive disclosure.
const DEFAULT_OPEN = {
  cycle: {
    menstrual:  "cycle-health-indicators",
    follicular: "fertility-signs",
    ovulatory:  "fertility-signs",
    luteal:     "luteal-phase-defect",
  },
  "skin-hair": {
    menstrual:  "phase-skincare",
    follicular: "phase-skincare",
    ovulatory:  "hormonal-acne",
    luteal:     "hormonal-acne",
  },
  mind: {
    menstrual:  "nervous-system",
    follicular: "cognition-by-phase",
    ovulatory:  "cognition-by-phase",
    luteal:     "pmdd-neurosteroid",
  },
  nourishment: {
    menstrual:  "phase-nutrition",
    follicular: "phase-nutrition",
    ovulatory:  "estrobolome",
    luteal:     "blood-sugar",
  },
  body: {
    menstrual:  "symptom-intro",
    follicular: "symptom-intro",
    ovulatory:  "symptom-intro",
    luteal:     "hot-flash-physiology",
  },
  care: {
    menstrual:  "blood-tests",
    follicular: "blood-tests",
    ovulatory:  "gp-prep",
    luteal:     "supplement-stacking",
  },
};

// ─── Phase content (cycling) ─────────────────────────────────────────
const PHASE_CONTENT = {
  follicular: {
    summary: "Days 6–13 typically. Oestrogen rises; energy returns.",
    food:    "Your body is rebuilding. Iron-rich foods (lentils, spinach, lean meat) replenish what was lost during menstruation — pair with vitamin C to triple absorption. Fermented foods support gut health and oestrogen metabolism. Light proteins and complex carbs give sustained energy.",
    movement:"Rising energy makes this a great time for strength training, new fitness challenges, and HIIT. Your body recovers faster and tolerates higher intensity well. Coordination and motor learning peak — good window for picking up a new sport.",
  },
  ovulatory: {
    summary: "Days 12–16 typically. Oestrogen peaks, brief LH surge.",
    food:    "Raw or lightly cooked vegetables support liver function during the oestrogen surge. Zinc-rich foods (pumpkin seeds, chickpeas) support egg quality and progesterone production for the upcoming luteal phase. Stay hydrated — body temperature is slightly elevated.",
    movement:"Peak performance window. Competitive sports, high-intensity cardio, team activities. Pain tolerance is higher and reaction time is at its monthly best. If you have a race, one-rep-max attempt, or competition, this is the week.",
  },
  luteal: {
    summary: "Days 17–28 typically. Progesterone dominates.",
    food:    "Magnesium (dark chocolate, avocado, almonds, leafy greens) reduces PMS and improves sleep quality. Complex carbohydrates stabilise blood sugar and reduce cravings. Reduce caffeine and alcohol — both exacerbate progesterone-driven anxiety. B6 (salmon, banana, potato) is evidence-supported for PMS.",
    movement:"Shift toward moderate intensity — yoga, pilates, swimming, walking. Avoid overtraining; cortisol is more reactive now. Rest is productive. If strength training, lower reps with longer recovery beats high-volume circuits.",
  },
  menstrual: {
    summary: "Days 1–5 typically. Oestrogen and progesterone bottom out.",
    food:    "Prioritise iron (red meat, tofu, dark leafy greens) and vitamin C for absorption. Omega-3s (oily fish, flaxseed, walnuts) reduce prostaglandin production and ease cramping. Warm soups and broths support comfort. Avoid alcohol — depletes B vitamins and worsens cramping.",
    movement:"Gentle movement — restorative yoga, slow walks, light stretching. Let your body lead. High intensity can increase cramping and worsen fatigue. If you train through your period, drop intensity 20–30% and listen on day 1–2.",
  },
};

const HORMONE_CURVE = [
  { range: "Days 1–5 · Menstruation",      text: "Oestrogen and progesterone are at their lowest. FSH starts rising to begin recruiting follicles. You may feel more inward, fatigued, or emotional — this is hormonal, not weakness." },
  { range: "Days 6–13 · Follicular phase", text: "Oestrogen rises steadily as your dominant follicle grows. This is when most women feel sharpest, most energetic, most socially confident. Oestrogen stimulates dopamine, serotonin, and verbal memory centres in the brain. Skin often looks best now." },
  { range: "Day 14 · Ovulation",            text: "A surge of LH triggers ovulation. Oestrogen peaks, then drops briefly. Testosterone also spikes around ovulation — many women notice heightened libido and assertiveness. BBT rises by 0.2–0.5°C after ovulation and stays elevated." },
  { range: "Days 15–28 · Luteal phase",    text: "Progesterone rises significantly (made by the corpus luteum). It's calming, warming, and appetite-increasing. In some women progesterone's metabolite allopregnanolone disrupts GABA receptors, causing anxiety or mood changes. PMS symptoms peak in the final few days as both hormones crash." },
];

const CERVICAL_MUCUS_TABLE = [
  { phase: "Menstrual phase",        signal: "Blood present" },
  { phase: "Post-period (days 4–8)", signal: "Dry or minimal — low fertility" },
  { phase: "Pre-ovulatory (9–12)",   signal: "Creamy, white/yellow, lotion-like — some fertility" },
  { phase: "Peak (days 12–14)",      signal: "Clear, stretchy, like raw egg white — peak fertility window" },
  { phase: "Post-ovulation",         signal: "Returns to thick / sticky / absent within 24 hours" },
];

const CYCLE_HEALTHY_BULLETS = [
  "Length: 21–35 days (counted from first day of full bleeding to the day before the next).",
  "Duration: 3–7 days of bleeding.",
  "Flow: 30–80ml total. Soaking more than 1 pad/tampon per hour for several hours is heavy — worth investigating.",
  "Pain: mild cramping manageable with paracetamol or ibuprofen. Severe pain that stops daily life is NOT normal.",
  "PMS: mild symptoms acceptable. PMDD (severe mood disruption that impairs daily function) is a recognised condition with treatment options.",
];
const CYCLE_RED_FLAGS = [
  "Periods stopping for 3+ months (not due to pregnancy) — investigate with GP.",
  "Sudden change in cycle length or flow.",
  "Bleeding between periods or after sex.",
  "Period pain getting progressively worse year-on-year (endometriosis pattern).",
  "Very short luteal phase (under 10 days) — may affect fertility.",
];

// ─── Skin & Hair content ─────────────────────────────────────────────
const HORMONES_CONTROL_SKIN = "Oestrogen is arguably your skin's most important hormone. It stimulates fibroblasts — the cells that make collagen — to produce collagen, elastin, and hyaluronic acid. This is why skin in the follicular phase often looks plumper, clearer, and more luminous, and why post-menopausal women lose approximately 30% of skin collagen in the first five years after menopause — that's not ageing in the abstract, it's oestrogen withdrawal. Progesterone in the luteal phase changes your skin's behaviour: sebum production increases, the skin barrier shifts (transepidermal water loss goes up, meaning skin can feel drier even while being oilier), and for women prone to breakouts, this is the breakout window. Androgens (particularly DHT) drive sebaceous gland activity — the sebaceous gland is essentially an endocrine organ. This is why hormonal acne is fundamentally different from bacterial acne.";

const HORMONAL_ACNE_CONTENT = [
  { title: "Where it shows up",            body: "Hormonal acne tends to cluster along the jaw, chin, and lower cheeks — the areas with the highest density of androgen-sensitive sebaceous glands. It typically peaks in the 7–10 days before your period." },
  { title: "Why salicylic acid works",     body: "It's lipid-soluble, meaning it can penetrate sebum-filled pores and dissolve the plug from the inside. AHAs (glycolic, lactic) work on the surface but can't penetrate the pore as effectively." },
  { title: "Retinoids vs benzoyl peroxide",body: "For hormonal/comedonal acne, retinoids (retinol, tretinoin) are superior — they regulate cell turnover and prevent follicle blockage. Benzoyl peroxide kills P. acnes bacteria and is better for inflammatory/pustular acne." },
  { title: "Niacinamide",                  body: "Reduces sebum production by ~52% in clinical studies at 2% concentration. Also strengthens the barrier (ceramide synthesis), reduces hyperpigmentation post-breakout, and is suitable across all cycle phases." },
];

const PHASE_SKIN_PROTOCOL = {
  menstrual:  "Skin is most sensitive now. Barrier is compromised, inflammation is higher. Stick to gentle cleansing, ceramide-rich moisturiser, and avoid introducing new actives. If you use retinol, skip during heavy bleeding days.",
  follicular: "Oestrogen rising = skin's best window. Introduce or resume actives — retinol, AHAs, vitamin C. Skin tolerates more now. Good time for in-clinic treatments if you have them (peels, microneedling).",
  ovulatory:  "Skin often at its best. Maintain your routine. Oil production may increase slightly around ovulation.",
  luteal:     "Progesterone rises, sebum increases, barrier shifts. Switch to lighter moisturisers. Use salicylic acid toner or spot treatment from day 17. Hold off on new actives. Richer emollients if dryness rather than oiliness is your pattern.",
};

const HAIR_SCIENCE = [
  { title: "Hair grows in cycles",                          body: "Anagen (active growth, 2–7 years — oestrogen extends this phase), catagen (transition, 2 weeks), telogen (resting, 3 months, then the hair sheds). At any time, ~85% of your hairs should be in anagen." },
  { title: "Postpartum hair loss (telogen effluvium)",      body: "During pregnancy, elevated oestrogen keeps most hairs in anagen. Post-birth, oestrogen crashes, and a mass cohort of hairs simultaneously enter telogen. Three months later, they all shed. Peaks at 3–4 months postpartum and resolves by 12–18 months in most women." },
  { title: "Telogen effluvium vs female pattern hair loss", body: "TE = diffuse shed all over the scalp, often triggered by a specific event (childbirth, illness, crash diet, stress, surgery), typically recovers once trigger resolves. Female pattern hair loss = progressive thinning at the crown and parting, often a family history, DHT-driven follicle miniaturisation." },
  { title: "The DHT mechanism",                              body: "In genetically susceptible follicles, DHT binds to androgen receptors and progressively shortens the anagen phase — follicles miniaturise and eventually stop producing visible hair. Minoxidil extends anagen and improves blood flow. Finasteride/dutasteride block 5-alpha-reductase — increasingly used off-label in women under specialist supervision." },
  { title: "The ferritin factor",                            body: "Ferritin (stored iron) is the most commonly missed variable in hair loss. Lab 'normal' ranges can be as low as 12 µg/L, but for optimal hair growth the threshold appears to be 70 µg/L or above. Ask specifically for ferritin, not just haemoglobin." },
];

const SKIN_HAIR_SUPPLEMENTS = [
  { name: "Zinc",                  benefit: "Inhibits 5-α-reductase, regulates sebum.",        note: "Evidence for acne and female pattern hair loss. 25mg/day. Take away from calcium/iron." },
  { name: "Omega-3 (EPA dominant)",benefit: "Anti-inflammatory on sebaceous glands.",          note: "EPA specifically has evidence for reducing inflammatory acne and improving scalp blood flow. 2,000mg/day combined EPA+DHA, EPA majority." },
  { name: "Biotin",                benefit: "Only useful if deficient.",                       note: "Dietary biotin deficiency is genuinely rare. Supplementing when levels are normal has no evidence for hair growth. Can cause false lab results." },
  { name: "Evening primrose oil",  benefit: "For hormonal skin dryness, eczema.",              note: "GLA converts to anti-inflammatory prostaglandins. 1,000–3,000mg/day." },
  { name: "Vitamin C",             benefit: "Cofactor for collagen synthesis.",                note: "Body cannot make collagen without it. 500–1,000mg/day. Also helps iron absorption — take with iron foods." },
];

// ─── Body tab content ────────────────────────────────────────────────
const SYMPTOM_NOTES = {
  hot_flash:  "Hot flashes are the most common perimenopause symptom, affecting 75% of women in the transition. Triggered by a narrowing of the thermoregulatory zone in the hypothalamus caused by oestrogen fluctuation. Alcohol, caffeine, spicy food, and stress are common triggers.",
  headache:   "Hormonal headaches typically cluster around menstruation (oestrogen withdrawal) and mid-luteal phase. Magnesium supplementation (400mg glycinate) has strong evidence for prevention.",
  migraine:   "Menstrual migraine is driven by the drop in oestrogen 2–3 days before bleeding. Frovatriptan or naproxen taken pre-emptively can reduce severity. Consult a GP about prophylaxis if debilitating.",
  fatigue:    "Persistent fatigue across a cycle deserves attention — iron, ferritin, B12, vitamin D and thyroid function are the first labs to ask your GP about.",
  bloating:   "Bloating typically peaks in the luteal phase due to progesterone-driven water retention. Reducing salt, increasing potassium, and gentle movement help.",
  brain_fog:  "Brain fog is driven by oestrogen's role in supporting neurotransmitter function. Sleep quality is the highest-impact factor.",
  cramps:     "Primary dysmenorrhoea is driven by prostaglandins. NSAIDs, heat, and omega-3s are evidence-based interventions. Pain that disrupts daily life is worth raising with a GP.",
  acne:       "Hormonal acne clusters along the jawline and chin and tends to flare in the luteal phase. Salicylic acid, zinc, and managing stress all help.",
  insomnia:   "Sleep disruption during the late luteal phase and around menstruation is often hormonal. Cool room, magnesium glycinate, and consistent bedtime are first-line.",
  anxiety:    "Cyclical anxiety often spikes in the luteal phase as progesterone falls. If significant every cycle, PMDD is worth discussing with a GP.",
  mood_swings:"Late-luteal mood shifts are common — falling progesterone and serotonin interactions.",
  cravings:   "Luteal cravings are real and hormonally driven. Balancing blood sugar with protein at each meal reduces them.",
};
const fallbackSymptomNote = (sym) => `${prettyName(sym)} is something I'm keeping track of. If it's affecting your daily life, raise it with your GP.`;

const HOT_FLASH_PHYSIOLOGY = "A hot flash isn't random. Oestrogen acts as a thermostat, maintaining a 'thermoregulatory zone' of approximately 0.4°C within which your body doesn't trigger cooling (sweating) or heating (shivering) mechanisms. As oestrogen declines in perimenopause and menopause, this zone narrows to near zero — meaning the smallest rise in core body temperature immediately triggers the full heat-dissipation response: vasodilation, sweating, heart rate rise. This is why hot flashes are worst at night — your circadian temperature rhythm naturally rises during sleep cycles, constantly triggering the response. Reducing external heat triggers (layers, room temperature) helps, as does HRT (which widens the thermoregulatory zone again).";

const PCOS_CONTENT = {
  intro: "PCOS is a complex metabolic and hormonal condition. The Rotterdam diagnostic criteria require 2 of 3: irregular/absent ovulation, elevated androgens, polycystic ovaries on ultrasound. You can have PCOS without visible cysts.",
  symptoms: [
    "Cycle: irregular, long, or absent periods; anovulatory cycles; difficulty getting pregnant",
    "Androgen excess: hormonal acne, excess facial/body hair, scalp hair thinning",
    "Metabolic: insulin resistance (even in lean women), difficulty maintaining weight, acanthosis nigricans",
    "Mood: higher rates of anxiety and depression",
  ],
  driver: "Insulin resistance is the driver in most PCOS cases. Managing it through nutrition (low-GI diet, reducing refined carbohydrates, regular meals) and exercise improves most PCOS symptoms including cycle regularity. Inositol (myo-inositol, 2–4g/day) has good evidence for improving insulin sensitivity and restoring ovulation.",
};

const ENDO_CONTENT = {
  intro: "Endometriosis affects 1 in 10 women but takes an average of 7–9 years to diagnose. Endometrial-like tissue grows outside the uterus — on the ovaries, peritoneum, bowel, bladder. It bleeds with each cycle and causes inflammation, adhesions, and pain.",
  symptoms: [
    "Painful periods that are severe and/or getting progressively worse",
    "Pain outside menstruation — mid-cycle, during sex, with bowel movements",
    "Deep pelvic pain",
    "Fatigue that is severe and cyclic",
    "Bloating (the 'endo belly')",
    "Recurrent UTI symptoms without infection",
    "Back and leg pain perimenstrually",
    "Difficulty conceiving",
  ],
  diagnosis: "Key distinction from primary dysmenorrhoea: normal period pain tends to be consistent year on year and manageable. Endometriosis pain often worsens progressively. Pain outside the period window is the most important red flag. Diagnosis requires laparoscopy.",
};

const PMDD_CONTENT = "PMDD is not 'bad PMS.' It's a severe cyclical condition where women experience significant mood disruption — depression, anxiety, rage, hopelessness — in the luteal phase that remits within days of menstruation starting. The mechanism involves abnormal sensitivity to normal progesterone fluctuations. The brain's response to allopregnanolone — a progesterone metabolite that normally has a calming, GABA-agonist effect — appears paradoxically dysregulating in PMDD. SSRIs taken only in the luteal phase (day 14 to menstruation) are first-line and highly effective.";

// ─── Mind tab content ────────────────────────────────────────────────
const OESTROGEN_BRAIN = "Oestrogen receptors are found throughout the brain, particularly in the hippocampus (memory formation), prefrontal cortex (executive function, planning), and amygdala (emotional processing). This is why oestrogen fluctuations affect mood, memory, and cognition — it's not 'all in your head' in the dismissive sense; it's literally in your brain tissue.";
const COGNITION_BY_PHASE = [
  { phase: "Follicular · rising oestrogen", body: "Peak verbal fluency, working memory, and verbal memory. Many women feel sharpest and most articulate now." },
  { phase: "Ovulatory",                     body: "Spatial reasoning and coordination peak (possibly androgen-influenced)." },
  { phase: "Luteal · rising progesterone",  body: "Detail-oriented focus improves; some feel more cautious or risk-averse. As both hormones drop in late luteal, attention and executive function dip." },
  { phase: "Perimenstrual",                  body: "Lowest oestrogen, potential for brain fog and emotional sensitivity." },
];
const HPA_HPG = "Chronic stress is one of the most common causes of cycle disruption, but the mechanism is rarely explained. The HPA axis (your stress response system) and the HPG axis (your reproductive hormone system) share regulatory pathways. CRH, elevated under chronic stress, directly suppresses GnRH, which drives LH pulsatility. Suppressed LH means disrupted follicle development and potential anovulation. Elevated cortisol also suppresses progesterone synthesis directly.";
const SLEEP_CYCLE = "Progesterone has sedative properties — it stimulates GABA-A receptors and can cause increased sleepiness and longer sleep in the early luteal phase. In late luteal (5–7 days before your period), the crash in both oestrogen and progesterone disrupts sleep architecture. REM sleep is often reduced. During perimenopause, night sweats directly fragment sleep — the hot flash wakes you in the night even if you don't consciously notice the heat. Oestrogen therapy dramatically improves sleep quality for most women.";
const NS_REGULATION = [
  { title: "Physiological sigh",     body: "Double inhale through the nose (first breath, then a second sharp sniff to fully inflate the lungs) followed by a long, slow exhale. Triggers the greatest vagal activation of any breathing pattern. 1–3 repetitions have measurable effect." },
  { title: "Cold water on face/wrists", body: "Activates the mammalian dive reflex — heart rate slows via vagal activation. Effective for acute anxiety spikes." },
  { title: "Extended exhale breathing", body: "Any ratio where exhale is longer than inhale activates the parasympathetic system. 4:6 (4 counts in, 6 counts out) is effective and sustainable." },
  { title: "Timing matters",            body: "These techniques have greater effect when used preventively during high-risk luteal days rather than mid-panic." },
];

// ─── Nourishment tab content ─────────────────────────────────────────
const PHASE_NUTRITION_WHY = {
  menstrual:  "You're losing iron with blood. Focus on haem iron (red meat, liver, sardines) or non-haem iron (legumes, tofu, spinach, fortified cereals) paired with vitamin C to triple absorption. B12 (eggs, fish, dairy) supports energy. Anti-inflammatory foods (ginger, turmeric, omega-3) reduce prostaglandin-driven cramping.",
  follicular: "Oestrogen is rising — support its healthy metabolism. Cruciferous vegetables (broccoli, cauliflower, kale) contain DIM which helps the liver process oestrogen via the protective 2-OH pathway. Flaxseeds contain lignans that modulate oestrogen receptors. Zinc-rich foods (pumpkin seeds, chickpeas, cashews) support progesterone production for the upcoming luteal phase.",
  ovulatory:  "Energy needs are slightly higher (BBT rises). Fibre becomes important to help the gut excrete used oestrogen rather than recirculating it. Probiotic foods (yogurt, kefir, sauerkraut) support the estrobolome.",
  luteal:     "Progesterone increases insulin resistance slightly — blood sugar regulation matters. Protein at every meal. Magnesium-rich foods (dark chocolate, pumpkin seeds, leafy greens) support the nervous system and reduce PMS. B6 (salmon, potatoes, bananas) is a cofactor for serotonin synthesis.",
};

const ESTROBOLOME = "The estrobolome is the collection of gut bacteria that metabolise oestrogen. The liver processes used oestrogen for excretion in the bile. In the gut, beta-glucuronidase — produced by certain bacteria — can deconjugate this oestrogen, allowing it to be reabsorbed rather than excreted. High beta-glucuronidase activity means you reabsorb more oestrogen than intended.";
const ESTROBOLOME_DISRUPT = ["Antibiotics (reduce microbial diversity broadly).", "Low-fibre diet (fibre feeds beneficial bacteria that keep beta-glucuronidase in check).", "Alcohol (alters gut motility and microbiome composition).", "High saturated fat diet."];
const ESTROBOLOME_SUPPORT = ["30+ different plant foods per week (most evidence-supported target for microbiome diversity).", "Fermented foods: kefir, yogurt, sauerkraut, kimchi, miso.", "Prebiotic fibres: garlic, onion, leeks, asparagus, oats, bananas.", "Calcium D-glucarate (500–1,000mg/day) inhibits beta-glucuronidase directly."];

const SEED_CYCLING = [
  { phase: "Follicular (days 1–14)", body: "1 tbsp ground flaxseed + 1 tbsp raw pumpkin seeds daily. Flax contains lignans (phytoestrogens that modulate oestrogen receptors) plus omega-3 (ALA). Pumpkin seeds are rich in zinc, which supports the corpus luteum's progesterone production later." },
  { phase: "Luteal (days 15–28)",     body: "1 tbsp raw sunflower seeds + 1 tbsp sesame seeds daily. Sunflower seeds contain selenium and vitamin E (antioxidants supporting progesterone). Sesame contains lignans that support progesterone and may reduce excess oestrogen." },
  { phase: "Important",                body: "Seeds should be ground (flax especially — whole flaxseeds pass through undigested). Effect, if any, is cumulative — give it 3 months before evaluating." },
];

const BLOOD_SUGAR_LUTEAL = "Insulin resistance increases in the luteal phase — progesterone reduces insulin sensitivity. This can manifest as stronger carbohydrate cravings, more significant blood sugar crashes, and worsened mood if meals are skipped. Practical: never skip breakfast, eat protein before carbohydrates (reduces post-meal glucose spike by up to 30%), cinnamon (½ tsp/day) has modest evidence, chromium (200mcg) for cravings.";

const EDC_LIST = [
  { name: "BPA (bisphenol A)",  found: "Plastic containers, tin can linings, thermal receipt paper",       swap: "Glass or stainless containers for hot foods/drinks, BPA-free canned goods, avoid thermal receipts." },
  { name: "Phthalates",         found: "Flexible plastics, synthetic fragrance in cosmetics/cleaning",     swap: "Unscented or naturally-fragranced products, glass food storage." },
  { name: "Parabens",           found: "Preservatives in cosmetics (weak oestrogen activity)",             swap: "Look for paraben-free formulations for products used daily." },
  { name: "Pesticide residues", found: "Dirty Dozen list: strawberries, spinach, peppers, grapes, peaches",swap: "Buy organic where practical for these specifically." },
];

// ─── Care tab content ────────────────────────────────────────────────
const BLOODS_CORE = [
  { name: "Full blood count (FBC) + Ferritin", body: "Ferritin often not automatically included — ask by name. Lab 'normal' can be as low as 12 µg/L; for optimal hair, energy, and thyroid function, aim for 70+." },
  { name: "Vitamin D",                          body: "Deficiency near-universal in UK. Optimal 75–150 nmol/L. If deficient, may need 5,000 IU/day to correct." },
  { name: "B12",                                body: "Important for women who don't eat meat regularly or take the contraceptive pill. Optimal towards upper end of range (400–700 pg/mL)." },
  { name: "Thyroid (TSH + free T4)",            body: "TSH alone misses early thyroid dysfunction. If symptomatic, push for free T3 and TPOAb antibodies to screen for Hashimoto's." },
];

const BLOODS_HORMONAL = [
  { name: "Reproductive age",  body: "Day 2–3: LH, FSH, oestradiol, AMH. Day 21 (or 7 days post-ovulation) progesterone — confirms ovulation and luteal adequacy." },
  { name: "TTC",               body: "Add AMH (ovarian reserve). TSH, rubella immunity, full STI screen." },
  { name: "Perimenopause",     body: "Day 2–3 FSH. Levels above 10 IU/L suggest early perimenopause; above 30 with clinical picture suggests late perimenopause." },
  { name: "Post-menopause",    body: "Lipid panel, HbA1c, DEXA if not already done, testosterone if symptoms of deficiency." },
];

const RANGE_VS_OPTIMAL = [
  { test: "Ferritin",             range: "12–300 µg/L",   optimal: "70+ µg/L for hair and energy" },
  { test: "Vitamin D",            range: "50–200 nmol/L", optimal: "75–150 nmol/L" },
  { test: "TSH",                  range: "0.5–4.5 mIU/L", optimal: "Below 2.5 if symptomatic" },
  { test: "Day 21 progesterone",  range: "Above 5 nmol/L",optimal: "30+ nmol/L for adequacy" },
];

const HRT_CONVERSATION = [
  { title: "What to say",            body: "'I believe I'm experiencing perimenopause symptoms. I've read the NICE guidelines and would like to discuss HRT as a treatment option.'" },
  { title: "What to ask for",        body: "Transdermal oestrogen (patch or gel) rather than oral — better safety profile for blood clots and cardiovascular risk. Micronised progesterone (Utrogestan) rather than synthetic progestogen if you have a uterus. A review appointment in 3 months." },
  { title: "If you're dismissed",    body: "You have the right to a second opinion. Menopause specialists and private clinics can prescribe if your GP is not supportive." },
  { title: "Contraindications",      body: "Current or recent breast cancer, unexplained vaginal bleeding, active blood clot. Most other perceived contraindications require individual assessment." },
];

const SUPP_STACK_SEPARATE = [
  "Iron + calcium: calcium significantly inhibits iron absorption. Take iron with vitamin C; calcium at a different meal.",
  "Iron + zinc: compete for the same absorption transporter. Take at different times.",
  "Zinc + copper: high-dose zinc depletes copper. If taking zinc above 25mg/day, pair with 1–2mg copper.",
];
const SUPP_STACK_SYNERGY = [
  "Vitamin D + K2 + magnesium: K2 directs calcium to bones; magnesium is a cofactor for vitamin D activation.",
  "Iron + vitamin C: vitamin C enhances iron absorption 2–3 fold.",
  "B vitamins: work as a complex.",
];
const SUPP_TIMING = [
  "Fat-soluble vitamins (A, D, E, K): take with a meal containing fat.",
  "Iron: best on empty stomach; with food if nausea.",
  "Magnesium glycinate: evening — glycine supports sleep quality.",
];

const GP_APPT_BRING = [
  "A written symptom list — when symptoms started, severity (1–10), how they affect daily life.",
  "Your cycle tracking data — printed or shown on your phone.",
  "Current medication and supplement list.",
  "One primary concern and one secondary — GPs work best with focused questions.",
];
const GP_APPT_LANGUAGE = [
  "'This is significantly affecting my quality of life'.",
  "'I've been tracking this for X months' — demonstrates seriousness.",
  "'I'd like to be tested for X specifically'.",
  "'I've read about [condition or treatment] and would like to discuss it.'",
];

// ─── LIFE STAGE content — 11 stages (verbatim from v2) ───────────────
const LIFE_STAGE_CONTENT = {
  teen: {
    oneliner: "Your first few years of periods are your body learning. Cycles of 21–45 days are normal in the first 2 years.",
    sections: [
      { title: "What's actually going on", body: "Your hormones are calibrating. Cycle length will vary widely during the first 18–24 months — this is the hypothalamic-pituitary-ovarian feedback loop learning its rhythm. Once established, cycles tend to settle into 21–35 days." },
      { title: "What's normal vs not", body: "Cramping on day 1–2 — normal. Mood changes around your period — completely normal due to hormone shifts. NOT normal: vomiting from pain, fainting, missing school regularly, periods soaking through a pad in under 2 hours, periods lasting more than 7 days." },
      { title: "Early PCOS signs to know", body: "Irregular periods continuing past the first 2 years, acne resistant to normal skincare, excess hair growth on face/body, or difficulty losing weight despite healthy lifestyle. PCOS affects ~10% of women and is very manageable when identified early." },
      { title: "Iron in teenage years", body: "Heavy periods + a growing body + commonly low-iron diets makes iron deficiency common. If you're tired, breathless walking up stairs, or unusually pale, ask your GP for a ferritin test." },
      { title: "Talking to a GP", body: "You can see a GP independently from age 13 in most situations in the UK — your GP is bound by confidentiality. School nurses and Brook (sexual health charity for under-25s) are also good resources." },
    ],
    redFlags: ["Severe pain that stops you doing normal things, even with painkillers","Periods stopping for 3+ months (pregnancy excluded)","Soaking through a super pad in under 2 hours","Persistent periods longer than 7 days","Cycles consistently shorter than 21 days or longer than 45 days after the first 2 years"],
  },
  reproductive: {
    oneliner: "Optimising what's working. Knowing what's actually normal — and what isn't.",
    sections: [
      { title: "Your cycle is a vital sign", body: "As informative as blood pressure or heart rate. A regular, healthy cycle says your hormones are broadly functioning well." },
      { title: "What healthy actually looks like", body: "25–35 days, 3–7 days of bleeding, manageable pain, a clear mid-cycle fertile window, and a luteal phase of 12–16 days." },
      { title: "Symptoms in a healthy cycle", body: "Some cramping early in the period. Mild breast tenderness in the luteal phase. Mood shifts around menstruation. None of these should stop your life." },
      { title: "Red flags at this stage", body: "Periods stopping or becoming very irregular without pregnancy; heavy periods (consider fibroids, endometriosis); worsening pain over time." },
      { title: "Contraception note", body: "Hormonal birth control suppresses ovulation. What you bleed on the pill is a withdrawal bleed, not a true period." },
      { title: "Lifestyle leverage", body: "Sleep regularity, protein intake, strength training, and stress management all measurably affect cycle health." },
    ],
    redFlags: ["Heavy bleeding (soaking a pad/tampon in under 2 hours)","Periods lasting longer than 7 days","Severe pelvic pain that disrupts daily life","Spotting between periods or after sex","Cycles consistently shorter than 21 or longer than 35 days","Pain during sex"],
  },
  "pre-ttc": {
    oneliner: "The 3 months before you start trying matter as much as conception itself. Egg quality takes ~90 days to develop.",
    sections: [
      { title: "Why 3 months matters", body: "Egg quality is set roughly 3 months before ovulation. What you do now affects the eggs you'll ovulate in three months." },
      { title: "Core supplement stack", body: "Folate (or methylfolate if MTHFR variant): 400mcg minimum, 5mg if previous neural tube defect history. Vitamin D, CoQ10 (ubiquinol) 200–600mg/day, omega-3 DHA 1,000mg/day, zinc 15–25mg/day. Iron only if blood test confirms deficiency." },
      { title: "Lifestyle leverage", body: "Reducing alcohol significantly improves egg quality. Smoking is directly damaging to eggs. Excess vigorous exercise can suppress ovulation. Cortisol from chronic stress suppresses LH and progesterone." },
      { title: "Pre-conception bloods", body: "Ferritin, vitamin D, thyroid (TSH + free T4), HbA1c. Correcting deficiencies before conception protects your pregnancy." },
      { title: "Your partner matters", body: "Sperm quality also takes ~3 months to develop. Male factors account for 30–40% of fertility issues. Heat exposure, alcohol, smoking, BMI all affect sperm." },
    ],
    redFlags: ["Cycles consistently outside 21–35 days","BMI under 19 or over 30","Known thyroid, autoimmune, or metabolic conditions not yet optimised","Family history of fertility difficulties or recurrent miscarriage","On medications that aren't pregnancy-safe"],
  },
  ttc: {
    oneliner: "Your fertile window is about 6 days per cycle. Timing, signs, and when to seek help.",
    sections: [
      { title: "The fertile window", body: "The 5 days before ovulation plus ovulation day itself — about 6 days total. Sperm survive 3–5 days; the egg lives 12–24 hours after release. Sex every 1–2 days from day 10 through to 2 days after BBT rise covers most cycles." },
      { title: "Identifying ovulation", body: "Cervical mucus (clear, stretchy); BBT rises 0.2–0.5°C after ovulation; mid-cycle pelvic twinges; OPKs detect LH surge 24–36 hours before ovulation. PCOS can cause multiple LH surges without ovulation." },
      { title: "Male factor matters", body: "40–50% of fertility challenges involve male-factor sperm issues. A semen analysis is quick, inexpensive, and non-invasive." },
      { title: "What to investigate early", body: "Day 2–3 FSH, LH, AMH. Day 21 progesterone. Thyroid function. Rubella immunity. Chlamydia test. Pelvic ultrasound if irregular cycles or endometriosis symptoms." },
      { title: "Mental health during TTC", body: "The 'two-week wait' is hard. Helpful: limit symptom-spotting, avoid early testing, have a plan for negative-test days. Cortisol suppresses LH and progesterone." },
      { title: "When to seek help", body: "After 12 months under 35, 6 months 35+, 3 months 40+ or with known fertility concerns." },
    ],
    redFlags: ["No conception in expected timeframes for your age","Cycles consistently irregular while trying","Severe pelvic pain or pain during sex","2+ miscarriages","Known endometriosis, PCOS, or thyroid issues not currently treated"],
  },
  "pregnant-t1": {
    oneliner: "Weeks 1–12. Everything is changing fast. Most symptoms are normal; some need attention immediately.",
    sections: [
      { title: "What's normal", body: "Extreme tiredness (progesterone elevated). Nausea (peaks weeks 6–10). Breast tenderness, frequent urination, heightened smell sensitivity, food aversions." },
      { title: "Morning sickness truth", body: "Not only morning — can be all day. Small frequent meals + protein nearby helps. Severe persistent vomiting (hyperemesis gravidarum) needs medical treatment." },
      { title: "What to do now", body: "Pregnancy multivitamin with 400mcg folic acid. Stop alcohol completely. Avoid soft cheeses/pâté/raw fish/undercooked meat. Vitamin D 10mcg daily." },
      { title: "First appointments", body: "Booking appointment at 8–10 weeks. Dating scan at 11–13 weeks (plus combined screening for Down's syndrome)." },
      { title: "Mental health from day one", body: "If you have a history of depression, anxiety, OCD, or eating disorders, tell your midwife — perinatal mental health services can support you proactively." },
    ],
    redFlags: ["Heavy bleeding, especially with cramps or pain","Severe one-sided pelvic pain (rule out ectopic — urgent)","Severe vomiting that prevents you keeping fluids down","Fainting, severe dizziness, or shoulder-tip pain","High fever, painful urination, foul-smelling discharge"],
  },
  "pregnant-t2": {
    oneliner: "Weeks 13–27. The 'easier' trimester for most. Anomaly scan, first movements, body changes.",
    sections: [
      { title: "Anomaly scan", body: "Around 20 weeks. Checks fetal development in detail. You can usually find out sex if you want." },
      { title: "First movements (quickening)", body: "Typically 18–22 weeks — earlier in second pregnancies. By week 24 you should be feeling consistent daily movements. Reduced movements at any point need same-day assessment." },
      { title: "Iron and pregnancy", body: "Iron requirements double in pregnancy. Many women develop iron-deficiency anaemia in the second trimester. Bloods at 28 weeks check for this." },
      { title: "Skin and hair changes", body: "Pregnancy glow (increased blood volume), darker skin patches (chloasma/melasma — UV-driven, SPF helps), linea nigra, thicker hair." },
      { title: "Pain that's normal — and pain that isn't", body: "Back pain, round ligament pain, pelvic girdle pain are common. NHS physiotherapy is available — ask your midwife." },
    ],
    redFlags: ["Reduced fetal movement at any point after week 24","Persistent severe headaches (rule out pre-eclampsia)","Vision changes, swelling of hands/face, pain under the ribs","Vaginal bleeding","Itching, especially severe and on palms/soles"],
  },
  "pregnant-t3": {
    oneliner: "Weeks 28–40+. Preparing for birth. Knowing the signs of labour.",
    sections: [
      { title: "What's normal", body: "Shortness of breath, heartburn, difficulty sleeping, Braxton Hicks, swollen ankles, pelvic girdle pain." },
      { title: "Antenatal classes", body: "Run between weeks 28–36. NCT classes paid; NHS classes free." },
      { title: "Recognising labour", body: "Regular contractions that increase in frequency and intensity. A 'show' (mucus plug). Waters breaking. Braxton Hicks are irregular and may ease with movement or hydration." },
      { title: "When to phone maternity", body: "Contractions 5 minutes apart, lasting 60 seconds, for an hour (first baby). Also call if waters break, bleeding, reduced movements, or anything that worries you." },
      { title: "Birth plans", body: "Write one, hold it loosely. Preferences (positions, pain relief, lighting) and contingencies (what matters if a C-section becomes necessary)." },
      { title: "Postnatal preparation", body: "Build a freezer of easy meals. Sort baby admin. Identify your one or two 'low-bar' people. Postnatal depression affects 1 in 5 — preparation is protective." },
    ],
    redFlags: ["Reduced fetal movement","Severe headaches, vision changes, sudden swelling","Severe itching on palms/soles (obstetric cholestasis)","Vaginal bleeding","Waters breaking but no contractions starting within 24h","Anything that feels wrong — trust yourself"],
  },
  postpartum: {
    oneliner: "The fourth trimester. The bit no one prepares you for. You are also the patient.",
    sections: [
      { title: "The hormone crash", body: "Within 72 hours of birth, oestrogen and progesterone drop to near zero. This is the direct cause of baby blues (weepiness, anxiety, overwhelm in days 3–5), which affects 80% of women and usually resolves within 2 weeks." },
      { title: "Baby blues vs PND", body: "Baby blues pass within 2 weeks. Postnatal depression is persistent — lasting weeks, interfering with daily function. PND affects 1 in 10 women, is not a failure, and responds well to treatment." },
      { title: "Postpartum hair loss", body: "Telogen effluvium — mass shedding of hair held in the growth phase during pregnancy. Peaks ~3–4 months postpartum. Most regrows by 12 months." },
      { title: "Physical recovery", body: "Pelvic floor takes 12 weeks minimum to recover regardless of birth type. Returning to impact exercise before 12 weeks risks long-term pelvic floor damage." },
      { title: "Breastfeeding and fertility", body: "Prolactin suppresses ovulation — but not reliably enough to use as contraception. Some women ovulate before their first postpartum period." },
      { title: "Help is not failure", body: "Lactation consultants (IBCLCs). Pelvic health physiotherapy on NHS — ask your GP. NCT helpline (0300 330 0700). PND treatment is effective." },
    ],
    redFlags: ["Persistent low mood, hopelessness, or intrusive thoughts (any time in first year)","Heavy bleeding that soaks a pad in an hour, or large clots","Fever over 38°C","Severe headache, vision changes","Painful, hot, swollen calf (DVT risk)","Severe breast pain with fever"],
  },
  perimenopause: {
    oneliner: "Can begin in your early 40s and last 2–12 years. Oestrogen fluctuates erratically before declining.",
    sections: [
      { title: "The full symptom picture", body: "Vasomotor: hot flashes, night sweats. Sleep: insomnia, early waking. Mood: anxiety, low mood, irritability, rage. Cognitive: brain fog, word-finding difficulty. Musculoskeletal: joint aches, frozen shoulder. Urogenital: vaginal dryness, recurring UTIs. Cycle changes: irregular timing, flooding, skipped periods. Skin/hair: dryness, collagen loss. Cardio: palpitations. Sensory: tinnitus, formication." },
      { title: "HRT — what's actually available", body: "Oestrogen-only: post-hysterectomy. Combined (oestrogen + progesterone): standard for women with a uterus. Delivery: transdermal patches/gel/spray has better cardiovascular and clot risk profile than oral. Body-identical (micronised) progesterone (Utrogestan): better tolerated than synthetic progestogens. The Mirena IUS can serve as the progesterone component. Testosterone increasingly prescribed off-label." },
      { title: "Modern HRT evidence", body: "The 2002 WHI study enrolled women aged 63 on outdated synthetic hormones. Modern evidence shows body-identical HRT started within 10 years of menopause has a favourable risk/benefit profile for most women." },
      { title: "Natural approaches with evidence", body: "Isoflavones (soy, red clover): weak phytoestrogens, modest evidence. CBT: NICE-recommended for hot flashes and mood. Magnesium glycinate: supports sleep. Weight-bearing exercise: bone density." },
      { title: "Many women are misdiagnosed", body: "Anxiety and mood symptoms are often treated with antidepressants when HRT would be more appropriate. Brain fog is dismissed. Advocate for yourself — NICE guidance is clear, and the British Menopause Society maintains a directory of trained specialists." },
    ],
    redFlags: ["Cycles becoming heavier or longer","Bleeding after sex or between periods (especially after 45)","Symptoms severely affecting work, relationships, or daily functioning","Mood crisis — perimenopause associated with increased suicide risk","Joint pain that doesn't respond to usual measures (frozen shoulder)"],
  },
  menopause: {
    oneliner: "12 months after your final period. The transition is complete. Long-term considerations now matter more.",
    sections: [
      { title: "Genitourinary Syndrome of Menopause (GSM)", body: "Vaginal dryness, thinning tissue, recurrent UTIs, bladder urgency. Unlike hot flashes which often improve, GSM progressively worsens without treatment. Local vaginal oestrogen is extremely effective and safe even for most women who can't use systemic HRT." },
      { title: "Bone density", body: "Menopause accelerates bone loss — women lose 10–20% in the first 5 years. DEXA scan worth requesting in your 50s. Calcium 1,200mg/day, vitamin D 2,000 IU/day, weight-bearing exercise are foundational." },
      { title: "Cardiovascular risk", body: "Post-menopause, women's cardiovascular risk rises to equal men's by their late 60s. Annual BP, cholesterol, HbA1c." },
      { title: "Brain", body: "Cognitive changes are common and well-documented. Most women's cognition returns to baseline within a few years. HRT started within 10 years appears protective against Alzheimer's risk." },
      { title: "HRT after the transition", body: "The 'lowest dose for shortest time' messaging from 20 years ago is outdated. Current evidence supports individualised duration. No automatic age cap." },
    ],
    redFlags: ["Any postmenopausal bleeding — urgent assessment","Sudden or severe joint pain","New or severe headaches","Persistent low mood","Symptoms of POI (menopause under 40)"],
  },
  "post-menopause": {
    oneliner: "The longest chapter for most women. Monitoring and maintenance now matter more than ever.",
    sections: [
      { title: "Bone health long-term", body: "DEXA every 2 years is reasonable if not on HRT. Bisphosphonates are standard if osteoporosis confirmed. Weight-bearing exercise preserves bone density." },
      { title: "Cardiovascular", body: "Annual BP. Every-few-year cholesterol and HbA1c. Statins recommended at lower thresholds than people often realise — discuss QRISK3 score with your GP." },
      { title: "Cognitive health", body: "Education + social engagement + cardiovascular health + sleep + Mediterranean-style diet + regular exercise are the evidence-based dementia-reduction levers." },
      { title: "Sexual health continues to matter", body: "Vaginal oestrogen, lubricants, longer foreplay, addressing libido changes." },
      { title: "Testosterone in post-menopause", body: "Off-label but increasingly common — improves libido, energy, mood, and cognitive function. Growing evidence base." },
      { title: "Annual monitoring to request", body: "FBC, lipid panel, HbA1c, vitamin D, thyroid function, blood pressure. Mammogram per NHS schedule. Cervical screening until 65." },
    ],
    redFlags: ["Any vaginal bleeding (urgent — endometrial cancer must be excluded)","New, severe, or persistent headaches","Changes in bowel habits lasting more than 3 weeks","Unexplained weight loss","Falls — especially if new, recurrent, or with injury"],
  },
};

// ─── News strips per tab ─────────────────────────────────────────────
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

// ─── Expert quotes per tab ───────────────────────────────────────────
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
function firstName(profile) {
  const dn = profile?.display_name || ""; return String(dn).split(/\s+/)[0] || "friend";
}
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
  const stops = ["#F7E0E1", "#F2C5C9", "#EBA9AF", "#E08993", "#C4636F"];
  return stops[x - 1];
}
function energyTint(v) {
  if (v == null) return "transparent";
  const x = Math.max(1, Math.min(5, Math.round(v)));
  const stops = ["#E6EEE6", "#C8DDC8", "#A8C9A8", "#8FAF8F", "#6F9070"];
  return stops[x - 1];
}

// ─── Main component ─────────────────────────────────────────────────
export default function HealthCornerDemo({ profile, checkins = [], symptoms = [], meals = [], meds = [], supps = [], habits = [], skinLogs = [] }) {
  const [active, setActive] = useState("overview");
  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "follicular";
  const stage = profile?.life_stage || "reproductive";
  const isMeno = MENO_STAGES.has(stage);
  const isCycling = CYCLING_STAGES.has(stage);

  const props = { profile, checkins, symptoms, meals, meds, supps, habits, skinLogs, cycle, phase, stage, isMeno, isCycling, setActive };

  return (
    <div>
      <DemoPill />

      <article style={canvasStyle()}>
        {/* HC inner tab bar — sticky, scrollable */}
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
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  style={{
                    padding: "6px 12px", borderRadius: 999,
                    background: on ? T.espresso : "transparent",
                    color: on ? T.cream : T.muted,
                    border: "none", cursor: "pointer",
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 12, fontWeight: on ? 700 : 500,
                    letterSpacing: 0.2, whiteSpace: "nowrap",
                  }}
                >{t.label}</button>
              );
            })}
          </div>
        </nav>

        {/* Sticky phase context bar — v3 */}
        <PhaseBar phase={phase} cycle={cycle} stage={stage} isMeno={isMeno} />

        <div style={{ padding: "6px 0 24px" }}>
          {active === "overview"    && <OverviewTab    {...props} />}
          {active === "cycle"       && <CycleTab       {...props} />}
          {active === "life-stage"  && <LifeStageTab   {...props} />}
          {active === "skin-hair"   && <SkinHairTab    {...props} />}
          {active === "body"        && <BodyTab        {...props} />}
          {active === "mind"        && <MindTab        {...props} />}
          {active === "nourishment" && <NourishmentTab {...props} />}
          {active === "care"        && <CareTab        {...props} />}
        </div>
      </article>

      <ReviewerNote>
        v3 progressive disclosure. Sticky phase bar beneath the tab rail. Every tab uses a Glance card +
        accordion sections (single-expand, phase-smart default open). Horizontal carousels for short
        card sets. Static "In the news" strip + one attributed expert quote per tab. All v2 content
        preserved inside accordion deep dives.
      </ReviewerNote>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE BAR — v3 sticky context bar
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
      <div style={{ fontSize: 11, color: "#D4C9B4", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>
        {hasCycle ? `${stageLbl}` : "FemWell"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

// ─── OVERVIEW ─────────────────────────────────────────────────────────
function OverviewTab({ profile, checkins, symptoms, habits, cycle, phase, stage, isMeno, setActive }) {
  const todayKey = todayIso();
  const todayChk = checkins.find((r) => dateKeyOf(r) === todayKey);
  const sleepToday = todayChk?.sleep_hours != null ? Number(todayChk.sleep_hours) : null;
  const moodToday  = readMood(todayChk);
  const energyToday= readEnergy(todayChk);
  const symptomsToday = symptoms.filter((r) => dateKeyOf(r) === todayKey).length;

  const today = todayLocal();
  const cut7 = new Date(today); cut7.setDate(today.getDate() - 6);
  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });
  const symptoms7 = since(symptoms, cut7);
  const habits30  = since(habits,   cut30);

  const days7 = useMemo(() => lastNDayKeys(7), []);
  const mood7   = useMemo(() => alignDays(checkins, days7, readMood),   [checkins, days7]);
  const energy7 = useMemo(() => alignDays(checkins, days7, readEnergy), [checkins, days7]);

  const jess = useMemo(
    () => buildJessOverview(since(checkins, cut7), symptoms7, habits30, cycle, profile, stage),
    [checkins, symptoms7, habits30, cycle, profile, stage]
  );

  const cycleDay = cycle?.cycleDay ?? cycle?.dayInCycle ?? null;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <GlanceCard>{jess}</GlanceCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <Tile icon="🌀" label={isMeno ? "Stage" : "Cycle day"} value={isMeno ? prettyName(stage).split("-")[0] : (cycleDay ? `Day ${cycleDay}` : "—")} />
        <Tile icon="💭" label="Mood"     value={moodToday != null ? MOOD_EMOJI[Math.max(0, Math.min(4, Math.round(moodToday) - 1))] : "—"} large />
        <Tile icon="⚡"  label="Energy"  value={energyToday != null ? `${energyToday}/5` : "—"} />
        <Tile icon="🩺" label="Symptoms today" value={String(symptomsToday)} />
      </div>

      <SubHeader>This week at a glance</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <WashRow label="Mood"   values={mood7}   tint={moodTint}   />
        <WashRow label="Energy" values={energy7} tint={energyTint} />
        <div style={{ marginTop: 10, fontSize: 13, color: T.muted }}>{symptoms7.length} symptom{symptoms7.length === 1 ? "" : "s"} logged this week.</div>
      </div>

      <SubHeader>What to track this week</SubHeader>
      <Carousel>
        <CarouselCard><CarouselIcon>💧</CarouselIcon><CarouselTitle>Hydration</CarouselTitle><CarouselBody>Affects everything — hormone transport, energy, skin. Aim for 2L but increase by 500ml around ovulation when body temperature rises.</CarouselBody></CarouselCard>
        <CarouselCard><CarouselIcon>😴</CarouselIcon><CarouselTitle>Sleep</CarouselTitle><CarouselBody>Sleep quality changes across your cycle. Progesterone's sedating effect in early luteal can feel deep, but late luteal often brings disrupted nights.</CarouselBody></CarouselCard>
        <CarouselCard><CarouselIcon>🥗</CarouselIcon><CarouselTitle>Nutrition shifts</CarouselTitle><CarouselBody>Your needs shift each phase. Iron and B12 matter most post-period. Magnesium and B6 matter most pre-period.</CarouselBody></CarouselCard>
      </Carousel>

      <SubHeader>Log something</SubHeader>
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

// ─── CYCLE ────────────────────────────────────────────────────────────
function CycleTab({ profile, cycle, phase, stage, isMeno }) {
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
        phase === "luteal"     ? "Progesterone dominates now — your body has shifted into preparation mode. Energy is more conserved." :
        "You're bleeding. Iron is dipping; rest where you can, and gentle movement helps more than total rest."
      }`;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <GlanceCard>{glance}</GlanceCard>

      <Accordion id="hormone-curve" title="Why you feel different across the month — the hormone curve" open={open === "hormone-curve"} onToggle={toggle}>
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
      </Accordion>

      <Accordion id="fertility-signs" title="Your body's fertility signals — what cervical mucus is telling you" open={open === "fertility-signs"} onToggle={toggle}>
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
          Resting temperature rises 0.2–0.5°C after ovulation due to progesterone's thermogenic effect. Take it at the same time every morning before getting up. A clear thermal shift <em>confirms</em> ovulation happened — it doesn't predict it.
        </p>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>OPK — ovulation predictor kits</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          Measures LH surge. Ovulation typically follows 24–36 hours after the surge begins. PCOS can cause multiple LH surges without ovulation.
        </p>
      </Accordion>

      <Accordion id="cycle-health-indicators" title="What healthy looks like — and the red flags worth taking seriously" open={open === "cycle-health-indicators"} onToggle={toggle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 8 }}>A healthy cycle typically looks like</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {CYCLE_HEALTHY_BULLETS.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 8 }}>Red flags to take seriously</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {CYCLE_RED_FLAGS.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </Accordion>

      <Accordion id="pcos-cycle" title="PCOS cycle patterns — what to look for" open={open === "pcos-cycle"} onToggle={toggle}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          Cycles often 35–90+ days, or absent. Due to elevated androgens and insulin resistance disrupting follicle development. Multiple LH surges, elevated testosterone, often (not always) polycystic ovaries on scan. Not everyone with PCOS has cysts — it's a metabolic and hormonal condition, not just a structural one.
        </p>
      </Accordion>

      <Accordion id="luteal-phase-defect" title="When your luteal phase is too short — diagnosis and support" open={open === "luteal-phase-defect"} onToggle={toggle}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          The luteal phase normally lasts 12–16 days. If consistently under 10 days, or if progesterone levels are low in the mid-luteal phase (day 21 blood test), this may be luteal phase defect — insufficient progesterone to maintain a potential pregnancy. Symptoms: spotting before periods, short cycles, difficulty conceiving, recurrent early miscarriage. A day 21 progesterone test (or 7 days after tracked ovulation) measures this — optimal is above 30 nmol/L. Lifestyle support: reduce intense exercise, prioritise sleep, manage stress (cortisol directly suppresses progesterone). Medical options: progesterone supplements in the luteal phase.
        </p>
      </Accordion>

      <Accordion id="phase-by-phase" title="Phase by phase — what each does for your body" open={open === "phase-by-phase"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {["follicular", "ovulatory", "luteal", "menstrual"].map((p) => (
            <div key={p} style={{ borderLeft: `3px solid ${PHASE_COLOUR[p]}`, paddingLeft: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }} aria-hidden="true">{PHASE_EMOJI[p]}</span>
                <strong style={{ fontSize: 14.5, color: T.espresso }}>{PHASE_LABEL[p]}</strong>
                {p === phase && !isMeno && (
                  <span style={{ marginLeft: "auto", fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>Now</span>
                )}
              </div>
              <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>{PHASE_CONTENT[p].summary}</div>
            </div>
          ))}
        </div>
      </Accordion>

      {!isMeno && (
        <Accordion id="phase-food-movement" title={`What to eat and how to move in your ${PHASE_LABEL[phase]?.toLowerCase()} phase`} open={open === "phase-food-movement"} onToggle={toggle}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>🍽️ What to eat</div>
          <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>{phaseContent.food}</p>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>🏃‍♀️ How to move</div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>{phaseContent.movement}</p>
        </Accordion>
      )}

      <ExpertQuote tab="cycle" />
      <NewsStrip tab="cycle" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── LIFE STAGE ────────────────────────────────────────────────────────
function LifeStageTab({ profile }) {
  const initialKey = resolveLifeStageKey(profile);
  const [selected, setSelected] = useState(initialKey);
  const content = LIFE_STAGE_CONTENT[selected] || LIFE_STAGE_CONTENT.reproductive;
  const isCurrent = selected === initialKey;
  const [open, setOpen] = useState(null);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const glance = `You're in your ${LIFE_STAGE_LABEL[initialKey]?.toLowerCase() || initialKey} years. ${LIFE_STAGE_CONTENT[initialKey]?.oneliner || "Your cycle is your most important health metric."}`;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <GlanceCard>{glance}</GlanceCard>

      <SubHeader>Browse life stages · your current is highlighted</SubHeader>
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
              letterSpacing: 0.2, fontFamily: '"Inter", system-ui, sans-serif',
              whiteSpace: "nowrap",
            }}>{LIFE_STAGE_LABEL[k] || prettyName(k)}{current ? " · you" : ""}</button>
          );
        })}
      </div>

      <div style={{ background: T.jessBg, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>
          {isCurrent ? "Your current life stage" : "Browsing"}
        </div>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 28, fontWeight: 600, color: T.espresso, marginBottom: 6, letterSpacing: -0.3 }}>
          {LIFE_STAGE_LABEL[selected] || prettyName(selected)}
        </div>
        <div style={{ fontSize: 14, color: T.espresso, lineHeight: 1.55, fontFamily: '"Fraunces", Georgia, serif' }}>{content.oneliner}</div>
      </div>

      {content.sections.map((sec, i) => (
        <Accordion key={i} id={`stage-${i}`} title={sec.title} open={open === `stage-${i}`} onToggle={toggle}>
          <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{sec.body}</p>
        </Accordion>
      ))}

      {Array.isArray(content.redFlags) && content.redFlags.length > 0 && (
        <>
          <SubHeader>When to see your GP</SubHeader>
          <div style={{ background: T.blushBg, border: `1px solid ${T.blush}`, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10, fontWeight: 700 }}>These warrant a GP conversation:</div>
            <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
              {content.redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
            </ul>
          </div>
        </>
      )}

      <ExpertQuote tab="life-stage" />
      <NewsStrip tab="life-stage" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── SKIN & HAIR ───────────────────────────────────────────────────────
function SkinHairTab({ profile, symptoms, skinLogs, phase, stage, isMeno }) {
  const phaseLabel = isMeno ? prettyName(stage) : (PHASE_LABEL[phase] || prettyName(phase));
  const initialOpen = DEFAULT_OPEN["skin-hair"][phase] || null;
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);
  const acne = useMemo(() => symptoms.filter((r) => /acne|breakout/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms]);

  const glance = isMeno
    ? "Declining oestrogen means less collagen and less natural oil production. Hyaluronic acid, ceramides, and daily SPF are the highest-impact interventions for skin in this stage."
    : phase === "follicular"
      ? "In the follicular phase, your skin's collagen production is supported by rising oestrogen. It's your best window for active ingredients like retinol."
      : phase === "luteal"
        ? "Progesterone is increasing sebum and shifting your skin barrier. Stick to a gentler, barrier-focused routine and resist introducing new actives."
        : phase === "menstrual"
          ? "Your skin is most sensitive now. Barrier-focused care, no new actives, ceramide-rich moisturiser."
          : "Skin is often at its best around ovulation. Maintain your routine.";

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <GlanceCard>{glance}</GlanceCard>

      <Accordion id="how-hormones-skin" title="How hormones control your skin — the mechanism" open={open === "how-hormones-skin"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{HORMONES_CONTROL_SKIN}</p>
      </Accordion>

      <Accordion id="hormonal-acne" title="Why you break out before your period — and what actually works" open={open === "hormonal-acne"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {HORMONAL_ACNE_CONTENT.map((c, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.blush}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{c.title}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{c.body}</p>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion id="phase-skincare" title="Your phase-synced skincare protocol" open={open === "phase-skincare"} onToggle={toggle}>
        <Carousel>
          {(isMeno ? ["meno"] : ["menstrual", "follicular", "ovulatory", "luteal"]).map((p) => (
            <CarouselCard key={p} highlight={!isMeno && p === phase}>
              <CarouselIcon>{isMeno ? "🌿" : PHASE_EMOJI[p]}</CarouselIcon>
              <CarouselTitle>{isMeno ? phaseLabel : PHASE_LABEL[p]}{!isMeno && p === phase ? " · Now" : ""}</CarouselTitle>
              <CarouselBody>{isMeno ? "Hyaluronic acid serums, barrier-supporting moisturisers (ceramides), and daily SPF are the highest-impact interventions." : PHASE_SKIN_PROTOCOL[p]}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
      </Accordion>

      <Accordion id="hair-science" title="Hair science — cycles, postpartum shedding, DHT, ferritin" open={open === "hair-science"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {HAIR_SCIENCE.map((h, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.sage}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{h.title}</div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{h.body}</p>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion id="acne-tracker" title={`Your hormonal acne this month — ${acne.length} ${acne.length === 1 ? "entry" : "entries"}`} open={open === "acne-tracker"} onToggle={toggle}>
        <p style={{ margin: 0, padding: "10px 12px", background: T.blushBg, borderLeft: `3px solid ${T.blush}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.6, color: T.espresso, borderRadius: "0 8px 8px 0" }}>
          {acne.length >= 3
            ? "That's a pattern, not noise. Consider a salicylic acid serum from day 14 of your cycle and discuss a GP referral if it's impacting quality of life."
            : "Keep tracking. Hormonal acne tends to cluster in the luteal phase — patterns become clear over 2–3 cycles."}
        </p>
      </Accordion>

      <Accordion id="supplements" title="Supplement evidence — zinc, omega-3, biotin, GLA, vitamin C" open={open === "supplements"} onToggle={toggle}>
        <Carousel>
          {SKIN_HAIR_SUPPLEMENTS.map((s) => (
            <CarouselCard key={s.name}>
              <CarouselTitle>{s.name}</CarouselTitle>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>{s.benefit}</div>
              <CarouselBody>{s.note}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
        <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic", marginTop: 8 }}>Discuss with your GP or a registered nutritionist before starting any supplement.</div>
      </Accordion>

      <ExpertQuote tab="skin-hair" />
      <NewsStrip tab="skin-hair" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── BODY ──────────────────────────────────────────────────────────────
function BodyTab({ profile, symptoms, cycle, phase, isMeno }) {
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
    ? `${symptomsToday} symptom${symptomsToday === 1 ? "" : "s"} logged today. ${ranked.length > 0 ? `${prettyName(ranked[0][0])} continues to be your most-tracked this month.` : ""}`
    : `No logged symptoms today. Your body's inflammation is typically lowest in the ${phase === "follicular" ? "follicular" : phase} phase.`;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <GlanceCard>{glance}</GlanceCard>

      <Accordion id="symptom-intro" title="Understanding your symptoms — what to look for in patterns" open={open === "symptom-intro"} onToggle={toggle}>
        <p style={{ margin: "0 0 10px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          Symptoms are signals, not inconveniences to suppress. When you log symptoms consistently over 2–3 cycles, patterns emerge that can be genuinely diagnostic.
        </p>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          <li><strong>Perimenstrual cluster:</strong> symptoms 7–10 days before your period point toward progesterone sensitivity or PMDD.</li>
          <li><strong>Mid-cycle spike:</strong> symptoms at ovulation may include mittelschmerz, mood sensitivity, or digestive changes.</li>
          <li><strong>Constant symptoms:</strong> present regardless of phase — point to thyroid, anaemia, or non-hormonal causes.</li>
        </ul>
      </Accordion>

      <Accordion id="ranked-symptoms" title={`Top symptoms this month — ${ranked.length === 0 ? "nothing logged" : ranked.slice(0, 3).map(([k, n]) => `${prettyName(k)} (${n})`).join(", ")}`} open={open === "ranked-symptoms"} onToggle={toggle}>
        {ranked.length === 0
          ? <div style={{ fontSize: 13.5, color: T.muted }}>Nothing logged yet this month — track on /Today.</div>
          : <ol style={{ margin: 0, padding: "0 0 0 18px", listStyle: "decimal", color: T.espresso, fontSize: 14.5, lineHeight: 1.9 }}>
              {ranked.map(([sym, n]) => <li key={sym}><strong>{prettyName(sym)}</strong> — {n} time{n === 1 ? "" : "s"} this month</li>)}
            </ol>}
        {topKey && (
          <p style={{ margin: "14px 0 0", padding: "12px 14px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{topNote}</p>
        )}
      </Accordion>

      <Accordion id="symptom-calendar" title="Your symptom calendar — last 30 days" open={open === "symptom-calendar"} onToggle={toggle}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {symptomCountsByDay.map((e, i) => (
            <div key={i} title={`${days30[i]} · ${e.count} log${e.count === 1 ? "" : "s"}${e.severe ? " · severe" : ""}`}
              style={{ aspectRatio: "1", borderRadius: 6,
                background: e.count === 0 ? "transparent" : e.severe ? T.blushDeep : e.count >= 3 ? T.blush : T.blushLight,
                border: e.count === 0 ? `1px solid ${T.border}` : "none" }} />
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12.5, color: T.muted }}>Darker = more symptoms logged that day.</div>
      </Accordion>

      {isMeno && (
        <Accordion id="hot-flash-physiology" title="Hot flash physiology — why it actually happens" open={open === "hot-flash-physiology"} onToggle={toggle}>
          <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{HOT_FLASH_PHYSIOLOGY}</p>
        </Accordion>
      )}

      <Accordion id="pcos" title="PCOS — more than irregular periods" open={open === "pcos"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{PCOS_CONTENT.intro}</p>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>The full symptom profile</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {PCOS_CONTENT.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <p style={{ margin: 0, padding: "10px 12px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{PCOS_CONTENT.driver}</p>
      </Accordion>

      <Accordion id="endometriosis" title="Endometriosis — the delayed-diagnosis condition" open={open === "endometriosis"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{ENDO_CONTENT.intro}</p>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {ENDO_CONTENT.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <p style={{ margin: 0, padding: "10px 12px", background: T.blushBg, borderLeft: `3px solid ${T.blush}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{ENDO_CONTENT.diagnosis}</p>
      </Accordion>

      <Accordion id="pmdd" title="When PMS becomes something more — understanding PMDD" open={open === "pmdd"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{PMDD_CONTENT}</p>
      </Accordion>

      <ExpertQuote tab="body" />
      <NewsStrip tab="body" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── MIND ──────────────────────────────────────────────────────────────
function MindTab({ profile, checkins, symptoms, phase, stage }) {
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
      ? "Ovulatory phase: spatial reasoning and coordination peak. Confidence and assertiveness often follow the testosterone spike."
      : phase === "luteal"
        ? "Luteal phase: detail-oriented focus improves, but late-luteal can bring dips in attention and executive function."
        : "Menstrual phase: cognition often returns to baseline as oestrogen rebuilds. Rest is restorative.";

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <GlanceCard>{glance}</GlanceCard>

      <Accordion id="oestrogen-brain" title="Oestrogen and your brain — the receptor map" open={open === "oestrogen-brain"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{OESTROGEN_BRAIN}</p>
      </Accordion>

      <Accordion id="cognition-by-phase" title="Your cognitive peaks across the month" open={open === "cognition-by-phase"} onToggle={toggle}>
        <Carousel>
          {COGNITION_BY_PHASE.map((c, i) => (
            <CarouselCard key={i}>
              <CarouselTitle>{c.phase}</CarouselTitle>
              <CarouselBody>{c.body}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: T.muted, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.65 }}>
          In perimenopause, erratic oestrogen fluctuations (rather than the decline itself) drive most cognitive symptoms.
        </p>
      </Accordion>

      <Accordion id="hpa-hpg" title="Why stress disrupts your cycle — the HPA–HPG axis" open={open === "hpa-hpg"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{HPA_HPG}</p>
      </Accordion>

      <Accordion id="mood-energy-30" title="Your mood and energy texture · last 30 days" open={open === "mood-energy-30"} onToggle={toggle}>
        <SubHeader>Mood</SubHeader>
        <WashGrid values={mood30} days={days30} tint={moodTint} caption="Your emotional texture over 30 days." />
        <SubHeader>Energy</SubHeader>
        <WashGrid values={energy30} days={days30} tint={energyTint} caption="Your energy texture over 30 days." />
      </Accordion>

      <Accordion id="sleep-14" title={`Your sleep · 14-day chart · avg ${sleepAvg != null ? `${sleepAvg.toFixed(1)}h` : "—"}`} open={open === "sleep-14"} onToggle={toggle}>
        <svg viewBox="0 0 280 80" style={{ width: "100%", height: 90 }}>
          {sleep14.map((h, i) => {
            const x = 4 + i * 20;
            const height = h != null ? Math.max(4, Math.min(60, (h / 10) * 60)) : 0;
            const y = 70 - height;
            const fill = h == null ? "none" : h >= 7 ? T.sage : h >= 5 ? T.gold : T.blushLight;
            const stroke = h == null ? T.border : "none";
            return <rect key={i} x={x} y={y} width={16} height={height || 4} fill={fill} stroke={stroke} strokeDasharray="2 2" rx={3} />;
          })}
          <line x1={4} y1={70} x2={276} y2={70} stroke={T.border} strokeWidth={1} />
        </svg>
        <div style={{ marginTop: 8, fontSize: 13, color: T.muted }}>sage ≥7h · gold 5–7h · blush &lt;5h</div>
      </Accordion>

      <Accordion id="sleep-cycle" title="Sleep and your cycle — progesterone, GABA, and night sweats" open={open === "sleep-cycle"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{SLEEP_CYCLE}</p>
      </Accordion>

      <Accordion id="pmdd-neurosteroid" title="PMDD and the neurosteroid mechanism — why intermittent SSRIs work" open={open === "pmdd-neurosteroid"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          In PMDD, normal progesterone levels produce abnormal brain responses. Progesterone converts to allopregnanolone, which normally acts as a positive allosteric modulator of GABA-A receptors — meaning it should be calming. In women with PMDD, GABA-A receptor subunit composition appears to have changed in a way that makes allopregnanolone dysregulating rather than calming. SSRIs appear to work for PMDD by rapidly changing allopregnanolone levels (a neurosteroid effect separate from their antidepressant effect — which is why they work within hours in PMDD rather than weeks).
        </p>
      </Accordion>

      <Accordion id="stress-stage" title="Mental health · for your stage" open={open === "stress-stage"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          {stage === "perimenopause" || stage === "menopause"
            ? "Anxiety and mood changes are among the most underdiagnosed perimenopause symptoms. Oestrogen plays a key role in serotonin regulation. Many women are prescribed antidepressants when HRT would be more appropriate — advocate for yourself."
            : stage === "postpartum"
              ? "Postnatal depression affects 1 in 5 women and can develop up to a year after birth. Baby blues (first 2 weeks) are normal; persistent low mood, anxiety, or intrusive thoughts warrant immediate GP contact."
              : "Luteal phase mood changes are driven by progesterone's effect on GABA and serotonin. If mood changes are severe and disrupt your life every cycle, PMDD may be worth exploring with a GP."}
        </p>
      </Accordion>

      <Accordion id="nervous-system" title="Nervous system regulation — techniques that actually work" open={open === "nervous-system"} onToggle={toggle}>
        <Carousel>
          {NS_REGULATION.map((n, i) => (
            <CarouselCard key={i}>
              <CarouselTitle>{n.title}</CarouselTitle>
              <CarouselBody>{n.body}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
      </Accordion>

      <Accordion id="brain-fog" title={`Brain fog this month — ${brainFog.length} day${brainFog.length === 1 ? "" : "s"} logged`} open={open === "brain-fog"} onToggle={toggle}>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 24, fontWeight: 600, color: T.gold, marginBottom: 4 }}>{brainFog.length}</div>
        <div style={{ fontSize: 13, color: T.muted }}>brain fog days logged in the last 30 days</div>
      </Accordion>

      <ExpertQuote tab="mind" />
      <NewsStrip tab="mind" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── NOURISHMENT ───────────────────────────────────────────────────────
function NourishmentTab({ checkins, meals, supps, phase, isMeno }) {
  const today = todayLocal();
  const todayKey = todayIso();
  const todayChk = checkins.find((r) => dateKeyOf(r) === todayKey);
  const cut7 = new Date(today); cut7.setDate(today.getDate() - 6);
  const meals7 = meals.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cut7; });

  const days7 = useMemo(() => lastNDayKeys(7), []);
  const mealCountByDay = useMemo(() => {
    const m = new Map(days7.map((d) => [d, 0]));
    for (const r of meals7) { const k = dateKeyOf(r); if (m.has(k)) m.set(k, m.get(k) + 1); }
    return days7.map((d) => m.get(d));
  }, [meals7, days7]);

  const hydrationToday = (() => {
    const v = todayChk?.hydration ?? todayChk?.water_glasses ?? todayChk?.water;
    if (v != null) return Number(v) * 250;
    const todayMeals = meals.filter((m) => dateKeyOf(m) === todayKey);
    return todayMeals.reduce((s, m) => s + (Number(m.water_ml) || 0), 0);
  })();
  const hydroPct = Math.min(100, Math.round((hydrationToday / 2000) * 100));

  const initialOpen = DEFAULT_OPEN.nourishment[phase] || "phase-nutrition";
  const [open, setOpen] = useState(initialOpen);
  const toggle = (id) => setOpen((cur) => cur === id ? null : id);

  const glance = phase === "follicular"
    ? "Today: support oestrogen metabolism with cruciferous vegetables (broccoli, kale) — their DIM compound helps the liver process oestrogen through the protective pathway."
    : phase === "ovulatory"
      ? "Today: prioritise zinc-rich foods (pumpkin seeds, chickpeas) to support progesterone production for your upcoming luteal phase."
      : phase === "luteal"
        ? "Today: protein at every meal stabilises blood sugar better than any other macronutrient. Insulin resistance increases in luteal — this matters."
        : "Today: iron-rich foods (red meat, lentils, leafy greens) replenish what's been lost. Pair with vitamin C to triple absorption.";

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <GlanceCard>{glance}</GlanceCard>

      <Accordion id="phase-nutrition" title="Phase nutrition — the why behind the what" open={open === "phase-nutrition"} onToggle={toggle}>
        <Carousel>
          {["menstrual", "follicular", "ovulatory", "luteal"].map((p) => (
            <CarouselCard key={p} highlight={!isMeno && p === phase}>
              <CarouselIcon>{PHASE_EMOJI[p]}</CarouselIcon>
              <CarouselTitle>{PHASE_LABEL[p]}{!isMeno && p === phase ? " · Now" : ""}</CarouselTitle>
              <CarouselBody>{PHASE_NUTRITION_WHY[p]}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
      </Accordion>

      <Accordion id="estrobolome" title="The estrobolome — your gut-hormone axis" open={open === "estrobolome"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{ESTROBOLOME}</p>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>What disrupts the estrobolome</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {ESTROBOLOME_DISRUPT.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>What supports it</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {ESTROBOLOME_SUPPORT.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </Accordion>

      <Accordion id="seed-cycling" title="Seed cycling — protocol and mechanism" open={open === "seed-cycling"} onToggle={toggle}>
        <Carousel>
          {SEED_CYCLING.map((s, i) => (
            <CarouselCard key={i}>
              <CarouselTitle>{s.phase}</CarouselTitle>
              <CarouselBody>{s.body}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
      </Accordion>

      <Accordion id="blood-sugar" title="Blood sugar and your luteal phase" open={open === "blood-sugar"} onToggle={toggle}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{BLOOD_SUGAR_LUTEAL}</p>
      </Accordion>

      <Accordion id="meals-hydration" title="Your meals and hydration this week" open={open === "meals-hydration"} onToggle={toggle}>
        <SubHeader>This week's meals</SubHeader>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-around" }}>
            {days7.map((d, i) => (
              <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div title={`${mealCountByDay[i]} meals`} style={{
                  width: 22, height: 22, borderRadius: 999,
                  background: mealCountByDay[i] >= 3 ? T.sage : mealCountByDay[i] > 0 ? T.gold : "transparent",
                  border: mealCountByDay[i] === 0 ? `1px dashed ${T.border}` : "none",
                }} />
                <div style={{ fontSize: 10.5, color: T.muted }}>{new Date(d).toLocaleDateString("en-GB", { weekday: "short" })}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: T.muted }}>Sage = on track (≥3 meals) · gold = sparse · dashed = no logs.</div>
        </div>
        <SubHeader>Hydration today</SubHeader>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ height: 14, background: T.border, borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${hydroPct}%`, background: T.sage, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 13, color: T.espresso }}>
            <strong>{hydrationToday || 0}ml</strong> · target 2000ml · <span style={{ color: T.muted }}>{Math.max(0, 2000 - hydrationToday)}ml to go</span>
          </div>
        </div>
      </Accordion>

      <Accordion id="edcs" title="Endocrine disruptors — practical swaps" open={open === "edcs"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.muted }}>
          Reducing high-exposure sources is practical and achievable. Perfection isn't necessary.
        </p>
        <Carousel>
          {EDC_LIST.map((e) => (
            <CarouselCard key={e.name}>
              <CarouselTitle>{e.name}</CarouselTitle>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}><strong>Found in:</strong> {e.found}</div>
              <CarouselBody><strong>Swap:</strong> {e.swap}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
      </Accordion>

      <ExpertQuote tab="nourishment" />
      <NewsStrip tab="nourishment" />
      <FooterDisclaimer />
    </div>
  );
}

// ─── CARE ──────────────────────────────────────────────────────────────
function CareTab({ profile, symptoms, meds, stage, isMeno, phase }) {
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
      <GlanceCard>{glance}</GlanceCard>

      <Accordion id="blood-tests" title="Blood tests every woman should know — ask by name" open={open === "blood-tests"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: T.muted, lineHeight: 1.6, fontFamily: '"Fraunces", Georgia, serif' }}>
          Many aren't included by default in standard panels.
        </p>
        <Carousel>
          {BLOODS_CORE.map((b) => (
            <CarouselCard key={b.name}>
              <CarouselTitle>{b.name}</CarouselTitle>
              <CarouselBody>{b.body}</CarouselBody>
            </CarouselCard>
          ))}
        </Carousel>
      </Accordion>

      <Accordion id="hormonal-panel" title="Hormonal panel — by life stage" open={open === "hormonal-panel"} onToggle={toggle}>
        <div style={{ display: "grid", gap: 10 }}>
          {BLOODS_HORMONAL.map((b) => (
            <div key={b.name} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
              <strong style={{ fontSize: 14.5, color: T.espresso }}>{b.name}</strong>
              <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>{b.body}</p>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion id="range-vs-optimal" title="How to read your results — range vs optimal" open={open === "range-vs-optimal"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          Labs report a 'reference range' — the range seen in 95% of tested people, not the range for optimal function. When a GP says 'your bloods are normal,' it means within range — not optimal for how you want to feel.
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
      </Accordion>

      <Accordion id="hrt-conversation" title="HRT — how to have the conversation with your GP" open={open === "hrt-conversation"} onToggle={toggle}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          If you think you might be perimenopausal, you are entitled to discuss HRT. NICE guidelines (2015, updated 2019) state HRT should be offered to women with vasomotor symptoms where there are no contraindications.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {HRT_CONVERSATION.map((h, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
              <strong style={{ fontSize: 14, color: T.espresso }}>{h.title}</strong>
              <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{h.body}</p>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion id="supplement-stacking" title="Supplement stacking — what goes together, what doesn't" open={open === "supplement-stacking"} onToggle={toggle}>
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
      </Accordion>

      <Accordion id="gp-prep" title="GP appointment prep — how to be heard in 10 minutes" open={open === "gp-prep"} onToggle={toggle}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Come with</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {GP_APPT_BRING.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Language that helps</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {GP_APPT_LANGUAGE.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </Accordion>

      <Accordion id="meds-adherence" title={`Your medications · last 14 days · ${medsByName.length} tracked`} open={open === "meds-adherence"} onToggle={toggle}>
        {medsByName.length === 0
          ? <div style={{ fontSize: 13.5, color: T.muted }}>No medications logged in the last 14 days.</div>
          : (
            <div style={{ display: "grid", gap: 10 }}>
              {medsByName.map((m) => (
                <div key={m.name} style={{ background: T.cream, borderRadius: 10, padding: 12 }}>
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
      </Accordion>

      <Accordion id="to-discuss" title={`Things to discuss with your GP — ${toDiscuss.length} from your data`} open={open === "to-discuss"} onToggle={toggle}>
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
      </Accordion>

      <SubHeader>GP-ready summary</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <FileText className="w-5 h-5" style={{ marginTop: 2, color: T.gold }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 14, color: T.espresso }}>Generate your health summary for your GP</strong>
            <div style={{ marginTop: 4, fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
              A structured PDF of your symptoms, medications, sleep and mood — ready to share at your next appointment.
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
        <Link to="/LifeStageCare" style={{ display: "block", background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", textDecoration: "none", color: T.espresso, marginBottom: 14 }}>
          <strong style={{ fontSize: 14 }}>Take the MRS questionnaire →</strong>
          <div style={{ marginTop: 4, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
            A validated 11-symptom questionnaire to score your menopause symptom burden.
          </div>
        </Link>
      )}

      <ExpertQuote tab="care" />
      <NewsStrip tab="care" />
      <FooterDisclaimer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SHARED v3 COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function GlanceCard({ children }) {
  return (
    <div style={{
      background: T.blushBg, borderLeft: `3px solid ${T.blush}`,
      padding: "14px 16px", borderRadius: "0 12px 12px 0", marginBottom: 16,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: T.blushDeep, fontWeight: 800, marginBottom: 6 }}>At a glance</div>
      <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 15, lineHeight: 1.65, color: T.espresso }}>{children}</p>
    </div>
  );
}

function Accordion({ id, title, open, onToggle, children }) {
  return (
    <div style={{
      marginBottom: 10,
      background: "#FFFFFF", borderRadius: 12,
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      overflow: "hidden",
    }}>
      <button
        onClick={() => onToggle(id)}
        style={{
          width: "100%", padding: "14px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "transparent", border: "none", cursor: "pointer",
          textAlign: "left", gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: T.espresso, lineHeight: 1.45, fontFamily: '"Inter", system-ui, sans-serif' }}>{title}</span>
        <ChevronDown
          size={16}
          style={{
            color: T.muted, flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>
      <div style={{
        maxHeight: open ? 8000 : 0,
        overflow: "hidden",
        transition: "max-height 0.35s ease",
      }}>
        <div style={{ padding: "0 16px 16px" }}>{children}</div>
      </div>
    </div>
  );
}

function Carousel({ children }) {
  return (
    <div style={{
      display: "flex", gap: 12,
      overflowX: "auto", scrollSnapType: "x mandatory",
      paddingBottom: 10, marginBottom: 6,
      scrollbarWidth: "thin",
    }}>
      {children}
    </div>
  );
}
function CarouselCard({ children, highlight }) {
  return (
    <div style={{
      minWidth: 240, maxWidth: 280,
      scrollSnapAlign: "start", flexShrink: 0,
      background: T.cream,
      border: highlight ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
      borderRadius: 12, padding: 14,
    }}>{children}</div>
  );
}
function CarouselIcon({ children }) {
  return <div style={{ fontSize: 22, marginBottom: 8 }} aria-hidden="true">{children}</div>;
}
function CarouselTitle({ children }) {
  return <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>{children}</div>;
}
function CarouselBody({ children }) {
  return <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: T.espresso }}>{children}</p>;
}

function NewsStrip({ tab }) {
  const items = NEWS_BY_TAB[tab];
  if (!items?.length) return null;
  return (
    <div>
      <SubHeader>In the news</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {items.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
            background: T.cream, borderLeft: `3px solid ${T.blush}`,
            borderRadius: "0 10px 10px 0", padding: "12px 14px",
            textDecoration: "none", color: T.espresso,
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
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

function ExpertQuote({ tab }) {
  const q = QUOTES_BY_TAB[tab];
  if (!q) return null;
  return (
    <div>
      <SubHeader>What the experts say</SubHeader>
      <div style={{ background: T.blushBg, borderRadius: 12, padding: "16px 18px", marginBottom: 6 }}>
        <div style={{ fontStyle: "italic", fontSize: 15, color: T.espresso, lineHeight: 1.65, marginBottom: 10, fontFamily: '"Fraunces", Georgia, serif' }}>
          "{q.quote}"
        </div>
        <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
          — {q.attribution}
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.muted, fontStyle: "italic", textAlign: "center", marginBottom: 14 }}>
        Not a FemWell endorsement — public statements by named experts.
      </div>
    </div>
  );
}

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
        <Sparkles className="w-3 h-3" /> Health Corner v3 · progressive disclosure
      </span>
      <span style={{ color: "#9B8B7A", fontSize: 12 }}>Sticky phase bar · accordion sections · carousels · news + expert quotes</span>
    </div>
  );
}
function canvasStyle() {
  return {
    backgroundColor: T.paper, color: T.espresso, borderRadius: 18,
    overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
    border: `1px solid rgba(212,175,55,0.22)`,
    fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
  };
}
function SubHeader({ children }) {
  return (
    <div style={{
      padding: "14px 0 8px",
      fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
      color: T.muted, fontWeight: 700,
    }}>{children}</div>
  );
}
function Tile({ icon, label, value, large }) {
  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      borderRadius: 12, padding: 14,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    }}>
      <div style={{ fontSize: 22 }} aria-hidden="true">{icon}</div>
      <div style={{ fontSize: large ? 22 : 17, fontWeight: 700, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.1 }}>{value}</div>
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
      background: "rgba(212,175,55,0.08)", border: `1px dashed rgba(212,175,55,0.45)`,
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
