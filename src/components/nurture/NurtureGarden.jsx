// NurtureGarden v2 — the Nurture Companion. The app's HEARTBEAT: a living thing UNIQUE to
// each user, grown from engagement across the WHOLE app, that she can TEND, CHANGE
// (rename/reshape) and SHARE (a non-personal card). State, not score. Never dies; a gap is
// a resting season, met with a warm welcome — no streaks, no decay, no guilt.
//
// Real signals (guarded, capped reads): Journal + Nutrition (meals + water) + Check-ins +
// Cycle/symptoms + Programs, and device-local Community acts (echoes left, questions
// answered, circles joined). Identity (form/colour/personality) is seeded per user.
// Brand: cream/plum, Ephesis/Cormorant, Lucide/SVG, no emoji.

import { useEffect, useMemo, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { format, differenceInCalendarDays } from "date-fns";
import { X, Share2, Sprout, PenLine, Download } from "lucide-react";
import {
  T, UI, SERIF, Script, Hand, Eyebrow, Heart, PHASE_COLORS, PHASE_LABEL, useEditorialFonts,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  getCompanion, FORM_LIST, renameCompanion, reshapeCompanion, tendCompanion, tendedToday, loadCompanionState,
} from "@/components/nurture/companion";
import {
  currentChapterKey, chapterLabel, groupByMonth, seasonOf, seasonColor, AREA_NOUN, formKeyForChapter,
  localChapters, loadGardenChapters, archiveChapter,
} from "@/components/nurture/garden";
import { readingDaySet } from "@/components/community/readingActivity";
import {
  MILESTONES, milestoneDef, localMilestones, loadMilestones, detectMilestones,
} from "@/components/nurture/milestones";
import {
  isShared, isNameShared, optIntoSharedGarden, optOutOfSharedGarden, loadSharedGarden,
} from "@/components/nurture/companionShare";

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
  const [leaving, setLeaving] = useState(false);     // "leave a line" ritual open
  const [lineDraft, setLineDraft] = useState("");
  const [draftName, setDraftName] = useState("");
  const [justTended, setJustTended] = useState(false);
  const [chapters, setChapters] = useState([]);          // past chapters — the accumulating garden
  const [openChapter, setOpenChapter] = useState(null);  // a tapped past chapter (detail sheet)
  const [milestoneKeys, setMilestoneKeys] = useState([]);// RARE blooms grown (collection, not score)
  const [newRare, setNewRare] = useState([]);            // rare blooms grown THIS load (gentle note)
  const [openRare, setOpenRare] = useState(null);        // a tapped rare bloom (detail sheet)
  const [shared, setShared] = useState(false);           // opt-in: my companion in the shared garden
  const [meadow, setMeadow] = useState(null);            // OTHER companions (null = not loaded yet)
  const [meadowOpen, setMeadowOpen] = useState(false);   // the Garden of Gardens section expanded
  const shareBloomRef = useRef(null);

  // scroll-lock the page while the share modal is open (full-cover, no bleed-through)
  useEffect(() => {
    if (!sharing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [sharing]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      const id = me?.id || null;
      // hydrate her cross-device choices (name/form/tend) from the entity, then re-resolve.
      // Fire-and-forget + fail-open: the local cache already renders instantly.
      if (id) loadCompanionState(id).then((changed) => { if (changed && alive) setVersion((v) => v + 1); }).catch(() => {});
      const last7 = daysBack(7);
      // ALL-APP signals (guarded, capped, fail-open to []). The companion is nourished by
      // genuine engagement everywhere: journal, nutrition, check-ins, cycle, PROGRAMS &
      // practice, the PLANNER, and the COMMUNITY (per-user QOTD answers, plus anonymous
      // acts — echoes/reactions/circles — counted device-local since they carry no user_id).
      // load the milestone cache instantly (renders before any network), then hydrate it
      if (id) { setMilestoneKeys(localMilestones(id)); loadMilestones(id).then((changed) => { if (changed && alive) setMilestoneKeys(localMilestones(id)); }).catch(() => {}); }
      // restore the shared-garden opt-in flag (device-local, synchronous)
      setShared(isShared());
      const [E, M, W, Cn, Sy, Up, Q, Pl, Pt, Pi, Tc, prof, Sl, Ce] = await Promise.all([
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
        // Phase 3 — two cheap extra reads ONLY for rare-bloom detection (guarded, fail-open):
        // opened sealed letters + period-starts (a full cycle observed). Both light.
        id ? base44.entities.SealedLetters.filter({ user_id: id }, "-created_date", 60).catch(() => []) : [],
        id ? base44.entities.CycleEvents.filter({ user_id: id }, "-created_date", 40).catch(() => []) : [],
      ]);
      if (!alive) return;
      const arr = (x) => (Array.isArray(x) ? x.filter(Boolean) : []);
      const dayOf = (x) => x.day_key || x.date || (x.created_date ? String(x.created_date).slice(0, 10) : (x.created_at ? String(x.created_at).slice(0, 10) : null));
      const daySet = (...xs) => { const s = new Set(); xs.forEach((g) => arr(g).forEach((x) => { const d = dayOf(x); if (d) s.add(d); })); return s; };
      const commLocal = communityActs();
      // reading is anonymity-safe + device-local: date-stamped `fw_read_*` keys (no user_id),
      // so it's read straight from localStorage like the community acts — a day she spent with a
      // book feeds the chapter exactly like journal/nutrition/etc. (AREA_NOUN.reading exists;
      // formKeyForChapter already maps reading -> a clustered "forget-me-not" form).
      const readingSet = readingDaySet();
      // per-area DAY sets — the basis for "what fed it today / this week" (cause→effect made visible)
      const areaSets = {
        journal: daySet(E), nutrition: daySet(M, W), checkins: daySet(Cn), cycle: daySet(Sy),
        programs: daySet(Up, Tc), planner: daySet(Pl, Pt, Pi), community: daySet(Q),
        reading: readingSet,
      };
      const areas = {
        journal: arr(E).length, nutrition: arr(M).length + arr(W).length, checkins: arr(Cn).length,
        cycle: arr(Sy).length, programs: arr(Up).length + arr(Tc).length,
        planner: arr(Pl).length + arr(Pt).length + arr(Pi).length, community: arr(Q).length + commLocal,
        reading: readingSet.size,
      };
      const today = format(new Date(), "yyyy-MM-dd");
      const todayAreas = Object.keys(areaSets).filter((k) => areaSets[k].has(today));
      const weekAreas = Object.keys(areaSets).filter((k) => [...areaSets[k]].some((d) => last7.has(d)));
      const allDays = new Set(); Object.values(areaSets).forEach((s) => s.forEach((d) => allDays.add(d)));
      const lifetime = Object.values(areas).reduce((a, b) => a + b, 0);
      const sorted = [...allDays].sort();
      const lastDay = sorted.length ? sorted[sorted.length - 1] : null;
      const gapDays = lastDay ? differenceInCalendarDays(new Date(), new Date(lastDay)) : null;
      const tended7 = [...allDays].filter((d) => last7.has(d)).length;

      // ── CHAPTERS — the accumulating garden (Direction B). A chapter = a calendar month:
      // the current month is the live plant; each PAST month is a kept chapter. Group the
      // engagement day-sets by month, archive any past month not yet kept (fire-and-forget),
      // and load the kept chapters cross-device. ──
      const grouped = groupByMonth(areaSets);
      const curKey = currentChapterKey();
      const cur = grouped[curKey] || { activeDays: 0, engagement: 0, topArea: null };
      const comp = id ? getCompanion(id) : null;
      const lifeStage = (Array.isArray(prof) ? prof[0] : null)?.life_stage || "";
      const pastKeys = Object.keys(grouped).filter((k) => k < curKey);
      if (id && comp) {
        const kept = new Set(localChapters(id).map((c) => c.chapter_key));
        for (const k of pastKeys) {
          if (kept.has(k)) continue;
          const g = grouped[k];
          const st = stageFor(g.engagement);
          const noun = AREA_NOUN[g.topArea] || "small daily care";
          archiveChapter(id, {
            chapter_key: k, label: chapterLabel(k), life_stage: lifeStage,
            form_key: formKeyForChapter(g.topArea, g.activeDays), accent: comp.accent, stage_key: st.key, season: seasonOf(k),
            top_area: g.topArea || "", active_days: g.activeDays,
            summary: `You showed up ${g.activeDays} ${g.activeDays === 1 ? "day" : "days"}${g.topArea ? ` · mostly ${noun}` : ""}.`,
          });
        }
        setChapters(localChapters(id).filter((c) => c.chapter_key < curKey));
        loadGardenChapters(id).then((all) => { if (alive) setChapters(all.filter((c) => c.chapter_key < curKey)); }).catch(() => {});
      }

      // ── RARE / MILESTONE BLOOMS — earned THROUGH LIVING (collection, not score). Detect from
      // the real data we already loaded + the two cheap extra reads. Account age comes from the
      // signed-in user's created_date. detectMilestones only ADDS newly-earned keys (never
      // removes), persists them (local-first + guarded fire-and-forget), and reports what's new. ──
      if (id) {
        const lettersOpened = arr(Sl).filter((l) => l && (l.unseal_seen_at || l.unsealed_at)).length;
        const cycleStarts = arr(Ce).filter((c) => c && String(c.type || "").toLowerCase().replace(/[^a-z]/g, "") === "periodstart").length;
        const accountAgeDays = me?.created_date ? Math.max(0, differenceInCalendarDays(new Date(), new Date(me.created_date))) : 0;
        const { keys, newlyEarned } = detectMilestones(id, {
          journalCount: arr(E).length,
          communityActs: arr(Q).length + commLocal,
          readingDayCount: readingSet.size,
          activeDayCount: allDays.size,
          accountAgeDays,
          lettersOpened,
          cycleStarts,
        });
        if (alive) { setMilestoneKeys(keys); if (newlyEarned.length) setNewRare(newlyEarned); }
      }

      setUid(id);
      setProfile(Array.isArray(prof) ? prof[0] : null);
      setData({
        lifetime, tended7, gapDays, areas, todayAreas, weekAreas,
        chapterKey: curKey, chapterLabelText: chapterLabel(curKey),
        chapterEngagement: cur.engagement, chapterActiveDays: cur.activeDays, chapterTopArea: cur.topArea,
        isFreshChapter: cur.engagement === 0 && pastKeys.length > 0,
      });
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
  // The plant grows from THIS chapter's engagement (it's this chapter's plant); a new month
  // begins fresh. Past chapters are kept below in the garden.
  const stage = stageFor(data.chapterEngagement ?? data.lifetime ?? 0);
  const stageIdx = STAGES.findIndex((s) => s.key === stage.key);
  // Phase 2: the current chapter's plant form branches from the life-area she tended most this
  // chapter — unless she explicitly reshaped it, in which case her choice wins.
  const currentForm = companion.formChosen
    ? companion.form
    : (FORM_LIST.find((f) => f.key === formKeyForChapter(data.chapterTopArea, data.chapterActiveDays)) || companion.form);
  const resting = (data.gapDays == null) || (data.gapDays >= 5);
  const returning = data.gapDays != null && data.gapDays >= 5 && data.tended7 > 0;
  const stateName = data.gapDays == null ? "Just planted" : (resting && !returning) ? "Resting" : stage.name;
  const stateLine = data.gapDays == null ? `${companion.name} is ready for its first act of care.`
    : returning ? `Welcome back. ${companion.name} kept your place — waking up with you.`
    : (resting) ? `Resting season. Nothing is lost; ${companion.name} is waiting, soft and alive.`
    : stage.line;
  // friendly nouns for "what fed your garden" (cause→effect made visible)
  const FED_NOUN = { journal: "your journal", nutrition: "what you ate & drank", checkins: "your check-in", cycle: "your cycle notes", programs: "a practice kept", planner: "the day you planned", community: "the community", reading: "time with a book", __ritual: "the line you left" };
  const fedToday = [...(tendedT ? ["__ritual"] : []), ...(data.todayAreas || [])];
  const fedWeek = [...new Set([...(tendedT ? ["__ritual"] : []), ...(data.weekAreas || [])])];
  const joinNouns = (keys) => { const w = keys.slice(0, 3).map((k) => FED_NOUN[k]).filter(Boolean); return w.length <= 1 ? (w[0] || "") : `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`; };

  // ── COMMUNITY "Garden of Gardens" — opt-in, non-personal, presence not score ──
  // The snapshot is the ONLY thing that travels: form / stage / season / accent (+ name iff
  // she opts in to that). Never email / cycle / journal / mood / real name / user_id. The
  // toggle is optimistic — the entity write is fire-and-forget inside opt-in/out. Loading the
  // meadow is a guarded, fail-open read; never blocks the toggle.
  const loadMeadow = () => { loadSharedGarden(uid).then((rows) => { if (rows) setMeadow(rows); }).catch(() => setMeadow([])); };
  const buildSnapshot = (includeName) => ({
    form_key: currentForm.key, stage_key: stage.key, accent: companion.accent,
    season: seasonOf(data.chapterKey), display_name: includeName ? companion.name : "",
  });
  const toggleShare = (on, withName) => {
    setShared(on);
    if (on) optIntoSharedGarden(uid, buildSnapshot(withName), withName);
    else optOutOfSharedGarden(uid);
    setMeadow(null); loadMeadow();   // refresh presence after the change (fail-open)
  };
  const openMeadow = () => { setMeadowOpen(true); if (meadow === null) loadMeadow(); };

  const doLeaveLine = () => { if (!uid) return; tendCompanion(uid, lineDraft.trim()); setJustTended(true); setLeaving(false); setLineDraft(""); setVersion((v) => v + 1); };
  const saveName = () => { if (uid) renameCompanion(uid, draftName); setEditing(false); setVersion((v) => v + 1); };
  const pickForm = (k) => { if (uid) reshapeCompanion(uid, k); setVersion((v) => v + 1); };
  const openShare = () => { setEditing(false); setLeaving(false); setSharing(true); };

  // SHARE as a real downloadable/shareable IMAGE — render a clean, self-contained SVG card
  // (cream bg + the live bloom markup + non-personal text) → raster to PNG → Web Share or
  // download. NOTHING personal travels with it: name + bloom + a gentle line only.
  const exportImage = async () => {
    try {
      // serialize the live bloom via a clone (valid XML, proper xmlns, no duplicate attrs —
      // an <img> loads the SVG with a STRICT XML parser, so outerHTML+regex would fail)
      const bloomSvg = shareBloomRef.current && shareBloomRef.current.querySelector("svg");
      let bloomMarkup = "";
      if (bloomSvg) {
        const clone = bloomSvg.cloneNode(true);
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        clone.setAttribute("width", "360");
        clone.setAttribute("height", "360");
        bloomMarkup = new XMLSerializer().serializeToString(clone);
      }
      const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const W = 720, H = 940, cxx = W / 2;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
        + `<rect width="${W}" height="${H}" fill="${T.paper}"/>`
        + `<rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="40" fill="${T.paperHi}" stroke="${T.paperDeep}" stroke-width="2"/>`
        + `<text x="${cxx}" y="104" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="5" fill="${T.muted}">FEMWELL — MY COMPANION</text>`
        + `<g transform="translate(${cxx - 180}, 150)">${bloomMarkup}</g>`
        + `<text x="${cxx}" y="612" text-anchor="middle" font-family="Georgia, 'Cormorant Garamond', serif" font-size="66" fill="${T.ink}">${esc(companion.name)}</text>`
        + `<text x="${cxx}" y="662" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" letter-spacing="1" fill="${T.muted}">${esc(stateName)} · ${esc(currentForm.name)}</text>`
        + `<text x="${cxx}" y="742" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="${T.inkSoft}">Grown gently, at my own pace.</text>`
        + `<text x="${cxx}" y="784" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="${T.inkSoft}">No streaks, no scores.</text>`
        + `<text x="${cxx}" y="${H - 56}" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="17" letter-spacing="1" fill="${T.muted}">A keepsake — nothing personal travels with it</text>`
        + `</svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      const img = new Image();
      const png = await new Promise((resolve, reject) => {
        img.onload = () => {
          const s = 2, c = document.createElement("canvas"); c.width = W * s; c.height = H * s;
          const ctx = c.getContext("2d"); ctx.scale(s, s); ctx.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(url);
          c.toBlob((b) => resolve(b), "image/png");
        };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
      });
      if (!png) return;
      window.__fwSharePNGBytes = png.size;       // diagnostic for verification
      const file = new File([png], `${companion.name.replace(/\s+/g, "-")}-femwell.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "My FemWell companion" }); return; } catch { /* fall through to download */ }
      }
      const dl = URL.createObjectURL(png);
      const a = document.createElement("a"); a.href = dl; a.download = file.name; document.body.appendChild(a); a.click();
      a.remove(); setTimeout(() => URL.revokeObjectURL(dl), 1500);
    } catch { /* fail-open: the card is still on screen to screenshot */ }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 6 : 12 }}>
        <Heart size={14} />
        <Eyebrow color={T.muted}>{phase ? `${companion.name} · ${PHASE_LABEL[phase]} phase` : companion.name}</Eyebrow>
      </div>

      <Bloom form={currentForm} stageIdx={stageIdx} color={phaseColor} accent={companion.accent} resting={resting && !returning} bright={justTended} size={compact ? 118 : 190} />

      <Script size={compact ? 24 : 32} color={T.ink} style={{ marginTop: compact ? 8 : 14 }}>{stateName}</Script>
      <Hand size={compact ? 15 : 17} color={T.muted} style={{ marginTop: 6, maxWidth: 360, lineHeight: 1.5 }}>{stateLine}</Hand>

      {/* what fed it — the connection made visible (brief on the compact home cards) */}
      {compact && !resting && fedToday.length > 0 && (
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 8, maxWidth: 320, lineHeight: 1.45 }}>
          Today, {joinNouns(fedToday)} fed it
        </div>
      )}

      {/* TODAY'S BLOOM, AT A GLANCE — the first thing on /Garden (the in-app equivalent of a
          home-screen glance; a true OS widget needs native work — see summary). One calm line. */}
      {!compact && (
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.muted, marginTop: 10, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 13px", maxWidth: 360, lineHeight: 1.45 }}>
          {fedToday.length > 0 ? <>Today · {joinNouns(fedToday)} fed it</> : <>Today · resting is part of it</>}
        </div>
      )}

      {!compact && (
        <>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, marginTop: 12, maxWidth: 360, lineHeight: 1.5 }}>
            “{companion.personality.voice}”
          </div>

          {/* WHAT'S FEEDING YOUR GARDEN — real engagement shown as cause→effect */}
          <div style={{ marginTop: 18, width: "100%", maxWidth: 400, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 16px", textAlign: "left" }}>
            <Eyebrow mb={8}>What's feeding your garden</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5 }}>
              {fedToday.length > 0
                ? <>Today, <strong style={{ fontWeight: 600 }}>{joinNouns(fedToday)}</strong> fed it.</>
                : <>Nothing today — and that&apos;s allowed. Rest is part of how it grows.</>}
            </div>
            {fedWeek.length > 0 && (
              <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
                This week: {joinNouns(fedWeek)} · {data.tended7} {data.tended7 === 1 ? "day" : "days"} you showed up
              </div>
            )}
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 10, lineHeight: 1.5, opacity: 0.9 }}>
              It grows from your real self-care across the app — journalling, meals &amp; water, check-ins, your cycle, the community, your plans and practices. The acts are the tending.
            </div>
          </div>

          {/* LEAVE A LINE (a real ritual) · MAKE IT YOURS · SHARE */}
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center", marginTop: 18 }}>
            <button onClick={() => { setLeaving((v) => !v); setEditing(false); }} style={{
              display: "inline-flex", alignItems: "center", gap: 7, background: T.crimson, color: T.paper,
              border: "none", borderRadius: 12, padding: "11px 18px", cursor: "pointer",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
            }}>
              <PenLine size={14} /> Leave a line
            </button>
            <button onClick={() => { setDraftName(companion.name); setEditing((e) => !e); setLeaving(false); }} style={ghost}>
              <Sprout size={13} /> Make it yours
            </button>
            <button onClick={openShare} style={ghost}>
              <Share2 size={13} /> Share
            </button>
          </div>

          {/* the ritual — one honest line, saved cross-device; counts as showing up today */}
          {leaving && (
            <div style={{ marginTop: 14, width: "100%", maxWidth: 400, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 15px", textAlign: "left" }}>
              <Eyebrow mb={8}>How are you, really?</Eyebrow>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={lineDraft} onChange={(e) => setLineDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && lineDraft.trim()) doLeaveLine(); }}
                  placeholder="One honest line…" maxLength={120} autoFocus
                  style={{ flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 8, padding: "9px 11px", fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none" }} />
                <button onClick={doLeaveLine} disabled={!lineDraft.trim()} style={{ flexShrink: 0, background: lineDraft.trim() ? T.ink : T.paperDeep, color: T.paper, border: "none", borderRadius: 8, padding: "0 14px", cursor: lineDraft.trim() ? "pointer" : "default", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Leave</button>
              </div>
              <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>A real moment with yourself — saved, and it counts as showing up today. No streaks, no scores.</div>
            </div>
          )}

          {/* reflect today's line back */}
          {tendedT && companion.tendNote && !leaving && (
            <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, maxWidth: 360, lineHeight: 1.5 }}>
              Today you wrote: “{companion.tendNote}”
            </div>
          )}

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

          {/* THE ACCUMULATING GARDEN — each past month is a kept plant; tap one to revisit it */}
          {chapters.length > 0 && (
            <div style={{ marginTop: 28, width: "100%", maxWidth: 440, textAlign: "left", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <Eyebrow>Your garden</Eyebrow>
                <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{chapters.length + 1} chapters</span>
              </div>
              {data.isFreshChapter && (
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.inkSoft, margin: "8px 0 2px", lineHeight: 1.5 }}>
                  A new chapter — {data.chapterLabelText}. Last month&apos;s bloom is kept here; this one begins fresh.
                </div>
              )}
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "6px 0 14px", lineHeight: 1.5 }}>
                Each month grows its own plant, and it stays — a record of the seasons you&apos;ve moved through. Tap one to revisit it.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "flex-start" }}>
                {chapters.map((ch) => {
                  const sIdx = Math.max(0, STAGES.findIndex((s) => s.key === ch.stage_key));
                  // the chapter's form is branched from the life-area she tended most (deterministic,
                  // so it equals the form it was "born" with); stored form_key is a fallback.
                  const fk = formKeyForChapter(ch.top_area, ch.active_days) || ch.form_key;
                  const form = FORM_LIST.find((f) => f.key === fk) || FORM_LIST[0];
                  return (
                    <button key={ch.chapter_key} onClick={() => setOpenChapter(ch)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", width: 96 }}>
                      <Bloom form={form} stageIdx={sIdx} color={seasonColor(ch.season)} accent={ch.accent} resting={false} bright={false} size={88} />
                      <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.ink, marginTop: 2 }}>{ch.label}</span>
                      <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted }}>{ch.active_days} {ch.active_days === 1 ? "day" : "days"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RARE BLOOMS YOU'VE GROWN — collection, NOT score. Only ever shows what HAS grown
              (no locked/greyed missing milestones), plus a gentle "more may bloom as you go".
              Each is earned through living; tap one for its warm "look what grew" note. */}
          {milestoneKeys.length > 0 && (
            <div style={{ marginTop: 28, width: "100%", maxWidth: 440, textAlign: "left", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 18 }}>
              <Eyebrow>Rare blooms you&apos;ve grown</Eyebrow>
              {newRare.length > 0 && (
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.crimson, margin: "8px 0 2px", lineHeight: 1.5 }}>
                  Something new grew{newRare.length > 1 ? "" : ` — ${milestoneDef(newRare[0])?.title || ""}`}. Look what living made.
                </div>
              )}
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "6px 0 14px", lineHeight: 1.5 }}>
                A few rare blooms have grown through your living — not earned by hitting a target, just by being here. Tap one to read what grew.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "flex-start" }}>
                {MILESTONES.filter((m) => milestoneKeys.includes(m.key)).map((m) => {
                  const form = FORM_LIST.find((f) => f.key === m.form) || FORM_LIST[0];
                  return (
                    <button key={m.key} onClick={() => setOpenRare(m)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", width: 96 }}>
                      <Bloom form={form} stageIdx={4} color={T.gold} accent={companion.accent} resting={false} bright={false} rare={m.rare} size={88} />
                      <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.ink, marginTop: 2, textAlign: "center", lineHeight: 1.3 }}>{m.title}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted, marginTop: 12, lineHeight: 1.5 }}>
                More may bloom as you go — no need to chase them.
              </div>
            </div>
          )}

          {/* GARDEN OF GARDENS — a calm, anonymous meadow of OTHERS growing alongside. OPT-IN,
              off by default, strictly non-personal (form / stage / season / accent, name only if
              she chooses). No counts-as-score, no likes, no ranking — presence, not leaderboard. */}
          <div style={{ marginTop: 28, width: "100%", maxWidth: 440, textAlign: "left", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 18 }}>
            <Eyebrow>A garden of gardens</Eyebrow>
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "6px 0 12px", lineHeight: 1.5 }}>
              Others are growing alongside you. You can wander a calm, anonymous meadow of their companions — no names ranked, no counts, just presence. Yours is never shared unless you choose to.
            </div>

            {/* the opt-in toggle — explicit, off by default */}
            <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "13px 15px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={shared} onChange={(e) => toggleShare(e.target.checked, isNameShared())}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: T.crimson, cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.45 }}>
                  Add my companion to the shared garden
                  <span style={{ display: "block", fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
                    Only the bloom — its shape, season and colour — travels. Never your name, journal, cycle or anything personal.
                  </span>
                </span>
              </label>
              {shared && (
                <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", marginTop: 11, paddingTop: 11, borderTop: `1px solid ${T.paperDeep}` }}>
                  <input type="checkbox" checked={isNameShared()} onChange={(e) => toggleShare(true, e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: T.crimson, cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.4 }}>
                    Include the name “{companion.name}” (optional)
                  </span>
                </label>
              )}
            </div>

            {!meadowOpen ? (
              <button onClick={openMeadow} style={{ ...ghost, marginTop: 14, width: "100%", justifyContent: "center" }}>
                <Sprout size={13} /> Wander the meadow
              </button>
            ) : (
              <div style={{ marginTop: 16 }}>
                {meadow === null ? (
                  <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, textAlign: "center", padding: "12px 0" }}>Gathering the meadow…</div>
                ) : meadow.length === 0 ? (
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5 }}>
                    The meadow is quiet for now. As others choose to share, blooms will appear here — you&apos;ll be in good company.
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                      {meadow.map((m) => {
                        const form = FORM_LIST.find((f) => f.key === m.form_key) || FORM_LIST[0];
                        const sIdx = Math.max(0, STAGES.findIndex((s) => s.key === m.stage_key));
                        return (
                          <div key={m.author_hash} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 78 }}>
                            <Bloom form={form} stageIdx={sIdx >= 0 ? sIdx : 3} color={seasonColor(m.season)} accent={m.accent} resting={false} bright={false} size={70} />
                            {m.display_name ? <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, marginTop: 1, textAlign: "center", lineHeight: 1.2 }}>{m.display_name}</span> : null}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted, marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>
                      Others, growing alongside you.
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* SHARE — a clean, full-cover, scroll-locked modal (opaque scrim → no bleed-through).
          A NON-personal keepsake: name + bloom + a gentle line only — never a journal line,
          mood, cycle, email or any private data. "Save image" rasterises it to a real PNG
          (Web Share where supported, else download). */}
      {sharing && (
        <div onClick={() => setSharing(false)} role="dialog" aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,8,5,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 340, background: T.paperHi, backgroundColor: T.paperHi, borderRadius: 24, padding: "28px 24px 22px", textAlign: "center", boxShadow: "0 24px 60px rgba(11,8,5,0.5)", position: "relative", border: `1px solid ${T.paperDeep}` }}>
            <button onClick={() => setSharing(false)} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 999, background: T.paperHi, border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={16} /></button>
            <Eyebrow color={T.muted} mb={10}>FemWell · my companion</Eyebrow>
            <div ref={shareBloomRef} style={{ display: "flex", justifyContent: "center" }}>
              <Bloom form={currentForm} stageIdx={stageIdx} color={phaseColor} accent={companion.accent} resting={false} bright={false} size={160} />
            </div>
            <Script size={34} color={T.ink} style={{ marginTop: 10, lineHeight: 1.1 }}>{companion.name}</Script>
            <Hand size={15} color={T.muted} style={{ marginTop: 6 }}>{stateName} · {currentForm.name}</Hand>
            <div style={{ marginTop: 16, fontFamily: SERIF, fontSize: 14, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.55, padding: "0 4px" }}>
              Grown gently, at my own pace.<br />No streaks, no scores.
            </div>
            <button onClick={exportImage}
              style={{ marginTop: 20, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "13px 18px", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              <Download size={15} /> Save image
            </button>
            <div style={{ marginTop: 12, fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3, lineHeight: 1.5 }}>
              A keepsake — nothing personal travels with it.
            </div>
          </div>
        </div>
      )}

      {/* A KEPT CHAPTER — tap a past plant to revisit that season (revisit, never relive) */}
      {openChapter && (
        <div onClick={() => setOpenChapter(null)} role="dialog" aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,8,5,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 340, background: T.paperHi, borderRadius: 24, padding: "28px 24px 22px", textAlign: "center", boxShadow: "0 24px 60px rgba(11,8,5,0.5)", position: "relative", border: `1px solid ${T.paperDeep}` }}>
            <button onClick={() => setOpenChapter(null)} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 999, background: T.paperHi, border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={16} /></button>
            <Eyebrow color={T.muted} mb={10}>A chapter · {openChapter.season}</Eyebrow>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Bloom form={FORM_LIST.find((f) => f.key === (formKeyForChapter(openChapter.top_area, openChapter.active_days) || openChapter.form_key)) || FORM_LIST[0]} stageIdx={Math.max(0, STAGES.findIndex((s) => s.key === openChapter.stage_key))} color={seasonColor(openChapter.season)} accent={openChapter.accent} resting={false} bright={false} size={150} />
            </div>
            <Script size={32} color={T.ink} style={{ marginTop: 10, lineHeight: 1.1 }}>{openChapter.label}</Script>
            {[openChapter.life_stage, openChapter.season].filter(Boolean).length > 0 && (
              <Hand size={15} color={T.muted} style={{ marginTop: 6 }}>{[openChapter.life_stage, openChapter.season].filter(Boolean).join(" · ")}</Hand>
            )}
            <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.55 }}>{openChapter.summary}</div>
            <div style={{ marginTop: 14, fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3 }}>Kept in your garden. Nothing is lost.</div>
          </div>
        </div>
      )}

      {/* A RARE BLOOM — tap one to read its warm "look what grew" note (collection, never score) */}
      {openRare && (
        <div onClick={() => setOpenRare(null)} role="dialog" aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,8,5,0.9)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 340, background: T.paperHi, borderRadius: 24, padding: "28px 24px 22px", textAlign: "center", boxShadow: "0 24px 60px rgba(11,8,5,0.5)", position: "relative", border: `1px solid ${T.paperDeep}` }}>
            <button onClick={() => setOpenRare(null)} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 999, background: T.paperHi, border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={16} /></button>
            <Eyebrow color={T.muted} mb={10}>A rare bloom</Eyebrow>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Bloom form={FORM_LIST.find((f) => f.key === openRare.form) || FORM_LIST[0]} stageIdx={4} color={T.gold} accent={companion.accent} resting={false} bright={false} rare={openRare.rare} size={150} />
            </div>
            <Script size={32} color={T.ink} style={{ marginTop: 10, lineHeight: 1.1 }}>{openRare.title}</Script>
            <div style={{ marginTop: 14, fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.55 }}>{openRare.line}</div>
            <div style={{ marginTop: 14, fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3 }}>Grown through living — not a score. Kept in your garden.</div>
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
const STEM = "#73855F", STEM_HI = "#8FAF8F", LEAF = "#86A479", LEAF_DK = "#6E8A63", SOIL = "#8A7A63";

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

