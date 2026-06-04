// JournalLedger — entries as an editorial table of contents (Phase 1).
//
// Replaces the JotterCard masonry. Each entry is a ledger line: a thin
// type-coloured rule, the type label + date, a serif preview (drop-initial
// on the first line), and a thread chip from the entry's first tag. Tapping
// a line opens the EntryReader. Phase 1b: the thread chip is tappable — it
// filters into that thread's view (via onThread) without opening the entry.
// Wired to real JournalEntries.

import { Hash, Pin } from "lucide-react";
import { T, UI, SERIF } from "./Editorial";
import { relativeDate } from "./journalDates";

// Accent label colours per card_type — the only quiet colour on the cream.
export const TYPE_COLOUR = {
  free: "#2A2118", gratitude: "#947216", mood: "#C77B86", todo: "#3F5C5C",
  reflection: "#5F7E5F", affirmation: "#A56A18", dream: "#54407F",
};
export const TYPE_LABEL = {
  free: "Free write", gratitude: "Gratitude", mood: "Mood", todo: "To-do",
  reflection: "Reflection", affirmation: "Affirmation", dream: "Dream",
};

function preview(entry) {
  let t = entry?.text || "";
  if (entry?.card_type === "gratitude") t = t.split("\n").filter(Boolean).join(" · ");
  if (entry?.card_type === "todo" && (!t || !t.trim()) && Array.isArray(entry.todo_items)) {
    t = entry.todo_items.map((it) => it.text).filter(Boolean).join(" · ");
  }
  t = t.replace(/\s+/g, " ").trim();
  if (!t) return "(no words yet)";
  return t.length > 180 ? t.slice(0, 177).trimEnd() + "…" : t;
}

export default function JournalLedger({ entries, onTap, onThread }) {
  if (!entries?.length) return null;
  return (
    <section style={{ marginBottom: 46 }}>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 1.7, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>
        The ledger · Recent entries
      </div>
      {entries.map((e, idx) => {
        const colour = TYPE_COLOUR[e.card_type] || T.ink;
        const label = TYPE_LABEL[e.card_type] || "Entry";
        const body = preview(e);
        const thread = Array.isArray(e.tags) && e.tags.length ? e.tags[0] : null;
        const drop = idx === 0 && body && body !== "(no words yet)";
        return (
          <article key={e.id} onClick={() => onTap && onTap(e)} style={{
            display: "flex", gap: 16, cursor: "pointer", padding: "18px 0",
            borderTop: idx === 0 ? "none" : `1px solid ${T.paperDeep}`,
          }}>
            <div style={{ width: 3, alignSelf: "stretch", background: colour, borderRadius: 2, opacity: 0.9 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: colour }}>{label}</span>
                {e.is_pinned && <Pin size={11} style={{ color: T.gold }} />}
                <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.4, fontWeight: 600, marginLeft: "auto" }}>{relativeDate(e)}</span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.5, margin: 0 }}>
                {drop ? <span style={{ float: "left", fontFamily: SERIF, fontSize: 52, lineHeight: 0.82, fontWeight: 600, color: T.gold, margin: "4px 10px 0 0" }}>{body.charAt(0)}</span> : null}
                {drop ? body.slice(1) : body}
              </p>
              {thread && (
                onThread ? (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); onThread(thread); }}
                    aria-label={`Open the ${thread} thread`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9,
                      background: "transparent", border: "none", cursor: "pointer", padding: 0,
                      fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                      textTransform: "uppercase", color: T.muted, borderBottom: `1px solid ${T.paperDeep}`, paddingBottom: 1,
                    }}>
                    <Hash size={10} style={{ color: T.gold }} /> {thread}
                  </button>
                ) : (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9, fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted }}>
                    <Hash size={10} style={{ color: T.gold }} /> {thread}
                  </div>
                )
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
