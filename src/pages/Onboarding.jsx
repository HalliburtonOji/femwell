import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GuideVoiceMode from "../components/guide/GuideVoiceMode";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CycleBasicsStep from "../components/onboarding/CycleBasicsStep";

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

const STEPS = ["welcome", "cycle_basics", "display_name", "goals", "location", "interests", "preferences", "life_stage", "conditions", "setup", "skin_profile", "assistant_intro", "done"];
const PROGRESS_STEPS = ["cycle_basics", "goals", "location", "interests", "preferences", "life_stage", "conditions", "setup", "skin_profile"];

// Sprint 5 BUILD 5 — conditions multi-select. Keys match plannerAdapter
// CONDITION_OVERRIDES where present; unknown keys fall through the 'other'
// no-op so persistence works without crashing.
const CONDITION_OPTIONS = [
  { key: "pcos",                label: "PCOS" },
  { key: "endo",                label: "Endometriosis" },
  { key: "fibroids",            label: "Fibroids" },
  { key: "thyroid",             label: "Thyroid disorder" },
  { key: "pmdd",                label: "PMDD" },
  { key: "diabetes",            label: "Diabetes" },
  { key: "hypertension",        label: "Hypertension" },
  { key: "anxiety-depression",  label: "Anxiety / Depression" },
];
const NONE_KEY = "none";

const PREG_FOCUSES = ["Sleep", "Nausea", "Movement", "Nutrition", "Birth prep", "Calm", "Pelvic health"];
const MENO_FOCUSES = ["Sleep", "Hot flashes", "Mood", "Energy", "Brain fog", "Joint comfort", "Weight balance"];

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
  };

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};

