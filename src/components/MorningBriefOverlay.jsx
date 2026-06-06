// MorningBriefOverlay — Sprint 8
//
// Once-per-day full-screen overlay that fires when the user opens
// FemWell for the first time on a given calendar day. Three screens:
//
//   1. Good Morning  — Fraunces name greeting, today's date, cycle
//                      day + phase, 1-sentence Jess greeting (reuses
//                      the JessDailyOpener cache if it exists, else
//                      generates fresh and warms the cache).
//   2. Today's Focus — 3 phase-aware PHASE_RECS cards:
//                      Body / Mind / Nourishment.
//   3. Your Day      — Snapshot of today's PlannerItems +
//                      PersonalTasks. Empty-state copy if nothing.
//
// Trigger gating lives in App.jsx — this component renders whatever
// it's handed; the parent decides when. On `Let's go →` / `Skip` / ×
// the parent receives `onDismiss()` and writes the seen flag.
//
// Filename note: there's already a `MorningBrief.jsx` in
// /Ideas — a multi-card planning ritual demo. This overlay is a
// separate, simpler thing that auto-launches at app open.
//
// No new entity. No AI on Screen 2. Screen 1 AI call is the same
// callJessAgent path JessDailyOpener uses, with the same daily cache
// so we don't double-bill the agent.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, Heart, Brain, Apple, Sparkles,
  ChevronRight, ListChecks, CalendarDays,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  callJessAgent,
  loadDailyCache,
  saveDailyCache,
  todayKey,
} from "@/services/jessAgentService";
import { useCycleDay } from "@/hooks/useCycleDay";
import { PHASE_RECS } from "@/data/phaseRecs";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  sage:     "#8FAF8F",
  gold:     "#D4AF37",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
};

const PHASE_FALLBACK = {
  menstrual:  "Good morning. Day {n} of your menstrual phase — be soft with yourself today.",
  follicular: "Good morning. Day {n} of your follicular phase — energy is on the way up.",
  ovulatory:  "Good morning. Day {n} of your ovulatory phase — your peak window is open.",
  luteal:     "Good morning. Day {n} of your luteal phase — a gentler pace suits this week.",
};

const PHASE_LABEL = {
  menstrual:  "Menstrual",
  follicular: "Follicular",
  ovulatory:  "Ovulatory",
  luteal:     "Luteal",
};

function todayISO() {
  return todayKey(); // "YYYY-MM-DD" using local components
}

function prettyDate(d = new Date()) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function resolveDisplayName(user, profile) {
  if (profile?.display_name) return profile.display_name;
  if (user?.full_name) return user.full_name;
  if (user?.email) {
    const prefix = String(user.email).split("@")[0];
    const words = prefix.split(/[0-9_.\-]+/).filter(Boolean);
    if (words[0]) return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  }
  return "there";
}

