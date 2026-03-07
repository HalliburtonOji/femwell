import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Sun, ChevronRight, Plus, Sparkles, BookOpen } from "lucide-react";
import ManualCompleteButton from "../components/sessions/ManualCompleteButton";
import { format, differenceInDays, addDays, parseISO } from "date-fns";

const PHASE_INFO = {
  menstrual: { label: "Menstrual Phase", emoji: "🩸", color: "from-rose-300 to-pink-400", tip: "Rest and restore. Your body is working hard." },
  follicular: { label: "Follicular Phase", emoji: "🌱", color: "from-emerald-300 to-teal-400", tip: "Energy rising — great time to start new things." },
  ovulatory: { label: "Ovulatory Phase", emoji: "☀️", color: "from-amber-300 to-yellow-400", tip: "Peak energy and confidence. Shine today!" },
  luteal: { label: "Luteal Phase", emoji: "🌙", color: "from-purple-300 to-indigo-400", tip: "Wind down, reflect, and nourish yourself." },
};

function getCyclePhase(lastPeriodDate, cycleLength, periodLength) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = parseISO(lastPeriodDate);
  const dayOfCycle = (differenceInDays(today, last) % cycleLength) + 1;

  if (dayOfCycle <= periodLength) return { phase: "menstrual", day: dayOfCycle };
  if (dayOfCycle <= Math.round(cycleLength * 0.4)) return { phase: "follicular", day: dayOfCycle };
  if (dayOfCycle <= Math.round(cycleLength * 0.55)) return { phase: "ovulatory", day: dayOfCycle };
  return { phase: "luteal", day: dayOfCycle };
}

function CheckinModal({ onClose, onSave }) {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [sleep, setSleep] = useState(7);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ mood, energy, stress, sleep_hours: sleep, notes });
    setSaving(false);
    onClose();
  };

  const sliders = [
    { label: "Mood", emoji: "😊", value: mood, onChange: setMood },
    { label: "Energy", emoji: "⚡", value: energy, onChange: setEnergy },
    { label: "Stress", emoji: "🌊", value: stress, onChange: setStress },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Daily Check-in</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        {sliders.map((s) => (
          <div key={s.label}>
            <label className="text-sm font-medium text-gray-600 flex justify-between mb-1">
              <span>{s.emoji} {s.label}</span>
              <span className="text-rose-600 font-bold">{s.value}/5</span>
            </label>
            <input type="range" min="1" max="5" value={s.value} onChange={(e) => s.onChange(Number(e.target.value))} />
          </div>
        ))}

        <div>
          <label className="text-sm font-medium text-gray-600 flex justify-between mb-1">
            <span>💤 Sleep</span>
            <span className="text-rose-600 font-bold">{sleep}h</span>
          </label>
          <input type="range" min="3" max="12" value={sleep} onChange={(e) => setSleep(Number(e.target.value))} />
        </div>

        <textarea
          placeholder="Any notes? (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 text-sm rounded-xl border border-rose-100 bg-rose-50/30 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
          rows={2}
        />

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? "Saving..." : "Save Check-in ✓"}
        </button>
      </div>
    </div>
  );
}

