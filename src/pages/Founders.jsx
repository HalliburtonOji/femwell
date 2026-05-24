// ─────────────────────────────────────────────────────────────────────────────
// /Founders — Founder OS
//
// Mobile-first founder dashboard for halliburtonoji@gmail.com only.
// Mirrors /Ideas (Design Lab) layout: cream background, sticky dev
// banner, header with title + subtitle, sticky tab pill row, card grid
// body, drawer-style detail expansion.
//
// Five tabs:
//   1. Lab        — feature/sprint status board, drawer detail per card
//   2. Roadmap    — sprint timeline (vertical, tappable sprint detail)
//   3. Strategy   — business / platform / pricing / market
//   4. Legal      — interactive launch checklist (persists to
//                   UserProfile.founder_checks JSON if writable, else
//                   localStorage femwell_founder_checks)
//   5. Decisions  — log of key architecture + business calls
//
// Gated to two emails. Everything else gets a polite "Not authorised"
// screen.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Sparkles, CalendarClock, MessageCircle, ShieldCheck, ScrollText,
  Compass, FlaskConical, ChevronRight, X, Check, Lock,
  Heart, Activity, BookOpen, Users, FileText,
} from "lucide-react";

// ── Brand tokens ─────────────────────────────────────────────────────
const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#FFFFFF",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  border:   "rgba(58,44,26,0.10)",
  borderS:  "rgba(58,44,26,0.18)",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  sage:     "#8FAF8F",
  sageDeep: "#6F8B6F",
  blush:    "#E8B4B8",
  ink:      "#0E0E0E",
};

// ── Auth allow-list ─────────────────────────────────────────────────
const ALLOWED_EMAILS = new Set([
  "halliburtonoji@gmail.com",
  "ojihalliburton57@gmail.com",
]);

// ── Status tones (matches /Ideas tone treatment) ─────────────────────
const STATUS_TONES = {
  shipped:    { bg: `${C.sage}22`,         fg: C.sageDeep, label: "Shipped" },
  demoReady:  { bg: `${C.gold}1F`,         fg: C.goldDeep, label: "Demo ready" },
  inProgress: { bg: `${C.blush}33`,        fg: "#9B5B61",  label: "In progress" },
  exploring:  { bg: "rgba(58,44,26,0.08)", fg: C.muted,    label: "Exploring" },
  planned:    { bg: "rgba(58,44,26,0.06)", fg: C.muted,    label: "Planned" },
};

// ── Tabs ────────────────────────────────────────────────────────────
const TABS = [
  { id: "lab",       label: "Lab",       Icon: FlaskConical },
  { id: "roadmap",   label: "Roadmap",   Icon: CalendarClock },
  { id: "strategy",  label: "Strategy",  Icon: Compass },
  { id: "legal",     label: "Legal",     Icon: ShieldCheck },
  { id: "decisions", label: "Decisions", Icon: ScrollText },
];

