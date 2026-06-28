// ProgramsEliteShell — the ELEVATED, FULLY-WIRED Programs page (guided journeys / courses). The Programs
// analogue of PlannerEliteShell / NutritionEliteShell / PulseEliteShell: self-loads real base44 entities on
// mount, keeps EVERY live feature, and routes every CTA to the real ProgramDay/ProgramDetail/Upgrade flow.
//
// Craft elevated ~3 levels: lush flora hero (phase bloom + bouquet + resting butterfly), OXBLOOD script
// headings, the full card language (two stacked horizontal sub-sliders per board + gold hairline divider +
// board ‹ › arrows + colour pills + accent-rim sub-cards), TopChrome (jump-to + calendar), reduced-motion-safe.
//
// REAL DATA (reads, same entities as live ProgramsHub — NO new base44 function):
//   Programs · UserPrograms · ProgramDays · ProgramTasks · Entitlements · UserProfile.
// REAL WRITES (existing UserPrograms entity, optimistic-then-persist): start a journey (enrol) · set a
//   reminder time on an active journey. Everything else navigates to the real ProgramDay / ProgramDetail.
//
// FEATURE PARITY (nothing stripped): Continue active (progress + reminder) · other-active · Featured "start
// here" · For-your-phase recommendations · curated collections (by need) · Browse-all + search + sort ·
// program cards (thumb · meta days/audio/read · tier badge Free/Plus + Lock · progress · enrol/continue) ·
// program-detail popup → day-by-day list (done/today/upcoming) → start/continue/unlock.

import { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Play, Clock, BookOpen, Headphones, Lock, Search, Sparkles, Activity,
  ChevronRight, CalendarDays, Star, Check, X, Bell, Compass, Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI, SCRIPT, PAPER_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard, CardDeck } from "@/components/brand/ClipboardSlider";
import { RichBloomV2, cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import { getCurrentCyclePhase, phaseLabel } from "@/utils/cyclePhase";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import {
  OXBLOOD, lbl, subCard, focusPill, Panel, StackedCard, BoardBody, TopChrome,
  JumpSheet, SliderArrows, makeCalendarOverlay,
} from "@/components/brand/SliderKit";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);

const ELITE_MOTION = `
@keyframes fwEliteIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
.fw-elite-in { animation: fwEliteIn .5s cubic-bezier(.4,0,.2,1) both; }
.fw-elite-press { transition: transform .12s ease; }
.fw-elite-press:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce){ .fw-elite-in{ animation:none } .fw-elite-press{ transition:none } }
`;

const PHASE_BLOOM = {
  menstrual: { bloom: "poppy", cw: "crimson", hue: "#BC2E27" },
  follicular: { bloom: "snowdrop", cw: "sage", hue: "#8FAF8F" },
  ovulatory: { bloom: "sunflower", cw: "gold", hue: "#D4AF37" },
  luteal: { bloom: "dahlia", cw: "plum", hue: "#8E6E8E" },
};
const phaseMeta = (key) => PHASE_BLOOM[key] || PHASE_BLOOM.follicular;
const TIER_ORDER = { free: 0, plus: 1, pro: 2 };
const BOARDS = [
  { t: "Continue", sub: "Pick up where you left off" },
  { t: "For you", sub: "Phase picks & collections" },
  { t: "Browse all", sub: "Every journey" },
];
// a flower per program category/need so each thumbnail reads distinct (from the flora library)
const CAT_FLOWER = { sleep: ["violet", "plum"], stress: ["lavender", "plum"], calm: ["lavender", "plum"], pms: ["anemone", "crimson"], cramps: ["anemone", "crimson"], luteal: ["iris", "plum"], hormone: ["cosmos", "sage"], cycle: ["cosmos", "sage"], menopause: ["sunflower", "gold"], postpartum: ["clover", "sage"], recovery: ["clover", "sage"], mobility: ["sunflower", "gold"], energy: ["sunflower", "gold"], movement: ["clover", "sage"] };
function flowerFor(p) {
  const hay = `${p.category || ""} ${p.need_tags || ""} ${(p.goal_tags || []).join(" ")}`.toLowerCase();
  for (const k of Object.keys(CAT_FLOWER)) if (hay.includes(k)) return CAT_FLOWER[k];
  return ["cosmos", "plum"];
}
const COLLECTIONS = [
  { title: "Sleep & calm", tags: ["sleep", "stress", "calm"], cw: "plum", flower: "violet" },
  { title: "Hormone support", tags: ["hormone", "cycle", "menopause"], cw: "gold", flower: "cosmos" },
  { title: "PMS relief", tags: ["pms", "cramps", "luteal"], cw: "crimson", flower: "anemone" },
  { title: "Postpartum reset", tags: ["postpartum", "recovery"], cw: "sage", flower: "clover" },
  { title: "Mobility & energy", tags: ["mobility", "energy", "movement"], cw: "gold", flower: "sunflower" },
];

