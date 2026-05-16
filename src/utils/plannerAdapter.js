// ─────────────────────────────────────────────────────────────────────────────
// plannerAdapter — single source of truth for "how the Planner reshapes
// itself for this user". Reads UserProfile.life_stage + UserProfile.conditions
// and returns the config every Planner surface consults.
//
// Spec ref:
//   claude-state/product-research/femwell-complete-life-planner-2026-05-16.md
//   src/pages/Ideas.jsx · Life Stages tab (LifeStagesView)
//
// Architecture (see /Ideas · Life Stages · Architecture diagram):
//   UserProfile {life_stage, conditions[]}  →  getPlannerConfig(...)  →
//   PlannerAdapter consumers (Planner.jsx, JessNarrativeHero, PillarsDeck,
//   MonthRibbon / SymptomRibbon, DailyStoryReel, PlannerTabs,
//   WarmthBundleCycle, DoctorReadyDiaryCard, plus GP-ready PDF export).
//
// Conditions are cross-cutting modifiers: PCOS + perimenopause both
// apply. The order of precedence is implemented inside getPlannerConfig.
// ─────────────────────────────────────────────────────────────────────────────

// Sensible base config (reproductive years, no conditions).
const BASE = {
  ribbonType:     "cycle",      // 'cycle' | 'pregnancy' | 'symptom' | 'event' | 'health'
  pillarSet:      ["Sleep", "Energy", "Mood", "Hydration", "Movement", "Cycle"],
  eyebrowPrefix:  "TODAY",
  cycleTabName:   "Cycle",
  cycleTabMode:   "ribbon",     // 'ribbon' | 'timeline' | 'heatmap' | 'events' | 'health'
  hiddenFeatures: [],
  contentTags:    ["any", "reproductive"],
  jessContext:    "The user is in her reproductive years with a standard menstrual cycle. Speak with confidence-honesty: use phase language where appropriate, but stay permissive — never imperative.",
  bannerText:     null,
};

