// ProfileDemo — "This is you, and the life you're tending" — a redesign DEMO of the Profile page that
// adapts the TODAY / JOURNAL / COMMUNITY bar to Profile's purpose: identity & self-expression, not a
// settings list. PREVIEW route only (/ProfileDemo, via IDEAS → Previews). LIVE /Profile UNTOUCHED.
// Conforms to claude-state/BRAND_IDENTITY.md (Profile flora character §5.3 = blush/gold + camellia + butterfly).
//
// THE SHAPE: 1) HERO — her FLORA FINGERPRINT bloom (deterministic per-user signature, §5.2) resting in
// a soft ring + a resting butterfly (transformation/return) + carved heart + Ephesis title (her name).
// 2) SUMMARY — "This is you today": name · life stage · member-since · what she's working toward (real
// goals), with quick rows. 3) PER-SECTION CardStack — one card per Profile surface, spanning life
// (you · goals · cycle · garden · your people · saved · preferences · privacy) with an inline intention
// write OR a SPECIFIC deep-link. 4) Central Jump-to sheet + segmented rail.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  RichBloomV2, floraKeyframes, CardCorner, VineMotifV2, FlowerGlyph, Butterfly, fingerprintColourway,
} from "@/components/brand/flora";
import {
  Sparkles, Target, ChevronRight, ChevronLeft, Check, Settings, CalendarHeart, Sprout, Users,
  Bookmark, ShieldCheck, UserRound, Grid2x2, X, PenLine, Send,
} from "lucide-react";

const COL = 430;
const CARD_W = 365;
const GAP = 14;