// ── LAB CARDS ───────────────────────────────────────────────────────
const LAB_CARDS = [
  {
    id: "planner-v2", name: "Planner v2", Icon: CalendarClock,
    status: "shipped", version: "v2 · Unified",
    desc: "Today + Cycle in one shell — locked row order, NODES_BY_KEY rendering, planner settings sheet.",
    detail: {
      whatItIs: "The home of cycle-aware planning. A single page with horizontal-swipe rows (Hero, Lists, Schedule & Cycle, Your Day, Body Today, Stage, Conditions, Rituals, Nourishment, Mind & Insight, Care, Tonight).",
      whatIsBuilt: [
        "Row order resolver enforces Nourishment before Mind & Insight regardless of stale saved order",
        "GP Report card now uses react-router useNavigate to /DoctorExport",
        "Schedule empty-state shows 'No events scheduled for today' when blocks empty",
        "Per-row error boundaries (S3-3) — quiet placeholder on crash",
        "Pattern Nudge, Phase Prep, Weekly Summary cards mounted",
      ],
      whatIsPending: [
        "Long-press to drag rows in PlannerSettingsSheet",
        "Calendar overlay full-month editor polish",
      ],
      commits: ["0116618", "fd3e7f5", "b94a6a1"],
    },
  },
  {
    id: "jess-1-4", name: "Jess AI · Features 1–4", Icon: MessageCircle,
    status: "shipped", version: "v2 · Phases 1–3",
    desc: "Daily opener, streaming, sensitive-topic mode, pattern nudges, memory cards, phase prep, response feedback, weekly summary.",
    detail: {
      whatItIs: "The Jess persona across the app — phase-aware chat, daily opener card, pattern nudges, weekly health summary, and the For You / Journal / GP-export surfaces.",
      whatIsBuilt: [
        "JESS_PERSONA constant auto-prepended to every agent call",
        "8 Jess features shipped: J2-1 Daily Opener, J2-2 Streaming, J2-3 Sensitive topics, J2-4 Pattern Nudges, J2-5 Memory Cards, J2-6 Phase Prep, J2-7 Response Feedback, J2-8 Weekly Summary",
        "Crisis escalation copy in every prompt (Samaritans / A&E)",
        "Module-level Journal-prompt dedupe (no more 6× agent calls)",
        "Safe localStorage with in-memory fallback for private browsing",
        "JessErrorBoundary wraps every Jess surface with friendly retry",
      ],
      whatIsPending: [
        "Memory cards: edit-in-place UX polish",
        "Voice input on chat surface (mobile mic permission flow)",
      ],
      commits: ["62a50ee", "6a45a98", "d3c0f95", "148526a"],
    },
  },
  {
    id: "crisis-protocol", name: "Crisis Protocol", Icon: ShieldCheck,
    status: "shipped", version: "7-category model",
    desc: "Urgent crisis / self-harm / eating disorder / domestic abuse / severe anxiety / grief / distress, each with its own response shape.",
    detail: {
      whatItIs: "A 7-category classifier that runs on every user message before the agent call. Urgent crisis suppresses the AI entirely and shows the emergency card. Severe anxiety prepends a 5-4-3-2-1 grounding script. Grief is compassionate listening only — no card. The other categories surface the agent reply plus a dedicated referral card.",
      whatIsBuilt: [
        "classifySensitiveTopic + getCrisisConfig with referralCard / suppressAI / groundingFirst / modeDirective",
        "UK-specific helplines: Samaritans 116 123, Shout 85258, Beat 0808 801 0677, National DA Helpline 0808 2000 247, Mind Infoline 0300 123 3393",
        "Per-category mode directives lock the agent's tone (no 'have you tried' for DA, no calorie talk for ED)",
        "Try/catch around classifier so a single throw can't take down the chat panel",
      ],
      whatIsPending: [
        "Multi-language detection (UK only English right now)",
        "Per-account opt-out for the gentle distress card",
      ],
      commits: ["31f0db0", "0a37d83"],
    },
  },
  {
    id: "sprint-9", name: "Sprint 9 — Perimenopause deep features", Icon: Heart,
    status: "planned", version: "Sprint 9",
    desc: "Hot flush log, sleep+hormone correlation, HRT diary, perimenopause-specific Mind & Insight cards.",
    detail: {
      whatItIs: "Deep features for the 47M UK women in the peri/menopause window. Currently the Stage row surfaces perimenopause-aware cards; Sprint 9 fills in the missing logging surfaces.",
      whatIsBuilt: ["StageRow rendering peri-aware copy", "HrtLog entity provisioned"],
      whatIsPending: [
        "Hot flush quick-log on Today",
        "Vasomotor symptom chart on Patterns tab",
        "HRT adherence streak",
        "Bone-health prompts (calcium / vitamin D)",
      ],
      commits: [],
    },
  },
  {
    id: "sprint-10", name: "Sprint 10 — Partner Sync", Icon: Users,
    status: "planned", version: "Sprint 10",
    desc: "Shareable partner view: cycle phase, energy forecast, conversation prompts.",
    detail: {
      whatItIs: "An opt-in surface that lets a partner see today's phase + energy + one prompt to ask the user. Designed pre-build; partner-sync demo already exists in /Ideas.",
      whatIsBuilt: ["PartnerSettings page scaffolded", "PartnerView page scaffolded"],
      whatIsPending: [
        "Sharable link token + revoke",
        "Phase-aware partner copy library",
        "Notification cadence + opt-out",
      ],
      commits: [],
    },
  },
  {
    id: "ritual-builder", name: "Ritual Builder on /Track", Icon: Sparkles,
    status: "inProgress", version: "Sprint 6B Part 2",
    desc: "Custom ritual bundles in the Rituals row — name, icons, anchor times.",
    detail: {
      whatItIs: "User-authored ritual stacks (e.g. 'Morning soft-launch', 'Wind-down at 9'). Live on Planner; needs the /Track sister entry point.",
      whatIsBuilt: ["RitualBuilder modal", "listRitualsForContext helper", "CustomRitualCard / RitualBundleCard"],
      whatIsPending: [
        "/Track surface entry point",
        "Bulk-edit + reorder steps",
      ],
      commits: ["see sprint 6B"],
    },
  },
  {
    id: "voice-to-schedule", name: "Voice to Schedule", Icon: Activity,
    status: "planned", version: "Sprint 7",
    desc: "Web Speech → LLM → PlannerItem entity. 'Add yoga at 7' becomes a scheduled block.",
    detail: {
      whatItIs: "Voice-first scheduling using the Web Speech API for transcription, then an LLM pass to extract structured PlannerItem fields (date, time, type, title).",
      whatIsBuilt: ["VoiceScheduler component shell", "VoiceMicButton in Planner header"],
      whatIsPending: [
        "Permission flow for iOS Safari (requires user-gesture)",
        "Confirmation sheet before writing the item",
        "Disambiguation when the LLM returns ambiguous slots",
      ],
      commits: ["b58aad6"],
    },
  },
  {
    id: "morning-brief", name: "Morning Brief (daily welcome)", Icon: BookOpen,
    status: "shipped", version: "Sprint 8",
    desc: "Once-per-day 3-screen full-screen overlay on first open: greeting, today's focus (PHASE_RECS), your day snapshot.",
    detail: {
      whatItIs: "Auto-launches once per calendar day. Phase-aware greeting reuses JessDailyOpener cache; focus cards are Body/Mind/Nourishment from PHASE_RECS; day card aggregates PlannerItems + open PersonalTasks.",
      whatIsBuilt: [
        "MorningBriefOverlay.jsx with 3 swipe screens + progress dots",
        "femwell_morning_brief_<userId>_<YYYY-MM-DD> gate key",
        "Hidden boundary in App.jsx — silent skip on crash",
      ],
      whatIsPending: [
        "Settings toggle: 'Show me the morning brief'",
        "Translate copy for non-UK locales",
      ],
      commits: ["d8d925e"],
    },
  },
  {
    id: "data-export", name: "Full Data Export (GDPR)", Icon: FileText,
    status: "planned", version: "Pre-launch",
    desc: "One-tap 'Download my data' returns a single ZIP of every entity row tied to the user's id.",
    detail: {
      whatItIs: "GDPR Article 20 right of data portability. Must include profile, check-ins, symptoms, journal entries, ritual logs, habit logs, Jess conversation transcripts, Jess memories.",
      whatIsBuilt: ["DataExportCard component on Settings"],
      whatIsPending: [
        "Server function that aggregates → JSON.zip",
        "Email-with-link delivery for very large exports",
        "Audit log entry for every export request",
      ],
      commits: [],
    },
  },
  {
    id: "compliance", name: "Pre-launch compliance", Icon: ShieldCheck,
    status: "inProgress", version: "Pre-launch",
    desc: "ICO, DPIA, DPA, privacy + T&Cs in-app, granular consent, account deletion cascade, age gate.",
    detail: {
      whatItIs: "The hard-gate items before the App Store submission. Each is a single checklist item on the Legal tab — tap to mark done.",
      whatIsBuilt: ["AccountDeletionCard component", "Privacy + Terms pages live", "Granular consent flags on UserProfile"],
      whatIsPending: [
        "ICO registration (founder action, £40-52)",
        "DPIA — Article 35 risk assessment doc",
        "Base44 DPA signature",
        "Teen age-gate (under-18 flag + parental consent)",
      ],
      commits: ["see Sprint C — compliance fundamentals"],
    },
  },
];

