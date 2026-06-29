// CommunityL2Demo — ADDITIVE demo of the approved "Community Level Up (+2)" plan.
// Renders the FULL CURRENT LIVE PAGE (the real <CommunityEliteShell/> — AgeGate, safety charter, the
// 3 boards Connection/The rooms/Together, Witness 1:1, sealed letters, QOTD, Echo wall, connection
// prefs/block, the full CommunityInner engine) AND THEN a clearly-divided "Level +2 — proposed
// additions" slider with the NET-NEW features. Nothing stripped. Gated features (moderated free-text
// DM · local/IRL bridge · live audio) are clearly-labelled "needs sign-off" stubs. Live /Community untouched.
//
// Plan source: src/components/founders/brandDocs/community-plan.html
import { useState, useMemo } from "react";
import {
  MessageCircle, Lock, Users, Heart, MapPin, Mic, Check, BadgeCheck, Filter, CalendarClock,
  HandHeart, Feather, MapPinOff,
} from "lucide-react";
import {
  PAPER_BG, T, SERIF, UI, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Pollinator } from "@/components/brand/flora";
import { OXBLOOD, subCard, focusPill, Panel, StackedCard, BoardBody, SliderArrows } from "@/components/brand/SliderKit";
// THE FULL CURRENT LIVE PAGE — every existing feature, nothing stripped.
import CommunityEliteShell from "@/components/community-elite/CommunityEliteShell";

const ELITE_MOTION = `.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}@media (prefers-reduced-motion:reduce){.fw-elite-press{transition:none}}`;

function GatedBadge() { return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: T.crimson, border: `1px solid ${T.crimson}`, borderRadius: 999, padding: "2px 8px" }}><Lock size={10} /> Needs sign-off</span>; }
function L2Badge({ tier = "+2" }) { const c = tier === "+1" ? cwOf("sage").petal : cwOf("plum").petal; return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: c, border: `1px solid ${c}`, borderRadius: 999, padding: "2px 7px" }}>Level {tier}</span>; }
function L2Divider({ page, tint }) {
  const c = tint || cwOf("crimson").petal;
  return (
    <div style={{ maxWidth: 460, margin: "10px auto 0", padding: "0 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 4px" }}>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: 0.6 }} />
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: c, whiteSpace: "nowrap" }}>✦ {page} · Level +2 — proposed additions ✦</span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: 0.6 }} />
      </div>
      <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "0 0 4px", lineHeight: 1.5 }}>Everything above is the <b>current live page</b> (Witness, rooms, QOTD, echo wall, sealed letters, prefs — nothing removed). Below is the <b>proposed +2 layer</b> of net-new features.</p>
    </div>
  );
}

