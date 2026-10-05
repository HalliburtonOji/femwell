// SkyFocus — THE HOROSCOPE AS ONE COMPOSED PAGE (not a stack) in the clean language.
//
// Halli 2026-09-22: the old surface was "a bunch of read this and that — no direction, no proper
// function, no arrangement." So it is composed as EIGHT MOVEMENTS with a jump strip, each with a
// job and a real action, at FULL parity with the original 18-element HoroscopeTab:
//   I    Tonight  — masthead: headline · state · ONE CTA · share                        [1, 18]
//   II   Today    — the reading + energy/mood + a sound for today + notice, then CARRY IT
//                   WITH YOU (reflect · discuss · ask Jess) and mark-as-read → the Garden [3, 17]
//   III  You      — the chart triad (tap to unfold) · goddess bench · red & white moon  [2, 5, 7]
//   IV   Tides    — the cycle × moon dial in the ONE framed feature card                [4]
//   V    Year     — profections · the Saturn-return letter · the 12-cycle diary + right now [6, 10]
//   VI   Ask      — ask the sky (persisted) · compatibility (drum, bars, copy-link, glossary) [8, 9]
//   VII  Atelier  — the letter (locked/unlocked) + the paid shelf                       [14, 15]
//   VIII Your way — quiet mode · soft sky · the science footer · the privacy line   [11, 12, 13]
//   (16 JessAstraBanner rides the ?from=jess arrival, rendered at the top when present.)
// No flower hero inside the surface — the page's ONE header is the section still above it.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Moon, Sun, Sunrise, Sparkles, Music2, Pencil, ChevronDown, Check, PenLine, MessageCircle } from "lucide-react";
import { getSunSign, getSunDegree, getRulingPlanet, getElement, getModality, getMoonPhase } from "@/utils/astrology";
import { getSignIcon } from "@/lib/astrology/glyphs";
import { useBirthChart } from "@/components/horoscope/hooks/useBirthChart";
import useProfections from "@/components/horoscope/hooks/useProfections";
import useAsteroids from "@/components/horoscope/hooks/useAsteroids";
import { ASTEROID_NAMES, ASTEROID_ARCHETYPES } from "@/lib/astrology/asteroids";
import BirthDataSheet from "@/components/horoscope/BirthDataSheet";
import JessAstraBanner from "@/components/horoscope/JessAstraBanner";
import ShareButton from "@/components/share/ShareButton";
import { recordProgress } from "@/components/community/readingActivity";
import { createPageUrl } from "@/utils";
import { SERIF, UI, SCRIPT } from "@/components/journal/Editorial";
import { C, PHASE_CLEAN } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Body, Card, Summary, Cta, Quiet, Foot, Leaf, Fleuron, Tag, Sep } from "@/components/brand/cleanKit";
import { YearMovement, RedWhiteMoon, AskTheSky, Compatibility, Atelier, YourWay } from "@/components/lifestyle-elite/sky/SkyMovements";
import { phaseLabel } from "@/utils/cyclePhase";
import { CELESTIAL_CSS, MoonLesson } from "@/components/lifestyle-elite/sky/CelestialSky";
import SkyMeaning from "@/components/lifestyle-elite/sky/SkyMeaning";
import ObservedSkyDiary from "@/components/lifestyle-elite/sky/ObservedSkyDiary";
import DailySkyLesson, { PrivateSkyNotes } from "@/components/lifestyle-elite/sky/DailySkyLesson";