// ── ROADMAP SPRINTS ─────────────────────────────────────────────────
const SPRINTS = [
  { id: "s1", label: "Sprint 1", status: "shipped",    title: "Audit + repo map", desc: "Map all routes, entities, pages; build the dashboard." },
  { id: "s2", label: "Sprint 2", status: "shipped",    title: "Mobile loading + audit fixes", desc: "Fix 90% pages stuck on loading; ship top audit fixes." },
  { id: "s3", label: "Sprint 3", status: "shipped",    title: "Lifestyle content pipeline", desc: "Stop-the-bleeding for ingest; cap source diversity; UK source swap." },
  { id: "s4", label: "Sprint 4", status: "shipped",    title: "Planner v2 + Today design", desc: "Locked row order; signed-off design composition." },
  { id: "s5", label: "Sprint 5", status: "shipped",    title: "Jess v2 (8 features across 3 phases)", desc: "Daily opener, streaming, sensitive topics, nudges, memory, phase prep, feedback, weekly summary." },
  { id: "s6", label: "Sprint 6", status: "shipped",    title: "Crisis protocol + hardening", desc: "7-category classifier; error boundaries; safe storage." },
  { id: "s7", label: "Sprint 7", status: "shipped",    title: "Voice to Schedule (Phase A)", desc: "VoiceScheduler shell + mic button in Planner header." },
  { id: "s8", label: "Sprint 8", status: "shipped",    title: "Morning Brief auto-launch", desc: "Once-per-day 3-screen overlay on first open." },
  { id: "s9", label: "Sprint 9", status: "planned",    title: "Perimenopause deep features", desc: "Hot flush log, HRT diary, peri-specific cards." },
  { id: "s10", label: "Sprint 10", status: "planned",  title: "Partner Sync", desc: "Sharable opt-in partner view of phase + energy + prompt." },
  { id: "store", label: "App Store", status: "planned", title: "Capacitor → TestFlight → App Store", desc: "Wrap Base44 app, submit for review (target 12+ rating)." },
];

