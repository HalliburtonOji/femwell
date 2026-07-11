// GardenEliteShell — the ELEVATED, FULLY-WIRED /Garden (the flora showcase + the
// Nurture Companion's home). Elite analogue of Pulse/Programs/Nutrition/Lifestyle:
// self-loads real entities, oxblood script headings, lush flora (lifecycle · 64-species
// · omen creature), the full card language (ClipboardSlider → StackedCard top/bottom
// sub-sliders + gold hairline + board ‹ › arrows), TopChrome (jump-to + calendar),
// reduced-motion-safe motion. HERO TITLE generic ("Your garden") — never the handle.
//
// NOTHING STRIPPED: the real <NurtureGarden/> (companion + its CompanionState · what's
// feeding it · leave-a-line · rename · reshape · share · accumulating chapters · rare
// blooms / milestones · garden-of-gardens) and <GardenGrowth/> (goals · bucket-list ·
// tiny missions watering the garden) render verbatim below the signature spine.
//
// REAL writes (existing entities — NO new base44 function):
//   • Tend the companion → tendCompanion() → CompanionState (optimistic localStorage +
//     entity persist; cross-device source of truth).
//   • Almanac "press to your journal" → JournalEntries.create (the live journal path).
// One-line revert: pages.config "Garden" → Garden.
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Sprout, Leaf, Feather, BookOpen, X, Share2, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  PAPER_BG, T, SERIF, UI, Eyebrow, Heart as InkHeart, Hand, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator, FlowerGlyph } from "@/components/brand/flora";
import { LifecycleStage, SpeciesBloom } from "@/components/brand/floraLibrary";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import { OXBLOOD, subCard, focusPill, Panel, StackedCard, BoardBody, TopChrome, JumpSheet, SliderArrows, makeCalendarOverlay } from "@/components/brand/SliderKit";
import { getCompanion, loadCompanionState, tendCompanion, tendedToday } from "@/components/nurture/companion";
import { localMilestones, loadMilestones } from "@/components/nurture/milestones";
import NurtureGarden from "@/components/nurture/NurtureGarden";
import BloomprintCard from "@/components/nurture/BloomprintCard";
import { GardenGrowth } from "@/components/growth/GrowthLive";
// THE OMEN ENGINE (§10.2–10.5, AGREED canon) — makes the almanac board signal-driven + real.
import { useOmen, OmenReveal } from "@/components/brand/OmenAlmanac";
import { buildOmenSignals } from "@/components/brand/floraOmen";
import { getCurrentCyclePhase } from "@/utils/cyclePhase";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);
const ELITE_MOTION = `
.fw-elite-in{animation:fwEliteIn .5s ease-out both}
@keyframes fwEliteIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(0.97)}
@media (prefers-reduced-motion:reduce){.fw-elite-in{animation:none}.fw-elite-press{transition:none}}
`;

// JumpSheet (SliderKit) reads b.t / b.sub — board OBJECTS, not bare strings.
const BOARDS = [
  { t: "This season", sub: "The stage you're in" },
  { t: "Your species", sub: "Your 64-flower garden" },
  { t: "The almanac", sub: "Today's omen, hope-only" },
];
const LIFECYCLE = [
  { stage: "bud", label: "Bud", meaning: "Becoming. A new chapter, a goal just set, the follicular rise — furled, full of what's coming." },
  { stage: "bloom", label: "Bloom", meaning: "Open. Peak and expression — ovulation, a win, a day you felt like yourself. You're here this week." },
  { stage: "seed (hip)", label: "Seed", meaning: "Harvest. The rose hip — integrating, finishing, letting a lesson set. The luteal turn inward." },
  { stage: "rest (cane)", label: "Rest", meaning: "Restoration — a bud on old wood. Winter, not death: menstruation, postpartum, a chosen pause. Nothing is lost." },
];
const HERE = "bloom";
const BOUQUET = ["rose", "sunflower", "hibiscus", "iris", "lily", "peony", "dahlia", "foxglove", "daisy", "lavender"];

