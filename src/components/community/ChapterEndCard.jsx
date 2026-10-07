// ChapterEndCard — the calm, DISMISSIBLE chapter-boundary card from Jess (Books, Phase 1).
//
// Shown when the reader REACHES a chapter that has an authored projective prompt. Three calm,
// optional invitations, never a quiz, never a score:
//   1. A projective / empathy prompt about the chapter JUST read, with a PRIVATE reflection
//      textarea ("a line is plenty"). Saving is optional + device-local (never to an entity).
//      In a club context, an extra "add to the room" shares it to the checkpoint thread.
//   2. "Guess the next chapter" — a projective prediction, collected anonymously and revealed
//      ONLY as a warm aggregate once the reader has passed AND a k-floor of others have too.
//   3. A gentle shared-read cohort milestone — "N of you have reached chapter X" — k-floored,
//      never a race, no names.
//
// Spoiler-safe: only rendered for chapters already reached, and the prompt references only that
// chapter. Dismiss is frictionless — closing leaves NO "you skipped" state, ever.
//
// Engineering: ALL free text runs through the EXISTING crisisCheck before any save.
// Private saves and hunches require acknowledgement; reveal/cohort reads fail open.
// Direct club sharing remains visible but unavailable until exact thread mapping.
// No emoji anywhere — Fraunces/Inter + Lucide only.

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import { X, Send, BookOpen, Users } from "lucide-react";
import { crisisCheck } from "@/components/community/communityConfig";
import { promptFor } from "@/components/community/chapterPrompts";
import {
  recordPrediction, hasPredicted,
  cohortReachedCount, predictionAggregate,
} from "@/components/community/readingActivity";

import { useCleanReaderDialog, CleanReaderDialogStyles } from "@/components/lifestyle/DailyStoryReader";
const LEGACY_CREAM = "#F4EDDB";
const LEGACY_CREAM_HI = "#FBF7EC";
const LEGACY_INK = "#3A2C1A";
const LEGACY_MUTED = "#9B8B7A";
const LEGACY_RULE = "rgba(58,44,26,0.16)";
const LEGACY_GOLD = "#A8893F";   // canonical brand gold (BRAND_IDENTITY §2)
const SERIF = '"Cormorant Garamond","Fraunces",Georgia,serif';
const LEGACY_UI = '"Inter",system-ui,sans-serif';

// device-local solo reflection (optional save) — never an entity, fully private.
const soloKey = (bookId, chapterIndex) => `fw_read_reflect_${bookId}_${chapterIndex}`;
function readSolo(bookId, chapterIndex) {
  try { return localStorage.getItem(soloKey(bookId, chapterIndex)) || ""; } catch { return ""; }
}
function writeSolo(bookId, chapterIndex, text) {
  try {
    const key = soloKey(bookId, chapterIndex);
    localStorage.setItem(key, text);
    if (localStorage.getItem(key) !== text) return false;
    window.dispatchEvent(new CustomEvent("fw_read_reflection_saved", { detail: { bookId, chapterIndex } }));
    return true;
  } catch { return false; }
}

