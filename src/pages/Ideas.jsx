// ─────────────────────────────────────────────────────────────────────────────
// /Ideas — FemWell Design Lab
//
// Top-level feature tabs (Overview · Smart Logger · Planner · Journal · Jess AI
// · More coming) with a version-history pill row inside each feature.
//
// Existing planner demos are preserved under the Planner tab as versions.
// Smart Logger has 4 versions: v4 (the new SmartLoggerV4 swipeable cards), v3
// (the current quick-log SmartLoggerDemo), and v2/v1 as compact archive
// description cards that show what those iterations explored.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// Live demo components — kept across the rebuild.
import BiorhythmTimeline from "@/components/BiorhythmTimeline";
import MissionControl from "@/components/MissionControl";
import AccordionPlanner from "@/components/AccordionPlanner";
import MorningDashboard from "@/components/MorningDashboard";
import TimeOfDayFlow from "@/components/TimeOfDayFlow";
import CardDeckPlanner from "@/components/CardDeckPlanner";
// Sprint B B6: UnifiedPlannerDemo + its 9 row dependencies deleted as dead
// code. PlannerV2Shell (production Planner) is the surviving v2 surface.
import SmartLoggerDemo from "@/components/SmartLoggerDemo";   // v3
// Jess AI tab — JessDemoPanel is the rebuilt phase-aware experience with
// the botanical avatar, memory bar, context strip, and 3-tab shell.
import JessDemoPanel from "@/components/assistant/JessDemoPanel";
import JessHubDemo from "@/components/assistant/JessHubDemo";
import JessWingsDemo from "@/components/assistant/JessWingsDemo";
import SmartLoggerV4 from "@/components/SmartLoggerV4";       // v4 (new)

// Unified Logger demo HTML — raw strings (Vite ?raw suffix returns file as string).
import unifiedTabsV2Html from "@/data/unifiedLogger/tabs-v2.html?raw";
import unifiedDemo1Html from "@/data/unifiedLogger/demo1-tabs.html?raw";
import unifiedDemo2Html from "@/data/unifiedLogger/demo2-rail.html?raw";
import unifiedDemo3Html from "@/data/unifiedLogger/demo3-dial.html?raw";

import {
  Sparkles, CalendarClock, BookOpen, MessageCircle, ChevronRight, Layers, Zap,
} from "lucide-react";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#F4EFE3",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  sage:     "#8FAF8F",
  sageDeep: "#6F8B6F",
  blush:    "#E8B4B8",
  ink:      "#0E0E0E",
};

const STATUS_TONES = {
  exploring: { bg: "rgba(58,44,26,0.08)",  fg: C.muted,    label: "Exploring" },
  demoReady: { bg: `${C.gold}1F`,          fg: C.goldDeep, label: "Demo ready" },
  approved:  { bg: `${C.sage}22`,          fg: C.sageDeep, label: "Approved to build" },
  shipped:   { bg: "rgba(58,44,26,0.10)",  fg: C.espresso, label: "Shipped" },
};

// ── Feature definitions ─────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "smartlogger",
    name: "Smart Logger",
    Icon: Sparkles,
    status: "demoReady",
    latest: "v4 · Swipeable cards",
    desc: "Unified FAB + sheet that replaces today's per-page loggers.",
  },
  {
    id: "unifiedlogger",
    name: "Unified Logger",
    Icon: Zap,
    status: "exploring",
    latest: "Tab Sheet v2",
    desc: "One button. Log and plan from anywhere in the app.",
  },
  {
    id: "planner",
    name: "Planner",
    Icon: CalendarClock,
    status: "shipped",
    latest: "v2 · Unified",
    desc: "Today + Cycle in one shell — the home of cycle-aware planning.",
  },
  {
    id: "journal",
    name: "Journal",
    Icon: BookOpen,
    status: "exploring",
    latest: "Concept",
    desc: "Where reflection lives — prompts, letters, and the cycle mirror.",
  },
  {
    id: "jessai",
    name: "Jess AI",
    Icon: MessageCircle,
    status: "exploring",
    latest: "Concept",
    desc: "The voice across the app — patterns, prompts, conversation.",
  },
];

const FEATURE_TABS = [
  { id: "overview",      label: "Overview" },
  { id: "smartlogger",   label: "Smart Logger" },
  { id: "unifiedlogger", label: "Unified Logger" },
  { id: "planner",       label: "Planner" },
  { id: "journal",       label: "Journal" },
  { id: "jessai",        label: "Jess AI" },
  { id: "more",          label: "More coming", muted: true },
];

