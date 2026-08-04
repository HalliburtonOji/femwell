// ─────────────────────────────────────────────────────────────────────────────
// growthKit.jsx — shared kit for the GROWTH / CONNECTION demo set (preview-only).
//
// Powers the Phase-0 demos that bake Halli's approved directions into EXISTING
// pages (no new nav tab), all on the v4 living-ecosystem grammar:
//   • daily INTENTIONS (set · carry · reflect — via the §6.7.6 quick-action popup)
//   • the LINE OF THE DAY (a soulful, user-specific almanac line)
//   • GOALS (long = perennial/tree · short = annual/flowering plant)
//   • tiny MISSIONS (small whole-life quests; done → a bloom grows / pollinator)
//   • the big-life BUCKET LIST (long-arc quests = trees; e.g. "go to Spain")
//   • solo DAYS-OFF activities (found FOR her — ONE pick, not a catalogue)
//   • Tier 0 ANONYMOUS connection (resonance + async prompt rooms — NO 1:1)
//
// HELD (NOT built here, flagged via <HeldFlag>): any 1:1 / sealed-letter pen-pal /
// matching / DMs — those wait on Halli's explicit safety sign-off (moderation
// model · 18+ gate · no location). See CONNECTION-DAYS-MISSIONS-BRAINSTORM.html §6.
//
// Pure front-end: seed data + a deterministic daily picker (the line-of-day engine
// the bible spec'd as floraOmen.js). Writes in the real app ride existing
// dispatchers (RitualsTick/HabitLogs/PlannerItems) — NO new function. New entities
// (Intention/Goal/BucketItem) are fine. Reuses brand Card/PageTop/flora — does NOT
// edit flora.jsx / BRAND_IDENTITY.md (bible owner).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Sparkles, Feather, Sprout, Flower2, TreePine, Heart, MapPin, Compass,
  Plus, ChevronRight, RefreshCw, MessageCircle, Users, Sun } from "lucide-react";
import { T, UI, SERIF, Eyebrow } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA } from "@/components/brand/Card";
import { RichBloomV2, FlowerGlyph, Pollinator, floraKeyframes } from "@/components/brand/flora";
import { LifecycleStage } from "@/components/brand/floraLibrary";

// ── motion (grow-on-complete) — transform/opacity only, reduced-motion gated ────
export const growKeyframes = `
@keyframes fwgGrow{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes fwgRise{0%{transform:translateY(8px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes fwgSheet{0%{transform:translateY(100%)}100%{transform:translateY(0)}}
@keyframes fwgScrim{0%{opacity:0}100%{opacity:1}}
@media (prefers-reduced-motion:reduce){.fwg-anim{animation:none!important}}`;

// ── deterministic daily pick (the bible's daily-seed rotation; no backend) ──────
export function daySeed(extra = "") {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${extra}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h >>> 0);
}
export const pickDaily = (arr, extra = "") => arr[daySeed(extra) % arr.length];

// ═══════════════════════════════ SEED DATA ═══════════════════════════════════

// Whole-life intention suggestions (present + values-led, never a to-do). RULE 2.
export const INTENTION_SUGGESTIONS = [
  "be brave about the work thing", "go gently — it's a rest week", "actually reply to her",
  "make something, badly, for fun", "protect one hour for me", "say the kind thing out loud",
  "spend nothing today", "notice one good thing",
];

// The line of the day — soulful, "a little witch", honest fallback. (Demo bank;
// in-app the engine assembles from her real signals.)
export const LINES_OF_DAY = [
  { line: "A snowdrop morning — and you said you'd be brave about the work thing. Good. They say the first bird of the day carries the news, so keep your phone close.",
    why: "Snowdrop = hope, for a follicular fresh-start day · the robin omen (news) · your intention: be brave." },
  { line: "Rest week, and a grey one. Even the bees are having a lie-in. Do less, on purpose — the garden won't mind.",
    why: "Luteal rest season · a low-energy signal · the kettle-rule wink keeps it from going saccharine." },
  { line: "Three weeks of tending that little courage-plant and it's nearly in bud. Today's a watering day, nothing more. Small and steady wins this one.",
    why: "Your nearest goal is close to a milestone · today = a 'tend' nudge, not a push." },
];

