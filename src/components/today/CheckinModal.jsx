import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "../lifestages/SupportMetricSlider";

// ── Slider row ───────────────────────────────────────────────────────────────
function SliderRow({ label, value, onChange, min = 1, max = 5, unit = "/5" }) {
  return (
    <div>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span>{label}</span>
        <span style={{ color: "var(--rose-dust)", fontWeight: 700 }}>{value}{unit}</span>
      </label>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

// ── Chip component ───────────────────────────────────────────────────────────
function Chip({ label, selected, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      style={{
        borderRadius: "9999px", padding: "8px 14px", fontSize: "13px",
        fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
        border: selected ? "1.5px solid var(--plum)" : "1.5px solid var(--border)",
        backgroundColor: selected ? "var(--plum)" : "var(--ivory-dark)",
        color: selected ? "white" : "var(--plum)",
      }}>
      {label}
    </button>
  );
}

// ── Chip section ─────────────────────────────────────────────────────────────
function ChipSection({ title, children }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
        {title}
      </p>
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

const TABS = [
  { id: "cycle",      label: "Cycle"      },
  { id: "body",       label: "Body"       },
  { id: "skin",       label: "Skin & Hair"},
  { id: "lifestyle",  label: "Lifestyle"  },
  { id: "vitals",     label: "Vitals"     },
  { id: "nutrition",  label: "Nutrition"  },
  { id: "lifestage",  label: "Life Stage" },
];

const CHECKIN_TABS = new Set(["cycle", "body", "skin", "lifestyle", "vitals"]);

export default function CheckinModal({ existing, onClose, onSave, userId, dateStr }) {
  const init = existing || {};

  // ── Checkin chip / slider state (unchanged) ───────────────────────────────
  const [periodFlow, togglePeriodFlow]         = useSingle(init.period_flow);
  const [periodEvents, togglePeriodEvents]     = useMulti(init.period_events);
  const [moodTags, toggleMoodTags]             = useMulti(init.mood_tags);
  const [symptoms, toggleSymptoms]             = useMulti(init.symptoms);
  const [discharge, toggleDischarge]           = useSingle(init.discharge);
  const [sexTags, toggleSexTags]               = useMulti(init.sex_tags);
  const [activityTags, toggleActivityTags]     = useMulti(init.activity_tags);
  const [sleepQualityTag, toggleSleepQualityTag] = useSingle(init.sleep_quality_tag);
  const [digestionTags, toggleDigestionTags]   = useMulti(init.digestion_tags);
  const [skinCondition, toggleSkinCondition]   = useSingle(init.skin_condition);
  const [hairShedding, toggleHairShedding]     = useSingle(init.hair_shedding);
  const [medsTags, toggleMedsTags]             = useMulti(init.meds_tags);
  const [otherTags, toggleOtherTags]           = useMulti(init.other_tags);
  const [mood, setMood]     = useState(init.mood ?? 3);
  const [energy, setEnergy] = useState(init.energy ?? 3);
  const [stress, setStress] = useState(init.stress ?? 2);
  const [focus, setFocus]   = useState(init.focus ?? 3);
  const [sleep, setSleep]   = useState(init.sleep_hours ?? 7);
  const [pain, setPain]     = useState(init.pain ?? 1);
  const [cramps, setCramps] = useState(init.cramps ?? 1);
  const [notes, setNotes]   = useState(init.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("cycle");

  // ── Nutrition tab state ───────────────────────────────────────────────────
  const [mealType, setMealType] = useState("lunch");
  const [mealText, setMealText]   = useState("");
  const [mealSaved, setMealSaved] = useState(false);
  const [waterSaved, setWaterSaved] = useState(null);

  // ── Life Stage tab state ──────────────────────────────────────────────────
  const [lsLoaded, setLsLoaded]   = useState(false);
  const [lsLoading, setLsLoading] = useState(false);
  const [pregProfile, setPregProfile] = useState(null);
  const [menoProfile, setMenoProfile] = useState(null);
  const [existingPregLogId, setExistingPregLogId] = useState(null);
  const [existingMenoLogId, setExistingMenoLogId] = useState(null);
  const [pregEnergy, setPregEnergy]           = useState(3);
  const [pregMood, setPregMood]               = useState(3);
  const [pregSleepQuality, setPregSleepQuality] = useState(3);
  const [pregNausea, setPregNausea]           = useState(1);
  const [pregPelvicPain, setPregPelvicPain]   = useState(1);
  const [pregSwelling, setPregSwelling]       = useState(1);
  const [pregNotes, setPregNotes]             = useState("");
  const [pregSaving, setPregSaving]           = useState(false);
  const [pregSaved, setPregSaved]             = useState(false);
  const [menoHotFlashes, setMenoHotFlashes]   = useState(1);
  const [menoNightSweats, setMenoNightSweats] = useState(1);
  const [menoSleepQuality, setMenoSleepQuality] = useState(3);
  const [menoMood, setMenoMood]               = useState(3);
  const [menoEnergy, setMenoEnergy]           = useState(3);
  const [menoNotes, setMenoNotes]             = useState("");
  const [menoSaving, setMenoSaving]           = useState(false);
  const [menoSaved, setMenoSaved]             = useState(false);

  // Load life stage profiles + today's logs when tab opens
  useEffect(() => {
    if (activeTab !== "lifestage" || lsLoaded || !userId) return;
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
        const todayDs = dateStr || new Date().toISOString().split("T")[0];
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
  }, [activeTab, userId, lsLoaded, dateStr]);

  // ── Save checkin (unchanged logic) ───────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const exerciseDone = activityTags.length > 0 && !activityTags.includes("Didn't exercise");
    const exerciseType = activityTags.filter(t => t !== "Didn't exercise").join(", ");
    const hairSheddingMap = { "Normal shedding": "Normal", "More than usual": "More than usual", "A lot of shedding": "A lot" };
    const hairSheddingVal = hairShedding ? (hairSheddingMap[hairShedding] || hairShedding) : init.hair_shedding;
    const bloating = symptoms.includes("Bloating") ? 3 : init.bloating ?? 1;
    const headache = symptoms.includes("Headache") ? 3 : init.headache ?? 1;
    const breastTenderness = symptoms.includes("Tender breasts") ? 3 : init.breast_tenderness ?? 1;

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
  };

  // ── Nutrition helpers ─────────────────────────────────────────────────────
  const logMeal = async () => {
    if (!mealText.trim() || !userId) return;
    const todayDs = dateStr || new Date().toISOString().split("T")[0];
    const log = await base44.entities.MealLog.create({
      user_id: userId, day_key: todayDs, logged_at: new Date().toISOString(),
      meal_type: mealType, method: "text", raw_text: mealText.trim(), portion_size: "medium",
    });
    base44.functions.invoke("analyzeMeal", { raw_text: log.raw_text }).catch(() => {});
    setMealText("");
    setMealSaved(true);
    setTimeout(() => setMealSaved(false), 2500);
  };

  const logWater = async (ml) => {
    if (!userId) return;
    const todayDs = dateStr || new Date().toISOString().split("T")[0];
    await base44.entities.HydrationLog.create({ user_id: userId, day_key: todayDs, amount_ml: ml, logged_at: new Date().toISOString() });
    setWaterSaved(ml);
    setTimeout(() => setWaterSaved(null), 2000);
  };

  // ── Life stage save helpers ───────────────────────────────────────────────
  const savePregLog = async () => {
    if (!userId) return;
    setPregSaving(true);
    const todayDs = dateStr || new Date().toISOString().split("T")[0];
    const data = { user_id: userId, date: todayDs, energy: pregEnergy, mood: pregMood, sleep_quality: pregSleepQuality, nausea: pregNausea, pelvic_pain: pregPelvicPain, swelling: pregSwelling, notes: pregNotes };
    if (existingPregLogId) {
      await base44.entities.PregnancyDailyLog.update(existingPregLogId, data);
    } else {
      const created = await base44.entities.PregnancyDailyLog.create(data);
      setExistingPregLogId(created.id);
    }
    setPregSaving(false);
    setPregSaved(true);
    setTimeout(() => setPregSaved(false), 2500);
  };

  const saveMenoLog = async () => {
    if (!userId) return;
    setMenoSaving(true);
    const todayDs = dateStr || new Date().toISOString().split("T")[0];
    const data = { user_id: userId, date: todayDs, hot_flashes: menoHotFlashes, night_sweats: menoNightSweats, sleep_quality: menoSleepQuality, mood: menoMood, energy: menoEnergy, notes: menoNotes };
    if (existingMenoLogId) {
      await base44.entities.MenopauseDailyLog.update(existingMenoLogId, data);
    } else {
      const created = await base44.entities.MenopauseDailyLog.create(data);
      setExistingMenoLogId(created.id);
    }
    setMenoSaving(false);
    setMenoSaved(true);
    setTimeout(() => setMenoSaved(false), 2500);
  };

  const isCheckinTab = CHECKIN_TABS.has(activeTab);

  const inp = { border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <>
      <style>{`
        .checkin-sheet { animation: sheet-up 0.3s cubic-bezier(0.32,0.72,0,1) forwards; }
        @keyframes sheet-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .checkin-content::-webkit-scrollbar { display: none; }
        .checkin-content { -ms-overflow-style: none; scrollbar-width: none; }
        .checkin-rail::-webkit-scrollbar { display: none; }
        .checkin-rail { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Overlay */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }} />

      {/* Sheet */}
      <div className="checkin-sheet" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
        backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0",
        boxShadow: "var(--shadow-lg)", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: "12px 20px 0" }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)", margin: "0 auto 16px" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "var(--plum)", fontWeight: 600, margin: 0 }}>How are you today?</h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--mauve)", marginTop: 4 }}>Log your day from here.</p>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 9999, border: "none", backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>
          <div style={{ height: 1, backgroundColor: "var(--border-subtle)" }} />
        </div>

        {/* Body: left rail + right content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "row" }}>

          {/* Left vertical tab rail */}
          <div className="checkin-rail" style={{ flexShrink: 0, width: 76, overflowY: "auto", padding: "10px 6px", display: "flex", flexDirection: "column", gap: 2, borderRight: "1px solid var(--border-subtle)" }}>
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                style={{
                  width: "100%", padding: "9px 4px", borderRadius: 10, border: "none",
                  backgroundColor: activeTab === t.id ? "var(--plum)" : "transparent",
                  color: activeTab === t.id ? "white" : "var(--mauve)",
                  fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  textAlign: "center", cursor: "pointer", lineHeight: 1.3, wordBreak: "break-word",
                  transition: "all 0.15s",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Right scrollable content */}
          <div className="checkin-content" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>

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

            {/* SKIN & HAIR */}
            {activeTab === "skin" && (<>
              <ChipSection title="Skin">
                {["Clear","Mild breakout","Moderate breakout","Very oily","Very dry"].map(v => <Chip key={v} label={v} selected={skinCondition === v} onToggle={() => toggleSkinCondition(v)} />)}
              </ChipSection>
              <ChipSection title="Hair">
                {["Normal shedding","More than usual","A lot of shedding"].map(v => <Chip key={v} label={v} selected={hairShedding === v} onToggle={() => toggleHairShedding(v)} />)}
              </ChipSection>
              <ChipSection title="Medication and supplements">
                {["Oral contraceptive — taken on time","Oral contraceptive — missed","Iron supplement","Vitamin D","Magnesium","Other supplement"].map(v => <Chip key={v} label={v} selected={medsTags.includes(v)} onToggle={() => toggleMedsTags(v)} />)}
              </ChipSection>
            </>)}

            {/* LIFESTYLE */}
            {activeTab === "lifestyle" && (<>
              <ChipSection title="Other">
                {["Stress","Meditation","Journaling","Breathing exercises","Kegel exercises","Travel","Alcohol","Disease or injury"].map(v => <Chip key={v} label={v} selected={otherTags.includes(v)} onToggle={() => toggleOtherTags(v)} />)}
              </ChipSection>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>Notes (optional)</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else on your mind today?"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "16px", padding: "12px", fontSize: "14px", fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--ivory)", minHeight: "80px", resize: "none", outline: "none", boxSizing: "border-box" }} />
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
                {/* Meal log */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Quick meal log</p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    {["breakfast","lunch","dinner","snack"].map(mt => (
                      <button key={mt} onClick={() => setMealType(mt)}
                        style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize", backgroundColor: mealType === mt ? "var(--plum)" : "var(--ivory-dark)", color: mealType === mt ? "white" : "var(--mauve)" }}>
                        {mt}
                      </button>
                    ))}
                  </div>
                  <textarea value={mealText} onChange={e => setMealText(e.target.value)}
                    placeholder="e.g. oats with banana and almond milk..."
                    rows={2}
                    style={{ ...inp, resize: "none", marginBottom: 8 }} />
                  <button onClick={logMeal} disabled={!mealText.trim()}
                    style={{ padding: "9px 18px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: !mealText.trim() ? "default" : "pointer", opacity: !mealText.trim() ? 0.5 : 1, fontFamily: "'Inter', sans-serif" }}>
                    {mealSaved ? "✓ Logged" : "Log meal"}
                  </button>
                </div>

                {/* Water */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Add water</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[250, 500, 750].map(ml => (
                      <button key={ml} onClick={() => logWater(ml)}
                        style={{ flex: 1, padding: "10px 8px", borderRadius: 12, backgroundColor: waterSaved === ml ? "var(--sage-subtle)" : "var(--ivory-dark)", color: waterSaved === ml ? "var(--sage)" : "var(--plum)", border: `1px solid ${waterSaved === ml ? "var(--sage-light)" : "var(--border)"}`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", minWidth: 60 }}>
                        {waterSaved === ml ? "✓" : `+${ml}ml`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link to full nutrition */}
                <a href="/Nutrition" onClick={onClose}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
                  Open full Nutrition →
                </a>
              </div>
            )}

            {/* LIFE STAGE */}
            {activeTab === "lifestage" && (
              <div>
                {lsLoading && (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ width: 20, height: 20, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                )}

                {!lsLoading && !pregProfile && !menoProfile && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>Set up pregnancy or menopause support to log here.</p>
                    <a href="/LifeStageCare" onClick={onClose}
                      style={{ display: "inline-block", padding: "10px 20px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
                      Set up life stage support
                    </a>
                  </div>
                )}

                {!lsLoading && pregProfile && (
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Pregnancy</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
                      <SupportMetricSlider label="Energy" value={pregEnergy} onChange={setPregEnergy} />
                      <SupportMetricSlider label="Mood" value={pregMood} onChange={setPregMood} />
                      <SupportMetricSlider label="Sleep quality" value={pregSleepQuality} onChange={setPregSleepQuality} />
                      <SupportMetricSlider label="Nausea" value={pregNausea} onChange={setPregNausea} />
                      <SupportMetricSlider label="Pelvic pain" value={pregPelvicPain} onChange={setPregPelvicPain} />
                      <SupportMetricSlider label="Swelling" value={pregSwelling} onChange={setPregSwelling} />
                    </div>
                    <textarea value={pregNotes} onChange={e => setPregNotes(e.target.value)} placeholder="Notes (optional)"
                      rows={2} style={{ ...inp, resize: "none", marginBottom: 10 }} />
                    <button onClick={savePregLog} disabled={pregSaving}
                      style={{ width: "100%", padding: "10px", borderRadius: 9999, backgroundColor: "var(--rose-dust)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: pregSaving ? 0.6 : 1 }}>
                      {pregSaved ? "✓ Saved" : pregSaving ? "Saving..." : "Save pregnancy log"}
                    </button>
                  </div>
                )}

                {!lsLoading && menoProfile && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Menopause</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
                      <SupportMetricSlider label="Hot flashes" value={menoHotFlashes} onChange={setMenoHotFlashes} />
                      <SupportMetricSlider label="Night sweats" value={menoNightSweats} onChange={setMenoNightSweats} />
                      <SupportMetricSlider label="Sleep quality" value={menoSleepQuality} onChange={setMenoSleepQuality} />
                      <SupportMetricSlider label="Mood" value={menoMood} onChange={setMenoMood} />
                      <SupportMetricSlider label="Energy" value={menoEnergy} onChange={setMenoEnergy} />
                    </div>
                    <textarea value={menoNotes} onChange={e => setMenoNotes(e.target.value)} placeholder="Notes (optional)"
                      rows={2} style={{ ...inp, resize: "none", marginBottom: 10 }} />
                    <button onClick={saveMenoLog} disabled={menoSaving}
                      style={{ width: "100%", padding: "10px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: menoSaving ? 0.6 : 1 }}>
                      {menoSaved ? "✓ Saved" : menoSaving ? "Saving..." : "Save menopause log"}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, padding: "12px 20px 28px", borderTop: "1px solid var(--border-subtle)" }}>
          {isCheckinTab ? (
            <button onClick={handleSave} disabled={saving}
              style={{ width: "100%", height: 52, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: "15px", fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: saving ? "default" : "pointer", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {saving && <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
              {saving ? "Saving..." : "Save check-in"}
            </button>
          ) : (
            <button onClick={onClose}
              style={{ width: "100%", height: 52, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", color: "var(--plum)", border: "1.5px solid var(--border)", fontSize: "15px", fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
              Done
            </button>
          )}
        </div>

      </div>
    </>
  );
}