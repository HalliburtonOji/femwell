// ─────────────────────────────────────────────────────────────────────────────
// HealthCornerDemo — single tab on /Ideas (FoundersOS) that renders a
// fully tabbed Health Corner hub with 8 inner tabs:
//
//   Overview · Cycle · Life Stage · Skin & Hair · Body · Mind ·
//   Nourishment · Care
//
// v2 (2026-05-26) — content upgrade. Structure is unchanged from v1:
// sticky pill rail, tab switching replaces content, data fetched once
// at the FoundersOS level and passed in as props. What changed is
// substantial: every tab now carries expert-level health copy —
// hormone curves, cycle health indicators, life-stage detail across
// 11 stages, hormonal acne mechanisms, PCOS / endometriosis / PMDD
// deep-dives, oestrogen-and-brain neurobiology, the estrobolome,
// blood-test guidance, HRT-conversation scripts, GP-appointment prep.
//
// All content is educational and explicitly not medical advice; each
// tab carries a small footer disclaimer.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles, FileText, ChevronRight } from "lucide-react";

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
  {
    range: "Days 1–5 · Menstruation",
    text: "Oestrogen and progesterone are at their lowest. FSH starts rising to begin recruiting follicles. You may feel more inward, fatigued, or emotional — this is hormonal, not weakness.",
  },
  {
    range: "Days 6–13 · Follicular phase",
    text: "Oestrogen rises steadily as your dominant follicle grows. This is when most women feel sharpest, most energetic, most socially confident. Oestrogen stimulates dopamine, serotonin, and verbal memory centres in the brain. Skin often looks best now.",
  },
  {
    range: "Day 14 · Ovulation",
    text: "A surge of LH triggers ovulation. Oestrogen peaks, then drops briefly. Testosterone also spikes around ovulation — many women notice heightened libido and assertiveness. BBT rises by 0.2–0.5°C after ovulation and stays elevated.",
  },
  {
    range: "Days 15–28 · Luteal phase",
    text: "Progesterone rises significantly (made by the corpus luteum). It's calming, warming, and appetite-increasing. In some women progesterone's metabolite allopregnanolone disrupts GABA receptors, causing anxiety or mood changes. PMS symptoms peak in the final few days as both hormones crash.",
  },
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
  { title: "Where it shows up", body: "Hormonal acne tends to cluster along the jaw, chin, and lower cheeks — the areas with the highest density of androgen-sensitive sebaceous glands. It typically peaks in the 7–10 days before your period." },
  { title: "Why salicylic acid works", body: "It's lipid-soluble, meaning it can penetrate sebum-filled pores and dissolve the plug from the inside. AHAs (glycolic, lactic) work on the surface but can't penetrate the pore as effectively." },
  { title: "Retinoids vs benzoyl peroxide", body: "For hormonal/comedonal acne, retinoids (retinol, tretinoin) are superior — they regulate cell turnover and prevent follicle blockage. Benzoyl peroxide kills P. acnes bacteria and is better for inflammatory/pustular acne. Many patterns benefit from retinoids in the follicular phase and targeted benzoyl peroxide for active spots." },
  { title: "Niacinamide", body: "Reduces sebum production by ~52% in clinical studies at 2% concentration. Also strengthens the barrier (ceramide synthesis), reduces hyperpigmentation post-breakout, and is suitable across all cycle phases." },
];

const PHASE_SKIN_PROTOCOL = {
  menstrual: "Skin is most sensitive now. Barrier is compromised, inflammation is higher. Stick to gentle cleansing, ceramide-rich moisturiser, and avoid introducing new actives. If you use retinol, skip during heavy bleeding days.",
  follicular: "Oestrogen rising = skin's best window. Introduce or resume actives — retinol, AHAs, vitamin C. Skin tolerates more now. Good time for in-clinic treatments if you have them (peels, microneedling).",
  ovulatory: "Skin often at its best. Maintain your routine. Oil production may increase slightly around ovulation.",
  luteal: "Progesterone rises, sebum increases, barrier shifts. Switch to lighter moisturisers. Use salicylic acid toner or spot treatment from day 17. Hold off on new actives. Richer emollients if dryness rather than oiliness is your pattern.",
};

const HAIR_SCIENCE = [
  { title: "Hair grows in cycles", body: "Anagen (active growth, 2–7 years — oestrogen extends this phase), catagen (transition, 2 weeks), telogen (resting, 3 months, then the hair sheds). At any time, ~85% of your hairs should be in anagen." },
  { title: "Postpartum hair loss (telogen effluvium)", body: "During pregnancy, elevated oestrogen keeps most hairs in anagen. Post-birth, oestrogen crashes, and a mass cohort of hairs simultaneously enter telogen. Three months later, they all shed. Peaks at 3–4 months postpartum and resolves by 12–18 months in most women." },
  { title: "Telogen effluvium vs female pattern hair loss", body: "TE = diffuse shed all over the scalp, often triggered by a specific event (childbirth, illness, crash diet, stress, surgery), typically recovers once trigger resolves. Female pattern hair loss = progressive thinning at the crown and parting, often a family history, DHT-driven follicle miniaturisation." },
  { title: "The DHT mechanism", body: "In genetically susceptible follicles, DHT binds to androgen receptors and progressively shortens the anagen phase — follicles miniaturise and eventually stop producing visible hair. Minoxidil extends anagen and improves blood flow. Finasteride/dutasteride block 5-alpha-reductase (converts testosterone to DHT) — increasingly used off-label in women under specialist supervision." },
  { title: "The ferritin factor", body: "Ferritin (stored iron) is the most commonly missed variable in hair loss. Lab 'normal' ranges can be as low as 12 µg/L, but for optimal hair growth the threshold appears to be 70 µg/L or above. Ask specifically for ferritin, not just haemoglobin — haemoglobin can be normal while ferritin is depleted." },
];

const SKIN_HAIR_SUPPLEMENTS = [
  { name: "Zinc",                benefit: "Inhibits 5-α-reductase, regulates sebum.", note: "Evidence for acne and female pattern hair loss. 25mg/day. Take away from calcium/iron." },
  { name: "Omega-3 (EPA dominant)", benefit: "Anti-inflammatory on sebaceous glands.", note: "EPA specifically has evidence for reducing inflammatory acne and improving scalp blood flow. 2,000mg/day combined EPA+DHA, EPA majority." },
  { name: "Biotin",              benefit: "Only useful if deficient.",                note: "Dietary biotin deficiency is genuinely rare. Supplementing when levels are normal has no evidence for hair growth. Can cause false lab results (thyroid, troponin)." },
  { name: "Evening primrose oil (GLA)", benefit: "For hormonal skin dryness, eczema.", note: "GLA (gamma-linolenic acid) converts to anti-inflammatory prostaglandins. 1,000–3,000mg/day." },
  { name: "Vitamin C",           benefit: "Cofactor for collagen synthesis.",         note: "Body cannot make collagen without it. 500–1,000mg/day. Also helps iron absorption — take with iron foods." },
];

// ─── Body tab content ────────────────────────────────────────────────
const SYMPTOM_NOTES = {
  hot_flash:  "Hot flashes are the most common perimenopause symptom, affecting 75% of women in the transition. Triggered by a narrowing of the thermoregulatory zone in the hypothalamus caused by oestrogen fluctuation. Alcohol, caffeine, spicy food, and stress are common triggers. Keeping a trigger log can identify your personal patterns.",
  headache:   "Hormonal headaches typically cluster around menstruation (oestrogen withdrawal) and mid-luteal phase. Magnesium supplementation (400mg glycinate) has strong evidence for prevention.",
  migraine:   "Menstrual migraine is driven by the drop in oestrogen 2–3 days before bleeding. Frovatriptan or naproxen taken pre-emptively can reduce severity. Consult a GP about prophylaxis if debilitating.",
  fatigue:    "Persistent fatigue across a cycle deserves attention — iron, ferritin, B12, vitamin D and thyroid function are the first labs to ask your GP about. Sleep quality and hidden inflammation are also common drivers.",
  bloating:   "Bloating typically peaks in the luteal phase due to progesterone-driven water retention. Reducing salt, increasing potassium, and gentle movement help. Persistent bloating outside the luteal phase warrants a GP check.",
  brain_fog:  "Brain fog is driven by oestrogen's role in supporting neurotransmitter function — lower and fluctuating oestrogen directly affects memory and cognitive speed. Sleep quality is the highest-impact factor.",
  cramps:     "Primary dysmenorrhoea (cramping in early period days) is driven by prostaglandins. NSAIDs, heat, and omega-3s are evidence-based interventions. Pain that disrupts daily life is worth raising with a GP.",
  acne:       "Hormonal acne clusters along the jawline and chin and tends to flare in the luteal phase. Salicylic acid, zinc, and managing stress all help. A GP can prescribe topical retinoids or systemic options if severe.",
  insomnia:   "Sleep disruption during the late luteal phase and around menstruation is often hormonal. Cool room, magnesium glycinate, and consistent bedtime are first-line. Persistent insomnia warrants a sleep clinic referral.",
  anxiety:    "Cyclical anxiety often spikes in the luteal phase as progesterone falls. If it significantly affects your life every cycle, PMDD is worth discussing with a GP — there are effective treatments.",
  mood_swings:"Late-luteal mood shifts are common — falling progesterone and serotonin interactions. If these tip into severe low mood, ask your GP about PMDD.",
  cravings:   "Luteal cravings (often for sugar or carbs) are real and hormonally driven. Balancing blood sugar with protein at each meal and avoiding caffeine spikes reduce them meaningfully.",
};
const fallbackSymptomNote = (sym) => `${prettyName(sym)} is something I'm keeping track of. If it's affecting your daily life, raise it with your GP — they may want to investigate further.`;

