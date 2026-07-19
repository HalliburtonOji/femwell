// ─────────────────────────────────────────────────────────────────────────────
// BloomprintDemo.jsx — PERSONAL FLORA IDENTITY ("your Bloomprint") · founder demo.
//
// Each woman has a signature flower + a garden that GROWS with real activity, plus
// gently EARNED layers (petals · rare blooms · stars · seasons) — collection, never
// score; additive-only, nothing wilts. It becomes her PRESENCE in Community (an
// anonymous bloom-avatar that's "hers in the room", reconciled with the botanical-
// alias system across three disclosure tiers she controls) and lives on her own
// Profile / Today / Garden. Built ON the existing companion + milestones + chapters.
//
// Reads REAL Garden data where available (companion identity, earned milestones,
// season chapters); falls back to a warm seeded persona so the demo is always full.
// Seeded + read-only — NO writes. Reachable at /BloomprintDemo (IDEAS pill → Current).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo } from "react";
import { T, SERIF, UI, PAPER_BG, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import {
  RichBloomV2, cwOf, fingerprintColourway, hashSeed, seededRng,
  Pollinator, FlowerGlyph, floraKeyframes,
} from "@/components/brand/flora";
import { baseCompanion, getCompanion, loadCompanionState } from "@/components/nurture/companion";
import { MILESTONES, localMilestones } from "@/components/nurture/milestones";
import { loadGardenChapters, chapterLabel, currentChapterKey, seasonOf, seasonColor } from "@/components/nurture/garden";
import { base44 } from "@/api/base44Client";
import {
  Sparkles, Star, Leaf, Users, Eye, EyeOff, User as UserIcon, Flower2,
  ChevronLeft, ChevronRight, Feather, HeartHandshake, Bird,
  Quote, Lock, Send, MapPin, X, Sprout,
} from "lucide-react";

const SCRIPT = '"Ephesis","Pinyon Script",cursive';

// growth stages (mirrors the Garden — engagement → stage; rest is a stage, never death)
const STAGES = [
  { key: "seed", min: 0, name: "Just planted", open: 0.12 },
  { key: "sprout", min: 4, name: "Sprouting", open: 0.3 },
  { key: "budding", min: 12, name: "Budding", open: 0.55 },
  { key: "blooming", min: 28, name: "Blooming", open: 0.82 },
  { key: "full", min: 60, name: "In full bloom", open: 1 },
];
const stageFor = (n) => { let s = STAGES[0]; for (const st of STAGES) if ((n || 0) >= st.min) s = st; return s; };

// RichBloomV2 renders lush heads; map the companion's 6 forms to a supported lush head
// (keeps her SPECIES meaning; small/pendant forms read washed-out big, like the hero §6.8).
const LUSH = { peony: "peony", daisy: "daisy", poppy: "poppy", forget: "forget", foxglove: "cosmos", fern: "camellia" };
const lushForm = (k) => LUSH[k] || "peony";

// the anonymous botanical alias (verbatim from Community.jsx — derived from an anon hash, no PII)
const ALIAS_ADJ = ["Wild", "Quiet", "Golden", "Soft", "Bright", "Gentle", "Bold", "Still", "Sunny", "Velvet", "Little", "Brave", "Wandering", "Calm", "Amber", "Silver"];
const ALIAS_NOUN = ["Poppy", "Fern", "Willow", "Rose", "Sage", "Ivy", "Bluebell", "Daisy", "Heather", "Marigold", "Clover", "Fox", "Wren", "Robin", "Lark", "Thistle", "Meadow", "Hazel", "Juniper", "Primrose"];
function botanicalAlias(hash) {
  const s = String(hash || "");
  if (!s) return "A friend";
  let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h = h >>> 0;
  return `${ALIAS_ADJ[h % ALIAS_ADJ.length]} ${ALIAS_NOUN[(h >> 5) % ALIAS_NOUN.length]}`;
}
const VEIL_FORMS = ["poppy", "daisy", "forget", "cosmos", "camellia", "marigold"];
const CW_KEYS = ["crimson", "blush", "gold", "sage", "plum", "lavender", "cream", "coral", "sky"];

// ── little reusable chrome ──────────────────────────────────────────────────
function Eyebrow({ children, color = T.gold }) {
  return <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color, marginBottom: 8 }}>{children}</div>;
}
function SectionTitle({ children }) {
  return <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 25, fontWeight: 600, color: OXBLOOD, lineHeight: 1.1 }}>{children}</div>;
}
const cardBase = (accent) => ({
  background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}14 100%)`,
  border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`,
  borderRadius: 18, padding: "16px 15px",
  boxShadow: "0 4px 20px rgba(58,44,26,.09), 0 1px 4px rgba(58,44,26,.05)",
  position: "relative", overflow: "hidden",
});

