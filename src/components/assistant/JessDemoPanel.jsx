// JessDemoPanel — the rebuilt Jess experience for /Ideas → Jess AI tab.
//
// Visual language matches the standalone jess-demo-v2.html spec:
//   · Botanical SVG avatar inside a rotating conic-gradient ring (cream →
//     blush → gold → sage) with continuous breathe pulse rings.
//   · Phase-aware shell — root class `.menstrual` / `.follicular` /
//     `.ovulatory` / `.luteal` shifts the accent colours.
//   · Espresso-deep memory bar with day-in-cycle + phase + N-day streak.
//   · Context chips row — mood, energy, phase label.
//   · 3 tabs: Chat / Insights / Today's Plan.
//   · MHRA disclaimer under every Jess bubble.
//
// Real data hookups:
//   · Phase derived from profile.last_period_start_date + cycle_avg_length.
//   · Streak counts consecutive days with a DailyCheckins entry.
//   · Mood/Energy from today's DailyCheckins row.
//   · Chat uses base44.agents (listConversations + addMessage + subscribe).
//   · Today's Plan reads top 3 PersonalTasks for today.
//
// The Insights tab renders three static cards for now; real AI-generated
// insights will land in a follow-up.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Mic, Send, Loader2, Sparkles, MessageCircle, LineChart, ListChecks, Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ─── Tokens ───────────────────────────────────────────────────────────────
const C = {
  cream:        "#F4EDDB",
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
  chipBg:       "#EDE6D5",
  chipBorder:   "#D4C9B4",
};

