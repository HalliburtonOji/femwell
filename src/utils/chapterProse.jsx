// chapterProse — light markdown for AUTHORED chapter text (the Daily Story / fiction rows
// store markdown: `## Chapter N — Title` headings and **bold** / *italic* emphasis). Readers
// were dumping this raw, so `## Chapter 14 — The Envelope` printed literally. This renders it
// properly WITHOUT pulling in a full markdown dependency: headings become styled headings,
// emphasis becomes <strong>/<em>, everything else is a paragraph.
//
// Scope is deliberately small (headings + inline emphasis) — chapters don't use lists/links/
// code, and a narrow renderer can't mangle prose the way a permissive one can.
import React from "react";

// inline **bold**, *italic*, _italic_ → nodes. Unmatched markers stay literal (safe default).
export function mdInline(text) {
  const str = String(text || "");
  const nodes = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*\s][^*]*?)\*|_([^_\s][^_]*?)_)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(str))) {
    if (m.index > last) nodes.push(str.slice(last, m.index));
    if (m[2] != null) nodes.push(<strong key={k++}>{m[2]}</strong>);
    else nodes.push(<em key={k++}>{m[3] != null ? m[3] : m[4]}</em>);
    last = re.lastIndex;
  }
  if (last < str.length) nodes.push(str.slice(last));
  return nodes.length ? nodes : [str];
}

export const isMdHeading = (p) => /^\s*#{1,6}\s+\S/.test(String(p || ""));
export const mdHeadingLevel = (p) => (String(p || "").match(/^\s*(#{1,6})\s/) || [, ""])[1].length;
export const mdHeadingText = (p) => String(p || "").trim().replace(/^#{1,6}\s+/, "").trim();

// Split authored text into blocks on blank lines (paragraphs + heading lines).
export const mdBlocks = (text) =>
  String(text || "").replace(/\r/g, "").split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);

// Render a single block as the right element. `p` renderer keeps the caller's own <p> styling
// via `pStyle`; headings get a serif chapter-title treatment tinted by `accent`.
export function ChapterBlock({ block, accent, pStyle, headingStyle, keyIndex }) {
  if (isMdHeading(block)) {
    return (
      <div key={keyIndex} style={{
        fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600,
        fontSize: mdHeadingLevel(block) <= 2 ? 19 : 16.5, lineHeight: 1.2,
        color: accent || '#BC2E27', margin: '2px 0 10px', ...(headingStyle || {}),
      }}>{mdInline(mdHeadingText(block))}</div>
    );
  }
  return <p key={keyIndex} style={pStyle}>{mdInline(block)}</p>;
}

// Whole authored passage → array of elements. `pStyle` is applied to each paragraph so the
// caller's reading-column typography is preserved.
export function ChapterProse({ text, accent, pStyle }) {
  return mdBlocks(text).map((b, i) => (
    <ChapterBlock key={i} keyIndex={i} block={b} accent={accent} pStyle={pStyle} />
  ));
}

export default ChapterProse;
