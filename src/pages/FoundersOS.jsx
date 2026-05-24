// ─────────────────────────────────────────────────────────────────────────────
// /Founders — Founder OS
//
// Brand new page, written from scratch on 2026-05-24. Does NOT import,
// reuse, or share components with Ideas.jsx / Design Lab. Mobile-first
// dashboard for the FemWell founder. Five tabs:
//   1. Lab        — 10 feature cards, inline-toggle expand for detail
//   2. Roadmap    — vertical sprint timeline with tap-to-expand
//   3. Strategy   — 6 info cards (no expand, just display)
//   4. Legal      — 15-item checklist with progress bar; state in
//                   localStorage `femwell_founder_checks` as a JSON
//                   array of completed indices
//   5. Decisions  — 5 decision cards with espresso text + gold
//                   border-left
//
// Auth: only halliburtonoji@gmail.com or ojihalliburton57@gmail.com.
// Anyone else gets a plain "Not authorised" line.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

// Brand tokens
const CREAM    = "#F4EDDB";
const ESPRESSO = "#3A2C1A";
const MUTED    = "#9B8B7A";
const GOLD     = "#D4AF37";
const SAGE     = "#8FAF8F";
const WHITE    = "#FFFFFF";
const GREY_LITE = "#E5E0D2";

const ALLOWED = new Set([
  "halliburtonoji@gmail.com",
  "ojihalliburton57@gmail.com",
]);

const TABS = ["Lab", "Pages", "Roadmap", "Ideas", "Strategy", "Legal", "Decisions"];

// ── DATA — Tab 1: Lab ───────────────────────────────────────────────
const LAB = [
  {
    name: "Planner v2",
    status: "Shipped",
    desc: "Unified daily planner — 12 rows, cycle-aware",
    built: ["All 12 rows wired", "Phase 3 complete"],
    pending: ["—"],
    commits: ["41f9173", "dff4791", "bc7834d", "e4f1563"],
  },
  {
    name: "Jess AI Features 1–4",
    status: "Shipped",
    desc: "Conversation history, memory, voice, For You tab",
    built: ["All 4 features live on /Assistant"],
    pending: ["Jess crash root cause"],
    commits: ["2359640", "jessAgentService.js"],
  },
  {
    name: "Crisis Protocol",
    status: "Shipped",
    desc: "7-category sensitive topic detection for Jess",
    built: ["jessSensitiveTopics.js", "UK referral cards"],
    pending: ["QA"],
    commits: ["31f0db0", "0a37d83", "3bd95f6"],
  },
  {
    name: "Sprint 9 — Perimenopause",
    status: "Planned",
    desc: "HRT tracker, hot flash log, Menopause Rating Scale, peri Jess mode",
    built: ["—"],
    pending: ["Full build"],
    commits: ["—"],
  },
  {
    name: "Sprint 10 — Partner Sync",
    status: "Planned",
    desc: "Partner-facing page — currently 404",
    built: ["—"],
    pending: ["Full build"],
    commits: ["—"],
  },
  {
    name: "Ritual Builder on /Track",
    status: "In Progress",
    desc: "Entry point from Habits page — Planner entry done, Track not wired",
    built: ["Planner entry"],
    pending: ["Track wire-up"],
    commits: ["e4f1563"],
  },
  {
    name: "Voice to Schedule",
    status: "Planned",
    desc: "Web Speech API → NLP intent → confirm-before-save",
    built: ["—"],
    pending: ["Sprint 7"],
    commits: ["—"],
  },
  {
    name: "Morning Brief",
    status: "Planned",
    desc: "Daily welcome — first open each day auto-launches Morning Brief",
    built: ["—"],
    pending: ["Sprint 8"],
    commits: ["—"],
  },
  {
    name: "Full Data Export",
    status: "Planned",
    desc: "GDPR right to portability — Download my data",
    built: ["—"],
    pending: ["Pre-launch"],
    commits: ["—"],
  },
  {
    name: "Pre-launch Compliance",
    status: "In Progress",
    desc: "15-item legal checklist — ICO, DPIA, consent flags, teen gate",
    built: ["Checklist in Legal tab"],
    pending: ["ICO registration (founder)"],
    commits: ["—"],
  },
];

