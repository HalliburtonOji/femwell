// PlannerRedesignDemo — STANDALONE v4 redesign preview of the LIVE Planner
// (PlannerV2Shell), for Halli's approval before going live. Demo-first; the live
// Planner is NOT touched.
//
// STANDING RULE: NEVER strip features. This demo preserves EVERY live Planner
// feature area (read PlannerV2Shell in full) and the v4 brand work is ADDITIVE on
// top. Feature parity is tracked in the checklist comment at the bottom.
//
// Live rows preserved (NODES_BY_KEY order): insights · schedule&cycle (→ hour-by-
// hour day view + cycle calendar) · your day · lists · body · life-stage (adaptive)
// · conditions · rituals · nourishment · mind & insight · care · tonight.
// Shell preserved: header actions (Plan-a-day · Customise/settings · Voice-to-
// schedule) · Jess passive cards · morning brief · add FAB · Today/Cycle views.
// v4 additive: flora-hero + rotating tap-to-reveal OMEN header + summary; Card.jsx
// rich cards; §6.7.6 quick-action popups; soulful voice; PAPER_BG; ≥12 fonts;
// canonical tokens; sheets clear the nav (.fw-sheet-safe). Week strip reuses the
// Today session's §6.10 clipboard slider on live. Rituals link the existing
// RitualBuilder. On live, writes ride existing dispatchers — NO new function.
import { useState } from "react";
import {
  ArrowLeft, Plus, Check, X, Moon, Droplet, Feather, Heart, Sparkles, ListChecks, CalendarDays,
  CalendarClock, Pill, Footprints, Utensils, Sun, ChevronRight, Wind, Brain, Activity, Stethoscope,
  Mic, SlidersHorizontal, Baby, Star, BedDouble, ClipboardList, TrendingUp, Salad, ScanLine,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SCRIPT, SERIF, UI, PAPER_BG, Heart as BrandHeart } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { FwCard, FwCardCTA, SummaryCard } from "@/components/brand/Card";
import { RichBloomV2, FlowerGlyph, floraKeyframes, cwOf } from "@/components/brand/flora";

const PHCW = "plum"; const ph = cwOf(PHCW);            // seeded: luteal · day 25 · reproductive
const WEEK = [{ d: "M", n: 18 }, { d: "T", n: 19 }, { d: "W", n: 20 }, { d: "T", n: 21, today: true }, { d: "F", n: 22 }, { d: "S", n: 23 }, { d: "S", n: 24 }];
const BLOCKS = [
  { id: "b1", hour: 8, title: "Breakfast", dur: 30, type: "meal", cw: "gold" },
  { id: "b2", hour: 10, title: "Team sync", dur: 45, type: "event", cw: "plum" },
  { id: "b3", hour: 13, title: "Walk + lunch", dur: 60, type: "habit", cw: "sage" },
  { id: "b4", hour: 16, title: "Deep work", dur: 90, type: "task", cw: "sage" },
  { id: "b5", hour: 20, title: "Wind-down ritual", dur: 20, type: "ritual", cw: "crimson" },
];
const DAY = {
  morning: [{ id: "m1", icon: Moon, title: "A moment of rest", meta: "ritual", cw: "plum" }, { id: "m2", icon: Utensils, title: "Log breakfast", meta: "meal", cw: "gold" }, { id: "m3", icon: ListChecks, title: "Reply to Mum", meta: "task · 10 min", cw: "sage" }],
  afternoon: [{ id: "a1", icon: Footprints, title: "A gentle walk", meta: "habit · 20 min", cw: "sage" }, { id: "a2", icon: Pill, title: "Magnesium", meta: "supplement", cw: "crimson" }],
  evening: [{ id: "e1", icon: Heart, title: "Log how today felt", meta: "check-in", cw: "crimson" }, { id: "e2", icon: Feather, title: "Three quiet lines", meta: "journal ritual", cw: "blush" }],
};
const LISTS = [{ id: "l1", name: "This week", count: 5, items: ["Book smear test", "Birthday card for J", "Renew prescription"] }, { id: "l2", name: "Someday", count: 8, items: ["Plan the trip", "That pottery class"] }];
const PHASE_CAL = { 1: "p", 2: "p", 3: "p", 4: "p", 5: "f", 6: "f", 7: "f", 8: "f", 9: "f", 10: "f", 11: "o", 12: "o", 13: "o", 14: "o", 15: "l", 16: "l", 17: "l", 18: "l", 19: "l", 20: "l", 21: "l", 22: "l", 23: "l", 24: "l", 25: "l", 26: "l", 27: "l", 28: "l" };
const CAL_TONE = { p: ph.petal, f: cwOf("sage").petal, o: cwOf("gold").petal, l: cwOf("plum").petal, "": T.paperDeep };

