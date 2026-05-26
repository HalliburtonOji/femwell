// ─────────────────────────────────────────────────────────────────────────────
// FoundersOS — dark espresso mini-app. Mounted at /Ideas.
//
// COMPLETE VISUAL REWRITE on 2026-05-24 per Halli's spec:
//   - dark espresso background, gold accents, cream text
//   - fixed top bar + sticky horizontal tab rail
//   - 7 tab panels with proper visual treatments (not a bland white doc)
//
// Tab panels:
//   Lab        — feature cards in 2-col grid (1-col mobile), gold left
//                border, status dot + label
//   Pages      — dark data-flow table with sage/blush read/write pills,
//                + 8 numbered Critical Data Rules cards
//   Roadmap    — vertical sprint timeline w/ gold dots + connecting line
//   Ideas      — colour-coded priority backlog (red/gold/sage left
//                borders), Add Idea row; persists to
//                UserProfile.founder_ideas + femwell_ideas localStorage
//   Strategy   — 2-col stat cards (big gold numbers) + competitor strip
//   Legal      — checklist w/ custom dark checkboxes + gold progress
//                bar; persists to localStorage femwell_founder_checks
//   Decisions  — decision log cards w/ 3px gold left border
//
// Auth: only halliburtonoji@gmail.com or ojihalliburton57@gmail.com get
// the OS. Anyone else gets a "page is private" card on the same dark bg.
//
// Self-contained — no imports from Ideas.jsx, Design Lab, or any other
// FemWell component. Source of truth for content:
//   /sessions/relaxed-loving-brahmagupta/mnt/.claude/skills/FOUNDERS_OS.md
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import HealthCornerDemo from "./HealthCornerDemo";

// ─── Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:         "#1C1410",   // page background (very dark espresso)
  surface:    "#2A1F17",   // surface cards
  surfaceHi:  "#332519",   // elevated cards / table header / modals
  border:     "#3D2D1F",   // subtle hairline
  textHi:     "#F4EDDB",   // primary text (cream)
  textMid:    "#C4B69E",   // mid-tone text
  textMuted:  "#9B8B7A",   // secondary text
  gold:       "#D4AF37",   // primary accent
  goldSoft:   "rgba(212,175,55,0.16)",
  blush:      "#E8B4B8",
  blushSoft:  "rgba(232,180,184,0.18)",
  sage:       "#8FAF8F",
  sageSoft:   "rgba(143,175,143,0.18)",
  red:        "#E85D5D",
  redSoft:    "rgba(232,93,93,0.18)",
};

const ALLOWED = new Set([
  "halliburtonoji@gmail.com",
  "ojihalliburton57@gmail.com",
]);

const TABS = ["Lab", "Pages", "Roadmap", "Ideas", "Strategy", "Legal", "Decisions", "🏥 Health Corner"];

const IDEAS_KEY  = "femwell_ideas";
const CHECKS_KEY = "femwell_founder_checks";

// ─── DATA ──────────────────────────────────────────────────────────────

// Tab 1 — Lab (feature cards)
const LAB = [
  { name: "Planner v2",                status: "Shipped",      tone: "sage",  desc: "Unified daily planner — 12 rows, cycle-aware, life-stage adaptive. All rows wired and live.", commits: "41f9173 · dff4791 · bc7834d" },
  { name: "Jess AI — Features 1–4",    status: "Shipped",      tone: "sage",  desc: "Conversation history with auto-naming, JessMemory recall, voice logging, For You tab.",       commits: "2359640" },
  { name: "Jess Action Layer",         status: "Shipped",      tone: "sage",  desc: "JSON envelope so Jess can write logs from chat. 16 action types, confidence-gated execution.", commits: "be67567 · cd4fef8" },
  { name: "Voice Companion Mode",      status: "Shipped",      tone: "sage",  desc: "Full-screen mic conversation with Jess — Web Speech in, speech synthesis out, actions execute live.", commits: "be67567" },
  { name: "Crisis Protocol (7-cat)",   status: "Shipped",      tone: "sage",  desc: "Sensitive-topic classifier + UK referral cards per category, Samaritans hard-stop for urgent crisis.", commits: "31f0db0 · 3bd95f6" },
  { name: "FoundersOS",                status: "Shipped",      tone: "sage",  desc: "This page. Living mind map of the build — pages, sprints, ideas, strategy, legal, decisions.",   commits: "b55437b (this rewrite)" },
  { name: "Sprint 7 — Voice to Schedule", status: "Next",       tone: "gold",  desc: "Mic on Planner → speech → NLP intent → confirm sheet → write task. Web Speech API only (no third-party).", commits: "—" },
  { name: "Sprint 8 — Morning Brief auto-launch", status: "Planned", tone: "gold", desc: "First open each day → Morning Brief instead of Planner home. Skip if already opened today.", commits: "—" },
  { name: "Sprint 9 — Perimenopause depth", status: "Planned", tone: "gold",  desc: "HRT tracker, hot flash log, brain-fog ribbon, Menopause Rating Scale, peri Jess persona.",        commits: "—" },
  { name: "Sprint 10 — Partner Sync",   status: "Planned",     tone: "gold",  desc: "Partner-facing page. Currently 404. Cycle phase view, mood signal, what-support-helps cards.",   commits: "—" },
  { name: "Sprint 11 — Pre-launch compliance", status: "Required", tone: "blush", desc: "ICO registration, DPA signed, DPIA, granular consent, account-deletion cascade, data export.", commits: "—" },
  { name: "Ritual Builder on /Track",   status: "In Progress", tone: "gold",  desc: "Bundle entry exists on Planner; /Track wire-up still pending so habits route to same surface.",   commits: "e4f1563 (planner side)" },
];

