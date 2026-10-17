// Nest — Track C board #6 (whole-life domain: home, cosiness, food-as-comfort). Home as
// REFUGE — a soft place to land. NOT a project to optimise, not a performance, not a woman's
// duty. Cosiness is for HER rest, never so the place is "presentable".
//
// RESEARCHED brainstorm: claude-state/TRACKC_NEST_BRAINSTORM.html (cited). Content MEASURED
// first and found THIN + contaminated: the app's whole FOOD category is diet-culture/GLP-1
// (unusable — belongs in Nutrition). Genuine clean content = ~20 cosy-home + ~10 joy-recipes.
// So this is a deliberately LEAN board: two small real shelves carried by an EDITORIAL cosy-
// ritual pool (the spine — like Move's snacks / Curious's rabbit hole). No new entity/function.
//
// SCIENCE (Saxbe & Repetti, PSPB 2010, cited): women who experience home as RESTORATIVE have
// healthier cortisol + falling low mood across the day; men show no effect. So this is for HER.
// FIREWALLS: food→diet-culture (hard-excluded; NO deep-link to diet-heavy Nutrition); and the
// clutter/cortisol finding is NEVER weaponised into "tidy up, ladies" — cosiness is not a chore.
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Home, Flame, CookingPot, HeartHandshake, Lamp, Feather, CalendarHeart, Sparkles } from "lucide-react";
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

// keep OTHER domains' content out (this pool is polluted with fitness/fashion/music/diet)
const NOT = ["workout", "kettlebell", "dumbbell", "strength program", "cardio", "yoga", "pilates", "fitness", "blazer", "wardrobe", "outfit", "denim", "jeans", "skirt", "taylor swift", "album", "celebrity", "cycle", "hormone", "menopause"];
// the FOOD → DIET-CULTURE firewall (the sharpest edge). Comfort food is JOY, never a ledger.
const DIET = ["calorie", "kcal", "clean eating", "clean-eating", "weight loss", "lose weight", "healthy swap", "guilt-free", "guilt free", "low-cal", "low-calorie", "portion", "cheat meal", "cheat day", "macro", "detox", "eat this not that", "skinny", "slimming", "slim down", "flat tummy", "belly fat", "fat-burning", "burn fat", "diet plan", "shed", "glp-1", "glp1", "fasting", "superfood", "insulin", "gut health", "gut doctor", "probiotic", "protein", "fibermaxx", "food noise", "blue zone"];
const HOME_KW = ["cosy", "cozy", "hygge", "home decor", "interior", "homemaking", "slow living", "candle", "nesting", "make your home", "reading nook", "houseplant", "living room", "your space", "the home", "homeware", "sanctuary", "at home"];
const FOOD_KW = ["comfort food", "baking", "bake ", "home cooking", "home-cooked", "recipe", "one-pot", "one pound meals", "soup", "stew", "roast", "sunday lunch", "cocktail", "warming", "hearty", "in the kitchen with"];

// THE SPINE — editorial cosy rituals. Free/cheap, renter-friendly, never a chore or a "buy".
// Cosiness is a lamp and a blanket, not a Pinterest board or a budget.
const RITUALS = [
  "The lamp instead of the big light. Instantly kinder to the whole room.",
  "The good blanket out of the cupboard — the one you're 'saving'. Save it for tonight.",
  "A pot of something on the stove, just for the smell. It doesn't have to be dinner.",
  "Proper thick socks. The whole mood shifts, honestly.",
  "Tidy one surface — not the house, one surface — and let that be enough.",
  "Light a candle at 4pm, when the daylight goes flat.",
  "Make the bed properly once, so tonight you get into a made bed.",
  "A hot drink in your nicest mug, sat down, not carried around half-finished.",
  "Draw the curtains before dark and shut the day out.",
  "Move one chair to face the window.",
  "Put on the album that makes the place feel like yours.",
  "A hot water bottle — even in summer, even if it's just for your feet.",
  "One sprig of something green in a glass. That absolutely counts as flowers.",
  "Warm the room before you need it, so coming home feels like an arrival.",
  "Fairy lights are not only for Christmas. Say it with me.",
  "The soft playlist, low, while you potter about.",
  "Change the pillowcase — the small luxury of a fresh one against your face.",
  "Phone in another room for one hour. Let the room go quiet.",
  "The dressing gown at 6pm. No apology, no notes.",
  "Heat up soup and call it plenty. It is plenty.",
  "Rearrange one shelf so it pleases you every time you pass it.",
  "Ten minutes in the comfiest seat doing absolutely nothing useful.",
];

