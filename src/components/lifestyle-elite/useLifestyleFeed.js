import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { withTimeout } from "@/utils/safeEntity";

// Both existing presentations consume the SAME ranking. One request per owner/phase
// change, no TTL cache and no late response from a previous account or phase.
const PHASES = new Set(["menstrual", "follicular", "ovulatory", "luteal"]);
export function useLifestyleFeed(ownerId, phase) {
  const [snapshot, setSnapshot] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!ownerId) return undefined;
    withTimeout(base44.functions.invoke("getLifestyleFeed", {
      mode: "for_you", page: 0, page_size: 12, phase: phase || "",
    }), 14000, "feed").then(response => {
      if (cancelled) return;
      const value = response?.data?.items || response?.items || [];
      const rows = (Array.isArray(value) ? value : []).filter(row => row?.title);
      setSnapshot({ ownerId, phase, rows });
    }).catch(() => {
      if (!cancelled) setSnapshot({ ownerId, phase, rows: [] });
    });
    return () => { cancelled = true; };
  }, [ownerId, phase]);
  const rows = snapshot && snapshot.ownerId === ownerId && snapshot.phase === phase ? snapshot.rows : [];
  const reads = rows.filter(row => /ARTICLE|STORY|GUIDE|FICTION/.test(String(row.content_type || "").toUpperCase()));
  return { feed: reads.length ? reads : null, phaseFeed: PHASES.has(phase) ? rows : [] };
}
