import { useEffect, useRef } from "react";

// Same existing save event, narrow confirmed data only. No account rows, prose,
// cache expiry, extra query or parallel persistence system travels in this bridge.
export function readKeepAcknowledgement(detail, ownerId) {
  if (!ownerId || detail?.ownerId !== ownerId || typeof detail.itemId !== "string" || !detail.itemId) return null;
  const removed = detail.removedSavedRecordIds ?? [];
  if (!Array.isArray(removed) || removed.some(id => typeof id !== "string" || !id)) return null;
  let profile = null;
  if (detail.profile !== undefined) {
    const row = detail.profile;
    if (!row || row.user_id !== ownerId || (row.id !== null && (typeof row.id !== "string" || !row.id)) ||
        !Array.isArray(row.saved_item_ids) || row.saved_item_ids.some(id => typeof id !== "string" || !id)) return null;
    profile = { id: row.id, user_id: ownerId, saved_item_ids: [...new Set(row.saved_item_ids)] };
  }
  return { profile, removedSavedRecordIds: [...new Set(removed)] };
}

export function useLifestyleKeepAcknowledgements({ ownerId, setProfile, setSavedIds }) {
  const activeOwner = useRef(ownerId);
  activeOwner.current = ownerId;
  useEffect(() => {
    if (!ownerId) return undefined;
    const receive = event => {
      if (activeOwner.current !== ownerId) return;
      const acknowledgement = readKeepAcknowledgement(event.detail, ownerId);
      if (!acknowledgement?.profile) return;
      const profile = acknowledgement.profile;
      setSavedIds(profile.saved_item_ids);
      setProfile(previous => previous?.user_id === ownerId
        ? { ...previous, ...(profile.id ? { id: profile.id } : {}), saved_item_ids: profile.saved_item_ids }
        : profile.id ? profile : null);
    };
    window.addEventListener("fw_sky_lesson_saved", receive);
    return () => window.removeEventListener("fw_sky_lesson_saved", receive);
  }, [ownerId, setProfile, setSavedIds]);
}
