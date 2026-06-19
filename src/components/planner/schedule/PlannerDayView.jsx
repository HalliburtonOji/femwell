// PlannerDayView + DayActionsSheet — Planner's CALENDAR DAY surfaces, extracted into a shared module so
// Today reuses the SAME hour-by-hour day view + day-detail as the Planner page (one design, not two).
//
// The components + styles below are copied VERBATIM from the Planner page's local
// FullScheduleOverlay / ScheduleHour / ScheduleBlock / BlockEditSheet / DayDetailSheet
// (src/components/planner-v2/PlannerV2Shell.jsx). Planner is intentionally NOT modified here — another
// session owns Planner's sheets/lists/"Plan a day" popup — so the code is duplicated for now; a later
// pass can switch Planner to import this module to de-dup. Generalised to take a `dateISO` (any day, not
// just today) + a `userId`. Wired to the real PlannerItems entity (guarded, fail-open) and the existing
// universal `openLogger` dispatcher — NO new backend functions.

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Check, Trash2, Footprints, Pill, CalendarClock, ListChecks, Stethoscope, CalendarDays, Utensils } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { openLogger } from "@/components/UniversalLogger";
import { phaseForDay } from "@/hooks/useCycleDay";

// ── palette + tokens (verbatim from PlannerV2Shell; CSS-var-backed global design tokens) ─────────────
const C = {
  cream: "var(--ivory)", paper: "var(--ivory)", paperHi: "var(--surface)", espresso: "var(--plum)",
  blush: "var(--rose-dust)", sage: "var(--sage)", muted: "var(--mauve)", gold: "var(--gold)",
  goldDeep: "#A6862B", rose: "var(--rose-dust)",
  pMenstrual: "#8B2635", pFollicular: "#C17B4E", pOvulatory: "#C4933F", pLuteal: "#5B4A8A",
};
const PHASE_LIGHT = { menstrual: C.blush, follicular: C.sage, ovulatory: C.gold, luteal: C.muted };
const TYPE_TONES = {
  habit: { bg: `${C.sage}1F`, bar: C.sage },
  task:  { bg: "rgba(58,44,26,0.07)", bar: C.espresso },
  med:   { bg: `${C.blush}1F`, bar: C.blush },
  event: { bg: `${C.gold}1F`, bar: C.gold },
};
function bandFor(h) {
  if (h >= 9 && h <= 11) return C.gold;
  if (h >= 12 && h <= 15) return C.sage;
  if (h >= 16 && h <= 18) return C.blush;
  return C.muted;
}
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
function toISO(d) { const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${da}`; }

// PlannerItems row → schedule block (verbatim from PlannerV2Shell).
function plannerItemToBlock(row) {
  if (!row || typeof row !== "object") return null;
  let hour = 9;
  if (row.time) { const m = /^(\d{1,2})/.exec(String(row.time)); if (m) { const h = Number(m[1]); if (Number.isFinite(h) && h >= 0 && h <= 23) hour = h; } }
  const catv = String(row.category || "").toLowerCase();
  let type = "task";
  if (catv === "habit" || catv === "wellbeing") type = "habit";
  else if (catv === "reminder" || catv === "medication" || catv === "med") type = "med";
  else if (catv === "appointment" || catv === "event") type = "event";
  return { id: row.id, hour, duration: Number(row.duration_minutes) || 30, title: row.title || "Untitled", type, anchor: !!(row.is_anchor || row.anchor), done: !!row.is_completed, _raw: row };
}

async function loadBlocks(userId, dateISO) {
  if (!userId) return [];
  try {
    const rows = await base44.entities.PlannerItems.filter({ user_id: userId, date: dateISO }, "-created_date", 200);
    return (rows || []).map(plannerItemToBlock).filter(Boolean);
  } catch { return []; }
}

// phase for ANY date, derived from today's cycle (so the day-detail agrees with the Hero).
function phaseForDateISO(cycle, dateISO) {
  if (!cycle || !cycle.cycleDay) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(dateISO + "T00:00:00");
  const diff = Math.round((d - t) / 86400000);
  const len = cycle.cycleLen || 28;
  const cd = (((cycle.cycleDay - 1 + diff) % len) + len) % len + 1;
  return phaseForDay(cd, cycle.periodLen || 5, len);
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// THE HOUR-BY-HOUR DAY VIEW (FullScheduleOverlay, verbatim styling) — for any date.
export function PlannerDayView({ dateISO, userId, onClose }) {
  const [blocks, setBlocks] = useState([]);
  const [blockEdit, setBlockEdit] = useState(null);
  const dateObj = new Date(dateISO + "T00:00:00");
  const now = new Date();
  const isToday = dateISO === toISO(now);

  useEffect(() => { let alive = true; loadBlocks(userId, dateISO).then((b) => { if (alive) setBlocks(b); }); return () => { alive = false; }; }, [userId, dateISO]);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  const add = () => { try { openLogger("event"); } catch { /* ignore */ } };
  const editBlock = blockEdit ? blocks.find((b) => b.id === blockEdit) : null;

  return (
    <div style={overlayShell} role="dialog" aria-modal="true" aria-label="Day schedule">
      <div style={overlayHead}>
        <button onClick={onClose} style={overlayClose} aria-label="Back"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SCHEDULE · {dateObj.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}</span>
          <h2 style={overlayTitle}>{isToday ? "Today, hour by hour" : "Plan this day, hour by hour"}</h2>
        </div>
        <button onClick={add} style={overlayClose} aria-label="Add to this day"><Plus size={16} /></button>
      </div>
      <p style={overlayHint}>Tap a block to edit. Tap a free hour to add.</p>
      <div className="fw-sheet-safe" style={{ padding: "0 16px 30px" }}>
        {hours.map((h) => (
          <ScheduleHour key={h} hour={h} blocks={blocks.filter((b) => b.hour === h)}
            isCurrent={isToday && h === now.getHours()} currentMinute={now.getMinutes()}
            onBlockTap={(id) => setBlockEdit(id)} onAdd={add} />
        ))}
      </div>

      <BlockEditSheet
        block={editBlock}
        onClose={() => setBlockEdit(null)}
        onSave={async (next) => {
          setBlocks((bs) => bs.map((b) => (b.id === next.id ? next : b)));
          setBlockEdit(null);
          try {
            const hh = Number.isFinite(next.hour) ? String(next.hour).padStart(2, "0") : "09";
            await base44.entities.PlannerItems.update(next.id, { title: next.title, time: `${hh}:00`, duration_minutes: next.duration, is_completed: !!next.done });
          } catch { /* silent */ }
        }}
        onDelete={async (id) => {
          setBlocks((bs) => bs.filter((b) => b.id !== id));
          setBlockEdit(null);
          try { await base44.entities.PlannerItems.delete(id); } catch { /* silent */ }
        }}
      />
    </div>
  );
}

function ScheduleHour({ hour, blocks, isCurrent, currentMinute, onBlockTap, onAdd }) {
  const label = (hour <= 12 ? hour : hour - 12) + (hour < 12 ? " AM" : " PM");
  const rail = bandFor(hour);
  return (
    <div style={schedHourRow}>
      <span style={schedHourLabel}>{label}</span>
      <div style={schedRailCol}>
        <span style={{ ...schedRail, background: rail }} />
        {isCurrent && (<>
          <span style={{ ...schedRailDot, top: `${(currentMinute / 60) * 100}%` }} />
          <span style={{ ...schedNowLine, top: `${(currentMinute / 60) * 100}%` }} />
        </>)}
      </div>
      <div style={schedBlockCol}>
        {blocks.length === 0 && (
          <button onClick={onAdd} style={schedEmptySlot}><Plus size={12} /> Add</button>
        )}
        {blocks.map((b) => <ScheduleBlock key={b.id} block={b} onTap={() => onBlockTap(b.id)} />)}
      </div>
    </div>
  );
}

function ScheduleBlock({ block, onTap }) {
  const tones = TYPE_TONES[block.type] || TYPE_TONES.task;
  const IconForType = block.type === "habit" ? Footprints : block.type === "med" ? Pill : block.type === "event" ? CalendarClock : ListChecks;
  return (
    <button onClick={onTap} style={{ ...schedBlock, background: tones.bg, borderLeft: `3px solid ${tones.bar}`, minHeight: 28 + Math.min(60, block.duration) * 0.5 }}>
      <span style={{ ...schedBlockIcon, background: tones.bar }}><IconForType size={11} style={{ color: C.cream }} /></span>
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div style={schedBlockTitle}>{block.title}{block.done && <Check size={11} style={{ color: C.sage, marginLeft: 6 }} />}</div>
        <div style={schedBlockMeta}>{block.duration} MIN · {block.type.toUpperCase()}</div>
      </div>
      {block.anchor && <span style={anchorPill}>ANCHOR</span>}
    </button>
  );
}

function BlockEditSheet({ block, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(block);
  useEffect(() => { setDraft(block); }, [block]);
  if (!block || !draft) return null;
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>EDIT BLOCK</span>
          <button onClick={onClose} style={drawerCloseBtn}><X size={14} /></button>
        </div>
        <h3 style={modalTitle}>{draft.title}</h3>
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={miniLabel}>TITLE</span>
          <input type="text" value={draft.title} onChange={(e) => set("title", e.target.value)} style={modalInput} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <label>
            <span style={miniLabel}>HOUR</span>
            <select value={draft.hour} onChange={(e) => set("hour", Number(e.target.value))} style={modalInput}>
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (<option key={h} value={h}>{h <= 12 ? h : h - 12}:00 {h < 12 ? "AM" : "PM"}</option>))}
            </select>
          </label>
          <label>
            <span style={miniLabel}>DURATION (MIN)</span>
            <select value={draft.duration} onChange={(e) => set("duration", Number(e.target.value))} style={modalInput}>
              {[5, 15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <span style={miniLabel}>TYPE</span>
        <div style={chipRowSpacing}>
          {["habit", "task", "med", "event"].map((t) => (
            <button key={t} onClick={() => set("type", t)} style={{ ...modalChip, background: draft.type === t ? C.espresso : C.paperHi, color: draft.type === t ? C.cream : C.muted, borderColor: draft.type === t ? C.espresso : "rgba(58,44,26,0.18)" }}>{cap(t)}</button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input type="checkbox" checked={!!draft.done} onChange={(e) => set("done", e.target.checked)} style={{ accentColor: C.sage }} />
          <span style={{ fontSize: 12, color: C.espresso }}>Done</span>
        </label>
        <div style={modalFoot}>
          <button onClick={() => onDelete(draft.id)} style={{ ...modalCancelBtn, color: C.rose, borderColor: `${C.rose}55` }}><Trash2 size={12} /> Delete</button>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={() => onSave(draft)} style={modalSaveBtn}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// TAP-A-DAY → DAY ACTIONS (adapted from DayDetailSheet) — phase summary + real actions for that day.
export function DayActionsSheet({ dateISO, cycle, onPlanDay, onClose }) {
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const dateObj = new Date(dateISO + "T00:00:00");
  const isFuture = dateObj > new Date(toISO(new Date()));
  const phase = phaseForDateISO(cycle, dateISO);
  const phaseHint = {
    menstrual: "Inner winter. Slow, soft, restorative.",
    follicular: "Inner spring. Curious, building, fresh.",
    ovulatory: "Peak energy window. Visibility, bold asks, creative output.",
    luteal: "Inner autumn. Reflective, narrowing, finishing.",
  }[phase];
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalCard, maxHeight: "85vh", overflowY: "auto", maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <button onClick={onClose} style={drawerCloseBtn}><ArrowLeft size={14} /></button>
          <span style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 500, color: C.espresso }}>{dateObj.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
          <span style={{ width: 28 }} />
        </div>
        <h3 style={modalTitle}>{phase ? `${cap(phase)} · the day` : "This day"}</h3>
        {phase && (
          <div style={{ marginBottom: 14 }}>
            <span style={kicker}>PHASE</span>
            <div style={{ marginTop: 6, padding: "12px 14px", borderRadius: 12, background: `${PHASE_LIGHT[phase]}22`, border: `1px solid ${PHASE_LIGHT[phase]}55` }}>
              <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: `${PHASE_LIGHT[phase]}33`, color: C.espresso }}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: PHASE_LIGHT[phase], marginRight: 5 }} />{cap(phase)}
              </span>
              <p style={{ fontSize: 13, color: C.espresso, margin: "6px 0 0", lineHeight: 1.5 }}>{phaseHint}</p>
            </div>
          </div>
        )}
        <span style={kicker}>DO FOR THIS DAY</span>
        <div style={{ display: "flex", marginTop: 8, marginBottom: 8 }}>
          <button onClick={onPlanDay} style={dayPrimaryBtn}><CalendarDays size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />Plan this day, hour by hour</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => { try { openLogger("event"); } catch { /* ignore */ } }} style={daySecondaryBtn}>Add to plan</button>
          <button onClick={() => { try { openLogger("meal"); } catch { /* ignore */ } }} style={daySecondaryBtn}><Utensils size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />Log a meal</button>
          {!isFuture && <button onClick={() => { try { openLogger("symptom"); } catch { /* ignore */ } }} style={daySecondaryBtn}><Stethoscope size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />Log a symptom</button>}
        </div>
      </div>
    </div>
  );
}

// ── styles (verbatim from PlannerV2Shell) ────────────────────────────────────────────────────────────
const kicker = { fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, fontWeight: 700 };
const overlayShell = { position: "fixed", inset: 0, background: C.cream, zIndex: 9990, overflowY: "auto" };
const overlayHead = { position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", background: C.cream, borderBottom: "1px solid rgba(58,44,26,0.08)" };
const overlayClose = { width: 32, height: 32, borderRadius: 9999, background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)", color: C.espresso, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 };
const overlayTitle = { fontSize: 22, fontWeight: 500, color: C.espresso, margin: "2px 0 0", letterSpacing: "-0.01em" };
const overlayHint = { padding: "8px 16px 0", fontSize: 12, color: C.muted, fontStyle: "italic" };
const schedHourRow = { display: "grid", gridTemplateColumns: "48px 14px 1fr", gap: 6, alignItems: "stretch", minHeight: 38, padding: "2px 0" };
const schedHourLabel = { fontSize: 10, color: C.muted, fontWeight: 600, textAlign: "right", letterSpacing: "0.04em", alignSelf: "flex-start", paddingTop: 4 };
const schedRailCol = { position: "relative", display: "flex", justifyContent: "center" };
const schedRail = { width: 4, height: "100%", borderRadius: 9999, minHeight: 36 };
const schedRailDot = { position: "absolute", left: "50%", transform: "translate(-50%, -50%)", width: 10, height: 10, borderRadius: 9999, background: C.espresso, boxShadow: `0 0 0 2px ${C.cream}` };
const schedNowLine = { position: "absolute", left: 12, right: -200, height: 1, background: C.espresso, opacity: 0.30 };
const schedBlockCol = { display: "flex", flexDirection: "column", gap: 4 };
const schedBlock = { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 8px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%" };
const schedBlockIcon = { width: 22, height: 22, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const schedBlockTitle = { fontSize: 12.5, fontWeight: 700, color: C.espresso, display: "flex", alignItems: "center", lineHeight: 1.2 };
const schedBlockMeta = { fontSize: 9, letterSpacing: "0.10em", color: C.muted, fontWeight: 600, marginTop: 2 };
const anchorPill = { fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em", padding: "2px 6px", borderRadius: 9999, background: `${C.gold}33`, color: C.goldDeep, marginLeft: 4 };
const schedEmptySlot = { display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", color: "rgba(58,44,26,0.30)", border: "1px dashed rgba(58,44,26,0.18)", borderRadius: 9999, padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", margin: "2px 0" };
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(58,44,26,0.40)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 max(16px, env(safe-area-inset-bottom))" };
const modalCard = { width: "100%", maxWidth: 520, background: C.cream, borderRadius: "22px 22px 0 0", padding: "16px 18px var(--fw-sheet-safe)", boxShadow: "0 -8px 32px rgba(58,44,26,0.18)" };
const modalHead = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 };
const drawerCloseBtn = { width: 28, height: 28, borderRadius: 9999, background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)", color: C.muted, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };
const modalTitle = { fontSize: 22, fontWeight: 500, color: C.espresso, letterSpacing: "-0.01em", margin: "4px 0 14px", lineHeight: 1.25 };
const miniLabel = { fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, fontWeight: 700, display: "block", marginBottom: 6 };
const modalInput = { width: "100%", padding: "10px 12px", borderRadius: 10, background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)", fontSize: 14, color: C.espresso, outline: "none", boxSizing: "border-box" };
const chipRowSpacing = { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 };
const modalChip = { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9999, border: "1px solid", fontSize: 11.5, fontWeight: 600, cursor: "pointer" };
const modalFoot = { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 };
const modalCancelBtn = { display: "inline-flex", alignItems: "center", gap: 5, padding: "9px 14px", borderRadius: 9999, background: "transparent", color: C.muted, border: "1px solid rgba(58,44,26,0.18)", fontSize: 12, fontWeight: 700, cursor: "pointer" };
const modalSaveBtn = { padding: "9px 18px", borderRadius: 9999, background: C.espresso, color: C.cream, border: "1px solid " + C.espresso, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer" };
const dayPrimaryBtn = { flex: 1, padding: "12px 14px", borderRadius: 9999, background: C.espresso, color: C.cream, border: "1px solid " + C.espresso, fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", cursor: "pointer" };
const daySecondaryBtn = { flex: "1 1 auto", padding: "10px 14px", borderRadius: 9999, background: "transparent", color: C.espresso, border: "1px solid rgba(58,44,26,0.18)", fontSize: 12, fontWeight: 700, cursor: "pointer" };
