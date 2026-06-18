// ProfileDemo — a redesign DEMO of the Profile page. PREVIEW route only (/ProfileDemo). LIVE /Profile
// UNTOUCHED. Conforms to BRAND_IDENTITY.md (Profile flora character = blush/gold + camellia).
//
// DISTINCT FORM (deliberately NOT a card-slider, and NOT the Health letters list): a "MEMBERSHIP CARD +
// BENTO GRID". A horizontal IDENTITY CARD up top (fingerprint bloom + name + stage + a small stat strip),
// then a wide FLORA-FINGERPRINT banner, an INTENTIONS tile with an inline write, and a 2-column BENTO
// GRID of life areas (cycle · partner · saved · preferences · privacy · details). Brand held constant.

import { useState, useEffect, useMemo } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { floraKeyframes, RichBloomV2, FlowerGlyph, Butterfly, fingerprintColourway } from "@/components/brand/flora";
import { Loader, PageVines, JumpPill, JumpSheet, DoneRow, btnStyle, DEMO_CSS, CLAMP, withTimeout, todayKey } from "@/components/demos/demoKit";
import {
  UserRound, Settings, CalendarHeart, Users, Bookmark, ShieldCheck, Sprout, Target, Send, ChevronRight,
} from "lucide-react";
import { useRef } from "react";

const COL = 460;

const TILES = [
  { key: "details", label: "Your details", sub: "Name · birthday · stage", Icon: UserRound, href: "/Settings", accent: "#A8893F", flower: "camellia" },
  { key: "cycle", label: "Your cycle", sub: "Dates & average length", Icon: CalendarHeart, href: "/CycleSettings", accent: "#8E6E8E", flower: "iris" },
  { key: "people", label: "Your people", sub: "Partner sync — you choose what shows", Icon: Users, href: "/PartnerSync", accent: "#E8B4B8", flower: "rose" },
  { key: "saved", label: "Saved", sub: "Everything you've kept", Icon: Bookmark, href: "/Saved", accent: "#A8893F", flower: "violet" },
  { key: "prefs", label: "Preferences", sub: "Tone · notifications · Jess", Icon: Settings, href: "/Settings", accent: "#8E6E8E", flower: "lavender" },
  { key: "privacy", label: "Privacy & data", sub: "Anonymous · private · yours", Icon: ShieldCheck, href: "/Privacy", accent: "#8FAF8F", flower: "cornflower" },
];
const SECTIONS = [
  { key: "id", label: "Who you are", Icon: UserRound, accent: "#A8893F" },
  { key: "garden", label: "Your garden", Icon: Sprout, accent: "#8FAF8F" },
  { key: "intentions", label: "Intentions", Icon: Target, accent: "#A8893F" },
  { key: "areas", label: "Your areas", Icon: Settings, accent: "#8E6E8E" },
];