const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function Frame4({ variant = "sprig", color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
export default function ProfileDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const m = await withTimeout(base44.auth.me());
      if (!alive) return;
      setMe(m); setUid(m?.id || null);
      if (!m?.id) { setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: m.id }));
      if (!alive) return;
      setProfile((profs || []).filter(Boolean)[0] || null);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const name = useMemo(() => profileName(profile, me), [profile, me]);
  const stage = profile?.life_stage || null;
  const goals = Array.isArray(profile?.goals) ? profile.goals.filter(Boolean) : [];
  const cw = useMemo(() => fingerprintColourway(uid || "femwell"), [uid]);
  const memberSince = useMemo(() => {
    const d = me?.created_date || profile?.created_date;
    if (!d) return null;
    try { return new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }); } catch { return null; }
  }, [me, profile]);

  const summaryLine = `${name ? `${name}, this` : "This"} is the version of you FemWell holds${stage ? ` — ${prettyStage(stage).toLowerCase()}` : ""}${memberSince ? `, tending this garden since ${memberSince}` : ""}. ${goals.length ? `You're working toward ${goals.slice(0, 2).join(" and ")}.` : "Set an intention below and the whole app leans toward it."}`;

  const CARDS = [
    {
      key: "you", section: "You", accent: cw.petal, Icon: UserRound, flower: "camellia",
      tag: "Your details", hook: name ? `${name}` : "Your details",
      line: `${stage ? prettyStage(stage) : "Your life stage"}${memberSince ? ` · with FemWell since ${memberSince}` : ""}. Name, birthday, life stage — the basics that shape everything else.`,
      action: { type: "deeplink", Icon: Settings, label: "Edit your details", href: "/Settings" },
      open: { href: "/Settings", label: "Open settings" },
    },
    {
      key: "goals", section: "Intentions", accent: T.gold, Icon: Target, flower: "sunflower",
      tag: "What you're working toward",
      hook: goals.length ? goals[0] : "What matters to you right now?",
      line: goals.length > 1 ? `And ${goals.slice(1, 3).join(", ")}. Name another and your days quietly tilt toward it.` : "An intention isn't a target to hit — it's a direction to lean. Leave one here.",
      action: { type: "intention", Icon: PenLine, label: "Set an intention", placeholder: "This season, I want to…", doneLabel: "Held. Your days will lean toward it." },
      open: { href: "/Profile", label: "Open your profile" },
    },
    {
      key: "cycle", section: "Cycle", accent: "#8E6E8E", Icon: CalendarHeart, flower: "iris",
      tag: "Your cycle",
      hook: hasCycle ? `Day ${cycle.cycleDay} · ${PHASE_LABEL[cycle.phase]}` : "Set your cycle",
      line: hasCycle ? `Average ${profile?.cycle_avg_length || 28}-day cycle. Update your dates any time — the whole app re-tunes to you.` : "Tell me your last period and FemWell shapes itself around where you are.",
      action: { type: "deeplink", Icon: Settings, label: hasCycle ? "Update your cycle" : "Set your cycle", href: "/CycleSettings" },
      open: { href: "/CycleSettings", label: "Cycle settings" },
    },
    {
      key: "garden", section: "Your garden", accent: T.sage, Icon: Sprout, flower: "primrose",
      tag: "Your flora fingerprint",
      hook: "A garden that's only yours",
      line: `Seeded from who you are and what you tend, your garden grows ${cw.label.toLowerCase()} — ${cw.meaning}. No two are alike.`,
      bloom: true,
      action: { type: "deeplink", Icon: Sprout, label: "Visit your garden", href: "/Garden" },
      open: { href: "/Garden", label: "Open your garden" },
    },
    {
      key: "people", section: "Your people", accent: T.blush, Icon: Users, flower: "rose",
      tag: "Your people",
      hook: "Share the parts you choose",
      line: "Sync a partner so they understand your week — you decide exactly what they see, and what stays yours.",
      action: { type: "deeplink", Icon: Users, label: "Partner sync", href: "/PartnerSync" },
      open: { href: "/PartnerSync", label: "Partner sync" },
    },
    {
      key: "saved", section: "Saved", accent: T.gold, Icon: Bookmark, flower: "violet",
      tag: "Kept for later",
      hook: "Everything you've saved",
      line: "Articles, recipes, episodes, lines from the room — the things you wanted to come back to, in one place.",
      action: { type: "deeplink", Icon: Bookmark, label: "Open your saved", href: "/Saved" },
      open: { href: "/Saved", label: "Saved" },
    },
    {
      key: "prefs", section: "Preferences", accent: "#8E6E8E", Icon: Sparkles, flower: "lavender",
      tag: "How FemWell feels",
      hook: profile?.ai_assistant_name ? `Jess answers to "${profile.ai_assistant_name}"` : "Make it feel like yours",
      line: "Notifications, tone of voice, what Jess is called, what shows on your home — tune the feel.",
      action: { type: "deeplink", Icon: Settings, label: "Open preferences", href: "/Settings" },
      open: { href: "/Settings", label: "Preferences" },
    },
    {
      key: "privacy", section: "Privacy", accent: T.sage, Icon: ShieldCheck, flower: "cornflower",
      tag: "Privacy & your data",
      hook: "Your data is yours",
      line: "Anonymous in the community, private by default. See what's stored, export it for your GP, or take it with you.",
      action: { type: "deeplink", Icon: ShieldCheck, label: "Privacy & data", href: "/Privacy" },
      open: { href: "/Privacy", label: "Privacy" },
    },
  ];

  const trackRef = useRef(null);
  const sliderTopRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = CARDS.length - 1;
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
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.pd-track{scrollbar-width:none}.pd-track::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>

      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 150, right: -26 }}><VineMotifV2 color={cw.petal} color2={T.gold} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 820, left: -28 }}><VineMotifV2 color={T.gold} color2={cw.petal} opacity={0.08} w={140} flip /></div>
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
            <UserRound size={13} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>Your profile</span>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "2px 0 2px" }}>
            <div style={{ position: "relative", width: 196, height: 196, display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 200 200" width={196} height={196} aria-hidden style={{ position: "absolute", inset: 0 }}>
                <circle cx="100" cy="100" r="84" fill="none" stroke={cw.petal} strokeWidth="2.5" strokeDasharray="2 8" opacity="0.5" />
                <circle cx="100" cy="100" r="74" fill="none" stroke={T.gold} strokeWidth="1.2" opacity="0.35" />
              </svg>
              <RichBloomV2 form="peony" color={cw.petal} color2={cw.tip} accent={T.gold} size={130} animate soft idx="profile-hero" />
            </div>
            <div style={{ position: "absolute", top: 6, right: 30 }}><Butterfly size={42} color={cw.petal} color2={T.gold} pattern="tips" idx="profile-bf" /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
            <Heart size={17} />
            <Script size={46} color={T.ink}>{name || "Profile"}</Script>
          </div>
          {stage && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: cw.petal, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>{prettyStage(stage)}</span>
            </div>
          )}
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 12, lineHeight: 1.5 }}>
            Not a settings list — this is you. The life you're tending, and the garden that grows from it.
          </Hand>
        </header>

        {/* SUMMARY */}
        <div style={{ padding: "10px 18px 4px" }}>
          <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${cw.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${cw.petal}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
            <Frame4 variant="sprig" color={cw.petal} size={42} opacity={0.5} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                {ICON_DISC(Sparkles, cw.petal)}
                <Eyebrow color={cw.petal}>This is you today</Eyebrow>
                <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="camellia" size={30} color={cw.petal} color2={cw.tip} idx="psum-mb" /></span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px", ...CLAMP(5) }}>{summaryLine}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <SummaryChip Icon={Target} label="Set an intention" onClick={() => jumpTo(1)} accent={T.gold} />
                <SummaryChip Icon={Sprout} label="Your garden" onClick={() => jumpTo(3)} accent={T.sage} />
                <SummaryChip Icon={Settings} label="Edit details" onClick={() => jumpTo(0)} accent={cw.petal} />
              </div>
            </div>
          </div>
        </div>

        {/* segmented rail */}
        <div ref={sliderTopRef} className="pd-track" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 18px 12px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c, i) => (
            <button key={c.key} onClick={() => goTo(i)} style={{
              flex: "none", background: i === active ? c.accent : "transparent", color: i === active ? T.paper : T.muted,
              border: `1px solid ${i === active ? c.accent : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}><c.Icon size={13} /> {c.section}</button>
          ))}
        </div>

        {/* slider */}
        <div ref={trackRef} className="pd-track" style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c) => (
            <ProfileCard key={c.key} card={c} uid={uid} cw={cw} />
          ))}
          <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
          <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous section" style={navBtn(active === 0)}><ChevronLeft size={18} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {CARDS.map((c, i) => (
              <button key={c.key} onClick={() => goTo(i)} aria-label={c.section} style={{
                width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                background: i === active ? c.accent : T.paperDeep, cursor: "pointer", transition: "width .2s",
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
              {CARDS.map((c, i) => (
                <button key={c.key} onClick={() => jumpTo(i)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c.accent}`, borderRadius: 13, padding: "11px 12px", cursor: "pointer" }}>
                  {ICON_DISC(c.Icon, c.accent)}
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

function SummaryChip({ Icon, label, onClick, accent }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 999, padding: "7px 13px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, cursor: "pointer" }}>
      <Icon size={14} color={accent} /> {label}
    </button>
  );
}

