// Mirror — Track C board #1 (whole-life domain: fashion · beauty · style · self-image).
// The boldest "health is one room, not the house" surface: a cycle-aware app that serves
// getting-dressed and skin as JOY and self-expression, never as symptoms or flaws to fix.
//
// RESEARCHED brainstorm: claude-state/TRACKC_MIRROR_BRAINSTORM.html (cited). Content MEASURED
// before build (scratchpad/b44proj/measure_mirror*.mjs): clean fashion 208 · skincare 60 ·
// hair 23 · SAFE body-image 73 (10 diet-culture/GLP-1 items denylisted out). No new
// entity/function — self-loads real PUBLISHED LifestyleItems + the existing UserProfile phase.
//
// HARD anti-patterns (do NOT ship): diet culture, "dress for your body type", anti-ageing
// shame, thin-ideal, ovulatory "dress sexier" (failed replication + appearance-policing),
// slogans-as-science, skin-as-flaws. Default to body NEUTRALITY, not forced positivity.
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Shirt, Sparkles, Sun, HeartHandshake, Palette, Wind, Clock, MessageCircle } from "lucide-react";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { GoodLifeSection as Section, GoodLifeShelf as Shelf } from "./GoodLifeRoomParts";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { createPageUrl } from "@/utils";
import { fmtDuration } from "@/utils/duration";
import { isClickbait } from "@/utils/clickbait";
import { cleanTitle } from "@/utils/cleanTitle";
import { useGoodLifeKeep } from "@/components/lifestyle-elite/useGoodLifeKeep";
import "./GoodLifeRoomsClean.css";

// deterministic per-calendar-day slice — the same rotation helper the shell uses, so a
// woman sees a fresh-but-stable handful each day (no persistence, no new entity).
const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};

const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  // include summary/excerpt so the body-neutral denylist catches diet-culture that hides in
  // body copy (which renders on the card), not only in the title. Err toward safety.
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));

// the measured filters — kept in sync with measure_mirror2.mjs
const SKINCARE = ["skin", "skincare", "acne", "breakout", "glow", "complexion", "serum", "moisturis", "spf", "sunscreen", "retinol", "cleanser", "derma", "pores", "hydrat"];
const HAIR = ["hair", "curl", "scalp", "frizz"];
const FASHION = ["fashion", "wardrobe", "outfit", "capsule", "what to wear", "dress for", "denim", "tailoring", "closet", "personal style", "get dressed", "getting dressed", "co-ord", "dresses", "loungewear", "chic"];
const FICTION = /between us|tide comes back|orchard|salt air|all my songs/i;
// body-neutral: exclude diet-culture / weight-loss / GLP-1 outright (anti-pattern gate)
const DIET_DENY = ["glp-1", "glp1", "ozempic", "wegovy", "lose weight", "weight loss", "slimmer", "size 4", "calorie", "diet ", "scale swing", "weight rises", "weight shifts", "ballmaxxing", "bulky", "get judged"];

// mood → the vibe she wants to feel today (self-directed, never prescriptive), each with a
// warm line and the fashion keywords that surface matching reads.
const MOODS = [
  { key: "bright", label: "Bright & bold", Icon: Sun, cw: "gold", line: "Wear the colour you've been saving.", kws: ["colour", "bold", "print", "bright", "statement", "red", "dress"] },
  { key: "soft", label: "Soft & cosy", Icon: Wind, cw: "blush", line: "Comfort is a look. A good one.", kws: ["loungewear", "knit", "cosy", "co-ord", "soft", "comfort", "track"] },
  { key: "sharp", label: "Pulled-together", Icon: Shirt, cw: "plum", line: "One good piece can do a lot.", kws: ["tailoring", "capsule", "office", "chic", "denim", "elegant", "blazer"] },
  { key: "play", label: "Playful", Icon: Sparkles, cw: "sage", line: "Clash the colours. See what happens.", kws: ["trend", "vinted", "fun", "print", "summer", "accessor"] },
];

