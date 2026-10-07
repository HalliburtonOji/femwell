import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { mergeSavedCollections, readOwnerSavedRows } from "@/lib/savedCollections";
import { parseSavedMeta } from "@/lib/savedItems";
import { withTimeout } from "@/utils/safeEntity";
import { readKeepAcknowledgement } from "./useLifestyleKeepAcknowledgements";

const EMPTY = [];
const ERROR = "Some keeps couldn’t load. Your saved references are still safe.";
function reconcilePartial(previous, partial, ownerId) {
  const rows = new Map(previous.filter(row => row.user_id === ownerId).map(row => [row.id, row]));
  for (const row of partial || []) if (row?.id && row.user_id === ownerId) rows.set(row.id, row);
  return [...rows.values()];
}

// Collection identity is independent of feed/profile object identity. Confirmed
// rows survive failed refreshes; only a successful complete read proves absence.
export function useLifestyleKeeps({ ownerId, enabled, profile, savedIds, items, revision }) {
  const [snapshot, setSnapshot] = useState(null);
  const [derived, setDerived] = useState(null);
  const [contentRevision, setContentRevision] = useState(0);
  const [collectionRevision, setCollectionRevision] = useState(0);
  const scans = useRef(new Map());
  const mutationRevision = useRef(0);
  const activeOwner = useRef(ownerId);
  activeOwner.current = ownerId;
  useEffect(() => {
    let cancelled = false;
    if (!enabled || !ownerId) { setSnapshot(null); setDerived(null); return undefined; }
    const key = JSON.stringify([ownerId, revision, collectionRevision]);
    let flight = scans.current.get(key);
    if (!flight) {
      flight = { ownerId, promise: readOwnerSavedRows(ownerId), removals: [] };
      scans.current.set(key, flight);
      const clear = () => { if (scans.current.get(key) === flight) scans.current.delete(key); };
      flight.promise.then(clear, clear);
    }
    const survivingRows = rows => rows.filter(row => !flight.removals.some(predicate => predicate(row)));
    flight.promise.then(rows => {
      if (!cancelled && activeOwner.current === ownerId) setSnapshot({ ownerId, rows: survivingRows(rows), failed: false });
    }).catch(error => {
      if (!cancelled && activeOwner.current === ownerId) setSnapshot(previous => ({ ownerId, failed: true,
        rows: survivingRows(reconcilePartial(previous?.ownerId === ownerId ? previous.rows : EMPTY, error.partialRows, ownerId)),
      }));
    });
    return () => { cancelled = true; };
  }, [enabled, ownerId, revision, collectionRevision]);

  // Scope exact lookup promises to this mounted owner and explicit refresh. A
  // new pool render reuses them; retry/content change invalidates them. No device
  // or cross-account cache, no hidden history limit and at most six lookups at once.
  const lookups = useMemo(() => new Map(), [ownerId, revision, collectionRevision, contentRevision]); // eslint-disable-line react-hooks/exhaustive-deps
  const physical = snapshot && snapshot.ownerId === ownerId ? snapshot.rows : EMPTY;
  const ownedProfile = profile?.user_id === ownerId ? profile : null;
  const ownedIds = ownedProfile ? savedIds : EMPTY;
  useEffect(() => {
    let cancelled = false;
    if (!enabled || !ownerId) return undefined;
    const mutationAtStart = mutationRevision.current;
    (async () => {
      const ids = [...new Set([...ownedIds, ...physical.filter(row => row.item_type === "LIFESTYLE" && parseSavedMeta(row)?.kind !== "sky-lesson").map(row => row.item_id)])].filter(Boolean);
      const resolutions = new Map();
      for (let start = 0; start < ids.length; start += 6) {
        const results = await Promise.all(ids.slice(start, start + 6).map(id => {
          const item = items.find(row => row.id === id);
          if (item) return Promise.resolve({ item });
          if (!lookups.has(id)) lookups.set(id, withTimeout(base44.entities.LifestyleItems.filter({ id }, undefined, 1), 6000, "kept-item")
            .then(rows => {
              if (!Array.isArray(rows)) throw new Error("Invalid kept source response");
              if (rows.length && !rows.some(row => row?.id === id)) throw new Error("Wrong kept source identity");
              return { item: rows.find(row => row?.id === id) || null };
            }).catch(() => ({ error: true })));
          return lookups.get(id);
        }));
        if (cancelled) return;
        results.forEach((value, index) => resolutions.set(ids[start + index], value));
      }
      if (cancelled || activeOwner.current !== ownerId || mutationRevision.current !== mutationAtStart) return;
      const merged = mergeSavedCollections(physical, { ...ownedProfile, user_id: ownerId, saved_item_ids: ownedIds }, resolutions);
      setDerived({ ownerId, rows: merged.filter(row => parseSavedMeta(row)?.kind !== "sky-lesson"),
        items: [...resolutions.values()].map(value => value.item).filter(Boolean) });
    })();
    return () => { cancelled = true; };
  }, [enabled, ownerId, physical, ownedProfile, ownedIds, items, lookups]);

  // Apply acknowledged removals to the underlying snapshot too. Otherwise the
  // next content render would resurrect a removed keep from a cached physical row.
  const removeConfirmed = useCallback((owner, predicate) => {
    if (activeOwner.current !== owner) return;
    mutationRevision.current += 1;
    for (const flight of scans.current.values()) if (flight.ownerId === owner) flight.removals.push(predicate);
    setSnapshot(previous => previous?.ownerId === owner ? { ...previous, rows: previous.rows.filter(row => !predicate(row)) } : previous);
    setDerived(previous => previous?.ownerId === owner ? { ...previous, rows: previous.rows.filter(row => !predicate(row)) } : previous);
  }, []);
  useEffect(() => {
    if (!enabled || !ownerId) return undefined;
    const refresh = event => {
      if (event.detail != null) {
        const acknowledgement = readKeepAcknowledgement(event.detail, ownerId);
        if (!acknowledgement) return;
        const removed = new Set(acknowledgement.removedSavedRecordIds);
        if (removed.size) removeConfirmed(ownerId, row => removed.has(row.id));
        // Confirmed profile changes arrive through the shell bridge; confirmed
        // physical removals already update this snapshot and pending flights.
        return;
      }
      setCollectionRevision(value => value + 1); // original untyped Sky event
    };
    window.addEventListener("fw_sky_lesson_saved", refresh);
    return () => window.removeEventListener("fw_sky_lesson_saved", refresh);
  }, [enabled, ownerId, removeConfirmed]);
  const invalidateSources = useCallback(() => setContentRevision(value => value + 1), []);
  const current = enabled && ownerId && derived?.ownerId === ownerId ? derived : null;
  return { archiveKeeps: current?.rows || EMPTY, resolvedKeeps: current?.items || EMPTY,
    keepsError: enabled && ownerId && snapshot?.ownerId === ownerId && snapshot?.failed ? ERROR : "",
    removeConfirmed, invalidateSources };
}
