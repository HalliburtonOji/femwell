// Kindred — Track C board #3 (whole-life domain: connection — friendship, family, romantic
// love, and community/belonging, served as EQUALS). Romance is NOT the default or the goal;
// a single woman is never a deficiency; loneliness is met with WARMTH, never "try harder".
//
// RESEARCHED brainstorm: claude-state/TRACKC_KINDRED_BRAINSTORM.html (cited). Content MEASURED
// per-section first (scratchpad/b44proj/measure_kindred + kinfill): friendship 98 · family 175 ·
// love 228 · belonging 77 · POSITIVE solitude only 4 → solitude is EDITORIAL, never a starved
// shelf. Romance is the content bulk, so "equals" is enforced by DESIGN: friendship leads,
// romance sits mid-board. No new entity/function — self-loads real LifestyleItems + phase.
//
// TONE DENIES (this domain's diet-culture): pick-me / "keep a man", dating game-playing,
// coupledom-as-default, pathologising normal friendship drift, moralising estrangement.
// Reach-out prompts are REASSURANCE only (people are happier to hear from you than you'd
// guess — Liu 2022), never homework/streak, and NEVER shown when she chose solitude.
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users, Home, Heart, HandHeart, Leaf, MessageCircle, Feather, Moon, CalendarHeart, Sparkles } from "lucide-react";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { CoverCard, ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { createPageUrl } from "@/utils";

const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 6) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || "")) || /between us|tide|orchard|salt|shape of (staying|bloom)|shadow|wild green/i.test(r.title || "");

// kept as a guard even though live content measured clean (0 hits) — new ingests could carry it
const DENY = ["keep a man", "keep him", "keep your man", "how to get a man", "make him", "get him back", "high value", "high-value", "pick me", "pick-me", "manifest a man", "trap him", "wife him", "boyfriend material", "play hard to get", "make him chase", "make him jealous", "leave him on read", "mind games", "how to be irresistible", "land a man", "why you're still single", "cure for loneliness", "sigma", "alpha male", "feminine energy to attract"];

const CONN = ["friendship", "friend", "family", "loneli", "lonely", "belong", "dating", "marriage", "divorce", "breakup", "partner", "connection", "estrange", "solitude", "alone", "mother", "sister", "attachment", "desire", "couple", "caregiv", "neighbour", "community"];

// what's your heart asking for — spans ALL connection types, incl. solitude as first-class.
// "solitude" gives a warm editorial answer and suppresses any reach-out nudge.
const HEART = [
  { key: "friend", label: "A friend", Icon: Users, cw: "gold", kws: ["friendship", "best friend", "female friendship", "making friends", "friend breakup"], line: "Friendship is first-class here — not the runner-up to romance. Reach for a friend today.", nudge: true },
  { key: "family", label: "Family", Icon: Home, cw: "sage", kws: ["family", "mother", "sister", "daughter", "parent", "sibling", "caregiv", "estrange", "grandmother"], line: "Family is complicated for most of us. Closeness, distance, and everything between are all allowed.", nudge: false },
  { key: "love", label: "Love", Icon: Heart, cw: "crimson", kws: ["dating", "marriage", "partner", "romantic", "attachment", "desire", "couple", "breakup"], line: "Love, honestly — attachment and desire, not tactics. However yours looks right now.", nudge: false },
  { key: "belong", label: "To belong", Icon: HandHeart, cw: "plum", kws: ["loneli", "lonely", "belong", "community", "neighbour", "gathering", "isolat"], line: "Wanting to belong is one of the most human things there is. You're not the only one feeling it — the young feel it most of all.", nudge: true },
  { key: "solitude", label: "Just solitude", Icon: Leaf, cw: "lavender", kws: [], line: "Then solitude it is — and that's not a lesser answer. Being good company for yourself is its own kind of full. Nothing to reach for today.", nudge: false },
];

// honest, cited notes — permission, never pressure
const REACH_OUT = "One small, evidence-backed thing: people are happier to hear from you than you'd ever guess — someone measured it. No pressure. But maybe text them.";

