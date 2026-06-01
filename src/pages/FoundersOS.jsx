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
// HealthCornerDemo was the multi-layout preview. The canonical health
// experience now lives at /Health (src/pages/Health.jsx). The Health Corner
// tab in /Ideas renders <HealthCornerRedirectCard /> instead.
// import HealthCornerDemo from "./HealthCornerDemo";

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

const TABS = ["Lab", "Pages", "Roadmap", "Ideas", "Strategy", "Legal", "Decisions", "Journal", "Another You", "UX & Design", "Wholeness", "LGBTQ+", "🏥 Health Corner"];

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

function PageHeader({ title, subtitle, badge, badgeTone = "red" }) {
  const tone = badgeTone === "gold"
    ? { bg: T.goldSoft, fg: T.gold, border: T.gold }
    : badgeTone === "sage"
      ? { bg: T.sageSoft, fg: T.sage, border: T.sage }
      : { bg: T.redSoft, fg: T.red, border: T.red };
  return (
    <div style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "22px 22px 20px",
      marginBottom: 22,
    }}>
      <div style={{
        fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
        fontSize: 28, fontWeight: 700, color: T.gold,
        letterSpacing: -0.4, lineHeight: 1.15, marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontSize: 13, color: T.textMid, lineHeight: 1.55, marginBottom: badge ? 14 : 0,
      }}>{subtitle}</div>
      {badge && (
        <div style={{
          display: "inline-block",
          background: tone.bg, color: tone.fg,
          border: `1px solid ${tone.border}`,
          borderRadius: 6, padding: "5px 12px",
          fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
          textTransform: "uppercase",
        }}>{badge}</div>
      )}
    </div>
  );
}