// Tiny missions — whole-life, no-guilt, each grows a meaning-flower / earns a pollinator.
export const TINY_MISSIONS = [
  { id: "m-friend", domain: "Friendship", text: "Send one woman a kind message — no agenda.", flower: "sunflower", accent: T.gold, icon: Heart, reward: "a bee finds your honeysuckle", creature: "bee" },
  { id: "m-new", domain: "Novelty", text: "Try one new thing today, however small.", flower: "cosmos", accent: "#8E6E8E", icon: Sparkles, reward: "a new bud opens", creature: "butterfly" },
  { id: "m-walk", domain: "Nature", text: "A 20-minute walk — notice one bit of wonder (an awe walk).", flower: "cornflower", accent: "#5F7E8E", icon: Sun, reward: "the garden gets watered", creature: "dragonfly" },
  { id: "m-reach", domain: "Reaching out", text: "Reply to the message you've been avoiding.", flower: "snowdrop", accent: "#8FAF8F", icon: MessageCircle, reward: "a vine grows a leaf", creature: "butterfly" },
  { id: "m-make", domain: "Creativity", text: "Make something badly, for fun. No one needs to see it.", flower: "poppy", accent: T.crimson, icon: Feather, reward: "a wild cosmos blooms", creature: "butterfly" },
  { id: "m-joy", domain: "Joy / rest", text: "Do one thing purely because it's nice.", flower: "lotus", accent: "#8E6E8E", icon: Flower2, reward: "a resting moth settles", creature: "moth" },
  { id: "m-brave", domain: "Courage", text: "Say the brave sentence — the one you keep rehearsing.", flower: "dahlia", accent: T.gold, icon: Sparkles, reward: "an inner-strength dahlia opens", creature: "butterfly" },
];

// Goals — long (perennial / young tree) + short (annual / flowering plant). Whole-life.
export const GOALS = [
  { id: "g-make", type: "long", domain: "Creativity · identity", title: "Become someone who makes things", stage: "tree", flower: "magnolia", accent: "#8E6E8E", progress: "tended 6 weeks", next: "15 minutes on the thing, today" },
  { id: "g-money", type: "long", domain: "Money", title: "A steadier relationship with money", stage: "sapling", flower: "primrose", accent: "#8FAF8F", progress: "tended 3 weeks", next: "check the one number you avoid" },
  { id: "g-course", type: "short", domain: "Career", title: "Finish the course", stage: "budding", flower: "marigold", accent: T.gold, progress: "4 of 6 modules", next: "module 5 this week" },
  { id: "g-out", type: "short", domain: "Friendship", title: "Three proper nights out this month", stage: "bloom", flower: "sunflower", accent: T.crimson, progress: "2 of 3", next: "pick a date for the third" },
];

// The BUCKET LIST — big-life missions (long arcs = trees). Travel/learn/experience/etc.
export const BUCKET_LIST = [
  { id: "b-spain", domain: "Travel", title: "Go to Spain", stage: "sapling", flower: "marigold", accent: "#E08A6A", why: "You've wanted Seville since the photos. A tree, not a to-do.", steps: ["pick a month", "set aside a little each week", "tell one person so it's real"] },
  { id: "b-piano", domain: "Learn", title: "Learn to play one whole song", stage: "budding", flower: "bluebell", accent: "#5F7E8E", why: "The piano you walk past. One song is a beginning.", steps: ["find the song", "10 minutes, twice a week", "play it to someone"] },
  { id: "b-swim", domain: "Experience", title: "Swim in the sea at dawn", stage: "seed", flower: "cornflower", accent: "#5F7E8E", why: "Wild, free, and yours. A seed for now.", steps: ["find a spot", "a warm towel + a flask", "go"] },
  { id: "b-write", domain: "Creative", title: "Write the thing you keep not writing", stage: "seed", flower: "poppy", accent: T.crimson, why: "It's allowed to be bad first.", steps: ["one page", "a regular hour", "finish a draft"] },
];

