import { useState, useEffect } from "react";
import { PageLoader } from "../components/common/LoadingSpinner";
import { Lock, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import ContentActionBar from "@/components/common/ContentActionBar";
import { base44 } from "@/api/base44Client";
import { differenceInDays, subDays, parseISO, format, addDays } from "date-fns";
import { createPageUrl } from "@/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from "recharts";

// ── Ingredient data ─────────────────────────────────────────────────────────
const SKIN_INGREDIENTS = {
  menstrual: {
    use: [
      { name: "Ceramides", why: "Restore the compromised skin barrier" },
      { name: "Hyaluronic acid", why: "Deep hydration without irritation" },
      { name: "Centella asiatica", why: "Reduces redness and supports healing" },
      { name: "Colloidal oatmeal", why: "Calms reactive, sensitive skin" },
    ],
    avoid: [
      { name: "Retinoids", why: "Too harsh for low-oestrogen skin" },
      { name: "AHA / BHA", why: "Exfoliants worsen compromised barrier" },
      { name: "Vitamin C (high %)", why: "Can irritate sensitised skin" },
    ],
  },
  follicular: {
    use: [
      { name: "Vitamin C (10\u201315%)", why: "Collagen boost when oestrogen is high" },
      { name: "Retinol (0.025\u20130.05%)", why: "Best tolerated in this resilient window" },
      { name: "AHA (glycolic/lactic)", why: "Exfoliate while barrier is at its strongest" },
      { name: "Niacinamide", why: "Maintains even tone as skin brightens" },
    ],
    avoid: [
      { name: "Heavy occlusives", why: "Unnecessary when skin is naturally balanced" },
    ],
  },
  ovulatory: {
    use: [
      { name: "Niacinamide", why: "Controls the testosterone-driven sebum spike" },
      { name: "BHA (salicylic acid 1\u20132%)", why: "Keeps pores clear during oily surge" },
      { name: "Zinc-based SPF", why: "Oil-control and UV protection in one" },
      { name: "Lightweight hyaluronic acid", why: "Hydration without congestion" },
    ],
    avoid: [
      { name: "Rich face oils", why: "Amplify oiliness during testosterone peak" },
      { name: "Heavy night creams", why: "Pore-clogging when sebum is already high" },
    ],
  },
  luteal: {
    use: [
      { name: "Salicylic acid (0.5\u20132%)", why: "Unclogs pores as progesterone rises" },
      { name: "Niacinamide", why: "Anti-inflammatory, reduces cystic swelling" },
      { name: "Benzoyl peroxide (2.5%)", why: "Targeted spot treatment for cystic acne" },
      { name: "Zinc", why: "Regulates sebum and calms inflammation" },
    ],
    avoid: [
      { name: "Pore-clogging oils (coconut, algae)", why: "High comedogenic rating during sebum peak" },
      { name: "Fragrance", why: "Skin is more reactive premenstrually" },
    ],
  },
};

const HAIR_INGREDIENTS = {
  menstrual: {
    use: [
      { name: "Ceramides (hair)", why: "Repairs the cuticle when oestrogen is at its lowest" },
      { name: "Argan oil", why: "Seals moisture into brittle, low-shine strands" },
      { name: "Protein treatments (light)", why: "Rebuilds fragile bonds without overloading" },
    ],
    avoid: [
      { name: "Sulphate shampoos", why: "Strip already-depleted scalp oils" },
      { name: "Heat styling daily", why: "Brittle strands break more easily this week" },
    ],
  },
  follicular: {
    use: [
      { name: "Keratin masks", why: "Maximise strength during your best growth window" },
      { name: "Biotin-enriched treatments", why: "Supports anagen phase extension" },
      { name: "Scalp serums with caffeine", why: "Stimulate follicles during the growth peak" },
    ],
    avoid: [
      { name: "Over-conditioning fine hair", why: "Can weigh down strands when they\u2019re already strong" },
    ],
  },
  ovulatory: {
    use: [
      { name: "Clarifying shampoo", why: "Removes testosterone-driven oil build-up" },
      { name: "Apple cider vinegar rinse", why: "Balances scalp pH, reduces residue" },
      { name: "Lightweight leave-in", why: "Moisture without weighing down oily roots" },
    ],
    avoid: [
      { name: "Heavy root oils", why: "Amplify the sebum surge at the scalp" },
      { name: "Dry shampoo overuse", why: "Clogs follicles if scalp is already congested" },
    ],
  },
  luteal: {
    use: [
      { name: "Glycerin-based leave-in", why: "Draws moisture into frizzy, dry strands" },
      { name: "Sealing oils (jojoba, avocado)", why: "Lock moisture in as oestrogen drops" },
      { name: "Castor oil (scalp)", why: "Supports follicle health during pre-period shedding" },
    ],
    avoid: [
      { name: "Protein overload", why: "Causes brittleness when hair is already stressed" },
      { name: "Alcohol-based styling products", why: "Exacerbate dryness as moisture retention drops" },
    ],
  },
};

const SKIN_FORECAST_COPY = {
  menstrual:  "Sensitive period \u2014 hydrate and protect your barrier.",
  follicular: "Glow window \u2014 introduce actives and exfoliants.",
  ovulatory:  "Testosterone surge \u2014 manage oiliness and watch for chin breakouts.",
  luteal:     "Progesterone rise \u2014 prepare your spot treatments.",
};

// ── Design tokens ────────────────────────────────────────────────────────────
const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "20px",
  boxShadow: "var(--shadow-sm)",
  padding: "1.25rem",
};

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--mauve)",
  };

// ── Phase config ─────────────────────────────────────────────────────────────
const PHASES = ["menstrual", "follicular", "ovulatory", "luteal"];
const PHASE_COLORS = {
  menstrual: "#C4849A",
  follicular: "#7A9E8E",
  ovulatory: "#B89E6A",
  luteal: "#8A7E88",
};
const PHASE_LABELS = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};
const PHASE_BRIEF_SKIN = {
  menstrual: {
    headline: "Menstrual Phase",
    tip: "Oestrogen and progesterone are at their lowest — your skin barrier is compromised. Stick to a gentle hydrating cleanser and ceramide moisturiser. Avoid actives and exfoliants this week.",
  },
  follicular: {
    headline: "Follicular Phase",
    tip: "Rising oestrogen means your skin is at its most resilient and radiant. This is the best window to introduce Vitamin C serums or retinoids. Collagen production is peaking — lean into it.",
  },
  ovulatory: {
    headline: "Ovulatory Phase",
    tip: "Peak oestrogen gives a natural glow, but a testosterone spike can trigger oiliness and chin breakouts. Switch to an oil-free moisturiser and consider a light BHA toner to manage sebum.",
  },
  luteal: {
    headline: "Luteal Phase",
    tip: "Progesterone drives sebum production — expect oilier skin and potential cystic breakouts around the chin and jaw. Niacinamide and salicylic acid spot treatments are your best allies now.",
  },
};
const PHASE_BRIEF_HAIR = {
  menstrual: {
    headline: "Menstrual Phase",
    tip: "Low oestrogen makes strands more brittle and the scalp more sensitive. Avoid tight styles, reduce heat, and opt for a deeply hydrating mask. More shedding than usual is normal and expected.",
  },
  follicular: {
    headline: "Follicular Phase",
    tip: "High oestrogen extends the growth phase — this is your strongest hair week. The best time to deep condition, colour, or try a new cut. Take advantage of the resilience while it lasts.",
  },
  ovulatory: {
    headline: "Ovulatory Phase",
    tip: "A testosterone spike drives an oily scalp around ovulation. Roots may feel limp. Use a scalp-refreshing dry shampoo or a clarifying wash, and don't skip your conditioning step on the lengths.",
  },
  luteal: {
    headline: "Luteal Phase",
    tip: "Dropping hormones reduce moisture retention — frizz and dryness increase, and shedding upticks premenstrually. Layer a sealing product over your leave-in to lock in moisture and protect ends.",
  },
};