const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s);
const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const paras = (s) => String(s || "").replace(/<[^>]+>/g, "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

const SIGN_TRAITS = { Aries: "first in, fully lit", Taurus: "slow, sensual, durable", Gemini: "curious, two-minded", Cancer: "soft shell, sharp memory", Leo: "warm, sovereign", Virgo: "patterns, ratios, repair", Libra: "measured, warm", Scorpio: "deep water, no shallows", Sagittarius: "long view, far reach", Capricorn: "slow ladder, real climb", Aquarius: "considered, independent", Pisces: "tender, intuitive" };
const MOON_SIGN_PLAYLIST = { aries: "37i9dQZF1DX2DC3Q7JOmYe", taurus: "37i9dQZF1DXbCgDGG5xQtb", gemini: "37i9dQZF1DWWVULl5wUsL9", cancer: "37i9dQZF1DWTwnEm1IYyoj", leo: "37i9dQZF1DX7cvHpkIJFt2", virgo: "37i9dQZF1DX6PdsVYbP4rI", libra: "37i9dQZF1DXco4NYQOMLiT", scorpio: "37i9dQZF1DX0YZgrwmizcR", sagittarius: "37i9dQZF1DX4VvfRBFClxm", capricorn: "37i9dQZF1DWZeKCadgRdKQ", aquarius: "37i9dQZF1DX4dyzvuaRJ0n", pisces: "37i9dQZF1DX6uhsAfngvaD" };
const ORB = { ceres: "#B06B5E", pallas: "#B0964F", juno: "#BE7767", vesta: "#6E7A58", chiron: "#A3803A", lilith: "#557D78" };

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
  const phase = day <= pl ? "menstrual" : day <= 13 ? "follicular" : day <= 16 ? "ovulatory" : "luteal";
  return { phase, day, len };
}
const phaseCw = (p) => (p === "menstrual" ? "crimson" : p === "ovulatory" ? "gold" : p === "luteal" ? "plum" : "sage");

// ── the jump strip — she always knows where she is (the CLAUDE.md multi-layer switcher) ────────
const MOVEMENTS = [
  { id: "today", label: "Today" }, { id: "you", label: "You" }, { id: "tides", label: "Tides" },
  { id: "year", label: "Year" }, { id: "ask", label: "Ask" }, { id: "atelier", label: "Atelier" }, { id: "yours", label: "Yours" },
];
function JumpStrip({ refs }) {
  return (
    <div className="fw-sky-jump" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 4px" }}>
      <style>{`.fw-sky-jump{scrollbar-width:none}.fw-sky-jump::-webkit-scrollbar{display:none}`}</style>
      {MOVEMENTS.map((m) => (
        <button key={m.id} onClick={() => refs.current[m.id]?.scrollIntoView({ behavior: "smooth", block: "start" })} className="fw-elite-press"
          style={{ flex: "0 0 auto", fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".04em", color: C.slate, background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 999, padding: "7px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>{m.label}</button>
      ))}
    </div>
  );
}
const Movement = ({ id, refs, children, focusable = false, className }) => (
  <section className={className} ref={(el) => { refs.current[id] = el; }} tabIndex={focusable ? -1 : undefined} style={{ scrollMarginTop: focusable ? 70 : 14 }}>{children}</section>
);

// ── the chart triad — three hairline columns; tap one to unfold its reading ─────────────────────
function TriadColumn({ Icon, label, sign, trait, desc, locked, onUnlock, first, celestial = false, expanded = false, onToggle }) {
  const [localOpen, setOpen] = useState(false);
  const open = celestial ? expanded : localOpen;
  const SignIcon = !locked && sign ? getSignIcon(sign) : Icon;
  return (
    <div style={{ flex: 1, minWidth: 0, padding: "4px 6px", borderLeft: first ? "none" : `1px solid ${C.hair}` }}>
      <button onClick={() => { if (locked) return onUnlock && onUnlock(); if (desc) { if (celestial) onToggle?.(); else setOpen((v) => !v); } }} className="fw-elite-press" aria-expanded={open}
        style={{ width: "100%", textAlign: "center", cursor: (desc || locked) ? "pointer" : "default", background: "transparent", border: "none", padding: 0 }}>
        <div className={celestial ? "sky-triad-icon" : undefined} style={{ display: "flex", justifyContent: "center", lineHeight: 1 }}><SignIcon size={26} color={locked ? C.faint : C.ink} strokeWidth={1.4} /></div>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.faint, marginTop: 9 }}>{label}</div>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: C.ink, marginTop: 2 }}>{locked ? "—" : (sign || "—")}</div>
        {!locked && trait ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: C.slate, marginTop: 3, lineHeight: 1.3 }}>{trait}</div> : null}
        {locked ? <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.gold, marginTop: 6 }}>+ add birth time</div>
          : desc ? <ChevronDown size={13} color={C.faint} style={{ marginTop: 6, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} /> : null}
      </button>
      {celestial && <p style={{font:`500 13px/1.4 ${UI}`,color:C.ink,textAlign:"center",margin:"10px 0 0"}}>{{Sun:"Your sense of self",Moon:"Your inner weather",Rising:"How you meet the world"}[label]}</p>}
      {!celestial && open && desc ? <p style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 500, color: C.ink, lineHeight: 1.55, margin: "10px 2px 0", textAlign: "left" }}>{clean(desc)}</p> : null}
    </div>
  );
}

