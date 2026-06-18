// DoctorExportDemo — "Walk in prepared" — a redesign DEMO of the Doctor Export page. Adapts the
// TODAY / JOURNAL / COMMUNITY bar to the export's purpose: turn what you've quietly logged into a clear
// one-page summary for a 10-minute NHS appointment. PREVIEW route only (/DoctorExportDemo, via IDEAS →
// Previews). LIVE /DoctorExport UNTOUCHED. Conforms to claude-state/BRAND_IDENTITY.md (calm sage/snowdrop
// flora character — trust, a fresh start).
//
// THE SHAPE: 1) HERO — a calm sage snowdrop-style bloom + carved heart + Ephesis "Doctor export".
// 2) SUMMARY — "What you'll bring": a live count of what's selected + the Generate action. 3) PER-SECTION
// CardStack — one card per data category (symptoms · cycle · check-ins · medications · journal · GP notes)
// each showing a REAL count + an inline INCLUDE toggle (she curates exactly what's shared) + a final
// "Generate" card that deep-links into the real /DoctorExport wizard. 4) Central Jump-to.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  RichBloomV2, floraKeyframes, CardCorner, VineMotifV2, FlowerGlyph, Butterfly,
} from "@/components/brand/flora";
import {
  FileText, Stethoscope, CalendarHeart, Smile, Pill, PenLine, Check, Plus, ChevronRight, ChevronLeft,
  Grid2x2, X, Send, FileCheck2, Printer,
} from "lucide-react";

const COL = 430;
const CARD_W = 365;
const GAP = 14;
const SAGE = T.sage;

