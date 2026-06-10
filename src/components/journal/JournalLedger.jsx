// JournalLedger — entries as colour-coded "sticker" cards (Phase 1, revised).
//
// Each entry is a tactile sticker: a rounded card tinted by its card_type
// colour, a type label chip, a soft lift shadow and a small peel corner. A
// THREAD (several entries sharing a primary tag) collapses into a STACK of
// stickers — the most recent on top with the edges of the ones beneath peeking
// out — tappable to open the whole thread. Tapping a single sticker opens the
// EntryReader.
//
// Thread stacking only happens in the MAIN ledger (where `onThread` is given);
// inside a ThreadView (no `onThread`) every entry renders as its own sticker.
// Wired to real JournalEntries; no schema change (threads ride the tags array).

import { Hash, Pin, Layers } from "lucide-react";
import { T, UI, SERIF } from "./Editorial";
import { relativeDate } from "./journalDates";
import { threadOf } from "./threads";

// H6: card-type accent. Was an off-palette rainbow (indigo/teal/purple…) — collapsed
// to one muted ink tone on the cream, so the TYPE LABEL (not colour) carries the type
// and the palette stays cream/ink/gold/crimson. The single crimson pop is reserved
// for the heart elsewhere; gold stays the hairline accent.
const TYPE_KEYS = [
  "free", "gratitude", "mood", "todo", "reflection", "affirmation", "dream",
  "relationships", "career", "creativity", "money", "grief", "joy", "identity",
];
export const TYPE_COLOUR = Object.fromEntries(TYPE_KEYS.map((k) => [k, T.muted]));
export const TYPE_LABEL = {
  free: "Free write", gratitude: "Gratitude", mood: "Mood", todo: "To-do",
  reflection: "Reflection", affirmation: "Affirmation", dream: "Dream",
  // Wholeness dimensions
  relationships: "Relationships", career: "Career", creativity: "Creativity",
  money: "Money", grief: "Grief", joy: "Joy", identity: "Identity",
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

const colourOf = (e) => TYPE_COLOUR[e?.card_type] || T.ink;
const labelOf = (e) => TYPE_LABEL[e?.card_type] || "Entry";

// The sticker face — shared by single cards and the top of a stack.
function StickerFace({ entry, thread, count, onThread }) {
  const colour = colourOf(entry);
  const isStack = count > 1;
  const body = preview(entry);
  const tag = thread || (Array.isArray(entry.tags) && entry.tags.length ? entry.tags[0] : null);
  return (
    <article style={{
      position: "relative",
      background: T.paperHi,
      backgroundImage: `linear-gradient(${colour}12, ${colour}12)`,
      border: `1px solid ${colour}59`,
      borderRadius: 15,
      padding: "15px 17px 14px",
      boxShadow: `0 1px 0 ${colour}26, 0 7px 18px rgba(51,41,28,0.10)`,
    }}>
      {/* peel corner — a small folded sticker corner in the type colour */}
      <span aria-hidden style={{
        position: "absolute", top: -1, right: -1, width: 22, height: 22,
        borderTopRightRadius: 15,
        background: `linear-gradient(135deg, transparent 52%, ${colour}3D 52%)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <span style={{
          fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase",
          color: colour, background: `${colour}1A`, borderRadius: 999, padding: "3px 9px",
        }}>{labelOf(entry)}</span>
        {entry.is_pinned && <Pin size={11} style={{ color: T.gold }} />}
        {isStack && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: T.muted }}>
            <Layers size={11} style={{ color: colour }} /> {count} pages
          </span>
        )}
        <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.4, fontWeight: 600, marginLeft: "auto" }}>{relativeDate(entry)}</span>
      </div>
      <p style={{ fontFamily: SERIF, fontSize: 18.5, color: T.ink, lineHeight: 1.5, margin: 0 }}>{body}</p>
      {tag && (
        isStack || !onThread ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted }}>
            <Hash size={10} style={{ color: T.gold }} /> {tag}
          </div>
        ) : (
          <button
            onClick={(ev) => { ev.stopPropagation(); onThread(tag); }}
            aria-label={`Open the ${tag} thread`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10,
              background: "transparent", border: "none", cursor: "pointer", padding: 0,
              fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
              textTransform: "uppercase", color: T.muted, borderBottom: `1px solid ${T.paperDeep}`, paddingBottom: 1,
            }}>
            <Hash size={10} style={{ color: T.gold }} /> {tag}
          </button>
        )
      )}
    </article>
  );
}

// A thread rendered as a peeking stack of stickers.
function Stack({ entry, thread, count, onOpen }) {
  const colour = colourOf(entry);
  const backLayer = (dx, dy, rot, alpha) => (
    <div aria-hidden style={{
      position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
      transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
      background: T.paperHi, backgroundImage: `linear-gradient(${colour}12, ${colour}12)`,
      border: `1px solid ${colour}${alpha}`, borderRadius: 15,
      boxShadow: "0 5px 12px rgba(51,41,28,0.07)",
    }} />
  );
  return (
    <div onClick={onOpen} style={{ position: "relative", cursor: "pointer", marginBottom: 24 }}>
      {count > 2 && backLayer(8, 9, 1.6, "2E")}
      {backLayer(4, 4.5, -1.1, "3D")}
      <div style={{ position: "relative" }}>
        <StickerFace entry={entry} thread={thread} count={count} />
      </div>
    </div>
  );
}

export default function JournalLedger({ entries, onTap, onThread }) {
  if (!entries?.length) return null;

  // Build the row list. In the main ledger (onThread given), collapse entries
  // that share a primary thread (tags[0]) into a single stack at the position
  // of the first/most-prominent member. Inside a ThreadView (no onThread),
  // every entry is its own sticker.
  const counts = {};
  if (onThread) {
    entries.forEach((e) => { const t = threadOf(e); if (t) counts[t.toLowerCase()] = (counts[t.toLowerCase()] || 0) + 1; });
  }
  const seen = new Set();
  const rows = [];
  entries.forEach((e) => {
    const t = onThread ? threadOf(e) : null;
    const key = t ? t.toLowerCase() : null;
    if (key && counts[key] >= 2) {
      if (seen.has(key)) return;          // fold the rest of the thread into the stack
      seen.add(key);
      rows.push({ kind: "stack", entry: e, thread: t, count: counts[key] });
    } else {
      rows.push({ kind: "single", entry: e });
    }
  });

  return (
    <section style={{ marginBottom: 46 }}>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 1.7, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>
        The ledger · Recent entries
      </div>
      {rows.map((r) => (
        r.kind === "stack" ? (
          <Stack key={`stack-${r.thread}`} entry={r.entry} thread={r.thread} count={r.count}
            onOpen={() => onThread && onThread(r.thread)} />
        ) : (
          <div key={r.entry.id} onClick={() => onTap && onTap(r.entry)} style={{ cursor: "pointer", marginBottom: 14 }}>
            <StickerFace entry={r.entry} onThread={onThread} />
          </div>
        )
      ))}
    </section>
  );
}