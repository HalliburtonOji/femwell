// voiceTranscribe — small on-device helpers that raise Web Speech dictation
// quality with NO new dependency and NO network call. Three light passes:
//   1. spoken punctuation commands ("full stop" -> ".", "new line" -> \n, ...)
//   2. spacing tidy around punctuation
//   3. capitalisation (sentence starts + standalone "i")
// Used live (no forced trailing period) while speaking, and once more on "keep"
// (forces a closing mark). On-device only; the words never leave the device here.

const SPOKEN = [
  [/\b(full stop|period)\b/gi, "."],
  [/\b(comma)\b/gi, ","],
  [/\b(question mark)\b/gi, "?"],
  [/\b(exclamation mark|exclamation point)\b/gi, "!"],
  [/\b(semicolon)\b/gi, ";"],
  [/\b(colon)\b/gi, ":"],
  [/\b(new paragraph)\b/gi, "\n\n"],
  [/\b(new line|next line)\b/gi, "\n"],
];

export function applySpokenPunctuation(input) {
  let s = String(input || "");
  for (const [re, rep] of SPOKEN) s = s.replace(re, rep);
  // tighten spaces: no space before . , ! ? ; : and exactly one after
  s = s.replace(/\s+([.,!?;:])/g, "$1").replace(/([.,!?;:])(?=[^\s\d])/g, "$1 ");
  s = s.replace(/[ \t]*\n[ \t]*/g, "\n");
  return s;
}

function capitalise(s) {
  // first letter of each sentence (start, after . ! ?, or after a newline)
  let out = s.replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (_, p, c) => p + c.toUpperCase());
  out = out.replace(/\bi\b/g, "I");       // standalone "i" -> "I"
  out = out.replace(/\bi'(m|ll|ve|d)\b/gi, (m) => "I'" + m.slice(2)); // i'm -> I'm, etc.
  return out;
}

// Live display while speaking — punctuation + caps, but DON'T force a trailing
// period mid-sentence.
export function liveTranscript(input) {
  const s = capitalise(applySpokenPunctuation(input).replace(/[ \t]{2,}/g, " "));
  return s.replace(/^\s+/, "");
}

// Final tidy when the words are kept — same passes, plus a closing mark.
export function tidyTranscript(input) {
  let s = liveTranscript(input).trim();
  if (s && !/[.!?]$/.test(s)) s += ".";
  return s;
}
