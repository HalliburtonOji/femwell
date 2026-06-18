// GardenDemo — a redesign DEMO of the Garden page. PREVIEW route only (/GardenDemo). LIVE /Garden
// UNTOUCHED. Conforms to BRAND_IDENTITY.md (Garden = the FULL palette; the companion's REAL bloom leads).
//
// DISTINCT FORM (an IMMERSIVE ILLUSTRATED SCENE — not a slider/grid/list): a full-bleed garden scene
// (sky + ground, the companion's real bloom centre-stage, life-area plants along the ground, a drifting
// butterfly), then stacked editorial PANELS for the rituals (tend · leave a line · name her) and slim
// rows for what's growing / plant / share. Brand held constant.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { floraKeyframes, RichBloomV2, FlowerGlyph, Butterfly, VineMotifV2, LeafDivider, lighten } from "@/components/brand/flora";
import { FORM_LIST, getCompanion, tendCompanion, tendedToday, loadCompanionState, renameCompanion } from "@/components/nurture/companion";
import { Loader, JumpPill, JumpSheet, DoneRow, btnStyle, DEMO_CSS, CLAMP, todayKey, withTimeout } from "@/components/demos/demoKit";
import { Feather, PenLine, Wand2, Activity, Users, Sprout, Leaf, Send, ChevronRight } from "lucide-react";

const COL = 460;
const PEONY = FORM_LIST.find((f) => f.key === "peony") || { key: "peony" };
const countSince = (rows, days, field) => { const cut = Date.now() - days * 86400000; return (rows || []).filter((r) => { const d = r?.[field] || r?.date || r?.created_date || r?.day_key; const t = d ? new Date(d).getTime() : 0; return t && t >= cut; }).length; };

// life-area "plants" growing along the ground — the whole-life spread, each its own colourway.
const GROUND = [
  { v: "rose", c: "#E8B4B8", c2: "#F4D9DC", x: "12%", s: 44 },
  { v: "sunflower", c: "#D4AF37", c2: "#E8CE78", x: "30%", s: 40 },
  { v: "iris", c: "#8E6E8E", c2: "#B196B1", x: "70%", s: 42 },
  { v: "lavender", c: "#B6A6C9", c2: "#D4C9E2", x: "86%", s: 38 },
];

const SECTIONS = [
  { key: "scene", label: "Your garden", Icon: Sprout, accent: "#8FAF8F" },
  { key: "tend", label: "Tend & reflect", Icon: Feather, accent: "#E8B4B8" },
  { key: "growing", label: "What's growing", Icon: Activity, accent: "#A8893F" },
  { key: "share", label: "Plant & share", Icon: Users, accent: "#BC2E27" },
];