function ProfileCard({ card, uid, cw }) {
  const a = card.accent;
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W, position: "relative", overflow: "hidden",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${a}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${a}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 430,
      boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
    }}>
      <Frame4 variant="sprig" color={a} size={46} opacity={0.6} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          {ICON_DISC(card.Icon, a)}
          <Eyebrow color={a}>{card.tag || card.section}</Eyebrow>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={card.flower || "camellia"} size={30} color={a} idx={`mb-${card.key}`} /></span>
        </div>
        {card.bloom && (
          <div style={{ display: "flex", justifyContent: "center", margin: "0 0 6px" }}>
            <RichBloomV2 form="peony" color={cw.petal} color2={cw.tip} accent={T.gold} size={104} animate soft idx="profile-card-bloom" />
          </div>
        )}
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...CLAMP(3) }}>{card.hook}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(5) }}>{card.line}</p>
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          <InlineAction action={card.action} accent={a} uid={uid} />
          <a href={card.open.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
            {card.open.label} <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function btnStyle(accent, disabled) {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, textDecoration: "none" };
}
function InlineAction({ action, accent, uid }) {
  const { type } = action || {};
  if (type === "deeplink") { const A = action.Icon || ChevronRight; return <a href={action.href} style={btnStyle(accent)}><A size={15} /> {action.label}</a>; }
  if (type === "intention") return <IntentionAction action={action} accent={accent} uid={uid} />;
  return null;
}

function IntentionAction({ action, accent, uid }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const can = text.trim().length > 0 && !done;
  const post = () => {
    if (!can) return; setDone(true);
    if (uid) base44.entities.JournalEntries.create({ user_id: uid, session_date: todayKey(), text: text.trim(), tags: ["intention"], prompt: "An intention, from Profile", card_type: "free", card_color: "cream" }).catch(() => {});
  };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Held."} />;
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={400} placeholder={action.placeholder}
        style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={post} disabled={!can} style={btnStyle(accent, !can)}><Send size={15} /> {action.label}</button>
    </div>
  );
}

function DoneRow({ accent, label }) {
  return (
    <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "12px 13px", animation: "fwFadeUp .3s ease both" }}>
      <span style={{ width: 30, height: 30, borderRadius: 99, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
      <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

function profileName(profile, me) {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const n = profile?.first_name || profile?.preferred_name || profile?.name
    || (me?.full_name ? String(me.full_name).split(" ")[0] : null)
    || (me?.email ? String(me.email).split("@")[0].replace(/[._].*$/, "") : null);
  return n && n.length <= 18 ? cap(n) : "";
}
function prettyStage(s) {
  const map = {
    teen: "Teen years", reproductive: "Reproductive years", "pre-ttc": "Before trying", ttc: "Trying to conceive",
    "pregnant-t1": "Pregnancy · first trimester", "pregnant-t2": "Pregnancy · second trimester", "pregnant-t3": "Pregnancy · third trimester",
    postpartum: "Postpartum", perimenopause: "Perimenopause", menopause: "Menopause", "post-menopause": "Post-menopause",
  };
  return map[s] || "Your life stage";
}
function navBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}
