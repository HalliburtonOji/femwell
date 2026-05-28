// ─────────────────────────────────────────────────────────────────────────────
// Health.jsx — the real /health page.
//
// Replaces the legacy /SkinHair + /LifeStageCare pages with a single Letter-
// format health content hub. 8 tabs (Overview / Cycle / Life Stage / Skin &
// Hair / Body / Mind / Nourishment / Care), each rendering as a tabbed letter
// with: tab-specific botanical motif letterhead, phase-aware salutation, ToC,
// expandable sections with key-fact callouts, expert quotes, P.S., sign-off,
// and a rosebud reading-progress indicator that opens as the user scrolls.
//
// Typography: Cormorant Garamond (serif body + headers) + DM Sans (labels +
// metadata), loaded from Google Fonts at mount.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";

// ════════════════════════════════════════════════════════════════════════════
// TABS
// ════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "overview",    label: "Overview",    icon: "✦" },
  { id: "cycle",       label: "Cycle",       icon: "◯" },
  { id: "lifestage",   label: "Life Stage",  icon: "◈" },
  { id: "skin",        label: "Skin & Hair", icon: "❧" },
  { id: "body",        label: "Body",        icon: "◉" },
  { id: "mind",        label: "Mind",        icon: "⟳" },
  { id: "nourishment", label: "Nourishment", icon: "✿" },
  { id: "care",        label: "Care",        icon: "⊕" },
];

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
const PHASE_LABEL = {
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
  menstrual: "Menstrual",
};

// ════════════════════════════════════════════════════════════════════════════
// BOTANICAL MOTIFS — one per tab
// ════════════════════════════════════════════════════════════════════════════
function TabBotanical({ tabId }) {
  switch (tabId) {
    case "overview":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#D4AF37" opacity="0.15" />
          <circle cx="24" cy="24" r="22" stroke="#D4AF37" strokeWidth="1" fill="none" />
          <text x="24" y="29" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="16" fontWeight="600" fill="#D4AF37">FW</text>
        </svg>
      );
    case "cycle":
      return (
        <svg width="120" height="48" viewBox="0 0 120 48" fill="none" aria-hidden="true">
          <ellipse cx="40" cy="28" rx="28" ry="14" fill="#8FAF8F" opacity="0.18" transform="rotate(-15 40 28)" />
          <ellipse cx="32" cy="20" rx="14" ry="8" fill="#8FAF8F" opacity="0.25" transform="rotate(-20 32 20)" />
          <ellipse cx="60" cy="24" rx="4" ry="16" fill="#3A2C1A" opacity="0.25" />
          <circle cx="60" cy="12" r="3" fill="#D4AF37" opacity="0.7" />
          <ellipse cx="80" cy="28" rx="28" ry="14" fill="#8FAF8F" opacity="0.18" transform="rotate(15 80 28)" />
          <ellipse cx="88" cy="20" rx="14" ry="8" fill="#8FAF8F" opacity="0.25" transform="rotate(20 88 20)" />
          <circle cx="28" cy="26" r="2" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.6" />
          <circle cx="44" cy="22" r="2" fill="#D4AF37" opacity="0.4" />
          <circle cx="76" cy="22" r="2" fill="#D4AF37" opacity="0.4" />
          <circle cx="92" cy="26" r="2" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.6" />
        </svg>
      );
    case "lifestage":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="36" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.3" />
          <circle cx="40" cy="40" r="28" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.4" />
          <circle cx="40" cy="40" r="20" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
          <circle cx="40" cy="40" r="12" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
          <circle cx="40" cy="40" r="4" fill="#D4AF37" opacity="0.7" />
          <line x1="40" y1="4" x2="40" y2="76" stroke="#3A2C1A" strokeWidth="0.3" opacity="0.1" />
          <line x1="4" y1="40" x2="76" y2="40" stroke="#3A2C1A" strokeWidth="0.3" opacity="0.1" />
        </svg>
      );
    case "skin":
      return (
        <svg width="120" height="48" viewBox="0 0 120 48" fill="none" aria-hidden="true">
          <ellipse cx="60" cy="24" rx="50" ry="20" fill="none" stroke="#8FAF8F" strokeWidth="1" opacity="0.5" />
          <ellipse cx="60" cy="24" rx="35" ry="14" fill="none" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.4" />
          <line x1="10" y1="24" x2="110" y2="24" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.3" />
          <path d="M60 10 Q75 24 60 38" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
          <path d="M60 10 Q45 24 60 38" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
          <path d="M60 10 Q80 18 90 24" fill="none" stroke="#8FAF8F" strokeWidth="0.5" opacity="0.4" />
          <path d="M60 10 Q40 18 30 24" fill="none" stroke="#8FAF8F" strokeWidth="0.5" opacity="0.4" />
          <circle cx="60" cy="24" r="3" fill="#D4AF37" opacity="0.6" />
        </svg>
      );
    case "body":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <ellipse cx="40" cy="25" rx="12" ry="18" fill="#E8B4B8" opacity="0.3" />
          <ellipse cx="55" cy="33" rx="12" ry="18" fill="#E8B4B8" opacity="0.25" transform="rotate(60 55 33)" />
          <ellipse cx="52" cy="52" rx="12" ry="18" fill="#E8B4B8" opacity="0.25" transform="rotate(120 52 52)" />
          <ellipse cx="40" cy="57" rx="12" ry="18" fill="#E8B4B8" opacity="0.3" transform="rotate(180 40 57)" />
          <ellipse cx="25" cy="52" rx="12" ry="18" fill="#E8B4B8" opacity="0.25" transform="rotate(240 25 52)" />
          <ellipse cx="25" cy="33" rx="12" ry="18" fill="#E8B4B8" opacity="0.25" transform="rotate(300 25 33)" />
          <circle cx="40" cy="40" r="8" fill="#D4AF37" opacity="0.2" />
          <circle cx="40" cy="40" r="4" fill="#D4AF37" opacity="0.5" />
        </svg>
      );
    case "mind":
      return (
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" aria-hidden="true">
          <circle cx="60" cy="30" r="5" fill="#3A2C1A" opacity="0.2" />
          <path d="M60 25 Q50 15 40 10" fill="none" stroke="#8FAF8F" strokeWidth="1" opacity="0.5" />
          <path d="M60 25 Q65 12 70 8" fill="none" stroke="#8FAF8F" strokeWidth="1" opacity="0.5" />
          <path d="M60 25 Q75 18 85 14" fill="none" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.4" />
          <path d="M60 25 Q45 20 35 16" fill="none" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.4" />
          <path d="M40 10 Q35 5 30 4" fill="none" stroke="#8FAF8F" strokeWidth="0.5" opacity="0.3" />
          <path d="M40 10 Q38 4 42 2" fill="none" stroke="#8FAF8F" strokeWidth="0.5" opacity="0.3" />
          <line x1="60" y1="35" x2="60" y2="55" stroke="#D4AF37" strokeWidth="1.5" opacity="0.4" />
          <path d="M60 50 Q50 55 44 58" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.4" />
          <path d="M60 50 Q70 55 76 58" fill="none" stroke="#D4AF37" strokeWidth="0.75" opacity="0.4" />
          <path d="M60 44 Q52 50 48 54" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
          <path d="M60 44 Q68 50 72 54" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        </svg>
      );
    case "nourishment":
      return (
        <svg width="120" height="48" viewBox="0 0 120 48" fill="none" aria-hidden="true">
          <line x1="60" y1="44" x2="60" y2="8" stroke="#8FAF8F" strokeWidth="1" opacity="0.5" />
          <line x1="44" y1="44" x2="44" y2="14" stroke="#8FAF8F" strokeWidth="1" opacity="0.4" />
          <line x1="76" y1="44" x2="76" y2="14" stroke="#8FAF8F" strokeWidth="1" opacity="0.4" />
          <ellipse cx="54" cy="20" rx="8" ry="4" fill="#8FAF8F" opacity="0.35" transform="rotate(-30 54 20)" />
          <ellipse cx="66" cy="20" rx="8" ry="4" fill="#8FAF8F" opacity="0.35" transform="rotate(30 66 20)" />
          <ellipse cx="38" cy="26" rx="7" ry="3.5" fill="#8FAF8F" opacity="0.3" transform="rotate(-40 38 26)" />
          <ellipse cx="82" cy="26" rx="7" ry="3.5" fill="#8FAF8F" opacity="0.3" transform="rotate(40 82 26)" />
          <circle cx="60" cy="8" r="4" fill="#D4AF37" opacity="0.5" />
          <circle cx="44" cy="14" r="3" fill="#D4AF37" opacity="0.4" />
          <circle cx="76" cy="14" r="3" fill="#D4AF37" opacity="0.4" />
          <ellipse cx="30" cy="38" rx="2.5" ry="1.2" fill="#9B8B7A" opacity="0.3" transform="rotate(45 30 38)" />
          <ellipse cx="90" cy="36" rx="2.5" ry="1.2" fill="#9B8B7A" opacity="0.3" transform="rotate(-30 90 36)" />
          <ellipse cx="20" cy="42" rx="2" ry="1" fill="#9B8B7A" opacity="0.25" transform="rotate(20 20 42)" />
        </svg>
      );
    case "care":
      return (
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none" aria-hidden="true">
          <path d="M15 30 Q15 52 40 52 Q65 52 65 30" fill="none" stroke="#9B8B7A" strokeWidth="1.5" opacity="0.4" />
          <line x1="10" y1="30" x2="70" y2="30" stroke="#9B8B7A" strokeWidth="1.5" opacity="0.4" />
          <line x1="52" y1="10" x2="36" y2="34" stroke="#3A2C1A" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
          <ellipse cx="35" cy="35" rx="5" ry="3" fill="#3A2C1A" opacity="0.2" transform="rotate(-30 35 35)" />
          <path d="M30 40 Q35 36 38 40" fill="none" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.5" />
          <path d="M40 42 Q45 38 48 42" fill="none" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.5" />
          <circle cx="34" cy="44" r="1" fill="#8FAF8F" opacity="0.4" />
          <circle cx="42" cy="45" r="1" fill="#8FAF8F" opacity="0.4" />
          <circle cx="48" cy="43" r="1" fill="#D4AF37" opacity="0.4" />
        </svg>
      );
    default:
      return null;
  }
}

