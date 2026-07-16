// ─────────────────────────────────────────────────────────────────────────────
// ReadingColumn.jsx — THE SHARED READING-CRAFT FOUNDATION (BRAND_IDENTITY §6.7.8).
//
// The ONE thing allowed to set MEASURE, side PADDING and LEADING on any reading surface
// (article · fiction · book · daily story · horoscope · the in-card expand). Six surfaces
// styling long-form text separately is precisely how craft drifts — so they all come here.
//
// RESEARCHED (16/07/2026 · mnt/femwell/research_reading_foundation.md + research_reader_and_cards.md):
//
//  1. MEASURE IS IN `ex`, NOT `ch`. `1ch` is the advance of the "0" glyph — in a proportional
//     face it runs **20–30% WIDER** than the average character, so the popular `max-width:65ch`
//     actually yields ~80–85 characters (at/over the WCAG 80 cap). Tailwind's `prose` ships that
//     overshoot; copying it copies the bug. USWDS — the only system that tokenises measure —
//     uses `ex`, where its 66-character target is **60ex**. That's our default.
//  2. SELF-CLAMPING, NEVER `max-width` UNDER A PADDED ANCESTOR: `width: min(measure, 100%)` +
//     `margin-inline: auto`. A `max-width` inside padded parents is exactly the double-framing
//     bug (a card inside a sheet inside a page) that starved our reading text.
//  3. SOLE PADDING OWNER. **At 390px the max-width never binds — PADDING *IS* MEASURE.** So no
//     parent card/sheet/safe-area may add side padding to reading text. This is structural, not
//     typographic: it is the whole bug.
//  4. NEVER SHRINK TYPE TO BUY CHARACTERS. 45 CPL is **unreachable** at 390px with readable type
//     (≈38 CPL at 18px is the honest arithmetic). Accept **38–42**. The "<45 is danger" line is
//     desktop-derived, and positive polarity (our cream) pays *more* as type gets smaller.
//     Floor: 18px immersive / 16px absolute.
//  5. LEADING ≥ 1.5.
//  6. INDENT **XOR** SPACE (Butterick) — enforced structurally by `variant`, not by copy
//     discipline: article/horoscope/card → spaced, no indent. fiction/book/dailyStory → indent,
//     no gap. This single switch is what separates our readers.
//  7. ESCAPE HATCHES ON DAY ONE (`bleed`, `measure="none"`) — a component with no legal exit
//     gets copy-pasted and mutated, and that IS drift.
//
// NOT here (researched, deliberately absent): no article progress bar (zero evidence it helps;
// 32 experiments show progress bars BACKFIRE under high early investment — a long read is
// exactly that). Read-time belongs to the caller and only when the number is SMALL (see
// readTimeLabel) — stating a large time cost makes FEWER people finish.
//
// ⚠️ THE INVISIBLE TRAP: `src/index.css` remaps BOTH 'Inter' AND 'Fraunces' to Cormorant at
// `size-adjust: 150%`. A surface declaring those renders **1.5× its nominal px** — which is why
// the two reading engines sat at ~29 CPL while every SERIF surface was a healthy ~45–50. This
// column always uses the un-adjusted SERIF stack, so a size here means what it says.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { T, SERIF } from "@/components/journal/Editorial";

// The reading tokens. Measure is a TOKEN — most systems tokenise size/leading and leave measure
// to whoever writes the page; that is how six surfaces drift apart.
export const READING = {
  measure: "60ex",   // USWDS measure-2 ≈ 66 characters in a proportional face. NOT 65ch.
  narrow: "50ex",
  sizeImmersive: 18, // the immersive floor — never go below to buy CPL
  sizeMin: 16,       // absolute floor
  leading: 1.62,     // ≥1.5
  padX: 22,          // the ONLY side padding on reading text
};

// article/horoscope/card → spaced paragraphs, no indent. fiction/book/dailyStory → indent, no gap.
const INDENT_VARIANTS = ["fiction", "book", "dailyStory", "story"];

const READ_CSS = `
.fw-read p { margin: 0; }
.fw-read-spaced p + p { margin-top: 0.9em; }
.fw-read-indent p + p { text-indent: 1.2em; }
.fw-read blockquote { margin: 1em 0; padding-left: 0.9em; border-left: 2px solid ${T.gold}; font-style: italic; }
.fw-read h2, .fw-read h3 { font-family: ${SERIF}; color: #7A1A12; line-height: 1.2; margin: 1.4em 0 0.4em; }
.fw-read a { color: #7A1A12; }
`;

/**
 * The one reading column.
 * @param variant  "article" | "horoscope" | "card" (spaced) · "fiction" | "book" | "dailyStory" (indent)
 * @param size     px (defaults to the immersive floor; never pass below READING.sizeMin)
 * @param measure  an `ex` measure, or "none" to opt out (escape hatch)
 * @param bleed    true → full width, no side padding (escape hatch for media/full-bleed)
 */
export default function ReadingColumn({
  variant = "article", size, measure, bleed = false, color = T.ink, style, className = "", children,
}) {
  const indent = INDENT_VARIANTS.includes(variant);
  const fs = Math.max(READING.sizeMin, size || READING.sizeImmersive);
  const width = bleed || measure === "none" ? "100%" : `min(${measure || READING.measure}, 100%)`;
  return (
    <div
      className={`fw-read fw-read-${indent ? "indent" : "spaced"} ${className}`}
      style={{
        width, marginInline: "auto",
        paddingInline: bleed ? 0 : READING.padX,   // the SOLE padding owner
        fontFamily: SERIF,                          // un-adjusted — dodges the size-adjust trap
        fontSize: fs, lineHeight: READING.leading, color,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <style>{READ_CSS}</style>
      {children}
    </div>
  );
}

// ── read-time — permission when SMALL, a deterrent when LARGE ────────────────
// Medium's own claim is modest ("a ballpark figure… before the bus comes"); the "+40%
// engagement" number is vendor marketing with no method (dropped). And Irrational Labs found
// that stating a 10-minute cost made FEWER people finish. So: say "4 min read" proudly; past
// the threshold, offer the next BREAK instead of one intimidating total.
export const WPM = 200;
export function readMinutes(words) { return Math.max(1, Math.round((Number(words) || 0) / WPM)); }
export function readTimeLabel(words, { breakMins = null, threshold = 10 } = {}) {
  const m = readMinutes(words);
  if (m < threshold) return `${m} min read`;
  if (breakMins) return `${breakMins} min to the next break`;
  return null;   // better to say nothing than to hand her a number that puts her off
}
export function countWords(text) {
  return String(text || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}
