import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "../lifestages/SupportMetricSlider";
import { useScrollLock } from "@/utils/useScrollLock";

// ── Slider row ────────────────────────────────────────────────────────────────
function SliderRow({ label, value, onChange, min = 1, max = 5, unit = "/5" }) {
  return (
    <div>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span>{label}</span>
        <span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{value}{unit}</span>
      </label>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function Chip({ label, selected, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      style={{ borderRadius: "9999px", padding: "8px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s", border: selected ? "1.5px solid var(--plum)" : "1.5px solid var(--border)", backgroundColor: selected ? "var(--plum)" : "var(--ivory-dark)", color: selected ? "white" : "var(--plum)" }}>
      {label}
    </button>
  );
}

function ChipSection({ title, children }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>{title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{children}</div>
    </div>
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

// ── Drink data (mirrors NutritionTodayTab) ────────────────────────────────────
const DRINK_TYPES = [
  { id: "water",      label: "Water",      ml: 250 },
  { id: "coffee",     label: "Coffee",     ml: 240 },
  { id: "tea",        label: "Tea",        ml: 240 },
  { id: "soft_drink", label: "Soft drink", ml: 330 },
  { id: "juice",      label: "Juice",      ml: 250 },
  { id: "alcohol",    label: "Alcohol",    ml: 250 },
  { id: "smoothie",   label: "Smoothie",   ml: 300 },
  { id: "milk",       label: "Milk",       ml: 200 },
];
const DRINK_CALS = { water: 0, coffee: 5, tea: 2, soft_drink: 140, juice: 110, alcohol: 180, smoothie: 200, milk: 120 };

const TABS = [
  { id: "cycle",      label: "Cycle"       },
  { id: "body",       label: "Body"        },
  { id: "skin",       label: "Skin & Hair" },
  { id: "lifestyle",  label: "Lifestyle"   },
  { id: "vitals",     label: "Vitals"      },
  { id: "nutrition",  label: "Nutrition"   },
  { id: "pregnancy",  label: "Pregnancy"   },
  { id: "menopause",  label: "Menopause"   },
];

const CHECKIN_TABS = new Set(["cycle", "body", "skin", "lifestyle", "vitals"]);

const inp = { border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", width: "100%", boxSizing: "border-box" };

export default function CheckinModal({ existing, onClose, onSave, userId, dateStr, initialTab }) {
  const init = existing || {};
  const todayDs = dateStr || new Date().toISOString().split("T")[0];

  // Lock the background page while this modal is open (no scroll-bleed). The
  // modal only mounts when it's shown, so the lock is always active here.
  useScrollLock(true);

  // ── Checkin state ──────────────────────────────────────────────────────────
  const [periodFlow, togglePeriodFlow]           = useSingle(init.period_flow);
  const [periodEvents, togglePeriodEvents]       = useMulti(init.period_events);
  const [moodTags, toggleMoodTags]               = useMulti(init.mood_tags);
  const [symptoms, toggleSymptoms]               = useMulti(init.symptoms);
  const [discharge, toggleDischarge]             = useSingle(init.discharge);
  const [sexTags, toggleSexTags]                 = useMulti(init.sex_tags);
  const [activityTags, toggleActivityTags]       = useMulti(init.activity_tags);
  const [sleepQualityTag, toggleSleepQualityTag] = useSingle(init.sleep_quality_tag);
  const [digestionTags, toggleDigestionTags]     = useMulti(init.digestion_tags);
  const [skinCondition, toggleSkinCondition]     = useSingle(init.skin_condition);
  const [hairShedding, toggleHairShedding]       = useSingle(init.hair_shedding);
  const [medsTags, toggleMedsTags]               = useMulti(init.meds_tags);
  const [otherTags, toggleOtherTags]             = useMulti(init.other_tags);
  const [mood, setMood]     = useState(init.mood ?? 3);
  const [energy, setEnergy] = useState(init.energy ?? 3);
  const [stress, setStress] = useState(init.stress ?? 2);
  const [focus, setFocus]   = useState(init.focus ?? 3);
  const [sleep, setSleep]   = useState(init.sleep_hours ?? 7);
  const [pain, setPain]     = useState(init.pain ?? 1);
  const [cramps, setCramps] = useState(init.cramps ?? 1);
  const [notes, setNotes]   = useState(init.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || "cycle");

  // ── Nutrition tab state ────────────────────────────────────────────────────
  const [mealType, setMealType]   = useState("lunch");
  const [mealText, setMealText]   = useState("");
  const [mealSaved, setMealSaved] = useState(false);
  const [mealError, setMealError] = useState(false);
  const [waterError, setWaterError] = useState(false);
  const [waterSaved, setWaterSaved] = useState(null);
  // Drinks
  const [drinkLogs, setDrinkLogs]       = useState([]);
  const [drinkLoaded, setDrinkLoaded]   = useState(false);
  const [showCustomDrink, setShowCustomDrink] = useState(false);
  const [customDrinkName, setCustomDrinkName] = useState("");
  const [customDrinkMl, setCustomDrinkMl]     = useState(250);
  const [customDrinkCals, setCustomDrinkCals] = useState(0);
  const [loggingDrink, setLoggingDrink]       = useState(false);
  const [drinkSaved, setDrinkSaved]           = useState(false);

  // ── Life stage tab state ───────────────────────────────────────────────────
  const [lsLoaded, setLsLoaded]       = useState(false);
  const [lsLoading, setLsLoading]     = useState(false);
  const [pregProfile, setPregProfile] = useState(null);
  const [menoProfile, setMenoProfile] = useState(null);
  const [existingPregLogId, setExistingPregLogId] = useState(null);
  const [existingMenoLogId, setExistingMenoLogId] = useState(null);
  // Pregnancy form
  const [pregEnergy, setPregEnergy]             = useState(3);
  const [pregMood, setPregMood]                 = useState(3);
  const [pregSleepQuality, setPregSleepQuality] = useState(3);
  const [pregNausea, setPregNausea]             = useState(1);
  const [pregPelvicPain, setPregPelvicPain]     = useState(1);
  const [pregSwelling, setPregSwelling]         = useState(1);
  const [pregNotes, setPregNotes]               = useState("");
  const [pregSaving, setPregSaving]             = useState(false);
  const [pregSaved, setPregSaved]               = useState(false);
  // Menopause form
  const [menoHotFlashes, setMenoHotFlashes]     = useState(1);
  const [menoNightSweats, setMenoNightSweats]   = useState(1);
  const [menoSleepQuality, setMenoSleepQuality] = useState(3);
  const [menoMood, setMenoMood]                 = useState(3);
  const [menoEnergy, setMenoEnergy]             = useState(3);
  const [menoNotes, setMenoNotes]               = useState("");
  const [menoSaving, setMenoSaving]             = useState(false);
  const [menoSaved, setMenoSaved]               = useState(false);
  const [pregError, setPregError]               = useState(false);
  const [menoError, setMenoError]               = useState(false);

  // Load life stage data when pregnancy or menopause tab opens
  useEffect(() => {
    if (!["pregnancy", "menopause"].includes(activeTab) || lsLoaded || !userId) return;
    setLsLoading(true);
    (async () => {
      try {
        const [pregProfiles, menoProfiles, pregLogs, menoLogs] = await Promise.all([
          base44.entities.PregnancyProfile.filter({ user_id: userId }),
          base44.entities.MenopauseProfile.filter({ user_id: userId }),
          base44.entities.PregnancyDailyLog.filter({ user_id: userId }, "-date", 30),
          base44.entities.MenopauseDailyLog.filter({ user_id: userId }, "-date", 30),
        ]);
        setPregProfile(pregProfiles[0] || null);
        setMenoProfile(menoProfiles[0] || null);
        const todayPregLog = pregLogs.find(l => l.date === todayDs);
        if (todayPregLog) {
          setExistingPregLogId(todayPregLog.id);
          if (todayPregLog.energy)        setPregEnergy(todayPregLog.energy);
          if (todayPregLog.mood)          setPregMood(todayPregLog.mood);
          if (todayPregLog.sleep_quality) setPregSleepQuality(todayPregLog.sleep_quality);
          if (todayPregLog.nausea)        setPregNausea(todayPregLog.nausea);
          if (todayPregLog.pelvic_pain)   setPregPelvicPain(todayPregLog.pelvic_pain);
          if (todayPregLog.swelling)      setPregSwelling(todayPregLog.swelling);
          if (todayPregLog.notes)         setPregNotes(todayPregLog.notes);
        }
        const todayMenoLog = menoLogs.find(l => l.date === todayDs);
        if (todayMenoLog) {
          setExistingMenoLogId(todayMenoLog.id);
          if (todayMenoLog.hot_flashes)   setMenoHotFlashes(todayMenoLog.hot_flashes);
          if (todayMenoLog.night_sweats)  setMenoNightSweats(todayMenoLog.night_sweats);
          if (todayMenoLog.sleep_quality) setMenoSleepQuality(todayMenoLog.sleep_quality);
          if (todayMenoLog.mood)          setMenoMood(todayMenoLog.mood);
          if (todayMenoLog.energy)        setMenoEnergy(todayMenoLog.energy);
          if (todayMenoLog.notes)         setMenoNotes(todayMenoLog.notes);
        }
      } catch {}
      setLsLoading(false);
      setLsLoaded(true);
    })();
  }, [activeTab, userId, lsLoaded, todayDs]);

  // Load today's drinks when nutrition tab opens
  useEffect(() => {
    if (activeTab !== "nutrition" || drinkLoaded || !userId) return;
    base44.entities.DrinkLog.filter({ user_id: userId, day_key: todayDs })
      .then(data => { setDrinkLogs(data); setDrinkLoaded(true); })
      .catch(() => setDrinkLoaded(true));
  }, [activeTab, userId, drinkLoaded, todayDs]);

  // ── Save checkin ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveError(false);
    const exerciseDone = activityTags.length > 0 && !activityTags.includes("Didn't exercise");
    const exerciseType = activityTags.filter(t => t !== "Didn't exercise").join(", ");
    const hairSheddingMap = { "Normal shedding": "Normal", "More than usual": "More than usual", "A lot of shedding": "A lot" };
    const hairSheddingVal = hairShedding ? (hairSheddingMap[hairShedding] || hairShedding) : init.hair_shedding;
    const bloating = symptoms.includes("Bloating") ? 3 : init.bloating ?? 1;
    const headache = symptoms.includes("Headache") ? 3 : init.headache ?? 1;
    const breastTenderness = symptoms.includes("Tender breasts") ? 3 : init.breast_tenderness ?? 1;

    try {
      await onSave({
        mood, energy, stress, sleep_hours: sleep, sleep_quality: init.sleep_quality ?? 3,
        focus, pain, cramps, bloating, headache, breast_tenderness: breastTenderness,
        digestion: init.digestion ?? 3, skin: init.skin ?? 3,
        libido: sexTags.includes("High sex drive") ? 5 : sexTags.includes("Low sex drive") ? 1 : init.libido ?? 3,
        social_connection: init.social_connection ?? 3, hydration_glasses: init.hydration_glasses ?? 6,
        exercise_done: exerciseDone, exercise_type: exerciseDone ? exerciseType : undefined,
        exercise_minutes: init.exercise_minutes ?? undefined, exercise_intensity: init.exercise_intensity ?? undefined,
        appetite: init.appetite ?? null, body_temp_feel: init.body_temp_feel ?? null,
        cervical_mucus: discharge || init.cervical_mucus || null,
        skin_condition: skinCondition, breakout_location: init.breakout_location ?? [],
        hair_shedding: hairSheddingVal, scalp_condition: init.scalp_condition ?? null,
        notes, period_flow: periodFlow, period_events: periodEvents, mood_tags: moodTags,
        symptoms, discharge, sex_tags: sexTags, activity_tags: activityTags,
        sleep_quality_tag: sleepQualityTag, digestion_tags: digestionTags,
        meds_tags: medsTags, other_tags: otherTags,
      });
      setSaving(false);
      onClose();
    } catch {
      setSaving(false);
      setSaveError(true);
    }
  };

  // ── Nutrition helpers ──────────────────────────────────────────────────────
  const logMeal = async () => {
    if (!mealText.trim() || !userId) return;
    setMealError(false);
    try {
      const log = await base44.entities.MealLog.create({
        user_id: userId, day_key: todayDs, logged_at: new Date().toISOString(),
        meal_type: mealType, method: "text", raw_text: mealText.trim(), portion_size: "medium",
      });
      base44.functions.invoke("analyzeMeal", { raw_text: log.raw_text }).catch(() => {});
      setMealText("");
      setMealSaved(true);
      setTimeout(() => setMealSaved(false), 2500);
    } catch {
      setMealError(true);
    }
  };

  const logWater = async (ml) => {
    if (!userId) return;
    setWaterError(false);
    try {
      await base44.entities.HydrationLog.create({ user_id: userId, day_key: todayDs, amount_ml: ml, logged_at: new Date().toISOString() });
      setWaterSaved(ml);
      setTimeout(() => setWaterSaved(null), 2000);
    } catch {
      setWaterError(true);
    }
  };

  const logSuggestedDrink = async (typeId) => {
    if (!userId || loggingDrink) return;
    setLoggingDrink(true);
    try {
      const info = DRINK_TYPES.find(d => d.id === typeId);
      const newLog = await base44.entities.DrinkLog.create({
        user_id: userId, day_key: todayDs,
        drink_type: typeId, amount_ml: info?.ml || 250,
        calories: DRINK_CALS[typeId] || 0,
        logged_at: new Date().toISOString(),
      });
      setDrinkLogs(prev => [...prev, newLog]);
      setDrinkSaved(true);
      setTimeout(() => setDrinkSaved(false), 2000);
    } catch {}
    setLoggingDrink(false);
  };

  const logCustomDrink = async () => {
    if (!customDrinkName.trim() || !userId) return;
    setLoggingDrink(true);
    try {
      const newLog = await base44.entities.DrinkLog.create({
        user_id: userId, day_key: todayDs,
        drink_type: customDrinkName.trim(),
        amount_ml: Number(customDrinkMl) || 250,
        calories: Number(customDrinkCals) || 0,
        logged_at: new Date().toISOString(),
      });
      setDrinkLogs(prev => [...prev, newLog]);
      setCustomDrinkName(""); setCustomDrinkMl(250); setCustomDrinkCals(0);
      setShowCustomDrink(false);
      setDrinkSaved(true);
      setTimeout(() => setDrinkSaved(false), 2000);
    } catch {}
    setLoggingDrink(false);
  };

  const deleteDrink = async (id) => {
    await base44.entities.DrinkLog.delete(id).catch(() => {});
    setDrinkLogs(prev => prev.filter(d => d.id !== id));
  };

  // ── Life stage save helpers ────────────────────────────────────────────────
  const savePregLog = async () => {
    if (!userId) return;
    setPregSaving(true);
    setPregError(false);
    const data = { user_id: userId, date: todayDs, energy: pregEnergy, mood: pregMood, sleep_quality: pregSleepQuality, nausea: pregNausea, pelvic_pain: pregPelvicPain, swelling: pregSwelling, notes: pregNotes };
    try {
      if (existingPregLogId) {
        await base44.entities.PregnancyDailyLog.update(existingPregLogId, data);
      } else {
        const created = await base44.entities.PregnancyDailyLog.create(data);
        setExistingPregLogId(created.id);
      }
      setPregSaving(false); setPregSaved(true);
      setTimeout(() => setPregSaved(false), 2500);
    } catch {
      setPregSaving(false); setPregError(true);
    }
  };

  const saveMenoLog = async () => {
    if (!userId) return;
    setMenoSaving(true);
    setMenoError(false);
    const data = { user_id: userId, date: todayDs, hot_flashes: menoHotFlashes, night_sweats: menoNightSweats, sleep_quality: menoSleepQuality, mood: menoMood, energy: menoEnergy, notes: menoNotes };
    try {
      if (existingMenoLogId) {
        await base44.entities.MenopauseDailyLog.update(existingMenoLogId, data);
      } else {
        const created = await base44.entities.MenopauseDailyLog.create(data);
        setExistingMenoLogId(created.id);
      }
      setMenoSaving(false); setMenoSaved(true);
      setTimeout(() => setMenoSaved(false), 2500);
    } catch {
      setMenoSaving(false); setMenoError(true);
    }
  };

  const isCheckinTab = CHECKIN_TABS.has(activeTab);

  return (
    <>
      <style>{`
        .checkin-sheet { animation: sheet-up 0.3s cubic-bezier(0.32,0.72,0,1) forwards; }
        @keyframes sheet-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .checkin-content::-webkit-scrollbar { display: none; }
        .checkin-content { -ms-overflow-style: none; scrollbar-width: none; }
        .checkin-rail::-webkit-scrollbar { display: none; }
        .checkin-rail { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }} />

      <div className="checkin-sheet" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", boxShadow: "var(--shadow-lg)", maxHeight: "calc(90svh - env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: "12px 20px 0" }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)", margin: "0 auto 16px" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <h2 style={{ fontSize: "18px", color: "var(--plum)", fontWeight: 600, margin: 0 }}>Log your day</h2>
              <p style={{ fontSize: "12px", color: "var(--mauve)", marginTop: 4 }}>Tap a section to log.</p>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 9999, border: "none", backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>x</button>
          </div>
          <div style={{ height: 1, backgroundColor: "var(--border-subtle)" }} />
        </div>

        {/* Body: left rail + right content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

          {/* Vertical tab rail */}
          <div className="checkin-rail" style={{ flexShrink: 0, width: 72, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: "10px 5px", display: "flex", flexDirection: "column", gap: 2, borderRight: "1px solid var(--border-subtle)" }}>
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                style={{ width: "100%", padding: "9px 3px", borderRadius: 10, border: "none", backgroundColor: activeTab === t.id ? "var(--plum)" : "transparent", color: activeTab === t.id ? "white" : "var(--mauve)", fontSize: 10, fontWeight: 600, textAlign: "center", cursor: "pointer", lineHeight: 1.3, wordBreak: "break-word", transition: "all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="checkin-content" style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: "16px 16px 8px" }}>

            {/* CYCLE */}
            {activeTab === "cycle" && (<>
              <ChipSection title="Period flow">
                {["No period","Spotting","Light","Medium","Heavy","Very heavy"].map(v => <Chip key={v} label={v} selected={periodFlow === v} onToggle={() => togglePeriodFlow(v)} />)}
              </ChipSection>
              <ChipSection title="Period start / end">
                {["Period started today","Period ended today"].map(v => <Chip key={v} label={v} selected={periodEvents.includes(v)} onToggle={() => togglePeriodEvents(v)} />)}
              </ChipSection>
              <ChipSection title="Mood">
                {["Calm","Happy","Energetic","Frisky","Mood swings","Irritated","Sad","Anxious","Depressed","Feeling guilty","Obsessive thoughts","Low energy","Apathetic","Confused","Very self-critical"].map(v => <Chip key={v} label={v} selected={moodTags.includes(v)} onToggle={() => toggleMoodTags(v)} />)}
              </ChipSection>
              <ChipSection title="Symptoms">
                {["Everything is fine","Cramps","Tender breasts","Headache","Acne","Backache","Fatigue","Cravings","Insomnia","Abdominal pain","Bloating","Nausea","Vaginal dryness","Constipation","Diarrhea"].map(v => <Chip key={v} label={v} selected={symptoms.includes(v)} onToggle={() => toggleSymptoms(v)} />)}
              </ChipSection>
              <ChipSection title="Vaginal discharge">
                {["No discharge","Creamy","Watery","Sticky","Egg white","Spotting","Unusual","Clumpy white","Gray"].map(v => <Chip key={v} label={v} selected={discharge === v} onToggle={() => toggleDischarge(v)} />)}
              </ChipSection>
              <ChipSection title="Sex and sex drive">
                {["Didn't have sex","Protected sex","Unprotected sex","Oral sex","High sex drive","Neutral sex drive","Low sex drive","Sensual touch"].map(v => <Chip key={v} label={v} selected={sexTags.includes(v)} onToggle={() => toggleSexTags(v)} />)}
              </ChipSection>
            </>)}

            {/* BODY */}
            {activeTab === "body" && (<>
              <ChipSection title="Physical activity">
                {["Didn't exercise","Yoga","Gym","Pilates","Running","Swimming","Cycling","Walking","Aerobics","Team sports"].map(v => <Chip key={v} label={v} selected={activityTags.includes(v)} onToggle={() => toggleActivityTags(v)} />)}
              </ChipSection>
              <ChipSection title="Sleep">
                {["Great sleep","Good sleep","Restless sleep","Couldn't sleep"].map(v => <Chip key={v} label={v} selected={sleepQualityTag === v} onToggle={() => toggleSleepQualityTag(v)} />)}
              </ChipSection>
              <ChipSection title="Digestion">
                {["Normal digestion","Bloated","Nausea","Constipation","Diarrhea"].map(v => <Chip key={v} label={v} selected={digestionTags.includes(v)} onToggle={() => toggleDigestionTags(v)} />)}
              </ChipSection>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <SliderRow label="Cramps" value={cramps} onChange={setCramps} />
                <SliderRow label="Pain level" value={pain} onChange={setPain} />
              </div>
            </>)}

            {/* SKIN */}
            {activeTab === "skin" && (<>
              <ChipSection title="Skin">
                {["Clear","Mild breakout","Moderate breakout","Very oily","Very dry"].map(v => <Chip key={v} label={v} selected={skinCondition === v} onToggle={() => toggleSkinCondition(v)} />)}
              </ChipSection>
              <ChipSection title="Hair">
                {["Normal shedding","More than usual","A lot of shedding"].map(v => <Chip key={v} label={v} selected={hairShedding === v} onToggle={() => toggleHairShedding(v)} />)}
              </ChipSection>
              <ChipSection title="Medication and supplements">
                {["Oral contraceptive taken on time","Oral contraceptive missed","Iron supplement","Vitamin D","Magnesium","Other supplement"].map(v => <Chip key={v} label={v} selected={medsTags.includes(v)} onToggle={() => toggleMedsTags(v)} />)}
              </ChipSection>
            </>)}

            {/* LIFESTYLE */}
            {activeTab === "lifestyle" && (<>
              <ChipSection title="Other">
                {["Stress","Meditation","Journaling","Breathing exercises","Kegel exercises","Travel","Alcohol","Disease or injury"].map(v => <Chip key={v} label={v} selected={otherTags.includes(v)} onToggle={() => toggleOtherTags(v)} />)}
              </ChipSection>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>Notes (optional)</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else on your mind today?"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "16px", padding: "12px", fontSize: "14px", color: "var(--plum)", background: "var(--ivory)", minHeight: "80px", resize: "none", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <SliderRow label="Energy" value={energy} onChange={setEnergy} />
                <SliderRow label="Stress" value={stress} onChange={setStress} />
                <SliderRow label="Focus" value={focus} onChange={setFocus} />
              </div>
            </>)}

            {/* VITALS */}
            {activeTab === "vitals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <SliderRow label="Mood" value={mood} onChange={setMood} />
                <SliderRow label="Sleep hours" value={sleep} onChange={setSleep} min={4} max={12} unit="h" />
              </div>
            )}

            {/* NUTRITION */}
            {activeTab === "nutrition" && (
              <div>
                {/* Meal */}
                <div style={{ marginBottom: 22 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Meal</p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    {["breakfast","lunch","dinner","snack"].map(mt => (
                      <button key={mt} onClick={() => setMealType(mt)}
                        style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", textTransform: "capitalize", backgroundColor: mealType === mt ? "var(--plum)" : "var(--ivory-dark)", color: mealType === mt ? "white" : "var(--mauve)" }}>
                        {mt}
                      </button>
                    ))}
                  </div>
                  <textarea value={mealText} onChange={e => setMealText(e.target.value)}
                    placeholder="e.g. oats with banana and almond milk..."
                    rows={2} style={{ ...inp, resize: "none", marginBottom: 8 }} />
                  <button onClick={logMeal} disabled={!mealText.trim()}
                    style={{ padding: "9px 18px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: !mealText.trim() ? "default" : "pointer", opacity: !mealText.trim() ? 0.5 : 1, }}>
                    {mealSaved ? "Logged" : "Log meal"}
                  </button>
                  {mealError && <p style={{ fontSize: 11, color: "var(--rose-dust)", marginTop: 6 }}>Couldn't log meal. Please try again.</p>}
                </div>

                {/* Water */}
                <div style={{ marginBottom: 22 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Water</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[250, 500, 750].map(ml => (
                      <button key={ml} onClick={() => logWater(ml)}
                        style={{ flex: 1, padding: "10px 8px", borderRadius: 12, backgroundColor: waterSaved === ml ? "var(--sage-subtle)" : "var(--ivory-dark)", color: waterSaved === ml ? "var(--sage)" : "var(--plum)", border: `1px solid ${waterSaved === ml ? "var(--sage-light)" : "var(--border)"}`, fontSize: 13, fontWeight: 600, cursor: "pointer", }}>
                        {waterSaved === ml ? "Added" : `+${ml}ml`}
                      </button>
                    ))}
                  </div>
                  {waterError && <p style={{ fontSize: 11, color: "var(--rose-dust)", marginTop: 6 }}>Couldn't log water. Please try again.</p>}
                </div>

                {/* Drinks */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Drinks</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {DRINK_TYPES.map(d => (
                      <button key={d.id} onClick={() => logSuggestedDrink(d.id)} disabled={loggingDrink}
                        style={{ padding: "6px 12px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--ivory-dark)", cursor: loggingDrink ? "default" : "pointer", opacity: loggingDrink ? 0.5 : 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", }}>{d.label}</span>
                        {DRINK_CALS[d.id] > 0 && <span style={{ fontSize: 10, color: "var(--mauve)", marginLeft: 4 }}>~{DRINK_CALS[d.id]} kcal</span>}
                      </button>
                    ))}
                  </div>

                  {/* Custom drink toggle */}
                  <button onClick={() => setShowCustomDrink(v => !v)}
                    style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", marginBottom: showCustomDrink ? 10 : 0 }}>
                    {showCustomDrink ? "Hide custom drink" : "+ Custom drink"}
                  </button>
                  {showCustomDrink && (
                    <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: 12, border: "1px solid var(--border)", marginBottom: 8 }}>
                      <input value={customDrinkName} onChange={e => setCustomDrinkName(e.target.value)} placeholder="Drink name (e.g. matcha latte)" style={{ ...inp, marginBottom: 8 }} />
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 10, color: "var(--mauve)", marginBottom: 4 }}>Size (ml)</p>
                          <input type="number" value={customDrinkMl} onChange={e => setCustomDrinkMl(e.target.value)} style={{ ...inp }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 10, color: "var(--mauve)", marginBottom: 4 }}>Calories</p>
                          <input type="number" value={customDrinkCals} onChange={e => setCustomDrinkCals(e.target.value)} style={{ ...inp }} />
                        </div>
                      </div>
                      <button onClick={logCustomDrink} disabled={!customDrinkName.trim() || loggingDrink}
                        style={{ width: "100%", padding: "9px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: !customDrinkName.trim() ? 0.5 : 1 }}>
                        {loggingDrink ? "Logging..." : "Log drink"}
                      </button>
                    </div>
                  )}

                  {drinkSaved && <p style={{ fontSize: 11, color: "var(--sage)", marginTop: 4 }}>Drink logged</p>}

                  {/* Today's drinks list */}
                  {drinkLogs.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 10, color: "var(--mauve)", marginBottom: 6 }}>Today</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {drinkLogs.map(log => (
                          <div key={log.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--ivory)", borderRadius: 10, padding: "6px 10px" }}>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", textTransform: "capitalize" }}>{log.drink_type.replace(/_/g, " ")}</span>
                              {log.calories > 0 && <span style={{ fontSize: 10, color: "var(--mauve)", marginLeft: 6 }}>{log.calories} kcal</span>}
                              {log.amount_ml && <span style={{ fontSize: 10, color: "var(--mauve)", marginLeft: 6 }}>{log.amount_ml}ml</span>}
                            </div>
                            <button onClick={() => deleteDrink(log.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--mauve)", fontSize: 14, lineHeight: 1 }}>x</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <a href="/Nutrition" onClick={onClose}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--rose-dust)", textDecoration: "none" }}>
                  Open full Nutrition
                </a>
              </div>
            )}

            {/* PREGNANCY */}
            {activeTab === "pregnancy" && (
              <div>
                {lsLoading && (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ width: 20, height: 20, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
                  </div>
                )}
                {!lsLoading && !pregProfile && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ fontSize: 13, color: "var(--mauve)", marginBottom: 16 }}>Set up pregnancy support to log here.</p>
                    <a href="/LifeStageCare" onClick={onClose}
                      style={{ display: "inline-block", padding: "10px 20px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      Set up pregnancy support
                    </a>
                  </div>
                )}
                {!lsLoading && pregProfile && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Pregnancy daily log</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
                      <SupportMetricSlider label="Energy" value={pregEnergy} onChange={setPregEnergy} />
                      <SupportMetricSlider label="Mood" value={pregMood} onChange={setPregMood} />
                      <SupportMetricSlider label="Sleep quality" value={pregSleepQuality} onChange={setPregSleepQuality} />
                      <SupportMetricSlider label="Nausea (1=none, 5=severe)" value={pregNausea} onChange={setPregNausea} />
                      <SupportMetricSlider label="Pelvic discomfort" value={pregPelvicPain} onChange={setPregPelvicPain} />
                      <SupportMetricSlider label="Swelling" value={pregSwelling} onChange={setPregSwelling} />
                    </div>
                    <textarea value={pregNotes} onChange={e => setPregNotes(e.target.value)} placeholder="Notes (optional)"
                      rows={2} style={{ ...inp, resize: "none", marginBottom: 12 }} />
                    <button onClick={savePregLog} disabled={pregSaving}
                      style={{ width: "100%", padding: "11px", borderRadius: 9999, backgroundColor: "var(--rose-dust)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: pregSaving ? 0.6 : 1 }}>
                      {pregSaved ? "Saved" : pregSaving ? "Saving..." : "Save pregnancy log"}
                    </button>
                    {pregError && <p style={{ fontSize: 12, color: "var(--rose-dust)", marginTop: 8 }}>Couldn't save. Please try again.</p>}
                  </div>
                )}
              </div>
            )}

            {/* MENOPAUSE */}
            {activeTab === "menopause" && (
              <div>
                {lsLoading && (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ width: 20, height: 20, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
                  </div>
                )}
                {!lsLoading && !menoProfile && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ fontSize: 13, color: "var(--mauve)", marginBottom: 16 }}>Set up menopause support to log here.</p>
                    <a href="/LifeStageCare" onClick={onClose}
                      style={{ display: "inline-block", padding: "10px 20px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      Set up menopause support
                    </a>
                  </div>
                )}
                {!lsLoading && menoProfile && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Menopause daily log</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
                      <SupportMetricSlider label="Hot flashes (1=none, 5=severe)" value={menoHotFlashes} onChange={setMenoHotFlashes} />
                      <SupportMetricSlider label="Night sweats" value={menoNightSweats} onChange={setMenoNightSweats} />
                      <SupportMetricSlider label="Sleep quality" value={menoSleepQuality} onChange={setMenoSleepQuality} />
                      <SupportMetricSlider label="Mood" value={menoMood} onChange={setMenoMood} />
                      <SupportMetricSlider label="Energy" value={menoEnergy} onChange={setMenoEnergy} />
                    </div>
                    <textarea value={menoNotes} onChange={e => setMenoNotes(e.target.value)} placeholder="Notes (optional)"
                      rows={2} style={{ ...inp, resize: "none", marginBottom: 12 }} />
                    <button onClick={saveMenoLog} disabled={menoSaving}
                      style={{ width: "100%", padding: "11px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: menoSaving ? 0.6 : 1 }}>
                      {menoSaved ? "Saved" : menoSaving ? "Saving..." : "Save menopause log"}
                    </button>
                    {menoError && <p style={{ fontSize: 12, color: "var(--rose-dust)", marginTop: 8 }}>Couldn't save. Please try again.</p>}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="fw-sheet-safe" style={{ flexShrink: 0, padding: "12px 20px 28px", borderTop: "1px solid var(--border-subtle)" }}>
          {isCheckinTab ? (
            <>
              {saveError && (
                <p style={{ fontSize: 12, color: "var(--rose-dust)", textAlign: "center", marginBottom: 8 }}>
                  Couldn't save your check-in. Please try again.
                </p>
              )}
              <button onClick={handleSave} disabled={saving}
                style={{ width: "100%", height: 52, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: "15px", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {saving && <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
                {saving ? "Saving..." : "Save check-in"}
              </button>
            </>
          ) : (
            <button onClick={onClose}
              style={{ width: "100%", height: 52, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", color: "var(--plum)", border: "1.5px solid var(--border)", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
              Done
            </button>
          )}
        </div>

      </div>
    </>
  );
}