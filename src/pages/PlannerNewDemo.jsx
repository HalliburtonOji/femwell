// PlannerNewDemo — a GROUND-UP, from-scratch redesign of the Planner, built demo-first.
// Live /Planner is NOT touched. This is a brand-new planner, not a reskin of PlannerV2Shell.
//
// WHY (Halli): the live Planner is a grid of ~79 tiles where ~26 just open the universal
// logger, 6 cycle-calendar tiles open the SAME overlay, and many "cards" are thin display
// boxes or aliases of one another ("half the cards just open the logger"; "Consistency is
// basically a ring"; "just a period card"). It tracks a cycle and launches a logger — it
// never actually PLANS a day. The one real planning tool (hour-by-hour time-blocking) was
// buried behind a single tile.
//
// THE NEW IDEA — "THE DAY, TENDED." A planner in the brand's garden language: you TEND a
// day, not optimise it. Built around the real, distinct acts of planning a whole woman's
// life WITHIN her energy — none of them a logger-opener:
//   1) TODAY'S PLAN  — a real, buildable day (time-blocks you add / tick / edit, + open the
//      full hour-by-hour grid). The thing the old planner lacked, now the spine.
//   2) CAPACITY & ENERGY — cycle-energy-aware planning: your phase sets the day's capacity,
//      your plan fills a real load meter (100% line + Defer when over), and an energy curve
//      shows your peak hours so you plant the bold thing in your bright window. The
//      differentiator — a cyclical woman's planner, not a generic to-do list.
//   3) INTENTIONS — up to 3 whole-life intentions (career · friendship · love · money · joy
//      · rest · creativity · self — NOT symptoms), phase-suggested. "Tending, not tracking."
// Supporting, each ONE real distinct thing: RITUALS (morning + evening anchors, real ticks),
// THE WEEK (cycle-tinted, tap a day to plan it), PLAN WITH JESS (speak a plan → blocks),
// PLAN TOMORROW TONIGHT (set tomorrow's one big thing). A "Jump to" switcher per the UX rule.
//
// CUT from the planner (relocated, not planning): the 26 logger-openers, the duplicate
// cycle-calendar / insights / plan-a-day / customise tiles, the alias tiles, and the clinical
// trackers (BBT · HRT log · kick counter · EPDS · fertile window · contraception · symptom
// log · doctor export) — those are Health / Pulse / Doctor-Export logging, not planning.
// Life-stage still TINTS the planner (capacity model + intention prompts + week adapt) without
// cramming clinical cards.
//
// v4 bible: PAPER_BG · FwFloraHero + ONE SummaryCard signature top · uniform paper-cream cards
// with an accent rim · phase hues for the cycle · Cormorant/Ephesis/system-sans · Lucide only,
// no emoji · ≥12px chrome / ≥13px reading · soulful voice · ~2 phone screens. Seeded + fully
// interactive (React state, optimistic) so every tap visibly works in preview; each interaction
// is annotated with the REAL base44 entity it would write live (PlannerItems / HabitLogs) —
// no new base44 function. Live wiring rides the existing PlannerDayView + VoiceScheduler +
// CapacityTaxBar dispatchers.
import { useState, useMemo, useRef } from "react";
import {
  Plus, X, Check, Mic, Sun, Moon, Sparkles, CalendarDays,
  Briefcase, Users, Heart, Coins, Smile, Leaf, Palette, Feather, ArrowRight,
  Footprints, ListChecks, Utensils, Pencil, Trash2, Gauge,
} from "lucide-react";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { RichBloomV2, SprigDivider, floraKeyframes, cwOf } from "@/components/brand/flora";

// ── phase model (the cycle's seasons — §2.4 semantic hues) ───────────────────
const PHASE = {
  menstrual:  { label: "Menstrual",  hue: "#BC2E27", mult: 0.55, season: "Inner winter", note: "Slow, soft, restorative. Plan light; protect rest." },
  follicular: { label: "Follicular", hue: "#8FAF8F", mult: 1.10, season: "Inner spring", note: "Curious and building. A good week to start and to be bold." },
  ovulatory:  { label: "Ovulatory",  hue: "#D4AF37", mult: 1.20, season: "Peak", note: "Highest energy. Big asks, visibility, the hard conversation." },
  luteal:     { label: "Luteal",     hue: "#8E6E8E", mult: 0.85, season: "Inner autumn", note: "Reflective and finishing. Tidy, close loops, narrow down." },
};
const BASELINE_CAPACITY = 10; // matches CapacityTaxBar.BASELINE_CAPACITY

