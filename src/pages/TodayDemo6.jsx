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

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import {
  T, SERIF, UI, SCRIPT, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay, phaseForDay } from "@/hooks/useCycleDay";
import { nutritionToday } from "@/utils/nutritionSummary";
import { communityHash } from "@/components/community/communityAnon";
import { Bloom } from "@/components/nurture/NurtureGarden";
import { FORM_LIST, getCompanion, tendCompanion, tendedToday, loadCompanionState } from "@/components/nurture/companion";
import { useScrollLock } from "@/utils/useScrollLock";
// Reuse the PRODUCTION Planner row slider verbatim — same card size, 3D depth
// (active scale(1) + gold-rim shadow vs idle scale(0.96)+dim), smooth
// 320ms cubic-bezier motion, ~15% next-card peek, and ‹ • • › nav. This is
// the reference Halli asked us to mirror exactly; importing it directly means
// the Today slides ARE the planner slides, not a re-derivation.
import CardStack from "@/components/planner-v2/CardStack";
import {
  PenLine, Salad, Users, Stethoscope, Sparkles, BookOpen, Feather, Headphones, Star, CalendarDays,
  Activity, Sprout, TrendingUp, Leaf, Moon, Footprints, Droplet, Coffee, Check, Plus, ChevronRight,
  ChevronLeft, Sun, Sunrise, Sunset, X, Send, Minus, Search, Mic, Camera, ScanLine, Clock,
  CalendarHeart, RefreshCw,
} from "lucide-react";

const PEONY = FORM_LIST.find((f) => f.key === "peony") || { key: "peony", fern: false };
const CHECKS_KEY = "fw_demo6_checks_v2";
const DECK_KEY = "fw_demo6_deck_front";
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

