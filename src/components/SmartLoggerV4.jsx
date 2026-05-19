import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  cream:    '#F4EDDB',
  espresso: '#3A2C1A',
  blush:    '#E8B4B8',
  sage:     '#8FAF8F',
  muted:    '#9B8B7A',
  gold:     '#D4AF37',
  white:    '#FFFFFF',
  dark:     '#1A1209',
  cardBg:   '#FAF6EE',
  border:   'rgba(58,44,26,0.12)',
};

const PROGRESS_COPY = [
  'Start logging ✏️',
  'Getting started!',
  'Keep going 💪',
  'Halfway there!',
  'Looking great!',
  'Almost there! ⭐',
  "One more — you've got this!",
  'All done today 🎉',
];

const CARD_LABELS = ['Smart', 'Body', 'Period', 'Nourish', 'Health', 'Cycle', 'Mind & Life'];

const STAGES = [
  { id: 'luteal',        label: 'Luteal D25' },
  { id: 'pregnant',      label: 'Pregnant T2' },
  { id: 'perimenopause', label: 'Perimenopause' },
  { id: 'ttc',           label: 'TTC' },
];

const STAGE_CONTEXT = {
  luteal:        'How are you feeling in your luteal phase today?',
  pregnant:      'How is your body feeling today, mama?',
  perimenopause: 'How are your energy and temperature today?',
  ttc:           'Any signs worth tracking today?',
};

const STAGE_JOURNAL = {
  luteal:        'What do you need most from yourself today?',
  pregnant:      'What moment made you smile today?',
  perimenopause: 'What helped you feel most like yourself today?',
  ttc:           'What intention are you holding this cycle?',
};

const ENGAGEMENT_RAIL = {
  luteal: [
    { emoji: '🎙️', title: 'Cycle & Mood', sub: 'Episode 12 — Luteal Phase Nutrition', color: ['#3A2C1A', '#6B3D2A'] },
    { emoji: '📓', title: 'Journal Prompt', sub: 'Write about what your body needs most', color: ['#2A3A2C', '#3D6B4A'] },
    { emoji: '📖', title: 'Reading', sub: 'The Luteal Phase Survival Guide', color: ['#2C2A3A', '#4A3D6B'] },
    { emoji: '✨', title: 'Jess Tip', sub: 'Magnesium glycinate supports PMS symptoms', color: ['#3A2A2C', '#6B3D4A'] },
  ],
  pregnant: [
    { emoji: '👶', title: 'Kick Milestone', sub: 'Log daily kicks & note patterns', color: ['#2C3A32', '#3D6B54'] },
    { emoji: '📖', title: 'Reading', sub: 'Second Trimester: What to Expect', color: ['#2C2A3A', '#4A3D6B'] },
    { emoji: '🎙️', title: 'Podcast', sub: 'The Pregnancy Podcast — Episode 31', color: ['#3A2C1A', '#6B3D2A'] },
    { emoji: '✨', title: 'Jess Tip', sub: 'Iron + Vitamin C together boosts absorption', color: ['#3A2A2C', '#6B3D4A'] },
  ],
  perimenopause: [
    { emoji: '🌡️', title: 'Hot Flash Tips', sub: 'Cooling strategies that actually work', color: ['#3A2A1A', '#6B4A2A'] },
    { emoji: '📖', title: 'Reading', sub: 'The Menopause Manifesto', color: ['#2C2A3A', '#4A3D6B'] },
    { emoji: '🎙️', title: 'Podcast', sub: 'Menopause & Me — Episode 8', color: ['#3A2C1A', '#6B3D2A'] },
    { emoji: '✨', title: 'Jess Tip', sub: 'Phytoestrogens in flaxseed may ease symptoms', color: ['#3A2A2C', '#6B3D4A'] },
  ],
  ttc: [
    { emoji: '🌡️', title: 'BBT Charting Tip', sub: 'Temp at same time daily for accuracy', color: ['#2A3A2C', '#3D6B4A'] },
    { emoji: '📖', title: 'Reading', sub: 'Taking Charge of Your Fertility — Ch.4', color: ['#2C2A3A', '#4A3D6B'] },
    { emoji: '🎙️', title: 'Podcast', sub: 'Fertility Friday — Episode 22', color: ['#3A2C1A', '#6B3D2A'] },
    { emoji: '✨', title: 'Jess Tip', sub: 'Egg-white CM is your most fertile sign', color: ['#3A2A2C', '#6B3D4A'] },
  ],
};