// ── Smart Logger version registry ───────────────────────────────────────────
const SMARTLOGGER_VERSIONS = [
  { id: "v4", label: "v4", sub: "Swipeable cards",   active: true,  render: () => <SmartLoggerV4 /> },
  { id: "v3", label: "v3", sub: "Quick log",         active: false, render: () => <SmartLoggerDemo /> },
  { id: "v2", label: "v2", sub: "Grouped sections",  active: false, render: () => <ArchiveCard version={2} /> },
  { id: "v1", label: "v1", sub: "Initial concept",   active: false, render: () => <ArchiveCard version={1} /> },
];

// ── Unified Logger version registry ─────────────────────────────────────────
// Three interactive HTML demos rendered inside iframes via srcDoc.
function UnifiedLoggerIframe({ html, title }) {
  return (
    <iframe
      srcDoc={html}
      title={title}
      sandbox="allow-scripts allow-same-origin allow-forms"
      style={{
        width: "100%", height: 760, border: "none",
        borderRadius: 16, background: C.paper,
        boxShadow: "0 1px 0 rgba(58,44,26,0.06)",
      }}
    />
  );
}
const UNIFIEDLOGGER_VERSIONS = [
  { id: "tabsv2", label: "Tab Sheet v2", sub: "Latest",      active: true,  render: () => <UnifiedLoggerIframe html={unifiedTabsV2Html} title="Unified Logger — Tab Sheet v2" /> },
  { id: "demo1",  label: "Demo 1",       sub: "Tab Sheet",   active: false, render: () => <UnifiedLoggerIframe html={unifiedDemo1Html}  title="Unified Logger — Tab Sheet" /> },
  { id: "demo2",  label: "Demo 2",       sub: "Inline Rail", active: false, render: () => <UnifiedLoggerIframe html={unifiedDemo2Html}  title="Unified Logger — Inline Rail" /> },
  { id: "demo3",  label: "Demo 3",       sub: "Command Dial",active: false, render: () => <UnifiedLoggerIframe html={unifiedDemo3Html}  title="Unified Logger — Command Dial" /> },
];

// ── Jess AI version registry ───────────────────────────────────────────────
// Wraps each Jess demo in the same fixed-height shell the page used to
// give JessDemoPanel directly, so the version pills swap content cleanly.
function JessShell({ children }) {
  return (
    <div style={{
      height: "min(82vh, 820px)",
      background: "#F4EDDB",
      border: "1px solid rgba(58,44,26,0.12)",
      borderRadius: 18,
      overflow: "hidden",
      display: "flex",
    }}>{children}</div>
  );
}
const JESSAI_VERSIONS = [
  { id: "homebase", label: "Home Base", sub: "4-tab phase-aware shell · live", active: true,  render: () => <JessShell><JessDemoPanel /></JessShell> },
  { id: "hub",      label: "Hub",       sub: "Central command centre",          active: false, render: () => <JessShell><JessHubDemo  /></JessShell> },
  { id: "wings",    label: "Wings",     sub: "Where Jess lives across the app", active: false, render: () => <JessShell><JessWingsDemo /></JessShell> },
];

