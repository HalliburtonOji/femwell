// ─────────────────────────────────────────────────────────────────────────────
// HealthCornerDemo — single tab on /Ideas (FoundersOS) that renders a
// fully tabbed Health Corner hub with 8 inner tabs:
//
//   Overview  · Cycle · Life Stage · Skin & Hair · Body · Mind ·
//   Nourishment · Care
//
// Tabbing here is the proper kind — switching the active tab REPLACES
// the rendered content, not stacks it. The outer FoundersOS tab rail
// chooses "Health Corner"; this component owns its own tab bar inside.
//
// Data is fetched once at the FoundersOS level (UserProfile +
// DailyCheckins / SymptomLogs / MealLog / MedicationLogs /
// SupplementLog / HabitLogs / SkinHairLogs) and passed in as props.
//
// Spec source: 2026-05-26 Halli — "Health Corner full tabbed hub demo
// on /Ideas". This file is the canonical Health Corner demo (replaces
// HealthCornerOverview/SkinHair/Body which were 3 separate scrolls).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
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
  teen: "Teen", reproductive: "Reproductive", "pre-ttc": "Pre-conception",
  ttc: "Trying to conceive",
  "pregnant-t1": "Pregnant · 1st trimester", "pregnant-t2": "Pregnant · 2nd trimester",
  "pregnant-t3": "Pregnant · 3rd trimester", pregnancy: "Pregnant",
  postpartum: "Postpartum",
  perimenopause: "Perimenopause", menopause: "Menopause", "post-menopause": "Post-menopause",
};

// ─── Phase content (cycling) ─────────────────────────────────────────
const PHASE_CONTENT = {
  follicular: {
    summary: "Days 6-13 typically. Estrogen rises; energy returns.",
    hormonal: "Estrogen is rising steadily from its period low. This drives the growth of follicles in your ovaries and thickens the uterine lining. Follicle-stimulating hormone (FSH) coordinates this growth, while estrogen itself begins to feed back to the hypothalamus to ramp up toward ovulation. You may notice clearer skin, better focus, and more social energy — estrogen supports serotonin and dopamine.",
    food:     "Your body is rebuilding. Prioritise iron-rich foods like lentils, spinach, and lean meat to replenish what was lost during menstruation. Pair iron sources with vitamin C (citrus, peppers) to boost absorption. Fermented foods support gut health and estrogen metabolism — kefir, sauerkraut, kimchi, live yoghurt. Light proteins and complex carbs give sustained energy.",
    movement: "Rising energy makes this a great time for strength training, new fitness challenges, and HIIT. Your body recovers faster and tolerates higher intensity well. Coordination and learning new movement patterns also peak in this phase — a good window for picking up a new sport or technique.",
  },
  ovulatory: {
    summary: "Days 14-16 typically. Estrogen peaks, brief LH surge.",
    hormonal: "Estrogen peaks and triggers a luteinising hormone (LH) surge, which releases a mature egg from a dominant follicle. Testosterone also spikes briefly, which can increase confidence, libido, and assertiveness. This fertile window lasts roughly 24-48 hours, though the egg survives 12-24 hours once released.",
    food:     "Raw or lightly cooked vegetables support liver function, which helps process the estrogen surge. Zinc-rich foods (pumpkin seeds, chickpeas, oysters) support egg quality and progesterone production for the upcoming luteal phase. Stay hydrated — your body temperature is slightly elevated and you may sweat more.",
    movement: "Peak performance window. Competitive sports, high-intensity cardio, and team activities feel natural. Your pain tolerance is also higher and your reaction time is at its monthly best. If you have a one-rep-max attempt, race, or competition, this is the week.",
  },
  luteal: {
    summary: "Days 17-28 typically. Progesterone dominates.",
    hormonal: "Progesterone dominates now, produced by the corpus luteum (the structure left behind after ovulation). It raises your body temperature by 0.3-0.5°C, can cause bloating and breast tenderness, and tends to dampen mood toward the end of this phase as it falls. Progesterone interacts with GABA receptors — initially calming, then disrupting sleep as it withdraws.",
    food:     "Magnesium (dark chocolate, avocado, almonds, leafy greens) helps reduce PMS symptoms and improves sleep quality. Complex carbohydrates stabilise blood sugar and reduce cravings. Reduce caffeine and alcohol — both exacerbate progesterone-driven anxiety and breast tenderness. B6 (banana, fish, poultry) is evidence-supported for PMS.",
    movement: "Shift toward moderate-intensity — yoga, pilates, swimming, walking. Avoid overtraining; your body is working hard internally and cortisol is more reactive. Rest is productive. If you do strength train, prioritise lower reps with longer recovery, not high-volume circuits.",
  },
  menstrual: {
    summary: "Days 1-5 typically. Estrogen and progesterone bottom out.",
    hormonal: "Estrogen and progesterone have both dropped, triggering the uterine lining to shed. Prostaglandins cause the uterus to contract, which is what creates cramping. Iron levels dip with menstrual blood loss — moderate exercise and iron-rich foods help more than complete rest. Brain chemistry shifts: lower serotonin can lower mood; this is hormonal, not character.",
    food:     "Prioritise iron (red meat, tofu, dark leafy greens) and vitamin C to aid absorption. Omega-3s (oily fish, flaxseed, walnuts) reduce prostaglandin production and ease cramping. Warm soups and broths support comfort and hydration. Avoid alcohol — it depletes B vitamins and worsens cramping for many.",
    movement: "Gentle movement is best — restorative yoga, slow walks, light stretching. Let your body lead. High intensity can increase cramping and worsen fatigue. If you train through your period, drop intensity 20-30% and listen carefully on day 1-2.",
  },
};

const PERI_CONTENT = {
  hormonal: "In perimenopause, estrogen and progesterone fluctuate unpredictably rather than following a monthly cycle. Estrogen swings can be sharp — surging then crashing — which is what drives hot flashes, mood shifts, and sleep disruption. Progesterone tends to decline earlier and more steadily, which can cause heavier or shorter cycles. This stage lasts on average 4-8 years and ends 12 months after your final period.",
  food:     "Prioritise phytoestrogens (flaxseed, soy, chickpeas, edamame) which may help moderate estrogen fluctuations. Calcium (1000-1200mg/day) and vitamin D (800-1000IU+) are critical as bone density decreases sharply in this stage. Reduce sugar and refined carbs which amplify hot flashes and worsen insulin resistance. Protein at every meal supports muscle mass, which protects against sarcopenia.",
  movement: "Weight-bearing exercise — walking, jogging, strength training — is the single most important thing you can do for bone density and cardiovascular health in this stage. Aim for 3× weekly minimum. Yoga and tai chi support balance and joint mobility. Don't underestimate strength training; it's protective against fractures and helps with mood.",
};

// ─── Skin content (cycling + meno) ───────────────────────────────────
const SKIN_CONTENT = {
  follicular: {
    whats: "Rising estrogen increases collagen and hyaluronic acid production — skin tends to look clearer, more hydrated, and more luminous in this phase. Pores appear smaller. This is your skin's 'golden window'.",
    use:   "Lightweight hydration — a hyaluronic acid serum is ideal. Good time to introduce new actives (retinol, AHAs) as your skin barrier is stronger. SPF daily.",
    avoid: "No particular restrictions — this is the safest phase for skin experimentation.",
  },
  ovulatory: {
    whats: "Estrogen peaks and sebum production may increase slightly around ovulation. Some women notice a slight sheen or minor breakouts in this window — this is normal and hormone-driven, not hygiene-related.",
    use:   "Blotting papers over heavy moisturisers. Niacinamide helps regulate sebum. Keep SPF consistent.",
    avoid: "Heavy oils may clog pores. Fragrance can irritate slightly elevated sensitivity.",
  },
  luteal: {
    whats: "Progesterone increases sebum production, which can clog pores and trigger hormonal acne — particularly along the jawline and chin. Skin may appear duller and feel more sensitive. This is when most hormonal breakouts occur.",
    use:   "Salicylic acid spot treatments target hormonal acne. A gentler, barrier-focused routine — less exfoliation, more ceramides. Avoid introducing new actives.",
    avoid: "Avoid alcohol-based toners, harsh exfoliants, and introducing new products. Your skin's inflammatory response is heightened.",
  },
  menstrual: {
    whats: "Estrogen and progesterone are both low, making skin drier and more sensitive. Redness and inflammation are more noticeable. Barrier function is reduced — skin is more reactive to products.",
    use:   "Rich moisturiser and minimal actives. Fragrance-free products only. Calm the skin rather than treat it.",
    avoid: "Retinol, strong acids, and physical scrubs — all too aggressive for skin in this low-barrier state.",
  },
};
const SKIN_MENO = {
  whats: "Declining estrogen means less collagen and less natural oil production — skin becomes drier, thinner, and less elastic. You may notice deeper lines, more sensitivity, and changes in texture.",
  use:   "Hyaluronic acid serums, barrier-supporting moisturisers (ceramides), and SPF daily are the highest-impact interventions. Some women find topical estrogen (prescribed) or phytoestrogen-based creams helpful — discuss with your GP.",
  avoid: "Aggressive exfoliation, fragrance, and alcohol-based products — they amplify the dryness and sensitivity. Less is more in this stage.",
};
const HAIR_CONTENT = {
  follicular: "Estrogen extends the hair growth phase (anagen). Hair tends to be thicker, shinier, and grows faster. Minimal shedding — this is when hair is at its strongest.",
  ovulatory:  "Estrogen extends the hair growth phase (anagen). Hair tends to be thicker, shinier, and grows faster. Minimal shedding — this is when hair is at its strongest.",
  luteal:     "Increased DHT sensitivity in some women can lead to slight shedding. Hair may feel oilier at the roots. Normal — not a sign of hair loss.",
  menstrual:  "The hormonal dip can trigger a brief increase in shedding. This is telogen effluvium — a temporary response to the hormonal shift. Not permanent.",
};
const HAIR_MENO = "Declining estrogen and relative androgen dominance can cause changes in hair density — thinning at the crown, temples, or a widening part. This is androgenic alopecia driven by the hormonal shift. Options include minoxidil (topical, OTC), low-level laser therapy, and GP-prescribed treatments. Iron, ferritin, zinc, and vitamin D levels should be tested — deficiencies are common and treatable.";

