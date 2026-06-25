// PlannerNewDemo — the brand-rich SLIDING-CARD "Day, Tended", now ENRICHED. Demo-first.
// Live /Planner is NOT touched.
//
// This pass folds in the approved Planner-Enrichment preview (research + cited; see the IDEAS
// doc "Planner Enrichment"). Held together: full v4 brand bible + the §6.10 Clipboard sliding
// cards + in-card CardDecks + every feature, organised into DISTINCT boards (no duplicate pointers).
//
// THE STRUCTURE — signature top, then a horizontal slider of FIVE distinct rich boards, several
// carrying their OWN in-card swipe deck (slider-within-the-card):
//   1) "The day"   — the spine: ‹date› stepper + ONE add/voice input + a 3-lens deck
//                     (Agenda · Hour-by-hour · The week). Blocks now carry an ENERGY-TYPE tag.
//   2) "Reserves"  — (renamed from Capacity) a 4-lens deck: Energy · Load · Recovery · Boundaries.
//                     Boundaries holds the SEASON-OF-LIFE mode that lowers the default bar.
//   3) "The load"  — NEW. The differentiator: a 2-lens deck — Invisible labour (who notices/owns/
//                     tracks → hand it over fully) · Life admin (delete/delegate/automate/do).
//   4) "Intentions"— a 2-lens deck: Today · This season (what matters this season + what you're
//                     deliberately NOT doing).
//   5) "Rituals"   — a 4-lens deck: Anchors · Reset (stress-cycle completers) · Focus (body-double/
//                     2-min start) · Rhythm (consistency + seasonal flex).
//
// CARD LANGUAGE — variety, not generic cards: tile-grids inside boards, in-card swipe decks,
// accent-rim sub-cards, and focused COLOUR PILLS (filled action pills + tinted option pills).
// HEADINGS in DEEP-RED OXBLOOD Ephesis script (page + board titles) — richer than crimson.
//
// De-duplicated: ONE way to plan (the add/voice input; "tomorrow" = step the date / pick a week
// day). No logger-openers, no aliases, no two boards/cards opening the same surface. CUT (not
// planning): clinical trackers (HRT/kick/EPDS/symptom/BBT/doctor-export) — Health/Pulse.
//
// Seeded + interactive (React state, optimistic) so every tap works in preview; each interaction
// is annotated with the REAL base44 entity it would write live. NO new base44 FUNCTION; the only
// live-data additions the enrichments need are small ADDITIVE FIELDS (energy_type on PlannerItems;
// owner/admin-category for "The load"; a season pref) — demo is seeded so none are needed here.
import { useState, useMemo, useRef } from "react";
import {
  Plus, X, Check, Mic, ChevronLeft, ChevronRight, Sun, Moon, CalendarDays, Gauge, Sparkles,
  Briefcase, Users, Heart, Coins, Smile, Leaf, Palette, Feather, ArrowRight, Trash2, Clock,
  Footprints, ListChecks, Utensils, Wind, Moon as MoonI, HeartHandshake, Layers, Timer,
  BatteryCharging, ShieldCheck, Trash, UserPlus, Repeat, CircleSlash, Baby, Flower2,
} from "lucide-react";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard, CardDeck } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes } from "@/components/brand/flora";

// deep-red OXBLOOD — the page + board script-heading colour (richer than crimson #BC2E27)
const OXBLOOD = "#7A1A12";

// ── phase model (the cycle's seasons — §2.4 semantic hues) ───────────────────
const PHASE = {
  menstrual:  { label: "Menstrual",  hue: "#BC2E27", mult: 0.55, note: "Slow and soft — plan light, protect rest." },
  follicular: { label: "Follicular", hue: "#8FAF8F", mult: 1.10, note: "Building and curious — a good day to start and be bold." },
  ovulatory:  { label: "Ovulatory",  hue: "#D4AF37", mult: 1.20, note: "Your peak — big asks, the hard conversation." },
  luteal:     { label: "Luteal",     hue: "#8E6E8E", mult: 0.85, note: "Reflective and finishing — close loops, narrow down." },
};
function phaseFor(cycleDay, periodLen = 5, len = 28) {
  const cd = ((cycleDay - 1) % len) + 1;
  if (cd <= periodLen) return "menstrual";
  if (cd <= len * 0.5 - 2) return "follicular";
  if (cd <= len * 0.5 + 2) return "ovulatory";
  return "luteal";
}
const BASE_CYCLE_DAY = 8;

// season-of-life mode — lowers the default bar + shifts the tone (rides life_stage + a pref live)
const SEASONS = {
  steady:     { label: "Steady",        Icon: Flower2,        mult: 1.0,  note: "Your usual rhythm." },
  newbaby:    { label: "New baby",      Icon: Baby,           mult: 0.6,  note: "The bar is lower on purpose. Sustaining is the win." },
  peri:       { label: "Perimenopause", Icon: Leaf,           mult: 0.72, note: "Flex with the day — small, sustainable moves." },
  caregiving: { label: "Caregiving",    Icon: HeartHandshake, mult: 0.65, note: "Coordination is the work. Protect your reserves." },
};

