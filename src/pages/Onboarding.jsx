import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Bell, ChevronLeft, ChevronRight, Droplets, Flower2 } from "lucide-react";

const GOALS = [
  { id: "calm",             label: "Calm"             },
  { id: "sleep",            label: "Sleep"            },
  { id: "energy",           label: "Energy"           },
  { id: "fitness",          label: "Fitness"          },
  { id: "nutrition",        label: "Nutrition"        },
  { id: "hormone_support",  label: "Hormone support"  },
  { id: "relationships",    label: "Relationships"    },
  { id: "confidence",       label: "Confidence"       },
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

const STEPS = ["welcome", "goals", "interests", "preferences", "setup", "skin_profile", "done"];

const SKIN_TYPES = [
  { value: "dry",         label: "Dry",         desc: "Feels tight, rough, or flaky" },
  { value: "oily",        label: "Oily",         desc: "Shiny, large pores, prone to breakouts" },
  { value: "combination", label: "Combination",  desc: "Oily T-zone, drier cheeks" },
  { value: "normal",      label: "Normal",       desc: "Balanced, rarely reactive" },
  { value: "sensitive",   label: "Sensitive",    desc: "Easily irritated or reactive" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [interests, setInterests] = useState([]);
  const [tone, setTone] = useState("gentle");
  const [notificationTime, setNotificationTime] = useState("morning");
  const [hydrationTarget, setHydrationTarget] = useState(2000);
  const [bodyGoal, setBodyGoal] = useState("");
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState(true);
  const [skinType, setSkinType] = useState("");
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
      skin_type: skinType,
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
                {[{ id: "morning", label: "Morning" }, { id: "evening", label: "Evening" }].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setNotificationTime(item.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${notificationTime === item.id ? "border-rose-400 bg-rose-50 text-rose-600" : "border-rose-100 bg-white text-gray-600"}`}
                  >
                    <Bell className="mr-1 inline h-4 w-4" /> {item.label}
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

        {current === "skin_profile" && (
          <div className="w-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">What's your skin type?</h2>
              <p className="mt-1 text-sm text-gray-500">This helps us tailor your skin &amp; hair guidance to your baseline.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SKIN_TYPES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setSkinType(item.value)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${skinType === item.value ? "border-rose-400 bg-rose-50" : "border-transparent bg-white/70"}`}
                >
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "done" && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center mx-auto shadow-md">
              <Flower2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-rose-900">You’re all set</h2>
              <p className="mt-2 leading-relaxed text-gray-500">Your assistant, feed, and recommendations are now tuned to you.</p>
            </div>
            <div className="rounded-[24px] bg-white/80 p-4 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                Personalisation ready
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
            disabled={(current === "goals" && goals.length === 0) || (current === "interests" && interests.length === 0) || false}
          >
            Continue <ChevronRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}