// CycleMirror — "On This Day" + secondary lenses (Phase 1, Cycle Mirror, free,
// on-device). Surfaces the user's OWN past words back to them, several ways. No
// tracker mirrors your own writing back to you — that's the moat. 100% on-device:
// we read from the already-loaded `entries`; every gloss is a templated observation
// (no server call, no paywall).
//
// Lenses (all wired to real entries):
//   • On this day  — same cycle day (±1) as today                  (the primary)
//   • This phase   — entries from the same cycle phase as today
//   • A year ago   — entries written ~365 days ago (±7)
//   • This feeling — entries that share your most recent mood
//   • Patterns     — the catalogue: aggregate observations across all your pages
//
// Past-entry phase is derived with the SAME phaseForDay used everywhere else
// (single source of truth), so the lenses agree with the rest of the app.

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { T, UI, SERIF, HAND, PRESS, Eyebrow, Rule, Hand, Heart, Chip } from "./Editorial";
import { entryDateObj, cycleDayForDate, relativeDate } from "./journalDates";
import { phaseForDay } from "@/hooks/useCycleDay";

const PHASE_GLOSS = {
  menstrual:  "Your body keeps its own calendar — this is the winter of the cycle, not a verdict on you.",
  follicular: "Same point in the cycle, a year of you apart. Notice what has shifted, and what hasn't.",
  ovulatory:  "You tend to write with more voice here. Your body is consistent — you're not imagining it.",
  luteal:     "You wrote close to this on the same day last cycle too. This is the luteal edit, not the truth about you.",
};
const MOOD_WORD = { 1: "a low place", 2: "a heavy day", 3: "somewhere steady", 4: "a good place", 5: "a bright day" };
const SEASON_WORD = { menstrual: "winter", follicular: "spring", ovulatory: "summer", luteal: "autumn" };

function snippet(entry) {
  let t = entry?.text || "";
  if (entry?.card_type === "gratitude") t = t.split("\n").filter(Boolean).join(" · ");
  t = t.replace(/\s+/g, " ").trim();
  return t.length > 220 ? t.slice(0, 217).trimEnd() + "…" : t;
}
function midnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function daysBetween(a, b) { return Math.round((midnight(a) - midnight(b)) / 86400000); }