// Tab 2 — Pages (data flow map)
const PAGE_MAP = [
  { page: "Today",         url: "/Today",        reads: "DailyCheckins, SymptomLogs, MealLog, HydrationLog, HabitLogs, MedicationLogs, CycleRecord", writes: "DailyCheckins, SymptomLogs, MealLog, HydrationLog, HabitLogs, MedicationLogs" },
  { page: "Planner",       url: "/Planner",      reads: "DailyCheckins, PersonalTasks, HabitLogs, MealLog, PlannerItems, CycleRecord, Events",        writes: "PersonalTasks, HabitLogs, DailyCheckins" },
  { page: "Pulse",         url: "/Pulse",        reads: "DailyCheckins, SymptomLogs, HabitLogs, CycleRecord, SessionLogs, MealLog",                    writes: "— (read-only)" },
  { page: "Journal",       url: "/Journal",      reads: "JournalEntries",                                                                                writes: "JournalEntries" },
  { page: "Nutrition",     url: "/Nutrition",    reads: "MealLog, HydrationLog",                                                                         writes: "MealLog, HydrationLog" },
  { page: "Doctor Export", url: "/DoctorExport", reads: "DailyCheckins, SymptomLogs, MedicationLogs, SessionLogs, CycleRecord",                          writes: "— (export only)" },
  { page: "Skin & Hair",   url: "/SkinHair",     reads: "DailyCheckins (skin/hair fields)",                                                              writes: "— (logged in Today)" },
  { page: "Profile",       url: "/Profile",      reads: "UserProfile",                                                                                   writes: "UserProfile (life stage, conditions, cycle)" },
  { page: "Track",         url: "/Track",        reads: "CycleRecord, SymptomLogs, HabitLogs, MedicationLogs, SessionLogs",                              writes: "CycleRecord, HabitLogs, MedicationLogs, SessionLogs" },
  { page: "Explore",       url: "/Explore",      reads: "ContentLibrary",                                                                                 writes: "SessionLogs (on session complete)" },
  { page: "Jess",          url: "overlay",       reads: "All entities (context), JessMemory, JessConversations",                                          writes: "JessMemory, JessConversations, DailyCheckins/MealLog/etc (action layer)" },
  { page: "Community",     url: "/Community",    reads: "CommunityPosts",                                                                                 writes: "CommunityPosts" },
  { page: "Life Stage Care", url: "/LifeStageCare", reads: "UserProfile, DailyCheckins",                                                                  writes: "UserProfile (due date)" },
  { page: "Founders OS",   url: "/Ideas",        reads: "UserProfile.founder_ideas, UserProfile.founder_checks",                                          writes: "UserProfile.founder_ideas, UserProfile.founder_checks" },
  { page: "Partner Sync",  url: "/PartnerSync",  reads: "— (not built, 404)",                                                                             writes: "—" },
];

const DATA_RULES = [
  "Today check-in → radiates to Planner body tiles, Pulse, Skin & Hair, Doctor Export, Journal Insights, Jess context.",
  "Life stage (Profile) reshapes every page — every build must be tested across stage changes.",
  "Habit completions on Today AND Planner write to the SAME HabitLogs entity.",
  "Hydration on Today AND Nutrition write to the SAME HydrationLog entity.",
  "Meal logging on Today AND Nutrition write to the SAME MealLog entity.",
  "GP Report is accessible from 3 places (Menu → Care Bridge, Planner Journey, Planner HRT). All routes hit /DoctorExport.",
  "Cycle period logged triggers phase recalc across Today, Planner, Pulse, Explore, Nutrition, Lifestyle.",
  "Jess reads cycle phase, life stage, today's mood/energy, recent symptoms, memory — new entities MUST be exposed to Jess context.",
];

