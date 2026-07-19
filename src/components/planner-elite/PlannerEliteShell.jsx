// PlannerEliteShell — the ELEVATED, FULLY-WIRED Planner. Self-loading against real base44 entities;
// every control persists. Rendered by Planner.jsx when shellVariant === "elite" (live /Planner) or
// the /PlannerElite test route. Craft elevated ~3 levels over the demo: lush flora hero (bouquet +
// resting creature + life-stage bloom), dimensional Clipboard cards, oxblood script headings, the full
// card language (two stacked horizontal sub-sliders per board + gold hairline divider + board ‹ › arrows
// + colour pills + accent-rim sub-cards), and tasteful reduced-motion-safe motion (breath/sway + a soft
// mount fade + tactile press).
//
// REAL DATA (no new base44 function — entities + existing dispatchers only):
//   • Blocks (Agenda/Hours/Week) → PlannerItems (create/update/delete/toggle); type+duration encoded in notes.
//   • Daily anchors (Rituals) → HabitLogs (create/update, per day, per habit_type).
//   • Intentions → PlannerItems tagged notes "intent;dom:<domain>" (persists text + domain).
//   • Invisible labour → InvisibleTask (new entity).  • Life admin → LifeAdminItem (new entity).
//   • Season of life → UserProfile.life_season (new field).  • Recovery → WearableSync / DailyCheckins (graceful fallback).
//   • Capacity / energy → derived from the real blocks + the real cycle phase (UserProfile).
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Plus, X, Check, Mic, ChevronLeft, ChevronRight, Sun, Moon, CalendarDays, Gauge, Sparkles,
  Briefcase, Users, Heart, Coins, Smile, Leaf, Palette, Feather, ArrowRight, Trash2, Clock,
  Footprints, ListChecks, Utensils, Wind, Moon as MoonI, HeartHandshake, Layers, Timer,
  BatteryCharging, ShieldCheck, Trash, UserPlus, Repeat, Baby, Flower2, Loader,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, SERIF, UI, PAPER_BG, Eyebrow } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import { phaseForDay } from "@/hooks/useCycleDay";
import { pickProfile } from "@/utils/userProfile";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import {
  OXBLOOD, lbl, subCard, focusPill, Pill, Panel, Deck, StackedCard, BoardBody, TopChrome, SheetShell,
  JumpSheet, SliderArrows, makeCalendarOverlay, fieldLabel, inputBase,
} from "@/components/brand/SliderKit";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);

// ── tasteful, reduced-motion-safe motion ─────────────────────────────────────
const ELITE_MOTION = `
@keyframes fwEliteIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
.fw-elite-in { animation: fwEliteIn .5s cubic-bezier(.4,0,.2,1) both; }
.fw-elite-press { transition: transform .12s ease; }
.fw-elite-press:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce){ .fw-elite-in{ animation:none } .fw-elite-press{ transition:none } }
`;

const PHASE = {
  menstrual: { label: "Menstrual", hue: "#BC2E27", mult: 0.55, note: "Slow and soft — plan light, protect rest.", bloom: "poppy", cw: "crimson" },
  follicular: { label: "Follicular", hue: "#8FAF8F", mult: 1.10, note: "Building and curious — a good day to start and be bold.", bloom: "snowdrop", cw: "sage" },
  ovulatory: { label: "Ovulatory", hue: "#D4AF37", mult: 1.20, note: "Your peak — big asks, the hard conversation.", bloom: "sunflower", cw: "gold" },
  luteal: { label: "Luteal", hue: "#8E6E8E", mult: 0.85, note: "Reflective and finishing — close loops, narrow down.", bloom: "dahlia", cw: "plum" },
};
const SEASONS = {
  steady: { label: "Steady", Icon: Flower2, mult: 1.0, note: "Your usual rhythm." },
  newbaby: { label: "New baby", Icon: Baby, mult: 0.6, note: "The bar is lower on purpose. Sustaining is the win." },
  perimenopause: { label: "Perimenopause", Icon: Leaf, mult: 0.72, note: "Flex with the day — small, sustainable moves." },
  caregiving: { label: "Caregiving", Icon: HeartHandshake, mult: 0.65, note: "Coordination is the work. Protect your reserves." },
};
const TYPE_META = {
  focus: { label: "Focus", Icon: Briefcase, cw: "plum", load: 2, energy: "deep", cat: "work" },
  task: { label: "Task", Icon: ListChecks, cw: "gold", load: 1, energy: "admin", cat: "personal" },
  life: { label: "Life", Icon: Users, cw: "sage", load: 1, energy: "social", cat: "social" },
  move: { label: "Move", Icon: Footprints, cw: "sage", load: 0.5, energy: "restorative", cat: "wellness" },
  meal: { label: "Meal", Icon: Utensils, cw: "blush", load: 0.5, energy: "restorative", cat: "wellness" },
  rest: { label: "Rest", Icon: Moon, cw: "plum", load: 0.5, energy: "rest", cat: "wellness" },
};
const DOMAINS = [
  { id: "career", label: "Career", Icon: Briefcase, cw: "plum", prompt: "One real move on the thing that matters." },
  { id: "friend", label: "Friendship", Icon: Users, cw: "sage", prompt: "Reach for someone — a voice note counts." },
  { id: "love", label: "Love", Icon: Heart, cw: "crimson", prompt: "A small tenderness, given or received." },
  { id: "money", label: "Money", Icon: Coins, cw: "gold", prompt: "One quiet, kind thing for future-you." },
  { id: "joy", label: "Joy", Icon: Smile, cw: "gold", prompt: "Something purely for the fun of it." },
  { id: "rest", label: "Rest", Icon: Leaf, cw: "sage", prompt: "Permission to do less, on purpose." },
  { id: "create", label: "Create", Icon: Palette, cw: "blush", prompt: "Make a little something, badly, anyway." },
  { id: "self", label: "Self", Icon: Feather, cw: "plum", prompt: "A line in your own voice — who are you today?" },
];
const domainOf = (id) => DOMAINS.find((d) => d.id === id) || DOMAINS[7];
const ANCHORS = [
  { slot: "am", habit: "anchor_sunlight_water", title: "Sunlight + water" },
  { slot: "am", habit: "anchor_move_5", title: "Move 5 minutes" },
  { slot: "am", habit: "anchor_name_intention", title: "Name today's intention" },
  { slot: "pm", habit: "anchor_phone_down", title: "Phone down by 10" },
  { slot: "pm", habit: "anchor_read_10", title: "Read 10 pages" },
];
const ADMIN_DISP = [
  { id: "delete", label: "Delete", Icon: Trash, cw: "crimson" }, { id: "delegate", label: "Delegate", Icon: UserPlus, cw: "sage" },
  { id: "automate", label: "Automate", Icon: Repeat, cw: "plum" }, { id: "do", label: "Do it", Icon: Check, cw: "gold" },
];
const RESETS = [
  { id: "move", label: "Move", Icon: Footprints, cw: "sage" }, { id: "cry", label: "A good cry", Icon: Wind, cw: "plum" }, { id: "hug", label: "A long hug", Icon: HeartHandshake, cw: "crimson" },
  { id: "create", label: "Make something", Icon: Palette, cw: "blush" }, { id: "breath", label: "Breathe", Icon: Wind, cw: "sage" }, { id: "connect", label: "Reach out", Icon: Users, cw: "gold" },
];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const partOfDay = (h) => (h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening");
const fmtHour = (h) => `${h > 12 ? h - 12 : h || 12}${h >= 12 ? "pm" : "am"}`;
function energyCurve(phaseKey) {
  const mult = PHASE[phaseKey].mult;
  return HOURS.map((h) => { const base = h < 9 ? 0.4 + (h - 7) * 0.12 : h <= 12 ? 0.7 + (h - 9) * 0.1 : h <= 15 ? 0.95 - (h - 12) * 0.13 : h <= 18 ? 0.6 + (h - 15) * 0.04 : 0.7 - (h - 18) * 0.12; return Math.max(0.12, Math.min(1, base * (0.7 + mult * 0.3))); });
}
const pad = (n) => String(n).padStart(2, "0");
const dkOf = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const dayLabel = (off) => { const d = new Date(); d.setDate(d.getDate() + off); const b = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); return off === 0 ? `${b} · Today` : off === 1 ? `${b} · Tomorrow` : b; };
const nowISO = () => new Date().toISOString();
// notes encoding (no schema change): blocks "t:<type>;d:<dur>", intentions "intent;dom:<domain>"
const blkNotes = (type, dur) => `t:${type};d:${dur}`;
const parseBlk = (notes) => { const t = /t:(\w+)/.exec(notes || "")?.[1]; const d = Number(/d:(\d+)/.exec(notes || "")?.[1]); return { type: TYPE_META[t] ? t : "task", dur: d || 30 }; };
const isIntent = (notes) => /^intent/.test(notes || "");
const intNotes = (dom) => `intent;dom:${dom}`;
const hourOf = (time) => { const m = /^(\d{1,2})/.exec(String(time || "")); const h = m ? Number(m[1]) : 9; return h >= 0 && h <= 23 ? h : 9; };

