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
  Mic, Send, Settings, ChevronRight,
  MessageCircle, Sun, LineChart, Sparkles, History, X,
  Search, Trash2,
  Apple, Activity, Moon, Heart, Users, ThumbsUp, ThumbsDown, Star,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
// Brand-P2: the carved crimson heart brand mark (§3) for the Jess header.
import { Heart as BrandHeart } from "@/components/journal/Editorial";
import JessSettingsSheet from "./JessSettingsSheet";
import JessVoiceLogger from "./JessVoiceLogger";
// Sprint 5 — Voice Companion replaces the Voice Logger sheet for the
// mic button. JessVoiceLogger stays in the repo (not deleted) but is
// no longer reachable from any UI path.
import JessVoiceMode from "./JessVoiceMode";
import {
  extractMemoriesFromConversation,
  loadTopMemories,
} from "@/services/jessMemoryService";
import {
  callJessAgent,
  loadDailyCache,
  saveDailyCache,
  todayKey,
} from "@/services/jessAgentService";
// Shared phase recommendation data — also consumed by PlannerV2Shell
// Body Today chip strip (Phase 2 P2-4). See src/data/phaseRecs.js.
import { PHASE_RECS, NEXT_PHASE_PREVIEW } from "@/data/phaseRecs";
import { pickProfile } from "@/utils/userProfile";
// Jess v2 J2-3 — sensitive topic classifier + referral copy.
// (Legacy URGENCY_REFERRAL / DISTRESS_REFERRAL / classifyJessInput
// imports trimmed after Sprint 5 — the new classifySensitiveTopic +
// getCrisisConfig API supersedes them.)
import {
  classifySensitiveTopic,
  getCrisisConfig,
  GROUNDING_5_4_3_2_1,
} from "@/services/jessSensitiveTopics";
import {
  recordFeedback,
  loadRecentFeedback,
  feedbackDirective,
  REASONS as FEEDBACK_REASONS,
} from "@/services/jessFeedback";
// Sprint 5 — Action Layer envelope + executor
import {
  parseJessResponse,
  executeJessActions,
  updateJessMemory,
  loadJessMemory,
  saveJessMemory,
  buildMemoryContextLine,
  chipLabelForAction,
  injectMealPlanIfNeeded,
  injectTaskIfNeeded,
  injectMoodIfNeeded,
  injectSymptomIfNeeded,
  injectHydrationIfNeeded,
  injectJournalIfNeeded,
  injectMedicationIfNeeded,
  injectSupplementIfNeeded,
  injectHabitIfNeeded,
} from "@/services/jessActions";
import {
  fetchWeeklyStats,
  buildWeeklyStatsContext,
  matchesWeeklySummaryAsk,
} from "@/services/jessWeeklyStats";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";

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

// ─── Feature 4 — For You data ─────────────────────────────────────────────
// PHASE_RECS and NEXT_PHASE_PREVIEW have moved to src/data/phaseRecs.js
// so PlannerV2Shell (Body Today chips) can share the same source of
// truth as the Jess For You tab. See the import block above.

// ─── Helpers ──────────────────────────────────────────────────────────────
function derivePhase(profile) {
  // NO FAKE PHASE. This used to return {phase:"follicular", dayInCycle:1} when her cycle
  // anchor was missing, which then went into the LLM context below as a literal
  // "Today: Day 1 of cycle · follicular phase" — so Jess spoke to her with confidence about
  // a cycle position that had been invented. In a wellness app that is not a cosmetic
  // default, it's the assistant making something up about her body. Returning null routes
  // her to the same honest no-cycle line the meno/peri stages already use.
  if (!profile?.last_period_start_date) return { phase: null, dayInCycle: null };
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
function buildJessContext({ user, profile, todayCheckin, recentCheckins, symptoms, tasks, lastJournal, phase, dayInCycle, memories }) {
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

  // Sprint 9 QA fix — peri/meno/post-meno users have no meaningful
  // cycle phase. Feeding "Day N of cycle · luteal phase" into the LLM
  // context for those stages caused Jess to talk about phases anyway,
  // bypassing the persona extension. Swap the cycle line for a stage
  // line in those cases.
  const isMenoStageCtx = !!lifeStage && ["perimenopause", "menopause", "post-menopause"].includes(lifeStage);
  // `phase` is now null when her cycle anchor is missing (see derivePhase) — say so plainly
  // rather than inventing a day. Jess can still be useful without knowing where she is.
  const todayLine = isMenoStageCtx
    ? `Today: life stage = ${lifeStage} (no cycle phase — periods are irregular or absent)`
    : (phase && dayInCycle)
      ? `Today: Day ${dayInCycle} of cycle · ${phase} phase`
      : `Today: life stage = ${lifeStage} (cycle dates not recorded — do NOT state or guess a cycle day or phase)`;

  const lines = [
    "[JESS CONTEXT — do not mention this block to the user]",
    `User: ${firstName}, life stage: ${lifeStage}`,
    todayLine,
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
  ];
  // ── Memory injection (Feature 2 — JessMemory entity) ─────────────────
  // Append the top-N most-important persistent memories so Jess can
  // reference them naturally. Omit the block entirely when empty so the
  // prompt stays clean for first-time users.
  const memList = Array.isArray(memories) ? memories.filter((m) => m?.content) : [];
  if (memList.length > 0) {
    lines.push("--- JESS MEMORY ---");
    lines.push("Things Jess remembers about this user:");
    for (const m of memList) {
      lines.push(`• [${m.memory_type || "memory"}] ${m.content}`);
    }
    lines.push("(Reference these naturally in conversation — don't list them all at once)");
    lines.push("---");
  }
  lines.push("[Respond in character. Be specific to this data. Never diagnose. Frame as wellness companion.]");
  // QA round 3 — regression guard. The base44 agent had been calling an
  // internal `log water` tool on EVERY user message ("Done — I logged
  // 300 ml of water for today."). Tell the agent in no uncertain terms
  // that it does NOT have tool access. The user logs data through the
  // dedicated Track surfaces; Jess is a *conversational* companion only.
  lines.push("[CRITICAL — NO TOOL CALLS. You do NOT have any logging, tracking, or data-write tools available. NEVER say 'I logged', 'I tracked', 'I saved', 'I recorded', 'Done — logged X', or any phrase implying you wrote data on the user's behalf. NEVER fabricate water, mood, energy, symptom, meal, medication, or supplement entries. The user logs ALL data themselves via the dedicated Track / Today / voice-logger surfaces. Your job is conversation only — listen, reflect, suggest, encourage. If the user mentions they drank water / ate / felt something, acknowledge it warmly without claiming to have logged anything.]");
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
    "On day {cycleDay}, your body needs:\n\n- Iron-rich foods — lentils, spinach, dark chocolate, red meat if you eat it — to replenish what you're losing\n\n- Omega-3s — salmon, walnuts, flaxseed — reduce prostaglandin activity which is causing your cramps\n\n- Magnesium — dark chocolate, pumpkin seeds, avocado — eases muscle tension including the back ache\n\nAvoid alcohol and excess caffeine today — they increase inflammation and can worsen cramping.",

  "Best movement for right now":
    "Day {cycleDay} in your {phase} phase calls for something specific.\n\nWhat actually helps:\n\n- A 10–15 minute walk — enough to release endorphins and ease cramping through improved circulation\n\n- Yin yoga or gentle stretching — especially hip openers and child's pose\n\n- A heating pad while you rest — this is movement's peer right now\n\nThe research is clear: light movement beats rest for period pain, but don't push. Listen to what your body is telling you today.",

  "Why am I so tired?":
    "Three things converge in your {phase} phase to affect your energy:\n\n1. Progesterone shift — your progesterone is {progesteroneContext} which directly impacts energy levels.\n\n2. Your body is doing significant work internally right now — that's metabolically costly.\n\n3. Prostaglandins — the chemicals that regulate your cycle also trigger systemic inflammation, which makes you feel heavy and fatigued.\n\nThis is your body doing exactly what it should. Energy typically shifts again around day {energyReturnDay}.",

  "What's coming in my cycle?":
    "Based on your profile:\n\n- You're on day {cycleDay} of your {phase} phase.\n\n- {nextPhase}: {nextPhaseDescription}\n\n- {ovulatoryNote}\n\n- {lutealNote}\n\nWant me to mark any of these in your planner?",

  "Help me sleep tonight":
    "Here's what actually helps:\n\n- Warm shower or bath about an hour before bed — drops your core temperature when you get out, which signals sleep\n\n- 200–400mg magnesium glycinate is the most evidence-backed sleep supplement — especially effective in the {phase} phase\n\n- Sleep position: fetal position (on your side, knees pulled up) reduces pressure and eases any discomfort\n\n- Warm compress on your lower abdomen if needed\n\nAvoid your phone for the last 30 mins — blue light plus stress content are a bad combination when your nervous system is activated.",

  "How do I manage cramps?":
    "Cramps come from prostaglandins — chemicals that signal your uterus to contract. A few things move that dial:\n\n- A heating pad on your lower abdomen for 20 minutes — heat dilates blood vessels and relaxes the muscle directly.\n\n- Ibuprofen taken at the first sign (rather than once pain has set in) is the most effective NSAID for period pain — it blocks prostaglandin production at the source.\n\n- Light walking releases endorphins, your body's own pain modulators.\n\n- Hip-opening stretches — child's pose, supine twist — give the pelvis space.\n\nIf cramps are stopping your day three months in a row, that's worth flagging to a clinician.",

  "What's my energy like this week?":
    "You're on day {cycleDay} of your {phase} phase, which means:\n\n- Right now, your hormones are {hormoneState} — that's why today feels the way it does.\n\n- Looking ahead: {nextPhase} starts in {daysToNextPhase} day(s). {nextPhaseDescription}\n\n- The rest of this week tracks the same arc — Jess will surface gentler suggestions when your body asks for them.",

  "Tell me about tomorrow":
    "Tomorrow you'll be on day {tomorrowDay} of your cycle — still in your {phase} phase.\n\nWhat that means in practice:\n\n- Energy is {hormoneState}\n- Sleep tends to {sleepTrend} in this window\n- Best work for tomorrow: {workMode}\n\nWant me to draft a soft schedule that respects this?",
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
// When her cycle anchor is missing, `phase`/`dayInCycle` are null (see derivePhase) and the
// scripted templates below — "You're on day {cycleDay} of your {phase} phase" — have nothing
// truthful to say. Rather than print "day null of your null phase", or silently invent a day
// as this file used to, Jess says she doesn't know and offers the one-tap way to tell her.
const NO_CYCLE_REPLIES = [
  "I don't have your cycle dates yet, so I won't guess where you are — I'd rather be useful than confident. Add your last period date in Cycle Settings and I'll tailor this properly.\n\nIn the meantime: what's actually on your mind today?",
  "I can't see your cycle dates, so I'm not going to pretend I know how today should feel.\n\nTell me what's going on and I'll help with what's in front of you — and if you add your dates in Cycle Settings, I can be a lot more specific next time.",
];

function buildScriptedContext({ phase, dayInCycle, profile }) {
  const hasCycle = !!phase && Number.isFinite(dayInCycle);
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
    hasCycle,
    cycleDay: dayInCycle,
    tomorrowDay,
    phase,
    // null-safe: `phase` can now legitimately be null, and this threw on .charAt before
    phaseTitle: phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "",
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

// QA found assistant replies sometimes contain a JSON array of
// suggestion chips at or near the end, e.g.
//   "Sure! ["Try journaling", "Take a walk"]"
//   "...thoughts? ["Yes", "No"]."
//   "...some help?\n\n```json\n["A","B"]\n```"
// The MessageNode already renders msg.chips as tappable buttons, but
// the raw JSON was bleeding into the bubble text. This parser searches
// the LAST half of the text for the rightmost balanced `[...]` block,
// validates it parses as an array of short strings, lifts it into
// chips, and returns the prose without it. Partial streaming chunks
// (`[`, `["Try`, etc.) fail validation and the raw text is preserved
// until a complete array arrives in a later stream tick.
function splitChipsFromText(raw) {
  const text = String(raw || "");
  if (!text || text.length < 6) return { text, chips: null };
  // Strip ```json fences first so they don't interfere with the
  // bracket scan (and we don't leave the fences in the visible text).
  const cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");
  // Find the rightmost `[` and try to parse from there forward,
  // walking back further on failure. This handles trailing punctuation
  // like `].` or `]\n` and any text that follows the array.
  let bestOpen = -1;
  let bestClose = -1;
  let scanFrom = cleaned.length;
  for (let attempts = 0; attempts < 4; attempts++) {
    const openIdx = cleaned.lastIndexOf("[", scanFrom);
    if (openIdx < 0) break;
    // Find a balanced `]` starting from openIdx.
    let depth = 0;
    let inStr = false;
    let strChar = "";
    let escape = false;
    let closeIdx = -1;
    for (let i = openIdx; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escape) { escape = false; continue; }
      if (inStr) {
        if (ch === "\\") { escape = true; continue; }
        if (ch === strChar) inStr = false;
        continue;
      }
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) { closeIdx = i; break; }
      }
    }
    if (closeIdx > openIdx) {
      bestOpen = openIdx;
      bestClose = closeIdx;
      break; // Found a balanced array — try parsing it.
    }
    // No balance — try the next `[` to the left.
    scanFrom = openIdx - 1;
  }
  if (bestOpen < 0 || bestClose < 0) return { text, chips: null };
  const jsonSlice = cleaned.slice(bestOpen, bestClose + 1);
  let parsed = null;
  try { parsed = JSON.parse(jsonSlice); } catch { return { text, chips: null }; }
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 12) {
    return { text, chips: null };
  }
  // Coerce each item to a string label. Reject if any item produces an
  // empty string or anything obscenely long (>80 chars — chip labels
  // are short by design).
  const chips = [];
  for (const v of parsed) {
    let s = "";
    if (typeof v === "string") s = v;
    else if (v && typeof v === "object" && typeof v.label === "string") s = v.label;
    else if (v && typeof v === "object" && typeof v.text === "string") s = v.text;
    else return { text, chips: null };
    s = s.trim();
    if (!s || s.length > 80) return { text, chips: null };
    chips.push(s);
  }
  // Strip the array + any common LLM prefix label + any trailing tail
  // text (the array is the last meaningful content, drop everything
  // after it too).
  let head = cleaned.slice(0, bestOpen).trimEnd();
  // QA round 4 — agent often ends with a bare label like "\n\noptions"
  // (no colon, no dash). Strip the label EVEN WHEN the trailing
  // punctuation is absent. We match a SHORT lowercase/Title-case label
  // at the end, optionally followed by `:`/`-`/`—`, then collapse the
  // trailing whitespace.
  head = head.replace(/\b(?:Suggestions?|Chips?|Quick replies?|Options?|Next steps?|Follow[-\s]?ups?)\s*[:\-—]?\s*$/i, "").trimEnd();
  // Trailing colon or dash left behind after the prefix strip.
  head = head.replace(/[:\-—]\s*$/, "").trimEnd();
  return { text: head, chips };
}

