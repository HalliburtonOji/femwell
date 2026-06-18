// TodayDemo6 — "Your day", the SYNTHESISED Today (garden + cycle + actionable in one).
// PREVIEW route only (reachable via IDEAS → Brand & UX → Previews). The LIVE /Today is untouched
// until Halli says lock+swap. Conforms to claude-state/BRAND_IDENTITY.md.
//
// WIRED TO REAL DATA (all reads guarded + fail-open; the hang trap honoured — nothing awaited on a
// render path can wedge the page): cycle phase/day from UserProfile (computeCycleDay), today's
// meals + water (nutritionToday), journal state, recent symptoms, and the user's real companion
// bloom. The in-place log sheets WRITE for real (guarded, optimistic, fail-open) + tend the garden.
// Graceful empty/partial states everywhere (the test user's data may be sparse).
//
// Refinements: (1) real data; (2) Jess day-paragraph synthesised from real signals + refresh;
// (3) one-time first-open "bloom grows" ceremony; (4) the deck remembers the last-opened card;
// (5) the calendar peeks a day on tap + swipes month-to-month. Calm by default.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay, phaseForDay } from "@/hooks/useCycleDay";
import { nutritionToday } from "@/utils/nutritionSummary";
import { communityHash } from "@/components/community/communityAnon";
import { computeCooling } from "@/components/journal/echo/echoSafety";
import { Bloom } from "@/components/nurture/NurtureGarden";
import { RichBloomV2, SwayBloom, fingerprintColourway, floraKeyframes, CardCorner, VineMotifV2, LeafDivider, SprigDivider, FleuronDivider, FlowerGlyph, Butterfly, cwOf, lighten } from "@/components/brand/flora";
import { qotdForDay } from "@/components/community/communityConfig";

import { FORM_LIST, getCompanion, tendCompanion, tendedToday, loadCompanionState } from "@/components/nurture/companion";
import { useScrollLock } from "@/utils/useScrollLock";
// The per-section spine is the APPROVED "Option 2" single smart slider: ONE card per app
// section, the Journal slider's card size (CARD_W 365 · GAP 14, lifted verbatim), a segmented
// section rail (which doubles as the slider's jump-to), ‹ • • › nav, and an INLINE action on
// every card. Each card carries a REAL, glanceable synthesis of the user's own data (Health =
// a digestible read on recent symptoms × phase, Nutrition = today's intake snapshot, etc.) —
// not a generic prompt. The rest of Today (hero, day-paragraph, Your-Day, cycle, suggestions,
// closing) is unchanged.
import JumpToButton from "@/components/layout/JumpToButton";
import {
  PenLine, Salad, Users, Stethoscope, Sparkles, BookOpen, Feather, Headphones, Star, CalendarDays,
  Activity, Sprout, TrendingUp, Leaf, Moon, Footprints, Droplet, Coffee, Check, Plus, ChevronRight,
  ChevronLeft, Sun, Sunrise, Sunset, X, Send, Minus, Search, Mic, Camera, ScanLine, Clock,
  CalendarHeart, RefreshCw, Play, Pause, Grid2x2,
} from "lucide-react";

