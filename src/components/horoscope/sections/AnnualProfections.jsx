import useProfections from "../hooks/useProfections";
import { houseOrdinal } from "@/lib/astrology/profections";
import SectionWrap from "../SectionWrap";
import { INK_NIGHT } from "../styles/tokens.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// AnnualProfections — Section 6.5.
//
// Gold-tinted card showing the user's currently activated house + the
// traditional time-lord of that house. Math-correct per H2_DECISIONS.md D4:
// house = (age % 12) + 1.
//
// A1 — Saturn Return Letter (free birthday unlock, ages 27-30). When age
// is in [27, 28, 29, 30], a pane is rendered ABOVE the standard profections
// card. 80-120 word italic body signed by Astra. Frames the Saturn return
// as a structural realignment, not a doom-myth.
// ─────────────────────────────────────────────────────────────────────────────

function ukDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ukShortDateNoYear(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ukTodayShort() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ── Saturn Return Letter (A1) ───────────────────────────────────────────────
function SaturnReturnLetter({ age, started, exact, ends }) {
  const returnYear = Math.max(1, Math.min(3, age - 26));
  const startedShort = ukShortDateNoYear(started);
  const endsShort = ukShortDateNoYear(ends);
  // 80-120 word italic body. UK tone, calm-but-substantive. Signed by Astra.
  // Demo placeholder dates {start_date}/{end_date} resolved to the actual
  // computed window (Saturn period ~29.5y, +/- 1.5y window — approximate).
  const body =
    `This is the moon putting your house back on its foundations, not knocking it down. ` +
    `Three years of editing what was sturdy enough to stay and what was paper-mâché. ` +
    `The mid-twenties dread is misnamed — what you'll feel between ${startedShort} and ${endsShort} is closer to a slow exhale than to a crisis. ` +
    `Reread the work that called you at twenty-one; some of it still applies, some of it doesn't, and Saturn is the one who'll tell you which. ` +
    `You don't have to know yet which is which. Just notice what you keep returning to when no one's watching.`;
  return (
    <div style={saturnShellStyle}>
      <p style={saturnEyeStyle}>Your Saturn Return · Year {returnYear} of 3</p>
      <h3 style={saturnTitleStyle}>
        A <em style={saturnEmStyle}>structural year</em>. Saturn is rebuilding the foundation.
      </h3>
      <p style={saturnBodyStyle}>{body}</p>
      <div style={saturnMetaRowStyle}>
        <span style={saturnMetaItemStyle}><span style={saturnMetaLabelStyle}>Return started</span> {ukDate(started)}</span>
        <span style={saturnMetaItemStyle}><span style={saturnMetaLabelStyle}>Return exact</span> {ukDate(exact)}</span>
        <span style={saturnMetaItemStyle}><span style={saturnMetaLabelStyle}>Return ends</span> {ukDate(ends)}</span>
      </div>
      <p style={saturnSignoffStyle}>— Astra · {ukTodayShort()}</p>
    </div>
  );
}

// ── Annual Profection card ─────────────────────────────────────────────────
function ProfectionCard({ age, house, time_lord, lit_house_copy, time_lord_copy, unlocks_on }) {
  const ord = houseOrdinal(house);
  const planetText = time_lord ? `${time_lord} year` : "profected year";
  return (
    <div style={profectionShellStyle}>
      <p style={profectionEyeStyle}>Year {age} · Annual Profection</p>
      <h3 style={profectionTitleStyle}>
        A <em style={profectionEmStyle}>{planetText}</em> — the {ord} house is lit.
      </h3>
      {time_lord_copy && (
        <p style={profectionBodyStyle}>{time_lord_copy}</p>
      )}
      {lit_house_copy && (
        <p style={profectionBodyStyle}>{lit_house_copy}</p>
      )}
      <div style={profectionMetaRowStyle}>
        <span style={profectionMetaItemStyle}>
          <span style={profectionMetaLabelStyle}>Time-lord</span> {time_lord || "—"}
        </span>
        <span style={profectionMetaItemStyle}>
          <span style={profectionMetaLabelStyle}>Active house</span> {ord}
        </span>
        <span style={profectionMetaItemStyle}>
          <span style={profectionMetaLabelStyle}>Unlocks on</span> {ukDate(unlocks_on)}
        </span>
      </div>
    </div>
  );
}

export default function AnnualProfections({ astro, userProfile }) {
  const { ready, profection, saturn } = useProfections(astro, userProfile);
  if (!ready || !profection) return null;
  const inSaturnReturnWindow =
    profection.age >= 27 && profection.age <= 30 && !!saturn;

  return (
    <SectionWrap>
      {inSaturnReturnWindow && (
        <SaturnReturnLetter
          age={profection.age}
          started={saturn.started}
          exact={saturn.exact}
          ends={saturn.ends}
        />
      )}
      <ProfectionCard {...profection} />
    </SectionWrap>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────
const profectionShellStyle = {
  borderRadius: 18,
  padding: "20px 22px 18px",
  // H2-fix2: deeper gold tint on dark plum wrap (was too faint to see at 0.16).
  background: "linear-gradient(180deg, rgba(184,158,106,0.22) 0%, rgba(184,158,106,0.08) 100%)",
  border: "1px solid rgba(184,158,106,0.42)",
  boxShadow: "0 1px 2px rgba(43,30,22,0.20), 0 6px 18px rgba(184,158,106,0.18)",
};
const profectionEyeStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  // H2-fix2: brighter gold for readability on dark.
  color: "#D9B97A",
  margin: "0 0 8px",
};
const profectionTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 22,
  lineHeight: 1.3,
  // H2-fix2: cream-on-night now that we sit inside Plum Night SectionWrap.
  color: INK_NIGHT,
  margin: "0 0 12px",
};
const profectionEmStyle = {
  fontStyle: "italic",
  // H2-fix2: brighter gold accent for italic emphasis.
  color: "#D9B97A",
};
const profectionBodyStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 14.5,
  lineHeight: 1.65,
  // H2-fix2: cream body on dark.
  color: "rgba(245,230,211,0.86)",
  margin: "0 0 12px",
};
const profectionMetaRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 14,
  paddingTop: 10,
  borderTop: "1px dashed rgba(184,158,106,0.40)",
};
const profectionMetaItemStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  // H2-fix2: cream meta on dark.
  color: "rgba(245,230,211,0.82)",
};
const profectionMetaLabelStyle = {
  fontWeight: 700,
  letterSpacing: "0.04em",
  marginRight: 6,
  // H2-fix2: brighter gold label.
  color: "#D9B97A",
};