const SUPPLEMENTS = [
  { name: "Zinc",            benefit: "Regulates sebum, reduces hormonal acne",       note: "Common in people who struggle with luteal-phase breakouts. Food sources: pumpkin seeds, chickpeas, cashews." },
  { name: "Omega-3",         benefit: "Anti-inflammatory, supports skin barrier",     note: "Particularly helpful for menstrual-phase dryness and sensitivity." },
  { name: "Collagen (I/III)",benefit: "Supports skin elasticity",                     note: "Most relevant in perimenopause and post-menopause as collagen production declines." },
  { name: "Biotin",          benefit: "Marketed for hair — evidence is mixed",        note: "Most effective for people with a genuine deficiency. Test before supplementing." },
  { name: "Iron / Ferritin", benefit: "Low iron is a leading cause of hair shedding", note: "If you're experiencing significant hair loss, ask your GP for a full blood count and ferritin test." },
];

// ─── Symptom notes (body tab) ────────────────────────────────────────
const SYMPTOM_NOTES = {
  hot_flash:  "Hot flashes are the most common perimenopause symptom, affecting 75% of women in the transition. Triggered by a narrowing of the thermoregulatory zone in the hypothalamus caused by estrogen fluctuation. Alcohol, caffeine, spicy food, and stress are common triggers. Keeping a trigger log can identify your personal patterns.",
  headache:   "Hormonal headaches typically cluster around menstruation (estrogen withdrawal) and mid-luteal phase. Magnesium supplementation (400mg glycinate) has strong evidence for prevention.",
  migraine:   "Menstrual migraine is driven by the drop in estrogen 2-3 days before bleeding. Frovatriptan or naproxen taken pre-emptively can reduce severity. Consult a GP about prophylaxis if these are debilitating.",
  fatigue:    "Persistent fatigue across a cycle deserves attention — iron, ferritin, B12, vitamin D and thyroid function are the first labs to ask your GP about. Sleep quality and hidden inflammation are also common drivers.",
  bloating:   "Bloating typically peaks in the luteal phase due to progesterone-driven water retention. Reducing salt, increasing potassium (banana, leafy greens), and gentle movement help. Persistent bloating outside the luteal phase warrants a GP check.",
  brain_fog:  "Brain fog is driven by estrogen's role in supporting neurotransmitter function — lower and fluctuating estrogen directly affects memory and cognitive speed. Sleep quality is the highest-impact factor.",
  cramps:     "Primary dysmenorrhea (cramping in early period days) is driven by prostaglandins. NSAIDs (ibuprofen), heat, and omega-3s are evidence-based interventions. Pain that disrupts daily life is worth raising with a GP.",
  acne:       "Hormonal acne clusters along the jawline and chin and tends to flare in the luteal phase. Salicylic acid, zinc, and managing stress all help. A GP can prescribe topical retinoids or systemic options if severe.",
  insomnia:   "Sleep disruption during the late luteal phase and around menstruation is often hormonal. Cool room, magnesium glycinate, and consistent bedtime are first-line. Persistent insomnia warrants a sleep clinic referral.",
  anxiety:    "Cyclical anxiety often spikes in the luteal phase as progesterone falls. If it significantly affects your life every cycle, PMDD is worth discussing with a GP — there are effective treatments.",
  mood_swings:"Late-luteal mood shifts are common — falling progesterone and serotonin interactions. If these tip into severe low mood or distress, ask your GP about PMDD.",
  cravings:   "Luteal cravings (often for sugar or carbs) are real and hormonally driven. Balancing blood sugar with protein at each meal and avoiding caffeine spikes reduce them meaningfully.",
};
const fallbackSymptomNote = (sym) => `${prettyName(sym)} is something I'm keeping track of. If it's affecting your daily life, raise it with your GP — they may want to investigate further.`;

