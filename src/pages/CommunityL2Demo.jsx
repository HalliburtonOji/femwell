// CommunityL2Demo — DEMO of the approved "Community Level Up (+2)" plan, built ON the live
// CommunityEliteShell's elite card language (FwFloraHero + SummaryCard + safety charter +
// ClipboardSlider of StackedCard boards w/ top/bottom sub-sliders, oxblood headings, flora, top
// chrome). Demo-first, for approval; LIVE /Community untouched. Non-gated +1/+2 features are
// real/seeded (expert-verified layer, NHS AMA, no-post-unanswered, healthy reactions, mentorship,
// life-stage matching, mute-keywords). GATED features (moderated free-text DM · live audio rooms ·
// local/IRL bridge) are clearly-labelled "needs sign-off" stubs. OSA-2023 spine noted.
//
// Plan source: src/components/founders/brandDocs/community-plan.html
import { useState, useMemo } from "react";
import {
  MessageCircle, Lock, HandHeart, Users, ShieldCheck, Heart, Sparkles,
  MapPinOff, MapPin, Mic, Feather, Check, Coffee, Star, BadgeCheck, Filter, CalendarClock,
} from "lucide-react";
import {
  PAPER_BG, T, SERIF, UI, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import { OXBLOOD, subCard, focusPill, Panel, StackedCard, BoardBody, TopChrome, JumpSheet, SliderArrows } from "@/components/brand/SliderKit";

const ELITE_MOTION = `
.fw-elite-in{animation:fwEliteIn .5s cubic-bezier(.4,0,.2,1) both}
@keyframes fwEliteIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.fw-elite-in{animation:none}.fw-elite-press{transition:none}}`;

const BOARDS = [
  { t: "Connection", sub: "Screened · mentored · your choice" },
  { t: "The rooms", sub: "Whole-life · expert-anchored" },
  { t: "Together", sub: "Reactions · offline · live" },
];

function GatedBadge() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: T.crimson, border: `1px solid ${T.crimson}`, borderRadius: 999, padding: "2px 8px" }}><Lock size={10} /> Needs sign-off</span>;
}
function L2Badge({ tier = "+2" }) { const c = tier === "+1" ? cwOf("sage").petal : cwOf("plum").petal; return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: c, border: `1px solid ${c}`, borderRadius: 999, padding: "2px 7px" }}>Level {tier}</span>; }

const ROOMS = [
  ["The Lounge", "Vent, spill it, be heard.", Coffee, "gold"],
  ["Love & Relationships", "Dating, friendship, marriage.", Heart, "crimson"],
  ["Money & Work", "Careers, pay, pensions.", Star, "sage"],
  ["Style & Self", "Fashion as confidence.", Sparkles, "plum"],
  ["The Lighter Side", "Fun, telly, the stars.", Users, "gold"],
  ["Health", "The clinical room — NHS-grounded.", ShieldCheck, "sage"],
];

