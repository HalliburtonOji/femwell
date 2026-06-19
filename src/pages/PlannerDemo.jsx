// PlannerDemo — a redesign DEMO of the Planner page. PREVIEW route only (/PlannerDemo). LIVE /Planner
// (PlannerV2Shell) UNTOUCHED — this is a fresh CONCEPT, not an edit of the live calendar. Conforms to
// BRAND_IDENTITY.md (Planner flora character = plum/gold).
//
// DISTINCT FORM (a WEEK-STRIP + AGENDA TIMELINE — not a slider/dashboard/list/scene): a horizontal
// 7-day week selector, then a vertical TIMELINE of the selected day's items (time rail + dots + inline
// check-off), a "today's focus" line, and an inline add. Brand held constant.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { Loader, PageVines, JumpPill, JumpSheet, DoneRow, btnStyle, DEMO_CSS, CLAMP, withTimeout } from "@/components/demos/demoKit";
import { CalendarDays, Check, Plus, Send, Sparkles, ChevronRight } from "lucide-react";

const COL = 480;
const PLUM = "#8E6E8E";
const dk = (d) => { try { return d.toISOString().slice(0, 10); } catch { return ""; } };
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SECTIONS = [
  { key: "week", label: "Your week", Icon: CalendarDays, accent: PLUM },
  { key: "agenda", label: "The day", Icon: Sparkles, accent: "#A8893F" },
  { key: "add", label: "Add something", Icon: Plus, accent: "#8FAF8F" },
];

