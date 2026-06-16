// DoctorExport — the single canonical "doctor's export" surface, rebuilt as a
// 3-step builder: Select -> Organise -> Generate.
//
//   Select    — timeframe (6 weeks default · 90 days · custom), focus chips,
//               and per-section / per-symptom toggles to choose what goes in.
//   Organise  — a Jess-drafted "what I want to discuss" brief + prioritised,
//               reorderable questions at the top; symptoms grouped by the Greene
//               climacteric domains as a lens; reflections are OPT-IN (off by
//               default).
//   Generate  — a real, selectable-text A4 PDF built ON-DEVICE with pdfmake
//               (nothing uploaded), plus window.print() and copy-as-text
//               fallbacks, behind an explicit point-of-export consent line.
//
// Deep-linkable via ?preset=diary|full|journal (the Planner card and the Health
// GP hand-off point here). No new base44 entity — data is the existing entities;
// a saved builder config persists to localStorage (v1).
//
// Editorial craft, UK clinical tone, Lucide only, no emoji. This is a
// conversation-starter built from self-reported tracking, never a clinical record.

import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, ArrowRight, Check, Copy, Download, Printer, Loader2, Sparkles,
  ShieldCheck, ChevronUp, ChevronDown, Pin, Plus, X,
} from "lucide-react";
import {
  PAPER_BG, InkFilter, EditorialFooter, useEditorialFonts,
  T, UI, SERIF, Script, Hand, Eyebrow,
} from "../components/journal/Editorial";
import { callJessAgent } from "@/services/jessAgentService";
import { nutritionDoctorSummary } from "@/utils/nutritionSummary";

// ── timeframe ────────────────────────────────────────────────────────────────
const TIMEFRAMES = [
  { id: "6w",  label: "6 weeks",  days: 42, note: "NICE NG23 default" },
  { id: "90d", label: "90 days",  days: 90, note: "A fuller quarter" },
  { id: "custom", label: "Custom", days: null, note: "Pick your own window" },
];

// ── focus chips — quick presets that flip sensible section defaults ──────────
const FOCUS = [
  { id: "menopause", label: "Menopause / peri", sections: ["overview", "symptoms", "mood", "sleep", "meds"] },
  { id: "cycle",     label: "Cycle & periods",  sections: ["overview", "cycle", "symptoms"] },
  { id: "mood",      label: "Mood & energy",    sections: ["overview", "mood"] },
  { id: "sleep",     label: "Sleep",            sections: ["overview", "sleep", "mood"] },
  { id: "pain",      label: "Pain & symptoms",  sections: ["overview", "symptoms", "patterns"] },
  { id: "meds",      label: "Medication review",sections: ["overview", "meds", "symptoms"] },
];

// ── report sections the builder can include ──────────────────────────────────
const SECTIONS = [
  { id: "overview", label: "Overview", note: "Cycle, life stage, conditions" },
  { id: "symptoms", label: "Symptoms", note: "Grouped by Greene domain" },
  { id: "mood",     label: "Mood & energy", note: "Monthly averages" },
  { id: "sleep",    label: "Sleep", note: "Hours & quality" },
  { id: "cycle",    label: "Cycle & bleeding", note: "Pattern & dates" },
  { id: "meds",     label: "Medications", note: "Logged & reminders" },
  { id: "exercise", label: "Movement", note: "Frequency & type" },
  { id: "nutrition", label: "Nutrition", note: "Energy, macros & key micros" },
  { id: "patterns", label: "Patterns", note: "Noticed correlations" },
  { id: "journal",  label: "Journal reflections", note: "OPT-IN — your words", optIn: true },
];

// ── the Greene climacteric domains — the clinical lens for symptoms ──────────
// Maps the app's tracked check-in fields onto the four Greene Climacteric Scale
// domains so a GP sees a recognisable structure (vasomotor / somatic /
// psychological / sexual).
const GREENE = [
  { id: "vasomotor",     label: "Vasomotor",     note: "Hot flushes, night sweats" },
  { id: "somatic",       label: "Somatic",       note: "Aches, headaches, bloating, tenderness" },
  { id: "psychological", label: "Psychological", note: "Mood, anxiety, sleep, focus" },
  { id: "sexual",        label: "Sexual",        note: "Libido, if tracked" },
];

// field = check-in field; thresh = "high" (sev>=3) or "low" (rating<=2, inverted)
// or "sleep" (hours<6). label is GP-facing.
const SYMPTOM_DEFS = [
  { key: "hot_flashes",       field: "hot_flashes",       label: "Hot flushes",       domain: "vasomotor",     mode: "high" },
  { key: "night_sweats",      field: "night_sweats",      label: "Night sweats",      domain: "vasomotor",     mode: "high" },
  { key: "headache",          field: "headache",          label: "Headaches",         domain: "somatic",       mode: "high" },
  { key: "cramps",            field: "cramps",            label: "Cramps",            domain: "somatic",       mode: "high" },
  { key: "bloating",          field: "bloating",          label: "Bloating",          domain: "somatic",       mode: "high" },
  { key: "breast_tenderness", field: "breast_tenderness", label: "Breast tenderness", domain: "somatic",       mode: "high" },
  { key: "pain",              field: "pain",              label: "General pain",      domain: "somatic",       mode: "high" },
  { key: "low_mood",          field: "mood",              label: "Low mood",          domain: "psychological", mode: "low" },
  { key: "stress",            field: "stress",            label: "Stress / anxiety",  domain: "psychological", mode: "high" },
  { key: "low_energy",        field: "energy",            label: "Low energy",        domain: "psychological", mode: "low" },
  { key: "poor_sleep",        field: "sleep_hours",       label: "Disturbed sleep",   domain: "psychological", mode: "sleep" },
];

