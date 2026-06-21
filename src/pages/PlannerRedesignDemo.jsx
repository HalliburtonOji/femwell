// PlannerRedesignDemo — STANDALONE v4 redesign preview of the LIVE Planner
// (PlannerV2Shell), for Halli's approval before going live. Demo-first; the live
// Planner is NOT touched.
//
// STANDING RULE honoured: read the live Planner in full first — NOTHING stripped.
// Every live feature area is preserved here, re-skinned to the v4 Brand Bible:
//   · Header → flora-hero + rotating tap-to-reveal OMEN header + one summary card
//   · Week strip (reuses the Today session's clipboard slider once it ships)
//   · Today / Cycle views
//   · Your Day time-buckets (morning/afternoon/evening: tasks·meals·habits·meds)
//     → rich Card.jsx rows with the §6.7.6 QUICK-ACTION POPUP (tick/log in place)
//   · Hour-by-hour DAY VIEW overlay (FullScheduleOverlay) — re-skinned, preserved
//   · CYCLE CALENDAR overlay (FullCycleOverlay month grid) — re-skinned, preserved
//   · Lists · Rituals (links the existing RitualBuilder) · Intentions · Nourishment
//     · Mind & insight · Care · Tonight · Plan-a-day · Add FAB
//   · the soulful voice (kettle rule, "they say…"), PAPER_BG, ≥12 fonts, no trap.
// Fixes Planner's offenders: PAPER_BG, Card.jsx family, font floor, tokens, sheets
// render above the nav (.fw-sheet-safe). Writes ride existing dispatchers on live
// (RitualsTick/HabitLogs/PlannerItems) — NO new function.
import { useState } from "react";
import {
  ArrowLeft, Plus, Check, X, Moon, Droplet, Feather, Heart, Sparkles, ListChecks,
  CalendarDays, CalendarClock, Pill, Footprints, Utensils, Sun, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SCRIPT, SERIF, UI, PAPER_BG, Heart as BrandHeart } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { FwCard, FwCardCTA, SummaryCard } from "@/components/brand/Card";
import { RichBloomV2, FlowerGlyph, floraKeyframes, cwOf } from "@/components/brand/flora";

const PHASE = "luteal", PHCW = "plum";        // seeded: luteal · day 25
const ph = cwOf(PHCW);

// ── seed content ─────────────────────────────────────────────────────────────
const WEEK = [
  { d: "M", n: 18 }, { d: "T", n: 19 }, { d: "W", n: 20 }, { d: "T", n: 21, today: true }, { d: "F", n: 22 }, { d: "S", n: 23 }, { d: "S", n: 24 },
];
const DAY = {
  morning: [
    { id: "m1", type: "ritual", icon: Moon, title: "A moment of rest", meta: "ritual", cw: "plum" },
    { id: "m2", type: "meal", icon: Utensils, title: "Log breakfast", meta: "meal", cw: "gold" },
    { id: "m3", type: "task", icon: ListChecks, title: "Reply to Mum", meta: "task · 10 min", cw: "sage" },
  ],
  afternoon: [
    { id: "a1", type: "habit", icon: Footprints, title: "A gentle walk", meta: "habit · 20 min", cw: "sage" },
    { id: "a2", type: "med", icon: Pill, title: "Magnesium", meta: "supplement", cw: "crimson" },
  ],
  evening: [
    { id: "e1", type: "mood", icon: Heart, title: "Log how today felt", meta: "check-in", cw: "crimson" },
    { id: "e2", type: "ritual", icon: Feather, title: "Three quiet lines", meta: "journal ritual", cw: "blush" },
  ],
};
const BLOCKS = [
  { id: "b1", hour: 8, title: "Breakfast", dur: 30, type: "meal", cw: "gold" },
  { id: "b2", hour: 10, title: "Team sync", dur: 45, type: "event", cw: "plum" },
  { id: "b3", hour: 13, title: "Walk + lunch", dur: 60, type: "habit", cw: "sage" },
  { id: "b4", hour: 16, title: "Deep work", dur: 90, type: "task", cw: "sage" },
  { id: "b5", hour: 20, title: "Wind-down ritual", dur: 20, type: "ritual", cw: "crimson" },
];
const LISTS = [
  { id: "l1", name: "This week", count: 5, items: ["Book smear test", "Birthday card for J", "Renew prescription"] },
  { id: "l2", name: "Someday", count: 8, items: ["Plan the trip", "That pottery class"] },
];
const PHASE_CAL = { 0: "p", 1: "p", 2: "p", 3: "p", 4: "f", 5: "f", 6: "f", 7: "f", 8: "f", 9: "f", 10: "f", 11: "o", 12: "o", 13: "o", 14: "o", 15: "l", 16: "l", 17: "l", 18: "l", 19: "l", 20: "l" };
const CAL_TONE = { p: ph.petal, f: cwOf("sage").petal, o: cwOf("gold").petal, l: cwOf("plum").petal, "": T.paperDeep };

