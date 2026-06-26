// PlannerNewDemo — "The Day, Tended": dense sliding cards where each long card splits into TWO stacked
// demarcations (TOP + BOTTOM), EACH its own HORIZONTAL sub-slider. Demo-first. Live /Planner untouched.
//
// PATTERN (Halli's correction): the card stays full-length; a top half shows one topic and slides
// sideways through its lenses, a bottom half shows another topic and slides sideways through its lenses —
// two topics at once, more info, no empty space, never a whole-card vertical swap. The MAIN page slider
// stays horizontal (between boards). Within a lens, content may scroll vertically to reveal more.
//
// BOARDS (one horizontal main slider; each board = stepper/pills + a StackedCard of two sub-sliders):
//   1) "The day"  — stepper + add bar, then [Agenda] (top) · [Hour-by-hour · Week] (bottom).
//   2) "Reserves" — TOP slides Load → Recovery → Boundaries · BOTTOM slides Energy → Invisible → Life admin.
//   3) "Rituals"  — TOP slides Intentions → This season → Anchors · BOTTOM slides Reset → Focus → Rhythm.
// TOP-AREA chrome (out of the cards): Jump-to + Calendar (unified Today calendar overlay) + the two focus
// pills Speak-your-plan / Plan-a-day. Oxblood (#7A1A12) headings; varied card language. Seeded; real-entity
// mapped (PlannerItems / HabitLogs); no new base44 function.
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, X, Check, Mic, ChevronLeft, ChevronRight, Sun, Moon, CalendarDays, Gauge, Sparkles,
  Briefcase, Users, Heart, Coins, Smile, Leaf, Palette, Feather, ArrowRight, Trash2, Clock,
  Footprints, ListChecks, Utensils, Wind, Moon as MoonI, HeartHandshake, Layers, Timer,
  BatteryCharging, ShieldCheck, Trash, UserPlus, Repeat, CircleSlash, Baby, Flower2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes } from "@/components/brand/flora";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import {
  OXBLOOD, lbl, subCard, focusPill, Pill, Panel, Deck, StackedCard, BoardBody, TopChrome, SheetShell, JumpSheet,
  makeCalendarOverlay, fieldLabel, inputBase,
} from "@/components/brand/SliderKit";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);