function FeatureCard({ n, name, tagline, body, tier }) {
  const tierStyle = tier === "addon"
    ? { bg: T.surfaceHi, fg: T.textMuted, border: T.border, label: "Addon" }
    : { bg: T.goldSoft, fg: T.gold, border: T.gold, label: "Core" };
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "18px 20px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: tier === "addon" ? T.surfaceHi : T.goldSoft,
          color: tier === "addon" ? T.textMuted : T.gold,
          border: `1px solid ${tier === "addon" ? T.border : T.gold}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
          fontSize: 18, fontWeight: 700, flexShrink: 0,
        }}>{n}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            {tier && (
              <span style={{
                background: tierStyle.bg, color: tierStyle.fg,
                border: `1px solid ${tierStyle.border}`,
                padding: "2px 8px", borderRadius: 999,
                fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2,
                textTransform: "uppercase",
              }}>{tierStyle.label}</span>
            )}
            <div style={{
              fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
              fontSize: 18, fontWeight: 700, color: T.textHi,
              letterSpacing: -0.1, lineHeight: 1.25,
            }}>{name}</div>
          </div>
          {tagline && (
            <div style={{
              fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
              fontSize: 13.5, fontStyle: "italic", color: T.blush,
              lineHeight: 1.5, marginBottom: 8,
            }}>{tagline}</div>
          )}
        </div>
      </div>
      <p style={{
        fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0,
      }}>{body}</p>
    </article>
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
        {tab === "Journal"     && <JournalTab />}
        {tab === "Another You" && <AnotherYouTab />}
        {tab === "UX & Design" && <UxDesignTab />}
        {tab === "Wholeness"   && <WholenessTab />}
        {tab === "LGBTQ+"      && <LgbtqTab />}
        {tab === "🏥 Health Corner" && <HealthCornerRedirectCard />}
      </main>
    </FullBleed>
  );
}

// ─── Tab — Health Corner: now redirects to the real /Health page ─────
// The full health-letter experience lives at /Health. This tab just
// points users there so we don't ship two parallel UIs.
function HealthCornerRedirectCard() {
  return (
    <div style={{ padding: "40px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{
        maxWidth: 480,
        background: "#FEFAF2",
        border: "1px solid rgba(212,175,55,0.4)",
        borderRadius: 12,
        padding: "32px 28px",
        textAlign: "center",
        boxShadow: "0 10px 28px rgba(58,44,26,0.12)",
      }}>
        <div style={{
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 11, letterSpacing: 2, color: "#9B8B7A", textTransform: "uppercase",
          fontWeight: 700, marginBottom: 8,
        }}>FemWell Health Letter</div>
        <div style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 22, fontWeight: 700, color: "#3A2C1A",
          marginBottom: 12, lineHeight: 1.3,
        }}>The Health hub now lives at its own page.</div>
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 15, lineHeight: 1.7, color: "#3A2C1A", marginBottom: 20,
        }}>
          The Letter-format Health page has replaced this preview, the old Skin &amp; Hair
          page, and Life Stage Care. It's a single hub with all eight tabs &mdash; Overview,
          Cycle, Life Stage, Skin &amp; Hair, Body, Mind, Nourishment, Care.
        </p>
        <a href="/Health" style={{
          display: "inline-block",
          padding: "10px 22px",
          background: "#3A2C1A",
          color: "#F4EDDB",
          textDecoration: "none",
          borderRadius: 999,
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: 13, fontWeight: 600, letterSpacing: 0.4,
        }}>Open Health &nbsp;&rarr;</a>
      </div>
    </div>
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

// ════════════════════════════════════════════════════════════════════════════
// Tab — Journal · Master Plan
// ════════════════════════════════════════════════════════════════════════════
// Updated 2026-06-01. Phase 1 is in active build. Sections 2–10 collapsed
// by default; Section 1 (Vision) and Section 11 (Whole-App Vision Note) are
// always-open gold cards. Render via JournalTab().
const J_PHASE_PROMPTS = [
  { phase: "MENSTRUAL",     register: "inward · body-listening · rest-permission" },
  { phase: "FOLLICULAR",    register: "generative · expansive · curious" },
  { phase: "OVULATORY",     register: "relational · outward · celebratory" },
  { phase: "LUTEAL",        register: "editing · letting go · processing" },
];
const J_ENTRY_GROUPS = [
  {
    label: "CORE",
    items: [
      ["Free Write", "Open canvas, optional phase prompt, dismissible."],
      ["Gratitude", "4-field science-backed: what happened / why it matters / who contributed / how it changed you."],
      ["Reflection", "What went well / what you'd do differently / one thing to carry forward."],
      ["Mood Journal", "Mood context, what's driving it, what you need."],
      ["Voice Journal", "Speak it, Jess lightly reformats the transcription. User can revert to raw."],
      ["Dream Log", "Morning capture before it fades. Pregnancy variant for T1/T2 vivid dreams."],
    ],
  },
  {
    label: "ON THIS DAY",
    items: [["On This Day", "Auto-card from same cycle day last month. \"Reply to past self\" links a new entry. Dismissible."]],
  },
  {
    label: "LIFE DIMENSIONS · WHOLENESS",
    items: [
      ["Work & Career", "What's happening professionally, how does it feel."],
      ["Relationships", "People in life and how dynamics feel."],
      ["Money", "Financial state, anxiety, wins, decisions."],
      ["Creative", "What you're making, imagining, noticing."],
      ["Grief", "Dedicated container. No insights generated. No streak. Just holding."],
      ["Joy", "Mundane actual things. The coffee. The song. Not gratitude practice."],
      ["Identity", "Who you're becoming, what you're releasing."],
    ],
  },
  {
    label: "SHADOW · BURN",
    items: [
      ["Burn Mode", "User sets timer: 1hr / 24hr / specific date / tap to burn. Amber countdown. Fire animation on burn. Jess NEVER reads burn entries."],
      ["Night Self · 3AM Mode", "Auto-activates 11pm–4am. Full screen, one field, no prompts. Keep or Release."],
      ["Unsent Letter", "To someone you can't or won't send to. Cannot export. Cannot share."],
      ["Future Self Letter", "Sealed on write. Burns on chosen date or life stage transition. Arrival Ceremony on unlock."],
      ["Past Self Letter", "Write to yourself at a previous life stage. Self-compassion."],
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      ["Open Letter", "Published to Shared feed with your excerpt. 150-char replies only. Echo mechanic."],
      ["Writing Club", "5 women, same prompt, 48-hour window. No one sees each other's content. Jess synthesises themes only."],
    ],
  },
  {
    label: "GP",
    items: [["GP Note", "Natural-language symptom description → Jess reformats for clinical clarity → Doctor Export queue."]],
  },
];
const J_JESS_ROLES = [
  {
    label: "PROMPTER",
    body: "One phase-aware, life-stage-aware prompt on entry creation. Dismissible. 200 prompt variants (7 per phase × 4 phases × 7 entry types). Voice prompts when voice mode is active.",
  },
  {
    label: "WITNESS",
    body: "Weekly Still Point — one observation from the week's writing, never interpreted. \"You used the word 'invisible' four times this week.\" That's all. No recommendation.",
  },
  {
    label: "ANALYST",
    body: "Insights tab pattern detection, Monthly Cycle Letter, GP question surfacing. Always labelled as Jess's analysis. Always with \"not medical advice.\"",
  },
];
const J_JESS_NEVER = [
  "Repeats journal content back in chat unless asked.",
  "Says \"I noticed you wrote about X\" as an unprompted opener.",
  "Analyses Burn Mode, Night Self, or Grief entries.",
  "Shares journal themes with Doctor Export without explicit per-entry consent.",
  "Per-entry \"Not for Jess\" toggle excludes from all Jess context permanently.",
];
const J_TIERS = [
  {
    tier: "TIER 1 · from day 1",
    items: ["Writing rhythm calendar (7-day dots — never a zero counter; \"last wrote 3 days ago\" on break).", "Last entry mood tag.", "Phase write count."],
  },
  {
    tier: "TIER 2 · after 7 entries",
    items: ["Logged mood vs journal sentiment dual line chart, phase bands.", "Top themes this week (user can see and clear).", "Word count trend."],
  },
  {
    tier: "TIER 3 · after 1 complete cycle",
    items: ["Phase mood radar (6 axes: Body / Relationships / Work / Future / Rest / Emotions).", "Phase journalling frequency.", "Luteal theme extraction.", "Monthly Cycle Letter from Jess — warm narrative of the cycle that just passed."],
  },
  {
    tier: "TIER 4 · after 3 cycles",
    items: ["Cycle-over-cycle comparison.", "On This Day dual mode (calendar date + same cycle phase last cycle — FemWell-unique).", "Predictive prompts based on past patterns.", "Pattern insight card with \"Save for GP\" action."],
  },
];
const J_TIER_EXTRAS = [
  "Journal days vs non-journal days mood comparison.",
  "Skin/hair keyword detection → Skin & Hair page.",
  "Relationship map from Jess (names mentioned, available on request).",
];
const J_PHASE_ADAPTATION = [
  { phase: "MENSTRUAL",  body: "Quieter interface. Muted colours. Fewer prompts. Jess is gentle, slow. No streak pressure. Grace period — writing threshold drops, notifications pause." },
  { phase: "FOLLICULAR", body: "Warmer, crisper interface. Jess is curious and expansive. Prompts are generative. Community share nudge appears." },
  { phase: "OVULATORY",  body: "Most outward UI moment. Jess is warm and relational. Community share nudge strongest here. Prompts: connection, expression, celebration." },
  { phase: "LUTEAL",     body: "Editing energy. Jess is honest and grounding. IFS parts-work prompts appear. Prompts: letting go, completing, processing. Share nudge disappears." },
];
const J_CROSS_PAGE = [
  ["Journal ← Today",            "Opens with today's check-in pre-loaded as context card. \"You logged mood 2/5 today — write about it?\""],
  ["Journal → Planner",          "Overwhelm language → capacity softens. Packed planner → Jess prompt: \"How do you feel about today?\""],
  ["Journal → Pulse",            "Sentiment as second mood stream. Writing frequency as wellbeing signal."],
  ["Journal → Jess",             "Last 3–5 entries summarised in JessMemory. journal_recent_themes field."],
  ["Journal → Doctor Export",    "GP Note entries + pattern insights, with per-entry consent. \"Patient's own words\" section."],
  ["Journal → Health/Life Corner","Themes → content recommendations. Letters reference user's language."],
  ["Journal → Skin & Hair",      "Skin/hair keyword extraction surfaced in Skin & Hair page."],
  ["Journal → Partner Sync",     "Journal NEVER shared by default. Only Partner Note entry type can share."],
  ["Journal → Another You",      "Shadow Journal reads from JournalEntries. Burn Mode never read by anything."],
];
const J_UX_PATTERNS = [
  ["GOOGLE MAPS draggable card",     "Entry creation is a bottom sheet with 3 snap points: peek (type chips) → half (type + prompt + field) → full (composer)."],
  ["SNAPCHAT hold-to-record",        "Hold mic for voice journal. Release to finish. Jess lightly reformats."],
  ["APPLE NOTES text selection",     "Select text → contextual menu: \"Ask Jess about this\" / \"Save to GP notes\"."],
  ["INSTAGRAM stories tap-to-advance","On Insights tab, cards advance by tapping right edge."],
  ["SHOPIFY recovery",                "Streak break shows \"Last wrote 3 days ago — welcome back\" — not a zeroed counter."],
  ["SIGNAL disappearing",             "Burn Mode timer is a featured UI element (amber countdown dial), not a settings option."],
  ["TELEGRAM reactions",              "Swipe entry → quick emoji tag (heavy / good / confused / grateful)."],
];
const J_LGBTQ = [
  "Prompts use \"partner\" not \"him/her/boyfriend\".",
  "Cycle prompts use \"your cycle\" not \"your period\" where appropriate.",
  "Trans users on HRT get a separate prompt library using \"your HRT pattern\" as primary context.",
  "Partner Note entry type works for any relationship structure.",
];
const J_BUILD_PHASES = [
  {
    label: "PHASE 1 · NOW",
    status: "in build",
    items: [
      "Public/private tab architecture.",
      "Draggable bottom sheet composer.",
      "Phase-aware prompts (4 phases × 5 entry types).",
      "Burn Mode with user-set timer.",
      "On This Day (calendar mode).",
      "Writing rhythm dots (not counter).",
      "Life dimension entry types.",
      "Today context card cross-wired.",
      "Tier 1 + 2 insights.",
    ],
  },
  {
    label: "PHASE 2",
    status: "planned",
    items: [
      "Voice journalling.",
      "Tier 3 insights + Monthly Cycle Letter.",
      "Text selection actions (Ask Jess / GP).",
      "Night Self / 3AM Mode.",
      "Grief container.",
    ],
  },
  {
    label: "PHASE 3",
    status: "planned",
    items: [
      "Community features — Open Letters, Shared feed, Writing Club, Echo mechanic.",
      "Future Self Letters with Arrival Ceremony.",
      "Unsent Letters.",
    ],
  },
  {
    label: "PHASE 4",
    status: "planned",
    items: [
      "Tier 4 insights.",
      "Another You / Shadow Journal integration.",
      "Full phase UI adaptation.",
      "GP Note entry type.",
    ],
  },
];

function JournalAccordion({ id, title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id={`journal-${id}`}
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          color: T.textHi,
          font: '700 14.5px/1.3 "Fraunces", Georgia, serif',
          letterSpacing: 0.2,
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.5,
            background: T.goldSoft, padding: "3px 8px", borderRadius: 4,
          }}>{count}</span>
          <span>{title}</span>
        </span>
        <span style={{ color: T.gold, fontSize: 16, fontWeight: 700 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ paddingTop: 14 }}>{children}</div>
        </div>
      )}
    </section>
  );
}

function JournalTab() {
  return (
    <div>
      <PageHeader
        title="Journal — Master Plan"
        subtitle="Every feature researched, surfaced and structured. The most complete spec in the app."
        badge="PHASE 1 BUILD IN PROGRESS"
        badgeTone="gold"
      />

      {/* SECTION 1 — Vision (always open, gold) */}
      <SectionLabel>Section 1 · Vision</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 20,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          The Journal is the app's soul. Every other page in FemWell is data. The Journal is meaning — the texture
          of a woman's life across time. It holds what numbers can't. Done right, this is the feature no competitor
          can copy because it requires months of relationship, not months of data.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0 }}>
          <span style={{ color: T.gold, fontWeight: 700 }}>Three modes:</span>{" "}
          <span style={{ color: T.gold, fontWeight: 700 }}>PRIVATE</span> (default — the unsayable things, pure safety,
          never analysed without consent).{" "}
          <span style={{ color: T.gold, fontWeight: 700 }}>SHARED</span> (entries published to community with a
          user-chosen excerpt, 150-char reply cap, Echo not Likes).{" "}
          <span style={{ color: T.gold, fontWeight: 700 }}>SHADOW</span> (patterns Jess infers that the user hasn't
          articulated yet, in Another You).
        </p>
      </div>

      {/* SECTION 2 — Architecture */}
      <JournalAccordion id="arch" count="02" title="Architecture · Public vs Private">
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: "0 0 12px" }}>
          Two parallel journals via tab strip at top of page:
        </p>
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
          <li style={{ fontSize: 13, color: T.textHi, lineHeight: 1.6, marginBottom: 8 }}>
            <span style={{ color: T.gold, fontWeight: 700 }}>Private</span> (lock icon, default) — encrypted, never
            shown to anyone, full privacy guarantee.
          </li>
          <li style={{ fontSize: 13, color: T.textHi, lineHeight: 1.6 }}>
            <span style={{ color: T.gold, fontWeight: 700 }}>Shared</span> (community icon) — user chooses excerpt
            (max 200 words), rest stays private. Replies capped at 150 characters. Echo mechanic, not likes. Posts
            are pseudonymous (life stage visible if allowed, name never). Moderation: Jess passively flags crisis
            signals before publish.
          </li>
        </ul>
      </JournalAccordion>

      {/* SECTION 3 — Entry types */}
      <JournalAccordion id="entries" count="03" title="All Entry Types">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {J_ENTRY_GROUPS.map((g) => (
            <div key={g.label}>
              <div style={{
                fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.4,
                marginBottom: 8,
              }}>{g.label}</div>
              {g.items.map(([name, body]) => (
                <div key={name} style={{
                  borderLeft: `2px solid ${T.border}`,
                  paddingLeft: 12, marginBottom: 8,
                }}>
                  <div style={{ fontSize: 13, color: T.textHi, fontWeight: 700 }}>{name}</div>
                  <div style={{ fontSize: 12.5, color: T.textMid, lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 4 — Jess's roles */}
      <JournalAccordion id="jess" count="04" title="Jess's Three Roles in Journal">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {J_JESS_ROLES.map((r) => (
            <div key={r.label} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
                {r.label}
              </div>
              <div style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65 }}>{r.body}</div>
            </div>
          ))}
        </div>
        <div style={{
          backgroundColor: T.surface,
          border: `1px dashed ${T.red}`,
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 10, color: T.red, fontWeight: 700, letterSpacing: 1.4, marginBottom: 8 }}>
            WHAT JESS NEVER DOES
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {J_JESS_NEVER.map((line) => (
              <li key={line} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 6,
              }}>
                <span aria-hidden="true" style={{ color: T.red, fontWeight: 700, flexShrink: 0 }}>✕</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </JournalAccordion>

      {/* SECTION 5 — Insights tiers */}
      <JournalAccordion id="insights" count="05" title="Insights · 4 Tiers">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {J_TIERS.map((t) => (
            <div key={t.tier} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.gold}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
                {t.tier}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {t.items.map((line) => (
                  <li key={line} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 4,
                  }}>
                    <span aria-hidden="true" style={{ color: T.gold, flexShrink: 0 }}>◆</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: T.sage, fontWeight: 700, letterSpacing: 1.4, marginBottom: 6 }}>
          ADDITIONAL
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {J_TIER_EXTRAS.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 4,
            }}>
              <span aria-hidden="true" style={{ color: T.sage, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </JournalAccordion>

      {/* SECTION 6 — Phase adaptation */}
      <JournalAccordion id="phase" count="06" title="Phase Adaptation">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {J_PHASE_ADAPTATION.map((p) => (
            <div key={p.phase} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.blush, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
                {p.phase}
              </div>
              <div style={{ fontSize: 12.5, color: T.textHi, lineHeight: 1.6 }}>{p.body}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {J_PHASE_PROMPTS.map((p) => (
            <span key={p.phase} style={{
              fontSize: 10.5, color: T.textMid, background: T.surfaceHi,
              border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px",
            }}>{p.phase}: {p.register}</span>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 7 — Cross-page wiring */}
      <JournalAccordion id="wiring" count="07" title="Cross-Page Wiring">
        <div style={{
          backgroundColor: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10, overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "minmax(170px, 220px) 1fr",
            background: T.surfaceHi, padding: "10px 14px",
            fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            textTransform: "uppercase", color: T.gold,
          }}>
            <div>Connection</div>
            <div>What flows</div>
          </div>
          {J_CROSS_PAGE.map(([key, body], i) => (
            <div key={key} style={{
              display: "grid", gridTemplateColumns: "minmax(170px, 220px) 1fr",
              gap: 14, padding: "10px 14px",
              borderTop: `1px solid ${T.border}`,
              background: i % 2 === 0 ? T.surface : T.surfaceHi,
            }}>
              <div style={{ fontSize: 12.5, color: T.gold, fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: 12.5, color: T.textHi, lineHeight: 1.55 }}>{body}</div>
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 8 — UX patterns */}
      <JournalAccordion id="ux" count="08" title="UX Patterns">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {J_UX_PATTERNS.map(([anchor, body]) => (
            <div key={anchor} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.4, marginBottom: 4 }}>
                {anchor}
              </div>
              <div style={{ fontSize: 12.5, color: T.textHi, lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 9 — LGBTQ+ inclusion */}
      <JournalAccordion id="lgbtq" count="09" title="LGBTQ+ Inclusion">
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {J_LGBTQ.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              fontSize: 13, color: T.textHi, lineHeight: 1.65, marginBottom: 8,
            }}>
              <span aria-hidden="true" style={{ color: T.sage, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </JournalAccordion>

      {/* SECTION 10 — Build sequence */}
      <JournalAccordion id="seq" count="10" title="Build Sequence">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {J_BUILD_PHASES.map((p) => (
            <div key={p.label} style={{
              backgroundColor: T.surfaceHi,
              border: `1px solid ${p.status === "in build" ? T.gold : T.border}`,
              borderLeft: `3px solid ${p.status === "in build" ? T.gold : T.muted}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
              }}>
                <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: 1.4 }}>
                  {p.label}
                </div>
                <span style={{
                  fontSize: 9.5, color: p.status === "in build" ? T.gold : T.textMid,
                  background: p.status === "in build" ? T.goldSoft : "transparent",
                  border: `1px solid ${p.status === "in build" ? T.gold : T.border}`,
                  borderRadius: 4, padding: "2px 6px",
                  textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700,
                }}>{p.status}</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {p.items.map((line) => (
                  <li key={line} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    fontSize: 12.5, color: T.textHi, lineHeight: 1.55, marginBottom: 4,
                  }}>
                    <span aria-hidden="true" style={{ color: T.gold, flexShrink: 0 }}>◆</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </JournalAccordion>

      {/* SECTION 11 — Whole-app vision note (always open, gold) */}
      <SectionLabel>Section 11 · Whole-App Vision Note</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 14, padding: "18px 20px", marginBottom: 8,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          Halli confirmed <span style={{ color: T.gold, fontWeight: 700 }}>2026-06-01</span>: Wholeness applies to
          the whole app, not just one page. Health Corner renamed Life Corner. The app is becoming a life companion
          that understands health deeply — not a health app that occasionally touches on life.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          This philosophy reshapes:
        </p>
        <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none" }}>
          {[
            ["Today page", "life check-in, not just health"],
            ["Community", "life topics, not just cycle"],
            ["Explore", "career / creativity / relationship content at equal weight"],
            ["Planner", "life goals, not just health tasks"],
            ["Jess persona", "life companion, not health AI"],
            ["Navigation IA", "to be redesigned"],
          ].map(([k, v]) => (
            <li key={k} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              fontSize: 13, color: T.textHi, lineHeight: 1.6, marginBottom: 6,
            }}>
              <span aria-hidden="true" style={{ color: T.gold, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span><span style={{ color: T.gold, fontWeight: 700 }}>{k}</span> — {v}</span>
            </li>
          ))}
        </ul>
        <p style={{
          fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0,
          fontStyle: "italic",
        }}>
          Navigation restructure is an open question — awaiting founder direction.
        </p>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// Tab — Another You (Shadow / Mirror / Oracle page concept)
// ════════════════════════════════════════════════════════════════════════════
const ANOTHER_YOU_PAGE_TABS = [
  { name: "Mirror",    desc: "Archetype mapping, shadow cycle map, data reflection" },
  { name: "Shadow",    desc: "Shadow Letter, Burn Mode, Night Self / 3AM mode" },
  { name: "Oracle",    desc: "Data-wired horoscope, Human Design crosscheck, lunar sync" },
  { name: "Dark Moon", desc: "Collective Shadow, personalised ritual design" },
];

const ANOTHER_YOU_FEATURES = [
  { n: 1, tier: "core", name: "THE SHADOW LETTER", tagline: "Once per cycle, Jess writes as you — not to you.",
    body: "Analyses mood variance, journal tone gaps, habit abandonment, and symptom patterns to write a letter in first-person as the suppressed version of you. Types itself character-by-character. After reveal: \"Is this her?\" — saves or prompts reflection. Hard-private: never in Doctor Export, never in Partner Sync." },
  { n: 2, tier: "core", name: "SHADOW ACROSS THE CYCLE", tagline: "A map of when your shadow shows up.",
    body: "Algorithm computes per-day divergence between stated mood/energy and behavioural/linguistic signals (journal sentiment, habit compliance). Renders as a circular 28-day map — colour saturation deepens in high-divergence windows. After 3 cycles the pattern stabilises. Jess writes 2 sentences per peak window: \"Days 22-25: Your logs say 'fine.' Your patterns say otherwise.\"" },
  { n: 3, tier: "core", name: "THE DATA CONFESSION", tagline: "Monthly. One thing your data reveals that you haven't admitted.",
    body: "Jess finds the most significant behavioural pattern — systematic gaps, stated intentions that data contradicts, Monday crashes, things mentioned to Jess but never logged. One confession per month. Below it: \"What do you know about this that I don't?\" User responds or dismisses. Dismissed confessions never repeat." },
  { n: 4, tier: "core", name: "HOROSCOPE WIRED TO YOUR ACTUAL DATA", tagline: "Co-Star uses your birth chart. We use your last 7 days.",
    body: "Astra generates your horoscope using star sign PLUS current cycle phase, mood trend, most logged symptoms, energy trajectory, journal themes, shadow window position. Instead of \"Sagittarians may feel conflicted\" → \"Your data says your energy has been climbing since Tuesday. Your chart says this is your season for initiation. Something is trying to begin.\" Data and chart agreements/divergences both surfaced. Moves from Lifestyle to Another You as primary home." },
  { n: 5, tier: "core", name: "MOON × CYCLE × MOOD CORRELATION", tagline: "Your personal lunar sync. Not a theory — your data.",
    body: "Tracks moon phase as background variable (calculated from date, no API). After 3 cycles: \"Your period starts within 2 days of the new moon in 3 out of 4 cycles.\" Visual: two overlapping circles — lunar cycle and menstrual cycle — gold glow where they align. 24% of women under 35 show sync. FemWell finds out if you're one of them." },
  { n: 6, tier: "core", name: "THE NIGHT SELF / 3AM MODE", tagline: "Between 11pm and 4am, everything else disappears.",
    body: "Full-screen dark interface, single text field, immediate keyboard. One label: \"3am self. No analysis. No judgment. Write.\" Save (kept private, never analysed) or Release (instant burn). Monthly: if 3+ night entries, Jess writes one observation: \"I notice you're visiting them.\" Ends at 4am automatically." },
  { n: 7, tier: "core", name: "THE COLLECTIVE SHADOW", tagline: "Every week, thousands move through the same patterns. You won't know their names. You'll feel less alone.",
    body: "Anonymised aggregate of emotional themes across all Another You users — rendered as a written piece, not a data report. \"This week, thousands of you were in your shadow window. Tuesday felt heavier than you said it was.\" A word cloud of one-word responses from the collective. K-anonymity protected. Opt-in to contribute." },
  { n: 8, tier: "core", name: "ARCHETYPE MAPPING ACROSS YOUR CYCLE", tagline: "Not what the archetypes mean. What YOUR archetype is, based on your data.",
    body: "Eight archetypes: Menstrual (The Sage / The Hermit), Follicular (The Maiden / The Dreamer), Ovulatory (The Mother / The Performer), Luteal (The Crone / The Critic). Assigned from behavioural data — not self-report. The Dreamer if follicular shows aspiration language but low task completion. The Critic if luteal journal uses negative self-referential language. Shareable archetype wheel (image export, no health data visible)." },
  { n: 9, tier: "core", name: "RITUAL DESIGN PERSONALISED TO YOUR DATA", tagline: "Not a generic full-moon ritual. One designed for this window in your specific body.",
    body: "Jess pulls: current phase, moon phase, shadow window position, HD authority type, Data Confession pattern. Generates a 3–5 element ritual with reasons. Each element links to Explore content where possible. \"Save to Planner\" creates PlannerItems for the next 3 days." },
  { n: 10, tier: "addon", name: "HUMAN DESIGN CROSSCHECK", tagline: "50M HD charts globally. None of them checked against behavioural data.",
    body: "User enters birth date/time/place. FemWell calculates HD type, profile, authority. Jess cross-references against actual behavioural data: \"Your Projector design suggests working in bursts. Your habit data shows completions peak before 11am and almost never after 5pm. That's your design, not a character flaw.\"" },
  { n: 11, tier: "addon", name: "BURN MODE (user-set timer)", tagline: "Write knowing it will be gone. Burn in 1 hour / 24 hours / on a specific date / when you tap the flame.",
    body: "Entry lives with an amber countdown. On burn date: fire animation consuming the entry, \"Released.\" Only metadata kept (date created, date burned). Jess never reads Burn entries — explicit UI guarantee." },
  { n: 12, tier: "addon", name: "GUT FEELING TRACKER", tagline: "Log an intuition. Set a test date. Find out if you were right.",
    body: "Builds an evidence base for her specific intuition accuracy per category: body / relationships / health / situations. After 10 resolved predictions: \"Your body gut feelings are right 78% of the time. Your relationship gut feelings are right 41% — that might be fear, not intuition.\" Correlation with cycle phase after 3 months." },
];

const ANOTHER_YOU_COMPLIANCE = [
  "Birth data for Human Design requires explicit consent + GDPR Article 6(1)(a)",
  "Burn Mode: irretrievability must be disclosed before first use",
  "Crisis monitoring active in all entry modes",
  "Collective Shadow: k-anonymity, minimum group size 50 before aggregate shown",
  "Age gate recommendation: 18+ for Another You (the psychological depth)",
  '"Not medical advice" on all Jess-generated content',
];

function AnotherYouTab() {
  return (
    <div>
      <PageHeader
        title="Another You — /AnotherYou Page Concept"
        subtitle="The most ambitious page in the app. No competitor can build this — they don't have our data."
        badge="Research complete · awaiting build approval"
        badgeTone="red"
      />

      <SectionLabel>Strategic case</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.7, margin: 0 }}>
          FemWell has months of behavioural data. Co-Star uses birth chart data for 45M users and still writes generic copy.
          FemWell is the first app with both a behavioural data layer AND a spiritual/astrology persona (Astra). The Shadow page is where data becomes something uncanny.
        </p>
      </div>

      <SectionLabel>Page name</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 10.5, color: T.gold, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginRight: 8 }}>Recommended</span>
          <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 18, color: T.textHi, fontStyle: "italic" }}>"Another You"</span>
          <span style={{ color: T.textMuted, marginLeft: 8 }}>at /AnotherYou</span>
        </div>
        <p style={{
          fontFamily: '"Fraunces", Georgia, serif', fontSize: 15, fontStyle: "italic", color: T.blush,
          margin: "0 0 12px", lineHeight: 1.5,
        }}>"The version of you that your data has been quietly describing."</p>
        <p style={{ fontSize: 12.5, color: T.textMid, lineHeight: 1.6, margin: 0 }}>
          Design: deep indigo-black background (#0D0B14), smoke-like card surfaces, violet/silver/amber accents. Cormorant Garamond italic headers.
          Cards drift in (no bounce, no spring). Shadow Letter types itself 12 ms/character.
        </p>
      </div>

      <SectionLabel>4-tab structure (within the page)</SectionLabel>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 10, marginBottom: 22,
      }}>
        {ANOTHER_YOU_PAGE_TABS.map((t) => (
          <div key={t.name} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "14px 14px",
          }}>
            <div style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: 18, color: T.gold, fontWeight: 600, marginBottom: 6,
              letterSpacing: -0.1,
            }}>[ {t.name} ]</div>
            <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.55 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <SectionLabel>The 12 top features</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
        {ANOTHER_YOU_FEATURES.map((f) => (
          <FeatureCard key={f.n} {...f} />
        ))}
      </div>

      <SectionLabel>Opt-out design</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0 }}>
          First visit: single card —{" "}
          <em style={{ color: T.blush }}>"Your data has been watching you. Not the version you show the world — the other one."</em>
          {" "}Button: <strong style={{ color: T.textHi }}>"Meet her"</strong> / <strong style={{ color: T.textHi }}>"Not now"</strong>.
          Hard disable in Settings removes the page from nav. Full data delete on disable.
        </p>
      </div>

      <SectionLabel>Compliance notes</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.blush}`,
        borderRadius: 12, padding: "16px 18px",
      }}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {ANOTHER_YOU_COMPLIANCE.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              fontSize: 12.5, color: T.textMid, lineHeight: 1.6, marginBottom: 8,
            }}>
              <span aria-hidden="true" style={{ color: T.blush, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — UX & Design (cross-category patterns)
// ════════════════════════════════════════════════════════════════════════════
const UX_ANCHORS = [
  {
    n: 1,
    title: "Oura Readiness → FemWell Vitality Score",
    what: "What Oura does: one number (0–100) synthesising sleep, HRV, recovery. Their entire premium hardware business sits on this single daily number.",
    translation: "A daily Vitality Score synthesising mood, energy, sleep, symptom load, cycle phase, and habit completion. \"Your Vitality today: 72 — you're in a high-output window.\" Shown in the Planner hero. Shareable. Makes the whole app's data into something a user can say out loud.",
    why: "Right now FemWell has 10 separate data streams with no synthesis. The Vitality Score is the marketing hook, the retention mechanism, and the \"one thing\" that makes the complexity legible.",
  },
  {
    n: 2,
    title: "Spotify Mini Player → Persistent Jess Bar",
    what: "The Now Playing mini-player persists across all navigation. Something important is always accessible without interrupting what you're doing.",
    translation: "A 44px Jess bar sitting above the tab bar on every page. Shows her current one-line observation. Tap to expand into full chat. Jess becomes the interface, not a feature buried in a menu.",
    why: "Currently Jess is a destination. Making her persistent makes her a companion. This is the single change that most clearly separates FemWell from every other cycle app.",
  },
  {
    n: 3,
    title: "Notion Slash Command → FemWell Quick Action",
    what: "Type \"/\" anywhere to surface a command palette — insert a table, create a page, change block type. Power-user shortcut that removes all navigation.",
    translation: "\"/\" or a swipe-up gesture from anywhere launches a quick-action bar: Log symptom · Start journal entry · Ask Jess · Add to planner · Check cycle day. 2 taps to any action from anywhere in the app.",
    why: "Currently every action requires navigating to the right page first. The slash command removes page-as-container entirely.",
  },
  {
    n: 4,
    title: "Wordle One-Thing-Per-Day → Jess Daily Intention",
    what: "One puzzle per day. No bingeing. Returns tomorrow. Creates daily habit without streaks or pressure.",
    translation: "One Jess-written intention per morning, delivered fresh based on phase + yesterday's mood. \"Today is a good day to start small and notice what actually feels good.\" Can't be advanced. Creates a reliable daily opening moment. Refreshes at 6am.",
    why: "The daily opening is the app's biggest retention lever. A reliable, fresh, personal thing every morning at the right moment — not a push notification, a card you find.",
  },
  {
    n: 5,
    title: "Monzo Notification → FemWell Micro-Alert",
    what: "\"You just spent £4.20 at Pret\" — immediate, contextual, friendly, deep-linked. Reads like a text from a smart friend who's been watching.",
    translation: "\"You've logged mood 2/5 three days in a row. Want to talk to Jess?\" / \"Your energy is climbing — this is your best window for the hard thing.\" Deep-links directly to the relevant action. Written like a message, not an alert.",
    why: "Current notifications are generic reminders. Monzo-style notifications are observations. The former is dismissed. The latter is read.",
  },
];

// 25 cross-category patterns — tier=top (8), strong (12), polish (5)
const UX_PATTERNS = [
  { n: 1,  tier: "top",    title: "OURA READINESS → VITALITY SCORE",
    body: "Synthesise all data into one daily number. Source: Oura Ring. Apply to: Planner hero card. Single most shareable feature." },
  { n: 2,  tier: "top",    title: "SPOTIFY MINI PLAYER → JESS BAR",
    body: "Persistent 44px Jess strip above tab bar on every page. Tap to expand. Source: Spotify Now Playing. Apply to: global app shell. Makes Jess the interface, not a feature." },
  { n: 3,  tier: "top",    title: "NOTION SLASH COMMAND → QUICK ACTION",
    body: "\"/\" or swipe-up from anywhere → log · journal · ask Jess · planner. Source: Notion, Linear, Raycast. Apply to: global. Removes page-as-container." },
  { n: 4,  tier: "top",    title: "GOOGLE MAPS DRAGGABLE CARD → LOGGING SHEETS",
    body: "Replace all logging forms as bottom sheets with snap points (peek / half / full). Drag up for more detail. Drag down to dismiss. Source: Google Maps place card. Apply to: Universal Logger, journal entry creation, GP question builder, habit completion." },
  { n: 5,  tier: "top",    title: "THINGS 3 NATURAL LANGUAGE → JESS VOICE INPUT",
    body: "\"Had a headache since noon\" parsed directly to SymptomLogs. \"Feeling pretty good, 4 out of 5\" to DailyCheckins. Source: Things 3, Todoist. Apply to: Jess chat (already partially built — make it the default logging UX, not secondary)." },
  { n: 6,  tier: "top",    title: "ROBINHOOD HAPTIC SCRUBBER → CYCLE CALENDAR",
    body: "As user drags finger across the cycle calendar, haptic ticks mark each day. Phase transitions get a distinct haptic. Source: Robinhood price chart. Apply to: Planner cycle calendar. Makes data tactile." },
  { n: 7,  tier: "top",    title: "MONZO CONTEXTUAL NOTIFICATION → FEMWELL MICRO-ALERT",
    body: "Written like a friend's text. Observation + one-tap action. Deep-linked. Source: Monzo. Apply to: all Jess-triggered notifications." },
  { n: 8,  tier: "top",    title: "WORDLE DAILY CONSTRAINT → JESS MORNING INTENTION",
    body: "One fresh phase-aware Jess line every morning. Can't be skipped. Creates the daily opening moment. Source: Wordle. Apply to: Planner hero." },
  { n: 9,  tier: "strong", title: "STRAVA PERSONAL BEST → FEMWELL PERSONAL RECORDS",
    body: "\"Your best mood week in 3 months.\" \"Longest habit streak.\" Personal records, not averages. Source: Strava segments. Apply to: Pulse insights." },
  { n: 10, tier: "strong", title: "VSCO FILM PRESETS → MOOD PRESETS",
    body: "Instead of a 1–5 slider, 6 named mood states with a visual: \"Steady ground\", \"Heavy weather\", \"Morning clarity\", \"Restless energy\", \"Tender\", \"Electric\". Source: VSCO. Apply to: mood logging everywhere." },
  { n: 11, tier: "strong", title: "INSTAGRAM STORIES TAP-TO-ADVANCE → HEALTH CORNER NAVIGATION",
    body: "Tap right side of letter to advance to next section. Tap left to go back. Hold to pause. Source: Instagram Stories. Apply to: Health Corner letters." },
  { n: 12, tier: "strong", title: "IMESSAGE TAPBACK → JESS MESSAGE REACTIONS",
    body: "One-tap reaction to Jess's observations. A heart for a helpful insight, a sad-face for one that missed. Trains Jess's context silently. Source: iMessage. Apply to: Jess chat." },
  { n: 13, tier: "strong", title: "AIRBNB DATE PICKER WITH CONTEXT → PREDICTED CYCLE CALENDAR",
    body: "Show predicted mood / energy / phase for each future date on the calendar so users can plan ahead. Source: Airbnb price-per-night calendar. Apply to: Planner schedule calendar." },
  { n: 14, tier: "strong", title: "APPLE WATCH ACTIVITY RINGS → DATA COMPLETION ARCS",
    body: "Three arcs on the Today page: Body (symptoms + check-in), Mind (journal or Jess), Nourishment (meals + hydration). Fill as you log. Source: Apple Watch rings. Apply to: Today page header." },
  { n: 15, tier: "strong", title: "BEREAL AUTHENTICITY CONSTRAINT → HONEST JOURNAL",
    body: "One journal entry per day where editing is disabled after 5 minutes. \"The unedited you.\" Opt-in entry type. Source: BeReal. Apply to: journal entry types." },
  { n: 16, tier: "strong", title: "SNAPCHAT HOLD-TO-RECORD → HOLD FOR VOICE JOURNAL",
    body: "Hold the mic button in journal → voice recording. Release → transcribes and presents for save / edit / burn. Source: Snapchat. Apply to: journal entry creation." },
  { n: 17, tier: "strong", title: "DUOLINGO LESSON COMPLETE → CHECK-IN CELEBRATION",
    body: "A dedicated full-screen moment when you complete your morning check-in. Not confetti on a card — a moment. Source: Duolingo. Apply to: Morning Brief completion." },
  { n: 18, tier: "strong", title: "SHOPIFY ABANDONED CART RECOVERY → STREAK PAUSE",
    body: "When a habit streak breaks, instead of resetting to zero, offer a \"Pause\" for up to 3 days. On return: \"Welcome back — your streak is safe.\" Source: Shopify recovery emails. Apply to: habits everywhere." },
  { n: 19, tier: "strong", title: "CALM DAILY CALM → JESS DAILY PIECE",
    body: "One fresh Jess-written piece of health content per day. Not a notification — a card that's always there. Source: Calm's Daily Calm. Apply to: Today page or Planner." },
  { n: 20, tier: "strong", title: "OBSIDIAN BACKLINKS → JOURNAL ENTRY CONNECTIONS",
    body: "When Jess detects you've written about the same person or theme in multiple entries, show \"You've written about this 3 times — see all.\" Source: Obsidian. Apply to: journal insights." },
  { n: 21, tier: "polish", title: "AMAZON 1-CLICK → SINGLE-TAP HABIT COMPLETION",
    body: "Completing a habit in Planner is one tap. No confirmation dialog. Undo toast appears for 3 seconds. Source: Amazon 1-click. Apply to: all habit completions." },
  { n: 22, tier: "polish", title: "APPLE NOTES TEXT SELECTION → JOURNAL SELECTION ACTIONS",
    body: "Select any text in a journal entry → contextual menu appears: \"Save to Health Notes\", \"Ask Jess about this\", \"Add to GP list\". Source: Apple Notes. Apply to: journal entries, Health Corner letters." },
  { n: 23, tier: "polish", title: "SIGNAL DISAPPEARING MESSAGES → BURN MODE",
    body: "Timed deletion with user-set timer. Already planned — make the timer dial beautiful (the burn date picker is a featured UI moment, not a settings option). Source: Signal. Apply to: Burn Mode." },
  { n: 24, tier: "polish", title: "SLACK THREADS → JESS OBSERVATION THREADS",
    body: "Reply directly to a specific Jess pattern observation without starting a new conversation. Source: Slack threads. Apply to: Jess For You tab observations." },
  { n: 25, tier: "polish", title: "TELEGRAM REACTIONS → JOURNAL EMOJI TAGS",
    body: "Quick reactions on journal entries instead of formal type labels. Storm = heavy day. Sun = good day. Spiral = confused. Heart = grateful. Source: Telegram reactions. Apply to: journal entry list." },
];

function UxPatternCard({ n, tier, title, body }) {
  const tones = {
    top:    { bg: T.goldSoft,   fg: T.gold,      border: T.gold,    label: "Top tier" },
    strong: { bg: T.sageSoft,   fg: T.sage,      border: T.sage,    label: "Strong"   },
    polish: { bg: T.surfaceHi,  fg: T.textMuted, border: T.border,  label: "Polish"   },
  };
  const t = tones[tier] || tones.strong;
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{n}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
              padding: "2px 8px", borderRadius: 999,
              fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2,
              textTransform: "uppercase",
            }}>{t.label}</span>
          </div>
          <div style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 14.5, fontWeight: 700, color: T.textHi,
            letterSpacing: -0.1, lineHeight: 1.3,
          }}>{title}</div>
        </div>
      </div>
      <p style={{
        fontSize: 12.5, color: T.textMid, lineHeight: 1.65,
        margin: "0 0 0 38px",
      }}>{body}</p>
    </article>
  );
}

function UxDesignTab() {
  return (
    <div>
      <PageHeader
        title="UX & Design — Patterns From Everywhere"
        subtitle="Not wellness apps. What every other category figured out that we haven't borrowed yet."
      />

      <SectionLabel>The principle</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.7, margin: 0 }}>
          The founder gave two examples — Safari's contextual action sheet and restaurant ordering flows. These were seeds, not the scope.
          The real question is: what has gaming, banking, social, music, maps, and e-commerce figured out that no health app has borrowed yet?
          These 25 patterns answer that.
        </p>
      </div>

      <SectionLabel>5 anchor translations</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
        {UX_ANCHORS.map((a) => (
          <article key={a.n} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "18px 20px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: T.goldSoft, color: T.gold,
                border: `1px solid ${T.gold}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 16, fontWeight: 700, flexShrink: 0,
              }}>{a.n}</div>
              <div style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 19, fontWeight: 700, color: T.gold,
                letterSpacing: -0.2, lineHeight: 1.25, paddingTop: 2,
              }}>{a.title}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{
                  fontSize: 10, color: T.textMuted, fontWeight: 700,
                  letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
                }}>What they do</div>
                <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: 0 }}>{a.what}</p>
              </div>
              <div>
                <div style={{
                  fontSize: 10, color: T.gold, fontWeight: 700,
                  letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
                }}>FemWell translation</div>
                <p style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65, margin: 0 }}>{a.translation}</p>
              </div>
              <div>
                <div style={{
                  fontSize: 10, color: T.sage, fontWeight: 700,
                  letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
                }}>Why it matters</div>
                <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, fontStyle: "italic", margin: 0 }}>{a.why}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <SectionLabel>25 cross-category patterns</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 10, marginBottom: 22,
      }}>
        {UX_PATTERNS.map((p) => <UxPatternCard key={p.n} {...p} />)}
      </div>

      <SectionLabel>Bottom line</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.sage}`,
        borderRadius: 12, padding: "16px 18px",
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0 }}>
          The patterns wellness apps use — cards, sliders, modals, checklists — come from productivity and health admin.
          The patterns that create love — persistent companions, haptic feedback, daily rituals, synthesis scores, one-tap actions — come from everywhere else.{" "}
          <strong style={{ color: T.sage }}>FemWell should borrow from everywhere else.</strong>
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — Wholeness (from cycle app to women's app)
// ════════════════════════════════════════════════════════════════════════════
const WHOLENESS_DIMENSIONS = [
  {
    n: 1,
    name: "RELATIONSHIPS & FEMALE FRIENDSHIP",
    what: "The people in her life — romantic partnerships, friendships, family, community belonging. The loneliness epidemic disproportionately affects women.",
    why: "Female friendships are clinically protective (60% premature death risk reduction). Bumble BFF proved women want depth and context in connection, not swiping. No health app holds relationship health as a first-class dimension.",
    femwell: "A relationships log in journal (write about specific people over time, Jess notices recurring themes), a friendship appreciation feature, community spaces organized by life circumstance not just cycle phase.",
    cycle: "Ovulatory phase is naturally relational — the app can surface relationship prompts and social energy awareness during peak connection windows.",
  },
  {
    n: 2,
    name: "SEX & INTIMACY",
    what: "Desire, pleasure, confidence, the quality of intimate relationships — not just fertility and conception.",
    why: "Desire tracking is one of the most requested missing features in femtech. Libido fluctuates with cycle phase, life stress, relationship health, and medication. Currently FemWell has conception-framed intimacy content. Most women are not TTC.",
    femwell: "Desire log (how connected do I feel today, in my body, with my partner/self), intimacy reflection journal type, phase-aware desire patterns surfaced as insight, body confidence content that isn't about weight or symptoms.",
    cycle: "The cycle is the most powerful predictor of desire patterns — this is where phase intelligence is most directly applicable to something women actually feel.",
  },
  {
    n: 3,
    name: "CAREER & AMBITION",
    what: "Work satisfaction, career progression, workplace relationships, the negotiation gap, returning to work (postpartum, menopause), the ambition-guilt complex unique to women.",
    why: "Career decisions intersect constantly with reproductive health (fertility treatment + work travel, postpartum return, perimenopause cognitive symptoms affecting work performance). No app holds both sides of this.",
    femwell: "Career journal type, Jess who can hold a conversation about imposter syndrome without routing it through cycle data, a \"work capacity\" signal in the Planner (not just body capacity), a pre-negotiation confidence ritual.",
    cycle: "Cognitive phase patterns are clinically documented — follicular for strategy sessions, ovulatory for presentations, menstrual for deep thinking. This makes the cycle lens genuinely useful for career planning.",
  },
  {
    n: 4,
    name: "FINANCIAL HEALTH & CONFIDENCE",
    what: "Money management, wealth-building, financial anxiety, the gender wealth gap (21% in UK), financial decisions at life transitions (maternity leave, divorce, career change).",
    why: "Only 38% of Gen Z/Millennial women feel confident discussing money vs 56% of men. Financial anxiety is the top non-health stressor for women 25–45. It correlates with mood, sleep, and health outcomes. FemWell already tracks mood — financial stress should be part of what Jess understands.",
    femwell: "Financial stress as a DailyCheckins field (not financial advice — emotional state around money), a money journal type (\"what's my relationship with money this month\"), Jess awareness of financial stress as a life context.",
    cycle: "Luteal phase is documented as highest financial anxiety window for many women — validating this pattern is clinically and emotionally useful.",
  },
  {
    n: 5,
    name: "GRIEF & LOSS",
    what: "Pregnancy loss, fertility treatment grief, relationship endings, parent illness, job loss, the identity grief of life stage transitions (becoming a mother, entering perimenopause, children leaving home).",
    why: "The Pregnancy After Loss app closed in 2025, leaving a documented gap. Grief is one of the most common experiences FemWell's life stages will encounter — TTC users experience loss regularly, postpartum grief is real, perimenopause involves profound identity loss. No health app holds grief well.",
    femwell: "A dedicated grief container (separate from journal — specific, warm, no prompts to \"move on\"), a loss entry type that doesn't show up in insights or be analysed, Jess who can sit with grief without pivoting to health advice, crisis-adjacent resources for grief.",
    cycle: "Grief often maps to specific cycle phases (luteal heightens grief intensity). Understanding this pattern is validating — not reductive.",
  },
  {
    n: 6,
    name: "BODY CONFIDENCE & AESTHETICS ON HER OWN TERMS",
    what: "How she feels in and about her body — not as data, not clinically, but culturally, politically, personally. Beauty as self-expression, not performance.",
    why: "Body image is the most common self-esteem driver for women under 45. Current FemWell has skin + hair tracking (clinically framed). Missing: the experience of feeling powerful in your body, dressing for yourself, the political act of loving your body in a culture that profits from you not doing so.",
    femwell: "A body affirmation feature (not self-help platitudes — specific, earned, data-informed: \"your energy has been building all week. You know what that feels like in your body.\"), an aesthetic journal type (not skincare — how do I want to present today, what makes me feel like myself), beauty and culture content that treats women as subjects not objects.",
    cycle: "How a woman feels about her body maps closely to cycle phase. This intelligence, used gently and affirmingly, is a genuine differentiator.",
  },
  {
    n: 7,
    name: "CREATIVITY & SELF-EXPRESSION",
    what: "Making things, hobbies, art, writing, music, movement as creative expression — not just exercise.",
    why: "Creativity is a documented protective factor for mental health. Julia Cameron's research on morning pages showed creativity practice reduces anxiety and depression. Women historically have had less permission for creative time. A women's app that honours creative life is unusual.",
    femwell: "A creativity journal type (\"what did I make / imagine / notice today\"), a creative project log, content in the Health Corner letters about creativity and the feminine tradition, Jess who celebrates creative work without pivoting to productivity metrics.",
    cycle: "Follicular and ovulatory phases are peak creative windows (higher verbal fluency, spatial reasoning, collaborative thinking). Surfacing this makes creative life feel supported by the app.",
  },
  {
    n: 8,
    name: "CULTURAL & SEASONAL RHYTHMS",
    what: "The rhythms of a woman's year beyond her menstrual cycle — cultural seasons, personal anniversaries, collective moments, the social and cultural calendar she inhabits.",
    why: "Women don't only live by their biological cycle. They live by school years, cultural seasons, personal anniversaries, the rhythms of the communities they belong to. An app that only understands one rhythm feels incomplete.",
    femwell: "A personal seasonal calendar (her own significant dates — not birthdays only, but the date she moved out, the date she got diagnosed, the date she made a brave decision), cultural calendar awareness in content (the cultural mood of January vs June vs September), Jess who understands that December is hard for many women regardless of their cycle phase.",
    cycle: "The interaction between cultural seasons and cycle phase is genuinely interesting — women often notice their cycle feels different in winter. Surfacing this correlation adds depth.",
  },
  {
    n: 9,
    name: "IDENTITY, VALUES & BECOMING",
    what: "Who she is, what she stands for, who she's becoming. The questions that don't have quick answers and that health apps never ask.",
    why: "Perimenopause and postpartum are the two life stages with the highest identity disruption. Women in these stages consistently say they need space to process who they are now — not medical information about what's happening to their body.",
    femwell: "A values journal type, an identity prompt library (\"what am I willing to defend? what have I stopped pretending to care about?\"), Jess who can hold identity conversations without routing them through health context, a \"becoming\" archive — entries tagged as identity-shaping moments.",
    cycle: "The menstrual phase is the phase of integration and identity processing — the quieter inward days are actually ideal for this kind of reflection.",
  },
  {
    n: 10,
    name: "REST, PLAY & JOY",
    what: "Actual rest (not self-care-as-productivity), actual play (not optimised recreation), actual joy (the tiny mundane things). The right to waste time beautifully.",
    why: "Women are systematically under-rested and over-optimised. The wellness industry — including most health apps — makes rest a task. FemWell should be the one app that gives women permission to do nothing and celebrates it.",
    femwell: "An everyday joy log (not gratitude journalling — the tiny actual things: the coffee, the song, the good parking space), a \"nothing\" check-in option (no logging, no prompts — just the app acknowledging you showed up), Jess who can say \"that sounds like a good day\" without offering a health insight.",
    cycle: "The menstrual phase is rest-permission built into biology. Using the cycle to validate rest rather than just explain it is a genuinely different framing.",
  },
];

const WHOLENESS_LETTERS = [
  "A letter on relationships and friendship (as health)",
  "A letter on career and ambition through a women's lens",
  "A letter on money confidence",
  "A letter on creativity as a health practice",
  "A letter on grief and loss (not a crisis protocol — a considered, warm exploration)",
  "A letter on beauty and body on your own terms",
];

function DimensionField({ label, body, labelTone }) {
  const labelColor = labelTone === "blush" ? T.blush : labelTone === "sage" ? T.sage : T.gold;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 10, color: labelColor, fontWeight: 700,
        letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
      }}>{label}</div>
      <p style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65, margin: 0 }}>{body}</p>
    </div>
  );
}

function DimensionCard({ d }) {
  return (
    <article style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14, padding: "18px 20px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: T.goldSoft, color: T.gold,
          border: `1px solid ${T.gold}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 15, fontWeight: 700, flexShrink: 0,
        }}>{d.n}</div>
        <div style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 17, fontWeight: 700, color: T.textHi,
          letterSpacing: 0.3, lineHeight: 1.3, paddingTop: 6,
        }}>{d.name}</div>
      </div>
      <DimensionField label="What" body={d.what} labelTone="gold" />
      <DimensionField label="Why it matters" body={d.why} labelTone="blush" />
      <DimensionField label="In FemWell" body={d.femwell} labelTone="sage" />
      <div>
        <div style={{
          fontSize: 10, color: T.gold, fontWeight: 700,
          letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
        }}>Cycle intelligence enhancement</div>
        <p style={{ fontSize: 13, color: T.gold, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>{d.cycle}</p>
      </div>
    </article>
  );
}