const HOT_FLASH_PHYSIOLOGY = "A hot flash isn't random. Here's the mechanism: oestrogen acts as a thermostat, maintaining a 'thermoregulatory zone' of approximately 0.4°C within which your body doesn't trigger cooling (sweating) or heating (shivering) mechanisms. As oestrogen declines in perimenopause and menopause, this zone narrows to near zero — meaning the smallest rise in core body temperature (warm room, warm drink, mild exertion) immediately triggers the full heat-dissipation response: vasodilation, sweating, heart rate rise. Your body genuinely thinks you're overheating when you're not. This is why hot flashes are worst at night — your circadian temperature rhythm naturally rises during sleep cycles, constantly triggering the response. Reducing external heat triggers (layers, room temperature) helps, as does HRT (which widens the thermoregulatory zone again).";

const PCOS_CONTENT = {
  intro: "PCOS is a complex metabolic and hormonal condition. The Rotterdam diagnostic criteria require 2 of 3: irregular/absent ovulation, elevated androgens (blood test or symptoms), polycystic ovaries on ultrasound. You can have PCOS without visible cysts.",
  symptoms: [
    "Cycle: irregular, long, or absent periods; anovulatory cycles; difficulty getting pregnant",
    "Androgen excess: hormonal acne, excess facial/body hair (hirsutism), scalp hair thinning",
    "Metabolic: insulin resistance (even in lean women), difficulty maintaining weight, acanthosis nigricans",
    "Mood: higher rates of anxiety and depression — possibly driven by androgen and insulin effects on the brain",
  ],
  driver: "Insulin resistance is the driver in most PCOS cases. Managing it through nutrition (low-GI diet, reducing refined carbohydrates, regular meals) and exercise improves most PCOS symptoms including cycle regularity. Inositol (myo-inositol, 2–4g/day) has good evidence for improving insulin sensitivity and restoring ovulation.",
};

const ENDO_CONTENT = {
  intro: "Endometriosis affects 1 in 10 women but takes an average of 7–9 years to diagnose. Endometrial-like tissue grows outside the uterus — on the ovaries, peritoneum, bowel, bladder. It bleeds with each cycle and causes inflammation, adhesions, and pain.",
  symptoms: [
    "Painful periods that are severe and/or getting progressively worse over time",
    "Pain outside menstruation — mid-cycle, during sex (dyspareunia), with bowel movements",
    "Deep pelvic pain",
    "Fatigue that is severe and cyclic",
    "Bloating (the 'endo belly')",
    "Recurrent UTI symptoms without infection",
    "Back and leg pain perimenstrually",
    "Difficulty conceiving",
  ],
  diagnosis: "Key distinction from primary dysmenorrhoea: normal period pain tends to be consistent year on year and manageable. Endometriosis pain often worsens progressively. Pain outside the period window is the most important red flag. Diagnosis requires laparoscopy — blood tests and ultrasound can suggest it but cannot confirm or rule it out.",
};

const PMDD_CONTENT = "PMDD (Premenstrual Dysphoric Disorder) is not 'bad PMS.' It's a severe cyclical condition where women experience significant mood disruption — depression, anxiety, rage, hopelessness — in the luteal phase that remits completely within days of menstruation starting. The mechanism involves abnormal sensitivity to normal progesterone fluctuations. The brain's response to allopregnanolone — a progesterone metabolite that normally has a calming, GABA-agonist effect — appears paradoxically dysregulating in PMDD. Some women's GABA receptors respond atypically. Diagnostic criteria require prospective daily tracking over 2+ cycles. Symptoms must be present in the luteal phase, absent in the follicular phase, and cause significant functional impairment. SSRIs taken only in the luteal phase (day 14 to menstruation) are first-line and highly effective — the intermittent dosing specifically targets the sensitive window.";

// ─── Mind tab content ────────────────────────────────────────────────
const OESTROGEN_BRAIN = "Oestrogen receptors are found throughout the brain, particularly in the hippocampus (memory formation), prefrontal cortex (executive function, planning), and amygdala (emotional processing). This is why oestrogen fluctuations affect mood, memory, and cognition — it's not 'all in your head' in the dismissive sense; it's literally in your brain tissue.";
const COGNITION_BY_PHASE = [
  { phase: "Follicular · rising oestrogen", body: "Peak verbal fluency, working memory, and verbal memory. Many women feel sharpest and most articulate now." },
  { phase: "Ovulatory",                     body: "Spatial reasoning and coordination peak (possibly androgen-influenced)." },
  { phase: "Luteal · rising progesterone",  body: "Detail-oriented focus improves; some women feel more cautious or risk-averse. As both hormones drop in late luteal, attention and executive function dip." },
  { phase: "Perimenstrual",                  body: "Lowest oestrogen, potential for brain fog and emotional sensitivity." },
];
const HPA_HPG = "Chronic stress is one of the most common causes of cycle disruption, but the mechanism is rarely explained. The HPA axis (your stress response system) and the HPG axis (your reproductive hormone system) share regulatory pathways. CRH (corticotropin-releasing hormone), elevated under chronic stress, directly suppresses GnRH, which drives LH pulsatility. Suppressed LH means disrupted follicle development and potential anovulation. Elevated cortisol also suppresses progesterone synthesis directly. This is the physiological basis for why significant stress — bereavement, overtraining, undereating, work overwhelm — can delay ovulation, shorten the luteal phase, or stop periods entirely.";
const SLEEP_CYCLE = "Progesterone has sedative properties — it stimulates GABA-A receptors (similar to benzodiazepines) and can cause increased sleepiness and longer sleep in the early luteal phase. This is often experienced as afternoon fatigue or heavy tiredness post-ovulation. In late luteal (5–7 days before your period), the crash in both oestrogen and progesterone disrupts sleep architecture. REM sleep is often reduced. Night waking, vivid dreams, and difficulty returning to sleep are common. During perimenopause, night sweats directly fragment sleep — the hot flash wakes you in the night even if you don't consciously notice the heat. Oestrogen therapy dramatically improves sleep quality for most women.";
const NS_REGULATION = [
  { title: "Physiological sigh", body: "Double inhale through the nose (first breath, then a second sharp sniff to fully inflate the lungs) followed by a long, slow exhale. Triggers the greatest vagal (parasympathetic) activation of any breathing pattern. 1–3 repetitions have measurable effect." },
  { title: "Cold water on face/wrists", body: "Activates the mammalian dive reflex — heart rate slows via vagal activation. Effective for acute anxiety spikes." },
  { title: "Extended exhale breathing", body: "Any ratio where exhale is longer than inhale activates the parasympathetic system. 4:6 (4 counts in, 6 counts out) is effective and sustainable." },
  { title: "Timing matters", body: "These techniques have greater effect when used preventively during high-risk luteal days rather than mid-panic. Knowing your cycle gives you a window to prepare." },
];

// ─── Nourishment tab content ─────────────────────────────────────────
const PHASE_NUTRITION_WHY = {
  menstrual: "You're losing iron with blood. Focus on haem iron (red meat, liver, sardines) or non-haem iron (legumes, tofu, spinach, fortified cereals) paired with vitamin C to triple absorption. B12 (eggs, fish, dairy) supports energy. Anti-inflammatory foods (ginger, turmeric, omega-3) reduce prostaglandin-driven cramping.",
  follicular: "Oestrogen is rising — support its healthy metabolism. Cruciferous vegetables (broccoli, cauliflower, kale) contain DIM (diindolylmethane) which helps the liver process oestrogen via the protective 2-OH pathway rather than the inflammatory 16-OH pathway. Flaxseeds contain lignans that modulate oestrogen receptors. Zinc-rich foods (pumpkin seeds, chickpeas, cashews) support progesterone production for the upcoming luteal phase.",
  ovulatory: "Energy needs are slightly higher (BBT rises). Fibre becomes important to help the gut excrete used oestrogen rather than recirculating it. Probiotic foods (yogurt, kefir, sauerkraut) support the estrobolome.",
  luteal: "Progesterone increases insulin resistance slightly — blood sugar regulation matters. Protein at every meal (it stabilises blood sugar better than any other macronutrient). Magnesium-rich foods (dark chocolate, pumpkin seeds, leafy greens) support the nervous system and reduce PMS. B6 (salmon, potatoes, bananas) is a cofactor for serotonin synthesis.",
};

const ESTROBOLOME = "The estrobolome is the collection of gut bacteria that metabolise oestrogen. The liver processes used oestrogen for excretion in the bile. In the gut, beta-glucuronidase — produced by certain bacteria — can deconjugate this oestrogen, allowing it to be reabsorbed rather than excreted. High beta-glucuronidase activity (due to poor microbiome diversity) means you reabsorb more oestrogen than intended.";
const ESTROBOLOME_DISRUPT = ["Antibiotics (reduce microbial diversity broadly).", "Low-fibre diet (fibre feeds beneficial bacteria that keep beta-glucuronidase in check).", "Alcohol (alters gut motility and microbiome composition).", "High saturated fat diet."];
const ESTROBOLOME_SUPPORT = ["30+ different plant foods per week (most evidence-supported target for microbiome diversity).", "Fermented foods: kefir, yogurt, sauerkraut, kimchi, miso.", "Prebiotic fibres: garlic, onion, leeks, asparagus, oats, bananas.", "Calcium D-glucarate (500–1,000mg/day) inhibits beta-glucuronidase directly — used in oestrogen-dominant conditions."];

