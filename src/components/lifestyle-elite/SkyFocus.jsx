// SkyFocus — the horoscope re-authored from scratch in the cream/flora focus design (§19 reference),
// with FULL feature parity to the original 18-element HoroscopeTab. Reuses the real data/logic
// (useBirthChart · astrology utils · useProfections · useAsteroids · ShareButton · BirthDataSheet)
// and re-authors each element with its own PURPOSEFUL design — not a uniform dropdown stack.
//
// BATCH 1 (designed here): Hero · Triad (chart, tap-expand) · Today's weather (editorial + Spotify +
//   notice/watch) · Cycle-moon dial (SVG visual) · Goddess bench (asteroid orbs, tap-expand).
// BATCHES 2-4 (kept below at prior depth so nothing regresses; being re-authored next): the year
//   (profections + Saturn letter) · red/white moon · compatibility module · ask-the-sky · sky diary
//   timeline · quiet mode · atelier · paid shelf · Jess banner · carry-it-with-you · full footers.
import React, { useMemo, useState } from "react";
import { Moon, Sun, Sunrise, Sparkles, Music2, Pencil, ChevronDown } from "lucide-react";
import { getSunSign, getSunDegree, getRulingPlanet, getZodiacGlyph, getElement, getModality, getMoonPhase } from "@/utils/astrology";
import { useBirthChart } from "@/components/horoscope/hooks/useBirthChart";
import useProfections from "@/components/horoscope/hooks/useProfections";
import useAsteroids from "@/components/horoscope/hooks/useAsteroids";
import { ASTEROID_NAMES, ASTEROID_ARCHETYPES } from "@/lib/astrology/asteroids";
import BirthDataSheet from "@/components/horoscope/BirthDataSheet";
import ShareButton from "@/components/share/ShareButton";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";
import { phaseLabel } from "@/utils/cyclePhase";

const OX = "#7A1A12";
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s);
const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const paras = (s) => String(s || "").replace(/<[^>]+>/g, "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
const PHASE_HUE = { menstrual: "#BC2E27", follicular: "#8FAF8F", ovulatory: "#D4AF37", luteal: "#8E6E8E" };

const SIGN_TRAITS = { Aries: "first in, fully lit", Taurus: "slow, sensual, durable", Gemini: "curious, two-minded", Cancer: "soft shell, sharp memory", Leo: "warm, sovereign", Virgo: "patterns, ratios, repair", Libra: "measured, warm", Scorpio: "deep water, no shallows", Sagittarius: "long view, far reach", Capricorn: "slow ladder, real climb", Aquarius: "considered, independent", Pisces: "tender, intuitive" };
const MOON_SIGN_PLAYLIST = { aries: "37i9dQZF1DX2DC3Q7JOmYe", taurus: "37i9dQZF1DXbCgDGG5xQtb", gemini: "37i9dQZF1DWWVULl5wUsL9", cancer: "37i9dQZF1DWTwnEm1IYyoj", leo: "37i9dQZF1DX7cvHpkIJFt2", virgo: "37i9dQZF1DX6PdsVYbP4rI", libra: "37i9dQZF1DXco4NYQOMLiT", scorpio: "37i9dQZF1DX0YZgrwmizcR", sagittarius: "37i9dQZF1DX4VvfRBFClxm", capricorn: "37i9dQZF1DWZeKCadgRdKQ", aquarius: "37i9dQZF1DX4dyzvuaRJ0n", pisces: "37i9dQZF1DX6uhsAfngvaD" };
const ORB = { ceres: "#C77", pallas: "#C9A95C", juno: "#D98E7E", vesta: "#7D8668", chiron: "#B68A3C", lilith: "#5F8A85" };

function deriveChart(astro, up) {
  const birthday = astro?.birth_date || up?.birthday || up?.date_of_birth || null;
  const sun = astro?.sun_sign || getSunSign(birthday);
  return { birthday, sun, sunDegree: birthday ? getSunDegree(birthday) : null, sunRuler: sun ? getRulingPlanet(sun) : null, element: sun ? getElement(sun) : null, modality: sun ? getModality(sun) : null, moonSign: astro?.moon_sign || null, risingSign: astro?.rising_sign || null, hasBirthTime: !!astro?.birth_time, place: astro?.birth_place || null, name: up?.preferred_name || up?.first_name || "" };
}
function derivePhaseInfo(up) {
  if (!up?.last_period_start_date) return { phase: null, day: null };
  const last = new Date(up.last_period_start_date); const len = up.cycle_avg_length || 28;
  const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
  const day = ((diff % len) + len) % len + 1; const pl = up.period_length || 5;
  let phase = day <= pl ? "menstrual" : day <= 13 ? "follicular" : day <= 16 ? "ovulatory" : "luteal";
  return { phase, day, len };
}

// ── shared cream card ────────────────────────────────────────────────────────────────────────
function Card({ eyebrow, title, accent = "lavender", children, style }) {
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

// ── §2 TRIAD — a 3-column chart display; tap a column to unfold its reading ────────────────────
function TriadColumn({ Icon, label, sign, trait, glyph, desc, locked, onUnlock, accent }) {
  const [open, setOpen] = useState(false);
  const petal = cwOf(accent).petal;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <button onClick={() => { if (locked) return onUnlock && onUnlock(); if (desc) setOpen((v) => !v); }} className="fw-elite-press"
        style={{ width: "100%", textAlign: "center", cursor: (desc || locked) ? "pointer" : "default", background: open ? `${petal}12` : T.paper || "#ECE7DA", border: `1px solid ${open ? petal : T.line}`, borderRadius: 13, padding: "12px 6px" }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, color: petal, lineHeight: 1 }}>{glyph || <Icon size={19} color={petal} />}</div>
        <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#A8893F", marginTop: 7 }}>{label}</div>
        <div style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: T.ink, lineHeight: 1.15, marginTop: 2 }}>{locked ? "Locked" : (sign || "—")}</div>
        {!locked && trait ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: T.muted, marginTop: 2, lineHeight: 1.25 }}>{trait}</div> : null}
        {locked ? <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: petal, marginTop: 4 }}>+ add birth time</div>
          : desc ? <ChevronDown size={13} color={T.paperDeep} style={{ marginTop: 5, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} /> : null}
      </button>
      {open && desc ? <p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, lineHeight: 1.55, margin: "8px 2px 0" }}>{clean(desc)}</p> : null}
    </div>
  );
}