export default function CommunityL2Demo() {
  useEditorialFonts();
  const [jumpOpen, setJumpOpen] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [muted, setMuted] = useState(["miscarriage"]);
  const ref = useMemo(() => ({ current: null }), []);
  const gold = T.gold, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal, steel = "#5F7E8E";

  function jumpTo(i) {
    const wrap = ref.current; const track = wrap?.querySelector(".fw-clipboard-track"); if (!track) { setJumpOpen(false); return; }
    const cards = [...track.children].filter((c) => c.offsetWidth > 40); const card = cards[i];
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
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: gold, border: `1px solid ${gold}`, borderRadius: 999, padding: "4px 12px" }}>Community · Level +2 · demo · for approval</span>
        </div>

        <FwFloraHero title="Community" titleColor={OXBLOOD} bloom="cosmos" colorway="sage" flankL="clover" flankR="sunflower" creature="bee"
          line="A safe, expert-anchored, whole-life third space — and the one that gets you offline." idx="cl2-hero" />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -4, marginBottom: 2 }}>
          <Bouquet items={[{ form: "cosmos", colorway: "sage" }, { form: "clover", colorway: "gold" }, { form: "rose", colorway: "crimson" }]} size={148} animate idx="cl2-bq" />
        </div>

        {/* safety charter — the rails, always on */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", margin: "8px 0 2px" }}>
          {[["18+ only", ShieldCheck], ["No location by default", MapPinOff], ["Checked before it's sent", Lock], ["Anonymous · block anytime", Users]].map(([t, Ic]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px" }}><Ic size={12} color={sage} /> {t}</span>
          ))}
        </div>
        <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "8px 0 0" }}>Built to the <b>UK Online Safety Act 2023</b> — illegal-content checks, easy reporting, a named accountable person, crisis-routing. <L2Badge /></p>

        <div style={{ marginTop: 12 }}>
          <SummaryCard eyebrow="In the circle today" accent={gold} rows={[
            { Icon: BadgeCheck, label: "Ask the NHS clinician", text: "This Thursday, 7pm — a verified midwife answers your questions, live.", onClick: () => jumpTo(1) },
            { Icon: HandHeart, label: "3 sisters waiting", text: "Three posts haven't had a reply yet — be the first warm voice.", onClick: () => jumpTo(1) },
            { Icon: Users, label: "Mentorship", text: "A younger woman ↔ one who's been through it. New this level.", onClick: () => jumpTo(0) },
          ]} />
        </div>

        <div ref={(el) => { ref.current = el; }} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={ref} />
          <ClipboardSlider hint="Slide through the circle →" accent={gold}>

            {/* BOARD 1 — CONNECTION */}
            <Clipboard title="Connection" sub="SCREENED · MENTORED · YOUR CHOICE" accent={crim} flower="rose" idx="cb-conn" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crim} bottomAccent={plum}
                  top={[
                    <Panel key="witness" label="Talk it out · 1:1 (live today)" Icon={HandHeart} accent={crim}>
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>Hand one hard moment to a woman in your season — matched by season, <b>never location</b>. Crisis-screened, encrypted, one gentle reply. She never learns who you are.</p>
                      <button className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 12 }}><HandHeart size={15} /> Open Witness</button>
                      <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "8px 2px 0" }}>The real 1:1, live today.</p>
                    </Panel>,
                    <Panel key="dm" label="Free-text 1:1 thread" Icon={MessageCircle} accent={plum}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><GatedBadge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>moderated-delivery function</span></div>
                      <div style={{ ...subCard(plum), opacity: 0.97 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>A real, ongoing conversation</div>
                        <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>The natural graduation from Witness’s single reply — anonymous, server-moderated, private.</p>
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, lineHeight: 1.5, margin: "10px 2px 0" }}><b>Gated.</b> Needs one small safety function (today’s moderator only screens public posts/comments). Shown as a stub — not built.</p>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="mentor" label="Intergenerational mentorship" Icon={Users} accent={sage}>
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>A younger woman paired with one who’s “been through it” — peri, TTC, a new city. The dialogue women say is missing.</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[["want", "I’d like a mentor"], ["give", "I’ll mentor"]].map(([id, l]) => (
                          <button key={id} onClick={() => setMentor(id)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "10px 8px", borderRadius: 12, cursor: "pointer", border: `1px solid ${mentor === id ? sage : T.paperDeep}`, background: mentor === id ? `${sage}1A` : T.paper, color: mentor === id ? "#3f6b3f" : T.muted }}>{mentor === id && <Check size={13} style={{ verticalAlign: -2, marginRight: 4 }} />}{l}</button>
                        ))}
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>On the screened connection rails. <L2Badge tier="+1" /></p>
                    </Panel>,
                    <Panel key="prefs" label="Your safety dial" Icon={Filter} accent={crim}>
                      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: crim, marginBottom: 6 }}>Mute keywords</div>
                      <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "0 0 8px", lineHeight: 1.5 }}>Hide posts with words that are hard for you right now. You hold the dial on your own exposure.</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {muted.map((w) => <span key={w} style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: crim, background: `${crim}14`, border: `1px solid ${crim}`, borderRadius: 999, padding: "5px 11px" }}>{w} ✕</span>)}
                        <button onClick={() => setMuted((p) => p.includes("pregnancy") ? p : [...p, "pregnancy"])} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, background: T.paper, border: `1px dashed ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer" }}>+ add a word</button>
                      </div>
                      <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 10 }}><MapPinOff size={14} color={sage} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>Never matched by location. Block or report anyone, anytime.</span></div>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 2 — THE ROOMS (whole-life + trust layer) */}
            <Clipboard title="The rooms" sub="WHOLE-LIFE · EXPERT-ANCHORED" accent={gold} flower="sunflower" idx="cb-rooms" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={steel}
                  top={[
                    <Panel key="rooms" label="Every part of life has a room" Icon={Coffee} accent={gold}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {ROOMS.map(([n, d, Ic, cw]) => { const c = cwOf(cw).petal; return (
                          <div key={n} style={{ ...subCard(c), display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ width: 30, height: 30, borderRadius: 9, background: `${c}1A`, display: "grid", placeItems: "center", flexShrink: 0 }}><Ic size={15} color={c} /></span>
                            <span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{n}</span><span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{d}</span></span>
                          </div>
                        ); })}
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Surfaced for <b>your</b> life-stage first (peri, TTC, new city…). <L2Badge tier="+1" /></p>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="verified" label="Expert-verified answers" Icon={BadgeCheck} accent={steel}>
                      <div style={{ ...subCard(steel) }}>
                        <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.5, margin: 0 }}>“Is spotting on the mini-pill normal?”</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8, background: `${sage}14`, borderRadius: 10, padding: "9px 11px" }}>
                          <BadgeCheck size={16} color={"#3f6b3f"} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span><span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, color: "#3f6b3f", textTransform: "uppercase", letterSpacing: ".05em" }}>Verified · NHS midwife</span><p style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, margin: "2px 0 0", lineHeight: 1.5 }}>Very common in the first 3 months — here’s when it’s worth checking…</p></span>
                        </div>
                      </div>
                      <div style={{ ...subCard(gold), marginTop: 10, display: "flex", gap: 9, alignItems: "center" }}>
                        <CalendarClock size={17} color={gold} />
                        <span style={{ flex: 1 }}><span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, display: "block" }}>Ask the NHS clinician · Thu 7pm</span><span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>A live AMA — the antidote to “DrTok”.</span></span>
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>A verified-answer flag + scheduled AMAs — the trust moat. <L2Badge tier="+1" /></p>
                    </Panel>,
                    <Panel key="firstresp" label="No post left unanswered" Icon={HandHeart} accent={crim}>
                      <div style={{ ...subCard(crim) }}>
                        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>3 sisters are waiting</div>
                        <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>Three posts haven’t had a reply yet. ~half of people don’t return if no one answers in 24h — so we make sure someone does.</p>
                      </div>
                      <button className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 12 }}><HandHeart size={15} /> Be the first warm voice</button>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>A gentle first-responder rota — an invitation, never a chore. <L2Badge tier="+1" /></p>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 3 — TOGETHER (reactions · offline · live) */}
            <Clipboard title="Together" sub="REACTIONS · OFFLINE · LIVE" accent={sage} flower="clover" idx="cb-together" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={plum}
                  top={[
                    <Panel key="react" label="Healthy reactions — not likes" Icon={Heart} accent={sage}>
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>Be seen without the scoreboard. No likes, no follower counts, no photos — just “you’re not alone” signals.</p>
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        {["Me too", "I felt this", "Holding you", "Sending strength"].map((r) => (
                          <button key={r} onClick={() => setReaction(r)} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "8px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${reaction === r ? sage : T.paperDeep}`, background: reaction === r ? `${sage}1A` : T.paper, color: reaction === r ? "#3f6b3f" : T.inkSoft }}>{r}</button>
                        ))}
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>{reaction ? `You sent “${reaction}” — quietly, kindly.` : "Comparison harm avoided by design."} <L2Badge tier="+1" /></p>
                    </Panel>,
                    <Panel key="theme" label="This week’s theme" Icon={Feather} accent={gold}>
                      <div style={{ ...subCard(gold) }}>
                        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: ".05em" }}>The friendship week</span>
                        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "4px 0 0", lineHeight: 1.5 }}>“Who’s a friend you’ve drifted from — and might message this week?” A gentle thread across every room.</p>
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Structure sustains supportive communities. <L2Badge tier="+1" /></p>
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="local" label="Take it offline · local circles" Icon={MapPin} accent={plum}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><GatedBadge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>policy + safety review</span></div>
                      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>The loneliness evidence is strongest for <b>blended/in-person</b> connection — and it’s the biggest gap rivals leave. An opt-in “women near you who also love X want to meet” — coarse area only, public venues, a deliberate, consented exception to the no-location rule.</p>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, margin: "10px 2px 0", lineHeight: 1.5 }}><b>Gated.</b> A real product + safety + legal decision, not a quiet toggle. Shown as a stub.</p>
                    </Panel>,
                    <Panel key="audio" label="Live “gather” rooms" Icon={Mic} accent={crim}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><GatedBadge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>realtime audio infra</span></div>
                      <div style={{ ...subCard(crim), opacity: 0.97 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>Tonight · a menopause circle</div>
                        <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>Scheduled synchronous rooms · a Sunday wind-down · a Jess-hosted games night</div>
                      </div>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, margin: "10px 2px 0", lineHeight: 1.5 }}><b>Gated.</b> Needs realtime/audio infrastructure + live-speech moderation. Optional — shown as a stub.</p>
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "20px 0 0" }}><Pollinator kind="bee" size={30} color={gold} color2={cwOf("sage").tip} pattern="bands" animate idx="cl2-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 320, lineHeight: 1.55 }}>Safe, expert-anchored, whole-life — and the one space that gets you offline.</p>
        <div style={{ marginTop: 30 }}><EditorialFooter /></div>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
    </div>
  );
}
