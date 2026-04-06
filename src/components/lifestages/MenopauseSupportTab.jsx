import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "./SupportMetricSlider";
import SupportInsightCard from "./SupportInsightCard";

const FOCUSES = ["Sleep", "Hot flashes", "Mood", "Energy", "Brain fog", "Joint comfort"];
const todayStr = new Date().toISOString().split("T")[0];

const inputStyle = { width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", resize: "none", boxSizing: "border-box" };

export default function MenopauseSupportTab({ user, profile, setProfile, logs, setLogs }) {
  const [profileForm, setProfileForm] = useState({ stage: "perimenopause", care_focus: [], cycle_changes: "", current_supports: "", notes: "" });
  const [logForm, setLogForm] = useState({ date: todayStr, hot_flashes: 1, night_sweats: 1, sleep_quality: 3, mood: 3, energy: 3, brain_fog: 1, joint_pain: 1, notes: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    if (profile) setProfileForm({ stage: profile.stage || "perimenopause", care_focus: profile.care_focus || [], cycle_changes: profile.cycle_changes || "", current_supports: profile.current_supports || "", notes: profile.notes || "" });
  }, [profile]);

  useEffect(() => {
    const todayLog = logs.find((item) => item.date === todayStr);
    if (todayLog) setLogForm({ date: todayStr, hot_flashes: todayLog.hot_flashes || 1, night_sweats: todayLog.night_sweats || 1, sleep_quality: todayLog.sleep_quality || 3, mood: todayLog.mood || 3, energy: todayLog.energy || 3, brain_fog: todayLog.brain_fog || 1, joint_pain: todayLog.joint_pain || 1, notes: todayLog.notes || "" });
  }, [logs]);

  const toggleFocus = (value) => setProfileForm((c) => ({ ...c, care_focus: c.care_focus.includes(value) ? c.care_focus.filter((i) => i !== value) : [...c.care_focus, value] }));

  const saveProfile = async () => {
    setSavingProfile(true);
    const payload = { user_id: user.id, stage: profileForm.stage, care_focus: profileForm.care_focus, cycle_changes: profileForm.cycle_changes || undefined, current_supports: profileForm.current_supports || undefined, notes: profileForm.notes || undefined };
    const saved = profile ? await base44.entities.MenopauseProfile.update(profile.id, payload) : await base44.entities.MenopauseProfile.create(payload);
    setProfile(saved);
    setSavingProfile(false);
  };

  const saveTodayLog = async () => {
    setSavingLog(true);
    const todayLog = logs.find((item) => item.date === todayStr);
    const payload = { user_id: user.id, ...logForm };
    const saved = todayLog ? await base44.entities.MenopauseDailyLog.update(todayLog.id, payload) : await base44.entities.MenopauseDailyLog.create(payload);
    setLogs([saved, ...logs.filter((item) => item.id !== saved.id)].sort((a, b) => b.date.localeCompare(a.date)));
    setSavingLog(false);
  };

  const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Stage", value: profile?.stage?.replace(/_/g, " ") || "Perimenopause" },
          { label: "Focus areas", value: `${profile?.care_focus?.length || 0} active` },
          { label: "Recent logs", value: `${logs.length} check-ins` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={card}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rose-dust)" }}>{s.label}</p>
            <p className="mt-2 text-lg font-bold capitalize" style={{ color: "var(--plum)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl p-4 space-y-4" style={card}>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--plum)" }}>Menopause setup</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Set your stage and current priorities.</p>
          </div>
          <select value={profileForm.stage} onChange={(e) => setProfileForm((c) => ({ ...c, stage: e.target.value }))} style={{ ...inputStyle, resize: undefined }}>
            <option value="perimenopause">Perimenopause</option>
            <option value="menopause">Menopause</option>
            <option value="postmenopause">Postmenopause</option>
          </select>
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--mauve)" }}>Current care focus</p>
            <div className="flex flex-wrap gap-2">
              {FOCUSES.map((focus) => (
                <button key={focus} onClick={() => toggleFocus(focus)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{ backgroundColor: profileForm.care_focus.includes(focus) ? "var(--rose-dust)" : "var(--ivory)", color: profileForm.care_focus.includes(focus) ? "white" : "var(--mauve)", border: `1px solid ${profileForm.care_focus.includes(focus) ? "var(--rose-dust)" : "var(--border)"}`, cursor: "pointer" }}>
                  {focus}
                </button>
              ))}
            </div>
          </div>
          <textarea rows={2} placeholder="Cycle changes or patterns" value={profileForm.cycle_changes} onChange={(e) => setProfileForm((c) => ({ ...c, cycle_changes: e.target.value }))} style={inputStyle} />
          <textarea rows={2} placeholder="What support are you using right now?" value={profileForm.current_supports} onChange={(e) => setProfileForm((c) => ({ ...c, current_supports: e.target.value }))} style={inputStyle} />
          <textarea rows={3} placeholder="Anything important to remember" value={profileForm.notes} onChange={(e) => setProfileForm((c) => ({ ...c, notes: e.target.value }))} style={{ ...inputStyle, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveProfile} className="btn-primary w-full py-3 text-sm">{savingProfile ? "Saving..." : "Save menopause setup"}</button>
        </div>

        <div className="rounded-2xl p-4 space-y-4" style={card}>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--plum)" }}>Today's symptom check-in</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Track your day so patterns become easier to spot.</p>
          </div>
          <SupportMetricSlider label="Hot flashes" value={logForm.hot_flashes} onChange={(v) => setLogForm((c) => ({ ...c, hot_flashes: v }))} />
          <SupportMetricSlider label="Night sweats" value={logForm.night_sweats} onChange={(v) => setLogForm((c) => ({ ...c, night_sweats: v }))} />
          <SupportMetricSlider label="Sleep quality" value={logForm.sleep_quality} onChange={(v) => setLogForm((c) => ({ ...c, sleep_quality: v }))} />
          <SupportMetricSlider label="Mood" value={logForm.mood} onChange={(v) => setLogForm((c) => ({ ...c, mood: v }))} />
          <SupportMetricSlider label="Energy" value={logForm.energy} onChange={(v) => setLogForm((c) => ({ ...c, energy: v }))} />
          <SupportMetricSlider label="Brain fog" value={logForm.brain_fog} onChange={(v) => setLogForm((c) => ({ ...c, brain_fog: v }))} />
          <SupportMetricSlider label="Joint pain" value={logForm.joint_pain} onChange={(v) => setLogForm((c) => ({ ...c, joint_pain: v }))} />
          <textarea rows={3} placeholder="Notes from today" value={logForm.notes} onChange={(e) => setLogForm((c) => ({ ...c, notes: e.target.value }))} style={{ ...inputStyle, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveTodayLog} className="btn-primary w-full py-3 text-sm">{savingLog ? "Saving..." : "Save today's log"}</button>
        </div>
      </div>

      <SupportInsightCard mode="menopause" profile={profile} logs={logs} />

      <div className="rounded-2xl p-4" style={card}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: "var(--plum)" }}>Recent menopause logs</p>
          <p className="text-xs" style={{ color: "var(--mauve)" }}>Last {Math.min(logs.length, 4)} entries</p>
        </div>
        <div className="space-y-2">
          {logs.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl px-3 py-2.5 flex items-start justify-between gap-3"
              style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--plum)" }}>{format(parseISO(item.date), "MMM d")}</p>
                <p className="text-xs" style={{ color: "var(--mauve)" }}>Sleep {item.sleep_quality}/5 · Mood {item.mood}/5 · Energy {item.energy}/5</p>
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--rose-dust)" }}>Hot flashes {item.hot_flashes}/5</p>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-center py-4" style={{ color: "var(--mauve)" }}>No menopause logs yet — save your first one above.</p>}
        </div>
      </div>
    </div>
  );
}