// a bloom in a soft disc — the reusable "presence" avatar
function BloomAvatar({ form, cw, size = 40, rare = false, ring = T.paperDeep }) {
  const c = cwOf(cw);
  return (
    <span style={{ position: "relative", width: size + 12, height: size + 12, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, background: `radial-gradient(circle, ${c.petal}20 0%, ${c.petal}0C 55%, transparent 72%)`, border: `1px solid ${rare ? T.gold : ring}`, boxShadow: rare ? `0 0 0 1px ${T.gold}66` : "none" }}>
      <RichBloomV2 form={lushForm(form)} color={c.petal} color2={c.tip} accent={c.accent} size={size} soft={false} headOnly animate={false} openness={0.92} idx={`av-${form}-${cw}-${size}`} />
    </span>
  );
}

// ── THE MEADOW — seeded neighbours (hand-authored, warm, UK, emoji-free). A visitable
// bloom exists ONLY at My-flower / Named tier; veiled blooms stand in the field but have
// no page. Everything shown is whitelist-safe (curated) — NEVER cycle/symptoms/journal. ──
const NEIGHBOURS = [
  {
    id: "rosewater", tier: "named", name: "Rosewater", form: "peony", cw: "crimson",
    stage: "In full bloom", quote: "You are allowed to take up space.",
    notes: ["Told my sister I loved her, out of nowhere. She cried — the good kind.", "Perimenopause club: we should absolutely have jackets."],
    earned: ["A year, grown", "Not alone"], seasons: 8,
    guests: [{ by: "Wild Fern", cw: "sage", text: "This landed for me today. Thank you." }],
  },
  {
    id: "juniper", tier: "named", name: "Juniper", form: "forget", cw: "sage",
    stage: "Blooming", quote: "Small and often beats big and never.",
    notes: ["Walked in the rain on purpose. Ten out of ten.", "Learning to like my knees. Progress: neutral, which is a win."],
    earned: ["Fifty lines", "A season kept"], seasons: 5,
    guests: [{ by: "Quiet Willow", cw: "plum", text: "Stealing 'small and often'." }],
  },
  {
    id: "poppy-anon", tier: "signature", name: null, form: "poppy", cw: "plum",
    stage: "Budding", quote: "The dark-chocolate square is a sound decision.",
    notes: ["Cosy socks deployed for the week.", "Made soup for a friend who's having a time of it."],
    earned: ["A full cycle, tracked"], seasons: 3,
    guests: [],
  },
  { id: "veil-1", tier: "veiled", form: "marigold", cw: "gold" },
  { id: "veil-2", tier: "veiled", form: "daisy", cw: "blush" },
];
const neighbourName = (n) => n.tier === "named" ? n.name : n.tier === "signature" ? botanicalAlias(n.id + "::community") : botanicalAlias(n.id + "::community");