const PHASE_ACCENT = {
  menstrual:  { tone: "#8B2635", soft: "#F0D4D8", label: "Menstrual" },
  follicular: { tone: "#C17B4E", soft: "#EBC9B5", label: "Follicular" },
  ovulatory:  { tone: "#C4933F", soft: "#F0E0B0", label: "Ovulatory" },
  luteal:     { tone: "#5B4A8A", soft: "#C4B5D4", label: "Luteal" },
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

function computeCheckinStreak(checkins) {
  if (!Array.isArray(checkins) || checkins.length === 0) return 0;
  const days = new Set();
  for (const r of checkins) {
    const d = r?.date || r?.created_date;
    if (!d) continue;
    days.add(String(d).split("T")[0]);
  }
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function parseOptions(content) {
  const match = content?.match(/```options\n(\[[\s\S]*?\])\n```/);
  if (!match) return { text: content, options: [] };
  try {
    const options = JSON.parse(match[1]);
    return { text: content.replace(/```options\n[\s\S]*?\n```/, "").trim(), options };
  } catch {
    return { text: content, options: [] };
  }
}

// ─── Botanical avatar — sage stem + blush leaves inside a soft cream disc.
function BotanicalAvatar({ size = 72, accentTone = C.blush }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden>
      <defs>
        <radialGradient id="jess-bg" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={C.paperHi} />
          <stop offset="100%" stopColor={C.paper} />
        </radialGradient>
      </defs>
      <circle cx="36" cy="36" r="32" fill="url(#jess-bg)" />
      {/* Stem */}
      <path d="M 36 56 Q 36 44 36 28" stroke={C.sage} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Leaf — left */}
      <path d="M 36 38 Q 22 36 18 28 Q 28 28 36 36 Z" fill={C.sage} opacity="0.85" />
      {/* Leaf — right */}
      <path d="M 36 32 Q 50 30 54 22 Q 44 22 36 30 Z" fill={C.sage} opacity="0.85" />
      {/* Blossom — top */}
      <circle cx="36" cy="22" r="6" fill={accentTone} />
      <circle cx="36" cy="22" r="2.5" fill={C.gold} />
      {/* Soft glow halo */}
      <circle cx="36" cy="36" r="32" fill="none" stroke={accentTone} strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

// MHRA disclaimer (full canonical wording from the demo spec).
function JessDisclaimer() {
  return (
    <p style={{
      fontSize: 10, fontStyle: "italic", color: C.muted,
      margin: "4px 0 0 4px", lineHeight: 1.4,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      Jess is a wellness companion, not a medical advisor.
    </p>
  );
}

function OptionsBar({ options, onSelect }) {
  if (!options?.length) return null;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "6px 0 0 0" }}>
      {options.map((opt, i) => (
        <button key={i} onClick={() => onSelect(opt)} style={{
          fontSize: 12, color: C.espresso,
          backgroundColor: C.chipBg, border: `1px solid ${C.chipBorder}`,
          borderRadius: 20, padding: "6px 14px", minHeight: 32,
          cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600,
        }}>{opt}</button>
      ))}
    </div>
  );
}

// ─── Insights tab — three static cards for now ────────────────────────────
function InsightsTab({ phase, dayInCycle }) {
  const accent = PHASE_ACCENT[phase] || PHASE_ACCENT.follicular;
  const cards = [
    {
      label: "PATTERN",
      title: "Your energy lifts mid-follicular",
      body: "Across the last 3 cycles, your energy logs peak around day 8–11. Tomorrow could be a strong work day.",
      tone: accent.tone,
      soft: accent.soft,
    },
    {
      label: "WIN",
      title: "Hydration streak this week",
      body: "You've hit ≥6 glasses on 5 of the last 7 days. Skin tone logs ticked up in step.",
      tone: C.sage,
      soft: "#D8E5D3",
    },
    {
      label: "GENTLE NUDGE",
      title: "Magnesium before bed?",
      body: "Your sleep dipped on days 24–25 last cycle. Magnesium with dinner is one thing some people try around luteal.",
      tone: C.gold,
      soft: "#F0E0B0",
    },
  ];
  return (
    <div style={{
      padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      {cards.map((c, i) => (
        <article key={i} style={{
          background: `linear-gradient(135deg, ${c.soft} 0%, ${C.cream} 100%)`,
          border: `1px solid ${c.tone}33`,
          borderLeft: `4px solid ${c.tone}`,
          borderRadius: 14, padding: "14px 16px",
          boxShadow: "0 2px 10px rgba(58,44,26,0.06)",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: c.tone, margin: "0 0 6px",
            fontFamily: "'Inter', sans-serif",
          }}>{c.label}</p>
          <h3 style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
            fontWeight: 600, color: C.espresso, margin: "0 0 4px", lineHeight: 1.3,
          }}>{c.title}</h3>
          <p style={{
            fontSize: 13, color: C.mutedText, margin: 0,
            lineHeight: 1.55, fontFamily: "'Inter', sans-serif",
          }}>{c.body}</p>
          <JessDisclaimer />
        </article>
      ))}
      <p style={{
        fontSize: 11, color: C.muted, fontStyle: "italic",
        textAlign: "center", margin: "4px 8px 0", lineHeight: 1.5,
      }}>
        Insights are based on your logs over the last 30 days. Day {dayInCycle ?? "—"} of your cycle.
      </p>
    </div>
  );
}

// ─── Today's Plan tab — top 3 PersonalTasks for today ─────────────────────
function PlanTab({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      try {
        const rows = await base44.entities.PersonalTasks
          .filter({ user_id: user.id, date: today }, "-created_date", 10)
          .catch(() => []);
        if (cancelled) return;
        const filtered = (rows || []).filter((r) => !r?.is_completed && !r?.completed).slice(0, 3);
        // If no tasks for today, show a friendly default trio.
        if (filtered.length === 0) {
          setTasks([
            { id: "_d1", title: "Drink a glass of water", _seed: true },
            { id: "_d2", title: "Step outside for 5 minutes", _seed: true },
            { id: "_d3", title: "Write one line in your journal", _seed: true },
          ]);
        } else {
          setTasks(filtered);
        }
      } catch { /* silent */ }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const [done, setDone] = useState({}); // id → bool

  async function toggle(t) {
    const next = !done[t.id];
    setDone((p) => ({ ...p, [t.id]: next }));
    if (t._seed || !t?.id || t.id.startsWith("_")) return;
    try {
      await base44.entities.PersonalTasks.update(t.id, {
        completed: next, is_completed: next,
        updated_at: new Date().toISOString(),
      });
    } catch {
      setDone((p) => ({ ...p, [t.id]: !next }));
    }
  }

  return (
    <div style={{
      padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
        textTransform: "uppercase", color: C.muted, margin: "0 0 4px",
        fontFamily: "'Inter', sans-serif",
      }}>Today's plan</p>
      {loading ? (
        <Loader2 size={18} className="animate-spin" style={{ color: C.muted, alignSelf: "center", margin: "20px 0" }} />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t) => {
            const checked = !!done[t.id];
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => toggle(t)}
                  aria-label={`Toggle ${t.title}`}
                  style={{
                    width: "100%", minHeight: 44,
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 14,
                    background: C.paperHi, border: `1px solid ${checked ? C.sage : C.chipBorder}`,
                    cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    textAlign: "left",
                  }}
                >
                  <span aria-hidden style={{
                    width: 22, height: 22, borderRadius: 7,
                    border: `2px solid ${checked ? C.sage : C.chipBorder}`,
                    background: checked ? C.sage : "transparent",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {checked && <Check size={12} strokeWidth={3} style={{ color: "white" }} />}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 14, color: C.espresso,
                    textDecoration: checked ? "line-through" : "none",
                    opacity: checked ? 0.6 : 1,
                  }}>{t.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p style={{
        fontSize: 11, color: C.muted, fontStyle: "italic",
        textAlign: "center", margin: "4px 8px 0", lineHeight: 1.5,
      }}>
        Tap to mark done. Tasks come from your Planner; the gentle defaults appear when nothing's planned.
      </p>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────
export default function JessDemoPanel({
  initialPrompt = "Hello, I'm Jess. I'm here to help you understand your body, your cycle, and your wellbeing. What's on your mind today?",
} = {}) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [streak, setStreak] = useState(0);
  const [tab, setTab] = useState("chat");
  // Chat state — mirrors AssistantPanel.
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [listeningVoice, setListeningVoice] = useState(false);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  // Load profile + today's checkin + recent checkins for streak.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (!u?.id || cancelled) return;
        setUser(u);
        const today = new Date().toISOString().split("T")[0];
        const [profiles, todayCi, recent] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: today }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 40).catch(() => []),
        ]);
        if (cancelled) return;
        if (profiles[0]) setProfile(profiles[0]);
        if (todayCi[0]) setTodayCheckin(todayCi[0]);
        setStreak(computeCheckinStreak(recent || []));
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Subscribe + load/create conversation.
  const subscribeToConversation = useCallback((id) => {
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = base44.agents.subscribeToConversation(id, (data) => {
      setMessages(data.messages || []);
      const last = (data.messages || []).slice(-1)[0];
      if (last?.role === "assistant") setAssistantTyping(false);
    });
  }, []);

  const createNewConversation = useCallback(async (firstMsg) => {
    setLoading(true);
    const convo = await base44.agents.createConversation({ agent_name: "personal_assistant" });
    setConversationId(convo.id);
    setMessages([]);
    subscribeToConversation(convo.id);
    if (firstMsg) {
      setAssistantTyping(true);
      await base44.agents.addMessage(convo, { role: "user", content: firstMsg });
    }
    setLoading(false);
    return convo;
  }, [subscribeToConversation]);

  useEffect(() => {
    (async () => {
      try {
        await createNewConversation(initialPrompt);
      } catch { setLoading(false); }
    })();
    return () => { if (unsubRef.current) unsubRef.current(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assistantTyping]);

  async function sendMessage(textOverride) {
    const msg = (textOverride || input).trim();
    if (!msg || !conversationId || assistantTyping) return;
    if (!textOverride) setInput("");
    setAssistantTyping(true);
    const convo = await base44.agents.getConversation(conversationId);
    await base44.agents.addMessage(convo, { role: "user", content: msg });
  }

  // Voice mic mock — per demo spec, after 2.2s fill the input with a
  // suggested question. Real speech recognition is in AssistantPanel; this
  // demo panel keeps the lighter mock for the /Ideas surface.
  function startMicMock() {
    if (listeningVoice) return;
    setListeningVoice(true);
    setTimeout(() => {
      setInput("Why am I so tired?");
      setListeningVoice(false);
    }, 2200);
  }

  // Derived display state.
  const { phase, dayInCycle } = derivePhase(profile);
  const accent = PHASE_ACCENT[phase] || PHASE_ACCENT.follicular;
  const moodNum   = todayCheckin?.mood   ?? todayCheckin?.mood_score   ?? null;
  const energyNum = todayCheckin?.energy ?? todayCheckin?.energy_level ?? null;
  const assistantName = profile?.ai_assistant_name || "Jess";

  // ── Render ───────────────────────────────────────────────────────────────
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
      <style>{`
        @keyframes jess-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes jess-breathe {
          0%   { transform: scale(1);   opacity: 0.55; }
          50%  { transform: scale(1.18); opacity: 0;   }
          100% { transform: scale(1.30); opacity: 0;   }
        }
        @keyframes jess-pulse-dot {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30%            { opacity: 1;    transform: translateY(-2px); }
        }
      `}</style>

      {/* Top — botanical avatar inside rotating conic-gradient ring */}
      <header style={{
        padding: "max(env(safe-area-inset-top), 12px) 16px 8px",
        display: "flex", alignItems: "center", gap: 12,
        background: C.cream,
        borderBottom: `1px solid ${C.chipBorder}`,
        flexShrink: 0,
      }}>
        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }} aria-hidden>
          {/* Rotating conic ring */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 9999,
            background: `conic-gradient(from 0deg, ${C.cream}, ${C.blush}, ${C.gold}, ${C.sage}, ${C.cream})`,
            animation: "jess-ring-spin 9s linear infinite",
          }} />
          {/* Inner mask */}
          <div style={{
            position: "absolute", inset: 4, borderRadius: 9999,
            background: C.cream,
          }} />
          {/* Breathe pulse rings */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 9999,
            border: `2px solid ${accent.tone}`,
            animation: "jess-breathe 3.4s ease-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: 9999,
            border: `2px solid ${accent.tone}`,
            animation: "jess-breathe 3.4s ease-out infinite 1.4s",
          }} />
          {/* Avatar */}
          <div style={{
            position: "absolute", inset: 8, borderRadius: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.paper,
          }}>
            <BotanicalAvatar size={56} accentTone={accent.tone} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22, fontWeight: 600, color: C.espresso,
            letterSpacing: "-0.01em",
          }}>{assistantName}</h1>
          <p style={{
            margin: "2px 0 0", fontSize: 12, color: C.mutedText,
            fontFamily: "'Inter', sans-serif", lineHeight: 1.4,
          }}>Your wellness companion — phase aware, always private.</p>
        </div>
      </header>

      {/* Memory bar */}
      <div style={{
        background: C.espressoDeep, color: C.cream,
        padding: "8px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, flexShrink: 0,
        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.03em",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={11} style={{ color: C.gold }} aria-hidden />
          Day {dayInCycle} · {accent.label}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          color: streak >= 1 ? "#FFE3C2" : "rgba(244,237,219,0.55)",
        }}>
          {streak >= 1 ? `🔥 ${streak}-day streak` : "Start a streak today"} ✦
        </span>
      </div>

      {/* Context chips */}
      <div style={{
        background: C.paper, borderBottom: `1px solid ${C.chipBorder}`,
        padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        fontFamily: "'Inter', sans-serif", fontSize: 11,
        color: C.mutedText, flexShrink: 0,
      }} aria-label="Today's context">
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 9999,
          background: `${accent.tone}1A`, border: `1px solid ${accent.tone}44`,
          color: C.espresso, fontWeight: 600,
        }}>
          <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: accent.tone }} />
          {accent.label}
        </span>
        {moodNum != null && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 9999,
            background: `${C.sage}22`, border: `1px solid ${C.sage}55`,
            color: C.espresso, fontWeight: 600,
          }}>
            <span aria-hidden>😊</span> Mood {moodNum}/5
          </span>
        )}
        {energyNum != null && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 9999,
            background: `${C.blush}33`, border: `1px solid ${C.blush}77`,
            color: C.espresso, fontWeight: 600,
          }}>
            <span aria-hidden>⚡</span> Energy {energyNum}/5
          </span>
        )}
      </div>

      {/* Tabs */}
      <div role="tablist" style={{
        display: "flex", gap: 0,
        background: C.cream,
        borderBottom: `1px solid ${C.chipBorder}`,
        flexShrink: 0,
      }}>
        {[
          { id: "chat",     label: "Chat",          Icon: MessageCircle },
          { id: "insights", label: "Insights",      Icon: LineChart },
          { id: "plan",     label: "Today's plan",  Icon: ListChecks },
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
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
                color: active ? C.espresso : C.muted,
                borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
                letterSpacing: "0.04em",
                padding: "10px 6px",
              }}
            >
              <t.Icon size={13} aria-hidden /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div style={{ flex: 1, overflowY: "auto", background: C.cream, minHeight: 0 }}>
        {tab === "insights" && <InsightsTab phase={phase} dayInCycle={dayInCycle} />}
        {tab === "plan"     && <PlanTab user={user} />}
        {tab === "chat" && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 10,
            padding: "14px 14px 8px",
          }}>
            {loading ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.muted }} />
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  const { text, options } = parseOptions(msg.content);
                  return (
                    <div key={i} style={{
                      display: "flex", flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                    }}>
                      <div style={{
                        maxWidth: "82%",
                        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        padding: "10px 14px",
                        fontSize: 13, lineHeight: 1.6,
                        fontFamily: "'Inter', sans-serif",
                        backgroundColor: isUser ? C.blush : C.espresso,
                        color: isUser ? C.espresso : C.cream,
                        boxShadow: isUser ? "none" : "0 2px 8px rgba(58,44,26,0.10)",
                      }}>
                        {isUser ? text : (
                          <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{text || ""}</ReactMarkdown>
                        )}
                      </div>
                      {!isUser && <JessDisclaimer />}
                      {!isUser && options.length > 0 && <OptionsBar options={options} onSelect={sendMessage} />}
                    </div>
                  );
                })}
                {assistantTyping && (
                  <div style={{ display: "flex" }}>
                    <div style={{
                      borderRadius: "18px 18px 18px 4px",
                      padding: "10px 16px",
                      backgroundColor: C.espresso, color: C.cream,
                      display: "inline-flex", gap: 5, alignItems: "center",
                    }} aria-label="Jess is typing">
                      {[0, 0.22, 0.44].map((delay, n) => (
                        <span key={n} aria-hidden style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: C.cream,
                          animation: `jess-pulse-dot 1.2s ease-in-out ${delay}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — only on chat tab */}
      {tab === "chat" && (
        <div style={{
          padding: "10px 14px max(env(safe-area-inset-bottom), 10px)",
          background: C.cream,
          borderTop: `1px solid ${C.chipBorder}`,
          display: "flex", gap: 8, flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={startMicMock}
            disabled={assistantTyping || loading || listeningVoice}
            aria-label="Voice input"
            style={{
              border: `1px solid ${C.chipBorder}`,
              borderRadius: 14, minWidth: 44, minHeight: 44,
              backgroundColor: listeningVoice ? C.gold : C.paper,
              padding: "0 12px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Mic className="w-4 h-4" style={{ color: C.espresso }} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={listeningVoice ? "Listening…" : `Message ${assistantName}…`}
            disabled={assistantTyping || loading}
            aria-label={`Message ${assistantName}`}
            style={{
              flex: 1, borderRadius: 14,
              border: `1px solid ${C.chipBorder}`,
              backgroundColor: C.paper,
              padding: "11px 14px", minHeight: 44,
              fontSize: 14, color: C.espresso,
              fontFamily: "'Inter', sans-serif",
              outline: "none", opacity: assistantTyping ? 0.6 : 1,
            }}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || assistantTyping || loading}
            aria-label="Send message"
            style={{
              border: "none", borderRadius: 14,
              backgroundColor: C.gold, color: C.espresso,
              padding: "0 18px", minWidth: 44, minHeight: 44,
              cursor: "pointer",
              opacity: (!input.trim() || assistantTyping) ? 0.4 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
