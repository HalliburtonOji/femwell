import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { Feather, ChevronRight, Hash, Stethoscope, Waves, X } from "lucide-react";
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
import { collectThreads, entriesInThread } from "../components/journal/threads";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";
import {
  PAPER_BG, InkFilter, EditorialFooter, useEditorialFonts,
  T, UI, HAND, PRESS, Script, Hand, Eyebrow, Rule, Heart,
} from "../components/journal/Editorial";

const FILTER_TYPES = [
  { id: "all",           label: "All" },
  { id: "free",          label: "Free" },
  { id: "gratitude",     label: "Gratitude" },
  { id: "todo",          label: "Todo" },
  { id: "mood",          label: "Mood" },
  { id: "reflection",    label: "Reflection" },
  { id: "affirmation",   label: "Affirmation" },
  { id: "dream",         label: "Dream" },
  // Wholeness
  { id: "relationships", label: "Relationships" },
  { id: "career",        label: "Career" },
  { id: "creativity",    label: "Creativity" },
  { id: "money",         label: "Money" },
  { id: "grief",         label: "Grief" },
  { id: "joy",           label: "Joy" },
  { id: "identity",      label: "Identity" },
];

const WHOLENESS_TYPES = new Set(["relationships","career","creativity","money","grief","joy","identity"]);

// Phase -> Inner Season name + italic seasonal line.
const PHASE_SEASON = {
  menstrual:  { name: "Inner Winter",  line: "Soft pace. The body is doing the work." },
  follicular: { name: "Inner Spring",  line: "Something new wants to begin." },
  ovulatory:  { name: "Inner Summer",  line: "Your voice carries today." },
  luteal:     { name: "Inner Autumn",  line: "Boundaries feel natural now." },
};

// Cycle-count rhythm — kinder than streak shame for cyclical writers.
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

// ── Editorial Masthead — the issue title, wired to real cycle data ──────────
function Masthead({ phase, season, cycleDay, cycleCount, onWrite }) {
  const phaseWord = phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Journal";
  const dateLine = format(new Date(), "d MMMM").toUpperCase();
  return (
    <header style={{ paddingTop: 44, marginBottom: 36 }}>
      <Eyebrow mb={10}>The Journal · A publication of one</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Script size={64} style={{ width: "auto" }}>{phaseWord}</Script>
        {phase && season ? (
          <Hand size={29} color={T.inkSoft} style={{ width: "auto" }}>{season.name}</Hand>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <Rule w={28} c={T.gold} />
        <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, letterSpacing: 1.2, fontWeight: 600 }}>
          {cycleDay ? `DAY ${cycleDay} · ` : ""}{dateLine}
        </span>
        <Heart size={15} style={{ marginLeft: 2 }} />
      </div>
      {cycleCount.count > 0 ? (
        <Hand size={20} color={T.inkSoft} carve={false} style={{ marginTop: 12 }}>
          {cycleCount.count} {cycleCount.label} — you{"’"}re building a pattern.
        </Hand>
      ) : null}
      <button onClick={onWrite} style={{
        marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8,
        background: "transparent", border: "none", cursor: "pointer", padding: 0,
        fontFamily: HAND, fontWeight: 600, fontSize: 22, color: T.ink, textShadow: PRESS,
        borderBottom: `1px solid ${T.gold}`, paddingBottom: 3,
      }}>
        <Feather style={{ width: 15, height: 15 }} /> Begin a new entry
      </button>
    </header>
  );
}