export default function GardenDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [cName, setCName] = useState(null);
  const [act, setAct] = useState({});
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [justTended, setJustTended] = useState(false);
  const refs = { scene: useRef(null), tend: useRef(null), growing: useRef(null), share: useRef(null) };

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me()); const id = me?.id || null; if (!alive) return; setUid(id);
      if (id) { await loadCompanionState(id).catch(() => {}); try { const c = getCompanion(id); setCompanion(c); setCName(c?.name || null); } catch { /* ignore */ } }
      setLoading(false);
      if (id) {
        withTimeout(base44.entities.JournalEntries.filter({ user_id: id }, "-created_date", 60)).then((r) => { if (alive) setAct((a) => ({ ...a, journal: countSince(r, 7, "created_date") })); }).catch(() => {});
        withTimeout(base44.entities.DailyCheckins.filter({ user_id: id }, "-date", 60)).then((r) => { if (alive) setAct((a) => ({ ...a, checkins: countSince(r, 7, "date") })); }).catch(() => {});
        withTimeout(base44.entities.MealLog.filter({ user_id: id }, "-date", 60)).then((r) => { if (alive) setAct((a) => ({ ...a, meals: countSince(r, 7, "date") })); }).catch(() => {});
      }
    })();
    return () => { alive = false; };
  }, []);

  const cForm = useMemo(() => FORM_LIST.find((f) => f.key === (companion?.form?.key || companion?.form)) || PEONY, [companion]);
  const cAccent = companion?.accent || T.blush;
  const name = cName || companion?.name || "your companion";
  const displayName = name === "your companion" ? "Your garden" : name;
  const tended = tendedToday(uid);
  const fed = (act.journal || 0) + (act.checkins || 0) + (act.meals || 0);

  const tend = (note) => { setJustTended(true); setTimeout(() => setJustTended(false), 2200); try { if (uid) tendCompanion(uid, note || "Tended from the garden"); } catch { /* ignore */ } };
  const jumpTo = (k) => { setJumpOpen(false); refs[k]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <JumpPill onClick={() => setJumpOpen(true)} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "22px 4px 10px" }}>
          <Heart size={16} /><Eyebrow color={T.muted}>Everything you tend, grows</Eyebrow>
        </div>

        {/* THE SCENE */}
        <div ref={refs.scene} style={{ position: "relative", height: 320, borderRadius: 24, overflow: "hidden", border: `1px solid ${T.paperDeep}`, boxShadow: "0 8px 30px rgba(58,44,26,0.16)", background: "linear-gradient(180deg, #F6F1E4 0%, #EFEBDA 52%, #E3E8D6 100%)", scrollMarginTop: 70 }}>
          {/* faint corner vines */}
          <div style={{ position: "absolute", top: -6, left: -10, opacity: 0.5 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.5} w={110} /></div>
          <div style={{ position: "absolute", top: -6, right: -10, opacity: 0.5 }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.5} w={110} flip /></div>
          {/* soft ground */}
          <div aria-hidden style={{ position: "absolute", left: -20, right: -20, bottom: -40, height: 150, background: "radial-gradient(ellipse at 50% 100%, rgba(143,175,143,0.45), rgba(143,175,143,0) 70%)" }} />
          <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 44, height: 1, background: T.paperDeep, opacity: 0.5 }} />
          {/* butterfly */}
          <div style={{ position: "absolute", top: 30, right: 54 }}><Butterfly size={46} color={cAccent} color2={T.gold} pattern="spots" idx="gd-bf" /></div>
          {/* the companion bloom, centre stage */}
          <div style={{ position: "absolute", left: "50%", bottom: 30, transform: "translateX(-50%)" }}>
            <RichBloomV2 form={cForm?.key || "peony"} color={cAccent} color2={lighten(cAccent, 0.34)} accent={T.gold} size={172} animate soft idx="gd-hero" />
          </div>
          {/* life-area plants along the ground */}
          {GROUND.map((g) => (
            <div key={g.v} style={{ position: "absolute", bottom: 30, left: g.x, transform: "translateX(-50%)" }}>
              <FlowerGlyph variant={g.v} size={g.s} color={g.c} color2={g.c2} idx={`gd-grd-${g.v}`} />
            </div>
          ))}
          {/* name plate */}
          <div style={{ position: "absolute", left: 16, bottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Heart size={16} />
            <Script size={34} color={T.ink}>{displayName}</Script>
          </div>
          <span style={{ position: "absolute", right: 14, bottom: 16, fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: tended ? T.sage : cAccent, borderRadius: 999, padding: "4px 11px" }}>{tended ? "Tended today" : "Waiting for you"}</span>
        </div>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "12px 4px 6px", lineHeight: 1.5 }}>
          A portrait of the life you're already living — your companion at the centre, and a plant for each corner of it you tend. No extra to-do list.
        </Hand>

        {/* TEND & REFLECT — stacked panels */}
        <SectionHead refEl={refs.tend} eyebrow="A small ritual" title="Tend & reflect" accent={cAccent} flower="rose" />
        <Panel accent={cAccent} title={`Tend ${name === "your companion" ? "her" : name}`} Icon={Feather}>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{tended ? "You've tended her today — she's a little more open for it." : "A small act of showing up for yourself. One tap."}</p>
          <TendAction accent={cAccent} onTend={tend} />
        </Panel>
        <Panel accent={T.gold} title="Leave a line" Icon={PenLine}>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Not a journal entry to keep forever — just a line, named honestly. It counts as tending.</p>
          <LineAction accent={T.gold} uid={uid} onTend={tend} />
        </Panel>
        <Panel accent={T.blush} title="Name & shape her" Icon={Wand2}>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{name === "your companion" ? "She's unnamed for now — give her a name that means something." : `She's called ${name}. Rename her any time.`}</p>
          <RenameAction accent={T.blush} uid={uid} onRenamed={setCName} />
        </Panel>

        {/* WHAT'S GROWING */}
        <SectionHead refEl={refs.growing} eyebrow="What's feeding it" title="What's growing" accent={T.gold} flower="sunflower" />
        <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.sage}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 16, padding: "15px 16px" }}>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>
            {fed > 0 ? `This week your garden's been fed by ${[act.journal && `${act.journal} journal note${act.journal === 1 ? "" : "s"}`, act.checkins && `${act.checkins} check-in${act.checkins === 1 ? "" : "s"}`, act.meals && `${act.meals} logged meal${act.meals === 1 ? "" : "s"}`].filter(Boolean).join(", ")}. Each one planted something.` : "She grows from everything you already do — a note, a meal logged, a check-in. Nothing extra required."}
          </p>
          <a href="/Garden" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.sage, textDecoration: "none" }}>See your full garden <ChevronRight size={14} /></a>
        </div>

        {/* PLANT & SHARE — slim rows */}
        <SectionHead refEl={refs.share} eyebrow="Grow it further" title="Plant & share" accent={T.crimson} flower="cornflower" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <LinkRow href="/ProgramsHub" accent={T.sage} Icon={Leaf} label="Plant something new" sub="Start a short programme — a new corner takes root" />
          <LinkRow href="/Community" accent={T.crimson} Icon={Users} label="A garden of gardens" sub="Step into the community — anonymous and warm" />
          <LinkRow href="/Garden" accent="#8E6E8E" Icon={Sprout} label="Your milestones" sub="Rare blooms and visitors you've earned" />
        </div>
        <LeafDivider color={T.gold} my={26} />
      </div>

      {justTended && (
        <div className="fw-fade" style={{ position: "fixed", left: "50%", bottom: 96, transform: "translateX(-50%)", zIndex: 400, display: "inline-flex", alignItems: "center", gap: 7, background: T.sage, color: "#fff", borderRadius: 999, padding: "9px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, animation: "fwFadeUp .3s ease both" }}>
          <Leaf size={14} /> {name} felt that
        </div>
      )}

      {jumpOpen && <JumpSheet sections={SECTIONS} onClose={() => setJumpOpen(false)} onPick={(k) => jumpTo(k)} />}
    </div>
  );
}

