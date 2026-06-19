// ChapterHeadsUp — a calm, DISMISSIBLE, never-blocking content note shown at a chapter boundary
// BEFORE a heavy chapter (Books & Book Clubs, Phase 2).
//
// Extends the book-level "gentle heads-up" (bookClubConfig.trigger_warnings) down to the chapter
// level. When the reader REACHES a chapter that carries an authored content note (chapterWarnings),
// this surfaces a warm one-line heads-up — never alarmist, never a wall. Two equal exits:
//   · "I'm ready — continue"  → dismiss and read on (the common path)
//   · "Not right now"          → dismiss too (no penalty, no "you skipped" state)
// Either way the note is marked seen on this device so it never nags on a re-read.
//
// The note describes only the SHAPE of the chapter ("serious illness", never who or how it ends),
// so it can't spoil ahead. No free text, no entity, no network — purely a local, optional beat.
// No emoji — Lucide + Fraunces/Inter only. Mirrors CrisisSheetLite / ChapterEndCard styling.

import { useEffect, useRef, useCallback } from "react";
import { Leaf } from "lucide-react";
import { warningFor, markWarningSeen } from "@/components/community/chapterWarnings";

const CREAM = "#F4EDDB";
const CREAM_HI = "#FBF7EC";
const INK = "#3A2C1A";
const INK_SOFT = "#5A4A38";
const MUTED = "#9B8B7A";
const RULE = "rgba(58,44,26,0.16)";
const GOLD = "#D4AF37";
const SERIF = '"Cormorant Garamond","Fraunces",Georgia,serif';
const UI = '"Inter",system-ui,sans-serif';

export default function ChapterHeadsUp({ bookId, chapterIndex, onContinue, onDefer }) {
  const note = warningFor(bookId, chapterIndex);
  const closedRef = useRef(false);

  // Mark seen the moment it shows so it's once-per-chapter-per-device, even if dismissed by Esc /
  // backdrop. A heads-up you've acknowledged never reappears on a re-read.
  const finish = useCallback((deferred) => {
    if (closedRef.current) return;
    closedRef.current = true;
    markWarningSeen(bookId, chapterIndex);
    if (deferred) { onDefer && onDefer(); } else { onContinue && onContinue(); }
  }, [bookId, chapterIndex, onContinue, onDefer]);

  // Esc closes as "continue" — frictionless, never trapping the reader.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") finish(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  if (!note) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="A gentle heads-up about this chapter"
      onClick={(e) => { if (e.target === e.currentTarget) finish(false); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10040, display: "flex",
        alignItems: "flex-end", justifyContent: "center", background: "rgba(36,26,38,0.42)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fw-sheet-safe"
        style={{
          background: CREAM, width: "100%", maxWidth: 480, borderRadius: "18px 18px 0 0",
          padding: "22px 22px 26px", maxHeight: "86vh", overflowY: "auto",
          overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
          boxShadow: "0 -8px 32px rgba(36,26,38,0.22)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>
          <Leaf size={13} /> A gentle heads-up
        </span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.45, color: INK, margin: "0 0 6px" }}>
          {note.note}
        </p>
        <p style={{ fontFamily: UI, fontSize: 12, color: MUTED, margin: "0 0 18px" }}>
          Just a heads-up — nothing here is blocked. Read on whenever you like.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => finish(false)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7, background: INK, color: CREAM_HI,
              border: "none", borderRadius: 9, padding: "10px 16px", fontFamily: UI, fontSize: 13,
              fontWeight: 700, letterSpacing: 0.3, cursor: "pointer",
            }}
          >
            I{"’"}m ready — continue
          </button>
          <button
            type="button"
            onClick={() => finish(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
              border: `1px solid ${RULE}`, borderRadius: 9, padding: "10px 15px", fontFamily: UI,
              fontSize: 12.5, fontWeight: 600, color: INK_SOFT, cursor: "pointer",
            }}
          >
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
}