function BotanicalDivider() {
  return (
    <div style={{ textAlign: "center", margin: "32px 0" }} aria-hidden="true">
      <svg width="160" height="24" viewBox="0 0 160 24" fill="none">
        <line x1="0" y1="12" x2="58" y2="12" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
        <ellipse cx="80" cy="12" rx="5" ry="10" fill="#8FAF8F" opacity="0.6" transform="rotate(-30 80 12)" />
        <ellipse cx="80" cy="12" rx="5" ry="10" fill="#8FAF8F" opacity="0.4" transform="rotate(30 80 12)" />
        <circle cx="80" cy="12" r="2.5" fill="#D4AF37" opacity="0.8" />
        <line x1="102" y1="12" x2="160" y2="12" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROSEBUD READING PROGRESS — opens as the user scrolls
// ════════════════════════════════════════════════════════════════════════════
function RosebudProgress({ scrollPct }) {
  const openness = Math.max(0, Math.min(1, scrollPct / 100));
  return (
    <div style={{ position: "fixed", bottom: 96, right: 18, opacity: 0.7, zIndex: 30, pointerEvents: "none" }} aria-hidden="true">
      <svg width="28" height="36" viewBox="0 0 24 32" fill="none">
        <line x1="12" y1="32" x2="12" y2="18" stroke="#8FAF8F" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx={4 + openness * 5} ry={8 + openness * 4} fill="#E8B4B8" opacity={0.3 + openness * 0.4} />
        <ellipse cx="12" cy="12" rx={4 + openness * 5} ry={8 + openness * 4} fill="#E8B4B8" opacity={0.25 + openness * 0.35} transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx={4 + openness * 5} ry={8 + openness * 4} fill="#E8B4B8" opacity={0.25 + openness * 0.35} transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r={2 + openness * 2} fill="#D4AF37" opacity={0.6 + openness * 0.3} />
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONTENT — HEALTH_CONTENT (sections per tab)
// ════════════════════════════════════════════════════════════════════════════
const HEALTH_CONTENT = {
  overview: {
    sections: [
      {
        id: "your-health-this-phase",
        title: "Your health this phase",
        keyFact: "Every phase of your cycle creates a distinct hormonal environment that affects cognition, immunity, pain sensitivity, and skin — simultaneously.",
        content: [
          { type: "para", text: "The female body does not operate on a 24-hour clock the way most health research assumes. It operates on a 28-day cycle — roughly — and within that cycle, every system in your body shifts in coordinated waves. The follicular phase (days 1–13) is characterised by rising oestradiol, improving mood and cognition, lower inflammation, and skin at its best. The ovulatory window (day 14) involves a brief LH surge, elevated libido, peak verbal fluency, and maximum pain tolerance. The luteal phase (days 15–28) is progesterone-dominant: calming early, then increasingly inflammatory as the cycle closes. Menstruation itself triggers prostaglandin-mediated uterine contractions alongside a sharp hormonal reset." },
          { type: "para", text: "This is not a minor variation. A 2019 study in Neuropsychopharmacology found that working memory capacity, verbal episodic memory, and spatial cognition all vary significantly across the cycle. Pain sensitivity fluctuates by up to 40% between phases. Immune function shifts measurably — women are more vulnerable to viral infections in the luteal phase and show stronger vaccine responses in the follicular." },
          { type: "expert", quote: "We have decades of research on the male 24-hour hormonal cycle. We are only beginning to understand what happens across the female 28-day one. The implications for medicine, psychiatry, and daily life are vast and largely unexplored.", attribution: "Professor Sarah Hillman, Reproductive Endocrinology" },
          { type: "para", text: "Tracking these patterns — through symptoms, mood, energy, skin, sleep — is not wellness theatre. It is building a personal dataset that has genuine diagnostic value. Patterns that repeat across cycles are signals. The more precisely you can describe those patterns to a clinician, the more efficiently they can investigate." },
        ],
      },
      {
        id: "what-to-track",
        title: "What's most worth tracking",
        keyFact: "The three highest-signal data points for hormonal health are: sleep quality, mood (specifically irritability and anxiety), and energy — logged consistently across the cycle.",
        content: [
          { type: "para", text: "Not all tracking is equal. The highest-signal data points for hormonal health are sleep quality, mood (specifically the texture of anxiety and irritability rather than general \"mood\"), and energy levels — logged with enough granularity to identify cycle-phase patterns. These three, tracked consistently over 3–4 cycles, will reveal patterns that change how you understand your own health." },
          { type: "list", items: [
            "Sleep: note time asleep, time awake, and most importantly whether you feel rested on waking. Progesterone improves sleep architecture in early luteal; the late-luteal drop disrupts it.",
            "Mood: the quality of irritability matters — is it outward (anger, impatience) or inward (self-criticism, rumination)? These map to different phases.",
            "Energy: distinguish between physical fatigue (body heavy, muscles tired) and cognitive fatigue (brain foggy, motivation low). They have different hormonal correlates.",
            "Pain: note location, intensity (1–10), and timing within cycle. Menstrual pain, mid-cycle pain, and premenstrual pain are mechanistically distinct.",
            "Skin: sebum level (oily vs dry), clarity (spots, texture), and sensitivity (reactive, tight). All cycle-phase dependent.",
          ] },
          { type: "expert", quote: "A patient who comes to me with a 3-month symptom diary is a completely different clinical encounter from one who describes symptoms from memory. The diary patient gets to the diagnosis faster. Always.", attribution: "Dr Miranda Foster, Gynaecologist" },
        ],
      },
      {
        id: "understanding-hormones",
        title: "The four hormones you need to know",
        keyFact: "Oestrogen, progesterone, LH, and FSH run the cycle — but they also govern skin, bone density, mood, memory, and cardiovascular function across your lifetime.",
        content: [
          { type: "para", text: "Four hormones coordinate the menstrual cycle, but their influence extends far beyond reproduction. Oestradiol (the primary oestrogen) acts on receptors in the brain, heart, bone, skin, and gut. Progesterone has calming effects via GABA-A receptor modulation and supports the uterine lining. Luteinising hormone (LH) triggers ovulation and, in its absence or excess, creates clinically meaningful symptoms. Follicle-stimulating hormone (FSH) rises sharply in perimenopause — an elevation in fasting FSH above 25 IU/L is one of the first measurable signs of menopausal transition." },
          { type: "stat", number: "28", label: "average cycle days, but 21–35 is normal" },
          { type: "para", text: "What's less commonly understood is that these hormones do not work in isolation. The HPA axis (stress hormones) directly suppresses reproductive hormones — chronic stress is one of the most common causes of cycle irregularity in women under 40. The thyroid intersects with oestrogen metabolism — hypothyroidism can cause irregular cycles, heavy bleeding, and premenstrual amplification. The gut microbiome (specifically the \"estrobolome\") regulates oestrogen recycling — dysbiosis can push oestrogen toward pro-inflammatory metabolites." },
          { type: "para", text: "This is why hormonal health cannot be reduced to a single number on a blood test. It is a system, and systems require context to interpret." },
        ],
      },
    ],
  },
  cycle: {
    sections: [
      {
        id: "your-cycle-right-now",
        title: "Your cycle, right now",
        keyFact: "Oestradiol peaks at around 200–400 pg/mL at ovulation — and this single hormone affects your brain, skin, immunity, and cardiovascular function simultaneously.",
        content: [
          { type: "para", text: "The menstrual cycle is a masterwork of coordinated endocrinology. In the follicular phase, rising oestradiol thickens the uterine lining while simultaneously improving mood, verbal fluency, and pain tolerance. The LH surge at mid-cycle triggers ovulation and briefly elevates libido and confidence. Progesterone dominates the luteal phase — calming in the first two weeks, then declining sharply before menstruation, taking its GABAergic calming effect with it." },
          { type: "expert", quote: "The menstrual cycle is the fifth vital sign. It tells us things about immune function, metabolic health, thyroid function, and stress response that no single blood test can capture.", attribution: "Dr Jen Gunter, OB/GYN and author" },
          { type: "para", text: "Cycle irregularity — whether in length, flow, pain, or premenstrual symptoms — is a signal worth investigating rather than managing. Cycles consistently shorter than 21 days or longer than 35, spotting between periods, sudden changes in flow, or premenstrual symptoms severe enough to disrupt daily function are all worth raising with your GP. These symptoms have names, mechanisms, and effective treatments." },
        ],
      },
      {
        id: "phase-by-phase",
        title: "What's happening phase by phase",
        keyFact: "During the luteal phase, progesterone metabolites act on GABA-A receptors — when they drop pre-menstrually, the effect is biochemically similar to low-dose benzodiazepine withdrawal.",
        content: [
          { type: "para", text: "Menstrual (Days 1–5): Oestrogen and progesterone are at their lowest. Prostaglandins trigger uterine contractions — the same molecules responsible for cramping also mediate the lining shedding. NSAIDs (ibuprofen, naproxen) reduce prostaglandin production and are the most evidence-based first-line treatment for dysmenorrhoea — more effective taken preventively from day 1 than reactively when cramps peak." },
          { type: "para", text: "Follicular (Days 6–13): Oestradiol rises steadily. The follicle grows to ~18–22mm. Brain: dopamine and serotonin receptor upregulation. Skin: collagen synthesis elevated, sebum reduced. Body: inflammatory markers fall, pain sensitivity decreases. This is the phase of energy, initiative, and clarity." },
          { type: "para", text: "Ovulatory (Day 14 ±2): LH surges over 24–48 hours. The follicle ruptures. Oestradiol peaks, then drops sharply. Some women experience mittelschmerz (mid-cycle pain) — a dull or sharp sensation on one side, lasting hours to a day, caused by follicular fluid irritating the peritoneum. If this is consistently painful or accompanied by bloating, it warrants investigation for endometriosis." },
          { type: "para", text: "Luteal (Days 15–28): Progesterone rises from the corpus luteum. Early luteal: warm, calm, sociable, sleep improved. Late luteal (days 22–28): progesterone falls, allopregnanolone (its calming metabolite) drops, GABA tone reduces. The result is increased amygdala reactivity, reduced prefrontal inhibition, higher anxiety, lower frustration tolerance. In women with PMDD, this transition triggers clinically significant mood disruption — not a personality trait, but a neurochemical sensitivity." },
          { type: "list", items: [
            "Cramps: prostaglandin-mediated — respond to NSAIDs, magnesium, and heat",
            "PMS: progesterone withdrawal + GABA sensitivity — magnesium, B6, and SSRIs (luteal-phase dosing) all have evidence",
            "PMDD: severe mood disruption in luteal phase — GnRH analogues and SSRIs are first-line; deserves specialist assessment",
            "Cycle irregularity: investigate thyroid (TSH), androgens (testosterone, DHEAS), prolactin, and day-2 FSH/LH",
            "Painful periods: endometriosis affects 1 in 10 women and is chronically underdiagnosed — average diagnosis delay is 7–10 years",
          ] },
        ],
      },
      {
        id: "cycle-tracking-science",
        title: "Tracking your cycle (the science)",
        keyFact: "Basal body temperature rises by 0.2–0.5°C after ovulation and stays elevated for the rest of the luteal phase — a reliable retrospective marker of ovulation.",
        content: [
          { type: "para", text: "Digital cycle tracking apps vary enormously in their predictive accuracy. Most use calendar averaging, which is inaccurate for women with irregular cycles. The most clinically useful data points to track are: cycle start (day 1 of full flow), any mid-cycle symptoms (ovulation pain, discharge changes), premenstrual symptoms (day of onset and severity), flow (light/medium/heavy, with clot presence), and pain (dysmenorrhoea severity and character)." },
          { type: "para", text: "Basal body temperature (BBT) tracking — taking your temperature at the same time each morning before getting up — confirms ovulation retrospectively. The temperature rise of 0.2–0.5°C that follows ovulation and persists through the luteal phase is the most accurate non-hormonal ovulation marker available. It requires 3–4 cycles to identify your pattern, but the resulting data is genuinely useful for fertility awareness, cycle phase identification, and thyroid screening (consistently low BBT suggests hypothyroidism)." },
          { type: "expert", quote: "Cycle tracking data, presented to a clinician as a 3-month chart with symptoms mapped by day, changes the consultation completely. It turns \"I feel terrible sometimes\" into a clinical pattern.", attribution: "Dr Lara Briden, Naturopathic Doctor and cycle advocate" },
        ],
      },
    ],
  },
  lifestage: {
    sections: [
      {
        id: "your-stage-now",
        title: "Understanding your life stage",
        keyFact: "The perimenopausal transition can begin up to 10 years before the final menstrual period — FSH elevation above 25 IU/L is often the first measurable sign.",
        content: [
          { type: "para", text: "The term \"life stage\" in women's health refers to the major hormonal transitions that define different chapters of biological experience — from the menarche to post-menopause, and including the significant hormonal events of pregnancy, postpartum, and contraceptive use. Each stage has its own endocrinological signature, its own health priorities, and its own set of clinical conversations worth having." },
          { type: "para", text: "Understanding your current stage is the foundation of informed healthcare. A perimenopausal woman whose GP has not discussed HRT options is being underserved. A postpartum woman whose thyroid function has not been checked six months after birth is similarly disadvantaged. A pre-TTC woman who has not been counselled on folic acid timing, genetic carrier screening options, or the value of cycle tracking before conception is missing preparation that changes outcomes." },
          { type: "expert", quote: "Women's health is not just reproductive health. Every hormonal transition — from first period to post-menopause — affects bone, brain, cardiovascular function, and mental health in ways that deserve proactive clinical management.", attribution: "Professor Lesley Regan, former President of the Royal College of Obstetricians and Gynaecologists" },
        ],
      },
      {
        id: "stage-specific-health",
        title: "What to prioritise at your stage",
        keyFact: "Bone density loss accelerates sharply in the first 5 years after menopause — a window during which HRT has the strongest evidence for prevention.",
        content: [
          { type: "para", text: "Reproductive years (teens–early 40s): The priorities are cycle literacy (understanding your own cycle patterns), contraception that works for your lifestyle and hormonal profile, and building the tracking habits that will inform every future health conversation. Iron deficiency is the most common nutritional deficiency in premenopausal women — annual ferritin testing is underutilised." },
          { type: "para", text: "Pre-TTC and TTC: The 3-month window before attempting conception is the highest-leverage intervention point. Folic acid 400µg started 3 months before and continued through the first trimester reduces neural tube defect risk by 70%. This is one of the best-evidenced nutritional interventions in medicine — and still underused. Cycle tracking in the pre-TTC phase provides a 3-cycle baseline that makes conception timing significantly more accurate." },
          { type: "para", text: "Postpartum: The sixth-week check is inadequate. The majority of postpartum thyroid dysfunction, perinatal mood disorders, and pelvic floor issues present after six weeks. A 3-month and 6-month check — including thyroid function, mood screening, and pelvic floor assessment — would catch the majority of undertreated postpartum conditions." },
          { type: "para", text: "Perimenopause (typically 40s–early 50s): The most heterogeneous and underdiagnosed hormonal transition. Symptoms may include cycle irregularity, hot flushes, sleep disruption, brain fog, joint pain, mood changes, and genitourinary symptoms — beginning years before the final period. FSH above 25 IU/L confirms menopausal transition. HRT, if appropriate and not contraindicated, has the strongest evidence base for symptom management and long-term cardiovascular and bone protection when started in the first 10 years after menopause." },
          { type: "list", items: [
            "Annual ferritin: for all premenopausal women (low ferritin causes fatigue, hair loss, poor sleep — often missed)",
            "Folic acid 400µg: start 3 months before any planned pregnancy",
            "Thyroid function (TSH): every 3–5 years for all women; annually if symptomatic",
            "Bone density (DEXA): at menopause or earlier if risk factors present",
            "Cervical screening: follow NHS schedule; don't defer",
            "BRCA1/2 discussion: if significant family history of breast or ovarian cancer — genetic counselling available via NHS",
          ] },
        ],
      },
    ],
  },
  skin: {
    sections: [
      {
        id: "hormonal-skin",
        title: "How hormones drive your skin",
        keyFact: "Oestrogen increases collagen synthesis and water-binding in skin; progesterone increases sebaceous activity. Your skin changes measurably across all four cycle phases.",
        content: [
          { type: "para", text: "Hormonal skin is not a problem to be fixed. It is the skin's faithful reflection of your endocrine system. Oestrogen upregulates collagen type I and III synthesis, increases glycosaminoglycans (the moisture-binding molecules), thickens the epidermis, and improves barrier function. At peak oestrogen (ovulatory phase), your skin is at its best — most hydrated, most resilient, lowest sebum production. In the luteal phase, progesterone increases sebaceous gland sensitivity to androgens, producing more sebum, larger pores, and the conditions for hormonal acne." },
          { type: "para", text: "Androgen excess — whether from PCOS, adrenal dysfunction, or elevated DHEAS — produces acne along the jaw, chin, and lower face (the classic hormonal acne pattern), increased facial hair, and oily skin resistant to topical treatments. If your acne follows this pattern and is unresponsive to standard skincare, the correct investigation is hormonal (testosterone, DHEAS, LH:FSH ratio) rather than dermatological alone." },
          { type: "expert", quote: "Hormonal acne along the jawline in women over 25 that doesn't respond to topical treatment is almost always an endocrine problem, not a skincare problem. We should be checking hormones before we reach for antibiotics.", attribution: "Dr Anjali Mahto, Consultant Dermatologist and author of The Skin Bible" },
        ],
      },
      {
        id: "hair-loss",
        title: "Hair loss and hormones",
        keyFact: "Postpartum hair loss (telogen effluvium) is triggered by the sharp oestrogen drop after birth and typically peaks at 3–4 months postpartum — almost always temporary.",
        content: [
          { type: "para", text: "Female pattern hair loss (androgenetic alopecia) is the most common cause of hair thinning in women, affecting approximately 40% of women over 50. Unlike male pattern baldness, female pattern hair loss typically presents as diffuse thinning over the crown and widening of the central parting, with hairline preservation. The mechanism involves dihydrotestosterone (DHT) sensitivity at the hair follicle — the same mechanism as in men, but in women it is almost always exacerbated by low iron, low ferritin (below 70 µg/L), thyroid dysfunction, or oestrogen decline." },
          { type: "para", text: "Ferritin is the most underdiagnosed contributor to female hair loss. A \"normal\" ferritin (above 12 µg/L on standard laboratory ranges) is not the same as an optimal ferritin for hair. For hair health, levels above 70 µg/L appear to be necessary. Many women with hair loss have ferritin between 20–50 µg/L — technically normal, practically limiting. This is not discussed routinely in clinical consultations." },
          { type: "list", items: [
            "Get ferritin checked specifically (not just haemoglobin or serum iron) — optimal for hair is 70+ µg/L",
            "Check TSH — hypothyroidism is a common and treatable cause of diffuse hair thinning",
            "Postpartum shedding (telogen effluvium) peaks at 3–4 months and self-resolves by 12 months in the vast majority of cases",
            "OCP-related shedding: some women experience telogen effluvium when starting or stopping hormonal contraception",
            "Minoxidil 2%: the only topical treatment with strong evidence for female pattern hair loss — available OTC, takes 6–9 months to assess response",
          ] },
          { type: "expert", quote: "Most women I see for hair loss have low ferritin and have never been told. We treat the thyroid, correct the iron, and more often than not, the hair improves without any other intervention.", attribution: "Dr Thivi Maruthappu, Consultant Dermatologist" },
        ],
      },
      {
        id: "skin-by-phase",
        title: "Your skin across the cycle",
        keyFact: "Skin barrier function is strongest in the follicular phase and most compromised during menstruation — the optimal week for introducing actives is days 5–13.",
        content: [
          { type: "para", text: "Phase-aware skincare is not a trend — it is a logical response to measurable hormonal variation. The follicular phase (days 5–13) is the optimal window for introducing or increasing active ingredients: retinol, AHAs, vitamin C, and chemical exfoliants. Barrier function is strongest, sebum is lowest, recovery is fastest. The ovulatory window is similarly favourable." },
          { type: "para", text: "The late luteal phase (days 22–28) is a time for barrier-first skincare. Inflammation is higher, barrier is more permeable, and skin is more reactive. Introducing new actives during this phase consistently produces worse reactions than the same product used in follicular. This is not sensitivity — it is timing." },
          { type: "para", text: "Menstruation is the most vulnerable skin window: prostaglandin-mediated inflammation, low oestrogen barrier support, and highest sebaceous reactivity combine. Gentle, barrier-nourishing routines — hyaluronic acid, squalane, ceramides — and avoidance of harsh exfoliants during this phase reduces reactivity substantially." },
          { type: "list", items: [
            "Follicular (days 5–13): actives week — retinol, AHAs, niacinamide, vitamin C",
            "Ovulatory (days 13–15): skin at peak — light SPF and antioxidants maintain this",
            "Early luteal (days 16–21): maintain actives, add hydration as progesterone may slightly increase sebum",
            "Late luteal (days 22–28): barrier week — ceramides, hyaluronic acid, gentle cleanser only",
            "Menstrual (days 1–4): nourish only — no exfoliants, no high-strength actives",
          ] },
        ],
      },
    ],
  },
  body: {
    sections: [
      {
        id: "hormonal-symptoms",
        title: "Symptoms that deserve investigation",
        keyFact: "Endometriosis affects 1 in 10 women and is chronically underdiagnosed — the average time from symptom onset to diagnosis is 7–10 years in the UK.",
        content: [
          { type: "para", text: "Women's pain is systematically undertreated and underinvestigated. Conditions that are predominantly female — endometriosis, PCOS, interstitial cystitis, fibromyalgia, autoimmune thyroid disease — are diagnosed later, managed less aggressively, and dismissed more frequently than equivalent conditions in men. Knowing this is not cynicism — it is clinical context that helps you advocate effectively." },
          { type: "para", text: "Endometriosis is the paradigm case. It affects approximately 1.5 million women in the UK (1 in 10), causes significant pain and fertility implications, and yet the average time from first symptom to diagnosis remains 7–10 years. The barriers are multiple: normalisation of period pain by both patients and clinicians, absence of blood test diagnosis (laparoscopy is required for definitive diagnosis), and historical underfunding of research. If you have dysmenorrhoea that requires pain relief, pelvic pain outside menstruation, pain with intercourse, or cyclical bowel or bladder symptoms, endometriosis is a diagnosis worth pursuing — not accepting \"it's just bad periods.\"" },
          { type: "expert", quote: "The phrase \"bad periods are normal\" has caused more diagnostic delay than almost any other sentence in women's health. Pain that requires medication to function through is not normal. It is a symptom.", attribution: "Lone Hummelshoj, Chief Executive, World Endometriosis Research Foundation" },
        ],
      },
      {
        id: "fatigue-and-energy",
        title: "Fatigue: the most underinvestigated symptom",
        keyFact: "Iron deficiency without anaemia — normal haemoglobin but low ferritin — causes fatigue, hair loss, poor cognitive function, and exercise intolerance, and is missed on standard FBC.",
        content: [
          { type: "para", text: "Fatigue is the most common presenting symptom in primary care and the most frequently dismissed. In women of reproductive age, the most common treatable causes are iron deficiency (ferritin below 30 µg/L — note: this can cause significant fatigue with a normal haemoglobin), hypothyroidism (TSH above 2.5 in symptomatic patients warrants treatment consideration), and vitamin D deficiency (below 50 nmol/L by NHS thresholds, though some evidence suggests below 75 nmol/L impairs function). All three are measurable, all three are treatable, and all three are routinely missed on a standard blood test if ferritin is not specifically requested." },
          { type: "para", text: "If you present with fatigue and your GP runs a \"full blood count,\" note that FBC does not include ferritin. You need to specifically request serum ferritin. The difference between a ferritin of 15 µg/L and 75 µg/L is the difference between cycling and post-exertional malaise — but only one triggers action on a standard blood result." },
          { type: "list", items: [
            "Request: ferritin (not just FBC), TSH, vitamin D, B12, and folate as a baseline fatigue screen",
            "Ferritin below 30: supplemental iron is evidence-based; below 15: therapeutic iron replacement",
            "TSH 2.5–4.0 with symptoms: discuss with GP — some patients improve with treatment in this range",
            "Vitamin D below 50 nmol/L: supplementation per NHS guidelines (400 IU daily for maintenance)",
            "Fatigue with heavy periods: quantify blood loss — more than 80ml per cycle (soaking through a pad in under an hour, or passing clots larger than a 50p) is menorrhagia and warrants investigation and treatment",
          ] },
        ],
      },
    ],
  },
  mind: {
    sections: [
      {
        id: "the-cycling-brain",
        title: "The cycling brain",
        keyFact: "Hippocampal volume — the brain region central to memory and emotional regulation — fluctuates measurably across the menstrual cycle, peaking in the late follicular phase.",
        content: [
          { type: "para", text: "The female brain is not a male brain with hormonal variation overlaid — it is a fundamentally different neuroendocrine system. Oestradiol has over 100 known actions in the central nervous system. It upregulates dopamine receptor density (improving motivation, pleasure, and reward), increases serotonin transporter expression (improving mood), enhances hippocampal long-term potentiation (improving memory consolidation), and reduces amygdala reactivity (reducing fear and anxiety responses). These are not subtle effects." },
          { type: "para", text: "The practical consequence: cognitive performance, emotional regulation, and anxiety tolerance all vary across the cycle in clinically meaningful ways. Follicular phase — oestrogen rising — is associated with higher verbal fluency, better working memory, lower anxiety. Late luteal phase — allopregnanolone dropping — is associated with heightened emotional reactivity, lower frustration tolerance, intrusive thoughts, and in susceptible women, clinically significant PMDD. Neither state is pathological. Both are predictable." },
          { type: "expert", quote: "PMDD is not a personality disorder or an inability to cope. It is a neurological sensitivity to the withdrawal of allopregnanolone — a GABA-active progesterone metabolite. Understanding this changes both treatment and self-perception for the women who have it.", attribution: "Professor Torbjörn Bäckström, Umeå University — pioneer of PMDD neuroscience" },
        ],
      },
      {
        id: "anxiety-and-hormones",
        title: "Anxiety, mood, and the hormonal axis",
        keyFact: "Women are diagnosed with anxiety disorders at twice the rate of men — but research suggests much of this reflects undertreated hormonally-driven anxiety rather than higher inherent vulnerability.",
        content: [
          { type: "para", text: "The relationship between anxiety and the menstrual cycle is robust in the research and rarely discussed in clinical practice. Anxiety that worsens predictably in the 7–10 days before menstruation, improves within 2–3 days of bleeding, and is otherwise absent or mild is not generalised anxiety disorder — it is a premenstrual anxiety pattern, likely mediated by allopregnanolone sensitivity and GABA fluctuation. Treating it as GAD (often with SSRIs prescribed continuously) is effective but crude. Luteal-phase SSRIs, GABA-targeted approaches, or GnRH modulation are more mechanistically appropriate." },
          { type: "para", text: "Similarly, ADHD symptoms in women are known to worsen in the luteal phase, improve at ovulation, and sometimes become debilitating at perimenopause as oestrogen declines. If you have ADHD and notice this pattern, it is worth raising with your prescriber — oestrogen supplementation has emerging evidence for improving ADHD symptom control in perimenopausal women." },
          { type: "list", items: [
            "Track your anxiety against your cycle for 3 months — a consistent luteal-phase pattern points to hormonal, not generalised, aetiology",
            "PMDD: requires 2 cycles of prospective daily symptom tracking for diagnosis — the DRSP (Daily Record of Severity of Problems) is the validated tool",
            "First-line evidence-based: SSRIs (continuous or luteal-phase), lifestyle (aerobic exercise, sleep prioritisation, reduced alcohol)",
            "Second-line: GnRH analogues, combined OCP (suppressing ovulation), micronised progesterone",
            "Menopause and mental health: depression, anxiety, and brain fog are common perimenopausal symptoms — HRT can resolve them where antidepressants have failed",
          ] },
        ],
      },
    ],
  },
  nourishment: {
    sections: [
      {
        id: "hormones-and-food",
        title: "How your hormones respond to food",
        keyFact: "Magnesium deficiency — present in approximately 70% of Western women — amplifies PMS symptoms, disrupts sleep, and impairs the conversion of T4 to active T3 thyroid hormone.",
        content: [
          { type: "para", text: "The relationship between nutrition and hormonal health is real and specific — not in the influencer-marketed way, but biochemically. Several nutritional deficiencies reliably worsen hormonal symptoms: low magnesium amplifies PMS and period pain (prostaglandin synthesis is magnesium-dependent); low ferritin impairs thyroid function, energy, and fertility; low vitamin D reduces progesterone production and is associated with PCOS severity; low omega-3 increases systemic inflammation and prostaglandin-mediated pain; low B6 impairs dopamine synthesis, contributing to premenstrual mood disruption." },
          { type: "para", text: "None of this requires a specialist diet. It requires adequate food variety, attention to a few key nutrients, and the willingness to test rather than assume. Most women eating a varied diet with plenty of leafy greens, seeds, oily fish, and legumes will meet most of these needs — the exceptions are iron (difficult to meet through food alone when menstrual losses are high), vitamin D (insufficient synthesis in the UK for most of the year), and magnesium (depleted by stress, caffeine, and alcohol in ways that make dietary sources insufficient for many)." },
          { type: "expert", quote: "Supplementing magnesium glycinate at 300mg in the two weeks before menstruation is one of the most evidence-backed nutritional interventions for PMS and dysmenorrhoea — and one of the most underused.", attribution: "Dr Lara Briden, Naturopathic Physician" },
        ],
      },
      {
        id: "gut-hormone-axis",
        title: "The gut–hormone axis",
        keyFact: "The \"estrobolome\" — the gut bacteria responsible for metabolising oestrogen — determines whether used oestrogen is excreted or reabsorbed into circulation. Dysbiosis tips the balance.",
        content: [
          { type: "para", text: "The gut microbiome and hormonal health are connected in ways that have only become clear in the last decade. The estrobolome — the collection of gut bacteria that produce beta-glucuronidase enzymes — deconjugates oestrogen metabolites in the colon, allowing them to be reabsorbed into circulation rather than excreted. When the estrobolome is disrupted (antibiotic use, high processed food intake, low fibre), oestrogen recycling increases, pushing systemic oestrogen higher. This mechanism is thought to contribute to oestrogen-driven conditions including endometriosis, fibroids, and ER+ breast cancer risk." },
          { type: "para", text: "The practical implication is that gut health is women's hormonal health. Adequate dietary fibre (aim for 30g/day — most UK adults consume 18g) supports oestrogen excretion, feeds beneficial bacteria, and reduces constipation-related oestrogen reabsorption. Fermented foods (kefir, kimchi, live yoghurt) support microbial diversity. Reducing ultra-processed food intake reduces the gut inflammation that dysregulates the estrobolome." },
          { type: "list", items: [
            "Fibre target: 30g/day — seeds, legumes, oats, vegetables, fruit. Most UK women consume 18g.",
            "Fermented foods: kefir, live yoghurt, kimchi, miso — 1–2 servings daily for microbial diversity",
            "Cruciferous vegetables (broccoli, cauliflower, Brussels sprouts): contain DIM (diindolylmethane) which supports oestrogen metabolism toward less stimulatory pathways",
            "Flaxseed (1–2 tbsp ground daily): lignans act as weak phytoestrogens — evidence for breast cancer risk reduction and cycle regulation",
            "Reduce: alcohol (impairs liver oestrogen metabolism), processed foods (disrupt gut microbiome), excessive caffeine (increases cortisol, which suppresses progesterone)",
          ] },
        ],
      },
      {
        id: "key-nutrients",
        title: "The nutrients that matter most",
        keyFact: "Iron-rich foods are significantly better absorbed alongside vitamin C — a glass of orange juice with a red meat meal increases iron absorption by up to 300%.",
        content: [
          { type: "para", text: "Iron: The most common nutritional deficiency in premenopausal women. Symptoms of deficiency (below 30 µg/L ferritin): fatigue, cold intolerance, hair loss, restless legs, poor sleep, brain fog. Haem iron (from meat, especially red meat and liver) is 3–4x more bioavailable than non-haem iron (plant sources). Vitamin C dramatically increases non-haem iron absorption — take iron supplements or eat iron-rich plant foods with citrus or tomatoes. Avoid tea and coffee for 1 hour around iron-rich meals." },
          { type: "para", text: "Magnesium: Functions in over 300 enzymatic reactions. Most relevant to women's health: prostaglandin synthesis (period pain), GABA synthesis (anxiety, sleep), thyroid hormone conversion (T4 to T3), and insulin sensitivity. Best food sources: dark chocolate, pumpkin seeds, almonds, spinach, black beans. Supplement form: glycinate (well-tolerated, best absorbed) or citrate. Oxide (the cheapest form) is poorly absorbed." },
          { type: "para", text: "Omega-3 (EPA + DHA): Found in oily fish — salmon, mackerel, sardines, anchovies. Reduces systemic inflammation, specifically prostaglandin-mediated pain. 2g EPA+DHA daily has evidence for dysmenorrhoea comparable to 400mg ibuprofen in some trials. Algae-based supplements provide EPA/DHA without fish — equivalent efficacy." },
          { type: "stat", number: "70%", label: "of UK women are deficient in vitamin D by winter" },
        ],
      },
    ],
  },
  care: {
    sections: [
      {
        id: "navigating-healthcare",
        title: "Navigating the healthcare system",
        keyFact: "Women wait on average 65% longer than men for a diagnosis of the same condition — knowing what to ask and how to document symptoms materially reduces this gap.",
        content: [
          { type: "para", text: "The healthcare system was not designed around women's health. This is not a conspiracy — it is a consequence of 70 years of clinical research conducted predominantly on male subjects, extrapolated to women. The practical result: women's pain is undertreated, hormonally-driven symptoms are under-investigated, and conditions that primarily affect women are chronically underfunded. Understanding this gives you better tools for advocacy — not cynicism, but preparation." },
          { type: "para", text: "The most effective thing you can do to improve your healthcare outcomes is documentation. A symptom diary with dates, cycle phase, severity scores, and impact on daily function transforms a clinical consultation. \"I've been tired for months\" is medically non-actionable. \"My fatigue scores 7/10 on days 19–26 of my cycle, reducing to 3/10 after menstruation, and I've had this pattern for four cycles\" is an investigation trigger." },
          { type: "expert", quote: "I tell every patient: bring a written list. Not on your phone where you might forget to show me — written, dated, with your three most important points at the top. The quality of the consultation changes immediately.", attribution: "Dr Anna Kenyon, GP and women's health specialist" },
        ],
      },
      {
        id: "gp-scripts",
        title: "What to say at your GP appointment",
        keyFact: "The average UK GP appointment is 9.2 minutes — leading with your most important question, prepared in writing, doubles the chance of it being addressed.",
        content: [
          { type: "para", text: "GP time is constrained. The most effective appointments are those where you arrive with a clear primary concern, supporting evidence, and a specific request. Here are word-for-word scripts for the most common women's health conversations:" },
          { type: "list", items: [
            "\"I'd like my ferritin checked specifically — I know it's different from the standard FBC and I've read that ferritin below 30 can cause fatigue even when haemoglobin is normal.\"",
            "\"I've been tracking my symptoms for three cycles and they consistently worsen in the 10 days before my period. I'd like to discuss whether this could be PMDD and what the treatment options are.\"",
            "\"I have period pain that requires prescription-strength pain relief to function. I've read that this level of pain warrants investigation for endometriosis. Can we discuss that?\"",
            "\"My cycles have changed over the last 12 months — shorter/longer/heavier/more irregular. I'd like to check my FSH, LH, and oestradiol to understand if I'm entering perimenopause.\"",
            "\"I've been reading about HRT and I'd like to have an informed conversation about whether it's appropriate for me. Can you walk me through the current evidence?\"",
            "\"I have a strong family history of breast/ovarian cancer. Can you refer me for genetic counselling?\"",
          ] },
          { type: "para", text: "If you feel dismissed, you are entitled to a second opinion. NHS patients have the right to choose their GP and to request a referral to a specialist. Keeping a written record of consultations — what you were told, what was investigated, what was recommended — is both your right and your most effective advocacy tool." },
        ],
      },
      {
        id: "screening-schedule",
        title: "Your screening schedule",
        keyFact: "Cervical cancer mortality in the UK has fallen by 70% since the introduction of the NHS screening programme — but uptake has declined to 68%, the lowest in 20 years.",
        content: [
          { type: "para", text: "Screening is one of the highest-leverage preventive health interventions available — but only if attended. The NHS offers several programmes for women, and uptake for all of them is declining. Here is what you should be receiving, and when:" },
          { type: "list", items: [
            "Cervical screening (smear test): every 3 years ages 25–49, every 5 years ages 50–64. Do not defer — HPV-based screening means the test is now more accurate and less frequent than it used to be.",
            "Breast screening: every 3 years ages 50–70 via NHS. Private screening available from age 40 — discuss with your GP if family history warrants earlier start.",
            "Blood pressure: at least every 5 years from age 40, annually if raised. Hypertension in women is undertreated relative to men at equivalent risk.",
            "Cholesterol + lipid panel: from age 40, or earlier with family history of cardiovascular disease or hyperlipidaemia.",
            "Bone density (DEXA): at menopause, or earlier if risk factors (low BMI, smoking, steroid use, family history of osteoporosis, early menopause).",
            "Thyroid function (TSH): no national screening programme — but women are 7–10x more likely than men to develop thyroid disease. Request if symptomatic: fatigue, weight change, cold intolerance, hair loss, mood changes.",
          ] },
          { type: "expert", quote: "The most effective screening programme is one women actually attend. Anxiety about results is the most common reason for avoidance — but a normal result gives you information, and an abnormal result gives you time.", attribution: "Dr Sarah Jarvis, GP and clinical broadcaster" },
        ],
      },
    ],
  },
};

// ════════════════════════════════════════════════════════════════════════════
// SALUTATION OPENERS — phase-specific text per tab
// ════════════════════════════════════════════════════════════════════════════
const OPENERS = {
  overview: {
    follicular: "You are in your follicular phase — and across every system in your body, the same hormonal current is at work. Oestradiol is rising, mood is brightening, skin is calmer, inflammation is dropping. This letter walks you through what's happening — and what to track while it is.",
    ovulatory:  "Your body is mid-cycle — and the brief surge of luteinising hormone that triggers ovulation also affects mood, libido, skin, and cognition. This letter offers an integrated view of the hormonal week you are in.",
    luteal:     "You are in the luteal phase. Your body is doing two things at once: maintaining the uterine lining while preparing to shed it. Progesterone is dominant, then declines. Every system from skin to mood reflects this. This letter is the integrated picture.",
    menstrual:  "You are bleeding — and so this letter opens with that fact. The cycle has reset. Oestrogen and progesterone are at their lowest. Prostaglandins are at their highest. Everything else in your body is responding to that hormonal trough. Here is what to know about each part.",
  },
  cycle: {
    follicular: "You are in the follicular phase — and if you've noticed a sharpness of mind, a readiness to begin things, an unusual tolerance for cold, these are not coincidences. Oestradiol is rising, and with it, your cognitive flexibility, pain threshold, and capacity for social risk. This is arguably the most underappreciated fortnight in the female cycle.",
    ovulatory:  "Something shifts, briefly, at mid-cycle — and most women feel it before they can name it. Your cervical mucus changes, your voice rises slightly in pitch, your face becomes fractionally more symmetrical. Luteinising hormone has surged, and your body, for approximately 24 hours, is doing something it has been preparing for all month.",
    luteal:     "You are in the luteal phase, and if the world feels heavier than it did two weeks ago, there is a precise biochemical reason. Progesterone, which rose sharply at ovulation, is now declining — and with it goes the GABAergic calming effect it provided. Your amygdala is more reactive. Your need for sleep has increased. This is not a deficiency of character.",
    menstrual:  "The bleed is not a failure. It is, from an endocrinological perspective, a remarkably efficient monthly renewal — uterine lining shed, inflammatory mediators released, and the slate of the cycle cleared for what comes next. The prostaglandins responsible for cramping are the same molecules that make this renewal possible.",
  },
  skin: {
    follicular: "Your skin is at its most cooperative right now. Rising oestrogen is increasing collagen synthesis and water-binding capacity — if ever there were a moment to introduce an active (retinol, AHA, a new vitamin C), follicular phase is it. Your barrier function is stronger, your sebum lower, your recovery time faster.",
    ovulatory:  "You are at or near your skin's monthly peak. Oestrogen is highest, sebum is lowest, collagen synthesis is elevated. Photograph your skin this week as a reference point for the rest of the cycle.",
    luteal:     "The skin changes you notice in the second half of your cycle are not imaginary. Progesterone increases sebaceous gland activity. The inflammatory state of late luteal phase primes the skin to react. If you track your breakouts against your cycle, most women find a 5–7 day pre-menstrual cluster. Knowing this changes everything about how you intervene.",
    menstrual:  "Skin during menstruation is in a genuinely vulnerable state — prostaglandins increase systemic inflammation, oestrogen is at its lowest, and barrier function is reduced. This is the week for nourishing, barrier-supporting actives rather than exfoliants.",
  },
  mind: {
    follicular: "The neuroscience of the follicular phase is extraordinary and almost entirely uncommunicated to the women living through it. Oestrogen up-regulates dopamine and serotonin receptor density, enhances hippocampal neuroplasticity, and reduces default-mode-network rumination. The clarity you may feel right now is biochemically real.",
    ovulatory:  "Peak oestrogen has a measurable antidepressant effect. The hippocampus is most plastic. Verbal fluency, creative associative thinking, and risk tolerance are all elevated. If you have a difficult conversation, a creative project, or a decision to make, this week has biological advantages.",
    luteal:     "The late luteal phase produces a neurochemical environment that modern life is particularly poorly designed for. Progesterone metabolites that calmed you in mid-luteal begin to dissipate. Allopregnanolone — the endogenous GABA-A agonist — drops. The effect is chemically similar to benzodiazepine withdrawal at a micro-dose level. The irritability, the anxiety, the sense that everything is harder — these are not disproportionate responses. They are accurate sensations of a changing neurochemical state.",
    menstrual:  "The first days of menstruation involve the sharpest hormonal drop of the cycle — oestrogen and progesterone fall together, and the body's serotonergic tone follows. For most women this resolves by day 3–4 as oestrogen begins its follicular rise. The \"menstrual low\" is real and temporary.",
  },
  body: {
    follicular: "The follicular phase is when your body is at its most resilient — pain thresholds are higher, inflammatory markers lower, athletic recovery faster. If you have been waiting for a productive moment to investigate a chronic symptom, now is a useful baseline.",
    ovulatory:  "Ovulation comes with its own physiological footprint — a brief inflammatory surge, occasional ovulation pain, and for women with endometriosis or PCOS, sometimes a marker of where things are working and where they aren't.",
    luteal:     "The luteal phase is when most chronic conditions amplify. Endometriosis pain, IBS flares, autoimmune symptoms, migraine — all tend to worsen as oestrogen falls and progesterone metabolites change. Tracking which symptoms cluster here is one of the most powerful diagnostic moves you can make.",
    menstrual:  "Menstruation is a useful moment to listen to your body. The pain you have during your period, the heaviness of the bleed, the way you feel after the first 48 hours — these are diagnostic. Document them.",
  },
  nourishment: {
    follicular: "The follicular phase is your most efficient metabolic window. Insulin sensitivity is highest, your body is most responsive to training, and your appetite is typically lowest. This is not a coincidence — it tracks oestrogen.",
    ovulatory:  "Around ovulation your metabolic rate increases slightly and your body's preference for carbohydrate fuel shifts. Hydration matters more this week.",
    luteal:     "In the luteal phase, your basal metabolic rate rises 100–300 calories per day, your insulin sensitivity falls, and your cravings — particularly for carbohydrate and chocolate — are biochemically real. Magnesium and B6 in this phase are particularly worth attending to.",
    menstrual:  "Menstruation places real iron demand on your body — particularly if your flow is heavy. Iron-rich foods alongside vitamin C, in the week of and the week following your bleed, materially affect your energy and cognition in the following follicular phase.",
  },
  care: {
    follicular: "The follicular phase is the best week for clinical conversations. Cognition is clearest, energy is highest, recall of premenstrual symptoms is sharpest. Schedule difficult appointments here when you can.",
    ovulatory:  "Ovulation week is a strong window for advocacy. Many women report being more assertive, more articulate, and more capable of holding their position in a clinical conversation.",
    luteal:     "Late luteal is the week to bring written notes to a GP appointment. Cognitive bandwidth is reduced, recall is less reliable, and emotional reactivity is higher. Documentation is your friend.",
    menstrual:  "Menstruation is the week most women describe their symptoms most accurately — because the body is signalling them clearly. If you are going to write a symptom diary, the first three days of your bleed are the most diagnostically rich moments.",
  },
  lifestage: {
    follicular: "Whatever life stage you are in — reproductive, perimenopausal, postpartum — the follicular phase of your hormonal life (or your current cycle) is when the biology is most generous. Make the most of that.",
    ovulatory:  "Mid-cycle is a useful reflection point. If you are tracking your stage transitions — perimenopause in particular — this is the week your body is most articulate.",
    luteal:     "The luteal phase, and especially late luteal, mirrors many of the experiences of perimenopause and the postpartum hormonal trough. Understanding one teaches you about the others.",
    menstrual:  "Menstruation marks the end of one cycle and the beginning of another — which is exactly the right frame for thinking about life-stage transitions too. Each one closes a chapter and opens another.",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// POSTSCRIPTS per tab
// ════════════════════════════════════════════════════════════════════════════
const POSTSCRIPTS = {
  cycle:        "Your cycle is one of the most sensitive biomarkers of your overall health. Changes in length, flow, pain, or premenstrual symptoms are your body communicating — not minor inconveniences to be managed. Track what you notice. It is always worth bringing to your GP.",
  skin:         "The skin tells the hormonal story before blood tests do. If you're seeing consistent patterns — breakouts in the same cycle phase, dryness correlated with specific symptoms — those patterns are clinically significant. Document them. Bring photographs to your dermatologist.",
  mind:         "The neurological changes across your cycle are real, measurable, and systematically underresearched. If you have been diagnosed with ADHD, anxiety, or depression, your symptoms likely vary by cycle phase in ways your prescribing doctor may never have discussed with you. That conversation is worth initiating.",
  body:         "Chronic symptoms are not character flaws. Fatigue, pain, and inflammation that cycle with your hormones deserve investigation, not normalisation. \"Many women experience this\" is a description of a medical system gap, not a reason to stop pursuing answers.",
  nourishment:  "Food is not moral. The best nutritional approach for your hormonal health is the one you can sustain with pleasure and without anxiety. Consistent, varied, whole-food eating with attention to iron and magnesium will serve you better than any elimination protocol.",
  care:         "You are the most important advocate for your own health. Keeping a symptom diary, bringing specific dates and patterns to appointments, and following up in writing after consultations are the three practices that most reliably improve healthcare outcomes for women.",
  lifestage:    "Every transition — into perimenopause, through postpartum, navigating a new diagnosis — feels less isolating when you understand the biology. These stages are not conditions to be fixed. They are phases to be navigated with knowledge.",
  overview:     "The single most powerful thing you can do for your long-term health is track patterns over time. The data you build here is yours. It will become more valuable with every month that passes.",
};

// ════════════════════════════════════════════════════════════════════════════
// SIGN-OFFS per tab
// ════════════════════════════════════════════════════════════════════════════
const SIGNATURES = {
  overview:    { name: "Jess",                          role: "Your FemWell companion" },
  cycle:       { name: "The FemWell Editorial Team",   role: "In partnership with reproductive endocrinology" },
  skin:        { name: "The FemWell Editorial Team",   role: "Dermatology & hormonal skin" },
  body:        { name: "The FemWell Editorial Team",   role: "Integrative women's health" },
  mind:        { name: "The FemWell Editorial Team",   role: "Neuropsychology & the cycle" },
  nourishment: { name: "The FemWell Editorial Team",   role: "Nutritional endocrinology" },
  care:        { name: "The FemWell Editorial Team",   role: "Healthcare navigation" },
  lifestage:   { name: "The FemWell Editorial Team",   role: "Life stage transitions" },
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function Health() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expanded, setExpanded] = useState({});
  const [profile, setProfile] = useState(null);
  const [scrollPct, setScrollPct] = useState(0);
  const letterRef = useRef(null);

  // ─── Fetch profile + cycle data ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
        if (!cancelled) setProfile(profiles?.[0] || u || null);
      } catch (err) {
        if (!cancelled) setProfile(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "follicular";
  const stage = profile?.life_stage || "reproductive";

  // ─── Inject Google Fonts once ───
  useEffect(() => {
    const id = "hc-google-fonts";
    if (document.getElementById(id)) return;
    const l1 = document.createElement("link");
    l1.id = id;
    l1.rel = "stylesheet";
    l1.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500&display=block";
    document.head.appendChild(l1);
  }, []);

  // ─── Scroll progress for rosebud ───
  useEffect(() => {
    const onScroll = () => {
      const el = letterRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = el.offsetHeight + vh;
      const seen = vh - rect.top;
      const pct = Math.max(0, Math.min(100, (seen / total) * 100));
      setScrollPct(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Phase-smart default: auto-expand first 2 sections when tab changes ───
  useEffect(() => {
    const sections = HEALTH_CONTENT[activeTab]?.sections || [];
    const next = {};
    sections.slice(0, 2).forEach((s) => { next[s.id] = true; });
    setExpanded(next);
  }, [activeTab]);

  const tab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const tabContent = HEALTH_CONTENT[activeTab] || HEALTH_CONTENT.overview;
  const sections = tabContent.sections || [];

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const allExpanded = sections.length > 0 && sections.every((s) => expanded[s.id]);
  const toggleAll = () => {
    if (allExpanded) setExpanded({});
    else {
      const all = {};
      sections.forEach((s) => { all[s.id] = true; });
      setExpanded(all);
    }
  };

  const name = profile?.preferred_name || profile?.display_name || profile?.full_name?.split?.(" ")?.[0] || "friend";
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const stageLbl = LIFE_STAGE_LABEL[stage] || "Reproductive";
  const phaseLbl = PHASE_LABEL[phase] || "Follicular";

  const opener = OPENERS[activeTab]?.[phase] || OPENERS.overview.follicular;

  return (
    <div style={{ background: "#F0E6CE", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ─── Tab bar ─── */}
      <div style={{
        background: "#F0E6CE", borderBottom: "1px solid rgba(58,44,26,0.10)",
        padding: "8px 12px", position: "sticky", top: 0, zIndex: 11,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        <div style={{ display: "flex", gap: 6, minWidth: "max-content" }}>
          {TABS.map((t) => {
            const on = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                background: "transparent", border: "none",
                padding: "8px 12px",
                fontFamily: 'DM Sans, system-ui, sans-serif',
                fontSize: 12, letterSpacing: 0.5,
                color: on ? "#3A2C1A" : "#9B8B7A",
                fontWeight: on ? 600 : 500,
                borderBottom: on ? "2px solid #D4AF37" : "2px solid transparent",
                cursor: "pointer", whiteSpace: "nowrap",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <span aria-hidden="true">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Sticky phase bar ─── */}
      <div style={{
        background: "#3A2C1A", color: "#F4EDDB",
        padding: "8px 20px",
        fontSize: 12, fontFamily: "DM Sans, system-ui, sans-serif", letterSpacing: 0.8,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 47, zIndex: 10,
      }}>
        <span>{phaseLbl} · {stageLbl}</span>
        {cycle?.cycleDay && <span>Day {cycle.cycleDay}</span>}
      </div>

      {/* ─── Letter paper card ─── */}
      <div style={{ padding: "32px 16px 64px" }}>
        <article ref={letterRef} className="hc-letter-paper" style={{
          background: "#FEFAF2",
          maxWidth: 680, margin: "0 auto",
          padding: "52px 56px 64px",
          borderRadius: 2,
          transform: "rotate(-0.3deg)",
          position: "relative",
          boxShadow: [
            "0 1px 1px rgba(58,44,26,0.06)",
            "3px 3px 0 -1px #F0E8D4",
            "6px 6px 0 -2px #EAE0C8",
            "0 12px 48px rgba(58,44,26,0.18)",
            "inset 0 1px 0 rgba(255,255,255,0.8)",
          ].join(", "),
        }}>
          {/* Inner warm gradient overlay (visual texture only) */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 50% 0%, transparent 60%, rgba(212,175,55,0.04) 100%)",
            borderRadius: 2,
          }} />

          {/* ── Letterhead ── */}
          <div style={{ borderBottom: "1px solid rgba(58,44,26,0.12)", paddingBottom: 24, marginBottom: 32, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <TabBotanical tabId={tab.id} />
            </div>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 10, letterSpacing: 3, color: "#9B8B7A", textTransform: "uppercase" }}>
                FemWell Health Letter
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 24, fontWeight: 600, color: "#3A2C1A", marginTop: 4 }}>
                {tab.label}
              </div>
              <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 11, color: "#9B8B7A", marginTop: 4 }}>
                {formattedDate} · {stageLbl}
              </div>
            </div>
          </div>

          {/* ── Salutation ── */}
          <div style={{ marginBottom: 28, position: "relative" }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 18, color: "#3A2C1A", marginBottom: 16, fontStyle: "italic" }}>
              Dear {name},
            </div>
            <p style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 17, lineHeight: 1.85, color: "#3A2C1A", margin: "0 0 16px",
            }}>
              <span style={{
                float: "left", fontSize: 64, lineHeight: "0.75",
                marginRight: 8, marginTop: 4,
                fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600, color: "#3A2C1A",
              }}>{opener.charAt(0)}</span>
              {opener.slice(1)}
            </p>
          </div>

          {/* ── Table of Contents ── */}
          <div style={{
            background: "rgba(143,175,143,0.08)", border: "1px solid rgba(143,175,143,0.2)",
            padding: "16px 20px", marginBottom: 28, borderRadius: 4,
            position: "relative",
          }}>
            <div style={{
              fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 10, letterSpacing: 1.5,
              textTransform: "uppercase", color: "#9B8B7A", marginBottom: 10,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>In this letter</span>
              <button onClick={toggleAll} style={{
                background: "none", border: "none", padding: 0, cursor: "pointer",
                fontSize: 10, color: "#D4AF37", letterSpacing: 0.5,
                fontFamily: 'DM Sans, system-ui, sans-serif',
              }}>
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>
            {sections.map((s, i) => (
              <a key={s.id} href={`#letter-section-${s.id}`} onClick={(e) => {
                e.preventDefault();
                if (!expanded[s.id]) toggle(s.id);
                const el = document.getElementById(`letter-section-${s.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }} style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, color: "#3A2C1A",
                padding: "4px 0", display: "flex", alignItems: "center", gap: 8,
                opacity: expanded[s.id] ? 1 : 0.7, textDecoration: "none",
              }}>
                <span style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 10, color: "#9B8B7A", minWidth: 18 }}>{i + 1}.</span>
                <span style={{ flex: 1 }}>{s.title}</span>
                {expanded[s.id] && <span style={{ color: "#D4AF37", fontSize: 10 }} aria-hidden="true">✓</span>}
              </a>
            ))}
          </div>

          {/* ── Sections ── */}
          {sections.map((s, idx) => (
            <div key={s.id} style={{ position: "relative" }}>
              {idx > 0 && <BotanicalDivider />}
              <LetterSection section={s} isExpanded={!!expanded[s.id]} onToggle={() => toggle(s.id)} />
            </div>
          ))}

          {/* ── Sign-off ── */}
          <BotanicalDivider />
          <div style={{ marginTop: 28, position: "relative" }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 16, color: "#3A2C1A", marginBottom: 4 }}>
              With care,
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 18, fontWeight: 600, color: "#3A2C1A", fontStyle: "italic" }}>
              {(SIGNATURES[activeTab] || SIGNATURES.overview).name}
            </div>
            <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 11, color: "#9B8B7A", letterSpacing: 0.5, marginTop: 2 }}>
              {(SIGNATURES[activeTab] || SIGNATURES.overview).role}
            </div>
          </div>

          {/* ── P.S. ── */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(58,44,26,0.10)", position: "relative" }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15, fontStyle: "italic",
              color: "#6B5744", lineHeight: 1.8, margin: 0,
            }}>
              <strong style={{ fontStyle: "normal", fontWeight: 600 }}>P.S.</strong> — {POSTSCRIPTS[activeTab] || POSTSCRIPTS.overview}
            </p>
          </div>

          {/* ── In-paper disclaimer ── */}
          <div style={{ marginTop: 16, fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 10, color: "#9B8B7A", letterSpacing: 0.4, fontStyle: "italic", position: "relative" }}>
            This letter is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for personal health decisions.
          </div>
        </article>
      </div>

      {/* ── Rosebud scroll progress ── */}
      <RosebudProgress scrollPct={scrollPct} />

      {/* ── Bottom not-medical-advice strip ── */}
      <div style={{
        background: "#3A2C1A", color: "rgba(244,237,219,0.6)",
        padding: "12px 20px", textAlign: "center",
        fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 10, letterSpacing: 0.5,
      }}>
        This content is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for personalised health decisions.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LETTER SECTION
// ════════════════════════════════════════════════════════════════════════════
function LetterSection({ section, isExpanded, onToggle }) {
  return (
    <div id={`letter-section-${section.id}`} style={{ marginBottom: 4, scrollMarginTop: 110, position: "relative" }}>
      <button onClick={onToggle} style={{
        width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
        padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600, fontSize: 19, color: "#3A2C1A" }}>
          {section.title}
        </span>
        <span style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 12, color: "#9B8B7A", letterSpacing: 0.5 }}>
          {isExpanded ? "— close" : "+ read"}
        </span>
      </button>

      {/* Key fact — always visible */}
      {section.keyFact && (
        <div className="hc-letter-keyfact" style={{
          padding: "10px 16px", background: "rgba(212,175,55,0.08)",
          borderLeft: "3px solid #D4AF37", marginBottom: isExpanded ? 12 : 0,
          borderRadius: "0 4px 4px 0",
        }}>
          <span style={{
            fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 10, color: "#9B8B7A",
            letterSpacing: 1.2, textTransform: "uppercase", marginRight: 8,
          }}>Key insight</span>
          <span style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, color: "#3A2C1A", fontStyle: "italic",
          }}>{section.keyFact}</span>
        </div>
      )}

      {isExpanded && (
        <div style={{ marginTop: 16, marginBottom: 8 }}>
          {section.content.map((block, i) => {
            if (block.type === "para") {
              return (
                <p key={i} style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 16, lineHeight: 1.85,
                  color: "#3A2C1A", margin: "0 0 14px",
                }}>{block.text}</p>
              );
            }
            if (block.type === "expert") {
              return (
                <div key={i} style={{
                  borderLeft: "2px solid #8FAF8F", padding: "12px 16px",
                  margin: "20px 0", background: "rgba(143,175,143,0.06)",
                  borderRadius: "0 4px 4px 0",
                }}>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15, fontStyle: "italic",
                    color: "#6B5744", margin: "0 0 8px", lineHeight: 1.8,
                  }}>"{block.quote}"</p>
                  <div style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 11, color: "#9B8B7A", letterSpacing: 0.5,
                  }}>— {block.attribution}</div>
                </div>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15, lineHeight: 1.8,
                  color: "#3A2C1A", paddingLeft: 24, margin: "0 0 14px",
                }}>
                  {block.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
                </ul>
              );
            }
            if (block.type === "stat") {
              return (
                <div key={i} style={{
                  textAlign: "center", padding: "16px", margin: "20px 0",
                  border: "1px solid rgba(212,175,55,0.25)", borderRadius: 4,
                }}>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 40, fontWeight: 600, color: "#D4AF37",
                  }}>{block.number}</div>
                  <div style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 11, color: "#9B8B7A",
                    letterSpacing: 1, textTransform: "uppercase", marginTop: 4,
                  }}>{block.label}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
