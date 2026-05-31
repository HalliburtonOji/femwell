// ─────────────────────────────────────────────────────────────────────────────
// Journal.jsx — full replacement (Sprint J2)
//
// Two tabs: Entries | Insights. Reads + writes the JournalEntries entity
// (fields: text, card_type, mood_rating, tags, session_date, created_at,
// user_id, content_id, card_color, cycle_phase, cycle_day) and mirrors mood
// entries into DailyCheckins so Jess + Planner body tiles see the data.
//
// No emoji glyphs — the brand uses Cormorant Garamond + Inter + Lucide SVG
// + text marker glyphs (✦ ◆ ◎). Every "icon" in this file is a Lucide
// component or an inline SVG.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { format, parseISO, differenceInDays, subDays, startOfDay } from "date-fns";
import {
  PenLine, X, Flame, Calendar, BarChart3, RefreshCw,
  Sparkles, Hash, ChevronLeft, Tag, Save, FilePlus,
} from "lucide-react";
import { useCycleDay } from "@/hooks/useCycleDay";
import { callJessAgent, withJessPersona } from "@/services/jessAgentService";

// ════════════════════════════════════════════════════════════════════════════
// Tokens (copy of brand vars so the component is self-contained)
// ════════════════════════════════════════════════════════════════════════════
const CREAM     = "#F4EDDB";
const ESPRESSO  = "#3A2C1A";
const BLUSH     = "#E8B4B8";
const SAGE      = "#8FAF8F";
const GOLD      = "#D4AF37";
const MUTED     = "#9B8B7A";
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_UI      = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ════════════════════════════════════════════════════════════════════════════
// Constants — phase prompts, type config, theme keywords
// ════════════════════════════════════════════════════════════════════════════
const PHASE_PROMPTS = {
  menstrual:  [
    "You're in your most inward days. What does your body need you to know right now?",
    "The slowest part of the month. What feels true today that you've been too busy to hear?",
  ],
  follicular: [
    "Energy is building. What new idea or intention wants attention?",
    "You're in the bright sharp half. What's one thing you'd start if there were no obstacles?",
  ],
  ovulatory:  [
    "You're in your most outward, connected window. What feels alive in your relationships or conversations?",
    "Words land well this week. What conversation do you want to have, with whom?",
  ],
  luteal:     [
    "The editing phase. What can you let go of? What genuinely matters?",
    "The luteal half asks for refinement, not new starts. What needs tidying?",
  ],
  perimenopause: [
    "Every day holds its own texture now. What do you want to remember about today?",
    "What is your body teaching you this season that you didn't expect?",
  ],
  menopause: [
    "What does freedom look like for you now?",
    "Some chapters end and a new voice arrives. What is yours saying?",
  ],
  pregnant: [
    "Growing a person is extraordinary work. What are you noticing — in your body, your heart, your mind?",
    "What would you like to tell your future self about this stretch of time?",
  ],
  postpartum: [
    "You're in a profound transition. What are you learning about yourself right now?",
    "Today is enough. What single small thing felt like care?",
  ],
};

const TYPE_PROMPTS = {
  free:        "Write freely — this is just for you.",
  gratitude:   "List 3 things you're genuinely grateful for today — big, small, or surprising.",
  mood:        "How are you actually feeling right now — not the edited version, the honest one?",
  reflection:  "What went well today, and what would you do differently? Be kind with yourself.",
  dream:       "Capture the images, feelings, and fragments from last night before they fade.",
  affirmation: "Write an affirmation that speaks to exactly what you need to hear right now.",
};

// Type → display config. `color` is the soft-fill on chip backgrounds.
const TYPE_CONFIG = {
  free:        { label: "Free write",  color: CREAM,           text: "#3A2C1A" },
  gratitude:   { label: "Gratitude",   color: "#F4E4B8",       text: "#3A2C1A" },
  mood:        { label: "Mood",        color: "#F7DDDF",       text: "#3A2C1A" },
  reflection:  { label: "Reflection",  color: "#DDE9DD",       text: "#3A2C1A" },
  dream:       { label: "Dream",       color: "#E2D9EC",       text: "#3A2C1A" },
  affirmation: { label: "Affirmation", color: "#F5D8DA",       text: "#3A2C1A" },
};
const TYPE_ORDER = ["free", "gratitude", "mood", "reflection", "dream", "affirmation"];

const PHASE_LABEL = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
  perimenopause: "Perimenopause",
  menopause: "Menopause",
  pregnant: "Pregnancy",
  postpartum: "Postpartum",
};
const PHASE_COLOR = {
  menstrual:  BLUSH,
  follicular: SAGE,
  ovulatory:  GOLD,
  luteal:     "#C4A882",
};

// Mood emoji-shaped FACES rendered as plain Unicode geometric marks (not emoji codepoints).
// Five-point scale: 1 = lowest, 5 = highest.
const MOOD_FACES = [
  { v: 1, label: "Low",     glyph: "✕"  },
  { v: 2, label: "Off",     glyph: "◔"  },
  { v: 3, label: "Steady",  glyph: "◐"  },
  { v: 4, label: "Good",    glyph: "◑"  },
  { v: 5, label: "Bright",  glyph: "◉"  },
];

// Keywords to tally for theme cloud.
const THEME_KEYWORDS = {
  gratitude:     [/\bgratitude|grateful|thank/i],
  energy:        [/\benerg|tired|rested|fatigue/i],
  relationships: [/\bpartner|friend|family|relationship|love/i],
  sleep:         [/\bsleep|insomnia|rest|tired|woke|woken/i],
  work:          [/\bwork|job|boss|career|client|meeting/i],
  "self-care":   [/\bself.care|self care|rest|bath|walk|nourish/i],
  body:          [/\bbody|pain|ache|cramp|hormone|cycle|skin/i],
  anxiety:       [/\banxi|stress|worry|overwhelm|panic/i],
};

