// SkyFocus — the horoscope, re-authored in the CLEAN & CLASSY language (BRAND_IDENTITY §2.7,
// ✅ AGREED 2026-09-21) with FULL feature parity to the original 18-element HoroscopeTab.
// Composed like an editorial spread — alabaster ground, white surfaces, neutral ink/slate, air —
// with the brand bible present, not faint (§0.5): her PHASE FLOWER as the hero (the real
// RichBloomV2 engine), the ONE carved crimson heart flanked by the HeaderFlourish, LeafDivider +
// FleuronDivider between sections, a BrandFrame feature card with a colourway wash, and a
// meaning-rosette beside every card eyebrow (Halli: "keep per card floral details").
// Reuses the real data/logic (useBirthChart · astrology utils · useProfections · useAsteroids ·
// ShareButton · BirthDataSheet) — nothing re-derived, nothing dropped.
//
// CTA: ONE — "Edit your chart" (the redundant "Open your sky" is gone; Share is the masthead icon).
// BATCH 1 (designed): Hero · Triad (tap-expand) · Today's weather (+ Spotify + notice/watch) ·
//   Cycle-moon dial · Goddess bench. BATCHES 2-4 kept below at prior depth (re-authored next).
import React, { useMemo, useState } from "react";
import { Moon, Sun, Sunrise, Sparkles, Music2, Pencil, ChevronDown } from "lucide-react";
import { getSunSign, getSunDegree, getRulingPlanet, getElement, getModality, getMoonPhase } from "@/utils/astrology";
import { getSignIcon } from "@/lib/astrology/glyphs";
import { useBirthChart } from "@/components/horoscope/hooks/useBirthChart";
import useProfections from "@/components/horoscope/hooks/useProfections";
import useAsteroids from "@/components/horoscope/hooks/useAsteroids";
import { ASTEROID_NAMES, ASTEROID_ARCHETYPES } from "@/lib/astrology/asteroids";
import BirthDataSheet from "@/components/horoscope/BirthDataSheet";
import ShareButton from "@/components/share/ShareButton";
import { SERIF, UI, SCRIPT, Heart } from "@/components/journal/Editorial";
import { cwOf, Bouquet, HeaderFlourish, LeafDivider, FleuronDivider, BrandFrame, MeaningRosette } from "@/components/brand/flora";
import { C, PHASE_CLEAN, CLEAN_SHADOW, CLEAN_CSS } from "@/components/brand/cleanTokens";
import { phaseLabel } from "@/utils/cyclePhase";

