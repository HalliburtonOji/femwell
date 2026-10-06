// One private UserBook shelf, with an owner-scoped device mirror/offline fallback.
// Signed-in mutations acknowledge entity writes before changing the mirror.
import { base44 } from "@/api/base44Client";
const SHELF_KEY = "fw_bookshelf";
const STATUSES = new Set(["want", "reading", "finished", "set_aside"]);
const writes = new Map();
const revisions = new Map();
const nowISO = () => new Date().toISOString();
const slug = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
export function bookKey(b) {
  if (b?.book_key || b?.key) return b.book_key || b.key;
  if (b?.gutenberg_id) return "g:" + b.gutenberg_id;
  if (b?.olid) return "ol:" + b.olid;
  return "s:" + slug((b?.title || "") + "-" + (b?.author || ""));
}
function norm(b) {
  return { key: bookKey(b), title: b.title, author: b.author || "", gutenberg_id: b.gutenberg_id ? String(b.gutenberg_id) : null, olid: b.olid || null, status: STATUSES.has(b.status) ? b.status : "want", cover_hint: b.cover_hint || null, source: b.source || "manual" };
}
const shelfKeyFor = userId => userId ? SHELF_KEY + "::" + userId : SHELF_KEY;
export function readLocal(userId) {
  try { const rows = JSON.parse(localStorage.getItem(shelfKeyFor(userId)) || "[]"); return Array.isArray(rows) ? dedup(rows) : []; } catch { return []; }
}
function writeLocal(userId, rows) {
  try { localStorage.setItem(shelfKeyFor(userId), JSON.stringify(rows.map(row => ({ ...norm(row), _row: row._row || row.id || null, _sync: row._sync || (row._row || row.id ? "confirmed" : "device") })))); return true; } catch { return false; }
}
function dedup(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const item = { ...norm(row), _row: row.id || row._row || null, _sync: row._sync || (row.id || row._row ? "confirmed" : "device") };
    if (!groups.has(item.key)) groups.set(item.key, item);
  });
  return [...groups.values()];
}
function serial(userId, key, action) {
  const lock = (userId || "device") + ":" + key;
  const next = (writes.get(lock) || Promise.resolve()).catch(() => {}).then(action);
  writes.set(lock, next);
  const release = () => { if (writes.get(lock) === next) writes.delete(lock); };
  next.then(release, release);
  return next;
}
async function ownerRows(userId, key) {
  const all = [], seen = new Set();
  for (let skip = 0; ; skip += 150) {
    const page = await base44.entities.UserBook.filter({ user_id: userId, ...(key ? { book_key: key } : {}) }, "-created_date", 150, skip);
    if (!Array.isArray(page)) throw new Error("Couldn't read your shelf.");
    let added = 0;
    page.forEach(row => {
      if (row.user_id !== userId || (key && bookKey(row) !== key) || !row.id || seen.has(row.id)) return;
      seen.add(row.id); all.push(row); added++;
    });
    if (page.length < 150) return all;
    if (!added) throw new Error("Couldn't read the rest of your shelf. Try again.");
  }
}
function cacheBook(item) {
  void (async () => {
    try {
      const existing = await base44.entities.Book.filter({ book_key: item.key }, "-created_date", 1);
      if (!existing?.length) await base44.entities.Book.create({ book_key: item.key, title: item.title, author: item.author, gutenberg_id: item.gutenberg_id || undefined, olid: item.olid || undefined, cover_hint: item.cover_hint || undefined, source: item.source, created_at: nowISO() });
    } catch { /* Shared metadata is not the private write acknowledgement. */ }
  })();
}
async function createRow(userId, item) {
  const row = await base44.entities.UserBook.create({ user_id: userId, book_key: item.key, title: item.title, author: item.author, gutenberg_id: item.gutenberg_id || undefined, olid: item.olid || undefined, status: item.status, cover_hint: item.cover_hint || undefined, source: item.source, added_at: nowISO(), updated_at: nowISO() });
  if (!row?.id) throw new Error("Couldn't confirm the shelf change. Try again.");
  cacheBook(item);
  return { ...item, _row: row.id, _sync: "confirmed" };
}
function announce(userId) {
  revisions.set(userId || "device", (revisions.get(userId || "device") || 0) + 1);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("fw_bookshelf_changed", { detail: { userId } }));
}
export async function loadShelf(userId, { strict = false } = {}) {
  const local = readLocal(userId);
  if (!userId) return local;
  const revision = revisions.get(userId) || 0;
  try {
    const server = dedup(await ownerRows(userId));
    const keys = new Set(server.map(row => row.key));
    const localOnly = local.filter(row => !keys.has(row.key) && row._sync !== "confirmed" && !row._row);
    // Preserve existing migration of this owner's scoped local-only books.
    // Never attach the ambiguous global offline shelf to a signed-in account.
    let syncError = "";
    const migrated = await Promise.all(localOnly.map(item => serial(userId, item.key, async () => {
      try {
        const current = readLocal(userId).find(row => row.key === item.key);
        if (!current) return null;
        const existing = await ownerRows(userId, item.key);
        return existing.length ? dedup(existing)[0] : await createRow(userId, current);
      } catch { syncError = "Some books are on this device only. Try syncing your shelf again."; return item; }
    })));
    // A newer acknowledged write owns the mirror; an older fetch cannot rewind it.
    if ((revisions.get(userId) || 0) !== revision) return readLocal(userId);
    const merged = [...server, ...migrated.filter(Boolean)];
    writeLocal(userId, merged);
    if (syncError) merged.syncError = syncError;
    return merged;
  } catch (error) {
    if (strict) throw error;
    const fallback = local.map(row => ({ ...row, _sync: "device" }));
    fallback.syncError = "Couldn't refresh your shelf. Showing this device's copy.";
    return fallback;
  }
}
export function addBook(userId, book) {
  const item = norm(book);
  if (!item.title?.trim()) return Promise.reject(new Error("Add a book title first."));
  return serial(userId, item.key, async () => {
    let confirmed = item;
    if (userId) {
      const existing = await ownerRows(userId, item.key);
      if (existing.length) {
        // Preserve physical duplicate records; update their shared status.
        await Promise.all(existing.map(row => base44.entities.UserBook.update(row.id, { status: item.status, updated_at: nowISO() })));
        confirmed = { ...norm(existing[0]), status: item.status, _row: existing[0].id, _sync: "confirmed" };
      } else confirmed = await createRow(userId, item);
    }
    const list = [confirmed, ...readLocal(userId).filter(row => row.key !== item.key)];
    if (!writeLocal(userId, list) && !userId) throw new Error("Couldn't keep your shelf on this device.");
    announce(userId); return list;
  });
}
export function setStatus(userId, key, status) {
  if (!STATUSES.has(status)) return Promise.reject(new Error("Choose a reading status."));
  return serial(userId, key, async () => {
    let confirmed;
    if (userId) {
      const existing = await ownerRows(userId, key);
      if (!existing.length) {
        const local = readLocal(userId).find(row => row.key === key);
        if (!local) throw new Error("That book couldn't be found. Refresh your shelf.");
        confirmed = await createRow(userId, { ...local, status });
      } else {
        await Promise.all(existing.map(row => base44.entities.UserBook.update(row.id, { status, updated_at: nowISO() })));
        confirmed = { ...norm(existing[0]), status, _row: existing[0].id, _sync: "confirmed" };
      }
    } else {
      const local = readLocal(userId).find(row => row.key === key);
      if (!local) throw new Error("That book couldn't be found. Refresh your shelf.");
      confirmed = { ...local, status };
    }
    const list = [confirmed, ...readLocal(userId).filter(row => row.key !== key)];
    if (!writeLocal(userId, list) && !userId) throw new Error("Couldn't keep the change on this device.");
    announce(userId); return list;
  });
}
export function removeBook(userId, key) {
  return serial(userId, key, async () => {
    if (userId) {
      const rows = await ownerRows(userId, key);
      await Promise.all(rows.map(row => base44.entities.UserBook.delete(row.id)));
    }
    const list = readLocal(userId).filter(row => row.key !== key);
    if (!writeLocal(userId, list) && !userId) throw new Error("Couldn't remove the book on this device.");
    announce(userId); return list;
  });
}