// 11 life-stage configs (plus "none" → reproductive default).
const STAGE_CONFIGS = {
  none:           { ...BASE },
  teen: {
    ribbonType:     "cycle",
    pillarSet:      ["Sleep", "Energy", "Mood", "Cramps", "Skin", "Cycle"],
    eyebrowPrefix:  "TODAY · STILL LEARNING",
    cycleTabName:   "Cycle",
    cycleTabMode:   "ribbon",
    hiddenFeatures: ["contraception", "ttc", "pregnancy", "partnerSync", "hrt", "fertileWindow"],
    contentTags:    ["any", "teen", "menstrual-basics"],
    jessContext:    "The user is a teenager (15 and under or 16-17). Use very gentle, permissive language. Never predict her cycle confidently — say \"still learning your pattern\". Do not discuss contraception unless she asks directly. Do not discuss pregnancy or fertility. If she mentions disordered eating, self-harm, or anything safety-critical, offer to share UK resources (Childline, YoungMinds, Samaritans, NHS 111) and avoid clinical advice.",
    bannerText:     "Parent Bridge — Mum can see: dates only.",
  },
  reproductive:   { ...BASE },
  "pre-ttc": {
    ...BASE,
    eyebrowPrefix:  "TODAY · PRE-TTC",
    contentTags:    ["any", "pre-ttc", "fertility-prep"],
    jessContext:    "The user is thinking about trying to conceive but has not started. Surface AMH context lightly, prompt folic acid (UK NHS recommends 400 mcg daily from before conception), and partner conversations. Do not pretend she is actively TTC; she is preparing.",
  },
  ttc: {
    ribbonType:     "cycle",
    pillarSet:      ["Sleep", "BBT", "Mood", "OPK", "Supplements", "CD"],
    eyebrowPrefix:  "TODAY · CD",
    cycleTabName:   "Clinical",
    cycleTabMode:   "ribbon",
    hiddenFeatures: ["contraception"],
    contentTags:    ["any", "ttc", "two-week-wait", "fertility"],
    jessContext:    "The user is actively trying to conceive. Her cycle data is a clinical tool — focus on fertile-window confidence honestly (never assert it), BBT and OPK interpretation, supplement timing, and emotional support through the two-week wait. Be warm but never falsely optimistic about a possible pregnancy.",
  },
  "pregnant-t1": {
    ribbonType:     "pregnancy",
    pillarSet:      ["Sleep", "Energy", "Nausea", "Hydration", "Movement", "Baby"],
    eyebrowPrefix:  "TODAY · TRIMESTER I",
    cycleTabName:   "Journey",
    cycleTabMode:   "timeline",
    hiddenFeatures: ["contraception", "fertileWindow", "phaseColors", "ovulation"],
    contentTags:    ["any", "pregnancy", "t1"],
    jessContext:    "The user is in the first trimester of pregnancy. Common symptoms: nausea (often peaks week 8-10), fatigue, breast tenderness, food aversions. Miscarriage risk highest in T1 — never minimise, never falsely reassure. Mention NHS booking appointment + 12-week dating scan when relevant. Do not give clinical advice; signpost to midwife / GP.",
  },
  "pregnant-t2": {
    ribbonType:     "pregnancy",
    pillarSet:      ["Sleep", "Energy", "Mood", "Hydration", "Movement", "Baby"],
    eyebrowPrefix:  "TODAY · TRIMESTER II",
    cycleTabName:   "Journey",
    cycleTabMode:   "timeline",
    hiddenFeatures: ["contraception", "fertileWindow", "phaseColors", "ovulation"],
    contentTags:    ["any", "pregnancy", "t2"],
    jessContext:    "The user is in the second trimester. Energy often returns, baby movement first felt ~18-22 weeks, 20-week anomaly scan is the big landmark. Pre-eclampsia and gestational diabetes screening start in T2. Do not give clinical advice; signpost to midwife.",
  },
  "pregnant-t3": {
    ribbonType:     "pregnancy",
    pillarSet:      ["Sleep", "Back pain", "Mood", "Kicks", "Movement", "Baby"],
    eyebrowPrefix:  "TODAY · TRIMESTER III",
    cycleTabName:   "Journey",
    cycleTabMode:   "timeline",
    hiddenFeatures: ["contraception", "fertileWindow", "phaseColors", "ovulation"],
    contentTags:    ["any", "pregnancy", "t3", "birth-prep"],
    jessContext:    "The user is in the third trimester. Kick counting from week 24-28 (RCOG: change matters more than absolute count). Birth plan, hospital bag, antenatal classes are landmarks. Watch for pre-eclampsia signs (headache, vision changes, sudden swelling) — signpost to day-assessment unit, do not assess clinically.",
  },
  postpartum: {
    ribbonType:     "symptom",
    pillarSet:      ["Sleep", "Healing", "Mood", "Hydration", "Pelvic floor", "Feeding"],
    eyebrowPrefix:  "TODAY · POSTPARTUM",
    cycleTabName:   "Recovery",
    cycleTabMode:   "events",
    hiddenFeatures: ["contraception", "fertileWindow", "phaseColors"],
    contentTags:    ["any", "postpartum", "fourth-trimester"],
    jessContext:    "The user is postpartum. She is sleep-deprived, physically healing, and may be experiencing baby blues or postnatal depression. Use the gentlest possible voice. Reference EPDS check-ins (Edinburgh Postnatal Depression Scale) when mood is mentioned. Pelvic-floor work is universal NHS guidance. Do not predict return of period — it is highly variable with lactational amenorrhea.",
  },
  perimenopause: {
    ribbonType:     "symptom",
    pillarSet:      ["Hot flushes", "Night sweats", "Mood", "Brain fog", "Joint pain", "HRT log"],
    eyebrowPrefix:  "TODAY · PERI",
    cycleTabName:   "Patterns",
    cycleTabMode:   "heatmap",
    hiddenFeatures: ["fertileWindow", "phaseColorsDominant"],
    contentTags:    ["any", "perimenopause", "hrt"],
    jessContext:    "The user is perimenopausal. She may have irregular cycles, hot flushes, night sweats, sleep disruption, mood changes (often anxiety more than depression), brain fog, joint pain, vaginal dryness, libido changes. Focus on symptom patterns, HRT if relevant (without prescribing), and lifestyle strategies. NICE NG23 allows symptom-based diagnosis — do not push for FSH bloods. Resistance training is the highest-impact intervention.",
  },
  menopause: {
    ribbonType:     "symptom",
    pillarSet:      ["Hot flushes", "Sleep", "Mood", "GSM", "Joint pain", "HRT log"],
    eyebrowPrefix:  "TODAY · MENOPAUSE",
    cycleTabName:   "Patterns",
    cycleTabMode:   "heatmap",
    hiddenFeatures: ["fertileWindow", "phaseColors", "cycleRibbon"],
    contentTags:    ["any", "menopause", "hrt", "gsm"],
    jessContext:    "The user is menopausal (12+ months since last period). Vasomotor symptoms (hot flushes, night sweats) may still be active. Long-term concerns rise: bone density, cardiovascular risk, cognitive health, GSM. Local vaginal oestrogen is safe and effective. UK note: Gina (estradiol 10mcg pessary) is now OTC for 50+ post-menopausal women.",
  },
  "post-menopause": {
    ribbonType:     "health",
    pillarSet:      ["Sleep", "Bone", "Mood", "BP", "GSM", "Movement"],
    eyebrowPrefix:  "TODAY",
    cycleTabName:   "Health",
    cycleTabMode:   "health",
    hiddenFeatures: ["fertileWindow", "phaseColors", "cycleRibbon", "phasePrediction"],
    contentTags:    ["any", "post-menopause", "longevity", "gsm"],
    jessContext:    "The user is post-menopausal. The cycle is no longer relevant. Focus on long-term health: bone density (DEXA cadence), cardiovascular health (NHS Health Check at 40-74), GSM treatment (Gina OTC), cognitive health, life-pivot planning. Cardiovascular risk after menopause matches male risk and overtakes it within a decade.",
    bannerText:     "No cycle ribbon — centred on long-term health.",
  },
  // Legacy alias for users still on the old enum.
  pregnancy: null, // resolved at runtime → pregnant-t2 default
};