// ─── Life Stage content (the big one — 11 stages, ~6-8 paragraphs each) ──
const LIFE_STAGE_CONTENT = {
  teen: {
    oneliner: "Your cycle is still settling in. The first two years are often irregular — that's normal, not a problem.",
    paragraphs: [
      "Cycles typically begin between age 9 and 16, and the first two years after your first period are commonly irregular. Cycles can vary widely in length, flow, and symptoms during this window. The body is still calibrating the hormonal feedback loop between the brain (hypothalamus, pituitary) and the ovaries.",
      "Tracking matters even when cycles are unpredictable. Knowing your patterns helps you anticipate periods, manage school or sport around them, and notice when something is genuinely off. Use this app to log even rough start dates — over time the picture becomes clearer.",
      "Periods can be uncomfortable. Mild cramping is common; severe pain that stops you from school, sport, or sleep is not normal and deserves a GP conversation. The same goes for very heavy periods (soaking through a super pad in under 2 hours), cycles longer than 35 days, or cycles less than 21 days that persist.",
      "Mood shifts before and during periods are real. The hormonal drop affects serotonin and dopamine in the brain. This isn't being 'dramatic' — it's biology. Naming it (\"I'm in my luteal phase, that's why I feel this way\") is itself a form of agency.",
      "Iron matters in teenage years. Heavy periods + a growing body + commonly low-iron diets makes iron deficiency common. If you're tired, breathless walking up stairs, or unusually pale, ask your GP for a ferritin test (not just a standard iron test — ferritin shows your stored iron).",
      "If you don't want to discuss anything cycle-related with a parent or carer, you can see a GP independently from age 13 in the UK in most situations. Your GP is bound by confidentiality. School nurses and Brook (sexual health charity for under-25s) are also good resources.",
    ],
    redFlags: [
      "Periods stop for 3+ months (and pregnancy is excluded)",
      "Severe pain that NSAIDs don't touch and that stops you doing normal things",
      "Soaking through a super pad in under 2 hours",
      "Periods longer than 7 days that haven't settled",
      "Cycles shorter than 21 days or longer than 35 days persistently",
    ],
  },
  reproductive: {
    oneliner: "Optimising what's working. Knowing what's actually normal — and what isn't.",
    paragraphs: [
      "A typical cycle is 21-35 days from the first day of one period to the first day of the next, with bleeding lasting 3-7 days. Cycle length variation of a few days month to month is normal; consistent variation of more than 7-9 days deserves a closer look.",
      "Symptoms in a healthy cycle: some cramping early in the period, mild breast tenderness in the luteal phase, mood shifts around menstruation. None of these should stop your life. If they do, the spectrum from PMS → PMDD → dysmenorrhea → endometriosis is worth understanding and discussing with a GP.",
      "Periods are a vital sign. They reflect overall hormonal health, energy availability, and stress load. Cycles that disappear, become unpredictable, or change dramatically often reflect underlying changes — undereating, overtraining, thyroid issues, polycystic ovary syndrome (PCOS), endometriosis, or chronic stress.",
      "Fertility planning, even if you don't want children soon, matters. Cycle length is one of the best non-invasive indicators of ovulation health. If you're tracking and noticing 35+ day cycles consistently, anovulatory months, or no clear ovulation pattern, that's worth knowing before you're ready to conceive.",
      "Lifestyle has more leverage than most people realise. Sleep regularity, protein intake, strength training, and stress management all measurably affect cycle health. Cycle dysfunction is sometimes the first signal that something else in life is out of balance.",
      "Contraception choice changes your cycle. Hormonal birth control suppresses ovulation — what you bleed on the pill is a withdrawal bleed, not a true period. This is fine if it suits you, but it does mean cycle tracking and natural fertility awareness aren't accurate while you're on hormonal contraception.",
    ],
    redFlags: [
      "Heavy bleeding (soaking a pad or tampon in under 2 hours)",
      "Periods lasting longer than 7 days",
      "Severe pelvic pain that disrupts daily life",
      "Spotting between periods (especially if persistent)",
      "Cycles consistently shorter than 21 or longer than 35 days",
      "Pain during sex",
    ],
  },
  "pre-ttc": {
    oneliner: "Preparing your body 3-6 months before trying. The window when small changes matter most.",
    paragraphs: [
      "Egg quality is set roughly 3 months before ovulation. That's why preparation in the 3-6 months before trying matters more than what you do during a TTC cycle. This is your window for lifestyle leverage.",
      "Folic acid (400mcg daily) is the single most evidence-supported preconception supplement — start at least 3 months before trying. It reduces the risk of neural tube defects in early pregnancy. Higher doses (5mg) are recommended if you have a BMI over 30, diabetes, epilepsy, or a family history of neural tube defects — discuss with your GP.",
      "Get bloods checked. Ferritin (stored iron), vitamin D, thyroid function (TSH, free T4), and HbA1c (blood sugar) are useful pre-pregnancy baselines. Correcting deficiencies before conception protects both your pregnancy and the baby's development.",
      "Alcohol and smoking both affect egg and sperm quality. There's no established safe alcohol level in pregnancy or during conception. Cutting back ahead of time is easier than going cold-turkey when you're already pregnant.",
      "Weight, broadly: BMI 19-30 is associated with the highest fertility and lowest pregnancy complications. This isn't about thinness — being underweight reduces fertility just as significantly as being overweight. Strength + cardio + adequate protein is the goal, not restriction.",
      "Cycle regularity is a fertility indicator. If your cycles are erratic (less than 21 days, more than 35 days, or vary by more than 7-9 days month to month), it's worth investigating before you start trying — conditions like PCOS, thyroid disorders, and luteal phase defects are all very treatable when caught early.",
      "Your partner matters. Sperm quality also takes ~3 months to develop, and male factors account for 30-40% of fertility issues. Heat exposure (hot baths, laptops on laps), alcohol, smoking, BMI, and certain medications all affect sperm — preconception preparation is a both-of-you project.",
    ],
    redFlags: [
      "Cycles consistently outside 21-35 days",
      "BMI under 19 or over 30",
      "Known thyroid, autoimmune, or metabolic conditions not yet optimised",
      "Family history of fertility difficulties or recurrent miscarriage",
      "On medications that aren't pregnancy-safe (discuss alternatives with GP early)",
    ],
  },
  ttc: {
    oneliner: "Your fertile window is about 6 days per cycle. Timing, signs, and when to seek help.",
    paragraphs: [
      "The fertile window is the 5 days before ovulation plus ovulation day itself — about 6 days total per cycle. Sperm can survive in the female reproductive tract for up to 5 days; the egg lives 12-24 hours after release. Sex every 1-2 days in this window maximises conception chances.",
      "Identifying ovulation: cervical mucus changes (becomes stretchy and clear, like raw egg white), a slight rise in basal body temperature 1-2 days after ovulation, mid-cycle pelvic twinges (mittelschmerz), and ovulation predictor kits (OPKs) which detect the LH surge 12-36 hours before ovulation.",
      "Stress matters more than people admit. The relationship between stress and conception is bidirectional and well-evidenced. Mindfulness, sleep, and protecting at least some part of your life as not-TTC-related helps significantly. This is a marathon not a sprint.",
      "Timing of sex: every other day in your fertile window is sufficient — daily is not better. Lubricants matter: most commercial lubes are spermicidal. Pre-Seed or olive oil are sperm-friendly alternatives if you need help.",
      "When to seek help: if you're under 35 and have been actively trying for 12 months without conception, see a GP. If you're 35 or over, the timeline drops to 6 months. If you're 40 or over, or have known fertility concerns (PCOS, endometriosis, irregular cycles), see a GP after 3 months of trying.",
      "Pregnancy testing: home tests are accurate from the day of your expected period. Testing earlier produces false negatives. If your period is more than 7 days late and tests are negative, see a GP — there are conditions (very early miscarriage, hormonal imbalance) that need attention.",
      "Mental health during TTC is real. The 'two-week wait' between ovulation and a possible period is hard. Many find it helpful to limit symptom-spotting (early pregnancy and luteal phase share most symptoms), avoid early testing, and have a plan for negative-pregnancy-test days.",
    ],
    redFlags: [
      "No conception after 12 months under 35, 6 months over 35, 3 months over 40",
      "Cycles consistently irregular while trying",
      "Severe pelvic pain or pain during sex",
      "Recurrent miscarriages (2 or more) — referral to recurrent miscarriage clinic",
      "Known endometriosis, PCOS, or thyroid issues not currently treated",
    ],
  },
  "pregnant-t1": {
    oneliner: "Weeks 1-12. Everything is changing fast. Most symptoms are normal; some need attention immediately.",
    paragraphs: [
      "First trimester symptoms — nausea (often misnamed 'morning sickness'; it can happen any time of day), extreme fatigue, breast tenderness, food aversions, frequent urination, mood lability — are all driven by the rapid rise in hCG, estrogen, and progesterone. They're typically worst between weeks 6-9 and ease by weeks 12-14.",
      "Folic acid 400mcg daily is essential through week 12 to support neural tube development. Vitamin D (10mcg/400IU daily) is recommended throughout pregnancy. Avoid vitamin A supplements (and liver-containing foods) — high doses can cause birth defects.",
      "Food safety in the first trimester: avoid unpasteurised dairy, raw or undercooked meat and eggs, pâté, liver, swordfish/marlin (high mercury), and limit tuna. Cured meats and soft mould-ripened cheeses (brie, camembert) should also be avoided unless cooked. Alcohol: NHS guidance is to avoid entirely.",
      "Spotting in early pregnancy is common and is not always a sign of miscarriage — implantation can cause light bleeding around week 4. However, heavy bleeding, bleeding with cramps, or any bleeding accompanied by severe pelvic pain should be assessed urgently. Don't wait — call your GP, midwife, or 111.",
      "Book your first midwife appointment around weeks 8-10. Your midwife will run booking bloods (blood type, infectious diseases, anaemia, sickle cell/thalassaemia screening), arrange your dating scan (10-14 weeks), and discuss screening options for chromosomal conditions.",
      "Mental health matters from day one. Pregnancy is emotionally enormous. If you have a history of depression, anxiety, OCD, or eating disorders, tell your midwife — perinatal mental health services can support you proactively. There is no shame in needing this.",
      "Work and pregnancy: legally you don't have to tell your employer until 15 weeks before your due date, but practically, sharing earlier means you're protected by maternity rights and can access antenatal appointment time without explanation. Your choice — there is no 'right' way.",
    ],
    redFlags: [
      "Heavy bleeding, especially with cramps or pain",
      "Severe one-sided pelvic pain (rule out ectopic — urgent)",
      "Severe vomiting that prevents you keeping fluids down (hyperemesis — needs treatment)",
      "Fainting, severe dizziness, or shoulder-tip pain",
      "Signs of infection: high fever, painful urination, foul-smelling discharge",
    ],
  },
  "pregnant-t2": {
    oneliner: "Weeks 13-27. The 'easier' trimester for most. The big scan, baby's movements, body changes.",
    paragraphs: [
      "The anomaly scan, around 20 weeks, is the major scan of the second trimester. It checks fetal development in detail — heart, brain, spine, organs. You can usually find out the sex at this scan if you want to. If anything unexpected is found, you'll be referred to fetal medicine for further assessment and support.",
      "Baby's first movements (quickening) are typically felt between weeks 18-22 — earlier in second pregnancies. Movements increase in strength and regularity throughout this trimester. By week 24, you should be feeling consistent daily movements. Reduced movements at any point need same-day assessment — call your maternity unit.",
      "Iron requirements double in pregnancy. Many women develop iron-deficiency anaemia in the second trimester even if they were fine before. Bloods at 28 weeks check for this. Eat iron-rich foods (red meat, lentils, leafy greens, fortified cereals) with vitamin C to boost absorption.",
      "Skin and hair changes: many women experience the 'pregnancy glow' (real — it's increased blood volume), darker skin patches (chloasma/melasma — UV-driven, SPF helps), a dark vertical line on the abdomen (linea nigra), and thicker, faster-growing hair (estrogen prolongs the growth phase). Most resolves postpartum.",
      "Back pain, round ligament pain, and pelvic girdle pain are common as your centre of gravity shifts. Physiotherapy referral is available on the NHS for pelvic girdle pain — ask your midwife. Supportive bands and prenatal yoga help many.",
      "Nutrition specifics: calcium (1000mg+, dairy, fortified plant milks, leafy greens), omega-3 DHA (oily fish, algae supplements), continued vitamin D, iron. Hydration matters more — aim for 2.5L daily. Caffeine: limit to 200mg/day (one mug of coffee or three cups of tea).",
      "Sleeping on your side from around 28 weeks reduces stillbirth risk; back sleeping in later pregnancy can compress the vena cava. Use pillows for support — a wedge under your bump and one between your knees works well.",
    ],
    redFlags: [
      "Reduced fetal movement at any point after week 24",
      "Persistent severe headaches (rule out pre-eclampsia)",
      "Vision changes, swelling of hands/face, or pain under the ribs",
      "Vaginal bleeding",
      "Itching, especially severe and on palms/soles (rule out obstetric cholestasis)",
    ],
  },
  "pregnant-t3": {
    oneliner: "Weeks 28-40+. Preparing for birth. Knowing the signs of labour. Protecting your last weeks.",
    paragraphs: [
      "Antenatal classes typically run between weeks 28-36. NCT (National Childbirth Trust) classes are paid; NHS classes are free and increasingly available. Both cover labour signs, pain relief options, and early newborn care. Useful regardless of how confident you feel.",
      "Group B Strep (GBS) screening isn't routine in the NHS, but if you've previously had a GBS-positive pregnancy or have certain risk factors, antibiotics in labour are offered. You can pay privately for a swab test (~£40) if you want to know. Ask your midwife about your individual risk.",
      "Recognising labour: regular contractions that increase in frequency and intensity, lower back pain that doesn't ease with movement, a 'show' (mucus plug — pink-tinged discharge), and waters breaking (sometimes a gush, sometimes a slow trickle). Pre-labour ('Braxton Hicks') contractions are irregular, don't intensify, and may ease with movement or hydration.",
      "Phone your maternity unit if: contractions are 5 minutes apart and lasting 60 seconds for an hour (first baby) or you think something is starting (subsequent babies — second labours are often faster). Also call if waters break (even without contractions), bleeding, reduced movements, or anything else that worries you.",
      "Birth plans: write one, but hold it loosely. A useful birth plan covers preferences (positions, pain relief options, lighting, music, who's in the room) and contingencies (what matters most to you if a c-section becomes necessary). It's a conversation document with your midwife and partner, not a contract.",
      "Maternity leave: legally you can start as early as 11 weeks before your due date. Most people start 1-4 weeks before. Practically, finishing earlier with a buffer for rest is often more important than maximising weeks at home with the baby — postnatal recovery is what postnatal leave is for.",
      "Postnatal preparation: build a freezer of easy meals, sort baby admin (pediatric registration, child benefit forms), identify your one or two 'low-bar' people you can call when you're not okay. Postnatal depression affects 1 in 5; preparation is protective.",
    ],
    redFlags: [
      "Reduced fetal movement",
      "Severe headaches, vision changes, sudden swelling (pre-eclampsia signs)",
      "Severe itching, especially palms/soles (obstetric cholestasis)",
      "Vaginal bleeding",
      "Waters breaking but no contractions starting within 24h (risk of infection)",
      "Anything that feels wrong — trust yourself",
    ],
  },
  postpartum: {
    oneliner: "The fourth trimester. The bit no one prepares you for. You are also the patient.",
    paragraphs: [
      "Postnatal physical recovery is bigger than most people are told. Whether you had a vaginal birth or caesarean, the first 6 weeks are recovery, not 'bounce back'. Bleeding (lochia) typically continues for 4-6 weeks. Pelvic floor recovery, abdominal muscle separation (diastasis), and scar healing all take longer than the cultural narrative admits.",
      "Hormones crash dramatically after birth. Within 48-72 hours, estrogen drops faster than at any other point in a woman's life. This drives the 'baby blues' (tearfulness, lability) in the first 2 weeks — distinct from postnatal depression. If it persists past 2 weeks, intensifies, or includes intrusive thoughts, contact your GP or health visitor immediately.",
      "Postnatal depression affects 1 in 5 women and can develop up to a year after birth. Signs: persistent low mood, hopelessness, feeling disconnected from your baby, intrusive thoughts, panic, sleep problems beyond the baby's needs. It's treatable — therapy, medication, peer support all help. Asking for help isn't weakness, it's parenting.",
      "Breastfeeding doesn't always come naturally — and that's not a personal failure. The first 6 weeks are often hardest. Painful latching, supply concerns, and mastitis are common and resolvable with good support. Lactation consultants (IBCLCs) are worth their weight; ask your health visitor for referral or contact NCT's free helpline (0300 330 0700).",
      "Cycle return varies enormously. If you're exclusively breastfeeding, periods can be absent for 6-12+ months. With combination feeding, return is often around 3-6 months. With no breastfeeding, expect a period 4-8 weeks postpartum. You can ovulate before your first period — contraception matters.",
      "Pelvic floor recovery is non-negotiable. The NHS funds women's health physiotherapy for postnatal recovery in many areas — ask your GP. Symptoms like leaking, prolapse sensations (heaviness or 'bulging'), or pain during sex are common but not normal long-term. They're treatable.",
      "Night sweats are common for several weeks postpartum — falling estrogen plus prolactin surges. Hair loss starts around month 3-5 (telogen effluvium) and usually resolves by month 12. Weight loss varies; the 9-12 month timeline is a realistic recovery window for body composition.",
      "Your relationships will shift. With your partner, your parents, your friends, yourself. Don't expect anything to feel normal for 12 months. Lower the bar. Plan one easy thing a week. You're allowed to grieve the version of life you had before, even while loving the new one.",
    ],
    redFlags: [
      "Persistent low mood, hopelessness, or intrusive thoughts (any time in first year)",
      "Heavy bleeding that soaks a pad in an hour, or large clots",
      "Fever over 38°C",
      "Severe headache, vision changes (post-natal pre-eclampsia is possible)",
      "Painful, hot, swollen calf (DVT risk)",
      "Severe breast pain with fever (mastitis needing antibiotics)",
    ],
  },
  perimenopause: {
    oneliner: "The years before menopause. Hormones fluctuate sharply. Symptoms range from mild to life-altering.",
    paragraphs: [
      "Perimenopause is the years (typically 4-8) leading up to your final period. Average age of onset is 45-47, but can begin in the early 40s — sometimes earlier. It ends 12 months after your final period, at which point you're post-menopausal. The transition itself, not the destination, is what people are usually talking about when they say 'menopause'.",
      "Symptoms span 40+ possibilities. The well-known ones — hot flashes, night sweats, irregular cycles — are just a fraction. Less recognised: anxiety, brain fog, joint pain, palpitations, dry eyes, frozen shoulder, tinnitus, formication (skin crawling), changes in body odour, electric-shock sensations. If a new symptom appears in your 40s, perimenopause is on the differential.",
      "Hormone replacement therapy (HRT) is the most effective treatment for most perimenopausal symptoms. Modern HRT (transdermal estrogen via patch or gel, plus progesterone if you have a uterus) has a different risk profile from older oral forms — the breast cancer risk is much lower than commonly believed, and benefits to bone, heart, and brain health are substantial. NICE guidelines (2024) recommend it as first-line for most women.",
      "Not everyone needs HRT, and not everyone can take it. Non-hormonal options exist: SSRIs/SNRIs for mood and hot flashes, gabapentin for hot flashes, vaginal estrogen (very low systemic absorption — safe even after most breast cancers), cognitive behavioural therapy for hot flashes and insomnia. Lifestyle (sleep, strength training, omega-3, reducing alcohol) compounds with any medical approach.",
      "Many women are misdiagnosed in perimenopause. Anxiety and mood symptoms are often treated as primary mental health issues with antidepressants when HRT would be more appropriate. Brain fog is dismissed. Joint pain is attributed to 'getting older'. Advocate for yourself: NICE menopause guidance is clear, and the British Menopause Society maintains a directory of trained specialists.",
      "Cardiovascular and bone health become priorities. Estrogen is protective for both; declining estrogen accelerates bone loss (1-2% per year for the first 5 years post-menopause) and shifts cholesterol profiles. Strength training, weight-bearing exercise, calcium + vitamin D, and addressing any hypertension or cholesterol issues all matter now more than before.",
      "Take the Menopause Rating Scale (MRS) — a validated 11-symptom questionnaire that scores symptom burden. It's a good way to track your trajectory and a useful tool to bring to a GP appointment. Higher scores quantify what you've been describing.",
    ],
    redFlags: [
      "Cycles becoming heavier or longer (rule out fibroids, polyps, endometrial issues)",
      "Bleeding after sex or between periods (especially after age 45)",
      "Symptoms that severely affect work, relationships, or daily functioning",
      "Mood crisis — perimenopause is associated with increased suicide risk; reach out",
      "Joint pain that doesn't respond to usual measures (frozen shoulder is a marker)",
    ],
  },
  menopause: {
    oneliner: "12 months without a period. The transition is complete. What now matters most.",
    paragraphs: [
      "Menopause is technically a single day — 12 months after your final period. The average age in the UK is 51, but the normal range is 45-55. Earlier than 45 is 'early menopause'; before 40 is 'premature ovarian insufficiency (POI)' and warrants specialist assessment.",
      "Many symptoms of perimenopause persist into early menopause, then gradually settle for most women over 5-10 years. Hot flashes are the slowest to resolve — about 25% of women still have them a decade after their last period. Genitourinary symptoms (vaginal dryness, urinary urgency, recurrent UTIs) tend to worsen rather than improve without treatment.",
      "Vaginal estrogen is the single highest-impact treatment most women aren't told about. It's a low-dose cream, pessary, or ring that delivers estrogen locally to the vaginal tissues. Systemic absorption is negligible — it's safe even after most breast cancers (consult oncologist). It treats dryness, painful sex, urinary urgency, and recurrent UTIs.",
      "Bone density loss accelerates in the first 5-7 years post-menopause. A DEXA (bone density) scan is worth requesting if you have risk factors (family history of osteoporosis, low BMI, smoking history, glucocorticoid use). Calcium 1200mg + vitamin D 800-1000IU daily, plus weight-bearing exercise, are foundational.",
      "Cardiovascular disease becomes the leading cause of death in women post-menopause. Estrogen's loss removes a layer of cardiovascular protection. Cholesterol, blood pressure, and HbA1c (blood sugar) checks every few years matter. Mediterranean-style eating, regular cardio, and strength training are the highest-leverage interventions.",
      "Cognitive changes — slower processing, word-finding difficulties, occasional name-blanks — are common and usually settle. Persistent or progressive memory loss is not a normal part of menopause and warrants a GP assessment. Sleep quality is the single biggest modifiable factor for cognition.",
      "HRT is still appropriate for many women through menopause and beyond. The 'use the lowest dose for the shortest time' messaging from 20 years ago is outdated. Current evidence supports individualised duration based on symptom burden, risk profile, and personal preference. There's no automatic age cap on continuing HRT.",
    ],
    redFlags: [
      "Any postmenopausal bleeding — urgent assessment (rule out endometrial cancer)",
      "Sudden or severe joint pain",
      "New or severe headaches",
      "Persistent low mood, especially with social withdrawal",
      "Symptoms of POI (menopause under 40) — fertility, bone, and heart implications",
    ],
  },
  "post-menopause": {
    oneliner: "Beyond the transition. The longest chapter for most women. Long-term health priorities now.",
    paragraphs: [
      "Post-menopause is the chapter that lasts longer than any other for most women — 30+ years for those who reach average UK life expectancy. The dramatic hormonal shifts are over; the long-term health considerations are different and equally important to attend to.",
      "Bone health is a long-term project. DEXA scan every 2-3 years if you have risk factors, or at minimum a baseline after 65. Treatment thresholds (T-scores below -2.5 = osteoporosis; -1.0 to -2.5 = osteopenia) guide medication decisions. Bisphosphonates, denosumab, and other bone-active medications are highly effective when indicated.",
      "Cardiovascular health is the dominant long-term consideration. Annual BP, every-few-year cholesterol and HbA1c, plus attention to weight and waist circumference. Statins are recommended at lower thresholds than people often realise — discuss your cardiovascular risk score (QRISK3) with your GP, especially after 60.",
      "Cognitive health: education + social engagement + cardiovascular health + sleep + Mediterranean-style diet + regular exercise are the evidence-based dementia-reduction levers. Hearing loss management, vision care, and managing high BP and diabetes also matter. The same things that protect your heart protect your brain.",
      "Sexual health continues to matter and continues to be possible. Vaginal estrogen, lubricants, longer foreplay, and addressing libido changes (which can have many causes — relationship, mood, medication, vaginal comfort) are all valid. Sex doesn't have to look like it did at 30, but pleasure remains available.",
      "Cancer screening continues: cervical screening up to 65 (then dependent on history), breast screening until 71 (extendable on request), bowel screening from 50 to 74. After these ages, you can still request screening — discuss with your GP. Skin awareness becomes more important as melanoma risk climbs with age.",
      "Social and emotional health: many women describe post-menopause as a season of unexpected clarity and reduced people-pleasing. Use it. Friendship maintenance, sense of purpose, and creative engagement are all protective against late-life depression and cognitive decline — and worth pursuing for their own sake.",
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

// ─── Nutrients per life stage ────────────────────────────────────────
const NUTRIENTS_BY_STAGE = {
  reproductive: [
    { name: "Iron",     why: "Heavy periods and a still-developing body make iron-deficiency anaemia common.", sources: "Red meat, lentils, tofu, dark leafy greens. Pair with vitamin C." },
    { name: "Folate",   why: "Especially important if there's any chance of pregnancy.",                       sources: "Leafy greens, beans, fortified grains. Supplement 400mcg if TTC or could be pregnant." },
    { name: "Vitamin D",why: "UK sunlight is inadequate Oct-Mar; deficiency is common.",                       sources: "Oily fish, fortified foods, supplement 10mcg daily in winter." },
    { name: "Omega-3",  why: "Reduces inflammation; supports brain, eye, and cardiovascular health.",          sources: "Oily fish 2-3× weekly, or algae supplement." },
  ],
  "pre-ttc": [
    { name: "Folate",   why: "Reduces neural tube defect risk — start 3 months before conception.",            sources: "Leafy greens, beans, fortified cereals. Supplement 400mcg minimum." },
    { name: "Iron",     why: "Pre-existing iron deficiency worsens dramatically in pregnancy.",                sources: "Red meat, lentils, fortified cereals; test ferritin pre-pregnancy." },
    { name: "Vitamin D",why: "Optimising before pregnancy protects both you and the baby.",                    sources: "Supplement 10mcg+ daily; test 25(OH)D level." },
    { name: "Iodine",   why: "Critical for fetal brain development from earliest weeks.",                      sources: "Dairy, white fish, seaweed (in moderation); check antenatal multivitamins contain it." },
  ],
  ttc: [
    { name: "Folate",   why: "Essential through first trimester.",                                              sources: "400mcg supplement minimum; 5mg if BMI >30, diabetic, on epilepsy meds." },
    { name: "Vitamin D",why: "Linked to ovulation, implantation, and pregnancy outcomes.",                     sources: "Supplement 10mcg+ daily; test if you've never had a level." },
    { name: "Omega-3",  why: "Supports egg quality and early embryonic development.",                          sources: "Oily fish (avoid swordfish/marlin), algae oil, walnuts." },
    { name: "Choline",  why: "Brain development; often overlooked but as important as folate.",                sources: "Eggs (whole), liver (preconception only — avoid in pregnancy), supplement." },
  ],
  pregnancy: [
    { name: "Folic acid", why: "Through at least week 12 — neural tube defect prevention.", sources: "400mcg minimum daily; 5mg in high-risk cases." },
    { name: "Iron",       why: "Plasma volume nearly doubles by third trimester.",          sources: "Red meat, lentils, fortified cereals with vitamin C." },
    { name: "Calcium",    why: "Fetal skeleton draws on maternal stores.",                  sources: "Dairy, fortified plant milks, leafy greens; 1000mg daily." },
    { name: "Omega-3 DHA",why: "Critical for fetal brain and eye development.",             sources: "Oily fish 2×/week (limit tuna), or algae supplement 200mg DHA." },
    { name: "Vitamin D",  why: "Recommended throughout pregnancy by the NHS.",              sources: "Supplement 10mcg (400IU) daily." },
    { name: "Iodine",     why: "Severe deficiency causes cognitive impairment in offspring.",sources: "Dairy, white fish, antenatal multivitamins with iodine." },
  ],
  postpartum: [
    { name: "Iron",       why: "Blood loss + breastfeeding demand.",                         sources: "Red meat, lentils, fortified cereals." },
    { name: "Omega-3 DHA",why: "Breast milk DHA reflects maternal intake.",                 sources: "Oily fish 2×/week; algae supplement if not eating fish." },
    { name: "Vitamin D",  why: "Continues to matter, especially while breastfeeding.",       sources: "Supplement 10mcg daily; baby also needs supplementation." },
    { name: "Calcium",    why: "Bone density dips during lactation, then recovers.",         sources: "Dairy, fortified plant milks, leafy greens." },
  ],
  perimenopause: [
    { name: "Calcium",    why: "Bone density loss accelerates as estrogen declines.",       sources: "1000-1200mg daily; dairy, fortified plant milks, leafy greens." },
    { name: "Vitamin D",  why: "Required for calcium absorption.",                          sources: "Supplement 800-1000IU; test level if uncertain." },
    { name: "Magnesium",  why: "Reduces hot flashes, supports sleep, helps with mood.",     sources: "Dark chocolate, almonds, leafy greens; glycinate supplement 300-400mg." },
    { name: "Phytoestrogens", why: "May moderate estrogen fluctuations.",                   sources: "Flaxseed, soy, chickpeas, edamame." },
    { name: "Omega-3",    why: "Anti-inflammatory; supports cognitive function.",           sources: "Oily fish 2-3× weekly." },
  ],
  menopause: [
    { name: "Calcium",    why: "First 5-7 years post-menopause = fastest bone loss.",        sources: "1200mg daily; dairy, fortified alternatives, leafy greens." },
    { name: "Vitamin D",  why: "Calcium absorption + immune + mood support.",                sources: "800-1000IU minimum; consider 2000IU after testing." },
    { name: "Protein",    why: "Muscle mass protects against sarcopenia and falls.",         sources: "Aim 1.0-1.2g per kg body weight daily; spread across meals." },
    { name: "B12",        why: "Absorption decreases with age; affects energy and cognition.",sources: "Animal products, fortified foods; test if vegetarian/vegan." },
  ],
  "post-menopause": [
    { name: "Calcium + Vitamin D", why: "Bone density maintenance.",                          sources: "Combined supplement is common; aim 1200mg Ca + 800IU D minimum." },
    { name: "Protein",            why: "Sarcopenia prevention.",                              sources: "1.2g per kg body weight daily; distributed across meals." },
    { name: "Omega-3",            why: "Cardiovascular and cognitive protection.",            sources: "Oily fish, algae oil, walnuts, flaxseed." },
    { name: "B12",                why: "Age-related absorption decline.",                     sources: "Test level; supplement if low." },
    { name: "Fibre",              why: "Bowel cancer screening starts at 50 — fibre is protective.", sources: "Wholegrains, beans, vegetables; aim 30g daily." },
  ],
  teen: [
    { name: "Iron",       why: "Heavy periods + growth + commonly low-iron diets = ferritin deficits.", sources: "Red meat, fortified cereals, lentils; pair with vitamin C." },
    { name: "Calcium",    why: "Peak bone density is built before age 25 — this is the window.", sources: "1300mg daily; dairy or fortified alternatives." },
    { name: "Vitamin D",  why: "Bone development plus mood support.",                          sources: "Supplement 10mcg daily; oily fish, fortified foods." },
    { name: "Zinc",       why: "Skin health, immune function, growth.",                        sources: "Pumpkin seeds, chickpeas, lean meat." },
  ],
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

// Pick a content key for life stage given the profile (handle trimester split).
function resolveLifeStageKey(profile) {
  const stage = profile?.life_stage || "reproductive";
  if (stage === "pregnancy") {
    const w = Number(profile?.pregnancy_week);
    if (w && w <= 12) return "pregnant-t1";
    if (w && w <= 27) return "pregnant-t2";
    if (w) return "pregnant-t3";
    return "pregnant-t2"; // sensible default
  }
  return stage;
}

// Mood/energy colour wash for 1-5 ratings.
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

        {/* Active tab content */}
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
        Eight inner tabs in a real tabbed interface — switching replaces content, doesn't stack.
        Data fetched once at the FoundersOS level and spread across every inner tab.
        Life Stage tab covers 11 stages with 6-8 detailed paragraphs each plus red-flag lists.
      </ReviewerNote>
    </div>
  );
}

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
  const cut30= new Date(today); cut30.setDate(today.getDate() - 29);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });
  const symptoms7 = since(symptoms, cut7);
  const symptoms30= since(symptoms, cut30);
  const habits30  = since(habits,   cut30);

  const days7 = useMemo(() => lastNDayKeys(7), []);
  const mood7   = useMemo(() => alignDays(checkins, days7, readMood),   [checkins, days7]);
  const energy7 = useMemo(() => alignDays(checkins, days7, readEnergy), [checkins, days7]);

  const jess = useMemo(
    () => buildJessOverview(since(checkins, cut7), symptoms7, habits30, cycle, profile, stage),
    [checkins, symptoms7, habits30, cycle, profile, stage]
  );

  const phaseTeaser = isMeno
    ? "Estrogen and progesterone are fluctuating rather than cycling. That variability is what's driving most of what you're feeling."
    : (PHASE_CONTENT[phase]?.hormonal?.split(".").slice(0, 2).join(".") + ".");

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* 4-tile stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <Tile icon="😴" label="Sleep"    value={sleepToday != null ? `${sleepToday}h` : "Not logged"} />
        <Tile icon="💭" label="Mood"     value={moodToday != null ? MOOD_EMOJI[Math.max(0, Math.min(4, Math.round(moodToday) - 1))] : "Not logged"} large />
        <Tile icon="⚡" label="Energy"  value={energyToday != null ? `${energyToday}/5` : "Not logged"} />
        <Tile icon="🩺" label="Symptoms" value={`${symptomsToday} today`} />
      </div>

      {/* Jess card */}
      <div style={{
        background: T.jessBg, borderLeft: `4px solid ${T.gold}`,
        padding: "16px 18px", borderRadius: 12, marginBottom: 14,
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{
            padding: "3px 9px", borderRadius: 999, background: T.gold, color: T.espressoDk,
            fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
          }}>From Jess</span>
          <span style={{ marginLeft: 8, fontSize: 11.5, color: T.muted }}>Health corner · {new Date().toLocaleDateString("en-GB", { weekday: "long" })}</span>
        </div>
        <p style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 16, lineHeight: 1.7, color: T.espresso, margin: 0 }}>{jess}</p>
      </div>

      {/* This week */}
      <SubHeader>This week</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <WashRow label="Mood"   values={mood7}   tint={moodTint}   />
        <WashRow label="Energy" values={energy7} tint={energyTint} />
        <div style={{ marginTop: 10, fontSize: 13, color: T.muted }}>{symptoms7.length} symptom{symptoms7.length === 1 ? "" : "s"} logged this week.</div>
      </div>

      {/* Phase teaser */}
      <SubHeader>{isMeno ? "What's happening hormonally" : `Your ${PHASE_LABEL[phase]?.toLowerCase() || phase} phase`}</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 15, lineHeight: 1.65, color: T.espresso }}>{phaseTeaser}</p>
        <button
          onClick={() => setActive("cycle")}
          style={{
            marginTop: 12, background: "transparent", border: "none", cursor: "pointer",
            color: T.gold, fontSize: 13, fontWeight: 600,
          }}
        >See full cycle guide →</button>
      </div>

      {/* Quick log */}
      <SubHeader>Log something</SubHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 8 }}>
        <PillLink to="/Today?log=symptom">+ Symptom</PillLink>
        <PillLink to="/Today?log=mood">+ Mood</PillLink>
        <PillLink to="/Today?log=sleep">+ Sleep</PillLink>
        <PillLink to="/Today?log=medication">+ Medication</PillLink>
      </div>
    </div>
  );
}