const ALT_PROMPT_KEYS = Object.keys(PHASE_PROMPTS);

// Get a phase prompt; alternate via tick%.
function phasePromptFor(phaseKey, tick = 0) {
  const list = PHASE_PROMPTS[phaseKey] || PHASE_PROMPTS.follicular;
  return list[tick % list.length];
}

// ════════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════════
const todayKey = () => new Date().toISOString().split("T")[0];

function previewOf(text, n = 140) {
  const s = (text || "").replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

function calcStreak(entries) {
  if (!entries.length) return 0;
  const days = new Set(
    entries
      .map((e) => e.session_date || (e.created_at && e.created_at.slice(0, 10)))
      .filter(Boolean)
  );
  let streak = 0;
  let d = startOfDay(new Date());
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (days.has(key)) {
      streak++;
      d = subDays(d, 1);
    } else if (streak === 0) {
      // allow today to be missing — still keep yesterday's streak going
      d = subDays(d, 1);
      const k2 = d.toISOString().split("T")[0];
      if (days.has(k2)) { streak++; d = subDays(d, 1); } else break;
    } else break;
  }
  return streak;
}

// "Same cycle day, previous month" lookup. Falls back to session_date - 28 days.
function findOnThisDay(entries, cycleDay) {
  if (!entries?.length) return null;
  const today = startOfDay(new Date());
  const dateLast = subDays(today, 28);
  // Match by cycle_day if present
  if (cycleDay) {
    const m = entries.find((e) => {
      if (!e.cycle_day) return false;
      const d = e.session_date ? parseISO(e.session_date) : null;
      if (!d) return false;
      return e.cycle_day === cycleDay && Math.abs(differenceInDays(today, d)) >= 21;
    });
    if (m) return m;
  }
  // Fallback: anything within ±1 day of 28-days-ago
  return entries.find((e) => {
    const d = e.session_date ? parseISO(e.session_date) : null;
    if (!d) return false;
    return Math.abs(differenceInDays(d, dateLast)) <= 1;
  }) || null;
}

function wordsIn(text) {
  return (text || "").split(/\s+/).filter(Boolean).length;
}

// ════════════════════════════════════════════════════════════════════════════
// Tiny presentational helpers (icon + label rows etc.)
// ════════════════════════════════════════════════════════════════════════════
function PhaseChip({ phase, day }) {
  if (!phase) return null;
  const color = PHASE_COLOR[phase] || MUTED;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(244,237,219,0.12)",
      padding: "3px 10px", borderRadius: 999,
      fontFamily: FONT_UI, fontSize: 10, fontWeight: 700,
      color: CREAM, letterSpacing: 0.5, textTransform: "uppercase",
    }}>
      <span aria-hidden="true" style={{
        width: 6, height: 6, borderRadius: "50%", background: color,
      }} />
      {PHASE_LABEL[phase] || phase}{day ? ` · Day ${day}` : ""}
    </span>
  );
}

function MoodDot({ value }) {
  if (!value) return null;
  const color = value <= 2 ? BLUSH : value === 3 ? "#E8DAB8" : SAGE;
  return (
    <span aria-hidden="true" style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, marginRight: 6, verticalAlign: "middle",
    }} />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Composer (full-screen bottom sheet)