function cycleInfo(profile) {
  const last = profile?.last_period_start_date; const len = Number(profile?.cycle_avg_length) || 28; const plen = Number(profile?.period_length) || 5;
  if (!last) return { phaseKey: "follicular", cycleDay: 1, len, plen };
  const start = new Date(last + "T00:00:00"); const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / 86400000);
  const cd = (((diff % len) + len) % len) + 1;
  return { phaseKey: phaseForDay(cd, plen, len), cycleDay: cd, len, plen };
}

// ════════════════════════════════════════════════════════════════════════════
export default function PlannerEliteShell() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [anchors, setAnchors] = useState(ANCHORS.map((a) => ({ ...a, done: false, logId: null })));
  const [intentions, setIntentions] = useState([]);
  const [invisible, setInvisible] = useState([]);
  const [admin, setAdmin] = useState([]);
  const [season, setSeason] = useState("steady");
  const [recovery, setRecovery] = useState(null);
  const [editBlock, setEditBlock] = useState(null);
  const [intentDraft, setIntentDraft] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [addLoadOpen, setAddLoadOpen] = useState(null); // 'invisible' | 'admin' | null
  const [toast, setToast] = useState(null);
  const sliderRef = useRef(null);

  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2300); };

  const { phaseKey, cycleDay } = useMemo(() => cycleInfo(profile), [profile]);
  const ph = PHASE[phaseKey];
  const sn = SEASONS[season] || SEASONS.steady;
  const curve = useMemo(() => energyCurve(phaseKey), [phaseKey]);
  const peakIdx = curve.indexOf(Math.max(...curve));
  const peakLabel = fmtHour(HOURS[peakIdx]);
  const capacity = Math.round(10 * ph.mult * sn.mult * 10) / 10;
  const load = useMemo(() => {
    let l = blocks.filter((b) => !b.done).reduce((s, b) => s + (TYPE_META[b.type]?.load ?? 1), 0);
    l += intentions.length * 0.5;
    return Math.round(l * 10) / 10;
  }, [blocks, intentions]);
  const pct = capacity > 0 ? Math.round((load / capacity) * 100) : 0;
  const over = load > capacity;

  // ── loaders ────────────────────────────────────────────────────────────────
  const loadBlocks = useCallback(async (uid, off) => {
    try {
      const rows = await base44.entities.PlannerItems.filter({ user_id: uid, date: dkOf(off) }, "-created_date", 200);
      const bl = (rows || []).filter((r) => !isIntent(r.notes)).map((r) => { const { type, dur } = parseBlk(r.notes); return { id: r.id, hour: hourOf(r.time), title: r.title || "Untitled", type, dur, done: !!r.is_completed }; }).sort((a, b) => a.hour - b.hour);
      setBlocks(bl);
    } catch { setBlocks([]); }
  }, []);
  const loadToday = useCallback(async (uid) => {
    const tk = dkOf(0);
    try {
      const items = await base44.entities.PlannerItems.filter({ user_id: uid, date: tk }, "-created_date", 200);
      setIntentions((items || []).filter((r) => isIntent(r.notes)).map((r) => ({ id: r.id, text: r.title, domain: /dom:(\w+)/.exec(r.notes || "")?.[1] || "self" })));
    } catch { /* ignore */ }
    try {
      const logs = await base44.entities.HabitLogs.filter({ user_id: uid, date: tk }, null, 100);
      setAnchors(ANCHORS.map((a) => { const log = (logs || []).find((l) => l.habit_type === a.habit); return { ...a, done: !!(log && (log.completed || log.is_completed)), logId: log?.id || null }; }));
    } catch { /* ignore */ }
    try { const inv = await base44.entities.InvisibleTask.filter({ user_id: uid }, "-created_date", 50); setInvisible((inv || []).map((r) => ({ id: r.id, title: r.title, carry: r.carry || "You notice · track", handed: !!r.handed, handed_to: r.handed_to }))); } catch { /* ignore */ }
    try { const ad = await base44.entities.LifeAdminItem.filter({ user_id: uid }, "-created_date", 50); setAdmin((ad || []).map((r) => ({ id: r.id, title: r.title, due: r.due || "—", disp: r.disposition || null }))); } catch { /* ignore */ }
    try {
      const ws = await base44.entities.WearableSync.filter({ user_id: uid, date: tk }, "-created_date", 1);
      if (ws && ws[0]) { const w = ws[0]; setRecovery({ sleep: w.sleep_deep_hours || w.sleep_rem_hours ? `${Math.round(((w.sleep_deep_hours || 0) + (w.sleep_rem_hours || 0) + (w.sleep_light_hours || 0)) * 10) / 10}h` : null, readiness: w.readiness_score ?? null, hrv: w.hrv_ms ?? null, source: w.source }); }
      else { const dc = await base44.entities.DailyCheckins.filter({ user_id: uid, date: tk }, "-created_date", 1); if (dc && dc[0]?.sleep_hours) setRecovery({ sleep: `${dc[0].sleep_hours}h`, readiness: null, hrv: null, source: "check-in" }); else setRecovery(null); }
    } catch { setRecovery(null); }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me(); if (!alive) return; setUser(u);
        // THIS is the live /Planner profile load (Planner.jsx defaults to shellVariant
        // "elite" and returns this shell, so the loader in Planner.jsx never runs for the
        // live route). No limit-1, and pickProfile not [0] — the newest row is usually an
        // empty one, which is why Planner showed a faked "Follicular · Day 1".
        const p = await base44.entities.UserProfile.filter({ user_id: u.id }); const prof = pickProfile(p);
        if (!alive) return; setProfile(prof); setSeason(prof?.life_season || "steady");
        await Promise.all([loadBlocks(u.id, 0), loadToday(u.id)]);
      } catch { /* unauth / offline — render gracefully */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [loadBlocks, loadToday]);

  useEffect(() => { if (user) loadBlocks(user.id, offset); }, [offset, user, loadBlocks]);

  // ── writers (all persist) ───────────────────────────────────────────────────
  const addToDay = async (raw, kind) => {
    const t = (raw || "").trim(); if (!t || !user) return;
    const m = /(\d{1,2})\s?(am|pm)/i.exec(t);
    const hour = m ? (Number(m[1]) % 12) + (/pm/i.test(m[2]) ? 12 : 0) : HOURS[peakIdx];
    const type = kind || (/walk|run|gym|move|stretch|yoga/i.test(t) ? "move" : /lunch|dinner|coffee|drinks|see |call |meet/i.test(t) ? "life" : /deep|write|focus|pitch|work/i.test(t) ? "focus" : /eat|breakfast|snack|meal/i.test(t) ? "meal" : /rest|nap|breathe|reset|wind/i.test(t) ? "rest" : "task");
    const title = (t.replace(/(at\s)?\d{1,2}\s?(am|pm)/i, "").trim() || t).replace(/^./, (c) => c.toUpperCase());
    const temp = { id: "tmp" + Date.now(), hour, title, type, dur: 45, done: false };
    setBlocks((bs) => [...bs, temp].sort((a, b) => a.hour - b.hour));
    flash(offset === 0 ? "Added to today" : `Added to ${dayLabel(offset).split(" · ")[0]}`);
    try {
      const created = await base44.entities.PlannerItems.create({ user_id: user.id, title, date: dkOf(offset), time: `${pad(hour)}:00`, category: TYPE_META[type].cat, notes: blkNotes(type, 45), is_completed: false, created_at: nowISO(), updated_at: nowISO() });
      setBlocks((bs) => bs.map((b) => b.id === temp.id ? { ...b, id: created.id } : b));
    } catch { setBlocks((bs) => bs.filter((b) => b.id !== temp.id)); flash("Couldn't save — try again"); }
  };
  const toggleBlock = async (id) => {
    const b = blocks.find((x) => x.id === id); if (!b) return;
    setBlocks((bs) => bs.map((x) => x.id === id ? { ...x, done: !x.done } : x));
    try { await base44.entities.PlannerItems.update(id, { is_completed: !b.done, updated_at: nowISO() }); } catch { setBlocks((bs) => bs.map((x) => x.id === id ? { ...x, done: b.done } : x)); }
  };
  const saveBlock = async (d) => {
    setBlocks((bs) => bs.map((b) => b.id === d.id ? d : b).sort((a, b) => a.hour - b.hour)); setEditBlock(null); flash("Updated");
    try { await base44.entities.PlannerItems.update(d.id, { title: d.title, time: `${pad(d.hour)}:00`, category: TYPE_META[d.type].cat, notes: blkNotes(d.type, d.dur), is_completed: !!d.done, updated_at: nowISO() }); } catch { flash("Couldn't save"); }
  };
  const deleteBlock = async (id) => { setBlocks((bs) => bs.filter((b) => b.id !== id)); setEditBlock(null); flash("Removed"); try { await base44.entities.PlannerItems.delete(id); } catch { /* ignore */ } };
  const toggleAnchor = async (habit) => {
    if (!user) return; const a = anchors.find((x) => x.habit === habit); if (!a) return; const next = !a.done;
    setAnchors((as) => as.map((x) => x.habit === habit ? { ...x, done: next } : x));
    try {
      if (a.logId) { await base44.entities.HabitLogs.update(a.logId, { completed: next, is_completed: next, updated_at: nowISO() }); }
      else { const created = await base44.entities.HabitLogs.create({ user_id: user.id, date: dkOf(0), habit_type: habit, habit_name: a.title, habit_category: "mindfulness", completed: next, is_completed: next, created_at: nowISO(), updated_at: nowISO() }); setAnchors((as) => as.map((x) => x.habit === habit ? { ...x, logId: created.id } : x)); }
    } catch { setAnchors((as) => as.map((x) => x.habit === habit ? { ...x, done: a.done } : x)); }
  };
  const saveIntention = async (d) => {
    if (!user) return;
    if (d.id) { setIntentions((xs) => xs.map((x) => x.id === d.id ? d : x)); setIntentDraft(null); flash("Intention set"); try { await base44.entities.PlannerItems.update(d.id, { title: d.text, notes: intNotes(d.domain), updated_at: nowISO() }); } catch { /* ignore */ } return; }
    const temp = { id: "tmp" + Date.now(), text: d.text, domain: d.domain }; setIntentions((xs) => [...xs, temp]); setIntentDraft(null); flash("Intention set");
    try { const created = await base44.entities.PlannerItems.create({ user_id: user.id, title: d.text, date: dkOf(0), category: "wellbeing", notes: intNotes(d.domain), is_completed: false, created_at: nowISO(), updated_at: nowISO() }); setIntentions((xs) => xs.map((x) => x.id === temp.id ? { ...x, id: created.id } : x)); } catch { setIntentions((xs) => xs.filter((x) => x.id !== temp.id)); }
  };
  const removeIntention = async (id) => { setIntentions((xs) => xs.filter((x) => x.id !== id)); try { await base44.entities.PlannerItems.delete(id); } catch { /* ignore */ } };
  const handOver = async (id) => { setInvisible((xs) => xs.map((x) => x.id === id ? { ...x, handed: true } : x)); flash("Handed over — fully"); try { await base44.entities.InvisibleTask.update(id, { handed: true, handed_to: "shared", updated_at: nowISO() }); } catch { /* ignore */ } };
  const addInvisible = async (title) => { if (!title.trim() || !user) return; const temp = { id: "tmp" + Date.now(), title: title.trim(), carry: "You notice · track", handed: false }; setInvisible((xs) => [temp, ...xs]); setAddLoadOpen(null); flash("Named"); try { const c = await base44.entities.InvisibleTask.create({ user_id: user.id, title: title.trim(), carry: "You notice · track", handed: false, created_at: nowISO(), updated_at: nowISO() }); setInvisible((xs) => xs.map((x) => x.id === temp.id ? { ...x, id: c.id } : x)); } catch { setInvisible((xs) => xs.filter((x) => x.id !== temp.id)); } };
  const addAdmin = async (title) => { if (!title.trim() || !user) return; const temp = { id: "tmp" + Date.now(), title: title.trim(), due: "—", disp: null }; setAdmin((xs) => [temp, ...xs]); setAddLoadOpen(null); flash("Added"); try { const c = await base44.entities.LifeAdminItem.create({ user_id: user.id, title: title.trim(), status: "open", created_at: nowISO(), updated_at: nowISO() }); setAdmin((xs) => xs.map((x) => x.id === temp.id ? { ...x, id: c.id } : x)); } catch { setAdmin((xs) => xs.filter((x) => x.id !== temp.id)); } };
  const setDisp = async (id, disp) => { setAdmin((xs) => xs.map((x) => x.id === id ? { ...x, disp } : x)); flash(disp === "delete" ? "Let go" : disp === "delegate" ? "Delegated" : disp === "automate" ? "Set to auto" : "On the list"); try { await base44.entities.LifeAdminItem.update(id, { disposition: disp, status: disp === "delete" ? "done" : "open", updated_at: nowISO() }); } catch { /* ignore */ } };
  const changeSeason = async (s) => { setSeason(s); flash(`Season: ${SEASONS[s].label}`); if (profile?.id) { try { await base44.entities.UserProfile.update(profile.id, { life_season: s }); } catch { /* ignore */ } } };
  const planReset = (label) => { addToDay(`${label} reset`, "rest"); flash(`Planned: ${label}`); };
  const easeLoad = async () => { const drop = blocks.filter((b) => b.type === "task" && !b.done); setBlocks((bs) => bs.filter((b) => !(b.type === "task" && !b.done))); flash("Lighter tasks moved off today"); for (const b of drop) { try { await base44.entities.PlannerItems.delete(b.id); } catch { /* ignore */ } } };
  const jumpTo = (idx) => { setJumpOpen(false); sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return; const boards = [...track.children].filter((c) => c.offsetWidth > 40); const child = boards[idx]; if (child) track.scrollLeft = child.offsetLeft - track.offsetLeft; };

  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crimson = cwOf("crimson").petal;
  const BOARDS = [{ t: "The day", sub: "Agenda · hour-by-hour · week" }, { t: "Reserves", sub: "Load · recovery · boundaries · energy · the load" }, { t: "Rituals", sub: "Intentions · anchors · reset · focus · rhythm" }];
  // First name for the hero — but fall back to "Your day" if it looks like a handle/username
  // (contains digits or is implausibly long), so we never greet someone as "ojihalliburton57's day".
  const rawFirst = (user?.full_name || "").split(" ")[0] || "";
  const firstName = (/\d/.test(rawFirst) || rawFirst.length > 16) ? "" : (rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1) : "");

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ display: "grid", placeItems: "center", gap: 12, color: T.muted }}>
          <Loader size={26} color={cwOf("sage").petal} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16 }}>Tending your day…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        {/* lush flora hero — phase bloom + bouquet + resting creature */}
        <FwFloraHero title={firstName ? `${firstName}'s day` : "Your day"} colorway={ph.cw} bloom={ph.bloom} flankL="iris" flankR="daffodil" titleColor={OXBLOOD}
          line="One day, tended to your energy. Build it, hold what matters, and leave room to rest." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 2 }}>
          <Bouquet items={[{ form: ph.bloom, colorway: ph.cw }, { form: "fern", colorway: "sage" }, { form: "snowdrop", colorway: "cream" }]} size={150} animate idx="elite-bq" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{ph.label} · Day {cycleDay}{season !== "steady" ? ` · ${sn.label}` : ""}</span>
        </div>

        <SummaryCard eyebrow="Today, at a glance" rows={[
          { Icon: CalendarDays, label: "Your day", text: `${blocks.length} on the plan · your peak window is ${peakLabel}`, onClick: () => jumpTo(0) },
          { Icon: Gauge, label: "Reserves", text: `${pct}% of a ${ph.label.toLowerCase()} day — ${over ? "a little full" : "room for more"}`, onClick: () => jumpTo(1) },
          { Icon: Layers, label: "The load", text: `${invisible.filter((v) => !v.handed).length} invisible · ${admin.filter((a) => !a.disp).length} admin to triage`, onClick: () => jumpTo(1) },
        ]} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setVoiceOpen(true)} className="fw-elite-press" style={focusPill(cwOf("plum").petal)}><Mic size={16} /> Speak your plan</button>
          <button onClick={() => setCalOpen(true)} className="fw-elite-press" style={focusPill(gold)}><CalendarDays size={16} /> Plan a day</button>
        </div>

        <div ref={sliderRef} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide your planner →" accent={gold}>

            <Clipboard title="The day" sub="BUILD IT · TEND IT TO YOUR ENERGY" accent={gold} flower={ph.bloom === "sunflower" ? "sunflower" : "rose"} idx="cb-day" titleColor={OXBLOOD}>
              <BoardBody>
                <DateStepper offset={offset} onStep={(d) => setOffset((o) => Math.max(-30, Math.min(60, o + d)))} phase={ph} pct={pct} over={over} />
                <AddInline onAdd={addToDay} dayName={dayLabel(offset).split(" · ").pop()} />
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Deck accent={gold}>
                    <Panel label="Agenda" Icon={ListChecks} accent={gold}><Agenda blocks={blocks} anchors={anchors} peakIdx={peakIdx} phase={ph} offset={offset} onToggle={toggleBlock} onEdit={setEditBlock} onAnchor={toggleAnchor} /></Panel>
                    <Panel label="Hour by hour" Icon={Clock} accent={gold}><Hours blocks={blocks} peakHour={HOURS[peakIdx]} onEdit={setEditBlock} onAddHour={(h) => addToDay(`block at ${fmtHour(h)}`)} /></Panel>
                    <Panel label="The week" Icon={CalendarDays} accent={gold}><Week active={offset} onPick={(o) => setOffset(o)} blockCount={blocks.length} cycleDay={cycleDay} /></Panel>
                  </Deck>
                </div>
              </BoardBody>
            </Clipboard>

            <Clipboard title="Reserves" sub="TWO TOPICS · EACH SLIDES SIDEWAYS" accent={sage} flower="snowdrop" idx="cb-res" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={cwOf("plum").petal}
                  top={[
                    <Panel key="load" label="Load" Icon={Gauge} accent={sage}><LoadLens load={load} capacity={capacity} pct={pct} over={over} onEase={over ? easeLoad : null} /></Panel>,
                    <Panel key="rec" label="Recovery" Icon={MoonI} accent={sage}><RecoveryLens recovery={recovery} onPlanRest={() => addToDay("Rest — protected", "rest")} /></Panel>,
                    <Panel key="bound" label="Boundaries" Icon={ShieldCheck} accent={sage}><BoundariesLens season={season} setSeason={changeSeason} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="energy" label="Energy" Icon={BatteryCharging} accent={cwOf("plum").petal}><EnergyLens curve={curve} peakIdx={peakIdx} peakLabel={peakLabel} phase={ph} /></Panel>,
                    <Panel key="inv" label="Invisible labour" Icon={Layers} accent={cwOf("plum").petal}><InvisibleLens items={invisible} onHand={handOver} onAdd={() => setAddLoadOpen("invisible")} /></Panel>,
                    <Panel key="admin" label="Life admin" Icon={ListChecks} accent={cwOf("plum").petal}><AdminLens items={admin} onDisp={setDisp} onAdd={() => setAddLoadOpen("admin")} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            <Clipboard title="Rituals" sub="TWO TOPICS · EACH SLIDES SIDEWAYS" accent={crimson} flower="poppy" idx="cb-rit" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crimson} bottomAccent={gold}
                  top={[
                    <Panel key="today" label="Today's intentions" Icon={Sparkles} accent={crimson}><Intentions intentions={intentions} phaseKey={phaseKey} onEdit={setIntentDraft} onAdd={() => setIntentDraft({ domain: "career", text: "" })} onRemove={removeIntention} /></Panel>,
                    <Panel key="anchors" label="Anchors" Icon={Sun} accent={crimson}><AnchorsLens anchors={anchors} onToggle={toggleAnchor} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="reset" label="Reset" Icon={Wind} accent={gold}><ResetLens onPlan={planReset} /></Panel>,
                    <Panel key="focus" label="Focus" Icon={Timer} accent={gold}><FocusLens blocks={blocks} onStart={() => flash("Focus session — 25 min, I'm with you")} onFirstStep={(t) => flash(`First 2 minutes: ${t}`)} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}><Pollinator kind="butterfly" size={34} color={ph.hue} color2={cwOf(ph.cw).tip} pattern="bands" animate idx="elite-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 300, lineHeight: 1.55 }}>A planned day is a tended one. Only the few things that are truly yours.</p>
      </div>

      {editBlock && <BlockSheet draft={editBlock} peakHour={HOURS[peakIdx]} onClose={() => setEditBlock(null)} onSave={saveBlock} onDelete={() => deleteBlock(editBlock.id)} />}
      {intentDraft && <IntentionSheet draft={intentDraft} onClose={() => setIntentDraft(null)} onSave={saveIntention} />}
      {voiceOpen && <VoiceSheet onClose={() => setVoiceOpen(false)} onParse={(t) => { addToDay(t); setVoiceOpen(false); }} />}
      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
      {addLoadOpen && <AddLoadSheet kind={addLoadOpen} onClose={() => setAddLoadOpen(null)} onAdd={(t) => addLoadOpen === "invisible" ? addInvisible(t) : addAdmin(t)} />}
      {toast && <div className="fw-elite-in" style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>}
    </div>
  );
}

