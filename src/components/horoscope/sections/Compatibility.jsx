import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { prettyBirthday } from "@/utils/astrology";
import SectionWrap from "../SectionWrap";
import GlossaryTip from "@/components/horoscope/GlossaryTip";

// ─────────────────────────────────────────────────────────────────────────────
// Compatibility — Section 8.
//
// Improvements:
//   7. Shareable link — "Copy link" button generates ?compat=base64(name|date)
//      and writes it to the clipboard. On load, if ?compat= is present the
//      form is pre-filled and the reading is auto-run once.
//   9. Glossary tooltip — "synastry" is wrapped in <GlossaryTip>.
//  Date field uses the same day/month/year drum as BirthDataSheet.
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────
function initial(name) {
  if (!name) return "?";
  return (String(name).trim()[0] || "?").toUpperCase();
}

function daysAgo(iso) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (isNaN(days) || days < 0) return null;
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

// ── Share link helpers ────────────────────────────────────────────────────────
function encodeCompatParam(name, birthday) {
  return btoa(`${name || ""}|${birthday || ""}`);
}

function decodeCompatParam(raw) {
  try {
    const decoded = atob(raw);
    const [name, birthday] = decoded.split("|");
    return { name: name || "", birthday: birthday || "" };
  } catch {
    return null;
  }
}

function buildShareUrl(name, birthday) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", "horoscope");
  url.searchParams.set("compat", encodeCompatParam(name, birthday));
  return url.toString();
}