export function Bloom({ form, stageIdx, color, accent, resting, bright, size = 190, rare = null }) {
  const open = Math.min(1, Math.max(0, stageIdx / 4));   // 0 → 1 across the five stages
  const seed = stageIdx === 0;
  const op = resting ? 0.5 : (bright ? 1 : 0.92);
  const tall = form.key === "foxglove";
  const headY = seed ? 70 : (tall ? 60 - open * 16 : 74 - open * 38);   // flower head rises as it grows
  const cx = 50;
  const light = lighten(color, 0.4), deep = color;
  // RARE / MILESTONE treatment — a tasteful gold halo (collection, not a badge). No emoji.
  const GOLD = "#A8893F";
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
        {/* RARE — a gold halo ring + a quiet scatter of radiating points (gilded / haloed /
            inked variants differ only in weight). Tasteful, brand gold, no emoji, no "badge". */}
        {rare && (() => {
          const rr = 30 + open * 8;
          const ringW = rare === "gilded" ? 1.8 : rare === "inked" ? 1.0 : 1.4;
          const dash = rare === "haloed" ? "1.4 4.2" : (rare === "inked" ? "0.6 3" : "none");
          return (
            <g opacity={resting ? 0.4 : 0.85}>
              <circle cx={cx} cy={headY} r={rr} fill="none" stroke={GOLD} strokeWidth={ringW} strokeDasharray={dash} opacity="0.7" />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30) * Math.PI / 180; const ro = rr + 3.4;
                return <circle key={i} cx={cx + Math.cos(a) * ro} cy={headY + Math.sin(a) * ro} r={i % 3 === 0 ? 1 : 0.6} fill={GOLD} opacity={0.8} />;
              })}
            </g>
          );
        })()}
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
              const R = 8 + open * 10;
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

            {/* ───────── DAISY — fine rays (pale phase tint, so the phase reads) + accent disc ───────── */}
            {form.key === "daisy" && (() => {
              const n = 16, L = 8 + open * 13, W = 1.8 + open * 1.7;
              const ray = lighten(color, 0.5);                 // pale, but carries the phase hue
              return <g>
                {Array.from({ length: n }).map((_, i) => { const ang = i * (360 / n);
                  return petal(cx, headY, L, W, ang, ray, op, i); })}
                {Array.from({ length: n }).map((_, i) => { const ang = i * (360 / n) + 360 / (n * 2);
                  return petal(cx, headY, L * 0.62, W * 0.85, ang, lighten(color, 0.68), op * 0.9, `b${i}`); })}
                <circle cx={cx} cy={headY} r={3.4 + open * 3.4} fill={accent} />
                <circle cx={cx} cy={headY} r={1.6 + open * 1.6} fill={deep} opacity="0.5" />
              </g>;
            })()}

            {/* ───────── FOXGLOVE — full spire of speckled tubular bells ───────── */}
            {form.key === "foxglove" && (() => {
              const bells = 3 + Math.round(open * 4);          // up to 7 — a fuller spike
              const top = headY - 4;
              return <g>
                <path d={`M50 88 C 49 72 51 ${top + 12} 50 ${top - 2}`} stroke={STEM} strokeWidth="2.6" fill="none" strokeLinecap="round" />
                {leaf1 && <path d="M50 76 C 39 73 33 76 31 83 C 40 84 48 81 50 75 Z" fill={LEAF} opacity="0.92" />}
                {leaf2 && <path d="M50 70 C 60 67 66 70 68 76 C 59 77 52 74 50 69 Z" fill={LEAF_DK} opacity="0.85" />}
                {/* bells hang along the stalk, larger and lower, smaller toward the tip */}
                {Array.from({ length: bells }).map((_, i) => {
                  const y = top + 6 + i * (5 + open * 1.2); const sx = cx + (i % 2 ? 6.5 : -6.5);
                  const w = 4.5 + open * 2.6 + i * 0.6, h = 6.5 + open * 3.5;
                  return <g key={i}>
                    <path d={`M${sx} ${y - h} C ${sx - w} ${y - h} ${sx - w} ${y} ${sx - w * 0.6} ${y + 2} C ${sx} ${y + 4} ${sx + w * 0.6} ${y + 4} ${sx + w * 0.6} ${y + 2} C ${sx + w} ${y} ${sx + w} ${y - h} ${sx} ${y - h} Z`} fill={`url(#pet-${gid})`} opacity={op} />
                    <path d={`M${sx - w * 0.5} ${y - 1} C ${sx} ${y + 1.5} ${sx + w * 0.5} ${y + 1.5} ${sx + w * 0.5} ${y - 1}`} fill={lighten(color, 0.45)} opacity={op * 0.7} />
                    <circle cx={sx - 1.3} cy={y - h * 0.4} r="0.8" fill={accent} opacity={op} />
                    <circle cx={sx + 1.1} cy={y - h * 0.25} r="0.8" fill={accent} opacity={op} />
                    <circle cx={sx} cy={y - h * 0.6} r="0.7" fill={accent} opacity={op * 0.8} />
                  </g>;
                })}
                {/* unopened buds clustered at the tip */}
                <ellipse cx={cx - 2} cy={top} rx="2" ry="3" fill={deep} opacity={op * 0.9} />
                <ellipse cx={cx + 2} cy={top - 2} rx="1.8" ry="2.6" fill={lighten(color, 0.3)} opacity={op * 0.9} />
                <ellipse cx={cx} cy={top - 4} rx="1.5" ry="2.2" fill={lighten(color, 0.5)} opacity={op * 0.85} />
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
              const L = 10 + open * 13, W = 8 + open * 6.5;
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