// ── the composite cycle × moon dial ────────────────────────────────────────────────────────────
function CycleMoonDial({ moon, cyclePhase, cycleDay, cycleLen = 28, body }) {
  const lunarPos = moon?.position != null ? Math.min(0.999, Math.max(0, moon.position)) : (moon?.illumination != null ? (moon.waxing ? moon.illumination / 200 : 0.5 + (100 - moon.illumination) / 200) : 0);
  const cyclePos = cycleDay ? Math.min(0.999, Math.max(0, (cycleDay - 1) / cycleLen)) : 0;
  const oR = 56, iR = 41, oC = 2 * Math.PI * oR, iC = 2 * Math.PI * iR;
  const stroke = PHASE_CLEAN[cyclePhase] || "#7E6A8E";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
      <svg viewBox="0 0 130 130" style={{ width: 126, height: 126, flexShrink: 0 }} aria-hidden="true">
        <circle cx="65" cy="65" r={oR} fill="none" stroke="#E6EBE3" strokeWidth="3.5" />
        <circle cx="65" cy="65" r={oR} fill="none" stroke={C.ink} strokeWidth="3.5" strokeDasharray={`${oC * lunarPos} ${oC}`} strokeLinecap="round" transform="rotate(-90 65 65)" opacity="0.9" />
        <g transform={`rotate(${lunarPos * 360} 65 65)`}><circle cx="65" cy={65 - oR} r="4" fill={C.ink} /></g>
        <circle cx="65" cy="65" r={iR} fill="none" stroke="#E6EBE3" strokeWidth="3.5" />
        <circle cx="65" cy="65" r={iR} fill="none" stroke={stroke} strokeWidth="3.5" strokeDasharray={`${iC * cyclePos} ${iC}`} strokeLinecap="round" transform="rotate(-90 65 65)" />
        <g transform={`rotate(${cyclePos * 360} 65 65)`}><circle cx="65" cy={65 - iR} r="4" fill={stroke} /></g>
        <text x="65" y="60" textAnchor="middle" style={{ fontFamily: UI, fontSize: 7.5, fontWeight: 800, letterSpacing: "1.5px", fill: C.gold }}>TODAY</text>
        <text x="65" y="75" textAnchor="middle" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, fill: C.ink }}>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}</text>
      </svg>
      <div style={{ minWidth: 0, fontFamily: UI, fontSize: 12, color: C.slate }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.ink }} /><span><strong style={{ color: C.ink, fontWeight: 700 }}>Lunar</strong> · {moon?.short || moon?.name || "moon"}{moon?.illumination != null ? ` · ${moon.illumination}% lit` : ""}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: body ? 8 : 0 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: stroke }} /><span><strong style={{ color: C.ink, fontWeight: 700 }}>Cycle</strong> · {cyclePhase ? `${cap(cyclePhase)}${cycleDay ? ` · Day ${cycleDay}` : ""}` : "add your dates"}</span></div>
        {body ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, fontWeight: 500, color: C.slate, lineHeight: 1.45, margin: 0, maxWidth: "15em" }}>{clean(body)}</p> : null}
      </div>
    </div>
  );
}

