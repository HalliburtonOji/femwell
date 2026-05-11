// fetchGutenbergBook:
// Pull the plain-text version of a Project Gutenberg book (public domain),
// strip Gutenberg's boilerplate header/footer, and return clean text + the
// title/author the site reports for that ID. BookReader.jsx splits the body
// into chapters and renders it through the FemWell Kindle reader.
//
// Body: { gutenberg_id: number }
// Returns: { text, title, author, source_url } | { error }
//
// Notes:
// - Auth-gated (same pattern as expandContent). Project Gutenberg is free and
//   public domain so there's no licensing question; the gate is purely so we
//   don't get scraped through a public endpoint.
// - Chrome UA + 20s timeout via AbortSignal — Gutenberg can be slow for big
//   books served from the .txt mirror.
// - We try a few URL variants because Gutenberg's filename scheme drifts:
//     /cache/epub/{id}/pg{id}.txt              (most common)
//     /files/{id}/{id}.txt                     (older books)
//     /files/{id}/{id}-0.txt                   (UTF-8 variant)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Project Gutenberg boilerplate markers — text between START and END is the
// actual book. Markers vary slightly so we use regexes.
const START_RE =
  /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*/i;
const END_RE =
  /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*/i;

const URL_VARIANTS = (id: number): string[] => [
  `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
  `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
  `https://www.gutenberg.org/files/${id}/${id}.txt`,
];

async function fetchOnce(url: string, timeoutMs = 20000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': CHROME_UA, Accept: 'text/plain, */*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseTitleAuthor(raw: string): { title: string; author: string } {
  // Project Gutenberg books start with a metadata block of the form:
  //   Title: Pride and Prejudice
  //   Author: Jane Austen
  // before the START marker. Pull from there.
  const head = raw.slice(0, 4000);
  const title = (head.match(/^\s*Title:\s*(.+)$/im) || [])[1] || '';
  const author = (head.match(/^\s*Author:\s*(.+)$/im) || [])[1] || '';
  return {
    title: title.trim(),
    author: author.trim(),
  };
}

function stripBoilerplate(raw: string): string {
  if (!raw) return '';
  const startMatch = raw.match(START_RE);
  const endMatch = raw.match(END_RE);
  let body = raw;
  if (startMatch) body = body.slice(startMatch.index! + startMatch[0].length);
  if (endMatch) {
    // Re-find END in the trimmed string in case the body now begins after the
    // original startMatch index.
    const endIdx = body.search(END_RE);
    if (endIdx >= 0) body = body.slice(0, endIdx);
  }
  return body.trim();
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: { gutenberg_id?: number };
  try { payload = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const id = Number(payload?.gutenberg_id);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: 'Missing or invalid gutenberg_id' }, { status: 400 });
  }

  let raw: string | null = null;
  let source_url = '';
  for (const url of URL_VARIANTS(id)) {
    raw = await fetchOnce(url);
    if (raw) { source_url = url; break; }
  }
  if (!raw) {
    return Response.json(
      { error: 'Could not fetch this book from Project Gutenberg.' },
      { status: 502 },
    );
  }

  const { title, author } = parseTitleAuthor(raw);
  const text = stripBoilerplate(raw);

  if (!text || text.length < 200) {
    return Response.json(
      { error: 'Book content unavailable after stripping boilerplate.' },
      { status: 502 },
    );
  }

  return Response.json({
    text,
    title,
    author,
    source_url: `https://www.gutenberg.org/ebooks/${id}`,
  });
});