// ── lens components (real-data-driven) ───────────────────────────────────────
function DateStepper({ offset, onStep, phase, pct, over }) {
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  return (
    <div style={{ marginBottom: 10, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={() => onStep(-1)} aria-label="Previous day" className="fw-elite-press" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.inkSoft, cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronLeft size={16} /></button>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: T.ink }}>{dayLabel(offset)}</span>
        <button onClick={() => onStep(1)} aria-label="Next day" className="fw-elite-press" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.inkSoft, cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronRight size={16} /></button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: phase.hue, flexShrink: 0 }} />
        <span style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(58,44,26,0.10)", overflow: "hidden", position: "relative" }}>
          <span style={{ position: "absolute", inset: 0, width: `${Math.min(130, pct) / 130 * 100}%`, background: barColor, transition: "width .3s" }} />
          <span style={{ position: "absolute", top: 0, left: `${100 / 130 * 100}%`, height: "100%", width: 2, background: "rgba(58,44,26,0.28)" }} />
        </span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: barColor, flexShrink: 0 }}>{pct}% full</span>
      </div>
    </div>
  );
}
function AddInline({ onAdd, dayName }) {
  const [text, setText] = useState("");
  const submit = () => { if (text.trim()) { onAdd(text); setText(""); } };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 6px 6px 12px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, marginBottom: 10, flexShrink: 0 }}>
      <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={`Add to ${dayName.toLowerCase()}…`} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontFamily: SERIF, fontSize: 15, color: T.ink }} />
      <button onClick={submit} aria-label="Add to your day" className="fw-elite-press" style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: cwOf("gold").petal, border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={16} /></button>
    </div>
  );
}
function Agenda({ blocks, anchors, peakIdx, phase, offset, onToggle, onEdit, onAnchor }) {
  const groups = ["Morning", "Afternoon", "Evening"];
  const byGroup = groups.map((g) => ({ g, items: blocks.filter((b) => partOfDay(b.hour) === g) })).filter((x) => x.items.length);
  return (
    <div style={{ flex: 1 }}>
      {offset === 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ ...lbl, marginBottom: 6 }}>Daily anchors</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {anchors.map((a) => (
              <button key={a.habit} onClick={() => onAnchor(a.habit)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, cursor: "pointer", background: a.done ? `${cwOf("sage").petal}1F` : T.paperHi, border: `1px solid ${a.done ? cwOf("sage").petal : T.paperDeep}`, fontFamily: UI, fontSize: 13, fontWeight: 600, color: a.done ? T.muted : T.inkSoft }}>
                {a.slot === "am" ? <Sun size={12} color={cwOf("gold").petal} /> : <Moon size={12} color={cwOf("plum").petal} />}
                <span style={{ textDecoration: a.done ? "line-through" : "none" }}>{a.title}</span>{a.done && <Check size={12} color={cwOf("sage").petal} />}
              </button>
            ))}
          </div>
        </div>
      )}
      {byGroup.length === 0 && <div style={{ textAlign: "center", padding: "24px 8px", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted }}>Nothing planned yet — a soft, open day. Add the first thing above, or speak it.</div>}
      {byGroup.map(({ g, items }) => (
        <div key={g} style={{ marginBottom: 10 }}>
          <div style={{ ...lbl, color: phase.hue, marginBottom: 6 }}>{g}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((b) => {
              const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal;
              const peak = !b.done && b.hour >= HOURS[peakIdx] - 1 && b.hour <= HOURS[peakIdx] + 2;
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 9, ...subCard(tcw), padding: "7px 10px", background: T.paperHi }}>
                  <button onClick={() => onToggle(b.id)} aria-label={b.done ? "Mark not done" : "Mark done"} className="fw-elite-press" style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: "pointer", border: `1.5px solid ${b.done ? cwOf("sage").petal : T.paperDeep}`, background: b.done ? cwOf("sage").petal : "transparent", display: "grid", placeItems: "center" }}>{b.done && <Check size={12} color="#fff" />}</button>
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, width: 40, flexShrink: 0 }}>{fmtHour(b.hour)}</span>
                  <button onClick={() => onEdit(b)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: b.done ? T.muted : T.ink, textDecoration: b.done ? "line-through" : "none", lineHeight: 1.2 }}>{b.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1, flexWrap: "wrap" }}>
                      <tm.Icon size={11} color={tcw} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{tm.label}</span>
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: tcw, background: `${tcw}1A`, borderRadius: 999, padding: "0 7px" }}>{tm.energy}</span>
                      {peak && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: phase.hue }}>· peak</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p style={{ marginTop: "auto", paddingTop: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Tap a block to edit · tick to complete · the dot is its energy.</p>
    </div>
  );
}
function Hours({ blocks, peakHour, onEdit, onAddHour }) {
  return (
    <div style={{ flex: 1 }}>
      {HOURS.map((h) => {
        const here = blocks.filter((b) => b.hour === h); const isPeak = h === peakHour;
        return (
          <div key={h} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8, alignItems: "start", minHeight: 30, padding: "2px 0", borderTop: `1px solid ${T.paperDeep}55` }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isPeak ? PHASE.follicular.hue : T.muted, paddingTop: 5, textAlign: "right" }}>{fmtHour(h)}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 3 }}>
              {here.length === 0
                ? <button onClick={() => onAddHour(h)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, border: `1px dashed ${T.paperDeep}`, background: "transparent", color: T.muted, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Plus size={11} /> Add</button>
                : here.map((b) => { const tm = TYPE_META[b.type] || TYPE_META.task, tcw = cwOf(tm.cw).petal; return (
                    <button key={b.id} onClick={() => onEdit(b)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", borderRadius: 10, background: `${tcw}1A`, borderLeft: `3px solid ${tcw}`, border: "none", cursor: "pointer", textAlign: "left" }}>
                      <tm.Icon size={12} color={tcw} style={{ flexShrink: 0 }} /><span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, textDecoration: b.done ? "line-through" : "none" }}>{b.title}</span>
                      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginLeft: "auto" }}>{b.dur}m</span></button>); })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function Week({ active, onPick, blockCount, cycleDay }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginBottom: 10 }}>This week — each day carries its phase. Lean into the bright days, soften the tender ones.</div>
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: 7 }, (_, o) => {
          const hue = PHASE[phaseForDay(((cycleDay - 1 + o) % 28) + 1, 5, 28)].hue; const d = new Date(); d.setDate(d.getDate() + (o - ((active % 7 + 7) % 7)));
          const dd = new Date(); dd.setDate(dd.getDate() + o);
          const wd = dd.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2); const isActive = o === active;
          return (
            <button key={o} onClick={() => onPick(o)} className="fw-elite-press" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 1px", borderRadius: 11, cursor: "pointer", background: isActive ? `${hue}1F` : "transparent", border: isActive ? `1.5px solid ${hue}` : `1px solid ${T.paperDeep}` }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: isActive ? T.ink : T.muted }}>{wd}</span>
              <span style={{ fontFamily: UI, fontSize: 15, fontWeight: 700, color: T.ink }}>{dd.getDate()}</span>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: hue }} />
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>{isActive ? (blockCount || "–") : "·"}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, margin: "12px 0", flexWrap: "wrap" }}>
        {Object.entries(PHASE).map(([k, v]) => <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}><span style={{ width: 7, height: 7, borderRadius: 99, background: v.hue }} /> {v.label}</span>)}
      </div>
      <div style={{ ...subCard(cwOf("gold").petal), marginTop: "auto" }}><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.45 }}>Tap a day to plan it. For the wider month, open the calendar.</p></div>
    </div>
  );
}
function EnergyLens({ curve, peakIdx, peakLabel, phase }) {
  const max = Math.max(...curve);
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Your energy rises and dips through the day. {phase.note}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 46, margin: "2px 0 5px" }}>{curve.map((v, i) => <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, borderRadius: "3px 3px 0 0", background: i === peakIdx ? phase.hue : cwOf("sage").petal, opacity: i === peakIdx ? 1 : 0.42 }} />)}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 10 }}><span>7am</span><span>peak · {peakLabel}</span><span>10pm</span></div>
      <Eyebrow color={cwOf("sage").petal}>Match the task to the energy</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 10px" }}><Pill cw="plum">deep → your peak</Pill><Pill cw="gold">admin → the dip</Pill><Pill cw="sage">restorative → anytime</Pill></div>
      <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10` }}><p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.4 }}>Bright window ~{peakLabel}. Plant the boldest thing there.</p></div>
    </div>
  );
}
function LoadLens({ load, capacity, pct, over, onEase }) {
  const barColor = over ? T.crimson : pct >= 85 ? T.gold : cwOf("sage").petal;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>How full is today?</span><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: barColor }}>{pct}%</span></div>
      <div style={{ height: 9, borderRadius: 99, background: "rgba(58,44,26,0.08)", overflow: "hidden", position: "relative", marginBottom: 10 }}><div style={{ position: "absolute", inset: 0, width: `${Math.min(130, pct) / 130 * 100}%`, background: barColor, transition: "width .3s" }} /><div style={{ position: "absolute", top: 0, left: `${100 / 130 * 100}%`, height: "100%", width: 2, background: "rgba(58,44,26,0.28)" }} /></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{over ? `A little over your usual capacity. Ease one lighter task and it settles.` : `Within capacity — you've planned ${load} of about ${capacity} units of energy.`}</p>
      <div style={{ ...subCard(cwOf("plum").petal), marginBottom: 10 }}><div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 3 }}>The finitude question</div><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, margin: 0, lineHeight: 1.4 }}>What are you deliberately <b>not</b> doing today?</p></div>
      {over ? <div style={{ marginTop: "auto" }}><Pill Icon={ArrowRight} cw="plum" filled onClick={onEase}>Ease today's load</Pill></div> : <p style={{ marginTop: "auto", fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Leaving room is the plan working, not failing.</p>}
    </div>
  );
}
function RecoveryLens({ recovery, onPlanRest }) {
  const stats = recovery ? [recovery.sleep && { k: "Sleep", v: recovery.sleep, cw: "plum" }, recovery.readiness != null && { k: "Readiness", v: String(recovery.readiness), cw: "gold" }, recovery.hrv != null && { k: "HRV", v: `${recovery.hrv}ms`, cw: "crimson" }].filter(Boolean) : [];
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>Rest is a booking, not a leftover.{recovery ? "" : " Connect a wearable, or log a check-in, and your recovery shows here."}</p>
      {stats.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>{stats.map((s) => <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 10, ...subCard(cwOf(s.cw).petal) }}><span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, width: 70 }}>{s.v}</span><span style={{ ...lbl, color: cwOf(s.cw).petal }}>{s.k}</span></div>)}</div>}
      {stats.length === 0 && <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10`, marginBottom: 12 }}><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.45 }}>No wearable data yet — but you can still protect a rest block before the day fills.</p></div>}
      <div style={{ marginTop: "auto" }}><Pill Icon={MoonI} cw="sage" filled onClick={onPlanRest}>Plan a rest block</Pill></div>
    </div>
  );
}
function BoundariesLens({ season, setSeason }) {
  const sn = SEASONS[season] || SEASONS.steady;
  return (
    <div style={{ flex: 1 }}>
      <Eyebrow color={cwOf("sage").petal}>Protected windows</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "8px 0 12px" }}>{["Evenings after 8 — no work", "Sunday — open, unplanned"].map((w) => <div key={w} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(cwOf("sage").petal) }}><ShieldCheck size={14} color={cwOf("sage").petal} style={{ flexShrink: 0 }} /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{w}</span></div>)}</div>
      <Eyebrow color={cwOf("plum").petal}>Your season of life</Eyebrow>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "4px 0 8px" }}>{sn.note}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{Object.entries(SEASONS).map(([k, v]) => <Pill key={k} Icon={v.Icon} cw={k === "newbaby" ? "blush" : k === "perimenopause" ? "sage" : k === "caregiving" ? "plum" : "gold"} active={season === k} onClick={() => setSeason(k)}>{v.label}</Pill>)}</div>
    </div>
  );
}
function InvisibleLens({ items, onHand, onAdd }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, lineHeight: 1.4, margin: "0 0 9px" }}>The work no one sees — name it, then hand it over <i>fully</i>.</p>
      {items.length === 0 && <p style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, margin: "0 0 8px" }}>Nothing named yet. Add the mental load you're carrying.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items.slice(0, 4).map((v) => (
        <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(v.handed ? cwOf("sage").petal : cwOf("plum").petal), padding: "9px 11px" }}>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{v.title}</div><div style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: v.handed ? cwOf("sage").petal : T.muted }}>{v.handed ? "Handed over — fully" : v.carry}</div></div>
          {v.handed ? <Check size={16} color={cwOf("sage").petal} style={{ flexShrink: 0 }} /> : <button onClick={() => onHand(v.id)} className="fw-elite-press" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, background: cwOf("plum").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><UserPlus size={12} /> Hand over</button>}
        </div>
      ))}</div>
      <div style={{ marginTop: "auto", paddingTop: 8 }}><Pill Icon={Plus} cw="plum" onClick={onAdd}>Name something</Pill></div>
    </div>
  );
}
function AdminLens({ items, onDisp, onAdd }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, lineHeight: 1.4, margin: "0 0 9px" }}>Biased toward <b>less</b> — go, delegate or automate before "do".</p>
      {items.length === 0 && <p style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, margin: "0 0 8px" }}>No admin yet. Add the bits that nag at you.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{items.slice(0, 3).map((a) => {
        const chosen = ADMIN_DISP.find((d) => d.id === a.disp);
        return (
          <div key={a.id} style={{ ...subCard(a.disp ? cwOf(chosen.cw).petal : cwOf("gold").petal), padding: "8px 10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 6 }}><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{a.title}</span><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted }}>{a.due}</span></div>
            {chosen ? <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 13, fontWeight: 700, color: cwOf(chosen.cw).petal }}><chosen.Icon size={13} /> {chosen.label === "Delete" ? "Let go" : chosen.label === "Do it" ? "On the list" : chosen.label + "d"}</div> : <div style={{ display: "flex", gap: 5 }}>{ADMIN_DISP.map((d) => <button key={d.id} onClick={() => onDisp(a.id, d.id)} className="fw-elite-press" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "5px 3px", borderRadius: 9, background: `${cwOf(d.cw).petal}14`, border: `1px solid ${cwOf(d.cw).petal}55`, color: T.inkSoft, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><d.Icon size={12} color={cwOf(d.cw).petal} />{d.label}</button>)}</div>}
          </div>
        );
      })}</div>
      <div style={{ marginTop: "auto", paddingTop: 8 }}><Pill Icon={Plus} cw="gold" onClick={onAdd}>Add admin</Pill></div>
    </div>
  );
}
function Intentions({ intentions, phaseKey, onEdit, onAdd, onRemove }) {
  const lean = { menstrual: ["rest", "self"], follicular: ["career", "create"], ovulatory: ["career", "love"], luteal: ["rest", "friend"] }[phaseKey] || ["self"];
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 10px", lineHeight: 1.5 }}>Up to three. Not tasks — what would make today feel like yours.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{intentions.slice(0, 3).map((it) => {
        const d = domainOf(it.domain), dcw = cwOf(d.cw).petal;
        return (
          <div key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 9, ...subCard(dcw) }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: `${dcw}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><d.Icon size={13} color={dcw} /></span>
            <button onClick={() => onEdit(it)} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}><div style={{ ...lbl, color: dcw, marginBottom: 2 }}>{d.label}</div><div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.35 }}>{it.text}</div></button>
            <button onClick={() => onRemove(it.id)} aria-label="Remove intention" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, flexShrink: 0 }}><X size={15} /></button>
          </div>
        );
      })}</div>
      {intentions.length < 3 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ ...lbl, marginBottom: 6 }}>Add one — {PHASE[phaseKey].label.toLowerCase()} leans toward</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{lean.map(domainOf).map((d) => <Pill key={d.id} Icon={d.Icon} cw={d.cw} onClick={() => onEdit({ domain: d.id, text: "" })}>{d.label}</Pill>)}<Pill Icon={Plus} cw="gold" onClick={onAdd}>Other</Pill></div>
        </div>
      )}
    </div>
  );
}
function AnchorsLens({ anchors, onToggle }) {
  const groups = [{ slot: "am", label: "Morning", Icon: Sun, cw: "gold" }, { slot: "pm", label: "Evening", Icon: Moon, cw: "plum" }];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
      {groups.map((g) => {
        const items = anchors.filter((a) => a.slot === g.slot), done = items.filter((a) => a.done).length, accent = cwOf(g.cw).petal;
        return (
          <div key={g.slot}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><g.Icon size={15} color={accent} /><span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink }}>{g.label}</span><span style={{ ...lbl, marginLeft: "auto" }}>{done}/{items.length}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{items.map((a) => <button key={a.habit} onClick={() => onToggle(a.habit)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "7px 11px", borderRadius: 11, background: T.paperHi, border: `1px solid ${T.paperDeep}`, cursor: "pointer" }}><span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${a.done ? accent : T.paperDeep}`, background: a.done ? accent : "transparent", display: "grid", placeItems: "center" }}>{a.done && <Check size={13} color="#fff" />}</span><span style={{ fontFamily: SERIF, fontSize: 15, color: a.done ? T.muted : T.ink, textDecoration: a.done ? "line-through" : "none" }}>{a.title}</span></button>)}</div>
          </div>
        );
      })}
    </div>
  );
}
function ResetLens({ onPlan }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 6px" }}>Stress isn't finished when the stressor is. <b>Complete the cycle.</b></p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>{RESETS.map((r) => <button key={r.id} onClick={() => onPlan(r.label)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", borderRadius: 14, cursor: "pointer", background: `${cwOf(r.cw).petal}12`, border: `1px solid ${cwOf(r.cw).petal}55`, textAlign: "left" }}><span style={{ width: 30, height: 30, borderRadius: 9, background: `${cwOf(r.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={15} color={cwOf(r.cw).petal} /></span><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>{r.label}</span></button>)}</div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Tap one to plant it as a protected reset.</p>
    </div>
  );
}
function FocusLens({ blocks, onStart, onFirstStep }) {
  const stuck = blocks.filter((b) => !b.done && b.type === "focus")[0] || blocks.filter((b) => !b.done)[0];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>For a low-capacity or foggy day. Borrow some focus — start small, with company.</p>
      <div style={{ ...subCard(cwOf("gold").petal), marginBottom: 10 }}><div style={{ ...lbl, color: cwOf("gold").petal, marginBottom: 4 }}>Body-double session</div><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "0 0 9px", lineHeight: 1.45 }}>25 minutes, gently timed, "I'm working alongside you."</p><Pill Icon={Timer} cw="gold" filled onClick={onStart}>Start a 25-min focus</Pill></div>
      {stuck && <div style={{ ...subCard(cwOf("plum").petal) }}><div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 4 }}>The 2-minute first step</div><p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: "0 0 9px", lineHeight: 1.45 }}>Don't do "{stuck.title}". Just open it for two minutes.</p><Pill Icon={ArrowRight} cw="plum" filled onClick={() => onFirstStep(stuck.title)}>Start the first 2 minutes</Pill></div>}
    </div>
  );
}

