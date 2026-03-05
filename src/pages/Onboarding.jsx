import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronRight, ChevronLeft, Flower2 } from "lucide-react";

const GOALS = [
  { id: "cycle_awareness", label: "Cycle Awareness", emoji: "🌙" },
  { id: "stress_relief", label: "Stress Relief", emoji: "🌿" },
  { id: "better_sleep", label: "Better Sleep", emoji: "💤" },
  { id: "fitness", label: "Fitness & Strength", emoji: "💪" },
  { id: "hormonal_balance", label: "Hormonal Balance", emoji: "⚖️" },
  { id: "mindfulness", label: "Mindfulness", emoji: "🧘" },
  { id: "pms_relief", label: "PMS Relief", emoji: "🌸" },
  { id: "postpartum", label: "Postpartum Recovery", emoji: "💝" },
];

const MODULES = [
  { id: "cycle", label: "Cycle Tracking", emoji: "📅" },
  { id: "symptoms", label: "Symptom Logs", emoji: "📝" },
  { id: "meditation", label: "Meditation", emoji: "🧘" },
  { id: "fitness", label: "Fitness", emoji: "🏃" },
  { id: "nutrition", label: "Habits", emoji: "🥗" },
  { id: "mood", label: "Mood Journal", emoji: "💭" },
];

const STEPS = ["welcome", "goals", "modules", "cycle", "tone", "done"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [modules, setModules] = useState([]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriod, setLastPeriod] = useState("");
  const [tone, setTone] = useState("warm");
  const [saving, setSaving] = useState(false);

  const toggleGoal = (id) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  const toggleModule = (id) =>
    setModules((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const handleFinish = async () => {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const existing = await base44.entities.UserProfile.filter({ user_id: user.id });
      const data = {
        user_id: user.id,
        user_email: user.email,
        onboarding_complete: true,
        goals,
        modules_enabled: modules,
        cycle_avg_length: cycleLength,
        period_length: periodLength,
        last_period_start_date: lastPeriod || null,
        tone_preference: tone,
      };
      if (existing.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, data);
      } else {
        await base44.entities.UserProfile.create(data);
      }
      window.location.href = createPageUrl("Today");
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const current = STEPS[step];
  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen femwell-gradient flex flex-col">
      {/* Progress */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="px-6 pt-12 pb-2">
          <div className="h-1 bg-rose-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full">
        {/* WELCOME */}
        {current === "welcome" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center shadow-xl">
              <Flower2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-rose-900 mb-2">Welcome to FemWell</h1>
              <p className="text-gray-500 leading-relaxed">Your personal wellness operating system. Built for every phase of your cycle.</p>
            </div>
            <button className="btn-primary w-full" onClick={() => setStep(1)}>
              Get Started <ChevronRight className="inline w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {/* GOALS */}
        {current === "goals" && (
          <div className="w-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">What are your goals?</h2>
              <p className="text-gray-500 text-sm mt-1">Select all that resonate with you.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all ${
                    goals.includes(g.id)
                      ? "border-rose-400 bg-rose-50"
                      : "border-transparent bg-white/70"
                  }`}
                >
                  <div className="text-2xl mb-1">{g.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{g.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODULES */}
        {current === "modules" && (
          <div className="w-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">What do you want to track?</h2>
              <p className="text-gray-500 text-sm mt-1">You can always change this later.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleModule(m.id)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all ${
                    modules.includes(m.id)
                      ? "border-rose-400 bg-rose-50"
                      : "border-transparent bg-white/70"
                  }`}
                >
                  <div className="text-2xl mb-1">{m.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{m.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CYCLE */}
        {current === "cycle" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">Tell us about your cycle</h2>
              <p className="text-gray-500 text-sm mt-1">Helps us give phase-aware recommendations.</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Average cycle length: <span className="text-rose-600 font-bold">{cycleLength} days</span></label>
                <input type="range" min="21" max="40" value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Period duration: <span className="text-rose-600 font-bold">{periodLength} days</span></label>
                <input type="range" min="2" max="10" value={periodLength} onChange={(e) => setPeriodLength(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Last period start (optional)</label>
                <input
                  type="date"
                  value={lastPeriod}
                  onChange={(e) => setLastPeriod(e.target.value)}
                  className="w-full p-3 rounded-xl border border-rose-200 bg-white/80 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TONE */}
        {current === "tone" && (
          <div className="w-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">How do you like to be guided?</h2>
              <p className="text-gray-500 text-sm mt-1">This shapes how FemWell speaks to you.</p>
            </div>
            <div className="space-y-3">
              {[
                { id: "warm", label: "Warm & Nurturing", desc: "Like a caring friend", emoji: "🌸" },
                { id: "clinical", label: "Clear & Clinical", desc: "Just the facts", emoji: "🔬" },
                { id: "motivational", label: "Bold & Motivational", desc: "Push me forward", emoji: "⚡" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`w-full p-4 rounded-2xl text-left border-2 flex items-center gap-4 transition-all ${
                    tone === t.id ? "border-rose-400 bg-rose-50" : "border-transparent bg-white/70"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DONE */}
        {current === "done" && (
          <div className="text-center space-y-6">
            <div className="text-6xl">✨</div>
            <div>
              <h2 className="text-2xl font-bold text-rose-900">You're all set!</h2>
              <p className="text-gray-500 leading-relaxed mt-2">FemWell is ready to support your wellness journey.</p>
            </div>
            <button className="btn-primary w-full" onClick={handleFinish} disabled={saving}>
              {saving ? "Setting up..." : "Enter FemWell →"}
            </button>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="px-6 pb-10 flex gap-3 max-w-md mx-auto w-full">
          <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="btn-primary flex-1"
            disabled={current === "goals" && goals.length === 0}
          >
            Continue <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}