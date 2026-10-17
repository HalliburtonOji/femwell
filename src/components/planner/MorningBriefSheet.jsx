import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import { displayFirstName } from "@/utils/userProfile";
import { ArrowRight, Check, ChevronDown, Frown, ListChecks, Meh, Moon, Smile, Utensils, X, Zap } from "lucide-react";
import "./MorningBriefSheet.css";

const MOODS = [
  { value: 1, label: "Very low", Icon: Frown },
  { value: 2, label: "Low", Icon: Frown },
  { value: 3, label: "In between", Icon: Meh },
  { value: 4, label: "Good", Icon: Smile },
  { value: 5, label: "Very good", Icon: Smile },
];
const ENERGY = [1, 2, 3, 4, 5];
const SLEEP = [6, 7, 8, 9];
const PHASE_LABEL = { menstrual: "Menstrual", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };
const PHASE_LINE = {
  menstrual: "A little room to breathe is a perfectly good plan.",
  follicular: "A fresh thought might be worth keeping today.",
  ovulatory: "Take the day as it comes. You get to set the pace.",
  luteal: "Choose what matters; the rest can wait.",
  unknown: "Whatever kind of day this is, it belongs to you.",
};
const emptyValues = () => ({ mood: null, energy: null, sleep_hours: null });
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};
const valuesFromRow = (row) => ({
  mood: row?.mood == null && row?.mood_score == null ? null : Number(row.mood ?? row.mood_score),
  energy: row?.energy == null && row?.energy_level == null ? null : Number(row.energy ?? row.energy_level),
  sleep_hours: row?.sleep_hours == null ? null : Number(row.sleep_hours),
});
const sameValues = (row, wanted, fields = Object.keys(wanted)) => fields.every((field) =>
  wanted[field] == null || valuesFromRow(row)[field] === wanted[field]
);
const payloadFor = (uid, date, values, fields) => {
  const payload = { user_id: uid, date };
  if (fields.includes("mood") && values.mood != null) {
    payload.mood = values.mood;
    payload.mood_score = values.mood;
  }
  if (fields.includes("energy") && values.energy != null) {
    payload.energy = values.energy;
    payload.energy_level = values.energy;
  }
  if (fields.includes("sleep_hours") && values.sleep_hours != null) payload.sleep_hours = values.sleep_hours;
  return payload;
};