function WholenessTab() {
  return (
    <div>
      <PageHeader
        title="Wholeness — From Cycle App to Women's App"
        subtitle="Phase intelligence is a strength. The vision is bigger: hold the whole of what it means to be a woman."
      />

      <SectionLabel>The vision shift</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "18px 20px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 12px" }}>
          FemWell is currently an excellent cycle and health tracking app. The goal is to become something more:
          the companion that holds a woman's full life — her health, her relationships, her career, her grief, her
          creativity, her money, her identity, her joy. Cycle and phase remain central strengths. They enrich
          everything. But they should be one thread in a richer tapestry — not the whole tapestry.
        </p>
        <p style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.75, margin: "0 0 12px" }}>
          <span style={{ color: T.gold, fontWeight: 700 }}>Reference point: </span>
          Goop proved women will invest heavily in a platform that takes the full breadth of their lives seriously.
          FemWell has the health credibility Goop lacks. The question is whether FemWell expands to hold the rest.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
          Harvard Nurses' Health Study: female friendships reduce premature death risk by 60% — equivalent to
          quitting smoking. This finding alone is justification for a relationship dimension in a health app.
        </p>
      </div>

      <SectionLabel>The 10 dimensions FemWell should hold</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 26 }}>
        {WHOLENESS_DIMENSIONS.map((d) => (
          <DimensionCard key={d.n} d={d} />
        ))}
      </div>

      <SectionLabel>What this means for Jess</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.sage}`,
        borderRadius: 12, padding: "18px 20px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 10px" }}>
          <span style={{ color: T.sage, fontWeight: 700 }}>Jess v1: </span>
          a health companion who knows your cycle.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 14px" }}>
          <span style={{ color: T.sage, fontWeight: 700 }}>Jess v2 (Wholeness vision): </span>
          a life companion who happens to know your health deeply.
        </p>
        <p style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.75, margin: "0 0 12px" }}>
          The difference: Jess v2 can hold a conversation about a difficult work situation without pivoting to
          "here's how your cycle phase affects work performance." She can celebrate a creative win. She can sit with
          financial anxiety without suggesting a breathing exercise. She understands that sometimes the most helpful
          thing is to say "that sounds really hard" and mean it.
        </p>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
          The Wholeness upgrade for Jess is not technical — it's a persona expansion. Her system prompt needs to
          explicitly grant her permission to be present in the full spectrum of a woman's life, not just her
          health data.
        </p>
      </div>

      <SectionLabel>What this means for the Health Corner letters</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "18px 20px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13.5, color: T.textHi, lineHeight: 1.75, margin: "0 0 14px" }}>
          The current 7 letters cover health topics well. The Wholeness vision expands them:
        </p>
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
          {WHOLENESS_LETTERS.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              fontSize: 13, color: T.textHi, lineHeight: 1.65, marginBottom: 9,
            }}>
              <span aria-hidden="true" style={{ color: T.gold, fontWeight: 700, flexShrink: 0 }}>◆</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 13.5, color: T.textMid, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
          These sit alongside the existing 7, not replacing them.
        </p>
      </div>

      <SectionLabel>The integration principle</SectionLabel>
      <div style={{
        backgroundColor: T.textHi,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "20px 22px", marginBottom: 8,
      }}>
        <p style={{ fontSize: 13.5, color: T.bg, lineHeight: 1.75, margin: "0 0 12px" }}>
          Phase intelligence doesn't disappear — it enriches every dimension. Career planning is richer with phase
          awareness. Grief is more understandable with cycle context. Relationships are deeper when she understands
          her relational energy across the month. Creativity is more sustainable when she works with her cycle not
          against it.
        </p>
        <p style={{
          fontSize: 14, color: T.bg, lineHeight: 1.65, margin: 0,
          fontFamily: '"Fraunces", Georgia, serif', fontStyle: "italic", fontWeight: 600,
        }}>
          The vision isn't less cycle. It's: cycle as one of many intelligent lenses FemWell uses to understand
          and serve the whole woman.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab — LGBTQ+ full inclusion plan
// ════════════════════════════════════════════════════════════════════════════
const LGBTQ_FINDINGS = [
  "BMC Women's Health 2025: only 50% of 60 menstrual health apps use neutral or no pronouns. Minimum viable inclusion bar is low to clear.",
  "Bisexual women: 59% lifetime depression rate (highest of any group), 69% lifetime IPV exposure. Jess needs specific awareness.",
  "Trans women on HRT: experience monthly PMS-equivalent symptoms. Active cycle app users whose needs aren't served anywhere.",
  "Trans men on testosterone: 26.8% still bleed at 3 months. \"No cycle\" assumption is wrong.",
  "UK Online Safety Act obligations apply to LGBTQ+-targeted content moderation.",
];

const LGBTQ_QUICK = [
  "Pronoun choice in onboarding (they/them, she/her, he/him, custom) — used by Jess throughout",
  'Full copy audit: replace "husband/boyfriend" with "partner" throughout app',
  '"No current cycle" mode for trans women and trans men on T who have stopped periods',
  "LGBTQ+ crisis resources in Jess (Galop UK, MindOut) alongside Samaritans",
  "Donor insemination / IVF pathway in TTC life stage (for same-sex couples TTC via donor)",
];

const LGBTQ_STRUCTURAL = [
  { name: "Decouple cycle tracking from gender identity",
    body: "The app should not assume everyone who tracks a cycle identifies as a woman. Opt-in framing on cycle features." },
  { name: "Configurable life stages",
    body: 'The fixed 11-stage list doesn\'t serve all users. Life stages should be configurable or at least include: "Cycling but not a woman" / "Trans + HRT" / "Non-binary + menstruating"' },
  { name: "Jess LGBTQ+ awareness",
    body: "JESS_PERSONA updated to: know queer TTC pathways, not assume heterosexual relationships, use user's pronoun preference throughout, have specific empathy for bisexual mental health burden" },
  { name: "Partner Sync for same-sex couples",
    body: "Partner Sync should work for same-sex TTC couples including IUI timing, donor tracking" },
  { name: "Contextual LGBTQ+ content",
    body: 'Embedded throughout the Health Corner letters, not in a separate "LGBTQ+ section" (which always feels like a ghetto)' },
];

const LGBTQ_DONT = [
  "Do not add a pride flag in June and call it done.",
  'Do not create a separate "LGBTQ+ mode" — this segregates rather than includes.',
  "Do not ask about gender identity during onboarding then not use the answer anywhere in the app.",
];

function LgbtqTab() {
  return (
    <div>
      <PageHeader
        title="LGBTQ+ — Full Inclusion Plan"
        subtitle="8–12% of FemWell's UK target market. Currently the app would feel exclusionary to most of them."
      />

      <SectionLabel>Key research findings</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {LGBTQ_FINDINGS.map((line) => (
          <div key={line} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.gold}`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span aria-hidden="true" style={{ color: T.gold, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>◆</span>
            <span style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65 }}>{line}</span>
          </div>
        ))}
      </div>

      <SectionLabel>Quick wins · small, high visibility</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {LGBTQ_QUICK.map((line, i) => (
          <div key={i} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.sage}`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span aria-hidden="true" style={{
              background: T.sageSoft, color: T.sage,
              border: `1px solid ${T.sage}`,
              borderRadius: "50%", width: 22, height: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: T.textHi, lineHeight: 1.65 }}>{line}</span>
          </div>
        ))}
      </div>

      <SectionLabel>Structural changes · bigger, require planning</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {LGBTQ_STRUCTURAL.map((row, i) => (
          <article key={row.name} style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.blush}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
              <div style={{
                background: T.blushSoft, color: T.blush,
                border: `1px solid ${T.blush}`,
                borderRadius: "50%", width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{
                fontSize: 14, fontWeight: 600, color: T.textHi,
                lineHeight: 1.4, paddingTop: 2,
              }}>{row.name}</div>
            </div>
            <p style={{
              fontSize: 12.5, color: T.textMid, lineHeight: 1.65,
              margin: "0 0 0 40px",
            }}>{row.body}</p>
          </article>
        ))}
      </div>

      <SectionLabel>What NOT to do</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.red}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 22,
      }}>
        <div style={{
          display: "inline-block",
          background: T.redSoft, color: T.red,
          padding: "3px 10px", borderRadius: 6,
          fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
          textTransform: "uppercase", marginBottom: 12,
        }}>Amber warning</div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {LGBTQ_DONT.map((line) => (
            <li key={line} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              fontSize: 12.5, color: T.textHi, lineHeight: 1.6, marginBottom: 8,
            }}>
              <span aria-hidden="true" style={{ color: T.red, fontWeight: 700, flexShrink: 0 }}>✕</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <SectionLabel>Compliance note</SectionLabel>
      <div style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.gold}`,
        borderRadius: 12, padding: "16px 18px",
      }}>
        <p style={{ fontSize: 13, color: T.textHi, lineHeight: 1.7, margin: 0 }}>
          UK Equality Act 2010 protected characteristics include sexual orientation and gender reassignment. LGBTQ+ users reporting
          discrimination in community features must have a clear escalation path.{" "}
          <strong style={{ color: T.gold }}>Galop UK</strong> (not just Samaritans) should be in the crisis resources.
        </p>
      </div>
    </div>
  );
}