// ─── Tiny Toast ───────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 96, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: T.espresso, color: T.cream, padding: '8px 18px', borderRadius: 20,
      fontSize: 13, fontWeight: 600, opacity: visible ? 1 : 0,
      transition: 'opacity 0.25s ease, transform 0.25s ease',
      pointerEvents: 'none', zIndex: 9999, whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}

// ─── Pill nav ─────────────────────────────────────────────────────────────────
function PillNav({ current, completed, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 16px 4px', scrollbarWidth: 'none' }}>
      {CARD_LABELS.map((label, i) => {
        const isActive = i === current;
        const isDone = completed.has(i);
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'all 0.2s ease',
              background: isActive ? T.gold : isDone ? T.sage : 'rgba(58,44,26,0.1)',
              color: isActive ? T.espresso : isDone ? T.white : T.muted,
            }}
          >
            {isDone && !isActive ? `✓ ${label}` : label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ completed }) {
  const count = completed.size;
  const copy = PROGRESS_COPY[count] || PROGRESS_COPY[0];
  return (
    <div style={{ padding: '12px 16px 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.espresso }}>{copy}</span>
        <span style={{ fontSize: 11, color: T.muted }}>{count}/7</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 5, borderRadius: 3,
            background: completed.has(i) ? T.gold : 'rgba(58,44,26,0.15)',
            transition: 'background 0.4s ease',
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ChipRow({ options, selected, onToggle, multi = true }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: '6px 12px', borderRadius: 16, border: `1.5px solid ${active ? T.gold : T.border}`,
            background: active ? `${T.gold}22` : 'transparent',
            color: active ? T.espresso : T.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function DotRating({ value, onChange, max = 5, color = T.gold }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {Array.from({ length: max }, (_, i) => (
        <button key={i} onClick={() => onChange(i + 1)} style={{
          width: 34, height: 34, borderRadius: '50%', border: `2px solid ${i < value ? color : T.border}`,
          background: i < value ? color : 'transparent',
          color: i < value ? T.espresso : T.muted,
          fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s ease',
        }}>
          {i + 1}
        </button>
      ))}
    </div>
  );
}

function Counter({ value, onChange, step = 1, min = 0, max = 99, label = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))} style={{
        width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${T.border}`,
        background: 'transparent', color: T.espresso, fontSize: 18, cursor: 'pointer', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>−</button>
      <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 700, fontSize: 16, color: T.espresso }}>
        {value}{label}
      </span>
      <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))} style={{
        width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${T.border}`,
        background: 'transparent', color: T.espresso, fontSize: 18, cursor: 'pointer', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>+</button>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: T.espresso, fontWeight: 500 }}>{label}</span>
      <div onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s',
        background: checked ? T.gold : 'rgba(58,44,26,0.2)', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20,
          borderRadius: '50%', background: T.white, transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

function MoodFaces({ value, onChange }) {
  const faces = ['😔', '😕', '😐', '🙂', '😊'];
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {faces.map((f, i) => (
        <button key={i} onClick={() => onChange(i + 1)} style={{
          fontSize: value === i + 1 ? 36 : 28, background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 2px', transform: value === i + 1 ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.18s ease, font-size 0.18s ease',
          filter: value === i + 1 ? 'drop-shadow(0 2px 4px rgba(212,175,55,0.4))' : 'none',
        }}>
          {f}
        </button>
      ))}
    </div>
  );
}

// ─── Card 1: Smart ────────────────────────────────────────────────────────────
function Card1Smart({ stage, onSave }) {
  const [mood, setMood] = useState(0);
  const [influences, setInfluences] = useState([]);

  const handleMood = (v) => { setMood(v); onSave(); };
  const handleInfluence = (opt) => {
    setInfluences(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
    onSave();
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 16, textAlign: 'center', fontStyle: 'italic' }}>
        {STAGE_CONTEXT[stage]}
      </p>
      <SectionLabel>Mood</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        <MoodFaces value={mood} onChange={handleMood} />
      </div>
      <SectionLabel>What's influencing you?</SectionLabel>
      <ChipRow
        options={['Sleep quality', 'Stress', 'Exercise', 'Nutrition', 'Social', 'Hormones']}
        selected={influences}
        onToggle={handleInfluence}
      />
    </div>
  );
}

// ─── Card 2: Body ─────────────────────────────────────────────────────────────
function Card2Body({ onSave }) {
  const [energy, setEnergy] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [weight, setWeight] = useState(65);

  return (
    <div>
      <SectionLabel>Energy level</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        <DotRating value={energy} onChange={(v) => { setEnergy(v); onSave(); }} color={T.gold} />
      </div>
      <SectionLabel>Symptoms today</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        <ChipRow
          options={['Cramps', 'Bloating', 'Headache', 'Back pain', 'Breast tenderness', 'Fatigue', 'Nausea', 'Brain fog', 'Skin breakout', 'Joint pain']}
          selected={symptoms}
          onToggle={(opt) => { setSymptoms(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]); onSave(); }}
        />
      </div>
      <SectionLabel>Weight (kg)</SectionLabel>
      <Counter value={weight} onChange={(v) => { setWeight(v); onSave(); }} step={0.1} min={30} max={200} />
    </div>
  );
}

// ─── Card 3: Period & Cycle ───────────────────────────────────────────────────
function Card3Period({ onSave }) {
  const [status, setStatus] = useState('');
  const [flow, setFlow] = useState('');
  const [pain, setPain] = useState(0);
  const [clots, setClots] = useState(false);
  const [pillTaken, setPillTaken] = useState(false);
  const [patchCheck, setPatchCheck] = useState(false);
  const [injectionDue, setInjectionDue] = useState(false);

  const showFlow = ['Period start', 'Ongoing'].includes(status);

  return (
    <div>
      <SectionLabel>Period status</SectionLabel>
      <div style={{ marginBottom: 16 }}>
        <ChipRow
          options={['Period start', 'Ongoing', 'Period end', 'Spotting', 'No period']}
          selected={status}
          onToggle={(opt) => { setStatus(opt); onSave(); }}
          multi={false}
        />
      </div>
      {showFlow && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Flow</SectionLabel>
          <ChipRow
            options={['Light', 'Medium', 'Heavy', 'Very heavy']}
            selected={flow}
            onToggle={(opt) => { setFlow(opt); onSave(); }}
            multi={false}
          />
        </div>
      )}
      <SectionLabel>Pain level</SectionLabel>
      <div style={{ marginBottom: 16 }}>
        <DotRating value={pain} onChange={(v) => { setPain(v); onSave(); }} color={T.blush} />
      </div>
      <Toggle checked={clots} onChange={(v) => { setClots(v); onSave(); }} label="Clots present" />
      <div style={{ marginTop: 12 }}>
        <SectionLabel>Contraception</SectionLabel>
        <Toggle checked={pillTaken} onChange={(v) => { setPillTaken(v); onSave(); }} label="Pill taken today" />
        <Toggle checked={patchCheck} onChange={(v) => { setPatchCheck(v); onSave(); }} label="Patch / Ring check" />
        <Toggle checked={injectionDue} onChange={(v) => { setInjectionDue(v); onSave(); }} label="Injection due soon" />
      </div>
    </div>
  );
}

// ─── Card 4: Nourish ──────────────────────────────────────────────────────────
function Card4Nourish({ onSave }) {
  const [water, setWater] = useState(4);
  const [caffeine, setCaffeine] = useState(0);
  const [alcohol, setAlcohol] = useState(0);
  const [meals, setMeals] = useState([]);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <SectionLabel>Water (glasses)</SectionLabel>
        <Counter value={water} onChange={(v) => { setWater(v); onSave(); }} min={0} max={20} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <SectionLabel>Caffeine (cups)</SectionLabel>
        <Counter value={caffeine} onChange={(v) => { setCaffeine(v); onSave(); }} min={0} max={20} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <SectionLabel>Alcohol (units)</SectionLabel>
        <Counter value={alcohol} onChange={(v) => { setAlcohol(v); onSave(); }} min={0} max={20} />
      </div>
      <SectionLabel>Meals logged</SectionLabel>
      <ChipRow
        options={['Breakfast', 'Lunch', 'Dinner', 'Snack']}
        selected={meals}
        onToggle={(opt) => { setMeals(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]); onSave(); }}
      />
    </div>
  );
}

