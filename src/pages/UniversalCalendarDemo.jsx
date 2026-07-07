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
import { useMemo, useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  isSameMonth, isSameDay, parseISO,
} from "date-fns";
import {
  CalendarDays, X, ArrowLeft, ChevronLeft, ChevronRight, Utensils, Droplets, Smile,
  Stethoscope, StickyNote, Footprints, Pill, CalendarClock, Bell, Check, Search,
  ScanBarcode, Mic, Camera, Pen, Clock, Lock, Image as ImageIcon, ChevronDown,
} from "lucide-react";
import { T, SERIF, UI, SCRIPT, PAPER_BG, Heart, useEditorialFonts } from "@/components/journal/Editorial";

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
            {sheet.stage === "day" && <DaySheet sheet={sheet} entries={entries} onPick={(type) => openForm(sheet.date, type)} onClose={closeAll} />}
            {sheet.stage === "form" && <FormSheet sheet={sheet} onBack={() => setSheet({ stage: "day", mode: sheet.mode, date: sheet.date })} onClose={closeAll} onConfirm={confirm} setSheet={setSheet} />}
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
function DaySheet({ sheet, entries, onPick, onClose }) {
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

      <div style={{ ...eyebrow, marginTop: 14 }}>{isFuture ? "Plan for this day" : "Add to this day"}</div>
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
const photoChoice = (on) => ({
  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer",
  padding: "12px 8px", borderRadius: 12, minHeight: 62,
  border: `1.5px solid ${on ? T.gold : T.paperDeep}`, background: on ? "rgba(168,137,63,0.14)" : T.paper,
  color: T.ink, fontFamily: UI, fontSize: 12, fontWeight: 700,
});
