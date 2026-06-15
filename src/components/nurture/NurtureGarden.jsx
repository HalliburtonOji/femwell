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

// ── the bloom — renders BY FORM, in the phase colour with the user's identity accent;
// opens with growth stage and breathes gently (stilled for resting + reduced-motion). ──
function Bloom({ form, stageIdx, color, accent, resting, bright, size = 190 }) {
  const cx = 50, cy = 42;
  const open = Math.min(1, stageIdx / 4);
  const petalLen = 9 + open * 16;
  const petalW = (form.round ? 6 : 4) + open * 5;
  const n = form.petals || 6;
  const leafOn = stageIdx >= 1, leaf2On = stageIdx >= 2;
  const stemTop = stageIdx === 0 ? 58 : cy + 6;
  const petalOpacity = resting ? 0.4 : (bright ? 1 : 0.85);
  return (
    <div aria-hidden style={{ width: size, height: size, position: "relative" }}>
      <style>{`@keyframes fwBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}@media (prefers-reduced-motion:reduce){.fw-breath{animation:none!important}}`}</style>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx={cx} cy={cy} r={open * 26 + 8} fill={color} opacity={bright ? 0.16 : 0.08} />
        <path d={`M50 86 C 49 74, 51 66, 50 ${stemTop}`} stroke="#7C8F6E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {leafOn && <path d="M50 70 C 40 66, 34 70, 33 76 C 41 78, 48 75, 50 70 Z" fill="#8FAF8F" opacity="0.9" />}
        {leaf2On && <path d="M50 64 C 60 60, 66 64, 67 70 C 59 72, 52 69, 50 64 Z" fill="#7FA07F" opacity="0.85" />}
        {stageIdx === 0 ? (
          <g><ellipse cx={cx} cy="60" rx="7" ry="4.5" fill={color} opacity="0.55" /><path d="M30 64 Q50 60 70 64" stroke="#7C8F6E" strokeWidth="1.4" fill="none" opacity="0.5" /></g>
        ) : form.fern ? (
          // fern — a frond of paired leaflets in the phase colour, accent tip
          <g className={resting ? "" : "fw-breath"} style={{ transformOrigin: `${cx}px ${cy}px`, animation: resting ? "none" : "fwBreath 5.5s ease-in-out infinite" }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const y = 56 - i * (4 + open * 2);
              const w = (10 - i * 1.4) * (0.5 + open);
              return <g key={i}><ellipse cx={cx - w / 2} cy={y} rx={w / 2} ry="2.4" fill={color} opacity={petalOpacity} transform={`rotate(-28 ${cx} ${y})`} /><ellipse cx={cx + w / 2} cy={y} rx={w / 2} ry="2.4" fill={color} opacity={petalOpacity} transform={`rotate(28 ${cx} ${y})`} /></g>;
            })}
            <circle cx={cx} cy={stemTop} r={2.5 + open * 1.5} fill={accent} />
          </g>
        ) : form.bell ? (
          // foxglove — a vertical stalk of bells, phase colour, accent throat
          <g className={resting ? "" : "fw-breath"} style={{ transformOrigin: `${cx}px ${cy}px`, animation: resting ? "none" : "fwBreath 5.5s ease-in-out infinite" }}>
            {[0, 1, 2, 3, 4].slice(0, 2 + Math.round(open * 3)).map((i) => {
              const y = 54 - i * (5 + open * 2);
              return <ellipse key={i} cx={cx + (i % 2 ? 5 : -5)} cy={y} rx={3 + open * 2} ry={5 + open * 2.5} fill={color} opacity={petalOpacity} />;
            })}
            <circle cx={cx} cy={cy} r={2 + open} fill={accent} />
          </g>
        ) : (
          // radiating petals (peony/daisy/poppy/forget-me-not) — count + roundness by form
          <g className={resting ? "" : "fw-breath"} style={{ transformOrigin: `${cx}px ${cy}px`, animation: resting ? "none" : "fwBreath 5.5s ease-in-out infinite" }}>
            {Array.from({ length: n }).map((_, i) => {
              const a = (i * (360 / n)) * Math.PI / 180;
              const px = cx + Math.cos(a) * (petalLen * 0.6);
              const py = cy + Math.sin(a) * (petalLen * 0.6);
              return <ellipse key={i} cx={px} cy={py} rx={petalW} ry={petalLen * (form.round ? 0.55 : 0.7)} fill={color} opacity={petalOpacity} transform={`rotate(${i * (360 / n)} ${px} ${py})`} />;
            })}
            <circle cx={cx} cy={cy} r={3.5 + open * 2.5} fill={resting ? "#C9BCA6" : accent} />
          </g>
        )}
      </svg>
    </div>
  );
}
