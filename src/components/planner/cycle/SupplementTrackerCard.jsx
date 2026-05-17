// ─────────────────────────────────────────────────────────────────────────────
// SupplementTrackerCard — pre-TTC daily supplement compliance tracker.
// Build 2 of the pre-TTC feature set.
//
// Props:
//   userId   (string)  — required, current user's id
//   profile  (object)  — UserProfile; checks .conditions for 'thyroid'
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { base44 } from "@/api/base44Client";

const TODAY = format(new Date(), "yyyy-MM-dd");

// Base supplement checklist
const BASE_SUPPLEMENTS = [
  { key: "folic_acid", label: "Folic Acid", dose: "400 mcg" },
  { key: "vitamin_d",  label: "Vitamin D",  dose: "1000 IU" },
  { key: "omega3",     label: "Omega-3",    dose: "250 mg DHA" },
  { key: "iron",       label: "Iron",       dose: "diet-first" },
];

// Extra supplement shown when profile.conditions includes 'thyroid'
const SELENIUM_SUPPLEMENT = { key: "selenium", label: "Selenium", dose: "200 mcg" };

function hasThyroid(profile) {
  const conds = profile?.conditions ?? profile?.condition_flags ?? [];
  if (!Array.isArray(conds)) return false;
  return conds.some((c) => typeof c === "string" && c.toLowerCase().includes("thyroid"));
}

// Count consecutive days (ending today) where folic_acid === true
function calcStreak(logs) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const dayStr = format(subDays(today, i), "yyyy-MM-dd");
    const log = logs.find((l) => l.date === dayStr);
    if (log?.folic_acid === true) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export default function SupplementTrackerCard({ userId, profile }) {
  const [todayLog, setTodayLog] = useState(null);   // today's SupplementLog record or null
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supplements = hasThyroid(profile)
    ? [...BASE_SUPPLEMENTS, SELENIUM_SUPPLEMENT]
    : BASE_SUPPLEMENTS;

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      // Fetch last 30 days for streak calculation
      const cutoff = format(subDays(new Date(), 29), "yyyy-MM-dd");
      const rows = await base44.entities.SupplementLog.filter(
        { user_id: userId },
        "-date",
        30,
      );
      const recent = rows.filter((r) => r.date >= cutoff);
      const todayRec = recent.find((r) => r.date === TODAY) || null;
      setTodayLog(todayRec);
      setStreak(calcStreak(recent));
    } catch {
      setTodayLog(null);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (key) => {
    if (!userId || saving) return;
    const newVal = !(todayLog?.[key] ?? false);
    // Optimistic update
    setTodayLog((prev) => {
      const base = prev ?? { date: TODAY, user_id: userId };
      return { ...base, [key]: newVal };
    });
    setSaving(true);
    try {
      if (todayLog?.id) {
        const updated = await base44.entities.SupplementLog.update(todayLog.id, { [key]: newVal });
        setTodayLog(updated);
      } else {
        // Build a fresh record with all keys defaulting to false, then set the toggled key
        const payload = {
          date: TODAY,
          user_id: userId,
          folic_acid: false,
          vitamin_d: false,
          omega3: false,
          iron: false,
          [key]: newVal,
        };
        const created = await base44.entities.SupplementLog.create(payload);
        setTodayLog(created);
      }
      // Recalculate streak after save
      load();
    } catch {
      // Revert optimistic change on error
      load();
    } finally {
      setSaving(false);
    }
  };

  const checkedCount = supplements.filter((s) => todayLog?.[s.key] === true).length;

  return (
    <section style={card} aria-label="Supplement tracker">
      {/* Header row */}
      <div style={headRow}>
        <div>
          <p style={eyebrow}>DAILY SUPPLEMENTS · PRE-CONCEPTION</p>
          <p style={title}>What have you taken today?</p>
        </div>
        <div style={streakBadge} aria-label={`${streak}-day folic acid streak`}>
          <span style={streakEmoji}>🌿</span>
          <span style={streakNum}>{streak}</span>
          <span style={streakLabel}>day{streak !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "12px 0", textAlign: "center" }}>
          <div style={spinner} />
        </div>
      ) : (
        <div style={list}>
          {supplements.map((s) => {
            const checked = todayLog?.[s.key] === true;
            return (
              <button
                key={s.key}
                onClick={() => toggle(s.key)}
                disabled={saving}
                aria-pressed={checked}
                style={{
                  ...row,
                  background: checked ? "rgba(143,175,143,0.15)" : "rgba(255,255,255,0.55)",
                  borderColor: checked ? "#8FAF8F" : "rgba(58,44,26,0.10)",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {/* Checkbox */}
                <span style={{
                  ...checkbox,
                  background: checked ? "#8FAF8F" : "transparent",
                  borderColor: checked ? "#8FAF8F" : "rgba(58,44,26,0.25)",
                }}>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path d="M1 4l3 3 5-6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {/* Label */}
                <span style={rowLabel}>
                  <span style={{ ...rowName, color: checked ? "#3F6228" : "#3A2C1A" }}>
                    {s.label}
                  </span>
                  <span style={rowDose}>{s.dose}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Progress summary */}
      {!loading && (
        <p style={summary}>
          {checkedCount === 0
            ? "Tap each supplement as you take it."
            : checkedCount === supplements.length
              ? "All done for today. Keep it up."
              : `${checkedCount} of ${supplements.length} taken today.`}
        </p>
      )}
    </section>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const card = {
  background: "#F4EDDB",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #E8B4B8",
  borderRadius: 14,
  padding: "14px 14px 16px",
  marginBottom: 12,
};
const headRow = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 12,
};
const eyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#C48A8C",
  textTransform: "uppercase",
  margin: 0,
};
const title = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17,
  fontWeight: 500,
  lineHeight: 1.22,
  color: "#3A2C1A",
  margin: "3px 0 0",
};
const streakBadge = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "rgba(232,180,184,0.20)",
  border: "1px solid rgba(232,180,184,0.45)",
  borderRadius: 10,
  padding: "6px 10px",
  minWidth: 52,
  flexShrink: 0,
};
const streakEmoji = {
  fontSize: 14,
  lineHeight: 1,
};
const streakNum = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 20,
  fontWeight: 600,
  color: "#3A2C1A",
  lineHeight: 1.1,
};
const streakLabel = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 600,
  color: "#C48A8C",
  textTransform: "uppercase",
  letterSpacing: "0.10em",
};
const list = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};
const row = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  border: "1px solid",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
  textAlign: "left",
  transition: "background 120ms, border-color 120ms",
  background: "none",
};
const checkbox = {
  width: 20,
  height: 20,
  borderRadius: 6,
  border: "1.5px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background 120ms, border-color 120ms",
};
const rowLabel = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  flex: 1,
};
const rowName = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.2,
  transition: "color 120ms",
};
const rowDose = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "#6B5840",
  lineHeight: 1.2,
};
const summary = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "#6B5840",
  fontStyle: "italic",
  textAlign: "center",
  margin: "10px 0 0",
};
const spinner = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "2px solid rgba(232,180,184,0.25)",
  borderTopColor: "#E8B4B8",
  animation: "spin 0.7s linear infinite",
  margin: "0 auto",
};