// Tab 3 — Roadmap (vertical timeline)
const ROADMAP = [
  { sprint: "Sprint 1–4",  state: "complete", title: "Core shell + Today + Journal + Planner v1", note: "Auth, life stage onboarding, symptom logging, mood/energy, nutrition, meds, habit streaks, cycle calendar." },
  { sprint: "Sprint 5",    state: "complete", title: "GP Export + Skin & Hair + Pulse",            note: "Read-only Pulse dashboard, Skin & Hair page reads DailyCheckins, Doctor Export bundle." },
  { sprint: "Sprint 6A",   state: "complete", title: "Universal Logger FAB + date pickers",        note: "Cross-page logging, export merge surface." },
  { sprint: "Sprint 6B",   state: "complete", title: "Ritual Builder + Planner v2 full rebuild",    note: "All 12 Planner rows wired; ritual bundles drop-in (no streak)." },
  { sprint: "Sprint 6C",   state: "complete", title: "Jess F1–4 + 7-cat crisis protocol",           note: "History, memory, voice logger, For You tab + Wings." },
  { sprint: "Sprint 5 (Jess Action Layer)", state: "complete", title: "JSON envelope + voice mode + 16 action types", note: "Hybrid envelope, confidence-gated writes, full-screen voice companion." },
  { sprint: "Sprint 7",    state: "current",  title: "Voice to Schedule",                           note: "Mic on Planner → speech → NLP intent → confirm sheet → write task. Web Speech API only." },
  { sprint: "Sprint 8",    state: "planned",  title: "Morning Brief auto-launch",                   note: "First open of the day → Morning Brief instead of Planner home." },
  { sprint: "Sprint 9",    state: "planned",  title: "Perimenopause & menopause depth",              note: "HRT, hot flash, brain fog, MRS, peri Jess persona." },
  { sprint: "Sprint 10",   state: "planned",  title: "Partner Sync page",                            note: "Partner-facing view: phase, mood signal, what helps. Currently 404." },
  { sprint: "Sprint 11",   state: "required", title: "Pre-launch compliance + legal gates",          note: "ICO, DPA, DPIA, granular consent, deletion cascade, data export, teen consent." },
  { sprint: "Launch",      state: "planned",  title: "App Store / Play Store — late 2026",          note: "Capacitor wrap → TestFlight → store submission." },
];

// Tab 4 — Ideas backlog (15+ ideas with priority bucket)
const IDEAS_INITIAL = [
  // High priority — red
  { id: 1,  title: "Unified Health Page",      description: "Single dashboard aggregating ALL health data: cycle, mood/energy trends, symptoms, nutrition, medication, sleep — one place to see the whole picture.", status: "high" },
  { id: 2,  title: "Morning Brief auto-launch", description: "First open of the day auto-launches Morning Brief instead of Planner home. Skip if already opened today.",                                          status: "high" },
  { id: 3,  title: "B2B / employer pathway",    description: "FemWell as a workplace women's health benefit. Enterprise pricing, anonymised aggregate HR reporting. Strong investor narrative thread.",            status: "high" },
  // Planned — gold
  { id: 4,  title: "Pattern Nudges (Jess)",     description: "Jess proactively notices patterns across cycles (e.g. 'you feel tired on days 19–21 consistently — that's your luteal dip'). Max 1 unsolicited message/day.", status: "planned" },
  { id: 5,  title: "Predictive Phase Prep",     description: "Uses the user's own cycle history to prepare them for what's physically coming. No competitor does this well.",                                      status: "planned" },
  { id: 6,  title: "Jess Memory Cards",         description: "Visible summary of what Jess has learned about you — vegetarian, low-energy in luteal, TTC since March, etc.",                                       status: "planned" },
  { id: 7,  title: "Daily Opening Card",        description: "Jess's first message streams in as you open the app. Perceptual step-change vs waiting for a typed reply.",                                          status: "planned" },
  { id: 8,  title: "Astra deep-link",           description: "From any Jess conversation, 'Talk to Astra about this >' hands off to a clinical-style Astra session with full context.",                            status: "planned" },
  { id: 9,  title: "Perimenopause companion",   description: "Jess adapts entirely: no cycle references, brain-fog empathy, HRT support, Menopause Rating Scale.",                                                 status: "planned" },
  { id: 10, title: "Partner Sync",              description: "Partner-facing view: cycle phase, how partner is feeling, what support helps. Currently 404.",                                                       status: "planned" },
  { id: 11, title: "Full data export",          description: "GDPR Art. 20 right to portability. JSON export of every entity tied to the user.",                                                                   status: "planned" },
  { id: 12, title: "Teen companion mode",       description: "Under-18 specific experience, age-appropriate language, parental consent flow, stricter data handling. Legal requirement pre-launch.",                status: "planned" },
  // Future — sage
  { id: 13, title: "Skin & Hair phase guide",   description: "Cycle-aware skincare. Currently a passive read-only page; should become a guide.",                                                                   status: "future" },
  { id: 14, title: "Wearable / device sync",    description: "Apple Health, Garmin, Fitbit ingestion for richer health context (HRV, sleep, steps).",                                                              status: "future" },
  { id: 15, title: "Offline mode",              description: "Cached content + last-N-days data for no-signal use.",                                                                                                status: "future" },
];

// Tab 5 — Strategy (stat cards + competitor strip)
const STATS = [
  { number: "45%",  label: "Flo MAU growth", source: "After LLM fine-tuning deployed in 2024" },
  { number: "57%",  label: "Flo WAU growth", source: "Same deployment window" },
  { number: "$2.6B", label: "Femtech AI invested 2024", source: "+55% YoY (PitchBook)" },
  { number: "7%",   label: "Femtech focused on menopause", source: "~1B affected women globally" },
  { number: "11",   label: "Life stages FemWell covers", source: "Teen → post-menopause. No competitor matches." },
  { number: "Late '26", label: "App Store target", source: "6–8 months from Jan 2026" },
];

