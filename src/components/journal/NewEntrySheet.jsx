import { useState, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const COLOR_MAP = {
  rose:     "#FFE4E8",
  peach:    "#FFE8D6",
  yellow:   "#FFF3C4",
  mint:     "#D4F0E0",
  sky:      "#D6EEFF",
  lavender: "#EDE4FF",
  lilac:    "#F0D6FF",
  sage:     "#DFF0DC",
};
const COLOR_NAMES = Object.keys(COLOR_MAP);

const CARD_TYPES = [
  { id: "free",        icon: "✍️", label: "Free write" },
  { id: "gratitude",   icon: "🙏", label: "Gratitude" },
  { id: "todo",        icon: "✅", label: "Todo list" },
  { id: "mood",        icon: "💭", label: "Mood check" },
  { id: "reflection",  icon: "🪞", label: "Reflection" },
  { id: "dream",       icon: "🌙", label: "Dream log" },
];

const PHASE_PROMPTS = {
  menstrual:  ["What do I need to release this cycle?", "How can I be gentler with myself today?", "What am I letting go of?"],
  follicular: ["What new thing am I excited to try?", "What intention am I setting this week?", "What feels possible right now?"],
  ovulatory:  ["Who or what am I showing up for today?", "What am I most proud of this week?", "How am I connecting with others?"],
  luteal:     ["What's weighing on me that I haven't said out loud?", "What does my body need right now?", "What patterns do I notice in myself?"],
  default:    ["How am I feeling right now?", "What made today meaningful?", "What do I want to remember about today?"],
};

const MOOD_EMOJI = ["", "😞", "😕", "😐", "🙂", "😊"];

function randomColor() {
  return COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
}

export default function NewEntrySheet({ user, phase, onClose, onSaved, editEntry = null }) {
  const [step, setStep] = useState(editEntry ? "form" : "type");
  const [cardType, setCardType] = useState(editEntry?.card_type || "free");
  const [color, setColor] = useState(editEntry?.card_color || randomColor());
  const [text, setText] = useState(editEntry?.text || "");
  const [mood, setMood] = useState(editEntry?.mood_rating || 0);
  const [tags, setTags] = useState(editEntry?.tags ? (Array.isArray(editEntry.tags) ? editEntry.tags.join(", ") : editEntry.tags) : "");
  const [gratitudes, setGratitudes] = useState(["", "", ""]);
  const [todoItems, setTodoItems] = useState(editEntry?.todo_items || []);
  const [newTodoText, setNewTodoText] = useState("");
  const [saving, setSaving] = useState(false);

  const prompts = PHASE_PROMPTS[phase] || PHASE_PROMPTS.default;
  const bg = COLOR_MAP[color];

  // Pre-fill gratitudes from existing text if editing a gratitude entry
  useEffect(() => {
    if (editEntry?.card_type === "gratitude" && editEntry.text) {
      const parts = editEntry.text.split("\n").filter(Boolean);
      setGratitudes([parts[0] || "", parts[1] || "", parts[2] || ""]);
    }
  }, [editEntry]);

  const handleSave = async () => {
    setSaving(true);
    let finalText = text;
    if (cardType === "gratitude") {
      finalText = gratitudes.filter(Boolean).join("\n");
    }

    const tagArr = tags.split(",").map(t => t.trim()).filter(Boolean);
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

    let saved;
    if (editEntry) {
      saved = await base44.entities.JournalEntries.update(editEntry.id, payload);
    } else {
      saved = await base44.entities.JournalEntries.create(payload);
    }
    onSaved(saved);
    setSaving(false);
    onClose();
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    setTodoItems(prev => [...prev, { text: newTodoText.trim(), done: false }]);
    setNewTodoText("");
  };

  const removeTodo = (idx) => setTodoItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <style>{`@keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(4px)" }}
      />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: bg || "#EDE4FF",
        borderRadius: "28px 28px 0 0",
        maxHeight: "90vh", overflowY: "auto",
        animation: "sheet-up 0.28s ease",
        transition: "background-color 0.3s",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: "rgba(42,32,53,0.15)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 16px" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 700, color: "#2A2035", margin: 0 }}>
            {step === "type" ? "New entry" : editEntry ? "Edit entry" : CARD_TYPES.find(t => t.id === cardType)?.icon + " " + CARD_TYPES.find(t => t.id === cardType)?.label}
          </h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.5)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ width: 16, height: 16, color: "#2A2035" }} />
          </button>
        </div>

        <div style={{ padding: "0 20px 40px" }}>
          {/* STEP 1: Choose type */}
          {step === "type" && (
            <div>
              <p style={{ fontSize: 13, color: "#8A7E88", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
                What kind of entry?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {CARD_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setCardType(t.id); setStep("form"); }}
                    style={{
                      borderRadius: 16, padding: "18px 14px",
                      backgroundColor: "rgba(255,255,255,0.55)",
                      border: "1.5px solid rgba(255,255,255,0.7)",
                      cursor: "pointer", textAlign: "center",
                      boxShadow: "0 1px 4px rgba(42,32,53,0.07)",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#2A2035", fontFamily: "'Inter', sans-serif", margin: 0 }}>{t.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Form */}
          {step === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Gratitude type */}
              {cardType === "gratitude" && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#2A2035", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>
                    🙏 I'm grateful for...
                  </p>
                  {gratitudes.map((g, i) => (
                    <input
                      key={i}
                      value={g}
                      onChange={e => { const arr = [...gratitudes]; arr[i] = e.target.value; setGratitudes(arr); }}
                      placeholder={`${i + 1}. Something you appreciate...`}
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: 12, marginBottom: 8,
                        border: "1.5px solid rgba(255,255,255,0.6)",
                        backgroundColor: "rgba(255,255,255,0.45)",
                        fontSize: 14, color: "#2A2035", fontFamily: "'Inter', sans-serif",
                        outline: "none", boxSizing: "border-box",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Mood type */}
              {cardType === "mood" && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#2A2035", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>How are you feeling?</p>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setMood(n)}
                        style={{
                          fontSize: 28, background: "none", border: "none", cursor: "pointer",
                          transform: mood === n ? "scale(1.3)" : "scale(1)",
                          transition: "transform 0.15s",
                        }}
                      >
                        {MOOD_EMOJI[n]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Todo type */}
              {cardType === "todo" && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#2A2035", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>✅ My list</p>
                  {todoItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid rgba(42,32,53,0.3)", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.4)" }} />
                      <p style={{ flex: 1, fontSize: 13, color: "#2A2035", fontFamily: "'Inter', sans-serif", margin: 0 }}>{item.text}</p>
                      <button onClick={() => removeTodo(idx)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#C4849A" }}>×</button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input
                      value={newTodoText}
                      onChange={e => setNewTodoText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addTodo()}
                      placeholder="Add item..."
                      style={{
                        flex: 1, padding: "10px 12px", borderRadius: 10,
                        border: "1.5px solid rgba(255,255,255,0.6)",
                        backgroundColor: "rgba(255,255,255,0.45)",
                        fontSize: 13, color: "#2A2035", fontFamily: "'Inter', sans-serif", outline: "none",
                      }}
                    />
                    <button
                      onClick={addTodo}
                      style={{ backgroundColor: "rgba(42,32,53,0.8)", color: "white", border: "none", borderRadius: 10, width: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Plus style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              )}

              {/* Text area (free/reflection/dream/mood extra) */}
              {(cardType !== "gratitude" && cardType !== "todo") && (
                <div style={{ position: "relative" }}>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder=""
                    rows={7}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 14,
                      border: "1.5px solid rgba(255,255,255,0.6)",
                      backgroundColor: "rgba(255,255,255,0.4)",
                      fontSize: 14, lineHeight: 1.7, color: "#2A2035",
                      fontFamily: "'Inter', sans-serif", outline: "none",
                      resize: "none", boxSizing: "border-box",
                    }}
                  />
                  {/* AI prompts when empty */}
                  {!text && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 11, color: "#8A7E88", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
                        Tap a prompt to start:
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {prompts.map(p => (
                          <button
                            key={p}
                            onClick={() => setText(p + " ")}
                            style={{
                              textAlign: "left", padding: "9px 12px", borderRadius: 10,
                              backgroundColor: "rgba(255,255,255,0.5)",
                              border: "1px solid rgba(255,255,255,0.7)",
                              fontSize: 12, color: "#2A2035", fontFamily: "'Inter', sans-serif",
                              cursor: "pointer",
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mood bar (for non-mood types) */}
              {cardType !== "mood" && (
                <div>
                  <p style={{ fontSize: 11, color: "#8A7E88", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Mood (optional)</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setMood(mood === n ? 0 : n)}
                        style={{
                          fontSize: 22, background: "none", border: "none", cursor: "pointer",
                          transform: mood === n ? "scale(1.25)" : "scale(1)",
                          transition: "transform 0.15s", opacity: mood && mood !== n ? 0.45 : 1,
                        }}
                      >
                        {MOOD_EMOJI[n]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <p style={{ fontSize: 11, color: "#8A7E88", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Tags (comma-separated)</p>
                <input
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="e.g. growth, work, self-care"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: "1.5px solid rgba(255,255,255,0.6)",
                    backgroundColor: "rgba(255,255,255,0.45)",
                    fontSize: 13, color: "#2A2035", fontFamily: "'Inter', sans-serif",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Colour picker */}
              <div>
                <p style={{ fontSize: 11, color: "#8A7E88", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Card colour</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLOR_NAMES.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        backgroundColor: COLOR_MAP[c],
                        border: color === c ? "2.5px solid #2A2035" : "1.5px solid rgba(42,32,53,0.18)",
                        cursor: "pointer", flexShrink: 0,
                        boxShadow: color === c ? "0 0 0 1px rgba(255,255,255,0.8)" : "none",
                        transition: "transform 0.15s",
                        transform: color === c ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || (cardType === "gratitude" && !gratitudes.some(Boolean)) || (cardType !== "gratitude" && cardType !== "todo" && !text.trim()) || (cardType === "todo" && todoItems.length === 0)}
                style={{
                  backgroundColor: "#2A2035", color: "white",
                  border: "none", borderRadius: 9999, padding: "14px",
                  fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  cursor: "pointer", width: "100%", marginTop: 4,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : editEntry ? "Save changes" : "Save entry"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}