// ── Cycle phase helpers ───────────────────────────────────────────────────────
function getPhaseFromDay(cycleDay, cycleLen) {
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= Math.round(cycleLen * 0.4)) return "follicular";
  if (cycleDay <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

function getCurrentPhase(lastPeriodDate, cycleLen = 28) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = parseISO(lastPeriodDate);
  const diff = differenceInDays(today, last);
  const cycleDay = (diff % cycleLen) + 1;
  return getPhaseFromDay(cycleDay, cycleLen);
}

function getCheckinPhase(dateStr, lastPeriodDate, cycleLen = 28) {
  if (!lastPeriodDate) return null;
  const d = parseISO(dateStr);
  const last = parseISO(lastPeriodDate);
  const diff = differenceInDays(d, last);
  if (diff < 0) return null;
  const cycleDay = (diff % cycleLen) + 1;
  return getPhaseFromDay(cycleDay, cycleLen);
}

// ── Scoring helpers ───────────────────────────────────────────────────────────
function skinConditionScore(val) {
  if (!val) return null;
  const v = val.toLowerCase();
  if (v.includes("clear") || v.includes("glow")) return 5;
  if (v === "normal") return 4;
  if (v.includes("mild") || v.includes("very oily")) return 3;
  if (v.includes("moderate") || v.includes("very dry")) return 2;
  return null;
}

function hairSheddingScore(val) {
  if (!val) return null;
  if (val === "Normal") return 1;
  if (val === "More than usual") return 2;
  if (val === "A lot") return 3;
  return null;
}

const SKIN_CONDITION_COLORS = {
  "Clear": { bg: "var(--sage-subtle)", color: "var(--sage)" },
  "Glowing": { bg: "var(--sage-subtle)", color: "var(--sage)" },
  "Normal": { bg: "var(--ivory-dark)", color: "var(--mauve)" },
  "Mild breakout": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Very oily": { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
  "Moderate breakout": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Very dry": { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
};

function conditionPillStyle(val) {
  if (!val) return { bg: "var(--ivory-dark)", color: "var(--mauve)" };
  for (const [k, v] of Object.entries(SKIN_CONDITION_COLORS)) {
    if (val.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return { bg: "var(--ivory-dark)", color: "var(--mauve)" };
}

function sheddingPillStyle(val) {
  if (val === "Normal") return { bg: "var(--sage-subtle)", color: "var(--sage)" };
  if (val === "More than usual") return { bg: "var(--mauve-subtle)", color: "var(--mauve)" };
  if (val === "A lot") return { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" };
  return { bg: "var(--ivory-dark)", color: "var(--mauve)" };
}

// ── Phase bar chart component ─────────────────────────────────────────────────
function PhaseBarChart({ data, color }) {
  const chartData = PHASES.map((p) => ({
    phase: PHASE_LABELS[p].slice(0, 3),
    value: data[p] ?? 0,
    fill: PHASE_COLORS[p],
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} barSize={32} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="phase"
          tick={{ fontSize: 11, fill: "var(--mauve)", }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--mauve)", }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
            color: "var(--plum)",
            boxShadow: "var(--shadow-sm)",
          }}
          cursor={{ fill: "var(--ivory-dark)" }}
          formatter={(val) => [val.toFixed(1), ""]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Score line chart ──────────────────────────────────────────────────────────
function ScoreLineChart({ data, color, dataKey, yDomain }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--mauve)", }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={yDomain}
          tick={{ fontSize: 10, fill: "var(--mauve)", }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
            color: "var(--plum)",
            boxShadow: "var(--shadow-sm)",
          }}
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          formatter={(val) => [val, ""]}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Phase brief card ──────────────────────────────────────────────────────────
function PhaseBriefCard({ phase, briefs }) {
  if (!phase) return null;
  const brief = briefs[phase];
  return (
    <div style={{ ...card, backgroundColor: "var(--ivory-dark)", borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: PHASE_COLORS[phase] }}
        />
        <p style={{ ...sLabel, color: PHASE_COLORS[phase] }}>{brief.headline}</p>
      </div>
      <p style={{ fontSize: "13px", color: "var(--plum)", lineHeight: 1.65 }}>
        {brief.tip}
      </p>
    </div>
  );
}

// ── Ingredient guide ─────────────────────────────────────────────────────────
function IngredientGuide({ phase, mode }) {
  if (!phase) return null;
  const data = mode === "skin" ? SKIN_INGREDIENTS[phase] : HAIR_INGREDIENTS[phase];
  if (!data) return null;
  return (
    <div style={card}>
      <p style={sLabel}>This week \u2014 what to use</p>
      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--plum)", marginBottom: "8px", marginTop: "10px" }}>Use</p>
      {data.use.map((ing) => (
        <div key={ing.name} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--sage)", flexShrink: 0, marginTop: "5px" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", }}>{ing.name}</span>
            <span style={{ fontSize: "11px", color: "var(--mauve)", lineHeight: 1.5 }}>{ing.why}</span>
          </div>
        </div>
      ))}
      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--rose-dust)", marginBottom: "8px", marginTop: "12px" }}>Avoid this week</p>
      {data.avoid.map((ing) => (
        <div key={ing.name} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--rose-dust)", flexShrink: 0, marginTop: "5px" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", }}>{ing.name}</span>
            <span style={{ fontSize: "11px", color: "var(--mauve)", lineHeight: 1.5 }}>{ing.why}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Cycle skin forecast ───────────────────────────────────────────────────────
const PHASE_ABBR = { menstrual: "Men", follicular: "Fol", ovulatory: "Ovu", luteal: "Lut" };

function CycleSkinForecast({ profile }) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const lastPeriod = parseISO(profile.last_period_start_date);
  const today = new Date();
  const todayDay = (differenceInDays(today, lastPeriod) % cycleLen) + 1;

  const days = Array.from({ length: 28 }, (_, i) => {
    const dayOfCycle = ((todayDay + i - 1) % cycleLen) + 1;
    const date = addDays(today, i);
    const phase = getPhaseFromDay(dayOfCycle, cycleLen);
    return { date, dayOfCycle, phase, daysFromNow: i };
  });

  const segments = [];
  let current = null;
  for (const d of days) {
    if (!current || d.phase !== current.phase) {
      current = { phase: d.phase, start: d.date, startDaysFromNow: d.daysFromNow, days: [d] };
      segments.push(current);
    } else {
      current.days.push(d);
    }
  }

  const nextSegment = segments.find((s) => s.startDaysFromNow > 0);

  return (
    <div style={card}>
      <style>{`.skin-forecast-scroll::-webkit-scrollbar{display:none;}`}</style>
      <p style={sLabel} className="mb-3">28-day skin forecast</p>
      <div
        className="skin-forecast-scroll"
        style={{ overflowX: "auto", display: "flex", gap: "8px", paddingBottom: "8px", scrollbarWidth: "none" }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: `${Math.max(64, seg.days.length * 20)}px`,
              borderRadius: "14px",
              padding: "10px 10px 12px",
              backgroundColor: PHASE_COLORS[seg.phase] + "26",
              border: "1px solid " + PHASE_COLORS[seg.phase] + "40",
            }}
          >
            <p style={{ fontSize: "8px", fontWeight: 700, color: PHASE_COLORS[seg.phase], textTransform: "uppercase" }}>
              {PHASE_ABBR[seg.phase]}
            </p>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--plum)", marginTop: "4px" }}>
              {seg.days.length}d
            </p>
            {seg.startDaysFromNow === 0 && (
              <p style={{ fontSize: "10px", fontWeight: 700, color: PHASE_COLORS[seg.phase], marginTop: "2px" }}>Today</p>
            )}
          </div>
        ))}
      </div>
      {nextSegment && (
        <p style={{ fontSize: "12px", color: "var(--mauve)", marginTop: "12px", lineHeight: 1.6 }}>
          Your skin enters its {PHASE_LABELS[nextSegment.phase].toLowerCase()} phase in {nextSegment.startDaysFromNow} day{nextSegment.startDaysFromNow !== 1 ? "s" : ""} \u2014 {SKIN_FORECAST_COPY[nextSegment.phase]}
        </p>
      )}
    </div>
  );
}