// Solo days-off activities — ONE pick at a time (choice-overload), whole-life, joyful.
export const DAYOFF_ACTIVITIES = [
  { id: "d-wander", title: "A slow wander + a proper coffee", why: "It's a clear day and you've been heads-down. Get outside — the data agrees (120 min/week in nature is the magic number).", kind: "Outdoors · solo", flower: "cornflower", accent: "#5F7E8E" },
  { id: "d-charity", title: "A charity-shop treasure hunt", why: "Cheap, novel, a little thrill of the find. Bring home one thing that's gloriously you.", kind: "Fashion · solo", flower: "tulip", accent: T.gold },
  { id: "d-paint", title: "Paint something, badly, for an hour", why: "No skill required, no one watching. Novelty is the point.", kind: "Creativity · solo", flower: "cosmos", accent: "#8E6E8E" },
  { id: "d-film", title: "A film, a blanket, nobody's permission", why: "It's a rest week and a grey one. Doing nothing, chosen on purpose, counts.", kind: "Rest · solo", flower: "lavender", accent: "#8E6E8E" },
  { id: "d-bake", title: "Bake the thing that smells like home", why: "Hands busy, mind quiet, a small reward at the end.", kind: "Home · solo", flower: "marigold", accent: "#E08A6A" },
  { id: "d-read", title: "A reading nook + the chapter you're on", why: "Carry on today's Daily Story somewhere comfortable, with a pot of tea.", kind: "Quiet · solo", flower: "bluebell", accent: "#5F7E8E" },
];

// Tier 0 — "someone like you" resonance (belonging by feeling, NO contact).
// HONESTY (C3): these are warm belonging lines, NOT live counts — so they must NOT state a
// specific fabricated number ("4 women…") or imply LOCATION ("nearby", which Community promises it
// never uses). A real k-anon aggregate ("N women in your season") needs a backend count and is a
// future signed-off item; until then the copy stays true-in-spirit without false precision.
export const RESONANCE = [
  { line: "Others in your season left lines like yours this week.", sub: "You're tending the same weather. No names, no contact — just company." },
  { line: "Women your age are planting brave-about-work intentions too.", sub: "The bees have been busy. You're not the only garden with this going on." },
  { line: "Other new mums felt overwhelmed this morning, then did one small thing.", sub: "Shared, gently. You're in good company." },
];

// Tier 0 — async season/domain prompt rooms (everyone answers the SAME prompt;
// reactions only, no DMs). The Letterloop pattern.
export const PROMPT_ROOMS = [
  { id: "r-dayoff", domain: "The Lighter Side", prompt: "What did your last proper day off look like?", count: 38, accent: T.gold, flower: "sunflower",
    answers: ["A walk and a cry, honestly. Both helped.", "Did absolutely nothing and felt no guilt for once.", "Took myself to the cinema. 10/10, would solo-date again."] },
  { id: "r-brave", domain: "Money & Work", prompt: "One brave thing you did at work this week?", count: 21, accent: "#8FAF8F", flower: "iris",
    answers: ["Asked for the pay review. Terrified. Did it.", "Said no to a meeting that should've been an email.", "Put my hand up for the project."] },
  { id: "r-season", domain: "Lounge", prompt: "What's blooming in your life right now?", count: 54, accent: T.crimson, flower: "poppy",
    answers: ["A friendship I'd nearly let go of.", "Finally, a bit of rest.", "A small creative thing that's just for me."] },
];