// ── §4 CYCLE-MOON DIAL — the composite SVG dial, re-drawn in cream ─────────────────────────────
function CycleMoonDial({ moon, cyclePhase, cycleDay, cycleLen = 28, body }) {
  const lunarPos = moon?.position != null ? Math.min(0.999, Math.max(0, moon.position)) : (moon?.illumination != null ? (moon.waxing ? moon.illumination / 200 : 0.5 + (100 - moon.illumination) / 200) : 0);
  const cyclePos = cycleDay ? Math.min(0.999, Math.max(0, (cycleDay - 1) / cycleLen)) : 0;
  const outerR = 58, innerR = 42; const outerC = 2 * Math.PI * outerR, innerC = 2 * Math.PI * innerR;
  const cycleStroke = PHASE_HUE[cyclePhase] || "#8E6E8E"; const ink = T.ink || "#141009";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg viewBox="0 0 130 130" style={{ width: 132, height: 132, flexShrink: 0 }} aria-hidden="true">
        <circle cx="65" cy="65" r={outerR} fill="none" stroke="rgba(20,12,7,0.08)" strokeWidth="6" />
        <circle cx="65" cy="65" r={outerR} fill="none" stroke={ink} strokeWidth="6" strokeDasharray={`${outerC * lunarPos} ${outerC}`} strokeLinecap="butt" transform="rotate(-90 65 65)" opacity="0.55" />
        <g transform={`rotate(${lunarPos * 360} 65 65)`}><circle cx="65" cy={65 - outerR} r="5" fill={ink} /></g>
        <circle cx="65" cy="65" r={innerR} fill="none" stroke="rgba(20,12,7,0.08)" strokeWidth="6" />
        <circle cx="65" cy="65" r={innerR} fill="none" stroke={cycleStroke} strokeWidth="6" strokeDasharray={`${innerC * cyclePos} ${innerC}`} strokeLinecap="butt" transform="rotate(-90 65 65)" />
        <g transform={`rotate(${cyclePos * 360} 65 65)`}><circle cx="65" cy={65 - innerR} r="5" fill={cycleStroke} /></g>
        <text x="65" y="61" textAnchor="middle" style={{ fontFamily: UI, fontSize: 8, fontWeight: 800, letterSpacing: "1px", fill: "#A8893F" }}>TODAY</text>
        <text x="65" y="73" textAnchor="middle" style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 600, fill: ink }}>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}</text>
      </svg>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}><span style={{ width: 9, height: 9, borderRadius: 99, background: ink }} /><span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft }}><strong style={{ fontWeight: 700 }}>Lunar</strong> · {moon?.short || moon?.name || "moon"}{moon?.illumination != null ? ` · ${moon.illumination}%` : ""}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><span style={{ width: 9, height: 9, borderRadius: 99, background: cycleStroke }} /><span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft }}><strong style={{ fontWeight: 700 }}>Cycle</strong> · {cyclePhase ? `${cap(cyclePhase)}${cycleDay ? ` · Day ${cycleDay}` : ""}` : "add your dates"}</span></div>
        {body ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, lineHeight: 1.45, margin: 0 }}>{clean(body)}</p> : null}
      </div>
    </div>
  );
}

