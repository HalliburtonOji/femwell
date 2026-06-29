// LifestyleL2Demo — DEMO of the approved "Lifestyle Level Up (+2)" plan, built ON the live
// LifestyleEliteShell's elite card language (FwFloraHero + SummaryCard + ClipboardSlider of
// StackedCard boards w/ top/bottom sub-sliders, oxblood headings, flora, top chrome, inline media).
// Demo-first, for approval; LIVE /Lifestyle untouched. Non-gated +1/+2 features are real/seeded
// (real embedded video via the live CookVideo player + verified RECIPE_LIBRARY id); the one gated
// piece (the automated verify-and-sweep job) is a clearly-labelled "needs sign-off" stub.
//
// Plan source: src/components/founders/brandDocs/lifestyle-levelup.html
import { useState, useMemo } from "react";
import {
  Headphones, Play, BookOpen, Sparkles, Wind, Scissors, Moon, Smile,
  CalendarHeart, GraduationCap, Users, Volume2, Lock, AlertTriangle, Leaf, BookMarked,
} from "lucide-react";
import {
  PAPER_BG, T, SERIF, UI, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator, FlowerGlyph } from "@/components/brand/flora";
import { OXBLOOD, subCard, focusPill, Panel, StackedCard, BoardBody, TopChrome, JumpSheet, SliderArrows } from "@/components/brand/SliderKit";
import { RECIPE_LIBRARY } from "@/data/recipeLibrary";
import CookVideo from "@/components/nutrition-elite/CookVideo";

const ELITE_MOTION = `
.fw-elite-in{animation:fwEliteIn .5s cubic-bezier(.4,0,.2,1) both}
@keyframes fwEliteIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.fw-elite-in{animation:none}.fw-elite-press{transition:none}}`;

const BOARDS = [
  { t: "Play now", sub: "Listen · watch · read — in your hand" },
  { t: "The good life", sub: "Awe · make · rest · joy" },
  { t: "Kept & together", sub: "Your intentions · learn · lounge" },
];

function GatedBadge() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: T.crimson, border: `1px solid ${T.crimson}`, borderRadius: 999, padding: "2px 8px" }}><Lock size={10} /> Needs sign-off</span>;
}
function L2Badge({ tier = "+2" }) {
  const c = tier === "+1" ? cwOf("sage").petal : cwOf("plum").petal;
  return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: c, border: `1px solid ${c}`, borderRadius: 999, padding: "2px 7px" }}>Level {tier}</span>;
}
function EvBadge() {
  return <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: cwOf("sage").petal }}>● Evidence-based</span>;
}

// a seeded LibriVox-style inline audio bar (the live Listen player, fed by public-domain audio)
function AudioBar({ title, by, accent }) {
  return (
    <div style={{ ...subCard(accent) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 40, height: 40, borderRadius: 999, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Play size={17} color="#fff" fill="#fff" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{by}</div>
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: T.paperDeep, overflow: "hidden", margin: "10px 0 4px" }}><div style={{ width: "34%", height: "100%", background: accent }} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 10.5, color: T.muted }}><span>4:12</span><span>12:30</span></div>
    </div>
  );
}