// ═══════════════════════════ GARDEN LIFECYCLE GLYPH ══════════════════════════
// The stage IS the meaning (bible §10.1): seed → sprout → budding → bloom →
// sapling → tree → orchard. Reuses the real bloom engine for bud/bloom; the
// seed/sprout/tree/orchard are small bespoke line-glyphs (NOT editing flora.jsx).
function SeedGlyph({ size = 56 }) {
  return (<svg width={size} height={size} viewBox="0 0 56 56" aria-hidden style={{ overflow: "visible" }}>
    <ellipse cx="28" cy="50" rx="12" ry="3" fill={T.muted} opacity="0.12" />
    <path d="M28 44 C20 40 20 26 28 18 C36 26 36 40 28 44 Z" fill="#9A7B4A" stroke={T.gold} strokeWidth="1.2" />
    <path d="M28 18 C28 28 28 38 28 44" stroke="#6B5840" strokeWidth="1" opacity="0.6" fill="none" />
  </svg>);
}
function SproutGlyph({ size = 56, color = T.sage }) {
  return (<svg width={size} height={size} viewBox="0 0 56 56" aria-hidden style={{ overflow: "visible" }}>
    <ellipse cx="28" cy="50" rx="13" ry="3" fill={T.muted} opacity="0.12" />
    <path d="M28 50 L28 28" stroke="#6E8E5E" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 32 C18 30 14 22 16 16 C24 16 30 22 28 32 Z" fill={color} opacity="0.9" stroke="#6E8E5E" strokeWidth="1" />
    <path d="M28 36 C38 34 42 26 40 20 C32 20 26 26 28 36 Z" fill={color} opacity="0.9" stroke="#6E8E5E" strokeWidth="1" />
  </svg>);
}
function TreeGlyph({ size = 64, color = T.sage, blooms = false, accent = T.blush }) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden style={{ overflow: "visible" }}>
    <ellipse cx="32" cy="59" rx="16" ry="3.4" fill={T.muted} opacity="0.13" />
    <path d="M32 59 L32 34" stroke="#6B5840" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 44 C26 40 24 36 24 33 M32 40 C38 37 41 34 42 31" stroke="#6B5840" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="32" cy="24" r="15" fill={color} opacity="0.55" />
    <circle cx="22" cy="30" r="9" fill={color} opacity="0.5" />
    <circle cx="43" cy="29" r="9" fill={color} opacity="0.5" />
    {blooms && [[24, 20], [38, 22], [32, 30], [44, 28], [20, 28]].map(([x, y], i) =>
      <circle key={i} cx={x} cy={y} r="2.6" fill={accent} stroke="#fff" strokeWidth="0.6" />)}
  </svg>);
}
function OrchardGlyph({ size = 96 }) {
  return (<span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2 }} aria-hidden>
    <TreeGlyph size={size * 0.62} color="#8FAF8F" blooms accent={T.blush} />
    <TreeGlyph size={size * 0.78} color="#8FAF8F" blooms accent={T.gold} />
    <TreeGlyph size={size * 0.6} color="#8FAF8F" blooms accent="#8E6E8E" />
  </span>);
}
// stage → glyph. Used everywhere a goal/intention/bucket item shows its growth.
export function GrowGlyph({ stage = "seed", size = 60, flower = "rose", color = T.sage, accent = T.blush }) {
  switch (stage) {
    case "seed": return <SeedGlyph size={size} />;
    case "sprout": return <SproutGlyph size={size} color={color} />;
    case "budding": return <LifecycleStage name="bud" size={size} />;
    case "bloom": return <RichBloomV2 form={flower} color={accent} accent={T.gold} size={size} animate soft idx={`gg-${flower}`} />;
    case "sapling": return <TreeGlyph size={size} color={color} blooms={false} />;
    case "tree": return <TreeGlyph size={size} color={color} blooms accent={accent} />;
    case "orchard": return <OrchardGlyph size={size} />;
    default: return <SeedGlyph size={size} />;
  }
}
const STAGE_LABEL = { seed: "Seed", sprout: "Sprouting", budding: "In bud", bloom: "Blooming", sapling: "Taking root", tree: "A standing tree", orchard: "Your orchard" };