export default function Onboarding() {
  const navigate = useNavigate();

  // Guard: only allow if mode=signup or mode=redo in query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (!mode || (mode !== "signup" && mode !== "redo")) {
      navigate("/Today", { replace: true });
    }
  }, []);
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
  const [locationCity, setLocationCity] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoFound, setGeoFound] = useState("");
  // Life stage
  const [lifeStage, setLifeStage] = useState("none");
  const [lifeStageFocus, setLifeStageFocus] = useState([]);
  // Sprint 5 BUILD 5 — conditions multi-select. Saves to UserProfile.conditions
  // (the canonical field plannerAdapter reads) + appends into condition_flags.
  const [conditions, setConditions] = useState([]);
  const [pregDueDate, setPregDueDate] = useState("");
  const [pregWeek, setPregWeek] = useState("");
  const [pregTrimester, setPregTrimester] = useState("first");
  const [menoStage, setMenoStage] = useState("perimenopause");
  const toggleLifeStageFocus = (v) => setLifeStageFocus(c => c.includes(v) ? c.filter(i => i !== v) : [...c, v]);
  const [displayName, setDisplayName] = useState("");
  const [assistantName, setAssistantName] = useState("Guide");
  const [cycleBasics, setCycleBasics] = useState(null);
  const [cycleSaving, setCycleSaving] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const voiceTimerRef = useRef(null);
  const isPopState = useRef(false);

  // Push history state on step changes so browser back = one step back
  useEffect(() => {
    if (isPopState.current) { isPopState.current = false; return; }
    window.history.pushState({ onboardingStep: step }, "");
  }, [step]);

  useEffect(() => {
    const handler = (e) => {
      if (e.state && typeof e.state.onboardingStep === "number") {
        isPopState.current = true;
        setStep(e.state.onboardingStep);
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
        if (city) { setGeoFound(city); setLocationCity(city); }
      } catch {}
      setGeoLoading(false);
    }, () => setGeoLoading(false));
  };

  const toggleValue = (value, setter) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const [saveError, setSaveError] = useState(false);

  // Incremental save for cycle basics — runs even if user bails later
  const saveCycleBasics = async (payload) => {
    setCycleSaving(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const data = {
        user_id: user.id,
        user_email: user.email,
        ...payload,
      };
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, data);
      } else {
        await base44.entities.UserProfile.create(data);
      }
      setCycleBasics(payload);
    } catch (e) {
      console.error("Cycle basics save failed:", e);
    } finally {
      setCycleSaving(false);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setSaveError(false);
    let timeoutId;
    try {
      timeoutId = setTimeout(() => { setSaving(false); setSaveError(true); }, 15000);
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const conditionFlags = [];
      if (lifeStage === "pregnancy") conditionFlags.push("pregnancy");
      if (lifeStage === "menopause") conditionFlags.push("menopause");
      // Sprint 5 BUILD 5 — append explicit condition picks. Skip the
      // 'none of the above' sentinel — it's a UI affordance, not a real
      // condition. Resulting conditions array maps directly to
      // plannerAdapter CONDITION_OVERRIDES keys.
      const explicitConditions = (conditions || []).filter((c) => c && c !== NONE_KEY);
      for (const c of explicitConditions) {
        if (!conditionFlags.includes(c)) conditionFlags.push(c);
      }
      const pData = {
        user_id: user.id, user_email: user.email, onboarding_complete: true,
        goals, tone_preference: tone,
        modules_enabled: cycleTrackingEnabled ? ["cycle"] : [],
        display_name: displayName.trim() || undefined,
        skin_type: skinType, followed_categories: interests,
        hydration_target_ml: hydrationTarget,
        life_stage: lifeStage,
        life_stage_focus: lifeStageFocus,
        condition_flags: conditionFlags,
        conditions: explicitConditions,
        ai_assistant_name: assistantName || "Guide",
        ...(locationCity ? { location_city: locationCity } : {}),
        ...(cycleBasics || {}),
      };
      if (profiles[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, pData);
        // If duplicate rows exist, mark them all complete too so the guard never loops.
        const alignFields = { onboarding_complete: true, goals, tone_preference: tone, ai_assistant_name: assistantName || "Guide", life_stage: lifeStage, life_stage_focus: lifeStageFocus, hydration_target_ml: hydrationTarget };
        for (let i = 1; i < profiles.length; i++) {
          await base44.entities.UserProfile.update(profiles[i].id, alignFields).catch(() => {});
        }
      } else {
        await base44.entities.UserProfile.create(pData);
      }
      // Upsert life stage profiles
      if (lifeStage === "pregnancy") {
        const existing = await base44.entities.PregnancyProfile.filter({ user_id: user.id });
        const payload = { user_id: user.id, trimester: pregTrimester, care_focus: lifeStageFocus, ...(pregDueDate ? { due_date: pregDueDate } : {}), ...(pregWeek ? { pregnancy_week: Number(pregWeek) } : {}) };
        if (existing[0]) await base44.entities.PregnancyProfile.update(existing[0].id, payload);
        else await base44.entities.PregnancyProfile.create(payload);
      }
      if (lifeStage === "menopause") {
        const existing = await base44.entities.MenopauseProfile.filter({ user_id: user.id });
        const payload = { user_id: user.id, stage: menoStage, care_focus: lifeStageFocus };
        if (existing[0]) await base44.entities.MenopauseProfile.update(existing[0].id, payload);
        else await base44.entities.MenopauseProfile.create(payload);
      }
      clearTimeout(timeoutId);
      navigate("/Today", { replace: true });
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Onboarding error:", e);
      setSaving(false);
      setSaveError(true);
    }
  };

  const current = STEPS[step];
  const progress = (step / (STEPS.length - 1)) * 100;

  const petals = Array.from({ length: 14 }, (_, i) => i);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--ivory)", position: "relative" }}>
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.0) translate(0%, 0%); }
          50%  { transform: scale(1.10) translate(-2%, -1%); }
          100% { transform: scale(1.0) translate(0%, 0%); }
        }
        @keyframes petal-fall {
          0%   { transform: translateY(-10vh) translateX(0px) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(110vh) translateX(60px) rotate(540deg); opacity: 0; }
        }
        .ob-bg-img {
          position: fixed; inset: 0; width: 100%; height: 100%;
          object-fit: cover; opacity: 0.14; z-index: 0; pointer-events: none;
          animation: kenburns 22s ease-in-out infinite;
          transform-origin: center center;
        }
        .ob-petal {
          position: fixed; z-index: 0; pointer-events: none;
          width: 8px; height: 12px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          background: rgba(196,132,154,0.35);
          animation: petal-fall linear infinite;
        }
      `}</style>

      {/* Ken Burns background */}
      <img
        src="https://images.unsplash.com/photo-1490750967868-88df5691cc2b?w=900&q=80"
        alt=""
        loading="lazy"
        className="ob-bg-img"
        onError={e => { e.target.style.display = "none"; }}
      />

      {/* Falling petals */}
      {petals.map(i => (
        <div key={i} className="ob-petal" style={{
          left: `${5 + (i * 7) % 90}%`,
          animationDuration: `${8 + (i * 1.3) % 10}s`,
          animationDelay: `${(i * 0.9) % 9}s`,
          width: `${6 + (i % 4)}px`,
          height: `${9 + (i % 5)}px`,
          opacity: 0.3 + (i % 4) * 0.1,
        }} />
      ))}

      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(to top, rgba(250,247,244,0.88) 0%, transparent 60%)", zIndex: 0, pointerEvents: "none" }} />

      {step > 0 && step < STEPS.length - 1 && (
        <div style={{ padding: "48px 24px 8px", position: "relative", zIndex: 1 }}>
          <div style={{ height: "3px", borderRadius: "9999px", backgroundColor: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "9999px", backgroundColor: "var(--rose-dust)", width: `${progress}%`, transition: "width 0.4s ease" }} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 w-full mx-auto" style={{ maxWidth: "448px", position: "relative", zIndex: 1 }}>

        {current === "welcome" && (
          <div className="space-y-8 text-center w-full">
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px", margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)"
            }}>
              <span style={{ fontSize: "36px", fontWeight: 700, color: "var(--rose-dust)" }}>F</span>
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.1, color: "var(--plum)", letterSpacing: "-0.02em" }}>
                Welcome to FemWell
              </h1>
              <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--mauve)", marginTop: "8px" }}>
                Let's shape your feed, guidance style, and daily rhythm in under a minute.
              </p>
            </div>
            <button className="btn-primary w-full" onClick={() => setStep(1)}>
              Get started
            </button>
          </div>
        )}

        {current === "cycle_basics" && (
          <CycleBasicsStep
            initial={cycleBasics || {}}
            saving={cycleSaving}
            onSave={async (payload) => {
              await saveCycleBasics(payload);
              setStep(s => s + 1);
            }}
            onSkip={async () => {
              const defaults = {
                last_period_start_date: new Date().toISOString().split("T")[0],
                cycle_avg_length: 28,
                period_length: 5,
              };
              await saveCycleBasics(defaults);
              setStep(s => s + 1);
            }}
          />
        )}

        {current === "display_name" && (
          <div className="w-full space-y-6">
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                What should we call you?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>
                Just your first name is perfect.
              </p>
            </div>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Maya, Ava, Jo"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 16,
                border: "1.5px solid var(--border)",
                backgroundColor: "var(--surface)",
                fontSize: 16, color: "var(--plum)",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <p style={{ fontSize: 11, color: "var(--mauve)", }}>You can skip this — we will use your email if blank.</p>
          </div>
        )}

        {current === "goals" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 1 of 6</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                What do you want more of?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>
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
                  <p style={{ fontSize: "13px", fontWeight: 600, color: goals.includes(goal.id) ? "var(--rose-dust)" : "var(--plum)", }}>
                    {goal.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "location" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 2 of 6</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                Where are you based?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>
                Used to show local events and personalise your feed.
              </p>
            </div>
            <button
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 16,
                border: "1.5px solid var(--rose-dust-light)",
                backgroundColor: geoFound ? "var(--sage-subtle)" : "var(--rose-dust-subtle)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontSize: 14, fontWeight: 600, color: geoFound ? "var(--sage)" : "var(--rose-dust)",
              }}
            >
              {geoLoading ? "Finding location..." : geoFound ? `Found: ${geoFound}` : "Use my location"}
            </button>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "8px" }}>Or type your city</p>
              <input
                type="text"
                value={locationCity}
                onChange={e => setLocationCity(e.target.value)}
                placeholder="e.g. London, Manchester, Bristol..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 16,
                  border: "1.5px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  fontSize: 14, color: "var(--plum)",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--mauve)", }}>You can skip this and set it later in your profile.</p>
          </div>
        )}

        {current === "interests" && (
          <div className="w-full space-y-6">
            <div>
              <p style={sLabel}>Step 2 of 5</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                Your lifestyle interests
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>
                Powers your personalised feed from day one.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button key={interest} onClick={() => toggleValue(interest, setInterests)}
                  style={{
                    borderRadius: "9999px", padding: "8px 16px",
                    fontSize: "13px", fontWeight: 500, border: interests.includes(interest) ? "1.5px solid var(--rose-dust)" : "1.5px solid var(--border)",
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
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                How should FemWell show up?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>
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
                  <p style={{ fontSize: "14px", fontWeight: 600, color: tone === item.id ? "var(--rose-dust)" : "var(--plum)", }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--mauve)", marginTop: "3px" }}>{item.description}</p>
                </button>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "6px" }}>Name your assistant</p>
              <input
                type="text"
                value={assistantName}
                onChange={e => setAssistantName(e.target.value)}
                placeholder="e.g. Guide, Sage, Luna"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 14,
                  border: "1.5px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  fontSize: 14, color: "var(--plum)",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 5, marginBottom: 14 }}>You can change it later.</p>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "8px" }}>Reminder time</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "morning", label: "Morning" }, { id: "evening", label: "Evening" }].map((item) => (
                  <button key={item.id} onClick={() => setNotificationTime(item.id)} className="text-left"
                    style={{
                      borderRadius: "14px", padding: "12px 16px", cursor: "pointer",
                      border: notificationTime === item.id ? "2px solid var(--rose-dust)" : "1.5px solid var(--border)",
                      backgroundColor: notificationTime === item.id ? "var(--rose-dust-subtle)" : "var(--surface)",
                      transition: "all 0.15s"
                    }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: notificationTime === item.id ? "var(--rose-dust)" : "var(--plum)", }}>{item.label}</p>
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
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                A few more details
              </h2>
            </div>

            <div style={{ ...card, padding: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "4px" }}>Daily hydration target</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--rose-dust)", marginBottom: "12px" }}>
                {(hydrationTarget / 1000).toFixed(1)}L
              </p>
              <input type="range" min="1000" max="4000" step="250" value={hydrationTarget}
                onChange={(e) => setHydrationTarget(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--rose-dust)" }} />
              <div className="flex justify-between" style={{ marginTop: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--mauve)", }}>1.0L</span>
                <span style={{ fontSize: "11px", color: "var(--mauve)", }}>4.0L</span>
              </div>
            </div>

            <div style={{ ...card, padding: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "10px" }}>Body goal (optional)</p>
              <div className="grid grid-cols-2 gap-2">
                {BODY_GOALS.map((item) => (
                  <button key={item.id} onClick={() => setBodyGoal(item.id)} className="text-left"
                    style={{
                      borderRadius: "12px", padding: "10px 12px", cursor: "pointer",
                      border: bodyGoal === item.id ? "1.5px solid var(--rose-dust)" : "1.5px solid var(--border)",
                      backgroundColor: bodyGoal === item.id ? "var(--rose-dust-subtle)" : "var(--surface)",
                      transition: "all 0.15s"
                    }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: bodyGoal === item.id ? "var(--rose-dust)" : "var(--plum)", }}>{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...card, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", }}>Cycle tracking</p>
                <p style={{ fontSize: "11px", color: "var(--mauve)", marginTop: "2px" }}>
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
              {(() => { const n = PROGRESS_STEPS.indexOf(current) + 1; return n > 0 && <p style={sLabel}>Step {n} of {PROGRESS_STEPS.length}</p>; })()}
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                What is your skin type?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>
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
                  <p style={{ fontSize: "14px", fontWeight: 600, color: skinType === item.value ? "var(--rose-dust)" : "var(--plum)", }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--mauve)", marginTop: "2px" }}>{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {current === "life_stage" && (
          <div className="w-full space-y-6">
            <div>
              {(() => { const n = PROGRESS_STEPS.indexOf(current) + 1; return n > 0 && <p style={sLabel}>Step {n} of {PROGRESS_STEPS.length}</p>; })()}
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                Are you in a life stage we should know about?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>Helps personalise care, logging, and recommendations.</p>
            </div>
            <div className="space-y-3">
              {[
                { id: "none",             label: "Not now",          desc: "Skip — you can set this anytime from Profile" },
                { id: "teen",             label: "Teen",             desc: "Still learning your pattern · educational + body-neutral" },
                { id: "reproductive",     label: "Reproductive years", desc: "Standard cycle tracking · phases · daily plan" },
                { id: "pre-ttc",          label: "Pre-TTC",          desc: "Thinking about it · baseline + folic acid + AMH" },
                { id: "ttc",              label: "Trying to conceive", desc: "Clinical view · BBT · OPK · fertile window" },
                { id: "pregnant-t1",      label: "Pregnant — T1",    desc: "First trimester · cycle paused · NHS-aligned" },
                { id: "pregnant-t2",      label: "Pregnant — T2",    desc: "Second trimester · anomaly scan · movement" },
                { id: "pregnant-t3",      label: "Pregnant — T3",    desc: "Third trimester · kick counter · bag-by-36" },
                { id: "postpartum",       label: "Postpartum",       desc: "Recovery · sleep · pelvic floor · mood watch" },
                { id: "perimenopause",    label: "Perimenopause",    desc: "Symptoms over predictions · HRT log · patterns" },
                { id: "menopause",        label: "Menopause",        desc: "12+ months no period · long-term health focus" },
                { id: "post-menopause",   label: "Post-menopause",   desc: "Cycle no longer relevant · bone · heart · cognition" },
              ].map(item => (
                <button key={item.id} onClick={() => { setLifeStage(item.id); setLifeStageFocus([]); }} className="w-full text-left"
                  style={{ borderRadius: "16px", padding: "14px 16px", cursor: "pointer", border: lifeStage === item.id ? "2px solid var(--rose-dust)" : "1.5px solid var(--border)", backgroundColor: lifeStage === item.id ? "var(--rose-dust-subtle)" : "var(--surface)", transition: "all 0.15s" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: lifeStage === item.id ? "var(--rose-dust)" : "var(--plum)", }}>{item.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--mauve)", marginTop: "3px" }}>{item.desc}</p>
                </button>
              ))}
            </div>
            <p style={{ fontSize: "11px", color: "var(--mauve)", marginTop: "10px", fontStyle: "italic", lineHeight: 1.5 }}>
              This shapes every Planner surface, every Jess message, and every content card. You can change it any time from Profile.
            </p>
            {(lifeStage === "pregnant-t1" || lifeStage === "pregnant-t2" || lifeStage === "pregnant-t3" || lifeStage === "pregnancy") && (
              <div style={{ ...card, padding: "16px" }} className="space-y-3">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", }}>Pregnancy details (optional)</p>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--mauve)", marginBottom: 4 }}>Due date</p>
                  <input type="date" value={pregDueDate} onChange={e => setPregDueDate(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--mauve)", marginBottom: 4 }}>Current week</p>
                  <input type="number" min="1" max="42" placeholder="e.g. 20" value={pregWeek} onChange={e => setPregWeek(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <Select value={pregTrimester} onValueChange={setPregTrimester}>
                  <SelectTrigger style={{ borderRadius: 12, border: "1px solid var(--border)", height: 44 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First trimester (Weeks 1–12)</SelectItem>
                    <SelectItem value="second">Second trimester (Weeks 13–26)</SelectItem>
                    <SelectItem value="third">Third trimester (Weeks 27–40)</SelectItem>
                    <SelectItem value="postpartum">Postpartum</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--mauve)", marginBottom: 8 }}>Care focus areas</p>
                  <div className="flex flex-wrap gap-2">
                    {PREG_FOCUSES.map(f => (
                      <button key={f} onClick={() => toggleLifeStageFocus(f)} style={{ padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: lifeStageFocus.includes(f) ? "var(--rose-dust)" : "var(--ivory-dark)", color: lifeStageFocus.includes(f) ? "white" : "var(--mauve)" }}>{f}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {(lifeStage === "menopause" || lifeStage === "perimenopause" || lifeStage === "post-menopause") && (
              <div style={{ ...card, padding: "16px" }} className="space-y-3">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", }}>Menopause stage</p>
                <Select value={menoStage} onValueChange={setMenoStage}>
                  <SelectTrigger style={{ borderRadius: 12, border: "1px solid var(--border)", height: 44 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perimenopause">Perimenopause</SelectItem>
                    <SelectItem value="menopause">Menopause</SelectItem>
                    <SelectItem value="postmenopause">Postmenopause</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--mauve)", marginBottom: 8 }}>Care focus areas</p>
                  <div className="flex flex-wrap gap-2">
                    {MENO_FOCUSES.map(f => (
                      <button key={f} onClick={() => toggleLifeStageFocus(f)} style={{ padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: lifeStageFocus.includes(f) ? "var(--rose-dust)" : "var(--ivory-dark)", color: lifeStageFocus.includes(f) ? "white" : "var(--mauve)" }}>{f}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {current === "conditions" && (
          <div className="w-full space-y-6">
            <div>
              {(() => { const n = PROGRESS_STEPS.indexOf(current) + 1; return n > 0 && <p style={sLabel}>Step {n} of {PROGRESS_STEPS.length}</p>; })()}
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", marginTop: "4px", lineHeight: 1.2 }}>
                Any diagnosed conditions?
              </h2>
              <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px", lineHeight: 1.5 }}>
                Select all that apply — this helps us personalize your plan. You can change this any time from Profile.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map((c) => {
                const on = conditions.includes(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      setConditions((cur) => {
                        // Toggling any real condition deselects 'None of the above'.
                        const cleaned = cur.filter((x) => x !== NONE_KEY);
                        if (cleaned.includes(c.key)) return cleaned.filter((x) => x !== c.key);
                        return [...cleaned, c.key];
                      });
                    }}
                    aria-pressed={on}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: on ? "1px solid #8FAF8F" : "1px solid #3A2C1A",
                      background: on ? "#8FAF8F" : "#F4EDDB",
                      color: on ? "#FFFFFF" : "#3A2C1A",
                      transition: "background 120ms, color 120ms, border-color 120ms",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
              {(() => {
                const on = conditions.includes(NONE_KEY);
                return (
                  <button
                    key={NONE_KEY}
                    type="button"
                    onClick={() => {
                      // 'None of the above' wipes all other selections.
                      setConditions((cur) => (cur.includes(NONE_KEY) ? [] : [NONE_KEY]));
                    }}
                    aria-pressed={on}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 600,
                      fontStyle: "italic",
                      cursor: "pointer",
                      border: on ? "1px solid #8FAF8F" : "1px dashed #3A2C1A",
                      background: on ? "#8FAF8F" : "transparent",
                      color: on ? "#FFFFFF" : "#3A2C1A",
                      transition: "background 120ms, color 120ms, border-color 120ms",
                    }}
                  >
                    None of the above
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {current === "assistant_intro" && (
          <div className="w-full space-y-6 text-center">
            {showVoice && (
              <GuideVoiceMode
                guideName={assistantName || "Guide"}
                voiceId="shimmer"
                instructions={`You are ${assistantName || "Guide"}, a warm wellness assistant for FemWell. The user has just completed onboarding. Greet them warmly, then ask ONE question only: what they want to focus on first. Give a short answer of no more than two sentences, then say you will start them on their Today page with a plan. Keep the entire conversation under 60 seconds. Do not ask follow-up questions.`}
                onClose={() => {
                  clearTimeout(voiceTimerRef.current);
                  setShowVoice(false);
                  setStep(s => s + 1);
                }}
              />
            )}
            {!showVoice && (
              <>
                <div style={{ width: 72, height: 72, borderRadius: 9999, margin: "0 auto", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "var(--rose-dust)" }}>{(assistantName || "G")[0].toUpperCase()}</span>
                </div>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", lineHeight: 1.2 }}>Meet {assistantName || "your assistant"}</h2>
                  <p style={{ fontSize: "14px", color: "var(--mauve)", marginTop: 8, lineHeight: 1.6 }}>Turn your volume up. We will do a short one minute check-in.</p>
                </div>
                {micDenied && (
                  <div style={{ ...card, padding: "14px 16px" }}>
                    <p style={{ fontSize: 13, color: "var(--plum)", }}>Microphone permission is needed for voice. You can continue without it.</p>
                  </div>
                )}
                <button
                  className="btn-primary w-full"
                  onClick={async () => {
                    setMicDenied(false);
                    try {
                      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
                      s.getTracks().forEach(t => t.stop());
                    } catch {
                      setMicDenied(true);
                      return;
                    }
                    setShowVoice(true);
                    voiceTimerRef.current = setTimeout(() => {
                      setShowVoice(false);
                      setStep(prev => prev + 1);
                    }, 60000);
                  }}
                >
                  Start
                </button>
                <p style={{ fontSize: 11, color: "var(--mauve)", }}>Microphone permission is required for voice.</p>
                <button
                  onClick={() => setStep(s => s + 1)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--mauve)", textDecoration: "underline" }}
                >
                  Skip
                </button>
              </>
            )}
          </div>
        )}

        {current === "done" && (
          <div className="space-y-6 text-center w-full">
            <div style={{ width: 72, height: 72, borderRadius: 9999, margin: "0 auto", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "var(--rose-dust)" }}>F</span>
            </div>
            <div>
              <h2 style={{ fontSize: "26px", fontWeight: 700, color: "var(--plum)", lineHeight: 1.1 }}>You're all set</h2>
              <p style={{ fontSize: "14px", color: "var(--mauve)", marginTop: 8, lineHeight: 1.6 }}>
                {assistantName || "Guide"} is ready to support you. Your feed, guidance, and daily rhythm are now tuned to you.
              </p>
            </div>
            {/* Connectivity §6.9 — a Tier-0 day-one belonging signal (count-free, opt-in). */}
            <div style={{ ...card, padding: "16px", textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", marginBottom: 6 }}>You're not doing this alone</p>
              <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.6 }}>
                There's a Community of women in your season here whenever you want it — anonymous, 18+, no names. Anything you share is private and on your terms; you decide what (if anything) you ever say.
              </p>
            </div>

            <div style={{ ...card, padding: "16px", textAlign: "left", background: "var(--rose-dust-subtle)", borderColor: "var(--rose-dust-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", }}>Meet {assistantName || "Guide"}</p>
              </div>
              <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.6, }}>Your personal wellness guide is waiting on the Today page. Tap the orb any time to ask for help, get phase insights, or just talk.</p>
            </div>
            <button className="btn-primary w-full" onClick={handleFinish} disabled={saving}
              style={{ fontSize: 16, padding: "16px" }}>
              {saving ? "Setting up..." : "Start your journey →"}
            </button>
            {saveError && <p style={{ fontSize: 13, color: "var(--rose-dust)", marginTop: 8 }}>Something went wrong. Please try again.</p>}
          </div>
        )}

      </div>

      {step > 0 && !(["assistant_intro", "done", "welcome", "cycle_basics"].includes(current)) && (
        <div style={{ display: "flex", gap: "12px", padding: "0 24px 40px", maxWidth: "448px", width: "100%", margin: "0 auto" }}>
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={() => setStep(s => s + 1)}
            className="btn-primary flex-1"
            disabled={
              (current === "goals" && goals.length === 0) ||
              (current === "interests" && interests.length === 0) ||
              (current === "conditions" && conditions.length === 0)
            }>
            Continue <ChevronRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}