export default function CommunityL2Demo() {
  useEditorialFonts();
  const [reaction, setReaction] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [muted, setMuted] = useState(["miscarriage"]);
  const ref = useMemo(() => ({ current: null }), []);
  const gold = T.gold, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal, steel = "#5F7E8E";

  return (
    <div style={{ position: "relative", overflowX: "clip" }}>
      <div style={{ position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom))", left: 12, zIndex: 50, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", background: gold, borderRadius: 999, padding: "5px 11px", boxShadow: "0 2px 10px rgba(58,44,26,.3)" }}>Community +2 · demo</div>

      {/* ── THE FULL CURRENT LIVE PAGE (AgeGate + all features, nothing stripped) ── */}
      <CommunityEliteShell />

      {/* ── THE +2 ADDITIONS (net-new) ── */}
      <L2Divider page="Community" tint={crim} />
      <div style={{ ...PAPER_BG, fontFamily: SERIF, color: T.ink, overflowX: "clip", paddingBottom: "calc(110px + env(safe-area-inset-bottom))" }}>
        <InkFilter />
        <style>{floraKeyframes}{ELITE_MOTION}</style>
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "8px 18px 0", position: "relative" }}>

          <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "6px 0 2px" }}>Built to the <b>UK Online Safety Act 2023</b> — illegal-content checks, easy reporting, a named accountable person, crisis-routing. <L2Badge /></p>

          <div ref={(el) => { ref.current = el; }} style={{ marginTop: 14, position: "relative" }}>
            <SliderArrows sliderRef={ref} />
            <ClipboardSlider hint="Slide the +2 additions →" accent={crim}>

              {/* +2 BOARD A — TRUST LAYER (net-new) */}
              <Clipboard title="Trust layer · NEW" sub="EXPERT-VERIFIED · AMA · NO POST UNANSWERED" accent={steel} flower="cosmos" idx="cb-trust" titleColor={OXBLOOD}>
                <BoardBody>
                  <StackedCard topAccent={steel} bottomAccent={crim}
                    top={[
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
                    ]}
                    bottom={[
                      <Panel key="firstresp" label="No post left unanswered" Icon={HandHeart} accent={crim}>
                        <div style={{ ...subCard(crim) }}>
                          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>3 sisters are waiting</div>
                          <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>Three posts haven’t had a reply yet. ~half of people don’t return if no one answers in 24h — so we make sure someone does.</p>
                        </div>
                        <button className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 12 }}><HandHeart size={15} /> Be the first warm voice</button>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>A gentle first-responder rota — an invitation, never a chore. <L2Badge tier="+1" /></p>
                      </Panel>,
                      <Panel key="match" label="Life-stage room matching" Icon={Users} accent={sage}>
                        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>Surfaces the rooms &amp; threads that match <b>your</b> season first — peri, TTC, postpartum, new-to-the-city — the way Resonance already finds “someone like you”.</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>{["Perimenopause", "TTC", "New city", "Postpartum"].map((t) => <span key={t} style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 11px" }}>{t}</span>)}</div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Relevance is foundational to return engagement. <L2Badge tier="+1" /></p>
                      </Panel>,
                    ]} />
                </BoardBody>
              </Clipboard>

              {/* +2 BOARD B — CONNECTION (net-new) */}
              <Clipboard title="Connection · +2" sub="MENTORSHIP · DM · YOUR SAFETY DIAL" accent={crim} flower="rose" idx="cb-conn" titleColor={OXBLOOD}>
                <BoardBody>
                  <StackedCard topAccent={crim} bottomAccent={plum}
                    top={[
                      <Panel key="mentor" label="Intergenerational mentorship" Icon={Users} accent={sage}>
                        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>A younger woman paired with one who’s “been through it” — peri, TTC, a new city. The dialogue women say is missing. <i>(On top of the live Witness 1:1 above.)</i></p>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[["want", "I’d like a mentor"], ["give", "I’ll mentor"]].map(([id, l]) => (
                            <button key={id} onClick={() => setMentor(id)} className="fw-elite-press" style={{ flex: 1, fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "10px 8px", borderRadius: 12, cursor: "pointer", border: `1px solid ${mentor === id ? sage : T.paperDeep}`, background: mentor === id ? `${sage}1A` : T.paper, color: mentor === id ? "#3f6b3f" : T.muted }}>{mentor === id && <Check size={13} style={{ verticalAlign: -2, marginRight: 4 }} />}{l}</button>
                          ))}
                        </div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>On the screened connection rails. <L2Badge tier="+1" /></p>
                      </Panel>,
                      <Panel key="dm" label="Free-text 1:1 thread" Icon={MessageCircle} accent={plum}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><GatedBadge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>moderated-delivery function</span></div>
                        <div style={{ ...subCard(plum) }}>
                          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>A real, ongoing conversation</div>
                          <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "4px 0 0", lineHeight: 1.5 }}>The natural graduation from Witness’s single reply — anonymous, server-moderated, private.</p>
                        </div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, lineHeight: 1.5, margin: "10px 2px 0" }}><b>Gated.</b> Needs one small safety function (today’s moderator only screens public posts/comments). Shown as a stub — not built.</p>
                      </Panel>,
                    ]}
                    bottom={[
                      <Panel key="mute" label="Your safety dial · mute keywords" Icon={Filter} accent={crim}>
                        <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "0 0 8px", lineHeight: 1.5 }}>Hide posts with words that are hard for you right now — you hold the dial on your own exposure.</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {muted.map((w) => <span key={w} style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: crim, background: `${crim}14`, border: `1px solid ${crim}`, borderRadius: 999, padding: "5px 11px" }}>{w} ✕</span>)}
                          <button onClick={() => setMuted((p) => p.includes("pregnancy") ? p : [...p, "pregnancy"])} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, background: T.paper, border: `1px dashed ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer" }}>+ add a word</button>
                        </div>
                        <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 10 }}><MapPinOff size={14} color={sage} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}>Never matched by location. Block or report anyone, anytime.</span></div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "8px 2px 0" }}><L2Badge /></p>
                      </Panel>,
                    ]} />
                </BoardBody>
              </Clipboard>

              {/* +2 BOARD C — TOGETHER (net-new) */}
              <Clipboard title="Together · +2" sub="REACTIONS · OFFLINE · LIVE" accent={sage} flower="clover" idx="cb-together" titleColor={OXBLOOD}>
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
                        <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>The loneliness evidence is strongest for <b>blended/in-person</b> connection — the biggest gap rivals leave. An opt-in “women near you who also love X want to meet” — coarse area only, public venues, a deliberate consented exception to the no-location rule.</p>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, margin: "10px 2px 0", lineHeight: 1.5 }}><b>Gated.</b> A real product + safety + legal decision. Shown as a stub.</p>
                      </Panel>,
                      <Panel key="audio" label="Live “gather” rooms" Icon={Mic} accent={crim}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><GatedBadge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>realtime audio infra</span></div>
                        <div style={{ ...subCard(crim) }}>
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
          <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 320, lineHeight: 1.55 }}>The full current circle, plus an expert anchor, a mentor, and a way offline — nothing dropped.</p>
          <div style={{ marginTop: 30 }}><EditorialFooter /></div>
        </div>
      </div>
    </div>
  );
}