// ═══════════════════════ THE QUICK-ACTION POPUP (§6.7.6) ═════════════════════
// Do the micro-task IN PLACE, then it ticks (NOT a link-out, NOT a bare checkbox).
// Brand sheet: paperHi, top-rounded, slide-up over scrim, .fw-sheet-safe clearance.
export function QuickActionSheet({ open, onClose, eyebrow, title, accent = T.gold, children, doneLabel = "Done", onDone }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    // lock background scroll while the sheet is open (restore on close)
    const prevOverflow = typeof document !== "undefined" ? document.body.style.overflow : "";
    if (typeof document !== "undefined") document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      if (typeof document !== "undefined") document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  // PORTAL to <body> so the sheet escapes any transformed/overflow-hidden ancestor
  // (cards, animated flora) — otherwise position:fixed gets trapped + clipped and the
  // panel sits weirdly over the card. This makes every quick-action popup a clean
  // full-screen scrim + bottom sheet (§6.7.6), correct z-index, anywhere it's used.
  return createPortal(
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <style>{growKeyframes}</style>
      <div onClick={onClose} className="fwg-anim" style={{ position: "absolute", inset: 0, background: "rgba(11,8,5,0.44)", animation: "fwgScrim .22s ease-out" }} />
      <div className="fwg-anim fw-sheet-safe" style={{ position: "relative", width: "100%", maxWidth: 520, maxHeight: "86vh", overflowY: "auto", background: T.paperHi, borderRadius: "22px 22px 0 0", borderTop: `1px solid ${T.paperDeep}`, boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", padding: 18, animation: "fwgSheet .3s cubic-bezier(.32,.72,.24,1)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            {eyebrow && <Eyebrow color={accent}>{eyebrow}</Eyebrow>}
            <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: T.ink, margin: "2px 0 0", lineHeight: 1.2 }}>{title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><X size={16} color={T.muted} /></button>
        </div>
        {children}
        {onDone && (
          <button onClick={onDone} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 14, background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><Check size={16} /> {doneLabel}</button>
        )}
      </div>
    </div>,
    document.body
  );
}

// ═══════════════════════════ THE "HELD / GATED" FLAG ═════════════════════════
// Marks the gated 1:1 / pen-pal / matching tiers as NOT built — awaiting Halli's
// explicit safety sign-off (moderation model · 18+ gate · no location).
export function HeldFlag({ title = "Held — awaiting your safety sign-off", lines = [] }) {
  return (
    <div style={{ maxWidth: 600, margin: "22px auto 0", padding: "0 16px" }}>
      <div style={{ background: "#FBEEE8", border: `1px solid ${T.crimson}`, borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.crimson, marginBottom: 6 }}>● {title}</div>
        {lines.map((l, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: "0 0 6px", lineHeight: 1.5 }}>{l}</p>)}
      </div>
    </div>
  );
}

// A small inline section eyebrow + note (used to label "where this bakes in").
export function BakeNote({ children }) {
  return <div style={{ maxWidth: 600, margin: "10px auto 0", padding: "0 16px" }}>
    <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, fontStyle: "normal" }}>{children}</p>
  </div>;
}

// ═══════════════════════════════ FEATURE CARDS ══════════════════════════════

// LINE OF THE DAY — the soulful almanac line, dated, script, tappable "why".
export function LineOfDayCard() {
  const [open, setOpen] = useState(false);
  const lod = pickDaily(LINES_OF_DAY, "lod");
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <FwCard accent={T.gold} Icon={Sun} eyebrow="The line of the day" flower="daffodil" snap={false} width="100%" minHeight={0} idx="lod"
      title={null} line={null}>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: "0.06em", marginBottom: 6 }}>{today}</div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: T.crimson, lineHeight: 1.4, margin: "0 0 10px" }}>{lod.line}</p>
      <button onClick={() => setOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, padding: 0 }}>
        Why this line? <ChevronRight size={14} />
      </button>
      <QuickActionSheet open={open} onClose={() => setOpen(false)} eyebrow="Today's reading" title="Why this line?" accent={T.gold} doneLabel="Lovely" onDone={() => setOpen(false)}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>{lod.why}</p>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Honest by design: with no real signal it's a gentle seasonal line — never a fake "big things coming." Assembled front-end from your own signals; no new function.</p>
      </QuickActionSheet>
    </FwCard>
  );
}