// ── seeded "today" — a real-feeling, whole-life day (NOT a symptom log) ───────
// Live: these are PlannerItems rows ({ title, time, category, duration_minutes, is_completed }).
const SEED_PHASE = "follicular";
const SEED_CYCLE_DAY = 8;
const TYPE_META = {
  focus:  { label: "Focus",  Icon: Briefcase,  cw: "plum"    },
  task:   { label: "Task",   Icon: ListChecks, cw: "gold"    },
  social: { label: "Life",   Icon: Users,      cw: "sage"    },
  move:   { label: "Move",   Icon: Footprints, cw: "sage"    },
  meal:   { label: "Meal",   Icon: Utensils,   cw: "blush"   },
  rest:   { label: "Rest",   Icon: Moon,       cw: "plum"    },
};
const SEED_BLOCKS = [
  { id: "b1", hour: 8,  title: "Morning walk",            type: "move",   dur: 30, done: true  },
  { id: "b2", hour: 10, title: "Deep work — the pitch deck", type: "focus", dur: 90, done: false, anchor: true },
  { id: "b3", hour: 13, title: "Lunch with Mara",         type: "social", dur: 60, done: false },
  { id: "b4", hour: 16, title: "Admin — invoices",        type: "task",   dur: 45, done: false },
  { id: "b5", hour: 20, title: "Wind-down + read",        type: "rest",   dur: 30, done: false },
];

// whole-life intention domains (RULE 1: span life, not just health) ──────────
const DOMAINS = [
  { id: "career",  label: "Career",     Icon: Briefcase, cw: "plum",    prompt: "One real move on the thing that matters." },
  { id: "friend",  label: "Friendship", Icon: Users,     cw: "sage",    prompt: "Reach for someone — a voice note counts." },
  { id: "love",    label: "Love",       Icon: Heart,     cw: "crimson", prompt: "A small tenderness, given or received." },
  { id: "money",   label: "Money",      Icon: Coins,     cw: "gold",    prompt: "One quiet, kind thing for future-you." },
  { id: "joy",     label: "Joy",        Icon: Smile,     cw: "gold",    prompt: "Something that's purely for the fun of it." },
  { id: "rest",    label: "Rest",       Icon: Leaf,      cw: "sage",    prompt: "Permission to do less, on purpose." },
  { id: "create",  label: "Create",     Icon: Palette,   cw: "blush",   prompt: "Make a little something, badly, anyway." },
  { id: "self",    label: "Self",       Icon: Feather,   cw: "plum",    prompt: "A line in your own voice — who are you today?" },
];
const domainOf = (id) => DOMAINS.find((d) => d.id === id) || DOMAINS[0];
const SEED_INTENTIONS = [
  { id: "i1", domain: "career", text: "Send the pitch — rough is fine, sent is better." },
  { id: "i2", domain: "friend", text: "Actually be present at lunch. Phone in bag." },
];

// rituals — morning + evening anchors (real HabitLogs toggles), genuinely distinct
const SEED_MORNING = [
  { id: "m1", title: "Sunlight + a full glass of water", done: true },
  { id: "m2", title: "Five minutes moving — stretch or walk", done: true },
  { id: "m3", title: "Name today's one intention", done: false },
];
const SEED_EVENING = [
  { id: "e1", title: "Phone down by 10", done: false },
  { id: "e2", title: "Ten pages of something good", done: false },
  { id: "e3", title: "Set tomorrow's one big thing", done: false },
];

// the cycle-tinted week (tap a day → plan that day) ──────────────────────────
const WEEK = [
  { d: "Mon", phase: "follicular", full: 0.5 },
  { d: "Tue", phase: "follicular", full: 0.7 },
  { d: "Wed", phase: "follicular", full: 0.6, today: true },
  { d: "Thu", phase: "ovulatory",  full: 0.3 },
  { d: "Fri", phase: "ovulatory",  full: 0.8 },
  { d: "Sat", phase: "ovulatory",  full: 0.2 },
  { d: "Sun", phase: "luteal",     full: 0.4 },
];

// energy-through-the-day curve (diurnal × phase) — drives "plan into your peak"
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am..10pm
function energyCurve(phase) {
  const mult = PHASE[phase].mult;
  return HOURS.map((h) => {
    // base diurnal: rises to a late-morning peak, dips ~3pm, small evening lift
    const base =
      h < 9 ? 0.4 + (h - 7) * 0.12 :
      h <= 12 ? 0.7 + (h - 9) * 0.1 :
      h <= 15 ? 0.95 - (h - 12) * 0.13 :
      h <= 18 ? 0.6 + (h - 15) * 0.04 :
      0.7 - (h - 18) * 0.12;
    return Math.max(0.12, Math.min(1, base * (0.7 + mult * 0.3)));
  });
}