// a small "seed-packet" note tucked in her border
function NoteChip({ text, cw }) {
  const c = cwOf(cw);
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c.petal}`, borderRadius: 11, padding: "9px 11px" }}>
      <Leaf size={13} color={c.petal} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

// a kind note left by a visitor — a tinted petal + line (cross-pollination made visible)
function GuestPetal({ g }) {
  const c = cwOf(g.cw);
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
      <span style={{ width: 14, height: 18, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: c.petal, opacity: 0.9, flexShrink: 0, marginTop: 2, transform: "rotate(-8deg)" }} />
      <div>
        <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.4 }}>{g.text}</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginLeft: 6 }}>— {g.by}</span>
      </div>
    </div>
  );
}

// THE BLOOM-AS-PLACE — her patch, as a visitor sees it (or an owner-preview). Meadow-native,
// not a corporate profile: her bloom, a pinned line, notes tucked in the border, the shareable
// shelf, her companion, and a guestbook. `isOwner` shows the privacy note; else a note composer.
function PatchView({ patch, isOwner, guests, onLeave, viewerCw, onClose }) {
  const [note, setNote] = useState("");
  const c = cwOf(patch.cw);
  const name = patch.name || botanicalAlias(patch.id + "::community");
  const tierChip = patch.tier === "named" ? "Named" : patch.tier === "owner" ? "Your bloom" : "My flower · no name";
  return (
    <div style={{ ...cardBase(c.petal), marginTop: 12, padding: 0, overflow: "hidden" }}>
      {/* header — the bloom, standing in her patch */}
      <div style={{ background: `radial-gradient(120% 90% at 50% 0%, ${c.petal}22 0%, transparent 60%), ${T.paperHi}`, padding: "18px 16px 14px", textAlign: "center", position: "relative" }}>
        {onClose && <button onClick={onClose} aria-label="Leave" style={{ position: "absolute", right: 12, top: 12, width: 28, height: 28, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><X size={15} /></button>}
        <div style={{ display: "inline-flex", position: "relative" }}>
          <RichBloomV2 form={lushForm(patch.form)} color={c.petal} color2={c.tip} accent={c.accent} size={110} soft={false} openness={0.95} animate idx={`patch-${patch.id}`} />
          <div style={{ position: "absolute", right: -6, top: 2 }}><Pollinator kind="bee" size={22} color={T.gold} color2={c.tip} pattern="bands" animate idx={`patch-cr-${patch.id}`} /></div>
        </div>
        <div style={{ fontFamily: SCRIPT, fontSize: 34, color: OXBLOOD, lineHeight: 1.05, marginTop: 2 }}>{name}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4, background: `${c.petal}18`, border: `1px solid ${c.petal}40`, borderRadius: 999, padding: "3px 11px" }}>
          <MapPin size={11} color={c.accent} />
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.inkSoft }}>{tierChip} · {patch.stage || "Blooming"}</span>
        </div>
      </div>

      <div style={{ padding: "4px 15px 16px" }}>
        {/* pinned quote */}
        {patch.quote && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "14px 0 4px" }}>
            <Quote size={18} color={c.petal} style={{ flexShrink: 0, marginTop: 3, transform: "scaleX(-1)" }} />
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18.5, fontWeight: 600, color: OXBLOOD, lineHeight: 1.3 }}>{patch.quote}</span>
          </div>
        )}

        {/* notes tucked in the border */}
        {patch.notes?.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Tucked in her border</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{patch.notes.map((n, i) => <NoteChip key={i} text={n} cw={patch.cw} />)}</div>
          </div>
        )}

        {/* shareable shelf — earned blooms + seasons (safe, never health) */}
        <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {patch.earned?.length > 0 && (
            <div style={{ flex: "1 1 140px" }}>
              <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: T.gold, marginBottom: 7 }}>Rare blooms</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{patch.earned.map((e) => (
                <span key={e} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${T.gold}14`, border: `1px solid ${T.gold}55`, borderRadius: 999, padding: "4px 10px", fontFamily: SERIF, fontSize: 12.5, color: T.ink }}><Star size={11} color={T.gold} fill={T.gold} /> {e}</span>
              ))}</div>
            </div>
          )}
          {patch.seasons != null && (
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: T.sage, marginBottom: 7 }}>Seasons kept</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}><Sprout size={14} color={T.sage} /> {patch.seasons}</span>
            </div>
          )}
        </div>

        {/* guestbook — kind notes left here */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.paperDeep}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
            <HeartHandshake size={15} color={c.petal} />
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, fontWeight: 600, color: OXBLOOD }}>Kind notes left here</span>
          </div>
          {guests.length === 0
            ? <div style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: T.muted, marginBottom: 10 }}>No notes yet — be the first to plant a petal.</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 12 }}>{guests.map((g, i) => <GuestPetal key={i} g={g} />)}</div>}

          {isOwner ? (
            <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "10px 12px", background: `${T.sage}12`, border: `1px solid ${T.sage}44`, borderRadius: 12 }}>
              <Lock size={15} color={T.sage} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: SERIF, fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}><b style={{ color: T.sage }}>What stays private.</b> Your cycle, symptoms, moods and journal are never shown here — only what you choose to pin. You approve every kind note before it settles.</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Leave a kind note…" maxLength={90} style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 14, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "10px 12px", outline: "none" }} />
              <button onClick={() => { const t = note.trim(); if (!t) return; onLeave({ by: "You", cw: viewerCw, text: t }); setNote(""); }} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, background: c.petal, color: "#fff", border: "none", borderRadius: 11, padding: "10px 13px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Send size={13} /> Plant</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BloomprintDemo() {
  const [userId, setUserId] = useState("demo-bloomprint");
  const [companion, setCompanion] = useState(() => baseCompanion("demo-bloomprint"));
  const [earnedKeys, setEarnedKeys] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [tier, setTier] = useState("veiled");         // veiled · signature · named
  const [petalPulse, setPetalPulse] = useState(0);    // gentle "leave a line → +1 petal" demo
  const [ready, setReady] = useState(false);
  const [visiting, setVisiting] = useState(null);     // which neighbour's patch is open
  const [guestbooks, setGuestbooks] = useState(() => Object.fromEntries(NEIGHBOURS.map((n) => [n.id, n.guests || []])));
  const [myGuests, setMyGuests] = useState([{ by: "Golden Marigold", cw: "gold", text: "Your garden made me smile. Keep going." }]);
  const leaveNote = (id, g) => setGuestbooks((gb) => ({ ...gb, [id]: [...(gb[id] || []), g] }));

  // hydrate from REAL garden data where available; keep the seeded persona as the floor
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        const id = me?.id || "demo-bloomprint";
        if (!alive) return;
        setUserId(id);
        setFirstName((me?.full_name || "").trim().split(/\s+/)[0] || "");
        await loadCompanionState(id).catch(() => {});
        if (!alive) return;
        setCompanion(getCompanion(id));
        const mk = localMilestones(id) || [];
        setEarnedKeys(mk.length ? mk : ["first_community_act", "journal_50", "season_showing_up"]); // warm demo floor
        const ch = await loadGardenChapters(id).catch(() => []);
        if (!alive) return;
        setChapters(Array.isArray(ch) ? ch.filter(Boolean) : []);
      } catch { /* fail-open: seeded persona stands */ }
      finally { if (alive) setReady(true); }
    })();
    return () => { alive = false; };
  }, []);

  // ── her Bloomprint (deterministic identity) ──
  const cw = useMemo(() => fingerprintColourway(userId), [userId]);          // HER hue (carries meaning)
  // seeded baselines computed ONCE per user (seededRng is stateful — never call it in the render body)
  const seeded = useMemo(() => {
    const r = seededRng(hashSeed(userId + "::bloomprint"));
    return { basePetals: 14 + Math.floor(r() * 26), todayPetals: 2 + Math.floor(r() * 3) };
  }, [userId]);
  const seasonKey = currentChapterKey();
  const season = seasonOf(seasonKey);

  // petals: additive-only unit of "showing up". Real activeDays where we have a chapter, else seeded.
  const curChapter = chapters.find((c) => c.chapter_key === seasonKey);
  const basePetals = curChapter?.active_days != null ? curChapter.active_days * 3 : seeded.basePetals;
  const petalsSeason = basePetals + petalPulse;
  const petalsToday = seeded.todayPetals + petalPulse;
  const stage = stageFor(petalsSeason);
  const nextStage = STAGES[Math.min(STAGES.length - 1, STAGES.indexOf(stage) + 1)];
  const toNext = Math.max(0, nextStage.min - petalsSeason);

  // rare blooms (earned milestones = collectibles) + the ones still to grow
  const earned = MILESTONES.filter((m) => earnedKeys.includes(m.key));
  const toGrow = MILESTONES.filter((m) => !earnedKeys.includes(m.key)).slice(0, 3);

  // stars — reserved for rare luminous moments (a return · a kindness · a season kept)
  const stars = [
    { label: "You came back", line: "A star for returning after a quiet stretch — that's the omen, really.", lit: true },
    { label: "A kindness held", line: "Someone held your words in the rooms. A star lit itself.", lit: earnedKeys.includes("first_community_act") },
    { label: "A season kept", line: "Thirty days across the months, come back to yourself.", lit: earnedKeys.includes("season_showing_up") },
    { label: "A year, grown", line: "Still to come — a year of small attentions.", lit: earnedKeys.includes("year_on_femwell") },
  ];

  // seasons — real chapters where present, else 4 seeded snapshots
  const seasonChips = (chapters.length ? chapters.slice(0, 6) : [
    { chapter_key: "2026-04", form_key: companion.form.key, season: "spring", active_days: 9 },
    { chapter_key: "2026-05", form_key: "forget", season: "spring", active_days: 14 },
    { chapter_key: "2026-06", form_key: "daisy", season: "summer", active_days: 21 },
    { chapter_key: seasonKey, form_key: companion.form.key, season, active_days: Math.round(petalsSeason / 3) },
  ]);

  const alias = botanicalAlias(userId + "::community");   // her room-persona name
  // veiled avatar seeded from the ANON hash (uncorrelated with her real identity)
  const veilSeed = hashSeed(userId + "::community");
  const veilForm = VEIL_FORMS[veilSeed % VEIL_FORMS.length];
  const veilCw = CW_KEYS[(veilSeed >>> 4) % CW_KEYS.length];

  const bloomName = companion.name || `${cw.label} ${companion.form.name}`;

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 64 }} className="fwc-anim">
      <style>{floraKeyframes}{`@keyframes bpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>

      {/* top bar */}
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/Ideas" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted, textDecoration: "none" }}><ChevronLeft size={15} /> Ideas</a>
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold }}>Founder demo · Identity</span>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "8px 16px 0" }}>

        {/* ── HERO — her signature bloom ─────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 6 }}>
          <div style={{ position: "relative", width: 230, height: 220, display: "grid", placeItems: "center" }}>
            <div aria-hidden style={{ position: "absolute", width: 200, height: 190, borderRadius: "50%", background: `radial-gradient(circle, ${cw.petal}22 0%, ${T.sage}12 48%, transparent 72%)`, animation: "fwcGlow 7s ease-in-out infinite" }} />
            <div style={{ animation: "bpFloat 6s ease-in-out infinite" }}>
              <RichBloomV2 form={lushForm(companion.form.key)} color={cw.petal} color2={cw.tip} accent={cw.accent} size={188} soft={false} openness={stage.open} animate idx="bp-hero" />
            </div>
            <div style={{ position: "absolute", right: 26, top: 22 }}>
              <Pollinator kind="butterfly" size={34} color="#8E6E8E" color2={T.gold} pattern="bands" animate idx="bp-cr" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <Heart size={15} />
            <span style={{ fontFamily: SCRIPT, fontSize: 42, lineHeight: 1.02, color: OXBLOOD }}>{bloomName}</span>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.muted, marginTop: 6, maxWidth: 330, lineHeight: 1.5 }}>
            Your signature bloom — {cw.label.toLowerCase()} for <b style={{ color: cw.accent, fontStyle: "normal" }}>{cw.meaning}</b>. Grown from how you show up, not what you finish.
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 11, background: `${cw.petal}18`, border: `1px solid ${cw.petal}44`, borderRadius: 999, padding: "6px 13px" }}>
            <Sparkles size={13} color={cw.accent} />
            <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink }}>{stage.name}{firstName ? ` · ${firstName}'s` : ""}</span>
          </div>
        </div>

        {/* identity facts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 20 }}>
          {[
            { Icon: Flower2, k: "Flower", v: companion.form.name, s: "your species — stays yours" },
            { Icon: Sparkles, k: "Colour", v: cw.label, s: cw.meaning },
            { Icon: Leaf, k: "Stage", v: stage.name, s: `${toNext > 0 ? `${toNext} petals to ${nextStage.name.toLowerCase()}` : "fully open"}` },
            { Icon: Star, k: "Season", v: chapterLabel(seasonKey), s: `${season} · a season kept` },
          ].map((f) => (
            <div key={f.k} style={cardBase(cw.petal)}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: `${cw.petal}1F`, display: "grid", placeItems: "center" }}><f.Icon size={13} color={cw.petal} /></span>
                <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: cw.petal }}>{f.k}</span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.15 }}>{f.v}</div>
              <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 2 }}>{f.s}</div>
            </div>
          ))}
        </div>

        {/* ── EARNED LAYERS ──────────────────────────────────────────────── */}
        <div style={{ marginTop: 28 }}>
          <Eyebrow>What she grows</Eyebrow>
          <SectionTitle>Gently earned, never spent</SectionTitle>
          <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5, margin: "8px 2px 0" }}>
            Four soft layers, all collection and never score. Everything here only ever gathers — nothing wilts, breaks, or can be lost.
          </p>

          {/* PETALS */}
          <div style={{ ...cardBase(cw.petal), marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD }}>Petals</div>
                <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>the everyday unit of showing up</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: cw.petal, lineHeight: 1 }}>{petalsSeason}</div>
                <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>this season</div>
              </div>
            </div>
            {/* petal dots — additive fill toward the next stage */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
              {Array.from({ length: Math.max(petalsSeason, nextStage.min) }).slice(0, 60).map((_, i) => (
                <span key={i} style={{ width: 9, height: 12, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: i < petalsSeason ? cw.petal : "transparent", border: `1px solid ${i < petalsSeason ? cw.petal : T.paperDeep}`, opacity: i < petalsSeason ? 0.85 : 0.5, transform: `rotate(${(i % 5 - 2) * 8}deg)` }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 10 }}>
              <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.35 }}>
                <b style={{ color: cw.petal }}>+{petalsToday} today.</b> A line written, a check-in, a meal, a kind reply — each settles a petal.
              </span>
              <button onClick={() => setPetalPulse((p) => p + 1)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, background: cw.petal, color: "#fff", border: "none", borderRadius: 999, padding: "9px 13px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                <Feather size={13} /> Leave a line
              </button>
            </div>
          </div>

          {/* RARE BLOOMS */}
          <div style={{ ...cardBase(T.gold), marginTop: 12 }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD }}>Rare blooms</div>
            <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 12 }}>earned through living — a shelf that's only yours</div>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {earned.map((m) => (
                <div key={m.key} style={{ flex: "0 0 auto", width: 92, textAlign: "center" }}>
                  <BloomAvatar form={m.form} cw="gold" size={54} rare />
                  <div style={{ fontFamily: SERIF, fontSize: 12.5, fontWeight: 600, color: T.ink, marginTop: 6, lineHeight: 1.2 }}>{m.title}</div>
                </div>
              ))}
              {toGrow.map((m) => (
                <div key={m.key} style={{ flex: "0 0 auto", width: 92, textAlign: "center", opacity: 0.42 }}>
                  <span style={{ display: "grid", placeItems: "center", width: 66, height: 66, margin: "0 auto", borderRadius: "50%", border: `1px dashed ${T.paperDeep}` }}><Leaf size={22} color={T.muted} /></span>
                  <div style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: T.muted, marginTop: 6, lineHeight: 1.2 }}>still to grow</div>
                </div>
              ))}
            </div>
          </div>

          {/* STARS */}
          <div style={{ ...cardBase("#8E6E8E"), marginTop: 12, background: `linear-gradient(165deg, #2E261B 0%, #3B3145 100%)`, borderColor: "#4A3F55" }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: "#F4EFE3" }}>Stars</div>
            <div style={{ fontFamily: UI, fontSize: 12, color: "#C9BEDA", marginBottom: 12 }}>the rare, luminous moments — a return, a kindness, a season</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {stars.map((s) => (
                <div key={s.label} style={{ display: "flex", gap: 9, alignItems: "flex-start", opacity: s.lit ? 1 : 0.4 }}>
                  <Star size={16} color={s.lit ? T.gold : "#8A7F99"} fill={s.lit ? T.gold : "none"} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: "#F4EFE3" }}>{s.label}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 12, color: "#D4CBE0", lineHeight: 1.35 }}>{s.line}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEASONS */}
          <div style={{ ...cardBase(T.sage), marginTop: 12 }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD }}>Seasons</div>
            <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 12 }}>your months, each a bloom — a resting season still counts</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {seasonChips.map((c) => (
                <div key={c.chapter_key} style={{ flex: "0 0 auto", width: 78, textAlign: "center" }}>
                  <BloomAvatar form={c.form_key} cw={CW_KEYS[hashSeed(c.chapter_key) % CW_KEYS.length]} size={44} ring={seasonColor(c.season)} />
                  <div style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 600, color: T.ink, marginTop: 5, lineHeight: 1.15 }}>{chapterLabel(c.chapter_key)}</div>
                  <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{c.active_days} {c.active_days === 1 ? "day" : "days"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── IN COMMUNITY ───────────────────────────────────────────────── */}
        <div style={{ marginTop: 30 }}>
          <Eyebrow color={T.crimson}>Where she's seen</Eyebrow>
          <SectionTitle>Unique in the rooms — as much or as little as she wants</SectionTitle>
          <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5, margin: "8px 2px 0" }}>
            Her flower becomes her <b>presence</b> when she posts — so she feels like <i>someone</i>, not a grey blank. Three tiers, and she chooses per room. Anonymous stays anonymous; personal only where she asks for it.
          </p>

          {/* tier switch */}
          <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
            {[
              { k: "veiled", label: "Veiled", Icon: EyeOff },
              { k: "signature", label: "My flower", Icon: Flower2 },
              { k: "named", label: "Named", Icon: UserIcon },
            ].map((t) => {
              const on = tier === t.k;
              return (
                <button key={t.k} onClick={() => setTier(t.k)} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 6px", borderRadius: 12, cursor: "pointer", background: on ? `${cw.petal}1A` : T.paperHi, border: `1px solid ${on ? cw.petal : T.paperDeep}`, boxShadow: on ? `0 0 0 1px ${cw.petal}` : "none", fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? cw.petal : T.muted }}>
                  <t.Icon size={13} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* mock post card */}
          {(() => {
            const isVeiled = tier === "veiled";
            const avForm = isVeiled ? veilForm : companion.form.key;
            const avCw = isVeiled ? veilCw : cw.key;
            const nameLine = tier === "named" ? (firstName || "Rosewater") : alias;
            const sub = tier === "veiled" ? "anonymous — a bloom seeded just for the rooms" : tier === "signature" ? "your real signature flower · still no name" : "your chosen name · shown only where you allow it";
            return (
              <div style={{ ...cardBase(T.crimson), marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
                  <BloomAvatar form={avForm} cw={avCw} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 800, color: T.ink }}>{nameLine}</div>
                    <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{sub}</div>
                  </div>
                  <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: T.muted }}>Friendship</span>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5 }}>
                  Made a new friend at 34 and I feel oddly nervous, like it's a first date. Anyone else find friendship harder to start than it used to be?
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {["held", "me too", "hear you"].map((r) => (
                    <span key={r} style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px" }}>{r}</span>
                  ))}
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.gold }}><Star size={12} fill={T.gold} color={T.gold} /> a kindness</span>
                </div>
              </div>
            );
          })()}

          {/* reconciliation note */}
          <div style={{ display: "flex", gap: 10, marginTop: 12, padding: "13px 14px", background: `${T.sage}12`, border: `1px solid ${T.sage}44`, borderRadius: 14 }}>
            <Eye size={17} color={T.sage} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}>
              <b style={{ color: T.sage }}>How it stays safe.</b> The veiled bloom is seeded from your <i>anonymous room-token</i>, not your account — so it's consistent across your thread but can't be traced back to you or your real garden. It never shows your growth or activity. The keeper of anonymity is the Talk-rooms system; this only decides the face.
            </div>
          </div>

          {/* cross-pollination — the research gem */}
          <div style={{ ...cardBase(T.gold), marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Bird size={16} color={T.gold} />
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OXBLOOD }}>Cross-pollination</span>
              <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".1em", color: T.gold, border: `1px solid ${T.gold}`, borderRadius: 6, padding: "2px 6px" }}>NEXT</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.45 }}>
              When someone holds your words, a bee carries a little of their colour back to your garden — an anonymous flower planted by a stranger's kindness. You feel connected, nobody's exposed.
            </div>
          </div>
        </div>

        {/* ── ON HER OWN PAGES ───────────────────────────────────────────── */}
        <div style={{ marginTop: 30 }}>
          <Eyebrow color={T.plum}>Where she lives with it</Eyebrow>
          <SectionTitle>On your own pages, it's fully yours</SectionTitle>

          {/* profile avatar preview */}
          <div style={{ ...cardBase(cw.petal), marginTop: 14, display: "flex", alignItems: "center", gap: 14 }}>
            <BloomAvatar form={companion.form.key} cw={cw.key} size={58} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: T.muted }}>Profile</div>
              <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: OXBLOOD, lineHeight: 1.1 }}>{firstName || "Your name"}</div>
              <div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>{cw.label} {companion.form.name} · {stage.name.toLowerCase()}</div>
            </div>
          </div>

          {/* today card preview */}
          <div style={{ ...cardBase(T.sage), marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: T.muted }}>Today · your garden</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>Tend <ChevronRight size={13} /></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <BloomAvatar form={companion.form.key} cw={cw.key} size={48} />
              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.45 }}>
                <b style={{ color: cw.petal }}>+{petalsToday} petals today.</b> {stage.name}. {toNext > 0 ? `${toNext} more and she opens a little further.` : "Fully open — and still growing seasons."}
              </div>
            </div>
          </div>
        </div>

        {/* ── YOUR BLOOM IS A PLACE ──────────────────────────────────────── */}
        <div style={{ marginTop: 30 }}>
          <Eyebrow color={cw.petal}>A place, not a profile</Eyebrow>
          <SectionTitle>Your bloom is a little patch that's you</SectionTitle>
          <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5, margin: "8px 2px 0" }}>
            When you open up (My-flower or Named), your bloom becomes a small place others can visit — a corner of the meadow that's yours. You curate it: a line you're holding, a few notes tucked in the border, the blooms and seasons you've earned, your companion. Never a corporate profile — <b>a garden patch that <i>is</i> you</b>. This is what a visitor sees:
          </p>
          <PatchView
            isOwner
            patch={{ id: "me", tier: "owner", name: bloomName, form: companion.form.key, cw: cw.key, stage: stage.name,
              quote: "Grown gently, at my own pace.",
              notes: ["Trying to end the day with one kind thought. Some days it's just 'the tea was nice.'", "Signed up for the pottery class. Terrified. Going anyway."],
              earned: earned.map((m) => m.title).slice(0, 3), seasons: seasonChips.length }}
            guests={myGuests} viewerCw={cw.key}
          />
        </div>

        {/* ── THE MEADOW — VISIT EACH OTHER ──────────────────────────────── */}
        <div style={{ marginTop: 30 }}>
          <Eyebrow color={T.sage}>One living thing</Eyebrow>
          <SectionTitle>The meadow — where blooms stand together</SectionTitle>
          <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5, margin: "8px 2px 0" }}>
            Your garden and the meadow are <b>one surface at different zooms</b>: your patch up close, the whole field wide, and a <b>visit</b> is walking up to another woman's bloom. Tap one to visit her patch and leave a kind note — a petal in her colour. Veiled blooms stand in the field too, but keep to themselves.
          </p>

          {/* the field — a strip of neighbour blooms */}
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "14px 2px 6px", scrollbarWidth: "none" }}>
            {NEIGHBOURS.map((n) => {
              const visitable = n.tier !== "veiled";
              const on = visiting === n.id;
              return (
                <button key={n.id} onClick={() => setVisiting(on ? null : n.id)} style={{ flex: "0 0 auto", width: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px", borderRadius: 14, cursor: "pointer", background: on ? `${cwOf(n.cw).petal}14` : T.paperHi, border: `1px solid ${on ? cwOf(n.cw).petal : T.paperDeep}`, opacity: visitable ? 1 : 0.72 }}>
                  <BloomAvatar form={n.form} cw={n.cw} size={44} ring={visitable ? cwOf(n.cw).petal : T.paperDeep} />
                  <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: visitable ? T.ink : T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 84 }}>{visitable ? neighbourName(n) : "A quiet bloom"}</span>
                  <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: visitable ? T.sage : T.muted }}>{visitable ? "visit" : "veiled"}</span>
                </button>
              );
            })}
          </div>

          {/* the open patch, or a prompt */}
          {(() => {
            const n = NEIGHBOURS.find((x) => x.id === visiting);
            if (!n) return <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, textAlign: "center", padding: "14px 0 2px" }}>Tap a bloom above to visit her patch.</div>;
            if (n.tier === "veiled") return (
              <div style={{ ...cardBase(T.muted), marginTop: 4, display: "flex", gap: 11, alignItems: "center" }}>
                <BloomAvatar form={n.form} cw={n.cw} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>A quiet bloom, keeping to herself.</div>
                  <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>She's veiled — present in the meadow, but her patch isn't open to visit. That's her choice, always honoured.</div>
                </div>
              </div>
            );
            return (
              <PatchView
                patch={{ id: n.id, tier: n.tier, name: n.tier === "named" ? n.name : null, form: n.form, cw: n.cw, stage: n.stage, quote: n.quote, notes: n.notes, earned: n.earned, seasons: n.seasons }}
                guests={guestbooks[n.id] || []} viewerCw={cw.key}
                onLeave={(g) => leaveNote(n.id, g)} onClose={() => setVisiting(null)}
              />
            );
          })()}

          {/* meadow-relationship note */}
          <div style={{ display: "flex", gap: 10, marginTop: 12, padding: "13px 14px", background: `${cw.petal}10`, border: `1px solid ${cw.petal}33`, borderRadius: 14 }}>
            <Flower2 size={17} color={cw.petal} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}>
              <b style={{ color: cw.petal }}>Garden and meadow are the same living thing.</b> Your Garden is your patch up close; the meadow is every opted-in patch standing together; visiting is a zoom into someone else's. Nothing new to learn — it's one place, seen near or far.
            </div>
          </div>
        </div>

        {/* ── THE KIND-GROWTH CONTRACT ───────────────────────────────────── */}
        <div style={{ marginTop: 30, ...cardBase(T.gold) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <HeartHandshake size={18} color={T.gold} />
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD }}>The kind-growth promise</span>
          </div>
          {[
            "Additive only — nothing wilts, breaks, or can be lost.",
            "Grown from showing up and reflecting, never from output or counts.",
            "A gap is a resting season, met with a welcome — never guilt.",
            "Every petal, bloom and star means something — no points for points.",
            "No leaderboards, no public tallies, no comparison. Just your garden.",
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: i ? 8 : 0 }}>
              <FlowerGlyph variant="daisy" size={15} color={T.gold} color2={T.sage} idx={`kg-${i}`} />
              <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.4 }}>{r}</span>
            </div>
          ))}
        </div>

        {/* closing */}
        <div style={{ display: "grid", placeItems: "center", margin: "26px 0 0" }}>
          <Pollinator kind="bee" size={30} color={T.gold} color2={cw.tip} pattern="bands" animate idx="bp-close" />
          <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "8px auto 0", maxWidth: 300, lineHeight: 1.55 }}>
            One garden, grown at your own pace — recognisably, unmistakably yours.
          </p>
        </div>
      </div>
    </div>
  );
}