function VineMotif({ color = T.sage, opacity = 0.12, w = 150, flip = false }) {
  return (
    <svg width={w} height={w} viewBox="0 0 120 120" aria-hidden style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity={opacity}>
        <path d="M8 112 C 30 96 36 70 30 48 C 26 32 34 18 52 10" />
        <path d="M30 70 C 18 66 12 56 14 46 C 24 50 30 58 30 70 Z" />
        <path d="M31 52 C 44 50 52 42 53 31 C 42 33 33 41 31 52 Z" />
        <path d="M27 92 C 16 90 10 82 11 73 C 21 76 27 83 27 92 Z" />
        <circle cx="52" cy="10" r="2.2" />
      </g>
    </svg>
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

export default function TodayDemo6() {
  useEditorialFonts();
  const [tod, setTod] = useState(() => { try { const h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : "evening"; } catch { return "afternoon"; } });
  const [first, setFirst] = useState(false);          // dev toggle: preview the empty/first-day state
  const [done, setDone] = useState({});
  const [custom, setCustom] = useState([]);
  const [draft, setDraft] = useState("");
  const [justFed, setJustFed] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [loggedCount, setLoggedCount] = useState(0);
  const [paraSeed, setParaSeed] = useState(0);        // (2) refresh the day-paragraph

  // ── real data ────────────────────────────────────────────────────────────────────────────────
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nut, setNut] = useState(null);
  const [journal, setJournal] = useState(null);       // { count, lastDays, lastText }
  const [symptoms, setSymptoms] = useState([]);        // recent rows
  const [companion, setCompanion] = useState(null);
  const [dataReady, setDataReady] = useState(false);
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
      if (alive) setDataReady(true);
    })();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const toggle = (id) => setDone((prev) => { const next = { ...prev, [id]: !prev[id] }; if (next[id]) { setJustFed(true); setTimeout(() => setJustFed(false), 2200); } return next; });
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

  // ── section surfaces — summaries from REAL data where present, calm fallbacks otherwise ─────────
  const nutSummary = nut?.hasData
    ? { title: `${nut.mealCount} ${nut.mealCount === 1 ? "meal" : "meals"} · ~${nut.kcal} kcal`, lines: [{ Icon: Leaf, text: `${nut.keyMacro.label} so far`, meta: `${nut.keyMacro.value}${nut.keyMacro.unit}` }, { Icon: Droplet, text: "Water", meta: `${Math.round((nut.hydrationMl || 0) / 250)} of 6` }] }
    : { title: "Nothing logged yet today", lines: [{ Icon: Leaf, text: "A warm, iron-friendly breakfast would be a kind start." }] };
  const jrnSummary = journal && journal.count > 0
    ? { title: `${journal.count} ${journal.count === 1 ? "entry" : "entries"} so far`, lines: [{ text: journal.lastDays === 0 ? "You wrote today." : `Last line ${journal.lastDays === 1 ? "yesterday" : `${journal.lastDays} days ago`}.` }], inset: journal.lastText ? { eyebrow: "Your last line", quote: `“${journal.lastText.slice(0, 90)}${journal.lastText.length > 90 ? "…" : ""}”` } : null }
    : { title: "A fresh page", lines: [{ text: "Your journal's quiet today — a sentence is plenty whenever you want it." }] };

  const SURFACES = [
    { key: "journal", eyebrow: "Journal", accent: T.gold, Icon: PenLine, slug: "/Journal", openLabel: "Open journal",
      summary: jrnSummary,
      action: { prompt: "A line is plenty. What would feel like enough today?", buttons: [{ Icon: PenLine, label: "Write a line", sheet: "line" }] } },
    { key: "nutrition", eyebrow: "Nutrition", accent: T.sage, Icon: Salad, slug: "/Nutrition", openLabel: "Open nutrition",
      summary: nutSummary,
      action: { prompt: nut?.hasData ? "Anything since? A few seeds lift iron in the luteal stretch." : "What did today start with?", buttons: [{ Icon: Salad, label: "Log a meal", sheet: "meal" }, { Icon: Droplet, label: "+ water", sheet: "water" }] } },
    { key: "community", eyebrow: "Community", accent: T.crimson, Icon: Users, slug: "/Community", openLabel: "Open community",
      summary: { title: "The meadow beyond your garden", lines: [{ text: "Today's question: “What small thing lifted you today?”" }, { text: "Anonymous, 18+, a room everyone's in." }], inset: { eyebrow: "An echo, fading", quote: "“It's held.” — anonymous" } },
      action: { prompt: "Answer the room, or leave an anonymous line of your own.", buttons: [{ Icon: Users, label: "Answer QOTD", sheet: "qotd" }, { Icon: Heart, label: "Post an echo", sheet: "echo" }] } },
    { key: "foryou", eyebrow: "Lifestyle · For You", accent: T.gold, Icon: Sparkles, slug: "/Lifestyle", openLabel: "Open Lifestyle",
      summary: { title: "Picks for where you are", lines: [{ text: `Reads, a listen and a practice — tuned to your ${PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : ""} phase.` }] },
      action: { prompt: "A few things gathered for your afternoon.", buttons: [{ Icon: Sparkles, label: "See your picks", href: "/Lifestyle" }] } },
    { key: "book", eyebrow: "Lifestyle · Book of the Day", accent: T.muted, Icon: BookOpen, slug: "/BookReader?gutenberg_id=514", openLabel: "Open the library",
      summary: { title: "Today's chapter — Little Women", lines: [{ text: "A quiet chapter, about 9 minutes." }, { Icon: Users, text: "The Books circle is reading along — no rush." }] },
      action: { prompt: "A quiet chapter to read by her side.", buttons: [{ Icon: BookOpen, label: "Read the chapter", href: "/BookReader?gutenberg_id=514" }] } },
    { key: "story", eyebrow: "Lifestyle · Daily Story", accent: T.crimson, Icon: Feather, slug: "/Lifestyle?tab=daily_story", openLabel: "Open Daily Story",
      summary: { title: "Today's instalment", lines: [{ text: "A 3-minute read, released daily." }], inset: { eyebrow: "Where you left off", quote: "“…and she didn't look back, not yet.”" } },
      action: { prompt: "Pick the thread back up where you left it.", buttons: [{ Icon: Feather, label: "Read today's chapter", href: "/Lifestyle?tab=daily_story" }] } },
    { key: "listen", eyebrow: "Lifestyle · Listen", accent: T.gold, Icon: Headphones, slug: "/Lifestyle?tab=listen", openLabel: "Open Listen",
      summary: { title: "Audio · Winding down", lines: [{ Icon: Headphones, text: "An 8-minute settle for the afternoon." }] },
      action: { prompt: "Something gentle in your ears while you slow down.", buttons: [{ Icon: Headphones, label: "Play audio", href: "/Lifestyle?tab=listen" }] } },
    { key: "horoscope", eyebrow: "Lifestyle · Horoscope", accent: "#8E6E8E", Icon: Star, slug: "/Lifestyle?tab=horoscope", openLabel: "Open Horoscope",
      summary: { title: "Your sky today", lines: [{ Icon: Moon, text: `Your ${PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : ""} week, read against the moon.` }] },
      action: { prompt: "Read your sky, or ask it a question.", buttons: [{ Icon: Star, label: "Today's reading", href: "/Lifestyle?tab=horoscope" }] } },
    { key: "planner", eyebrow: "Planner · today's schedule", accent: T.gold, Icon: CalendarDays, slug: "/Planner", openLabel: "Open your plan",
      summary: { title: "The day, held lightly", lines: [{ Icon: Footprints, text: "A gentle walk", meta: "today" }, { Icon: Leaf, text: "Supplements — iron + vitamin D" }] },
      action: { prompt: "Lighter energy today — keep it kind. You don't need all of it.", buttons: [{ Icon: CalendarDays, label: "Open today's plan", href: "/Planner" }] } },
    { key: "programs", eyebrow: "Programs · practice", accent: T.sage, Icon: Activity, slug: "/ProgramsHub", openLabel: "Open programs",
      summary: { title: "A kind rhythm", lines: [{ Icon: Moon, text: "Tonight: a 10-minute body-scan to settle." }] },
      action: { prompt: "Tonight's practice is short and soft.", buttons: [{ Icon: Moon, label: "Tonight's practice", sheet: "practice" }] } },
    { key: "garden", eyebrow: "Companion · your garden", accent: T.sage, Icon: Sprout, slug: "/Garden", openLabel: "Open your garden",
      summary: { title: `${cName} · blooming`, lines: [{ Icon: Sprout, text: tended > 0 ? `Tended ${tended} ${tended === 1 ? "thing" : "things"} today — she felt each one.` : "She grows from everything you already do." }] },
      action: { prompt: "Tend her, reshape her, or just say hello.", buttons: [{ Icon: Sprout, label: "Visit your garden", href: "/Garden" }] } },
    { key: "pulse", eyebrow: "Pulse · patterns", accent: "#8E6E8E", Icon: TrendingUp, slug: "/Pulse", openLabel: "Open Pulse",
      summary: { title: "This week, gently read", lines: [{ Icon: TrendingUp, text: "Your energy, mood and cycle — patterns, never scores." }] },
      action: { prompt: "See the shape of your week — no scores, just patterns.", buttons: [{ Icon: TrendingUp, label: "See your patterns", href: "/Pulse" }] } },
  ];

  const SUGGESTIONS = [
    { Icon: Leaf, accent: T.sage, text: nut?.hasData ? "A few seeds or greens would lift today's iron — here's a 10-minute recipe." : "A warm, iron-friendly breakfast — here's a 10-minute recipe.", href: "/Nutrition" },
    { Icon: PenLine, accent: T.gold, text: (journal?.lastDays ?? 9) >= 2 ? "It's been a little while since you wrote — a gentle prompt is waiting." : "A quiet prompt is waiting whenever you want it.", href: "/Journal" },
    { Icon: BookOpen, accent: T.crimson, text: "The Books circle reached chapter 5 of Little Women — read along.", href: "/BookReader?gutenberg_id=514" },
    { Icon: Star, accent: "#8E6E8E", text: `Your ${PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : ""} week, read against the moon — have a look.`, href: "/Lifestyle?tab=horoscope" },
    { Icon: Activity, accent: T.sage, text: phase === "ovulatory" || phase === "follicular" ? "Energy's up — a fuller movement suits today." : "A calmer movement suits today — a fuller one next week.", href: "/ProgramsHub" },
  ];

  const TodIcon = TODS[tod].Icon;
  const showFirst = first;   // dev empty-state preview

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 96, position: "relative", overflow: "hidden" }}>
      <InkFilter />
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fw-hrow{scrollbar-width:none}.fw-hrow::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}`}</style>
      <div style={{ position: "absolute", top: 40, right: -12, pointerEvents: "none", zIndex: 0 }}><VineMotif color={T.sage} opacity={0.12} w={150} /></div>

      {/* dev ribbon + preview toggles */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: T.ink, color: T.paper, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: UI, fontSize: 11 }}>
        <span style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Demo · Today 6 — your day (live data)</span>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>preview:</span>
        {["morning", "afternoon", "evening"].map((t) => (
          <button key={t} onClick={() => { setTod(t); setFirst(false); }} style={{ background: tod === t && !first ? T.paper : "transparent", color: tod === t && !first ? T.ink : T.paper, border: `1px solid ${T.paper}`, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: UI }}>{t}</button>
        ))}
        <button onClick={() => setFirst((v) => !v)} style={{ background: first ? T.paper : "transparent", color: first ? T.ink : T.paper, border: `1px solid ${T.paper}`, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: UI }}>first day</button>
        <button onClick={() => { try { localStorage.removeItem(SEEN_KEY); } catch { /* ignore */ } setGrowStage(0); setCeremony(true); }} style={{ background: "transparent", color: T.paper, border: `1px solid ${T.paper}`, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: UI }}>replay intro</button>
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0", position: "relative", zIndex: 1 }}>
        {/* date + time-of-day + cycle calendar icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 6, position: "relative" }}>
          <TodIcon size={14} color={T.muted} />
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>{TODS[tod].label} · {longDate()}</span>
          <button onClick={() => setCalOpen(true)} aria-label="Open your cycle calendar" title="Cycle calendar"
            style={{ position: "absolute", right: 0, top: -2, width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <CalendarHeart size={19} color={phaseColor} strokeWidth={1.8} />
          </button>
        </div>

        {/* (1) HERO — real companion bloom inside the real cycle ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 6 }}>
          <PhaseRing phase={phase} day={hasCycle && !showFirst ? cycle.cycleDay : 1} cycleLen={cycle.cycleLen} showMarker={hasCycle && !showFirst} size={296}>
            <Bloom form={cForm} stageIdx={showFirst ? 1 : 4} color={cAccent} accent={T.gold} bright size={184} />
          </PhaseRing>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -6 }}>
            <Heart size={15} />
            <Script size={40} color={T.ink}>{greeting}{name ? `, ${name}` : ""}</Script>
          </div>
          {hasCycle && !showFirst ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: phaseColor, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>Day {cycle.cycleDay} · {PHASE_LABEL[phase]}</span>
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
        <div style={{ marginTop: 18, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "17px 18px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Eyebrow color={T.gold} mb={0}>{showFirst ? "Your day begins" : tod === "evening" ? "How today went" : "Your day, in a few words"}</Eyebrow>
            <button onClick={() => setParaSeed((s) => s + 1)} aria-label="Refresh the day's words" title="A different turn of phrase" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 2, display: "inline-flex" }}><RefreshCw size={15} /></button>
          </div>
          <p key={paraSeed} className="fw-fade" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.55, margin: 0, animation: "fwFadeUp .3s ease both" }}>{paragraph}</p>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginTop: 11 }}>— Jess</div>
        </div>

        {/* (3) YOUR DAY — gentle checklist; ticking nourishes the garden */}
        <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "17px 17px 15px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
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
                {it.kind === "inapp" && <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.gold, border: `1px solid ${T.gold}66`, borderRadius: 99, padding: "2px 7px", flexShrink: 0 }}>in app</span>}
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }} placeholder="Add your own…" style={{ flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
            <button onClick={addCustom} style={{ flexShrink: 0, background: T.ink, color: T.paper, border: "none", borderRadius: 10, padding: "0 15px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 14, fontWeight: 700 }}><Plus size={15} /> Add</button>
          </div>
        </div>

        {/* (3b) CYCLE & SYMPTOMS — elevated near the top */}
        <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${phaseColor}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
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

        {/* (4) PER-SURFACE cards — each section is a CardStack row (the production
            Planner slider, reused verbatim): summary ⇄ action slides with the
            planner's card size, 3D depth, smooth motion, peek + ‹ • • › nav. */}
        <div style={{ marginTop: 24 }}>
          <Eyebrow mb={2} color={T.gold}>Across your day</Eyebrow>
          <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "2px 0 14px" }}>each part of your app, its own row · swipe a row sideways to do it</p>
          {(() => {
            // Lifestyle's sub-areas collapse into ONE "Lifestyle" row (swipe
            // through For You · Book of the Day · Daily Story · Listen ·
            // Horoscope). Every other surface is its own full-width pager row.
            const LIFE = ["foryou", "book", "story", "listen", "horoscope"];
            const lifeItems = SURFACES.filter((s) => LIFE.includes(s.key));
            const out = [];
            SURFACES.forEach((s) => {
              if (LIFE.includes(s.key)) {
                if (s.key === LIFE[0]) out.push(<LifestyleRow key="lifestyle" items={lifeItems} onSheet={setSheet} />);
              } else {
                out.push(<HorizontalRow key={s.key} s={s} onSheet={setSheet} />);
              }
            });
            return out;
          })()}
        </div>

        {/* (5) CROSS-APP SMART SUGGESTIONS */}
        <div style={{ marginTop: 22 }}>
          <Eyebrow mb={2} color={T.gold}>A few things I noticed</Eyebrow>
          <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "2px 0 10px" }}>gentle, tuned to your {PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : ""} phase · slide to see more</p>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", paddingBottom: 6 }}>
            {SUGGESTIONS.map((g, i) => { const Gi = g.Icon; return (
              <a key={i} href={g.href} style={{ flex: "0 0 80%", scrollSnapAlign: "start", textDecoration: "none", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${g.accent}`, borderRadius: 16, padding: "16px 16px", minHeight: 132, boxShadow: "0 8px 22px rgba(58,48,32,0.07)", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{ICON_DISC(Gi, g.accent)}<span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: g.accent }}>For you</span></span>
                <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.5, margin: "11px 0 auto" }}>{g.text}</span>
                <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: g.accent, display: "inline-flex", alignItems: "center", gap: 3, marginTop: 10 }}>have a look <ChevronRight size={14} /></span>
              </a>
            ); })}
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "28px 0 8px" }}>
          <Hand size={15} color={T.muted}>Calm by default. Everything's here when you want it, and nothing's owed.</Hand>
        </div>
      </div>

      {sheet && <ActionSheet sheetKey={sheet} uid={uid} cycle={cycle} onClose={() => setSheet(null)} onSaved={feedGarden} />}
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
        if (wh && text.trim()) await base44.functions.invoke("postEcho", { action: "post", user_id: uid, author_hash: wh, body: text.trim().slice(0, 800), phase: cycle?.phase, cycle_day: cycle?.cycleDay }).catch(() => {});
      } else if (kind === "qotd") {
        const wh = await communityHash(uid).catch(() => null);
        if (wh && text.trim()) await base44.functions.invoke("answerQotd", { user_id: uid, author_hash: wh, prompt_day: day, prompt_key: "q1", body: text.trim().slice(0, 800) }).catch(() => {});
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
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: cfg.accent }}>{cfg.eyebrow} · on Today</span>
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
                        <mt.Icon size={18} color={on ? cfg.accent : T.muted} strokeWidth={1.8} /><span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: on ? cfg.accent : T.muted }}>{mt.label}</span>
                      </button>); })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", marginBottom: 12 }}>
                    <Search size={16} color={T.muted} />
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder={method === "scan" ? "Point at a barcode…" : method === "say" ? "“I had porridge and a banana…”" : "Search foods (CoFID + branded)…"} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
                  </div>
                  <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, margin: "0 0 8px" }}>Recent &amp; quick-add</div>
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