// ── DATA — Tab 2: Roadmap ───────────────────────────────────────────
const SPRINTS = [
  { label: "Sprint 1", done: true,  title: "Core shell, auth, life stage onboarding" },
  { label: "Sprint 2", done: true,  title: "Today page, symptom logging, mood/energy check-in" },
  { label: "Sprint 3", done: true,  title: "Journal, nutrition, medication tracking" },
  { label: "Sprint 4", done: true,  title: "Planner v1, cycle calendar, habit streaks" },
  { label: "Sprint 5", done: true,  title: "GP Export, skin & hair, pulse dashboard" },
  { label: "Sprint 6A", done: true, title: "Universal Logger FAB, date pickers, export merge" },
  { label: "Sprint 6B", done: true, title: "Ritual Builder, Planner UX demos, Planner v2 full rebuild" },
  { label: "Sprint 6C", done: true, title: "Jess AI F1–4, crisis protocol, For You tab, Wings" },
  { label: "Sprint 7", done: false, title: "Voice to Schedule (next)" },
  { label: "Sprint 8", done: false, title: "Morning Brief / Daily Welcome" },
  { label: "Sprint 9", done: false, title: "Perimenopause & menopause deep features" },
  { label: "Sprint 10", done: false, title: "Partner Sync" },
  { label: "App Store / Play Store", done: false, title: "Target: 6–8 months from Jan 2026" },
];

// ── DATA — Tab 3: Strategy ──────────────────────────────────────────
// Refreshed 2026-05-24 with the research findings from the
// competitive + market scan: Flo's AI growth, the femtech AI funding
// surge, the menopause whitespace, the live ICO investigation, the
// competitive window, and the investor narrative that lands.
const STRATEGY = [
  {
    title: "Business Model",
    body: "Freemium + Premium. ~£4.99–9.99/mo premium. Decide exact pricing after full build + cost analysis. Apple 30% cut (15% after year 1 for small devs).",
  },
  {
    title: "Platform Plan",
    body: "Build in Base44 → export React → Capacitor shell → TestFlight + Play Store internal → fix native issues → submit to stores.",
  },
  {
    title: "Timeline",
    body: "6–8 months to App Store / Play Store from Jan 2026. Target: late 2026.",
  },
  {
    title: "Market — femtech AI is exploding",
    body: "Flo deployed LLM fine-tuning and saw 45% MAU growth + 57% WAU growth — proof the AI-first cycle market rewards depth. $2.6B was invested in femtech AI in 2024 alone (55% YoY increase). 1.8B women globally are in some hormonal-health window; UK is ~47M eligible women.",
  },
  {
    title: "Menopause whitespace",
    body: "Only ~7% of femtech startups focused on menopause before 2025 — 1 billion affected women, no dominant AI companion. The over-35 cohort has higher willingness to pay and is under-served. Sweet spot for FemWell's life-stage coverage.",
  },
  {
    title: "Trust window — ICO is live",
    body: "The ICO's fertility-app investigation is currently active; law-enforcement data-access guidance was published Dec 2024 — UK police can now access menstrual data with a warrant. This is a first-mover trust opportunity: explicit \"your data stays yours\" UX is a defensible moat the entrenched players haven't seized.",
  },
  {
    title: "Competitive window",
    body: "Clue + Flo own the reproductive cohort. Natural Cycles owns the regulated contraception bar. Noom owns behaviour change. Nobody owns the full-life companion with perimenopause depth + warm tone. Flo has cycle + AI; they don't have the life-stage breadth or the clinically-referenced care surface.",
  },
  {
    title: "Investor narrative",
    body: "The pitch that works: AI-first + clinically credible + perimenopause whitespace + B2B pathway (workplace women's health benefit). Each one is a credible standalone wedge; together they're a defensible thesis.",
  },
  {
    title: "Compliance",
    body: "ICO registration required before first real users. Sole trader OK. Teen life stage = biggest legal exposure (UK GDPR Art. 8, Age Appropriate Design Code). Every AI output needs \"not medical advice\" disclaimer.",
  },
  {
    title: "Trademark",
    body: "Search \"FemWell\" in UK health/wellness category before launch.",
  },
];

