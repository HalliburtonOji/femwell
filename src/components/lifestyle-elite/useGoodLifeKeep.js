import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { readLifestyleFindAuthority } from "@/lib/savedCollections";

// Opened Good life rooms share the existing logical Lifestyle keep. One item is
// displayed at a time, but partial-delete receipts survive a visit to another.
export function useGoodLifeKeep(ownerId, expanded) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const ownerRef = useRef(ownerId);
  const expandedRef = useRef(expanded?.id || null);
  const versionRef = useRef(0);
  const pending = useRef(new Map());

  useEffect(() => { ownerRef.current = ownerId; }, [ownerId]);
  useEffect(() => { expandedRef.current = expanded?.id || null; }, [expanded?.id]);

  useEffect(() => {
    if (!expanded?.id || !ownerId) return;
    let alive = true;
    const itemId = expanded.id, owner = ownerId, version = ++versionRef.current;
    const assertOwner = async () => {
      if (!alive || ownerRef.current !== owner || expandedRef.current !== itemId || versionRef.current !== version || (await base44.auth.me())?.id !== owner) throw new Error("Account or read changed");
    };
    setSaved(false);
    setError("");
    readLifestyleFindAuthority(owner, itemId, assertOwner)
      .then(({ profile, physical }) => { if (alive && versionRef.current === version) setSaved(!!profile?.saved_item_ids?.includes(itemId) || physical.length > 0); })
      .catch(() => { if (alive && versionRef.current === version) setError("Couldn't check your saved things. Try Save again."); });
    return () => { alive = false; };
  }, [expanded?.id, ownerId]);

  const onSave = useCallback(async (next, card) => {
    if (!ownerId || !card?.id) { setError("Sign in to save this."); return false; }
    const owner = ownerId, itemId = card.id, version = ++versionRef.current;
    const key = JSON.stringify([owner, itemId, next]);
    const intent = pending.current.get(key) || { removed: new Set() };
    pending.current.set(key, intent);
    const assertOwner = async () => {
      if (ownerRef.current !== owner || expandedRef.current !== itemId || versionRef.current !== version) throw new Error("Account or read changed");
      const user = await base44.auth.me();
      if (user?.id !== owner || ownerRef.current !== owner || expandedRef.current !== itemId || versionRef.current !== version) throw new Error("Account or read changed");
      return user;
    };
    setError("");
    try {
      const { profile, physical } = await readLifestyleFindAuthority(owner, itemId, assertOwner);
      if (!next) for (const row of physical) { await assertOwner(); await base44.entities.SavedItems.delete(row.id); intent.removed.add(row.id); }
      const before = profile?.saved_item_ids || [];
      const intended = next ? [...new Set([...before, itemId])] : before.filter(id => id !== itemId);
      if ((next && !profile) || (profile && JSON.stringify(before) !== JSON.stringify(intended))) {
        const user = await assertOwner();
        const result = profile
          ? await base44.entities.UserProfile.update(profile.id, { saved_item_ids: intended })
          : await base44.entities.UserProfile.create({ user_id: owner, user_email: user.email, saved_item_ids: intended });
        if (!result?.id || (profile && result.id !== profile.id) || (result.user_id && result.user_id !== owner)) throw new Error("Wrong profile acknowledgement");
      }
      const confirmed = await readLifestyleFindAuthority(owner, itemId, assertOwner);
      const profileHas = confirmed.profile?.saved_item_ids?.includes(itemId) || false;
      if (next ? !(profileHas || confirmed.physical.length) : (profileHas || confirmed.physical.length)) throw new Error("Keep was not confirmed");
      await assertOwner();
      setSaved(next);
      window.dispatchEvent(new CustomEvent("fw_sky_lesson_saved", { detail: {
        ownerId: owner, itemId,
        profile: confirmed.profile ? { id: confirmed.profile.id, user_id: owner, saved_item_ids: confirmed.profile.saved_item_ids || [] } : undefined,
        removedSavedRecordIds: [...intent.removed],
      } }));
      if (pending.current.get(key) === intent) pending.current.delete(key);
      return true;
    } catch {
      if (ownerRef.current === owner && expandedRef.current === itemId && versionRef.current === version) setError("That save didn't stick. Try again.");
      return false;
    }
  }, [ownerId]);

  return { saved, saveError: error, onSave };
}