// ── Mini date picker (day / month / year) ────────────────────────────────────
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
  if (!day || !month || !year || String(year).length < 4) return "";
  return `${String(year).padStart(4,"0")}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

function CompatDatePicker({ value, onChange }) {
  const parts = parseDateParts(value);
  const [day, setDay] = useState(parts.day || "");
  const [month, setMonth] = useState(parts.month || "");
  const [year, setYear] = useState(parts.year || "");

  useEffect(() => {
    const p = parseDateParts(value);
    setDay(p.day || ""); setMonth(p.month || ""); setYear(p.year || "");
  }, [value]);

  const emit = (d, m, y) => onChange(buildIso(d, m, y));

  const handleDay = (e) => {
    let v = e.target.value.replace(/\D/g,"").slice(0,2);
    const max = daysInMonth(month, year);
    if (v && parseInt(v) > max) v = String(max);
    setDay(v); emit(v, month, year);
  };
  const handleMonth = (e) => {
    const v = e.target.value;
    const max = daysInMonth(v, year);
    const cd = day && parseInt(day) > max ? String(max) : day;
    if (cd !== day) setDay(cd);
    setMonth(v); emit(cd, v, year);
  };
  const handleYear = (e) => {
    const v = e.target.value.replace(/\D/g,"").slice(0,4);
    setYear(v); emit(day, month, v);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div style={dpWrapStyle}>
      <input type="number" inputMode="numeric" min={1} max={daysInMonth(month,year)}
        placeholder="DD" value={day} onChange={handleDay} style={{ ...dpInputStyle, flex: "0 0 56px" }} aria-label="Day" />
      <select value={month} onChange={handleMonth} style={{ ...dpInputStyle, flex: 1, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }} aria-label="Month">
        <option value="">Month</option>
        {MONTHS_SHORT.map((mn, i) => <option key={i} value={i+1}>{mn}</option>)}
      </select>
      <input type="number" inputMode="numeric" min={1920} max={currentYear}
        placeholder="YYYY" value={year} onChange={handleYear} style={{ ...dpInputStyle, flex: "0 0 72px" }} aria-label="Year" />
    </div>
  );
}

// ── Dim bar ───────────────────────────────────────────────────────────────────
function Dim({ label, val }) {
  const pct = Math.max(0, Math.min(100, Number(val) || 0));
  return (
    <div style={dimCellStyle}>
      <div style={dimBarStyle}><div style={{ ...dimFillStyle, width: `${pct}%` }} /></div>
      <p style={dimLabelStyle}>{label}</p>
      <p style={dimValStyle}>{pct}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Compatibility({ userId, chart, userProfile }) {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Load history
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.CompatibilityReading.filter(
          { user_id: userId }, "-created_date", 3,
        ).catch(() => []);
        if (!cancelled) setHistory(Array.isArray(rows) ? rows : []);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // Pre-fill from ?compat= URL param and auto-run once
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("compat");
    if (!raw) return;
    const decoded = decodeCompatParam(raw);
    if (!decoded) return;
    if (decoded.name) setName(decoded.name);
    if (decoded.birthday) setBirthday(decoded.birthday);
    // Auto-run after a tick so state settles
    if (decoded.birthday && userId) {
      setTimeout(() => {
        runReading(decoded.name, decoded.birthday);
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const lastChip = useMemo(() => {
    const top = history[0];
    if (!top) return null;
    const ago = daysAgo(top.created_date || top.created_at);
    const who = top.their_name || top.their_sun_sign || "Last reading";
    return ago ? `Last: ${who} · ${ago}` : `Last: ${who}`;
  }, [history]);

  const userInitial = useMemo(() => {
    const candidate = userProfile?.preferred_name || userProfile?.first_name || chart?.name || null;
    return initial(candidate);
  }, [userProfile, chart]);

  const runReading = async (overrideName, overrideBirthday) => {
    const theName = overrideName !== undefined ? overrideName : name;
    const theBirthday = overrideBirthday !== undefined ? overrideBirthday : birthday;
    setError("");
    if (!userId) { setError("Sign in to run a reading."); return; }
    if (!theBirthday) { setError("Their birthday is needed."); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateCompatibility", {
        user_id: userId,
        their_name: theName.trim(),
        their_birthday: theBirthday,
      });
      const row = res?.data?.reading || res?.reading || null;
      if (!row) {
        setError(res?.data?.error || res?.error || "Couldn't read this pairing.");
      } else {
        setReading(row);
        setHistory((prev) => {
          const filtered = prev.filter((r) => r.id !== row.id);
          return [row, ...filtered].slice(0, 3);
        });
      }
    } catch (e) {
      setError(e?.message || "Couldn't read this pairing.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!name && !birthday) return;
    const url = buildShareUrl(name, birthday);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback: select a temp input
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const openHistory = (row) => {
    setName(row.their_name || "");
    setBirthday(row.their_birthday || "");
    setReading(row);
    setError("");
  };

  return (
    <SectionWrap>
      <div style={compatHeadStyle}>
        <div>
          <h3 style={sectionTitleStyle}>
            Compatibility <GlossaryTip term="synastry"><em style={{ fontStyle: "italic", color: "#E89289" }}>reading</em></GlossaryTip>
          </h3>
          <p style={compatSubStyle}>
            Try it with a friend, a partner, a crush — see where your charts meet.
          </p>
        </div>
        {lastChip && <span style={lastChipStyle}>{lastChip}</span>}
        {!lastChip && chart?.sun && (
          <span style={compatYouStyle}>
            You: {chart.sun}{chart.birthday ? ` · ${prettyBirthday(chart.birthday)}` : ""}
          </span>
        )}
      </div>

      {/* Form */}
      <div style={compatFormStyle}>
        <div style={compatFieldStyle}>
          <label style={compatLabelStyle} htmlFor="cp-name">Their name</label>
          <input
            id="cp-name"
            type="text"
            placeholder="e.g. Sam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={compatInputStyle}
          />
        </div>
        <div style={compatFieldStyle}>
          <label style={compatLabelStyle}>Their birthday</label>
          <CompatDatePicker value={birthday} onChange={setBirthday} />
        </div>
      </div>

      {/* Actions row */}
      <div style={actionsRowStyle}>
        <button
          type="button"
          onClick={() => runReading()}
          disabled={loading || !birthday}
          style={{ ...compatRunBtnStyle, opacity: loading || !birthday ? 0.55 : 1 }}
        >
          {loading ? "Reading…" : "Read us"}
        </button>
        {(name || birthday) && (
          <button
            type="button"
            onClick={handleCopyLink}
            style={copyLinkBtnStyle}
            title="Copy a shareable link to this reading"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>

      {/* History chips */}
      {history.length > 0 && (
        <div style={historyRowStyle}>
          {history.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => openHistory(r)}
              style={{ ...historyChipStyle, ...(reading?.id === r.id ? historyChipActiveStyle : {}) }}
            >
              {(r.their_name || r.their_sun_sign || "Reading")} · {r.score}
            </button>
          ))}
        </div>
      )}

      {error && <p style={compatErrorStyle}>{error}</p>}

      {reading && (
        <div style={compatResultStyle}>
          <div style={monogramRowStyle}>
            <div style={{ ...monogramCircleStyle, ...monogramUserStyle }}>{userInitial}</div>
            <div style={{ ...monogramCircleStyle, ...monogramPartnerStyle }}>{initial(reading.their_name || reading.their_sun_sign)}</div>
            <div style={monogramLabelStyle}>
              <p style={monogramWhoStyle}>
                {(userProfile?.preferred_name || userProfile?.first_name || "You")} &amp; {reading.their_name || "them"}
              </p>
              <p style={monogramWhatStyle}>
                {chart?.sun || "—"} · {reading.their_sun_sign || "—"}
              </p>
            </div>
          </div>
          <div style={compatScoreRowStyle}>
            <div style={compatScoreBigStyle}>{reading.score}</div>
            <div>
              <p style={compatScoreLabelStyle}>Your <GlossaryTip term="synastry">synastry</GlossaryTip></p>
              <p style={compatScoreDescStyle}>{reading.label}</p>
            </div>
          </div>
          {reading.narrative && <p style={compatNarrativeStyle}>{reading.narrative}</p>}
          <div style={dimsRowStyle}>
            <Dim label="Talk"  val={reading.talk_score} />
            <Dim label="Touch" val={reading.touch_score} />
            <Dim label="Trust" val={reading.trust_score} />
            <Dim label="Time"  val={reading.grow_score} />
          </div>
        </div>
      )}
    </SectionWrap>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const sectionTitleStyle = {
  fontWeight: 400, fontSize: 22,
  color: "rgba(245,230,211,0.92)", margin: 0,
};
const compatHeadStyle = {
  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
  gap: 12, marginBottom: 12, flexWrap: "wrap",
};
const compatSubStyle = {
  fontSize: 13,
  color: "rgba(245,230,211,0.70)", margin: "6px 0 0", lineHeight: 1.5,
};
const compatYouStyle = {
  fontSize: 11, fontWeight: 600,
  letterSpacing: "0.04em", color: "rgba(245,230,211,0.82)",
  background: "rgba(245,230,211,0.06)", padding: "5px 12px",
  borderRadius: 9999, alignSelf: "flex-start",
};
const lastChipStyle = {
  fontSize: 10.5, fontWeight: 600,
  letterSpacing: "0.04em", color: "rgba(245,230,211,0.82)",
  background: "rgba(245,230,211,0.06)", padding: "5px 12px",
  borderRadius: 9999, alignSelf: "flex-start",
};
const compatFormStyle = { display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 };
const compatFieldStyle = { display: "flex", flexDirection: "column", minWidth: 0 };
const compatLabelStyle = {
  fontSize: 11, fontWeight: 600,
  letterSpacing: "0.04em", color: "rgba(245,230,211,0.86)", marginBottom: 5,
};
const compatInputStyle = {
  fontSize: 14,
  padding: "10px 12px", borderRadius: 12,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  background: "var(--cream-2, rgba(255,255,255,0.6))",
  color: "var(--plum-deep, #2b1e16)", minHeight: 44,
  width: "100%", boxSizing: "border-box",
};
const actionsRowStyle = {
  display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap",
};
const compatRunBtnStyle = {
  fontWeight: 600, fontSize: 13,
  color: "var(--cream, #FAF4EA)", background: "var(--rose-primary, #D45E52)",
  border: "none", borderRadius: 9999, padding: "12px 18px",
  cursor: "pointer", minHeight: 44, whiteSpace: "nowrap",
  boxShadow: "0 2px 8px rgba(212,94,82,0.30)",
};
const copyLinkBtnStyle = {
  fontWeight: 600, fontSize: 12,
  color: "rgba(245,230,211,0.82)", background: "transparent",
  border: "1px solid rgba(245,230,211,0.22)", borderRadius: 9999,
  padding: "10px 16px", cursor: "pointer", minHeight: 40,
  whiteSpace: "nowrap", transition: "all 0.15s",
};
const historyRowStyle = { display: "flex", flexWrap: "wrap", gap: 6, margin: "0 0 12px" };
const historyChipStyle = {
  fontSize: 11, fontWeight: 600,
  letterSpacing: "0.03em", color: "rgba(245,230,211,0.78)",
  background: "transparent", border: "1px solid rgba(245,230,211,0.20)",
  borderRadius: 9999, padding: "5px 12px", cursor: "pointer", minHeight: 30,
};
const historyChipActiveStyle = { color: "#2B1E26", background: "#F5E6D3", borderColor: "#F5E6D3" };
const compatErrorStyle = {
  fontSize: 12, color: "#A0312A",
  background: "rgba(160,49,42,0.10)", padding: "8px 12px", borderRadius: 10, margin: "0 0 12px",
};
const compatResultStyle = {
  background: "var(--cream, #FAF4EA)",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  borderRadius: 18, padding: "20px 22px 22px",
  boxShadow: "0 1px 2px rgba(43,30,22,0.04), 0 6px 18px rgba(43,30,22,0.06)",
};
const monogramRowStyle = { display: "flex", alignItems: "center", gap: 14, marginBottom: 14 };
const monogramCircleStyle = {
  width: 44, height: 44, borderRadius: 999,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: 500, fontSize: 19,
  color: "var(--cream, #FAF4EA)", boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
};
const monogramUserStyle = {
  background: "linear-gradient(135deg, #D45E52, #C9A2A8)", marginRight: -12,
  zIndex: 2, border: "2px solid var(--cream, #FAF4EA)",
};
const monogramPartnerStyle = {
  background: "linear-gradient(135deg, #7D8668, #5F8A85)",
  border: "2px solid var(--cream, #FAF4EA)", zIndex: 1,
};
const monogramLabelStyle = { marginLeft: 8, minWidth: 0 };
const monogramWhoStyle = {
  fontWeight: 500, fontSize: 15,
  color: "var(--plum-deep, #2b1e16)", margin: 0,
};
const monogramWhatStyle = {
  fontSize: 11.5,
  color: "var(--plum-mute, #6b4a56)", margin: "2px 0 0",
};
const compatScoreRowStyle = { display: "flex", alignItems: "center", gap: 18, marginBottom: 14 };
const compatScoreBigStyle = {
  fontWeight: 300, fontSize: 56,
  lineHeight: 1, color: "var(--rose-primary, #D45E52)",
  letterSpacing: "-0.02em", minWidth: 78,
};
const compatScoreLabelStyle = {
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)", margin: "0 0 4px",
};
const compatScoreDescStyle = {
  fontStyle: "italic",
  fontSize: 16, color: "var(--plum-deep, #2b1e16)", margin: 0,
};
const compatNarrativeStyle = {
  fontSize: 13.5,
  lineHeight: 1.6, color: "var(--plum-mute, #6b4a56)", margin: "0 0 16px",
};
const dimsRowStyle = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 };
const dimCellStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 };
const dimBarStyle = {
  width: "100%", height: 5, borderRadius: 999,
  background: "var(--cream-2, rgba(43,30,22,0.08))", overflow: "hidden",
};
const dimFillStyle = {
  height: "100%",
  background: "var(--rose-dust)",
  borderRadius: 999,
};
const dimLabelStyle = {
  fontSize: 10, fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)", margin: 0,
};
const dimValStyle = {
  fontSize: 16,
  fontWeight: 500, color: "var(--plum-deep, #2b1e16)", margin: 0,
};

// ── Date picker styles ────────────────────────────────────────────────────────
const dpWrapStyle = { display: "flex", gap: 6 };
const dpInputStyle = {
  fontSize: 13,
  padding: "10px 8px", borderRadius: 10,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  background: "var(--cream-2, rgba(255,255,255,0.6))",
  color: "var(--plum-deep, #2b1e16)", minHeight: 44,
  boxSizing: "border-box", MozAppearance: "textfield", width: "100%",
};