// ── DATA — Tab "Pages" (data-flow map) ─────────────────────────────
// 13-row table that documents what each page reads from + writes to.
// Used to prevent building features that read from one entity but
// forget to thread the write-back through the surfaces that need it.
const PAGE_MAP = [
  { page: "Today",         reads: "DailyCheckins, SymptomLogs, MealLog, HydrationLog, HabitLogs, MedicationLogs, CycleRecord", writes: "DailyCheckins, SymptomLogs, MealLog, HydrationLog, HabitLogs, MedicationLogs" },
  { page: "Planner",       reads: "DailyCheckins, PersonalTasks, HabitLogs, MealLog, PlannerItems, CycleRecord, Events", writes: "PersonalTasks, HabitLogs, DailyCheckins" },
  { page: "Pulse",         reads: "DailyCheckins, SymptomLogs, HabitLogs, CycleRecord, SessionLogs, MealLog", writes: "Read-only" },
  { page: "Journal",       reads: "JournalEntries", writes: "JournalEntries" },
  { page: "Nutrition",     reads: "MealLog, HydrationLog", writes: "MealLog, HydrationLog" },
  { page: "Doctor Export", reads: "DailyCheckins, SymptomLogs, MedicationLogs, SessionLogs, CycleRecord", writes: "Export only" },
  { page: "Skin & Hair",   reads: "DailyCheckins (skin/hair fields)", writes: "Logged via Today" },
  { page: "Profile",       reads: "UserProfile", writes: "UserProfile" },
  { page: "Track",         reads: "CycleRecord, SymptomLogs, HabitLogs, MedicationLogs, SessionLogs", writes: "All of the above" },
  { page: "Explore",       reads: "ContentLibrary", writes: "SessionLogs" },
  { page: "Jess",          reads: "All entities + JessMemory + JessConversations", writes: "JessMemory, JessConversations, action layer" },
  { page: "Community",     reads: "CommunityPosts", writes: "CommunityPosts" },
  { page: "Partner Sync",  reads: "NOT BUILT — 404", writes: "—" },
];

const DATA_FLOW_RULES = [
  "Today check-in → radiates to Planner body tiles, Pulse, Skin & Hair, Doctor Export, Jess context.",
  "Life stage change (Profile) → reshapes EVERY page — always test across pages after any build.",
  "Habit completions → Today Habits Stack AND Planner Morning Stack write to the SAME HabitLogs entity.",
  "Hydration → Today AND Nutrition both write to the same HydrationLog.",
  "Meal logging → Today AND Nutrition both write to the same MealLog.",
  "GP Report → accessible from 3 places, all reach /DoctorExport.",
  "Cycle period logged → triggers phase recalculation across Today, Planner, Pulse, Explore, Nutrition, Lifestyle.",
  "Jess reads: cycle phase, life stage, mood/energy, recent symptoms, memory — wire new data to Jess context.",
];

// ── DATA — Tab "Ideas" (15 pre-populated backlog items) ────────────
// Persisted to UserProfile.founder_ideas (JSON array) so the backlog
// follows Halli across devices and stays readable by agents. Local-
// storage `femwell_ideas` is used as a secondary cache only.
const IDEAS_KEY = "femwell_ideas";
const IDEAS_INITIAL = [
  { id: 100001, title: "Unified Health Page", description: "A single dashboard aggregating all health data: cycle, mood/energy/symptoms over time, nutrition, medication, sleep — one place to see your whole health picture.", status: "idea",      ts: 1737590400000 },
  { id: 100002, title: "Morning Brief auto-launch", description: "When user opens app for first time each day, Morning Brief launches instead of Planner home (daily ritual).", status: "planned",      ts: 1737590400000 },
  { id: 100003, title: "Pattern Nudges (Jess)", description: "Jess proactively notices patterns (\"You've mentioned feeling tired on day 19–21 for 3 cycles — that's your luteal dip\") and surfaces them without being asked.", status: "researched", ts: 1737590400000 },
  { id: 100004, title: "Predictive Phase Prep (Jess)", description: "Uses the user's specific cycle history to prep them for what's physically coming in the next phase, not generic advice. Competitors don't do this well.", status: "researched", ts: 1737590400000 },
  { id: 100005, title: "B2B / employer pathway", description: "Sell FemWell as a workplace women's health benefit. Enterprise pricing, anonymised aggregate reporting for HR.", status: "idea",      ts: 1737590400000 },
  { id: 100006, title: "Jess Memory Cards", description: "Visible summaries of what Jess has learned about you (\"Jess knows: you tend to feel low energy in luteal phase, you prefer vegetarian meals, you've been trying to conceive since March\").", status: "researched", ts: 1737590400000 },
  { id: 100007, title: "Daily Opening Card (Jess streaming)", description: "Jess's first message of the day streams in as you open the app. Perceptual step-change vs waiting for a typed reply.", status: "researched", ts: 1737590400000 },
  { id: 100008, title: "Astra deep-link", description: "From any Jess conversation, \"Talk to Astra about this\" hands off to an Astra clinical-style session with full context. Astra is distinct from Jess (more clinical).", status: "partial",    ts: 1737590400000 },
  { id: 100009, title: "Perimenopause companion mode", description: "Jess adapts her entire persona for perimenopause: no cycle tracking references, brain fog empathy, HRT conversation support, menopause rating scale.", status: "planned",    ts: 1737590400000 },
  { id: 100010, title: "Partner Sync", description: "Partner-facing view showing cycle phase, how partner is feeling, what support would help. Currently 404.", status: "planned",      ts: 1737590400000 },
  { id: 100011, title: "Full data export (\"Download my data\")", description: "GDPR Art. 20, required before launch. JSON export of everything.", status: "planned",      ts: 1737590400000 },
  { id: 100012, title: "Teen companion mode", description: "Under-18 specific experience, age-appropriate language, parental consent flow, stricter data handling.", status: "required",   ts: 1737590400000 },
  { id: 100013, title: "Skin & Hair phase guide", description: "Cycle-aware skincare recommendations. May already be partially built.", status: "unknown",      ts: 1737590400000 },
  { id: 100014, title: "Wearable / device sync", description: "Apple Health, Garmin, Fitbit data ingestion for richer health context.", status: "future",       ts: 1737590400000 },
  { id: 100015, title: "Offline mode", description: "Cached content for when user has no signal.", status: "future",       ts: 1737590400000 },
];

