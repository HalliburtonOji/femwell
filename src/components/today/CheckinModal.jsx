import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <button
      type="button"
      onClick={onToggle}
      style={{
        borderRadius: "9999px",
        padding: "8px 14px",
        fontSize: "13px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        border: selected ? "1.5px solid var(--plum)" : "1.5px solid var(--border)",
        backgroundColor: selected ? "var(--plum)" : "var(--ivory-dark)",
        color: selected ? "white" : "var(--plum)",
      }}
    >
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Single-select helper ─────────────────────────────────────────────────────
function useSingle(initial) {
  const [val, setVal] = useState(initial ?? null);
  const toggle = (v) => setVal(prev => prev === v ? null : v);
  return [val, toggle];
}

// ── Multi-select helper ──────────────────────────────────────────────────────
function useMulti(initial) {
  const [vals, setVals] = useState(Array.isArray(initial) ? initial : []);
  const toggle = (v) => setVals(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  return [vals, toggle];
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CheckinModal({ existing, onClose, onSave }) {
  const init = existing || {};

  // Chip state
  const [periodFlow, togglePeriodFlow] = useSingle(init.period_flow);
  const [periodEvents, togglePeriodEvents] = useMulti(init.period_events);
  const [moodTags, toggleMoodTags] = useMulti(init.mood_tags);
  const [symptoms, toggleSymptoms] = useMulti(init.symptoms);
  const [discharge, toggleDischarge] = useSingle(init.discharge);
  const [sexTags, toggleSexTags] = useMulti(init.sex_tags);
  const [activityTags, toggleActivityTags] = useMulti(init.activity_tags);
  const [sleepQualityTag, toggleSleepQualityTag] = useSingle(init.sleep_quality_tag);
  const [digestionTags, toggleDigestionTags] = useMulti(init.digestion_tags);
  const [skinCondition, toggleSkinCondition] = useSingle(init.skin_condition);
  const [hairShedding, toggleHairShedding] = useSingle(init.hair_shedding);
  const [medsTags, toggleMedsTags] = useMulti(init.meds_tags);
  const [otherTags, toggleOtherTags] = useMulti(init.other_tags);

  // Slider state (legacy fields preserved)
  const [mood, setMood] = useState(init.mood ?? 3);
  const [energy, setEnergy] = useState(init.energy ?? 3);
  const [stress, setStress] = useState(init.stress ?? 2);
  const [focus, setFocus] = useState(init.focus ?? 3);
  const [sleep, setSleep] = useState(init.sleep_hours ?? 7);
  const [pain, setPain] = useState(init.pain ?? 1);
  const [cramps, setCramps] = useState(init.cramps ?? 1);

  // Other legacy fields preserved
  const [notes, setNotes] = useState(init.notes ?? "");
  const [showDetail, setShowDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("cycle");

  const TABS = [
    { id: "cycle",     label: "Cycle"       },
    { id: "body",      label: "Body"        },
    { id: "skin",      label: "Skin & Hair" },
    { id: "lifestyle", label: "Lifestyle"   },
    { id: "vitals",    label: "Vitals"      },
  ];

  const handleSave = async () => {
    setSaving(true);

    // Derive legacy fields from chip selections for backwards compatibility
    const exerciseDone = activityTags.length > 0 && !activityTags.includes("Didn't exercise");
    const exerciseType = activityTags.filter(t => t !== "Didn't exercise").join(", ");
    const skinConditionVal = skinCondition;
    const hairSheddingMap = { "Normal shedding": "Normal", "More than usual": "More than usual", "A lot of shedding": "A lot" };
    const hairSheddingVal = hairShedding ? (hairSheddingMap[hairShedding] || hairShedding) : init.hair_shedding;
    const bloating = symptoms.includes("Bloating") ? 3 : init.bloating ?? 1;
    const headache = symptoms.includes("Headache") ? 3 : init.headache ?? 1;
    const breastTenderness = symptoms.includes("Tender breasts") ? 3 : init.breast_tenderness ?? 1;

    await onSave({
      // Legacy slider fields
      mood,
      energy,
      stress,
      sleep_hours: sleep,
      sleep_quality: init.sleep_quality ?? 3,
      focus,
      pain,
      cramps,
      bloating,
      headache,
      breast_tenderness: breastTenderness,
      digestion: init.digestion ?? 3,
      skin: init.skin ?? 3,
      libido: sexTags.includes("High sex drive") ? 5 : sexTags.includes("Low sex drive") ? 1 : init.libido ?? 3,
      social_connection: init.social_connection ?? 3,
      hydration_glasses: init.hydration_glasses ?? 6,
      exercise_done: exerciseDone,
      exercise_type: exerciseDone ? exerciseType : undefined,
      exercise_minutes: init.exercise_minutes ?? undefined,
      exercise_intensity: init.exercise_intensity ?? undefined,
      appetite: init.appetite ?? null,
      body_temp_feel: init.body_temp_feel ?? null,
      cervical_mucus: discharge || init.cervical_mucus || null,
      skin_condition: skinConditionVal,
      breakout_location: init.breakout_location ?? [],
      hair_shedding: hairSheddingVal,
      scalp_condition: init.scalp_condition ?? null,
      notes,
      // New chip fields
      period_flow: periodFlow,
      period_events: periodEvents,
      mood_tags: moodTags,
      symptoms,
      discharge,
      sex_tags: sexTags,
      activity_tags: activityTags,
      sleep_quality_tag: sleepQualityTag,
      digestion_tags: digestionTags,
      meds_tags: medsTags,
      other_tags: otherTags,
    });

    setSaving(false);
    onClose();
  };

  return (
    <>
      <style>{`
        .checkin-sheet { animation: sheet-up 0.3s cubic-bezier(0.32,0.72,0,1) forwards; }
        @keyframes sheet-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .checkin-body::-webkit-scrollbar { display: none; }
        .checkin-body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }}
      />

      {/* Sheet */}
      <div
        className="checkin-sheet"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 51,
          backgroundColor: "var(--surface)",
          borderRadius: "28px 28px 0 0",
          boxShadow: "var(--shadow-lg)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Fixed header */}
        <div style={{ flexShrink: 0, padding: "12px 20px 0" }}>
          {/* Drag handle */}
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)", margin: "0 auto 16px" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "var(--plum)", fontWeight: 600, margin: 0 }}>
                How are you today?
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "var(--mauve)", marginTop: 4 }}>
                Tap everything that applies — or just what matters today.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 9999, border: "none",
                backgroundColor: "var(--ivory-dark)", color: "var(--mauve)",
                fontSize: "18px", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ height: 1, backgroundColor: "var(--border-subtle)", marginBottom: 0 }} />
        </div>

        {/* Tab pills */}
        <div style={{ flexShrink: 0, padding: "10px 16px 0" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 10 }}>
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: activeTab === t.id ? "var(--plum)" : "var(--ivory-dark)", color: activeTab === t.id ? "white" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {t.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleSave} disabled={saving}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", paddingBottom: 10, paddingLeft: 4 }}>
            Save what I've logged
          </button>
        </div>

        {/* Scrollable body */}
        <div className="checkin-body" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 8px" }}>

          {/* CYCLE TAB */}
          {activeTab === "cycle" && (
            <>
              <ChipSection title="Period flow">
                {["No period","Spotting","Light","Medium","Heavy","Very heavy"].map(v => (
                  <Chip key={v} label={v} selected={periodFlow === v} onToggle={() => togglePeriodFlow(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Period start / end">
                {["Period started today","Period ended today"].map(v => (
                  <Chip key={v} label={v} selected={periodEvents.includes(v)} onToggle={() => togglePeriodEvents(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Mood">
                {["Calm","Happy","Energetic","Frisky","Mood swings","Irritated","Sad","Anxious","Depressed","Feeling guilty","Obsessive thoughts","Low energy","Apathetic","Confused","Very self-critical"].map(v => (
                  <Chip key={v} label={v} selected={moodTags.includes(v)} onToggle={() => toggleMoodTags(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Symptoms">
                {["Everything is fine","Cramps","Tender breasts","Headache","Acne","Backache","Fatigue","Cravings","Insomnia","Abdominal pain","Bloating","Nausea","Vaginal dryness","Constipation","Diarrhea"].map(v => (
                  <Chip key={v} label={v} selected={symptoms.includes(v)} onToggle={() => toggleSymptoms(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Vaginal discharge">
                {["No discharge","Creamy","Watery","Sticky","Egg white","Spotting","Unusual","Clumpy white","Gray"].map(v => (
                  <Chip key={v} label={v} selected={discharge === v} onToggle={() => toggleDischarge(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Sex and sex drive">
                {["Didn't have sex","Protected sex","Unprotected sex","Oral sex","High sex drive","Neutral sex drive","Low sex drive","Sensual touch"].map(v => (
                  <Chip key={v} label={v} selected={sexTags.includes(v)} onToggle={() => toggleSexTags(v)} />
                ))}
              </ChipSection>
            </>
          )}

          {/* BODY TAB */}
          {activeTab === "body" && (
            <>
              <ChipSection title="Physical activity">
                {["Didn't exercise","Yoga","Gym","Pilates","Running","Swimming","Cycling","Walking","Aerobics","Team sports"].map(v => (
                  <Chip key={v} label={v} selected={activityTags.includes(v)} onToggle={() => toggleActivityTags(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Sleep">
                {["Great sleep","Good sleep","Restless sleep","Couldn't sleep"].map(v => (
                  <Chip key={v} label={v} selected={sleepQualityTag === v} onToggle={() => toggleSleepQualityTag(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Digestion">
                {["Normal digestion","Bloated","Nausea","Constipation","Diarrhea"].map(v => (
                  <Chip key={v} label={v} selected={digestionTags.includes(v)} onToggle={() => toggleDigestionTags(v)} />
                ))}
              </ChipSection>
              <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <SliderRow label="Cramps" value={cramps} onChange={setCramps} />
                <SliderRow label="Pain level" value={pain} onChange={setPain} />
              </div>
            </>
          )}

          {/* SKIN & HAIR TAB */}
          {activeTab === "skin" && (
            <>
              <ChipSection title="Skin">
                {["Clear","Mild breakout","Moderate breakout","Very oily","Very dry"].map(v => (
                  <Chip key={v} label={v} selected={skinCondition === v} onToggle={() => toggleSkinCondition(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Hair">
                {["Normal shedding","More than usual","A lot of shedding"].map(v => (
                  <Chip key={v} label={v} selected={hairShedding === v} onToggle={() => toggleHairShedding(v)} />
                ))}
              </ChipSection>
              <ChipSection title="Medication and supplements">
                {["Oral contraceptive — taken on time","Oral contraceptive — missed","Iron supplement","Vitamin D","Magnesium","Other supplement"].map(v => (
                  <Chip key={v} label={v} selected={medsTags.includes(v)} onToggle={() => toggleMedsTags(v)} />
                ))}
              </ChipSection>
            </>
          )}

          {/* LIFESTYLE TAB */}
          {activeTab === "lifestyle" && (
            <>
              <ChipSection title="Other">
                {["Stress","Meditation","Journaling","Breathing exercises","Kegel exercises","Travel","Alcohol","Disease or injury"].map(v => (
                  <Chip key={v} label={v} selected={otherTags.includes(v)} onToggle={() => toggleOtherTags(v)} />
                ))}
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
            </>
          )}

          {/* VITALS TAB */}
          {activeTab === "vitals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              <SliderRow label="Mood" value={mood} onChange={setMood} />
              <SliderRow label="Sleep hours" value={sleep} onChange={setSleep} min={4} max={12} unit="h" />
            </div>
          )}

        </div>

        {/* Fixed footer */}
        <div style={{ flexShrink: 0, padding: "12px 20px 28px", borderTop: "1px solid var(--border-subtle)" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              height: 52,
              borderRadius: "9999px",
              backgroundColor: "var(--plum)",
              color: "white",
              border: "none",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.75 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving && (
              <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            )}
            {saving ? "Saving..." : "Save check-in"}
          </button>
        </div>
      </div>
    </>
  );
}