// Condition overrides — applied on top of the base stage config.
// Each entry can override any field. Multiple conditions stack in spec order.
const CONDITION_OVERRIDES = {
  pcos: (cfg) => ({
    ...cfg,
    ribbonType:  "event",
    pillarSet:   ["Sleep", "Weight", "Mood", "HbA1c", "Acne", "Bleed log"],
    cycleTabMode:"events",
    hiddenFeatures: Array.from(new Set([...cfg.hiddenFeatures, "fertileWindow", "phaseColors", "phasePrediction"])),
    contentTags: Array.from(new Set([...cfg.contentTags, "pcos", "metabolic"])),
    jessContext: cfg.jessContext + " She also has PCOS. Cycles may be long (35+ days) or absent — do not predict her next period. Focus on lifestyle, metabolic health (insulin sensitivity, HbA1c if logged), and symptom management. NHS guidance suggests inducing a withdrawal bleed every 3-4 months when amenorrheic to protect the endometrium — surface this gently if she has not bled for 90+ days.",
    bannerText:  "PCOS Mode — we are not predicting your next period.",
  }),
  endo: (cfg) => ({
    ...cfg,
    pillarSet:   replacePillar(cfg.pillarSet, "Movement", "Pain"),
    contentTags: Array.from(new Set([...cfg.contentTags, "endo", "pain-mapping"])),
    jessContext: cfg.jessContext + " She also has endometriosis. Heavy, painful periods and mid-cycle pain are common; bowel / bladder symptoms may be cyclical. Be aware that diagnostic delay averages 8 years in the UK — validate her experience. Pain mapping (location + severity over time) is the strongest data she can give a specialist.",
  }),
  pmdd: (cfg) => ({
    ...cfg,
    contentTags: Array.from(new Set([...cfg.contentTags, "pmdd", "luteal"])),
    jessContext: cfg.jessContext + " She also has (or is screening for) PMDD. Severe luteal-locked mood disorder that remits with the bleed. Diagnosis needs 2-month prospective DRSP tracking — surface that as a tool, not a diagnosis. Watch for crisis language and signpost UK resources (Samaritans 116 123, NHS 111) if she expresses self-harm thoughts.",
  }),
  fibroids: (cfg) => ({
    ...cfg,
    contentTags: Array.from(new Set([...cfg.contentTags, "fibroids", "hmb"])),
    jessContext: cfg.jessContext + " She also has fibroids. Heavy menstrual bleeding (HMB), longer bleeds, and anaemia symptoms (fatigue, breathlessness, palpitations) are common. NHS HMB threshold: >80 ml per cycle or soaking pads / tampons hourly, or large clots. Mention iron / ferritin awareness if heaviness is mentioned.",
  }),
  thyroid: (cfg) => ({
    ...cfg,
    contentTags: Array.from(new Set([...cfg.contentTags, "thyroid"])),
    jessContext: cfg.jessContext + " She also has a thyroid disorder (hypo or hyper). Cycle length, mood, and energy are strongly affected by TSH / T4 levels. If her cycle or mood changed when her TSH crossed a threshold, surface that pattern and suggest a GP conversation about dosing.",
  }),
  hrt: (cfg) => ({
    ...cfg,
    pillarSet:   replacePillar(cfg.pillarSet, "Cycle", "HRT log"),
    contentTags: Array.from(new Set([...cfg.contentTags, "hrt"])),
    jessContext: cfg.jessContext + " She is on HRT — type, dose, and route matter. Common UK regimens: oestradiol patch / gel / tablet, with progesterone (utrogestan or Mirena IUS), and sometimes testosterone (off-label, gel or AndroFeme). Local vaginal oestrogen is separate and safe alongside systemic HRT. Do not advise on dosing — surface the pattern she logs and prompt a GP review at the 3-month mark.",
  }),
  "cancer-survivor": (cfg) => ({
    ...cfg,
    contentTags: Array.from(new Set([...cfg.contentTags, "cancer-survivor", "induced-menopause"])),
    jessContext: cfg.jessContext + " She is a cancer survivor. Her cycle may have been disrupted by chemo, surgery, or endocrine therapy (tamoxifen / aromatase inhibitors). Induced menopause may be present even in her 30s / 40s. Do not surface fertility content unless she opts in. Be especially gentle with body-image and libido language.",
  }),
  ha: (cfg) => ({
    ...cfg,
    ribbonType:  "event",
    cycleTabMode:"events",
    hiddenFeatures: Array.from(new Set([...cfg.hiddenFeatures, "fertileWindow", "phaseColors", "phasePrediction"])),
    contentTags: Array.from(new Set([...cfg.contentTags, "ha", "recovery"])),
    jessContext: cfg.jessContext + " She has hypothalamic amenorrhea or an eating disorder history. NEVER predict her cycle. NEVER show calorie or macro content. NEVER discuss training intensity or weight. Recovery is the frame. UK resources: Beat (eating disorders charity) and FEAST. If she expresses crisis language, signpost Samaritans 116 123 and NHS 111.",
    bannerText:  "Recovery mode — we will not predict your cycle.",
  }),
  other: (cfg) => cfg, // no-op
};