// DAILY INTENTION — set (popup) · carry (band) · reflect (popup, no guilt).
export function IntentionCard() {
  const [intention, setIntention] = useState(null);
  const [setOpen, setSetOpen] = useState(false);
  const [reflectOpen, setReflectOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [reflected, setReflected] = useState(null);
  const accent = T.crimson;
  return (
    <FwCard accent={accent} Icon={Sprout} eyebrow={intention ? "Today, you're tending" : "Plant the day"} flower="poppy" snap={false} width="100%" minHeight={0} idx="intent"
      title={intention ? null : "What do you want to plant today?"}
      line={intention ? null : "A 10-second morning ritual — a value, not a to-do. It rides your day as a quiet compass."}>
      {intention && (
        <div className="fwg-anim" style={{ animation: "fwgRise .3s ease-out" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: T.ink, margin: "0 0 8px", lineHeight: 1.25 }}>“{intention}”</p>
          {!reflected ? (
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 12 }}>Carried all day. Tonight, you can water it — no pass or fail.</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <FlowerGlyph variant="poppy" size={26} color={accent} idx="intent-done" />
              <span style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft }}>{reflected}</span>
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: "auto", paddingTop: 6 }}>
        {!intention
          ? <FwCardCTA accent={accent} onClick={() => setSetOpen(true)} icon={Sprout}>Set today's intention</FwCardCTA>
          : !reflected
            ? <FwCardCTA accent={accent} onClick={() => setReflectOpen(true)} icon={Flower2}>Reflect tonight</FwCardCTA>
            : <FwCardCTA accent={accent} onClick={() => { setIntention(null); setReflected(null); setDraft(""); }} icon={RefreshCw}>Plant another</FwCardCTA>}
      </div>

      {/* SET — suggestions + free text (the quick-action popup) */}
      <QuickActionSheet open={setOpen} onClose={() => setSetOpen(false)} eyebrow="Set · plant a seed" title="What do you want to plant today?" accent={accent}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
          {INTENTION_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => { setIntention(s); setSetOpen(false); }} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "7px 12px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.inkSoft, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="…or write your own"
          style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
        <button onClick={() => { if (draft.trim()) { setIntention(draft.trim()); setSetOpen(false); } }} disabled={!draft.trim()}
          style={{ width: "100%", marginTop: 12, background: draft.trim() ? accent : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default" }}>Plant it</button>
      </QuickActionSheet>

      {/* REFLECT — three soft options, never pass/fail */}
      <QuickActionSheet open={reflectOpen} onClose={() => setReflectOpen(false)} eyebrow="Reflect · water it" title={`How did “${intention}” grow today?`} accent={accent}>
        {[["It bloomed", "Lovely. That one's flowering in your garden now."],
          ["It half-grew", "Half is growth. Plants don't open in a day."],
          ["It rested", "Some seeds wait for better weather. No ledger here — plant it again tomorrow if it still matters."]].map(([opt, msg]) => (
          <button key={opt} onClick={() => { setReflected(msg); setReflectOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
            <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block" }}>{opt}</span>
            <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{msg}</span>
          </button>
        ))}
      </QuickActionSheet>
    </FwCard>
  );
}

// TINY MISSION — today's one optional quest; done → a bloom GROWS (no guilt).
export function TinyMissionCard({ mission }) {
  const m = mission || pickDaily(TINY_MISSIONS, "mission");
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  return (
    <FwCard accent={m.accent} Icon={m.icon} eyebrow={`Today's tiny mission · ${m.domain}`} flower={m.flower} snap={false} width="100%" minHeight={0} idx={`tm-${m.id}`}
      title={done ? null : m.text}
      line={done ? null : "One small thing. Optional, always. Skip it and it's just soil resting — never a broken streak."}>
      {done && (
        <div className="fwg-anim" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 0", animation: "fwgGrow .5s ease-out" }}>
          <RichBloomV2 form={m.flower} color={m.accent} accent={T.gold} size={92} animate soft idx={`tm-done-${m.id}`} />
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.inkSoft, textAlign: "center", margin: 0 }}>Done — {m.reward}. Lovely work.</p>
        </div>
      )}
      {skipped && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted }}>No mission today, then. That's soil resting, not a streak broken — it'll keep.</p>}
      {!done && !skipped && (
        <div style={{ marginTop: "auto", paddingTop: 6, display: "flex", gap: 8 }}>
          <FwCardCTA accent={m.accent} onClick={() => setOpen(true)} icon={Check}>Do it</FwCardCTA>
          <button onClick={() => setSkipped(true)} style={{ background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "0 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, cursor: "pointer", whiteSpace: "nowrap" }}>Not today</button>
        </div>
      )}
      <QuickActionSheet open={open} onClose={() => setOpen(false)} eyebrow={`Tiny mission · ${m.domain}`} title={m.text} accent={m.accent} doneLabel="I did it" onDone={() => { setDone(true); setOpen(false); }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>Do it now, or tick it once you have. When you do, {m.reward} — the garden notices.</p>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>They say kindness is the only crop that grows back toward the giver. Rides existing HabitLogs/dispatchers — no new function.</p>
      </QuickActionSheet>
    </FwCard>
  );
}

// GOAL — long (tree) / short (flowering plant), with its flora stage + next action.
export function GoalCard({ goal, onAdd }) {
  const g = goal;
  return (
    <FwCard accent={g.accent} Icon={g.type === "long" ? TreePine : Flower2} eyebrow={`${g.type === "long" ? "Long-term · a perennial" : "This season · an annual"} · ${g.domain}`} flower={g.flower} idx={`goal-${g.id}`}
      title={g.title} line={null}
      action={<FwCardCTA accent={g.accent} onClick={onAdd} icon={Plus}>Tend: {g.next}</FwCardCTA>}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0 10px" }}>
        <GrowGlyph stage={g.stage} size={56} flower={g.flower} accent={g.accent} color={T.sage} />
        <div>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: g.accent }}>{STAGE_LABEL[g.stage]}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft }}>{g.progress}</div>
        </div>
      </div>
    </FwCard>
  );
}