function loadIdeasFromCache() {
  try {
    const raw = window.localStorage?.getItem(IDEAS_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : null;
  } catch { return null; }
}
function saveIdeasToCache(arr) {
  try { window.localStorage?.setItem(IDEAS_KEY, JSON.stringify(arr || [])); }
  catch { /* swallow */ }
}

// Status badge tone for an Idea card.
function ideaTone(status) {
  switch (String(status || "").toLowerCase()) {
    case "shipped":    return { bg: SAGE,      fg: WHITE };
    case "building":   return { bg: GOLD,      fg: ESPRESSO };
    case "planned":    return { bg: "rgba(58,44,26,0.10)", fg: ESPRESSO };
    case "researched": return { bg: "rgba(143,175,143,0.22)", fg: "#4F6B4F" };
    case "partial":    return { bg: "rgba(212,175,55,0.22)", fg: "#7A6320" };
    case "required":   return { bg: "rgba(196,79,79,0.20)", fg: "#7A2935" };
    case "future":     return { bg: GREY_LITE, fg: MUTED };
    case "unknown":    return { bg: GREY_LITE, fg: MUTED };
    default:           return { bg: GREY_LITE, fg: MUTED };
  }
}

// ── DATA — Tab 4: Legal ─────────────────────────────────────────────
const LEGAL = [
  { label: "ICO registration (£40–52, ~20 min online)", founder: true },
  { label: "DPIA completed", founder: true },
  { label: "Base44 DPA signed", founder: true },
  { label: "Privacy Policy live in-app" },
  { label: "Terms & Conditions live in-app" },
  { label: "Granular consent flag on every new data collection point" },
  { label: "Account deletion cascade-deletes all user data (not soft delete)" },
  { label: "Teen age gate — under-18 flag, parental consent flow" },
  { label: "Full data export (\"Download my data\") — GDPR Art. 20" },
  { label: "Privacy contact email visible in app" },
  { label: "Jess data notice in Jess header" },
  { label: "Crisis protocol QA verified" },
  { label: "Analytics opt-out toggle for users" },
  { label: "Trademark search \"FemWell\" UK completed" },
  { label: "App Store rating review (expect 12+ for health data)" },
];

// localStorage state shape: JSON array of completed indices.
const CHECK_KEY = "femwell_founder_checks";
function loadChecks() {
  try {
    const raw = window.localStorage?.getItem(CHECK_KEY);
    if (!raw) return [];
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch { return []; }
}
function saveChecks(arr) {
  try { window.localStorage?.setItem(CHECK_KEY, JSON.stringify(arr)); }
  catch { /* swallow private mode */ }
}

// ── DATA — Tab 5: Decisions ─────────────────────────────────────────
const DECISIONS = [
  {
    title: "Jess AI positioning",
    body: "Wellness companion, never diagnostic. Every output needs \"not medical advice\". MHRA risk if it sounds like clinical advice.",
  },
  {
    title: "PlannerV2Shell architecture",
    body: "Self-contained, row order locked. Never import from planner-v2/ row files (dead code). Row order: Hero → Lists → Schedule → Your Day → Body → Stage → Conditions → Rituals → Nourishment → Mind → Care → Tonight.",
  },
  {
    title: "Freemium/premium split",
    body: "Deferred until full build + cost analysis complete. Do not build paywalls yet.",
  },
  {
    title: "Teen life stage",
    body: "Biggest legal exposure. Full parental consent flow must be designed before launch. Under-13 = parental consent required (UK GDPR Art. 8). 13–17 = higher data standards.",
  },
  {
    title: "Platform strategy",
    body: "Stay in Base44 for full build. Export React + Capacitor wrap later. Do not leave Base44 mid-build.",
  },
];

// ── Status badge tone ───────────────────────────────────────────────
function statusTone(status) {
  if (status === "Shipped")     return { bg: SAGE,      fg: WHITE };
  if (status === "In Progress") return { bg: GOLD,      fg: ESPRESSO };
  return                              { bg: GREY_LITE, fg: MUTED };
}

// ─────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────
export default function FoundersOS() {
  const { user, isLoadingAuth } = useAuth();
  const email = String(user?.email || "").toLowerCase();

  // ── Auth gate ──
  if (isLoadingAuth) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: MUTED }}>Loading…</div>
    );
  }
  if (!ALLOWED.has(email)) {
    // /Ideas now lands here for everyone — gate copy reads as
    // founder-only rather than "not authorised" (which could be
    // mistaken for a session error).
    return (
      <div style={{ padding: 40, textAlign: "center", color: MUTED }}>
        This page is for the FemWell founder.
      </div>
    );
  }

  return <FoundersInner email={email} user={user} />;
}