// skin genuinely shifts across the cycle (cited: oestrogen glow follicular/ovulatory,
// progesterone sebum luteal, menstrual dryness) — framed as understanding, never flaws.
// "many women notice", not "your skin will" (2025 scoping review caveat).
const SKIN_NOTE = {
  menstrual: "Skin can feel drier and more reactive this week. Many women lean gentle and rich here — less is kinder than a full active routine.",
  follicular: "Rising oestrogen often brings a natural glow. A light week — let your skin do its thing.",
  ovulatory: "Often skin's easiest few days. Nothing to fix; enjoy it.",
  luteal: "Progesterone can mean more oil and the odd breakout for many — that's chemistry, not a failing. Be steady with it.",
};
const SKIN_LABEL = { menstrual: "Bleed week", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };

export default function Mirror() {
  const [items, setItems] = useState([]);
  const [itemsStatus, setItemsStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [phase, setPhase] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [expanded, setExpanded] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [ritualOpen, setRitualOpen] = useState(false);
  const { saved, saveError, onSave } = useGoodLifeKeep(ownerId, expanded);
  const blush = cwOf("blush").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // fashion/beauty/body content — one broad pull, filtered client-side to the measured pools
        const rows = await base44.entities.LifestyleItems
          .filter({ status: "PUBLISHED" }, "-engagement_score", 400);
        if (alive) { setItems((Array.isArray(rows) ? rows : []).filter((r) => !isClickbait(r && r.title)).map((r) => (r ? { ...r, title: cleanTitle(r.title) } : r))); setItemsStatus("ready"); }
      } catch { if (alive) setItemsStatus("error"); }
      try {
        const u = await base44.auth.me().catch(() => null);
        if (u?.id) {
          if (alive) setOwnerId(u.id);
          const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          const p = pickProfile(profs);
          if (alive && p) {
            const cyc = computeCycleDay(p);
            if (cyc.hasCycle) setPhase(cyc.phase);
            const nm = String(p.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
            if (!/\d/.test(nm) && nm.length <= 16) setFirstName(nm ? nm[0].toUpperCase() + nm.slice(1) : "");
          }
        }
      } catch { /* anon — fine */ }
    })();
    return () => { alive = false; };
  }, [retryKey]);

  // the measured content pools
  const pools = useMemo(() => {
    const clean = items.filter((r) => !FICTION.test(r.title || ""));
    const skincare = clean.filter((r) => r.category === "Beauty" && hasAny(r, SKINCARE));
    const fashion = clean.filter((r) => (r.category === "Fashion") || (["Beauty", "Lifestyle", "Culture"].includes(r.category) && hasAny(r, FASHION)));
    const body = clean.filter((r) => (r.category === "Body Image" || hasAny(r, ["body image", "body neutral", "body confidence", "trust a body", "come as you are", "in every phase"])) && !hasAny(r, DIET_DENY));
    const hair = clean.filter((r) => r.category === "Beauty" && hasAny(r, HAIR) && !hasAny(r, SKINCARE));
    return { skincare, fashion, body, hair };
  }, [items]);

  // adapter: a real LifestyleItem → the shared CoverCard item shape
  const toCard = useCallback((r, kind, cw) => ({
    id: r.id,
    type: String(r.media_type || "").toUpperCase() === "VIDEO" ? "video" : String(r.media_type || "").toUpperCase() === "PODCAST" ? "audio" : "article",
    _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
    title: decodeEntities(r.title || ""),
    subtitle: r.subtitle || r.source_name || r.channel_name || "",
    summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    category: r.category || "Beauty",
    cw, Icon: kind === "skin" ? "Sparkles" : kind === "body" ? "HeartHandshake" : "Shirt",
    kind: String(r.media_type || "").toUpperCase() === "VIDEO" ? "Watch · Mirror" : String(r.media_type || "").toUpperCase() === "PODCAST" ? "Listen · Mirror" : kind === "skin" ? "Skin · Read" : kind === "body" ? "Reflection · Read" : "Style · Read",
    meta: [["Clock", fmtDuration(r) || "a few minutes"]],
    ...(String(r.media_type || "").toUpperCase() === "VIDEO" && r.video_id && r.is_embeddable !== false ? { youtubeId: r.video_id } : {}),
    ...(String(r.media_type || "").toUpperCase() === "PODCAST" && r.audio_url ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
  }), []);

  const moodPicks = useMemo(() => {
    const matches = pools.fashion.filter((r) => hasAny(r, mood.kws));
    const src = matches.length >= 2 ? matches : pools.fashion;
    return rotateDaily(src, 3).map((r) => toCard(r, "style", mood.cw));
  }, [pools.fashion, mood, toCard]);

  const skinCards = useMemo(() => rotateDaily(pools.skincare, 3).map((r) => toCard(r, "skin", "blush")), [pools.skincare, toCard]);
  const styleCards = useMemo(() => rotateDaily(pools.fashion, 8).map((r) => toCard(r, "style", "plum")), [pools.fashion, toCard]);
  const bodyCards = useMemo(() => rotateDaily(pools.body, 4).map((r) => toCard(r, "body", "sage")), [pools.body, toCard]);

  const summaryRows = useMemo(() => [
    { Icon: Shirt, label: "Today", text: firstName ? `${firstName}, choose the feeling first. The clothes can follow.` : "Choose the feeling first. The clothes can follow." },
    phase ? { Icon: Sparkles, label: "Your skin", text: `${SKIN_LABEL[phase]}: ${SKIN_NOTE[phase]}` } : { Icon: Sparkles, label: "Your skin", text: "Add your cycle dates and this reads your skin week by week." },
    { Icon: Palette, label: "For the joy of it", text: "Style can be play. No fixing required." },
  ], [firstName, phase]);

  return (
    <div className="fw-good-clean fw-mirror-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press"
          style={{ width: 44, height: 44, borderRadius: 999, border: "1px solid #EAE7E0", background: "#fff", color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <header className="fw-good-hero fw-mirror-hero">
          <span className="fw-good-path">GOOD LIFE / MIRROR</span>
          <span className="fw-mirror-glass" aria-hidden="true" />
          <span className="fw-mirror-petals" aria-hidden="true" />
          <h1>Mirror</h1><p>Dress for the feeling. The rest can wait.</p>
        </header>
        <details className="fw-good-context"><summary>A note for today <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">{summaryRows.map(({Icon,label,text}) => <div key={label} className="fw-good-context-row"><Icon size={16} aria-hidden="true"/><div><strong>{label}</strong><p>{text}</p></div></div>)}</div></details>

        {/* A · WHAT TO WEAR TO HOW YOU FEEL — the daily return hook */}
        <Section Icon={Shirt} title="Dress for the feeling" accent={cwOf(mood.cw).petal}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {MOODS.map((m) => { const on = m.key === mood.key; const c = cwOf(m.cw).petal; return (
              <button key={m.key} onClick={() => setMood(m)} className="fw-elite-press" aria-pressed={on}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? "#51444e" : `${c}14`, border: `1px solid ${on ? "#51444e" : c + "55"}`, color: on ? "#fff" : "#51444e", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <m.Icon size={14} /> {m.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{mood.line}{phase === "luteal" && mood.key === "soft" ? " Comfort is a fine choice this week." : phase && ["follicular", "ovulatory"].includes(phase) && mood.key === "bright" ? " If this week feels brighter, follow it." : ""}</p>
          <Shelf room="mirror" onOpen={setExpanded} cards={moodPicks} empty={itemsStatus === "error" ? "" : itemsStatus === "loading" ? "Finding a style read…" : "No style read here right now. Try another feeling."} />
          {itemsStatus === "error" && <div className="fw-good-load-error" role="alert">The reads didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setRetryKey(value => value + 1); }}>Try again</button></div>}
        </Section>

        <details className="fw-good-library"><summary>Explore more · skin, style &amp; reflection <span aria-hidden="true">+</span></summary>
        {/* B · YOUR SKIN THIS WEEK — real skincare + a cycle-aware editorial note (not phase-filtered: 0/60 tagged) */}
        <Section Icon={Sparkles} title="Your skin this week" accent={blush}
          sub={phase ? SKIN_NOTE[phase] : "Add your cycle dates and this shapes to your skin, week by week. For now, a few good reads."}>
          <Shelf room="mirror" onOpen={setExpanded} cards={skinCards} empty={itemsStatus === "error" ? "" : "No skin read just now."} />
        </Section>

        {/* C · STYLE, THIS WEEK — the deep clean-fashion pool (208), rotated daily */}
        <Section Icon={Palette} title="Style, this week" accent={cwOf("plum").petal}
          sub="A small, chosen handful from the week in fashion — no endless scroll, no logistics.">
          <Shelf room="mirror" onOpen={setExpanded} cards={styleCards} empty={itemsStatus === "error" ? "" : "No fashion read just now."} />
        </Section>

        {/* D · KIND TO YOUR REFLECTION — body NEUTRAL (diet-culture denylisted), never forced positivity */}
        <Section Icon={HeartHandshake} title="Kind to your reflection" accent={cwOf("sage").petal}
          sub="Not 'love every inch' — just a body that's yours, changing across the month, worth meeting gently.">
          <Shelf room="mirror" onOpen={setExpanded} cards={bodyCards} empty={itemsStatus === "error" ? "" : "No reflection read just now."} />
        </Section>
        </details>

        {/* E · CARRY IT ON — cross-surface (Community style room · Jess as a getting-ready friend) */}
        <Section Icon={MessageCircle} title="Carry it on" accent={cwOf("gold").petal} sub="Mirror doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: MessageCircle, cw: "plum", label: "Talk style in the Community", sub: "The lighthearted room — outfits, wins, honest mirror days.", href: createPageUrl("Community") },
              { Icon: Sparkles, cw: "blush", label: "Ask Jess to help you get dressed", sub: "\"I've got a thing tonight and nothing feels right\" — she's a good friend for that.", href: createPageUrl("Jess") },
              { Icon: Clock, cw: "sage", label: "The 3-minute getting-ready ritual", sub: "One song, one thing you like in the mirror, out the door lighter.", href: null },
            ].map((r) => {
              const c = cwOf(r.cw).petal;
              const inner = (
                <>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: `${c}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={16} color={c} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>{r.label}</span>
                    <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>{r.sub}</span>
                  </span>
                </>
              );
              const style = { display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: "#fff", border: "1px solid #EAE7E0", borderLeft: `3px solid ${c}`, borderRadius: 16, padding: "11px 13px", cursor: "pointer", textDecoration: "none" };
              return r.href
                ? <a key={r.label} href={r.href} className="fw-elite-press" style={style}>{inner}</a>
                : <button key={r.label} type="button" onClick={() => setRitualOpen(value => !value)} aria-expanded={ritualOpen} className="fw-elite-press" style={style}>{inner}</button>;
            })}
          </div>
          {ritualOpen && <div className="fw-good-ritual" role="region" aria-label="Three-minute getting-ready ritual"><p>Play one song. Pick one thing you like today. Then go.</p><button type="button" onClick={() => setRitualOpen(false)}>Done for now</button></div>}
        </Section>

        <div style={{ textAlign: "center", margin: "28px 0 0" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, maxWidth: 320, lineHeight: 1.55, margin: "0 auto" }}>
            Getting dressed is allowed to be a small joy. No rules here, no flaws to fix — just you, meeting yourself.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError} />}
    </div>
  );
}
