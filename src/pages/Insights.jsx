import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, LineChart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { symptomLabel } from "@/utils/symptomLabels";
import KpiCard from "@/components/insights/KpiCard";
import TrendCards from "@/components/insights/TrendCards";
import PhaseOverlayChart from "@/components/insights/PhaseOverlayChart";
import CorrelationsCard from "@/components/insights/CorrelationsCard";
import SymptomHeatmap from "@/components/track/SymptomHeatmap";
import InsightsSkeleton from "@/components/insights/InsightsSkeleton";
import ContentActionBar from "@/components/common/ContentActionBar";

function avg(arr) {
  const n = arr.filter(x => x != null && !isNaN(x));
  if (!n.length) return null;
  return n.reduce((a, b) => a + b, 0) / n.length;
}

function toOutOf10(value) {
  // mood/energy stored on 1-5 scale. Convert to 1-10 for display.
  if (value == null) return null;
  return value * 2;
}

function dateRangeLabel(days) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  const fmt = (d) => d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(today)}`;
}

function DayDetailModal({ date, checkin, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 80, backgroundColor: "rgba(11,8,5,0.5)", backdropFilter: "blur(6px)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Check-in detail for ${date}`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 81,
          backgroundColor: "var(--surface)",
          borderRadius: "20px 20px 0 0",
          maxHeight: "80vh",
          padding: "16px 20px 32px",
          boxShadow: "0 -8px 32px rgba(11,8,5,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <div style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", }}>
            {new Date(date).toLocaleDateString("en-GB", { weekday: "long", month: "short", day: "numeric" })}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, minWidth: 44, minHeight: 44,
              border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--mauve)",
            }}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {!checkin ? (
          <p style={{ fontSize: 13, color: "var(--mauve)", }}>
            No check-in logged on this day.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(checkin.symptoms || []).length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mauve)", }}>Symptoms</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {checkin.symptoms.map(s => (
                    <span key={s} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--blush-surface, #FCE7F3)", color: "var(--rose-deep, #E11D74)", }}>
                      {symptomLabel(s)}
                    </span>
                  ))}
                </div>
                {checkin.symptom_severity != null && (
                  <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 6 }}>
                    Overall severity: {checkin.symptom_severity}/5
                  </p>
                )}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {(checkin.mood_score ?? checkin.mood) != null && (
                <StatCell label="Mood" value={`${checkin.mood_score ?? checkin.mood}/5`} />
              )}
              {(checkin.energy_level ?? checkin.energy) != null && (
                <StatCell label="Energy" value={`${checkin.energy_level ?? checkin.energy}/5`} />
              )}
              {checkin.sleep_hours != null && (
                <StatCell label="Sleep" value={`${checkin.sleep_hours}h`} />
              )}
            </div>
            {checkin.notes && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mauve)", }}>Notes</p>
                <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.55, marginTop: 4 }}>{checkin.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function StatCell({ label, value }) {
  return (
    <div style={{ backgroundColor: "var(--ivory-dark)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
      <p style={{ fontSize: 10, color: "var(--mauve)", }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginTop: 2 }}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px dashed var(--border)",
        borderRadius: 20,
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 64, height: 64, margin: "0 auto 14px",
          borderRadius: "50%",
          backgroundColor: "var(--blush-surface, #FCE7F3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <LineChart className="w-7 h-7" strokeWidth={1.5} style={{ color: "var(--rose-deep, #E11D74)" }} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", marginBottom: 6 }}>
        Your insights live here
      </h3>
      <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.55, marginBottom: 18 }}>
        Log 3+ days of symptoms, mood, or energy and we'll start surfacing patterns.
      </p>
      <Link
        to={createPageUrl("Today")}
        style={{
          display: "inline-block",
          backgroundColor: "var(--rose-deep, #E11D74)",
          color: "white",
          borderRadius: 10,
          padding: "10px 22px",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          minHeight: 44,
          lineHeight: "24px",
        }}
      >
        Start logging
      </Link>
    </div>
  );
}

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.id) { setLoading(false); return; }
        const [profiles, ci] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: user.id }, "-date", 90).catch(() => []),
        ]);
        setProfile(profiles[0] || null);
        setCheckins(ci || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = useMemo(() => {
    const today = new Date();
    const msDay = 86400000;
    const last30 = [];
    const prev30 = [];
    checkins.forEach(c => {
      if (!c.date) return;
      const diff = Math.floor((today - new Date(c.date)) / msDay);
      if (diff >= 0 && diff < 30) last30.push(c);
      else if (diff >= 30 && diff < 60) prev30.push(c);
    });

    // Days logged sparkline: last 14 days, 1 if logged else 0
    const sparkDays = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];
      sparkDays.push(checkins.some(c => c.date === key) ? 1 : 0);
    }

    // Most common symptom (last 30)
    const counts = {};
    last30.forEach(c => (c.symptoms || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    const topSymptom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    // Mood & energy (1-5 → 1-10 display)
    const getMood = c => c.mood_score ?? c.mood;
    const getEnergy = c => c.energy_level ?? c.energy;
    const moodCur = avg(last30.map(getMood));
    const moodPrev = avg(prev30.map(getMood));
    const energyCur = avg(last30.map(getEnergy));
    const energyPrev = avg(prev30.map(getEnergy));

    return {
      daysLogged: last30.length,
      sparkDays,
      topSymptom: topSymptom ? { slug: topSymptom[0], count: topSymptom[1] } : null,
      moodCur10: toOutOf10(moodCur),
      moodDelta10: moodCur != null && moodPrev != null ? toOutOf10(moodCur) - toOutOf10(moodPrev) : null,
      energyCur10: toOutOf10(energyCur),
      energyDelta10: energyCur != null && energyPrev != null ? toOutOf10(energyCur) - toOutOf10(energyPrev) : null,
    };
  }, [checkins]);

  const hasAnyData = checkins.length > 0;

  const selectedCheckin = selectedDate ? checkins.find(c => c.date === selectedDate) : null;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30" style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl lg:max-w-5xl mx-auto px-4 pt-10 pb-3">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              to={createPageUrl("Today")}
              aria-label="Back"
              style={{
                width: 36, height: 36, minWidth: 44, minHeight: 44,
                borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--plum)", textDecoration: "none",
              }}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
            </Link>
            <div>
              <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Discover patterns</p>
              <h1 className="fw-display">
                Insights
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4">
        {loading ? (
          <InsightsSkeleton />
        ) : !hasAnyData ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              <KpiCard
                label="Days logged"
                value={kpis.daysLogged}
                subtext="last 30 days"
                sparkline={kpis.sparkDays}
                sparklineColor="var(--rose-deep, #E11D74)"
                ariaLabel={`${kpis.daysLogged} days logged in the last 30`}
              />
              <KpiCard
                label="Top symptom"
                value={kpis.topSymptom ? symptomLabel(kpis.topSymptom.slug) : "—"}
                subtext={kpis.topSymptom ? `${kpis.topSymptom.count}× in 30 days` : "No symptoms logged"}
              />
              <KpiCard
                label="Avg mood"
                value={kpis.moodCur10 != null ? `${kpis.moodCur10.toFixed(1)}/10` : "—"}
                subtext="last 30 days"
                delta={kpis.moodDelta10}
              />
              <KpiCard
                label="Avg energy"
                value={kpis.energyCur10 != null ? `${kpis.energyCur10.toFixed(1)}/10` : "—"}
                subtext="last 30 days"
                delta={kpis.energyDelta10}
              />
            </div>

            {/* 14-day heatmap header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", }}>Last 14 days</h2>
              <span style={{ fontSize: 11, color: "var(--mauve)", }}>{dateRangeLabel(14)}</span>
            </div>
            <SymptomHeatmap checkins={checkins} />

            {/* Phase overlay chart (only if cycle data) */}
            <PhaseOverlayChart checkins={checkins} profile={profile} />

            {/* Trend cards */}
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginTop: 4 }}>Trends · 7d vs previous 7d</h2>
            <TrendCards checkins={checkins} />

            {/* Correlations */}
            <CorrelationsCard checkins={checkins} />

            {/* Connectivity — reflect privately, find belonging (count-free, never your
                numbers), or ask Jess. Analytics → Community is a belonging nudge ONLY. */}
            <ContentActionBar
              label="What now"
              reflect={{ seed: "A pattern I noticed in myself this week — ", type: "reflection" }}
              belong="Others in your season"
              jess="my health patterns this week"
            />
          </div>
        )}
      </div>

      {selectedDate && (
        <DayDetailModal date={selectedDate} checkin={selectedCheckin} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}