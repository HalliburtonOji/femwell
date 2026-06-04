// InsightTeaser — a single line from the week that opens the Insights tab.
//
// Computed from real entries (not mock): how often you've written this week
// and when. Tapping it switches the Journal's top tab to Insights (the
// existing JournalInsightsTab is preserved untouched).

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
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
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", background: "transparent",
      borderTop: `1px solid ${T.paperDeep}`, borderBottom: `1px solid ${T.paperDeep}`,
      borderLeft: "none", borderRight: "none", padding: "18px 2px", marginBottom: 46,
    }}>
      <div style={{ width: 2, alignSelf: "stretch", background: T.gold }} />
      <Hand size={21} color={T.inkSoft} style={{ flex: 1 }}>{line}</Hand>
      <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 1, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>INSIGHTS <ChevronRight size={13} /></span>
    </button>
  );
}
