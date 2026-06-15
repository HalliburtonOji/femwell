// NurtureGarden — the Nurture Companion. The app's HEARTBEAT: a living thing UNIQUE to
// each user, grown from engagement across the WHOLE app, that she can TEND, CHANGE
// (rename/reshape) and SHARE (a non-personal card). State, not score. Never dies; a gap is
// a resting season, met with a warm welcome — no streaks, no decay, no guilt.
//
// Real signals (guarded, capped reads): Journal + Nutrition (meals + water) + Check-ins +
// Cycle/symptoms + Programs, and device-local Community acts (echoes left, questions
// answered, circles joined). Identity (form/colour/personality) is seeded per user.
// Brand: cream/plum, Ephesis/Cormorant, Lucide/SVG, no emoji.

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, differenceInCalendarDays } from "date-fns";
import { X, Feather, Share2, Check } from "lucide-react";
import {
  T, UI, SERIF, Script, Hand, Eyebrow, Heart, PHASE_COLORS, PHASE_LABEL, useEditorialFonts,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  getCompanion, FORM_LIST, renameCompanion, reshapeCompanion, tendCompanion, tendedToday,
} from "@/components/nurture/companion";

const STAGES = [
  { key: "seed",     min: 0,   name: "Just planted",   line: "A seed is in the soil. Whatever you tend — a line, a meal, a check-in — it begins to grow." },
  { key: "sprout",   min: 4,   name: "Sprouting",      line: "First green. Finding its feet, the way you are." },
  { key: "budding",  min: 12,  name: "Budding",        line: "Buds forming. There's a shape to how you show up for yourself now." },
  { key: "blooming", min: 28,  name: "Blooming",       line: "Blooming — look what a season of small attentions makes." },
  { key: "full",     min: 60,  name: "In full bloom",  line: "Full and open. Genuinely, gently kept." },
];
function stageFor(c) { let s = STAGES[0]; for (const st of STAGES) if (c >= st.min) s = st; return s; }
const DAY = 86400000;
function daysBack(n) { const o = new Set(); for (let i = 0; i < n; i++) o.add(format(new Date(Date.now() - i * DAY), "yyyy-MM-dd")); return o; }
// device-local community acts (anonymous — never linked to user_id, so counted locally)
function communityActs() {
  let n = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (/^fw_echo_mine_|^fw_game_|^fw_circle_|^fw_qotd/.test(k)) n += 1;
    }
  } catch { /* ignore */ }
  return n;
}

