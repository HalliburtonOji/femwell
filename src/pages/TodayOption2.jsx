// TodayOption2 — "Your day, one card at a time" — the second Today direction for Halli to compare
// against the live /Today (TodayDemo6). PREVIEW route only (reachable via IDEAS → Brand & UX →
// Previews). The LIVE /Today is untouched. Conforms to claude-state/BRAND_IDENTITY.md.
//
// THE IDEA (Halli's brief): a SINGLE horizontal sliding row of cards — like the JOURNAL page's
// slider, the SAME card size as Journal — with ONE card per APP SECTION (Lifestyle · Schedule ·
// Nutrition · Community · Health · Journal · Programs · Pulse · Garden). Each card is ENGAGING and
// SMART (never an empty open area): it shows a DAILY-CHANGING smart suggestion for that section,
// driven by REAL signals (cycle phase · new content · today's schedule · what you've logged), with
// an INLINE action right on the card (play audio inline · quick-log water · check off · answer the
// room · leave a line · note a symptom · tend your companion). Any link-out is a SPECIFIC deep-link
// to the exact item full-screen (a book opens straight in the reader), never the parent page.
//
// SLIDER GEOMETRY — NOT re-derived. The track constants (CARD_W 365 · GAP 14 · COL 430), the
// segmented label rail and the ‹ • • › nav are lifted VERBATIM from src/pages/JournalHub.jsx so the
// card size + swipe feel ARE the Journal slider's. The segmented label rail doubles as the page's
// central "jump to any section" switcher (the multi-layer-page UX rule).
//
// WIRED TO REAL DATA (every read guarded + fail-open — nothing awaited on a render path can wedge
// the page): cycle phase/day (computeCycleDay), today's meals + water (nutritionToday), journal
// recency, today's symptoms, the real companion bloom, and the real content surfaces (DailyStory,
// LifestyleItems incl. a real PODCAST for inline play, BookClubPick, Echo, DailyPlan/PlannerItems,
// WeeklyInsights, HoroscopeReading, UserPrograms). Graceful empties everywhere; the day-rotation
// degrades to whatever signal IS present so a card is never empty or boring.
//
// "PREVIEW A DIFFERENT DAY" — a small demo-only control in the masthead bumps the day-seed so Halli
// can see each section's rotation (moon → podcast w/ inline play → book → …) without waiting a day.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { nutritionToday } from "@/utils/nutritionSummary";
import { communityHash } from "@/components/community/communityAnon";
import { computeCooling } from "@/components/journal/echo/echoSafety";
import {
  RichBloomV2, floraKeyframes, CardCorner, VineMotifV2,
  FlowerGlyph, cwOf, lighten,
} from "@/components/brand/flora";
import { qotdForDay } from "@/components/community/communityConfig";
import { FORM_LIST, getCompanion, tendCompanion, tendedToday, loadCompanionState } from "@/components/nurture/companion";
import { useScrollLock } from "@/utils/useScrollLock";
import {
  PenLine, Salad, Users, Stethoscope, Sparkles, BookOpen, Feather, Headphones, Star, CalendarDays,
  Activity, Sprout, TrendingUp, Leaf, Moon, Droplet, Coffee, Check, Plus, Minus, ChevronRight,
  ChevronLeft, Sun, Sunrise, Sunset, X, Send, Search, Clock, Camera, Mic, ScanLine, Play, Pause,
  Shuffle,
} from "lucide-react";

// ── slider geometry — lifted verbatim from JournalHub.jsx (do not re-derive) ───────────────────────
const COL = 430;     // phone column
const CARD_W = 365;  // ~85vw — the next card still peeks at the right edge
const GAP = 14;

const PEONY = FORM_LIST.find((f) => f.key === "peony") || { key: "peony", fern: false };
const SEASON = { menstrual: "Inner Winter", follicular: "Inner Spring", ovulatory: "Inner Summer", luteal: "Inner Autumn" };

// guard every awaited read so a slow/wedged backend can never wedge the page (the hang trap).
const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
// a stable per-day integer (days since epoch, local) — drives the daily rotation.
function dayNumber() { try { return Math.floor(new Date(todayKey() + "T00:00:00").getTime() / 86400000); } catch { return 0; } }
const clip = (s, n) => (s && s.length > n ? s.slice(0, n).trim() + "…" : s || "");

// ── a little moon, drawn to the date's real illumination (the Lifestyle "your moon" suggestion) ─────
function moonInfo(dayNum) {
  // synodic month ≈ 29.53059 days; reference new moon 2000-01-06 (JD epoch day 10962).
  const frac = (((dayNum - 10962) % 29.53059) + 29.53059) % 29.53059 / 29.53059; // 0=new … 0.5=full
  const names = [
    [0.03, "New moon", "a quiet day to set a small intention"],
    [0.22, "Waxing crescent", "a day for beginning something gently"],
    [0.28, "First quarter", "a day to push a little, then rest"],
    [0.47, "Waxing gibbous", "a day to finish things, softly"],
    [0.53, "Full moon", "a day to feel it all — and let some go"],
    [0.72, "Waning gibbous", "a day to share what you've gathered"],
    [0.78, "Last quarter", "a day to release, not to start"],
    [0.97, "Waning crescent", "a day to rest and tend the roots"],
    [1.01, "New moon", "a quiet day to set a small intention"],
  ];
  const m = names.find(([t]) => frac <= t) || names[names.length - 1];
  return { frac, name: m[1], line: m[2] };
}
function MoonGlyph({ frac = 0.5, size = 92 }) {
  // illuminated disc with a shadow disc offset by the phase — waxing lights the right, waning the left.
  const r = size / 2;
  const lit = "#F0E6C8", shadow = "#2A2A38";
  const offset = (frac < 0.5 ? 1 : -1) * (1 - Math.abs(frac - 0.5) / 0.5) * r * 1.05;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <radialGradient id="moonlit" cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#FFF8E6" /><stop offset="100%" stopColor={lit} />
        </radialGradient>
        <clipPath id="moonclip"><circle cx={r} cy={r} r={r - 2} /></clipPath>
      </defs>
      <circle cx={r} cy={r} r={r - 2} fill="url(#moonlit)" />
      <g clipPath="url(#moonclip)"><circle cx={r + offset} cy={r} r={r - 2} fill={shadow} opacity={0.92} /></g>
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke="#A8893F" strokeOpacity="0.45" strokeWidth="1.4" />
      {/* a couple of faint craters on the lit side */}
      <circle cx={r * 0.72} cy={r * 0.78} r={r * 0.1} fill="#E2D4A8" opacity="0.5" />
      <circle cx={r * 0.95} cy={r * 0.5} r={r * 0.06} fill="#E2D4A8" opacity="0.45" />
    </svg>
  );
}

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);

