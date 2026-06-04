import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { Feather, Lock, ChevronRight } from "lucide-react";
import NewEntrySheet from "../components/journal/NewEntrySheet";
import JournalInsightsTab from "../components/journal/JournalInsightsTab";
import PromptCarousel from "../components/journal/PromptCarousel";
import CycleMirror from "../components/journal/CycleMirror";
import JournalLedger from "../components/journal/JournalLedger";
import EntryReader from "../components/journal/EntryReader";
import TonightReflection from "../components/journal/TonightReflection";
import InsightTeaser from "../components/journal/InsightTeaser";
import JessErrorBoundary from "@/components/jess/JessErrorBoundary";
import {
  PAPER_BG, InkFilter, EditorialFooter, useEditorialFonts,
  T, UI, HAND, PRESS, Script, Hand, Eyebrow, Rule, Heart,
} from "../components/journal/Editorial";

const FILTER_TYPES = [
  { id: "all",         label: "All" },
  { id: "free",        label: "Free" },
  { id: "gratitude",   label: "Gratitude" },
  { id: "todo",        label: "Todo" },
  { id: "mood",        label: "Mood" },
  { id: "reflection",  label: "Reflection" },
  { id: "affirmation", label: "Affirmation" },
  { id: "dream",       label: "Dream" },
];

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

// ── Sealed Letters — honest "coming" teaser (Q1+, not built this phase) ──────
function SealedLettersComing() {
  return (
    <section style={{ marginBottom: 30, display: "flex", gap: 16, alignItems: "center",
      background: T.paperHi, borderRadius: 3, padding: "20px 22px", boxShadow: "0 0 0 1px rgba(51,41,28,0.05)" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE3C9", border: `1px solid ${T.gold}` }}>
        <Lock size={17} style={{ color: T.gold }} />
      </div>
      <div style={{ flex: 1 }}>
        <Eyebrow mb={4}>Sealed letters · Coming</Eyebrow>
        <Hand size={19} color={T.inkSoft}>A letter to who you{"’"}ll be — sealed until a date you pick. Not even Jess can open it early.</Hand>
      </div>
      <ChevronRight size={18} style={{ color: T.muted }} />
    </section>
  );
}

// ── Echo Wall — honest "coming" teaser (Q2) ──────────────────────────────────
function EchoComing() {
  return (
    <section style={{ marginBottom: 40, textAlign: "center" }}>
      <Eyebrow mb={6}>Echo wall · Coming</Eyebrow>
      <Hand size={18} color={T.inkSoft} style={{ display: "block" }}>
        One day you{"’"}ll be able to leave one line for women in the same phase —{" "}
        <span style={{ color: T.muted }}>anonymous, held, never replied to.</span>
      </Hand>
    </section>
  );
}

export default function Journal() {
  useEditorialFonts();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("journal");
  const [filterType, setFilterType] = useState("all");
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [readEntry, setReadEntry] = useState(null);
  const [seedText, setSeedText] = useState("");
  const [seedType, setSeedType] = useState(null);

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

  // Filter + pinned-first ordering for the ledger.
  const matching = filterType === "all" ? entries : entries.filter((e) => e.card_type === filterType);
  const ledgerEntries = [...matching.filter((e) => e.is_pinned), ...matching.filter((e) => !e.is_pinned)];

  // ── seed helpers ──
  const openBlank = () => { setSeedText(""); setSeedType(null); setShowNewEntry(true); };
  const openSeeded = (text, type = null) => { setSeedText(text || ""); setSeedType(type); setShowNewEntry(true); };
  const replyToPast = () => openSeeded("Replying to who I was…\n\n", "reflection");
  const closeComposer = () => { setShowNewEntry(false); setEditEntry(null); setSeedText(""); setSeedType(null); };

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
          onClose={closeComposer}
          onSaved={handleSaved}
        />
      )}

      {/* Entry reader (open from the ledger) */}
      <EntryReader
        entry={readEntry}
        onClose={() => setReadEntry(null)}
        onEdit={handleEditFromReader}
        onDelete={handleDelete}
        onPin={handlePin}
      />

      <div className="max-w-2xl mx-auto px-4">

        <Masthead phase={phase} season={season} cycleDay={cycleDay} cycleCount={cycleCount} onWrite={openBlank} />

        {/* Top-level tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl" style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
          {[{ id: "journal", label: "Journal" }, { id: "insights", label: "Insights" }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? "var(--plum)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
              }}>{tab.label}</button>
          ))}
        </div>

        {/* INSIGHTS TAB (unchanged) */}
        {activeTab === "insights" && user && (
          <JournalInsightsTab user={user} entries={entries} />
        )}

        {/* JOURNAL TAB */}
        {activeTab === "journal" && (
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

            {/* Insight teaser → Insights tab */}
            {entries.length > 0 && (
              <InsightTeaser entries={entries} onOpen={() => setActiveTab("insights")} />
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
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  {[{ label: "Free write" }, { label: "Gratitude" }, { label: "Reflection" }].map((t) => (
                    <button key={t.label} onClick={openBlank} style={{
                      background: "transparent", border: `1px solid ${T.gold}`, borderRadius: 3, padding: "10px 18px",
                      cursor: "pointer", fontFamily: HAND, fontSize: 18, fontWeight: 600, color: T.ink, textShadow: PRESS,
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* The ledger */}
            {ledgerEntries.length > 0 && (
              <JournalLedger entries={ledgerEntries} onTap={(e) => setReadEntry(e)} />
            )}

            {ledgerEntries.length === 0 && entries.length > 0 && (
              <div style={{ textAlign: "center", padding: "30px 20px 46px" }}>
                <Hand size={20} color={T.inkSoft}>No {filterType} entries yet.</Hand>
              </div>
            )}

            {/* Tonight's reflection */}
            <TonightReflection phase={phase} onWrite={(p) => openSeeded(`${p}\n\n`, "reflection")} />

            {/* Honest "coming" teasers (next phases) */}
            <SealedLettersComing />
            <EchoComing />
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
