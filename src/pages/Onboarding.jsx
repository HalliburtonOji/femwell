import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Bell, ChevronLeft, ChevronRight, Droplets, Flower2, Sparkles } from "lucide-react";

const GOALS = [
  { id: "calm", label: "Calm", emoji: "🫶" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "energy", label: "Energy", emoji: "⚡" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "nutrition", label: "Nutrition", emoji: "🥗" },
  { id: "hormone_support", label: "Hormone support", emoji: "🌙" },
  { id: "relationships", label: "Relationships", emoji: "💛" },
  { id: "confidence", label: "Confidence", emoji: "✨" },
];

const INTERESTS = [
  "Womens Health",
  "Relationships",
  "Career & Money",
  "Beauty",
  "Fitness",
  "Food",
  "Mental Wellness",
  "Culture",
  "Parenting",
  "Sex Education",
  "Menopause",
  "PCOS",
  "PMS",
];

const TONES = [
  { id: "gentle", label: "Gentle", description: "Soft, warm, and encouraging" },
  { id: "straight", label: "Straight talk", description: "Clear, practical, and direct" },
  { id: "minimal", label: "Minimal", description: "Short, calm, and to the point" },
];

const BODY_GOALS = [
  { id: "", label: "Skip for now" },
  { id: "fat_loss", label: "Fat loss" },
  { id: "tone", label: "Tone" },
  { id: "energy", label: "More energy" },
  { id: "hormone_support", label: "Hormone support" },
  { id: "postpartum", label: "Postpartum" },
  { id: "menopause", label: "Menopause" },
];

