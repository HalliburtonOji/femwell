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
  Mic, Send, Settings, Check, ChevronRight, ChevronDown,
  MessageCircle, Sun, LineChart, Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import JessSettingsSheet from "./JessSettingsSheet";

// ─── Tokens ───────────────────────────────────────────────────────────────
const C = {
  cream:        "#F4EDDB",
  creamDark:    "#EDE6D5",
  paper:        "#FBF6E6",
  paperHi:      "#FFFFFF",
  espresso:     "#3A2C1A",
  espressoDeep: "#2A1E0E",
  blush:        "#E8B4B8",
  sage:         "#8FAF8F",
  muted:        "#9B8B7A",
  mutedText:    "#6B5B4E",
  gold:         "#D4AF37",
  goldDeep:     "#A6862B",
  border:       "#D4C9B4",
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
function MhraNote({ style = {} }) {
  return (
    <p style={{
      fontSize: 10, color: C.muted, fontStyle: "italic",
      margin: "4px 0 0 4px", lineHeight: 1.4,
      fontFamily: "'Inter', system-ui, sans-serif",
      ...style,
    }}>Wellness companion · not medical advice</p>
  );
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
  // History UI state.
  const [conversationsList, setConversationsList] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewingHistoricalId, setViewingHistoricalId] = useState(null);
  // Snapshot of the active conversation so we can return from a history view.
  const liveMessagesRef = useRef(null);
  // Track whether the context block has been sent for this convo so we only
  // inject it once per conversation.
  const contextInjectedRef = useRef(new Set());
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
  useEffect(() => {
    if (followUpFired) return;
    if (!profile && recentCheckins.length === 0) return; // wait for first data tick
    const t = setTimeout(() => {
      setFollowUpFired(true);
      const lastEnergy = energySpark[energySpark.length - 1];
      const trend = lastEnergy > energySpark[0] ? "trending up" : "trending down";
      const observation = `your energy is ${trend} this week`;
      const opener = `Morning, ${firstName}. Day ${dayInCycle} today — you're in your ${shell.label.toLowerCase()} phase. I noticed ${observation}. What's on your mind?`;
      setMessages([
        {
          id: uid(),
          role: "jess",
          type: "bubble",
          text: opener,
          chips: ["Tell me more", "What should I do?", "What's ahead?"],
        },
      ]);
    }, 1400);
    return () => clearTimeout(t);
  }, [profile?.id, recentCheckins.length, energySpark, dayInCycle, firstName, shell.label, followUpFired]);

  // Memoised proactive chips — drive Chat tab + tab-level shortcuts.
  const proactiveChips = useMemo(
    () => buildProactiveChips({ todayCheckin, recentCheckins, symptoms, lastJournal, phase, dayInCycle }),
    [todayCheckin, recentCheckins, symptoms, lastJournal, phase, dayInCycle],
  );

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
        })),
      ]);
      setAssistantTyping(false);
    });
  }, []);

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
    setViewingHistoricalId(null);
    setHistoryOpen(false);
    setMessages([]);
    setFollowUpFired(false); // re-fire opener
  }, []);

  // ── Load a past conversation into read-only view ───────────────────────
  const loadHistoricalConversation = useCallback(async (id) => {
    if (!id) return;
    // Snapshot the current live thread so we can come back to it.
    liveMessagesRef.current = messages;
    setViewingHistoricalId(id);
    setHistoryOpen(false);
    try {
      const c = await base44.agents.getConversation(id);
      const list = Array.isArray(c?.messages) ? c.messages : [];
      // Hide our context-block message (first user message that starts with
      // "[JESS CONTEXT") and replay everything else into our local shape.
      const view = list
        .filter((m) => !(m?.role === "user" && String(m?.content || "").startsWith("[JESS CONTEXT")))
        .map((m) => ({
          id: m.id || uid(),
          role: m.role === "assistant" ? "jess" : "user",
          type: "bubble",
          text: m.content || "",
          historical: true,
        }));
      setMessages(view);
    } catch {
      setMessages([{ id: uid(), role: "jess", type: "bubble", text: "Couldn't load that conversation.", historical: true }]);
    }
  }, [messages]);

  const returnFromHistorical = useCallback(() => {
    setViewingHistoricalId(null);
    if (liveMessagesRef.current) setMessages(liveMessagesRef.current);
    liveMessagesRef.current = null;
  }, []);

  // Send a free-text message — extracted so chip taps can reuse it.
  const sendUserText = useCallback(async (text) => {
    const msg = String(text || "").trim();
    if (!msg || assistantTyping) return;
    setMessages((prev) => [...prev, { id: uid(), role: "user", type: "bubble", text: msg }]);
    setAssistantTyping(true);
    try {
      const cid = await ensureConversation();
      if (!cid) throw new Error("no convo");
      const convo = await base44.agents.getConversation(cid);
      await base44.agents.addMessage(convo, { role: "user", content: msg });
    } catch {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: uid(), role: "jess", type: "bubble",
          text: "I hear you. I'm still learning the live wiring on this surface — try one of the chips above for a tailored response.",
        }]);
        setAssistantTyping(false);
      }, 1200);
    }
  }, [assistantTyping, ensureConversation]);

  // Tap a proactive chip → send the question as the user's message.
  const handleProactiveChip = useCallback((label) => {
    setTab("chat");
    setViewingHistoricalId(null);
    if (liveMessagesRef.current) {
      // If currently viewing a historical thread, return to live first.
      setMessages(liveMessagesRef.current);
      liveMessagesRef.current = null;
    }
    sendUserText(label);
  }, [sendUserText]);

  // ── Scripted response generators ───────────────────────────────────────
  function jessInsightCard() {
    return {
      id: uid(), role: "jess", type: "insight-card",
      title: "7-day energy",
      sparkline: energySpark,
      statValue: Math.round(energySpark.reduce((a, b) => a + b, 0) / energySpark.length * 10) / 10,
      statLabel: "avg energy",
      readout: `Your energy is ${energySpark[6] > energySpark[0] ? "lifting" : "easing"} across the week. ${phase === "follicular" ? "Right on schedule for your phase." : ""}`,
    };
  }
  function jessQuickLogChips() {
    return {
      id: uid(), role: "jess", type: "quick-log-chips",
      lead: "Quick win options for today:",
      chips: ["Move 10 min", "Big glass of water", "Step outside", "Magnesium tonight"],
    };
  }
  function jessPhaseCard() {
    const next = phase === "menstrual" ? "follicular"
              : phase === "follicular" ? "ovulatory"
              : phase === "ovulatory" ? "luteal"
              : "menstrual";
    const nextCopy = PHASE_COPY[next];
    return {
      id: uid(), role: "jess", type: "phase-card",
      phaseName: shell.label,
      headerTint: shell.headerTint,
      accent: shell.accent,
      body: phaseCopy.blurb,
      nextLabel: PHASE_SHELL[next].label,
      tips: nextCopy.forYou.slice(0, 2),
    };
  }
  function jessMemoryLine() {
    const lines = [
      "✦ Jess remembers — you've been logging consistently for 3 days in a row.",
      `✦ Jess remembers — you tend to feel sharpest around day ${Math.max(1, dayInCycle - 2)}–${dayInCycle + 1}.`,
      "✦ Jess remembers — your last journal entry said you wanted gentler weeks.",
    ];
    return {
      id: uid(), role: "jess", type: "memory-line",
      text: lines[Math.floor(Math.random() * lines.length)],
    };
  }

  // ── Send a message ─────────────────────────────────────────────────────
  async function handleChip(chipLabel, fromMessageId) {
    // Append user-side bubble first.
    setMessages((prev) => {
      const next = prev.map((m) => m.id === fromMessageId ? { ...m, chipsUsed: true } : m);
      return [...next, { id: uid(), role: "user", type: "bubble", text: chipLabel }];
    });
    setAssistantTyping(true);
    setTimeout(() => {
      let response;
      if (chipLabel === "Tell me more")      response = jessInsightCard();
      else if (chipLabel === "What should I do?") response = jessQuickLogChips();
      else if (chipLabel === "What's ahead?") response = jessPhaseCard();
      else response = { id: uid(), role: "jess", type: "bubble", text: "Tell me more about that." };
      setMessages((prev) => [...prev, response]);
      setAssistantTyping(false);
      // Follow-up unprompted memory line, 1.6s later.
      setTimeout(() => {
        setMessages((prev) => [...prev, jessMemoryLine()]);
      }, 1600);
    }, 1400 + Math.random() * 600);
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
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 9999,
            background: C.paperHi, border: `1px solid ${shell.accent}55`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            animation: "jess-breathe 4s ease-in-out infinite",
          }}
          aria-hidden
        >
          <BotanicalSigil size={28} stroke={shell.tone} />
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
            conversationsList={conversationsList}
            historyOpen={historyOpen}
            onToggleHistory={() => setHistoryOpen((v) => !v)}
            onLoadHistorical={loadHistoricalConversation}
            viewingHistoricalId={viewingHistoricalId}
            onReturnFromHistorical={returnFromHistorical}
          />
        )}
        {tab === "brief"    && (
          <BriefTab phase={phase} dayInCycle={dayInCycle} shell={shell} tasks={tasks} energySpark={energySpark}
            tabChip="Jess, summarise my week" onTabChip={handleProactiveChip} />
        )}
        {tab === "insights" && (
          <InsightsTab phase={phase} dayInCycle={dayInCycle} shell={shell} energySpark={energySpark} symptoms={symptoms}
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
            aria-label="Voice input"
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 14, minWidth: 44, minHeight: 44,
              backgroundColor: listeningVoice ? C.gold : C.paper,
              padding: "0 12px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
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
    `}</style>
  );
}

// ─── Chat tab ─────────────────────────────────────────────────────────────
function ChatTab({
  messages, assistantTyping, shell, onChip, onToggleQuickLog, bottomRef,
  proactiveChips, onProactiveChip,
  conversationsList, historyOpen, onToggleHistory, onLoadHistorical,
  viewingHistoricalId, onReturnFromHistorical,
}) {
  return (
    <div style={{
      padding: "14px 14px 8px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {/* Proactive question chips — "Jess is thinking about you" row */}
      {Array.isArray(proactiveChips) && proactiveChips.length > 0 && !viewingHistoricalId && (
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

      {/* Viewing a historical thread banner */}
      {viewingHistoricalId && (
        <div style={{
          background: C.creamDark, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "10px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <span style={{ fontSize: 12, color: C.mutedText, fontFamily: "'Inter', sans-serif" }}>
            Viewing a past conversation
          </span>
          <button
            type="button"
            onClick={onReturnFromHistorical}
            style={{
              background: C.espresso, color: C.cream, border: "none",
              borderRadius: 9999, padding: "6px 12px", minHeight: 32,
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}
          >Return to current</button>
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

      {/* Conversation history — collapsed by default */}
      {!viewingHistoricalId && (
        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            onClick={onToggleHistory}
            aria-expanded={historyOpen}
            style={{
              width: "100%",
              display: "inline-flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 12px", borderRadius: 10,
              background: "transparent", border: `1px solid ${C.border}`,
              color: C.espresso, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12, fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            <span>Past conversations</span>
            <span aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </button>
          {historyOpen && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {(!conversationsList || conversationsList.length === 0) ? (
                <p style={{
                  margin: 0, padding: "10px 12px",
                  fontSize: 12, fontStyle: "italic", color: C.mutedText,
                  fontFamily: "'Inter', sans-serif",
                }}>No past conversations yet — they'll appear here once you've chatted with Jess.</p>
              ) : (
                conversationsList.slice(0, 5).map((c) => {
                  const id = c?.id || c?.conversation_id;
                  const created = c?.created_at || c?.created_date || c?.updated_at;
                  const when = created ? formatHistoryDate(created) : "Past";
                  // Find first non-context user message for the snippet.
                  const msgs = Array.isArray(c?.messages) ? c.messages : [];
                  const firstReal = msgs.find((m) =>
                    m?.role === "user" && !String(m?.content || "").startsWith("[JESS CONTEXT")
                  ) || msgs.find((m) => m?.role === "assistant");
                  const snippet = String(firstReal?.content || "")
                    .replace(/\s+/g, " ").slice(0, 60);
                  return (
                    <button
                      key={id || when + snippet}
                      type="button"
                      onClick={() => id && onLoadHistorical(id)}
                      style={{
                        textAlign: "left",
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 10,
                        background: C.cream, border: "none",
                        borderLeft: `2px solid ${C.espresso}`,
                        cursor: "pointer", color: C.espresso,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: 11, color: C.mutedText, fontWeight: 700,
                          letterSpacing: "0.04em",
                        }}>{when}</p>
                        <p style={{
                          margin: "2px 0 0", fontSize: 13, color: C.espresso, fontWeight: 500,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          lineHeight: 1.4,
                        }}>{snippet || "(no preview)"}</p>
                      </div>
                      <ChevronRight size={14} aria-hidden style={{ color: C.muted, flexShrink: 0 }} />
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatHistoryDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  } catch { return "Past"; }
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
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{
          maxWidth: "82%",
          borderRadius: "18px 18px 4px 18px",
          padding: "10px 14px",
          fontSize: 14, lineHeight: 1.6,
          fontFamily: "'Inter', sans-serif",
          background: C.blush, color: C.espresso,
          animation: "jess-bubble-enter 280ms ease-out",
        }}>{msg.text}</div>
      </div>
    );
  }
  // Jess sides
  if (msg.type === "insight-card") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <article style={{
          maxWidth: "92%", width: "100%",
          background: C.paperHi,
          border: `1px solid ${C.border}`,
          borderTop: `3px solid ${C.gold}`,
          borderRadius: 14, padding: "14px 14px 12px",
          boxShadow: "0 2px 10px rgba(58,44,26,0.08)",
          animation: "jess-bubble-enter 280ms ease-out",
        }}>
          <p style={{
            margin: "0 0 8px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, fontFamily: "'Inter', sans-serif",
          }}>{msg.title || "Insight"}</p>
          <Sparkline data={msg.sparkline} width={280} height={56} stroke={C.sage} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0 4px" }}>
            <span style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 600,
              color: C.espresso, lineHeight: 1,
            }}>{msg.statValue}</span>
            <span style={{ fontSize: 11, color: C.mutedText }}>{msg.statLabel}</span>
          </div>
          <p style={{
            margin: 0, fontSize: 13, color: C.mutedText,
            lineHeight: 1.5, fontFamily: "'Inter', sans-serif",
          }}>{msg.readout}</p>
        </article>
        <MhraNote />
      </div>
    );
  }
  if (msg.type === "quick-log-chips") {
    const selected = msg.selectedChips || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{
          maxWidth: "92%", width: "100%",
          background: C.paperHi,
          border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "12px 14px",
          animation: "jess-bubble-enter 280ms ease-out",
        }}>
          <p style={{
            margin: "0 0 10px", fontSize: 13,
            color: C.espresso, fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
          }}>{msg.lead}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {msg.chips.map((label) => {
              const on = selected.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onToggleQuickLog(msg.id, label)}
                  aria-pressed={on}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "8px 14px", minHeight: 36, borderRadius: 9999,
                    background: on ? C.gold : C.paper,
                    border: on ? `1px solid ${C.goldDeep}` : `1px solid ${C.border}`,
                    color: C.espresso,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {on && <Check size={11} aria-hidden />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <MhraNote />
      </div>
    );
  }
  if (msg.type === "phase-card") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <article style={{
          maxWidth: "92%", width: "100%",
          background: msg.headerTint,
          border: `1px solid ${msg.accent}55`,
          borderRadius: 14, padding: "14px",
          animation: "jess-bubble-enter 280ms ease-out",
        }}>
          <p style={{
            margin: 0, fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22, fontWeight: 600, color: C.espresso, letterSpacing: "-0.01em",
          }}>{msg.phaseName}</p>
          <p style={{
            margin: "4px 0 10px", fontSize: 13, color: C.mutedText,
            fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
          }}>{msg.body}</p>
          <p style={{
            margin: "0 0 6px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, fontFamily: "'Inter', sans-serif",
          }}>Next: {msg.nextLabel}</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {msg.tips.map((tip, i) => (
              <li key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 6,
                fontSize: 13, color: C.espresso, fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
              }}>
                <span aria-hidden style={{ width: 5, height: 5, borderRadius: 9999, background: msg.accent, marginTop: 7, flexShrink: 0 }} />
                {tip}
              </li>
            ))}
          </ul>
        </article>
        <MhraNote />
      </div>
    );
  }
  if (msg.type === "memory-line") {
    return (
      <p style={{
        margin: "2px 4px",
        fontSize: 12, fontStyle: "italic",
        color: C.mutedText, fontFamily: "'Inter', sans-serif",
        animation: "jess-bubble-enter 280ms ease-out",
      }}>{msg.text}</p>
    );
  }
  // Default: jess-bubble
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{
        maxWidth: "82%",
        borderRadius: "14px 14px 14px 4px",
        padding: "10px 14px",
        fontSize: 14, lineHeight: 1.6,
        fontFamily: "'Inter', sans-serif",
        background: C.paperHi, color: C.espresso,
        borderLeft: `3px solid ${C.gold}`,
        boxShadow: "0 1px 4px rgba(58,44,26,0.06)",
        animation: "jess-bubble-enter 280ms ease-out",
      }}>
        <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {msg.text || ""}
        </ReactMarkdown>
      </div>
      <MhraNote />
      {Array.isArray(msg.chips) && msg.chips.length > 0 && !msg.chipsUsed && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {msg.chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChip(c, msg.id)}
              style={{
                padding: "8px 14px", minHeight: 36, borderRadius: 9999,
                background: C.creamDark, border: `1px solid ${C.border}`,
                color: C.espresso, fontFamily: "'Inter', sans-serif",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: "14px 14px 14px 4px",
        background: C.paperHi, border: `1px solid ${C.border}`,
        animation: "jess-bubble-enter 280ms ease-out",
      }} aria-label="Jess is typing">
        {[0, 0.22, 0.44].map((delay, i) => (
          <span key={i} aria-hidden style={{
            fontSize: 14, color: C.gold,
            animation: `jess-pulse-dot 900ms ease-in-out ${delay}s infinite`,
          }}>✦</span>
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

// ─── Insights tab ─────────────────────────────────────────────────────────
function InsightsTab({ phase, dayInCycle, shell, energySpark, symptoms, tabChip, onTabChip }) {
  const symptomCount = {};
  for (const s of symptoms || []) {
    const k = (s?.symptom_type || s?.symptom_name || "").toString().trim();
    if (!k) continue;
    symptomCount[k] = (symptomCount[k] || 0) + 1;
  }
  const topSymptoms = Object.entries(symptomCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return (
    <div style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
      <TabChip chip={tabChip} onTap={onTabChip} />
      <Card animationDelay={0}>
        <p style={kicker}>Cycle pattern</p>
        <Sparkline data={energySpark} width={300} height={56} stroke={shell.tone} fill={`${shell.tone}22`} />
        <p style={{ margin: "8px 0 0", ...bodyText }}>
          Your energy peaks around days 9–14 every cycle. Your lowest point is consistently day 24–26.
        </p>
        <DigDeeperRow />
      </Card>
      <Card animationDelay={80}>
        <p style={kicker}>Mood map · 7 days</p>
        <div style={{ display: "flex", gap: 6, padding: "8px 0 6px" }}>
          {energySpark.map((v, i) => {
            const tones = [PHASE_SHELL.menstrual.accent, PHASE_SHELL.follicular.accent, PHASE_SHELL.ovulatory.accent, PHASE_SHELL.luteal.accent];
            const tone = tones[i % tones.length];
            return (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <span aria-hidden style={{
                  width: 12, height: 12, borderRadius: 9999, background: tone,
                  opacity: 0.55 + (v / 5) * 0.45,
                }} />
                <span style={{ fontSize: 9, color: C.mutedText, fontFamily: "'Inter', sans-serif" }}>
                  {["S", "M", "T", "W", "T", "F", "S"][i]}
                </span>
              </div>
            );
          })}
        </div>
        <p style={{ margin: "4px 0 0", ...bodyText }}>
          Trend is gently up. Days that follow journaling tend to score higher.
        </p>
        <DigDeeperRow />
      </Card>
      <Card animationDelay={160}>
        <p style={kicker}>Sleep rhythm · last 14 days</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "2px 0 6px" }}>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 600,
            color: C.espresso, lineHeight: 1,
          }}>7.4h</span>
          <span style={{ fontSize: 11, color: C.mutedText }}>avg sleep intention</span>
        </div>
        <p style={{ margin: 0, ...bodyText }}>
          Sleep tends to dip 1–2 days before your period. Magnesium and earlier bedtimes from day 22 help.
        </p>
        <DigDeeperRow />
      </Card>
      <Card animationDelay={240}>
        <p style={kicker}>Body signals · this cycle</p>
        {topSymptoms.length === 0 ? (
          <p style={{ margin: 0, ...bodyText, fontStyle: "italic" }}>
            Jess hasn't seen consistent symptom patterns yet. Keep logging and patterns will surface.
          </p>
        ) : (
          <>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {topSymptoms.map(([name, count]) => (
                <li key={name} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 10,
                  background: C.paper, border: `1px solid ${C.border}`,
                  fontSize: 13, color: C.espresso, fontFamily: "'Inter', sans-serif",
                }}>
                  <span>{name}</span>
                  <span style={{ color: C.mutedText, fontSize: 11 }}>×{count}</span>
                </li>
              ))}
            </ul>
            <p style={{ margin: "8px 0 0", ...bodyText }}>
              Jess noticed: <strong style={{ color: C.espresso }}>{topSymptoms[0][0]}</strong> shows up most. Worth flagging if it pairs with a phase.
            </p>
          </>
        )}
        <DigDeeperRow />
        <MhraNote />
      </Card>
    </div>
  );
}

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