// ─── CYCLE ────────────────────────────────────────────────────────────
function CycleTab({ profile, cycle, phase, stage, isMeno }) {
  if (isMeno) {
    return (
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 24, fontWeight: 600, color: T.espresso }}>
            {LIFE_STAGE_LABEL[stage] || prettyName(stage)}
          </div>
          <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4 }}>Cycle tracking sits in the background now — these notes still matter.</div>
        </div>
        <SubHeader>What's happening hormonally</SubHeader>
        <Card>{PERI_CONTENT.hormonal}</Card>
        <SubHeader>What to eat</SubHeader>
        <Card>{PERI_CONTENT.food}</Card>
        <SubHeader>How to move</SubHeader>
        <Card>{PERI_CONTENT.movement}</Card>
      </div>
    );
  }

  const phaseContent = PHASE_CONTENT[phase] || PHASE_CONTENT.follicular;
  const day = cycle?.cycleDay ?? cycle?.dayInCycle ?? null;
  const inFertile = day != null && cycle?.cycleLen
    && day >= Math.floor(cycle.cycleLen * 0.43) - 2
    && day <= Math.floor(cycle.cycleLen * 0.5) + 1;
  const fertileStart = cycle?.cycleLen ? Math.max(1, Math.floor(cycle.cycleLen * 0.43) - 2) : null;
  const fertileEnd   = cycle?.cycleLen ? Math.floor(cycle.cycleLen * 0.5) + 1 : null;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 28, fontWeight: 600, color: T.espresso }}>
          {PHASE_LABEL[phase]} phase
        </div>
        {day && (
          <span style={{
            padding: "4px 10px", borderRadius: 999, background: PHASE_COLOUR[phase] + "33", color: T.espresso,
            fontSize: 12, fontWeight: 600,
          }}>Day {day} of {cycle?.cycleLen || 28}</span>
        )}
      </div>

      {/* Hormonal */}
      <SubHeader>What's happening right now</SubHeader>
      <Card>{phaseContent.hormonal}</Card>

      {/* Fertile window */}
      {(stage === "reproductive" || stage === "ttc" || stage === "pre-ttc") && fertileStart && (
        <div style={{
          background: inFertile ? T.sageBg : "transparent",
          border: inFertile ? `2px solid ${T.sage}` : `1px solid ${T.border}`,
          borderRadius: 12, padding: "14px 16px", margin: "12px 0",
        }}>
          <div style={{ fontWeight: 700, color: T.espresso, fontSize: 14, marginBottom: 4 }}>
            Fertile window {inFertile ? "· now" : ""}
          </div>
          <div style={{ fontSize: 13.5, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.6 }}>
            {inFertile
              ? `You're in your fertile window (days ${fertileStart}-${fertileEnd}). Sex every 1-2 days maximises conception chances if you're trying.`
              : `Your fertile window is roughly days ${fertileStart}-${fertileEnd}. Outside this window now.`}
          </div>
        </div>
      )}

      {/* Cycle stats */}
      <SubHeader>Your cycle</SubHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <Stat label="Avg length"    value={profile?.cycle_avg_length ? `${profile.cycle_avg_length}d` : "—"} />
        <Stat label="Period length" value={profile?.period_length    ? `${profile.period_length}d`    : "—"} />
        <Stat label="Regularity"    value={profile?.cycle_avg_length ? "Tracking" : "Set up cycle"} />
      </div>

      {/* Phase-by-phase guide */}
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
              {p === phase && (
                <span style={{ marginLeft: "auto", fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>Now</span>
              )}
            </div>
            <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>{PHASE_CONTENT[p].summary}</div>
          </div>
        ))}
      </div>

      <SubHeader>What to eat in your {PHASE_LABEL[phase]?.toLowerCase()} phase</SubHeader>
      <Card>{phaseContent.food}</Card>

      <SubHeader>How to move in your {PHASE_LABEL[phase]?.toLowerCase()} phase</SubHeader>
      <Card>{phaseContent.movement}</Card>
    </div>
  );
}

