import { useState, useCallback, useRef } from 'react';
import {
  Heart, Droplets, Utensils, Pill, Sparkles, Pen,
  Headphones, BookOpen, Thermometer, X as XIcon, Check, Plus, Minus,
  Activity, Coffee, Wine, Scale,
} from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  cream:    '#F4EDDB',
  espresso: '#3A2C1A',
  blush:    '#E8B4B8',
  sage:     '#8FAF8F',
  sageDeep: '#6F8B6F',
  muted:    '#9B8B7A',
  gold:     '#D4AF37',
  goldDeep: '#A6862B',
  white:    '#FFFFFF',
  dark:     '#1A1209',
  cardBg:   '#FAF6EE',
  paperHi:  '#FFFFFF',
  border:   'rgba(58,44,26,0.12)',
};

// 8 progress strings for 0-6 completed (we have 6 cards now)
const PROGRESS_COPY = [
  'Start logging',
  'Getting started',
  'Keep going',
  'Halfway there',
  'Looking great',
  'Almost there',
  'One more left',
  'All done today',
];

// 6 cards now — Smart + Body merged, no stage-aware Cycle card, Rituals is its own card.
const CARD_LABELS = ['Smart & Body', 'Period & Cycle', 'Nourish', 'Health', 'Rituals', 'Mind & Life'];
const TOTAL_CARDS = CARD_LABELS.length;

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

const MOOD_LABELS = ['Awful', 'Low', 'Okay', 'Good', 'Great'];

// Engagement rail content (per stage) — emoji removed, Lucide icons used.
const ENGAGEMENT_RAIL = {
  luteal: [
    { Icon: Headphones, type: 'PODCAST', title: 'Cycle & Mood',     sub: 'Luteal Phase Nutrition',  grad: ['#3D2E5C', '#1F1733'] },
    { Icon: Pen,        type: 'JOURNAL', title: 'Journal prompt',   sub: 'What does your body need?', grad: ['#1F3D2E', '#0E1F17'] },
    { Icon: BookOpen,   type: 'READING', title: 'Iron + luteal',    sub: 'The Atlas · 6 min',        grad: ['#1F3A5C', '#0E1A33'] },
    { Icon: Sparkles,   type: 'JESS TIP',title: 'Magnesium',        sub: 'Before bed eases cramps',  grad: ['#4A3520', '#1A1410'] },
  ],
  pregnant: [
    { Icon: Headphones, type: 'PODCAST', title: 'T2 energy slumps', sub: 'Mother & Baby · 38 min',  grad: ['#3D2E5C', '#1F1733'] },
    { Icon: Pen,        type: 'JOURNAL', title: 'Letter to baby',   sub: 'Pregnancy diary',          grad: ['#1F3D2E', '#0E1F17'] },
    { Icon: BookOpen,   type: 'READING', title: '20-week scan',     sub: 'NHS guide · 8 min',        grad: ['#1F3A5C', '#0E1A33'] },
    { Icon: Sparkles,   type: 'JESS TIP',title: 'Left-side sleep',  sub: 'Improves circulation',     grad: ['#4A3520', '#1A1410'] },
  ],
  perimenopause: [
    { Icon: Headphones, type: 'PODCAST', title: 'HRT myths',        sub: 'Dr Louise Newson · 55 min',grad: ['#3D2E5C', '#1F1733'] },
    { Icon: Pen,        type: 'JOURNAL', title: 'What surprised you?',sub: 'Peri reflection',         grad: ['#1F3D2E', '#0E1F17'] },
    { Icon: BookOpen,   type: 'READING', title: 'Hot flashes',      sub: 'The Atlas · 5 min',        grad: ['#1F3A5C', '#0E1A33'] },
    { Icon: Sparkles,   type: 'JESS TIP',title: 'Cool the room 2°C',sub: 'Halves flash frequency',   grad: ['#4A3520', '#1A1410'] },
  ],
  ttc: [
    { Icon: Headphones, type: 'PODCAST', title: 'Fertile window',   sub: 'Modern Fertility · 47 min',grad: ['#3D2E5C', '#1F1733'] },
    { Icon: Pen,        type: 'JOURNAL', title: 'About this cycle', sub: 'TTC reflection',           grad: ['#1F3D2E', '#0E1F17'] },
    { Icon: BookOpen,   type: 'READING', title: 'BBT charting',     sub: 'The Atlas · 7 min',        grad: ['#1F3A5C', '#0E1A33'] },
    { Icon: Sparkles,   type: 'JESS TIP',title: 'Stress + ovulation',sub: 'Can delay 3 days',        grad: ['#4A3520', '#1A1410'] },
  ],
};