export default function ProfileDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const refs = { id: useRef(null), garden: useRef(null), intentions: useRef(null), areas: useRef(null) };

  useEffect(() => {
    let alive = true;
    (async () => {
      const m = await withTimeout(base44.auth.me()); if (!alive) return; setMe(m); setUid(m?.id || null);
      if (!m?.id) { setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: m.id }));
      if (!alive) return; setProfile((profs || []).filter(Boolean)[0] || null); setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const name = useMemo(() => profileName(profile, me), [profile, me]);
  const stage = profile?.life_stage || null;
  const goals = Array.isArray(profile?.goals) ? profile.goals.filter(Boolean) : [];
  const cw = useMemo(() => fingerprintColourway(uid || "femwell"), [uid]);
  const memberSince = useMemo(() => { const d = me?.created_date || profile?.created_date; if (!d) return null; try { return new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }); } catch { return null; } }, [me, profile]);

  const stats = [
    hasCycle && { label: "Cycle day", value: String(cycle.cycleDay) },
    { label: "Intentions", value: String(goals.length) },
    memberSince && { label: "Member since", value: memberSince },
  ].filter(Boolean);

  const jumpTo = (k) => { setJumpOpen(false); refs[k]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={cw.petal} b={T.gold} />
      <JumpPill onClick={() => setJumpOpen(true)} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        <div ref={refs.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 2px 10px" }}>
          <Heart size={16} /><Eyebrow color={T.muted}>Your profile</Eyebrow>
        </div>

        {/* IDENTITY CARD — horizontal membership card */}
        <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${T.paperHi} 0%, ${cw.petal}1A 100%)`, border: `1px solid ${T.paperDeep}`, borderRadius: 22, padding: "18px 18px 16px", boxShadow: "0 6px 24px rgba(58,44,26,0.14)" }}>
          <div style={{ position: "absolute", top: 6, right: 10 }}><Butterfly size={40} color={cw.petal} color2={T.gold} pattern="tips" idx="pf-bf" /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", width: 104, height: 104, flexShrink: 0, display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 120 120" width={104} height={104} aria-hidden style={{ position: "absolute", inset: 0 }}><circle cx="60" cy="60" r="52" fill="none" stroke={cw.petal} strokeWidth="2" strokeDasharray="2 8" opacity="0.55" /></svg>
              <RichBloomV2 form="peony" color={cw.petal} color2={cw.tip} accent={T.gold} size={84} animate soft idx="pf-hero" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Script size={40} color={T.ink} style={{ ...CLAMP(1) }}>{name || "Profile"}</Script>
              {stage && <span style={{ display: "inline-block", marginTop: 4, fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: cw.petal, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>{prettyStage(stage)}</span>}
            </div>
          </div>
          {stats.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {stats.map((s) => (
                <div key={s.label} style={{ flex: 1, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 10px", textAlign: "center" }}>
                  <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, ...CLAMP(1) }}>{s.value}</div>
                  <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginTop: 2, ...CLAMP(1) }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "12px 2px 6px", lineHeight: 1.5 }}>
          Not a settings list — this is you. The life you're tending, and the garden that grows from it.
        </Hand>

        {/* FLORA FINGERPRINT BANNER */}
        <div ref={refs.garden} style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.sage}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 18, padding: "14px 16px", margin: "16px 0 0", boxShadow: "0 4px 18px rgba(58,44,26,0.10)", scrollMarginTop: 70 }}>
          <RichBloomV2 form="peony" color={cw.petal} color2={cw.tip} accent={T.gold} size={76} animate soft idx="pf-fp" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <Eyebrow color={T.sage}>Your flora fingerprint</Eyebrow>
            <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.45, margin: "4px 0 8px", ...CLAMP(3) }}>Seeded from who you are and what you tend, your garden grows {cw.label.toLowerCase()} — {cw.meaning}. No two are alike.</p>
            <a href="/Garden" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.sage, textDecoration: "none" }}>Visit your garden <ChevronRight size={14} /></a>
          </div>
        </div>

        {/* INTENTIONS — wide tile with inline write */}
        <div ref={refs.intentions} style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.gold}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 18, padding: "16px", margin: "12px 0 0", boxShadow: "0 4px 18px rgba(58,44,26,0.10)", scrollMarginTop: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Target size={15} color={T.gold} /></span>
            <Eyebrow color={T.gold}>What you're working toward</Eyebrow>
            <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="sunflower" size={28} color={T.gold} idx="pf-int" /></span>
          </div>
          {goals.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 11 }}>
              {goals.slice(0, 4).map((g, i) => <span key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 12px", ...CLAMP(1) }}>{g}</span>)}
            </div>
          )}
          <IntentionAction uid={uid} accent={T.gold} />
        </div>

        {/* BENTO GRID of life areas */}
        <div ref={refs.areas} style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 12px", scrollMarginTop: 70 }}>
          <Eyebrow color={T.muted}>Your areas</Eyebrow>
          <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.7 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {TILES.map((t) => (
            <a key={t.key} href={t.href} style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8, minHeight: 124, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${t.accent}12 100%)`, border: `1px solid ${T.paperDeep}`, borderTop: `3px solid ${t.accent}`, borderRadius: 16, padding: "14px 14px", textDecoration: "none", boxShadow: "0 2px 12px rgba(58,44,26,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><t.Icon size={17} color={t.accent} /></span>
                <FlowerGlyph variant={t.flower} size={26} color={t.accent} idx={`pf-t-${t.key}`} />
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.2, ...CLAMP(1) }}>{t.label}</div>
                <div style={{ fontFamily: UI, fontSize: 13, color: T.muted, marginTop: 2, ...CLAMP(2) }}>{t.sub}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {jumpOpen && <JumpSheet sections={SECTIONS} onClose={() => setJumpOpen(false)} onPick={(k) => jumpTo(k)} />}
    </div>
  );
}

function IntentionAction({ uid, accent }) {
  const [text, setText] = useState(""); const [done, setDone] = useState(false);
  const can = text.trim().length > 0 && !done;
  const post = () => { if (!can) return; setDone(true); if (uid) base44.entities.JournalEntries.create({ user_id: uid, session_date: todayKey(), text: text.trim(), tags: ["intention"], prompt: "An intention, from Profile", card_type: "free", card_color: "cream" }).catch(() => {}); };
  if (done) return <DoneRow accent={accent} label="Held. Your days will lean toward it." />;
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={400} placeholder="This season, I want to…" style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={post} disabled={!can} style={btnStyle(accent, !can)}><Send size={15} /> Set an intention</button>
    </div>
  );
}

function profileName(profile, me) {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const n = profile?.first_name || profile?.preferred_name || profile?.name || (me?.full_name ? String(me.full_name).split(" ")[0] : null) || (me?.email ? String(me.email).split("@")[0].replace(/[._].*$/, "") : null);
  return n && n.length <= 18 ? cap(n) : "";
}
function prettyStage(s) {
  const map = { teen: "Teen years", reproductive: "Reproductive years", "pre-ttc": "Before trying", ttc: "Trying to conceive", "pregnant-t1": "Pregnancy · T1", "pregnant-t2": "Pregnancy · T2", "pregnant-t3": "Pregnancy · T3", postpartum: "Postpartum", perimenopause: "Perimenopause", menopause: "Menopause", "post-menopause": "Post-menopause" };
  return map[s] || "Your life stage";
}