export default function MorningBriefOverlay({ user, profile, onDismiss }) {
  const [screen, setScreen]   = useState(0); // 0,1,2
  const [closing, setClosing] = useState(false);
  const [text, setText]       = useState("");

  // Today snapshot (Screen 3) — loaded lazily once after mount.
  const [snap, setSnap] = useState({ events: 0, tasks: 0, loaded: false });

  const cycle = useCycleDay(profile);
  const lifeStage = profile?.life_stage || "reproductive";
  const displayName = resolveDisplayName(user, profile);
  const dateLine = useMemo(() => prettyDate(), []);
  const ranGreetingRef = useRef(false);
  const ranSnapRef = useRef(false);

  // Phase used for PHASE_RECS lookup. Fall back to follicular so we
  // always have something to render even on a brand-new account.
  const phaseForRecs = (cycle.phase && PHASE_RECS[cycle.phase]) ? cycle.phase : "follicular";
  const recs = PHASE_RECS[phaseForRecs] || PHASE_RECS.follicular;
  const phaseLabel = PHASE_LABEL[cycle.phase || phaseForRecs];

  // ── Screen 1: Jess greeting (cache-first). ─────────────────────────
  useEffect(() => {
    if (!user?.id || ranGreetingRef.current) return;
    ranGreetingRef.current = true;

    const cacheKey = `jess_daily_open_${user.id}_${todayISO()}`;
    const cached = loadDailyCache(cacheKey);
    const fallback = (PHASE_FALLBACK[cycle.phase] || PHASE_FALLBACK.follicular)
      .replace("{n}", String(cycle.cycleDay || 1));

    // If JessDailyOpener already wrote a greeting today, use it.
    if (cached?.text) { setText(cached.text); return; }

    // Otherwise generate one and warm the cache so JessDailyOpener
    // doesn't fire a second agent round trip on the same day.
    const system =
      "You are Jess, a warm UK-based women's health companion. " +
      "Write a warm 1-2 sentence good morning message that acknowledges " +
      "where they are in their cycle. Be warm, specific, not generic. " +
      "No medical advice. No sign-off. No quotation marks. " +
      "Maximum 220 characters.";
    const userPrompt =
      `Cycle day: ${cycle.cycleDay || 1}.\n` +
      `Phase: ${cycle.phase || "follicular"}.\n` +
      `Life stage: ${lifeStage}.\n\n` +
      `Write the greeting.`;

    callJessAgent({ system, user: userPrompt })
      .then(({ text: raw }) => {
        const cleaned = String(raw || "").trim().replace(/^["']|["']$/g, "");
        const final = cleaned && cleaned.length > 8 ? cleaned : fallback;
        setText(final);
        // Mirror JessDailyOpener's cache shape so it can short-circuit.
        saveDailyCache(cacheKey, { text: final, shown: true });
      })
      .catch(() => {
        setText(fallback);
        saveDailyCache(cacheKey, { text: fallback, shown: true });
      });
  }, [user?.id, cycle.phase, cycle.cycleDay, lifeStage]);

  // ── Screen 3: today snapshot, loaded once after mount. ─────────────
  useEffect(() => {
    if (!user?.id || ranSnapRef.current) return;
    ranSnapRef.current = true;
    const today = todayISO();
    const Ent = base44?.entities || {};
    (async () => {
      try {
        const [events, tasks] = await Promise.all([
          Ent.PlannerItems
            ? Ent.PlannerItems.filter({ user_id: user.id, date: today }).catch(() => [])
            : Promise.resolve([]),
          Ent.PersonalTasks
            ? Ent.PersonalTasks.filter({ user_id: user.id }, "-created_date", 80).catch(() => [])
            : Promise.resolve([]),
        ]);
        // Tasks: count open items (not completed). Defensive — schemas
        // sometimes use `completed` boolean OR `status` string.
        const openTasks = (tasks || []).filter((t) => {
          if (t?.completed === true) return false;
          if (typeof t?.status === "string" && /done|complete/i.test(t.status)) return false;
          return true;
        });
        setSnap({
          events: (events || []).length,
          tasks: openTasks.length,
          loaded: true,
        });
      } catch {
        setSnap({ events: 0, tasks: 0, loaded: true });
      }
    })();
  }, [user?.id]);

  function next() {
    if (screen < 2) setScreen((s) => s + 1);
    else finish();
  }

  function finish() {
    setClosing(true);
    setTimeout(() => onDismiss?.(), 280);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Morning Brief"
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: C.cream,
        display: "flex", flexDirection: "column",
        animation: closing
          ? "mb-fade-out 280ms ease-in forwards"
          : "mb-slide-up 360ms cubic-bezier(0.16,1,0.3,1)",
        paddingTop: "max(env(safe-area-inset-top), 18px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 18px)",
      }}
    >
      {/* Top right — Skip + × */}
      <div style={{
        display: "flex", justifyContent: "flex-end", alignItems: "center",
        gap: 10, padding: "4px 18px 0",
      }}>
        <button
          type="button"
          onClick={finish}
          aria-label="Skip morning brief"
          style={{
            background: "transparent", border: "none",
            color: C.muted, cursor: "pointer", padding: "6px 8px",
            fontSize: 12, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}
        >Skip</button>
        <button
          type="button"
          onClick={finish}
          aria-label="Close morning brief"
          style={{
            width: 32, height: 32, borderRadius: 9999,
            background: C.paperHi, border: `1px solid ${C.border}`,
            color: C.espresso, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        ><X size={14} /></button>
      </div>

      {/* Body — screens slide horizontally via translateX. */}
      <div style={{
        flex: 1, overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "16px 22px 8px",
      }}>
        <div style={{
          display: "flex",
          width: "300%",
          transform: `translateX(-${screen * (100 / 3)}%)`,
          transition: "transform 360ms cubic-bezier(0.22,1,0.36,1)",
        }}>
          {/* Screen 1 — Good Morning */}
          <section style={{ width: "33.3333%", padding: "0 4px" }}>
            <p style={{
              margin: 0, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.muted, }}>{dateLine}</p>
            <h1 style={{
              margin: "10px 0 6px",
              fontSize: "clamp(32px, 8vw, 44px)",
              fontWeight: 600, lineHeight: 1.05,
              color: C.espresso, letterSpacing: "-0.01em",
            }}>Good morning,<br />{displayName}.</h1>
            {(cycle.cycleDay || phaseLabel) && (
              <p style={{
                margin: "8px 0 0",
                fontSize: 14, color: C.sage, fontWeight: 700,
                letterSpacing: "0.04em",
              }}>
                {cycle.cycleDay ? `Day ${cycle.cycleDay}` : ""}
                {cycle.cycleDay && phaseLabel ? " · " : ""}
                {phaseLabel ? `${phaseLabel} phase` : ""}
              </p>
            )}
            <article style={{
              marginTop: 22,
              padding: "14px 16px",
              background: C.paperHi,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.gold}`,
              borderRadius: 14,
              display: "flex", gap: 12, alignItems: "flex-start",
              minHeight: 78,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9999,
                background: C.gold, flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }} aria-hidden>
                <Sparkles size={14} style={{ color: C.espresso }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: C.muted, }}>Jess</p>
                <p style={{
                  margin: "4px 0 0", fontSize: 15,
                  color: C.espresso, lineHeight: 1.5,
                }}>
                  {text || "Settling in…"}
                </p>
              </div>
            </article>
          </section>

          {/* Screen 2 — Today's Focus */}
          <section style={{ width: "33.3333%", padding: "0 4px" }}>
            <p style={{
              margin: 0, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.muted, }}>Today's focus · {phaseLabel}</p>
            <h2 style={{
              margin: "8px 0 18px",
              fontSize: "clamp(26px, 6.5vw, 34px)",
              fontWeight: 600, lineHeight: 1.1,
              color: C.espresso, letterSpacing: "-0.01em",
            }}>What might serve you today.</h2>
            <FocusCard
              icon={<Heart size={16} />}
              title="Body"
              tip={recs.movement?.[0] || "Move in whatever way feels good today."}
            />
            <FocusCard
              icon={<Brain size={16} />}
              title="Mind"
              tip={recs.mood?.[0] || "Be gentle with yourself."}
            />
            <FocusCard
              icon={<Apple size={16} />}
              title="Nourishment"
              tip={recs.nutrition?.[0] || "Eat in a way that steadies you."}
            />
          </section>

          {/* Screen 3 — Your Day */}
          <section style={{ width: "33.3333%", padding: "0 4px" }}>
            <p style={{
              margin: 0, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: C.muted, }}>Your day</p>
            <h2 style={{
              margin: "8px 0 18px",
              fontSize: "clamp(26px, 6.5vw, 34px)",
              fontWeight: 600, lineHeight: 1.1,
              color: C.espresso, letterSpacing: "-0.01em",
            }}>What's on your plate.</h2>

            {!snap.loaded && (
              <p style={{
                margin: 0, color: C.muted, fontSize: 14, fontStyle: "italic",
              }}>Loading…</p>
            )}

            {snap.loaded && (snap.events > 0 || snap.tasks > 0) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {snap.tasks > 0 && (
                  <SnapRow
                    icon={<ListChecks size={16} />}
                    label={`${snap.tasks} open task${snap.tasks === 1 ? "" : "s"} in My Lists`}
                  />
                )}
                {snap.events > 0 && (
                  <SnapRow
                    icon={<CalendarDays size={16} />}
                    label={`${snap.events} scheduled item${snap.events === 1 ? "" : "s"} for today`}
                  />
                )}
              </div>
            )}

            {snap.loaded && snap.events === 0 && snap.tasks === 0 && (
              <article style={{
                padding: "14px 16px",
                background: C.paperHi,
                border: `1px dashed ${C.border}`,
                borderRadius: 14,
              }}>
                <p style={{
                  margin: 0, color: C.espresso,
                  fontSize: 15, lineHeight: 1.5,
                }}>Nothing on your plate — a good day to rest or add something.</p>
              </article>
            )}
          </section>
        </div>
      </div>

      {/* Footer — progress dots + CTA */}
      <div style={{
        padding: "10px 22px 14px",
        display: "flex", flexDirection: "column", gap: 14,
        alignItems: "center",
      }}>
        <div role="tablist" aria-label="Progress" style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === screen}
              aria-label={`Screen ${i + 1} of 3`}
              onClick={() => setScreen(i)}
              style={{
                width: i === screen ? 22 : 8, height: 8,
                borderRadius: 9999, padding: 0, cursor: "pointer",
                border: "none",
                background: i === screen ? C.espresso : C.border,
                transition: "width 220ms ease, background 220ms ease",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          style={{
            width: "100%", maxWidth: 420,
            minHeight: 50, padding: "12px 18px", borderRadius: 14,
            background: C.gold, color: C.espresso, border: "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontSize: 15, fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(212,175,55,0.25)",
          }}
        >
          {screen === 0 && <>See what's in store <ChevronRight size={16} /></>}
          {screen === 1 && <>See your plan <ChevronRight size={16} /></>}
          {screen === 2 && <>Let's go <ChevronRight size={16} /></>}
        </button>
      </div>

      <style>{`
        @keyframes mb-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mb-fade-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}

function FocusCard({ icon, title, tip }) {
  return (
    <article style={{
      marginTop: 10, padding: "13px 14px",
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.sage}`,
      borderRadius: 14,
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9999,
        background: C.sage, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: C.cream,
      }} aria-hidden>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: C.muted, }}>{title}</p>
        <p style={{
          margin: "4px 0 0", fontSize: 14,
          color: C.espresso, lineHeight: 1.5,
        }}>{tip}</p>
      </div>
    </article>
  );
}

function SnapRow({ icon, label }) {
  return (
    <article style={{
      padding: "12px 14px",
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.gold}`,
      borderRadius: 14,
      display: "flex", gap: 12, alignItems: "center",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9999,
        background: C.gold, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: C.espresso,
      }} aria-hidden>{icon}</div>
      <p style={{
        margin: 0, flex: 1, minWidth: 0,
        fontSize: 14, color: C.espresso,
        fontWeight: 600,
      }}>{label}</p>
    </article>
  );
}
