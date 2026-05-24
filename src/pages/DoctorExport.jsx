import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Copy, Check, Loader2 } from "lucide-react";
import JessPatientSummary from "../components/jess/JessPatientSummary";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";

function avg(arr) {
  const valid = arr.filter(v => v != null && !isNaN(v));
  if (!valid.length) return null;
  return Math.round((valid.reduce((s, v) => s + v, 0) / valid.length) * 10) / 10;
}

function monthLabel(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function DoctorExport() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);
  const [medReminders, setMedReminders] = useState([]);
  const [journals, setJournals] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const exportDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, allCheckins, allSymptoms, meds, medRems, journalEntries, corrs] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: u.id }).catch(() => []),
          base44.entities.MedicationLogs.filter({ user_id: u.id }).catch(() => []),
          base44.entities.MedicationReminders.filter({ user_id: u.id }).catch(() => []),
          base44.entities.JournalEntries.filter({ user_id: u.id }).catch(() => []),
          base44.entities.Correlations.filter({ user_id: u.id }).catch(() => []),
        ]);
        setProfile(profiles[0] || null);
        setCheckins(allCheckins.filter(c => c.date >= cutoffStr).sort((a, b) => a.date.localeCompare(b.date)));
        setSymptoms(allSymptoms.filter(s => (s.date || '') >= cutoffStr));
        setMedications(meds.filter(m => (m.date || '') >= cutoffStr));
        setMedReminders(medRems);
        setJournals(journalEntries.filter(j => (j.session_date || j.created_at || '') >= cutoffStr).slice(-5));
        setCorrelations(corrs);
      } catch (err) {
        console.error("DoctorExport page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Symptom frequency from checkins
  const symptomFreq = (() => {
    const fields = ['pain', 'headache', 'cramps', 'bloating', 'breast_tenderness'];
    return fields.map(f => ({
      name: f.replace(/_/g, ' '),
      avg: avg(checkins.map(c => c[f]).filter(v => v != null)),
      count: checkins.filter(c => (c[f] || 0) >= 3).length,
    })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
  })();

  // Monthly averages
  const monthlyData = (() => {
    const months = {};
    for (const c of checkins) {
      const m = c.date?.slice(0, 7);
      if (!m) continue;
      if (!months[m]) months[m] = { mood: [], energy: [], sleep: [], stress: [] };
      if (c.mood) months[m].mood.push(c.mood);
      if (c.energy) months[m].energy.push(c.energy);
      if (c.sleep_hours) months[m].sleep.push(c.sleep_hours);
      if (c.stress) months[m].stress.push(c.stress);
    }
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => ({
      month,
      mood: avg(data.mood),
      energy: avg(data.energy),
      sleep: avg(data.sleep),
      stress: avg(data.stress),
    }));
  })();

  // Exercise stats
  const exerciseDays = checkins.filter(c => c.exercise_done || (c.exercise_minutes || 0) > 0);
  const exerciseTypeCounts = exerciseDays.reduce((acc, c) => {
    if (c.exercise_type) acc[c.exercise_type] = (acc[c.exercise_type] || 0) + 1;
    return acc;
  }, {});
  const topExerciseTypes = Object.entries(exerciseTypeCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => type);
  const weeksInPeriod = 90 / 7;
  const exerciseDaysPerWeek = (exerciseDays.length / weeksInPeriod).toFixed(1);

  // Medication list
  const uniqueMeds = [...new Set(medications.map(m => m.item_name || m.medication_name).filter(Boolean))];

  const buildPlainText = () => {
    const lines = [
      `FEMWELL HEALTH SUMMARY`,
      `Exported: ${exportDate}`,
      `Period: Last 90 days`,
      ``,
      `═══════════════════════════════════`,
      `SECTION 1: OVERVIEW`,
      `═══════════════════════════════════`,
      `User: ${user?.email || 'Unknown'}`,
      `Cycle length: ${profile?.cycle_avg_length || 'Not set'} days`,
      `Period length: ${profile?.period_length || 'Not set'} days`,
      `Last period: ${profile?.last_period_start_date || 'Not set'}`,
      `Life stage: ${profile?.life_stage || 'Standard'}`,
      `Conditions: ${(profile?.condition_flags || []).join(', ') || 'None listed'}`,
      ``,
      `═══════════════════════════════════`,
      `SECTION 2: SYMPTOMS (90 DAYS)`,
      `═══════════════════════════════════`,
      ...symptomFreq.map(s => `${s.name}: ${s.count} days at severity 3+ (avg ${s.avg}/5)`),
      symptomFreq.length === 0 ? 'No significant symptoms logged.' : '',
      ``,
      `Patterns identified:`,
      ...correlations.slice(0, 3).map(c => `• ${c.explanation_text || `${c.metric_a} correlated with ${c.metric_b}`}`),
      ``,
      `═══════════════════════════════════`,
      `SECTION 3: MOOD & ENERGY`,
      `═══════════════════════════════════`,
      ...monthlyData.map(m => `${monthLabel(m.month + '-01')}: Mood ${m.mood ?? '–'}/5 | Energy ${m.energy ?? '–'}/5 | Sleep ${m.sleep ?? '–'}h | Stress ${m.stress ?? '–'}/5`),
      ``,
      `═══════════════════════════════════`,
      `SECTION 4: MEDICATIONS`,
      `═══════════════════════════════════`,
      `Logged medications: ${uniqueMeds.join(', ') || 'None'}`,
      `Active reminders: ${medReminders.map(m => m.medication_name || m.name).filter(Boolean).join(', ') || 'None'}`,
      ``,
      `═══════════════════════════════════`,
      `SECTION 5: EXERCISE`,
      `═══════════════════════════════════`,
      `Average: ~${exerciseDaysPerWeek} exercise days/week`,
      `Common types: ${topExerciseTypes.join(', ') || 'Not specified'}`,
      ``,
      `═══════════════════════════════════`,
      `SECTION 6: JOURNAL EXCERPTS`,
      `═══════════════════════════════════`,
      ...journals.map((j, i) => `[${i + 1}] ${(j.text || '').slice(0, 120)}${(j.text || '').length > 120 ? '…' : ''}`),
      journals.length === 0 ? 'No journal entries in this period.' : '',
      ``,
      `─────────────────────────────────`,
      `Generated by FemWell. This summary is for personal reference only and does not constitute medical advice.`,
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "20px", marginBottom: 16, boxShadow: "var(--shadow-sm)" };
  const sLabel = { fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 12 };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-10 pb-4">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--plum)" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>Health Summary</h1>
            <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Share with your doctor · {exportDate}</p>
          </div>
        </div>

        {/* Copy button */}
        <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl mb-5 transition-all"
          style={{ backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", border: "none", cursor: "pointer" }}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied to clipboard!" : "Copy as text"}
        </button>

        {/* Jess clinical summary — Feature 4, Wing #2
            Sprint 3 S3-3 — quiet boundary so a crash in the summary
            doesn't take down the doctor export. */}
        {user && (
          <JessErrorBoundary variant="quiet" label="JessPatientSummary">
            <JessPatientSummary
              user={user}
              profile={profile}
              checkins={checkins}
              symptoms={symptoms}
            />
          </JessErrorBoundary>
        )}

        {/* Section 1 */}
        <div style={card}>
          <p style={sLabel}>Overview</p>
          <div className="space-y-2">
            {[
              { label: "Cycle length", value: profile?.cycle_avg_length ? `${profile.cycle_avg_length} days` : "Not set" },
              { label: "Period length", value: profile?.period_length ? `${profile.period_length} days` : "Not set" },
              { label: "Last period", value: profile?.last_period_start_date || "Not set" },
              { label: "Life stage", value: profile?.life_stage || "Standard" },
              { label: "Conditions", value: (profile?.condition_flags || []).join(', ') || "None listed" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{row.label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div style={card}>
          <p style={sLabel}>Symptoms (90 days)</p>
          {symptomFreq.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No significant symptoms logged.</p>
          ) : (
            symptomFreq.map(s => (
              <div key={s.name} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{s.name}</p>
                <div className="flex items-center gap-3">
                  <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{s.count} days (≥3)</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>avg {s.avg}/5</p>
                </div>
              </div>
            ))
          )}
          {correlations.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Patterns</p>
              {correlations.slice(0, 3).map((c, i) => (
                <p key={i} style={{ fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 4 }}>• {c.explanation_text || `${c.metric_a} correlated with ${c.metric_b}`}</p>
              ))}
            </div>
          )}
        </div>

        {/* Section 3 */}
        <div style={card}>
          <p style={sLabel}>Mood & Energy by Month</p>
          {monthlyData.map(m => (
            <div key={m.month} className="py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>{monthLabel(m.month + '-01')}</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Mood", value: m.mood, max: 5 },
                  { label: "Energy", value: m.energy, max: 5 },
                  { label: "Sleep", value: m.sleep, unit: "h" },
                  { label: "Stress", value: m.stress, max: 5 },
                ].map(metric => (
                  <div key={metric.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>
                      {metric.value != null ? `${metric.value}${metric.unit || (metric.max ? `/${metric.max}` : '')}` : "—"}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Section 4 */}
        <div style={card}>
          <p style={sLabel}>Medications</p>
          {uniqueMeds.length > 0 ? (
            uniqueMeds.map(m => <p key={m} style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>• {m}</p>)
          ) : <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>None logged in this period.</p>}
          {medReminders.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Active reminders</p>
              {medReminders.map(m => <p key={m.id} style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>• {m.medication_name || m.name} {m.reminder_time ? `— ${m.reminder_time}` : ''}</p>)}
            </div>
          )}
        </div>

        {/* Section 5 */}
        <div style={card}>
          <p style={sLabel}>Exercise (90 days)</p>
          <div className="flex gap-6">
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>{exerciseDaysPerWeek}</p>
              <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>days/week avg</p>
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>{exerciseDays.length}</p>
              <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>total days</p>
            </div>
          </div>
          {topExerciseTypes.length > 0 && (
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 12 }}>Types: {topExerciseTypes.join(', ')}</p>
          )}
        </div>

        {/* Section 6 */}
        {journals.length > 0 && (
          <div style={card}>
            <p style={sLabel}>Recent Journal Excerpts</p>
            {journals.map((j, i) => (
              <div key={j.id} className="py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{j.session_date || ""}</p>
                <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                  {(j.text || "").slice(0, 120)}{(j.text || "").length > 120 ? "…" : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textAlign: "center", marginBottom: 32, lineHeight: 1.6 }}>
          Generated by FemWell. For personal reference only. Not medical advice.
        </p>
      </div>
    </div>
  );
}