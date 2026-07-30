// Money — Track C board #11 ("Money, gently"). Money as an EMOTIONAL, human thing, met with
// kindness — never shame, never "you should be saving more", never girlboss/hustle-finance,
// never investment advice. A soft, un-anxious corner for a subject that's usually all fear.
//
// DECISION (Halli, 2026-07-23): QUALITATIVE only — reuse the EXISTING `Goal` entity with
// `domain:"Money"` for a gentle money-intention; NO new entity, and NO amount-tracking (which
// would import the exact anxiety/optimisation tone Track C has firewalled throughout). Verified
// before building: Goal.domain is a FREE STRING (no new field needed); "Money" is already in
// GrowthLive's DOMAINS, so a kept intention appears correctly in her goals garden.
//
// Content MEASURED thin (~10 genuine gentle-finance items; the rest is business/shopping/cycle-
// work pollution) → LEAN like Nest: an editorial money-ritual spine + a small real shelf + a
// Deals deep-link. No new function.
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Wallet, PiggyBank, Coins, HeartHandshake, Sparkles, MessageCircle, Feather, Tag, Check } from "lucide-react";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { CoverCard, ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";

const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
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
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || ""));

const NOT = ["marketing budget", "cycle-sync", "follicular", "decoder ring", "tina turner", "glp-1", "peptide", "workout"];
const MONEY = ["money worries", "money mindset", "budgeting", "saving money", "savings", "pension", "cost of living", "personal finance", "financial wellbeing", "frugal", "money diary", "spending", "paycheck to paycheck", "money and mental", "household bills", "money anxiety", "financial cost of being a woman", "financial behavior", "financial behaviour"];

// gentle money-RITUALS (daily, no save). Shame-free, no "should save more", no hustle, no advice.
const RITUALS = [
  "Open the banking app, look, and close it. No action needed — just look without flinching.",
  "Move a fiver into savings, or don't. Either way, notice you got to choose.",
  "Cancel one thing you don't use. Or keep it. The point is you decided, calmly.",
  "Write one money worry down, then shut the notebook. It'll keep till you're ready.",
  "Notice one lovely thing today that money couldn't buy.",
  "A no-spend hour — not a no-spend life. Just an hour of not buying a thing.",
  "Say the number out loud, the one you avoid. It's usually smaller than the dread around it.",
  "Thank past-you for anything she put by, however small.",
  "Name one kind thing you'll spend on this week without a scrap of guilt.",
  "Check one bill you've been avoiding. Just the one. Then stop for today.",
  "Money is emotional, not only mathematical. Be as gentle with yourself here as anywhere.",
  "Unfollow one account that quietly makes you feel poor. Your feed, your call.",
  "A pound saved isn't a moral win, a pound spent isn't a sin. Loosen the grip a little.",
  "Look at what you value, not only what you owe. Money's meant to serve a life, not rule one.",
  "Ask for the discount, the payment plan, the help. It's not embarrassing — it's sensible.",
  "Let 'enough for now' be a real answer. Not everything needs optimising.",
  "If money feels frightening right now, that's real, and you're not the only one. One small thing. Be kind.",
  "Round up one thing you're genuinely glad you could afford this week.",
];

// gentle money-INTENTIONS — the pick-and-keep list. Kept ones save as Goal(domain:"Money").
const INTENTIONS = [
  "Build a tiny buffer — a little, whenever I can. A cushion, not a fortune.",
  "Open the banking app without dread.",
  "Do one kind money thing for myself this month.",
  "Know roughly where it goes — gently, no spreadsheet, no judgement.",
  "Forgive myself one past money mistake.",
  "Look at money without it looking back at me like a threat.",
];