// block kinds — each carries an ENERGY-TYPE (the new tag) + a load weight ─────
const TYPE_META = {
  focus:  { label: "Focus",  Icon: Briefcase,  cw: "plum",  load: 2,   energy: "deep" },
  task:   { label: "Task",   Icon: ListChecks, cw: "gold",  load: 1,   energy: "admin" },
  life:   { label: "Life",   Icon: Users,      cw: "sage",  load: 1,   energy: "social" },
  move:   { label: "Move",   Icon: Footprints, cw: "sage",  load: 0.5, energy: "restorative" },
  meal:   { label: "Meal",   Icon: Utensils,   cw: "blush", load: 0.5, energy: "restorative" },
  rest:   { label: "Rest",   Icon: Moon,       cw: "plum",  load: 0.5, energy: "rest" },
};
const partOfDay = (h) => (h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening");

const SEED_DAYS = {
  0: [
    { id: "b1", hour: 8,  title: "Morning walk",            type: "move", dur: 30, done: true  },
    { id: "b2", hour: 10, title: "Deep work — the pitch deck", type: "focus", dur: 90, done: false, anchor: true },
    { id: "b3", hour: 13, title: "Lunch with Mara",         type: "life", dur: 60, done: false },
    { id: "b4", hour: 16, title: "Admin — invoices",        type: "task", dur: 45, done: false },
    { id: "b5", hour: 20, title: "Wind-down + read",        type: "rest", dur: 30, done: false },
  ],
  1: [
    { id: "c1", hour: 9,  title: "Send the deck",           type: "task", dur: 20, done: false },
    { id: "c2", hour: 18, title: "Yoga class",              type: "move", dur: 60, done: false },
  ],
  2: [{ id: "d1", hour: 11, title: "1:1 with Priya",        type: "focus", dur: 45, done: false }],
};

const DOMAINS = [
  { id: "career", label: "Career",     Icon: Briefcase, cw: "plum",    prompt: "One real move on the thing that matters." },
  { id: "friend", label: "Friendship", Icon: Users,     cw: "sage",    prompt: "Reach for someone — a voice note counts." },
  { id: "love",   label: "Love",       Icon: Heart,     cw: "crimson", prompt: "A small tenderness, given or received." },
  { id: "money",  label: "Money",      Icon: Coins,     cw: "gold",    prompt: "One quiet, kind thing for future-you." },
  { id: "joy",    label: "Joy",        Icon: Smile,     cw: "gold",    prompt: "Something purely for the fun of it." },
  { id: "rest",   label: "Rest",       Icon: Leaf,      cw: "sage",    prompt: "Permission to do less, on purpose." },
  { id: "create", label: "Create",     Icon: Palette,   cw: "blush",   prompt: "Make a little something, badly, anyway." },
  { id: "self",   label: "Self",       Icon: Feather,   cw: "plum",    prompt: "A line in your own voice — who are you today?" },
];
const domainOf = (id) => DOMAINS.find((d) => d.id === id) || DOMAINS[0];
const SEED_INTENTIONS = [
  { id: "i1", domain: "career", text: "Send the pitch — rough is fine, sent is better." },
  { id: "i2", domain: "friend", text: "Be present at lunch. Phone in bag." },
];
const SEED_SEASON_INTENTIONS = [
  { id: "s1", domain: "self", text: "Protect two evenings a week that are mine." },
  { id: "s2", domain: "career", text: "Ship the side project — a little each week." },
];
const SEED_NOT_DOING = ["Not volunteering for the school fair this term.", "Not saying yes to the 7am calls."];

const SEED_ANCHORS = [
  { id: "a1", slot: "am", title: "Sunlight + water", done: true },
  { id: "a2", slot: "am", title: "Move 5 minutes", done: true },
  { id: "a3", slot: "am", title: "Name today's intention", done: false },
  { id: "a4", slot: "pm", title: "Phone down by 10", done: false },
  { id: "a5", slot: "pm", title: "Read 10 pages", done: false },
];

// "The load" seeds — invisible labour (CPE) + life admin (reduction-biased)
const SEED_INVISIBLE = [
  { id: "v1", title: "Kids' dentist — book + remember", carry: "You notice · decide · track", handed: false },
  { id: "v2", title: "Mum's repeat prescription", carry: "You notice · track", handed: false },
  { id: "v3", title: "Sam's birthday — gift + card", carry: "You notice · plan", handed: false },
];
const SEED_ADMIN = [
  { id: "ad1", title: "Car insurance renewal", due: "in 3 days", disp: null },
  { id: "ad2", title: "Passport renewal form", due: "in 2 weeks", disp: null },
  { id: "ad3", title: "That unused subscription", due: "—", disp: null },
];
const ADMIN_DISP = [
  { id: "delete", label: "Delete", Icon: Trash, cw: "crimson" },
  { id: "delegate", label: "Delegate", Icon: UserPlus, cw: "sage" },
  { id: "automate", label: "Automate", Icon: Repeat, cw: "plum" },
  { id: "do", label: "Do it", Icon: Check, cw: "gold" },
];

// stress-cycle completers (Nagoski) — the Reset lens
const RESETS = [
  { id: "move", label: "Move", Icon: Footprints, cw: "sage" },
  { id: "cry", label: "A good cry", Icon: Wind, cw: "plum" },
  { id: "hug", label: "A long hug", Icon: HeartHandshake, cw: "crimson" },
  { id: "create", label: "Make something", Icon: Palette, cw: "blush" },
  { id: "breath", label: "Breathe", Icon: Wind, cw: "sage" },
  { id: "connect", label: "Reach out", Icon: Users, cw: "gold" },
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
function energyCurve(phase) {
  const mult = PHASE[phase].mult;
  return HOURS.map((h) => {
    const base = h < 9 ? 0.4 + (h - 7) * 0.12 : h <= 12 ? 0.7 + (h - 9) * 0.1 : h <= 15 ? 0.95 - (h - 12) * 0.13 : h <= 18 ? 0.6 + (h - 15) * 0.04 : 0.7 - (h - 18) * 0.12;
    return Math.max(0.12, Math.min(1, base * (0.7 + mult * 0.3)));
  });
}
const fmtHour = (h) => `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`;
const dayLabel = (offset) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  const base = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return offset === 0 ? `${base} · Today` : offset === 1 ? `${base} · Tomorrow` : base;
};

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
  const sliderRef = useRef(null);

  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2200); };

  const cycleDay = BASE_CYCLE_DAY + offset;
  const phaseKey = phaseFor(cycleDay);
  const ph = PHASE[phaseKey];
  const sn = SEASONS[season];
  const blocks = useMemo(() => (days[offset] || []).slice().sort((a, b) => a.hour - b.hour), [days, offset]);

  // capacity = phase ceiling × season modifier; load fills it
  const capacity = Math.round(10 * ph.mult * sn.mult * 10) / 10;
  const load = useMemo(() => {
    let l = blocks.filter((b) => !b.done).reduce((s, b) => s + (TYPE_META[b.type]?.load ?? 1), 0);
    if (offset === 0) l += intentions.length * 0.5;
    return Math.round(l * 10) / 10;
  }, [blocks, intentions, offset]);
  const pct = capacity > 0 ? Math.round((load / capacity) * 100) : 0;
  const over = load > capacity;
  const curve = useMemo(() => energyCurve(phaseKey), [phaseKey]);
  const peakIdx = curve.indexOf(Math.max(...curve));
  const peakLabel = fmtHour(HOURS[peakIdx]);

  // ── ONE planning input (typed + voice → PlannerItems.create) ──
  const addToDay = (raw, kind) => {
    const t = (raw || "").trim(); if (!t) return;
    const m = /(\d{1,2})\s?(am|pm)/i.exec(t);
    const hour = m ? (Number(m[1]) % 12) + (/pm/i.test(m[2]) ? 12 : 0) : HOURS[peakIdx];
    const type = kind || (/walk|run|gym|move|stretch|yoga/i.test(t) ? "move" : /lunch|dinner|coffee|drinks|see |call |meet/i.test(t) ? "life" : /deep|write|focus|pitch|work/i.test(t) ? "focus" : /eat|breakfast|snack|meal/i.test(t) ? "meal" : /rest|nap|breathe|reset|wind/i.test(t) ? "rest" : "task");
    const title = t.replace(/(at\s)?\d{1,2}\s?(am|pm)/i, "").trim() || t;
    const blk = { id: "n" + Date.now(), hour, title: title.charAt(0).toUpperCase() + title.slice(1), type, dur: 45, done: false };
    setDays((ds) => ({ ...ds, [offset]: [...(ds[offset] || []), blk] }));
    flash(offset === 0 ? "Added to today" : `Added to ${dayLabel(offset).split(" · ")[0]}`);
  };
  const toggleBlock = (id) => setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).map((b) => b.id === id ? { ...b, done: !b.done } : b) }));
  const saveBlock = (d) => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).map((b) => b.id === d.id ? d : b) })); setEditBlock(null); flash("Updated"); };
  const deleteBlock = (id) => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).filter((b) => b.id !== id) })); setEditBlock(null); flash("Removed"); };
  const toggleAnchor = (id) => setAnchors((as) => as.map((a) => a.id === id ? { ...a, done: !a.done } : a));
  const saveIntention = (d) => {
    if (d.id) setIntentions((xs) => xs.map((x) => x.id === d.id ? d : x));
    else setIntentions((xs) => [...xs, { ...d, id: "i" + Date.now() }]);
    setIntentDraft(null); flash("Intention set");
  };
  const removeIntention = (id) => setIntentions((xs) => xs.filter((x) => x.id !== id));
  const handOver = (id) => { setInvisible((xs) => xs.map((x) => x.id === id ? { ...x, handed: true } : x)); flash("Handed over — fully"); }; // live: task.owner field
  const setDisp = (id, disp) => { setAdmin((xs) => xs.map((x) => x.id === id ? { ...x, disp } : x)); flash(disp === "delete" ? "Let go" : disp === "delegate" ? "Delegated" : disp === "automate" ? "Set to auto" : "On the list"); };
  const planReset = (label) => { addToDay(`${label} reset`, "rest"); flash(`Planned: ${label}`); };
  const toSlider = () => sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const gold = cwOf("gold").petal;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }}>

        {/* SIGNATURE TOP — flora hero (oxblood script title) + ONE summary */}
        <FwFloraHero
          title="Your day" colorway="sage" bloom="snowdrop" flankL="iris" flankR="daffodil" titleColor={OXBLOOD}
          line="One day, tended to your energy. Build it, hold what matters, and leave room to rest."
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "8px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{ph.label} · Day {((cycleDay - 1) % 28) + 1}{season !== "steady" ? ` · ${sn.label}` : ""}</span>
        </div>

        <SummaryCard
          eyebrow="Today, at a glance"
          rows={[
            { Icon: CalendarDays, label: "Your day", text: `${blocks.length} on the plan · your peak window is ${peakLabel}`, onClick: toSlider },
            { Icon: Gauge, label: "Reserves", text: `${pct}% of a ${ph.label.toLowerCase()} day — ${over ? "a little full" : "room for more"}`, onClick: toSlider },
            { Icon: Layers, label: "The load", text: `${invisible.filter((v) => !v.handed).length} invisible · ${admin.filter((a) => !a.disp).length} admin to triage`, onClick: toSlider },
          ]}
        />

        {/* THE SLIDING BOARDS (§6.10) — five DISTINCT rich clipboards, oxblood titles */}
        <div ref={sliderRef} style={{ marginTop: 18 }}>
          <ClipboardSlider hint="Slide your planner →" accent={gold}>

            {/* BOARD 1 — THE DAY */}
            <Clipboard title="The day" sub="BUILD IT · TEND IT TO YOUR ENERGY" accent={gold} flower="rose" idx="cb-day" titleColor={OXBLOOD}>
              <DateStepper offset={offset} onStep={(d) => setOffset((o) => Math.max(0, Math.min(6, o + d)))} phase={ph} pct={pct} over={over} />
              <AddInline onAdd={addToDay} dayName={dayLabel(offset).split(" · ").pop()} />
              <CardDeck accent={gold}>
                <Lens label="Agenda" Icon={ListChecks} accent={gold}>
                  <Agenda blocks={blocks} anchors={anchors} peakIdx={peakIdx} phase={ph} offset={offset} onToggle={toggleBlock} onEdit={setEditBlock} onAnchor={toggleAnchor} />
                </Lens>
                <Lens label="Hour by hour" Icon={Clock} accent={gold}>
                  <Hours blocks={blocks} peakHour={HOURS[peakIdx]} onEdit={setEditBlock} onAddHour={(h) => addToDay(`block at ${fmtHour(h)}`)} />
                </Lens>
                <Lens label="The week" Icon={CalendarDays} accent={gold}>
                  <Week active={offset} onPick={setOffset} />
                </Lens>
              </CardDeck>
            </Clipboard>

            {/* BOARD 2 — RESERVES (4-lens deck) */}
            <Clipboard title="Reserves" sub="WHAT YOU'RE WORKING WITH TODAY" accent={cwOf("sage").petal} flower="snowdrop" idx="cb-res" titleColor={OXBLOOD}>
              <CardDeck accent={cwOf("sage").petal}>
                <Lens label="Energy" Icon={BatteryCharging} accent={cwOf("sage").petal}>
                  <EnergyLens curve={curve} peakIdx={peakIdx} peakLabel={peakLabel} phase={ph} />
                </Lens>
                <Lens label="Load" Icon={Gauge} accent={cwOf("sage").petal}>
                  <LoadLens load={load} capacity={capacity} pct={pct} over={over}
                    onEase={over ? () => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).filter((b) => !(b.type === "task" && !b.done && !b.anchor)) })); flash("Lighter tasks moved off today"); } : null} />
                </Lens>
                <Lens label="Recovery" Icon={MoonI} accent={cwOf("sage").petal}>
                  <RecoveryLens onPlanRest={() => { addToDay("Rest — protected", "rest"); flash("Rest block added"); }} />
                </Lens>
                <Lens label="Boundaries" Icon={ShieldCheck} accent={cwOf("sage").petal}>
                  <BoundariesLens season={season} setSeason={(s) => { setSeason(s); flash(`Season: ${SEASONS[s].label}`); }} onLowDay={() => flash("Low-capacity day — plan shrunk")} />
                </Lens>
              </CardDeck>
            </Clipboard>

            {/* BOARD 3 — THE LOAD (2-lens deck) — the differentiator */}
            <Clipboard title="The load" sub="THE INVISIBLE WORK, MADE VISIBLE" accent={cwOf("plum").petal} flower="foxglove" idx="cb-load" titleColor={OXBLOOD}>
              <CardDeck accent={cwOf("plum").petal}>
                <Lens label="Invisible labour" Icon={Layers} accent={cwOf("plum").petal}>
                  <InvisibleLens items={invisible} onHand={handOver} />
                </Lens>
                <Lens label="Life admin" Icon={ListChecks} accent={cwOf("plum").petal}>
                  <AdminLens items={admin} onDisp={setDisp} />
                </Lens>
              </CardDeck>
            </Clipboard>

            {/* BOARD 4 — INTENTIONS (2-lens deck) */}
            <Clipboard title="Intentions" sub="WHAT MATTERS — TODAY & THIS SEASON" accent={cwOf("crimson").petal} flower="poppy" idx="cb-int" titleColor={OXBLOOD}>
              <CardDeck accent={cwOf("crimson").petal}>
                <Lens label="Today" Icon={Sparkles} accent={cwOf("crimson").petal}>
                  <Intentions intentions={intentions} phaseKey={phaseKey} onEdit={setIntentDraft} onAdd={() => setIntentDraft({ domain: "career", text: "" })} onRemove={removeIntention} />
                </Lens>
                <Lens label="This season" Icon={Leaf} accent={cwOf("crimson").petal}>
                  <SeasonIntentions />
                </Lens>
              </CardDeck>
            </Clipboard>

            {/* BOARD 5 — RITUALS (4-lens deck) */}
            <Clipboard title="Rituals" sub="ANCHORS · RESET · FOCUS · RHYTHM" accent={gold} flower="lavender" idx="cb-rit" titleColor={OXBLOOD}>
              <CardDeck accent={gold}>
                <Lens label="Anchors" Icon={Sun} accent={gold}>
                  <AnchorsLens anchors={anchors} onToggle={toggleAnchor} />
                </Lens>
                <Lens label="Reset" Icon={Wind} accent={gold}>
                  <ResetLens onPlan={planReset} />
                </Lens>
                <Lens label="Focus" Icon={Timer} accent={gold}>
                  <FocusLens blocks={blocks} onStart={() => flash("Focus session — 25 min, I'm with you")} onFirstStep={(t) => flash(`First 2 minutes: ${t}`)} />
                </Lens>
                <Lens label="Rhythm" Icon={Repeat} accent={gold}>
                  <RhythmLens season={sn} />
                </Lens>
              </CardDeck>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "20px auto 0", maxWidth: 300, lineHeight: 1.55 }}>
          A planned day is a tended one. Only the few things that are truly yours.
        </p>
      </div>

      {editBlock && <BlockSheet draft={editBlock} peakHour={HOURS[peakIdx]} onClose={() => setEditBlock(null)} onSave={saveBlock} onDelete={() => deleteBlock(editBlock.id)} />}
      {intentDraft && <IntentionSheet draft={intentDraft} onClose={() => setIntentDraft(null)} onSave={saveIntention} />}
      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>
      )}
    </div>
  );
}

