// Delight — Track C board #5 (whole-life domain: joy, fun, play, entertainment). Pure
// delight, permission, NO guilt. Joy needs no justification or apology; fun is for its OWN
// sake — not to recharge, not to be productive afterwards, not earned.
//
// RESEARCHED brainstorm: claude-state/TRACKC_DELIGHT_BRAINSTORM.html (cited). Content MEASURED
// first (ideas/relationships excluded — those are Curious/Kindred): SAFE pool 189 (150 article,
// 25 podcast, 14 video). watch 96 · comedy 51 · pop/gossip 46 · music 24 · play 15. The PLAY
// pool (15) is starved → "to play" hard-wires to Community's arcade, never a faked shelf.
// No new entity/function — self-loads real LifestyleItems + deep-links Community.
//
// TONE DENIES (this domain's diet-culture): guilty-pleasure / "guilt-free" (naming guilt plants
// it), productive-relaxation / self-care-as-optimisation, FOMO / must-watch completionism,
// consumption-as-status, and the food-as-fun diet-culture edge ("treat you've earned"/"cheat day").
// FIREWALL: never justify fun as "so you can be more productive/rested" — fun is worth it
// because it's fun (playfulness IS linked to a happier life — Proyer — but that's WHY it feels
// good, never the reason to do it).
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Tv, Laugh, Star, Music, Shuffle, Sparkles, Dices, MessageCircle, Feather, CalendarHeart, PartyPopper } from "lucide-react";
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

const HEALTH = ["cycle", "hormone", "period", "menstrual", "estrogen", "ovulation", "luteal", "follicular", "menopause", "fertility", "pregnan", "postpartum", "symptom"];
const FUN = ["tv show", "tv series", "television", "new show", "best show", "watch this", "to watch", "film", "movie", "netflix", "streaming", "reality tv", "sitcom", "comedy", "funny", "hilarious", "laugh", "humour", "humor", "game", "puzzle", "quiz", "board game", "playlist", "new music", "album", "concert", "pop culture", "celebrity", "gossip", "red-carpet", "binge", "drama series", "must-see", "feel-good", "joy of", "fun "];
const EXCLUDE = ["science", "the history of", "philosophy", "psychology", "the mind", "relationship", "marriage", "dating", "friendship", "estrange", "biography", "politics", " war ", "climate", "the brain", "decoder ring", "mating in captivity", "how democracy"];
// guilty-pleasure / productive-relaxation / FOMO / status / food-diet-edge
const DENY = ["guilty pleasure", "guilt-free", "guilt free", "no shame", "productive rest", "productive relaxation", "must-watch", "must watch", "you need to watch", "don't miss", "before everyone else", "binge the entire", "everything you need to watch", "complete guide to", "you have to see", "cheat day", "you've earned", "you have earned", "earned it", "skinny", "calorie", "kcal", "everyone's obsessed"];

const FANCY = [
  { key: "watch", label: "To watch", Icon: Tv, cw: "crimson", kws: ["tv", "television", "show", "film", "movie", "netflix", "streaming", "reality", "sitcom", "series", "watch", "drama"], line: "Sit down, switch off. No must-see list, no keeping up — just what takes your fancy tonight." },
  { key: "laugh", label: "A laugh", Icon: Laugh, cw: "gold", kws: ["comedy", "funny", "hilarious", "laugh", "humour", "humor", "comic", "sitcom"], line: "The best kind of medicine, and the only kind with no side effects. Go on, have a proper laugh." },
  { key: "pop", label: "Pop culture & gossip", Icon: Star, cw: "plum", kws: ["celebrity", "gossip", "pop culture", "interview", "red carpet", "star", "reality"], line: "The good kind of gossip — delighting in other people's lives, no cruelty required. It's practically a love language." },
  { key: "music", label: "Music", Icon: Music, cw: "sage", kws: ["music", "playlist", "album", "song", "concert", "dance"], line: "Turn it up. A song can change a whole evening — no reason needed beyond it feeling good." },
  { key: "surprise", label: "Surprise me", Icon: Shuffle, cw: "sky", kws: [], line: "Can't decide? Neither could I. Here's something — the joy is in not choosing." },
];