// ─── Card 5: Health ───────────────────────────────────────────────────────────
function Card5Health({ onSave, showToast }) {
  const [meds, setMeds] = useState([]);
  const [sleep, setSleep] = useState(7.0);
  const medOptions = ['Iron supplement', 'Vitamin D', 'Magnesium'];

  const toggleMed = (med) => {
    setMeds(prev => {
      const next = prev.includes(med) ? prev.filter(x => x !== med) : [...prev, med];
      if (!prev.includes(med)) showToast(`✓ ${med} logged`);
      return next;
    });
    onSave();
  };

  return (
    <div>
      <SectionLabel>Medications</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        {medOptions.map(med => (
          <div key={med} onClick={() => toggleMed(med)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
            borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, border: `2px solid ${meds.includes(med) ? T.gold : T.border}`,
              background: meds.includes(med) ? T.gold : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.18s ease',
            }}>
              {meds.includes(med) && <span style={{ fontSize: 13, color: T.espresso }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: T.espresso, fontWeight: 500 }}>{med}</span>
          </div>
        ))}
      </div>
      <SectionLabel>Sleep last night (hours)</SectionLabel>
      <Counter value={sleep} onChange={(v) => { setSleep(v); onSave(); }} step={0.5} min={0} max={16} label="h" />
    </div>
  );
}