const PHASE = {
  menstrual:  { label: "Menstrual",  hue: "#BC2E27", mult: 0.55, note: "Slow and soft — plan light, protect rest." },
  follicular: { label: "Follicular", hue: "#8FAF8F", mult: 1.10, note: "Building and curious — a good day to start and be bold." },
  ovulatory:  { label: "Ovulatory",  hue: "#D4AF37", mult: 1.20, note: "Your peak — big asks, the hard conversation." },
  luteal:     { label: "Luteal",     hue: "#8E6E8E", mult: 0.85, note: "Reflective and finishing — close loops, narrow down." },
};
function phaseFor(cycleDay, periodLen = 5, len = 28) { const cd = (((cycleDay - 1) % len) + len) % len + 1; if (cd <= periodLen) return "menstrual"; if (cd <= len * 0.5 - 2) return "follicular"; if (cd <= len * 0.5 + 2) return "ovulatory"; return "luteal"; }
const BASE_CYCLE_DAY = 8;
const SEASONS = {
  steady: { label: "Steady", Icon: Flower2, mult: 1.0, note: "Your usual rhythm." },
  newbaby: { label: "New baby", Icon: Baby, mult: 0.6, note: "The bar is lower on purpose. Sustaining is the win." },
  peri: { label: "Perimenopause", Icon: Leaf, mult: 0.72, note: "Flex with the day — small, sustainable moves." },
  caregiving: { label: "Caregiving", Icon: HeartHandshake, mult: 0.65, note: "Coordination is the work. Protect your reserves." },
};
const TYPE_META = {
  focus: { label: "Focus", Icon: Briefcase, cw: "plum", load: 2, energy: "deep" },
  task: { label: "Task", Icon: ListChecks, cw: "gold", load: 1, energy: "admin" },
  life: { label: "Life", Icon: Users, cw: "sage", load: 1, energy: "social" },
  move: { label: "Move", Icon: Footprints, cw: "sage", load: 0.5, energy: "restorative" },
  meal: { label: "Meal", Icon: Utensils, cw: "blush", load: 0.5, energy: "restorative" },
  rest: { label: "Rest", Icon: Moon, cw: "plum", load: 0.5, energy: "rest" },
};
const partOfDay = (h) => (h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening");
const SEED_DAYS = {
  0: [
    { id: "b1", hour: 8, title: "Morning walk", type: "move", dur: 30, done: true },
    { id: "b2", hour: 10, title: "Deep work — the pitch deck", type: "focus", dur: 90, done: false, anchor: true },
    { id: "b3", hour: 13, title: "Lunch with Mara", type: "life", dur: 60, done: false },
    { id: "b4", hour: 16, title: "Admin — invoices", type: "task", dur: 45, done: false },
    { id: "b5", hour: 20, title: "Wind-down + read", type: "rest", dur: 30, done: false },
  ],
  1: [{ id: "c1", hour: 9, title: "Send the deck", type: "task", dur: 20, done: false }, { id: "c2", hour: 18, title: "Yoga class", type: "move", dur: 60, done: false }],
  2: [{ id: "d1", hour: 11, title: "1:1 with Priya", type: "focus", dur: 45, done: false }],
};
const DOMAINS = [
  { id: "career", label: "Career", Icon: Briefcase, cw: "plum", prompt: "One real move on the thing that matters." },
  { id: "friend", label: "Friendship", Icon: Users, cw: "sage", prompt: "Reach for someone — a voice note counts." },
  { id: "love", label: "Love", Icon: Heart, cw: "crimson", prompt: "A small tenderness, given or received." },
  { id: "money", label: "Money", Icon: Coins, cw: "gold", prompt: "One quiet, kind thing for future-you." },
  { id: "joy", label: "Joy", Icon: Smile, cw: "gold", prompt: "Something purely for the fun of it." },
  { id: "rest", label: "Rest", Icon: Leaf, cw: "sage", prompt: "Permission to do less, on purpose." },
  { id: "create", label: "Create", Icon: Palette, cw: "blush", prompt: "Make a little something, badly, anyway." },
  { id: "self", label: "Self", Icon: Feather, cw: "plum", prompt: "A line in your own voice — who are you today?" },
];
const domainOf = (id) => DOMAINS.find((d) => d.id === id) || DOMAINS[0];
const SEED_INTENTIONS = [{ id: "i1", domain: "career", text: "Send the pitch — rough is fine, sent is better." }, { id: "i2", domain: "friend", text: "Be present at lunch. Phone in bag." }];
const SEED_SEASON_INTENTIONS = [{ id: "s1", domain: "self", text: "Protect two evenings a week that are mine." }, { id: "s2", domain: "career", text: "Ship the side project — a little each week." }];
const SEED_NOT_DOING = ["Not volunteering for the school fair this term.", "Not saying yes to the 7am calls."];
const SEED_ANCHORS = [
  { id: "a1", slot: "am", title: "Sunlight + water", done: true }, { id: "a2", slot: "am", title: "Move 5 minutes", done: true },
  { id: "a3", slot: "am", title: "Name today's intention", done: false }, { id: "a4", slot: "pm", title: "Phone down by 10", done: false }, { id: "a5", slot: "pm", title: "Read 10 pages", done: false },
];
const SEED_INVISIBLE = [
  { id: "v1", title: "Kids' dentist — book + remember", carry: "You notice · decide · track", handed: false },
  { id: "v2", title: "Mum's repeat prescription", carry: "You notice · track", handed: false },
  { id: "v3", title: "Sam's birthday — gift + card", carry: "You notice · plan", handed: false },
];
const SEED_ADMIN = [{ id: "ad1", title: "Car insurance renewal", due: "in 3 days", disp: null }, { id: "ad2", title: "Passport renewal form", due: "in 2 weeks", disp: null }, { id: "ad3", title: "That unused subscription", due: "—", disp: null }];
const ADMIN_DISP = [{ id: "delete", label: "Delete", Icon: Trash, cw: "crimson" }, { id: "delegate", label: "Delegate", Icon: UserPlus, cw: "sage" }, { id: "automate", label: "Automate", Icon: Repeat, cw: "plum" }, { id: "do", label: "Do it", Icon: Check, cw: "gold" }];
const RESETS = [
  { id: "move", label: "Move", Icon: Footprints, cw: "sage" }, { id: "cry", label: "A good cry", Icon: Wind, cw: "plum" }, { id: "hug", label: "A long hug", Icon: HeartHandshake, cw: "crimson" },
  { id: "create", label: "Make something", Icon: Palette, cw: "blush" }, { id: "breath", label: "Breathe", Icon: Wind, cw: "sage" }, { id: "connect", label: "Reach out", Icon: Users, cw: "gold" },
];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
function energyCurve(phase) { const mult = PHASE[phase].mult; return HOURS.map((h) => { const base = h < 9 ? 0.4 + (h - 7) * 0.12 : h <= 12 ? 0.7 + (h - 9) * 0.1 : h <= 15 ? 0.95 - (h - 12) * 0.13 : h <= 18 ? 0.6 + (h - 15) * 0.04 : 0.7 - (h - 18) * 0.12; return Math.max(0.12, Math.min(1, base * (0.7 + mult * 0.3))); }); }
const fmtHour = (h) => `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`;
const dayLabel = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); const base = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); return offset === 0 ? `${base} · Today` : offset === 1 ? `${base} · Tomorrow` : base; };

