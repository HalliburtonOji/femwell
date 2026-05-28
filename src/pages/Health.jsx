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
// Voice: a brilliant friend who happens to be a doctor.
// ════════════════════════════════════════════════════════════════════════════
const HEALTH_CONTENT = {
  overview: {
    sections: [
      {
        id: "your-health-this-phase",
        title: "What's actually going on in your body right now",
        keyFact: "Your body doesn't run on a 24-hour clock — it runs on a 28-day one.",
        content: [
          { type: "para", text: "Most health advice assumes you wake up the same person every day. You don't. Over about 28 days, every system inside you shifts — mood, skin, immunity, even how you handle pain. None of this is a malfunction. It's just how a female body works." },
          { type: "para", text: "The first half of your cycle, after your period, is the bright sharp half. The second half is the inward sensitive half. The bleed is a reset. Everything else — energy, skin, what foods you want, how you feel about your boss — follows from that arc." },
          { type: "expert", quote: "We've spent decades studying the male 24-hour rhythm. We're only now properly studying the female 28-day one. It changes how you should think about almost everything — sleep, exercise, even when to take certain medications.", attribution: "Professor Sarah Hillman, reproductive endocrinology" },
        ],
      },
      {
        id: "what-to-track",
        title: "What's actually worth tracking",
        keyFact: "Three things explain most of what you'll want to know: how you slept, how you felt, how much energy you had.",
        content: [
          { type: "para", text: "Tracking everything is exhausting and useless. The useful version is small. Three months of three data points each day will tell you more about your hormones than any single blood test." },
          { type: "list", items: [
            "Sleep — not the hours, but whether you wake up rested",
            "Mood — outward (impatient, snappy) or inward (anxious, self-critical)",
            "Energy — body-tired or brain-tired (they're different)",
            "One thing that matters to you (pain, skin, cravings) — just one",
          ] },
          { type: "para", text: "After a few cycles, patterns show up. You'll know which week you're foggy, which days not to schedule hard things, which week your skin behaves. That's the kind of data that actually changes how you live." },
        ],
      },
      {
        id: "understanding-hormones",
        title: "The four hormones doing the heavy lifting",
        keyFact: "These four hormones don't just run your cycle — they run your mood, sleep, bones and skin too.",
        content: [
          { type: "para", text: "Oestrogen is the bright one. It lifts mood, sharpens memory, keeps skin and bones strong. Progesterone is the calm one — it helps you sleep and steadies the nervous system. LH is the trigger that fires off ovulation. FSH is the one that rises sharply when you're moving toward menopause." },
          { type: "stat", number: "28", label: "average cycle days — but 21 to 35 is normal" },
          { type: "para", text: "They don't work alone. Stress can suppress them. Thyroid problems can throw them off. Even your gut bacteria affect how much oestrogen sticks around. That's why hormonal health is never one number on a blood test — it's a system." },
        ],
      },
    ],
  },
  cycle: {
    sections: [
      {
        id: "your-cycle-right-now",
        title: "Your cycle is more than a calendar",
        keyFact: "Your cycle is a vital sign. If it changes, that's information — not an inconvenience.",
        content: [
          { type: "para", text: "Doctors used to talk about temperature, pulse, breathing and blood pressure as the vital signs. The menstrual cycle should be the fifth. If yours changes meaningfully — length, flow, pain, premenstrual mood — that's your body sending real information." },
          { type: "expert", quote: "The menstrual cycle tells us things about thyroid, immune function, stress and metabolism that no single blood test ever could. We should be treating it like the vital sign it is.", attribution: "Dr Jen Gunter, OB/GYN" },
          { type: "para", text: "Cycles shorter than 21 days, longer than 35, spotting between periods, or premenstrual symptoms that derail your life — these all have names, mechanisms, and treatments. Worth bringing up." },
        ],
      },
      {
        id: "phase-by-phase",
        title: "What each phase actually feels like",
        keyFact: "PMS isn't in your head. A calming chemical that's been steady for two weeks drops fast — and your nervous system feels it.",
        content: [
          { type: "para", text: "Days 1–5 (your period): oestrogen and progesterone are both at the floor. Cramping is caused by chemicals called prostaglandins — the same ones that help the lining shed. That's why ibuprofen works: it blocks them. Take it early, not when the pain peaks." },
          { type: "para", text: "Days 6–14 (the bright half): oestrogen climbs, mood lifts, skin clears, brain sharpens. Around day 14 you ovulate — a brief surge that pushes libido up and pain tolerance with it." },
          { type: "para", text: "Days 15–28 (the inward half): progesterone takes over — calming for about a week, then it drops. In that drop, anxiety and irritability often spike. If yours is severe every single cycle and improves the moment you bleed, that's PMDD — a real, treatable condition, not bad PMS." },
        ],
      },
      {
        id: "cycle-tracking-science",
        title: "How to track without it taking over",
        keyFact: "Three months of tracking is worth more to a doctor than ten visits without it.",
        content: [
          { type: "para", text: "Forget elaborate apps. Note the day your period starts. Add one symptom that matters to you — pain, mood, sleep, skin. That's it. The pattern is what matters, not the precision." },
          { type: "para", text: "If you want one more data point, basal body temperature taken first thing in the morning will tell you whether you ovulated — it rises by half a degree after, and stays up till you bleed. Useful for fertility, useful for spotting thyroid issues (consistently cold mornings suggest underactive)." },
          { type: "para", text: "Bring a printed three-month chart to your GP if something feels off. It transforms a 10-minute appointment from 'I feel terrible sometimes' to a clinical pattern they can act on." },
        ],
      },
    ],
  },
  lifestage: {
    sections: [
      {
        id: "your-stage-now",
        title: "Where you are in the bigger arc",
        keyFact: "Perimenopause can start ten years before your last period — and the first sign is rarely hot flushes.",
        content: [
          { type: "para", text: "Women's health isn't just reproductive health. Each big hormonal chapter — first period, contraception, pre-conception, pregnancy, postpartum, perimenopause, menopause and after — comes with its own biology and its own clinical questions worth asking." },
          { type: "expert", quote: "Every hormonal transition affects bone, brain, mood and heart in ways that deserve proactive care. We've treated them as inconveniences for too long.", attribution: "Professor Lesley Regan, former president, Royal College of Obstetricians and Gynaecologists" },
          { type: "para", text: "Knowing your stage helps you walk into a GP with the right questions. Different stages need different checks — your ferritin in your 20s, your folic acid pre-conception, your FSH in your 40s. Most of it is simple, if you know to ask." },
        ],
      },
      {
        id: "stage-specific-health",
        title: "What matters most at your stage",
        keyFact: "Bone density drops fastest in the first five years after menopause. HRT works best when you start it early.",
        content: [
          { type: "para", text: "In your reproductive years, the priorities are knowing your own cycle, finding contraception that genuinely fits you, and getting your ferritin checked once a year. Low iron causes more fatigue and hair loss in women under 40 than almost anything else, and it's missed routinely." },
          { type: "para", text: "Pre-pregnancy: start folic acid (400µg) three months before trying. Postpartum: get a proper check at 3 and 6 months — not just the 6-week tick-box — because thyroid issues and PND can show up later. Perimenopause: don't wait for hot flushes. Sleep changes, joint aches, brain fog and mood shifts all come first." },
          { type: "list", items: [
            "Annual ferritin in your reproductive years (ask by name — it's not on a standard blood count)",
            "Folic acid 400µg three months before any planned pregnancy",
            "Bone density scan around menopause if you have risk factors",
            "Don't defer cervical screening — uptake is at its lowest in 20 years",
          ] },
        ],
      },
    ],
  },
  skin: {
    sections: [
      {
        id: "hormonal-skin",
        title: "Your skin is a hormone receipt",
        keyFact: "Jawline breakouts after 25 are almost never a skincare problem — they're a hormone signal.",
        content: [
          { type: "para", text: "Your skin is an endocrine organ — meaning it responds directly to your hormones. Oestrogen makes collagen, holds water, calms inflammation. When it's high (around ovulation) your skin is at its best. When it drops (before your period) sebum rises and breakouts cluster." },
          { type: "para", text: "If your acne sits along your jaw, chin and lower face and doesn't budge with skincare, that's a hormone pattern, not a routine pattern. The right investigation is hormonal — testosterone, DHEAS — not just stronger creams." },
        ],
      },
      {
        id: "hair-loss",
        title: "Why your hair is shedding",
        keyFact: "If you've been told your iron is normal and your hair is still thinning — ask for ferritin specifically. It's a different number.",
        content: [
          { type: "para", text: "Hair shedding has a handful of common causes, and most of them are treatable. The biggest one: iron stores too low for hair growth. Lab 'normal' starts at 12, but for hair you really want 70 or above. Many women sit in that gap — technically normal, practically losing hair." },
          { type: "expert", quote: "Most of the women I see for hair loss have low ferritin and no one has told them. We treat the iron, sometimes the thyroid, and very often the hair improves without anything else.", attribution: "Dr Thivi Maruthappu, consultant dermatologist" },
          { type: "list", items: [
            "Get ferritin checked specifically (not just haemoglobin)",
            "Check thyroid (TSH) — under-active thyroid thins hair diffusely",
            "Postpartum shedding peaks at 3–4 months and almost always grows back by 12",
            "Minoxidil 2% is the only topical with strong evidence — gives it 6–9 months",
          ] },
        ],
      },
      {
        id: "skin-by-phase",
        title: "Your skin across the month",
        keyFact: "Save strong actives for the first half of your cycle. In the second half, just be gentle.",
        content: [
          { type: "para", text: "First half (days 5–14): your skin is at its most resilient. Retinol, vitamin C, gentle exfoliants — this is the window. Your barrier is strong and you recover quickly." },
          { type: "para", text: "Second half (days 15–28): your barrier gets thinner and your skin is more reactive. Switch to ceramides, hyaluronic acid, a gentle cleanser. Don't start anything new. Your skin will thank you." },
          { type: "list", items: [
            "Days 5–14: actives week — retinol, AHAs, vitamin C",
            "Days 13–15 (ovulation): skin at peak — keep it simple",
            "Days 22–28: barrier week — ceramides and hyaluronic acid",
            "Days 1–4 (period): just nourish — no exfoliants",
          ] },
        ],
      },
    ],
  },
  body: {
    sections: [
      {
        id: "hormonal-symptoms",
        title: "Pain that deserves a name",
        keyFact: "Endometriosis takes 7–10 years to diagnose in the UK. The biggest reason is the word 'normal' — used by both patients and doctors.",
        content: [
          { type: "para", text: "Women's pain has been historically dismissed in medicine, and conditions that mostly affect women are diagnosed later, treated less aggressively, and researched less than equivalent conditions in men. Knowing this isn't cynicism — it just helps you walk into appointments differently." },
          { type: "expert", quote: "The phrase 'bad periods are normal' has caused more diagnostic delay than almost any other sentence in women's health. Pain you need medication to function through is a symptom, not normal.", attribution: "Lone Hummelshoj, World Endometriosis Research Foundation" },
          { type: "para", text: "If you have period pain that needs prescription painkillers, pain outside your period, pain during sex, or cyclical bowel or bladder symptoms — endometriosis is worth investigating. Don't accept 'just bad periods' as a diagnosis." },
        ],
      },
      {
        id: "fatigue-and-energy",
        title: "Why you're so tired",
        keyFact: "A standard 'full blood count' doesn't include ferritin. You have to ask for it by name.",
        content: [
          { type: "para", text: "Fatigue is the symptom GPs hear most often and investigate least well. In women of reproductive age, the three most common treatable causes are low iron stores (ferritin), under-active thyroid (TSH), and low vitamin D. All three are measurable. All three are missed if you only run a standard blood count." },
          { type: "list", items: [
            "Ask for ferritin (not just FBC), TSH, vitamin D, B12 and folate as a baseline",
            "Ferritin below 30 µg/L: iron supplementation has good evidence",
            "TSH between 2.5 and 4 with symptoms: worth a real conversation",
            "Heavy periods + tiredness: get both investigated — the link is iron loss",
          ] },
        ],
      },
    ],
  },
  mind: {
    sections: [
      {
        id: "the-cycling-brain",
        title: "Your brain isn't the same every day",
        keyFact: "Your mood, memory, and focus all change with your cycle — and the science is finally catching up to what women have always known.",
        content: [
          { type: "para", text: "Your brain has receptors for oestrogen and progesterone in the regions that handle memory, mood and emotional regulation. When those hormones rise and fall across the month, your cognition genuinely shifts. It's not subtle and it's not in your head." },
          { type: "expert", quote: "PMDD isn't a personality disorder or an inability to cope. It's a neurological sensitivity to a hormone called allopregnanolone dropping. Understanding that changes both treatment and how women see themselves.", attribution: "Professor Torbjörn Bäckström, PMDD researcher" },
          { type: "para", text: "Follicular phase (the first half): verbal fluency, memory, lower anxiety, more energy. Late luteal (the last week): more sensitive to noise, harder to brush things off, lower frustration tolerance. Neither state is broken. Both are predictable once you know they exist." },
        ],
      },
      {
        id: "anxiety-and-hormones",
        title: "Anxiety that runs on a schedule",
        keyFact: "If your anxiety is worse the week before your period and better when you bleed — that's not generalised anxiety. It's hormonal.",
        content: [
          { type: "para", text: "Anxiety that consistently worsens 7–10 days before your period and improves within a day or two of bleeding isn't generalised anxiety — it's hormonal. The treatment is different. Some women do best on SSRIs taken only in the second half of the cycle. Others find relief with progesterone management. Knowing the pattern is the first step." },
          { type: "para", text: "ADHD in women is similar — symptoms genuinely worsen in the luteal phase and can become debilitating in perimenopause as oestrogen falls. If you've been prescribed stimulants and notice your dose stops working the same way each month, that conversation is worth having with your prescriber." },
          { type: "list", items: [
            "Track anxiety against your cycle for 3 months — pattern shows itself",
            "PMDD is diagnosed with daily tracking, not a one-off appointment",
            "Luteal-phase SSRIs work well for many women — worth asking about",
            "Perimenopausal depression often responds to HRT where antidepressants haven't",
          ] },
        ],
      },
    ],
  },
  nourishment: {
    sections: [
      {
        id: "hormones-and-food",
        title: "What food can actually do for your hormones",
        keyFact: "About 70% of UK women don't get enough magnesium — and it's one of the most under-the-radar fixes for PMS.",
        content: [
          { type: "para", text: "You don't need a special diet for your hormones. You need a few specific things, reliably. Magnesium (the most depleted nutrient in modern women), enough iron, enough vitamin D in winter, and omega-3 from oily fish a couple of times a week. That covers most of it." },
          { type: "expert", quote: "Magnesium glycinate, 300mg in the two weeks before your period — that's one of the most evidence-backed nutritional fixes for PMS and period pain. And it's one of the least used.", attribution: "Dr Lara Briden, naturopathic physician" },
        ],
      },
      {
        id: "gut-hormone-axis",
        title: "Why gut health is hormone health",
        keyFact: "The bacteria in your gut decide how much of your used oestrogen gets reabsorbed — which means fibre is genuinely hormonal medicine.",
        content: [
          { type: "para", text: "Your gut bacteria affect your oestrogen levels directly. They produce enzymes that decide whether 'used' oestrogen leaves your body or gets reabsorbed. If your gut isn't varied (low fibre, lots of ultra-processed food), more oestrogen sticks around than should — which contributes to endometriosis, fibroids and worse PMS." },
          { type: "para", text: "The fix isn't fancy. More fibre — 30g a day is the target, most UK women eat 18. More plants generally. A bit of fermented food (kefir, kimchi, live yoghurt). And less of the things that disrupt the gut: alcohol, ultra-processed food, very high caffeine." },
          { type: "list", items: [
            "Aim for 30g of fibre a day — seeds, beans, oats, vegetables",
            "1–2 servings a day of fermented food (kefir, kimchi, live yoghurt)",
            "Broccoli, cauliflower and cabbage help your liver clear oestrogen well",
            "Ground flaxseed (1–2 tbsp) is gentle hormonal support",
          ] },
        ],
      },
      {
        id: "key-nutrients",
        title: "The few nutrients that genuinely move the needle",
        keyFact: "If you take iron with orange juice instead of tea, you absorb up to three times more. Same supplement, different result.",
        content: [
          { type: "para", text: "Iron: the most common deficiency in women who menstruate. If your ferritin is below 30, you'll feel it — fatigue, cold, foggy, restless legs. Vitamin C with iron dramatically boosts absorption. Tea and coffee within an hour of iron meals kills it." },
          { type: "para", text: "Magnesium: helps with period pain, sleep, anxiety and thyroid function. Glycinate is the well-tolerated form. Magnesium oxide (the cheapest in shops) is barely absorbed." },
          { type: "para", text: "Omega-3 from oily fish: salmon, mackerel, sardines, anchovies — twice a week. Reduces inflammation generally and period pain specifically. If you don't eat fish, algae oil supplements give you the same thing." },
          { type: "stat", number: "70%", label: "of UK women are deficient in vitamin D by winter" },
        ],
      },
    ],
  },
  care: {
    sections: [
      {
        id: "navigating-healthcare",
        title: "Why you have to advocate for yourself",
        keyFact: "Women wait, on average, 65% longer than men to be diagnosed with the same condition. Knowing this changes how you walk in.",
        content: [
          { type: "para", text: "The healthcare system wasn't designed around women's bodies. Most clinical research, for most of medical history, was done on men. The result: pain is under-treated, hormonal symptoms are under-investigated, and conditions that mostly affect women take longer to diagnose. Knowing this gives you tools, not cynicism." },
          { type: "expert", quote: "I tell every patient: bring a written list. Not on your phone where you might forget to show me — written. The quality of the consultation changes immediately.", attribution: "Dr Anna Kenyon, GP and women's health specialist" },
          { type: "para", text: "The single most effective thing you can do is bring documentation. A diary with dates, cycle phase, severity, and impact on daily life turns 'I've been tired for months' into a clinical pattern that can be investigated." },
        ],
      },
      {
        id: "gp-scripts",
        title: "What to actually say at your GP",
        keyFact: "The average UK GP appointment is 9.2 minutes. Coming in with a written list doubles the chance your main worry is addressed.",
        content: [
          { type: "para", text: "GP time is short. The best appointments arrive with one main concern, supporting evidence, and a specific request. Here are scripts that work for the most common conversations:" },
          { type: "list", items: [
            "\"I'd like my ferritin checked specifically — it's not on the standard blood count.\"",
            "\"I've tracked my symptoms for three cycles and they worsen the week before my period. Could this be PMDD?\"",
            "\"My period pain needs prescription painkillers to function. I'd like to discuss endometriosis investigation.\"",
            "\"I'd like an informed conversation about HRT — what's appropriate for me?\"",
          ] },
          { type: "para", text: "If you feel dismissed, you can ask for a second opinion. That's your right on the NHS. Keep written notes of what you were told and what was investigated — and follow up by email after the appointment if something wasn't addressed." },
        ],
      },
      {
        id: "screening-schedule",
        title: "What you should be invited to (and when)",
        keyFact: "Cervical screening uptake in the UK has dropped to 68% — the lowest in 20 years. It's the most effective preventive test we have.",
        content: [
          { type: "para", text: "Screening is one of the highest-value things the NHS does — but only if you turn up. Cervical screening has cut mortality by 70% since it was introduced. Breast screening catches cancers earlier. Bone density tests at menopause prevent fractures decades later." },
          { type: "list", items: [
            "Cervical: every 3 years from 25–49, every 5 years from 50–64",
            "Breast: every 3 years from 50–70 on the NHS",
            "Blood pressure: at least every 5 years from 40",
            "Bone density (DEXA): around menopause, especially with risk factors",
          ] },
        ],
      },
    ],
  },
};