// ── STRATEGY ────────────────────────────────────────────────────────
const STRATEGY = [
  {
    id: "model", title: "Business model", chip: "Freemium + Premium",
    body: "Free tier with the daily-cycle core, Jess chat (rate-limited), Planner, Journal. Premium £4.99 / £9.99 per month unlocks the deep features: Voice to Schedule, Patient Summary PDF, unlimited Jess, partner sync, peri-specific cards.",
    notes: [
      "Pricing not locked until cost analysis is complete (Apple 30%, Base44 hosting, OpenAI / Anthropic agent spend).",
      "Avoid hard-paywalling anything that prevents safe use (crisis protocol stays free for everyone forever).",
    ],
  },
  {
    id: "platform", title: "Platform plan", chip: "Base44 → Capacitor → App Store",
    body: "Stay in Base44 through full feature build (mid-June). Then wrap with Capacitor for native shell. TestFlight beta with 30–50 users. App Store submission target Q4.",
    notes: [
      "Don't export the codebase prematurely — Base44 schema migrations are still landing.",
      "RevenueCat + StoreKit for IAP (Apple won't accept Base44 Stripe).",
    ],
  },
  {
    id: "timeline", title: "Timeline", chip: "6–8 months",
    body: "Sprint 1–8 complete (≈10 weeks). Sprints 9–10 + compliance ≈ 6–8 weeks. App Store review ≈ 1–4 weeks. Soft cap on full launch: 9 months from project start.",
    notes: ["Sale-window aim: 6 months. Soft cap: 9 months."],
  },
  {
    id: "pricing-context", title: "Pricing context", chip: "Costs unknown",
    body: "Apple 30% year 1, 15% year 2. OpenAI / Anthropic agent spend per active user TBD. Base44 hosting tier TBD at scale.",
    notes: [
      "Need: cost-per-user analysis at 100, 1k, 10k MAU.",
      "Likely floor: £4.99 to absorb Apple cut + agent cost.",
    ],
  },
  {
    id: "market", title: "Market", chip: "1.8B globally · 47M UK",
    body: "1.8 billion women globally in some hormonal-health window. UK alone: 47M women across reproductive, peri, menopause, post-menopause. Sweet spot is the perimenopause cohort — under-served, higher willingness to pay.",
    notes: [
      "UK regulatory + clinical referral copy keeps the surface defensible.",
      "Not aiming to compete head-on with cycle trackers — FemWell is hormonal companion across the full window.",
    ],
  },
  {
    id: "competitors", title: "Key competitors", chip: "5",
    body: "Clue (cycle), Flo (cycle + community + premium model), Natural Cycles (FDA-cleared contraception), Noom (behavioural coaching), Elvie (hardware + tracking).",
    notes: [
      "Clue / Flo own the reproductive cohort — don't try to take it head-on.",
      "Natural Cycles regulatory bar is a defensible moat — we're explicitly NOT a medical device.",
      "Closer to Noom for behaviour change + clinician-adjacent referral copy.",
    ],
  },
];

// ── LEGAL CHECKLIST ─────────────────────────────────────────────────
// `id` doubles as the localStorage / profile key for each item's
// checked state. Add new items with unique ids.
const LEGAL_CHECKLIST = [
  { id: "ico",          label: "ICO registration",       hint: "£40–52, founder action — register as a data controller" },
  { id: "dpia",         label: "DPIA completed",         hint: "Article 35 risk assessment" },
  { id: "base44_dpa",   label: "Base44 DPA signed",      hint: "Data Processing Agreement with platform" },
  { id: "privacy_page", label: "Privacy policy in-app",  hint: "Live at /privacy" },
  { id: "terms_page",   label: "Terms & conditions in-app", hint: "Live at /terms" },
  { id: "consent",      label: "Granular consent flags on all data collection", hint: "Per-feature opt-in stored on UserProfile" },
  { id: "deletion",     label: "Account deletion cascade QA", hint: "Verify all child rows soft-delete on user delete" },
  { id: "age_gate",     label: "Teen age gate (under-18 flag)", hint: "Parental consent flow for minors" },
  { id: "data_export",  label: "Full data export ('Download my data')", hint: "GDPR Article 20 portability" },
  { id: "contact",      label: "Privacy contact email in app", hint: "Visible in /privacy and /Settings" },
  { id: "jess_notice",  label: "Jess data notice in Jess header", hint: "What Jess sees + 'Not medical advice' footer" },
  { id: "crisis_qa",    label: "Crisis protocol QA", hint: "End-to-end test of all 7 categories on real device" },
  { id: "analytics",    label: "Analytics opt-out toggle", hint: "Settings → Privacy → 'Share anonymised patterns'" },
  { id: "trademark",    label: "Trademark search 'FemWell' (UK health/wellness)", hint: "Class 9 (software), Class 44 (medical/wellness services)" },
  { id: "appstore",     label: "App Store rating review (expect 12+)", hint: "References to women's health, no explicit content" },
];

