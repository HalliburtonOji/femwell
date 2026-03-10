import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "./SupportMetricSlider";
import SupportInsightCard from "./SupportInsightCard";

const FOCUSES = ["Sleep", "Nausea", "Movement", "Nutrition", "Birth prep", "Calm"];
const todayStr = new Date().toISOString().split("T")[0];

export default function PregnancySupportTab({ user, profile, setProfile, logs, setLogs }) {
  const [profileForm, setProfileForm] = useState({ due_date: "", pregnancy_week: "", trimester: "first", care_focus: [], birth_preferences: "", notes: "" });
  const [logForm, setLogForm] = useState({ date: todayStr, energy: 3, mood: 3, sleep_quality: 3, nausea: 1, pelvic_pain: 1, swelling: 1, movement_notes: "", notes: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        due_date: profile.due_date || "",
        pregnancy_week: profile.pregnancy_week || "",
        trimester: profile.trimester || "first",
        care_focus: profile.care_focus || [],
        birth_preferences: profile.birth_preferences || "",
        notes: profile.notes || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    const todayLog = logs.find((item) => item.date === todayStr);
    if (todayLog) {
      setLogForm({
        date: todayStr,
        energy: todayLog.energy || 3,
        mood: todayLog.mood || 3,
        sleep_quality: todayLog.sleep_quality || 3,
        nausea: todayLog.nausea || 1,
        pelvic_pain: todayLog.pelvic_pain || 1,
        swelling: todayLog.swelling || 1,
        movement_notes: todayLog.movement_notes || "",
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
      due_date: profileForm.due_date || undefined,
      pregnancy_week: profileForm.pregnancy_week ? Number(profileForm.pregnancy_week) : undefined,
      trimester: profileForm.trimester,
      care_focus: profileForm.care_focus,
      birth_preferences: profileForm.birth_preferences || undefined,
      notes: profileForm.notes || undefined,
    };

    const saved = profile
      ? await base44.entities.PregnancyProfile.update(profile.id, payload)
      : await base44.entities.PregnancyProfile.create(payload);

    setProfile(saved);
    setSavingProfile(false);
  };

  const saveTodayLog = async () => {
    setSavingLog(true);
    const todayLog = logs.find((item) => item.date === todayStr);
    const payload = { user_id: user.id, ...logForm };
    const saved = todayLog
      ? await base44.entities.PregnancyDailyLog.update(todayLog.id, payload)
      : await base44.entities.PregnancyDailyLog.create(payload);

    const nextLogs = [saved, ...logs.filter((item) => item.id !== saved.id)].sort((a, b) => b.date.localeCompare(a.date));
    setLogs(nextLogs);
    setSavingLog(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Due date</p>
          <p className="mt-2 text-lg font-bold text-gray-800">{profile?.due_date ? format(parseISO(profile.due_date), "MMM d, yyyy") : "Set your date"}</p>
        </div>
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Pregnancy week</p>
          <p className="mt-2 text-lg font-bold text-gray-800">{profile?.pregnancy_week ? `Week ${profile.pregnancy_week}` : "Track weekly"}</p>
        </div>
        <div className="card-glass rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Trimester</p>
          <p className="mt-2 text-lg font-bold text-gray-800 capitalize">{profile?.trimester || "first"}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-glass rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Pregnancy setup</p>
            <p className="text-xs text-gray-400">Capture the basics once, then adjust anytime.</p>
          </div>

          <input type="date" value={profileForm.due_date} onChange={(e) => setProfileForm((current) => ({ ...current, due_date: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
          <input type="number" min="1" max="42" placeholder="Pregnancy week" value={profileForm.pregnancy_week} onChange={(e) => setProfileForm((current) => ({ ...current, pregnancy_week: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
          <select value={profileForm.trimester} onChange={(e) => setProfileForm((current) => ({ ...current, trimester: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
            <option value="first">First trimester</option>
            <option value="second">Second trimester</option>
            <option value="third">Third trimester</option>
            <option value="postpartum">Postpartum</option>
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

          <textarea rows={2} placeholder="Birth preferences or support notes" value={profileForm.birth_preferences} onChange={(e) => setProfileForm((current) => ({ ...current, birth_preferences: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
          <textarea rows={3} placeholder="Anything important to remember" value={profileForm.notes} onChange={(e) => setProfileForm((current) => ({ ...current, notes: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />

          <button onClick={saveProfile} className="btn-primary w-full py-3 text-sm">{savingProfile ? "Saving…" : "Save pregnancy setup"}</button>
        </div>

        <div className="card-glass rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Today’s support check-in</p>
            <p className="text-xs text-gray-400">Track how your body and energy feel today.</p>
          </div>

          <SupportMetricSlider emoji="⚡" label="Energy" value={logForm.energy} onChange={(value) => setLogForm((current) => ({ ...current, energy: value }))} />
          <SupportMetricSlider emoji="😊" label="Mood" value={logForm.mood} onChange={(value) => setLogForm((current) => ({ ...current, mood: value }))} />
          <SupportMetricSlider emoji="💤" label="Sleep quality" value={logForm.sleep_quality} onChange={(value) => setLogForm((current) => ({ ...current, sleep_quality: value }))} />
          <SupportMetricSlider emoji="🤢" label="Nausea" value={logForm.nausea} onChange={(value) => setLogForm((current) => ({ ...current, nausea: value }))} />
          <SupportMetricSlider emoji="🫶" label="Pelvic discomfort" value={logForm.pelvic_pain} onChange={(value) => setLogForm((current) => ({ ...current, pelvic_pain: value }))} />
          <SupportMetricSlider emoji="🦶" label="Swelling" value={logForm.swelling} onChange={(value) => setLogForm((current) => ({ ...current, swelling: value }))} />

          <textarea rows={2} placeholder="Movement, kicks, or body notes" value={logForm.movement_notes} onChange={(e) => setLogForm((current) => ({ ...current, movement_notes: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
          <textarea rows={3} placeholder="Anything else from today" value={logForm.notes} onChange={(e) => setLogForm((current) => ({ ...current, notes: e.target.value }))} className="w-full p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />

          <button onClick={saveTodayLog} className="btn-primary w-full py-3 text-sm">{savingLog ? "Saving…" : "Save today’s log"}</button>
        </div>
      </div>

      <SupportInsightCard mode="pregnancy" profile={profile} logs={logs} />

      <div className="card-glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Recent pregnancy logs</p>
          <p className="text-xs text-gray-400">Last {Math.min(logs.length, 4)} entries</p>
        </div>
        <div className="space-y-2">
          {logs.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl bg-white/70 border border-rose-100 px-3 py-2.5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-700">{format(parseISO(item.date), "MMM d")}</p>
                <p className="text-xs text-gray-400">Energy {item.energy}/5 · Mood {item.mood}/5 · Sleep {item.sleep_quality}/5</p>
              </div>
              <p className="text-xs text-rose-500 font-medium">Nausea {item.nausea}/5</p>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No pregnancy logs yet — save your first one above.</p>}
        </div>
      </div>
    </div>
  );
}