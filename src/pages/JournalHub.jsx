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
  Sprout, X, Check,
} from "lucide-react";
import {
  T, UI, SERIF, Eyebrow, Rule, Hand, Heart, Script, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { HubSheet } from "@/components/nutrition/hub/HubShell";
import { VineMotifV2, floraKeyframes, Butterfly, SwayBloom } from "@/components/brand/flora";
import JumpToButton from "@/components/layout/JumpToButton";
import { collectThreads, entriesInThread } from "@/components/journal/threads";
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
import JournalHubSheet from "@/components/journal/JournalHubSheet";
// v4 REDESIGN (approved 2026-06-21): flora hero + ONE summary card + the §6.10 clipboard slider + the §6.7.6 quick-line popup. Every surface (write/echo/witness/twin/threads/sealed letters/mirror/on-this-day/insights/tonight) opens its FULL real component via the kept sheets — no feature lost, no new function.
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { useScrollLock } from "@/utils/useScrollLock";

const COL = 430;     // phone column (matches NutritionHub)

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
  const [quickLine, setQuickLine] = useState(false);   // §6.7.6 quick-line popup

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
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120, position: "relative" }}>
      <InkFilter />
      {/* botanical page texture — one low-opacity vine per fold, clipped (no horizontal scroll),
          behind content, never over text (BRAND_IDENTITY §4/§6.2). */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <style>{floraKeyframes}</style>
        <div style={{ position: "absolute", top: 150, right: -26 }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 720, left: -28 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.08} w={140} flip /></div>
        <div style={{ position: "absolute", top: 1320, right: -24 }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.08} w={140} /></div>
      </div>

      {deleteErr && (
        <div role="alert" style={{
          position: "fixed", left: "50%", bottom: 90, transform: "translateX(-50%)", zIndex: 4000,
          padding: "9px 16px", borderRadius: 9999, fontFamily: UI, fontSize: 13, fontWeight: 700,
          color: T.paper, background: T.crimson,
        }}>Couldn{"’"}t delete that just now — the entry is still here. Try again.</div>
      )}

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── DAILY HUB header — rich summary, wired to real data ───────────── */}
        <JumpToButton pinned onClick={() => setHubMenuOpen(true)} />
        {/* ── v4 SIGNATURE TOP — the §6.8 flora hero (carved heart + bloom-in-ring) ── */}
        <header style={{ padding: "12px 18px 2px" }}>
          <div style={{ textAlign: "center" }}>
            <Eyebrow mb={4}>
              {firstName ? `${greeting}, ${firstName}` : greeting}{phaseWord ? ` · ${phaseWord}` : ""}{phaseWord && cycleDay ? ` · Day ${cycleDay}` : ""}{` · ${format(new Date(), "d MMMM").toUpperCase()}`}
            </Eyebrow>
          </div>
          <JournalHero season={season} />
        </header>

        {/* ── ONE summary card — signal-driven rows, each taps to the exact target (§6.8) ── */}
        <div style={{ padding: "16px 16px 0" }}>
          <SummaryCard eyebrow="Your pages, today" accent={T.gold} rows={[
            lastEntry ? { Icon: Feather, label: `Last entry · ${relativeDate(lastEntry)}`, text: entryPreview(lastEntry), onClick: () => setReadEntry(lastEntry) } : null,
            onThisDay.length > 0 ? { Icon: CalendarHeart, label: "On this day", text: entryPreview(onThisDay[0]), onClick: () => openSurface("onthisday") } : null,
            { Icon: BarChart2, label: weekCount > 0 ? `${weekCount} ${weekCount === 1 ? "entry" : "entries"} this week` : "A fresh page this week", text: cycleCount.count > 0 ? `${cycleCount.count} ${cycleCount.label} — you're building a pattern.` : "Whenever you're ready — a line is plenty.", onClick: () => openSurface("insights") },
          ].filter(Boolean)} />
        </div>

        {/* ── COMPACT SPINE — a §6.10 CLIPBOARD SLIDER of journal spaces. Slide SIDEWAYS between boards
            instead of scrolling down a long list; every tile opens the FULL real surface, so every
            feature is preserved (write · echo · witness · twin · threads · sealed letters · mirror ·
            on-this-day · insights · tonight). Uniform 365×488 boards. */}
        <div style={{ padding: "18px 16px 0" }}>
          <Hand size={15} color={T.muted} style={{ display: "block", margin: "0 0 8px" }}>Your whole journal, gathered on a few boards — turn them sideways; each one opens in full.</Hand>
          <ClipboardSlider hint="Turn the page" accent={T.gold}>
            <Clipboard title="Write & reflect" sub="today's page" accent={T.crimson} flower="poppy" idx="cb-w">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <SurfaceTile Icon={Feather} label="Leave a line" sub="a quick page" accent={T.crimson} onClick={() => setQuickLine(true)} />
                <SurfaceTile Icon={Moon} label="Tonight" sub="close the day" accent={T.sage} onClick={() => openSurface("tonight")} />
                <SurfaceTile Icon={CalendarHeart} label="On this day" sub="across cycles" accent={T.gold} onClick={() => openSurface("onthisday")} />
                <SurfaceTile Icon={Moon} label="Cycle Mirror" sub="your phase echoes" accent={T.sage} onClick={() => openSurface("mirror")} />
              </div>
            </Clipboard>
            <Clipboard title="Your circle" sub="held, anonymously" accent={T.gold} flower="cornflower" idx="cb-c">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <SurfaceTile Icon={Waves} label="Echo Wall" sub="one line, anon" accent={T.gold} onClick={() => openSurface("echo")} />
                <SurfaceTile Icon={Eye} label="Witness" sub="hold or be held" accent={T.sage} onClick={() => openSurface("witness")} />
                {TWIN_ENABLED && <SurfaceTile Icon={Users} label="Phase Twin" sub="twelve days, paired" accent={T.sage} onClick={() => openSurface("twin")} />}
                <SurfaceTile Icon={Hash} label="Threads" sub="series you keep" accent={T.gold} onClick={() => openSurface("threads")} />
              </div>
            </Clipboard>
            <Clipboard title="Keep & see" sub="your archive" accent={T.sage} flower="lavender" idx="cb-k">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <SurfaceTile Icon={BarChart2} label="Insights" sub="the shape of it" accent={T.gold} onClick={() => openSurface("insights")} />
                <SurfaceTile Icon={Lock} label="Sealed Letters" sub="notes to future you" accent={T.gold} onClick={() => openSurface("letters")} />
                <SurfaceTile Icon={Sprout} label="Your garden" sub="tend it" accent={T.sage} onClick={() => navigate(createPageUrl("Garden"))} />
                <SurfaceTile Icon={Feather} label="Write a page" sub="the full composer" accent={T.crimson} onClick={openBlank} />
              </div>
            </Clipboard>
          </ClipboardSlider>
        </div>

        {/* prominent WRITE — the one clear primary action */}
        <div style={{ padding: "18px 16px 0" }}>
          <button onClick={openBlank} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: T.crimson, color: T.paper, border: "none", borderRadius: 16, padding: "16px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", boxShadow: "0 6px 18px rgba(188,46,39,0.25)" }}>
            <Feather size={19} /> Write a page
          </button>
        </div>

        {/* footer voice */}
        <footer style={{ textAlign: "center", padding: "30px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
            A publication of one — locked to you, always.
          </div>
          <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 8, letterSpacing: 0.3 }}>
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

        {quickLine && <QuickLinePopup user={user} onClose={() => setQuickLine(false)} onSaved={(e) => setEntries((prev) => [e, ...prev])} />}

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

