// TodayDemo6 — "Your day", the SYNTHESISED Today (garden-led + cycle-led + actionable in one).
// PREVIEW ONLY (mock data, self-contained, no backend). Reachable via IDEAS → Brand & UX →
// Previews. Does NOT touch the live Today. The candidate for the real Today.
// Brand: cream/plum, Ephesis/Cormorant, Lucide/SVG, no emoji, no scoreboards, no-guilt.
//
// Top to bottom: (1) hero — companion bloom encircled by the cycle phase ring (garden+cycle in
// one), her voice line; (2) Jess day-paragraph (time-of-day aware; rule/LLM-generated live);
// (3) "Your Day" — a gentle checklist of in-app + out-app invitations, persistent ticks,
// add-your-own, and checking nourishes the garden (loop made visible); (4) per-area sliding
// pairs (summary ⇄ action) for Journal/Nutrition/Community/Lifestyle/Health/Programs;
// (5) smart cross-app suggestions slider. Calm by default — paragraph + summaries first,
// everything actionable one slide/tap away.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SCRIPT, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import {
  Leaf, PenLine, BookOpen, Users, Moon, Coffee, Droplet, Footprints, Sparkles, Check, Plus,
  ChevronRight, Headphones, Activity, Stethoscope, Sun, Sunrise, Sunset,
} from "lucide-react";

// ── mock "today", synthesised across the app (live this would be rule/LLM-generated) ──────────
const MOCK = {
  name: "Hannah",
  phase: "luteal", day: 22, cycleLen: 28, season: "Inner Autumn",
  companion: "Meadowlight",
  lifeStage: "reproductive",
};
const PHASE_SEGMENTS = [
  { key: "menstrual", from: 1, to: 5 },
  { key: "follicular", from: 6, to: 13 },
  { key: "ovulatory", from: 14, to: 16 },
  { key: "luteal", from: 17, to: 28 },
];

const CHECKS_KEY = "fw_demo6_checks_v1";

// polar helper for the phase ring
function pt(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function arcPath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = pt(cx, cy, r, startDeg); const [x2, y2] = pt(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

// ── the bloom (peony), phase-tinted, with a vitality glow that brightens as she's tended ──────
function Bloom({ color, accent, vitality = 0, size = 150 }) {
  const open = Math.min(1, 0.7 + vitality * 0.06);
  const glow = Math.min(0.5, 0.18 + vitality * 0.06);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <circle cx="50" cy="50" r="30" fill={color} opacity={glow} />
      <g transform="translate(50 50)" opacity={open}>
        <g fill={T.blush}>
          {[0, 60, 120, 180, 240, 300].map((d) => (
            <ellipse key={d} cx="0" cy="-17" rx="11" ry="18" transform={`rotate(${d})`} />
          ))}
        </g>
        <g fill="#D99AA0" opacity="0.9">
          {[30, 150, 270].map((d) => <ellipse key={d} cx="0" cy="-12" rx="7" ry="12" transform={`rotate(${d})`} />)}
        </g>
        <circle cx="0" cy="0" r="8" fill={accent} />
      </g>
    </svg>
  );
}

// ── phase ring that encircles the bloom ───────────────────────────────────────────────────────
function PhaseRing({ phase, day, cycleLen, children }) {
  const cx = 140, cy = 140, r = 120;
  const segs = PHASE_SEGMENTS.map((s) => {
    const start = ((s.from - 1) / cycleLen) * 360;
    const end = (s.to / cycleLen) * 360;
    return { ...s, start, end, color: PHASE_COLORS[s.key], active: s.key === phase };
  });
  const markerDeg = ((day - 0.5) / cycleLen) * 360;
  const [mx, my] = pt(cx, cy, r, markerDeg);
  return (
    <div style={{ position: "relative", width: 280, height: 280 }}>
      <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.paperDeep} strokeWidth="3" opacity="0.5" />
        {segs.map((s) => (
          <path key={s.key} d={arcPath(cx, cy, r, s.start + 1.5, s.end - 1.5)} fill="none"
            stroke={s.color} strokeWidth={s.active ? 9 : 5} strokeLinecap="round" opacity={s.active ? 1 : 0.5} />
        ))}
        <circle cx={mx} cy={my} r="8" fill={PHASE_COLORS[phase]} stroke={T.paperHi} strokeWidth="3" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

// ── a card that slides between a SUMMARY and an ACTION (scroll-snap + peek + dots) ─────────────
function SlidePair({ accent, Icon, eyebrow, summary, action, openHref, openLabel }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  const onScroll = () => { const el = ref.current; if (!el) return; setIdx(el.scrollLeft > el.clientWidth * 0.4 ? 1 : 0); };
  return (
    <div style={{ margin: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px 6px" }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: `${accent}22`, color: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={15} strokeWidth={1.7} /></span>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted }}>{eyebrow}</span>
        <a href={openHref} style={{ marginLeft: "auto", fontFamily: UI, fontSize: 11, color: accent, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>{openLabel} <ChevronRight size={12} /></a>
      </div>
      <div ref={ref} onScroll={onScroll} style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", padding: "0 2px 2px" }}>
        <div style={{ flex: "0 0 86%", scrollSnapAlign: "start", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "14px 15px" }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>Today</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.45 }}>{summary}</div>
        </div>
        <div style={{ flex: "0 0 92%", scrollSnapAlign: "start", background: "#fff", border: `1.5px solid ${accent}`, borderRadius: 16, padding: "16px 16px", boxShadow: `0 2px 14px ${accent}22` }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Do it now</div>
          {action}
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 6 }}>
        {[0, 1].map((i) => <span key={i} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 99, background: i === idx ? accent : T.paperDeep, transition: "all .2s" }} />)}
      </div>
    </div>
  );
}
function ActionBtn({ accent, children, href }) {
  return <a href={href} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: accent, color: "#fff", borderRadius: 11, padding: "10px 15px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em", textDecoration: "none", marginRight: 8, marginTop: 4 }}>{children}</a>;
}

