// PlannerNewDemo — a GROUND-UP Planner rebuilt around ONE surface: THE DAY. Demo-first.
// Live /Planner is NOT touched.
//
// WHY THIS VERSION (Halli, v2 verdict): the first rebuild was still "a deck of cards doing
// basically the same thing or pointing to the same place — no proper structure." Correct.
// Re-thought as a USER (what a woman actually does daily: see today → tick/adjust a thing →
// sense if it's too much for her energy → hold a couple of intentions → glance at the week)
// and as a DEVELOPER (one coherent hierarchy, not a slider of cards).
//
// THE STRUCTURE — one primary surface, everything else is a VIEW or an INPUT of it:
//   1. HERO (compact)        — brand signature only: bloom + "Your day" + date · phase.
//   2. INTENTIONS (one strip) — the *why*: up to 3 compact chips, tap to set/edit.
//   3. THE DAY (the surface)  — dominant. Inside it:
//        • a header BAND with a ‹ date › stepper + a slim CAPACITY/ENERGY strip
//          (phase · % full · peak + a thin energy curve) — capacity woven in, not a card.
//        • ZOOM TABS over the SAME day data: Day (agenda) · Hours (hour-by-hour) · Week
//          (7 cycle-tinted days; tap one to load it into Day). Not separate cards — lenses.
//        • daily ANCHORS (rituals folded into the day) + time-grouped blocks you tick/edit.
//        • ONE add bar — typed OR voice — the single way to plan. "Tomorrow" = step the date.
//
// FOLDED IN / REMOVED (no duplicate pointers): the separate Capacity / Rituals / Week /
// Tomorrow / Summary cards and the Jump-to are gone; the FOUR old plan entry points
// (plan-a-block · plan-with-Jess · add-block · plan-tomorrow) are now ONE add bar; Week and
// Hours are tabs, not cards. CUT entirely (not planning): the logger-opener tiles and the
// clinical trackers (HRT/kick/EPDS/symptom/BBT/doctor-export) — those are Health/Pulse.
//
// v4 bible: PAPER_BG · a compact FwFloraHero signature · phase hues · Cormorant/Ephesis/
// system-sans · Lucide only, no emoji · ≥12px chrome / ≥13px reading · soulful voice · calm,
// scannable, ~1.5 screens. Seeded + interactive (React state, optimistic) so every tap works
// in preview; each interaction is annotated with the REAL base44 entity it writes live
// (PlannerItems / HabitLogs). No new base44 function; live wiring rides the existing
// PlannerDayView / VoiceScheduler / CapacityTaxBar dispatchers.
import { useState, useMemo } from "react";
import {
  Plus, X, Check, Mic, ChevronLeft, ChevronRight, Sun, Moon,
  Briefcase, Users, Heart, Coins, Smile, Leaf, Palette, Feather, ArrowRight,
  Footprints, ListChecks, Utensils, Trash2,
} from "lucide-react";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { floraKeyframes, cwOf } from "@/components/brand/flora";

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
const BASE_CYCLE_DAY = 8; // today

// ── block types (one small vocabulary) ───────────────────────────────────────
const TYPE_META = {
  focus:  { label: "Focus",  Icon: Briefcase,  cw: "plum",  load: 2   },
  task:   { label: "Task",   Icon: ListChecks, cw: "gold",  load: 1   },
  life:   { label: "Life",   Icon: Users,      cw: "sage",  load: 1   },
  move:   { label: "Move",   Icon: Footprints, cw: "sage",  load: 0.5 },
  meal:   { label: "Meal",   Icon: Utensils,   cw: "blush", load: 0.5 },
  rest:   { label: "Rest",   Icon: Moon,       cw: "plum",  load: 0.5 },
};
const partOfDay = (h) => (h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening");

// ── seeded days (THE DAY data — keyed by offset from today; live: PlannerItems) ──
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
  2: [
    { id: "d1", hour: 11, title: "1:1 with Priya",          type: "focus", dur: 45, done: false },
  ],
};