const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s);
const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const paras = (s) => String(s || "").replace(/<[^>]+>/g, "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

const SIGN_TRAITS = { Aries: "first in, fully lit", Taurus: "slow, sensual, durable", Gemini: "curious, two-minded", Cancer: "soft shell, sharp memory", Leo: "warm, sovereign", Virgo: "patterns, ratios, repair", Libra: "measured, warm", Scorpio: "deep water, no shallows", Sagittarius: "long view, far reach", Capricorn: "slow ladder, real climb", Aquarius: "considered, independent", Pisces: "tender, intuitive" };
const MOON_SIGN_PLAYLIST = { aries: "37i9dQZF1DX2DC3Q7JOmYe", taurus: "37i9dQZF1DXbCgDGG5xQtb", gemini: "37i9dQZF1DWWVULl5wUsL9", cancer: "37i9dQZF1DWTwnEm1IYyoj", leo: "37i9dQZF1DX7cvHpkIJFt2", virgo: "37i9dQZF1DX6PdsVYbP4rI", libra: "37i9dQZF1DXco4NYQOMLiT", scorpio: "37i9dQZF1DX0YZgrwmizcR", sagittarius: "37i9dQZF1DX4VvfRBFClxm", capricorn: "37i9dQZF1DWZeKCadgRdKQ", aquarius: "37i9dQZF1DX4dyzvuaRJ0n", pisces: "37i9dQZF1DX6uhsAfngvaD" };
const ORB = { ceres: "#B06B5E", pallas: "#B0964F", juno: "#BE7767", vesta: "#6E7A58", chiron: "#A3803A", lilith: "#557D78" };
// her phase flower + its colourway (§5.1: menstrual→poppy · follicular→snowdrop · ovulatory→sunflower · luteal→dahlia)
const PHASE_FLOWER = { menstrual: { form: "poppy", cw: "crimson" }, follicular: { form: "snowdrop", cw: "sage" }, ovulatory: { form: "sunflower", cw: "gold" }, luteal: { form: "dahlia", cw: "plum" } };
const NO_PHASE_FLOWER = { form: "peony", cw: "lavender" };

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

// ── the section eyebrow — gold, tracked, with its colourway meaning-rosette (per-card floral) ──
function Eyebrow({ cw = "gold", children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, margin: "0 0 9px" }}>
      <MeaningRosette color={cwOf(cw).petal} centre={cw === "gold" ? C.ink : C.gold} /> {children}
    </div>
  );
}
const Title = ({ children }) => <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 24, letterSpacing: -0.2, color: C.ink, margin: "0 0 15px", textAlign: "center" }}>{children}</h3>;
const Body = ({ children, size = 19, style }) => <p style={{ fontFamily: SERIF, fontSize: size, color: C.ink, lineHeight: 1.72, margin: "0 0 12px", ...style }}>{children}</p>;
const Tag = ({ children, tone }) => <span style={{ fontFamily: UI, fontSize: 11, fontWeight: tone ? 700 : 600, color: tone || C.slate, letterSpacing: ".03em" }}>{children}</span>;
const Sep = () => <span style={{ fontFamily: UI, fontSize: 11, color: C.faint }}>·</span>;

// ── §2 TRIAD — three columns split by fine hairlines (no boxes); tap a column to unfold ─────────
function TriadColumn({ Icon, label, sign, trait, desc, locked, onUnlock, first }) {
  const [open, setOpen] = useState(false);
  const tappable = !!(desc || locked);
  // the sign's Lucide icon (the codebase retired unicode zodiac glyphs — they render as emoji);
  // the body icon (sun/moon/sunrise) stands in while the sign is locked.
  const SignIcon = !locked && sign ? getSignIcon(sign) : Icon;
  return (
    <div style={{ flex: 1, minWidth: 0, position: "relative", padding: "4px 6px", borderLeft: first ? "none" : `1px solid ${C.hair}` }}>
      <button onClick={() => { if (locked) return onUnlock && onUnlock(); if (desc) setOpen((v) => !v); }} className="fw-elite-press" aria-expanded={open}
        style={{ width: "100%", textAlign: "center", cursor: tappable ? "pointer" : "default", background: "transparent", border: "none", padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", lineHeight: 1 }}><SignIcon size={28} color={locked ? C.faint : C.ink} strokeWidth={1.4} /></div>
        <div style={{ fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: C.faint, marginTop: 10 }}>{label}</div>
        <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: C.ink, marginTop: 2 }}>{locked ? "—" : (sign || "—")}</div>
        {!locked && trait ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: C.slate, marginTop: 3, lineHeight: 1.3 }}>{trait}</div> : null}
        {locked ? <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: C.gold, marginTop: 6, letterSpacing: ".04em" }}>+ add birth time</div>
          : desc ? <ChevronDown size={13} color={C.faint} style={{ marginTop: 6, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} /> : null}
      </button>
      {open && desc ? <p style={{ fontFamily: SERIF, fontSize: 14.5, color: C.ink, lineHeight: 1.55, margin: "10px 2px 0", textAlign: "left" }}>{clean(desc)}</p> : null}
    </div>
  );
}