// ── every live card, as data (so NOTHING is dropped) ──
const INSIGHTS = [
  { icon: Sparkles, eyebrow: "Today's insight", flower: "cosmos", cw: "plum", title: "Luteal · day 25 — soften the load", line: "Energy dips before your period. Plan the gentle things; move the big asks to next week." },
  { icon: TrendingUp, eyebrow: "Pattern", flower: "iris", cw: "gold", title: "Your focus peaks mid-morning", line: "Three weeks running. Anchor deep work to 10–12, protect it." },
  { icon: Moon, eyebrow: "Tonight", flower: "violet", cw: "plum", title: "An earlier night pays off", line: "On quiet evenings you slept ~40 min longer. Wind down by 10." },
];
const BODY = [
  { icon: Activity, eyebrow: "Your body today", flower: "dahlia", cw: "plum", title: "Lower energy, tender", line: "Day 25 — be a little kinder. Warmth, iron, rest.", cta: "Log how you feel", pop: "mood" },
  { icon: Brain, eyebrow: "Smart view", flower: "primrose", cw: "gold", title: "What helps this phase", line: "Magnesium, gentle movement, fewer commitments." },
  { icon: CalendarDays, eyebrow: "Cycle zone", flower: "poppy", cw: "crimson", title: "Period likely in ~3 days", line: "Open the cycle calendar to see the week ahead.", cta: "Open calendar", overlay: "cal" },
];
const RITUALS = [
  { icon: Moon, eyebrow: "Morning stack", flower: "violet", cw: "plum", title: "3 rituals · rest · water · three lines", line: "Each ticks in place and grows a bloom.", cta: "Do today's ritual", pop: "ritual" },
  { icon: Star, eyebrow: "Ritual bundle", flower: "primrose", cw: "gold", title: "Luteal wind-down", line: "A 3-step evening set, picked for your phase.", cta: "Start the bundle", pop: "ritual" },
  { icon: Check, eyebrow: "Consistency", flower: "fern", cw: "sage", title: "4-day streak — gently kept", line: "No guilt if it breaks. The garden remembers what you tended." },
];
const NOURISH = [
  { icon: TrendingUp, eyebrow: "Macros", flower: "sunflower", cw: "gold", title: "Protein a little low today", line: "A handful of nuts or yoghurt closes the gap.", cta: "Log a meal", pop: "meal" },
  { icon: Droplet, eyebrow: "Hydration", flower: "bluebell", cw: "sky", title: "4 of 8 glasses", line: "One more this afternoon? A bluebell only rings for those who sip.", cta: "Add a glass", pop: "water" },
  { icon: Salad, eyebrow: "AI meal plan", flower: "fern", cw: "sage", title: "Tonight: red lentil dal", line: "Iron-friendly, cosy — the luteal days like it.", cta: "See the plan", link: "Nutrition" },
  { icon: Utensils, eyebrow: "Phase recipes", flower: "marigold", cw: "gold", title: "Iron-rich, this week", line: "A short shelf picked for where you are.", cta: "Browse recipes", link: "Nutrition" },
];
const MIND = [
  { icon: Sparkles, eyebrow: "Today's intention", flower: "poppy", cw: "crimson", title: "“More slow mornings”", line: "Set one gentle intention — it plants a seed.", cta: "Set the intention", pop: "intention" },
  { icon: Star, eyebrow: "Astra · your sky", flower: "violet", cw: "plum", title: "The moon is waxing in Libra", line: "A good day to balance the books — say the kind thing first.", cta: "Read your reading", link: "Lifestyle" },
  { icon: Heart, eyebrow: "Mood & mind", flower: "cosmos", cw: "plum", title: "How are you, really?", line: "A quick mood + energy check — feeds your Pulse.", cta: "Log mood", pop: "mood" },
  { icon: Wind, eyebrow: "Breathwork", flower: "bluebell", cw: "sky", title: "A 4-minute box breath", line: "In for four, hold, out for four. Light the kettle after.", cta: "Begin", pop: "ritual" },
  { icon: Brain, eyebrow: "Cycle psychology", flower: "iris", cw: "gold", title: "Why luteal feels heavier", line: "It's not you — it's the hormone tide. A 2-min read." },
];
const CARE = [
  { icon: Pill, eyebrow: "Meds & supplements", flower: "anemone", cw: "crimson", title: "Magnesium + Vitamin D", line: "Tap to tick tonight's supplements.", cta: "Mark taken", pop: "ritual" },
  { icon: Heart, eyebrow: "Symptoms", flower: "dahlia", cw: "plum", title: "Anything to note?", line: "A quick log — builds your Doctor Export quietly.", cta: "Log a symptom", pop: "mood" },
  { icon: ScanLine, eyebrow: "Body scan", flower: "fern", cw: "sage", title: "A 60-second head-to-toe", line: "Notice where you're holding today.", cta: "Start scan", pop: "ritual" },
  { icon: Stethoscope, eyebrow: "GP report", flower: "primrose", cw: "gold", title: "3 months ready to share", line: "Your symptoms + cycle, GP-ready.", cta: "Open export", link: "DoctorExport" },
];
const TONIGHT = [
  { icon: Moon, eyebrow: "Tonight's reflection", flower: "violet", cw: "plum", title: "How did today land?", line: "One honest line. They say a poppy keeps what it's told.", cta: "Reflect", pop: "note" },
  { icon: CalendarClock, eyebrow: "Tomorrow", flower: "primrose", cw: "gold", title: "One thing for tomorrow", line: "Set tomorrow's first kindness tonight.", cta: "Plan tomorrow", pop: "task" },
  { icon: Feather, eyebrow: "End-of-day note", flower: "poppy", cw: "crimson", title: "Leave a line", line: "Becomes a pressed-flower entry in your journal.", cta: "Leave a line", pop: "note" },
];
const JESS = [
  { icon: Sparkles, title: "Jess noticed a pattern", line: "You've felt brighter on the days you walked. Worth keeping?" },
  { icon: Moon, title: "Phase prep from Jess", line: "Your period's likely in ~3 days — want a gentler week planned?" },
  { icon: Activity, title: "Your weekly summary", line: "Mood steadier, sleep up, two rituals kept. A good week." },
];
const STAGE_VARIANTS = "Adapts to your life stage: pregnancy → a trimester timeline + kick counter + EPDS check; perimenopause → HRT correlation; postpartum → recovery + mood screen. Seeded here as reproductive (cycle-anchored).";

