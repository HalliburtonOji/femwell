// Prompts 03 & 10 — Phase-aware header
export function getCurrentPhase(lastPeriodStartDate, cycleAvgLength = 28) {
  if (!lastPeriodStartDate) return null;
  const start = new Date(lastPeriodStartDate);
  const today = new Date();
  const cycleDay = ((Math.floor((today - start) / 86400000)) % cycleAvgLength) + 1;
  const ov = Math.round(cycleAvgLength / 2);
  if (cycleDay <= 5) return { phase: "menstrual", cycleDay, label: "Menstrual", colour: "#E05C7A" };
  if (cycleDay < ov - 1) return { phase: "follicular", cycleDay, label: "Follicular", colour: "#7ECBA1" };
  if (cycleDay <= ov + 1) return { phase: "ovulation", cycleDay, label: "Ovulation", colour: "#F5C842" };
  return { phase: "luteal", cycleDay, label: "Luteal", colour: "#9B8AE0" };
}

export default function TodayHeader({ user, phaseInfo }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "";

  return (
    <div className="pt-12 pb-4">
      <p style={{ fontSize: 17, color: "#8A8AAA" }}>
        {greeting}{firstName ? `, ${firstName}` : ""}
      </p>
      {phaseInfo && (
        <div
          className="inline-flex items-center mt-2"
          style={{
            background: `${phaseInfo.colour}26`,
            border: `1px solid ${phaseInfo.colour}`,
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: phaseInfo.colour,
            textTransform: "uppercase",
          }}
        >
          {phaseInfo.label} Phase · Day {phaseInfo.cycleDay}
        </div>
      )}
    </div>
  );
}