export default function CycleMirror({ entries, profile, phase, todayCycleDay, onReply }) {
  const data = useMemo(() => {
    if (!entries?.length) return null;
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    const cycleLen = profile?.cycle_avg_length || 28;
    const periodLen = profile?.period_avg_length || profile?.period_length || 5;
    const hasCycle = !!profile?.last_period_start_date;

    const decorated = entries
      .filter((e) => (e.session_date || e.created_date?.split("T")[0]) !== todayStr)
      .filter((e) => (e.text || "").trim().length > 0)
      .map((e) => {
        const d = entryDateObj(e);
        const cd = hasCycle && d ? cycleDayForDate(d, profile) : null;
        const ph = cd != null ? phaseForDay(cd, periodLen, cycleLen) : null;
        return {
          e, d, cd, ph,
          daysAgo: d ? daysBetween(now, d) : null,
          mood: e.mood_rating || null,
          tags: Array.isArray(e.tags) ? e.tags.filter(Boolean) : [],
        };
      })
      .filter((x) => x.d)
      .sort((a, b) => b.d - a.d);

    if (!decorated.length) return { decorated: [] };

    // Anchor mood = the most recent entry that carries a mood (today's, or latest).
    const latestMood = entries
      .filter((e) => (e.text || "").trim().length > 0 && e.mood_rating)
      .sort((a, b) => entryDateObj(b) - entryDateObj(a))[0];
    const anchorMood = latestMood?.mood_rating || null;

    const onThisDay = (hasCycle && todayCycleDay)
      ? decorated.filter((x) => x.cd != null && Math.abs(x.cd - todayCycleDay) <= 1) : [];
    const thisPhase = (hasCycle && phase)
      ? decorated.filter((x) => x.ph === phase) : [];
    const yearAgo = decorated
      .filter((x) => x.daysAgo != null && Math.abs(x.daysAgo - 365) <= 7)
      .sort((a, b) => Math.abs(a.daysAgo - 365) - Math.abs(b.daysAgo - 365));
    const sameMood = anchorMood
      ? decorated.filter((x) => x.mood === anchorMood) : [];

    // ── pattern catalogue — aggregate observations across the whole journal ──
    const patterns = [];
    const n = decorated.length;
    const spanDays = decorated[decorated.length - 1]?.daysAgo || 0;
    if (n >= 3) {
      if (hasCycle) {
        const byPhase = {};
        decorated.forEach((x) => { if (x.ph && x.mood) (byPhase[x.ph] = byPhase[x.ph] || []).push(x.mood); });
        const avgs = Object.entries(byPhase).filter(([, v]) => v.length >= 2)
          .map(([p, v]) => ({ p, avg: v.reduce((s, m) => s + m, 0) / v.length }));
        if (avgs.length >= 2) {
          avgs.sort((a, b) => a.avg - b.avg);
          const low = avgs[0], high = avgs[avgs.length - 1];
          if (high.avg - low.avg >= 0.6) {
            patterns.push(`Your ${low.p} pages read lower than your ${high.p} ones — your mood moves with the cycle, not just the day.`);
          }
        }
        const phaseCounts = {};
        decorated.forEach((x) => { if (x.ph) phaseCounts[x.ph] = (phaseCounts[x.ph] || 0) + 1; });
        const topPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0];
        if (topPhase && topPhase[1] >= 3) {
          patterns.push(`You write most in your ${topPhase[0]} phase — ${topPhase[1]} of your ${n} entries.`);
        }
      }
      const tagCounts = {};
      decorated.forEach((x) => x.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
      const topTags = Object.entries(tagCounts).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (topTags.length) {
        patterns.push(`Themes you return to: ${topTags.map(([t, c]) => `${t} (${c})`).join(", ")}.`);
      }
      if (spanDays >= 14) {
        patterns.push(`${n} entries across ${spanDays} days — past-you has left you a trail.`);
      }
    }

    return { decorated, onThisDay, thisPhase, yearAgo, sameMood, anchorMood, patterns };
  }, [entries, profile, phase, todayCycleDay]);

  // Build the lens menu (only lenses with real content appear).
  const lenses = useMemo(() => {
    if (!data || !data.decorated) return [];
    const out = [];
    if (data.onThisDay?.length) {
      out.push({ key: "onThisDay", label: "On this day", list: data.onThisDay,
        eyebrow: (m) => `On this day · ${relativeDate(m)} · Day ${todayCycleDay}`,
        gloss: PHASE_GLOSS[phase] || PHASE_GLOSS.luteal });
    }
    if (data.thisPhase?.length) {
      out.push({ key: "thisPhase", label: "This phase", list: data.thisPhase,
        eyebrow: (m) => `Your ${phase || "cycle"} phase · ${relativeDate(m)}`,
        gloss: `These are your ${phase || "same-season"} pages — the ${SEASON_WORD[phase] || "same season"} of your cycle, different days. Notice the throughline.` });
    }
    if (data.yearAgo?.length) {
      out.push({ key: "yearAgo", label: "A year ago", list: data.yearAgo,
        eyebrow: (m) => `A year ago · ${relativeDate(m)}`,
        gloss: "A year of you apart. What has shifted, and what hasn't?" });
    }
    if (data.sameMood?.length) {
      out.push({ key: "sameMood", label: "This feeling", list: data.sameMood,
        eyebrow: (m) => `This feeling · ${relativeDate(m)}`,
        gloss: `Other times you wrote from ${MOOD_WORD[data.anchorMood] || "here"}. You've stood in this exact place before — and moved through it.` });
    }
    if (data.patterns?.length) {
      out.push({ key: "patterns", label: "Patterns", patterns: data.patterns });
    }
    return out;
  }, [data, phase, todayCycleDay]);

  const [active, setActive] = useState(null);
  const activeKey = (active && lenses.some((l) => l.key === active)) ? active : (lenses[0]?.key || null);
  const lens = lenses.find((l) => l.key === activeKey) || null;

  // Cold start — entries exist but no lens has content yet (needs ≥1 prior cycle).
  if (!data || !data.decorated?.length || !lenses.length) {
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

  return (
    <section style={{ position: "relative", marginBottom: 46, background: T.paperHi, borderRadius: 3,
      padding: "30px 30px 26px", boxShadow: "0 1px 2px rgba(51,41,28,0.06), 0 0 0 1px rgba(51,41,28,0.05)" }}>
      <div aria-hidden style={{ position: "absolute", top: 2, left: 16, fontFamily: SERIF, fontSize: 110,
        color: T.gold, opacity: 0.16, lineHeight: 1, fontWeight: 600 }}>&ldquo;</div>

      {/* Lens chips — only when there's more than one way to look back */}
      {lenses.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16, position: "relative" }}>
          {lenses.map((l) => (
            <Chip key={l.key} active={l.key === activeKey} onClick={() => setActive(l.key)}>{l.label}</Chip>
          ))}
        </div>
      )}

      {lens && lens.key === "patterns" ? (
        <>
          <Eyebrow mb={8}>What your pages keep showing</Eyebrow>
          <Rule w={28} c={T.gold} mb={16} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {lens.patterns.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <Heart size={13} style={{ marginTop: 4, flexShrink: 0 }} />
                <Hand size={19} color={T.inkSoft}>{p}</Hand>
              </div>
            ))}
          </div>
        </>
      ) : lens ? (
        <>
          <Eyebrow mb={8}>{lens.eyebrow(lens.list[0].e)}</Eyebrow>
          <Rule w={28} c={T.gold} mb={14} />
          <Hand size={24} color={T.ink} style={{ margin: "0 0 16px", position: "relative" }}>{snippet(lens.list[0].e)}</Hand>

          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 18, paddingLeft: 12, borderLeft: `2px solid ${T.gold}` }}>
            <Heart size={13} style={{ marginTop: 4, flexShrink: 0 }} />
            <Hand size={18} color={T.inkSoft}>{lens.gloss}</Hand>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => onReply && onReply(lens.list[0].e)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
              border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
              fontFamily: HAND, fontWeight: 600, fontSize: 19, color: T.ink, textShadow: PRESS, borderBottom: `1px solid ${T.gold}`,
            }}>Reply to who you were <ArrowRight size={13} /></button>
            {lens.list.length > 1 && (
              <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.4, fontWeight: 600 }}>
                {lens.list.length - 1} more like this
              </span>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