const COMPETITORS = [
  { name: "Flo",            theirs: "Cycle + AI assistant",       ours: "Full life stage + warm companion + perimenopause depth" },
  { name: "Clue",            theirs: "Cycle + research-grade data", ours: "AI companion + multi-stage adaptation + UK trust posture" },
  { name: "Natural Cycles",  theirs: "Contraception (FDA-cleared)",  ours: "Holistic wellness, not contraception" },
  { name: "Noom",            theirs: "Behaviour change for weight",  ours: "Women-specific + cycle-aware + perimenopause specialist" },
  { name: "Elvie",           theirs: "Hardware (pelvic floor, pump)", ours: "Software companion that pairs with any hardware" },
];

const NARRATIVES = [
  { title: "Trust window — ICO is live",        body: "UK ICO opened a fertility-app investigation in Dec 2024. Police can now access menstrual data. FemWell ships an explicit law-enforcement data policy. Trust posture = differentiator." },
  { title: "Menopause whitespace",              body: "Only 7% of femtech apps focus on menopause; 1B women affected, no dominant AI companion. FemWell's perimenopause depth claims that space." },
  { title: "Investor narrative",                body: "AI-first + clinically credible + perimenopause whitespace + B2B employer pathway. Each leg defendable. Each leg already in the build plan." },
  { title: "Business model",                    body: "Freemium with £4.99–9.99/month premium tier. Pricing locked AFTER full build + cost analysis. Apple 30% cut (15% after year 1) factored in. No paywalls yet." },
];

// Tab 6 — Legal (15-item checklist)
const LEGAL = [
  { id: "ico-reg",        text: "ICO registration",                                  founder: true },
  { id: "dpia",           text: "DPIA completed",                                    founder: true },
  { id: "base44-dpa",     text: "Base44 DPA signed",                                 founder: true },
  { id: "privacy-policy", text: "Privacy Policy live in-app",                        founder: false },
  { id: "terms",          text: "Terms & Conditions live in-app",                    founder: false },
  { id: "consent-flag",   text: "Granular consent flag on every new data collection point", founder: false },
  { id: "account-del",    text: "Account deletion cascade-deletes all user data (no soft delete)", founder: false },
  { id: "teen-gate",      text: "Teen age gate + parental consent (UK GDPR Art. 8 / AADC)", founder: false },
  { id: "data-export",    text: "Full data export (GDPR Art. 20 — Download my data)", founder: false },
  { id: "privacy-email",  text: "Privacy contact email visible in app",              founder: false },
  { id: "jess-notice",    text: "Jess data notice in Jess header",                   founder: false },
  { id: "crisis-qa",      text: "Crisis protocol QA verified end-to-end",            founder: false },
  { id: "analytics-opt",  text: "Analytics opt-out toggle for users",                founder: false },
  { id: "trademark",      text: "Trademark search — FemWell, UK health/wellness",    founder: true },
  { id: "store-rating",   text: "App Store rating review (expect 12+ for health data)", founder: false },
];

// Tab 7 — Decisions (architecture log)
const DECISIONS = [
  { title: "PlannerV2Shell self-contained",  body: "Locked row order — never import from planner-v2/ row files (dead code). One file, one shell." },
  { title: "Planner row order — locked",     body: "Hero → Lists → Schedule → Your Day → Body Today → Stage → Condition → Rituals → Nourishment → Mind & Insight → Care → Tonight & Tomorrow." },
  { title: "Jess is a wellness companion",   body: "Never diagnostic. Every output reads 'not medical advice'. MHRA risk if Jess sounds clinical." },
  { title: "Freemium split deferred",        body: "Pricing locked AFTER full build + cost analysis. No paywalls in the codebase yet." },
  { title: "Teen life stage = biggest exposure", body: "Parental consent flow before launch. Under-13 = parental consent required. Stricter data handling." },
  { title: "Stay in Base44 for full build",  body: "Don't export mid-build. Capacitor + native shell at the very end of the cycle." },
  { title: "Jess action envelope = Option C", body: "Hybrid JSON: { message, actions[] }. Single API call. Client parses + executes entity writes." },
  { title: "No HTML files for Halli",        body: "Halli is on her phone — HTML files don't render. Interactive tools must ship as real app pages." },
  { title: "Base44 Issues — Resolve with AI", body: "Click 'Resolve with AI' on the Issues dialog. Free. If the tab freezes, reload it." },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function loadIdeasFromCache() {
  try {
    const raw = window.localStorage?.getItem(IDEAS_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : null;
  } catch { return null; }
}
function saveIdeasToCache(arr) {
  try { window.localStorage?.setItem(IDEAS_KEY, JSON.stringify(arr || [])); } catch { /* swallow */ }
}
function loadChecksFromCache() {
  try {
    const raw = window.localStorage?.getItem(CHECKS_KEY);
    if (!raw) return [];
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch { return []; }
}
function saveChecksToCache(arr) {
  try { window.localStorage?.setItem(CHECKS_KEY, JSON.stringify(arr || [])); } catch { /* swallow */ }
}

function statusTone(status) {
  if (status === "high")    return { border: T.red,   pill: T.redSoft,   text: T.red,   label: "High priority" };
  if (status === "planned") return { border: T.gold,  pill: T.goldSoft,  text: T.gold,  label: "Planned" };
  if (status === "future")  return { border: T.sage,  pill: T.sageSoft,  text: T.sage,  label: "Future" };
  return { border: T.border, pill: T.surfaceHi, text: T.textMuted, label: status || "Idea" };
}

function labTone(tone) {
  switch (tone) {
    case "sage":  return T.sage;
    case "gold":  return T.gold;
    case "blush": return T.blush;
    default:      return T.textMuted;
  }
}

function roadmapDot(state) {
  if (state === "complete") return { fill: T.sage, ring: T.sageSoft,  label: "Complete" };
  if (state === "current")  return { fill: T.gold, ring: T.goldSoft,  label: "Current" };
  if (state === "required") return { fill: T.blush, ring: T.blushSoft, label: "Required" };
  return { fill: T.textMuted, ring: "transparent", label: "Planned" };
}

// ─── Reusable shell pieces ────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: 0.7, textTransform: "uppercase",
      color: T.textMuted, marginBottom: 12, fontWeight: 600,
    }}>{children}</div>
  );
}