const SEED_CYCLING = [
  { phase: "Follicular (days 1–14)", body: "1 tbsp ground flaxseed + 1 tbsp raw pumpkin seeds daily. Flax contains lignans (phytoestrogens that modulate oestrogen receptors) plus omega-3 (ALA). Pumpkin seeds are rich in zinc, which supports the corpus luteum's progesterone production later." },
  { phase: "Luteal (days 15–28)",     body: "1 tbsp raw sunflower seeds + 1 tbsp sesame seeds daily. Sunflower seeds contain selenium and vitamin E (antioxidants supporting progesterone). Sesame contains lignans that support progesterone and may reduce excess oestrogen." },
  { phase: "Important",                body: "Seeds should be ground (flax especially — whole flaxseeds pass through undigested). Effect, if any, is cumulative — give it 3 months before evaluating." },
];

const BLOOD_SUGAR_LUTEAL = "Insulin resistance increases in the luteal phase — progesterone reduces insulin sensitivity, and some women notice blood sugar fluctuations are more pronounced in the week before their period. This can manifest as stronger carbohydrate cravings, more significant blood sugar crashes, and worsened mood if meals are skipped. Practical: never skip breakfast, eat protein before carbohydrates (reduces post-meal glucose spike by up to 30%), cinnamon (½ tsp/day) has modest evidence, chromium (200mcg) for cravings.";

const EDC_LIST = [
  { name: "BPA (bisphenol A)",  found: "Plastic containers, tin can linings, thermal receipt paper", swap: "Glass or stainless containers for hot foods/drinks, BPA-free canned goods, avoid handling thermal receipts." },
  { name: "Phthalates",         found: "Flexible plastics, synthetic fragrance in cosmetics/cleaning products", swap: "Unscented or naturally-fragranced products, glass food storage." },
  { name: "Parabens",           found: "Preservatives in cosmetics (weak oestrogen activity)", swap: "Look for paraben-free formulations for products used daily." },
  { name: "Pesticide residues", found: "Dirty Dozen list: strawberries, spinach, peppers, grapes, peaches", swap: "Buy organic where practical for these specifically; the Clean Fifteen are lower-priority." },
];

// ─── Care tab content ────────────────────────────────────────────────
const BLOODS_CORE = [
  { name: "Full blood count (FBC) + Ferritin", body: "Ferritin often not automatically included — ask by name. Lab 'normal' can be as low as 12 µg/L; for optimal hair, energy, and thyroid function, aim for 70+." },
  { name: "Vitamin D",                          body: "Deficiency near-universal in UK. Optimal 75–150 nmol/L. If deficient, may need 5,000 IU/day to correct." },
  { name: "B12",                                body: "Important for women who don't eat meat regularly or take the contraceptive pill (depletes B12). Optimal towards upper end of range (400–700 pg/mL)." },
  { name: "Thyroid (TSH + free T4)",            body: "TSH alone misses early thyroid dysfunction. If symptomatic (fatigue, hair loss, weight changes, mood, feeling cold), push for free T3 and TPOAb antibodies to screen for Hashimoto's." },
];

const BLOODS_HORMONAL = [
  { name: "Reproductive age",  body: "Day 2–3: LH, FSH, oestradiol, AMH (ovarian reserve, ovulatory function). Day 21 (or 7 days post-ovulation) progesterone — confirms ovulation and luteal adequacy." },
  { name: "TTC",               body: "Add AMH (ovarian reserve). TSH, rubella immunity, full STI screen." },
  { name: "Perimenopause",     body: "Day 2–3 FSH. Levels above 10 IU/L suggest early perimenopause; above 30 with clinical picture suggests late perimenopause." },
  { name: "Post-menopause",    body: "Lipid panel, HbA1c, DEXA if not already done, testosterone if symptoms of deficiency." },
];

const RANGE_VS_OPTIMAL = [
  { test: "Ferritin",          range: "12–300 µg/L",      optimal: "70+ µg/L for hair and energy" },
  { test: "Vitamin D",         range: "50–200 nmol/L",    optimal: "75–150 nmol/L" },
  { test: "TSH",               range: "0.5–4.5 mIU/L",    optimal: "Below 2.5 if symptomatic" },
  { test: "Day 21 progesterone", range: "Above 5 nmol/L",   optimal: "30+ nmol/L for adequacy" },
];

const HRT_CONVERSATION = [
  { title: "What to say",  body: "'I believe I'm experiencing perimenopause symptoms. I've read the NICE guidelines and would like to discuss HRT as a treatment option.' Be specific about your symptoms and their impact on your daily life." },
  { title: "What to ask for", body: "Transdermal oestrogen (patch or gel) rather than oral — better safety profile for blood clots and cardiovascular risk. Micronised progesterone (Utrogestan) rather than synthetic progestogen if you have a uterus. A review appointment in 3 months." },
  { title: "If you're dismissed", body: "You have the right to a second opinion. Menopause specialists and private menopause clinics (e.g., Newson Health) can prescribe if your GP is not supportive." },
  { title: "Contraindications to discuss", body: "Current or recent breast cancer, unexplained vaginal bleeding, active blood clot. Most other perceived contraindications (family history of breast cancer, history of blood clots, fibroids) require individual assessment rather than automatic exclusion." },
];

const SUPP_STACK_SEPARATE = [
  "Iron + calcium: calcium significantly inhibits iron absorption. Take iron with vitamin C; calcium at a different meal.",
  "Iron + zinc: compete for the same absorption transporter. Take at different times.",
  "Zinc + copper: high-dose zinc depletes copper. If taking zinc above 25mg/day, pair with 1–2mg copper.",
];
const SUPP_STACK_SYNERGY = [
  "Vitamin D + K2 + magnesium: K2 directs calcium to bones rather than blood vessels; magnesium is a cofactor for vitamin D activation.",
  "Iron + vitamin C: vitamin C enhances iron absorption 2–3 fold.",
  "B vitamins: work as a complex. If supplementing one (e.g. B6 for PMS), a B-complex provides cofactors.",
];
const SUPP_TIMING = [
  "Fat-soluble vitamins (A, D, E, K): take with a meal containing fat.",
  "Iron: best on empty stomach; with a small amount of food if nausea.",
  "Magnesium glycinate: evening — glycine supports sleep quality.",
];

const GP_APPT_BRING = [
  "A written symptom list — when symptoms started, severity (1–10), how they affect daily life, whether cyclical or constant.",
  "Your cycle tracking data — printed or shown on your phone.",
  "Current medication and supplement list.",
  "One primary concern and one secondary — GPs work best with focused questions.",
];
const GP_APPT_LANGUAGE = [
  "'This is significantly affecting my quality of life' — GPs are trained to weight functional impairment.",
  "'I've been tracking this for X months' — demonstrates seriousness.",
  "'I'd like to be tested for X specifically' — specific requests are harder to decline than vague concerns.",
  "'I've read about [condition or treatment] and would like to discuss whether it's relevant for me.'",
];

