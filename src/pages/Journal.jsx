import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { Feather, X, ChevronDown, ChevronUp } from "lucide-react";
import NewEntrySheet from "../components/journal/NewEntrySheet";
import JournalInsightsTab from "../components/journal/JournalInsightsTab";
import PromptCarousel from "../components/journal/PromptCarousel";
import JessNudge from "@/components/jess/JessNudge";
import CycleMirror from "../components/journal/CycleMirror";
import JournalLedger from "../components/journal/JournalLedger";
import ThreadView from "../components/journal/ThreadView";
import EntryReader from "../components/journal/EntryReader";
import FourLivesChooser from "../components/journal/FourLivesChooser";
import TonightReflection from "../components/journal/TonightReflection";
import InsightTeaser from "../components/journal/InsightTeaser";
import JournalSearch from "../components/journal/JournalSearch";
import SealedLettersSection from "../components/journal/sealed/SealedLettersSection";
import SealedLetterCompose from "../components/journal/sealed/SealedLetterCompose";
import ShareAsEchoSheet from "../components/journal/echo/ShareAsEchoSheet";
import AskForWitnessSheet from "../components/journal/witness/AskForWitnessSheet";
import WitnessInbox from "../components/journal/witness/WitnessInbox";
import PhaseTwin from "../components/journal/twin/PhaseTwin";
import JournalHubSheet from "../components/journal/JournalHubSheet";
import JumpToButton from "@/components/layout/JumpToButton";
import { collectThreads, entriesInThread } from "../components/journal/threads";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";
import {
  PAPER_BG, InkFilter, EditorialFooter, useEditorialFonts,
  T, UI, SCRIPT, HAND, PRESS, Script, Hand, Eyebrow, Rule, Heart,
} from "../components/journal/Editorial";

// ── Filter taxonomy — mirrors the compose sheet (FORMAT vs TOPIC), so the ledger
//    filter is ONE coherent system, not a redundant third one. ──────────────────
const FORMAT_FILTERS = [
  { id: "all",       label: "All" },
  { id: "free",      label: "Notes" },
  { id: "gratitude", label: "Gratitude" },
  { id: "mood",      label: "Mood" },
  { id: "todo",      label: "To-do" },
];
const TOPIC_FILTERS = [
  { id: "reflection",   label: "Reflection" },
  { id: "affirmation",  label: "Affirmation" },
  { id: "dream",        label: "Dream" },
  { id: "relationships", label: "Relationships" },
  { id: "career",       label: "Career" },
  { id: "creativity",   label: "Creativity" },
  { id: "money",        label: "Money" },
  { id: "grief",        label: "Grief" },
  { id: "joy",          label: "Joy" },
  { id: "identity",     label: "Identity" },
];
const TOPIC_FILTER_IDS = new Set(TOPIC_FILTERS.map((f) => f.id));
const WHOLENESS_TYPES = new Set(["relationships", "career", "creativity", "money", "grief", "joy", "identity"]);

// ── Phase -> season ────────────────────────────────────────────────────────────
const PHASE_SEASON = {
  menstrual:  { name: "Inner Winter",  line: "Soft pace. The body is doing the work." },
  follicular: { name: "Inner Spring",  line: "Something new wants to begin." },
  ovulatory:  { name: "Inner Summer",  line: "Your voice carries today." },
  luteal:     { name: "Inner Autumn",  line: "Boundaries feel natural now." },
};

// ── Cycle-count rhythm ─────────────────────────────────────────────────────────
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

function cycleDayOf(profile) {
  if (!profile?.last_period_start_date) return null;
  try { return computeCycleDay(profile).cycleDay; } catch { return null; }
}

function getCurrentPhase(profile) {
  if (!profile?.last_period_start_date) return null;
  return computeCycleDay(profile).phase;
}

