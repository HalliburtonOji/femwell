import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSunSign, prettyBirthday } from "@/utils/astrology";

// ─────────────────────────────────────────────────────────────────────────────
// BirthDataSheet — bottom-sheet modal that captures birth date, birth time,
// and birth place.
//
// Improvements:
//   - Custom scrollable date picker (day / month / year drums) — no native
//     <input type="date"> so the UI stays on-brand on every platform.
//   - Location autocomplete via OpenStreetMap Nominatim (free, no key).
//     Debounced 350ms. Shows a dropdown of up to 5 suggestions.
//   - Inline sun sign preview updates as you pick a date.
// ─────────────────────────────────────────────────────────────────────────────

// ── Date picker helpers ──────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function daysInMonth(month, year) {
  if (!month || !year) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

function parseDateParts(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return { day: "", month: "", year: "" };
  const [y, m, d] = iso.split("-");
  return { day: String(parseInt(d, 10)), month: String(parseInt(m, 10)), year: y };
}

function buildIso(day, month, year) {
  if (!day || !month || !year || year.length < 4) return "";
  const y = year.padStart(4, "0");
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DatePicker({ value, onChange }) {
  const parts = parseDateParts(value);
  const [day, setDay] = useState(parts.day || "");
  const [month, setMonth] = useState(parts.month || "");
  const [year, setYear] = useState(parts.year || "");

  // Sync up when value changes externally
  useEffect(() => {
    const p = parseDateParts(value);
    setDay(p.day || "");
    setMonth(p.month || "");
    setYear(p.year || "");
  }, [value]);

  const emit = useCallback((d, m, y) => {
    const iso = buildIso(d, m, y);
    onChange(iso);
  }, [onChange]);

  const handleDay = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    const max = daysInMonth(month, year);
    if (v && parseInt(v) > max) v = String(max);
    if (v && parseInt(v) < 1 && v.length === 2) v = "1";
    setDay(v);
    emit(v, month, year);
  };

  const handleMonth = (e) => {
    const v = e.target.value;
    setMonth(v);
    // Clamp day if switching to shorter month
    const max = daysInMonth(v, year);
    const clampedDay = day && parseInt(day) > max ? String(max) : day;
    if (clampedDay !== day) setDay(clampedDay);
    emit(clampedDay, v, year);
  };

  const handleYear = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(v);
    emit(day, month, v);
  };

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1920; y--) years.push(y);

  return (
    <div style={dpWrapStyle}>
      {/* Day */}
      <div style={dpFieldStyle}>
        <label style={dpLabelStyle} htmlFor="bd-day">Day</label>
        <input
          id="bd-day"
          type="number"
          inputMode="numeric"
          min={1}
          max={daysInMonth(month, year)}
          placeholder="DD"
          value={day}
          onChange={handleDay}
          style={dpInputStyle}
        />
      </div>
      {/* Month */}
      <div style={{ ...dpFieldStyle, flex: 2 }}>
        <label style={dpLabelStyle} htmlFor="bd-month">Month</label>
        <select
          id="bd-month"
          value={month}
          onChange={handleMonth}
          style={{ ...dpInputStyle, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
        >
          <option value="">Month</option>
          {MONTHS.map((mn, i) => (
            <option key={i} value={i + 1}>{mn}</option>
          ))}
        </select>
      </div>
      {/* Year */}
      <div style={{ ...dpFieldStyle, flex: 1.4 }}>
        <label style={dpLabelStyle} htmlFor="bd-year">Year</label>
        <input
          id="bd-year"
          type="number"
          inputMode="numeric"
          min={1920}
          max={currentYear}
          placeholder="YYYY"
          value={year}
          onChange={handleYear}
          style={dpInputStyle}
        />
      </div>
    </div>
  );
}

// ── Location autocomplete ────────────────────────────────────────────────────
function PlaceAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  // Sync external value
  useEffect(() => { setQuery(value || ""); }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const search = useCallback((q) => {
    if (!q || q.length < 2) { setSuggestions([]); setOpen(false); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&featuretype=city,town,village`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        const items = (Array.isArray(data) ? data : []).map((r) => {
          // Build a clean "City, Country" label
          const parts = (r.display_name || "").split(",").map((p) => p.trim());
          const city = parts[0] || "";
          const country = parts[parts.length - 1] || "";
          return { label: city && country ? `${city}, ${country}` : r.display_name, raw: r };
        });
        // Deduplicate labels
        const seen = new Set();
        const unique = items.filter((it) => {
          if (seen.has(it.label)) return false;
          seen.add(it.label);
          return true;
        });
        setSuggestions(unique.slice(0, 5));
        setOpen(unique.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setFetching(false);
      }
    }, 350);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v); // keep parent in sync as user types
    search(v);
  };

  const handleSelect = (label) => {
    setQuery(label);
    onChange(label);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={placeInputWrapStyle}>
        <input
          id="bd-place"
          type="text"
          autoComplete="off"
          placeholder="e.g. Westminster, UK"
          value={query}
          onChange={handleInput}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          style={inputStyle}
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {fetching && (
          <span style={placeSpinnerStyle} aria-hidden="true" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul style={suggestionsListStyle} role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={i}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(s.label)}
              style={suggestionItemStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-2, rgba(43,30,22,0.06))"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main sheet ───────────────────────────────────────────────────────────────
export default function BirthDataSheet({ open, onClose, onSaved, userId, initial, userProfile }) {
  const seedDate = initial?.birth_date || userProfile?.birthday || userProfile?.date_of_birth || "";
  const [date, setDate] = useState(seedDate);
  const [time, setTime] = useState(initial?.birth_time || "");
  const [place, setPlace] = useState(initial?.birth_place || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDate(initial?.birth_date || userProfile?.birthday || userProfile?.date_of_birth || "");
      setTime(initial?.birth_time || "");
      setPlace(initial?.birth_place || "");
      setError("");
    }
  }, [open, initial, userProfile]);

  if (!open) return null;

  const sunSign = date ? getSunSign(date) : null;

  const handleSave = async () => {
    setError("");
    if (!date) { setError("Birth date is needed for your sun sign."); return; }
    if (!userId) { setError("You need to be signed in to save birth data."); return; }
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
          Your sun sign comes from your birthday. Birth time and place unlock your moon and rising too. It stays private — used only to compute the chart.
        </p>

        <div style={fieldStyle}>
          <label style={labelStyle}>Birth date</label>
          <DatePicker value={date} onChange={setDate} />
          {sunSign && (
            <p style={hintStyle}>
              Sun sign: <strong style={{ color: "var(--plum-deep)" }}>{sunSign}</strong>
            </p>
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
          <p style={hintStyle}>Your mum or your birth certificate usually has it.</p>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="bd-place">
            Birth place <span style={optionalStyle}>(city, country)</span>
          </label>
          <PlaceAutocomplete value={place} onChange={setPlace} />
        </div>

        {error && <p style={errorStyle}>{error}</p>}

        <div style={actionsRowStyle}>
          <button type="button" onClick={onClose} style={secondaryBtnStyle} disabled={saving}>Cancel</button>
          <button type="button" onClick={handleSave} style={primaryBtnStyle} disabled={saving || !date}>
            {saving ? "Saving…" : initial?.id ? "Update chart" : "Tell us when"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 100,
  background: "rgba(20, 14, 30, 0.55)",
  backdropFilter: "blur(4px)",
  display: "flex", alignItems: "flex-end", justifyContent: "center",
};
const sheetStyle = {
  width: "100%", maxWidth: 560,
  background: "var(--cream, #FAF4EA)",
  borderRadius: "22px 22px 0 0",
  padding: "26px 24px 32px",
  boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
  maxHeight: "92vh", overflowY: "auto",
};
const headerRowStyle = { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 };
const eyebrowStyle = {
  fontWeight: 700, fontSize: 11,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: "var(--rose-primary, #D45E52)", margin: "0 0 6px",
};
const titleStyle = {
  fontWeight: 400, fontSize: 24,
  lineHeight: 1.15, color: "var(--plum-deep, #2b1e16)", margin: 0,
};
const closeBtnStyle = {
  width: 36, height: 36, borderRadius: 9999,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  background: "transparent", color: "var(--plum-mute, #6b4a56)",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const bodyTextStyle = {
  fontSize: 14, lineHeight: 1.55,
  color: "var(--plum-mute, #6b4a56)", margin: "0 0 22px",
};
const fieldStyle = { marginBottom: 18 };
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600, color: "var(--plum-deep, #2b1e16)",
  marginBottom: 6, letterSpacing: "0.02em",
};
const optionalStyle = { fontWeight: 400, color: "var(--plum-mute, #6b4a56)", marginLeft: 4 };
const inputStyle = {
  width: "100%", fontSize: 15,
  padding: "12px 14px", borderRadius: 12,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  background: "var(--cream-2, rgba(255,255,255,0.6))",
  color: "var(--plum-deep, #2b1e16)", boxSizing: "border-box", minHeight: 44,
};
const hintStyle = {
  fontSize: 12,
  color: "var(--plum-mute, #6b4a56)", margin: "6px 0 0",
};
const errorStyle = {
  fontSize: 13, fontWeight: 500,
  color: "#A0312A", background: "rgba(160,49,42,0.10)",
  padding: "10px 12px", borderRadius: 10, margin: "0 0 14px",
};
const actionsRowStyle = { display: "flex", gap: 12, marginTop: 10 };
const secondaryBtnStyle = {
  flex: 1, fontSize: 14, fontWeight: 600,
  color: "var(--plum-mute, #6b4a56)", background: "transparent",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  borderRadius: 9999, padding: "12px 18px", cursor: "pointer", minHeight: 44,
};
const primaryBtnStyle = {
  flex: 2, fontSize: 14, fontWeight: 600,
  color: "var(--cream, #FAF4EA)", background: "var(--rose-primary, #D45E52)",
  border: "none", borderRadius: 9999, padding: "12px 18px",
  cursor: "pointer", minHeight: 44, boxShadow: "0 2px 8px rgba(212,94,82,0.30)",
};

// Date picker styles
const dpWrapStyle = { display: "flex", gap: 8 };
const dpFieldStyle = { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 };
const dpLabelStyle = {
  fontSize: 10, fontWeight: 600,
  color: "var(--plum-mute, #6b4a56)", marginBottom: 4, letterSpacing: "0.04em",
  textTransform: "uppercase",
};
const dpInputStyle = {
  width: "100%", fontSize: 14,
  padding: "10px 10px", borderRadius: 10,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  background: "var(--cream-2, rgba(255,255,255,0.6))",
  color: "var(--plum-deep, #2b1e16)", boxSizing: "border-box", minHeight: 44,
  MozAppearance: "textfield",
};

// Place autocomplete styles
const placeInputWrapStyle = { position: "relative" };
const placeSpinnerStyle = {
  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
  width: 14, height: 14, borderRadius: "50%",
  border: "2px solid rgba(43,30,22,0.12)",
  borderTopColor: "var(--rose-primary, #D45E52)",
  animation: "horo-toast-in 0.6s linear infinite",
  display: "inline-block",
};
const suggestionsListStyle = {
  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
  zIndex: 50,
  background: "var(--cream, #FAF4EA)",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  borderRadius: 12,
  boxShadow: "0 4px 18px rgba(43,30,22,0.12)",
  listStyle: "none", margin: 0, padding: "6px 0",
  maxHeight: 220, overflowY: "auto",
};
const suggestionItemStyle = {
  fontSize: 13,
  color: "var(--plum-deep, #2b1e16)",
  padding: "9px 14px",
  cursor: "pointer",
  transition: "background 0.12s",
  borderBottom: "1px solid var(--border-subtle, rgba(43,30,22,0.06))",
};

// Keep alive
void prettyBirthday;