export default function ProgramsEliteShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [ups, setUps] = useState([]);            // UserPrograms (enrolments)
  const [days, setDays] = useState([]);          // ProgramDays
  const [tasks, setTasks] = useState([]);        // ProgramTasks
  const [userPlan, setUserPlan] = useState("free");
  // controls
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recommended");
  const [need, setNeed] = useState(null);
  const [detail, setDetail] = useState(null);    // a tapped program → the detail sheet
  // chrome
  const [jumpOpen, setJumpOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me(); if (!alive) return; setUser(u);
        const [progs, upRows, ents, pDays, pTasks, profs] = await Promise.all([
          base44.entities.Programs.list("-created_date", 50).catch(() => []),
          base44.entities.UserPrograms.filter({ user_id: u.id }).catch(() => []),
          base44.entities.Entitlements.filter({ user_id: u.id }).catch(() => []),
          base44.entities.ProgramDays.list("day_number", 250).catch(() => []),
          base44.entities.ProgramTasks.list("order_index", 500).catch(() => []),
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        ]);
        if (!alive) return;
        setPrograms(progs || []);
        setUps(upRows || []);
        setDays(pDays || []);
        setTasks(pTasks || []);
        setProfile(profs?.[0] || null);
        if (ents?.[0]) setUserPlan(ents[0].plan || "free");
      } catch (err) {
        console.error("Programs elite init failed:", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const phaseKey = useMemo(() => { try { return getCurrentCyclePhase(profile); } catch { return null; } }, [profile]);
  const ph = phaseMeta(phaseKey);
  const gold = T.gold, sage = cwOf("sage").petal, plum = cwOf("plum").petal, crim = T.crimson;

  // ── derived (ported from live ProgramsHub) ──
  const isLocked = (p) => (TIER_ORDER[p?.access_tier] || 0) > (TIER_ORDER[userPlan] || 0);
  const upFor = (programId) => ups.find((e) => e.program_id === programId);
  const daysOf = (key) => days.filter((d) => d.program_key === key).sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
  const tasksOf = (key) => tasks.filter((t) => t.program_key === key);
  const metaOf = (key) => {
    const pt = tasksOf(key);
    return { sessions: pt.filter((t) => t.content_key).length, videos: pt.filter((t) => t.external_url).length, readUps: pt.filter((t) => t.task_type === "READ").length, dayCount: daysOf(key).length };
  };
  const totalDays = (p) => metaOf(p.program_key).dayCount || p.duration_days || 1;
  const progressOf = (p, up) => { if (!up) return 0; if (up.status === "completed") return 100; return Math.round((Math.max((up.current_day || 1) - 1, 0) / totalDays(p)) * 100); };

  const activeItems = useMemo(() => ups
    .filter((e) => e.status === "active" || (e.status !== "completed" && e.current_day))
    .map((e) => ({ entry: e, program: programs.find((p) => p.id === e.program_id) }))
    .filter((x) => x.program), [ups, programs]);
  const continueItem = activeItems[0] || null;
  const featured = useMemo(() => programs.find((p) => p.is_featured) || programs[0] || null, [programs]);
  const phaseRecs = useMemo(() => {
    if (!phaseKey) return [];
    return programs.filter((p) => { const tp = p.trigger_phase; if (!tp || tp === "any") return false; return tp.split("/").map((s) => s.trim()).includes(phaseKey); }).slice(0, 6);
  }, [programs, phaseKey]);

  const matchText = (p) => [p.title || "", p.summary || p.description || "", p.need_tags || "", p.category || "", ...(p.goal_tags || []), ...(p.best_for_tags || [])].join(" ").toLowerCase();
  const browse = useMemo(() => {
    let list = programs.slice();
    if (need) list = list.filter((p) => matchText(p).includes(need));
    if (q) list = list.filter((p) => matchText(p).includes(q.toLowerCase()));
    if (sort === "shortest") list = list.sort((a, b) => totalDays(a) - totalDays(b));
    else if (sort === "az") list = list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else list = list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return list;
  }, [programs, q, need, sort, days]);

  // ── REAL WRITES (existing UserPrograms entity; optimistic then persist) ──
  const startProgram = async (p) => {
    if (!user || !p) return;
    const existing = upFor(p.id);
    if (existing) { navigate(createPageUrl(`ProgramDay?key=${p.program_key}&day=${existing.current_day || 1}`)); return; }
    // optimistic enrol
    const optimistic = { id: `tmp-${p.id}`, user_id: user.id, program_id: p.id, current_day: 1, status: "active" };
    setUps((prev) => [...prev, optimistic]);
    try {
      const row = await base44.entities.UserPrograms.create({ user_id: user.id, program_id: p.id, program_key: p.program_key, current_day: 1, status: "active", started_at: new Date().toISOString() });
      setUps((prev) => prev.map((e) => (e.id === optimistic.id ? row : e)));
    } catch (err) {
      console.error("Enrol failed:", err);
      setUps((prev) => prev.filter((e) => e.id !== optimistic.id));
    }
    navigate(createPageUrl(`ProgramDay?key=${p.program_key}&day=1`));
  };
  const setReminder = async (up, time) => {
    if (!up || String(up.id).startsWith("tmp")) return;
    setUps((prev) => prev.map((e) => (e.id === up.id ? { ...e, reminder_time: time } : e)));   // optimistic
    try { await base44.entities.UserPrograms.update(up.id, { reminder_time: time }); }
    catch (err) { console.error("Reminder save failed:", err); }
  };

  function jumpTo(i) {
    const wrap = sliderRef.current;
    const track = wrap?.querySelector(".fw-clipboard-track"); if (!track) { setJumpOpen(false); return; }
    const boards = [...track.children].filter((c) => c.offsetWidth > 40);
    const card = boards[i];
    if (card) track.scrollLeft = card.offsetLeft - track.offsetLeft;
    wrap?.scrollIntoView({ behavior: "smooth", block: "start" });
    setJumpOpen(false);
  }

  if (loading) return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 30, height: 30, borderRadius: 99, border: `2px solid ${T.paperDeep}`, borderTopColor: T.gold, animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const ctx = { isLocked, upFor, daysOf, metaOf, totalDays, progressOf, navigate, setDetail, startProgram, gold, sage, plum, crim };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        {/* HERO — generic page title (NEVER the user's handle) */}
        <FwFloraHero title="Your programmes" colorway={ph.cw} bloom={ph.bloom} flankL="clover" flankR="chamomile" titleColor={OXBLOOD} creature="butterfly"
          line="Gentle, guided journeys — a few minutes a day. Pick up where you left off, or start somewhere new." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 2 }}>
          <Bouquet items={[{ form: ph.bloom, colorway: ph.cw }, { form: "fern", colorway: "sage" }, { form: "cosmos", colorway: "plum" }]} size={150} animate idx="prog-bq" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{phaseKey ? `${phaseLabel(phaseKey)} — gentler journeys suit you` : "Guided journeys, at your pace"}</span>
        </div>

        <SummaryCard eyebrow="Continue your journey" accent={plum} rows={[
          continueItem
            ? { Icon: Play, label: "Active", text: `${continueItem.program.title} — day ${continueItem.entry.current_day || 1} of ${totalDays(continueItem.program)}`, onClick: () => setDetail(continueItem.program) }
            : { Icon: Play, label: "Active", text: "No active journey yet — start one below", onClick: () => jumpTo(0) },
          { Icon: CalendarDays, label: "For now", text: phaseKey ? `${phaseLabel(phaseKey)} week — gentler journeys suit you` : "Pick by what you need this week", onClick: () => jumpTo(1) },
          featured ? { Icon: Star, label: "New", text: `${featured.title} — a good place to start`, onClick: () => setDetail(featured) } : null,
        ].filter(Boolean)} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => (continueItem ? setDetail(continueItem.program) : jumpTo(0))} className="fw-elite-press" style={focusPill(plum)}><Play size={16} /> {continueItem ? "Continue" : "Start a journey"}</button>
          <button onClick={() => jumpTo(2)} className="fw-elite-press" style={focusPill(gold)}><Search size={16} /> Browse</button>
        </div>

        {/* search governs the Browse board */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "9px 14px" }}>
          <Search size={15} color={T.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => jumpTo(2)} placeholder="Search journeys — sleep, mood, energy…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: UI, fontSize: 13.5, color: T.ink }} />
          {q && <button onClick={() => setQ("")} aria-label="Clear" style={{ border: "none", background: "transparent", cursor: "pointer", color: T.muted }}><X size={15} /></button>}
        </div>

        <div ref={sliderRef} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide your journeys →" accent={plum}>

            {/* ── BOARD 1 — CONTINUE ─────────────────────────────────────── */}
            <Clipboard title="Continue" sub="PICK UP WHERE YOU LEFT OFF" accent={plum} flower="violet" idx="cb-cont" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={plum} bottomAccent={crim}
                  top={[
                    <Panel key="active" label="Your active journey" Icon={Play} accent={plum}><ActiveLens item={continueItem} ctx={ctx} onReminder={setReminder} /></Panel>,
                    <Panel key="others" label="Also in progress" Icon={Activity} accent={sage}><OthersLens items={activeItems.slice(1)} ctx={ctx} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="featured" label="Start here" Icon={Star} accent={crim}><FeaturedLens p={featured} ctx={ctx} /></Panel>,
                    <Panel key="begin" label="A good place to begin" Icon={Sparkles} accent={gold}><BeginLens programs={programs} ctx={ctx} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 2 — FOR YOU ──────────────────────────────────────── */}
            <Clipboard title="For you" sub="PHASE PICKS & COLLECTIONS" accent={gold} flower="iris" idx="cb-foryou" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={sage}
                  top={[
                    <Panel key="phase" label={phaseKey ? `For your ${phaseLabel(phaseKey).toLowerCase()} phase` : "For your phase"} Icon={CalendarDays} accent={gold}><PhaseLens recs={phaseRecs} ctx={ctx} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="collections" label="By what you need" Icon={BookOpen} accent={sage}><CollectionsLens programs={programs} ctx={ctx} matchText={matchText} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 3 — BROWSE ALL ───────────────────────────────────── */}
            <Clipboard title="Browse all" sub="EVERY JOURNEY · TAP TO LOOK INSIDE" accent={sage} flower="cosmos" idx="cb-browse" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={plum}
                  top={[
                    <Panel key="browse" label={`Every journey${browse.length ? ` · ${browse.length}` : ""}`} Icon={Search} accent={sage}>
                      <BrowseControls sort={sort} setSort={setSort} need={need} setNeed={setNeed} />
                      <BrowseLens list={browse} q={q} ctx={ctx} />
                    </Panel>,
                  ]}
                  bottom={[
                    <Panel key="your-plan" label="Your plan" Icon={Lock} accent={plum}><PlanLens userPlan={userPlan} navigate={navigate} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}><Pollinator kind="butterfly" size={32} color={T.gold} color2={cwOf(ph.cw).tip} pattern="bands" animate idx="prog-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 300, lineHeight: 1.55 }}>A few quiet minutes a day. No streaks to break — pick it up whenever you can.</p>
      </div>

      {detail && <ProgramSheet p={detail} ctx={ctx} onClose={() => setDetail(null)} onReminder={setReminder} />}
      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
    </div>
  );
}

// ── shared bits ───────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  if (TIER_ORDER[tier] > 0) return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: cwOf("gold").petal, border: `1px solid ${cwOf("gold").petal}`, borderRadius: 999, padding: "2px 7px" }}><Lock size={9} /> {tier === "pro" ? "Pro" : "Plus"}</span>;
  return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: cwOf("sage").petal, border: `1px solid ${cwOf("sage").petal}`, borderRadius: 999, padding: "2px 7px" }}>Free</span>;
}
function Thumb({ p, size = 88 }) {
  const [fl, cw] = flowerFor(p); const c = cwOf(cw);
  const url = p.cover_thumbnail_url || p.thumbnail_url;
  if (url) return <div style={{ width: size, height: size, borderRadius: 16, flexShrink: 0, backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center", border: `1px solid ${T.paperDeep}` }} />;
  return <div style={{ width: size, height: size, borderRadius: 16, flexShrink: 0, display: "grid", placeItems: "center", background: `linear-gradient(150deg, ${c.petal}22 0%, ${c.tip}33 100%)`, border: `1px solid ${T.paperDeep}` }}><RichBloomV2 form={fl} color={c.petal} color2={c.tip} accent={c.accent} size={Math.round(size * 0.72)} idx={`thumb-${p.program_key || fl}`} /></div>;
}
function MetaChips({ p, ctx }) {
  const m = ctx.metaOf(p.program_key);
  const chips = [[`${ctx.totalDays(p)} days`, Clock]];
  if (m.sessions) chips.push([`${m.sessions} audio`, Headphones]);
  if (m.readUps) chips.push([`${m.readUps} read`, BookOpen]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {chips.map(([label, Ic]) => <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10.5, color: T.muted, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "3px 8px" }}><Ic size={10} /> {label}</span>)}
    </div>
  );
}
// the rich program card (Card.jsx language)
function ProgramCard({ p, ctx, big }) {
  const [, cw] = flowerFor(p); const c = cwOf(cw);
  const up = ctx.upFor(p.id); const locked = ctx.isLocked(p); const pct = up ? ctx.progressOf(p, up) : null;
  return (
    <button onClick={() => ctx.setDetail(p)} aria-label={p.title} className="fw-elite-press" style={{ textAlign: "left", cursor: "pointer", width: "100%", display: "flex", gap: 12, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 18, padding: 14, boxShadow: "0 3px 12px rgba(11,8,5,0.06)" }}>
      <Thumb p={p} size={big ? 100 : 80} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 3 }}><TierBadge tier={p.access_tier} /></div>
        <div style={{ fontFamily: SERIF, fontSize: big ? 19 : 16.5, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>{p.title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, lineHeight: 1.4, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.summary || p.description || "A gentle guided journey."}</div>
        <MetaChips p={p} ctx={ctx} />
        {pct != null && (
          <div style={{ marginTop: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11, marginBottom: 3 }}><span style={{ color: c.petal, fontWeight: 700 }}>Day {up.current_day || 1} of {ctx.totalDays(p)}</span><span style={{ color: T.muted }}>{pct}%</span></div>
            <div style={{ height: 6, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: c.petal }} /></div>
          </div>
        )}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: locked ? cwOf("gold").petal : c.petal }}>
          {locked ? <><Lock size={12} /> Unlock with Plus</> : pct != null ? <><Play size={12} /> Continue</> : <><Play size={12} /> Start journey</>}
        </span>
      </div>
    </button>
  );
}
const miniRow = { display: "flex", alignItems: "center", gap: 11, width: "100%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "9px 11px", cursor: "pointer" };
function MiniRow({ p, ctx, note }) {
  const up = ctx.upFor(p.id);
  return (
    <button onClick={() => ctx.setDetail(p)} className="fw-elite-press" style={miniRow}>
      <Thumb p={p} size={42} />
      <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span><TierBadge tier={p.access_tier} /></span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{note || (up ? `day ${up.current_day || 1} of ${ctx.totalDays(p)}` : `${ctx.totalDays(p)} days`)}</span>
      </span>
      <ChevronRight size={16} color={T.muted} />
    </button>
  );
}
function EmptyLens({ Icon = Compass, title, line, cta, onCta }) {
  return (
    <div style={{ ...subCard(T.paperDeep), textAlign: "center", padding: "20px 16px" }}>
      <Icon size={20} color={T.muted} style={{ margin: "0 auto 8px", display: "block" }} />
      <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, margin: "0 0 3px" }}>{title}</p>
      <p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, margin: 0, lineHeight: 1.5 }}>{line}</p>
      {cta && <button onClick={onCta} className="fw-elite-press" style={{ marginTop: 12, background: cwOf("plum").petal, color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{cta}</button>}
    </div>
  );
}

