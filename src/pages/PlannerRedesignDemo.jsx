// PlannerRedesignDemo — STANDALONE v4 redesign preview of the LIVE Planner
// (PlannerV2Shell). Demo-first; the live Planner is NOT touched.
//
// CLIPBOARD-FORWARD (matches the Journal demo's commitment): the spine is §6.10
// ClipboardSliders whose boards each hold a GRID of uniform mini-cards (tiles) you
// slide between — exactly like JournalClipboardDemo's SurfaceTile grids. Most of
// Planner's content now lives as cards-in-clipboards, not vertical rows.
//
// FULL FEATURE PARITY (read PlannerV2Shell in full; nothing stripped — additive):
//  Your Day · hour-by-hour day view · cycle calendar · insights · lists · body
//  (BodyToday/SmartView/CycleZone) · life-stage (adaptive) · conditions · care
//  (meds/contraception/symptom/body-scan/GP export) · rituals (stack/bundle/
//  consistency/builder) · nourishment (macros/hydration/AI meal plan/phase recipes)
//  · mind (intention/astra/mood/breathwork/cycle-psych) · tonight (reflection/
//  tomorrow/end-of-day) · Jess cards · plan-a-day/morning brief · customise/settings
//  · voice-to-schedule · add FAB.
// v4 bible: flora-hero + one summary intent + rotating omen header + §6.7.6 quick
// popups + soulful voice + PAPER_BG + ≥12 fonts + canonical tokens + .fw-sheet-safe.
// Uniform tile + board sizes; ~2 phone screens. No new function (rides existing
// dispatchers); rituals link the existing RitualBuilder.
import { useState } from "react";
import {
  ArrowLeft, Plus, Check, X, Moon, Droplet, Feather, Heart, Sparkles, ListChecks, CalendarDays,
  CalendarClock, Pill, Footprints, Utensils, ChevronRight, Wind, Brain, Activity, Stethoscope,
  Mic, SlidersHorizontal, Baby, Star, BedDouble, ClipboardList, TrendingUp, Salad, ScanLine, ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SCRIPT, SERIF, UI, PAPER_BG, Heart as BrandHeart, Hand } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { RichBloomV2, FlowerGlyph, floraKeyframes, cwOf } from "@/components/brand/flora";

const PHCW = "plum"; const ph = cwOf(PHCW);   // seeded: luteal · day 25 · reproductive
const WEEK = [{ d: "M", n: 18 }, { d: "T", n: 19 }, { d: "W", n: 20 }, { d: "T", n: 21, today: true }, { d: "F", n: 22 }, { d: "S", n: 23 }, { d: "S", n: 24 }];
const BLOCKS = [
  { id: "b1", hour: 8, title: "Breakfast", dur: 30, type: "meal", cw: "gold" }, { id: "b2", hour: 10, title: "Team sync", dur: 45, type: "event", cw: "plum" },
  { id: "b3", hour: 13, title: "Walk + lunch", dur: 60, type: "habit", cw: "sage" }, { id: "b4", hour: 16, title: "Deep work", dur: 90, type: "task", cw: "sage" },
  { id: "b5", hour: 20, title: "Wind-down ritual", dur: 20, type: "ritual", cw: "crimson" },
];
const PHASE_CAL = { 1: "p", 2: "p", 3: "p", 4: "p", 5: "f", 6: "f", 7: "f", 8: "f", 9: "f", 10: "f", 11: "o", 12: "o", 13: "o", 14: "o", 15: "l", 16: "l", 17: "l", 18: "l", 19: "l", 20: "l", 21: "l", 22: "l", 23: "l", 24: "l", 25: "l", 26: "l", 27: "l", 28: "l" };
const CAL_TONE = { p: ph.petal, f: cwOf("sage").petal, o: cwOf("gold").petal, l: cwOf("plum").petal, "": T.paperDeep };