export default function Delight() {
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [fancy, setFancy] = useState(FANCY[0]);
  const [expanded, setExpanded] = useState(null);
  const gold = cwOf("gold").petal;

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

  const pool = useMemo(() => items.filter((r) => !isFiction(r) && !hasAny(r, HEALTH) && hasAny(r, FUN) && !hasAny(r, EXCLUDE) && !hasAny(r, DENY)), [items]);

  const toCard = useCallback((r, cw) => {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = (mt === "PODCAST" || mt === "CLIP") && r.audio_url;
    return {
      id: r.id,
      title: decodeEntities(r.title || ""),
      subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Culture", cw,
      Icon: isVid ? "Film" : isAudio ? "Headphones" : "Sparkles",
      kind: isVid ? "Watch · Delight" : isAudio ? "Listen · Delight" : "Read · Delight",
      meta: [["Clock", r.duration_label || "a bit of fun"]],
      ...(isVid ? { youtubeId: r.video_id } : {}),
      ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }, []);

  const joyOfTheDay = useMemo(() => { const r = rotateDaily(pool, 1)[0]; return r ? toCard(r, "gold") : null; }, [pool, toCard]);
  const fancyPicks = useMemo(() => {
    if (fancy.key === "surprise") { const sh = [...pool].sort((a, b) => ((a.id || "") + dayOffset()).localeCompare((b.id || "") + dayOffset())); return rotateDaily(sh, 4).map((r) => toCard(r, fancy.cw)); }
    const matches = pool.filter((r) => hasAny(r, fancy.kws));
    return rotateDaily(matches.length >= 2 ? matches : pool, 4).map((r) => toCard(r, fancy.cw));
  }, [pool, fancy, toCard]);

  const watchCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["tv", "television", "show", "film", "movie", "netflix", "streaming", "reality", "sitcom", "series", "watch", "drama"])), 6).map((r) => toCard(r, "crimson")), [pool, toCard]);
  const laughCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["comedy", "funny", "hilarious", "laugh", "humour", "humor", "comic"])), 6).map((r) => toCard(r, "gold")), [pool, toCard]);
  const popCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["celebrity", "gossip", "pop culture", "interview", "red carpet", "star"])), 6).map((r) => toCard(r, "plum")), [pool, toCard]);

  const summaryRows = useMemo(() => [
    { Icon: PartyPopper, label: "Today", text: firstName ? `${firstName}, what do you fancy? Something to watch, a laugh, a bit of gossip. No reason needed.` : "What do you fancy? Something to watch, a laugh, a bit of gossip. No reason needed." },
    { Icon: Sparkles, label: "The whole point", text: "Joy needs no justification. You don't have to earn this, recharge from it, or get anything useful out of it — fun is the point, full stop." },
    { Icon: Laugh, label: "And honestly", text: "Playfulness really is linked to a happier life — but not because it makes you more productive. Just because delight is good for you. So: enjoy the 'pointless' thing." },
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
      <div className="fw-del-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none" }}>
        <style>{`.fw-del-shelf::-webkit-scrollbar{display:none}`}</style>
        {cards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 368 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
      </div>
    ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>{empty}</p>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Delight" line="Joy, fun and play — for absolutely no reason at all. You don't have to earn it or get anything out of it."
          colorway="gold" bloom="marigold" flankL="sunflower" flankR="poppy" titleColor={OXBLOOD} creature="butterfly" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Fun today" accent={gold} rows={summaryRows} /></div>

        {/* A · WHAT DO YOU FANCY — the picker (incl. Surprise me = the anti-decision-fatigue) */}
        <Section Icon={PartyPopper} title="What do you fancy?" accent={cwOf(fancy.cw).petal}
          sub="No wrong answer, no productive outcome required. Pick a mood — or let it be picked for you.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {FANCY.map((f) => { const on = f.key === fancy.key; const c = cwOf(f.cw).petal; return (
              <button key={f.key} onClick={() => setFancy(f)} className="fw-elite-press"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? c : `${c}14`, border: `1px solid ${on ? c : c + "55"}`, color: on ? "#fff" : c, fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <f.Icon size={14} /> {f.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{fancy.line}</p>
          <Shelf cards={fancyPicks} empty="Fun lands here as the library fills out." />
        </Section>

        {/* one purely joyful thing — daily, no task attached */}
        {joyOfTheDay && (
          <Section Icon={Sparkles} title="One purely joyful thing" accent={cwOf("blush").petal}
            sub="Today's, chosen for no reason but that it's lovely.">
            <div style={{ maxWidth: 300 }}><CoverCard item={joyOfTheDay} onOpen={() => setExpanded(joyOfTheDay)} /></div>
          </Section>
        )}

        {/* B · SOMETHING TO WATCH — the biggest pool */}
        <Section Icon={Tv} title="Something to watch" accent={cwOf("crimson").petal}
          sub="Telly, films, the good trash and the great stuff both. No completion bar — watch one thing and stop, if you like.">
          <Shelf cards={watchCards} empty="Watching lands here as the library fills out." />
        </Section>

        {/* C · A GOOD LAUGH */}
        <Section Icon={Laugh} title="A good laugh" accent={gold}
          sub="Comedy, the funny stuff, the daft stuff. Genuinely one of the kindest things you can do for yourself.">
          <Shelf cards={laughCards} empty="Laughs land here as the library fills out." />
        </Section>

        {/* D · POP CULTURE & GOSSIP — bonding/fun, never cruelty */}
        <Section Icon={Star} title="Pop culture & a bit of gossip" accent={cwOf("plum").petal}
          sub="Who's doing what, who wore what, what everyone's talking about. Delighting in other lives — the warm kind, not the mean kind.">
          <Shelf cards={popCards} empty="Pop culture lands here as the library fills out." />
        </Section>

        {/* E · FANCY A GAME — hard-wired to Community's arcade (content pool too thin for a shelf) */}
        <Section Icon={Dices} title="Fancy a game?" accent={cwOf("sage").petal}
          sub="Actual play, with actual people. FemWell's games live over in Community — go and mess about.">
          <a href={createPageUrl("Community")} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("sage").petal}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: `${cwOf("sage").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Dices size={20} color={cwOf("sage").petal} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>Play in Community</span>
              <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>Word games, quizzes and daft multiplayer — no leaderboards to stress about.</span>
            </span>
          </a>
        </Section>

        {/* F · CARRY IT ON */}
        <Section Icon={MessageCircle} title="Carry it on" accent={cwOf("crimson").petal} sub="Delight doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: Sparkles, cw: "gold", label: "Ask Jess to make you laugh", sub: "\"Tell me something ridiculous / recommend me something fun / cheer me up.\"", href: createPageUrl("Jess") },
              { Icon: MessageCircle, cw: "plum", label: "\"What are you watching?\" in Community", sub: "The best recommendations come from people, not algorithms.", href: createPageUrl("Community") },
              { Icon: CalendarHeart, cw: "crimson", label: "Book some joy into your week", sub: "A gig, a comedy night, a night in with nothing planned — put it in the Planner.", href: createPageUrl("Planner") },
              { Icon: Feather, cw: "sage", label: "Savour it in your Journal", sub: "The bit that made you laugh out loud — worth keeping. Savouring is half the joy.", href: createPageUrl("Journal") },
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
            You don't need a reason to enjoy something. The pointless, the silly, the "waste of time" — that's not the guilty bit of your life. It might be the best bit.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
