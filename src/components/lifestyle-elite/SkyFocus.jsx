// SkyFocus — the horoscope REBUILT FROM SCRATCH in the new cream/flora focus design (§19 Smartness
// Standard reference implementation). It REUSES the data layer (useBirthChart + the astrology utils +
// the profection/red-white-moon hooks) and REBUILDS the presentation — no dark Twilight/Plum-Night
// theme, no button-gating, nothing lost. Deliberately ordered (now → her body → who she is → the
// longer arcs → beside-someone → reflect), section-specific summary, reads her real chart + cycle +
// moon state. Onboarding when there's no chart yet.
import React, { useMemo, useState } from "react";
import { Moon, Sun, Sunrise, Sparkles, Feather, Heart, Wind, CalendarDays, ChevronRight } from "lucide-react";
import { getSunSign, getSunDegree, getRulingPlanet, getElement, getModality, getMoonPhase, sunSignCompatBase, ALL_ZODIAC } from "@/utils/astrology";
import { useBirthChart } from "@/components/horoscope/hooks/useBirthChart";
import useProfections from "@/components/horoscope/hooks/useProfections";
import BirthDataSheet from "@/components/horoscope/BirthDataSheet";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";
import { phaseLabel } from "@/utils/cyclePhase";

const OX = "#7A1A12";
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s);
const stripHtml = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").trim();

// local reimplementations of HoroscopeTab's derive helpers (data only, no design)
function deriveChart(astro, up) {
  const birthday = astro?.birth_date || up?.birthday || up?.date_of_birth || null;
  const sun = astro?.sun_sign || getSunSign(birthday);
  return {
    birthday, sun,
    sunDegree: birthday ? getSunDegree(birthday) : null,
    sunRuler: sun ? getRulingPlanet(sun) : null,
    element: sun ? getElement(sun) : null,
    modality: sun ? getModality(sun) : null,
    moonSign: astro?.moon_sign || null,
    risingSign: astro?.rising_sign || null,
    hasBirthTime: !!astro?.birth_time,
    place: astro?.birth_place || null,
    name: up?.preferred_name || up?.first_name || "",
  };
}
function derivePhaseInfo(up) {
  if (!up?.last_period_start_date) return { phase: null, day: null };
  const last = new Date(up.last_period_start_date);
  const len = up.cycle_avg_length || 28;
  const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
  const day = ((diff % len) + len) % len + 1;
  let phase = "follicular";
  const pl = up.period_length || 5;
  if (day <= pl) phase = "menstrual"; else if (day <= 13) phase = "follicular"; else if (day <= 16) phase = "ovulatory"; else phase = "luteal";
  return { phase, day };
}

