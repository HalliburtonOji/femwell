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
import { ArrowLeft, Home, Flame, CookingPot, HeartHandshake, Lamp, MessageCircle, Feather, CalendarHeart, Sparkles } from "lucide-react";
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

  const homeCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && !hasAny(r, DIET) && hasAny(r, HOME_KW)), 8).map((r) => toCard(r, "gold")), [items]);
  const stoveCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && !hasAny(r, DIET) && hasAny(r, FOOD_KW)), 8).map((r) => toCard(r, "crimson")), [items]);
  const rituals = useMemo(() => rotateDaily(RITUALS, 4), []);

  function toCard(r, cw) {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = (mt === "PODCAST" || mt === "CLIP") && r.audio_url;
    return {
      id: r.id, title: decodeEntities(r.title || ""),
      subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Lifestyle", cw, Icon: isVid ? "Film" : isAudio ? "Headphones" : "Sparkles",
      kind: isVid ? "Watch · Nest" : isAudio ? "Listen · Nest" : "Read · Nest",
      meta: [["Clock", r.duration_label || "a cosy few minutes"]],
      ...(isVid ? { youtubeId: r.video_id } : {}),
      ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }
  const summaryRows = useMemo(() => [
    { Icon: Home, label: "Today", text: firstName ? `${firstName}, make it cosy — for you, not for anyone coming over. A soft place to land is a real thing to make.` : "Make it cosy — for you, not for anyone coming over. A soft place to land is a real thing to make." },
    { Icon: Flame, label: "This is for you", text: "There's genuine research that a home you find restful lifts a woman's mood and calms her stress across the day. Not a tidy home — a KIND one. There's a difference." },
    { Icon: Lamp, label: "No budget required", text: "Cosiness isn't a shopping list or a Pinterest board. It's a lamp instead of the big light, a blanket, thick socks. It works in a rented room and a shared house just the same." },
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
      <div className="fw-nest-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)", maskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)" }}>
        <style>{`.fw-nest-shelf::-webkit-scrollbar{display:none}`}</style>
        {cards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 366 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
      </div>
    ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>{empty}</p>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Nest" line="Home as a soft place to land — cosy for your own comfort, never to be presentable. No budget, no Pinterest, no chores."
          colorway="gold" bloom="marigold" flankL="primrose" flankR="honeysuckle" titleColor={OXBLOOD} creature="bee" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Home today" accent={gold} rows={summaryRows} /></div>

        {/* A · SMALL COSY RITUALS — the editorial spine (real content is thin, and that's honest) */}
        <Section Icon={Flame} title="Small cosy rituals" accent={gold}
          sub="Tiny, free, no-effort ways to make the place kinder tonight. Pick one, or none — this is a permission slip, not a to-do list.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {rituals.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${gold}`, borderRadius: 13, padding: "12px 14px" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${gold}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Lamp size={15} color={gold} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* B · A COSY HOME — the ~20 genuine home items */}
        <Section Icon={Home} title="A cosy home" accent={cwOf("sage").petal}
          sub="Warmth, softness, small touches — for renters, tiny flats and shared houses just as much as anyone. No perfectionism invited.">
          <Shelf cards={homeCards} empty="Home reads land here as the library fills out." />
        </Section>

        {/* C · SOMETHING ON THE STOVE — joy-recipes ONLY; diet-culture hard-excluded */}
        <Section Icon={CookingPot} title="Something on the stove" accent={cwOf("crimson").petal}
          sub="Food as comfort and pleasure — a stew, a bake, a proper Sunday something. Nothing to count, nothing to atone for.">
          <Shelf cards={stoveCards} empty="Comfort cooking lands here as the library fills out." />
        </Section>

        {/* D · A SOFT PLACE FOR PEOPLE — Community doorway (not a shelf) */}
        <Section Icon={HeartHandshake} title="A soft place for people" accent={cwOf("plum").petal}
          sub="A home is also who you let in. Swap the small stuff — what's cooking, what's cosy — with people who get it.">
          <a href={createPageUrl("Community")} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("plum").petal}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: `${cwOf("plum").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><MessageCircle size={20} color={cwOf("plum").petal} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>Home &amp; hearth, in Community</span>
              <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>The comfort-swap: what you're cooking, what's keeping you cosy, no showing off.</span>
            </span>
          </a>
        </Section>

        {/* E · CARRY IT ON */}
        <Section Icon={Sparkles} title="Carry it on" accent={gold} sub="Nest doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: CalendarHeart, cw: "gold", label: "Book a slow evening in", sub: "Nothing planned, nowhere to be — put it in the Planner like the treat it is.", href: createPageUrl("Planner") },
              { Icon: Sparkles, cw: "crimson", label: "Ask Jess to make tonight cosy", sub: "\"I've had a horrible day — help me make the flat feel kind for an hour.\"", href: createPageUrl("Jess") },
              { Icon: Feather, cw: "sage", label: "Keep the cosy in your Journal", sub: "The evening that felt like home — worth remembering on the hard days.", href: createPageUrl("Journal") },
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
            Your home doesn't have to be finished, tidy, or anyone's idea of nice. It just has to be kind to the one person who lives your life — you.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