// ── SurfaceTile — a compact §6.10 clipboard mini-tile (icon + label + sub) that opens a full surface ─
function SurfaceTile({ Icon, label, sub, accent = T.gold, onClick }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      textAlign: "left", cursor: "pointer", minHeight: 98, display: "flex", flexDirection: "column",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 14, padding: "13px 12px",
      boxShadow: "0 3px 12px rgba(58,44,26,0.08)",
    }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", marginBottom: 8 }}>
        <Icon size={16} strokeWidth={1.7} color={accent} />
      </span>
      <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{label}</span>
      <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{sub}</span>
    </button>
  );
}

// ── QuickLinePopup — the §6.7.6 quick-action popup for "Leave a line": write in place → it saves as a
//    pressed-flower entry (existing JournalEntries path, guarded; optimistic prepend). No full composer. ─
function QuickLinePopup({ user, onClose, onSaved }) {
  useScrollLock(true);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const day = (() => { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } })();
  const save = () => {
    if (!text.trim() || saved) return;
    setSaved(true);
    const optimistic = { id: "tmp-" + Date.now(), session_date: day, text: text.trim(), created_date: new Date().toISOString(), card_type: "free", card_color: "cream" };
    onSaved && onSaved(optimistic);
    if (user?.id) base44.entities.JournalEntries.create({ user_id: user.id, session_date: day, text: text.trim(), tags: ["note"], prompt: "A quick line", card_type: "free", card_color: "cream" }).catch(() => {});
    setTimeout(onClose, 1200);
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="Leave a line" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 220, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-safe"
        style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "16px 18px 24px", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.crimson }}>Journal · leave a line</span>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
        </div>
        {saved ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0 4px" }}>
            <span style={{ lineHeight: 0, display: "inline-block", animation: "fwcBreath 2.4s ease-in-out infinite" }}><SpeciesBloom name="camellia" size={42} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.4 }}>Kept — a pressed flower for today.</span>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 10px" }}>A line is enough.</h2>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={800} autoFocus placeholder="Whatever it was today…"
              style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 13px", resize: "none", fontFamily: SERIF, fontSize: 17, lineHeight: 1.5, color: T.ink, outline: "none" }} />
            <button onClick={save} disabled={!text.trim()}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", marginTop: 14, background: T.crimson, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: text.trim() ? "pointer" : "default", opacity: text.trim() ? 1 : 0.5 }}>
              <Check size={15} /> Keep it
            </button>
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, textAlign: "center", margin: "10px 0 0" }}>Saved to your journal · open the full composer any time for more.</p>
          </>
        )}
      </div>
    </div>
  );
}


