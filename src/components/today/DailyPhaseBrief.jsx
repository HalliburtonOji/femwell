import { differenceInDays, parseISO } from "date-fns";

const PHASE_CONTENT = {
  menstrual: {
    headline: "Rest and restore",
    body: "Your progesterone has dropped — fatigue and cramping are normal today.",
    food: "Iron-rich foods: leafy greens, lentils, red meat",
    move: "Gentle yoga or walking only",
    color: "var(--rose-dust)",
    bg: "var(--rose-dust-subtle)",
    border: "var(--rose-dust-light)",
  },
  follicular: {
    headline: "Energy is rising",
    body: "Oestrogen is climbing — you may feel sharper and more social.",
    food: "Varied whole foods — your gut microbiome diversity improves now",
    move: "Strength training and higher intensity work well",
    color: "var(--sage)",
    bg: "var(--sage-subtle)",
    border: "var(--sage-light)",
  },
  ovulatory: {
    headline: "Peak performance window",
    body: "LH surge is imminent or happening — cervical mucus may change.",
    food: "Zinc and antioxidants: pumpkin seeds, berries, broccoli",
    move: "High intensity, HIIT, or anything ambitious",
    color: "#B89E6A",
    bg: "#FFF8EE",
    border: "#E8D8A0",
  },
  luteal: {
    headline: "Wind down and nourish",
    body: "Progesterone rises — you may feel warmer, more tired, or crave carbs.",
    food: "Magnesium and B6: dark chocolate, bananas, oats, leafy greens",
    move: "Pilates, swimming, or moderate walks",
    color: "var(--mauve)",
    bg: "var(--mauve-subtle)",
    border: "var(--mauve-light)",
  },
};

function getPhaseAndDay(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const diff = differenceInDays(new Date(), parseISO(profile.last_period_start_date));
  if (diff < 0) return null;
  const dayOfCycle = (diff % cycleLen) + 1;
  let phase;
  if (dayOfCycle <= periodLen) phase = "menstrual";
  else if (dayOfCycle <= 13) phase = "follicular";
  else if (dayOfCycle <= 16) phase = "ovulatory";
  else phase = "luteal";
  return { phase, dayOfCycle };
}

const FALLBACK_CONTENT = {
  phase: "getting_started",
  headline: "Welcome to FemWell",
  body: "Log your last period date in Track to start seeing personalised cycle insights.",
  food: "Focus on iron-rich whole foods as a general foundation.",
  move: "Any movement is good movement — walks, stretching, whatever feels right today.",
  color: "var(--mauve)",
  bg: "var(--mauve-subtle)",
  border: "var(--mauve-light)",
};

export default function DailyPhaseBrief({ profile }) {
  const info = getPhaseAndDay(profile);
  const content = info ? PHASE_CONTENT[info.phase] : null;

  // No cycle data → render nothing (avoid blank space on Today page)
  if (!content) return null;

  return (
    <div style={{
      backgroundColor: content.bg,
      border: `1px solid ${content.border}`,
      borderRadius: 20,
      padding: "16px 18px",
      marginBottom: 16,
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: content.color, }}>
            Day {info.dayOfCycle} · {info.phase.charAt(0).toUpperCase() + info.phase.slice(1)} phase
          </p>
          
          <p className="fw-heading" style={{ fontSize: 21, marginTop: 2 }}>
            {content.headline}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { label: "Body", text: content.body },
          { label: "Food", text: content.food },
          { label: "Move", text: content.move },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: content.color, width: 42, flexShrink: 0, paddingTop: 2 }}>{row.label}</span>
            <p style={{ fontSize: 13.5, color: "var(--plum)", fontWeight: 600, lineHeight: 1.5 }}>{row.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}