// Card-title icons (Lucide, no emoji)
const CARD_ICONS = [Heart, Droplets, Utensils, Pill, Sparkles, Pen];

// ─── Tiny Toast ───────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'absolute', bottom: 16, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
      background: T.espresso, color: T.cream, padding: '8px 16px', borderRadius: 20,
      fontSize: 12.5, fontWeight: 700, opacity: visible ? 1 : 0,
      transition: 'opacity 0.22s ease, transform 0.22s ease',
      pointerEvents: 'none', zIndex: 9999, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    }}>
      <Check size={13} strokeWidth={3} />
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
              fontSize: 11.5, fontWeight: 700, transition: 'all 0.2s ease',
              background: isActive ? T.gold : isDone ? T.sage : 'rgba(58,44,26,0.10)',
              color: isActive ? T.espresso : isDone ? T.white : T.muted,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              letterSpacing: '0.01em',
            }}
          >
            {isDone && !isActive && <Check size={11} strokeWidth={3} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ completed }) {
  const count = completed.size;
  const copy = PROGRESS_COPY[Math.min(count, PROGRESS_COPY.length - 1)];
  return (
    <div style={{ padding: '12px 16px 6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.espresso }}>{copy}</span>
        <span style={{ fontSize: 11, color: T.muted }}>{count}/{TOTAL_CARDS}</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: TOTAL_CARDS }, (_, i) => (
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
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase',
      letterSpacing: '0.10em', marginBottom: 6, marginTop: 4,
    }}>
      {children}
    </div>
  );
}

function ChipRow({ options, selected, onToggle, multi = true, small = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {options.map(opt => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: small ? '4px 10px' : '5px 11px', borderRadius: 14,
            border: `1.5px solid ${active ? T.gold : T.border}`,
            background: active ? `${T.gold}22` : 'transparent',
            color: active ? T.espresso : T.muted,
            fontSize: small ? 11 : 11.5, fontWeight: 600, cursor: 'pointer',
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
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: max }, (_, i) => (
        <button key={i} onClick={() => onChange(i + 1)} style={{
          width: 30, height: 30, borderRadius: '50%',
          border: `2px solid ${i < value ? color : T.border}`,
          background: i < value ? color : 'transparent',
          color: i < value ? T.espresso : T.muted,
          fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.18s ease',
        }}>{i + 1}</button>
      ))}
    </div>
  );
}

function Counter({ value, onChange, step = 1, min = 0, max = 99, label = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))} style={{
        width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${T.border}`,
        background: 'transparent', color: T.espresso, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Minus size={14} /></button>
      <span style={{ minWidth: 44, textAlign: 'center', fontWeight: 700, fontSize: 15, color: T.espresso }}>
        {value}{label}
      </span>
      <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))} style={{
        width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${T.border}`,
        background: 'transparent', color: T.espresso, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Plus size={14} /></button>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 12.5, color: T.espresso, fontWeight: 500 }}>{label}</span>
      <div onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s',
        background: checked ? T.gold : 'rgba(58,44,26,0.2)', position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18,
          borderRadius: '50%', background: T.white, transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

// Mood pill row — text-only, NO emoji
function MoodPills({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {MOOD_LABELS.map((m, i) => {
        const active = value === i + 1;
        return (
          <button key={m} onClick={() => onChange(i + 1)} style={{
            flex: '1 1 0', minWidth: 0,
            padding: '8px 6px', borderRadius: 14,
            border: `1.5px solid ${active ? T.gold : T.border}`,
            background: active ? T.gold : T.paperHi,
            color: active ? T.espresso : T.muted,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.16s ease',
          }}>{m}</button>
        );
      })}
    </div>
  );
}