const PEONY = FORM_LIST.find((f) => f.key === "peony") || { key: "peony", fern: false };
const CHECKS_KEY = "fw_demo6_checks_v2";
const SEEN_KEY = "fw_demo6_intro_seen_v1";
const SEASON = { menstrual: "Inner Winter", follicular: "Inner Spring", ovulatory: "Inner Summer", luteal: "Inner Autumn" };
const PHASE_SEGMENTS = [
  { key: "menstrual", from: 1, to: 5 }, { key: "follicular", from: 6, to: 13 },
  { key: "ovulatory", from: 14, to: 16 }, { key: "luteal", from: 17, to: 28 },
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// guard every awaited read so a slow/wedged backend can never wedge the page (hang trap).
const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
function dateKey(d) { try { const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${da}`; } catch { return ""; } }
function reduceMotion() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } }

// ── cycle phase ring (encircles the bloom) — the centrepiece ───────────────────────────────────
function pt(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function arcPath(cx, cy, r, s, e) { const [x1, y1] = pt(cx, cy, r, s), [x2, y2] = pt(cx, cy, r, e); return `M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${x2} ${y2}`; }
function PhaseRing({ phase, day, cycleLen, showMarker = true, size = 296, children }) {
  const c = size / 2, r = size / 2 - 20;
  const segs = PHASE_SEGMENTS.map((s) => ({ ...s, start: ((s.from - 1) / 28) * 360, end: (s.to / 28) * 360, color: PHASE_COLORS[s.key], active: s.key === phase }));
  const markerDeg = ((day - 0.5) / (cycleLen || 28)) * 360;
  const [mx, my] = pt(c, c, r, markerDeg);
  const pc = PHASE_COLORS[phase] || T.sage;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <style>{`@keyframes fwMarker{0%,100%{opacity:.18;transform:scale(1)}50%{opacity:.3;transform:scale(1.12)}}@media (prefers-reduced-motion:reduce){.fw-marker-halo{animation:none!important}}`}</style>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id="fwRing-wash" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={pc} stopOpacity="0.15" />
            <stop offset="60%" stopColor={pc} stopOpacity="0.05" />
            <stop offset="100%" stopColor={pc} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={c} cy={c} r={r - 4} fill="url(#fwRing-wash)" />
        <circle cx={c} cy={c} r={r} fill="none" stroke={T.paperDeep} strokeWidth="2" opacity="0.4" />
        {segs.map((s) => (
          <path key={s.key} d={arcPath(c, c, r, s.start + 2, s.end - 2)} fill="none" stroke={s.color}
            strokeWidth={s.active ? 8 : 4.5} strokeLinecap="round" opacity={s.active ? 1 : 0.4} />
        ))}
        {showMarker && <>
          <circle className="fw-marker-halo" cx={mx} cy={my} r="12" fill={pc} style={{ transformOrigin: `${mx}px ${my}px`, animation: "fwMarker 5.5s ease-in-out infinite" }} />
          <circle cx={mx} cy={my} r="7" fill={pc} stroke="#FFFDF7" strokeWidth="2.5" />
          <circle cx={mx} cy={my} r="2.4" fill="#FFFDF7" opacity="0.92" />
        </>}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function ActionBtn({ Icon, children, href, onClick, accent }) {
  const style = { display: "inline-flex", alignItems: "center", gap: 7, background: accent, color: "#fff", borderRadius: 12, padding: "11px 15px", fontFamily: UI, fontSize: 14, fontWeight: 700, textDecoration: "none", border: "none", cursor: "pointer", marginRight: 8, marginBottom: 8 };
  if (onClick) return <button type="button" onClick={onClick} style={style}><Icon size={15} /> {children}</button>;
  return <a href={href} style={style}><Icon size={15} /> {children}</a>;
}

// ── Jess day-paragraph — RULE-BASED synthesis from real signals (LLM optional, left off to avoid
//    a hang). Varies the closing nudge by `seed` so "refresh" feels alive. ────────────────────────
function buildDayParagraph({ name, tod, phase, day, season, nut, journalCount, lastJournalDays, first }, seed = 0) {
  const who = name ? `, ${name}` : "";
  if (first) return `Welcome${who}. This is your day — it begins quietly. Tell me where you are in your cycle and I'll shape it around you. Your garden starts as a seed and grows as you do; nothing here is owed.`;
  const ph = PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : "your";
  const open = tod === "morning" ? `Here's your day${who}.` : tod === "evening" ? `How today went${who}.` : `Where you are today${who}:`;
  const cyc = day ? ` You're in your ${ph} phase — ${season} — day ${day}.` : ` We'll find your rhythm together.`;
  let food;
  if (nut?.hasData) {
    const macro = nut.keyMacro && nut.keyMacro.value ? `, ${nut.keyMacro.label.toLowerCase()} ${nut.keyMacro.value}${nut.keyMacro.unit}` : "";
    food = ` You've logged ${nut.mealCount} ${nut.mealCount === 1 ? "meal" : "meals"} (~${nut.kcal} kcal${macro}).`;
  } else {
    food = ` Nothing logged yet — a warm breakfast would be a kind start.`;
  }
  let jrn;
  if (lastJournalDays === 0) jrn = ` You left a line today — thank you for telling me.`;
  else if (journalCount > 0) jrn = ` It's been ${lastJournalDays === 1 ? "a day" : `${lastJournalDays} days`} since you wrote; a sentence is plenty if you fancy it.`;
  else jrn = ` Your journal's a fresh page whenever you want it.`;
  const NUDGES = {
    menstrual: ["Rest is productive this week — let the small things be enough.", "Warmth, iron and quiet suit today.", "Be soft with yourself; the tide is low and that's allowed."],
    follicular: ["Energy's returning — a good day to begin something small.", "Curiosity's rising; follow a thread that lights you up.", "A fuller walk or a fresh idea would land well today."],
    ovulatory: ["You're at your most outward — reach for connection if you fancy it.", "A bright, social day; say the thing, send the message.", "Energy's high — a fuller movement suits today."],
    luteal: ["Boundaries feel natural now — it's a fine day to do a little less.", "Tend the nest; an early wind-down would be kind.", "Slower is wiser this week — protect your evening."],
  };
  const list = NUDGES[phase] || NUDGES.follicular;
  const nudge = " " + list[seed % list.length];
  return `${open}${cyc}${food}${jrn}${nudge}`;
}

// ── the per-section slider geometry — lifted verbatim from JournalHub (do not re-derive) ───────────
const CARD_W = 365;  // ~85vw — the next card still peeks at the right edge
const GAP = 14;
const COL = 430;
const clip = (s, n) => (s && s.length > n ? s.slice(0, n).trim() + "…" : s || "");
function dayNumber() { try { return Math.floor(new Date(todayKey() + "T00:00:00").getTime() / 86400000); } catch { return 0; } }

const PHASE_PROMPT = {
  menstrual: "What would feel like rest today?",
  follicular: "What's one small thing you'd like to begin?",
  ovulatory: "Who do you want to reach out to today?",
  luteal: "What boundary would protect your evening?",
};
const PHASE_READ = {
  menstrual: "Your body's doing real work this week — warmth, iron and a slow pace are on your side.",
  follicular: "Energy usually climbs now — a good week to begin something or move a little more.",
  ovulatory: "You're near your most outward — mood and drive often peak around here.",
  luteal: "The wind-down phase — mood and energy can dip; earlier nights and magnesium help.",
};
const SYM_EASE = {
  cramps: "warmth and gentle movement ease it", "low mood": "daylight, omega-3 and a kind pace help",
  tired: "iron-rich food and an earlier night help", headache: "water and magnesium often help",
  tender: "it usually softens as your phase turns", bloated: "less salt, more water settles it",
  calm: "hold onto it — note what helped today",
};

// ── a little moon, drawn to the date's real illumination (the Lifestyle "your moon" suggestion) ─────
function moonInfo(dayNum) {
  const frac = (((dayNum - 10962) % 29.53059) + 29.53059) % 29.53059 / 29.53059; // 0=new … 0.5=full
  const names = [
    [0.03, "New moon", "a quiet day to set a small intention"], [0.22, "Waxing crescent", "a day for beginning something gently"],
    [0.28, "First quarter", "a day to push a little, then rest"], [0.47, "Waxing gibbous", "a day to finish things, softly"],
    [0.53, "Full moon", "a day to feel it all — and let some go"], [0.72, "Waning gibbous", "a day to share what you've gathered"],
    [0.78, "Last quarter", "a day to release, not to start"], [0.97, "Waning crescent", "a day to rest and tend the roots"],
    [1.01, "New moon", "a quiet day to set a small intention"],
  ];
  const m = names.find(([t]) => frac <= t) || names[names.length - 1];
  return { frac, name: m[1], line: m[2] };
}
function MoonGlyph({ frac = 0.5, size = 92 }) {
  const r = size / 2; const lit = "#F0E6C8", shadow = "#2A2A38";
  const offset = (frac < 0.5 ? 1 : -1) * (1 - Math.abs(frac - 0.5) / 0.5) * r * 1.05;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <radialGradient id="t6moonlit" cx="38%" cy="34%" r="72%"><stop offset="0%" stopColor="#FFF8E6" /><stop offset="100%" stopColor={lit} /></radialGradient>
        <clipPath id="t6moonclip"><circle cx={r} cy={r} r={r - 2} /></clipPath>
      </defs>
      <circle cx={r} cy={r} r={r - 2} fill="url(#t6moonlit)" />
      <g clipPath="url(#t6moonclip)"><circle cx={r + offset} cy={r} r={r - 2} fill={shadow} opacity={0.92} /></g>
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke="#A8893F" strokeOpacity="0.45" strokeWidth="1.4" />
      <circle cx={r * 0.72} cy={r * 0.78} r={r * 0.1} fill="#E2D4A8" opacity="0.5" />
      <circle cx={r * 0.95} cy={r * 0.5} r={r * 0.06} fill="#E2D4A8" opacity="0.45" />
    </svg>
  );
}

// ── REAL per-section synthesis — a digestible read on the user's OWN data (the "do more" note) ──────
// Health: a 1–2 line read of recent symptoms × phase + "something to know today".
function buildHealthInsight({ phase, cycleDay, season, symptoms, hasCycle }) {
  const tk = todayKey();
  const recent = (symptoms || []).filter((s) => {
    const d = s.date || (s.created_date ? String(s.created_date).slice(0, 10) : null);
    if (!d) return false; const days = Math.round((new Date(tk) - new Date(d)) / 86400000); return days >= 0 && days <= 6;
  });
  const tally = {};
  recent.forEach((s) => { const n = String(s.symptom_name || s.symptom_type || "").toLowerCase(); if (n) tally[n] = (tally[n] || 0) + 1; });
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  const phaseLine = hasCycle ? (PHASE_READ[phase] || "Your patterns build a picture over time.") : "Add your last period and I'll read your day against your phases.";
  if (top) {
    const [nm, count] = top;
    const ease = SYM_EASE[nm] || "your Health letter has gentle, phase-aware steps for it";
    return {
      hook: count > 1 ? `You've noted ${nm} ${count}× this week` : `You noted ${nm} this week`,
      line: hasCycle ? `Common in your ${PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : "current"} phase — ${ease}.` : `${ease.charAt(0).toUpperCase() + ease.slice(1)}.`,
      inset: { eyebrow: "Something to know today", quote: phaseLine },
    };
  }
  return {
    hook: hasCycle ? `${PHASE_LABEL[phase]} · day ${cycleDay} · ${season}` : "Your body, when you're ready",
    line: phaseLine,
    inset: hasCycle ? { eyebrow: "Something to know today", quote: "Note anything you feel — it keeps your patterns honest, and your read sharper." } : null,
  };
}
function buildNutritionInsight(nut, phase) {
  if (!nut?.hasData) return { hook: "Nothing logged yet today", line: "A warm, iron-friendly breakfast is a kind start — porridge with seeds and berries lands well.", inset: null };
  const glasses = Math.round((nut.hydrationMl || 0) / 250);
  const m = nut.keyMacro;
  const head = `${nut.mealCount} ${nut.mealCount === 1 ? "meal" : "meals"} · ~${nut.kcal} kcal${m && m.value ? ` · ${m.label.toLowerCase()} ${m.value}${m.unit}` : ""}`;
  let nudge;
  if (glasses < 4) nudge = `Water's at ${glasses} of 6 — a glass now would round out today.`;
  else if (phase === "menstrual") nudge = "Worth topping up iron this week — lentils, spinach or a little red meat.";
  else if (phase === "luteal") nudge = "Magnesium (seeds, dark chocolate) can ease the luteal wind-down.";
  else if (m && m.label === "Protein" && m.value < 40) nudge = "A protein-rich snack would keep your energy steady into the afternoon.";
  else nudge = "A handful of greens or seeds would round today out nicely.";
  return { hook: head, line: nudge, inset: null };
}
function buildJournalInsight(journal, phase) {
  const prompt = PHASE_PROMPT[phase] || "What would feel like enough today?";
  if (!journal || journal.count === 0) return { hook: "A fresh page", line: `Your journal's quiet — a first line is plenty. Try: “${prompt}”`, inset: null };
  const jd = journal.lastDays;
  const recency = jd === 0 ? "You wrote today — thank you." : jd === 1 ? "Last line yesterday." : `It's been ${jd} days since you wrote.`;
  return { hook: `${journal.count} ${journal.count === 1 ? "entry" : "entries"} so far`, line: `${recency} A prompt for today: “${prompt}”`, inset: journal.lastText ? { eyebrow: "Your last line", quote: clip(journal.lastText, 80) } : null };
}
function buildScheduleInsight(planItems, planFocus) {
  const next = (planItems || []).find((it) => !it.is_completed) || (planItems || [])[0];
  if (!next && !planFocus) return { hook: "Your day, open and unplanned", line: "Nothing scheduled yet — add today's first thing, or let it stay soft.", inset: null, next: null };
  if (next) return { hook: `Next: ${clip(next.title, 40)}`, line: (next.time ? `${next.time} · ` : "") + (planFocus ? `Today's focus: ${clip(planFocus, 46)}` : "Keep it kind — you don't need all of it."), inset: null, next };
  return { hook: clip(planFocus, 46), line: "Today's focus — keep it kind.", inset: null, next: null };
}
function buildPulseInsight(weekly, insights) {
  const line = weekly?.structured_summary?.your_pattern || weekly?.insight_text || insights?.[0]?.insight_text || insights?.[0]?.content || null;
  if (!line) return { hook: "Patterns build with time", line: "Log a few days and your weekly shape surfaces here — never scores, just patterns.", inset: null };
  return { hook: "Your week, gently read", line: clip(line, 96), inset: weekly?.top_symptoms?.length ? { eyebrow: "This week's signals", quote: weekly.top_symptoms.slice(0, 3).join(" · ") } : null };
}
function buildProgramsInsight(prog) {
  if (!prog) return { hook: "A kind rhythm", line: "No programme yet — start a short, gentle one that fits your phase, or do tonight's 10-minute body-scan.", inset: null };
  const title = prog.prog?.title || "Your programme"; const day = prog.up?.current_day || 1; const len = prog.prog?.duration_days;
  return { hook: clip(title, 38), line: (len ? `Day ${day} of ${len} · ` : `Day ${day} · `) + clip(prog.prog?.daily_activities_summary || prog.prog?.summary || "Tonight: a 10-minute body-scan to settle.", 64), inset: null };
}

export default function TodayDemo6() {
  useEditorialFonts();
  const [tod] = useState(() => { try { const h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : "evening"; } catch { return "afternoon"; } });
  const [first] = useState(false);                    // the empty/first-day state (set by the first-open ceremony)
  const [done, setDone] = useState({});
  const [custom, setCustom] = useState([]);
  const [draft, setDraft] = useState("");
  const [justFed, setJustFed] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [loggedCount, setLoggedCount] = useState(0);
  const [paraSeed, setParaSeed] = useState(0);        // (2) refresh the day-paragraph
  const [rollSeed, setRollSeed] = useState(0);        // re-roll the per-section suggestion rotation
  const [jumpOpen, setJumpOpen] = useState(false);    // central jump-to switcher
  const [sActive, setSActive] = useState(0);          // per-section slider index
  const sTrackRef = useRef(null);

  // ── real data ────────────────────────────────────────────────────────────────────────────────
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nut, setNut] = useState(null);
  const [journal, setJournal] = useState(null);       // { count, lastDays, lastText }
  const [symptoms, setSymptoms] = useState([]);        // recent rows
  const [companion, setCompanion] = useState(null);
  const [content, setContent] = useState({});   // real content surfaces (story / foryou / book / echo) — guarded, fail-open
  const [, setDataReady] = useState(false);
  // (3) first-open ceremony — fires once, persisted
  const [ceremony, setCeremony] = useState(false);
  const [growStage, setGrowStage] = useState(0);

  useEffect(() => {
    let alive = true;
    // first-open ceremony decision (before data, so it can play immediately)
    try { if (!localStorage.getItem(SEEN_KEY)) { setCeremony(true); } } catch { /* ignore */ }
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null;
      if (!alive) return;
      setUid(id);
      const nm = profileName(profile, me);
      if (!id) { setDataReady(true); return; }
      // companion (real bloom) — load then resolve from cache
      loadCompanionState(id).catch(() => {});
      try { setCompanion(getCompanion(id)); } catch { /* ignore */ }
      // profile → cycle
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      const prof = (profs || []).filter(Boolean)[0] || null;
      if (!alive) return;
      setProfile(prof);
      void nm;
      // nutrition today (already guarded + fail-open inside)
      nutritionToday(id, prof).then((n) => { if (alive) setNut(n); }).catch(() => {});
      // journal — count + last entry recency
      withTimeout(base44.entities.JournalEntries.filter({ user_id: id }, "-created_date", 80)).then((rows) => {
        if (!alive) return;
        const arr = (rows || []).filter(Boolean);
        const last = arr[0];
        const lastDate = last ? (last.session_date || (last.created_date ? String(last.created_date).slice(0, 10) : null)) : null;
        const lastDays = lastDate ? Math.max(0, Math.round((new Date(todayKey()) - new Date(lastDate)) / 86400000)) : null;
        setJournal({ count: arr.length, lastDays, lastText: last?.text || "" });
      }).catch(() => {});
      // recent symptoms (for the calendar peek)
      withTimeout(base44.entities.SymptomLogs.filter({ user_id: id }, "-date", 40)).then((rows) => {
        if (alive) setSymptoms((rows || []).filter(Boolean));
      }).catch(() => {});
      // ── REAL content surfaces (global/user content; each guarded + fail-open → graceful curated fallback) ──
      const todayISO = todayKey();
      withTimeout(base44.entities.DailyStory.filter({ is_active: true }, "-published_date", 20)).then((rows) => {
        if (!alive) return; const arr = (rows || []).filter(Boolean);
        const s = arr.find((r) => !r.published_date || String(r.published_date).slice(0, 10) <= todayISO) || arr[0];
        if (s) setContent((c) => ({ ...c, story: s }));
      }).catch(() => {});
      withTimeout(base44.entities.LifestyleItems.filter({}, "-published_at", 12)).then((rows) => {
        const arr = (rows || []).filter((r) => r && r.title);
        if (alive && arr.length) setContent((c) => ({ ...c, foryou: arr }));
      }).catch(() => {});
      withTimeout(base44.entities.BookClubPick.filter({ active: true }, "-created_date", 1)).then((rows) => {
        const b = (rows || []).filter(Boolean)[0]; if (alive && b) setContent((c) => ({ ...c, book: b }));
      }).catch(() => {});
      withTimeout(base44.entities.Echo.filter({}, "-created_date", 8)).then((rows) => {
        const e = (rows || []).filter((r) => r && r.body)[0]; if (alive && e) setContent((c) => ({ ...c, echo: e }));
      }).catch(() => {});
      // ── PLANNER — today's real plan (DailyPlan narrative + PlannerItems list) ──
      withTimeout(base44.entities.DailyPlan.filter({ user_id: id, day_key: todayISO }, null, 1)).then((rows) => {
        const p = (rows || []).filter(Boolean)[0]; if (alive && p) setContent((c) => ({ ...c, plan: p }));
      }).catch(() => {});
      withTimeout(base44.entities.PlannerItems.filter({ user_id: id, date: todayISO }, "-created_date", 12)).then((rows) => {
        const arr = (rows || []).filter((r) => r && r.title); if (alive && arr.length) setContent((c) => ({ ...c, planItems: arr }));
      }).catch(() => {});
      // ── PULSE — real weekly narrative + recent pattern cards ──
      withTimeout(base44.entities.WeeklyInsights.filter({ user_id: id }, "-week_start", 1)).then((rows) => {
        const w = (rows || []).filter(Boolean)[0]; if (alive && w) setContent((c) => ({ ...c, weekly: w }));
      }).catch(() => {});
      withTimeout(base44.entities.InsightCards.filter({ user_id: id }, "-insight_date", 6)).then((rows) => {
        const arr = (rows || []).filter((r) => r && (r.insight_text || r.content || r.title)); if (alive && arr.length) setContent((c) => ({ ...c, insights: arr }));
      }).catch(() => {});
      // ── HOROSCOPE — today's real reading (graceful empty if none for this user) ──
      withTimeout(base44.entities.HoroscopeReading.filter({ user_id: id, reading_date: todayISO }, "-created_date", 1)).then((rows) => {
        const h = (rows || []).filter(Boolean)[0]; if (alive && h) setContent((c) => ({ ...c, horoscope: h }));
      }).catch(() => {});
      // ── LISTEN — a real published podcast episode (the Lifestyle Listen source: LifestyleItems media_type PODCAST) ──
      withTimeout(base44.entities.LifestyleItems.filter({ media_type: "PODCAST", status: "PUBLISHED" }, "-published_at", 6)).then((rows) => {
        const a = (rows || []).filter((r) => r && r.title && (r.audio_url || r.episode_url || r.content_url))[0]; if (alive && a) setContent((c) => ({ ...c, listen: a }));
      }).catch(() => {});
      // ── PROGRAMS — the user's active programme (real); title/day/length resolved from Programs by program_key ──
      withTimeout(base44.entities.UserPrograms.filter({ user_id: id }, "-last_activity_date", 8)).then(async (rows) => {
        const arr = (rows || []).filter(Boolean);
        const up = arr.find((r) => r.status && r.status !== "completed") || arr[0];
        if (!alive || !up) return;
        let prog = null;
        if (up.program_key) { const pr = await withTimeout(base44.entities.Programs.filter({ program_key: up.program_key }, null, 1)).catch(() => null); prog = (pr || []).filter(Boolean)[0] || null; }
        if (alive) setContent((c) => ({ ...c, program: { up, prog } }));
      }).catch(() => {});
      if (alive) setDataReady(true);
    })();
    return () => { alive = false; };
  }, []);

  // first-open ceremony animation: grow the bloom 0→4, then mark seen + dismiss.
  useEffect(() => {
    if (!ceremony) return;
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    if (reduceMotion()) { setGrowStage(4); const t = setTimeout(() => setCeremony(false), 1600); return () => clearTimeout(t); }
    let s = 0; setGrowStage(0);
    const iv = setInterval(() => { s += 1; setGrowStage(Math.min(4, s)); if (s >= 4) clearInterval(iv); }, 480);
    const done = setTimeout(() => setCeremony(false), 3000);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [ceremony]);

  // persisted checklist
  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(CHECKS_KEY) || "{}"); if (v.done) setDone(v.done); if (v.custom) setCustom(v.custom); } catch { /* ignore */ }
  }, []);
  const firstPersist = useRef(true);
  useEffect(() => {
    if (firstPersist.current) { firstPersist.current = false; return; }
    try { localStorage.setItem(CHECKS_KEY, JSON.stringify({ done, custom })); } catch { /* ignore */ }
  }, [done, custom]);

  // ── derived (real, with graceful fallbacks) ────────────────────────────────────────────────────
  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const phase = cycle.phase;
  const phaseColor = PHASE_COLORS[phase] || T.sage;
  const season = SEASON[phase] || "your season";
  const name = useMemo(() => profileName(profile, null), [profile]);
  const cName = companion?.name || "your companion";
  const cForm = useMemo(() => FORM_LIST.find((f) => f.key === (companion?.form?.key || companion?.form)) || PEONY, [companion]);
  const cAccent = companion?.accent || T.blush;

  const tended = useMemo(() => Object.values(done).filter(Boolean).length + loggedCount, [done, loggedCount]);
  const feedGarden = () => {
    setLoggedCount((n) => n + 1); setJustFed(true); setTimeout(() => setJustFed(false), 2200);
    try { if (uid) tendCompanion(uid, "Tended from Today"); } catch { /* ignore */ }
  };
  const toggle = (id) => setDone((prev) => {
    const turningOn = !prev[id];
    const next = { ...prev, [id]: turningOn };
    if (turningOn) {
      setJustFed(true); setTimeout(() => setJustFed(false), 2200);
      const label = (allItems.find((x) => x.id === id)?.label) || "A kind thing";
      // REAL: nourish the companion (CompanionState, cross-device) + persist the tick to HabitLogs.
      try { if (uid) tendCompanion(uid, `Today: ${label}`); } catch { /* ignore */ }
      if (uid) {
        const day = todayKey(); const nowISO = new Date().toISOString();
        base44.entities.HabitLogs.create({ user_id: uid, habit_type: label, habit_name: label, habit_category: "today", date: day, day_key: day, completed: true, is_completed: true, source: "today", created_at: nowISO, updated_at: nowISO }).catch(() => { /* fail-open: localStorage mirror still holds it */ });
      }
    }
    return next;
  });
  const addCustom = () => { const v = draft.trim(); if (!v) return; setCustom((prev) => [...prev, { id: "c" + Date.now(), label: v, kind: "outapp" }]); setDraft(""); };

  const ITEMS = [
    { id: "chapter", label: "Read today's chapter of Little Women", kind: "inapp", Icon: BookOpen, href: "/BookReader?gutenberg_id=514" },
    { id: "qotd", label: "Answer the Question of the Day", kind: "inapp", Icon: Users, href: "/Community" },
    { id: "line", label: "Leave a line in your journal", kind: "inapp", Icon: PenLine, href: "/Journal" },
    { id: "breakfast", label: "Log breakfast", kind: "inapp", Icon: Coffee, href: "/Nutrition" },
    { id: "walk", label: "A gentle 20-minute walk", kind: "outapp", Icon: Footprints },
    { id: "water", label: "A glass of water now", kind: "outapp", Icon: Droplet },
    { id: "winddown", label: `An early wind-down tonight (${PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : "tonight"})`, kind: "outapp", Icon: Moon },
  ];
  const allItems = [...ITEMS, ...custom.map((c) => ({ ...c, Icon: Sparkles }))];

  const TODS = { morning: { Icon: Sunrise, label: "Morning" }, afternoon: { Icon: Sun, label: "Afternoon" }, evening: { Icon: Sunset, label: "Evening" } };
  const greeting = tod === "morning" ? "Good morning" : tod === "afternoon" ? "Good afternoon" : "Good evening";
  const paragraph = buildDayParagraph({
    name, tod, phase, day: hasCycle ? cycle.cycleDay : null, season, nut,
    journalCount: journal?.count || 0, lastJournalDays: journal?.lastDays ?? null, first,
  }, paraSeed);

  // ── real content derivations the per-section cards + the smart-suggestions rail read ──────────────
  //    (deterministic QOTD + guarded entity reads; the synthesis is done in the build*Insight helpers).
  const qotd = qotdForDay(todayKey());
  const storyTitle = content.story ? (content.story.series_title || "Today's chapter") : "Today's instalment";
  const bookHref = content.book?.gutenberg_id ? `/BookReader?gutenberg_id=${content.book.gutenberg_id}` : "/BookReader?gutenberg_id=514";
  const planItems = content.planItems || [];
  const planFocus = content.plan?.focus_for_today || null;
  const weekly = content.weekly;
  const insightCards = content.insights || [];
  const pulseLine = weekly?.structured_summary?.your_pattern || weekly?.insight_text || insightCards[0]?.insight_text || insightCards[0]?.content || null;
  const horo = content.horoscope;
  const listen = content.listen;
  const listenHref = listen ? (listen.episode_url || listen.content_url || "/Lifestyle?tab=listen") : "/Lifestyle?tab=listen";
  const phaseWord = PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : "";
  const foryouItems = content.foryou || [];
  const prog = content.program;

  // ── THE PER-SECTION SMART CARDS — one card per app section, each a REAL glanceable synthesis of
  //    the user's own data + an inline action. The day-seed (+ a manual re-roll) rotates the modes
  //    that have real signal, so the card changes day to day but is never hollow. ──────────────────
  const daySeed = dayNumber() + rollSeed;
  const moon = moonInfo(daySeed);
  const pickMode = (modes, offset) => { const list = modes.filter(Boolean); if (!list.length) return null; return list[(((daySeed + offset) % list.length) + list.length) % list.length]; };
  const audioUrl = listen ? (listen.audio_url || listen.audio_file_url || listen.episode_url || listen.media_url || listen.content_url || null) : null;
  const foryouItem = foryouItems[0];
  const foryouHref = foryouItem?.id ? `/LifestyleDetail?id=${foryouItem.id}` : "/Lifestyle";

  const health = buildHealthInsight({ phase, cycleDay: cycle.cycleDay, season, symptoms, hasCycle });
  const nutI = buildNutritionInsight(nut, phase);
  const jrnI = buildJournalInsight(journal, phase);
  const schedI = buildScheduleInsight(planItems, planFocus);
  const pulseI = buildPulseInsight(weekly, insightCards);
  const progI = buildProgramsInsight(prog);
  const hydGlasses = Math.round((nut?.hydrationMl || 0) / 250);

  const CARDS = [
    // HEALTH — a digestible read on the user's own recent symptoms × phase ("something to know today")
    (() => {
      const accent = phaseColor;
      const modes = [
        { ...health, flower: "dahlia", action: { type: "chips", Icon: Stethoscope, label: "Note how you feel", chips: ["Cramps", "Low mood", "Tired", "Headache", "Tender", "Bloated", "Calm"], doneLabel: "Noted, gently." } },
        { hook: hasCycle ? `Your ${phaseWord} letter` : "Your Health letters", line: PHASE_READ[phase] || "Gentle, phase-aware steps, written for you.", inset: health.inset, flower: "dahlia", action: { type: "deeplink", Icon: BookOpen, label: "Read your letter", href: "/Health" } },
      ];
      const m = pickMode(modes, 4) || modes[0];
      return { key: "health", section: "Health", accent, Icon: Stethoscope, tag: "Cycle & symptoms", open: { href: "/Health", label: "Open Health" }, ...m };
    })(),
    // NUTRITION — today's intake snapshot + a targeted nudge
    (() => {
      const accent = T.sage;
      const action = (nut?.hasData && hydGlasses < 6) ? { type: "water", Icon: Droplet, label: "+ a glass", startGlasses: hydGlasses }
        : { type: "sheet", sheet: "meal", Icon: nut?.hasData ? Salad : Coffee, label: nut?.hasData ? "Log a meal" : "Log breakfast" };
      return { key: "nutrition", section: "Nutrition", accent, Icon: Salad, tag: "Nutrition", flower: "sunflower", open: { href: "/Nutrition", label: "Open Nutrition" }, ...nutI, action };
    })(),
    // SCHEDULE — the actual next thing on today's plan, with an inline check-off
    (() => {
      const accent = "#8E6E8E";
      const action = schedI.next ? { type: "check", Icon: Check, label: "Mark it done", note: `Planner: ${clip(schedI.next.title, 36)}`, doneLabel: "Done — nicely paced." }
        : { type: "deeplink", Icon: CalendarDays, label: "Plan your day", href: "/Planner" };
      return { key: "planner", section: "Schedule", accent, Icon: CalendarDays, tag: "Today's schedule", flower: "iris", open: { href: "/Planner", label: "Open Planner" }, ...schedI, action };
    })(),
    // COMMUNITY — the specific live question (or a real echo) + inline answer
    (() => {
      const accent = T.crimson;
      const modes = [
        { hook: clip(qotd.text, 70), line: "Answer the room — anonymous, 18+, everyone's in it.", inset: content.echo?.body ? { eyebrow: "An echo, fading", quote: clip(content.echo.body, 80) } : null, flower: "cornflower", action: { type: "compose", kind: "qotd", Icon: Users, label: "Post anonymously", placeholder: "Answer the room…", doneLabel: "Shared with the room. Thank you." } },
        { hook: "Leave an echo", line: "A line, left anonymously, that quietly fades. Someone always needs to read it.", inset: content.echo?.body ? { eyebrow: "An echo, fading", quote: clip(content.echo.body, 80) } : null, flower: "cornflower", action: { type: "compose", kind: "echo", Icon: Heart, label: "Release it", placeholder: "A line, left anonymously…", doneLabel: "Released. It's held." } },
      ];
      const m = pickMode(modes, 3) || modes[0];
      return { key: "community", section: "Community", accent, Icon: Users, tag: "Today's question", open: { href: "/Community", label: "Open Community" }, ...m };
    })(),
    // JOURNAL — a prompt tied to their recent entries / recency
    (() => {
      const accent = T.gold;
      return { key: "journal", section: "Journal", accent, Icon: PenLine, tag: "Journal", flower: "camellia", open: { href: "/Journal", label: "Open Journal" }, ...jrnI,
        action: { type: "compose", kind: "line", Icon: PenLine, label: "Keep it", placeholder: "A line is plenty…", doneLabel: "Kept. Your companion felt that." } };
    })(),
    // LIFESTYLE — moon · podcast (inline play) · book (deep-link to reader) · daily story · for-you
    (() => {
      const accent = T.gold;
      const modes = [
        { tag: "Your moon", hook: `Tonight: ${moon.name.toLowerCase()}`, line: `${moon.line}. Your sky, read against where you are.`, visual: <MoonGlyph frac={moon.frac} size={92} />, flower: "violet", action: { type: "deeplink", Icon: Star, label: horo ? "Today's reading" : "Read your sky", href: "/Lifestyle?tab=horoscope" } },
        listen && { tag: "Listen", hook: clip(listen.title, 52), line: listen.source_name ? `${listen.source_name} · play it right here` : "A new episode — play it right here, no leaving the page.", flower: "bluebell", action: { type: "audio", url: audioUrl, title: listen.title, href: listenHref, Icon: Headphones } },
        content.book && { tag: "Book of the day", hook: clip(content.book.title, 46), line: content.book.author ? `${content.book.author} — opens straight in the reader, full screen.` : "Opens straight in the reader, full screen.", flower: "rose", action: { type: "deeplink", Icon: BookOpen, label: "Open in the reader", href: bookHref } },
        content.story && { tag: "Daily story", hook: clip(storyTitle, 44), line: content.story.segment_text ? clip(content.story.segment_text, 80) : "A short instalment, released daily.", flower: "poppy", action: { type: "deeplink", Icon: Feather, label: "Read today's chapter", href: "/Lifestyle?tab=daily_story" } },
        foryouItem && { tag: "For you", hook: clip(foryouItem.title, 50), line: `Gathered for you${phaseWord ? `, tuned to your ${phaseWord} phase` : ""}.`, flower: "primrose", action: { type: "deeplink", Icon: Sparkles, label: "Open this", href: foryouHref } },
      ];
      const m = pickMode(modes, 0) || modes[0];
      return { key: "lifestyle", section: "Lifestyle", accent, Icon: Sparkles, open: { href: "/Lifestyle", label: "Open Lifestyle" }, ...m };
    })(),
    // PROGRAMS — real active programme / tonight's practice, inline begin
    (() => {
      const accent = T.sage;
      const action = prog ? { type: "deeplink", Icon: Activity, label: "Continue programme", href: "/ProgramsHub" }
        : { type: "check", Icon: Moon, label: "Begin tonight's practice", note: "Tonight's practice · body-scan", doneLabel: "Begun. Rest is part of it." };
      return { key: "programs", section: "Programs", accent, Icon: Activity, tag: "Programs", flower: "lavender", open: { href: "/ProgramsHub", label: "Open Programs" }, ...progI, action };
    })(),
    // PULSE — the real weekly pattern
    (() => {
      const accent = "#8E6E8E";
      return { key: "pulse", section: "Pulse", accent, Icon: TrendingUp, tag: "This week", flower: "dahlia", open: { href: "/Pulse", label: "Open Pulse" }, ...pulseI,
        action: { type: "deeplink", Icon: TrendingUp, label: pulseLine ? "See the full shape" : "See your patterns", href: "/Pulse" } };
    })(),
    // GARDEN / COMPANION — her real bloom + inline tend
    (() => {
      const accent = T.sage;
      return { key: "garden", section: "Companion", accent, Icon: Sprout, tag: "Your garden", flower: "rose", open: { href: "/Garden", label: "Open your garden" },
        hook: cName, line: tendedToday(uid) ? `Blooming — you've tended her today${tended > 0 ? ` (${tended})` : ""}.` : "Blooming — she grows from everything you already do.",
        bloom: { form: cForm?.key || "peony", color: cAccent },
        action: { type: "check", Icon: Feather, label: "Tend her", note: "Tended from Today", doneLabel: `${cName} felt that — a little more open.` } };
    })(),
  ];
  const sLast = CARDS.length - 1;
  const sGoTo = (i) => { const idx = Math.max(0, Math.min(sLast, i)); setSActive(idx); sTrackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" }); };

  // central jump-to destinations (the canonical switcher) — page areas + the section slider.
  const JUMP_AREAS = [
    { id: "t-day", Icon: Feather, label: "Your day", sub: "in a few words" },
    { id: "t-yourday", Icon: Check, label: "Your day", sub: "gentle checklist" },
    { id: "t-cycle", Icon: Stethoscope, label: "Cycle", sub: "& symptoms" },
    { id: "t-sections", Icon: Grid2x2, label: "Across your day", sub: "every section" },
    { id: "t-noticed", Icon: Sparkles, label: "A few things", sub: "I noticed" },
  ];
  const jumpTo = (id) => { setJumpOpen(false); try { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* ignore */ } };

  // SMART SUGGESTIONS — driven from REAL signals (nutrition gap · journal recency · today's
  // symptom · real book pick · real weekly pattern · real echo · real horoscope · cycle phase).
  // Each card only appears when its signal is real; phase-movement is the always-on fallback.
  const SUGGESTIONS = (() => {
    const out = [];
    // nutrition — real (nothing logged / hydration gap / iron nudge)
    if (!nut?.hasData) out.push({ Icon: Coffee, accent: T.sage, text: "Nothing logged yet — a warm, iron-friendly breakfast is a kind start.", href: "/Nutrition" });
    else if ((nut.hydrationMl || 0) < 1000) out.push({ Icon: Droplet, accent: T.sage, text: `${Math.round((nut.hydrationMl || 0) / 250)} of 6 glasses so far — a little more water would round out today.`, href: "/Nutrition" });
    else out.push({ Icon: Leaf, accent: T.sage, text: "A few seeds or greens would lift today's iron — a 10-minute recipe is waiting.", href: "/Nutrition" });
    // journal recency — real
    const jd = journal?.lastDays;
    if (jd == null || jd >= 2) out.push({ Icon: PenLine, accent: T.gold, text: jd != null ? `It's been ${jd === 1 ? "a day" : `${jd} days`} since you wrote — a gentle prompt is waiting.` : "A quiet prompt is waiting whenever you want it.", href: "/Journal" });
    // today's symptom — real
    const recentSym = (symptoms || [])[0];
    if (recentSym && recentSym.date === todayKey()) {
      const sname = String(recentSym.symptom_name || recentSym.symptom_type || "").toLowerCase();
      if (sname) out.push({ Icon: Stethoscope, accent: "#8E6E8E", text: `You noted ${sname} today — your Health letters have gentle, phase-aware steps for it.`, href: "/Health" });
    }
    // reading — real book pick
    if (content.book?.title) out.push({ Icon: BookOpen, accent: T.crimson, text: `The Books circle is reading ${content.book.title} — read along.`, href: bookHref });
    // weekly pattern — real
    if (pulseLine) out.push({ Icon: TrendingUp, accent: "#8E6E8E", text: clip(pulseLine, 92), href: "/Pulse" });
    // community echo — real
    if (content.echo?.body) out.push({ Icon: Heart, accent: T.crimson, text: "Someone left an echo today — the room's quietly with you.", href: "/Community" });
    // horoscope — real headline if present
    if (horo?.headline) out.push({ Icon: Star, accent: "#8E6E8E", text: clip(horo.headline, 92), href: "/Lifestyle?tab=horoscope" });
    // movement — phase-aware (real phase); always-on fallback so the rail is never empty
    out.push({ Icon: Activity, accent: T.sage, text: phase === "ovulatory" || phase === "follicular" ? "Energy's up — a fuller movement suits today." : "A calmer movement suits today — a fuller one next week.", href: "/ProgramsHub" });
    return out;
  })();

  const TodIcon = TODS[tod].Icon;
  const showFirst = first;   // empty/first-day state (set by the first-open ceremony, not a dev toggle)
  // Hero bloom reflects the user's REAL companion (its stored colour from CompanionState); the
  // fingerprint colourway is only the fallback before the companion resolves (BRAND_IDENTITY §5.1/§5.2).
  const heroCw = useMemo(() => (cAccent ? { petal: cAccent, tip: lighten(cAccent, 0.34) } : fingerprintColourway(uid)), [cAccent, uid]);

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 96, position: "relative", overflow: "hidden" }}>
      <InkFilter />
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fw-hrow{scrollbar-width:none}.fw-hrow::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>
      {/* botanical brand texture — one low-opacity vine per fold, at the page edge, never behind text (BRAND_IDENTITY §4/§6.2) */}
      <div style={{ position: "absolute", top: 28, right: -22, pointerEvents: "none", zIndex: 0 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.1} w={162} /></div>
      <div style={{ position: "absolute", top: 760, left: -26, pointerEvents: "none", zIndex: 0 }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.08} w={150} flip /></div>
      <div style={{ position: "absolute", top: 1520, right: -24, pointerEvents: "none", zIndex: 0 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.08} w={150} /></div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0", position: "relative", zIndex: 1 }}>
        {/* date + time-of-day + jump-to (left) + cycle calendar icon (right) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 6, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: -3 }}><JumpToButton onClick={() => setJumpOpen(true)} /></div>
          <TodIcon size={14} color={T.muted} />
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>{TODS[tod].label} · {longDate()}</span>
          <button onClick={() => setCalOpen(true)} aria-label="Open your cycle calendar" title="Cycle calendar"
            style={{ position: "absolute", right: 0, top: -2, width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <CalendarHeart size={19} color={phaseColor} strokeWidth={1.8} />
          </button>
        </div>

        {/* (1) HERO — real companion bloom inside the real cycle ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 6 }}>
          {/* lush masthead: coloured glow + the crafted bloom-in-ring + a resting butterfly */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
            <div aria-hidden style={{ position: "absolute", top: "48%", left: "50%", width: 340, height: 340, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${heroCw.petal}40 0%, ${phaseColor}24 42%, transparent 70%)`, animation: "fwcGlow 7s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", top: 10, right: 34, zIndex: 2, pointerEvents: "none" }}><Butterfly size={44} color={heroCw.petal} color2={heroCw.tip} pattern="eyes" animate idx="hero-bf" /></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <PhaseRing phase={phase} day={hasCycle && !showFirst ? cycle.cycleDay : 1} cycleLen={cycle.cycleLen} showMarker={hasCycle && !showFirst} size={300}>
                {/* the real crafted bloom (RichBloomV2), per-user unique via the fingerprint colourway */}
                <SwayBloom animate idx={2}>
                  <RichBloomV2 form={cForm?.key || "peony"} color={heroCw.petal} color2={heroCw.tip} accent={T.gold} size={198} animate soft idx="today-hero" />
                </SwayBloom>
              </PhaseRing>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: -4 }}>
            <FlowerGlyph variant="camellia" size={26} color={cwOf("blush").petal} color2={cwOf("blush").tip} idx="hf-l" />
            <Heart size={17} />
            <Script size={44} color={T.ink}>{greeting}{name ? `, ${name}` : ""}</Script>
            <FlowerGlyph variant="rose" size={26} color={cwOf("plum").petal} color2={cwOf("plum").tip} idx="hf-r" />
          </div>
          {hasCycle && !showFirst ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: phaseColor, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>Day {cycle.cycleDay} · {PHASE_LABEL[phase]}</span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>{season}</span>
            </div>
          ) : (
            <button onClick={() => setCalOpen(true)} style={{ marginTop: 8, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 13px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, cursor: "pointer" }}>Tell me where you are in your cycle</button>
          )}
          <Hand size={17} color={T.muted} style={{ marginTop: 9, textAlign: "center", maxWidth: 330, lineHeight: 1.5 }}>
            {showFirst ? `“Hello — I'm ${cName}. We'll grow at your pace.”` : `“I'm here with you today. We can rest, and still tend a little.”`}
          </Hand>
          {justFed && (
            <div className="fw-fade" style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.sage, marginTop: 9, display: "inline-flex", alignItems: "center", gap: 6, animation: "fwFadeUp .3s ease both" }}><Leaf size={14} /> {cName} felt that — a little more open</div>
          )}
        </div>

        {/* (2) DAY PARAGRAPH — synthesised from real signals + refresh */}
        <div id="t-day" style={{ position: "relative", overflow: "hidden", marginTop: 18, background: "linear-gradient(160deg, #FBF4E1 0%, #F4E7C4 100%)", border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 18, padding: "18px 19px", boxShadow: "0 8px 28px rgba(58,44,26,0.14), 0 2px 6px rgba(58,44,26,0.08)" }}>
          <div aria-hidden style={{ position: "absolute", right: -14, bottom: -18, opacity: 0.12, pointerEvents: "none" }}><FlowerGlyph variant="sunflower" size={120} color={T.gold} idx="wm-day" /></div>
          <Frame4 variant="carved" color={T.gold} size={54} opacity={0.66} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Eyebrow color={T.gold} mb={0}>{showFirst ? "Your day begins" : tod === "evening" ? "How today went" : "Your day, in a few words"}</Eyebrow>
            <button onClick={() => setParaSeed((s) => s + 1)} aria-label="Refresh the day's words" title="A different turn of phrase" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 2, display: "inline-flex" }}><RefreshCw size={15} /></button>
          </div>
          <p key={paraSeed} className="fw-fade" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.55, margin: 0, animation: "fwFadeUp .3s ease both" }}>{paragraph}</p>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginTop: 11 }}>— Jess</div>
        </div>

        {/* (3) YOUR DAY — gentle checklist; ticking nourishes the garden */}
        <div id="t-yourday" style={{ position: "relative", overflow: "hidden", marginTop: 16, background: "linear-gradient(160deg, #F3F7EC 0%, #E7F0DE 100%)", border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 18, padding: "17px 17px 15px", boxShadow: "0 8px 28px rgba(58,44,26,0.14), 0 2px 6px rgba(58,44,26,0.08)" }}>
          <div aria-hidden style={{ position: "absolute", right: -16, bottom: -20, opacity: 0.1, pointerEvents: "none", zIndex: 0 }}><FlowerGlyph variant="rose" size={120} color={T.sage} idx="wm-day3" /></div>
          <Frame4 variant="sprig" color={T.sage} size={52} opacity={0.64} />
          <div style={{ position: "relative", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Eyebrow mb={2} color={T.gold}>Your day</Eyebrow>
            <span style={{ fontFamily: UI, fontSize: 13, color: T.muted }}>invitations, never a score</span>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "4px 0 12px", lineHeight: 1.5 }}>
            {tended > 0 ? `${tended} tended so far — each one fed your garden.` : "Tap a tick when you do one. No pressure — your garden grows from what you actually do."}
          </p>
          {allItems.map((it) => {
            const isDone = !!done[it.id]; const It = it.Icon;
            return (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${T.paperDeep}77` }}>
                <button onClick={() => toggle(it.id)} aria-label="tick" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, border: `1.5px solid ${isDone ? T.sage : T.paperDeep}`, background: isDone ? T.sage : "transparent", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", transition: "all .15s" }}>{isDone && <Check size={16} strokeWidth={3} />}</button>
                <It size={16} color={T.muted} style={{ flexShrink: 0 }} />
                {it.kind === "inapp" && it.href
                  ? <a href={it.href} style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: isDone ? T.muted : T.ink, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.4 }}>{it.label}</a>
                  : <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: isDone ? T.muted : T.ink, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.4 }}>{it.label}</span>}
                {it.kind === "inapp" && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.gold, border: `1px solid ${T.gold}66`, borderRadius: 99, padding: "2px 7px", flexShrink: 0 }}>in app</span>}
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }} placeholder="Add your own…" style={{ flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
            <button onClick={addCustom} style={{ flexShrink: 0, background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "0 15px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 14, fontWeight: 700 }}><Plus size={15} /> Add</button>
          </div>
        </div>

        <LeafDivider color={T.gold} my={18} />

        {/* (3b) CYCLE & SYMPTOMS — elevated near the top */}
        <div id="t-cycle" style={{ position: "relative", overflow: "hidden", background: `linear-gradient(160deg, #FFFDF9 0%, ${phaseColor}22 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${phaseColor}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 8px 28px rgba(58,44,26,0.14), 0 2px 6px rgba(58,44,26,0.08)" }}>
          <div aria-hidden style={{ position: "absolute", right: -16, bottom: -20, opacity: 0.12, pointerEvents: "none", zIndex: 0 }}><FlowerGlyph variant="poppy" size={118} color={phaseColor} idx="wm-cyc" /></div>
          <Frame4 variant="sprig" color={phaseColor} size={52} opacity={0.64} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            {ICON_DISC(Stethoscope, phaseColor)}
            <Eyebrow color={phaseColor}>Cycle &amp; symptoms</Eyebrow>
            <button onClick={() => setCalOpen(true)} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: phaseColor }}><CalendarHeart size={15} /> Calendar</button>
          </div>
          <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "0 0 6px", lineHeight: 1.3 }}>{hasCycle ? `${PHASE_LABEL[phase]} · day ${cycle.cycleDay} · ${season}` : "Your cycle, whenever you're ready"}</h3>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{hasCycle ? "Note anything your body's saying — it keeps your patterns honest." : "Add your last period and I'll shape your day around your phases."}</p>
          <div>
            <ActionBtn Icon={Stethoscope} onClick={() => setSheet("symptom")} accent={phaseColor}>Log a symptom</ActionBtn>
            <ActionBtn Icon={CalendarHeart} onClick={() => setCalOpen(true)} accent={phaseColor}>Cycle calendar</ActionBtn>
          </div>
          <a href="/Health" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>Open your Health letters <ChevronRight size={14} /></a>
        </div>

        {/* (4) PER-SECTION SMART SLIDER — the approved Option-2 spine: ONE card per app section,
            the Journal slider's card size, a segmented section rail (its own jump-to) + ‹ • • › nav.
            Each card is a REAL synthesis of the user's own data + an inline action. */}
        <SprigDivider color={T.gold} my={20} />
        <div id="t-sections">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <Script size={32} color={T.ink} style={{ display: "block", lineHeight: 1.1 }}>Across your day</Script>
            <button onClick={() => { setRollSeed((s) => s + 1); sGoTo(0); }} aria-label="Show different suggestions" title="A different turn"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex", flexShrink: 0 }}><RefreshCw size={16} /></button>
          </div>
          <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "2px 0 12px" }}>each part of your app, one smart card · swipe sideways · every card has something to do</p>

          {/* segmented section rail — doubles as the slider's jump-to */}
          <div className="fw-hrow" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 0 12px", WebkitOverflowScrolling: "touch" }}>
            {CARDS.map((c, i) => (
              <button key={c.key} onClick={() => sGoTo(i)} style={{
                flex: "none", background: i === sActive ? c.accent : "transparent", color: i === sActive ? T.paper : T.muted,
                border: `1px solid ${i === sActive ? c.accent : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
                fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              }}><c.Icon size={13} /> {c.section}</button>
            ))}
          </div>

          {/* the single horizontal slider (Journal geometry: CARD_W 365 · GAP 14 · peek) */}
          <div ref={sTrackRef} className="fw-hrow"
            onScroll={(e) => { const i = Math.round(e.currentTarget.scrollLeft / (CARD_W + GAP)); setSActive(Math.max(0, Math.min(sLast, i))); }}
            style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 0 4px", WebkitOverflowScrolling: "touch", margin: "0 -2px" }}>
            {CARDS.map((c) => (
              <TodayCard key={c.key} card={c} uid={uid} cycle={cycle} onSheet={setSheet} onTend={feedGarden} />
            ))}
            <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
          </div>

          {/* prev / dots / next */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "12px 0 0" }}>
            <button onClick={() => sGoTo(sActive - 1)} disabled={sActive === 0} aria-label="Previous section" style={sNavBtn(sActive === 0)}><ChevronLeft size={18} /></button>
            <div style={{ display: "flex", gap: 7 }}>
              {CARDS.map((c, i) => (
                <button key={c.key} onClick={() => sGoTo(i)} aria-label={c.section} style={{ width: i === sActive ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0, background: i === sActive ? c.accent : T.paperDeep, cursor: "pointer", transition: "width .2s" }} />
              ))}
            </div>
            <button onClick={() => sGoTo(sActive + 1)} disabled={sActive === sLast} aria-label="Next section" style={sNavBtn(sActive === sLast)}><ChevronRight size={18} /></button>
          </div>
        </div>

        <FleuronDivider color={T.gold} my={20} />

        {/* (5) CROSS-APP SMART SUGGESTIONS */}
        <div id="t-noticed">
          <Script size={30} color={T.ink} style={{ display: "block", lineHeight: 1.1 }}>A few things I noticed</Script>
          <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "2px 0 10px" }}>gentle, tuned to your {PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : ""} phase · slide to see more</p>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", paddingBottom: 6 }}>
            {SUGGESTIONS.map((g, i) => { const Gi = g.Icon; return (
              <a key={i} href={g.href} style={{ position: "relative", overflow: "hidden", flex: "0 0 80%", scrollSnapAlign: "start", textDecoration: "none", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${g.accent}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${g.accent}`, borderRadius: 16, padding: "16px 16px", minHeight: 132, boxShadow: "0 8px 22px rgba(58,48,32,0.07)", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                <Frame4 variant="sprig" color={g.accent} size={42} opacity={0.55} />
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }}>{ICON_DISC(Gi, g.accent)}<span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: g.accent }}>For you</span></span>
                <span style={{ position: "relative", fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.5, margin: "11px 0 auto", ...CLAMP3 }}>{g.text}</span>
                <span style={{ position: "relative", fontFamily: UI, fontSize: 13, fontWeight: 700, color: g.accent, display: "inline-flex", alignItems: "center", gap: 3, marginTop: 10 }}>have a look <ChevronRight size={14} /></span>
              </a>
            ); })}
          </div>
        </div>

        {/* closing sign-off — framed + a meaning-bloom (no 2nd heart; §3 keeps one heart, in the hero) */}
        <div style={{ position: "relative", overflow: "hidden", marginTop: 24, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.gold}10 100%)`, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "20px 20px 18px", textAlign: "center", boxShadow: "0 4px 20px rgba(58,44,26,0.10)" }}>
          <Frame4 variant="carved" color={T.gold} size={50} opacity={0.6} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><FlowerGlyph variant="camellia" size={30} color={cwOf("gold").petal} color2={cwOf("gold").tip} idx="close" /></div>
            <Hand size={16} color={T.inkSoft} style={{ display: "block", lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>Calm by default. Everything's here when you want it, and nothing's owed.</Hand>
          </div>
        </div>
      </div>

      {sheet && <ActionSheet sheetKey={sheet} uid={uid} cycle={cycle} onClose={() => setSheet(null)} onSaved={feedGarden} />}
      {jumpOpen && <JumpSheet areas={JUMP_AREAS} onPick={jumpTo} onClose={() => setJumpOpen(false)} />}
      {calOpen && <CycleCalendar profile={profile} cycle={cycle} hasCycle={hasCycle} symptoms={symptoms} onClose={() => setCalOpen(false)} />}
      {ceremony && <FirstOpenCeremony cForm={cForm} cAccent={cAccent} cName={cName} growStage={growStage} onSkip={() => setCeremony(false)} />}
    </div>
  );
}

// ── helpers for name + date ──────────────────────────────────────────────────────────────────────
function profileName(profile, me) {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const n = profile?.first_name || profile?.preferred_name || profile?.name
    || (me?.full_name ? String(me.full_name).split(" ")[0] : null)
    || (me?.email ? String(me.email).split("@")[0].replace(/[._].*$/, "") : null);
  return n && n.length <= 18 ? cap(n) : "";
}
function longDate() {
  try { return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); }
  catch { return "Today"; }
}

// ── (3) First-open ceremony — a one-time, calm "bloom grows" welcome ───────────────────────────────
function FirstOpenCeremony({ cForm, cAccent, cName, growStage, onSkip }) {
  useScrollLock(true);
  return (
    <div onClick={onSkip} role="dialog" aria-label="Welcome"
      style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, ...PAPER_BG, animation: "fwScrimIn .4s ease both" }}>
      <div style={{ transition: "transform .5s ease" }}>
        <Bloom form={cForm} stageIdx={growStage} color={cAccent} accent={T.gold} bright size={210} />
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Heart size={14} />
        <Script size={34} color={T.ink}>Meet {cName}</Script>
      </div>
      <Hand size={17} color={T.muted} style={{ textAlign: "center", maxWidth: 300, lineHeight: 1.5 }}>She grows from everything you already do — a line, a meal, a kept evening. Rest is part of it.</Hand>
      <button onClick={onSkip} style={{ marginTop: 8, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, cursor: "pointer" }}>Begin</button>
    </div>
  );
}

// ── In-place action sheet — logging happens ON Today + WRITES for real (guarded, fail-open) ────────
const SHEETS = {
  line:    { eyebrow: "Journal", accent: "#A8893F", title: "Leave a line", kind: "text", placeholder: "A line is plenty…", cta: "Keep it", full: "/Journal", done: "Kept. Your companion felt that." },
  meal:    { eyebrow: "Nutrition", accent: "#8FAF8F", title: "Log a meal", kind: "meal", cta: "Log it", full: "/Nutrition", done: "Logged. Your companion felt that." },
  water:   { eyebrow: "Nutrition", accent: "#8FAF8F", title: "A glass of water", kind: "water", cta: "Add water", full: "/Nutrition", done: "Noted — thank you for the water." },
  qotd:    { eyebrow: "Community", accent: "#BC2E27", title: "Today's question", prompt: "What small thing lifted you today?", kind: "text", placeholder: "Answer the room (anonymous)…", cta: "Post anonymously", full: "/Community", done: "Shared with the room. Thank you." },
  echo:    { eyebrow: "Community", accent: "#BC2E27", title: "Leave an echo", kind: "text", placeholder: "A line, left anonymously, that fades…", cta: "Release it", full: "/Community", done: "Released. It's held." },
  symptom: { eyebrow: "Cycle & Health", accent: "#8E6E8E", title: "Note a symptom", kind: "chips", chips: ["Cramps", "Low mood", "Tired", "Headache", "Tender", "Bloated", "Calm"], cta: "Save the note", full: "/Health", done: "Noted, gently. Your companion felt that." },
  practice:{ eyebrow: "Programs", accent: "#8FAF8F", title: "Tonight's practice", prompt: "A 10-minute body-scan to settle.", kind: "begin", cta: "Begin", full: "/ProgramsHub", done: "Begun. Rest is part of it." },
};
// real, guarded, fire-and-forget writes — never awaited on the close path.
function doWrite(kind, { uid, cycle, text, picked, mealType }) {
  if (!uid) return;   // signed-out preview: confirm in-UI only, no write
  const day = todayKey();
  (async () => {
    try {
      if (kind === "meal") {
        const foods = picked.length ? picked : (text.trim() ? [text.trim()] : ["A meal"]);
        const label = foods.join(", ");
        await base44.entities.MealLog.create({ user_id: uid, date: day, day_key: day, meal_type: (mealType || "snack").toLowerCase(), food_items: foods, food_name: label, name: label, raw_text: label, cycle_phase_at_log: cycle?.phase }).catch(() => {});
      } else if (kind === "water") {
        await base44.entities.HydrationLog.create({ user_id: uid, day_key: day, amount_ml: 250, source: "manual" }).catch(() => {});
      } else if (kind === "symptom") {
        for (const s of (picked || [])) { await base44.entities.SymptomLogs.create({ user_id: uid, date: day, symptom_name: s, symptom_type: s }).catch(() => {}); }
      } else if (kind === "line") {
        if (text.trim()) await base44.entities.JournalEntries.create({ user_id: uid, session_date: day, text: text.trim(), tags: ["note"], prompt: "From Today", card_type: "free", card_color: "cream" }).catch(() => {});
      } else if (kind === "echo") {
        const wh = await communityHash(uid).catch(() => null);
        if (wh && text.trim()) {
          // postEcho REQUIRES live_at + expires_at (the cooling pause + 48h fade) — compute them the
          // same way the canonical ShareAsEchoSheet does, or the function 400s and the post is lost.
          const c = computeCooling({ phase: cycle?.phase, cycleDay: cycle?.cycleDay });
          await base44.functions.invoke("postEcho", { action: "post", user_id: uid, author_hash: wh, body: text.trim().slice(0, 800), phase: cycle?.phase || "unknown", cycle_day: typeof cycle?.cycleDay === "number" ? cycle.cycleDay : undefined, live_at: c.liveAt.toISOString(), expires_at: c.expiresAt.toISOString(), visibility: "all" }).catch(() => {});
        }
      } else if (kind === "qotd") {
        const wh = await communityHash(uid).catch(() => null);
        const q = qotdForDay(day);
        if (wh && text.trim()) await base44.functions.invoke("answerQotd", { user_id: uid, author_hash: wh, prompt_day: day, prompt_key: q.key, body: text.trim().slice(0, 800) }).catch(() => {});
      } else if (kind === "practice") {
        const nowISO = new Date().toISOString();
        await base44.entities.HabitLogs.create({ user_id: uid, habit_type: "Tonight's practice", habit_name: "Body-scan · 10m", habit_category: "practice", date: day, day_key: day, completed: true, is_completed: true, source: "today", created_at: nowISO, updated_at: nowISO }).catch(() => {});
      }
    } catch { /* fail-open */ }
  })();
}
function ActionSheet({ sheetKey, uid, cycle, onClose, onSaved }) {
  useScrollLock(true);
  const cfg = SHEETS[sheetKey] || SHEETS.line;
  const [text, setText] = useState("");
  const [picked, setPicked] = useState([]);
  const [glasses, setGlasses] = useState(3);
  const [mealType, setMealType] = useState("Breakfast");
  const [method, setMethod] = useState("recents");
  const [saved, setSaved] = useState(false);
  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  const canSave = saved ? false : (cfg.kind === "text" ? text.trim().length > 0 : cfg.kind === "chips" ? picked.length > 0 : cfg.kind === "meal" ? picked.length > 0 || text.trim().length > 0 : true);
  const save = () => {
    if (saved) return;
    setSaved(true);
    doWrite(sheetKey, { uid, cycle, text, picked, mealType });   // real, guarded, fire-and-forget
    onSaved && onSaved();
    setTimeout(onClose, 1400);
  };
  const toggleChip = (c) => setPicked((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const inputStyle = { width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "12px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none" };
  return (
    <div role="dialog" aria-modal="true" aria-label={cfg.title} className="fw-scrim-anim"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)", animation: "fwScrimIn .22s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "18px 18px 26px", maxHeight: "86vh", overflowY: "auto", overscrollBehavior: "contain", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", animation: "fwSheetIn .3s cubic-bezier(.32,.72,.24,1) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: cfg.accent }}>{cfg.eyebrow} · on Today</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 12px", lineHeight: 1.2 }}>{cfg.title}</h2>

        {saved ? (
          <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0 4px", animation: "fwFadeUp .3s ease both" }}>
            <span style={{ width: 30, height: 30, borderRadius: 99, background: T.sage, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.45 }}>{cfg.done}</span>
          </div>
        ) : (
          <>
            {cfg.prompt && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.inkSoft, margin: "0 0 12px", lineHeight: 1.45 }}>{cfg.prompt}</p>}
            {cfg.kind === "text" && <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={600} placeholder={cfg.placeholder} style={inputStyle} autoFocus />}
            {cfg.kind === "meal" && (() => {
              const METHODS = [
                { key: "search", Icon: Search, label: "Search" }, { key: "recents", Icon: Clock, label: "Recents" },
                { key: "snap", Icon: Camera, label: "Snap" }, { key: "say", Icon: Mic, label: "Say" }, { key: "scan", Icon: ScanLine, label: "Scan" },
              ];
              const RECENTS = [
                { name: "Porridge with seeds & berries", meta: "240 kcal · iron-rich", tag: "frequent" },
                { name: "Greek yogurt & honey", meta: "180 kcal · protein 15g" },
                { name: "Spinach & lentil salad", meta: "320 kcal · iron-rich" },
                { name: "Katsu curry (meal deal)", meta: "640 kcal" },
                { name: "Banana", meta: "90 kcal" },
              ];
              const toggleFood = (n) => setPicked((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);
              return (
                <>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => { const on = mealType === m; return <button key={m} type="button" onClick={() => setMealType(m)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? cfg.accent : T.paperDeep}`, background: on ? cfg.accent : "transparent", color: on ? "#fff" : T.muted }}>{m}</button>; })}
                  </div>
                  <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                    {METHODS.map((mt) => { const on = method === mt.key; return (
                      <button key={mt.key} type="button" onClick={() => setMethod(mt.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 2px", borderRadius: 12, cursor: "pointer", border: `1px solid ${on ? cfg.accent : T.paperDeep}`, background: on ? `${cfg.accent}14` : "transparent" }}>
                        <mt.Icon size={18} color={on ? cfg.accent : T.muted} strokeWidth={1.8} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? cfg.accent : T.muted }}>{mt.label}</span>
                      </button>); })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", marginBottom: 12 }}>
                    <Search size={16} color={T.muted} />
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder={method === "scan" ? "Point at a barcode…" : method === "say" ? "“I had porridge and a banana…”" : "Search foods (CoFID + branded)…"} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
                  </div>
                  <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, margin: "0 0 8px" }}>Recent &amp; quick-add</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RECENTS.map((f) => { const on = picked.includes(f.name); return (
                      <button key={f.name} type="button" onClick={() => toggleFood(f.name)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: on ? `${cfg.accent}12` : T.paper, border: `1px solid ${on ? cfg.accent : T.paperDeep}`, borderRadius: 12, padding: "11px 13px", cursor: "pointer" }}>
                        <span style={{ flex: 1 }}>
                          <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.3 }}>{f.name}</span>
                          <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, marginTop: 2 }}>{f.meta}{f.tag ? ` · ${f.tag}` : ""}</span>
                        </span>
                        <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", background: on ? cfg.accent : "transparent", border: `1.5px solid ${on ? cfg.accent : T.paperDeep}`, color: "#fff" }}>{on ? <Check size={15} strokeWidth={3} /> : <Plus size={15} color={T.muted} />}</span>
                      </button>); })}
                  </div>
                </>
              );
            })()}
            {cfg.kind === "water" && (() => {
              const stepBtn = { width: 52, height: 52, borderRadius: 14, border: `1.5px solid ${cfg.accent}`, background: "transparent", color: cfg.accent, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
              return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "4px 0 8px" }}>
                  <button type="button" onClick={() => setGlasses((g) => Math.max(0, g - 1))} aria-label="One fewer glass" style={stepBtn}><Minus size={22} strokeWidth={2.5} /></button>
                  <span style={{ flex: 1, textAlign: "center", fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}><Droplet size={17} style={{ verticalAlign: "-3px", color: cfg.accent }} /> {glasses + 1} of 6 glasses</span>
                  <button type="button" onClick={() => setGlasses((g) => Math.min(7, g + 1))} aria-label="One more glass" style={stepBtn}><Plus size={22} strokeWidth={2.5} /></button>
                </div>
              );
            })()}
            {cfg.kind === "chips" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {cfg.chips.map((c) => { const on = picked.includes(c); return <button key={c} type="button" onClick={() => toggleChip(c)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? cfg.accent : T.paperDeep}`, background: on ? cfg.accent : "transparent", color: on ? "#fff" : T.muted }}>{c}</button>; })}
              </div>
            )}
            {cfg.kind === "begin" && <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>Find a comfortable spot. When you're ready, we'll move slowly from your toes to the crown of your head.</p>}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
              <button type="button" onClick={save} disabled={!canSave} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: cfg.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: canSave ? "pointer" : "default", opacity: canSave ? 1 : 0.5 }}><Send size={15} /> {cfg.cta}</button>
              <a href={cfg.full} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>or open the full page <ChevronRight size={14} /></a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Safe-text styles — wrap + clamp so NOTHING ever bleeds off a card/page at 390px.
const CLAMP2 = { minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" };
const CLAMP3 = { ...CLAMP2, WebkitLineClamp: 3 };
const CLAMP4 = { ...CLAMP2, WebkitLineClamp: 4 };

// The framed look — the §4.2 corner element in ALL FOUR corners (Halli relaxed §4.4 onto cards).
function Frame4({ variant = "sprig", color, opacity = 0.62, size = 50 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}
function sNavBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}

// ── (8) THE PER-SECTION CARD — the approved Option-2 card (Journal slider size, CARD_W 365) carrying
//    a REAL synthesis of the user's own data + an INLINE action. ─────────────────────────────────────
function TodayCard({ card, uid, cycle, onSheet, onTend }) {
  const a = card.accent;
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W,
      position: "relative", overflow: "hidden",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${a}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${a}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 470,
      boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
    }}>
      <Frame4 variant="sprig" color={a} size={46} opacity={0.6} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          {ICON_DISC(card.Icon, a)}
          <Eyebrow color={a}>{card.tag || card.section}</Eyebrow>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={card.flower || "camellia"} size={30} color={a} idx={`mb-${card.key}`} /></span>
        </div>
        {card.visual && <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 10px" }}>{card.visual}</div>}
        {card.bloom && (
          <div style={{ display: "flex", justifyContent: "center", margin: "0 0 6px" }}>
            <RichBloomV2 form={card.bloom.form} color={card.bloom.color} color2={lighten(card.bloom.color, 0.34)} accent={T.gold} size={104} animate soft idx={`sb-${card.key}`} />
          </div>
        )}
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...CLAMP3 }}>{card.hook}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP4 }}>{card.line}</p>
        {card.inset && (
          <div style={{ marginBottom: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px" }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: a, marginBottom: 3 }}>{card.inset.eyebrow}</div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.4, ...CLAMP2 }}>“{card.inset.quote}”</p>
          </div>
        )}
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          <InlineAction action={card.action} accent={a} uid={uid} cycle={cycle} onSheet={onSheet} onTend={onTend} />
          <a href={card.open.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
            {card.open.label} <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── inline actions — the card DOES the thing right here ─────────────────────────────────────────────
function inlineBtn(accent, disabled) {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, textDecoration: "none" };
}
function InlineAction({ action, accent, uid, cycle, onSheet, onTend }) {
  const { type } = action || {};
  if (type === "deeplink") { const A = action.Icon || ChevronRight; return <a href={action.href} style={inlineBtn(accent)}><A size={15} /> {action.label}</a>; }
  if (type === "sheet") { const A = action.Icon || Plus; return <button onClick={() => onSheet(action.sheet)} style={inlineBtn(accent)}><A size={15} /> {action.label}</button>; }
  if (type === "audio") return <AudioAction action={action} accent={accent} />;
  if (type === "water") return <WaterAction action={action} accent={accent} uid={uid} />;
  if (type === "check") return <CheckAction action={action} accent={accent} uid={uid} onTend={onTend} />;
  if (type === "compose") return <ComposeAction action={action} accent={accent} uid={uid} cycle={cycle} onTend={onTend} />;
  if (type === "chips") return <ChipsAction action={action} accent={accent} uid={uid} onTend={onTend} />;
  return null;
}
function AudioAction({ action, accent }) {
  const ref = useRef(null); const [playing, setPlaying] = useState(false); const [err, setErr] = useState(false);
  const toggle = () => { const el = ref.current; if (!el) return; if (el.paused) { el.play().then(() => setPlaying(true)).catch(() => setErr(true)); } else { el.pause(); setPlaying(false); } };
  if (err || !action.url) return (
    <div>
      <a href={action.href} style={inlineBtn(accent)}><Headphones size={15} /> Open in Listen</a>
      {err && <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "7px 0 0" }}>This clip won{"'"}t stream here — it{"'"}s waiting in Listen.</p>}
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "11px 13px" }}>
      <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 999, background: accent, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}>
        {playing ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
      </button>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: accent, letterSpacing: "0.04em" }}>{playing ? "Playing — right here" : "Play inline"}</div>
        <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, ...CLAMP2 }}>{clip(action.title, 40)}</div>
      </div>
      <audio ref={ref} src={action.url} preload="none" onEnded={() => setPlaying(false)} onError={() => setErr(true)} />
    </div>
  );
}
function WaterAction({ action, accent, uid }) {
  const [glasses, setGlasses] = useState(action.startGlasses || 0);
  const add = () => { setGlasses((g) => Math.min(8, g + 1)); if (uid) base44.entities.HydrationLog.create({ user_id: uid, day_key: todayKey(), amount_ml: 250, source: "today" }).catch(() => {}); };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "10px 13px" }}>
      <button onClick={() => setGlasses((g) => Math.max(0, g - 1))} aria-label="One fewer" style={{ width: 44, height: 44, borderRadius: 12, border: `1.5px solid ${accent}`, background: "transparent", color: accent, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Minus size={20} strokeWidth={2.5} /></button>
      <span style={{ flex: 1, textAlign: "center", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink }}><Droplet size={16} style={{ verticalAlign: "-3px", color: accent }} /> {glasses} of 6 glasses</span>
      <button onClick={add} aria-label="Add a glass" style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: accent, color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Plus size={20} strokeWidth={2.5} /></button>
    </div>
  );
}
function CheckAction({ action, accent, uid, onTend }) {
  const [done, setDone] = useState(false); const A = action.Icon || Check;
  const fire = () => {
    if (done) return; setDone(true); onTend && onTend(action.note);
    if (uid) { const nowISO = new Date().toISOString(); const day = todayKey(); base44.entities.HabitLogs.create({ user_id: uid, habit_type: action.note || "Today", habit_name: action.note || "Today", habit_category: "today", date: day, day_key: day, completed: true, is_completed: true, source: "today", created_at: nowISO, updated_at: nowISO }).catch(() => {}); }
  };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Done."} />;
  return <button onClick={fire} style={inlineBtn(accent)}><A size={15} /> {action.label}</button>;
}
function ComposeAction({ action, accent, uid, cycle, onTend }) {
  const [text, setText] = useState(""); const [done, setDone] = useState(false); const A = action.Icon || Send;
  const can = text.trim().length > 0 && !done;
  const post = () => { if (!can) return; setDone(true); doWrite(action.kind, { uid, cycle, text }); if (action.kind === "line") onTend && onTend("Left a line from Today"); };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Shared. Thank you."} />;
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={600} placeholder={action.placeholder}
        style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={post} disabled={!can} style={inlineBtn(accent, !can)}><A size={15} /> {action.label}</button>
    </div>
  );
}
function ChipsAction({ action, accent, uid, onTend }) {
  const [picked, setPicked] = useState([]); const [done, setDone] = useState(false);
  const toggle = (c) => setPicked((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const save = () => { if (!picked.length || done) return; setDone(true); doWrite("symptom", { uid, picked }); onTend && onTend("Noted a symptom from Today"); };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Noted, gently."} />;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 11 }}>
        {action.chips.map((c) => { const on = picked.includes(c); return (
          <button key={c} onClick={() => toggle(c)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? accent : "transparent", color: on ? "#fff" : T.muted }}>{c}</button>
        ); })}
      </div>
      <button onClick={save} disabled={!picked.length} style={inlineBtn(accent, !picked.length)}><Stethoscope size={15} /> {action.label}</button>
    </div>
  );
}
function DoneRow({ accent, label }) {
  return (
    <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "12px 13px", animation: "fwFadeUp .3s ease both" }}>
      <span style={{ width: 30, height: 30, borderRadius: 99, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
      <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

// ── the central JUMP-TO switcher — the canonical bottom-sheet pattern (JournalHubSheet) for Today ────
function JumpSheet({ areas, onPick, onClose }) {
  useScrollLock(true);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Jump to" className="fw-scrim-anim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 220, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)", animation: "fwScrimIn .22s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "16px 16px 26px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", animation: "fwSheetIn .3s cubic-bezier(.32,.72,.24,1) both" }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: T.paperDeep, margin: "0 auto 12px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Script size={30} color={T.ink}>Jump to</Script>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {areas.map((ar) => (
            <button key={ar.id} onClick={() => onPick(ar.id)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 13px", cursor: "pointer" }}>
              {ICON_DISC(ar.Icon, T.gold)}
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{ar.label}</span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 1 }}>{ar.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── (7) Impressionistic cycle calendar — real cycle, month swipe, day-peek ─────────────────────────
function CycleCalendar({ profile, cycle, hasCycle, symptoms, onClose }) {
  useScrollLock(true);
  const [offset, setOffset] = useState(0);       // months from current
  const [peek, setPeek] = useState(null);        // tapped day detail
  const touch = useRef(null);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  // reference last-period start: real if present, else derived from today's cycle day (consistent).
  const lastPeriod = useMemo(() => {
    if (profile?.last_period_start_date) { const d = new Date(profile.last_period_start_date); d.setHours(0, 0, 0, 0); return d; }
    const d = new Date(today); d.setDate(d.getDate() - ((cycle.cycleDay || 1) - 1)); return d;
  }, [profile, cycle, today]);
  const cycleLen = cycle.cycleLen || 28, periodLen = cycle.periodLen || 5;

  // symptom map: yyyy-mm-dd → [names]
  const symMap = useMemo(() => {
    const m = {};
    (symptoms || []).forEach((s) => { const d = s.date || (s.created_date ? String(s.created_date).slice(0, 10) : null); if (d) { (m[d] = m[d] || []).push(s.symptom_name || s.symptom_type || "a symptom"); } });
    return m;
  }, [symptoms]);

  const view = useMemo(() => { const d = new Date(today.getFullYear(), today.getMonth() + offset, 1); return d; }, [today, offset]);
  const YEAR = view.getFullYear(), MONTH = view.getMonth();
  const startDow = new Date(YEAR, MONTH, 1).getDay();
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
  const phaseOf = (cd) => phaseForDay(cd, periodLen, cycleLen);

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(YEAR, MONTH, d); date.setHours(0, 0, 0, 0);
    const elapsed = Math.round((date - lastPeriod) / 86400000);
    const cd = ((elapsed % cycleLen) + cycleLen) % cycleLen + 1;
    const key = dateKey(date);
    cells.push({ d, date, cd, phase: phaseOf(cd), isPeriod: cd <= periodLen, isToday: date.getTime() === today.getTime(), future: date > today, key, syms: symMap[key] || [] });
  }
  const DOW = ["S", "M", "T", "W", "T", "F", "S"];
  const legend = [{ k: "menstrual", label: "Period" }, { k: "follicular", label: "Follicular" }, { k: "ovulatory", label: "Ovulatory" }, { k: "luteal", label: "Luteal" }];

  const onTouchStart = (e) => { if (e.touches?.[0]) touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => { const s = touch.current; const x = e.changedTouches?.[0]?.clientX; if (s == null || x == null) return; const dx = x - s; if (Math.abs(dx) > 60) { setOffset((o) => o + (dx < 0 ? 1 : -1)); setPeek(null); } touch.current = null; };

  const peekDetail = (c) => {
    if (!c) return; const lines = [];
    if (c.isToday) lines.push("Today.");
    // period claims only when we actually have the user's cycle dates (else it's a guess).
    if (hasCycle && c.isPeriod && !c.future) lines.push("Period day.");
    if (hasCycle && c.isPeriod && c.future) lines.push("Period likely around here.");
    if (c.syms.length) lines.push(`You noted: ${c.syms.slice(0, 3).join(", ")}.`);
    if (!lines.length) lines.push("Nothing noted — a quiet day.");
    setPeek({ label: c.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }), phase: hasCycle ? c.phase : null, lines });
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Your cycle calendar" className="fw-scrim-anim"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.45)", animation: "fwScrimIn .22s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ ...PAPER_BG, width: "100%", maxWidth: 460, borderRadius: "22px 22px 0 0", padding: "18px 18px 28px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.24)", animation: "fwSheetIn .32s cubic-bezier(.32,.72,.24,1) both" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => { setOffset((o) => o - 1); setPeek(null); }} aria-label="Previous month" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 2 }}><ChevronLeft size={18} /></button>
              <Script size={34} color={T.ink}>{MONTHS[MONTH]}</Script>
              <button onClick={() => { setOffset((o) => o + 1); setPeek(null); }} aria-label="Next month" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 2 }}><ChevronRight size={18} /></button>
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginTop: -2 }}>{offset === 0 && hasCycle ? `${PHASE_LABEL[cycle.phase]} · day ${cycle.cycleDay} · ${SEASON[cycle.phase] || ""}` : `${YEAR}`}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}><X size={20} /></button>
        </div>
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 16 }}>
          {DOW.map((d, i) => <div key={`h${i}`} style={{ textAlign: "center", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, paddingBottom: 2 }}>{d}</div>)}
          {cells.map((c, i) => {
            if (!c) return <div key={i} />;
            const col = PHASE_COLORS[c.phase];
            const periodPast = hasCycle && c.isPeriod && !c.future, periodPredicted = hasCycle && c.isPeriod && c.future;
            const bg = periodPast ? `radial-gradient(circle at 50% 38%, ${col}, ${col}cc)` : periodPredicted ? `radial-gradient(circle at 50% 40%, ${col}33, ${col}10)` : `radial-gradient(circle at 50% 42%, ${col}3a, ${col}12)`;
            return (
              <button key={i} type="button" onClick={() => peekDetail(c)} style={{
                aspectRatio: "1 / 1", borderRadius: 14, display: "grid", placeItems: "center", position: "relative", cursor: "pointer", padding: 0,
                background: bg, border: c.isToday ? `2px solid ${T.ink}` : periodPredicted ? `1.5px dashed ${col}99` : "1px solid transparent",
                boxShadow: periodPast ? `0 5px 14px ${col}66` : "none",
              }}>
                <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: c.isToday ? 700 : 500, color: periodPast ? "#fff" : T.ink }}>{c.d}</span>
                {c.syms.length > 0 && <span style={{ position: "absolute", top: 5, right: 5, width: 5, height: 5, borderRadius: 99, background: T.gold }} />}
                {c.isToday && <span style={{ position: "absolute", bottom: 5, width: 4, height: 4, borderRadius: 99, background: T.ink }} />}
              </button>
            );
          })}
        </div>

        {/* day-peek popover */}
        {peek && (
          <div className="fw-fade" style={{ marginTop: 14, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${PHASE_COLORS[peek.phase] || T.gold}`, borderRadius: 14, padding: "12px 14px", animation: "fwFadeUp .25s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: PHASE_COLORS[peek.phase] || T.gold }}>{peek.label}{peek.phase ? ` · ${PHASE_LABEL[peek.phase]}` : ""}</span>
              <button onClick={() => setPeek(null)} aria-label="Close day" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 2 }}><X size={15} /></button>
            </div>
            {peek.lines.map((l, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: "5px 0 0", lineHeight: 1.4 }}>{l}</p>)}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 13px", marginTop: 18, justifyContent: "center" }}>
          {legend.map((l) => { const here = hasCycle && l.k === cycle.phase && offset === 0; return (
            <span key={l.k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: here ? 700 : 500, color: here ? T.ink : T.muted }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: PHASE_COLORS[l.k], opacity: here ? 1 : 0.5, boxShadow: here ? `0 0 0 2px ${PHASE_COLORS[l.k]}33` : "none" }} /> {l.label}{here ? " · you" : ""}
            </span>); })}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 500, color: T.muted }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, border: `1.5px dashed ${PHASE_COLORS.menstrual}99` }} /> Predicted
          </span>
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Hand size={16} color={T.inkSoft}>{hasCycle ? "Tap a day to peek · swipe to wander the months. Softly predicted, never a deadline." : "Add your last period in Health and your phases will bloom here."}</Hand>
        </div>
      </div>
    </div>
  );
}