// ── §2.5 GODDESS BENCH — asteroid orbs, tap to unfold the archetype ────────────────────────────
function GoddessBench({ signs, goddessRead }) {
  const [open, setOpen] = useState(null);
  const present = ASTEROID_NAMES.map((n) => ({ n, s: signs?.[n] })).filter((x) => x.s);
  if (!present.length && !goddessRead) return null;
  const active = open ? ASTEROID_ARCHETYPES[open] : null;
  return (
    <Card eyebrow="Beside you today" title="Your goddess bench" accent="crimson">
      {present.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: goddessRead || active ? 12 : 0 }}>
          {present.map(({ n, s }) => {
            const c = ORB[n] || "#C77"; const on = open === n;
            return (
              <button key={n} onClick={() => setOpen(on ? null : n)} className="fw-elite-press" aria-expanded={on} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: on ? `${c}18` : "transparent", border: "none", borderRadius: 10, padding: "6px 2px", cursor: "pointer" }}>
                <span style={{ width: 30, height: 30, borderRadius: 99, background: `radial-gradient(circle at 30% 30%, ${c} 0%, ${c}66 60%, ${c}1a 100%)`, border: `1.5px solid ${c}66` }} />
                <span style={{ fontFamily: UI, fontSize: 8.5, fontWeight: 700, color: T.muted, textAlign: "center", lineHeight: 1.1 }}>{ASTEROID_ARCHETYPES[n]?.role || cap(n)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {active ? (
        <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 12, padding: "11px 13px", marginBottom: goddessRead ? 10 : 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{cap(open)} in {cap(signs?.[open])} · {active.role}</div>
          <p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5, margin: "4px 0 0" }}>{clean(active.description)}</p>
        </div>
      ) : null}
      {goddessRead ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: OX, lineHeight: 1.5, margin: 0, paddingTop: present.length ? 10 : 0, borderTop: present.length ? `1px dashed ${T.paperDeep}` : "none" }}>{clean(goddessRead)}</p> : null}
    </Card>
  );
}