export default function Money() {
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [userId, setUserId] = useState(null);
  const [kept, setKept] = useState(() => new Set());
  const [expanded, setExpanded] = useState(null);
  const sage = cwOf("sage").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500).catch(() => []);
        if (alive) setItems(Array.isArray(rows) ? rows : []);
      } catch { /* graceful */ }
      try {
        const u = await base44.auth.me().catch(() => null);
        if (u?.id && alive) {
          setUserId(u.id);
          const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          const p = pickProfile(profs);
          const nm = String(p?.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
          if (nm && !/\d/.test(nm) && nm.length <= 16) setFirstName(nm[0].toUpperCase() + nm.slice(1));
          // which money intentions has she already kept? (so we show "kept", not offer duplicates)
          const gs = await base44.entities.Goal.filter({ user_id: u.id, domain: "Money" }).catch(() => []);
          if (alive && Array.isArray(gs)) setKept(new Set(gs.map((g) => (g.title || "").trim())));
        }
      } catch { /* anon — the board still works, just can't keep intentions */ }
    })();
    return () => { alive = false; };
  }, []);

  // keep a gentle money intention → a Goal(domain:"Money"), reusing existing fields only.
  const keepIntention = useCallback(async (title) => {
    if (!userId) { window.location.assign(createPageUrl("Profile")); return; }
    setKept((s) => new Set(s).add(title.trim())); // optimistic
    try {
      await base44.entities.Goal.create({ user_id: userId, title: title.trim(), type: "short", domain: "Money", stage: "seed", status: "active", flower: "sunflower", accent: sage, next_action: "" });
    } catch { setKept((s) => { const n = new Set(s); n.delete(title.trim()); return n; }); }
  }, [userId, sage]);

  const moneyCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && hasAny(r, MONEY)), 8).map((r) => ({
    id: r.id, title: decodeEntities(r.title || ""), subtitle: r.source_name || r.channel_name || r.subtitle || "",
    summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    category: r.category || "Career & Money", cw: "sage", Icon: "Wallet", kind: "Read · Money",
    meta: [["Clock", r.duration_label || "a calm few minutes"]],
  })), [items]);
  const rituals = useMemo(() => rotateDaily(RITUALS, 4), []);

  const summaryRows = useMemo(() => [
    { Icon: Wallet, label: "Today", text: firstName ? `${firstName}, money is one of the most emotional things there is — so this is the gentle corner for it. No shame, no lectures, no spreadsheets required.` : "Money is one of the most emotional things there is — so this is the gentle corner for it. No shame, no lectures, no spreadsheets required." },
    { Icon: HeartHandshake, label: "How this works here", text: "You won't be told off, lectured, or made to feel behind. Money is emotional, not just mathematical — and being kind to yourself about it is allowed, whatever the number." },
    { Icon: PiggyBank, label: "A little is a lot", text: "A tiny buffer, a small kindness to yourself, one worry looked at gently — that's the whole game here. Not wealth, not optimising. Just a bit more peace around it." },
  ], [firstName]);

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

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Money, gently" line="A calm, kind corner for the most emotional subject there is. No shame, no lectures, no sums you'll dread."
          colorway="sage" bloom="cosmos" flankL="clover" flankR="daisy" titleColor={OXBLOOD} creature="bee" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Money, gently" accent={sage} rows={summaryRows} /></div>

        {/* A · A GENTLE MONEY THING — the ritual spine */}
        <Section Icon={Coins} title="A gentle money thing today" accent={sage}
          sub="Small, low-stakes, no maths. Pick one if it helps — every single one is optional, and 'not today' is a perfectly good answer.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {rituals.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${sage}`, borderRadius: 13, padding: "12px 14px" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${sage}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Coins size={15} color={sage} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* B · KEEP A GENTLE INTENTION — reuses the Goal entity (domain:"Money"); grows in her garden */}
        <Section Icon={PiggyBank} title="A gentle money intention" accent={cwOf("gold").petal}
          sub="Not a target, not a number — a soft direction to hold. Keep one and it grows quietly in your goals garden. Change your mind any time.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INTENTIONS.map((intent) => {
              const on = kept.has(intent.trim());
              return (
                <button key={intent} onClick={() => !on && keepIntention(intent)} disabled={on} className="fw-elite-press"
                  style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: on ? `${cwOf("gold").petal}12` : T.paperHi, border: `1px solid ${on ? cwOf("gold").petal : T.paperDeep}`, borderRadius: 13, padding: "12px 14px", cursor: on ? "default" : "pointer" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: `${cwOf("gold").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}>{on ? <Check size={15} color={cwOf("gold").petal} /> : <PiggyBank size={15} color={cwOf("gold").petal} />}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{intent}</span>
                  <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: cwOf("gold").petal, flexShrink: 0 }}>{on ? "kept" : "keep it"}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* C · WORTH A READ — the small real content shelf */}
        <Section Icon={Wallet} title="Worth a read" accent={cwOf("plum").petal}
          sub="A few honest, un-preachy pieces on money and life — including the ones about what it actually costs to be a woman.">
          {moneyCards.length ? (
            <div className="fw-mon-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)", maskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)" }}>
              <style>{`.fw-mon-shelf::-webkit-scrollbar{display:none}`}</style>
              {moneyCards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 366 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
            </div>
          ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>Money reads land here as the library fills out.</p>}
        </Section>

        {/* D · SMALL SAVINGS — Deals deep-link (gentle, not consumerist) */}
        <Section Icon={Tag} title="A little going further" accent={cwOf("crimson").petal}
          sub="If you're going to spend anyway, spend a bit less — the members' offers and discounts live in Deals. No pressure to buy a thing.">
          <a href={createPageUrl("Deals")} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("crimson").petal}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: `${cwOf("crimson").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Tag size={20} color={cwOf("crimson").petal} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>See what's in Deals</span>
              <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>Discounts and offers, for the things you were buying anyway.</span>
            </span>
          </a>
        </Section>

        {/* E · CARRY IT ON */}
        <Section Icon={Sparkles} title="Carry it on" accent={sage} sub="Money's easier when it's not a secret.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: Sparkles, cw: "sage", label: "\"Help me look at my money without panicking\"", sub: "Jess can sit with you through the scary bit — no judgement, no jargon, no selling you anything.", href: createPageUrl("Jess") },
              { Icon: MessageCircle, cw: "plum", label: "Talk money in Community", sub: "The taboo that costs us most is not talking about it. Vent, ask, share — anonymously.", href: createPageUrl("Community") },
              { Icon: Feather, cw: "crimson", label: "Put a money worry down in your Journal", sub: "Half its power is in not being looked at. Get it out of your head and onto the page.", href: createPageUrl("Journal") },
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
            You are not behind, not bad with money, not a failure at this. You're a person with a complicated relationship to a hard thing — and you're allowed to be gentle about it.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