export default function LifestyleL2Demo() {
  useEditorialFonts();
  const [jumpOpen, setJumpOpen] = useState(false);
  const [bucket, setBucket] = useState("5");
  const ref = useMemo(() => ({ current: null }), []);
  const gold = T.gold, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal, blush = cwOf("blush").petal;
  const clip = RECIPE_LIBRARY.find((r) => r.minutes <= 30) || RECIPE_LIBRARY[0];

  function jumpTo(i) {
    const wrap = ref.current; const track = wrap?.querySelector(".fw-clipboard-track"); if (!track) { setJumpOpen(false); return; }
    const boards = [...track.children].filter((c) => c.offsetWidth > 40); const card = boards[i];
    if (card) track.scrollLeft = card.offsetLeft - track.offsetLeft;
    wrap?.scrollIntoView({ behavior: "smooth", block: "start" }); setJumpOpen(false);
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, overflowX: "clip", paddingBottom: "calc(110px + env(safe-area-inset-bottom))", position: "relative" }}>
      <InkFilter />
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} />

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "16px 18px 0", position: "relative" }} className="fw-elite-in">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: gold, border: `1px solid ${gold}`, borderRadius: 999, padding: "4px 12px" }}>Lifestyle · Level +2 · demo · for approval</span>
        </div>

        <FwFloraHero title="Lifestyle" titleColor={OXBLOOD} bloom="daisy" colorway="gold" flankL="lavender" flankR="cosmos" creature="butterfly"
          line="The good life, fed — leisure is medicine, and here, rest is allowed." idx="ll2-hero" />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -4, marginBottom: 2 }}>
          <Bouquet items={[{ form: "daisy", colorway: "gold" }, { form: "lavender", colorway: "plum" }, { form: "cosmos", colorway: "sage" }]} size={148} animate idx="ll2-bq" />
        </div>

        {/* the emotional spine — sanctioned rest (the women's leisure gap) */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "8px 0 2px", background: `${plum}12`, border: `1px solid ${plum}55`, borderRadius: 14, padding: "11px 13px" }}>
          <Leaf size={17} color={plum} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.5 }}>Women get <b>~5 fewer leisure hours</b> a week — and more guilt about them. So FemWell sanctions rest. <b>No streaks here; we celebrate your return, never shame an absence.</b> <L2Badge /></span>
        </div>

        {/* time-boxed dopamine menu */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>What have you got?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["5", "5 minutes"], ["30", "30 minutes"], ["eve", "A whole evening"]].map(([id, l]) => (
              <button key={id} onClick={() => setBucket(id)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "9px 6px", borderRadius: 12, cursor: "pointer", border: `1px solid ${bucket === id ? gold : T.paperDeep}`, background: bucket === id ? `${gold}1A` : T.paper, color: bucket === id ? OXBLOOD : T.muted }}>{l}</button>
            ))}
          </div>
          <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "7px 2px 0" }}>{bucket === "5" ? "5 min → a micro-act of joy or one calm track." : bucket === "30" ? "30 min → a chapter, an awe walk, or an episode." : "An evening → a book, a film club, a long bath with a story."}</p>
        </div>

        <div style={{ marginTop: 14 }}>
          <SummaryCard eyebrow="A few good things, in your hand" accent={gold} rows={[
            { Icon: Headphones, label: "Something that plays", text: "Listen, watch and read now play inline — fed from free, legal libraries.", onClick: () => jumpTo(0) },
            { Icon: Smile, label: "Five minutes of joy", text: "A tiny, evidence-backed micro-act for the days with no spare hour.", onClick: () => jumpTo(1) },
            { Icon: CalendarHeart, label: "Your kept intentions", text: "The quiet hours you booked, finally shown back to you.", onClick: () => jumpTo(2) },
          ]} />
        </div>

        <div ref={(el) => { ref.current = el; }} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={ref} />
          <ClipboardSlider hint="Slide the good life →" accent={gold}>

            {/* BOARD 1 — PLAY NOW (fed players) */}
            <Clipboard title="Play now" sub="LISTEN · WATCH · READ — IN YOUR HAND" accent={gold} flower="sunflower" idx="cb-play" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={plum}
                  top={[
                    <Panel key="listen" label="Listen · LibriVox" Icon={Headphones} accent={gold}>
                      <AudioBar title="Quiet poems for a tired evening" by="LibriVox · public domain · plays inline" accent={gold} />
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "10px 2px 0" }}>The Listen shelf is fed from <b>LibriVox</b> (public-domain audio, commercial-OK) + Acast/Buzzsprout full-episode embeds — an infinite, free supply for the real seek player. <L2Badge tier="+1" /></p>
                    </Panel>,
                    <Panel key="watch" label="Watch · plays in-card" Icon={Play} accent={crim}>
                      <CookVideo youtubeId={clip.youtube_id} title="Slow living: a calm 20 minutes" accent={crim} />
                      <div style={{ ...subCard(sage), marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 7, alignItems: "center" }}><AlertTriangle size={14} color={sage} /><span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink }}>If a clip’s removed → “gone walkabout, here’s another.”</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}><GatedBadge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>auto verify-&amp;-sweep job = scheduled function</span></div>
                        <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "6px 2px 0", lineHeight: 1.5 }}>Only the <i>automated</i> weekly dead-embed sweep needs sign-off — v1 is hand-verified (like today’s 6 videos), zero rule-risk.</p>
                      </div>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="read" label="Read · Standard Ebooks" Icon={BookOpen} accent={plum}>
                      <div style={{ ...subCard(plum) }}>
                        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>A Room of One’s Own</div>
                        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginBottom: 6 }}>Virginia Woolf · Standard Ebooks · beautifully typeset, public domain</div>
                        <button className="fw-elite-press" style={{ ...focusPill(plum) }}><BookOpen size={15} /> Open the reader</button>
                      </div>
                      <button className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "9px 14px", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: OXBLOOD }}><Volume2 size={14} color={gold} /> Listen to this read (TTS) <L2Badge /></button>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Self-hosted TTS turns any Read card into a Listen card — no new licensing.</p>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 2 — THE GOOD LIFE (evidence lanes) */}
            <Clipboard title="The good life" sub="AWE · MAKE · REST · JOY" accent={sage} flower="lavender" idx="cb-good" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={crim}
                  top={[
                    <Panel key="awe" label="Awe walk" Icon={Wind} accent={sage}>
                      <EvBadge />
                      <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.55, margin: "6px 0 0" }}>A 15-minute walk with one instruction: <b>find one vast thing</b> — a tree, a sky, a far view. RCT-backed: more awe, joy, compassion and gratitude.</p>
                      <button className="fw-elite-press" style={{ ...focusPill(sage), marginTop: 12 }}><Wind size={15} /> Start a 15-min awe walk</button>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>A literal evidence-based prescription, as a card. <L2Badge tier="+1" /></p>
                    </Panel>,
                    <Panel key="make" label="Make" Icon={Scissors} accent={crim}>
                      <EvBadge />
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.55, margin: "6px 0 10px" }}>45 minutes of making lowers cortisol — <b>skill irrelevant</b>. Craft, doodle, slow-cook.</p>
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{["Doodle", "Slow-cook", "Mend something", "Journal a page"].map((t) => <span key={t} style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px" }}>{t}</span>)}</div>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="rest" label="Rest — on purpose" Icon={Moon} accent={plum}>
                      <div style={{ ...subCard(plum) }}>
                        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, lineHeight: 1.5 }}>“Do nothing, on purpose.”</div>
                        <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "6px 0 0", lineHeight: 1.5 }}>A permission card for the guilt gap — plus a LibriVox bedtime classic that auto-queues.</p>
                      </div>
                      <AudioBar title="Bedtime: a gentle classic" by="LibriVox · auto-queued for sleep" accent={plum} />
                    </Panel>,
                    <Panel key="joy" label="Five minutes of joy" Icon={Smile} accent={crim}>
                      <EvBadge />
                      <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "6px 0 8px", lineHeight: 1.5 }}>UCSF’s Big Joy Project — 7 days of 5-min micro-acts raised wellbeing &amp; sleep. Tap one:</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {["Note three good things", "Send a kind message", "Watch something that awes you", "Share a proud moment"].map((t) => (
                          <button key={t} className="fw-elite-press" style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px", cursor: "pointer" }}><Sparkles size={14} color={crim} /><span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>{t}</span></button>
                        ))}
                      </div>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 3 — KEPT & TOGETHER */}
            <Clipboard title="Kept & together" sub="YOUR INTENTIONS · LEARN · LOUNGE" accent={plum} flower="iris" idx="cb-kept" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={plum} bottomAccent={blush}
                  top={[
                    <Panel key="intentions" label="Your kept intentions" Icon={CalendarHeart} accent={plum}>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "0 0 8px", lineHeight: 1.5 }}>The quiet hours you booked are finally shown back — not a toast into the void.</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[["A day for you", "Sat 5 Jul"], ["A quiet hour", "Tonight, 9pm"], ["Try this — a long bath", "Sun morning"]].map(([t, w]) => (
                          <div key={t} style={{ ...subCard(plum), display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>{t}</span><span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{w}</span></div>
                        ))}
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Read-back of the <code>PlannerItems</code> you already save. <L2Badge tier="+1" /></p>
                    </Panel>,
                    <Panel key="learn" label="Learn one thing" Icon={GraduationCap} accent={gold}>
                      <div style={{ ...subCard(gold) }}>
                        <div style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: T.ink }}>Why does the moon look bigger at the horizon?</div>
                        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 3 }}>A 5-minute read · mind-stimulating leisure links to longevity</div>
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Bite-size curiosity — a Standard-Ebooks essay or a short explainer. <L2Badge /></p>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="lounge" label="The lounge · clubs" Icon={Users} accent={crim}>
                      <div style={{ ...subCard(crim) }}>
                        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, color: crim, textTransform: "uppercase", letterSpacing: ".05em" }}>This month’s book club</span>
                        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, marginTop: 2 }}>Tomorrow, and tomorrow</div>
                        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>34 women reading along · one gentle weekly thread</div>
                        <button className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 10 }}><Users size={15} /> Join the thread</button>
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>A gentle “third place”, bounded — book/watch clubs, not a feed. Ties to Community. <L2Badge /></p>
                    </Panel>,
                    <Panel key="card" label="Your library card" Icon={BookMarked} accent={blush}>
                      <div style={{ borderRadius: 16, padding: "16px 16px", background: `linear-gradient(135deg, ${blush}22, ${gold}1A)`, border: `1px solid ${T.paperDeep}` }}>
                        <div style={{ display: "grid", placeItems: "center", marginBottom: 6 }}><FlowerGlyph variant="rose" size={36} color={crim} color2={blush} idx="libcard" /></div>
                        <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: T.muted, textAlign: "center" }}>FemWell Reading Room</div>
                        <div style={{ fontFamily: "Ephesis, cursive", fontSize: 26, color: OXBLOOD, textAlign: "center", lineHeight: 1.1 }}>your name here</div>
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>The Reading-Well “book on prescription” metaphor — warm, shareable. <L2Badge /></p>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "20px 0 0" }}><Pollinator kind="butterfly" size={30} color={gold} color2={cwOf("plum").tip} pattern="bands" animate idx="ll2-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 320, lineHeight: 1.55 }}>A room always full of things that play, in your hand — and the rest you’re allowed to take.</p>
        <div style={{ marginTop: 30 }}><EditorialFooter /></div>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
    </div>
  );
}