// ── a uniform clipboard mini-card (Journal's SurfaceTile pattern) ──
function Tile({ icon: Icon, label, sub, cw = "sage", onTap, done }) {
  const c = cwOf(cw);
  return (
    <button onClick={onTap} aria-label={label} style={{
      textAlign: "left", cursor: "pointer", minHeight: 104, display: "flex", flexDirection: "column",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 14, padding: "12px 11px",
      boxShadow: "0 3px 12px rgba(11,8,5,0.06)", opacity: done ? 0.6 : 1,
    }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax || T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", marginBottom: 7 }}>
        {done ? <Check size={15} color={c.petal} /> : <Icon size={15} strokeWidth={1.7} color={c.petal} />}
      </span>
      <span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{label}</span>
      <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{sub}</span>
    </button>
  );
}
const Grid = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>{children}</div>;

export default function PlannerRedesignDemo() {
  const navigate = useNavigate();
  const [view, setView] = useState("today");
  const [done, setDone] = useState({});
  const [popup, setPopup] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [dayView, setDayView] = useState(false);
  const [calView, setCalView] = useState(false);
  const [omenOpen, setOmenOpen] = useState(false);
  const link = (p) => navigate(createPageUrl(p));
  const pop = (id, type, icon, title, cw) => setPopup({ id, type, icon, title, cw });
  const done2 = (id) => done[id];
  const complete = (id) => { setDone((d) => ({ ...d, [id]: true })); setPopup(null); };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 110, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => link("Ideas")} aria-label="Back to Ideas" style={ribbonBtn}><ArrowLeft size={13} /> Ideas</button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold }}>Demo · Planner · v4 · clipboard-forward</span>
      </div>

      {/* COMPACT signature top */}
      <FwFloraHero title="Planner" bloom="cosmos" colorway={PHCW} flankL="clover" flankR="chamomile" creature="butterfly"
        line="Your week, gently — your whole planner on a few boards. Slide sideways; each card does its thing." ringSize={184} bloomSize={116} />

      <Wrap>
        {/* ONE summary intent card */}
        <div style={{ marginTop: 6 }}>
          <SummaryCard eyebrow="Your day, gently" accent={ph.petal} rows={[
            { Icon: Moon, label: "First", text: "A moment of rest before the day grabs you", onClick: () => pop("m1", "ritual", Moon, "A moment of rest", "plum") },
            { Icon: ListChecks, label: "Today", text: "3 small things — none of them urgent", onClick: () => setDayView(true) },
            { Icon: Heart, label: "Tonight", text: "Log how today felt + three quiet lines", onClick: () => pop("e1", "mood", Heart, "Log how today felt", "crimson") },
          ]} />
        </div>

        {/* rotating omen header (tap-to-reveal) */}
        <button onClick={() => setOmenOpen((o) => !o)} style={omenBtn}>
          <FlowerGlyph variant="cosmos" size={32} color={ph.petal} color2={ph.tip} idx="omen" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: ph.petal }}>Today's almanac</div>
            <div style={{ fontFamily: SCRIPT, fontSize: 18, color: T.ink, lineHeight: 1.1 }}>The cosmos keeps its own time</div>
            {omenOpen && <div style={{ marginTop: 5 }}>
              <p style={omenLine}><b>Floriography ·</b> cosmos = order out of chaos; a calm, balanced day.</p>
              <p style={omenLine}><b>They say ·</b> a flower that blooms late still blooms on time. No rush — light the kettle.</p>
              <p style={omenLine}><b>Why now ·</b> you're in your luteal week — slower is the plan, not the failure.</p>
            </div>}
          </div>
          <ChevronRight size={15} style={{ color: T.muted, transform: omenOpen ? "rotate(90deg)" : "none" }} />
        </button>

        {/* week strip */}
        <div style={{ display: "flex", gap: 5, justifyContent: "space-between", marginTop: 12 }}>
          {WEEK.map((w) => (
            <div key={w.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 0", borderRadius: 12, background: w.today ? ph.petal : T.paperHi, border: `1px solid ${w.today ? ph.petal : T.paperDeep}` }}>
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: w.today ? "#fff" : T.muted }}>{w.d}</span>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: w.today ? "#fff" : T.ink }}>{w.n}</span>
            </div>
          ))}
        </div>

        {/* view toggle */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[["today", "Today"], ["cycle", "Cycle"]].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} style={{ flex: 1, cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px 0", borderRadius: 999, border: `1px solid ${view === k ? T.ink : T.paperDeep}`, background: view === k ? T.ink : "transparent", color: view === k ? T.paper : T.muted }}>{l}</button>
          ))}
        </div>

        <Hand size={14} color={T.muted} style={{ display: "block", margin: "12px 0 0", textAlign: "center" }}>
          Your whole planner on a few boards — slide each sideways; every card opens or does the real thing.
        </Hand>
      </Wrap>

      {/* ── THE CLIPBOARD SPINE — tile-grids in boards (Journal-style) ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "8px 16px 0", maxWidth: 600, margin: "0 auto" }}>
        {view === "today" ? (
          <>
            <ClipboardSlider hint="Slide your day" accent={ph.petal}>
              <Clipboard title="Your day" sub="MORNING · AFTERNOON · EVENING — tap to do it here" accent={ph.petal} flower="violet" idx="cb-day">
                <Grid>
                  <Tile icon={Moon} label="A moment of rest" sub="morning · ritual" cw="plum" done={done2("m1")} onTap={() => pop("m1", "ritual", Moon, "A moment of rest", "plum")} />
                  <Tile icon={Utensils} label="Log breakfast" sub="morning · meal" cw="gold" done={done2("m2")} onTap={() => pop("m2", "meal", Utensils, "Log breakfast", "gold")} />
                  <Tile icon={Footprints} label="A gentle walk" sub="afternoon · habit" cw="sage" done={done2("a1")} onTap={() => pop("a1", "ritual", Footprints, "A gentle walk", "sage")} />
                  <Tile icon={ListChecks} label="Reply to Mum" sub="task · 10 min" cw="sage" done={done2("m3")} onTap={() => pop("m3", "task", ListChecks, "Reply to Mum", "sage")} />
                  <Tile icon={Heart} label="Log how today felt" sub="evening · check-in" cw="crimson" done={done2("e1")} onTap={() => pop("e1", "mood", Heart, "Log how today felt", "crimson")} />
                  <Tile icon={Feather} label="Three quiet lines" sub="evening · journal" cw="blush" done={done2("e2")} onTap={() => pop("e2", "note", Feather, "Three quiet lines", "blush")} />
                </Grid>
              </Clipboard>
              <Clipboard title="Schedule & plan" sub="THE HOUR-BY-HOUR DAY + THE MONTH" accent={cwOf("gold").petal} flower="iris" idx="cb-sched">
                <Grid>
                  <Tile icon={CalendarClock} label="Hour by hour" sub="the day view" cw="gold" onTap={() => setDayView(true)} />
                  <Tile icon={CalendarDays} label="Cycle calendar" sub="the month" cw="plum" onTap={() => setCalView(true)} />
                  <Tile icon={Sparkles} label="Insights" sub="today's signals" cw="plum" onTap={() => pop("ins", "task", Sparkles, "Today's insights", "plum")} />
                  <Tile icon={CalendarDays} label="Plan a day" sub="morning brief" cw="gold" onTap={() => setSheet("plan")} />
                  <Tile icon={Mic} label="Voice" sub="say it, I'll plan it" cw="plum" onTap={() => setSheet("voice")} />
                  <Tile icon={SlidersHorizontal} label="Customise" sub="reorder · hide" cw="sage" onTap={() => setSheet("settings")} />
                </Grid>
              </Clipboard>
              <Clipboard title="Lists" sub="THINGS NOT TIED TO A TIME" accent={cwOf("gold").petal} flower="sunflower" idx="cb-lists">
                <Grid>
                  <Tile icon={ListChecks} label="Book smear test" sub="this week" cw="gold" done={done2("li1")} onTap={() => pop("li1", "task", ListChecks, "Book smear test", "gold")} />
                  <Tile icon={ListChecks} label="Birthday card for J" sub="this week" cw="gold" done={done2("li2")} onTap={() => pop("li2", "task", ListChecks, "Birthday card for J", "gold")} />
                  <Tile icon={Pill} label="Renew prescription" sub="this week" cw="crimson" done={done2("li3")} onTap={() => pop("li3", "task", Pill, "Renew prescription", "crimson")} />
                  <Tile icon={Star} label="Plan the trip" sub="someday" cw="sage" />
                  <Tile icon={Star} label="Pottery class" sub="someday" cw="sage" />
                  <Tile icon={Plus} label="Add to a list" sub="new item" cw="gold" onTap={() => setSheet("add")} />
                </Grid>
              </Clipboard>
              <Clipboard title="Your body" sub="WHERE YOU ARE, AND WHAT HELPS" accent={ph.petal} flower="dahlia" idx="cb-body">
                <Grid>
                  <Tile icon={Activity} label="Body today" sub="lower energy, tender" cw="plum" done={done2("bmood")} onTap={() => pop("bmood", "mood", Activity, "Log how you feel", "plum")} />
                  <Tile icon={Brain} label="Smart view" sub="what helps this phase" cw="gold" onTap={() => pop("smart", "task", Brain, "Smart view", "gold")} />
                  <Tile icon={CalendarDays} label="Cycle zone" sub="period in ~3 days" cw="crimson" onTap={() => setCalView(true)} />
                  <Tile icon={Baby} label="Life stage" sub="reproductive · adapts" cw="sage" onTap={() => pop("stage", "task", Baby, "Life-stage planning", "sage")} />
                </Grid>
              </Clipboard>
              <Clipboard title="Care" sub="MEDS · SYMPTOMS · SCREENING · EXPORT" accent={T.crimson} flower="anemone" idx="cb-care">
                <Grid>
                  <Tile icon={Pill} label="Meds & supps" sub="magnesium + Vit D" cw="crimson" done={done2("meds")} onTap={() => pop("meds", "ritual", Pill, "Tick tonight's meds", "crimson")} />
                  <Tile icon={ShieldCheck} label="Contraception" sub="mini-pill · daily" cw="plum" done={done2("contra")} onTap={() => pop("contra", "ritual", ShieldCheck, "Contraception taken", "plum")} />
                  <Tile icon={Heart} label="Symptom log" sub="builds GP export" cw="plum" done={done2("sx")} onTap={() => pop("sx", "mood", Heart, "Log a symptom", "plum")} />
                  <Tile icon={ScanLine} label="Body scan" sub="60 seconds" cw="sage" done={done2("scan")} onTap={() => pop("scan", "ritual", ScanLine, "Body scan", "sage")} />
                  <Tile icon={Stethoscope} label="GP export" sub="3 months ready" cw="gold" onTap={() => link("DoctorExport")} />
                  <Tile icon={Heart} label="Conditions" sub="PMDD · PCOS · HRT" cw="crimson" onTap={() => setSheet("add")} />
                </Grid>
              </Clipboard>
            </ClipboardSlider>

            <div style={{ height: 18 }} />

            <ClipboardSlider hint="Slide your tending" accent={T.sage}>
              <Clipboard title="Rituals" sub="THE DAILY TENDING — SURFACED EVERYWHERE" accent={ph.petal} flower="violet" idx="cb-rit">
                <Grid>
                  <Tile icon={Moon} label="Morning stack" sub="rest · water · lines" cw="plum" done={done2("rstack")} onTap={() => pop("rstack", "ritual", Moon, "Morning ritual", "plum")} />
                  <Tile icon={Star} label="Wind-down bundle" sub="luteal · 3-step" cw="gold" done={done2("rbundle")} onTap={() => pop("rbundle", "ritual", Star, "Wind-down bundle", "gold")} />
                  <Tile icon={Check} label="Consistency" sub="4-day streak" cw="sage" onTap={() => pop("cons", "task", Check, "Your streak", "sage")} />
                  <Tile icon={Plus} label="Ritual builder" sub="compose a set" cw="sage" onTap={() => link("RitualBuilderDemo")} />
                </Grid>
              </Clipboard>
              <Clipboard title="Nourishment" sub="KIND, PHASE-AWARE FUEL" accent={cwOf("gold").petal} flower="marigold" idx="cb-nour">
                <Grid>
                  <Tile icon={TrendingUp} label="Macros" sub="protein a little low" cw="gold" done={done2("macro")} onTap={() => pop("macro", "meal", TrendingUp, "Log a meal", "gold")} />
                  <Tile icon={Droplet} label="Hydration" sub="4 of 8 glasses" cw="sky" done={done2("hyd")} onTap={() => pop("hyd", "water", Droplet, "A glass of water", "sky")} />
                  <Tile icon={Salad} label="AI meal plan" sub="red lentil dal" cw="sage" onTap={() => link("Nutrition")} />
                  <Tile icon={Utensils} label="Phase recipes" sub="iron-rich week" cw="gold" onTap={() => link("Nutrition")} />
                </Grid>
              </Clipboard>
              <Clipboard title="Mind & insight" sub="INTENTION · YOUR SKY · MOOD · BREATH" accent={cwOf("plum").petal} flower="iris" idx="cb-mind">
                <Grid>
                  <Tile icon={Sparkles} label="Intention" sub="“more slow mornings”" cw="crimson" done={done2("intent")} onTap={() => pop("intent", "intention", Sparkles, "Set today's intention", "crimson")} />
                  <Tile icon={Star} label="Astra · your sky" sub="moon in Libra" cw="plum" onTap={() => link("Lifestyle")} />
                  <Tile icon={Heart} label="Mood & mind" sub="how are you, really?" cw="plum" done={done2("mmood")} onTap={() => pop("mmood", "mood", Heart, "Log mood", "plum")} />
                  <Tile icon={Wind} label="Breathwork" sub="4-min box breath" cw="sky" done={done2("breath")} onTap={() => pop("breath", "ritual", Wind, "Box breath", "sky")} />
                  <Tile icon={Brain} label="Cycle psychology" sub="why luteal's heavier" cw="gold" onTap={() => pop("cpsy", "task", Brain, "Cycle psychology", "gold")} />
                </Grid>
              </Clipboard>
              <Clipboard title="Tonight & Jess" sub="CLOSE THE DAY · QUIET NOTES FROM JESS" accent={ph.petal} flower="primrose" idx="cb-tonight">
                <Grid>
                  <Tile icon={Moon} label="Reflection" sub="how did today land?" cw="plum" done={done2("refl")} onTap={() => pop("refl", "note", Moon, "Reflect on today", "plum")} />
                  <Tile icon={CalendarClock} label="Tomorrow" sub="one first kindness" cw="gold" done={done2("tom")} onTap={() => pop("tom", "task", CalendarClock, "Plan tomorrow", "gold")} />
                  <Tile icon={Feather} label="End-of-day note" sub="→ your journal" cw="crimson" done={done2("eod")} onTap={() => pop("eod", "note", Feather, "Leave a line", "crimson")} />
                  <Tile icon={Sparkles} label="Jess noticed…" sub="brighter when you walk" cw="plum" onTap={() => pop("j1", "task", Sparkles, "From Jess", "plum")} />
                  <Tile icon={Activity} label="Weekly summary" sub="from Jess · a good week" cw="gold" onTap={() => pop("j2", "task", Activity, "Your week, from Jess", "gold")} />
                  <Tile icon={Plus} label="Add anything" sub="task · event · ritual" cw="sage" onTap={() => setSheet("add")} />
                </Grid>
              </Clipboard>
            </ClipboardSlider>
          </>
        ) : (
          <ClipboardSlider hint="Slide your cycle" accent={ph.petal}>
            <Clipboard title="Your cycle" sub="THE MONTH AT A GLANCE" accent={ph.petal} flower="dahlia" idx="cb-cyc">
              <Grid>
                <Tile icon={CalendarDays} label="Cycle calendar" sub="day 25 of 28" cw="plum" onTap={() => setCalView(true)} />
                <Tile icon={Heart} label="Period soon" sub="in ~3 days" cw="crimson" onTap={() => setCalView(true)} />
                <Tile icon={Sparkles} label="Energy" sub="lower today" cw="gold" />
                <Tile icon={Activity} label="Body today" sub="tender · be kind" cw="plum" done={done2("cb-mood")} onTap={() => pop("cb-mood", "mood", Activity, "Log how you feel", "plum")} />
              </Grid>
            </Clipboard>
            <Clipboard title="Your body" sub="WHERE YOU ARE, AND WHAT HELPS" accent={cwOf("plum").petal} flower="violet" idx="cb-cbody">
              <Grid>
                <Tile icon={Brain} label="Smart view" sub="what helps now" cw="gold" />
                <Tile icon={Wind} label="Breathwork" sub="box breath" cw="sky" onTap={() => pop("cb-breath", "ritual", Wind, "Box breath", "sky")} />
                <Tile icon={Brain} label="Cycle psychology" sub="the hormone tide" cw="plum" />
                <Tile icon={Moon} label="Rituals" sub="luteal wind-down" cw="crimson" onTap={() => pop("cb-rit", "ritual", Moon, "Wind-down", "crimson")} />
              </Grid>
            </Clipboard>
            <Clipboard title="What's growing" sub="YOUR WEEK, READ BACK GENTLY" accent={T.sage} flower="fern" idx="cb-grow">
              <div style={{ display: "grid", placeItems: "center", paddingTop: 8 }}>
                <RichBloomV2 form="cosmos" color={cwOf("sage").petal} color2={cwOf("sage").tip} accent={T.gold} size={140} idx="grow-bloom" />
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, textAlign: "center", marginTop: 8 }}>Three rituals kept this week — the garden noticed. They say a tended garden grows true.</p>
              </div>
            </Clipboard>
          </ClipboardSlider>
        )}
      </div>

      <button onClick={() => setSheet("add")} aria-label="Add" style={fab}><Plus size={26} color="#fff" /></button>

      {popup && <QuickPopup item={popup} onClose={() => setPopup(null)} onDone={complete} />}
      {dayView && <DayViewOverlay onClose={() => setDayView(false)} />}
      {calView && <CycleCalendarOverlay onClose={() => setCalView(false)} />}
      {sheet === "plan" && <PlanSheet onClose={() => setSheet(null)} />}
      {sheet === "settings" && <SettingsSheet onClose={() => setSheet(null)} />}
      {sheet === "voice" && <VoiceSheet onClose={() => setSheet(null)} />}
      {sheet === "add" && <AddPopup onClose={() => setSheet(null)} />}
    </div>
  );
}

// ── small components ──
function Wrap({ children }) { return <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>{children}</div>; }
function QuickPopup({ item, onClose, onDone }) {
  const [note, setNote] = useState(""); const c = cwOf(item.cw || "sage"); const Icon = item.icon || Check;
  const body = { meal: "Recent + a quick search — what did you have?", water: "Half a glass counts. Tap to add it.", mood: "How's your energy, really? Pick one.", intention: "A few smart suggestions, or your own words.", ritual: "A small tending — confirm when it's done.", task: "Open it here, then it ticks.", note: "Three true sentences. Not a diary." }[item.type] || "Do it here, then it ticks.";
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}><style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ ...disc, width: 34, height: 34, background: T.wax || T.paper }}><Icon size={16} color={c.petal} /></span>
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
        <div style={{ flex: 1 }}><div style={overEye}>Schedule · Thu 21 Jun</div><div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink }}>Today, hour by hour</div></div>
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
        <div style={{ flex: 1 }}><div style={overEye}>Cycle · June</div><div style={{ fontFamily: SCRIPT, fontSize: 26, color: T.ink }}>Your month</div></div>
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
function PlanSheet({ onClose }) {
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Plan a day</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 12 }}>the morning brief — lay out a day before it arrives</div>
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
    { k: "yourday", l: "Your day", on: true }, { k: "schedule", l: "Schedule & plan", on: true }, { k: "lists", l: "Lists", on: true },
    { k: "body", l: "Your body", on: true }, { k: "care", l: "Care", on: true }, { k: "rituals", l: "Rituals", on: true },
    { k: "nourishment", l: "Nourishment", on: true }, { k: "mind", l: "Mind & insight", on: true }, { k: "tonight", l: "Tonight & Jess", on: true },
    { k: "conditions", l: "Conditions", on: false },
  ]);
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={sheetStyle}>
        <div style={grab} />
        <div style={{ fontFamily: SCRIPT, fontSize: 24, color: T.ink }}>Customise your planner</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 12 }}>show, hide and reorder the boards — your planner, your shape</div>
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
    { id: "task", label: "Task", Icon: ListChecks, cw: "sage" }, { id: "event", label: "Event", Icon: CalendarClock, cw: "plum" }, { id: "meal", label: "Meal", Icon: Utensils, cw: "gold" },
    { id: "ritual", label: "Ritual", Icon: Moon, cw: "crimson" }, { id: "note", label: "A line", Icon: Feather, cw: "blush" }, { id: "intention", label: "Intention", Icon: Sparkles, cw: "gold" },
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
const omenBtn = { width: "100%", textAlign: "left", cursor: "pointer", marginTop: 12, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${ph.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${ph.petal}`, borderRadius: 16, padding: "11px 13px", display: "flex", alignItems: "center", gap: 11 };
const omenLine = { fontFamily: SERIF, fontSize: 13.5, color: T.muted, margin: "3px 0 0", lineHeight: 1.4 };
const disc = { width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 };
const fab = { position: "fixed", right: 18, bottom: "calc(var(--fw-nav-h, 76px) + 14px)", width: 54, height: 54, borderRadius: 999, background: T.crimson, border: "none", boxShadow: "0 6px 22px rgba(188,46,39,.4)", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 50 };
const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheetStyle = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `1px solid ${T.paperDeep}`, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "82dvh", overflowY: "auto" };
const grab = { width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" };
const iconX = { background: "transparent", border: "none", cursor: "pointer", color: T.muted };
const ta = { width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", resize: "none", marginBottom: 12 };
const cta = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" };
const footNote = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10 };
const overlay = { ...PAPER_BG, position: "fixed", inset: 0, zIndex: 9998, display: "flex", flexDirection: "column", overflowY: "auto" };
const overlayHead = { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}`, position: "sticky", top: 0, zIndex: 1 };
const overEye = { fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold };
const emptySlot = { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: `1px dashed ${T.paperDeep}`, borderRadius: 9, padding: "6px 10px", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, cursor: "pointer" };

/* ── FEATURE PARITY (live PlannerV2Shell → this clipboard-forward demo) ──
 Slider 1 "Your day" boards: ✅ Your day (6 tiles: rest/breakfast/walk/task/mood/lines + popups)
   · ✅ Schedule & plan (hour-by-hour day view · cycle calendar · insights · plan-a-day/morning
   brief · voice · customise) · ✅ Lists · ✅ Your body (BodyToday/SmartView/CycleZone/life-stage)
   · ✅ Care (meds · contraception · symptom log · body scan · GP export · conditions)
 Slider 2 "Tending" boards: ✅ Rituals (stack/bundle/consistency/builder) · ✅ Nourishment
   (macros/hydration/AI meal plan/phase recipes) · ✅ Mind (intention/astra/mood/breathwork/
   cycle-psych) · ✅ Tonight & Jess (reflection/tomorrow/end-of-day/Jess pattern/Jess summary/add)
 Header: ✅ flora hero · ✅ one summary intent card · ✅ omen header · ✅ week strip · ✅ Today/Cycle
 Global: ✅ Add FAB+popup · ✅ §6.7.6 quick-action popups · ✅ overlays (day view · cycle calendar)
   · ✅ sheets (plan · settings/customise · voice) · Cycle view = calendar/body/what's-growing boards
 Clipboard-forward (Journal-matched): every board holds a Grid of uniform Tile cards; the slider IS
   the spine; ~2 phone screens. v4 additive throughout. No new function. */