export default function TodayDemo6() {
  useEditorialFonts();
  const [tod, setTod] = useState(() => { try { const h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : "evening"; } catch { return "afternoon"; } });
  const [first, setFirst] = useState(false);   // preview the graceful first-day state
  const [done, setDone] = useState({});
  const [custom, setCustom] = useState([]);
  const [draft, setDraft] = useState("");
  const [justFed, setJustFed] = useState(false);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(CHECKS_KEY) || "{}"); if (s.done) setDone(s.done); if (s.custom) setCustom(s.custom); } catch { /* ignore */ }
  }, []);
  // persist on change (skip the very first run so the initial load doesn't overwrite storage)
  const firstPersist = useRef(true);
  useEffect(() => {
    if (firstPersist.current) { firstPersist.current = false; return; }
    try { localStorage.setItem(CHECKS_KEY, JSON.stringify({ done, custom })); } catch { /* ignore */ }
  }, [done, custom]);

  const phaseColor = PHASE_COLORS[MOCK.phase];
  const tended = useMemo(() => Object.values(done).filter(Boolean).length, [done]);

  // functional updaters — robust to rapid taps (no stale-closure loss)
  const toggle = (id) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) { setJustFed(true); setTimeout(() => setJustFed(false), 2200); }
      return next;
    });
  };
  const addCustom = () => {
    const v = draft.trim(); if (!v) return;
    const item = { id: "c" + Date.now(), label: v, kind: "outapp" };
    setCustom((prev) => [...prev, item]); setDraft("");
  };

  // checklist — in-app (deep-link) + out-app, luteal-tailored (gentler)
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
        ? `Where you are today, ${MOCK.name}: ${PHASE_LABEL[MOCK.phase].toLowerCase()} · ${MOCK.season} · day ${MOCK.day} — boundaries feel natural now, so it's a fine day to do a little less. You've logged a couple of meals (iron's leaning light — a few seeds would help); a five-minute settle or a line in your journal would land well before the afternoon picks up. Meadowlight's blooming, and tended itself with you today.`
        : `How it went, ${MOCK.name}. A ${PHASE_LABEL[MOCK.phase].toLowerCase()} day — ${MOCK.season} — and you showed up in small ways. As the light goes, a slow wind-down suits luteal: maybe tonight's body-scan, a sealed letter, or simply closing the day. Whatever you did or didn't do, your garden kept the soil warm.`;

  const SECTIONS = [
    { area: "Journal", accent: T.gold, Icon: PenLine, openHref: "/Journal", openLabel: "Open journal",
      summary: "3 entries this cycle · your last was two days ago: “I keep circling the same worry…”",
      action: (<div><div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45, marginBottom: 8 }}>A line is plenty. What would feel like enough today?</div><ActionBtn accent={T.gold} href="/Journal"><PenLine size={14} /> Leave a line</ActionBtn></div>) },
    { area: "Nutrition", accent: T.sage, Icon: Leaf, openHref: "/Nutrition", openLabel: "Open nutrition",
      summary: "2 meals · ~840 kcal · protein 38g · iron's leaning light · water 3 of 6",
      action: (<div><div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45, marginBottom: 8 }}>A few seeds or leafy greens would lift today's iron.</div><ActionBtn accent={T.sage} href="/Nutrition"><Coffee size={14} /> Log a meal</ActionBtn><ActionBtn accent={T.sage} href="/Nutrition"><Droplet size={14} /> + water</ActionBtn></div>) },
    { area: "Community", accent: T.crimson, Icon: Users, openHref: "/Community", openLabel: "Open community",
      summary: "Today's question: “What small thing lifted you today?” · a few sisters have answered · an echo: “It's held.”",
      action: (<div><div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45, marginBottom: 8 }}>Answer the room, or leave an anonymous line.</div><ActionBtn accent={T.crimson} href="/Community"><Users size={14} /> Answer QOTD</ActionBtn><ActionBtn accent={T.crimson} href="/Community"><Heart size={14} /> Post an echo</ActionBtn></div>) },
    { area: "Lifestyle", accent: T.gold, Icon: Headphones, openHref: "/Lifestyle", openLabel: "Open lifestyle",
      summary: "Today's read — “The quiet power of luteal rest” · and an 8-min listen, “Winding down”",
      action: (<div><div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45, marginBottom: 8 }}>Something gentle for the afternoon.</div><ActionBtn accent={T.gold} href="/Lifestyle"><Headphones size={14} /> Play audio</ActionBtn><ActionBtn accent={T.gold} href="/Lifestyle"><BookOpen size={14} /> Open the read</ActionBtn></div>) },
    { area: "Cycle & Health", accent: "#8E6E8E", Icon: Stethoscope, openHref: "/Health", openLabel: "Open health",
      summary: `${PHASE_LABEL[MOCK.phase]} · day ${MOCK.day} · ${MOCK.season} — boundaries feel natural now. Note anything your body's saying.`,
      action: (<div><div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45, marginBottom: 8 }}>A quick note keeps your patterns honest.</div><ActionBtn accent="#8E6E8E" href="/Health"><Stethoscope size={14} /> Log a symptom</ActionBtn></div>) },
    { area: "Programs", accent: T.sage, Icon: Activity, openHref: "/Programs", openLabel: "Open programs",
      summary: "Sleep, gently · day 4 of 7 · you're keeping a kind rhythm",
      action: (<div><div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45, marginBottom: 8 }}>Tonight: a 10-minute body-scan to settle.</div><ActionBtn accent={T.sage} href="/Programs"><Moon size={14} /> Tonight's practice</ActionBtn></div>) },
  ];

  const SUGGESTIONS = [
    { Icon: Leaf, accent: T.sage, text: "Iron's been light this week — a 10-min iron-rich recipe", href: "/Nutrition" },
    { Icon: PenLine, accent: T.gold, text: "Three days since you wrote — a gentle prompt is waiting", href: "/Journal" },
    { Icon: BookOpen, accent: T.crimson, text: "The Books circle reached chapter 5 — read along", href: "/Community" },
    { Icon: Activity, accent: "#8E6E8E", text: "Luteal energy — a calmer movement suits today (a fuller one next week)", href: "/Programs" },
  ];

  const TodIcon = TODS[tod].Icon;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 90 }}>
      <InkFilter />
      {/* dev ribbon + time-of-day / first-day toggles (preview only) */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: T.ink, color: T.paper, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: UI, fontSize: 10.5, letterSpacing: "0.06em" }}>
        <span style={{ fontWeight: 700, textTransform: "uppercase" }}>Demo · Today direction 6 — your day (synthesised)</span>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>preview:</span>
        {["morning", "afternoon", "evening"].map((t) => (
          <button key={t} onClick={() => { setTod(t); setFirst(false); }} style={{ background: tod === t && !first ? T.paper : "transparent", color: tod === t && !first ? T.ink : T.paper, border: `1px solid ${T.paper}`, borderRadius: 99, padding: "2px 8px", fontSize: 10, cursor: "pointer", fontFamily: UI }}>{t}</button>
        ))}
        <button onClick={() => setFirst((v) => !v)} style={{ background: first ? T.paper : "transparent", color: first ? T.ink : T.paper, border: `1px solid ${T.paper}`, borderRadius: 99, padding: "2px 8px", fontSize: 10, cursor: "pointer", fontFamily: UI }}>first day</button>
      </div>

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "16px 16px 0" }}>
        {/* date + time-of-day */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 6 }}>
          <TodIcon size={14} color={T.muted} />
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.muted }}>{TODS[tod].label} · Tuesday 16 June</span>
        </div>

        {/* (1) HERO — bloom encircled by the phase ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10 }}>
          <PhaseRing phase={MOCK.phase} day={first ? 0 : MOCK.day} cycleLen={MOCK.cycleLen}>
            <Bloom color={phaseColor} accent="#8E6E8E" vitality={first ? 0 : 2 + tended} size={150} />
          </PhaseRing>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: -6 }}>
            <Heart size={13} />
            <Script size={30} color={T.ink}>{greeting}, {MOCK.name}</Script>
          </div>
          {!first && (
            <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", color: phaseColor, marginTop: 4 }}>
              {PHASE_LABEL[MOCK.phase]} · Day {MOCK.day} · {MOCK.season}
            </div>
          )}
          <Hand size={16} color={T.muted} style={{ marginTop: 8, textAlign: "center", maxWidth: 320, lineHeight: 1.5 }}>
            {first ? "“Hello — I'm Meadowlight. We'll grow at your pace.”" : "“I'm turning inward today, drawing the petals close. We can rest, and still tend a little.”"}
          </Hand>
          {justFed && (
            <div style={{ fontFamily: UI, fontSize: 11, color: T.sage, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5 }}><Leaf size={13} /> Meadowlight felt that — a little more open</div>
          )}
        </div>

        {/* (2) DAY PARAGRAPH — Jess's synthesised voice (rule/LLM-generated live) */}
        <div style={{ marginTop: 18, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "16px 17px" }}>
          <Eyebrow mb={8}>{first ? "Your day begins" : tod === "evening" ? "How today went" : "Your day, in a few words"}</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: 16.5, color: T.ink, lineHeight: 1.6 }}>{paragraph}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, marginTop: 10 }}>— Jess</div>
        </div>

        {/* (3) YOUR DAY — gentle checklist; ticking nourishes the garden (loop made visible) */}
        <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "16px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Eyebrow mb={2}>Your day</Eyebrow>
            <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>invitations, never a score</span>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, margin: "2px 0 10px" }}>
            {tended > 0 ? `${tended} tended so far — each one fed your garden.` : "Tap a tick when you do one. No pressure — your garden grows from what you actually do."}
          </div>
          {allItems.map((it) => {
            const isDone = !!done[it.id]; const It = it.Icon;
            return (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: `1px solid ${T.paperDeep}66` }}>
                <button onClick={() => toggle(it.id)} aria-label="tick" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${isDone ? T.sage : T.paperDeep}`, background: isDone ? T.sage : "transparent", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", transition: "all .15s" }}>{isDone && <Check size={15} strokeWidth={3} />}</button>
                <It size={15} color={T.muted} style={{ flexShrink: 0 }} />
                {it.kind === "inapp" && it.href ? (
                  <a href={it.href} style={{ flex: 1, fontFamily: SERIF, fontSize: 15.5, color: isDone ? T.muted : T.ink, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.35 }}>{it.label}</a>
                ) : (
                  <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15.5, color: isDone ? T.muted : T.ink, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.35 }}>{it.label}</span>
                )}
                {it.kind === "inapp" && <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.gold, border: `1px solid ${T.gold}55`, borderRadius: 99, padding: "1px 6px", flexShrink: 0 }}>in app</span>}
              </div>
            );
          })}
          {/* add your own */}
          <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }} placeholder="Add your own…" style={{ flex: 1, minWidth: 0, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 9, padding: "9px 11px", fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none" }} />
            <button onClick={addCustom} style={{ flexShrink: 0, background: T.ink, color: T.paper, border: "none", borderRadius: 9, padding: "0 13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700 }}><Plus size={14} /> Add</button>
          </div>
        </div>

        {/* (4) SECTION SLIDING PAIRS — summary ⇄ action per area */}
        <div style={{ marginTop: 22 }}>
          <Eyebrow mb={2}>Across your day</Eyebrow>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "2px 0 6px" }}>slide each card → to do it from here</div>
          {SECTIONS.map((s) => (
            <SlidePair key={s.area} accent={s.accent} Icon={s.Icon} eyebrow={s.area} summary={s.summary} action={s.action} openHref={s.openHref} openLabel={s.openLabel} />
          ))}
        </div>

        {/* (5) SMART SUGGESTIONS — cross-app, actionable, no-guilt */}
        <div style={{ marginTop: 20 }}>
          <Eyebrow mb={2}>A few things I noticed</Eyebrow>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "2px 0 8px" }}>gentle, tuned to your {PHASE_LABEL[MOCK.phase].toLowerCase()} phase</div>
          <div style={{ display: "flex", gap: 11, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", paddingBottom: 4 }}>
            {SUGGESTIONS.map((g, i) => { const Gi = g.Icon; return (
              <a key={i} href={g.href} style={{ flex: "0 0 76%", scrollSnapAlign: "start", textDecoration: "none", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${g.accent}`, borderRadius: 15, padding: "14px 15px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: g.accent, fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}><Gi size={14} /> For you</span>
                <div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45, margin: "7px 0 2px" }}>{g.text}</div>
                <span style={{ fontFamily: UI, fontSize: 11, color: g.accent, display: "inline-flex", alignItems: "center", gap: 2 }}>have a look <ChevronRight size={12} /></span>
              </a>
            ); })}
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "26px 0 8px" }}>
          <Hand size={14} color={T.muted}>Calm by default. Everything's here when you want it, and nothing's owed.</Hand>
        </div>
      </div>
    </div>
  );
}
