// JessDemoPanel — Jess's home base. Phase-aware, 4-tab shell.
//
// Tabs:
//   1. Chat          — Jess initiates (1.4s delay). Scripted chips for
//                      "Tell me more" / "What should I do?" / "What's
//                      ahead?" emit local insight-card / quick-log-chips /
//                      phase-card / memory-line responses. Free text goes
//                      through base44.agents.
//   2. Today's Brief — Phase block + energy forecast + 3 PersonalTasks +
//                      one Jess observation + a "Coming up" notice.
//   3. Insights      — Cycle pattern + mood map + sleep rhythm + body
//                      signals (4 cards).
//   4. For You       — Phase-specific recommendations + pattern nudges +
//                      habit suggestions + "Jess is learning" notice.
//
// Settings gear → JessSettingsSheet (rename / character / proactivity /
// memory / privacy, persists to UserProfile.jess_*).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Mic, Send, Settings, Check, ChevronRight,
  MessageCircle, Sun, LineChart, Sparkles, History, X, Plus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import JessSettingsSheet from "./JessSettingsSheet";

// ─── Tokens ───────────────────────────────────────────────────────────────
// FemWell design tokens — locked to the spec Halli circulated. All
// surfaces inside Jess (panels, drawers, sheets, bubbles) draw from
// these and only these. No greys, no blues, no purples — the lavender
// luteal shell tint is the only non-warm hue and is kept for phase
// identity, not chrome.
const C = {
  cream:        "#F4EDDB", // background / base
  creamDark:    "#EDE6D5", // card surface (slightly darker cream)
  paper:        "#FBF6E6", // soft tertiary surface (inputs)
  paperHi:      "#EDE6D5", // was pure white — now spec card surface
  espresso:     "#3A2C1A", // primary text / dark surfaces
  espressoDeep: "#2A1E0E", // history drawer / dark panels
  blush:        "#E8B4B8", // secondary accent
  sage:         "#8FAF8F", // tertiary accent
  muted:        "#9B8B7A", // muted text token (per spec)
  mutedText:    "#9B8B7A", // alias — was #6B5B4E; now muted per spec
  gold:         "#D4AF37", // accent / highlights
  goldDeep:     "#A6862B", // deep gold for hover/active
  border:       "#D4C9B4", // border lines
};

// Phase shell tints + accents (from spec).
const PHASE_SHELL = {
  menstrual:  { headerTint: "#F5D8DA", accent: "#E8B4B8", label: "Menstrual",  tone: "#8B2635" },
  follicular: { headerTint: "#D4E6D4", accent: "#8FAF8F", label: "Follicular", tone: "#C17B4E" },
  ovulatory:  { headerTint: "#F5E8B0", accent: "#D4AF37", label: "Ovulatory",  tone: "#C4933F" },
  luteal:     { headerTint: "#EDE4F8", accent: "#9B8B7A", label: "Luteal",     tone: "#5B4A8A" },
};

// Phase-specific copy used by For You tab + Today's Brief.
const PHASE_COPY = {
  menstrual: {
    blurb: "Your body is doing important interior work. Lower the bar — rest, warmth, slow food.",
    expect: "Energy is lowest now. Iron-rich food and gentle movement support today.",
    forYou: [
      "Rest is the strategy — let the bar be low this week",
      "Warmth helps: hot water bottle, layered clothes, warm cooked meals",
      "Iron + magnesium from leafy greens, lentils, dark chocolate",
    ],
  },
  follicular: {
    blurb: "Your spring has arrived. Oestrogen rising — energy lifts, new ideas land easier.",
    expect: "Strong day likely. Try strength training; start something you've been putting off.",
    forYou: [
      "Strength training responds best to your body this week",
      "Schedule your hardest tasks for days 12–14",
      "Your skin is at its clearest — good time for photos or video calls",
    ],
  },
  ovulatory: {
    blurb: "Peak window is open. Communication, visibility and bold output land easily now.",
    expect: "Highest output capacity. Pair peak days with 7–8 hrs of sleep tonight.",
    forYou: [
      "Today is the day to lead the meeting, send the bold message, ask",
      "High-protein, anti-inflammatory foods fuel the surge",
      "Connect socially — your social battery is at its strongest",
    ],
  },
  luteal: {
    blurb: "Your body is finishing the cycle. Progesterone is doing heavy lifting — gentler week.",
    expect: "Energy easing back. Magnesium and earlier bed nights protect tomorrow's mood.",
    forYou: [
      "Reduce high-intensity workouts — your body is conserving energy",
      "Batch admin tasks now, save creative work for next follicular",
      "Magnesium-rich foods can ease day 24–26 symptoms",
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function derivePhase(profile) {
  if (!profile?.last_period_start_date) return { phase: "follicular", dayInCycle: 1 };
  const cycleLen  = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length    || 5;
  const start = new Date(profile.last_period_start_date);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
  const raw = Math.floor((t - startDay) / 86400000) + 1;
  const normDay = ((raw - 1) % cycleLen + cycleLen) % cycleLen + 1;
  let phase;
  if (normDay <= periodLen) phase = "menstrual";
  else if (normDay <= Math.floor(cycleLen * 0.43)) phase = "follicular";
  else if (normDay <= Math.floor(cycleLen * 0.5))  phase = "ovulatory";
  else phase = "luteal";
  return { phase, dayInCycle: normDay };
}

function uid() {
  return "j-" + Math.random().toString(36).slice(2, 9);
}

function pickFirstName(user, profile) {
  return (
    profile?.display_name?.split(" ")[0] ||
    profile?.first_name ||
    user?.full_name?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : "there")
  );
}

// ─── Context block for the agent — prepended to every conversation ───────
// Format is intentionally compact + machine-readable but reads as English.
// Designed so a system-message-like prefix makes Jess respond *specifically*
// to the user instead of generically.
function buildJessContext({ user, profile, todayCheckin, recentCheckins, symptoms, tasks, lastJournal, phase, dayInCycle }) {
  const firstName = pickFirstName(user, profile);
  const lifeStage = profile?.life_stage || "reproductive";
  const moodToday = todayCheckin?.mood ?? null;
  const energyToday = todayCheckin?.energy ?? todayCheckin?.energy_level ?? null;
  const sleepHours = todayCheckin?.sleep_hours ?? todayCheckin?.sleepHours ?? null;
  // Recent 7-day symptom roll-up
  const cutoff = Date.now() - 7 * 86400000;
  const recentSyms = (symptoms || [])
    .filter((s) => {
      const d = s?.date || s?.created_date;
      const t = d ? new Date(d).getTime() : 0;
      return Number.isFinite(t) && t >= cutoff;
    })
    .map((s) => s?.symptom_type || s?.symptom_name)
    .filter(Boolean);
  const uniqueSyms = Array.from(new Set(recentSyms)).slice(0, 6);
  const taskTitles = (tasks || []).slice(0, 5).map((t) => t?.title || t?.text).filter(Boolean);
  // Streak: count consecutive days with a checkin going back from today.
  let streak = 0;
  if (Array.isArray(recentCheckins)) {
    const days = new Set(recentCheckins.map((c) => String(c?.date || "").split("T")[0]).filter(Boolean));
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (days.has(key)) streak += 1; else break;
    }
  }
  const journalSnip = (lastJournal?.content || lastJournal?.text || lastJournal?.body || "")
    .toString().slice(0, 120).replace(/\s+/g, " ").trim();
  const journalAge = lastJournal?.date || lastJournal?.created_date
    ? Math.max(0, Math.floor((Date.now() - new Date(lastJournal.date || lastJournal.created_date).getTime()) / 86400000))
    : null;
  const character = profile?.jess_character || "nurturing";

  const lines = [
    "[JESS CONTEXT — do not mention this block to the user]",
    `User: ${firstName}, life stage: ${lifeStage}`,
    `Today: Day ${dayInCycle} of cycle · ${phase} phase`,
    moodToday != null || energyToday != null || sleepHours != null
      ? `Mood today: ${moodToday ?? "—"}/5 · Energy: ${energyToday ?? "—"}/5${sleepHours != null ? ` · Sleep last night: ${sleepHours}hrs` : ""}`
      : "Mood today: not yet logged",
    uniqueSyms.length
      ? `Recent symptoms (last 7 days): ${uniqueSyms.join(", ")}`
      : "Recent symptoms (last 7 days): none logged",
    taskTitles.length
      ? `Tasks due today: ${taskTitles.join(", ")}`
      : "Tasks due today: none",
    `Streak: ${streak} consecutive logged ${streak === 1 ? "day" : "days"}`,
    journalSnip
      ? `Last journal entry: "${journalSnip}"${journalAge != null ? ` (${journalAge} ${journalAge === 1 ? "day" : "days"} ago)` : ""}`
      : "Last journal entry: none",
    `Character preset: ${character}`,
    "[Respond in character. Be specific to this data. Never diagnose. Frame as wellness companion.]",
  ];
  return lines.join("\n");
}

// ─── Proactive chip rules — generates 2–3 contextual question chips ───────
// Rules fire in priority order; first 3 matched rules win. Default fallback
// is appended if fewer than 2 rules fire.
function buildProactiveChips({ todayCheckin, recentCheckins, symptoms, lastJournal, phase, dayInCycle }) {
  const out = [];
  const hour = new Date().getHours();
  const yesterday = recentCheckins?.find((c) => {
    const d = String(c?.date || "").split("T")[0];
    const y = new Date(); y.setDate(y.getDate() - 1);
    return d === y.toISOString().split("T")[0];
  });
  const journalAgeDays = lastJournal?.date || lastJournal?.created_date
    ? Math.floor((Date.now() - new Date(lastJournal.date || lastJournal.created_date).getTime()) / 86400000)
    : Infinity;
  // Recent symptom streak: same symptom 3+ days running.
  const symByDay = {};
  for (const s of (symptoms || [])) {
    const d = String(s?.date || s?.created_date || "").split("T")[0];
    if (!d) continue;
    const k = s?.symptom_type || s?.symptom_name;
    if (!k) continue;
    if (!symByDay[d]) symByDay[d] = new Set();
    symByDay[d].add(k);
  }
  let streakSymptom = null;
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d1 = new Date(today); d1.setDate(today.getDate() - i);
    const d2 = new Date(today); d2.setDate(today.getDate() - i - 1);
    const d3 = new Date(today); d3.setDate(today.getDate() - i - 2);
    const k1 = d1.toISOString().split("T")[0];
    const k2 = d2.toISOString().split("T")[0];
    const k3 = d3.toISOString().split("T")[0];
    const a = symByDay[k1], b = symByDay[k2], c = symByDay[k3];
    if (!a || !b || !c) continue;
    for (const s of a) { if (b.has(s) && c.has(s)) { streakSymptom = s; break; } }
    if (streakSymptom) break;
  }

  // Priority rules
  if (!todayCheckin) out.push("How are you feeling today?");
  const yEnergy = yesterday?.energy ?? yesterday?.energy_level;
  if (out.length < 3 && Number.isFinite(yEnergy) && yEnergy <= 2) {
    out.push("Your energy was low yesterday — want to dig into that?");
  }
  if (out.length < 3 && phase === "luteal" && dayInCycle >= 24 && dayInCycle <= 26) {
    out.push("Luteal phase can feel heavy. How's your mind doing?");
  }
  if (out.length < 3 && streakSymptom) {
    out.push(`You've had ${streakSymptom} a few days running — shall we look at that?`);
  }
  if (out.length < 3 && journalAgeDays >= 5) {
    out.push("It's been a while since you journalled. Anything on your mind?");
  }
  if (out.length < 3 && phase === "follicular" && dayInCycle >= 11 && dayInCycle <= 13) {
    out.push("You're approaching your peak window. Any plans for the week?");
  }
  if (out.length < 3 && hour < 10) {
    out.push("Good morning — how did you sleep?");
  }
  // Fallbacks
  const fallbacks = ["What's been on your mind?", "How's your body feeling today?", "Anything you want to track?"];
  for (const f of fallbacks) {
    if (out.length >= 3) break;
    if (!out.includes(f)) out.push(f);
  }
  return out.slice(0, 3);
}