const SECTIONS = [
  { id: "plan",       label: "Today's plan",   sub: "Your day, hour by hour",        Icon: CalendarDays, cw: "gold"  },
  { id: "capacity",   label: "Capacity & energy", sub: "Plan within your phase",     Icon: Gauge,        cw: "sage"  },
  { id: "intentions", label: "Intentions",     sub: "What matters today",            Icon: Sparkles,     cw: "crimson" },
  { id: "rituals",    label: "Rituals",        sub: "Your morning & evening anchors", Icon: Sun,         cw: "gold"  },
  { id: "week",       label: "The week",       sub: "Plan any day, cycle-aware",     Icon: CalendarDays, cw: "plum"  },
  { id: "tomorrow",   label: "Tomorrow",       sub: "Set one big thing tonight",     Icon: Moon,         cw: "plum"  },
];

// ── small shared styles ──────────────────────────────────────────────────────
const card = (accent) => ({
  position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`,
  borderLeft: `4px solid ${accent}`, borderRadius: 18, padding: "16px 16px 17px",
  boxShadow: "0 1px 4px rgba(58,44,26,0.06)",
});
const eyebrow = { fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" };
const titleSerif = { fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, lineHeight: 1.2, letterSpacing: "-0.01em" };
const bodySerif = { fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5 };
const meta = { fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.muted };

function SectionHead({ id, refs }) {
  const s = SECTIONS.find((x) => x.id === id);
  const accent = cwOf(s.cw).petal;
  return (
    <div ref={(el) => (refs.current[id] = el)} style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 2px 12px", scrollMarginTop: 64 }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <s.Icon size={17} strokeWidth={1.7} color={accent} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ ...eyebrow, color: accent }}>{s.label}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>{s.sub}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function PlannerNewDemo() {
  const ph = PHASE[SEED_PHASE];
  const refs = useRef({});
  const [blocks, setBlocks] = useState(SEED_BLOCKS);
  const [intentions, setIntentions] = useState(SEED_INTENTIONS);
  const [morning, setMorning] = useState(SEED_MORNING);
  const [evening, setEvening] = useState(SEED_EVENING);
  const [tomorrowThing, setTomorrowThing] = useState(null);

  // overlays
  const [addBlock, setAddBlock] = useState(null); // { hour, dayLabel } | null
  const [editBlock, setEditBlock] = useState(null);
  const [jess, setJess] = useState(false);
  const [intentDraft, setIntentDraft] = useState(null); // { domain, text } | null
  const [jumpOpen, setJumpOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(null); // week day label | null
  const [toast, setToast] = useState(null);

  const flash = (msg) => { setToast(msg); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2400); };
  const scrollTo = (id) => { setJumpOpen(false); refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  // capacity = phase-set ceiling vs the load you've planned (CapacityTaxBar model)
  const capacity = useMemo(() => Math.round(BASELINE_CAPACITY * ph.mult * 10) / 10, [ph.mult]);
  const load = useMemo(() => {
    let l = blocks.filter((b) => !b.done).reduce((s, b) => s + (b.type === "focus" ? 2 : b.type === "rest" || b.type === "move" ? 0.5 : 1), 0);
    l += intentions.length * 0.5;
    return Math.round(l * 10) / 10;
  }, [blocks, intentions]);
  const pct = capacity > 0 ? Math.round((load / capacity) * 100) : 0;
  const over = load > capacity;

  const curve = useMemo(() => energyCurve(SEED_PHASE), []);
  const peakIdx = curve.indexOf(Math.max(...curve));
  const peakHour = HOURS[peakIdx];
  const peakLabel = `${peakHour > 12 ? peakHour - 12 : peakHour}${peakHour >= 12 ? "pm" : "am"}`;

  // ── handlers (each annotated with its real entity write) ────────────────────
  const toggleBlock = (id) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, done: !b.done } : b))); // PlannerItems.update({is_completed})
  const saveBlock = (draft) => {
    if (draft.id) setBlocks((bs) => bs.map((b) => (b.id === draft.id ? draft : b))); // PlannerItems.update
    else setBlocks((bs) => [...bs, { ...draft, id: "b" + Date.now() }].sort((a, b) => a.hour - b.hour)); // PlannerItems.create
    setAddBlock(null); setEditBlock(null);
    flash(draft.id ? "Block updated" : "Added to your day");
  };
  const deleteBlock = (id) => { setBlocks((bs) => bs.filter((b) => b.id !== id)); setEditBlock(null); flash("Removed"); }; // PlannerItems.delete
  const saveIntention = (draft) => {
    if (draft.id) setIntentions((xs) => xs.map((x) => (x.id === draft.id ? draft : x)));
    else setIntentions((xs) => [...xs, { ...draft, id: "i" + Date.now() }]); // PlannerItems.create (timeless, category=domain)
    setIntentDraft(null); flash("Intention set");
  };
  const removeIntention = (id) => setIntentions((xs) => xs.filter((x) => x.id !== id));
  const toggleRitual = (set, setSet, id) => setSet((rs) => rs.map((r) => (r.id === id ? { ...r, done: !r.done } : r))); // HabitLogs.create/update

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}</style>

      {/* pinned Jump-to switcher (UX rule: every multi-layer page) */}
      <button onClick={() => setJumpOpen(true)} aria-label="Jump to a planner area"
        style={{ position: "fixed", top: "calc(env(safe-area-inset-top,0px) + 10px)", left: 12, zIndex: 45,
          display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999,
          border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: UI, fontSize: 12, fontWeight: 700,
          color: T.inkSoft, boxShadow: "0 2px 12px rgba(58,44,26,0.18)", cursor: "pointer" }}>
        <CalendarDays size={13} style={{ color: T.gold }} /> Jump to
      </button>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "14px 16px 0" }}>
        {/* SIGNATURE TOP — flora hero + ONE summary */}
        <FwFloraHero
          title="Your day" colorway="sage" bloom="snowdrop"
          flankL="iris" flankR="daffodil" creature="butterfly"
          line="A day is a garden bed. Tend it to your energy — plant the bold thing in your bright hours, and leave room to rest."
        />

        {/* phase ribbon */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "10px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, letterSpacing: "0.04em" }}>
            {ph.label} · Day {SEED_CYCLE_DAY} · {ph.season}
          </span>
        </div>

        <SummaryCard
          eyebrow="Today, at a glance"
          rows={[
            { Icon: CalendarDays, label: "Your plan", text: `${blocks.length} blocks · your peak window is ${peakLabel}`, onClick: () => scrollTo("plan") },
            { Icon: Gauge, label: "Capacity", text: `${pct}% of a ${ph.label.toLowerCase()} day — ${over ? "a little full" : "room for one more"}`, onClick: () => scrollTo("capacity") },
            { Icon: Sparkles, label: "Intentions", text: intentions.length >= 3 ? "3 set — a full-hearted day" : `${intentions.length} set · add ${3 - intentions.length} more?`, onClick: () => scrollTo("intentions") },
          ]}
        />

        {/* two big primary acts (ease-of-use) */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setAddBlock({ hour: peakHour })}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 12px", borderRadius: 14, background: cwOf("gold").petal, color: "#fff", border: "none",
              fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(168,137,63,0.28)" }}>
            <Plus size={16} /> Plan a block
          </button>
          <button onClick={() => setJess(true)}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 12px", borderRadius: 14, background: cwOf("sage").petal, color: "#fff", border: "none",
              fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(143,175,143,0.28)" }}>
            <Mic size={16} /> Plan with Jess
          </button>
        </div>

        {/* ─── 1. TODAY'S PLAN (the spine) ─── */}
        <SectionHead id="plan" refs={refs} />
        <PlanSpine
          blocks={blocks} phase={SEED_PHASE} peakHour={peakHour}
          onToggle={toggleBlock} onEdit={setEditBlock} onAdd={() => setAddBlock({ hour: peakHour })}
        />

        {/* ─── 2. CAPACITY & ENERGY ─── */}
        <SectionHead id="capacity" refs={refs} />
        <CapacityPanel
          load={load} capacity={capacity} pct={pct} over={over} phase={ph}
          curve={curve} peakIdx={peakIdx} peakLabel={peakLabel}
          onDefer={() => { setBlocks((bs) => bs.map((b) => (!b.done && !b.anchor && b.type === "task" ? { ...b, deferred: true } : b)).filter((b) => !b.deferred)); flash("Moved lighter tasks to a steadier day"); }}
        />

        {/* ─── 3. INTENTIONS (whole-life) ─── */}
        <SectionHead id="intentions" refs={refs} />
        <IntentionsPanel
          intentions={intentions} phase={SEED_PHASE}
          onEdit={(it) => setIntentDraft(it)} onAdd={() => setIntentDraft({ domain: "career", text: "" })}
          onRemove={removeIntention}
        />

        {/* ─── 4. RITUALS ─── */}
        <SectionHead id="rituals" refs={refs} />
        <RitualsPanel
          morning={morning} evening={evening}
          onMorning={(id) => toggleRitual(morning, setMorning, id)}
          onEvening={(id) => toggleRitual(evening, setEvening, id)}
        />

        {/* ─── 5. THE WEEK ─── */}
        <SectionHead id="week" refs={refs} />
        <WeekPanel onPlanDay={(d) => setDayOpen(d)} />

        {/* ─── 6. PLAN TOMORROW TONIGHT ─── */}
        <SectionHead id="tomorrow" refs={refs} />
        <TomorrowPanel value={tomorrowThing} onSet={(t) => { setTomorrowThing(t); flash("Saved for tomorrow"); }} />

        {/* flora close */}
        <SprigDivider color={T.gold} my={26} />
        <div style={{ textAlign: "center", paddingBottom: 12 }}>
          <div style={{ display: "grid", placeItems: "center", marginBottom: 6 }}>
            <RichBloomV2 form="fern" color={cwOf("sage").petal} color2={cwOf("sage").tip} accent={T.gold} size={64} soft animate={false} idx="close" />
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, maxWidth: 300, margin: "0 auto", lineHeight: 1.55 }}>
            A planned day is a tended one. You don't have to do it all — only the few things that are truly yours.
          </p>
        </div>
      </div>

      {/* ── overlays ── */}
      {jumpOpen && <JumpSheet onClose={() => setJumpOpen(false)} onJump={scrollTo} />}
      {(addBlock || editBlock) && (
        <BlockSheet draft={editBlock || { title: "", hour: addBlock.hour ?? peakHour, type: "task", dur: 30, done: false }}
          peakHour={peakHour} onClose={() => { setAddBlock(null); setEditBlock(null); }} onSave={saveBlock}
          onDelete={editBlock ? () => deleteBlock(editBlock.id) : null} />
      )}
      {jess && <JessSheet onClose={() => setJess(false)} onParse={(b) => { saveBlock(b); setJess(false); }} peakHour={peakHour} />}
      {intentDraft && <IntentionSheet draft={intentDraft} onClose={() => setIntentDraft(null)} onSave={saveIntention} />}
      {dayOpen && <DaySheet day={dayOpen} onClose={() => setDayOpen(null)} onPlan={() => { setDayOpen(null); setAddBlock({ hour: 9 }); }} />}

      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999,
          background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1. PLAN SPINE — a real, buildable day (the thing the old planner lacked)
function PlanSpine({ blocks, phase, peakHour, onToggle, onEdit, onAdd }) {
  const hue = PHASE[phase].hue;
  const doneN = blocks.filter((b) => b.done).length;
  return (
    <div style={card(cwOf("gold").petal)}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={titleSerif}>Today, tended</span>
        <span style={meta}>{doneN}/{blocks.length} done</span>
      </div>
      <p style={{ ...bodySerif, fontStyle: "italic", margin: "0 0 12px", color: T.muted }}>
        Your time-blocks for today. Tap to tick, hold a thought, or open the full hour-by-hour grid.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {blocks.map((b) => {
          const tm = TYPE_META[b.type] || TYPE_META.task;
          const tcw = cwOf(tm.cw).petal;
          const peak = b.hour >= peakHour - 1 && b.hour <= peakHour + 2;
          return (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 12,
              background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${tcw}` }}>
              <button onClick={() => onToggle(b.id)} aria-label={b.done ? "Mark not done" : "Mark done"}
                style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, cursor: "pointer",
                  border: `1.5px solid ${b.done ? cwOf("sage").petal : T.paperDeep}`, background: b.done ? cwOf("sage").petal : "transparent",
                  display: "grid", placeItems: "center" }}>
                {b.done && <Check size={14} color="#fff" />}
              </button>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, width: 44, flexShrink: 0 }}>
                {b.hour > 12 ? b.hour - 12 : b.hour}{b.hour >= 12 ? "pm" : "am"}
              </span>
              <button onClick={() => onEdit(b)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: b.done ? T.muted : T.ink, textDecoration: b.done ? "line-through" : "none", lineHeight: 1.25 }}>
                  {b.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <tm.Icon size={11} color={tcw} />
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{tm.label} · {b.dur}m</span>
                  {b.anchor && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: cwOf("gold").accent, background: `${T.gold}22`, padding: "1px 6px", borderRadius: 999 }}>ANCHOR</span>}
                  {peak && !b.done && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: hue }}>· in your peak</span>}
                </div>
              </button>
              <Pencil size={14} color={T.muted} style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
      <button onClick={onAdd} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, width: "100%", justifyContent: "center",
        padding: "11px", borderRadius: 12, border: `1.5px dashed ${T.paperDeep}`, background: "transparent", color: T.inkSoft,
        fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        <Plus size={15} /> Add a block to today
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. CAPACITY — energy-aware planning (the differentiator), not a ring
function CapacityPanel({ load, capacity, pct, over, phase, curve, peakIdx, peakLabel, onDefer }) {
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  const barFill = Math.min(130, pct);
  const max = Math.max(...curve);
  return (
    <div style={card(cwOf("sage").petal)}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={titleSerif}>How full is today?</span>
        <span style={{ ...meta, color: barColor }}>{pct}% of a {phase.label.toLowerCase()} day</span>
      </div>
      {/* capacity bar with 100% tick */}
      <div style={{ height: 9, borderRadius: 99, background: "rgba(58,44,26,0.08)", overflow: "hidden", position: "relative", marginBottom: 9 }}>
        <div style={{ position: "absolute", inset: 0, width: `${(barFill / 130) * 100}%`, background: barColor, transition: "width 240ms" }} />
        <div style={{ position: "absolute", top: 0, left: `${(100 / 130) * 100}%`, height: "100%", width: 2, background: "rgba(58,44,26,0.28)" }} />
      </div>
      <p style={{ ...bodySerif, margin: "0 0 14px" }}>
        {over
          ? `A little over your usual ${phase.label.toLowerCase()} capacity. ${phase.note} Move one lighter task to a steadier day and this eases.`
          : `Within capacity — ${phase.note.toLowerCase()} You've planned ${load} of about ${capacity} units of energy.`}
      </p>

      {/* energy-through-the-day curve — plan the bold thing into your bright hours */}
      <Eyebrow color={cwOf("sage").petal}>Your energy today</Eyebrow>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56, margin: "8px 0 6px" }}>
        {curve.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: "100%", height: `${(v / max) * 100}%`, borderRadius: "3px 3px 0 0",
              background: i === peakIdx ? phase.hue : cwOf("sage").petal,
              opacity: i === peakIdx ? 1 : 0.45 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>
        <span>7am</span><span>your peak · {peakLabel}</span><span>10pm</span>
      </div>
      <p style={{ ...bodySerif, fontStyle: "italic", color: T.muted, margin: "10px 0 0" }}>
        Plant focused work in your bright window ({peakLabel}); save admin and softer tasks for the dip.
      </p>

      {over && (
        <button onClick={onDefer} style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 999,
          background: cwOf("plum").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <ArrowRight size={14} /> Move lighter tasks to a steadier day
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. INTENTIONS — up to 3 whole-life intentions (career/friendship/joy… not symptoms)
function IntentionsPanel({ intentions, phase, onEdit, onAdd, onRemove }) {
  const suggestions = useMemo(() => {
    // phase tints the suggested domains (never dominates)
    const lean = { menstrual: ["rest", "self"], follicular: ["career", "create"], ovulatory: ["career", "love"], luteal: ["rest", "friend"] }[phase] || ["self"];
    return lean.map(domainOf);
  }, [phase]);
  return (
    <div style={card(cwOf("crimson").petal)}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={titleSerif}>What matters today</span>
        <span style={meta}>{intentions.length}/3</span>
      </div>
      <p style={{ ...bodySerif, fontStyle: "italic", color: T.muted, margin: "0 0 12px" }}>
        Up to three. Not tasks — the things that would make today feel like yours. Health is one room, not the house.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {intentions.map((it) => {
          const d = domainOf(it.domain); const dcw = cwOf(d.cw).petal;
          return (
            <div key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 12px", borderRadius: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${dcw}` }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: `${dcw}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <d.Icon size={14} color={dcw} />
              </span>
              <button onClick={() => onEdit(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ ...eyebrow, fontSize: 12, color: dcw, marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.35 }}>{it.text}</div>
              </button>
              <button onClick={() => onRemove(it.id)} aria-label="Remove intention" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, flexShrink: 0 }}><X size={15} /></button>
            </div>
          );
        })}
      </div>
      {intentions.length < 3 && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {suggestions.map((d) => (
              <button key={d.id} onClick={() => onEdit({ domain: d.id, text: "" })}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999,
                  background: `${cwOf(d.cw).petal}14`, border: `1px solid ${cwOf(d.cw).petal}55`, color: cwOf(d.cw).accent || T.ink,
                  fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <d.Icon size={12} color={cwOf(d.cw).petal} /> {d.label}
              </button>
            ))}
          </div>
          <button onClick={onAdd} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, width: "100%", justifyContent: "center",
            padding: "11px", borderRadius: 12, border: `1.5px dashed ${T.paperDeep}`, background: "transparent", color: T.inkSoft, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Plus size={15} /> Add an intention
          </button>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. RITUALS — morning + evening anchors, genuinely distinct, real ticks
function RitualRow({ r, onToggle, accent }) {
  return (
    <button onClick={() => onToggle(r.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
      padding: "9px 11px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, cursor: "pointer", marginBottom: 7 }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${r.done ? accent : T.paperDeep}`, background: r.done ? accent : "transparent", display: "grid", placeItems: "center" }}>
        {r.done && <Check size={13} color="#fff" />}
      </span>
      <span style={{ fontFamily: SERIF, fontSize: 15, color: r.done ? T.muted : T.ink, textDecoration: r.done ? "line-through" : "none", lineHeight: 1.3 }}>{r.title}</span>
    </button>
  );
}
function RitualsPanel({ morning, evening, onMorning, onEvening }) {
  const mDone = morning.filter((r) => r.done).length;
  const eDone = evening.filter((r) => r.done).length;
  const streak = 4; // honest small read — derived from HabitLogs history live
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={card(cwOf("gold").petal)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Sun size={17} color={cwOf("gold").petal} />
          <span style={titleSerif}>Morning</span>
          <span style={{ ...meta, marginLeft: "auto" }}>{mDone}/{morning.length}</span>
        </div>
        {morning.map((r) => <RitualRow key={r.id} r={r} onToggle={onMorning} accent={cwOf("gold").petal} />)}
      </div>
      <div style={card(cwOf("plum").petal)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Moon size={17} color={cwOf("plum").petal} />
          <span style={titleSerif}>Evening</span>
          <span style={{ ...meta, marginLeft: "auto" }}>{eDone}/{evening.length}</span>
        </div>
        {evening.map((r) => <RitualRow key={r.id} r={r} onToggle={onEvening} accent={cwOf("plum").petal} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted }}>
        <Leaf size={14} color={cwOf("sage").petal} /> A {streak}-day rhythm. The garden noticed.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. THE WEEK — cycle-tinted, tap a day to plan it (not 6 tiles → one overlay)
function WeekPanel({ onPlanDay }) {
  return (
    <div style={card(cwOf("plum").petal)}>
      <span style={titleSerif}>Plan the week ahead</span>
      <p style={{ ...bodySerif, fontStyle: "italic", color: T.muted, margin: "4px 0 14px" }}>
        Each day carries its phase. Tap any day to plan it — lean into the bright days, soften the tender ones.
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {WEEK.map((w) => {
          const hue = PHASE[w.phase].hue;
          return (
            <button key={w.d} onClick={() => onPlanDay(w.d)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "10px 2px", borderRadius: 12, cursor: "pointer",
              background: w.today ? `${hue}14` : "transparent", border: w.today ? `1.5px solid ${hue}` : `1px solid ${T.paperDeep}` }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: w.today ? T.ink : T.muted }}>{w.d}</span>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: hue }} />
              {/* fullness gauge */}
              <span style={{ width: 18, height: 34, borderRadius: 5, background: "rgba(58,44,26,0.07)", overflow: "hidden", display: "flex", flexDirection: "column-reverse" }}>
                <span style={{ width: "100%", height: `${w.full * 100}%`, background: hue, opacity: 0.55 }} />
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        {Object.entries(PHASE).map(([k, v]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: v.hue }} /> {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. PLAN TOMORROW TONIGHT — one big thing (real, distinct evening act)
function TomorrowPanel({ value, onSet }) {
  const [text, setText] = useState("");
  return (
    <div style={card(cwOf("plum").petal)}>
      <span style={titleSerif}>Tomorrow's one big thing</span>
      <p style={{ ...bodySerif, fontStyle: "italic", color: T.muted, margin: "4px 0 12px" }}>
        Decide it tonight while today is fresh, and wake to a day that already knows where it's going.
      </p>
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: `${cwOf("plum").petal}14`, border: `1px solid ${cwOf("plum").petal}44` }}>
          <Moon size={16} color={cwOf("plum").petal} />
          <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, flex: 1 }}>{value}</span>
          <button onClick={() => onSet(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={15} /></button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="The one thing future-you will thank you for…"
            style={{ flex: 1, padding: "11px 13px", borderRadius: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none" }} />
          <button onClick={() => { if (text.trim()) { onSet(text.trim()); setText(""); } }}
            style={{ padding: "0 18px", borderRadius: 12, background: cwOf("plum").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Set</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── sheets ──
function SheetShell({ title, eyebrowText, accent = T.gold, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(11,8,5,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paperHi, borderRadius: "22px 22px 0 0",
        borderTop: `3px solid ${accent}`, padding: "16px 18px calc(24px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(58,44,26,0.22)", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...eyebrow, color: accent }}>{eyebrowText}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 600, color: T.ink }}>{title}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
const fieldLabel = { ...eyebrow, fontSize: 12, color: T.muted, display: "block", marginBottom: 6 };
const inputBase = { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none" };

function BlockSheet({ draft, peakHour, onClose, onSave, onDelete }) {
  const [d, setD] = useState(draft);
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <SheetShell title={draft.id ? "Edit block" : "Plan a block"} eyebrowText="Your day" accent={cwOf("gold").petal} onClose={onClose}>
      <label style={fieldLabel}>What is it?</label>
      <input autoFocus value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Deep work — the pitch" style={{ ...inputBase, marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={fieldLabel}>When</label>
          <select value={d.hour} onChange={(e) => set("hour", Number(e.target.value))} style={inputBase}>
            {HOURS.map((h) => <option key={h} value={h}>{h > 12 ? h - 12 : h}{h >= 12 ? "pm" : "am"}{h === peakHour ? " · peak" : ""}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>How long</label>
          <select value={d.dur} onChange={(e) => set("dur", Number(e.target.value))} style={inputBase}>
            {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </div>
      </div>
      <label style={fieldLabel}>Kind</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {Object.entries(TYPE_META).map(([k, v]) => (
          <button key={k} onClick={() => set("type", k)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999,
            background: d.type === k ? cwOf(v.cw).petal : T.paper, color: d.type === k ? "#fff" : T.inkSoft, border: `1px solid ${d.type === k ? cwOf(v.cw).petal : T.paperDeep}`,
            fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <v.Icon size={12} color={d.type === k ? "#fff" : cwOf(v.cw).petal} /> {v.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {onDelete && <button onClick={onDelete} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "12px 14px", borderRadius: 12, background: "transparent", color: T.crimson, border: `1px solid ${T.crimson}55`, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Trash2 size={13} /> Remove</button>}
        <button onClick={() => d.title.trim() && onSave(d)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: cwOf("gold").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {draft.id ? "Save block" : "Add to today"}
        </button>
      </div>
    </SheetShell>
  );
}

function JessSheet({ onClose, onParse, peakHour }) {
  const [text, setText] = useState("");
  // tiny rule parse (live: VoiceScheduler's parser → PlannerItems). Demo parses a typed line.
  const parse = () => {
    const t = text.trim(); if (!t) return;
    const m = /(\d{1,2})\s?(am|pm)/i.exec(t);
    let hour = peakHour;
    if (m) { hour = Number(m[1]) % 12 + (/pm/i.test(m[2]) ? 12 : 0); }
    const type = /walk|run|gym|move|stretch/i.test(t) ? "move" : /lunch|dinner|coffee|drinks|see |call /i.test(t) ? "social" : /deep|work|write|focus|pitch/i.test(t) ? "focus" : "task";
    const title = t.replace(/(at )?\d{1,2}\s?(am|pm)/i, "").trim() || t;
    onParse({ title: title.charAt(0).toUpperCase() + title.slice(1), hour, type, dur: 45, done: false });
  };
  return (
    <SheetShell title="Plan with Jess" eyebrowText="Speak your day" accent={cwOf("sage").petal} onClose={onClose}>
      <div style={{ display: "grid", placeItems: "center", margin: "4px 0 14px" }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: `${cwOf("sage").petal}1F`, display: "grid", placeItems: "center" }}>
          <Mic size={26} color={cwOf("sage").petal} />
        </span>
      </div>
      <p style={{ ...bodySerif, textAlign: "center", color: T.muted, margin: "0 0 14px" }}>
        Say it the way you'd say it to a friend — "deep work at 10, lunch with Mara at 1" — and I'll lay it into your day.
      </p>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Deep work at 10am…" style={{ ...inputBase, marginBottom: 14 }} />
      <button onClick={parse} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf("sage").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        Lay it into my day
      </button>
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
          <button key={x.id} onClick={() => setD((s) => ({ ...s, domain: x.id }))} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 999,
            background: d.domain === x.id ? cwOf(x.cw).petal : T.paper, color: d.domain === x.id ? "#fff" : T.inkSoft, border: `1px solid ${d.domain === x.id ? cwOf(x.cw).petal : T.paperDeep}`,
            fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <x.Icon size={12} color={d.domain === x.id ? "#fff" : cwOf(x.cw).petal} /> {x.label}
          </button>
        ))}
      </div>
      <label style={fieldLabel}>The intention</label>
      <input autoFocus value={d.text} onChange={(e) => setD((s) => ({ ...s, text: e.target.value }))} placeholder={dom.prompt} style={{ ...inputBase, marginBottom: 8 }} />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 16px" }}>{dom.prompt}</p>
      <button onClick={() => d.text.trim() && onSave(d)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf("crimson").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        Set this intention
      </button>
    </SheetShell>
  );
}

function DaySheet({ day, onClose, onPlan }) {
  const w = WEEK.find((x) => x.d === day) || WEEK[0];
  const p = PHASE[w.phase];
  return (
    <SheetShell title={`${day} · ${p.label}`} eyebrowText="Plan this day" accent={p.hue} onClose={onClose}>
      <div style={{ padding: "13px 15px", borderRadius: 12, background: `${p.hue}14`, border: `1px solid ${p.hue}44`, marginBottom: 14 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: p.hue }} />
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{p.label} · {p.season}</span>
        </div>
        <p style={{ ...bodySerif, margin: 0 }}>{p.note}</p>
      </div>
      <button onClick={onPlan} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 12, background: T.ink, color: T.paperHi, border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        <CalendarDays size={15} /> Plan {day}, hour by hour
      </button>
    </SheetShell>
  );
}

function JumpSheet({ onClose, onJump }) {
  return (
    <SheetShell title="Jump to" eyebrowText="Your planner" accent={T.gold} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {SECTIONS.map((s) => {
          const accent = cwOf(s.cw).petal;
          return (
            <button key={s.id} onClick={() => onJump(s.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "13px 12px", borderRadius: 14, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, cursor: "pointer", textAlign: "left" }}>
              <s.Icon size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{s.label}</span>
                <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{s.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </SheetShell>
  );
}