// ════════════════════════════════════════════════════════════════════════════
export default function PlannerNewDemo() {
  const [offset, setOffset] = useState(0);
  const [days, setDays] = useState(SEED_DAYS);
  const [intentions, setIntentions] = useState(SEED_INTENTIONS);
  const [anchors, setAnchors] = useState(SEED_ANCHORS);
  const [season, setSeason] = useState("steady");
  const [invisible, setInvisible] = useState(SEED_INVISIBLE);
  const [admin, setAdmin] = useState(SEED_ADMIN);
  const [editBlock, setEditBlock] = useState(null);
  const [intentDraft, setIntentDraft] = useState(null);
  const [toast, setToast] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const sliderRef = useRef(null);
  const dayDeckRef = useRef(null);

  useEffect(() => { (async () => { try { const u = await base44.auth.me(); setUser(u); const p = await base44.entities.UserProfile.filter({ user_id: u.id }, null, 1); setProfile(p?.[0] || null); } catch { /* preview unauth */ } })(); }, []);
  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2200); };

  const cycleDay = BASE_CYCLE_DAY + offset;
  const phaseKey = phaseFor(cycleDay);
  const ph = PHASE[phaseKey];
  const sn = SEASONS[season];
  const blocks = useMemo(() => (days[offset] || []).slice().sort((a, b) => a.hour - b.hour), [days, offset]);
  const capacity = Math.round(10 * ph.mult * sn.mult * 10) / 10;
  const load = useMemo(() => { let l = blocks.filter((b) => !b.done).reduce((s, b) => s + (TYPE_META[b.type]?.load ?? 1), 0); if (offset === 0) l += intentions.length * 0.5; return Math.round(l * 10) / 10; }, [blocks, intentions, offset]);
  const pct = capacity > 0 ? Math.round((load / capacity) * 100) : 0;
  const over = load > capacity;
  const curve = useMemo(() => energyCurve(phaseKey), [phaseKey]);
  const peakIdx = curve.indexOf(Math.max(...curve));
  const peakLabel = fmtHour(HOURS[peakIdx]);

  const addToDay = (raw, kind) => {
    const t = (raw || "").trim(); if (!t) return;
    const m = /(\d{1,2})\s?(am|pm)/i.exec(t);
    const hour = m ? (Number(m[1]) % 12) + (/pm/i.test(m[2]) ? 12 : 0) : HOURS[peakIdx];
    const type = kind || (/walk|run|gym|move|stretch|yoga/i.test(t) ? "move" : /lunch|dinner|coffee|drinks|see |call |meet/i.test(t) ? "life" : /deep|write|focus|pitch|work/i.test(t) ? "focus" : /eat|breakfast|snack|meal/i.test(t) ? "meal" : /rest|nap|breathe|reset|wind/i.test(t) ? "rest" : "task");
    const title = t.replace(/(at\s)?\d{1,2}\s?(am|pm)/i, "").trim() || t;
    setDays((ds) => ({ ...ds, [offset]: [...(ds[offset] || []), { id: "n" + Date.now(), hour, title: title.charAt(0).toUpperCase() + title.slice(1), type, dur: 45, done: false }] }));
    flash(offset === 0 ? "Added to today" : `Added to ${dayLabel(offset).split(" · ")[0]}`);
  };
  const toggleBlock = (id) => setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).map((b) => b.id === id ? { ...b, done: !b.done } : b) }));
  const saveBlock = (d) => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).map((b) => b.id === d.id ? d : b) })); setEditBlock(null); flash("Updated"); };
  const deleteBlock = (id) => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).filter((b) => b.id !== id) })); setEditBlock(null); flash("Removed"); };
  const toggleAnchor = (id) => setAnchors((as) => as.map((a) => a.id === id ? { ...a, done: !a.done } : a));
  const saveIntention = (d) => { if (d.id) setIntentions((xs) => xs.map((x) => x.id === d.id ? d : x)); else setIntentions((xs) => [...xs, { ...d, id: "i" + Date.now() }]); setIntentDraft(null); flash("Intention set"); };
  const removeIntention = (id) => setIntentions((xs) => xs.filter((x) => x.id !== id));
  const handOver = (id) => { setInvisible((xs) => xs.map((x) => x.id === id ? { ...x, handed: true } : x)); flash("Handed over — fully"); };
  const setDisp = (id, disp) => { setAdmin((xs) => xs.map((x) => x.id === id ? { ...x, disp } : x)); flash(disp === "delete" ? "Let go" : disp === "delegate" ? "Delegated" : disp === "automate" ? "Set to auto" : "On the list"); };
  const planReset = (label) => { addToDay(`${label} reset`, "rest"); flash(`Planned: ${label}`); };
  const jumpTo = (idx) => { setJumpOpen(false); sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); const track = sliderRef.current?.querySelector(".fw-clipboard-track"); const child = track?.children?.[idx]; if (track && child) track.scrollLeft = child.offsetLeft - track.offsetLeft; };
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crimson = cwOf("crimson").petal;
  const BOARDS = [{ t: "The day", sub: "Agenda · hour-by-hour · week" }, { t: "Reserves", sub: "Load · recovery · boundaries · energy · the invisible load" }, { t: "Rituals", sub: "Intentions · anchors · reset · focus · rhythm" }];

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }}>
        <FwFloraHero title="Your day" colorway="sage" bloom="snowdrop" flankL="iris" flankR="daffodil" titleColor={OXBLOOD}
          line="One day, tended to your energy. Build it, hold what matters, and leave room to rest." />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "8px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{ph.label} · Day {((cycleDay - 1) % 28) + 1}{season !== "steady" ? ` · ${sn.label}` : ""}</span>
        </div>

        <SummaryCard eyebrow="Today, at a glance" rows={[
          { Icon: CalendarDays, label: "Your day", text: `${blocks.length} on the plan · your peak window is ${peakLabel}`, onClick: () => jumpTo(0) },
          { Icon: Gauge, label: "Reserves", text: `${pct}% of a ${ph.label.toLowerCase()} day — ${over ? "a little full" : "room for more"}`, onClick: () => jumpTo(1) },
          { Icon: Layers, label: "The load", text: `${invisible.filter((v) => !v.handed).length} invisible · ${admin.filter((a) => !a.disp).length} admin to triage`, onClick: () => jumpTo(1) },
        ]} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setVoiceOpen(true)} style={focusPill(cwOf("plum").petal)}><Mic size={16} /> Speak your plan</button>
          <button onClick={() => setCalOpen(true)} style={focusPill(gold)}><CalendarDays size={16} /> Plan a day</button>
        </div>

        <div ref={sliderRef} style={{ marginTop: 16 }}>
          <ClipboardSlider hint="Slide your planner →" accent={gold}>

            <Clipboard title="The day" sub="BUILD IT · TEND IT TO YOUR ENERGY" accent={gold} flower="rose" idx="cb-day" titleColor={OXBLOOD}>
              <BoardBody>
                <DateStepper offset={offset} onStep={(d) => setOffset((o) => Math.max(-7, Math.min(21, o + d)))} phase={ph} pct={pct} over={over} />
                <AddInline onAdd={addToDay} dayName={dayLabel(offset).split(" · ").pop()} />
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Deck ref={dayDeckRef} accent={gold}>
                    <Panel label="Agenda" Icon={ListChecks} accent={gold}><Agenda blocks={blocks} anchors={anchors} peakIdx={peakIdx} phase={ph} offset={offset} onToggle={toggleBlock} onEdit={setEditBlock} onAnchor={toggleAnchor} /></Panel>
                    <Panel label="Hour by hour" Icon={Clock} accent={gold}><Hours blocks={blocks} peakHour={HOURS[peakIdx]} onEdit={setEditBlock} onAddHour={(h) => addToDay(`block at ${fmtHour(h)}`)} /></Panel>
                    <Panel label="The week" Icon={CalendarDays} accent={gold}><Week active={offset} onPick={(o) => { setOffset(o); flash(`Planning ${dayLabel(o).split(" · ")[0]}`); }} blocksByOff={days} /></Panel>
                  </Deck>
                </div>
              </BoardBody>
            </Clipboard>

            <Clipboard title="Reserves" sub="TWO TOPICS · EACH SLIDES SIDEWAYS" accent={sage} flower="snowdrop" idx="cb-res" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={cwOf("plum").petal}
                  top={[
                    <Panel key="load" label="Load" Icon={Gauge} accent={sage}><LoadLens load={load} capacity={capacity} pct={pct} over={over} onEase={over ? () => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).filter((b) => !(b.type === "task" && !b.done && !b.anchor)) })); flash("Lighter tasks moved off today"); } : null} /></Panel>,
                    <Panel key="rec" label="Recovery" Icon={MoonI} accent={sage}><RecoveryLens onPlanRest={() => { addToDay("Rest — protected", "rest"); flash("Rest block added"); }} /></Panel>,
                    <Panel key="bound" label="Boundaries" Icon={ShieldCheck} accent={sage}><BoundariesLens season={season} setSeason={(s) => { setSeason(s); flash(`Season: ${SEASONS[s].label}`); }} onLowDay={() => flash("Low-capacity day — plan shrunk")} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="energy" label="Energy" Icon={BatteryCharging} accent={cwOf("plum").petal}><EnergyLens curve={curve} peakIdx={peakIdx} peakLabel={peakLabel} phase={ph} /></Panel>,
                    <Panel key="inv" label="Invisible labour" Icon={Layers} accent={cwOf("plum").petal}><InvisibleLens items={invisible} onHand={handOver} /></Panel>,
                    <Panel key="admin" label="Life admin" Icon={ListChecks} accent={cwOf("plum").petal}><AdminLens items={admin} onDisp={setDisp} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Rituals" sub="TWO TOPICS · EACH SLIDES SIDEWAYS" accent={crimson} flower="poppy" idx="cb-rit" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crimson} bottomAccent={gold}
                  top={[
                    <Panel key="today" label="Today's intentions" Icon={Sparkles} accent={crimson}><Intentions intentions={intentions} phaseKey={phaseKey} onEdit={setIntentDraft} onAdd={() => setIntentDraft({ domain: "career", text: "" })} onRemove={removeIntention} /></Panel>,
                    <Panel key="season" label="This season" Icon={Leaf} accent={crimson}><SeasonIntentions /></Panel>,
                    <Panel key="anchors" label="Anchors" Icon={Sun} accent={crimson}><AnchorsLens anchors={anchors} onToggle={toggleAnchor} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="reset" label="Reset" Icon={Wind} accent={gold}><ResetLens onPlan={planReset} /></Panel>,
                    <Panel key="focus" label="Focus" Icon={Timer} accent={gold}><FocusLens blocks={blocks} onStart={() => flash("Focus session — 25 min, I'm with you")} onFirstStep={(t) => flash(`First 2 minutes: ${t}`)} /></Panel>,
                    <Panel key="rhythm" label="Rhythm" Icon={Repeat} accent={gold}><RhythmLens season={sn} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "20px auto 0", maxWidth: 300, lineHeight: 1.55 }}>A planned day is a tended one. Only the few things that are truly yours.</p>
      </div>

      {editBlock && <BlockSheet draft={editBlock} peakHour={HOURS[peakIdx]} onClose={() => setEditBlock(null)} onSave={saveBlock} onDelete={() => deleteBlock(editBlock.id)} />}
      {intentDraft && <IntentionSheet draft={intentDraft} onClose={() => setIntentDraft(null)} onSave={saveIntention} />}
      {voiceOpen && <VoiceSheet onClose={() => setVoiceOpen(false)} onParse={(t) => { addToDay(t); setVoiceOpen(false); }} />}
      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
      {toast && <div style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>}
    </div>
  );
}