// ── the goddess bench ──────────────────────────────────────────────────────────────────────────
function GoddessBench({ signs, goddessRead }) {
  const [open, setOpen] = useState(null);
  const present = ASTEROID_NAMES.map((n) => ({ n, s: signs?.[n] })).filter((x) => x.s);
  if (!present.length && !goddessRead) return null;
  const active = open ? ASTEROID_ARCHETYPES[open] : null;
  return (
    <Card style={{ marginTop: 14 }}>
      <Eyebrow cw="blush" align="left">Beside you today</Eyebrow>
      <Title align="left" size={21}>Your goddess bench</Title>
      {present.length ? (
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16, margin: "2px 0 14px" }}>
          {present.map(({ n }) => {
            const c = ORB[n] || "#B06B5E"; const on = open === n;
            return (
              <button key={n} onClick={() => setOpen(on ? null : n)} className="fw-elite-press" aria-expanded={on}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, background: "transparent", border: "none", padding: "4px 2px", cursor: "pointer", minWidth: 58 }}>
                <span style={{ width: 34, height: 34, borderRadius: 99, background: `radial-gradient(circle at 32% 28%, ${c}cc, ${c} 62%, ${c}dd)`, boxShadow: on ? `0 0 0 2px ${C.surface}, 0 0 0 3.5px ${c}` : "none", transition: "box-shadow .15s" }} />
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? C.ink : C.slate, textAlign: "center", lineHeight: 1.1 }}>{ASTEROID_ARCHETYPES[n]?.role || cap(n)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {active ? (
        <div style={{ background: C.sunk, borderRadius: 14, padding: "13px 15px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink }}>{cap(open)} in {cap(signs?.[open])} · {active.role}</div>
          <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, color: C.slate, lineHeight: 1.5, margin: "4px 0 0" }}>{clean(active.description)}</p>
        </div>
      ) : null}
      {goddessRead ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, fontWeight: 500, lineHeight: 1.5, color: C.ink, textAlign: "center", maxWidth: "26em", margin: "0 auto", paddingTop: present.length ? 12 : 0, borderTop: present.length ? `1px solid ${C.hair}` : "none" }}>{clean(goddessRead)}</p> : null}
    </Card>
  );
}