const OPENERS = {
  overview: {
    follicular: "You're in follicular — the bright, sharp part of your cycle. Energy lifts, skin is calm, your brain is curious. There's a reason for all of it, and it's worth knowing this week.",
    ovulatory:  "You're around ovulation — the brief mid-cycle peak. Most women feel it before they can name it. Here's what's actually happening today.",
    luteal:     "You're in the second half of your cycle. The chemistry that's been calming you is starting to fade, and you can feel it. It's not in your head.",
    menstrual:  "You're bleeding. The cycle has reset. Everything else in your body is responding to that — energy, skin, mood, appetite. Here's what's worth knowing this week.",
  },
  cycle: {
    follicular: "You're in follicular — the sharp, energetic half. This is your brain at its most curious. A good week to start things.",
    ovulatory:  "You're around ovulation — confidence, libido and verbal flow at their monthly peak. It lasts about 24 hours, so notice it.",
    luteal:     "You're in the luteal phase. The world feels heavier than it did a week ago — a calming chemical called allopregnanolone is dropping. This isn't a personality flaw.",
    menstrual:  "You're bleeding. This isn't a failure — it's a remarkable monthly reset. The same chemicals that cause cramping make the renewal possible.",
  },
  skin: {
    follicular: "Your skin is at its most cooperative right now. Oestrogen is rising, sebum is low, your barrier is strong. This is the week for retinol, vitamin C, or anything you've wanted to try.",
    ovulatory:  "Your skin is at its monthly peak. Photograph it now — it'll be your reference for the rest of the cycle.",
    luteal:     "Your skin will start shifting this week. Sebum rises, breakouts cluster around the jaw. It's not your routine — it's the timing.",
    menstrual:  "Your skin is at its most reactive right now. Skip the actives. Stick to barrier care — ceramides, hyaluronic acid, gentle cleanser.",
  },
  mind: {
    follicular: "Your brain is in its sharpest, most curious mode right now. Verbal fluency is up, anxiety is down. If you have a hard conversation to have, this is the week.",
    ovulatory:  "Your brain is in its brief monthly peak. Memory and creativity are at their highest. A good window for big decisions.",
    luteal:     "Your brain is in a real shift. A calming chemical is dropping, and your nervous system can feel it. Irritability, anxiety, the sense that things are harder — those are real.",
    menstrual:  "The first couple of days of your period are the hardest hormonally. Oestrogen crashes alongside progesterone. Then oestrogen rises again and things lift.",
  },
  body: {
    follicular: "Your body is at its most resilient this week. Pain threshold is up, inflammation is down. If you've been putting off something hard, now is a good baseline.",
    ovulatory:  "Around ovulation, your body has a brief inflammatory surge. Barely noticeable for most. For some, it flags conditions worth investigating.",
    luteal:     "If you have a chronic condition — endo, IBS, migraine, autoimmune — this is the week it tends to flare. That's diagnostic. The pattern matters.",
    menstrual:  "Listen to your body this week. The pain, the heaviness, how you feel after the first 48 hours — these are useful signals. Document them.",
  },
  nourishment: {
    follicular: "This is your most metabolically efficient week. You're responding well to training and your appetite is lower. Eat normally — your body's already doing the work.",
    ovulatory:  "Around ovulation, your metabolic rate ticks up slightly and hydration matters more. Otherwise nothing fancy needed.",
    luteal:     "Your body burns 100–300 extra calories a day this week. Cravings are real, not weakness. Magnesium-rich foods (dark chocolate, almonds, leafy greens) make a measurable difference.",
    menstrual:  "Your body is losing iron. The week of your period and the week after, lean into iron-rich foods with vitamin C — it makes a real difference to energy later.",
  },
  care: {
    follicular: "Follicular is the best week for clinical conversations. Your thinking is sharpest, recall is best. Schedule the hard appointments here when you can.",
    ovulatory:  "Ovulation week is a good time to advocate for yourself. You're more articulate and more confident — both useful in a GP appointment.",
    luteal:     "Bring written notes to any appointment this week. Cognitive load is higher, recall is less reliable. Don't trust yourself to remember everything.",
    menstrual:  "This is the week your body is most clearly telling you what's wrong. If you keep a symptom diary, the first three days of your period are the richest moments.",
  },
  lifestage: {
    follicular: "Wherever you are in your life — reproductive, perimenopausal, postpartum — follicular is when biology is most generous. Make use of it this week.",
    ovulatory:  "Mid-cycle is a good moment to reflect on bigger arcs. If you're tracking signs of perimenopause, this is when your body's signals are clearest.",
    luteal:     "Late luteal mirrors a lot of what perimenopause and postpartum feel like. Understanding one helps you understand the others.",
    menstrual:  "Menstruation marks the end of one cycle and the beginning of another — a useful frame for thinking about life-stage transitions too.",
  },
};

const POSTSCRIPTS = {
  overview:    "The most powerful thing you can do for your long-term health is keep tracking, gently. Patterns over months tell you things no single appointment ever can.",
  cycle:       "Your cycle is one of the most sensitive signals your body has. If it changes meaningfully — that's information. Always worth bringing to your GP.",
  skin:        "Your skin tells the hormonal story before any blood test does. If you're seeing patterns, document them — photographs included. Take them in.",
  mind:        "What you experience across your cycle is real, measurable, and underresearched. If you've been diagnosed with anxiety, ADHD or depression — your symptoms likely vary by phase. That conversation is worth having.",
  body:        "Chronic symptoms are not character flaws. Fatigue, pain or inflammation that tracks with your hormones deserves a proper investigation — not 'many women experience this'.",
  nourishment: "Food isn't moral. The best nutrition for your hormones is the one you can sustain with pleasure. Variety, iron, magnesium — that beats any elimination protocol.",
  care:        "You are your most important advocate. A symptom diary, a written list, and a follow-up email after appointments — those three habits change outcomes more than anything else.",
  lifestage:   "Every transition feels less lonely when you understand the biology. These aren't conditions to fix. They're chapters to walk through with knowledge.",
};
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
