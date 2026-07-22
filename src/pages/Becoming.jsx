// Becoming — Track C board #8 (whole-life domain: identity, self, growth). Growth as
// UNFOLDING and SELF-TRUST — becoming more yourself, never rejecting yourself. You are already
// whole; growth is unfolding, not repair. NOT a project to fix, optimise or complete, and NO
// milestone map (married/kids/career by an age). The strongest proof of "health is one room,
// not the house" — a wellness board with almost no health in it.
//
// RESEARCHED brainstorm: claude-state/TRACKC_BECOMING_BRAINSTORM.html (cited). Content MEASURED
// rich (cycle-health excluded): SAFE ~771 (723 article, 39 video, 9 podcast). growth&purpose
// 398 · self-trust&worth 177 · identity 156 · boundaries 33 · reinvention 25 (thin → folded
// into the lens, no standalone shelf). No new entity/function — self-loads LifestyleItems.
//
// SCIENCE (cited): SELF-COMPASSION (Neff) is the spine — self-acceptance drives change BETTER
// than self-criticism, and does NOT make you complacent. Toxic-positivity/emotional suppression
// BACKFIRES (feelings welcome, never bypassed). Growth-mindset (Dweck) is soft/overhyped —
// treated as a value, not proven science. FIREWALL against fix-yourself/hustle/manifest/behind-
// on-life/spiritual-bypass. GRAMMAR RULE: no self-directed imperatives, no streaks, no completion
// mechanics — if a card could appear in a hustle app unchanged, it fails.
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, HeartHandshake, Fingerprint, Compass, Sprout, Shield, Sparkles, Feather, MessageCircle, Users } from "lucide-react";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { CoverCard, ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
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

const NOT = ["cycle", "estrogen", "oestrogen", "menstrual", "follicular", "luteal", "ovulation", "hormone", "menopause", "perimenopause", "pcos", "endometriosis", "fertility", "pregnan", "postpartum", "workout", "kettlebell", "calorie", "glp-1", "recipe", "skincare", "wardrobe"];
// DENY tightened so it can't false-positive on the exact content this board exists for:
// "optimize your"/"self-optimi" (NOT bare "optimi" → kept "optimism"); "manifest it/your/ing"
// + "law of attraction" (NOT bare "manifest" → kept "manifesto").
const DENY = ["level up", "grind ", "hustle", "optimize your", "optimise your", "self-optimi", "optimize you", "10x your", "high performer", "become the best version", "best version of yourself", "upgrade yourself", "biohack", "5am club", "girlboss", "crush your goals", "manifest it", "manifest your", "manifesting", "law of attraction", "good vibes only", "positive vibes only", "raise your vibration", "the universe will provide", "fix yourself", "you are broken", "become who you're meant", "behind on life", "married by", "on track for", "falling behind", "everything happens for a reason", "just think positive"];
const SELF = ["identity", "who am i", "who you are", "self-discovery", "sense of self", "reinvention", "self-trust", "self-compassion", "self-acceptance", "authentic", "purpose", "values", "confidence", "self-worth", "self-esteem", "growth", "boundaries", "self-belief", "midlife", "reinvent", "finding yourself", "who i am", "self-knowledge", "personal growth", "self-doubt", "imposter", "imperfection", "enough"];

const LENS = [
  { key: "trust", label: "Self-trust", Icon: HeartHandshake, cw: "plum", kws: ["self-trust", "self-compassion", "self-acceptance", "self-worth", "self-esteem", "self-belief", "self-doubt", "confidence", "imperfection", "enough as you"], line: "The quiet sense that you can be trusted with your own life. It grows the more you listen to it — not the more you fix." },
  { key: "who", label: "Who you are", Icon: Fingerprint, cw: "sky", kws: ["identity", "who am i", "who you are", "sense of self", "authentic", "self-knowledge", "who i am", "self-discovery"], line: "Not who you were told to be — who you actually are, under all that. Worth getting to know slowly." },
  { key: "purpose", label: "Purpose & values", Icon: Compass, cw: "gold", kws: ["purpose", "values", "meaning", "what matters", "calling", "why"], line: "What matters to you, honestly — not what's supposed to. Your compass, never anyone else's map." },
  { key: "new", label: "New chapters", Icon: Sprout, cw: "sage", kws: ["reinvention", "reinvent", "midlife", "starting over", "new chapter", "second act", "transition", "change"], line: "Starting again, at any age, isn't being behind. There's no timeline here — only your own unfolding." },
  { key: "boundaries", label: "Boundaries", Icon: Shield, cw: "crimson", kws: ["boundaries", "boundary", "saying no", "people-pleas", "over-giving"], line: "The kind 'no' that protects your yes. Where you end and other people begin — and that you're allowed one." },
];

// THE DAILY HOOK — an honest question, never a task. Open, gentle, self-trust-oriented.
const QUESTIONS = [
  "What would you do here, if you trusted yourself?",
  "Whose voice is that, really — is it even yours?",
  "What are you quietly pretending not to know?",
  "What did you love, before someone told you it was pointless?",
  "Where are you shrinking to keep someone else comfortable?",
  "What would 'enough' actually feel like — not look like, feel like?",
  "Who were you, before the world told you who to be?",
  "What are you outgrowing?",
  "What would you say to a friend in exactly your situation?",
  "What's the kind, true thing you'd never let yourself say to you?",
  "What are you allowed to change your mind about?",
  "If no one would ever know, what would you choose?",
];

export default function Becoming() {
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lens, setLens] = useState(LENS[0]);
  const [expanded, setExpanded] = useState(null);
  const plum = cwOf("plum").petal;

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
          const nm = String(p?.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
          if (alive && nm && !/\d/.test(nm) && nm.length <= 16) setFirstName(nm[0].toUpperCase() + nm.slice(1));
        }
      } catch { /* anon */ }
    })();
    return () => { alive = false; };
  }, []);

  const pool = useMemo(() => items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && !hasAny(r, DENY) && hasAny(r, SELF)), [items]);
  const question = useMemo(() => QUESTIONS[dayOffset() % QUESTIONS.length], []);

  const toCard = useCallback((r, cw) => {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = mt === "PODCAST" && r.audio_url;
    return {
      id: r.id, title: decodeEntities(r.title || ""), subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Mental Wellness", cw, Icon: isVid ? "Film" : isAudio ? "Headphones" : "Sparkles",
      kind: isVid ? "Watch · Becoming" : isAudio ? "Listen · Becoming" : "Read · Becoming",
      meta: [["Clock", r.duration_label || "a reflective few minutes"]],
      ...(isVid ? { youtubeId: r.video_id } : {}), ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }, []);

  const lensPicks = useMemo(() => {
    const matches = pool.filter((r) => hasAny(r, lens.kws));
    return rotateDaily(matches.length >= 2 ? matches : pool, 4).map((r) => toCard(r, lens.cw));
  }, [pool, lens, toCard]);
  const trustCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["self-trust", "self-compassion", "self-acceptance", "self-worth", "self-esteem", "self-belief", "self-doubt", "imperfection", "confidence"])), 6).map((r) => toCard(r, "plum")), [pool, toCard]);
  const whoCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["identity", "who am i", "who you are", "sense of self", "authentic", "self-knowledge"])), 6).map((r) => toCard(r, "sky")), [pool, toCard]);
  const growCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["growth", "purpose", "values", "personal growth", "meaning", "reinvention", "midlife"])), 6).map((r) => toCard(r, "gold")), [pool, toCard]);
  const boundCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["boundaries", "boundary", "saying no", "people-pleas"])), 6).map((r) => toCard(r, "crimson")), [pool, toCard]);

  const summaryRows = useMemo(() => [
    { Icon: Sprout, label: "Today", text: firstName ? `${firstName}, you're not a project to be fixed. You're already whole — this is just the room for the slow, good work of becoming more yourself.` : "You're not a project to be fixed. You're already whole — this is just the room for the slow, good work of becoming more yourself." },
    { Icon: HeartHandshake, label: "The one true thing", text: "Being kind to yourself isn't going soft — the research is clear it drives change BETTER than being hard on yourself. Self-trust, not self-rejection." },
    { Icon: Compass, label: "No timeline", text: "There's no map here of where you 'should' be by now. Starting over at 25, 45 or 65 is all just becoming. You're allowed to keep changing your mind about your whole life." },
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
  const Shelf = ({ cards, empty }) => (
    cards.length ? (
      <div className="fw-bec-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none" }}>
        <style>{`.fw-bec-shelf::-webkit-scrollbar{display:none}`}</style>
        {cards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 368 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
      </div>
    ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>{empty}</p>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Becoming" line="Growth as unfolding, not repair — becoming more yourself, never rejecting yourself. No fixing, no timeline, no 'best version'."
          colorway="plum" bloom="iris" flankL="lavender" flankR="foxglove" titleColor={OXBLOOD} creature="butterfly" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Becoming" accent={plum} rows={summaryRows} /></div>

        {/* A · AN HONEST QUESTION — the daily hook (a question, never a task) + the lens picker */}
        <Section Icon={Sparkles} title="An honest question" accent={plum}
          sub="Not homework — just something to sit with today, if you like. There's no right answer, and you don't have to have one.">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${plum}`, borderRadius: 14, padding: "16px 18px", marginBottom: 8 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: `${plum}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Feather size={17} color={plum} /></span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: OXBLOOD, lineHeight: 1.45 }}>{question}</span>
          </div>
          <a href={createPageUrl("Journal")} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: plum, textDecoration: "none", padding: "2px 2px 4px" }}>
            <Feather size={14} /> Sit with it in your Journal, if you want to
          </a>
        </Section>

        {/* the lens — where are you becoming */}
        <Section Icon={Compass} title="Where are you becoming?" accent={cwOf(lens.cw).petal}
          sub="Follow whatever's alive for you right now. No area is more 'advanced' than another.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {LENS.map((l) => { const on = l.key === lens.key; const c = cwOf(l.cw).petal; return (
              <button key={l.key} onClick={() => setLens(l)} className="fw-elite-press"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? c : `${c}14`, border: `1px solid ${on ? c : c + "55"}`, color: on ? "#fff" : c, fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <l.Icon size={14} /> {l.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{lens.line}</p>
          <Shelf cards={lensPicks} empty="Reads land here as the library fills out." />
        </Section>

        {/* B · BEING KIND TO YOURSELF — the self-compassion core */}
        <Section Icon={HeartHandshake} title="Being kind to yourself" accent={plum}
          sub="The self-compassion pieces — the evidence that treating yourself gently isn't indulgent, it's what actually helps you grow.">
          <Shelf cards={trustCards} empty="Self-kindness reads land here as the library fills out." />
        </Section>

        {/* C · WHO YOU ARE */}
        <Section Icon={Fingerprint} title="Who you are" accent={cwOf("sky").petal}
          sub="Getting to know yourself — the real one, not the performed one. A slow, lifelong, rather good read.">
          <Shelf cards={whoCards} empty="Identity reads land here as the library fills out." />
        </Section>

        {/* D · GROWING, UNFOLDING — the big pool */}
        <Section Icon={Sprout} title="Growing, unfolding" accent={cwOf("gold").petal}
          sub="Purpose, meaning, the long slow becoming — the kind that's about direction, not a finish line.">
          <Shelf cards={growCards} empty="Growth reads land here as the library fills out." />
        </Section>

        {/* E · HOLDING YOUR GROUND — boundaries */}
        <Section Icon={Shield} title="Holding your ground" accent={cwOf("crimson").petal}
          sub="Boundaries — the kind 'no' that protects your yes. Not selfish; the opposite of it.">
          <Shelf cards={boundCards} empty="Boundary reads land here as the library fills out." />
        </Section>

        {/* F · CARRY IT ON — Journal is the heart; Jess is the natural thinking partner */}
        <Section Icon={MessageCircle} title="Carry it on" accent={plum} sub="Becoming happens off the page too.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: Feather, cw: "plum", label: "Think it through in your Journal", sub: "The real work of becoming is reflection — and it lives in your Journal, private and yours.", href: createPageUrl("Journal") },
              { Icon: Sparkles, cw: "sky", label: "Talk it out with Jess", sub: "\"Help me figure out what I actually want\" — a thinking partner who never judges the answer.", href: createPageUrl("Jess") },
              { Icon: Users, cw: "sage", label: "\"Who am I becoming?\" in Community", sub: "Others in the middle of their own becoming — no one has it figured out, and that's the point.", href: createPageUrl("Community") },
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
            You don't have to become someone else. You get to become more of who you already, quietly, are. There's no finish line — and thank goodness for that.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
