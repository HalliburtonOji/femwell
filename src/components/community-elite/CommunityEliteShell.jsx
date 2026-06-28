// CommunityEliteShell — the ELEVATED, LIVE /Community. Elite analogue of
// Planner/Nutrition/Lifestyle elite shells: AgeGate (18+) → FwFloraHero (oxblood) →
// SummaryCard → ClipboardSlider of StackedCard boards (top/bottom horizontal
// sub-sliders + gold hairline) → SliderArrows + a Jump-to. NOTHING stripped — every
// live surface is reachable: the dense room/feed/circle/club/games/wisdom/pool flows
// render the REAL <CommunityInner> engine in a full sheet; Echo is the real EchoWall;
// QOTD answers via the real answerQotd function; the comprehensive CommunityHubSheet
// switcher reaches them all.
//
// CONNECTION (Halli's approved rails, LIVE, NO new function):
//   • 18+ — the whole page sits behind the real <AgeGate>.
//   • NO location — matching is season/life-stage only (Witness dims); stated.
//   • BACKEND moderation — the live 1:1 = the real WITNESS service path
//     (postWitnessRequest/respondWitness: anonymous, server-gated, crisis-screened,
//     E2E, no location) surfaced here; + the sealed-letter pen-pal (real SealedLetters)
//     + "someone like you" resonance + connection PREFERENCES & BLOCK (new
//     ConnectionPref entity — real persistence).
//   • Block/report ride the existing surfaces' report paths.
//
// FLAGGED (see report / STATUS): a free-text, server-content-moderated, PRIVATE 1:1
// message THREAD cannot be built without a new/modified base44 function — screenContent
// is hardcoded to kind:'post'|'comment' (won't moderate a new Message entity) and
// createCommunityPost forces any non-whitelist room into the PUBLIC lounge (would leak
// a private thread). So the live 1:1 here is the existing Witness path; the richer
// free-text DM needs Halli's go-ahead on one small service function. No new function added.
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Mail, Lock, ShieldCheck, Users, Heart, Feather, Check, MapPinOff, HandHeart,
  Coffee, Sparkles, Star, Gamepad2, BookOpen, Library, Waves, Loader, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, FlowerGlyph, Bouquet } from "@/components/brand/flora";
import { OXBLOOD, lbl, subCard, focusPill, inputBase, Panel, StackedCard, BoardBody, SheetShell, JumpSheet, SliderArrows } from "@/components/brand/SliderKit";
import { getCurrentCyclePhase } from "@/utils/cyclePhase";
import { withTimeout } from "@/utils/safeEntity";
import AgeGate from "@/components/safety/AgeGate";
import { HubSheet } from "@/components/nutrition/hub/HubShell";
import EchoWall from "@/components/journal/echo/EchoWall";
import ShareAsEchoSheet from "@/components/journal/echo/ShareAsEchoSheet";
import CommunityHubSheet from "@/components/community/CommunityHubSheet";
import SealedLetterComposeSheet from "@/components/sealedLetters/SealedLetterComposeSheet";
import { ResonanceLive } from "@/components/growth/GrowthLive";
import { CommunityInner } from "@/pages/Community";
import { qotdForDay, presenceLine, crisisCheck } from "@/components/community/communityConfig";
import { communityHash, answeredQotd, markQotd } from "@/components/community/communityAnon";

const ELITE_MOTION = `
.fw-elite-in{animation:fwEliteIn .5s cubic-bezier(.215,.61,.355,1) both}
@keyframes fwEliteIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.fw-elite-in,.fw-elite-press{animation:none!important;transition:none!important}}`;

const PHASE_BLOOM = { menstrual: { bloom: "poppy", cw: "crimson" }, follicular: { bloom: "cosmos", cw: "sage" }, ovulatory: { bloom: "sunflower", cw: "gold" }, luteal: { bloom: "dahlia", cw: "plum" } };
const nowISO = () => new Date().toISOString();