export default function Nest() {
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("");
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

  const homeCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && !hasAny(r, DIET) && hasAny(r, HOME_KW)), 8).map((r) => toCard(r, "gold")), [items]);
  const stoveCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && !hasAny(r, DIET) && hasAny(r, FOOD_KW)), 8).map((r) => toCard(r, "crimson")), [items]);
  const rituals = useMemo(() => rotateDaily(RITUALS, 4), []);

  function toCard(r, cw) {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = (mt === "PODCAST" || mt === "CLIP") && r.audio_url;
    return {
      type: mt === "VIDEO" ? "video" : isAudio ? "audio" : "article", _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
      id: r.id, title: decodeEntities(r.title || ""),
      subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Lifestyle", cw, Icon: isVid ? "Film" : isAudio ? "Headphones" : "Sparkles",
      kind: isVid ? "Watch · Nest" : isAudio ? "Listen · Nest" : "Read · Nest",
      meta: [["Clock", fmtDuration(r) || "a cosy few minutes"]],
      ...(isVid ? { youtubeId: r.video_id } : {}),
      ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }
  const summaryRows = useMemo(() => [
    { Icon: Home, label: "Today", text: firstName ? `${firstName}, make it cosy — for you, not for anyone coming over. A soft place to land is a real thing to make.` : "Make it cosy — for you, not for anyone coming over. A soft place to land is a real thing to make." },
    { Icon: Flame, label: "This is for you", text: "One small study linked how women described their homes with mood and daily cortisol patterns. It does not mean tidying fixes stress. This room is for comfort, not chores." },
    { Icon: Lamp, label: "No budget required", text: "Cosiness isn't a shopping list or a Pinterest board. It's a lamp instead of the big light, a blanket, thick socks. It works in a rented room and a shared house just the same." },
  ], [firstName]);


  return (
    <div className="fw-good-clean fw-nest-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press"
          style={{ width: 44, height: 44, borderRadius: 999, border: "1px solid #EAE7E0", background: "#fff", color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <header className="fw-good-hero fw-nest-hero"><span className="fw-good-path">GOOD LIFE / NEST</span><span className="fw-nest-jasmine" aria-hidden="true"/><span className="fw-nest-lamp" aria-hidden="true"/><h1>Nest</h1><p>Make the place feel like yours. No house tour required.</p></header>
        <details className="fw-good-context"><summary>A note for today <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">{summaryRows.map(({ Icon, label, text }) => <div key={label} className="fw-good-context-row"><Icon size={16} aria-hidden="true"/><div><strong>{label}</strong><p>{text}</p></div></div>)}</div></details>

        {/* A · SMALL COSY RITUALS — the editorial spine (real content is thin, and that's honest) */}
        <Section Icon={Flame} title="Small cosy rituals" accent={gold}
          sub="One idea for tonight. No list to finish.">
          {rituals[0] && <div className="fw-nest-one"><Lamp size={22} aria-hidden="true"/><p>{rituals[0]}</p></div>}
        </Section>

        <a href={createPageUrl("Community?room=lighter")} className="fw-elite-press fw-nest-door"><HeartHandshake size={21} aria-hidden="true"/><span><strong>Lighter Side</strong><small>Swap the cosy bits in Community</small></span><span aria-hidden="true">→</span></a>

        <details className="fw-good-library"><summary>More cosy ideas · home · something on the stove <span aria-hidden="true">+</span></summary>
        <Section Icon={Lamp} title="A few more small rituals" accent={gold}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {rituals.slice(1).map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#fff", border: "1px solid #EAE7E0", borderLeft: `3px solid ${gold}`, borderRadius: 16, padding: "12px 14px" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${gold}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Lamp size={15} color={gold} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* B · A COSY HOME — the ~20 genuine home items */}
        <Section Icon={Home} title="A cosy home" accent={cwOf("sage").petal}
          sub="Warmth, softness, small touches — for renters, tiny flats and shared houses just as much as anyone. No perfectionism invited.">
          <Shelf room="nest" cards={homeCards} onOpen={setExpanded} empty={itemsStatus === "error" ? "" : itemsStatus === "loading" ? "Finding home reads…" : "No home read just now."} />
        </Section>

        {/* C · SOMETHING ON THE STOVE — joy-recipes ONLY; diet-culture hard-excluded */}
        <Section Icon={CookingPot} title="Something on the stove" accent={cwOf("crimson").petal}
          sub="Food as comfort and pleasure — a stew, a bake, a proper Sunday something. Nothing to count, nothing to atone for.">
          <Shelf room="nest" cards={stoveCards} onOpen={setExpanded} empty={itemsStatus === "error" ? "" : itemsStatus === "loading" ? "Finding something for the stove…" : "No cooking read just now."} />
        </Section>
        {itemsStatus === "error" && <div className="fw-good-load-error" role="alert">The reads didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setRetryKey(value => value + 1); }}>Try again</button></div>}

        </details>

        {/* E · CARRY IT ON */}
        <details className="fw-good-library"><summary>Carry it on · Planner, Jess, Journal <span aria-hidden="true">+</span></summary>
        <Section Icon={Sparkles} title="Carry it on" accent={gold}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: CalendarHeart, cw: "gold", label: "Book a slow evening in", sub: "Nothing planned, nowhere to be — put it in the Planner like the treat it is.", href: createPageUrl("Planner") },
              { Icon: Sparkles, cw: "crimson", label: "Ask Jess to make tonight cosy", sub: "\"I've had a horrible day — help me make the flat feel kind for an hour.\"", href: createPageUrl("Jess") },
              { Icon: Feather, cw: "sage", label: "Keep the cosy in your Journal", sub: "The evening that felt like home — worth remembering on the hard days.", href: createPageUrl("Journal") },
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
            A kind room is plenty.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError} />}
    </div>
  );
}