// ── DECISIONS LOG ───────────────────────────────────────────────────
const DECISIONS = [
  {
    id: "jess-framing",
    title: "Jess AI framing: wellness companion, never diagnostic",
    date: "Locked",
    body: "Jess is positioned as a wellness companion that listens, reflects, and surfaces patterns. She never diagnoses, never prescribes, never names conditions, and always frames responses as wellness support — not medical advice. This avoids MHRA medical-device classification risk and keeps the regulatory bar at consumer-app instead of medical-app.",
  },
  {
    id: "planner-self-contained",
    title: "PlannerV2Shell: self-contained, row order locked",
    date: "Locked",
    body: "All Planner content lives inside PlannerV2Shell.jsx as a single file with internal helper components. No imports from src/components/planner-v2/* (except the few row-utility modules that already existed). Row order is locked: Hero → Lists → Schedule & Cycle → Your Day → Body Today → Stage → Conditions → Rituals → Nourishment → Mind & Insight → Care → Tonight. Sprint 4 sign-off composition is the canvas — every new Planner change starts from that file.",
  },
  {
    id: "no-paywall-yet",
    title: "No freemium/premium split until after full build + cost analysis",
    date: "Locked",
    body: "Tempting to A/B-test pricing mid-build but it'd block on cost numbers we don't have yet (Apple cut, agent spend per active user, Base44 scale tier). Decision: ship the full free experience first, then run a 2-week cost study, then layer Premium gates. No surface gets paywalled until the gate is calibrated to real numbers.",
  },
  {
    id: "teen-stage",
    title: "Teen life stage: biggest legal exposure, parental consent pre-launch",
    date: "Pre-launch hard-gate",
    body: "The 'teen' life-stage path is the single biggest GDPR / age-rating exposure. Decision: implement the under-18 flag at sign-up, route minors into a stripped-down experience (no Jess chat free-text, no Patient Summary, no partner sync), and require a parental-consent email confirmation before activating data collection. App Store rating: 12+ minimum.",
  },
  {
    id: "stay-in-base44",
    title: "Platform: stay in Base44 mid-build, don't export yet",
    date: "Through Sprint 10",
    body: "Base44 schema migrations are still landing — exporting now would split the source of truth. Capacitor wrap + TestFlight come AFTER Sprint 10 ships and the data model freezes. Acceptable cost: locked into Base44 entity model for the foreseeable; offset by the speed of in-platform iteration.",
  },
];

// ── ChecklistService ────────────────────────────────────────────────
// Reads / writes the Legal tab's checked state. Tries the user's
// profile first (so the state follows them across devices); falls back
// to localStorage if the profile write fails (private mode, missing
// schema field, network).
const LS_KEY = (uid) => `femwell_founder_checks_${uid || "anon"}`;

function loadChecks(profile, userId) {
  // Prefer profile.founder_checks (JSON object {id: bool}).
  if (profile && profile.founder_checks && typeof profile.founder_checks === "object") {
    return { ...profile.founder_checks };
  }
  // Fall back to localStorage.
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY(userId));
    if (!raw) return {};
    const j = JSON.parse(raw);
    return j && typeof j === "object" ? j : {};
  } catch { return {}; }
}