// ── The day: date stepper + quick add ────────────────────────────────────────
function DateStepper({ offset, onStep, phase, pct, over }) {
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  return (
    <div style={{ marginBottom: 10, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={() => onStep(-1)} aria-label="Previous day" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.inkSoft, cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronLeft size={16} /></button>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: T.ink }}>{dayLabel(offset)}</span>
        <button onClick={() => onStep(1)} aria-label="Next day" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.inkSoft, cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronRight size={16} /></button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: phase.hue, flexShrink: 0 }} />
        <span style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(58,44,26,0.10)", overflow: "hidden", position: "relative" }}>
          <span style={{ position: "absolute", inset: 0, width: `${Math.min(130, pct) / 130 * 100}%`, background: barColor }} />
          <span style={{ position: "absolute", top: 0, left: `${100 / 130 * 100}%`, height: "100%", width: 2, background: "rgba(58,44,26,0.28)" }} />
        </span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: barColor, flexShrink: 0 }}>{pct}% full</span>
      </div>
    </div>
  );
}
function AddInline({ onAdd, dayName }) {
  const [text, setText] = useState("");
  const submit = () => { if (text.trim()) { onAdd(text); setText(""); } };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 6px 6px 12px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, marginBottom: 10, flexShrink: 0 }}>
      <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={`Add to ${dayName.toLowerCase()}…`} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontFamily: SERIF, fontSize: 15, color: T.ink }} />
      <button onClick={submit} aria-label="Add to your day" style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: cwOf("gold").petal, border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={16} /></button>
    </div>
  );
}
function Agenda({ blocks, anchors, peakIdx, phase, offset, onToggle, onEdit, onAnchor }) {
  const groups = ["Morning", "Afternoon", "Evening"];
  const byGroup = groups.map((g) => ({ g, items: blocks.filter((b) => partOfDay(b.hour) === g) })).filter((x) => x.items.length);
  return (
    <div style={{ flex: 1 }}>
      {offset === 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ ...lbl, marginBottom: 6 }}>Daily anchors</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {anchors.map((a) => (
              <button key={a.id} onClick={() => onAnchor(a.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, cursor: "pointer", background: a.done ? `${cwOf("sage").petal}1F` : T.paperHi, border: `1px solid ${a.done ? cwOf("sage").petal : T.paperDeep}`, fontFamily: UI, fontSize: 13, fontWeight: 600, color: a.done ? T.muted : T.inkSoft }}>
                {a.slot === "am" ? <Sun size={12} color={cwOf("gold").petal} /> : <Moon size={12} color={cwOf("plum").petal} />}
                <span style={{ textDecoration: a.done ? "line-through" : "none" }}>{a.title}</span>{a.done && <Check size={12} color={cwOf("sage").petal} />}
              </button>
            ))}
          </div>
        </div>
      )}
      {byGroup.length === 0 && <div style={{ textAlign: "center", padding: "24px 8px", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>Nothing planned yet — a soft, open day. Add the first thing above, or speak it.</div>}
      {byGroup.map(({ g, items }) => (
        <div key={g} style={{ marginBottom: 10 }}>
          <div style={{ ...lbl, color: phase.hue, marginBottom: 6 }}>{g}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((b) => {
              const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal;
              const peak = !b.done && b.hour >= HOURS[peakIdx] - 1 && b.hour <= HOURS[peakIdx] + 2;
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 9, ...subCard(tcw), padding: "7px 10px", background: T.paperHi }}>
                  <button onClick={() => onToggle(b.id)} aria-label={b.done ? "Mark not done" : "Mark done"} style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: "pointer", border: `1.5px solid ${b.done ? cwOf("sage").petal : T.paperDeep}`, background: b.done ? cwOf("sage").petal : "transparent", display: "grid", placeItems: "center" }}>{b.done && <Check size={12} color="#fff" />}</button>
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, width: 40, flexShrink: 0 }}>{fmtHour(b.hour)}</span>
                  <button onClick={() => onEdit(b)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: b.done ? T.muted : T.ink, textDecoration: b.done ? "line-through" : "none", lineHeight: 1.2 }}>{b.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1, flexWrap: "wrap" }}>
                      <tm.Icon size={11} color={tcw} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{tm.label}</span>
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: tcw, background: `${tcw}1A`, borderRadius: 999, padding: "0 7px" }}>{tm.energy}</span>
                      {peak && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: phase.hue }}>· peak</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p style={{ marginTop: "auto", paddingTop: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Tap a block to edit · tick to complete · the dot is its energy.</p>
    </div>
  );
}
function Hours({ blocks, peakHour, onEdit, onAddHour }) {
  return (
    <div style={{ flex: 1 }}>
      {HOURS.map((h) => {
        const here = blocks.filter((b) => b.hour === h); const isPeak = h === peakHour;
        return (
          <div key={h} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8, alignItems: "start", minHeight: 30, padding: "2px 0", borderTop: `1px solid ${T.paperDeep}55` }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isPeak ? PHASE.follicular.hue : T.muted, paddingTop: 5, textAlign: "right" }}>{fmtHour(h)}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 3 }}>
              {here.length === 0
                ? <button onClick={() => onAddHour(h)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, border: `1px dashed ${T.paperDeep}`, background: "transparent", color: T.muted, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Plus size={11} /> Add</button>
                : here.map((b) => { const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal; return (
                    <button key={b.id} onClick={() => onEdit(b)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", borderRadius: 10, background: `${tcw}1A`, borderLeft: `3px solid ${tcw}`, border: "none", cursor: "pointer", textAlign: "left" }}>
                      <tm.Icon size={12} color={tcw} style={{ flexShrink: 0 }} /><span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, textDecoration: b.done ? "line-through" : "none" }}>{b.title}</span>
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginLeft: "auto" }}>{b.dur}m</span></button>); })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function Week({ active, onPick, blocksByOff }) {
  const planned = Object.values(blocksByOff).reduce((s, a) => s + a.length, 0);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 10 }}>This week — each day carries its phase. Lean into the bright days, soften the tender ones.</div>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: 7 }, (_, o) => {
          const hue = PHASE[phaseFor(BASE_CYCLE_DAY + o)].hue; const d = new Date(); d.setDate(d.getDate() + o);
          const wd = d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2); const count = (blocksByOff[o] || []).length, isActive = o === active;
          return (
            <button key={o} onClick={() => onPick(o)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 1px", borderRadius: 11, cursor: "pointer", background: isActive ? `${hue}1F` : "transparent", border: isActive ? `1.5px solid ${hue}` : `1px solid ${T.paperDeep}` }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isActive ? T.ink : T.muted }}>{wd}</span>
              <span style={{ fontFamily: UI, fontSize: 15, fontWeight: 700, color: T.ink }}>{d.getDate()}</span>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: hue }} />
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>{count || "–"}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, margin: "12px 0", flexWrap: "wrap" }}>
        {Object.entries(PHASE).map(([k, v]) => <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}><span style={{ width: 7, height: 7, borderRadius: 99, background: v.hue }} /> {v.label}</span>)}
      </div>
      <div style={{ ...subCard(cwOf("gold").petal), marginTop: "auto" }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.45 }}>{planned} things planned this week. For the wider month, open the calendar.</p></div>
    </div>
  );
}