export default function PlannerRedesignDemo() {
  const navigate = useNavigate();
  const [view, setView] = useState("today");
  const [done, setDone] = useState({});
  const [popup, setPopup] = useState(null);
  const [sheet, setSheet] = useState(null);  // "plan" | "settings" | "voice" | "add"
  const [dayView, setDayView] = useState(false);
  const [calView, setCalView] = useState(false);
  const [omenOpen, setOmenOpen] = useState(false);
  const complete = (id) => { setDone((d) => ({ ...d, [id]: true })); setPopup(null); };
  const link = (p) => navigate(createPageUrl(p));
  const act = (card) => card.pop ? setPopup({ id: card.title, type: card.pop, icon: card.icon, title: card.cta || card.title, cw: card.cw })
    : card.overlay === "cal" ? setCalView(true) : card.link ? link(card.link) : setSheet("add");

  const Mini = (card, i) => (
    <FwCard key={i} accent={cwOf(card.cw).petal} Icon={card.icon} eyebrow={card.eyebrow} flower={card.flower} title={card.title}
      line={card.line} idx={`c-${card.eyebrow}-${i}`}
      action={card.cta ? <FwCardCTA accent={cwOf(card.cw).petal} onClick={() => act(card)}>{card.cta}</FwCardCTA> : undefined} />
  );
  const Rows = (label, sub, cards) => (
    <Sec title={label} sub={sub}><DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{cards.map(Mini)}</div></DemoWrap></Sec>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => link("Ideas")} aria-label="Back to Ideas" style={ribbonBtn}><ArrowLeft size={13} /> Ideas</button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold }}>Demo · Planner · v4 (full parity)</span>
      </div>

      <FwFloraHero title="Planner" bloom="cosmos" colorway={PHCW} flankL="clover" flankR="chamomile" creature="butterfly"
        line="Your week, gently — every tool you had, in the brand's own voice." />

      {/* header meta: confidence + stage banner + 7-day energy (preserved) */}
      <DemoWrap><div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 2 }}>
        <span style={metaPill}>Prediction · high confidence</span>
        <span style={metaPill}>Reproductive · cycle mode</span>
        <span style={metaPill}>Week ahead · 2 high · 3 steady · 2 restful</span>
      </div></DemoWrap>

      {/* header actions: Plan a day · Customise · Voice (preserved) */}
      <DemoWrap><div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <ActBtn icon={CalendarDays} label="Plan a day" onClick={() => setSheet("plan")} />
        <ActBtn icon={SlidersHorizontal} label="Customise" onClick={() => setSheet("settings")} />
        <ActBtn icon={Mic} label="Voice" onClick={() => setSheet("voice")} />
      </div></DemoWrap>

      {/* ROTATING OMEN HEADER (additive) */}
      <DemoWrap><button onClick={() => setOmenOpen((o) => !o)} style={omenBtn}>
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
        <ChevronRight size={16} style={{ color: T.muted, transform: omenOpen ? "rotate(90deg)" : "none" }} />
      </button></DemoWrap>

      {/* WEEK STRIP (reuses the Today session's §6.10 clipboard slider on live) */}
      <DemoWrap><div style={{ display: "flex", gap: 6, justifyContent: "space-between", marginTop: 14 }}>
        {WEEK.map((w) => (
          <div key={w.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", borderRadius: 14, background: w.today ? ph.petal : T.paperHi, border: `1px solid ${w.today ? ph.petal : T.paperDeep}` }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: w.today ? "#fff" : T.muted }}>{w.d}</span>
            <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: w.today ? "#fff" : T.ink }}>{w.n}</span>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: w.today ? "#fff" : ph.petal, opacity: .8 }} />
          </div>
        ))}
      </div></DemoWrap>

      {/* VIEW TOGGLE (preserved) */}
      <DemoWrap><div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {[["today", "Today"], ["cycle", "Cycle"]].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{ flex: 1, cursor: "pointer", fontFamily: UI, fontSize: 14, fontWeight: 700, padding: "10px 0", borderRadius: 999, border: `1px solid ${view === k ? T.ink : T.paperDeep}`, background: view === k ? T.ink : "transparent", color: view === k ? T.paper : T.muted }}>{l}</button>
        ))}
      </div></DemoWrap>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Jess passive cards (preserved) */}
        <Sec title="From Jess" sub="quiet observations — never in your way">
          <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {JESS.map((j, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${ph.petal}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${ph.petal}`, borderRadius: 16, padding: "12px 14px" }}>
                <span style={{ ...rowDisc, background: T.wax || T.paper }}><j.icon size={15} color={ph.petal} /></span>
                <div><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{j.title}</div><div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, lineHeight: 1.4 }}>{j.line}</div></div>
              </div>
            ))}
          </div></DemoWrap>
        </Sec>

        {view === "today" ? (
          <>
            {/* INSIGHTS deck (preserved) */}
            <DemoWrap><div style={{ marginTop: 16 }}><SummaryCard eyebrow="Your day, gently" rows={[
              { Icon: Sun, label: "First", text: "A moment of rest before the day grabs you", onClick: () => setPopup({ id: "rest", type: "ritual", icon: Moon, title: "A moment of rest", cw: "plum" }) },
              { Icon: ListChecks, label: "Today", text: "3 small things — none of them urgent", onClick: () => setDayView(true) },
              { Icon: Moon, label: "Tonight", text: "Log how today felt + three quiet lines", onClick: () => setPopup({ id: "felt", type: "mood", icon: Heart, title: "Log how today felt", cw: "crimson" }) },
            ]} /></div></DemoWrap>
            {Rows("Insights", "what today's signals are saying", INSIGHTS)}

            {/* SCHEDULE & CYCLE — previews → overlays (preserved) */}
            <Sec title="Schedule & cycle" sub="the hour-by-hour day + the month, both kept">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <FwCard accent={ph.petal} Icon={CalendarClock} eyebrow="Schedule" flower="iris" title="Today, hour by hour"
                  line={`${BLOCKS.length} blocks — breakfast, a sync, a walk, deep work, a wind-down. Tap to open & edit the timeline.`} idx="sched"
                  action={<FwCardCTA accent={ph.petal} onClick={() => setDayView(true)} icon={CalendarClock}>Open the day view</FwCardCTA>} />
                <FwCard accent={cwOf("plum").petal} Icon={CalendarDays} eyebrow="Cycle" flower="dahlia" title="Day 25 of 28 · luteal"
                  line="Tap any day to see its phase, energy and what you logged." idx="cycprev"
                  action={<FwCardCTA accent={cwOf("plum").petal} onClick={() => setCalView(true)} icon={CalendarDays}>Open the cycle calendar</FwCardCTA>} />
              </div></DemoWrap>
            </Sec>

            {/* YOUR DAY — time buckets + quick popups (preserved) */}
            <Sec title="Your day" sub="morning · afternoon · evening — tap any to do it right here">
              {["morning", "afternoon", "evening"].map((part) => (
                <DemoWrap key={part}><div style={{ marginBottom: 10 }}>
                  <div style={partLabel}>{part}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {DAY[part].map((it) => {
                      const c = cwOf(it.cw); const Icon = it.icon; const isDone = done[it.id];
                      return (
                        <button key={it.id} onClick={() => !isDone && setPopup({ id: it.id, type: it.title.includes("Log") ? "meal" : "ritual", icon: Icon, title: it.title, cw: it.cw })} style={{ ...rowCard, borderLeft: `3px solid ${c.petal}`, opacity: isDone ? .6 : 1 }}>
                          <span style={{ ...rowDisc, background: T.wax || T.paper }}><Icon size={15} color={c.petal} /></span>
                          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{it.title}</div>
                            <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: ".04em", textTransform: "uppercase" }}>{it.meta}</div>
                          </div>
                          {isDone ? <Check size={18} color={c.petal} /> : <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: c.petal }}>Do it</span>}
                        </button>
                      );
                    })}
                  </div>
                </div></DemoWrap>
              ))}
            </Sec>

            {/* LISTS (preserved) */}
            <Sec title="Lists" sub="the things not tied to a time">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LISTS.map((l) => <FwCard key={l.id} accent={T.gold} Icon={ListChecks} eyebrow={`${l.count} items`} flower="sunflower" title={l.name} line={l.items.join(" · ")} idx={`list-${l.id}`} action={<FwCardCTA accent={T.gold} onClick={() => setSheet("add")}>Add to list</FwCardCTA>} />)}
              </div></DemoWrap>
            </Sec>

            {Rows("Your body today", "where you are, and what helps", BODY)}

            {/* LIFE STAGE (adaptive — preserved) */}
            <Sec title="Your life stage" sub="the planner reshapes to your stage">
              <DemoWrap>
                <FwCard accent={T.sage} Icon={Baby} eyebrow="Reproductive · cycling" flower="fern" title="Cycle-anchored planning"
                  line={STAGE_VARIANTS} idx="stage" />
              </DemoWrap>
            </Sec>

            {/* CONDITIONS (preserved) */}
            <Sec title="Conditions" sub="if you track one, its care surfaces here">
              <DemoWrap>
                <FwCard accent={T.crimson} Icon={Heart} eyebrow="Condition care" flower="poppy" title="PMDD · PCOS · endo · fibroids · HRT"
                  line="Add a condition and its phase-aware care rows appear here (paused gently during pregnancy)." idx="cond"
                  action={<FwCardCTA accent={T.crimson} onClick={() => setSheet("add")}>Add a condition</FwCardCTA>} />
              </DemoWrap>
            </Sec>

            {/* RITUALS (preserved) + builder link */}
            <Sec title="Rituals" sub="the daily tending — composed here, surfaced everywhere">
              <DemoWrap><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {RITUALS.map(Mini)}
                <FwCard accent={T.sage} Icon={Plus} eyebrow="Builder" flower="fern" title="Compose a ritual set"
                  line="The Ritual Builder lives here — pick the small tendings that hold your week. (Reuses the existing builder; surfaces on Today via the other session.)" idx="ritbuild"
                  action={<FwCardCTA accent={T.sage} onClick={() => link("RitualBuilderDemo")}>Open the builder</FwCardCTA>} />
              </div></DemoWrap>
            </Sec>

            {Rows("Nourishment", "kind, phase-aware fuel", NOURISH)}
            {Rows("Mind & insight", "intention, your sky, mood, breath", MIND)}
            {Rows("Care", "meds, symptoms, the GP thread", CARE)}
            {Rows("Tonight", "close the day softly", TONIGHT)}
          </>
        ) : (
          /* CYCLE VIEW (preserved) */
          <>
            <DemoWrap><div style={{ marginTop: 16 }}><SummaryCard eyebrow="Your body today" rows={[
              { Icon: Moon, label: "Phase", text: "Luteal · day 25 — inner autumn, softening", onClick: () => setCalView(true) },
              { Icon: Heart, label: "Likely", text: "Period in ~3 days — be a little kinder", onClick: () => setCalView(true) },
              { Icon: Sparkles, label: "Energy", text: "Lower today — plan the gentle things", onClick: () => {} },
            ]} /></div></DemoWrap>
            <Sec title="Your cycle" sub="the month at a glance — every day tappable">
              <DemoWrap><FwCard accent={ph.petal} Icon={CalendarDays} eyebrow="This cycle" flower="dahlia" title="Day 25 of 28"
                line="Luteal week. The full calendar is kept — just re-skinned." idx="cyc"
                action={<FwCardCTA accent={ph.petal} onClick={() => setCalView(true)} icon={CalendarDays}>Open the cycle calendar</FwCardCTA>} /></DemoWrap>
            </Sec>
            {Rows("Your body today", "where you are, and what helps", BODY)}
            {Rows("Mind & insight", "intention, your sky, mood, breath", MIND)}
            <Sec title="What's growing" sub="your week, read back gently">
              <DemoWrap><div style={{ display: "grid", placeItems: "center", padding: "8px 0" }}>
                <RichBloomV2 form="dahlia" color={ph.petal} color2={ph.tip} accent={ph.accent} size={150} idx="cyc-bloom" />
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", maxWidth: 320, marginTop: 6 }}>Dahlia for the luteal: strength and grace under change. Three rituals kept this week — the garden noticed.</p>
              </div></DemoWrap>
            </Sec>
          </>
        )}
      </div>

      {/* ADD FAB (preserved) */}
      <button onClick={() => setSheet("add")} aria-label="Add" style={fab}><Plus size={26} color="#fff" /></button>

      {popup && <QuickPopup item={popup} onClose={() => setPopup(null)} onDone={complete} />}
      {dayView && <DayViewOverlay onClose={() => setDayView(false)} />}
      {calView && <CycleCalendarOverlay onClose={() => setCalView(false)} />}
      {sheet === "plan" && <PlanADaySheet onClose={() => setSheet(null)} />}
      {sheet === "settings" && <SettingsSheet onClose={() => setSheet(null)} />}
      {sheet === "voice" && <VoiceSheet onClose={() => setSheet(null)} />}
      {sheet === "add" && <AddPopup onClose={() => setSheet(null)} />}
    </div>
  );
}

// ── small components ──
function DemoWrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }
function ActBtn({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "10px 6px", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.ink }}><Icon size={15} color={T.gold} /> {label}</button>;
}
function Sec({ title, sub, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 18px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <FlowerGlyph variant="primrose" size={18} color={T.gold} idx={`s-${title}`} />
        <div><div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink, lineHeight: 1.05 }}>{title}</div>{sub && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted }}>{sub}</div>}</div>
      </div>
      {children}
    </div>
  );
}
function QuickPopup({ item, onClose, onDone }) {
  const [note, setNote] = useState(""); const c = cwOf(item.cw || "sage"); const Icon = item.icon || Check;
  const body = { meal: "Recent + a quick search — what did you have?", water: "Half a glass counts. Tap to add it.", mood: "How's your energy, really? Pick one.", intention: "A few smart suggestions, or your own words.", ritual: "A small tending — confirm when it's done.", task: "Tick it when it's done — no fake checkmarks.", note: "Three true sentences. Not a diary." }[item.type] || "Do it here, then it ticks.";
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}><style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ ...rowDisc, width: 34, height: 34, background: T.wax || T.paper }}><Icon size={16} color={c.petal} /></span>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, flex: 1 }}>{item.title}</div>
          <button onClick={onClose} aria-label="Close" style={iconX}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, lineHeight: 1.5, margin: "4px 0 12px" }}>{body}</p>
        <div style={{ display: "grid", placeItems: "center", margin: "0 0 12px" }}><RichBloomV2 form="cosmos" color={c.petal} color2={c.tip} accent={c.accent} size={100} idx={`qp-${item.id}`} /></div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A word, if you like (optional)…" rows={2} style={ta} />
        <button onClick={() => onDone(item.id)} style={{ ...cta, background: c.petal }}><Check size={16} /> Done — and a bloom opens</button>
        <div style={footNote}><FlowerGlyph variant="fern" size={15} color={T.sage} idx="qp-foot" /><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>a vote for who you're becoming</span></div>
      </div>
    </div>
  );
}
function DayViewOverlay({ onClose }) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  return (
    <div role="dialog" aria-modal="true" style={overlay}>
      <div style={overlayHead}>
        <button onClick={onClose} style={ribbonBtn}><ArrowLeft size={14} /> Back</button>
        <div style={{ flex: 1 }}><div style={overEyebrow}>Schedule · Thu 21 Jun</div><div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink }}>Today, hour by hour</div></div>
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
                {blocks.length === 0 ? <button style={emptySlot}><Plus size={12} /> Add</button>
                  : blocks.map((b) => { const c = cwOf(b.cw); return (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 9, background: `${c.petal}14`, borderLeft: `3px solid ${c.petal}`, borderRadius: 10, padding: "9px 11px", minHeight: 28 + Math.min(60, b.dur) * 0.4 }}>
                      <div style={{ flex: 1 }}><div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{b.title}</div><div style={{ fontFamily: UI, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{b.dur} min · {b.type}</div></div>
                    </div>); })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function CycleCalendarOverlay({ onClose }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return (
    <div role="dialog" aria-modal="true" style={overlay}>
      <div style={overlayHead}>
        <button onClick={onClose} style={ribbonBtn}><ArrowLeft size={14} /> Back</button>
        <div style={{ flex: 1 }}><div style={overEyebrow}>Cycle · June</div><div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink }}>Your month</div></div>
        <BrandHeart size={16} />
      </div>
      <div className="fw-sheet-safe" style={{ padding: "4px 16px 30px", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>{d}</div>)}
          {days.map((cd, i) => {
            const valid = cd >= 1 && cd <= 28; const tone = CAL_TONE[PHASE_CAL[cd] || ""]; const isToday = cd === 25;
            return (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 10, display: "grid", placeItems: "center", border: isToday ? `2px solid ${ph.petal}` : `1px solid ${T.paperDeep}`, background: valid ? `${tone}22` : "transparent" }}>
                {valid && <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: isToday ? 700 : 500, color: T.ink }}>{cd}</span><span style={{ width: 5, height: 5, borderRadius: 99, background: tone }} /></div>}
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
function PlanADaySheet({ onClose }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Plan a day</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 12 }}>lay out a day before it arrives — drop the anchors, let the rest flow</div>
        {["Pick a date", "Drop your anchors (work · rest · a walk)", "Add meals & rituals", "Let Jess fill the gaps gently"].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${T.paperDeep}` : "none" }}>
            <span style={{ width: 24, height: 24, borderRadius: 99, background: `${T.gold}22`, color: T.gold, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{s}</span>
          </div>
        ))}
        <button onClick={onClose} style={{ ...cta, background: T.gold, marginTop: 14 }}><CalendarDays size={16} /> Start planning</button>
      </div>
    </div>
  );
}
function SettingsSheet({ onClose }) {
  const [rows, setRows] = useState([
    { k: "insights", l: "Insights", on: true }, { k: "schedule", l: "Schedule & cycle", on: true }, { k: "yourday", l: "Your day", on: true },
    { k: "lists", l: "Lists", on: true }, { k: "body", l: "Your body today", on: true }, { k: "stage", l: "Life stage", on: true },
    { k: "conditions", l: "Conditions", on: false }, { k: "rituals", l: "Rituals", on: true }, { k: "nourishment", l: "Nourishment", on: true },
    { k: "mind", l: "Mind & insight", on: true }, { k: "care", l: "Care", on: true }, { k: "tonight", l: "Tonight", on: true },
  ]);
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Customise your planner</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 12 }}>show, hide and reorder the rows — your planner, your shape</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((r, i) => (
            <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 12, background: T.paper, border: `1px solid ${T.paperDeep}` }}>
              <ClipboardList size={15} color={T.muted} />
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.ink }}>{r.l}</span>
              <button onClick={() => setRows((rs) => rs.map((x, j) => j === i ? { ...x, on: !x.on } : x))} aria-label="Toggle" style={{ width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer", background: r.on ? T.sage : T.paperDeep, position: "relative" }}>
                <span style={{ position: "absolute", top: 3, left: r.on ? 21 : 3, width: 20, height: 20, borderRadius: 99, background: "#fff", transition: "left .15s" }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function VoiceSheet({ onClose }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Say it, I'll plan it</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>“walk at 1, call Mum after lunch, magnesium tonight” → blocks on your day</div>
        <div style={{ display: "grid", placeItems: "center", padding: "10px 0 16px" }}>
          <button style={{ width: 74, height: 74, borderRadius: 999, background: ph.petal, border: "none", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: `0 6px 22px ${ph.petal}55` }}><Mic size={30} color="#fff" /></button>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 10 }}>tap and speak — Jess turns it into a plan</span>
        </div>
      </div>
    </div>
  );
}
function AddPopup({ onClose }) {
  const opts = [
    { id: "task", label: "Task", Icon: ListChecks, cw: "sage" }, { id: "event", label: "Event", Icon: CalendarClock, cw: "plum" },
    { id: "meal", label: "Meal", Icon: Utensils, cw: "gold" }, { id: "ritual", label: "Ritual", Icon: Moon, cw: "crimson" },
    { id: "note", label: "A line", Icon: Feather, cw: "blush" }, { id: "intention", label: "Intention", Icon: Sparkles, cw: "gold" },
    { id: "med", label: "Med", Icon: Pill, cw: "crimson" }, { id: "sleep", label: "Sleep", Icon: BedDouble, cw: "plum" }, { id: "condition", label: "Condition", Icon: Heart, cw: "sage" },
  ];
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Add to your day</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 14 }}>what shall we tend to?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {opts.map((o) => { const c = cwOf(o.cw); return (
            <button key={o.id} onClick={onClose} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 6px", borderRadius: 14, border: `1px solid ${T.paperDeep}`, background: T.paper, cursor: "pointer" }}><o.Icon size={22} color={c.petal} /><span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{o.label}</span></button>
          ); })}
        </div>
      </div>
    </div>
  );
}