// ─── LIFE STAGE ────────────────────────────────────────────────────────
function LifeStageTab({ profile, stage, isMeno }) {
  const key = resolveLifeStageKey(profile);
  const content = LIFE_STAGE_CONTENT[key] || LIFE_STAGE_CONTENT.reproductive;
  const label = LIFE_STAGE_LABEL[key] || prettyName(key);

  return (
    <div style={{ padding: "16px 18px 0" }}>
      {/* Banner */}
      <div style={{
        background: T.jessBg, borderRadius: 14, padding: "18px 20px", marginBottom: 14,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase",
          color: T.gold, fontWeight: 700, marginBottom: 6,
        }}>Your current life stage</div>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 28, fontWeight: 600, color: T.espresso, marginBottom: 6, letterSpacing: -0.3 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: T.espresso, lineHeight: 1.55, fontFamily: '"Fraunces", Georgia, serif' }}>{content.oneliner}</div>
      </div>

      {/* Stage guide */}
      <SubHeader>Your stage guide</SubHeader>
      <div style={{
        background: "#FFFFFF", borderRadius: 12, padding: "18px 20px",
        boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
        marginBottom: 14,
      }}>
        {content.paragraphs.map((p, i) => (
          <p key={i} style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 15, lineHeight: 1.75,
            color: T.espresso,
            margin: i === content.paragraphs.length - 1 ? 0 : "0 0 14px",
          }}>{p}</p>
        ))}
      </div>

      {/* HRT section for meno stages */}
      {isMeno && (
        <>
          <SubHeader>Hormone replacement therapy</SubHeader>
          <div style={{
            background: "#FFFFFF", borderRadius: 12, padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14,
          }}>
            <div style={{ fontSize: 14.5, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.7, marginBottom: 14 }}>
              <strong>Estrogen only:</strong> Prescribed if you've had a hysterectomy. Available as tablets, patches, gels, sprays, or implants.
              <br /><br />
              <strong>Combined (estrogen + progestogen):</strong> Standard for women with a uterus. The progestogen protects the womb lining from estrogen-driven thickening.
              <br /><br />
              <strong>Local vaginal estrogen:</strong> A low-dose cream, pessary or ring that treats vaginal dryness, painful sex, and urinary symptoms. Systemic absorption is negligible — safe for most women, including most who've had breast cancer (confirm with oncologist).
            </div>
            <Link to="/LifeStageCare" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 999, background: T.gold, color: T.espressoDk,
              textDecoration: "none", fontSize: 13, fontWeight: 700,
            }}>Take the MRS questionnaire <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </>
      )}

      {/* Red flags */}
      {Array.isArray(content.redFlags) && content.redFlags.length > 0 && (
        <>
          <SubHeader>When to see your GP</SubHeader>
          <div style={{
            background: T.blushBg, border: `1px solid ${T.blush}`, borderRadius: 12, padding: "16px 18px",
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10, fontWeight: 700 }}>
              These warrant a GP conversation:
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.75, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>
              {content.redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// ─── SKIN & HAIR ───────────────────────────────────────────────────────
function SkinHairTab({ profile, symptoms, skinLogs, cycle, phase, stage, isMeno }) {
  const phaseLabel = isMeno ? prettyName(stage) : (PHASE_LABEL[phase] || prettyName(phase));
  const skin = isMeno ? SKIN_MENO : (SKIN_CONTENT[phase] || SKIN_CONTENT.follicular);
  const hair = isMeno ? HAIR_MENO : (HAIR_CONTENT[phase] || HAIR_CONTENT.follicular);

  const days7 = useMemo(() => lastNDayKeys(7), []);
  const skinByDay = useMemo(() => {
    const m = new Map();
    for (const r of skinLogs) {
      const k = dateKeyOf(r); const v = r?.skin_rating ?? r?.skin_score ?? r?.rating;
      if (k && v != null) m.set(k, Number(v));
    }
    return days7.map((d) => ({ d, v: m.get(d) ?? null }));
  }, [skinLogs, days7]);
  const hairByDay = useMemo(() => {
    const m = new Map();
    for (const r of skinLogs) {
      const k = dateKeyOf(r); const v = r?.hair_shedding ?? r?.hair_rating ?? r?.shedding;
      if (k && v != null) m.set(k, Number(v));
    }
    return days7.map((d) => ({ d, v: m.get(d) ?? null }));
  }, [skinLogs, days7]);

  const acne = useMemo(() => symptoms.filter((r) => /acne|breakout/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms]);

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <SubHeader>Skin this {phaseLabel.toLowerCase()}</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <Card title="What's happening to your skin" body={skin.whats} />
        <Card title="What to use now"                body={skin.use} />
        <Card title="What to avoid now"              body={skin.avoid} />
      </div>

      <SubHeader>Skin log · last 7 days</SubHeader>
      <DotRow data={skinByDay} colourFor={(v) => moodTint(v)} emptyLabel="Log skin today" />

      <SubHeader>Hair & scalp this {phaseLabel.toLowerCase()}</SubHeader>
      <Card body={hair} />
      <div style={{ marginTop: 10 }}>
        <SubHeader>Hair shedding · last 7 days</SubHeader>
        <DotRow data={hairByDay} colourFor={(v) => moodTint(v)} emptyLabel="Log hair today" />
      </div>

      <SubHeader>Hormonal acne tracker</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10 }}>
          <strong>{acne.length}</strong> breakout {acne.length === 1 ? "entry" : "entries"} logged this month
        </div>
        <p style={{
          margin: 0, padding: "10px 12px", background: T.blushBg, borderLeft: `3px solid ${T.blush}`,
          fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.6, color: T.espresso,
          borderRadius: "0 8px 8px 0",
        }}>
          {acne.length >= 3
            ? "That's a pattern, not noise. Consider a salicylic acid serum from day 14 of your cycle and discuss a GP referral if it's impacting quality of life."
            : "Keep tracking. Hormonal acne tends to cluster in the luteal phase — patterns become clear over 2-3 cycles."}
        </p>
      </div>

      <SubHeader>Supplement suggestions · skin & hair</SubHeader>
      <div style={{ display: "grid", gap: 10 }}>
        {SUPPLEMENTS.map((s) => (
          <div key={s.name} style={{
            background: "#FFFFFF", borderRadius: 12, padding: 14,
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
              <strong style={{ fontSize: 15, color: T.espresso }}>{s.name}</strong>
              <span style={{ fontSize: 12, color: T.muted }}>{s.benefit}</span>
            </div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{s.note}</div>
          </div>
        ))}
        <div style={{ marginTop: 4, fontSize: 12, color: T.muted, fontStyle: "italic" }}>
          Discuss with your GP or a registered nutritionist before starting any supplement.
        </div>
      </div>
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

  const painLogs = useMemo(() => symptoms90.filter((r) => /cramp|pain|pelvic/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms90]);
  const painCycleDays = useMemo(() => {
    if (!profile?.last_period_start_date || !cycle?.cycleLen) return [];
    const start = new Date(profile.last_period_start_date); start.setHours(0,0,0,0);
    const out = [];
    for (const r of painLogs) {
      const k = dateKeyOf(r); if (!k) continue;
      const d = new Date(k); if (Number.isNaN(d.getTime())) continue;
      const diff = Math.floor((d - start) / 86400000); if (diff < 0) continue;
      out.push((diff % cycle.cycleLen) + 1);
    }
    return Array.from(new Set(out)).sort((a, b) => a - b);
  }, [painLogs, profile, cycle]);

  const painLine = (() => {
    if (painLogs.length === 0) return "No pain logs yet. Track on /Today to build a picture.";
    const earlyCount = painCycleDays.filter((d) => d <= 5).length;
    if (earlyCount >= 2 && painCycleDays.length >= 2 && earlyCount / painCycleDays.length >= 0.6) {
      return "Cramping in the first 5 days of your cycle is primary dysmenorrhea — prostaglandins cause the uterus to contract. NSAIDs (ibuprofen), heat, and omega-3s are evidence-based interventions.";
    }
    if (painCycleDays.some((d) => d > 5 && d < (cycle?.cycleLen || 28) - 5)) {
      return "Pain outside menstruation warrants a GP conversation — endometriosis or adenomyosis can cause mid-cycle pain.";
    }
    return "Pain pattern building — keep logging and I'll spot the rhythm.";
  })();

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <SubHeader>Jess on your symptoms · last 30 days</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        {ranked.length === 0
          ? <div style={{ fontSize: 13.5, color: T.muted }}>Nothing logged yet this month — track on /Today.</div>
          : <ol style={{ margin: 0, padding: "0 0 0 18px", listStyle: "decimal", color: T.espresso, fontSize: 14.5, lineHeight: 1.9 }}>
              {ranked.map(([sym, n]) => <li key={sym}><strong>{prettyName(sym)}</strong> — {n} time{n === 1 ? "" : "s"} this month</li>)}
            </ol>}
        {topKey && (
          <p style={{
            margin: "14px 0 0", padding: "12px 14px",
            background: T.sageBg, borderLeft: `3px solid ${T.sage}`,
            fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.65, color: T.espresso,
            borderRadius: "0 8px 8px 0",
          }}>{topNote}</p>
        )}
      </div>

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

      {isMeno && (
        <>
          <SubHeader>Hot flash tracker</SubHeader>
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 12 }}>
              <Stat label="This month"  value={String(hotFlashes.length)} />
              <Stat label="Per week"    value={(hotFlashes.length / 4).toFixed(1)} />
            </div>
            <p style={{ margin: 0, padding: "10px 12px", background: T.goldSoft, borderRadius: 8, fontFamily: '"Fraunces", Georgia, serif', fontSize: 13.5, color: T.espresso, lineHeight: 1.6 }}>
              <strong>Common triggers:</strong> alcohol, caffeine, spicy foods, stress, hot environments. Keep a trigger log to identify your patterns.
            </p>
          </div>
        </>
      )}

      <SubHeader>Pain & cramp tracker · last 3 months</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10 }}>
          <strong>{painLogs.length}</strong> pain {painLogs.length === 1 ? "entry" : "entries"}
          {painCycleDays.length > 0 && <> · on cycle days: <strong>{painCycleDays.join(", ")}</strong></>}
        </div>
        <p style={{ margin: 0, padding: "10px 12px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.6, color: T.espresso, borderRadius: "0 8px 8px 0" }}>
          {painLine}
        </p>
      </div>

      {isCycling && profile?.cycle_avg_length && (
        <>
          <SubHeader>Cycle health summary</SubHeader>
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <Stat label="Avg cycle"   value={`${profile.cycle_avg_length}d`} />
              <Stat label="Period"      value={`${profile.period_length || "—"}d`} />
              <Stat label="Phase"       value={PHASE_LABEL[cycle?.phase] || "—"} />
            </div>
          </div>
        </>
      )}
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
  const fogByWeek = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    for (const r of brainFog) {
      const k = dateKeyOf(r); if (!k) continue;
      const d = new Date(k); const diff = Math.floor((today - d) / 86400000);
      if (diff < 0 || diff > 29) continue;
      const w = Math.min(3, Math.floor(diff / 7));
      buckets[3 - w] += 1;
    }
    return buckets;
  }, [brainFog]);

  const stressContent = (() => {
    if (stage === "perimenopause" || stage === "menopause") {
      return "Anxiety and mood changes are among the most underdiagnosed perimenopause symptoms. Estrogen plays a key role in serotonin regulation. Many women are prescribed antidepressants when HRT would be more appropriate — advocate for yourself.";
    }
    if (stage === "postpartum") {
      return "Postnatal depression affects 1 in 5 women and can develop up to a year after birth. Baby blues (first 2 weeks) are normal; persistent low mood, anxiety, or intrusive thoughts warrant immediate GP contact.";
    }
    return "Luteal phase mood changes are driven by progesterone's effect on GABA and serotonin. If mood changes are severe and disrupt your life every cycle, PMDD may be worth exploring with a GP.";
  })();

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <SubHeader>Mood this month</SubHeader>
      <WashGrid values={mood30} days={days30} tint={moodTint} caption="Your emotional texture over 30 days." />

      <SubHeader>Energy this month</SubHeader>
      <WashGrid values={energy30} days={days30} tint={energyTint} caption="Your energy texture over 30 days." />

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
          <span style={{ marginLeft: 6 }}>sage ≥7h · gold 5-7h · blush &lt;5h</span>
        </div>
      </div>

      <SubHeader>Jess on your mind</SubHeader>
      <div style={{ background: T.jessBg, borderLeft: `3px solid ${T.gold}`, borderRadius: "0 12px 12px 0", padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 15, lineHeight: 1.7, color: T.espresso }}>
          {moodAvg == null
            ? "Not enough mood data yet for me to read your patterns. A few daily check-ins is all I need."
            : moodAvg >= 4
              ? "Your mood has been steady-bright this month. Your best sleep nights were almost certainly your best mood days too — sleep is the highest-leverage thing for mood. Protect it."
              : moodAvg >= 3
                ? "Your mood has been steady this month. Sleep quality is your biggest lever — protecting a consistent bedtime is worth more than any supplement I could recommend."
                : "Your mood has been low this month. I see it. Sleep, sunlight in the first hour of waking, and human connection are the three highest-leverage interventions — plus, if this persists, a GP conversation."}
        </p>
      </div>

      <SubHeader>Stress & mental health · for your stage</SubHeader>
      <Card>{stressContent}</Card>

      <SubHeader>Brain fog tracker</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 24, fontWeight: 600, color: T.gold, marginBottom: 4 }}>{brainFog.length}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>brain fog days this month</div>
        <div style={{ fontSize: 13.5, color: T.espresso }}>
          Week 1: <strong>{fogByWeek[0]}</strong> · Week 2: <strong>{fogByWeek[1]}</strong> · Week 3: <strong>{fogByWeek[2]}</strong> · Week 4: <strong>{fogByWeek[3]}</strong>
        </div>
      </div>
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

  // Hydration
  const hydrationToday = (() => {
    const v = todayChk?.hydration ?? todayChk?.water_glasses ?? todayChk?.water;
    if (v != null) return Number(v) * 250; // assume glass = 250ml
    const todayMeals = meals.filter((m) => dateKeyOf(m) === todayKey);
    return todayMeals.reduce((s, m) => s + (Number(m.water_ml) || 0), 0);
  })();
  const hydroPct = Math.min(100, Math.round((hydrationToday / 2000) * 100));

  // Supplements
  const supps7 = supps.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cut7; });
  const suppsByName = useMemo(() => {
    const m = new Map();
    for (const r of supps7) {
      const name = r?.supplement_name || r?.name; if (!name) continue;
      const k = dateKeyOf(r); if (!k) continue;
      if (!m.has(name)) m.set(name, new Set());
      m.get(name).add(k);
    }
    return Array.from(m.entries());
  }, [supps7]);

  // Nutrients per stage
  const nutrientKey = isMeno ? stage : (stage === "pregnancy" || /^pregnant/.test(stage) ? "pregnancy" : stage);
  const nutrients = NUTRIENTS_BY_STAGE[nutrientKey] || NUTRIENTS_BY_STAGE.reproductive;

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <SubHeader>Phase nutrition · all four</SubHeader>
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {["follicular", "ovulatory", "luteal", "menstrual"].map((p) => (
          <div key={p} style={{
            background: "#FFFFFF",
            border: p === phase ? `2px solid ${T.gold}` : "none",
            borderRadius: 12, padding: 14,
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }} aria-hidden="true">{PHASE_EMOJI[p]}</span>
              <strong style={{ fontSize: 14.5, color: T.espresso }}>{PHASE_LABEL[p]}</strong>
              {p === phase && <span style={{ marginLeft: "auto", fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>Now</span>}
            </div>
            <p style={{ margin: 0, fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, lineHeight: 1.65, color: T.espresso }}>
              {PHASE_CONTENT[p].food}
            </p>
          </div>
        ))}
      </div>

      <SubHeader>This week's meals</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-around" }}>
          {days7.map((d, i) => (
            <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: mealCountByDay[i] >= 3 ? T.sage : mealCountByDay[i] > 0 ? T.gold : "transparent",
                border: mealCountByDay[i] === 0 ? `1px dashed ${T.border}` : "none",
              }} title={`${mealCountByDay[i]} meals`} />
              <div style={{ fontSize: 10.5, color: T.muted }}>{new Date(d).toLocaleDateString("en-GB", { weekday: "short" })}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: T.muted }}>
          Sage = on track (≥3 meals) · gold = sparse · dashed = no logs.
        </div>
      </div>

      <SubHeader>Hydration</SubHeader>
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ height: 14, background: T.border, borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${hydroPct}%`, background: T.sage, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontSize: 13, color: T.espresso }}>
          <strong>{hydrationToday || 0}ml</strong> today · target 2000ml · <span style={{ color: T.muted }}>{Math.max(0, 2000 - hydrationToday)}ml to go</span>
        </div>
      </div>

      <SubHeader>Supplements this week</SubHeader>
      {suppsByName.length === 0
        ? <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14, fontSize: 13.5, color: T.muted }}>
            No supplements logged this week.
          </div>
        : (
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {suppsByName.map(([name, daySet]) => (
              <div key={name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong style={{ fontSize: 14, color: T.espresso }}>{prettyName(name)}</strong>
                  <span style={{ fontSize: 12, color: T.muted }}>{daySet.size}/7 days</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {days7.map((d, i) => (
                    <div key={i} style={{
                      width: 14, height: 14, borderRadius: 999,
                      background: daySet.has(d) ? T.sage : "transparent",
                      border: daySet.has(d) ? "none" : `1px solid ${T.border}`,
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      <SubHeader>Key nutrients for your stage</SubHeader>
      <div style={{ display: "grid", gap: 10 }}>
        {nutrients.map((n) => (
          <div key={n.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ marginBottom: 4 }}>
              <strong style={{ fontSize: 15, color: T.espresso }}>{n.name}</strong>
            </div>
            <div style={{ fontSize: 13.5, color: T.espresso, lineHeight: 1.6, marginBottom: 4, fontFamily: '"Fraunces", Georgia, serif' }}>{n.why}</div>
            <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>{n.sources}</div>
          </div>
        ))}
        <div style={{ marginTop: 4, fontSize: 12, color: T.muted, fontStyle: "italic" }}>
          Discuss supplementation with your GP or a registered nutritionist before starting.
        </div>
      </div>
    </div>
  );
}

// ─── CARE ──────────────────────────────────────────────────────────────
function CareTab({ profile, symptoms, meds, supps, stage, isMeno }) {
  const today = todayLocal();
  const cut14 = new Date(today); cut14.setDate(today.getDate() - 13);
  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const since = (rows, c) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= c; });

  const meds14 = since(meds, cut14);
  const medsByName = useMemo(() => {
    const m = new Map();
    for (const r of meds14) {
      const name = r?.medication_name || r?.med_name || r?.name; if (!name) continue;
      const k = dateKeyOf(r); if (!k) continue;
      if (!m.has(name)) m.set(name, { days: new Set(), last: k });
      const entry = m.get(name); entry.days.add(k); if (k > entry.last) entry.last = k;
    }
    return Array.from(m.entries()).map(([name, v]) => ({ name, days: v.days, adherence: Math.round((v.days.size / 14) * 100), last: v.last }));
  }, [meds14]);

  const supps14 = since(supps, cut14);
  const suppsByName = useMemo(() => {
    const m = new Map();
    for (const r of supps14) {
      const name = r?.supplement_name || r?.name; if (!name) continue;
      const k = dateKeyOf(r); if (!k) continue;
      if (!m.has(name)) m.set(name, new Set()); m.get(name).add(k);
    }
    return Array.from(m.entries()).map(([name, days]) => ({ name, days, adherence: Math.round((days.size / 14) * 100) }));
  }, [supps14]);

  const days14 = useMemo(() => lastNDayKeys(14), []);

  // Computed "to discuss with GP" list
  const symptoms30 = since(symptoms, cut30);
  const toDiscuss = useMemo(() => buildGPDiscussionList(symptoms30, profile, stage, isMeno), [symptoms30, profile, stage, isMeno]);

  return (
    <div style={{ padding: "16px 18px 0" }}>
      <SubHeader>Medications · last 14 days</SubHeader>
      {medsByName.length === 0
        ? <Card body="No medications logged in the last 14 days." />
        : (
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {medsByName.map((m) => (
              <div key={m.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong style={{ fontSize: 14.5, color: T.espresso }}>{prettyName(m.name)}</strong>
                  <span style={{ fontSize: 12, fontWeight: 600, color: m.adherence >= 80 ? T.sage : m.adherence >= 50 ? T.gold : T.muted }}>
                    {m.adherence}% adherence
                  </span>
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

      <SubHeader>Supplements · last 14 days</SubHeader>
      {suppsByName.length === 0
        ? <Card body="No supplements logged in the last 14 days." />
        : (
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {suppsByName.map((s) => (
              <div key={s.name} style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong style={{ fontSize: 14.5, color: T.espresso }}>{prettyName(s.name)}</strong>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.adherence >= 80 ? T.sage : s.adherence >= 50 ? T.gold : T.muted }}>
                    {s.adherence}% adherence
                  </span>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {days14.map((d, i) => (
                    <div key={i} title={d} style={{
                      flex: 1, height: 10, borderRadius: 2,
                      background: s.days.has(d) ? T.sage : "transparent",
                      border: s.days.has(d) ? "none" : `1px solid ${T.border}`,
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      {isMeno && (
        <>
          <SubHeader>HRT</SubHeader>
          <div style={{ background: T.jessBg, borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.65, marginBottom: 12 }}>
              {medsByName.some((m) => /hrt|estrogen|estradiol|progester/i.test(m.name))
                ? "Tracking your HRT alongside your other meds — adherence shown above."
                : "If you're on HRT, log it as a medication so adherence is captured here. The Life Stage tab has detailed information on HRT types."}
            </div>
            <Link to="/DoctorExport" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 999, background: T.gold, color: T.espressoDk,
              textDecoration: "none", fontSize: 13, fontWeight: 700,
            }}>Take your data to your GP <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </>
      )}

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

      <SubHeader>Things to discuss with your GP</SubHeader>
      <div style={{ background: T.blushBg, border: `1px solid ${T.blush}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
        {toDiscuss.length === 0
          ? <div style={{ fontSize: 13.5, color: T.espresso }}>Nothing's flagging right now. If you have new or changing symptoms, log them and check back here.</div>
          : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {toDiscuss.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i === toDiscuss.length - 1 ? 0 : 10 }}>
                  <span aria-hidden="true" style={{
                    flexShrink: 0, marginTop: 3, width: 16, height: 16, borderRadius: 4,
                    border: `1.5px solid ${T.espresso}`, background: "#FFFFFF",
                  }} />
                  <div style={{ fontSize: 14, color: T.espresso, lineHeight: 1.55, fontFamily: '"Fraunces", Georgia, serif' }}>{item}</div>
                </li>
              ))}
            </ul>
          )}
      </div>

      {isMeno && (
        <>
          <SubHeader>Menopause Rating Scale</SubHeader>
          <Link to="/LifeStageCare" style={{
            display: "block", background: "#FFFFFF", borderRadius: 12, padding: "14px 16px",
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)", textDecoration: "none", color: T.espresso,
          }}>
            <strong style={{ fontSize: 14 }}>Take the MRS questionnaire →</strong>
            <div style={{ marginTop: 4, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
              A validated 11-symptom questionnaire to score your menopause symptom burden. Great to bring to a GP appointment.
            </div>
          </Link>
        </>
      )}
    </div>
  );
}

