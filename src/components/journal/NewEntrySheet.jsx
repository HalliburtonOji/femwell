import { useState, useEffect } from "react";
import { Plus, Frown, Meh, Smile, Mic, Lock, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PAPER_BG, T, UI, HAND, SERIF, PRESS, Script, Hand, Eyebrow, Rule, Chip } from "./Editorial";

// Card colours (kept — saved to card_color, used by pinned strip / future surfaces).
const COLOR_MAP = {
  rose: "#FFE4E8", peach: "#FFE8D6", yellow: "#FFF3C4", mint: "#D4F0E0",
  sky: "#D6EEFF", lavender: "#EDE4FF", lilac: "#F0D6FF", sage: "#DFF0DC",
};
const COLOR_NAMES = Object.keys(COLOR_MAP);

// Brand rule — no emoji. Text labels (editorial type row) + Lucide icons only.
const CARD_TYPES = [
  { id: "free",        label: "Free write" },
  { id: "reflection",  label: "Reflection" },
  { id: "gratitude",   label: "Gratitude" },
  { id: "mood",        label: "Mood" },
  { id: "affirmation", label: "Affirmation" },
  { id: "dream",       label: "Dream" },
  { id: "todo",        label: "To-do" },
];
const LABEL_OF = Object.fromEntries(CARD_TYPES.map((t) => [t.id, t.label]));

// Compose modes — Write + Guided are built; One-line / Voice are honest
// "coming" affordances (not wired this phase).
const COMPOSE_MODES = ["Write", "Guided", "One-line", "Voice"];
const COMING_MODES = new Set(["One-line", "Voice"]);

const PHASE_PROMPTS = {
  menstrual:  ["What do I need to release this cycle?", "How can I be gentler with myself today?", "What am I letting go of?"],
  follicular: ["What new thing am I excited to try?", "What intention am I setting this week?", "What feels possible right now?"],
  ovulatory:  ["Who or what am I showing up for today?", "What am I most proud of this week?", "How am I connecting with others?"],
  luteal:     ["What's weighing on me that I haven't said out loud?", "What does my body need right now?", "What patterns do I notice in myself?"],
  default:    ["How am I feeling right now?", "What made today meaningful?", "What do I want to remember about today?"],
};

// Guided compose — a short, phase-aware question sequence. Each step is a
// prompt the writer answers in turn; the answers compose into one ordinary
// reflection entry (same save path, same payload — nothing special stored).
const GUIDED_FLOW = {
  menstrual:  ["What are you ready to release this cycle?", "Where do you feel it in your body right now?", "What would rest actually look like today?"],
  follicular: ["What is beginning for you right now?", "What are you curious enough to try?", "What is one small first step you could take?"],
  ovulatory:  ["Who or what are you showing up for today?", "What are you quietly proud of this week?", "What do you want to carry forward from it?"],
  luteal:     ["What is weighing on you that you haven't said out loud?", "Where do you feel it in your body?", "What would help, even a little?"],
  default:    ["How are you, really, right now?", "What happened today that stayed with you?", "What do you want to remember about today?"],
};

// 5-point face scale — Lucide Frown/Meh/Smile, no emoji.
const MOOD_FACES = [
  null,
  { Icon: Frown, fill: "#D45E52", label: "Low" },
  { Icon: Frown, fill: "#C17B4E", label: "Down" },
  { Icon: Meh,   fill: "#6E6557", label: "Neutral" },
  { Icon: Smile, fill: "#6B8F5A", label: "Good" },
  { Icon: Smile, fill: "#3A2C1A", label: "Bright" },
];

function randomColor() { return COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]; }
function norm(s) { return String(s || "").trim().toLowerCase(); }

// Editorial input styling on the cream insets.
const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 3, boxSizing: "border-box",
  background: T.paperHi, border: `1px solid ${T.paperDeep}`,
  fontFamily: UI, fontSize: 14, color: T.ink, outline: "none",
};

