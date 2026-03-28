// Prompt 03 — Hero Check-in Card
import { useState } from "react";

const MOODS = ["Awful", "Low", "Okay", "Good", "Great"];

export default function HeroCheckinCard({ checkin, phaseInfo, onOpenCheckin }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (mood) => {
    setSelected(mood);
    onOpenCheckin();
  };

  return (
    <div
      className="mb-4 p-5"
      style={{
        background: "linear-gradient(135deg, #1C1C2E, #13131F)",
        border: "1px solid rgba(201,107,158,0.3)",
        borderRadius: 20,
      }}
    >
      {checkin ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 14, fontWeight: 600, color: "#8A8AAA" }}>Today's check-in</p>
            <button
              onClick={onOpenCheckin}
              style={{ fontSize: 12, color: "#C96B9E", fontWeight: 600 }}
            >
              Edit
            </button>
          </div>
          <div className="flex gap-4">
            {[
              { label: "Mood", value: checkin.mood },
              { label: "Energy", value: checkin.energy },
              { label: "Sleep", value: checkin.sleep_hours ? `${checkin.sleep_hours}h` : "—" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#C96B9E" }} />
                <div>
                  <p style={{ fontSize: 11, color: "#4A4A65", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {m.label}
                  </p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: "#F2F2FF" }}>{m.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#F2F2FF", marginBottom: 16 }}>
            How are you feeling?
          </p>
          <div className="flex gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => handleSelect(mood)}
                className="flex-1"
                style={{
                  background: selected === mood ? "rgba(201,107,158,0.12)" : "#13131F",
                  border: selected === mood ? "2px solid #C96B9E" : "1px solid #242436",
                  borderRadius: 999,
                  height: 44,
                  fontSize: 12,
                  color: selected === mood ? "#F2F2FF" : "#4A4A65",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  transform: selected === mood ? "scale(1.04)" : "scale(1)",
                }}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}