// ════════════════════════════════════════════════════════════════════════════
function ComposerSheet({ open, onClose, initialType, initialPrompt, phaseKey, cycleDay, user, onSaved, showToast }) {
  const [type, setType] = useState(initialType || "free");
  const [text, setText] = useState("");
  const [mood, setMood] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setType(initialType || "free");
      setText(initialPrompt && initialType === "free" ? "" : "");
      setMood(null);
    }
  }, [open, initialType, initialPrompt]);

  const promptForType = useCallback(
    (t) => (t === "free" && phaseKey ? phasePromptFor(phaseKey) : TYPE_PROMPTS[t] || TYPE_PROMPTS.free),
    [phaseKey]
  );

  const save = async () => {
    if (!user?.id || saving) return;
    if (!text.trim() && type !== "mood") {
      showToast("Write something first");
      return;
    }
    setSaving(true);
    try {
      const date = todayKey();
      const payload = {
        user_id: user.id,
        content_id: `${type}_entry`,
        text: text.trim(),
        card_type: type,
        mood_rating: mood || undefined,
        tags: [],
        session_date: date,
        created_at: new Date().toISOString(),
        cycle_phase: phaseKey || undefined,
        cycle_day: cycleDay || undefined,
      };
      const saved = await base44.entities.JournalEntries.create(payload);

      // Mirror mood to DailyCheckins so Jess + Planner body tiles pick it up.
      if (mood && base44?.entities?.DailyCheckins) {
        try {
          const existing = await base44.entities.DailyCheckins
            .filter({ user_id: user.id, date }, "-date", 1).catch(() => []);
          if (existing?.[0]?.id) {
            await base44.entities.DailyCheckins.update(existing[0].id, { mood_score: mood }).catch(() => {});
          } else {
            await base44.entities.DailyCheckins.create({
              user_id: user.id, date, mood_score: mood,
            }).catch(() => {});
          }
        } catch (_) { /* silent — mirror is best-effort */ }
      }
      showToast("Entry saved");
      onSaved(saved);
      onClose();
    } catch (err) {
      showToast("Couldn't save — please try again");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(58,44,26,0.7)",
        zIndex: 130, display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: CREAM, width: "100%",
          borderRadius: "18px 18px 0 0",
          padding: "18px 16px 28px",
          maxHeight: "92vh", overflowY: "auto",
          paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0))",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: ESPRESSO,
          }}>New entry</div>
          <button
            onClick={onClose}
            aria-label="Close composer"
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
              color: ESPRESSO,
            }}
          ><X size={22} /></button>
        </div>

        {/* Type pills */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingBottom: 8, scrollbarWidth: "none",
          marginBottom: 14, WebkitOverflowScrolling: "touch",
        }}>
          {TYPE_ORDER.map((t) => {
            const cfg = TYPE_CONFIG[t];
            const on = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  background: on ? ESPRESSO : cfg.color,
                  color: on ? CREAM : cfg.text,
                  border: "1px solid rgba(58,44,26,0.12)",
                  borderRadius: 999, padding: "7px 14px", cursor: "pointer",
                  fontFamily: FONT_UI, fontSize: 12, fontWeight: 700,
                  letterSpacing: 0.3, whiteSpace: "nowrap", flexShrink: 0,
                }}
              >{cfg.label}</button>
            );
          })}
        </div>

        {/* Jess guided prompt */}
        <div style={{
          background: ESPRESSO, color: CREAM,
          borderRadius: 12, padding: "12px 16px", marginBottom: 14,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div aria-hidden="true" style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(212,175,55,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: GOLD, fontSize: 14, flexShrink: 0, marginTop: 2,
          }}>✦</div>
          <p style={{
            fontFamily: FONT_DISPLAY, fontSize: 16, fontStyle: "italic",
            lineHeight: 1.5, color: CREAM, margin: 0,
          }}>{promptForType(type)}</p>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write freely — this is just for you…"
          autoFocus
          rows={8}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#FAF5E8",
            border: "1px solid rgba(58,44,26,0.15)",
            borderRadius: 10, padding: "14px 14px",
            fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: 1.7, color: ESPRESSO,
            resize: "vertical", minHeight: 180, outline: "none",
            marginBottom: 14,
          }}
        />

        {/* Mood selector */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
        }}>
          <span style={{
            fontFamily: FONT_UI, fontSize: 11, fontWeight: 700,
            color: MUTED, letterSpacing: 1, textTransform: "uppercase",
            flexShrink: 0,
          }}>Mood</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MOOD_FACES.map((m) => {
              const on = mood === m.v;
              return (
                <button
                  key={m.v}
                  onClick={() => setMood(on ? null : m.v)}
                  aria-label={`Mood: ${m.label}`}
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: on ? BLUSH : "rgba(58,44,26,0.04)",
                    border: `1px solid ${on ? BLUSH : "rgba(58,44,26,0.15)"}`,
                    cursor: "pointer",
                    fontSize: 18, lineHeight: 1, color: on ? ESPRESSO : MUTED,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >{m.glyph}</button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: "100%", padding: "14px 16px",
            background: ESPRESSO, color: CREAM,
            border: "1px solid " + GOLD, borderRadius: 12,
            cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1,
            fontFamily: FONT_UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.3,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Save size={16} /> {saving ? "Saving…" : "Save entry"}
        </button>

        {/* Compliance micro-text */}
        <div style={{
          marginTop: 12, fontFamily: FONT_UI, fontSize: 10,
          color: MUTED, fontStyle: "italic", textAlign: "center",
        }}>
          Your journal is private — not medical advice.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Entry detail (read-only)
// ════════════════════════════════════════════════════════════════════════════
function EntryDetailSheet({ entry, onClose }) {
  if (!entry) return null;
  const cfg = TYPE_CONFIG[entry.card_type] || TYPE_CONFIG.free;
  const dateStr = entry.session_date
    ? format(parseISO(entry.session_date), "EEEE, d MMMM yyyy")
    : entry.created_at
      ? format(new Date(entry.created_at), "EEEE, d MMMM yyyy")
      : "";
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(58,44,26,0.7)",
      zIndex: 130, display: "flex", alignItems: "flex-end",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: CREAM, width: "100%",
        borderRadius: "18px 18px 0 0", padding: "18px 18px 24px",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 10,
        }}>
          <button onClick={onClose} aria-label="Back" style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            color: ESPRESSO, display: "inline-flex", alignItems: "center", gap: 4,
            fontFamily: FONT_UI, fontSize: 13, fontWeight: 600,
          }}><ChevronLeft size={18}/> Back</button>
          <span style={{
            background: cfg.color, color: cfg.text,
            padding: "3px 10px", borderRadius: 999,
            fontFamily: FONT_UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          }}>{cfg.label}</span>
        </div>
        <div style={{
          fontFamily: FONT_UI, fontSize: 11, color: MUTED, letterSpacing: 0.5,
          marginBottom: 10,
        }}>{dateStr}</div>
        {entry.mood_rating && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: BLUSH, padding: "3px 10px", borderRadius: 999,
            fontFamily: FONT_UI, fontSize: 11, fontWeight: 700, color: ESPRESSO,
            marginBottom: 10,
          }}>
            Mood: {MOOD_FACES.find((m) => m.v === entry.mood_rating)?.label || entry.mood_rating}
          </div>
        )}
        {entry.cycle_phase && (
          <div style={{ marginBottom: 12 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(58,44,26,0.06)",
              padding: "3px 10px", borderRadius: 999,
              fontFamily: FONT_UI, fontSize: 10, fontWeight: 700, color: ESPRESSO,
              letterSpacing: 0.5, textTransform: "uppercase",
            }}>
              <span aria-hidden="true" style={{
                width: 6, height: 6, borderRadius: "50%",
                background: PHASE_COLOR[entry.cycle_phase] || MUTED,
              }}/>
              {PHASE_LABEL[entry.cycle_phase] || entry.cycle_phase}
              {entry.cycle_day ? ` · Day ${entry.cycle_day}` : ""}
            </span>
          </div>
        )}
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: 1.8,
          color: ESPRESSO, whiteSpace: "pre-wrap", margin: 0,
        }}>{entry.text}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Entries tab pieces
