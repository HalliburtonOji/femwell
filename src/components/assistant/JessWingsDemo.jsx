// JessWingsDemo — "Where Jess lives across the app."
//
// Four horizontally swipeable panels, each showing Jess inside a
// different FemWell surface:
//   1. Planner — hero greeting at the top of the day's plan
//   2. Voice Logger — orb + transcript when logging hands-free
//   3. Doctor Export — Jess compiling a doctor-ready summary PDF
//   4. Astra handoff — Jess passing the user across to the astrology
//      surface for a deeper read
//
// Each panel is a self-contained mock — no entity queries, no agent
// calls. Pure presentation, with the conic-gradient avatar ring + the
// FemWell token palette so the wings feel of-a-piece.

import { useEffect, useRef, useState } from "react";
import {
  Mic, ChevronRight, FileText, Sparkles, CalendarClock, ArrowRight,
} from "lucide-react";

const C = {
  cream:     "#F4EDDB",
  creamDark: "#EDE6D5",
  paper:     "#FBF6E6",
  paperHi:   "#FFFFFF",
  espresso:  "#3A2C1A",
  espressoDeep: "#2A1E0E",
  blush:     "#E8B4B8",
  sage:      "#8FAF8F",
  muted:     "#9B8B7A",
  mutedText: "#6B5B4E",
  gold:      "#D4AF37",
  goldDeep:  "#A6862B",
  border:    "#D4C9B4",
  plum:      "#5B4A8A",
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

function AvatarRing({ children, size = 48 }) {
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

const PANELS = [
  { id: "planner", label: "Planner" },
  { id: "voice",   label: "Voice Logger" },
  { id: "doctor",  label: "Doctor Export" },
  { id: "astra",   label: "Astra handoff" },
];

export default function JessWingsDemo() {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef(null);

  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(PANELS.length - 1, i));
    setIdx(clamped);
    const track = trackRef.current; if (!track) return;
    const child = track.children[clamped];
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }
  function onScroll() {
    const track = trackRef.current; if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setIdx(best);
  }

  // Pulse the swipe affordance once on mount to telegraph "swipe me".
  const [hintOn, setHintOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHintOn(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      width: "100%", maxWidth: 460, margin: "0 auto",
      height: "min(82vh, 820px)",
      background: C.cream,
      borderRadius: 18, overflow: "hidden",
      border: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: C.espresso,
    }}>
      {/* Header */}
      <header style={{
        padding: "14px 18px 12px",
        borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.creamDark} 0%, ${C.cream} 100%)`,
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <AvatarRing size={36}><Sigil size={22} /></AvatarRing>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted }}>
            Jess wings
          </p>
          <h1 style={{
            margin: "2px 0 0", fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 18, fontWeight: 600, color: C.espresso, letterSpacing: "-0.01em",
          }}>Where Jess lives across the app</h1>
        </div>
      </header>

      {/* Panel label + dots */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 18px 4px", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: C.espresso }}>
          {String(idx + 1).padStart(2, "0")} · {PANELS[idx].label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {PANELS.map((_, i) => (
            <span key={i} aria-hidden style={{
              width: 6, height: 6, borderRadius: 9999,
              background: i === idx ? C.gold : C.border,
              transform: i === idx ? "scale(1.25)" : "scale(1)",
              transition: "background 200ms ease, transform 200ms ease",
            }} />
          ))}
        </div>
      </div>

      {/* Swipeable track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          gap: 0,
          padding: "8px 0 14px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          perspective: 1200,
        }}
      >
        <PanelShell><PlannerPanel /></PanelShell>
        <PanelShell><VoicePanel /></PanelShell>
        <PanelShell><DoctorPanel /></PanelShell>
        <PanelShell><AstraPanel /></PanelShell>
      </div>

      {/* Caption + arrows */}
      <div style={{
        padding: "10px 18px 14px",
        background: C.cream, borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <button
          type="button"
          aria-label="Previous"
          onClick={() => jumpTo(idx - 1)}
          style={navBtn}
        >‹</button>
        <p style={{ flex: 1, margin: 0, fontSize: 12.5, color: C.mutedText, lineHeight: 1.45 }}>
          {PANEL_CAPTIONS[idx]}
        </p>
        <button
          type="button"
          aria-label="Next"
          onClick={() => jumpTo(idx + 1)}
          style={{
            ...navBtn,
            background: hintOn ? C.gold : C.paper,
            color: hintOn ? C.espresso : C.espresso,
            animation: hintOn ? "jess-wings-hint 1.1s ease-in-out 0.4s 1" : "none",
          }}
        >›</button>
      </div>

      <style>{`
        @keyframes jess-wings-hint {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}

const PANEL_CAPTIONS = [
  "Jess shows up first thing on the Planner — phase-aware greeting, today's energy, a soft draft of the day. Tap to expand into chat.",
  "Voice Logger turns Jess into an orb. Speak freely; transcript renders live. Up to 20 minutes per session, encrypted end-to-end.",
  "Doctor Export is Jess in handoff mode. She compiles the last 3 cycles into a clinician-ready PDF with symptoms, sleep, mood, and your own notes — no diagnosis claims.",
  "Astra is the astrology surface. When the conversation turns to timing, ritual, or seasons, Jess hands you across with the context already loaded.",
];

function PanelShell({ children }) {
  return (
    <section
      style={{
        scrollSnapAlign: "start",
        flex: "0 0 100%",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        height: "100%",
        background: C.paperHi,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        boxShadow: "0 6px 28px rgba(58,44,26,0.10), 0 -1px 0 rgba(212,175,55,0.18)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>{children}</div>
    </section>
  );
}

const navBtn = {
  width: 36, height: 36, borderRadius: 9999,
  border: `1px solid ${C.border}`, background: C.paper, color: C.espresso,
  cursor: "pointer", fontSize: 18, fontWeight: 700,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  transition: "background 200ms ease, transform 200ms ease",
};

// ─── Panel 1 · Planner hero greeting ────────────────────────────────────────
function PlannerPanel() {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={kicker}>Planner · top of page</p>
      {/* Greeting hero — espresso card with the avatar ring + phase chip */}
      <article style={{
        background: `linear-gradient(160deg, ${C.espressoDeep} 0%, ${C.espresso} 100%)`,
        color: C.cream, borderRadius: 18, padding: 16,
        display: "flex", gap: 12, alignItems: "flex-start",
        boxShadow: "0 6px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(212,175,55,0.18)",
      }}>
        <AvatarRing size={52}><Sigil size={32} /></AvatarRing>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(244,237,219,0.6)" }}>Jess</p>
          <p style={{
            margin: "4px 0 8px", fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 17, fontWeight: 500, lineHeight: 1.4, color: C.cream,
          }}>"Morning, Halli. Day 12 — your energy is starting to build. I drafted a softer plan for today."</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: 9999, background: "rgba(212,175,55,0.18)", color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
            <span aria-hidden style={{ width: 5, height: 5, borderRadius: 9999, background: C.gold }} />
            FOLLICULAR · DAY 12
          </div>
        </div>
      </article>
      {/* Today's mini schedule */}
      <article style={planCard}>
        <p style={kicker}>Today · drafted</p>
        {[
          ["8:30",  "Morning walk · 15 min"],
          ["10:00", "Deep work · proposal"],
          ["12:30", "Lunch · iron-rich plate"],
          ["15:00", "Stretch · hip openers"],
        ].map(([t, label]) => (
          <div key={t} style={planLine}>
            <span style={planTime}>{t}</span>
            <span style={{ flex: 1, fontSize: 13, color: C.espresso }}>{label}</span>
          </div>
        ))}
        <button type="button" style={ctaGhost}>
          Open in Planner <ChevronRight size={12} />
        </button>
      </article>
    </div>
  );
}

// ─── Panel 2 · Voice logger ────────────────────────────────────────────────
function VoicePanel() {
  return (
    <div style={{
      padding: 24, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "space-between", height: "100%", gap: 12,
    }}>
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={kicker}>Voice logger</p>
        <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.08em" }}>0:18 / 20:00</span>
      </div>
      {/* Orb */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          position: "relative",
          width: 200, height: 200, borderRadius: 9999,
          background: `radial-gradient(circle at 30% 30%, ${C.gold} 0%, ${C.blush} 38%, ${C.plum} 78%, ${C.espressoDeep} 100%)`,
          boxShadow: "0 20px 60px rgba(91,74,138,0.25), 0 0 0 1px rgba(255,255,255,0.06)",
        }}>
          <div style={{
            position: "absolute", inset: -16, borderRadius: 9999,
            border: `1px solid ${C.gold}55`,
            animation: "jess-wings-orb 3s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", inset: -32, borderRadius: 9999,
            border: `1px solid ${C.gold}33`,
            animation: "jess-wings-orb 3s ease-in-out infinite 0.5s",
          }} />
        </div>
      </div>
      {/* Transcript line */}
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>Jess is listening</p>
        <p style={{
          margin: "8px 0 0", fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 17, fontStyle: "italic", color: C.espresso, lineHeight: 1.45, maxWidth: 320, marginLeft: "auto", marginRight: "auto",
        }}>"Tell me what's circling, love. We can untangle it together."</p>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" aria-label="Pause" style={voiceBtn}>‖</button>
        <button type="button" aria-label="End session" style={{ ...voiceBtn, background: C.blush, color: C.espresso, width: 60, height: 60 }}>✕</button>
        <button type="button" aria-label="Speak" style={{ ...voiceBtn, background: C.gold, color: C.espresso }}>
          <Mic size={18} aria-hidden />
        </button>
      </div>
      <style>{`
        @keyframes jess-wings-orb {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.12); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ─── Panel 3 · Doctor export ────────────────────────────────────────────────
function DoctorPanel() {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <p style={kicker}>Doctor export · Jess in handoff mode</p>
      <article style={{
        background: C.paper, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: C.cream, border: `1px solid ${C.border}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: C.espresso,
        }}><FileText size={18} aria-hidden /></div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.espresso }}>Doctor-ready summary</p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: C.mutedText }}>Last 3 cycles · 4 pages · PDF</p>
        </div>
        <span style={{ fontSize: 10, color: C.sage, fontWeight: 700, letterSpacing: "0.08em" }}>READY</span>
      </article>
      {/* Mock contents */}
      <article style={planCard}>
        <p style={kicker}>Contents</p>
        {[
          ["Cycle history",       "Day-1 dates · cycle length · period length · phase windows"],
          ["Symptom log",         "Top 6 symptoms by frequency · day-of-cycle distribution"],
          ["Sleep + mood",        "14-day rolling averages · luteal vs follicular comparison"],
          ["Your own notes",      "Any journal entries you've marked 'share with clinician'"],
        ].map(([title, sub]) => (
          <div key={title} style={{
            padding: "10px 12px", borderRadius: 10,
            background: C.cream, border: `1px solid ${C.border}`,
            marginBottom: 6,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: C.espresso, fontWeight: 700 }}>{title}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.mutedText, lineHeight: 1.45 }}>{sub}</p>
          </div>
        ))}
      </article>
      <article style={{
        background: "rgba(212,175,55,0.10)", border: `1px solid ${C.gold}55`, borderRadius: 12,
        padding: "10px 12px",
      }}>
        <p style={{ margin: 0, fontSize: 11, color: C.espresso, lineHeight: 1.5 }}>
          <strong>Jess never claims a diagnosis.</strong> The export is what you've logged, summarised. Your clinician reads it.
        </p>
      </article>
      <button type="button" style={ctaPrimary}>Download PDF</button>
    </div>
  );
}