// ── Routine phase alert ───────────────────────────────────────────────────────
function RoutinePhaseAlert({ skinRoutines, checkins, profile }) {
  if (!skinRoutines.length || checkins.length < 14 || !profile?.last_period_start_date) return null;

  const cycleLen = profile.cycle_avg_length || 28;
  const scored = checkins.filter((c) => c.skin_condition).map((c) => ({
    phase: getCheckinPhase(c.date, profile.last_period_start_date, cycleLen),
    score: skinConditionScore(c.skin_condition),
  })).filter((c) => c.phase && c.score);

  if (!scored.length) return null;

  const phaseAvgs = {};
  PHASES.forEach((p) => {
    const vals = scored.filter((c) => c.phase === p).map((c) => c.score);
    if (vals.length) phaseAvgs[p] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  const worstPhase = Object.keys(phaseAvgs).length
    ? Object.entries(phaseAvgs).sort((a, b) => a[1] - b[1])[0][0]
    : null;

  if (!worstPhase) return null;

  const missingSpf = !skinRoutines.some((r) => !r.ended_date && r.product_type === "SPF");
  const missingTreatment = !skinRoutines.some((r) => !r.ended_date && r.product_type === "treatment");

  const alerts = [];
  if (worstPhase === "luteal" && missingTreatment) {
    alerts.push("Your skin is worst in the luteal phase but you have no treatment (salicylic acid, niacinamide, or spot treatment) logged in your routine. This phase is when targeted actives matter most.");
  }
  if (worstPhase === "ovulatory" && missingSpf) {
    alerts.push("Your skin struggles most around ovulation \u2014 a testosterone-driven surge that is worsened by UV exposure. Logging SPF in your morning routine helps you track whether sun protection is making a difference.");
  }
  if (worstPhase === "menstrual" && missingTreatment) {
    alerts.push("Your skin is most reactive during menstruation. Adding a gentle barrier repair product (ceramides or centella) to your routine could help \u2014 log it to start tracking the impact.");
  }

  if (!alerts.length) return null;

  return (
    <div style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)", borderRadius: "20px", padding: "16px", marginBottom: "16px" }}>
      <p style={{ ...sLabel, color: "var(--rose-dust)" }}>Routine gap detected</p>
      {alerts.map((alert, i) => (
        <p key={i} style={{ fontSize: "13px", color: "var(--plum)", lineHeight: 1.65, marginTop: "8px" }}>
          {alert}
        </p>
      ))}
    </div>
  );
}

// ── Pattern insight card ──────────────────────────────────────────────────────
function PatternInsightCard({ checkins, profile }) {
  if (!profile?.last_period_start_date) return null;
  const scored = checkins.filter((c) => c.skin_condition).map((c) => ({
    phase: getCheckinPhase(c.date, profile.last_period_start_date, profile.cycle_avg_length || 28),
    score: skinConditionScore(c.skin_condition),
  })).filter((c) => c.phase && c.score);

  if (scored.length < 14) return null;

  const phaseScores = {};
  PHASES.forEach((p) => {
    const vals = scored.filter((c) => c.phase === p).map((c) => c.score);
    phaseScores[p] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  });

  const best = PHASES.filter((p) => phaseScores[p]).sort((a, b) => phaseScores[b] - phaseScores[a])[0];
  const worst = PHASES.filter((p) => phaseScores[p]).sort((a, b) => phaseScores[a] - phaseScores[b])[0];

  // Chin/jaw dominance
  const breakoutCounts = {};
  checkins.forEach((c) => {
    if (Array.isArray(c.breakout_location)) {
      c.breakout_location.forEach((loc) => {
        breakoutCounts[loc] = (breakoutCounts[loc] || 0) + 1;
      });
    }
  });
  const totalBreakouts = Object.values(breakoutCounts).reduce((a, b) => a + b, 0);
  const chinJawCount = (breakoutCounts["Chin"] || 0) + (breakoutCounts["Jawline"] || 0);
  const isHormonal = totalBreakouts > 0 && chinJawCount / totalBreakouts > 0.6;

  return (
    <div style={{ ...card, borderColor: "var(--rose-dust-light)", backgroundColor: "var(--rose-dust-subtle)" }}>
      <p style={{ ...sLabel, color: "var(--rose-dust)", marginBottom: "8px" }}>Pattern insight</p>
      <p style={{ fontSize: "13px", color: "var(--plum)", lineHeight: 1.65 }}>
        {best && worst
          ? `Your skin tends to be clearest in your ${PHASE_LABELS[best].toLowerCase()} phase and most reactive in your ${PHASE_LABELS[worst].toLowerCase()} phase.`
          : "Keep logging to reveal your personal skin pattern."}
        {isHormonal && " Chin and jaw breakouts dominate your logs — a pattern consistent with androgen-driven hormonal acne."}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SkinHair() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState("skin");
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [tryOnPhoto, setTryOnPhoto] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnError, setTryOnError] = useState(null);
  const [tryOnChangeType, setTryOnChangeType] = useState("colour");
  const [tryOnChangeValue, setTryOnChangeValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(true);
  const [dailyTip, setDailyTip] = useState(null);
  const [trendItems, setTrendItems] = useState([]);
  const [skinRoutines, setSkinRoutines] = useState([]);
  const [hairRoutines, setHairRoutines] = useState([]);
  const [showAddSkinProduct, setShowAddSkinProduct] = useState(false);
  const [showAddWashDay, setShowAddWashDay] = useState(false);
  const [newProduct, setNewProduct] = useState({ product_name: "", product_type: "cleanser", routine_slot: "morning", notes: "" });
  const [newWashDay, setNewWashDay] = useState({ wash_date: new Date().toISOString().split("T")[0], shampoo: "", conditioner: "", treatment: "", heat_used: false, scalp_condition: "Normal", shedding_noted: false, notes: "" });
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingWash, setSavingWash] = useState(false);

  useEffect(() => {
    (async () => {
      try {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, allCheckins, skinR, hairR, tipCards, trends] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 200).catch(() => []),
        base44.entities.SkinRoutine.filter({ user_id: u.id }).catch(() => []),
        base44.entities.HairRoutine.filter({ user_id: u.id }).catch(() => []),
        base44.entities.InsightCards.filter({ type: "SKIN_TIP" }).catch(() => []),
        base44.entities.LifestyleItems.filter({ content_type: "TREND" }, "-pub_date", 30).catch(() => []),
      ]);
      const sortedTips = tipCards.sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''));
      setDailyTip(sortedTips[0] || null);
      setTrendItems(trends.filter(t => ["Skincare", "Fashion", "Haircare"].includes(t.category)).slice(0, 10));
      setProfile(profiles[0] || null);
      const cutoff = subDays(new Date(), 90).toISOString().split("T")[0];
      setCheckins(
        allCheckins
          .filter((c) => c.date >= cutoff)
          .sort((a, b) => a.date.localeCompare(b.date))
      );
      // premium always enabled
      setSkinRoutines(skinR.sort((a, b) => (b.started_date || "").localeCompare(a.started_date || "")));
      setHairRoutines(hairR.sort((a, b) => (b.wash_date || "").localeCompare(a.wash_date || "")));
      } catch (err) {
        console.error("SkinHair page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentPhase = profile?.last_period_start_date
    ? getCurrentPhase(profile.last_period_start_date, profile.cycle_avg_length || 28)
    : null;

  const cutoffDate = subDays(new Date(), timeRange).toISOString().split("T")[0];
  const filtered = checkins.filter((c) => c.date >= cutoffDate);

  const hasSkinData = filtered.some((c) => c.skin_condition || c.skin);
  const hasHairData = filtered.some((c) => c.hair_shedding);
  const hasAnyData = hasSkinData || hasHairData;

  // ── Skin phase averages ──
  const skinPhaseData = {};
  if (profile?.last_period_start_date) {
    const byPhase = {};
    PHASES.forEach((p) => { byPhase[p] = []; });
    filtered.forEach((c) => {
      const score = skinConditionScore(c.skin_condition);
      const phase = getCheckinPhase(c.date, profile.last_period_start_date, profile.cycle_avg_length || 28);
      if (score && phase) byPhase[phase].push(score);
    });
    PHASES.forEach((p) => {
      const vals = byPhase[p];
      skinPhaseData[p] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
    });
  }

  // ── Hair phase averages ──
  const hairPhaseData = {};
  if (profile?.last_period_start_date) {
    const byPhase = {};
    PHASES.forEach((p) => { byPhase[p] = []; });
    filtered.forEach((c) => {
      const score = hairSheddingScore(c.hair_shedding);
      const phase = getCheckinPhase(c.date, profile.last_period_start_date, profile.cycle_avg_length || 28);
      if (score && phase) byPhase[phase].push(score);
    });
    PHASES.forEach((p) => {
      const vals = byPhase[p];
      hairPhaseData[p] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
    });
  }

  // ── Skin line data ──
  const skinLineData = filtered
    .filter((c) => c.skin != null)
    .map((c) => ({ label: format(parseISO(c.date), "d MMM"), value: c.skin, date: c.date }));

  // ── Hair line data ──
  const hairLineData = filtered
    .filter((c) => c.hair_shedding)
    .map((c) => ({ label: format(parseISO(c.date), "d MMM"), value: hairSheddingScore(c.hair_shedding), date: c.date }));

  // ── Breakout location map ──
  const breakoutCounts = {};
  filtered.forEach((c) => {
    if (Array.isArray(c.breakout_location)) {
      c.breakout_location.forEach((loc) => {
        breakoutCounts[loc] = (breakoutCounts[loc] || 0) + 1;
      });
    }
  });
  const maxBreakout = Math.max(...Object.values(breakoutCounts), 1);
  const breakoutEntries = Object.entries(breakoutCounts).sort((a, b) => b[1] - a[1]);
  const totalBreakouts = Object.values(breakoutCounts).reduce((a, b) => a + b, 0);
  const chinJawCount = (breakoutCounts["Chin"] || 0) + (breakoutCounts["Jawline"] || 0);
  const showHormonalCallout = totalBreakouts > 0 && chinJawCount / totalBreakouts > 0.6;

  // ── Scalp condition breakdown ──
  const scalpCounts = { Normal: 0, Oily: 0, "Dry/flaky": 0 };
  filtered.forEach((c) => {
    if (c.scalp_condition && scalpCounts[c.scalp_condition] !== undefined) {
      scalpCounts[c.scalp_condition]++;
    }
  });
  const totalScalp = Object.values(scalpCounts).reduce((a, b) => a + b, 0);

  // ── Summary stats ──
  const daysLogged = filtered.filter((c) => c.skin_condition || c.hair_shedding).length;
  const skinConditionMode = (() => {
    const freq = {};
    filtered.forEach((c) => { if (c.skin_condition) freq[c.skin_condition] = (freq[c.skin_condition] || 0) + 1; });
    const entries = Object.entries(freq);
    if (!entries.length) return "—";
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  })();
  const worstHairPhase = PHASES.filter((p) => hairPhaseData[p] > 0).sort((a, b) => hairPhaseData[b] - hairPhaseData[a])[0];
  const bestSkinPhase = PHASES.filter((p) => skinPhaseData[p] > 0).sort((a, b) => skinPhaseData[b] - skinPhaseData[a])[0];

  // ── Recent skin log ──
  const recentSkinLog = [...filtered].filter((c) => c.skin_condition).reverse().slice(0, 14);
  const recentHairLog = [...filtered].filter((c) => c.hair_shedding).reverse().slice(0, 14);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>

      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 pt-10 pb-4"
        style={{
          backgroundColor: "rgba(250,248,245,0.97)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
        }}
      >
        <p style={sLabel} className="mb-1">Skin & Hair</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="fw-display">
            Your Glow Tracker
          </h1>
          {currentPhase && (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: `${PHASE_COLORS[currentPhase]}20`,
                color: PHASE_COLORS[currentPhase],
                border: `1px solid ${PHASE_COLORS[currentPhase]}50`,
                }}
            >
              {PHASE_LABELS[currentPhase]}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Daily tip card */}
        {(() => {
          const parsed = dailyTip?.content ? (() => { try { return JSON.parse(dailyTip.content); } catch { return null; } })() : null;
          const fallbackTip = currentPhase ? PHASE_BRIEF_SKIN[currentPhase]?.tip : null;
          return (
            <div style={{ background: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.1em", }}>Today's advice</span>
                {currentPhase && <span style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", background: "rgba(196,132,154,0.15)", borderRadius: 9999, padding: "2px 9px", }}>{PHASE_LABELS[currentPhase]}</span>}
              </div>
              {parsed ? (
                <>
                  <p style={{ fontSize: 14, color: "var(--plum)", lineHeight: 1.6, margin: 0 }}>{parsed.skin_tip}</p>
                  <div style={{ borderTop: "1px solid var(--border-subtle)", margin: "10px 0" }} />
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Hair</p>
                  <p style={{ fontSize: 14, color: "var(--plum)", lineHeight: 1.6, margin: 0 }}>{parsed.hair_tip}</p>
                </>
              ) : fallbackTip ? (
                <p style={{ fontSize: 14, color: "var(--plum)", lineHeight: 1.6, margin: 0 }}>{fallbackTip}</p>
              ) : (
                <p style={{ fontSize: 13, color: "var(--mauve)", margin: 0 }}>Log your check-in daily to unlock personalised skin and hair tips.</p>
              )}
            </div>
          );
        })()}

        {/* Hairstyle try-on entry card */}
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--plum)", margin: 0 }}>Hairstyle try-on</p>
            <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: 3 }}>See yourself in a different colour, style or length.</p>
          </div>
          <button
            onClick={() => setTryOnOpen(true)}
            style={{ backgroundColor: "var(--plum)", color: "white", borderRadius: 9999, padding: "8px 18px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0 }}
          >
            Try it
          </button>
        </div>

        {/* Try-on sheet */}
        {tryOnOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 51 }}>
            <style>{`@keyframes sheet-up-tryon { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            <div
              onClick={() => { setTryOnOpen(false); setTryOnPhoto(null); setTryOnResult(null); setTryOnError(null); }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", maxHeight: "88vh", overflowY: "auto", animation: "sheet-up-tryon 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 16, marginBottom: 16 }}>
                <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--plum)", margin: 0 }}>Try a new look</h2>
                <button
                  onClick={() => { setTryOnOpen(false); setTryOnPhoto(null); setTryOnResult(null); setTryOnError(null); }}
                  style={{ width: 28, height: 28, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                >x</button>
              </div>
              <div style={{ padding: "0 20px 32px" }}>
                {/* Photo upload */}
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 8 }}>Your photo</p>
                <label style={{ display: "block", border: "2px dashed var(--border)", borderRadius: 16, padding: 28, textAlign: "center", background: "var(--ivory)", cursor: "pointer", marginBottom: 20 }}>
                  {tryOnPhoto
                    ? <img src={tryOnPhoto} alt="Your photo" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, display: "block" }} />
                    : <p style={{ fontSize: 14, color: "var(--mauve)", }}>Tap to add a photo</p>
                  }
                  <input
                    type="file" accept="image/*" capture="user" style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setTryOnPhoto(ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {/* What to change */}
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 8 }}>What to change</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {["colour", "style", "length"].map(t => (
                    <button key={t} onClick={() => setTryOnChangeType(t)}
                      style={{ flex: 1, borderRadius: 9999, padding: "7px 14px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", textTransform: "capitalize",
                        backgroundColor: tryOnChangeType === t ? "var(--plum)" : "var(--ivory-dark)",
                        color: tryOnChangeType === t ? "white" : "var(--plum)"
                      }}>{t}</button>
                  ))}
                </div>

                {/* Description */}
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 8 }}>Describe the change</p>
                <input
                  value={tryOnChangeValue}
                  onChange={e => setTryOnChangeValue(e.target.value)}
                  placeholder={tryOnChangeType === "colour" ? "e.g. dark auburn, platinum blonde, jet black" : tryOnChangeType === "style" ? "e.g. soft beach waves, sleek straight, tight curls" : "e.g. short bob, shoulder length, waist length"}
                  style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, color: "var(--plum)", background: "var(--ivory)", width: "100%", boxSizing: "border-box", marginBottom: 16, outline: "none" }}
                />

                {/* Generate button */}
                <button
                  disabled={tryOnLoading || !tryOnPhoto || !tryOnChangeValue.trim()}
                  onClick={async () => {
                    setTryOnLoading(true);
                    setTryOnError(null);
                    setTryOnResult(null);
                    try {
                      const promptStr = `Portrait photo of this exact person with ${tryOnChangeValue} hair ${tryOnChangeType === 'colour' ? 'colour' : tryOnChangeType === 'style' ? 'style' : 'length'}. Photorealistic. Same face, same skin tone, same expression. High quality fashion photography lighting. Natural looking result.`;
                      const result = await base44.integrations.Core.GenerateImage({ prompt: promptStr, existing_image_urls: [tryOnPhoto] });
                      setTryOnResult(result.url);
                    } catch {
                      setTryOnError("Generation failed. Please try again.");
                    } finally {
                      setTryOnLoading(false);
                    }
                  }}
                  style={{ width: "100%", height: 52, borderRadius: 9999, background: "var(--rose-dust)", color: "white", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", opacity: (tryOnLoading || !tryOnPhoto || !tryOnChangeValue.trim()) ? 0.5 : 1 }}
                >
                  {tryOnLoading ? "Generating..." : "Generate"}
                </button>

                {tryOnError && (
                  <p style={{ fontSize: 13, color: "var(--rose-dust)", textAlign: "center", marginTop: 8 }}>{tryOnError}</p>
                )}

                {/* Result */}
                {tryOnResult && (
                  <div>
                    <img src={tryOnResult} alt="Your new look" style={{ width: "100%", borderRadius: 16, marginTop: 16, maxHeight: 360, objectFit: "cover", display: "block" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => window.open(tryOnResult, "_blank")} style={{ flex: 1, borderRadius: 9999, padding: "10px", fontSize: 13, fontWeight: 600, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", }}>Save image</button>
                      <button onClick={() => { setTryOnResult(null); setTryOnChangeValue(""); }} style={{ flex: 1, borderRadius: 9999, padding: "10px", fontSize: 13, fontWeight: 600, backgroundColor: "var(--ivory-dark)", color: "var(--plum)", border: "1px solid var(--border)", cursor: "pointer", }}>Try again</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trending row */}
        {trendItems.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", marginBottom: 10 }}>Trending</p>
            <style>{`.sh-trend-scroll::-webkit-scrollbar{display:none}`}</style>
            <div className="sh-trend-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, msOverflowStyle: "none", scrollbarWidth: "none" }}>
              {trendItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => item.content_url && window.open(item.content_url, '_blank')}
                  style={{ flexShrink: 0, width: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}
                >
                  <div style={{ height: 100, background: "var(--ivory-dark)", overflow: "hidden" }}>
                    {item.image_url && <img src={item.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />}
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", margin: "0 0 4px" }}>{item.title}</p>
                    <p style={{ fontSize: 10, color: "var(--mauve)", margin: 0 }}>{item.source_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Days logged", value: daysLogged || "—" },
            { label: `Most common (${timeRange}d)`, value: skinConditionMode },
            { label: "Most hair shedding", value: worstHairPhase ? PHASE_LABELS[worstHairPhase] : "—" },
            { label: "Best skin phase", value: bestSkinPhase ? PHASE_LABELS[bestSkinPhase] : "—" },
          ].map((stat) => (
            <div key={stat.label} style={{ ...card, padding: "14px" }}>
              <p style={sLabel} className="mb-1">{stat.label}</p>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--plum)",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tab + time range controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 p-1 rounded-[14px]" style={{ backgroundColor: "var(--ivory-dark)" }}>
            {["skin", "hair"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold capitalize transition-all"
                style={{
                  backgroundColor: activeTab === tab ? "var(--plum)" : "transparent",
                  color: activeTab === tab ? "white" : "var(--mauve)",
                  }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-[14px] self-end" style={{ backgroundColor: "var(--ivory-dark)" }}>
            {[30, 60, 90].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className="px-4 py-1.5 rounded-[10px] text-xs font-semibold transition-all"
                style={{
                  backgroundColor: timeRange === r ? "var(--plum)" : "transparent",
                  color: timeRange === r ? "white" : "var(--mauve)",
                  }}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state ── */}
        {!hasAnyData && (
          <div style={{ ...card, padding: "3rem 1.5rem", textAlign: "center" }}>
            <div
              className="w-10 h-10 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "var(--rose-dust-subtle)" }}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--rose-dust)" }} />
            </div>
            <h3
              style={{
                fontSize: "18px",
                color: "var(--plum)",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              No skin & hair data yet
            </h3>
            <p style={{ fontSize: "13px", color: "var(--mauve)", lineHeight: 1.6 }}>
              Log your skin condition and hair shedding in the daily check-in to see your trends here.
            </p>
            <a
              href={createPageUrl("Today")}
              className="inline-block mt-5 text-sm font-semibold"
              style={{
                backgroundColor: "var(--plum)",
                color: "white",
                borderRadius: "12px",
                padding: "12px 24px",
                }}
            >
              Go to check-in
            </a>
          </div>
        )}

        {/* ── SKIN TAB ── */}
        {hasAnyData && activeTab === "skin" && (
          <div className="space-y-4">

            {/* Phase brief */}
            <PhaseBriefCard phase={currentPhase} briefs={PHASE_BRIEF_SKIN} />

            {/* Ingredient guide */}
            <IngredientGuide phase={currentPhase} mode="skin" />

            {/* Connectivity — reflect / compare notes on phase skin + hair */}
            <ContentActionBar
              reflect={{ seed: "What my skin and hair seem to need this phase — ", type: "reflection" }}
              discuss={{ room: "style", seed: "Phase skincare — what's actually working for you?" }}
              jess="skincare for my cycle phase"
            />

            {/* Phase correlation */}
            <div style={card}>
              <p style={sLabel} className="mb-3">Skin clarity by phase</p>
              {Object.values(skinPhaseData).some((v) => v > 0) ? (
                <PhaseBarChart data={skinPhaseData} />
              ) : (
                <p style={{ fontSize: "13px", color: "var(--mauve)", }}>
                  Not enough data yet for this period.
                </p>
              )}
              <p style={{ fontSize: "11px", color: "var(--mauve)", marginTop: "8px" }}>
                Higher score = clearer skin in that phase
              </p>
            </div>

            {/* Skin score over time */}
            {skinLineData.length >= 3 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Skin score over time</p>
                <ScoreLineChart data={skinLineData} color="#C4849A" dataKey="value" yDomain={[0, 5]} />
              </div>
            )}

            {/* Pattern insight */}
            <PatternInsightCard checkins={filtered} profile={profile} />

            {/* Breakout location map */}
            {breakoutEntries.length > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Breakout locations</p>
                <div className="space-y-2.5">
                  {breakoutEntries.map(([loc, count]) => (
                    <div key={loc}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--plum)", }}>
                          {loc}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--mauve)", }}>
                          {count}x
                        </span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "var(--ivory-dark)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${(count / maxBreakout) * 100}%`,
                            backgroundColor: "var(--rose-dust)",
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {showHormonalCallout && (
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--plum)", lineHeight: 1.6 }}>
                      Chin and jaw account for over 60% of your logged breakouts — a pattern strongly associated with androgen-driven hormonal acne.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Skincare Routine Log */}
            <SkincareRoutineSection
              isPremium={isPremium}
              routines={skinRoutines}
              showAdd={showAddSkinProduct}
              setShowAdd={setShowAddSkinProduct}
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              saving={savingProduct}
              onSave={async () => {
                if (!newProduct.product_name.trim()) return;
                setSavingProduct(true);
                const created = await base44.entities.SkinRoutine.create({
                  user_id: user.id,
                  ...newProduct,
                  started_date: new Date().toISOString().split("T")[0],
                });
                setSkinRoutines((prev) => [created, ...prev]);
                setNewProduct({ product_name: "", product_type: "cleanser", routine_slot: "morning", notes: "" });
                setShowAddSkinProduct(false);
                setSavingProduct(false);
              }}
              onRemove={async (id) => {
                await base44.entities.SkinRoutine.delete(id);
                setSkinRoutines((prev) => prev.filter((r) => r.id !== id));
              }}
            />

            {/* Routine phase alert */}
            <RoutinePhaseAlert skinRoutines={skinRoutines} checkins={filtered} profile={profile} />

            {/* Recent skin log */}
            {recentSkinLog.length > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Recent skin log</p>
                <div className="space-y-2">
                  {recentSkinLog.map((c) => {
                    const pill = conditionPillStyle(c.skin_condition);
                    return (
                      <div
                        key={c.id || c.date}
                        className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
                        style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}
                      >
                        <span style={{ fontSize: "12px", color: "var(--mauve)", flexShrink: 0 }}>
                          {format(parseISO(c.date), "d MMM")}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: pill.bg, color: pill.color, }}
                          >
                            {c.skin_condition}
                          </span>
                          {c.skin && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-full"
                              style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)", border: "1px solid var(--border)" }}
                            >
                              {c.skin}/5
                            </span>
                          )}
                          {Array.isArray(c.breakout_location) && c.breakout_location.map((loc) => (
                            <span
                              key={loc}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", }}
                            >
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Cycle skin forecast */}
            <CycleSkinForecast profile={profile} />

          </div>
        )}

        {/* ── HAIR TAB ── */}
        {hasAnyData && activeTab === "hair" && (
          <div className="space-y-4">

            {/* Phase brief */}
            <PhaseBriefCard phase={currentPhase} briefs={PHASE_BRIEF_HAIR} />

            {/* Ingredient guide */}
            <IngredientGuide phase={currentPhase} mode="hair" />

            {/* Hair phase correlation */}
            <div style={card}>
              <p style={sLabel} className="mb-3">Hair shedding by phase</p>
              {Object.values(hairPhaseData).some((v) => v > 0) ? (
                <PhaseBarChart data={hairPhaseData} />
              ) : (
                <p style={{ fontSize: "13px", color: "var(--mauve)", }}>
                  Not enough data yet for this period.
                </p>
              )}
              <p style={{ fontSize: "11px", color: "var(--mauve)", marginTop: "8px" }}>
                Higher bar = more shedding in that phase
              </p>
            </div>

            {/* Hair shedding over time */}
            {hairLineData.length >= 3 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Shedding over time</p>
                <ScoreLineChart data={hairLineData} color="#7A9E8E" dataKey="value" yDomain={[0, 3]} />
              </div>
            )}

            {/* Scalp condition breakdown */}
            {totalScalp > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Scalp condition</p>
                <div className="space-y-2.5">
                  {Object.entries(scalpCounts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cond, count]) => (
                    <div key={cond}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--plum)", }}>
                          {cond}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--mauve)", }}>
                          {count}x · {Math.round((count / totalScalp) * 100)}%
                        </span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "var(--ivory-dark)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${(count / totalScalp) * 100}%`,
                            backgroundColor: "var(--sage)",
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {scalpCounts["Oily"] > 0 && (
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{ backgroundColor: "var(--mauve-subtle)", border: "1px solid var(--mauve-light)" }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--plum)", lineHeight: 1.6 }}>
                      Oily scalp days are expected around ovulation due to a testosterone surge — this is a normal hormonal pattern, not a product issue.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hair Shedding Trend Alert */}
            <SheddingTrendAlert checkins={checkins} isPremium={isPremium} currentPhase={currentPhase} />

            {/* Hair Routine Log */}
            <HairRoutineSection
              isPremium={isPremium}
              routines={hairRoutines}
              showAdd={showAddWashDay}
              setShowAdd={setShowAddWashDay}
              newWashDay={newWashDay}
              setNewWashDay={setNewWashDay}
              saving={savingWash}
              onSave={async () => {
                setSavingWash(true);
                const created = await base44.entities.HairRoutine.create({
                  user_id: user.id,
                  ...newWashDay,
                });
                setHairRoutines((prev) => [created, ...prev]);
                setNewWashDay({ wash_date: new Date().toISOString().split("T")[0], shampoo: "", conditioner: "", treatment: "", heat_used: false, scalp_condition: "Normal", shedding_noted: false, notes: "" });
                setShowAddWashDay(false);
                setSavingWash(false);
              }}
              onRemove={async (id) => {
                await base44.entities.HairRoutine.delete(id);
                setHairRoutines((prev) => prev.filter((r) => r.id !== id));
              }}
            />

            {/* Recent hair log */}
            {recentHairLog.length > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Recent hair log</p>
                <div className="space-y-2">
                  {recentHairLog.map((c) => {
                    const pill = sheddingPillStyle(c.hair_shedding);
                    const scalpPill =
                      c.scalp_condition === "Oily"
                        ? { bg: "var(--mauve-subtle)", color: "var(--mauve)" }
                        : c.scalp_condition === "Dry/flaky"
                        ? { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }
                        : { bg: "var(--sage-subtle)", color: "var(--sage)" };
                    return (
                      <div
                        key={c.id || c.date}
                        className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
                        style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}
                      >
                        <span style={{ fontSize: "12px", color: "var(--mauve)", flexShrink: 0 }}>
                          {format(parseISO(c.date), "d MMM")}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: pill.bg, color: pill.color, }}
                          >
                            {c.hair_shedding}
                          </span>
                          {c.scalp_condition && (
                            <span
                              className="text-xs px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: scalpPill.bg, color: scalpPill.color, }}
                            >
                              {c.scalp_condition}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skincare Routine Section ─────────────────────────────────────────────────
const PRODUCT_TYPES = ["cleanser", "serum", "moisturiser", "SPF", "treatment", "eye_cream", "toner", "mask"];
const ROUTINE_SLOTS = ["morning", "evening", "both"];

function SkincareRoutineSection({ isPremium, routines, showAdd, setShowAdd, newProduct, setNewProduct, saving, onSave, onRemove }) {
  const inner = (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", boxShadow: "var(--shadow-sm)", padding: "1.25rem" }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Skincare routine</p>
        {isPremium && (
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{ backgroundColor: "var(--plum)", color: "white", }}
          >
            <Plus className="w-3 h-3" /> Add product
          </button>
        )}
      </div>

      {isPremium && showAdd && (
        <div className="mb-4 space-y-3 rounded-[16px] p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
          <input
            placeholder="Product name *"
            value={newProduct.product_name}
            onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newProduct.product_type}
              onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
              className="px-3 py-2.5 rounded-xl text-xs font-medium focus:outline-none capitalize"
              style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }}
            >
              {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={newProduct.routine_slot}
              onChange={(e) => setNewProduct({ ...newProduct, routine_slot: e.target.value })}
              className="px-3 py-2.5 rounded-xl text-xs font-medium focus:outline-none capitalize"
              style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }}
            >
              {ROUTINE_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input
            placeholder="Notes (optional)"
            value={newProduct.notes}
            onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }}
          />
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ border: "1.5px solid var(--border)", color: "var(--mauve)", }}>Cancel</button>
            <button onClick={onSave} disabled={!newProduct.product_name.trim() || saving} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--plum)", color: "white", opacity: (!newProduct.product_name.trim() || saving) ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {routines.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--mauve)", }}>No products logged yet. Add your current routine to track how products affect your skin.</p>
      ) : (
        <div className="space-y-2">
          {["morning", "evening", "both"].map((slot) => {
            const slotItems = routines.filter((r) => r.routine_slot === slot && !r.ended_date);
            if (!slotItems.length) return null;
            return (
              <div key={slot}>
                <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", marginBottom: "6px", marginTop: "8px" }}>{slot}</p>
                {slotItems.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-[12px] px-3.5 py-2.5 mb-1.5" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--plum)", }}>{r.product_name}</p>
                      <p style={{ fontSize: "11px", color: "var(--mauve)", textTransform: "capitalize" }}>{r.product_type}</p>
                    </div>
                    {isPremium && (
                      <button onClick={() => onRemove(r.id)} style={{ color: "var(--mauve)", padding: "4px" }}><X className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return inner;
}

// ── Hair Routine Section ──────────────────────────────────────────────────────
function HairRoutineSection({ isPremium, routines, showAdd, setShowAdd, newWashDay, setNewWashDay, saving, onSave, onRemove }) {
  const inner = (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", boxShadow: "var(--shadow-sm)", padding: "1.25rem" }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Wash day log</p>
        {isPremium && (
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "var(--sage)", color: "white", }}
          >
            <Plus className="w-3 h-3" /> Log wash day
          </button>
        )}
      </div>

      {isPremium && showAdd && (
        <div className="mb-4 space-y-3 rounded-[16px] p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p style={{ fontSize: "10px", color: "var(--mauve)", marginBottom: "4px", }}>Date</p>
              <input
                type="date"
                value={newWashDay.wash_date}
                onChange={(e) => setNewWashDay({ ...newWashDay, wash_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none"
                style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }}
              />
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "var(--mauve)", marginBottom: "4px", }}>Scalp</p>
              <select
                value={newWashDay.scalp_condition}
                onChange={(e) => setNewWashDay({ ...newWashDay, scalp_condition: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none"
                style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }}
              >
                {["Normal", "Oily", "Dry/flaky"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <input placeholder="Shampoo used" value={newWashDay.shampoo} onChange={(e) => setNewWashDay({ ...newWashDay, shampoo: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }} />
          <input placeholder="Conditioner" value={newWashDay.conditioner} onChange={(e) => setNewWashDay({ ...newWashDay, conditioner: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }} />
          <input placeholder="Treatment (mask, oil, deep condition — optional)" value={newWashDay.treatment} onChange={(e) => setNewWashDay({ ...newWashDay, treatment: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ border: "1.5px solid var(--border)", color: "var(--plum)", backgroundColor: "var(--surface)" }} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newWashDay.heat_used} onChange={(e) => setNewWashDay({ ...newWashDay, heat_used: e.target.checked })} />
              <span style={{ fontSize: "12px", color: "var(--plum)", }}>Heat used</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newWashDay.shedding_noted} onChange={(e) => setNewWashDay({ ...newWashDay, shedding_noted: e.target.checked })} />
              <span style={{ fontSize: "12px", color: "var(--plum)", }}>Shedding noted</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ border: "1.5px solid var(--border)", color: "var(--mauve)", }}>Cancel</button>
            <button onClick={onSave} disabled={saving} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--sage)", color: "white", opacity: saving ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {routines.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--mauve)", }}>No wash days logged yet. Track your wash routine to spot patterns between products and shedding.</p>
      ) : (
        <div className="space-y-2">
          {routines.slice(0, 8).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-[12px] px-3.5 py-2.5" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", }}>
                    {r.wash_date ? format(parseISO(r.wash_date), "d MMM") : "—"}
                  </p>
                  {r.scalp_condition && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: r.scalp_condition === "Oily" ? "var(--mauve-subtle)" : r.scalp_condition === "Dry/flaky" ? "var(--rose-dust-subtle)" : "var(--sage-subtle)", color: r.scalp_condition === "Oily" ? "var(--mauve)" : r.scalp_condition === "Dry/flaky" ? "var(--rose-dust)" : "var(--sage)", }}>{r.scalp_condition}</span>
                  )}
                  {r.shedding_noted && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", }}>Shedding</span>
                  )}
                </div>
                {r.shampoo && <p style={{ fontSize: "11px", color: "var(--mauve)", marginTop: "2px" }}>{r.shampoo}{r.conditioner ? ` · ${r.conditioner}` : ""}</p>}
              </div>
              {isPremium && (
                <button onClick={() => onRemove(r.id)} style={{ color: "var(--mauve)", padding: "4px" }}><X className="w-3.5 h-3.5" /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return inner;
}

// ── Shedding Trend Alert ──────────────────────────────────────────────────────
function SheddingTrendAlert({ checkins, currentPhase }) {
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  let consecutive = 0;
  for (const c of sorted) {
    if (c.hair_shedding === "A lot") consecutive++;
    else break;
  }

  if (consecutive >= 3) {
    return (
      <div
        className="rounded-[20px] p-4"
        style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}
      >
        <p style={{ ...sLabel, color: "var(--rose-dust)", marginBottom: "6px" }}>Shedding alert</p>
        <p style={{ fontSize: "13px", color: "var(--plum)", lineHeight: 1.65 }}>
          You have logged significant shedding for {consecutive} consecutive days. High shedding can be linked to stress, iron deficiency, or hormonal shifts. Track your stress levels and consider speaking to a GP if it continues.
        </p>
      </div>
    );
  }

  if (currentPhase === "follicular") {
    const last7 = sorted.slice(0, 7);
    const elevatedCount = last7.filter((c) => c.hair_shedding === "More than usual" || c.hair_shedding === "A lot").length;
    if (elevatedCount >= 4) {
      return (
        <div
          className="rounded-[20px] p-4"
          style={{ backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage)" }}
        >
          <p style={{ ...sLabel, color: "var(--sage)", marginBottom: "6px" }}>Unusual shedding detected</p>
          <p style={{ fontSize: "13px", color: "var(--plum)", lineHeight: 1.65 }}>
            You are in the follicular phase \u2014 normally your lowest-shedding window \u2014 but you have logged elevated shedding recently. This can indicate stress, nutritional deficiency, or a delayed response to the previous cycle\u2019s hormonal drop. Tracking consistently this week will reveal whether it continues into the next phase.
          </p>
        </div>
      );
    }
  }

  return null;
}