// ══ shared bits ══════════════════════════════════════════════════════════════
const lbl = { fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted };
const subCard = (accent) => ({ background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "10px 12px" });

// a focused COLOUR PILL — filled (primary action) or tinted (option)
function Pill({ Icon, children, cw = "gold", filled, onClick, active }) {
  const c = cwOf(cw).petal;
  const style = filled || active
    ? { background: c, color: "#fff", border: `1px solid ${c}` }
    : { background: `${c}14`, color: T.inkSoft, border: `1px solid ${c}55` };
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer", ...style }}>
      {Icon && <Icon size={13} color={filled || active ? "#fff" : c} />}{children}
    </button>
  );
}

// the lens header inside a deck (so you always know which lens you're on)
function Lens({ label, Icon, accent, children }) {
  return (
    <div style={{ minHeight: 322 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <Icon size={14} color={accent} />
        <span style={{ ...lbl, color: accent }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

// ── BOARD 1 · date stepper (slim load read woven in) ──────────────────────────
function DateStepper({ offset, onStep, phase, pct, over }) {
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={() => onStep(-1)} disabled={offset === 0} aria-label="Previous day" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: offset === 0 ? T.paperDeep : T.inkSoft, cursor: offset === 0 ? "default" : "pointer", display: "grid", placeItems: "center" }}><ChevronLeft size={16} /></button>
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

// ── BOARD 1 · the ONE add/voice input ────────────────────────────────────────
function AddInline({ onAdd, dayName }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const submit = () => { if (text.trim()) { onAdd(text); setText(""); } };
  const mic = () => { setListening(true); window.setTimeout(() => { setText("Coffee with Sam at 3pm"); setListening(false); }, 700); };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 7px 7px 12px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, marginBottom: 14 }}>
      <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={listening ? "Listening…" : `Add to ${dayName.toLowerCase()}…`} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontFamily: SERIF, fontSize: 15, color: T.ink }} />
      <button onClick={mic} aria-label="Add by voice" style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: listening ? cwOf("sage").petal : T.paperHi, border: `1px solid ${T.paperDeep}`, color: listening ? "#fff" : cwOf("sage").petal, display: "grid", placeItems: "center", cursor: "pointer" }}><Mic size={15} /></button>
      <button onClick={submit} aria-label="Add to your day" style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: cwOf("gold").petal, border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={17} /></button>
    </div>
  );
}