// ── helpers ──────────────────────────────────────────────────────────────────
function avg(arr) {
  const v = arr.filter((x) => x != null && !Number.isNaN(Number(x)));
  if (!v.length) return null;
  return Math.round((v.reduce((s, x) => s + Number(x), 0) / v.length) * 10) / 10;
}
const ukDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const monthLabel = (m) => new Date(m + "-01T12:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const uid = (() => { let i = 0; return () => `q${++i}`; })();

const PRESETS = {
  diary:   { timeframe: "6w",  focus: ["menopause", "cycle"], sections: ["overview", "symptoms", "mood", "sleep", "cycle", "meds"] },
  full:    { timeframe: "6w",  focus: [], sections: ["overview", "symptoms", "mood", "sleep", "cycle", "meds", "exercise", "nutrition", "patterns"] },
  journal: { timeframe: "90d", focus: ["mood"], sections: ["overview", "mood", "patterns"] },
};

const LS_KEY = "femwell_doctor_export_cfg_v1";

export default function DoctorExport() {
  useEditorialFonts();
  const preset = useMemo(() => new URLSearchParams(window.location.search).get("preset") || "full", []);
  const presetCfg = PRESETS[preset] || PRESETS.full;

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [medications, setMedications] = useState([]);
  const [medReminders, setMedReminders] = useState([]);
  const [journals, setJournals] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [nutrition, setNutrition] = useState({ hasData: false });
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState("select");

  // ── builder config (seeded by preset / localStorage) ──
  const saved = useMemo(() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; } }, []);
  const [timeframe, setTimeframe] = useState(saved?.timeframe || presetCfg.timeframe);
  const [customFrom, setCustomFrom] = useState(saved?.customFrom || "");
  const [customTo, setCustomTo] = useState(saved?.customTo || "");
  const [focus, setFocus] = useState(() => new Set(saved?.focus || presetCfg.focus));
  const [sections, setSections] = useState(() => {
    const base = {};
    SECTIONS.forEach((s) => { base[s.id] = saved?.sections ? saved.sections.includes(s.id) : presetCfg.sections.includes(s.id); });
    return base;
  });
  const [includeReflections, setIncludeReflections] = useState(false); // opt-in, always off at start
  const [symptomSel, setSymptomSel] = useState({});                     // filled once data loads
  const [brief, setBrief] = useState("");
  const [questions, setQuestions] = useState([]);
  const [jessLoading, setJessLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState("");

  // window bounds
  const windowDays = TIMEFRAMES.find((t) => t.id === timeframe)?.days || 42;
  const cutoffStr = useMemo(() => {
    if (timeframe === "custom" && customFrom) return customFrom;
    const c = new Date(); c.setDate(c.getDate() - windowDays);
    return c.toISOString().split("T")[0];
  }, [timeframe, customFrom, windowDays]);
  const toStr = useMemo(() => (timeframe === "custom" && customTo) ? customTo : new Date().toISOString().split("T")[0], [timeframe, customTo]);

  // ── load real data ──
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, allCheckins, allSymptoms, meds, medRems, journalEntries, corrs] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: u.id }).catch(() => []),
          base44.entities.MedicationLogs.filter({ user_id: u.id }).catch(() => []),
          base44.entities.MedicationReminders.filter({ user_id: u.id }).catch(() => []),
          base44.entities.JournalEntries.filter({ user_id: u.id }).catch(() => []),
          base44.entities.Correlations.filter({ user_id: u.id }).catch(() => []),
        ]);
        setProfile(profiles[0] || null);
        setCheckins(Array.isArray(allCheckins) ? allCheckins : []);
        setSymptomLogs(Array.isArray(allSymptoms) ? allSymptoms : []);
        setMedications(Array.isArray(meds) ? meds : []);
        setMedReminders(Array.isArray(medRems) ? medRems : []);
        setJournals(Array.isArray(journalEntries) ? journalEntries : []);
        setCorrelations(Array.isArray(corrs) ? corrs : []);
      } catch (err) {
        console.error("DoctorExport init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── nutrition rollup (fail-open, re-runs when the window changes) ──
  // Reads the last `nutritionDays` of real MealLog + HydrationLog through the floor-aware
  // spine. Guarded inside nutritionDoctorSummary; this effect never blocks the page.
  const nutritionDays = useMemo(() => {
    if (timeframe === "custom" && customFrom) {
      const ms = new Date(toStr).getTime() - new Date(customFrom).getTime();
      return Math.max(7, Math.round(ms / 86400000) + 1);
    }
    return windowDays;
  }, [timeframe, customFrom, toStr, windowDays]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    nutritionDoctorSummary(user.id, profile, nutritionDays)
      .then((s) => { if (!cancelled) setNutrition(s || { hasData: false }); })
      .catch(() => { if (!cancelled) setNutrition({ hasData: false }); });
    return () => { cancelled = true; };
  }, [user?.id, profile, nutritionDays]);

  // Seed prioritised questions from the Health GP hand-off (sessionStorage) once.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("gp_draft_questions");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          setQuestions((q) => q.length ? q : arr.filter(Boolean).map((t) => ({ id: uid(), text: String(t), pinned: false })));
        }
      }
    } catch { /* ignore */ }
  }, []);

  // ── windowed data + derivations ──
  const inWindow = useCallback((dateLike) => {
    const d = (dateLike || "").slice(0, 10);
    return d && d >= cutoffStr && d <= toStr;
  }, [cutoffStr, toStr]);

  const wCheckins = useMemo(() => checkins.filter((c) => inWindow(c.date)).sort((a, b) => (a.date || "").localeCompare(b.date || "")), [checkins, inWindow]);
  const wJournals = useMemo(() => journals.filter((j) => inWindow(j.session_date || j.created_date || j.created_at)), [journals, inWindow]);

  // symptom rollup grouped by Greene domain (only symptoms with data appear)
  const symptomRollup = useMemo(() => {
    const out = [];
    for (const def of SYMPTOM_DEFS) {
      const vals = wCheckins.map((c) => c[def.field]).filter((v) => v != null && v !== "");
      if (!vals.length) continue;
      let days = 0; let metric = null;
      if (def.mode === "high") { days = vals.filter((v) => Number(v) >= 3).length; metric = avg(vals); }
      else if (def.mode === "low") { days = vals.filter((v) => Number(v) <= 2).length; metric = avg(vals); }
      else if (def.mode === "sleep") { days = vals.filter((v) => Number(v) < 6).length; metric = avg(vals); }
      if (days <= 0) continue;
      out.push({ ...def, days, metric });
    }
    return out;
  }, [wCheckins]);

  // default symptom selection on first data load (all available -> on)
  useEffect(() => {
    if (!symptomRollup.length) return;
    setSymptomSel((prev) => {
      if (Object.keys(prev).length) return prev;
      const next = {}; symptomRollup.forEach((s) => { next[s.key] = true; });
      return next;
    });
  }, [symptomRollup]);

  const monthly = useMemo(() => {
    const m = {};
    for (const c of wCheckins) {
      const k = (c.date || "").slice(0, 7); if (!k) continue;
      (m[k] ||= { mood: [], energy: [], sleep: [], stress: [] });
      if (c.mood) m[k].mood.push(c.mood);
      if (c.energy) m[k].energy.push(c.energy);
      if (c.sleep_hours) m[k].sleep.push(c.sleep_hours);
      if (c.stress) m[k].stress.push(c.stress);
    }
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => ({
      month, mood: avg(d.mood), energy: avg(d.energy), sleep: avg(d.sleep), stress: avg(d.stress),
    }));
  }, [wCheckins]);

  const exercise = useMemo(() => {
    const days = wCheckins.filter((c) => c.exercise_done || (c.exercise_minutes || 0) > 0);
    const types = {};
    days.forEach((c) => { if (c.exercise_type) types[c.exercise_type] = (types[c.exercise_type] || 0) + 1; });
    const weeks = Math.max(1, windowDays / 7);
    return {
      total: days.length,
      perWeek: (days.length / weeks).toFixed(1),
      top: Object.entries(types).sort(([, a], [, b]) => b - a).slice(0, 3).map(([t]) => t),
    };
  }, [wCheckins, windowDays]);

  const uniqueMeds = useMemo(() => [...new Set(medications.filter((m) => inWindow(m.date)).map((m) => m.item_name || m.medication_name).filter(Boolean))], [medications, inWindow]);

  // ── persist config ──
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        timeframe, customFrom, customTo, focus: [...focus],
        sections: SECTIONS.filter((s) => sections[s.id]).map((s) => s.id),
      }));
    } catch { /* ignore */ }
  }, [timeframe, customFrom, customTo, focus, sections]);

  // ── focus chip toggles sensible section defaults ──
  const toggleFocus = (f) => {
    setFocus((prev) => {
      const next = new Set(prev);
      if (next.has(f.id)) next.delete(f.id); else next.add(f.id);
      return next;
    });
    setSections((prev) => {
      const next = { ...prev };
      const turningOn = !focus.has(f.id);
      if (turningOn) f.sections.forEach((s) => { next[s] = true; });
      return next;
    });
  };
  const toggleSection = (id) => setSections((p) => ({ ...p, [id]: !p[id] }));
  const toggleSymptom = (key) => setSymptomSel((p) => ({ ...p, [key]: !p[key] }));

  // ── assemble the canonical report object (used by PDF / print / text) ──
  const report = useMemo(() => {
    const selectedSymptoms = symptomRollup.filter((s) => symptomSel[s.key] !== false);
    const byDomain = GREENE.map((g) => ({
      ...g, items: selectedSymptoms.filter((s) => s.domain === g.id),
    })).filter((g) => g.items.length);
    return {
      patient: user?.full_name || user?.email || "—",
      generatedAt: new Date(),
      windowFrom: cutoffStr, windowTo: toStr,
      windowLabel: timeframe === "custom" ? `${cutoffStr} to ${toStr}` : (TIMEFRAMES.find((t) => t.id === timeframe)?.label || "6 weeks"),
      preset,
      brief: brief.trim(),
      questions: [...questions].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)),
      sections,
      includeReflections,
      overview: {
        cycle: profile?.cycle_avg_length ? `${profile.cycle_avg_length} days` : "Not set",
        period: profile?.period_length ? `${profile.period_length} days` : "Not set",
        lastPeriod: profile?.last_period_start_date || "Not set",
        lifeStage: profile?.life_stage || "Standard",
        conditions: (profile?.condition_flags || []).join(", ") || "None listed",
      },
      symptomsByDomain: byDomain,
      monthly, exercise, nutrition, meds: uniqueMeds,
      reminders: medReminders.map((m) => `${m.medication_name || m.name || ""}${m.reminder_time ? ` — ${m.reminder_time}` : ""}`).filter((s) => s.trim()),
      patterns: correlations.slice(0, 5).map((c) => c.explanation_text || `${c.metric_a} relates to ${c.metric_b}`).filter(Boolean),
      reflections: includeReflections ? wJournals.slice(-6).map((j) => ({ date: (j.session_date || "").slice(0, 10), text: (j.text || "").trim() })).filter((r) => r.text) : [],
      counts: { checkins: wCheckins.length, journals: wJournals.length },
    };
  }, [user, cutoffStr, toStr, timeframe, preset, brief, questions, sections, includeReflections, profile, symptomRollup, symptomSel, monthly, exercise, nutrition, uniqueMeds, medReminders, correlations, wJournals, wCheckins.length]);

  // ── Jess: draft the "what I want to discuss" brief + prioritised questions ──
  const draftWithJess = async () => {
    if (jessLoading) return;
    setJessLoading(true);
    const summary = buildDataDigest(report);
    const system =
      "You are Jess, a UK women's-health companion helping the user prepare for a GP appointment. " +
      "From her self-tracked summary, write a short 'what I want to discuss' brief and a few prioritised questions. " +
      "Rules: (1) British English, plain and calm; (2) NEVER diagnose or name a condition — frame as 'I'd like to ask about…'; " +
      "(3) the brief is 2-3 sentences in the FIRST PERSON (her voice, to her GP); " +
      "(4) then 3-5 short questions, most important first, each on its own line starting with 'Q: '; " +
      "(5) ground them in her actual data; (6) no preamble, no sign-off, no emoji.";
    const userPrompt = `My tracked summary:\n${summary}\n\nWrite my brief, then my prioritised questions.`;
    try {
      const { text } = await callJessAgent({ system, user: userPrompt });
      const raw = String(text || "").trim();
      const qLines = raw.split(/\n/).map((l) => l.trim()).filter((l) => /^q[:\-)]/i.test(l)).map((l) => l.replace(/^q[:\-)]\s*/i, "").trim()).filter(Boolean);
      const briefText = raw.split(/\n/).filter((l) => l.trim() && !/^q[:\-)]/i.test(l)).join(" ").replace(/\s+/g, " ").trim();
      if (briefText) setBrief(briefText.slice(0, 600));
      if (qLines.length) {
        setQuestions((prev) => {
          const existing = new Set(prev.map((q) => q.text.toLowerCase()));
          const fresh = qLines.filter((t) => !existing.has(t.toLowerCase())).map((t) => ({ id: uid(), text: t, pinned: false }));
          return [...prev, ...fresh];
        });
      }
      if (!briefText && !qLines.length) applyFallbackBrief();
    } catch {
      applyFallbackBrief();
    } finally {
      setJessLoading(false);
    }
  };
  const applyFallbackBrief = () => {
    if (!brief) {
      const topSx = report.symptomsByDomain.flatMap((d) => d.items).slice(0, 2).map((s) => s.label.toLowerCase());
      setBrief(`I've been tracking my health for the last ${report.windowLabel.toLowerCase()} and I'd like to talk through what I'm noticing${topSx.length ? `, especially ${topSx.join(" and ")}` : ""}. I'd value your view on what, if anything, to do next.`);
    }
    if (!questions.length) {
      setQuestions([
        { id: uid(), text: "Are the patterns I've tracked worth investigating further?", pinned: false },
        { id: uid(), text: "Are there options — lifestyle, referral or treatment — you'd suggest?", pinned: false },
      ]);
    }
  };

  // ── question list ops ──
  const addQuestion = () => setQuestions((q) => [...q, { id: uid(), text: "", pinned: false }]);
  const setQ = (id, text) => setQuestions((q) => q.map((x) => x.id === id ? { ...x, text } : x));
  const delQ = (id) => setQuestions((q) => q.filter((x) => x.id !== id));
  const pinQ = (id) => setQuestions((q) => q.map((x) => x.id === id ? { ...x, pinned: !x.pinned } : x));
  const moveQ = (id, dir) => setQuestions((q) => {
    const i = q.findIndex((x) => x.id === id); if (i < 0) return q;
    const j = i + dir; if (j < 0 || j >= q.length) return q;
    const next = [...q]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });

  // ── outputs ──
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(buildReportText(report)); setCopied(true); setTimeout(() => setCopied(false), 2400); }
    catch { setGenMsg("Couldn't copy — your browser blocked clipboard access."); }
  };
  const handlePrint = () => { window.print(); };
  const handleDownloadPdf = async () => {
    if (generating) return;
    setGenerating(true); setGenMsg("");
    try {
      const mod = await import("pdfmake/build/pdfmake");
      const fontsMod = await import("pdfmake/build/vfs_fonts");
      const pdfMake = mod.default || mod;
      pdfMake.vfs = fontsMod.vfs || fontsMod.default?.vfs || fontsMod.default || fontsMod;
      const doc = buildPdfDocDefinition(report);
      pdfMake.createPdf(doc).download(`femwell-doctor-export-${report.windowTo}.pdf`);
    } catch (err) {
      console.error("PDF build failed:", err);
      setGenMsg("The PDF couldn't be built on this device — use Print or Copy as text instead.");
    } finally {
      setGenerating(false);
    }
  };

  // ── render ──
  if (loading) return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ width: 30, height: 30, color: T.gold }} />
    </div>
  );

  const STEPS = [["select", "Select"], ["organise", "Organise"], ["generate", "Generate"]];
  const stepIdx = STEPS.findIndex(([s]) => s === step);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 80, fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 18px" }}>

        {/* header */}
        <header style={{ paddingTop: 30, marginBottom: 18 }}>
          <button onClick={() => window.history.back()} style={iconBtn} aria-label="Back"><ArrowLeft size={16} /></button>
          <div style={{ marginTop: 14 }}>
            <Eyebrow mb={9}>For your GP · A publication of one</Eyebrow>
            <Script size={52}>Your doctor's export</Script>
            <Hand size={20} color={T.inkSoft} carve={false} style={{ marginTop: 8 }}>
              Build a calm, GP-ready summary from what you've tracked — assembled on your device.
            </Hand>
          </div>
        </header>

        {/* step rail */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          {STEPS.map(([id, label], i) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <button onClick={() => setStep(id)} style={{
                display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
                background: i === stepIdx ? T.ink : "transparent", color: i === stepIdx ? T.paper : (i < stepIdx ? T.ink : T.muted),
                border: `1px solid ${i <= stepIdx ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
                fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4,
              }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, background: i < stepIdx ? T.gold : "transparent", border: i < stepIdx ? "none" : `1px solid currentColor`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                  {i < stepIdx ? <Check size={11} color={T.ink} /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: T.paperDeep }} />}
            </div>
          ))}
        </div>

        {step === "select" && (
          <SelectStep
            preset={preset}
            timeframe={timeframe} setTimeframe={setTimeframe}
            customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo}
            focus={focus} toggleFocus={toggleFocus}
            sections={sections} toggleSection={toggleSection}
            symptomRollup={symptomRollup} symptomSel={symptomSel} toggleSymptom={toggleSymptom}
            counts={report.counts}
            onNext={() => setStep("organise")}
          />
        )}

        {step === "organise" && (
          <OrganiseStep
            brief={brief} setBrief={setBrief}
            questions={questions} addQuestion={addQuestion} setQ={setQ} delQ={delQ} pinQ={pinQ} moveQ={moveQ}
            jessLoading={jessLoading} draftWithJess={draftWithJess}
            symptomsByDomain={report.symptomsByDomain}
            includeReflections={includeReflections} setIncludeReflections={setIncludeReflections}
            reflectionCount={wJournals.length}
            onBack={() => setStep("select")} onNext={() => setStep("generate")}
          />
        )}

        {step === "generate" && (
          <GenerateStep
            report={report}
            generating={generating} genMsg={genMsg} copied={copied}
            onDownload={handleDownloadPdf} onPrint={handlePrint} onCopy={handleCopy}
            onBack={() => setStep("organise")}
          />
        )}

        <div style={{ marginTop: 36 }}><EditorialFooter /></div>
      </div>

      {/* print-only report (window.print fallback) */}
      <PrintReport report={report} />
    </div>
  );
}

// ═══════════════════════════ STEP 1 — SELECT ═══════════════════════════
function SelectStep({ preset, timeframe, setTimeframe, customFrom, setCustomFrom, customTo, setCustomTo, focus, toggleFocus, sections, toggleSection, symptomRollup, symptomSel, toggleSymptom, counts, onNext }) {
  return (
    <div>
      {preset !== "full" && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16, padding: "5px 11px", borderRadius: 999, background: `${T.gold}1A`, fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: 0.5 }}>
          <Sparkles size={12} /> Pre-set for {preset === "diary" ? "a GP diary" : "your journal"}
        </div>
      )}

      <Card title="Timeframe" note={`${counts.checkins} check-ins in view`}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TIMEFRAMES.map((t) => (
            <button key={t.id} onClick={() => setTimeframe(t.id)} style={pill(timeframe === t.id)}>{t.label}</button>
          ))}
        </div>
        {timeframe === "custom" && (
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <label style={fieldLabel}>From <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={dateInput} /></label>
            <label style={fieldLabel}>To <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={dateInput} /></label>
          </div>
        )}
      </Card>

      <Card title="Focus" note="Quick presets — flip what's relevant">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FOCUS.map((f) => (
            <button key={f.id} onClick={() => toggleFocus(f)} style={pill(focus.has(f.id))}>{f.label}</button>
          ))}
        </div>
      </Card>

      <Card title="What goes in" note="Toggle the sections to include">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => toggleSection(s.id)} style={toggleRow(sections[s.id])}>
              <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${sections[s.id] ? T.gold : T.paperDeep}`, background: sections[s.id] ? T.gold : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {sections[s.id] && <Check size={12} color={T.ink} />}
              </span>
              <span style={{ flex: 1, textAlign: "left" }}>
                <span style={{ display: "block", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{s.label}{s.optIn ? " ·" : ""}{s.optIn && <span style={{ color: T.gold, fontSize: 9.5, letterSpacing: 0.5 }}> OPT-IN</span>}</span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 10.5, color: T.muted }}>{s.note}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {sections.symptoms && symptomRollup.length > 0 && (
        <Card title="Symptoms to include" note="From your check-ins, grouped by clinical domain">
          {GREENE.map((g) => {
            const items = symptomRollup.filter((s) => s.domain === g.id);
            if (!items.length) return null;
            return (
              <div key={g.id} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>{g.label}</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {items.map((s) => (
                    <button key={s.key} onClick={() => toggleSymptom(s.key)} style={pill(symptomSel[s.key] !== false)}>
                      {s.label} <span style={{ opacity: 0.7 }}>· {s.days}d</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <NextBar onNext={onNext} label="Organise" />
    </div>
  );
}

// ═══════════════════════════ STEP 2 — ORGANISE ═══════════════════════════
function OrganiseStep({ brief, setBrief, questions, addQuestion, setQ, delQ, pinQ, moveQ, jessLoading, draftWithJess, symptomsByDomain, includeReflections, setIncludeReflections, reflectionCount, onBack, onNext }) {
  const sorted = [...questions].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  return (
    <div>
      <Card title="What I want to discuss" note="In your own words — Jess can draft a start">
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4}
          placeholder="A sentence or two for your GP about why you're here and what you've noticed…"
          style={{ width: "100%", padding: "12px 13px", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <button onClick={draftWithJess} disabled={jessLoading} style={{ ...ghostBtn, marginTop: 10 }}>
          {jessLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {jessLoading ? "Jess is drafting…" : "Let Jess draft my brief"}
        </button>
      </Card>

      <Card title="Prioritised questions" note="Most important first — pin, reorder or remove">
        {sorted.length === 0 && <Hand size={18} color={T.muted} carve={false} style={{ marginBottom: 10 }}>No questions yet — add your own, or let Jess suggest a few above.</Hand>}
        {sorted.map((q, i) => (
          <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
              <button onClick={() => moveQ(q.id, -1)} disabled={i === 0} style={miniIcon} aria-label="Move up"><ChevronUp size={13} /></button>
              <button onClick={() => moveQ(q.id, 1)} disabled={i === sorted.length - 1} style={miniIcon} aria-label="Move down"><ChevronDown size={13} /></button>
            </div>
            <textarea value={q.text} onChange={(e) => setQ(q.id, e.target.value)} rows={1} placeholder="Type a question…"
              style={{ flex: 1, padding: "9px 11px", borderRadius: 10, border: `1px solid ${q.pinned ? T.gold : T.paperDeep}`, background: T.paperHi, fontFamily: SERIF, fontSize: 15, color: T.ink, resize: "none", outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => pinQ(q.id)} style={{ ...miniIcon, color: q.pinned ? T.gold : T.muted, paddingTop: 6 }} aria-label="Pin"><Pin size={14} /></button>
            <button onClick={() => delQ(q.id)} style={{ ...miniIcon, paddingTop: 6 }} aria-label="Remove"><X size={14} /></button>
          </div>
        ))}
        <button onClick={addQuestion} style={{ ...ghostBtn, marginTop: 4 }}><Plus size={13} /> Add a question</button>
      </Card>

      {symptomsByDomain.length > 0 && (
        <Card title="Symptoms, by clinical domain" note="The Greene lens — how your GP will read them">
          {symptomsByDomain.map((g) => (
            <div key={g.id} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 5 }}>{g.label} <span style={{ color: T.muted, fontWeight: 600, letterSpacing: 0.2, textTransform: "none" }}>· {g.note}</span></div>
              {g.items.map((s) => (
                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.paperDeep}` }}>
                  <span style={{ fontFamily: UI, fontSize: 13, color: T.ink }}>{s.label}</span>
                  <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{s.days} days{s.metric != null ? ` · avg ${s.metric}` : ""}</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}

      <Card title="Journal reflections" note="Your private words — off unless you choose">
        <button onClick={() => setIncludeReflections((v) => !v)} style={toggleRow(includeReflections)}>
          <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${includeReflections ? T.gold : T.paperDeep}`, background: includeReflections ? T.gold : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {includeReflections && <Check size={12} color={T.ink} />}
          </span>
          <span style={{ flex: 1, textAlign: "left", fontFamily: UI, fontSize: 12.5, color: T.ink }}>
            Include up to 6 recent journal reflections {reflectionCount > 0 ? `(${reflectionCount} in window)` : ""}
            <span style={{ display: "block", fontSize: 10.5, color: T.muted }}>Off by default. These are your most personal words — only share if you want to.</span>
          </span>
        </button>
      </Card>

      <NextBar onBack={onBack} onNext={onNext} label="Generate" />
    </div>
  );
}

// ═══════════════════════════ STEP 3 — GENERATE ═══════════════════════════
function GenerateStep({ report, generating, genMsg, copied, onDownload, onPrint, onCopy, onBack }) {
  const included = SECTIONS.filter((s) => report.sections[s.id] && (s.id !== "journal" || report.includeReflections)).map((s) => s.label);
  return (
    <div>
      <Card title="Ready to generate" note={`${report.windowLabel} · ${report.counts.checkins} check-ins`}>
        <Hand size={19} color={T.inkSoft} carve={false} style={{ marginBottom: 12 }}>
          Your export will include: {included.join(" · ") || "an overview"}
          {report.questions.length ? ` · ${report.questions.length} question${report.questions.length === 1 ? "" : "s"}` : ""}.
        </Hand>

        {/* point-of-export consent */}
        <div style={{ display: "flex", gap: 11, padding: "13px 14px", borderRadius: 12, background: `${T.gold}12`, border: `1px solid ${T.gold}55`, marginBottom: 16 }}>
          <ShieldCheck size={18} style={{ color: T.gold, flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.55 }}>
            This is <strong>special-category health data</strong>. The file is generated <strong>on your device</strong> and is <strong>never sent to a server</strong> — it exists only where you save or share it. You decide who sees it.
          </span>
        </div>

        <button onClick={onDownload} disabled={generating} style={{ ...primaryBtn, width: "100%", justifyContent: "center" }}>
          {generating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {generating ? "Building PDF…" : "Download PDF (A4)"}
        </button>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={onPrint} style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}><Printer size={14} /> Print</button>
          <button onClick={onCopy} style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy as text"}</button>
        </div>
        {genMsg && <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginTop: 10 }}>{genMsg}</p>}
      </Card>

      {/* on-screen preview */}
      <Card title="Preview" note="What your GP will read">
        <ReportPreview report={report} />
      </Card>

      <NextBar onBack={onBack} />
    </div>
  );
}

// ── on-screen + print preview (shared markup) ──
function ReportPreview({ report }) {
  return (
    <div style={{ fontFamily: UI, fontSize: 13, color: T.ink, lineHeight: 1.6 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, marginBottom: 4 }}>FemWell — Health summary for your GP</div>
      <div style={{ color: T.muted, fontSize: 11.5, marginBottom: 14 }}>{report.patient} · {report.windowLabel} ({report.windowFrom} to {report.windowTo}) · generated {ukDate(report.generatedAt)}</div>

      {report.brief && (<Section h="What I want to discuss"><p style={{ margin: 0 }}>{report.brief}</p></Section>)}
      {report.questions.length > 0 && (
        <Section h="My questions"><ol style={{ margin: 0, paddingLeft: 18 }}>{report.questions.map((q) => q.text && <li key={q.id} style={{ marginBottom: 3 }}>{q.text}{q.pinned ? " (priority)" : ""}</li>)}</ol></Section>
      )}
      {report.sections.overview && (
        <Section h="Overview">{Object.entries({ "Cycle length": report.overview.cycle, "Period length": report.overview.period, "Last period": report.overview.lastPeriod, "Life stage": report.overview.lifeStage, "Conditions": report.overview.conditions }).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: T.muted }}>{k}</span><span>{v}</span></div>
        ))}</Section>
      )}
      {report.sections.symptoms && report.symptomsByDomain.map((g) => (
        <Section key={g.id} h={`Symptoms · ${g.label}`}>{g.items.map((s) => (
          <div key={s.key} style={{ display: "flex", justifyContent: "space-between" }}><span>{s.label}</span><span style={{ color: T.muted }}>{s.days} days{s.metric != null ? ` · avg ${s.metric}` : ""}</span></div>
        ))}</Section>
      ))}
      {report.sections.mood && report.monthly.length > 0 && (
        <Section h="Mood & energy (monthly)">{report.monthly.map((m) => (
          <div key={m.month}>{monthLabel(m.month)} — mood {m.mood ?? "–"}/5 · energy {m.energy ?? "–"}/5{report.sections.sleep ? ` · sleep ${m.sleep ?? "–"}h` : ""} · stress {m.stress ?? "–"}/5</div>
        ))}</Section>
      )}
      {report.sections.meds && (
        <Section h="Medications"><div>Logged: {report.meds.join(", ") || "None in window"}</div>{report.reminders.length > 0 && <div style={{ color: T.muted }}>Reminders: {report.reminders.join(" · ")}</div>}</Section>
      )}
      {report.sections.exercise && (
        <Section h="Movement"><div>~{report.exercise.perWeek} active days/week ({report.exercise.total} days){report.exercise.top.length ? ` · ${report.exercise.top.join(", ")}` : ""}</div></Section>
      )}
      {report.sections.nutrition && report.nutrition?.hasData && (
        <Section h="Nutrition">
          <div>Logged on {report.nutrition.loggedDays} of the last {report.nutrition.days} days</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: T.muted }}>Average energy</span><span>~{report.nutrition.avgEnergy} kcal/day (estimated)</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: T.muted }}>Macro balance (per day)</span><span>protein ~{report.nutrition.macroBalance.protein_g}g · carbs ~{report.nutrition.macroBalance.carbs_g}g · fat ~{report.nutrition.macroBalance.fat_g}g · fibre ~{report.nutrition.macroBalance.fiber_g}g</span></div>
          {report.nutrition.micros.map((m) => (
            <div key={m.key} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{m.label}{m.lean ? " (leaning light)" : ""}</span>
              <span style={{ color: T.muted }}>~{m.perDay}{m.unit}/day · {m.refLabel}</span>
            </div>
          ))}
          {report.nutrition.hydration.avgMl > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: T.muted }}>Hydration</span><span>~{report.nutrition.hydration.avgMl}ml/day (target {report.nutrition.hydration.targetMl}ml)</span></div>
          )}
          {report.nutrition.gaps.length > 0 && (
            <div style={{ color: T.muted, fontSize: 11.5, marginTop: 4 }}>Notes: {report.nutrition.gaps.join("; ")}.</div>
          )}
          <div style={{ color: T.muted, fontSize: 11, marginTop: 4, fontStyle: "italic" }}>{report.nutrition.note}</div>
        </Section>
      )}
      {report.sections.patterns && report.patterns.length > 0 && (
        <Section h="Patterns noticed"><ul style={{ margin: 0, paddingLeft: 18 }}>{report.patterns.map((p, i) => <li key={i}>{p}</li>)}</ul></Section>
      )}
      {report.includeReflections && report.reflections.length > 0 && (
        <Section h="Journal reflections (shared by choice)">{report.reflections.map((r, i) => (
          <div key={i} style={{ marginBottom: 4 }}><span style={{ color: T.muted }}>{r.date}</span> — {r.text.slice(0, 240)}{r.text.length > 240 ? "…" : ""}</div>
        ))}</Section>
      )}
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.paperDeep}`, color: T.muted, fontSize: 11, lineHeight: 1.5 }}>
        Self-reported tracking only — a conversation-starter, not a diagnostic record. {report.preset === "diary" ? "Structured for ease of reading alongside NICE NG23 menopause guidance. " : ""}Generated on-device by FemWell; never uploaded.
      </div>
    </div>
  );
}
function Section({ h, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 5 }}>{h}</div>
      {children}
    </div>
  );
}
function PrintReport({ report }) {
  return (
    <>
      <style>{`@media print { body * { visibility: hidden !important; } #fw-doctor-print, #fw-doctor-print * { visibility: visible !important; } #fw-doctor-print { position: absolute; left: 0; top: 0; width: 100%; padding: 24px 28px; background: #fff; } }
        @media screen { #fw-doctor-print { display: none; } }`}</style>
      <div id="fw-doctor-print"><ReportPreview report={report} /></div>
    </>
  );
}

// ═══════════════════════════ shared UI atoms ═══════════════════════════
function Card({ title, note, children }) {
  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "16px 17px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: T.ink }}>{title}</div>
        {note && <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, textAlign: "right" }}>{note}</div>}
      </div>
      {children}
    </section>
  );
}
function NextBar({ onBack, onNext, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, marginBottom: 8 }}>
      {onBack && <button onClick={onBack} style={ghostBtn}><ArrowLeft size={14} /> Back</button>}
      <div style={{ flex: 1 }} />
      {onNext && <button onClick={onNext} style={primaryBtn}>{label} <ArrowRight size={14} /></button>}
    </div>
  );
}

// ── plain-text + pdf + digest builders (shared, pure) ──
function buildDataDigest(r) {
  const sx = r.symptomsByDomain.flatMap((d) => d.items.map((s) => `${s.label}: ${s.days} days`)).join("; ");
  const mood = r.monthly.length ? r.monthly.map((m) => `${m.month} mood ${m.mood ?? "-"}/5 energy ${m.energy ?? "-"}/5`).join("; ") : "no mood data";
  return [
    `Window: ${r.windowLabel}.`,
    `Life stage: ${r.overview.lifeStage}. Conditions: ${r.overview.conditions}.`,
    `Symptoms: ${sx || "none notable"}.`,
    `Mood/energy: ${mood}.`,
    `Medications: ${r.meds.join(", ") || "none"}.`,
    (r.sections.nutrition && r.nutrition?.hasData)
      ? `Nutrition: ~${r.nutrition.avgEnergy} kcal/day over ${r.nutrition.loggedDays} logged days; ${r.nutrition.micros.filter((m) => m.lean).map((m) => `${m.label.toLowerCase()} leaning light`).join(", ") || "key micros within usual range"}.`
      : "",
    r.patterns.length ? `Patterns: ${r.patterns.join("; ")}.` : "",
  ].filter(Boolean).join("\n");
}

function buildReportText(r) {
  const L = [];
  L.push("FEMWELL — HEALTH SUMMARY FOR YOUR GP");
  L.push(`Patient: ${r.patient}`);
  L.push(`Window: ${r.windowLabel} (${r.windowFrom} to ${r.windowTo})`);
  L.push(`Generated on device: ${ukDate(r.generatedAt)}`);
  L.push("");
  if (r.brief) { L.push("WHAT I WANT TO DISCUSS"); L.push(r.brief); L.push(""); }
  if (r.questions.length) { L.push("MY QUESTIONS"); r.questions.forEach((q, i) => q.text && L.push(`${i + 1}. ${q.text}${q.pinned ? " (priority)" : ""}`)); L.push(""); }
  if (r.sections.overview) { L.push("OVERVIEW"); L.push(`Cycle length: ${r.overview.cycle}`); L.push(`Period length: ${r.overview.period}`); L.push(`Last period: ${r.overview.lastPeriod}`); L.push(`Life stage: ${r.overview.lifeStage}`); L.push(`Conditions: ${r.overview.conditions}`); L.push(""); }
  if (r.sections.symptoms) r.symptomsByDomain.forEach((g) => { L.push(`SYMPTOMS — ${g.label.toUpperCase()}`); g.items.forEach((s) => L.push(`${s.label}: ${s.days} days${s.metric != null ? ` (avg ${s.metric})` : ""}`)); L.push(""); });
  if (r.sections.mood && r.monthly.length) { L.push("MOOD & ENERGY (MONTHLY)"); r.monthly.forEach((m) => L.push(`${monthLabel(m.month)}: mood ${m.mood ?? "-"}/5, energy ${m.energy ?? "-"}/5, sleep ${m.sleep ?? "-"}h, stress ${m.stress ?? "-"}/5`)); L.push(""); }
  if (r.sections.meds) { L.push("MEDICATIONS"); L.push(`Logged: ${r.meds.join(", ") || "None in window"}`); if (r.reminders.length) L.push(`Reminders: ${r.reminders.join("; ")}`); L.push(""); }
  if (r.sections.exercise) { L.push("MOVEMENT"); L.push(`~${r.exercise.perWeek} active days/week (${r.exercise.total} total)${r.exercise.top.length ? ` — ${r.exercise.top.join(", ")}` : ""}`); L.push(""); }
  if (r.sections.nutrition && r.nutrition?.hasData) {
    L.push("NUTRITION");
    L.push(`Logged on ${r.nutrition.loggedDays} of the last ${r.nutrition.days} days`);
    L.push(`Average energy: ~${r.nutrition.avgEnergy} kcal/day (estimated)`);
    L.push(`Macro balance (per day): protein ~${r.nutrition.macroBalance.protein_g}g, carbs ~${r.nutrition.macroBalance.carbs_g}g, fat ~${r.nutrition.macroBalance.fat_g}g, fibre ~${r.nutrition.macroBalance.fiber_g}g`);
    r.nutrition.micros.forEach((m) => L.push(`${m.label}${m.lean ? " (leaning light)" : ""}: ~${m.perDay}${m.unit}/day (${m.refLabel})`));
    if (r.nutrition.hydration.avgMl > 0) L.push(`Hydration: ~${r.nutrition.hydration.avgMl}ml/day (target ${r.nutrition.hydration.targetMl}ml)`);
    if (r.nutrition.gaps.length) L.push(`Notes: ${r.nutrition.gaps.join("; ")}.`);
    L.push(r.nutrition.note);
    L.push("");
  }
  if (r.sections.patterns && r.patterns.length) { L.push("PATTERNS NOTICED"); r.patterns.forEach((p) => L.push(`- ${p}`)); L.push(""); }
  if (r.includeReflections && r.reflections.length) { L.push("JOURNAL REFLECTIONS (shared by choice)"); r.reflections.forEach((rf) => L.push(`${rf.date}: ${rf.text}`)); L.push(""); }
  L.push("---");
  L.push("Special-category health data. Generated on-device, never sent to a server. Self-reported tracking only — a conversation-starter, not a diagnostic record.");
  return L.join("\n");
}

function buildPdfDocDefinition(r) {
  const PLUM = "#3A2C1A", GOLD = "#A6862B", MUTE = "#6E6557";
  const body = [];
  const h = (t) => ({ text: t.toUpperCase(), color: GOLD, fontSize: 9, bold: true, characterSpacing: 1, margin: [0, 12, 0, 4] });
  const kv = (k, v) => ({ columns: [{ text: k, color: MUTE, fontSize: 10, width: 130 }, { text: String(v), fontSize: 10 }], margin: [0, 1, 0, 1] });

  body.push({ text: "FemWell — Health summary for your GP", fontSize: 16, bold: true, color: PLUM });
  body.push({ text: `${r.patient}  ·  ${r.windowLabel} (${r.windowFrom} to ${r.windowTo})  ·  generated ${ukDate(r.generatedAt)}`, fontSize: 9, color: MUTE, margin: [0, 3, 0, 2] });
  body.push({ text: "Special-category health data — generated on your device, never sent to a server.", italics: true, fontSize: 8, color: MUTE, margin: [0, 0, 0, 6] });
  body.push({ canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#D8CFBC" }] });

  if (r.brief) { body.push(h("What I want to discuss")); body.push({ text: r.brief, fontSize: 11, lineHeight: 1.3 }); }
  if (r.questions.length) { body.push(h("My questions")); body.push({ ol: r.questions.filter((q) => q.text).map((q) => ({ text: q.text + (q.pinned ? "  (priority)" : ""), fontSize: 11, margin: [0, 1, 0, 1] })) }); }
  if (r.sections.overview) { body.push(h("Overview")); [["Cycle length", r.overview.cycle], ["Period length", r.overview.period], ["Last period", r.overview.lastPeriod], ["Life stage", r.overview.lifeStage], ["Conditions", r.overview.conditions]].forEach(([k, v]) => body.push(kv(k, v))); }
  if (r.sections.symptoms) r.symptomsByDomain.forEach((g) => { body.push(h(`Symptoms · ${g.label}`)); g.items.forEach((s) => body.push(kv(s.label, `${s.days} days${s.metric != null ? ` · avg ${s.metric}` : ""}`))); });
  if (r.sections.mood && r.monthly.length) { body.push(h("Mood & energy (monthly)")); r.monthly.forEach((m) => body.push({ text: `${monthLabel(m.month)} — mood ${m.mood ?? "–"}/5 · energy ${m.energy ?? "–"}/5 · sleep ${m.sleep ?? "–"}h · stress ${m.stress ?? "–"}/5`, fontSize: 10, margin: [0, 1, 0, 1] })); }
  if (r.sections.meds) { body.push(h("Medications")); body.push(kv("Logged", r.meds.join(", ") || "None in window")); if (r.reminders.length) body.push(kv("Reminders", r.reminders.join("; "))); }
  if (r.sections.exercise) { body.push(h("Movement")); body.push({ text: `~${r.exercise.perWeek} active days/week (${r.exercise.total} total)${r.exercise.top.length ? ` — ${r.exercise.top.join(", ")}` : ""}`, fontSize: 10 }); }
  if (r.sections.nutrition && r.nutrition?.hasData) {
    body.push(h("Nutrition"));
    body.push(kv("Window", `Logged on ${r.nutrition.loggedDays} of last ${r.nutrition.days} days`));
    body.push(kv("Average energy", `~${r.nutrition.avgEnergy} kcal/day (estimated)`));
    body.push(kv("Macros (per day)", `protein ~${r.nutrition.macroBalance.protein_g}g · carbs ~${r.nutrition.macroBalance.carbs_g}g · fat ~${r.nutrition.macroBalance.fat_g}g · fibre ~${r.nutrition.macroBalance.fiber_g}g`));
    r.nutrition.micros.forEach((m) => body.push(kv(`${m.label}${m.lean ? " (leaning light)" : ""}`, `~${m.perDay}${m.unit}/day · ${m.refLabel}`)));
    if (r.nutrition.hydration.avgMl > 0) body.push(kv("Hydration", `~${r.nutrition.hydration.avgMl}ml/day (target ${r.nutrition.hydration.targetMl}ml)`));
    if (r.nutrition.gaps.length) body.push({ text: `Notes: ${r.nutrition.gaps.join("; ")}.`, fontSize: 9, color: MUTE, margin: [0, 2, 0, 0] });
    body.push({ text: r.nutrition.note, italics: true, fontSize: 8.5, color: MUTE, margin: [0, 2, 0, 0] });
  }
  if (r.sections.patterns && r.patterns.length) { body.push(h("Patterns noticed")); body.push({ ul: r.patterns.map((p) => ({ text: p, fontSize: 10, margin: [0, 1, 0, 1] })) }); }
  if (r.includeReflections && r.reflections.length) { body.push(h("Journal reflections (shared by choice)")); r.reflections.forEach((rf) => body.push({ text: `${rf.date} — ${rf.text}`, fontSize: 9.5, color: "#3C342A", margin: [0, 1, 0, 2] })); }

  return {
    pageSize: "A4",
    pageMargins: [40, 44, 40, 54],
    content: body,
    defaultStyle: { fontSize: 10, color: "#15110C" },
    footer: (page, count) => ({
      margin: [40, 8, 40, 0],
      columns: [
        { text: "Self-reported tracking only — a conversation-starter, not a diagnostic record." + (r.preset === "diary" ? " Structured for NICE NG23." : ""), fontSize: 7.5, color: MUTE },
        { text: `${page} / ${count}`, fontSize: 7.5, color: MUTE, alignment: "right", width: 40 },
      ],
    }),
  };
}

// ── styles ──
const iconBtn = { width: 36, height: 36, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.ink, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
const pill = (on) => ({ padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, background: on ? T.ink : "transparent", color: on ? T.paper : T.inkSoft, border: `1px solid ${on ? T.ink : T.paperDeep}` });
const toggleRow = (on) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 11px", borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%", background: on ? `${T.gold}10` : "transparent", border: `1px solid ${on ? T.gold : T.paperDeep}` });
const primaryBtn = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 999, background: T.ink, color: T.paper, border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3 };
const ghostBtn = { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 999, background: "transparent", color: T.inkSoft, border: `1px solid ${T.paperDeep}`, cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700 };
const miniIcon = { background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "inline-flex" };
const fieldLabel = { fontFamily: UI, fontSize: 11.5, color: T.muted, display: "flex", flexDirection: "column", gap: 4, fontWeight: 600 };
const dateInput = { fontFamily: UI, fontSize: 13, padding: "7px 10px", borderRadius: 9, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.ink };