export default function NewEntrySheet({
  user, phase, cycleDay = null, onClose, onSaved, editEntry = null,
  seedText = "", seedCardType = null, seedThread = "", threads = [],
}) {
  // Existing tags -> primary thread (tags[0]) + the rest (extra tags).
  const initTags = editEntry?.tags
    ? (Array.isArray(editEntry.tags) ? editEntry.tags : String(editEntry.tags).split(",").map((s) => s.trim()).filter(Boolean))
    : [];

  const [mode, setMode] = useState("Write"); // Write + Guided built; others "coming"
  const [cardType, setCardType] = useState(editEntry?.card_type || seedCardType || "free");
  const [color, setColor] = useState(editEntry?.card_color || randomColor());
  const [text, setText] = useState(editEntry?.text || seedText || "");
  const [mood, setMood] = useState(editEntry?.mood_rating || 0);
  const [thread, setThread] = useState(initTags[0] || seedThread || "");
  const [extraTags, setExtraTags] = useState(initTags.slice(1).join(", "));
  const [gratitudes, setGratitudes] = useState(["", "", ""]);
  const [todoItems, setTodoItems] = useState(editEntry?.todo_items || []);
  const [newTodoText, setNewTodoText] = useState("");
  const [saving, setSaving] = useState(false);

  // Guided state
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState([]);

  const prompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS.default;
  const guidedSteps = GUIDED_FLOW[phase] || GUIDED_FLOW.default;

  // Pre-fill gratitudes from existing text if editing a gratitude entry.
  useEffect(() => {
    if (editEntry?.card_type === "gratitude" && editEntry.text) {
      const parts = editEntry.text.split("\n").filter(Boolean);
      setGratitudes([parts[0] || "", parts[1] || "", parts[2] || ""]);
    }
  }, [editEntry]);

  // ── save logic — payload shape UNCHANGED; tags rebuilt from thread + extras ──
  const handleSave = async () => {
    setSaving(true);
    let finalText = text;
    if (cardType === "gratitude") finalText = gratitudes.filter(Boolean).join("\n");

    // Primary thread is tags[0]; de-dup (case-insensitive) against extra tags.
    const extra = extraTags.split(",").map((t) => t.trim()).filter(Boolean);
    const tagArr = [];
    const seen = new Set();
    [thread.trim(), ...extra].forEach((t) => {
      if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); tagArr.push(t); }
    });

    const payload = {
      user_id: user.id,
      content_id: `${cardType}_entry`,
      text: finalText,
      card_type: cardType,
      card_color: color,
      mood_rating: mood || undefined,
      tags: tagArr,
      todo_items: cardType === "todo" ? todoItems : undefined,
      session_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };

    try {
      let saved;
      if (editEntry) saved = await base44.entities.JournalEntries.update(editEntry.id, payload);
      else saved = await base44.entities.JournalEntries.create(payload);
      onSaved(saved);
      setSaving(false);
      onClose();
    } catch (err) {
      console.error("Save journal entry failed:", err);
      setSaving(false);
    }
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    setTodoItems((prev) => [...prev, { text: newTodoText.trim(), done: false }]);
    setNewTodoText("");
  };
  const removeTodo = (idx) => setTodoItems((prev) => prev.filter((_, i) => i !== idx));

  // ── Guided helpers ──
  const setAnswer = (i, val) => setGuidedAnswers((prev) => {
    const next = [...prev];
    while (next.length < guidedSteps.length) next.push("");
    next[i] = val;
    return next;
  });
  const hasAnyGuided = guidedSteps.some((_, i) => (guidedAnswers[i] || "").trim());
  const finishGuided = () => {
    const composed = guidedSteps
      .map((q, i) => { const a = (guidedAnswers[i] || "").trim(); return a ? `${q}\n${a}` : null; })
      .filter(Boolean)
      .join("\n\n");
    setText(composed);
    setCardType("reflection");
    setGuidedStep(0);
    setMode("Write"); // land on the normal form to add thread / mood / colour and save
  };

  const chooseMode = (m) => {
    if (COMING_MODES.has(m)) return;
    setMode(m);
    if (m === "Guided") setGuidedStep(0);
  };

  const guided = mode === "Guided";
  const oneLine = mode === "One-line";
  const saveDisabled = saving
    || (cardType === "gratitude" && !gratitudes.some(Boolean))
    || (cardType === "todo" && todoItems.length === 0)
    || (cardType !== "gratitude" && cardType !== "todo" && !text.trim());

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, ...PAPER_BG, overflowY: "auto", padding: "30px 26px 44px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Eyebrow>{editEntry ? "Editing an entry" : "A new entry"}</Eyebrow>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, color: T.muted, fontWeight: 600 }}>Close</button>
        </div>

        <Script size={46} style={{ marginBottom: 14 }}>{guided ? "A guided entry" : (LABEL_OF[cardType] || "Entry")}</Script>

        {/* compose modes — Write + Guided built · One-line / Voice coming */}
        <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          {COMPOSE_MODES.map((m) => {
            const coming = COMING_MODES.has(m);
            const on = m === mode;
            return (
              <button key={m} disabled={coming} onClick={() => chooseMode(m)} style={{
                background: "transparent", border: "none", padding: "0 0 2px", cursor: coming ? "default" : "pointer",
                fontFamily: UI, fontSize: 12.5, letterSpacing: 0.4, display: "inline-flex", alignItems: "center", gap: 5,
                color: coming ? T.muted : (on ? T.ink : T.muted), opacity: coming ? 0.5 : 1,
                fontWeight: on ? 800 : 600, borderBottom: on ? `1px solid ${T.gold}` : "none",
              }}>{m === "Voice" && <Mic size={12} />}{m === "Guided" && <Sparkles size={12} />}{m}{coming ? " · coming" : ""}</button>
            );
          })}
        </div>

        {/* metadata chip — phase · cycle day */}
        {(phase || cycleDay) && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <Chip>{phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Today"}{cycleDay ? ` · Day ${cycleDay}` : ""}</Chip>
          </div>
        )}

        {/* ══ GUIDED MODE — a phase-aware question sequence ══ */}
        {guided && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              {guidedSteps.map((_, i) => (
                <span key={i} style={{
                  width: i === guidedStep ? 22 : 8, height: 8, borderRadius: 999,
                  background: i === guidedStep ? T.gold : (((guidedAnswers[i] || "").trim()) ? T.inkSoft : T.paperDeep),
                  transition: "all 0.2s",
                }} />
              ))}
              <span style={{ marginLeft: 4, fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
                Step {guidedStep + 1} of {guidedSteps.length}
              </span>
            </div>

            <Hand size={26} color={T.ink} style={{ marginBottom: 6 }}>{guidedSteps[guidedStep]}</Hand>
            <Rule w={28} c={T.gold} mb={14} />

            <textarea
              value={guidedAnswers[guidedStep] || ""}
              onChange={(e) => setAnswer(guidedStep, e.target.value)}
              placeholder="Take your time. A sentence is enough."
              style={{
                width: "100%", minHeight: 150, background: T.paperHi,
                border: `1px solid ${T.paperDeep}`, padding: "16px 18px", borderRadius: 3, resize: "none",
                fontFamily: SERIF, fontSize: 20, lineHeight: 1.6, color: T.ink, outline: "none", boxSizing: "border-box",
              }} />

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
              {guidedStep > 0 && (
                <button onClick={() => setGuidedStep((s) => s - 1)} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none",
                  cursor: "pointer", padding: 0, fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6,
                  textTransform: "uppercase", color: T.muted,
                }}><ArrowLeft size={13} /> Back</button>
              )}
              {guidedStep < guidedSteps.length - 1 ? (
                <button onClick={() => setGuidedStep((s) => s + 1)} style={{
                  marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
                  border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
                  fontFamily: HAND, fontWeight: 600, fontSize: 20, color: T.ink, textShadow: PRESS, borderBottom: `1px solid ${T.gold}`,
                }}>Next <ArrowRight size={14} /></button>
              ) : (
                <button onClick={finishGuided} disabled={!hasAnyGuided} style={{
                  marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
                  border: "none", cursor: hasAnyGuided ? "pointer" : "default", padding: 0, paddingBottom: 3, opacity: hasAnyGuided ? 1 : 0.5,
                  fontFamily: HAND, fontWeight: 600, fontSize: 20, color: T.ink, textShadow: PRESS, borderBottom: `1px solid ${T.gold}`,
                }}>Review &amp; save <ArrowRight size={14} /></button>
              )}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 22, fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.6, fontWeight: 600 }}>
              <Lock size={11} /> Your answers stay on this device. Jess reads them only if you hand them to her.
            </div>
          </div>
        )}

        {/* ══ WRITE MODE (and the normal form) ══ */}
        {!guided && (
          <>
            {/* type picker — editorial underline row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
              {CARD_TYPES.map((t) => (
                <button key={t.id} onClick={() => setCardType(t.id)} style={{
                  background: "transparent", border: "none", cursor: "pointer", padding: 0, paddingBottom: 2,
                  fontFamily: UI, fontSize: 12.5, letterSpacing: 0.4,
                  color: t.id === cardType ? T.ink : T.muted, fontWeight: t.id === cardType ? 800 : 500,
                  borderBottom: t.id === cardType ? `1px solid ${T.gold}` : "none",
                }}>{t.label}</button>
              ))}
            </div>

            {/* ── per-type form ── */}

            {/* Gratitude */}
            {cardType === "gratitude" && (
              <div style={{ marginBottom: 18 }}>
                <Eyebrow mb={10}>Three things you're grateful for</Eyebrow>
                {gratitudes.map((g, i) => (
                  <input key={i} value={g}
                    onChange={(e) => { const arr = [...gratitudes]; arr[i] = e.target.value; setGratitudes(arr); }}
                    placeholder={`${i + 1}. Something you appreciate…`}
                    style={{ ...inputStyle, marginBottom: 8 }} />
                ))}
              </div>
            )}

            {/* Mood */}
            {cardType === "mood" && (
              <div style={{ marginBottom: 18 }}>
                <Eyebrow mb={10}>How are you actually feeling?</Eyebrow>
                <div style={{ display: "flex", gap: 14, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const f = MOOD_FACES[n]; const I = f.Icon;
                    return (
                      <button key={n} onClick={() => setMood(n)} aria-label={f.label} style={{
                        background: "none", border: "none", cursor: "pointer", color: f.fill,
                        transform: mood === n ? "scale(1.3)" : "scale(1)", transition: "transform 0.15s", padding: 4,
                      }}><I size={30} strokeWidth={2} /></button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* To-do */}
            {cardType === "todo" && (
              <div style={{ marginBottom: 18 }}>
                <Eyebrow mb={10}>Your list</Eyebrow>
                {todoItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${T.gold}`, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: 17, color: T.ink }}>{item.text}</span>
                    <button onClick={() => removeTodo(idx)} aria-label="Remove" style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontFamily: UI, fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()} placeholder="Add item…"
                    style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={addTodo} aria-label="Add item" style={{ background: T.ink, color: T.paper, border: "none", borderRadius: 3, width: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )}

            {/* Textarea (free / reflection / dream / affirmation / mood-extra) */}
            {cardType !== "gratitude" && cardType !== "todo" && (
              <div style={{ marginBottom: 18 }}>
                {!text && (
                  <div style={{ paddingLeft: 16, borderLeft: `1px solid ${T.gold}`, marginBottom: 16 }}>
                    <Eyebrow mb={8}>A way in</Eyebrow>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {prompts.map((p) => (
                        <button key={p} onClick={() => setText(p + " ")} style={{
                          textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0,
                          fontFamily: HAND, fontSize: 19, color: T.inkSoft, lineHeight: 1.3,
                        }}>{p}</button>
                      ))}
                    </div>
                  </div>
                )}
                <textarea value={text} onChange={(e) => setText(e.target.value)}
                  placeholder={oneLine ? "One line — just the truth of today." : "Begin…"}
                  style={{
                    width: "100%", minHeight: oneLine ? 80 : 280, background: T.paperHi,
                    border: `1px solid ${T.paperDeep}`, padding: "18px 20px", borderRadius: 3, resize: "none",
                    fontFamily: SERIF, fontSize: 21, lineHeight: 1.6, color: T.ink, outline: "none", boxSizing: "border-box",
                  }} />
              </div>
            )}

            {/* Mood bar for non-mood types */}
            {cardType !== "mood" && (
              <div style={{ marginBottom: 18 }}>
                <Eyebrow mb={8}>Mood (optional)</Eyebrow>
                <div style={{ display: "flex", gap: 12 }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const f = MOOD_FACES[n]; const I = f.Icon;
                    return (
                      <button key={n} onClick={() => setMood(mood === n ? 0 : n)} aria-label={f.label} style={{
                        background: "none", border: "none", cursor: "pointer", color: f.fill,
                        transform: mood === n ? "scale(1.25)" : "scale(1)", transition: "transform 0.15s",
                        opacity: mood && mood !== n ? 0.4 : 1, padding: 2,
                      }}><I size={24} strokeWidth={2} /></button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thread — the series this entry belongs to */}
            <div style={{ marginBottom: 18 }}>
              <Eyebrow mb={8}>Thread — a series this belongs to (optional)</Eyebrow>
              {threads.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                  {threads.slice(0, 12).map((name) => (
                    <Chip key={name} active={norm(thread) === norm(name)}
                      onClick={() => setThread(norm(thread) === norm(name) ? "" : name)}>{name}</Chip>
                  ))}
                </div>
              )}
              <input value={thread} onChange={(e) => setThread(e.target.value)}
                placeholder="Name a thread — e.g. the hard stuff, sleep, becoming" style={inputStyle} />
              <div style={{ marginTop: 10 }}>
                <Eyebrow mb={6}>More tags (optional, comma-separated)</Eyebrow>
                <input value={extraTags} onChange={(e) => setExtraTags(e.target.value)}
                  placeholder="e.g. work, rest" style={inputStyle} />
              </div>
            </div>

            {/* Colour */}
            <div style={{ marginBottom: 26 }}>
              <Eyebrow mb={8}>Card colour</Eyebrow>
              <div style={{ display: "flex", gap: 8 }}>
                {COLOR_NAMES.map((c) => (
                  <button key={c} onClick={() => setColor(c)} aria-label={c} style={{
                    width: 24, height: 24, borderRadius: "50%", backgroundColor: COLOR_MAP[c],
                    border: color === c ? `2.5px solid ${T.ink}` : `1.5px solid ${T.paperDeep}`,
                    cursor: "pointer", flexShrink: 0, transition: "transform 0.15s",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }} />
                ))}
              </div>
            </div>

            {/* Save + on-device privacy line */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button onClick={handleSave} disabled={saveDisabled} style={{
                background: "transparent", border: `1px solid ${T.gold}`, padding: "11px 26px",
                cursor: saveDisabled ? "default" : "pointer", fontFamily: HAND, fontWeight: 600, fontSize: 19,
                color: T.ink, textShadow: PRESS, borderRadius: 3, opacity: saveDisabled ? 0.5 : 1,
              }}>{saving ? "Saving…" : editEntry ? "Save changes" : "Save entry"}</button>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 18, fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.6, fontWeight: 600 }}>
              <Lock size={11} /> Encrypted on this device. Jess reads it only if you hand it to her.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
