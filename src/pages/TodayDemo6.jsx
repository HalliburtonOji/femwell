// TodayDemo6 — "Your day", the SYNTHESISED Today (garden-led + cycle-led + actionable in one).
// REBUILD v2 (Halli review): canonical STEM bloom inside the cycle ring; BIG rich cards (not
// strips) matching the good demos' TendCard treatment; the cross-app suggestions slider restored;
// EVERY app surface represented (incl. Book of the Day, Health Corner, Horoscope, Daily Story,
// Listen, Pulse…). Conforms to claude-state/BRAND_IDENTITY.md (type role-scale, one gold/crimson/
// cream, carved heart in the header, one tasteful botanical motif). PREVIEW ONLY — live Today
// untouched. Reachable via IDEAS → Brand & UX → Previews.
//
// Structure (Halli's): stem-bloom-in-cycle-ring hero → Jess day paragraph → "Your Day" checkable
// list (in-app + out-of-app, add-your-own, ticking nourishes the garden) → per-surface summary⇄
// action BIG sliding cards (one per surface, each with a full-page link) → cross-app smart-
// suggestions BIG sliding row. Calm by default; every card big, rich, beautiful.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, SCRIPT, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { Bloom } from "@/components/nurture/NurtureGarden";
import { FORM_LIST } from "@/components/nurture/companion";
import { useScrollLock } from "@/utils/useScrollLock";
import {
  PenLine, Salad, Users, Stethoscope, Sparkles, BookOpen, Feather, Headphones, Star, CalendarDays,
  Activity, Sprout, TrendingUp, Leaf, Moon, Footprints, Droplet, Coffee, Check, Plus, ChevronRight,
  Sun, Sunrise, Sunset, X, Send, Minus, Search, Mic, Camera, ScanLine, Clock, CalendarHeart,
} from "lucide-react";

const PLUM = "#8E6E8E";                                   // luteal phase hue (semantic set)
const PEONY = FORM_LIST.find((f) => f.key === "peony") || { key: "peony", fern: false };
const MOCK = { name: "Hannah", phase: "luteal", day: 22, cycleLen: 28, season: "Inner Autumn", companion: "Meadowlight" };
const CHECKS_KEY = "fw_demo6_checks_v2";
const PHASE_SEGMENTS = [
  { key: "menstrual", from: 1, to: 5 }, { key: "follicular", from: 6, to: 13 },
  { key: "ovulatory", from: 14, to: 16 }, { key: "luteal", from: 17, to: 28 },
];