// ─── LIFE STAGE content — 11 stages ──────────────────────────────────
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
    redFlags: [
      "Severe pain that stops you doing normal things, even with painkillers",
      "Periods stopping for 3+ months (pregnancy excluded)",
      "Soaking through a super pad in under 2 hours",
      "Persistent periods longer than 7 days",
      "Cycles consistently shorter than 21 days or longer than 45 days after the first 2 years",
    ],
  },
  reproductive: {
    oneliner: "Optimising what's working. Knowing what's actually normal — and what isn't.",
    sections: [
      { title: "Your cycle is a vital sign", body: "As informative as blood pressure or heart rate. A regular, healthy cycle says your hormones are broadly functioning well. Disruption is a signal worth reading." },
      { title: "What healthy actually looks like", body: "25–35 days, 3–7 days of bleeding, manageable pain, a clear mid-cycle fertile window, and a luteal phase of 12–16 days. Many women have never been told what 'normal' looks like." },
      { title: "Symptoms in a healthy cycle", body: "Some cramping early in the period. Mild breast tenderness in the luteal phase. Mood shifts around menstruation. None of these should stop your life. If they do, the spectrum from PMS → PMDD → dysmenorrhoea → endometriosis is worth understanding." },
      { title: "Red flags at this stage", body: "Periods stopping or becoming very irregular without pregnancy (rule out thyroid, PCOS, hypothalamic disruption from low weight or excessive exercise); heavy periods (consider fibroids, endometriosis, coagulation issues); worsening pain over time (endometriosis red flag)." },
      { title: "Contraception note", body: "Hormonal birth control suppresses ovulation. What you bleed on the pill is a withdrawal bleed, not a true period. Cycle tracking and natural fertility awareness aren't accurate while on hormonal contraception." },
      { title: "Lifestyle leverage", body: "Sleep regularity, protein intake, strength training, and stress management all measurably affect cycle health. Cycle dysfunction is sometimes the first signal that something else in life is out of balance." },
    ],
    redFlags: [
      "Heavy bleeding (soaking a pad/tampon in under 2 hours)",
      "Periods lasting longer than 7 days",
      "Severe pelvic pain that disrupts daily life",
      "Spotting between periods or after sex",
      "Cycles consistently shorter than 21 or longer than 35 days",
      "Pain during sex",
    ],
  },
  "pre-ttc": {
    oneliner: "The 3 months before you start trying matter as much as conception itself. Egg quality takes ~90 days to develop.",
    sections: [
      { title: "Why 3 months matters", body: "Egg quality is set roughly 3 months before ovulation. That's why what you do now affects the eggs you'll ovulate in 3 months. This is your highest-leverage window." },
      { title: "Core supplement stack", body: "Folate (or methylfolate if MTHFR variant): 400mcg minimum, 5mg if previous neural tube defect history. Begin at least 12 weeks before. Vitamin D: test level; most UK women deficient; aim 75–150 nmol/L. CoQ10 (ubiquinol): 200–600mg/day — mitochondrial function in eggs, particularly important over 35. Omega-3 DHA: 1,000mg/day. Zinc: 15–25mg/day. Iron only if blood test confirms deficiency (ferritin <30)." },
      { title: "Lifestyle leverage", body: "Reducing alcohol significantly improves egg quality. Smoking is directly damaging to eggs. Excess vigorous exercise (running more than 40 miles/week) can suppress ovulation. Cortisol from chronic stress suppresses LH and progesterone." },
      { title: "Pre-conception bloods worth requesting", body: "Ferritin, vitamin D, thyroid (TSH + free T4), HbA1c. Correcting deficiencies before conception protects your pregnancy and the baby's development." },
      { title: "Your partner matters", body: "Sperm quality also takes ~3 months to develop. Male factors account for 30–40% of fertility issues. Heat exposure, alcohol, smoking, BMI, certain medications all affect sperm. Preconception is a both-of-you project." },
    ],
    redFlags: [
      "Cycles consistently outside 21–35 days",
      "BMI under 19 or over 30",
      "Known thyroid, autoimmune, or metabolic conditions not yet optimised",
      "Family history of fertility difficulties or recurrent miscarriage",
      "On medications that aren't pregnancy-safe (discuss alternatives with GP early)",
    ],
  },
  ttc: {
    oneliner: "Your fertile window is about 6 days per cycle. Timing, signs, and when to seek help.",
    sections: [
      { title: "The fertile window", body: "The 5 days before ovulation plus ovulation day itself — about 6 days total. Sperm survive 3–5 days in the female reproductive tract; the egg lives 12–24 hours after release. Sex every 1–2 days from day 10 through to 2 days after BBT rise covers most cycles." },
      { title: "Identifying ovulation", body: "Cervical mucus (clear, stretchy, like raw egg white); BBT rises 0.2–0.5°C after ovulation (confirms retrospectively); mid-cycle pelvic twinges (mittelschmerz); OPKs detect the LH surge 24–36 hours before ovulation. PCOS can cause multiple LH surges without ovulation — interpret with caution." },
      { title: "Male factor matters", body: "40–50% of fertility challenges involve male-factor sperm issues. A semen analysis is quick, inexpensive, and non-invasive. After 12 months trying (6 months over 35), both partners should be tested." },
      { title: "What to investigate early", body: "Day 2–3 FSH, LH, AMH (ovarian reserve). Day 21 progesterone (confirms ovulation). Thyroid function. Rubella immunity. Chlamydia test (often asymptomatic). Pelvic ultrasound if irregular cycles or endometriosis symptoms." },
      { title: "Mental health during TTC", body: "The 'two-week wait' between ovulation and a possible period is hard. Helpful: limit symptom-spotting (early pregnancy and luteal phase share most symptoms), avoid early testing, and have a plan for negative-test days. Cortisol suppresses LH and progesterone — stress matters more than people admit." },
      { title: "When to seek help", body: "After 12 months under 35, 6 months 35+, 3 months 40+ or with known fertility concerns. Earlier if cycles are very irregular, severe pelvic pain, recurrent miscarriages (referral to recurrent miscarriage clinic), or known thyroid/PCOS/endometriosis issues." },
    ],
    redFlags: [
      "No conception in expected timeframes for your age",
      "Cycles consistently irregular while trying",
      "Severe pelvic pain or pain during sex",
      "2+ miscarriages",
      "Known endometriosis, PCOS, or thyroid issues not currently treated",
    ],
  },
  "pregnant-t1": {
    oneliner: "Weeks 1–12. Everything is changing fast. Most symptoms are normal; some need attention immediately.",
    sections: [
      { title: "What's normal", body: "Extreme tiredness (progesterone is dramatically elevated). Nausea (peaks weeks 6–10, often improves by week 14). Breast tenderness, frequent urination (blood volume already increasing), heightened smell sensitivity, food aversions." },
      { title: "Morning sickness truth", body: "Not only morning — it can be all day. Small frequent meals + protein nearby helps. Ginger has modest evidence. Severe persistent vomiting (hyperemesis gravidarum) needs medical treatment — please don't just suffer through." },
      { title: "What to do now", body: "Pregnancy multivitamin with 400mcg folic acid if not already started. Stop alcohol completely. Avoid soft cheeses/pâté/raw fish/undercooked meat. Vitamin D 10mcg (400IU) daily." },
      { title: "First appointments", body: "Booking appointment at 8–10 weeks. Dating scan at 11–13 weeks (plus combined screening for Down's syndrome). 12-week bloods: FBC, blood group, HIV, hepatitis B, syphilis." },
      { title: "Mental health from day one", body: "If you have a history of depression, anxiety, OCD, or eating disorders, tell your midwife — perinatal mental health services can support you proactively. There is no shame in needing this." },
    ],
    redFlags: [
      "Heavy bleeding, especially with cramps or pain",
      "Severe one-sided pelvic pain (rule out ectopic — urgent)",
      "Severe vomiting that prevents you keeping fluids down",
      "Fainting, severe dizziness, or shoulder-tip pain",
      "Signs of infection: high fever, painful urination, foul-smelling discharge",
    ],
  },
  "pregnant-t2": {
    oneliner: "Weeks 13–27. The 'easier' trimester for most. Anomaly scan, first movements, body changes.",
    sections: [
      { title: "Anomaly scan", body: "Around 20 weeks. Checks fetal development in detail — heart, brain, spine, organs. You can usually find out sex if you want. If anything unexpected is found, you'll be referred to fetal medicine." },
      { title: "First movements (quickening)", body: "Typically 18–22 weeks — earlier in second pregnancies. By week 24 you should be feeling consistent daily movements. Reduced movements at any point need same-day assessment — call your maternity unit." },
      { title: "Iron and pregnancy", body: "Iron requirements double in pregnancy. Many women develop iron-deficiency anaemia in the second trimester even if fine before. Bloods at 28 weeks check for this." },
      { title: "Skin and hair changes", body: "Pregnancy glow (real — increased blood volume), darker skin patches (chloasma/melasma — UV-driven, SPF helps), linea nigra, thicker hair (oestrogen prolongs growth phase). Most resolves postpartum." },
      { title: "Pain that's normal — and pain that isn't", body: "Back pain, round ligament pain, pelvic girdle pain are common. Physiotherapy referral on NHS for pelvic girdle pain — ask your midwife. Sudden severe headache with vision changes, persistent itching especially palms/soles, sudden facial/hand swelling — call immediately." },
    ],
    redFlags: [
      "Reduced fetal movement at any point after week 24",
      "Persistent severe headaches (rule out pre-eclampsia)",
      "Vision changes, swelling of hands/face, pain under the ribs",
      "Vaginal bleeding",
      "Itching, especially severe and on palms/soles (rule out obstetric cholestasis)",
    ],
  },
  "pregnant-t3": {
    oneliner: "Weeks 28–40+. Preparing for birth. Knowing the signs of labour.",
    sections: [
      { title: "What's normal", body: "Shortness of breath, heartburn, difficulty sleeping, Braxton Hicks (irregular tightening, not painful), swollen ankles by end of day, pelvic girdle pain." },
      { title: "Antenatal classes", body: "Typically run between weeks 28–36. NCT classes are paid; NHS classes are free and increasingly available. Both cover labour signs, pain relief, early newborn care." },
      { title: "Recognising labour", body: "Regular contractions that increase in frequency and intensity. Lower back pain that doesn't ease with movement. A 'show' (mucus plug). Waters breaking. Braxton Hicks are irregular, don't intensify, may ease with movement or hydration." },
      { title: "When to phone maternity", body: "Contractions 5 minutes apart, lasting 60 seconds, for an hour (first baby) or you think something is starting (subsequent babies — second labours are often faster). Also call if waters break (even without contractions), bleeding, reduced movements, or anything that worries you." },
      { title: "Birth plans", body: "Write one, hold it loosely. Useful: preferences (positions, pain relief, lighting, music, who's in the room) and contingencies (what matters most if a C-section becomes necessary). It's a conversation document with your midwife, not a contract." },
      { title: "Postnatal preparation", body: "Build a freezer of easy meals. Sort baby admin (paediatric registration, child benefit). Identify your one or two 'low-bar' people you can call when you're not okay. Postnatal depression affects 1 in 5 — preparation is protective." },
    ],
    redFlags: [
      "Reduced fetal movement",
      "Severe headaches, vision changes, sudden swelling (pre-eclampsia)",
      "Severe itching, especially palms/soles (obstetric cholestasis)",
      "Vaginal bleeding",
      "Waters breaking but no contractions starting within 24h",
      "Anything that feels wrong — trust yourself",
    ],
  },
  postpartum: {
    oneliner: "The fourth trimester. The bit no one prepares you for. You are also the patient.",
    sections: [
      { title: "The hormone crash", body: "Within 72 hours of birth, oestrogen and progesterone that were sky-high throughout pregnancy drop to near zero. This is the direct cause of baby blues (weepiness, anxiety, overwhelm in days 3–5), which affects 80% of women and usually resolves within 2 weeks." },
      { title: "Baby blues vs PND", body: "Baby blues pass within 2 weeks. Postnatal depression is persistent — lasting weeks, interfering with daily function, bonding, or self-care. PND affects 1 in 10 women, is not a failure, and responds well to treatment. PANDAS (PND + anxiety) is equally common." },
      { title: "Postpartum hair loss", body: "Telogen effluvium — mass shedding of hair that was held in the growth phase during pregnancy. Peaks ~3–4 months postpartum. Normal. Most regrows by 12 months. Ferritin below 70 µg/L can exacerbate — check levels if concerned." },
      { title: "Physical recovery", body: "Pelvic floor takes 12 weeks minimum to recover regardless of birth type. Start gentle Kegels as soon as comfortable. Returning to impact exercise before 12 weeks risks long-term pelvic floor damage. Night sweats in early weeks are normal — oestrogen withdrawal + prolactin." },
      { title: "Breastfeeding and fertility", body: "Prolactin suppresses ovulation — but not reliably enough to use as contraception. Some women ovulate before their first postpartum period. Fertility can return within weeks even while fully breastfeeding." },
      { title: "Help is not failure", body: "Lactation consultants (IBCLCs) for breastfeeding. Pelvic health physiotherapy on NHS in many areas — ask your GP. NCT helpline (0300 330 0700) for free breastfeeding support. PND treatment is effective. Asking is the start." },
    ],
    redFlags: [
      "Persistent low mood, hopelessness, or intrusive thoughts (any time in first year)",
      "Heavy bleeding that soaks a pad in an hour, or large clots",
      "Fever over 38°C",
      "Severe headache, vision changes (postnatal pre-eclampsia possible)",
      "Painful, hot, swollen calf (DVT risk)",
      "Severe breast pain with fever (mastitis needing antibiotics)",
    ],
  },
  perimenopause: {
    oneliner: "Can begin in your early 40s (sometimes late 30s) and last 2–12 years. Oestrogen fluctuates erratically before declining.",
    sections: [
      { title: "The full symptom picture", body: "Vasomotor: hot flashes, night sweats, cold flashes. Sleep: insomnia, early waking, vivid dreams. Mood: anxiety (new or worsened), low mood, irritability, rage, emotional lability. Cognitive: brain fog, word-finding difficulty, memory lapses. Musculoskeletal: joint aches, muscle tension, frozen shoulder (often unrecognised). Urogenital: vaginal dryness, recurring UTIs, bladder urgency, painful sex. Cycle changes: irregular timing, flooding, skipped periods. Skin/hair: dryness, collagen loss, hair thinning, increased facial hair. Cardio: palpitations (usually benign). Digestive: bloating, changes in motility. Sensory: tinnitus, dizziness, formication." },
      { title: "HRT — what's actually available", body: "Oestrogen-only: for women who've had a hysterectomy. Combined (oestrogen + progesterone): for women with a uterus — progesterone protects the uterine lining. Delivery: transdermal (patches, gel, spray) has better cardiovascular and clot risk profile than oral pills — first-line in modern practice. Body-identical (micronised) progesterone (Utrogestan, Prometrium): structurally identical to body's own; better tolerated than synthetic progestogens (MPA) and associated with lower breast cancer risk in current evidence. The Mirena IUS can serve as the progesterone component while providing contraception. Testosterone: increasingly prescribed off-label for libido, brain fog, energy — growing evidence base." },
      { title: "Modern HRT evidence", body: "The 2002 WHI study that scared a generation used outdated synthetic hormones and enrolled women with average age 63 (not early perimenopausal women). Modern evidence shows body-identical HRT started within 10 years of menopause has a favourable risk/benefit profile for most women, including cardiovascular protection and bone density preservation." },
      { title: "Natural approaches with evidence", body: "Isoflavones (soy, red clover): weak phytoestrogens, modest evidence for hot flashes, effect size much smaller than HRT. Cognitive-behavioural therapy (CBT): NICE-recommended for hot flashes and mood. Magnesium glycinate: supports sleep. Regular weight-bearing exercise: bone density preservation." },
      { title: "Many women are misdiagnosed", body: "Anxiety and mood symptoms are often treated as primary mental health issues with antidepressants when HRT would be more appropriate. Brain fog is dismissed. Joint pain is attributed to 'getting older'. Advocate for yourself — NICE guidance is clear, and the British Menopause Society maintains a directory of trained specialists." },
    ],
    redFlags: [
      "Cycles becoming heavier or longer (rule out fibroids, polyps, endometrial issues)",
      "Bleeding after sex or between periods (especially after age 45)",
      "Symptoms severely affecting work, relationships, or daily functioning",
      "Mood crisis — perimenopause is associated with increased suicide risk; reach out",
      "Joint pain that doesn't respond to usual measures (frozen shoulder is a marker)",
    ],
  },
  menopause: {
    oneliner: "12 months after your final period. The transition is complete. Long-term considerations now matter more.",
    sections: [
      { title: "Genitourinary Syndrome of Menopause (GSM)", body: "Vaginal and vulvar changes caused by low oestrogen — dryness, thinning tissue, reduced lubrication, burning, recurrent UTIs, bladder urgency. Unlike hot flashes which often improve over time, GSM progressively worsens without treatment. Local vaginal oestrogen (cream, pessary, ring) is extremely effective, not absorbed systemically in significant amounts, and safe even for most women who can't use systemic HRT." },
      { title: "Bone density", body: "Oestrogen is essential for bone maintenance. Menopause accelerates bone loss — women lose 10–20% of bone density in the first 5 years. DEXA scan worth requesting in your 50s. FRAX score calculates 10-year fracture risk. Calcium (1,200mg/day from food + supplements combined), vitamin D (2,000 IU/day), and weight-bearing exercise are foundational." },
      { title: "Cardiovascular risk", body: "Oestrogen was cardioprotective. Post-menopause, women's cardiovascular risk rises to equal men's by their late 60s. Blood pressure, cholesterol (particularly LDL), and blood glucose all merit annual monitoring." },
      { title: "Brain", body: "Cognitive changes are common and well-documented in menopause. Most women's cognition returns to baseline within a few years. HRT started within 10 years of menopause appears protective against Alzheimer's risk — this is an active research area." },
      { title: "HRT after the transition", body: "The 'lowest dose for shortest time' messaging from 20 years ago is outdated. Current evidence supports individualised duration based on symptom burden, risk profile, and personal preference. There's no automatic age cap on continuing HRT." },
    ],
    redFlags: [
      "Any postmenopausal bleeding — urgent assessment (rule out endometrial cancer)",
      "Sudden or severe joint pain",
      "New or severe headaches",
      "Persistent low mood, especially with social withdrawal",
      "Symptoms of POI (menopause under 40) — fertility, bone, heart implications",
    ],
  },
  "post-menopause": {
    oneliner: "The longest chapter for most women. Monitoring and maintenance now matter more than ever.",
    sections: [
      { title: "Bone health long-term", body: "If not on HRT, DEXA every 2 years is reasonable. Bisphosphonates (alendronic acid) are standard if osteoporosis confirmed. Continue weight-bearing exercise and resistance training — it genuinely preserves bone density." },
      { title: "Cardiovascular", body: "Annual BP. Every-few-year cholesterol and HbA1c. Attention to weight and waist circumference. Statins are recommended at lower thresholds than people often realise — discuss your QRISK3 score with your GP, especially after 60." },
      { title: "Cognitive health", body: "Education + social engagement + cardiovascular health + sleep + Mediterranean-style diet + regular exercise are the evidence-based dementia-reduction levers. Hearing loss management, vision care, and managing high BP and diabetes also matter. The same things that protect your heart protect your brain." },
      { title: "Sexual health continues to matter", body: "Vaginal oestrogen, lubricants, longer foreplay, addressing libido changes (relationship, mood, medication, comfort). Sex doesn't have to look like it did at 30, but pleasure remains available." },
      { title: "Testosterone in post-menopause", body: "Off-label but increasingly common — testosterone gel/cream improves libido, energy, mood, and cognitive function in many post-menopausal women. Growing evidence base; discuss with a menopause specialist." },
      { title: "Annual monitoring to request", body: "Full blood count, lipid panel, HbA1c, vitamin D, thyroid function, blood pressure. Mammogram per NHS schedule (50–71 every 3 years). Cervical screening until 65. Continue osteoporosis monitoring if at risk." },
    ],
    redFlags: [
      "Any vaginal bleeding (urgent — endometrial cancer must be excluded)",
      "New, severe, or persistent headaches",
      "Changes in bowel habits lasting more than 3 weeks",
      "Unexplained weight loss",
      "Falls — especially if new, recurrent, or with injury",
    ],
  },
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
          position: "sticky", top: 0, zIndex: 5,
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
        v2 expert-content upgrade. Eight inner tabs, all loaded with detailed health copy —
        hormone curves, cycle health indicators, Life Stage detail across 11 stages, hormonal
        acne mechanisms, PCOS / endometriosis / PMDD deep-dives, oestrogen-and-brain
        neurobiology, the estrobolome, blood-test guidance, HRT conversation scripts, and
        GP appointment prep.
      </ReviewerNote>
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
      {/* Header tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <Tile icon="🌀" label={isMeno ? "Stage" : "Cycle day"} value={isMeno ? prettyName(stage).split("-")[0] : (cycleDay ? `Day ${cycleDay}` : "—")} />
        <Tile icon="💭" label="Mood"     value={moodToday != null ? MOOD_EMOJI[Math.max(0, Math.min(4, Math.round(moodToday) - 1))] : "—"} large />
        <Tile icon="⚡"  label="Energy"  value={energyToday != null ? `${energyToday}/5` : "—"} />
        <Tile icon="🩺" label="Symptoms today" value={String(symptomsToday)} />
      </div>

      {/* Personalised Jess card */}
      <div style={{
        background: T.jessBg, borderLeft: `4px solid ${T.gold}`,
        padding: "16px 18px", borderRadius: 12, marginBottom: 14,
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ padding: "3px 9px", borderRadius: 999, background: T.gold, color: T.espressoDk,
            fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>From Jess</span>
          <span style={{ marginLeft: 8, fontSize: 11.5, color: T.muted }}>{new Date().toLocaleDateString("en-GB", { weekday: "long" })}</span>
        </div>
        <p style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 16, lineHeight: 1.7, color: T.espresso, margin: 0 }}>{jess}</p>
      </div>

      {/* Jess Insight (educational) */}
      <SubHeader>Jess insight · why patterns matter</SubHeader>
      <div style={{
        background: T.blushBg, borderLeft: `3px solid ${T.blush}`,
        padding: "14px 16px", borderRadius: "0 12px 12px 0", marginBottom: 14,
      }}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.75, color: T.espresso }}>
          Your energy and mood often shift with your cycle phase. Most women feel their best during the follicular phase as oestrogen rises, and notice a dip in the days before their period when both oestrogen and progesterone drop sharply. Tracking consistently for 2–3 cycles reveals your personal patterns — things like whether your energy dips mid-luteal, whether your sleep quality changes with progesterone, or whether certain foods affect how you feel perimenstrually.
        </p>
      </div>

      {/* This week wash rows */}
      <SubHeader>This week</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <WashRow label="Mood"   values={mood7}   tint={moodTint}   />
        <WashRow label="Energy" values={energy7} tint={energyTint} />
        <div style={{ marginTop: 10, fontSize: 13, color: T.muted }}>{symptoms7.length} symptom{symptoms7.length === 1 ? "" : "s"} logged this week.</div>
      </div>

      {/* What to track this week */}
      <SubHeader>What to track this week</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <IconCard icon="💧" title="Hydration" body="Affects everything — hormone transport, energy, skin. Aim for 2L but increase by 500ml around ovulation when body temperature rises." />
        <IconCard icon="😴" title="Sleep" body="Sleep quality changes across your cycle. Progesterone's sedating effect in early luteal can feel like deep sleep, but late luteal often brings disrupted nights. Log it — the pattern matters." />
        <IconCard icon="🥗" title="Nutrition shifts" body="Your needs shift each phase. Iron and B12 matter most post-period. Magnesium and B6 matter most pre-period." />
      </div>

      {/* Quick log */}
      <SubHeader>Log something</SubHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
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

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 28, fontWeight: 600, color: T.espresso }}>
          {isMeno ? prettyName(stage) : `${PHASE_LABEL[phase]} phase`}
        </div>
        {!isMeno && day && (
          <span style={{ padding: "4px 10px", borderRadius: 999, background: PHASE_COLOUR[phase] + "33", color: T.espresso, fontSize: 12, fontWeight: 600 }}>
            Day {day} of {cycle?.cycleLen || 28}
          </span>
        )}
      </div>

      {/* Your hormone curve */}
      <SubHeader>Your hormone curve · across a 28-day cycle</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: T.muted, lineHeight: 1.6, fontFamily: '"Fraunces", Georgia, serif' }}>
          Across a typical 28-day cycle, four hormones choreograph everything your body does. Here's what's happening:
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {HORMONE_CURVE.map((row, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.gold, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 }}>
                {row.range}
              </div>
              <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>{row.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fertility signs */}
      <SubHeader>Fertility signs · cervical mucus, BBT, OPK</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
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
          Your resting temperature rises 0.2–0.5°C after ovulation due to progesterone's thermogenic effect. Take it at the same time every morning before getting up. A clear thermal shift <em>confirms</em> ovulation happened — it doesn't predict it, only confirms it retrospectively.
        </p>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>OPK — ovulation predictor kits</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          Measure LH surge. A positive = LH surge happening. Ovulation typically follows 24–36 hours after the surge begins — so the day of the surge AND the next day are your highest-fertility days. Note: PCOS can cause multiple LH surges without ovulation.
        </p>
      </div>

      {/* Cycle health indicators */}
      <SubHeader>Cycle health indicators</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 8 }}>A healthy cycle typically looks like</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {CYCLE_HEALTHY_BULLETS.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 8 }}>Red flags to take seriously</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {CYCLE_RED_FLAGS.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>

      {/* PCOS quick note (preview) */}
      <SubHeader>PCOS cycle patterns</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          Cycles often 35–90+ days, or absent. Due to elevated androgens and insulin resistance disrupting follicle development. Multiple LH surges, elevated testosterone, often (not always) polycystic ovaries on scan. Not everyone with PCOS has cysts — it's a metabolic and hormonal condition, not just a structural one.
        </p>
      </div>

      {/* Luteal phase defect */}
      <SubHeader>Luteal phase defect</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          The luteal phase normally lasts 12–16 days. If it's consistently under 10 days, or if progesterone levels are low in the mid-luteal phase (day 21 blood test), this may be luteal phase defect — insufficient progesterone to maintain a potential pregnancy. Symptoms: spotting before periods, short cycles, difficulty conceiving, recurrent early miscarriage. A day 21 progesterone test (or 7 days after tracked ovulation) measures this — optimal level is above 30 nmol/L. Lifestyle support: reduce intense exercise, prioritise sleep, manage stress (cortisol directly suppresses progesterone). Medical options: progesterone supplements in the luteal phase.
        </p>
      </div>

      {/* Phase by phase */}
      <SubHeader>Phase by phase</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {["follicular", "ovulatory", "luteal", "menstrual"].map((p) => (
          <div key={p} style={{
            background: "#FFFFFF", borderLeft: `3px solid ${PHASE_COLOUR[p]}`,
            borderRadius: "0 12px 12px 0", padding: "12px 14px",
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
            opacity: p === phase ? 1 : 0.85,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }} aria-hidden="true">{PHASE_EMOJI[p]}</span>
              <strong style={{ fontSize: 15, color: T.espresso }}>{PHASE_LABEL[p]}</strong>
              {p === phase && !isMeno && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>Now</span>
              )}
            </div>
            <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>{PHASE_CONTENT[p].summary}</div>
          </div>
        ))}
      </div>

      {!isMeno && (
        <>
          <SubHeader>What to eat in your {PHASE_LABEL[phase]?.toLowerCase()} phase</SubHeader>
          <Card>{phaseContent.food}</Card>
          <SubHeader>How to move in your {PHASE_LABEL[phase]?.toLowerCase()} phase</SubHeader>
          <Card>{phaseContent.movement}</Card>
        </>
      )}

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

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Stage selector */}
      <SubHeader>Browse life stages · your current is {LIFE_STAGE_LABEL[initialKey] || prettyName(initialKey)}</SubHeader>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14,
      }}>
        {LIFE_STAGE_KEYS.map((k) => {
          const on = selected === k;
          const current = k === initialKey;
          return (
            <button key={k} onClick={() => setSelected(k)} style={{
              padding: "6px 11px", borderRadius: 999,
              background: on ? T.espresso : current ? T.goldSoft : "transparent",
              color: on ? T.cream : current ? T.gold : T.muted,
              border: current && !on ? `1px solid ${T.gold}` : "none",
              cursor: "pointer", fontSize: 12, fontWeight: on ? 700 : 500,
              letterSpacing: 0.2, fontFamily: '"Inter", system-ui, sans-serif',
            }}>{LIFE_STAGE_LABEL[k] || prettyName(k)}{current ? " · you" : ""}</button>
          );
        })}
      </div>

      {/* Banner */}
      <div style={{ background: T.jessBg, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>
          {isCurrent ? "Your current life stage" : "Browsing"}
        </div>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 28, fontWeight: 600, color: T.espresso, marginBottom: 6, letterSpacing: -0.3 }}>
          {LIFE_STAGE_LABEL[selected] || prettyName(selected)}
        </div>
        <div style={{ fontSize: 14, color: T.espresso, lineHeight: 1.55, fontFamily: '"Fraunces", Georgia, serif' }}>{content.oneliner}</div>
      </div>

      {/* Sections as cards */}
      {content.sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <SubHeader>{sec.title}</SubHeader>
          <Card>{sec.body}</Card>
        </div>
      ))}

      {/* Red flags */}
      {Array.isArray(content.redFlags) && content.redFlags.length > 0 && (
        <>
          <SubHeader>When to see your GP</SubHeader>
          <div style={{ background: T.blushBg, border: `1px solid ${T.blush}`, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10, fontWeight: 700 }}>
              These warrant a GP conversation:
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
              {content.redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
            </ul>
          </div>
        </>
      )}

      <FooterDisclaimer />
    </div>
  );
}

