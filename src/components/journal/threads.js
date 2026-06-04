// threads — shared helpers for the Journal "threads" system (Phase 1b).
//
// A thread is a named series an entry belongs to. We model threads on the
// EXISTING `tags` array (no schema change): an entry's PRIMARY thread is its
// first tag (tags[0]) — exactly what the Ledger chip already shows — and an
// entry "belongs to" any thread that appears in its tags. This reuses the
// data Phase 1 already writes; nothing new is required on the entity.

import { entryDateObj } from "./journalDates";

function norm(s) { return String(s || "").trim().toLowerCase(); }

// The primary thread of an entry (its first tag), or null.
export function threadOf(entry) {
  return Array.isArray(entry?.tags) && entry.tags.length
    ? String(entry.tags[0] || "").trim() || null
    : null;
}

// Does an entry belong to the named thread? (case-insensitive, any tag).
export function entryInThread(entry, thread) {
  if (!thread) return false;
  const tags = Array.isArray(entry?.tags) ? entry.tags : [];
  return tags.some((t) => norm(t) === norm(thread));
}

// All entries belonging to a thread, most recent first.
export function entriesInThread(entries, thread) {
  return (entries || [])
    .filter((e) => entryInThread(e, thread))
    .sort((a, b) => (entryDateObj(b)?.getTime() || 0) - (entryDateObj(a)?.getTime() || 0));
}

// Distinct threads across all entries, with count + most-recent date,
// ordered by recency. Each tag (not just the first) counts as a thread the
// entry belongs to, so browsing surfaces every series the writer has named.
export function collectThreads(entries) {
  const map = new Map(); // normkey -> { name, count, last }
  (entries || []).forEach((e) => {
    const tags = Array.isArray(e?.tags) ? e.tags : [];
    const d = entryDateObj(e);
    const seen = new Set();
    tags.map((t) => String(t || "").trim()).filter(Boolean).forEach((t) => {
      const k = t.toLowerCase();
      if (seen.has(k)) return; // count an entry once per thread
      seen.add(k);
      const cur = map.get(k);
      if (cur) {
        cur.count += 1;
        if (d && (!cur.last || d > cur.last)) cur.last = d;
      } else {
        map.set(k, { name: t, count: 1, last: d || null });
      }
    });
  });
  return [...map.values()].sort(
    (a, b) => (b.last?.getTime() || 0) - (a.last?.getTime() || 0),
  );
}
