import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Heart, Droplets, Utensils, Pill, Sparkles, Pen,
  X as XIcon, Check, Plus, Minus,
  Coffee, Wine, Flame,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useScrollLock } from '@/utils/useScrollLock';

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
  rose:     '#D45E52',
  plum:     '#4A2A3A',
  white:    '#FFFFFF',
  cardBg:   '#FAF6EE',
  paperHi:  '#FFFFFF',
  border:   'rgba(58,44,26,0.12)',
};

const PROGRESS_COPY = [
  'Start logging','Getting started','Keep going','Halfway there','Looking great','Almost there','One more left','All done today',
];

const CARD_LABELS = ['Check-in', 'Nourish', 'Health', 'Rituals', 'Mind & Life'];
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
  luteal:        'What is your body asking for most right now?',
  pregnant:      'What moment made you smile today?',
  perimenopause: 'What helped you feel most like yourself today?',
  ttc:           'What intention are you holding this cycle?',
};

const STAGE_NUTRITION_TIP = {
  luteal:        'Luteal phase: magnesium-rich foods support mood. Try nuts, seeds, leafy greens.',
  pregnant:      'Trimester 2: +300 kcal needed. Focus on folate, iron, calcium.',
  perimenopause: 'Phytoestrogens (flaxseed, soy) and calcium support symptoms and bone health.',
  ttc:           'Whole foods + folate (400μg). Limit alcohol; moderate caffeine.',
};

const MOOD_LABELS = ['Awful', 'Low', 'Okay', 'Good', 'Great'];
const SEVERITY_CYCLE = ['mild', 'moderate', 'severe'];
const SEVERITY_COLOR = { mild: T.sage, moderate: T.gold, severe: T.rose };

const DRINK_PRESETS = [
  { id: 'water',     label: 'Water',      ml: 250, kcal: 0,   Icon: Droplets, tone: '#60B4FA' },
  { id: 'coffee',    label: 'Coffee',     ml: 250, kcal: 5,   Icon: Coffee,   tone: T.espresso },
  { id: 'tea',       label: 'Tea',        ml: 250, kcal: 2,   Icon: Coffee,   tone: T.muted },
  { id: 'softdrink', label: 'Soft drink', ml: 330, kcal: 140, Icon: Droplets, tone: T.gold },
  { id: 'juice',     label: 'Juice',      ml: 250, kcal: 110, Icon: Droplets, tone: T.blush },
  { id: 'alcohol',   label: 'Alcohol',    ml: 250, kcal: 180, Icon: Wine,     tone: T.plum },
  { id: 'smoothie',  label: 'Smoothie',   ml: 350, kcal: 200, Icon: Droplets, tone: T.sage },
  { id: 'milk',      label: 'Milk',       ml: 250, kcal: 120, Icon: Droplets, tone: T.cream },
];

const CARD_ICONS = [Heart, Utensils, Pill, Sparkles, Pen];

// ── Live entity writers (best-effort, swallow errors) ────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const now   = () => new Date().toISOString();

async function getUserId() {
  try {
    const me = await base44.entities.User.me();
    return me?.id || null;
  } catch { return null; }
}

async function writeCheckin(patch) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    const date = today();
    const existing = await base44.entities.DailyCheckins.filter({ user_id, date }, '-updated_at', 1).catch(() => []);
    const row = (existing || [])[0];
    const body = { ...patch, updated_at: now() };
    if (row?.id) await base44.entities.DailyCheckins.update(row.id, body);
    else         await base44.entities.DailyCheckins.create({ user_id, date, ...body });
  } catch { /* silent */ }
}

async function writeSymptom(symptom_type, severity) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.SymptomLogs.create({
      user_id, date: today(), symptom_type, severity: severity === 'mild' ? 1 : severity === 'moderate' ? 3 : 5,
      created_at: now(), updated_at: now(),
    });
  } catch { /* silent */ }
}

async function writeMedLog(item_name, dose) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.MedicationLogs.create({
      user_id, date: today(), item_name, dose: dose ? String(dose) : '', taken: true,
      created_at: now(), updated_at: now(),
    });
  } catch { /* silent */ }
}

async function writeMeal(meal) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.MealLog.create({
      user_id, logged_at: now(), day_key: today(),
      meal_type: meal.meal_type, method: 'text',
      raw_text: meal.description,
      notes: [
        meal.portion ? `portion:${meal.portion}` : null,
        meal.cal ? `kcal:${meal.cal}` : null,
        meal.p ? `p:${meal.p}` : null,
        meal.c ? `c:${meal.c}` : null,
        meal.f ? `f:${meal.f}` : null,
      ].filter(Boolean).join(' · '),
    });
  } catch { /* silent */ }
}

async function writeHydration(amount_ml, drink_type) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    if (drink_type === 'water') {
      await base44.entities.HydrationLog.create({
        user_id, day_key: today(), amount_ml, logged_at: now(), source: 'manual',
      });
    } else {
      await base44.entities.DrinkLog.create({
        user_id, day_key: today(), drink_type, amount_ml, logged_at: now(),
      });
    }
  } catch { /* silent */ }
}

async function writeHabit(habit_name) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.HabitLogs.create({
      user_id, date: today(), habit_type: habit_name, habit_category: 'other', completed: true,
      created_at: now(), updated_at: now(),
    });
  } catch { /* silent */ }
}

async function writeJournal(text, mood_rating) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.JournalEntries.create({
      user_id, session_date: today(), text,
      tags: ['logger'], mood_rating: mood_rating || null,
      prompt: 'SmartLogger journal',
    });
  } catch { /* silent */ }
}