export default function NurtureGarden({ compact = false, onOpen = null }) {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [version, setVersion] = useState(0);     // bump to re-read companion after a change
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [justTended, setJustTended] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      const id = me?.id || null;
      const last7 = daysBack(7);
      // ALL-APP signals (guarded, capped, fail-open to []). The companion is nourished by
      // genuine engagement everywhere: journal, nutrition, check-ins, cycle, PROGRAMS &
      // practice, the PLANNER, and the COMMUNITY (per-user QOTD answers, plus anonymous
      // acts — echoes/reactions/circles — counted device-local since they carry no user_id).
      const [E, M, W, Cn, Sy, Up, Q, Pl, Pt, Pi, Tc, prof] = await Promise.all([
        id ? base44.entities.JournalEntries.filter({ user_id: id }, "-created_date", 200).catch(() => []) : [],
        id ? base44.entities.MealLog.filter({ user_id: id }, "-day_key", 200).catch(() => []) : [],
        id ? base44.entities.HydrationLog.filter({ user_id: id }, "-day_key", 120).catch(() => []) : [],
        id ? base44.entities.DailyCheckins.filter({ user_id: id }, "-created_date", 120).catch(() => []) : [],
        id ? base44.entities.SymptomLogs.filter({ user_id: id }, "-created_date", 120).catch(() => []) : [],
        id ? base44.entities.UserPrograms.filter({ user_id: id }, "-created_date", 60).catch(() => []) : [],
        id ? base44.entities.DailyPromptResponse.filter({ user_id: id }, "-created_date", 90).catch(() => []) : [],
        id ? base44.entities.DailyPlan.filter({ user_id: id }, "-created_date", 60).catch(() => []) : [],
        id ? base44.entities.PersonalTasks.filter({ user_id: id }, "-created_date", 120).catch(() => []) : [],
        id ? base44.entities.PlannerItems.filter({ user_id: id }, "-created_date", 120).catch(() => []) : [],
        id ? base44.entities.UserTaskCompletions.filter({ user_id: id }, "-created_date", 150).catch(() => []) : [],
        base44.entities.UserProfile.filter({}, "-created_date", 1).catch(() => []),
      ]);
      if (!alive) return;
      const arr = (x) => (Array.isArray(x) ? x.filter(Boolean) : []);
      const programs = [...arr(Up), ...arr(Tc)];
      const planner = [...arr(Pl), ...arr(Pt), ...arr(Pi)];
      const commLocal = communityActs();
      const commArr = arr(Q);                                  // server-side, cross-device
      const community = commArr.length + commLocal;
      const all = [...arr(E), ...arr(M), ...arr(W), ...arr(Cn), ...arr(Sy), ...programs, ...planner, ...commArr];
      const lifetime = all.length + commLocal;
      const dayOf = (x) => x.day_key || x.date || (x.created_date ? String(x.created_date).slice(0, 10) : (x.created_at ? String(x.created_at).slice(0, 10) : null));
      const days = new Set(); all.forEach((x) => { const d = dayOf(x); if (d) days.add(d); });
      const tended7 = [...days].filter((d) => last7.has(d)).length;
      const allDays = [...days].sort();
      const lastDay = allDays.length ? allDays[allDays.length - 1] : null;
      const gapDays = lastDay ? differenceInCalendarDays(new Date(), new Date(lastDay)) : null;
      setUid(id);
      setProfile(Array.isArray(prof) ? prof[0] : null);
      setData({ lifetime, tended7, gapDays, areas: { journal: arr(E).length, nutrition: arr(M).length + arr(W).length, checkins: arr(Cn).length, cycle: arr(Sy).length, programs: programs.length, planner: planner.length, community } });
    })();
    return () => { alive = false; };
  }, []);

  const phase = useMemo(() => { try { return profile?.last_period_start_date ? computeCycleDay(profile).phase : null; } catch { return null; } }, [profile]);
  const companion = useMemo(() => getCompanion(uid), [uid, version]);
  const tendedT = useMemo(() => (uid ? tendedToday(uid) : false), [uid, version, justTended]);

  if (data === null || !companion) {
    return <div style={{ display: "flex", justifyContent: "center", padding: compact ? "24px 0" : "60px 0" }}>
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} /></div>;
  }

  const phaseColor = PHASE_COLORS[phase] || T.sage;
  const stage = stageFor(data.lifetime);
  const stageIdx = STAGES.findIndex((s) => s.key === stage.key);
  const resting = (data.gapDays == null) || (data.gapDays >= 5);
  const returning = data.gapDays != null && data.gapDays >= 5 && data.tended7 > 0;
  const stateName = data.gapDays == null ? "Just planted" : (resting && !returning) ? "Resting" : stage.name;
  const stateLine = data.gapDays == null ? `${companion.name} is ready for its first act of care.`
    : returning ? `Welcome back. ${companion.name} kept your place — waking up with you.`
    : (resting) ? `Resting season. Nothing is lost; ${companion.name} is waiting, soft and alive.`
    : stage.line;
  // which life-area she tends most (shapes the "earned" identity narrative)
  const topArea = Object.entries(data.areas).sort((a, b) => b[1] - a[1])[0];
  const AREA_WORD = { journal: "writing", nutrition: "nourishing yourself", checkins: "checking in", cycle: "tending your cycle", programs: "your practices", planner: "planning your days", community: "being with the room" };

  const doTend = () => { if (!uid) return; tendCompanion(uid); setJustTended(true); setVersion((v) => v + 1); };
  const saveName = () => { if (uid) renameCompanion(uid, draftName); setEditing(false); setVersion((v) => v + 1); };
  const pickForm = (k) => { if (uid) reshapeCompanion(uid, k); setVersion((v) => v + 1); };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 6 : 12 }}>
        <Heart size={14} />
        <Eyebrow color={T.muted}>{phase ? `${companion.name} · ${PHASE_LABEL[phase]} phase` : companion.name}</Eyebrow>
      </div>

      <Bloom form={companion.form} stageIdx={stageIdx} color={phaseColor} accent={companion.accent} resting={resting && !returning} bright={justTended} size={compact ? 118 : 190} />

      <Script size={compact ? 24 : 32} color={T.ink} style={{ marginTop: compact ? 8 : 14 }}>{stateName}</Script>
      <Hand size={compact ? 15 : 17} color={T.muted} style={{ marginTop: 6, maxWidth: 360, lineHeight: 1.5 }}>{stateLine}</Hand>

      {!compact && (
        <>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, marginTop: 12, maxWidth: 360, lineHeight: 1.5 }}>
            “{companion.personality.voice}”
          </div>
          {topArea && topArea[1] > 0 ? (
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 10 }}>
              Shaped most by {AREA_WORD[topArea[0]] || "showing up"}{data.tended7 > 0 ? ` · tended ${data.tended7} ${data.tended7 === 1 ? "day" : "days"} this week` : ""}
            </div>
          ) : null}

          {/* TEND · CHANGE · SHARE */}
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
            <button onClick={doTend} disabled={tendedT} style={{
              display: "inline-flex", alignItems: "center", gap: 7, background: tendedT ? T.paperHi : T.crimson, color: tendedT ? T.ink : T.paper,
              border: tendedT ? `1px solid ${T.paperDeep}` : "none", borderRadius: 12, padding: "11px 18px", cursor: tendedT ? "default" : "pointer",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
            }}>
              {tendedT ? <><Check size={14} /> Tended today</> : <><Heart size={14} /> Tend {companion.name.split(" ").slice(-1)[0]}</>}
            </button>
            <button onClick={() => { setDraftName(companion.name); setEditing((e) => !e); }} style={ghost}>
              <Feather size={13} /> Make it yours
            </button>
            <button onClick={() => setSharing(true)} style={ghost}>
              <Share2 size={13} /> Share
            </button>
          </div>

          {/* CHANGE editor — rename + reshape (real, persisted device-local) */}
          {editing && (
            <div style={{ marginTop: 16, width: "100%", maxWidth: 380, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px" }}>
              <Eyebrow mb={8}>Name</Eyebrow>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input value={draftName} onChange={(e) => setDraftName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
                  placeholder="Name your companion" style={{ flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 8, padding: "9px 11px", fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none" }} />
                <button onClick={saveName} style={{ flexShrink: 0, background: T.ink, color: T.paper, border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Save</button>
              </div>
              <Eyebrow mb={8}>Form</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {FORM_LIST.map((f) => (
                  <button key={f.key} onClick={() => pickForm(f.key)} style={{
                    fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: "6px 11px", borderRadius: 999,
                    border: `1px solid ${companion.form.key === f.key ? T.gold : T.paperDeep}`,
                    background: companion.form.key === f.key ? T.gold : "transparent", color: companion.form.key === f.key ? T.paper : T.ink,
                  }}>{f.name}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 22, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.muted, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 12px" }}>
              No streaks · no scores · it never dies
            </span>
          </div>
          <div style={{ marginTop: 16, fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", maxWidth: 380, lineHeight: 1.5 }}>
            {companion.name} grows from everything you already do — a journal line, a logged meal, a check-in, a day you planned, a practice kept, a moment in the community. Rest is part of it.
          </div>
        </>
      )}

      {/* SHARE card — a tasteful, NON-personal artifact (form + name + stage only; never a
          journal line, mood, or any private data). Opt-in; screenshot-shareable. */}
      {sharing && (
        <div onClick={() => setSharing(false)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(11,8,5,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 22 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, background: T.cream, borderRadius: 22, padding: "26px 22px 22px", textAlign: "center", boxShadow: "0 18px 50px rgba(11,8,5,0.4)", position: "relative", border: `1px solid ${T.paperDeep}` }}>
            <button onClick={() => setSharing(false)} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 999, background: T.paperHi, border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={15} /></button>
            <Eyebrow color={T.muted} mb={6}>FemWell · my companion</Eyebrow>
            <Bloom form={companion.form} stageIdx={stageIdx} color={phaseColor} accent={companion.accent} resting={false} bright={false} size={150} />
            <Script size={32} color={T.ink} style={{ marginTop: 8 }}>{companion.name}</Script>
            <Hand size={15} color={T.muted} style={{ marginTop: 4 }}>{stateName} · {companion.form.name}</Hand>
            <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>
              Grown gently, at my own pace. No streaks, no scores.
            </div>
            <div style={{ marginTop: 16, fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.4 }}>
              Screenshot to share · nothing personal leaves with it
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ghost = {
  display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: T.ink,
  border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 16px", cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
};

// ── the bloom — genuinely distinct artwork per FORM, drawn in the phase colour with the
// user's identity accent, opening across five growth stages and breathing gently (stilled
// for resting + reduced-motion). Hand-drawn SVG; no emoji, no raster. ──
const STEM = "#73855F", STEM_HI = "#8FAF8F", LEAF = "#86A479", LEAF_DK = "#6E8A63", SOIL = "#8A7A63", PALE = "#F4EFE3";

// a soft upward teardrop petal centred at (x,y), length L, width W, rotated `rot°`
function petal(x, y, L, W, rot, fill, op, key) {
  const d = `M${x} ${y} C ${x - W} ${y - L * 0.34}, ${x - W * 0.55} ${y - L}, ${x} ${y - L} C ${x + W * 0.55} ${y - L}, ${x + W} ${y - L * 0.34}, ${x} ${y} Z`;
  return <path key={key} d={d} fill={fill} opacity={op} transform={`rotate(${rot} ${x} ${y})`} />;
}
function lighten(hex, t) {
  try { const n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * t); g = Math.round(g + (255 - g) * t); b = Math.round(b + (255 - b) * t);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`; } catch { return hex; }
}

export function Bloom({ form, stageIdx, color, accent, resting, bright, size = 190 }) {
  const open = Math.min(1, Math.max(0, stageIdx / 4));   // 0 → 1 across the five stages
  const seed = stageIdx === 0;
  const op = resting ? 0.5 : (bright ? 1 : 0.92);
  const tall = form.key === "foxglove";
  const headY = seed ? 70 : (tall ? 60 - open * 16 : 74 - open * 38);   // flower head rises as it grows
  const cx = 50;
  const light = lighten(color, 0.4), deep = color;
  const gid = `${form.key}-${color.replace("#", "")}`;          // unique-enough gradient id
  const breath = { transformOrigin: `${cx}px ${headY}px`, animation: resting ? "none" : "fwBreath 6s ease-in-out infinite" };
  const stemTopY = seed ? 80 : headY + (tall ? 4 : (form.fern ? 0 : 5));
  const showStem = !seed && !form.fern;
  const leaf1 = stageIdx >= 1, leaf2 = stageIdx >= 2;

  return (
    <div aria-hidden style={{ width: size, height: size, position: "relative" }}>
      <style>{`@keyframes fwBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}@keyframes fwSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}@media (prefers-reduced-motion:reduce){.fw-breath,.fw-sway{animation:none!important}}`}</style>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id={`glow-${gid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={bright ? 0.26 : 0.16} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`pet-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={light} /><stop offset="100%" stopColor={deep} />
          </linearGradient>
        </defs>

        {/* soft halo */}
        <circle cx={cx} cy={headY} r={20 + open * 22} fill={`url(#glow-${gid})`} />
        {/* ground + soil mound */}
        <path d="M22 90 Q50 84 78 90" stroke={SOIL} strokeWidth="1.6" fill="none" opacity="0.5" strokeLinecap="round" />
        {seed && <g><ellipse cx={cx} cy="87" rx="11" ry="5" fill={SOIL} opacity="0.4" /><path d={`M50 86 q -1 -5 0 -8`} stroke={STEM} strokeWidth="2" fill="none" strokeLinecap="round" /><circle cx={cx} cy="77" r="2.4" fill={STEM_HI} /><ellipse cx="46" cy="80" rx="3" ry="1.6" fill={LEAF} opacity="0.9" transform="rotate(-24 46 80)" /><ellipse cx="54" cy="80" rx="3" ry="1.6" fill={LEAF} opacity="0.9" transform="rotate(24 54 80)" /></g>}

        {/* stem + leaves (radiating + poppy + bells; fern draws its own) */}
        {showStem && <path d={`M50 88 C 49 ${72} 51 ${stemTopY + 8} 50 ${stemTopY}`} stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        {showStem && leaf1 && <path d={`M50 72 C 39 68 33 71 31 78 C 40 79 48 76 50 71 Z`} fill={LEAF} opacity="0.92" />}
        {showStem && leaf2 && <path d={`M50 66 C 61 62 67 65 69 72 C 60 73 52 70 50 65 Z`} fill={LEAF_DK} opacity="0.86" />}

        {!seed && (
          <g className={tall || form.fern ? "fw-sway" : "fw-breath"} style={tall || form.fern ? { transformOrigin: "50px 84px", animation: resting ? "none" : "fwSway 7s ease-in-out infinite" } : breath}>
            {/* ───────── PEONY — lush layered ruffle ───────── */}
            {form.key === "peony" && (() => {
              const R = 7 + open * 9;
              const ring = (count, len, wid, rad, fill, o) => Array.from({ length: count }).map((_, i) => {
                const ang = i * (360 / count); const a = ang * Math.PI / 180;
                const px = cx + Math.cos(a - Math.PI / 2) * rad, py = headY + Math.sin(a - Math.PI / 2) * rad;
                return petal(px, py, len, wid, ang, fill, o, `${count}-${i}`);
              });
              return <g>
                {ring(9, R + 4, R * 0.62, R * 0.5, `url(#pet-${gid})`, op * 0.95)}
                {ring(8, R, R * 0.55, R * 0.28, light, op)}
                {open > 0.4 && ring(6, R * 0.7, R * 0.5, R * 0.12, lighten(color, 0.6), op)}
                <circle cx={cx} cy={headY} r={2 + open * 2} fill={resting ? "#C9BCA6" : accent} />
              </g>;
            })()}

            {/* ───────── DAISY — fine rays + accent disc ───────── */}
            {form.key === "daisy" && (() => {
              const n = 14, L = 7 + open * 11, W = 1.6 + open * 1.4;
              return <g>
                {Array.from({ length: n }).map((_, i) => { const ang = i * (360 / n);
                  return petal(cx, headY, L, W, ang, PALE, op, i); })}
                {Array.from({ length: n }).map((_, i) => { const ang = i * (360 / n);
                  return petal(cx, headY, L, W, ang, color, op * 0.22, `t${i}`); })}
                <circle cx={cx} cy={headY} r={3 + open * 3.2} fill={accent} />
                <circle cx={cx} cy={headY} r={3 + open * 3.2} fill={deep} opacity="0.18" />
              </g>;
            })()}

            {/* ───────── FOXGLOVE — spire of speckled bells ───────── */}
            {form.key === "foxglove" && (() => {
              const bells = 2 + Math.round(open * 4);
              return <g>
                <path d={`M50 86 C 49 70 51 ${headY + 10} 50 ${headY - 2}`} stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
                {leaf1 && <path d="M50 74 C 40 71 35 74 33 80 C 41 81 48 78 50 73 Z" fill={LEAF} opacity="0.9" />}
                {Array.from({ length: bells }).map((_, i) => {
                  const y = (headY - 2) + i * (6 + open * 1.5); const sx = cx + (i % 2 ? 5.5 : -5.5);
                  const w = 3 + open * 2 + i * 0.5, h = 5 + open * 3;
                  return <g key={i}>
                    <path d={`M${sx} ${y - h} C ${sx - w} ${y - h} ${sx - w} ${y} ${sx - w * 0.6} ${y + 1.5} C ${sx} ${y + 3} ${sx + w * 0.6} ${y + 3} ${sx + w * 0.6} ${y + 1.5} C ${sx + w} ${y} ${sx + w} ${y - h} ${sx} ${y - h} Z`} fill={`url(#pet-${gid})`} opacity={op} />
                    <circle cx={sx - 1} cy={y - h * 0.4} r="0.7" fill={accent} opacity={op} />
                    <circle cx={sx + 1} cy={y - h * 0.2} r="0.7" fill={accent} opacity={op} />
                  </g>;
                })}
                {open > 0.5 && <circle cx={cx} cy={headY - 4} r="1.6" fill={lighten(color, 0.5)} opacity={op} />}
              </g>;
            })()}

            {/* ───────── FERN — arching frond of paired leaflets ───────── */}
            {form.fern && (() => {
              const pairs = 3 + Math.round(open * 4);
              return <g>
                <path d={`M50 88 C 50 70 ${50 + open * 10} ${50} ${50 + open * 14} ${82 - open * 52}`} stroke={STEM} strokeWidth="2" fill="none" strokeLinecap="round" />
                {Array.from({ length: pairs }).map((_, i) => {
                  const t = i / (pairs - 1 || 1);
                  const ry = 82 - open * 52 * (1 - t) - t * 4;
                  const rx = 50 + open * 14 * t * t;
                  const w = (9 - i * 1.0) * (0.45 + open * 0.7); if (w <= 1) return null;
                  return <g key={i}>
                    <ellipse cx={rx - 3.4} cy={ry} rx={w / 2} ry="2.1" fill={color} opacity={op * 0.9} transform={`rotate(-34 ${rx - 3.4} ${ry})`} />
                    <ellipse cx={rx + 3.4} cy={ry} rx={w / 2} ry="2.1" fill={LEAF_DK} opacity={op * 0.9} transform={`rotate(34 ${rx + 3.4} ${ry})`} />
                  </g>;
                })}
                {/* young fiddlehead curl in accent */}
                {open < 0.5 ? <circle cx={50 + open * 14} cy={82 - open * 52} r={2 + (0.5 - open) * 4} fill="none" stroke={accent} strokeWidth="1.4" opacity={op} />
                  : <circle cx={50 + open * 14} cy={82 - open * 52} r="1.8" fill={accent} opacity={op} />}
              </g>;
            })()}

            {/* ───────── POPPY — four crinkled cups, dark eye ───────── */}
            {form.key === "poppy" && (() => {
              const L = 9 + open * 12, W = 7 + open * 6;
              return <g>
                {[18, 105, 195, 285].map((ang, i) => petal(cx, headY, L, W, ang, i % 2 ? `url(#pet-${gid})` : deep, op * (i % 2 ? 0.95 : 0.88), i))}
                {open > 0.45 && <g>
                  <circle cx={cx} cy={headY} r={2.6 + open * 2} fill="#2A1F16" opacity={resting ? 0.5 : 0.85} />
                  {Array.from({ length: 8 }).map((_, i) => { const a = i * 45 * Math.PI / 180; const r = 3.4 + open * 2.4;
                    return <circle key={i} cx={cx + Math.cos(a) * r} cy={headY + Math.sin(a) * r} r="0.8" fill={accent} opacity={op} />; })}
                </g>}
              </g>;
            })()}

            {/* ───────── FORGET-ME-NOT — cluster of tiny five-petal flowers ───────── */}
            {form.key === "forget" && (() => {
              const florets = open < 0.4 ? 3 : open < 0.75 ? 5 : 7;
              const spots = [[0, 0], [-7, 2], [7, 2], [-3.5, -6], [3.5, -6], [-9, -4], [9, -4]];
              const fr = 1.4 + open * 1.6;
              return <g>
                {spots.slice(0, florets).map(([dx, dy], i) => {
                  const fx = cx + dx * (0.6 + open * 0.5), fy = headY + dy * (0.6 + open * 0.5);
                  return <g key={i}>
                    {[0, 72, 144, 216, 288].map((ang) => { const a = ang * Math.PI / 180;
                      return <circle key={ang} cx={fx + Math.cos(a) * fr * 1.1} cy={fy + Math.sin(a) * fr * 1.1} r={fr} fill={i % 2 ? color : light} opacity={op} />; })}
                    <circle cx={fx} cy={fy} r={fr * 0.6} fill={accent} opacity={op} />
                  </g>;
                })}
              </g>;
            })()}

          </g>
        )}
      </svg>
    </div>
  );
}
