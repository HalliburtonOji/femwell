import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import {
  Star, MoreVertical, Check,
  PenLine, HeartHandshake, MessageSquareDashed, CheckSquare,
  Sparkles, Zap, Moon, Frown, Meh, Smile, Edit3, Palette, Trash2,
} from "lucide-react";
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

// Brand rule — no emoji. Lucide icons only.
const TYPE_META = {
  free:        { Icon: PenLine,             label: "Free write" },
  gratitude:   { Icon: HeartHandshake,      label: "Gratitude" },
  mood:        { Icon: MessageSquareDashed, label: "Mood" },
  todo:        { Icon: CheckSquare,         label: "Todo" },
  reflection:  { Icon: Sparkles,            label: "Reflection" },
  affirmation: { Icon: Zap,                 label: "Affirmation" },
  dream:       { Icon: Moon,                label: "Dream" },
};

// 5-point face scale — Lucide Frown/Meh/Smile, no emoji.
const MOOD_FACES = {
  1: { Icon: Frown, fill: "#D45E52" },
  2: { Icon: Frown, fill: "#C17B4E" },
  3: { Icon: Meh,   fill: "#9B8B7A" },
  4: { Icon: Smile, fill: "#6B8F5A" },
  5: { Icon: Smile, fill: "#3A2C1A" },
};

const COLOR_NAMES = ["rose","peach","yellow","mint","sky","lavender","lilac","sage"];

// Deterministic slight rotation based on entry id
function getRotation(id) {
  if (!id) return 0;
  const hash = [...(id || "xx")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const deg = ((hash % 7) - 3) * 0.5; // range -1.5 to +1.5
  return deg;
}

export default function JotterCard({ entry, onEdit, onDelete, onPin, onColorChange, onTodoToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localTodos, setLocalTodos] = useState(entry.todo_items || []);
  const menuRef = useRef(null);

  const bg = COLOR_MAP[entry.card_color] || COLOR_MAP.lavender;
  const rotation = getRotation(entry.id);
  const meta = TYPE_META[entry.card_type] || TYPE_META.free;
  const tags = Array.isArray(entry.tags) ? entry.tags : [];
  const dateLabel = entry.session_date
    ? format(parseISO(entry.session_date), "MMM d")
    : entry.created_date
    ? format(new Date(entry.created_date), "MMM d")
    : "";

  const handleTodoToggle = async (idx) => {
    const updated = localTodos.map((item, i) =>
      i === idx ? { ...item, done: !item.done } : item
    );
    setLocalTodos(updated);
    onTodoToggle && onTodoToggle(entry.id, updated);
    await base44.entities.JournalEntries.update(entry.id, { todo_items: updated });
  };

  const textPreview = entry.text || "";
  const isLong = textPreview.length > 200;

  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 16,
        padding: "14px 14px 12px",
        boxShadow: "0 2px 8px rgba(42,32,53,0.08), 0 1px 3px rgba(42,32,53,0.04)",
        transform: `rotate(${rotation}deg)`,
        position: "relative",
        transition: "transform 0.2s",
        border: "1px solid rgba(42,32,53,0.06)",
        marginBottom: 2,
      }}
    >
      {/* Type pill + menu row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 999,
          padding: "3px 10px 3px 8px", fontSize: 11, fontWeight: 600,
          color: "#2A2035", fontFamily: "'Inter', sans-serif",
        }}>
          <meta.Icon size={11} strokeWidth={2.2} /> {meta.label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {entry.is_pinned && <Star style={{ width: 14, height: 14, fill: "#B89E6A", color: "#B89E6A" }} />}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#8A7E88", display: "flex" }}
            >
              <MoreVertical style={{ width: 14, height: 14 }} />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: "absolute", right: 0, top: 20, zIndex: 50,
                  backgroundColor: "white", borderRadius: 12, boxShadow: "0 4px 16px rgba(42,32,53,0.12)",
                  border: "1px solid #EDE8E4", minWidth: 140, overflow: "hidden",
                }}
                onClick={() => setMenuOpen(false)}
              >
                {[
                  { id: "edit",   Icon: Edit3,   label: "Edit",                          action: () => onEdit && onEdit(entry) },
                  { id: "pin",    Icon: Star,    label: entry.is_pinned ? "Unpin" : "Pin", action: () => onPin && onPin(entry) },
                  { id: "color",  Icon: Palette, label: "Colour",                        action: null },
                  { id: "delete", Icon: Trash2,  label: "Delete",                        action: () => onDelete && onDelete(entry), danger: true },
                ].map((item) =>
                  item.id === "color" ? (
                    <div key="color" style={{ padding: "8px 14px", borderBottom: "1px solid #F5F1EE" }}>
                      <p style={{ fontSize: 11, color: "#8A7E88", fontFamily: "'Inter', sans-serif", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <Palette size={11} /> Change colour
                      </p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {COLOR_NAMES.map(c => (
                          <button
                            key={c}
                            onClick={() => { onColorChange && onColorChange(entry, c); setMenuOpen(false); }}
                            style={{
                              width: 18, height: 18, borderRadius: "50%",
                              backgroundColor: COLOR_MAP[c],
                              border: entry.card_color === c ? "2px solid #2A2035" : "1.5px solid rgba(42,32,53,0.15)",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      key={item.id}
                      onClick={item.action}
                      style={{
                        width: "100%", textAlign: "left", padding: "9px 14px",
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 13, fontFamily: "'Inter', sans-serif",
                        color: item.danger ? "#B85050" : "#2A2035",
                        borderBottom: "1px solid #F5F1EE",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <item.Icon size={13} /> {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date */}
      <p style={{ fontSize: 11, color: "#8A7E88", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>{dateLabel}</p>

      {/* Todo list */}
      {entry.card_type === "todo" && localTodos.length > 0 ? (
        <div style={{ marginBottom: 8 }}>
          {localTodos.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleTodoToggle(idx)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 0", cursor: "pointer",
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: "1.5px solid rgba(42,32,53,0.25)",
                backgroundColor: item.done ? "rgba(42,32,53,0.7)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.done && <Check style={{ width: 10, height: 10, color: "white" }} />}
              </div>
              <span style={{
                fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#2A2035",
                textDecoration: item.done ? "line-through" : "none",
                opacity: item.done ? 0.5 : 1,
              }}>{item.text}</span>
            </div>
          ))}
        </div>
      ) : (
        /* Text body */
        textPreview.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <p style={{
              fontSize: 13, lineHeight: 1.65, color: "#2A2035",
              fontFamily: "'Inter', sans-serif",
              display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 4,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {textPreview}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(v => !v)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, color: "#8A7E88",
                  fontFamily: "'Inter', sans-serif", marginTop: 4, padding: 0,
                }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )
      )}

      {/* Footer: mood + tags */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
        {entry.mood_rating && MOOD_FACES[entry.mood_rating] && (() => {
          const { Icon, fill } = MOOD_FACES[entry.mood_rating];
          return (
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: fill,
            }} aria-label={`Mood ${entry.mood_rating} of 5`}>
              <Icon size={16} strokeWidth={2} />
            </span>
          );
        })()}
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 999,
              padding: "1px 7px", fontSize: 10, fontWeight: 600,
              color: "#2A2035", fontFamily: "'Inter', sans-serif",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}