// ─── Card 1: Smart & Body (merged) ────────────────────────────────────────────
function Card1SmartBody({ stage, onSave }) {
  const [mood, setMood] = useState(0);
  const [influences, setInfluences] = useState([]);
  const [energy, setEnergy] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [weight, setWeight] = useState(65);
  const toggleArr = (setter) => (opt) =>
    setter((prev) => { const next = prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]; onSave(); return next; });

  return (
    <div>
      <p style={{
        fontSize: 12.5, color: T.muted, marginBottom: 12, marginTop: 0,
        textAlign: 'center', fontStyle: 'italic',
      }}>{STAGE_CONTEXT[stage]}</p>

      <SectionLabel>Mood</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <MoodPills value={mood} onChange={(v) => { setMood(v); onSave(); }} />
      </div>

      <SectionLabel>What's influencing you?</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <ChipRow
          options={['Sleep', 'Stress', 'Exercise', 'Nutrition', 'Social', 'Hormones']}
          selected={influences}
          onToggle={toggleArr(setInfluences)}
          small
        />
      </div>

      <SectionLabel>Energy</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <DotRating value={energy} onChange={(v) => { setEnergy(v); onSave(); }} color={T.gold} />
      </div>

      <SectionLabel>Symptoms today</SectionLabel>
      <div style={{ marginBottom: 12 }}>
        <ChipRow
          options={['Cramps', 'Bloating', 'Headache', 'Back pain', 'Tender breasts', 'Fatigue', 'Nausea', 'Brain fog', 'Breakout', 'Joint pain']}
          selected={symptoms}
          onToggle={toggleArr(setSymptoms)}
          small
        />
      </div>

      <SectionLabel>Weight</SectionLabel>
      <Counter value={weight} onChange={(v) => { setWeight(v); onSave(); }} step={0.1} min={30} max={200} label=" kg" />
    </div>
  );
}

// ─── Card 2: Period & Cycle ───────────────────────────────────────────────────
function Card2Period({ onSave }) {
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
      <div style={{ marginBottom: 12 }}>
        <ChipRow
          options={['Period start', 'Ongoing', 'Period end', 'Spotting', 'No period']}
          selected={status}
          onToggle={(opt) => { setStatus(opt); onSave(); }}
          multi={false}
          small
        />
      </div>
      {showFlow && (
        <div style={{ marginBottom: 12 }}>
          <SectionLabel>Flow</SectionLabel>
          <ChipRow
            options={['Light', 'Medium', 'Heavy', 'Very heavy']}
            selected={flow}
            onToggle={(opt) => { setFlow(opt); onSave(); }}
            multi={false}
            small
          />
        </div>
      )}
      <SectionLabel>Pain level</SectionLabel>
      <div style={{ marginBottom: 8 }}>
        <DotRating value={pain} onChange={(v) => { setPain(v); onSave(); }} color={T.blush} />
      </div>
      <Toggle checked={clots} onChange={(v) => { setClots(v); onSave(); }} label="Clots present" />
      <div style={{ marginTop: 6 }}>
        <SectionLabel>Contraception</SectionLabel>
        <Toggle checked={pillTaken}    onChange={(v) => { setPillTaken(v); onSave(); }}    label="Pill taken today" />
        <Toggle checked={patchCheck}   onChange={(v) => { setPatchCheck(v); onSave(); }}   label="Patch / Ring check" />
        <Toggle checked={injectionDue} onChange={(v) => { setInjectionDue(v); onSave(); }} label="Injection due soon" />
      </div>
    </div>
  );
}