// ── Planner version registry ───────────────────────────────────────────────
// Surface the existing planner demos as a version row.
const PLANNER_VERSIONS = [
  // Sprint B B6: removed legacy "v2 / Unified" entry. UnifiedPlannerDemo
  // and its 9 row dependencies were deleted as dead code — production
  // Planner is now PlannerV2Shell, viewable at /Planner.
  { id: "deck",      label: "Deck",       sub: "Card deck",     render: () => <CardDeckPlanner /> },
  { id: "flow",      label: "Flow",       sub: "Time of day",   render: () => <TimeOfDayFlow /> },
  { id: "dashboard", label: "Dashboard",  sub: "Morning brief", render: () => <MorningDashboard /> },
  { id: "accordion", label: "Accordion",  sub: "Section roll-up", render: () => <AccordionPlanner /> },
  { id: "mission",   label: "Mission",    sub: "Mission control", render: () => <MissionControl /> },
  { id: "biorhythm", label: "Biorhythm",  sub: "Energy curve",    render: () => <BiorhythmTimeline /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Ideas() {
  const [feature, setFeature] = useState("overview");
  const [smartVersion,   setSmartVersion]   = useState("v4");
  const [unifiedVersion, setUnifiedVersion] = useState("tabsv2");
  const [plannerVersion, setPlannerVersion] = useState("unified");
  const [jessVersion,    setJessVersion]    = useState("homebase");

  return (
    <div style={{
      minHeight: "100vh", background: C.cream, paddingBottom: 100,
      fontFamily: "'Inter', system-ui, sans-serif", color: C.espresso,
    }}>
      {/* Dev banner */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: C.ink, color: C.cream,
        padding: "10px 16px", textAlign: "center",
        fontSize: 10.5, letterSpacing: "0.22em", fontWeight: 700,
        textTransform: "uppercase",
      }}>
        Design Lab · Dev Only
      </div>

      {/* Header */}
      <header style={{
        maxWidth: 880, margin: "0 auto", padding: "44px 20px 20px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em",
          margin: 0, lineHeight: 1.05, color: C.espresso,
        }}>FemWell Design Lab</h1>
        <p style={{
          marginTop: 10, fontSize: 14.5, color: "rgba(58,44,26,0.7)",
          fontStyle: "italic", lineHeight: 1.55, maxWidth: 540,
          marginLeft: "auto", marginRight: "auto",
        }}>
          Where features get shaped before they're built.
        </p>
      </header>

      {/* Feature tabs row (horizontal scroll on mobile) */}
      <div style={{
        position: "sticky", top: 36, zIndex: 15,
        background: C.cream,
        borderBottom: "1px solid rgba(58,44,26,0.10)",
      }}>
        <div style={{
          maxWidth: 880, margin: "0 auto", padding: "10px 12px",
          display: "flex", gap: 6, overflowX: "auto",
          scrollSnapType: "x mandatory",
        }}>
          {FEATURE_TABS.map((t) => {
            const active = feature === t.id;
            const muted  = !!t.muted;
            return (
              <button
                key={t.id}
                onClick={() => !muted && setFeature(t.id)}
                disabled={muted}
                style={{
                  flexShrink: 0, scrollSnapAlign: "start",
                  padding: "9px 16px", borderRadius: 9999,
                  background: active ? C.espresso : "transparent",
                  color: active ? C.cream : (muted ? "rgba(58,44,26,0.35)" : C.espresso),
                  border: active ? `1px solid ${C.espresso}` :
                          muted  ? "1px dashed rgba(58,44,26,0.20)" :
                                   "1px solid rgba(58,44,26,0.18)",
                  fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em",
                  cursor: muted ? "not-allowed" : "pointer",
                  fontStyle: active ? "italic" : "normal",
                  fontFamily: active ? "'Fraunces', Georgia, serif" : "'Inter', system-ui, sans-serif",
                  transition: "all .15s ease",
                }}
              >{t.label}</button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px 60px" }}>
        {feature === "overview"    && <OverviewView onPick={setFeature} />}
        {feature === "smartlogger" && (
          <FeatureBody
            title="Smart Logger"
            kicker="UNIFIED LOGGING FAB"
            description="Replaces Today's CheckinModal + the global Universal FAB with a single, context-aware entry point. Stage-aware suggestions, inline saves, swipeable section deck."
            versions={SMARTLOGGER_VERSIONS}
            activeId={smartVersion}
            onPick={setSmartVersion}
          />
        )}
        {feature === "unifiedlogger" && (
          <FeatureBody
            title="Unified Logger"
            kicker="ONE BUTTON · LOG + PLAN"
            description="Three concept directions for a single, anywhere-in-the-app entry point that handles both logging and planning. Each demo is a fully interactive prototype."
            versions={UNIFIEDLOGGER_VERSIONS}
            activeId={unifiedVersion}
            onPick={setUnifiedVersion}
          />
        )}
        {feature === "planner" && (
          <FeatureBody
            title="Planner"
            kicker="TODAY + CYCLE"
            description="The home of cycle-aware planning. Today's plan + the cycle view in one shell. v2 (Unified) is what's shipped on the live app."
            versions={PLANNER_VERSIONS}
            activeId={plannerVersion}
            onPick={setPlannerVersion}
          />
        )}
        {feature === "journal" && <ComingSoonView name="Journal" />}
        {feature === "jessai"  && (
          <FeatureBody
            title="Jess AI"
            kicker="THE VOICE ACROSS THE APP"
            description="Three demos of Jess. Home Base is the shipped 4-tab phase-aware shell (live behind every Jess surface). Hub frames Jess as a stand-alone command centre. Wings shows where Jess lives across the rest of FemWell — Planner, Voice Logger, Doctor Export, Astra handoff."
            versions={JESSAI_VERSIONS}
            activeId={jessVersion}
            onPick={setJessVersion}
          />
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview — feature grid
// ─────────────────────────────────────────────────────────────────────────────
function OverviewView({ onPick }) {
  return (
    <div>
      <SectionKicker
        kicker="WHAT'S IN THE LAB"
        sub="Tap any card to see its design history and the current direction."
      />
      <div style={{
        marginTop: 16,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      }}>
        {FEATURES.map((f) => (
          <FeatureCard key={f.id} f={f} onPick={() => onPick(f.id)} />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ f, onPick }) {
  const tone = STATUS_TONES[f.status] || STATUS_TONES.exploring;
  return (
    <button
      onClick={onPick}
      style={{
        textAlign: "left", cursor: "pointer",
        padding: "18px 18px 16px", borderRadius: 18,
        background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
        boxShadow: "0 1px 0 rgba(58,44,26,0.04)",
        display: "flex", flexDirection: "column", gap: 10,
        transition: "transform .12s ease, box-shadow .12s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 38, height: 38, borderRadius: 12,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <f.Icon size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500,
            color: C.espresso, lineHeight: 1.2,
          }}>{f.name}</div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{f.latest}</div>
        </div>
      </div>

      <span style={{
        alignSelf: "flex-start",
        padding: "3px 9px", borderRadius: 9999,
        background: tone.bg, color: tone.fg,
        fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>{tone.label}</span>

      <p style={{
        margin: "2px 0 0", fontSize: 13, color: "rgba(58,44,26,0.75)",
        lineHeight: 1.5,
      }}>{f.desc}</p>

      <div style={{
        marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4,
        color: C.goldDeep, fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
      }}>
        View demos <ChevronRight size={14} />
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FeatureBody — version pills + active version render
// ─────────────────────────────────────────────────────────────────────────────
function FeatureBody({ title, kicker, description, versions, activeId, onPick }) {
  const active = versions.find((v) => v.id === activeId) || versions[0];
  return (
    <div>
      <SectionKicker kicker={kicker} sub={description} />

      {/* Version pills */}
      <div style={{
        marginTop: 16,
        display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
      }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.16em",
          color: C.muted, textTransform: "uppercase", marginRight: 4,
        }}>Versions</span>
        {versions.map((v, i) => {
          const isActive = v.id === activeId;
          const isLatest = i === 0;
          return (
            <button
              key={v.id}
              onClick={() => onPick(v.id)}
              style={{
                padding: "7px 13px", borderRadius: 9999,
                background: isActive ? C.gold : C.paperHi,
                color: isActive ? C.ink : C.espresso,
                border: isActive ? `1px solid ${C.gold}` : "1px solid rgba(58,44,26,0.18)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "all .15s ease",
              }}
            >
              {isLatest && (
                <span style={{
                  padding: "2px 6px", borderRadius: 9999,
                  background: isActive ? C.ink : `${C.gold}33`,
                  color: isActive ? C.gold : C.goldDeep,
                  fontSize: 8.5, letterSpacing: "0.12em", fontWeight: 800,
                }}>LATEST</span>
              )}
              <span>{v.label}</span>
              <span style={{
                fontSize: 10.5, color: isActive ? "rgba(14,14,14,0.7)" : C.muted, fontWeight: 600,
              }}>· {v.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Title block */}
      <h2 style={{
        marginTop: 22,
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, fontWeight: 500,
        color: C.espresso, letterSpacing: "-0.015em",
      }}>{title} · <span style={{ color: C.goldDeep, fontStyle: "italic" }}>{active.label}</span>
        <span style={{ marginLeft: 8, fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: "0.02em", fontFamily: "'Inter', system-ui, sans-serif" }}>{active.sub}</span>
      </h2>

      {/* Active version render */}
      <div style={{ marginTop: 12 }}>
        {active.render()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ArchiveCard — static description for v1 / v2 in the Smart Logger history
// ─────────────────────────────────────────────────────────────────────────────
function ArchiveCard({ version }) {
  const META = {
    1: {
      tagline: "The first sketch of a unified logger",
      bullets: [
        "Single bottom sheet replacing Today's CheckinModal + the global FAB.",
        "Stage-aware suggestion list — 3-4 actions per life stage.",
        "Full grid of 14 log types (Mood · Energy · Symptom · Meal · …).",
        "Mood log was a sub-screen — 5-face scale, influences, save button.",
        "Jess pattern card surfaced after save with accept / dismiss CTAs.",
        "Established the 4 life stages: Luteal · Pregnant T2 · Peri · TTC.",
      ],
      whyMoved: "Too many taps to reach a single log. Tall cards crowded the sheet. The grid felt flat and gave every log type equal weight.",
    },
    2: {
      tagline: "Compact suggestions and grouped log types",
      bullets: [
        "Compact suggestion pills in a horizontal scroll instead of tall cards.",
        "Log types grouped under Body · Nourish · Health · Mind & Life.",
        "Added missing types: Period, Drinks, Caffeine, Weight, Sleep, Appointment, Activity (17 total).",
        "New \"From across your app\" engagement rail at the bottom — Podcast / Reading / Journal Prompt / Jess Tip cards with dark gradients, all stage-aware.",
        "Lighter sheet header — one line title + timestamp + close.",
      ],
      whyMoved: "Still too many taps to reach the actual save. Mood still pushed to its own sheet. Quick logs (water, meds) had no shortcut.",
    },
  };
  const m = META[version];
  return (
    <article style={{
      maxWidth: 720, margin: "0 auto",
      padding: "26px 24px", borderRadius: 18,
      background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
    }}>
      <span style={{
        fontSize: 10, letterSpacing: "0.20em", fontWeight: 800,
        color: C.muted, textTransform: "uppercase",
      }}>VERSION HISTORY · v{version}</span>
      <h3 style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 500,
        color: C.espresso, margin: "6px 0 4px", lineHeight: 1.2,
      }}>{m.tagline}</h3>
      <p style={{
        fontSize: 12.5, color: C.muted, fontStyle: "italic", margin: "0 0 16px", lineHeight: 1.5,
      }}>Static archive · the live demo for v{version} was replaced when this version moved forward.</p>

      <div style={{
        fontSize: 10.5, letterSpacing: "0.16em", fontWeight: 800,
        color: C.muted, textTransform: "uppercase", marginBottom: 8,
      }}>WHAT THIS VERSION ESTABLISHED</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {m.bullets.map((b, i) => (
          <li key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            fontSize: 13.5, color: C.espresso, lineHeight: 1.55,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: 9999, background: C.gold,
              marginTop: 9, flexShrink: 0,
            }} />
            {b}
          </li>
        ))}
      </ul>

      <div style={{
        marginTop: 18, padding: "12px 14px", borderRadius: 12,
        background: `${C.gold}14`, border: `1px solid ${C.gold}44`,
      }}>
        <div style={{
          fontSize: 10, letterSpacing: "0.16em", fontWeight: 800,
          color: C.goldDeep, textTransform: "uppercase", marginBottom: 4,
        }}>Why we moved on</div>
        <div style={{ fontSize: 13, color: C.espresso, lineHeight: 1.5 }}>{m.whyMoved}</div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ComingSoonView — placeholder for Journal & Jess AI
// ─────────────────────────────────────────────────────────────────────────────
function ComingSoonView({ name }) {
  return (
    <div style={{
      maxWidth: 560, margin: "60px auto 0",
      padding: "44px 28px",
      background: C.paperHi, borderRadius: 18,
      border: "1px solid rgba(58,44,26,0.10)",
      textAlign: "center",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 52, height: 52, borderRadius: 14,
        background: `${C.gold}1F`, color: C.goldDeep, margin: "0 auto 14px",
      }}>
        <Layers size={22} />
      </span>
      <h3 style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 500,
        color: C.espresso, margin: 0, lineHeight: 1.2,
      }}>Coming soon</h3>
      <p style={{
        marginTop: 8, fontSize: 13.5, color: "rgba(58,44,26,0.65)",
        lineHeight: 1.55,
      }}>
        Design explorations for <strong>{name}</strong> will live here. We'll add
        each iteration as a version pill at the top of this tab as the work
        unfolds.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionKicker — uppercase kicker + optional sub
// ─────────────────────────────────────────────────────────────────────────────
function SectionKicker({ kicker, sub }) {
  return (
    <div>
      <div style={{
        fontSize: 10.5, letterSpacing: "0.20em", fontWeight: 800,
        color: C.muted, textTransform: "uppercase",
      }}>{kicker}</div>
      {sub && (
        <p style={{
          marginTop: 8, fontSize: 13.5, color: "rgba(58,44,26,0.7)",
          lineHeight: 1.55, maxWidth: 660,
        }}>{sub}</p>
      )}
    </div>
  );
}
