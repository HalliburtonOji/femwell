// UniversalCalendarDemo — DEMO-FIRST preview of the "One Universal Calendar + Calendar-as-Logger"
// system (plan doc: femwell-handoff/UNIVERSAL-CALENDAR-LOGGER.html). Reachable from the IDEAS pill.
//
// Shows the WHOLE flow, tappable/testable, seeded (NO base44 writes — demo only, live pages/logger
// untouched):
//   • ONE universal FwCalendar (cream / flora / oxblood, real card chrome) — the calendar used everywhere
//   • the persistent CALENDAR ICON top-bar-right entry (replaces the "+" FAB)
//   • the opened calendar's general "Log for today" button
//   • tap a PAST/TODAY day → LOG sheet (retrospective: meals/mood/symptom/water/…)
//   • tap a FUTURE day → PLAN sheet — retrospective health/symptom/mood logging is BLOCKED
//     ("you can't log a headache for tomorrow"); only plannable types (meal/menu, event, reminder,
//     habit, med) are offered. The gate is by DATA TYPE, not life-stage.
//   • the Planner day-view time-slot → opens the sheet with date + TIME prefilled
//   • the rebuilt opaque log/plan modal with the date·time row up top + LOG-vs-PLAN switching
//
// LOCKED DECISIONS baked in (Halli, 2026-07-05): icon = top-bar right; future = PLAN not LOG;
// gate by data type; Planner 2nd-FAB folded into day-view + Event chip; demo-first.
//
// Brand: Editorial cream/plum tokens (T), Cormorant + system-sans, Lucide icons, NO EMOJI.
import { useMemo, useRef, useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  isSameMonth, isSameDay, parseISO,
} from "date-fns";
import {
  CalendarDays, X, ArrowLeft, ChevronLeft, ChevronRight, Utensils, Droplets, Smile,
  Stethoscope, StickyNote, Footprints, Pill, CalendarClock, Bell, Check, Search,
  ScanBarcode, Mic, Camera, Pen, Clock, Lock, Image as ImageIcon, ChevronDown,
  Sparkles, ListChecks, Loader2, Upload, Trash2, WandSparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, SERIF, UI, SCRIPT, PAPER_BG, Heart, useEditorialFonts } from "@/components/journal/Editorial";

// Vision-call safety (the photo read must NEVER hang). We use the app's SHARED base44
// client — it carries the real auth session on a signed-in device (a separate createClient
// instance has no session token and STALLS on auth → the infinite spinner bug). Every
// invoke is raced against an 8s timeout and every image is downscaled first, exactly like
// the app's meal-photo path. Any timeout / error / 503 → we fall back to the word
// classifier and advance, so the user is never stuck.
const VISION_TIMEOUT_MS = 8000;
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("vision-timeout")), ms)),
  ]);
}
// Downscale a data URL to a ~1000px JPEG so the payload is small (a raw multi-MB photo
// slows/stalls the call). Resolves to the original on any failure — never throws.
function downscaleDataUrl(dataUrl, maxEdge = 1000) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const long = Math.max(img.width, img.height) || 1;
          const scale = Math.min(1, maxEdge / long);
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const c = document.createElement("canvas"); c.width = w; c.height = h;
          const g = c.getContext("2d"); if (!g) { resolve(dataUrl); return; }
          g.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", 0.7));
        } catch { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch { resolve(dataUrl); }
  });
}

const OX = "#7A1A12"; // oxblood — the app-wide heading colour (BRAND_IDENTITY §1)
const PHASE = { menstrual: "#BC2E27", follicular: "#8FAF8F", ovulatory: "#D4AF37", luteal: "#8E6E8E" };

// ── the type catalogue + the LOG/PLAN gate ─────────────────────────────────────
// log  = can be recorded retrospectively (today or a past day)
// plan = can be scheduled ahead (today or a future day)
// A pure-log type (symptom/mood/water/note) on a FUTURE day is BLOCKED — that's the rule.
const TYPES = [
  { id: "meal",     label: "Meal",     Icon: Utensils,     tone: T.gold,   log: true,  plan: true,  planLabel: "Plan a meal" },
  { id: "water",    label: "Water",    Icon: Droplets,     tone: "#5E93B8",log: true,  plan: false },
  { id: "mood",     label: "Mood",     Icon: Smile,        tone: T.crimson,log: true,  plan: false },
  { id: "symptom",  label: "Symptom",  Icon: Stethoscope,  tone: PHASE.menstrual, log: true, plan: false },
  { id: "note",     label: "Note",     Icon: StickyNote,   tone: T.plum || "#8E6E8E", log: true, plan: false },
  { id: "habit",    label: "Habit",    Icon: Footprints,   tone: T.sage,   log: true,  plan: true,  planLabel: "Plan a habit" },
  { id: "med",      label: "Med",      Icon: Pill,         tone: T.blush,  log: true,  plan: true,  planLabel: "Set a med reminder" },
  { id: "event",    label: "Event",    Icon: CalendarClock,tone: "#A6862B",log: true,  plan: true,  planLabel: "Plan an event" },
  { id: "reminder", label: "Reminder", Icon: Bell,         tone: T.muted,  log: false, plan: true,  planLabel: "Set a reminder" },
];
const TYPE = Object.fromEntries(TYPES.map(t => [t.id, t]));
const DOT = { meal: T.gold, water: "#5E93B8", mood: T.sage, symptom: T.crimson, note: "#8E6E8E", habit: T.sage, med: T.blush, event: "#A6862B", reminder: T.muted };

const iso = (d) => format(d, "yyyy-MM-dd");
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
const TODAY_STR = iso(TODAY);

// seed a few entries around today so the calendar reads real
const SEED = (() => {
  const m = {};
  const add = (d, type, plan = false) => { const k = iso(addDays(TODAY, d)); (m[k] ||= []).push({ type, plan }); };
  add(-14, "symptom"); add(-14, "mood");
  add(-13, "meal"); add(-2, "meal"); add(-2, "water");
  add(-1, "mood"); add(-1, "symptom");
  add(0, "meal"); add(0, "water");
  add(3, "event", true); add(5, "meal", true); // future = planned
  return m;
})();

function cyclePhase(dateStr) {
  // simple demo cycle: period days -14..-10 relative to a 28-day loop anchored 14d ago
  const last = addDays(TODAY, -14);
  const diff = Math.floor((parseISO(dateStr) - last) / 86400000);
  if (diff < 0) return null;
  const day = (((diff % 28) + 28) % 28) + 1;
  if (day <= 5) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulatory";
  return "luteal";
}