// ─── SKIN & HAIR ───────────────────────────────────────────────────────
function SkinHairTab({ profile, symptoms, skinLogs, phase, stage, isMeno }) {
  const phaseLabel = isMeno ? prettyName(stage) : (PHASE_LABEL[phase] || prettyName(phase));
  const phaseProtocol = isMeno ? "Declining oestrogen means less collagen and natural oil production — skin becomes drier, thinner, less elastic. Hyaluronic acid serums, barrier-supporting moisturisers (ceramides), and daily SPF are the highest-impact interventions. Some women find topical oestrogen (prescribed) or phytooestrogen creams helpful — discuss with your GP." : (PHASE_SKIN_PROTOCOL[phase] || PHASE_SKIN_PROTOCOL.follicular);

  const acne = useMemo(() => symptoms.filter((r) => /acne|breakout/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms]);

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* How hormones control your skin */}
      <SubHeader>How hormones control your skin</SubHeader>
      <Card>{HORMONES_CONTROL_SKIN}</Card>

      {/* Hormonal acne deep-dive */}
      <SubHeader>Hormonal acne · what's actually happening</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {HORMONAL_ACNE_CONTENT.map((c, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>{c.title}</div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{c.body}</p>
          </div>
        ))}
      </div>

      {/* Phase-synced protocol */}
      <SubHeader>Your phase-synced skincare protocol</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {(isMeno ? ["meno"] : ["menstrual", "follicular", "ovulatory", "luteal"]).map((p) => (
          <div key={p} style={{
            background: "#FFFFFF",
            border: (!isMeno && p === phase) ? `2px solid ${T.gold}` : "none",
            borderRadius: 12, padding: 14,
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }} aria-hidden="true">{isMeno ? "🌿" : PHASE_EMOJI[p]}</span>
              <strong style={{ fontSize: 14.5, color: T.espresso }}>{isMeno ? phaseLabel : PHASE_LABEL[p]}</strong>
              {!isMeno && p === phase && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>Now</span>
              )}
            </div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>
              {isMeno ? phaseProtocol : PHASE_SKIN_PROTOCOL[p]}
            </p>
          </div>
        ))}
      </div>

      {/* Hair science */}
      <SubHeader>Hair science · the full picture</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {HAIR_SCIENCE.map((h, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>{h.title}</div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{h.body}</p>
          </div>
        ))}
      </div>

      {/* Hormonal acne tracker (live data) */}
      <SubHeader>Your hormonal acne · this month</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10 }}>
          <strong>{acne.length}</strong> breakout {acne.length === 1 ? "entry" : "entries"} logged
        </div>
        <p style={{ margin: 0, padding: "10px 12px", background: T.blushBg, borderLeft: `3px solid ${T.blush}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.6, color: T.espresso, borderRadius: "0 8px 8px 0" }}>
          {acne.length >= 3
            ? "That's a pattern, not noise. Consider a salicylic acid serum from day 14 of your cycle and discuss a GP referral if it's impacting quality of life."
            : "Keep tracking. Hormonal acne tends to cluster in the luteal phase — patterns become clear over 2–3 cycles."}
        </p>
      </div>

      {/* Supplement evidence */}
      <SubHeader>Supplement evidence summary · skin & hair</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {SKIN_HAIR_SUPPLEMENTS.map((s) => (
          <div key={s.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
              <strong style={{ fontSize: 15, color: T.espresso }}>{s.name}</strong>
              <span style={{ fontSize: 12, color: T.muted, textAlign: "right" }}>{s.benefit}</span>
            </div>
            <div style={{ fontSize: 13.5, color: T.espresso, lineHeight: 1.6, fontFamily: '"Fraunces", Georgia, serif' }}>{s.note}</div>
          </div>
        ))}
        <div style={{ fontSize: 12, color: T.muted, fontStyle: "italic" }}>Discuss with your GP or a registered nutritionist before starting any supplement.</div>
      </div>

      <FooterDisclaimer />
    </div>
  );
}

// ─── BODY ──────────────────────────────────────────────────────────────
function BodyTab({ profile, symptoms, cycle, isMeno, isCycling }) {
  const today = todayLocal();
  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const cut90 = new Date(today); cut90.setDate(today.getDate() - 89);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });
  const symptoms30 = since(symptoms, cut30);
  const symptoms90 = since(symptoms, cut90);

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

  const hotFlashes = useMemo(() => symptoms30.filter((r) => /hot_flash|hot flash/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms30]);

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Understanding your symptoms */}
      <SubHeader>Understanding your symptoms</SubHeader>
      <Card>
        <p style={{ margin: "0 0 10px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>
          Symptoms are signals, not inconveniences to suppress. When you log symptoms consistently over 2–3 cycles, patterns emerge that can be genuinely diagnostic — things your GP would otherwise struggle to identify from a 10-minute appointment.
        </p>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>The most meaningful patterns to track:</div>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          <li><strong>Perimenstrual cluster:</strong> symptoms that reliably appear 7–10 days before your period and resolve with it point toward progesterone-related sensitivity or PMDD.</li>
          <li><strong>Mid-cycle spike:</strong> symptoms at ovulation may include mittelschmerz, mood sensitivity, or digestive changes.</li>
          <li><strong>Constant symptoms:</strong> present regardless of phase — point to thyroid, anaemia, or non-hormonal causes.</li>
        </ul>
      </Card>

      {/* Top 5 ranked symptoms */}
      <SubHeader>Jess on your symptoms · last 30 days</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        {ranked.length === 0
          ? <div style={{ fontSize: 13.5, color: T.muted }}>Nothing logged yet this month — track on /Today.</div>
          : <ol style={{ margin: 0, padding: "0 0 0 18px", listStyle: "decimal", color: T.espresso, fontSize: 14.5, lineHeight: 1.9 }}>
              {ranked.map(([sym, n]) => <li key={sym}><strong>{prettyName(sym)}</strong> — {n} time{n === 1 ? "" : "s"} this month</li>)}
            </ol>}
        {topKey && (
          <p style={{ margin: "14px 0 0", padding: "12px 14px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{topNote}</p>
        )}
      </div>

      {/* Symptom calendar */}
      <SubHeader>Symptom calendar · last 30 days</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {symptomCountsByDay.map((e, i) => (
            <div key={i} title={`${days30[i]} · ${e.count} log${e.count === 1 ? "" : "s"}${e.severe ? " · severe" : ""}`}
              style={{ aspectRatio: "1", borderRadius: 6,
                background: e.count === 0 ? "transparent" : e.severe ? T.blushDeep : e.count >= 3 ? T.blush : T.blushLight,
                border: e.count === 0 ? `1px solid ${T.border}` : "none" }} />
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12.5, color: T.muted }}>Darker = more symptoms logged that day.</div>
      </div>

      {/* Hot flash physiology */}
      {isMeno && (
        <>
          <SubHeader>Hot flash physiology · why it actually happens</SubHeader>
          <Card>{HOT_FLASH_PHYSIOLOGY}</Card>
          <SubHeader>Your hot flashes · this month</SubHeader>
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
              <Stat label="This month" value={String(hotFlashes.length)} />
              <Stat label="Per week"   value={(hotFlashes.length / 4).toFixed(1)} />
            </div>
          </div>
        </>
      )}

      {/* PCOS */}
      <SubHeader>PCOS · more than irregular periods</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{PCOS_CONTENT.intro}</p>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>The full symptom profile</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {PCOS_CONTENT.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <p style={{ margin: 0, padding: "10px 12px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{PCOS_CONTENT.driver}</p>
      </div>

      {/* Endometriosis */}
      <SubHeader>Endometriosis · the delayed-diagnosis condition</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <p style={{ margin: "0 0 12px", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: T.espresso }}>{ENDO_CONTENT.intro}</p>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Symptom profile that warrants investigation</div>
        <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
          {ENDO_CONTENT.symptoms.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <p style={{ margin: 0, padding: "10px 12px", background: T.blushBg, borderLeft: `3px solid ${T.blush}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso, borderRadius: "0 8px 8px 0" }}>{ENDO_CONTENT.diagnosis}</p>
      </div>

      {/* PMDD */}
      <SubHeader>PMDD · severe premenstrual disorder</SubHeader>
      <Card>{PMDD_CONTENT}</Card>

      <FooterDisclaimer />
    </div>
  );
}

