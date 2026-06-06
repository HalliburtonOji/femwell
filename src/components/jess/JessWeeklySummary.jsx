// JessWeeklySummary — Jess v2 J2-8
//
// Once-a-week reflection card. Visible only on Sundays (when the user
// is most likely to want a week-in-review), aggregating the last 7 days
// of activity across DailyCheckins, HabitLogs, SymptomLogs, and
// JournalEntries into a short Jess-written narrative.
//
// Cached weekly under `jess_weekly_summary_<userId>_<weekKey>` so we
// only round-trip the agent once per week. If the cache key exists and
// has `shown: true` we don't re-render.
//
// Hidden if there's <3 check-ins in the last 7 days (not enough signal
// to summarise) or if the user dismisses it.
//
// Disclaimer is light — same as other Jess cards. Persistent footer
// covers the chat surface; this is reflection, not advice.

import { useEffect, useRef, useState } from "react";
import { X, ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  callJessAgent,
  loadDailyCache,
  saveDailyCache,
  weekKey,
} from "@/services/jessAgentService";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
};

// Date helpers — use LOCAL date components like jessAgentService.todayKey().
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

const FALLBACK =
  "This week had its rhythm — some bright spots, some heavier days. " +
  "Whatever sticks with you most, that's worth noticing.";

export default function JessWeeklySummary({ user, profile }) {
  const [text, setText]       = useState("");
  const [visible, setVisible] = useState(true);
  const [dismiss, setDismiss] = useState(false);
  const [counts, setCounts]   = useState(null);
  const ranRef               = useRef(false);

  // Sunday only. Use the LOCAL date for the day-of-week so we don't fire
  // on a Saturday-night Z-shifted client. getDay() returns 0 = Sunday.
  //
  // Sprint 3 S3-2 — dev/test bypass. Setting
  // `localStorage.setItem('jess_weekly_force', 'true')` forces the
  // weekly summary card to fire regardless of day, so QA can verify
  // the surface without waiting for Sunday. Production users are
  // unaffected (the key is only ever set manually).
  const forceFlag = (() => {
    try { return window.localStorage?.getItem("jess_weekly_force") === "true"; }
    catch { return false; }
  })();
  const isSunday = new Date().getDay() === 0 || forceFlag;

  const cacheKey = user?.id ? `jess_weekly_summary_${user.id}_${weekKey()}` : null;

  useEffect(() => {
    if (!cacheKey || ranRef.current) return;
    if (!isSunday) { setVisible(false); ranRef.current = true; return; }
    ranRef.current = true;

    const cached = loadDailyCache(cacheKey);
    if (cached?.dismissed) { setVisible(false); return; }
    if (cached?.text) {
      setText(cached.text);
      setCounts(cached.counts || null);
      saveDailyCache(cacheKey, { ...cached, shown: true });
      return;
    }

    (async () => {
      const { startKey, endKey } = weekWindow();
      const C2 = base44?.entities || {};
      const safeFilter = async (Ent, q) => {
        if (!Ent) return [];
        try { return await Ent.filter(q).catch(() => []); }
        catch { return []; }
      };

      const [checkins, habits, symptoms, journals] = await Promise.all([
        safeFilter(C2.DailyCheckins, { user_id: user.id }),
        safeFilter(C2.HabitLogs,     { user_id: user.id }),
        safeFilter(C2.SymptomLogs,   { user_id: user.id }),
        safeFilter(C2.JournalEntries, { user_id: user.id }),
      ]);

      const wci = checkins.filter((c) => c.date >= startKey && c.date <= endKey);
      const wh  = habits.filter((h) => h.date >= startKey && h.date <= endKey && h.completed);
      const ws  = symptoms.filter((s) => s.date >= startKey && s.date <= endKey);
      const wj  = journals.filter((j) => {
        const d = j.session_date || (j.created_date ? j.created_date.split("T")[0] : "");
        return d >= startKey && d <= endKey;
      });

      // Need a baseline of activity to summarise — otherwise punt and
      // remember to not re-try this week.
      if (wci.length < 3 && wh.length === 0 && wj.length === 0) {
        saveDailyCache(cacheKey, { suppress: true, dismissed: true });
        setVisible(false);
        return;
      }

      // Aggregate metrics.
      const avg = (arr, k) => {
        const xs = arr.map((x) => Number(x?.[k])).filter((n) => Number.isFinite(n));
        if (!xs.length) return null;
        return Number((xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1));
      };
      const avgMood   = avg(wci, "mood");
      const avgEnergy = avg(wci, "energy");
      const avgSleep  = avg(wci, "sleep_hours");
      const symFreq = {};
      for (const s of ws) {
        const name = s?.name || s?.symptom || "symptom";
        symFreq[name] = (symFreq[name] || 0) + 1;
      }
      const topSymptoms = Object.entries(symFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([n]) => n);

      const aggregated = {
        checkinCount: wci.length,
        habitCount:   wh.length,
        symptomCount: ws.length,
        journalCount: wj.length,
        avgMood, avgEnergy, avgSleep,
        topSymptoms,
      };

      const lifeStage = profile?.life_stage || "reproductive";
      const system =
        "You are Jess, a warm UK-based women's health companion. " +
        "Write ONE short 3-sentence reflection on the user's last 7 days. " +
        "Mention concrete numbers where helpful (mood/energy averages, habit count). " +
        "Be warm and specific, not generic. Do not diagnose. No medical advice. " +
        "No greeting, no sign-off, no quotation marks. Max 360 chars.";

      const userPrompt =
        `Life stage: ${lifeStage}.\n` +
        `Check-ins: ${aggregated.checkinCount}\n` +
        `Avg mood: ${aggregated.avgMood ?? "n/a"}/5\n` +
        `Avg energy: ${aggregated.avgEnergy ?? "n/a"}/5\n` +
        `Avg sleep: ${aggregated.avgSleep ?? "n/a"}h\n` +
        `Habits completed: ${aggregated.habitCount}\n` +
        `Symptoms logged: ${aggregated.symptomCount}` +
          (topSymptoms.length ? ` (top: ${topSymptoms.join(", ")})` : "") + `\n` +
        `Journal entries: ${aggregated.journalCount}\n\n` +
        `Write the reflection.`;

      try {
        const { text: raw } = await callJessAgent({ system, user: userPrompt });
        const cleaned = String(raw || "").trim().replace(/^["']|["']$/g, "");
        const final = cleaned && cleaned.length > 24 ? cleaned : FALLBACK;
        setText(final);
        setCounts(aggregated);
        saveDailyCache(cacheKey, { text: final, counts: aggregated, shown: true });
      } catch {
        setText(FALLBACK);
        setCounts(aggregated);
        saveDailyCache(cacheKey, { text: FALLBACK, counts: aggregated, shown: true });
      }
    })();
  }, [cacheKey, isSunday, user?.id, profile?.life_stage]);

  function close() {
    setDismiss(true);
    setTimeout(() => setVisible(false), 320);
    if (cacheKey) {
      const cached = loadDailyCache(cacheKey) || {};
      saveDailyCache(cacheKey, { ...cached, dismissed: true });
    }
  }

  if (!visible || !text) return null;

  return (
    <article style={{
      margin: "0 16px 12px",
      background: `linear-gradient(135deg, ${C.paperHi} 0%, rgba(232,180,184,0.22) 100%)`,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.blush}`,
      borderRadius: 16,
      padding: "12px 14px 12px",
      display: "flex", alignItems: "flex-start", gap: 12,
      boxShadow: "0 4px 14px rgba(58,44,26,0.08)",
      animation: dismiss
        ? "jess-weekly-leave 320ms ease-in forwards"
        : "jess-weekly-enter 420ms cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9999,
        background: C.blush,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }} aria-hidden>
        <ScrollText size={14} style={{ color: C.espresso }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: C.muted, }}>Jess · your week</p>
        <p style={{
          margin: "4px 0 0", fontSize: 14,
          color: C.espresso, lineHeight: 1.5,
        }}>{text}</p>
        {counts && (counts.checkinCount > 0 || counts.habitCount > 0) && (
          <p style={{
            margin: "6px 0 0", fontSize: 11, color: C.muted,
            letterSpacing: "0.02em",
          }}>
            {[
              counts.checkinCount ? `${counts.checkinCount} check-in${counts.checkinCount === 1 ? "" : "s"}` : null,
              counts.habitCount   ? `${counts.habitCount} habit${counts.habitCount === 1 ? "" : "s"}`         : null,
              counts.journalCount ? `${counts.journalCount} journal entr${counts.journalCount === 1 ? "y" : "ies"}` : null,
            ].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss weekly summary"
        style={{
          width: 26, height: 26, borderRadius: 9999,
          background: "rgba(58,44,26,0.06)", border: "none",
          color: C.espresso, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, padding: 0,
        }}
      ><X size={12} /></button>
      <style>{`
        @keyframes jess-weekly-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jess-weekly-leave {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>
    </article>
  );
}