// ── Reserves lenses ──────────────────────────────────────────────────────────
function EnergyLens({ curve, peakIdx, peakLabel, phase }) {
  const max = Math.max(...curve);
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Your energy rises and dips through the day. {phase.note}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 64, margin: "4px 0 6px" }}>{curve.map((v, i) => <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, borderRadius: "3px 3px 0 0", background: i === peakIdx ? phase.hue : cwOf("sage").petal, opacity: i === peakIdx ? 1 : 0.42 }} />)}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 12 }}><span>7am</span><span>peak · {peakLabel}</span><span>10pm</span></div>
      <Eyebrow color={cwOf("sage").petal}>Match the task to the energy</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 0" }}><Pill cw="plum">deep → your peak</Pill><Pill cw="gold">admin → the dip</Pill><Pill cw="sage">restorative → anytime</Pill></div>
      <div style={{ ...subCard(cwOf("sage").petal), marginTop: "auto", background: `${cwOf("sage").petal}10` }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.45 }}>Bright window ~{peakLabel}. Plant the boldest thing there.</p></div>
    </div>
  );
}
function LoadLens({ load, capacity, pct, over, onEase }) {
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>How full is today?</span><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: barColor }}>{pct}%</span></div>
      <div style={{ height: 9, borderRadius: 99, background: "rgba(58,44,26,0.08)", overflow: "hidden", position: "relative", marginBottom: 10 }}><div style={{ position: "absolute", inset: 0, width: `${Math.min(130, pct) / 130 * 100}%`, background: barColor }} /><div style={{ position: "absolute", top: 0, left: `${100 / 130 * 100}%`, height: "100%", width: 2, background: "rgba(58,44,26,0.28)" }} /></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{over ? `A little over your usual capacity. Ease one lighter task and it settles.` : `Within capacity — you've planned ${load} of about ${capacity} units of energy.`}</p>
      <div style={{ ...subCard(cwOf("plum").petal), marginBottom: 10 }}><div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 3 }}>The finitude question</div><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, margin: 0, lineHeight: 1.4 }}>What are you deliberately <b>not</b> doing today?</p></div>
      {over ? <div style={{ marginTop: "auto" }}><Pill Icon={ArrowRight} cw="plum" filled onClick={onEase}>Ease today's load</Pill></div> : <p style={{ marginTop: "auto", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Leaving room is the plan working, not failing.</p>}
    </div>
  );
}
function RecoveryLens({ onPlanRest }) {
  const stats = [{ k: "Sleep", v: "6h 20m", note: "an hour short", cw: "plum" }, { k: "Readiness", v: "64", note: "running low", cw: "gold" }, { k: "HRV", v: "−12%", note: "vs your baseline", cw: "crimson" }];
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Rest is a booking, not a leftover. Your body's asking for a softer day.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>{stats.map((s) => <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(cwOf(s.cw).petal) }}><span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, width: 64 }}>{s.v}</span><span><span style={{ ...lbl, color: cwOf(s.cw).petal, display: "block" }}>{s.k}</span><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted }}>{s.note}</span></span></div>)}</div>
      <div style={{ marginTop: "auto" }}><Pill Icon={MoonI} cw="sage" filled onClick={onPlanRest}>Plan a rest block</Pill></div>
    </div>
  );
}
function BoundariesLens({ season, setSeason, onLowDay }) {
  const sn = SEASONS[season];
  return (
    <div style={{ flex: 1 }}>
      <Eyebrow color={cwOf("sage").petal}>Protected windows</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "8px 0 12px" }}>{["Evenings after 8 — no work", "Sunday — open, unplanned"].map((w) => <div key={w} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(cwOf("sage").petal) }}><ShieldCheck size={14} color={cwOf("sage").petal} style={{ flexShrink: 0 }} /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{w}</span></div>)}</div>
      <Eyebrow color={cwOf("plum").petal}>Your season of life</Eyebrow>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "4px 0 8px" }}>{sn.note}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>{Object.entries(SEASONS).map(([k, v]) => <Pill key={k} Icon={v.Icon} cw={k === "newbaby" ? "blush" : k === "peri" ? "sage" : k === "caregiving" ? "plum" : "gold"} active={season === k} onClick={() => setSeason(k)}>{v.label}</Pill>)}</div>
      <div style={{ marginTop: "auto" }}><Pill Icon={CircleSlash} cw="plum" onClick={onLowDay}>Make today a low-capacity day</Pill></div>
    </div>
  );
}
function InvisibleLens({ items, onHand }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>The work no one sees — the <b>noticing</b> and <b>remembering</b>. Hand it over <i>fully</i>.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items.map((v) => (
        <div key={v.id} style={{ ...subCard(v.handed ? cwOf("sage").petal : cwOf("plum").petal) }}>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 3 }}>{v.title}</div>
          {v.handed ? <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 700, color: cwOf("sage").petal }}><Check size={13} /> Handed to Alex — fully</div> : <><div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 7 }}>{v.carry}</div><Pill Icon={UserPlus} cw="plum" filled onClick={() => onHand(v.id)}>Hand it over</Pill></>}
        </div>
      ))}</div>
    </div>
  );
}
function AdminLens({ items, onDisp }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Life admin, biased toward <b>less</b>: can it go, go to someone, or go automatic?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{items.map((a) => {
        const chosen = ADMIN_DISP.find((d) => d.id === a.disp);
        return (
          <div key={a.id} style={{ ...subCard(a.disp ? cwOf(chosen.cw).petal : cwOf("gold").petal) }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 7 }}><span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{a.title}</span><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{a.due}</span></div>
            {chosen ? <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 700, color: cwOf(chosen.cw).petal }}><chosen.Icon size={13} /> {chosen.label === "Delete" ? "Let go" : chosen.label === "Do it" ? "On the list" : chosen.label + "d"}</div> : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{ADMIN_DISP.map((d) => <Pill key={d.id} Icon={d.Icon} cw={d.cw} onClick={() => onDisp(a.id, d.id)}>{d.label}</Pill>)}</div>}
          </div>
        );
      })}</div>
    </div>
  );
}