// whole-life intention domains (span life, not just health) ───────────────────
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

// daily anchors (rituals folded INTO the day — real HabitLogs toggles) ────────
const SEED_ANCHORS = [
  { id: "a1", slot: "am", title: "Sunlight + water", done: true },
  { id: "a2", slot: "am", title: "Move 5 min", done: true },
  { id: "a3", slot: "am", title: "Name today's intention", done: false },
  { id: "a4", slot: "pm", title: "Phone down by 10", done: false },
  { id: "a5", slot: "pm", title: "Read 10 pages", done: false },
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am..10pm
function energyCurve(phase) {
  const mult = PHASE[phase].mult;
  return HOURS.map((h) => {
    const base =
      h < 9 ? 0.4 + (h - 7) * 0.12 :
      h <= 12 ? 0.7 + (h - 9) * 0.1 :
      h <= 15 ? 0.95 - (h - 12) * 0.13 :
      h <= 18 ? 0.6 + (h - 15) * 0.04 :
      0.7 - (h - 18) * 0.12;
    return Math.max(0.12, Math.min(1, base * (0.7 + mult * 0.3)));
  });
}

// shared bits ─────────────────────────────────────────────────────────────────
const fmtHour = (h) => `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`;
const dayLabel = (offset) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  const base = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return offset === 0 ? `${base} · Today` : offset === 1 ? `${base} · Tomorrow` : base;
};

