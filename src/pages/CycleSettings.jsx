import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";

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
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles[0]) {
        const p = profiles[0];
        setProfile(p);
        setCycleLength(p.cycle_avg_length || 28);
        setPeriodLength(p.period_length || 5);
        setLastPeriod(p.last_period_start_date || "");
      }
      setLoading(false);
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
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-6 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-rose-900">Cycle Settings</h1>
        </div>

        <div className="card-glass rounded-2xl p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Average cycle length: <span className="text-rose-600 font-bold">{cycleLength} days</span>
            </label>
            <input
              type="range" min="21" max="40" value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>21 days</span><span>40 days</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Period duration: <span className="text-rose-600 font-bold">{periodLength} days</span>
            </label>
            <input
              type="range" min="2" max="10" value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>2 days</span><span>10 days</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Last period start date</label>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full p-3 rounded-xl border border-rose-200 bg-white/80 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <button onClick={handleSave} disabled={saving || saved} className="btn-primary w-full">
            {saved ? "Saved ✓" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}