// ════════════════════════════════════════════════════════════════════════════
function JessPhasePromptCard({ phaseKey, cycleDay, tick, onWrite, onCycle }) {
  const prompt = phasePromptFor(phaseKey || "follicular", tick);
  return (
    <div style={{
      background: ESPRESSO, color: CREAM,
      borderRadius: 14, padding: "16px 18px", marginBottom: 14,
      border: "1px solid " + GOLD,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div aria-hidden="true" style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(212,175,55,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: GOLD,
          }}>✦</div>
          <div>
            <div style={{
              fontFamily: FONT_UI, fontSize: 11, fontWeight: 700,
              color: GOLD, letterSpacing: 1.5, textTransform: "uppercase",
            }}>Jess</div>
            <div style={{
              fontFamily: FONT_UI, fontSize: 10, color: "rgba(244,237,219,0.6)",
              letterSpacing: 0.3,
            }}>Phase-aware prompt</div>
          </div>
        </div>
        <PhaseChip phase={phaseKey} day={cycleDay} />
      </div>
      <p style={{
        fontFamily: FONT_DISPLAY, fontSize: 18, fontStyle: "italic",
        lineHeight: 1.5, color: CREAM, margin: "8px 0 16px",
      }}>{prompt}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onWrite(prompt)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: GOLD, color: ESPRESSO, border: "none",
            borderRadius: 999, padding: "9px 16px",
            fontFamily: FONT_UI, fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: 0.3,
          }}
        >
          Write to this <span aria-hidden="true">✦</span>
        </button>
        <button
          onClick={onCycle}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", color: CREAM,
            border: "1px solid rgba(244,237,219,0.3)",
            borderRadius: 999, padding: "9px 14px",
            fontFamily: FONT_UI, fontSize: 12, fontWeight: 600,
            cursor: "pointer", letterSpacing: 0.3,
          }}
        >
          <RefreshCw size={13} /> Different prompt
        </button>
      </div>
    </div>
  );
}

function OnThisDayCard({ entry, onOpen }) {
  if (!entry) return null;
  const cfg = TYPE_CONFIG[entry.card_type] || TYPE_CONFIG.free;
  return (
    <button
      onClick={() => onOpen(entry)}
      style={{
        display: "block", width: "100%", textAlign: "left",
        background: "linear-gradient(135deg, rgba(232,180,184,0.18), rgba(232,180,184,0.08))",
        border: "1px solid rgba(232,180,184,0.5)",
        borderRadius: 12, padding: "14px 16px", marginBottom: 12,
        cursor: "pointer",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
      }}>
        <Calendar size={14} color={ESPRESSO} />
        <span style={{
          fontFamily: FONT_UI, fontSize: 10, fontWeight: 700,
          color: ESPRESSO, letterSpacing: 1.5, textTransform: "uppercase",
        }}>
          On this day{entry.cycle_day ? ` · Day ${entry.cycle_day}` : ""}
        </span>
      </div>
      <p style={{
        fontFamily: FONT_DISPLAY, fontSize: 16, fontStyle: "italic",
        color: ESPRESSO, lineHeight: 1.5, margin: "0 0 6px",
      }}>{previewOf(entry.text, 120)}</p>
      <div style={{
        fontFamily: FONT_UI, fontSize: 10, color: MUTED, letterSpacing: 0.5,
      }}>
        {entry.session_date ? format(parseISO(entry.session_date), "d MMMM yyyy") : ""} · {cfg.label}
      </div>
    </button>
  );
}

function StreakBanner({ streak }) {
  if (!streak || streak < 2) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.08))",
      border: "1px solid rgba(212,175,55,0.4)",
      borderRadius: 12, padding: "12px 16px", marginBottom: 12,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <Flame size={20} color={GOLD} />
      <div>
        <div style={{
          fontFamily: FONT_UI, fontSize: 13, fontWeight: 700, color: ESPRESSO,
        }}>{streak}-day writing streak</div>
        <div style={{
          fontFamily: FONT_UI, fontSize: 11, color: MUTED, marginTop: 2,
        }}>You've written every day{streak >= 7 ? " this week" : ""}.</div>
      </div>
    </div>
  );
}

function FilterChips({ filter, setFilter }) {
  const opts = [{ id: "all", label: "All" }, ...TYPE_ORDER.map((t) => ({ id: t, label: TYPE_CONFIG[t].label }))];
  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto",
      paddingBottom: 8, scrollbarWidth: "none",
      marginBottom: 14, WebkitOverflowScrolling: "touch",
    }}>
      {opts.map((o) => {
        const on = filter === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setFilter(o.id)}
            style={{
              background: on ? ESPRESSO : "rgba(58,44,26,0.06)",
              color: on ? CREAM : ESPRESSO,
              border: "1px solid rgba(58,44,26,0.15)",
              borderRadius: 999, padding: "6px 14px",
              fontFamily: FONT_UI, fontSize: 12, fontWeight: 600,
              cursor: "pointer", letterSpacing: 0.3, whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >{o.label}</button>
        );
      })}
    </div>
  );
}

