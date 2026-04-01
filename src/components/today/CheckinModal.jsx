import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";

const APPETITE_OPTIONS = ["low", "normal", "high", "cravings"];
const BODY_TEMP_OPTIONS = ["cold", "normal", "warm", "hot_flashes"];
const MUCUS_OPTIONS = ["dry", "sticky", "creamy", "watery", "egg_white"];
const INTENSITY_OPTIONS = ["light", "moderate", "intense"];
const SKIN_CONDITION_OPTIONS = ["Clear", "Mild breakout", "Moderate breakout", "Very oily", "Very dry"];
const BREAKOUT_LOCATION_OPTIONS = ["Chin", "Jaw", "Cheeks", "Forehead", "Nose"];
const HAIR_SHEDDING_OPTIONS = ["Normal", "More than usual", "A lot"];
const SCALP_CONDITION_OPTIONS = ["Normal", "Oily", "Dry/flaky"];

function SliderRow({ label, value, onChange, min = 1, max = 5, unit = "/5" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600 flex justify-between mb-1">
        <span>{label}</span>
        <span className="text-rose-600 font-bold">{value}{unit}</span>
      </label>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function PillSelect({ label, options, value, onChange, formatter }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(value === o ? null : o)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              value === o ? "bg-rose-500 text-white" : "bg-rose-50 text-gray-600 border border-rose-100"
            }`}
          >
            {formatter ? formatter(o) : o.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CheckinModal({ existing, onClose, onSave }) {
  const init = existing || {};
  const [mood, setMood] = useState(init.mood ?? 3);
  const [energy, setEnergy] = useState(init.energy ?? 3);
  const [stress, setStress] = useState(init.stress ?? 2);
  const [sleep, setSleep] = useState(init.sleep_hours ?? 7);
  const [sleepQuality, setSleepQuality] = useState(init.sleep_quality ?? 3);
  const [focus, setFocus] = useState(init.focus ?? 3);
  const [pain, setPain] = useState(init.pain ?? 1);
  const [cramps, setCramps] = useState(init.cramps ?? 1);
  const [bloating, setBloating] = useState(init.bloating ?? 1);
  const [headache, setHeadache] = useState(init.headache ?? 1);
  const [breastTenderness, setBreastTenderness] = useState(init.breast_tenderness ?? 1);
  const [digestion, setDigestion] = useState(init.digestion ?? 3);
  const [skin, setSkin] = useState(init.skin ?? 3);
  const [libido, setLibido] = useState(init.libido ?? 3);
  const [socialConnection, setSocialConnection] = useState(init.social_connection ?? 3);
  const [hydration, setHydration] = useState(init.hydration_glasses ?? 6);
  const [exerciseDone, setExerciseDone] = useState(init.exercise_done ?? false);
  const [exerciseType, setExerciseType] = useState(init.exercise_type ?? "");
  const [exerciseMinutes, setExerciseMinutes] = useState(init.exercise_minutes ?? 30);
  const [exerciseIntensity, setExerciseIntensity] = useState(init.exercise_intensity ?? null);
  const [appetite, setAppetite] = useState(init.appetite ?? null);
  const [bodyTemp, setBodyTemp] = useState(init.body_temp_feel ?? null);
  const [mucus, setMucus] = useState(init.cervical_mucus ?? null);
  const [notes, setNotes] = useState(init.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [showPhysical, setShowPhysical] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showSkinHair, setShowSkinHair] = useState(false);
  const [skinCondition, setSkinCondition] = useState(init.skin_condition ?? null);
  const [breakoutLocation, setBreakoutLocation] = useState(init.breakout_location ?? []);
  const [hairShedding, setHairShedding] = useState(init.hair_shedding ?? null);
  const [scalpCondition, setScalpCondition] = useState(init.scalp_condition ?? null);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      mood, energy, stress, sleep_hours: sleep, sleep_quality: sleepQuality,
      focus, pain, cramps, bloating, headache, breast_tenderness: breastTenderness,
      digestion, skin, libido, social_connection: socialConnection,
      hydration_glasses: hydration,
      exercise_done: exerciseDone,
      exercise_type: exerciseDone ? exerciseType : undefined,
      exercise_minutes: exerciseDone ? exerciseMinutes : undefined,
      exercise_intensity: exerciseDone ? exerciseIntensity : undefined,
      appetite, body_temp_feel: bodyTemp, cervical_mucus: mucus,
      skin_condition: skinCondition,
      breakout_location: breakoutLocation,
      hair_shedding: hairShedding,
      scalp_condition: scalpCondition,
      notes,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col" style={{ maxHeight: "85vh" }}>
        {/* Fixed header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-rose-50 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Daily Check-in</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-7 h-7 flex items-center justify-center">×</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

          {/* Core sliders */}
          <SliderRow emoji="😊" label="Mood" value={mood} onChange={setMood} />
          <SliderRow emoji="⚡" label="Energy" value={energy} onChange={setEnergy} />
          <SliderRow emoji="🌊" label="Stress" value={stress} onChange={setStress} />
          <SliderRow emoji="🎯" label="Focus" value={focus} onChange={setFocus} />
          <SliderRow emoji="💤" label="Sleep hours" value={sleep} onChange={setSleep} min={3} max={12} unit="h" />
          <SliderRow emoji="🌟" label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} />
          <SliderRow emoji="💧" label="Hydration" value={hydration} onChange={setHydration} min={0} max={12} unit=" glasses" />
          <SliderRow emoji="🫀" label="Social connection" value={socialConnection} onChange={setSocialConnection} />

          {/* Exercise */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Exercise today?</p>
              <button
                type="button"
                onClick={() => setExerciseDone(!exerciseDone)}
                className={`w-12 h-6 rounded-full transition-all relative ${exerciseDone ? "bg-rose-500" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${exerciseDone ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
            {exerciseDone && (
              <div className="space-y-3 mt-3">
                <input
                  type="text"
                  placeholder="Type (e.g. yoga, run, gym...)"
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rose-100 bg-rose-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <SliderRow label="Duration" value={exerciseMinutes} onChange={setExerciseMinutes} min={5} max={120} unit=" min" />
                <PillSelect label="Intensity" options={INTENSITY_OPTIONS} value={exerciseIntensity} onChange={setExerciseIntensity} />
              </div>
            )}
          </div>

          <PillSelect label="Appetite" options={APPETITE_OPTIONS} value={appetite} onChange={setAppetite} />

          {/* Physical symptoms — collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowPhysical(!showPhysical)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-600 py-1"
            >
              <span>Physical Symptoms (optional)</span>
              {showPhysical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showPhysical && (
              <div className="space-y-4 mt-3">
                <SliderRow label="Pain level" value={pain} onChange={setPain} />
                <SliderRow label="Cramps" value={cramps} onChange={setCramps} />
                <SliderRow label="Bloating" value={bloating} onChange={setBloating} />
                <SliderRow label="Headache" value={headache} onChange={setHeadache} />
                <SliderRow label="Breast tenderness" value={breastTenderness} onChange={setBreastTenderness} />
                <SliderRow label="Digestion" value={digestion} onChange={setDigestion} />
              </div>
            )}
          </div>

          {/* Body & Cycle signals — collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowBody(!showBody)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-600 py-1"
            >
              <span>Body & Cycle Signals (optional)</span>
              {showBody ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showBody && (
              <div className="space-y-4 mt-3">
                <SliderRow label="Skin" value={skin} onChange={setSkin} />
                <SliderRow label="Libido" value={libido} onChange={setLibido} />
                <PillSelect label="Body temperature feel" options={BODY_TEMP_OPTIONS} value={bodyTemp} onChange={setBodyTemp} formatter={(o) => o.replace(/_/g, " ")} />
                <PillSelect label="Cervical mucus" options={MUCUS_OPTIONS} value={mucus} onChange={setMucus} formatter={(o) => o.replace(/_/g, " ")} />
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowSkinHair(!showSkinHair)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-600 py-1"
            >
              <span>Skin & Hair</span>
              {showSkinHair ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            {showSkinHair && (
              <div className="space-y-4 mt-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">How's your skin today?</p>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_CONDITION_OPTIONS.map((option) => {
                      const selected = skinCondition === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSkinCondition(selected ? null : option)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          style={selected ? { backgroundColor: '#9B7FCC26', border: '1px solid #9B7FCC', color: '#9B7FCC' } : { backgroundColor: '#FFF1F2', border: '1px solid #FFE4E6', color: '#4B5563' }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(skinCondition === 'Mild breakout' || skinCondition === 'Moderate breakout') && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Where?</p>
                    <div className="flex flex-wrap gap-2">
                      {BREAKOUT_LOCATION_OPTIONS.map((option) => {
                        const selected = breakoutLocation.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setBreakoutLocation((prev) => selected ? prev.filter((item) => item !== option) : [...prev, option])}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                            style={selected ? { backgroundColor: '#9B7FCC26', border: '1px solid #9B7FCC', color: '#9B7FCC' } : { backgroundColor: '#FFF1F2', border: '1px solid #FFE4E6', color: '#4B5563' }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <PillSelect label="Hair shedding today?" options={HAIR_SHEDDING_OPTIONS} value={hairShedding} onChange={setHairShedding} />
                <PillSelect label="Scalp?" options={SCALP_CONDITION_OPTIONS} value={scalpCondition} onChange={setScalpCondition} />
              </div>
            )}
          </div>

          <textarea
            placeholder="Any notes? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 text-sm rounded-xl border border-rose-100 bg-rose-50/30 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
            rows={2}
          />
        </div>

        {/* Fixed footer */}
        <div className="px-6 pb-5 pt-3 border-t border-rose-50 flex-shrink-0">
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save Check-in"}
          </button>
        </div>
      </div>
    </div>
  );
}