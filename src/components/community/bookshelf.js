// bookshelf.js — Community Library shelf persistence (feature #3 sync).
//
// Source of truth when signed in = the UserBook entity (private, per-user → syncs across
// devices). DUAL-READ + LOCAL FALLBACK: the device-local shelf (localStorage) is kept as a
// mirror + offline/unauthed fallback, and any book shelved locally-only is MIGRATED up on
// the first authed load, so nothing already on a shelf ever disappears. All entity calls are
// guarded + fail-open (a wedged backend never loses a book or blocks the UI). The `Book` cache
// is a best-effort dedup lookup, never on the critical path.

import { base44 } from "@/api/base44Client";

const SHELF_KEY = "fw_bookshelf";
const nowISO = () => { try { return new Date().toISOString(); } catch { return ""; } };
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);

// Stable dedup key: gutenberg id > open-library id > title-author slug.
export function bookKey(b) {
  if (b?.book_key) return b.book_key;
  if (b?.gutenberg_id) return `g:${b.gutenberg_id}`;
  if (b?.olid) return `ol:${b.olid}`;
  return `s:${slug(`${b?.title || ""}-${b?.author || ""}`)}`;
}
function norm(b) {
  return { key: bookKey(b), title: b.title, author: b.author || "", gutenberg_id: b.gutenberg_id || null, olid: b.olid || null, status: b.status || "want", cover_hint: b.cover_hint || null, source: b.source || "manual" };
}

// PRIVACY — the local mirror is scoped PER USER. A single global key leaked one woman's shelf
// into the next account on a shared device (and migrated it UP into her UserBook). Scoping by
// user_id keeps each shelf separate; unauthed falls back to the shared offline key. Legacy global
// data is intentionally NOT migrated into a scoped shelf (that ambiguity was the bleed) — the
// per-user UserBook rows are the source of truth and repopulate the scoped mirror on load.
const shelfKeyFor = (userId) => (userId ? `${SHELF_KEY}::${userId}` : SHELF_KEY);
export function readLocal(userId) { try { return (JSON.parse(localStorage.getItem(shelfKeyFor(userId)) || "[]") || []).map(norm); } catch { return []; } }
function writeLocal(userId, a) { try { localStorage.setItem(shelfKeyFor(userId), JSON.stringify(a.map(norm))); } catch { /* ignore */ } }

// Best-effort shared Book cache upsert — fail-open, never awaited on the UI path.
function cacheBook(item) {
  const key = bookKey(item);
  (async () => {
    try {
      const existing = await base44.entities.Book.filter({ book_key: key }, "-created_date", 1).catch(() => []);
      if (Array.isArray(existing) && existing.length) return;
      await base44.entities.Book.create({ book_key: key, title: item.title, author: item.author || "", gutenberg_id: item.gutenberg_id || undefined, olid: item.olid || undefined, cover_hint: item.cover_hint || undefined, source: item.source || "manual", created_at: nowISO() }).catch(() => {});
    } catch { /* fail-open */ }
  })();
}

function createRow(userId, item) {
  cacheBook(item);
  (async () => {
    try {
      await base44.entities.UserBook.create({ user_id: userId, book_key: bookKey(item), title: item.title, author: item.author || "", gutenberg_id: item.gutenberg_id || undefined, olid: item.olid || undefined, status: item.status || "want", cover_hint: item.cover_hint || undefined, source: item.source || "manual", added_at: nowISO(), updated_at: nowISO() }).catch(() => {});
    } catch { /* fail-open — the local mirror already holds it */ }
  })();
}

async function findRowId(userId, key) {
  try { const rows = await base44.entities.UserBook.filter({ user_id: userId, book_key: key }, "-created_date", 1).catch(() => []); return Array.isArray(rows) && rows[0]?.id ? rows[0].id : null; }
  catch { return null; }
}

// Load the shelf: server (authed) merged with local-only rows (migrated up), else local.
export async function loadShelf(userId) {
  const local = readLocal(userId);
  if (!userId) return local.map((l) => ({ ...l, _row: null }));
  try {
    const rows = await base44.entities.UserBook.filter({ user_id: userId }, "-created_date", 300);
    const server = (Array.isArray(rows) ? rows : []).map((r) => ({ _row: r.id, key: r.book_key, title: r.title, author: r.author || "", gutenberg_id: r.gutenberg_id || null, olid: r.olid || null, status: r.status || "want", cover_hint: r.cover_hint || null, source: r.source || "manual" }));
    const serverKeys = new Set(server.map((s) => s.key));
    const localOnly = local.filter((l) => !serverKeys.has(l.key));   // only THIS user's scoped local rows
    localOnly.forEach((l) => createRow(userId, l));   // migrate up (fire-and-forget); keep showing meanwhile
    const merged = [...server, ...localOnly.map((l) => ({ ...l, _row: null }))];
    writeLocal(userId, merged);   // refresh the local mirror so it never loses a synced book
    return merged;
  } catch { return local.map((l) => ({ ...l, _row: null })); }
}

// Add (optimistic local + guarded server create, deduped). Returns the updated list.
export async function addBook(userId, book) {
  const item = norm(book);
  const local = readLocal(userId);
  const list = local.some((l) => l.key === item.key) ? local : [item, ...local];
  writeLocal(userId, list);
  if (userId) {
    const existing = await findRowId(userId, item.key);
    if (!existing) createRow(userId, item);
  }
  return list.map((l) => ({ ...l, _row: null }));
}

export async function setStatus(userId, key, status) {
  const list = readLocal(userId).map((l) => (l.key === key ? { ...l, status } : l));
  writeLocal(userId, list);
  if (userId) { const id = await findRowId(userId, key); if (id) base44.entities.UserBook.update(id, { status, updated_at: nowISO() }).catch(() => {}); }
  return list.map((l) => ({ ...l, _row: null }));
}

export async function removeBook(userId, key) {
  const list = readLocal(userId).filter((l) => l.key !== key);
  writeLocal(userId, list);
  if (userId) { const id = await findRowId(userId, key); if (id) base44.entities.UserBook.delete(id).catch(() => {}); }
  return list.map((l) => ({ ...l, _row: null }));
}