function EntryRow({ entry, onOpen }) {
  const cfg = TYPE_CONFIG[entry.card_type] || TYPE_CONFIG.free;
  const time = entry.created_at
    ? format(new Date(entry.created_at), "HH:mm")
    : "";
  const moodLabel = entry.mood_rating
    ? MOOD_FACES.find((m) => m.v === entry.mood_rating)?.label
    : null;
  return (
    <button
      onClick={() => onOpen(entry)}
      style={{
        display: "block", width: "100%", textAlign: "left",
        background: "#FAF5E8",
        border: "1px solid rgba(58,44,26,0.1)",
        borderRadius: 12, padding: "14px 16px", marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{
          background: cfg.color, color: cfg.text,
          padding: "2px 9px", borderRadius: 999,
          fontFamily: FONT_UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        }}>{cfg.label}</span>
        <span style={{
          fontFamily: FONT_UI, fontSize: 10, color: MUTED, letterSpacing: 0.3,
        }}>
          {entry.session_date ? format(parseISO(entry.session_date), "d MMM") : ""}{time ? ` · ${time}` : ""}
        </span>
      </div>
      <p style={{
        fontFamily: FONT_DISPLAY, fontSize: 17, lineHeight: 1.5,
        color: ESPRESSO, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{previewOf(entry.text, 160)}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        {moodLabel && (
          <span style={{
            fontFamily: FONT_UI, fontSize: 11, color: MUTED, fontWeight: 600,
          }}>
            <MoodDot value={entry.mood_rating} /> {moodLabel}
          </span>
        )}
        {entry.cycle_phase && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: FONT_UI, fontSize: 11, color: MUTED, fontWeight: 600,
          }}>
            <span aria-hidden="true" style={{
              width: 6, height: 6, borderRadius: "50%",
              background: PHASE_COLOR[entry.cycle_phase] || MUTED,
            }}/>
            {PHASE_LABEL[entry.cycle_phase] || entry.cycle_phase}
          </span>
        )}
      </div>
    </button>
  );
}

function EmptyEntries({ onWrite }) {
  return (
    <div style={{
      background: "#FAF5E8",
      border: "1px solid rgba(58,44,26,0.1)",
      borderRadius: 12, padding: "24px 18px", textAlign: "center",
    }}>
      <p style={{
        fontFamily: FONT_DISPLAY, fontSize: 17, fontStyle: "italic",
        color: ESPRESSO, lineHeight: 1.5, margin: "0 0 12px",
      }}>
        Your journal starts here. Even a single sentence counts.
      </p>
      <button
        onClick={onWrite}
        style={{
          background: GOLD, color: ESPRESSO, border: "none",
          borderRadius: 999, padding: "9px 16px",
          fontFamily: FONT_UI, fontSize: 13, fontWeight: 700,
          cursor: "pointer", letterSpacing: 0.3,
        }}
      >Write your first entry</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Insights tab pieces
// ════════════════════════════════════════════════════════════════════════════
function JessNoticedCard({ entries }) {
  const summary = useMemo(() => {
    if (entries.length < 5) return null;
    // Phase tally
    const phases = {};
    entries.forEach((e) => { if (e.cycle_phase) phases[e.cycle_phase] = (phases[e.cycle_phase] || 0) + 1; });
    const topPhase = Object.entries(phases).sort((a,b) => b[1]-a[1])[0];
    // Avg mood
    const moods = entries.map((e) => e.mood_rating).filter((m) => typeof m === "number");
    const avg = moods.length ? moods.reduce((a,b)=>a+b,0) / moods.length : null;
    // Top type
    const types = {};
    entries.forEach((e) => { if (e.card_type) types[e.card_type] = (types[e.card_type] || 0) + 1; });
    const topType = Object.entries(types).sort((a,b) => b[1]-a[1])[0];
    return { topPhase, avg, topType };
  }, [entries]);

  return (
    <div style={{
      background: ESPRESSO, color: CREAM,
      borderRadius: 12, padding: "16px 18px", marginBottom: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
        paddingBottom: 10, borderBottom: "1px solid rgba(212,175,55,0.2)",
      }}>
        <div aria-hidden="true" style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(212,175,55,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: GOLD, fontSize: 14, flexShrink: 0,
        }}>✦</div>
        <div>
          <div style={{
            fontFamily: FONT_UI, fontSize: 12, fontWeight: 700,
            color: GOLD, letterSpacing: 0.5,
          }}>Jess noticed</div>
          <div style={{
            fontFamily: FONT_UI, fontSize: 10, color: "rgba(244,237,219,0.6)",
          }}>Your writing patterns tell a story across your cycle</div>
        </div>
      </div>
      {!summary ? (
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 16, fontStyle: "italic",
          color: CREAM, lineHeight: 1.6, margin: 0,
        }}>
          Write a few more entries and I'll start noticing patterns in your writing.
        </p>
      ) : (
        <>
          {summary.topPhase && (
            <Observation text={`You write most often during your ${PHASE_LABEL[summary.topPhase[0]] || summary.topPhase[0]} phase (${summary.topPhase[1]} of ${entries.length} entries).`} />
          )}
          {typeof summary.avg === "number" && (
            <Observation text={`Your average mood across logged entries is ${summary.avg.toFixed(1)} / 5 — ${summary.avg >= 3.5 ? "you're trending steady to bright." : summary.avg >= 2.5 ? "a tender, mixed picture." : "a season worth noticing and being gentle with."}`} />
          )}
          {summary.topType && (
            <Observation text={`You return most often to ${TYPE_CONFIG[summary.topType[0]]?.label?.toLowerCase() || summary.topType[0]} entries. That's a useful tell.`} last />
          )}
        </>
      )}
    </div>
  );
}
function Observation({ text, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      marginBottom: last ? 0 : 10,
    }}>
      <span aria-hidden="true" style={{ color: GOLD, fontSize: 14, marginTop: 3 }}>◆</span>
      <p style={{
        fontFamily: FONT_DISPLAY, fontSize: 15, lineHeight: 1.6,
        color: CREAM, fontStyle: "italic", margin: 0,
      }}>{text}</p>
    </div>
  );
}

