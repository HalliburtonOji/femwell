import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { prettyBirthday } from "@/utils/astrology";
import SectionWrap from "../SectionWrap";

// ─────────────────────────────────────────────────────────────────────────────
// Compatibility — Section 8.
// Restyle of the original Compatibility section per demo §8.
//
// Visual changes (no data-flow change):
//   - Two-circle overlapping monogram (user initial + partner initial)
//   - Big Fraunces score, italic label, body paragraph
//   - 4 dim tiles labelled Talk · Touch · Trust · Time
//
// D1 — UI label for the 4th dimension is "Time", not "Grow". The DB field
// is still `grow_score` (no migration). The mapping is explicit in the
// `Tiles` component below.
// ─────────────────────────────────────────────────────────────────────────────

function initial(name) {
  if (!name) return "?";
  const t = String(name).trim();
  return (t[0] || "?").toUpperCase();
}

function daysAgo(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days < 0) return null;
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function Dim({ label, val }) {
  const pct = Math.max(0, Math.min(100, Number(val) || 0));
  return (
    <div style={dimCellStyle}>
      <div style={dimBarStyle}>
        <div style={{ ...dimFillStyle, width: `${pct}%` }} />
      </div>
      <p style={dimLabelStyle}>{label}</p>
      <p style={dimValStyle}>{pct}</p>
    </div>
  );
}

export default function Compatibility({ userId, chart, userProfile }) {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.CompatibilityReading.filter(
          { user_id: userId },
          "-created_date",
          3,
        ).catch(() => []);
        if (cancelled) return;
        setHistory(Array.isArray(rows) ? rows : []);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const lastChip = useMemo(() => {
    const top = history[0];
    if (!top) return null;
    const created = top.created_date || top.created_at || null;
    const ago = daysAgo(created);
    const who = top.their_name || top.their_sun_sign || "Last reading";
    return ago ? `Last: ${who} · ${ago}` : `Last: ${who}`;
  }, [history]);

  const userInitial = useMemo(() => {
    const candidate =
      userProfile?.preferred_name ||
      userProfile?.first_name ||
      chart?.name ||
      null;
    return initial(candidate);
  }, [userProfile, chart]);

  const run = async () => {
    setError("");
    if (!userId) { setError("Sign in to run a reading."); return; }
    if (!birthday) { setError("Their birthday is needed."); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateCompatibility", {
        user_id: userId,
        their_name: name.trim(),
        their_birthday: birthday,
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
            Compatibility <em style={{ fontStyle: "italic", color: "var(--rose-primary, #D45E52)" }}>reading</em>
          </h3>
          <p style={compatSubStyle}>
            Try it with a friend, a partner, a crush — see where your charts meet.
          </p>
        </div>
        {lastChip && (
          <span style={lastChipStyle}>{lastChip}</span>
        )}
        {!lastChip && chart?.sun && (
          <span style={compatYouStyle}>
            You: {chart.sun}{chart.birthday ? ` · ${prettyBirthday(chart.birthday)}` : ""}
          </span>
        )}
      </div>

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
          <label style={compatLabelStyle} htmlFor="cp-date">Their birthday</label>
          <input
            id="cp-date"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            style={compatInputStyle}
          />
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading || !birthday}
          style={compatRunBtnStyle}
        >
          {loading ? "Reading…" : "Read us"}
        </button>
      </div>

      {history.length > 0 && (
        <div style={historyRowStyle}>
          {history.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => openHistory(r)}
              style={{
                ...historyChipStyle,
                ...(reading?.id === r.id ? historyChipActiveStyle : {}),
              }}
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
              <p style={compatScoreLabelStyle}>Your synastry</p>
              <p style={compatScoreDescStyle}>{reading.label}</p>
            </div>
          </div>
          {reading.narrative && (
            <p style={compatNarrativeStyle}>{reading.narrative}</p>
          )}
          <div style={dimsRowStyle}>
            <Dim label="Talk"  val={reading.talk_score} />
            <Dim label="Touch" val={reading.touch_score} />
            <Dim label="Trust" val={reading.trust_score} />
            {/* D1: UI label is Time; field name is grow_score */}
            <Dim label="Time"  val={reading.grow_score} />
          </div>
        </div>
      )}
    </SectionWrap>
  );
}

const sectionTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 22,
  // H2-fix1: cream-on-night now that we sit inside a Plum Night SectionWrap.
  color: "rgba(245,230,211,0.92)",
  margin: 0,
};
const compatHeadStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 12,
  flexWrap: "wrap",
};
const compatSubStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  // H2-fix1: cream-on-night now that we sit inside a Plum Night SectionWrap.
  color: "rgba(245,230,211,0.70)",
  margin: "6px 0 0",
  lineHeight: 1.5,
};
const compatYouStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  color: "var(--plum-mute, #6b4a56)",
  background: "var(--cream-2, rgba(43,30,22,0.05))",
  padding: "5px 12px",
  borderRadius: 9999,
  alignSelf: "flex-start",
};
const lastChipStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: "0.04em",
  color: "var(--plum-mute, #6b4a56)",
  background: "var(--cream-2, rgba(43,30,22,0.05))",
  padding: "5px 12px",
  borderRadius: 9999,
  alignSelf: "flex-start",
};
const compatFormStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: 10,
  alignItems: "end",
  marginBottom: 12,
};
const compatFieldStyle = { display: "flex", flexDirection: "column", minWidth: 0 };
const compatLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  // H2-fix1: cream-on-night inside Plum Night SectionWrap.
  color: "rgba(245,230,211,0.86)",
  marginBottom: 5,
};
const compatInputStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  background: "var(--cream-2, rgba(255,255,255,0.6))",
  color: "var(--plum-deep, #2b1e16)",
  minHeight: 44,
  width: "100%",
  boxSizing: "border-box",
};
const compatRunBtnStyle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 13,
  color: "var(--cream, #FAF4EA)",
  background: "var(--rose-primary, #D45E52)",
  border: "none",
  borderRadius: 9999,
  padding: "12px 18px",
  cursor: "pointer",
  minHeight: 44,
  whiteSpace: "nowrap",
  boxShadow: "0 2px 8px rgba(212,94,82,0.30)",
};
const historyRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  margin: "0 0 12px",
};
const historyChipStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.03em",
  color: "var(--plum-mute, #6b4a56)",
  background: "transparent",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.12))",
  borderRadius: 9999,
  padding: "5px 12px",
  cursor: "pointer",
  minHeight: 30,
};
const historyChipActiveStyle = {
  color: "var(--cream, #FAF4EA)",
  background: "var(--plum-deep, #2b1e16)",
  borderColor: "var(--plum-deep, #2b1e16)",
};
const compatErrorStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#A0312A",
  background: "rgba(160,49,42,0.10)",
  padding: "8px 12px",
  borderRadius: 10,
  margin: "0 0 12px",
};
const compatResultStyle = {
  background: "var(--cream, #FAF4EA)",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  borderRadius: 18,
  padding: "20px 22px 22px",
  boxShadow: "0 1px 2px rgba(43,30,22,0.04), 0 6px 18px rgba(43,30,22,0.06)",
};
const monogramRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 14,
};
const monogramCircleStyle = {
  width: 44,
  height: 44,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Fraunces', serif",
  fontWeight: 500,
  fontSize: 19,
  color: "var(--cream, #FAF4EA)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
};
const monogramUserStyle = {
  background: "linear-gradient(135deg, #D45E52, #C9A2A8)",
  marginRight: -12, // overlap
  zIndex: 2,
  border: "2px solid var(--cream, #FAF4EA)",
};
const monogramPartnerStyle = {
  background: "linear-gradient(135deg, #7D8668, #5F8A85)",
  border: "2px solid var(--cream, #FAF4EA)",
  zIndex: 1,
};
const monogramLabelStyle = {
  marginLeft: 8,
  minWidth: 0,
};
const monogramWhoStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 500,
  fontSize: 15,
  color: "var(--plum-deep, #2b1e16)",
  margin: 0,
};
const monogramWhatStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "var(--plum-mute, #6b4a56)",
  margin: "2px 0 0",
};
const compatScoreRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginBottom: 14,
};
const compatScoreBigStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 300,
  fontSize: 56,
  lineHeight: 1,
  color: "var(--rose-primary, #D45E52)",
  letterSpacing: "-0.02em",
  minWidth: 78,
};
const compatScoreLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)",
  margin: "0 0 4px",
};
const compatScoreDescStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 16,
  color: "var(--plum-deep, #2b1e16)",
  margin: 0,
};
const compatNarrativeStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13.5,
  lineHeight: 1.6,
  color: "var(--plum-mute, #6b4a56)",
  margin: "0 0 16px",
};
const dimsRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
};
const dimCellStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 };
const dimBarStyle = {
  width: "100%",
  height: 5,
  borderRadius: 999,
  background: "var(--cream-2, rgba(43,30,22,0.08))",
  overflow: "hidden",
};
const dimFillStyle = {
  height: "100%",
  background: "linear-gradient(90deg, var(--rose-primary, #D45E52), var(--gold, #B89E6A))",
  borderRadius: 999,
};
const dimLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)",
  margin: 0,
};
const dimValStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 16,
  fontWeight: 500,
  color: "var(--plum-deep, #2b1e16)",
  margin: 0,
};