// ─── Shared subcomponents ─────────────────────────────────────────────
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
        <Sparkles className="w-3 h-3" /> Design Preview — Health Corner
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
      {body && (
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: T.espresso, fontFamily: '"Fraunces", Georgia, serif' }}>{body}</p>
      )}
      {!body && children}
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
function DotRow({ data, colourFor, emptyLabel }) {
  const hasAny = data.some((x) => x.v != null);
  if (!hasAny) {
    return (
      <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, textAlign: "center", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14 }}>
        <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 10 }}>No logs yet this week.</div>
        <Link to="/Today" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 999, background: T.espresso, color: T.cream,
          fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}>+ {emptyLabel}</Link>
      </div>
    );
  }
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(58,44,26,0.08)", marginBottom: 14, display: "flex", gap: 10, alignItems: "center", justifyContent: "space-around" }}>
      {data.map(({ d, v }) => (
        <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div title={`${d} · ${v ?? "no log"}`} style={{
            width: 22, height: 22, borderRadius: 999,
            background: v != null ? colourFor(v) : "transparent",
            border: v != null ? "none" : `1px dashed ${T.border}`,
          }} />
          <div style={{ fontSize: 10.5, color: T.muted }}>{new Date(d).toLocaleDateString("en-GB", { weekday: "short" })}</div>
        </div>
      ))}
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

// ─── Helpers (data) ───────────────────────────────────────────────────
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
  else if (cycle?.phase === "follicular") parts.push(`You're in your follicular phase — energy should climb over the next few days. Good time for things that need a bit more of you.`);
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
