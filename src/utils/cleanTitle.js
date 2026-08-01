// cleanTitle — strip stray emphasis markers from INGESTED titles so a creator's "The *PERFECT*
// Wellness Routine" doesn't surface literal asterisks in FemWell's editorial shelves. Removes
// markdown-ish emphasis (**bold**, *italic*, ~strike~, _emphasis_) while leaving ordinary
// punctuation and intra-word characters (e.g. a file_name or A&E) intact. Conservative: only
// underscores that WRAP a word (emphasis) are dropped, never ones inside a token.
export function cleanTitle(str) {
  if (str == null) return str;
  return String(str)
    .replace(/[*~]+/g, "")                          // asterisks + tildes (bold/italic/strike)
    .replace(/(^|[\s([{"'—-])_+(?=\S)/g, "$1")      // opening _emphasis
    .replace(/(?<=\S)_+(?=[\s)\]}"'.,!?;:—-]|$)/g, "") // closing emphasis_
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default cleanTitle;