const STEPS = ["welcome", "goals", "interests", "preferences", "setup", "done"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [interests, setInterests] = useState([]);
  const [tone, setTone] = useState("gentle");
  const [notificationTime, setNotificationTime] = useState("morning");
  const [hydrationTarget, setHydrationTarget] = useState(2000);
  const [bodyGoal, setBodyGoal] = useState("");
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleValue = (value, setter) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const handleFinish = async () => {
    setSaving(true);
    const user = await base44.auth.me();

    const [profiles, preferences, nutritionProfiles, lifestyleProfiles] = await Promise.all([
      base44.entities.UserProfile.filter({ user_id: user.id }),
      base44.entities.UserPreferences.filter({ user_id: user.id }),
      base44.entities.NutritionProfile.filter({ user_id: user.id }),
      base44.entities.LifestyleProfile.filter({ user_id: user.id }),
    ]);

    const profilePayload = {
      user_id: user.id,
      user_email: user.email,
      onboarding_complete: true,
      goals,
      tone_preference: tone,
      modules_enabled: cycleTrackingEnabled ? ["cycle"] : [],
    };

    if (profiles[0]) {
      await base44.entities.UserProfile.update(profiles[0].id, profilePayload);
    } else {
      await base44.entities.UserProfile.create(profilePayload);
    }

    const preferencePayload = {
      user_id: user.id,
      goals,
      lifestyle_interests: interests,
      coach_tone: tone,
      notification_time: notificationTime,
      hydration_target_ml: hydrationTarget,
      body_goal: bodyGoal || undefined,
      cycle_tracking_enabled: cycleTrackingEnabled,
    };

    if (preferences[0]) {
      await base44.entities.UserPreferences.update(preferences[0].id, preferencePayload);
    } else {
      await base44.entities.UserPreferences.create(preferencePayload);
    }

    const nutritionPayload = {
      user_id: user.id,
      hydration_target_ml: hydrationTarget,
      ...(bodyGoal ? { goal_mode: bodyGoal } : {}),
    };

    if (nutritionProfiles[0]) {
      await base44.entities.NutritionProfile.update(nutritionProfiles[0].id, nutritionPayload);
    } else {
      await base44.entities.NutritionProfile.create(nutritionPayload);
    }

    const lifestylePayload = {
      user_id: user.id,
      followed_topics: interests.join(","),
      category_weights_json: JSON.stringify(Object.fromEntries(interests.map((item) => [item, 5]))),
    };

    if (lifestyleProfiles[0]) {
      await base44.entities.LifestyleProfile.update(lifestyleProfiles[0].id, lifestylePayload);
    } else {
      await base44.entities.LifestyleProfile.create(lifestylePayload);
    }

    window.location.href = createPageUrl("Today");
  };

  const current = STEPS[step];
  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen femwell-gradient flex flex-col">
      {step > 0 && step < STEPS.length - 1 && (
        <div className="px-6 pt-12 pb-2">
          <div className="h-1 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-8">
        {current === "welcome" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-200 to-pink-300 shadow-xl">
              <Flower2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-rose-900">Welcome to FemWell</h1>
              <p className="leading-relaxed text-gray-500">Let’s shape your feed, guidance style, and daily rhythm in under a minute.</p>
            </div>
            <button className="btn-primary w-full" onClick={() => setStep(1)}>
              Get Started <ChevronRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        )}

        {current === "goals" && (
          <div className="w-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">What do you want more of?</h2>
              <p className="mt-1 text-sm text-gray-500">Pick the goals that matter most right now.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleValue(goal.id, setGoals)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${goals.includes(goal.id) ? "border-rose-400 bg-rose-50" : "border-transparent bg-white/70"}`}
                >
                  <div className="mb-1 text-2xl">{goal.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{goal.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "interests" && (
          <div className="w-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">Choose your lifestyle interests</h2>
              <p className="mt-1 text-sm text-gray-500">This powers your personalised feed from day one.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleValue(interest, setInterests)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${interests.includes(interest) ? "bg-rose-500 text-white" : "bg-white/80 text-gray-600"}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "preferences" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">How should FemWell show up?</h2>
              <p className="mt-1 text-sm text-gray-500">Choose your guidance style and your best reminder window.</p>
            </div>

            <div className="space-y-3">
              {TONES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTone(item.id)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${tone === item.id ? "border-rose-400 bg-rose-50" : "border-transparent bg-white/70"}`}
                >
                  <div className="font-medium text-gray-800">{item.label}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.description}</div>
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">Reminder time</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "morning", label: "Morning", icon: "☀️" }, { id: "evening", label: "Evening", icon: "🌙" }].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setNotificationTime(item.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${notificationTime === item.id ? "border-rose-400 bg-rose-50 text-rose-600" : "border-rose-100 bg-white text-gray-600"}`}
                  >
                    <Bell className="mr-1 inline h-4 w-4" /> {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {current === "setup" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">Quick setup</h2>
              <p className="mt-1 text-sm text-gray-500">Set a hydration goal and any optional wellness focus.</p>
            </div>

            <div className="rounded-[24px] bg-white/80 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                <Droplets className="mr-1 inline h-4 w-4 text-rose-500" /> Hydration goal
              </label>
              <input
                type="number"
                min="500"
                step="100"
                value={hydrationTarget}
                onChange={(event) => setHydrationTarget(Number(event.target.value) || 2000)}
                className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">Optional body goal</p>
              <div className="flex flex-wrap gap-2">
                {BODY_GOALS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setBodyGoal(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${bodyGoal === item.id ? "bg-rose-500 text-white" : "bg-white/80 text-gray-600"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCycleTrackingEnabled((value) => !value)}
              className={`flex w-full items-center justify-between rounded-[24px] border p-4 text-left transition-all ${cycleTrackingEnabled ? "border-rose-300 bg-rose-50" : "border-rose-100 bg-white"}`}
            >
              <div>
                <p className="font-medium text-gray-800">Cycle tracking</p>
                <p className="mt-1 text-xs text-gray-500">Turn this on if you want phase-aware tips and trends.</p>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${cycleTrackingEnabled ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                {cycleTrackingEnabled ? "Enabled" : "Off"}
              </div>
            </button>
          </div>
        )}

        {current === "done" && (
          <div className="space-y-6 text-center">
            <div className="text-6xl">✨</div>
            <div>
              <h2 className="text-2xl font-bold text-rose-900">You’re all set</h2>
              <p className="mt-2 leading-relaxed text-gray-500">Your assistant, feed, and recommendations are now tuned to you.</p>
            </div>
            <div className="rounded-[24px] bg-white/80 p-4 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                <Sparkles className="h-3.5 w-3.5" /> Personalisation ready
              </div>
              <p className="mt-3 text-sm text-gray-600">You’ll see smarter lifestyle picks, a more human assistant, and faster recommendations from the moment you enter.</p>
            </div>
            <button className="btn-primary w-full" onClick={handleFinish} disabled={saving}>
              {saving ? "Setting up..." : "Enter FemWell →"}
            </button>
          </div>
        )}
      </div>

      {step > 0 && step < STEPS.length - 1 && (
        <div className="mx-auto flex w-full max-w-md gap-3 px-6 pb-10">
          <button onClick={() => setStep((currentStep) => currentStep - 1)} className="btn-secondary flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={() => setStep((currentStep) => currentStep + 1)}
            className="btn-primary flex-1"
            disabled={(current === "goals" && goals.length === 0) || (current === "interests" && interests.length === 0)}
          >
            Continue <ChevronRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
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