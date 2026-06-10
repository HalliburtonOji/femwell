import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, subDays, differenceInDays } from "date-fns";
import { Loader2, RefreshCw } from "lucide-react";
import CycleMoodPatternChart from "./CycleMoodPatternChart";
import AiDisclaimer from "@/components/compliance/AiDisclaimer";

const WHOLENESS_TYPES = ["relationships","career","creativity","money","grief","joy","identity"];
const WHOLENESS_LABELS = {
  relationships: "Relationships", career: "Career", creativity: "Creativity",
  money: "Money", grief: "Grief", joy: "Joy", identity: "Identity",
};

// H2 fix: ONE mood lexicon, matching what the composer writes (NewEntrySheet
// MOOD_FACES + EntryReader/CycleMirror MOOD_WORD): mood_rating is 1-5, Low->Bright.
// The old 6-value Calm/Stressed/Angry map mislabelled every logged mood.
const MOOD_MAP = {
  1: { label: "Low",     accent: "#8A96B8"     },
  2: { label: "Down",    accent: "#9B8B7A"     },
  3: { label: "Neutral", accent: "var(--mauve)" },
  4: { label: "Good",    accent: "var(--sage)" },
  5: { label: "Bright",  accent: "#C4884A"     },
};

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--mauve)",
  };