function StatusDot({ color }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 99,
      backgroundColor: color, display: "inline-block",
      boxShadow: `0 0 0 3px ${color}26`,
    }} />
  );
}

// ─── Main export ──────────────────────────────────────────────────────
export default function FoundersOS() {
  const { user, loading } = useAuth();
  const email = String(user?.email || "").trim().toLowerCase();

  if (loading) {
    return <FullBleed><div style={{ color: T.textMuted, padding: 24 }}>Loading…</div></FullBleed>;
  }

  if (!ALLOWED.has(email)) {
    return <NotAuthorised />;
  }

  return <FoundersInner user={user} />;
}

// Full-bleed dark page wrapper (no chrome).
function FullBleed({ children }) {
  return (
    <div style={{
      backgroundColor: T.bg,
      color: T.textHi,
      minHeight: "100vh",
      width: "100%",
      fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
    }}>{children}</div>
  );
}

function NotAuthorised() {
  return (
    <FullBleed>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}>
        <div style={{
          backgroundColor: T.surface, borderRadius: 14,
          padding: "32px 24px", maxWidth: 360, width: "100%",
          border: `1px solid ${T.border}`, textAlign: "center",
        }}>
          <div style={{
            fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
            fontSize: 22, fontWeight: 600, color: T.gold, marginBottom: 10,
          }}>This page is private</div>
          <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
            Founders OS is only accessible to the FemWell founder. If you reached here by accident, head back to the rest of the app.
          </div>
          <a href="/Today" style={{
            display: "inline-block", padding: "10px 18px", borderRadius: 999,
            backgroundColor: T.gold, color: "#1C1410", textDecoration: "none",
            fontWeight: 600, fontSize: 13, letterSpacing: 0.3,
          }}>Back to Today</a>
        </div>
      </div>
    </FullBleed>
  );
}

function FoundersInner({ user }) {
  const [tab, setTab] = useState("Lab");

  // ── Shared Health Corner data fetch (Sprint 13). ──────────────────
  // All three "HC: …" tabs read from the same set of entities. We
  // fetch once at this level and pass the buckets down as props so
  // each tab renders instantly when switched.
  // FemWell convention: `user_id` AND `created_by` (email) both occur
  // in the wild depending on which writer created the row. We merge.
  const [hc, setHc] = useState({
    profile: null,
    checkins: [], symptoms: [], meals: [], meds: [], supps: [], habits: [], skinLogs: [],
    loading: true,
  });
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const both = async (entName) => {
          const ent = base44.entities?.[entName];
          if (!ent?.filter) return [];
          const [a, b] = await Promise.all([
            ent.filter({ user_id: user.id }).catch(() => []),
            user.email ? ent.filter({ created_by: user.email }).catch(() => []) : Promise.resolve([]),
          ]);
          const seen = new Set(); const out = [];
          for (const r of [...(a || []), ...(b || [])]) {
            if (!r || seen.has(r.id)) continue;
            seen.add(r.id); out.push(r);
          }
          return out;
        };
        const [profiles, chk, sym, meal, med, supp, hab, skin] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: user.id }, null, 1).catch(() => []),
          both("DailyCheckins"),
          both("SymptomLogs"),
          both("MealLog"),
          both("MedicationLogs"),
          both("SupplementLog"),
          both("HabitLogs"),
          base44.entities?.SkinHairLogs ? both("SkinHairLogs") : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setHc({
          profile: profiles?.[0] || null,
          checkins: chk, symptoms: sym, meals: meal,
          meds: med, supps: supp, habits: hab, skinLogs: skin,
          loading: false,
        });
      } catch {
        if (!cancelled) setHc((s) => ({ ...s, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, user?.email]);

  return (
    <FullBleed>
      {/* Fixed top bar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        backgroundColor: T.bg,
        borderBottom: `1px solid ${T.border}`,
        padding: "18px 20px 14px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            gap: 16, flexWrap: "wrap",
          }}>
            <div>
              <div style={{
                fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
                fontSize: 24, fontWeight: 600, color: T.gold,
                letterSpacing: -0.2, lineHeight: 1.1,
              }}>FemWell Founder OS</div>
              <div style={{ color: T.textMuted, fontSize: 12.5, marginTop: 4 }}>
                Your living app mind map · updated every session
              </div>
            </div>
            <div style={{
              fontSize: 11, color: T.textMuted, letterSpacing: 0.5,
              textTransform: "uppercase", fontWeight: 600,
            }}>
              Signed in as <span style={{ color: T.gold }}>{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky tab rail */}
      <nav style={{
        position: "sticky", top: 78, zIndex: 29,
        backgroundColor: T.bg,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          overflowX: "auto", scrollbarWidth: "none",
        }}>
          <div style={{ display: "flex", gap: 4, padding: "0 12px" }}>
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "14px 16px 12px",
                    background: "transparent",
                    border: "none",
                    color: active ? T.gold : T.textMuted,
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    letterSpacing: 0.2,
                    cursor: "pointer",
                    borderBottom: `2px solid ${active ? T.gold : "transparent"}`,
                    marginBottom: -1,
                    whiteSpace: "nowrap",
                    transition: "color 0.15s ease",
                  }}
                >{t}</button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Tab content */}
      <main style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "20px 16px 80px",
      }}>
        {tab === "Lab"       && <LabTab />}
        {tab === "Pages"     && <PagesTab />}
        {tab === "Roadmap"   && <RoadmapTab />}
        {tab === "Ideas"     && <IdeasTab user={user} />}
        {tab === "Strategy"  && <StrategyTab />}
        {tab === "Legal"     && <LegalTab />}
        {tab === "Decisions" && <DecisionsTab />}
        {tab === "🏥 Health Corner" && <HealthCornerDemo {...hc} />}
      </main>
    </FullBleed>
  );
}