// ── JournalHero — the §6.8 signature top, UPGRADED with the 64-species library (§5.4): a realistic
//    SpeciesBloom (iris — identity/voice, §5.1) swaying inside a decorative ring, a resting moth (the
//    Journal page-creature, §5.3), the carved heart (§3), the Ephesis title, flanking species. ──────
function JournalHero({ season }) {
  const ring = 214;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 6 }}>
      <style>{floraKeyframes}</style>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
        <div aria-hidden style={{ position: "absolute", top: "48%", left: "50%", width: ring + 56, height: ring + 56, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${T.gold}33 0%, ${T.sage}1F 44%, transparent 70%)`, animation: "fwcGlow 7s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "25%", left: "64%", transform: "translate(-50%,-50%)", zIndex: 3, pointerEvents: "none" }}><Butterfly size={38} color="#8E6E8E" color2={T.gold} pattern="bands" animate idx="jh-moth" /></div>
        <div style={{ position: "relative", zIndex: 1, width: ring, height: ring, display: "grid", placeItems: "center" }}>
          <svg width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`} aria-hidden style={{ position: "absolute", inset: 0 }}>
            <circle cx={ring / 2} cy={ring / 2} r={ring / 2 - 8} fill="none" stroke={T.gold} strokeWidth="1.5" opacity="0.5" strokeDasharray="2 9" strokeLinecap="round" />
            <circle cx={ring / 2} cy={ring / 2} r={ring / 2 - 20} fill="none" stroke={T.sage} strokeWidth="1" opacity="0.4" />
          </svg>
          <SwayBloom animate idx={3}><SpeciesBloom name="iris" size={150} /></SwayBloom>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: -2, flexWrap: "wrap", justifyContent: "center" }}>
        <span style={{ lineHeight: 0 }}><SpeciesBloom name="forget-me-not" size={26} /></span>
        <Heart size={16} />
        <Script size={42} carve>your journal today</Script>
        <span style={{ lineHeight: 0 }}><SpeciesBloom name="camellia" size={26} /></span>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, marginTop: 9, textAlign: "center", maxWidth: 332, lineHeight: 1.5 }}>
        {season ? `${season.name} · ${season.line}` : "Some days a single sentence is the whole harvest — set it down here, and watch it grow."}
      </div>
    </div>
  );
}