function SectionHead({ refEl, eyebrow, title, accent, flower }) {
  return (
    <div ref={refEl} style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 12px", scrollMarginTop: 70 }}>
      <FlowerGlyph variant={flower || "rose"} size={30} color={accent} idx={`sh-${title}`} />
      <div style={{ minWidth: 0 }}>
        <Eyebrow color={accent}>{eyebrow}</Eyebrow>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.2, display: "block" }}>{title}</span>
      </div>
      <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.7, marginLeft: 6 }} />
    </div>
  );
}
function Panel({ accent, title, Icon, children }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}10 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 16, padding: "15px 16px", marginBottom: 12, boxShadow: "0 2px 12px rgba(58,44,26,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Icon size={15} color={accent} /></span>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>{title}</span>
      </div>
      {children}
    </div>
  );
}
function LinkRow({ href, accent, Icon, label, sub }) {
  return (
    <a href={href} style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 14, padding: "13px 15px", textDecoration: "none" }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={17} color={accent} /></span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, ...CLAMP(1) }}>{label}</span>
        <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, ...CLAMP(1) }}>{sub}</span>
      </span>
      <ChevronRight size={16} color={T.muted} style={{ flexShrink: 0 }} />
    </a>
  );
}

function TendAction({ accent, onTend }) {
  const [done, setDone] = useState(false);
  const fire = () => { if (done) return; setDone(true); onTend && onTend("Tended from the garden"); };
  if (done) return <DoneRow accent={accent} label="Tended. She's a little more open." />;
  return <button onClick={fire} style={btnStyle(accent)}><Feather size={15} /> Tend her</button>;
}
function LineAction({ accent, uid, onTend }) {
  const [text, setText] = useState(""); const [done, setDone] = useState(false);
  const can = text.trim().length > 0 && !done;
  const post = () => { if (!can) return; setDone(true); onTend && onTend("Left a line in the garden"); if (uid) base44.entities.JournalEntries.create({ user_id: uid, session_date: todayKey(), text: text.trim(), tags: ["tend"], prompt: "A line, from the garden", card_type: "free", card_color: "cream" }).catch(() => {}); };
  if (done) return <DoneRow accent={accent} label="Kept, and felt. She grew a little." />;
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={400} placeholder="Today I feel…" style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={post} disabled={!can} style={btnStyle(accent, !can)}><Send size={15} /> Leave it</button>
    </div>
  );
}
function RenameAction({ accent, uid, onRenamed }) {
  const [text, setText] = useState(""); const [done, setDone] = useState(false);
  const can = text.trim().length > 0 && !done;
  const save = () => { if (!can) return; setDone(true); const v = text.trim().slice(0, 40); try { if (uid) renameCompanion(uid, v); } catch { /* ignore */ } onRenamed && onRenamed(v); };
  if (done) return <DoneRow accent={accent} label={`${text.trim().slice(0, 40)} — she suits it.`} />;
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={40} placeholder="A name for her…" style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={save} disabled={!can} style={btnStyle(accent, !can)}><Wand2 size={15} /> Save her name</button>
    </div>
  );
}