function WritingRhythm({ entries }) {
  const days = useMemo(() => {
    const out = [];
    const today = startOfDay(new Date());
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const key = d.toISOString().split("T")[0];
      const dayEntries = entries.filter((e) => (e.session_date || (e.created_at && e.created_at.slice(0,10))) === key);
      const words = dayEntries.reduce((a, e) => a + wordsIn(e.text), 0);
      out.push({ key, dow: format(d, "EEEEE"), words, hasEntry: dayEntries.length > 0, isToday: i === 0 });
    }
    return out;
  }, [entries]);
  const maxWords = Math.max(20, ...days.map((d) => d.words));
  const streak = calcStreak(entries);
  const weekEntries = entries.filter((e) => {
    const k = e.session_date || (e.created_at && e.created_at.slice(0,10));
    return days.some((d) => d.key === k);
  }).length;
  return (
    <div style={{
      background: "#FAF5E8",
      border: "1px solid rgba(58,44,26,0.1)",
      borderRadius: 12, padding: "14px 16px", marginBottom: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      }}>
        <BarChart3 size={14} color={ESPRESSO} />
        <span style={{
          fontFamily: FONT_UI, fontSize: 11, fontWeight: 700,
          color: ESPRESSO, letterSpacing: 1.5, textTransform: "uppercase",
        }}>Writing rhythm — last 7 days</span>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        alignItems: "end", gap: 6, height: 80, marginBottom: 8,
      }}>
        {days.map((d) => {
          const h = d.hasEntry ? Math.max(12, (d.words / maxWords) * 70) : 4;
          return (
            <div key={d.key} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              justifyContent: "flex-end", height: "100%",
            }}>
              <div style={{
                width: "70%", height: h, borderRadius: 4,
                background: !d.hasEntry ? "rgba(58,44,26,0.08)" : d.isToday ? GOLD : ESPRESSO,
              }} title={`${d.words} words`} />
            </div>
          );
        })}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 14,
      }}>
        {days.map((d) => (
          <span key={d.key} style={{
            textAlign: "center", fontFamily: FONT_UI, fontSize: 10,
            color: d.isToday ? ESPRESSO : MUTED, fontWeight: d.isToday ? 700 : 500,
          }}>{d.dow}</span>
        ))}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12, paddingTop: 12, borderTop: "1px solid rgba(58,44,26,0.08)",
      }}>
        <Stat n={streak} l="Day streak" />
        <Stat n={weekEntries} l="This week" />
        <Stat n={entries.length} l="Total entries" />
      </div>
    </div>
  );
}
function Stat({ n, l }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: ESPRESSO,
      }}>{n}</div>
      <div style={{
        fontFamily: FONT_UI, fontSize: 10, color: MUTED,
        textTransform: "uppercase", letterSpacing: 0.5,
      }}>{l}</div>
    </div>
  );
}

function MoodAcrossCycle({ entries }) {
  const data = useMemo(() => {
    const phaseList = ["menstrual", "follicular", "ovulatory", "luteal"];
    return phaseList.map((p) => {
      const subset = entries.filter((e) => e.cycle_phase === p && typeof e.mood_rating === "number");
      const avg = subset.length ? subset.reduce((a, e) => a + e.mood_rating, 0) / subset.length : null;
      return { phase: p, avg, n: subset.length };
    });
  }, [entries]);
  const hasData = data.some((d) => d.avg !== null);
  return (
    <div style={{
      background: "#FAF5E8",
      border: "1px solid rgba(58,44,26,0.1)",
      borderRadius: 12, padding: "14px 16px", marginBottom: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      }}>
        <RefreshCw size={14} color={ESPRESSO} />
        <span style={{
          fontFamily: FONT_UI, fontSize: 11, fontWeight: 700,
          color: ESPRESSO, letterSpacing: 1.5, textTransform: "uppercase",
        }}>Mood across your cycle</span>
      </div>
      {!hasData ? (
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 15, fontStyle: "italic",
          color: MUTED, margin: 0, lineHeight: 1.5,
        }}>Log a few entries with mood tags to unlock this.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.map((d) => (
            <div key={d.phase} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 90, fontFamily: FONT_UI, fontSize: 11, fontWeight: 600, color: ESPRESSO,
              }}>{PHASE_LABEL[d.phase]}</span>
              <div style={{ flex: 1, height: 12, background: "rgba(58,44,26,0.06)", borderRadius: 6, overflow: "hidden" }}>
                {d.avg !== null && (
                  <div style={{
                    width: `${(d.avg / 5) * 100}%`, height: "100%",
                    background: PHASE_COLOR[d.phase],
                  }} />
                )}
              </div>
              <span style={{
                width: 36, textAlign: "right", fontFamily: FONT_UI, fontSize: 11,
                color: MUTED, fontWeight: 600,
              }}>{d.avg !== null ? d.avg.toFixed(1) : "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JessPatternInsight({ entries, onSaveForGp }) {
  const insight = useMemo(() => {
    if (entries.length < 8) return null;
    const phaseList = ["menstrual", "follicular", "ovulatory", "luteal"];
    const avgs = phaseList.map((p) => {
      const subset = entries.filter((e) => e.cycle_phase === p && typeof e.mood_rating === "number");
      return { p, avg: subset.length >= 2 ? subset.reduce((a, e) => a + e.mood_rating, 0) / subset.length : null };
    }).filter((x) => x.avg !== null).sort((a,b) => a.avg - b.avg);
    if (!avgs.length) return null;
    const lowest = avgs[0];
    return `Looking across your entries, mood reads lowest during the ${PHASE_LABEL[lowest.p]} phase (${lowest.avg.toFixed(1)} / 5). That's worth noticing — and worth bringing to a GP conversation if it persists for a few months.`;
  }, [entries]);
  if (!insight) return null;
  return (
    <div style={{
      background: ESPRESSO, color: CREAM,
      borderRadius: 12, padding: "16px 18px", marginBottom: 14,
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: GOLD, color: ESPRESSO,
        padding: "3px 10px", borderRadius: 999,
        fontFamily: FONT_UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        marginBottom: 10,
      }}>
        <span aria-hidden="true">✦</span> Jess pattern insight
      </div>
      <p style={{
        fontFamily: FONT_DISPLAY, fontSize: 16, lineHeight: 1.6, color: CREAM,
        fontStyle: "italic", margin: "0 0 12px",
      }}>{insight}</p>
      <button
        onClick={() => onSaveForGp(insight)}
        style={{
          background: "transparent", color: GOLD,
          border: "1px solid " + GOLD, borderRadius: 999,
          padding: "7px 14px",
          fontFamily: FONT_UI, fontSize: 12, fontWeight: 600,
          cursor: "pointer", letterSpacing: 0.3,
        }}
      >Save for GP conversation</button>
    </div>
  );
}

function WeeklyReflection({ entries, profile, phaseKey }) {
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const recent = useMemo(() => entries.slice(0, 7), [entries]);
  const generate = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      const snippets = recent.map((e) => `- ${e.session_date || ""}: ${previewOf(e.text, 160)}`).join("\n");
      const user = `Here are this week's journal entries:\n${snippets}\n\nWrite a 2–3 sentence warm reflection summary in the second person, no medical advice, no diagnoses. Acknowledge the writing itself as an act of care.`;
      const system = withJessPersona("You're summarising the user's recent journal entries. Be warm, brief, specific, and supportive. 2–3 sentences only.", profile);
      const res = await callJessAgent({ system, user });
      if (res?.text) setOut(res.text);
      else setErr(true);
    } catch (_) { setErr(true); }
    setLoading(false);
  }, [recent, profile]);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(212,175,55,0.14), rgba(212,175,55,0.04))",
      border: "1px solid rgba(212,175,55,0.4)",
      borderRadius: 12, padding: "16px 18px", marginBottom: 14,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{
          fontFamily: FONT_UI, fontSize: 11, fontWeight: 700,
          color: GOLD, letterSpacing: 1, textTransform: "uppercase",
        }}>Weekly reflection</div>
        <button
          onClick={generate}
          disabled={loading || recent.length === 0}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: ESPRESSO, color: CREAM, border: "1px solid " + GOLD,
            borderRadius: 999, padding: "6px 14px",
            fontFamily: FONT_UI, fontSize: 12, fontWeight: 700,
            cursor: (loading || recent.length === 0) ? "wait" : "pointer",
            opacity: (loading || recent.length === 0) ? 0.6 : 1,
            letterSpacing: 0.3,
          }}
        >
          <Sparkles size={13}/> {loading ? "Thinking…" : out ? "Regenerate" : "Generate"}
        </button>
      </div>
      {recent.length === 0 ? (
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 15, fontStyle: "italic",
          color: MUTED, lineHeight: 1.6, margin: 0,
        }}>Write a few entries this week and I'll reflect them back to you.</p>
      ) : out ? (
        <>
          <p style={{
            fontFamily: FONT_DISPLAY, fontSize: 16, fontStyle: "italic",
            color: ESPRESSO, lineHeight: 1.7, margin: 0,
          }}>{out}</p>
          <div style={{
            marginTop: 8, fontFamily: FONT_UI, fontSize: 10,
            color: MUTED, fontStyle: "italic",
          }}>Not medical advice — a kind summary of your writing.</div>
        </>
      ) : err ? (
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 15, fontStyle: "italic",
          color: ESPRESSO, lineHeight: 1.6, margin: 0,
        }}>This week you showed up and wrote. That is enough.</p>
      ) : (
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 15, fontStyle: "italic",
          color: MUTED, lineHeight: 1.6, margin: 0,
        }}>Tap Generate to read this week's entries back as a kind summary.</p>
      )}
    </div>
  );
}