// ── (8) Section ROW — its own row in the vertical list. WITHIN the row the cards live in a HORIZONTAL
// SWIPE TRACK: card 1 (summary) fills the row; card 2 (action) starts 80% across card 1 — so only its
// LEFT 20% sits under card 1 and the remaining ~80% FLOWS to the right into the swipe track. Swipe
// sideways to bring card 2 in. Cards are uniform full size + cream; rows independent. (Overlap is set
// purely by a negative margin = 20% of a card width; card dimensions never change.) ───────────────
// Full-WIDTH page-covering card (the TodayDemo1 reference): cream paper,
// 20-radius, own layered shadow, 4px accent left-rim. ~50% taller than the
// peek version (208 → 312) so each card is substantial. `height:100%` makes
// every slide in a row match the tallest. The CardStack `pager` variant
// supplies the full-width sizing (no side-peek), the scale(0.96→1) 3D depth,
// the smooth 320ms motion and the ‹ • • › dots/arrows nav.
const SLIDE_CARD = {
  background: T.paperHi, borderRadius: 20, boxSizing: "border-box",
  border: "1px solid rgba(212,193,180,0.5)",
  boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
  minHeight: 312, height: "100%", padding: "20px 21px",
  display: "flex", flexDirection: "column", overflow: "hidden",
};
const OPEN_LINK = { display: "inline-flex", alignItems: "center", gap: 4, marginTop: "auto", paddingTop: 10, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" };

// Summary face — title + up to 2 signal lines + an optional quote inset.
function SummarySlide({ s, eyebrow = "Today" }) {
  const quote = s.summary.inset ? (s.summary.inset.quote || "").slice(0, 80) : "";
  return (
    <article style={{ ...SLIDE_CARD, borderLeft: `4px solid ${s.accent}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
        {ICON_DISC(s.Icon, s.accent)}
        <Eyebrow color={s.accent}>{eyebrow}</Eyebrow>
      </div>
      <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 10px", lineHeight: 1.3 }}>{s.summary.title}</h3>
      {s.summary.lines.slice(0, 2).map((ln, j) => (
        <div key={j} style={{ display: "flex", alignItems: "center", gap: 9, margin: "7px 0" }}>
          {ln.Icon && <ln.Icon size={16} color={s.accent} strokeWidth={1.7} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ln.text}</span>
          {ln.meta && <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.muted, flexShrink: 0 }}>{ln.meta}</span>}
        </div>
      ))}
      {quote && (
        <div style={{ marginTop: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "10px 13px" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>“{quote}”</p>
        </div>
      )}
    </article>
  );
}

// Action face — prompt + the do-it-now buttons + open-full-page link.
function ActionSlide({ s, onSheet }) {
  return (
    <article style={{ ...SLIDE_CARD, borderLeft: `4px solid ${s.accent}` }}>
      <Eyebrow mb={11} color={s.accent}>Do it now</Eyebrow>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5, margin: "0 0 12px" }}>{s.action.prompt}</p>
      <div style={{ marginBottom: 2 }}>{s.action.buttons.map((b, k) => <ActionBtn key={k} Icon={b.Icon} href={b.href} onClick={b.sheet ? () => onSheet(b.sheet) : undefined} accent={s.accent}>{b.label}</ActionBtn>)}</div>
      <a href={s.slug} style={OPEN_LINK}>{s.openLabel} <ChevronRight size={14} /></a>
    </article>
  );
}

// A standard section row — a full-width pager of summary ⇄ action (and any
// further faces the section adds). No bleed: the page column's own 16px gutter
// is the card's edge, so the card covers the page width.
function HorizontalRow({ s, onSheet }) {
  return (
    <div style={{ margin: "0 0 6px" }}>
      <CardStack pager label={s.eyebrow}>
        <SummarySlide s={s} />
        <ActionSlide s={s} onSheet={onSheet} />
      </CardStack>
    </div>
  );
}

// One Lifestyle sub-item, summary + action combined onto a single full-width
// card (so the Lifestyle row swipes through one card per sub-area, not two).
function LifestyleSlide({ s, onSheet }) {
  const sub = s.eyebrow.replace(/^Lifestyle ·\s*/, "");
  const quote = s.summary.inset ? (s.summary.inset.quote || "").slice(0, 80) : "";
  return (
    <article style={{ ...SLIDE_CARD, borderLeft: `4px solid ${s.accent}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
        {ICON_DISC(s.Icon, s.accent)}
        <Eyebrow color={s.accent}>{sub}</Eyebrow>
      </div>
      <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 10px", lineHeight: 1.3 }}>{s.summary.title}</h3>
      {s.summary.lines.slice(0, 2).map((ln, j) => (
        <div key={j} style={{ display: "flex", alignItems: "center", gap: 9, margin: "7px 0" }}>
          {ln.Icon && <ln.Icon size={16} color={s.accent} strokeWidth={1.7} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ln.text}</span>
        </div>
      ))}
      {quote && (
        <div style={{ marginTop: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "10px 13px" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>“{quote}”</p>
        </div>
      )}
      <div style={{ marginTop: "auto", paddingTop: 12 }}>
        <div style={{ marginBottom: 2 }}>{s.action.buttons.map((b, k) => <ActionBtn key={k} Icon={b.Icon} href={b.href} onClick={b.sheet ? () => onSheet(b.sheet) : undefined} accent={s.accent}>{b.label}</ActionBtn>)}</div>
        <a href={s.slug} style={{ ...OPEN_LINK, marginTop: 0 }}>{s.openLabel} <ChevronRight size={14} /></a>
      </div>
    </article>
  );
}

// The unified Lifestyle row — one row, one full-width card per sub-area
// (For You · Book of the Day · Daily Story · Listen · Horoscope). Dots reflect
// the real sub-item count.
function LifestyleRow({ items, onSheet }) {
  return (
    <div style={{ margin: "0 0 6px" }}>
      <CardStack pager label="Lifestyle">
        {items.map((s) => <LifestyleSlide key={s.key} s={s} onSheet={onSheet} />)}
      </CardStack>
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
          {DOW.map((d, i) => <div key={`h${i}`} style={{ textAlign: "center", fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, paddingBottom: 2 }}>{d}</div>)}
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
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: PHASE_COLORS[peek.phase] || T.gold }}>{peek.label}{peek.phase ? ` · ${PHASE_LABEL[peek.phase]}` : ""}</span>
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
