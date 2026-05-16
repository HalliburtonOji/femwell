import { useEffect, useMemo, useState } from "react";
import { Moon, Battery, Smile, Droplets, Activity, Circle, ArrowUp, ArrowDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// PillarsDeck — Today-A T-A1 (MP-Today-A).
//
// Six-tile grid summarising the user's body at a glance. Sleep · Energy ·
// Mood · Hydration · Movement · Cycle. Each tile shows today's value + a
// delta vs the 7-day rolling average (Cycle is always "Day N · Phase" with
// no delta).
//
// Reads from DailyCheckins (lazy-fetched here so the component is
// self-contained) + the existing profile.last_period_start_date for the
// Cycle tile. Tiles with no data for 7 days render "—" with permissive
// copy in the delta slot. Minimum 4 visible tiles per spec default #1; if
// fewer have data the empty tiles still render with placeholder ("—") so
// the 2×3 grid keeps its shape.
//
// Tap fires console.log + transient toast (overlay sheet is T-A4 follow-up).
//
// Spec ref: claude-state/base44_mps/2026-05-15_today_redesign_A/spec.md §T-A1.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS = {
  menstrual:  "Period",
  follicular: "Follicular",
  ovulatory:  "Ovulatory",
  luteal:     "Luteal",
};

// Le Menu × Phase Sun — saturated phase palette (applied 2026-05-16).
const PHASE_COLORS = {
  menstrual:  "#9A2845",
  follicular: "#D4745A",
  ovulatory:  "#C8A040",
  luteal:     "#7B5E9A",
};

const DELTA_THRESHOLD = 5; // % per spec default #2

function toDateISO(d) {
  return d.toISOString().split("T")[0];
}

// Compute cycle day + phase from profile (same math as Planner.jsx).
function cycleStateFor(profile, today) {
  if (!profile?.last_period_start_date) return null;
  const cycleLength = profile.cycle_avg_length || 28;
  const periodLength = profile.period_length || 5;
  const start = new Date(profile.last_period_start_date);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  const dayOfCycle = (diff % cycleLength) + 1;
  let phase;
  if (dayOfCycle <= periodLength) phase = "menstrual";
  else if (dayOfCycle <= cycleLength * 0.5 - 2) phase = "follicular";
  else if (dayOfCycle <= cycleLength * 0.5 + 2) phase = "ovulatory";
  else phase = "luteal";
  return { dayOfCycle, phase };
}

// Pull today's and last-7 checkin values for a given field; compute delta
// in percent terms. Returns { value, delta, hasData }.
function pillarStats(checkins, field, today, scale = 1) {
  if (!Array.isArray(checkins) || checkins.length === 0) {
    return { value: null, delta: null, hasData: false };
  }
  const todayISO = toDateISO(today);
  const todayRow = checkins.find(c => c.date === todayISO);
  // Most recent value: today if logged, else the closest prior day.
  let value = todayRow ? todayRow[field] : undefined;
  if (value === undefined || value === null) {
    // Walk backwards through the array (sorted by -date) for the latest.
    for (const c of checkins) {
      if (c?.[field] !== undefined && c?.[field] !== null) { value = c[field]; break; }
    }
  }
  if (value === undefined || value === null) {
    return { value: null, delta: null, hasData: false };
  }
  // 7-day rolling average across rows where the field is set.
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const todayMs = today.getTime();
  let sum = 0; let n = 0;
  for (const c of checkins) {
    if (!c?.date) continue;
    if (c[field] === undefined || c[field] === null) continue;
    const ms = new Date(c.date).getTime();
    if (!Number.isFinite(ms)) continue;
    if (todayMs - ms > sevenDaysMs || todayMs - ms < 0) continue;
    sum += c[field]; n += 1;
  }
  const avg = n > 0 ? sum / n : null;
  const delta = (avg !== null && avg !== 0) ? Math.round(((value - avg) / avg) * 100) : null;
  return { value: value * scale, delta, hasData: true };
}

function deltaClass(delta) {
  if (delta === null) return "flat";
  if (delta >= DELTA_THRESHOLD) return "up";
  if (delta <= -DELTA_THRESHOLD) return "down";
  return "flat";
}

function deltaText(delta, cls) {
  if (delta === null) return "logging will surface a pattern here";
  if (cls === "flat") return "steady this week";
  return `${delta > 0 ? "+" : ""}${delta}% vs week`;
}