export default function JournalInsightsTab({ user, entries }) {
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [cycleEvents, setCycleEvents] = useState([]);
  const [loadingAux, setLoadingAux] = useState(true);   // H7: cycle-pattern fetch state
  const [auxError, setAuxError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dailyCheckins, events] = await Promise.all([
          base44.entities.DailyCheckins.filter({ user_id: user.id }),
          base44.entities.CycleEvents.filter({ user_id: user.id }, '-date', 100),
        ]);
        if (cancelled) return;
        setCheckins(Array.isArray(dailyCheckins) ? dailyCheckins : []);
        setCycleEvents(Array.isArray(events) ? events : []);
      } catch (err) {
        console.error("Insights aux load failed:", err);
        if (!cancelled) setAuxError(true);
      } finally {
        if (!cancelled) setLoadingAux(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  // Compute stats
  const last30 = entries.filter((e) => {
    try {
      const d = e.session_date ? parseISO(e.session_date) : new Date(e.created_date);
      return d >= subDays(new Date(), 30);
    } catch { return false; }
  });

  const last7 = entries.filter((e) => {
    try {
      const d = e.session_date ? parseISO(e.session_date) : new Date(e.created_date);
      return d >= subDays(new Date(), 7);
    } catch { return false; }
  });

  // Mood distribution (last 30)
  const moodCounts = {};
  last30.forEach((e) => {
    if (e.mood_rating) moodCounts[e.mood_rating] = (moodCounts[e.mood_rating] || 0) + 1;
  });
  const topMoods = Object.entries(moodCounts).sort(([,a],[,b]) => b - a).slice(0, 3);

  // Wholeness dimension breakdown (last 30)
  const wholeness30 = last30.filter(e => WHOLENESS_TYPES.includes(e.card_type));
  const wholeness7  = last7.filter(e => WHOLENESS_TYPES.includes(e.card_type));
  const wholenessCounts = {};
  wholeness30.forEach(e => { wholenessCounts[e.card_type] = (wholenessCounts[e.card_type] || 0) + 1; });
  const topWholeness = Object.entries(wholenessCounts).sort(([,a],[,b]) => b - a);

  // Tag frequency (last 30) — tolerate string OR array OR null
  const tagCounts = {};
  const tagsToArray = (t) => {
    if (Array.isArray(t)) return t.map(String).map(s => s.trim()).filter(Boolean);
    if (typeof t === "string") return t.split(",").map(s => s.trim()).filter(Boolean);
    return [];
  };
  last30.forEach((e) => {
    tagsToArray(e.tags).forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts).sort(([,a],[,b]) => b - a).slice(0, 6);

  // Writing streak
  let streak = 0;
  const check = new Date();
  while (true) {
    const ds = check.toISOString().split("T")[0];
    const found = entries.some((e) => (e.session_date || e.created_date?.split("T")[0]) === ds);
    if (!found) break;
    streak++;
    check.setDate(check.getDate() - 1);
  }

  // Last 7 days writing activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const ds = d.toISOString().split("T")[0];
    const count = entries.filter((e) => (e.session_date || e.created_date?.split("T")[0]) === ds).length;
    return { date: ds, label: format(d, "EEE"), count };
  });

  const generateWeeklySummary = async () => {
    setGeneratingSummary(true);
    const recentEntries = last7.slice(0, 6);
    const text = recentEntries.map(e => e.text?.slice(0, 200)).join("\n---\n");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a calm, supportive wellness journaling guide. Based on these journal entries from the past week, write a brief, warm, non-judgmental weekly reflection (2-3 sentences max). Note any patterns in themes, emotions, or energy without making clinical claims. End with one gentle question or observation for next week. Keep it personal, calm, and supportive.

Entries:
${text}

Return as plain text, no markdown.`,
    });
    setWeeklySummary(res);
    setGeneratingSummary(false);
  };

  const cyclePatternData = useMemo(() => {
    const phases = {
      Menstrual: { mood: [], energy: [] },
      Follicular: { mood: [], energy: [] },
      Ovulatory: { mood: [], energy: [] },
      Luteal: { mood: [], energy: [] },
    };
    const periodStarts = cycleEvents.filter(event => event.type === 'PeriodStart').sort((a, b) => a.date.localeCompare(b.date));
    if (!periodStarts.length) return [];
    const recentEntries = entries.filter(entry => {
      const date = entry.session_date || entry.created_date?.split('T')[0];
      return date && date >= format(subDays(new Date(), 90), 'yyyy-MM-dd');
    });
    recentEntries.forEach(entry => {
      const date = entry.session_date || entry.created_date?.split('T')[0];
      const periodStart = [...periodStarts].reverse().find(event => event.date <= date);
      if (!periodStart) return;
      const day = differenceInDays(parseISO(date), parseISO(periodStart.date)) + 1;
      const phase = day <= 5 ? 'Menstrual' : day <= 13 ? 'Follicular' : day <= 16 ? 'Ovulatory' : 'Luteal';
      if (entry.mood_rating) phases[phase].mood.push(Number(entry.mood_rating));
      const checkin = checkins.find(item => item.date === date);
      if (checkin?.energy != null) phases[phase].energy.push(Number(checkin.energy));
    });
    return Object.entries(phases).map(([label, values]) => ({
      label,
      mood: values.mood.length ? Number((values.mood.reduce((sum, value) => sum + value, 0) / values.mood.length).toFixed(1)) : 0,
      energy: values.energy.length ? Number((values.energy.reduce((sum, value) => sum + value, 0) / values.energy.length).toFixed(1)) : 0,
      samples: Math.max(values.mood.length, values.energy.length),
    })).filter(item => item.samples > 0);
  }, [entries, checkins, cycleEvents]);

  const cyclePatternSummary = useMemo(() => {
    if (!cyclePatternData.length) return null;
    const lowestEnergy = [...cyclePatternData].sort((a, b) => a.energy - b.energy)[0];
    const highestMood = [...cyclePatternData].sort((a, b) => b.mood - a.mood)[0];
    return `Your energy tends to dip most in ${lowestEnergy.label.toLowerCase()}, while your calmest or strongest journal mood shows up most in ${highestMood.label.toLowerCase()}.`;
  }, [cyclePatternData]);

  return (
    <div className="space-y-4">

      {loadingAux ? (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-3">Cycle &amp; Mood Patterns</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--mauve)" }}>
            <Loader2 className="animate-spin" size={16} /> <span className="text-sm">Gathering your patterns…</span>
          </div>
        </div>
      ) : auxError ? (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-2">Cycle &amp; Mood Patterns</p>
          <p className="text-sm" style={{ color: "var(--mauve)" }}>We couldn{"’"}t load your cycle patterns just now. The entries above are unaffected — try again later.</p>
        </div>
      ) : cyclePatternData.length > 0 ? (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-4">Cycle &amp; Mood Patterns</p>
          <CycleMoodPatternChart data={cyclePatternData} />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {cyclePatternData.map((item) => (
              <div key={item.label} className="rounded-2xl px-3 py-3" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: "var(--mauve)", }}>{item.label}</p>
                <p className="text-xs" style={{ color: "var(--plum)", }}>Mood {item.mood}/10</p>
                <p className="text-xs" style={{ color: "var(--plum)", }}>Energy {item.energy}/10</p>
              </div>
            ))}
          </div>
          {cyclePatternSummary && (
            <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--plum)", }}>{cyclePatternSummary}</p>
              {/* Sprint C C1 — MHRA disclaimer below AI summary. */}
              <AiDisclaimer style={{ marginTop: 8 }} />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-2">Cycle & Mood Patterns</p>
          <p className="text-sm" style={{ color: "var(--mauve)", }}>
            Keep logging journal mood, energy, and cycle events to unlock this pattern view.
          </p>
        </div>
      )}

      {/* Writing rhythm */}
      <div className="rounded-[24px] p-5" style={card}>
        <p style={sLabel} className="mb-4">Writing Rhythm — Last 7 Days</p>
        <div className="flex items-end gap-1.5 h-12">
          {last7Days.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-sm transition-all"
                style={{
                  height: day.count > 0 ? `${Math.min(day.count * 24, 48)}px` : "6px",
                  backgroundColor: day.count > 0 ? "var(--rose-dust)" : "var(--ivory-dark)",
                  minHeight: "6px",
                }} />
              <p className="text-[10px]" style={{ color: "var(--mauve)", }}>{day.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-5 mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--plum)", }}>{streak}</p>
            <p style={sLabel}>day streak</p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--plum)", }}>{last7.length}</p>
            <p style={sLabel}>this week</p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--plum)", }}>{entries.length}</p>
            <p style={sLabel}>total entries</p>
          </div>
        </div>
      </div>

      {/* Mood pattern */}
      {topMoods.length > 0 && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-3.5">Mood Pattern — Last 30 Days</p>
          <div className="space-y-2.5">
            {topMoods.map(([rating, count]) => {
              const m = MOOD_MAP[Number(rating)];
              const pct = Math.round((count / last30.length) * 100);
              return (
                <div key={rating}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold" style={{ color: "var(--plum)", }}>{m?.label}</p>
                    <p className="text-xs" style={{ color: "var(--mauve)", }}>{pct}%</p>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--ivory-dark)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: m?.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wholeness dimensions */}
      {topWholeness.length > 0 && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-3">Life Dimensions — Last 30 Days</p>
          <div className="flex flex-wrap gap-2">
            {topWholeness.map(([type, count]) => (
              <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--plum)" }}>{WHOLENESS_LABELS[type]}</span>
                <span className="text-[10px]" style={{ color: "var(--mauve)" }}>{count}</span>
              </div>
            ))}
          </div>
          {wholeness7.length > 0 && (
            <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--mauve)" }}>
              You wrote {wholeness7.length} {wholeness7.length === 1 ? "entry" : "entries"} about life dimensions this week.
              {wholeness30.length > wholeness7.length ? ` ${wholeness30.length} in the last month.` : ""}
            </p>
          )}
        </div>
      )}

      {/* Top themes */}
      {topTags.length > 0 && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-3">Themes You Return To</p>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
                <span className="text-xs font-semibold capitalize" style={{ color: "var(--plum)", }}>{tag}</span>
                <span className="text-[10px]" style={{ color: "var(--mauve)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly reflection summary */}
      <div className="rounded-[24px] p-5" style={card}>
        <div className="flex items-center justify-between mb-3">
          <p style={sLabel}>Weekly Reflection</p>
          <button onClick={generateWeeklySummary} disabled={generatingSummary || last7.length === 0}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-40"
            style={{ color: "var(--rose-dust)", }}>
            {generatingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {weeklySummary ? "Refresh" : "Generate"}
          </button>
        </div>

        {last7.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--mauve)", }}>
            Write a few entries this week to unlock your weekly reflection.
          </p>
        ) : weeklySummary ? (
          <p className="text-sm leading-relaxed"
            style={{ color: "var(--plum)", lineHeight: "1.7" }}>
            {weeklySummary}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--mauve)", }}>
            Tap Generate to see a gentle reflection on your week's writing.
          </p>
        )}
      </div>

      {entries.length === 0 && (
        <div className="rounded-[20px] p-10 text-center" style={card}>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)", }}>Your insights will appear here</p>
          <p className="text-xs" style={{ color: "var(--mauve)" }}>Start writing to see mood patterns, themes, and your rhythm.</p>
        </div>
      )}
    </div>
  );
}