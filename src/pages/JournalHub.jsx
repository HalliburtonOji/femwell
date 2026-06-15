// JournalHub — the REAL Journal page reimagined as a calm Daily Hub home + a Hero
// Card Slider of surface cards, each opening the FULL existing (data-wired) Journal
// surface in a bottom sheet. The Journal analogue of NutritionHub.
//
// This is PRODUCTION code wired to real Base44 entities. The header reads REAL
// JournalEntries (entries this cycle, last entry, On-This-Day peek) and a live Jess
// prompt; the slider cards open the REAL Journal components (NewEntrySheet composer,
// EchoWall, EntryReader, JournalInsightsTab, CycleMirror, SealedLettersSection,
// ThreadView, WitnessInbox/AskForWitnessSheet, PhaseTwin, TonightReflection) — never
// mock data, never a rewritten write path. Every card's primary action OPENS the
// existing component, so the proven optimistic+guarded writes, the anonymity hashing
// (echoAnon/witnessAnon) and the crisis routing (echoConfig CRISIS_*) stay intact.
//
// Orchestration preserved from src/pages/Journal.jsx:
//   · auth.me() → Promise.all(JournalEntries / UserProfile)  (both .catch-guarded)
//   · ?compose=1&seed=…&type=…  → opens the composer seeded (same as Journal.jsx)
//   · ?open=witness | ?open=twin → opens that overlay (same as Journal.jsx)
//   · handleSaved (optimistic local merge) → FourLivesChooser → echo/seal/witness seeds
//   · handleDelete / handlePin (guarded, reused) for the EntryReader
//   · phase/cycleDay derived via the SAME computeCycleDay the live page uses
//
// Brand: Editorial cream/ink (Ephesis + Cormorant via Editorial constants), Lucide/SVG,
// NO EMOJI, gentle glances not scoreboards/streaks, Jess present, phone-first, UK voice.
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  Feather, Waves, Eye, Users, BarChart2, Lock, Hash, CalendarHeart, Moon,
  ChevronLeft, ChevronRight, ArrowRight, Pin,
} from "lucide-react";
import {
  T, UI, SERIF, Eyebrow, Rule, Script, Hand, Heart, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { HubSheet, SurfaceCard } from "@/components/nutrition/hub/HubShell";
import { JournalDiaryRing } from "@/components/hub/Centerpieces";
import JumpToButton from "@/components/layout/JumpToButton";
import { collectThreads, entriesInThread } from "@/components/journal/threads";
import { formatCountdown } from "@/utils/sealedLetters";
import { heldCountLocal } from "@/components/journal/witness/witnessAnon";
import NurtureGarden from "@/components/nurture/NurtureGarden";
import { relativeDate, entryDateObj, cycleDayForDate } from "@/components/journal/journalDates";
import { TWIN_ENABLED } from "@/components/journal/twin/twinConfig";

// The REAL surface components — reused exactly as Journal.jsx mounts them.
import NewEntrySheet from "@/components/journal/NewEntrySheet";
import EntryReader from "@/components/journal/EntryReader";
import FourLivesChooser from "@/components/journal/FourLivesChooser";
import EchoWall from "@/components/journal/echo/EchoWall";
import ShareAsEchoSheet from "@/components/journal/echo/ShareAsEchoSheet";
import AskForWitnessSheet from "@/components/journal/witness/AskForWitnessSheet";
import WitnessInbox from "@/components/journal/witness/WitnessInbox";
import PhaseTwin from "@/components/journal/twin/PhaseTwin";
import CycleMirror from "@/components/journal/CycleMirror";
import ThreadView from "@/components/journal/ThreadView";
import SealedLetterCompose from "@/components/journal/sealed/SealedLetterCompose";
import SealedLettersList from "@/components/journal/sealed/SealedLettersSection";
import JournalInsightsTab from "@/components/journal/JournalInsightsTab";
import PromptCarousel from "@/components/journal/PromptCarousel";
import JournalHubSheet from "@/components/journal/JournalHubSheet";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";

const COL = 430;     // phone column (matches NutritionHub)
const CARD_W = 365;  // ~85vw — next card still peeks at the right edge
const GAP = 14;

// ── Phase → season (lifted verbatim from Journal.jsx so the framing is identical) ─
const PHASE_SEASON = {
  menstrual:  { name: "Inner Winter",  line: "Soft pace. The body is doing the work." },
  follicular: { name: "Inner Spring",  line: "Something new wants to begin." },
  ovulatory:  { name: "Inner Summer",  line: "Your voice carries today." },
  luteal:     { name: "Inner Autumn",  line: "Boundaries feel natural now." },
};

// Surface registry — drives the slider cards AND the sheets. Every live Journal
// feature is represented; "twin" only appears when TWIN_ENABLED (same gate the
// JournalHubSheet uses), so we never offer an absent surface.
const SURFACES = [
  { id: "write",    label: "Write",          eyebrow: "A line is enough",          accent: T.crimson, Icon: Feather },
  { id: "echo",     label: "Echo Wall",      eyebrow: "One line, anonymously",     accent: T.gold,    Icon: Waves },
  { id: "witness",  label: "Witness",        eyebrow: "Hold space, or be held",    accent: T.sage,    Icon: Eye },
  ...(TWIN_ENABLED
    ? [{ id: "twin", label: "Phase Twin",    eyebrow: "Twelve days, paired",       accent: T.sage,    Icon: Users }]
    : []),
  { id: "insights", label: "Insights",       eyebrow: "The shape of your writing", accent: T.gold,    Icon: BarChart2 },
  { id: "onthisday",label: "On This Day",    eyebrow: "Your mirror across cycles", accent: T.gold,    Icon: CalendarHeart },
  { id: "letters",  label: "Sealed Letters", eyebrow: "Notes to future you",       accent: T.gold,    Icon: Lock },
  { id: "threads",  label: "Threads",        eyebrow: "Series you are keeping",    accent: T.gold,    Icon: Hash },
  { id: "mirror",   label: "Cycle Mirror",   eyebrow: "Echoes from your phase",    accent: T.sage,    Icon: Moon },
  { id: "tonight",  label: "Tonight",        eyebrow: "Close the day, 90 seconds", accent: T.sage,    Icon: Moon },
];

// Time-of-day greeting (gentle, no emoji) — mirrors NutritionHub.
function greetingForNow(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// The user's REAL first name, or null when we only have an account handle — copied
// verbatim from NutritionHub so a raw username like "ojihalliburton57" is never shown.
function firstNameOf(user) {
  const full = (user?.full_name || "").trim();
  if (!full) return null;
  const first = full.split(/\s+/)[0];
  const singleToken = full.split(/\s+/).length === 1;
  const emailLocal = ((user?.email || "").split("@")[0] || "").toLowerCase().replace(/[._-]+/g, "");
  const looksHandle =
    /\d/.test(first) ||
    first.length > 14 ||
    (singleToken && first.toLowerCase().replace(/[._-]+/g, "") === emailLocal);
  if (looksHandle) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// Entries-this-cycle rhythm — lifted from Journal.jsx (gentle count, never a streak).
function entriesThisCycle(entries, profile) {
  if (!entries.length || !profile?.last_period_start_date) {
    return { count: entries.length, label: "entries so far" };
  }
  try {
    const cycleStart = parseISO(profile.last_period_start_date);
    const today = new Date();
    if (cycleStart > today) return { count: entries.length, label: "entries so far" };
    const inCycle = entries.filter((e) => {
      const d = e.session_date ? parseISO(e.session_date) : e.created_date ? new Date(e.created_date) : null;
      return d && d >= cycleStart;
    });
    return { count: inCycle.length, label: "entries this cycle" };
  } catch {
    return { count: entries.length, label: "entries so far" };
  }
}

// A tidy one-line preview of an entry (same spirit as the Ledger's preview()).
function entryPreview(entry) {
  let t = (entry?.text || "").toString();
  if (entry?.card_type === "gratitude") t = t.split("\n").filter(Boolean).join(" · ");
  if (entry?.card_type === "todo" && (!t || !t.trim()) && Array.isArray(entry.todo_items)) {
    t = entry.todo_items.map((it) => it.text).filter(Boolean).join(" · ");
  }
  t = t.replace(/\s+/g, " ").trim();
  if (!t) return "(no words yet)";
  return t.length > 150 ? t.slice(0, 147).trimEnd() + "…" : t;
}

// "On this day" peek — past entries on the same cycle-day (±1) as today, else the
// same calendar date last year(s). Real, guarded, returns [] when nothing matches.
function onThisDayEntries(entries, profile, todayCycleDay) {
  const list = (entries || []).filter(Boolean);
  if (!list.length) return [];
  const now = new Date();
  if (profile?.last_period_start_date && todayCycleDay) {
    const matches = list.filter((e) => {
      const d = entryDateObj(e);
      if (!d) return false;
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) return false;
      const cd = cycleDayForDate(d, profile);
      return cd != null && Math.abs(cd - todayCycleDay) <= 1;
    });
    if (matches.length) return matches.slice(0, 3);
  }
  // calendar-date fallback (same month + day, a prior year)
  const cal = list.filter((e) => {
    const d = entryDateObj(e);
    return d && d.getMonth() === now.getMonth() && d.getDate() === now.getDate() && d.getFullYear() < now.getFullYear();
  });
  return cal.slice(0, 3);
}

export default function JournalHub() {
  useEditorialFonts();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // slider + sheets
  const [openSheet, setOpenSheet] = useState(null);    // surface id or null
  const [hubMenuOpen, setHubMenuOpen] = useState(false); // the "Jump to" switcher
  const [active, setActive] = useState(0);             // slider index

  // composer + the four-lives flow (reused, identical to Journal.jsx)
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [seedText, setSeedText] = useState("");
  const [seedType, setSeedType] = useState(null);
  const [seedThread, setSeedThread] = useState("");
  const [readEntry, setReadEntry] = useState(null);
  const [chooseEntry, setChooseEntry] = useState(null);
  const [echoSeed, setEchoSeed] = useState(null);
  const [sealSeed, setSealSeed] = useState(null);
  const [showShareEcho, setShowShareEcho] = useState(false);
  const [showAskWitness, setShowAskWitness] = useState(false);
  const [witnessEntry, setWitnessEntry] = useState(null);
  const [showWitnessInbox, setShowWitnessInbox] = useState(false);
  const [showTwin, setShowTwin] = useState(false);
  const [threadFilter, setThreadFilter] = useState(null);
  const [deleteErr, setDeleteErr] = useState(false);

  const trackRef = useRef(null);
  const last = SURFACES.length - 1;

  // ── init: auth + entries + profile (both guarded, never crash) ─────────────
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [data, profiles] = await Promise.all([
          base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 200).catch(() => []),
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        ]);
        setEntries(Array.isArray(data) ? data : []);
        setProfile((profiles || [])[0] || null);
      } catch (err) {
        console.error("JournalHub init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── deep-links: ?open=witness|twin and ?compose=1&seed=&type= (same as Journal.jsx)
  const composeSeedDone = useRef(false);
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const open = sp.get("open");
      if (open === "witness") setShowWitnessInbox(true);
      else if (open === "twin" && TWIN_ENABLED) setShowTwin(true);
      if (!composeSeedDone.current && sp.get("compose") === "1") {
        composeSeedDone.current = true;
        const seed = sp.get("seed") || "";
        openSeeded(seed ? decodeURIComponent(seed) : "", sp.get("type") || null);
      }
    } catch { /* ignore */ }
  }, []);

  // derived (real, guarded — null when there's no cycle data)
  const phase = profile?.last_period_start_date ? safeCycle(profile).phase : null;
  const cycleDay = profile?.last_period_start_date ? safeCycle(profile).cycleDay : null;
  const season = phase ? PHASE_SEASON[phase] : null;
  const cycleCount = entriesThisCycle(entries, profile);
  const threads = collectThreads(entries);
  const lastEntry = entries[0] || null;
  const onThisDay = onThisDayEntries(entries, profile, cycleDay);
  const threadMatches = threadFilter ? entriesInThread(entries, threadFilter) : [];
  const threadEntries = [...threadMatches.filter((e) => e.is_pinned), ...threadMatches.filter((e) => !e.is_pinned)];

  // entries-this-week fraction for the diary ring (gentle, capped at 1 — a glance,
  // never a target). 7 entries fills the ring; fewer is a soft arc.
  const weekCount = entries.filter((e) => {
    const d = entryDateObj(e);
    return d && (Date.now() - d.getTime()) < 7 * 86400000;
  }).length;
  const ringFraction = Math.max(0.04, Math.min(1, weekCount / 7));

  // ── seed helpers — verbatim from Journal.jsx so the composer behaves identically
  const openBlank = () => { setSeedText(""); setSeedType(null); setSeedThread(""); setShowNewEntry(true); };
  const openSeeded = (text, type = null) => { setSeedText(text || ""); setSeedType(type); setSeedThread(""); setShowNewEntry(true); };
  const openInThread = (thread) => { setSeedText(""); setSeedType(null); setSeedThread(thread || ""); setShowNewEntry(true); };
  const replyToPast = () => openSeeded("Replying to who I was…\n\n", "reflection");
  const closeComposer = () => { setShowNewEntry(false); setEditEntry(null); setSeedText(""); setSeedType(null); setSeedThread(""); };

  // ── the REUSED write paths (identical to Journal.jsx) ──────────────────────
  const handleSaved = (entry) => {
    if (!entry) return;
    const wasNew = !entries.some((e) => e.id === entry.id);
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
      return [entry, ...prev];
    });
    if (wasNew && (entry.text || "").trim()) setChooseEntry(entry);
  };

  const handleDelete = async (entry) => {
    try {
      await base44.entities.JournalEntries.delete(entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (err) {
      console.error("Delete entry failed:", err);
      setDeleteErr(true); setTimeout(() => setDeleteErr(false), 3500);
    }
  };

  const handlePin = async (entry) => {
    const next = !entry.is_pinned;
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, is_pinned: next } : e)));
    setReadEntry((r) => (r && r.id === entry.id ? { ...r, is_pinned: next } : r));
    try { await base44.entities.JournalEntries.update(entry.id, { is_pinned: next }); }
    catch (err) { console.error("Pin toggle failed:", err); }
  };

  const handleEditFromReader = (entry) => { setReadEntry(null); setEditEntry(entry); };

  // ── open a surface by id. "write"/"tonight"/"onthisday"/"threads" route to the
  // composer or an in-page lens; the rest open their full surface in the HubSheet.
  const openSurface = (id) => {
    if (id === "write") { openBlank(); return; }
    if (id === "tonight") { openSeeded(`${TONIGHT_LINE(phase)}\n\n`, "reflection"); return; }
    setOpenSheet(id);
  };

  // ── slider scroll-snap sync (same mechanism as NutritionHub) ───────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(el.scrollLeft / (CARD_W + GAP));
        setActive(Math.max(0, Math.min(last, i)));
      }, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last, loading]);

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" });
  };

  // ── Jump-to switcher selection — same routing as Journal.jsx's handleHubSelect
  const handleHubSelect = (id) => {
    if (id === "insights")        { setOpenSheet("insights"); return; }
    if (id === "doctor")          { navigate("/DoctorExport"); return; }
    if (id === "echo")            { setOpenSheet("echo"); return; }
    if (id === "witness")         { setShowWitnessInbox(true); return; }
    if (id === "twin")            { setShowTwin(true); return; }
    if (id === "letters")         { setOpenSheet("letters"); return; }
    if (id === "threads")         { setOpenSheet("threads"); return; }
    if (id.startsWith("thread:")) { setThreadFilter(id.replace("thread:", "")); setOpenSheet("threads"); return; }
  };

  // ── the real surface for the open sheet ────────────────────────────────────
  const renderSurface = (id) => {
    if (!user) return null;
    switch (id) {
      case "echo":
        return <EchoWall user={user} profile={profile} phase={phase} lifeStage={profile?.life_stage || null} />;
      case "witness":
        return <WitnessInbox user={user} phase={phase} profile={profile} onClose={() => setOpenSheet(null)} />;
      case "insights":
        return <JournalInsightsTab user={user} entries={entries} />;
      case "letters":
        return <SealedLettersList user={user} profile={profile} />;
      case "mirror":
        return entries.length > 0
          ? <CycleMirror entries={entries} profile={profile} phase={phase} todayCycleDay={cycleDay} onReply={() => { setOpenSheet(null); replyToPast(); }} />
          : <Empty>Once you have written a few entries, your cycle mirror gathers here — what you wrote on this day, in this phase, before.</Empty>;
      case "onthisday":
        return entries.length > 0
          ? <CycleMirror entries={entries} profile={profile} phase={phase} todayCycleDay={cycleDay} onReply={() => { setOpenSheet(null); replyToPast(); }} />
          : <Empty>Nothing to look back on yet. As you keep writing, this is where past pages on the same day surface.</Empty>;
      case "threads":
        return threadFilter
          ? <ThreadView thread={threadFilter} entries={threadEntries} onBack={() => setThreadFilter(null)} onTap={(e) => setReadEntry(e)} onWrite={() => { setOpenSheet(null); openInThread(threadFilter); }} />
          : <ThreadsPicker threads={threads} onPick={(name) => setThreadFilter(name)} onWrite={() => { setOpenSheet(null); openBlank(); }} onNewThread={(name) => { setOpenSheet(null); openInThread(name); }} />;
      default:
        return null;
    }
  };

  const openMeta = openSheet ? SURFACES.find((s) => s.id === openSheet) : null;

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  const greeting = greetingForNow();
  const firstName = firstNameOf(user);
  const phaseWord = phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : null;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120 }}>
      <InkFilter />

      {deleteErr && (
        <div role="alert" style={{
          position: "fixed", left: "50%", bottom: 90, transform: "translateX(-50%)", zIndex: 4000,
          padding: "9px 16px", borderRadius: 9999, fontFamily: UI, fontSize: 13, fontWeight: 700,
          color: T.paper, background: T.crimson,
        }}>Couldn{"’"}t delete that just now — the entry is still here. Try again.</div>
      )}

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative" }}>

        {/* ── DAILY HUB header — rich summary, wired to real data ───────────── */}
        <header style={{ padding: "20px 18px 4px" }}>
          {/* controls row — Jump-to pill left, the season strip right */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
            <JumpToButton onClick={() => setHubMenuOpen(true)} />
            {season ? (
              <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.5, fontWeight: 600, textAlign: "right", maxWidth: 230 }}>
                {season.name} · {season.line}
              </span>
            ) : null}
          </div>

          {/* greeting — its own full-width line. No raw username (firstName is null for handle-like names). */}
          <Eyebrow mb={4}>
            {firstName ? `${greeting}, ${firstName}` : greeting}
            {phaseWord ? ` · ${phaseWord}` : ""}
            {phaseWord && cycleDay ? ` · Day ${cycleDay}` : ""}
            {` · ${format(new Date(), "d MMMM").toUpperCase()}`}
          </Eyebrow>

          <Script size={40} carve>your journal today</Script>

          {/* the JournalDiaryRing centerpiece — wired to entries-this-week (gentle glance) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 }}>
            <div style={{ position: "relative", width: 184, height: 184 }}>
              <JournalDiaryRing size={184} fraction={ringFraction} />
            </div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.ink }}>
                {weekCount === 0
                  ? "A fresh page this week — whenever you’re ready."
                  : `${weekCount} ${weekCount === 1 ? "entry" : "entries"} this week`}
              </div>
              {cycleCount.count > 0 ? (
                <div style={{ fontFamily: UI, fontSize: 10, letterSpacing: 0.6, color: T.muted, marginTop: 3 }}>
                  {cycleCount.count} {cycleCount.label} — you{"’"}re building a pattern.
                </div>
              ) : null}
            </div>
          </div>

          {/* last-entry stat row — real, guarded */}
          {lastEntry ? (
            <button onClick={() => setReadEntry(lastEntry)} style={{
              width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, marginTop: 16,
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "13px 15px", cursor: "pointer",
            }}>
              {lastEntry.is_pinned ? <Pin size={15} style={{ color: T.gold, flexShrink: 0 }} /> : <Feather size={15} style={{ color: T.muted, flexShrink: 0 }} />}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 1, color: T.muted, textTransform: "uppercase", display: "block" }}>
                  Last entry · {relativeDate(lastEntry)}
                </span>
                <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, display: "block", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entryPreview(lastEntry)}
                </span>
              </span>
              <ArrowRight size={15} style={{ color: T.muted, flexShrink: 0 }} />
            </button>
          ) : null}

          {/* Jess prompt line — live daily prompt via PromptCarousel (reused, error-boundaried) */}
          {user && (
            <div style={{ marginTop: 18 }}>
              <JessErrorBoundary variant="quiet" label="JournalHub:Prompt">
                <HubPromptLine
                  user={user} profile={profile} phase={phase} cycleDay={cycleDay}
                  lastEntry={lastEntry} onWrite={(p) => openSeeded(`${p}\n\n`)}
                />
              </JessErrorBoundary>
            </div>
          )}

          {/* Nurture Companion presence — your living garden, grown from real engagement.
              An inviting, tappable card → its full view (/Garden). State-not-score, never dies. */}
          {user && (
            <button
              onClick={() => navigate(createPageUrl("Garden"))}
              style={{
                marginTop: 16, width: "100%", display: "block", cursor: "pointer",
                background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "13px 14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>Your garden</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 1, fontFamily: UI, fontSize: 11, fontWeight: 600, color: T.muted }}>Tend<ChevronRight size={13} /></span>
              </div>
              <NurtureGarden compact onOpen={() => navigate(createPageUrl("Garden"))} />
            </button>
          )}

          {/* On-This-Day peek — real past entries, guarded; tap opens the reader */}
          {onThisDay.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <Eyebrow mb={8}>On this day{cycleDay ? ` · Day ${cycleDay}` : ""}</Eyebrow>
              <div style={{ display: "grid", gap: 7 }}>
                {onThisDay.map((e) => (
                  <button key={e.id} onClick={() => setReadEntry(e)} style={{
                    width: "100%", textAlign: "left", display: "flex", gap: 10, alignItems: "baseline",
                    background: "transparent", border: "none", borderLeft: `2px solid ${T.gold}`, paddingLeft: 11, cursor: "pointer",
                  }}>
                    <span style={{ fontFamily: UI, fontSize: 9, color: T.muted, fontWeight: 700, textTransform: "uppercase", flexShrink: 0 }}>{relativeDate(e)}</span>
                    <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entryPreview(e)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* prominent WRITE button — the one clear primary action */}
          <button onClick={openBlank} style={{
            width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: T.crimson, color: T.paper, border: "none", borderRadius: 16, padding: "17px 18px",
            fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
            marginTop: 18, boxShadow: "0 6px 18px rgba(188,46,39,0.25)",
          }}>
            <Feather size={19} /> Write a page
          </button>
        </header>

        {/* ── THE SPINE — Hero Card Slider of surfaces ───────────────────── */}
        <div style={{ marginTop: 12 }}>
          <div style={{ padding: "0 18px 10px" }}>
            <Hand size={15} color={T.muted}>Swipe through your journal — each card opens the full thing.</Hand>
          </div>

          {/* segmented label rail */}
          <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 18px 12px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {SURFACES.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} style={{
                flex: "none", background: i === active ? T.ink : "transparent", color: i === active ? T.paper : T.muted,
                border: `1px solid ${i === active ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 12px",
                fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
              }}>{s.label}</button>
            ))}
          </div>

          {/* the swipeable track — scroll-snap, next card peeks */}
          <div ref={trackRef} className="jhub-track" style={{
            display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "0 18px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          }}>
            <style>{`.jhub-track::-webkit-scrollbar{display:none}`}</style>

            {SURFACES.map((s) => (
              <SurfaceCard
                key={s.id}
                cardW={CARD_W}
                label={s.label}
                accent={s.accent}
                onOpen={() => openSurface(s.id)}
                primaryLabel={PRIMARY_LABEL[s.id] || `Open ${s.label}`}
                primaryIcon={s.Icon}
              >
                <CardSummary
                  surface={s}
                  user={user}
                  entries={entries}
                  profile={profile}
                  phase={phase}
                  cycleDay={cycleDay}
                  lastEntry={lastEntry}
                  threads={threads}
                  onThisDay={onThisDay}
                  onWrite={openBlank}
                  onWriteSeeded={openSeeded}
                  onReadEntry={setReadEntry}
                  onShareEcho={() => { setEchoSeed(null); setShowShareEcho(true); }}
                  onAskWitness={() => { setWitnessEntry(null); setShowAskWitness(true); }}
                  onOpenWitnessInbox={() => setShowWitnessInbox(true)}
                  onOpenTwin={() => setShowTwin(true)}
                  onPickThread={(name) => { setThreadFilter(name); setOpenSheet("threads"); }}
                  onOpenSeal={() => setSealSeed("")}
                />
              </SurfaceCard>
            ))}

            <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
          </div>

          {/* prev / dots / next */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
            <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous surface" style={navBtn(active === 0)}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: "flex", gap: 7 }}>
              {SURFACES.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} aria-label={s.label} style={{
                  width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                  background: i === active ? T.crimson : T.paperDeep, cursor: "pointer", transition: "width .2s",
                }} />
              ))}
            </div>
            <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next surface" style={navBtn(active === last)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* footer voice */}
        <footer style={{ textAlign: "center", padding: "30px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
            A publication of one — locked to you, always.
          </div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 8, letterSpacing: 0.3 }}>
            Gentle space for your stage — not medical advice.
          </div>
        </footer>

        {/* ── the universal "Jump to" switcher (reused JournalHubSheet) ───── */}
        <JournalHubSheet
          open={hubMenuOpen}
          onClose={() => setHubMenuOpen(false)}
          onSelect={handleHubSelect}
          threads={threads}
        />

        {/* ── the bottom sheet — the FULL real surface ───────────────────── */}
        {openMeta && (
          <HubSheet title={openMeta.label} eyebrow={openMeta.eyebrow} onClose={() => { setOpenSheet(null); if (openMeta.id === "threads") setThreadFilter(null); }}>
            {renderSurface(openMeta.id)}
          </HubSheet>
        )}

        {/* ── Composer (reused NewEntrySheet — the proven write path) ─────── */}
        {(showNewEntry || editEntry) && user && (
          <NewEntrySheet
            user={user} phase={phase} cycleDay={cycleDay}
            editEntry={editEntry} seedText={seedText}
            seedCardType={seedType} seedThread={seedThread}
            threads={threads.map((t) => t.name)}
            onClose={closeComposer} onSaved={handleSaved}
          />
        )}

        {/* ── Entry reader (reused, with the proven delete/pin/share paths) ── */}
        <EntryReader
          entry={readEntry} profile={profile} phase={phase}
          onClose={() => setReadEntry(null)}
          onEdit={handleEditFromReader}
          onDelete={handleDelete} onPin={handlePin}
          onShare={(entry) => { setChooseEntry(entry); setReadEntry(null); }}
        />

        {/* ── One entry, four lives (reused chooser → echo/seal/witness) ──── */}
        {chooseEntry && (
          <FourLivesChooser
            entry={chooseEntry}
            onClose={() => setChooseEntry(null)}
            onEcho={() => { setEchoSeed({ text: chooseEntry.text || "", sourceId: chooseEntry.id || null }); setShowShareEcho(true); setChooseEntry(null); }}
            onSeal={() => { setSealSeed(chooseEntry.text || ""); setChooseEntry(null); }}
            onWitness={() => { setWitnessEntry(chooseEntry); setShowAskWitness(true); setChooseEntry(null); }}
          />
        )}

        {/* ── Echo composer (reused — anonymity hashing + crisis intercept intact) ── */}
        {showShareEcho && user && (
          <ShareAsEchoSheet
            user={user} profile={profile} phase={phase}
            cycleDay={cycleDay} lifeStage={profile?.life_stage || null}
            seedText={echoSeed?.text || ""} sourceEntryId={echoSeed?.sourceId || null}
            onClose={() => { setShowShareEcho(false); setEchoSeed(null); }}
          />
        )}

        {/* ── Sealed-letter composer (reused — on-device AES, ciphertext only) ── */}
        {sealSeed !== null && user && (
          <SealedLetterCompose
            profile={profile} seedBody={sealSeed}
            onClose={() => setSealSeed(null)}
            onSealed={() => setSealSeed(null)}
          />
        )}

        {/* ── Witness Mode (reused) ── */}
        {showAskWitness && user && (
          <AskForWitnessSheet
            user={user} phase={phase} profile={profile} entry={witnessEntry}
            onClose={() => { setShowAskWitness(false); setWitnessEntry(null); }}
            onOpenInbox={() => { setShowAskWitness(false); setWitnessEntry(null); setShowWitnessInbox(true); }}
          />
        )}
        {showWitnessInbox && user && (
          <WitnessInbox
            user={user} phase={phase} profile={profile}
            onClose={() => setShowWitnessInbox(false)}
          />
        )}
        {showTwin && user && (
          <PhaseTwin
            user={user} phase={phase} profile={profile}
            onClose={() => setShowTwin(false)}
          />
        )}
      </div>
    </div>
  );
}

// Safe cycle compute — never throws; returns { phase: null, cycleDay: null } on error.
function safeCycle(profile) {
  try { const r = computeCycleDay(profile); return { phase: r.phase, cycleDay: r.cycleDay }; }
  catch { return { phase: null, cycleDay: null }; }
}

// Tonight's reflection prompt line (mirrors TonightReflection's copy) — used to seed
// the composer when the Tonight card's primary action is tapped (direct-on-card).
const TONIGHT_LINES = {
  menstrual:  "Before the day closes — what did your body ask for today, and did you listen?",
  follicular: "Before the day closes — name one small thing you let yourself begin today.",
  ovulatory:  "Before the day closes — where did you let yourself be seen today?",
  luteal:     "Before the day closes — name one thing today asked of you, and one thing you gave it.",
};
function TONIGHT_LINE(phase) {
  return TONIGHT_LINES[phase] || "Before the day closes — name one thing your body carried today. Name it, thank it, close the book.";
}

const PRIMARY_LABEL = {
  write: "Open the composer",
  echo: "Open the Echo Wall",
  witness: "Open Witness",
  twin: "Open Phase Twin",
  insights: "Open Insights",
  onthisday: "Open your mirror",
  letters: "Open Sealed Letters",
  threads: "Open Threads",
  mirror: "Open Cycle Mirror",
  tonight: "Close the day",
};

function navBtn(disabled) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
    borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
    color: disabled ? T.paperDeep : T.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}

// ── A compact, live Jess prompt line for the header. Renders the REUSED
// PromptCarousel so the prompt is the same agent-generated daily prompt the live
// page shows (same cache key), with phase fallbacks — never duplicated copy.
function HubPromptLine(props) {
  return (
    <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "14px 16px 10px" }}>
      <div className="jhub-prompt">
        <style>{`.jhub-prompt :is(section){margin-bottom:0!important}`}</style>
        <PromptCarousel {...props} onDark />
      </div>
    </div>
  );
}

// ── per-card rich summary — each card holds a FULL inline REAL-DATA preview of its
// feature, plus a direct-on-card action where one is natural (share a line, ask for
// witness, write tonight's reflection). The bottom sheet stays the dense/full layer.
function CardSummary(props) {
  const { surface } = props;
  switch (surface.id) {
    case "write":     return <WriteCard {...props} />;
    case "echo":      return <EchoCard {...props} />;
    case "witness":   return <WitnessCard {...props} />;
    case "twin":      return <TwinCard {...props} />;
    case "insights":  return <InsightsCard {...props} />;
    case "onthisday": return <OnThisDayCard {...props} />;
    case "letters":   return <LettersCard {...props} />;
    case "threads":   return <ThreadsCard {...props} />;
    case "mirror":    return <MirrorCard {...props} />;
    case "tonight":   return <TonightCard {...props} />;
    default:          return null;
  }
}

// ── WRITE · today's prompt + last entry preview; direct-on-card = start writing ──
function WriteCard({ phase, cycleDay, lastEntry, onWrite, onWriteSeeded }) {
  const phaseWord = phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Today";
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Heart size={14} />
        <Eyebrow>A note from Jess · {phaseWord}{cycleDay ? ` · Day ${cycleDay}` : ""}</Eyebrow>
      </div>
      <Script size={28} style={{ marginBottom: 6 }}>What wants to be written?</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>A line is enough. It is locked to you, always.</Hand>

      {/* quick starts — direct-on-card: each opens the composer seeded by format */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {[
          ["Free write", null], ["Gratitude", "gratitude"], ["Reflection", "reflection"],
          ["Mood", "mood"], ["Joy", "joy"], ["Grief", "grief"],
        ].map(([label, type]) => (
          <button key={label} onClick={() => (type ? onWriteSeeded("", type) : onWrite())} style={chipBtn}>
            <Feather size={11} color={T.crimson} />
            <span style={{ fontFamily: SERIF, fontSize: 13, color: T.ink }}>{label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        {lastEntry ? (
          <>
            <Eyebrow mb={8}>Where you left off · {relativeDate(lastEntry)}</Eyebrow>
            <div style={{ borderLeft: `2px solid ${T.gold}`, paddingLeft: 11 }}>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.4 }}>{entryPreview(lastEntry)}</div>
            </div>
          </>
        ) : (
          <Empty>Your first page is waiting. Begin with a single line — gratitude, a mood, or whatever is true right now.</Empty>
        )}
      </div>
    </div>
  );
}

// ── ECHO WALL · a few live echoes (real, guarded read); direct-on-card = share a line
function EchoCard({ phase, onShareEcho }) {
  const [all, setAll] = useState([]);     // up to 30 live echoes (for presence + filter)
  const [loaded, setLoaded] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);  // "your phase" filter toggle
  useEffect(() => {
    let alive = true;
    base44.entities.Echo.filter({ hidden: false }, "-created_date", 30)
      .then((rows) => { if (alive) setAll(Array.isArray(rows) ? rows.filter(Boolean) : []); })
      .catch(() => { if (alive) setAll([]); })
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
    // user/profile/phase aren't needed for the read — the feed is everyone's live echoes
  }, []);

  // k-anon presence: distinct voices in the last 24h (author_hash if present, else rows).
  // Bucketed to a soft "~N" — never an exact identifying count.
  const cutoff = Date.now() - 24 * 3600e3;
  const recent = all.filter((e) => new Date(e.created_date || 0).getTime() >= cutoff);
  const voices = new Set(recent.map((e) => e.author_hash || e.id)).size;
  const presence = voices >= 3 ? `~${voices} sisters left a line today` : (all.length > 0 ? "a few quiet lines today" : "");

  const phaseCount = phase ? all.filter((e) => e.phase === phase).length : 0;
  const shown = (mineOnly && phase ? all.filter((e) => e.phase === phase) : all).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Waves size={16} style={{ color: T.gold }} />
        <Script size={26}>The Echo Wall</Script>
      </div>
      <Hand size={14} color={T.muted} style={{ marginBottom: 10 }}>
        Anonymous lines, held — never replied to. Each fades in two days.
      </Hand>

      {/* presence + phase filter — a real glance at the room + a way to find your phase */}
      {loaded && all.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
          {presence ? (
            <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: 0.2 }}>{presence}</span>
          ) : <span />}
          {phase && phaseCount > 0 ? (
            <button onClick={() => setMineOnly((v) => !v)} style={{
              fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer",
              padding: "4px 10px", borderRadius: 999, border: `1px solid ${mineOnly ? T.gold : T.paperDeep}`,
              background: mineOnly ? T.gold : "transparent", color: mineOnly ? T.paper : T.muted,
            }}>{mineOnly ? "Showing your phase" : `Your phase · ${phaseCount}`}</button>
          ) : null}
        </div>
      ) : null}

      <div style={{ flex: 1 }}>
        {!loaded ? (
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Listening for echoes…</div>
        ) : shown.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {shown.map((e) => (
              <div key={e.id} style={{ borderLeft: `2px solid ${T.paperDeep}`, paddingLeft: 11 }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.ink, lineHeight: 1.4 }}>
                  {"“"}{(e.body || "").slice(0, 140)}{"”"}
                </div>
                {phase && e.phase === phase ? (
                  <div style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.gold, marginTop: 3 }}>your phase</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : mineOnly ? (
          <Empty>No echoes from your phase in this window yet. Show all, or leave the first line for your phase.</Empty>
        ) : (
          <Empty>Quiet, for now — no echoes in this window. Lines are anonymous and fade in 48 hours; if something is true for you, you can leave the first.</Empty>
        )}
      </div>

      {/* direct-on-card: share one line (opens the real, crisis-screened composer) */}
      <button onClick={onShareEcho} style={primaryChip}>
        <Waves size={14} /> Share a line
      </button>
    </div>
  );
}

// ── WITNESS · the honest model + your real "held" count; direct-on-card actions ──
function WitnessCard({ onAskWitness, onOpenWitnessInbox }) {
  const held = (() => { try { return heldCountLocal(); } catch { return 0; } })();
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Eye size={16} style={{ color: T.sage }} />
        <Script size={26}>Witness</Script>
      </div>
      <Hand size={14} color={T.ink} style={{ marginBottom: 14 }}>
        Hold space for one sister, or ask one to hold yours. Anonymous, one-to-one, no replies — only presence.
      </Hand>

      {held > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.paper, border: `1px solid ${T.sage}`, borderRadius: 10, padding: "9px 12px", marginBottom: 12 }}>
          <Eye size={13} style={{ color: T.sage }} />
          <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink }}>
            You{"’"}ve held space for {held} {held === 1 ? "sister" : "sisters"}. Quiet, unseen, and enough.
          </span>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 11, marginBottom: 4 }}>
        <Pattern title="Ask to be witnessed" detail="Send one passage out, anonymously, to a sister in your phase." />
        <Pattern title="Hold space for someone" detail={held > 0 ? "Open your inbox to hold the next sister waiting." : "Your inbox holds requests waiting for a quiet witness."} />
      </div>

      <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
        <button onClick={onAskWitness} style={primaryChip}>
          <Eye size={14} /> Ask for a witness
        </button>
        <button onClick={onOpenWitnessInbox} style={ghostChip}>
          Open your witness inbox
        </button>
      </div>
    </div>
  );
}

// ── PHASE TWIN · honest "twelve days, paired" preview; opens the real PhaseTwin ──
function TwinCard({ phase, onOpenTwin }) {
  const phaseWord = phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "your phase";
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Users size={16} style={{ color: T.sage }} />
        <Script size={26}>Phase Twin</Script>
      </div>
      <Hand size={14} color={T.ink} style={{ marginBottom: 14 }}>
        Twelve days, paired with one woman in your {phaseWord.toLowerCase()}. One shared prompt a day; her answer stays blurred until you write yours.
      </Hand>
      <div style={{ display: "grid", gap: 11, marginBottom: 4 }}>
        <Pattern title="One prompt a day" detail="A gentle, whole-life question — not just the cycle." />
        <Pattern title="Mutual and anonymous" detail="Hashes only, no handles, no free chat. Day 12 archives it." />
      </div>
      <button onClick={onOpenTwin} style={{ ...primaryChip, marginTop: "auto" }}>
        <Users size={14} /> Find your twin
      </button>
    </div>
  );
}

// ── Mood trend — up to 14 most-recent entries that carried a mood, oldest→newest,
// as soft colour-banded dots (low/steady/light). A glance at the rhythm, never a score.
function MoodTrend({ entries }) {
  const moods = (entries || [])
    .filter((e) => e && e.mood_rating)
    .map((e) => ({ m: Number(e.mood_rating), d: entryDateObj(e) }))
    .filter((x) => x.m >= 1 && x.d)
    .sort((a, b) => (a.d?.getTime() || 0) - (b.d?.getTime() || 0))
    .slice(-14);
  if (moods.length < 2) return null;   // need a couple of moods to read a trend
  const band = (m) => (m <= 2 ? T.crimson : m === 3 ? T.muted : T.sage);
  const avg = moods.reduce((s, x) => s + x.m, 0) / moods.length;
  const word = avg <= 2.4 ? "tender lately" : avg >= 3.6 ? "lighter lately" : "fairly steady";
  return (
    <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "11px 13px" }}>
      <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>
        Mood across your last {moods.length} pages · {word}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 26 }}>
        {moods.map((x, i) => (
          <span key={i} title={`mood ${x.m}/5`} style={{
            width: 9, height: 4 + x.m * 4, borderRadius: 999, background: band(x.m), display: "inline-block", flexShrink: 0,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── INSIGHTS · gentle real patterns from the entries (counts/threads, never scores)
function InsightsCard({ entries, threads }) {
  const list = (entries || []).filter(Boolean);
  const total = list.length;
  // a calm distribution of formats (real) — the shape of the writing, not a grade
  const byType = {};
  list.forEach((e) => { const k = e.card_type || "free"; byType[k] = (byType[k] || 0) + 1; });
  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const TYPE_LABEL = {
    free: "Free writes", gratitude: "Gratitude", mood: "Mood notes", todo: "To-dos",
    reflection: "Reflections", affirmation: "Affirmations", dream: "Dreams",
    relationships: "Relationships", career: "Career", creativity: "Creativity",
    money: "Money", grief: "Grief", joy: "Joy", identity: "Identity",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <BarChart2 size={16} style={{ color: T.gold }} />
        <Script size={26}>The shape of it</Script>
      </div>
      <Hand size={14} color={T.muted} style={{ marginBottom: 14 }}>Patterns across your writing — never a grade.</Hand>

      {total > 0 ? (
        <div style={{ display: "grid", gap: 11 }}>
          <MoodTrend entries={list} />
          <Pattern title={`${total} ${total === 1 ? "page" : "pages"} written`} detail="Each one is a small act of paying attention to yourself." />
          {topTypes.map(([k, n]) => (
            <Pattern key={k} title={`${TYPE_LABEL[k] || k} · ${n}`} detail="A thread your writing keeps returning to." />
          ))}
          {threads.length > 0 ? (
            <Pattern title={`${threads.length} ${threads.length === 1 ? "series" : "series"} you are keeping`} detail="Named threads you have written into more than once." />
          ) : null}
        </div>
      ) : (
        <Empty>
          Patterns appear here once you have written a few pages — the formats you return to (gratitude, reflection, grief), a gentle mood trend across your recent entries, and the series your writing keeps coming back to. Write two or three pages and this fills in.
        </Empty>
      )}
    </div>
  );
}

// ── ON THIS DAY · real past entries on the same cycle-day; tap opens the reader ──
function OnThisDayCard({ onThisDay, cycleDay, onReadEntry }) {
  const list = (onThisDay || []).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <CalendarHeart size={16} style={{ color: T.gold }} />
        <Script size={26}>On this day</Script>
      </div>
      <Hand size={14} color={T.muted} style={{ marginBottom: 14 }}>
        {cycleDay ? `What you wrote on Day ${cycleDay} of cycles past.` : "What you wrote on this day, before."}
      </Hand>
      <div style={{ flex: 1 }}>
        {list.length > 0 ? (
          <div style={{ display: "grid", gap: 11 }}>
            <div style={{ fontFamily: UI, fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
              {list.length} {list.length === 1 ? "time" : "times"} you wrote {cycleDay ? `on Day ${cycleDay}` : "on this day"}
            </div>
            {list.map((e) => (
              <button key={e.id} onClick={() => onReadEntry(e)} style={{
                width: "100%", textAlign: "left", background: "transparent", border: "none",
                borderLeft: `2px solid ${T.gold}`, paddingLeft: 11, cursor: "pointer",
              }}>
                <div style={{ fontFamily: UI, fontSize: 9, color: T.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{relativeDate(e)}</div>
                <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.4 }}>{entryPreview(e)}</div>
              </button>
            ))}
          </div>
        ) : (
          <Empty>Nothing to look back on for today yet. As the cycles turn, past pages from this same day will surface here.</Empty>
        )}
      </div>
    </div>
  );
}

// ── SEALED LETTERS · real state — count, ready-to-open, next-unseal timeline ──
function LettersCard({ user, onOpenSeal }) {
  const [letters, setLetters] = useState(null);   // null = loading
  useEffect(() => {
    if (!user?.id) { setLetters([]); return; }
    let alive = true;
    base44.entities.SealedLetters.filter({ user_id: user.id }, "-created_at")
      .then((rows) => { if (alive) setLetters(Array.isArray(rows) ? rows.filter(Boolean) : []); })
      .catch(() => { if (alive) setLetters([]); });
    return () => { alive = false; };
  }, [user?.id]);

  const list = letters || [];
  const ready = list.filter((l) => l.unsealed_at && !l.unseal_seen_at);     // arrived, not yet read
  const sealed = list.filter((l) => !l.unsealed_at);                         // still locked
  // upcoming unseals, soonest first (next 3) — real seal_date countdowns
  const upcoming = sealed
    .filter((l) => l.seal_date)
    .sort((a, b) => String(a.seal_date).localeCompare(String(b.seal_date)))
    .slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Lock size={16} style={{ color: T.gold }} />
        <Script size={26}>Sealed Letters</Script>
      </div>
      <Hand size={14} color={T.ink} style={{ marginBottom: 14 }}>
        Time-locked notes to a future you, encrypted on your device — sealed until the moment you choose.
      </Hand>

      <div style={{ flex: 1 }}>
        {letters === null ? (
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Counting your letters…</div>
        ) : list.length === 0 ? (
          <Empty>None sealed yet. Write a line to a future you — set a date, a phase, or a milestone, and it stays encrypted until then.</Empty>
        ) : (
          <>
            {/* real headline state */}
            <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 0.3, marginBottom: 12 }}>
              {sealed.length} sealed{ready.length > 0 ? ` · ${ready.length} ready to open` : ""}
            </div>
            {ready.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.paper, border: `1px solid ${T.gold}`, borderRadius: 10, padding: "9px 12px", marginBottom: 12 }}>
                <Lock size={13} style={{ color: T.gold }} />
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink }}>
                  {ready.length === 1 ? "A letter has arrived — ready to open." : `${ready.length} letters have arrived.`}
                </span>
              </div>
            ) : null}
            {upcoming.length > 0 ? (
              <>
                <Eyebrow mb={8}>Unsealing next</Eyebrow>
                <div style={{ display: "grid", gap: 7 }}>
                  {upcoming.map((l) => (
                    <div key={l.id} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(l.title || "").trim() || "A sealed letter"}
                      </span>
                      <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 600, flexShrink: 0 }}>{formatCountdown(l.seal_date)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>

      {/* direct-on-card: open the real on-device-encrypting composer */}
      <button onClick={onOpenSeal} style={{ ...primaryChip, marginTop: 14 }}>
        <Lock size={14} /> Write a sealed letter
      </button>
    </div>
  );
}

// short relative label from a Date (for thread "last written" stamps)
function agoShort(d) {
  if (!d) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ── THREADS · the real named series; tap a thread opens it in the sheet ──
// Threads come pre-sorted by most-recently-written (collectThreads), so the
// freshest series lead. Each chip shows its entry count AND when it was last
// written into — so a glance tells you which threads are alive vs resting.
function ThreadsCard({ threads, onPickThread, onWrite }) {
  const list = (threads || []).filter(Boolean);
  const freshest = list[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Hash size={16} style={{ color: T.gold }} />
        <Script size={26}>Threads</Script>
      </div>
      <Hand size={14} color={T.muted} style={{ marginBottom: 14 }}>
        {list.length > 0
          ? `${list.length} ${list.length === 1 ? "series" : "series"} you are keeping — tap one to follow it.`
          : "Series you are keeping — tap one to follow it."}
      </Hand>
      <div style={{ flex: 1 }}>
        {list.length > 0 ? (
          <>
            {freshest?.last ? (
              <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 0.3, marginBottom: 10 }}>
                Most recent · {freshest.name} ({agoShort(freshest.last)})
              </div>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {list.slice(0, 10).map((t) => (
                <button key={t.name} onClick={() => onPickThread(t.name)} style={{ ...chipBtn, flexDirection: "column", alignItems: "flex-start", gap: 2, paddingTop: 7, paddingBottom: 7 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Hash size={11} color={T.gold} />
                    <span style={{ fontFamily: SERIF, fontSize: 13, color: T.ink }}>{t.name}</span>
                    <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, fontWeight: 700 }}>{t.count}</span>
                  </span>
                  {t.last ? (
                    <span style={{ fontFamily: UI, fontSize: 9, color: T.muted, letterSpacing: 0.3 }}>last {agoShort(t.last)}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </>
        ) : (
          <Empty>
            No threads yet. When you write, add a tag (like “work” or “healing”) — every entry with that tag gathers into a named series here, so you can follow one idea across weeks.
            {onWrite ? <><br /><button onClick={onWrite} style={{ ...primaryChip, marginTop: 12, display: "inline-flex" }}><Feather size={13} /> Start one — write &amp; tag it</button></> : null}
          </Empty>
        )}
      </div>
    </div>
  );
}

// ── CYCLE MIRROR · gentle preview of phase echoes; opens the full mirror ──
function MirrorCard({ entries, phase, cycleDay }) {
  const list = (entries || []).filter(Boolean);
  const season = phase ? PHASE_SEASON[phase] : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Moon size={16} style={{ color: T.sage }} />
        <Script size={26}>Cycle Mirror</Script>
      </div>
      <Hand size={14} color={T.muted} style={{ marginBottom: 14 }}>
        {season ? `${season.name} — ${season.line}` : "Echoes from the same place in your cycle."}
      </Hand>
      {list.length > 0 ? (
        <div style={{ display: "grid", gap: 11 }}>
          <Pattern title={phase ? `What you wrote in your ${phase}` : "What you wrote before"} detail="The mirror gathers past pages from this same phase." />
          {cycleDay ? <Pattern title={`Day ${cycleDay} of your cycle`} detail="See the through-line across the months." /> : null}
        </div>
      ) : (
        <Empty>Once you have written across a cycle, the mirror shows you what this same phase felt like before — a quiet through-line.</Empty>
      )}
    </div>
  );
}

// ── TONIGHT · the dusk close-out; direct-on-card = close the day (seeds composer) ──
function TonightCard({ phase, onWriteSeeded }) {
  const prompt = TONIGHT_LINE(phase);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ background: `linear-gradient(135deg, ${T.dusk} 0%, ${T.muted} 100%)`, borderRadius: 14, padding: "20px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Moon size={14} style={{ color: T.blush }} />
          <Eyebrow color="#D3C3BB">Tonight{"’"}s reflection · 90 seconds</Eyebrow>
        </div>
        <Script size={26} color="#F6ECE0" carve={false} style={{ marginBottom: 16 }}>{prompt}</Script>
        <button onClick={() => onWriteSeeded(`${prompt}\n\n`, "reflection")} style={{
          marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
          background: "transparent", border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
          fontFamily: SERIF, fontWeight: 600, fontStyle: "italic", fontSize: 18, color: "#F4E9DE",
          borderBottom: "1px solid rgba(244,233,222,0.5)",
        }}>
          Close the day <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── small shared bits ────────────────────────────────────────────────────────
function Pattern({ title, detail }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ width: 6, borderRadius: 999, background: T.sage, flex: "none" }} />
      <div>
        <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 1 }}>{detail}</div>
      </div>
    </div>
  );
}
function Empty({ children }) {
  return (
    <div style={{ border: `1px dashed ${T.paperDeep}`, borderRadius: 12, padding: "14px 13px" }}>
      <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

// In-sheet picker shown when Threads is opened with no thread selected — reuses the
// real ThreadView once a thread is chosen.
function ThreadsPicker({ threads, onPick, onWrite, onNewThread }) {
  const list = (threads || []).filter(Boolean);
  const [newName, setNewName] = useState("");
  const exists = (n) => list.some((t) => (t.name || "").trim().toLowerCase() === n.trim().toLowerCase());
  const startNew = () => {
    const n = newName.trim();
    if (!n) return;
    if (exists(n)) { onPick(list.find((t) => (t.name || "").trim().toLowerCase() === n.toLowerCase()).name); return; }
    (onNewThread || onWrite)(n);   // open the composer seeded with this new series name
  };
  // The "start a new series" namer — explicit create path (name it here, write the first
  // page into it). Shown in BOTH the empty and populated states so a new thread is always
  // one tap away, not hidden inside the general composer.
  const Namer = (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "13px 14px", marginBottom: 16 }}>
      <Eyebrow mb={8}>Start a new series</Eyebrow>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") startNew(); }}
          placeholder="Name it — e.g. sleep, becoming, the hard stuff"
          style={{ flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 8, padding: "10px 12px", fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none", boxSizing: "border-box" }}
        />
        <button onClick={startNew} disabled={!newName.trim()} style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, background: newName.trim() ? T.crimson : T.paperDeep,
          color: T.paper, border: "none", borderRadius: 8, padding: "0 14px", cursor: newName.trim() ? "pointer" : "default",
          fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
        }}>
          <Feather size={13} /> Start
        </button>
      </div>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 8, lineHeight: 1.4 }}>
        Names the series and opens a page in it — write your first line and it{"’"}s kept here.
      </div>
    </div>
  );
  if (list.length === 0) {
    return (
      <div style={{ padding: "10px 4px" }}>
        <Eyebrow mb={8}>Threads</Eyebrow>
        <Script size={28} style={{ marginBottom: 6 }}>Start your first series</Script>
        <Hand size={16} color={T.inkSoft} style={{ marginBottom: 16 }}>
          A thread gathers pages on one idea over time — name one below, or add a tag whenever you write.
        </Hand>
        {Namer}
      </div>
    );
  }
  return (
    <div>
      {Namer}
      <Eyebrow mb={12}>Series you are keeping</Eyebrow>
      <div style={{ display: "grid", gap: 8 }}>
        {list.map((t) => (
          <button key={t.name} onClick={() => onPick(t.name)} style={{
            width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
            background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "13px 15px", cursor: "pointer",
          }}>
            <Hash size={15} style={{ color: T.gold, flexShrink: 0 }} />
            <span style={{ flex: 1, fontFamily: SERIF, fontSize: 16, color: T.ink }}>{t.name}</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontWeight: 700 }}>{t.count}</span>
            <ChevronRight size={15} style={{ color: T.muted, flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

const chipBtn = {
  display: "inline-flex", alignItems: "center", gap: 6, background: T.wax,
  border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 11px 6px 9px", cursor: "pointer",
};
const primaryChip = {
  width: "100%", marginTop: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "12px 16px",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
};
const ghostChip = {
  width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: "transparent", color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 16px",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
};
