import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, subDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { Loader2, RefreshCw } from "lucide-react";

const MOOD_MAP = {
  1: { label: "Calm",      accent: "var(--sage)"       },
  2: { label: "Stressed",  accent: "#C4884A"            },
  3: { label: "Low",       accent: "#8A96B8"            },
  4: { label: "Energized", accent: "#B8A040"            },
  5: { label: "Angry",     accent: "#B85050"            },
  6: { label: "Anxious",   accent: "var(--rose-dust)"   },
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
  fontFamily: "'Inter', sans-serif",
};

export default function JournalInsightsTab({ user, entries }) {
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

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

  // Tag frequency (last 30)
  const tagCounts = {};
  last30.forEach((e) => {
    if (e.tags) e.tags.split(",").map(t => t.trim()).filter(Boolean).forEach((t) => {
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

  return (
    <div className="space-y-4">

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
              <p className="text-[10px]" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{day.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-5 mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{streak}</p>
            <p style={sLabel}>day streak</p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{last7.length}</p>
            <p style={sLabel}>this week</p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{entries.length}</p>
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
                    <p className="text-xs font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{m?.label}</p>
                    <p className="text-xs" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{pct}%</p>
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

      {/* Top themes */}
      {topTags.length > 0 && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-3">Themes You Return To</p>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
                <span className="text-xs font-semibold capitalize" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{tag}</span>
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
            style={{ color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
            {generatingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {weeklySummary ? "Refresh" : "Generate"}
          </button>
        </div>

        {last7.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Write a few entries this week to unlock your weekly reflection.
          </p>
        ) : weeklySummary ? (
          <p className="text-sm leading-relaxed"
            style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: "1.7" }}>
            {weeklySummary}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Tap Generate to see a gentle reflection on your week's writing.
          </p>
        )}
      </div>

      {entries.length === 0 && (
        <div className="rounded-[20px] p-10 text-center" style={card}>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Your insights will appear here</p>
          <p className="text-xs" style={{ color: "var(--mauve)" }}>Start writing to see mood patterns, themes, and your rhythm.</p>
        </div>
      )}
    </div>
  );
}