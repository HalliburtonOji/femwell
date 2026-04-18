import { useState } from "react";
import { toast } from "sonner";

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 14,
  border: "1.5px solid var(--border)",
  backgroundColor: "var(--surface)",
  fontSize: 14, color: "var(--plum)",
  fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box",
};

const todayISO = () => new Date().toISOString().split("T")[0];

/**
 * Collects birthday + cycle basics with an "I'm not sure" fallback.
 * Calls onSave(data) when the user advances — parent performs the save.
 * Parent also handles navigation; this component just returns the collected data.
 */
export default function CycleBasicsStep({
  initial = {},
  onSave,
  onSkip,
  saving = false,
}) {
  const [birthday, setBirthday] = useState(initial.birthday || "");
  const [lastPeriod, setLastPeriod] = useState(initial.last_period_start_date || "");
  const [cycleLen, setCycleLen] = useState(initial.cycle_avg_length || 28);
  const [periodLen, setPeriodLen] = useState(initial.period_length || 5);
  const [notSure, setNotSure] = useState(false);

  const canContinue = !!lastPeriod || notSure;

  const handleContinue = () => {
    const payload = notSure
      ? {
          birthday: birthday || undefined,
          last_period_start_date: todayISO(),
          cycle_avg_length: 28,
          period_length: 5,
        }
      : {
          birthday: birthday || undefined,
          last_period_start_date: lastPeriod,
          cycle_avg_length: Number(cycleLen) || 28,
          period_length: Number(periodLen) || 5,
        };
    onSave?.(payload);
  };

  return (
    <div className="w-full space-y-5">
      <div>
        <p style={sLabel}>Cycle basics</p>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: "4px", lineHeight: 1.2 }}>
          Let's personalize your experience
        </h2>
        <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
          Takes 30 seconds. We'll use this for cycle predictions and daily guidance.
        </p>
      </div>

      {/* Birthday (optional) */}
      <div>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
          Your birthday <span style={{ color: "var(--mauve)", fontWeight: 400 }}>(optional)</span>
        </p>
        <input
          type="date"
          value={birthday}
          max={todayISO()}
          onChange={e => setBirthday(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {/* Not sure toggle */}
      <button
        type="button"
        onClick={() => setNotSure(v => !v)}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 14,
          border: notSure ? "2px solid var(--rose-dust)" : "1.5px solid var(--border)",
          backgroundColor: notSure ? "var(--rose-dust-subtle)" : "var(--surface)",
          cursor: "pointer", textAlign: "left",
          fontSize: 13, fontWeight: 600,
          color: notSure ? "var(--rose-dust)" : "var(--plum)",
          fontFamily: "'Inter', sans-serif",
          transition: "all 0.15s",
        }}
      >
        I'm not sure — use sensible defaults
      </button>

      {/* Cycle fields, hidden when "not sure" is active */}
      {!notSure && (
        <div style={{ ...card, padding: 16 }} className="space-y-4">
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
              First day of your last period
            </p>
            <input
              type="date"
              value={lastPeriod}
              max={todayISO()}
              onChange={e => setLastPeriod(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                Typical cycle length
              </p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                {cycleLen} days
              </p>
            </div>
            <input
              type="range" min="21" max="40" step="1"
              value={cycleLen}
              onChange={e => setCycleLen(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--rose-dust)" }}
            />
            <div className="flex justify-between" style={{ marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>21</span>
              <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>40</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                Typical period length
              </p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                {periodLen} days
              </p>
            </div>
            <input
              type="range" min="2" max="10" step="1"
              value={periodLen}
              onChange={e => setPeriodLen(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--rose-dust)" }}
            />
            <div className="flex justify-between" style={{ marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>2</span>
              <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>10</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!canContinue || saving}
        className="btn-primary w-full"
        style={{ opacity: (!canContinue || saving) ? 0.5 : 1 }}
      >
        {saving ? "Saving…" : "Continue"}
      </button>

      {onSkip && (
        <button
          type="button"
          onClick={() => {
            onSkip();
            toast("You can update this anytime in Settings");
          }}
          style={{
            display: "block", margin: "0 auto",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "var(--mauve)",
            fontFamily: "'Inter', sans-serif", textDecoration: "underline",
          }}
        >
          Skip for now
        </button>
      )}
    </div>
  );
}