function EntryThemes({ entries }) {
  const top = useMemo(() => {
    const counts = {};
    Object.keys(THEME_KEYWORDS).forEach((k) => { counts[k] = 0; });
    entries.forEach((e) => {
      const t = e.text || "";
      Object.entries(THEME_KEYWORDS).forEach(([k, regexes]) => {
        if (regexes.some((rx) => rx.test(t))) counts[k]++;
      });
    });
    return Object.entries(counts).filter(([,n]) => n > 0).sort((a,b) => b[1]-a[1]).slice(0, 6);
  }, [entries]);
  if (entries.length === 0) return null;
  return (
    <div style={{
      background: "#FAF5E8",
      border: "1px solid rgba(58,44,26,0.1)",
      borderRadius: 12, padding: "14px 16px", marginBottom: 14,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      }}>
        <Tag size={14} color={ESPRESSO} />
        <span style={{
          fontFamily: FONT_UI, fontSize: 11, fontWeight: 700,
          color: ESPRESSO, letterSpacing: 1.5, textTransform: "uppercase",
        }}>Most common themes</span>
      </div>
      {top.length === 0 ? (
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 15, fontStyle: "italic",
          color: MUTED, lineHeight: 1.6, margin: 0,
        }}>Patterns will appear once you've written about a few topics.</p>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {top.map(([theme, n]) => (
              <span key={theme} style={{
                background: CREAM, color: ESPRESSO,
                border: "1px solid rgba(58,44,26,0.1)",
                padding: "5px 12px", borderRadius: 999,
                fontFamily: FONT_UI, fontSize: 12, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <Hash size={10}/>{theme}
                <span style={{ color: MUTED, fontSize: 11, fontWeight: 500 }}>{n}</span>
              </span>
            ))}
          </div>
          <div style={{
            marginTop: 10, fontFamily: FONT_UI, fontSize: 10, color: MUTED,
          }}>AI-extracted from your {entries.length} entr{entries.length === 1 ? "y" : "ies"}.</div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
export default function Journal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("entries");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialType, setComposerInitialType] = useState("free");
  const [detailEntry, setDetailEntry] = useState(null);
  const [promptTick, setPromptTick] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((text) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  // Load user + profile + entries
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      if (!u?.id) { setLoading(false); return; }
      setUser(u);
      const [profiles, list] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        base44.entities.JournalEntries
          .filter({ user_id: u.id }, "-created_at", 200)
          .catch(() => []),
      ]);
      setProfile(profiles?.[0] || u);
      setEntries(Array.isArray(list) ? list : []);
    } catch (_) { /* network/auth */ }
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  // Phase + cycle day from existing hook
  const cycle = useCycleDay(profile);
  let phaseKey = cycle?.phase || "follicular";
  const lifeStage = profile?.life_stage;
  if (lifeStage && PHASE_PROMPTS[lifeStage]) phaseKey = lifeStage;
  const cycleDay = cycle?.cycleDay || cycle?.dayInCycle || null;
  const dateLabel = useMemo(() => format(new Date(), "EEEE, d MMMM"), []);

  // Filtered list
  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.card_type === filter);
  }, [entries, filter]);

  // On-this-day
  const onThisDay = useMemo(() => findOnThisDay(entries, cycleDay), [entries, cycleDay]);

  // Streak
  const streak = useMemo(() => calcStreak(entries), [entries]);

  // GP save (mirrors the Health page wiring — sessionStorage list)
  const saveForGp = useCallback((text) => {
    try {
      const existing = JSON.parse(window.sessionStorage.getItem("gp_questions") || "[]");
      if (existing.some((q) => q.text === text)) {
        showToast("Already on your GP list");
        return;
      }
      existing.push({
        text, sectionTitle: "Jess pattern insight",
        letterTitle: "Journal", savedAt: new Date().toISOString(),
      });
      window.sessionStorage.setItem("gp_questions", JSON.stringify(existing));
      showToast("Saved for your GP list");
    } catch (_) { /* private mode */ }
  }, [showToast]);

  // Composer open
  const openComposer = useCallback((type = "free") => {
    setComposerInitialType(type);
    setComposerOpen(true);
  }, []);

  return (
    <div className="journal-page" style={{
      background: CREAM, minHeight: "100vh", paddingBottom: 96,
      touchAction: "manipulation",
    }}>
      <style>{`
        .journal-page * { -webkit-tap-highlight-color: transparent; }
        .journal-page button, .journal-page a { touch-action: manipulation; }
      `}</style>

      {/* ─── Sticky header ─── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: ESPRESSO, color: CREAM,
        padding: "12px 16px 10px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, lineHeight: 1.1,
              color: CREAM,
            }}>Journal</div>
            <div style={{
              fontFamily: FONT_UI, fontSize: 11, color: "rgba(244,237,219,0.65)",
              marginTop: 2, letterSpacing: 0.3,
            }}>
              {dateLabel}{cycleDay ? ` · Cycle day ${cycleDay}` : ""}
            </div>
          </div>
          <button
            onClick={() => openComposer("free")}
            aria-label="Start a new journal entry"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: GOLD, color: ESPRESSO, border: "none",
              borderRadius: 999, padding: "8px 14px",
              fontFamily: FONT_UI, fontSize: 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.3, flexShrink: 0,
            }}
          >
            <PenLine size={14}/> New entry
          </button>
        </div>

        {/* Tab strip */}
        <div style={{
          display: "flex", gap: 4, marginTop: 12,
        }}>
          {[{id: "entries", label: "Entries"}, {id: "insights", label: "Insights"}].map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, background: "none", border: "none",
                  borderBottom: on ? "2px solid " + GOLD : "2px solid transparent",
                  padding: "8px 4px",
                  fontFamily: FONT_UI, fontSize: 13,
                  fontWeight: on ? 700 : 500,
                  color: on ? CREAM : "rgba(244,237,219,0.6)",
                  cursor: "pointer", letterSpacing: 0.3,
                }}
              >{t.label}</button>
            );
          })}
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 14px 16px" }}>
        {tab === "entries" && (
          <>
            <JessPhasePromptCard
              phaseKey={phaseKey}
              cycleDay={cycleDay}
              tick={promptTick}
              onWrite={(prompt) => openComposer("free")}
              onCycle={() => setPromptTick((t) => t + 1)}
            />
            <OnThisDayCard entry={onThisDay} onOpen={setDetailEntry} />
            <StreakBanner streak={streak} />
            <FilterChips filter={filter} setFilter={setFilter} />
            {loading ? (
              <div style={{
                background: "#FAF5E8", borderRadius: 12, padding: "30px 18px",
                textAlign: "center", color: MUTED,
                fontFamily: FONT_UI, fontSize: 13,
              }}>Loading your journal…</div>
            ) : filtered.length === 0 ? (
              <EmptyEntries onWrite={() => openComposer("free")} />
            ) : (
              filtered.map((e) => (
                <EntryRow key={e.id} entry={e} onOpen={setDetailEntry} />
              ))
            )}
          </>
        )}

        {tab === "insights" && (
          <>
            <JessNoticedCard entries={entries} />
            <WritingRhythm entries={entries} />
            <MoodAcrossCycle entries={entries} />
            <JessPatternInsight entries={entries} onSaveForGp={saveForGp} />
            <WeeklyReflection entries={entries} profile={profile} phaseKey={phaseKey} />
            <EntryThemes entries={entries} />
          </>
        )}
      </div>

      {/* Composer */}
      <ComposerSheet
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialType={composerInitialType}
        initialPrompt={phasePromptFor(phaseKey, promptTick)}
        phaseKey={phaseKey}
        cycleDay={cycleDay}
        user={user}
        showToast={showToast}
        onSaved={() => { refresh(); }}
      />

      {/* Detail */}
      <EntryDetailSheet entry={detailEntry} onClose={() => setDetailEntry(null)} />

      {/* Toast */}
      {toast && (
        <div role="status" style={{
          position: "fixed", bottom: 110, left: "50%",
          transform: "translateX(-50%)",
          background: ESPRESSO, color: CREAM,
          padding: "10px 18px", borderRadius: 999,
          fontFamily: FONT_UI, fontSize: 13, fontWeight: 600, letterSpacing: 0.3,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          zIndex: 140,
        }}>{toast} <span aria-hidden="true" style={{ marginLeft: 4 }}>✓</span></div>
      )}
    </div>
  );
}