// ─── Card 6: Cycle (stage-aware) ──────────────────────────────────────────────
function Card6Cycle({ stage, onSave }) {
  // Luteal state
  const [pmsChips, setPmsChips] = useState([]);
  const [spotting, setSpotting] = useState('');
  // Pregnant state
  const [kicks, setKicks] = useState(0);
  const [braxton, setBraxton] = useState(false);
  const [nausea, setNausea] = useState(false);
  // Perimenopause state
  const [hotFlashes, setHotFlashes] = useState(0);
  const [hfIntensity, setHfIntensity] = useState('');
  const [hfTriggers, setHfTriggers] = useState([]);
  const [hrtTaken, setHrtTaken] = useState(false);
  const [nightSweats, setNightSweats] = useState(false);
  // TTC state
  const [bbt, setBbt] = useState(36.20);
  const [cm, setCm] = useState('');
  const [lh, setLh] = useState('');
  const [intercourse, setIntercourse] = useState(false);

  if (stage === 'luteal') return (
    <div>
      <SectionLabel>PMS symptoms</SectionLabel>
      <div style={{ marginBottom: 20 }}>
        <ChipRow
          options={['Mood swings', 'Irritability', 'Anxiety', 'Cravings', 'Bloating', 'Breast tenderness']}
          selected={pmsChips}
          onToggle={(opt) => { setPmsChips(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]); onSave(); }}
        />
      </div>
      <SectionLabel>Spotting</SectionLabel>
      <ChipRow
        options={['None', 'Light', 'Spotting']}
        selected={spotting}
        onToggle={(opt) => { setSpotting(opt); onSave(); }}
        multi={false}
      />
    </div>
  );

  if (stage === 'pregnant') return (
    <div>
      <SectionLabel>Kick counter</SectionLabel>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <button onClick={() => { setKicks(k => k + 1); onSave(); }} style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.blush}, #d4889c)`,
          border: 'none', cursor: 'pointer', fontSize: 36, color: T.white,
          boxShadow: '0 4px 20px rgba(232,180,184,0.5)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto', transition: 'transform 0.1s',
        }}>
          <span>👶</span>
          <span style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>Log a kick</span>
        </button>
        <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: T.espresso }}>
          {kicks} kicks today
        </div>
      </div>
      <Toggle checked={braxton} onChange={(v) => { setBraxton(v); onSave(); }} label="Braxton Hicks contractions" />
      <Toggle checked={nausea} onChange={(v) => { setNausea(v); onSave(); }} label="Nausea today" />
    </div>
  );

  if (stage === 'perimenopause') return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Hot flashes today</SectionLabel>
        <Counter value={hotFlashes} onChange={(v) => { setHotFlashes(v); onSave(); }} min={0} max={30} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Intensity</SectionLabel>
        <ChipRow
          options={['Mild', 'Moderate', 'Severe']}
          selected={hfIntensity}
          onToggle={(opt) => { setHfIntensity(opt); onSave(); }}
          multi={false}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Triggers</SectionLabel>
        <ChipRow
          options={['Stress', 'Heat', 'Caffeine', 'Alcohol', 'Spicy food']}
          selected={hfTriggers}
          onToggle={(opt) => { setHfTriggers(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]); onSave(); }}
        />
      </div>
      <Toggle checked={hrtTaken} onChange={(v) => { setHrtTaken(v); onSave(); }} label="HRT taken today" />
      <Toggle checked={nightSweats} onChange={(v) => { setNightSweats(v); onSave(); }} label="Night sweats last night" />
    </div>
  );

  if (stage === 'ttc') return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Basal Body Temp (°C)</SectionLabel>
        <Counter value={bbt} onChange={(v) => { setBbt(v); onSave(); }} step={0.05} min={35} max={38.5} label="°" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Cervical mucus</SectionLabel>
        <ChipRow
          options={['Dry', 'Sticky', 'Creamy', 'Watery', 'Egg white']}
          selected={cm}
          onToggle={(opt) => { setCm(opt); onSave(); }}
          multi={false}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>LH test result</SectionLabel>
        <ChipRow
          options={['Not tested', 'Negative', 'Positive', 'Peak']}
          selected={lh}
          onToggle={(opt) => { setLh(opt); onSave(); }}
          multi={false}
        />
      </div>
      <Toggle checked={intercourse} onChange={(v) => { setIntercourse(v); onSave(); }} label="Intercourse today" />
    </div>
  );

  return null;
}

