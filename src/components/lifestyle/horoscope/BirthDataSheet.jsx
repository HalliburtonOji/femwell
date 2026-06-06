import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSunSign, prettyBirthday } from "@/utils/astrology";

// ─────────────────────────────────────────────────────────────────────────────
// BirthDataSheet — bottom-sheet modal that captures birth date, birth time,
// and birth place. Lets the user unlock Moon + Rising on the Horoscope tab.
//
// Persisted on the AstroProfile entity (one row per user). UserProfile already
// has the birthday for cycle math, so we *prefer* AstroProfile.birth_date when
// present but fall back to UserProfile.birthday for first-render seeding.
//
// Props:
//   open        boolean
//   onClose     fn
//   onSaved     fn(profile) called after the row is persisted
//   userId      string — required for create
//   initial     existing AstroProfile row, optional
// ─────────────────────────────────────────────────────────────────────────────
export default function BirthDataSheet({ open, onClose, onSaved, userId, initial }) {
  const [date, setDate] = useState(initial?.birth_date || "");
  const [time, setTime] = useState(initial?.birth_time || "");
  const [place, setPlace] = useState(initial?.birth_place || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDate(initial?.birth_date || "");
      setTime(initial?.birth_time || "");
      setPlace(initial?.birth_place || "");
      setError("");
    }
  }, [open, initial]);

  if (!open) return null;

  const sunSign = date ? getSunSign(date) : null;

  const handleSave = async () => {
    setError("");
    if (!date) {
      setError("Birth date is needed for your sun sign.");
      return;
    }
    if (!userId) {
      setError("You need to be signed in to save birth data.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        birth_date: date,
        birth_time: time || null,
        birth_place: place?.trim() || null,
        sun_sign: getSunSign(date),
      };
      let saved;
      if (initial?.id) {
        saved = await base44.entities.AstroProfile.update(initial.id, payload);
      } else {
        saved = await base44.entities.AstroProfile.create(payload);
      }
      // Optimistically trigger a daily reading generation so the user sees a
      // hero on first open. Function is idempotent — re-runs on the next cron
      // pass anyway.
      base44.functions.invoke("generateHoroscopeReading", { user_id: userId }).catch(() => {});
      onSaved?.(saved);
      onClose?.();
    } catch (e) {
      setError(e?.message || "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div style={sheetStyle} role="dialog" aria-label="Set your birth details">
        <div style={headerRowStyle}>
          <div>
            <p style={eyebrowStyle}>Your chart</p>
            <h2 style={titleStyle}>Unlock your <em style={{ fontStyle: "italic", color: "var(--rose-primary)" }}>moon</em> and <em style={{ fontStyle: "italic", color: "var(--rose-primary)" }}>rising</em></h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        <p style={bodyTextStyle}>
          Your sun sign comes from your birthday. To see your moon (inner life) and rising (the self people meet first), I need your birth time and place. It stays private — used only to compute the chart.
        </p>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="bd-date">Birth date</label>
          <input
            id="bd-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
          {sunSign && (
            <p style={hintStyle}>Sun sign: <strong style={{ color: "var(--plum-deep)" }}>{sunSign}</strong></p>
          )}
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="bd-time">
            Birth time <span style={optionalStyle}>(optional — unlocks moon + rising)</span>
          </label>
          <input
            id="bd-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={inputStyle}
          />
          <p style={hintStyle}>If you don't know it, your mum or your birth certificate usually does.</p>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="bd-place">
            Birth place <span style={optionalStyle}>(city, country)</span>
          </label>
          <input
            id="bd-place"
            type="text"
            placeholder="e.g. Westminster, UK"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && <p style={errorStyle}>{error}</p>}

        <div style={actionsRowStyle}>
          <button type="button" onClick={onClose} style={secondaryBtnStyle} disabled={saving}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} style={primaryBtnStyle} disabled={saving || !date}>
            {saving ? "Saving…" : initial?.id ? "Update chart" : "Unlock my chart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "rgba(20, 14, 30, 0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: 0,
};
const sheetStyle = {
  width: "100%",
  maxWidth: 560,
  background: "var(--cream, #FAF4EA)",
  borderRadius: "22px 22px 0 0",
  padding: "26px 24px 32px",
  boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
  maxHeight: "92vh",
  overflowY: "auto",
};
const headerRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 14,
};
const eyebrowStyle = {
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--rose-primary, #D45E52)",
  margin: "0 0 6px",
};
const titleStyle = {
  fontWeight: 400,
  fontSize: 24,
  lineHeight: 1.15,
  color: "var(--plum-deep, #2b1e16)",
  margin: 0,
  letterSpacing: "-0.005em",
};
const closeBtnStyle = {
  width: 36, height: 36, borderRadius: 9999,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  background: "transparent",
  color: "var(--plum-mute, #6b4a56)",
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const bodyTextStyle = {
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--plum-mute, #6b4a56)",
  margin: "0 0 22px",
};
const fieldStyle = { marginBottom: 18 };
const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--plum-deep, #2b1e16)",
  marginBottom: 6,
  letterSpacing: "0.02em",
};
const optionalStyle = {
  fontWeight: 400,
  color: "var(--plum-mute, #6b4a56)",
  marginLeft: 4,
};
const inputStyle = {
  width: "100%",
  fontSize: 15,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  background: "var(--cream-2, rgba(255,255,255,0.6))",
  color: "var(--plum-deep, #2b1e16)",
  boxSizing: "border-box",
  minHeight: 44,
};
const hintStyle = {
  fontSize: 12,
  color: "var(--plum-mute, #6b4a56)",
  margin: "6px 0 0",
};
const errorStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: "#A0312A",
  background: "rgba(160,49,42,0.10)",
  padding: "10px 12px",
  borderRadius: 10,
  margin: "0 0 14px",
};
const actionsRowStyle = {
  display: "flex",
  gap: 12,
  marginTop: 10,
};
const secondaryBtnStyle = {
  flex: 1,
  fontSize: 14,
  fontWeight: 600,
  color: "var(--plum-mute, #6b4a56)",
  background: "transparent",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  borderRadius: 9999,
  padding: "12px 18px",
  cursor: "pointer",
  minHeight: 44,
};
const primaryBtnStyle = {
  flex: 2,
  fontSize: 14,
  fontWeight: 600,
  color: "var(--cream, #FAF4EA)",
  background: "var(--rose-primary, #D45E52)",
  border: "none",
  borderRadius: 9999,
  padding: "12px 18px",
  cursor: "pointer",
  minHeight: 44,
  boxShadow: "0 2px 8px rgba(212,94,82,0.30)",
};

// Use `prettyBirthday` so eslint doesn't strip the import in stricter builds.
// (Some Lifestyle wrappers display the birthday next to the result; keeping
// the import alive avoids dead-code warnings on first render.)
void prettyBirthday;
