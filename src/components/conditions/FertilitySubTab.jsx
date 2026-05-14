import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

const LH_OPTIONS = [
  { value: "not_tested", label: "Not tested" },
  { value: "negative",   label: "Negative" },
  { value: "low",        label: "Low" },
  { value: "high",       label: "High" },
  { value: "peak",       label: "Peak" },
];

const CM_OPTIONS = [
  { value: "dry",       label: "Dry" },
  { value: "sticky",    label: "Sticky" },
  { value: "creamy",    label: "Creamy" },
  { value: "watery",    label: "Watery" },
  { value: "egg_white", label: "Egg white" },
];

const PT_OPTIONS = [
  { value: "not_taken", label: "Not taken" },
  { value: "negative",  label: "Negative" },
  { value: "positive",  label: "Positive" },
];

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: 20,
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

function cycleDay(date, lastPeriod, cycleLen) {
  if (!lastPeriod) return null;
  const diff = differenceInDays(parseISO(date), parseISO(lastPeriod));
  return (diff % cycleLen) + 1;
}

export default function FertilitySubTab({ user, profile, selectedDate, units }) {
  const [log, setLog] = useState(null);
  const [bbtCelsius, setBbtCelsius] = useState("");
  const [bbtTime, setBbtTime] = useState("");
  const [lhResult, setLhResult] = useState("not_tested");
  const [cervicalMucus, setCervicalMucus] = useState("");
  const [intercourse, setIntercourse] = useState(false);
  const [pregnancyTest, setPregnancyTest] = useState("not_taken");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const useF = units === "imperial";
  const cDay = profile?.last_period_start_date
    ? cycleDay(selectedDate, profile.last_period_start_date, profile.cycle_avg_length || 28)
    : null;
  const showPregnancyTest = cDay && cDay >= 25;

  useEffect(() => {
    base44.entities.FertileWindowLog.filter({ user_id: user.id, date: selectedDate })
      .then(logs => {
        const l = logs[0];
        if (l) {
          setLog(l);
          setBbtCelsius(useF ? celsiusToF(l.bbt_celsius) : (l.bbt_celsius || ""));
          setBbtTime(l.bbt_time || "");
          setLhResult(l.lh_result || "not_tested");
          setCervicalMucus(l.cervical_mucus || "");
          setIntercourse(l.intercourse || false);
          setPregnancyTest(l.pregnancy_test || "not_taken");
        }
      }).catch(() => {});
  }, [user, selectedDate]);

  const celsiusToF = (c) => c ? Math.round((c * 9 / 5 + 32) * 10) / 10 : "";
  const fToCelsius = (f) => f ? Math.round((f - 32) * 5 / 9 * 100) / 100 : null;

  const save = async () => {
    setSaving(true);
    const bbtC = useF ? fToCelsius(parseFloat(bbtCelsius)) : (bbtCelsius ? parseFloat(bbtCelsius) : null);
    const data = {
      user_id: user.id,
      date: selectedDate,
      bbt_celsius: bbtC || undefined,
      bbt_time: bbtTime || undefined,
      lh_result: lhResult,
      cervical_mucus: cervicalMucus || undefined,
      intercourse,
      pregnancy_test: pregnancyTest,
    };
    if (log) {
      await base44.entities.FertileWindowLog.update(log.id, data);
    } else {
      const created = await base44.entities.FertileWindowLog.create(data);
      setLog(created);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pt-4 space-y-4">
      {cDay && (
        <div style={{ ...card, backgroundColor: "var(--rose-dust-subtle)", borderColor: "var(--rose-dust-light)" }}>
          <p style={sLabel}>Cycle day</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif", marginTop: 4 }}>Day {cDay}</p>
          {showPregnancyTest && (
            <p style={{ fontSize: 12, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Pregnancy test window — day 25+</p>
          )}
        </div>
      )}

      <div style={card}>
        <p style={{ ...sLabel, marginBottom: 14 }}>Daily fertility log</p>

        {/* BBT */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>
            Basal body temperature ({useF ? "°F" : "°C"})
          </p>
          <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
            Record before getting up
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number" step="0.1"
              placeholder={useF ? "e.g. 98.2" : "e.g. 36.6"}
              value={bbtCelsius}
              onChange={e => setBbtCelsius(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none" }}
            />
            <input
              type="time"
              value={bbtTime}
              onChange={e => setBbtTime(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none" }}
            />
          </div>
        </div>

        {/* LH test */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>LH test result</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {LH_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setLhResult(o.value)}
                style={{ borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "1.5px solid",
                  backgroundColor: lhResult === o.value ? "var(--plum)" : "transparent",
                  borderColor: lhResult === o.value ? "var(--plum)" : "var(--border)",
                  color: lhResult === o.value ? "white" : "var(--mauve)" }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cervical mucus */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Cervical mucus</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {CM_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setCervicalMucus(cervicalMucus === o.value ? "" : o.value)}
                style={{ borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "1.5px solid",
                  backgroundColor: cervicalMucus === o.value ? "var(--plum)" : "transparent",
                  borderColor: cervicalMucus === o.value ? "var(--plum)" : "var(--border)",
                  color: cervicalMucus === o.value ? "white" : "var(--mauve)" }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intimacy */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div onClick={() => setIntercourse(!intercourse)}
              style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${intercourse ? "var(--rose-dust)" : "var(--border)"}`, backgroundColor: intercourse ? "var(--rose-dust)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
              {intercourse && <Check style={{ width: 11, height: 11, color: "white" }} />}
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Intimacy today</p>
          </label>
        </div>

        {/* Pregnancy test */}
        {showPregnancyTest && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Pregnancy test</p>
            <div style={{ display: "flex", gap: 5 }}>
              {PT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setPregnancyTest(o.value)}
                  style={{ flex: 1, borderRadius: 9999, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "1.5px solid",
                    backgroundColor: pregnancyTest === o.value ? (o.value === "positive" ? "var(--sage)" : "var(--plum)") : "transparent",
                    borderColor: pregnancyTest === o.value ? (o.value === "positive" ? "var(--sage)" : "var(--plum)") : "var(--border)",
                    color: pregnancyTest === o.value ? "white" : "var(--mauve)" }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={save} disabled={saving}
          style={{ width: "100%", padding: 11, borderRadius: 12, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: saved ? "var(--sage)" : "var(--plum)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saving ? "Saving..." : saved ? "Saved" : "Save log"}
        </button>
      </div>
    </div>
  );
}