// QA round 3 — the base44 personal_assistant agent has been firing an
// auto "log water" tool on every user message, prefixing replies with
// "Done — I logged 300 ml of water for today." We've told the agent
// not to do this via the JESS CONTEXT block, but as defence-in-depth
// strip any such confessions from the visible text. We only strip
// lines that match a strict "tool-confirmation" shape so genuine
// wellness chat that mentions water / mood / etc. isn't mangled.
const TOOL_CONFIRMATION_LINE = /^\s*(?:done[\s—–-]+|✓\s*|✅\s*)?\bi\s+(?:just\s+)?(?:logged|tracked|saved|recorded|noted|added|created)\b[^\n]*\.?\s*$/i;
function stripToolConfirmations(text) {
  if (!text) return text;
  const lines = text.split(/\n/);
  const kept = lines.filter((line) => !TOOL_CONFIRMATION_LINE.test(line));
  // If we stripped at least one line, collapse leading blank lines.
  if (kept.length !== lines.length) {
    return kept.join("\n").replace(/^\s+/, "").replace(/\n{3,}/g, "\n\n");
  }
  return text;
}

// ─── Main panel ───────────────────────────────────────────────────────────
// Sprint 1 S1-1 — JessDemoPanel is wrapped in an error boundary so a
// render-time crash (e.g. the feedbackByMsgId ReferenceError we just
// patched) doesn't take the whole page down. Default export is now
// the wrapped version below; the raw component is `JessDemoPanelInner`.
export default function JessDemoPanel(props) {
  return (
    <JessErrorBoundary variant="panel" label="JessDemoPanel">
      <JessDemoPanelInner {...props} />
    </JessErrorBoundary>
  );
}

// Once-per-tab breadcrumb so we can tell the boundary fallback apart
// from "JessDemoPanel never mounted in the first place". Only logs on
// the first invocation per page load — subsequent renders are silent.
let _jessPanelLoggedOnce = false;