export default function PillarsDeck({ profile, today }) {
  const [checkins, setCheckins] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (!profile?.user_id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.DailyCheckins.filter(
          { user_id: profile.user_id },
          "-date",
          14,
        );
        if (!cancelled) setCheckins(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setCheckins([]);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.user_id]);

  const cycleState = useMemo(() => cycleStateFor(profile, today), [profile, today]);

  const tiles = useMemo(() => {
    const safeCheckins = checkins || [];
    const sleep = pillarStats(safeCheckins, "sleep_hours", today);
    // Energy + mood are 1-5; convert to a 0-100 percent for display + delta.
    const energyRaw = pillarStats(safeCheckins, "energy", today);
    const moodRaw   = pillarStats(safeCheckins, "mood", today);
    const energy = { ...energyRaw, value: energyRaw.value !== null ? Math.round(energyRaw.value * 20) : null };
    const mood   = { ...moodRaw,   value: moodRaw.value   !== null ? Math.round(moodRaw.value   * 20) : null };
    const hydration = pillarStats(safeCheckins, "hydration_glasses", today);
    const movement  = pillarStats(safeCheckins, "exercise_minutes", today);
    return [
      { key: "sleep",     label: "SLEEP",     icon: Moon,     unit: "hrs", ...sleep },
      { key: "energy",    label: "ENERGY",    icon: Battery,  unit: "%",   ...energy },
      { key: "mood",      label: "MOOD",      icon: Smile,    unit: "%",   ...mood },
      { key: "hydration", label: "HYDRATION", icon: Droplets, unit: "",    ...hydration },
      { key: "movement",  label: "MOVEMENT",  icon: Activity, unit: "min", ...movement },
      // Cycle tile is handled separately — value is a string, no delta.
    ];
  }, [checkins, today]);

  const handleTap = (key) => {
    // T-A4 polish will wire the overlay sheet here. Until then: a transient
    // toast + console.log so users get acknowledgement without a no-op.
    console.log(`[PillarsDeck] tile tapped: ${key}`);
    setToastMsg(`More on ${key} — coming soon`);
    setTimeout(() => setToastMsg(null), 2400);
  };

  return (
    <section
      aria-label="Body summary tiles — sleep, energy, mood, hydration, movement, cycle"
      style={deckStyle}
    >
      {tiles.map(t => {
        const Icon = t.icon;
        const cls = deltaClass(t.delta);
        const dotColor = cycleState ? PHASE_COLORS[cycleState.phase] : "#7B5E9A";
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => handleTap(t.key)}
            aria-label={
              t.hasData
                ? `${t.label.toLowerCase()} ${t.value}${t.unit ? " " + t.unit : ""}, ${deltaText(t.delta, cls)}`
                : `${t.label.toLowerCase()} — no data yet`
            }
            style={tileStyle}
          >
            {/* Le Menu × Phase Sun — phase-colour dot in top-right corner */}
            <span aria-hidden="true" style={{
              position: "absolute", top: 9, right: 9,
              width: 7, height: 7, borderRadius: 9999, background: dotColor,
            }}/>
            <Icon size={14} strokeWidth={1.6} style={{ color: "#6B5840" }} aria-hidden="true" />
            <span style={labelStyle}>{t.label}</span>
            <span style={valueStyle}>
              {t.hasData ? t.value : "—"}
              {t.hasData && t.unit ? <span style={unitStyle}>{" " + t.unit}</span> : null}
            </span>
            <span style={deltaStyleFor(cls)}>
              {!t.hasData ? "logging will surface a pattern here" : (
                <>
                  {cls === "up"   && <ArrowUp size={11} strokeWidth={2.2} aria-hidden="true" />}
                  {cls === "down" && <ArrowDown size={11} strokeWidth={2.2} aria-hidden="true" />}
                  {deltaText(t.delta, cls)}
                </>
              )}
            </span>
          </button>
        );
      })}
      {/* Cycle tile — own block since the value is a string + no delta. */}
      <button
        type="button"
        onClick={() => handleTap("cycle")}
        aria-label={cycleState ? `cycle day ${cycleState.dayOfCycle}, ${PHASE_LABELS[cycleState.phase]} phase` : "cycle — no data yet"}
        style={tileStyle}
      >
        {/* Le Menu × Phase Sun — phase dot */}
        <span aria-hidden="true" style={{
          position: "absolute", top: 9, right: 9,
          width: 7, height: 7, borderRadius: 9999,
          background: cycleState ? PHASE_COLORS[cycleState.phase] : "#7B5E9A",
        }}/>
        <Circle size={14} strokeWidth={1.6} style={{ color: cycleState ? PHASE_COLORS[cycleState.phase] : "#6B5840" }} aria-hidden="true" />
        <span style={labelStyle}>CYCLE</span>
        <span style={valueStyle}>
          {cycleState ? `Day ${cycleState.dayOfCycle}` : "—"}
        </span>
        <span style={deltaStyleFor("flat")}>
          {cycleState ? PHASE_LABELS[cycleState.phase] : "log a period to see your phase"}
        </span>
      </button>
      {toastMsg && (
        <div role="status" aria-live="polite" style={toastStyle}>{toastMsg}</div>
      )}
    </section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const deckStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 10,
  marginBottom: 14,
  position: "relative",
};
// Le Menu × Phase Sun — cream paper tile, espresso ink (applied 2026-05-16).
const tileStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 4,
  padding: "12px 12px 10px",
  borderRadius: 14,
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.08)",
  boxShadow: "0 1px 0 rgba(58,44,26,0.05)",
  cursor: "pointer",
  textAlign: "left",
  minHeight: 92,
};
const labelStyle = {
  fontSize: 9.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif",
};
const valueStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22,
  fontWeight: 500,
  color: "#3A2C1A",
  letterSpacing: "-0.015em",
  lineHeight: 1.1,
};
const unitStyle = {
  fontSize: 12,
  fontWeight: 400,
  color: "#8A7458",
  marginLeft: 2,
};
function deltaStyleFor(cls) {
  // Le Menu × Phase Sun — sage / rose / espresso-mute (applied 2026-05-16).
  const colorMap = {
    up:   "#5F8B72",
    down: "#B84A41",
    flat: "#8A7458",
  };
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: 11,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    color: colorMap[cls] || colorMap.flat,
  };
}
const toastStyle = {
  position: "absolute",
  left: "50%",
  bottom: -36,
  transform: "translateX(-50%)",
  padding: "6px 14px",
  background: "var(--plum, #4A2A3A)",
  color: "var(--cream, #FFFAF5)",
  borderRadius: 9999,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  whiteSpace: "nowrap",
};