export default function Today() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showCheckin, setShowCheckin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayCompletions, setTodayCompletions] = useState([]);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);

      const [profiles, checkins, content, recs, completions] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id, date: todayStr }),
        base44.entities.ContentItems.filter({ is_featured: true }, "-created_date", 3),
        base44.entities.TodayRecommendations.filter({ user_id: u.id, date: todayStr }),
        base44.entities.ContentHistory.filter({ user_id: u.id, session_date: todayStr }),
      ]);

      if (profiles[0]) setProfile(profiles[0]);
      if (checkins[0]) setTodayCheckin(checkins[0]);
      setRecentContent(content);
      setRecommendations(recs);
      setTodayCompletions(completions.filter((c) => !c.is_deleted));
      setLoading(false);
    })();
  }, []);

  const handleSaveCheckin = async (data) => {
    const u = user;
    const payload = { user_id: u.id, date: todayStr, ...data, updated_at: new Date().toISOString() };
    if (todayCheckin) {
      await base44.entities.DailyCheckins.update(todayCheckin.id, payload);
      setTodayCheckin({ ...todayCheckin, ...payload });
    } else {
      const created = await base44.entities.DailyCheckins.create(payload);
      setTodayCheckin(created);
    }
  };

  const cycleInfo = profile?.last_period_start_date
    ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
    : null;
  const phaseData = cycleInfo ? PHASE_INFO[cycleInfo.phase] : null;

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      {showCheckin && (
        <CheckinModal onClose={() => setShowCheckin(false)} onSave={handleSaveCheckin} />
      )}

      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">{format(new Date(), "EEEE, MMMM d")}</p>
            <h1 className="text-2xl font-bold text-rose-900">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              {user?.full_name?.split(" ")[0] || ""}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white font-bold shadow-md">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>

        {/* Cycle phase card */}
        {phaseData && (
          <div className={`card-glass rounded-2xl p-5 mb-4 bg-gradient-to-r ${phaseData.color} bg-opacity-10 relative overflow-hidden`}>
            <div className="relative z-10">
              <p className="text-xs font-medium text-white/80 mb-0.5">Day {cycleInfo.day} of cycle</p>
              <h2 className="text-lg font-bold text-white">{phaseData.emoji} {phaseData.label}</h2>
              <p className="text-sm text-white/90 mt-1">{phaseData.tip}</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-30">{phaseData.emoji}</div>
          </div>
        )}

        {/* Daily check-in */}
        <div className="card-glass rounded-2xl p-4 mb-4">
          {todayCheckin ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-700 text-sm">Today's Check-in ✓</p>
                <button onClick={() => setShowCheckin(true)} className="text-xs text-rose-400 font-medium">Edit</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Mood", emoji: "😊", value: todayCheckin.mood, unit: "/5" },
                  { label: "Energy", emoji: "⚡", value: todayCheckin.energy, unit: "/5" },
                  { label: "Stress", emoji: "🌊", value: todayCheckin.stress, unit: "/5" },
                  { label: "Sleep", emoji: "💤", value: todayCheckin.sleep_hours, unit: "h" },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-lg">{m.emoji}</p>
                    <p className="text-sm font-bold text-gray-700">{m.value}{m.unit}</p>
                    <p className="text-xs text-gray-400">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCheckin(true)} className="w-full flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Sun className="w-6 h-6 text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-700">Daily Check-in</p>
                <p className="text-xs text-gray-400">Tap to log your mood, energy & sleep</p>
              </div>
              <Plus className="w-5 h-5 text-rose-400" />
            </button>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-4">
            <h2 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-400" /> For You Today
            </h2>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <a
                  key={rec.id}
                  href={rec.action_route || "#"}
                  className="card-glass rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow block"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{rec.title}</p>
                    {rec.reason && <p className="text-xs text-gray-400 truncate">{rec.reason}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Featured content */}
        {recentContent.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700 text-sm">Recommended Practices</h2>
              <a href={createPageUrl("Explore")} className="text-xs text-rose-400 font-medium">See all</a>
            </div>
            <div className="space-y-3">
              {recentContent.map((item) => {
                const isComplete = todayCompletions.some((c) => c.content_id === item.id || c.content_key === item.content_key);
                return (
                  <div key={item.id} className="card-glass rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <a href={createPageUrl(`ContentPlayer?id=${item.id}`)} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center flex-shrink-0 text-xl relative">
                        {item.content_type === "MEDITATION" ? "🧘" : item.content_type === "BREATHWORK" ? "🌬️" : item.content_type === "WORKOUT" ? "💪" : "📖"}
                        {isComplete && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.duration_minutes ? `${item.duration_minutes} min · ` : ""}{item.content_type}</p>
                      </div>
                    </a>
                    {!isComplete && user && (
                      <ManualCompleteButton
                        item={item}
                        user={user}
                        source="TODAY"
                        onDone={(r) => setTodayCompletions((p) => [...p, r])}
                      />
                    )}
                    {isComplete && <span className="text-xs text-emerald-500 font-medium flex-shrink-0">Done ✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="mb-4">
          <h2 className="font-semibold text-gray-700 text-sm mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Log Cycle", emoji: "🩸", page: "Track" },
              { label: "Journal", emoji: "📓", page: "Journal" },
              { label: "Explore", emoji: "✨", page: "Explore" },
            ].map((a) => (
              <a
                key={a.label}
                href={createPageUrl(a.page)}
                className="card-glass rounded-2xl p-3 text-center hover:shadow-md transition-shadow block"
              >
                <p className="text-2xl mb-1">{a.emoji}</p>
                <p className="text-xs font-medium text-gray-600">{a.label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}