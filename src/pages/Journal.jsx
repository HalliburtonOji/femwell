// Journal — Phase 1 build (2026-06-01)
//
// Master Plan section 10 / Phase 1 implementation. Covers:
//   • Private (default) / Shared (Phase 3 placeholder) tabs
//   • Entries / Insights sub-tabs inside Private
//   • Jess phase-aware prompt card
//   • Today's check-in context card (when DailyCheckins has today's row)
//   • On This Day card (matching cycle_day in prior cycles)
//   • Writing-rhythm 7-day dot strip (no zero counter)
//   • Filter chips
//   • Entry list with reactions + detail sheet
//   • Bottom-sheet composer with 3 snap points (peek / half / full)
//   • Burn Mode with user-set timer (1h / 24h / specific date / tap to burn)
//   • Insights view: Jess Noticed / Rhythm chart / Phase mood / Pattern card /
//     Weekly Reflection / Entry Themes
//
// Notes:
//   • Cross-page mood mirror: when an entry of type "mood" is saved and there
//     is no DailyCheckins row for today, we create one with mood_score so
//     Today/Pulse stay coherent. We never overwrite an existing checkin.
//   • Burn entries never inform Jess; they carry is_for_jess=false explicitly.
//   • The shared JessJournalPrompt "wing" already renders elsewhere, so the
//     in-page prompt card here is the journal's own composer-opening prompt.

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, differenceInDays, addHours } from "date-fns";
import {
  Plus, Lock, Users, Flame, X, ChevronUp, ChevronDown,
  Sparkles, BookOpen,
} from "lucide-react";
import { useCycleDay } from "@/hooks/useCycleDay";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";
import JessJournalPrompt from "../components/journal/JessJournalPrompt";

// ── Tokens ──────────────────────────────────────────────────────────────
const T = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  espressoSoft: "rgba(58,44,26,0.85)",
  blush:    "#E8B4B8",
  blushSoft: "rgba(232,180,184,0.20)",
  sage:     "#8FAF8F",
  sageSoft: "rgba(143,175,143,0.18)",
  gold:     "#D4AF37",
  goldSoft: "rgba(212,175,55,0.16)",
  muted:    "#9B8B7A",
  mutedSoft:"rgba(155,139,122,0.14)",
  amber:    "#D97A3A",
  amberSoft:"rgba(217,122,58,0.18)",
  red:      "#C46060",
  border:   "rgba(58,44,26,0.14)",
};

const FRAUNCES = '"Fraunces","Cormorant Garamond",Georgia,serif';
const CORMORANT = '"Cormorant Garamond","Fraunces",Georgia,serif';
const INTER = '"Inter",system-ui,sans-serif';

// ── Phase + life-stage prompts ─────────────────────────────────────────
const PHASE_PROMPTS = {
  menstrual: [
    "You're in your most inward days. What does your body need you to know right now?",
    "If today asked nothing of you, what would the quiet say?",
    "What's softening today that needed to be held tight before?",
  ],
  follicular: [
    "Energy is building. What new idea or intention wants attention?",
    "What's beginning to feel possible again?",
    "If you took one small risk this week, what would it be?",
  ],
  ovulatory: [
    "You're in your most outward window. What connections or conversations feel alive?",
    "Who do you want to talk to today — and what do you actually want to say?",
    "What part of you is the most ready to be seen this week?",
  ],
  luteal: [
    "The editing phase. What can you let go of? What genuinely matters?",
    "What's a quieter no you've been avoiding saying?",
    "What does the discerning part of you know about today?",
  ],
};
const LIFE_STAGE_PROMPTS = {
  perimenopause: "Every day holds its own texture now. What do you want to remember about today?",
  menopause:     "Every day holds its own texture now. What do you want to remember about today?",
  "post-menopause": "Every day holds its own texture now. What do you want to remember about today?",
  pregnant:      "Growing a person is extraordinary. What are you noticing — in your body, your heart, your mind?",
  "pregnant-t1": "Growing a person is extraordinary. What are you noticing — in your body, your heart, your mind?",
  "pregnant-t2": "Growing a person is extraordinary. What are you noticing — in your body, your heart, your mind?",
  "pregnant-t3": "Growing a person is extraordinary. What are you noticing — in your body, your heart, your mind?",
  postpartum:    "You're in a profound transition. What are you learning about yourself right now?",
};

// ── Entry types ────────────────────────────────────────────────────────
const ENTRY_TYPES = [
  { id: "free",          label: "Free write",  glyph: "📝", colour: T.gold },
  { id: "gratitude",     label: "Gratitude",   glyph: "🌿", colour: T.sage },
  { id: "mood",          label: "Mood",        glyph: "💛", colour: T.blush },
  { id: "reflection",    label: "Reflection",  glyph: "💭", colour: T.muted },
  { id: "work",          label: "Work",        glyph: "💼", colour: T.gold },
  { id: "relationships", label: "Relationships", glyph: "💗", colour: T.blush },
  { id: "money",         label: "Money",       glyph: "💵", colour: T.sage },
  { id: "creative",      label: "Creative",    glyph: "🎨", colour: T.gold },
  { id: "grief",         label: "Grief",       glyph: "🌧", colour: T.muted },
  { id: "joy",           label: "Joy",         glyph: "☀️", colour: T.gold },
  { id: "identity",      label: "Identity",    glyph: "🌙", colour: T.blush },
];

const TYPE_PROMPTS = {
  free:          null, // uses phase prompt
  gratitude:     "Name 3 things you're genuinely grateful for today — big, small, or surprising.",
  mood:          "How are you actually feeling — not the edited version, the honest one?",
  reflection:    "What went well? What would you do differently? Be kind with yourself.",
  work:          "What's the actual state of things at work right now?",
  relationships: "Who's on your mind? What's the texture of your closest connections?",
  money:         "What's your relationship with money feeling like right now?",
  creative:      "What are you making, imagining, or noticing creatively?",
  grief:         "You don't have to explain. Just say what's true.",
  joy:           "Name one actual small thing that felt good today.",
  identity:      "Who are you becoming right now? What are you releasing?",
};

const FILTER_CHIPS = [
  { id: "all",           label: "All" },
  { id: "free",          label: "Free write" },
  { id: "gratitude",     label: "Gratitude" },
  { id: "mood",          label: "Mood" },
  { id: "reflection",    label: "Reflection" },
  { id: "work",          label: "Work" },
  { id: "grief",         label: "Grief" },
  { id: "joy",           label: "Joy" },
  { id: "relationships", label: "Relationships" },
  { id: "creative",      label: "Creative" },
  { id: "burn",          label: "Burn Mode" },
];

const MOOD_GLYPHS = ["😔", "😕", "😌", "🙂", "😊"];
const MOOD_LABEL  = ["Heavy", "Low", "Steady", "Light", "Bright"];
const REACTION_GLYPHS = ["🌩️", "☀️", "🌀", "❤️"];