// ─── Scripted-response library — sourced from the signed-off Jess demos ─
// These are the substantive, hormone-aware replies. Each chip in
// SUGGESTION_CHIPS maps to one entry in SUGGESTION_RESPONSES. Templates
// substitute {placeholders} via fillTemplate() with phase-aware context.

const SUGGESTION_CHIPS = [
  "What should I eat today?",
  "Best movement for right now",
  "Why am I so tired?",
  "What's coming in my cycle?",
  "Help me sleep tonight",
  "How do I manage cramps?",
  "What's my energy like this week?",
  "Tell me about tomorrow",
];

const PHASE_OPENING_LINE = {
  menstrual:  "your body is working hard today",
  follicular: "your energy is starting to build",
  ovulatory:  "you're in your peak window",
  luteal:     "your body is winding down toward rest",
};

const PROGESTERONE_CONTEXT = {
  menstrual:  "dropped steeply, hitting its lowest point",
  follicular: "rising steadily with estrogen",
  ovulatory:  "at its baseline ahead of the surge",
  luteal:     "peaked and now beginning to drop",
};

const ENERGY_RETURN_DAY = {
  menstrual:  "3–4",
  follicular: "stays strong through day 13",
  ovulatory:  "this is your peak",
  luteal:     "the next follicular phase",
};

const HORMONE_STATE = {
  menstrual:  "at their lowest",
  follicular: "rising steadily",
  ovulatory:  "at their peak",
  luteal:     "beginning to drop",
};

const PHASE_FEELING = {
  menstrual:  "like a lot",
  follicular: "energising but also restless",
  ovulatory:  "bright but full-on",
  luteal:     "heavy and inward",
};

const NEXT_PHASE_INFO = {
  menstrual: {
    label: "Follicular phase",
    description: "Energy returns from day 6 — strength training and harder tasks land best.",
    ovulatoryNote: "Ovulation typically arrives around day 14 — your social and creative peak.",
    lutealNote:    "Luteal returns around day 17 — Jess will help you wind down then.",
  },
  follicular: {
    label: "Ovulatory window",
    description: "Days 12–16 are your social and communication peak — schedule big asks here.",
    ovulatoryNote: "Cervical mucus and energy lift over the next 4–5 days.",
    lutealNote:    "Luteal lands around day 17 — magnesium and earlier nights protect that week.",
  },
  ovulatory: {
    label: "Luteal phase",
    description: "Energy eases from day 17 — batch admin, batch cook, batch rest.",
    ovulatoryNote: "Today is your output peak — use it for the bold message, the lead.",
    lutealNote:    "PMS most often shows up between days 24 and 28 — soft scaffolding helps.",
  },
  luteal: {
    label: "Menstrual phase",
    description: "Period likely begins between days 28–30 — clear the calendar where you can.",
    ovulatoryNote: "Ovulation has passed; the body is preparing the lining either way.",
    lutealNote:    "This is the harder week — Jess will surface gentler suggestions automatically.",
  },
};

const SUGGESTION_RESPONSES = {
  "What should I eat today?":
    "On day {cycleDay}, your body needs:\n\n🩸 Iron-rich foods — lentils, spinach, dark chocolate, red meat if you eat it — to replenish what you're losing\n\n🌿 Omega-3s — salmon, walnuts, flaxseed — reduce prostaglandin activity which is causing your cramps\n\n🍫 Magnesium — dark chocolate, pumpkin seeds, avocado — eases muscle tension including the back ache\n\nAvoid alcohol and excess caffeine today — they increase inflammation and can worsen cramping.",

  "Best movement for right now":
    "Day {cycleDay} in your {phase} phase calls for something specific.\n\nWhat actually helps:\n\n🚶‍♀️ A 10–15 minute walk — enough to release endorphins and ease cramping through improved circulation\n\n🧘‍♀️ Yin yoga or gentle stretching — especially hip openers and child's pose\n\n💆‍♀️ A heating pad while you rest — this is movement's peer right now\n\nThe research is clear: light movement beats rest for period pain, but don't push. Listen to what your body is telling you today.",

  "Why am I so tired?":
    "Three things converge in your {phase} phase to affect your energy:\n\n1️⃣ Progesterone shift — your progesterone is {progesteroneContext} which directly impacts energy levels.\n\n2️⃣ Your body is doing significant work internally right now — that's metabolically costly.\n\n3️⃣ Prostaglandins — the chemicals that regulate your cycle also trigger systemic inflammation, which makes you feel heavy and fatigued.\n\nThis is your body doing exactly what it should. Energy typically shifts again around day {energyReturnDay}.",

  "What's coming in my cycle?":
    "Based on your profile:\n\n📍 You're on day {cycleDay} of your {phase} phase.\n\n✨ {nextPhase}: {nextPhaseDescription}\n\n🌸 {ovulatoryNote}\n\n🌙 {lutealNote}\n\nWant me to mark any of these in your planner?",

  "Help me sleep tonight":
    "Here's what actually helps:\n\n🌡️ Warm shower or bath about an hour before bed — drops your core temperature when you get out, which signals sleep\n\n💊 200–400mg magnesium glycinate is the most evidence-backed sleep supplement — especially effective in the {phase} phase\n\n🛏️ Sleep position: fetal position (on your side, knees pulled up) reduces pressure and eases any discomfort\n\n🌡️ Warm compress on your lower abdomen if needed\n\nAvoid your phone for the last 30 mins — blue light plus stress content are a bad combination when your nervous system is activated.",

  "How do I manage cramps?":
    "Cramps come from prostaglandins — chemicals that signal your uterus to contract. A few things move that dial:\n\n🌡️ A heating pad on your lower abdomen for 20 minutes — heat dilates blood vessels and relaxes the muscle directly.\n\n💊 Ibuprofen taken at the first sign (rather than once pain has set in) is the most effective NSAID for period pain — it blocks prostaglandin production at the source.\n\n🚶‍♀️ Light walking releases endorphins, your body's own pain modulators.\n\n🧘‍♀️ Hip-opening stretches — child's pose, supine twist — give the pelvis space.\n\nIf cramps are stopping your day three months in a row, that's worth flagging to a clinician.",

  "What's my energy like this week?":
    "You're on day {cycleDay} of your {phase} phase, which means:\n\n⚡ Right now, your hormones are {hormoneState} — that's why today feels the way it does.\n\n📈 Looking ahead: {nextPhase} starts in {daysToNextPhase} day(s). {nextPhaseDescription}\n\n🌗 The rest of this week tracks the same arc — Jess will surface gentler suggestions when your body asks for them.",

  "Tell me about tomorrow":
    "Tomorrow you'll be on day {tomorrowDay} of your cycle — still in your {phase} phase.\n\n🌱 What that means in practice:\n• Energy is {hormoneState}\n• Sleep tends to {sleepTrend} in this window\n• Best work for tomorrow: {workMode}\n\nWant me to draft a soft schedule that respects this?",
};