// BUCKET-LIST item — a big-life mission = a long arc (tree). Steps, why, no deadline.
export function BucketCard({ item }) {
  const b = item;
  const [open, setOpen] = useState(false);
  return (
    <FwCard accent={b.accent} Icon={MapPin} eyebrow={`Bucket list · ${b.domain}`} flower={b.flower} idx={`bucket-${b.id}`}
      title={b.title} line={b.why}
      action={<FwCardCTA accent={b.accent} onClick={() => setOpen(true)} icon={Compass}>See the path</FwCardCTA>}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0 10px" }}>
        <GrowGlyph stage={b.stage} size={58} flower={b.flower} accent={b.accent} color="#8FAF8F" />
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: b.accent }}>{STAGE_LABEL[b.stage]}</div>
      </div>
      <QuickActionSheet open={open} onClose={() => setOpen(false)} eyebrow={`Bucket list · ${b.domain}`} title={b.title} accent={b.accent} doneLabel="Keep tending" onDone={() => setOpen(false)}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px" }}>{b.why} A big mission is a <i>tree</i>, not a to-do — it grows across seasons, and each small step is a bud on the way up.</p>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: b.accent, marginBottom: 8 }}>The little steps</div>
        {b.steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "10px 12px", marginBottom: 7 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: `${b.accent}22`, color: b.accent, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{s}</span>
          </div>
        ))}
      </QuickActionSheet>
    </FwCard>
  );
}

// DAY OFF — ONE curated solo activity + "show me another" (choice-overload fix).
export function DayOffCard() {
  const [i, setI] = useState(daySeed("dayoff") % DAYOFF_ACTIVITIES.length);
  const a = DAYOFF_ACTIVITIES[i];
  return (
    <FwCard accent={a.accent} Icon={Sun} eyebrow={`A day for you · ${a.kind}`} flower={a.flower} idx={`do-${a.id}`}
      title={a.title} line={a.why}
      action={<FwCardCTA accent={a.accent} onClick={() => {}} icon={Heart}>Save it for the day</FwCardCTA>}
      onOpen={() => setI((i + 1) % DAYOFF_ACTIVITIES.length)} openLabel="Show me another">
    </FwCard>
  );
}