function JessDemoPanelInner({ initialPrompt = null } = {}) {
  if (!_jessPanelLoggedOnce) {
    _jessPanelLoggedOnce = true;
    try { console.log("[jess-mount] JessDemoPanelInner entered render"); } catch {}
  }
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [lastJournal, setLastJournal] = useState(null);
  const [tab, setTab] = useState("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Feature 3 — full-screen voice logger overlay.
  const [voiceLoggerOpen, setVoiceLoggerOpen] = useState(false);
  // Sprint 5 — JessVoiceMode (Voice Companion) is the active mic UI.
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  // Chat state.
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  // Sprint 5 — Action Layer memory. Rolling-20 breadcrumb of the
  // user's recent turns + which actions Jess executed. Persisted to
  // localStorage `jess_memory_<userId>` and injected into the next
  // outgoing user turn via the [MEMORY CONTEXT] block in the system
  // envelope.
  const [jessMemory, setJessMemory] = useState([]);
  // Pair each outgoing user message with the assistant reply that
  // streams back so updateJessMemory can record the right user turn.
  const pendingUserMsgRef = useRef(null);
  // QA Fix 4 — feedback state lives OUTSIDE the messages array.
  // Previously we tried to add `rating` / `ratingReason` directly to the
  // msg object, but the base44 streaming handler rebuilds messages on
  // every chunk; even with `...next[i]` spreads, race conditions could
  // wipe the rating mid-keystroke. Keying off a separate map by msg.id
  // is rock-solid: streaming never touches it, and FeedbackRow gets a
  // stable, predictable prop.
  const [feedbackByMsgId, setFeedbackByMsgId] = useState({});
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
  // from the left, lists past conversations from the JessConversation
  // entity, lets the user resume + rename + delete any of them.
  const [drawerOpen, setDrawerOpen] = useState(false);
  // jessConvos: real JessConversation records loaded from base44.
  const [jessConvos, setJessConvos] = useState([]);
  // activeConvRecord: the JessConversation row for the current thread.
  // conversationId is its agent_conv_id (the base44.agents conversation
  // ID we addMessage against).
  const [activeConvRecord, setActiveConvRecord] = useState(null);
  // Search filter (client-side) over jessConvos names + previews.
  const [historySearch, setHistorySearch] = useState("");
  // Feature 2 — top-N persistent JessMemory rows for this user, sorted
  // by importance_score desc. Refreshed on mount + after every
  // extractMemoriesFromConversation run. Empty array is the no-memory
  // baseline (no schema yet, no extractions yet) — the context block
  // omits the memory section in that case.
  const [memories, setMemories] = useState([]);
  // Track whether the context block has been sent for this convo so we only
  // inject it once per conversation. We also remove an id from this set when
  // the user resumes an old conversation, so we re-inject fresh context
  // before their next message lands.
  const contextInjectedRef = useRef(new Set());
  // Remember the first two user messages per active conversation so the
  // auto-namer (Feature 1B) has enough context after message #2 to pick
  // a 2-4 word title.
  const firstUserMsgRef = useRef({}); // legacy single-message cache
  const conversationUserMsgsRef = useRef({}); // convId → [msg1, msg2]
  const namingFiredRef = useRef(new Set()); // convIds we've already named
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);
  const seenAgentIdsRef = useRef(new Set());
  // QA round 6 — set of assistant message ids we've already logged a
  // `[jess-subscribe]` line for, so the breadcrumb fires once per
  // message instead of once per stream chunk (~24x).
  const loggedSubscribeIdsRef = useRef(new Set());
  // Sprint 5 — assistant ids for which we've already parsed the JSON
  // envelope + executed actions. Streaming sends the same id many
  // times; we only want to fire writes once per reply.
  const actionsFiredRef = useRef(new Set());
  // QA FIX 1 — 30s timeout ref. Cleared as soon as the subscribe
  // handler renders the first chunk of Jess's reply.
  const jessTimeoutRef = useRef(null);
  // QA round 4 — userRef. subscribeToConversation is useCallback([])
  // so its closure captures the user value at first render — which is
  // null (auth still loading). The action-firing block was reading
  // `user?.id` from the stale closure, so executeJessActions silently
  // skipped for every reply. userRef.current always points to the
  // latest user (synced every render below), so the subscribe handler
  // can read a fresh id at execute time without busting the memoised
  // callback.
  const userRef = useRef(null);
  userRef.current = user;
  // QA round 5 — persistent ref to the latest user message text.
  // pendingUserMsgRef gets cleared after the first action fires, so
  // we need a second ref that stays populated long enough for the
  // meal-plan injector to read it from the streaming subscribe
  // handler. Set by sendUserText, never cleared (only overwritten).
  const lastUserMessageRef = useRef("");

  // ── Load data ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (!u?.id || cancelled) return;
        setUser(u);
        // Sprint 5 — hydrate the Action Layer memory ring once we know
        // the user's id. Failure-tolerant (loadJessMemory returns [] on
        // any storage hiccup).
        try { setJessMemory(loadJessMemory(u.id)); } catch {}
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
        // NOT [0] — she can have several profile rows and only one carries her cycle data
        // (measured: 5 rows for the test user, the real one at index 3). See utils/userProfile.
        const realProfile = pickProfile(profiles);
        if (realProfile) setProfile(realProfile);
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
  //
  // Sprint 9 QA fix — peri/meno/post-meno users don't have a meaningful
  // "follicular phase" or "day of cycle". For those stages we swap the
  // opener to a stage-appropriate greeting that mirrors the persona
  // extension in jessAgentService.js.
  useEffect(() => {
    if (followUpFired) return;
    // When opened from an Ask-Jess surface with a seeded prompt, the seed
    // effect drives the first turn — never schedule the scripted opener, so
    // it can't race the seeded exchange (a delayed setMessages([opener])
    // would otherwise wipe the auto-sent question + answer).
    if (initialPrompt) return;
    if (!profile && recentCheckins.length === 0) return; // wait for first data tick
    const t = setTimeout(() => {
      setFollowUpFired(true);
      const lifeStage = profile?.life_stage;
      const isMenoStage = !!lifeStage && ["perimenopause", "menopause", "post-menopause"].includes(lifeStage);
      const opener = isMenoStage
        ? (lifeStage === "perimenopause"
            ? `Hello, ${firstName}. Perimenopause can feel unpredictable — Jess is here to help you track your patterns. How are you feeling today?`
            : lifeStage === "menopause"
            ? `Hello, ${firstName}. Menopause is a transition, not a problem to fix — Jess is here for the day-to-day. How are you feeling today?`
            : `Hello, ${firstName}. Many things shift in post-menopause — Jess will help you notice what changes and what steadies. How are you feeling today?`)
        : `Hello, ${firstName}. I can see you're on day ${dayInCycle} of your ${phase} phase — ` +
          `${PHASE_OPENING_LINE[phase] || PHASE_OPENING_LINE.follicular}. How are you feeling?`;
      // Sprint 9 QA fix — strip the "What's coming in my cycle?" chip
      // for peri/meno/post-meno users and replace it with a stage-
      // appropriate prompt. The rest of the chip list stays the same.
      const MENO_CHIP_SWAPS = {
        perimenopause:    "Tell me about perimenopause",
        menopause:        "How do I manage hot flashes?",
        "post-menopause": "What should I be tracking now?",
      };
      const baseChips = SUGGESTION_CHIPS.slice(0, 5);
      const openerChips = isMenoStage
        ? baseChips.map((c) =>
            c === "What's coming in my cycle?"
              ? (MENO_CHIP_SWAPS[lifeStage] || "How do I manage hot flashes?")
              : c)
        : baseChips;
      setMessages([
        {
          id: uid(),
          role: "jess",
          type: "bubble",
          text: opener,
          time: fmtTimeAmPm(),
          chips: openerChips,
        },
      ]);
    }, 1400);
    return () => clearTimeout(t);
  }, [profile?.id, profile?.life_stage, recentCheckins.length, dayInCycle, firstName, phase, followUpFired, initialPrompt]);

  // Memoised proactive chips — drive Chat tab + tab-level shortcuts.
  // P0 hardening — guard against any throw inside the helper; render
  // an empty chip list rather than tearing down the whole panel.
  const proactiveChips = useMemo(() => {
    try {
      return buildProactiveChips({ todayCheckin, recentCheckins, symptoms, lastJournal, phase, dayInCycle });
    } catch (e) {
      try { console.warn("[jess-mount] buildProactiveChips threw:", String(e?.message || e)); } catch {}
      return [];
    }
  }, [todayCheckin, recentCheckins, symptoms, lastJournal, phase, dayInCycle]);

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

  // ── Feature 1C: Load JessConversation history from base44 ──────────
  // Best-effort — if the entity doesn't exist yet (schema not deployed),
  // we degrade gracefully and the drawer renders its empty state.
  const reloadJessConvos = useCallback(async () => {
    if (!user?.id) return;
    try {
      const Entity = base44.entities?.JessConversation;
      if (!Entity) { setJessConvos([]); return; }
      const rows = await Entity.filter(
        { user_id: user.id, is_deleted: false },
        "-updated_date",
        50,
      ).catch(() => []);
      setJessConvos(Array.isArray(rows) ? rows : []);
    } catch { setJessConvos([]); }
  }, [user?.id]);

  useEffect(() => { reloadJessConvos(); }, [reloadJessConvos]);

  // ── Feature 2: Load top JessMemory rows for this user ────────────────
  // Pulls the top 5 most-important active memories. Refreshed by
  // reloadMemories() after the extractor runs. Failsafe when the entity
  // schema doesn't exist yet — service returns [] and the context block
  // omits the memory section.
  const reloadMemories = useCallback(async () => {
    if (!user?.id) { setMemories([]); return; }
    try {
      const rows = await loadTopMemories(user.id, 5);
      setMemories(Array.isArray(rows) ? rows : []);
    } catch { setMemories([]); }
  }, [user?.id]);

  useEffect(() => { reloadMemories(); }, [reloadMemories]);

  // ── Feature 1B: Auto-namer ────────────────────────────────────────
  // Fires after the user's SECOND message in a thread. Spins up a
  // separate ephemeral base44.agents conversation (so it doesn't
  // pollute the user's thread), asks for a 2-4 word title, writes
  // the result back to the JessConversation record.
  const autoNameConversation = useCallback(async (record) => {
    if (!record?.id || !user?.id) return;
    const convId = record.id;
    if (namingFiredRef.current.has(convId)) return;
    namingFiredRef.current.add(convId);
    const msgs = conversationUserMsgsRef.current[convId] || [];
    if (msgs.length < 2) return;
    const Entity = base44.entities?.JessConversation;
    if (!Entity) return;
    const fallback = (() => {
      const d = new Date();
      const day = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return `${day} Chat`;
    })();
    // Fail-safe timer — if the agent stalls we still persist a name.
    let settled = false;
    const stallTimer = window.setTimeout(async () => {
      if (settled) return;
      settled = true;
      try { await Entity.update(convId, { name: fallback, name_status: "failed" }); }
      catch {}
      reloadJessConvos();
    }, 7000);
    try {
      const systemLine =
        "You are a conversation namer. Given a conversation snippet, return ONLY a 2-4 word title capturing the main topic. No punctuation, no quotes, just the words. Examples: Mood Check In, Sleep Patterns, Luteal Support, Cycle Symptoms";
      const userLine =
        `Name this conversation:\n${msgs[0]}\n${msgs[1]}`;
      const namerConvo = await base44.agents
        .createConversation({ agent_name: "personal_assistant" })
        .catch(() => null);
      if (!namerConvo?.id) return;
      const c = await base44.agents.getConversation(namerConvo.id);
      // Send the namer instructions + the snippet as a single user
      // message (the agent API only exposes user-role addMessage).
      await base44.agents.addMessage(c, {
        role: "user",
        content: `[SYSTEM]\n${systemLine}\n\n[TASK]\n${userLine}`,
      });
      const seen = new Set();
      const unsub = base44.agents.subscribeToConversation(namerConvo.id, async (data) => {
        const list = data?.messages || [];
        const next = list.find((m) => m?.role === "assistant" && !seen.has(m.id));
        if (!next) return;
        seen.add(next.id);
        if (settled) return;
        settled = true;
        window.clearTimeout(stallTimer);
        // Strip punctuation + clip to 4 words; if we get junk fall
        // back to the date-stamp default.
        const raw = String(next.content || "").trim();
        const cleaned = raw
          .replace(/["'`]/g, "")
          .replace(/[.!?…]+$/g, "")
          .split(/\s+/)
          .slice(0, 4)
          .join(" ")
          .trim();
        const finalName = cleaned.length >= 2 ? cleaned : fallback;
        try {
          await Entity.update(convId, {
            name: finalName,
            name_status: cleaned.length >= 2 ? "named" : "failed",
          });
        } catch {}
        try { unsub?.(); } catch {}
        reloadJessConvos();
      });
    } catch {
      // network blew up — fallback timer will fire.
    }
  }, [user?.id, reloadJessConvos]);

  // ── Feature 1F: Bump message_count + preview + updated_date ────────
  const bumpConvoMeta = useCallback(async (record, userText) => {
    if (!record?.id) return null;
    const Entity = base44.entities?.JessConversation;
    if (!Entity) return null;
    const updates = {
      message_count: (record.message_count || 0) + 1,
      updated_date: new Date().toISOString(),
    };
    if (!record.preview_text && userText) {
      updates.preview_text = String(userText).slice(0, 80);
    }
    const next = { ...record, ...updates };
    setActiveConvRecord(next);
    try { await Entity.update(record.id, updates); } catch {}
    return next;
  }, []);

  // ── Feature 1C extra: soft-delete from the drawer ──────────────────
  const softDeleteConvo = useCallback(async (jessConvoId) => {
    if (!jessConvoId) return;
    const Entity = base44.entities?.JessConversation;
    if (!Entity) return;
    setJessConvos((prev) => prev.filter((c) => c.id !== jessConvoId));
    try { await Entity.update(jessConvoId, { is_deleted: true }); } catch {}
    if (activeConvRecord?.id === jessConvoId) {
      setActiveConvRecord(null);
      setConversationId(null);
      setMessages([]);
      setFollowUpFired(false);
    }
  }, [activeConvRecord?.id]);

  // Memoised context block to inject as the first user message in any new
  // conversation. Recomputed when underlying data changes (so resuming a
  // convo later still gets up-to-date context).
  // P0 hardening — same guard pattern. If the context build throws, fall
  // back to a minimal stub that still keeps Jess functional.
  const contextBlock = useMemo(() => {
    try {
      return buildJessContext({ user, profile, todayCheckin, recentCheckins, symptoms, tasks, lastJournal, phase, dayInCycle, memories });
    } catch (e) {
      try { console.warn("[jess-mount] buildJessContext threw:", String(e?.message || e)); } catch {}
      return "[JESS CONTEXT — do not mention this block to the user]\nContext temporarily unavailable.";
    }
  }, [user, profile, todayCheckin, recentCheckins, symptoms, tasks, lastJournal, phase, dayInCycle, memories]);

  // ── Live base44.agents conversation — used only for free text ──────────
  // Subscribe to the active agent conversation. Each stream event delivers
  // the FULL message list for the conversation; the same assistant id can
  // appear across multiple events with progressively more text as the
  // model streams. So we update existing bubbles by id rather than skip
  // them — otherwise the first (often empty) event locks in an empty
  // bubble. seenAgentIdsRef is used only to mute messages that were
  // already in the transcript when we attached (set in loadConversation
  // and ensureConversation), so we don't replay history into chat.
  const subscribeToConversation = useCallback((id) => {
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = base44.agents.subscribeToConversation(id, (data) => {
      const list = data?.messages || [];
      // Only the assistants we DIDN'T pre-mark as already-replayed.
      // QA round 4 — ALSO filter out empty-content messages. Base44
      // emits tool-call intermediary frames with `role: "assistant"`
      // but empty `content`; previously these were creating phantom
      // empty bubbles (2 stacked above every real reply with the
      // timestamp + MHRA footer but no text).
      const live = list.filter((m) => {
        if (m?.role !== "assistant" || !m?.id) return false;
        if (seenAgentIdsRef.current.has(m.id)) return false;
        const content = String(m.content ?? "").trim();
        if (!content) return false;
        return true;
      });
      if (live.length === 0) return;
      setMessages((prev) => {
        // Index of existing entries by id so we can update in place when
        // streaming chunks bring more text for an id we've already added.
        const byId = new Map();
        prev.forEach((m, i) => { if (m?.id) byId.set(m.id, i); });
        const next = [...prev];
        let sawText = false;
        for (const m of live) {
          const raw = String(m.content ?? "");
          // QA round 3 — strip spurious "Done — I logged X" tool
          // confirmation lines BEFORE chip parsing so the chip parser
          // sees clean prose.
          // Sprint 5 — try parsing the streamed reply as the JSON
          // action envelope FIRST. If it parses cleanly, use the
          // envelope's `message` field as the visible bubble and queue
          // its actions for execution. If it doesn't parse (mid-stream
          // chunk, or LLM degraded to plain text), fall back to the
          // legacy tool-strip + chip-split pipeline.
          let envelopeParsed = null;
          let actionsToFire = [];
          let envelopeMessage = null;
          // Sprint 5 P0#1 — ALWAYS use parseJessResponse's `message`
          // field for display, even on fallback. parseJessResponse now
          // sanitizes trailing JSON debris (`{...}`, `[...`, `"actions":`)
          // from fallback text so raw envelope fragments never leak
          // into the bubble. envelopeParsed gates action execution —
          // only fires when JSON parsed cleanly.
          let parsedMessage = "";
          try {
            const rawParse = parseJessResponse(raw);
            // QA round 5/7 — pipe parseJessResponse through the
            // meal-plan AND task injectors ONLY when this isn't a
            // mid-stream fence-buffered chunk. If raw starts with
            // ``` we're still waiting for Jess's real envelope to
            // complete — we'd be pre-firing a synthesised action
            // and racing against her actual reply. Once the stream
            // completes (or comes back as pure prose refusal) the
            // injectors run and write the scaffold.
            const startsWithFenceForInject = /^\s*```/.test(raw);
            const userMsgForInject = lastUserMessageRef.current || pendingUserMsgRef.current || "";
            let tryParse;
            if (startsWithFenceForInject && rawParse?._fallback) {
              tryParse = rawParse;
            } else {
              // QA round 10 — pipe through every client-side injector
              // in priority order. Each one is a pure pass-through if
              // its trigger regex doesn't match the user's message, so
              // the chain is cheap. Order: heaviest writes first
              // (meal plan = 21 rows) → planner item → mood / symptom
              // / hydration / journal (all single-row).
              // QA round 12 — Journal must run BEFORE Hydration so
              // a "write a journal entry: I had a productive day…"
              // message hits the journal injector first. HYDRATION_REGEX
              // matches "I had" on the journal body otherwise.
              let p = injectMealPlanIfNeeded(rawParse, userMsgForInject);
              p = injectTaskIfNeeded(p, userMsgForInject);
              p = injectMoodIfNeeded(p, userMsgForInject);
              p = injectSymptomIfNeeded(p, userMsgForInject);
              p = injectJournalIfNeeded(p, userMsgForInject);
              p = injectHydrationIfNeeded(p, userMsgForInject);
              // QA round 16 — Medication / Supplement / Habit injectors
              // run last so the more-specific intents above (meal plan,
              // task, mood, symptom, journal, hydration) win in the
              // rare cases where two regexes overlap.
              p = injectMedicationIfNeeded(p, userMsgForInject);
              p = injectSupplementIfNeeded(p, userMsgForInject);
              p = injectHabitIfNeeded(p, userMsgForInject);
              tryParse = p;
            }
            parsedMessage = typeof tryParse?.message === "string"
              ? tryParse.message
              : "";
            if (!tryParse._fallback) {
              envelopeParsed = tryParse;
              envelopeMessage = tryParse.message;
              actionsToFire = tryParse.actions || [];
            }

            // QA round 3 — buffer code-fence-wrapped responses. When
            // Jess's reply starts with ``` and the envelope hasn't
            // fully parsed yet, the partial chunk after fence-stripping
            // is just '```json' which would otherwise render as the
            // bubble text. Skip this stream tick entirely — keep the
            // typing indicator up — and wait for a later tick where
            // the full JSON has arrived and envelopeParsed is set.
            // The 30 s freeze-guard in sendUserText is the safety net
            // if the stream never completes.
            const startsWithFence = /^\s*```/.test(raw);
            if (startsWithFence && !envelopeParsed) {
              continue; // skip this message in the live loop
            }
            // QA FIX 2 — log every parsed action set so we can see in
            // production console whether Jess is actually returning
            // the envelope. Logged once per message id (first stream
            // chunk that produces a parse result), not every chunk.
            if (!loggedSubscribeIdsRef.current.has(m.id + ":actions")) {
              loggedSubscribeIdsRef.current.add(m.id + ":actions");
               
              console.log("[jess-actions]", {
                messageId: m.id,
                fallback: !!tryParse._fallback,
                actionCount: Array.isArray(tryParse.actions) ? tryParse.actions.length : 0,
                actions: tryParse.actions,
                messagePreview: String(tryParse.message || "").slice(0, 80),
                rawPreview: raw.slice(0, 80),
              });
            }
          } catch { /* swallow — fall back below */ }

          // Pick display source. envelopeMessage wins (clean parse).
          // parsedMessage wins second (sanitized fallback — strips JSON
          // debris from the raw text). raw is last-ditch.
          const baseText = envelopeMessage != null
            ? envelopeMessage
            : (parsedMessage || raw);
          const sanitized = stripToolConfirmations(baseText);
          // Strip trailing JSON suggestion-chip array (e.g. the model
          // ends its reply with `["Try journaling","Take a walk"]`).
          // The chips themselves render as tappable buttons under the
          // bubble; only the prose above belongs in the bubble text.
          const { text: content, chips } = splitChipsFromText(sanitized);

          // Sprint 5 — fire actions ONCE per assistant message id, as
          // soon as we have a clean envelope. Streaming sends the same
          // id many times; without this guard we'd write each action
          // 20+ times.
          //
          // QA round 4 — read userId from userRef.current (not the
          // captured `user` closure) because subscribeToConversation
          // is useCallback([]) and the closure-captured `user` is
          // null at first render. The ref tracks the latest value.
          const liveUser = userRef.current;
          const liveUserId = liveUser?.id;
          if (envelopeParsed && !actionsFiredRef.current.has(m.id) && liveUserId) {
            actionsFiredRef.current.add(m.id);
            const pairedUserMsg = pendingUserMsgRef.current || "";
            pendingUserMsgRef.current = null;
            try {
              console.log("[jess-execute-call]", {
                messageId: m.id,
                userId: liveUserId,
                actionCount: actionsToFire.length,
              });
            } catch { /* swallow */ }
            // Fire and forget — chat doesn't need to await the writes.
            executeJessActions(actionsToFire, liveUserId)
              .then((results) => {
                const successful = (results || []).filter((r) => r && r.success);
                // Append a chip-confirmation bubble below Jess's
                // message for every successful write.
                if (successful.length > 0) {
                  setMessages((prev) => [
                    ...prev,
                    ...successful.map((r) => ({
                      id: uid(),
                      role: "jess",
                      type: "action-chip",
                      text: chipLabelForAction(r.action?.type, r.action?.data) || "✓ Done",
                      time: fmtTimeAmPm(),
                    })),
                  ]);
                }
                // Update + persist memory.
                setJessMemory((prev) => {
                  const next = updateJessMemory(prev, results, pairedUserMsg, envelopeMessage || "");
                  try { saveJessMemory(liveUserId, next); } catch {}
                  return next;
                });
              })
              .catch((e) => {
                try { console.warn("[jess-actions] execute threw:", String(e?.message || e)); } catch {}
              });
          } else if (envelopeParsed && !actionsFiredRef.current.has(m.id)) {
            // Surface the silent-skip case in the console so future
            // regressions don't disappear into the void again.
            try {
              console.warn("[jess-execute-skip]", {
                messageId: m.id,
                reason: !liveUserId ? "no userId in ref" : "already fired",
                hasUserInRef: !!liveUser,
              });
            } catch { /* swallow */ }
          }
          // QA round 6 — log once per messageId, not on every stream
          // chunk. Base44 emits ~24 chunks per assistant reply; the
          // bubble updates in place but the breadcrumb was firing on
          // every single one. We only log the FIRST time we lift
          // chips or strip a tool line for a given id, so the
          // console stays readable.
          if ((chips || sanitized !== raw) && !loggedSubscribeIdsRef.current.has(m.id)) {
            loggedSubscribeIdsRef.current.add(m.id);
             
            console.log("[jess-subscribe]", {
              messageId: m.id,
              strippedToolLine: sanitized !== raw,
              chipsLifted: chips ? chips.length : 0,
              previewIn: raw.slice(0, 80),
              previewOut: content.slice(0, 80),
            });
          }
          if (byId.has(m.id)) {
            // Replace text on the existing bubble — streaming update.
            const i = byId.get(m.id);
            // Preserve the original bubble's time so it doesn't jump.
            // Only overwrite chips when we actually parsed some this
            // round, so a partial stream chunk doesn't clear a chip
            // array that was already settled.
            next[i] = {
              ...next[i],
              text: content,
              ...(chips ? { chips } : {}),
            };
            if (content.trim()) sawText = true;
          } else {
            // First time we see this id — append a new bubble.
            next.push({
              id: m.id,
              role: "jess",
              type: "bubble",
              text: content,
              time: fmtTimeAmPm(),
              ...(chips ? { chips } : {}),
            });
            byId.set(m.id, next.length - 1);
            if (content.trim()) sawText = true;
          }
        }
        // Only hide the typing indicator once we've actually rendered
        // text — empty stream events shouldn't dismiss the dots.
        if (sawText) {
          setAssistantTyping(false);
          // QA FIX 1 — clear the 30s freeze guard once any real text
          // lands, so the fallback bubble never double-fires.
          try {
            if (jessTimeoutRef.current) {
              clearTimeout(jessTimeoutRef.current);
              jessTimeoutRef.current = null;
            }
          } catch { /* swallow */ }
        }
        return next;
      });
    });
  }, []);

  // ── ensureConversation ─────────────────────────────────────────────────
  // If there's no active thread yet, create BOTH the base44.agents
  // conversation (for streaming chat) and a JessConversation entity row
  // (for history, naming, message_count). Returns { convoId, record } so
  // sendUserText can bump the record after addMessage succeeds.
  const ensureConversation = useCallback(async () => {
    if (conversationId && activeConvRecord) {
      return { convoId: conversationId, record: activeConvRecord };
    }
    const convo = await base44.agents
      .createConversation({ agent_name: "personal_assistant" })
      .catch(() => null);
    if (!convo?.id) return { convoId: null, record: null };
    setConversationId(convo.id);
    // Don't replay agent's first reply into the chat — our local opener
    // owns that slot. Mark any current messages as "seen".
    if (Array.isArray(convo.messages)) {
      for (const m of convo.messages) seenAgentIdsRef.current.add(m.id);
    }
    subscribeToConversation(convo.id);
    // Eager JessConversation record creation — name_status: 'pending', so
    // the drawer can show this thread immediately.
    let record = null;
    try {
      const Entity = base44.entities?.JessConversation;
      if (Entity && user?.id) {
        record = await Entity.create({
          user_id: user.id,
          agent_conv_id: convo.id,
          name: null,
          name_status: "pending",
          preview_text: "",
          message_count: 0,
          is_deleted: false,
        });
        if (record) {
          setActiveConvRecord(record);
          setJessConvos((prev) => [record, ...prev]);
        }
      }
    } catch { /* swallow — chat still works without history row */ }
    // QA round 5 — DO NOT pre-inject the context block here. Previously
    // we added it as a `role: "user"` message, which the base44 agent
    // treated as a turn and replied to. Combined with the actual user
    // message that sendUserText adds next, this produced TWO assistant
    // replies for a single user input. The context block is now
    // PREPENDED to the first user message in sendUserText so the agent
    // sees exactly one user turn and replies exactly once.
    return { convoId: convo.id, record };
  }, [conversationId, activeConvRecord, subscribeToConversation, contextBlock, user?.id]);

  useEffect(() => () => { if (unsubRef.current) unsubRef.current(); }, []);

  // Feature 2 — keep a live ref to the closing-thread payload so the
  // unmount cleanup can read the freshest values without forcing the
  // entire cleanup to re-bind on every message.
  const closingThreadRef = useRef({ messages: [], userId: null, convId: null, name: "Jess" });
  useEffect(() => {
    closingThreadRef.current = {
      messages,
      userId: user?.id || null,
      convId: activeConvRecord?.id || conversationId || null,
      name: assistantName,
    };
  }, [messages, user?.id, activeConvRecord?.id, conversationId, assistantName]);

  // On unmount (user navigates away from /Ideas, closes the panel, or
  // Jess hot-reloads), fire-and-forget the memory extractor against the
  // most-recent thread snapshot. Defensive: only if a user turn exists.
  // QA Fix 4 — log skip/fire so we can verify in dev tools that the
  // unmount actually triggers extraction.
  useEffect(() => () => {
    try {
      const snap = closingThreadRef.current;
      if (!snap?.userId || !Array.isArray(snap.messages)) {
         
        console.log("[jess-memory] unmount: skip (no snap)", snap);
        return;
      }
      const hasUserTurn = snap.messages.some((m) => m?.role === "user");
      if (!hasUserTurn || snap.messages.length < 2) {
         
        console.log("[jess-memory] unmount: skip (insufficient turns)",
          { count: snap.messages.length, hasUserTurn });
        return;
      }
       
      console.log("[jess-memory] unmount: firing extractor",
        { messageCount: snap.messages.length, convId: snap.convId });
      // Don't await — the component is tearing down. Service has its
      // own guards.
      extractMemoriesFromConversation(snap.messages, snap.userId, snap.convId, snap.name);
    } catch (e) {
       
      console.warn("[jess-memory] unmount: threw", e?.message || e);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assistantTyping]);

  // ── Start a fresh conversation ─────────────────────────────────────────
  // The "✦ New" header button. Tears down any active subscription, clears
  // the chat, eagerly creates BOTH a fresh agent_conv_id and a new
  // JessConversation record so the drawer shows the thread immediately.
  // Feature 2 — before tearing down, snapshot the current messages so we
  // can run the memory extractor against the closing thread.
  const startNewConversation = useCallback(async () => {
    // QA round 3 — unconditional entry breadcrumb. Use console.log
    // (not info) so it shows even with strict console filters.
     
    console.log("[jess-memory] ✦New tapped — entering startNewConversation");
    // Snapshot the active thread for the memory extractor BEFORE we
    // clear messages state. Skip if there's no live thread yet, or if
    // it's just the opener (no user turn).
    const closingMessages = messages;
    const closingConvId = activeConvRecord?.id || conversationId || null;
    const hasUserTurn = closingMessages.some((m) => m?.role === "user");
    if (user?.id && hasUserTurn && closingMessages.length >= 2) {
      // Fire-and-forget — don't block the new-convo creation on the
      // extractor's LLM round-trip. reloadMemories() runs after.
       
      console.log("[jess-memory] new-convo: firing extractor",
        { messageCount: closingMessages.length, convId: closingConvId });
      (async () => {
        try {
          const result = await extractMemoriesFromConversation(closingMessages, user.id, closingConvId, assistantName);
           
          console.log("[jess-memory] new-convo: extractor returned", result);
          await reloadMemories();
        } catch (e) {
           
          console.warn("[jess-memory] new-convo: extractor threw", e?.message || e);
        }
      })();
    } else {
       
      console.log("[jess-memory] new-convo: skip extraction",
        { hasUserId: !!user?.id, hasUserTurn, messageCount: closingMessages.length });
    }
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    seenAgentIdsRef.current = new Set();
    loggedSubscribeIdsRef.current = new Set();
    setConversationId(null);
    setActiveConvRecord(null);
    setDrawerOpen(false);
    setMessages([]);
    setFollowUpFired(false); // re-fire opener
    // Eager creation happens in ensureConversation — fire it immediately
    // so the new thread row lands in the drawer without waiting for the
    // user's first message.
    if (user?.id) {
      // Run after state flushes — conversationId is now null, so
      // ensureConversation will mint a new pair.
      window.setTimeout(() => { ensureConversation(); }, 0);
    }
  }, [user?.id, ensureConversation, messages, activeConvRecord?.id, conversationId, assistantName, reloadMemories]);

  // ── Resume a past conversation — fully interactive ─────────────────────
  // Takes a JessConversation record. Re-attaches to its agent_conv_id
  // (NOT createConversation), replays history, and shows a "Conversation
  // resumed" divider chip so the user knows they're back in an old thread.
  const loadConversation = useCallback(async (record) => {
    if (!record?.agent_conv_id) return;
    const id = record.agent_conv_id;
    setDrawerOpen(false);
    // Tear down any existing subscription before swapping conversation id.
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    seenAgentIdsRef.current = new Set();
    loggedSubscribeIdsRef.current = new Set();
    // Force a fresh context block on the next user message in this thread.
    contextInjectedRef.current.delete(id);
    setActiveConvRecord(record);
    setConversationId(id);
    setFollowUpFired(true); // suppress the auto-opener for resumed threads
    try {
      const c = await base44.agents.getConversation(id);
      // P0#2 — base44.agents.getConversation returns the messages array
      // in different shapes depending on size: a bare array OR
      // `{ items: [...] }`. Previously we only checked the bare-array
      // shape, so paginated conversations collapsed to "only the last
      // message visible after resume". Mirror the jessAgentService
      // poll-loop behaviour and check both.
      const list = Array.isArray(c?.messages)
        ? c.messages
        : (Array.isArray(c?.messages?.items)
          ? c.messages.items
          : (Array.isArray(c?.messages?.list)
            ? c.messages.list
            : []));
      // Mark every existing assistant message as already-seen so the
      // subscribe callback doesn't replay them when it connects.
      for (const m of list) {
        if (m?.role === "assistant" && m?.id) seenAgentIdsRef.current.add(m.id);
      }
      // P0#2 — every outgoing user turn since Sprint 5 carries a
      // multi-block prefix (`[JESS CONTEXT]`, `[ACTION LAYER]`,
      // `[GROUNDING SCRIPT]`, `[FEEDBACK SIGNAL]`, `[WEEKLY STATS]`,
      // `[MEMORY CONTEXT]`, etc.) joined by `\n\n---\n\n` separators
      // before the actual user text. On resume we want to show ONLY
      // the user text. We do this generically: if a user message starts
      // with `[SOMETHING_LIKE_THIS]`, walk the `\n\n---\n\n` separators
      // and keep the LAST segment that does NOT itself start with `[`.
      // Legacy pure-context messages (single `[JESS CONTEXT]` block with
      // no trailing user text) are dropped entirely.
      //
      // For assistant turns we run parseJessResponse so the JSON
      // envelope becomes clean prose instead of a wall of `{ "message":
      // "...", "actions": [...] }` text in the resumed bubble.
      const view = list
        .map((m) => {
          if (m?.role === "user") {
            const content = String(m?.content || "");
            if (/^\s*\[[A-Z][A-Z _\-—]+/.test(content)) {
              const segments = content.split("\n\n---\n\n");
              // Walk from end → start and grab the first segment that
              // isn't itself a bracket header block.
              let userText = "";
              for (let i = segments.length - 1; i >= 0; i--) {
                const seg = String(segments[i] || "").trim();
                if (!seg) continue;
                if (/^\[[A-Z][A-Z _\-—]+/.test(seg)) continue;
                userText = seg;
                break;
              }
              if (!userText) {
                return { ...m, __dropFromView: true };
              }
              return { ...m, content: userText };
            }
            return m;
          }
          if (m?.role === "assistant") {
            const content = String(m?.content || "");
            if (!content.trim()) return { ...m, __dropFromView: true };
            // Tool-call intermediate frames sometimes have empty content
            // — already filtered above. For real text replies, strip the
            // JSON envelope so resumed bubbles show only Jess's prose.
            try {
              const parsed = parseJessResponse(content);
              const cleaned = String(parsed?.message || content).trim();
              return { ...m, content: cleaned };
            } catch {
              return m;
            }
          }
          return m;
        })
        .filter((m) => !m?.__dropFromView)
        .map((m) => ({
          id: m.id || uid(),
          role: m.role === "assistant" ? "jess" : "user",
          type: "bubble",
          text: m.content || "",
        }))
        // Final safety net — drop any empty bubble after cleaning.
        .filter((b) => String(b.text || "").trim().length > 0);
      // P0#2 — the divider now reads "Conversation resumed" and lands
      // AT THE END of the loaded history so the user can see the full
      // thread above with the resumed marker as a "you are here" line.
      setMessages([
        ...view,
        { id: uid(), role: "divider", type: "divider", text: "Conversation resumed" },
      ]);
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

    // Jess crisis protocol (7-category) — runs BEFORE the agent call.
    //
    // We classify once, look up the response config, and branch:
    //   • suppressAI=true (urgent_crisis): skip agent, render
    //     emergency card with the Samaritans / A&E / GP lines, and
    //     bail out before any LLM round-trip.
    //   • everything else (incl. grief): proceed to the agent with a
    //     mode directive baked into the outgoing message. Surfaces
    //     that have a referralCard render it after the agent reply
    //     starts streaming.
    //
    // P0 hardening — the entire classifier path is wrapped so a
    // single throw in the service module can never take down the
    // panel. On any classifier failure, fall back to "no category"
    // and let the conversation continue normally.
    let category = null;
    let crisisCfg = null;
    try {
      category  = classifySensitiveTopic(msg) || null;
      crisisCfg = category ? (getCrisisConfig(category) || null) : null;
    } catch (e) {
       
      console.error("[jess-crisis] classifier threw:", e?.message || e);
      category  = null;
      crisisCfg = null;
    }

    if (crisisCfg && crisisCfg.suppressAI === true) {
      const card = crisisCfg.referralCard || {};
      const lines = Array.isArray(card.lines) ? card.lines : [];
      setMessages((prev) => [...prev, {
        id: uid(),
        role: "jess",
        type: "referral",
        variant: category, // "urgent_crisis"
        title: card.title || "You're not alone",
        lines,
        // Back-compat: also keep `text` so older renderers still work.
        text: lines.join(" · "),
        time: fmtTimeAmPm(),
      }]);
      return; // do NOT call the agent
    }

    setAssistantTyping(true);
    try {
      const { convoId: cid, record } = await ensureConversation();
      if (!cid) throw new Error("no convo");
      // Record this as the "first user message" if we don't have one yet —
      // legacy single-message cache (kept for any downstream callers).
      if (firstUserMsgRef.current[cid] === undefined) {
        firstUserMsgRef.current[cid] = msg;
      }
      // Per-record cache of the first 2 user messages — drives the
      // auto-namer once message #2 lands.
      if (record?.id) {
        const arr = conversationUserMsgsRef.current[record.id] || [];
        if (arr.length < 2) {
          arr.push(msg);
          conversationUserMsgsRef.current[record.id] = arr;
        }
      }
      const convo = await base44.agents.getConversation(cid);
      // QA round 5 — combine the hidden context block with the user's
      // actual message into a SINGLE `role: "user"` turn so the agent
      // replies exactly once. On the first turn of a thread (and after
      // resume, when loadConversation clears the flag) we prepend the
      // [JESS CONTEXT] block; on subsequent turns we send just the
      // user's text.
      // Mode directive for the agent — varies per crisis category.
      // Pulled from the per-category config so adding a new category
      // only requires touching jessSensitiveTopics.js.
      const modeLine = crisisCfg?.modeDirective || "";
      // Grounding script for SEVERE_ANXIETY — prepended to the
      // outgoing turn so the agent's reply starts AFTER a 5-4-3-2-1
      // exercise. The script is also rendered visually as a separate
      // bubble below for users who'd benefit from seeing it isolated
      // from the rest of the reply.
      const groundingLine = crisisCfg?.groundingFirst ? GROUNDING_5_4_3_2_1 : "";
      // Jess v2 J2-7 — read the last 5 user thumbs ratings and bias the
      // agent's tone if they were unhappy. `feedbackLine` is empty when
      // the user hasn't complained, so it costs nothing in the happy path.
      const feedbackLine = user?.id
        ? feedbackDirective(loadRecentFeedback(user.id))
        : "";

      // QA Fix 5 — when the user asks Jess to summarise their week,
      // fetch the last-7-day aggregates and inject them as a
      // [WEEKLY STATS] block. The agent has no implicit data access;
      // every fact has to be in the message. Fail open — if the fetch
      // throws or the user isn't logged in, just send the message as-is
      // and let Jess do her best.
      let weeklyStatsLine = "";
      if (user?.id && matchesWeeklySummaryAsk(msg)) {
        try {
          const agg = await fetchWeeklyStats(user.id);
          weeklyStatsLine = buildWeeklyStatsContext(agg);
        } catch { /* swallow */ }
      }

      // Sprint 5 — Action Layer envelope + memory line. Every outgoing
      // turn carries the JSON-envelope instruction so Jess returns a
      // parseable response. Memory line summarises the last-8 user
      // turns + which actions Jess executed, so she remembers across
      // sessions (also persisted to localStorage `jess_memory_<userId>`).
      const memoryLine = (() => {
        try { return buildMemoryContextLine(jessMemory) || ""; }
        catch { return ""; }
      })();
      const actionEnvelopeLine =
        "[ACTION LAYER — RESPONSE FORMAT REMINDER]\n" +
        "Your reply MUST be a JSON object: { \"message\": \"…\", \"actions\": [{ type, confidence, data }] }. " +
        "Actions are written to entities when confidence ≥ 0.75. " +
        "Types: LOG_MOOD, LOG_ENERGY, LOG_SLEEP, LOG_DAILY_CHECKIN, LOG_SYMPTOM, LOG_MEAL, " +
        "CREATE_MEAL_PLAN, LOG_HYDRATION, LOG_MEDICATION, LOG_SUPPLEMENT, LOG_HABIT, " +
        "CREATE_TASK, COMPLETE_TASK, WRITE_JOURNAL, QUERY_DATA, CLARIFICATION_NEEDED. " +
        "If you are unsure, return CLARIFICATION_NEEDED with confidence < 0.75 — never guess and write.\n\n" +
        (memoryLine ? `[MEMORY CONTEXT]\n${memoryLine}` : "[MEMORY CONTEXT]\n(no prior turns)");

      const prefix = [
        feedbackLine,
        weeklyStatsLine,
        modeLine,
        groundingLine && `[GROUNDING SCRIPT — PREPENDED TO YOUR REPLY]\n${groundingLine}`,
        actionEnvelopeLine,
      ].filter(Boolean).join("\n\n---\n\n");
      let outgoing;
      if (!contextInjectedRef.current.has(cid)) {
        contextInjectedRef.current.add(cid);
        outgoing = `${contextBlock}\n\n---\n\n${prefix ? prefix + "\n\n---\n\n" : ""}${msg}`;
      } else {
        outgoing = prefix ? `${prefix}\n\n---\n\n${msg}` : msg;
      }
      // Sprint 5 — record the outgoing user message so the streaming
      // handler can pair it with the assistant reply when actions
      // execute (for the memory ring breadcrumb).
      pendingUserMsgRef.current = msg;
      // QA round 5 — persistent ref for the meal-plan injector to read.
      lastUserMessageRef.current = msg;
      await base44.agents.addMessage(convo, { role: "user", content: outgoing });

      // QA FIX 1 — 30-second streaming timeout. If the typing indicator
      // is still up 30s after we sent the user message, Jess is stuck —
      // dismiss the indicator and post a graceful fallback bubble plus
      // a hardcoded support-resources card (if this turn was crisis-
      // adjacent). Cleared automatically once the subscribe handler
      // sees its first text chunk.
      try { if (jessTimeoutRef.current) clearTimeout(jessTimeoutRef.current); } catch {}
      const wasCrisis = !!(category && category !== null);
      jessTimeoutRef.current = window.setTimeout(() => {
        setAssistantTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "jess",
            type: "bubble",
            text: wasCrisis
              ? "Jess is taking a moment. You can still access support resources:"
              : "Jess is taking a moment — try sending that again in a few seconds.",
            time: fmtTimeAmPm(),
          },
          ...(wasCrisis ? [{
            id: uid(),
            role: "jess",
            type: "referral",
            variant: "self_harm",
            title: "Support resources",
            lines: [
              "Samaritans: 116 123 (free, 24/7)",
              "Crisis text line: text SHOUT to 85258",
              "Mind: 0300 123 3393",
              "Emergency: 999",
            ],
            text: "Samaritans: 116 123 · SHOUT to 85258 · Mind: 0300 123 3393 · Emergency: 999",
            time: fmtTimeAmPm(),
          }] : []),
        ]);
      }, 30000);
      // After the agent reply starts streaming, queue the per-category
      // referral card (if this category has one). Grief + severe
      // anxiety have referralCard:null and skip this entirely; the
      // remaining categories (self_harm, eating_disorder,
      // domestic_abuse, distress) get their dedicated card.
      //
      // The delay (~1.8s) lets the typing indicator transition into
      // the first chunk of the agent's reply before the card lands,
      // so the card feels like a footnote rather than an interruption.
      //
      // P0 hardening — defensive across the whole append.
      const cardCfg = crisisCfg && crisisCfg.referralCard;
      if (cardCfg) {
        const lines = Array.isArray(cardCfg.lines) ? cardCfg.lines : [];
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            id: uid(),
            role: "jess",
            type: "referral",
            variant: category,
            title: cardCfg.title || "You're not alone",
            lines,
            text: lines.join(" · "),
            time: fmtTimeAmPm(),
          }]);
        }, 1800);
      }

      // QA FIX C — every crisis category (including the chip-only
      // GRIEF + SEVERE_ANXIETY paths that have referralCard: null)
      // gets a "Find support resources" chip injected onto Jess's
      // most recent bubble. handleChip intercepts the chip-tap and
      // renders the hardcoded UK support card inline — no LLM call.
      // This guarantees the resources are always one tap away even
      // when Jess's prose itself doesn't surface them.
      if (category) {
        setTimeout(() => {
          setMessages((prev) => {
            // Find the last assistant bubble (NOT a referral card)
            // and append the chip if not already present.
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
              const m = next[i];
              if (m?.role === "jess" && m?.type === "bubble") {
                const chips = Array.isArray(m.chips) ? m.chips.slice() : [];
                if (!chips.includes("Find support resources")) {
                  chips.push("Find support resources");
                  next[i] = { ...m, chips };
                }
                return next;
              }
            }
            return next;
          });
        }, 2400);
      }
      // Feature 1F — bump message_count, updated_date, preview_text.
      if (record?.id) {
        const bumped = await bumpConvoMeta(record, msg);
        // Feature 1B — fire the auto-namer after the user's 2nd message.
        const userMsgs = conversationUserMsgsRef.current[record.id] || [];
        if (userMsgs.length >= 2) {
          // Use the freshest record so message_count / preview_text are
          // current when the namer writes back.
          autoNameConversation(bumped || record);
        }
      }
    } catch {
      // Graceful fallback — cycle through DEFAULT_RESPONSES with current
      // phase context so the reply feels substantive instead of generic.
      setTimeout(() => {
        const ctx = buildScriptedContext({ phase, dayInCycle, profile });
        const idx = defaultResponseIdxRef.current % DEFAULT_RESPONSES.length;
        defaultResponseIdxRef.current += 1;
        // every DEFAULT_RESPONSE is a cycle-phase script — with no cycle data they'd
        // render "day null of your null phase", so say the honest thing instead.
        const fallback = ctx.hasCycle
          ? fillTemplate(DEFAULT_RESPONSES[idx], ctx)
          : NO_CYCLE_REPLIES[idx % NO_CYCLE_REPLIES.length];
        setMessages((prev) => [...prev, {
          id: uid(), role: "jess", type: "bubble",
          text: fallback, time: fmtTimeAmPm(),
        }]);
        setAssistantTyping(false);
      }, 1200 + Math.random() * 1000);
    }
  }, [assistantTyping, ensureConversation, contextBlock, phase, dayInCycle, profile, bumpConvoMeta, autoNameConversation]);

  // Tap a proactive chip → send the question as the user's message.
  const handleProactiveChip = useCallback((label) => {
    setTab("chat");
    sendUserText(label);
  }, [sendUserText]);

  // ── Ask-Jess seed (inline ask-and-answer) ───────────────────────────────
  // When opened from an "Ask Jess" surface (Health letter, pattern nudge,
  // the /Assistant page deep-link…) the caller passes the reading context
  // as `initialPrompt`. We auto-send it once as the user's first turn so
  // Jess answers it right here in context — no empty panel, no bounce to a
  // dead page.
  //
  // sendUserText is read through a ref so the seed effect's deps stay
  // STABLE (initialPrompt + user.id only). If we listed sendUserText in the
  // deps, profile/context hydrating would change its identity, re-run the
  // effect, and its cleanup would cancel the pending timer before it fired
  // (the ref guard then blocks a re-schedule) — so the seed silently never
  // sent. The ref also means the deferred call uses the FRESHEST
  // sendUserText, so the turn carries fully-hydrated context.
  const sendUserTextRef = useRef(sendUserText);
  sendUserTextRef.current = sendUserText;
  const initialPromptFiredRef = useRef(false);
  useEffect(() => {
    if (initialPromptFiredRef.current) return;
    const seed = String(initialPrompt || "").trim();
    if (!seed || !user?.id) return;
    initialPromptFiredRef.current = true;
    setFollowUpFired(true);
    setTab("chat");
    // Defer one beat so profile/context have a chance to hydrate before the
    // turn fires. Deps are stable, so this effect runs once and the cleanup
    // only fires on unmount (never cancelling the timer mid-load).
    const t = window.setTimeout(() => { sendUserTextRef.current(seed); }, 600);
    return () => window.clearTimeout(t);
  }, [initialPrompt, user?.id]);

  // Feature 4 — Astra handoff. After 3+ user turns Jess offers a one-tap
  // jump to /Lifestyle?tab=horoscope&from=jess. We seed sessionStorage
  // with phase / recent topics / mood so the Astra surface can show a
  // "Jess sent you — here's the context" banner without re-fetching.
  const astraReady = useMemo(() => {
    return messages.filter((m) => m?.role === "user").length >= 3;
  }, [messages]);

  const handleAstraHandoff = useCallback(() => {
    const recentTopics = messages
      .filter((m) => m?.role === "user")
      .slice(-3)
      .map((m) => String(m?.text || m?.content || "").slice(0, 80))
      .filter(Boolean);
    const handoff = {
      from: "jess",
      ts: Date.now(),
      phase,
      cycleDay: dayInCycle,
      lifeStage: profile?.life_stage || "reproductive",
      recentTopics,
      mood: todayCheckin?.mood ?? null,
      energy: todayCheckin?.energy ?? todayCheckin?.energy_level ?? null,
      sentBy: profile?.jess_name || "Jess",
    };
    try {
      window.sessionStorage.setItem("jess_astra_handoff", JSON.stringify(handoff));
    } catch { /* swallow quota */ }
    // Navigate to the Lifestyle Horoscope tab; from=jess triggers the
    // banner pickup on the Astra side.
    window.location.href = "/Lifestyle?tab=horoscope&from=jess";
  }, [messages, phase, dayInCycle, profile, todayCheckin]);

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
    // QA FIX 1 — CRITICAL SAFETY. If the chip label looks like a
    // crisis-resources ask (e.g. "Find support resources", "Find
    // mental wellness resources", "Show helplines", "Get help"),
    // render the hardcoded UK support card inline and DO NOT send
    // any text to the chat. The agent must never be asked to
    // generate hotline numbers — they need to be exact and reliable.
    //
    // QA round 3 — broadened the regex after Jess emitted her own
    // chip labelled "Find mental wellness resources", which the
    // narrower pattern missed. Anything that pairs "resources" /
    // "helpline" / "hotline" / "crisis line" with a help-seeking
    // verb or wellness adjective now intercepts.
    const ciLabel = String(chipLabel || "").toLowerCase();
    const hasResourcesWord = /\b(?:resources?|helplines?|hotlines?)\b/.test(ciLabel);
    const hasHelpVerb = /\b(?:find|show|get|see|browse|view)\b/.test(ciLabel);
    const hasWellnessAdj = /\b(?:support|wellness|mental|emotional|crisis|safety|help)\b/.test(ciLabel);
    const isResourcesAsk =
      (hasResourcesWord && (hasHelpVerb || hasWellnessAdj)) ||
      /\bcrisis\s+(?:line|support|help)\b/.test(ciLabel) ||
      /\b(?:get|find)\s+(?:help|support)\b/.test(ciLabel) ||
      ciLabel === "find support" ||
      ciLabel === "show resources";
    if (isResourcesAsk) {
      // Mark the chip as used (so the strip dims it) but never
      // post the user-bubble OR call the agent.
      setMessages((prev) => {
        const next = prev.map((m) => {
          if (m.id !== fromMessageId) return m;
          const usedSet = new Set(m.chipsUsedList || []);
          usedSet.add(chipLabel);
          return { ...m, chipsUsedList: Array.from(usedSet) };
        });
        return [
          ...next,
          {
            id: uid(),
            role: "jess",
            type: "referral",
            variant: "self_harm", // generic-support tone, not the urgent red one
            title: "Support resources",
            lines: [
              "Samaritans: 116 123 (free, 24/7)",
              "Crisis text line: text SHOUT to 85258",
              "Mind: 0300 123 3393",
              "Emergency: 999",
            ],
            text: "Samaritans: 116 123 · SHOUT to 85258 · Mind: 0300 123 3393 · Emergency: 999",
            time: fmtTimeAmPm(),
          },
        ];
      });
      return;
    }

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
      // a template that leans on {phase}/{cycleDay} can't be filled truthfully without
      // her dates — fall back to the honest reply rather than printing nulls.
      const needsCycle = !!template && /\{(phase|cycleDay|tomorrowDay|daysToNextPhase|nextPhase)\}/.test(template);
      const text = !template
        ? "Tell me more about that — I'm listening."
        : (needsCycle && !ctx.hasCycle)
          ? NO_CYCLE_REPLIES[0]
          : fillTemplate(template, ctx);
      // Track which chips have been used across the whole session so the
      // follow-up strip on this new bubble shows fresh suggestions only.
      setMessages((prev) => {
        const used = new Set();
        for (const m of prev) {
          if (Array.isArray(m.chipsUsedList)) for (const c of m.chipsUsedList) used.add(c);
        }
        used.add(chipLabel);
        // Sprint 9 QA fix — also exclude the cycle-only chip for peri /
        // meno / post-meno users so it can't re-appear later in the
        // chip rotation.
        const lifeStageNow = profile?.life_stage;
        const isMenoStageNow = !!lifeStageNow && ["perimenopause", "menopause", "post-menopause"].includes(lifeStageNow);
        if (isMenoStageNow) used.add("What's coming in my cycle?");
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
      {/* QA — right padding is 60px (not 16px) so AssistantOverlay's
          floating close button (34px wide, positioned right:12px) has
          ~14px of clearance from the rightmost header control
          (settings cog at 40px wide). Without this, the X overlaps
          the settings cog on every viewport narrower than ~520px. */}
      <header style={{
        padding: "max(env(safe-area-inset-top), 12px) 60px 14px 16px",
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
          {/* Brand-P2: the single carved crimson heart (§3) beside Jess's name. */}
          <h1 style={{
            margin: 0,
            fontSize: 22, fontWeight: 600,
            color: C.espresso, letterSpacing: "-0.01em",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>{assistantName} <BrandHeart size={13} /></h1>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 2, fontSize: 12,
            color: C.mutedText, }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: shell.accent }} />
            {/* Sprint 10 follow-on — the persistent header subtitle was
                the second spot still rendering "Day N · Phase" for peri /
                meno / post-meno users. Guard mirrors BriefTab + the
                opener message. */}
            {(() => {
              const lifeStageNow = profile?.life_stage;
              const isMenoStageNow = !!lifeStageNow && ["perimenopause", "menopause", "post-menopause"].includes(lifeStageNow);
              const MENO_HEADER = {
                perimenopause: "Perimenopause",
                menopause: "Menopause",
                "post-menopause": "Post-menopause",
              };
              return isMenoStageNow
                ? <span>{MENO_HEADER[lifeStageNow] || "Life stage"}</span>
                : <span>Day {dayInCycle} · {shell.label}</span>;
            })()}
          </div>
          {/* Sprint 12 batch 1 — compliance microcopy: Jess data notice */}
          <p style={{
            margin: "4px 0 0", fontSize: 10, lineHeight: 1.4,
            color: "#9B8B7A",
            }}>
            Jess is a wellness companion · Not medical advice · Your conversations are private
          </p>
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
            fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <span aria-hidden style={{ color: C.gold, fontSize: 11 }}>✦</span>
          New
        </button>
        <button
          type="button"
          // Sprint 5 — mic now opens JessVoiceMode (full-screen voice
          // companion). The old JessVoiceLogger sheet is no longer
          // reachable from any UI element.
          onClick={() => setVoiceModeOpen(true)}
          aria-label="Talk to Jess"
          style={{
            width: 40, height: 40, borderRadius: 9999, border: "none",
            background: C.blush, color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(232,180,184,0.35)",
          }}
        ><Mic size={16} /></button>
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
            feedbackByMsgId={feedbackByMsgId} setFeedbackByMsgId={setFeedbackByMsgId} user={user}
          />
        )}
        {tab === "brief"    && (
          <BriefTab phase={phase} dayInCycle={dayInCycle} shell={shell} tasks={tasks} energySpark={energySpark}
            lifeStage={profile?.life_stage}
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
            user={user}
            recentCheckins={recentCheckins}
            symptoms={symptoms}
            tabChip="What's the one thing I should focus on today?" onTabChip={handleProactiveChip} />
        )}
      </div>

      {/* Astra handoff chip — moved here 2026-05-23 per QA. Sits in the
          flexible footer stack above the input bar so it stays visible
          without scrolling once the user has had 3+ turns. The chat
          body is `overflow: auto` so this banner remains pinned no
          matter how long the conversation gets. */}
      {tab === "chat" && astraReady && (
        <div style={{
          padding: "6px 14px 0",
          background: C.cream,
          display: "flex", flexShrink: 0, justifyContent: "center",
          animation: "jess-astra-chip-rise 240ms ease-out",
        }}>
          <button
            type="button"
            onClick={handleAstraHandoff}
            aria-label="Talk to Astra about this"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 14px", minHeight: 36, borderRadius: 9999,
              background: "linear-gradient(135deg, #2A1E0E 0%, #4A3B2A 100%)",
              color: C.cream,
              border: `1px solid ${C.gold}`,
              cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              boxShadow: "0 6px 16px rgba(58,44,26,0.18)",
              maxWidth: "100%",
            }}
          >
            <Star size={13} style={{ color: C.gold, flexShrink: 0 }} aria-hidden />
            Talk to Astra about this
            <ChevronRight size={13} style={{ opacity: 0.7, flexShrink: 0 }} aria-hidden />
          </button>
          <style>{`
            @keyframes jess-astra-chip-rise {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Jess v2 J2-3 — persistent footer disclaimer on the chat panel.
          One line, muted, sits just above the input bar so it's always
          in view when the user is typing without intruding on the
          thread. Per-bubble MhraNote (`<MhraNote />` in MessageNode)
          still renders, but this is the always-visible reassurance. */}
      {tab === "chat" && (
        <div style={{
          padding: "6px 14px 0",
          background: C.cream,
          flexShrink: 0,
        }}>
          <p style={{
            margin: 0, fontSize: 10.5, color: C.muted, fontStyle: "italic",
            textAlign: "center", lineHeight: 1.4,
          }}>
            Not medical advice — Jess is a wellness companion.
          </p>
        </div>
      )}

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
        conversations={jessConvos}
        activeId={activeConvRecord?.id || null}
        search={historySearch}
        onSearchChange={setHistorySearch}
        onSelect={loadConversation}
        onDelete={softDeleteConvo}
        onNew={startNewConversation}
      />

      <JessSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        profile={profile}
        onProfileChange={(p) => setProfile(p)}
      />

      {/* Feature 3 — Voice Logger overlay (legacy; no longer reachable
          from any UI element after Sprint 5. Mounted here so existing
          deep-link triggers, if any, still work; safe to delete later.) */}
      <JessVoiceLogger
        open={voiceLoggerOpen}
        onClose={() => setVoiceLoggerOpen(false)}
        user={user}
      />

      {/* Sprint 5 — Voice Companion overlay. Wired to the mic button
          in the panel header. Full-screen espresso, pulse circle, Web
          Speech API, parses the same Sprint 5 JSON envelope and
          executes the same actions as text chat. */}
      <JessVoiceMode
        open={voiceModeOpen}
        onClose={() => setVoiceModeOpen(false)}
        user={user}
        profile={profile}
        phase={phase}
        cycleDay={dayInCycle}
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
  proactiveChips, onProactiveChip, feedbackByMsgId, setFeedbackByMsgId, user,
}) {
  return (
    <div style={{
      padding: "14px 14px 8px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {/* Astra handoff chip moved out of the chat thread on 2026-05-23
          per QA. Now rendered as a sticky pill ABOVE the input bar
          (see the JSX block following the chat-body container) so it
          stays visible without scrolling once the 3+ turn threshold
          is hit. The trigger condition (astraReady) is unchanged. */}

      {/* Proactive question chips — "Jess is thinking about you" row */}
      {Array.isArray(proactiveChips) && proactiveChips.length > 0 && (
        <div style={{ marginBottom: 2 }}>
          <p style={{
            margin: "0 0 6px 4px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, }}>Jess is thinking about you</p>
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
          feedback={(feedbackByMsgId || {})[m.id] || null}
          onFeedback={(rating, reason) => {
            // QA Fix 4 — write to the dedicated feedbackByMsgId map so
            // streaming msg updates can't blow this away.
            if (user?.id) recordFeedback(user.id, { messageText: m.text, rating, reason });
            setFeedbackByMsgId((prev) => ({
              ...prev,
              [m.id]: {
                rating,
                reason: reason || prev[m.id]?.reason || null,
              },
            }));
          }}
        />
      ))}
      {assistantTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

// Bucket a row by its updated_date — Today / This week / Earlier.
function groupByRecency(rows) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  // 7 days ago at midnight — "this week" is the past 7 days excluding today.
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 6); // includes today's start
  const buckets = { today: [], week: [], earlier: [] };
  for (const r of rows) {
    const when = new Date(r.updated_date || r.created_date || 0).getTime();
    if (Number.isNaN(when) || when === 0) { buckets.earlier.push(r); continue; }
    if (when >= startOfToday.getTime()) buckets.today.push(r);
    else if (when >= startOfWeek.getTime()) buckets.week.push(r);
    else buckets.earlier.push(r);
  }
  return buckets;
}

// Short relative time-stamp shown next to each row (e.g. "9:14am", "Mon",
// "12 May"). Today → time, this week → weekday, earlier → DD Mon.
function relativeStamp(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const sixDaysAgo = new Date(startOfToday); sixDaysAgo.setDate(startOfToday.getDate() - 6);
    if (d.getTime() >= startOfToday.getTime()) {
      return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
        .toLowerCase().replace(" ", "");
    }
    if (d.getTime() >= sixDaysAgo.getTime()) {
      return d.toLocaleDateString("en-GB", { weekday: "short" });
    }
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch { return ""; }
}

// ─── History drawer — slides in from the LEFT of the panel ───────────────
// Reads from the JessConversation entity. Sections by recency, supports
// real-time search, swipe-to-delete on each row, and an empty state with
// the Jess botanical sigil.
function HistoryDrawer({
  open, onClose, conversations, activeId, search, onSearchChange,
  onSelect, onDelete, onNew,
}) {
  if (!open) return null;
  const all = (conversations || []).filter((c) => !c?.is_deleted);
  const q = String(search || "").trim().toLowerCase();
  const filtered = !q ? all : all.filter((c) => {
    const hay = `${c?.name || ""} ${c?.preview_text || ""}`.toLowerCase();
    return hay.includes(q);
  });
  const buckets = groupByRecency(filtered);

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
          width: "82%", maxWidth: 348, height: "100%",
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
          padding: "16px 16px 8px",
        }}>
          <span style={{
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

        {/* Search bar — debouncing the entity round-trip isn't needed
            because filtering happens client-side over the cached list. */}
        <div style={{
          padding: "4px 16px 10px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "0 12px", minHeight: 38,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 9999,
          }}>
            <Search size={14} aria-hidden style={{ color: C.cream, opacity: 0.5, flexShrink: 0 }} />
            <input
              type="search"
              value={search || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              style={{
                flex: 1, minWidth: 0,
                background: "transparent", border: "none", outline: "none",
                color: C.cream, fontSize: 13.5, padding: "8px 0",
              }}
            />
            {q && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                aria-label="Clear search"
                style={{
                  background: "transparent", border: "none",
                  color: C.cream, opacity: 0.6, cursor: "pointer", padding: 0,
                  display: "inline-flex", alignItems: "center",
                }}
              ><X size={12} aria-hidden /></button>
            )}
          </div>
        </div>

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
            fontSize: 13, fontWeight: 700,
          }}
        >
          <span aria-hidden style={{ fontSize: 14, lineHeight: 1, color: C.gold }}>✦</span>
          New conversation
        </button>

        <div style={{
          flex: 1, overflowY: "auto",
          padding: "4px 0 max(env(safe-area-inset-bottom), 16px)",
        }}>
          {filtered.length === 0 ? (
            <DrawerEmpty hasQuery={!!q} />
          ) : (
            <>
              {buckets.today.length > 0 && (
                <DrawerSection
                  label="Today"
                  rows={buckets.today}
                  activeId={activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              )}
              {buckets.week.length > 0 && (
                <DrawerSection
                  label="This week"
                  rows={buckets.week}
                  activeId={activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              )}
              {buckets.earlier.length > 0 && (
                <DrawerSection
                  label="Earlier"
                  rows={buckets.earlier}
                  activeId={activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function DrawerSection({ label, rows, activeId, onSelect, onDelete }) {
  return (
    <div style={{ marginTop: 6 }}>
      <p style={{
        margin: "8px 16px 4px", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: C.cream, opacity: 0.55,
        }}>{label}</p>
      {rows.map((r) => (
        <DrawerRow
          key={r.id}
          row={r}
          isActive={activeId === r.id}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// One row with an always-visible explicit delete icon (Trash2) sitting
// to the right of the row content. QA round 3 retired the previous
// swipe-to-reveal pattern: on desktop / Dispatch the swipe never
// triggers, the delete button stays hidden behind the row body, and
// taps on the (translucent-but-visible) delete area kept falling
// through to the row's onSelect. The new layout uses a flex row with
// a dedicated trash button — completely separate hit-targets, no
// overlap, no transform tricks.
function DrawerRow({ row, isActive, onSelect, onDelete }) {
  const name = row?.name || "Untitled chat";
  const preview = row?.preview_text || "";
  const stamp = relativeStamp(row?.updated_date || row?.created_date);
  const isPending = row?.name_status === "pending" && !row?.name;

  // Delete handler — stop propagation defensively at every event tier
  // so the click cannot bubble up to a wrapper that calls onSelect.
  function handleDeleteClick(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === "function") {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    onDelete?.(row.id);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        background: isActive ? "rgba(255,255,255,0.06)" : C.espressoDeep,
        borderLeft: isActive ? `3px solid ${C.gold}` : "3px solid transparent",
      }}
    >
      {/* Row body — clickable region for selecting the conversation.
          Takes all remaining space; the delete icon sits next to it
          as a sibling button. */}
      <button
        type="button"
        onClick={() => onSelect?.(row)}
        style={{
          flex: 1, minWidth: 0,
          textAlign: "left",
          display: "block",
          padding: "10px 8px 10px 16px",
          background: "transparent",
          border: "none",
          color: C.cream, cursor: "pointer",
          }}
      >
        <div style={{
          display: "flex", alignItems: "baseline", gap: 8,
          marginBottom: preview ? 3 : 0,
        }}>
          <p style={{
            margin: 0, fontSize: 13.5, fontWeight: 600, color: C.cream,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            lineHeight: 1.35, flex: 1, minWidth: 0,
            opacity: isPending ? 0.7 : 1,
            fontStyle: isPending ? "italic" : "normal",
          }}>{isPending ? "New conversation" : name}</p>
          {stamp && (
            <span style={{
              fontSize: 10, color: C.cream, opacity: 0.5,
              letterSpacing: "0.04em", flexShrink: 0,
            }}>{stamp}</span>
          )}
        </div>
        {preview && (
          <p style={{
            margin: 0, fontSize: 11.5, color: C.cream, opacity: 0.55,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            lineHeight: 1.4,
          }}>{preview}</p>
        )}
      </button>
      {/* Always-visible delete icon — its own button, no z-index
          stacking shenanigans, no swipe required. Padded for an
          easy hit-target on touch. */}
      <button
        type="button"
        aria-label={`Delete ${name}`}
        onClick={handleDeleteClick}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          flexShrink: 0,
          width: 44,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
          color: C.cream, opacity: 0.55,
          border: "none", cursor: "pointer",
          padding: 0,
          margin: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.95"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.55"; }}
      >
        <Trash2 size={16} aria-hidden />
      </button>
    </div>
  );
}

function DrawerEmpty({ hasQuery }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 14, padding: "44px 24px 0",
      textAlign: "center",
    }}>
      <div aria-hidden style={{
        width: 60, height: 60, borderRadius: 9999,
        background: "rgba(255,255,255,0.06)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <BotanicalSigil size={30} stroke={C.gold} />
      </div>
      <p style={{
        margin: 0, fontSize: 13.5, color: C.cream, opacity: 0.85,
        lineHeight: 1.5,
        maxWidth: 220,
      }}>
        {hasQuery
          ? "No conversations match that search."
          : "No past conversations yet"}
      </p>
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

// Jess v2 J2-7 — thumbs row beneath every Jess bubble. Compact, muted
// when fresh; once rated it collapses to a small acknowledgement; on
// thumbs-down it expands a 3-chip reason picker.
//
// QA Fix 4 — the picker visibility is now driven by a LOCAL useState
// flag, set the instant the thumbs-down button is clicked, in addition
// to whatever the parent's `feedback` prop says. This makes the picker
// reveal instant + immune to upstream state-update races (streaming
// chunks rebuilding the messages array, etc.). The flag clears as soon
// as the user selects a reason. The `feedback` prop is now an
// explicit object `{ rating, reason } | null` from the parent, not a
// field on the msg object.
function FeedbackRow({ feedback, onFeedback }) {
  const rating = feedback?.rating || null;
  const reason = feedback?.reason || null;
  const rated  = !!rating;
  const [askReason, setAskReason] = useState(false);
  // Sync local "ask" flag from prop state: when a thumbs-down rating
  // exists without a reason, ask. When a reason lands, stop asking.
  useEffect(() => {
    if (rating === "down" && !reason) setAskReason(true);
    if (rating === "down" && reason)  setAskReason(false);
    if (rating === "up")              setAskReason(false);
  }, [rating, reason]);

  const showReasons = askReason && rating === "down" && !reason;

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 6,
      marginTop: 6, marginLeft: 2,
    }}>
      {!rated && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} role="group" aria-label="Rate this reply">
          <button
            type="button"
            aria-label="Helpful"
            onClick={(e) => { e.stopPropagation(); onFeedback("up"); }}
            style={{
              width: 26, height: 26, borderRadius: 9999,
              background: "transparent", border: `1px solid ${C.border}`,
              color: C.muted, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: 0,
            }}
          ><ThumbsUp size={12} /></button>
          <button
            type="button"
            aria-label="Not helpful"
            onClick={(e) => {
              e.stopPropagation();
              // QA Fix 4 — flip the local picker BEFORE the parent
              // setState round-trip so the user sees the picker the
              // moment they tap, even if the parent's state update
              // hasn't propagated yet.
              setAskReason(true);
              onFeedback("down");
            }}
            style={{
              width: 26, height: 26, borderRadius: 9999,
              background: "transparent", border: `1px solid ${C.border}`,
              color: C.muted, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: 0,
            }}
          ><ThumbsDown size={12} /></button>
        </div>
      )}
      {rated && !showReasons && (
        <span style={{
          fontSize: 10.5, color: C.muted,
          letterSpacing: "0.04em",
        }}>
          {rating === "up" ? "Thanks — Jess will lean this way." :
            reason
              ? "Noted — Jess will adjust next reply."
              : "Noted."}
        </span>
      )}
      {showReasons && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(FEEDBACK_REASONS).map(([key, r]) => (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAskReason(false);
                onFeedback("down", key);
              }}
              style={{
                padding: "5px 10px", minHeight: 28,
                background: C.creamDark, border: `1px solid ${C.border}`,
                borderRadius: 9999, color: C.espresso, cursor: "pointer",
                fontSize: 11.5, fontWeight: 600,
              }}
            >{r.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// Jess v2 J2-2 — typewriter-style reveal for the Jess chat bubble.
// Splits the text into words (keeping whitespace tokens) and reveals
// them at ~40ms each. When `text` grows mid-reveal (streaming chunks),
// the target word count grows too, so the animation naturally extends
// instead of restarting. Once fully revealed, switches to a proper
// ReactMarkdown render so bold/italic/lists format correctly.
function StreamingMarkdown({ text, speedMs = 40 }) {
  const [shown, setShown] = useState(0);
  const tokens = useMemo(() => String(text || "").split(/(\s+)/), [text]);
  const total = tokens.length;
  useEffect(() => {
    if (shown >= total) return;
    const t = setTimeout(() => setShown((n) => Math.min(total, n + 1)), speedMs);
    return () => clearTimeout(t);
  }, [shown, total, speedMs]);
  if (shown >= total) {
    return (
      <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {text || ""}
      </ReactMarkdown>
    );
  }
  return <span>{tokens.slice(0, shown).join("")}</span>;
}

function MessageNode({ msg, shell, onChip, onToggleQuickLog, feedback, onFeedback }) {
  // Divider chip — e.g. "Conversation resumed" when the user re-opens an
  // old thread from the History drawer. Centred, muted, not a bubble.
  if (msg.type === "divider" || msg.role === "divider") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        margin: "6px 0 4px",
      }} aria-hidden>
        <span style={{ flex: 1, height: 1, background: C.border, opacity: 0.55 }} />
        <span style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.muted,
        }}>{msg.text || "Resumed"}</span>
        <span style={{ flex: 1, height: 1, background: C.border, opacity: 0.55 }} />
      </div>
    );
  }
  // Sprint 5 — Action Layer confirmation chip. Small inline pill that
  // confirms what Jess wrote to entities, e.g. "✓ Logged your mood".
  // Sage tint so it reads as a positive confirmation, not a question.
  if (msg.type === "action-chip") {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        marginTop: 2,
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 9999,
          background: "rgba(143,175,143,0.20)",
          color: "#3D6B3D",
          border: "1px solid rgba(143,175,143,0.45)",
          fontSize: 12, fontWeight: 700,
          letterSpacing: "0.02em",
        }}>{msg.text || "✓ Done"}</span>
        {msg.time && (
          <span style={{
            fontSize: 10, color: C.muted, marginTop: 3,
            }}>Jess · {msg.time}</span>
        )}
      </div>
    );
  }
  // Crisis-protocol referral card. The chat shell builds these with
  // `variant: <CRISIS_CATEGORIES value>`. Each variant gets its own
  // tone of voice — urgent reads as urgent (red, "please read"), the
  // other support categories read as steady support (gold, "Support
  // resource"). Multi-line content arrives in `msg.lines`; we still
  // support `msg.text` for legacy single-line cards.
  if (msg.type === "referral") {
    // Variants that should read with the loudest urgency framing.
    const URGENT_VARIANTS = new Set(["urgent_crisis", "urgent"]);
    const isUrgent = URGENT_VARIANTS.has(msg.variant);
    const ringTint = isUrgent ? "#D45E52" : C.gold;
    const bg       = isUrgent ? "#FFF1EE" : C.paperHi;
    // Per-variant eyebrow label so a user knows at a glance which
    // resource they're being pointed at.
    const VARIANT_LABEL = {
      urgent_crisis:   "Urgent · please read",
      urgent:          "Urgent · please read",          // legacy alias
      self_harm:       "Support resource · please read",
      eating_disorder: "Support resource",
      domestic_abuse:  "Confidential support",
      severe_anxiety:  "Grounding · with you",
      distress:        "Support resource",
    };
    const label = VARIANT_LABEL[msg.variant] || "Support resource";
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
        <article style={{
          width: "100%",
          background: bg,
          border: `1px solid ${ringTint}66`,
          borderLeft: `3px solid ${ringTint}`,
          borderRadius: 14,
          padding: "12px 14px 10px",
          display: "flex", flexDirection: "column", gap: 6,
          animation: "jess-bubble-enter 280ms ease-out",
        }}>
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: isUrgent ? "#A23B30" : C.goldDeep || "#A6862B",
            }}>{label}</p>
          <p style={{
            margin: "2px 0 0", fontSize: 14.5, fontWeight: 600,
            color: C.espresso, lineHeight: 1.35,
          }}>{msg.title}</p>
          {Array.isArray(msg.lines) && msg.lines.length > 0 ? (
            <ul style={{
              margin: "4px 0 0", padding: "0 0 0 16px",
              fontSize: 13, color: C.espresso,
              lineHeight: 1.55,
            }}>
              {msg.lines.map((line, i) => (
                <li key={i} style={{ marginTop: i === 0 ? 0 : 2 }}>{line}</li>
              ))}
            </ul>
          ) : (
            <p style={{
              margin: "2px 0 0", fontSize: 13, color: C.espresso,
              lineHeight: 1.5,
            }}>{msg.text}</p>
          )}
        </article>
        {msg.time && (
          <span style={{
            fontSize: 10, color: C.muted, marginTop: 3,
            }}>Jess · {msg.time}</span>
        )}
      </div>
    );
  }
  if (msg.role === "user") {
    // user-bubble: blush #E8B4B8, espresso text, asymmetric 17px / 4px corners
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{
          maxWidth: "86%",
          borderRadius: "17px 17px 4px 17px",
          padding: "10px 13px",
          fontSize: 13.5, lineHeight: 1.6,
          background: C.blush, color: C.espresso,
          animation: "jess-bubble-enter 280ms ease-out",
        }}>{msg.text}</div>
        {msg.time && (
          <span style={{
            fontSize: 10, color: C.muted, marginTop: 3,
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
        background: C.espresso, color: C.cream,
        boxShadow: "0 1px 4px rgba(58,44,26,0.06)",
        animation: "jess-bubble-enter 280ms ease-out",
        whiteSpace: "pre-wrap",
      }}>
        {/* Jess v2 J2-2 — typewriter reveal at ~40ms per word. Once
            fully revealed StreamingMarkdown swaps to ReactMarkdown so
            bold/italic/lists format correctly. */}
        <StreamingMarkdown text={msg.text || ""} speedMs={40} />
      </div>
      {msg.time && (
        <span style={{
          fontSize: 10, color: C.muted, marginTop: 3,
          }}>Jess · {msg.time}</span>
      )}
      {/* Jess v2 J2-7 — feedback row. Compact thumbs row on every Jess
          bubble. Once rated, the row collapses to a small label so the
          user sees their input was recorded; thumbs-down reveals three
          reason chips. Feedback is persisted via the parent's onFeedback
          callback (writes to localStorage) and biases the NEXT agent
          turn via feedbackDirective(). */}
      {onFeedback && (
        <FeedbackRow feedback={feedback} onFeedback={onFeedback} />
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
function BriefTab({ phase, dayInCycle, shell, tasks, energySpark, lifeStage, tabChip, onTabChip }) {
  const copy = PHASE_COPY[phase] || PHASE_COPY.follicular;
  // Sprint 9 QA fix — peri / meno / post-meno users have no meaningful
  // cycle phase. Replace the "Phase · Day N" subtitle (and the kicker
  // label above it) with their life stage so the header tracks reality.
  const isMenoStage = !!lifeStage && ["perimenopause", "menopause", "post-menopause"].includes(lifeStage);
  const MENO_LABEL = {
    perimenopause: "Perimenopause",
    menopause: "Menopause",
    "post-menopause": "Post-menopause",
  };
  const headerKicker = isMenoStage ? "This stage" : "This phase";
  const headerTitle = isMenoStage
    ? (MENO_LABEL[lifeStage] || "Your stage")
    : `${shell.label} · Day ${dayInCycle}`;
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
        <p style={kicker}>{headerKicker}</p>
        <h2 style={{
          margin: "2px 0 6px", fontSize: 22, fontWeight: 600, color: C.espresso, letterSpacing: "-0.01em",
        }}>{headerTitle}</h2>
        <p style={{
          margin: 0, fontSize: 13, color: C.mutedText,
          lineHeight: 1.55,
        }}>{copy.blurb}</p>
      </Card>
      <Card animationDelay={80}>
        <p style={kicker}>Energy forecast</p>
        <Sparkline data={energySpark} width={300} height={56} stroke={C.sage} />
        <p style={{
          margin: "8px 0 0", fontSize: 13, color: C.espresso,
          lineHeight: 1.55,
        }}>{copy.expect}</p>
        <p style={{
          margin: "6px 0 0", fontSize: 11, color: C.mutedText,
          }}>Today: <strong style={{ color: C.espresso }}>{todayEnergy?.toFixed?.(1) || todayEnergy}/5</strong> projected</p>
      </Card>
      <Card animationDelay={160}>
        <p style={kicker}>Today's priorities</p>
        {tasks.length === 0 ? (
          <p style={{
            margin: 0, fontSize: 13, color: C.mutedText,
            fontStyle: "italic", }}>Nothing scheduled — that itself can be a kind of plan.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {tasks.map((t) => (
              <li key={t.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderRadius: 10,
                background: C.paper, border: `1px solid ${C.border}`,
                fontSize: 13, color: C.espresso, }}>
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
          margin: 0, fontSize: 17, fontWeight: 500, color: C.espresso, lineHeight: 1.4,
        }}>Your sleep has been steady. That's worth more than you think — it's the lever everything else moves through.</p>
        <MhraNote />
      </Card>
      <div style={{
        background: C.creamDark, border: `1px dashed ${C.border}`,
        borderRadius: 12, padding: "10px 14px",
        fontSize: 12, color: C.mutedText, animation: "jess-card-rise 320ms ease-out 320ms backwards",
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
            color: C.muted, }}>7-DAY MOOD</p>
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
              lineHeight: 1.5,
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
                    fontSize: 13, fontWeight: 700,
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{
                    flex: 1, fontSize: 13.5, fontWeight: 600, color: C.espresso,
                    }}>{name}</span>
                  <span style={{
                    padding: "3px 9px", borderRadius: 9999,
                    background: C.espresso, color: C.cream,
                    fontSize: 11, fontWeight: 700,
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
              margin: 0, fontSize: 15, fontStyle: "italic", lineHeight: 1.45, color: C.cream,
            }}>
              {jessObservation || "I'm still learning the shape of your week. Log a couple more days and patterns will surface."}
            </p>
          )}
          <p style={{
            margin: "10px 0 0", fontSize: 10, fontStyle: "italic", lineHeight: 1.4,
            color: "rgba(244,237,219,0.65)", }}>Not medical advice. Always consult a healthcare professional.</p>
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
          fontSize={18} fontWeight={600}
          fill={C.espresso}
        >{display}</text>
        <text
          x={38} y={56}
          textAnchor="middle"
          fontSize={8} fontWeight={600}
          fill={C.muted}
          letterSpacing="0.08em"
        >/ {max}</text>
      </svg>
      <p style={{
        margin: 0, fontSize: 11, fontWeight: 600, color: C.espresso,
        letterSpacing: "0.02em",
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
        }}
    >Dig deeper <ChevronRight size={12} /></button>
  );
}

// ─── For You tab — Feature 4 ──────────────────────────────────────────────
// Three sections:
//   1. This week — 5 category cards (PHASE_RECS), horizontal scroll
//   2. Jess noticed — agent-derived pattern from last 7 days, daily cache
//   3. Coming up — next phase preview (NEXT_PHASE_PREVIEW lookup)
const FOR_YOU_CATEGORIES = [
  { key: "nutrition", label: "Nutrition", Icon: Apple },
  { key: "movement",  label: "Movement",  Icon: Activity },
  { key: "rest",      label: "Rest",      Icon: Moon },
  { key: "mood",      label: "Mood",      Icon: Heart },
  { key: "social",    label: "Social",    Icon: Users },
];

function ForYouTab({ phase, shell, profile, user, recentCheckins, symptoms, tabChip, onTabChip }) {
  const recs = PHASE_RECS[phase] || PHASE_RECS.follicular;
  const nextPreview = NEXT_PHASE_PREVIEW[phase] || NEXT_PHASE_PREVIEW.follicular;
  const lifeStage = profile?.life_stage || "reproductive";

  // Pregnancy / postpartum / menopause stages don't follow a menstrual
  // cycle. Hide "next phase" for them and route mood/social/rest as
  // life-stage-agnostic content. PHASE_RECS still applies for the body of
  // For You — it just stops representing a cycle at those points.
  const hideNextPhase = lifeStage.startsWith("pregnant")
    || lifeStage === "postpartum"
    || lifeStage === "menopause"
    || lifeStage === "post-menopause";

  return (
    <div style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      <TabChip chip={tabChip} onTap={onTabChip} />

      {/* ── Section 1 — This week (5 category cards) ──────────────────── */}
      <section>
        <p style={{ ...kicker, padding: "0 4px", marginBottom: 10 }}>
          This week · {shell.label}
        </p>
        <div style={{
          display: "flex", overflowX: "auto", gap: 12,
          scrollSnapType: "x mandatory",
          padding: "4px 16px 8px",
          margin: "0 -16px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {FOR_YOU_CATEGORIES.map((cat, i) => {
            const Icon = cat.Icon;
            const tips = recs[cat.key] || [];
            return (
              <article key={cat.key} style={{
                flex: "0 0 240px",
                scrollSnapAlign: "start",
                background: C.paperHi,
                border: `1px solid ${C.border}`,
                borderTop: `3px solid ${shell.accent}`,
                borderRadius: 14,
                padding: "12px 14px 14px",
                animation: `jess-card-rise 320ms ease-out ${i * 60}ms backwards`,
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Icon size={14} style={{ color: shell.tone }} aria-hidden />
                  <p style={{
                    margin: 0, fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: C.espresso, }}>{cat.label}</p>
                </div>
                <ul style={{
                  margin: 0, padding: 0, listStyle: "none",
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  {tips.map((tip, j) => (
                    <li key={j} style={{
                      fontSize: 12, color: C.espresso,
                      lineHeight: 1.5,
                      paddingLeft: 10, position: "relative",
                    }}>
                      <span aria-hidden style={{
                        position: "absolute", left: 0, top: 7,
                        width: 4, height: 4, borderRadius: 9999,
                        background: shell.accent,
                      }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Section 2 — Jess noticed (agent call + daily cache) ────────── */}
      <JessNoticedCard
        user={user}
        recentCheckins={recentCheckins}
        symptoms={symptoms}
        phase={phase}
      />

      {/* ── Section 3 — Coming up (next phase preview) ────────────────── */}
      {!hideNextPhase && (
        <section>
          <p style={{ ...kicker, padding: "0 4px", marginBottom: 10 }}>
            Coming up · {nextPreview.nextPhase}
          </p>
          <Card animationDelay={120}>
            <p style={{
              margin: "0 0 12px", fontSize: 13.5, color: C.espresso,
              lineHeight: 1.55, fontStyle: "italic",
            }}>{nextPreview.preview}</p>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              background: C.paper, border: `1px solid ${C.border}`,
            }}>
              <Sparkles size={14} style={{ color: C.gold, flexShrink: 0, marginTop: 3 }} aria-hidden />
              <p style={{
                margin: 0, fontSize: 12.5, color: C.espresso,
                lineHeight: 1.55,
              }}><strong style={{ fontWeight: 700 }}>Prep tip — </strong>{nextPreview.prepTip}</p>
            </div>
          </Card>
        </section>
      )}

      <MhraNote />
    </div>
  );
}

// ─── Jess Noticed — pattern card with agent call + daily cache ───────────
// Calls the personal_assistant agent with a 7-day digest of DailyCheckins
// + SymptomLogs and asks for ONE short observation. Caches the text +
// feedback under `jess_noticed_${userId}_${todayKey}` so subsequent
// renders of the For You tab don't re-fire the agent.
//
// Empty-state branches:
//   • fewer than 3 checkins → "I'll start spotting patterns once you've
//     logged a few days" (no agent call)
//   • agent returns NOT_ENOUGH_DATA → same gentle prompt
//   • agent times out → render nothing (silent fail; UI doesn't punish)
function JessNoticedCard({ user, recentCheckins, symptoms, phase }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState(null); // "up" | "down" | null
  const [exhausted, setExhausted] = useState(false);
  const triedRef = useRef(false);

  const cacheKey = user?.id ? `jess_noticed_${user.id}_${todayKey()}` : null;
  const hasEnoughData = Array.isArray(recentCheckins) && recentCheckins.length >= 3;

  useEffect(() => {
    if (!cacheKey || triedRef.current) return;
    triedRef.current = true;

    // 1. Cache hit — render immediately.
    const cached = loadDailyCache(cacheKey);
    if (cached?.text) {
      setText(cached.text);
      setFeedback(cached.feedback || null);
      return;
    }

    // 2. Not enough data — render empty state, don't call the agent.
    if (!hasEnoughData) {
      setExhausted(true);
      return;
    }

    // 3. Build a digest and call the agent.
    const last7 = (recentCheckins || []).slice(0, 7);
    const checkinLines = last7
      .map((c) => {
        const date = String(c?.date || c?.created_date || "").split("T")[0];
        const mood = c?.mood ?? "—";
        const energy = c?.energy ?? c?.energy_level ?? "—";
        const sleep = c?.sleep_hours ?? c?.sleepHours ?? "—";
        return `${date}: mood=${mood}/5, energy=${energy}/5, sleep=${sleep}h`;
      })
      .join("\n");
    const symLines = (symptoms || [])
      .slice(0, 12)
      .map((s) => {
        const date = String(s?.date || s?.created_date || "").split("T")[0];
        const name = s?.symptom_type || s?.symptom_name || "—";
        const severity = s?.severity ?? "—";
        return `${date}: ${name} (${severity}/5)`;
      })
      .join("\n");

    const system =
      "You are Jess, a UK-based women's wellness companion. The user has shared recent daily check-ins and symptom logs. " +
      "Your only job in this turn: surface ONE useful pattern or observation from the data. " +
      "Output rules: " +
      "(1) one or two sentences only, max 240 characters total; " +
      "(2) warm, observational tone — 'I noticed…', 'You tend to…', 'Your mood lifts when…'; " +
      "(3) be specific — refer to days, counts, or directions if possible; " +
      "(4) never give medical advice and do not name conditions; " +
      "(5) never just restate the numbers — interpret them; " +
      "(6) if data is too thin or too uniform, reply exactly NOT_ENOUGH_DATA and nothing else; " +
      "(7) do not include preambles, sign-offs, or quotation marks.";

    const userPrompt =
      `Current cycle phase: ${phase}.\n\n` +
      `Recent daily check-ins (newest first):\n${checkinLines || "(none)"}\n\n` +
      `Recent symptom logs:\n${symLines || "(none)"}\n\n` +
      `Surface one pattern.`;

    setLoading(true);
    callJessAgent({ system, user: userPrompt })
      .then(({ text: raw }) => {
        setLoading(false);
        if (!raw || /NOT_ENOUGH_DATA/i.test(raw)) {
          setExhausted(true);
          return;
        }
        // QA Fix 1 — the agent sometimes emits a ```options [...] ``` block
        // (chip suggestions intended for the chat surface). It doesn't
        // belong in the JESS NOTICED card. Strip ```options``` blocks,
        // any other fenced code blocks, and surrounding whitespace before
        // rendering.
        const cleaned = String(raw)
          .replace(/```options[\s\S]*?```/gi, "")
          .replace(/```[\s\S]*?```/g, "")
          .trim()
          .replace(/^["']|["']$/g, "");
        if (!cleaned) { setExhausted(true); return; }
        setText(cleaned);
        saveDailyCache(cacheKey, { text: cleaned, feedback: null });
      })
      .catch(() => {
        setLoading(false);
        setExhausted(true);
      });
  }, [cacheKey, hasEnoughData, recentCheckins, symptoms, phase]);

  function tapFeedback(value) {
    const next = feedback === value ? null : value;
    setFeedback(next);
    if (cacheKey) saveDailyCache(cacheKey, { text, feedback: next });
  }

  return (
    <section>
      <p style={{ ...kicker, padding: "0 4px", marginBottom: 10 }}>Jess noticed</p>
      <article style={{
        background: C.paperHi,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${C.gold}`,
        borderRadius: 14, padding: "14px",
        animation: "jess-card-rise 320ms ease-out 80ms backwards",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: C.gold, display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginTop: 1,
          }} aria-hidden>
            <Star size={14} style={{ color: C.espresso }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <p style={{
                margin: 0, fontSize: 13, color: C.muted, fontStyle: "italic",
                lineHeight: 1.55,
              }}>Looking for patterns in your last 7 days…</p>
            ) : text ? (
              <>
                <p style={{
                  margin: 0, fontSize: 13.5, color: C.espresso,
                  lineHeight: 1.55,
                }}>{text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    aria-label="Helpful"
                    aria-pressed={feedback === "up"}
                    onClick={() => tapFeedback("up")}
                    style={feedbackBtnStyle(feedback === "up")}
                  ><ThumbsUp size={14} /></button>
                  <button
                    type="button"
                    aria-label="Not helpful"
                    aria-pressed={feedback === "down"}
                    onClick={() => tapFeedback("down")}
                    style={feedbackBtnStyle(feedback === "down")}
                  ><ThumbsDown size={14} /></button>
                  {feedback && (
                    <span style={{
                      fontSize: 11, color: C.muted, fontStyle: "italic",
                      }}>Thanks — that helps Jess learn.</span>
                  )}
                </div>
              </>
            ) : exhausted && !hasEnoughData ? (
              <p style={{
                margin: 0, fontSize: 13, color: C.espresso,
                lineHeight: 1.55,
              }}>I'll start spotting patterns once you've logged a few days. Try a quick check-in today — even just mood and energy.</p>
            ) : (
              <p style={{
                margin: 0, fontSize: 13, color: C.muted, fontStyle: "italic",
                lineHeight: 1.55,
              }}>Not enough variation yet to spot a clear pattern — keep logging.</p>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}

function feedbackBtnStyle(active) {
  return {
    width: 32, height: 32, borderRadius: 9999,
    background: active ? C.gold : "transparent",
    border: `1px solid ${active ? C.goldDeep : C.border}`,
    color: active ? C.espresso : C.muted,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", padding: 0,
    transition: "background 200ms ease, color 200ms ease, border-color 200ms ease",
  };
}

// ─── Small UI primitives ──────────────────────────────────────────────────
const kicker = {
  margin: "0 0 8px", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, };
const bodyText = {
  fontSize: 13, color: C.mutedText,
  lineHeight: 1.55,
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