// ── the universal calendar grid ────────────────────────────────────────────────
function FwCalendar({ month, onPrev, onNext, onSelectDate, entries }) {
  const gStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = []; for (let d = gStart; d <= gEnd; d = addDays(d, 1)) days.push(new Date(d));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={onPrev} style={navBtn} aria-label="Previous month"><ChevronLeft size={16} color={OX} /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 24, color: OX, lineHeight: 1 }}>{format(month, "MMMM")}</div>
          <div style={{ fontFamily: UI, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: T.gold, marginTop: 2 }}>{format(month, "yyyy")} · your month</div>
        </div>
        <button onClick={onNext} style={navBtn} aria-label="Next month"><ChevronRight size={16} color={OX} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: UI, fontSize: 9.5, fontWeight: 700, color: T.muted }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {days.map((day, i) => {
          const ds = iso(day);
          const inMonth = isSameMonth(day, month);
          const isTod = ds === TODAY_STR;
          const isFuture = ds > TODAY_STR;
          const ph = cyclePhase(ds);
          const es = entries[ds] || [];
          let bg = "transparent";
          if (ph === "menstrual") bg = "rgba(188,46,39,0.12)";
          else if (ph === "ovulatory") bg = "rgba(212,175,55,0.14)";
          else if (ph === "follicular") bg = "rgba(143,175,143,0.16)";
          return (
            <button
              key={i}
              onClick={() => inMonth && onSelectDate(ds, isFuture)}
              disabled={!inMonth}
              style={{
                aspectRatio: "1 / 1", minHeight: 40, borderRadius: 10, cursor: inMonth ? "pointer" : "default",
                border: isTod ? `1.6px solid ${OX}` : "1px solid transparent",
                background: bg, position: "relative", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 0,
                opacity: inMonth ? (isFuture ? 0.62 : 1) : 0.16,
              }}
            >
              <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: isTod ? 800 : 500, color: isTod ? OX : T.ink }}>{format(day, "d")}</span>
              {es.length > 0 && (
                <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                  {es.slice(0, 3).map((e, j) => (
                    <span key={j} style={{ width: 4, height: 4, borderRadius: "50%", background: DOT[e.type] || T.muted, outline: e.plan ? `1px solid ${T.paperHi}` : "none", opacity: e.plan ? 0.85 : 1 }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.paperDeep}` }}>
        {[["Period", T.crimson], ["Fertile", T.sage], ["Mood", T.sage], ["Meal", T.gold], ["Plan", "#A6862B"]].map(([l, c]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 9.5, color: T.muted }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── the demo page ──────────────────────────────────────────────────────────────
export default function UniversalCalendarDemo() {
  useEditorialFonts();
  const [month, setMonth] = useState(startOfMonth(TODAY));
  const [calOpen, setCalOpen] = useState(false);
  // sheet stages: null | {stage:'day', mode, date} | {stage:'form', mode, date, time?, type} | {stage:'done', ...}
  const [sheet, setSheet] = useState(null);
  const [entries, setEntries] = useState(SEED);
  const [toast, setToast] = useState("");

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 1900); };

  const openDay = (date, isFuture) => {
    setCalOpen(false);
    setSheet({ stage: "day", mode: isFuture ? "plan" : "log", date });
  };
  const openForm = (date, type, time) => {
    const isFuture = date > TODAY_STR;
    setSheet({ stage: "form", mode: isFuture ? "plan" : "log", date, type, time });
  };
  const confirm = () => {
    const { date, type, mode } = sheet;
    setEntries((prev) => {
      const next = { ...prev };
      next[date] = [...(next[date] || []), { type, plan: mode === "plan" }];
      return next;
    });
    setSheet((s) => ({ ...s, stage: "done" }));
  };

  // one-flow + smart-picture commit a BATCH of entries in a single save
  const commitEntries = (list) => {
    setEntries((prev) => {
      const next = { ...prev };
      for (const it of list) {
        if (!it?.date) continue;
        next[it.date] = [...(next[it.date] || []), { type: it.type, plan: !!it.plan }];
      }
      return next;
    });
  };

  const closeAll = () => { setSheet(null); setCalOpen(false); };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 60 }}>
      {/* ── mock page top bar with the persistent CALENDAR ICON (top-right) ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px 12px", background: "rgba(236,231,218,0.86)", backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${T.paperDeep}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Heart size={18} />
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 19, color: OX }}>Today</span>
        </div>
        <button onClick={() => setCalOpen(true)} aria-label="Open calendar" style={{
          width: 42, height: 42, borderRadius: 13, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
          display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(11,8,5,0.10)",
        }}>
          <CalendarDays size={20} color={OX} />
        </button>
      </div>

      {/* ── intro ── */}
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "18px 16px 6px" }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: T.gold }}>Demo · plan-first · nothing live changed</div>
        <h1 style={{ fontFamily: SCRIPT, fontWeight: 400, color: OX, fontSize: 44, lineHeight: 1.02, margin: "6px 0 4px" }}>One calendar, one way in</h1>
        <p style={{ fontFamily: SERIF, fontSize: 17, color: T.muted, lineHeight: 1.55, margin: 0 }}>
          Tap the <b style={{ color: OX }}>calendar icon</b> (top-right) — the single way to log now. There's no more floating “+”.
          Touch a <b>past or today</b> day to <b>log</b> it; touch a <b>future</b> day to <b>plan</b> it.
        </p>
      </div>

      {/* ── the LOG vs PLAN rule card ── */}
      <div style={{ maxWidth: 460, margin: "14px auto", padding: "0 16px" }}>
        <div style={card}>
          <div style={eyebrow}>The rule Halli locked</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 12, color: OX, letterSpacing: 0.4 }}>PAST / TODAY → LOG</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, lineHeight: 1.4 }}>Record what happened — meals eaten, a headache, mood, water.</div>
            </div>
            <div style={{ width: 1, background: T.paperDeep }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 12, color: "#A6862B", letterSpacing: 0.4 }}>FUTURE → PLAN</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, lineHeight: 1.4 }}>Plan ahead — a menu, an event, a reminder. <b>You can’t log a headache for tomorrow.</b></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEW capabilities — one-tap launch for the demo ── */}
      <div style={{ maxWidth: 460, margin: "14px auto", padding: "0 16px" }}>
        <div style={{ ...card, borderColor: T.gold }}>
          <div style={{ ...eyebrow, color: T.crimson }}>New in this demo</div>
          <button onClick={() => setSheet({ stage: "dayrun", mode: "log", date: TODAY_STR })} style={{ ...typeCard, width: "100%", marginBottom: 8 }}>
            <span style={{ ...typeChip, background: `${T.crimson}22`, color: T.crimson }}><ListChecks size={15} /></span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 13.5, color: T.ink }}>Run through your whole day</div>
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Meals · water · mood · symptoms · meds — one pass, one save</div>
            </div>
          </button>
          <button onClick={() => setSheet({ stage: "smartshot", mode: "plan", date: iso(addDays(TODAY, 1)) })} style={{ ...typeCard, width: "100%" }}>
            <span style={{ ...typeChip, background: `${T.gold}22`, color: T.gold }}><WandSparkles size={15} /></span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 13.5, color: T.ink }}>Photo → log or plan anything</div>
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Meal · rota · symptom · moment — your intent routes it (try the receipt)</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── inline calendar (also openable via the icon) ── */}
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ ...card, padding: 16 }}>
          <FwCalendar
            month={month}
            onPrev={() => setMonth((m) => addMonths(m, -1))}
            onNext={() => setMonth((m) => addMonths(m, 1))}
            onSelectDate={openDay}
            entries={entries}
          />
          <button onClick={() => setSheet({ stage: "day", mode: "log", date: TODAY_STR })} style={{ ...solidBtn, marginTop: 14 }}>
            <Clock size={15} style={{ marginRight: 7, verticalAlign: -2 }} />Log for today
          </button>
        </div>
      </div>

      {/* ── mini Planner day-view: time-slot → date+time prefill ── */}
      <div style={{ maxWidth: 460, margin: "16px auto", padding: "0 16px" }}>
        <div style={card}>
          <div style={eyebrow}>Planner · tap a free hour</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: OX, marginBottom: 8 }}>Today, hour by hour</div>
          {[
            { h: 9, label: "Yoga · 30m", taken: true },
            { h: 10, label: "tap to add at 10:00", taken: false },
            { h: 13, label: "tap to add at 13:00", taken: false },
          ].map((row) => (
            <div key={row.h} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 2px", borderBottom: `1px solid ${T.paperDeep}` }}>
              <span style={{ width: 46, fontFamily: UI, fontSize: 11, color: T.muted }}>{row.h <= 12 ? row.h : row.h - 12} {row.h < 12 ? "AM" : "PM"}</span>
              {row.taken ? (
                <span style={{ ...pill, background: OX, color: T.paper, borderColor: OX }}>{row.label}</span>
              ) : (
                <button onClick={() => openForm(TODAY_STR, "event", `${String(row.h).padStart(2, "0")}:00`)}
                  style={{ ...pill, cursor: "pointer", background: "rgba(168,137,63,0.14)", borderColor: T.gold, color: OX, textAlign: "left", flex: 1 }}>
                  + {row.label}
                </button>
              )}
            </div>
          ))}
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 8 }}>
            Tapping a slot opens the sheet with the <b>date + time</b> already set. The old espresso “+” planner FAB is folded in here.
          </div>
        </div>
      </div>

      {/* ── the calendar SHEET (opened via the top-right icon) ── */}
      {calOpen && (
        <Backdrop onClose={() => setCalOpen(false)}>
          <Sheet>
            <SheetHead title="Calendar" onClose={() => setCalOpen(false)} />
            <FwCalendar
              month={month}
              onPrev={() => setMonth((m) => addMonths(m, -1))}
              onNext={() => setMonth((m) => addMonths(m, 1))}
              onSelectDate={openDay}
              entries={entries}
            />
            <button onClick={() => setSheet({ stage: "day", mode: "log", date: TODAY_STR }) || setCalOpen(false)} style={{ ...solidBtn, marginTop: 14 }}>
              <Clock size={15} style={{ marginRight: 7, verticalAlign: -2 }} />Log for today
            </button>
            <p style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted, textAlign: "center", marginTop: 8 }}>
              …or tap any day to tend it.
            </p>
          </Sheet>
        </Backdrop>
      )}

      {/* ── the DAY sheet + FORM + DONE ── */}
      {sheet && (
        <Backdrop onClose={closeAll}>
          <Sheet>
            {sheet.stage === "day" && <DaySheet sheet={sheet} entries={entries}
              onPick={(type) => openForm(sheet.date, type)}
              onRunDay={() => setSheet({ stage: "dayrun", mode: sheet.mode, date: sheet.date })}
              onSmartShot={() => setSheet({ stage: "smartshot", mode: "plan", date: sheet.date })}
              onClose={closeAll} />}
            {sheet.stage === "form" && <FormSheet sheet={sheet} onBack={() => setSheet({ stage: "day", mode: sheet.mode, date: sheet.date })} onClose={closeAll} onConfirm={confirm} setSheet={setSheet} />}
            {sheet.stage === "dayrun" && <DayRunSheet sheet={sheet}
              onBack={() => setSheet({ stage: "day", mode: sheet.mode, date: sheet.date })}
              onClose={closeAll}
              onSave={(list) => { commitEntries(list); flash(`${sheet.mode === "plan" ? "Planned" : "Logged"} your day — ${list.length} ${list.length === 1 ? "thing" : "things"}`); closeAll(); }}
              onSmartShot={() => setSheet({ stage: "smartshot", mode: "plan", date: sheet.date })} />}
            {sheet.stage === "smartshot" && <SmartShotSheet sheet={sheet}
              onBack={() => setSheet({ stage: "day", mode: sheet.mode, date: sheet.date })}
              onClose={closeAll}
              onConfirm={(list) => { commitEntries(list); const planned = list.length > 0 && list.every((x) => x.plan); flash(`${planned ? "Added" : "Logged"} ${list.length} ${planned ? "to your plan" : list.length === 1 ? "thing" : "things"}`); closeAll(); }} />}
            {sheet.stage === "done" && <DoneSheet sheet={sheet} onClose={closeAll} onAnother={() => setSheet({ stage: "day", mode: sheet.mode, date: sheet.date })} />}
          </Sheet>
        </Backdrop>
      )}

      {/* toast */}
      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 200, background: OX, color: T.paper, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999, boxShadow: "0 8px 24px rgba(11,8,5,0.3)" }}>{toast}</div>
      )}
    </div>
  );
}

// ── DAY sheet — the log/plan gate lives here ────────────────────────────────────
function DaySheet({ sheet, entries, onPick, onRunDay, onSmartShot, onClose }) {
  const { date, mode } = sheet;
  const d = parseISO(date);
  const isTod = date === TODAY_STR;
  const rel = isTod ? "Today" : date > TODAY_STR ? "Upcoming" : "Past day";
  const ph = cyclePhase(date);
  const es = entries[date] || [];
  const isFuture = date > TODAY_STR;
  const available = TYPES.filter((t) => (isFuture ? t.plan : t.log));
  const blocked = isFuture ? TYPES.filter((t) => t.log && !t.plan) : [];

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: OX, lineHeight: 1.1 }}>{format(d, "EEEE d MMMM")}</div>
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 2 }}>
            {rel}{ph ? ` · ${ph} phase` : ""}
            <span style={{ marginLeft: 8, fontWeight: 800, letterSpacing: 0.6, color: mode === "plan" ? "#A6862B" : OX }}>{mode === "plan" ? "PLAN" : "LOG"}</span>
          </div>
        </div>
        <button onClick={onClose} style={iconBtn} aria-label="Close"><X size={15} /></button>
      </div>

      {es.length > 0 && (
        <div style={{ ...inset, marginTop: 8 }}>
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>Already here: </span>
          {es.map((e, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 10, fontFamily: SERIF, fontSize: 14, color: T.ink }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: DOT[e.type] }} />{TYPE[e.type]?.label}{e.plan ? " (planned)" : ""}
            </span>
          ))}
        </div>
      )}

      {/* ── PRIMARY: run/plan the WHOLE day in one pass (one-flow) ── */}
      <button onClick={onRunDay} style={{ ...solidBtn, background: mode === "plan" ? "#A6862B" : T.crimson, marginTop: 14 }}>
        <ListChecks size={16} style={{ marginRight: 8, verticalAlign: -3 }} />
        {mode === "plan" ? "Plan the whole day" : "Run through the day"}
      </button>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, textAlign: "center", margin: "5px 0 2px" }}>
        One pass through {isFuture ? "meals, plans, reminders" : "meals, water, mood, symptoms, meds"} — quick, skippable, one save.
      </div>

      {/* ── PRIMARY: add a photo (intent-driven — food / rota / symptom / moment) ── */}
      <button onClick={onSmartShot} style={{ ...ghostBtn, width: "100%", marginTop: 8, borderColor: T.gold, color: OX }}>
        <WandSparkles size={15} style={{ marginRight: 7, verticalAlign: -2, color: T.gold }} />Add a photo — {isFuture ? "plan or log from a picture" : "log from a picture"}
      </button>

      <div style={{ ...eyebrow, marginTop: 16 }}>{isFuture ? "…or plan one thing" : "…or log one thing"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {available.map((t) => (
          <button key={t.id} onClick={() => onPick(t.id)} style={typeCard}>
            <span style={{ ...typeChip, background: `${t.tone}22`, color: t.tone }}><t.Icon size={15} /></span>
            <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 13, color: T.ink }}>{isFuture ? (t.planLabel || t.label) : t.label}</span>
          </button>
        ))}
      </div>

      {blocked.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.crimson, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <Lock size={11} /> Can’t log ahead
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {blocked.map((t) => (
              <span key={t.id} style={{ ...pill, background: T.paper, borderColor: T.paperDeep, color: T.muted, opacity: 0.7, cursor: "not-allowed" }}>
                <t.Icon size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{t.label}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, marginTop: 6 }}>
            You can’t log a headache — or mood, water, a note — for a day that hasn’t happened. Those are for today or the past.
          </div>
        </div>
      )}
    </>
  );
}

// ── FORM sheet — the rebuilt modal with the date·time row + LOG/PLAN switch ─────
function FormSheet({ sheet, onBack, onClose, onConfirm }) {
  const { date, type, mode, time } = sheet;
  const t = TYPE[type];
  const d = parseISO(date);
  const isMeal = type === "meal";
  const verb = mode === "plan" ? "Plan" : "Log";
  const dayWord = date === TODAY_STR ? "today" : format(d, "EEEE");
  // PRIMARY method = voice or type (front and centre, LOCKED). Photo is secondary.
  const [method, setMethod] = useState("type"); // 'type' | 'voice'
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoPick, setPhotoPick] = useState(null); // 'library' | 'camera'

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onBack} style={iconBtn} aria-label="Back"><ArrowLeft size={15} /></button>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, color: OX }}>{verb} {mode === "plan" ? (t.planLabel?.toLowerCase().replace(/^plan (a |an )?/, "") || t.label.toLowerCase()) : t.label.toLowerCase()}</span>
        </div>
        <button onClick={onClose} style={iconBtn} aria-label="Close"><X size={15} /></button>
      </div>

      {/* mode banner */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, padding: "3px 10px", borderRadius: 999, marginBottom: 10,
        background: mode === "plan" ? "rgba(166,134,43,0.16)" : "rgba(188,46,39,0.12)", color: mode === "plan" ? "#8a6e23" : OX }}>
        {mode === "plan" ? <CalendarClock size={12} /> : <Clock size={12} />}{mode === "plan" ? "PLANNING AHEAD" : "LOGGING"}
      </div>

      {/* THE date · time row — the new spine, prefilled + editable */}
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <div style={{ ...dtField, flex: 2 }}>
          <CalendarDays size={13} color={T.gold} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.ink }}>{format(d, "EEE d MMM")}</span>
          <span style={{ fontFamily: UI, fontSize: 11, color: T.gold, marginLeft: "auto" }}>change</span>
        </div>
        <div style={{ ...dtField, flex: 1, opacity: mode === "plan" || time ? 1 : 0.6 }}>
          <Clock size={13} color={T.gold} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.ink }}>{time || (date === TODAY_STR ? "now" : "—")}</span>
        </div>
      </div>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginBottom: 12 }}>Prefilled from where you tapped — tap to change either.</div>

      {/* ── PRIMARY methods — VOICE + TYPE, front and centre (Halli LOCKED) ── */}
      <div style={{ ...eyebrow, marginBottom: 6 }}>How to {verb.toLowerCase()} — voice or type</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setMethod("voice")} style={primaryMethod(method === "voice", T.crimson)}>
          <Mic size={20} color={method === "voice" ? T.paper : T.crimson} />
          <span>Say it</span>
          <span style={pmSub(method === "voice")}>Speak naturally</span>
        </button>
        <button onClick={() => setMethod("type")} style={primaryMethod(method === "type", OX)}>
          <Pen size={20} color={method === "type" ? T.paper : OX} />
          <span>Type it</span>
          <span style={pmSub(method === "type")}>Write it out</span>
        </button>
      </div>

      {/* the input reflects the chosen primary method */}
      {method === "voice" ? (
        <div style={{ ...inputBox, minHeight: 52, marginBottom: 8, display: "flex", alignItems: "center", gap: 8, fontStyle: "italic" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: T.crimson, flexShrink: 0 }} />
          Listening… “{isMeal ? (mode === "plan" ? "salmon and greens for dinner" : "porridge with berries") : `${t.label.toLowerCase()} ${dayWord}`}”
        </div>
      ) : (
        <div style={{ ...inputBox, minHeight: 52, marginBottom: 8 }}>
          {isMeal ? (mode === "plan" ? "What’s on the menu?" : "What did you eat? Describe it naturally…")
                  : (mode === "plan" ? `Add a ${t.label.toLowerCase()} for ${dayWord}…` : `${t.label} for ${dayWord}…`)}
        </div>
      )}

      {isMeal && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {["Morning", "Midday", "Evening", "Snack"].map((k, i) => (
            <span key={k} style={{ ...pill, background: i === 1 ? OX : T.paperHi, color: i === 1 ? T.paper : T.muted, borderColor: i === 1 ? OX : T.paperDeep }}>{k}</span>
          ))}
        </div>
      )}

      {/* ── SECONDARY methods — Photo (library OR camera) + the rest ── */}
      {isMeal && mode === "log" && (
        <>
          <div style={{ ...eyebrow, marginBottom: 6, color: T.muted }}>More ways (optional)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: photoOpen ? 8 : 4 }}>
            <button onClick={() => setPhotoOpen((v) => !v)} style={{ ...pill, cursor: "pointer", background: photoOpen ? "rgba(168,137,63,0.14)" : T.paperHi, borderColor: photoOpen ? T.gold : T.paperDeep, color: photoOpen ? OX : T.muted }}>
              <ImageIcon size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Photo
              <ChevronDown size={11} style={{ verticalAlign: -1, marginLeft: 3, transform: photoOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            </button>
            <span style={{ ...pill, background: T.paperHi, borderColor: T.paperDeep, color: T.muted }}><Search size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Search</span>
            <span style={{ ...pill, background: T.paperHi, borderColor: T.paperDeep, color: T.muted }}><ScanBarcode size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Scan</span>
          </div>

          {/* Photo expands to LIBRARY (choose existing) OR CAMERA — library is now first */}
          {photoOpen && (
            <div style={{ ...inset, marginBottom: 6 }}>
              <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.gold, marginBottom: 7 }}>Add a picture</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setPhotoPick("library")} style={photoChoice(photoPick === "library")}>
                  <ImageIcon size={17} color={OX} /><span>Choose from library</span>
                </button>
                <button onClick={() => setPhotoPick("camera")} style={photoChoice(photoPick === "camera")}>
                  <Camera size={17} color={OX} /><span>Camera</span>
                </button>
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted, marginTop: 7 }}>
                {photoPick === "library" ? "Opens your photo library — pick a photo you already took."
                  : photoPick === "camera" ? "Opens the camera to take a new photo."
                  : "Pick an existing photo from your library, or take a new one. (The old logger only opened the camera.)"}
              </div>
            </div>
          )}
        </>
      )}

      <button onClick={onConfirm} style={{ ...solidBtn, background: mode === "plan" ? "#A6862B" : T.crimson }}>
        <Check size={15} style={{ marginRight: 7, verticalAlign: -2 }} />{verb === "Plan" ? "Add to plan" : "Add to"} {verb === "Plan" ? `· ${dayWord}` : dayWord}
      </button>
    </>
  );
}

function DoneSheet({ sheet, onClose, onAnother }) {
  const { date, type, mode } = sheet;
  const dayWord = date === TODAY_STR ? "today" : format(parseISO(date), "EEEE d MMM");
  return (
    <div style={{ textAlign: "center", padding: "8px 4px" }}>
      <div style={{ width: 54, height: 54, borderRadius: 999, margin: "0 auto 12px", display: "grid", placeItems: "center", background: T.paperHi, border: `1px solid ${T.paperDeep}` }}>
        <Check size={24} color={T.sage} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: OX }}>{mode === "plan" ? "Planned" : "Logged"} for {dayWord}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "6px 0 16px" }}>
        A {TYPE[type]?.label.toLowerCase()} {mode === "plan" ? "is on your calendar" : "is on your record"} — a dot just appeared on that day.
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onAnother} style={{ ...ghostBtn, flex: 1 }}>Add another</button>
        <button onClick={onClose} style={{ ...solidBtn, flex: 1 }}>Done</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ONE-FLOW "run/plan the whole day" — a single sheet, sectioned, skippable, one save
// ════════════════════════════════════════════════════════════════════════════════
function DayRunSheet({ sheet, onBack, onClose, onSave, onSmartShot }) {
  const { date, mode } = sheet;
  const d = parseISO(date);
  const isFuture = date > TODAY_STR;
  const dayWord = date === TODAY_STR ? "today" : format(d, "EEEE d MMM");

  // Sections respect the LOG-vs-PLAN gate: a future day shows only plannable sections
  // (no retrospective water/mood/symptoms); today/past shows the full retrospective run.
  const SECTIONS = isFuture
    ? [
        { id: "meal",     label: "Meals / menu",   Icon: Utensils,     tone: T.gold,          kind: "multi", opts: ["Breakfast", "Lunch", "Dinner", "Snack"] },
        { id: "event",    label: "Events & plans", Icon: CalendarClock,tone: "#A6862B",       kind: "multi", opts: ["Work shift", "Gym", "Dinner out", "Appointment"], smart: true },
        { id: "reminder", label: "Reminders",      Icon: Bell,         tone: T.muted,         kind: "multi", opts: ["Umbrella", "Take meds", "Water bottle", "Charger"] },
        { id: "habit",    label: "Habits",         Icon: Footprints,   tone: T.sage,          kind: "multi", opts: ["Walk", "Yoga", "Reading", "Early night"] },
        { id: "med",      label: "Meds",           Icon: Pill,         tone: T.blush,         kind: "multi", opts: ["Vitamin D", "Iron", "Magnesium"] },
      ]
    : [
        { id: "meal",    label: "Meals",    Icon: Utensils,    tone: T.gold,           kind: "multi", opts: ["Breakfast", "Lunch", "Dinner", "Snack"] },
        { id: "water",   label: "Water",    Icon: Droplets,    tone: "#5E93B8",        kind: "count" },
        { id: "mood",    label: "Mood",     Icon: Smile,       tone: T.crimson,        kind: "scale" },
        { id: "symptom", label: "Symptoms", Icon: Stethoscope, tone: PHASE.menstrual,  kind: "multi", opts: ["Cramps", "Headache", "Fatigue", "Bloating", "Low mood"] },
        { id: "med",     label: "Meds",     Icon: Pill,        tone: T.blush,          kind: "multi", opts: ["Vitamin D", "Iron", "Painkiller"] },
        { id: "event",   label: "Events",   Icon: CalendarClock,tone: "#A6862B",       kind: "multi", opts: ["Work shift", "Gym", "Dinner out"] },
      ];

  const [data, setData] = useState({});
  const set = (id, v) => setData((p) => ({ ...p, [id]: v }));

  const countFor = (s) => {
    const v = data[s.id];
    if (s.kind === "multi") return (v || []).length;
    return v ? 1 : 0; // count / scale
  };
  const total = SECTIONS.reduce((n, s) => n + countFor(s), 0);
  const touched = SECTIONS.filter((s) => countFor(s) > 0).length;
  const scrollTo = (id) => document.getElementById(`dr-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const save = () => {
    const list = [];
    for (const s of SECTIONS) {
      const v = data[s.id];
      if (s.kind === "count") { if (v) list.push({ date, type: "water", plan: isFuture }); }
      else if (s.kind === "scale") { if (v) list.push({ date, type: "mood", plan: false }); }
      else (v || []).forEach(() => list.push({ date, type: s.id, plan: isFuture }));
    }
    if (list.length) onSave(list);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onBack} style={iconBtn} aria-label="Back"><ArrowLeft size={15} /></button>
          <div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: OX, lineHeight: 1.05 }}>{mode === "plan" ? "Plan the whole day" : "Run through the day"}</div>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{format(d, "EEEE d MMMM")} · <b style={{ color: mode === "plan" ? "#A6862B" : OX }}>{mode === "plan" ? "PLAN" : "LOG"}</b></div>
          </div>
        </div>
        <button onClick={onClose} style={iconBtn} aria-label="Close"><X size={15} /></button>
      </div>

      {/* jump-to rail (the app's central switcher pattern) + progress */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "2px 0 8px" }}>
        {SECTIONS.map((s) => {
          const n = countFor(s);
          return (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{ ...pill, flexShrink: 0, cursor: "pointer",
              background: n ? `${s.tone}22` : T.paperHi, borderColor: n ? s.tone : T.paperDeep, color: n ? OX : T.muted }}>
              {n ? <Check size={11} style={{ verticalAlign: -1, marginRight: 3 }} /> : null}{s.label}
            </button>
          );
        })}
      </div>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginBottom: 10 }}>
        {touched}/{SECTIONS.length} sections · {total} {total === 1 ? "thing" : "things"} · every section optional — skip freely.
      </div>

      {/* the sections, one continuous scroll */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SECTIONS.map((s) => {
          const n = countFor(s);
          return (
            <div key={s.id} id={`dr-${s.id}`} style={{ ...inset, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ ...typeChip, width: 26, height: 26, background: `${s.tone}22`, color: s.tone }}><s.Icon size={13} /></span>
                <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 13.5, color: T.ink }}>{s.label}</span>
                {n > 0 && <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.sage }}><Check size={11} style={{ verticalAlign: -1 }} /> {n}</span>}
              </div>

              {s.kind === "multi" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {s.opts.map((o) => {
                    const on = (data[s.id] || []).includes(o);
                    return (
                      <button key={o} onClick={() => set(s.id, on ? (data[s.id] || []).filter((x) => x !== o) : [...(data[s.id] || []), o])}
                        style={{ ...pill, cursor: "pointer", background: on ? s.tone : T.paperHi, color: on ? T.paper : T.muted, borderColor: on ? s.tone : T.paperDeep }}>{o}</button>
                    );
                  })}
                </div>
              )}

              {s.kind === "count" && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => set(s.id, Math.max(0, (data[s.id] || 0) - 1))} style={stepBtn}>−</button>
                  <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, minWidth: 78, textAlign: "center" }}>{data[s.id] || 0} glass{(data[s.id] || 0) === 1 ? "" : "es"}</span>
                  <button onClick={() => set(s.id, (data[s.id] || 0) + 1)} style={stepBtn}>+</button>
                </div>
              )}

              {s.kind === "scale" && (
                <div style={{ display: "flex", gap: 6 }}>
                  {["Low", "Meh", "OK", "Good", "Great"].map((lab, i) => {
                    const on = data[s.id] === i + 1;
                    return (
                      <button key={lab} onClick={() => set(s.id, on ? null : i + 1)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                        border: `1.5px solid ${on ? s.tone : T.paperDeep}`, background: on ? `${s.tone}22` : T.paperHi, color: on ? OX : T.muted, fontFamily: UI, fontSize: 11, fontWeight: 700 }}>{lab}</button>
                    );
                  })}
                </div>
              )}

              {s.smart && (
                <button onClick={onSmartShot} style={{ ...pill, cursor: "pointer", marginTop: 8, background: "rgba(168,137,63,0.14)", borderColor: T.gold, color: OX }}>
                  <WandSparkles size={12} style={{ verticalAlign: -2, marginRight: 5, color: T.gold }} />Read a photo → add shifts/events
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ONE save at the end — sticky to the sheet's bottom */}
      <div style={{ position: "sticky", bottom: 0, paddingTop: 12, marginTop: 6, background: `linear-gradient(to top, ${T.paperHi} 74%, transparent)` }}>
        <button onClick={save} disabled={total === 0} style={{ ...solidBtn, background: mode === "plan" ? "#A6862B" : T.crimson, opacity: total === 0 ? 0.45 : 1, cursor: total === 0 ? "default" : "pointer" }}>
          <Check size={15} style={{ marginRight: 7, verticalAlign: -2 }} />
          {mode === "plan" ? "Save the plan" : "Save the day"}{total > 0 ? ` · ${total} ${total === 1 ? "thing" : "things"}` : ""}
        </button>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SMART PICTURE → SCHEDULE — screenshot of a rota / event list → reviewable entries.
// Uses the EXISTING analyzeMealPhoto function (mode:"schedule") — same gpt-4o-mini +
// same OpenAI key, NO new function. ALWAYS shows a review/confirm step before saving.
// ════════════════════════════════════════════════════════════════════════════════
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
function resolveDayLabel(label) {
  // fallback: turn a weekday-only label (e.g. "Tue") into the next upcoming date.
  if (!label) return null;
  const l = String(label).toLowerCase();
  const idx = WEEKDAYS.findIndex((w) => l.includes(w.slice(0, 3)));
  if (idx < 0) return null;
  let dt = new Date(TODAY); const cur = dt.getDay();
  let add = (idx - cur + 7) % 7; if (add === 0) add = 7;
  return iso(addDays(dt, add));
}

// Draw a sample "Shift Overview" work rota to a canvas → PNG data URL, matching the real
// rota shape Halli shared (date · day · start–end · location, with a done tick). Lets the
// demo prove a real end-to-end parse without needing his actual screenshot.
function renderSampleRota() {
  const c = document.createElement("canvas");
  c.width = 760; c.height = 620;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#111111"; g.font = "bold 30px system-ui, Arial";
  g.fillText("Shift Overview", 30, 50);
  g.font = "18px system-ui, Arial"; g.fillStyle = "#555555";
  g.fillText("July 2026", 30, 80);
  // rows: [dayNum, dayName, time, done]
  const rows = [
    ["01", "Wed", "1:00 PM – 10:00 PM", false],
    ["03", "Fri", "3:00 PM – 12:00 AM", false],
    ["04", "Sat", "3:00 PM – 12:00 AM", true],
    ["09", "Thu", "1:00 PM – 10:00 PM", false],
    ["11", "Sat", "9:00 AM – 6:00 PM", false],
    ["12", "Sun", "3:00 PM – 12:00 AM", false],
  ];
  let y = 130;
  g.strokeStyle = "#dddddd"; g.lineWidth = 1;
  rows.forEach((r) => {
    g.textAlign = "left";
    g.font = "bold 24px system-ui, Arial"; g.fillStyle = "#111111";
    g.fillText(r[0], 30, y);
    g.font = "20px system-ui, Arial"; g.fillStyle = "#555";
    g.fillText(r[1], 78, y);
    g.font = "21px system-ui, Arial"; g.fillStyle = "#111";
    g.fillText(r[2], 150, y);
    g.font = "16px system-ui, Arial"; g.fillStyle = "#7A1A12";
    g.fillText("Halliburton Oji, Paddington", 150, y + 24);
    if (r[3]) { // done — green check
      g.fillStyle = "#2e9e5b"; g.font = "bold 26px system-ui, Arial";
      g.fillText("✓", 700, y);
    }
    g.beginPath(); g.moveTo(30, y + 40); g.lineTo(730, y + 40); g.stroke();
    y += 76;
  });
  return c.toDataURL("image/png");
}

// Draw a clean sample RESTAURANT RECEIPT (the food-intent example Halli gave) to a
// canvas → data URL, so the demo can show the intent→food route without a real photo.
function renderSampleReceipt() {
  const c = document.createElement("canvas");
  c.width = 400; c.height = 500;
  const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#111"; g.textAlign = "center";
  g.font = "bold 26px system-ui, Arial"; g.fillText("THE OLIVE TREE", 200, 52);
  g.font = "14px system-ui, Arial"; g.fillStyle = "#555";
  g.fillText("Bistro & Wine Bar", 200, 76);
  g.fillText(`${format(TODAY, "d MMM yyyy")}  ·  Table 12`, 200, 98);
  g.textAlign = "left"; g.fillStyle = "#111"; g.font = "17px system-ui, Arial";
  const items = [["Bruschetta", "6.50"], ["Sea bass & greens", "18.00"], ["Tiramisu", "7.00"], ["Sparkling water", "3.50"], ["Glass of red", "8.50"]];
  let y = 150; g.strokeStyle = "#ddd";
  items.forEach((it) => { g.fillText(it[0], 30, y); g.textAlign = "right"; g.fillText("£" + it[1], 370, y); g.textAlign = "left"; g.beginPath(); g.moveTo(30, y + 12); g.lineTo(370, y + 12); g.stroke(); y += 40; });
  g.font = "bold 20px system-ui, Arial"; g.fillText("TOTAL", 30, y + 14); g.textAlign = "right"; g.fillText("£43.50", 370, y + 14);
  g.textAlign = "center"; g.font = "14px system-ui, Arial"; g.fillStyle = "#777"; g.fillText("Thank you — see you soon!", 200, y + 60);
  return c.toDataURL("image/jpeg", 0.8);
}

// Client-side classifier fallback — the demo works even when the vision call can't run
// (e.g. an unauthenticated browser): the user's own words are the primary signal.
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
function guessMeal() { const h = new Date().getHours(); return h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 21 ? "dinner" : "snack"; }
function guessSymptom(t = "") { const s = t.toLowerCase(); for (const [k, v] of [["headache", "Headache"], ["migraine", "Headache"], ["cramp", "Cramps"], ["tired", "Fatigue"], ["fatigue", "Fatigue"], ["exhaust", "Fatigue"], ["nausea", "Nausea"], ["sick", "Nausea"], ["mood", "Low mood"], ["down", "Low mood"]]) if (s.includes(k)) return v; return null; }
function classifyByText(text, sampleKind) {
  const t = (text || "").toLowerCase();
  if (sampleKind === "rota" || /\b(rota|roster|shift|shifts|schedule|timetable|work week|week of)\b/.test(t))
    return { detected: "schedule", is_retrospective: false, meal_type_guess: null, title: "Work rota" };
  if (sampleKind === "receipt" || /\b(ate|eat|eaten|had|food|meal|lunch|dinner|breakfast|brunch|snack|coffee|receipt|restaurant|takeaway|takeout|dinner)\b/.test(t))
    return { detected: "food", is_retrospective: true, meal_type_guess: guessMeal(), title: "A meal" };
  if (/\b(headache|migraine|cramp|pain|nausea|nauseous|sick|dizzy|tired|fatigue|symptom|rash|sore|ache|bloated|period)\b/.test(t))
    return { detected: "symptom", is_retrospective: true, meal_type_guess: null, title: "A symptom" };
  if (/\b(moment|view|sunset|happy|lovely|memory|felt|beautiful|pet|dog|cat|selfie|walk|flowers)\b/.test(t))
    return { detected: "moment", is_retrospective: true, meal_type_guess: null, title: "A moment" };
  return { detected: "moment", is_retrospective: true, meal_type_guess: null, title: "A note" };
}

const INTENT_ROUTES = {
  food:     { type: "meal",    label: "Food",     Icon: Utensils,     tone: T.gold },
  symptom:  { type: "symptom", label: "Symptom",  Icon: Stethoscope,  tone: PHASE.menstrual },
  moment:   { type: "note",    label: "Moment",   Icon: StickyNote,   tone: T.plum || "#8E6E8E" },
  schedule: { type: "event",   label: "Schedule", Icon: CalendarClock,tone: "#A6862B" },
  other:    { type: "note",    label: "Note",     Icon: StickyNote,   tone: T.muted },
};
// The one client-owned follow-up per route (Halli: 1-2 quick, skippable, most-probable highlighted).
const FOLLOWUPS = {
  food:    { key: "meal", q: "Log it as", options: ["Breakfast", "Lunch", "Dinner", "Snack"] },
  symptom: { key: "sym",  q: "What is it", options: ["Headache", "Cramps", "Fatigue", "Nausea", "Low mood"] },
};

const ROTA_LOCATION = "Halliburton Oji, Paddington";
// Rota fallback (used only when the live parse can't run) — mirrors Halli's real "Shift
// Overview" July 2026 rota exactly: date · day · start–end · shared location, with the
// 04 Sat row already DONE (green tick) and the 3PM–12AM shifts marked overnight.
function fallbackRotaEntries() {
  const shifts = [
    // [date, day, start, end, overnight, done]
    ["2026-07-01", "Wed", "13:00", "22:00", false, false],
    ["2026-07-03", "Fri", "15:00", "00:00", true, false],
    ["2026-07-04", "Sat", "15:00", "00:00", true, true],
    ["2026-07-09", "Thu", "13:00", "22:00", false, false],
    ["2026-07-11", "Sat", "09:00", "18:00", false, false],
    ["2026-07-12", "Sun", "15:00", "00:00", true, false],
  ];
  return shifts.map((s, i) => ({
    _id: i, include: !s[5], title: "Work shift", date: s[0], day_label: s[1],
    start: s[2], end: s[3], end_next_day: s[4], location: ROTA_LOCATION, done: s[5], confidence: "high",
  }));
}

// ════════════════════════════════════════════════════════════════════════════════
// PHOTO → ANYTHING (intent-driven). Add a picture → say what it is → the app reads
// image + intent, asks a smart follow-up (most-probable pre-highlighted + "type your
// own"), guards LOG-vs-PLAN conflicts, and routes to food / symptom / moment / schedule.
// Uses the EXISTING analyzeMealPhoto function (mode:"intent" / "schedule") — no new fn/key.
// Always a review/confirm step before saving. (Component keeps the SmartShotSheet name so
// the render branch is unchanged.)
// ════════════════════════════════════════════════════════════════════════════════
function SmartShotSheet({ sheet, onBack, onClose, onConfirm }) {
  const [stage, setStage] = useState("pick"); // pick|intent|reading|guard|followups|review|schedule_review|error
  const [imageUrl, setImageUrl] = useState(null);
  const [sampleKind, setSampleKind] = useState(null);
  const [intentText, setIntentText] = useState("");
  const [cls, setCls] = useState(null);
  const [answer, setAnswer] = useState("");
  const [customOn, setCustomOn] = useState(false);
  const [customText, setCustomText] = useState("");
  const [titleEdit, setTitleEdit] = useState("");
  const [rows, setRows] = useState([]);
  const [guard, setGuard] = useState(null); // { kind, msg }
  const [target, setTarget] = useState({ date: sheet.date, mode: sheet.date > TODAY_STR ? "plan" : "log" });
  const [degraded, setDegraded] = useState(false); // vision didn't return → we went by the words
  const [schedLocation, setSchedLocation] = useState(""); // shared rota location, applied to all
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const fileRef = useRef(null);

  const pick = (url, kind) => { setImageUrl(url); setSampleKind(kind || null); setStage("intent"); };
  const onFile = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => pick(r.result, null); r.readAsDataURL(f); };

  // The photo read must NEVER hang. Race the vision call against an 8s timeout; on ANY
  // timeout / error / 503 / unusable payload, fall back to the word classifier and advance.
  // A `finally`-guaranteed route means we always leave the "reading" spinner.
  async function classify() {
    setStage("reading");
    setDegraded(false);
    let c = null, ok = false;
    try {
      const small = await downscaleDataUrl(imageUrl);
      const res = await withTimeout(base44.functions.invoke("analyzeMealPhoto", {
        mode: "intent", reference_date: TODAY_STR, intent_text: intentText,
        time_of_day: new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening",
        image_base64: small,
      }), VISION_TIMEOUT_MS);
      const d = res?.data || res;
      if (d && d.kind === "intent" && !d.analysis_unavailable && d.detected) { c = d; ok = true; }
    } catch { /* timeout / network / auth — fall through to the words */ }
    if (!c) c = { ...classifyByText(intentText, sampleKind), notes: "" }; // resilient: user's words drive it
    setDegraded(!ok);
    setCls(c);
    routeFrom(c); // always advances (guard or a route) — the spinner can never persist
  }

  function routeFrom(c) {
    const targetIsFuture = sheet.date > TODAY_STR;
    // LOG-vs-PLAN intent guard
    if (c.is_retrospective && targetIsFuture) {
      setGuard({ kind: "retro_on_future", msg: `This looks like something you ${c.detected === "food" ? "had" : "logged"} — log it for today instead of planning it for ${format(parseISO(sheet.date), "EEE d MMM")}?` });
      setStage("guard"); return;
    }
    if (c.detected === "schedule" && !targetIsFuture) {
      setGuard({ kind: "schedule_on_log", msg: `This looks like a schedule to plan ahead — add these as plans on their own dates?` });
      setStage("guard"); return;
    }
    proceed(c, { date: sheet.date, mode: targetIsFuture ? "plan" : "log" });
  }

  function resolveGuard(choice) {
    const g = guard.kind;
    if (g === "retro_on_future") {
      const t = choice === "today" ? { date: TODAY_STR, mode: "log" } : { date: sheet.date, mode: "plan" };
      proceed(cls, t);
    } else { // schedule_on_log
      if (choice === "plan") proceed({ ...cls, detected: "schedule" }, { date: sheet.date, mode: "plan" });
      else proceed({ ...cls, detected: "moment" }, { date: TODAY_STR, mode: "log" });
    }
  }

  async function proceed(c, t) {
    setTarget(t);
    if (c.detected === "schedule") { await loadSchedule(); return; }
    // set up the follow-up with the most-probable answer pre-selected
    const fu = FOLLOWUPS[c.detected];
    if (fu) {
      const rec = c.detected === "food" ? cap(c.meal_type_guess || guessMeal()) : guessSymptom(intentText);
      setAnswer(rec || fu.options[0]);
    }
    setTitleEdit(c.title || INTENT_ROUTES[c.detected]?.label || "Note");
    setStage(fu ? "followups" : "review");
  }

  async function loadSchedule() {
    setStage("reading");
    let entries = null, loc = null;
    try {
      const small = await downscaleDataUrl(imageUrl);
      const res = await withTimeout(base44.functions.invoke("analyzeMealPhoto", { mode: "schedule", reference_date: TODAY_STR, image_base64: small }), VISION_TIMEOUT_MS);
      const d = res?.data || res;
      if (Array.isArray(d?.entries) && d.entries.length && !d.analysis_unavailable) {
        loc = d.location || null;
        entries = d.entries.map((e, i) => ({
          ...e, _id: i,
          title: e.title || "Work shift",
          date: e.date || resolveDayLabel(e.day_label),
          include: !e.done,                                             // done rows default unselected
          location: e.location || d.location || null,
          end_next_day: !!e.end_next_day || (!!e.start && !!e.end && e.end <= e.start),
          done: !!e.done,
        }));
      }
    } catch { /* timeout / network / auth — fall through */ }
    if (!entries && sampleKind === "rota") { entries = fallbackRotaEntries(); loc = ROTA_LOCATION; }
    if (!entries) { setStage("error"); return; }
    // derive a shared location if every row carries the same one
    if (!loc) { const locs = [...new Set(entries.map((e) => e.location).filter(Boolean))]; if (locs.length === 1) loc = locs[0]; }
    setSchedLocation(loc || "");
    setRepeatWeekly(false);
    setRows(entries); setStage("schedule_review");
  }

  const recFor = () => cls?.detected === "food" ? cap(cls.meal_type_guess || guessMeal()) : guessSymptom(intentText);
  const finalAnswer = customOn && customText.trim() ? customText.trim() : answer;

  const saveSingle = () => {
    const route = INTENT_ROUTES[cls.detected] || INTENT_ROUTES.other;
    onConfirm([{ date: target.date, type: route.type, plan: target.mode === "plan" }]);
  };
  const setRow = (i, patch) => setRows((p) => p.map((x, j) => j === i ? { ...x, ...patch } : x));
  const selectedRows = rows.filter((r) => r.include && r.date);
  const includedWithDate = selectedRows.length;
  // "weekly-ish" only when it's genuinely easy: 2+ selected shifts that all fall on the
  // same weekday. (Halli's real rota is irregular → no offer, we just add the parsed set.)
  const weeklyish = (() => {
    const dows = selectedRows.map((r) => parseISO(r.date).getDay());
    return dows.length >= 2 && new Set(dows).size === 1;
  })();
  const saveSchedule = () => {
    const base = selectedRows.map((r) => ({ date: r.date, type: "event", plan: true }));
    let list = base;
    if (repeatWeekly && weeklyish) {
      list = [];
      for (const r of selectedRows) for (let w = 0; w < 4; w++) list.push({ date: iso(addDays(parseISO(r.date), w * 7)), type: "event", plan: true });
    }
    onConfirm(list);
  };

  const route = cls ? (INTENT_ROUTES[cls.detected] || INTENT_ROUTES.other) : null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={stage === "pick" ? onBack : () => setStage("pick")} style={iconBtn} aria-label="Back"><ArrowLeft size={15} /></button>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: OX }}>Add a photo</span>
        </div>
        <button onClick={onClose} style={iconBtn} aria-label="Close"><X size={15} /></button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />

      {stage === "pick" && (
        <>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.5, marginTop: 0 }}>
            A photo of <b>anything</b> — a meal or receipt, a work rota, a symptom, a moment. You tell it what it is; it reads the picture and helps you log or plan it.
          </p>
          <button onClick={() => fileRef.current?.click()} style={{ ...solidBtn, marginBottom: 8 }}>
            <ImageIcon size={15} style={{ marginRight: 7, verticalAlign: -2 }} />Choose a photo from library
          </button>
          <div style={{ ...eyebrow, marginTop: 12, marginBottom: 6 }}>Or try a sample</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => pick(renderSampleReceipt(), "receipt")} style={{ ...ghostBtn, flex: 1, borderColor: T.gold, color: OX }}><Utensils size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Receipt</button>
            <button onClick={() => pick(renderSampleRota(), "rota")} style={{ ...ghostBtn, flex: 1, borderColor: T.gold, color: OX }}><CalendarClock size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Work rota</button>
          </div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>
            Reads with the app's existing photo AI (the same one meal-snap uses) — no new service. You always review before anything is saved.
          </div>
        </>
      )}

      {stage === "intent" && (
        <>
          {imageUrl && <img src={imageUrl} alt="" style={{ width: "100%", maxHeight: 190, objectFit: "contain", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: "#fff", marginBottom: 10 }} />}
          <div style={{ ...eyebrow, marginBottom: 6 }}>What's this? — your words</div>
          <textarea value={intentText} onChange={(e) => setIntentText(e.target.value)} rows={2} autoFocus
            placeholder="e.g. this is what I had for lunch just now"
            style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontFamily: SERIF, fontSize: 15, outline: "none", resize: "vertical", marginBottom: 8 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {[["Food I had", "this is what I had to eat"], ["My schedule", "this is my work rota"], ["A symptom", "logging a symptom"], ["A moment", "a moment to remember"]].map(([lab, val]) => (
              <button key={lab} onClick={() => setIntentText(val)} style={{ ...pill, cursor: "pointer", background: T.paperHi, borderColor: T.paperDeep, color: T.muted }}>{lab}</button>
            ))}
          </div>
          <button onClick={classify} style={solidBtn}><WandSparkles size={15} style={{ marginRight: 7, verticalAlign: -2 }} />Continue</button>
        </>
      )}

      {stage === "reading" && (
        <div style={{ ...inset, padding: 22, textAlign: "center" }}>
          <Loader2 size={26} color={T.crimson} className="animate-spin" style={{ margin: "0 auto 10px", display: "block" }} />
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>Reading your photo…</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted }}>Working out what you mean.</div>
        </div>
      )}

      {stage === "guard" && guard && (
        <div style={{ ...inset, padding: 16, borderColor: T.gold }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, color: "#8a6e23", marginBottom: 8 }}><CalendarClock size={13} /> QUICK CHECK</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.45, marginBottom: 14 }}>{guard.msg}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {guard.kind === "retro_on_future" ? (
              <>
                <button onClick={() => resolveGuard("today")} style={{ ...solidBtn, flex: 1 }}>Log for today</button>
                <button onClick={() => resolveGuard("keep")} style={{ ...ghostBtn, flex: 1 }}>Keep for that day</button>
              </>
            ) : (
              <>
                <button onClick={() => resolveGuard("plan")} style={{ ...solidBtn, flex: 1, background: "#A6862B" }}>Yes, plan these</button>
                <button onClick={() => resolveGuard("note")} style={{ ...ghostBtn, flex: 1 }}>Just note today</button>
              </>
            )}
          </div>
        </div>
      )}

      {stage === "followups" && cls && (
        <>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, padding: "3px 10px", borderRadius: 999, marginBottom: 10, background: `${route.tone}22`, color: OX }}>
            <route.Icon size={12} /> {route.label.toUpperCase()} · {target.mode === "plan" ? "PLAN" : "LOG"} · {target.date === TODAY_STR ? "today" : format(parseISO(target.date), "EEE d MMM")}
          </div>
          {degraded && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted, marginBottom: 8 }}>Couldn't fully read the picture — going by what you said.</div>}
          <div style={{ ...eyebrow, marginBottom: 8 }}>{FOLLOWUPS[cls.detected].q}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
            {FOLLOWUPS[cls.detected].options.map((o) => {
              const isRec = o === recFor();
              const on = !customOn && o === answer;
              return (
                <button key={o} onClick={() => { setCustomOn(false); setAnswer(o); }} style={{
                  ...pill, cursor: "pointer", position: "relative",
                  background: on ? OX : isRec ? `${T.gold}22` : T.paperHi,
                  color: on ? T.paper : OX, borderColor: on ? OX : isRec ? T.gold : T.paperDeep,
                  fontWeight: isRec || on ? 800 : 600,
                }}>
                  {o}{isRec ? <span style={{ marginLeft: 5, fontSize: 8.5, fontWeight: 800, letterSpacing: 0.4, opacity: 0.85 }}>★ MOST LIKELY</span> : null}
                </button>
              );
            })}
            <button onClick={() => setCustomOn(true)} style={{ ...pill, cursor: "pointer", background: customOn ? OX : T.paperHi, color: customOn ? T.paper : T.muted, borderColor: customOn ? OX : T.paperDeep }}>Type your own</button>
          </div>
          {customOn && (
            <input value={customText} onChange={(e) => setCustomText(e.target.value)} autoFocus placeholder="Something else…"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontFamily: UI, fontSize: 14, outline: "none", marginBottom: 8 }} />
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={() => setStage("review")} style={{ ...ghostBtn, flex: 1 }}>Skip</button>
            <button onClick={() => setStage("review")} style={{ ...solidBtn, flex: 2 }}>Continue</button>
          </div>
        </>
      )}

      {stage === "review" && cls && (
        <>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, padding: "3px 10px", borderRadius: 999, marginBottom: 10, background: "rgba(143,175,143,0.2)", color: "#3f6b3a" }}>
            <Check size={12} /> REVIEW BEFORE SAVING
          </div>
          {degraded && !FOLLOWUPS[cls.detected] && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted, marginBottom: 8 }}>Couldn't fully read the picture — going by what you said.</div>}
          {imageUrl && <img src={imageUrl} alt="" style={{ width: "100%", maxHeight: 130, objectFit: "contain", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: "#fff", marginBottom: 10 }} />}
          <div style={{ ...inset, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ ...typeChip, background: `${route.tone}22`, color: route.tone }}><route.Icon size={15} /></span>
              <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 12, letterSpacing: 0.4, color: OX }}>{route.label.toUpperCase()}</span>
              <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 11, fontWeight: 700, color: target.mode === "plan" ? "#A6862B" : OX }}>{target.mode === "plan" ? "PLAN" : "LOG"} · {target.date === TODAY_STR ? "today" : format(parseISO(target.date), "EEE d MMM")}</span>
            </div>
            <input value={titleEdit} onChange={(e) => setTitleEdit(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontFamily: SERIF, fontSize: 15, outline: "none", marginBottom: 8 }} />
            {FOLLOWUPS[cls.detected] && (
              <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>{FOLLOWUPS[cls.detected].q}: <b style={{ color: T.ink }}>{finalAnswer}</b></div>
            )}
          </div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, margin: "8px 0 10px" }}>Nothing is saved until you tap below.</div>
          <button onClick={saveSingle} style={{ ...solidBtn, background: target.mode === "plan" ? "#A6862B" : T.crimson }}>
            <Check size={15} style={{ marginRight: 7, verticalAlign: -2 }} />{target.mode === "plan" ? "Add to plan" : "Log it"} · {target.date === TODAY_STR ? "today" : format(parseISO(target.date), "EEE d MMM")}
          </button>
        </>
      )}

      {stage === "schedule_review" && (
        <>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, padding: "3px 10px", borderRadius: 999, marginBottom: 8, background: "rgba(143,175,143,0.2)", color: "#3f6b3a" }}>
            <Check size={12} /> REVIEW BEFORE SAVING · {rows.length} shift{rows.length === 1 ? "" : "s"} · PLAN
          </div>
          {degraded && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted, marginBottom: 8 }}>Couldn't fully read the picture — check these carefully.</div>}

          {/* shared location — applied to every shift, edit once */}
          <div style={{ ...eyebrow, marginBottom: 4 }}>Location · all shifts</div>
          <input value={schedLocation} onChange={(e) => setSchedLocation(e.target.value)} placeholder="e.g. Halliburton Oji, Paddington"
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontFamily: UI, fontSize: 13, outline: "none", marginBottom: 10 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {rows.map((r, i) => {
              const overnight = r.end_next_day || (r.start && r.end && r.end <= r.start);
              return (
                <div key={r._id} style={{ ...inset, padding: "10px 11px", opacity: r.include ? 1 : 0.55 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <button onClick={() => setRow(i, { include: !r.include })} aria-label="Include"
                      style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer", border: `1.5px solid ${r.include ? T.sage : T.paperDeep}`, background: r.include ? T.sage : "transparent", display: "grid", placeItems: "center", padding: 0 }}>
                      {r.include && <Check size={13} color="#fff" />}
                    </button>
                    <input value={r.title} onChange={(e) => setRow(i, { title: e.target.value })}
                      style={{ flex: 1, minWidth: 0, padding: "6px 9px", borderRadius: 8, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, outline: "none" }} />
                    {r.done && <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 800, letterSpacing: 0.4, color: "#2e9e5b", background: "rgba(46,158,91,0.12)", padding: "2px 6px", borderRadius: 6 }}>ALREADY DONE</span>}
                    <button onClick={() => setRows((p) => p.filter((_, j) => j !== i))} aria-label="Remove" style={{ ...iconBtn, width: 24, height: 24, flexShrink: 0 }}><Trash2 size={11} /></button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", paddingLeft: 30 }}>
                    <input type="date" value={r.date || ""} onChange={(e) => setRow(i, { date: e.target.value })} style={miniField} />
                    <input type="time" value={r.start || ""} onChange={(e) => setRow(i, { start: e.target.value })} style={miniField} />
                    <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>–</span>
                    <input type="time" value={r.end || ""} onChange={(e) => setRow(i, { end: e.target.value })} style={miniField} />
                    {overnight && <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.3, color: "#8a6e23", background: "rgba(168,137,63,0.16)", padding: "2px 6px", borderRadius: 6 }}>OVERNIGHT · ends +1 day</span>}
                    {!r.date && <span style={{ fontFamily: UI, fontSize: 10, color: T.crimson }}>needs a date</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* weekly repeat — only when it's genuinely easy (all selected on one weekday) */}
          {weeklyish && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={repeatWeekly} onChange={(e) => setRepeatWeekly(e.target.checked)} style={{ accentColor: "#A6862B" }} />
              <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>These look weekly — repeat for the next 4 weeks?</span>
            </label>
          )}

          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginBottom: 10 }}>
            Untick a shift, edit any time/date, or remove a row. Done shifts are unticked. Nothing is saved until you tap below.
          </div>
          <button onClick={saveSchedule} disabled={includedWithDate === 0} style={{ ...solidBtn, background: "#A6862B", opacity: includedWithDate === 0 ? 0.45 : 1, cursor: includedWithDate === 0 ? "default" : "pointer" }}>
            <Check size={15} style={{ marginRight: 7, verticalAlign: -2 }} />Add {repeatWeekly && weeklyish ? includedWithDate * 4 : includedWithDate} shift{(repeatWeekly && weeklyish ? includedWithDate * 4 : includedWithDate) === 1 ? "" : "s"} to your plan
          </button>
        </>
      )}

      {stage === "error" && (
        <div style={{ ...inset, padding: 18, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, marginBottom: 4 }}>Couldn't read that one</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, marginBottom: 6 }}>Try a clearer, upright photo — or tell it what this is and we'll go from your words.</div>
          <button onClick={() => setStage("pick")} style={{ ...solidBtn, marginTop: 6 }}>Try another photo</button>
        </div>
      )}
    </>
  );
}
// ── sheet shell bits ────────────────────────────────────────────────────────────
function Backdrop({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(11,8,5,0.42)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {children}
    </div>
  );
}
function Sheet({ children }) {
  return (
    <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe" style={{
      width: "100%", maxWidth: 460, background: T.paperHi, borderRadius: "22px 22px 0 0", padding: "16px 16px 22px",
      boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", maxHeight: "88vh", overflowY: "auto",
      border: `1px solid ${T.paperDeep}`, borderBottom: "none",
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <div style={{ width: 34, height: 4, borderRadius: 999, background: T.paperDeep }} />
      </div>
      {children}
    </div>
  );
}
function SheetHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: T.gold }}>{title}</span>
      <button onClick={onClose} style={iconBtn} aria-label="Close"><X size={15} /></button>
    </div>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────────
