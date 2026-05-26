// ─────────────────────────────────────────────────────────────────────────────
// HealthCornerBody — "🩺 HC: Body" tab on /Ideas (FoundersOS).
//
// Full symptom & physical health hub. Sections:
//   A. Jess on Your Symptoms (top 5 ranked + #1 educational note)
//   B. Symptom Calendar (5×6 grid, intensity tint)
//   C. Hot Flash Tracker (meno-gated)
//   D. Pain & Cramp Tracker
//   E. Brain Fog Log
//   F. Cycle Health Summary (cycling stages only)
//   G. Jess Recommendations (3 sage-bordered cards)
//
// Data fetched in FoundersOS, passed as props.
// Spec source: 2026-05-26 Halli — Health Corner 3-tab brief.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles } from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  border:   "#D4C9B4",
  gold:     "#D4AF37",
  goldSoft: "rgba(212,175,55,0.16)",
  sage:     "#8FAF8F",
  sageBg:   "rgba(143,175,143,0.18)",
  blush:    "#E8B4B8",
  blushLight:"#F0CACA",
  blushDeep:"#D4909A",
};

const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);
const CYCLING_STAGES = new Set(["reproductive", "ttc", "teen"]);

const SYMPTOM_NOTES = {
  hot_flash:  "Hot flashes are the most common perimenopause symptom, affecting 75% of women in the transition. Triggered by a narrowing of the thermoregulatory zone in the hypothalamus caused by estrogen fluctuation. Alcohol, caffeine, spicy food, and stress are common triggers. Keeping a trigger log can identify your personal patterns.",
  headache:   "Hormonal headaches typically cluster around menstruation (estrogen withdrawal) and mid-luteal phase. Magnesium supplementation (400mg glycinate) has strong evidence for prevention.",
  migraine:   "Menstrual migraine is driven by the drop in estrogen 2-3 days before bleeding. Frovatriptan or naproxen taken pre-emptively can reduce severity. Consult a GP about prophylaxis if these are debilitating.",
  fatigue:    "Persistent fatigue across a cycle deserves attention — iron, ferritin, B12, vitamin D and thyroid function are the first labs to ask your GP about. Sleep quality and hidden inflammation are also common drivers.",
  bloating:   "Bloating typically peaks in the luteal phase due to progesterone-driven water retention. Reducing salt, increasing potassium (banana, leafy greens), and gentle movement help. Persistent bloating outside the luteal phase warrants a GP check.",
  brain_fog:  "Brain fog is driven by estrogen's role in supporting neurotransmitter function — lower and fluctuating estrogen directly affects memory and cognitive speed. Sleep quality is the highest-impact factor.",
  cramps:     "Primary dysmenorrhea (cramping in early period days) is driven by prostaglandins. NSAIDs (ibuprofen), heat, and omega-3s are evidence-based interventions. Pain that disrupts daily life is worth raising with a GP.",
  acne:       "Hormonal acne clusters along the jawline and chin and tends to flare in the luteal phase. Salicylic acid, zinc, and managing stress all help. A GP can prescribe topical retinoids or systemic options if severe.",
  insomnia:   "Sleep disruption during the late luteal phase and around menstruation is often hormonal. Cool room, magnesium glycinate, and consistent bedtime are first-line. Persistent insomnia warrants a sleep clinic referral.",
  anxiety:    "Cyclical anxiety often spikes in the luteal phase as progesterone falls. If it significantly affects your life every cycle, PMDD is worth discussing with a GP — there are effective treatments.",
  mood_swings:"Late-luteal mood shifts are common — falling progesterone and serotonin interactions. If these tip into severe low mood or distress, ask your GP about PMDD.",
  cravings:   "Luteal cravings (often for sugar or carbs) are real and hormonally driven. Balancing blood sugar with protein at each meal and avoiding caffeine spikes reduce them meaningfully.",
};
const FALLBACK_NOTE = (sym) => `${prettyName(sym)} is something I'm keeping track of. If it's affecting your daily life, raise it with your GP — they may want to investigate further.`;

