// Prompt 03 — Metrics Row
export default function MetricsRow({ phaseInfo, checkin, streakCount }) {
  const tiles = [
    {
      label: "CYCLE DAY",
      value: phaseInfo ? phaseInfo.cycleDay : "—",
      sub: phaseInfo ? `of 28` : "Not set",
      accent: phaseInfo?.colour || "#C96B9E",
    },
    {
      label: "SLEEP",
      value: checkin?.sleep_hours ? `${checkin.sleep_hours}h` : "—",
      sub: "last night",
      accent: "#4ABFA3",
    },
    {
      label: "STREAK",
      value: streakCount || 0,
      sub: "days",
      accent: "#E8956D",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="relative overflow-hidden"
          style={{
            background: "#13131F",
            border: "1px solid #2E2E45",
            borderRadius: 12,
            padding: 16,
          }}
        >
          {/* Accent line at top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: t.accent,
              borderRadius: "12px 12px 0 0",
            }}
          />
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#4A4A65",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {t.label}
          </p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#F2F2FF", marginTop: 4 }}>{t.value}</p>
          <p style={{ fontSize: 11, color: "#4A4A65" }}>{t.sub}</p>
        </div>
      ))}
    </div>
  );
}