// the framed look — the §4.2 corner element in all four corners (matches the Journal hub cards).
function Frame4({ variant = "sprig", color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });

// ════════════════════════════════════════════════════════════════════════════════════════════════
export default function TodayOption2() {
  useEditorialFonts();
  const [tod] = useState(() => { try { const h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : "evening"; } catch { return "afternoon"; } });

  // demo-only: bump the day-seed to preview the rotation (real app uses dayNumber() only).
  const [seedBump, setSeedBump] = useState(0);
  const daySeed = dayNumber() + seedBump;

  // ── real data (all guarded, fail-open) ─────────────────────────────────────────────────────────
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nut, setNut] = useState(null);
  const [journal, setJournal] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  // inline-action UI state, keyed by section
  const [sheet, setSheet] = useState(null);      // bottom-sheet (meal only) → { key }
  const [justTended, setJustTended] = useState(false);
  const tendedCountRef = useRef(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null;
      if (!alive) return;
      setUid(id);
      if (!id) { setLoading(false); return; }
      loadCompanionState(id).catch(() => {});
      try { setCompanion(getCompanion(id)); } catch { /* ignore */ }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      const prof = (profs || []).filter(Boolean)[0] || null;
      if (!alive) return;
      setProfile(prof);
      setLoading(false);
      const todayISO = todayKey();
      nutritionToday(id, prof).then((n) => { if (alive) setNut(n); }).catch(() => {});
      withTimeout(base44.entities.JournalEntries.filter({ user_id: id }, "-created_date", 80)).then((rows) => {
        if (!alive) return;
        const arr = (rows || []).filter(Boolean); const last = arr[0];
        const lastDate = last ? (last.session_date || (last.created_date ? String(last.created_date).slice(0, 10) : null)) : null;
        const lastDays = lastDate ? Math.max(0, Math.round((new Date(todayKey()) - new Date(lastDate)) / 86400000)) : null;
        setJournal({ count: arr.length, lastDays, lastText: last?.text || "" });
      }).catch(() => {});
      withTimeout(base44.entities.DailyStory.filter({ is_active: true }, "-published_date", 20)).then((rows) => {
        if (!alive) return; const arr = (rows || []).filter(Boolean);
        const s = arr.find((r) => !r.published_date || String(r.published_date).slice(0, 10) <= todayISO) || arr[0];
        if (s) setContent((c) => ({ ...c, story: s }));
      }).catch(() => {});
      withTimeout(base44.entities.LifestyleItems.filter({}, "-published_at", 14)).then((rows) => {
        const arr = (rows || []).filter((r) => r && r.title);
        if (alive && arr.length) setContent((c) => ({ ...c, foryou: arr }));
      }).catch(() => {});
      withTimeout(base44.entities.LifestyleItems.filter({ media_type: "PODCAST", status: "PUBLISHED" }, "-published_at", 8)).then((rows) => {
        const a = (rows || []).filter((r) => r && r.title)[0]; if (alive && a) setContent((c) => ({ ...c, listen: a }));
      }).catch(() => {});
      withTimeout(base44.entities.BookClubPick.filter({ active: true }, "-created_date", 1)).then((rows) => {
        const b = (rows || []).filter(Boolean)[0]; if (alive && b) setContent((c) => ({ ...c, book: b }));
      }).catch(() => {});
      withTimeout(base44.entities.Echo.filter({}, "-created_date", 8)).then((rows) => {
        const e = (rows || []).filter((r) => r && r.body)[0]; if (alive && e) setContent((c) => ({ ...c, echo: e }));
      }).catch(() => {});
      withTimeout(base44.entities.DailyPlan.filter({ user_id: id, day_key: todayISO }, null, 1)).then((rows) => {
        const p = (rows || []).filter(Boolean)[0]; if (alive && p) setContent((c) => ({ ...c, plan: p }));
      }).catch(() => {});
      withTimeout(base44.entities.PlannerItems.filter({ user_id: id, date: todayISO }, "-created_date", 12)).then((rows) => {
        const arr = (rows || []).filter((r) => r && r.title); if (alive && arr.length) setContent((c) => ({ ...c, planItems: arr }));
      }).catch(() => {});
      withTimeout(base44.entities.WeeklyInsights.filter({ user_id: id }, "-week_start", 1)).then((rows) => {
        const w = (rows || []).filter(Boolean)[0]; if (alive && w) setContent((c) => ({ ...c, weekly: w }));
      }).catch(() => {});
      withTimeout(base44.entities.HoroscopeReading.filter({ user_id: id, reading_date: todayISO }, "-created_date", 1)).then((rows) => {
        const h = (rows || []).filter(Boolean)[0]; if (alive && h) setContent((c) => ({ ...c, horoscope: h }));
      }).catch(() => {});
      withTimeout(base44.entities.UserPrograms.filter({ user_id: id }, "-last_activity_date", 8)).then(async (rows) => {
        const arr = (rows || []).filter(Boolean);
        const up = arr.find((r) => r.status && r.status !== "completed") || arr[0];
        if (!alive || !up) return;
        let prog = null;
        if (up.program_key) { const pr = await withTimeout(base44.entities.Programs.filter({ program_key: up.program_key }, null, 1)).catch(() => null); prog = (pr || []).filter(Boolean)[0] || null; }
        if (alive) setContent((c) => ({ ...c, program: { up, prog } }));
      }).catch(() => {});
    })();
    return () => { alive = false; };
  }, []);

  // ── derived ─────────────────────────────────────────────────────────────────────────────────────
  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const phase = cycle.phase;
  const phaseColor = PHASE_COLORS[phase] || T.sage;
  const season = SEASON[phase] || "your season";
  const name = useMemo(() => profileName(profile, null), [profile]);
  const cName = companion?.name || "your companion";
  const cForm = useMemo(() => FORM_LIST.find((f) => f.key === (companion?.form?.key || companion?.form)) || PEONY, [companion]);
  const cAccent = companion?.accent || T.blush;

  const tendGarden = (note) => {
    tendedCountRef.current += 1; setJustTended(true); setTimeout(() => setJustTended(false), 2000);
    try { if (uid) tendCompanion(uid, note || "Tended from Today"); } catch { /* ignore */ }
  };

  // ── THE SUGGESTION ENGINE — one card per section; the day-seed rotates among the modes that have
  //    real signal, so the card changes day to day but is never empty/boring. ──────────────────────
  const phaseWord = PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : "";
  const qotd = qotdForDay(todayKey());
  const moon = moonInfo(daySeed);

  const PHASE_PROMPT = {
    menstrual: "What would feel like rest today?",
    follicular: "What's one small thing you'd like to begin?",
    ovulatory: "Who do you want to reach out to today?",
    luteal: "What boundary would protect your evening?",
  };
  const PHASE_NUDGE = {
    menstrual: "Warmth, iron and quiet suit today — be soft with yourself.",
    follicular: "Energy's returning — a good day to begin something small.",
    ovulatory: "You're at your most outward — say the thing, send the message.",
    luteal: "Boundaries feel natural now — protect your evening.",
  };

  // helper: pick a mode for a section from its candidate list using the day-seed + a per-section offset.
  const pick = (candidates, offset) => {
    const list = candidates.filter(Boolean);
    if (!list.length) return null;
    return list[((daySeed + offset) % list.length + list.length) % list.length];
  };

  // resolve a playable audio url from a real podcast item (best-effort; inline <audio> falls back gracefully).
  const listen = content.listen;
  const audioUrl = listen ? (listen.audio_url || listen.audio_file_url || listen.episode_url || listen.media_url || listen.content_url || null) : null;

  const bookHref = content.book?.gutenberg_id ? `/BookReader?gutenberg_id=${content.book.gutenberg_id}` : "/BookReader?gutenberg_id=514";
  const foryouItem = (content.foryou || [])[0];
  const foryouHref = foryouItem?.id ? `/LifestyleDetail?id=${foryouItem.id}` : "/Lifestyle";

  const prog = content.program;
  const weekly = content.weekly;
  const pulseLine = weekly?.structured_summary?.your_pattern || weekly?.insight_text || null;
  const planItems = content.planItems || [];
  const planFocus = content.plan?.focus_for_today || null;

  // each entry → a fully-formed card. The `pick(...)` rotates the mode by the day. ALWAYS a fallback.
  const CARDS = [
    // 1 ── LIFESTYLE — the showcase: moon · podcast (inline play) · book (deep-link reader) · story · for-you pick
    (() => {
      const accent = T.gold;
      const modes = [
        { // moon
          tag: "Your moon", hook: `Tonight: ${moon.name.toLowerCase()}`, line: `${moon.line}. Your sky, read against where you are.`,
          visual: <MoonGlyph frac={moon.frac} size={96} />, flower: "violet",
          action: { type: "deeplink", Icon: Star, label: "Read your sky", href: "/Lifestyle?tab=horoscope" },
        },
        listen && { // podcast — INLINE PLAY
          tag: "Listen", hook: clip(listen.title, 52), line: listen.source_name ? `${listen.source_name} · play it right here` : "A new episode — play it right here, no leaving the page.",
          flower: "bluebell",
          action: { type: "audio", url: audioUrl, title: listen.title, href: "/Lifestyle?tab=listen", Icon: Headphones },
        },
        content.book && { // book — DEEP-LINK straight into the reader, full screen
          tag: "Book of the day", hook: clip(content.book.title, 48), line: content.book.author ? `${content.book.author} — opens straight in the reader, full screen.` : "Opens straight in the reader, full screen.",
          flower: "rose",
          action: { type: "deeplink", Icon: BookOpen, label: "Open in the reader", href: bookHref },
        },
        content.story && { // daily story
          tag: "Daily story", hook: clip(content.story.series_title || "Today's chapter", 44), line: content.story.segment_text ? clip(content.story.segment_text, 80) : "A short instalment, released daily.",
          flower: "poppy",
          action: { type: "deeplink", Icon: Feather, label: "Read today's chapter", href: "/Lifestyle?tab=daily_story" },
        },
        foryouItem && { // for-you pick
          tag: "For you", hook: clip(foryouItem.title, 50), line: `Gathered for you${phaseWord ? `, tuned to your ${phaseWord} phase` : ""}.`,
          flower: "primrose",
          action: { type: "deeplink", Icon: Sparkles, label: "Open this", href: foryouHref },
        },
      ];
      const m = pick(modes, 0) || modes[0];
      return { key: "lifestyle", section: "Lifestyle", accent, Icon: Sparkles, open: { href: "/Lifestyle", label: "Open Lifestyle" }, ...m };
    })(),

    // 2 ── SCHEDULE / PLANNER — first thing today (inline check-off) · focus · open plan
    (() => {
      const accent = "#8E6E8E";
      const first = planItems.find((it) => !it.is_completed) || planItems[0];
      const modes = [
        first && {
          tag: "Schedule", hook: "First up today", line: clip(first.title, 64) + (first.time ? ` · ${first.time}` : ""),
          flower: "iris",
          action: { type: "check", Icon: Check, label: "Mark it done", note: `Planner: ${clip(first.title, 40)}`, doneLabel: "Done — nicely paced." },
        },
        planFocus && {
          tag: "Today's focus", hook: clip(planFocus, 54), line: "Keep it kind — you don't need all of it.",
          flower: "iris",
          action: { type: "deeplink", Icon: CalendarDays, label: "Open today's plan", href: "/Planner" },
        },
        { // always-on fallback
          tag: "Schedule", hook: "Your day, open and unplanned", line: "Nothing scheduled yet — add today's first thing, or let it stay soft.",
          flower: "iris",
          action: { type: "deeplink", Icon: CalendarDays, label: "Plan your day", href: "/Planner" },
        },
      ];
      const m = pick(modes, 1) || modes[modes.length - 1];
      return { key: "planner", section: "Schedule", accent, Icon: CalendarDays, open: { href: "/Planner", label: "Open Planner" }, ...m };
    })(),

    // 3 ── NUTRITION — water gap (inline stepper) · log breakfast (sheet) · iron nudge
    (() => {
      const accent = T.sage;
      const glasses = Math.round((nut?.hydrationMl || 0) / 250);
      const modes = [
        (nut?.hasData && glasses < 6) && {
          tag: "Nutrition", hook: `${glasses} of 6 glasses so far`, line: "A little more water would round out today — add one right here.",
          flower: "sunflower",
          action: { type: "water", Icon: Droplet, label: "+ a glass", startGlasses: glasses },
        },
        (!nut?.hasData) && {
          tag: "Nutrition", hook: "Nothing logged yet today", line: "A warm, iron-friendly breakfast would be a kind start.",
          flower: "sunflower",
          action: { type: "sheet", sheet: "meal", Icon: Coffee, label: "Log breakfast" },
        },
        {
          tag: "Nutrition", hook: "A few seeds would lift today's iron", line: `${PHASE_NUDGE[phase] || "A 10-minute recipe is waiting."}`,
          flower: "sunflower",
          action: { type: "sheet", sheet: "meal", Icon: Salad, label: "Log a meal" },
        },
      ];
      const m = pick(modes, 2) || modes[modes.length - 1];
      return { key: "nutrition", section: "Nutrition", accent, Icon: Salad, open: { href: "/Nutrition", label: "Open Nutrition" }, ...m };
    })(),

    // 4 ── COMMUNITY — QOTD (inline answer) · an echo, fading (inline post)
    (() => {
      const accent = T.crimson;
      const modes = [
        {
          tag: "Community · today's question", hook: clip(qotd.text, 70), line: "Answer the room — anonymous, 18+, everyone's in it.",
          flower: "cornflower", inset: content.echo?.body ? { eyebrow: "An echo, fading", quote: clip(content.echo.body, 80) } : null,
          action: { type: "compose", kind: "qotd", Icon: Users, label: "Post anonymously", placeholder: "Answer the room…", doneLabel: "Shared with the room. Thank you." },
        },
        {
          tag: "Community", hook: "Leave an echo", line: "A line, left anonymously, that quietly fades. Someone always needs to read it.",
          flower: "cornflower",
          action: { type: "compose", kind: "echo", Icon: Heart, label: "Release it", placeholder: "A line, left anonymously…", doneLabel: "Released. It's held." },
        },
      ];
      const m = pick(modes, 3) || modes[0];
      return { key: "community", section: "Community", accent, Icon: Users, open: { href: "/Community", label: "Open Community" }, ...m };
    })(),

    // 5 ── HEALTH / CYCLE — note a symptom (inline chips) · phase letter · phase nudge
    (() => {
      const accent = phaseColor;
      const modes = [
        {
          tag: "Cycle & symptoms", hook: hasCycle ? `${PHASE_LABEL[phase]} · day ${cycle.cycleDay}` : "How's your body today?",
          line: hasCycle ? "Note anything your body's saying — it keeps your patterns honest." : "Tell me where you are in your cycle and I'll shape your day.",
          flower: "dahlia",
          action: { type: "chips", Icon: Stethoscope, label: "Save the note", chips: ["Cramps", "Low mood", "Tired", "Headache", "Tender", "Bloated", "Calm"], doneLabel: "Noted, gently." },
        },
        {
          tag: "Health letters", hook: hasCycle ? `Your ${phaseWord} letter` : "Your Health letters",
          line: `${PHASE_NUDGE[phase] || "Gentle, phase-aware steps, written for you."}`,
          flower: "dahlia",
          action: { type: "deeplink", Icon: BookOpen, label: "Read your letter", href: "/Health" },
        },
      ];
      const m = pick(modes, 4) || modes[0];
      return { key: "health", section: "Health", accent, Icon: Stethoscope, open: { href: "/Health", label: "Open Health" }, ...m };
    })(),

    // 6 ── JOURNAL — a prompt (inline line) · on this day
    (() => {
      const accent = T.gold;
      const jd = journal?.lastDays;
      const modes = [
        {
          tag: "Journal", hook: PHASE_PROMPT[phase] || "What would feel like enough today?",
          line: jd != null && jd >= 2 ? `It's been ${jd} days since you wrote — a line is plenty.` : "A line is plenty. Leave it right here.",
          flower: "camellia",
          action: { type: "compose", kind: "line", Icon: PenLine, label: "Keep it", placeholder: "A line is plenty…", doneLabel: "Kept. Your companion felt that." },
        },
        (journal?.lastText) && {
          tag: "Journal · on this day", hook: "What you wrote before", line: clip(journal.lastText, 84),
          flower: "camellia", inset: { eyebrow: "Your last line", quote: clip(journal.lastText, 80) },
          action: { type: "deeplink", Icon: Feather, label: "Open your journal", href: "/Journal" },
        },
      ];
      const m = pick(modes, 5) || modes[0];
      return { key: "journal", section: "Journal", accent, Icon: PenLine, open: { href: "/Journal", label: "Open Journal" }, ...m };
    })(),

    // 7 ── PROGRAMS — tonight's practice (inline begin) · continue programme
    (() => {
      const accent = "#8FAF8F";
      const modes = [
        {
          tag: "Programs · tonight", hook: "A 10-minute body-scan", line: "Short and soft — begin it right here when you're ready.",
          flower: "lavender",
          action: { type: "check", Icon: Moon, label: "Begin", note: "Tonight's practice · body-scan", doneLabel: "Begun. Rest is part of it." },
        },
        prog && {
          tag: "Programs", hook: clip(prog.prog?.title || "Your programme", 40),
          line: prog.prog?.duration_days ? `Day ${prog.up?.current_day || 1} of ${prog.prog.duration_days} — keep the rhythm.` : `Day ${prog.up?.current_day || 1} — keep the rhythm.`,
          flower: "lavender",
          action: { type: "deeplink", Icon: Activity, label: "Continue programme", href: "/ProgramsHub" },
        },
      ];
      const m = pick(modes, 6) || modes[0];
      return { key: "programs", section: "Programs", accent, Icon: Activity, open: { href: "/ProgramsHub", label: "Open Programs" }, ...m };
    })(),

    // 8 ── PULSE — this week's pattern · patterns build with time
    (() => {
      const accent = "#8E6E8E";
      const modes = [
        pulseLine && {
          tag: "Pulse · this week", hook: "Your week, gently read", line: clip(pulseLine, 92),
          flower: "dahlia", inset: weekly?.top_symptoms?.length ? { eyebrow: "This week's signals", quote: weekly.top_symptoms.slice(0, 3).join(" · ") } : null,
          action: { type: "deeplink", Icon: TrendingUp, label: "See the full shape", href: "/Pulse" },
        },
        {
          tag: "Pulse", hook: "Patterns build with time", line: "Log a few days and your weekly patterns surface here — never scores, just shape.",
          flower: "dahlia",
          action: { type: "deeplink", Icon: TrendingUp, label: "See your patterns", href: "/Pulse" },
        },
      ];
      const m = pick(modes, 7) || modes[modes.length - 1];
      return { key: "pulse", section: "Pulse", accent, Icon: TrendingUp, open: { href: "/Pulse", label: "Open Pulse" }, ...m };
    })(),

    // 9 ── GARDEN / COMPANION — her real bloom + inline tend
    (() => {
      const accent = T.sage;
      return {
        key: "garden", section: "Companion", accent, Icon: Sprout, open: { href: "/Garden", label: "Open your garden" },
        tag: "Your garden", hook: cName,
        line: tendedToday(uid) ? "Blooming — you tended her today." : "Blooming — she grows from everything you already do.",
        bloom: { form: cForm?.key || "peony", color: cAccent }, flower: "rose",
        action: { type: "check", Icon: Feather, label: "Tend her", note: "Tended from Today", doneLabel: `${cName} felt that — a little more open.` },
      };
    })(),
  ];

  // ── slider state (Journal mechanism) ─────────────────────────────────────────────────────────────
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = CARDS.length - 1;
  useEffect(() => {
    const el = trackRef.current; if (!el) return; let t;
    const onScroll = () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(el.scrollLeft / (CARD_W + GAP)); setActive(Math.max(0, Math.min(last, i))); }, 80); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last, loading]);
  const goTo = (i) => { const idx = Math.max(0, Math.min(last, i)); setActive(idx); trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" }); };

  const TODS = { morning: { Icon: Sunrise, label: "Morning" }, afternoon: { Icon: Sun, label: "Afternoon" }, evening: { Icon: Sunset, label: "Evening" } };
  const TodIcon = TODS[tod].Icon;
  const greeting = tod === "morning" ? "Good morning" : tod === "afternoon" ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.t2-track{scrollbar-width:none}.t2-track::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>
      {/* botanical page texture — one low-opacity vine per fold, clipped, behind content */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 120, right: -24 }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 760, left: -28 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.08} w={140} flip /></div>
      </div>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* ── masthead — calm: date · greeting (carved heart) · phase chip ─────────────────────────── */}
        <header style={{ padding: "20px 18px 2px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <TodIcon size={14} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>{TODS[tod].label} · {longDate()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
            <FlowerGlyph variant="camellia" size={24} color={cwOf("blush").petal} color2={cwOf("blush").tip} idx="hf-l" />
            <Heart size={17} />
            <Script size={42} color={T.ink}>{greeting}{name ? `, ${name}` : ""}</Script>
            <FlowerGlyph variant="rose" size={24} color={cwOf("plum").petal} color2={cwOf("plum").tip} idx="hf-r" />
          </div>
          {hasCycle ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: phaseColor, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>Day {cycle.cycleDay} · {PHASE_LABEL[phase]}</span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>{season}</span>
            </div>
          ) : (
            <a href="/Health" style={{ display: "inline-block", marginTop: 8, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 13px" }}>Tell me where you are in your cycle</a>
          )}
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 11, lineHeight: 1.5 }}>
            Each part of your app, one smart card. Swipe through — every card has something kind to do, right here.
          </Hand>
        </header>

        {/* ── the segmented "jump to any section" rail (doubles as the central switcher) ────────────── */}
        <div className="t2-track" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "14px 18px 12px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c, i) => (
            <button key={c.key} onClick={() => goTo(i)} style={{
              flex: "none", background: i === active ? c.accent : "transparent", color: i === active ? T.paper : T.muted,
              border: `1px solid ${i === active ? c.accent : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}><c.Icon size={13} /> {c.section}</button>
          ))}
        </div>

        {/* ── the single horizontal slider (Journal geometry: CARD_W 365 · GAP 14 · peek + nav) ─────── */}
        <div ref={trackRef} className="t2-track" style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c) => (
            <TodayCard key={c.key} card={c} uid={uid} cycle={cycle} onSheet={setSheet} onTend={tendGarden} />
          ))}
          <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
        </div>

        {/* prev / dots / next (Journal nav) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
          <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous section" style={navBtn(active === 0)}><ChevronLeft size={18} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {CARDS.map((c, i) => (
              <button key={c.key} onClick={() => goTo(i)} aria-label={c.section} style={{
                width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                background: i === active ? c.accent : T.paperDeep, cursor: "pointer", transition: "width .2s",
              }} />
            ))}
          </div>
          <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next section" style={navBtn(active === last)}><ChevronRight size={18} /></button>
        </div>

        {/* ── demo-only: preview a different day (real app rotates on the calendar day only) ────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18 }}>
          <button onClick={() => setSeedBump((s) => s + 1)} style={{
            display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: `1px solid ${T.paperDeep}`,
            borderRadius: 999, padding: "8px 15px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, cursor: "pointer",
          }}><Shuffle size={14} /> Preview a different day</button>
        </div>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, textAlign: "center", margin: "8px 18px 0", lineHeight: 1.5 }}>
          Demo control — in the real app each card's suggestion changes on its own, day to day, driven by your cycle, your schedule and new content.
        </p>

        {justTended && (
          <div className="fw-fade" style={{ position: "fixed", left: "50%", bottom: 96, transform: "translateX(-50%)", zIndex: 400, display: "inline-flex", alignItems: "center", gap: 7, background: T.sage, color: "#fff", borderRadius: 999, padding: "9px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, animation: "fwFadeUp .3s ease both" }}>
            <Leaf size={14} /> {cName} felt that
          </div>
        )}
      </div>

      {sheet && <MealSheet uid={uid} cycle={cycle} onClose={() => setSheet(null)} onSaved={() => tendGarden("Logged a meal from Today")} />}
    </div>
  );
}

// ── the section card — the Journal hub-card visual language + a per-mode INLINE action ──────────────
function TodayCard({ card, uid, cycle, onSheet, onTend }) {
  const a = card.accent;
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W,
      position: "relative", overflow: "hidden",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${a}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${a}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 488,
      boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
    }}>
      <Frame4 variant="sprig" color={a} size={46} opacity={0.6} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* header — icon disc · section eyebrow · meaning-bloom */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          {ICON_DISC(card.Icon, a)}
          <Eyebrow color={a}>{card.tag || card.section}</Eyebrow>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={card.flower || "camellia"} size={30} color={a} idx={`mb-${card.key}`} /></span>
        </div>

        {/* a card can carry its own visual — the moon, or the companion's real bloom */}
        {card.visual && <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 10px" }}>{card.visual}</div>}
        {card.bloom && (
          <div style={{ display: "flex", justifyContent: "center", margin: "0 0 6px" }}>
            <RichBloomV2 form={card.bloom.form} color={card.bloom.color} color2={lighten(card.bloom.color, 0.34)} accent={T.gold} size={104} animate soft idx={`sb-${card.key}`} />
          </div>
        )}

        {/* the hook + the line */}
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...CLAMP(3) }}>{card.hook}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(4) }}>{card.line}</p>

        {card.inset && (
          <div style={{ marginBottom: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px" }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: a, marginBottom: 3 }}>{card.inset.eyebrow}</div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: 0, lineHeight: 1.4, ...CLAMP(2) }}>“{card.inset.quote}”</p>
          </div>
        )}

        {/* INLINE ACTION — pushed to the bottom of the card */}
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          <InlineAction action={card.action} accent={a} uid={uid} cycle={cycle} onSheet={onSheet} onTend={onTend} />
          <a href={card.open.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
            {card.open.label} <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── the inline actions ──────────────────────────────────────────────────────────────────────────
function btnStyle(accent, disabled) {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, textDecoration: "none" };
}

function InlineAction({ action, accent, uid, cycle, onSheet, onTend }) {
  const { type } = action || {};
  if (type === "deeplink") {
    const A = action.Icon || ChevronRight;
    return <a href={action.href} style={btnStyle(accent)}><A size={15} /> {action.label}</a>;
  }
  if (type === "sheet") {
    const A = action.Icon || Plus;
    return <button onClick={() => onSheet({ key: action.sheet })} style={btnStyle(accent)}><A size={15} /> {action.label}</button>;
  }
  if (type === "audio") return <AudioAction action={action} accent={accent} />;
  if (type === "water") return <WaterAction action={action} accent={accent} uid={uid} />;
  if (type === "check") return <CheckAction action={action} accent={accent} uid={uid} onTend={onTend} />;
  if (type === "compose") return <ComposeAction action={action} accent={accent} uid={uid} cycle={cycle} onTend={onTend} />;
  if (type === "chips") return <ChipsAction action={action} accent={accent} uid={uid} onTend={onTend} />;
  return null;
}

// INLINE AUDIO — plays right on the card; graceful fallback to the Listen page if the clip won't load.
function AudioAction({ action, accent }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState(false);
  const toggle = () => {
    const el = ref.current; if (!el) return;
    if (el.paused) { el.play().then(() => setPlaying(true)).catch(() => setErr(true)); }
    else { el.pause(); setPlaying(false); }
  };
  if (err || !action.url) {
    return (
      <div>
        <a href={action.href} style={btnStyle(accent)}><Headphones size={15} /> Open in Listen</a>
        {err && <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "7px 0 0" }}>This clip won't stream here — it's waiting in Listen.</p>}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "11px 13px" }}>
      <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 999, background: accent, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}>
        {playing ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
      </button>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: accent, letterSpacing: "0.04em" }}>{playing ? "Playing — right here" : "Play inline"}</div>
        <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, ...CLAMP(1) }}>{clip(action.title, 40)}</div>
      </div>
      <audio ref={ref} src={action.url} preload="none" onEnded={() => setPlaying(false)} onError={() => setErr(true)} />
    </div>
  );
}

// INLINE WATER — a stepper that writes one HydrationLog per added glass.
function WaterAction({ action, accent, uid }) {
  const [glasses, setGlasses] = useState(action.startGlasses || 0);
  const add = () => {
    setGlasses((g) => Math.min(8, g + 1));
    if (uid) base44.entities.HydrationLog.create({ user_id: uid, day_key: todayKey(), amount_ml: 250, source: "today" }).catch(() => {});
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "10px 13px" }}>
      <button onClick={() => setGlasses((g) => Math.max(0, g - 1))} aria-label="One fewer" style={{ width: 44, height: 44, borderRadius: 12, border: `1.5px solid ${accent}`, background: "transparent", color: accent, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Minus size={20} strokeWidth={2.5} /></button>
      <span style={{ flex: 1, textAlign: "center", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink }}><Droplet size={16} style={{ verticalAlign: "-3px", color: accent }} /> {glasses} of 6 glasses</span>
      <button onClick={add} aria-label="Add a glass" style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: accent, color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Plus size={20} strokeWidth={2.5} /></button>
    </div>
  );
}

// INLINE CHECK — a single tick that writes a HabitLog + nourishes the companion (planner item / practice / tend).
function CheckAction({ action, accent, uid, onTend }) {
  const [done, setDone] = useState(false);
  const A = action.Icon || Check;
  const fire = () => {
    if (done) return;
    setDone(true);
    onTend && onTend(action.note);
    if (uid) {
      const nowISO = new Date().toISOString(); const day = todayKey();
      base44.entities.HabitLogs.create({ user_id: uid, habit_type: action.note || "Today", habit_name: action.note || "Today", habit_category: "today", date: day, day_key: day, completed: true, is_completed: true, source: "today", created_at: nowISO, updated_at: nowISO }).catch(() => {});
    }
  };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Done."} />;
  return <button onClick={fire} style={btnStyle(accent)}><A size={15} /> {action.label}</button>;
}

// INLINE COMPOSE — a small textarea + post, writing for real (journal line / qotd / echo).
function ComposeAction({ action, accent, uid, cycle, onTend }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const A = action.Icon || Send;
  const can = text.trim().length > 0 && !done;
  const post = () => {
    if (!can) return;
    setDone(true);
    doWrite(action.kind, { uid, cycle, text });
    if (action.kind === "line") onTend && onTend("Left a line from Today");
  };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Shared. Thank you."} />;
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={600} placeholder={action.placeholder}
        style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={post} disabled={!can} style={btnStyle(accent, !can)}><A size={15} /> {action.label}</button>
    </div>
  );
}

// INLINE CHIPS — pick symptom(s) + save → SymptomLogs.
function ChipsAction({ action, accent, uid, onTend }) {
  const [picked, setPicked] = useState([]);
  const [done, setDone] = useState(false);
  const toggle = (c) => setPicked((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const save = () => { if (!picked.length || done) return; setDone(true); doWrite("symptom", { uid, picked }); onTend && onTend("Noted a symptom from Today"); };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Noted, gently."} />;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 11 }}>
        {action.chips.map((c) => { const on = picked.includes(c); return (
          <button key={c} onClick={() => toggle(c)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? accent : "transparent", color: on ? "#fff" : T.muted }}>{c}</button>
        ); })}
      </div>
      <button onClick={save} disabled={!picked.length} style={btnStyle(accent, !picked.length)}><Stethoscope size={15} /> {action.label}</button>
    </div>
  );
}

function DoneRow({ accent, label }) {
  return (
    <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "12px 13px", animation: "fwFadeUp .3s ease both" }}>
      <span style={{ width: 30, height: 30, borderRadius: 99, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
      <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

// ── real, guarded, fire-and-forget writes (the proven paths from TodayDemo6) ───────────────────────
function doWrite(kind, { uid, cycle, text, picked }) {
  if (!uid) return;
  const day = todayKey();
  (async () => {
    try {
      if (kind === "line") {
        if (text.trim()) await base44.entities.JournalEntries.create({ user_id: uid, session_date: day, text: text.trim(), tags: ["note"], prompt: "From Today", card_type: "free", card_color: "cream" }).catch(() => {});
      } else if (kind === "symptom") {
        for (const s of (picked || [])) { await base44.entities.SymptomLogs.create({ user_id: uid, date: day, symptom_name: s, symptom_type: s }).catch(() => {}); }
      } else if (kind === "echo") {
        const wh = await communityHash(uid).catch(() => null);
        if (wh && text.trim()) {
          const c = computeCooling({ phase: cycle?.phase, cycleDay: cycle?.cycleDay });
          await base44.functions.invoke("postEcho", { action: "post", user_id: uid, author_hash: wh, body: text.trim().slice(0, 800), phase: cycle?.phase || "unknown", cycle_day: typeof cycle?.cycleDay === "number" ? cycle.cycleDay : undefined, live_at: c.liveAt.toISOString(), expires_at: c.expiresAt.toISOString(), visibility: "all" }).catch(() => {});
        }
      } else if (kind === "qotd") {
        const wh = await communityHash(uid).catch(() => null);
        const q = qotdForDay(day);
        if (wh && text.trim()) await base44.functions.invoke("answerQotd", { user_id: uid, author_hash: wh, prompt_day: day, prompt_key: q.key, body: text.trim().slice(0, 800) }).catch(() => {});
      } else if (kind === "meal") {
        const foods = (picked && picked.length) ? picked : (text && text.trim() ? [text.trim()] : ["A meal"]);
        const label = foods.join(", ");
        await base44.entities.MealLog.create({ user_id: uid, date: day, day_key: day, meal_type: "snack", food_items: foods, food_name: label, name: label, raw_text: label, cycle_phase_at_log: cycle?.phase }).catch(() => {});
      }
    } catch { /* fail-open */ }
  })();
}

// ── the one richer flow that stays a bottom-sheet — log a meal (the full quick-log surface) ─────────
function MealSheet({ uid, cycle, onClose, onSaved }) {
  useScrollLock(true);
  const accent = T.sage;
  const [text, setText] = useState("");
  const [picked, setPicked] = useState([]);
  const [mealType, setMealType] = useState("Breakfast");
  const [method, setMethod] = useState("recents");
  const [saved, setSaved] = useState(false);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const RECENTS = [
    { name: "Porridge with seeds & berries", meta: "240 kcal · iron-rich", tag: "frequent" },
    { name: "Greek yogurt & honey", meta: "180 kcal · protein 15g" },
    { name: "Spinach & lentil salad", meta: "320 kcal · iron-rich" },
    { name: "Katsu curry (meal deal)", meta: "640 kcal" },
    { name: "Banana", meta: "90 kcal" },
  ];
  const METHODS = [
    { key: "search", Icon: Search, label: "Search" }, { key: "recents", Icon: Clock, label: "Recents" },
    { key: "snap", Icon: Camera, label: "Snap" }, { key: "say", Icon: Mic, label: "Say" }, { key: "scan", Icon: ScanLine, label: "Scan" },
  ];
  const toggleFood = (n) => setPicked((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);
  const can = !saved && (picked.length > 0 || text.trim().length > 0);
  const save = () => { if (!can) return; setSaved(true); doWrite("meal", { uid, cycle, text, picked }); onSaved && onSaved(); setTimeout(onClose, 1300); };
  return (
    <div role="dialog" aria-modal="true" aria-label="Log a meal" className="fw-scrim-anim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)", animation: "fwScrimIn .22s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "18px 18px 26px", maxHeight: "86vh", overflowY: "auto", overscrollBehavior: "contain", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", animation: "fwSheetIn .3s cubic-bezier(.32,.72,.24,1) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>Nutrition · on Today</span>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 12px" }}>Log a meal</h2>
        {saved ? <DoneRow accent={accent} label="Logged. Your companion felt that." /> : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => { const on = mealType === m; return <button key={m} onClick={() => setMealType(m)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? accent : "transparent", color: on ? "#fff" : T.muted }}>{m}</button>; })}
            </div>
            <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
              {METHODS.map((mt) => { const on = method === mt.key; return (
                <button key={mt.key} onClick={() => setMethod(mt.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 2px", borderRadius: 12, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? `${accent}14` : "transparent" }}>
                  <mt.Icon size={18} color={on ? accent : T.muted} strokeWidth={1.8} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? accent : T.muted }}>{mt.label}</span>
                </button>); })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", marginBottom: 12 }}>
              <Search size={16} color={T.muted} />
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={method === "scan" ? "Point at a barcode…" : method === "say" ? "“I had porridge and a banana…”" : "Search foods…"} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
            </div>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, margin: "0 0 8px" }}>Recent &amp; quick-add</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECENTS.map((f) => { const on = picked.includes(f.name); return (
                <button key={f.name} onClick={() => toggleFood(f.name)} style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: on ? `${accent}12` : T.paper, border: `1px solid ${on ? accent : T.paperDeep}`, borderRadius: 12, padding: "11px 13px", cursor: "pointer" }}>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.3 }}>{f.name}</span>
                    <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, marginTop: 2 }}>{f.meta}{f.tag ? ` · ${f.tag}` : ""}</span>
                  </span>
                  <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", background: on ? accent : "transparent", border: `1.5px solid ${on ? accent : T.paperDeep}`, color: "#fff" }}>{on ? <Check size={15} strokeWidth={3} /> : <Plus size={15} color={T.muted} />}</span>
                </button>); })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
              <button onClick={save} disabled={!can} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: can ? "pointer" : "default", opacity: can ? 1 : 0.5 }}><Send size={15} /> Log it</button>
              <a href="/Nutrition" style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>or open Nutrition <ChevronRight size={14} /></a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────────────────────────────
function profileName(profile, me) {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const n = profile?.first_name || profile?.preferred_name || profile?.name
    || (me?.full_name ? String(me.full_name).split(" ")[0] : null)
    || (me?.email ? String(me.email).split("@")[0].replace(/[._].*$/, "") : null);
  return n && n.length <= 18 ? cap(n) : "";
}
function longDate() {
  try { return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); }
  catch { return "Today"; }
}
function navBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}