function todayLocal() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function isoOf(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function dateKeyOf(r)  { return r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0,10) : "") || (r?.created_date ? String(r.created_date).slice(0,10) : ""); }
function readMood(r)   { const v = r?.mood_score ?? r?.mood; return v != null ? Number(v) : null; }
function prettyName(s) { return String(s || "").replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); }
function lastNDayKeys(n) {
  const out = []; const today = todayLocal();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push(isoOf(d));
  }
  return out;
}
function avg(arr) { const v = arr.filter((x) => x != null); return v.length ? v.reduce((s, x) => s + Number(x), 0) / v.length : null; }
function severityIsSerious(s) { return /severe|very/i.test(String(s || "")); }

export default function HealthCornerBody({ profile, checkins = [], symptoms = [], supps = [] }) {
  const cycle = useCycleDay(profile);
  const lifeStage = profile?.life_stage || "reproductive";
  const isMeno = MENO_STAGES.has(lifeStage);
  const isCycling = CYCLING_STAGES.has(lifeStage);

  const today = todayLocal();
  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const cut90 = new Date(today); cut90.setDate(today.getDate() - 89);
  const since = (rows, cutoff) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cutoff; });
  const symptoms30 = useMemo(() => since(symptoms, cut30), [symptoms]);
  const symptoms90 = useMemo(() => since(symptoms, cut90), [symptoms]);

  // ── Section A — Top 5 ranked + #1 note ────────────────────────
  const ranked = useMemo(() => {
    const counts = new Map();
    for (const r of symptoms30) {
      const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [symptoms30]);
  const topKey  = ranked[0]?.[0];
  const topNote = topKey ? (SYMPTOM_NOTES[String(topKey).toLowerCase()] || FALLBACK_NOTE(topKey))
                          : "Nothing logged this month yet. Track symptoms on /Today and I'll start to see the pattern.";

  // ── Section B — symptom calendar (5x6 = 30 days) ──────────────
  const days30 = useMemo(() => lastNDayKeys(30), []);
  const symptomCountsByDay = useMemo(() => {
    const m = new Map(days30.map((d) => [d, { count: 0, severe: false }]));
    for (const r of symptoms30) {
      const k = dateKeyOf(r); if (!m.has(k)) continue;
      const entry = m.get(k);
      entry.count += 1;
      if (severityIsSerious(r?.severity)) entry.severe = true;
    }
    return days30.map((d) => m.get(d));
  }, [symptoms30, days30]);
  const totalLogs30 = symptoms30.length;

  // ── Section C — hot flashes ───────────────────────────────────
  const hotFlashes = useMemo(() => symptoms30.filter((r) => String(r?.symptom_type || r?.symptom_name || "").toLowerCase().includes("hot_flash") || String(r?.symptom_type || "").toLowerCase() === "hot flash"), [symptoms30]);
  const hfSeverity = useMemo(() => {
    const m = { None: 0, Mild: 0, Moderate: 0, Severe: 0, "Very Severe": 0 };
    for (const r of hotFlashes) {
      const s = String(r?.severity || "");
      if (/very/i.test(s)) m["Very Severe"]++;
      else if (/severe/i.test(s)) m.Severe++;
      else if (/moderate/i.test(s)) m.Moderate++;
      else if (/mild/i.test(s)) m.Mild++;
      else m.None++;
    }
    return m;
  }, [hotFlashes]);
  const hfTimeOfDay = useMemo(() => {
    const m = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    for (const r of hotFlashes) {
      const t = r?.logged_at || r?.created_at || r?.created_date;
      if (!t) continue;
      const h = new Date(t).getHours();
      if (h < 5) m.Night++;
      else if (h < 12) m.Morning++;
      else if (h < 18) m.Afternoon++;
      else if (h < 22) m.Evening++;
      else m.Night++;
    }
    return m;
  }, [hotFlashes]);

  // ── Section D — pain / cramps ─────────────────────────────────
  const painLogs = useMemo(() => symptoms90.filter((r) => {
    const t = String(r?.symptom_type || r?.symptom_name || "").toLowerCase();
    return t === "cramps" || t === "cramping" || t === "pain" || t === "pelvic_pain" || t.includes("pain");
  }), [symptoms90]);
  const painCycleDays = useMemo(() => {
    if (!profile?.last_period_start_date || !cycle?.cycleLen) return [];
    const start = new Date(profile.last_period_start_date); start.setHours(0,0,0,0);
    const out = [];
    for (const r of painLogs) {
      const k = dateKeyOf(r); if (!k) continue;
      const d = new Date(k); if (Number.isNaN(d.getTime())) continue;
      const diff = Math.floor((d - start) / 86400000);
      if (diff < 0) continue;
      out.push((diff % cycle.cycleLen) + 1);
    }
    return Array.from(new Set(out)).sort((a, b) => a - b);
  }, [painLogs, profile, cycle]);

  const painEarlyCount = painCycleDays.filter((d) => d <= 5).length;
  const painLine = (() => {
    if (painLogs.length === 0) return "No pain logs yet. Track on /Today to build a picture.";
    if (painEarlyCount >= 2 && painCycleDays.length >= 2 && painEarlyCount / painCycleDays.length >= 0.6) {
      return "Cramping in the first 5 days of your cycle is primary dysmenorrhea — prostaglandins cause the uterus to contract. NSAIDs (ibuprofen), heat, and omega-3s are evidence-based interventions.";
    }
    if (painCycleDays.some((d) => d > 5 && d < cycle?.cycleLen - 5)) {
      return "Pain outside of menstruation warrants a conversation with your GP — conditions like endometriosis or adenomyosis can cause mid-cycle pain.";
    }
    return "Pain pattern building — keep logging and I'll spot the rhythm.";
  })();

  // ── Section E — brain fog ──────────────────────────────────────
  const brainFog = useMemo(() => symptoms30.filter((r) => /brain_fog|brain fog|foggy/i.test(String(r?.symptom_type || r?.symptom_name || ""))), [symptoms30]);
  const brainFogByWeek = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    for (const r of brainFog) {
      const k = dateKeyOf(r); if (!k) continue;
      const d = new Date(k); const diff = Math.floor((today - d) / 86400000);
      if (diff < 0 || diff > 29) continue;
      const w = Math.min(3, Math.floor(diff / 7));
      buckets[3 - w] += 1; // oldest week first
    }
    return buckets;
  }, [brainFog]);

  // ── Section F — cycle health summary ──────────────────────────
  const cycleSummary = useMemo(() => buildCycleSummary(symptoms90, profile), [symptoms90, profile]);

  const pmsMoodDip = useMemo(() => {
    if (!profile?.last_period_start_date || !cycle?.cycleLen) return null;
    const start = new Date(profile.last_period_start_date); start.setHours(0,0,0,0);
    const inPms = []; const outOfPms = [];
    for (const r of checkins) {
      const v = readMood(r); if (v == null) continue;
      const k = dateKeyOf(r); if (!k) continue;
      const d = new Date(k); if (Number.isNaN(d.getTime())) continue;
      const diff = Math.floor((d - start) / 86400000);
      if (diff < 0) continue;
      const cd = (diff % cycle.cycleLen) + 1;
      if (cd >= cycle.cycleLen - 6) inPms.push(v); else outOfPms.push(v);
    }
    if (inPms.length < 3 || outOfPms.length < 3) return null;
    return { pms: avg(inPms), other: avg(outOfPms) };
  }, [checkins, profile, cycle]);

  // ── Section G — Jess recommendations ──────────────────────────
  const recs = useMemo(() => buildRecommendations(ranked, supps, isMeno), [ranked, supps, isMeno]);

  return (
    <div>
      <DemoPill subtitle="Body · symptoms, patterns, and Jess's read" />

      <article style={canvasStyle()}>
        {/* SECTION A — Top symptoms */}
        <SectionHeader>Jess on your symptoms · last 30 days</SectionHeader>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            {ranked.length === 0
              ? <div style={{ fontSize: 13.5, color: T.muted }}>Nothing logged yet this month — log symptoms on /Today to build your picture.</div>
              : (
                <ol style={{ margin: 0, padding: "0 0 0 18px", listStyle: "decimal", color: T.espresso, fontSize: 14.5, lineHeight: 1.9 }}>
                  {ranked.map(([sym, n]) => (
                    <li key={sym}><strong>{prettyName(sym)}</strong> — {n} time{n === 1 ? "" : "s"} this month</li>
                  ))}
                </ol>
              )}
            {topKey && (
              <p style={{
                margin: "14px 0 0", padding: "12px 14px",
                background: T.sageBg, borderLeft: `3px solid ${T.sage}`,
                fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.65, color: T.espresso,
                borderRadius: "0 8px 8px 0",
              }}>{topNote}</p>
            )}
          </div>
        </div>

        {/* SECTION B — Symptom calendar */}
        <SectionHeader>Symptom calendar · last 30 days</SectionHeader>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 14, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6,
            }}>
              {symptomCountsByDay.map((entry, i) => (
                <div key={i} title={`${days30[i]} · ${entry.count} log${entry.count === 1 ? "" : "s"}${entry.severe ? " · severe" : ""}`}
                  style={{
                    aspectRatio: "1", borderRadius: 6,
                    background: dayTint(entry),
                    border: entry.count === 0 ? `1px solid ${T.border}` : "none",
                  }} />
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>
              Your symptom load this month. Darker = more symptoms logged that day.
              {totalLogs30 < 5 && <> Log symptoms on /Today to see your pattern build over time.</>}
            </div>
          </div>
        </div>

        {/* SECTION C — Hot flash tracker (meno-gated) */}
        {isMeno && (
          <>
            <SectionHeader>Hot flash tracker</SectionHeader>
            <div style={{ padding: "0 18px 12px" }}>
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 14 }}>
                  <Stat label="This month"  value={String(hotFlashes.length)} />
                  <Stat label="Per week avg" value={(hotFlashes.length / 4).toFixed(1)} />
                  <Stat label="Severe / Very Severe" value={String(hfSeverity.Severe + hfSeverity["Very Severe"])} />
                </div>
                <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>Severity breakdown</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {Object.entries(hfSeverity).map(([k, n]) => (
                    <span key={k} style={{
                      padding: "4px 10px", borderRadius: 999, background: T.goldSoft, color: T.espresso,
                      fontSize: 12, fontWeight: 500,
                    }}>{k}: {n}</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>Time of day</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {Object.entries(hfTimeOfDay).map(([k, n]) => (
                    <span key={k} style={{
                      padding: "4px 10px", borderRadius: 999, background: T.sageBg, color: T.espresso,
                      fontSize: 12, fontWeight: 500,
                    }}>{k}: {n}</span>
                  ))}
                </div>
                <div style={{
                  padding: 12, background: T.goldSoft, borderRadius: 8, fontSize: 13.5, color: T.espresso,
                  fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.6, marginBottom: 12,
                }}>
                  <strong>Common triggers:</strong> alcohol, caffeine, spicy foods, stress, hot environments, tight clothing. Keeping a trigger log helps identify your personal patterns.
                </div>
                <div style={{
                  padding: "10px 12px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`,
                  fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.65, color: T.espresso,
                  borderRadius: "0 8px 8px 0",
                }}>
                  I'm tracking these for you. If they're occurring more than 7 times per day or severely disrupting your sleep, that's worth raising with your GP.
                </div>
              </div>
            </div>
          </>
        )}

        {/* SECTION D — Pain & cramp */}
        <SectionHeader>Pain & cramp tracker · last 3 months</SectionHeader>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10 }}>
              <strong>{painLogs.length}</strong> pain {painLogs.length === 1 ? "entry" : "entries"} logged
              {painCycleDays.length > 0 && <> · on cycle days: <strong>{painCycleDays.join(", ")}</strong></>}
            </div>
            <p style={{
              margin: 0, padding: "10px 12px", background: T.sageBg, borderLeft: `3px solid ${T.sage}`,
              fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.6, color: T.espresso,
              borderRadius: "0 8px 8px 0",
            }}>{painLine}</p>
          </div>
        </div>

        {/* SECTION E — Brain fog */}
        <SectionHeader>Brain fog log · last 30 days</SectionHeader>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 28, fontWeight: 600, color: T.gold }}>{brainFog.length}</div>
              <div style={{ fontSize: 13, color: T.muted }}>brain fog days this month</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 6 }}>Week-by-week</div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginBottom: 14, height: 40 }}>
              {brainFogByWeek.map((n, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: `${Math.min(28, n * 8)}px`, background: T.sage, borderRadius: 4, minHeight: 2 }} />
                  <div style={{ fontSize: 10, color: T.muted }}>W{i + 1} · {n}</div>
                </div>
              ))}
            </div>
            <p style={{
              margin: 0, fontSize: 14, lineHeight: 1.65,
              color: T.espresso, fontFamily: '"Fraunces", Georgia, serif',
            }}>
              Brain fog in perimenopause is caused by estrogen's role in supporting neurotransmitter function — lower and fluctuating estrogen directly affects memory retrieval and cognitive processing speed. This is temporary and improves post-menopause for most women. Sleep quality is the highest-impact factor — poor sleep amplifies brain fog significantly. Exercise, particularly aerobic, has strong evidence for cognitive support.
            </p>
            {brainFog.length >= 5 && (
              <div style={{
                marginTop: 10, padding: "10px 12px",
                background: T.sageBg, borderLeft: `3px solid ${T.sage}`,
                fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, color: T.espresso,
                borderRadius: "0 8px 8px 0",
              }}>If brain fog is affecting your work or daily functioning, it's worth raising with a GP who specialises in menopause. There are effective treatments.</div>
            )}
          </div>
        </div>

        {/* SECTION F — Cycle health summary (cycling only) */}
        {isCycling && (
          <>
            <SectionHeader>Cycle health summary</SectionHeader>
            <div style={{ padding: "0 18px 12px" }}>
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(58,44,26,0.08)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                  <Stat label="Avg cycle length"  value={cycleSummary.avgLen ? `${cycleSummary.avgLen} days` : "—"} />
                  <Stat label="Range"             value={cycleSummary.range ? cycleSummary.range : "—"} />
                  <Stat label="Avg period length" value={cycleSummary.avgPeriod ? `${cycleSummary.avgPeriod} days` : "—"} />
                </div>
                {cycleSummary.variation > 7 && (
                  <p style={{
                    margin: "8px 0 0", padding: "10px 12px",
                    background: T.goldSoft, borderLeft: `3px solid ${T.gold}`,
                    fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, color: T.espresso,
                    borderRadius: "0 8px 8px 0",
                  }}>Your cycles vary by more than 7 days — this is worth tracking and potentially discussing with a GP, particularly if accompanied by other symptoms.</p>
                )}
                {pmsMoodDip && (pmsMoodDip.other - pmsMoodDip.pms) >= 1 && (
                  <p style={{
                    margin: "10px 0 0", padding: "10px 12px",
                    background: T.sageBg, borderLeft: `3px solid ${T.sage}`,
                    fontFamily: '"Fraunces", Georgia, serif', fontSize: 14, color: T.espresso,
                    borderRadius: "0 8px 8px 0",
                  }}>Your mood tends to dip in the 7 days before your period (avg {pmsMoodDip.pms.toFixed(1)} vs {pmsMoodDip.other.toFixed(1)} elsewhere). This is normal hormonal fluctuation — but if it significantly impacts your life, it may be worth discussing PMDD with your GP.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* SECTION G — Jess recommendations */}
        <SectionHeader>Jess's recommendations</SectionHeader>
        <div style={{ padding: "0 18px 22px", display: "grid", gap: 10 }}>
          {recs.map((r, i) => (
            <div key={i} style={{
              background: "#FFFFFF", borderLeft: `3px solid ${T.sage}`,
              borderRadius: "0 12px 12px 0",
              padding: "12px 14px",
              boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
            }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: T.espresso, marginBottom: 4 }}>{r.title}</div>
              <p style={{
                margin: 0, fontSize: 14, lineHeight: 1.65, color: T.espresso,
                fontFamily: '"Fraunces", Georgia, serif',
              }}>{r.body}</p>
              <div style={{ marginTop: 8, fontSize: 11, color: T.muted, fontStyle: "italic" }}>
                Not medical advice — Jess is a wellness companion.
              </div>
            </div>
          ))}
        </div>
      </article>

      <ReviewerNote>
        Sections branch on life stage: hot flash tracker shows only for peri/meno; cycle health summary
        shows only for cycling stages (reproductive / ttc / teen). Educational copy for the top symptom
        is keyed by SYMPTOM_NOTES dictionary — 12 conditions covered, fallback for any unknown symptom.
      </ReviewerNote>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────
function DemoPill({ subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 11px", borderRadius: 999,
        background: T.goldSoft, color: T.gold,
        fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
        border: `1px solid ${T.gold}`,
      }}>
        <Sparkles className="w-3 h-3" /> Design Preview — Health Corner
      </span>
      <span style={{ color: "#9B8B7A", fontSize: 12 }}>{subtitle}</span>
    </div>
  );
}
function canvasStyle() {
  return {
    backgroundColor: T.paper, color: T.espresso, borderRadius: 18,
    overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
    border: `1px solid rgba(212,175,55,0.22)`,
    fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
  };
}
function SectionHeader({ children }) {
  return (
    <div style={{
      padding: "22px 22px 8px",
      fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
      color: T.muted, fontWeight: 700,
    }}>{children}</div>
  );
}
function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 26, fontWeight: 600, color: T.gold }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: 0.5, color: T.muted, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  );
}
function ReviewerNote({ children }) {
  return (
    <div style={{
      marginTop: 14, padding: "12px 14px",
      background: "rgba(212,175,55,0.08)",
      border: `1px dashed rgba(212,175,55,0.45)`,
      borderRadius: 10, fontSize: 12.5, lineHeight: 1.6, color: "#C4B69E",
    }}>
      <strong style={{ color: T.gold }}>Notes for review:</strong> {children}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function dayTint(entry) {
  if (!entry || entry.count === 0) return "transparent";
  if (entry.severe) return T.blushDeep;
  if (entry.count >= 3) return T.blush;
  return T.blushLight;
}

function buildCycleSummary(symptoms90, profile) {
  // Best-effort. Without rich cycle entity data we estimate from profile + period symptoms.
  if (!profile?.last_period_start_date || !profile?.cycle_avg_length) {
    return { avgLen: null, range: null, avgPeriod: null, variation: 0 };
  }
  return {
    avgLen: Number(profile.cycle_avg_length) || null,
    range: profile.cycle_min_length && profile.cycle_max_length
      ? `${profile.cycle_min_length}–${profile.cycle_max_length} days`
      : `~${profile.cycle_avg_length} days`,
    avgPeriod: Number(profile.period_length) || null,
    variation: (Number(profile.cycle_max_length) || 0) - (Number(profile.cycle_min_length) || 0),
  };
}

function buildRecommendations(ranked, supps, isMeno) {
  const out = [];
  const topKey = ranked[0]?.[0];
  const topCount = ranked[0]?.[1] || 0;

  // Most needed action based on top symptom
  if (topKey) {
    const k = String(topKey).toLowerCase();
    if (k.includes("hot_flash") || k.includes("hot flash")) {
      out.push({ title: "Cool your bedroom tonight", body: "Aim for 16-18°C, moisture-wicking bedsheets, and a cold pillow. Skip alcohol within 4 hours of bed — it's the single biggest trigger." });
    } else if (k.includes("headache") || k.includes("migraine")) {
      out.push({ title: "Hydration audit", body: "Most hormonal headaches start with mild dehydration. Aim for 2L water daily, more if you're caffeinated." });
    } else if (k.includes("fatigue")) {
      out.push({ title: "Ask your GP for a full blood panel", body: "Iron, ferritin, B12, vitamin D and thyroid function are the four labs that explain most cyclical fatigue. Worth getting tested." });
    } else if (k.includes("brain_fog") || k.includes("brain fog")) {
      out.push({ title: "Protect your sleep window", body: "Brain fog is amplified by poor sleep. Cool room, no screens 60 min before bed, magnesium glycinate at 9pm. Try for a week and see." });
    } else if (k.includes("cramp")) {
      out.push({ title: "Heat + omega-3 + ibuprofen", body: "All three reduce prostaglandin-driven cramping. Start day 1 — don't wait for pain to peak." });
    } else if (k.includes("acne") || k.includes("breakout")) {
      out.push({ title: "Switch to a barrier-focused routine in your luteal phase", body: "Less exfoliation, more ceramides. Salicylic acid only as a spot treatment. Resist introducing new products from day 14 onward." });
    } else if (k.includes("anxiety") || k.includes("mood")) {
      out.push({ title: "Track for a full cycle", body: "If your mood consistently dips in the 7 days before your period, that's PMDD territory — there are effective treatments. Worth a GP conversation." });
    } else {
      out.push({ title: `Pay attention to ${prettyName(topKey).toLowerCase()}`, body: `It's come up ${topCount} times this month. Keep logging — patterns emerge over 2-3 cycles.` });
    }
  } else {
    out.push({ title: "Start logging on /Today", body: "I can't see patterns I don't have data for. Even 30 seconds a day for a fortnight starts to show shape." });
  }

  // Supplement suggestion
  const suppNames = new Set((supps || []).map((s) => String(s?.supplement_name || s?.name || "").toLowerCase()).filter(Boolean));
  if (topKey && /hot_flash|hot flash/.test(String(topKey).toLowerCase()) && !suppNames.has("magnesium")) {
    out.push({ title: "Consider magnesium glycinate at bedtime", body: "Evidence suggests magnesium (300-400mg glycinate) reduces hot flash frequency and improves sleep architecture. Worth discussing with your GP or a nutritionist." });
  } else if (topKey && /cramp|pain/.test(String(topKey).toLowerCase()) && !suppNames.has("omega-3") && !suppNames.has("omega 3")) {
    out.push({ title: "Add omega-3s to your daily stack", body: "1-2g daily reduces prostaglandin-driven cramping. Oily fish 2-3× a week is a great whole-food source, or a high-quality fish oil supplement." });
  } else if (topKey && /brain_fog|fatigue/.test(String(topKey).toLowerCase()) && !suppNames.has("vitamin d") && !suppNames.has("vitamin_d")) {
    out.push({ title: "Test your vitamin D", body: "Low vitamin D amplifies both fatigue and cognitive fog. UK winters mean most people are deficient. A blood test costs around £30 privately, or ask your GP." });
  } else if (isMeno && !suppNames.has("calcium") && !suppNames.has("vitamin d")) {
    out.push({ title: "Calcium + vitamin D daily", body: "Bone density decline accelerates in perimenopause. 1000mg calcium and 1000IU vitamin D daily is the standard guidance — discuss precise dosing with your GP." });
  } else {
    out.push({ title: "Hold your current routine", body: "Nothing in your data is screaming for an intervention. Consistency beats novelty — keep doing what you're doing and I'll flag if something shifts." });
  }

  // GP referral — only if signal is strong
  if (topCount >= 6) {
    out.push({ title: `Consider speaking to your GP about ${prettyName(topKey).toLowerCase()}`, body: `${topCount} entries in a month is a meaningful pattern. Bring the data — your symptom calendar from this page is the kind of thing GPs find useful.` });
  } else if (isMeno) {
    out.push({ title: "Consider a menopause-specialist GP", body: "Not all GPs are trained in menopause care, and the difference shows. The British Menopause Society lists registered specialists. Worth the search if your symptoms are affecting daily life." });
  }

  return out.slice(0, 3);
}