export default function MorningBriefSheet({ user, profile, onDismiss }) {
  const uid = user?.id;
  const date = localDate();
  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "unknown";
  const cycleDay = cycle?.cycleDay || cycle?.dayInCycle || cycle?.day || null;
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const generationRef = useRef(0);
  const rowRef = useRef(null);
  const desiredRef = useRef(emptyValues());
  const dirtyRef = useRef({});
  const queueRef = useRef(Promise.resolve());
  const blockedRef = useRef(false);
  const [values, setValues] = useState(emptyValues);
  const [checkinState, setCheckinState] = useState("loading");
  const [expanded, setExpanded] = useState(false);
  const [plannerItems, setPlannerItems] = useState([]);
  const [firstMeal, setFirstMeal] = useState(null);
  const [glanceState, setGlanceState] = useState("loading");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const before = document.activeElement;
    closeRef.current?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = oldOverflow;
      if (before instanceof HTMLElement && before.isConnected) before.focus();
    };
  }, []);

  async function readOwned() {
    const rows = await base44.entities.DailyCheckins.filter({ user_id: uid, date }, "-updated_date", 1);
    return rows?.find((row) => row?.id && row.user_id === uid && row.date === date) || null;
  }

  async function loadCheckin({ initial = false } = {}) {
    const generation = generationRef.current;
    setCheckinState("loading");
    try {
      const row = await readOwned();
      if (generation !== generationRef.current) return false;
      rowRef.current = row;
      blockedRef.current = false;
      if (initial) {
        const loaded = valuesFromRow(row);
        desiredRef.current = loaded;
        setValues(loaded);
      }
      setCheckinState("ready");
      return true;
    } catch {
      if (generation === generationRef.current) {
        blockedRef.current = true;
        setCheckinState("error");
      }
      return false;
    }
  }

  useEffect(() => {
    generationRef.current += 1;
    rowRef.current = null;
    desiredRef.current = emptyValues();
    dirtyRef.current = {};
    queueRef.current = Promise.resolve();
    blockedRef.current = false;
    setValues(emptyValues());
    if (uid) loadCheckin({ initial: true });
    else setCheckinState("error");
    return () => { generationRef.current += 1; };
  }, [uid, date]);

  async function loadGlance() {
    const generation = generationRef.current;
    setGlanceState("loading");
    const [itemsResult, mealsResult] = await Promise.allSettled([
      base44.entities.PlannerItems.filter({ user_id: uid, date_str: date }),
      base44.entities.MealLog.filter({ user_id: uid, day_key: date }),
    ]);
    if (generation !== generationRef.current) return;
    if (itemsResult.status === "fulfilled") setPlannerItems(Array.isArray(itemsResult.value) ? itemsResult.value.slice(0, 3) : []);
    if (mealsResult.status === "fulfilled") {
      const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
      const meals = Array.isArray(mealsResult.value) ? mealsResult.value : [];
      setFirstMeal(meals.slice().sort((a, b) => (order[a?.meal_type] ?? 4) - (order[b?.meal_type] ?? 4))[0] || null);
    }
    setGlanceState(itemsResult.status === "rejected" || mealsResult.status === "rejected" ? "error" : "ready");
  }
  useEffect(() => {
    if (!uid) return;
    setPlannerItems([]);
    setFirstMeal(null);
    loadGlance();
  }, [uid, date]);

  function queueWrite() {
    const generation = generationRef.current;
    setCheckinState("saving");
    queueRef.current = queueRef.current.then(async () => {
      if (blockedRef.current || generation !== generationRef.current) return;
      const wanted = { ...desiredRef.current };
      const fields = Object.keys(dirtyRef.current);
      if (!fields.length) return;
      try {
        // The prop and current session must still refer to the same owner.
        const currentUser = await base44.auth.me();
        if (currentUser?.id !== uid || generation !== generationRef.current) throw new Error("owner_changed");
        let row = rowRef.current;
        const payload = payloadFor(uid, date, wanted, fields);
        try {
          row = row?.id
            ? await base44.entities.DailyCheckins.update(row.id, payload)
            : await base44.entities.DailyCheckins.create(payload);
        } catch {
          // A timed-out create may have committed. Reconcile; never blindly create twice.
          row = await readOwned();
          if (!row || !sameValues(row, wanted, fields)) throw new Error("unconfirmed_write");
        }
        if (generation !== generationRef.current) return;
        if (!row?.id || row.user_id !== uid || row.date !== date || !sameValues(row, wanted, fields)) {
          row = await readOwned();
        }
        if (!row?.id || row.user_id !== uid || row.date !== date || !sameValues(row, wanted, fields)) {
          throw new Error("unconfirmed_write");
        }
        // A session can change while a request is in flight, even without a prop rerender.
        const afterUser = await base44.auth.me();
        if (afterUser?.id !== uid || generation !== generationRef.current) throw new Error("owner_changed");
        rowRef.current = { ...rowRef.current, ...row };
        fields.forEach((field) => {
          if (desiredRef.current[field] === wanted[field]) delete dirtyRef.current[field];
        });
        if (!Object.keys(dirtyRef.current).length) setCheckinState("saved");
      } catch {
        if (generation !== generationRef.current) return;
        blockedRef.current = true;
        setCheckinState("error");
      }
    });
  }

  function pick(field, value) {
    if (blockedRef.current || checkinState === "loading") return;
    desiredRef.current = { ...desiredRef.current, [field]: value };
    dirtyRef.current[field] = true;
    setValues({ ...desiredRef.current });
    queueWrite();
  }
  async function retryCheckin() {
    const loaded = await loadCheckin();
    if (!loaded) return;
    Object.keys(dirtyRef.current).forEach((field) => {
      if (valuesFromRow(rowRef.current)[field] === desiredRef.current[field]) delete dirtyRef.current[field];
    });
    if (Object.keys(dirtyRef.current).length) queueWrite();
    else setCheckinState(Object.values(desiredRef.current).some((value) => value != null) ? "saved" : "ready");
  }
  function dismiss() {
    if (dialogRef.current?.open) dialogRef.current.close();
    onDismiss();
  }

  const name = displayFirstName(user, profile) || "there";
  const mealText = firstMeal?.raw_text || firstMeal?.food_name || firstMeal?.name ||
    (Array.isArray(firstMeal?.food_items) ? firstMeal.food_items[0] : firstMeal?.food_items);
  const phaseText = PHASE_LABEL[phase] ? `${PHASE_LABEL[phase]}${cycleDay ? ` · Day ${cycleDay}` : ""}` : "A new day";

  return (
    <dialog ref={dialogRef} className="fw-morning-dialog" aria-labelledby="fw-morning-title" onCancel={(event) => { event.preventDefault(); dismiss(); }}>
      <div className="fw-morning-head">
        <span className="fw-morning-kicker">YOUR DAY · {phaseText}</span>
        <button ref={closeRef} className="fw-morning-close" type="button" onClick={dismiss} aria-label="Not now, close morning brief"><X size={19} /></button>
      </div>
      <div className="fw-morning-scroll">
        <header className="fw-morning-intro">
          <span className="fw-morning-flower" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <h1 id="fw-morning-title">{greeting()}, {name}.</h1>
          <p>{PHASE_LINE[phase] || PHASE_LINE.unknown}</p>
        </header>
        <section className="fw-morning-checkin" aria-labelledby="fw-morning-question">
          <h2 id="fw-morning-question">How are you arriving?</h2>
          <p className="fw-morning-hint">A quick check-in, if you fancy it.</p>
          <div className="fw-morning-options" role="group" aria-label="Mood">
            {MOODS.map(({ value, label, Icon }) => (
              <button key={value} type="button" className={values.mood === value ? "is-picked" : ""} aria-label={`Mood: ${label}`} aria-pressed={values.mood === value} disabled={checkinState === "loading" || checkinState === "error"} onClick={() => pick("mood", value)}>
                <Icon size={20} aria-hidden="true" /><span>{label}</span>
              </button>
            ))}
          </div>
          <button className="fw-morning-more" type="button" aria-expanded={expanded} onClick={() => setExpanded((open) => !open)}>
            Energy & sleep <ChevronDown size={16} aria-hidden="true" />
          </button>
          {expanded && (
            <div className="fw-morning-details">
              <div role="group" aria-label="Energy"><span><Zap size={16} aria-hidden="true" /> Energy</span><div className="fw-morning-numbers">{ENERGY.map((value) => <button key={value} type="button" aria-label={`Energy: ${value} of 5`} aria-pressed={values.energy === value} className={values.energy === value ? "is-picked" : ""} disabled={checkinState === "loading" || checkinState === "error"} onClick={() => pick("energy", value)}>{value}</button>)}</div></div>
              <div role="group" aria-label="Sleep hours"><span><Moon size={16} aria-hidden="true" /> Sleep</span><div className="fw-morning-numbers">{SLEEP.map((hours) => <button key={hours} type="button" aria-label={`Sleep: ${hours} hours`} aria-pressed={values.sleep_hours === hours} className={values.sleep_hours === hours ? "is-picked" : ""} disabled={checkinState === "loading" || checkinState === "error"} onClick={() => pick("sleep_hours", hours)}>{hours}h</button>)}</div></div>
            </div>
          )}
          <div className="fw-morning-status" role="status" aria-live="polite">
            {checkinState === "loading" && "Loading your check-in…"}
            {checkinState === "saving" && "Saving your check-in…"}
            {checkinState === "saved" && <><Check size={15} aria-hidden="true" /> Saved</>}
            {checkinState === "error" && <><span>Couldn’t confirm this check-in.</span><button type="button" onClick={retryCheckin}>Retry</button></>}
          </div>
        </section>
        <details className="fw-morning-glance">
          <summary>Today, at a glance <span>{plannerItems.length ? `${plannerItems.length} planned` : ""}</span></summary>
          <div className="fw-morning-glance-body">
            {plannerItems.map((item) => <div className="fw-morning-glance-row" key={item.id}><ListChecks size={17} aria-hidden="true" /><span>{item.title || "Planner item"}{item.time ? ` · ${item.time}` : ""}</span></div>)}
            {firstMeal && <div className="fw-morning-glance-row"><Utensils size={17} aria-hidden="true" /><span>{firstMeal.meal_type || "Meal"} logged{mealText ? `: ${mealText}` : ""}</span></div>}
            {glanceState === "loading" && <p role="status">Looking at today…</p>}
            {glanceState === "error" && <p role="status">Today’s details couldn’t load. <button type="button" onClick={loadGlance}>Retry</button></p>}
            {glanceState === "ready" && !plannerItems.length && !firstMeal && <p>Nothing in today’s notes yet.</p>}
          </div>
        </details>
      </div>
      <div className="fw-morning-footer"><button type="button" onClick={dismiss}>Into my day <ArrowRight size={18} aria-hidden="true" /></button></div>
    </dialog>
  );
}