// ─── Panel 4 · Astra handoff ────────────────────────────────────────────────
function AstraPanel() {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <p style={kicker}>Astra handoff</p>
      {/* Jess line */}
      <article style={{
        background: C.espresso, color: C.cream, borderRadius: "17px 17px 17px 4px",
        padding: "10px 13px", maxWidth: "92%",
        fontSize: 13.5, lineHeight: 1.6,
      }}>
        "You're asking about timing — that's Astra's territory. Want me to hand you across with today's chart already loaded?"
      </article>
      {/* Handoff card */}
      <article style={{
        background: `linear-gradient(160deg, ${C.plum} 0%, #3A2A52 100%)`,
        color: C.cream, borderRadius: 16, padding: 14,
        display: "flex", flexDirection: "column", gap: 10,
        boxShadow: "0 6px 24px rgba(91,74,138,0.32)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span aria-hidden style={{ color: C.gold, fontSize: 16 }}>✦</span>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(244,237,219,0.65)" }}>Astra</p>
        </div>
        <h2 style={{ margin: 0, fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500, lineHeight: 1.35 }}>
          Today · Moon in Cancer · 3rd house
        </h2>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(244,237,219,0.78)", lineHeight: 1.5 }}>
          Soft week for inward work and conversations close to home. Your follicular energy lands gently here.
        </p>
        <button type="button" style={{
          marginTop: 4, padding: "10px 14px", borderRadius: 9999,
          background: C.gold, color: C.espresso, border: "none", cursor: "pointer",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
          display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
        }}>
          <Sparkles size={13} aria-hidden /> Open Astra
          <ArrowRight size={13} aria-hidden />
        </button>
      </article>
      {/* What gets carried across */}
      <article style={planCard}>
        <p style={kicker}>What carries across</p>
        {[
          ["CYCLE",   "Day 12, follicular, last 6 cycles"],
          ["MOOD",    "Today's mood + 7-day mood pattern"],
          ["INTENT",  "The thread you were unpacking with Jess"],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: "flex", gap: 12, alignItems: "center",
            padding: "10px 12px", borderRadius: 10,
            background: C.cream, border: `1px solid ${C.border}`,
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.muted, minWidth: 56 }}>{k}</span>
            <span style={{ flex: 1, fontSize: 12.5, color: C.espresso }}>{v}</span>
          </div>
        ))}
      </article>
      <article style={{
        background: "rgba(143,175,143,0.12)", border: `1px solid ${C.sage}55`, borderRadius: 12,
        padding: "10px 12px",
        display: "flex", gap: 8, alignItems: "flex-start",
      }}>
        <CalendarClock size={14} style={{ color: C.sage, flexShrink: 0, marginTop: 1 }} aria-hidden />
        <p style={{ margin: 0, fontSize: 11, color: C.espresso, lineHeight: 1.5 }}>
          You can come back to Jess any time. Both surfaces share your context.
        </p>
      </article>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────
const kicker = {
  margin: 0, fontSize: 10, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted,
};
const planCard = {
  background: C.paperHi, border: `1px solid ${C.border}`,
  borderRadius: 14, padding: 14,
  boxShadow: "0 2px 10px rgba(58,44,26,0.06)",
  display: "flex", flexDirection: "column", gap: 6,
};
const planLine = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 10px", borderRadius: 10,
  background: C.paper, border: `1px solid ${C.border}`,
};
const planTime = { fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 38 };
const ctaPrimary = {
  marginTop: "auto", padding: "12px 18px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "none",
  cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};
const ctaGhost = {
  marginTop: 8, padding: "8px 12px", borderRadius: 9999,
  background: "transparent", color: C.espresso,
  border: `1px solid ${C.border}`,
  cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
};
const voiceBtn = {
  width: 48, height: 48, borderRadius: 9999,
  background: C.paper, color: C.espresso, border: `1px solid ${C.border}`,
  cursor: "pointer", fontSize: 16, fontWeight: 700,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
