import { useEffect, useMemo, useState } from "react";
import { Moon, Battery, Smile, Droplets, Activity, Circle, ArrowUp, ArrowDown, Flame, CloudMoon, Brain, Bone, Heart, Bandage, Baby, BookOpen, Pill, Thermometer, ClipboardList } from "lucide-react";
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

// Le Menu polish — map each pillar's value to a 0-100% bar.
// Targets: sleep 9h, energy/mood 100%, hydration 8 cups, movement 45min.
function progressPctFor(key, value) {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  let pct;
  if (key === "sleep")     pct = (n / 9) * 100;
  else if (key === "energy" || key === "mood") pct = n;        // already %
  else if (key === "hydration") pct = (n / 8) * 100;
  else if (key === "movement")  pct = (n / 45) * 100;
  else pct = 0;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Pillar-set router. plannerConfig.pillarSet from src/utils/plannerAdapter.js
// tells us which set of 6 tiles to render. The default reproductive set is
// kept as-is (existing behaviour); alternative sets render alternative tiles
// reading from MenopauseDailyLog, profile.hrt_regimen, etc.
//
// Each tile descriptor: {key, label, icon, unit, source, scale?}
//   source: "daily" (DailyCheckins) | "meno" (MenopauseDailyLog) | "profile"
//   scale:  multiplier applied to value for display (e.g. mood 1-5 → 0-100%)
// ─────────────────────────────────────────────────────────────────────────────
const TILE_DEFS_BY_LABEL = {
  // Reproductive default set
  "Sleep":       { key: "sleep",     icon: Moon,         unit: "hrs", source: "daily", field: "sleep_hours" },
  "Energy":      { key: "energy",    icon: Battery,      unit: "%",   source: "daily", field: "energy", scale: 20 },
  "Mood":        { key: "mood",      icon: Smile,        unit: "%",   source: "daily", field: "mood",   scale: 20 },
  "Hydration":   { key: "hydration", icon: Droplets,     unit: "",    source: "daily", field: "hydration_glasses" },
  "Movement":    { key: "movement",  icon: Activity,     unit: "min", source: "daily", field: "exercise_minutes" },
  "Cycle":       { key: "cycle",     icon: Circle,       unit: "",    source: "cycle" },
  // Perimenopause set
  "Hot flushes": { key: "flushes",   icon: Flame,        unit: "",    source: "meno",  field: "hot_flashes" },
  "Night sweats":{ key: "sweats",    icon: CloudMoon,    unit: "",    source: "meno",  field: "night_sweats" },
  "Brain fog":   { key: "brain",     icon: Brain,        unit: "/10", source: "meno",  field: "brain_fog" },
  "Joint pain":  { key: "joints",    icon: Bone,         unit: "/10", source: "meno",  field: "joint_pain" },
  "HRT log":     { key: "hrt",       icon: Pill,         unit: "",    source: "profile-hrt" },
  // Postpartum set
  "Healing":     { key: "healing",   icon: Bandage,      unit: "",    source: "daily", field: "healing_score" },
  "Pelvic floor":{ key: "pelvic",    icon: Heart,        unit: "",    source: "daily", field: "pelvic_floor_done" },
  "Feeding":     { key: "feeding",   icon: Baby,         unit: "",    source: "daily", field: "feeds_today" },
  // TTC set
  "BBT":         { key: "bbt",       icon: Thermometer,  unit: "°C",  source: "daily", field: "bbt" },
  "OPK":         { key: "opk",       icon: ClipboardList,unit: "",    source: "daily", field: "opk_result" },
  "Supplements": { key: "supps",     icon: Pill,         unit: "",    source: "daily", field: "supplements_taken" },
  "CD":          { key: "cd",        icon: Circle,       unit: "",    source: "cycle-day" },
  // Pregnancy set
  "Nausea":      { key: "nausea",    icon: CloudMoon,    unit: "/10", source: "daily", field: "nausea" },
  "Kicks":       { key: "kicks",     icon: Heart,        unit: "",    source: "daily", field: "kick_count" },
  "Back pain":   { key: "back",      icon: Bandage,      unit: "/10", source: "daily", field: "back_pain" },
  "Baby":        { key: "baby",      icon: Baby,         unit: "",    source: "pregnancy-week" },
  // Teen set additions
  "Cramps":      { key: "cramps",    icon: Bandage,      unit: "/10", source: "daily", field: "cramps" },
  "Skin":        { key: "skin",      icon: Smile,        unit: "",    source: "daily", field: "skin" },
  // Post-menopause set
  "Bone":        { key: "bone",      icon: Bone,         unit: "",    source: "profile-dexa" },
  "BP":          { key: "bp",        icon: Heart,        unit: "",    source: "daily", field: "bp_reading" },
  "GSM":         { key: "gsm",       icon: BookOpen,     unit: "",    source: "profile-gsm" },
};

const DEFAULT_PILLAR_SET = ["Sleep", "Energy", "Mood", "Hydration", "Movement", "Cycle"];

export default function PillarsDeck({ profile, today, plannerConfig }) {
  const pillarSet = (plannerConfig?.pillarSet && plannerConfig.pillarSet.length > 0)
    ? plannerConfig.pillarSet
    : DEFAULT_PILLAR_SET;
  const isDefaultSet = pillarSet.length === DEFAULT_PILLAR_SET.length &&
    pillarSet.every((p, i) => p === DEFAULT_PILLAR_SET[i]);

  const [checkins, setCheckins] = useState(null);
  const [menoLogs, setMenoLogs] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Lazy-fetch DailyCheckins (existing behaviour).
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

  // Lazy-fetch MenopauseDailyLog when a peri / meno pillar is in the set.
  const needsMenoFetch = pillarSet.some((label) => {
    const def = TILE_DEFS_BY_LABEL[label];
    return def?.source === "meno";
  });
  useEffect(() => {
    if (!profile?.user_id || !needsMenoFetch) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.MenopauseDailyLog.filter(
          { user_id: profile.user_id },
          "-date",
          14,
        );
        if (!cancelled) setMenoLogs(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setMenoLogs([]);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.user_id, needsMenoFetch]);

  const cycleState = useMemo(() => cycleStateFor(profile, today), [profile, today]);

  // Pull the latest MenopauseDailyLog value for a given field.
  const menoLatest = useMemo(() => {
    if (!menoLogs || menoLogs.length === 0) return {};
    const sorted = [...menoLogs].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    return sorted[0] || {};
  }, [menoLogs]);

  const handleTap = (key) => {
    console.log(`[PillarsDeck] tile tapped: ${key}`);
    setToastMsg(`More on ${key} — coming soon`);
    setTimeout(() => setToastMsg(null), 2400);
  };

  // ── Alternative pillar-set rendering (peri / postpartum / TTC / etc) ─────
  // For non-default sets, walk pillarSet, resolve each tile through
  // TILE_DEFS_BY_LABEL, and render the same 2×3 grid with the appropriate
  // value source. Tiles with no data show "—" + permissive copy.
  if (!isDefaultSet) {
    const dotColor = (plannerConfig && plannerConfig.ribbonType === "symptom") ? "#A86A52" : "#7B5E9A";
    const altTiles = pillarSet.slice(0, 6).map((label) => {
      const def = TILE_DEFS_BY_LABEL[label];
      if (!def) {
        return { key: label, label: label.toUpperCase(), icon: Circle, value: null, unit: "", hasData: false, bar: 0, hint: "logging will surface a pattern here" };
      }
      let value = null;
      let hasData = false;
      let hint = "logging will surface a pattern here";
      if (def.source === "daily") {
        const stat = pillarStats(checkins || [], def.field, today);
        value = stat.value;
        hasData = stat.hasData;
        if (hasData && def.scale) value = Math.round(value * def.scale);
      } else if (def.source === "meno") {
        const v = menoLatest?.[def.field];
        if (v !== null && v !== undefined && Number.isFinite(Number(v))) {
          value = Number(v);
          hasData = true;
        }
      } else if (def.source === "cycle") {
        if (cycleState) {
          value = `Day ${cycleState.dayOfCycle}`;
          hasData = true;
          hint = PHASE_LABELS[cycleState.phase] || "";
        } else {
          hint = "log a period to see your phase";
        }
      } else if (def.source === "cycle-day") {
        if (cycleState) {
          value = cycleState.dayOfCycle;
          hasData = true;
          hint = "CD";
        }
      } else if (def.source === "pregnancy-week") {
        if (profile?.pregnancy_start_date) {
          const start = new Date(profile.pregnancy_start_date);
          const todayD = today instanceof Date ? today : new Date(today);
          const weeks = Math.max(0, Math.floor((todayD - start) / (1000 * 60 * 60 * 24 * 7)));
          value = `${weeks}w`;
          hasData = true;
          hint = `Trimester ${weeks < 13 ? "I" : weeks < 27 ? "II" : "III"}`;
        }
      } else if (def.source === "profile-hrt") {
        if (profile?.hrt_regimen?.type && profile.hrt_regimen.type !== "none") {
          value = profile.hrt_regimen.type;
          hasData = true;
          hint = profile.hrt_regimen.evening_dose || "logged";
        } else {
          hint = "tap to add your HRT";
        }
      } else if (def.source === "profile-dexa") {
        hint = "DEXA cadence — tap to log";
      } else if (def.source === "profile-gsm") {
        hint = "GSM check — tap to learn";
      }
      // Bar % approximation for the bottom progress strip.
      let bar = 0;
      if (hasData && typeof value === "number") {
        if (def.scale) bar = Math.max(0, Math.min(100, value));
        else if (def.unit === "/10") bar = Math.max(0, Math.min(100, value * 10));
        else if (def.field === "hot_flashes" || def.field === "night_sweats") bar = Math.max(0, Math.min(100, value * 25));
        else bar = 50;
      }
      return { key: def.key, label: label.toUpperCase(), icon: def.icon, value, unit: def.unit, hasData, bar, hint };
    });

    return (
      <section
        aria-label={`Body summary tiles — ${pillarSet.join(", ").toLowerCase()}`}
        style={deckStyle}
      >
        {altTiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTap(t.key)}
              aria-label={t.hasData ? `${t.label.toLowerCase()} ${t.value}${t.unit ? " " + t.unit : ""}` : `${t.label.toLowerCase()} — no data yet`}
              style={tileStyle}
            >
              <span aria-hidden="true" style={{
                position: "absolute", top: 9, right: 9,
                width: 7, height: 7, borderRadius: 9999, background: dotColor,
              }}/>
              <Icon size={14} strokeWidth={1.6} style={{ color: "#6B5840" }} aria-hidden="true" />
              <span style={labelStyle}>{t.label}</span>
              <span style={valueStyle}>
                {t.hasData ? String(t.value) : "—"}
                {t.hasData && t.unit ? <span style={unitStyle}>{" " + t.unit}</span> : null}
              </span>
              <span style={deltaStyleFor("flat")}>{t.hint}</span>
              {t.hasData && t.bar > 0 && (
                <span aria-hidden="true" style={{
                  position: "absolute", left: 0, right: 0, bottom: 0,
                  height: 2, background: "rgba(58,44,26,0.06)", overflow: "hidden",
                }}>
                  <span style={{
                    display: "block", height: "100%",
                    width: `${t.bar}%`, background: dotColor, opacity: 0.85,
                    transition: "width 0.3s ease",
                  }}/>
                </span>
              )}
            </button>
          );
        })}
        {toastMsg && (
          <div role="status" aria-live="polite" style={toastStyle}>{toastMsg}</div>
        )}
      </section>
    );
  }

  // ── Default reproductive 6-tile set (original behaviour) ─────────────────
  const tiles = (() => {
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
  })();

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
            {/* Le Menu polish — phase-coloured fill bar at the bottom of each data tile */}
            {t.hasData && (
              <span aria-hidden="true" style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                height: 2, background: "rgba(58,44,26,0.06)",
                overflow: "hidden",
              }}>
                <span style={{
                  display: "block", height: "100%",
                  width: `${progressPctFor(t.key, t.value)}%`,
                  background: dotColor, opacity: 0.85,
                  transition: "width 0.3s ease",
                }}/>
              </span>
            )}
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
        {/* Le Menu polish — phase-colour cycle-progress bar at the bottom */}
        {cycleState && (
          <span aria-hidden="true" style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            height: 2, background: "rgba(58,44,26,0.06)",
            overflow: "hidden",
          }}>
            <span style={{
              display: "block", height: "100%",
              width: `${Math.max(0, Math.min(100, Math.round((cycleState.dayOfCycle / (profile?.cycle_avg_length || 28)) * 100)))}%`,
              background: PHASE_COLORS[cycleState.phase], opacity: 0.85,
              transition: "width 0.3s ease",
            }}/>
          </span>
        )}
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
