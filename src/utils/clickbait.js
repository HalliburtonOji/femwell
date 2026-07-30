// isClickbait — a conservative gate that keeps ingested YouTube/podcast titles that shout
// ("The simplest breakfast hack that ALL MOMS need to hear…") out of FemWell's warm shelves.
// Ingested titles are the creator's words, not ours, but they surface in our editorial context,
// so the loudest ones read as off-brand. Deliberately CAUTIOUS — it should skip the egregious,
// never cull merely enthusiastic titles — because a false positive silently drops real content.
//
// A title is clickbait if it hits a named shout-phrase, OR shows two "loud" tells at once
// (screaming caps run + hype word / bang-cluster), so a single stray ALL-CAPS acronym is safe.
const PHRASES = [
  /you\s?won'?t\s?believe/i, /this\s?one\s?(weird|simple|trick|thing)/i, /doctors?\s?(hate|don'?t\s?want)/i,
  /will\s?(blow|change)\s?your\s?(mind|life)/i, /mind[-\s]?blowing/i, /no\s?one\s?(talks?|tells?)\s?(about|you)/i,
  /what\s?happens?\s?when/i, /gone\s?(wrong|viral)/i, /shocking(ly)?/i, /you\s?need\s?to\s?(hear|see|know)/i,
  /before\s?it'?s\s?too\s?late/i, /the\s?truth\s?about/i, /nobody\s?is\s?talking/i, /\bhack(s)?\b.*\b(need|must|every)/i,
];
// two or more consecutive ALL-CAPS words (≥3 letters each) — "ALL MOMS", "MUST WATCH NOW"
const CAPS_RUN = /\b[A-Z][A-Z]{2,}\b(?:\s+\b[A-Z][A-Z]{2,}\b)+/;
const HYPE = /\b(hack|hacks|secret|trick|shocking|insane|crazy|ultimate|obsessed|viral|life[-\s]?changing)\b/i;
const BANGS = /[!?]{2,}|!\s*[A-Z]/; // "!!", "?!", or a bang followed by more shouting

export function isClickbait(title) {
  const t = String(title || "").trim();
  if (!t) return false;
  if (PHRASES.some((re) => re.test(t))) return true;
  let loud = 0;
  if (CAPS_RUN.test(t)) loud++;
  if (BANGS.test(t)) loud++;
  if (HYPE.test(t)) loud++;
  return loud >= 2;
}

export default isClickbait;