function FoundersInner({ email, user }) {
  const [tab, setTab] = useState("Lab");
  return (
    <div style={{
      minHeight: "100vh",
      background: CREAM,
      paddingBottom: 120,
      fontFamily: "'Inter', system-ui, sans-serif",
      color: ESPRESSO,
    }}>
      {/* Header */}
      <header style={{
        padding: "32px 20px 16px",
        maxWidth: 880, margin: "0 auto",
      }}>
        <h1 style={{
          margin: 0,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: ESPRESSO,
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}>Founder OS</h1>
        <p style={{
          margin: "6px 0 0",
          fontSize: 13.5,
          color: MUTED,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}>
          <span>{email}</span>
          <span style={{ color: MUTED }}>·</span>
          <span style={{
            display: "inline-block",
            width: 8, height: 8, borderRadius: 9999,
            background: GOLD,
          }} aria-hidden />
          <span>Build in progress</span>
        </p>
      </header>

      {/* Sticky pill tabs */}
      <div style={{
        position: "sticky",
        top: 0,
        background: CREAM,
        zIndex: 10,
        borderBottom: `1px solid rgba(58,44,26,0.1)`,
      }}>
        <div style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          whiteSpace: "nowrap",
        }}>
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  flexShrink: 0,
                  padding: "8px 16px",
                  borderRadius: 9999,
                  border: active ? `1px solid ${GOLD}` : `1px solid rgba(58,44,26,0.18)`,
                  background: active ? GOLD : CREAM,
                  color: active ? WHITE : ESPRESSO,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: active ? 700 : 600,
                  fontSize: 13.5,
                  cursor: "pointer",
                  transition: "all 160ms ease",
                }}
              >{t}</button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <main style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "20px 16px 60px",
      }}>
        {tab === "Lab"       && <LabTab />}
        {tab === "Pages"     && <PagesTab />}
        {tab === "Roadmap"   && <RoadmapTab />}
        {tab === "Ideas"     && <IdeasTab user={user} />}
        {tab === "Strategy"  && <StrategyTab />}
        {tab === "Legal"     && <LegalTab />}
        {tab === "Decisions" && <DecisionsTab />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 1 — Lab
// ─────────────────────────────────────────────────────────────────────
function LabTab() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div>
      <SectionHeader kicker="FEATURE STATUS" sub="All sprints — tap any card to expand" />
      <div style={{
        marginTop: 16,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {LAB.map((card, i) => (
          <LabCard
            key={i}
            card={card}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

function LabCard({ card, open, onToggle }) {
  const tone = statusTone(card.status);
  return (
    <article style={{
      background: WHITE,
      borderRadius: 12,
      boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
      overflow: "hidden",
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", textAlign: "left", cursor: "pointer",
          padding: 16, background: WHITE, border: "none",
          display: "flex", flexDirection: "column", gap: 6,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between",
        }}>
          <span style={{
            fontWeight: 700, fontSize: 15, color: ESPRESSO,
            lineHeight: 1.3, flex: 1, minWidth: 0,
          }}>{card.name}</span>
          <span style={{
            flexShrink: 0,
            padding: "3px 10px", borderRadius: 9999,
            background: tone.bg, color: tone.fg,
            fontSize: 10.5, fontWeight: 800,
            letterSpacing: "0.04em",
          }}>{card.status}</span>
        </div>
        <p style={{
          margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.5,
        }}>{card.desc}</p>
      </button>
      {open && (
        <div style={{
          padding: "0 16px 14px",
          borderTop: `1px solid rgba(58,44,26,0.08)`,
          paddingTop: 12,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <DetailBlock title="What's built" items={card.built} />
          <DetailBlock title="What's pending" items={card.pending} />
          <DetailBlock title="Commits" items={card.commits} mono />
        </div>
      )}
    </article>
  );
}

function DetailBlock({ title, items, mono }) {
  return (
    <div>
      <p style={{
        margin: 0, fontSize: 10.5, fontWeight: 800,
        letterSpacing: "0.16em", textTransform: "uppercase",
        color: MUTED,
      }}>{title}</p>
      <ul style={{
        margin: "4px 0 0", padding: "0 0 0 16px",
        listStyle: "disc",
      }}>
        {(items || []).map((it, i) => (
          <li key={i} style={{
            fontSize: 12.5, color: ESPRESSO, lineHeight: 1.5,
            fontFamily: mono ? "'JetBrains Mono', 'SF Mono', Menlo, monospace" : "'Inter', system-ui, sans-serif",
          }}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 2 — Roadmap
// ─────────────────────────────────────────────────────────────────────
function RoadmapTab() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div>
      <SectionHeader kicker="SPRINT TIMELINE" />
      <ol style={{
        marginTop: 16, padding: 0, listStyle: "none",
        position: "relative",
      }}>
        {/* Vertical line */}
        <span aria-hidden style={{
          position: "absolute",
          left: 14, top: 6, bottom: 6,
          width: 2, background: "rgba(58,44,26,0.12)",
        }} />
        {SPRINTS.map((s, i) => (
          <RoadmapItem
            key={i}
            sprint={s}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </ol>
    </div>
  );
}

function RoadmapItem({ sprint, open, onToggle }) {
  return (
    <li style={{ position: "relative", paddingLeft: 40, marginBottom: 10 }}>
      <span aria-hidden style={{
        position: "absolute", left: 7, top: 10,
        width: 16, height: 16, borderRadius: 9999,
        background: sprint.done ? GOLD : CREAM,
        border: sprint.done ? `2px solid ${GOLD}` : `2px solid rgba(58,44,26,0.25)`,
        boxShadow: `0 0 0 3px ${CREAM}`,
      }} />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", textAlign: "left", cursor: "pointer",
          background: WHITE, border: "none", borderRadius: 10,
          padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 1px 2px rgba(58,44,26,0.05)",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10.5, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: sprint.done ? ESPRESSO : MUTED,
          }}>{sprint.label}</span>
          {sprint.done && (
            <span style={{
              fontSize: 13, color: SAGE, fontWeight: 700,
            }} aria-label="completed">✓</span>
          )}
        </div>
        <p style={{
          margin: 0, fontSize: 13.5, color: ESPRESSO, lineHeight: 1.45,
          fontWeight: sprint.done ? 600 : 500,
        }}>{sprint.title}</p>
        {open && (
          <p style={{
            margin: "6px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55,
          }}>
            {sprint.done
              ? "Shipped — feature live in production."
              : "Planned — see Lab tab for build status, or roadmap milestone in Strategy."}
          </p>
        )}
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 3 — Strategy
// ─────────────────────────────────────────────────────────────────────
function StrategyTab() {
  return (
    <div>
      <SectionHeader kicker="STRATEGY" />
      <div style={{
        marginTop: 16, display: "flex", flexDirection: "column", gap: 10,
      }}>
        {STRATEGY.map((s, i) => (
          <article key={i} style={{
            background: WHITE, borderRadius: 12, padding: 16,
            boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <h3 style={{
              margin: 0, fontSize: 15, fontWeight: 700, color: ESPRESSO,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>{s.title}</h3>
            <p style={{
              margin: 0, fontSize: 13, color: ESPRESSO, lineHeight: 1.55,
            }}>{s.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 4 — Legal
// ─────────────────────────────────────────────────────────────────────
function LegalTab() {
  const [checks, setChecks] = useState([]);
  useEffect(() => { setChecks(loadChecks()); }, []);
  const toggle = useCallback((idx) => {
    setChecks((prev) => {
      const set = new Set(prev);
      if (set.has(idx)) set.delete(idx); else set.add(idx);
      const next = Array.from(set).sort((a, b) => a - b);
      saveChecks(next);
      return next;
    });
  }, []);
  const total = LEGAL.length;
  const done = checks.length;
  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <SectionHeader kicker="PRE-LAUNCH GATES" />
      {/* Progress bar */}
      <div style={{
        marginTop: 14,
        background: WHITE, borderRadius: 12, padding: 14,
        boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: ESPRESSO }}>
            {done} <span style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>of {total}</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>{pct}%</span>
        </div>
        <div style={{
          height: 8, borderRadius: 9999,
          background: "rgba(58,44,26,0.08)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`, background: GOLD,
            transition: "width 220ms ease",
          }} />
        </div>
      </div>

      <ul style={{
        marginTop: 14, padding: 0, listStyle: "none",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {LEGAL.map((item, i) => {
          const on = checks.includes(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={on}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: WHITE, borderRadius: 12, padding: "12px 14px",
                  border: "none", boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                <span aria-hidden style={{
                  flexShrink: 0, marginTop: 1,
                  width: 22, height: 22, borderRadius: 6,
                  background: on ? SAGE : "transparent",
                  border: on ? `1px solid ${SAGE}` : `1.5px solid rgba(58,44,26,0.25)`,
                  color: WHITE,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, lineHeight: 1,
                }}>{on ? "✓" : ""}</span>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{
                    margin: 0,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: on ? MUTED : ESPRESSO,
                    textDecoration: on ? "line-through" : "none",
                    lineHeight: 1.4,
                  }}>{item.label}</p>
                  {item.founder && (
                    <span style={{
                      alignSelf: "flex-start",
                      padding: "2px 8px", borderRadius: 9999,
                      background: `${GOLD}33`, color: "#7A6320",
                      fontSize: 9.5, fontWeight: 800, letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}>Founder action</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab 5 — Decisions
// ─────────────────────────────────────────────────────────────────────
function DecisionsTab() {
  return (
    <div>
      <SectionHeader kicker="KEY DECISIONS LOG" />
      <div style={{
        marginTop: 16, display: "flex", flexDirection: "column", gap: 12,
      }}>
        {DECISIONS.map((d, i) => (
          <article key={i} style={{
            background: WHITE,
            borderRadius: 12,
            padding: 16,
            borderLeft: `3px solid ${GOLD}`,
            boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <h3 style={{
              margin: 0, fontSize: 15, fontWeight: 700, color: ESPRESSO,
              fontFamily: "'Inter', system-ui, sans-serif",
              lineHeight: 1.3,
            }}>{d.title}</h3>
            <p style={{
              margin: 0, fontSize: 13, color: ESPRESSO, lineHeight: 1.55,
            }}>{d.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tab — Pages (data-flow map)
// ─────────────────────────────────────────────────────────────────────
function PagesTab() {
  return (
    <div>
      <SectionHeader
        kicker="DATA-FLOW MAP"
        sub="Every page, every entity it reads and writes. Use this before building anything new — nothing should ship that reads from one entity but forgets to wire the write."
      />

      {/* Section 1: page-by-entity table (scroll-x on mobile) */}
      <div style={{
        marginTop: 14,
        background: WHITE, borderRadius: 12,
        boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
        overflow: "hidden",
      }}>
        <div style={{
          overflowX: "auto", WebkitOverflowScrolling: "touch",
        }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            minWidth: 600,
          }}>
            <thead>
              <tr style={{ background: CREAM }}>
                <th style={pmHeadCell}>Page</th>
                <th style={pmHeadCell}>Reads from</th>
                <th style={pmHeadCell}>Writes to</th>
              </tr>
            </thead>
            <tbody>
              {PAGE_MAP.map((row, i) => (
                <tr key={row.page} style={{
                  background: i % 2 === 0 ? WHITE : "rgba(244,237,219,0.45)",
                }}>
                  <td style={{ ...pmCell, fontWeight: 700, color: ESPRESSO }}>{row.page}</td>
                  <td style={{ ...pmCell, color: ESPRESSO }}>{row.reads}</td>
                  <td style={{ ...pmCell, color: ESPRESSO }}>{row.writes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: critical data flow rules — gold left-border cards */}
      <div style={{ marginTop: 20 }}>
        <p style={{
          margin: 0, fontSize: 10.5, fontWeight: 800,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: MUTED,
        }}>CRITICAL DATA FLOW RULES</p>
        <ol style={{
          margin: "12px 0 0", padding: 0, listStyle: "none",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {DATA_FLOW_RULES.map((rule, i) => (
            <li key={i} style={{
              background: WHITE,
              borderRadius: 12,
              padding: "12px 14px",
              borderLeft: `3px solid ${GOLD}`,
              boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
              display: "flex", gap: 10,
              fontSize: 13, color: ESPRESSO, lineHeight: 1.5,
            }}>
              <span style={{
                flexShrink: 0,
                fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
                fontWeight: 700, color: GOLD, fontSize: 13,
                minWidth: 16,
              }}>{i + 1}.</span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const pmHeadCell = {
  textAlign: "left", padding: "10px 12px",
  fontSize: 10.5, fontWeight: 800,
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: MUTED,
  borderBottom: `1px solid rgba(58,44,26,0.12)`,
  whiteSpace: "nowrap",
};
const pmCell = {
  padding: "10px 12px",
  verticalAlign: "top",
  lineHeight: 1.45,
  borderBottom: `1px solid rgba(58,44,26,0.06)`,
};

// ─────────────────────────────────────────────────────────────────────
// Tab — Ideas (persistent backlog)
// ─────────────────────────────────────────────────────────────────────
function IdeasTab({ user }) {
  const [ideas, setIdeas]   = useState([]);
  const [title, setTitle]   = useState("");
  const [desc, setDesc]     = useState("");
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Hydrate from UserProfile.founder_ideas (primary) with a
  // localStorage cache fallback. If neither has anything, seed with
  // the IDEAS_INITIAL constant so the backlog is never blank.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let rows = [];
      try {
        if (user?.id) {
          rows = await base44.entities.UserProfile
            .filter({ user_id: user.id }, null, 1)
            .catch(() => []);
        }
      } catch { /* swallow */ }
      const p = rows?.[0] || null;
      if (cancelled) return;
      setProfile(p);
      const fromProfile = Array.isArray(p?.founder_ideas) ? p.founder_ideas : null;
      const cached = loadIdeasFromCache();
      const initial = fromProfile && fromProfile.length > 0
        ? fromProfile
        : (cached && cached.length > 0 ? cached : IDEAS_INITIAL);
      setIdeas(initial);
      // If we hydrated from the constant or cache but the profile is
      // empty, seed the profile so future devices have it.
      if (user?.id && (!fromProfile || fromProfile.length === 0)) {
        try {
          if (p?.id) {
            base44.entities.UserProfile.update(p.id, { founder_ideas: initial })
              .catch(() => {});
          }
        } catch {}
      }
      saveIdeasToCache(initial);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const persist = useCallback(async (next) => {
    saveIdeasToCache(next);
    if (profile?.id) {
      try { await base44.entities.UserProfile.update(profile.id, { founder_ideas: next }); }
      catch { /* swallow — cache is still primary fallback */ }
    }
  }, [profile?.id]);

  const addIdea = useCallback(async () => {
    const t = title.trim();
    if (!t || saving) return;
    setSaving(true);
    const entry = {
      id: Date.now(),
      title: t,
      description: desc.trim(),
      status: "idea",
      ts: Date.now(),
    };
    const next = [entry, ...ideas];
    setIdeas(next);
    setTitle("");
    setDesc("");
    await persist(next);
    setSaving(false);
  }, [title, desc, ideas, persist, saving]);

  return (
    <div>
      <SectionHeader
        kicker="IDEAS BACKLOG"
        sub="The full list of things worth building. Add new ones any time — they save to your profile."
      />

      {/* Add-idea card */}
      <div style={{
        marginTop: 14,
        background: WHITE, borderRadius: 12, padding: 14,
        boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea title…"
          maxLength={120}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 12px", minHeight: 40, borderRadius: 10,
            border: `1px solid rgba(58,44,26,0.18)`,
            background: CREAM,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14, color: ESPRESSO, outline: "none",
          }}
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="One-line description (optional)"
          maxLength={400}
          rows={2}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 12px", borderRadius: 10,
            border: `1px solid rgba(58,44,26,0.18)`,
            background: CREAM,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13, color: ESPRESSO, outline: "none",
            resize: "vertical",
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={addIdea}
            disabled={!title.trim() || saving}
            style={{
              padding: "8px 16px", minHeight: 36, borderRadius: 9999,
              background: title.trim() && !saving ? GOLD : GREY_LITE,
              color: title.trim() && !saving ? WHITE : MUTED,
              border: "none",
              cursor: title.trim() && !saving ? "pointer" : "not-allowed",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.02em",
            }}
          >{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>

      {/* Ideas list */}
      <ul style={{
        marginTop: 14, padding: 0, listStyle: "none",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {ideas.map((idea) => {
          const tone = ideaTone(idea.status);
          return (
            <li key={idea.id} style={{
              background: WHITE, borderRadius: 12, padding: 14,
              boxShadow: "0 1px 2px rgba(58,44,26,0.06)",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                justifyContent: "space-between",
              }}>
                <span style={{
                  fontWeight: 700, fontSize: 14, color: ESPRESSO,
                  lineHeight: 1.3, flex: 1, minWidth: 0,
                }}>{idea.title}</span>
                <span style={{
                  flexShrink: 0,
                  padding: "3px 10px", borderRadius: 9999,
                  background: tone.bg, color: tone.fg,
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}>{idea.status}</span>
              </div>
              {idea.description && (
                <p style={{
                  margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.55,
                }}>{idea.description}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Shared atom — Section header
// ─────────────────────────────────────────────────────────────────────
function SectionHeader({ kicker, sub }) {
  return (
    <div>
      <p style={{
        margin: 0, fontSize: 10.5, fontWeight: 800,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: MUTED,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>{kicker}</p>
      {sub && (
        <p style={{
          margin: "6px 0 0", fontSize: 13.5, color: MUTED, lineHeight: 1.5,
        }}>{sub}</p>
      )}
    </div>
  );
}
