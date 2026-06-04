// CycleMirror — "On This Day" (Phase 1, Cycle Mirror, free, on-device).
//
// Surfaces the user's OWN past words from the same cycle day, with a Jess
// gloss. The moat: no tracker mirrors your own writing back to you. 100%
// on-device — we read from the already-loaded entries; the gloss is a
// templated observation (no server call, no paywall).
//
// Match rule: entries written on the same cycle day as today (±1 day for
// irregular cycles), excluding anything written today. Most recent match is
// shown; the rest are summarised in the "more from Day N" line.

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { T, UI, SERIF, HAND, PRESS, Eyebrow, Rule, Hand, Heart } from "./Editorial";
import { entryDateObj, cycleDayForDate, relativeDate } from "./journalDates";

const PHASE_GLOSS = {
  menstrual:  "Your body keeps its own calendar — this is the winter of the cycle, not a verdict on you.",
  follicular: "Same point in the cycle, a year of you apart. Notice what has shifted, and what hasn't.",
  ovulatory:  "You tend to write with more voice here. Your body is consistent — you're not imagining it.",
  luteal:     "You wrote close to this on the same day last cycle too. This is the luteal edit, not the truth about you.",
};

function snippet(entry) {
  let t = entry?.text || "";
  if (entry?.card_type === "gratitude") t = t.split("\n").filter(Boolean).join(" · ");
  t = t.replace(/\s+/g, " ").trim();
  return t.length > 220 ? t.slice(0, 217).trimEnd() + "…" : t;
}

export default function CycleMirror({ entries, profile, phase, todayCycleDay, onReply }) {
  const { match, moreCount, hasHistory } = useMemo(() => {
    if (!profile?.last_period_start_date || !todayCycleDay || !entries?.length) {
      return { match: null, moreCount: 0, hasHistory: false };
    }
    const todayStr = new Date().toISOString().split("T")[0];
    const past = entries
      .filter((e) => (e.session_date || e.created_date?.split("T")[0]) !== todayStr)
      .filter((e) => (e.text || "").trim().length > 0)
      .map((e) => ({ e, d: entryDateObj(e), cd: cycleDayForDate(entryDateObj(e), profile) }))
      .filter((x) => x.d && x.cd != null && Math.abs(x.cd - todayCycleDay) <= 1)
      .sort((a, b) => b.d - a.d);
    return { match: past[0]?.e || null, moreCount: Math.max(0, past.length - 1), hasHistory: past.length > 0 };
  }, [entries, profile, todayCycleDay]);

  // Nothing on this cycle day yet — a quiet, honest affordance (needs ≥1 prior cycle).
  if (!hasHistory) {
    if (!entries?.length) return null; // page-level empty state covers the cold start
    return (
      <section style={{ marginBottom: 46, background: T.paperHi, borderRadius: 3, padding: "24px 26px",
        boxShadow: "0 0 0 1px rgba(51,41,28,0.05)" }}>
        <Eyebrow mb={8}>On this day</Eyebrow>
        <Rule w={28} c={T.gold} mb={12} />
        <Hand size={20} color={T.inkSoft}>
          Once you've written across a full cycle, your words from this same day will surface here — past-you as witness.
        </Hand>
      </section>
    );
  }

  const gloss = PHASE_GLOSS[phase] || PHASE_GLOSS.luteal;

  return (
    <section style={{ position: "relative", marginBottom: 46, background: T.paperHi, borderRadius: 3,
      padding: "30px 30px 26px", boxShadow: "0 1px 2px rgba(51,41,28,0.06), 0 0 0 1px rgba(51,41,28,0.05)" }}>
      <div aria-hidden style={{ position: "absolute", top: 2, left: 16, fontFamily: SERIF, fontSize: 110,
        color: T.gold, opacity: 0.16, lineHeight: 1, fontWeight: 600 }}>&ldquo;</div>
      <Eyebrow mb={8}>On this day · {relativeDate(match)} · Day {todayCycleDay}</Eyebrow>
      <Rule w={28} c={T.gold} mb={14} />
      <Hand size={24} color={T.ink} style={{ margin: "0 0 16px", position: "relative" }}>{snippet(match)}</Hand>

      {/* Jess's gloss — the observation that makes the mirror the moat */}
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 18, paddingLeft: 12, borderLeft: `2px solid ${T.gold}` }}>
        <Heart size={13} style={{ marginTop: 4, flexShrink: 0 }} />
        <Hand size={18} color={T.inkSoft}>{gloss}</Hand>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button onClick={() => onReply && onReply(match)} style={{
          display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
          border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
          fontFamily: HAND, fontWeight: 600, fontSize: 19, color: T.ink, textShadow: PRESS, borderBottom: `1px solid ${T.gold}`,
        }}>Reply to who you were <ArrowRight size={13} /></button>
        {moreCount > 0 && (
          <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.4, fontWeight: 600 }}>
            {moreCount} more from Day {todayCycleDay}
          </span>
        )}
      </div>
    </section>
  );
}