async function saveChecks(profile, userId, next) {
  // Best-effort: write to profile if we have one, also mirror to LS.
  if (typeof window !== "undefined" && window.localStorage) {
    try { window.localStorage.setItem(LS_KEY(userId), JSON.stringify(next)); } catch {}
  }
  if (profile?.id) {
    try {
      await base44.entities.UserProfile.update(profile.id, { founder_checks: next });
      return true;
    } catch { return false; }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────
export default function Founders() {
  const { user, isLoadingAuth } = useAuth();
  const [tab, setTab]       = useState("lab");
  const [openCard, setOpenCard] = useState(null);  // Lab card detail
  const [openSprint, setOpenSprint] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checks, setChecks]   = useState({});
  const email = String(user?.email || "").toLowerCase();
  const allowed = ALLOWED_EMAILS.has(email);

  // Load profile + checks once authorised.
  useEffect(() => {
    if (!allowed || !user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.UserProfile
          .filter({ user_id: user.id }, null, 1)
          .catch(() => []);
        const p = rows?.[0] || null;
        setProfile(p);
        setChecks(loadChecks(p, user.id));
      } catch {
        setChecks(loadChecks(null, user.id));
      }
    })();
  }, [allowed, user?.id]);

  const toggleCheck = useCallback((id) => {
    setChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Fire-and-forget persistence.
      saveChecks(profile, user?.id, next);
      return next;
    });
  }, [profile, user?.id]);

  // Pre-auth: gate UI
  if (isLoadingAuth) {
    return (
      <div style={shellStyle}>
        <Banner />
        <main style={mainWrap}>
          <p style={{ ...muted, textAlign: "center", marginTop: 40 }}>Loading…</p>
        </main>
      </div>
    );
  }
  if (!allowed) {
    return (
      <div style={shellStyle}>
        <Banner />
        <main style={{ ...mainWrap, paddingTop: 60, textAlign: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 9999,
            background: "rgba(58,44,26,0.08)", color: C.muted, marginBottom: 16,
          }}><Lock size={22} /></span>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 28, fontWeight: 500, color: C.espresso,
            margin: 0, letterSpacing: "-0.01em",
          }}>Not authorised</h1>
          <p style={{ ...muted, marginTop: 10 }}>
            This page is restricted to FemWell's founder. Sign in with the registered email to access.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Banner />

      {/* Header */}
      <header style={{
        maxWidth: 880, margin: "0 auto", padding: "32px 20px 14px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 12px", borderRadius: 9999,
          background: "rgba(212,175,55,0.16)",
          border: `1px solid ${C.gold}33`,
          marginBottom: 12,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: 9999, background: C.gold,
            boxShadow: `0 0 0 4px ${C.gold}22`,
            display: "inline-block",
          }} />
          <span style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.goldDeep,
          }}>Build in progress</span>
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "clamp(30px, 8vw, 40px)", fontWeight: 500,
          letterSpacing: "-0.02em", lineHeight: 1.05,
          margin: 0, color: C.espresso,
        }}>Founder OS</h1>
        <p style={{
          marginTop: 8, fontSize: 13, color: C.muted,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>{email || "halliburtonoji@gmail.com"} · Build in progress</p>
      </header>

      {/* Tabs (sticky, horizontal scroll on mobile) */}
      <div style={{
        position: "sticky", top: 36, zIndex: 15,
        background: C.cream,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: 880, margin: "0 auto", padding: "10px 12px",
          display: "flex", gap: 6, overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
        }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  flexShrink: 0, scrollSnapAlign: "start",
                  padding: "9px 14px", borderRadius: 9999,
                  background: active ? C.espresso : "transparent",
                  color: active ? C.cream : C.espresso,
                  border: active ? `1px solid ${C.espresso}` : `1px solid ${C.borderS}`,
                  fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em",
                  cursor: "pointer",
                  fontStyle: active ? "italic" : "normal",
                  fontFamily: active ? "'Fraunces', Georgia, serif" : "'Inter', system-ui, sans-serif",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  transition: "all .15s ease",
                }}
              >
                <t.Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <main style={mainWrap}>
        {tab === "lab"       && <LabTab onPickCard={setOpenCard} />}
        {tab === "roadmap"   && <RoadmapTab onPickSprint={setOpenSprint} />}
        {tab === "strategy"  && <StrategyTab />}
        {tab === "legal"     && <LegalTab checks={checks} onToggle={toggleCheck} />}
        {tab === "decisions" && <DecisionsTab />}
      </main>

      {/* Drawers */}
      {openCard && (
        <DetailDrawer
          title={openCard.name}
          badge={STATUS_TONES[openCard.status]}
          subtitle={openCard.version}
          onClose={() => setOpenCard(null)}
        >
          <LabDetailBody item={openCard} />
        </DetailDrawer>
      )}
      {openSprint && (
        <DetailDrawer
          title={openSprint.title}
          badge={STATUS_TONES[openSprint.status]}
          subtitle={openSprint.label}
          onClose={() => setOpenSprint(null)}
        >
          <p style={{ ...body, marginTop: 0 }}>{openSprint.desc}</p>
        </DetailDrawer>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// LAB TAB
// ─────────────────────────────────────────────────────────────────────
function LabTab({ onPickCard }) {
  return (
    <div>
      <SectionKicker
        kicker="FEATURE STATUS · WHAT'S BUILT, WHAT'S NEXT"
        sub="Tap any card to see what's built, what's pending, and which commits landed it."
      />
      <div style={gridStyle}>
        {LAB_CARDS.map((c) => (
          <LabCard key={c.id} card={c} onPick={() => onPickCard(c)} />
        ))}
      </div>
    </div>
  );
}

function LabCard({ card, onPick }) {
  const tone = STATUS_TONES[card.status] || STATUS_TONES.exploring;
  const Icon = card.Icon;
  return (
    <button
      type="button"
      onClick={onPick}
      style={{
        textAlign: "left", cursor: "pointer",
        padding: "16px", borderRadius: 16,
        background: C.paperHi, border: `1px solid ${C.border}`,
        boxShadow: "0 1px 0 rgba(58,44,26,0.04)",
        display: "flex", flexDirection: "column", gap: 10,
        transition: "transform .12s ease, box-shadow .12s ease",
        minHeight: 168,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 11,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {Icon ? <Icon size={17} /> : <Sparkles size={17} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500,
            color: C.espresso, lineHeight: 1.2,
          }}>{card.name}</div>
          {card.version && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{card.version}</div>
          )}
        </div>
      </div>

      <span style={badgeStyle(tone)}>{tone.label}</span>

      <p style={{
        margin: "2px 0 0", fontSize: 12.5, color: "rgba(58,44,26,0.75)",
        lineHeight: 1.5,
      }}>{card.desc}</p>

      <div style={{
        marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 4,
        color: C.goldDeep, fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
      }}>
        View detail <ChevronRight size={14} />
      </div>
    </button>
  );
}

function LabDetailBody({ item }) {
  const d = item.detail || {};
  return (
    <div>
      {d.whatItIs && (
        <DetailSection title="What it is">
          <p style={body}>{d.whatItIs}</p>
        </DetailSection>
      )}
      {Array.isArray(d.whatIsBuilt) && d.whatIsBuilt.length > 0 && (
        <DetailSection title="What's built">
          <ul style={bulletList}>
            {d.whatIsBuilt.map((s, i) => <li key={i} style={bulletItem}>{s}</li>)}
          </ul>
        </DetailSection>
      )}
      {Array.isArray(d.whatIsPending) && d.whatIsPending.length > 0 && (
        <DetailSection title="What's pending">
          <ul style={bulletList}>
            {d.whatIsPending.map((s, i) => <li key={i} style={bulletItem}>{s}</li>)}
          </ul>
        </DetailSection>
      )}
      {Array.isArray(d.commits) && d.commits.length > 0 && (
        <DetailSection title="Recent commits">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {d.commits.map((c, i) => (
              <span key={i} style={commitChip}>{c}</span>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ROADMAP TAB
// ─────────────────────────────────────────────────────────────────────
function RoadmapTab({ onPickSprint }) {
  return (
    <div>
      <SectionKicker
        kicker="SPRINT TIMELINE"
        sub="Sprint 1–8 shipped. 9–10 planned. App Store target Q4."
      />
      <ol style={{
        marginTop: 14, padding: 0, listStyle: "none",
        position: "relative",
      }}>
        {/* vertical line */}
        <span aria-hidden style={{
          position: "absolute", left: 18, top: 12, bottom: 12,
          width: 2, background: `${C.border}`, borderRadius: 2,
        }} />
        {SPRINTS.map((s) => {
          const tone = STATUS_TONES[s.status] || STATUS_TONES.planned;
          const dotBg = s.status === "shipped" ? C.sage
                      : s.status === "inProgress" ? C.gold
                      : "rgba(58,44,26,0.18)";
          return (
            <li key={s.id} style={{ position: "relative", paddingLeft: 46, marginBottom: 12 }}>
              <span aria-hidden style={{
                position: "absolute", left: 12, top: 12,
                width: 14, height: 14, borderRadius: 9999,
                background: dotBg,
                border: `2px solid ${C.cream}`,
                boxShadow: "0 0 0 1px " + C.border,
              }} />
              <button
                type="button"
                onClick={() => onPickSprint(s)}
                style={{
                  textAlign: "left", width: "100%",
                  background: C.paperHi, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "12px 14px", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em",
                    textTransform: "uppercase", color: C.muted,
                  }}>{s.label}</span>
                  <span style={badgeStyle(tone)}>{tone.label}</span>
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
                  color: C.espresso, lineHeight: 1.25,
                }}>{s.title}</p>
                <p style={{
                  margin: 0, fontSize: 12.5,
                  color: "rgba(58,44,26,0.72)", lineHeight: 1.5,
                }}>{s.desc}</p>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// STRATEGY TAB
// ─────────────────────────────────────────────────────────────────────
function StrategyTab() {
  return (
    <div>
      <SectionKicker
        kicker="STRATEGY · WHERE FEMWELL IS HEADED"
        sub="Business model, platform plan, timeline, pricing context, market, competitors."
      />
      <div style={gridStyle}>
        {STRATEGY.map((s) => (
          <article key={s.id} style={{
            background: C.paperHi, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 16,
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h3 style={{
                margin: 0,
                fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500,
                color: C.espresso, letterSpacing: "-0.01em",
              }}>{s.title}</h3>
              {s.chip && <span style={{ ...badgeStyle(STATUS_TONES.demoReady) }}>{s.chip}</span>}
            </div>
            <p style={{ ...body, marginTop: 0 }}>{s.body}</p>
            {Array.isArray(s.notes) && s.notes.length > 0 && (
              <ul style={{ ...bulletList, marginTop: 4 }}>
                {s.notes.map((n, i) => <li key={i} style={bulletItem}>{n}</li>)}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// LEGAL TAB
// ─────────────────────────────────────────────────────────────────────
function LegalTab({ checks, onToggle }) {
  const total = LEGAL_CHECKLIST.length;
  const done  = LEGAL_CHECKLIST.filter((i) => checks[i.id]).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <SectionKicker
        kicker="LAUNCH CHECKLIST"
        sub="Tick each item as it ships. Progress syncs to your profile."
      />

      {/* Progress bar */}
      <div style={{
        marginTop: 14, padding: 14, borderRadius: 14,
        background: C.paperHi, border: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: C.espresso,
          }}>{done} <span style={muted}>of {total}</span></span>
          <span style={{ ...muted, fontSize: 13, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{
          height: 8, borderRadius: 9999, background: "rgba(58,44,26,0.08)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: pct === 100 ? C.sage : C.gold,
            transition: "width 220ms ease, background 220ms ease",
          }} />
        </div>
      </div>

      <ul style={{ marginTop: 14, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {LEGAL_CHECKLIST.map((item) => {
          const on = !!checks[item.id];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={on}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: C.paperHi, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "12px 14px",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  transition: "background 160ms ease",
                }}
              >
                <span aria-hidden style={{
                  flexShrink: 0,
                  width: 22, height: 22, borderRadius: 7,
                  background: on ? C.sage : "transparent",
                  border: on ? `1px solid ${C.sageDeep}` : `1.5px solid ${C.borderS}`,
                  color: C.paperHi,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>
                  {on && <Check size={13} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 14, fontWeight: 600,
                    color: on ? C.muted : C.espresso,
                    textDecoration: on ? "line-through" : "none",
                    lineHeight: 1.35,
                  }}>{item.label}</p>
                  {item.hint && (
                    <p style={{
                      margin: "2px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.5,
                    }}>{item.hint}</p>
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
// DECISIONS TAB
// ─────────────────────────────────────────────────────────────────────
function DecisionsTab() {
  return (
    <div>
      <SectionKicker
        kicker="DECISIONS LOG · WHY WE BUILT IT THIS WAY"
        sub="Architecture and business calls that shape the rest of the build."
      />
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {DECISIONS.map((d) => (
          <article key={d.id} style={{
            background: C.paperHi, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 16,
            display: "flex", flexDirection: "column", gap: 8,
            borderLeft: `3px solid ${C.gold}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h3 style={{
                margin: 0,
                fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500,
                color: C.espresso, lineHeight: 1.25, letterSpacing: "-0.01em",
              }}>{d.title}</h3>
              {d.date && <span style={{ ...muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{d.date}</span>}
            </div>
            <p style={{ ...body, marginTop: 0 }}>{d.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Shared UI atoms
// ─────────────────────────────────────────────────────────────────────
function Banner() {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: C.ink, color: C.cream,
      padding: "10px 16px", textAlign: "center",
      fontSize: 10.5, letterSpacing: "0.22em", fontWeight: 700,
      textTransform: "uppercase",
    }}>
      Founder OS · Build in progress
    </div>
  );
}

function SectionKicker({ kicker, sub }) {
  return (
    <div>
      <p style={{
        margin: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 10.5, fontWeight: 800,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: C.muted,
      }}>{kicker}</p>
      {sub && (
        <p style={{
          margin: "8px 0 0",
          fontSize: 14, color: "rgba(58,44,26,0.78)", lineHeight: 1.55,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>{sub}</p>
      )}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section style={{ marginTop: 14 }}>
      <p style={{
        margin: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 10.5, fontWeight: 800,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: C.muted, marginBottom: 8,
      }}>{title}</p>
      {children}
    </section>
  );
}

function DetailDrawer({ title, subtitle, badge, onClose, children }) {
  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  // ESC to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <>
      <style>{`
        @keyframes founder-sheet-slide {
          from { transform: translateY(8%); opacity: 0.6; }
          to   { transform: translateY(0);  opacity: 1; }
        }
      `}</style>
      <div
        onClick={onClose}
        role="presentation"
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(14,14,14,0.55)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          left: "50%", bottom: 0,
          transform: "translateX(-50%)",
          width: "min(100vw, 520px)",
          maxHeight: "88vh",
          background: C.cream,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -12px 36px rgba(14,14,14,0.36)",
          zIndex: 201,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "founder-sheet-slide 280ms cubic-bezier(0.22,1,0.36,1)",
          paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, paddingBottom: 4 }}>
          <span aria-hidden style={{
            width: 36, height: 4, borderRadius: 9999, background: C.borderS,
          }} />
        </div>
        {/* Header */}
        <div style={{
          padding: "8px 18px 12px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 10,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {subtitle && (
              <p style={{
                margin: 0, fontSize: 11, color: C.muted, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}>{subtitle}</p>
            )}
            <h2 style={{
              margin: "4px 0 0",
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 22, fontWeight: 500, color: C.espresso, letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}>{title}</h2>
            {badge && (
              <span style={{ ...badgeStyle(badge), marginTop: 8 }}>{badge.label}</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: 9999,
              background: C.paperHi, border: `1px solid ${C.border}`,
              color: C.espresso, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          ><X size={15} /></button>
        </div>
        {/* Body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "0 18px 22px",
          WebkitOverflowScrolling: "touch",
        }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────
const shellStyle = {
  minHeight: "100vh", background: C.cream, paddingBottom: 120,
  fontFamily: "'Inter', system-ui, sans-serif", color: C.espresso,
};
const mainWrap = { maxWidth: 880, margin: "0 auto", padding: "24px 16px 60px" };
const gridStyle = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 12,
};
const muted = { color: C.muted, fontSize: 13, fontFamily: "'Inter', sans-serif" };
const body  = { margin: "8px 0 0", fontSize: 13.5, color: "rgba(58,44,26,0.78)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" };
const bulletList = { margin: "4px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 };
const bulletItem = { fontSize: 13, color: "rgba(58,44,26,0.78)", lineHeight: 1.55, fontFamily: "'Inter', sans-serif" };
const commitChip = {
  fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  fontSize: 11, padding: "3px 8px", borderRadius: 9999,
  background: "rgba(58,44,26,0.08)", color: C.espresso,
  letterSpacing: "0.02em", fontWeight: 600,
};
function badgeStyle(tone) {
  return {
    alignSelf: "flex-start",
    padding: "3px 9px", borderRadius: 9999,
    background: tone?.bg || "rgba(58,44,26,0.08)",
    color: tone?.fg || C.muted,
    fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "inline-block",
  };
}
