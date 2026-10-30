import { base44 } from '@/api/base44Client';

// A content edit invalidates a paragraph coordinate rather than restoring a
// reader into a different sentence. Hash length + full text, not an array index.
export function readingRevision(text) {
  const value = String(text || '');
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return `${value.length}-${(hash >>> 0).toString(36)}`;
}

export function validOwnedPlace(row, owner, itemId, revision) {
  return !!(row?.id && row.user_id === owner && row.item_id === itemId &&
    Number.isSafeInteger(row.paragraph_index) && row.paragraph_index >= 1 &&
    row.content_revision === revision);
}

export async function readOwnedPlace(owner, itemId, revision) {
  if (!owner || !itemId || !revision) return null;
  const rows = await base44.entities.LifestyleReadingPlace.filter({ user_id: owner, item_id: itemId }, '-updated_date', 3);
  if (!Array.isArray(rows)) throw new Error('Reading place unavailable');
  const latest = rows.find(row => row?.id && row.user_id === owner && row.item_id === itemId);
  return validOwnedPlace(latest, owner, itemId, revision) ? latest : null;
}

export async function writeOwnedPlace({ owner, itemId, revision, paragraphIndex }) {
  if (!owner || !itemId || !revision || !Number.isSafeInteger(paragraphIndex) || paragraphIndex < 1) return null;
  if ((await base44.auth.me())?.id !== owner) throw new Error('Account changed');
  const payload = { user_id: owner, item_id: itemId, content_revision: revision, paragraph_index: paragraphIndex, updated_at: new Date().toISOString() };
  // Always choose the server's newest row at write time. Two first opens can
  // race into twins; future writes converge on one row rather than each tab
  // indefinitely updating its own stale ID.
  const rows = await base44.entities.LifestyleReadingPlace.filter({ user_id: owner, item_id: itemId }, '-updated_date', 3);
  if (!Array.isArray(rows)) throw new Error('Reading place unavailable');
  const existing = rows.find(candidate => candidate?.id && candidate.user_id === owner && candidate.item_id === itemId) || null;
  const saved = existing?.id
    ? await base44.entities.LifestyleReadingPlace.update(existing.id, payload)
    : await base44.entities.LifestyleReadingPlace.create(payload);
  if ((await base44.auth.me())?.id !== owner) throw new Error('Account changed');
  if (validOwnedPlace(saved, owner, itemId, revision) && saved.paragraph_index === paragraphIndex) return saved;
  const confirmed = await readOwnedPlace(owner, itemId, revision);
  if (!confirmed || confirmed.paragraph_index !== paragraphIndex) throw new Error('Reading place not confirmed');
  return confirmed;
}

export async function recentOwnedPlaces(owner) {
  if (!owner) return [];
  // A simultaneous first read on two devices can leave duplicate rows; keep
  // the latest exact article once, and do not let twins crowd out older places.
  const rows = await base44.entities.LifestyleReadingPlace.filter({ user_id: owner }, '-updated_date', 24);
  if (!Array.isArray(rows)) throw new Error('Reading places unavailable');
  const seen = new Set();
  return rows.filter(row => row?.id && row.user_id === owner && row.item_id &&
    Number.isSafeInteger(row.paragraph_index) && row.paragraph_index >= 1 && row.content_revision &&
    !seen.has(row.item_id) && seen.add(row.item_id)).slice(0, 8);
}