// ── BOARD 1 · Agenda (anchors + time-grouped blocks w/ energy-type tag) ──────
function Agenda({ blocks, anchors, peakIdx, phase, offset, onToggle, onEdit, onAnchor }) {
  const groups = ["Morning", "Afternoon", "Evening"];
  const byGroup = groups.map((g) => ({ g, items: blocks.filter((b) => partOfDay(b.hour) === g) })).filter((x) => x.items.length);
  return (
    <div>
      {offset === 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...lbl, marginBottom: 7 }}>Daily anchors</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {anchors.map((a) => (
              <button key={a.id} onClick={() => onAnchor(a.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, cursor: "pointer", background: a.done ? `${cwOf("sage").petal}1F` : T.paperHi, border: `1px solid ${a.done ? cwOf("sage").petal : T.paperDeep}`, fontFamily: UI, fontSize: 13, fontWeight: 600, color: a.done ? T.muted : T.inkSoft }}>
                {a.slot === "am" ? <Sun size={12} color={cwOf("gold").petal} /> : <Moon size={12} color={cwOf("plum").petal} />}
                <span style={{ textDecoration: a.done ? "line-through" : "none" }}>{a.title}</span>
                {a.done && <Check size={12} color={cwOf("sage").petal} />}
              </button>
            ))}
          </div>
        </div>
      )}
      {byGroup.length === 0 && <div style={{ textAlign: "center", padding: "22px 8px", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>Nothing planned yet — a soft, open day. Add the first thing above.</div>}
      {byGroup.map(({ g, items }) => (
        <div key={g} style={{ marginBottom: 12 }}>
          <div style={{ ...lbl, color: phase.hue, marginBottom: 6 }}>{g}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {items.map((b) => {
              const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal;
              const peak = !b.done && b.hour >= HOURS[peakIdx] - 1 && b.hour <= HOURS[peakIdx] + 2;
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 9, ...subCard(tcw), padding: "8px 10px", background: T.paperHi }}>
                  <button onClick={() => onToggle(b.id)} aria-label={b.done ? "Mark not done" : "Mark done"} style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: "pointer", border: `1.5px solid ${b.done ? cwOf("sage").petal : T.paperDeep}`, background: b.done ? cwOf("sage").petal : "transparent", display: "grid", placeItems: "center" }}>{b.done && <Check size={12} color="#fff" />}</button>
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, width: 40, flexShrink: 0 }}>{fmtHour(b.hour)}</span>
                  <button onClick={() => onEdit(b)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: b.done ? T.muted : T.ink, textDecoration: b.done ? "line-through" : "none", lineHeight: 1.25 }}>{b.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1, flexWrap: "wrap" }}>
                      <tm.Icon size={11} color={tcw} />
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{tm.label}</span>
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: tcw, background: `${tcw}1A`, borderRadius: 999, padding: "0 7px" }}>{tm.energy}</span>
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{b.dur}m</span>
                      {peak && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: phase.hue }}>· peak</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── BOARD 1 · Hours ──────────────────────────────────────────────────────────