const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });
const countSince = (rows, days) => { const cut = Date.now() - days * 86400000; return (rows || []).filter((r) => { const d = r?.date || r?.created_date || r?.day_key; const t = d ? new Date(d).getTime() : 0; return t && t >= cut; }).length; };

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function Frame4({ variant = "sprig", color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
export default function DoctorExportDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [included, setIncluded] = useState({ symptoms: true, cycle: true, checkins: true, meds: true, journal: true, notes: true });
  const toggle = (k) => setIncluded((s) => ({ ...s, [k]: !s[k] }));

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null;
      if (!alive) return;
      setUid(id);
      if (!id) { setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      if (!alive) return;
      setProfile((profs || []).filter(Boolean)[0] || null);
      setLoading(false);
      const grab = (ent, key, days = 30) => withTimeout(base44.entities[ent].filter({ user_id: id }, "-date", 300))
        .then((rows) => { if (alive) setCounts((c) => ({ ...c, [key]: countSince(rows, days) })); }).catch(() => {});
      grab("SymptomLogs", "symptoms");
      grab("DailyCheckins", "checkins");
      grab("MedicationLogs", "meds", 90);
      withTimeout(base44.entities.JournalEntries.filter({ user_id: id }, "-created_date", 300))
        .then((rows) => { if (alive) setCounts((c) => ({ ...c, journal: countSince(rows, 30) })); }).catch(() => {});
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;

  const CATS = [
    { key: "symptoms", section: "Symptoms", Icon: Stethoscope, flower: "dahlia", tag: "Last 30 days",
      n: counts.symptoms, unit: "symptom logs",
      hook: counts.symptoms ? `${counts.symptoms} symptom${counts.symptoms === 1 ? "" : "s"} logged` : "Your symptoms",
      line: "The pattern a 10-minute appointment never has time to draw out — frequency, timing, and where in your cycle." },
    { key: "cycle", section: "Cycle", Icon: CalendarHeart, flower: "iris", tag: "Your cycle",
      n: hasCycle ? 1 : 0, unit: "cycle profile",
      hook: hasCycle ? `${PHASE_LABEL[cycle.phase]} · ~${profile?.cycle_avg_length || 28}-day cycle` : "Your cycle",
      line: "Average length, current phase and recent dates — context that changes how symptoms are read." },
    { key: "checkins", section: "Check-ins", Icon: Smile, flower: "primrose", tag: "Last 30 days",
      n: counts.checkins, unit: "daily check-ins",
      hook: counts.checkins ? `${counts.checkins} check-in${counts.checkins === 1 ? "" : "s"}` : "Mood & energy",
      line: "Mood and energy over the weeks — the trend, not a single bad morning, is what's useful to a clinician." },
    { key: "meds", section: "Medications", Icon: Pill, flower: "lavender", tag: "Last 90 days",
      n: counts.meds, unit: "medication logs",
      hook: counts.meds ? `${counts.meds} medication log${counts.meds === 1 ? "" : "s"}` : "Medications & supplements",
      line: "What you take and how consistently — including anything over-the-counter that's easy to forget on the day." },
    { key: "journal", section: "Journal", Icon: PenLine, flower: "camellia", tag: "Last 30 days",
      n: counts.journal, unit: "journal notes",
      hook: counts.journal ? `${counts.journal} reflection${counts.journal === 1 ? "" : "s"}` : "Your own words",
      line: "Optional. A few of your own lines can say what a tick-box never will — you choose if any are shared." },
    { key: "notes", section: "GP notes", Icon: FileText, flower: "cornflower", tag: "For the appointment",
      hook: "What you want to raise",
      line: "Write the things you always forget to mention once you're in the room. They'll sit at the top of the summary.",
      compose: true },
  ];

  const selectedCount = CATS.filter((c) => included[c.key]).length;

  // slider
  const trackRef = useRef(null);
  const sliderTopRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = CATS.length - 1;
  useEffect(() => {
    const el = trackRef.current; if (!el) return; let t;
    const onScroll = () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(el.scrollLeft / (CARD_W + GAP)); setActive(Math.max(0, Math.min(last, i))); }, 80); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last, loading]);
  const goTo = (i) => { const idx = Math.max(0, Math.min(last, i)); setActive(idx); trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" }); };
  const jumpTo = (i) => { setJumpOpen(false); sliderTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => goTo(i), 280); };

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.de-track{scrollbar-width:none}.de-track::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>

      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 150, right: -26 }}><VineMotifV2 color={SAGE} color2={T.gold} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 820, left: -28 }}><VineMotifV2 color={T.gold} color2={SAGE} opacity={0.08} w={140} flip /></div>
      </div>

      <button onClick={() => setJumpOpen(true)} aria-label="Jump to a section" style={{
        position: "fixed", top: "calc(10px + env(safe-area-inset-top))", left: 12, zIndex: 45,
        display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(244,239,227,0.92)", backdropFilter: "blur(6px)",
        border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 13px", cursor: "pointer",
        fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted,
        boxShadow: "0 2px 10px rgba(58,44,26,0.12)",
      }}><Grid2x2 size={14} /> Jump to</button>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* HERO */}
        <header style={{ padding: "26px 18px 6px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FileText size={13} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>For your GP</span>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "2px 0 2px" }}>
            <div style={{ position: "relative", width: 188, height: 188, display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 200 200" width={188} height={188} aria-hidden style={{ position: "absolute", inset: 0 }}>
                <circle cx="100" cy="100" r="84" fill="none" stroke={SAGE} strokeWidth="2.5" strokeDasharray="2 8" opacity="0.5" />
                <circle cx="100" cy="100" r="74" fill="none" stroke={T.gold} strokeWidth="1.2" opacity="0.3" />
              </svg>
              <RichBloomV2 form="daisy" color={SAGE} color2="#D7E5D7" accent={T.gold} size={124} animate soft idx="de-hero" />
            </div>
            <div style={{ position: "absolute", top: 8, right: 32 }}><Butterfly size={38} color={SAGE} color2={T.gold} pattern="plain" idx="de-bf" /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
            <Heart size={17} />
            <Script size={42} color={T.ink}>Doctor export</Script>
          </div>
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 11, lineHeight: 1.5 }}>
            Ten minutes with a GP is short. Walk in with the months you've quietly tracked, on one clear page — and only what you choose to share.
          </Hand>
        </header>

        {/* SUMMARY — what you'll bring + generate */}
        <div style={{ padding: "10px 18px 4px" }}>
          <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${SAGE}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${SAGE}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
            <Frame4 variant="sprig" color={SAGE} size={42} opacity={0.5} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                {ICON_DISC(FileCheck2, SAGE)}
                <Eyebrow color={SAGE}>What you'll bring</Eyebrow>
                <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="primrose" size={30} color={SAGE} idx="desum-mb" /></span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px", ...CLAMP(4) }}>
                Your one-page summary will include <strong style={{ color: T.ink }}>{selectedCount} of {CATS.length}</strong> sections. Toggle each below to choose exactly what your GP sees — nothing leaves until you generate it.
              </p>
              <a href="/DoctorExport" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: SAGE, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                <Printer size={15} /> Generate my export
              </a>
            </div>
          </div>
        </div>

        {/* segmented rail */}
        <div ref={sliderTopRef} className="de-track" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 18px 12px", WebkitOverflowScrolling: "touch" }}>
          {CATS.map((c, i) => (
            <button key={c.key} onClick={() => goTo(i)} style={{
              flex: "none", background: i === active ? SAGE : "transparent", color: i === active ? T.paper : T.muted,
              border: `1px solid ${i === active ? SAGE : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}><c.Icon size={13} /> {c.section}</button>
          ))}
        </div>

        {/* slider */}
        <div ref={trackRef} className="de-track" style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
          {CATS.map((c) => (
            <ExportCard key={c.key} card={c} uid={uid} included={!!included[c.key]} onToggle={() => toggle(c.key)} />
          ))}
          <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
          <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous section" style={navBtn(active === 0)}><ChevronLeft size={18} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {CATS.map((c, i) => (
              <button key={c.key} onClick={() => goTo(i)} aria-label={c.section} style={{
                width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                background: i === active ? SAGE : T.paperDeep, cursor: "pointer", transition: "width .2s",
              }} />
            ))}
          </div>
          <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next section" style={navBtn(active === last)}><ChevronRight size={18} /></button>
        </div>
      </div>

      {jumpOpen && (
        <div role="dialog" aria-modal="true" aria-label="Jump to a section" className="fw-scrim-anim" onClick={(e) => { if (e.target === e.currentTarget) setJumpOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)", animation: "fwScrimIn .22s ease both" }}>
          <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "18px 18px calc(96px + env(safe-area-inset-bottom))", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", animation: "fwSheetIn .3s cubic-bezier(.32,.72,.24,1) both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted }}>Jump to</span>
              <button onClick={() => setJumpOpen(false)} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {CATS.map((c, i) => (
                <button key={c.key} onClick={() => jumpTo(i)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${SAGE}`, borderRadius: 13, padding: "11px 12px", cursor: "pointer" }}>
                  {ICON_DISC(c.Icon, SAGE)}
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, ...CLAMP(1) }}>{c.section}</span>
                    <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, ...CLAMP(1) }}>{c.tag}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportCard({ card, uid, included, onToggle }) {
  const a = SAGE;
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W, position: "relative", overflow: "hidden",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${a}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${a}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 408,
      boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
    }}>
      <Frame4 variant="sprig" color={a} size={46} opacity={0.6} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          {ICON_DISC(card.Icon, a)}
          <Eyebrow color={a}>{card.tag || card.section}</Eyebrow>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={card.flower || "primrose"} size={30} color={a} idx={`mb-${card.key}`} /></span>
        </div>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...CLAMP(3) }}>{card.hook}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(5) }}>{card.line}</p>
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          {card.compose ? <GpNoteAction uid={uid} accent={a} /> : <IncludeToggle included={included} onToggle={onToggle} accent={a} />}
          <a href="/DoctorExport" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
            Open the export builder <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function IncludeToggle({ included, onToggle, accent }) {
  return (
    <button onClick={onToggle} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box",
      background: included ? accent : "transparent", color: included ? "#fff" : accent,
      border: `1.5px solid ${accent}`, borderRadius: 12, padding: "12px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer",
    }}>
      {included ? <><Check size={16} strokeWidth={3} /> Included in your export</> : <><Plus size={16} strokeWidth={2.5} /> Add to your export</>}
    </button>
  );
}

function GpNoteAction({ uid, accent }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const can = text.trim().length > 0 && !done;
  const post = () => {
    if (!can) return; setDone(true);
    if (uid) base44.entities.JournalEntries.create({ user_id: uid, session_date: todayKey(), text: text.trim(), tags: ["gp-note"], prompt: "To raise with my GP", card_type: "free", card_color: "cream" }).catch(() => {});
  };
  if (done) return (
    <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "12px 13px", animation: "fwFadeUp .3s ease both" }}>
      <span style={{ width: 30, height: 30, borderRadius: 99, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
      <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>Saved to the top of your summary.</span>
    </div>
  );
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={400} placeholder="e.g. The headaches before my period have got worse since…"
        style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={post} disabled={!can} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: can ? "pointer" : "default", opacity: can ? 1 : 0.55 }}>
        <Send size={15} /> Save this note
      </button>
    </div>
  );
}

function navBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}