// Saturn Return pane — sits above the profection card. H2-fix2 brought into
// cream-on-night since it sits inside a Plum Night SectionWrap.
const saturnShellStyle = {
  borderRadius: 18,
  padding: "22px 22px 16px",
  // H2-fix2: deeper sage tint on dark plum.
  background: "linear-gradient(180deg, rgba(125,134,104,0.28) 0%, rgba(125,134,104,0.10) 100%)",
  border: "1px solid rgba(125,134,104,0.50)",
  boxShadow: "0 1px 2px rgba(43,30,22,0.18), 0 6px 18px rgba(125,134,104,0.16)",
  marginBottom: 14,
};
const saturnEyeStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  // H2-fix2: brighter sage for readability on dark.
  color: "#A6BEB0",
  margin: "0 0 8px",
};
const saturnTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 17,
  lineHeight: 1.35,
  // H2-fix2: cream-on-night.
  color: INK_NIGHT,
  margin: "0 0 12px",
};
const saturnEmStyle = {
  fontStyle: "italic",
  // H2-fix2: brighter sage emphasis.
  color: "#A6BEB0",
};
const saturnBodyStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 14,
  lineHeight: 1.65,
  // H2-fix2: cream body on night.
  color: "rgba(245,230,211,0.86)",
  margin: "0 0 12px",
};
const saturnMetaRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  paddingTop: 10,
  borderTop: "1px dashed rgba(125,134,104,0.55)",
  marginBottom: 8,
};
const saturnMetaItemStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  // H2-fix2: cream meta.
  color: "rgba(245,230,211,0.82)",
};
const saturnMetaLabelStyle = {
  fontWeight: 700,
  letterSpacing: "0.04em",
  marginRight: 6,
  // H2-fix2: brighter sage label.
  color: "#A6BEB0",
};
const saturnSignoffStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 12,
  // H2-fix2: muted cream signoff.
  color: "rgba(245,230,211,0.62)",
  margin: 0,
};