// ── sheets ──
function BlockSheet({ draft, peakHour, onClose, onSave, onDelete }) {
  const [d, setD] = useState(draft);
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <SheetShell title="Edit" eyebrowText="Your day" accent={cwOf("gold").petal} onClose={onClose}>
      <label style={fieldLabel}>What is it?</label>
      <input autoFocus value={d.title} onChange={(e) => set("title", e.target.value)} style={{ ...inputBase, marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={fieldLabel}>When</label><select value={d.hour} onChange={(e) => set("hour", Number(e.target.value))} style={inputBase}>{HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}{h === peakHour ? " · peak" : ""}</option>)}</select></div>
        <div><label style={fieldLabel}>How long</label><select value={d.dur} onChange={(e) => set("dur", Number(e.target.value))} style={inputBase}>{[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}</select></div>
      </div>
      <label style={fieldLabel}>Kind · energy</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{Object.entries(TYPE_META).map(([k, v]) => <button key={k} onClick={() => set("type", k)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, background: d.type === k ? cwOf(v.cw).petal : T.paper, color: d.type === k ? "#fff" : T.inkSoft, border: `1px solid ${d.type === k ? cwOf(v.cw).petal : T.paperDeep}`, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><v.Icon size={12} color={d.type === k ? "#fff" : cwOf(v.cw).petal} /> {v.label} · {v.energy}</button>)}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onDelete} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "12px 14px", borderRadius: 12, background: "transparent", color: T.crimson, border: `1px solid ${T.crimson}55`, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Trash2 size={13} /> Remove</button>
        <button onClick={() => d.title.trim() && onSave(d)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: cwOf("gold").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Save</button>
      </div>
    </SheetShell>
  );
}
function IntentionSheet({ draft, onClose, onSave }) {
  const [d, setD] = useState(draft);
  const dom = domainOf(d.domain);
  return (
    <SheetShell title="An intention" eyebrowText="What matters today" accent={cwOf("crimson").petal} onClose={onClose}>
      <label style={fieldLabel}>Which part of life?</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>{DOMAINS.map((x) => <button key={x.id} onClick={() => setD((s) => ({ ...s, domain: x.id }))} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 999, background: d.domain === x.id ? cwOf(x.cw).petal : T.paper, color: d.domain === x.id ? "#fff" : T.inkSoft, border: `1px solid ${d.domain === x.id ? cwOf(x.cw).petal : T.paperDeep}`, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}><x.Icon size={12} color={d.domain === x.id ? "#fff" : cwOf(x.cw).petal} /> {x.label}</button>)}</div>
      <label style={fieldLabel}>The intention</label>
      <input autoFocus value={d.text} onChange={(e) => setD((s) => ({ ...s, text: e.target.value }))} placeholder={dom.prompt} style={{ ...inputBase, marginBottom: 8 }} />
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 16px" }}>{dom.prompt}</p>
      <button onClick={() => d.text.trim() && onSave(d)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf("crimson").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Set this intention</button>
    </SheetShell>
  );
}
function VoiceSheet({ onClose, onParse }) {
  const [text, setText] = useState("");
  return (
    <SheetShell title="Speak your plan" eyebrowText="Say it like you'd say it" accent={cwOf("plum").petal} onClose={onClose}>
      <div style={{ display: "grid", placeItems: "center", margin: "4px 0 14px" }}><span style={{ width: 64, height: 64, borderRadius: 999, background: `${cwOf("plum").petal}1F`, display: "grid", placeItems: "center" }}><Mic size={26} color={cwOf("plum").petal} /></span></div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, textAlign: "center", margin: "0 0 14px", lineHeight: 1.5 }}>Type it the way you'd tell a friend — "deep work at 10" — and I'll lay it into your day.</p>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Deep work at 10am…" style={{ ...inputBase, marginBottom: 14 }} />
      <button onClick={() => text.trim() && onParse(text)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf("plum").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Lay it into my day</button>
    </SheetShell>
  );
}
function AddLoadSheet({ kind, onClose, onAdd }) {
  const [text, setText] = useState("");
  const inv = kind === "invisible";
  return (
    <SheetShell title={inv ? "Name the load" : "Add admin"} eyebrowText={inv ? "The invisible work" : "Life admin"} accent={cwOf(inv ? "plum" : "gold").petal} onClose={onClose}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>{inv ? "The thing you're quietly noticing, deciding and remembering." : "The renewal, form or errand that's been nagging."}</p>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={inv ? "Kids' dentist — book + remember" : "Car insurance renewal"} style={{ ...inputBase, marginBottom: 14 }} />
      <button onClick={() => text.trim() && onAdd(text)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: cwOf(inv ? "plum" : "gold").petal, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{inv ? "Name it" : "Add it"}</button>
    </SheetShell>
  );
}
