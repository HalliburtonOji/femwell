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
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { GoodLifeSection as Section, GoodLifeShelf as Shelf } from "./GoodLifeRoomParts";
import { useGoodLifeKeep } from "@/components/lifestyle-elite/useGoodLifeKeep";
import "./GoodLifeRoomsClean.css";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";
import { fmtDuration } from "@/utils/duration";
import { isClickbait } from "@/utils/clickbait";
import { cleanTitle } from "@/utils/cleanTitle";

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
  { key: "watch", label: "To watch", Icon: Tv, cw: "crimson", kws: ["tv", "television", "show", "film", "movie", "netflix", "streaming", "reality", "sitcom", "series", "watch", "drama"], line: "Telly, a film, something daft. Your call." },
  { key: "laugh", label: "A laugh", Icon: Laugh, cw: "gold", kws: ["comedy", "funny", "hilarious", "laugh", "humour", "humor", "comic", "sitcom"], line: "A laugh for its own sake. Go on, have a proper one." },
  { key: "pop", label: "Pop & gossip", Icon: Star, cw: "plum", kws: ["celebrity", "gossip", "pop culture", "interview", "red carpet", "star", "reality"], line: "The good gossip. No cruelty, please." },
  { key: "music", label: "Music", Icon: Music, cw: "sage", kws: ["music", "playlist", "album", "song", "concert", "dance"], line: "Turn it up. The room can wait." },
  { key: "surprise", label: "Surprise me", Icon: Shuffle, cw: "sky", kws: [], line: "No decisions tonight. Here you go." },
];