// ─── Card 3: Nourish ──────────────────────────────────────────────────────────
function Card3Nourish({ onSave }) {
  const [water, setWater] = useState(4);
  const [caffeine, setCaffeine] = useState(0);
  const [alcohol, setAlcohol] = useState(0);
  const [meals, setMeals] = useState([]);
  const toggleMeal = (m) => setMeals((prev) => { const next = prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]; onSave(); return next; });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <SectionLabel><Droplets size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Water (glasses)</SectionLabel>
          <Counter value={water}    onChange={(v) => { setWater(v); onSave(); }}    min={0} max={20} />
        </div>
        <div>
          <SectionLabel><Coffee size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Caffeine (cups)</SectionLabel>
          <Counter value={caffeine} onChange={(v) => { setCaffeine(v); onSave(); }} min={0} max={20} />
        </div>
        <div>
          <SectionLabel><Wine size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Alcohol (units)</SectionLabel>
          <Counter value={alcohol}  onChange={(v) => { setAlcohol(v); onSave(); }}  min={0} max={20} />
        </div>
      </div>
      <SectionLabel>Meals logged</SectionLabel>
      <ChipRow
        options={['Breakfast', 'Lunch', 'Dinner', 'Snack']}
        selected={meals}
        onToggle={toggleMeal}
        small
      />
    </div>
  );
}

// ─── Card 4: Health (with add-med input) ──────────────────────────────────────
function Card4Health({ onSave, showToast }) {
  const presets = ['Iron supplement', 'Vitamin D', 'Magnesium'];
  const [customMeds, setCustomMeds] = useState([]); // [{ name, qty }]
  const [checked, setChecked] = useState(new Set());
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [sleep, setSleep] = useState(7.0);

  const allMeds = [...presets, ...customMeds.map((m) => m.name + (m.qty > 1 ? ` × ${m.qty}` : ''))];

  const toggleMed = (med) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(med)) next.delete(med);
      else { next.add(med); showToast(`${med} logged`); }
      return next;
    });
    onSave();
  };

  const addMed = () => {
    const name = newName.trim();
    if (!name) return;
    setCustomMeds((prev) => [...prev, { name, qty: newQty }]);
    setNewName(''); setNewQty(1);
    showToast(`${name} added`);
    onSave();
  };

  return (
    <div>
      <SectionLabel>Medications today</SectionLabel>
      <div style={{ marginBottom: 10, maxHeight: 110, overflowY: 'auto' }}>
        {allMeds.map((med) => (
          <div key={med} onClick={() => toggleMed(med)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
            borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              border: `2px solid ${checked.has(med) ? T.gold : T.border}`,
              background: checked.has(med) ? T.gold : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {checked.has(med) && <Check size={11} strokeWidth={3} style={{ color: T.espresso }} />}
            </div>
            <span style={{ fontSize: 12.5, color: T.espresso, fontWeight: 500 }}>{med}</span>
          </div>
        ))}
      </div>

      {/* Add medication */}
      <div style={{
        background: 'rgba(212,175,55,0.08)', border: `1px dashed ${T.gold}55`,
        borderRadius: 10, padding: '8px 10px', marginBottom: 12,
      }}>
        <SectionLabel>Add medication</SectionLabel>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Med name…"
            onKeyDown={(e) => e.key === 'Enter' && addMed()}
            style={{
              flex: 1, minWidth: 0, padding: '7px 9px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.white,
              fontSize: 12, color: T.espresso, outline: 'none',
            }}
          />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            border: `1px solid ${T.border}`, borderRadius: 8, padding: '4px 6px', background: T.white,
          }}>
            <button onClick={() => setNewQty((q) => Math.max(1, q - 1))} style={{
              width: 20, height: 20, borderRadius: '50%', background: 'transparent',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.espresso,
            }}><Minus size={11} /></button>
            <span style={{ minWidth: 22, textAlign: 'center', fontSize: 12, fontWeight: 700, color: T.espresso }}>{newQty}</span>
            <button onClick={() => setNewQty((q) => q + 1)} style={{
              width: 20, height: 20, borderRadius: '50%', background: 'transparent',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.espresso,
            }}><Plus size={11} /></button>
          </div>
          <button onClick={addMed} disabled={!newName.trim()} style={{
            padding: '7px 12px', borderRadius: 8, border: 'none',
            background: newName.trim() ? T.espresso : 'rgba(58,44,26,0.18)',
            color: T.cream, fontSize: 12, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'not-allowed',
          }}>Add</button>
        </div>
      </div>

      <SectionLabel>Sleep last night (hours)</SectionLabel>
      <Counter value={sleep} onChange={(v) => { setSleep(v); onSave(); }} step={0.5} min={0} max={16} label="h" />
    </div>
  );
}