async function writeTask(title) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    await base44.entities.PersonalTasks.create({
      user_id, date: tomorrow.toISOString().split('T')[0], title,
      category: 'personal', completed: false,
      created_at: now(), updated_at: now(),
    });
  } catch { /* silent */ }
}

async function writeCycleEvent(event_type) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.CycleEvents.create({
      user_id, date: today(), event_type,
      created_at: now(), updated_at: now(),
    });
  } catch { /* silent */ }
}

async function writeSession({ session_type, duration_minutes, intensity }) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    // WellnessSessions is a catalog — use HabitLogs as the actual movement log.
    await base44.entities.HabitLogs.create({
      user_id, date: today(),
      habit_type: `${session_type} · ${duration_minutes}min${intensity ? ' · ' + intensity : ''}`,
      habit_category: 'movement', completed: true,
      amount: duration_minutes, unit: 'min',
      created_at: now(), updated_at: now(),
    });
  } catch { /* silent */ }
}

// ─── Toast ───────────────────────────────────────────────────────────────────
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
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)', maxWidth: '90%',
    }}>
      <Check size={13} strokeWidth={3} /> {message}
    </div>
  );
}

// ─── Pill nav ────────────────────────────────────────────────────────────────
function PillNav({ current, completed, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 16px 4px', scrollbarWidth: 'none' }}>
      {CARD_LABELS.map((label, i) => {
        const isActive = i === current;
        const isDone = completed.has(i);
        return (
          <button key={i} onClick={() => onSelect(i)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 11.5, fontWeight: 700, transition: 'all 0.2s ease',
            background: isActive ? T.gold : isDone ? T.sage : 'rgba(58,44,26,0.10)',
            color: isActive ? T.espresso : isDone ? T.white : T.muted,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {isDone && !isActive && <Check size={11} strokeWidth={3} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ProgressBar({ completed }) {
  const count = completed.size;
  const copy = PROGRESS_COPY[Math.min(count, PROGRESS_COPY.length - 1)];
  return (
    <div style={{ padding: '10px 16px 4px' }}>
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

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase',
      letterSpacing: '0.12em', marginBottom: 8, marginTop: 4,
    }}>{children}</div>
  );
}

function ChipRow({ options, selected, onToggle, multi = true, small = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: small ? '6px 12px' : '8px 14px', borderRadius: 14,
            border: `1.5px solid ${active ? T.gold : T.border}`,
            background: active ? `${T.gold}22` : 'transparent',
            color: active ? T.espresso : T.espresso,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.18s ease', minHeight: 32,
          }}>{opt}</button>
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
          fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0,
        }}>{i + 1}</button>
      ))}
    </div>
  );
}

function Counter({ value, onChange, step = 1, min = 0, max = 99, label = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))} style={{
        width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${T.border}`,
        background: T.white, color: T.espresso, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Minus size={14} /></button>
      <span style={{ minWidth: 48, textAlign: 'center', fontWeight: 700, fontSize: 14, color: T.espresso }}>
        {value}{label}
      </span>
      <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))} style={{
        width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${T.border}`,
        background: T.white, color: T.espresso, cursor: 'pointer',
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
        width: 38, height: 22, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s',
        background: checked ? T.gold : 'rgba(58,44,26,0.2)', position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2, width: 18, height: 18,
          borderRadius: '50%', background: T.white, transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

function MoodPills({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {MOOD_LABELS.map((m, i) => {
        const active = value === i + 1;
        return (
          <button key={m} onClick={() => onChange(i + 1)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 14, minHeight: 36,
            border: `1.5px solid ${active ? T.gold : T.border}`,
            background: active ? T.gold : T.paperHi,
            color: active ? T.espresso : T.muted,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>{m}</button>
        );
      })}
    </div>
  );
}

// ─── Mini dot rating (28×28, for compact 3-col vitals grid) ──────────────────
function MiniDots({ value, onChange, color = T.gold }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <button key={i} onClick={() => onChange(i + 1)} style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `2px solid ${i < value ? color : T.border}`,
          background: i < value ? color : 'transparent',
          color: i < value ? T.espresso : T.muted,
          fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0,
        }}>{i + 1}</button>
      ))}
    </div>
  );
}

