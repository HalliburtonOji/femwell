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
// Typography: Cormorant Garamond (serif body, opener, P.S., section titles)
// for the letter feel; system font stack (Apple system / Segoe UI / Roboto)
// for UI chrome — tab pills, sticky bars, ToC labels, buttons, metadata.
// Cormorant loaded from Google Fonts at mount with weights 400/500/600 +
// italic 400/500 so the body type renders at proper weight on mobile.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";

// ════════════════════════════════════════════════════════════════════════════
// TABS
// ════════════════════════════════════════════════════════════════════════════
// ─── LETTERS — 7 consolidated letters. Replaces the old 9-tab TABS array
// because the pill bar didn't scale on mobile. Navigation is now a slider
// (arrows + dots + Library overlay) — see Health() component body.
const LETTERS = [
  { id: "story",       title: "Your Story",          subtitle: "Patterns only you can see",                icon: "◎", botanical: "story" },
  { id: "cycle",       title: "Cycle & Life Stage",  subtitle: "Where you are, and what it means",         icon: "◯", botanical: "cycle" },
  { id: "body",        title: "Body & Skin",         subtitle: "What your body is telling you",            icon: "◉", botanical: "body" },
  { id: "mind",        title: "Mind & Sleep",        subtitle: "The cycling brain, and rest",              icon: "⟳", botanical: "mind" },
  { id: "nourishment", title: "Nourishment & Gut",   subtitle: "Food, hormones, and your microbiome",       icon: "✿", botanical: "nourishment" },
  { id: "intimacy",    title: "Intimacy",            subtitle: "The conversation most apps skip",          icon: "❧", botanical: "skin" },
  { id: "care",        title: "Your Care",           subtitle: "Navigate the system like you own it",      icon: "⊕", botanical: "care" },
];
// Back-compat alias — older code paths still expect TABS.
const TABS = LETTERS.map((L) => ({ id: L.id, label: L.title, icon: L.icon }));

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
    case "story":
      // Concentric circles + centre dot — a personal-data motif (your patterns).
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="36" stroke="#D4AF37" strokeWidth="0.75" opacity="0.4" />
          <circle cx="40" cy="40" r="26" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.5" />
          <circle cx="40" cy="40" r="16" stroke="#E8B4B8" strokeWidth="0.75" opacity="0.6" />
          <circle cx="40" cy="40" r="4" fill="#D4AF37" opacity="0.8" />
        </svg>
      );
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
      },,
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
      },,
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
      {
        id: "sleep-across-cycle",
        title: "Sleep across your cycle",
        keyFact: "Women need 20 minutes more sleep per night than men on average — and most get less.",
        content: [
          { type: "para", text: "Your sleep changes every week of your cycle and almost nobody is told. Progesterone in early luteal improves sleep depth — that's the warm, calm fortnight. In late luteal (the week before your period), progesterone falls sharply and sleep architecture disrupts. You may wake at 3am for no reason. You're not broken — you're hormonal." },
          { type: "para", text: "If you have PMS or PMDD, sleep typically worsens between days 22 and 28. Tracking your sleep against your cycle for two months will show you the pattern — and it will make you stop blaming yourself for the bad weeks." },
          { type: "list", items: [
            "Magnesium glycinate 200–400mg in the evening — meta-analysis evidence for premenstrual sleep",
            "Cool room (16–18°C) — your core temperature is higher in luteal phase",
            "Wind-down routine 60 minutes before bed — protect this on luteal days",
            "Avoid alcohol in late luteal — it fragments sleep more than usual",
          ] },
        ],
      },
      {
        id: "sleep-perimenopause",
        title: "Sleep in perimenopause",
        keyFact: "If you've started waking at 3am every night in your 40s, that's not anxiety — that's hormones.",
        content: [
          { type: "para", text: "Night sweats, racing thoughts at 3am, and fragmented sleep are some of the earliest perimenopausal symptoms — often years before periods change. Sleep hygiene lectures don't fix this. The mechanism is hormonal: falling oestrogen disrupts the temperature regulation that normally keeps you asleep." },
          { type: "expert", quote: "Sleep in perimenopause is a treatable problem. Most women try every supplement and bedtime ritual before they have a proper conversation about HRT, which is genuinely the most effective intervention we have.", attribution: "Dr Louise Newson, GP and menopause specialist" },
          { type: "list", items: [
            "HRT (transdermal oestrogen + micronised progesterone): strongest evidence base",
            "Magnesium glycinate: reduces night-time waking",
            "Sleep restriction therapy with a CBT-I specialist: works when habits are part of it",
            "Melatonin alone: weak evidence — useful for shift workers, not for hormonal disruption",
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
       {
        id: "estrobolome",
        title: "The estrobolome — why gut health is hormonal health",
        keyFact: "The bacteria in your gut decide how much of your used oestrogen gets reabsorbed. They are part of your endocrine system.",
        content: [
          { type: "para", text: "Your body breaks down oestrogen in the liver, sends it to the gut for excretion, and a specific group of gut bacteria called the estrobolome decides what happens next. A healthy estrobolome lets the used oestrogen leave. A disrupted one (low fibre, antibiotics, ultra-processed food) releases an enzyme called beta-glucuronidase that splits oestrogen back into its active form — and it gets reabsorbed into your bloodstream." },
          { type: "para", text: "This is the mechanism behind a lot of unexplained oestrogen dominance — heavier periods, premenstrual breast tenderness, fibroid growth, endometriosis worsening. It's also why fibre intake genuinely affects hormones: at least 30g a day feeds the right bacteria and keeps the estrobolome functioning." },
          { type: "list", items: [
            "30g of fibre a day — beans, lentils, oats, seeds, fruit, vegetables",
            "Fermented foods 3–4× per week — yoghurt, kefir, kimchi, sauerkraut",
            "Reduce ultra-processed food — emulsifiers disrupt the gut barrier",
            "Avoid unnecessary antibiotics — they reset the estrobolome for months",
          ] },
        ],
      },
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
  intimacy: {
    sections: [
      {
        id: "libido-across-cycle",
        title: "Libido across the cycle",
        keyFact: "Libido peaks at ovulation — testosterone and oestrogen are both elevated, and this is the only time biological and experiential desire align for most women.",
        content: [
          { type: "para", text: "Desire fluctuates hormonally and most of us are never told. The highest libido point in the cycle is around ovulation (testosterone and oestrogen both peak). The lowest is in late luteal (progesterone dominant, allopregnanolone rising and falling) and early menstrual (everything is at the floor). This is biology, not relationship quality, not personal failing." },
          { type: "para", text: "The mismatch between hormonal desire and life circumstances is one of the most common sources of unspoken relationship friction. Track it for 2–3 cycles and the pattern becomes obvious. The point isn't to schedule sex around your hormones — it's to stop blaming yourself for the weeks where it isn't there." },
        ],
      },
      {
        id: "ocp-and-desire",
        title: "The hormonal pill and desire",
        keyFact: "Combined oral contraceptives suppress free testosterone — in some women, the effect on libido persists long after stopping.",
        content: [
          { type: "para", text: "The combined oral contraceptive pill raises a protein called sex hormone-binding globulin (SHBG), which binds free testosterone and reduces what your body has available. For some women that's clinically meaningful: libido drops, arousal blunts, orgasm changes. The pill is the right choice for many people — but this side effect deserves to be part of the conversation when it's prescribed, and it almost never is." },
          { type: "para", text: "If you're on the OCP and have low desire, raise it with your GP. Switching to a different formulation, or moving to a non-hormonal method, sometimes restores it. In a smaller number of women, SHBG stays elevated for months or years after stopping — that's worth knowing about before you start." },
        ],
      },
      {
        id: "pelvic-health",
        title: "Pelvic health",
        keyFact: "Pelvic floor dysfunction affects 1 in 3 women who've given birth — and is undertreated because we've normalised incontinence as 'part of motherhood'.",
        content: [
          { type: "para", text: "The pelvic floor is a group of muscles that support the bladder, bowel and uterus. Dysfunction (weakness, hypertonicity, or both) causes symptoms including leaking when you cough or laugh, prolapse, pelvic pain, painful intercourse, and difficulty emptying your bladder fully. These symptoms are common after birth and around menopause. They are also treatable." },
          { type: "para", text: "In France postpartum pelvic physiotherapy is standard NHS-equivalent care. In the UK it's a postcode lottery. You can self-refer to a specialist pelvic physio privately — sessions are usually £60–120 and most women see meaningful change in 6–8 weeks. The normalisation is the bigger problem than the dysfunction." },
        ],
      },
      {
        id: "gsm",
        title: "Genitourinary symptoms at menopause",
        keyFact: "Half of postmenopausal women have GSM — vaginal dryness, painful sex, recurrent UTIs — and most are never offered the simple, effective treatment.",
        content: [
          { type: "para", text: "GSM (genitourinary syndrome of menopause) is what happens when oestrogen falls and the vaginal and urinary tract tissue thins, loses elasticity, and becomes more vulnerable to infection. Symptoms: dryness, burning, pain during sex, urinary urgency, recurrent UTIs. Unlike hot flushes, GSM doesn't ease with time — it worsens unless treated." },
          { type: "para", text: "The first-line treatment is topical vaginal oestrogen — a cream or pessary used locally, with minimal systemic absorption. It's safe even for many women who can't use systemic HRT. It works for most. It's massively undertreated because women don't know to ask and clinicians don't routinely volunteer it. The exact words: 'Can we discuss topical vaginal oestrogen?'" },
          { type: "expert", quote: "GSM is one of the most undertreated conditions in women's health. The treatment is cheap, safe, and effective. The barrier is conversation.", attribution: "Dr Heather Currie, gynaecologist and Menopause Matters" },
        ],
      },
    ],
  },
};

const OPENERS = {
  story: {
    follicular: "Here's what your body has been telling you. Not in symptoms to manage — in patterns worth knowing.",
    ovulatory:  "Here's what your body has been telling you. Not in symptoms to manage — in patterns worth knowing.",
    luteal:     "Here's what your body has been telling you. Not in symptoms to manage — in patterns worth knowing.",
    menstrual:  "Here's what your body has been telling you. Not in symptoms to manage — in patterns worth knowing.",
  },
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
  intimacy: {
    follicular: "This is the letter most health apps don't write. We're going to write it properly.",
    ovulatory:  "This is the letter most health apps don't write. We're going to write it properly.",
    luteal:     "This is the letter most health apps don't write. We're going to write it properly.",
    menstrual:  "This is the letter most health apps don't write. We're going to write it properly.",
  },
};

const POSTSCRIPTS = {
  story:       "Your patterns get clearer every cycle. The more you log, the more this letter has to tell you.",

  overview:    "The most powerful thing you can do for your long-term health is keep tracking, gently. Patterns over months tell you things no single appointment ever can.",
  cycle:       "Your cycle is one of the most sensitive signals your body has. If it changes meaningfully — that's information. Always worth bringing to your GP.",
  mind:        "What you experience across your cycle is real, measurable, and underresearched. If you've been diagnosed with anxiety, ADHD or depression — your symptoms likely vary by phase. That conversation is worth having.",
  body:        "Chronic symptoms are not character flaws. Fatigue, pain or inflammation that tracks with your hormones deserves a proper investigation — not 'many women experience this'.",
  nourishment: "Food isn't moral. The best nutrition for your hormones is the one you can sustain with pleasure. Variety, iron, magnesium — that beats any elimination protocol.",
  care:        "You are your most important advocate. A symptom diary, a written list, and a follow-up email after appointments — those three habits change outcomes more than anything else.",
  intimacy:   "Nothing in this letter is about what you should want or how you should feel. It's about understanding the biological context for what you experience — which is the start of a useful conversation, with a partner, a GP, or just yourself.",
};
// ════════════════════════════════════════════════════════════════════════════
const SIGNATURES = {
  story:       { name: "Your patterns",  role: "Drawn from what you've logged this month" },

  overview:    { name: "Jess",                          role: "Your FemWell companion" },
  cycle:       { name: "The FemWell Editorial Team",   role: "In partnership with reproductive endocrinology" },
  body:        { name: "The FemWell Editorial Team",   role: "Integrative women's health" },
  mind:        { name: "The FemWell Editorial Team",   role: "Neuropsychology & the cycle" },
  nourishment: { name: "The FemWell Editorial Team",   role: "Nutritional endocrinology" },
  care:        { name: "The FemWell Editorial Team",   role: "Healthcare navigation" },
  intimacy:   { name: "The FemWell Editorial Team", role: "Sexual and pelvic health" },
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// CURATED NEWS — static for now. Will be wired to a real feed (Guardian /
// PubMed / NHS) in a later pass. Two cards per tab.
// ════════════════════════════════════════════════════════════════════════════
const NEWS_BY_TAB = {
  story:       [],
  overview: [
    { headline: "Why women's health research has a data gap — and what's changing", source: "The Guardian", date: "May 2026", url: "#" },
    { headline: "The case for tracking your cycle as a vital sign", source: "BMJ", date: "Apr 2026", url: "#" },
  ],
  cycle: [
    { headline: "New research links cycle length variability to long-term cardiovascular risk", source: "NEJM", date: "May 2026", url: "#" },
    { headline: "PMDD: the diagnosis 5% of women have and most don't know about", source: "BBC Health", date: "Apr 2026", url: "#" },
  ],
  body: [
    { headline: "Endometriosis diagnosis delay falls to 6 years in UK — still too long, say specialists", source: "Endometriosis UK", date: "May 2026", url: "#" },
    { headline: "Iron deficiency without anaemia: the diagnosis GPs keep missing", source: "BMJ Open", date: "Apr 2026", url: "#" },
  ],
  mind: [
    { headline: "ADHD in women peaks at perimenopause — researchers demand better clinical protocols", source: "Nature Medicine", date: "May 2026", url: "#" },
    { headline: "The luteal phase and anxiety: what the neuroscience finally confirms", source: "Neuropsychopharmacology", date: "Mar 2026", url: "#" },
  ],
  nourishment: [
    { headline: "Magnesium and period pain: a meta-analysis of 14 trials", source: "Nutrients", date: "Apr 2026", url: "#" },
    { headline: "The estrobolome: how gut bacteria control oestrogen recycling", source: "Cell Host & Microbe", date: "May 2026", url: "#" },
  ],
  care: [
    { headline: "Cervical screening uptake hits 20-year low in UK", source: "NHS England", date: "May 2026", url: "#" },
    { headline: "Women wait 65% longer for diagnosis — what the data shows and what to do", source: "BMJ", date: "Apr 2026", url: "#" },
  ],
  intimacy: [
    { headline: "The oral contraceptive pill and libido: what the evidence actually shows", source: "The Lancet", date: "Apr 2026", url: "#" },
    { headline: "Genitourinary syndrome of menopause: the condition 50% of women have and can't name", source: "BJOG", date: "May 2026", url: "#" },
  ],
};


// ════════════════════════════════════════════════════════════════════════════
// JESS OBSERVATION CARD (top of each letter)
// ════════════════════════════════════════════════════════════════════════════
function getJessObservations(letterId, profile, recentSymptoms, cycle, phase) {
  const cycleDay = cycle?.cycleDay || cycle?.dayInCycle;
  const topSymptom = (recentSymptoms || [])[0]?.symptom_name || (recentSymptoms || [])[0]?.symptom_type;
  const obs = {
    cycle: [
      cycleDay ? `You're on day ${cycleDay} — ${phase === "luteal" ? "the second half, where most of the interesting patterns show up." : phase === "follicular" ? "the sharp half. Energy tends to be clearest here." : phase === "ovulatory" ? "the brief window where everything tends to feel easier." : "the reset. Be patient with these few days."}` : null,
      topSymptom ? `You've logged ${String(topSymptom).replace(/_/g, " ").toLowerCase()} recently — there's a section in here that speaks directly to that.` : null,
    ].filter(Boolean).slice(0, 2),
    body: [
      "This letter covers symptoms that are often dismissed. If something here sounds familiar, it deserves investigation.",
      (recentSymptoms || []).length > 2 ? "You've been logging consistently — that data is genuinely useful to a clinician." : null,
    ].filter(Boolean),
    intimacy: [
      "This is content most apps skip. It's here because it matters to your health, not as an afterthought.",
    ],
    mind: [
      phase === "luteal" ? "You're in the luteal phase — emotional bandwidth tends to be narrower here. That's biology, not weakness." : phase === "follicular" ? "Follicular phase is the clearest thinking window. Worth noting what feels easier this week." : null,
    ].filter(Boolean),
    nourishment: [
      "Three things move the needle most: fibre, magnesium, and being on top of iron. Everything else is detail.",
    ],
    care: [
      "Bring written notes and ask specific questions. Both double the chance your main worry is addressed.",
    ],
    story: [],
  };
  const list = obs[letterId];
  if (!list || !list.length) return null;
  return list;
}

function JessObservationCard({ letterId, profile, recentSymptoms, cycle, phase }) {
  const observations = getJessObservations(letterId, profile, recentSymptoms, cycle, phase);
  if (!observations || !observations.length) return null;
  return (
    <div style={{
      background: "rgba(58,44,26,0.04)",
      border: "1px solid rgba(58,44,26,0.1)",
      borderRadius: 8, padding: "14px 18px", marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }} aria-hidden="true">✦</span>
        <span style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
          textTransform: "uppercase", color: "#9B8B7A",
        }}>Jess noticed</span>
      </div>
      {observations.map((o, i) => (
        <p key={i} style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 16, fontWeight: 500, color: "#3A2C1A",
          lineHeight: 1.7, fontStyle: "italic",
          margin: i < observations.length - 1 ? "0 0 8px" : 0,
        }}>{o}</p>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TERM — in-context glossary tooltip (sparingly used in body content)
// ════════════════════════════════════════════════════════════════════════════
function Term({ word, definition }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span
        onClick={() => setOpen((o) => !o)}
        style={{
          borderBottom: "1px dotted rgba(58,44,26,0.4)",
          cursor: "pointer", color: "#3A2C1A",
        }}
      >{word}</span>
      {open && (
        <span style={{
          position: "absolute", bottom: "100%", left: "50%",
          transform: "translateX(-50%)",
          background: "#3A2C1A", color: "#F4EDDB",
          borderRadius: 6, padding: "10px 12px",
          fontSize: 12.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontStyle: "normal", lineHeight: 1.5,
          width: 220, zIndex: 30,
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)", textAlign: "left",
        }}>
          {definition}
          <span aria-hidden="true" style={{
            position: "absolute", top: "100%", left: "50%",
            transform: "translateX(-50%)",
            border: "5px solid transparent",
            borderTopColor: "#3A2C1A",
          }} />
        </span>
      )}
    </span>
  );
}

export default function Health() {
  const [letterIndex, setLetterIndex] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const touchStartX = useRef(null);
  const activeTab = LETTERS[letterIndex]?.id || "story";
  const currentLetter = LETTERS[letterIndex] || LETTERS[0];
  const [expanded, setExpanded] = useState({});
  const [profile, setProfile] = useState(null);
  const [scrollPct, setScrollPct] = useState(0);
  // ── Real entity data wired into Story tab + dynamic salutation/postscript ──
  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [habits, setHabits] = useState([]);
  const [hydration, setHydration] = useState([]);
  const letterRef = useRef(null);
  const navigate = useNavigate();

  // ─── Fetch profile + cycle data + recent logs ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me();
        const [profiles, sx, chk, hb, hy] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: u.id }, "-date", 30).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 30).catch(() => []),
          base44.entities.HabitLogs.filter({ user_id: u.id }, "-date", 90).catch(() => []),
          base44.entities.HydrationLog.filter({ user_id: u.id }, "-day_key", 30).catch(() => []),
        ]);
        if (cancelled) return;
        setProfile(profiles?.[0] || u || null);
        setRecentSymptoms(Array.isArray(sx) ? sx : []);
        setRecentCheckins(Array.isArray(chk) ? chk : []);
        setHabits(Array.isArray(hb) ? hb : []);
        setHydration(Array.isArray(hy) ? hy : []);
      } catch (err) {
        if (!cancelled) setProfile(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "follicular";
  const stage = profile?.life_stage || "reproductive";

  // ─── Letter navigation helpers — instant, no animation.
  // We had a slide-out animation here but it left the paper at opacity 0
  // (forwards keyframe to opacity: 0 with no in-animation), which made
  // navigation feel broken. Instant updates are better than half-broken
  // transitions. ───
  const goToLetter = (i) => {
    if (i < 0 || i >= LETTERS.length) return;
    setLetterIndex(i);
    setExpanded({});
    // Scroll to top of the paper so the new letter starts at its letterhead.
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    }
  };
  const goNext = () => { if (letterIndex < LETTERS.length - 1) goToLetter(letterIndex + 1); };
  const goPrev = () => { if (letterIndex > 0)                   goToLetter(letterIndex - 1); };
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev(); }
    touchStartX.current = null;
  };

  // ─── Inject Google Fonts once ───
  useEffect(() => {
    const id = "hc-google-fonts";
    if (document.getElementById(id)) return;
    const l1 = document.createElement("link");
    l1.id = id;
    l1.rel = "stylesheet";
    l1.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=block";
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

  // ─── Sections start collapsed on every tab change. The reader chooses
  // what to open — the letter reads as scannable summaries first. ───
  useEffect(() => {
    setExpanded({});
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

  const baseOpener = OPENERS[activeTab]?.[phase] || OPENERS.overview.follicular;

  // ── Data-aware opener (Feature 2) — appended to phase opener when data exists ──
  const cycleDay = cycle?.cycleDay || cycle?.dayInCycle;
  const topSymptomName = useMemo(() => {
    if (!recentSymptoms?.length) return null;
    const counts = recentSymptoms.reduce((acc, x) => {
      const n = x?.symptom_name || x?.symptom_type;
      if (!n) return acc;
      acc[n] = (acc[n] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || null;
  }, [recentSymptoms]);

  let opener = baseOpener;
  if (activeTab !== "story") {
    if (cycleDay) opener += ` You're on day ${cycleDay}.`;
    if (topSymptomName) opener += ` You've logged ${String(topSymptomName).replace(/_/g, " ").toLowerCase()} a few times recently — there's something in this letter that speaks to that.`;
  }

  // ── Data-aware postscript (Feature 2) ──
  const dynamicPostscript = useMemo(() => {
    const base = POSTSCRIPTS[activeTab] || POSTSCRIPTS.overview;
    if (activeTab === "cycle" && cycleDay) {
      const note = phase === "luteal"
        ? "The second half is when most women notice the biggest shifts in mood and energy — worth tracking this week."
        : phase === "menstrual"
          ? "The reset is happening. Be patient with yourself for the next few days."
          : "This is a good week to note what feels different.";
      return `You're on day ${cycleDay} of your cycle. ${note}`;
    }
    if (activeTab === "skin") {
      const skinSx = (recentSymptoms || []).find((x) => /acne|breakout|dry skin|oily skin|rash/i.test(String(x?.symptom_name || x?.symptom_type || "")));
      if (skinSx) {
        const n = String(skinSx.symptom_name || skinSx.symptom_type || "").replace(/_/g, " ").toLowerCase();
        return `You logged ${n} recently. Note what day of your cycle that was — if it's consistent, that's a pattern worth bringing to a dermatologist.`;
      }
    }
    if (activeTab === "body" && topSymptomName) {
      const n = String(topSymptomName).replace(/_/g, " ").toLowerCase();
      return `You've logged ${n} more than once recently. Patterns matter. Keep noting when and how it shows up — that's the data that changes a GP conversation.`;
    }
    if (activeTab === "mind") {
      const moods = (recentCheckins || []).map((c) => Number(c?.mood_score ?? c?.mood)).filter((v) => !Number.isNaN(v));
      if (moods.length >= 7) {
        const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
        if (avg <= 2.5) return "Your mood has been on the low side for a few weeks. Worth noting if that tracks your cycle — and worth raising with your GP if it doesn't lift.";
      }
    }
    if (activeTab === "nourishment") {
      const totalMl = (hydration || []).reduce((a, h) => a + (Number(h?.amount_ml) || 0), 0);
      const days = Math.max(1, new Set((hydration || []).map((h) => h?.day_key)).size);
      const avg = Math.round(totalMl / days);
      const target = profile?.hydration_target_ml || 2000;
      if (avg > 0 && avg < target * 0.7) {
        return `Your average hydration this fortnight is around ${avg}ml — under your ${target}ml target. Small, frequent sips beat one big glass. Your skin and energy will both notice.`;
      }
    }
    if (activeTab === "care" && topSymptomName) {
      const n = String(topSymptomName).replace(/_/g, " ").toLowerCase();
      return `Bring your logs to your next GP appointment. "I've logged ${n} on these specific days over the past month" is a clinical pattern — it gets investigated faster than "I sometimes feel off".`;
    }
    return base;
  }, [activeTab, cycleDay, phase, topSymptomName, recentSymptoms, recentCheckins, hydration, profile]);

  // ── Ask Jess pre-fill (Feature 3) — passes the section's reading context. ──
  const askJess = (sectionTitle) => {
    const prompt = `I'm reading about "${sectionTitle}" in my ${tab.label} health letter. Can you tell me more about how this applies to my cycle and life stage?`;
    try { sessionStorage.setItem("jess_initial_prompt", prompt); } catch (_) {}
    window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { initialPrompt: prompt } }));
    navigate("/Assistant");
  };

  const isStory = activeTab === "story";

  return (
    <div style={{ background: "#E8DBC8", minHeight: "100vh", paddingBottom: 80, boxShadow: "inset 0 0 60px rgba(58,44,26,0.08)" }}>
      {/* ─── Tab bar ─── */}
      <div style={{
        background: "#E8DBC8", borderBottom: "1px solid rgba(58,44,26,0.10)",
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
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        fontSize: 12, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: 0.8,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 47, zIndex: 10,
      }}>
        <span>{phaseLbl} · {stageLbl}</span>
        {cycle?.cycleDay && <span>Day {cycle.cycleDay}</span>}
      </div>

      {/* ─── Letter history strip (Feature 5) ─── */}
      <LetterHistoryStrip currentPhase={phaseLbl} />

      {/* ─── Letter paper card with side-arrow slider nav ─── */}
      <div style={{ padding: "24px 8px 24px", position: "relative", maxWidth: 780, margin: "0 auto" }}>
        {/* Left arrow */}
        {letterIndex > 0 && (
          <button onClick={goPrev} aria-label="Previous letter" style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
            background: "rgba(58,44,26,0.10)", border: "1px solid rgba(58,44,26,0.18)",
            borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 20, pointerEvents: "auto",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 22, color: "#3A2C1A", fontWeight: 600, paddingBottom: 2,
          }}>‹</button>
        )}
        {/* Right arrow */}
        {letterIndex < LETTERS.length - 1 && (
          <button onClick={goNext} aria-label="Next letter" style={{
            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
            background: "rgba(58,44,26,0.10)", border: "1px solid rgba(58,44,26,0.18)",
            borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 20, pointerEvents: "auto",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 22, color: "#3A2C1A", fontWeight: 600, paddingBottom: 2,
          }}>›</button>
        )}
        <article ref={letterRef}
          className="hc-letter-paper"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
          background: `
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              rgba(58,44,26,0.04) 31px,
              rgba(58,44,26,0.04) 32px
            ),
            radial-gradient(ellipse at 50% 100%, rgba(180,140,80,0.06) 0%, transparent 70%),
            radial-gradient(ellipse at 0% 50%, rgba(180,140,80,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 50%, rgba(180,140,80,0.04) 0%, transparent 50%),
            #FAF5E8
          `,
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
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, color: "#9B8B7A", textTransform: "uppercase" }}>
                FemWell Health Letter
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, fontWeight: 700, color: "#3A2C1A", marginTop: 4 }}>
                {tab.label}
              </div>
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: "#9B8B7A", marginTop: 6 }}>
                {formattedDate} · {stageLbl}
              </div>
            </div>
          </div>

          {/* ── Jess observation card ── */}
          <JessObservationCard
            letterId={activeTab}
            profile={profile}
            recentSymptoms={recentSymptoms}
            cycle={cycle}
            phase={phase}
          />

          {/* ── Salutation ── */}
          <div style={{ marginBottom: 28, position: "relative" }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 600, color: "#3A2C1A", marginBottom: 16, fontStyle: "italic" }}>
              Dear {name},
            </div>
            <p style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 19, fontWeight: 500, lineHeight: 1.9, color: "#3A2C1A", margin: "0 0 16px",
            }}>
              <span style={{
                float: "left", fontSize: 80, lineHeight: "0.75",
                marginRight: 10, marginTop: 6,
                fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 700, color: "#3A2C1A",
              }}>{opener.charAt(0)}</span>
              {opener.slice(1)}
            </p>
          </div>

          {!isStory && (<>{/* ── Table of Contents ── */}
          <div style={{
            border: "1.5px solid rgba(212,175,55,0.4)", borderRadius: 8,
            padding: "20px 24px", marginBottom: 32,
            background: "rgba(212,175,55,0.05)", position: "relative",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, paddingBottom: 12,
              borderBottom: "1px solid rgba(212,175,55,0.25)",
            }}>
              <span style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 18, fontWeight: 700, color: "#3A2C1A", letterSpacing: 0.5,
              }}>In this letter</span>
              <button onClick={toggleAll} style={{
                background: "none", border: "1px solid rgba(58,44,26,0.2)",
                borderRadius: 14, padding: "5px 14px", cursor: "pointer",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 12, fontWeight: 600, color: "#3A2C1A", letterSpacing: 0.3,
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
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0", textDecoration: "none",
                borderBottom: i < sections.length - 1 ? "1px solid rgba(58,44,26,0.05)" : "none",
              }}>
                <span style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: 12, fontWeight: 700, color: "#D4AF37",
                  minWidth: 22, background: "rgba(212,175,55,0.15)",
                  borderRadius: "50%", width: 22, height: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</span>
                <span style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 17, fontWeight: 600, color: "#3A2C1A", flex: 1,
                }}>{s.title}</span>
                {expanded[s.id] && <span style={{ fontSize: 14, color: "#8FAF8F" }} aria-hidden="true">✓</span>}
              </a>
            ))}
          </div>

          {/* ── Sections ── */}
          {sections.map((s, idx) => (
            <div key={s.id} style={{ position: "relative" }}>
              {idx > 0 && <BotanicalDivider />}
              <LetterSection
                section={s}
                isExpanded={!!expanded[s.id]}
                onToggle={() => toggle(s.id)}
                askJess={askJess}
              />
            </div>
          ))}

          {/* ── News (Feature 4) ── */}
          <NewsSection tabId={activeTab} />
          </>)}

          {/* ── Story dashboard (Feature 1) ── */}
          {isStory && (
            <StoryDashboard
              profile={profile}
              cycle={cycle}
              phase={phase}
              recentCheckins={recentCheckins}
              recentSymptoms={recentSymptoms}
              habits={habits}
              hydration={hydration}
            />
          )}

          {/* ── Sign-off ── */}
          <BotanicalDivider />
          <div style={{ marginTop: 28, position: "relative" }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 17, fontWeight: 500, color: "#3A2C1A", marginBottom: 4 }}>
              With care,
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 700, color: "#3A2C1A", fontStyle: "italic" }}>
              {(SIGNATURES[activeTab] || SIGNATURES.overview).name}
            </div>
            <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: "#9B8B7A", letterSpacing: 0.5, marginTop: 4 }}>
              {(SIGNATURES[activeTab] || SIGNATURES.overview).role}
            </div>
          </div>

          {/* ── P.S. ── */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(58,44,26,0.10)", position: "relative" }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 17, fontWeight: 500, fontStyle: "italic",
              color: "#3A2C1A", lineHeight: 1.8, margin: 0,
            }}>
              <strong style={{ fontStyle: "normal", fontWeight: 600 }}>P.S.</strong> — {dynamicPostscript}
            </p>
          </div>

          {/* ── In-paper disclaimer ── */}
          <div style={{ marginTop: 16, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 10, color: "#9B8B7A", letterSpacing: 0.4, fontStyle: "italic", position: "relative" }}>
            This letter is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for personal health decisions.
          </div>
        </article>
      </div>

      {/* ─── Dot indicator + Library button ─── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "20px 12px", background: "#E8DBC8",
      }}>
        {LETTERS.map((_, i) => (
          <button key={i} onClick={() => goToLetter(i)} aria-label={`Letter ${i + 1}`} style={{
            width: i === letterIndex ? 22 : 9,
            height: 9, borderRadius: 4.5,
            background: i === letterIndex ? "#3A2C1A" : "rgba(58,44,26,0.22)",
            border: "none", cursor: "pointer", padding: 0,
            transition: "all 0.2s ease",
          }} />
        ))}
        <button onClick={() => setShowLibrary(true)} style={{
          marginLeft: 14, background: "none",
          border: "1px solid rgba(58,44,26,0.2)", borderRadius: 14,
          padding: "5px 14px", cursor: "pointer",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 11, fontWeight: 600, color: "#9B8B7A", letterSpacing: 0.5,
        }}>All letters</button>
      </div>

      {/* ─── Library overlay ─── */}
      {showLibrary && (
        <div
          onClick={() => setShowLibrary(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(58,44,26,0.7)",
            zIndex: 100, display: "flex", alignItems: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#F0E6CE", width: "100%", borderRadius: "16px 16px 0 0",
              padding: "24px 16px 40px", maxHeight: "75vh", overflowY: "auto",
            }}
          >
            <div style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 22, fontWeight: 700, color: "#3A2C1A",
              marginBottom: 20, textAlign: "center",
            }}>Your letters</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {LETTERS.map((L, i) => {
                const on = i === letterIndex;
                return (
                  <button key={L.id} onClick={() => { goToLetter(i); setShowLibrary(false); }} style={{
                    background: on ? "#3A2C1A" : "#FEFAF2",
                    border: "1px solid rgba(212,175,55,0.4)",
                    borderRadius: 8, padding: "16px 14px",
                    cursor: "pointer", textAlign: "left",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }} aria-hidden="true">{L.icon}</div>
                    <div style={{
                      fontFamily: "Cormorant Garamond, Georgia, serif",
                      fontSize: 16, fontWeight: 700,
                      color: on ? "#F4EDDB" : "#3A2C1A",
                      marginBottom: 4, lineHeight: 1.25,
                    }}>{L.title}</div>
                    <div style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: 11, fontWeight: 500,
                      color: on ? "rgba(244,237,219,0.65)" : "#9B8B7A",
                    }}>{L.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Rosebud scroll progress ── ── */}
      <RosebudProgress scrollPct={scrollPct} />

      {/* ── Bottom not-medical-advice strip ── */}
      <div style={{
        background: "#3A2C1A", color: "rgba(244,237,219,0.6)",
        padding: "12px 20px", textAlign: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 10, letterSpacing: 0.5,
      }}>
        This content is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for personalised health decisions.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LETTER SECTION
// ════════════════════════════════════════════════════════════════════════════
function LetterSection({ section, isExpanded, onToggle, askJess }) {
  return (
    <div id={`letter-section-${section.id}`} style={{ marginBottom: 4, scrollMarginTop: 110, position: "relative" }}>
      <button onClick={onToggle} style={{
        width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
        padding: "14px 0 8px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(58,44,26,0.08)",
      }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontWeight: 700, fontSize: 22, color: "#3A2C1A", lineHeight: 1.2,
        }}>
          {section.title}
        </span>
        <span style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 20, color: "#D4AF37", marginLeft: 12, flexShrink: 0,
          display: "inline-block",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }} aria-hidden="true">
          ▾
        </span>
      </button>

      {/* Key fact — always visible */}
      {section.keyFact && (
        <div className="hc-letter-keyfact" style={{
          padding: "14px 18px", background: "rgba(212,175,55,0.08)",
          borderLeft: "3px solid #D4AF37", marginTop: 14, marginBottom: 14,
          borderRadius: "0 4px 4px 0",
        }}>
          <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 12, color: "#9B8B7A", fontWeight: 700,
            letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6,
          }}>Key insight</div>
          <div style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 16, fontWeight: 600, color: "#3A2C1A", fontStyle: "italic", lineHeight: 1.55,
          }}>{section.keyFact}</div>
        </div>
      )}

      {/* Big tappable Read more / close pill */}
      <button onClick={onToggle} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: isExpanded ? "rgba(58,44,26,0.06)" : "rgba(212,175,55,0.12)",
        border: `1px solid ${isExpanded ? "rgba(58,44,26,0.15)" : "rgba(212,175,55,0.4)"}`,
        borderRadius: 20, padding: "8px 16px", cursor: "pointer",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13, fontWeight: 600,
        color: isExpanded ? "#9B8B7A" : "#3A2C1A",
        letterSpacing: 0.3, marginTop: 4, marginBottom: 4,
        minWidth: 110, justifyContent: "center",
      }}>
        {isExpanded ? "− close" : "+ read more"}
      </button>

      {isExpanded && (
        <div style={{ marginTop: 16, marginBottom: 8 }}>
          {section.content.map((block, i) => {
            if (block.type === "para") {
              return (
                <p key={i} style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 19, fontWeight: 500, lineHeight: 1.9,
                  color: "#3A2C1A", margin: "0 0 16px",
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
                    fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 18, fontWeight: 500, fontStyle: "italic",
                    color: "#3A2C1A", margin: "0 0 8px", lineHeight: 1.8,
                  }}>"{block.quote}"</p>
                  <div style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: "#9B8B7A", letterSpacing: 0.4,
                  }}>— {block.attribution}</div>
                </div>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 18, fontWeight: 500, lineHeight: 1.85,
                  color: "#3A2C1A", paddingLeft: 24, margin: "0 0 16px",
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
                    fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 48, fontWeight: 700, color: "#D4AF37",
                  }}>{block.number}</div>
                  <div style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: "#9B8B7A",
                    letterSpacing: 1, textTransform: "uppercase", marginTop: 6,
                  }}>{block.label}</div>
                </div>
              );
            }
            return null;
          })}
          {askJess && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => askJess(section.title)} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(58,44,26,0.06)",
                border: "1px solid rgba(58,44,26,0.15)",
                borderRadius: 20, padding: "8px 18px",
                cursor: "pointer",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 13, fontWeight: 600, color: "#3A2C1A", letterSpacing: 0.3,
              }}>
                <span aria-hidden="true" style={{ fontSize: 15 }}>✦</span>
                Ask Jess about this
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LETTER HISTORY STRIP (Feature 5)
// ════════════════════════════════════════════════════════════════════════════
function LetterHistoryStrip({ currentPhase }) {
  const phases = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];
  return (
    <div style={{
      background: "#E8DBC8",
      borderBottom: "1px solid rgba(58,44,26,0.08)",
      padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 8,
      overflowX: "auto", scrollbarWidth: "none",
      position: "sticky", top: 84, zIndex: 9,
    }}>
      <span style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
        color: "#9B8B7A", whiteSpace: "nowrap", marginRight: 6, fontWeight: 700,
      }}>Past letters</span>
      {phases.map((p) => {
        const on = p === currentPhase;
        return (
          <div key={p} style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 11, fontWeight: 600,
            background: on ? "#3A2C1A" : "transparent",
            color: on ? "#F4EDDB" : "#9B8B7A",
            border: "1px solid rgba(58,44,26,0.15)",
            borderRadius: 14, padding: "5px 14px",
            whiteSpace: "nowrap", opacity: on ? 1 : 0.7,
          }}>{p}</div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NEWS SECTION (Feature 4) — curated cards before sign-off
// ════════════════════════════════════════════════════════════════════════════
function NewsSection({ tabId }) {
  const news = NEWS_BY_TAB[tabId] || [];
  if (!news.length) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <BotanicalDivider />
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9B8B7A",
        marginBottom: 18, fontWeight: 700,
      }}>What's being written about</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {news.map((item, i) => (
          <div key={i} style={{
            borderLeft: "3px solid rgba(212,175,55,0.5)",
            paddingLeft: 16, paddingTop: 6, paddingBottom: 6,
          }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 17, fontWeight: 600, color: "#3A2C1A",
              lineHeight: 1.4, marginBottom: 6,
            }}>{item.headline}</div>
            <div style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 12, color: "#9B8B7A", letterSpacing: 0.3, fontWeight: 600,
            }}>{item.source} · {item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STORY DASHBOARD (Feature 1) — data tiles in place of letter sections
// ════════════════════════════════════════════════════════════════════════════
const TILE = {
  background: "rgba(212,175,55,0.06)",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 8, padding: 18, marginBottom: 14,
};
const TILE_LABEL = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 11, fontWeight: 700,
  letterSpacing: 1.5, textTransform: "uppercase",
  color: "#9B8B7A", marginBottom: 12,
};
function StoryDashboard({ profile, cycle, phase, recentCheckins, recentSymptoms, habits, hydration }) {
  const cycleDay = cycle?.cycleDay || cycle?.dayInCycle || 1;
  const cycleLen = cycle?.cycleLen || cycle?.cycleLength || 28;
  const periodLen = profile?.period_length || profile?.menstrual_length || 5;
  // Build 27-day phase strip centred on today
  const dots = [];
  const startDay = Math.max(1, cycleDay - 13);
  for (let i = 0; i < 27; i++) {
    const d = ((startDay + i - 1) % cycleLen) + 1;
    let p;
    if (d <= periodLen) p = "menstrual";
    else if (d <= Math.floor(cycleLen * 0.43)) p = "follicular";
    else if (d <= Math.floor(cycleLen * 0.5)) p = "ovulatory";
    else p = "luteal";
    dots.push({ day: d, phase: p, isToday: d === cycleDay });
  }
  const phaseColour = {
    follicular: "#8FAF8F",
    ovulatory:  "#D4AF37",
    luteal:     "#E8B4B8",
    menstrual:  "#9B8B7A",
  };

  // 30-day mood + energy series
  const moodSeries = (recentCheckins || []).slice(0, 30).map((c) => Number(c?.mood_score ?? c?.mood)).filter((v) => !Number.isNaN(v));
  const energySeries = (recentCheckins || []).slice(0, 30).map((c) => Number(c?.energy_level ?? c?.energy)).filter((v) => !Number.isNaN(v));

  // Top 3 symptoms last 14 days
  const since = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const sxCounts = {};
  (recentSymptoms || []).forEach((x) => {
    const d = x?.date ? new Date(x.date).getTime() : 0;
    if (d && d < since) return;
    const n = x?.symptom_name || x?.symptom_type;
    if (!n) return;
    sxCounts[n] = (sxCounts[n] || 0) + 1;
  });
  const topSx = Object.entries(sxCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Habit streaks — count consecutive recent days per habit
  const habitDays = {};
  (habits || []).forEach((h) => {
    const n = h?.habit_name || h?.habit_id || "Habit";
    const d = h?.date || h?.day_key || "";
    if (!d) return;
    if (!habitDays[n]) habitDays[n] = new Set();
    habitDays[n].add(d);
  });
  const streaks = Object.entries(habitDays).map(([n, set]) => {
    const sorted = Array.from(set).sort().reverse();
    let streak = 0;
    let prev = null;
    for (const day of sorted) {
      if (prev === null) { streak = 1; prev = new Date(day); continue; }
      const cur = new Date(day);
      const diff = (prev - cur) / (24 * 3600 * 1000);
      if (Math.abs(diff - 1) < 0.5) { streak++; prev = cur; } else break;
    }
    return { name: n, streak };
  }).sort((a, b) => b.streak - a.streak).slice(0, 3);

  // Hydration this week — sum amount_ml from last 7 day_keys
  const today = new Date();
  const week = new Set();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    week.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  const weekHydMl = (hydration || []).filter((h) => week.has(h?.day_key)).reduce((a, h) => a + (Number(h?.amount_ml) || 0), 0);
  const avgMlPerDay = Math.round(weekHydMl / 7);
  const hydTarget = profile?.hydration_target_ml || 2000;

  return (
    <div>
      {/* 1. Cycle calendar */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Your cycle · day {cycleDay}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 8, justifyItems: "center" }}>
          {dots.map((d, i) => (
            <div key={i} title={`Day ${d.day} · ${d.phase}`} style={{
              width: d.isToday ? 16 : 10,
              height: d.isToday ? 16 : 10,
              borderRadius: "50%",
              background: phaseColour[d.phase],
              boxShadow: d.isToday ? "0 0 0 2px #3A2C1A" : "none",
            }} />
          ))}
        </div>
        <div style={{
          marginTop: 12, fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 14, fontWeight: 500, fontStyle: "italic", color: "#3A2C1A",
        }}>
          You're in your {phase} phase. The big dot is today.
        </div>
      </div>

      {/* 2. Mood + Energy sparkline */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Mood &amp; Energy · last 30 days</div>
        {(moodSeries.length || energySeries.length) ? (
          <svg viewBox="0 0 300 70" width="100%" height="70" preserveAspectRatio="none">
            {[moodSeries, energySeries].map((series, i) => {
              if (!series.length) return null;
              const color = i === 0 ? "#E8B4B8" : "#8FAF8F";
              const max = 5;
              const pts = series.slice(0, 30).map((v, idx) => {
                const x = (idx / Math.max(1, Math.min(30, series.length) - 1)) * 300;
                const y = 70 - (Math.max(0, Math.min(max, v)) / max) * 60 - 5;
                return `${x},${y}`;
              }).join(" ");
              return <polyline key={i} points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />;
            })}
          </svg>
        ) : (
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, fontStyle: "italic", color: "#9B8B7A" }}>
            No check-ins logged yet. Today is a good day to start.
          </div>
        )}
        <div style={{ display: "flex", gap: 18, marginTop: 8, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 12, color: "#9B8B7A", fontWeight: 600 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 2, background: "#E8B4B8", marginRight: 6, verticalAlign: "middle" }} />Mood</span>
          <span><span style={{ display: "inline-block", width: 10, height: 2, background: "#8FAF8F", marginRight: 6, verticalAlign: "middle" }} />Energy</span>
        </div>
      </div>

      {/* 3. Top symptoms this phase */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Top symptoms · last 14 days</div>
        {topSx.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topSx.map(([name, n]) => (
              <span key={name} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#3A2C1A", color: "#F4EDDB",
                padding: "6px 12px", borderRadius: 999,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 13, fontWeight: 600,
              }}>
                {String(name).replace(/_/g, " ")}
                <span style={{ background: "rgba(244,237,219,0.18)", borderRadius: 999, padding: "1px 8px", fontSize: 11 }}>{n}×</span>
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, fontStyle: "italic", color: "#9B8B7A" }}>
            Nothing's been logged this fortnight. Track when something feels off — patterns take 2–3 cycles to show.
          </div>
        )}
      </div>

      {/* 4. Habit streaks */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Habit streaks</div>
        {streaks.length ? (
          <div>
            {streaks.map((h, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < streaks.length - 1 ? "1px solid rgba(58,44,26,0.06)" : "none",
              }}>
                <span style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 16, fontWeight: 600, color: "#3A2C1A",
                }}>{String(h.name).replace(/_/g, " ")}</span>
                <span style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: 12, fontWeight: 700, color: "#8FAF8F",
                  background: "rgba(143,175,143,0.15)",
                  padding: "3px 10px", borderRadius: 12,
                }}>{h.streak} day{h.streak === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, fontStyle: "italic", color: "#9B8B7A" }}>
            No habits logged yet. One small daily action repeated is the most valuable line on this page.
          </div>
        )}
      </div>

      {/* 5. Hydration this week */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Hydration this week</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 40, fontWeight: 700, color: "#3A2C1A", lineHeight: 1,
          }}>{avgMlPerDay}</span>
          <span style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 13, color: "#9B8B7A", fontWeight: 600,
          }}>ml / day · target {hydTarget}ml</span>
        </div>
        <div style={{
          marginTop: 10, height: 8, background: "rgba(58,44,26,0.08)", borderRadius: 4, overflow: "hidden",
        }}>
          <div style={{
            width: `${Math.min(100, (avgMlPerDay / hydTarget) * 100)}%`,
            height: "100%", background: "#8FAF8F",
          }} />
        </div>
      </div>
    </div>
  );
}
