// JessHubDemo — Jess's central command centre demo for the Ideas lab.
//
// Frames Jess as a stand-alone surface: 4 tabs (Chat / Insights /
// Today's Plan / For You), left slide-out conversation history, a
// settings sheet (rename + character preset + proactivity), and
// proactive suggestion chips on the Chat tab.
//
// Purely presentational — runs entirely on local state, no entity
// queries, no agent calls. It's a demo of the *system shape*; the
// production Jess experience lives in JessDemoPanel.

import { useState } from "react";
import {
  History, X, Plus, Settings, MessageCircle, LineChart,
  Sun, Sparkles, ChevronRight, Mic, Send, Check,
} from "lucide-react";

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

// 4-petal sigil — same gold-on-cream identity as production Jess.
function Sigil({ size = 36, stroke = C.gold }) {
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

// Conic gradient ring around the sigil — distinguishes Hub from Home Base.
function AvatarRing({ children, size = 64 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 9999,
        background: `conic-gradient(from 180deg at 50% 50%, ${C.gold}, ${C.blush}, ${C.sage}, ${C.gold})`,
        padding: 2,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <div style={{
        width: "100%", height: "100%", borderRadius: 9999,
        background: C.paperHi,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>{children}</div>
    </div>
  );
}

const TABS = [
  { id: "chat",     label: "Chat",          Icon: MessageCircle },
  { id: "insights", label: "Insights",      Icon: LineChart },
  { id: "plan",     label: "Today's Plan",  Icon: Sun },
  { id: "foryou",   label: "For You",       Icon: Sparkles },
];

const PROACTIVE_CHIPS = [
  "How are you feeling today?",
  "Day 12 — your peak window opens",
  "Sleep tip for tonight",
];

const CHARACTERS = [
  { id: "nurturing", emoji: "✿", label: "Nurturing", desc: "Warm, holds space" },
  { id: "coach",     emoji: "✦", label: "Coach",     desc: "Direct, action-led" },
  { id: "clinical",  emoji: "◆", label: "Clinical",  desc: "Calm, evidence-led" },
  { id: "friend",    emoji: "✧", label: "Friend",    desc: "Casual, light touch" },
];

const SEED_CONVOS = [
  { id: "c1", name: "Mood Check-in",   when: "Today · 9:14am",      preview: "I noticed your energy was low yesterday…" },
  { id: "c2", name: "Sleep Patterns",  when: "Yesterday · 10:42pm", preview: "Three nights in a row — let's look at it." },
  { id: "c3", name: "Luteal Support",  when: "Mon · 4:08pm",        preview: "You're on day 24 — soft scaffolding helps." },
  { id: "c4", name: "Morning Chat · 18 May", when: "Sat · 7:02am",  preview: "Hello — how did you sleep?" },
];

const SEED_MESSAGES = [
  { from: "jess", text: "Hello, Halli. I can see you're on day 12 of your follicular phase — your energy is starting to build. How are you feeling?", time: "9:03am" },
  { from: "user", text: "Actually a bit tired despite the phase. Why?", time: "9:04am" },
  { from: "jess", text: "Three things converge in your follicular phase to affect energy:\n\n1️⃣ Progesterone is still at baseline, so the lift comes from estrogen — and estrogen rises slowly until day 11.\n\n2️⃣ Sleep is the lever. Two short nights this week show up in today's reading.\n\n3️⃣ Your nervous system is catching up from last week's heavy admin.\n\nEnergy typically lifts further around day 13. Want me to draft a softer plan for today?", time: "9:04am" },
];

const TODAY_PLAN = [
  { time: "8:30", item: "Morning walk · 15 min",          tone: "sage"     },
  { time: "10:00",item: "Deep-work block · the proposal", tone: "espresso" },
  { time: "12:30",item: "Lunch + iron-rich plate",        tone: "blush"    },
  { time: "15:00",item: "Stretch · hip openers",          tone: "sage"     },
  { time: "20:00",item: "Magnesium · early wind-down",    tone: "espresso" },
];

const INSIGHTS = [
  { kicker: "PATTERN", title: "Energy peaks on follicular day 11–13",  body: "You've shown a 4-cycle pattern of strongest energy in this exact window." },
  { kicker: "MOOD",    title: "Sleep dipped 3 nights running",          body: "Average 5.8h for the last 3 — below your 7.1h follicular norm." },
  { kicker: "BODY",    title: "Headaches cluster in late luteal",       body: "Last cycle days 24–26 — Jess flagged the pattern early." },
];

const FOR_YOU = [
  { tag: "THIS PHASE",   title: "Strength training lands best this week", body: "Days 11–13 are when your body responds strongest to resistance work." },
  { tag: "NUDGE",        title: "Pick the bold message tomorrow",         body: "Your peak window opens. Communication, asks, leading the meeting." },
  { tag: "READING",      title: "The Programs library has 2 new entries", body: "Both are about hormones + sleep — phase-tagged to today." },
];

export default function JessHubDemo() {
  const [tab, setTab] = useState("chat");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeConvo, setActiveConvo] = useState("c1");
  const [name, setName] = useState("Jess");
  const [character, setCharacter] = useState("nurturing");
  const [proactivity, setProactivity] = useState(true);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [usedChips, setUsedChips] = useState([]);

  function handleChip(label) {
    if (usedChips.includes(label)) return;
    setUsedChips((p) => [...p, label]);
    setMessages((p) => [
      ...p,
      { from: "user", text: label, time: "9:05am" },
      { from: "jess", text: "Good question. Let me hold that for a moment — your data says you tend to ask this around the same point in your cycle. Here's what's worth noticing right now…", time: "9:05am" },
    ]);
  }

  return (
    <div style={{
      position: "relative",
      width: "100%", maxWidth: 430, margin: "0 auto",
      height: "min(82vh, 820px)",
      background: C.cream,
      borderRadius: 18, overflow: "hidden",
      display: "flex", flexDirection: "column",
      border: `1px solid ${C.border}`,
      fontFamily: "'Inter', system-ui, sans-serif",
      color: C.espresso,
    }}>
      {/* Header */}
      <header style={{
        padding: "14px 16px",
        background: `linear-gradient(180deg, ${C.creamDark} 0%, ${C.cream} 100%)`,
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
          }}
        ><History size={18} aria-hidden /></button>
        <AvatarRing size={44}><Sigil size={28} /></AvatarRing>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22, fontWeight: 600, color: C.espresso, letterSpacing: "-0.01em",
          }}>{name}</h1>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 2, fontSize: 12, color: C.mutedText,
          }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: C.sage }} />
            <span>Day 12 · Follicular</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Jess settings"
          style={{
            width: 40, height: 40, borderRadius: 9999, border: "none",
            background: C.paperHi, color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        ><Settings size={16} /></button>
      </header>

      {/* Tabs */}
      <div role="tablist" style={{
        display: "flex", background: C.cream, borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        {TABS.map((t) => {
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
      <div style={{
        flex: 1, overflowY: "auto", padding: "14px 14px 80px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {tab === "chat" && (
          <>
            {/* Proactive chips row */}
            <div>
              <p style={kicker}>Jess is thinking about you</p>
              <div style={chipRow}>
                {PROACTIVE_CHIPS.filter((c) => !usedChips.includes(c)).map((c) => (
                  <button key={c} type="button" onClick={() => handleChip(c)} style={chipPill}>{c}</button>
                ))}
              </div>
            </div>
            {messages.map((m, i) => (
              <Bubble key={i} from={m.from} text={m.text} time={m.time} />
            ))}
          </>
        )}
        {tab === "insights" && INSIGHTS.map((card) => (
          <article key={card.title} style={card_}>
            <p style={kicker}>{card.kicker}</p>
            <h3 style={cardTitle}>{card.title}</h3>
            <p style={cardBody}>{card.body}</p>
            <button type="button" style={digRow}>Dig deeper <ChevronRight size={12} /></button>
          </article>
        ))}
        {tab === "plan" && (
          <article style={card_}>
            <p style={kicker}>Today's plan · drafted by Jess</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {TODAY_PLAN.map((row) => (
                <li key={row.time} style={planRow}>
                  <span style={planTime}>{row.time}</span>
                  <span aria-hidden style={{
                    width: 6, height: 6, borderRadius: 9999,
                    background: row.tone === "sage" ? C.sage : row.tone === "blush" ? C.blush : C.espresso,
                  }} />
                  <span style={planItem}>{row.item}</span>
                </li>
              ))}
            </ul>
            <button type="button" style={primaryCta}>Save to Planner</button>
          </article>
        )}
        {tab === "foryou" && FOR_YOU.map((rec) => (
          <article key={rec.title} style={{ ...card_, borderLeft: `3px solid ${C.gold}` }}>
            <p style={kicker}>{rec.tag}</p>
            <h3 style={cardTitle}>{rec.title}</h3>
            <p style={cardBody}>{rec.body}</p>
          </article>
        ))}
      </div>

      {/* Input bar (chat tab only) */}
      {tab === "chat" && (
        <div style={{
          padding: "10px 14px 12px",
          background: C.cream, borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 8, flexShrink: 0,
        }}>
          <button type="button" aria-label="Voice input" style={micBtn}><Mic size={16} style={{ color: C.espresso }} /></button>
          <div style={inputField}>Message {name}…</div>
          <button type="button" aria-label="Send" style={sendBtn}><Send size={14} /></button>
        </div>
      )}

      {/* History drawer */}
      {drawerOpen && (
        <div role="dialog" aria-label="Past conversations" aria-modal="true"
          style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex" }}>
          <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)}
            style={{ position: "absolute", inset: 0, padding: 0, background: "rgba(58,44,26,0.4)", border: "none", cursor: "pointer" }} />
          <aside style={{
            position: "relative", width: "78%", maxWidth: 334, height: "100%",
            background: C.espressoDeep, color: C.cream,
            display: "flex", flexDirection: "column",
            animation: "jess-drawer-in 280ms cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
          }}>
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>Conversations</span>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close"
                style={{ width: 32, height: 32, borderRadius: 9999, border: "none", background: "transparent", color: C.cream, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </header>
            <button type="button" onClick={() => { setDrawerOpen(false); setActiveConvo(null); setMessages([SEED_MESSAGES[0]]); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "transparent", border: "none", borderLeft: `3px solid ${C.gold}`, color: C.gold, cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: 700 }}>
              <Plus size={14} aria-hidden /> New conversation
            </button>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0 16px" }}>
              {SEED_CONVOS.map((c) => {
                const isActive = c.id === activeConvo;
                return (
                  <button key={c.id} type="button" onClick={() => { setActiveConvo(c.id); setDrawerOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 16px",
                      background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                      border: "none",
                      borderLeft: isActive ? `3px solid ${C.gold}` : "3px solid transparent",
                      color: C.cream, cursor: "pointer",
                    }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, opacity: 0.55, letterSpacing: "0.04em" }}>{c.when}</p>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Settings sheet */}
      {settingsOpen && (
        <div role="dialog" aria-label="Jess settings" aria-modal="true"
          style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", alignItems: "flex-end" }}>
          <button type="button" aria-label="Close" onClick={() => setSettingsOpen(false)}
            style={{ position: "absolute", inset: 0, padding: 0, background: "rgba(58,44,26,0.4)", border: "none", cursor: "pointer" }} />
          <div style={{
            position: "relative", width: "100%", maxHeight: "78%", overflowY: "auto",
            background: C.cream, borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: "16px 18px 24px",
            animation: "jess-sheet-up 280ms cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 -6px 28px rgba(58,44,26,0.18)",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: C.border, margin: "0 auto 14px" }} />
            <h2 style={{ margin: "0 0 16px", fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 600 }}>Settings</h2>
            {/* Rename */}
            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={settingKicker}>NAME</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value || "Jess")}
                style={{ width: "100%", marginTop: 6, padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.paperHi, fontSize: 14, color: C.espresso, fontFamily: "'Inter', sans-serif" }} />
            </label>
            {/* Character preset */}
            <p style={settingKicker}>CHARACTER</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6, marginBottom: 16 }}>
              {CHARACTERS.map((ch) => {
                const on = character === ch.id;
                return (
                  <button key={ch.id} type="button" onClick={() => setCharacter(ch.id)}
                    style={{
                      padding: 10, borderRadius: 12, cursor: "pointer",
                      background: C.paperHi,
                      border: on ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                      textAlign: "left",
                      display: "flex", flexDirection: "column", gap: 4,
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span aria-hidden style={{ color: C.gold, fontSize: 16 }}>{ch.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.espresso }}>{ch.label}</span>
                      {on && <Check size={14} style={{ color: C.sage, marginLeft: "auto" }} aria-hidden />}
                    </div>
                    <span style={{ fontSize: 11, color: C.mutedText }}>{ch.desc}</span>
                  </button>
                );
              })}
            </div>
            {/* Proactivity */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 14px", borderRadius: 12, background: C.paperHi, border: `1px solid ${C.border}`,
              marginBottom: 16,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.espresso }}>Proactivity</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.mutedText }}>Let Jess surface patterns unprompted</p>
              </div>
              <button type="button" role="switch" aria-checked={proactivity} onClick={() => setProactivity((p) => !p)}
                style={{
                  width: 44, height: 26, borderRadius: 9999,
                  background: proactivity ? C.sage : C.border,
                  border: "none", cursor: "pointer", position: "relative", padding: 0,
                  transition: "background 200ms ease",
                }}>
                <span aria-hidden style={{
                  position: "absolute", top: 3,
                  left: proactivity ? 21 : 3,
                  width: 20, height: 20, borderRadius: 9999,
                  background: C.paperHi,
                  transition: "left 200ms ease",
                }} />
              </button>
            </div>
            <button type="button" onClick={() => setSettingsOpen(false)}
              style={{ ...primaryCta, width: "100%", marginTop: 0 }}>Save preferences</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes jess-drawer-in {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes jess-sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Small bits ─────────────────────────────────────────────────────────────
function Bubble({ from, text, time }) {
  if (from === "user") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{
          maxWidth: "86%",
          borderRadius: "17px 17px 4px 17px",
          padding: "10px 13px",
          fontSize: 13.5, lineHeight: 1.6,
          background: C.blush, color: C.espresso,
          whiteSpace: "pre-wrap",
        }}>{text}</div>
        {time && <span style={timeStamp}>{time}</span>}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{
        maxWidth: "86%",
        borderRadius: "17px 17px 17px 4px",
        padding: "10px 13px",
        fontSize: 13.5, lineHeight: 1.6,
        background: C.espresso, color: C.cream,
        whiteSpace: "pre-wrap",
      }}>{text}</div>
      {time && <span style={timeStamp}>Jess · {time}</span>}
      <p style={{
        fontSize: 10, color: C.muted, fontStyle: "italic",
        margin: "4px 0 0", padding: "0 2px", maxWidth: "86%", lineHeight: 1.5,
      }}>Not medical advice. Always consult a healthcare professional.</p>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const kicker = {
  margin: "0 0 6px 4px", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontFamily: "'Inter', sans-serif",
};
const chipRow = {
  display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4,
  scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
};
const chipPill = {
  flexShrink: 0, padding: "0 14px", minHeight: 44, borderRadius: 9999,
  background: C.cream, border: `1px solid ${C.espresso}`,
  color: C.espresso, fontSize: 13, fontWeight: 600, cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
};
const card_ = {
  background: C.paperHi, border: `1px solid ${C.border}`,
  borderRadius: 14, padding: 14, boxShadow: "0 2px 10px rgba(58,44,26,0.06)",
};
const cardTitle = {
  margin: "0 0 6px", fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 600, color: C.espresso, lineHeight: 1.3,
};
const cardBody = {
  margin: 0, fontSize: 13, color: C.mutedText, lineHeight: 1.55,
};
const digRow = {
  marginTop: 10, padding: 0, background: "transparent", border: "none",
  cursor: "pointer", color: C.muted,
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
};
const planRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: 10,
  background: C.paper, border: `1px solid ${C.border}`,
};
const planTime = { fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 38 };
const planItem = { flex: 1, fontSize: 13, color: C.espresso };
const primaryCta = {
  marginTop: 12, padding: "11px 18px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "none",
  cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};
const micBtn = {
  border: `1px solid ${C.border}`, borderRadius: 14,
  minWidth: 44, minHeight: 44, backgroundColor: C.paper,
  padding: "0 12px", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const inputField = {
  flex: 1, borderRadius: 14, border: `1px solid ${C.border}`,
  background: C.paper, padding: "12px 14px", minHeight: 44,
  fontSize: 13, color: C.muted, fontStyle: "italic",
  display: "flex", alignItems: "center",
};
const sendBtn = {
  border: "none", borderRadius: 14, background: C.gold, color: C.espresso,
  padding: "0 18px", minWidth: 44, minHeight: 44, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const timeStamp = { fontSize: 10, color: C.muted, marginTop: 3, fontFamily: "'Inter', sans-serif" };
const settingKicker = {
  display: "block", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, marginBottom: 4,
};