// ─── Card 5: Rituals (user-created + presets, writes to HabitLogs) ────────────
function Card5Rituals({ onSave, showToast }) {
  const presets = ['Moon wind-down', '10 min reading', 'Breathwork', 'Supplement routine'];
  const [customRituals, setCustomRituals] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [newRitual, setNewRitual] = useState('');

  const allRituals = [...presets, ...customRituals];

  const toggleRitual = (r) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(r)) {
        next.delete(r);
      } else {
        next.add(r);
        // Simulate HabitLogs.create({ habit_name, completed: true, date: today })
        showToast(`${r} logged to your habits`);
      }
      return next;
    });
    onSave();
  };

  const addRitual = () => {
    const name = newRitual.trim();
    if (!name) return;
    setCustomRituals((prev) => [...prev, name]);
    setNewRitual('');
    showToast(`${name} added`);
    onSave();
  };

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6,
      }}>
        <SectionLabel>Your Rituals</SectionLabel>
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>
          {completed.size}/{allRituals.length} today
        </span>
      </div>

      <div style={{ marginBottom: 10, maxHeight: 130, overflowY: 'auto' }}>
        {allRituals.map((r) => (
          <div key={r} onClick={() => toggleRitual(r)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
            borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              border: `2px solid ${completed.has(r) ? T.sage : T.border}`,
              background: completed.has(r) ? T.sage : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {completed.has(r) && <Check size={11} strokeWidth={3} style={{ color: T.white }} />}
            </div>
            <span style={{
              fontSize: 12.5, color: T.espresso, fontWeight: 500,
              textDecoration: completed.has(r) ? 'line-through' : 'none',
              opacity: completed.has(r) ? 0.6 : 1,
            }}>{r}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(143,175,143,0.10)', border: `1px dashed ${T.sage}55`,
        borderRadius: 10, padding: '8px 10px',
      }}>
        <SectionLabel>Create ritual</SectionLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={newRitual}
            onChange={(e) => setNewRitual(e.target.value)}
            placeholder="e.g. Sunday slow morning"
            onKeyDown={(e) => e.key === 'Enter' && addRitual()}
            style={{
              flex: 1, padding: '7px 9px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.white,
              fontSize: 12, color: T.espresso, outline: 'none',
            }}
          />
          <button onClick={addRitual} disabled={!newRitual.trim()} style={{
            padding: '7px 12px', borderRadius: 8, border: 'none',
            background: newRitual.trim() ? T.espresso : 'rgba(58,44,26,0.18)',
            color: T.cream, fontSize: 12, fontWeight: 700, cursor: newRitual.trim() ? 'pointer' : 'not-allowed',
          }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ─── Card 6: Mind & Life ──────────────────────────────────────────────────────
function Card6Mind({ stage, onSave, showToast }) {
  const [journalText, setJournalText] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const saveTimer = useRef(null);

  const handleJournal = (e) => {
    const v = e.target.value;
    setJournalText(v);
    if (v.length >= 3) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { onSave(); showToast('Journal saved'); }, 800);
    }
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks((prev) => [...prev, taskInput.trim()]);
    setTaskInput('');
    onSave();
    showToast('Task added');
  };

  return (
    <div>
      <SectionLabel>Journal prompt</SectionLabel>
      <p style={{ fontSize: 12, color: T.muted, fontStyle: 'italic', marginBottom: 6, marginTop: 0 }}>
        {STAGE_JOURNAL[stage]}
      </p>
      <textarea
        value={journalText} onChange={handleJournal} placeholder="Write freely here…"
        style={{
          width: '100%', minHeight: 70, borderRadius: 10, border: `1.5px solid ${T.border}`,
          background: 'rgba(244,237,219,0.5)', padding: '8px 10px', fontSize: 12.5, color: T.espresso,
          resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          marginBottom: 12,
        }}
      />
      <SectionLabel>Quick task</SectionLabel>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={taskInput} onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task…"
          style={{
            flex: 1, borderRadius: 8, border: `1.5px solid ${T.border}`,
            background: 'rgba(244,237,219,0.5)', padding: '7px 10px',
            fontSize: 12.5, color: T.espresso, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button onClick={addTask} style={{
          padding: '7px 14px', borderRadius: 8, border: 'none', background: T.gold,
          color: T.espresso, fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
        }}>Add</button>
      </div>
      {tasks.length > 0 && (
        <div style={{ marginTop: 8, maxHeight: 60, overflowY: 'auto' }}>
          {tasks.map((t, i) => (
            <div key={i} style={{ fontSize: 11.5, color: T.muted, padding: '3px 0', paddingLeft: 4 }}>
              • {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Engagement strip — compact, ~80px tall, scrolls within strip ─────────────
function EngagementStrip({ stage }) {
  const cards = ENGAGEMENT_RAIL[stage] || ENGAGEMENT_RAIL.luteal;
  return (
    <div style={{
      padding: '8px 16px 10px',
      borderTop: `1px solid ${T.border}`,
      background: 'rgba(58,44,26,0.03)',
    }}>
      <div style={{
        fontSize: 9.5, fontWeight: 800, color: T.muted, textTransform: 'uppercase',
        letterSpacing: '0.16em', marginBottom: 6,
      }}>From across your app</div>
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
        paddingBottom: 2,
      }}>
        {cards.map((c, i) => {
          const Glyph = c.Icon;
          return (
            <button key={i} style={{
              flexShrink: 0, width: 140, height: 72,
              padding: '8px 10px', borderRadius: 10,
              background: `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})`,
              color: T.cream, cursor: 'pointer', border: 'none', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 3px 8px rgba(0,0,0,0.20)',
            }}>
              <Glyph size={48} style={{
                position: 'absolute', right: -10, bottom: -10,
                color: 'rgba(244,237,219,0.18)',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: 8, letterSpacing: '0.14em', fontWeight: 800,
                  color: 'rgba(244,237,219,0.72)', textTransform: 'uppercase',
                }}>{c.type}</div>
                <div style={{
                  fontSize: 11.5, fontWeight: 700, color: T.cream, marginTop: 2,
                  lineHeight: 1.2,
                }}>{c.title}</div>
              </div>
              <div style={{
                position: 'relative', zIndex: 1,
                fontSize: 9.5, color: 'rgba(244,237,219,0.72)',
              }}>{c.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main SmartLoggerV4 ───────────────────────────────────────────────────────
export default function SmartLoggerV4() {
  const [open, setOpen] = useState(true);     // demo opens by default
  const [stage, setStage] = useState('luteal');
  const [currentCard, setCurrentCard] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef(null);
  const dragStart = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ message: msg, visible: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 1500);
  }, []);

  const markDone = useCallback((idx) => {
    setCompleted((prev) => { const next = new Set(prev); next.add(idx); return next; });
    showToast('Saved');
  }, [showToast]);

  const makeOnSave = (cardIdx) => () => markDone(cardIdx);

  // Swipe handling
  const handleDragStart = (clientX) => { dragStart.current = clientX; };
  const handleDragEnd = (clientX) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - clientX;
    dragStart.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0 && currentCard < TOTAL_CARDS - 1) setCurrentCard((c) => c + 1);
    if (delta < 0 && currentCard > 0)                setCurrentCard((c) => c - 1);
  };

  // 3D card transform per index
  const cardTransform = (pos) => {
    const diff = pos - currentCard;
    if (diff === 0)  return { x: '0%',     scale: 1,    opacity: 1,    rotateY: 0,   zIndex: 10 };
    if (diff === 1)  return { x: '75%',    scale: 0.92, opacity: 0.65, rotateY: -8,  zIndex: 9 };
    if (diff >= 2)   return { x: '150%',   scale: 0.85, opacity: 0,    rotateY: -10, zIndex: 8 };
    if (diff === -1) return { x: '-105%',  scale: 0.88, opacity: 0,    rotateY: 12,  zIndex: 7 };
    return            { x: '-200%',  scale: 0.85, opacity: 0,    rotateY: 14,  zIndex: 6 };
  };

  const renderCard = (i) => {
    switch (i) {
      case 0: return <Card1SmartBody stage={stage} onSave={makeOnSave(0)} />;
      case 1: return <Card2Period onSave={makeOnSave(1)} />;
      case 2: return <Card3Nourish onSave={makeOnSave(2)} />;
      case 3: return <Card4Health onSave={makeOnSave(3)} showToast={showToast} />;
      case 4: return <Card5Rituals onSave={makeOnSave(4)} showToast={showToast} />;
      case 5: return <Card6Mind stage={stage} onSave={makeOnSave(5)} showToast={showToast} />;
      default: return null;
    }
  };

  const cardTitle = (i) => {
    const Icon = CARD_ICONS[i];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8,
          background: `${T.gold}22`, color: T.goldDeep,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><Icon size={14} /></span>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: T.espresso }}>{CARD_LABELS[i]}</span>
        <div style={{ flex: 1 }} />
        {i < TOTAL_CARDS - 1 && (
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
      {/* Stage selector — page-level above the sheet */}
      <div style={{
        display: 'flex', gap: 6, justifyContent: 'center',
        padding: '14px 12px 16px', flexWrap: 'wrap',
      }}>
        {STAGES.map((s) => (
          <button key={s.id} onClick={() => setStage(s.id)} style={{
            padding: '9px 16px', borderRadius: 9999,
            border: `1.5px solid ${stage === s.id ? T.espresso : T.border}`,
            background: stage === s.id ? T.espresso : T.paperHi,
            color: stage === s.id ? T.cream : T.espresso,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s ease',
            letterSpacing: '0.02em',
          }}>{s.label}</button>
        ))}
      </div>

      {open ? (
        <div style={{
          background: T.cream, borderRadius: 20,
          boxShadow: '0 8px 30px rgba(58,44,26,0.12)',
          border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px 8px',
            borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.espresso }}>Daily Log</span>
            <button onClick={() => setOpen(false)} aria-label="Close sheet" style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(58,44,26,0.06)', border: 'none', cursor: 'pointer',
              color: T.muted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><XIcon size={13} /></button>
          </div>

          <ProgressBar completed={completed} />
          <PillNav current={currentCard} completed={completed} onSelect={setCurrentCard} />

          {/* 3D card deck — fixed height, no outer scroll */}
          <div
            style={{
              position: 'relative', height: 320, margin: '10px 0 4px',
              overflow: 'hidden',
              perspective: '1200px', perspectiveOrigin: '50% 30%',
            }}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseUp={(e)   => handleDragEnd(e.clientX)}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchEnd={(e)   => handleDragEnd(e.changedTouches[0].clientX)}
          >
            {Array.from({ length: TOTAL_CARDS }, (_, i) => {
              const { x, scale, opacity, rotateY, zIndex } = cardTransform(i);
              const isActive = i === currentCard;
              return (
                <div key={i} style={{
                  position: 'absolute', top: 0, left: '50%',
                  width: 'calc(100% - 32px)',
                  transform: `translateX(calc(-50% + ${x})) scale(${scale}) rotateY(${rotateY}deg)`,
                  transformStyle: 'preserve-3d',
                  opacity, zIndex,
                  transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease',
                  background: T.cardBg, borderRadius: 16, padding: '12px 14px',
                  boxShadow: isActive
                    ? '0 20px 60px rgba(58,44,26,0.18), 0 4px 16px rgba(58,44,26,0.12)'
                    : '0 6px 18px rgba(58,44,26,0.08)',
                  border: `1px solid ${T.border}`,
                  overflowY: 'auto', maxHeight: 304,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}>
                  {cardTitle(i)}
                  {renderCard(i)}
                </div>
              );
            })}
          </div>

          {/* Engagement strip — compact, always visible, NO outer scroll */}
          <EngagementStrip stage={stage} />
        </div>
      ) : (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          background: T.cream, borderRadius: 20,
          border: `1px dashed ${T.border}`, color: T.muted, fontSize: 13,
        }}>
          Sheet closed — tap the gold + to reopen.
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)} aria-label="Open Smart Logger"
          style={{
            position: 'absolute', bottom: 24, right: 16,
            width: 56, height: 56, borderRadius: '50%',
            background: T.gold, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(212,175,55,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
          }}
        ><Plus size={26} style={{ color: T.espresso }} strokeWidth={2.6} /></button>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
