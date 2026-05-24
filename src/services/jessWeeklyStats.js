// jessWeeklyStats — shared helper for "last 7 days" aggregates.
//
// Extracted from JessWeeklySummary.jsx so the chat intercept ("Jess,
// summarise my week" — QA Fix 5) can pull the same numbers and prepend
// them to the agent prompt. Without this, the agent answers "I don't
// have access to your historical data" because base44 agents don't get
// any entity context for free — every fact has to be inline in the
// user message.
//
// Public:
//   fetchWeeklyStats(userId)        → Promise<aggregates | null>
//   buildWeeklyStatsContext(agg)    → "[WEEKLY STATS]\n..." | ""
//   matchesWeeklySummaryAsk(text)   → boolean
//
// All entity calls are wrapped in try/catch so a missing entity (e.g.
// JournalEntries not provisioned) degrades to 0 rather than blowing
// up the chat send.

import { base44 } from "@/api/base44Client";
import { todayKey } from "@/services/jessAgentService";

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekWindow() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today); start.setDate(today.getDate() - 6);
  return { startKey: ymd(start), endKey: ymd(today) };
}

async function safeFilter(Ent, query) {
  if (!Ent) return [];
  try { return await Ent.filter(query).catch(() => []); }
  catch { return []; }
}

// Returns { checkinCount, habitCount, symptomCount, journalCount,
//           avgMood, avgEnergy, avgSleep, topSymptoms[] }
// Or `null` if userId is missing.
export async function fetchWeeklyStats(userId) {
  if (!userId) return null;
  const { startKey, endKey } = weekWindow();
  const Ent = base44?.entities || {};

  const [checkins, habits, symptoms, journals] = await Promise.all([
    safeFilter(Ent.DailyCheckins,  { user_id: userId }),
    safeFilter(Ent.HabitLogs,      { user_id: userId }),
    safeFilter(Ent.SymptomLogs,    { user_id: userId }),
    safeFilter(Ent.JournalEntries, { user_id: userId }),
  ]);

  const wci = checkins.filter((c) => c.date >= startKey && c.date <= endKey);
  const wh  = habits.filter((h) => h.date >= startKey && h.date <= endKey && h.completed);
  const ws  = symptoms.filter((s) => s.date >= startKey && s.date <= endKey);
  const wj  = journals.filter((j) => {
    const d = j.session_date || (j.created_date ? String(j.created_date).split("T")[0] : "");
    return d >= startKey && d <= endKey;
  });

  // Sprint 1 S1-3 — exclude unlogged days from the average. A row that
  // never filled in mood/energy/sleep stores 0 or undefined; treating
  // those as real 0/5 readings dragged the GP-facing averages to "0.4"
  // for users who only logged 2 of 7 days. Now we only average days
  // with a positive logged value (>0 for mood/energy on the 1-5 scale,
  // and >0 for sleep_hours).
  const avg = (arr, k) => {
    const xs = arr
      .map((x) => Number(x?.[k]))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!xs.length) return null;
    return Number((xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1));
  };
  const symFreq = {};
  for (const s of ws) {
    const name = s?.name || s?.symptom || s?.symptom_type || s?.symptom_name || "symptom";
    symFreq[name] = (symFreq[name] || 0) + 1;
  }
  const topSymptoms = Object.entries(symFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n]) => n);

  return {
    windowStart: startKey,
    windowEnd: endKey,
    checkinCount: wci.length,
    habitCount:   wh.length,
    symptomCount: ws.length,
    journalCount: wj.length,
    avgMood:   avg(wci, "mood"),
    avgEnergy: avg(wci, "energy"),
    avgSleep:  avg(wci, "sleep_hours"),
    topSymptoms,
  };
}

// Format aggregates as a [WEEKLY STATS] context block that the chat
// shell prepends to the user's message. The agent treats this block as
// authoritative; the system prompt should already say "use any
// [WEEKLY STATS] block as the user's actual data."
export function buildWeeklyStatsContext(agg) {
  if (!agg) return "";
  // Sprint 1 S1-3 — when an average is null it means no days had a
  // logged value. Surface that explicitly so Jess doesn't hallucinate
  // a "0/5 mood" reading from missing data.
  const fmtAvg = (v, unit = "") => (v == null || !Number.isFinite(v))
    ? "N/A (not logged)"
    : `${v}${unit}`;
  const lines = [
    "[WEEKLY STATS]",
    `Window: ${agg.windowStart} → ${agg.windowEnd} (last 7 days, today=${todayKey()})`,
    `Check-ins: ${agg.checkinCount}`,
    `Avg mood: ${fmtAvg(agg.avgMood, "/5")}`,
    `Avg energy: ${fmtAvg(agg.avgEnergy, "/5")}`,
    `Avg sleep: ${fmtAvg(agg.avgSleep, "h")}`,
    `Habits completed: ${agg.habitCount}`,
    `Symptoms logged: ${agg.symptomCount}` +
      (agg.topSymptoms?.length ? ` (top: ${agg.topSymptoms.join(", ")})` : ""),
    `Journal entries: ${agg.journalCount}`,
  ];
  return lines.join("\n");
}

// Loose intercept matcher. We want to catch the natural phrasings the
// user reported AND any obvious variants without dragging in unrelated
// "week" mentions ("I have a busy week ahead" should NOT match).
const ASK_RE = /\b(summari[sz]e|summary|recap|review)\b[^.?!]{0,40}\b(my )?week\b/i;
export function matchesWeeklySummaryAsk(text) {
  if (!text) return false;
  return ASK_RE.test(String(text));
}