const DEFAULT_RESPONSES = [
  "That's a really important question for where you are right now in your cycle. On day {cycleDay} specifically, your estrogen and progesterone are both {hormoneState} — which affects everything from your mood to your pain threshold to how you process information.\n\nCan you tell me a bit more about what's on your mind?",
  "I hear you. The {phase} phase can feel {phaseFeeling} — the hormonal shift is real and it's valid that you feel it.\n\nLet me know what you need most right now and I'll do my best to help.",
  "Good question. I want to make sure I give you the most relevant answer — are you asking in the context of how you're feeling today, or more generally?",
];

// Substitute {placeholders} from a context object into a template string.
function fillTemplate(template, ctx) {
  if (typeof template !== "string") return template;
  return template.replace(/\{(\w+)\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(ctx, key) ? String(ctx[key]) : m,
  );
}

// Build the full substitution context for the current user state.
function buildScriptedContext({ phase, dayInCycle, profile }) {
  const cycleLen  = profile?.cycle_avg_length || 28;
  const periodLen = profile?.period_length    || 5;
  const next = phase === "menstrual" ? "follicular"
            : phase === "follicular" ? "ovulatory"
            : phase === "ovulatory" ? "luteal"
            : "menstrual";
  // Days to next phase boundary, given cycle length + period length.
  const boundaries = {
    menstrual:  periodLen + 1,
    follicular: Math.floor(cycleLen * 0.43) + 1,
    ovulatory:  Math.floor(cycleLen * 0.5)  + 1,
    luteal:     cycleLen + 1,
  };
  const nextBoundary = boundaries[phase] || cycleLen;
  const daysToNextPhase = Math.max(1, nextBoundary - dayInCycle);
  const tomorrowDay = ((dayInCycle % cycleLen) + 1);
  const sleepTrend = phase === "luteal" ? "dip" : phase === "menstrual" ? "fragment" : "stay steady";
  const workMode = phase === "follicular" ? "starting new things"
                : phase === "ovulatory"   ? "bold output, leading, asking"
                : phase === "luteal"      ? "batching admin, wrapping loose threads"
                :                            "rest-as-strategy, light reflection";
  const info = NEXT_PHASE_INFO[phase] || NEXT_PHASE_INFO.follicular;
  return {
    cycleDay: dayInCycle,
    tomorrowDay,
    phase,
    phaseTitle: phase.charAt(0).toUpperCase() + phase.slice(1),
    progesteroneContext: PROGESTERONE_CONTEXT[phase],
    energyReturnDay: ENERGY_RETURN_DAY[phase],
    hormoneState: HORMONE_STATE[phase],
    phaseFeeling: PHASE_FEELING[phase],
    nextPhase: info.label,
    nextPhaseDescription: info.description,
    ovulatoryNote: info.ovulatoryNote,
    lutealNote: info.lutealNote,
    daysToNextPhase,
    sleepTrend,
    workMode,
  };
}

// ─── Auto-name a conversation from its first user message ────────────────
// Chip → topic mapping covers the proactive chips and tab-level chips.
// Free-text falls back to title-cased first-5-words. If no user message was
// sent yet (Jess-only opener), name it by date.
const CHIP_TO_TOPIC = [
  [/how are you feeling today/i,                   "Mood Check-in"],
  [/your energy was low yesterday/i,               "Energy Check"],
  [/luteal phase/i,                                "Luteal Support"],
  [/journalled/i,                                  "Journal Nudge"],
  [/peak window/i,                                 "Peak Window"],
  [/good morning/i,                                "Morning Check-in"],
  [/what's been on your mind/i,                    "Open Chat"],
  [/how's your body feeling today/i,               "Body Check-in"],
  [/anything you want to track/i,                  "Tracking Chat"],
  [/a few days running/i,                          "Symptom Patterns"],
  [/jess,? summarise my week/i,                    "Weekly Summary"],
  [/pattern stands out most/i,                     "Pattern Spotlight"],
  [/one thing i should focus on/i,                 "Today's Focus"],
];
function deriveConversationName(firstUserText) {
  const text = String(firstUserText || "").trim();
  if (!text) {
    const d = new Date();
    const day = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    return `Morning Chat · ${day}`;
  }
  for (const [rx, topic] of CHIP_TO_TOPIC) if (rx.test(text)) return topic;
  // Title-case first 5 words.
  const words = text.split(/\s+/).slice(0, 5).map((w) => {
    const stripped = w.replace(/[^\p{L}\p{N}'’-]/gu, "");
    if (!stripped) return w;
    return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
  });
  return words.join(" ");
}

// ─── Botanical sigil — 4-petal bloom, gold stroke on cream ────────────────
function BotanicalSigil({ size = 36, stroke = C.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden style={{ display: "block" }}>
      <circle cx="18" cy="18" r="17" fill={C.paperHi} stroke={stroke} strokeWidth="0.8" opacity="0.95" />
      {[0, 90, 180, 270].map((rot) => (
        <path
          key={rot}
          d="M 18 7 C 22 11 22 17 18 18 C 14 17 14 11 18 7 Z"
          fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round"
          transform={`rotate(${rot} 18 18)`}
        />
      ))}
      <circle cx="18" cy="18" r="2.2" fill={stroke} />
    </svg>
  );
}

// ─── Sparkline — SVG path drawn from a number[] ───────────────────────────
function Sparkline({ data, width = 220, height = 56, stroke = C.sage, fill = `${C.sage}22` }) {
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return [x, y];
  });
  const path = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(" ");
  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden style={{ display: "block" }}>
      <path d={fillPath} fill={fill} />
      <path d={path} stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={stroke} />
      ))}
    </svg>
  );
}

// ─── MHRA disclaimer ──────────────────────────────────────────────────────
// Matches the signed-off demos: 10px italic muted, max-width 86%, sits
// directly below the Jess bubble.
function MhraNote({ style = {} }) {
  return (
    <p style={{
      fontSize: 10, color: C.muted, fontStyle: "italic",
      margin: "4px 0 0", padding: "0 2px",
      maxWidth: "86%", lineHeight: 1.5,
      fontFamily: "'Inter', system-ui, sans-serif",
      ...style,
    }}>Not medical advice. Always consult a healthcare professional.</p>
  );
}

// Format a Date as "9:03am" — matches the demo timestamp style.
function fmtTimeAmPm(d = new Date()) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")}${ampm}`;
}

