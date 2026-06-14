import { format, parseISO } from "date-fns";
import { Droplet } from "lucide-react";

function computeNextPeriod(profile) {
  if (!profile?.last_period_start_date) return null;
  const last = new Date(profile.last_period_start_date);
  const cycle = profile.cycle_avg_length || 28;
  const today = new Date();
  let next = new Date(last);
  while (next <= today) next = new Date(next.getTime() + cycle * 86400000);
  const daysUntil = Math.round((next - today) / 86400000);
  return { date: next.toISOString().split("T")[0], daysUntil };
}

export default function PeriodCountdownCard({ profile }) {
  const pred = computeNextPeriod(profile);
  if (!pred) return null;

  const urgency = pred.daysUntil <= 3 ? "var(--rose-dust)" : pred.daysUntil <= 7 ? "#B89E6A" : "var(--mauve)";
  const bg = pred.daysUntil <= 3 ? "var(--rose-dust-subtle)" : pred.daysUntil <= 7 ? "#F5F0E6" : "var(--ivory-dark)";
  const border = pred.daysUntil <= 3 ? "var(--rose-dust-light)" : pred.daysUntil <= 7 ? "#E8D9B8" : "var(--border)";

  return (
    <div style={{
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: "18px 20px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}>
      <div>
        <p style={{
          fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.14em", color: urgency,
          marginBottom: 4,
        }}>
          Coming up
        </p>
        <p style={{
          fontSize: 20, fontWeight: 700,
          color: "var(--plum)", lineHeight: 1.1,
          display: "inline-flex", alignItems: "center", gap: 7,
        }}>
          <Droplet className="w-4 h-4" style={{ color: "var(--rose-dust)" }} fill="var(--rose-dust)" />
          Period in {pred.daysUntil} day{pred.daysUntil !== 1 ? "s" : ""}
        </p>
        <p style={{
          fontSize: 12, color: "var(--mauve)",
          marginTop: 4,
        }}>
          Predicted {format(parseISO(pred.date), "EEEE, MMM d")} · Based on your average cycle
        </p>
      </div>
      <div style={{
        flexShrink: 0,
        width: 52, height: 52,
        borderRadius: 16,
        backgroundColor: urgency + "20",
        border: `1px solid ${urgency}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, fontWeight: 700, color: urgency,
      }}>
        {pred.daysUntil}
      </div>
    </div>
  );
}