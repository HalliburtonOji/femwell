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
