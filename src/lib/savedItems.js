import { base44 } from "@/api/base44Client";

async function getUser() {
  return base44.auth.me();
}

export async function findSavedItem(itemType, itemId) {
  const user = await getUser();
  const items = await base44.entities.SavedItems.filter({
    user_id: user.id,
    item_type: itemType,
    item_id: itemId,
  });
  return items[0] || null;
}

export async function saveItem({ itemType, itemId, title, previewText = "", meta = {} }) {
  const user = await getUser();
  const existing = await findSavedItem(itemType, itemId);
  if (existing) return existing;
  return base44.entities.SavedItems.create({
    user_id: user.id,
    item_type: itemType,
    item_id: itemId,
    title,
    preview_text: previewText,
    created_at: new Date().toISOString(),
    meta_json: JSON.stringify(meta),
  });
}

export async function removeSavedItem(itemType, itemId) {
  const existing = await findSavedItem(itemType, itemId);
  if (!existing) return null;
  await base44.entities.SavedItems.delete(existing.id);
  return existing;
}

export async function toggleSavedItem({ itemType, itemId, title, previewText = "", meta = {} }) {
  const existing = await findSavedItem(itemType, itemId);
  if (existing) {
    await base44.entities.SavedItems.delete(existing.id);
    return { saved: false, item: existing };
  }
  const created = await saveItem({ itemType, itemId, title, previewText, meta });
  return { saved: true, item: created };
}

export function parseSavedMeta(savedItem) {
  if (!savedItem?.meta_json) return {};
  try {
    return JSON.parse(savedItem.meta_json);
  } catch {
    return {};
  }
}