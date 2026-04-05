import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  "Womens Health", "Relationships", "Career & Money", "Beauty",
  "Fitness", "Food", "Mental Wellness", "Culture", "Parenting",
  "Sex Education", "Menopause", "PCOS", "PMS",
];

const TONES = [
  { id: "gentle",   label: "Gentle",       description: "Soft, warm, and encouraging"    },
  { id: "straight", label: "Straight talk", description: "Clear, practical, and direct"   },
  { id: "minimal",  label: "Minimal",       description: "Short, calm, and to the point"  },
];

const BODY_GOALS = [
  { id: "",                label: "Skip for now"     },
  { id: "fat_loss",        label: "Fat loss"         },
  { id: "tone",            label: "Tone"             },
  { id: "energy",          label: "More energy"      },
  { id: "hormone_support", label: "Hormone support"  },
  { id: "postpartum",      label: "Postpartum"       },
  { id: "menopause",       label: "Menopause"        },
];

const STEPS = ["welcome", "goals", "interests", "preferences", "setup", "skin_profile", "done"];

const SKIN_TYPES = [
  { value: "dry",         label: "Dry",         desc: "Feels tight, rough, or flaky"           },
  { value: "oily",        label: "Oily",         desc: "Shiny, large pores, prone to breakouts" },
  { value: "combination", label: "Combination",  desc: "Oily T-zone, drier cheeks"              },
  { value: "normal",      label: "Normal",       desc: "Balanced, rarely reactive"              },
  { value: "sensitive",   label: "Sensitive",    desc: "Easily irritated or reactive"           },
];

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};

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

  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!saving) return;
    const timer = setTimeout(() => {
      setSaving(false);
      setSaveError(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [saving]);

  const handleFinish = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const profilePayload = {
        user_id: user.id,
        user_email: user.email,
        onboarding_complete: true,
        goals,
        tone_preference: tone,
        modules_enabled: cycleTrackingEnabled ? ["cycle"] : [],
        skin_type: skinType,
        followed_categories: interests,
        hydration_target_ml: hydrationTarget,
        cycle_tracking_enabled: cycleTrackingEnabled,
      };
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, profilePayload);
      } else {
        await base44.entities.UserProfile.create(profilePayload);
      }
      window.location.href = createPageUrl("Today");
    } catch (e) {
      console.error("Onboarding error:", e);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const current = STEPS[step];
  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--ivory)" }}>

      {step > 0 && step < STEPS.length - 1 && (
        <div style={{ padding: "48px 24px 8px" }}>
          <div style={{ height: "3px", borderRadius: "9999px", backgroundColor: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "9999px", backgroundColor: "var(--rose-dust)", width: `${progress}%`, transition: "width 0.4s ease" }} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 w-full mx-auto" style={{ maxWidth: "448px" }}>

        {current === "welcome" && (
          <div className="space-y-8 text-center w-full">
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px", margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)"
            }}>
              <span style={{ fontSize: "36px", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--rose-dust)" }}>F</span>
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.1, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
                Welcome to FemWell
              </h1>
              <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "8px" }}>
                Let's shape your feed, guidance style, and daily rhythm in under a minute.
              </p>
            </div>
            <button className="btn-primary w-full" onClick={() => setStep(1)}>
              Get started
            </button>
          </div>
        )}

        {current === "goals" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 1 of 5</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: "4px", lineHeight: 1.2 }}>
                What do you want more of?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
                Pick everything that matters right now.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button key={goal.id} onClick={() => toggleValue(goal.id, setGoals)}
                  style={{
                    borderRadius: "16px", padding: "14px 16px", textAlign: "left",
                    border: goals.includes(goal.id) ? "2px solid var(--rose-dust)" : "1.5px solid var(--border)",
                    backgroundColor: goals.includes(goal.id) ? "var(--rose-dust-subtle)" : "var(--surface)",
                    transition: "all 0.15s", cursor: "pointer"
                  }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: goals.includes(goal.id) ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    {goal.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "interests" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 2 of 5</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: "4px", lineHeight: 1.2 }}>
                Your lifestyle interests
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
                Powers your personalised feed from day one.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button key={interest} onClick={() => toggleValue(interest, setInterests)}
                  style={{
                    borderRadius: "9999px", padding: "8px 16px",
                    fontSize: "13px", fontWeight: 500, fontFamily: "'Inter', sans-serif",
                    border: interests.includes(interest) ? "1.5px solid var(--rose-dust)" : "1.5px solid var(--border)",
                    backgroundColor: interests.includes(interest) ? "var(--rose-dust-subtle)" : "var(--surface)",
                    color: interests.includes(interest) ? "var(--rose-dust)" : "var(--plum)",
                    transition: "all 0.15s", cursor: "pointer"
                  }}>
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "preferences" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 3 of 5</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: "4px", lineHeight: 1.2 }}>
                How should FemWell show up?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
                Choose your guidance style.
              </p>
            </div>
            <div className="space-y-3">
              {TONES.map((item) => (
                <button key={item.id} onClick={() => setTone(item.id)} className="w-full text-left"
                  style={{
                    borderRadius: "16px", padding: "14px 16px", cursor: "pointer",
                    border: tone === item.id ? "2px solid var(--rose-dust)" : "1.5px solid var(--border)",
                    backgroundColor: tone === item.id ? "var(--rose-dust-subtle)" : "var(--surface)",
                    transition: "all 0.15s"
                  }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: tone === item.id ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "3px" }}>{item.description}</p>
                </button>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: "8px" }}>Reminder time</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "morning", label: "Morning" }, { id: "evening", label: "Evening" }].map((item) => (
                  <button key={item.id} onClick={() => setNotificationTime(item.id)} className="text-left"
                    style={{
                      borderRadius: "14px", padding: "12px 16px", cursor: "pointer",
                      border: notificationTime === item.id ? "2px solid var(--rose-dust)" : "1.5px solid var(--border)",
                      backgroundColor: notificationTime === item.id ? "var(--rose-dust-subtle)" : "var(--surface)",
                      transition: "all 0.15s"
                    }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: notificationTime === item.id ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{item.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {current === "setup" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 4 of 5</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: "4px", lineHeight: 1.2 }}>
                A few more details
              </h2>
            </div>

            <div style={{ ...card, padding: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>Daily hydration target</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", marginBottom: "12px" }}>
                {(hydrationTarget / 1000).toFixed(1)}L
              </p>
              <input type="range" min="1000" max="4000" step="250" value={hydrationTarget}
                onChange={(e) => setHydrationTarget(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--rose-dust)" }} />
              <div className="flex justify-between" style={{ marginTop: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>1.0L</span>
                <span style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>4.0L</span>
              </div>
            </div>

            <div style={{ ...card, padding: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: "10px" }}>Body goal (optional)</p>
              <div className="grid grid-cols-2 gap-2">
                {BODY_GOALS.map((item) => (
                  <button key={item.id} onClick={() => setBodyGoal(item.id)} className="text-left"
                    style={{
                      borderRadius: "12px", padding: "10px 12px", cursor: "pointer",
                      border: bodyGoal === item.id ? "1.5px solid var(--rose-dust)" : "1.5px solid var(--border)",
                      backgroundColor: bodyGoal === item.id ? "var(--rose-dust-subtle)" : "var(--surface)",
                      transition: "all 0.15s"
                    }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: bodyGoal === item.id ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...card, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Cycle tracking</p>
                <p style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>
                  Turn on for phase-aware tips and trends.
                </p>
              </div>
              <button type="button" onClick={() => setCycleTrackingEnabled(!cycleTrackingEnabled)}
                style={{
                  width: "46px", height: "26px", borderRadius: "9999px",
                  position: "relative", border: "none", cursor: "pointer",
                  backgroundColor: cycleTrackingEnabled ? "var(--rose-dust)" : "var(--border)",
                  transition: "background-color 0.2s", flexShrink: 0
                }}>
                <div style={{
                  position: "absolute", top: "3px",
                  left: cycleTrackingEnabled ? "23px" : "3px",
                  width: "20px", height: "20px", borderRadius: "9999px",
                  backgroundColor: "white", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }} />
              </button>
            </div>
          </div>
        )}

        {current === "skin_profile" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 5 of 5</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: "4px", lineHeight: 1.2 }}>
                What's your skin type?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
                Helps us tailor your skin guidance from the start.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SKIN_TYPES.map((item) => (
                <button key={item.value} onClick={() => setSkinType(item.value)} className="text-left"
                  style={{
                    borderRadius: "16px", padding: "14px 16px", cursor: "pointer",
                    border: skinType === item.value ? "2px solid var(--rose-dust)" : "1.5px solid var(--border)",
                    backgroundColor: skinType === item.value ? "var(--rose-dust-subtle)" : "var(--surface)",
                    transition: "all 0.15s"
                  }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: skinType === item.value ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "done" && (
          <div className="space-y-6 text-center w-full">
            <div style={{
              width: "64px", height: "64px", borderRadius: "20px", margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)"
            }}>
              <span style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--rose-dust)" }}>F</span>
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", lineHeight: 1.1 }}>
                You're all set
              </h2>
              <p style={{ fontSize: "14px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "8px", lineHeight: 1.6 }}>
                Your assistant, feed, and recommendations are now tuned to you.
              </p>
            </div>
            <div style={{ ...card, padding: "16px", textAlign: "left" }}>
              <p style={{ ...sLabel, marginBottom: "8px" }}>Personalisation ready</p>
              <p style={{ fontSize: "13px", color: "var(--plum)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                You'll see smarter lifestyle picks, a more human assistant, and faster recommendations from the moment you enter.
              </p>
            </div>
            <button className="btn-primary w-full" onClick={handleFinish} disabled={saving}>
              {saving ? "Setting up..." : "Enter FemWell"}
            </button>
            {saveError && (
              <p style={{ fontSize: 13, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textAlign: "center", marginTop: 8 }}>
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        )}
      </div>

      {step > 0 && step < STEPS.length - 1 && (
        <div style={{ display: "flex", gap: "12px", padding: "0 24px 40px", maxWidth: "448px", width: "100%", margin: "0 auto" }}>
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={() => setStep(s => s + 1)}
            className="btn-primary flex-1"
            disabled={
              (current === "goals" && goals.length === 0) ||
              (current === "interests" && interests.length === 0)
            }>
            Continue <ChevronRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}