// ── styles ──
const ribbonBtn = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted };
const omenBtn = { width: "100%", textAlign: "left", cursor: "pointer", marginTop: 6, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${ph.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${ph.petal}`, borderRadius: 18, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 };
const omenLine = { fontFamily: SERIF, fontSize: 14, color: T.muted, margin: "4px 0 0", lineHeight: 1.45 };
const metaPill = { fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "3px 10px" };
const partLabel = { fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold, margin: "0 0 6px 2px" };
const rowCard = { display: "flex", alignItems: "center", gap: 11, width: "100%", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "11px 13px", cursor: "pointer", boxShadow: "0 2px 10px rgba(11,8,5,.05)" };
const rowDisc = { width: 32, height: 32, borderRadius: 9, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 };
const fab = { position: "fixed", right: 18, bottom: "calc(var(--fw-nav-h, 76px) + 14px)", width: 56, height: 56, borderRadius: 999, background: T.crimson, border: "none", boxShadow: "0 6px 22px rgba(188,46,39,.4)", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 50 };
const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheetStyle = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `1px solid ${T.paperDeep}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "82dvh", overflowY: "auto" };
const grab = { width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" };
const iconX = { background: "transparent", border: "none", cursor: "pointer", color: T.muted };
const ta = { width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", resize: "none", marginBottom: 12 };
const cta = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" };
const footNote = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10 };
const overlay = { ...PAPER_BG, position: "fixed", inset: 0, zIndex: 9998, display: "flex", flexDirection: "column", overflowY: "auto" };
const overlayHead = { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}`, position: "sticky", top: 0, zIndex: 1 };
const overEyebrow = { fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold };
const emptySlot = { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: `1px dashed ${T.paperDeep}`, borderRadius: 9, padding: "6px 10px", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, cursor: "pointer" };

/* ── FEATURE-PARITY CHECKLIST (live PlannerV2Shell → this demo) ──
 ✅ Header greeting + meta (confidence pill · stage banner · 7-day energy)
 ✅ Header actions: Plan a day · Customise/settings (reorder+hide) · Voice-to-schedule
 ✅ Today / Cycle views
 ✅ Week strip (reuses §6.10 clipboard slider on live)
 ✅ Insights hero deck
 ✅ Schedule preview → hour-by-hour DAY VIEW overlay
 ✅ Cycle preview → CYCLE CALENDAR overlay
 ✅ Your Day buckets (morning/afternoon/evening · tasks/meals/habits/meds) + quick popups
 ✅ Lists
 ✅ Body: BodyToday · SmartView · CycleZone
 ✅ Life-stage (adaptive: pregnancy timeline/kick/EPDS · peri HRT · postpartum)
 ✅ Conditions (PMDD/PCOS/endo/fibroids/HRT)
 ✅ Rituals: morning stack · bundle · consistency · Create→Builder
 ✅ Nourishment: macros · hydration · AI meal plan · phase recipes
 ✅ Mind: intention · astra/horoscope · mood · breathwork · cycle psychology
 ✅ Care: meds&supps · symptom log · body scan · GP report
 ✅ Tonight: reflection · tomorrow preview · end-of-day note
 ✅ Jess passive cards (pattern nudge · phase prep · weekly summary)
 ✅ Plan-a-day / Morning brief · Add FAB (+popup) · quick-action popups
 ── v4 additive: flora hero · omen header · summary · Card.jsx · voice · PAPER_BG · ≥12 fonts ── */
