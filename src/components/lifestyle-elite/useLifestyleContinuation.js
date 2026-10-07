import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { withTimeout } from '@/utils/safeEntity';
import { classicContinuation, continuePositions, isLifestylePosition } from './finishLifestyle';

// Device positions remain separate from owned/cross-device keeps. Refresh only
// on entry/return or an embedded-reader exit, never on catalogue completion.
export default function useLifestyleContinuation({ enabled, active, routePathname, catalogue }) {
  const [positions, setPositions] = useState([]);
  const [resolved, setResolved] = useState([]);
  const sequence = useRef(0);
  const resolvedRef = useRef([]);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; sequence.current++; }; }, []);
  const refresh = useCallback(async () => {
    if (!mounted.current) return;
    const request = ++sequence.current;
    const next = continuePositions(localStorage);
    setPositions(next);
    const sources = next.filter(pos => isLifestylePosition(pos.bookId)).slice(0, 24);
    const rows = await Promise.all(sources.map(async pos => {
      try {
        const result = await withTimeout(base44.entities.LifestyleItems.filter({ id: pos.bookId }, undefined, 1), 6000, 'continue');
        if (!Array.isArray(result)) throw new Error('Invalid reading response');
        const item = result.find(row => row?.id === pos.bookId && row.title);
        return item ? { item, pos } : null;
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
  return { items, refresh };
}