const card = { background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: 16, boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset" };
const inset = { background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 11px" };
const eyebrow = { fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: T.gold, marginBottom: 8 };
const navBtn = { width: 32, height: 32, borderRadius: 9, border: "none", background: T.paper, display: "grid", placeItems: "center", cursor: "pointer" };
const iconBtn = { width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" };
const solidBtn = { width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, cursor: "pointer" };
const ghostBtn = { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", color: T.muted, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer" };
const pill = { display: "inline-flex", alignItems: "center", fontFamily: UI, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.muted };
const typeCard = { display: "flex", alignItems: "center", gap: 9, padding: "11px 12px", borderRadius: 13, border: `1px solid ${T.paperDeep}`, background: T.paper, cursor: "pointer", textAlign: "left" };
const typeChip = { width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0 };
const dtField = { display: "flex", alignItems: "center", gap: 7, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "10px 11px" };
const inputBox = { background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 12px", fontFamily: SERIF, fontSize: 14, color: T.muted };
const primaryMethod = (on, tone) => ({
  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
  padding: "12px 8px", borderRadius: 14, minHeight: 74,
  border: `1.5px solid ${on ? tone : T.paperDeep}`, background: on ? tone : T.paperHi,
  color: on ? T.paper : T.ink, fontFamily: UI, fontSize: 13.5, fontWeight: 700,
});
const pmSub = (on) => ({ fontFamily: UI, fontSize: 10, fontWeight: 500, color: on ? "rgba(255,255,255,0.8)" : T.muted });
const stepBtn = { width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OX, fontSize: 20, fontWeight: 700, cursor: "pointer", display: "grid", placeItems: "center", lineHeight: 1 };
const miniField = { padding: "5px 7px", borderRadius: 8, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif", fontSize: 12, outline: "none", minWidth: 0 };
const photoChoice = (on) => ({
  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer",
  padding: "12px 8px", borderRadius: 12, minHeight: 62,
  border: `1.5px solid ${on ? T.gold : T.paperDeep}`, background: on ? "rgba(168,137,63,0.14)" : T.paper,
  color: T.ink, fontFamily: UI, fontSize: 12, fontWeight: 700,
});
