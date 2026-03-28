import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GOALS = [
  { id: "better_sleep", label: "Better Sleep" },
  { id: "stress_relief", label: "Stress Relief" },
  { id: "track_cycle", label: "Track my Cycle" },
  { id: "mindfulness", label: "Mindfulness" },
  { id: "nutrition", label: "Nutrition" },
  { id: "energy", label: "Energy" },
];

const TONES = [
  { id: "gentle", label: "Gentle", sub: "Soft, caring, supportive" },
  { id: "warm", label: "Warm", sub: "Friendly and encouraging" },
  { id: "straight", label: "Direct", sub: "Clear, no-fluff" },
];

const STEPS = ["welcome", "name", "cycle", "goals", "tone", "done"];

function Dots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: i === step ? 10 : 8,
            height: i === step ? 10 : 8,
            borderRadius: "50%",
            background: i <= step ? "#C96B9E" : "#2E2E45",
            transition: "all 0.2s",
          }}
        />
      ))}
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [goals, setGoals] = useState([]);
  const [tone, setTone] = useState("gentle");
  const [saving, setSaving] = useState(false);

  const toggleGoal = (id) => {
    setGoals((g) =>
      g.includes(id)
        ? g.filter((x) => x !== id)
        : g.length < 3
        ? [...g, id]
        : g
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    const [profiles, preferences, lifestyleProfiles] = await Promise.all([
      base44.entities.UserProfile.filter({ user_id: user.id }),
      base44.entities.UserPreferences.filter({ user_id: user.id }),
      base44.entities.LifestyleProfile.filter({ user_id: user.id }),
    ]);

    const profilePayload = {
      user_id: user.id,
      user_email: user.email,
      onboarding_complete: true,
      goals,
      tone_preference: tone,
    };
    if (profiles[0]) {
      await base44.entities.UserProfile.update(profiles[0].id, profilePayload);
    } else {
      await base44.entities.UserProfile.create(profilePayload);
    }

    const prefPayload = {
      user_id: user.id,
      goals,
      coach_tone: tone,
      cycle_tracking_enabled: true,
    };
    if (preferences[0]) {
      await base44.entities.UserPreferences.update(preferences[0].id, prefPayload);
    } else {
      await base44.entities.UserPreferences.create(prefPayload);
    }

    const lsPayload = { user_id: user.id };
    if (lifestyleProfiles[0]) {
      await base44.entities.LifestyleProfile.update(lifestyleProfiles[0].id, lsPayload);
    } else {
      await base44.entities.LifestyleProfile.create(lsPayload);
    }

    window.location.href = createPageUrl("Today");
  };

  const current = STEPS[step];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0C0C1A", color: "#F2F2FF" }}
    >
      {/* Content */}
      <div className="flex-1 flex flex-col px-5 pt-16 pb-6 max-w-md mx-auto w-full">
        {/* WELCOME */}
        {current === "welcome" && (
          <div className="flex-1 flex flex-col justify-center">
            <h1
              className="text-center font-bold"
              style={{ fontSize: 32, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#C96B9E" }}
            >
              FemWell
            </h1>
            <p className="text-center mt-3" style={{ fontSize: 17, color: "#8A8AAA", lineHeight: 1.5 }}>
              Built around your cycle. Designed for you.
            </p>
            <div className="mt-10 space-y-5">
              {[
                { dot: "#E05C7A", text: "Understand your cycle, phase by phase" },
                { dot: "#7ECBA1", text: "Daily check-ins that take 30 seconds" },
                { dot: "#7C6AF5", text: "Content matched to where you are today" },
              ].map((row) => (
                <div key={row.text} className="flex items-center gap-3">
                  <div
                    style={{ width: 8, height: 8, borderRadius: "50%", background: row.dot, flexShrink: 0 }}
                  />
                  <p style={{ fontSize: 14, color: "#8A8AAA" }}>{row.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 — Name */}
        {current === "name" && (
          <div className="flex-1 flex flex-col justify-center">
            <Dots step={1} />
            <h2 className="font-bold mb-1" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
              What should we call you?
            </h2>
            <p style={{ fontSize: 14, color: "#8A8AAA", marginBottom: 24 }}>
              We'll use this to personalise your experience.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              autoFocus
              className="w-full"
              style={{
                background: "#13131F",
                border: "1px solid #2E2E45",
                borderRadius: 12,
                height: 52,
                padding: "0 16px",
                fontSize: 16,
                color: "#F2F2FF",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* STEP 2 — Cycle */}
        {current === "cycle" && (
          <div className="flex-1 flex flex-col justify-center">
            <Dots step={2} />
            <h2 className="font-bold mb-1" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
              Tell us about your cycle
            </h2>
            <p style={{ fontSize: 14, color: "#8A8AAA", marginBottom: 28 }}>
              Helps us give phase-aware recommendations.
            </p>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: 14, color: "#8A8AAA" }}>Average cycle length</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#C96B9E" }}>{cycleLength} days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  style={{ accentColor: "#E05C7A" }}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: 14, color: "#8A8AAA" }}>Period duration</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#C96B9E" }}>{periodLength} days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(Number(e.target.value))}
                  style={{ accentColor: "#E05C7A" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Goals */}
        {current === "goals" && (
          <div className="flex-1 flex flex-col justify-center">
            <Dots step={3} />
            <h2 className="font-bold mb-1" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
              What do you want to focus on?
            </h2>
            <p style={{ fontSize: 12, color: "#8A8AAA", marginBottom: 20 }}>Choose up to 3</p>
            <div className="flex flex-wrap gap-3">
              {GOALS.map((g) => {
                const sel = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    style={{
                      borderRadius: 999,
                      padding: "8px 16px",
                      fontSize: 12,
                      border: sel ? "2px solid #C96B9E" : "1px solid #242436",
                      background: sel ? "rgba(201,107,158,0.15)" : "#13131F",
                      color: sel ? "#F2F2FF" : "#8A8AAA",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4 — Tone */}
        {current === "tone" && (
          <div className="flex-1 flex flex-col justify-center">
            <Dots step={4} />
            <h2 className="font-bold mb-1" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
              How should FemWell talk to you?
            </h2>
            <p style={{ fontSize: 14, color: "#8A8AAA", marginBottom: 20 }}>
              You can change this any time.
            </p>
            <div className="space-y-3">
              {TONES.map((t) => {
                const sel = tone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className="w-full text-left"
                    style={{
                      background: sel ? "rgba(201,107,158,0.12)" : "#13131F",
                      border: sel ? "2px solid #C96B9E" : "1px solid #242436",
                      borderRadius: 16,
                      padding: 16,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <p style={{ fontWeight: 700, color: "#F2F2FF", fontSize: 15 }}>{t.label}</p>
                    <p style={{ fontSize: 13, color: "#8A8AAA", marginTop: 2 }}>{t.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5 — Done */}
        {current === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Dots step={5} />
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: "#4ABFA3" }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path
                  d="M8 18.5L14.5 25L28 11"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#F2F2FF" }}>You are in your</h2>
            <p style={{ fontSize: 32, fontWeight: 700, color: "#C96B9E", letterSpacing: "-0.04em" }}>
              Follicular phase
            </p>
            <p style={{ fontSize: 14, color: "#8A8AAA", marginTop: 20, lineHeight: 1.6, maxWidth: 280 }}>
              Energy is building. This is your most creative and focused window.
            </p>
          </div>
        )}

        {/* CTA button — always pinned to bottom */}
        <div className="mt-auto pt-8">
          {current === "done" ? (
            <button
              className="w-full btn-primary"
              style={{ height: 56 }}
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? "Setting up..." : "Enter FemWell"}
            </button>
          ) : current === "welcome" ? (
            <button
              className="w-full btn-primary"
              style={{ height: 56 }}
              onClick={() => setStep(1)}
            >
              Get Started <ChevronRight className="inline ml-1" size={18} />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                className="btn-secondary"
                style={{ height: 52, paddingLeft: 20, paddingRight: 20 }}
                onClick={() => setStep((s) => s - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="btn-primary flex-1"
                style={{ height: 52 }}
                onClick={() => setStep((s) => s + 1)}
                disabled={current === "goals" && goals.length === 0}
              >
                Continue <ChevronRight className="inline ml-1" size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}