// bookCover.js
// Deterministic cover art for FemWell-generated fiction (no image_url yet) and
// any other book record without a cover. We render a serif initial letter on
// a warm gradient — same brand palette as the rest of FemWell.
//
// Usage:
//   const { gradient, initial, accent } = getBookCover(book.title);
//   <div style={{ background: gradient }}>
//     <span style={{ color: accent }}>{initial}</span>
//   </div>
//
// Stable across reloads — the same title always picks the same gradient so
// the user doesn't see the cover flicker between palettes.

const PALETTES = [
  // Warm rose
  {
    gradient: "linear-gradient(135deg, #F0CFC4 0%, #C8847A 60%, #8E4A4A 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
  // Dusty mauve
  {
    gradient: "linear-gradient(135deg, #E8D4DA 0%, #B4889C 55%, #6E465E 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
  // Sage
  {
    gradient: "linear-gradient(135deg, #D9DDC5 0%, #98A687 55%, #4E5C46 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
  // Warm gold
  {
    gradient: "linear-gradient(135deg, #F1E0BA 0%, #C9A062 55%, #84612A 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
  // Plum-blue
  {
    gradient: "linear-gradient(135deg, #C5BFCC 0%, #7C7290 55%, #3E3654 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
  // Ember coral
  {
    gradient: "linear-gradient(135deg, #EFB69A 0%, #C46850 55%, #7A3325 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
  // Sea green
  {
    gradient: "linear-gradient(135deg, #BFD4C8 0%, #6B8E80 55%, #2E4D44 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
  // Twilight indigo
  {
    gradient: "linear-gradient(135deg, #BDC4D6 0%, #5A6480 55%, #2A3252 100%)",
    accent: "rgba(255,250,242,0.18)",
  },
];

const ARTICLES = new Set(["the", "a", "an"]);

function fnvHash(input) {
  let h = 0x811c9dc5;
  const s = String(input || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** First meaningful character of the title (skips leading "The", "A", "An"). */
export function getCoverInitial(title) {
  const t = String(title || "").trim();
  if (!t) return "·";
  const first = t.split(/\s+/)[0].toLowerCase();
  const significant = ARTICLES.has(first) ? t.split(/\s+/)[1] || t : t;
  const ch = significant.charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "·";
}

export function getCoverPalette(title) {
  const idx = fnvHash(title) % PALETTES.length;
  return PALETTES[idx];
}

/** Convenience: everything you need to render a cover in one call. */
export function getBookCover(title) {
  const palette = getCoverPalette(title);
  return {
    gradient: palette.gradient,
    accent: palette.accent,
    initial: getCoverInitial(title),
  };
}
