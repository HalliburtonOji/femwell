import { useState, useEffect } from "react";
import { getLatestPrediction, computeFertilityStatus, computeAdaptivePrediction } from "@/lib/adaptivePrediction";
import { differenceInDays, parseISO, format } from "date-fns";
import { base44 } from "@/api/base44Client";

const FERTILITY_COLORS = {
  low:  { bg: "var(--sage-subtle)",      text: "var(--sage)",      label: "Low fertility" },
  medium: { bg: "var(--mauve-subtle)",   text: "var(--mauve)",     label: "Rising fertility" },
  high: { bg: "var(--rose-dust-subtle)", text: "var(--rose-dust)", label: "High fertility" },
  peak: { bg: "#FFF0F0",                 text: "var(--rose-dust)", label: "Peak fertility" },
};

export default function TodayFertilityBanner({ user, profile }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      let pred = await getLatestPrediction(user.id);
      // If no prediction or stale (>7 days), recompute
      if (!pred || (pred.created_at && differenceInDays(new Date(), parseISO(pred.created_at)) > 7)) {
        pred = await computeAdaptivePrediction(user.id, profile?.cycle_avg_length || 28).catch(() => null);
      }
      setPrediction(pred);
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading || !prediction) return null;

  const { status, daysToFertile, daysToOvulation } = computeFertilityStatus(prediction);
  const colors = FERTILITY_COLORS[status];

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const inFertileWindow = todayStr >= prediction.fertile_window_start && todayStr <= prediction.fertile_window_end;

  let fertileMsg = "";
  if (inFertileWindow) {
    if (status === "peak") fertileMsg = "Peak fertility — ovulation day";
    else if (daysToOvulation === 1) fertileMsg = "Fertile window — peak tomorrow";
    else fertileMsg = `Fertile window — ${daysToOvulation} days to ovulation`;
  } else if (daysToFertile !== null && daysToFertile > 0) {
    fertileMsg = `Fertile window opens in ${daysToFertile} day${daysToFertile !== 1 ? "s" : ""}`;
  } else {
    const nextPeriodDays = differenceInDays(parseISO(prediction.period_start_predicted), new Date());
    fertileMsg = nextPeriodDays > 0 ? `Next period in ${nextPeriodDays} days` : "Period predicted";
  }

  const cycleDay = profile?.last_period_start_date
    ? (differenceInDays(new Date(), parseISO(profile.last_period_start_date)) % (profile.cycle_avg_length || 28)) + 1
    : null;

  const confidenceLabel = prediction.confidence === "high" ? "High confidence" : prediction.confidence === "medium" ? "Estimated" : "Low data";

  return (
    <div style={{
      backgroundColor: colors.bg,
      border: `1px solid ${colors.text}40`,
      borderRadius: 20, padding: "16px 20px",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text, fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>
            Trying to conceive {cycleDay ? `· Day ${cycleDay}` : ""}
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
            {colors.label}
          </p>
          <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
            {fertileMsg}
          </p>
        </div>
        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, color: colors.text, backgroundColor: `${colors.text}15`, borderRadius: 9999, padding: "3px 8px", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
          {confidenceLabel}
        </span>
      </div>
    </div>
  );
}