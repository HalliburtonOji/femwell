import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { pickProfile } from "@/utils/userProfile";
import { ArrowLeft } from "lucide-react";
import TeenSafetyNudge from "@/components/compliance/TeenSafetyNudge";

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};

export default function CycleSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriod, setLastPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
        // pickProfile, not [0] — this page both READS and WRITES her cycle anchor. Editing
        // whichever row happened to be newest is what split her data across rows; saving here
        // must land on the same profile every other surface reads.
        const p = pickProfile(profiles);
        if (p) {
          setProfile(p);
          setCycleLength(p.cycle_avg_length || 28);
          setPeriodLength(p.period_length || 5);
          setLastPeriod(p.last_period_start_date || "");
        }
      } catch (err) {
        console.error("CycleSettings init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, {
      cycle_avg_length: cycleLength,
      period_length: periodLength,
      last_period_start_date: lastPeriod || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-md mx-auto px-4">

        <div className="pt-12 pb-6 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            style={{
              width: "36px", height: "36px", borderRadius: "9999px",
              border: "1px solid var(--border)", backgroundColor: "var(--surface)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--plum)" }} />
          </button>
          <h1 className="fw-display">
            Cycle Settings
          </h1>
        </div>

        {/* Sprint C C3 — teen safety nudge for cycle surface (exact period
            dates fall under "particularly sensitive data" for under-18s). */}
        <TeenSafetyNudge profile={profile} surface="cycle" />

        <div style={{ ...card, padding: "24px" }} className="space-y-6">

          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "4px" }}>
              Average cycle length
            </p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--rose-dust)", lineHeight: 1, marginBottom: "12px" }}>
              {cycleLength} days
            </p>
            <input type="range" min="21" max="40" value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--rose-dust)" }} />
            <div className="flex justify-between" style={{ marginTop: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--mauve)", }}>21</span>
              <span style={{ fontSize: "11px", color: "var(--mauve)", }}>40</span>
            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--border-subtle)" }} />

          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "4px" }}>
              Period duration
            </p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--rose-dust)", lineHeight: 1, marginBottom: "12px" }}>
              {periodLength} days
            </p>
            <input type="range" min="2" max="10" value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--rose-dust)" }} />
            <div className="flex justify-between" style={{ marginTop: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--mauve)", }}>2</span>
              <span style={{ fontSize: "11px", color: "var(--mauve)", }}>10</span>
            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--border-subtle)" }} />

          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "8px" }}>
              Last period start date
            </p>
            <input type="date" value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "14px",
                border: "1.5px solid var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--plum)", fontSize: "14px",
                outline: "none"
              }} />
          </div>

          <button onClick={handleSave} disabled={saving || saved} className="btn-primary w-full">
            {saved ? "Saved" : saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}