// Theme keywords for the Insights themes pill row.
const THEME_KEYWORDS = {
  work:          /\b(work|boss|colleague|deadline|meeting|career|job|office)\b/i,
  body:          /\b(body|tired|sleep|pain|energy|sore|ache|cramps?)\b/i,
  relationships: /\b(mum|mother|dad|father|partner|friend|family|husband|wife)\b/i,
  money:         /\b(money|rent|bill|salary|spend|budget|saving|debt)\b/i,
  feelings:      /\b(anxious|sad|angry|overwhelmed|grateful|happy|joy|grief|lonely)\b/i,
  creative:      /\b(write|paint|music|cook|garden|make|create|art)\b/i,
  rest:          /\b(rest|nap|quiet|slow|pause|breathe|stillness)\b/i,
};

// ── Helpers ─────────────────────────────────────────────────────────────
function todayISO() { return new Date().toISOString().split("T")[0]; }
function isSameDay(a, b) {
  if (!a || !b) return false;
  const x = (a instanceof Date) ? a : new Date(a);
  const y = (b instanceof Date) ? b : new Date(b);
  return x.toISOString().split("T")[0] === y.toISOString().split("T")[0];
}
function entryDate(e) {
  return e.session_date || (e.created_date ? e.created_date.split("T")[0] : null);
}
function tagsToArray(t) {
  if (Array.isArray(t)) return t.map(String);
  if (typeof t === "string") return t.split(",").map(s => s.trim()).filter(Boolean);
  return [];
}
function typeMeta(id) {
  return ENTRY_TYPES.find(t => t.id === id) || { id: "free", label: "Note", glyph: "📝", colour: T.gold };
}

// ── Phase prompt card ──────────────────────────────────────────────────
function JessPhasePromptCard({ phase, lifeStage, cycleDay, onWrite }) {
  const [idx, setIdx] = useState(0);
  const stagePrompt = lifeStage ? LIFE_STAGE_PROMPTS[lifeStage] : null;
  const phasePrompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS.follicular;
  const prompt = stagePrompt || phasePrompts[idx % phasePrompts.length];
  const phaseLabel = phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Today";
  return (
    <article style={{
      background: T.espresso,
      borderLeft: `3px solid ${T.gold}`,
      borderRadius: 14,
      padding: "16px 16px 14px",
      marginBottom: 14,
      boxShadow: "0 6px 18px rgba(58,44,26,0.10)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9999, background: T.gold,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: T.espresso, fontFamily: FRAUNCES, fontSize: 16, fontWeight: 700,
        }} aria-hidden>✦</span>
        <span style={{ fontSize: 10, color: T.gold, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER }}>JESS</span>
        <span style={{ fontSize: 10, color: T.cream, opacity: 0.7, letterSpacing: 1.2, fontFamily: INTER }}>
          · {phaseLabel}{cycleDay ? ` · Day ${cycleDay}` : ""}
        </span>
      </div>
      <p style={{
        fontFamily: CORMORANT, fontStyle: "italic", fontWeight: 400,
        fontSize: 17, lineHeight: 1.5, color: T.cream, margin: "0 0 14px",
      }}>{prompt}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onWrite(prompt)} style={{
          background: T.gold, color: T.espresso, border: "none",
          borderRadius: 9999, padding: "8px 16px",
          fontFamily: INTER, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Write to this ✦</button>
        {!stagePrompt && phasePrompts.length > 1 && (
          <button onClick={() => setIdx(i => i + 1)} style={{
            background: "transparent", color: T.cream,
            border: `1px solid ${T.muted}`,
            borderRadius: 9999, padding: "8px 14px",
            fontFamily: INTER, fontSize: 12.5, cursor: "pointer",
          }}>Different prompt →</button>
        )}
      </div>
    </article>
  );
}

// ── Today's check-in context card ───────────────────────────────────────
function TodayCheckinCard({ checkin, onWrite }) {
  if (!checkin || checkin.mood_score == null) return null;
  const mood = checkin.mood_score;
  const symptoms = tagsToArray(checkin.symptoms).slice(0, 2).join(", ");
  const energy = checkin.energy_level != null ? `energy ${checkin.energy_level}/5` : "";
  const parts = [`mood ${mood}/5`, energy, symptoms].filter(Boolean).join(" · ");
  return (
    <button onClick={() => onWrite(`Today I logged: ${parts}.`)} style={{
      display: "block", width: "100%", textAlign: "left",
      background: T.blushSoft, border: `1px solid ${T.blush}`,
      borderRadius: 14, padding: "12px 14px", marginBottom: 12,
      cursor: "pointer",
    }}>
      <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 4 }}>
        TODAY'S CHECK-IN
      </div>
      <div style={{ fontSize: 13, color: T.espresso, lineHeight: 1.5, fontFamily: INTER }}>
        💛 Today you logged: {parts}.{" "}
        <span style={{ color: T.gold, fontWeight: 700 }}>Want to write about it?</span>
      </div>
    </button>
  );
}