export default function PlannerDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [selected, setSelected] = useState(() => dk(new Date()));
  const [localDone, setLocalDone] = useState({});
  const [added, setAdded] = useState([]);
  const refs = { week: useRef(null), agenda: useRef(null), add: useRef(null) };

  // the 7 days of the current week (Mon→Sun)
  const week = useMemo(() => {
    const now = new Date(); const day = (now.getDay() + 6) % 7; // 0=Mon
    const mon = new Date(now); mon.setDate(now.getDate() - day); mon.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  }, []);
  const todayKeyStr = dk(new Date());

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me()); const id = me?.id || null; if (!alive) return; setUid(id);
      if (!id) { setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      if (!alive) return; setProfile((profs || []).filter(Boolean)[0] || null); setLoading(false);
      withTimeout(base44.entities.PlannerItems.filter({ user_id: id }, "-date", 120)).then((r) => { if (alive) setItems((r || []).filter((x) => x && x.title)); }).catch(() => {});
      withTimeout(base44.entities.DailyPlan.filter({ user_id: id, day_key: todayKeyStr }, null, 1)).then((r) => { if (alive) setPlan((r || []).filter(Boolean)[0] || null); }).catch(() => {});
    })();
    return () => { alive = false; };
  }, [todayKeyStr]);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const phaseColor = PHASE_COLORS[cycle.phase] || PLUM;

  const itemsByDay = useMemo(() => {
    const map = {};
    [...items, ...added].forEach((it) => { const d = it.date || it.day_key; if (!d) return; (map[d] = map[d] || []).push(it); });
    return map;
  }, [items, added]);

  const dayItems = useMemo(() => {
    const arr = (itemsByDay[selected] || []).slice();
    const tval = (it) => it.time || it.start_time || it.scheduled_time || "";
    arr.sort((a, b) => String(tval(a)).localeCompare(String(tval(b))));
    return arr;
  }, [itemsByDay, selected]);

  const selDate = useMemo(() => { try { return new Date(selected + "T00:00:00"); } catch { return new Date(); } }, [selected]);
  const longSel = selDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const itemId = (it) => it.id || it._id;
  const isDone = (it) => localDone[itemId(it)] ?? (it.is_completed || it.completed || false);
  const toggle = (it) => {
    const id = itemId(it); if (!id) return; const next = !isDone(it);
    setLocalDone((m) => ({ ...m, [id]: next }));
    try { base44.entities.PlannerItems.update(id, { is_completed: next, completed: next }).catch(() => {}); } catch { /* ignore */ }
  };
  const jumpTo = (k) => { setJumpOpen(false); refs[k]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={PLUM} b={T.gold} />
      <JumpPill onClick={() => setJumpOpen(true)} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "26px 0 8px" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><CalendarDays size={24} color={PLUM} strokeWidth={1.7} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={15} /><Eyebrow color={T.muted}>Your week, gently planned</Eyebrow></div>
            <Script size={42} color={T.ink}>Planner</Script>
          </div>
          {hasCycle && <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.paper, background: phaseColor, borderRadius: 999, padding: "4px 11px", textTransform: "uppercase" }}>{PHASE_LABEL[cycle.phase]}</span>}
        </header>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "2px 2px 12px", lineHeight: 1.5 }}>
          Plan with your body, not against it — a soft agenda you can move at your own pace. Pick a day.
        </Hand>

        {/* WEEK STRIP */}
        <div ref={refs.week} style={{ display: "flex", gap: 7, scrollMarginTop: 70 }}>
          {week.map((d) => {
            const key = dk(d); const on = key === selected; const isToday = key === todayKeyStr;
            const n = (itemsByDay[key] || []).length;
            return (
              <button key={key} onClick={() => setSelected(key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 2px 8px", borderRadius: 14, cursor: "pointer", border: `1px solid ${on ? PLUM : T.paperDeep}`, background: on ? PLUM : T.paperHi, color: on ? "#fff" : T.ink }}>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: on ? "rgba(255,255,255,0.85)" : T.muted }}>{WD[d.getDay()]}</span>
                <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, lineHeight: 1 }}>{d.getDate()}</span>
                <span style={{ height: 6, display: "flex", alignItems: "center" }}>{n > 0 ? <span style={{ width: 6, height: 6, borderRadius: 999, background: on ? "#fff" : (isToday ? T.crimson : PLUM) }} /> : isToday ? <span style={{ width: 5, height: 5, borderRadius: 999, background: on ? "#fff" : T.crimson, opacity: 0.7 }} /> : null}</span>
              </button>
            );
          })}
        </div>

        {/* TODAY'S FOCUS */}
        {selected === todayKeyStr && plan?.focus_for_today && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: `linear-gradient(165deg, ${T.paperHi}, ${T.gold}14)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 14, padding: "12px 14px", marginTop: 14 }}>
            <FlowerGlyph variant="sunflower" size={30} color={T.gold} idx="pl-focus" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold }}>Today's focus</div>
              <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.35, ...CLAMP(2) }}>{plan.focus_for_today}</div>
            </div>
          </div>
        )}

        {/* AGENDA TIMELINE */}
        <div ref={refs.agenda} style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0 12px", scrollMarginTop: 70 }}>
          <FlowerGlyph variant="iris" size={28} color={PLUM} idx="pl-agenda" />
          <div style={{ minWidth: 0 }}>
            <Eyebrow color={PLUM}>{selected === todayKeyStr ? "Today" : "Selected day"}</Eyebrow>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.15, display: "block" }}>{longSel}</span>
          </div>
          <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.7, marginLeft: 6 }} />
        </div>

        {dayItems.length ? (
          <div style={{ position: "relative", paddingLeft: 26 }}>
            <div aria-hidden style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 2, background: T.paperDeep, opacity: 0.7 }} />
            {dayItems.map((it) => {
              const done = isDone(it); const time = it.time || it.start_time || it.scheduled_time;
              return (
                <div key={itemId(it) || it.title} style={{ position: "relative", marginBottom: 12 }}>
                  <span aria-hidden style={{ position: "absolute", left: -22, top: 16, width: 12, height: 12, borderRadius: 999, background: done ? T.sage : T.paperHi, border: `2px solid ${done ? T.sage : PLUM}` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${done ? T.sage : PLUM}`, borderRadius: 14, padding: "13px 14px" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {time && <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: PLUM, letterSpacing: "0.04em" }}>{time}</div>}
                      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: done ? T.muted : T.ink, textDecoration: done ? "line-through" : "none", lineHeight: 1.3, ...CLAMP(2) }}>{it.title}</div>
                    </div>
                    <button onClick={() => toggle(it)} aria-label={done ? "Mark not done" : "Mark done"} style={{ width: 32, height: 32, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", cursor: "pointer", background: done ? T.sage : "transparent", border: `1.5px solid ${done ? T.sage : T.paperDeep}`, color: "#fff" }}>{done ? <Check size={16} strokeWidth={3} /> : null}</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: T.paperHi, border: `1px dashed ${T.paperDeep}`, borderRadius: 16, padding: "22px 16px", textAlign: "center" }}>
            <FlowerGlyph variant="primrose" size={40} color={PLUM} idx="pl-empty" />
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, margin: "6px 0 0", lineHeight: 1.4 }}>Nothing planned for this day. Keep it soft, or add the first thing below.</p>
          </div>
        )}

        {/* ADD */}
        <div ref={refs.add} style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi}, ${T.sage}12)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 16, padding: "15px 16px", marginTop: 18, scrollMarginTop: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Plus size={16} color={T.sage} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>Add to {selected === todayKeyStr ? "today" : "this day"}</span>
          </div>
          <AddItem uid={uid} date={selected} onAdd={(it) => setAdded((a) => [...a, it])} />
        </div>

        <a href="/Planner" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%", marginTop: 18, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>Open your full planner <ChevronRight size={14} /></a>
      </div>

      {jumpOpen && <JumpSheet sections={SECTIONS} onClose={() => setJumpOpen(false)} onPick={(k) => jumpTo(k)} />}
    </div>
  );
}

function AddItem({ uid, date, onAdd }) {
  const [text, setText] = useState(""); const [done, setDone] = useState(false);
  const can = text.trim().length > 0;
  const add = () => {
    if (!can) return;
    const title = text.trim(); setText(""); setDone(true); setTimeout(() => setDone(false), 1600);
    const optimistic = { id: `tmp-${Math.abs(title.length * 31 + date.length)}-${title.slice(0, 4)}`, title, date };
    onAdd(optimistic);
    if (uid) base44.entities.PlannerItems.create({ user_id: uid, date, title, is_completed: false, source: "planner-demo" }).catch(() => {});
  };
  return (
    <div>
      {done && <DoneRow accent={T.sage} label="Added to your day." />}
      {!done && (
        <div style={{ display: "flex", gap: 9 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={120} placeholder="e.g. A walk before lunch" onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            style={{ flex: 1, minWidth: 0, boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
          <button onClick={add} disabled={!can} style={{ ...btnStyle(T.sage, !can), width: "auto", padding: "11px 16px" }}><Send size={15} /> Add</button>
        </div>
      )}
    </div>
  );
}
