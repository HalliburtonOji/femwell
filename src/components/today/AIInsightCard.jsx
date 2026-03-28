// Prompt 03 — AI Insight Card
import { createPageUrl } from "@/utils";

const PHASE_INSIGHTS = {
  menstrual: "Your body is doing meaningful work right now — rest is the practice.",
  follicular: "Energy is building. This is your most creative and focused window.",
  ovulation: "Peak day. Your energy and confidence are at their highest.",
  luteal: "Wind down slowly. Be gentle with yourself today.",
};

export default function AIInsightCard({ phaseInfo }) {
  const text = phaseInfo
    ? PHASE_INSIGHTS[phaseInfo.phase]
    : "Log your first check-in to unlock personalised insights.";

  return (
    <div
      className="relative overflow-hidden mb-4"
      style={{
        background: "#13131F",
        borderLeft: "4px solid #7C6AF5",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Placeholder square — Prompt 13 replaces with Sparkle icon */}
        <div style={{ width: 16, height: 16, background: "#7C6AF5", borderRadius: 3, flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: "#8A8AAA", lineHeight: 1.5, flex: 1 }}>{text}</p>
      </div>
      <div className="flex justify-end mt-3">
        <a
          href={createPageUrl("Assistant")}
          style={{ fontSize: 12, color: "#C96B9E", fontWeight: 600 }}
        >
          Ask FemWell AI
        </a>
      </div>
    </div>
  );
}