// ─── Tab 1 — Lab (feature cards) ──────────────────────────────────────
function LabTab() {
  const shipped = LAB.filter((l) => l.status === "Shipped").length;
  return (
    <div>
      <SectionLabel>Lab · {LAB.length} features · {shipped} shipped</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
      }}>
        {LAB.map((card, i) => <LabCard key={i} card={card} />)}
      </div>
    </div>
  );
}

function LabCard({ card }) {
  const accent = labTone(card.tone);
  return (
    <article style={{
      backgroundColor: T.surface,
      borderRadius: 10,
      borderLeft: `3px solid ${accent}`,
      padding: "14px 16px 16px",
      border: `1px solid ${T.border}`,
      borderLeftWidth: 3,
      borderLeftColor: accent,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <StatusDot color={accent} />
        <span style={{
          fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase",
          color: accent, fontWeight: 600,
        }}>{card.status}</span>
      </div>
      <div style={{
        fontSize: 16, fontWeight: 600, color: T.textHi,
        marginBottom: 6, lineHeight: 1.3,
      }}>{card.name}</div>
      <div style={{ fontSize: 13.5, color: T.textMuted, lineHeight: 1.55, marginBottom: 10 }}>
        {card.desc}
      </div>
      <div style={{
        fontSize: 11, color: T.textMuted, letterSpacing: 0.3,
        fontFamily: '"SF Mono", "Roboto Mono", monospace',
      }}>
        {card.commits}
      </div>
    </article>
  );
}

// ─── Tab 2 — Pages (data flow map) ────────────────────────────────────
function PagesTab() {
  return (
    <div>
      <SectionLabel>Page Map · 15 surfaces</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        marginBottom: 28,
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse", minWidth: 720,
            fontSize: 13,
          }}>
            <thead>
              <tr style={{ backgroundColor: T.surfaceHi }}>
                <th style={thStyle}>Page</th>
                <th style={thStyle}>Reads from</th>
                <th style={thStyle}>Writes to</th>
              </tr>
            </thead>
            <tbody>
              {PAGE_MAP.map((row, i) => (
                <tr key={row.page} style={{
                  backgroundColor: i % 2 === 0 ? T.surface : T.bg,
                  borderTop: `1px solid ${T.border}`,
                }}>
                  <td style={pageNameCell}>
                    <div style={{ color: T.textHi, fontWeight: 600 }}>{row.page}</div>
                    <div style={{
                      color: T.textMuted, fontSize: 11, marginTop: 2,
                      fontFamily: '"SF Mono", "Roboto Mono", monospace',
                    }}>{row.url}</div>
                  </td>
                  <td style={pillCell}>
                    <Pills items={row.reads} tone="sage" />
                  </td>
                  <td style={pillCell}>
                    <Pills items={row.writes} tone="blush" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SectionLabel>Critical Data Rules · always respect these</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DATA_RULES.map((rule, i) => (
          <div key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "14px 16px",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <div style={{
              minWidth: 30, height: 30, borderRadius: 99,
              backgroundColor: T.goldSoft,
              color: T.gold,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13,
              flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.55 }}>{rule}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px 14px",
  textAlign: "left",
  color: T.gold,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};
const pageNameCell = {
  padding: "12px 14px",
  verticalAlign: "top",
  minWidth: 140,
};
const pillCell = {
  padding: "12px 14px",
  verticalAlign: "top",
};

function Pills({ items, tone }) {
  const list = String(items || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0 || list[0].startsWith("—") || list[0].toLowerCase().includes("not built")) {
    return <span style={{ color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>{items}</span>;
  }
  const bg = tone === "sage" ? T.sageSoft : T.blushSoft;
  const fg = tone === "sage" ? T.sage : T.blush;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {list.map((item, i) => (
        <span key={i} style={{
          backgroundColor: bg, color: fg,
          padding: "3px 8px", borderRadius: 4,
          fontSize: 11.5, fontWeight: 500,
          fontFamily: '"SF Mono", "Roboto Mono", monospace',
          letterSpacing: 0.1,
        }}>{item}</span>
      ))}
    </div>
  );
}

// ─── Tab 3 — Roadmap (vertical timeline) ──────────────────────────────
function RoadmapTab() {
  return (
    <div>
      <SectionLabel>Sprint Roadmap · {ROADMAP.length} milestones</SectionLabel>
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* vertical line */}
        <div style={{
          position: "absolute",
          left: 9, top: 6, bottom: 6,
          width: 2, backgroundColor: T.border,
        }} />
        {ROADMAP.map((s, i) => <RoadmapRow key={i} sprint={s} />)}
      </div>
    </div>
  );
}

function RoadmapRow({ sprint }) {
  const dot = roadmapDot(sprint.state);
  const isCurrent = sprint.state === "current";
  const isPlanned = sprint.state === "planned";
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <div style={{
        position: "absolute", left: -28, top: 14,
        width: 20, height: 20, borderRadius: 99,
        backgroundColor: dot.fill,
        boxShadow: `0 0 0 4px ${dot.ring}`,
        border: `2px solid ${T.bg}`,
      }} />
      <div style={{
        backgroundColor: isPlanned ? T.bg : T.surface,
        border: `1px solid ${isCurrent ? T.gold : T.border}`,
        borderRadius: 10,
        padding: "14px 16px 16px",
        opacity: isPlanned ? 0.78 : 1,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
          flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: 11, color: T.gold, letterSpacing: 0.5,
            textTransform: "uppercase", fontWeight: 700,
          }}>{sprint.sprint}</span>
          <span style={{
            backgroundColor: dot.ring, color: dot.fill,
            fontSize: 10.5, padding: "2px 8px", borderRadius: 99,
            fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase",
          }}>{dot.label}</span>
        </div>
        <div style={{
          fontSize: 15, fontWeight: 600, color: T.textHi,
          marginBottom: 4, lineHeight: 1.3,
        }}>{sprint.title}</div>
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>{sprint.note}</div>
      </div>
    </div>
  );
}

// ─── Tab 4 — Ideas backlog ────────────────────────────────────────────
function IdeasTab({ user }) {
  const [ideas, setIdeas] = useState(IDEAS_INITIAL);
  const [profileId, setProfileId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Hydrate from UserProfile → localStorage → defaults
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await base44.entities?.UserProfile?.list?.();
        if (!cancelled && Array.isArray(list)) {
          const me = list.find((p) => p?.user_id === user?.id) || list[0];
          if (me?.id) setProfileId(me.id);
          if (Array.isArray(me?.founder_ideas) && me.founder_ideas.length > 0) {
            setIdeas(me.founder_ideas);
            saveIdeasToCache(me.founder_ideas);
            return;
          }
        }
      } catch { /* fall through */ }
      const cached = loadIdeasFromCache();
      if (!cancelled && Array.isArray(cached) && cached.length > 0) setIdeas(cached);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const persist = useCallback(async (nextArr) => {
    setIdeas(nextArr);
    saveIdeasToCache(nextArr);
    if (profileId) {
      try {
        await base44.entities?.UserProfile?.update?.(profileId, { founder_ideas: nextArr });
      } catch { /* swallow */ }
    }
  }, [profileId]);

  const onAdd = useCallback(async () => {
    const t = newTitle.trim();
    if (!t) return;
    setSaving(true);
    const idea = {
      id: Date.now(),
      title: t,
      description: newDesc.trim(),
      status: "planned",
      ts: Date.now(),
    };
    await persist([idea, ...ideas]);
    setNewTitle("");
    setNewDesc("");
    setSaving(false);
  }, [newTitle, newDesc, ideas, persist]);

  const counts = useMemo(() => ({
    high:    ideas.filter((i) => i.status === "high").length,
    planned: ideas.filter((i) => i.status === "planned").length,
    future:  ideas.filter((i) => i.status === "future").length,
  }), [ideas]);

  return (
    <div>
      <SectionLabel>
        Ideas backlog · {counts.high} high · {counts.planned} planned · {counts.future} future
      </SectionLabel>

      {/* Add Idea row */}
      <div style={{
        backgroundColor: T.surfaceHi,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 18,
      }}>
        <div style={{
          fontSize: 12, color: T.textMuted, marginBottom: 10,
          letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600,
        }}>Add a new idea</div>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title…"
          style={inputStyle}
        />
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="What is it? Why does it matter?"
          rows={2}
          style={{ ...inputStyle, marginTop: 8, resize: "vertical", fontFamily: "inherit" }}
        />
        <button
          onClick={onAdd}
          disabled={!newTitle.trim() || saving}
          style={{
            marginTop: 10,
            padding: "10px 18px",
            borderRadius: 999,
            backgroundColor: newTitle.trim() ? T.gold : T.surface,
            color: newTitle.trim() ? "#1C1410" : T.textMuted,
            border: "none",
            fontWeight: 600, fontSize: 13, letterSpacing: 0.3,
            cursor: newTitle.trim() ? "pointer" : "default",
          }}
        >{saving ? "Saving…" : "Add idea"}</button>
      </div>

      {/* Backlog */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: T.bg,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.textHi,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

function IdeaCard({ idea }) {
  const tone = statusTone(idea.status);
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderLeft: `4px solid ${tone.border}`,
      borderRadius: 10,
      padding: "14px 16px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 12, marginBottom: 6,
      }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: T.textHi, lineHeight: 1.3 }}>
          {idea.title}
        </div>
        <span style={{
          backgroundColor: tone.pill, color: tone.text,
          fontSize: 10.5, padding: "3px 9px", borderRadius: 99,
          fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>{tone.label}</span>
      </div>
      {idea.description ? (
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>
          {idea.description}
        </div>
      ) : null}
    </article>
  );
}

// ─── Tab 5 — Strategy ─────────────────────────────────────────────────
function StrategyTab() {
  return (
    <div>
      <SectionLabel>Market signals</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 10, marginBottom: 28,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "18px 16px 16px",
          }}>
            <div style={{
              fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
              fontSize: 30, fontWeight: 700, color: T.gold,
              lineHeight: 1.1, marginBottom: 8, letterSpacing: -0.5,
            }}>{s.number}</div>
            <div style={{
              fontSize: 13.5, color: T.textHi, fontWeight: 600,
              marginBottom: 4, lineHeight: 1.3,
            }}>{s.label}</div>
            <div style={{ fontSize: 11.5, color: T.textMuted, lineHeight: 1.4 }}>
              {s.source}
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Competitor strip · why FemWell wins each lane</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {COMPETITORS.map((c) => (
          <div key={c.name} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "14px 16px",
            display: "grid",
            gridTemplateColumns: "minmax(80px, 100px) 1fr 1fr",
            gap: 14, alignItems: "center",
          }}>
            <div style={{
              fontSize: 15, fontWeight: 600, color: T.gold, letterSpacing: 0.2,
            }}>{c.name}</div>
            <div>
              <div style={{
                fontSize: 10.5, color: T.textMuted, letterSpacing: 0.5,
                textTransform: "uppercase", fontWeight: 600, marginBottom: 4,
              }}>Their lane</div>
              <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.45 }}>{c.theirs}</div>
            </div>
            <div>
              <div style={{
                fontSize: 10.5, color: T.sage, letterSpacing: 0.5,
                textTransform: "uppercase", fontWeight: 600, marginBottom: 4,
              }}>FemWell wins because</div>
              <div style={{ fontSize: 13, color: T.textHi, lineHeight: 1.45 }}>{c.ours}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Narratives</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {NARRATIVES.map((n) => (
          <div key={n.title} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "14px 16px",
          }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: T.gold,
              marginBottom: 6, letterSpacing: 0.2,
            }}>{n.title}</div>
            <div style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.6 }}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 6 — Legal checklist ──────────────────────────────────────────
function LegalTab() {
  const [done, setDone] = useState(() => loadChecksFromCache());
  const toggle = useCallback((id) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveChecksToCache(next);
      return next;
    });
  }, []);
  const completed = LEGAL.filter((item) => done.includes(item.id)).length;
  const pct = Math.round((completed / LEGAL.length) * 100);

  return (
    <div>
      <SectionLabel>Pre-launch legal gates · {completed}/{LEGAL.length} complete</SectionLabel>

      {/* Progress bar */}
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 16, marginBottom: 18,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 13, color: T.textMuted }}>Progress to launch-ready</div>
          <div style={{ fontSize: 18, color: T.gold, fontWeight: 700 }}>{pct}%</div>
        </div>
        <div style={{
          width: "100%", height: 8, borderRadius: 99,
          backgroundColor: T.bg, overflow: "hidden",
        }}>
          <div style={{
            width: `${pct}%`, height: "100%",
            backgroundColor: T.gold,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LEGAL.map((item) => {
          const isDone = done.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", textAlign: "left",
                cursor: "pointer",
                color: T.textHi,
                fontFamily: "inherit",
              }}
            >
              {/* Custom checkbox */}
              <span style={{
                minWidth: 22, height: 22, borderRadius: 6,
                border: `1.5px solid ${isDone ? T.gold : T.border}`,
                backgroundColor: isDone ? T.gold : T.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}>
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L6 11L12 3" stroke="#1C1410" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
              <span style={{
                flex: 1, fontSize: 13.5, lineHeight: 1.45,
                color: isDone ? T.textMuted : T.textHi,
                textDecoration: isDone ? "line-through" : "none",
              }}>{item.text}</span>
              {item.founder ? (
                <span style={{
                  backgroundColor: T.blushSoft, color: T.blush,
                  fontSize: 10, padding: "3px 8px", borderRadius: 99,
                  fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>Your action</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 7 — Decisions ────────────────────────────────────────────────
function DecisionsTab() {
  return (
    <div>
      <SectionLabel>Architecture decisions · locked</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DECISIONS.map((d, i) => (
          <article key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.gold}`,
            borderRadius: 8,
            padding: "14px 16px",
          }}>
            <div style={{
              fontSize: 14.5, fontWeight: 600, color: T.textHi,
              marginBottom: 5, lineHeight: 1.35,
            }}>{d.title}</div>
            <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>{d.body}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
