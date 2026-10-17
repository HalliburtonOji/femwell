import { base44 } from "@/api/base44Client";

async function getUser(expectedOwnerId) {
  const user = await base44.auth.me();
  if (!user?.id || (expectedOwnerId && user.id !== expectedOwnerId)) throw new Error("Saved collection account changed");
  return user;
}

export async function findSavedItem(itemType, itemId, expectedOwnerId) {
  const user = await getUser(expectedOwnerId);
  const items = await base44.entities.SavedItems.filter({
    user_id: user.id,
    item_type: itemType,
    item_id: itemId,
  });
  if (expectedOwnerId) await getUser(expectedOwnerId);
  return items.find(item => item.user_id === user.id && item.item_type === itemType && item.item_id === itemId) || null;
}

export async function saveItem({ itemType, itemId, title, previewText = "", meta = {}, expectedOwnerId }) {
  const user = await getUser(expectedOwnerId);
  const existing = await findSavedItem(itemType, itemId, expectedOwnerId);
  if (existing) return existing;
  if (expectedOwnerId) await getUser(expectedOwnerId);
  const created = await base44.entities.SavedItems.create({
    user_id: user.id,
    item_type: itemType,
    item_id: itemId,
    title,
    preview_text: previewText,
    created_at: new Date().toISOString(),
    meta_json: JSON.stringify(meta),
  });
  if (expectedOwnerId) await getUser(expectedOwnerId);
  return created;
}

export async function removeSavedItem(itemType, itemId, expectedOwnerId) {
  const user = await getUser(expectedOwnerId);
  const filter = {user_id:user.id,item_type:itemType,item_id:itemId};
  const matches = [], seen = new Set();
  for(let skip=0;;skip+=100){
    if (expectedOwnerId) await getUser(expectedOwnerId);
    const page=await base44.entities.SavedItems.filter(filter,"-created_date",100,skip);
    if (expectedOwnerId) await getUser(expectedOwnerId);
    const fresh=page.filter(row=>row.user_id===user.id && row.item_type===itemType && row.item_id===itemId && !seen.has(row.id));
    fresh.forEach(row=>{seen.add(row.id);matches.push(row);});
    if(page.length<100)break;
    if(!fresh.length)throw new Error("Saved pagination did not advance");
  }
  if(!matches.length)return null;
  for(const row of matches){if (expectedOwnerId) await getUser(expectedOwnerId);await base44.entities.SavedItems.delete(row.id);if (expectedOwnerId) await getUser(expectedOwnerId);}
  if (expectedOwnerId) await getUser(expectedOwnerId);
  const remaining=await base44.entities.SavedItems.filter(filter,undefined,1);
  if (expectedOwnerId) await getUser(expectedOwnerId);
  if(remaining.some(row=>row.user_id===user.id))throw new Error("This keep is still present");
  return matches[0];
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