export default function Kindred() {
  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [heart, setHeart] = useState(HEART[0]);
  const [expanded, setExpanded] = useState(null);
  const crimson = cwOf("crimson").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500).catch(() => []);
        if (alive) setItems(Array.isArray(rows) ? rows : []);
      } catch { /* graceful */ }
      try {
        const u = await base44.auth.me().catch(() => null);
        if (u?.id) {
          const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          const p = pickProfile(profs);
          if (alive && p) {
            const cyc = computeCycleDay(p);
            if (cyc.hasCycle) setPhase(cyc.phase);
            const nm = String(p.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
            if (!/\d/.test(nm) && nm.length <= 16) setFirstName(nm ? nm[0].toUpperCase() + nm.slice(1) : "");
          }
        }
      } catch { /* anon */ }
    })();
    return () => { alive = false; };
  }, []);

  const pools = useMemo(() => {
    const conn = items.filter((r) => !isFiction(r) && !hasAny(r, DENY) && (["Relationships", "Sex Education"].includes(r.category) || hasAny(r, CONN)));
    const friendship = conn.filter((r) => hasAny(r, ["friendship", "best friend", "female friendship", "making friends", "friend breakup"]) && !["Fitness", "Beauty", "Food"].includes(r.category));
    const family = conn.filter((r) => hasAny(r, ["family", "mother", "sister", "daughter", "parent", "sibling", "in-law", "estrange", "caregiv", "stepchild", "grandmother", "grandfather"]));
    const love = conn.filter((r) => r.category === "Relationships" || r.category === "Sex Education" || hasAny(r, ["dating", "marriage", "partner", "romantic", "attachment", "desire", "couple"]));
    const belonging = conn.filter((r) => hasAny(r, ["loneli", "lonely", "belong", "isolat", "community", "neighbour", "gathering"]));
    return { conn, friendship, family, love, belonging };
  }, [items]);

  const toCard = useCallback((r, cw) => ({
    id: r.id,
    title: decodeEntities(r.title || ""),
    subtitle: r.source_name || r.channel_name || r.subtitle || "",
    summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    category: r.category || "Relationships", cw, Icon: "Heart", kind: "Read · Kindred",
    meta: [["Clock", r.duration_label || "a few minutes"]],
  }), []);

  const heartPicks = useMemo(() => {
    if (heart.key === "solitude") return [];
    const matches = pools.conn.filter((r) => hasAny(r, heart.kws));
    const src = matches.length >= 2 ? matches : pools.conn;
    return rotateDaily(src, 4).map((r) => toCard(r, heart.cw));
  }, [pools.conn, heart, toCard]);

  const friendshipCards = useMemo(() => rotateDaily(pools.friendship, 6).map((r) => toCard(r, "gold")), [pools.friendship, toCard]);
  const familyCards = useMemo(() => rotateDaily(pools.family, 6).map((r) => toCard(r, "sage")), [pools.family, toCard]);
  const loveCards = useMemo(() => rotateDaily(pools.love, 6).map((r) => toCard(r, "crimson")), [pools.love, toCard]);
  const belongingCards = useMemo(() => rotateDaily(pools.belonging, 6).map((r) => toCard(r, "plum")), [pools.belonging, toCard]);

  const summaryRows = useMemo(() => [
    { Icon: Users, label: "Today", text: firstName ? `${firstName}, what's your heart asking for? Pick below — a friend, family, love, to belong, or just solitude.` : "What's your heart asking for today? Pick below — a friend, family, love, to belong, or just solitude." },
    { Icon: HandHeart, label: "The whole truth", text: "Friendship, family, love and belonging are equals here. Single, partnered, estranged or happily alone — you're not lesser, and you're not the only one." },
    phase === "luteal" ? { Icon: Moon, label: "This week", text: "Luteal week can make everything with people feel sharper — the closeness and the friction both. Be gentle with what you read into things." } : { Icon: Sparkles, label: "A gentle reminder", text: "Connection quality beats quantity — the long study is clear. You never have to count your friends." },
  ], [firstName, phase]);

  const Section = ({ Icon, title, sub, accent, children }) => (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 4px" }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: `${accent}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} color={accent} /></span>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD }}>{title}</div>
      </div>
      {sub && <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 2px 12px" }}>{sub}</p>}
      {children}
    </section>
  );

  const Shelf = ({ cards, empty }) => (
    cards.length ? (
      <div className="fw-kin-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none" }}>
        <style>{`.fw-kin-shelf::-webkit-scrollbar{display:none}`}</style>
        {cards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 366 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
      </div>
    ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>{empty}</p>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Kindred" line="Friendship, family, love and belonging — held as equals. However you're connected today, you belong here."
          colorway="crimson" bloom="peony" flankL="rose" flankR="primrose" titleColor={OXBLOOD} creature="butterfly" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Your people today" accent={crimson} rows={summaryRows} /></div>

        {/* A · WHAT'S YOUR HEART ASKING FOR — the return hook; solitude is first-class */}
        <Section Icon={Heart} title="What's your heart asking for?" accent={cwOf(heart.cw).petal}
          sub="Not who you 'should' call — what you actually need today. Every answer is equal, including being alone.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {HEART.map((h) => { const on = h.key === heart.key; const c = cwOf(h.cw).petal; return (
              <button key={h.key} onClick={() => setHeart(h)} className="fw-elite-press"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? c : `${c}14`, border: `1px solid ${on ? c : c + "55"}`, color: on ? "#fff" : c, fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <h.Icon size={14} /> {h.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{heart.line}</p>
          {heart.key === "solitude" ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("lavender").petal}`, borderRadius: 14, padding: "14px 16px" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("lavender").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Leaf size={17} color={cwOf("lavender").petal} /></span>
              <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>A slow coffee, a walk with no one, a book and the door shut. Solitude you choose is rest, not loneliness — enjoy your own company today.</span>
            </div>
          ) : (
            <>
              <Shelf cards={heartPicks} empty="Reads land here as the library fills out." />
              {heart.nudge && <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, lineHeight: 1.5, margin: "10px 2px 0", fontStyle: "italic" }}>{REACH_OUT}</p>}
            </>
          )}
        </Section>

        {/* B · FRIENDSHIP — deliberately FIRST, decentring romance */}
        <Section Icon={Users} title="Friends" accent={cwOf("gold").petal}
          sub="The great underrated love story. Making them as an adult, keeping them, and the ache when one drifts — normal, not a failure.">
          <Shelf cards={friendshipCards} empty="Friendship reads land here as the library fills out." />
        </Section>

        {/* C · FAMILY — closeness AND distance both validated, no moralising */}
        <Section Icon={Home} title="Family" accent={cwOf("sage").petal}
          sub="The people you were given. Bonds worth keeping, and the ones you're allowed to hold at a distance — no guilt required.">
          <Shelf cards={familyCards} empty="Family reads land here as the library fills out." />
        </Section>

        {/* D · LOVE — mid-board on purpose; attachment-literate, never tactical */}
        <Section Icon={Heart} title="Love & partnership" accent={crimson}
          sub="The honest kind — attachment, desire, the long middle of it, and its endings. No games, no 'how to keep him'.">
          <Shelf cards={loveCards} empty="Love reads land here as the library fills out." />
        </Section>

        {/* E · BELONGING — loneliness met with warmth */}
        <Section Icon={HandHeart} title="Belonging" accent={cwOf("plum").petal}
          sub="Wanting to be part of something is human, and loneliness is not a personal failing — a third of us feel it, the young most of all. Gently, then.">
          <Shelf cards={belongingCards} empty="Belonging reads land here as the library fills out." />
        </Section>

        {/* F · CARRY IT ON — Jess as the 11pm companion is the most important wiring */}
        <Section Icon={MessageCircle} title="Carry it on" accent={cwOf("gold").petal} sub="Kindred doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: Sparkles, cw: "crimson", label: "Lonely tonight? Jess is up.", sub: "The 11pm no-one-to-text feeling — she's a real companion for exactly that.", href: createPageUrl("Jess") },
              { Icon: MessageCircle, cw: "plum", label: "The rooms in Community", sub: "Friendship, love and a quiet 'lonely tonight' space — all held as equals.", href: createPageUrl("Community") },
              { Icon: Feather, cw: "sage", label: "Write it out in your Journal", sub: "The thing you can't say to them yet — say it here first.", href: createPageUrl("Journal") },
              { Icon: CalendarHeart, cw: "gold", label: "Find people in Events", sub: "Somewhere to actually go — meeting people beats reading about it.", href: createPageUrl("Events") },
            ].map((r) => {
              const c = cwOf(r.cw).petal;
              return (
                <a key={r.label} href={r.href} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`, borderRadius: 13, padding: "11px 13px", cursor: "pointer", textDecoration: "none" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: `${c}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={16} color={c} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{r.label}</span>
                    <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>{r.sub}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </Section>

        <div style={{ textAlign: "center", margin: "28px 0 0" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, maxWidth: 340, lineHeight: 1.55, margin: "0 auto" }}>
            You can be single, partnered, surrounded or on your own tonight, and be exactly enough. Connection is a garden, not a checklist.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
