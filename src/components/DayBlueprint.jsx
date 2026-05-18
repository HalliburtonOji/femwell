// ─────────────────────────────────────────────────────────────────────────────
// DayBlueprint — Future-day flow for "Plan a day". 4-card guided session
// (predict phase → set intentions → self-care defaults → confirm) used when
// the user picks a date OTHER than today from the day picker step.
//
// Mirrors MorningBrief's card shell, but:
//   · Phase + capacity are PREDICTED for the chosen date, not pulled from today
//   · Intention card writes PlannerItems dated <future-date>, isAnchor=true
//   · Self-care defaults seed phase-matched habits as PlannerItems
//   · Confirmation summarises what was scheduled and dismisses the sheet
//
// Founder note: this lives in MorningBrief.jsx territory (same bottom sheet),
// but is its own component so the today/future flows stay decoupled — the
// today flow stays the 7-card "Plan today" ritual; the future flow is the
// shorter 4-card "blueprint".
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Star, Sun, Moon, Calendar, Heart, Zap, Activity,
  Plus, X, ArrowRight, CheckCircle2, Anchor, Coffee, Bed,
} from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  paper:    "#FFFFFF",
  espresso: "#3A2C1A",
  plum:     "#4A2A3A",
  blush:    "#E8B4B8",
  blushSoft:"rgba(232,180,184,0.18)",
  sage:     "#8FAF8F",
  sageSoft: "rgba(143,175,143,0.18)",
  gold:     "#D4AF37",
  goldSoft: "rgba(212,175,55,0.18)",
  muted:    "#9B8B7A",
  rose:     "#D45E52",
};

// ── Phase derivation for a future date ─────────────────────────────────────
function predictPhaseForDate(targetDateISO, profile) {
  const last = profile?.last_period_start_date;
  const cycleLen = profile?.cycle_avg_length || 28;
  const periodLen = profile?.period_length || 5;
  if (!last) {
    return { phase: "follicular", day: null, capacity: 65, confidence: "low" };
  }
  try {
    const t = new Date(targetDateISO);
    const l = new Date(last);
    const diff = Math.floor((t - l) / 86400000);
    if (diff < 0) return { phase: "luteal", day: null, capacity: 50 };
    const day = (diff % cycleLen) + 1;
    let phase = "follicular";
    if (day <= periodLen) phase = "menstrual";
    else if (day <= Math.round(cycleLen * 0.4)) phase = "follicular";
    else if (day <= Math.round(cycleLen * 0.55)) phase = "ovulatory";
    else phase = "luteal";
    const capacity = phase === "follicular" ? 71
                    : phase === "ovulatory"  ? 78
                    : phase === "luteal"     ? day > (cycleLen - 3) ? 38 : 58
                    : 42;
    return { phase, day, capacity, confidence: "medium" };
  } catch {
    return { phase: "follicular", day: null, capacity: 65, confidence: "low" };
  }
}

// ── Phase insight copy ─────────────────────────────────────────────────────
const PHASE_INSIGHT = {
  menstrual:  "Rest-leaning. Honour the slow. Anchor the essentials and let everything else breathe.",
  follicular: "Rising energy. Good for new starts, creative work, social commitments.",
  ovulatory:  "Peak. Best for high-stakes meetings, public speaking, decisive moves.",
  luteal:     "Wind-down. Close loops, finish drafts, protect the morning, lighten the afternoon.",
};

// ── Phase-matched intention suggestions ───────────────────────────────────
const PHASE_SUGGESTIONS = {
  menstrual:  ["Take a slow morning", "Reschedule the heavy meeting", "Cancel one social thing"],
  follicular: ["Start something new", "Plan a social event", "Creative project"],
  ovulatory:  ["Big conversation", "Pitch the idea", "Take a stage moment"],
  luteal:     ["Close a loop", "Finish a draft", "Tidy + admin batch"],
};