// ── lenses ──────────────────────────────────────────────────────────────────
function ActiveLens({ item, ctx, onReminder }) {
  const TIMES = ["08:00", "13:00", "20:00", "21:00"];
  if (!item) return <EmptyLens Icon={Play} title="No active journey yet" line="Start a journey from “Start here” or Browse, and it lives here so you can pick up any time." />;
  const { program: p, entry: up } = item;
  return (
    <div>
      <ProgramCard p={p} ctx={ctx} big />
      <div style={{ ...subCard(cwOf("gold").petal), marginTop: 11, display: "flex", alignItems: "center", gap: 9 }}>
        <Bell size={15} color={cwOf("gold").petal} />
        <span style={{ flex: 1, fontFamily: SERIF, fontSize: 13.5, color: T.muted }}>{up.reminder_time ? `Reminder set for ${up.reminder_time}` : "Set a gentle daily reminder"}</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        {TIMES.map((t) => <button key={t} onClick={() => onReminder(up, t)} className="fw-elite-press" style={{ cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700, padding: "6px 11px", borderRadius: 999, border: `1px solid ${up.reminder_time === t ? T.ink : T.paperDeep}`, background: up.reminder_time === t ? T.ink : "transparent", color: up.reminder_time === t ? T.paperHi : T.muted }}>{t}</button>)}
      </div>
    </div>
  );
}
function OthersLens({ items, ctx }) {
  if (!items.length) return <EmptyLens Icon={Activity} title="Just the one, for now" line="When you start another journey, it'll appear here so you can switch between them." />;
  return <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{items.map(({ program: p }) => <MiniRow key={p.id} p={p} ctx={ctx} />)}</div>;
}
function FeaturedLens({ p, ctx }) {
  if (!p) return <EmptyLens Icon={Star} title="Journeys are loading" line="Featured journeys appear here." />;
  return (<div><ProgramCard p={p} ctx={ctx} big /><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, textAlign: "center", margin: "12px 6px 0", lineHeight: 1.5 }}>Hand-picked for where you are — short, kind, and easy to keep.</p></div>);
}
function BeginLens({ programs, ctx }) {
  const picks = programs.filter((p) => (TIER_ORDER[p.access_tier] || 0) === 0).slice(0, 4);
  if (!picks.length) return <EmptyLens Icon={Sparkles} title="A gentle start" line="Free journeys to begin with appear here." />;
  return <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{picks.map((p) => <MiniRow key={p.id} p={p} ctx={ctx} note={`${ctx.totalDays(p)} days · free`} />)}</div>;
}
function PhaseLens({ recs, ctx }) {
  if (!recs.length) return <EmptyLens Icon={CalendarDays} title="Log your cycle for phase picks" line="Once your period is logged in Today → Track, we suggest journeys that suit the week you're in." cta="Open Today" onCta={() => ctx.navigate(createPageUrl("Today"))} />;
  return <CardDeck accent={cwOf("gold").petal}>{recs.map((p) => <ProgramCard key={p.id} p={p} ctx={ctx} />)}</CardDeck>;
}
function CollectionsLens({ programs, ctx, matchText }) {
  const cols = COLLECTIONS.map((col) => ({ ...col, items: programs.filter((p) => col.tags.some((t) => matchText(p).includes(t))).slice(0, 4) })).filter((c) => c.items.length);
  if (!cols.length) return <EmptyLens Icon={BookOpen} title="Collections build as journeys load" line="Curated shelves by what you need — sleep, hormones, PMS, postpartum — appear here." />;
  return (
    <CardDeck accent={cwOf("sage").petal}>
      {cols.map((col) => { const c = cwOf(col.cw); return (
        <div key={col.title} style={{ ...subCard(c.petal) }}>
          <div style={{ fontFamily: SCRIPT, fontSize: 22, color: OXBLOOD, marginBottom: 8 }}>{col.title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{col.items.map((p) => <MiniRow key={p.id} p={p} ctx={ctx} />)}</div>
        </div>
      ); })}
    </CardDeck>
  );
}
function BrowseControls({ sort, setSort, need, setNeed }) {
  const NEEDS = [["sleep", "Sleep"], ["stress", "Stress"], ["pms", "PMS"], ["mobility", "Mobility"], ["menopause", "Menopause"], ["postpartum", "Postpartum"]];
  const SORTS = [["recommended", "Recommended"], ["shortest", "Shortest"], ["az", "A–Z"]];
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
        <button onClick={() => setNeed(null)} style={chip(need === null)}>All</button>
        {NEEDS.map(([id, l]) => <button key={id} onClick={() => setNeed(need === id ? null : id)} style={chip(need === id)}>{l}</button>)}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ ...lbl }}>Sort</span>
        {SORTS.map(([id, l]) => <button key={id} onClick={() => setSort(id)} style={{ cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700, padding: "6px 11px", borderRadius: 999, border: `1px solid ${sort === id ? T.ink : T.paperDeep}`, background: sort === id ? T.ink : "transparent", color: sort === id ? T.paperHi : T.muted }}>{l}</button>)}
      </div>
    </div>
  );
}
const chip = (on) => ({ flexShrink: 0, cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700, padding: "6px 12px", borderRadius: 999, border: "none", background: on ? cwOf("plum").petal : T.paperDeep, color: on ? "#fff" : T.muted });
function BrowseLens({ list, q, ctx }) {
  if (!list.length) return <EmptyLens Icon={Search} title={q ? `Nothing matches “${q}”` : "No journeys yet"} line={q ? "Try “sleep”, “mood” or “energy”." : "Journeys appear here as they're published."} />;
  return <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{list.map((p) => <MiniRow key={p.id} p={p} ctx={ctx} />)}</div>;
}
function PlanLens({ userPlan, navigate }) {
  const plus = TIER_ORDER[userPlan] > 0;
  return (
    <div>
      <div style={{ ...subCard(plus ? cwOf("gold").petal : T.paperDeep), display: "flex", alignItems: "center", gap: 10 }}>
        {plus ? <Star size={18} color={cwOf("gold").petal} /> : <Lock size={18} color={T.muted} />}
        <div><div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: T.ink, textTransform: "capitalize" }}>{userPlan} plan</div><div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{plus ? "Every journey is unlocked for you." : "Free journeys are open; Plus unlocks the rest."}</div></div>
      </div>
      {!plus && <button onClick={() => navigate(createPageUrl("Upgrade"))} className="fw-elite-press" style={{ marginTop: 10, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: cwOf("gold").petal, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><Flame size={15} /> See Plus</button>}
    </div>
  );
}