// ── Rituals lenses ───────────────────────────────────────────────────────────
function Intentions({ intentions, phaseKey, onEdit, onAdd, onRemove }) {
  const lean = { menstrual: ["rest", "self"], follicular: ["career", "create"], ovulatory: ["career", "love"], luteal: ["rest", "friend"] }[phaseKey] || ["self"];
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 10px", lineHeight: 1.5 }}>Up to three. Not tasks — what would make today feel like yours.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{intentions.map((it) => {
        const d = domainOf(it.domain), dcw = cwOf(d.cw).petal;
        return (
          <div key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 9, ...subCard(dcw) }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: `${dcw}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><d.Icon size={13} color={dcw} /></span>
            <button onClick={() => onEdit(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}><div style={{ ...lbl, color: dcw, marginBottom: 2 }}>{d.label}</div><div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.35 }}>{it.text}</div></button>
            <button onClick={() => onRemove(it.id)} aria-label="Remove intention" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, flexShrink: 0 }}><X size={15} /></button>
          </div>
        );
      })}</div>
      {intentions.length < 3 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ ...lbl, marginBottom: 6 }}>Add one — {PHASE[phaseKey].label.toLowerCase()} leans toward</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{lean.map(domainOf).map((d) => <Pill key={d.id} Icon={d.Icon} cw={d.cw} onClick={() => onEdit({ domain: d.id, text: "" })}>{d.label}</Pill>)}<Pill Icon={Plus} cw="gold" onClick={onAdd}>Other</Pill></div>
        </div>
      )}
    </div>
  );
}
function SeasonIntentions() {
  return (
    <div style={{ flex: 1 }}>
      <Eyebrow color={cwOf("crimson").petal}>Holding this season</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "8px 0 12px" }}>{SEED_SEASON_INTENTIONS.map((it) => { const d = domainOf(it.domain), dcw = cwOf(d.cw).petal; return <div key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 9, ...subCard(dcw) }}><d.Icon size={15} color={dcw} style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.35 }}>{it.text}</span></div>; })}</div>
      <Eyebrow color={cwOf("plum").petal}>Deliberately not doing</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>{SEED_NOT_DOING.map((t) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(cwOf("plum").petal) }}><CircleSlash size={14} color={cwOf("plum").petal} style={{ flexShrink: 0 }} /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.muted }}>{t}</span></div>)}</div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>What you set down makes room for what you're holding.</p>
    </div>
  );
}
function AnchorsLens({ anchors, onToggle }) {
  const groups = [{ slot: "am", label: "Morning", Icon: Sun, cw: "gold" }, { slot: "pm", label: "Evening", Icon: Moon, cw: "plum" }];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
      {groups.map((g) => {
        const items = anchors.filter((a) => a.slot === g.slot), done = items.filter((a) => a.done).length, accent = cwOf(g.cw).petal;
        return (
          <div key={g.slot}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><g.Icon size={15} color={accent} /><span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink }}>{g.label}</span><span style={{ ...lbl, marginLeft: "auto" }}>{done}/{items.length}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{items.map((a) => <button key={a.id} onClick={() => onToggle(a.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "7px 11px", borderRadius: 11, background: T.paperHi, border: `1px solid ${T.paperDeep}`, cursor: "pointer" }}><span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${a.done ? accent : T.paperDeep}`, background: a.done ? accent : "transparent", display: "grid", placeItems: "center" }}>{a.done && <Check size={13} color="#fff" />}</span><span style={{ fontFamily: SERIF, fontSize: 15, color: a.done ? T.muted : T.ink, textDecoration: a.done ? "line-through" : "none" }}>{a.title}</span></button>)}</div>
          </div>
        );
      })}
    </div>
  );
}
function ResetLens({ onPlan }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 6px" }}>Stress isn't finished when the stressor is. <b>Complete the cycle.</b></p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>{RESETS.map((r) => <button key={r.id} onClick={() => onPlan(r.label)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", borderRadius: 14, cursor: "pointer", background: `${cwOf(r.cw).petal}12`, border: `1px solid ${cwOf(r.cw).petal}55`, textAlign: "left" }}><span style={{ width: 30, height: 30, borderRadius: 9, background: `${cwOf(r.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={15} color={cwOf(r.cw).petal} /></span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{r.label}</span></button>)}</div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Tap one to plant it as a protected reset.</p>
    </div>
  );
}
function FocusLens({ blocks, onStart, onFirstStep }) {
  const stuck = blocks.filter((b) => !b.done && b.type === "focus")[0] || blocks.filter((b) => !b.done)[0];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>For a low-capacity or foggy day. Borrow some focus — start small, with company.</p>
      <div style={{ ...subCard(cwOf("gold").petal), marginBottom: 10 }}><div style={{ ...lbl, color: cwOf("gold").petal, marginBottom: 4 }}>Body-double session</div><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "0 0 9px", lineHeight: 1.45 }}>25 minutes, gently timed, "I'm working alongside you."</p><Pill Icon={Timer} cw="gold" filled onClick={onStart}>Start a 25-min focus</Pill></div>
      {stuck && <div style={{ ...subCard(cwOf("plum").petal) }}><div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 4 }}>The 2-minute first step</div><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "0 0 9px", lineHeight: 1.45 }}>Don't do "{stuck.title}". Just open it for two minutes.</p><Pill Icon={ArrowRight} cw="plum" filled onClick={() => onFirstStep(stuck.title)}>Start the first 2 minutes</Pill></div>}
    </div>
  );
}
function RhythmLens({ season }) {
  const week = [1, 1, 0, 1, 1, 1, 0];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>The honest read — gently. Consistency is a rhythm, not a scoreboard.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: T.ink }}>4</span><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted }}>day rhythm — the garden noticed.</span></div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>{week.map((d, i) => <div key={i} style={{ flex: 1, height: 32, borderRadius: 7, background: d ? cwOf("sage").petal : "rgba(58,44,26,0.08)", opacity: d ? 0.7 : 1, display: "grid", placeItems: "center" }}>{d ? <Check size={13} color="#fff" /> : null}</div>)}</div>
      <div style={{ ...subCard(cwOf("sage").petal), marginTop: "auto", background: `${cwOf("sage").petal}10` }}><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.45 }}>In a {season.label.toLowerCase()} season, a kept anchor most days is plenty.</p></div>
    </div>
  );
}

// ── sheets ──
function BlockSheet({ draft, peakHour, onClose, onSave, onDelete }) {
  const [d, setD] = useState(draft);
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <SheetShell title="Edit" eyebrowText="Your day" accent={cwOf("gold").petal} onClose={onClose}>
      <label style={fieldLabel}>What is it?</label>
      <input autoFocus value={d.title} onChange={(e) => set("title", e.target.value)} style={{ ...inputBase, marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={fieldLabel}>When</label><select value={d.hour} onChange={(e) => set("hour", Number(e.target.value))} style={inputBase}>{HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}{h === peakHour ? " · peak" : ""}</option>)}</select></div>
        <div><label style={fieldLabel}>How long</label><select value={d.dur} onChange={(e) => set("dur", Number(e.target.value))} style={inputBase}>{[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}</select></div>
      </div>
      <label style={fieldLabel}>Kind · energy</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{Object.entries(TYPE_META).map(([k, v]) => <button key={k} onClick={() => set("type", k)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: d.type === k ? cwOf(v.cw).petal : T.paper, color: d.type === k ? "#fff" : T.inkSoft, border: `1px solid ${d.type === k ? cwOf(v.cw).petal : T.paperDeep}`, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><v.Icon size={12} color={d.type === k ? "#fff" : cwOf(v.cw).petal} /> {v.label} · {v.energy}</button>)}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onDelete} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "12px 14px", borderRadius: 12, background: "transparent", color: T.crimson, border: `1px solid ${T.crimson}55`, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Trash2 size={13} /> Remove</button>
        <button onClick={() => d.title.trim() && onSave(d)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: cwOf("gold").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Save</button>
      </div>
    </SheetShell>
  );
}
function IntentionSheet({ draft, onClose, onSave }) {
  const [d, setD] = useState(draft);
  const dom = domainOf(d.domain);
  return (
    <SheetShell title="An intention" eyebrowText="What matters today" accent={cwOf("crimson").petal} onClose={onClose}>
      <label style={fieldLabel}>Which part of life?</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>{DOMAINS.map((x) => <button key={x.id} onClick={() => setD((s) => ({ ...s, domain: x.id }))} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 999, background: d.domain === x.id ? cwOf(x.cw).petal : T.paper, color: d.domain === x.id ? "#fff" : T.inkSoft, border: `1px solid ${d.domain === x.id ? cwOf(x.cw).petal : T.paperDeep}`, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><x.Icon size={12} color={d.domain === x.id ? "#fff" : cwOf(x.cw).petal} /> {x.label}</button>)}</div>
      <label style={fieldLabel}>The intention</label>
      <input autoFocus value={d.text} onChange={(e) => setD((s) => ({ ...s, text: e.target.value }))} placeholder={dom.prompt} style={{ ...inputBase, marginBottom: 8 }} />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 16px" }}>{dom.prompt}</p>
      <button onClick={() => d.text.trim() && onSave(d)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf("crimson").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Set this intention</button>
    </SheetShell>
  );
}
function VoiceSheet({ onClose, onParse }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  useEffect(() => { setListening(true); const t = window.setTimeout(() => { setText("Coffee with Sam at 3pm"); setListening(false); }, 700); return () => window.clearTimeout(t); }, []);
  return (
    <SheetShell title="Speak your plan" eyebrowText="Say it like you'd say it" accent={cwOf("plum").petal} onClose={onClose}>
      <div style={{ display: "grid", placeItems: "center", margin: "4px 0 14px" }}><span style={{ width: 64, height: 64, borderRadius: 999, background: `${cwOf("plum").petal}1F`, display: "grid", placeItems: "center" }}><Mic size={26} color={cwOf("plum").petal} /></span></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, textAlign: "center", margin: "0 0 14px", lineHeight: 1.5 }}>{listening ? "Listening…" : 'Say it the way you\'d tell a friend — "deep work at 10, lunch with Mara at 1" — and I\'ll lay it into your day.'}</p>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Deep work at 10am…" style={{ ...inputBase, marginBottom: 14 }} />
      <button onClick={() => text.trim() && onParse(text)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf("plum").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Lay it into my day</button>
    </SheetShell>
  );
}
