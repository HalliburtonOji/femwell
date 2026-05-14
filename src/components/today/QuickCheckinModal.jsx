import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";

const MOOD_EMOJIS = ["😞", "😕", "😐", "🙂", "😊"];
const ENERGY_EMOJIS = ["🔋", "⚡", "⚡⚡", "⚡⚡⚡", "⚡⚡⚡⚡"];

function EmojiScale({ label, value, onChange, emojis }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{label}</p>
        <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{value}/5</span>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        {emojis.map((emoji, i) => (
          <button key={i} type="button" onClick={() => onChange(i + 1)}
            style={{
              flex: 1, height: 44, borderRadius: 12, border: "none", cursor: "pointer",
              fontSize: value === i + 1 ? 22 : 18,
              backgroundColor: value === i + 1 ? "var(--rose-dust-subtle)" : "var(--ivory-dark)",
              outline: value === i + 1 ? "2px solid var(--rose-dust)" : "none",
              transition: "all 0.15s",
            }}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chip({ label, selected, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      style={{ borderRadius: 9999, padding: "7px 14px", fontSize: 12, fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.15s", border: selected ? "1.5px solid var(--plum)" : "1.5px solid var(--border)", backgroundColor: selected ? "var(--plum)" : "var(--ivory-dark)", color: selected ? "white" : "var(--plum)" }}>
      {label}
    </button>
  );
}

function useSingle(initial) {
  const [val, setVal] = useState(initial ?? null);
  const toggle = (v) => setVal(prev => prev === v ? null : v);
  return [val, toggle];
}

function useMulti(initial) {
  const [vals, setVals] = useState(Array.isArray(initial) ? initial : []);
  const toggle = (v) => setVals(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  return [vals, toggle];
}

function getCompletionStatus(existing) {
  if (!existing) return null;
  const hasDeep = !!(existing.pain != null || existing.bloating != null || existing.cramps != null || existing.cervical_mucus || existing.exercise_done != null || existing.notes);
  if (hasDeep) return "full";
  if (existing.mood != null || existing.energy != null) return "quick";
  return null;
}

export default function QuickCheckinModal({ existing, onClose, onSave, userId, dateStr }) {
  const init = existing || {};
  const todayDs = dateStr || new Date().toISOString().split("T")[0];

  // Step 1 fields
  const [mood, setMood] = useState(init.mood ?? 3);
  const [energy, setEnergy] = useState(init.energy ?? 3);
  const [sleep, setSleep] = useState(init.sleep_hours ?? 7);
  const [stress, setStress] = useState(init.stress ?? 2);
  const [step1Saving, setStep1Saving] = useState(false);
  const [step1Saved, setStep1Saved] = useState(!!existing);

  // Step 2 state
  const [deepOpen, setDeepOpen] = useState(false);
  const [pain, setPain] = useState(init.pain ?? 1);
  const [bloating, setBloating] = useState(init.bloating ?? 1);
  const [cramps, setCramps] = useState(init.cramps ?? 1);
  const [headache, setHeadache] = useState(init.headache ?? 1);
  const [breastTenderness, setBreastTenderness] = useState(init.breast_tenderness ?? 1);
  const [bodyTempFeel, toggleBodyTempFeel] = useSingle(init.body_temp_feel);
  const [hydrationGlasses, setHydrationGlasses] = useState(init.hydration_glasses ?? 6);
  const [exerciseDone, setExerciseDone] = useState(init.exercise_done ?? false);
  const [exerciseType, setExerciseType] = useState(init.exercise_type ?? "");
  const [exerciseMinutes, setExerciseMinutes] = useState(init.exercise_minutes ?? 30);
  const [exerciseIntensity, toggleExerciseIntensity] = useSingle(init.exercise_intensity);
  const [cervicalMucus, toggleCervicalMucus] = useSingle(init.cervical_mucus);
  const [libido, setLibido] = useState(init.libido ?? 3);
  const [skin, setSkin] = useState(init.skin ?? 3);
  const [digestion, setDigestion] = useState(init.digestion ?? 3);
  const [focus, setFocus] = useState(init.focus ?? 3);
  const [socialConnection, setSocialConnection] = useState(init.social_connection ?? 3);
  const [appetite, toggleAppetite] = useSingle(init.appetite);
  const [notes, setNotes] = useState(init.notes ?? "");
  const autoSaveTimer = useRef(null);
  const deepDataRef = useRef({});

  // Keep deep data ref in sync for autosave
  useEffect(() => {
    deepDataRef.current = { pain, bloating, cramps, headache, breast_tenderness: breastTenderness, body_temp_feel: bodyTempFeel, hydration_glasses: hydrationGlasses, exercise_done: exerciseDone, exercise_type: exerciseType, exercise_minutes: exerciseMinutes, exercise_intensity: exerciseIntensity, cervical_mucus: cervicalMucus, libido, skin, digestion, focus, social_connection: socialConnection, appetite, notes };
  });

  const buildPayload = (extras = {}) => ({
    user_id: userId, date: todayDs, mood, energy, sleep_hours: sleep, stress, ...extras,
  });

  const saveStep1 = async () => {
    setStep1Saving(true);
    const payload = buildPayload();
    await onSave(payload);
    // Sync hydration
    if (hydrationGlasses > 0) {
      base44.entities.HydrationLog.create({ user_id: userId, day_key: todayDs, amount_ml: hydrationGlasses * 250, logged_at: new Date().toISOString(), source: "checkin" }).catch(() => {});
    }
    setStep1Saving(false);
    setStep1Saved(true);
  };

  const autoSaveDeep = () => {
    if (!step1Saved && !existing) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const payload = buildPayload(deepDataRef.current);
      await onSave(payload).catch(() => {});
    }, 800);
  };

  useEffect(() => { if (deepOpen) autoSaveDeep(); }, [pain, bloating, cramps, headache, breastTenderness, bodyTempFeel, hydrationGlasses, exerciseDone, exerciseType, exerciseMinutes, exerciseIntensity, cervicalMucus, libido, skin, digestion, focus, socialConnection, appetite, notes]);

  const completionStatus = getCompletionStatus(existing);

  const sliderStyle = { width: "100%", accentColor: "var(--rose-dust)", marginTop: 6 };
  const fieldLabel = { fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "space-between", marginBottom: 4 };

  return (
    <>
      <style>{`
        .qci-sheet { animation: qci-up 0.28s cubic-bezier(0.32,0.72,0,1) forwards; }
        @keyframes qci-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .qci-scroll::-webkit-scrollbar { display: none; }
        .qci-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(4px)" }} />

      <div className="qci-sheet" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", boxShadow: "var(--shadow-lg)", maxHeight: "calc(92svh - env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: "12px 20px 0" }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--plum)", fontWeight: 600, margin: 0 }}>
                How are you today?
              </h2>
              {completionStatus && (
                <span style={{ fontSize: 11, color: completionStatus === "full" ? "var(--sage)" : "var(--rose-dust)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  {completionStatus === "full" ? "✓ Full check-in done" : "✓ Quick check-in done"}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 9999, border: "none", backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <div style={{ height: 1, backgroundColor: "var(--border-subtle)" }} />
        </div>

        {/* Scrollable body */}
        <div className="qci-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>

          {/* Step 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
            <EmojiScale label="Mood" value={mood} onChange={setMood} emojis={MOOD_EMOJIS} />
            <EmojiScale label="Energy" value={energy} onChange={setEnergy} emojis={ENERGY_EMOJIS} />

            <div>
              <div style={fieldLabel}>
                <span>Sleep hours</span>
                <span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{sleep}h</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button type="button" onClick={() => setSleep(v => Math.max(0, v - 0.5))}
                  style={{ width: 32, height: 32, borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--ivory-dark)", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>−</button>
                <input type="range" min={0} max={12} step={0.5} value={sleep} onChange={e => setSleep(Number(e.target.value))} style={sliderStyle} />
                <button type="button" onClick={() => setSleep(v => Math.min(12, v + 0.5))}
                  style={{ width: 32, height: 32, borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--ivory-dark)", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
            </div>

            <div>
              <div style={fieldLabel}>
                <span>Stress</span>
                <span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{stress}/5</span>
              </div>
              <input type="range" min={1} max={5} value={stress} onChange={e => setStress(Number(e.target.value))} style={sliderStyle} />
            </div>
          </div>

          {/* Save step 1 button */}
          {!step1Saved && (
            <button onClick={saveStep1} disabled={step1Saving}
              style={{ width: "100%", height: 48, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: step1Saving ? "default" : "pointer", opacity: step1Saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {step1Saving && <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
              {step1Saving ? "Saving..." : "Save quick check-in"}
            </button>
          )}

          {/* Step 2 toggle */}
          <button type="button" onClick={() => setDeepOpen(v => !v)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 16, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", cursor: "pointer", marginBottom: deepOpen ? 0 : 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Add more detail ↓</span>
            {deepOpen ? <ChevronUp className="w-4 h-4" style={{ color: "var(--mauve)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--mauve)" }} />}
          </button>

          {/* Step 2 deep dive */}
          {deepOpen && (
            <div style={{ paddingTop: 16, paddingBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>Physical</p>

              {[["Pain level", pain, setPain], ["Bloating", bloating, setBloating], ["Cramps", cramps, setCramps], ["Headache", headache, setHeadache], ["Breast tenderness", breastTenderness, setBreastTenderness]].map(([lbl, val, set]) => (
                <div key={lbl} style={{ marginBottom: 14 }}>
                  <div style={fieldLabel}><span>{lbl}</span><span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{val}/5</span></div>
                  <input type="range" min={1} max={5} value={val} onChange={e => set(Number(e.target.value))} style={sliderStyle} />
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <p style={{ ...fieldLabel, marginBottom: 8 }}><span>Body temperature feel</span></p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["cold","normal","warm","hot_flashes"].map(v => <Chip key={v} label={v.replace("_"," ")} selected={bodyTempFeel === v} onToggle={() => toggleBodyTempFeel(v)} />)}
                </div>
              </div>

              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif", marginBottom: 14, marginTop: 20 }}>Wellness</p>

              <div style={{ marginBottom: 14 }}>
                <div style={fieldLabel}><span>Hydration glasses</span><span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{hydrationGlasses}</span></div>
                <input type="range" min={0} max={15} value={hydrationGlasses} onChange={e => setHydrationGlasses(Number(e.target.value))} style={sliderStyle} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <p style={{ ...fieldLabel, marginBottom: 8 }}><span>Exercise</span></p>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button type="button" onClick={() => setExerciseDone(false)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: !exerciseDone ? "2px solid var(--plum)" : "1px solid var(--border)", backgroundColor: !exerciseDone ? "var(--plum)" : "var(--ivory-dark)", color: !exerciseDone ? "white" : "var(--mauve)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Rest day</button>
                  <button type="button" onClick={() => setExerciseDone(true)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: exerciseDone ? "2px solid var(--rose-dust)" : "1px solid var(--border)", backgroundColor: exerciseDone ? "var(--rose-dust-subtle)" : "var(--ivory-dark)", color: exerciseDone ? "var(--rose-dust)" : "var(--mauve)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Exercised</button>
                </div>
                {exerciseDone && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input type="text" value={exerciseType} onChange={e => setExerciseType(e.target.value)} placeholder="Type (e.g. yoga, run)" style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none" }} />
                    <div style={fieldLabel}><span>Minutes</span><span style={{ color: "var(--rose-dust)" }}>{exerciseMinutes} min</span></div>
                    <input type="range" min={5} max={120} step={5} value={exerciseMinutes} onChange={e => setExerciseMinutes(Number(e.target.value))} style={sliderStyle} />
                    <div style={{ display: "flex", gap: 6 }}>
                      {["light","moderate","intense"].map(v => <Chip key={v} label={v} selected={exerciseIntensity === v} onToggle={() => toggleExerciseIntensity(v)} />)}
                    </div>
                  </div>
                )}
              </div>

              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif", marginBottom: 14, marginTop: 20 }}>Hormonal</p>

              <div style={{ marginBottom: 14 }}>
                <p style={{ ...fieldLabel, marginBottom: 8 }}><span>Cervical mucus</span></p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["dry","sticky","creamy","watery","egg_white"].map(v => <Chip key={v} label={v.replace("_"," ")} selected={cervicalMucus === v} onToggle={() => toggleCervicalMucus(v)} />)}
                </div>
              </div>

              {[["Libido", libido, setLibido], ["Skin", skin, setSkin], ["Digestion", digestion, setDigestion]].map(([lbl, val, set]) => (
                <div key={lbl} style={{ marginBottom: 14 }}>
                  <div style={fieldLabel}><span>{lbl}</span><span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{val}/5</span></div>
                  <input type="range" min={1} max={5} value={val} onChange={e => set(Number(e.target.value))} style={sliderStyle} />
                </div>
              ))}

              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif", marginBottom: 14, marginTop: 20 }}>Mental</p>

              {[["Focus", focus, setFocus], ["Social connection", socialConnection, setSocialConnection]].map(([lbl, val, set]) => (
                <div key={lbl} style={{ marginBottom: 14 }}>
                  <div style={fieldLabel}><span>{lbl}</span><span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{val}/5</span></div>
                  <input type="range" min={1} max={5} value={val} onChange={e => set(Number(e.target.value))} style={sliderStyle} />
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <p style={{ ...fieldLabel, marginBottom: 8 }}><span>Appetite</span></p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["low","normal","high","cravings"].map(v => <Chip key={v} label={v} selected={appetite === v} onToggle={() => toggleAppetite(v)} />)}
                </div>
              </div>

              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif", marginBottom: 8, marginTop: 20 }}>Notes</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else on your mind today?"
                rows={3} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />

              <p style={{ fontSize: 11, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>Auto-saving as you type</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: "12px 20px 28px", borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={onClose}
            style={{ width: "100%", height: 48, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", color: "var(--plum)", border: "1.5px solid var(--border)", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
            Done
          </button>
        </div>

      </div>
    </>
  );
}