// A door that opens a real surface (nothing stripped).
function Door({ Icon, name, desc, accent, onOpen }) {
  return (
    <button onClick={onOpen} className="fw-elite-press" style={{ textAlign: "left", cursor: "pointer", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 14, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} color={accent} strokeWidth={1.8} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{name}</span>
        <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, display: "block", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</span>
      </span>
    </button>
  );
}
function Stack({ children }) { return <div style={{ display: "flex", flexDirection: "column", gap: 9, height: "100%", overflowY: "auto" }}>{children}</div>; }

function CommunityEliteInner() {
  const navigate = useNavigate();
  const go = (p) => navigate(createPageUrl(p));
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState("");
  const sliderRef = useRef(null);

  // sheets
  const [jumpOpen, setJumpOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);   // the real comprehensive switcher
  const [fullOpen, setFullOpen] = useState(false);  // the full CommunityInner engine (rooms/feed/etc.)
  const [echoOpen, setEchoOpen] = useState(false);
  const [echoCompose, setEchoCompose] = useState(false);
  const [echoTick, setEchoTick] = useState(0);
  const [qotdOpen, setQotdOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);

  const qotd = useMemo(() => qotdForDay(), []);
  const [answered, setAnswered] = useState(false);
  const [prefs, setPrefs] = useState({ mode: "open", reach: "season", blocked_hashes: [] });
  const [prefRow, setPrefRow] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!alive) return;
      setUser(me);
      try { setAnswered(answeredQotd(qotd.day)); } catch { /* noop */ }
      if (me?.id) {
        const [prof, posts, prefRows] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: me.id }, "-created_date", 1).catch(() => []),
          base44.entities.CommunityPost.filter({ hidden: false }, "-created_date", 60).catch(() => []),
          base44.entities.ConnectionPref.filter({ user_id: me.id }, "-created_date", 1).catch(() => []),
        ]);
        if (!alive) return;
        setProfile(prof?.[0] || null);
        try {
          const since = Date.now() - 12 * 3600 * 1000;
          const active = new Set((posts || []).filter((p) => new Date(p.created_date).getTime() > since && p.author_hash).map((p) => p.author_hash));
          setPresence(presenceLine(active.size));
        } catch { setPresence(presenceLine(0)); }
        if (prefRows?.[0]) { setPrefRow(prefRows[0]); setPrefs({ mode: prefRows[0].mode || "open", reach: prefRows[0].reach || "season", blocked_hashes: prefRows[0].blocked_hashes || [] }); }
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [qotd.day]);

  const phaseKey = useMemo(() => { try { return getCurrentCyclePhase(profile)?.phase || null; } catch { return null; } }, [profile]);
  const ph = PHASE_BLOOM[phaseKey] || { bloom: "cosmos", cw: "sage" };

  // QOTD answer → real answerQotd function (crisis-gated, anonymous, server-moderated)
  const [qDraft, setQDraft] = useState("");
  const [qBusy, setQBusy] = useState(false);
  const submitQotd = async () => {
    const body = qDraft.trim(); if (!body || qBusy) return;
    if (crisisCheck(body)) { go("Community"); return; }   // crisis → the real Community crisis flow
    setQBusy(true);
    try {
      const author_hash = await communityHash();
      await withTimeout(base44.functions.invoke("answerQotd", { user_id: user?.id, author_hash, prompt_day: qotd.day, prompt_key: qotd.key, body }), 8000, "qotd");
      try { markQotd(qotd.day); } catch { /* noop */ }
      setAnswered(true); setQotdOpen(false); setQDraft("");
    } catch { setAnswered(true); setQotdOpen(false); } finally { setQBusy(false); }
  };

  // Connection prefs → real ConnectionPref persistence (optimistic + persist)
  const savePrefs = async (next) => {
    setPrefs(next);
    if (!user?.id) return;
    try {
      if (prefRow?.id) await withTimeout(base44.entities.ConnectionPref.update(prefRow.id, { ...next, updated_at: nowISO() }), 6000, "pref");
      else { const created = await withTimeout(base44.entities.ConnectionPref.create({ user_id: user.id, ...next, created_at: nowISO(), updated_at: nowISO() }), 6000, "pref"); setPrefRow(created); }
    } catch { /* optimistic stays */ }
  };

  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crimson = cwOf("crimson").petal, plum = cwOf("plum").petal;
  const boards = ["Connection", "The rooms", "Together"];
  const jumpTo = (i) => { const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return; const kids = [...track.children].filter((c) => c.offsetWidth > 40); if (kids[i]) track.scrollLeft = kids[i].offsetLeft - track.offsetLeft; };

  if (loading) {
    return <div style={{ ...PAPER_BG, minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ display: "grid", placeItems: "center", gap: 12, color: T.muted }}>
        <Loader size={26} color={gold} style={{ animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16 }}>Gathering the circle…</span>
      </div></div>;
  }

  const ROOMS = [
    { key: "lounge", name: "The Lounge", desc: "Vent, spill it, be heard.", Icon: Coffee, accent: gold },
    { key: "love", name: "Love & Relationships", desc: "Dating, friendship, marriage.", Icon: Heart, accent: crimson },
    { key: "money", name: "Money & Work", desc: "Careers, pay, pensions.", Icon: Star, accent: sage },
    { key: "style", name: "Style & Self", desc: "Fashion as confidence.", Icon: Sparkles, accent: plum },
    { key: "lighter", name: "The Lighter Side", desc: "Fun, telly, the stars.", Icon: Gamepad2, accent: gold },
    { key: "health", name: "Health", desc: "The clinical room — NHS-grounded.", Icon: ShieldCheck, accent: "#5F7E8E" },
  ];

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      {/* top-left Jump-to + top-right "all surfaces" (the real comprehensive switcher) */}
      <button onClick={() => setJumpOpen(true)} className="fw-elite-press" style={{ position: "fixed", top: "calc(env(safe-area-inset-top,0px) + 10px)", left: 12, zIndex: 45, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft, boxShadow: "0 2px 12px rgba(58,44,26,0.18)", cursor: "pointer" }}><Users size={13} color={gold} /> Jump to</button>
      <button onClick={() => setHubOpen(true)} className="fw-elite-press" style={{ position: "fixed", top: "calc(env(safe-area-inset-top,0px) + 10px)", right: 12, zIndex: 45, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft, boxShadow: "0 2px 12px rgba(58,44,26,0.18)", cursor: "pointer" }}>All surfaces</button>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        <FwFloraHero title="Community" colorway={ph.cw} bloom={ph.bloom} flankL="clover" flankR="sunflower" titleColor={OXBLOOD} creature="bee"
          line="You're among women like you — rooms for every part of life, and gentle, screened, anonymous connection." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 2 }}>
          <Bouquet items={[{ form: ph.bloom, colorway: ph.cw }, { form: "cosmos", colorway: "sage" }, { form: "clover", colorway: "gold" }]} size={148} animate idx="cmty-bq" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 8px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: cwOf(ph.cw).petal }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{presence || "You're not alone here"}</span>
        </div>

        {/* safety charter — rails, always visible */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 12 }}>
          {[["18+ only", ShieldCheck], ["No location", MapPinOff], ["Checked before it's sent", Lock], ["Anonymous · block anytime", Users]].map(([t, Icon]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px" }}><Icon size={13} color={sage} /> {t}</span>
          ))}
        </div>

        <SummaryCard eyebrow="In the circle today" accent={gold} rows={[
          { Icon: Feather, label: "Question of the day", text: qotd?.prompt || "Answer today's question.", onClick: () => setQotdOpen(true) },
          { Icon: HandHeart, label: "Talk it out · Witness", text: "Be held by one matched sister — anonymous, no location.", onClick: () => go("Journal") },
          { Icon: Coffee, label: "The rooms", text: "Every part of life has a room — vent, ask, laugh.", onClick: () => jumpTo(1) },
        ]} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setQotdOpen(true)} className="fw-elite-press" style={focusPill(crimson)}><Feather size={16} /> {answered ? "You answered" : "Answer the day"}</button>
          <button onClick={() => setFullOpen(true)} className="fw-elite-press" style={focusPill(plum)}><MessageCircle size={16} /> Open the rooms</button>
        </div>

        <div ref={sliderRef} style={{ position: "relative", marginTop: 16 }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide through the circle →" accent={gold}>

            {/* BOARD 1 — CONNECTION */}
            <Clipboard title="Connection" sub="GENTLE · SCREENED · YOUR CHOICE" accent={crimson} flower="rose" idx="cb-conn" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crimson} bottomAccent={plum}
                  top={[
                    <Panel key="witness" label="Talk it out · 1:1" Icon={HandHeart} accent={crimson}><Stack>
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>The live, anonymous 1:1: hand one hard moment to a woman in your season. <b>Matched by season — never location.</b> Crisis-screened, encrypted, one gentle reply. She never learns who you are.</p>
                      <Door Icon={HandHeart} name="Open Witness" desc="Anonymous · moderated · no location" accent={crimson} onOpen={() => navigate(createPageUrl("Journal") + "?open=witness")} />
                      <div style={{ ...subCard(plum), fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}><b>Richer free-text DMs</b> are designed + held for one small safety decision (a moderated-delivery function) — see the report. Witness is the live 1:1 today.</div>
                    </Stack></Panel>,
                    <Panel key="reso" label="Someone like you" Icon={Heart} accent={sage}><Stack><ResonanceLive wide /></Stack></Panel>,
                  ]}
                  bottom={[
                    <Panel key="penpal" label="Sealed-letter pen-pal" Icon={Mail} accent={plum}><Stack>
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>Write a slow, anonymous letter to your future self or a woman like you — sealed, then opened when the time's right.</p>
                      <Door Icon={Feather} name="Write a sealed letter" desc="Slow · private · yours" accent={plum} onOpen={() => setLetterOpen(true)} />
                    </Stack></Panel>,
                    <Panel key="prefs" label="How you want to connect" Icon={SlidersHorizontal} accent={crimson}><Stack>
                      <div style={{ ...lbl, color: crimson }}>I'm open to</div>
                      {[["open", "Messages + letters"], ["letters", "Sealed letters only"], ["paused", "Paused for now"]].map(([v, l]) => (
                        <button key={v} onClick={() => savePrefs({ ...prefs, mode: v })} style={{ textAlign: "left", background: prefs.mode === v ? `${crimson}14` : T.paper, border: `1px solid ${prefs.mode === v ? crimson : T.paperDeep}`, borderRadius: 11, padding: "9px 12px", cursor: "pointer", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "flex", justifyContent: "space-between", alignItems: "center" }}>{l}{prefs.mode === v && <Check size={15} color={crimson} />}</button>
                      ))}
                      <div style={{ ...lbl, color: crimson, marginTop: 4 }}>Who can reach me</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {[["season", "my season"], ["stage", "my life-stage"], ["any", "any woman 18+"]].map(([v, l]) => (
                          <button key={v} onClick={() => savePrefs({ ...prefs, reach: v })} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "6px 11px", borderRadius: 999, background: prefs.reach === v ? `${crimson}1F` : T.paper, border: `1px solid ${prefs.reach === v ? crimson : T.paperDeep}`, color: prefs.reach === v ? crimson : T.inkSoft, cursor: "pointer" }}>{l}</button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 4 }}><MapPinOff size={14} color={sage} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Never by location. Block or report anyone, anytime ({(prefs.blocked_hashes || []).length} blocked).</span></div>
                    </Stack></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 2 — THE ROOMS */}
            <Clipboard title="The rooms" sub="EVERY PART OF LIFE · QOTD · ECHO" accent={gold} flower="sunflower" idx="cb-rooms" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent="#5F7E8E"
                  top={[
                    <Panel key="qotd" label="Question of the day" Icon={Feather} accent={gold}><Stack>
                      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4, margin: 0 }}>{qotd?.prompt}</p>
                      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: 0 }}>Answer anonymously alongside everyone. A line is plenty. Crisis-checked + moderated.</p>
                      {answered ? <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f", display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> You answered today</span>
                        : <Door Icon={Feather} name="Answer today's question" desc="Anonymous · a line is plenty" accent={gold} onOpen={() => setQotdOpen(true)} />}
                    </Stack></Panel>,
                    <Panel key="echo" label="Echo wall" Icon={Waves} accent="#5F7E8E"><Stack>
                      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>Leave a line that fades in 48 hours — say it, let it go. Kind reactions only.</p>
                      <Door Icon={Feather} name="Leave an echo" desc="Anonymous · ephemeral" accent="#5F7E8E" onOpen={() => setEchoCompose(true)} />
                      <Door Icon={Waves} name="Read the wall" desc="Today's echoes, cooling" accent="#5F7E8E" onOpen={() => setEchoOpen(true)} />
                    </Stack></Panel>,
                  ]}
                  bottom={[
                    <Panel key="rooms" label="Whole-life rooms" Icon={Coffee} accent={gold}><Stack>
                      {ROOMS.slice(0, 3).map((r) => <Door key={r.key} {...r} onOpen={() => setFullOpen(true)} />)}
                    </Stack></Panel>,
                    <Panel key="rooms2" label="More rooms" Icon={Sparkles} accent={plum}><Stack>
                      {ROOMS.slice(3).map((r) => <Door key={r.key} {...r} onOpen={() => setFullOpen(true)} />)}
                      <Door Icon={Users} name="All rooms & feeds" desc="Open the full community" accent={gold} onOpen={() => setFullOpen(true)} />
                    </Stack></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* BOARD 3 — TOGETHER */}
            <Clipboard title="Together" sub="CIRCLES · CLUBS · GAMES · RITUALS" accent={sage} flower="lavender" idx="cb-together" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={plum}
                  top={[
                    <Panel key="t1" label="Gather" Icon={Users} accent={sage}><Stack>
                      <Door Icon={Users} name="Circles" desc="Rooms by what you love." accent={sage} onOpen={() => setHubOpen(true)} />
                      <Door Icon={Library} name="The Library" desc="Read together — a book club." accent="#5F7E8E" onOpen={() => setHubOpen(true)} />
                      <Door Icon={Gamepad2} name="The Games Room" desc="Jess's nightly round." accent={gold} onOpen={() => setHubOpen(true)} />
                    </Stack></Panel>,
                  ]}
                  bottom={[
                    <Panel key="t2" label="Rituals" Icon={Heart} accent={plum}><Stack>
                      <Door Icon={BookOpen} name="What the room knows" desc="The living wisdom collection." accent={plum} onOpen={() => setHubOpen(true)} />
                      <Door Icon={HandHeart} name="Together this week" desc="The collective pool — no scores." accent={crimson} onOpen={() => setHubOpen(true)} />
                      <Door Icon={Feather} name="Close the week" desc="A shared Sunday reflection." accent={sage} onOpen={() => setHubOpen(true)} />
                    </Stack></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>
          </ClipboardSlider>
        </div>
      </div>

      {/* ── sheets ── */}
      {jumpOpen && <JumpSheet boards={boards} onClose={() => setJumpOpen(false)} onJump={(i) => { setJumpOpen(false); jumpTo(i); }} />}
      {hubOpen && <CommunityHubSheet open onClose={() => setHubOpen(false)} onSelect={() => { setHubOpen(false); setFullOpen(true); }} />}

      {/* the full real engine — every room/circle/club/game/wisdom/pool flow, nothing stripped */}
      {fullOpen && (
        <HubSheet title="The community" onClose={() => setFullOpen(false)}>
          <CommunityInner />
        </HubSheet>
      )}

      {qotdOpen && (
        <SheetShell title="Question of the day" eyebrowText="A line is plenty…" accent={gold} onClose={() => setQotdOpen(false)}>
          {answered ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}><FlowerGlyph variant="sunflower" size={46} color={gold} idx="qd" /><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.ink, marginTop: 10 }}>You've answered today.</p></div>
          ) : (<>
            <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{qotd?.prompt}</p>
            <textarea value={qDraft} onChange={(e) => setQDraft(e.target.value)} rows={3} placeholder="A line is plenty…" style={{ ...inputBase, resize: "vertical", marginTop: 8 }} />
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "8px 0 0" }}>Anonymous. Crisis-checked + moderated before it appears.</p>
            <button onClick={submitQotd} disabled={!qDraft.trim() || qBusy} style={{ width: "100%", marginTop: 12, background: qDraft.trim() ? gold : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: qDraft.trim() ? "pointer" : "default" }}>{qBusy ? "Sending…" : "Add my answer"}</button>
          </>)}
        </SheetShell>
      )}

      {echoOpen && <HubSheet title="Echo wall" onClose={() => setEchoOpen(false)}><div key={echoTick}><EchoWall user={user} profile={profile} /></div></HubSheet>}
      {echoCompose && <ShareAsEchoSheet user={user} profile={profile} onClose={() => setEchoCompose(false)} onPosted={() => { setEchoCompose(false); setEchoTick((t) => t + 1); setEchoOpen(true); }} />}
      {letterOpen && <SealedLetterComposeSheet open onClose={() => setLetterOpen(false)} onSealed={() => setLetterOpen(false)} />}
    </div>
  );
}

// 18+ gate wraps the whole page (matches live CommunityHub). One-line revert: in
// pages.config map "Community" back to CommunityHub.
export default function CommunityEliteShell() {
  const navigate = useNavigate();
  return (
    <AgeGate surfaceName="the Community" onDecline={() => navigate(createPageUrl("Today"))}>
      <CommunityEliteInner />
    </AgeGate>
  );
}
