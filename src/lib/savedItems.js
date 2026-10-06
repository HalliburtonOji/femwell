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
  const user = await getUser();
  const filter = {user_id:user.id,item_type:itemType,item_id:itemId};
  const matches = [], seen = new Set();
  for(let skip=0;;skip+=100){
    const page=await base44.entities.SavedItems.filter(filter,"-created_date",100,skip);
    const fresh=page.filter(row=>row.user_id===user.id && !seen.has(row.id));
    fresh.forEach(row=>{seen.add(row.id);matches.push(row);});
    if(page.length<100)break;
    if(!fresh.length)throw new Error("Saved pagination did not advance");
  }
  if(!matches.length)return null;
  for(const row of matches)await base44.entities.SavedItems.delete(row.id);
  const remaining=await base44.entities.SavedItems.filter(filter,undefined,1);
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