export default function GardenEliteShell() {
  useEditorialFonts();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [comp, setComp] = useState(null);
  const [ms, setMs] = useState([]);
  const [tendedT, setTendedT] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [tendOpen, setTendOpen] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me(); if (!alive) return;
        setUser(u); setUid(u.id);
        base44.entities.UserProfile.filter({ user_id: u.id }, "-created_date", 1).catch(() => []).then((p) => { if (alive) setProfile(p?.[0] || u); });
        setComp(getCompanion(u.id)); setTendedT(tendedToday(u.id));
        loadCompanionState(u.id).then(() => { if (alive) { setComp(getCompanion(u.id)); setTendedT(tendedToday(u.id)); } }).catch(() => {});
        setMs(localMilestones(u.id));
        loadMilestones(u.id).then(() => { if (alive) setMs(localMilestones(u.id)); }).catch(() => {});
      } catch { /* fail-open */ }
    })();
    return () => { alive = false; };
  }, []);

  const gold = T.gold, sage = cwOf("sage").petal, crim = T.crimson;
  const compName = comp?.name?.trim() || "your companion";
  const milestoneCount = ms.length;

  function jumpTo(i) {
    const wrap = sliderRef.current;
    const track = wrap?.querySelector(".fw-clipboard-track"); if (!track) { setJumpOpen(false); return; }
    const boards = [...track.children].filter((c) => c.offsetWidth > 40);
    const card = boards[i]; if (card) track.scrollLeft = card.offsetLeft - track.offsetLeft;
    wrap?.scrollIntoView({ behavior: "smooth", block: "start" });
    setJumpOpen(false);
  }
  const scrollToGarden = () => { try { document.getElementById("fw-garden-real")?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* */ } };

  const onTended = () => { if (uid) { setComp(getCompanion(uid)); setTendedT(tendedToday(uid)); } };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, overflowX: "clip", paddingBottom: "calc(110px + env(safe-area-inset-bottom))", position: "relative" }}>
      <InkFilter />
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "16px 18px 0", position: "relative" }} className="fw-elite-in">
        {/* SIGNATURE TOP — generic oxblood title, companion at the centre below */}
        <FwFloraHero title="Your garden" titleColor={OXBLOOD} bloom="peony" colorway="gold" flankL="iris" flankR="sunflower" creature="butterfly"
          line="A living thing, unique to you — grown from everything you already do, and it never dies." idx="garden-hero" />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -4, marginBottom: 2 }}>
          <Bouquet items={[{ form: "rose", colorway: "crimson" }, { form: "fern", colorway: "sage" }, { form: "cosmos", colorway: "gold" }]} size={150} animate idx="garden-bq" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 16px" }}>
          <Flower2 size={14} color={sage} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{compName === "your companion" ? "Your living companion" : `${compName} · your companion`}</span>
        </div>

        <SummaryCard eyebrow="Your garden today" accent={sage} rows={[
          { Icon: Sparkles, label: "This season", text: "You're in bloom — a season of small attentions showing.", onClick: () => jumpTo(0) },
          { Icon: Sprout, label: "What fed it", text: tendedT ? "Tended today — your care is feeding the garden." : "Your journal, meals, check-ins and plans feed it. Tend it below.", onClick: scrollToGarden },
          { Icon: Leaf, label: "Rare blooms", text: milestoneCount > 0 ? `${milestoneCount} earned — your kept chapters.` : "Keep tending and rare blooms appear.", onClick: scrollToGarden },
        ]} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setTendOpen(true)} className="fw-elite-press" style={focusPill(crim)}><Feather size={16} /> Tend</button>
          <button onClick={scrollToGarden} className="fw-elite-press" style={focusPill(gold)}><Share2 size={16} /> Share</button>
        </div>

        {/* THE LIVING ECOSYSTEM — the elite spine (3 StackedCard boards) */}
        <div ref={sliderRef} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide through your garden →" accent={sage}>

            {/* BOARD 1 — THIS SEASON (lifecycle) */}
            <Clipboard title="This season" sub="THE SAME FLOWER, AT THE STAGE YOU'RE IN" accent={crim} flower="poppy" idx="cb-season" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crim} bottomAccent={sage}
                  top={<SeasonLens />}
                  bottom={[
                    <Panel key="comp" label="Your companion" accent={sage}>
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.55, margin: 0 }}>{compName === "your companion" ? "Your companion grows from your real self-care — the acts are the tending." : `${compName} grows from your real self-care — journalling, meals & water, check-ins, your cycle, your plans. The acts are the tending.`}</p>
                      <button onClick={() => setTendOpen(true)} className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 12 }}><Feather size={15} /> Leave a line</button>
                    </Panel>,
                    <Panel key="rest" label="Rest is a stage" accent={sage}>
                      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, lineHeight: 1.6, margin: 0 }}>Rest is a stage, not a failure — the garden never draws nothing. A bud on old wood is still the rose.</p>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 2 — YOUR SPECIES (64-library) */}
            <Clipboard title="Your species" sub="64 RECOGNISABLE FLOWERS — A REAL GARDEN" accent={sage} flower="sunflower" idx="cb-species" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={gold}
                  top={[
                    <Panel key="b1" label="A bouquet from your garden" accent={sage}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                        {BOUQUET.slice(0, 6).map((n) => (
                          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 58 }}>
                            <SpeciesBloom name={n} size={54} />
                            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 1, textTransform: "capitalize" }}>{n}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>,
                    <Panel key="b2" label="…and more" accent={sage}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                        {BOUQUET.slice(6).map((n) => (
                          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 58 }}>
                            <SpeciesBloom name={n} size={54} />
                            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 1, textTransform: "capitalize" }}>{n}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>,
                  ]}
                  bottom={<Panel label="Why it matters" accent={gold}>
                    <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.55, margin: "0 0 12px" }}>A rose reads as a rose; an iris as an iris. Your garden draws its blooms, companions and chapters from the whole library — colour carries meaning, so no two gardens repeat.</p>
                    <button onClick={() => navigate(createPageUrl("FloraLabDemo"))} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>See the full Flora Lab <BookOpen size={14} /></button>
                  </Panel>} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 3 — THE ALMANAC (omen + press-to-journal) */}
            <Clipboard title="The almanac" sub="A GARDEN THAT SPEAKS — HOPE-ONLY, NEVER A PROMISE" accent={gold} flower="lavender" idx="cb-almanac" titleColor={OXBLOOD}>
              <BoardBody>
                <AlmanacBoard uid={uid} profile={profile} crim={crim} gold={gold} />
              </BoardBody>
            </Clipboard>
          </ClipboardSlider>
        </div>

        {/* ── PRESERVED: the real live Garden, verbatim — nothing removed ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "34px 0 6px" }}>
          <span style={{ flex: 1, height: 1, background: T.paperDeep }} />
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>Everything your garden already does</span>
          <span style={{ flex: 1, height: 1, background: T.paperDeep }} />
        </div>
        <div id="fw-garden-real">
          {/* Your Bloomprint — the identity header for your patch (this Garden IS your bloom, up close) */}
          <div style={{ marginBottom: 14 }}><BloomprintCard /></div>
          <NurtureGarden />
          <div style={{ marginTop: 8 }}><GardenGrowth /></div>
        </div>

        <div style={{ marginTop: 40 }}><EditorialFooter /></div>
      </div>

      {tendOpen && <TendPopup uid={uid} onClose={() => setTendOpen(false)} onTended={onTended} />}
      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
    </div>
  );
}