// ── §4 CYCLE-MOON DIAL — the composite SVG dial, thin rings, clean ────────────────────────────
function CycleMoonDial({ moon, cyclePhase, cycleDay, cycleLen = 28, body }) {
  const lunarPos = moon?.position != null ? Math.min(0.999, Math.max(0, moon.position)) : (moon?.illumination != null ? (moon.waxing ? moon.illumination / 200 : 0.5 + (100 - moon.illumination) / 200) : 0);
  const cyclePos = cycleDay ? Math.min(0.999, Math.max(0, (cycleDay - 1) / cycleLen)) : 0;
  const outerR = 56, innerR = 41; const outerC = 2 * Math.PI * outerR, innerC = 2 * Math.PI * innerR;
  const cycleStroke = PHASE_CLEAN[cyclePhase] || "#7E6A8E";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <svg viewBox="0 0 130 130" style={{ width: 126, height: 126, flexShrink: 0 }} aria-hidden="true">
        <circle cx="65" cy="65" r={outerR} fill="none" stroke="#E6EBE3" strokeWidth="3.5" />
        <circle cx="65" cy="65" r={outerR} fill="none" stroke={C.ink} strokeWidth="3.5" strokeDasharray={`${outerC * lunarPos} ${outerC}`} strokeLinecap="round" transform="rotate(-90 65 65)" opacity="0.9" />
        <g transform={`rotate(${lunarPos * 360} 65 65)`}><circle cx="65" cy={65 - outerR} r="4" fill={C.ink} /></g>
        <circle cx="65" cy="65" r={innerR} fill="none" stroke="#E6EBE3" strokeWidth="3.5" />
        <circle cx="65" cy="65" r={innerR} fill="none" stroke={cycleStroke} strokeWidth="3.5" strokeDasharray={`${innerC * cyclePos} ${innerC}`} strokeLinecap="round" transform="rotate(-90 65 65)" />
        <g transform={`rotate(${cyclePos * 360} 65 65)`}><circle cx="65" cy={65 - innerR} r="4" fill={cycleStroke} /></g>
        <text x="65" y="60" textAnchor="middle" style={{ fontFamily: UI, fontSize: 7.5, fontWeight: 800, letterSpacing: "1.5px", fill: C.gold }}>TODAY</text>
        <text x="65" y="75" textAnchor="middle" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, fill: C.ink }}>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}</text>
      </svg>
      <div style={{ minWidth: 0, fontFamily: UI, fontSize: 12, color: C.slate }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.ink }} /><span><strong style={{ color: C.ink, fontWeight: 700 }}>Lunar</strong> · {moon?.short || moon?.name || "moon"}{moon?.illumination != null ? ` · ${moon.illumination}% lit` : ""}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: body ? 8 : 0 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: cycleStroke }} /><span><strong style={{ color: C.ink, fontWeight: 700 }}>Cycle</strong> · {cyclePhase ? `${cap(cyclePhase)}${cycleDay ? ` · Day ${cycleDay}` : ""}` : "add your dates"}</span></div>
        {body ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: C.slate, lineHeight: 1.45, margin: 0, maxWidth: "15em" }}>{clean(body)}</p> : null}
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
    <section>
      <Eyebrow cw="blush">Beside you today</Eyebrow>
      <Title>Your goddess bench</Title>
      {present.length ? (
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 18, margin: "2px 0 16px" }}>
          {present.map(({ n, s }) => {
            const c = ORB[n] || "#B06B5E"; const on = open === n;
            return (
              <button key={n} onClick={() => setOpen(on ? null : n)} className="fw-elite-press" aria-expanded={on} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: "4px 2px", cursor: "pointer", minWidth: 62 }}>
                <span style={{ width: 34, height: 34, borderRadius: 99, background: `radial-gradient(circle at 32% 28%, ${c}cc, ${c} 62%, ${c}dd)`, boxShadow: on ? `0 0 0 2px ${C.surface}, 0 0 0 3.5px ${c}` : "none", transition: "box-shadow .15s" }} />
                <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: on ? C.ink : C.slate, textAlign: "center", lineHeight: 1.1 }}>{ASTEROID_ARCHETYPES[n]?.role || cap(n)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {active ? (
        <div style={{ background: C.surface, borderRadius: 16, padding: "14px 16px", marginBottom: 12, boxShadow: CLEAN_SHADOW, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink }}>{cap(open)} in {cap(signs?.[open])} · {active.role}</div>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: C.slate, lineHeight: 1.5, margin: "4px 0 0" }}>{clean(active.description)}</p>
        </div>
      ) : null}
      {goddessRead ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: C.ink, textAlign: "center", maxWidth: "26em", margin: "0 auto", paddingTop: present.length ? 14 : 0, borderTop: present.length ? `1px solid ${C.hair}` : "none" }}>{clean(goddessRead)}</p> : null}
    </section>
  );
}