// RESONANCE — Tier 0 "someone like you" (k-anon, NO contact).
export function ResonanceCard() {
  const r = pickDaily(RESONANCE, "resonance");
  return (
    <FwCard accent="#8FAF8F" Icon={Users} eyebrow="Someone like you" flower="clover" idx="reso"
      title={r.line} line={r.sub}
      action={<div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 12, color: T.muted }}><Pollinator kind="bee" size={20} color={T.gold} animate idx="reso-bee" /> Anonymous · no contact · just company</div>}>
    </FwCard>
  );
}

// PROMPT ROOM — Tier 0 async room; everyone answers the SAME prompt, reactions only.
export function PromptRoomCard({ room }) {
  const r = room;
  const [open, setOpen] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <FwCard accent={r.accent} Icon={MessageCircle} eyebrow={`Prompt room · ${r.domain}`} flower={r.flower} idx={`pr-${r.id}`}
      title={r.prompt}
      line={`${r.count} women have answered this week. Async, anonymous, reactions only — no DMs, no profiles.`}
      action={answered
        ? <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f" }}><Check size={15} /> Added to the room</div>
        : <FwCardCTA accent={r.accent} onClick={() => setOpen(true)} icon={Feather}>Answer in the room</FwCardCTA>}>
      <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "9px 12px", margin: "2px 0 10px" }}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: r.accent, marginBottom: 4 }}>A few anonymous answers</div>
        {r.answers.map((ans, i) => <p key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "0 0 5px", lineHeight: 1.4 }}>“{ans}”</p>)}
      </div>
      <QuickActionSheet open={open} onClose={() => setOpen(false)} eyebrow={`Prompt room · ${r.domain}`} title={r.prompt} accent={r.accent}>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="Your answer, anonymously…"
          style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", resize: "vertical" }} />
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>Posted anonymously to everyone answering the same prompt. No names, no 1:1, kind-reactions only — the safe, Tier-0 way to feel less alone.</p>
        <button onClick={() => { setAnswered(true); setOpen(false); }} disabled={!draft.trim()} style={{ width: "100%", marginTop: 12, background: draft.trim() ? r.accent : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default" }}>Add to the room</button>
      </QuickActionSheet>
    </FwCard>
  );
}

// Shared keyframes injector (call once per page).
export function GrowthStyles() { return <style>{floraKeyframes + growKeyframes}</style>; }

// A centred column for the full-width feature cards (Intention/LineOfDay/Mission).
export function GrowthStack({ children, top = 18 }) {
  return <div style={{ maxWidth: 600, margin: `${top}px auto 0`, padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>;
}

// The growth legend — what each garden stage MEANS (the bible §10.1 mapping).
export function StageLegend() {
  const items = [
    { stage: "seed", label: "Seed", sub: "today's intention / a new quest" },
    { stage: "sprout", label: "Sprout", sub: "an intention you're carrying" },
    { stage: "bloom", label: "Bloom", sub: "a short goal reached" },
    { stage: "tree", label: "Tree", sub: "a long goal / a big-life mission" },
    { stage: "orchard", label: "Orchard", sub: "a whole life of tending" },
  ];
  return (
    <div style={{ maxWidth: 600, margin: "18px auto 0", padding: "0 16px" }}>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 18, padding: "16px 14px" }}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.sage, marginBottom: 10, paddingLeft: 4 }}>The stage is the meaning</div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {items.map((it) => (
            <div key={it.stage} style={{ flex: "0 0 104px", textAlign: "center" }}>
              <div style={{ height: 64, display: "grid", placeItems: "center" }}><GrowGlyph stage={it.stage} size={it.stage === "orchard" ? 78 : 54} flower="poppy" accent={T.blush} color={T.sage} /></div>
              <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.gold, marginTop: 4 }}>{it.label}</div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, lineHeight: 1.3 }}>{it.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
