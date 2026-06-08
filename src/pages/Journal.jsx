import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { Feather, AlignJustify, X } from "lucide-react";
import NewEntrySheet from "../components/journal/NewEntrySheet";
import JournalInsightsTab from "../components/journal/JournalInsightsTab";
import PromptCarousel from "../components/journal/PromptCarousel";
import CycleMirror from "../components/journal/CycleMirror";
import JournalLedger from "../components/journal/JournalLedger";
import ThreadView from "../components/journal/ThreadView";
import EntryReader from "../components/journal/EntryReader";
import TonightReflection from "../components/journal/TonightReflection";
import InsightTeaser from "../components/journal/InsightTeaser";
import JournalSearch from "../components/journal/JournalSearch";
import SealedLettersSection from "../components/journal/sealed/SealedLettersSection";
import ShareAsEchoSheet from "../components/journal/echo/ShareAsEchoSheet";
import JournalHubSheet from "../components/journal/JournalHubSheet";
import { collectThreads, entriesInThread } from "../components/journal/threads";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";
import {
  PAPER_BG, InkFilter, EditorialFooter, useEditorialFonts,
  T, UI, HAND, PRESS, Script, Hand, Eyebrow, Rule, Heart,
} from "../components/journal/Editorial";

// ── Filter types ──────────────────────────────────────────────────────────────
const CORE_FILTERS = [
  { id: "all",          label: "All" },
  { id: "free",         label: "Free" },
  { id: "gratitude",    label: "Gratitude" },
  { id: "mood",         label: "Mood" },
  { id: "reflection",   label: "Reflection" },
  { id: "affirmation",  label: "Affirmation" },
  { id: "todo",         label: "Todo" },
  { id: "dream",        label: "Dream" },
];

const WHOLENESS_FILTERS = [
  { id: "relationships", label: "Relationships" },
  { id: "career",        label: "Career" },
  { id: "creativity",    label: "Creativity" },
  { id: "money",         label: "Money" },
  { id: "grief",         label: "Grief" },
  { id: "joy",           label: "Joy" },
  { id: "identity",      label: "Identity" },
];

const FILTER_TYPES = [...CORE_FILTERS, ...WHOLENESS_FILTERS];
const WHOLENESS_TYPES = new Set(WHOLENESS_FILTERS.map((f) => f.id));

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
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Row 1 — editorial bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 18, fontWeight: 700, color: "var(--plum)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            The Journal
          </div>
          <div style={{
            fontSize: 10, color: "var(--mauve)",
            letterSpacing: 0.5, marginTop: 1, opacity: 0.75,
          }}>
            {phaseWord}{cycleDay ? ` · Day ${cycleDay}` : ""} · {dateLine}
          </div>
        </div>
        {/* Write CTA */}
        <button
          onClick={onWrite}
          aria-label="New entry"
          style={{
            background: "var(--plum)", border: "none", borderRadius: 8,
            padding: "8px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}
        >
          <Feather size={15} style={{ color: "var(--surface)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--surface)", letterSpacing: 0.3 }}>
            Write
          </span>
        </button>
        {/* Hub button */}
        <button
          onClick={onOpenHub}
          aria-label="Open journal menu"
          style={{
            background: "transparent", border: "1px solid var(--border)",
            borderRadius: 8, width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <AlignJustify size={17} style={{ color: "var(--plum)" }} />
        </button>
      </div>
      {/* Row 2 — season strip */}
      {season && (
        <div style={{
          background: "var(--ivory)", padding: "5px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 11, color: "var(--mauve)", letterSpacing: 0.5 }}>
            {season.name} · {season.line}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Filter pill bar ────────────────────────────────────────────────────────────
function FilterBar({ filterType, onChange }) {
  return (
    <>
      <style>{`.jfilter-scroll::-webkit-scrollbar{display:none}`}</style>
      <div style={{ marginBottom: 4 }}>
        {/* Core types */}
        <div className="jfilter-scroll" style={{
          display: "flex", gap: 6, overflowX: "auto",
          paddingBottom: 4, scrollbarWidth: "none",
        }}>
          {CORE_FILTERS.map((f) => (
            <button key={f.id} onClick={() => onChange(f.id)} style={{
              flexShrink: 0, borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontWeight: 700,
              fontFamily: UI, border: `1px solid ${filterType === f.id ? T.ink : T.paperDeep}`,
              cursor: "pointer", letterSpacing: 0.4, textTransform: "uppercase",
              backgroundColor: filterType === f.id ? T.ink : "transparent",
              color: filterType === f.id ? T.paper : T.muted,
            }}>{f.label}</button>
          ))}
        </div>
        {/* Wholeness types — second row, slightly smaller */}
        <div className="jfilter-scroll" style={{
          display: "flex", gap: 5, overflowX: "auto",
          paddingBottom: 4, paddingTop: 6, scrollbarWidth: "none",
        }}>
          {WHOLENESS_FILTERS.map((f) => (
            <button key={f.id} onClick={() => onChange(f.id)} style={{
              flexShrink: 0, borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 700,
              fontFamily: UI, border: `1px solid ${filterType === f.id ? T.gold : T.paperDeep}`,
              cursor: "pointer", letterSpacing: 0.3,
              backgroundColor: filterType === f.id ? T.gold : "transparent",
              color: filterType === f.id ? T.paper : T.muted,
            }}>{f.label}</button>
          ))}
        </div>
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

  const handleSaved = (entry) => {
    if (!entry) return;
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
      return [entry, ...prev];
    });
  };

  const handleDelete = async (entry) => {
    try {
      await base44.entities.JournalEntries.delete(entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (err) { console.error("Delete entry failed:", err); }
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
    if (id === "letters")         { setShowSealedLetters(true); return; }
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
      />

      {/* ── Echo sheet ── */}
      {showShareEcho && user && (
        <ShareAsEchoSheet
          user={user} profile={profile} phase={phase}
          cycleDay={cycleDay} lifeStage={profile?.life_stage || null}
          seedText="" onClose={() => setShowShareEcho(false)}
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
                  <div style={{ marginTop: 16 }}>
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