export default function Delight() {
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [fancy, setFancy] = useState(FANCY[0]);
  const [expanded, setExpanded] = useState(null);
  const [itemsStatus, setItemsStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [ownerId, setOwnerId] = useState(null);
  const { saved, saveError, onSave } = useGoodLifeKeep(ownerId, expanded);
  const gold = cwOf("gold").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500);
        if (alive) { setItems((Array.isArray(rows) ? rows : []).filter((r) => !isClickbait(r && r.title)).map((r) => (r ? { ...r, title: cleanTitle(r.title) } : r))); setItemsStatus("ready"); }
      } catch { if (alive) setItemsStatus("error"); }
      try {
        const u = await base44.auth.me().catch(() => null);
        if (u?.id) {
          if (alive) setOwnerId(u.id);
          const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          const p = pickProfile(profs);
          const nm = String(p?.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
          if (alive && nm && !/\d/.test(nm) && nm.length <= 16) setFirstName(nm[0].toUpperCase() + nm.slice(1));
        }
      } catch { /* anon */ }
    })();
    return () => { alive = false; };
  }, [retryKey]);

  const pool = useMemo(() => items.filter((r) => !isFiction(r) && !hasAny(r, HEALTH) && hasAny(r, FUN) && !hasAny(r, EXCLUDE) && !hasAny(r, DENY)), [items]);

  const toCard = useCallback((r, cw) => {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = (mt === "PODCAST" || mt === "CLIP") && r.audio_url;
    return {
      id: r.id,
      type: mt === "VIDEO" ? "video" : isAudio ? "audio" : "article", _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
      title: decodeEntities(r.title || ""),
      subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Culture", cw,
      Icon: isVid ? "Film" : isAudio ? "Headphones" : "Sparkles",
      kind: isVid ? "Watch · Delight" : isAudio ? "Listen · Delight" : "Read · Delight",
      meta: [["Clock", fmtDuration(r) || "a bit of fun"]],
      ...(isVid ? { youtubeId: r.video_id } : {}),
      ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }, []);

  const joyOfTheDay = useMemo(() => { const r = rotateDaily(pool, 1)[0]; return r ? toCard(r, "gold") : null; }, [pool, toCard]);
  const fancyPicks = useMemo(() => {
    if (fancy.key === "surprise") { const sh = [...pool].sort((a, b) => ((a.id || "") + dayOffset()).localeCompare((b.id || "") + dayOffset())); return rotateDaily(sh, 4).map((r) => toCard(r, fancy.cw)); }
    const matches = pool.filter((r) => hasAny(r, fancy.kws));
    return rotateDaily(matches.length ? matches : pool, 4).map((r) => toCard(r, fancy.cw));
  }, [pool, fancy, toCard]);

  const watchCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["tv", "television", "show", "film", "movie", "netflix", "streaming", "reality", "sitcom", "series", "watch", "drama"])), 6).map((r) => toCard(r, "crimson")), [pool, toCard]);
  const laughCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["comedy", "funny", "hilarious", "laugh", "humour", "humor", "comic"])), 6).map((r) => toCard(r, "gold")), [pool, toCard]);
  const popCards = useMemo(() => rotateDaily(pool.filter((r) => hasAny(r, ["celebrity", "gossip", "pop culture", "interview", "red carpet", "star"])), 6).map((r) => toCard(r, "plum")), [pool, toCard]);

  const summaryRows = useMemo(() => [
    { Icon: PartyPopper, label: "Today", text: firstName ? `${firstName}, what do you fancy? Something to watch, a laugh, a bit of gossip. No reason needed.` : "What do you fancy? Something to watch, a laugh, a bit of gossip. No reason needed." },
    { Icon: Sparkles, label: "The whole point", text: "Joy needs no justification. You don't have to earn this, recharge from it, or get anything useful out of it — fun is the point, full stop." },
    { Icon: Laugh, label: "And honestly", text: "A small playfulness study found short-term gains in well-being. That isn't a prescription for fun; this room is here because you might enjoy it." },
  ], [firstName]);

  return (
    <div className="fw-good-clean fw-delight-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press"
          style={{ width: 44, height: 44, borderRadius: 999, border: "1px solid #EAE7E0", background: "#fff", color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <header className="fw-good-hero fw-delight-hero"><span className="fw-good-path">GOOD LIFE / DELIGHT</span><span className="fw-delight-petals" aria-hidden="true"/><span className="fw-delight-halo" aria-hidden="true"/><h1>Delight</h1><p>What sounds fun? Pick a mood. The rest can wait.</p></header>
        <details className="fw-good-context"><summary>A note for today <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">{summaryRows.map(({ Icon, label, text }) => <div key={label} className="fw-good-context-row"><Icon size={16} aria-hidden="true"/><div><strong>{label}</strong><p>{text}</p></div></div>)}</div></details>

        {/* A · WHAT DO YOU FANCY — the picker (incl. Surprise me = the anti-decision-fatigue) */}
        <Section Icon={PartyPopper} title="What do you fancy?" accent={cwOf(fancy.cw).petal}
          sub="Pick one, or let us surprise you.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {FANCY.map((f) => { const on = f.key === fancy.key; const c = cwOf(f.cw).petal; return (
              <button key={f.key} onClick={() => setFancy(f)} className="fw-elite-press" aria-pressed={on}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? "#51444e" : `${c}14`, border: `1px solid ${on ? "#51444e" : c + "55"}`, color: on ? "#fff" : "#51444e", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <f.Icon size={14} /> {f.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{fancy.line}</p>
          <Shelf room="del" cards={fancyPicks} onOpen={setExpanded} empty={itemsStatus === "error" ? "" : itemsStatus === "loading" ? "Finding something fun…" : "Nothing for this mood just now. Try another."} />
          {itemsStatus === "error" && <div className="fw-good-load-error" role="alert">The picks didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setRetryKey(value => value + 1); }}>Try again</button></div>}
        </Section>

        <a href={createPageUrl("Community?view=games")} className="fw-elite-press fw-delight-play"><Dices size={22} aria-hidden="true"/><span><strong>Fancy a game?</strong><small>Open the Games Room in Community</small></span><span aria-hidden="true">→</span></a>

        <details className="fw-good-library"><summary>Today's extra pick · watch · laugh · pop culture <span aria-hidden="true">+</span></summary>

        {/* one purely joyful thing — daily, no task attached */}
        {joyOfTheDay && (
          <Section Icon={Sparkles} title="One purely joyful thing" accent={cwOf("blush").petal}
            sub="Today's, chosen for no reason but that it's lovely.">
            <Shelf room="del" cards={[joyOfTheDay]} onOpen={setExpanded} />
          </Section>
        )}

        {/* B · SOMETHING TO WATCH — the biggest pool */}
        <Section Icon={Tv} title="Something to watch" accent={cwOf("crimson").petal}
          sub="Telly, films, the good trash and the great stuff both. No completion bar — watch one thing and stop, if you like.">
          <Shelf room="del" cards={watchCards} onOpen={setExpanded} empty="No watch here just now." />
        </Section>

        {/* C · A GOOD LAUGH */}
        <Section Icon={Laugh} title="A good laugh" accent={gold}
          sub="Comedy, the funny stuff, the daft stuff. Genuinely one of the kindest things you can do for yourself.">
          <Shelf room="del" cards={laughCards} onOpen={setExpanded} empty="No laugh here just now." />
        </Section>

        {/* D · POP CULTURE & GOSSIP — bonding/fun, never cruelty */}
        <Section Icon={Star} title="Pop culture & a bit of gossip" accent={cwOf("plum").petal}
          sub="Who's doing what, who wore what, what everyone's talking about. Delighting in other lives — the warm kind, not the mean kind.">
          <Shelf room="del" cards={popCards} onOpen={setExpanded} empty="No pop culture here just now." />
        </Section>

        </details>

        {/* F · CARRY IT ON */}
        <details className="fw-good-library"><summary>Carry it on · Jess, Community, Planner, Journal <span aria-hidden="true">+</span></summary>
        <Section Icon={MessageCircle} title="Carry it on" accent={cwOf("crimson").petal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: Sparkles, cw: "gold", label: "Ask Jess to make you laugh", sub: "\"Tell me something ridiculous / recommend me something fun / cheer me up.\"", href: createPageUrl("Jess") },
              { Icon: MessageCircle, cw: "plum", label: "\"What are you watching?\" in Community", sub: "The best recommendations come from people, not algorithms.", href: createPageUrl("Community") },
              { Icon: CalendarHeart, cw: "crimson", label: "Book some joy into your week", sub: "A gig, a comedy night, a night in with nothing planned — put it in the Planner.", href: createPageUrl("Planner") },
              { Icon: Feather, cw: "sage", label: "Savour it in your Journal", sub: "The bit that made you laugh out loud — worth keeping. Savouring is half the joy.", href: createPageUrl("Journal") },
            ].map((r) => {
              const c = cwOf(r.cw).petal;
              return (
                <a key={r.label} href={r.href} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: "#fff", border: "1px solid #EAE7E0", borderLeft: `3px solid ${c}`, borderRadius: 16, padding: "11px 13px", cursor: "pointer", textDecoration: "none" }}>
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
        </details>

        <div style={{ textAlign: "center", margin: "28px 0 0" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, maxWidth: 340, lineHeight: 1.55, margin: "0 auto" }}>
            Fun counts. No footnotes.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError} />}
    </div>
  );
}