function replacePillar(pillarSet, find, replaceWith) {
  return pillarSet.map((p) => (p === find ? replaceWith : p));
}

// Main API. Defensive: never throws — bad inputs collapse to the
// reproductive base config so the Planner always has a usable config.
export function getPlannerConfig(lifeStage, conditions) {
  try {
    const safeConditions = Array.isArray(conditions) ? conditions : [];
    const stageKey = lifeStage && STAGE_CONFIGS[lifeStage] !== undefined
      ? lifeStage
      : "none";
    // Legacy "pregnancy" enum value → default to T2 config.
    const baseStageKey = stageKey === "pregnancy" ? "pregnant-t2" : stageKey;
    let cfg = { ...(STAGE_CONFIGS[baseStageKey] || STAGE_CONFIGS.reproductive || BASE) };

    // Apply each condition override in spec-listed order. Multiple conditions stack.
    // PCOS is applied first because it most-strongly reshapes the ribbon.
    const order = ["pcos", "ha", "endo", "fibroids", "pmdd", "thyroid", "hrt", "cancer-survivor", "other"];
    for (const condKey of order) {
      if (safeConditions.includes(condKey) && CONDITION_OVERRIDES[condKey]) {
        const next = CONDITION_OVERRIDES[condKey](cfg);
        if (next && typeof next === "object") cfg = next;
      }
    }

    return cfg || { ...BASE };
  } catch {
    // Last resort — never crash the Planner. Return a clean reproductive config.
    return { ...BASE };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Console verification — uncomment to dump every stage's config to console
// when this module is first imported. Useful when wiring up new surfaces.
// ──────────────────────────────────────────────────────────────────────────
// const ALL_STAGES = [
//   "teen", "reproductive", "pre-ttc", "ttc",
//   "pregnant-t1", "pregnant-t2", "pregnant-t3",
//   "postpartum", "perimenopause", "menopause", "post-menopause",
// ];
// for (const s of ALL_STAGES) {
//   // eslint-disable-next-line no-console
//   console.log(`[plannerAdapter] ${s} →`, getPlannerConfig(s));
// }
// // eslint-disable-next-line no-console
// console.log(`[plannerAdapter] perimenopause + pcos →`, getPlannerConfig("perimenopause", ["pcos"]));
// // eslint-disable-next-line no-console
// console.log(`[plannerAdapter] reproductive + endo + hrt →`, getPlannerConfig("reproductive", ["endo", "hrt"]));