function ChapterEndCardContent({
  bookId,
  chapterIndex,
  userId,
  // club context — when provided, "add to the room" is offered + reflections can be shared.
  inClub = false,
  // this book's OWN community thread (Book Club for the club pick, else its readers' corner).
  // Never the generic Community page.
  communityHref = null,
  // anytime-reflect (the reader's Reflect icon): a smart, context-aware prompt for wherever she
  // is — used instead of the authored chapter-end prompt. `anytime` reframes the card as a quiet
  // mid-read reflection (no "guess the next chapter" / cohort, no "after chapter N" framing).
  overridePrompt = null,
  anytime = false,
  cleanPreview = false,
  sourceContext,
  onClose,
  onCrisis,
}) {
  const CREAM = cleanPreview ? "#FFFFFF" : LEGACY_CREAM;
  const CREAM_HI = cleanPreview ? "#FFFFFF" : LEGACY_CREAM_HI;
  const INK = cleanPreview ? "#191510" : LEGACY_INK;
  const MUTED = cleanPreview ? "#6E6A61" : LEGACY_MUTED;
  const RULE = cleanPreview ? "#EAE7E0" : LEGACY_RULE;
  const GOLD = cleanPreview ? "#527364" : LEGACY_GOLD;
  const UI = cleanPreview ? "system-ui,sans-serif" : LEGACY_UI;
  const dialogRef = useRef(null);
  const fieldId = useId();
  const prompt = overridePrompt ? { prompt: overridePrompt } : promptFor(bookId, chapterIndex);
  const [reflection, setReflection] = useState(() => readSolo(bookId, chapterIndex));
  const [savedNote, setSavedNote] = useState("");
  const [saveError, setSaveError] = useState("");
  const [guess, setGuess] = useState("");
  const [guessed, setGuessed] = useState(() => hasPredicted(bookId, chapterIndex));
  const [guessBusy, setGuessBusy] = useState(false);
  const [guessError, setGuessError] = useState("");
  const guessPending = useRef(false);
  const lifecycle = useRef(0);
  useEffect(() => { lifecycle.current++; return () => { lifecycle.current++; }; }, []);
  const [reveal, setReveal] = useState(null);       // null=loading, []=below floor, [..]=lines
  const [cohort, setCohort] = useState(null);       // null=loading/below floor, number=k-floored
  const closedRef = useRef(false);

  // Reads fail open. Cohort milestone + prediction reveal both gate on the k-floor inside the
  // helpers, so a small/empty room simply shows a warm line instead of a number.
  //
  // Phase 2 — the REVEAL is independent of whether YOU guessed. The card only ever renders for a
  // chapter you've already passed (spoiler-safe by construction), so once REVEAL_K_FLOOR distinct
  // readers have guessed here, "what the room imagined" is shown to everyone who reached this far —
  // guessers and lurkers alike. We always fetch it; predictionAggregate returns [] below the floor.
  useEffect(() => {
    if (anytime) return;
    let alive = true;
    cohortReachedCount(bookId, chapterIndex).then((n) => { if (alive) setCohort(n); }).catch(() => {});
    predictionAggregate(bookId, chapterIndex).then((l) => { if (alive) setReveal(l); }).catch(() => {});
    return () => { alive = false; };
  }, [bookId, chapterIndex, anytime]);

  const close = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose && onClose();
  }, [onClose]);

  useCleanReaderDialog(cleanPreview && !!prompt, dialogRef, close, "textarea");

  // Esc closes — frictionless dismiss.
  useEffect(() => {
    if (cleanPreview) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, cleanPreview]);

  // ── solo reflection (private, optional save) — crisis-checked before any save ──
  const saveSolo = () => {
    const text = reflection.trim();
    if (!text) return;
    if (crisisCheck(text).intercept) { onCrisis && onCrisis(); return; }
    setSavedNote(""); setSaveError("");
    if (!writeSolo(bookId, chapterIndex, text)) {
      setSaveError("Couldn't keep that here. Your words are still above; try again.");
      return;
    }
    setSavedNote("Kept on this device.");
  };

  // The old ReadingActivity write has no club-thread consumer. Keep the intended
  // action and draft, but never claim delivery before exact checkpoint wiring.
  const shareToRoom = () => {
    const text = reflection.trim();
    if (!text) return;
    if (crisisCheck(text).intercept) { onCrisis && onCrisis(); return; }
    setSavedNote("");
    setSaveError("Not shared. Your words are still here; direct sharing needs fixing.");
  };

  // ── guess the next chapter — crisis-checked, anonymous, aggregate-only ──
  const sendGuess = async () => {
    const text = guess.trim();
    if (!text || guessPending.current) return;
    if (crisisCheck(text).intercept) { onCrisis && onCrisis(); return; }
    const current = lifecycle.current;
    guessPending.current = true; setGuessBusy(true); setGuessError("");
    try {
      const result = await recordPrediction(bookId, chapterIndex, text, userId);
      if (current !== lifecycle.current || closedRef.current) return;
      if (result?.ok !== true) throw new Error("Unconfirmed hunch");
      setGuessed(true); setGuess("");
    // optimistically re-fetch the reveal (shows the warm line if still below floor, the aggregate
    // once the k-floor is met — never whose guess was "right", never a rank).
      predictionAggregate(bookId, chapterIndex).then(l => { if (current === lifecycle.current && !closedRef.current) setReveal(l); }).catch(() => {});
    } catch {
      if (current === lifecycle.current && !closedRef.current) setGuessError(userId ? "Couldn't confirm that sent. Your hunch is still here; try again." : "Sign in to share your hunch. Your words are still here.");
    } finally {
      if (current === lifecycle.current && !closedRef.current) { guessPending.current = false; setGuessBusy(false); }
    }
  };

  // The warm aggregate reveal (k-floored inside predictionAggregate). Shown to anyone who reached
  // this chapter once enough readers have guessed — Jess-voiced, no winners, no names, no ranking.
  const hasReveal = Array.isArray(reveal) && reveal.length > 0;

  // Nothing authored for this chapter -> render nothing (frictionless, never a "missing" state).
  if (!prompt) return null;

  const inputStyle = {
    width: "100%", boxSizing: "border-box", background: CREAM_HI, border: `1px solid ${RULE}`,
    borderRadius: 8, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 17,
    lineHeight: 1.5, color: INK, outline: "none",
  };
  const primaryBtn = {
    display: "inline-flex", alignItems: "center", gap: 7, background: INK, color: CREAM_HI,
    border: "none", borderRadius: 9, padding: "9px 15px", fontFamily: UI, fontSize: 13,
    fontWeight: 700, letterSpacing: 0.3, cursor: "pointer",
  };
  const ghostBtn = {
    display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
    border: `1px solid ${RULE}`, borderRadius: 9, padding: "9px 14px", fontFamily: UI,
    fontSize: 12.5, fontWeight: 600, color: INK, cursor: "pointer",
  };

  const chapterHuman = chapterIndex + 1;

  return (
    <div
      role="dialog"
      ref={dialogRef}
      className={cleanPreview ? "fw-reader-clean-dialog" : undefined}
      data-clean-reader-layer={cleanPreview ? "10050" : undefined}
      tabIndex={cleanPreview ? -1 : undefined}
      aria-modal={cleanPreview ? "true" : "false"}
      aria-label={cleanPreview ? "Your note" : "A moment with this chapter"}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10050, display: "flex",
        alignItems: "flex-end", justifyContent: "center", background: cleanPreview ? "rgba(25,21,16,0.3)" : "rgba(36,26,38,0.42)",
      }}
    >
      {cleanPreview && <CleanReaderDialogStyles />}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fw-sheet-safe"
        style={{
          background: CREAM, width: "100%", maxWidth: 480, borderRadius: "18px 18px 0 0",
          padding: "20px 20px 26px", maxHeight: "86vh", overflowY: "auto",
          overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
          boxShadow: "0 -8px 32px rgba(36,26,38,0.22)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", color: GOLD }}>
            <BookOpen size={13} /> {cleanPreview ? "Your note" : anytime ? "A moment to reflect · Jess" : `After chapter ${chapterHuman} · Jess`}
          </span>
          <button type="button" onClick={close} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: MUTED, padding: 4, display: "inline-flex" }}>
            <X size={18} />
          </button>
        </div>

        {cleanPreview && sourceContext && <p id={`${fieldId}-source`} style={{ fontFamily: UI, fontSize: 13, lineHeight: 1.6, color: MUTED, margin: "0 0 12px" }}>{sourceContext}</p>}

        {/* 1 — projective prompt + private reflection */}
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, lineHeight: 1.42, color: INK, margin: "0 0 14px" }}>
          {prompt.prompt}
        </p>
        {cleanPreview && <label htmlFor={fieldId}>Your note</label>}
        <textarea
          id={cleanPreview ? fieldId : undefined}
          aria-describedby={cleanPreview ? `${fieldId}-device${sourceContext ? ` ${fieldId}-source` : ""}` : undefined}
          value={reflection}
          onChange={(e) => { setReflection(e.target.value); setSavedNote(""); setSaveError(""); }}
          maxLength={600}
          rows={3}
          placeholder="A line is plenty — for yourself, or leave it blank."
          style={inputStyle}
        />
        {cleanPreview && <p id={`${fieldId}-device`} style={{ fontFamily: UI, fontSize: 12, color: MUTED, margin: "8px 0 0" }}>On this device</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 9 }}>
          <button type="button" onClick={saveSolo} disabled={!reflection.trim()} style={{ ...ghostBtn, opacity: reflection.trim() ? 1 : 0.5 }}>
            {cleanPreview ? "Keep my note" : "Keep this for me"}
          </button>
          {inClub && (
            <button type="button" onClick={shareToRoom} disabled={!reflection.trim()} style={{ ...primaryBtn, opacity: reflection.trim() ? 1 : 0.5 }}>
              <Send size={13} /> Add to the room
            </button>
          )}
          {savedNote && <span role="status" style={{ fontFamily: UI, fontSize: 12, color: MUTED }}>{savedNote}</span>}
          {saveError && <span role="alert" style={{ fontFamily: UI, fontSize: 12, color: INK }}>{saveError}</span>}
        </div>

        {/* 2 — guess the next chapter (projective prediction -> warm aggregate). Chapter-end only —
            an anytime mid-read reflection doesn't ask you to guess ahead. */}
        {!anytime && (<>
        <div style={{ borderTop: `1px solid ${RULE}`, marginTop: 18, paddingTop: 16 }}>
          <p style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>
            {hasReveal ? "What the room imagined" : "Guess what comes next"}
          </p>

          {/* The input — offered whenever YOU haven't guessed yet, even if the reveal is already up
              (you can still add your hunch to the warm whole). */}
          {!guessed && (
            <>
              {cleanPreview && <label htmlFor={`${fieldId}-hunch`}>Your hunch</label>}
              <textarea
                id={cleanPreview ? `${fieldId}-hunch` : undefined}
                value={guess}
                onChange={(e) => { setGuess(e.target.value); setGuessError(""); }}
                disabled={guessBusy}
                maxLength={300}
                rows={2}
                placeholder="What do you think happens next? No right answer — just a hunch."
                style={inputStyle}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={sendGuess} disabled={!guess.trim() || guessBusy} style={{ ...primaryBtn, opacity: guess.trim() ? 1 : 0.5 }}>
                  <Send size={13} /> {guessBusy ? "Sending…" : "Add my hunch"}
                </button>
              </div>
              {guessError && <p role="alert" style={{ fontFamily: UI, fontSize: 13, color: INK }}>{guessError}</p>}
            </>
          )}

          {/* The reveal — shown to anyone who reached this chapter once the k-floor is met. Never
              ranked, never "who was right" — Jess gathers the warm whole of it. */}
          {hasReveal ? (
            <div style={{ marginTop: guessed ? 0 : 14 }}>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK, margin: "0 0 10px" }}>
                {guessed ? "Your hunch is in. " : "You’re reading this with others. "}
                Here{"’"}s what the room imagined would come next — no winners, just us.
              </p>
              {reveal.slice(0, 12).map((l, i) => (
                <p key={i} style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.5, color: INK, margin: "0 0 7px", paddingLeft: 12, borderLeft: `2px solid ${RULE}` }}>{l}</p>
              ))}
            </div>
          ) : guessed ? (
            reveal === null ? (
              <p style={{ fontFamily: UI, fontSize: 13, color: MUTED, margin: 0 }}>Gathering what the room imagined…</p>
            ) : (
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, lineHeight: 1.5, color: INK, margin: 0 }}>
                Your hunch is in. When a few more readers reach here, Jess will gather what everyone imagined — no winners, just us.
              </p>
            )
          ) : null}
        </div>

        {/* 3 — shared-read cohort milestone (k-floored; warm, never a race) */}
        <div style={{ borderTop: `1px solid ${RULE}`, marginTop: 18, paddingTop: 14 }}>
          {typeof cohort === "number" ? (
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: INK, margin: 0 }}>
              {cohort} of you have reached chapter {chapterHuman}. You{"’"}re reading it together, at your own pace.
            </p>
          ) : (
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: MUTED, margin: 0 }}>
              You{"’"}re among the early readers here — no rush, no race.
            </p>
          )}
        </div>

        </>)}

        {/* Discuss — straight to THIS book's own thread (Book Club / readers' corner), never the
            generic Community page. */}
        {communityHref && (
          <div style={{ borderTop: `1px solid ${RULE}`, marginTop: 18, paddingTop: 14 }}>
            <Link
              to={communityHref}
              onClick={close}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 13, fontWeight: 700, color: INK, textDecoration: "none", padding: "9px 14px", borderRadius: 9, border: `1px solid ${RULE}` }}
            >
              <Users size={14} /> {inClub ? "Discuss this in the Book Club" : "Discuss this in the readers' corner"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChapterEndCard(props) {
  // A different source/chapter starts from its own saved text, never the previous
  // chapter's unsaved draft. Existing keys and full reflections are preserved.
  return <ChapterEndCardContent key={`${props.bookId}:${props.chapterIndex}`} {...props} />;
}
