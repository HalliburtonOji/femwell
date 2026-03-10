import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "./SupportMetricSlider";
import SupportInsightCard from "./SupportInsightCard";

const FOCUSES = ["Sleep", "Hot flashes", "Mood", "Energy", "Brain fog", "Joint comfort"];
const todayStr = new Date().toISOString().split("T")[0];

export default function MenopauseSupportTab({ user, profile, setProfile, logs, setLogs }) {
  const [profileForm, setProfileForm] = useState({ stage: "perimenopause", care_focus: [], cycle_changes: "", current_supports: "", notes: "" });
  const [logForm, setLogForm] = useState({ date: todayStr, hot_flashes: 1, night_sweats: 1, sleep_quality: 3, mood: 3, energy: 3, brain_fog: 1, joint_pain: 1, notes: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        stage: profile.stage || "perimenopause",
        care_focus: profile.care_focus || [],
        cycle_changes: profile.cycle_changes || "",
        current_supports: profile.current_supports || "",
        notes: profile.notes || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    const todayLog = logs.find((item) => item.date === todayStr);
    if (todayLog) {
      setLogForm({
        date: todayStr,
        hot_flashes: todayLog.hot_flashes || 1,
        night_sweats: todayLog.night_sweats || 1,
        sleep_quality: todayLog.sleep_quality || 3,
        mood: todayLog.mood || 3,
        energy: todayLog.energy || 3,
        brain_fog: todayLog.brain_fog || 1,
        joint_pain: todayLog.joint_pain || 1,
        notes: todayLog.notes || "",
      });
    }
  }, [logs]);

  const toggleFocus = (value) => {
    setProfileForm((current) => ({
      ...current,
      care_focus: current.care_focus.includes(value)
        ? current.care_focus.filter((item) => item !== value)
        : [...current.care_focus, value],
    }));
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    const payload = {
      user_id: user.id,
      stage: profileForm.stage,
      care_focus: profileForm.care_focus,
      cycle_changes: profileForm.cycle_changes || undefined,
      current_supports: profileForm.current_supports || undefined,
      notes: profileForm.notes || undefined,
    };

    const saved = profile
      ? await base44.entities.MenopauseProfile.update(profile.id, payload)
      : await base44.entities.MenopauseProfile.create(payload);

    setProfile(saved);
    setSavingProfile(false);
  };

  const saveTodayLog = async () => {
    setSavingLog(true);
    const todayLog = logs.find((item) => item.date === todayStr);
    const payload = { user_id: user.id, ...logForm };
    const saved = todayLog
      ? await base44.entities.MenopauseDailyLog.update(todayLog.id, payload)
      : await base44.entities.MenopauseDailyLog.create(payload);

    const nextLogs = [saved, ...logs.filter((item) => item.id !== saved.id)].sort((a, b) => b.date.localeCompare(a.date));
    setLogs(nextLogs);
    setSavingLog(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Stage</p>
          <p className="mt-2 text-lg font-bold text-gray-800 capitalize">{profile?.stage?.replace(/_/g, " ") || "Perimenopause"}</p>
        </div>
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Focus areas</p>
          <p className="mt-2 text-lg font-bold text-gray-800">{profile?.care_focus?.length || 0} active</p>
        </div>
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Recent logs</p>
          <p className="mt-2 text-lg font-bold text-gray-800">{logs.length} check-ins</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-glass rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Menopause setup</p>
            <p className="text-xs text-gray-400">Set your stage and current priorities.</p>
          </div>

          <select value={profileForm.stage} onChange={(e) => setProfileForm((current) => ({ ...current, stage: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
            <option value="perimenopause">Perimenopause</option>
            <option value="menopause">Menopause</option>
            <option value="postmenopause">Postmenopause</option>
          </select>

          <div>
            <p className="text-xs text-gray-500 mb-2">Current care focus</p>
            <div className="flex flex-wrap gap-2">
              {FOCUSES.map((focus) => (
                <button
                  key={focus}
                  onClick={() => toggleFocus(focus)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${profileForm.care_focus.includes(focus) ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600 border border-rose-100"}`}
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>

          <textarea rows={2} placeholder="Cycle changes or patterns" value={profileForm.cycle_changes} onChange={(e) => setProfileForm((current) => ({ ...current, cycle_changes: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
          <textarea rows={2} placeholder="What support are you using right now?" value={profileForm.current_supports} onChange={(e) => setProfileForm((current) => ({ ...current, current_supports: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
          <textarea rows={3} placeholder="Anything important to remember" value={profileForm.notes} onChange={(e) => setProfileForm((current) => ({ ...current, notes: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />

          <button onClick={saveProfile} className="btn-primary w-full py-3 text-sm">{savingProfile ? "Saving…" : "Save menopause setup"}</button>
        </div>

        <div className="card-glass rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Today’s symptom check-in</p>
            <p className="text-xs text-gray-400">Track your day so patterns become easier to spot.</p>
          </div>

          <SupportMetricSlider emoji="🔥" label="Hot flashes" value={logForm.hot_flashes} onChange={(value) => setLogForm((current) => ({ ...current, hot_flashes: value }))} />
          <SupportMetricSlider emoji="🌙" label="Night sweats" value={logForm.night_sweats} onChange={(value) => setLogForm((current) => ({ ...current, night_sweats: value }))} />
          <SupportMetricSlider emoji="💤" label="Sleep quality" value={logForm.sleep_quality} onChange={(value) => setLogForm((current) => ({ ...current, sleep_quality: value }))} />
          <SupportMetricSlider emoji="😊" label="Mood" value={logForm.mood} onChange={(value) => setLogForm((current) => ({ ...current, mood: value }))} />
          <SupportMetricSlider emoji="⚡" label="Energy" value={logForm.energy} onChange={(value) => setLogForm((current) => ({ ...current, energy: value }))} />
          <SupportMetricSlider emoji="🧠" label="Brain fog" value={logForm.brain_fog} onChange={(value) => setLogForm((current) => ({ ...current, brain_fog: value }))} />
          <SupportMetricSlider emoji="🦴" label="Joint pain" value={logForm.joint_pain} onChange={(value) => setLogForm((current) => ({ ...current, joint_pain: value }))} />

          <textarea rows={3} placeholder="Notes from today" value={logForm.notes} onChange={(e) => setLogForm((current) => ({ ...current, notes: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />

          <button onClick={saveTodayLog} className="btn-primary w-full py-3 text-sm">{savingLog ? "Saving…" : "Save today’s log"}</button>
        </div>
      </div>

      <SupportInsightCard mode="menopause" profile={profile} logs={logs} />

      <div className="card-glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Recent menopause logs</p>
          <p className="text-xs text-gray-400">Last {Math.min(logs.length, 4)} entries</p>
        </div>
        <div className="space-y-2">
          {logs.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl bg-white/70 border border-rose-100 px-3 py-2.5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-700">{format(parseISO(item.date), "MMM d")}</p>
                <p className="text-xs text-gray-400">Sleep {item.sleep_quality}/5 · Mood {item.mood}/5 · Energy {item.energy}/5</p>
              </div>
              <p className="text-xs text-rose-500 font-medium">Hot flashes {item.hot_flashes}/5</p>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No menopause logs yet — save your first one above.</p>}
        </div>
      </div>
    </div>
  );
}