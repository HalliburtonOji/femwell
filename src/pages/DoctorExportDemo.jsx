// DoctorExportDemo — a redesign DEMO of the Doctor Export page. PREVIEW route only (/DoctorExportDemo).
// LIVE /DoctorExport UNTOUCHED. Conforms to BRAND_IDENTITY.md (calm sage/snowdrop character).
//
// DISTINCT FORM (a LIVE DOCUMENT BUILDER — not a slider, not a grid): the left side is a CHECKLIST of
// data categories (toggles + real counts) plus a note-to-GP field; the right/below is a PAPER "one-page
// summary" PREVIEW that assembles in real time as you toggle — letterhead, your note, then a line per
// included category. A Generate bar deep-links into the real /DoctorExport wizard.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { Loader, PageVines, JumpPill, JumpSheet, DEMO_CSS, CLAMP, withTimeout, todayKey } from "@/components/demos/demoKit";
import {
  FileText, Stethoscope, CalendarHeart, Smile, Pill, PenLine, Check, Printer, Send, FileCheck2, ChevronRight,
} from "lucide-react";

const COL = 460;
const SAGE = T.sage;
const countSince = (rows, days) => { const cut = Date.now() - days * 86400000; return (rows || []).filter((r) => { const d = r?.date || r?.created_date || r?.day_key; const t = d ? new Date(d).getTime() : 0; return t && t >= cut; }).length; };

const SECTIONS = [
  { key: "build", label: "Choose what's in it", Icon: FileCheck2, accent: "#8FAF8F" },
  { key: "note", label: "Note for your GP", Icon: PenLine, accent: "#A8893F" },
  { key: "preview", label: "Your one-page summary", Icon: FileText, accent: "#8E6E8E" },
];