// ════════════════════════════════════════════════════════════════════════════
export default function PlannerNewDemo() {
  const [offset, setOffset] = useState(0);
  const [view, setView] = useState("day"); // day | hours | week
  const [days, setDays] = useState(SEED_DAYS);
  const [intentions, setIntentions] = useState(SEED_INTENTIONS);
  const [anchors, setAnchors] = useState(SEED_ANCHORS);
  const [editBlock, setEditBlock] = useState(null);
  const [intentDraft, setIntentDraft] = useState(null);
  const [toast, setToast] = useState(null);

  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2200); };

  const cycleDay = BASE_CYCLE_DAY + offset;
  const phaseKey = phaseFor(cycleDay);
  const ph = PHASE[phaseKey];
  const blocks = useMemo(() => (days[offset] || []).slice().sort((a, b) => a.hour - b.hour), [days, offset]);

  // capacity = phase ceiling vs the load you've planned for THIS day (CapacityTaxBar model)
  const capacity = Math.round(10 * ph.mult * 10) / 10;
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

  // ── the ONE planning input (typed + voice both land here → PlannerItems.create) ──
  const addToDay = (raw) => {
    const t = (raw || "").trim(); if (!t) return;
    const m = /(\d{1,2})\s?(am|pm)/i.exec(t);
    const hour = m ? (Number(m[1]) % 12) + (/pm/i.test(m[2]) ? 12 : 0) : HOURS[peakIdx];
    const type = /walk|run|gym|move|stretch|yoga/i.test(t) ? "move"
      : /lunch|dinner|coffee|drinks|see |call |meet/i.test(t) ? "life"
      : /deep|write|focus|pitch|work/i.test(t) ? "focus"
      : /eat|breakfast|snack|meal/i.test(t) ? "meal" : "task";
    const title = t.replace(/(at\s)?\d{1,2}\s?(am|pm)/i, "").trim() || t;
    const blk = { id: "n" + Date.now(), hour, title: title.charAt(0).toUpperCase() + title.slice(1), type, dur: 45, done: false };
    setDays((ds) => ({ ...ds, [offset]: [...(ds[offset] || []), blk] }));
    flash(offset === 0 ? "Added to today" : `Added to ${dayLabel(offset).split(" · ")[0]}`);
  };
  const toggleBlock = (id) => setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).map((b) => b.id === id ? { ...b, done: !b.done } : b) })); // PlannerItems.update
  const saveBlock = (d) => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).map((b) => b.id === d.id ? d : b) })); setEditBlock(null); flash("Updated"); };
  const deleteBlock = (id) => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).filter((b) => b.id !== id) })); setEditBlock(null); flash("Removed"); };
  const toggleAnchor = (id) => setAnchors((as) => as.map((a) => a.id === id ? { ...a, done: !a.done } : a)); // HabitLogs
  const saveIntention = (d) => {
    if (d.id) setIntentions((xs) => xs.map((x) => x.id === d.id ? d : x));
    else setIntentions((xs) => [...xs, { ...d, id: "i" + Date.now() }]); // PlannerItems.create (timeless, category=domain)
    setIntentDraft(null); flash("Intention set");
  };
  const removeIntention = (id) => setIntentions((xs) => xs.filter((x) => x.id !== id));

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(120px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }}>

        {/* 1 · HERO (brand signature only) */}
        <FwFloraHero
          title="Your day" colorway="sage" bloom="snowdrop"
          flankL="iris" flankR="daffodil" ringSize={196} bloomSize={132}
          line="One day, tended to your energy. Build it, hold what matters, and leave room to rest."
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "8px 0 18px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{ph.label} · Day {((cycleDay - 1) % 28) + 1}</span>
        </div>

        {/* 2 · INTENTIONS (one compact strip — the why) */}
        <IntentionStrip
          intentions={intentions} phaseKey={phaseKey}
          onEdit={setIntentDraft} onAdd={() => setIntentDraft({ domain: "career", text: "" })} onRemove={removeIntention}
        />

        {/* 3 · THE DAY (the one primary surface) */}
        <section style={{ marginTop: 20, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 10px rgba(58,44,26,0.08)" }}>
          {/* header band: date stepper + capacity/energy woven in */}
          <DayHeader
            offset={offset} onStep={(d) => setOffset((o) => Math.max(0, Math.min(6, o + d)))}
            phase={ph} pct={pct} over={over} curve={curve} peakIdx={peakIdx} peakLabel={peakLabel}
            onEase={over ? () => { setDays((ds) => ({ ...ds, [offset]: (ds[offset] || []).filter((b) => !(b.type === "task" && !b.done && !b.anchor)) })); flash("Lighter tasks moved off today"); } : null}
          />

          {/* zoom tabs — three lenses on the SAME day */}
          <div style={{ display: "flex", gap: 6, padding: "12px 14px 0" }}>
            {[["day", "Day"], ["hours", "Hours"], ["week", "Week"]].map(([k, lbl]) => (
              <button key={k} onClick={() => setView(k)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${view === k ? T.ink : T.paperDeep}`, background: view === k ? T.ink : "transparent",
                color: view === k ? T.paperHi : T.muted, fontFamily: UI, fontSize: 13, fontWeight: 700 }}>{lbl}</button>
            ))}
          </div>

          <div style={{ padding: "14px 14px 16px" }}>
            {view === "day" && (
              <DayAgenda blocks={blocks} anchors={anchors} peakIdx={peakIdx} phase={ph}
                onToggle={toggleBlock} onEdit={setEditBlock} onAnchor={toggleAnchor} offset={offset} />
            )}
            {view === "hours" && (
              <HoursView blocks={blocks} peakHour={HOURS[peakIdx]} onEdit={setEditBlock} onAddHour={(h) => addToDay(`block at ${fmtHour(h)}`)} />
            )}
            {view === "week" && (
              <WeekView active={offset} onPick={(o) => { setOffset(o); setView("day"); }} />
            )}
          </div>
        </section>

        {/* ONE add bar — typed OR voice, the single way to plan */}
        <AddBar onAdd={addToDay} dayName={dayLabel(offset).split(" · ").pop()} />

      </div>

      {editBlock && <BlockSheet draft={editBlock} peakHour={HOURS[peakIdx]} onClose={() => setEditBlock(null)} onSave={saveBlock} onDelete={() => deleteBlock(editBlock.id)} />}
      {intentDraft && <IntentionSheet draft={intentDraft} onClose={() => setIntentDraft(null)} onSave={saveIntention} />}

      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: "calc(140px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999,
          background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>
      )}
    </div>
  );
}

// ── 2 · INTENTIONS strip ─────────────────────────────────────────────────────
function IntentionStrip({ intentions, phaseKey, onEdit, onAdd, onRemove }) {
  const lean = { menstrual: ["rest", "self"], follicular: ["career", "create"], ovulatory: ["career", "love"], luteal: ["rest", "friend"] }[phaseKey] || ["self"];
  return (
    <div>
      <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>Today I want to…</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {intentions.map((it) => {
          const d = domainOf(it.domain), dcw = cwOf(d.cw).petal;
          return (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 11px", borderRadius: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${dcw}` }}>
              <d.Icon size={15} color={dcw} style={{ flexShrink: 0 }} />
              <button onClick={() => onEdit(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.3 }}>{it.text}</button>
              <button onClick={() => onRemove(it.id)} aria-label="Remove intention" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, flexShrink: 0 }}><X size={14} /></button>
            </div>
          );
        })}
      </div>
      {intentions.length < 3 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {lean.map(domainOf).map((d) => (
            <button key={d.id} onClick={() => onEdit({ domain: d.id, text: "" })} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, background: `${cwOf(d.cw).petal}14`, border: `1px solid ${cwOf(d.cw).petal}55`, color: T.inkSoft, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <d.Icon size={12} color={cwOf(d.cw).petal} /> {d.label}
            </button>
          ))}
          <button onClick={onAdd} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 11px", borderRadius: 999, background: "transparent", border: `1px dashed ${T.paperDeep}`, color: T.muted, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Plus size={12} /> Other</button>
        </div>
      )}
    </div>
  );
}