// ── Sticky masthead (now compact) ─────────────────────────────────────────────
function StickyHeader({ phase, season, cycleDay, onWrite, onOpenHub }) {
  const phaseWord = phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Journal";
  const dateLine = format(new Date(), "d MMMM").toUpperCase();
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "rgba(244,239,227,0.97)", backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: `1px solid ${T.paperDeep}`,
    }}>
      {/* Row 1 — editorial bar (H1: editorial tokens + script title) */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 16px", gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: SCRIPT, fontWeight: 400, fontSize: 27, lineHeight: 1.05, color: T.ink,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            The Journal
          </div>
          <div style={{
            fontFamily: UI, fontSize: 10, color: T.muted, fontWeight: 600,
            letterSpacing: 0.5, marginTop: 1,
          }}>
            {phaseWord}{cycleDay ? ` · Day ${cycleDay}` : ""} · {dateLine}
          </div>
        </div>
        {/* Write CTA */}
        <button
          onClick={onWrite}
          aria-label="New entry"
          style={{
            background: T.ink, border: "none", borderRadius: 8,
            padding: "8px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}
        >
          <Feather size={15} style={{ color: T.paperHi }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.paperHi, letterSpacing: 0.3 }}>
            Write
          </span>
        </button>
        {/* Hub button — shared "Jump to" pill (identical chrome across pages) */}
        <JumpToButton onClick={onOpenHub} />
      </div>
      {/* Row 2 — season strip */}
      {season && (
        <div style={{
          background: T.paper, padding: "5px 16px",
          borderTop: `1px solid ${T.paperDeep}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.5 }}>
            {season.name} · {season.line}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Filter pill bar ────────────────────────────────────────────────────────────
function FilterBar({ filterType, onChange }) {
  // One coherent system: a FORMAT row (always) + a collapsible TOPICS row — mirrors
  // the compose sheet, so the ledger filter isn't a redundant third taxonomy.
  const [topicsOpen, setTopicsOpen] = useState(() => TOPIC_FILTER_IDS.has(filterType));
  const pill = (f) => (
    <button key={f.id} onClick={() => onChange(f.id)} style={{
      flexShrink: 0, borderRadius: 9999, padding: "6px 13px", fontSize: 11.5, fontWeight: 700,
      fontFamily: UI, border: `1px solid ${filterType === f.id ? T.ink : T.paperDeep}`,
      cursor: "pointer", letterSpacing: 0.4, textTransform: "uppercase", whiteSpace: "nowrap",
      backgroundColor: filterType === f.id ? T.ink : "transparent",
      color: filterType === f.id ? T.paper : T.muted,
    }}>{f.label}</button>
  );
  return (
    <>
      <style>{`.jfilter-scroll::-webkit-scrollbar{display:none}`}</style>
      <div style={{ marginBottom: 4 }}>
        <div className="jfilter-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", alignItems: "center" }}>
          {FORMAT_FILTERS.map(pill)}
          <button onClick={() => setTopicsOpen((v) => !v)} style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, background: "transparent",
            border: `1px solid ${T.paperDeep}`, borderRadius: 9999, padding: "6px 12px",
            fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
            color: TOPIC_FILTER_IDS.has(filterType) ? T.ink : T.muted, cursor: "pointer", whiteSpace: "nowrap",
          }}>Topics {topicsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</button>
        </div>
        {topicsOpen && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 8 }}>
            {TOPIC_FILTERS.map(pill)}
          </div>
        )}
      </div>
    </>
  );
}

// ── Wholeness witness note (only when a Wholeness filter is active) ────────────
const WITNESS = {
  grief:         "Grief has no timeline. I am not here to move you through it — only to sit with you in it.",
  identity:      "There is no right answer here. I am not observing you — I am holding space for the person you are still becoming.",
  money:         "Money is not a moral story. What you write here stays here, and I will not conflate your worth with your numbers.",
  relationships: "Relationships are rarely simple. Write the complicated truth — I am not here to advise, only to witness.",
  career:        "Ambition and exhaustion can live in the same body. What you feel about your work is allowed to be contradictory.",
  creativity:    "Nothing you make here needs to be good. The making is the point.",
  joy:           "Joy is allowed to exist without justification. Let this be easy.",
};

function WitnessNote({ type }) {
  if (!WITNESS[type]) return null;
  return (
    <div style={{
      marginBottom: 16, padding: "14px 18px",
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3,
    }}>
      <Eyebrow mb={6}>A note from Jess</Eyebrow>
      <Hand size={17} color={T.inkSoft} carve={false}>{WITNESS[type]}</Hand>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────────
export default function Journal() {
  useEditorialFonts();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // UI state
  const [showInsights, setShowInsights] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [threadFilter, setThreadFilter] = useState(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [readEntry, setReadEntry] = useState(null);
  const [seedText, setSeedText] = useState("");
  const [seedType, setSeedType] = useState(null);
  const [seedThread, setSeedThread] = useState("");
  const [searching, setSearching] = useState(false);
  const [showShareEcho, setShowShareEcho] = useState(false);
  const [showSealedLetters, setShowSealedLetters] = useState(false);
  const [deleteErr, setDeleteErr] = useState(false);   // brief notice if a delete fails
  const [showWitnessInbox, setShowWitnessInbox] = useState(false);
  const [showAskWitness, setShowAskWitness] = useState(false);
  const [witnessEntry, setWitnessEntry] = useState(null);
  const [showTwin, setShowTwin] = useState(false);   // Phase Twin (Q4, flag-gated)
  // "One entry, four lives" — the unified chooser + its echo/seal seeds.
  const sealedRef = useRef(null);   // M2: scroll the inline Sealed Letters section into view when hub-opened
  const [chooseEntry, setChooseEntry] = useState(null);   // entry whose fate is being chosen
  const [echoSeed, setEchoSeed] = useState(null);         // { text, sourceId } seeded into the Echo sheet
  const [sealSeed, setSealSeed] = useState(null);         // string seeded into the Sealed-letter composer

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
        setProfile(profiles[0] || null);
      } catch (err) {
        console.error("Journal page init failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // W4 — deep-link: open the Witness inbox or Phase Twin directly from another
  // surface (e.g. Community) via /Journal?open=witness | ?open=twin. Reuses the
  // existing overlays; the param is read once on mount.
  useEffect(() => {
    try {
      const open = new URLSearchParams(window.location.search).get("open");
      if (open === "witness") setShowWitnessInbox(true);
      else if (open === "twin") setShowTwin(true);
    } catch { /* ignore */ }
  }, []);

  const phase = getCurrentPhase(profile);
  const cycleDay = cycleDayOf(profile);
  const season = phase ? PHASE_SEASON[phase] : null;
  const cycleCount = entriesThisCycle(entries, profile);
  const threads = collectThreads(entries);

  const matching = filterType === "all" ? entries : entries.filter((e) => e.card_type === filterType);
  const ledgerEntries = [...matching.filter((e) => e.is_pinned), ...matching.filter((e) => !e.is_pinned)];
  const threadMatches = threadFilter ? entriesInThread(entries, threadFilter) : [];
  const threadEntries = [...threadMatches.filter((e) => e.is_pinned), ...threadMatches.filter((e) => !e.is_pinned)];

  // ── seed helpers ──
  const openBlank = () => { setSeedText(""); setSeedType(null); setSeedThread(""); setShowNewEntry(true); };
  const openSeeded = (text, type = null) => { setSeedText(text || ""); setSeedType(type); setSeedThread(""); setShowNewEntry(true); };
  const openInThread = (thread) => { setSeedText(""); setSeedType(null); setSeedThread(thread || ""); setShowNewEntry(true); };
  const replyToPast = () => openSeeded("Replying to who I was…\n\n", "reflection");
  const closeComposer = () => { setShowNewEntry(false); setEditEntry(null); setSeedText(""); setSeedType(null); setSeedThread(""); };

  // Connectivity P1 — deep-link: open the composer seeded from another surface
  // (a read, a horoscope, an insight) via /Journal?compose=1&seed=…&type=…
  const composeSeedDone = useRef(false);
  useEffect(() => {
    if (composeSeedDone.current) return;
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("compose") === "1") {
        composeSeedDone.current = true;
        const seed = sp.get("seed") || "";
        const type = sp.get("type") || null;
        openSeeded(seed ? decodeURIComponent(seed) : "", type);
      }
    } catch { /* ignore */ }
  });

  const handleSaved = (entry) => {
    if (!entry) return;
    const wasNew = !entries.some((e) => e.id === entry.id);
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
      return [entry, ...prev];
    });
    // After WRITING a new entry, offer the four lives. Locked stays the default —
    // nothing leaves the journal unless she picks a door.
    if (wasNew && (entry.text || "").trim()) setChooseEntry(entry);
  };

  const handleDelete = async (entry) => {
    try {
      await base44.entities.JournalEntries.delete(entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));   // remove only after the delete succeeds — a failed delete keeps the entry
    } catch (err) {
      console.error("Delete entry failed:", err);
      setDeleteErr(true); setTimeout(() => setDeleteErr(false), 3500);   // tell her instead of failing silently
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

  // Hub selection handler
  const handleHubSelect = (id) => {
    if (id === "insights")        { setShowInsights(true); return; }
    if (id === "doctor")          { navigate("/DoctorExport"); return; }
    if (id === "echo")            { setShowShareEcho(true); return; }
    if (id === "witness")         { setShowWitnessInbox(true); return; }
    if (id === "twin")            { setShowTwin(true); return; }
    if (id === "letters")         { setShowSealedLetters(true); setTimeout(() => sealedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); return; }   // M2
    if (id === "threads")         { /* scroll into view below */ return; }
    if (id.startsWith("thread:")) { setThreadFilter(id.replace("thread:", "")); return; }
  };

  // ── loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ ...PAPER_BG }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "rgba(168,137,63,0.25)", borderTopColor: T.gold }} />
    </div>
  );

  if (error && !user) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ ...PAPER_BG }}>
      <InkFilter />
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <Eyebrow mb={10}>The Journal</Eyebrow>
        <Script size={40} style={{ marginBottom: 10 }}>A quiet moment</Script>
        <Hand size={20} color={T.inkSoft}>
          We could not open your journal just now. Check your connection and try again.
        </Hand>
        <button onClick={() => window.location.reload()} style={{
          marginTop: 20, background: "transparent", border: `1px solid ${T.gold}`, padding: "10px 24px",
          cursor: "pointer", fontFamily: HAND, fontWeight: 600, fontSize: 18, color: T.ink,
          textShadow: PRESS, borderRadius: 3,
        }}>Try again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ position: "relative", ...PAPER_BG }}>
      <InkFilter />
      {deleteErr && (
        <div role="alert" style={{
          position: "fixed", left: "50%", bottom: 90, transform: "translateX(-50%)", zIndex: 4000,
          padding: "9px 16px", borderRadius: 9999, fontFamily: UI, fontSize: 13, fontWeight: 700,
          color: T.paper, background: T.crimson || "#A84E56", boxShadow: PRESS,
        }}>Couldn{"’"}t delete that just now — the entry is still here. Try again.</div>
      )}

      {/* ── Sticky header ── */}
      <StickyHeader
        phase={phase}
        season={season}
        cycleDay={cycleDay}
        onWrite={openBlank}
        onOpenHub={() => setShowHub(true)}
      />

      {/* ── Hub sheet ── */}
      <JournalHubSheet
        open={showHub}
        onClose={() => setShowHub(false)}
        onSelect={handleHubSelect}
        threads={threads}
      />

      {/* ── Composer ── */}
      {(showNewEntry || editEntry) && user && (
        <NewEntrySheet
          user={user} phase={phase} cycleDay={cycleDay}
          editEntry={editEntry} seedText={seedText}
          seedCardType={seedType} seedThread={seedThread}
          threads={threads.map((t) => t.name)}
          onClose={closeComposer} onSaved={handleSaved}
        />
      )}

      {/* ── Entry reader ── */}
      <EntryReader
        entry={readEntry} profile={profile} phase={phase}
        onClose={() => setReadEntry(null)}
        onEdit={handleEditFromReader}
        onDelete={handleDelete} onPin={handlePin}
        onShare={(entry) => { setChooseEntry(entry); setReadEntry(null); }}
      />

      {/* ── One entry, four lives (the unified chooser) ── */}
      {chooseEntry && (
        <FourLivesChooser
          entry={chooseEntry}
          onClose={() => setChooseEntry(null)}
          onEcho={() => { setEchoSeed({ text: chooseEntry.text || "", sourceId: chooseEntry.id || null }); setShowShareEcho(true); setChooseEntry(null); }}
          onSeal={() => { setSealSeed(chooseEntry.text || ""); setChooseEntry(null); }}
          onWitness={() => { setWitnessEntry(chooseEntry); setShowAskWitness(true); setChooseEntry(null); }}
        />
      )}

      {/* ── Echo sheet (seeded when opened from the chooser) ── */}
      {showShareEcho && user && (
        <ShareAsEchoSheet
          user={user} profile={profile} phase={phase}
          cycleDay={cycleDay} lifeStage={profile?.life_stage || null}
          seedText={echoSeed?.text || ""} sourceEntryId={echoSeed?.sourceId || null}
          onClose={() => { setShowShareEcho(false); setEchoSeed(null); }}
        />
      )}

      {/* ── Sealed-letter composer (seeded when sealing from the chooser) ── */}
      {sealSeed !== null && user && (
        <SealedLetterCompose
          profile={profile} seedBody={sealSeed}
          onClose={() => setSealSeed(null)}
          onSealed={() => setSealSeed(null)}
        />
      )}

      {/* ── Witness Mode (Q3) ── */}
      {showAskWitness && user && (
        <AskForWitnessSheet
          user={user} phase={phase} profile={profile} entry={witnessEntry}
          onClose={() => { setShowAskWitness(false); setWitnessEntry(null); }}
          onOpenInbox={() => { setShowAskWitness(false); setWitnessEntry(null); setShowWitnessInbox(true); }}
        />
      )}
      {showTwin && user && (
        <PhaseTwin
          user={user} phase={phase} profile={profile}
          onClose={() => setShowTwin(false)}
        />
      )}
      {showWitnessInbox && user && (
        <WitnessInbox
          user={user} phase={phase} profile={profile}
          onClose={() => setShowWitnessInbox(false)}
        />
      )}

      {/* ── Insights overlay ── */}
      {showInsights && user && (
        <div
          onClick={() => setShowInsights(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 75,
            background: "rgba(51,41,28,0.42)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            overflowY: "auto", padding: 0,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ ...PAPER_BG, width: "100%", maxWidth: 680, minHeight: "100%", boxShadow: "0 8px 40px rgba(51,41,28,0.20)" }}
          >
            <InkFilter />
            <div style={{
              position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "16px 20px",
              background: T.paper, borderBottom: `1px solid ${T.paperDeep}`,
            }}>
              <Eyebrow>Insights · The shape of your writing</Eyebrow>
              <button onClick={() => setShowInsights(false)} aria-label="Close insights" style={{
                background: "transparent", border: "none", cursor: "pointer", color: T.muted,
                padding: 0, display: "inline-flex",
              }}><X size={20} /></button>
            </div>
            <div style={{ padding: "8px 16px 40px" }}>
              <JournalInsightsTab user={user} entries={entries} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* Masthead — editorial byline below the header */}
        <div style={{ marginBottom: 24 }}>
          <Eyebrow mb={8}>A publication of one</Eyebrow>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <Script size={54} style={{ width: "auto" }}>
              {phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Journal"}
            </Script>
            {season && (
              <Hand size={26} color={T.inkSoft} style={{ width: "auto" }}>{season.name}</Hand>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <Rule w={24} c={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 1.2, fontWeight: 600 }}>
              {cycleDay ? `DAY ${cycleDay} · ` : ""}{format(new Date(), "d MMMM").toUpperCase()}
            </span>
            <Heart size={14} style={{ marginLeft: 2 }} />
          </div>
          {cycleCount.count > 0 && (
            <Hand size={19} color={T.inkSoft} carve={false} style={{ marginTop: 10 }}>
              {cycleCount.count} {cycleCount.label} — you{"'"}re building a pattern.
            </Hand>
          )}
        </div>

        {/* Insight teaser */}
        {!threadFilter && entries.length > 0 && (
          <InsightTeaser entries={entries} onOpen={() => setShowInsights(true)} />
        )}

        {/* Thread view */}
        {threadFilter && (
          <ThreadView
            thread={threadFilter} entries={threadEntries}
            onBack={() => setThreadFilter(null)}
            onTap={(e) => setReadEntry(e)}
            onWrite={openInThread}
          />
        )}

        {/* Main feed */}
        {!threadFilter && (
          <>
            {/* Search */}
            {entries.length > 0 && (
              <JournalSearch
                entries={entries}
                onTap={(e) => setReadEntry(e)}
                onThread={(t) => setThreadFilter(t)}
                onSearchingChange={setSearching}
              />
            )}

            {!searching && (
              <>
                {/* Prompt carousel */}
                {user && (
                  <JessErrorBoundary variant="quiet" label="PromptCarousel">
                    <PromptCarousel
                      user={user} profile={profile} phase={phase} cycleDay={cycleDay}
                      lastEntry={entries[0] || null}
                      onWrite={(p) => openSeeded(`${p}\n\n`)}
                    />
                  </JessErrorBoundary>
                )}

                {/* Cycle mirror */}
                {entries.length > 0 && (
                  <CycleMirror
                    entries={entries} profile={profile} phase={phase}
                    todayCycleDay={cycleDay} onReply={replyToPast}
                  />
                )}

                <JessNudge
                  id="journal-community-v1"
                  line="You don't have to carry it alone. Others in your season are here too, anonymously, whenever you want them."
                  to="Community"
                  actionLabel="Step into Community"
                />

                {/* Filter bar — two rows (core + wholeness) */}
                <div style={{ marginBottom: 16, marginTop: 8 }}>
                  <FilterBar filterType={filterType} onChange={setFilterType} />
                </div>

                {/* Wholeness witness note */}
                {WHOLENESS_TYPES.has(filterType) && <WitnessNote type={filterType} />}

                {/* Empty state */}
                {entries.length === 0 && (
                  <div style={{ textAlign: "center", paddingTop: 30, paddingBottom: 30 }}>
                    <Eyebrow mb={10}>Your first page</Eyebrow>
                    <Script size={34} style={{ marginBottom: 10 }}>A publication of one</Script>
                    <Hand size={19} color={T.inkSoft} style={{ marginBottom: 22 }}>
                      Nothing here yet. Begin with a line — it is locked to you, always.
                    </Hand>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      {["Free write", "Gratitude", "Reflection", "Relationships", "Grief", "Joy"].map((label) => (
                        <button key={label} onClick={openBlank} style={{
                          background: "transparent", border: `1px solid ${T.gold}`, borderRadius: 3,
                          padding: "9px 16px", cursor: "pointer",
                          fontFamily: HAND, fontSize: 16, fontWeight: 600,
                          color: T.ink, textShadow: PRESS,
                        }}>{label}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ledger */}
                {ledgerEntries.length > 0 && (
                  <JournalLedger entries={ledgerEntries} onTap={(e) => setReadEntry(e)} onThread={(t) => setThreadFilter(t)} />
                )}

                {ledgerEntries.length === 0 && entries.length > 0 && (
                  <div style={{ textAlign: "center", padding: "30px 20px 46px" }}>
                    <Hand size={19} color={T.inkSoft}>No {filterType} entries yet.</Hand>
                  </div>
                )}

                {/* Tonight's reflection */}
                <TonightReflection phase={phase} onWrite={(p) => openSeeded(`${p}\n\n`, "reflection")} />

                {/* Sealed letters (shown inline when hub-opened, otherwise hidden here) */}
                {showSealedLetters && (
                  <div ref={sealedRef} style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <Eyebrow>Sealed Letters</Eyebrow>
                      <button onClick={() => setShowSealedLetters(false)} style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: T.muted, padding: 0, display: "inline-flex",
                      }}><X size={18} /></button>
                    </div>
                    <SealedLettersSection user={user} profile={profile} />
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div style={{ marginTop: 40 }}>
          <EditorialFooter />
        </div>
      </div>
    </div>
  );
}