// ─── Card 7: Mind & Life ──────────────────────────────────────────────────────
function Card7Mind({ stage, onSave, showToast }) {
  const [journalText, setJournalText] = useState('');
  const [rituals, setRituals] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const saveTimer = useRef(null);
  const ritualOptions = ['Moon wind-down', '10 min reading', 'Breathwork', 'Supplement routine'];

  const handleJournal = (e) => {
    const val = e.target.value;
    setJournalText(val);
    if (val.length >= 3) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onSave();
        showToast('✓ Saved');
      }, 800);
    }
  };

  const toggleRitual = (r) => {
    setRituals(prev => {
      const next = prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r];
      if (!prev.includes(r)) { onSave(); showToast(`✓ ${r} logged`); }
      return next;
    });
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(prev => [...prev, taskInput.trim()]);
    setTaskInput('');
    onSave();
    showToast('✓ Task added');
  };

  return (
    <div>
      <SectionLabel>Journal prompt</SectionLabel>
      <p style={{ fontSize: 12, color: T.muted, fontStyle: 'italic', marginBottom: 8 }}>
        {STAGE_JOURNAL[stage]}
      </p>
      <textarea
        value={journalText}
        onChange={handleJournal}
        placeholder="Write freely here…"
        style={{
          width: '100%', minHeight: 80, borderRadius: 10, border: `1.5px solid ${T.border}`,
          background: 'rgba(244,237,219,0.5)', padding: '10px 12px', fontSize: 13, color: T.espresso,
          resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
        }}
      />
      <div style={{ marginTop: 16 }}>
        <SectionLabel>Evening rituals</SectionLabel>
        {ritualOptions.map(r => (
          <div key={r} onClick={() => toggleRitual(r)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
            borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, border: `2px solid ${rituals.includes(r) ? T.sage : T.border}`,
              background: rituals.includes(r) ? T.sage : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.18s ease',
            }}>
              {rituals.includes(r) && <span style={{ fontSize: 12, color: T.white }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: T.espresso, fontWeight: 500 }}>{r}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <SectionLabel>Quick task</SectionLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add a task…"
            style={{
              flex: 1, borderRadius: 8, border: `1.5px solid ${T.border}`,
              background: 'rgba(244,237,219,0.5)', padding: '8px 12px',
              fontSize: 13, color: T.espresso, outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button onClick={addTask} style={{
            padding: '8px 14px', borderRadius: 8, border: 'none', background: T.gold,
            color: T.espresso, fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>Add</button>
        </div>
        {tasks.map((t, i) => (
          <div key={i} style={{ fontSize: 12, color: T.muted, padding: '4px 0', paddingLeft: 4 }}>• {t}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Engagement Rail ──────────────────────────────────────────────────────────
function EngagementRail({ stage }) {
  const cards = ENGAGEMENT_RAIL[stage] || ENGAGEMENT_RAIL.luteal;
  return (
    <div>
      <div style={{ padding: '0 16px 8px', fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
        Recommended for you
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 4px', scrollbarWidth: 'none' }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 150, padding: '14px 14px 16px',
            background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})`,
            borderRadius: 14, cursor: 'pointer',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{c.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.cream, marginBottom: 3 }}>{c.title}</div>
            <div style={{ fontSize: 10, color: 'rgba(244,237,219,0.7)', lineHeight: 1.3 }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main SmartLoggerV4 ───────────────────────────────────────────────────────
export default function SmartLoggerV4() {
  // Demo state: the sheet renders open by default so the founder can see the
  // full card deck immediately when the tab loads. The FAB still toggles
  // visibility for interactive demos.
  const [open, setOpen] = useState(true);
  const [stage, setStage] = useState('luteal');
  const [currentCard, setCurrentCard] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef(null);
  const dragStart = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ message: msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  }, []);

  const markDone = useCallback((idx) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    showToast('✓ Saved');
  }, [showToast]);

  const makeOnSave = (cardIdx) => () => markDone(cardIdx);

  // Swipe handling
  const handleDragStart = (clientX) => { dragStart.current = clientX; };
  const handleDragEnd = (clientX) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - clientX;
    dragStart.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0 && currentCard < 6) setCurrentCard(c => c + 1);
    if (delta < 0 && currentCard > 0) setCurrentCard(c => c - 1);
  };

  const cardTransform = (pos) => {
    const diff = pos - currentCard;
    if (diff === 0) return { x: '0%', scale: 1, opacity: 1, zIndex: 10 };
    if (diff === 1) return { x: '85%', scale: 0.9, opacity: 0.7, zIndex: 9 };
    if (diff >= 2) return { x: '170%', scale: 0.85, opacity: 0.4, zIndex: 8 };
    if (diff === -1) return { x: '-100%', scale: 0.95, opacity: 0, zIndex: 7 };
    return { x: '-200%', scale: 0.9, opacity: 0, zIndex: 6 };
  };

  const cardContent = (i) => {
    switch (i) {
      case 0: return <Card1Smart stage={stage} onSave={makeOnSave(0)} />;
      case 1: return <Card2Body onSave={makeOnSave(1)} />;
      case 2: return <Card3Period onSave={makeOnSave(2)} />;
      case 3: return <Card4Nourish onSave={makeOnSave(3)} />;
      case 4: return <Card5Health onSave={makeOnSave(4)} showToast={showToast} />;
      case 5: return <Card6Cycle stage={stage} onSave={makeOnSave(5)} />;
      case 6: return <Card7Mind stage={stage} onSave={makeOnSave(6)} showToast={showToast} />;
      default: return null;
    }
  };

  const cardTitle = (i) => {
    const icons = ['✨', '💪', '🌸', '🥗', '💊', '🌙', '📓'];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>{icons[i]}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.espresso }}>{CARD_LABELS[i]}</span>
        <div style={{ flex: 1 }} />
        {i < 6 && (
          <button onClick={() => setCurrentCard(i + 1)} style={{
            fontSize: 11, color: T.muted, background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, padding: 0,
          }}>Next →</button>
        )}
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', position: 'relative',
      padding: '0 0 24px',
    }}>
      {/* Page-level stage selector (above the sheet) */}
      <div style={{
        display: 'flex', gap: 6, justifyContent: 'center',
        padding: '14px 12px 16px', flexWrap: 'wrap',
      }}>
        {STAGES.map(s => (
          <button key={s.id} onClick={() => setStage(s.id)} style={{
            padding: '9px 16px', borderRadius: 9999,
            border: `1.5px solid ${stage === s.id ? T.espresso : T.border}`,
            background: stage === s.id ? T.espresso : T.paperHi || '#FFFFFF',
            color: stage === s.id ? T.cream : T.espresso,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s ease',
            letterSpacing: '0.02em',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Inline open-by-default sheet */}
      {open ? (
        <div style={{
          background: T.cream, borderRadius: 20,
          boxShadow: '0 8px 30px rgba(58,44,26,0.12)',
          border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 10px',
            borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.espresso }}>Daily Log</span>
            <button onClick={() => setOpen(false)} aria-label="Close sheet" style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 20,
              color: T.muted, lineHeight: 1, padding: '0 4px',
            }}>×</button>
          </div>

          {/* Progress bar */}
          <ProgressBar completed={completed} />

          {/* Pill nav */}
          <PillNav current={currentCard} completed={completed} onSelect={setCurrentCard} />

          {/* Card deck */}
          <div
            style={{ position: 'relative', height: 380, margin: '12px 0 4px', overflow: 'hidden' }}
            onMouseDown={e => handleDragStart(e.clientX)}
            onMouseUp={e => handleDragEnd(e.clientX)}
            onTouchStart={e => handleDragStart(e.touches[0].clientX)}
            onTouchEnd={e => handleDragEnd(e.changedTouches[0].clientX)}
          >
            {Array.from({ length: 7 }, (_, i) => {
              const { x, scale, opacity, zIndex } = cardTransform(i);
              return (
                <div key={i} style={{
                  position: 'absolute', top: 0, left: '50%',
                  width: 'calc(100% - 32px)', transform: `translateX(calc(-50% + ${x})) scale(${scale})`,
                  opacity, zIndex, transition: 'transform 0.35s ease, opacity 0.35s ease',
                  background: T.cardBg, borderRadius: 16, padding: '14px 16px',
                  boxShadow: '0 2px 12px rgba(58,44,26,0.1)',
                  border: `1px solid ${T.border}`,
                  overflowY: 'auto', maxHeight: 360,
                  pointerEvents: i === currentCard ? 'auto' : 'none',
                }}>
                  {cardTitle(i)}
                  {cardContent(i)}
                </div>
              );
            })}
          </div>

          {/* Swipe hint */}
          <div style={{ textAlign: 'center', fontSize: 11, color: T.muted, paddingBottom: 8 }}>
            ← swipe to navigate →
          </div>

          {/* Engagement rail */}
          <div style={{ paddingBottom: 16 }}>
            <EngagementRail stage={stage} />
          </div>
        </div>
      ) : (
        // Closed state — show a small reopen hint with the FAB.
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          background: T.cream, borderRadius: 20,
          border: `1px dashed ${T.border}`,
          color: T.muted, fontSize: 13,
        }}>
          Sheet closed — tap the gold + to reopen.
        </div>
      )}

      {/* FAB — kept for interactive reopen; sits inline at bottom-right of demo block */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Smart Logger"
          style={{
            position: 'absolute', bottom: 24, right: 16,
            width: 56, height: 56, borderRadius: '50%',
            background: T.gold, border: 'none', cursor: 'pointer',
            fontSize: 28, color: T.espresso, fontWeight: 300,
            boxShadow: '0 4px 16px rgba(212,175,55,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2, transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          +
        </button>
      )}

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