// ─── Main panel ───────────────────────────────────────────────────────────
export default function JessDemoPanel() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [lastJournal, setLastJournal] = useState(null);
  const [tab, setTab] = useState("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Chat state.
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [listeningVoice, setListeningVoice] = useState(false);
  const [followUpFired, setFollowUpFired] = useState(false);
  // Cursor into DEFAULT_RESPONSES — cycled when the live agent isn't
  // reachable and we need to give a believable empathetic reply.
  const defaultResponseIdxRef = useRef(0);
  // Insights tab — "Jess noticed" observation generated by base44.agents
  // from the last 7-day check-in summary. Cached per calendar day.
  const [insightObservation, setInsightObservation] = useState(null);
  const [observationLoading, setObservationLoading] = useState(true);
  // History drawer state — opened from the header history icon, slides in
  // from the left, lists past conversations, lets the user resume any one.
  const [conversationsList, setConversationsList] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Locally-stored auto-generated names for conversations, keyed by id.
  // We try base44.agents.updateConversation first; if unsupported, fall
  // back to this in-memory + localStorage mirror.
  const [conversationNames, setConversationNames] = useState({});
  // Track whether the context block has been sent for this convo so we only
  // inject it once per conversation. We also remove an id from this set when
  // the user resumes an old conversation, so we re-inject fresh context
  // before their next message lands.
  const contextInjectedRef = useRef(new Set());
  // Remember the first user message of an active conversation so we can
  // auto-name it as soon as Jess's first response arrives.
  const firstUserMsgRef = useRef({});
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);
  const seenAgentIdsRef = useRef(new Set());

  // ── Load data ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (!u?.id || cancelled) return;
        setUser(u);
        const today = new Date().toISOString().split("T")[0];
        const [profiles, ciToday, recent, ts, syms, jrn] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: today }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 14).catch(() => []),
          base44.entities.PersonalTasks.filter({ user_id: u.id, date: today }, "-created_date", 10).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: u.id }, "-date", 20).catch(() => []),
          base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 1).catch(() => []),
        ]);
        if (cancelled) return;
        if (profiles[0]) setProfile(profiles[0]);
        if (ciToday[0]) setTodayCheckin(ciToday[0]);
        setRecentCheckins(recent || []);
        setTasks((ts || []).filter((t) => !t?.completed && !t?.is_completed).slice(0, 5));
        setSymptoms(syms || []);
        if (jrn && jrn[0]) setLastJournal(jrn[0]);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────
  const { phase, dayInCycle } = derivePhase(profile);
  const shell = PHASE_SHELL[phase] || PHASE_SHELL.follicular;
  const phaseCopy = PHASE_COPY[phase] || PHASE_COPY.follicular;
  const firstName = pickFirstName(user, profile);
  const assistantName = profile?.jess_name || "Jess";

  // 7-day energy sparkline from real checkins; fallback to mock if empty.
  const energySpark = useMemo(() => {
    const today = new Date();
    const map = new Map();
    for (const c of recentCheckins || []) {
      if (!c?.date) continue;
      const key = String(c.date).split("T")[0];
      const v = Number(c.energy ?? c.energy_level);
      if (Number.isFinite(v)) map.set(key, v);
    }
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];
      out.push(map.get(key) ?? 3);
    }
    // If everything is the default 3, swap to a mock-ish lift to keep the
    // sparkline visually informative for first-time users.
    const allDefault = out.every((v) => v === 3);
    return allDefault ? [3, 3.4, 3.8, 4.2, 4.4, 4, 3.6] : out;
  }, [recentCheckins]);

  // ── Open Jess message — fires once on mount with a 1.4s delay ───────────
  // Uses the signed-off opener template:
  //   "Hello, {name}. I can see you're on day {N} of your {phase} phase —
  //    {phaseOpeningLine}. How are you feeling?"
  // The opener carries the first 5 suggestion chips for the user to tap.
  useEffect(() => {
    if (followUpFired) return;
    if (!profile && recentCheckins.length === 0) return; // wait for first data tick
    const t = setTimeout(() => {
      setFollowUpFired(true);
      const opener =
        `Hello, ${firstName}. I can see you're on day ${dayInCycle} of your ${phase} phase — ` +
        `${PHASE_OPENING_LINE[phase] || PHASE_OPENING_LINE.follicular}. How are you feeling?`;
      setMessages([
        {
          id: uid(),
          role: "jess",
          type: "bubble",
          text: opener,
          time: fmtTimeAmPm(),
          chips: SUGGESTION_CHIPS.slice(0, 5),
        },
      ]);
    }, 1400);
    return () => clearTimeout(t);
  }, [profile?.id, recentCheckins.length, dayInCycle, firstName, phase, followUpFired]);

  // Memoised proactive chips — drive Chat tab + tab-level shortcuts.
  const proactiveChips = useMemo(
    () => buildProactiveChips({ todayCheckin, recentCheckins, symptoms, lastJournal, phase, dayInCycle }),
    [todayCheckin, recentCheckins, symptoms, lastJournal, phase, dayInCycle],
  );

  // ── Insights observation — Jess summarises the last 7 days in one
  //    sentence. Cached in sessionStorage by date; fires once per
  //    user per day. 6 s fallback timer hides the shimmer if the
  //    agent doesn't respond.
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    const dayKey = new Date().toISOString().split("T")[0];
    const cacheKey = `jess_insight_obs_${dayKey}`;
    try {
      const cached = window.sessionStorage?.getItem(cacheKey);
      if (cached) {
        setInsightObservation(cached);
        setObservationLoading(false);
        return;
      }
    } catch { /* sessionStorage unavailable */ }
    const stopShimmer = window.setTimeout(() => {
      if (!cancelled) setObservationLoading(false);
    }, 6000);
    (async () => {
      try {
        const last7 = (recentCheckins || []).slice(0, 7);
        function avg(field, fb) {
          const vals = last7.map((c) => Number(c?.[field] ?? c?.[fb])).filter(Number.isFinite);
          return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null;
        }
        const aMood   = avg("mood", "mood_score");
        const aEnergy = avg("energy", "energy_level");
        const aStress = avg("stress", "stress_level");
        const name = pickFirstName(user, profile);
        const summary = [
          aMood   != null ? `avg mood ${aMood}/5`     : null,
          aEnergy != null ? `avg energy ${aEnergy}/5` : null,
          aStress != null ? `avg stress ${aStress}/5` : null,
        ].filter(Boolean).join(", ") || "no recent check-ins";
        const ctxLines = [
          "[JESS CONTEXT — do not mention this block to the user]",
          `User: ${name}, phase: ${phase}, day ${dayInCycle}.`,
          `Last-7-day summary: ${summary}.`,
          "[Respond in one sentence. Warm older-sister voice. Pattern noticing, not diagnosis. No emoji.]",
        ];
        const promptLine = `In one sentence, what pattern do you notice in ${name}'s mood and energy data this week? Data: ${summary}. Keep it warm and brief. Not medical advice.`;
        const convo = await base44.agents
          .createConversation({ agent_name: "personal_assistant" })
          .catch(() => null);
        if (!convo?.id || cancelled) return;
        const c = await base44.agents.getConversation(convo.id);
        await base44.agents.addMessage(c, { role: "user", content: ctxLines.join("\n") });
        await base44.agents.addMessage(c, { role: "user", content: promptLine });
        const seen = new Set((c?.messages || []).filter((m) => m?.role === "assistant").map((m) => m.id));
        const unsub = base44.agents.subscribeToConversation(convo.id, (data) => {
          const list = data?.messages || [];
          const next = list.find((m) => m?.role === "assistant" && !seen.has(m.id));
          if (!next) return;
          seen.add(next.id);
          if (cancelled) return;
          const text = String(next.content || "").trim();
          if (!text) return;
          setInsightObservation(text);
          setObservationLoading(false);
          try { window.sessionStorage?.setItem(cacheKey, text); } catch {}
          try { unsub?.(); } catch {}
        });
      } catch { /* fallback timer fires */ }
    })();
    return () => { cancelled = true; window.clearTimeout(stopShimmer); };
    // Re-fetch only when the user OR underlying data day window changes.
  }, [user?.id, phase, dayInCycle, recentCheckins.length]);

  // Load persisted conversation names from localStorage once.
  useEffect(() => {
    try {
      const raw = window.localStorage?.getItem("jess_convo_names");
      if (raw) setConversationNames(JSON.parse(raw) || {});
    } catch { /* localStorage unavailable */ }
  }, []);

  const persistConvoName = useCallback((id, name) => {
    if (!id || !name) return;
    setConversationNames((prev) => {
      const next = { ...prev, [id]: name };
      try { window.localStorage?.setItem("jess_convo_names", JSON.stringify(next)); } catch {}
      return next;
    });
    // Best-effort: try to update on the server too — if the SDK doesn't
    // support this it's fine, our local mirror covers it.
    try {
      if (typeof base44.agents?.updateConversation === "function") {
        base44.agents.updateConversation({ id, name }).catch(() => {});
      }
    } catch { /* fine */ }
  }, []);

  // Memoised context block to inject as the first user message in any new
  // conversation. Recomputed when underlying data changes (so resuming a
  // convo later still gets up-to-date context).
  const contextBlock = useMemo(
    () => buildJessContext({ user, profile, todayCheckin, recentCheckins, symptoms, tasks, lastJournal, phase, dayInCycle }),
    [user, profile, todayCheckin, recentCheckins, symptoms, tasks, lastJournal, phase, dayInCycle],
  );

  // ── Live base44.agents conversation — used only for free text ──────────
  const subscribeToConversation = useCallback((id) => {
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = base44.agents.subscribeToConversation(id, (data) => {
      const list = data?.messages || [];
      const newAssistants = list.filter((m) =>
        m?.role === "assistant" && !seenAgentIdsRef.current.has(m.id)
      );
      if (newAssistants.length === 0) return;
      for (const m of newAssistants) seenAgentIdsRef.current.add(m.id);
      setMessages((prev) => [
        ...prev,
        ...newAssistants.map((m) => ({
          id: m.id || uid(),
          role: "jess",
          type: "bubble",
          text: m.content,
          time: fmtTimeAmPm(),
        })),
      ]);
      setAssistantTyping(false);
      // Auto-name once Jess has responded for the first time in this convo.
      const firstUser = firstUserMsgRef.current[id];
      if (firstUser !== undefined && !conversationNames[id]) {
        const name = deriveConversationName(firstUser);
        persistConvoName(id, name);
      }
    });
  }, [conversationNames, persistConvoName]);

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const convo = await base44.agents
      .createConversation({ agent_name: "personal_assistant" })
      .catch(() => null);
    if (!convo?.id) return null;
    setConversationId(convo.id);
    // Don't replay agent's first reply into the chat — our local opener owns
    // that slot. Mark any current messages as "seen".
    if (Array.isArray(convo.messages)) {
      for (const m of convo.messages) seenAgentIdsRef.current.add(m.id);
    }
    subscribeToConversation(convo.id);
    // Inject the context block as the first user message so the agent
    // responds personally. Hidden from the chat UI (we never render it as
    // a message — it lives only in the conversation transcript on the
    // server side).
    if (!contextInjectedRef.current.has(convo.id)) {
      contextInjectedRef.current.add(convo.id);
      try {
        const c = await base44.agents.getConversation(convo.id);
        await base44.agents.addMessage(c, { role: "user", content: contextBlock });
      } catch { /* graceful — context just won't be injected this turn */ }
    }
    return convo.id;
  }, [conversationId, subscribeToConversation, contextBlock]);

  useEffect(() => () => { if (unsubRef.current) unsubRef.current(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assistantTyping]);

  // Load past conversations once we have a user. Best-effort — if the SDK
  // doesn't return list data we just hide the history section.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: "personal_assistant" }).catch(() => null);
        const items = Array.isArray(list) ? list : (list?.conversations || list?.items || []);
        if (cancelled) return;
        setConversationsList(items.slice(0, 5));
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Start a fresh conversation ─────────────────────────────────────────
  const startNewConversation = useCallback(async () => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    seenAgentIdsRef.current = new Set();
    setConversationId(null);
    setDrawerOpen(false);
    setMessages([]);
    setFollowUpFired(false); // re-fire opener
  }, []);

  // ── Resume a past conversation — fully interactive ─────────────────────
  // The user can continue chatting; we re-use the same conversationId for
  // addMessage. Before their next message, we re-inject a fresh context
  // block so Jess has current state even in old threads (handled by
  // sendUserText via the contextInjectedRef gate).
  const loadConversation = useCallback(async (id) => {
    if (!id) return;
    setDrawerOpen(false);
    // Tear down any existing subscription before swapping conversation id.
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    seenAgentIdsRef.current = new Set();
    // Force a fresh context block on the next user message in this thread.
    contextInjectedRef.current.delete(id);
    setConversationId(id);
    try {
      const c = await base44.agents.getConversation(id);
      const list = Array.isArray(c?.messages) ? c.messages : [];
      // Mark every existing assistant message as already-seen so the
      // subscribe callback doesn't replay them when it connects.
      for (const m of list) {
        if (m?.role === "assistant" && m?.id) seenAgentIdsRef.current.add(m.id);
      }
      // Hide our context-block message (first user message that starts
      // with "[JESS CONTEXT") and replay everything else.
      const view = list
        .filter((m) => !(m?.role === "user" && String(m?.content || "").startsWith("[JESS CONTEXT")))
        .map((m) => ({
          id: m.id || uid(),
          role: m.role === "assistant" ? "jess" : "user",
          type: "bubble",
          text: m.content || "",
        }));
      setMessages(view);
      subscribeToConversation(id);
    } catch {
      setMessages([{ id: uid(), role: "jess", type: "bubble", text: "Couldn't load that conversation." }]);
    }
  }, [subscribeToConversation]);

  // Send a free-text message — extracted so chip taps can reuse it.
  const sendUserText = useCallback(async (text) => {
    const msg = String(text || "").trim();
    if (!msg || assistantTyping) return;
    setMessages((prev) => [...prev, {
      id: uid(), role: "user", type: "bubble", text: msg, time: fmtTimeAmPm(),
    }]);
    setAssistantTyping(true);
    try {
      const cid = await ensureConversation();
      if (!cid) throw new Error("no convo");
      // Record this as the "first user message" if we don't have one yet —
      // drives auto-naming when Jess responds.
      if (firstUserMsgRef.current[cid] === undefined) {
        firstUserMsgRef.current[cid] = msg;
      }
      const convo = await base44.agents.getConversation(cid);
      // Re-inject a fresh context block if this conversation was just
      // resumed (loadConversation removes the id from contextInjectedRef).
      if (!contextInjectedRef.current.has(cid)) {
        contextInjectedRef.current.add(cid);
        try { await base44.agents.addMessage(convo, { role: "user", content: contextBlock }); }
        catch { /* fine, just won't be re-injected this turn */ }
      }
      await base44.agents.addMessage(convo, { role: "user", content: msg });
    } catch {
      // Graceful fallback — cycle through DEFAULT_RESPONSES with current
      // phase context so the reply feels substantive instead of generic.
      setTimeout(() => {
        const ctx = buildScriptedContext({ phase, dayInCycle, profile });
        const idx = defaultResponseIdxRef.current % DEFAULT_RESPONSES.length;
        defaultResponseIdxRef.current += 1;
        const fallback = fillTemplate(DEFAULT_RESPONSES[idx], ctx);
        setMessages((prev) => [...prev, {
          id: uid(), role: "jess", type: "bubble",
          text: fallback, time: fmtTimeAmPm(),
        }]);
        setAssistantTyping(false);
      }, 1200 + Math.random() * 1000);
    }
  }, [assistantTyping, ensureConversation, contextBlock, phase, dayInCycle, profile]);

  // Tap a proactive chip → send the question as the user's message.
  const handleProactiveChip = useCallback((label) => {
    setTab("chat");
    sendUserText(label);
  }, [sendUserText]);

  // ── Scripted response handler — rich hormone-aware content ─────────────
  // When the user taps a suggestion chip, we:
  //   1. Append their tap as a user bubble (timestamped)
  //   2. Mark that chip as "used" on the source message (it disappears
  //      from that message's chip strip, and is filtered from the global
  //      suggestion pool so it doesn't reappear)
  //   3. Show the typing indicator for 1.2–2.2s (random) — matches the
  //      signed-off cadence (1200 + Math.random() * 1000)
  //   4. Look up SUGGESTION_RESPONSES[chip], run fillTemplate with the
  //      current phase-aware context, and render as a normal Jess bubble
  //      with the remaining suggestion chips attached as follow-ups.
  async function handleChip(chipLabel, fromMessageId) {
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.id !== fromMessageId) return m;
        const usedSet = new Set(m.chipsUsedList || []);
        usedSet.add(chipLabel);
        return { ...m, chipsUsedList: Array.from(usedSet) };
      });
      return [
        ...next,
        { id: uid(), role: "user", type: "bubble", text: chipLabel, time: fmtTimeAmPm() },
      ];
    });
    setAssistantTyping(true);
    setTimeout(() => {
      const ctx = buildScriptedContext({ phase, dayInCycle, profile });
      const template = SUGGESTION_RESPONSES[chipLabel];
      const text = template
        ? fillTemplate(template, ctx)
        : "Tell me more about that — I'm listening.";
      // Track which chips have been used across the whole session so the
      // follow-up strip on this new bubble shows fresh suggestions only.
      setMessages((prev) => {
        const used = new Set();
        for (const m of prev) {
          if (Array.isArray(m.chipsUsedList)) for (const c of m.chipsUsedList) used.add(c);
        }
        used.add(chipLabel);
        const remaining = SUGGESTION_CHIPS.filter((c) => !used.has(c)).slice(0, 5);
        return [
          ...prev,
          {
            id: uid(),
            role: "jess",
            type: "bubble",
            text,
            time: fmtTimeAmPm(),
            chips: remaining,
          },
        ];
      });
      setAssistantTyping(false);
    }, 1200 + Math.random() * 1000);
  }

  async function handleSubmitText() {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    await sendUserText(msg);
  }

  function startMicMock() {
    if (listeningVoice) return;
    setListeningVoice(true);
    setTimeout(() => {
      setInput("Why am I so tired?");
      setListeningVoice(false);
    }, 2200);
  }

  function toggleQuickLogChip(messageId, chipLabel) {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== messageId || m.type !== "quick-log-chips") return m;
      const selected = m.selectedChips || [];
      const isOn = selected.includes(chipLabel);
      return { ...m, selectedChips: isOn ? selected.filter((c) => c !== chipLabel) : [...selected, chipLabel] };
    }));
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`jess-shell jess-${phase}`}
      style={{
        height: "100%", width: "100%",
        display: "flex", flexDirection: "column",
        background: C.cream, overflow: "hidden",
        maxWidth: 430, margin: "0 auto",
        paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
        position: "relative",
      }}
    >
      <KeyframesBlock />

      {/* Top bar */}
      <header style={{
        padding: "max(env(safe-area-inset-top), 12px) 16px 14px",
        background: `linear-gradient(180deg, ${shell.headerTint} 0%, ${C.cream} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Past conversations"
          style={{
            width: 36, height: 36, borderRadius: 9999, border: "none",
            background: "transparent", color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        ><History size={18} aria-hidden /></button>
        {/* Avatar ring — conic-gradient blush → gold → sage → blush
            slowly rotates. The sigil sits inside on cream so the
            gradient reads as a halo around her, not behind her. */}
        <div
          style={{
            width: 44, height: 44, borderRadius: 9999,
            background:
              "conic-gradient(from 0deg, #E8B4B8, #D4AF37, #8FAF8F, #E8B4B8)",
            padding: 2,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            animation: "jess-breathe 4s ease-in-out infinite, jess-avatar-spin 14s linear infinite",
          }}
          aria-hidden
        >
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            background: C.cream,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <BotanicalSigil size={26} stroke={shell.tone} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0,
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22, fontWeight: 600,
            color: C.espresso, letterSpacing: "-0.01em",
          }}>{assistantName}</h1>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 2, fontSize: 12,
            color: C.mutedText, fontFamily: "'Inter', sans-serif",
          }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: shell.accent }} />
            <span>Day {dayInCycle} · {shell.label}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={startNewConversation}
          aria-label="New conversation with Jess"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "0 10px", minHeight: 32, borderRadius: 9999,
            background: "transparent", color: C.espresso,
            border: `1px solid ${C.espresso}`,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <span aria-hidden style={{ color: C.gold, fontSize: 11 }}>✦</span>
          New
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Jess settings"
          style={{
            width: 40, height: 40, borderRadius: 9999, border: "none",
            background: C.paperHi, color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        ><Settings size={16} /></button>
      </header>

      {/* Tabs */}
      <div role="tablist" style={{
        display: "flex", gap: 0,
        background: C.cream, borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        {[
          { id: "chat",    label: "Chat",          Icon: MessageCircle },
          { id: "brief",   label: "Today's brief", Icon: Sun },
          { id: "insights",label: "Insights",      Icon: LineChart },
          { id: "foryou",  label: "For you",       Icon: Sparkles },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, minHeight: 44,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontSize: 11, fontWeight: 500, letterSpacing: "0.5px",
                color: active ? C.espresso : C.muted,
                borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
                padding: "10px 4px",
              }}
            >
              <t.Icon size={13} aria-hidden />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div
        key={tab}
        style={{
          flex: 1, overflowY: "auto", minHeight: 0,
          background: C.cream,
          animation: "jess-tab-slide 220ms ease-out",
        }}
      >
        {tab === "chat"     && (
          <ChatTab
            messages={messages}
            assistantTyping={assistantTyping}
            shell={shell}
            onChip={handleChip}
            onToggleQuickLog={toggleQuickLogChip}
            bottomRef={bottomRef}
            proactiveChips={proactiveChips}
            onProactiveChip={handleProactiveChip}
          />
        )}
        {tab === "brief"    && (
          <BriefTab phase={phase} dayInCycle={dayInCycle} shell={shell} tasks={tasks} energySpark={energySpark}
            tabChip="Jess, summarise my week" onTabChip={handleProactiveChip} />
        )}
        {tab === "insights" && (
          <InsightsTab phase={phase} dayInCycle={dayInCycle} shell={shell} energySpark={energySpark} symptoms={symptoms}
            recentCheckins={recentCheckins}
            jessObservation={insightObservation}
            observationLoading={observationLoading}
            tabChip="What pattern stands out most?" onTabChip={handleProactiveChip} />
        )}
        {tab === "foryou"   && (
          <ForYouTab phase={phase} shell={shell} profile={profile}
            tabChip="What's the one thing I should focus on today?" onTabChip={handleProactiveChip} />
        )}
      </div>

      {/* Input — chat tab only */}
      {tab === "chat" && (
        <div style={{
          padding: "10px 14px max(env(safe-area-inset-bottom), 10px)",
          background: C.cream,
          borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 8, flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={startMicMock}
            disabled={listeningVoice}
            aria-label={listeningVoice ? "Listening…" : "Voice input"}
            aria-pressed={listeningVoice}
            style={{
              border: `1px solid ${listeningVoice ? C.blush : C.border}`,
              borderRadius: 14, minWidth: 44, minHeight: 44,
              backgroundColor: listeningVoice ? C.blush : C.paper,
              padding: "0 12px", cursor: listeningVoice ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "background-color 200ms ease, border-color 200ms ease",
            }}
          ><Mic className="w-4 h-4" style={{ color: C.espresso }} /></button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitText()}
            placeholder={listeningVoice ? "Listening…" : `Message ${assistantName}…`}
            aria-label={`Message ${assistantName}`}
            style={{
              flex: 1, borderRadius: 14,
              border: `1px solid ${C.border}`,
              background: C.paper,
              padding: "11px 14px", minHeight: 44,
              fontSize: 14, color: C.espresso,
              fontFamily: "'Inter', sans-serif",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={handleSubmitText}
            disabled={!input.trim() || assistantTyping}
            aria-label="Send message"
            style={{
              border: "none", borderRadius: 14,
              background: C.gold, color: C.espresso,
              padding: "0 18px", minWidth: 44, minHeight: 44,
              cursor: "pointer",
              opacity: (!input.trim() || assistantTyping) ? 0.4 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          ><Send className="w-4 h-4" /></button>
        </div>
      )}

      <HistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conversations={conversationsList}
        conversationNames={conversationNames}
        activeId={conversationId}
        onSelect={loadConversation}
        onNew={startNewConversation}
      />

      <JessSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        profile={profile}
        onProfileChange={(p) => setProfile(p)}
      />
    </div>
  );
}

// ─── Keyframes block (one place) ──────────────────────────────────────────
function KeyframesBlock() {
  return (
    <style>{`
      @keyframes jess-breathe {
        0%, 100% { transform: scale(1);    opacity: 0.85; }
        50%      { transform: scale(1.08); opacity: 1; }
      }
      @keyframes jess-bubble-enter {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes jess-card-rise {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes jess-tab-slide {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes jess-pulse-dot {
        0%, 100% { opacity: 0.2; }
        50%      { opacity: 1; }
      }
      @keyframes jess-typing-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
        30%           { transform: translateY(-5px); opacity: 1; }
      }
      @keyframes jess-avatar-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes jess-drawer-in {
        from { transform: translateX(-100%); }
        to   { transform: translateX(0); }
      }
      @keyframes jess-overlay-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `}</style>
  );
}

// ─── Chat tab ─────────────────────────────────────────────────────────────
function ChatTab({
  messages, assistantTyping, shell, onChip, onToggleQuickLog, bottomRef,
  proactiveChips, onProactiveChip,
}) {
  return (
    <div style={{
      padding: "14px 14px 8px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {/* Proactive question chips — "Jess is thinking about you" row */}
      {Array.isArray(proactiveChips) && proactiveChips.length > 0 && (
        <div style={{ marginBottom: 2 }}>
          <p style={{
            margin: "0 0 6px 4px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, fontFamily: "'Inter', sans-serif",
          }}>Jess is thinking about you</p>
          <div
            role="list"
            aria-label="Proactive questions from Jess"
            style={{
              display: "flex", gap: 8,
              overflowX: "auto", paddingBottom: 4,
              scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
              scrollSnapType: "x proximity",
            }}
          >
            {proactiveChips.map((chip) => (
              <button
                key={chip}
                type="button"
                role="listitem"
                onClick={() => onProactiveChip(chip)}
                style={{
                  flexShrink: 0,
                  padding: "0 14px", minHeight: 44, borderRadius: 9999,
                  background: C.cream,
                  border: `1px solid ${C.espresso}`,
                  color: C.espresso,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  scrollSnapAlign: "start",
                }}
              >{chip}</button>
            ))}
          </div>
        </div>
      )}

      {messages.map((m) => (
        <MessageNode
          key={m.id}
          msg={m}
          shell={shell}
          onChip={onChip}
          onToggleQuickLog={onToggleQuickLog}
        />
      ))}
      {assistantTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

function formatHistoryDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  } catch { return "Past"; }
}

// ─── History drawer — slides in from the LEFT of the panel ───────────────
function HistoryDrawer({ open, onClose, conversations, conversationNames, activeId, onSelect, onNew }) {
  if (!open) return null;
  const list = (conversations || []).slice(0, 20);
  return (
    <div
      role="dialog"
      aria-label="Past conversations"
      aria-modal="true"
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        display: "flex",
      }}
    >
      {/* Overlay — tap to dismiss */}
      <button
        type="button"
        aria-label="Close conversation history"
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, padding: 0,
          background: "rgba(58,44,26,0.4)",
          border: "none", cursor: "pointer",
          animation: "jess-overlay-fade 200ms ease-out",
        }}
      />
      {/* Drawer surface */}
      <aside
        style={{
          position: "relative",
          width: "78%", maxWidth: 334, height: "100%",
          background: C.espressoDeep,
          color: C.cream,
          display: "flex", flexDirection: "column",
          animation: "jess-drawer-in 280ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 16px 12px",
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.cream, opacity: 0.85,
          }}>Conversations</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 9999, border: "none",
              background: "transparent", color: C.cream, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          ><X size={16} aria-hidden /></button>
        </header>

        <button
          type="button"
          onClick={() => { onClose(); onNew(); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px",
            background: "transparent", border: "none",
            borderLeft: `3px solid ${C.gold}`,
            color: C.gold, cursor: "pointer",
            textAlign: "left",
            fontFamily: "'Inter', sans-serif",
            fontSize: 13, fontWeight: 700,
          }}
        >
          <Plus size={14} aria-hidden />
          New conversation
        </button>

        <div style={{
          flex: 1, overflowY: "auto",
          padding: "8px 0 max(env(safe-area-inset-bottom), 16px)",
        }}>
          {list.length === 0 ? (
            <p style={{
              margin: "12px 16px", fontSize: 12, fontStyle: "italic",
              color: C.cream, opacity: 0.6, fontFamily: "'Inter', sans-serif",
            }}>No past conversations yet — they'll appear here once you've chatted with Jess.</p>
          ) : list.map((c) => {
            const id = c?.id || c?.conversation_id;
            const created = c?.created_at || c?.created_date || c?.updated_at;
            const when = created ? formatHistoryDate(created) : "Past";
            const isActive = activeId && id === activeId;
            // Prefer persisted/server name; fall back to first user-message snippet.
            const serverName = c?.name || c?.title;
            const persistedName = conversationNames?.[id];
            const msgs = Array.isArray(c?.messages) ? c.messages : [];
            const firstReal = msgs.find((m) =>
              m?.role === "user" && !String(m?.content || "").startsWith("[JESS CONTEXT")
            ) || msgs.find((m) => m?.role === "assistant");
            const snippet = String(firstReal?.content || "").replace(/\s+/g, " ").slice(0, 40);
            const label = persistedName || serverName || snippet || "Untitled chat";
            return (
              <button
                key={id || when + label}
                type="button"
                onClick={() => id && onSelect(id)}
                style={{
                  width: "100%", textAlign: "left",
                  display: "block",
                  padding: "10px 16px",
                  background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                  border: "none",
                  borderLeft: isActive ? `3px solid ${C.gold}` : "3px solid transparent",
                  color: C.cream, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <p style={{
                  margin: 0, fontSize: 13, fontWeight: 500, color: C.cream,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  lineHeight: 1.35,
                }}>{label}</p>
                <p style={{
                  margin: "2px 0 0", fontSize: 10, color: C.cream, opacity: 0.55,
                  letterSpacing: "0.04em",
                }}>{when}</p>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

// ─── Tab-level "ask Jess" chip shown at the top of non-chat tabs ─────────
function TabChip({ chip, onTap }) {
  if (!chip || !onTap) return null;
  return (
    <button
      type="button"
      onClick={() => onTap(chip)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "0 14px", minHeight: 44, borderRadius: 9999,
        background: C.cream,
        border: `1px solid ${C.espresso}`,
        color: C.espresso, cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13, fontWeight: 600,
        alignSelf: "flex-start",
        marginBottom: 4,
      }}
      aria-label={`Ask Jess: ${chip}`}
    >
      <span aria-hidden style={{ color: C.gold }}>✦</span>
      {chip}
    </button>
  );
}

function MessageNode({ msg, shell, onChip, onToggleQuickLog }) {
  if (msg.role === "user") {
    // user-bubble: blush #E8B4B8, espresso text, asymmetric 17px / 4px corners
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{
          maxWidth: "86%",
          borderRadius: "17px 17px 4px 17px",
          padding: "10px 13px",
          fontSize: 13.5, lineHeight: 1.6,
          fontFamily: "'Inter', sans-serif",
          background: C.blush, color: C.espresso,
          animation: "jess-bubble-enter 280ms ease-out",
        }}>{msg.text}</div>
        {msg.time && (
          <span style={{
            fontSize: 10, color: C.muted, marginTop: 3,
            fontFamily: "'Inter', sans-serif",
          }}>{msg.time}</span>
        )}
      </div>
    );
  }
  // Jess side — single substantive bubble. Insight-card / quick-log /
  // phase-card variants are retired; all responses now ship as Jess text
  // bubbles with rich, hormone-aware content from SUGGESTION_RESPONSES.
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{
        maxWidth: "86%",
        borderRadius: "17px 17px 17px 4px",
        padding: "10px 13px",
        fontSize: 13.5, lineHeight: 1.6,
        fontFamily: "'Inter', sans-serif",
        background: C.espresso, color: C.cream,
        boxShadow: "0 1px 4px rgba(58,44,26,0.06)",
        animation: "jess-bubble-enter 280ms ease-out",
        whiteSpace: "pre-wrap",
      }}>
        <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {msg.text || ""}
        </ReactMarkdown>
      </div>
      {msg.time && (
        <span style={{
          fontSize: 10, color: C.muted, marginTop: 3,
          fontFamily: "'Inter', sans-serif",
        }}>Jess · {msg.time}</span>
      )}
      <MhraNote />
      {Array.isArray(msg.chips) && msg.chips.filter((c) => !(msg.chipsUsedList || []).includes(c)).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {msg.chips
            .filter((c) => !(msg.chipsUsedList || []).includes(c))
            .map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChip(c, msg.id)}
                style={{
                  flexShrink: 0,
                  padding: "7px 13px",
                  background: C.creamDark,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  color: C.espresso,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5, fontWeight: 500,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// Typing indicator — three dots that pulse upward + dim, staggered.
// Matches the demo: 7px dots on espresso bubble, 0/0.22/0.44s delays.
function TypingIndicator() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "10px 13px", borderRadius: "17px 17px 17px 4px",
        background: C.espresso,
        animation: "jess-bubble-enter 280ms ease-out",
      }} aria-label="Jess is typing">
        {[0, 0.22, 0.44].map((delay, i) => (
          <span key={i} aria-hidden style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "rgba(244,237,219,0.45)",
            animation: `jess-typing-bounce 1.3s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Today's Brief tab ────────────────────────────────────────────────────
function BriefTab({ phase, dayInCycle, shell, tasks, energySpark, tabChip, onTabChip }) {
  const copy = PHASE_COPY[phase] || PHASE_COPY.follicular;
  const upcomingPhase = phase === "menstrual" ? "Follicular"
                     : phase === "follicular" ? "Ovulatory · day 14"
                     : phase === "ovulatory" ? "Luteal"
                     : "Menstrual";
  const daysAhead = phase === "follicular" ? "2 days" : "soon";
  const todayEnergy = energySpark[energySpark.length - 1];
  return (
    <div style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
      <TabChip chip={tabChip} onTap={onTabChip} />
      <Card animationDelay={0}>
        <p style={kicker}>This phase</p>
        <h2 style={{
          margin: "2px 0 6px", fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 22, fontWeight: 600, color: C.espresso, letterSpacing: "-0.01em",
        }}>{shell.label} · Day {dayInCycle}</h2>
        <p style={{
          margin: 0, fontSize: 13, color: C.mutedText,
          fontFamily: "'Inter', sans-serif", lineHeight: 1.55,
        }}>{copy.blurb}</p>
      </Card>
      <Card animationDelay={80}>
        <p style={kicker}>Energy forecast</p>
        <Sparkline data={energySpark} width={300} height={56} stroke={C.sage} />
        <p style={{
          margin: "8px 0 0", fontSize: 13, color: C.espresso,
          fontFamily: "'Inter', sans-serif", lineHeight: 1.55,
        }}>{copy.expect}</p>
        <p style={{
          margin: "6px 0 0", fontSize: 11, color: C.mutedText,
          fontFamily: "'Inter', sans-serif",
        }}>Today: <strong style={{ color: C.espresso }}>{todayEnergy?.toFixed?.(1) || todayEnergy}/5</strong> projected</p>
      </Card>
      <Card animationDelay={160}>
        <p style={kicker}>Today's priorities</p>
        {tasks.length === 0 ? (
          <p style={{
            margin: 0, fontSize: 13, color: C.mutedText,
            fontStyle: "italic", fontFamily: "'Inter', sans-serif",
          }}>Nothing scheduled — that itself can be a kind of plan.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {tasks.map((t) => (
              <li key={t.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderRadius: 10,
                background: C.paper, border: `1px solid ${C.border}`,
                fontSize: 13, color: C.espresso, fontFamily: "'Inter', sans-serif",
              }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: shell.accent }} />
                {t.title || "Task"}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card animationDelay={240} accent={shell.accent}>
        <p style={kicker}>One observation from Jess</p>
        <p style={{
          margin: 0, fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 17, fontWeight: 500, color: C.espresso, lineHeight: 1.4,
        }}>Your sleep has been steady. That's worth more than you think — it's the lever everything else moves through.</p>
        <MhraNote />
      </Card>
      <div style={{
        background: C.creamDark, border: `1px dashed ${C.border}`,
        borderRadius: 12, padding: "10px 14px",
        fontSize: 12, color: C.mutedText, fontFamily: "'Inter', sans-serif",
        animation: "jess-card-rise 320ms ease-out 320ms backwards",
      }}>
        <strong style={{ color: C.espresso }}>{upcomingPhase}</strong> in {daysAhead}. Jess will remind you.
      </div>
    </div>
  );
}

// ─── Insights tab — real data ────────────────────────────────────────────
// Three sections (per spec):
//   MOOD & ENERGY  — 3 arc gauges + 7-day mood-dots sparkline
//   YOUR PATTERNS — top 3 symptoms over last 14 days as ranked pills
//   JESS NOTICED  — 1-2 sentence observation generated by base44.agents
//
// Section headers are 10px uppercase espresso, letter-spacing 1.5px.
// Phase tints on the mood dots: blush=menstrual, sage=follicular,
// gold=ovulatory, muted=luteal.
function InsightsTab({
  phase, dayInCycle, shell, energySpark, symptoms,
  recentCheckins, jessObservation, observationLoading,
  tabChip, onTabChip,
}) {
  // ── Averages from the last 7 daily check-ins ──────────────────────────
  const last7 = (recentCheckins || []).slice(0, 7);
  function avg(field, fb) {
    const vals = last7.map((c) => Number(c?.[field] ?? c?.[fb])).filter(Number.isFinite);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10;
  }
  const aMood   = avg("mood", "mood_score");
  const aEnergy = avg("energy", "energy_level");
  const aStress = avg("stress", "stress_level");

  // ── 7-day mood spark — pulls real mood values, phase-tints each dot ──
  // Walks back from today; if a day has no checkin, leaves the dot
  // unfilled (border only) so the reader sees the gap rather than a
  // fake mid-value.
  const moodSpark = useMemo(() => {
    const today = new Date();
    const map = new Map();
    for (const c of recentCheckins || []) {
      if (!c?.date) continue;
      const key = String(c.date).split("T")[0];
      const v = Number(c?.mood ?? c?.mood_score);
      if (Number.isFinite(v)) map.set(key, v);
    }
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];
      out.push({
        label: ["S","M","T","W","T","F","S"][d.getDay()],
        value: map.has(key) ? map.get(key) : null,
      });
    }
    return out;
  }, [recentCheckins]);

  // ── Top 3 symptoms over the last 14 days ─────────────────────────────
  const topSymptoms = useMemo(() => {
    const cutoff = Date.now() - 14 * 86400000;
    const count = {};
    for (const s of symptoms || []) {
      const d = s?.date || s?.created_date;
      const t = d ? new Date(d).getTime() : NaN;
      if (!Number.isFinite(t) || t < cutoff) continue;
      const k = (s?.symptom_type || s?.symptom_name || "").toString().trim();
      if (!k) continue;
      count[k] = (count[k] || 0) + 1;
    }
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [symptoms]);

  // Phase tint used to colour the mood dot for today (most-recent dot is
  // tinted by the user's current phase; the others stay neutral so the
  // newest reading is visually anchored).
  const phaseDotTint = {
    menstrual:  C.blush,
    follicular: C.sage,
    ovulatory:  C.gold,
    luteal:     C.muted,
  }[phase] || C.muted;

  return (
    <div style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <TabChip chip={tabChip} onTap={onTabChip} />

      {/* MOOD & ENERGY */}
      <section>
        <p style={sectionHeader}>MOOD &amp; ENERGY</p>
        <article style={{
          background: C.creamDark,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "16px 14px 14px",
          animation: "jess-card-rise 320ms ease-out backwards",
        }}>
          <div style={{ display: "flex", justifyContent: "space-around", gap: 8, marginBottom: 12 }}>
            <ArcGauge label="Mood"   value={aMood}   max={5} color={shell.accent} />
            <ArcGauge label="Energy" value={aEnergy} max={5} color={C.gold} />
            <ArcGauge label="Stress" value={aStress} max={5} color={C.blush} />
          </div>
          <p style={{
            margin: "4px 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            color: C.muted, fontFamily: "'Inter', sans-serif",
          }}>7-DAY MOOD</p>
          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            {moodSpark.map((d, i) => {
              const isToday = i === moodSpark.length - 1;
              const tint = isToday ? phaseDotTint : C.muted;
              const hasValue = d.value != null;
              return (
                <div key={i} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                }}>
                  <span aria-hidden style={{
                    width: 12, height: 12, borderRadius: 9999,
                    background: hasValue ? tint : "transparent",
                    border: hasValue ? "none" : `1.5px dashed ${C.border}`,
                    opacity: hasValue ? (0.4 + (d.value / 5) * 0.6) : 1,
                  }} />
                  <span style={{
                    fontSize: 10, color: C.muted, fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                  }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* YOUR PATTERNS */}
      <section>
        <p style={sectionHeader}>YOUR PATTERNS</p>
        <article style={{
          background: C.creamDark,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "14px",
          animation: "jess-card-rise 320ms ease-out 80ms backwards",
        }}>
          {topSymptoms.length === 0 ? (
            <p style={{
              margin: 0, fontSize: 13, color: C.muted, fontStyle: "italic",
              fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
            }}>Jess hasn't seen consistent symptom patterns yet. Keep logging and patterns will surface.</p>
          ) : (
            <ul style={{
              margin: 0, padding: 0, listStyle: "none",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {topSymptoms.map(([name, count], i) => (
                <li key={name} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 9999,
                  background: C.cream, border: `1px solid ${C.border}`,
                }}>
                  <span aria-hidden style={{
                    width: 22, height: 22, borderRadius: 9999,
                    background: C.gold, color: C.espresso,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 13, fontWeight: 700,
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{
                    flex: 1, fontSize: 13.5, fontWeight: 600, color: C.espresso,
                    fontFamily: "'Inter', sans-serif",
                  }}>{name}</span>
                  <span style={{
                    padding: "3px 9px", borderRadius: 9999,
                    background: C.espresso, color: C.cream,
                    fontSize: 11, fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.04em",
                  }}>×{count}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {/* JESS NOTICED */}
      <section>
        <p style={sectionHeader}>JESS NOTICED</p>
        <article style={{
          background: C.espresso, color: C.cream,
          borderRadius: 14,
          padding: "14px 14px 12px",
          animation: "jess-card-rise 320ms ease-out 160ms backwards",
          boxShadow: "0 -1px 0 rgba(212,175,55,0.22) inset",
        }}>
          {observationLoading && !jessObservation ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span aria-hidden style={{
                display: "block", width: "94%", height: 12, borderRadius: 6,
                background: "linear-gradient(90deg, rgba(244,237,219,0.10) 0%, rgba(244,237,219,0.30) 50%, rgba(244,237,219,0.10) 100%)",
                backgroundSize: "200% 100%",
                animation: "plannerJessShimmer 1.4s ease-in-out infinite",
              }} />
              <span aria-hidden style={{
                display: "block", width: "70%", height: 12, borderRadius: 6,
                background: "linear-gradient(90deg, rgba(244,237,219,0.10) 0%, rgba(244,237,219,0.30) 50%, rgba(244,237,219,0.10) 100%)",
                backgroundSize: "200% 100%",
                animation: "plannerJessShimmer 1.4s ease-in-out 0.2s infinite",
              }} />
            </div>
          ) : (
            <p style={{
              margin: 0, fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 15, fontStyle: "italic", lineHeight: 1.45, color: C.cream,
            }}>
              {jessObservation || "I'm still learning the shape of your week. Log a couple more days and patterns will surface."}
            </p>
          )}
          <p style={{
            margin: "10px 0 0", fontSize: 10, fontStyle: "italic", lineHeight: 1.4,
            color: "rgba(244,237,219,0.65)", fontFamily: "'Inter', sans-serif",
          }}>Not medical advice. Always consult a healthcare professional.</p>
        </article>
      </section>

      {/* Shimmer keyframe — local to this tab so the panel doesn't need
          a global style block. */}
      <style>{`
        @keyframes plannerJessShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// 3/4-circle arc gauge — stroke-dashoffset pattern.
function ArcGauge({ label, value, max, color }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  // Use a 3/4 visible arc so the label sits below the gap.
  const arcLength = circumference * 0.75;
  const ratio = value == null ? 0 : Math.max(0, Math.min(1, value / max));
  const offset = arcLength * (1 - ratio);
  const display = value == null ? "—" : value;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 76 }}>
      <svg width={76} height={76} viewBox="0 0 76 76" aria-hidden style={{ display: "block" }}>
        {/* Background arc */}
        <circle
          cx={38} cy={38} r={radius} fill="none" stroke={C.border} strokeWidth={6}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(135 38 38)"
        />
        {/* Value arc */}
        <circle
          cx={38} cy={38} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 38 38)"
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1)" }}
        />
        <text
          x={38} y={42}
          textAnchor="middle"
          fontFamily="'Fraunces', Georgia, serif"
          fontSize={18} fontWeight={600}
          fill={C.espresso}
        >{display}</text>
        <text
          x={38} y={56}
          textAnchor="middle"
          fontFamily="'Inter', sans-serif"
          fontSize={8} fontWeight={600}
          fill={C.muted}
          letterSpacing="0.08em"
        >/ {max}</text>
      </svg>
      <p style={{
        margin: 0, fontSize: 11, fontWeight: 600, color: C.espresso,
        fontFamily: "'Inter', sans-serif", letterSpacing: "0.02em",
      }}>{label}</p>
    </div>
  );
}

// Section header — 10px uppercase espresso, letter-spacing 1.5px per spec.
const sectionHeader = {
  margin: "0 0 8px 4px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "1.5px",
  color: C.espresso,
  fontFamily: "'Inter', sans-serif",
  textTransform: "uppercase",
};

function DigDeeperRow() {
  return (
    <button
      type="button"
      onClick={() => {}}
      style={{
        marginTop: 10, padding: 0, background: "transparent", border: "none",
        cursor: "pointer", color: C.muted,
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
        fontFamily: "'Inter', sans-serif",
      }}
    >Dig deeper <ChevronRight size={12} /></button>
  );
}

// ─── For You tab ──────────────────────────────────────────────────────────
function ForYouTab({ phase, shell, profile, tabChip, onTabChip }) {
  const copy = PHASE_COPY[phase] || PHASE_COPY.follicular;
  const lifeStage = profile?.life_stage || "reproductive";
  const habitSuggestions = lifeStage === "perimenopause" || lifeStage === "menopause"
    ? [
        "Two strength sessions a week protect bone density in this stage",
        "Track hot flashes in the Symptom logger — patterns emerge fast",
      ]
    : lifeStage.startsWith("pregnant")
    ? [
        "Daily 10-minute walks support circulation through pregnancy",
        "Pelvic-floor practice 3× a week pays back in the months ahead",
      ]
    : [
        "Move daily — even 5 minutes counts toward consistency",
        "Hydration first: aim for a glass of water before coffee",
      ];
  const patternNudges = [
    "Your energy lifts the day after journaling — keep that streak alive.",
    "Last cycle you slept best on days you walked after dinner.",
  ];
  return (
    <div style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
      <TabChip chip={tabChip} onTap={onTabChip} />
      <Card animationDelay={0} accent={shell.accent}>
        <p style={kicker}>This week · {shell.label}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {copy.forYou.map((rec, i) => (
            <li key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 0", borderBottom: i < copy.forYou.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span aria-hidden style={{
                flexShrink: 0, marginTop: 5,
                width: 6, height: 6, borderRadius: 9999, background: shell.accent,
              }} />
              <span style={{
                flex: 1, fontSize: 13, color: C.espresso,
                fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
              }}>{rec}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card animationDelay={80}>
        <p style={kicker}>Based on your patterns</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {patternNudges.map((n, i) => (
            <li key={i} style={{
              padding: "10px 12px", borderRadius: 10,
              background: C.paper, border: `1px solid ${C.border}`,
              fontSize: 13, color: C.espresso,
              fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
            }}>{n}</li>
          ))}
        </ul>
      </Card>
      <Card animationDelay={160}>
        <p style={kicker}>Habit suggestions · {lifeStage.replace("-", " ")}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {habitSuggestions.map((h, i) => (
            <li key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              background: C.paper, border: `1px solid ${C.border}`,
              fontSize: 13, color: C.espresso,
              fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
            }}>
              <Check size={14} style={{ color: C.sage, flexShrink: 0, marginTop: 2 }} aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      </Card>
      <div style={{
        background: C.espresso, color: C.cream,
        borderRadius: 12, padding: "12px 14px",
        animation: "jess-card-rise 320ms ease-out 240ms backwards",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Sparkles size={14} style={{ color: C.gold, flexShrink: 0 }} aria-hidden />
        <p style={{
          margin: 0, fontSize: 12, fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
        }}>
          <strong>Jess is learning.</strong> The more you log, the smarter these get. 47 data points so far this cycle.
        </p>
      </div>
      <MhraNote />
    </div>
  );
}

// ─── Small UI primitives ──────────────────────────────────────────────────
const kicker = {
  margin: "0 0 8px", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontFamily: "'Inter', sans-serif",
};
const bodyText = {
  fontSize: 13, color: C.mutedText,
  fontFamily: "'Inter', sans-serif", lineHeight: 1.55,
};

function Card({ children, animationDelay = 0, accent }) {
  return (
    <article style={{
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderLeft: accent ? `3px solid ${accent}` : `1px solid ${C.border}`,
      borderRadius: 14, padding: "14px",
      boxShadow: "0 2px 10px rgba(58,44,26,0.06)",
      animation: `jess-card-rise 320ms ease-out ${animationDelay}ms backwards`,
    }}>{children}</article>
  );
}
