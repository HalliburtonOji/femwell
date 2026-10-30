import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { withTimeout } from '@/utils/safeEntity';
import { classicContinuation, continuePositions, isLifestylePosition, recoverLegacyArticlePositions } from './finishLifestyle';
import { recentOwnedPlaces, readingRevision } from '@/lib/lifestyleReadingPlace';

// Device positions remain separate from owned/cross-device keeps. Refresh only
// on entry/return or an embedded-reader exit, never on catalogue completion.
export default function useLifestyleContinuation({ enabled, active, routePathname, catalogue }) {
  const [positions, setPositions] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [legacyRecovery, setLegacyRecovery] = useState(false);
  const sequence = useRef(0);
  const resolvedRef = useRef([]);
  const ownerRef = useRef(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; sequence.current++; }; }, []);
  const refresh = useCallback(async () => {
    if (!mounted.current) return;
    const request = ++sequence.current;
    let identity = null;
    try { identity = await base44.auth.me(); } catch { /* keep owned places unavailable */ }
    const device = continuePositions(localStorage, { ownerId: identity?.id || null, includeLegacyArticle: false });
    const legacyFlag = identity?.id ? `fw_article_legacy_seen_${encodeURIComponent(identity.id)}` : null;
    setLegacyRecovery(!!(legacyFlag && !localStorage.getItem(legacyFlag) && continuePositions(localStorage).some(row => row.kind === 'article')));
    let owned = [];
    try {
      if (ownerRef.current !== (identity?.id || null)) {
        resolvedRef.current = [];
        ownerRef.current = identity?.id || null;
      }
      if (identity?.id) {
        const rows = await withTimeout(recentOwnedPlaces(identity.id), 6000, 'owned reading places');
        if ((await base44.auth.me())?.id === identity.id) owned = rows.map(row => ({
          bookId: row.item_id, kind: 'article', paragraphIndex: row.paragraph_index,
          contentRevision: row.content_revision, owned: true,
          ts: Number.isFinite(Date.parse(row.updated_date || row.updated_at || '')) ? Date.parse(row.updated_date || row.updated_at) : 0,
        }));
      }
    } catch { /* device positions remain available */ }
    if (!mounted.current || request !== sequence.current) return;
    const byId = new Map();
    for (const pos of [...device, ...owned]) {
      const prior = byId.get(pos.bookId);
      if (!prior || pos.ts > prior.ts) byId.set(pos.bookId, pos);
    }
    const next = [...byId.values()].sort((a,b) => b.ts - a.ts);
    setPositions(next);
    const sources = next.filter(pos => isLifestylePosition(pos.bookId)).slice(0, 24);
    const rows = await Promise.all(sources.map(async pos => {
      try {
        const result = await withTimeout(base44.entities.LifestyleItems.filter({ id: pos.bookId }, undefined, 1), 6000, 'continue');
        if (!Array.isArray(result)) throw new Error('Invalid reading response');
        const item = result.find(row => row?.id === pos.bookId && row.title);
        if (!item || (pos.owned && (item.status !== 'PUBLISHED' || item.provider !== 'FEMWELL_EDITORIAL'))) return null;
        if (pos.owned && readingRevision(item.lede || '') !== pos.contentRevision) return null;
        return { item, pos };
      } catch {
        // A failed read is not proof that the source was deleted. Keep an
        // already resolved exact row, with its newly read device position.
        const previous = resolvedRef.current.find(row => row.item.id === pos.bookId);
        return previous ? { item: previous.item, pos } : null;
      }
    }));
    if (!mounted.current || request !== sequence.current) return;
    resolvedRef.current = rows.filter(Boolean);
    setResolved(resolvedRef.current);
  }, []);
  const recoverLegacy = useCallback(async () => {
    const identity = await base44.auth.me().catch(() => null);
    if (!identity?.id || ownerRef.current !== identity.id) return 0;
    const copied = recoverLegacyArticlePositions(localStorage, identity.id);
    try { localStorage.setItem(`fw_article_legacy_seen_${encodeURIComponent(identity.id)}`, '1'); } catch { /* show recovery again if storage failed */ }
    setLegacyRecovery(false);
    await refresh();
    return copied;
  }, [refresh]);
  useEffect(() => {
    if (enabled && active) refresh();
    else sequence.current++; // a hidden old request cannot replace a return snapshot
  }, [enabled, active, routePathname, refresh]);
  const items = useMemo(() => {
    const classic = positions.map(pos => classicContinuation(pos, catalogue)).filter(Boolean);
    const current = resolved.flatMap(row => {
      const pos = positions.find(position => position.bookId === row.item.id && isLifestylePosition(position.bookId));
      return pos ? [{item: row.item, pos}] : [];
    });
    return [...current, ...classic].sort((a,b) => (Number(b.pos.ts) || 0) - (Number(a.pos.ts) || 0)).slice(0, 3);
  }, [positions, resolved, catalogue]);
  return { items, refresh, legacyRecovery, recoverLegacy };
}