function Hours({ blocks, peakHour, onEdit, onAddHour }) {
  return (
    <div style={{ maxHeight: 290, overflowY: "auto" }}>
      {HOURS.map((h) => {
        const here = blocks.filter((b) => b.hour === h);
        const isPeak = h === peakHour;
        return (
          <div key={h} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8, alignItems: "start", minHeight: 30, padding: "2px 0", borderTop: `1px solid ${T.paperDeep}55` }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isPeak ? PHASE.follicular.hue : T.muted, paddingTop: 5, textAlign: "right" }}>{fmtHour(h)}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 3 }}>
              {here.length === 0
                ? <button onClick={() => onAddHour(h)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, border: `1px dashed ${T.paperDeep}`, background: "transparent", color: T.muted, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Plus size={11} /> Add</button>
                : here.map((b) => {
                    const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal;
                    return (
                      <button key={b.id} onClick={() => onEdit(b)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", borderRadius: 10, background: `${tcw}1A`, borderLeft: `3px solid ${tcw}`, border: "none", cursor: "pointer", textAlign: "left" }}>
                        <tm.Icon size={12} color={tcw} style={{ flexShrink: 0 }} />
                        <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, textDecoration: b.done ? "line-through" : "none" }}>{b.title}</span>
                        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginLeft: "auto" }}>{b.dur}m</span>
                      </button>
                    );
                  })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── BOARD 1 · Week ────────────────────────────────────────────────────────────