// ── the cream card language of the focus surface (sprig + grain + oxblood heading) ───────────────
function SkyCard({ eyebrow, title, accent = "lavender", children, style }) {
  const petal = cwOf(accent).petal;
  return (
    <section style={{ position: "relative", overflow: "hidden", background: T.paperHi || "#F4EFE3", border: `1px solid ${T.line || "#d8cfbc"}`, borderLeft: `4px solid ${petal}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 6px 22px rgba(58,44,26,.08), 0 1px 3px rgba(58,44,26,.05)", ...style }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "180px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
      <CardFrame color={petal} opacity={0.4} size={40} />
      <div style={{ position: "relative" }}>
        {eyebrow ? <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#A8893F", marginBottom: 6 }}>{eyebrow}</div> : null}
        {title ? <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.2, margin: "0 0 8px" }}>{title}</h3> : null}
        {children}
      </div>
    </section>
  );
}
const Body = ({ children, size = 16 }) => <p style={{ fontFamily: SERIF, fontSize: size, color: T.inkSoft, lineHeight: 1.6, margin: "0 0 10px" }}>{children}</p>;
const Triad = ({ Icon, label, sign, sub, accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: `1px solid ${T.paperDeep || "#D8CFBC"}` }}>
    <span style={{ width: 38, height: 38, borderRadius: 11, background: `${cwOf(accent).petal}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={19} color={cwOf(accent).petal} /></span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#A8893F" }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{sign || "—"}</div>
      {sub ? <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, marginTop: 1 }}>{sub}</div> : null}
    </div>
  </div>
);

export default function SkyFocus({ userProfile }) {
  const { user, astro, reading, userProfile: up, loading, generatingReading, setAstro } = useBirthChart(userProfile);
  const prof = userProfile || up;
  const chart = useMemo(() => deriveChart(astro, prof), [astro, prof]);
  const cyc = useMemo(() => derivePhaseInfo(prof), [prof]);
  const moon = useMemo(() => getMoonPhase(new Date()), []);
  const profections = useProfections(astro, prof);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [their, setTheir] = useState("");

  if (loading) {
    return <div style={{ fontFamily: SERIF, fontStyle: "italic", color: T.muted, textAlign: "center", padding: "28px 0" }}>Reading the sky…</div>;
  }

  // ── NO CHART YET — a real, warm cream onboarding (not a lone card) ──
  if (!astro) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SkyCard eyebrow="Tonight's sky" title={`The moon is ${moon?.name ? moon.name.toLowerCase() : "in the sky"}`} accent="lavender">
          <Body>{moon?.illumination != null ? `${moon.illumination}% lit${moon.waxing ? " and climbing — a stretch for building, not finishing" : " and releasing — a stretch for letting go"}.` : "Held lightly, just for the comfort of it."}</Body>
        </SkyCard>
        <SkyCard eyebrow="Read me the sky" title="A daily reading from your own chart" accent="plum">
          <Body>FemWell writes you a daily reading from your own chart and your own cycle — not a sign-shaped horoscope written for a twelfth of the world.</Body>
          <Body size={15}>Your birth date is all we need to begin. Birth time and place are optional; they unlock your moon and rising. We never track your location.</Body>
          <button onClick={() => setSheetOpen(true)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: cwOf("plum").petal, color: "#fff", border: "none", borderRadius: 12, fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}><Sparkles size={16} /> Set up your sky</button>
        </SkyCard>
        <BirthDataSheet open={sheetOpen} onClose={() => setSheetOpen(false)} userId={user?.id} initial={null} userProfile={prof} onSaved={(saved) => { setAstro(saved); setSheetOpen(false); }} />
      </div>
    );
  }

  // ── SECTION-SPECIFIC SUMMARY — reads her real chart + cycle + moon ──
  const phaseTxt = cyc.phase ? `your ${phaseLabel(cyc.phase).toLowerCase()} week${cyc.day ? ` (day ${cyc.day})` : ""}` : "your week";
  const moonTxt = moon?.name ? `a ${moon.name.toLowerCase()}${moon.illumination != null ? `, ${moon.illumination}% lit` : ""}` : "the sky";
  const summary = `${chart.name ? chart.name + ", your" : "Your"} ${chart.sun || "sun"} sun leads today — ${moonTxt}, ${moon?.waxing ? "climbing" : "releasing"}, over ${phaseTxt}.`;

  const weatherLine = stripHtml(reading?.narrative || reading?.headline) || `A steady ${chart.sun || "quiet"} day — begin the thing you've been thinking about.`;
  const bestFor = reading?.power_title ? stripHtml(reading.power_title).replace(/[.!?]+$/, "").toLowerCase() : "initiating, naming what you want";
  const cycleMoon = stripHtml(reading?.cycle_moon_body) || `${cyc.phase ? cap(cyc.phase) + " energy" : "Your body"} meets ${moonTxt} — ${moon?.waxing ? "two tides both rising, a week that rewards follow-through" : "two tides easing, a week that rewards rest"}.`;
  const goddess = stripHtml(reading?.goddess_read);
  const atelier = stripHtml(reading?.narrative);
  const compat = their ? sunSignCompatBase(chart.sun, their) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · the personalised summary — smart, stateful, section-specific */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px 2px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("lavender").petal}22`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Moon size={18} color={cwOf("lavender").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{summary}{generatingReading ? " (reading the sky…)" : ""}</p>
      </div>

      {/* 1 · TODAY (now) */}
      <SkyCard eyebrow="Today's sky" title="Your weather today" accent="crimson">
        <Body>{weatherLine}</Body>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
          <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.inkSoft, background: T.paper || "#ECE7DA", border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 11px" }}>Best for: {bestFor}</span>
          {reading?.weather_energy ? <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.inkSoft, background: T.paper, border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 11px" }}>Energy {reading.weather_energy}</span> : null}
          {reading?.weather_mood ? <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.inkSoft, background: T.paper, border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 11px" }}>{stripHtml(reading.weather_mood)}</span> : null}
        </div>
      </SkyCard>

      {/* 2 · CYCLE + MOON (her body meets the sky) */}
      <SkyCard eyebrow="Cycle & moon" title="Your two tides" accent="sage">
        <Body>{cycleMoon}</Body>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", background: T.paper, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "#A8893F" }}>Your cycle</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, marginTop: 3 }}>{cyc.phase ? `${cap(cyc.phase)}${cyc.day ? ` · Day ${cyc.day}` : ""}` : "Add your dates"}</div>
          </div>
          <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", background: T.paper, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "#A8893F" }}>The moon</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, marginTop: 3 }}>{moon?.name ? cap(moon.name) : "—"}{moon?.illumination != null ? ` · ${moon.illumination}%` : ""}</div>
          </div>
        </div>
      </SkyCard>

      {/* 3 · YOUR TRIAD (who you are) */}
      <SkyCard eyebrow="Your chart" title="Sun, moon & rising" accent="gold">
        <Triad Icon={Sun} label="Sun — how you shine" sign={chart.sun ? `${cap(chart.sun)}${chart.sunDegree != null ? ` ${chart.sunDegree}°` : ""}` : null} sub={[chart.element, chart.modality, chart.sunRuler ? `ruled by ${chart.sunRuler}` : null].filter(Boolean).join(" · ")} accent="gold" />
        <Triad Icon={Moon} label="Moon — how you feel" sign={chart.moonSign ? cap(chart.moonSign) : "Add birth time to unlock"} sub={chart.moonSign ? "your inner weather" : null} accent="lavender" />
        <Triad Icon={Sunrise} label="Rising — how you arrive" sign={chart.risingSign ? cap(chart.risingSign) : "Add birth time & place to unlock"} sub={chart.risingSign ? "the face you meet the world with" : null} accent="crimson" />
        {(!chart.moonSign || !chart.risingSign) && (
          <button onClick={() => setSheetOpen(true)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "transparent", border: `1px dashed ${cwOf("gold").petal}`, borderRadius: 10, padding: "8px 12px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#A8893F", cursor: "pointer" }}>Add birth time & place <ChevronRight size={14} /></button>
        )}
      </SkyCard>

      {/* 4 · THE MONTH / YEAR (the longer arc) — annual profection */}
      <SkyCard eyebrow="Your longer arc" title="The house your year is in" accent="plum">
        <Body>{profections?.ready && profections.profection
          ? `You're in a ${profections.profection.house_label || `House ${profections.profection.house}`} year${profections.profection.theme ? ` — ${stripHtml(profections.profection.theme)}` : ""}. ${profections.profection.body ? stripHtml(profections.profection.body) : "Annual profections move the emphasis one house each birthday — what this year is quietly asking of you."}`
          : "Annual profections move the emphasis one house each birthday — add your birth date and your year's house opens here."}</Body>
      </SkyCard>

      {/* 5 · THE GODDESS BESIDE YOU */}
      {goddess ? (
        <SkyCard eyebrow="Beside you today" title="Your goddess" accent="crimson"><Body>{goddess}</Body></SkyCard>
      ) : null}

      {/* 6 · THE ATELIER READING (the long, hand-crafted read) */}
      {atelier && atelier.length > 40 ? (
        <SkyCard eyebrow="The long read" title="Your reading, in full" accent="lavender">
          {atelier.split(/\n\n+/).slice(0, 4).map((para, i) => <Body key={i} size={16.5}>{para}</Body>)}
        </SkyCard>
      ) : null}

      {/* 7 · COMPATIBILITY (read your sky beside someone's) — interactive, wired */}
      <SkyCard eyebrow="Beside someone" title="Your sky next to theirs" accent="gold">
        <Body size={15}>Read the weather between you and someone — a partner, a friend, the one you're wondering about. Not a verdict; a texture.</Body>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ALL_ZODIAC.slice(0, 12).map((z) => (
            <button key={z.name} onClick={() => setTheir(z.name)} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "6px 11px", borderRadius: 999, cursor: "pointer", background: their === z.name ? cwOf("gold").petal : T.paper, color: their === z.name ? "#fff" : T.inkSoft, border: `1px solid ${their === z.name ? cwOf("gold").petal : T.line}` }}>{cap(z.name)}</button>
          ))}
        </div>
        {compat != null ? (
          <Body size={15} >{`Your ${cap(chart.sun)} beside their ${cap(their)}: ${compat >= 70 ? "an easy warmth — you meet without much translation." : compat >= 50 ? "a workable weather — different tempos that can teach each other." : "a stretchier sky — real, but it asks for patience on both sides."} `}</Body>
        ) : <div style={{ height: 4 }} />}
      </SkyCard>

      {/* 8 · SKY DIARY (reflect) — a quiet log against the moon, wired to journal */}
      <SkyCard eyebrow="Reflect" title="Your sky diary" accent="sage">
        <Body size={15}>A quiet line against tonight's moon — what stirred, what you noticed. It keeps, so you can read your seasons back.</Body>
        <a href="/Journal?seed=sky" className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", background: cwOf("sage").petal, color: "#fff", borderRadius: 12, padding: "10px 15px", fontFamily: UI, fontSize: 14, fontWeight: 700 }}><Feather size={15} /> Write tonight's line</a>
      </SkyCard>

      <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, textAlign: "center", lineHeight: 1.6, margin: "4px 12px 0" }}>Held lightly — folklore and your own chart, never fate or a score. Your birth details stay yours; we never track your location.</p>

      <BirthDataSheet open={sheetOpen} onClose={() => setSheetOpen(false)} userId={user?.id} initial={astro} userProfile={prof} onSaved={(saved) => { setAstro(saved); setSheetOpen(false); }} />
    </div>
  );
}