// ── BOARD 1 top lens — the lifecycle, tap a stage to reveal its meaning ──
function SeasonLens() {
  const [open, setOpen] = useState(HERE);
  const active = LIFECYCLE.find((l) => l.stage === open) || LIFECYCLE[1];
  return (
    <Panel label="Where you are" accent={OXBLOOD}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {LIFECYCLE.map((l) => {
          const on = l.stage === open;
          return (
            <button key={l.stage} onClick={() => setOpen(l.stage)} className="fw-elite-press" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 2px", background: on ? `${T.crimson}12` : "transparent", border: `1px solid ${on ? T.crimson : "transparent"}`, borderRadius: 12, cursor: "pointer" }}>
              <LifecycleStage name={l.stage} size={50} />
              <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: on ? T.crimson : T.muted }}>{l.label}</span>
              {l.stage === HERE && <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.crimson }}>· you ·</span>}
            </button>
          );
        })}
      </div>
      <div style={{ ...subCard(T.crimson), marginTop: 12 }}>
        <Eyebrow color={T.crimson} mb={6}>{active.label}{active.stage === HERE ? " · this week" : ""}</Eyebrow>
        <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.5, margin: 0 }}>{active.meaning}</p>
      </div>
    </Panel>
  );
}

// ── BOARD 3 — the almanac, NOW SIGNAL-DRIVEN via the real omen engine (§10.2–10.5).
// The omen is chosen from her real signals (cycle phase · life-stage · date), rotating on a
// daily seed; tap → the 3-layer reveal (meaning · "they say…" · why now + nudge) → press to
// the REAL journal (JournalEntries.create). Hope-only; one omen a day. NO new function. ──
function AlmanacBoard({ uid, profile, crim, gold }) {
  const signals = buildOmenSignals({ phaseKey: getCurrentCyclePhase(profile)?.phase || null, lifeStage: profile?.life_stage });
  const omen = useOmen(signals, uid);
  const [open, setOpen] = useState(false);
  const c = cwOf(omen?.accent || "gold");
  const glyph = !omen ? null : omen.kind === "creature"
    ? <Pollinator kind={omen.glyph} size={omen.glyph === "ladybird" ? 32 : 38} color={omen.glyph === "bee" ? T.gold : (omen.glyph === "ladybird" || omen.glyph === "robin") ? T.crimson : c.petal} color2={c.tip} animate idx={`g-omen-${omen.key}`} />
    : <FlowerGlyph variant={omen.glyph} size={38} color={c.petal} color2={c.tip} idx={`g-omen-${omen.key}`} />;
  return (
    <>
    <StackedCard topAccent={gold} bottomAccent={crim}
      top={<Panel label="Today's omen" accent={gold}>
        <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 8px" }}>{glyph}</div>
        <Hand size={17} color={T.ink} style={{ display: "block", textAlign: "center", lineHeight: 1.5, padding: "0 6px" }}>“{omen?.line}”</Hand>
        {omen?.nudge && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, textAlign: "center", margin: "8px 0 0", lineHeight: 1.5 }}>{omen.nudge}</p>}
      </Panel>}
      bottom={<Panel label="Keep it" accent={crim}>
        <button onClick={() => setOpen(true)} className="fw-elite-press" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: crim, color: T.paper, border: "none", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" }}><Feather size={14} /> Read &amp; press to journal</button>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "12px 0 0", lineHeight: 1.5 }}>One real omen a day, hope-only, signal-driven — the rails hold. Tap to see why the garden chose this, then press it in.</p>
      </Panel>} />
      {open && omen && <OmenReveal omen={omen} onClose={() => setOpen(false)}
        onPressToJournal={(o) => { if (uid) base44.entities.JournalEntries.create({ user_id: uid, session_date: new Date().toISOString().slice(0, 10), text: o.line, tags: ["garden", "almanac", "omen"], prompt: "From the garden almanac", card_type: "free", card_color: "cream" }).catch(() => {}); }} />}
    </>
  );
}

// ── Tend the companion — a REAL persisting write (tendCompanion → CompanionState) ──
function TendPopup({ uid, onClose, onTended }) {
  const [note, setNote] = useState("");
  const save = () => {
    if (uid) tendCompanion(uid, note.trim());   // optimistic localStorage + entity persist
    onTended(); onClose();
  };
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,8,5,0.44)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{ width: "100%", maxWidth: 460, background: T.paperHi, borderRadius: "22px 22px 0 0", padding: "18px 18px 24px", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", border: `1px solid ${T.paperDeep}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Eyebrow color={T.crimson}>Leave a line for your companion</Eyebrow>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={15} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>A word is enough — tending is the act, not the length.</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} autoFocus rows={3} placeholder="How are you, really?"
          style={{ width: "100%", boxSizing: "border-box", marginTop: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", resize: "none" }} />
        <button onClick={save} style={{ width: "100%", marginTop: 12, background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "13px 16px", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}><InkHeart size={13} /> Tend the garden</button>
      </div>
    </div>
  );
}