function Week({ active, onPick }) {
  return (
    <div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 12 }}>Tap a day to plan it. Each carries its phase — lean into the bright days, soften the tender ones.</div>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: 7 }, (_, o) => {
          const cd = BASE_CYCLE_DAY + o, hue = PHASE[phaseFor(cd)].hue;
          const d = new Date(); d.setDate(d.getDate() + o);
          const wd = d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2);
          const count = (SEED_DAYS[o] || []).length, isActive = o === active;
          return (
            <button key={o} onClick={() => onPick(o)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "9px 1px", borderRadius: 11, cursor: "pointer", background: isActive ? `${hue}1F` : "transparent", border: isActive ? `1.5px solid ${hue}` : `1px solid ${T.paperDeep}` }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isActive ? T.ink : T.muted }}>{wd}</span>
              <span style={{ fontFamily: UI, fontSize: 15, fontWeight: 700, color: T.ink }}>{d.getDate()}</span>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: hue }} />
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>{count || "–"}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        {Object.entries(PHASE).map(([k, v]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: v.hue }} /> {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══ BOARD 2 · RESERVES lenses ════════════════════════════════════════════════
function EnergyLens({ curve, peakIdx, peakLabel, phase }) {
  const max = Math.max(...curve);
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Your energy rises and dips through the day. {phase.note}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 70, margin: "4px 0 6px" }}>
        {curve.map((v, i) => <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, borderRadius: "3px 3px 0 0", background: i === peakIdx ? phase.hue : cwOf("sage").petal, opacity: i === peakIdx ? 1 : 0.42 }} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 12 }}>
        <span>7am</span><span>peak · {peakLabel}</span><span>10pm</span>
      </div>
      <Eyebrow color={cwOf("sage").petal}>Match task to energy</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        <Pill cw="plum">deep → your peak</Pill>
        <Pill cw="gold">admin → the dip</Pill>
        <Pill cw="sage">restorative → anytime</Pill>
      </div>
    </div>
  );
}
function LoadLens({ load, capacity, pct, over, onEase }) {
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>How full is today?</span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: barColor }}>{pct}%</span>
      </div>
      <div style={{ height: 9, borderRadius: 99, background: "rgba(58,44,26,0.08)", overflow: "hidden", position: "relative", marginBottom: 10 }}>
        <div style={{ position: "absolute", inset: 0, width: `${Math.min(130, pct) / 130 * 100}%`, background: barColor }} />
        <div style={{ position: "absolute", top: 0, left: `${100 / 130 * 100}%`, height: "100%", width: 2, background: "rgba(58,44,26,0.28)" }} />
      </div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 14px" }}>{over ? `A little over your usual capacity. Ease one lighter task and it settles.` : `Within capacity — you've planned ${load} of about ${capacity} units of energy.`}</p>
      <div style={{ ...subCard(cwOf("plum").petal), marginBottom: 12 }}>
        <div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 3 }}>The finitude question</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink, margin: 0 }}>What are you deliberately <b>not</b> doing today?</p>
      </div>
      {over && <Pill Icon={ArrowRight} cw="plum" filled onClick={onEase}>Ease today's load</Pill>}
    </div>
  );
}
function RecoveryLens({ onPlanRest }) {
  // seeded WearableSync-like reads (live: WearableSync.readiness/hrv + DailyCheckins.sleep)
  const stats = [
    { k: "Sleep", v: "6h 20m", note: "an hour short", cw: "plum" },
    { k: "Readiness", v: "64", note: "running low", cw: "gold" },
    { k: "HRV", v: "−12%", note: "vs your baseline", cw: "crimson" },
  ];
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Rest is a booking, not a leftover. Your body's asking for a softer day.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {stats.map((s) => (
          <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(cwOf(s.cw).petal) }}>
            <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, width: 64 }}>{s.v}</span>
            <span><span style={{ ...lbl, color: cwOf(s.cw).petal, display: "block" }}>{s.k}</span><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted }}>{s.note}</span></span>
          </div>
        ))}
      </div>
      <div style={{ ...subCard(cwOf("sage").petal), marginBottom: 12, background: `${cwOf("sage").petal}10` }}>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.45 }}>A "rest debt" is building. Plan a protected rest block before the day fills.</p>
      </div>
      <Pill Icon={MoonI} cw="sage" filled onClick={onPlanRest}>Plan a rest block</Pill>
    </div>
  );
}
function BoundariesLens({ season, setSeason, onLowDay }) {
  const sn = SEASONS[season];
  const windows = ["Evenings after 8 — no work", "Sunday — open, unplanned"];
  return (
    <div>
      <Eyebrow color={cwOf("sage").petal}>Protected windows</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "8px 0 14px" }}>
        {windows.map((w) => (
          <div key={w} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(cwOf("sage").petal) }}>
            <ShieldCheck size={14} color={cwOf("sage").petal} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{w}</span>
          </div>
        ))}
      </div>
      <Eyebrow color={cwOf("plum").petal}>Your season of life</Eyebrow>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "4px 0 8px" }}>{sn.note} The day's bar flexes to fit.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {Object.entries(SEASONS).map(([k, v]) => (
          <Pill key={k} Icon={v.Icon} cw={k === "newbaby" ? "blush" : k === "peri" ? "sage" : k === "caregiving" ? "plum" : "gold"} active={season === k} onClick={() => setSeason(k)}>{v.label}</Pill>
        ))}
      </div>
      <Pill Icon={CircleSlash} cw="plum" onClick={onLowDay}>Make today a low-capacity day</Pill>
    </div>
  );
}