// ── 3 · THE DAY — header band (date stepper + capacity/energy) ────────────────
function DayHeader({ offset, onStep, phase, pct, over, curve, peakIdx, peakLabel, onEase }) {
  const max = Math.max(...curve);
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  return (
    <div style={{ padding: "14px 14px 12px", background: `linear-gradient(180deg, ${phase.hue}14, transparent)`, borderBottom: `1px solid ${T.paperDeep}` }}>
      {/* date stepper */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => onStep(-1)} disabled={offset === 0} aria-label="Previous day" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: offset === 0 ? T.paperDeep : T.inkSoft, cursor: offset === 0 ? "default" : "pointer", display: "grid", placeItems: "center" }}><ChevronLeft size={16} /></button>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: T.ink }}>{dayLabel(offset)}</span>
        <button onClick={() => onStep(1)} aria-label="Next day" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.inkSoft, cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronRight size={16} /></button>
      </div>
      {/* capacity + energy woven in */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: phase.hue, flexShrink: 0 }} />
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{phase.label}</span>
        <span style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(58,44,26,0.10)", overflow: "hidden", position: "relative" }}>
          <span style={{ position: "absolute", inset: 0, width: `${Math.min(130, pct) / 130 * 100}%`, background: barColor }} />
          <span style={{ position: "absolute", top: 0, left: `${100 / 130 * 100}%`, height: "100%", width: 2, background: "rgba(58,44,26,0.28)" }} />
        </span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: barColor, flexShrink: 0 }}>{pct}% full</span>
      </div>
      {/* thin energy curve */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 26 }}>
        {curve.map((v, i) => (
          <span key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, borderRadius: "2px 2px 0 0", background: i === peakIdx ? phase.hue : cwOf("sage").petal, opacity: i === peakIdx ? 1 : 0.4 }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{phase.note} Peak ~{peakLabel}.</span>
        {onEase && <button onClick={onEase} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, background: cwOf("plum").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}><ArrowRight size={12} /> Ease it</button>}
      </div>
    </div>
  );
}