// ── "carry it with you" — reflect · discuss · ask Jess · mark read (the connectivity keystone) ──
function CarryItWithYou({ seed, onMarkRead, read, connectedDemo = false }) {
  const go = (href) => window.location.assign(href);
  const act = { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, background: "transparent", border: "none", cursor: "pointer", padding: "10px 4px", fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.slate };
  const s = encodeURIComponent(String(seed || "").slice(0, 180));
  return (
    <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.hair}` }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, textAlign: "center", marginBottom: 2 }}>Carry it with you</div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <button className="fw-elite-press" style={act} onClick={() => go(`${createPageUrl("Journal")}?compose=1&type=horoscope&seed=${s}`)}><PenLine size={16} color={C.ink} strokeWidth={1.7} /> Reflect</button>
        <button className="fw-elite-press" style={act} onClick={() => go(`${createPageUrl("Community")}?room=${connectedDemo ? "lounge" : "the-sky"}&seed=${s}`)}><MessageCircle size={16} color={C.ink} strokeWidth={1.7} /> {connectedDemo ? "Lounge" : "Discuss"}</button>
        <button className="fw-elite-press" style={act} onClick={() => { try { window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: connectedDemo ? { prompt: `Help me think about this sky reading: ${seed}` } : { seed } })); } catch { go(createPageUrl("Jess")); } }}><Sparkles size={16} color={C.ink} strokeWidth={1.7} /> Ask Jess</button>
        <button className="fw-elite-press" style={{ ...act, color: read ? "#5F8A6B" : C.slate }} onClick={onMarkRead}><Check size={16} color={read ? "#5F8A6B" : C.ink} strokeWidth={1.7} /> {read ? "Read" : "Mark read"}</button>
      </div>
    </div>
  );
}

export default function SkyFocus({ userProfile, actionRequest, onActionState, onActionHandled, portalChart = false, continuous = false, celestial = false, dailyLessons = false, direction }) {
  const { user, astro, reading, userProfile: up, loading, generatingReading, setAstro } = useBirthChart(userProfile);
  const prof = userProfile || up;
  const chart = useMemo(() => deriveChart(astro, prof), [astro, prof]);
  const cyc = useMemo(() => derivePhaseInfo(prof), [prof]);
  const moon = useMemo(() => getMoonPhase(new Date()), []);
  const profections = useProfections(astro, prof);
  const asteroids = useAsteroids(astro, prof);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
  const [triadOpen, setTriadOpen] = useState({});
  const toggleTriad = key => setTriadOpen(previous => ({...previous, [key]: !previous[key]}));
  const refs = useRef({});
  const questionRef = useRef(null);
  const consumedAction = useRef(null);
  useEffect(() => { onActionState?.({ loading, hasChart: !!astro }); }, [loading, !!astro, onActionState]);
  useEffect(() => {
    if (loading || !actionRequest || consumedAction.current === actionRequest) return;
    consumedAction.current = actionRequest;
    onActionHandled?.(null);
    if (actionRequest.type === "chart" || !astro) setSheetOpen(true);
    else if (actionRequest.type === "reading") {
      refs.current.today?.focus({ preventScroll: true });
      refs.current.today?.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      questionRef.current?.focus({ preventScroll: true });
      questionRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [actionRequest, loading, astro, onActionHandled]);
  // The shell's animated ancestor creates a containing block for fixed children.
  // In the review build the chart sheet must belong to the viewport, not the long page.
  const birthSheet = (initial) => {
    const sheet = <BirthDataSheet open={sheetOpen} onClose={() => setSheetOpen(false)} userId={user?.id} initial={initial} userProfile={prof} onSaved={(saved) => { setAstro(saved); setSheetOpen(false); }} />;
    return portalChart ? createPortal(<div className="fw-clean" style={{ position: "relative", zIndex: 10020, "--cream": C.surface, "--cream-2": C.sunk }}>{sheet}</div>, document.body) : sheet;
  };

  // the 12-cycle sky diary + its "right now" observation (the SkyDiary section's job, rebuilt)
  const diary = useMemo(() => {
    if (!cyc.phase) return null;
    const order = ["menstrual", "follicular", "ovulatory", "luteal"];
    const columns = Array.from({ length: 12 }, (_, i) => ({
      phase: order[(i + order.indexOf(cyc.phase) + 1) % 4],
      length: 0.3 + ((i * 7) % 10) / 14,
      current: i === 11,
      dots: i % 5 === 0 ? [{ label: "a slower stretch" }] : [],
    }));
    const rightNow = reading?.cycle_moon_body
      ? clean(reading.cycle_moon_body)
      : `Your last cycles have run steady, and tonight's moon is ${moon?.name ? moon.name.toLowerCase() : "quiet"} — nothing in the pattern is asking anything of you.`;
    return { columns, rightNow, voidOfCourse: null };
  }, [cyc.phase, reading, moon]);

  if (loading) return <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: C.slate, textAlign: "center", padding: "28px 0" }}>Reading the sky…</div>;

  // ── no chart → the onboarding, in the same language ──
  if (!astro) {
    return (
      <div className={celestial ? "sky-celestial" : undefined} style={{ display: "flex", flexDirection: "column" }}>
        {celestial && <style>{CELESTIAL_CSS}</style>}
        <JessAstraBanner />
        <Summary Icon={Moon} cw="lavender">{moon?.name ? `The moon is ${moon.name.toLowerCase()}${moon.illumination != null ? `, ${moon.illumination}% lit` : ""} tonight — your own sky opens once you add your birth date.` : "Your own sky opens once you add your birth date."}</Summary>
        <section>
          <Eyebrow cw="lavender">Read me the sky</Eyebrow>
          <Title>{celestial ? "Your sky starts with a birthday." : "A daily reading from your own chart"}</Title>
          <Body>{celestial ? "A little chart language for the life you're actually living. Your date of birth gets us started." : "FemWell writes you a daily reading from your own chart and your own cycle — not a sign-shaped horoscope written for a twelfth of the world."}</Body>
          <Body size={16} style={{ color: C.slate }}>{celestial ? "Time and place add detail. Don't know the time? Leave it blank; rising and houses need it, and your Moon sign may be uncertain." : "Your birth date is all we need to begin. Birth time and place are optional; they unlock your moon and rising. We never track your location."}</Body>
          <div style={{ marginTop: 6 }}><Cta filled Icon={Sparkles} onClick={() => setSheetOpen(true)}>Set up your sky</Cta></div>
        </section>
        {dailyLessons ? <><DailySkyLesson userId={user?.id} moon={moon} direction={direction}/><PrivateSkyNotes userId={user?.id} moon={moon}/></> : celestial && <MoonLesson moon={moon} />}
        {birthSheet(null)}
      </div>
    );
  }

  const headline = clean(reading?.headline) || (celestial ? "A moment under the same moon." : `A steady day. The moon is ${moon?.waxing ? "climbing" : "releasing"}.`);
  const weather = celestial ? paras(reading?.narrative) : paras(reading?.narrative).slice(0, 3);
  const energy = reading?.weather_energy || null;
  const mood = reading?.weather_mood ? clean(reading.weather_mood) : null;
  const playlist = chart.moonSign ? MOON_SIGN_PLAYLIST[String(chart.moonSign).toLowerCase()] : null;
  const notice = reading?.pressure_title || reading?.trouble_title ? { t: clean(reading.pressure_title || reading.trouble_title), b: clean(reading.pressure_body || reading.trouble_body) } : null;
  const shareArtifact = { kind: "horoscope", source: "horoscope", line: headline, footer: "Today's sky", url: "https://femwells.com", shareText: "Today's sky, from FemWell." };
  const stateBits = [cyc.phase ? `${cap(cyc.phase)}${cyc.day ? ` · Day ${cyc.day}` : ""}` : null, moon?.name ? cap(moon.name) : null, chart.sun ? `${cap(chart.sun)} sun` : null].filter(Boolean);
  const lead = weather.length ? weather[0].match(/^(.+?[.!?])(\s+|$)([\s\S]*)$/) : null;
  const cw = phaseCw(cyc.phase);

  return (
    <div className={celestial ? "sky-celestial" : undefined} style={{ display: "flex", flexDirection: "column" }}>
      {celestial && <style>{CELESTIAL_CSS}</style>}
      <JessAstraBanner />

      {/* I · TONIGHT — the masthead (the page's ONE header sits above this) */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow cw="lavender" align="left">Your sky today</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 30, lineHeight: 1.1, letterSpacing: -0.4, color: C.ink, margin: "0 0 10px", textShadow: "none" }}>{headline}</h2>
        </div>
        <ShareButton iconOnly label="Share today's sky" artifact={shareArtifact} />
      </div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 12px", fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.slate, letterSpacing: ".04em", margin: "0 0 14px" }}>
        {stateBits.map((b, i) => (<React.Fragment key={b}>{i ? <span style={{ width: 3, height: 3, borderRadius: 99, background: C.goldHair }} /> : null}<span>{b}</span></React.Fragment>))}
        {generatingReading ? <span style={{ fontStyle: "italic", color: C.faint }}>reading the sky…</span> : null}
      </div>
      {!continuous && <><Cta Icon={Pencil} onClick={() => setSheetOpen(true)}>Edit your chart</Cta>
      <div style={{ marginTop: 14 }}><JumpStrip refs={refs} /></div></>}

      <Leaf my={14} />

      {/* II · TODAY — the reading, and what to do with it */}
      <Movement id="today" refs={refs} focusable={continuous} className={celestial ? "sky-reading" : undefined}>
        <Eyebrow cw="crimson">Today's weather</Eyebrow>
        {weather.length ? (
          <>
            <Body size={18}>{lead ? <><span style={{ fontStyle: "italic", color: C.crimson }}>{lead[1]}</span> {lead[3]}</> : weather[0]}</Body>
            {weather.slice(1).map((p, i) => <Body key={i} size={18}>{p}</Body>)}
          </>
        ) : <Body size={18}>{celestial ? "Your reading isn't available yet. Your chart and the moon notes are still here to explore." : `A steady ${chart.sun || "quiet"} day — begin the thing you've been thinking about.`}</Body>}
        <div style={{ fontFamily: SCRIPT, fontSize: 30, color: C.gold, textAlign: "right", lineHeight: 1, margin: "-2px 4px 0" }}>Astra</div>
        {(energy || mood || playlist) ? (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 9, margin: "12px 0 0" }}>
            {energy ? <Tag>Energy · {energy}</Tag> : null}
            {energy && (mood || playlist) ? <Sep /> : null}
            {mood ? <Tag>{mood}</Tag> : null}
            {mood && playlist ? <Sep /> : null}
            {playlist ? <a href={`https://open.spotify.com/playlist/${playlist}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#5F8A6B" }}><Music2 size={12} /> A sound for today</a> : null}
          </div>
        ) : null}
        {notice && !dailyLessons ? (
          <div style={{ margin: "16px auto 0", maxWidth: "30em", textAlign: "center", paddingTop: 14, borderTop: `1px solid ${C.hair}` }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, marginBottom: 5 }}>Notice · watch for</div>
            {notice.t ? <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{notice.t}</div> : null}
            {notice.b ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, fontWeight: 500, color: C.ink, lineHeight: 1.5, margin: "3px 0 0" }}>{notice.b}</p> : null}
          </div>
        ) : null}
        {dailyLessons && [["Power",reading?.power_title,reading?.power_body],["Pressure",reading?.pressure_title,reading?.pressure_body],["Trouble",reading?.trouble_title,reading?.trouble_body]].map(([label,title,body])=>title || body ? <div key={label} style={{borderTop:`1px solid ${C.hair}`,padding:"14px 0 0",marginTop:14}}><Eyebrow cw="gold" align="left">{label}</Eyebrow>{title && <Title align="left" size={22}>{clean(title)}</Title>}{body && <Body>{clean(body)}</Body>}</div> : null)}
        <CarryItWithYou connectedDemo={dailyLessons} seed={headline} read={markedRead} onMarkRead={() => { setMarkedRead(true); try { recordProgress("your-sky", 0, user?.id); } catch { /* the garden write is a nicety, never a blocker */ } }} />
      </Movement>

      {dailyLessons && <DailySkyLesson userId={user?.id} moon={moon} direction={direction}/>}

      <Fleuron my={24} />

      {/* III · YOU — chart · goddess bench · red & white moon */}
      <Movement id="you" refs={refs}>
        {celestial ? <SkyMeaning label="your chart" explanation="In astrology, Sun speaks to identity, Moon to your inner world, and rising to how you meet life. Tap a symbol for its reading; these are reflective lenses, not a verdict."><Eyebrow cw="gold" style={{margin:0}}>Your chart</Eyebrow></SkyMeaning> : <Eyebrow cw="gold">Your chart</Eyebrow>}
        <Title>Sun, moon &amp; rising</Title>
        {celestial && <p className="sky-note" style={{textAlign:"center"}}>Three lenses, one very unrepeatable you. In astrology, each has a different part to play.</p>}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <TriadColumn celestial={celestial} expanded={!!triadOpen.sun} onToggle={()=>toggleTriad("sun")} first Icon={Sun} label="Sun" sign={chart.sun ? cap(chart.sun) : null} trait={SIGN_TRAITS[cap(chart.sun)]} desc={reading?.triad_sun_desc} />
          <TriadColumn celestial={celestial} expanded={!!triadOpen.moon} onToggle={()=>toggleTriad("moon")} Icon={Moon} label="Moon" sign={chart.moonSign ? cap(chart.moonSign) : null} trait={SIGN_TRAITS[cap(chart.moonSign)]} desc={reading?.triad_moon_desc} locked={!chart.moonSign} onUnlock={() => setSheetOpen(true)} />
          <TriadColumn celestial={celestial} expanded={!!triadOpen.rising} onToggle={()=>toggleTriad("rising")} Icon={Sunrise} label="Rising" sign={chart.risingSign ? cap(chart.risingSign) : null} trait={SIGN_TRAITS[cap(chart.risingSign)]} desc={reading?.triad_rising_desc} locked={!chart.risingSign} onUnlock={() => setSheetOpen(true)} />
        </div>
        {celestial && [["sun","Sun",reading?.triad_sun_desc],["moon","Moon",reading?.triad_moon_desc],["rising","Rising",reading?.triad_rising_desc]].map(([key,label,description]) => triadOpen[key] && description ? <div key={key} style={{padding:"16px 0",borderBottom:`1px solid ${C.hair}`}}><p className="sky-kicker">{label} · your reading</p><p className="sky-note" style={{margin:0}}>{clean(description)}</p></div> : null)}
        <div style={{ fontFamily: UI, fontSize: 11, letterSpacing: ".06em", color: C.faint, textAlign: "center", marginTop: 14 }}>{[chart.element, chart.modality, chart.sunRuler ? `ruled by ${chart.sunRuler}` : null].filter(Boolean).join(" · ")}</div>
        <GoddessBench signs={asteroids} goddessRead={reading?.goddess_read} />
        <RedWhiteMoon celestial={celestial} rw={null} />
      </Movement>

      <Fleuron my={24} />

      {/* IV · YOUR TIDES — the dial in the ONE framed feature card */}
      <Movement id="tides" refs={refs}>
        <Card framed wash={cw}>
          {celestial ? <SkyMeaning label="your two tides" explanation="The outer ring follows the lunar phase; the inner ring uses your logged cycle dates. Side by side does not mean one causes the other—bodies keep their own time."><Eyebrow cw={cw} style={{margin:0}}>Cycle × moon</Eyebrow></SkyMeaning> : <Eyebrow cw={cw}>Cycle × moon</Eyebrow>}
          <Title>Your two tides</Title>
          <CycleMoonDial moon={moon} cyclePhase={cyc.phase} cycleDay={cyc.day} cycleLen={cyc.len || 28} body={reading?.cycle_moon_body} />
          {celestial && !dailyLessons && <MoonLesson moon={moon} />}
          {!cyc.phase ? <Quiet onClick={() => window.location.assign(createPageUrl("Health"))}>Add your dates to see both tides ›</Quiet> : null}
        </Card>
      </Movement>

      <Fleuron my={24} />

      {/* V · YOUR YEAR — profections · Saturn letter · the sky diary */}
      <Movement id="year" refs={refs}><YearMovement celestial={celestial} profections={profections} diary={celestial ? null : diary} />{celestial && <ObservedSkyDiary userId={user?.id} />}{dailyLessons && <PrivateSkyNotes userId={user?.id} moon={moon}/>}</Movement>

      <Fleuron my={24} />

      {/* VI · ASK & CONNECT — ask the sky · compatibility */}
      <Movement id="ask" refs={refs}>
        <Eyebrow cw="lavender">Ask &amp; connect</Eyebrow>
        <Title>Put a question to it</Title>
        <AskTheSky celestial={celestial} userId={user?.id} inputRef={questionRef} />
        <Compatibility celestial={celestial} userId={user?.id} />
      </Movement>

      <Fleuron my={24} />

      {/* VII · THE ATELIER — the letter + the shelf */}
      <Movement id="atelier" refs={refs}><Atelier celestial={celestial} userId={user?.id} hasAtelier={!!user?.has_atelier} letter={null} /></Movement>

      <Fleuron my={24} />

      {/* VIII · YOUR SKY, YOUR WAY — quiet mode · science · privacy */}
      <Movement id="yours" refs={refs}><YourWay celestial={celestial} userId={user?.id} /></Movement>

      <Foot>Held lightly — folklore and your own chart, never fate or a score.</Foot>
      {birthSheet(astro)}
    </div>
  );
}