// ── PROGRAM DETAIL SHEET → the day-by-day list (done/today/upcoming) → start/continue/unlock ──
function ProgramSheet({ p, ctx, onClose, onReminder }) {
  const [, cw] = flowerFor(p); const c = cwOf(cw);
  const up = ctx.upFor(p.id); const locked = ctx.isLocked(p);
  const curDay = up?.current_day || 0; const pct = up ? ctx.progressOf(p, up) : null;
  const realDays = ctx.daysOf(p.program_key);
  const total = ctx.totalDays(p);
  const dayRows = realDays.length ? realDays : Array.from({ length: Math.min(total, 10) }, (_, i) => ({ day_number: i + 1, title: ["Settle in", "A small shift", "Notice the body", "A kinder night", "Steady on", "Going deeper", "Reflect & carry on"][i] || `Day ${i + 1}` }));
  const TIMES = ["08:00", "13:00", "20:00", "21:00"];
  const onCta = () => {
    if (locked) { ctx.navigate(createPageUrl("Upgrade")); return; }
    if (up) { ctx.navigate(createPageUrl(`ProgramDay?key=${p.program_key}&day=${curDay || 1}`)); return; }
    ctx.startProgram(p);
  };
  return (
    <div onClick={onClose} role="dialog" aria-modal="true" style={scrim}><style>{floraKeyframes}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{ ...sheetStyle, borderTop: `3px solid ${c.petal}` }}>
        <div style={grab} />
        <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
          <Thumb p={p} size={72} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 3 }}><TierBadge tier={p.access_tier} /></div>
            <div style={{ fontFamily: SCRIPT, fontSize: 25, color: OXBLOOD, lineHeight: 1 }}>{p.title}</div>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, marginTop: 3 }}>{ctx.totalDays(p)} days{(ctx.metaOf(p.program_key).sessions ? " · audio" : "")}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={iconX}><X size={20} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.muted, lineHeight: 1.55, margin: "8px 0 12px" }}>{p.summary || p.description || `A gentle ${total}-day journey — a few quiet minutes each day. Small steps, audio guides, and a soft check-in. No streaks to break; pick it up whenever you can.`}</p>
        {pct != null && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, marginBottom: 3 }}><span style={{ color: c.petal, fontWeight: 700 }}>Day {curDay} of {total}</span><span style={{ color: T.muted }}>{pct}%</span></div>
            <div style={{ height: 7, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: c.petal }} /></div>
          </div>
        )}
        {up && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><Bell size={14} color={cwOf("gold").petal} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>{up.reminder_time ? `Reminder · ${up.reminder_time}` : "Set a daily reminder"}</span></div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{TIMES.map((t) => <button key={t} onClick={() => onReminder(up, t)} className="fw-elite-press" style={{ cursor: "pointer", fontFamily: UI, fontSize: 11.5, fontWeight: 700, padding: "6px 11px", borderRadius: 999, border: `1px solid ${up.reminder_time === t ? T.ink : T.paperDeep}`, background: up.reminder_time === t ? T.ink : "transparent", color: up.reminder_time === t ? T.paperHi : T.muted }}>{t}</button>)}</div>
          </div>
        )}
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>The days</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {dayRows.slice(0, 10).map((d) => { const dn = d.day_number; const done = curDay && dn < curDay; const cur = curDay === dn; return (
            <div key={dn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, background: cur ? `${c.petal}1a` : T.paper, border: `1px solid ${cur ? c.petal : T.paperDeep}` }}>
              <span style={{ width: 22, height: 22, borderRadius: 99, background: done ? c.petal : "transparent", border: done ? "none" : `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 11, fontWeight: 700, color: done ? "#fff" : T.muted }}>{done ? <Check size={12} color="#fff" /> : dn}</span>
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14, color: T.ink }}>Day {dn}{d.title ? ` · ${d.title}` : ""}</span>
              {cur && <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: c.petal }}>TODAY</span>}
            </div>
          ); })}
          {total > 10 && <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, textAlign: "center", margin: "2px 0 0" }}>+ {total - 10} more days</p>}
        </div>
        <button onClick={onCta} className="fw-elite-press" style={{ ...cta, background: locked ? cwOf("gold").petal : c.petal }}>
          {locked ? <><Lock size={16} /> Unlock with Plus</> : up ? <><Play size={16} /> Continue — day {curDay || 1}</> : <><Play size={16} /> Start this journey</>}
        </button>
      </div>
    </div>
  );
}

const scrim = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(11,8,5,0.46)", display: "flex", alignItems: "flex-end", justifyContent: "center" };
const sheetStyle = { width: "100%", maxWidth: 520, background: T.paperHi, borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: "0 -8px 40px rgba(11,8,5,.24)", padding: "16px 18px 20px", maxHeight: "84dvh", overflowY: "auto" };
const grab = { width: 38, height: 4, borderRadius: 99, background: T.paperDeep, margin: "0 auto 14px" };
const iconX = { background: "transparent", border: "none", cursor: "pointer", color: T.muted, alignSelf: "flex-start" };
const cta = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", color: "#fff", border: "none", borderRadius: 12, padding: "14px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer" };