export default function SkyFocus({ userProfile }) {
  const { user, astro, reading, userProfile: up, loading, generatingReading, setAstro } = useBirthChart(userProfile);
  const prof = userProfile || up;
  const chart = useMemo(() => deriveChart(astro, prof), [astro, prof]);
  const cyc = useMemo(() => derivePhaseInfo(prof), [prof]);
  const moon = useMemo(() => getMoonPhase(new Date()), []);
  const profections = useProfections(astro, prof);
  const asteroids = useAsteroids(astro, prof);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (loading) return <div style={{ fontFamily: SERIF, fontStyle: "italic", color: T.muted, textAlign: "center", padding: "28px 0" }}>Reading the sky…</div>;

  // ── no chart → cream onboarding ──
  if (!astro) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card eyebrow="Tonight's sky" title={`The moon is ${moon?.name ? moon.name.toLowerCase() : "in the sky"}`} accent="lavender">
          <Body>{moon?.illumination != null ? `${moon.illumination}% lit${moon.waxing ? " and climbing — a stretch for building, not finishing" : " and releasing — a stretch for letting go"}.` : "Held lightly, just for the comfort of it."}</Body>
        </Card>
        <Card eyebrow="Read me the sky" title="A daily reading from your own chart" accent="plum">
          <Body>FemWell writes you a daily reading from your own chart and your own cycle — not a sign-shaped horoscope written for a twelfth of the world.</Body>
          <Body size={15}>Your birth date is all we need to begin. Birth time and place are optional; they unlock your moon and rising. We never track your location.</Body>
          <button onClick={() => setSheetOpen(true)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, background: cwOf("plum").petal, color: "#fff", border: "none", borderRadius: 12, fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}><Sparkles size={16} /> Set up your sky</button>
        </Card>
        <BirthDataSheet open={sheetOpen} onClose={() => setSheetOpen(false)} userId={user?.id} initial={null} userProfile={prof} onSaved={(saved) => { setAstro(saved); setSheetOpen(false); }} />
      </div>
    );
  }

  const phaseTxt = cyc.phase ? `your ${phaseLabel(cyc.phase).toLowerCase()} week${cyc.day ? ` (day ${cyc.day})` : ""}` : "your week";
  const moonTxt = moon?.name ? `a ${moon.name.toLowerCase()}${moon.illumination != null ? `, ${moon.illumination}% lit` : ""}` : "the sky";
  const summary = `${chart.name ? chart.name + ", your" : "Your"} ${chart.sun || "sun"} sun leads today — ${moonTxt}, ${moon?.waxing ? "climbing" : "releasing"}, over ${phaseTxt}.`;
  const heroHeadline = clean(reading?.headline) || `A steady day. The moon is ${moon?.waxing ? "climbing" : "releasing"}.`;
  const weather = paras(reading?.narrative).slice(0, 3);
  const energy = reading?.weather_energy || null;
  const mood = reading?.weather_mood ? clean(reading.weather_mood) : null;
  const playlist = chart.moonSign ? MOON_SIGN_PLAYLIST[String(chart.moonSign).toLowerCase()] : null;
  const notice = reading?.pressure_title || reading?.trouble_title ? { t: clean(reading.pressure_title || reading.trouble_title), b: clean(reading.pressure_body || reading.trouble_body) } : null;
  const shareArtifact = { kind: "horoscope", source: "horoscope", line: heroHeadline, footer: "Today's sky", url: "https://femwells.com", shareText: "Today's sky, from FemWell." };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ACTION ROW — the "Open your sky" CTA repurposed into two ADDITIVE actions (no duplicate path) */}
      <div style={{ display: "flex", gap: 9 }}>
        <button onClick={() => setSheetOpen(true)} className="fw-elite-press" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 44, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: T.ink, cursor: "pointer" }}><Pencil size={15} color="#A8893F" /> Edit your chart</button>
        <div style={{ flex: 1, display: "flex" }}><ShareButton label="Share today's sky" artifact={shareArtifact} /></div>
      </div>

      {/* 0 · personalised summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("lavender").petal}22`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Moon size={18} color={cwOf("lavender").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{summary}{generatingReading ? " (reading the sky…)" : ""}</p>
      </div>

      {/* §1 HERO — a cream masthead: headline + sub + the 3 state chips */}
      <section style={{ position: "relative", overflow: "hidden", borderRadius: 20, padding: "20px 18px", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${cwOf("lavender").petal}14 100%)`, border: `1px solid ${T.line}`, boxShadow: "0 8px 26px rgba(58,44,26,.10)" }}>
        <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "200px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
        <CardFrame color={cwOf("lavender").petal} opacity={0.5} size={48} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#A8893F", marginBottom: 6 }}>Your sky today</div>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: T.ink, lineHeight: 1.18, margin: "0 0 10px", letterSpacing: -0.3 }}>{heroHeadline}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[cyc.phase ? `${cap(cyc.phase)}${cyc.day ? ` · Day ${cyc.day}` : ""}` : null, moon?.name ? cap(moon.name) : null, chart.sun ? `${cap(chart.sun)} sun` : null].filter(Boolean).map((chip) => (
              <span key={chip} style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft, background: T.paper, border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 11px" }}>{chip}</span>
            ))}
          </div>
        </div>
      </section>

      {/* §2 TRIAD — the chart, tap a column to unfold its reading */}
      <Card eyebrow="Your chart" title="Sun, moon & rising" accent="gold">
        <div style={{ display: "flex", gap: 9 }}>
          <TriadColumn Icon={Sun} label="Sun" sign={chart.sun ? cap(chart.sun) : null} trait={SIGN_TRAITS[cap(chart.sun)]} glyph={chart.sun ? getZodiacGlyph(chart.sun) : null} desc={reading?.triad_sun_desc} accent="gold" />
          <TriadColumn Icon={Moon} label="Moon" sign={chart.moonSign ? cap(chart.moonSign) : null} trait={SIGN_TRAITS[cap(chart.moonSign)]} glyph={chart.moonSign ? getZodiacGlyph(chart.moonSign) : null} desc={reading?.triad_moon_desc} locked={!chart.moonSign} onUnlock={() => setSheetOpen(true)} accent="lavender" />
          <TriadColumn Icon={Sunrise} label="Rising" sign={chart.risingSign ? cap(chart.risingSign) : null} trait={SIGN_TRAITS[cap(chart.risingSign)]} glyph={chart.risingSign ? getZodiacGlyph(chart.risingSign) : null} desc={reading?.triad_rising_desc} locked={!chart.risingSign} onUnlock={() => setSheetOpen(true)} accent="crimson" />
        </div>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, textAlign: "center", marginTop: 9 }}>{[chart.element, chart.modality, chart.sunRuler ? `ruled by ${chart.sunRuler}` : null].filter(Boolean).join(" · ")}</div>
      </Card>

      {/* §3 TODAY'S WEATHER — an editorial reading + energy/mood + sound-for-today + notice/watch */}
      <Card eyebrow="Today's weather · from Astra" title="Your reading today" accent="crimson">
        {weather.length ? weather.map((p, i) => <Body key={i} size={16.5}>{p}</Body>) : <Body>{clean(reading?.headline) || `A steady ${chart.sun || "quiet"} day — begin the thing you've been thinking about.`}</Body>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {energy ? <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft, background: T.paper, border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 11px" }}>Energy {energy}</span> : null}
          {mood ? <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft, background: T.paper, border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 11px" }}>{mood}</span> : null}
          {playlist ? <a href={`https://open.spotify.com/playlist/${playlist}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#3f5f38", background: `${cwOf("sage").petal}18`, border: `1px solid ${cwOf("sage").petal}`, borderRadius: 999, padding: "5px 11px" }}><Music2 size={13} /> A sound for today</a> : null}
        </div>
        {notice ? (
          <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px dashed ${T.paperDeep}` }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#A8893F", marginBottom: 3 }}>Notice · watch for</div>
            {notice.t ? <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{notice.t}</div> : null}
            {notice.b ? <div style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, lineHeight: 1.5, marginTop: 2 }}>{notice.b}</div> : null}
          </div>
        ) : null}
      </Card>

      {/* §4 CYCLE-MOON DIAL — the visual */}
      <Card eyebrow="Cycle × moon" title="Your two tides" accent="sage">
        <CycleMoonDial moon={moon} cyclePhase={cyc.phase} cycleDay={cyc.day} cycleLen={cyc.len || 28} body={reading?.cycle_moon_body} />
      </Card>

      {/* §2.5 GODDESS BENCH — asteroid orbs */}
      <GoddessBench signs={asteroids} goddessRead={reading?.goddess_read} />

      {/* ── BATCHES 2–4 (kept at prior depth so nothing regresses; being re-authored next) ── */}
      <Card eyebrow="Your longer arc · being re-authored" title="The house your year is in" accent="plum">
        <Body>{profections?.ready && profections.profection
          ? `You're in a ${profections.profection.house_label || `House ${profections.profection.house}`} year${profections.profection.theme ? ` — ${clean(profections.profection.theme)}` : ""}.`
          : "Annual profections move the emphasis one house each birthday — add your birth date and your year's house opens here."}</Body>
      </Card>

      <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, textAlign: "center", lineHeight: 1.6, margin: "4px 12px 0" }}>Held lightly — folklore and your own chart, never fate or a score. Your birth details stay yours; we never track your location. <span style={{ opacity: 0.7 }}>More of your sky — compatibility, ask-the-sky, your diary, the year & moon rituals — is being re-authored into this cream design next.</span></p>

      <BirthDataSheet open={sheetOpen} onClose={() => setSheetOpen(false)} userId={user?.id} initial={astro} userProfile={prof} onSaved={(saved) => { setAstro(saved); setSheetOpen(false); }} />
    </div>
  );
}