export default function DoctorExportDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [included, setIncluded] = useState({ symptoms: true, cycle: true, checkins: true, meds: true, journal: false });
  const toggle = (k) => setIncluded((s) => ({ ...s, [k]: !s[k] }));
  const refs = { build: useRef(null), note: useRef(null), preview: useRef(null) };

  useEffect(() => {
    let alive = true;
    (async () => {
      const m = await withTimeout(base44.auth.me()); const id = m?.id || null; if (!alive) return; setMe(m); setUid(id);
      if (!id) { setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      if (!alive) return; setProfile((profs || []).filter(Boolean)[0] || null); setLoading(false);
      const grab = (ent, key, days = 30) => withTimeout(base44.entities[ent].filter({ user_id: id }, "-date", 300)).then((rows) => { if (alive) setCounts((c) => ({ ...c, [key]: countSince(rows, days) })); }).catch(() => {});
      grab("SymptomLogs", "symptoms"); grab("DailyCheckins", "checkins"); grab("MedicationLogs", "meds", 90);
      withTimeout(base44.entities.JournalEntries.filter({ user_id: id }, "-created_date", 300)).then((rows) => { if (alive) setCounts((c) => ({ ...c, journal: countSince(rows, 30) })); }).catch(() => {});
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const name = profile?.first_name || (me?.full_name ? String(me.full_name).split(" ")[0] : "") || "";
  const dateStr = useMemo(() => { try { return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch { return ""; } }, []);

  const CATS = [
    { key: "symptoms", label: "Symptoms", Icon: Stethoscope, detail: counts.symptoms != null ? `${counts.symptoms} logged · last 30 days` : "your recent logs", line: counts.symptoms ? `${counts.symptoms} symptom entries, with timing and cycle phase.` : "Recent symptoms, with timing and phase." },
    { key: "cycle", label: "Cycle summary", Icon: CalendarHeart, detail: hasCycle ? `${PHASE_LABEL[cycle.phase]} · ~${profile?.cycle_avg_length || 28}-day` : "your cycle profile", line: hasCycle ? `Average ${profile?.cycle_avg_length || 28}-day cycle; currently ${PHASE_LABEL[cycle.phase].toLowerCase()}.` : "Average length, current phase and recent dates." },
    { key: "checkins", label: "Mood & energy", Icon: Smile, detail: counts.checkins != null ? `${counts.checkins} check-ins · last 30 days` : "your check-ins", line: counts.checkins ? `${counts.checkins} daily check-ins showing the trend over weeks.` : "Mood and energy trend over recent weeks." },
    { key: "meds", label: "Medications", Icon: Pill, detail: counts.meds != null ? `${counts.meds} logs · last 90 days` : "what you take", line: counts.meds ? `${counts.meds} medication/supplement logs and consistency.` : "Medications and supplements, including OTC." },
    { key: "journal", label: "Reflections", Icon: PenLine, detail: counts.journal != null ? `${counts.journal} notes · last 30 days` : "your own words", line: "A few of your own lines, only if you choose to include them." },
  ];
  const selected = CATS.filter((c) => included[c.key]);

  const jumpTo = (k) => { setJumpOpen(false); refs[k]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={SAGE} b={T.gold} />
      <JumpPill onClick={() => setJumpOpen(true)} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        {/* header — document-y, left aligned */}
        <header style={{ display: "flex", alignItems: "center", gap: 13, padding: "26px 0 6px" }}>
          <span style={{ width: 52, height: 52, borderRadius: 14, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><FileText size={26} color={SAGE} strokeWidth={1.6} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={15} /><Eyebrow color={T.muted}>For your GP</Eyebrow></div>
            <Script size={40} color={T.ink}>Doctor export</Script>
          </div>
        </header>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "4px 0 4px", lineHeight: 1.5 }}>
          Ten minutes with a GP is short. Build a clear one-page summary from the months you've quietly tracked — and only what you choose to share.
        </Hand>

        {/* BUILD — checklist */}
        <SectionHead refEl={refs.build} eyebrow="Step 1" title="Choose what's in it" accent={SAGE} flower="primrose" />
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {CATS.map((c) => { const on = included[c.key]; return (
            <button key={c.key} onClick={() => toggle(c.key)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: on ? `${SAGE}12` : T.paperHi, border: `1px solid ${on ? SAGE : T.paperDeep}`, borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><c.Icon size={17} color={SAGE} /></span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, ...CLAMP(1) }}>{c.label}</span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, ...CLAMP(1) }}>{c.detail}</span>
              </span>
              <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", background: on ? SAGE : "transparent", border: `1.5px solid ${on ? SAGE : T.paperDeep}` }}>{on ? <Check size={15} color="#fff" strokeWidth={3} /> : null}</span>
            </button>
          ); })}
        </div>

        {/* NOTE — to the GP */}
        <SectionHead refEl={refs.note} eyebrow="Step 2" title="Anything to raise?" accent={T.gold} flower="cornflower" />
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 16, padding: "14px 15px" }}>
          <textarea value={note} onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }} rows={3} maxLength={400} placeholder="e.g. The headaches before my period have got worse since…"
            style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
          <button onClick={() => { if (!note.trim()) return; setNoteSaved(true); if (uid) base44.entities.JournalEntries.create({ user_id: uid, session_date: todayKey(), text: note.trim(), tags: ["gp-note"], prompt: "To raise with my GP", card_type: "free", card_color: "cream" }).catch(() => {}); }}
            disabled={!note.trim()} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.gold, color: "#fff", border: "none", borderRadius: 12, padding: "11px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: note.trim() ? "pointer" : "default", opacity: note.trim() ? 1 : 0.5 }}>
            <Send size={15} /> {noteSaved ? "Added to your summary" : "Add to the summary"}
          </button>
        </div>

        {/* PREVIEW — the live one-page summary */}
        <SectionHead refEl={refs.preview} eyebrow="Step 3" title="Your one-page summary" accent="#8E6E8E" flower="iris" />
        <div style={{ background: "#FBF7EC", border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "20px 20px 18px", boxShadow: "0 8px 28px rgba(58,44,26,0.14)", transform: "rotate(-0.25deg)" }}>
          {/* letterhead */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
            <Heart size={18} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: T.ink }}>Health summary</div>
              <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: "0.04em" }}>{[name, dateStr].filter(Boolean).join(" · ")} · prepared with FemWell</div>
            </div>
            <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="bluebell" size={26} color={SAGE} idx="de-seal" /></span>
          </div>
          {/* GP note */}
          {noteSaved && note.trim() && (
            <div style={{ margin: "12px 0 4px" }}>
              <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 4 }}>To raise today</div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, lineHeight: 1.45, margin: 0, ...CLAMP(3) }}>“{note.trim()}”</p>
            </div>
          )}
          {/* included rows */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {selected.length === 0 && <p style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, fontStyle: "italic", margin: 0 }}>Nothing selected yet — tick a section above and it appears here.</p>}
            {selected.map((c) => (
              <div key={c.key} style={{ display: "flex", gap: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: 99, background: SAGE, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Check size={12} color="#fff" strokeWidth={3} /></span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>{c.label}</span>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.4, ...CLAMP(2) }}>{c.line}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.paperDeep}`, fontFamily: UI, fontSize: 12, color: T.muted, fontStyle: "italic" }}>
            {selected.length} section{selected.length === 1 ? "" : "s"} included{noteSaved && note.trim() ? " + your note" : ""}. Nothing is shared until you generate it.
          </div>
        </div>

        {/* generate */}
        <a href="/DoctorExport" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: SAGE, color: "#fff", border: "none", borderRadius: 14, padding: "15px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, textDecoration: "none", marginTop: 16, boxShadow: "0 6px 20px rgba(143,175,143,0.4)" }}>
          <Printer size={16} /> Generate &amp; print my export
        </a>
        <a href="/DoctorExport" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>Open the full export builder <ChevronRight size={14} /></a>
      </div>

      {jumpOpen && <JumpSheet sections={SECTIONS} onClose={() => setJumpOpen(false)} onPick={(k) => jumpTo(k)} />}
    </div>
  );
}

function SectionHead({ refEl, eyebrow, title, accent, flower }) {
  return (
    <div ref={refEl} style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 12px", scrollMarginTop: 70 }}>
      <FlowerGlyph variant={flower || "primrose"} size={30} color={accent} idx={`sh-${title}`} />
      <div style={{ minWidth: 0 }}>
        <Eyebrow color={accent}>{eyebrow}</Eyebrow>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.2, display: "block" }}>{title}</span>
      </div>
      <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.7, marginLeft: 6 }} />
    </div>
  );
}