// ── Threads browse strip — discover/enter a series (Phase 1b) ────────────────
function ThreadsStrip({ threads, onOpen }) {
  if (!threads?.length) return null;
  return (
    <section style={{ marginBottom: 22 }}>
      <Eyebrow mb={10}>Threads · Series you{"’"}re keeping</Eyebrow>
      <style>{`.jthreads-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="jthreads-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {threads.map((t) => (
          <button key={t.name} onClick={() => onOpen(t.name)} style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
            background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 13px",
            fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, color: T.ink,
          }}>
            <Hash size={11} style={{ color: T.gold }} /> {t.name}
            <span style={{ color: T.muted, fontWeight: 600 }}>{t.count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Doctor cross-link — turn entries into a doctor-ready summary (Phase 2) ────
// Reuses the existing /DoctorExport surface (which already reads JournalEntries
// over a 90-day window). Burn entries are never persisted and sealed letters are
// a separate entity, so neither leaks into the export.
function DoctorCrossLink({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      width: "100%", textAlign: "left", marginBottom: 30, display: "flex", gap: 16, alignItems: "center", cursor: "pointer",
      background: T.paperHi, borderRadius: 3, padding: "18px 20px", border: "none", boxShadow: "0 0 0 1px rgba(51,41,28,0.05)" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE3C9", border: `1px solid ${T.gold}` }}>
        <Stethoscope size={17} style={{ color: T.gold }} />
      </div>
      <div style={{ flex: 1 }}>
        <Eyebrow mb={4}>Bring this to your GP</Eyebrow>
        <Hand size={19} color={T.inkSoft}>Turn your recent entries into a doctor-ready summary — patterns, moods and notes, ready to share.</Hand>
      </div>
      <ChevronRight size={18} style={{ color: T.muted }} />
    </button>
  );
}

// ── Echo Wall · Share-as-Echo slot (Phase 3) ───────────────────────────
// The Journal-side entry point into the Echo Wall (the wall itself lives on the
// Community page). One scrubbed, anonymous line for women in the same phase.
function ShareAsEchoSlot({ onShare }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <Eyebrow mb={8}>The Echo Wall</Eyebrow>
      <button onClick={onShare} style={{
        width: "100%", textAlign: "left", display: "flex", gap: 16, alignItems: "center", cursor: "pointer",
        background: T.paperHi, borderRadius: 3, padding: "18px 20px", border: "none", boxShadow: "0 0 0 1px rgba(51,41,28,0.05)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE3C9", border: `1px solid ${T.gold}` }}>
          <Waves size={17} style={{ color: T.gold }} />
        </div>
        <div style={{ flex: 1 }}>
          <Hand size={20} color={T.ink} carve={false}>Share one line as an echo</Hand>
          <Hand size={17} color={T.inkSoft} style={{ marginTop: 2 }}>
            Anonymous, held by women in the same phase — never replied to. Jess scrubs anything that could identify you. It fades in two days.
          </Hand>
        </div>
        <ChevronRight size={18} style={{ color: T.muted }} />
      </button>
    </section>
  );
}

export default function Journal() {
  useEditorialFonts();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
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

  // (The full-height paper fix is now global — html/body cream in index.css +
  // PAPER_BG on the Layout shell — so the Journal-only body-paint hack was
  // removed. The Journal root still carries PAPER_BG for its own surface.)

  const phase = getCurrentPhase(profile);
  const cycleDay = cycleDayOf(profile);
  const season = phase ? PHASE_SEASON[phase] : null;
  const cycleCount = entriesThisCycle(entries, profile);
  const threads = collectThreads(entries);

  // Filter + pinned-first ordering for the ledger.
  const matching = filterType === "all" ? entries : entries.filter((e) => e.card_type === filterType);
  const ledgerEntries = [...matching.filter((e) => e.is_pinned), ...matching.filter((e) => !e.is_pinned)];

  // Thread view ordering — pinned first, then the thread's own recency.
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

  // ── loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ ...PAPER_BG }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "rgba(168,137,63,0.25)", borderTopColor: T.gold }} />
    </div>
  );

  // ── error ──
  if (error && !user) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ ...PAPER_BG }}>
      <InkFilter />
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <Eyebrow mb={10}>The Journal</Eyebrow>
        <Script size={40} style={{ marginBottom: 10 }}>A quiet moment</Script>
        <Hand size={20} color={T.inkSoft}>We couldn{"’"}t open your journal just now. Check your connection and try again.</Hand>
        <button onClick={() => window.location.reload()} style={{
          marginTop: 20, background: "transparent", border: `1px solid ${T.gold}`, padding: "10px 24px",
          cursor: "pointer", fontFamily: HAND, fontWeight: 600, fontSize: 18, color: T.ink, textShadow: PRESS, borderRadius: 3,
        }}>Try again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ position: "relative", ...PAPER_BG }}>
      <InkFilter />

      {/* Composer (full-screen editorial overlay) */}
      {(showNewEntry || editEntry) && user && (
        <NewEntrySheet
          user={user}
          phase={phase}
          cycleDay={cycleDay}
          editEntry={editEntry}
          seedText={seedText}
          seedCardType={seedType}
          seedThread={seedThread}
          threads={threads.map((t) => t.name)}
          onClose={closeComposer}
          onSaved={handleSaved}
        />
      )}

      {/* Entry reader (open from the ledger) */}
      <EntryReader
        entry={readEntry}
        profile={profile}
        phase={phase}
        onClose={() => setReadEntry(null)}
        onEdit={handleEditFromReader}
        onDelete={handleDelete}
        onPin={handlePin}
      />

      {/* Share-as-Echo composer (Echo Wall entry point, Phase 3) */}
      {showShareEcho && user && (
        <ShareAsEchoSheet
          user={user}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
          lifeStage={profile?.life_stage || null}
          seedText=""
          onClose={() => setShowShareEcho(false)}
        />
      )}

      {/* Insights overlay — the deep insights (mood-by-phase, rhythm, tags,
          Jess weekly) over the page, opened from the header insight card. */}
      {showInsights && user && (
        <div onClick={() => setShowInsights(false)} style={{ position: "fixed", inset: 0, zIndex: 75, background: "rgba(51,41,28,0.42)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "0" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...PAPER_BG, width: "100%", maxWidth: 680, minHeight: "100%", boxShadow: "0 8px 40px rgba(51,41,28,0.20)" }}>
            <InkFilter />
            <div style={{ position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: T.paper, borderBottom: `1px solid ${T.paperDeep}` }}>
              <Eyebrow>Insights · The shape of your writing</Eyebrow>
              <button onClick={() => setShowInsights(false)} aria-label="Close insights" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "inline-flex" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "8px 16px 40px" }}>
              <JournalInsightsTab user={user} entries={entries} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4">

        <Masthead phase={phase} season={season} cycleDay={cycleDay} cycleCount={cycleCount} onWrite={openBlank} />

        {/* Insight card — a small, obvious card at the header. Tapping it opens
            the deep insights as an OVERLAY over the page (no separate tab). */}
        {!threadFilter && entries.length > 0 && (
          <InsightTeaser entries={entries} onOpen={() => setShowInsights(true)} />
        )}

        {/* THREAD VIEW (one series, full) */}
        {threadFilter && (
          <ThreadView
            thread={threadFilter}
            entries={threadEntries}
            onBack={() => setThreadFilter(null)}
            onTap={(e) => setReadEntry(e)}
            onWrite={openInThread}
          />
        )}

        {/* MAIN — single scroll, no tabs */}
        {!threadFilter && (
          <>
            {/* Full-text search across your own entries */}
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
            {/* Prompt wing — Jess's live daily prompt + phase carousel */}
            {user && (
              <JessErrorBoundary variant="quiet" label="PromptCarousel">
                <PromptCarousel
                  user={user}
                  profile={profile}
                  phase={phase}
                  cycleDay={cycleDay}
                  lastEntry={entries[0] || null}
                  onWrite={(p) => openSeeded(`${p}\n\n`)}
                />
              </JessErrorBoundary>
            )}

            {/* On This Day — Cycle Mirror (free) */}
            {entries.length > 0 && (
              <CycleMirror
                entries={entries}
                profile={profile}
                phase={phase}
                todayCycleDay={cycleDay}
                onReply={replyToPast}
              />
            )}

            {/* Threads browse strip */}
            <ThreadsStrip threads={threads} onOpen={(t) => setThreadFilter(t)} />

            {/* Jess witness note — appears when viewing a Wholeness dimension */}
            {WHOLENESS_TYPES.has(filterType) && (
              <div style={{ marginBottom: 18, padding: "14px 18px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3 }}>
                <Eyebrow mb={6}>A note from Jess</Eyebrow>
                <Hand size={17} color={T.inkSoft} carve={false}>
                  {filterType === "grief" && "Grief has no timeline. I am not here to move you through it — only to sit with you in it."}
                  {filterType === "identity" && "There is no right answer here. I am not observing you — I am holding space for the person you are still becoming."}
                  {filterType === "money" && "Money is not a moral story. What you write here stays here, and I will not conflate your worth with your numbers."}
                  {filterType === "relationships" && "Relationships are rarely simple. Write the complicated truth — I am not here to advise, only to witness."}
                  {filterType === "career" && "Ambition and exhaustion can live in the same body. What you feel about your work is allowed to be contradictory."}
                  {filterType === "creativity" && "Nothing you make here needs to be good. The making is the point."}
                  {filterType === "joy" && "Joy is allowed to exist without justification. Let this be easy."}
                </Hand>
              </div>
            )}

            {/* Filter pills */}
            <style>{`.jfilter-scroll::-webkit-scrollbar{display:none}`}</style>
            <div className="jfilter-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 18, scrollbarWidth: "none" }}>
              {FILTER_TYPES.map((f) => (
                <button key={f.id} onClick={() => setFilterType(f.id)} style={{
                  flexShrink: 0, borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                  fontFamily: UI, border: `1px solid ${filterType === f.id ? T.ink : T.paperDeep}`, cursor: "pointer",
                  letterSpacing: 0.4, textTransform: "uppercase",
                  backgroundColor: filterType === f.id ? T.ink : "transparent",
                  color: filterType === f.id ? T.paper : T.muted,
                }}>{f.label}</button>
              ))}
            </div>

            {/* Empty state */}
            {entries.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 30, paddingBottom: 30 }}>
                <Eyebrow mb={10}>Your first page</Eyebrow>
                <Script size={36} style={{ marginBottom: 10 }}>A publication of one</Script>
                <Hand size={20} color={T.inkSoft} style={{ marginBottom: 22 }}>
                  Nothing here yet. Begin with a line — it is locked to you, always.
                </Hand>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {["Free write", "Gratitude", "Reflection", "Relationships", "Grief", "Joy"].map((label) => (
                    <button key={label} onClick={openBlank} style={{
                      background: "transparent", border: `1px solid ${T.gold}`, borderRadius: 3, padding: "9px 16px",
                      cursor: "pointer", fontFamily: HAND, fontSize: 17, fontWeight: 600, color: T.ink, textShadow: PRESS,
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* The ledger */}
            {ledgerEntries.length > 0 && (
              <JournalLedger entries={ledgerEntries} onTap={(e) => setReadEntry(e)} onThread={(t) => setThreadFilter(t)} />
            )}

            {ledgerEntries.length === 0 && entries.length > 0 && (
              <div style={{ textAlign: "center", padding: "30px 20px 46px" }}>
                <Hand size={20} color={T.inkSoft}>No {filterType} entries yet.</Hand>
              </div>
            )}

            {/* Doctor-ready summary cross-link */}
            {entries.length > 0 && <DoctorCrossLink onOpen={() => navigate("/DoctorExport")} />}

            {/* Tonight's reflection */}
            <TonightReflection phase={phase} onWrite={(p) => openSeeded(`${p}\n\n`, "reflection")} />

            {/* Sealed Letters — real, encrypted, inside the Journal (Phase 2) */}
            <SealedLettersSection user={user} profile={profile} />

            {/* Echo wall — honest "coming" teaser (Q2) */}
            <ShareAsEchoSlot onShare={() => setShowShareEcho(true)} />
              </>
            )}
          </>
        )}

        {/* Privacy footer */}
        <div style={{ marginTop: 40 }}>
          <EditorialFooter />
        </div>
      </div>
    </div>
  );
}