// ══ BOARD 3 · THE LOAD lenses ════════════════════════════════════════════════
function InvisibleLens({ items, onHand }) {
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>The work no one sees — the <b>noticing</b>, <b>deciding</b> and <b>remembering</b>. Name it, then hand it over <i>fully</i> — not just the chore.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((v) => (
          <div key={v.id} style={{ ...subCard(v.handed ? cwOf("sage").petal : cwOf("plum").petal) }}>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 3 }}>{v.title}</div>
            {v.handed
              ? <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 700, color: cwOf("sage").petal }}><Check size={13} /> Handed to Alex — fully (noticing, deciding, tracking)</div>
              : <>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 8 }}>{v.carry}</div>
                  <Pill Icon={UserPlus} cw="plum" filled onClick={() => onHand(v.id)}>Hand it over</Pill>
                </>}
          </div>
        ))}
      </div>
    </div>
  );
}
function AdminLens({ items, onDisp }) {
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Life admin, biased toward <b>less</b>. For each one, the kindest question first: can it go, go to someone, or go automatic?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((a) => {
          const chosen = ADMIN_DISP.find((d) => d.id === a.disp);
          return (
            <div key={a.id} style={{ ...subCard(a.disp ? cwOf(chosen.cw).petal : cwOf("gold").petal) }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{a.title}</span>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{a.due}</span>
              </div>
              {chosen
                ? <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 700, color: cwOf(chosen.cw).petal }}><chosen.Icon size={13} /> {chosen.label === "Delete" ? "Let go" : chosen.label === "Do it" ? "On the list" : chosen.label + "d"}</div>
                : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ADMIN_DISP.map((d) => <Pill key={d.id} Icon={d.Icon} cw={d.cw} onClick={() => onDisp(a.id, d.id)}>{d.label}</Pill>)}
                  </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ BOARD 4 · INTENTIONS lenses ══════════════════════════════════════════════
function Intentions({ intentions, phaseKey, onEdit, onAdd, onRemove }) {
  const lean = { menstrual: ["rest", "self"], follicular: ["career", "create"], ovulatory: ["career", "love"], luteal: ["rest", "friend"] }[phaseKey] || ["self"];
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>Up to three. Not tasks — the things that would make today feel like yours.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {intentions.map((it) => {
          const d = domainOf(it.domain), dcw = cwOf(d.cw).petal;
          return (
            <div key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 9, ...subCard(dcw) }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: `${dcw}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><d.Icon size={13} color={dcw} /></span>
              <button onClick={() => onEdit(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ ...lbl, color: dcw, marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.35 }}>{it.text}</div>
              </button>
              <button onClick={() => onRemove(it.id)} aria-label="Remove intention" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, flexShrink: 0 }}><X size={15} /></button>
            </div>
          );
        })}
      </div>
      {intentions.length < 3 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {lean.map(domainOf).map((d) => <Pill key={d.id} Icon={d.Icon} cw={d.cw} onClick={() => onEdit({ domain: d.id, text: "" })}>{d.label}</Pill>)}
          <Pill Icon={Plus} cw="gold" onClick={onAdd}>Other</Pill>
        </div>
      )}
    </div>
  );
}
function SeasonIntentions() {
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>The longer arc — what matters across these weeks, and what you're letting go of.</p>
      <Eyebrow color={cwOf("crimson").petal}>Holding</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 0 14px" }}>
        {SEED_SEASON_INTENTIONS.map((it) => {
          const d = domainOf(it.domain), dcw = cwOf(d.cw).petal;
          return (
            <div key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 9, ...subCard(dcw) }}>
              <d.Icon size={15} color={dcw} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.35 }}>{it.text}</span>
            </div>
          );
        })}
      </div>
      <Eyebrow color={cwOf("plum").petal}>Deliberately not doing</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
        {SEED_NOT_DOING.map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(cwOf("plum").petal) }}>
            <CircleSlash size={14} color={cwOf("plum").petal} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: SERIF, fontSize: 15, color: T.muted }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══ BOARD 5 · RITUALS lenses ═════════════════════════════════════════════════
function AnchorsLens({ anchors, onToggle }) {
  const groups = [{ slot: "am", label: "Morning", Icon: Sun, cw: "gold" }, { slot: "pm", label: "Evening", Icon: Moon, cw: "plum" }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {groups.map((g) => {
        const items = anchors.filter((a) => a.slot === g.slot), done = items.filter((a) => a.done).length, accent = cwOf(g.cw).petal;
        return (
          <div key={g.slot}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <g.Icon size={15} color={accent} />
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink }}>{g.label}</span>
              <span style={{ ...lbl, marginLeft: "auto" }}>{done}/{items.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {items.map((a) => (
                <button key={a.id} onClick={() => onToggle(a.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "8px 11px", borderRadius: 11, background: T.paperHi, border: `1px solid ${T.paperDeep}`, cursor: "pointer" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${a.done ? accent : T.paperDeep}`, background: a.done ? accent : "transparent", display: "grid", placeItems: "center" }}>{a.done && <Check size={13} color="#fff" />}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 15, color: a.done ? T.muted : T.ink, textDecoration: a.done ? "line-through" : "none" }}>{a.title}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function ResetLens({ onPlan }) {
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 6px" }}>Stress isn't finished when the stressor is. <b>Complete the cycle</b> — your body needs an action, not just rest.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        {RESETS.map((r) => (
          <button key={r.id} onClick={() => onPlan(r.label)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 12px", borderRadius: 14, cursor: "pointer", background: `${cwOf(r.cw).petal}12`, border: `1px solid ${cwOf(r.cw).petal}55`, textAlign: "left" }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: `${cwOf(r.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={15} color={cwOf(r.cw).petal} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{r.label}</span>
          </button>
        ))}
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, margin: "12px 0 0" }}>Tap one to plant it in your day as a protected reset.</p>
    </div>
  );
}
function FocusLens({ blocks, onStart, onFirstStep }) {
  const stuck = blocks.filter((b) => !b.done && b.type === "focus")[0] || blocks.filter((b) => !b.done)[0];
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 14px" }}>For a low-capacity or foggy day. Borrow some focus — start small, with company.</p>
      <div style={{ ...subCard(cwOf("gold").petal), marginBottom: 12 }}>
        <div style={{ ...lbl, color: cwOf("gold").petal, marginBottom: 4 }}>Body-double session</div>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "0 0 10px", lineHeight: 1.45 }}>25 minutes, gently timed, "I'm working alongside you." The proven trick for a stuck start.</p>
        <Pill Icon={Timer} cw="gold" filled onClick={onStart}>Start a 25-min focus</Pill>
      </div>
      {stuck && (
        <div style={{ ...subCard(cwOf("plum").petal) }}>
          <div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 4 }}>The 2-minute first step</div>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "0 0 10px", lineHeight: 1.45 }}>Don't do "{stuck.title}". Just open it for two minutes.</p>
          <Pill Icon={ArrowRight} cw="plum" filled onClick={() => onFirstStep(stuck.title)}>Start the first 2 minutes</Pill>
        </div>
      )}
    </div>
  );
}
function RhythmLens({ season }) {
  const week = [1, 1, 0, 1, 1, 1, 0]; // last 7 days completion (seeded; live: HabitLogs)
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 14px" }}>The honest read — gently. Consistency is a rhythm, not a scoreboard.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: T.ink }}>4</span>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted }}>day rhythm — the garden noticed.</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {week.map((d, i) => (
          <div key={i} style={{ flex: 1, height: 32, borderRadius: 7, background: d ? cwOf("sage").petal : "rgba(58,44,26,0.08)", opacity: d ? 0.7 : 1, display: "grid", placeItems: "center" }}>
            {d ? <Check size={13} color="#fff" /> : null}
          </div>
        ))}
      </div>
      <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10` }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.5 }}>In a {season.label.toLowerCase()} season, a kept anchor most days is plenty. {season.note}</p>
      </div>
    </div>
  );
}

// ── sheets ────────────────────────────────────────────────────────────────────
function SheetShell({ title, eyebrowText, accent, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(11,8,5,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paperHi, borderRadius: "22px 22px 0 0", borderTop: `3px solid ${accent}`, padding: "16px 18px calc(24px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(58,44,26,0.22)", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>{eyebrowText}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 600, color: T.ink }}>{title}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
const fieldLabel = { fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, display: "block", marginBottom: 6 };
const inputBase = { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none" };

function BlockSheet({ draft, peakHour, onClose, onSave, onDelete }) {
  const [d, setD] = useState(draft);
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <SheetShell title="Edit" eyebrowText="Your day" accent={cwOf("gold").petal} onClose={onClose}>
      <label style={fieldLabel}>What is it?</label>
      <input autoFocus value={d.title} onChange={(e) => set("title", e.target.value)} style={{ ...inputBase, marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={fieldLabel}>When</label>
          <select value={d.hour} onChange={(e) => set("hour", Number(e.target.value))} style={inputBase}>{HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}{h === peakHour ? " · peak" : ""}</option>)}</select></div>
        <div><label style={fieldLabel}>How long</label>
          <select value={d.dur} onChange={(e) => set("dur", Number(e.target.value))} style={inputBase}>{[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}</select></div>
      </div>
      <label style={fieldLabel}>Kind · energy</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {Object.entries(TYPE_META).map(([k, v]) => (
          <button key={k} onClick={() => set("type", k)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: d.type === k ? cwOf(v.cw).petal : T.paper, color: d.type === k ? "#fff" : T.inkSoft, border: `1px solid ${d.type === k ? cwOf(v.cw).petal : T.paperDeep}`, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <v.Icon size={12} color={d.type === k ? "#fff" : cwOf(v.cw).petal} /> {v.label} · {v.energy}
          </button>
        ))}
      </div>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {DOMAINS.map((x) => (
          <button key={x.id} onClick={() => setD((s) => ({ ...s, domain: x.id }))} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 999, background: d.domain === x.id ? cwOf(x.cw).petal : T.paper, color: d.domain === x.id ? "#fff" : T.inkSoft, border: `1px solid ${d.domain === x.id ? cwOf(x.cw).petal : T.paperDeep}`, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <x.Icon size={12} color={d.domain === x.id ? "#fff" : cwOf(x.cw).petal} /> {x.label}
          </button>
        ))}
      </div>
      <label style={fieldLabel}>The intention</label>
      <input autoFocus value={d.text} onChange={(e) => setD((s) => ({ ...s, text: e.target.value }))} placeholder={dom.prompt} style={{ ...inputBase, marginBottom: 8 }} />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 16px" }}>{dom.prompt}</p>
      <button onClick={() => d.text.trim() && onSave(d)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf("crimson").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Set this intention</button>
    </SheetShell>
  );
}