// ── 3 · THE DAY — Day agenda (anchors folded in + time-grouped blocks) ────────
function DayAgenda({ blocks, anchors, peakIdx, phase, onToggle, onEdit, onAnchor, offset }) {
  const groups = ["Morning", "Afternoon", "Evening"];
  const byGroup = groups.map((g) => ({ g, items: blocks.filter((b) => partOfDay(b.hour) === g) })).filter((x) => x.items.length);
  return (
    <div>
      {/* daily anchors — rituals folded into the day (only on today) */}
      {offset === 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Daily anchors</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {anchors.map((a) => (
              <button key={a.id} onClick={() => onAnchor(a.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 999, cursor: "pointer",
                background: a.done ? `${cwOf("sage").petal}1F` : T.paper, border: `1px solid ${a.done ? cwOf("sage").petal : T.paperDeep}`, fontFamily: UI, fontSize: 13, fontWeight: 600, color: a.done ? T.muted : T.inkSoft }}>
                {a.slot === "am" ? <Sun size={12} color={cwOf("gold").petal} /> : <Moon size={12} color={cwOf("plum").petal} />}
                <span style={{ textDecoration: a.done ? "line-through" : "none" }}>{a.title}</span>
                {a.done && <Check size={12} color={cwOf("sage").petal} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* the blocks, grouped by part of day */}
      {byGroup.length === 0 && (
        <div style={{ textAlign: "center", padding: "22px 8px", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>
          Nothing planned yet. Add the first thing below — it's a soft, open day.
        </div>
      )}
      {byGroup.map(({ g, items }) => (
        <div key={g} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: phase.hue, marginBottom: 6 }}>{g}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {items.map((b) => {
              const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal;
              const peak = !b.done && b.hour >= HOURS[peakIdx] - 1 && b.hour <= HOURS[peakIdx] + 2;
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${tcw}` }}>
                  <button onClick={() => onToggle(b.id)} aria-label={b.done ? "Mark not done" : "Mark done"} style={{ width: 23, height: 23, borderRadius: 7, flexShrink: 0, cursor: "pointer", border: `1.5px solid ${b.done ? cwOf("sage").petal : T.paperDeep}`, background: b.done ? cwOf("sage").petal : "transparent", display: "grid", placeItems: "center" }}>{b.done && <Check size={13} color="#fff" />}</button>
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, width: 42, flexShrink: 0 }}>{fmtHour(b.hour)}</span>
                  <button onClick={() => onEdit(b)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: b.done ? T.muted : T.ink, textDecoration: b.done ? "line-through" : "none", lineHeight: 1.25 }}>{b.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <tm.Icon size={11} color={tcw} />
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{tm.label} · {b.dur}m</span>
                      {b.anchor && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: cwOf("gold").accent }}>· anchor</span>}
                      {peak && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: phase.hue }}>· in your peak</span>}
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

// ── 3 · THE DAY — Hours view (same blocks, hour-by-hour) ──────────────────────
function HoursView({ blocks, peakHour, onEdit, onAddHour }) {
  return (
    <div>
      {HOURS.map((h) => {
        const here = blocks.filter((b) => b.hour === h);
        const isPeak = h === peakHour;
        return (
          <div key={h} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8, alignItems: "start", minHeight: 34, padding: "3px 0", borderTop: `1px solid ${T.paperDeep}55` }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isPeak ? PHASE.follicular.hue : T.muted, paddingTop: 5, textAlign: "right" }}>{fmtHour(h)}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 4 }}>
              {here.length === 0
                ? <button onClick={() => onAddHour(h)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, border: `1px dashed ${T.paperDeep}`, background: "transparent", color: T.muted, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Plus size={11} /> Add</button>
                : here.map((b) => {
                    const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal;
                    return (
                      <button key={b.id} onClick={() => onEdit(b)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 10, background: `${tcw}1A`, borderLeft: `3px solid ${tcw}`, border: "none", cursor: "pointer", textAlign: "left" }}>
                        <tm.Icon size={13} color={tcw} style={{ flexShrink: 0 }} />
                        <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, textDecoration: b.done ? "line-through" : "none" }}>{b.title}</span>
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

// ── 3 · THE DAY — Week view (7 cycle-tinted days; tap one to load it) ─────────
function WeekView({ active, onPick }) {
  return (
    <div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 10 }}>Tap a day to plan it. Each carries its phase — lean into the bright days, soften the tender ones.</div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: 7 }, (_, o) => {
          const cd = BASE_CYCLE_DAY + o, pk = phaseFor(cd), hue = PHASE[pk].hue;
          const d = new Date(); d.setDate(d.getDate() + o);
          const wd = d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2);
          const count = (SEED_DAYS[o] || []).length;
          const isActive = o === active;
          return (
            <button key={o} onClick={() => onPick(o)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 2px", borderRadius: 12, cursor: "pointer",
              background: isActive ? `${hue}1F` : "transparent", border: isActive ? `1.5px solid ${hue}` : `1px solid ${T.paperDeep}` }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isActive ? T.ink : T.muted }}>{wd}</span>
              <span style={{ fontFamily: UI, fontSize: 16, fontWeight: 600, color: T.ink }}>{d.getDate()}</span>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: hue }} />
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>{count || "–"}</span>
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

// ── ONE add bar (typed + voice → the same addToDay) ──────────────────────────
function AddBar({ onAdd, dayName }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const submit = () => { if (text.trim()) { onAdd(text); setText(""); } };
  const mic = () => {
    // live: VoiceScheduler's recogniser → same parse. Demo seeds a phrase so the flow is shown.
    setListening(true);
    window.setTimeout(() => { setText("Coffee with Sam at 3pm"); setListening(false); }, 700);
  };
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(70px + env(safe-area-inset-bottom))", zIndex: 40, display: "flex", justifyContent: "center", padding: "0 16px", pointerEvents: "none" }}>
      <div style={{ width: "100%", maxWidth: 430, display: "flex", alignItems: "center", gap: 8, padding: "8px 8px 8px 14px", borderRadius: 999, background: T.paperHi, border: `1px solid ${T.paperDeep}`, boxShadow: "0 6px 22px rgba(58,44,26,0.18)", pointerEvents: "auto" }}>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={listening ? "Listening…" : `Add to ${dayName.toLowerCase()}…`} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontFamily: SERIF, fontSize: 15, color: T.ink }} />
        <button onClick={mic} aria-label="Add by voice" style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: listening ? cwOf("sage").petal : T.paper, border: `1px solid ${T.paperDeep}`, color: listening ? "#fff" : cwOf("sage").petal, display: "grid", placeItems: "center", cursor: "pointer" }}><Mic size={16} /></button>
        <button onClick={submit} aria-label="Add to your day" style={{ width: 38, height: 38, borderRadius: 999, flexShrink: 0, background: cwOf("gold").petal, border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={18} /></button>
      </div>
    </div>
  );
}

// ── sheets (editors of the one day — not new surfaces) ───────────────────────
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
          <select value={d.hour} onChange={(e) => set("hour", Number(e.target.value))} style={inputBase}>
            {HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}{h === peakHour ? " · peak" : ""}</option>)}
          </select></div>
        <div><label style={fieldLabel}>How long</label>
          <select value={d.dur} onChange={(e) => set("dur", Number(e.target.value))} style={inputBase}>
            {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select></div>
      </div>
      <label style={fieldLabel}>Kind</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {Object.entries(TYPE_META).map(([k, v]) => (
          <button key={k} onClick={() => set("type", k)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: d.type === k ? cwOf(v.cw).petal : T.paper, color: d.type === k ? "#fff" : T.inkSoft, border: `1px solid ${d.type === k ? cwOf(v.cw).petal : T.paperDeep}`, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <v.Icon size={12} color={d.type === k ? "#fff" : cwOf(v.cw).petal} /> {v.label}
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
    <SheetShell title="An intention" eyebrowText="Today I want to" accent={cwOf("crimson").petal} onClose={onClose}>
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