// ── Phase-matched self-care defaults ──────────────────────────────────────
const PHASE_CARE = {
  menstrual:  [
    { title: "Heat on belly · 10 min", time: "evening" },
    { title: "Warm cooked breakfast",  time: "morning" },
    { title: "Lights low by 9pm",       time: "evening" },
  ],
  follicular: [
    { title: "Morning movement · 30 min", time: "morning" },
    { title: "Hydrate well",               time: "morning" },
    { title: "Wind-down by 10pm",          time: "evening" },
  ],
  ovulatory:  [
    { title: "Strength or run · 30 min",   time: "morning" },
    { title: "2L water",                    time: "morning" },
    { title: "Get sunlight before screens", time: "morning" },
  ],
  luteal:     [
    { title: "Slow walk · 20 min", time: "morning" },
    { title: "Magnesium with dinner", time: "evening" },
    { title: "Bath or book by 9pm",   time: "evening" },
  ],
};

const PHASE_TONES = {
  menstrual:  T.rose,
  follicular: T.sage,
  ovulatory:  T.gold,
  luteal:     T.plum,
};

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  } catch { return iso; }
}

export default function DayBlueprint({ targetDateISO, profile, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [intentionText, setIntentionText] = useState("");
  const [intentions, setIntentions] = useState([]);
  const [careItems, setCareItems] = useState(() =>
    (PHASE_CARE[predictPhaseForDate(targetDateISO, profile).phase] || []).map((c, i) => ({ ...c, id: i, selected: true }))
  );

  const prediction = useMemo(() => predictPhaseForDate(targetDateISO, profile), [targetDateISO, profile]);
  const tone = PHASE_TONES[prediction.phase] || T.gold;
  const insight = PHASE_INSIGHT[prediction.phase] || "A steady day. Keep it gentle.";
  const suggestions = PHASE_SUGGESTIONS[prediction.phase] || [];

  // Re-seed care items when targetDate changes (e.g. user goes back to picker).
  useEffect(() => {
    const defaults = PHASE_CARE[prediction.phase] || [];
    setCareItems(defaults.map((c, i) => ({ ...c, id: i, selected: true })));
  }, [prediction.phase]);

  const addIntention = (txt) => {
    const t = (txt || intentionText).trim();
    if (!t) return;
    setIntentions((arr) => [...arr, { id: Date.now() + Math.random(), title: t }]);
    setIntentionText("");
  };
  const removeIntention = (id) => setIntentions((arr) => arr.filter((x) => x.id !== id));
  const toggleCare = (id) =>
    setCareItems((arr) => arr.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)));
  const addCustomCare = () => {
    const id = Date.now();
    setCareItems((arr) => [...arr, { id, title: "", time: "morning", selected: true, isNew: true }]);
  };
  const updateCare = (id, patch) =>
    setCareItems((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const selectedCareCount = careItems.filter((c) => c.selected && c.title.trim()).length;
  const dateLabel = formatDate(targetDateISO);

  return (
    <div style={shell}>
      <style>{css}</style>

      {/* Header strip — step dots + close */}
      <div style={topRow}>
        <div style={dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{
              ...dot,
              background: i < step ? T.espresso : i === step ? T.blush : "rgba(58,44,26,0.18)",
              width: i === step ? 18 : 6,
            }} />
          ))}
        </div>
        {typeof onClose === "function" && (
          <button onClick={onClose} aria-label="Close" style={closeBtn}>
            <X size={13} />
          </button>
        )}
      </div>

      <div style={stage}>
        {step === 0 && (
          <Card accent={tone}>
            <div style={eyebrowRow}>
              <Calendar size={11} style={{ color: T.muted }} />
              <span style={eyebrow}>BLUEPRINT &middot; {dateLabel.toUpperCase()}</span>
            </div>
            <h2 style={title}>What&apos;s ahead.</h2>
            <p style={lead}>
              {dateLabel} is <b>{prediction.phase}{prediction.day ? ` · Day ${prediction.day}` : ""}</b> &mdash; predicted capacity <b>{prediction.capacity}</b>.
            </p>
            <p style={insightText}>{insight}</p>
            <div style={phasePillRow}>
              <span style={{ ...phasePill, background: `${tone}1F`, color: tone, borderColor: `${tone}55` }}>
                <span style={{ ...phasePillDot, background: tone }} />
                {prediction.phase.toUpperCase()}
                {prediction.day ? ` · DAY ${prediction.day}` : ""}
              </span>
              <span style={confChip}>{prediction.confidence === "low" ? "Low confidence — set last period in profile" : "Predicted"}</span>
            </div>
            <div style={actions}>
              <span />
              <button onClick={() => setStep(1)} style={primaryBtn}>
                Continue <ArrowRight size={13} />
              </button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card accent={tone}>
            <p style={eyebrowLine}>SET INTENTIONS &middot; {dateLabel.toUpperCase()}</p>
            <h2 style={title}>What do you want to make happen?</h2>
            <p style={lead}>One thing. Two. Up to you. Each becomes a PlannerItems anchor for {dateLabel}.</p>
            <div style={inputRow}>
              <input
                value={intentionText}
                onChange={(e) => setIntentionText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addIntention(); }}
                placeholder="e.g. Finish the proposal first draft"
                style={input}
              />
              <button onClick={() => addIntention()} disabled={!intentionText.trim()} style={addBtn}>
                <Plus size={12} /> Add
              </button>
            </div>
            <div style={chipsRow}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => addIntention(s)} style={{ ...chip, color: tone, borderColor: `${tone}66`, background: `${tone}14` }}>
                  + {s}
                </button>
              ))}
            </div>
            {intentions.length > 0 && (
              <ul style={intentionList}>
                {intentions.map((i) => (
                  <li key={i.id} style={intentionRow}>
                    <Anchor size={11} style={{ color: T.gold }} />
                    <span style={{ flex: 1 }}>{i.title}</span>
                    <button onClick={() => removeIntention(i.id)} aria-label="Remove" style={iconBtn}>
                      <X size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p style={wire}>Writes to PlannerItems with date=<b>{targetDateISO}</b> and isAnchor=true.</p>
            <div style={actions}>
              <button onClick={() => setStep(0)} style={textLink}>Back</button>
              <button onClick={() => setStep(2)} style={primaryBtn}>
                Continue <ArrowRight size={13} />
              </button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card accent={tone}>
            <p style={eyebrowLine}>PROTECT YOUR ENERGY &middot; {prediction.phase.toUpperCase()}</p>
            <h2 style={title}>Pre-set the care.</h2>
            <p style={lead}>Phase-matched defaults. Untick anything you don&apos;t want. Add custom items below.</p>
            <ul style={careList}>
              {careItems.map((c) => (
                <li key={c.id} style={{ ...careRow, opacity: c.selected ? 1 : 0.5, borderColor: c.selected ? tone : "rgba(58,44,26,0.10)" }}>
                  <button onClick={() => toggleCare(c.id)} aria-label={c.selected ? "Deselect" : "Select"} style={{ ...careCheck, background: c.selected ? tone : "transparent", borderColor: tone }}>
                    {c.selected && <CheckCircle2 size={10} style={{ color: T.cream }} strokeWidth={3} />}
                  </button>
                  {c.isNew ? (
                    <input
                      autoFocus
                      value={c.title}
                      onChange={(e) => updateCare(c.id, { title: e.target.value })}
                      placeholder="Custom self-care item"
                      style={careInput}
                    />
                  ) : (
                    <span style={{ flex: 1 }}>{c.title}</span>
                  )}
                  <select value={c.time} onChange={(e) => updateCare(c.id, { time: e.target.value })} style={timeSelect} aria-label="Time of day">
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </li>
              ))}
            </ul>
            <button onClick={addCustomCare} style={addCustomBtn}>
              <Plus size={12} /> Add custom item
            </button>
            <p style={wire}>Selected items will write to PlannerItems as scheduled habits/rituals on {dateLabel}.</p>
            <div style={actions}>
              <button onClick={() => setStep(1)} style={textLink}>Back</button>
              <button onClick={() => setStep(3)} style={primaryBtn}>
                Continue <ArrowRight size={13} />
              </button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card accent={T.gold}>
            <p style={eyebrowLine}>CONFIRM &middot; {dateLabel.toUpperCase()}</p>
            <h2 style={title}>{dateLabel}.</h2>
            <p style={lead}>
              <b>{intentions.length}</b> intention{intentions.length === 1 ? "" : "s"} &middot; <b>{selectedCareCount}</b> self-care block{selectedCareCount === 1 ? "" : "s"} set for {prediction.phase} day{prediction.day ? ` ${prediction.day}` : ""}.
            </p>
            {(intentions.length > 0 || selectedCareCount > 0) && (
              <div style={summaryWrap}>
                {intentions.length > 0 && (
                  <div style={summaryBlock}>
                    <p style={summaryLabel}>INTENTIONS</p>
                    <ul style={summaryUl}>
                      {intentions.map((i) => <li key={i.id} style={summaryLi}><Anchor size={10} style={{ color: T.gold }} /> {i.title}</li>)}
                    </ul>
                  </div>
                )}
                {selectedCareCount > 0 && (
                  <div style={summaryBlock}>
                    <p style={summaryLabel}>SELF-CARE</p>
                    <ul style={summaryUl}>
                      {careItems.filter((c) => c.selected && c.title.trim()).map((c) => (
                        <li key={c.id} style={summaryLi}><Sparkles size={10} style={{ color: tone }} /> {c.title} <span style={{ color: T.muted, marginLeft: 4 }}>· {c.time}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => {
                const payload = {
                  date: targetDateISO,
                  phase: prediction.phase,
                  intentions: intentions.map((i) => i.title),
                  care: careItems.filter((c) => c.selected && c.title.trim()).map((c) => ({ title: c.title, time: c.time })),
                };
                if (typeof onComplete === "function") onComplete(payload);
              }}
              style={saveBtn}
            >
              <CheckCircle2 size={13} /> Save blueprint
            </button>
            <p style={wire}>Real implementation writes one PlannerItems row per intention/care item with date=<b>{targetDateISO}</b>.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Card shell ──────────────────────────────────────────────────────────────
function Card({ children, accent }) {
  return <div style={{ ...card, borderTop: `3px solid ${accent}` }}>{children}</div>;
}

// ── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@keyframes fwBlueprintCardIn { 0% { transform: translateY(16px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
`;

// ── Styles ──────────────────────────────────────────────────────────────────
const shell = {
  background: T.cream,
  borderRadius: 20,
  padding: "12px 14px 18px",
  maxWidth: 600,
  margin: "0 auto",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const topRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const dotsRow = { display: "flex", alignItems: "center", gap: 6 };
const dot = { height: 6, borderRadius: 9999, transition: "width 0.3s ease, background 0.3s ease" };
const closeBtn = {
  width: 26, height: 26, borderRadius: 9999,
  background: T.paper, border: "1px solid rgba(58,44,26,0.15)",
  color: T.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const stage = { minHeight: 320 };
const card = {
  background: T.paper,
  borderRadius: 18,
  padding: "20px 20px 18px",
  boxShadow: "0 2px 12px rgba(58,44,26,0.10)",
  animation: "fwBlueprintCardIn 320ms cubic-bezier(0.2,0.8,0.2,1)",
};

const eyebrowRow = { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 };
const eyebrow = { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" };
const eyebrowLine = { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase", margin: "0 0 6px" };
const title = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 24, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.01em", margin: "0 0 8px", lineHeight: 1.2,
};
const lead = { fontSize: 14, color: T.espresso, lineHeight: 1.55, margin: "0 0 12px" };
const insightText = { fontSize: 13, color: T.plum, fontStyle: "italic", lineHeight: 1.55, margin: "0 0 12px" };

const phasePillRow = { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 };
const phasePill = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "5px 12px", borderRadius: 9999,
  border: "1px solid",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
};
const phasePillDot = { width: 6, height: 6, borderRadius: 9999 };
const confChip = {
  fontSize: 10, fontWeight: 600,
  padding: "5px 10px", borderRadius: 9999,
  background: T.cream, color: T.muted,
  border: "1px solid rgba(58,44,26,0.10)",
};

const inputRow = { display: "flex", gap: 8, marginBottom: 10 };
const input = {
  flex: 1, padding: "9px 12px", borderRadius: 10,
  border: "1px solid rgba(58,44,26,0.15)",
  background: T.cream, color: T.espresso,
  fontSize: 13, fontFamily: "inherit", outline: "none",
};
const addBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "9px 14px", borderRadius: 10,
  background: T.espresso, color: T.cream,
  border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
};
const chipsRow = { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 };
const chip = {
  display: "inline-flex", alignItems: "center",
  padding: "5px 10px", borderRadius: 9999,
  fontSize: 11, fontWeight: 600,
  border: "1px solid", cursor: "pointer",
};

const intentionList = { listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 6 };
const intentionRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "9px 12px", borderRadius: 12,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
  fontSize: 13, color: T.espresso,
};
const iconBtn = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "1px solid rgba(58,44,26,0.12)",
  cursor: "pointer", color: T.muted,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const careList = { listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 6 };
const careRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "9px 12px", borderRadius: 12,
  background: T.cream, border: "1.5px solid",
  fontSize: 13, color: T.espresso,
};
const careCheck = {
  width: 18, height: 18, borderRadius: 6,
  border: "1.5px solid", cursor: "pointer", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const careInput = {
  flex: 1, padding: "5px 8px", borderRadius: 8,
  border: "1px solid rgba(58,44,26,0.15)",
  background: T.paper, color: T.espresso,
  fontSize: 13, fontFamily: "inherit", outline: "none",
};
const timeSelect = {
  padding: "4px 8px", borderRadius: 9999,
  background: T.paper, color: T.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 11, fontFamily: "inherit",
  cursor: "pointer",
};
const addCustomBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  marginTop: 10,
  padding: "6px 12px", borderRadius: 9999,
  background: "transparent", color: T.muted,
  border: "1px dashed rgba(58,44,26,0.20)",
  cursor: "pointer", fontSize: 11, fontWeight: 600,
};

const summaryWrap = { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 };
const summaryBlock = { padding: "10px 12px", borderRadius: 12, background: T.cream, border: "1px solid rgba(58,44,26,0.10)" };
const summaryLabel = { fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: T.muted, margin: "0 0 6px" };
const summaryUl = { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 };
const summaryLi = { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.espresso, lineHeight: 1.4 };

const saveBtn = {
  width: "100%",
  display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 8,
  padding: "12px 16px", borderRadius: 9999,
  background: T.espresso, color: T.cream,
  border: "none", cursor: "pointer",
  fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
  marginBottom: 10,
};

const actions = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  gap: 8, marginTop: 14,
};
const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "8px 14px", borderRadius: 9999,
  background: T.espresso, color: T.cream,
  border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
};
const textLink = {
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: 12, fontWeight: 600, color: T.muted,
  fontFamily: "inherit", padding: "6px 4px",
};
const wire = {
  fontSize: 10, color: T.muted, fontStyle: "italic", lineHeight: 1.5,
  padding: "8px 10px", margin: "10px 0 0",
  borderRadius: 8, background: T.cream, border: "1px dashed rgba(58,44,26,0.10)",
};
