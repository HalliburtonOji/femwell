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

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, CircleDot, RefreshCw, Flower2, Leaf, PlusCircle, Sparkles, Check, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import JumpToButton from "@/components/layout/JumpToButton";
// Brand-P2 lush layer (BRAND_IDENTITY §3 heart · §4 botanicals · §5.3 Cycle/Health = phase-hue).
import { T, Heart as BrandHeart } from "@/components/journal/Editorial";
import { VineMotifV2, FlowerGlyph, CardFrame, floraKeyframes, cwOf } from "@/components/brand/flora";

// ════════════════════════════════════════════════════════════════════════════
// TABS
// ════════════════════════════════════════════════════════════════════════════
// ─── LETTERS — 7 consolidated letters. Replaces the old 9-tab TABS array
// because the pill bar didn't scale on mobile. Navigation is now a slider
// (arrows + dots + Library overlay) — see Health() component body.
const LETTERS = [
  { id: "story",       title: "Your Story",          subtitle: "Patterns only you can see",                icon: Sparkles,   botanical: "story" },
  { id: "cycle",       title: "Cycle & Life Stage",  subtitle: "Where you are, and what it means",         icon: Circle,     botanical: "cycle" },
  { id: "body",        title: "Body & Skin",         subtitle: "What your body is telling you",            icon: CircleDot,  botanical: "body" },
  { id: "mind",        title: "Mind & Sleep",        subtitle: "The cycling brain, and rest",              icon: RefreshCw,  botanical: "mind" },
  { id: "nourishment", title: "Nourishment & Gut",   subtitle: "Food, hormones, and your microbiome",       icon: Flower2,    botanical: "nourishment" },
  { id: "intimacy",    title: "Intimacy",            subtitle: "The conversation most apps skip",          icon: Leaf,       botanical: "skin" },
  { id: "care",        title: "Your Care",           subtitle: "Navigate the system like you own it",      icon: PlusCircle, botanical: "care" },
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
// Brand-P2 phase flora (BRAND_IDENTITY §5.1/§5.3 — Cycle/Health = phase-hue + phase-flower).
// Hues are the semantic phase set (§2.4), kept SEPARATE from chrome accents. Used for the
// masthead meaning-bloom, the phase-hue page vines, and the phase-hue card frames.
const PHASE_HUE = { menstrual: "#BC2E27", follicular: "#8FAF8F", ovulatory: "#D4AF37", luteal: "#8E6E8E" };
const PHASE_FLOWER = { menstrual: "poppy", follicular: "snowdrop", ovulatory: "sunflower", luteal: "dahlia" };
const PHASE_CW = { menstrual: "crimson", follicular: "sage", ovulatory: "gold", luteal: "plum" };

// ════════════════════════════════════════════════════════════════════════════
// BOTANICAL MOTIFS — one per tab
// ════════════════════════════════════════════════════════════════════════════
function _TabBotanical({ tabId }) {
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
          <text x="24" y="29" textAnchor="middle" fontSize="16" fontWeight="600" fill="#D4AF37">FW</text>
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
const TabBotanical = memo(_TabBotanical);

// Tiny helper for the TOC — capped at X so it stays simple in this UI.
const romanize = (n) => ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n] || String(n + 1);

const BotanicalDivider = memo(function BotanicalDivider() {
  return (
    <div style={{ textAlign: "center", margin: "36px 0", opacity: 0.7 }} aria-hidden="true">
      <svg width="200" height="32" viewBox="0 0 200 32" fill="none">
        <line x1="0"   y1="16" x2="72"  y2="16" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
        <line x1="72"  y1="16" x2="82"  y2="8"  stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <line x1="72"  y1="16" x2="82"  y2="24" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <ellipse cx="100" cy="16" rx="6" ry="12" fill="#8FAF8F" opacity="0.5"  transform="rotate(-30 100 16)" />
        <ellipse cx="100" cy="16" rx="6" ry="12" fill="#8FAF8F" opacity="0.35" transform="rotate(30 100 16)" />
        <circle  cx="100" cy="16" r="3"   fill="#D4AF37" opacity="0.8" />
        <line x1="118" y1="16" x2="128" y2="8"  stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <line x1="118" y1="16" x2="128" y2="24" stroke="#8FAF8F" strokeWidth="0.75" opacity="0.6" />
        <line x1="128" y1="16" x2="200" y2="16" stroke="#D4AF37" strokeWidth="0.75" opacity="0.5" />
        <circle cx="72"  cy="16" r="2" fill="#D4AF37" opacity="0.5" />
        <circle cx="128" cy="16" r="2" fill="#D4AF37" opacity="0.5" />
      </svg>
    </div>
  );
});

// ════════════════════════════════════════════════════════════════════════════
// ROSEBUD READING PROGRESS — opens as the user scrolls
// ════════════════════════════════════════════════════════════════════════════
const RosebudProgress = memo(function RosebudProgress({ scrollPct }) {
  const openness = Math.max(0, Math.min(1, scrollPct / 100));
  const fullyBloomed = openness >= 0.96;
  return (
    <div
      data-rosebud-progress="true"
      style={{
        position: "fixed", bottom: 96, right: 18, opacity: 0.75, zIndex: 30,
        pointerEvents: "none", textAlign: "center",
      }}
      aria-hidden="true"
    >
      <svg width="32" height="44" viewBox="0 0 24 32" fill="none">
        <line x1="12" y1="32" x2="12" y2="18" stroke="#8FAF8F" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx={4 + openness * 5} ry={8 + openness * 4} fill="#E8B4B8" opacity={0.35 + openness * 0.4} />
        <ellipse cx="12" cy="12" rx={4 + openness * 5} ry={8 + openness * 4} fill="#E8B4B8" opacity={0.3  + openness * 0.35} transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx={4 + openness * 5} ry={8 + openness * 4} fill="#E8B4B8" opacity={0.3  + openness * 0.35} transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r={2 + openness * 2} fill="#D4AF37" opacity={0.65 + openness * 0.3} />
      </svg>
      {fullyBloomed && (
        <div style={{
          marginTop: 4,
          fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
          color: "#8FAF8F", whiteSpace: "nowrap",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          You've read it all <Check size={11} strokeWidth={2.5} aria-hidden="true" />
        </div>
      )}
    </div>
  );
});

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
    { headline: "Why women's health research has a data gap — and what's changing", source: "The Guardian", date: "May 2026", url: "https://www.theguardian.com/society/womens-health" },
    { headline: "The case for tracking your cycle as a vital sign", source: "BMJ", date: "Apr 2026", url: "https://www.bmj.com/content/378/bmj.o1947" },
  ],
  cycle: [
    { headline: "New research links cycle length variability to long-term cardiovascular risk", source: "NEJM", date: "May 2026", url: "https://www.nejm.org/medical-research" },
    { headline: "PMDD: the diagnosis 5% of women have and most don't know about", source: "BBC Health", date: "Apr 2026", url: "https://www.nhs.uk/mental-health/conditions/premenstrual-dysphoric-disorder/" },
  ],
  body: [
    { headline: "Endometriosis diagnosis delay falls to 6 years in UK — still too long, say specialists", source: "Endometriosis UK", date: "May 2026", url: "https://www.endometriosis-uk.org/endometriosis-facts-and-figures" },
    { headline: "Iron deficiency without anaemia: the diagnosis GPs keep missing", source: "BMJ Open", date: "Apr 2026", url: "https://www.nhs.uk/conditions/iron-deficiency-anaemia/" },
  ],
  mind: [
    { headline: "ADHD in women peaks at perimenopause — researchers demand better clinical protocols", source: "Nature Medicine", date: "May 2026", url: "https://www.nice.org.uk/guidance/ng87" },
    { headline: "The luteal phase and anxiety: what the neuroscience finally confirms", source: "Neuropsychopharmacology", date: "Mar 2026", url: "https://joinzoe.com/learn/mental-health" },
  ],
  nourishment: [
    { headline: "Magnesium and period pain: a meta-analysis of 14 trials", source: "Nutrients", date: "Apr 2026", url: "https://www.nhs.uk/conditions/vitamins-and-minerals/others/" },
    { headline: "The estrobolome: how gut bacteria control oestrogen recycling", source: "Cell Host & Microbe", date: "May 2026", url: "https://joinzoe.com/learn/gut-health-women" },
  ],
  care: [
    { headline: "Cervical screening uptake hits 20-year low in UK", source: "NHS England", date: "May 2026", url: "https://www.nhs.uk/conditions/cervical-screening/" },
    { headline: "Women wait 65% longer for diagnosis — what the data shows and what to do", source: "BMJ", date: "Apr 2026", url: "https://www.bmj.com/about-bmj/equity-diversity-and-inclusion" },
  ],
  intimacy: [
    { headline: "The oral contraceptive pill and libido: what the evidence actually shows", source: "The Lancet", date: "Apr 2026", url: "https://www.nhs.uk/conditions/contraception/combined-contraceptive-pill/" },
    { headline: "Genitourinary syndrome of menopause: the condition 50% of women have and can't name", source: "BJOG", date: "May 2026", url: "https://www.nhs.uk/conditions/menopause/symptoms/" },
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

const JessObservationCard = memo(function JessObservationCard({ letterId, profile, recentSymptoms, cycle, phase }) {
  const observations = getJessObservations(letterId, profile, recentSymptoms, cycle, phase);
  if (!observations || !observations.length) return null;
  // Trim to 3 max — Jess's brief should feel curated, not a list.
  const top = observations.slice(0, 3);
  // Brand-P2: phase-hue corner frame (§4.2) — lush layer over the letter's Jess card.
  const frameHue = PHASE_HUE[phase] || "#A8893F";
  return (
    <div style={{
      background: "rgba(58,44,26,0.04)",
      border: "1px solid rgba(58,44,26,0.1)",
      borderRadius: 8, padding: "16px 18px", marginBottom: 24,
      position: "relative", overflow: "hidden",
    }}>
      <CardFrame variant="sprig" color={frameHue} size={42} opacity={0.5} />
      <div style={{ position: "relative", zIndex: 1 }}>
      {/* Header — gold circle chip + "Jess noticed" + subtitle */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 14, paddingBottom: 12,
        borderBottom: "1px solid rgba(212,175,55,0.2)",
      }}>
        <div aria-hidden="true" style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(212,175,55,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#D4AF37", flexShrink: 0,
        }}><Sparkles size={14} strokeWidth={1.75} /></div>
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#3A2C1A", letterSpacing: 0.5,
          }}>Jess noticed</div>
          <div style={{
            fontSize: 10, color: "#9B8B7A",
          }}>Based on your recent activity</div>
        </div>
      </div>

      {/* Observations — diamond bullets in gold + italic Cormorant body */}
      {top.map((o, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          marginBottom: i < top.length - 1 ? 10 : 0,
        }}>
          <span aria-hidden="true" style={{
            color: "#D4AF37", fontSize: 14, marginTop: 4, flexShrink: 0,
          }}>◆</span>
          <p style={{
            fontSize: 16, fontWeight: 500, color: "#3A2C1A",
            lineHeight: 1.7, fontStyle: "italic", margin: 0,
          }}>{o}</p>
        </div>
      ))}
      </div>
    </div>
  );
});

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
          fontSize: 12.5, fontStyle: "normal", lineHeight: 1.5,
          width: 220, zIndex: 30,
          boxShadow: "0 3px 14px rgba(40,30,18,0.16)", textAlign: "left",
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

  // ── GP question builder + saved notes + toast (new feature batch) ──
  const [gpQuestions, setGpQuestions] = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.sessionStorage.getItem("gp_questions") || "[]"); }
    catch { return []; }
  });
  const [gpSheetOpen, setGpSheetOpen] = useState(false);
  const [healthNotes, setHealthNotes] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = useCallback((text) => {
    setToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  }, []);
  // Persist GP questions whenever the list changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.sessionStorage.setItem("gp_questions", JSON.stringify(gpQuestions)); }
    catch { /* private mode */ }
  }, [gpQuestions]);

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
        const prof = profiles?.[0] || u || null;
        setProfile(prof);
        // Seed in-memory health notes from profile (if the field exists)
        setHealthNotes(Array.isArray(prof?.health_notes) ? prof.health_notes : []);
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
  // Brand-P2 phase flora for this letter (vines + masthead bloom).
  const phaseHue = PHASE_HUE[phase] || T.gold;
  const phaseCw = cwOf(PHASE_CW[phase] || "sage");
  const phaseFlower = PHASE_FLOWER[phase] || "snowdrop";

  // ─── Letter navigation helpers — instant, no animation.
  // We had a slide-out animation here but it left the paper at opacity 0
  // (forwards keyframe to opacity: 0 with no in-animation), which made
  // navigation feel broken. Instant updates are better than half-broken
  // transitions. ───
  // Memoised navigation handlers. goNext/goPrev use the functional updater so
  // they don't depend on letterIndex — stable identity means children can
  // safely React.memo without busted memoisation.
  const goToLetter = useCallback((i) => {
    if (i < 0 || i >= LETTERS.length) return;
    setLetterIndex(i);
    setExpanded({});
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    }
  }, []);
  const goNext = useCallback(() => {
    setLetterIndex((i) => {
      const ni = Math.min(LETTERS.length - 1, i + 1);
      if (ni !== i) {
        setExpanded({});
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
        }
      }
      return ni;
    });
  }, []);
  const goPrev = useCallback(() => {
    setLetterIndex((i) => {
      const ni = Math.max(0, i - 1);
      if (ni !== i) {
        setExpanded({});
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
        }
      }
      return ni;
    });
  }, []);
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

  // ─── Scroll progress for rosebud — rAF-throttled.                ───
  // Scroll fires hundreds of times per frame; bare setState was the      //
  // single biggest source of mid-scroll jank. We now coalesce all events //
  // into the next animation frame so we recompute at most once per paint.//
  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = letterRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const vh = window.innerHeight || document.documentElement.clientHeight;
          const total = el.offsetHeight + vh;
          const seen = vh - rect.top;
          const pct = Math.max(0, Math.min(100, (seen / total) * 100));
          setScrollPct(pct);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ─── Sections start collapsed on every tab change. The reader chooses
  // what to open — the letter reads as scannable summaries first. ───
  useEffect(() => {
    setExpanded({});
  }, [activeTab]);

  const tab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const tabContent = HEALTH_CONTENT[activeTab] || HEALTH_CONTENT.overview;
  const sections = tabContent.sections || [];

  // Memoised toggle / toggleAll — stable identity means child sections   //
  // don't re-render every time the parent renders for some unrelated     //
  // reason (e.g. scroll progress updating).                              //
  const toggle = useCallback(
    (id) => setExpanded((p) => ({ ...p, [id]: !p[id] })),
    []
  );
  const allExpanded = sections.length > 0 && sections.every((s) => expanded[s.id]);
  const toggleAll = useCallback(() => {
    setExpanded((prev) => {
      const wasAllOpen = sections.length > 0 && sections.every((s) => prev[s.id]);
      if (wasAllOpen) return {};
      const next = {};
      sections.forEach((s) => { next[s.id] = true; });
      return next;
    });
  }, [sections]);

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

  // Relationship tier — inlined here so its const is in scope when the
  // opener below reads it. (Earlier I placed the memo below this line and
  // hit a TDZ ReferenceError on production.)
  const _createdAt = profile?.created_at || profile?.created_date;
  const _daysSinceSignup = _createdAt && !Number.isNaN(new Date(_createdAt).getTime())
    ? Math.floor((Date.now() - new Date(_createdAt).getTime()) / (24 * 3600 * 1000))
    : 0;
  const relationshipTier = _daysSinceSignup >= 90 ? "deep" : _daysSinceSignup >= 30 ? "established" : "new";
  const tierPreface = relationshipTier === "new"
    ? "Welcome to your Health Corner. "
    : relationshipTier === "established"
      ? "You've been tracking for a few weeks now — patterns are beginning to show. "
      : "You know your body well by now. ";

  // Layer the relationship-tier preface in front of the phase opener, then
  // append the data-aware cycle-day + top-symptom riffs (only for non-Story
  // letters — Story uses data tiles instead of prose).
  let opener = (activeTab !== "story" ? tierPreface : "") + baseOpener;
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
  const askJess = useCallback((sectionTitle) => {
    const prompt = `I'm reading about "${sectionTitle}" in my ${tab.label} health letter. Can you tell me more about how this applies to my cycle and life stage?`;
    try { sessionStorage.setItem("jess_initial_prompt", prompt); } catch (_) {}
    window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: { initialPrompt: prompt } }));
    navigate("/Assistant");
  }, [tab.label, navigate]);

  // ── GP question builder — save a key insight as a clinical question.
  const saveForGp = useCallback((text, sectionTitle) => {
    if (!text || typeof text !== "string") return;
    setGpQuestions((prev) => {
      // Dedupe by text content.
      if (prev.some((q) => q.text === text)) {
        showToast("Already on your GP list");
        return prev;
      }
      const next = [...prev, { text, sectionTitle, letterTitle: tab.label, savedAt: new Date().toISOString() }];
      showToast("Saved for your GP list");
      return next;
    });
  }, [tab.label, showToast]);

  // ── Health notes — long-press a paragraph to save it.
  const saveNote = useCallback(async (text, sectionTitle) => {
    if (!text || typeof text !== "string") return;
    const note = { text, sectionTitle, letterTitle: tab.label, savedAt: new Date().toISOString() };
    setHealthNotes((prev) => [...prev, note]);
    showToast("Saved to your health notes");
    // Persist to UserProfile if we have one — fire and forget; UI is optimistic.
    try {
      if (profile?.id) {
        const merged = [...(Array.isArray(profile.health_notes) ? profile.health_notes : []), note];
        await base44.entities.UserProfile.update(profile.id, { health_notes: merged });
      }
    } catch (_) { /* schema may not include health_notes yet — silent fail */ }
  }, [tab.label, profile, showToast]);

  // ── Hand the GP list off to /DoctorExport and navigate there.
  const sendGpToExport = useCallback(() => {
    try { sessionStorage.setItem("gp_draft_questions", JSON.stringify(gpQuestions)); } catch (_) {}
    setGpSheetOpen(false);
    navigate("/DoctorExport?preset=full");
  }, [gpQuestions, navigate]);

  // (Relationship tier + preface are inlined above where the opener is
  // composed, since the opener reads them.)

  // Trigger window.print(). The @media print CSS below hides chrome.
  const printLetter = useCallback(() => {
    if (typeof window === "undefined") return;
    // Force-expand all sections so the print captures everything.
    if (sections?.length) {
      const all = {};
      sections.forEach((s) => { all[s.id] = true; });
      setExpanded(all);
    }
    window.requestAnimationFrame(() => window.print());
  }, [sections]);

  const isStory = activeTab === "story";

  return (
    <div
      className="health-page"
      style={{
        background: "transparent", minHeight: "100vh", paddingBottom: 80,
        touchAction: "manipulation", position: "relative",
      }}
    >
      {/* Page-wide perf CSS — kill the 300ms tap delay + tap highlight,  */}
      {/* plus the @media print rules so users can save a clean PDF.      */}
      <style>{`
        .health-page * { -webkit-tap-highlight-color: transparent; }
        .health-page button,
        .health-page a { touch-action: manipulation; }
        @media print {
          .hc-no-print { display: none !important; }
          .health-page { background: #fff !important; box-shadow: none !important; padding: 0 !important; }
          .hc-letter-paper {
            transform: none !important;
            box-shadow: none !important;
            max-width: none !important;
            padding: 24px 16px !important;
            background: #fff !important;
            border: none !important;
            page-break-inside: avoid;
          }
          .hc-letter-paper * { color: #000 !important; }
          .hc-letter-paper [aria-hidden="true"] { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* ─── Brand-P2 botanical page texture ─── */}
      {/* Phase-hue vines (§5.3 Cycle/Health = phase-hue), one per fold, hairline + */}
      {/* low-opacity, clipped to the page and held BEHIND all content (zIndex 0).   */}
      {/* The letter paper covers the centre; these warm the gutters/top/bottom so   */}
      {/* the page reads lush around the restrained letter without competing with it. */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <style>{floraKeyframes}</style>
        <div style={{ position: "absolute", top: 180, right: -28 }}><VineMotifV2 color={phaseHue} color2={T.gold} opacity={0.1} w={144} /></div>
        <div style={{ position: "absolute", top: 900, left: -30 }}><VineMotifV2 color={T.gold} color2={phaseHue} opacity={0.08} w={136} flip /></div>
        <div style={{ position: "absolute", top: 1640, right: -24 }}><VineMotifV2 color={phaseHue} color2={T.gold} opacity={0.08} w={136} /></div>
      </div>

      {/* ─── Sticky letter-nav (espresso header + cream letter strip) ───  */}
      {/* This is the ONLY navigation chrome at the top of /Health.        */}
      {/* The older inert pill bar (onClick called undefined setActiveTab) */}
      {/* is gone — its replacement, the cream strip below, is wired to   */}
      {/* goToLetter(i) so tapping any letter actually navigates.          */}
      <div className="hc-no-print" style={{ position: "sticky", top: 0, zIndex: 11 }}>
        {/* Row 1 — current letter title + bold gold All letters CTA */}
        <div style={{
          background: "#3A2C1A",
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 17, fontWeight: 700, color: "#F4EDDB",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              <span aria-hidden="true" style={{ display: "inline-flex", verticalAlign: "middle" }}>{(() => { const Ic = currentLetter.icon; return <Ic size={16} strokeWidth={1.75} />; })()}</span> {currentLetter.title}
            </div>
            <div style={{
              fontSize: 10, color: "rgba(244,237,219,0.55)",
              letterSpacing: 0.5, marginTop: 1,
            }}>
              {letterIndex + 1} of {LETTERS.length}
            </div>
          </div>
          {/* Print / Save as PDF — small icon button to the left of All letters */}
          <button
            onClick={printLetter}
            aria-label="Print or save this letter as PDF"
            title="Print or save as PDF"
            style={{
              background: "rgba(244,237,219,0.12)",
              border: "1px solid rgba(244,237,219,0.25)",
              borderRadius: 8, width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="#F4EDDB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="6" y="14" width="12" height="8" rx="1" stroke="#F4EDDB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Shared "Jump to" pill — identical chrome across Journal/Community/Nutrition/Health */}
          <JumpToButton onClick={() => setShowLibrary(true)} />
        </div>
        {/* Row 2 — phase / day / life stage strip */}
        <div style={{
          background: "rgba(58,44,26,0.85)",
          padding: "5px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 11, color: "rgba(244,237,219,0.7)", letterSpacing: 0.5,
          }}>
            {phaseLbl}{cycle?.cycleDay ? ` · Day ${cycle.cycleDay}` : ""} · {stageLbl}
          </span>
        </div>
        {/* Row 3 — cream scrollable letter strip (the working version).   */}
        {/* The old strip used setActiveTab which doesn't exist; this one  */}
        {/* calls goToLetter(i) directly so taps land. Active letter gets  */}
        {/* a gold underline + Cormorant 700, idle letters fade to mauve.  */}
        <div style={{
          background: "var(--surface)",
          borderBottom: "1px solid rgba(58,44,26,0.10)",
          display: "flex",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
          {LETTERS.map((L, i) => {
            const on = i === letterIndex;
            const Ic = L.icon;
            return (
              <button
                key={L.id}
                onClick={() => goToLetter(i)}
                aria-label={`Jump to ${L.title}`}
                aria-current={on ? "true" : "false"}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "10px 16px",
                  borderBottom: on ? "2px solid #D4AF37" : "2px solid transparent",
                  fontSize: 16,
                  fontWeight: on ? 700 : 500,
                  color: on ? "#3A2C1A" : "rgba(58,44,26,0.45)",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  flexShrink: 0,
                }}
              >
                <span aria-hidden="true" style={{ display: "inline-flex" }}><Ic size={16} strokeWidth={1.75} /></span>
                <span>{L.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Letter history strip (Feature 5) ─── */}
      <div className="hc-no-print" style={{ position: "relative", zIndex: 1 }}>
        <LetterHistoryStrip currentPhase={phaseLbl} />
      </div>

      {/* ─── Letter paper card with side-arrow slider nav ─── */}
      <div style={{ padding: "24px 8px 24px", position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto" }}>
        {/* Left arrow */}
        {letterIndex > 0 && (
          <button className="hc-no-print" onClick={goPrev} aria-label="Previous letter" style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
            background: "rgba(58,44,26,0.10)", border: "1px solid rgba(58,44,26,0.18)",
            borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 20, pointerEvents: "auto",
            fontSize: 22, color: "#3A2C1A", fontWeight: 600, paddingBottom: 2,
          }}>‹</button>
        )}
        {/* Right arrow */}
        {letterIndex < LETTERS.length - 1 && (
          <button className="hc-no-print" onClick={goNext} aria-label="Next letter" style={{
            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
            background: "rgba(58,44,26,0.10)", border: "1px solid rgba(58,44,26,0.18)",
            borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 20, pointerEvents: "auto",
            fontSize: 22, color: "#3A2C1A", fontWeight: 600, paddingBottom: 2,
          }}>›</button>
        )}
        <article ref={letterRef}
          className="hc-letter-paper"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
          background: "var(--surface)",
          maxWidth: 680, margin: "0 auto",
          padding: "52px 56px 64px",
          borderRadius: 2,
          transform: "rotate(-0.3deg)",
          position: "relative",
          // Promote to its own compositing layer so the article doesn't repaint
          // on every parent state change.
          willChange: "transform",
          // 3 shadow layers (was 5) — same look, half the paint cost.
          boxShadow: [
            "4px 4px 0 -1px #EAE0C8",
            "0 12px 40px rgba(58,44,26,0.16)",
            "inset 0 1px 0 rgba(255,255,255,0.8)",
          ].join(", "),
        }}>
          {/* Inner warm gradient overlay (visual texture only) */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "transparent",
            borderRadius: 2,
          }} />

          {/* Paper noise overlay — restored as a STATIC tiling SVG data-  */}
          {/* URI. Browser rasterises this once and tiles the image; there */}
          {/* is no live feTurbulence pass on scroll/repaint. Same look as */}
          {/* the old live filter, ~0% mobile paint cost.                  */}
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0,
            borderRadius: 2,
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.18'/></svg>\")",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            mixBlendMode: "multiply",
            pointerEvents: "none",
            opacity: 0.45,
            zIndex: 0,
          }} />

          {/* ── Letterhead ── */}
          <div style={{ borderBottom: "1px solid rgba(58,44,26,0.12)", paddingBottom: 24, marginBottom: 32, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <TabBotanical tabId={tab.id} />
            </div>
            {/* Thin gold rule beneath the botanical — old-letter flourish. */}
            <div aria-hidden="true" style={{
              width: 48, height: 1, background: "#D4AF37", opacity: 0.4,
              margin: "8px auto 12px",
            }} />
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: "var(--mauve)", textTransform: "uppercase" }}>
                FemWell Health Letter
              </div>
              {/* Static script page-title (Halli's bar: every page opens with the carved script). */}
              {/* Brand-P2: the single carved crimson heart (§3) + a flanking phase meaning-bloom (§5.3). */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
                <BrandHeart size={15} />
                <h1 className="fw-display" style={{ margin: 0 }}>Health</h1>
                <FlowerGlyph variant={phaseFlower} size={22} color={phaseCw.petal} color2={phaseCw.tip} accent={phaseCw.accent} idx="hc-hdr" />
              </div>
              <div className="fw-heading" style={{ marginTop: 2 }}>
                {tab.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--mauve)", marginTop: 6 }}>
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
            <div style={{ fontSize: 22, fontWeight: 600, color: "#3A2C1A", marginBottom: 16, fontStyle: "italic" }}>
              Dear {name},
            </div>
            <p style={{
              fontSize: 19, fontWeight: 500, lineHeight: 1.9, color: "#3A2C1A", margin: "0 0 16px",
            }}>
              <span style={{
                float: "left", fontSize: 80, lineHeight: "0.75",
                marginRight: 10, marginTop: 6,
                fontWeight: 700, color: "#3A2C1A",
              }}>{opener.charAt(0)}</span>
              {opener.slice(1)}
            </p>
          </div>

          {!isStory && (<>{/* ── Table of Contents ── */}
          <div style={{
            border: "1.5px solid rgba(212,175,55,0.4)", borderRadius: 8,
            padding: "20px 24px", marginBottom: 32,
            background: "rgba(212,175,55,0.05)", position: "relative", overflow: "hidden",
          }}>
            {/* Brand-P2: phase-hue corner frame (§4.2) on the "In this letter" card. */}
            <CardFrame variant="sprig" color={phaseHue} size={44} opacity={0.45} />
            <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, paddingBottom: 12,
              borderBottom: "1px solid rgba(212,175,55,0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{
                  fontSize: 18, fontWeight: 700, color: "#3A2C1A", letterSpacing: 0.5,
                }}>In this letter</span>
                <span style={{
                  fontSize: 10, color: "#9B8B7A", letterSpacing: 0.3,
                }}>
                  ~{Math.ceil(sections.length * 1.5)} min read
                </span>
              </div>
              <button onClick={toggleAll} style={{
                background: "none", border: "1px solid rgba(58,44,26,0.2)",
                borderRadius: 14, padding: "5px 14px", cursor: "pointer",
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
                display: "flex", alignItems: "baseline", gap: 10,
                padding: "7px 0", textDecoration: "none",
                borderBottom: i < sections.length - 1 ? "1px solid rgba(58,44,26,0.06)" : "none",
              }}>
                <span style={{
                  fontSize: 13, color: "#D4AF37", fontStyle: "italic",
                  minWidth: 20, textAlign: "left",
                }}>{romanize(i)}</span>
                <span style={{
                  fontSize: 17, fontWeight: 600, color: "#3A2C1A",
                  flex: 1, lineHeight: 1.3,
                }}>{s.title}</span>
                {expanded[s.id] && <Check size={12} strokeWidth={2.5} style={{ color: "#8FAF8F", flexShrink: 0 }} aria-hidden="true" />}
              </a>
            ))}
            </div>
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
                onSaveForGp={saveForGp}
                onSaveNote={saveNote}
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

          {/* ── GP question builder CTA — sticky in the article above the */}
          {/* sign-off so it's the last action before the close. Hidden    */}
          {/* from print so the saved letter looks clean.                  */}
          <div className="hc-no-print" style={{ marginTop: 32 }}>
            <button
              onClick={() => setGpSheetOpen(true)}
              aria-label="Open my GP question list"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "#3A2C1A",
                border: "1px solid #D4AF37",
                borderRadius: 24, padding: "12px 20px",
                cursor: "pointer",
                fontSize: 13, fontWeight: 700, color: "#F4EDDB", letterSpacing: 0.3,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="#D4AF37" strokeWidth="1.5"/>
                <line x1="8" y1="8" x2="16" y2="8" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="16" x2="13" y2="16" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Build my GP question list
              {gpQuestions.length > 0 && (
                <span style={{
                  background: "#D4AF37", color: "#3A2C1A",
                  borderRadius: 999, padding: "1px 8px",
                  fontSize: 11, fontWeight: 700,
                }}>{gpQuestions.length}</span>
              )}
            </button>
          </div>

          {/* ── Sign-off ── */}
          <BotanicalDivider />
          <div style={{ marginTop: 28, position: "relative" }}>
            {/* Thin charcoal flourish line above the salutation. */}
            <div aria-hidden="true" style={{
              width: 80, height: 1, background: "rgba(58,44,26,0.15)",
              margin: "0 0 20px",
            }} />
            <div style={{ fontSize: 17, fontWeight: 500, color: "#3A2C1A", marginBottom: 4 }}>
              With care,
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#3A2C1A", fontStyle: "italic" }}>
              {(SIGNATURES[activeTab] || SIGNATURES.overview).name}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#9B8B7A", letterSpacing: 0.5, marginTop: 4, marginBottom: 20 }}>
              {(SIGNATURES[activeTab] || SIGNATURES.overview).role}
            </div>
            {/* FW wax-seal mark — small circular gold monogram. */}
            <div data-fw-seal="true" aria-hidden="true" style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#D4AF37",
              letterSpacing: 0.5,
            }}>FW</div>
          </div>

          {/* ── P.S. ── */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(58,44,26,0.10)", position: "relative" }}>
            <p style={{
              fontSize: 17, fontWeight: 500, fontStyle: "italic",
              color: "#3A2C1A", lineHeight: 1.8, margin: 0,
            }}>
              <strong style={{ fontStyle: "normal", fontWeight: 600 }}>P.S.</strong> — {dynamicPostscript}
            </p>
          </div>

          {/* ── In-paper disclaimer ── */}
          <div style={{ marginTop: 16, fontSize: 10, color: "#9B8B7A", letterSpacing: 0.4, fontStyle: "italic", position: "relative" }}>
            This letter is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for personal health decisions.
          </div>
        </article>
      </div>

      {/* ─── Dot indicators ─── */}
      <div className="hc-no-print" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 0, padding: "16px 12px 20px", background: "var(--ivory)",
      }}>
        {LETTERS.map((L, i) => (
          <button
            key={i}
            onClick={() => goToLetter(i)}
            aria-label={L.title}
            style={{
              width: i === letterIndex ? 32 : 10,
              height: 10,
              minWidth: 10,
              borderRadius: 5,
              background: i === letterIndex ? "#3A2C1A" : "rgba(58,44,26,0.25)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              margin: "8px 3px",
              transition: "all 0.2s ease",
            }}
          />
        ))}
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
              background: "var(--surface)", width: "100%", borderRadius: "18px 18px 0 0",
              padding: "20px 16px 36px", maxHeight: "82vh", overflowY: "auto",
            }}
          >
            {/* Header — shared eyebrow "Your Health" + big "Jump to" (matches the other hub sheets) */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20, paddingBottom: 14,
              borderBottom: "1px solid rgba(58,44,26,0.12)",
            }}>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: "uppercase", color: "#9B8B7A", marginBottom: 2,
                }}>Your Health</div>
                <div style={{
                  fontSize: 22, fontWeight: 700, color: "#3A2C1A",
                }}>Jump to</div>
              </div>
              <button
                onClick={() => setShowLibrary(false)}
                aria-label="Close"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#9B8B7A", padding: 4, display: "inline-flex", lineHeight: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {LETTERS.map((L, i) => {
                const on = i === letterIndex;
                const Ic = L.icon;
                return (
                  <button key={L.id} onClick={() => { goToLetter(i); setShowLibrary(false); }} style={{
                    background: on ? "#3A2C1A" : "var(--surface)",
                    border: `1.5px solid ${on ? "#D4AF37" : "rgba(212,175,55,0.3)"}`,
                    borderRadius: 10, padding: "16px 14px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ marginBottom: 6, color: on ? "#F4EDDB" : "#3A2C1A" }} aria-hidden="true"><Ic size={22} strokeWidth={1.75} /></div>
                    <div style={{
                      fontSize: 16, fontWeight: 700,
                      color: on ? "#F4EDDB" : "#3A2C1A",
                      marginBottom: 3, lineHeight: 1.2,
                    }}>{L.title}</div>
                    <div style={{
                      fontSize: 10, color: on ? "rgba(244,237,219,0.55)" : "#9B8B7A",
                      lineHeight: 1.4,
                    }}>{L.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Rosebud scroll progress ── ── */}
      <div className="hc-no-print"><RosebudProgress scrollPct={scrollPct} /></div>

      {/* ── Bottom not-medical-advice strip ── */}
      <div className="hc-no-print" style={{
        background: "#3A2C1A", color: "rgba(244,237,219,0.6)",
        padding: "12px 20px", textAlign: "center",
        fontSize: 10, letterSpacing: 0.5,
      }}>
        This content is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for personalised health decisions.
      </div>

      {/* ─── GP question builder bottom sheet ─── */}
      {gpSheetOpen && (
        <div
          className="hc-no-print"
          onClick={() => setGpSheetOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(58,44,26,0.7)",
            zIndex: 100, display: "flex", alignItems: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#F4EDDB", width: "100%",
              borderRadius: "16px 16px 0 0",
              padding: "24px 18px 28px",
              maxHeight: "85vh", overflowY: "auto",
              paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0))",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 14, paddingBottom: 12,
              borderBottom: "1px solid rgba(58,44,26,0.12)",
            }}>
              <div>
                <div style={{
                  fontSize: 22, fontWeight: 700, color: "#3A2C1A",
                }}>Your GP question list</div>
                <div style={{
                  fontSize: 11, color: "#9B8B7A", marginTop: 2,
                }}>
                  {gpQuestions.length} saved insight{gpQuestions.length === 1 ? "" : "s"} · {healthNotes.length} note{healthNotes.length === 1 ? "" : "s"}
                </div>
              </div>
              <button
                onClick={() => setGpSheetOpen(false)}
                aria-label="Close GP question list"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 22, color: "#3A2C1A", padding: 4,
                }}
              >×</button>
            </div>

            {/* Saved insights → reframed as clinical questions */}
            {gpQuestions.length === 0 && healthNotes.length === 0 ? (
              <div style={{
                fontSize: 16, fontStyle: "italic", color: "#9B8B7A",
                padding: "16px 4px",
              }}>
                Nothing here yet. Tap "Save for GP +" on any key insight callout, or long-press a paragraph to capture it as a note.
              </div>
            ) : null}

            {gpQuestions.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "#9B8B7A", marginBottom: 8,
                }}>Questions to ask</div>
                {gpQuestions.map((q, i) => (
                  <div key={i} style={{
                    padding: "12px 14px",
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: 8, marginBottom: 8,
                  }}>
                    <div style={{
                      fontSize: 10, color: "#D4AF37", fontWeight: 700,
                      letterSpacing: 1, textTransform: "uppercase", marginBottom: 4,
                    }}>{q.letterTitle} · {q.sectionTitle}</div>
                    <div style={{
                      fontSize: 15, fontWeight: 600, color: "#3A2C1A",
                      lineHeight: 1.5, marginBottom: 6,
                    }}>
                      "I read that {String(q.text).replace(/^["“]|["”]$/g, "")}" — could this be relevant for me?
                    </div>
                    <button
                      onClick={() => setGpQuestions((prev) => prev.filter((_, j) => j !== i))}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 11, color: "#9B8B7A", padding: 0,
                      }}
                    >Remove</button>
                  </div>
                ))}
              </div>
            )}

            {healthNotes.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "#9B8B7A", marginBottom: 8,
                }}>Your saved notes</div>
                {healthNotes.map((n, i) => (
                  <div key={i} style={{
                    padding: "10px 14px",
                    background: "rgba(58,44,26,0.04)",
                    border: "1px solid rgba(58,44,26,0.1)",
                    borderRadius: 8, marginBottom: 8,
                  }}>
                    <div style={{
                      fontSize: 10, color: "#9B8B7A", letterSpacing: 0.5, marginBottom: 4,
                    }}>{n.letterTitle} · {n.sectionTitle}</div>
                    <div style={{
                      fontSize: 14, color: "#3A2C1A", lineHeight: 1.5,
                    }}>{n.text.length > 200 ? n.text.slice(0, 200) + "…" : n.text}</div>
                  </div>
                ))}
              </div>
            )}

            {gpQuestions.length > 0 && (
              <button
                onClick={sendGpToExport}
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "#3A2C1A", color: "#F4EDDB",
                  border: "1px solid #D4AF37", borderRadius: 12,
                  fontSize: 14, fontWeight: 700, letterSpacing: 0.3,
                  cursor: "pointer",
                }}
              >Send to GP Export →</button>
            )}
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div
          className="hc-no-print"
          role="status"
          style={{
            position: "fixed", bottom: 110, left: "50%",
            transform: "translateX(-50%)",
            background: "#3A2C1A", color: "#F4EDDB",
            padding: "10px 18px", borderRadius: 999,
            fontSize: 13, fontWeight: 600, letterSpacing: 0.3,
            boxShadow: "0 3px 14px rgba(40,30,18,0.16)",
            zIndex: 120,
          }}
        >
          {toast} <Check size={13} strokeWidth={2.5} aria-hidden="true" style={{ marginLeft: 4, verticalAlign: "middle" }} />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LETTER SECTION
// ════════════════════════════════════════════════════════════════════════════
const LetterSection = memo(function LetterSection({ section, isExpanded, onToggle, askJess, onSaveForGp, onSaveNote }) {
  // Long-press support on paragraphs — touchstart starts a 500ms timer; if
  // it elapses without a touchend (or cancel), call onSaveNote with the
  // paragraph text. Tap-and-release short of 500ms does nothing.
  const lpTimer = useRef(null);
  const startLongPress = (e, text) => {
    if (!onSaveNote) return;
    if (lpTimer.current) clearTimeout(lpTimer.current);
    lpTimer.current = setTimeout(() => {
      onSaveNote(text, section.title);
      lpTimer.current = null;
    }, 500);
  };
  const cancelLongPress = () => {
    if (lpTimer.current) { clearTimeout(lpTimer.current); lpTimer.current = null; }
  };
  return (
    <div id={`letter-section-${section.id}`} style={{ marginBottom: 4, scrollMarginTop: 110, position: "relative" }}>
      <button
        onClick={onToggle}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,175,55,0.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        style={{
        width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
        padding: "14px 8px 8px",
        margin: "0 -8px",
        borderRadius: 4,
        transition: "background 0.15s",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(58,44,26,0.08)",
      }}>
        <span style={{
          fontWeight: 700, fontSize: 22, color: "#3A2C1A", lineHeight: 1.2,
        }}>
          {section.title}
        </span>
        <span style={{
          fontSize: 20, color: "#D4AF37", marginLeft: 12, flexShrink: 0,
          display: "inline-block",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }} aria-hidden="true">
          ▾
        </span>
      </button>

      {/* Key fact — always visible — oversized quote mark + gradient panel */}
      {section.keyFact && (
        <div className="hc-letter-keyfact" style={{
          padding: "14px 18px",
          background: "rgba(168,137,63,0.08)",
          borderLeft: "3px solid var(--gold)",
          borderRadius: "0 6px 6px 0",
          margin: "8px 0 12px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", top: -4, left: 14,
            fontSize: 48,
            color: "rgba(212,175,55,0.2)", lineHeight: 1,
            pointerEvents: "none", userSelect: "none",
          }}>&ldquo;</div>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase", color: "#D4AF37",
            marginBottom: 6,
          }}>Key insight</div>
          <div style={{
            fontSize: 16, fontWeight: 600, color: "#3A2C1A",
            fontStyle: "italic", lineHeight: 1.6,
          }}>{section.keyFact}</div>
          {onSaveForGp && (
            <button
              className="hc-no-print"
              onClick={() => onSaveForGp(section.keyFact, section.title)}
              aria-label={`Save "${section.title}" key insight for my GP question list`}
              style={{
                marginTop: 10,
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(58,44,26,0.06)",
                border: "1px solid rgba(58,44,26,0.18)",
                borderRadius: 999, padding: "4px 12px", cursor: "pointer",
                fontSize: 11, fontWeight: 700, color: "#3A2C1A", letterSpacing: 0.3,
              }}
            >
              <span aria-hidden="true" style={{ color: "#D4AF37" }}>+</span> Save for GP
            </button>
          )}
        </div>
      )}

      {/* Big tappable Read more / close pill */}
      <button onClick={onToggle} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: isExpanded ? "rgba(58,44,26,0.06)" : "rgba(212,175,55,0.12)",
        border: `1px solid ${isExpanded ? "rgba(58,44,26,0.15)" : "rgba(212,175,55,0.4)"}`,
        borderRadius: 20, padding: "8px 16px", cursor: "pointer",
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
                <p
                  key={i}
                  onTouchStart={(e) => startLongPress(e, block.text)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  onTouchCancel={cancelLongPress}
                  style={{
                    fontSize: 19, fontWeight: 500, lineHeight: 1.9,
                    color: "#3A2C1A", margin: "0 0 16px",
                    WebkitUserSelect: "text",
                  }}
                >{block.text}</p>
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
                    fontSize: 18, fontWeight: 500, fontStyle: "italic",
                    color: "#3A2C1A", margin: "0 0 8px", lineHeight: 1.8,
                  }}>"{block.quote}"</p>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: "#9B8B7A", letterSpacing: 0.4,
                  }}>— {block.attribution}</div>
                </div>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} style={{
                  fontSize: 18, fontWeight: 500, lineHeight: 1.85,
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
                    fontSize: 48, fontWeight: 700, color: "#D4AF37",
                  }}>{block.number}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#9B8B7A",
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
                background: "rgba(168,137,63,0.10)",
                border: "1px solid rgba(212,175,55,0.35)",
                borderRadius: 8, padding: "10px 18px",
                cursor: "pointer", marginTop: 4,
                fontSize: 13, fontWeight: 600, color: "#3A2C1A", letterSpacing: 0.3,
              }}>
                <span aria-hidden="true" style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(212,175,55,0.2)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, flexShrink: 0, color: "#D4AF37",
                }}><Sparkles size={12} strokeWidth={1.75} /></span>
                <span>
                  Ask Jess — <em style={{ fontStyle: "italic", fontWeight: 400 }}>{String(section.title).toLowerCase()}</em>
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ════════════════════════════════════════════════════════════════════════════
// LETTER HISTORY STRIP (Feature 5)
// ════════════════════════════════════════════════════════════════════════════
const LetterHistoryStrip = memo(function LetterHistoryStrip({ currentPhase }) {
  const phases = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];
  return (
    <div style={{
      background: "var(--ivory)",
      borderBottom: "1px solid rgba(58,44,26,0.08)",
      padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 8,
      overflowX: "auto", scrollbarWidth: "none",
      position: "sticky", top: 84, zIndex: 9,
    }}>
      <span style={{
        fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
        color: "#9B8B7A", whiteSpace: "nowrap", marginRight: 6, fontWeight: 700,
      }}>Past letters</span>
      {phases.map((p) => {
        const on = p === currentPhase;
        return (
          <div key={p} style={{
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
});

// ════════════════════════════════════════════════════════════════════════════
// NEWS SECTION (Feature 4) — curated cards before sign-off
// ════════════════════════════════════════════════════════════════════════════
const NewsSection = memo(function NewsSection({ tabId }) {
  const news = NEWS_BY_TAB[tabId] || [];
  if (!news.length) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <BotanicalDivider />
      {/* Header — italic "what's being written about" between hairlines */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 6,
      }}>
        <div style={{ flex: 1, height: 1, background: "rgba(58,44,26,0.1)" }} />
        <span style={{
          fontSize: 14, fontStyle: "italic", color: "#9B8B7A", whiteSpace: "nowrap",
        }}>What's being written about</span>
        <div style={{ flex: 1, height: 1, background: "rgba(58,44,26,0.1)" }} />
      </div>
      {/* Cadence label so readers know news rotates monthly */}
      <div style={{
        textAlign: "center", marginBottom: 14,
        fontSize: 10, color: "#9B8B7A", letterSpacing: 1, textTransform: "uppercase",
      }}>Updated monthly</div>
      {/* Clipping-style cards with stable alternating tilt */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {news.map((item, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(58,44,26,0.1)",
            borderRadius: 4,
            padding: "14px 16px",
            position: "relative",
            // Stable alternating tilt — GPU-composited transform, cheap.
            transform: `rotate(${i % 2 === 0 ? 0.4 : -0.3}deg)`,
            boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", color: "#D4AF37", marginBottom: 6,
            }}>{item.source} · {item.date}</div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: "#3A2C1A",
              lineHeight: 1.35, marginBottom: 8,
            }}>{item.headline}</div>
            {item.url && item.url !== "#" ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11, color: "#3A2C1A", letterSpacing: 0.3,
                  textDecoration: "none", fontWeight: 600,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}
              >
                Read more <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <div style={{
                fontSize: 11, color: "#9B8B7A", letterSpacing: 0.3,
              }}>→ Read</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// ════════════════════════════════════════════════════════════════════════════
// STORY DASHBOARD (Feature 1) — data tiles in place of letter sections
// ════════════════════════════════════════════════════════════════════════════
const TILE = {
  background: "rgba(212,175,55,0.06)",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 8, padding: 18, marginBottom: 14,
};
const TILE_LABEL = {
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

  const phaseLabels = {
    menstrual: "Menstrual",
    follicular: "Follicular",
    ovulatory: "Ovulatory",
    luteal: "Luteal",
  };
  return (
    <div>
      {/* GPU-only pulse: animates transform + opacity on a wrapper ring  */}
      {/* (composited on its own layer), never box-shadow. Visual is the  */}
      {/* same expanding gold halo at zero per-frame paint cost.          */}
      <style>{`
        @keyframes fw-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .fw-pulse-wrapper { position: relative; display: inline-block; width: 18px; height: 18px; }
        .fw-pulse-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: rgba(212,175,55,0.45);
          animation: fw-pulse-ring 2s ease-out infinite;
          pointer-events: none;
          will-change: transform, opacity;
        }
      `}</style>

      {/* 1. Cycle calendar — phase label above grid, pulsing today, legend below */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Your cycle</div>
        <div style={{
          fontSize: 17, fontWeight: 700, color: "#3A2C1A", marginBottom: 12,
          letterSpacing: 0.2,
        }}>
          {phaseLabels[phase] || "Follicular"} — Day {cycleDay}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 8, justifyItems: "center", alignItems: "center" }}>
          {dots.map((d, i) => (
            d.isToday ? (
              // Today: pulse ring + dot inside a wrapper. The ring animates
              // on transform/opacity (GPU-composited) — no CPU paint per frame.
              <div key={i} title={`Day ${d.day} · ${d.phase}`} className="fw-pulse-wrapper">
                <div className="fw-pulse-ring" aria-hidden="true" />
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: phaseColour[d.phase],
                  border: "2px solid rgba(212,175,55,0.8)",
                  position: "relative", zIndex: 1, boxSizing: "border-box",
                }} />
              </div>
            ) : (
              <div
                key={i}
                title={`Day ${d.day} · ${d.phase}`}
                style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: phaseColour[d.phase],
                }}
              />
            )
          ))}
        </div>
        {/* Phase legend chips */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14,
          fontSize: 11, fontWeight: 600, color: "#9B8B7A",
        }}>
          {["menstrual","follicular","ovulatory","luteal"].map((p) => (
            <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: phaseColour[p], display: "inline-block",
              }} />
              {phaseLabels[p]}
            </span>
          ))}
        </div>
        <div style={{
          marginTop: 12, fontSize: 13, fontWeight: 500, fontStyle: "italic", color: "#9B8B7A",
        }}>
          {cycleLen}-day cycle · the pulsing dot is today
        </div>
      </div>

      {/* 2. Mood + Energy sparkline — axis labels, thicker lines, soft fill */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Mood &amp; Energy · last 30 days</div>
        {(moodSeries.length || energySeries.length) ? (
          <div style={{ position: "relative" }}>
            {/* y axis tick labels */}
            <div style={{
              position: "absolute", top: -2, left: 0, bottom: 18,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              fontSize: 10, color: "#9B8B7A", paddingRight: 6,
            }}>
              <span>High</span>
              <span>Low</span>
            </div>
            <svg viewBox="0 0 300 70" width="100%" height="80" preserveAspectRatio="none" style={{ paddingLeft: 28 }}>
              <defs>
                <linearGradient id="mood-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8B4B8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#E8B4B8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="energy-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8FAF8F" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#8FAF8F" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[moodSeries, energySeries].map((series, i) => {
                if (!series.length) return null;
                const color = i === 0 ? "#E8B4B8" : "#8FAF8F";
                const fillId = i === 0 ? "mood-fill" : "energy-fill";
                const max = 5;
                const pts = series.slice(0, 30).map((v, idx) => {
                  const x = (idx / Math.max(1, Math.min(30, series.length) - 1)) * 300;
                  const y = 70 - (Math.max(0, Math.min(max, v)) / max) * 60 - 5;
                  return { x, y };
                });
                const lineStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
                const fillStr = `${pts[0].x},70 ${lineStr} ${pts[pts.length - 1].x},70`;
                return (
                  <g key={i}>
                    <polyline points={fillStr} fill={`url(#${fillId})`} stroke="none" />
                    <polyline points={lineStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  </g>
                );
              })}
            </svg>
            {/* x axis day markers */}
            <div style={{
              display: "flex", justifyContent: "space-between", marginTop: 4, paddingLeft: 28,
              fontSize: 10, color: "#9B8B7A",
            }}>
              <span>Day 1</span>
              <span>Day 30</span>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 14, fontStyle: "italic", color: "#9B8B7A" }}>
            No check-ins logged yet. Today is a good day to start.
          </div>
        )}
        <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12, color: "#9B8B7A", fontWeight: 600 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#E8B4B8", marginRight: 6, verticalAlign: "middle" }} />Mood</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#8FAF8F", marginRight: 6, verticalAlign: "middle" }} />Energy</span>
        </div>
      </div>

      {/* 3. Top symptoms this phase — subtitle, count badges, empty hint */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Top symptoms</div>
        <div style={{
          fontSize: 11, color: "#9B8B7A", marginTop: -8, marginBottom: 12, letterSpacing: 0.3,
        }}>Most frequent in last 14 days</div>
        {topSx.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topSx.map(([name, n]) => (
              <span key={name} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#3A2C1A", color: "#F4EDDB",
                padding: "6px 12px", borderRadius: 999,
                fontSize: 13, fontWeight: 600,
              }}>
                {String(name).replace(/_/g, " ")}
                <span style={{ background: "rgba(244,237,219,0.18)", borderRadius: 999, padding: "1px 8px", fontSize: 11 }}>×{n}</span>
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 14, fontStyle: "italic", color: "#9B8B7A" }}>
            No symptoms logged yet — start tracking to see patterns.
          </div>
        )}
      </div>

      {/* 4. Habit streaks — fire emoji on long streaks, progress bar of best */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Habit streaks</div>
        {streaks.length ? (
          <div>
            {streaks.map((h, i) => {
              const best = Math.max(h.streak, 7); // assume 7-day reference for fill bar
              const pct = Math.min(100, (h.streak / best) * 100);
              const showFire = h.streak >= 3;
              return (
                <div key={i} style={{
                  padding: "8px 0",
                  borderBottom: i < streaks.length - 1 ? "1px solid rgba(58,44,26,0.06)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 16, fontWeight: 600, color: "#3A2C1A",
                    }}>{String(h.name).replace(/_/g, " ")}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: "#8FAF8F",
                      background: "rgba(143,175,143,0.15)",
                      padding: "3px 10px", borderRadius: 12,
                      display: "inline-flex", alignItems: "center", gap: 4,
                    }}>{showFire && <Flame size={11} strokeWidth={2} aria-hidden="true" style={{ marginRight: 2 }} />}{h.streak} day{h.streak === 1 ? "" : "s"}</span>
                  </div>
                  <div style={{
                    marginTop: 6, height: 3, background: "rgba(58,44,26,0.06)",
                    borderRadius: 2, overflow: "hidden",
                  }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#8FAF8F" }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 14, fontStyle: "italic", color: "#9B8B7A" }}>
            No active streaks — build one today.
          </div>
        )}
      </div>

      {/* 5. Hydration — visual glass + headline number / target */}
      <div style={TILE}>
        <div style={TILE_LABEL}>Hydration this week</div>
        {(() => {
          const pct = Math.min(1, avgMlPerDay / hydTarget);
          const meetsTarget = avgMlPerDay >= hydTarget;
          const fillColour = meetsTarget ? "#8FAF8F" : "#9B8B7A";
          const fillHeight = pct * 64; // glass inner height = 64
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 4 }}>
              {/* Glass SVG */}
              <svg width="40" height="76" viewBox="0 0 40 76" aria-hidden="true" style={{ flexShrink: 0 }}>
                <defs>
                  <clipPath id="glass-inside">
                    {/* trapezoid clip slightly inset for stroke */}
                    <path d="M8 8 L32 8 L29 70 L11 70 Z" />
                  </clipPath>
                </defs>
                {/* fill */}
                <rect
                  x="0"
                  y={70 - fillHeight}
                  width="40"
                  height={fillHeight}
                  fill={fillColour}
                  opacity="0.55"
                  clipPath="url(#glass-inside)"
                />
                {/* outline */}
                <path d="M8 6 L32 6 L29 72 L11 72 Z" fill="none" stroke="#3A2C1A" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
              </svg>
              {/* Number + label */}
              <div>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: "#3A2C1A", lineHeight: 1,
                }}>
                  {(avgMlPerDay / 1000).toFixed(1)}L / {(hydTarget / 1000).toFixed(1)}L today
                </div>
                <div style={{
                  marginTop: 6,
                  fontSize: 12, color: meetsTarget ? "#8FAF8F" : "#9B8B7A", fontWeight: 600, letterSpacing: 0.3,
                }}>
                  {meetsTarget ? (<>Meeting your target <Check size={12} strokeWidth={2.5} aria-hidden="true" style={{ verticalAlign: "middle" }} /></>) : `${Math.round(pct * 100)}% of daily target`}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