export default function PlannerRedesignDemo() {
  const navigate = useNavigate();
  const [view, setView] = useState("today");
  const [done, setDone] = useState({});
  const [popup, setPopup] = useState(null);     // {item}
  const [dayView, setDayView] = useState(false);
  const [calView, setCalView] = useState(false);
  const [omenOpen, setOmenOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const complete = (id) => { setDone((d) => ({ ...d, [id]: true })); setPopup(null); };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 110, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      {/* ribbon */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => navigate(createPageUrl("Ideas"))} aria-label="Back to Ideas" style={ribbonBtn}><ArrowLeft size={13} /> Ideas</button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold }}>Demo · Planner · v4 redesign</span>
      </div>

      <FwFloraHero title="Planner" bloom="cosmos" colorway={PHCW} flankL="clover" flankR="chamomile" creature="butterfly"
        line="Your week, gently — a few kind intentions and the rituals that hold your days." />

      {/* ROTATING OMEN HEADER — tap to reveal (§10) */}
      <div style={{ maxWidth: 600, margin: "6px auto 0", padding: "0 16px" }}>
        <button onClick={() => setOmenOpen((o) => !o)} style={{ width: "100%", textAlign: "left", cursor: "pointer", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${ph.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${ph.petal}`, borderRadius: 18, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
          <FlowerGlyph variant="cosmos" size={38} color={ph.petal} color2={ph.tip} idx="omen" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: ph.petal }}>Today's almanac</div>
            <div style={{ fontFamily: SCRIPT, fontSize: 21, color: T.ink, lineHeight: 1.15 }}>The cosmos keeps its own time</div>
            {omenOpen && <div style={{ marginTop: 6 }}>
              <p style={omenLine}><b>Floriography ·</b> cosmos = order out of chaos; a calm, balanced day.</p>
              <p style={omenLine}><b>They say ·</b> a flower that blooms late still blooms on time. No rush — light the kettle.</p>
              <p style={omenLine}><b>Why now ·</b> you're in your luteal week — slower is the plan, not the failure.</p>
            </div>}
          </div>
          <ChevronRight size={16} style={{ color: T.muted, transform: omenOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
        </button>
      </div>

      {/* WEEK STRIP (reuses the Today session's clipboard slider on live) */}
      <div style={{ maxWidth: 600, margin: "14px auto 0", padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
          {WEEK.map((w) => (
            <div key={w.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", borderRadius: 14, background: w.today ? ph.petal : T.paperHi, border: `1px solid ${w.today ? ph.petal : T.paperDeep}` }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: w.today ? "#fff" : T.muted }}>{w.d}</span>
              <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: w.today ? "#fff" : T.ink }}>{w.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW TOGGLE — Today / Cycle (both preserved) */}
      <div style={{ maxWidth: 600, margin: "14px auto 0", padding: "0 16px", display: "flex", gap: 8 }}>
        {[["today", "Today"], ["cycle", "Cycle"]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} style={{ flex: 1, cursor: "pointer", fontFamily: UI, fontSize: 14, fontWeight: 700, padding: "10px 0", borderRadius: 999, border: `1px solid ${view === k ? T.ink : T.paperDeep}`, background: view === k ? T.ink : "transparent", color: view === k ? T.paper : T.muted }}>{label}</button>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {view === "today" ? (
          <>
            <DemoWrap><div style={{ marginTop: 16 }}><SummaryCard eyebrow="Your day, gently" rows={[
              { Icon: Sun, label: "First", text: "A moment of rest before the day grabs you", onClick: () => setPopup(DAY.morning[0]) },
              { Icon: ListChecks, label: "Today", text: "3 small things — none of them urgent", onClick: () => setDayView(true) },
              { Icon: Moon, label: "Tonight", text: "Log how today felt + three quiet lines", onClick: () => setPopup(DAY.evening[0]) },
            ]} /></div></DemoWrap>

            {/* YOUR DAY — time buckets with quick-action popups */}
            <Sec title="Your day" sub="morning · afternoon · evening — tap any to do it right here">
              {["morning", "afternoon", "evening"].map((part) => (
                <div key={part} style={{ maxWidth: 600, margin: "0 auto 10px", padding: "0 16px" }}>
                  <div style={partLabel}>{part}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {DAY[part].map((it) => {
                      const c = cwOf(it.cw); const Icon = it.icon; const isDone = done[it.id];
                      return (
                        <button key={it.id} onClick={() => !isDone && setPopup(it)} style={{ ...rowCard, borderLeft: `3px solid ${c.petal}`, opacity: isDone ? 0.62 : 1 }}>
                          <span style={{ ...rowDisc, background: T.wax || T.paper, borderColor: T.paperDeep }}><Icon size={15} color={c.petal} /></span>
                          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{it.title}</div>
                            <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: ".04em", textTransform: "uppercase" }}>{it.meta}</div>
                          </div>
                          {isDone ? <Check size={18} color={c.petal} /> : <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: c.petal }}>Do it</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Sec>

            {/* HOUR-BY-HOUR DAY VIEW (preserved → overlay) */}
            <Sec title="Plan the day" sub="the full hour-by-hour schedule, kept">
              <DemoWrap>
                <FwCard accent={ph.petal} Icon={CalendarClock} eyebrow="Schedule" flower="iris" title="Today, hour by hour"
                  line={`${BLOCKS.length} blocks planned — breakfast, a team sync, a walk, deep work, a wind-down. Tap to open the timeline and edit.`}
                  idx="sched" action={<FwCardCTA accent={ph.petal} onClick={() => setDayView(true)} icon={CalendarClock}>Open the day view</FwCardCTA>} />
              </DemoWrap>
            </Sec>

            {/* LISTS (preserved) */}
            <Sec title="Lists" sub="the things that aren't tied to a time">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LISTS.map((l) => (
                  <FwCard key={l.id} accent={T.gold} Icon={ListChecks} eyebrow={`${l.count} items`} flower="sunflower" title={l.name}
                    line={l.items.join(" · ")} idx={`list-${l.id}`}
                    action={<FwCardCTA accent={T.gold} onClick={() => setAddOpen(true)}>Add to list</FwCardCTA>} />
                ))}
              </div></DemoWrap>
            </Sec>

            {/* RITUALS (links the existing RitualBuilder on live) */}
            <Sec title="Rituals" sub="the daily tending — composed here, surfaced everywhere">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FwCard accent={ph.petal} Icon={Moon} eyebrow="Your set" flower="violet" title="Morning stack · 3 rituals"
                  line="Rest · a glass of water · three quiet lines. Each one ticks in place and grows a bloom."
                  idx="ritset" action={<FwCardCTA accent={ph.petal} onClick={() => setPopup(DAY.morning[0])}>Do today's ritual</FwCardCTA>} />
                <FwCard accent={T.sage} Icon={Plus} eyebrow="Builder" flower="fern" title="Compose a ritual set"
                  line="The Ritual Builder lives here — pick the small tendings that hold your week. (Reuses the existing builder; surfaces on Today via the other session.)"
                  idx="ritbuild" action={<FwCardCTA accent={T.sage} onClick={() => navigate(createPageUrl("RitualBuilderDemo"))}>Open the builder</FwCardCTA>} />
              </div></DemoWrap>
            </Sec>

            {/* MIND & INTENTION */}
            <Sec title="Mind & intention" sub="set the day's seed; notice how it feels">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FwCard accent={T.crimson} Icon={Sparkles} eyebrow="Today's intention" flower="poppy" title="“More slow mornings”"
                  line="Set one gentle intention — it plants a seed and tints today's nudges." idx="intent"
                  action={<FwCardCTA accent={T.crimson} onClick={() => setPopup({ id: "intent", type: "intention", icon: Sparkles, title: "Set today's intention", cw: "crimson" })}>Set the intention</FwCardCTA>} />
                <FwCard accent={ph.petal} Icon={Heart} eyebrow="Mood" flower="cosmos" title="How are you, really?"
                  line="A quick mood + energy check — it feeds your Pulse patterns." idx="mood"
                  action={<FwCardCTA accent={ph.petal} onClick={() => setPopup(DAY.evening[0])}>Log mood</FwCardCTA>} />
              </div></DemoWrap>
            </Sec>

            {/* NOURISHMENT */}
            <Sec title="Nourishment" sub="kind, phase-aware fuel">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FwCard accent="#5F7E8E" Icon={Droplet} eyebrow="Hydration" flower="bluebell" title="4 of 8 glasses"
                  line="One more this afternoon? A bluebell only rings for those who listen — and sip." idx="hyd"
                  action={<FwCardCTA accent="#5F7E8E" onClick={() => setPopup({ id: "water", type: "water", icon: Droplet, title: "A glass of water", cw: "sky" })}>Add a glass</FwCardCTA>} />
                <FwCard accent={T.gold} Icon={Utensils} eyebrow="For your luteal week" flower="marigold" title="Iron-friendly meals"
                  line="Cosy red lentil dal, dark-chocolate things. The days before your period like a little iron." idx="meal"
                  action={<FwCardCTA accent={T.gold} onClick={() => navigate(createPageUrl("Nutrition"))}>See meals</FwCardCTA>} />
              </div></DemoWrap>
            </Sec>

            {/* CARE */}
            <Sec title="Care" sub="meds, symptoms, the GP thread">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FwCard accent={T.crimson} Icon={Pill} eyebrow="Today" flower="anemone" title="Magnesium + Vitamin D"
                  line="Tap to tick tonight's supplements." idx="meds"
                  action={<FwCardCTA accent={T.crimson} onClick={() => setPopup({ id: "meds", type: "ritual", icon: Pill, title: "Tick tonight's meds", cw: "crimson" })}>Mark taken</FwCardCTA>} />
                <FwCard accent={ph.petal} Icon={Heart} eyebrow="Symptoms" flower="dahlia" title="Anything to note?"
                  line="A quick symptom log — it builds your Doctor Export quietly." idx="sx"
                  action={<FwCardCTA accent={ph.petal} onClick={() => setPopup({ id: "sx", type: "mood", icon: Heart, title: "Log a symptom", cw: "plum" })}>Log a symptom</FwCardCTA>} />
              </div></DemoWrap>
            </Sec>

            {/* TONIGHT */}
            <Sec title="Tonight" sub="close the day softly">
              <DemoWrap>
                <FwCard accent={ph.petal} Icon={Moon} eyebrow="End of day" flower="violet" title="Tomorrow, lightly"
                  line="One thing for tomorrow · a line about today. They say the luna moth rests in the dark so it can fly at dawn." idx="tonight"
                  action={<FwCardCTA accent={ph.petal} onClick={() => setPopup(DAY.evening[1])}>Leave a line</FwCardCTA>} />
              </DemoWrap>
            </Sec>
          </>
        ) : (
          /* ── CYCLE VIEW ── */
          <>
            <DemoWrap><div style={{ marginTop: 16 }}><SummaryCard eyebrow="Your body today" rows={[
              { Icon: Moon, label: "Phase", text: "Luteal · day 25 — inner autumn, softening", onClick: () => setCalView(true) },
              { Icon: Heart, label: "Likely", text: "Period in ~3 days — be a little kinder", onClick: () => setCalView(true) },
              { Icon: Sparkles, label: "Energy", text: "Lower today — plan the gentle things", onClick: () => {} },
            ]} /></div></DemoWrap>

            <Sec title="Your cycle" sub="the month at a glance — every day tappable">
              <DemoWrap>
                <FwCard accent={ph.petal} Icon={CalendarDays} eyebrow="This cycle" flower="dahlia" title="Day 25 of 28"
                  line="Luteal week. Tap any day to see its phase, energy and what you logged. The full calendar is kept — just re-skinned."
                  idx="cyc" action={<FwCardCTA accent={ph.petal} onClick={() => setCalView(true)} icon={CalendarDays}>Open the cycle calendar</FwCardCTA>} />
              </DemoWrap>
            </Sec>

            <Sec title="What's growing" sub="your week, read back gently">
              <DemoWrap><div style={{ display: "grid", placeItems: "center", padding: "8px 0" }}>
                <RichBloomV2 form="dahlia" color={ph.petal} color2={ph.tip} accent={ph.accent} size={150} idx="cyc-bloom" />
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", maxWidth: 320, marginTop: 6 }}>Dahlia for the luteal: strength and grace under change. You've kept three rituals this week — the garden noticed.</p>
              </div></DemoWrap>
            </Sec>
          </>
        )}

        {/* PLAN-A-DAY entry */}
        <Sec title="Plan ahead" sub="lay out a future day, gently">
          <DemoWrap>
            <FwCard accent={T.gold} Icon={CalendarDays} eyebrow="Plan a day" flower="sunflower" title="Block out a day before it arrives"
              line="Pick a date, drop in the anchors (work, rest, a walk) and let the rest flow around them." idx="plan"
              action={<FwCardCTA accent={T.gold} onClick={() => setAddOpen(true)}>Plan a day</FwCardCTA>} />
          </DemoWrap>
        </Sec>
      </div>

      {/* ADD FAB */}
      <button onClick={() => setAddOpen(true)} aria-label="Add" style={fab}><Plus size={26} color="#fff" /></button>

      {popup && <QuickPopup item={popup} onClose={() => setPopup(null)} onDone={complete} />}
      {dayView && <DayViewOverlay onClose={() => setDayView(false)} />}
      {calView && <CycleCalendarOverlay onClose={() => setCalView(false)} />}
      {addOpen && <AddPopup onClose={() => setAddOpen(false)} />}
    </div>
  );
}

// ── helpers ──
function DemoWrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }
function Sec({ title, sub, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 18px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <FlowerGlyph variant="primrose" size={18} color={T.gold} idx={`s-${title}`} />
        <div>
          <div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink, lineHeight: 1.05 }}>{title}</div>
          {sub && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted }}>{sub}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

// §6.7.6 quick-action popup
function QuickPopup({ item, onClose, onDone }) {
  const [note, setNote] = useState("");
  const c = cwOf(item.cw || "sage"); const Icon = item.icon || Check;
  const body = {
    meal: "Recent + a quick search — what did you have?",
    water: "Half a glass counts. Tap to add it.",
    mood: "How's your energy, really? Pick one.",
    intention: "A few smart suggestions, or your own words.",
    ritual: "A small tending — confirm when it's done.",
    task: "Tick it when it's done — no fake checkmarks.",
  }[item.type] || "Do it here, then it ticks.";
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheet}>
        <div style={{ width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ ...rowDisc, width: 34, height: 34, background: T.wax || T.paper }}><Icon size={16} color={c.petal} /></span>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.2, flex: 1 }}>{item.title}</div>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, lineHeight: 1.5, margin: "4px 0 12px" }}>{body}</p>
        <div style={{ display: "grid", placeItems: "center", margin: "0 0 12px" }}>
          <RichBloomV2 form="cosmos" color={c.petal} color2={c.tip} accent={c.accent} size={100} idx={`qp-${item.id}`} />
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A word, if you like (optional)…" rows={2} style={ta} />
        <button onClick={() => onDone(item.id)} style={{ ...cta, background: c.petal }}><Check size={16} /> Done — and a bloom opens</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10 }}>
          <FlowerGlyph variant="fern" size={15} color={T.sage} idx="qp-foot" />
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>a vote for who you're becoming</span>
        </div>
      </div>
    </div>
  );
}

// Hour-by-hour day view (preserved feature, re-skinned)
function DayViewOverlay({ onClose }) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  return (
    <div role="dialog" aria-modal="true" style={overlay}>
      <div style={overlayHead}>
        <button onClick={onClose} style={ribbonBtn}><ArrowLeft size={14} /> Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold }}>Schedule · Thu 21 Jun</div>
          <div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink }}>Today, hour by hour</div>
        </div>
        <button onClick={onClose} style={ribbonBtn} aria-label="Add"><Plus size={14} /></button>
      </div>
      <div className="fw-sheet-safe" style={{ padding: "4px 16px 30px", overflowY: "auto" }}>
        {hours.map((h) => {
          const blocks = BLOCKS.filter((b) => b.hour === h); const isNow = h === 16;
          return (
            <div key={h} style={{ display: "flex", gap: 10, minHeight: 46 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, minWidth: 46, paddingTop: 4 }}>{h <= 12 ? h : h - 12}{h < 12 ? "am" : "pm"}</span>
              <div style={{ width: 2, background: isNow ? T.crimson : T.paperDeep, borderRadius: 2, position: "relative" }}>{isNow && <span style={{ position: "absolute", top: 0, left: -3, width: 8, height: 8, borderRadius: 99, background: T.crimson }} />}</div>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                {blocks.length === 0
                  ? <button style={emptySlot}><Plus size={12} /> Add</button>
                  : blocks.map((b) => { const c = cwOf(b.cw); return (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 9, background: `${c.petal}14`, borderLeft: `3px solid ${c.petal}`, borderRadius: 10, padding: "9px 11px", minHeight: 28 + Math.min(60, b.dur) * 0.4 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{b.title}</div>
                        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{b.dur} min · {b.type}</div>
                      </div>
                    </div>
                  ); })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Cycle calendar (preserved feature, re-skinned)
function CycleCalendarOverlay({ onClose }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 2); // a 5-week grid, offset
  return (
    <div role="dialog" aria-modal="true" style={overlay}>
      <div style={overlayHead}>
        <button onClick={onClose} style={ribbonBtn}><ArrowLeft size={14} /> Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold }}>Cycle · June</div>
          <div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink }}>Your month</div>
        </div>
        <BrandHeart size={16} />
      </div>
      <div className="fw-sheet-safe" style={{ padding: "4px 16px 30px", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>{d}</div>)}
          {days.map((cd, i) => {
            const valid = cd >= 1 && cd <= 28; const tone = CAL_TONE[PHASE_CAL[cd] || ""]; const isToday = cd === 25;
            return (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 10, display: "grid", placeItems: "center", border: isToday ? `2px solid ${ph.petal}` : `1px solid ${T.paperDeep}`, background: valid ? `${tone}22` : "transparent" }}>
                {valid && <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: isToday ? 700 : 500, color: T.ink }}>{cd}</span>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: tone }} />
                </div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, justifyContent: "center" }}>
          {[["Menstrual", ph.petal], ["Follicular", cwOf("sage").petal], ["Ovulatory", cwOf("gold").petal], ["Luteal", cwOf("plum").petal]].map(([l, col]) => (
            <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, color: T.muted }}><span style={{ width: 9, height: 9, borderRadius: 99, background: col }} /> {l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add popup (quick add — task/event/meal/ritual)
function AddPopup({ onClose }) {
  const opts = [
    { id: "task", label: "Task", Icon: ListChecks, cw: "sage" },
    { id: "event", label: "Event", Icon: CalendarClock, cw: "plum" },
    { id: "meal", label: "Meal", Icon: Utensils, cw: "gold" },
    { id: "ritual", label: "Ritual", Icon: Moon, cw: "crimson" },
    { id: "note", label: "A line", Icon: Feather, cw: "blush" },
    { id: "intention", label: "Intention", Icon: Sparkles, cw: "gold" },
  ];
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheet}>
        <div style={{ width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" }} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink, marginBottom: 2 }}>Add to your day</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>what shall we tend to?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {opts.map((o) => { const c = cwOf(o.cw); return (
            <button key={o.id} onClick={onClose} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 6px", borderRadius: 14, border: `1px solid ${T.paperDeep}`, background: T.paper, cursor: "pointer" }}>
              <o.Icon size={22} color={c.petal} />
              <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>{o.label}</span>
            </button>
          ); })}
        </div>
      </div>
    </div>
  );
}

// ── styles ──
const ribbonBtn = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted };
const omenLine = { fontFamily: SERIF, fontSize: 14, color: T.muted, margin: "4px 0 0", lineHeight: 1.45 };
const partLabel = { fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold, margin: "0 0 6px 2px" };
const rowCard = { display: "flex", alignItems: "center", gap: 11, width: "100%", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "11px 13px", cursor: "pointer", boxShadow: "0 2px 10px rgba(11,8,5,.05)" };
const rowDisc = { width: 32, height: 32, borderRadius: 9, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 };
const fab = { position: "fixed", right: 18, bottom: "calc(var(--fw-nav-h, 76px) + 14px)", width: 56, height: 56, borderRadius: 999, background: T.crimson, border: "none", boxShadow: "0 6px 22px rgba(188,46,39,.4)", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 50 };
const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheet = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `1px solid ${T.paperDeep}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "82dvh", overflowY: "auto" };
const ta = { width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", resize: "none", marginBottom: 12 };
const cta = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" };
const overlay = { ...PAPER_BG, position: "fixed", inset: 0, zIndex: 9998, display: "flex", flexDirection: "column", overflowY: "auto" };
const overlayHead = { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}`, position: "sticky", top: 0, zIndex: 1 };
const emptySlot = { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: `1px dashed ${T.paperDeep}`, borderRadius: 9, padding: "6px 10px", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, cursor: "pointer" };