// ─── Card 1: Smart & Body (compact 5-row layout, fits without scroll) ────────
function Card1Checkin({ stage, onSave, showToast }) {
  const [mood, setMood] = useState(0);
  const [influences, setInfluences] = useState([]);
  const [influencesOpen, setInfluencesOpen] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [stress, setStress] = useState(0);
  const [sleep, setSleep] = useState(7.0);
  const [symptoms, setSymptoms] = useState({}); // { name: 'mild'|'moderate'|'severe' }
  // Period (merged in from old Card2)
  const [periodStatus, setPeriodStatus] = useState('');
  const [flow, setFlow] = useState('');
  const [pain, setPain] = useState(0);
  const showFlow = ['Period start', 'Ongoing'].includes(periodStatus);

  // Trimmed to the 8 most-tapped — keeps the row to two lines max.
  const QUICK_SYMPTOMS = ['Cramps','Bloating','Headache','Fatigue','Nausea','Brain fog','Mood swings','Back pain'];

  const handleMood    = (v) => { setMood(v);    writeCheckin({ mood: v });         showToast(`Mood: ${MOOD_LABELS[v-1]}`); onSave(); };
  const handleEnergy  = (v) => { setEnergy(v);  writeCheckin({ energy: v });       onSave(); };
  const handleStress  = (v) => { setStress(v);  writeCheckin({ stress: v });       onSave(); };
  const handleSleep   = (v) => { setSleep(v);   writeCheckin({ sleep_hours: v });  onSave(); };
  const handlePeriodStatus = (opt) => {
    setPeriodStatus(opt);
    const map = { 'Period start': 'period_start', 'Ongoing': 'period_ongoing', 'Period end': 'period_end', 'Spotting': 'spotting', 'No period': 'no_period' };
    if (map[opt]) writeCycleEvent(map[opt]);
    showToast(`${opt} logged`);
    onSave();
  };
  const handleFlow = (opt) => { setFlow(opt); writeCheckin({ period_flow: opt.toLowerCase().replace(' ', '_') }); showToast(`Flow: ${opt}`); onSave(); };
  const handlePain = (v) => { setPain(v); const sev = v <= 1 ? 'mild' : v <= 3 ? 'moderate' : 'severe'; writeSymptom('Cramps', sev); onSave(); };
  const toggleInfluence = (opt) => setInfluences(prev => {
    const next = prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt];
    onSave(); return next;
  });

  const cycleSeverity = (sym) => {
    setSymptoms(prev => {
      const next = { ...prev };
      if (!(sym in next)) {
        next[sym] = 'mild';
        writeSymptom(sym, 'mild'); showToast(`${sym} · mild`);
      } else {
        const idx = SEVERITY_CYCLE.indexOf(next[sym]);
        if (idx >= SEVERITY_CYCLE.length - 1) {
          delete next[sym];
        } else {
          next[sym] = SEVERITY_CYCLE[idx + 1];
          writeSymptom(sym, next[sym]); showToast(`${sym} · ${next[sym]}`);
        }
      }
      onSave();
      return next;
    });
  };

  const miniLabel = {
    fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase',
    letterSpacing: '0.10em', marginBottom: 6, textAlign: 'center',
  };

  return (
    <div>
      {/* Row 1 — Mood */}
      <SectionLabel>How are you?</SectionLabel>
      <div style={{ marginBottom: 10 }}>
        <MoodPills value={mood} onChange={handleMood} />
      </div>

      {/* Row 2 — Energy + Stress (2-col grid) */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        marginBottom: 10, padding: '8px 6px',
        background: 'rgba(58,44,26,0.04)', borderRadius: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={miniLabel}>Energy</div>
          <MiniDots value={energy} onChange={handleEnergy} color={T.gold} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={miniLabel}>Stress</div>
          <MiniDots value={stress} onChange={handleStress} color={T.blush} />
        </div>
      </div>

      {/* Row 3 — Sleep hours: single horizontal row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, padding: '4px 2px',
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>Sleep last night</span>
        <Counter value={sleep} onChange={handleSleep} step={0.5} min={0} max={16} label="h" />
      </div>

      {/* Row 4 — Period (merged from old Card2 — no contraception) */}
      <SectionLabel>Period</SectionLabel>
      <div style={{ marginBottom: 8 }}>
        <ChipRow
          options={['Period start','Ongoing','Period end','Spotting','No period']}
          selected={periodStatus} onToggle={handlePeriodStatus} multi={false} small
        />
      </div>
      {showFlow && (
        <div style={{ marginBottom: 8 }}>
          <ChipRow options={['Light','Medium','Heavy','Very heavy']} selected={flow} onToggle={handleFlow} multi={false} small />
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, padding: '2px 2px',
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>Pain level</span>
        <DotRating value={pain} onChange={handlePain} color={T.blush} />
      </div>

      {/* Row 5 — Symptoms (compact chips, severity cycling) */}
      <SectionLabel>Symptoms</SectionLabel>
      <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {QUICK_SYMPTOMS.map(s => {
          const sev = symptoms[s];
          const active = !!sev;
          const color = active ? SEVERITY_COLOR[sev] : T.border;
          return (
            <button key={s} onClick={() => cycleSeverity(s)} style={{
              padding: '6px 12px', borderRadius: 12, minHeight: 34,
              border: `1.5px solid ${color}`,
              background: active ? `${color}22` : 'transparent',
              color: T.espresso, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              {s}
              {active && <span style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 7,
                background: color, color: T.white, fontWeight: 800,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>{sev[0]}</span>}
            </button>
          );
        })}
      </div>

      {/* Row 5 — Collapsible "What's influencing you?" */}
      <button
        onClick={() => setInfluencesOpen(v => !v)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 12,
          background: influencesOpen ? `${T.gold}14` : 'rgba(58,44,26,0.04)',
          border: `1px solid ${influencesOpen ? T.gold : T.border}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, fontWeight: 700, color: T.espresso,
          letterSpacing: '0.02em',
        }}
      >
        What's influencing you?
        {influences.length > 0 && (
          <span style={{ fontSize: 11, color: T.goldDeep, fontWeight: 700 }}>
            {influences.length} selected
          </span>
        )}
        <span style={{ marginLeft: 8, fontSize: 14, color: T.muted }}>
          {influencesOpen ? '−' : '+'}
        </span>
      </button>
      {influencesOpen && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {['Sleep','Stress','Exercise','Nutrition','Social','Hormones'].map(opt => {
            const active = influences.includes(opt);
            return (
              <button key={opt} onClick={() => toggleInfluence(opt)} style={{
                padding: '6px 12px', borderRadius: 12, minHeight: 34,
                border: `1.5px solid ${active ? T.gold : T.border}`,
                background: active ? `${T.gold}22` : 'transparent',
                color: T.espresso, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{opt}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// (Old Card 2: Period & Cycle merged into Card1Checkin above.)

// ─── Card 2: Nourish (full meal logger + drinks rail) ────────────────────────
function Card3Nourish({ stage, onSave, showToast }) {
  const [activeMeal, setActiveMeal] = useState(null);
  const [description, setDescription] = useState('');
  const [portion, setPortion] = useState('Medium');
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [hydrationMl, setHydrationMl] = useState(0);

  const logMeal = () => {
    if (!description.trim() || !activeMeal) return;
    const meal = { meal_type: activeMeal.toLowerCase(), description: description.trim(), portion };
    writeMeal(meal);
    setLoggedMeals(prev => [...prev, meal]);
    showToast(`${activeMeal} logged — ${description.trim().slice(0, 30)}`);
    setDescription('');
    setActiveMeal(null);
    onSave();
  };

  const removeMeal = (idx) => setLoggedMeals(prev => prev.filter((_, i) => i !== idx));

  const tapDrink = (d) => {
    setHydrationMl(prev => prev + d.ml);
    writeHydration(d.ml, d.id);
    showToast(`${d.label} — ${d.ml}ml logged`);
    onSave();
  };

  return (
    <div>
      <SectionLabel>Meal</SectionLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {['Breakfast','Lunch','Dinner','Snack'].map(m => {
          const active = activeMeal === m;
          return (
            <button key={m} onClick={() => setActiveMeal(active ? null : m)} style={{
              padding: '6px 12px', borderRadius: 9999, minHeight: 34,
              border: 'none',
              background: active ? T.espresso : 'rgba(58,44,26,0.08)',
              color: active ? T.white : T.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize',
            }}>{m}</button>
          );
        })}
      </div>

      {activeMeal && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder={`What did you eat for ${activeMeal.toLowerCase()}?`}
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', borderRadius: 10, minHeight: 60, height: 60,
              border: `1.5px solid ${T.border}`, background: T.white,
              fontSize: 13, color: T.espresso, outline: 'none', marginBottom: 8,
              resize: 'none', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {['Small','Medium','Large'].map(p2 => (
              <button key={p2} onClick={() => setPortion(p2)} style={{
                flex: 1, padding: '6px 10px', borderRadius: 14, minHeight: 34,
                border: `1.5px solid ${portion === p2 ? T.gold : T.border}`,
                background: portion === p2 ? `${T.gold}22` : T.white,
                color: T.espresso, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{p2}</button>
            ))}
          </div>
          <button onClick={logMeal} disabled={!description.trim()} style={{
            padding: '8px 20px', borderRadius: 9999, border: 'none',
            background: description.trim() ? T.espresso : 'rgba(58,44,26,0.20)',
            color: T.cream, fontWeight: 600, fontSize: 13, cursor: description.trim() ? 'pointer' : 'not-allowed',
            minHeight: 36,
          }}>Log meal</button>
        </div>
      )}

      {loggedMeals.length > 0 && (
        <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {loggedMeals.slice(0, 4).map((m, i) => (
            <button key={i} onClick={() => removeMeal(i)} style={{
              padding: '5px 10px', borderRadius: 14, background: T.sage,
              color: T.white, fontSize: 11.5, fontWeight: 600, border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 28,
            }}>
              <Check size={11} strokeWidth={3} />
              {m.meal_type[0].toUpperCase() + m.meal_type.slice(1)} · {m.description.slice(0, 18)}{m.description.length > 18 ? '…' : ''}
              <XIcon size={10} style={{ marginLeft: 1 }} />
            </button>
          ))}
        </div>
      )}

      <SectionLabel>Drinks</SectionLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {DRINK_PRESETS.map(d => (
          <button key={d.id} onClick={() => tapDrink(d)} style={{
            padding: '6px 12px', borderRadius: 14, minHeight: 36,
            background: `${d.tone}1F`, border: `1.5px solid ${d.tone}55`,
            color: T.espresso, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <d.Icon size={12} style={{ color: d.tone }} />
            {d.label}
            <span style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>+{d.ml}</span>
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: T.muted, marginBottom: 3 }}>
          <span><strong style={{ color: T.espresso }}>{hydrationMl}ml</strong> / 2,000ml</span>
          <span>{Math.round((hydrationMl / 2000) * 100)}%</span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(58,44,26,0.12)' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${Math.min(100, (hydrationMl / 2000) * 100)}%`,
            background: '#60B4FA', transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Card 4: Health (meds + exercise) ────────────────────────────────────────
function Card4Health({ onSave, showToast }) {
  const presetMeds = ['Iron supplement', 'Vitamin D', 'Magnesium'];
  const [recentMeds, setRecentMeds] = useState([]);
  const [customMeds, setCustomMeds] = useState([]);
  const [taken, setTaken] = useState(new Set());
  const [expandMeds, setExpandMeds] = useState(false);

  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user_id = await getUserId();
        if (!user_id || cancelled) return;
        const rows = await base44.entities.MedicationLogs.filter({ user_id }, '-created_date', 60).catch(() => []);
        if (cancelled) return;
        const seen = new Set();
        const uniques = [];
        for (const r of rows || []) {
          if (r?.item_name && !seen.has(r.item_name) && !presetMeds.includes(r.item_name)) {
            seen.add(r.item_name); uniques.push(r.item_name);
          }
          if (uniques.length >= 6) break;
        }
        setRecentMeds(uniques);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const allMeds = [...presetMeds, ...recentMeds, ...customMeds.map(m => `${m.name}${m.dosage ? ' ' + m.dosage : ''}`)];
  const visibleMeds = expandMeds ? allMeds : allMeds.slice(0, 3);
  const hiddenCount = allMeds.length - 3;

  const toggleMed = (med) => {
    setTaken(prev => {
      const next = new Set(prev);
      if (next.has(med)) next.delete(med);
      else {
        next.add(med);
        const custom = customMeds.find(m => `${m.name}${m.dosage ? ' ' + m.dosage : ''}` === med);
        writeMedLog(custom?.name || med, custom?.dosage);
        showToast(`${med} logged`);
      }
      return next;
    });
    onSave();
  };

  const addMed = () => {
    const name = newName.trim();
    if (!name) return;
    const m = { name, dosage: newDosage.trim() };
    setCustomMeds(prev => [...prev, m]);
    writeMedLog(name, newDosage.trim());
    showToast(`${name}${newDosage.trim() ? ' ' + newDosage.trim() : ''} logged`);
    setNewName(''); setNewDosage('');
    onSave();
  };

  return (
    <div>
      <SectionLabel>Medications today</SectionLabel>
      {allMeds.length === 0 && (
        <div style={{ fontSize: 11.5, color: T.muted, fontStyle: 'italic', marginBottom: 10 }}>
          No medications set up — add one below.
        </div>
      )}
      <div style={{ marginBottom: 10 }}>
        {visibleMeds.map((med) => (
          <div key={med} onClick={() => toggleMed(med)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0',
            borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `2px solid ${taken.has(med) ? T.gold : T.border}`,
              background: taken.has(med) ? T.gold : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {taken.has(med) && <Check size={10} strokeWidth={3} style={{ color: T.espresso }} />}
            </div>
            <span style={{ fontSize: 12, color: T.espresso, fontWeight: 500 }}>{med}</span>
          </div>
        ))}
        {!expandMeds && hiddenCount > 0 && (
          <button onClick={() => setExpandMeds(true)} style={{
            background: 'transparent', border: 'none', color: T.goldDeep,
            fontSize: 11, fontWeight: 600, padding: '6px 0', cursor: 'pointer',
          }}>+ {hiddenCount} more</button>
        )}
      </div>

      <div style={{
        background: 'rgba(212,175,55,0.08)', border: `1px dashed ${T.gold}55`,
        borderRadius: 10, padding: '8px 10px',
      }}>
        <SectionLabel>Add medication</SectionLabel>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Med name"
            style={{
              flex: 2, minWidth: 0, padding: '6px 9px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.white,
              fontSize: 11.5, color: T.espresso, outline: 'none',
            }}
          />
          <input
            value={newDosage} onChange={e => setNewDosage(e.target.value)}
            placeholder="Dosage"
            style={{
              flex: 1, minWidth: 0, padding: '6px 9px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.white,
              fontSize: 11.5, color: T.espresso, outline: 'none',
            }}
          />
          <button onClick={addMed} disabled={!newName.trim()} style={{
            padding: '6px 11px', borderRadius: 8, border: 'none',
            background: newName.trim() ? T.espresso : 'rgba(58,44,26,0.18)',
            color: T.cream, fontSize: 11.5, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Card 5: Rituals (real HabitLogs presets + create) ───────────────────────
function Card5Rituals({ onSave, showToast }) {
  const seedPresets = ['Moon wind-down', '10 min reading', 'Breathwork', 'Supplement routine'];
  const [recentHabits, setRecentHabits] = useState([]);
  const [streaks, setStreaks] = useState({}); // habit_type → streak count
  const [customRituals, setCustomRituals] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [newRitual, setNewRitual] = useState('');

  // Pull user's recent habits + compute streaks from HabitLogs.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user_id = await getUserId();
        if (!user_id || cancelled) return;
        const rows = await base44.entities.HabitLogs.filter({ user_id }, '-date', 200).catch(() => []);
        if (cancelled) return;
        const byHabit = new Map();
        for (const r of rows || []) {
          const name = r?.habit_type;
          if (!name) continue;
          if (!byHabit.has(name)) byHabit.set(name, []);
          byHabit.get(name).push(r.date);
        }
        const uniques = [];
        const strk = {};
        for (const [name, dates] of byHabit) {
          if (seedPresets.includes(name)) continue;
          // Simple streak: how many consecutive past days from latest log
          const sortedDesc = [...new Set(dates)].sort().reverse();
          let count = 0;
          for (let i = 0; i < sortedDesc.length; i++) {
            const d = new Date(sortedDesc[i]);
            const expected = new Date(); expected.setDate(expected.getDate() - i);
            if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) count++;
            else break;
          }
          strk[name] = count;
          if (uniques.length < 6) uniques.push(name);
        }
        setRecentHabits(uniques);
        setStreaks(strk);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const allRituals = [...seedPresets, ...recentHabits, ...customRituals];

  const toggleRitual = (r) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else {
        next.add(r);
        writeHabit(r);
        showToast(`${r} — streak continues`);
      }
      return next;
    });
    onSave();
  };

  const addRitual = () => {
    const name = newRitual.trim();
    if (!name) return;
    setCustomRituals(prev => [...prev, name]);
    setCompleted(prev => { const n = new Set(prev); n.add(name); return n; });
    writeHabit(name);
    showToast(`${name} added & logged`);
    setNewRitual('');
    onSave();
  };

  const visibleRituals = allRituals.slice(0, 4);
  const hiddenCount = allRituals.length - 4;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <SectionLabel>Your Rituals</SectionLabel>
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>
          {completed.size} done today
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        {visibleRituals.map(r => (
          <div key={r} onClick={() => toggleRitual(r)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0',
            borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `2px solid ${completed.has(r) ? T.sage : T.border}`,
              background: completed.has(r) ? T.sage : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {completed.has(r) && <Check size={10} strokeWidth={3} style={{ color: T.white }} />}
            </div>
            <span style={{
              flex: 1,
              fontSize: 12, color: T.espresso, fontWeight: 500,
              textDecoration: completed.has(r) ? 'line-through' : 'none',
              opacity: completed.has(r) ? 0.6 : 1,
            }}>{r}</span>
            {streaks[r] > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 10, fontWeight: 700, color: T.goldDeep,
                padding: '2px 6px', borderRadius: 9999, background: `${T.gold}22`,
              }}>
                <Flame size={9} /> {streaks[r]}
              </span>
            )}
          </div>
        ))}
        {hiddenCount > 0 && (
          <div style={{ fontSize: 10.5, color: T.muted, padding: '4px 0', fontStyle: 'italic' }}>
            + {hiddenCount} more in full list
          </div>
        )}
      </div>

      <div style={{
        background: 'rgba(143,175,143,0.10)', border: `1px dashed ${T.sage}55`,
        borderRadius: 10, padding: '8px 10px',
      }}>
        <SectionLabel>Create ritual</SectionLabel>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <input
            value={newRitual} onChange={e => setNewRitual(e.target.value)}
            placeholder="e.g. Slow morning"
            onKeyDown={e => e.key === 'Enter' && addRitual()}
            style={{
              flex: 1, minWidth: 0, padding: '6px 9px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.white,
              fontSize: 11.5, color: T.espresso, outline: 'none',
            }}
          />
          <button onClick={addRitual} disabled={!newRitual.trim()} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: newRitual.trim() ? T.espresso : 'rgba(58,44,26,0.18)',
            color: T.cream, fontSize: 11.5, fontWeight: 700, cursor: newRitual.trim() ? 'pointer' : 'not-allowed',
          }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ─── Card 6: Mind & Life ─────────────────────────────────────────────────────
function Card6Mind({ stage, onSave, showToast }) {
  const [journalText, setJournalText] = useState('');
  const [moodTag, setMoodTag] = useState(0);
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [tonight, setTonight] = useState(new Set());
  const [movementType, setMovementType] = useState('');
  const [movementMin, setMovementMin] = useState(30);
  const saveTimer = useRef(null);

  const TONIGHT_LIST = ['Moon wind-down','10 min reading','Breathwork','Supplement routine'];

  const handleJournal = (e) => {
    const v = e.target.value;
    setJournalText(v);
    if (v.length >= 3) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        writeJournal(v, moodTag || null);
        showToast('Journal saved');
        onSave();
      }, 800);
    }
  };
  const tapMoodTag = (v) => {
    setMoodTag(v);
    if (journalText.length >= 3) writeJournal(journalText, v);
    onSave();
  };
  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(prev => [...prev, taskInput.trim()]);
    writeTask(taskInput.trim());
    showToast('Added to tomorrow');
    setTaskInput('');
    onSave();
  };
  const removeTask = (i) => setTasks(prev => prev.filter((_, j) => j !== i));
  const tapTonight = (item) => {
    setTonight(prev => {
      const n = new Set(prev);
      if (n.has(item)) n.delete(item);
      else { n.add(item); writeHabit(item); showToast(`${item} logged`); }
      return n;
    });
    onSave();
  };
  const tapMovement = (t) => {
    setMovementType(t);
    if (t === 'Rest') {
      writeSession({ session_type: 'Rest day', duration_minutes: 0, intensity: '' });
      showToast('Rest day logged');
    } else {
      writeSession({ session_type: t, duration_minutes: movementMin, intensity: '' });
      showToast(`${movementMin} min ${t} logged`);
    }
    onSave();
  };

  return (
    <div>
      <SectionLabel>Journal</SectionLabel>
      <p style={{ fontSize: 11, color: T.muted, fontStyle: 'italic', marginBottom: 5, marginTop: 0 }}>
        {STAGE_JOURNAL[stage]}
      </p>
      <textarea
        value={journalText} onChange={handleJournal} placeholder="Write freely…"
        rows={3}
        style={{
          width: '100%', height: 72, minHeight: 72, borderRadius: 10, border: `1.5px solid ${T.border}`,
          background: 'rgba(244,237,219,0.5)', padding: '6px 10px', fontSize: 12, color: T.espresso,
          resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          marginBottom: 6,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>Mood:</span>
        {[1,2,3,4,5].map(v => (
          <button key={v} onClick={() => tapMoodTag(v)} style={{
            width: 16, height: 16, borderRadius: '50%',
            border: `2px solid ${v <= moodTag ? T.gold : T.border}`,
            background: v <= moodTag ? T.gold : 'transparent',
            cursor: 'pointer', padding: 0,
          }} />
        ))}
      </div>

      <SectionLabel>Movement</SectionLabel>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        {['Walk','Yoga','Gym','Rest'].map(t => (
          <button key={t} onClick={() => tapMovement(t)} style={{
            padding: '5px 11px', borderRadius: 12, minHeight: 30,
            border: `1.5px solid ${movementType === t ? T.sage : T.border}`,
            background: movementType === t ? `${T.sage}22` : T.paperHi,
            color: T.espresso, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
          }}>{t}</button>
        ))}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          border: `1px solid ${T.border}`, borderRadius: 8, padding: '2px 5px', background: T.white,
        }}>
          <button onClick={() => setMovementMin(m => Math.max(0, m - 15))} style={{
            width: 18, height: 18, borderRadius: '50%', background: 'transparent',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.espresso,
          }}><Minus size={10} /></button>
          <span style={{ minWidth: 30, textAlign: 'center', fontSize: 11, fontWeight: 700, color: T.espresso }}>{movementMin}m</span>
          <button onClick={() => setMovementMin(m => m + 15)} style={{
            width: 18, height: 18, borderRadius: '50%', background: 'transparent',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.espresso,
          }}><Plus size={10} /></button>
        </div>
      </div>

      <SectionLabel>Add to tomorrow</SectionLabel>
      <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
        <input
          value={taskInput} onChange={e => setTaskInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="A task for tomorrow…"
          style={{
            flex: 1, minWidth: 0, padding: '6px 9px', borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.white, fontSize: 11.5, color: T.espresso, outline: 'none',
          }}
        />
        <button onClick={addTask} disabled={!taskInput.trim()} style={{
          padding: '6px 14px', borderRadius: 8, border: 'none',
          background: taskInput.trim() ? T.gold : 'rgba(58,44,26,0.18)',
          color: T.espresso, fontSize: 11.5, fontWeight: 700, cursor: taskInput.trim() ? 'pointer' : 'not-allowed',
        }}>Add</button>
      </div>
      {tasks.length > 0 && (
        <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tasks.slice(0, 4).map((t, i) => (
            <button key={i} onClick={() => removeTask(i)} style={{
              padding: '3px 8px', borderRadius: 12, background: `${T.gold}22`,
              color: T.espresso, fontSize: 10.5, fontWeight: 600, border: `1px solid ${T.gold}55`, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>{t.slice(0, 18)}{t.length > 18 ? '…' : ''} <XIcon size={10} /></button>
          ))}
        </div>
      )}

      <SectionLabel>Tonight wind-down</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        {TONIGHT_LIST.map(item => (
          <div key={item} onClick={() => tapTonight(item)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              border: `2px solid ${tonight.has(item) ? T.plum : T.border}`,
              background: tonight.has(item) ? T.plum : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {tonight.has(item) && <Check size={9} strokeWidth={3} style={{ color: T.white }} />}
            </div>
            <span style={{
              fontSize: 11.5, color: T.espresso, fontWeight: 500,
              textDecoration: tonight.has(item) ? 'line-through' : 'none',
              opacity: tonight.has(item) ? 0.6 : 1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main SmartLoggerV4 ──────────────────────────────────────────────────────
// Props:
//   mode: 'demo' (open inline, stage tabs above) | 'production' (FAB + bottom-sheet)
//   externalOpen / onCloseExternal: for production mode driven by the global
//     openLogger() / closeLogger() singletons.
export default function SmartLoggerV4({
  mode = 'demo',
  externalOpen, onCloseExternal,
  hideFAB = false,
} = {}) {
  const [open, setOpen] = useState(mode === 'demo' ? true : false);
  const [stage, setStage] = useState('luteal');
  const [currentCard, setCurrentCard] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef(null);
  const dragStart = useRef(null);

  // Production-mode external control via singleton openLogger.
  useEffect(() => {
    if (mode !== 'production') return;
    if (externalOpen) setOpen(true);
  }, [mode, externalOpen]);

  // Lock background page scroll while the sheet is open so iOS momentum +
  // accidental tab swipes can't move the page underneath (shared, ref-counted
  // hook — replaces the old ad-hoc html+body style lock).
  useScrollLock(mode === 'production' && open);

  const closeSheet = () => {
    setOpen(false);
    if (mode === 'production' && onCloseExternal) onCloseExternal();
  };

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ message: msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  }, []);

  const markDone = useCallback((idx) => {
    setCompleted(prev => { const next = new Set(prev); next.add(idx); return next; });
  }, []);

  const makeOnSave = (cardIdx) => () => markDone(cardIdx);

  const handleDragStart = (clientX) => { dragStart.current = clientX; };
  const handleDragEnd = (clientX) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - clientX;
    dragStart.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0 && currentCard < TOTAL_CARDS - 1) setCurrentCard(c => c + 1);
    if (delta < 0 && currentCard > 0)                setCurrentCard(c => c - 1);
  };

  // Flat horizontal-translate deck (no 3D rotateY — that was causing
  // sub-pixel render shifts that clipped the left edge of section labels).
  const cardTransform = (pos) => {
    const diff = pos - currentCard;
    if (diff === 0)  return { x: '0%',     scale: 1,    opacity: 1,    zIndex: 10 };
    if (diff === 1)  return { x: '88%',    scale: 0.94, opacity: 0.55, zIndex: 9 };
    if (diff >= 2)   return { x: '160%',   scale: 0.88, opacity: 0,    zIndex: 8 };
    if (diff === -1) return { x: '-100%',  scale: 0.94, opacity: 0,    zIndex: 7 };
    return            { x: '-200%',  scale: 0.88, opacity: 0,    zIndex: 6 };
  };

  const renderCard = (i) => {
    switch (i) {
      case 0: return <Card1Checkin stage={stage} onSave={makeOnSave(0)} showToast={showToast} />;
      case 1: return <Card3Nourish stage={stage} onSave={makeOnSave(1)} showToast={showToast} />;
      case 2: return <Card4Health onSave={makeOnSave(2)} showToast={showToast} />;
      case 3: return <Card5Rituals onSave={makeOnSave(3)} showToast={showToast} />;
      case 4: return <Card6Mind stage={stage} onSave={makeOnSave(4)} showToast={showToast} />;
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
        <span style={{ fontSize: 15, fontWeight: 800, color: T.espresso }}>{CARD_LABELS[i]}</span>
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

  // Sheet body (shared between demo and production)
  const sheetBody = (
    <div style={{
      background: T.cream, borderRadius: 20,
      boxShadow: '0 8px 30px rgba(58,44,26,0.12)',
      border: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      maxHeight: '88vh', height: '88vh',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px 6px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.espresso }}>Daily Log</span>
        <button onClick={closeSheet} aria-label="Close sheet" style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(58,44,26,0.06)', border: 'none', cursor: 'pointer',
          color: T.muted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}><XIcon size={13} /></button>
      </div>
      <ProgressBar completed={completed} />
      <PillNav current={currentCard} completed={completed} onSelect={setCurrentCard} />
      <div
        style={{
          position: 'relative', flex: 1, minHeight: 0,
          margin: '12px 12px 16px',
          overflow: 'hidden',
        }}
        onMouseDown={e => handleDragStart(e.clientX)}
        onMouseUp={e   => handleDragEnd(e.clientX)}
        onTouchStart={e => handleDragStart(e.touches[0].clientX)}
        onTouchEnd={e   => handleDragEnd(e.changedTouches[0].clientX)}
      >
        {Array.from({ length: TOTAL_CARDS }, (_, i) => {
          const { x, scale, opacity, zIndex } = cardTransform(i);
          const isActive = i === currentCard;
          return (
            <div key={i} style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              transform: `translateX(${x}) scale(${scale})`,
              transformOrigin: '50% 50%',
              opacity, zIndex,
              transition: 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease',
              background: T.cardBg, borderRadius: 18,
              boxShadow: isActive
                ? '0 20px 60px rgba(58,44,26,0.18), 0 4px 16px rgba(58,44,26,0.12)'
                : '0 6px 18px rgba(58,44,26,0.08)',
              border: `1px solid ${T.border}`,
              pointerEvents: isActive ? 'auto' : 'none',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
                {cardTitle(i)}
              </div>
              <div style={{
                padding: '0 20px 20px',
                flex: 1, minHeight: 0, overflowY: 'auto',
                overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch',
              }}>
                {renderCard(i)}
              </div>
            </div>
          );
        })}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );

  // DEMO mode (used inside /Ideas → Smart Logger tab)
  if (mode === 'demo') {
    return (
      <div style={{
        maxWidth: 480, margin: '0 auto', position: 'relative',
        padding: '0 0 24px',
      }}>
        <div style={{
          display: 'flex', gap: 6, justifyContent: 'center',
          padding: '14px 12px 16px', flexWrap: 'wrap',
        }}>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => setStage(s.id)} style={{
              padding: '9px 16px', borderRadius: 9999,
              border: `1.5px solid ${stage === s.id ? T.espresso : T.border}`,
              background: stage === s.id ? T.espresso : T.paperHi,
              color: stage === s.id ? T.cream : T.espresso,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>{s.label}</button>
          ))}
        </div>
        {open ? sheetBody : (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            background: T.cream, borderRadius: 20,
            border: `1px dashed ${T.border}`, color: T.muted, fontSize: 13,
          }}>
            Sheet closed — tap the gold + to reopen.
          </div>
        )}
        {!open && (
          <button onClick={() => setOpen(true)} aria-label="Open Smart Logger" style={{
            position: 'absolute', bottom: 24, right: 16,
            width: 56, height: 56, borderRadius: '50%',
            background: T.gold, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(212,175,55,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
          }}><Plus size={26} style={{ color: T.espresso }} strokeWidth={2.6} /></button>
        )}
      </div>
    );
  }

  // PRODUCTION mode — global mount: FAB always on, sheet slides up.
  return (
    <>
      {/* FAB (always visible when sheet closed, unless hideFAB) */}
      {!open && !hideFAB && (
        <button onClick={() => setOpen(true)} aria-label="Smart logger" style={{
          position: 'fixed', bottom: 88, right: 18, zIndex: 998,
          width: 56, height: 56, borderRadius: '50%',
          background: "var(--plum)",
          border: 'none', cursor: 'pointer',
          boxShadow: '0 10px 24px rgba(11,8,5,0.30), 0 0 0 4px rgba(244,237,219,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Plus size={26} style={{ color: T.cream }} strokeWidth={2.6} /></button>
      )}
      {open && (
        <>
          <div
            onClick={closeSheet}
            onTouchMove={(e) => e.preventDefault()}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.45)',
              zIndex: 998, touchAction: 'none',
            }}
          />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 999,
            display: 'flex', justifyContent: 'center',
            padding: '0 8px max(8px, env(safe-area-inset-bottom))',
            animation: 'fwV4SheetUp .25s ease',
          }}>
            <style>{`@keyframes fwV4SheetUp { from { transform: translateY(20%); opacity: 0.7; } to { transform: translateY(0); opacity: 1; } }`}</style>
            <div style={{ width: '100%', maxWidth: 480 }}>{sheetBody}</div>
          </div>
        </>
      )}
    </>
  );
}