// the ONE CTA — slim, outlined, letter-spaced (restraint)
function Cta({ onClick, Icon = Pencil, children }) {
  return (
    <button onClick={onClick} className="fw-elite-press" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", minHeight: 46, padding: "13px", borderRadius: 13, background: "transparent", border: `1px solid ${C.ink}`, color: C.ink, fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" }}>
      <Icon size={14} color={C.ink} strokeWidth={1.7} /> {children}
    </button>
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
  const flower = PHASE_FLOWER[cyc.phase] || NO_PHASE_FLOWER;
  const fcw = cwOf(flower.cw);

  if (loading) return <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: C.slate, textAlign: "center", padding: "28px 0" }}>Reading the sky…</div>;

  // the masthead (shared by onboarding + the reading): eyebrow + rule · share icon · her phase flower
  const Masthead = ({ headline, shareArtifact }) => (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}><span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: C.gold }}>Your sky</span><span style={{ width: 34, height: 1, background: C.goldHair }} /></div>
        {shareArtifact ? <ShareButton iconOnly label="Share today's sky" artifact={shareArtifact} /> : null}
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "0 0 2px", position: "relative" }}>
        <span aria-hidden style={{ position: "absolute", inset: "14% 24% 18%", borderRadius: "50%", background: `radial-gradient(circle, ${fcw.petal}3a 0%, ${fcw.petal}10 58%, transparent 100%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }} className="fwc-anim"><Bouquet size={200} idx={`sky-${flower.form}`} items={[
          { form: flower.form, colorway: flower.cw, scale: 1.0, dx: 0, dy: -0.02, rot: 0 },
          { form: flower.form, colorway: flower.cw, scale: 0.8, dx: -0.27, dy: 0.13, rot: -18 },
          { form: flower.form, colorway: flower.cw, scale: 0.76, dx: 0.27, dy: 0.15, rot: 16 },
        ]} /></div>
      </div>
      <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 36, lineHeight: 1.08, letterSpacing: -0.5, color: C.ink, margin: "0 0 10px", textAlign: "center" }}>{headline}</h2>
      <div style={{ margin: "0 0 14px" }}><HeaderFlourish color={C.gold} w={26} opacity={0.8} gap={10}><Heart size={17} /></HeaderFlourish></div>
    </>
  );

  // ── no chart → cream onboarding (same language) ──
  if (!astro) {
    return (
      <div className="fw-clean" style={{ display: "flex", flexDirection: "column" }}>
        <style>{CLEAN_CSS}</style>
        <Masthead headline={`The moon is ${moon?.name ? moon.name.toLowerCase() : "in the sky"}.`} />
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: C.slate, textAlign: "center", lineHeight: 1.5, margin: "0 0 22px" }}>{moon?.illumination != null ? `${moon.illumination}% lit${moon.waxing ? " and climbing — a stretch for building, not finishing" : " and releasing — a stretch for letting go"}.` : "Held lightly, just for the comfort of it."}</p>
        <LeafDivider color={C.gold} my={4} />
        <section style={{ margin: "22px 0 0", textAlign: "center" }}>
          <Eyebrow cw="lavender">Read me the sky</Eyebrow>
          <Title>A daily reading from your own chart</Title>
          <Body style={{ textAlign: "left" }}>FemWell writes you a daily reading from your own chart and your own cycle — not a sign-shaped horoscope written for a twelfth of the world.</Body>
          <Body size={16.5} style={{ color: C.slate, textAlign: "left" }}>Your birth date is all we need to begin. Birth time and place are optional; they unlock your moon and rising. We never track your location.</Body>
          <div style={{ marginTop: 6 }}><Cta onClick={() => setSheetOpen(true)} Icon={Sparkles}>Set up your sky</Cta></div>
        </section>
        <BirthDataSheet open={sheetOpen} onClose={() => setSheetOpen(false)} userId={user?.id} initial={null} userProfile={prof} onSaved={(saved) => { setAstro(saved); setSheetOpen(false); }} />
      </div>
    );
  }

  const heroHeadline = clean(reading?.headline) || `A steady day. The moon is ${moon?.waxing ? "climbing" : "releasing"}.`;
  const weather = paras(reading?.narrative).slice(0, 3);
  const energy = reading?.weather_energy || null;
  const mood = reading?.weather_mood ? clean(reading.weather_mood) : null;
  const playlist = chart.moonSign ? MOON_SIGN_PLAYLIST[String(chart.moonSign).toLowerCase()] : null;
  const notice = reading?.pressure_title || reading?.trouble_title ? { t: clean(reading.pressure_title || reading.trouble_title), b: clean(reading.pressure_body || reading.trouble_body) } : null;
  const shareArtifact = { kind: "horoscope", source: "horoscope", line: heroHeadline, footer: "Today's sky", url: "https://femwells.com", shareText: "Today's sky, from FemWell." };
  const stateBits = [cyc.phase ? `${cap(cyc.phase)}${cyc.day ? ` · Day ${cyc.day}` : ""}` : null, moon?.name ? cap(moon.name) : null, chart.sun ? `${cap(chart.sun)} sun` : null].filter(Boolean);
  // split the first sentence of the reading as the italic crimson lead-in
  const lead = weather.length ? weather[0].match(/^(.+?[.!?])(\s+|$)([\s\S]*)$/) : null;

  return (
    <div className="fw-clean" style={{ display: "flex", flexDirection: "column" }}>
      <style>{CLEAN_CSS}</style>
      {/* §1 HERO — masthead: eyebrow · share icon · her phase flower · headline · the ONE heart · state · ONE CTA */}
      <Masthead headline={heroHeadline} shareArtifact={shareArtifact} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "6px 12px", fontFamily: UI, fontSize: 11, fontWeight: 600, color: C.slate, letterSpacing: ".04em", margin: "0 0 20px" }}>
        {stateBits.map((b, i) => (<React.Fragment key={b}>{i ? <span style={{ width: 3, height: 3, borderRadius: 99, background: C.goldHair }} /> : null}<span>{b}</span></React.Fragment>))}
        {generatingReading ? <span style={{ fontStyle: "italic", color: C.faint }}>reading the sky…</span> : null}
      </div>
      <Cta onClick={() => setSheetOpen(true)}>Edit your chart</Cta>

      <LeafDivider color={C.gold} my={24} />

      {/* §3 TODAY'S WEATHER — the editorial reading, Astra's signature, energy/mood/sound, notice */}
      <section>
        <Eyebrow cw="crimson">Today's weather</Eyebrow>
        {weather.length ? (
          <>
            <Body>{lead ? <><span style={{ fontStyle: "italic", color: C.crimson }}>{lead[1]}</span> {lead[3]}</> : weather[0]}</Body>
            {weather.slice(1).map((p, i) => <Body key={i}>{p}</Body>)}
          </>
        ) : <Body>{`A steady ${chart.sun || "quiet"} day — begin the thing you've been thinking about.`}</Body>}
        <div style={{ fontFamily: SCRIPT, fontSize: 30, color: C.gold, textAlign: "right", lineHeight: 1, margin: "-2px 4px 0" }}>Astra</div>
        {(energy || mood || playlist) ? (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 9, margin: "12px 0 0" }}>
            {energy ? <Tag>Energy · {energy}</Tag> : null}
            {energy && (mood || playlist) ? <Sep /> : null}
            {mood ? <Tag>{mood}</Tag> : null}
            {mood && playlist ? <Sep /> : null}
            {playlist ? <a href={`https://open.spotify.com/playlist/${playlist}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", fontFamily: UI, fontSize: 11, fontWeight: 700, color: PHASE_CLEAN.follicular, letterSpacing: ".03em" }}><Music2 size={12} /> A sound for today</a> : null}
          </div>
        ) : null}
        {notice ? (
          <div style={{ margin: "18px auto 0", maxWidth: "30em", textAlign: "center", paddingTop: 14, borderTop: `1px solid ${C.hair}` }}>
            <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 5 }}>Notice · watch for</div>
            {notice.t ? <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{notice.t}</div> : null}
            {notice.b ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: C.ink, lineHeight: 1.5, margin: "3px 0 0" }}>{notice.b}</p> : null}
          </div>
        ) : null}
      </section>

      <FleuronDivider color={C.gold} my={24} />

      {/* §2 TRIAD — the chart as three hairline-split columns; tap to unfold */}
      <section>
        <Eyebrow cw="gold">Your chart</Eyebrow>
        <Title>Sun, moon &amp; rising</Title>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <TriadColumn first Icon={Sun} label="Sun" sign={chart.sun ? cap(chart.sun) : null} trait={SIGN_TRAITS[cap(chart.sun)]} desc={reading?.triad_sun_desc} />
          <TriadColumn Icon={Moon} label="Moon" sign={chart.moonSign ? cap(chart.moonSign) : null} trait={SIGN_TRAITS[cap(chart.moonSign)]} desc={reading?.triad_moon_desc} locked={!chart.moonSign} onUnlock={() => setSheetOpen(true)} />
          <TriadColumn Icon={Sunrise} label="Rising" sign={chart.risingSign ? cap(chart.risingSign) : null} trait={SIGN_TRAITS[cap(chart.risingSign)]} desc={reading?.triad_rising_desc} locked={!chart.risingSign} onUnlock={() => setSheetOpen(true)} />
        </div>
        <div style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: ".06em", color: C.faint, textAlign: "center", marginTop: 16 }}>{[chart.element, chart.modality, chart.sunRuler ? `ruled by ${chart.sunRuler}` : null].filter(Boolean).join(" · ")}</div>
      </section>

      {/* §4 CYCLE × MOON — the feature card: BrandFrame corner sprigs + her phase colourway wash */}
      <div style={{ margin: "28px 0 0" }}>
        <BrandFrame color={C.gold} opacity={0.7} size={44} style={{ background: `linear-gradient(165deg, ${C.surface} 0%, ${fcw.petal}14 100%)`, border: "none", borderRadius: 22, padding: "26px 22px 24px", boxShadow: CLEAN_SHADOW }}>
          <Eyebrow cw={flower.cw}>Cycle × moon</Eyebrow>
          <Title>Your two tides</Title>
          <CycleMoonDial moon={moon} cyclePhase={cyc.phase} cycleDay={cyc.day} cycleLen={cyc.len || 28} body={reading?.cycle_moon_body} />
        </BrandFrame>
      </div>

      {/* §2.5 GODDESS BENCH */}
      <div style={{ margin: "28px 0 0" }}><GoddessBench signs={asteroids} goddessRead={reading?.goddess_read} /></div>

      {/* ── BATCHES 2–4 (kept at prior depth so nothing regresses; being re-authored next) ── */}
      <div style={{ margin: "28px 0 0" }}>
        <Eyebrow cw="plum">Your longer arc</Eyebrow>
        <Title>The house your year is in</Title>
        <Body size={17} style={{ textAlign: "center", color: C.slate }}>{profections?.ready && profections.profection
          ? `You're in a ${profections.profection.house_label || `House ${profections.profection.house}`} year${profections.profection.theme ? ` — ${clean(profections.profection.theme)}` : ""}.`
          : "Annual profections move the emphasis one house each birthday — add your birth date and your year's house opens here."}</Body>
      </div>

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: C.faint, textAlign: "center", lineHeight: 1.5, margin: "16px 16px 0" }}>Held lightly — folklore and your own chart, never fate or a score. Your birth details stay yours; we never track your location.<br /><span style={{ opacity: 0.8 }}>Compatibility, ask-the-sky, your diary, the year &amp; moon rituals are being re-authored into this language next.</span></p>

      <BirthDataSheet open={sheetOpen} onClose={() => setSheetOpen(false)} userId={user?.id} initial={astro} userProfile={prof} onSaved={(saved) => { setAstro(saved); setSheetOpen(false); }} />
    </div>
  );
}
