// InsightTeaser — a small, obvious card at the Journal header that opens the
// deep Insights as an OVERLAY (no separate tab).
//
// Computed from real entries (not mock): how often you've written this week
// and when. Tapping it opens the Insights overlay (the existing
// JournalInsightsTab is preserved untouched).

import { useMemo } from "react";
import { ChevronRight, BarChart3 } from "lucide-react";
import { T, UI, Hand } from "./Editorial";
import { entryDateObj } from "./journalDates";

function weekLine(entries) {
  if (!entries?.length) return "Your insights are still gathering — a few more entries and patterns appear.";
  const now = Date.now();
  const wk = entries.filter((e) => { const d = entryDateObj(e); return d && (now - d.getTime()) <= 7 * 86400000; });
  const evenings = wk.filter((e) => {
    const ts = e.created_date || e.created_at; if (!ts) return false;
    const h = new Date(ts).getHours(); return h >= 17 || h < 4;
  }).length;
  const n = wk.length;
  if (n === 0) return "You haven't written this week yet — your rhythm is waiting whenever you are.";
  const times = n === 1 ? "once" : `${n} times`;
  if (evenings >= Math.ceil(n / 2) && evenings > 0) return `You've written ${times} this week — mostly in the evenings.`;
  return `You've written ${times} this week. A pattern is forming.`;
}

export default function InsightTeaser({ entries, onOpen }) {
  const line = useMemo(() => weekLine(entries), [entries]);
  return (
    <button onClick={onOpen} aria-label="Open insights" style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
      cursor: "pointer", marginTop: 4, marginBottom: 30,
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16,
      padding: "15px 17px", boxShadow: `0 1px 0 ${T.gold}1F, 0 6px 16px rgba(51,41,28,0.08)`,
    }}>
      <span style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: `${T.gold}1A`, border: `1px solid ${T.gold}`,
      }}>
        <BarChart3 size={18} style={{ color: T.gold }} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: 1.6, textTransform: "uppercase", color: T.gold, marginBottom: 3 }}>Insights</span>
        <Hand size={20} color={T.inkSoft} carve={false} style={{ lineHeight: 1.3 }}>{line}</Hand>
      </span>
      <ChevronRight size={18} style={{ color: T.muted, flexShrink: 0 }} />
    </button>
  );
}