// ─── MIND ──────────────────────────────────────────────────────────────
function MindTab({ profile, checkins, symptoms, stage }) {
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
  const moodAvg  = avg(mood30);

  const brainFog = useMemo(() => symptoms30.filter((r) => /brain_fog|foggy|brain fog/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms30]);

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Oestrogen and your brain */}
      <SubHeader>Oestrogen and your brain</SubHeader>
      <Card>{OESTROGEN_BRAIN}</Card>

      {/* Cognition by phase */}
      <SubHeader>Cognitive function by cycle phase</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {COGNITION_BY_PHASE.map((c, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{c.phase}</div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{c.body}</p>
          </div>
        ))}
        <p style={{ margin: 0, fontSize: 13.5, color: T.muted, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.65 }}>
          In perimenopause, erratic oestrogen fluctuations (rather than the decline itself) drive most cognitive symptoms — the brain is continuously adjusting to unpredictable oestrogen levels, which is metabolically and cognitively demanding.
        </p>
      </div>

      {/* HPA-HPG axis */}
      <SubHeader>The HPA–HPG axis · why stress disrupts your cycle</SubHeader>
      <Card>{HPA_HPG}</Card>

      {/* Mood / Energy 30-day washes */}
      <SubHeader>Mood this month</SubHeader>
      <WashGrid values={mood30} days={days30} tint={moodTint} caption="Your emotional texture over 30 days." />
      <SubHeader>Energy this month</SubHeader>
      <WashGrid values={energy30} days={days30} tint={energyTint} caption="Your energy texture over 30 days." />

      {/* Sleep bar chart */}
      <SubHeader>Sleep · last 14 days</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
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
        <div style={{ marginTop: 8, fontSize: 13, color: T.muted }}>
          Avg <strong style={{ color: T.espresso }}>{sleepAvg != null ? `${sleepAvg.toFixed(1)}h` : "—"}</strong> / night ·
          <span style={{ marginLeft: 6 }}>sage ≥7h · gold 5–7h · blush &lt;5h</span>
        </div>
      </div>

      {/* Sleep & cycle */}
      <SubHeader>Sleep and your cycle</SubHeader>
      <Card>{SLEEP_CYCLE}</Card>

      {/* PMDD neurosteroid */}
      <SubHeader>PMDD and the neurosteroid mechanism</SubHeader>
      <Card>
        In PMDD, normal progesterone levels produce abnormal brain responses. Progesterone converts to allopregnanolone, which normally acts as a positive allosteric modulator of GABA-A receptors — meaning it should be calming. In women with PMDD, GABA-A receptor subunit composition appears to have changed in a way that makes allopregnanolone dysregulating rather than calming. The brain is, in effect, producing an anxiety response to a compound that should reduce anxiety. SSRIs appear to work for PMDD by rapidly changing allopregnanolone levels (a neurosteroid effect separate from their antidepressant effect — which is why they work within hours in PMDD rather than the weeks required for depression).
      </Card>

      {/* Stage-specific stress content */}
      <SubHeader>Stress &amp; mental health · for your stage</SubHeader>
      <Card>
        {stage === "perimenopause" || stage === "menopause"
          ? "Anxiety and mood changes are among the most underdiagnosed perimenopause symptoms. Oestrogen plays a key role in serotonin regulation. Many women are prescribed antidepressants when HRT would be more appropriate — advocate for yourself."
          : stage === "postpartum"
            ? "Postnatal depression affects 1 in 5 women and can develop up to a year after birth. Baby blues (first 2 weeks) are normal; persistent low mood, anxiety, or intrusive thoughts warrant immediate GP contact."
            : "Luteal phase mood changes are driven by progesterone's effect on GABA and serotonin. If mood changes are severe and disrupt your life every cycle, PMDD may be worth exploring with a GP."}
      </Card>

      {/* Nervous system regulation */}
      <SubHeader>Nervous system regulation · what actually works</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {NS_REGULATION.map((n, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{n.title}</div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{n.body}</p>
          </div>
        ))}
      </div>

      {/* Brain fog count */}
      <SubHeader>Brain fog · this month</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 24, fontWeight: 600, color: T.gold, marginBottom: 4 }}>{brainFog.length}</div>
        <div style={{ fontSize: 13, color: T.muted }}>brain fog days logged in the last 30 days</div>
      </div>

      <FooterDisclaimer />
    </div>
  );
}