// ── cycle phase ring (encircles the bloom) ─────────────────────────────────────────────────────
function pt(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function arcPath(cx, cy, r, s, e) { const [x1, y1] = pt(cx, cy, r, s), [x2, y2] = pt(cx, cy, r, e); return `M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${x2} ${y2}`; }
function PhaseRing({ phase, day, cycleLen, size = 300, children }) {
  const c = size / 2, r = size / 2 - 20;
  const segs = PHASE_SEGMENTS.map((s) => ({ ...s, start: ((s.from - 1) / cycleLen) * 360, end: (s.to / cycleLen) * 360, color: PHASE_COLORS[s.key], active: s.key === phase }));
  const markerDeg = ((day - 0.5) / cycleLen) * 360;
  const [mx, my] = pt(c, c, r, markerDeg);
  const pc = PHASE_COLORS[phase];
  const gid = "fwRing";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <style>{`@keyframes fwMarker{0%,100%{opacity:.18;transform:scale(1)}50%{opacity:.3;transform:scale(1.12)}}@media (prefers-reduced-motion:reduce){.fw-marker-halo{animation:none!important}}`}</style>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <radialGradient id={`${gid}-wash`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={pc} stopOpacity="0.15" />
            <stop offset="60%" stopColor={pc} stopOpacity="0.05" />
            <stop offset="100%" stopColor={pc} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* soft phase wash behind the bloom — depth + a centrepiece glow */}
        <circle cx={c} cy={c} r={r - 4} fill={`url(#${gid}-wash)`} />
        {/* faint full track the arcs sit on */}
        <circle cx={c} cy={c} r={r} fill="none" stroke={T.paperDeep} strokeWidth="2" opacity="0.4" />
        {/* the four phase arcs — the active one thicker + fully present, the rest quiet */}
        {segs.map((s) => (
          <path key={s.key} d={arcPath(c, c, r, s.start + 2, s.end - 2)} fill="none" stroke={s.color}
            strokeWidth={s.active ? 8 : 4.5} strokeLinecap="round" opacity={s.active ? 1 : 0.4} />
        ))}
        {/* day marker — a soft phase halo (gentle breath) + a crisp dot with a white collar */}
        <circle className="fw-marker-halo" cx={mx} cy={my} r="12" fill={pc} style={{ transformOrigin: `${mx}px ${my}px`, animation: "fwMarker 5.5s ease-in-out infinite" }} />
        <circle cx={mx} cy={my} r="7" fill={pc} stroke="#FFFDF7" strokeWidth="2.5" />
        <circle cx={mx} cy={my} r="2.4" fill="#FFFDF7" opacity="0.92" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

// ── one tasteful botanical line-motif (stroke-only, low opacity — per BRAND_IDENTITY §4) ────────
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
  // A "log/write" action opens an in-place pop-up sheet ON Today (onClick); a "read/open" action
  // navigates (href). Logging never leaves the page.
  if (onClick) return <button type="button" onClick={onClick} style={style}><Icon size={15} /> {children}</button>;
  return <a href={href} style={style}><Icon size={15} /> {children}</a>;
}

export default function TodayDemo6() {
  useEditorialFonts();
  const [tod, setTod] = useState(() => { try { const h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : "evening"; } catch { return "afternoon"; } });
  const [first, setFirst] = useState(false);
  const [done, setDone] = useState({});
  const [custom, setCustom] = useState([]);
  const [draft, setDraft] = useState("");
  const [justFed, setJustFed] = useState(false);

  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(CHECKS_KEY) || "{}"); if (v.done) setDone(v.done); if (v.custom) setCustom(v.custom); } catch { /* ignore */ }
  }, []);
  const firstPersist = useRef(true);
  useEffect(() => {
    if (firstPersist.current) { firstPersist.current = false; return; }
    try { localStorage.setItem(CHECKS_KEY, JSON.stringify({ done, custom })); } catch { /* ignore */ }
  }, [done, custom]);

  const phaseColor = PHASE_COLORS[MOCK.phase];
  const [sheet, setSheet] = useState(null);          // in-place log/write pop-up on Today (key) or null
  const [calOpen, setCalOpen] = useState(false);      // cycle calendar overlay
  const [loggedCount, setLoggedCount] = useState(0);  // logs done in-place this session (close the garden loop)
  const tended = useMemo(() => Object.values(done).filter(Boolean).length + loggedCount, [done, loggedCount]);
  const feedGarden = () => { setLoggedCount((n) => n + 1); setJustFed(true); setTimeout(() => setJustFed(false), 2200); };
  const toggle = (id) => setDone((prev) => { const next = { ...prev, [id]: !prev[id] }; if (next[id]) { setJustFed(true); setTimeout(() => setJustFed(false), 2200); } return next; });
  const addCustom = () => { const v = draft.trim(); if (!v) return; setCustom((prev) => [...prev, { id: "c" + Date.now(), label: v, kind: "outapp" }]); setDraft(""); };

  const ITEMS = [
    { id: "chapter", label: "Read today's chapter of Little Women", kind: "inapp", Icon: BookOpen, href: "/BookReader?gutenberg_id=514" },
    { id: "qotd", label: "Answer the Question of the Day", kind: "inapp", Icon: Users, href: "/Community" },
    { id: "line", label: "Leave a line in your journal", kind: "inapp", Icon: PenLine, href: "/Journal" },
    { id: "breakfast", label: "Log breakfast", kind: "inapp", Icon: Coffee, href: "/Nutrition" },
    { id: "walk", label: "A gentle 20-minute walk", kind: "outapp", Icon: Footprints },
    { id: "water", label: "A glass of water now", kind: "outapp", Icon: Droplet },
    { id: "winddown", label: "An early wind-down tonight (luteal)", kind: "outapp", Icon: Moon },
  ];
  const allItems = [...ITEMS, ...custom.map((c) => ({ ...c, Icon: Sparkles }))];

  const TODS = { morning: { Icon: Sunrise, label: "Morning" }, afternoon: { Icon: Sun, label: "Afternoon" }, evening: { Icon: Sunset, label: "Evening" } };
  const greeting = tod === "morning" ? "Good morning" : tod === "afternoon" ? "Good afternoon" : "Good evening";
  const paragraph = first
    ? `Welcome, ${MOCK.name}. This is your day — it begins quietly. Tell me where you are in your cycle and I'll shape it around you; for now, here are a couple of gentle ways to start. Your garden begins as a seed, and grows as you do.`
    : tod === "morning"
      ? `Here's your day, ${MOCK.name}. You're in your ${PHASE_LABEL[MOCK.phase].toLowerCase()} phase — ${MOCK.season} — day ${MOCK.day}, so energy runs a little inward; let's keep it kind. You've a walk and a GP call at three. A warm breakfast with some iron would suit today, and there's a quiet chapter of Little Women waiting whenever you fancy it. Nothing here is owed — just an offer.`
      : tod === "afternoon"
        ? `Where you are today, ${MOCK.name}: ${PHASE_LABEL[MOCK.phase].toLowerCase()} · ${MOCK.season} · day ${MOCK.day} — boundaries feel natural now, so it's a fine day to do a little less. You've logged a couple of meals (iron's leaning light — a few seeds would help); a five-minute settle or a line in your journal would land well before the afternoon picks up. Meadowlight's blooming, and tended herself with you today.`
        : `How it went, ${MOCK.name}. A ${PHASE_LABEL[MOCK.phase].toLowerCase()} day — ${MOCK.season} — and you showed up in small ways. As the light goes, a slow wind-down suits luteal: maybe tonight's body-scan, a sealed letter, or simply closing the day. Whatever you did or didn't do, your garden kept the soil warm.`;

  // EVERY app surface — each a big summary⇄action sliding pair (real route slugs from the scan)
  const SURFACES = [
    { key: "journal", eyebrow: "Journal", accent: T.gold, Icon: PenLine, slug: "/Journal", openLabel: "Open journal",
      summary: { title: "Leave her a line", lines: [{ text: "3 entries this cycle — your Phase Twin writes alongside you." }], inset: { eyebrow: "The last thing you wrote · two days ago", quote: "“I keep circling the same worry…”" } },
      action: { prompt: "A line is plenty. What would feel like enough today?", buttons: [{ Icon: PenLine, label: "Write a line", sheet: "line" }] } },
    { key: "nutrition", eyebrow: "Nutrition", accent: T.sage, Icon: Salad, slug: "/Nutrition", openLabel: "Open nutrition",
      summary: { title: "2 meals · ~840 kcal", lines: [{ Icon: Leaf, text: "Iron's leaning light — a few seeds would help.", meta: "P 38g" }, { Icon: Droplet, text: "Water", meta: "3 of 6" }] },
      action: { prompt: "A few seeds or leafy greens would lift today's iron.", buttons: [{ Icon: Salad, label: "Log a meal", sheet: "meal" }, { Icon: Droplet, label: "+ water", sheet: "water" }] } },
    { key: "community", eyebrow: "Community", accent: T.crimson, Icon: Users, slug: "/Community", openLabel: "Open community",
      summary: { title: "The meadow beyond your garden", lines: [{ text: "Today's question: “What small thing lifted you today?”", meta: "" }, { text: "A few sisters have answered." }], inset: { eyebrow: "An echo, fading", quote: "“It's held.” — anonymous" } },
      action: { prompt: "Answer the room, or leave an anonymous line of your own.", buttons: [{ Icon: Users, label: "Answer QOTD", sheet: "qotd" }, { Icon: Heart, label: "Post an echo", sheet: "echo" }] } },
    { key: "foryou", eyebrow: "Lifestyle · For You", accent: T.gold, Icon: Sparkles, slug: "/Lifestyle", openLabel: "Open Lifestyle",
      summary: { title: "8 picks for you today", lines: [{ text: "Cycle-synced reads, a gentle practice, and a listen — chosen for where you are." }] },
      action: { prompt: "A few things gathered for your afternoon.", buttons: [{ Icon: Sparkles, label: "See your picks", href: "/Lifestyle" }] } },
    { key: "book", eyebrow: "Lifestyle · Book of the Day", accent: T.muted, Icon: BookOpen, slug: "/BookReader?gutenberg_id=514", openLabel: "Open the library",
      summary: { title: "Today's chapter — Little Women", lines: [{ text: "Chapter 5 · about 9 minutes." }, { Icon: Users, text: "The Books circle is reading along — no rush, the thread waits." }] },
      action: { prompt: "A quiet chapter to read by her side.", buttons: [{ Icon: BookOpen, label: "Read the chapter", href: "/BookReader?gutenberg_id=514" }] } },
    { key: "story", eyebrow: "Lifestyle · Daily Story", accent: T.crimson, Icon: Feather, slug: "/Lifestyle?tab=daily_story", openLabel: "Open Daily Story",
      summary: { title: "Day 12 of 30 — “The Offering”", lines: [{ text: "Today's instalment · 3-minute read.", meta: "" }], inset: { eyebrow: "Where you left off", quote: "“…and she didn't look back, not yet.”" } },
      action: { prompt: "Pick the thread back up where you left it.", buttons: [{ Icon: Feather, label: "Read today's chapter", href: "/Lifestyle?tab=daily_story" }] } },
    { key: "listen", eyebrow: "Lifestyle · Listen", accent: T.gold, Icon: Headphones, slug: "/Lifestyle?tab=listen", openLabel: "Open Listen",
      summary: { title: "Audio · Winding down", lines: [{ Icon: Headphones, text: "An 8-minute settle for the afternoon." }, { text: "2 new podcasts in your followed topics." }] },
      action: { prompt: "Something gentle in your ears while you slow down.", buttons: [{ Icon: Headphones, label: "Play audio", href: "/Lifestyle?tab=listen" }] } },
    { key: "horoscope", eyebrow: "Lifestyle · Horoscope", accent: PLUM, Icon: Star, slug: "/Lifestyle?tab=horoscope", openLabel: "Open Horoscope",
      summary: { title: "Moon in Libra — a yes kind of day", lines: [{ Icon: Moon, text: "Your luteal week meets a softening sky — ease over push." }, { text: "Venus trines your Juno today." }] },
      action: { prompt: "Read your sky, or ask it a question.", buttons: [{ Icon: Star, label: "Today's reading", href: "/Lifestyle?tab=horoscope" }] } },
    { key: "planner", eyebrow: "Planner · today's schedule", accent: T.gold, Icon: CalendarDays, slug: "/Planner", openLabel: "Open your plan",
      summary: { title: "The day, held lightly", lines: [{ Icon: Footprints, text: "A 10-minute walk", meta: "morning" }, { Icon: Heart, text: "GP call", meta: "3:00 pm" }, { Icon: Leaf, text: "Supplements — iron + vitamin D", meta: "" }] },
      action: { prompt: "Lighter energy today — keep it kind. You don't need all of it.", buttons: [{ Icon: CalendarDays, label: "Open today's plan", href: "/Planner" }] } },
    { key: "programs", eyebrow: "Programs · practice", accent: T.sage, Icon: Activity, slug: "/ProgramsHub", openLabel: "Open programs",
      summary: { title: "Sleep, gently · day 4 of 7", lines: [{ Icon: Moon, text: "Tonight: a 10-minute body-scan to settle." }, { text: "You're keeping a kind rhythm." }] },
      action: { prompt: "Tonight's practice is short and soft.", buttons: [{ Icon: Moon, label: "Tonight's practice", sheet: "practice" }] } },
    { key: "garden", eyebrow: "Companion · your garden", accent: T.sage, Icon: Sprout, slug: "/Garden", openLabel: "Open your garden",
      summary: { title: "Meadowlight · blooming", lines: [{ Icon: Sprout, text: "Tended 5 days this week — and today's line fed her." }, { text: "A rare bloom is forming nearby." }] },
      action: { prompt: "Tend her, reshape her, or just say hello.", buttons: [{ Icon: Sprout, label: "Visit your garden", href: "/Garden" }] } },
    { key: "pulse", eyebrow: "Pulse · patterns", accent: PLUM, Icon: TrendingUp, slug: "/Pulse", openLabel: "Open Pulse",
      summary: { title: "This week, gently read", lines: [{ Icon: TrendingUp, text: "Energy rising toward your peak · stress steady." }, { text: "2 quiet patterns spotted · wearable synced." }] },
      action: { prompt: "See the shape of your week — no scores, just patterns.", buttons: [{ Icon: TrendingUp, label: "See your patterns", href: "/Pulse" }] } },
  ];

  const SUGGESTIONS = [
    { Icon: Leaf, accent: T.sage, text: "Iron's been light this week — here's a 10-minute iron-rich recipe.", href: "/Nutrition" },
    { Icon: PenLine, accent: T.gold, text: "Three days since you wrote — a gentle prompt is waiting for you.", href: "/Journal" },
    { Icon: BookOpen, accent: T.crimson, text: "The Books circle reached chapter 5 of Little Women — read along.", href: "/BookReader?gutenberg_id=514" },
    { Icon: Star, accent: PLUM, text: "Moon in Libra meets your luteal week — read the pairing for today.", href: "/Lifestyle?tab=horoscope" },
    { Icon: Activity, accent: T.sage, text: "Luteal energy suits a calmer movement today — a fuller one next week.", href: "/ProgramsHub" },
  ];

  const TodIcon = TODS[tod].Icon;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 96, position: "relative", overflow: "hidden" }}>
      <InkFilter />
      {/* gentle, reduced-motion-safe entrance motion shared by the pop-up sheets + calendar */}
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim{animation:none!important}}`}</style>
      {/* one tasteful botanical motif, low opacity (BRAND_IDENTITY §4) */}
      <div style={{ position: "absolute", top: 40, right: -12, pointerEvents: "none", zIndex: 0 }}><VineMotif color={T.sage} opacity={0.12} w={150} /></div>

      {/* dev ribbon + preview toggles */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: T.ink, color: T.paper, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: UI, fontSize: 11 }}>
        <span style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Demo · Today 6 — your day (synthesised)</span>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>preview:</span>
        {["morning", "afternoon", "evening"].map((t) => (
          <button key={t} onClick={() => { setTod(t); setFirst(false); }} style={{ background: tod === t && !first ? T.paper : "transparent", color: tod === t && !first ? T.ink : T.paper, border: `1px solid ${T.paper}`, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: UI }}>{t}</button>
        ))}
        <button onClick={() => setFirst((v) => !v)} style={{ background: first ? T.paper : "transparent", color: first ? T.ink : T.paper, border: `1px solid ${T.paper}`, borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: UI }}>first day</button>
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0", position: "relative", zIndex: 1 }}>
        {/* date + time-of-day + cycle calendar icon (top) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 6, position: "relative" }}>
          <TodIcon size={14} color={T.muted} />
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>{TODS[tod].label} · Tuesday 16 June</span>
          <button onClick={() => setCalOpen(true)} aria-label="Open your cycle calendar" title="Cycle calendar"
            style={{ position: "absolute", right: 0, top: -2, width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <CalendarHeart size={19} color={phaseColor} strokeWidth={1.8} />
          </button>
        </div>

        {/* (1) HERO — canonical STEM bloom inside the cycle phase ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 6 }}>
          <PhaseRing phase={MOCK.phase} day={first ? 1 : MOCK.day} cycleLen={MOCK.cycleLen} size={296}>
            <Bloom form={PEONY} stageIdx={first ? 1 : 4} color={T.blush} accent={T.gold} bright size={184} />
          </PhaseRing>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -6 }}>
            <Heart size={15} />
            <Script size={40} color={T.ink}>{greeting}, {MOCK.name}</Script>
          </div>
          {!first && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: phaseColor, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>Day {MOCK.day} · {PHASE_LABEL[MOCK.phase]}</span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>{MOCK.season}</span>
            </div>
          )}
          <Hand size={17} color={T.muted} style={{ marginTop: 9, textAlign: "center", maxWidth: 330, lineHeight: 1.5 }}>
            {first ? "“Hello — I'm Meadowlight. We'll grow at your pace.”" : "“I'm turning inward today, drawing the petals close. We can rest, and still tend a little.”"}
          </Hand>
          {justFed && (
            <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.sage, marginTop: 9, display: "inline-flex", alignItems: "center", gap: 6 }}><Leaf size={14} /> Meadowlight felt that — a little more open</div>
          )}
        </div>

        {/* (2) DAY PARAGRAPH — Jess's synthesised voice (rule/LLM-generated live) */}
        <div style={{ marginTop: 18, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "17px 18px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)" }}>
          <Eyebrow mb={8} color={T.gold}>{first ? "Your day begins" : tod === "evening" ? "How today went" : "Your day, in a few words"}</Eyebrow>
          <p style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.55, margin: 0 }}>{paragraph}</p>
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

        {/* (3b) CYCLE & SYMPTOMS — elevated near the top (logging matters most) */}
        <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${PLUM}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 8px 22px rgba(58,48,32,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            {ICON_DISC(Stethoscope, PLUM)}
            <Eyebrow color={PLUM}>Cycle &amp; symptoms</Eyebrow>
            <button onClick={() => setCalOpen(true)} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: PLUM }}><CalendarHeart size={15} /> Calendar</button>
          </div>
          <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "0 0 6px", lineHeight: 1.3 }}>{PHASE_LABEL[MOCK.phase]} · day {MOCK.day} · {MOCK.season}</h3>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Boundaries feel natural now. Note anything your body's saying — it keeps your patterns honest.</p>
          <div>
            <ActionBtn Icon={Stethoscope} onClick={() => setSheet("symptom")} accent={PLUM}>Log a symptom</ActionBtn>
            <ActionBtn Icon={CalendarHeart} onClick={() => setCalOpen(true)} accent={PLUM}>Cycle calendar</ActionBtn>
          </div>
          <a href="/Health" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>Open your Health letters <ChevronRight size={14} /></a>
        </div>

        {/* (4) PER-SURFACE cards — a STACK SPREAD deck (every surface) */}
        <div style={{ marginTop: 24 }}>
          <Eyebrow mb={2} color={T.gold}>Across your day</Eyebrow>
          <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "2px 0 12px" }}>a little deck — tap a card to bring it forward and do it from here</p>
          <StackSpread surfaces={SURFACES} onSheet={setSheet} />
        </div>

        {/* (5) CROSS-APP SMART SUGGESTIONS — big sliding row */}
        <div style={{ marginTop: 22 }}>
          <Eyebrow mb={2} color={T.gold}>A few things I noticed</Eyebrow>
          <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "2px 0 10px" }}>gentle, tuned to your {PHASE_LABEL[MOCK.phase].toLowerCase()} phase · slide to see more</p>
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

      {/* In-place log/write pop-up — logging happens ON Today, no navigation away */}
      {sheet && <ActionSheet sheetKey={sheet} onClose={() => setSheet(null)} onSaved={feedGarden} />}
      {/* The beautiful, impressionistic cycle calendar (from the top icon) */}
      {calOpen && <CycleCalendar onClose={() => setCalOpen(false)} />}
    </div>
  );
}

// ── In-place action sheet (scroll-locked) — logging happens ON Today ───────────────────────────
// Each log/write action opens this brand sheet so she does it right here. On save it confirms in
// place ("Logged — Meadowlight felt that") and nourishes the garden, then closes. A secondary
// "open the full page" link remains on the card for the full experience.
const SHEETS = {
  line:    { eyebrow: "Journal", accent: "#A8893F", title: "Leave a line", kind: "text", placeholder: "A line is plenty…", cta: "Keep it", full: "/Journal", done: "Kept. Meadowlight felt that." },
  meal:    { eyebrow: "Nutrition", accent: "#8FAF8F", title: "Log a meal", kind: "meal", cta: "Log it", full: "/Nutrition", done: "Logged. Meadowlight felt that." },
  water:   { eyebrow: "Nutrition", accent: "#8FAF8F", title: "A glass of water", kind: "water", cta: "Add water", full: "/Nutrition", done: "Noted — 4 of 6 today." },
  qotd:    { eyebrow: "Community", accent: "#BC2E27", title: "Today's question", prompt: "What small thing lifted you today?", kind: "text", placeholder: "Answer the room (anonymous)…", cta: "Post anonymously", full: "/Community", done: "Shared with the room. Thank you." },
  echo:    { eyebrow: "Community", accent: "#BC2E27", title: "Leave an echo", kind: "text", placeholder: "A line, left anonymously, that fades…", cta: "Release it", full: "/Community", done: "Released. It's held." },
  symptom: { eyebrow: "Cycle & Health", accent: "#8E6E8E", title: "Note a symptom", kind: "chips", chips: ["Cramps", "Low mood", "Tired", "Headache", "Tender", "Bloated", "Calm"], cta: "Save the note", full: "/Health", done: "Noted, gently. Meadowlight felt that." },
  practice:{ eyebrow: "Programs", accent: "#8FAF8F", title: "Tonight's practice", prompt: "A 10-minute body-scan to settle.", kind: "begin", cta: "Begin", full: "/ProgramsHub", done: "Begun. Rest is part of it." },
};
function ActionSheet({ sheetKey, onClose, onSaved }) {
  useScrollLock(true);
  const cfg = SHEETS[sheetKey] || SHEETS.line;
  const [text, setText] = useState("");
  const [picked, setPicked] = useState([]);
  const [glasses, setGlasses] = useState(3);
  const [mealType, setMealType] = useState("Breakfast");
  const [method, setMethod] = useState("recents");   // search | recents | snap | say | scan
  const [saved, setSaved] = useState(false);
  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  const canSave = saved ? false : (cfg.kind === "text" ? text.trim().length > 0 : cfg.kind === "chips" ? picked.length > 0 : cfg.kind === "meal" ? picked.length > 0 : true);
  const save = () => { if (saved) return; setSaved(true); onSaved && onSaved(); setTimeout(onClose, 1300); };
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
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0 4px" }}>
            <span style={{ width: 30, height: 30, borderRadius: 99, background: T.sage, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.45 }}>{cfg.done}</span>
          </div>
        ) : (
          <>
            {cfg.prompt && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.inkSoft, margin: "0 0 12px", lineHeight: 1.45 }}>{cfg.prompt}</p>}
            {cfg.kind === "text" && <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={600} placeholder={cfg.placeholder} style={inputStyle} autoFocus />}
            {cfg.kind === "meal" && (() => {
              const METHODS = [
                { key: "search", Icon: Search, label: "Search" },
                { key: "recents", Icon: Clock, label: "Recents" },
                { key: "snap", Icon: Camera, label: "Snap" },
                { key: "say", Icon: Mic, label: "Say" },
                { key: "scan", Icon: ScanLine, label: "Scan" },
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
                  {/* meal type */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => {
                      const on = mealType === m;
                      return <button key={m} type="button" onClick={() => setMealType(m)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? cfg.accent : T.paperDeep}`, background: on ? cfg.accent : "transparent", color: on ? "#fff" : T.muted }}>{m}</button>;
                    })}
                  </div>
                  {/* log methods — like the real nutrition logger */}
                  <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                    {METHODS.map((mt) => {
                      const on = method === mt.key;
                      return (
                        <button key={mt.key} type="button" onClick={() => setMethod(mt.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 2px", borderRadius: 12, cursor: "pointer", border: `1px solid ${on ? cfg.accent : T.paperDeep}`, background: on ? `${cfg.accent}14` : "transparent" }}>
                          <mt.Icon size={18} color={on ? cfg.accent : T.muted} strokeWidth={1.8} />
                          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: on ? cfg.accent : T.muted }}>{mt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* search field */}
                  <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", marginBottom: 12 }}>
                    <Search size={16} color={T.muted} />
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder={method === "scan" ? "Point at a barcode…" : method === "say" ? "“I had porridge and a banana…”" : "Search foods (CoFID + branded)…"} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
                  </div>
                  {/* recents / quick-add */}
                  <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, margin: "0 0 8px" }}>Recent &amp; quick-add</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RECENTS.map((f) => {
                      const on = picked.includes(f.name);
                      return (
                        <button key={f.name} type="button" onClick={() => toggleFood(f.name)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: on ? `${cfg.accent}12` : T.paper, border: `1px solid ${on ? cfg.accent : T.paperDeep}`, borderRadius: 12, padding: "11px 13px", cursor: "pointer" }}>
                          <span style={{ flex: 1 }}>
                            <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.3 }}>{f.name}</span>
                            <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, marginTop: 2 }}>{f.meta}{f.tag ? ` · ${f.tag}` : ""}</span>
                          </span>
                          <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", background: on ? cfg.accent : "transparent", border: `1.5px solid ${on ? cfg.accent : T.paperDeep}`, color: "#fff" }}>{on ? <Check size={15} strokeWidth={3} /> : <Plus size={15} color={T.muted} />}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
            {cfg.kind === "water" && (() => {
              const stepBtn = { width: 52, height: 52, borderRadius: 14, border: `1.5px solid ${cfg.accent}`, background: "transparent", color: cfg.accent, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
              return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "4px 0 8px" }}>
                  <button type="button" onClick={() => setGlasses((g) => Math.max(0, g - 1))} aria-label="One fewer glass" style={stepBtn}><Minus size={22} strokeWidth={2.5} /></button>
                  <span style={{ flex: 1, textAlign: "center", fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>
                    <Droplet size={17} style={{ verticalAlign: "-3px", color: cfg.accent }} /> {glasses + 1} of 6 glasses
                  </span>
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
              <button type="button" onClick={save} disabled={!canSave} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: cfg.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: canSave ? "pointer" : "default", opacity: canSave ? 1 : 0.5 }}>
                <Send size={15} /> {cfg.cta}
              </button>
              <a href={cfg.full} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>or open the full page <ChevronRight size={14} /></a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── (8) Stack-spread deck — section cards layered in a cascade; tap brings one to front ────────
function StackSpread({ surfaces, onSheet }) {
  const [front, setFront] = useState(0);
  return (
    <div style={{ position: "relative" }}>
      {surfaces.map((s, i) => {
        const open = i === front;
        const It = s.Icon;
        // collapsed cards cascade ~20% beneath the one before; the front card and the card right
        // after it get a positive gap so the open card never sits under its neighbour.
        const mt = i === 0 ? 0 : (open || i === front + 1 ? 14 : -34);
        return (
          <div key={s.key} onClick={() => { if (!open) setFront(i); }}
            style={{
              position: "relative", marginTop: mt, zIndex: open ? 100 : i + 1,
              transform: open ? "scale(1)" : "scale(0.972)", transformOrigin: "center top",
              background: open ? "#fff" : T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${s.accent}`,
              borderRadius: 18, boxShadow: open ? "0 18px 38px rgba(58,48,32,0.18)" : "0 4px 12px rgba(58,48,32,0.08)",
              padding: open ? "16px 17px" : "13px 16px 24px", cursor: open ? "default" : "pointer",
              transition: "margin .34s cubic-bezier(.32,.72,.24,1), transform .34s cubic-bezier(.32,.72,.24,1), box-shadow .34s ease",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {ICON_DISC(It, s.accent)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Eyebrow color={s.accent}>{s.eyebrow}</Eyebrow>
                {!open && <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.summary.title}</div>}
              </div>
              <span aria-hidden style={{ width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center", background: open ? `${s.accent}1a` : "transparent", flexShrink: 0 }}>
                <ChevronRight size={16} color={open ? s.accent : T.muted} style={{ transform: open ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .3s cubic-bezier(.32,.72,.24,1)" }} />
              </span>
            </div>
            {open && (
              <div style={{ marginTop: 12 }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: "0 0 10px", lineHeight: 1.3 }}>{s.summary.title}</h3>
                {s.summary.lines.map((ln, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 9, margin: "8px 0" }}>
                    {ln.Icon && <ln.Icon size={15} color={s.accent} strokeWidth={1.7} style={{ flexShrink: 0 }} />}
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5 }}>{ln.text}</span>
                    {ln.meta && <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.muted, flexShrink: 0 }}>{ln.meta}</span>}
                  </div>
                ))}
                {s.summary.inset && (
                  <div style={{ marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px" }}>
                    <Eyebrow mb={3}>{s.summary.inset.eyebrow}</Eyebrow>
                    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>{s.summary.inset.quote}</p>
                  </div>
                )}
                <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.55, margin: "12px 0 10px" }}>{s.action.prompt}</p>
                <div>{s.action.buttons.map((b, k) => <ActionBtn key={k} Icon={b.Icon} href={b.href} onClick={b.sheet ? () => onSheet(b.sheet) : undefined} accent={s.accent}>{b.label}</ActionBtn>)}</div>
                <a href={s.slug} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>{s.openLabel} <ChevronRight size={14} /></a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── (7) Impressionistic cycle calendar — phase-tinted, past/predicted period, today, soft ──────
function CycleCalendar({ onClose }) {
  useScrollLock(true);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const YEAR = 2026, MONTH = 5; // June
  const startDow = new Date(YEAR, MONTH, 1).getDay();
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
  const lastPeriod = new Date(YEAR, 4, 26);   // 26 May → 16 Jun is cycle day 22
  const CYCLE = 28, TODAY = 16;
  const phaseOf = (cd) => cd <= 5 ? "menstrual" : cd <= 13 ? "follicular" : cd <= 16 ? "ovulatory" : "luteal";
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const elapsed = Math.round((new Date(YEAR, MONTH, d) - lastPeriod) / 86400000);
    const cd = ((elapsed % CYCLE) + CYCLE) % CYCLE + 1;
    cells.push({ d, phase: phaseOf(cd), isPeriod: cd <= 5, isToday: d === TODAY, future: d > TODAY });
  }
  const DOW = ["S", "M", "T", "W", "T", "F", "S"];
  const legend = [{ k: "menstrual", label: "Period" }, { k: "follicular", label: "Follicular" }, { k: "ovulatory", label: "Ovulatory" }, { k: "luteal", label: "Luteal" }];
  return (
    <div role="dialog" aria-modal="true" aria-label="Your cycle calendar" className="fw-scrim-anim"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.45)", animation: "fwScrimIn .22s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ ...PAPER_BG, width: "100%", maxWidth: 460, borderRadius: "22px 22px 0 0", padding: "18px 18px 28px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.24)", animation: "fwSheetIn .32s cubic-bezier(.32,.72,.24,1) both" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Script size={36} color={T.ink}>June</Script>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginTop: -2 }}>Luteal · day 22 · your inner autumn</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 16 }}>
          {DOW.map((d, i) => <div key={`h${i}`} style={{ textAlign: "center", fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, paddingBottom: 2 }}>{d}</div>)}
          {cells.map((c, i) => {
            if (!c) return <div key={i} />;
            const col = PHASE_COLORS[c.phase];
            const periodPast = c.isPeriod && !c.future;
            const periodPredicted = c.isPeriod && c.future;
            // watercolor wash — a soft radial tint per phase; period days bloom a little deeper.
            const bg = periodPast
              ? `radial-gradient(circle at 50% 38%, ${col}, ${col}cc)`
              : periodPredicted
                ? `radial-gradient(circle at 50% 40%, ${col}33, ${col}10)`
                : `radial-gradient(circle at 50% 42%, ${col}3a, ${col}12)`;
            return (
              <div key={i} style={{
                aspectRatio: "1 / 1", borderRadius: 14, display: "grid", placeItems: "center", position: "relative",
                background: bg,
                border: c.isToday ? `2px solid ${T.ink}` : periodPredicted ? `1.5px dashed ${col}99` : "1px solid transparent",
                boxShadow: periodPast ? `0 5px 14px ${col}66` : "none",
              }}>
                <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: c.isToday ? 700 : 500, color: periodPast ? "#fff" : T.ink }}>{c.d}</span>
                {c.isToday && <span style={{ position: "absolute", bottom: 5, width: 4, height: 4, borderRadius: 99, background: T.ink }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 13px", marginTop: 18, justifyContent: "center" }}>
          {legend.map((l) => {
            const here = l.k === MOCK.phase;
            return (
              <span key={l.k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: here ? 700 : 500, color: here ? T.ink : T.muted }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: PHASE_COLORS[l.k], opacity: here ? 1 : 0.5, boxShadow: here ? `0 0 0 2px ${PHASE_COLORS[l.k]}33` : "none" }} /> {l.label}{here ? " · you" : ""}
              </span>
            );
          })}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 500, color: T.muted }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, border: `1.5px dashed ${PHASE_COLORS.menstrual}99` }} /> Predicted
          </span>
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Hand size={16} color={T.inkSoft}>Your next chapter likely opens around the 23rd — softly predicted, never a deadline.</Hand>
        </div>
      </div>
    </div>
  );
}
