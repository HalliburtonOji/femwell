// Existing content, honestly fitted and identified. No alternate persistence store.
export function authoredJoyId(kind, title) {
  let hash = 2166136261;
  for (const ch of String(title || '').normalize('NFKC').trim()) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  return `${kind}-${(hash >>> 0).toString(36)}`;
}

export function timeFit(rows, seconds) {
  return [...(rows || [])].filter(row => Number(row.duration_seconds) > 0 && Number(row.duration_seconds) <= seconds)
    .sort((a, b) => Number(a.duration_seconds) - Number(b.duration_seconds))[0] || null;
}

export function gutenbergReaderHref(item) {
  const raw=item?._raw || item;
  const id=item?._gutenbergId || item?.gutenbergId || raw?._gutenbergId || raw?.gutenbergId;
  return /^[1-9]\d*$/.test(String(id || '')) ? `/BookReader?gutenberg_id=${id}` : null;
}

export function rankedReads(feed, rows) {
  const seen = new Set();
  return [...(feed || []), ...(rows || [])].filter(row => row?.id && row.title && !seen.has(row.id) && seen.add(row.id));
}

export function continuePositions(storage) {
  const rows = [];
  try {
    for (const key of Object.keys(storage)) {
      try {
        if (key.startsWith('fw_reader_pos_')) {
          const pos = JSON.parse(storage.getItem(key) || '{}');
          rows.push({ ...pos, bookId: key.slice(14), kind: 'book' });
        } else if (key.startsWith('fw_article_pos_')) {
          const scrollY = Number(storage.getItem(key));
          if (scrollY > 40) rows.push({ bookId: key.slice(15), kind: 'article', scrollY, ts: 0 });
        }
      } catch { /* one damaged position cannot hide the others */ }
    }
  } catch { return []; }
  return rows.filter(p => p.bookId).sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0));
}
// Both the initial/background shell load and Sky's settled publisher use this
// owner/date contract, so a late stale fetch cannot undo a newly produced reading.
export function newestOwnedReading(previous, incoming, ownerId, preferCurrent = false) {
  const valid = row => row?.user_id === ownerId && !!ownerId && typeof row.id === "string" && !!row.id.trim() && /^\d{4}-\d{2}-\d{2}$/.test(row.reading_date || "") && !Number.isNaN(Date.parse(`${row.reading_date}T12:00:00Z`)) && new Date(`${row.reading_date}T12:00:00Z`).toISOString().slice(0,10) === row.reading_date;
  const current = valid(previous) ? previous : null;
  if (!valid(incoming)) return current;
  if (!current) return incoming;
  if (current.reading_date !== incoming.reading_date) return current.reading_date > incoming.reading_date ? current : incoming;
  // Same record: a confirmed update wins. Different records: follow the
  // producer's newest-created ordering, preserving every older exact ID.
  const fields = current.id === incoming.id ? ["updated_date", "updated_at", "created_date", "created_at"] : ["created_date", "created_at"];
  const time = row => fields.map(field => Date.parse(row[field] || "")).find(Number.isFinite);
  const before = time(current), after = time(incoming);
  if (Number.isFinite(before) && Number.isFinite(after) && before !== after) return before > after ? current : incoming;
  return preferCurrent ? current : incoming;
}
