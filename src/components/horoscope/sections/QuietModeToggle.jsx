import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// QuietModeToggle — Section 10.
// Plum Night card. Two rows:
//   1. Quiet Mode — softens shadow-language in readings.
//   2. Soft Sky (A3) — hides retrogrades / storm-windows. Indented under
//      Quiet Mode. Disabled (greyed out) when Quiet Mode is OFF.
//
// Both rows persist to UserPreferences:
//   horoscope_quiet_mode (boolean)
//   horoscope_soft_sky   (boolean)
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      style={{
        ...togglePillStyle,
        background: on ? "rgba(232,196,208,0.82)" : "rgba(247,239,225,0.20)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span
        style={{
          ...toggleKnobStyle,
          left: on ? 22 : 2,
          background: on ? "var(--plum-deep, #2b1e16)" : "var(--cream, #FAF4EA)",
        }}
      />
    </button>
  );
}

export default function QuietModeToggle({ userId }) {
  const [quiet, setQuiet] = useState(false);
  const [soft, setSoft] = useState(false);
  const [prefRowId, setPrefRowId] = useState(null);
  const [loaded, setLoaded] = useState(!userId);

  // Load preferences once
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.UserPreferences.filter(
          { user_id: userId }, "-updated_at", 1,
        ).catch(() => []);
        if (cancelled) return;
        const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
        if (row) {
          setPrefRowId(row.id);
          setQuiet(!!row.horoscope_quiet_mode);
          setSoft(!!row.horoscope_soft_sky);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const persist = async (patch) => {
    if (!userId) return;
    try {
      if (prefRowId) {
        await base44.entities.UserPreferences.update(prefRowId, {
          ...patch,
          updated_at: new Date().toISOString(),
        });
      } else {
        const created = await base44.entities.UserPreferences.create({
          user_id: userId,
          ...patch,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (created?.id) setPrefRowId(created.id);
      }
    } catch { /* silent — toggle remains responsive */ }
  };

  const handleQuiet = (next) => {
    setQuiet(next);
    // When turning Quiet Mode off, also clear Soft Sky so the daily reading
    // doesn't quietly keep hiding retrogrades the user can no longer see why.
    if (!next && soft) {
      setSoft(false);
      persist({ horoscope_quiet_mode: false, horoscope_soft_sky: false });
    } else {
      persist({ horoscope_quiet_mode: next });
    }
  };

  const handleSoft = (next) => {
    if (!quiet) return; // disabled when Quiet Mode is OFF
    setSoft(next);
    persist({ horoscope_soft_sky: next });
  };

  if (!loaded) return null;

  return (
    <div style={shellStyle}>
      <div style={rowStyle}>
        <div style={textStyle}>
          <span style={nameStyle}>Quiet Mode</span>
          <span style={helpStyle}>
            Soften shadow-language. No &ldquo;war&rdquo;, &ldquo;wound&rdquo;, &ldquo;trauma&rdquo; in your readings.
          </span>
        </div>
        <Toggle on={quiet} onChange={handleQuiet} />
      </div>

      <div style={{ ...rowStyle, ...rowIndentStyle }}>
        <div style={textStyle}>
          <span style={{ ...nameStyle, opacity: quiet ? 1 : 0.55 }}>Soft Sky</span>
          <span style={{ ...helpStyle, opacity: quiet ? 1 : 0.55 }}>
            Hide retrogrades from the daily reading.
          </span>
        </div>
        <Toggle on={soft} onChange={handleSoft} disabled={!quiet} />
      </div>
    </div>
  );
}

const shellStyle = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 22,
  padding: "20px 22px",
  marginTop: 24,
  color: "var(--cream, #FAF4EA)",
  background: "radial-gradient(circle at 25% 30%, #3a2a4c 0%, #221a2e 60%, #15101e 100%)",
  boxShadow: "0 2px 4px rgba(43,30,22,0.10), 0 12px 32px rgba(43,30,22,0.18)",
};
const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: "10px 0",
};
const rowIndentStyle = {
  paddingLeft: 18,
  marginTop: 4,
  borderTop: "1px solid rgba(247,239,225,0.10)",
};
const textStyle = { display: "flex", flexDirection: "column", minWidth: 0, gap: 4 };
const nameStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 16,
  color: "var(--cream, #FAF4EA)",
};
const helpStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 12,
  lineHeight: 1.4,
  color: "rgba(247,239,225,0.72)",
};
const togglePillStyle = {
  position: "relative",
  width: 42,
  height: 24,
  borderRadius: 9999,
  border: "none",
  flexShrink: 0,
  transition: "background 120ms ease-out",
  padding: 0,
};
const toggleKnobStyle = {
  position: "absolute",
  top: 2,
  width: 20,
  height: 20,
  borderRadius: 999,
  transition: "left 120ms ease-out, background 120ms ease-out",
};