// ─── NOURISHMENT ───────────────────────────────────────────────────────
function NourishmentTab({ profile, checkins, meals, supps, stage, isMeno, phase }) {
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

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Phase nutrition with the WHY */}
      <SubHeader>Phase nutrition · the why behind the what</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {["menstrual", "follicular", "ovulatory", "luteal"].map((p) => (
          <div key={p} style={{
            background: "#FFFFFF",
            border: p === phase ? `2px solid ${T.gold}` : "none",
            borderRadius: 12, padding: 14,
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }} aria-hidden="true">{PHASE_EMOJI[p]}</span>
              <strong style={{ fontSize: 14.5, color: T.espresso }}>{PHASE_LABEL[p]} phase</strong>
              {p === phase && !isMeno && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>Now</span>
              )}
            </div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{PHASE_NUTRITION_WHY[p]}</p>
          </div>
        ))}
      </div>

      {/* Estrobolome */}
      <SubHeader>The estrobolome · your gut–hormone axis</SubHeader>
      <Card>{ESTROBOLOME}</Card>

      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>What disrupts the estrobolome</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
            {ESTROBOLOME_DISRUPT.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>What supports it</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
            {ESTROBOLOME_SUPPORT.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </div>

      {/* Seed cycling */}
      <SubHeader>Seed cycling · protocol</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {SEED_CYCLING.map((s, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{s.phase}</div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{s.body}</p>
          </div>
        ))}
      </div>

      {/* Blood sugar */}
      <SubHeader>Blood sugar and your cycle</SubHeader>
      <Card>{BLOOD_SUGAR_LUTEAL}</Card>

      {/* This week's meals */}
      <SubHeader>This week's meals</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
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

      {/* Hydration */}
      <SubHeader>Hydration today</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ height: 14, background: T.border, borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${hydroPct}%`, background: T.sage, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontSize: 13, color: T.espresso }}>
          <strong>{hydrationToday || 0}ml</strong> · target 2000ml · <span style={{ color: T.muted }}>{Math.max(0, 2000 - hydrationToday)}ml to go</span>
        </div>
      </div>

      {/* Endocrine disruptors */}
      <SubHeader>Endocrine disruptors · the practical guide</SubHeader>
      <Card>
        Endocrine-disrupting chemicals (EDCs) are compounds that interfere with hormone signalling. They can mimic, block, or alter hormone production. Reducing high-exposure sources (plastic food heating, synthetic fragrance, BPA cans) is practical and achievable. Perfection is not necessary or possible.
      </Card>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {EDC_LIST.map((e) => (
          <div key={e.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <strong style={{ fontSize: 14.5, color: T.espresso }}>{e.name}</strong>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.55 }}><strong>Found in:</strong> {e.found}</div>
            <div style={{ fontSize: 13, color: T.espresso, marginTop: 4, lineHeight: 1.55, fontFamily: '"Fraunces", Georgia, serif' }}><strong>Swap:</strong> {e.swap}</div>
          </div>
        ))}
      </div>

      <FooterDisclaimer />
    </div>
  );
}

// ─── CARE ──────────────────────────────────────────────────────────────
function CareTab({ profile, symptoms, meds, supps, stage, isMeno }) {
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

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Core blood tests */}
      <SubHeader>Blood tests every woman should know</SubHeader>
      <Card>Ask for these by name — many aren't included by default in standard panels.</Card>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {BLOODS_CORE.map((b) => (
          <div key={b.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <strong style={{ fontSize: 14.5, color: T.espresso }}>{b.name}</strong>
            <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>{b.body}</p>
          </div>
        ))}
      </div>

      <SubHeader>Hormonal panel by life stage</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {BLOODS_HORMONAL.map((b) => (
          <div key={b.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <strong style={{ fontSize: 14.5, color: T.espresso }}>{b.name}</strong>
            <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>{b.body}</p>
          </div>
        ))}
      </div>

      <SubHeader>How to read your own results · range vs optimal</SubHeader>
      <Card>Labs report a 'reference range' — the range seen in 95% of tested people, not the range for optimal function. When a GP says 'your bloods are normal,' it means within range — not optimal for how you want to feel.</Card>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
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
      </div>

      {/* HRT conversation */}
      <SubHeader>HRT · how to have the conversation</SubHeader>
      <Card>If you think you might be perimenopausal, you are entitled to discuss HRT with your GP. NICE guidelines (2015, updated 2019) state HRT should be offered to women with vasomotor symptoms where there are no contraindications.</Card>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {HRT_CONVERSATION.map((h, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <strong style={{ fontSize: 14, color: T.espresso }}>{h.title}</strong>
            <p style={{ margin: "4px 0 0", fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.7, color: T.espresso }}>{h.body}</p>
          </div>
        ))}
      </div>

      {/* Supplement stacking */}
      <SubHeader>Supplement stacking · what goes together</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Take separately — they compete for absorption</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
            {SUPP_STACK_SEPARATE.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Synergistic combinations</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
            {SUPP_STACK_SYNERGY.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Timing</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
            {SUPP_TIMING.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>

      {/* GP appointment prep */}
      <SubHeader>GP appointment prep · how to be heard</SubHeader>
      <Card>The average GP appointment is 10 minutes. How you present information determines what you get from it.</Card>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Come with</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
            {GP_APPT_BRING.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>Language that helps</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
            {GP_APPT_LANGUAGE.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>

      {/* Your medications */}
      <SubHeader>Your medications · last 14 days</SubHeader>
      {medsByName.length === 0
        ? <Card>No medications logged in the last 14 days.</Card>
        : (
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {medsByName.map((m) => (
              <div key={m.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
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

      {/* GP-ready */}
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

      {/* Things to discuss */}
      <SubHeader>Things to discuss with your GP · computed from your data</SubHeader>
      <div style={{ background: T.blushBg, border: `1px solid ${T.blush}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
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
      </div>

      {/* Screening reminders */}
      <SubHeader>Screening · don't miss these</SubHeader>
      <Card>
        Cervical screening: NHS invites every 3 years from age 25 to 49, every 5 years from 50 to 64. The test detects HPV and abnormal cells — one of the most effective cancer prevention tools available. STI testing: relevant for anyone sexually active with new or multiple partners. Sexual health clinics offer free, confidential testing. Mammogram: NHS schedule 50–71 every 3 years.
      </Card>

      {isMeno && (
        <>
          <SubHeader>Menopause Rating Scale</SubHeader>
          <Link to="/LifeStageCare" style={{ display: "block", background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", textDecoration: "none", color: T.espresso, marginBottom: 14 }}>
            <strong style={{ fontSize: 14 }}>Take the MRS questionnaire →</strong>
            <div style={{ marginTop: 4, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
              A validated 11-symptom questionnaire to score your menopause symptom burden. Great to bring to a GP appointment.
            </div>
          </Link>
        </>
      )}

      <FooterDisclaimer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Shared subcomponents
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
        <Sparkles className="w-3 h-3" /> Health Corner v2 · expert content
      </span>
      <span style={{ color: "#9B8B7A", fontSize: 12 }}>Tabbed hub · Overview · Cycle · Life Stage · Skin & Hair · Body · Mind · Nourishment · Care</span>
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
function Card({ title, body, children }) {
  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      borderRadius: 12, padding: 16, marginBottom: 12,
    }}>
      {title && <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>{title}</div>}
      {body !== undefined ? (
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>{body}</p>
      ) : (
        // Render children but support plain strings or React nodes
        typeof children === "string"
          ? <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>{children}</p>
          : children
      )}
    </div>
  );
}
function IconCard({ icon, title, body }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 20 }} aria-hidden="true">{icon}</span>
        <strong style={{ fontSize: 14.5, color: T.espresso }}>{title}</strong>
      </div>
      <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>{body}</p>
    </div>
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
function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 24, fontWeight: 600, color: T.gold }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: 0.5, color: T.muted, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
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
    <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
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
  const fname = firstName(profile);
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
  else if (habits30.length >= 10) parts.push(`On the upside, you've logged ${habits30.length} habit completions this month — quiet consistency.`);
  if (MENO_STAGES.has(stage)) parts.push(`Your symptoms may not follow a predictable rhythm — that's the nature of this stage. I'll keep watching.`);
  else if (cycle?.phase === "follicular") parts.push(`You're in your follicular phase — energy should climb over the next few days.`);
  else if (cycle?.phase === "ovulatory")  parts.push(`Your strongest window. Ride it, don't push past it.`);
  else if (cycle?.phase === "luteal")     parts.push(`Luteal phase — slowing down is what your body is asking for.`);
  else if (cycle?.phase === "menstrual")  parts.push(`On your period — bleeding is labour. Be gentle with yourself.`);
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