// ── On This Day card ────────────────────────────────────────────────────
function OnThisDayCard({ entry, onReply }) {
  if (!entry) return null;
  const meta = typeMeta(entry.card_type || entry.type);
  return (
    <article style={{
      background: T.paperHi, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.gold}`,
      borderRadius: 14, padding: "12px 14px", marginBottom: 12,
    }}>
      <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 6 }}>
        📅 ON THIS DAY {entry.cycle_day ? `· LAST CYCLE (DAY ${entry.cycle_day})` : ""}
      </div>
      <p style={{
        fontFamily: CORMORANT, fontStyle: "italic", fontSize: 15, color: T.espresso,
        lineHeight: 1.5, margin: "0 0 8px",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>“{String(entry.content || "").slice(0, 220)}”</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: meta.colour, fontWeight: 700, fontFamily: INTER, letterSpacing: 0.5 }}>
          {meta.glyph} {meta.label}
        </span>
        <span style={{ fontSize: 11, color: T.muted, fontFamily: INTER }}>
          {entryDate(entry) ? format(parseISO(entryDate(entry)), "MMM d") : ""}
        </span>
        <button onClick={() => onReply(entry)} style={{
          marginLeft: "auto",
          background: T.gold, color: T.espresso, border: "none",
          borderRadius: 9999, padding: "5px 12px",
          fontFamily: INTER, fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>Reply to past self →</button>
      </div>
    </article>
  );
}

// ── Writing rhythm strip (7 dots, never a zero) ────────────────────────
function WritingRhythm({ entries }) {
  const days = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const has = entries.some(e => entryDate(e) === iso);
      out.push({ iso, dow: d.toLocaleDateString(undefined, { weekday: "narrow" }), has, isToday: i === 0 });
    }
    return out;
  }, [entries]);
  const lastIso = entries.map(entryDate).filter(Boolean).sort().reverse()[0];
  const daysSince = lastIso ? differenceInDays(new Date(), parseISO(lastIso)) : null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
        {days.map((d) => (
          <div key={d.iso} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%", margin: "0 auto",
              background: d.isToday ? T.gold : d.has ? T.espresso : T.mutedSoft,
              border: d.isToday ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
            }} />
            <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontFamily: INTER }}>{d.dow}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: T.muted, fontFamily: INTER, textAlign: "center" }}>
        {daysSince == null
          ? "Welcome — start when you're ready."
          : daysSince === 0
            ? "Wrote today ✓"
            : `Last wrote ${daysSince} day${daysSince === 1 ? "" : "s"} ago — welcome back.`}
      </div>
    </div>
  );
}

// ── Filter chips ────────────────────────────────────────────────────────
function FilterChips({ value, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto",
      paddingBottom: 6, marginBottom: 14,
      WebkitOverflowScrolling: "touch",
    }}>
      {FILTER_CHIPS.map((chip) => {
        const active = chip.id === value;
        return (
          <button key={chip.id} onClick={() => onChange(chip.id)} style={{
            flexShrink: 0,
            background: active ? T.espresso : "transparent",
            color: active ? T.cream : T.espresso,
            border: `1px solid ${active ? T.espresso : T.border}`,
            borderRadius: 9999, padding: "6px 14px",
            fontFamily: INTER, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap",
          }}>{chip.label}</button>
        );
      })}
    </div>
  );
}

// ── Burn countdown chip (rendered on burn entries in list) ─────────────
function BurnCountdown({ burnAt, onBurn }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  if (!burnAt) {
    return (
      <button onClick={onBurn} style={{
        background: T.amber, color: "white", border: "none",
        borderRadius: 9999, padding: "4px 10px",
        fontFamily: INTER, fontSize: 11, fontWeight: 700, cursor: "pointer",
      }}>Tap to burn 🔥</button>
    );
  }
  const ms = new Date(burnAt).getTime() - now;
  if (ms <= 0) return (
    <span style={{
      background: T.amber, color: "white",
      borderRadius: 9999, padding: "4px 10px",
      fontFamily: INTER, fontSize: 11, fontWeight: 700,
    }}>Burning…</span>
  );
  const mins = Math.round(ms / 60000);
  const label = mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins/60)} h` : `${Math.round(mins/1440)} d`;
  return (
    <span style={{
      background: T.amberSoft, color: T.amber, border: `1px solid ${T.amber}`,
      borderRadius: 9999, padding: "4px 10px",
      fontFamily: INTER, fontSize: 11, fontWeight: 700,
    }}>Burns in {label} 🔥</span>
  );
}

// ── Entry card ──────────────────────────────────────────────────────────
function EntryCard({ entry, onOpen, onReact, onBurn }) {
  const [showReactions, setShowReactions] = useState(false);
  const meta = typeMeta(entry.card_type || entry.type);
  const isBurn = !!entry.is_burn;
  const moodIdx = (Number(entry.mood) || 0) - 1;
  const dateLabel = entryDate(entry) ? format(parseISO(entryDate(entry)), "MMM d · h:mma") : "";
  const phaseLabel = entry.cycle_phase
    ? entry.cycle_phase.charAt(0).toUpperCase() + entry.cycle_phase.slice(1)
    : null;
  return (
    <article
      onClick={() => onOpen(entry)}
      style={{
        background: isBurn ? T.amberSoft : T.paperHi,
        border: `1px solid ${isBurn ? T.amber : T.border}`,
        borderRadius: 14, padding: "12px 14px 10px",
        marginBottom: 10, cursor: "pointer", position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, fontFamily: INTER,
          color: isBurn ? T.amber : meta.colour,
          background: isBurn ? "rgba(217,122,58,0.12)" : "rgba(58,44,26,0.06)",
          border: `1px solid ${isBurn ? T.amber : T.border}`,
          borderRadius: 6, padding: "2px 8px",
        }}>{isBurn ? "🔥 Burn" : `${meta.glyph} ${meta.label}`}</span>
        {phaseLabel && (
          <span style={{ fontSize: 10, color: T.muted, fontFamily: INTER, letterSpacing: 0.5 }}>
            {phaseLabel}{entry.cycle_day ? ` · Day ${entry.cycle_day}` : ""}
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 11, color: T.muted, fontFamily: INTER }}>{dateLabel}</span>
      </div>
      <p style={{
        fontFamily: CORMORANT, fontSize: 15.5, color: T.espresso,
        lineHeight: 1.5, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{String(entry.content || "").slice(0, 240)}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        {entry.card_type === "mood" && moodIdx >= 0 && moodIdx < 5 && (
          <span style={{ fontSize: 12, color: T.espresso, fontFamily: INTER }}>
            {MOOD_GLYPHS[moodIdx]} <span style={{ color: T.muted }}>{MOOD_LABEL[moodIdx]}</span>
          </span>
        )}
        {entry.reaction && (
          <span style={{ fontSize: 14 }} aria-label={`Reaction ${entry.reaction}`}>{entry.reaction}</span>
        )}
        {isBurn && (
          <div style={{ marginLeft: "auto" }} onClick={(e) => e.stopPropagation()}>
            <BurnCountdown burnAt={entry.burn_date} onBurn={() => onBurn(entry)} />
          </div>
        )}
        {!isBurn && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowReactions(v => !v); }}
            style={{
              marginLeft: "auto", background: "transparent", border: "none",
              cursor: "pointer", padding: 4, color: T.muted, fontSize: 14,
            }}
            aria-label="React"
          >＋</button>
        )}
      </div>
      {showReactions && !isBurn && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: 8, right: 10,
            display: "flex", gap: 6,
            background: T.cream, border: `1px solid ${T.border}`,
            borderRadius: 9999, padding: "4px 8px",
            boxShadow: "0 6px 18px rgba(58,44,26,0.16)",
          }}
        >
          {REACTION_GLYPHS.map((g) => (
            <button key={g} onClick={() => { onReact(entry, g); setShowReactions(false); }}
              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16 }}>
              {g}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

// ── Entry detail bottom sheet ───────────────────────────────────────────
function EntryDetailSheet({ entry, onClose, onAskJess, onSaveGp }) {
  if (!entry) return null;
  const meta = typeMeta(entry.card_type || entry.type);
  const isBurn = !!entry.is_burn;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(58,44,26,0.55)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.cream, width: "100%", maxWidth: 640,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "16px 18px 22px",
        maxHeight: "82vh", overflowY: "auto",
        boxShadow: "0 -10px 30px rgba(58,44,26,0.20)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: INTER,
            color: isBurn ? T.amber : meta.colour,
          }}>{isBurn ? "🔥 BURN" : `${meta.glyph} ${meta.label.toUpperCase()}`}</span>
          <button onClick={onClose} aria-label="Close" style={{
            background: "transparent", border: "none", cursor: "pointer", color: T.muted,
          }}><X size={20} /></button>
        </div>
        <p style={{
          fontFamily: CORMORANT, fontSize: 18, lineHeight: 1.7,
          color: T.espresso, whiteSpace: "pre-wrap", margin: 0,
        }}>{entry.content}</p>
        {!isBurn && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <button onClick={() => onAskJess(entry)} style={{
              background: T.espresso, color: T.cream, border: "none",
              borderRadius: 9999, padding: "9px 16px",
              fontFamily: INTER, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Ask Jess about this</button>
            <button onClick={() => onSaveGp(entry)} style={{
              background: "transparent", color: T.espresso, border: `1px solid ${T.espresso}`,
              borderRadius: 9999, padding: "9px 16px",
              fontFamily: INTER, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Save to GP notes</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composer (3 snap points: peek / half / full) ───────────────────────
function ComposerSheet({
  open, snap, setSnap, onClose, onSubmit,
  seedPrompt, seedText, seedType,
}) {
  const [type, setType] = useState(seedType || "free");
  const [text, setText] = useState(seedText || "");
  const [mood, setMood] = useState(null);
  const [notForJess, setNotForJess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setType(seedType || "free");
      setText(seedText || "");
      setMood(null);
      setNotForJess(false);
    }
  }, [open, seedType, seedText]);

  if (!open) return null;

  const prompt = TYPE_PROMPTS[type] || seedPrompt || "Write freely — this is just for you.";
  const height = snap === "peek" ? "30vh" : snap === "half" ? "62vh" : "94vh";
  const cycleSnap = () => setSnap(snap === "peek" ? "half" : snap === "half" ? "full" : "peek");

  const handleSave = async () => {
    if (!text.trim() && type !== "mood") return;
    setSaving(true);
    try {
      await onSubmit({ type, content: text.trim(), mood, is_for_jess: !notForJess });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 90,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgba(58,44,26,0.45)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.cream, width: "100%", maxWidth: 720,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        height, transition: "height 260ms cubic-bezier(0.16,1,0.3,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -10px 30px rgba(58,44,26,0.22)",
      }}>
        {/* drag handle */}
        <button onClick={cycleSnap} aria-label="Resize composer" style={{
          background: "transparent", border: "none",
          padding: "10px 0 6px", cursor: "pointer", color: T.muted,
        }}>
          <div style={{ width: 42, height: 4, background: T.muted, borderRadius: 9999, margin: "0 auto" }} />
        </button>

        {/* Type chips (peek + above) */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto", padding: "4px 16px 8px",
          WebkitOverflowScrolling: "touch",
        }}>
          {ENTRY_TYPES.map((t) => {
            const active = t.id === type;
            return (
              <button key={t.id} onClick={() => setType(t.id)} style={{
                flexShrink: 0,
                background: active ? T.espresso : "transparent",
                color: active ? T.cream : T.espresso,
                border: `1px solid ${active ? T.espresso : T.border}`,
                borderRadius: 9999, padding: "6px 12px",
                fontFamily: INTER, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                whiteSpace: "nowrap",
              }}>{t.glyph} {t.label}</button>
            );
          })}
        </div>

        {snap !== "peek" && (
          <div style={{
            margin: "4px 16px 8px",
            background: T.espresso, borderRadius: 12,
            padding: "10px 12px",
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <span style={{ color: T.gold, fontFamily: FRAUNCES, fontSize: 14 }}>✦</span>
            <p style={{
              margin: 0, fontFamily: CORMORANT, fontStyle: "italic",
              fontSize: 14, color: T.cream, lineHeight: 1.45,
            }}>{prompt}</p>
          </div>
        )}

        {snap !== "peek" && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write freely — this is just for you…"
            style={{
              flex: 1, margin: "0 16px",
              background: T.paperHi, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: 14, resize: "none",
              fontFamily: CORMORANT, fontSize: 16, lineHeight: 1.55,
              color: T.espresso, outline: "none",
              minHeight: snap === "half" ? 160 : 280,
            }}
          />
        )}

        {snap === "full" && type === "mood" && (
          <div style={{ padding: "12px 16px 0", display: "flex", gap: 10, justifyContent: "space-between" }}>
            {MOOD_GLYPHS.map((g, i) => (
              <button key={i} onClick={() => setMood(i + 1)} style={{
                flex: 1,
                background: mood === i + 1 ? T.gold : "transparent",
                border: `1px solid ${mood === i + 1 ? T.gold : T.border}`,
                borderRadius: 12, padding: "10px 0",
                fontSize: 22, cursor: "pointer",
              }}>{g}</button>
            ))}
          </div>
        )}

        {snap !== "peek" && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px 14px", borderTop: `1px solid ${T.border}`, marginTop: 8,
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: INTER, fontSize: 12, color: T.muted, cursor: "pointer" }}>
              <input type="checkbox" checked={notForJess} onChange={(e) => setNotForJess(e.target.checked)} />
              <Lock size={12} /> Not for Jess
            </label>
            <button onClick={handleSave} disabled={saving} style={{
              background: saving ? T.muted : T.espresso, color: T.cream,
              border: "none", borderRadius: 9999, padding: "10px 22px",
              fontFamily: INTER, fontSize: 14, fontWeight: 700,
              cursor: saving ? "default" : "pointer",
            }}>{saving ? "Saving…" : "Save entry ✓"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Burn composer (amber, with timer) ──────────────────────────────────
function BurnComposer({ open, onClose, onSubmit }) {
  const [text, setText] = useState("");
  const [timer, setTimer] = useState("24h"); // "1h" | "24h" | "date" | "tap"
  const [dateStr, setDateStr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setText(""); setTimer("24h"); setDateStr(""); }
  }, [open]);

  if (!open) return null;

  const resolveBurnAt = () => {
    const now = new Date();
    if (timer === "1h")  return addHours(now, 1).toISOString();
    if (timer === "24h") return addHours(now, 24).toISOString();
    if (timer === "date" && dateStr) return new Date(dateStr).toISOString();
    return null; // tap to burn — no scheduled time
  };

  const burnAtPreview = (() => {
    const iso = resolveBurnAt();
    if (!iso) return "When you tap the flame";
    try {
      return format(parseISO(iso), "MMM d, h:mma");
    } catch { return "—"; }
  })();

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        type: "burn",
        content: text.trim(),
        is_burn: true,
        burn_at: resolveBurnAt(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 95,
      background: "rgba(58,44,26,0.65)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: "#2A1F17", width: "100%", maxWidth: 720,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        height: "94vh", display: "flex", flexDirection: "column",
        borderTop: `2px solid ${T.amber}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Flame size={18} color={T.amber} />
            <span style={{ fontFamily: INTER, fontSize: 12, color: T.amber, fontWeight: 700, letterSpacing: 1.4 }}>BURN MODE</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: "transparent", border: "none", color: T.cream, opacity: 0.8, cursor: "pointer",
          }}><X size={20} /></button>
        </div>
        <h2 style={{
          fontFamily: FRAUNCES, color: T.cream, margin: "0 18px 6px",
          fontSize: 22, fontWeight: 600, letterSpacing: -0.2,
        }}>Write knowing it will be gone.</h2>
        <p style={{
          margin: "0 18px 12px", fontFamily: INTER,
          color: T.amber, fontSize: 12, lineHeight: 1.5,
        }}>
          Jess will never read this. It won't inform your context, memory, or letters. It's entirely yours
          until it's gone.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say it. No one will read this."
          style={{
            flex: 1, margin: "0 18px 12px",
            background: T.cream, border: "none", borderRadius: 12, padding: 14, resize: "none",
            fontFamily: CORMORANT, fontSize: 16, lineHeight: 1.55, color: T.espresso, outline: "none",
          }}
        />

        <div style={{ padding: "0 18px 8px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "1h", label: "In 1 hour" },
            { id: "24h", label: "In 24 hours" },
            { id: "date", label: "Choose a date" },
            { id: "tap", label: "When I tap the flame" },
          ].map((opt) => {
            const active = opt.id === timer;
            return (
              <button key={opt.id} onClick={() => setTimer(opt.id)} style={{
                flexShrink: 0,
                background: active ? T.amber : "transparent",
                color: active ? "#2A1F17" : T.cream,
                border: `1px solid ${T.amber}`,
                borderRadius: 9999, padding: "6px 12px",
                fontFamily: INTER, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>{opt.label}</button>
            );
          })}
        </div>

        {timer === "date" && (
          <div style={{ padding: "0 18px 8px" }}>
            <input
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              style={{
                width: "100%",
                background: T.cream, border: "none", borderRadius: 8,
                padding: "8px 10px", fontFamily: INTER, fontSize: 13, color: T.espresso,
              }}
            />
          </div>
        )}

        <div style={{
          padding: "8px 18px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10,
        }}>
          <div style={{ fontSize: 11, color: T.amber, fontFamily: INTER }}>
            🔥 Burns: {burnAtPreview}
          </div>
          <button onClick={handleSave} disabled={saving} style={{
            background: T.amber, color: "#2A1F17", border: "none",
            borderRadius: 9999, padding: "10px 22px",
            fontFamily: INTER, fontSize: 14, fontWeight: 700,
            cursor: saving ? "default" : "pointer",
          }}>{saving ? "Saving…" : "Save burn entry"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Insights view ──────────────────────────────────────────────────────
function InsightsView({ entries, profile, onAskJess }) {
  // Aggregate
  const byPhase = useMemo(() => {
    const out = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
    entries.forEach((e) => {
      const p = (e.cycle_phase || "").toLowerCase();
      if (out[p]) out[p].push(e);
    });
    return out;
  }, [entries]);

  const moodAvgByPhase = useMemo(() => {
    const o = {};
    Object.entries(byPhase).forEach(([p, arr]) => {
      const moods = arr.map(e => Number(e.mood)).filter(n => n >= 1 && n <= 5);
      o[p] = moods.length ? +(moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(2) : null;
    });
    return o;
  }, [byPhase]);

  const moodAvg = useMemo(() => {
    const moods = entries.map(e => Number(e.mood)).filter(n => n >= 1 && n <= 5);
    return moods.length ? +(moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(2) : null;
  }, [entries]);

  const mostType = useMemo(() => {
    const c = {};
    entries.forEach(e => { const t = e.card_type || e.type; if (t) c[t] = (c[t] || 0) + 1; });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? typeMeta(top[0]).label : null;
  }, [entries]);

  const mostPhase = useMemo(() => {
    const top = Object.entries(byPhase).sort((a, b) => b[1].length - a[1].length)[0];
    return top && top[1].length ? top[0] : null;
  }, [byPhase]);

  // Last 7 days bar chart
  const last7 = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const dayEntries = entries.filter(e => entryDate(e) === iso);
      const wc = dayEntries.reduce((acc, e) => acc + String(e.content || "").split(/\s+/).filter(Boolean).length, 0);
      out.push({ iso, dow: d.toLocaleDateString(undefined, { weekday: "short" }), count: dayEntries.length, wc, isToday: i === 0 });
    }
    return out;
  }, [entries]);
  const max7 = Math.max(1, ...last7.map(d => d.wc));

  const last7count = last7.reduce((a, d) => a + d.count, 0);
  const lastIso = entries.map(entryDate).filter(Boolean).sort().reverse()[0];
  const daysSince = lastIso ? differenceInDays(new Date(), parseISO(lastIso)) : null;

  // Pattern card — lowest mood phase (when 8+ mood entries)
  const moodEntries = entries.filter(e => Number(e.mood) >= 1 && Number(e.mood) <= 5);
  const lowestPhase = moodEntries.length >= 8
    ? Object.entries(moodAvgByPhase).filter(([, v]) => v != null).sort((a, b) => a[1] - b[1])[0]
    : null;

  // Themes
  const themes = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      const txt = String(e.content || "");
      Object.entries(THEME_KEYWORDS).forEach(([key, rx]) => {
        if (rx.test(txt)) counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [entries]);

  // Weekly reflection
  const [reflectLoading, setReflectLoading] = useState(false);
  const [reflectText, setReflectText] = useState("");
  const handleReflect = async () => {
    if (entries.length === 0) return;
    setReflectLoading(true);
    try {
      const sample = entries.slice(0, 7).map(e => `(${(e.cycle_phase || "—")}) ${String(e.content || "").slice(0, 240)}`).join("\n");
      const system = "You are Jess, a warm UK-based women's health companion. Synthesise the user's last few journal entries into 2-3 warm sentences. No medical advice. No quotation marks. Maximum 320 characters.";
      const userPrompt = `Recent entries:\n${sample}\n\nWrite the weekly synthesis.`;
      const { callJessAgent } = await import("@/services/jessAgentService");
      const { text } = await callJessAgent({ system, user: userPrompt });
      setReflectText(String(text || "").replace(/```[\s\S]*?```/g, "").trim() || "—");
    } catch {
      setReflectText("Couldn't synthesise this week — try again later.");
    } finally {
      setReflectLoading(false);
    }
  };

  const handleSaveGp = (label) => {
    try {
      const raw = sessionStorage.getItem("gp_questions");
      const list = raw ? JSON.parse(raw) : [];
      list.push({ q: label, at: new Date().toISOString() });
      sessionStorage.setItem("gp_questions", JSON.stringify(list));
      alert("Saved for GP conversation.");
    } catch {/* ignore */}
  };

  return (
    <div>
      {/* Jess Noticed */}
      <article style={{
        background: T.espresso, color: T.cream,
        borderRadius: 14, padding: "14px 16px 12px", marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: T.gold, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 6 }}>
          JESS NOTICED
        </div>
        {entries.length < 5 ? (
          <p style={{ margin: 0, fontFamily: CORMORANT, fontStyle: "italic", fontSize: 15, color: T.cream, lineHeight: 1.5 }}>
            Write a few more entries and I'll start noticing patterns.
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {mostPhase && (
              <li style={{ display: "flex", gap: 8, fontSize: 13, color: T.cream, lineHeight: 1.6, marginBottom: 6, fontFamily: INTER }}>
                <span style={{ color: T.gold }}>◆</span>
                You write most often in your <strong style={{ color: T.gold }}>{mostPhase}</strong> phase.
              </li>
            )}
            {moodAvg != null && (
              <li style={{ display: "flex", gap: 8, fontSize: 13, color: T.cream, lineHeight: 1.6, marginBottom: 6, fontFamily: INTER }}>
                <span style={{ color: T.gold }}>◆</span>
                Average mood across your mood entries: <strong style={{ color: T.gold }}>{moodAvg}/5</strong>.
              </li>
            )}
            {mostType && (
              <li style={{ display: "flex", gap: 8, fontSize: 13, color: T.cream, lineHeight: 1.6, fontFamily: INTER }}>
                <span style={{ color: T.gold }}>◆</span>
                Most-used entry type: <strong style={{ color: T.gold }}>{mostType}</strong>.
              </li>
            )}
          </ul>
        )}
      </article>

      {/* Writing rhythm bar chart */}
      <article style={{
        background: T.paperHi, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: "14px 16px", marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 10 }}>
          WRITING RHYTHM · LAST 7 DAYS
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
          {last7.map((d) => (
            <div key={d.iso} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%", height: `${(d.wc / max7) * 70 + (d.count > 0 ? 6 : 2)}px`,
                background: d.isToday ? T.gold : d.count > 0 ? T.espresso : T.mutedSoft,
                borderRadius: "6px 6px 0 0",
                transition: "height 240ms ease-out",
              }} />
              <div style={{ fontSize: 10, color: T.muted, marginTop: 4, fontFamily: INTER }}>{d.dow}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: INTER, fontSize: 11, color: T.muted }}>
          <span>{daysSince == null ? "—" : daysSince === 0 ? "Wrote today ✓" : `Last wrote ${daysSince}d ago`}</span>
          <span>This week: {last7count}</span>
          <span>Total: {entries.length}</span>
        </div>
      </article>

      {/* Phase mood */}
      <article style={{
        background: T.paperHi, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: "14px 16px", marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 10 }}>
          MOOD ACROSS YOUR CYCLE
        </div>
        {moodEntries.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: T.muted, fontFamily: INTER }}>
            Log a few entries with mood to unlock this.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "menstrual",  label: "Menstrual",  colour: T.blush },
              { id: "follicular", label: "Follicular", colour: T.sage },
              { id: "ovulatory",  label: "Ovulatory",  colour: T.gold },
              { id: "luteal",     label: "Luteal",     colour: T.muted },
            ].map((p) => {
              const v = moodAvgByPhase[p.id];
              const w = v != null ? Math.round((v / 5) * 100) : 0;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 78, fontSize: 11, color: T.espresso, fontFamily: INTER, fontWeight: 600 }}>
                    {p.label}
                  </span>
                  <div style={{ flex: 1, height: 8, background: T.mutedSoft, borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ width: `${w}%`, height: "100%", background: p.colour, transition: "width 240ms ease-out" }} />
                  </div>
                  <span style={{ width: 36, textAlign: "right", fontSize: 11, color: T.muted, fontFamily: INTER }}>
                    {v != null ? `${v}/5` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </article>

      {/* Pattern insight */}
      {lowestPhase && (
        <article style={{
          background: T.espresso, color: T.cream,
          borderRadius: 14, padding: "14px 16px", marginBottom: 12,
          borderLeft: `3px solid ${T.gold}`,
        }}>
          <div style={{ fontSize: 10, color: T.gold, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 6 }}>
            PATTERN INSIGHT
          </div>
          <p style={{ margin: "0 0 10px", fontFamily: CORMORANT, fontStyle: "italic", fontSize: 15, lineHeight: 1.55 }}>
            Your mood tends to be quieter in your <strong style={{ color: T.gold }}>{lowestPhase[0]}</strong> phase
            (avg {lowestPhase[1]}/5). It's a pattern worth knowing — not a problem to solve.
          </p>
          <button
            onClick={() => handleSaveGp(`Lower mood in ${lowestPhase[0]} phase (avg ${lowestPhase[1]}/5)`)}
            style={{
              background: T.gold, color: T.espresso, border: "none",
              borderRadius: 9999, padding: "7px 14px",
              fontFamily: INTER, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
            Save for GP conversation
          </button>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: INTER, marginTop: 6 }}>
            Not medical advice. A pattern to bring to your clinician if helpful.
          </div>
        </article>
      )}

      {/* Weekly reflection */}
      <article style={{
        background: T.goldSoft, border: `1px solid ${T.gold}`,
        borderRadius: 14, padding: "14px 16px", marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: T.gold, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 8 }}>
          WEEKLY REFLECTION
        </div>
        {reflectText ? (
          <p style={{
            margin: "0 0 8px", fontFamily: CORMORANT, fontStyle: "italic",
            fontSize: 16, lineHeight: 1.55, color: T.espresso,
          }}>{reflectText}</p>
        ) : (
          <p style={{ margin: "0 0 8px", fontSize: 12.5, color: T.espresso, fontFamily: INTER }}>
            One warm synthesis of the last 7 entries, written by Jess.
          </p>
        )}
        <button onClick={handleReflect} disabled={reflectLoading || entries.length === 0} style={{
          background: T.espresso, color: T.cream,
          border: "none", borderRadius: 9999, padding: "7px 14px",
          fontFamily: INTER, fontSize: 12, fontWeight: 700,
          cursor: reflectLoading ? "default" : "pointer", opacity: entries.length === 0 ? 0.5 : 1,
        }}>{reflectLoading ? "Synthesising…" : reflectText ? "Generate again ✦" : "Generate ✦"}</button>
        <div style={{ fontSize: 10, color: T.muted, fontFamily: INTER, marginTop: 6 }}>
          Not medical advice.
        </div>
      </article>

      {/* Themes */}
      <article style={{
        background: T.paperHi, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: "14px 16px",
      }}>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.4, fontWeight: 700, fontFamily: INTER, marginBottom: 10 }}>
          ENTRY THEMES
        </div>
        {themes.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: T.muted, fontFamily: INTER }}>
            Themes appear once you've written a few entries.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {themes.map(([k, n]) => (
                <span key={k} style={{
                  background: T.cream, border: `1px solid ${T.border}`,
                  borderRadius: 9999, padding: "5px 12px",
                  fontFamily: INTER, fontSize: 12, color: T.espresso, fontWeight: 600,
                }}>{k} <span style={{ color: T.muted, fontWeight: 400 }}>· {n}</span></span>
              ))}
            </div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: INTER }}>
              From your last {entries.length} entries.
            </div>
          </>
        )}
      </article>
    </div>
  );
}

// ── Default export — Journal page ──────────────────────────────────────
export default function Journal() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Top tab strip: private | shared
  const [privacyTab, setPrivacyTab] = useState("private");
  // Sub tabs: entries | insights
  const [subTab, setSubTab] = useState("entries");

  // Filter
  const [filter, setFilter] = useState("all");

  // Composer state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snap, setSnap] = useState("half");
  const [seedPrompt, setSeedPrompt] = useState("");
  const [seedText, setSeedText] = useState("");
  const [seedType, setSeedType] = useState("free");

  // Burn composer
  const [burnOpen, setBurnOpen] = useState(false);

  // Detail
  const [detailEntry, setDetailEntry] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const flashToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  // Cycle derivation (single source of truth)
  const cycle = useCycleDay(profile);
  const lifeStage = profile?.life_stage || null;

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [data, profiles, checkins] = await Promise.all([
          base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 200).catch(() => []),
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, day_key: todayISO() }).catch(() => []),
        ]);
        setEntries(Array.isArray(data) ? data : []);
        setProfile(profiles[0] || null);
        setCheckin((checkins || [])[0] || null);
      } catch (err) {
        console.error("Journal init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Purge entries whose burn_at has passed (best-effort client-side)
  useEffect(() => {
    if (!entries.length) return;
    const now = Date.now();
    const expired = entries.filter(e => e.is_burn && e.burn_date && new Date(e.burn_date).getTime() <= now);
    if (!expired.length) return;
    (async () => {
      for (const e of expired) {
        try { await base44.entities.JournalEntries.delete(e.id); } catch {/* */}
      }
      setEntries(prev => prev.filter(e => !expired.some(x => x.id === e.id)));
    })();
  }, [entries]);

  const openWith = useCallback(({ type = "free", text = "", prompt = "" } = {}) => {
    setSeedType(type);
    setSeedText(text);
    setSeedPrompt(prompt);
    setSnap("half");
    setSheetOpen(true);
  }, []);

  const onPhasePromptWrite = (prompt) => openWith({ type: "free", prompt });
  const onCheckinWrite = (text) => openWith({ type: "mood", text });
  const onReplyPastSelf = (entry) => openWith({
    type: "reflection",
    text: `On this day last cycle (Day ${entry.cycle_day || "—"}), I wrote:\n\n“${String(entry.content || "").slice(0, 200)}”\n\nWhat would I say to that version of me now?\n\n`,
  });

  // Save entry
  const handleSave = async (payload) => {
    if (!user) return;
    const phase = cycle?.phase || null;
    const cd = cycle?.cycleDay || null;
    const row = {
      user_id: user.id,
      session_date: todayISO(),
      card_type: payload.type,
      type: payload.type,
      content: payload.content,
      cycle_day: cd,
      cycle_phase: phase,
      is_for_jess: payload.is_for_jess !== false && !payload.is_burn,
      is_burn: !!payload.is_burn,
      burn_date: payload.burn_at || null,
    };
    if (payload.mood) row.mood = payload.mood;
    try {
      const created = await base44.entities.JournalEntries.create(row);
      setEntries(prev => [created, ...prev]);
      // Mood mirror to DailyCheckins (don't overwrite an existing checkin's mood).
      if (payload.type === "mood" && payload.mood && (!checkin || checkin.mood_score == null)) {
        try {
          if (checkin?.id) {
            await base44.entities.DailyCheckins.update(checkin.id, { mood_score: payload.mood });
            setCheckin({ ...checkin, mood_score: payload.mood });
          } else {
            const created2 = await base44.entities.DailyCheckins.create({
              user_id: user.id, day_key: todayISO(), mood_score: payload.mood,
            });
            setCheckin(created2);
          }
        } catch {/* */}
      }
      setSheetOpen(false);
      setBurnOpen(false);
      flashToast(payload.is_burn ? "Entry burning… 🔥" : "Entry saved ✓");
    } catch (err) {
      console.error("Save failed", err);
      flashToast("Couldn't save — try again.");
    }
  };

  // Reaction
  const handleReact = async (entry, reaction) => {
    try {
      await base44.entities.JournalEntries.update(entry.id, { reaction });
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, reaction } : e));
    } catch {/* */}
  };

  // Burn-now (tap to burn from list)
  const handleBurnNow = async (entry) => {
    try {
      await base44.entities.JournalEntries.delete(entry.id);
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      flashToast("Released. 🔥");
    } catch {/* */}
  };

  const handleAskJess = (entry) => {
    try {
      const tip = String(entry.content || "").slice(0, 280);
      sessionStorage.setItem("jess_seed_question", `Help me think about this entry:\n\n“${tip}”`);
    } catch {/* */}
    // Navigate to /Assistant — soft link.
    if (typeof window !== "undefined") window.location.href = "/Assistant";
  };

  const handleSaveGp = (entry) => {
    try {
      const raw = sessionStorage.getItem("gp_questions");
      const list = raw ? JSON.parse(raw) : [];
      list.push({ q: `Journal entry (${entry.card_type || entry.type}) — ${String(entry.content || "").slice(0, 160)}`, at: new Date().toISOString() });
      sessionStorage.setItem("gp_questions", JSON.stringify(list));
      flashToast("Saved to GP notes ✓");
    } catch {/* */}
    setDetailEntry(null);
  };

  // On This Day: same cycle_day in prior cycles
  const onThisDayEntry = useMemo(() => {
    const today = todayISO();
    const cd = cycle?.cycleDay;
    if (!cd) return null;
    const prior = entries
      .filter(e => e.cycle_day === cd && entryDate(e) !== today && !e.is_burn)
      .sort((a, b) => (entryDate(b) || "").localeCompare(entryDate(a) || ""));
    return prior[0] || null;
  }, [entries, cycle]);

  // Filtered list
  const list = useMemo(() => {
    let arr = entries.filter(e => !e.is_burn || true); // burns shown at top, then normal
    if (filter !== "all") {
      arr = arr.filter(e => (filter === "burn" ? e.is_burn : (e.card_type || e.type) === filter));
    }
    const burns = arr.filter(e => e.is_burn);
    const rest  = arr.filter(e => !e.is_burn);
    return [...burns, ...rest];
  }, [entries, filter]);

  // Phase-aware empty-state copy
  const emptyCopy = useMemo(() => {
    const p = cycle?.phase || "follicular";
    const d = cycle?.cycleDay || 1;
    if (p === "luteal") return `Day ${d} of your cycle. Luteal energy is for processing. There's no pressure to write — but there might be something worth saying.`;
    if (p === "menstrual") return `Day ${d} of your cycle. The quieter days. If something wants to be said, this is a gentle place for it.`;
    if (p === "ovulatory") return `Day ${d} of your cycle. Outward energy. What's alive for you today?`;
    return `Day ${d} of your cycle. A blank page, and time.`;
  }, [cycle]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: T.cream,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: `2px solid ${T.muted}`, borderTopColor: T.gold,
          animation: "j-spin 800ms linear infinite",
        }} />
        <style>{`@keyframes j-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <JessErrorBoundary>
      <div style={{ minHeight: "100vh", background: T.cream, paddingBottom: 80 }}>
        {/* Sticky header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: T.espresso, color: T.cream,
          padding: "14px 16px 12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h1 style={{
                fontFamily: FRAUNCES, margin: 0,
                fontSize: 20, fontWeight: 700, color: T.cream, letterSpacing: -0.2,
              }}>Journal</h1>
              <div style={{ fontSize: 11, color: T.cream, opacity: 0.75, fontFamily: INTER, marginTop: 2 }}>
                {format(new Date(), "EEEE, MMM d")}{cycle?.cycleDay ? ` · Day ${cycle.cycleDay}` : ""}
              </div>
            </div>
            <button onClick={() => openWith({})} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: T.gold, color: T.espresso, border: "none",
              borderRadius: 9999, padding: "8px 14px",
              fontFamily: INTER, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              <Plus size={14} /> New entry
            </button>
          </div>

          {/* Privacy tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {[
              { id: "private", label: "Private", icon: Lock },
              { id: "shared",  label: "Shared",  icon: Users },
            ].map((tab) => {
              const active = privacyTab === tab.id;
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setPrivacyTab(tab.id)} style={{
                  flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: active ? T.gold : "transparent",
                  color: active ? T.espresso : T.cream,
                  border: `1px solid ${active ? T.gold : "rgba(244,237,219,0.30)"}`,
                  borderRadius: 9999, padding: "6px 12px",
                  fontFamily: INTER, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                }}>
                  <Icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 16px 28px" }}>
          {privacyTab === "shared" ? (
            <div style={{
              background: T.paperHi, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: "26px 18px", textAlign: "center",
            }}>
              <Users size={26} color={T.muted} />
              <h2 style={{ fontFamily: FRAUNCES, margin: "10px 0 6px", color: T.espresso, fontSize: 18 }}>
                Shared journal — coming soon
              </h2>
              <p style={{ margin: 0, fontFamily: INTER, fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
                Open Letters, the Echo wall, and Writing Club land in Phase 3.
                Private journalling stays the primary experience.
              </p>
            </div>
          ) : (
            <>
              {/* Sub tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[
                  { id: "entries",  label: "Entries",  icon: BookOpen },
                  { id: "insights", label: "Insights", icon: Sparkles },
                ].map((t) => {
                  const active = subTab === t.id;
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setSubTab(t.id)} style={{
                      flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      background: active ? T.espresso : "transparent",
                      color: active ? T.cream : T.espresso,
                      border: `1px solid ${active ? T.espresso : T.border}`,
                      borderRadius: 9999, padding: "7px 12px",
                      fontFamily: INTER, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                    }}>
                      <Icon size={12} /> {t.label}
                    </button>
                  );
                })}
              </div>

              {subTab === "entries" ? (
                <>
                  {/* Phase prompt */}
                  <JessPhasePromptCard
                    phase={cycle?.phase}
                    lifeStage={lifeStage}
                    cycleDay={cycle?.cycleDay}
                    onWrite={onPhasePromptWrite}
                  />

                  {/* Today's check-in */}
                  <TodayCheckinCard checkin={checkin} onWrite={onCheckinWrite} />

                  {/* On this day */}
                  <OnThisDayCard entry={onThisDayEntry} onReply={onReplyPastSelf} />

                  {/* Writing rhythm */}
                  <WritingRhythm entries={entries} />

                  {/* Filter chips */}
                  <FilterChips value={filter} onChange={setFilter} />

                  {/* Burn entry CTA */}
                  <button onClick={() => setBurnOpen(true)} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "transparent", color: T.amber,
                    border: `1px solid ${T.amber}`,
                    borderRadius: 9999, padding: "6px 14px",
                    fontFamily: INTER, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    marginBottom: 12,
                  }}>
                    <Flame size={12} /> Burn Mode
                  </button>

                  {/* List */}
                  {list.length === 0 ? (
                    <div style={{
                      background: T.paperHi, border: `1px solid ${T.border}`,
                      borderRadius: 14, padding: "22px 18px", textAlign: "center",
                    }}>
                      <p style={{
                        margin: 0, fontFamily: CORMORANT, fontStyle: "italic",
                        fontSize: 15.5, color: T.espresso, lineHeight: 1.5,
                      }}>{emptyCopy}</p>
                    </div>
                  ) : (
                    list.map((e) => (
                      <EntryCard
                        key={e.id}
                        entry={e}
                        onOpen={(en) => setDetailEntry(en)}
                        onReact={handleReact}
                        onBurn={handleBurnNow}
                      />
                    ))
                  )}

                  {/* Jess prompt wing (existing component) */}
                  <div style={{ marginTop: 18 }}>
                    {user && (
                      <JessJournalPrompt
                        user={user}
                        profile={profile}
                        phase={cycle?.phase}
                        lastEntry={entries[0] || null}
                        onUsePrompt={(t) => openWith({ text: t })}
                      />
                    )}
                  </div>
                </>
              ) : (
                <InsightsView entries={entries} profile={profile} onAskJess={handleAskJess} />
              )}
            </>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div role="status" style={{
            position: "fixed", left: 0, right: 0, bottom: 80,
            display: "flex", justifyContent: "center", zIndex: 110,
            pointerEvents: "none",
          }}>
            <div style={{
              background: T.espresso, color: T.cream,
              borderRadius: 9999, padding: "8px 18px",
              fontFamily: INTER, fontSize: 13, fontWeight: 600,
              boxShadow: "0 8px 22px rgba(58,44,26,0.25)",
            }}>{toast}</div>
          </div>
        )}

        {/* Composer */}
        <ComposerSheet
          open={sheetOpen}
          snap={snap}
          setSnap={setSnap}
          onClose={() => setSheetOpen(false)}
          onSubmit={handleSave}
          seedPrompt={seedPrompt}
          seedText={seedText}
          seedType={seedType}
        />

        {/* Burn composer */}
        <BurnComposer
          open={burnOpen}
          onClose={() => setBurnOpen(false)}
          onSubmit={handleSave}
        />

        {/* Detail */}
        <EntryDetailSheet
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onAskJess={handleAskJess}
          onSaveGp={handleSaveGp}
        />
      </div>
    </JessErrorBoundary>
  );
}
