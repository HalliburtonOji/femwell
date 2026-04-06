import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "./SupportMetricSlider";
import SupportInsightCard from "./SupportInsightCard";

const FOCUSES = ["Sleep", "Nausea", "Movement", "Nutrition", "Birth prep", "Calm"];
const todayStr = new Date().toISOString().split("T")[0];

const inputStyle = { width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", resize: "none", boxSizing: "border-box" };

export default function PregnancySupportTab({ user, profile, setProfile, logs, setLogs }) {
  const [profileForm, setProfileForm] = useState({ due_date: "", pregnancy_week: "", trimester: "first", care_focus: [], birth_preferences: "", notes: "" });
  const [logForm, setLogForm] = useState({ date: todayStr, energy: 3, mood: 3, sleep_quality: 3, nausea: 1, pelvic_pain: 1, swelling: 1, movement_notes: "", notes: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    if (profile) setProfileForm({ due_date: profile.due_date || "", pregnancy_week: profile.pregnancy_week || "", trimester: profile.trimester || "first", care_focus: profile.care_focus || [], birth_preferences: profile.birth_preferences || "", notes: profile.notes || "" });
  }, [profile]);

  useEffect(() => {
    const todayLog = logs.find((item) => item.date === todayStr);
    if (todayLog) setLogForm({ date: todayStr, energy: todayLog.energy || 3, mood: todayLog.mood || 3, sleep_quality: todayLog.sleep_quality || 3, nausea: todayLog.nausea || 1, pelvic_pain: todayLog.pelvic_pain || 1, swelling: todayLog.swelling || 1, movement_notes: todayLog.movement_notes || "", notes: todayLog.notes || "" });
  }, [logs]);

  const toggleFocus = (value) => setProfileForm((c) => ({ ...c, care_focus: c.care_focus.includes(value) ? c.care_focus.filter((i) => i !== value) : [...c.care_focus, value] }));

  const saveProfile = async () => {
    setSavingProfile(true);
    const payload = { user_id: user.id, due_date: profileForm.due_date || undefined, pregnancy_week: profileForm.pregnancy_week ? Number(profileForm.pregnancy_week) : undefined, trimester: profileForm.trimester, care_focus: profileForm.care_focus, birth_preferences: profileForm.birth_preferences || undefined, notes: profileForm.notes || undefined };
    const saved = profile ? await base44.entities.PregnancyProfile.update(profile.id, payload) : await base44.entities.PregnancyProfile.create(payload);
    setProfile(saved);
    setSavingProfile(false);
  };

  const saveTodayLog = async () => {
    setSavingLog(true);
    const todayLog = logs.find((item) => item.date === todayStr);
    const payload = { user_id: user.id, ...logForm };
    const saved = todayLog ? await base44.entities.PregnancyDailyLog.update(todayLog.id, payload) : await base44.entities.PregnancyDailyLog.create(payload);
    setLogs([saved, ...logs.filter((item) => item.id !== saved.id)].sort((a, b) => b.date.localeCompare(a.date)));
    setSavingLog(false);
  };

  const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Due date", value: profile?.due_date ? format(parseISO(profile.due_date), "MMM d, yyyy") : "Set your date" },
          { label: "Pregnancy week", value: profile?.pregnancy_week ? `Week ${profile.pregnancy_week}` : "Track weekly" },
          { label: "Trimester", value: profile?.trimester || "first" },
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
            <p className="text-sm font-bold" style={{ color: "var(--plum)" }}>Pregnancy setup</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Capture the basics once, then adjust anytime.</p>
          </div>
          <input type="date" value={profileForm.due_date} onChange={(e) => setProfileForm((c) => ({ ...c, due_date: e.target.value }))} style={{ ...inputStyle, resize: undefined }} />
          <input type="number" min="1" max="42" placeholder="Pregnancy week" value={profileForm.pregnancy_week} onChange={(e) => setProfileForm((c) => ({ ...c, pregnancy_week: e.target.value }))} style={{ ...inputStyle, resize: undefined }} />
          <select value={profileForm.trimester} onChange={(e) => setProfileForm((c) => ({ ...c, trimester: e.target.value }))} style={{ ...inputStyle, resize: undefined }}>
            <option value="first">First trimester</option>
            <option value="second">Second trimester</option>
            <option value="third">Third trimester</option>
            <option value="postpartum">Postpartum</option>
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
          <textarea rows={2} placeholder="Birth preferences or support notes" value={profileForm.birth_preferences} onChange={(e) => setProfileForm((c) => ({ ...c, birth_preferences: e.target.value }))} style={inputStyle} />
          <textarea rows={3} placeholder="Anything important to remember" value={profileForm.notes} onChange={(e) => setProfileForm((c) => ({ ...c, notes: e.target.value }))} style={{ ...inputStyle, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveProfile} className="btn-primary w-full py-3 text-sm">{savingProfile ? "Saving..." : "Save pregnancy setup"}</button>
        </div>

        <div className="rounded-2xl p-4 space-y-4" style={card}>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--plum)" }}>Today's support check-in</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Track how your body and energy feel today.</p>
          </div>
          <SupportMetricSlider label="Energy" value={logForm.energy} onChange={(v) => setLogForm((c) => ({ ...c, energy: v }))} />
          <SupportMetricSlider label="Mood" value={logForm.mood} onChange={(v) => setLogForm((c) => ({ ...c, mood: v }))} />
          <SupportMetricSlider label="Sleep quality" value={logForm.sleep_quality} onChange={(v) => setLogForm((c) => ({ ...c, sleep_quality: v }))} />
          <SupportMetricSlider label="Nausea" value={logForm.nausea} onChange={(v) => setLogForm((c) => ({ ...c, nausea: v }))} />
          <SupportMetricSlider label="Pelvic discomfort" value={logForm.pelvic_pain} onChange={(v) => setLogForm((c) => ({ ...c, pelvic_pain: v }))} />
          <SupportMetricSlider label="Swelling" value={logForm.swelling} onChange={(v) => setLogForm((c) => ({ ...c, swelling: v }))} />
          <textarea rows={2} placeholder="Movement, kicks, or body notes" value={logForm.movement_notes} onChange={(e) => setLogForm((c) => ({ ...c, movement_notes: e.target.value }))} style={inputStyle} />
          <textarea rows={3} placeholder="Anything else from today" value={logForm.notes} onChange={(e) => setLogForm((c) => ({ ...c, notes: e.target.value }))} style={{ ...inputStyle, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveTodayLog} className="btn-primary w-full py-3 text-sm">{savingLog ? "Saving..." : "Save today's log"}</button>
        </div>
      </div>

      <SupportInsightCard mode="pregnancy" profile={profile} logs={logs} />

      <div className="rounded-2xl p-4" style={card}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: "var(--plum)" }}>Recent pregnancy logs</p>
          <p className="text-xs" style={{ color: "var(--mauve)" }}>Last {Math.min(logs.length, 4)} entries</p>
        </div>
        <div className="space-y-2">
          {logs.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl px-3 py-2.5 flex items-start justify-between gap-3"
              style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--plum)" }}>{format(parseISO(item.date), "MMM d")}</p>
                <p className="text-xs" style={{ color: "var(--mauve)" }}>Energy {item.energy}/5 · Mood {item.mood}/5 · Sleep {item.sleep_quality}/5</p>
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--rose-dust)" }}>Nausea {item.nausea}/5</p>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-center py-4" style={{ color: "var(--mauve)" }}>No pregnancy logs yet — save your first one above.</p>}
        </div>
      </div>
    </div>
  );
}