// EntryReader — full-entry reading view (Phase 1, "the page is the screen").
//
// Opens from a Ledger line. Serif body, measured, on cream paper. Preserves
// the actions the JotterCard used to carry — Pin, Edit, Delete — so nothing
// regresses when entries move from sticky-notes to the ledger+reader model.

import { useState } from "react";
import { Pin, PenLine, Trash2, X, Sparkles, Send } from "lucide-react";
import { T, UI, SERIF, HAND, PRESS, Eyebrow, Rule, useEscape } from "./Editorial";
import { relativeDate } from "./journalDates";
import { TYPE_COLOUR, TYPE_LABEL } from "./JournalLedger";
import UnpackWithJess from "./UnpackWithJess";
import ShareButton from "@/components/share/ShareButton";

const MOOD_WORD = { 1: "Low", 2: "Down", 3: "Neutral", 4: "Good", 5: "Bright" };

function Body({ entry }) {
  const base = { fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: T.ink, lineHeight: 1.62, margin: "0 0 16px", whiteSpace: "pre-wrap" };
  if (entry.card_type === "gratitude") {
    const lines = (entry.text || "").split("\n").filter(Boolean);
    return (
      <div style={{ marginBottom: 16 }}>
        {lines.map((l, i) => (
          <p key={i} style={{ ...base, margin: "0 0 8px" }}>{i + 1}. {l}</p>
        ))}
      </div>
    );
  }
  if (entry.card_type === "todo" && Array.isArray(entry.todo_items) && entry.todo_items.length) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
        {entry.todo_items.map((it, i) => (
          <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontFamily: SERIF, fontSize: 20, color: T.ink }}>
            <span style={{ width: 14, height: 14, marginTop: 5, borderRadius: 3, flexShrink: 0,
              border: `1.5px solid ${T.gold}`, background: it.done ? T.gold : "transparent" }} />
            <span style={{ textDecoration: it.done ? "line-through" : "none", opacity: it.done ? 0.6 : 1 }}>{it.text}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p style={base}>{entry.text || "(no words yet)"}</p>;
}

// OwnWordsShare — the ONE personal external-share case: the user's OWN words, by explicit
// opt-in, as a card. Everything else in the Journal stays inside the app (THE WALL). The
// guard (assertExternallyShareable) requires optIn:true for kind "own-words".
function OwnWordsShare({ entry }) {
  const [opt, setOpt] = useState(false);
  const line = (entry.text || "").trim().replace(/\s+/g, " ").slice(0, 240);
  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.paperDeep}` }}>
      {!opt ? (
        <button onClick={() => setOpt(true)} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, display: "inline-flex", alignItems: "center", gap: 6, padding: 0 }}>
          <Send size={13} /> Share a line of your own, outside the app
        </button>
      ) : (
        <div>
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginBottom: 10 }}>
            This makes a card of <b>your own words only</b> — nothing else from your journal, and never anyone else's. Only you can do this, and only when you choose to.
          </div>
          <ShareButton label="Make a card of these words" artifact={{
            kind: "own-words", source: "own", optIn: true, line,
            footer: "In my words", url: "https://femwells.com", shareText: "",
          }} />
        </div>
      )}
    </div>
  );
}

export default function EntryReader({ entry, profile, phase, onClose, onEdit, onDelete, onPin, onShare }) {
  const [confirm, setConfirm] = useState(false);
  const [unpack, setUnpack] = useState(false);
  useEscape(onClose);
  if (!entry) return null;
  const colour = TYPE_COLOUR[entry.card_type] || T.muted;
  const label = TYPE_LABEL[entry.card_type] || "Entry";
  const tags = Array.isArray(entry.tags) ? entry.tags.filter(Boolean) : [];

  const Action = ({ icon: Icon, label: l, onClick, danger }) => (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
      border: "none", cursor: "pointer", padding: 0,
      fontFamily: UI, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.3,
      color: danger ? T.crimson : T.inkSoft,
    }}><Icon size={14} /> {l}</button>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(51,41,28,0.42)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }}>
      <div role="dialog" aria-modal="true" aria-label={`${label} entry`} onClick={(e) => e.stopPropagation()} style={{ background: T.paperHi, width: "100%", maxWidth: 580, maxHeight: "86vh", overflowY: "auto", padding: "32px 30px 26px", borderRadius: 3, boxShadow: "0 8px 40px rgba(51,41,28,0.20)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Eyebrow color={colour}>{label}{entry.is_pinned ? " · Pinned" : ""}</Eyebrow>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <Rule w={28} c={T.gold} mb={18} />
        <Body entry={entry} />

        {entry.mood_rating ? (
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, letterSpacing: 0.4, fontWeight: 600, marginBottom: 6 }}>
            Mood · {MOOD_WORD[entry.mood_rating] || entry.mood_rating}
          </div>
        ) : null}
        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, letterSpacing: 0.5, fontWeight: 600 }}>{relativeDate(entry)}</div>

        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {tags.map((t) => (
              <span key={t} style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.muted, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "3px 10px" }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 24, paddingTop: 18, borderTop: `1px solid ${T.paperDeep}`, flexWrap: "wrap" }}>
          <Action icon={Pin} label={entry.is_pinned ? "Unpin" : "Pin"} onClick={() => onPin && onPin(entry)} />
          <Action icon={PenLine} label="Edit" onClick={() => onEdit && onEdit(entry)} />
          <Action icon={Sparkles} label={unpack ? "Close" : "Unpack with Jess"} onClick={() => setUnpack((v) => !v)} />
          {onShare && (entry.text || "").trim() && (
            <Action icon={Send} label="Share or seal…" onClick={() => onShare(entry)} />
          )}
          {confirm ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, fontWeight: 600 }}>Delete this entry?</span>
              <button onClick={() => { onDelete && onDelete(entry); onClose && onClose(); }} style={{
                fontFamily: HAND, fontWeight: 600, fontSize: 17, color: T.crimson, textShadow: PRESS,
                background: "transparent", border: `1px solid ${T.crimson}`, borderRadius: 3, padding: "5px 14px", cursor: "pointer" }}>Delete</button>
              <button onClick={() => setConfirm(false)} style={{ fontFamily: UI, fontSize: 12, color: T.muted, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}>Keep</button>
            </span>
          ) : (
            <span style={{ marginLeft: "auto" }}>
              <Action icon={Trash2} label="Delete" danger onClick={() => setConfirm(true)} />
            </span>
          )}
        </div>

        {unpack && <UnpackWithJess entry={entry} profile={profile} phase={phase} />}

        {(entry.text || "").trim() && <OwnWordsShare entry={entry} />}
      </div>
    </div>
  );
}
