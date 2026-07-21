// Move — Track C board #2 (whole-life domain: movement for strength, energy, mood, pleasure
// and capability — NEVER punishment, shrinking, calorie-burn, "bounce back" or aesthetics).
// The governing test for every item and line: "would she do this even if it changed nothing
// about her body?"
//
// RESEARCHED brainstorm: claude-state/TRACKC_MOVE_BRAINSTORM.html (cited). Content MEASURED
// first (scratchpad/b44proj/measure_move.mjs): after the punishment/diet-culture DENYLIST,
// SAFE pool = 596 movement items, 394 playable videos (strength 194 · yoga 52 · pilates 48 ·
// dance 39 · run 29 · walk 26). No new entity/function — self-loads real PUBLISHED
// LifestyleItems + the existing UserProfile cycle phase.
//
// HONEST SCIENCE (do NOT launder slogans): movement→MOOD is strongly evidenced (SMD ~-0.4);
// "cycle-sync your workouts" / "stronger in follicular" is WEAK/contested — so the cycle
// element is a gentle editorial note about energy+mood, never a phase-programmed plan.
// Movement "snacks" (≤5 min) are genuinely evidence-backed (2022 Nature Medicine).
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Zap, Wind, Feather as FeatherIcon, Cloud, Sparkles, Moon, Dumbbell, HeartPulse, Footprints, Clock, MessageCircle, CalendarPlus } from "lucide-react";
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
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  // include summary/excerpt too — the denylist must catch diet-culture tone that hides in the
  // body copy (which renders on the card), not only the title. Err toward safety on this domain.
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));

const MOVE_KW = ["yoga", "pilates", "walk", "dance", "stretch", "mobility", "strength", "workout", "barre", "swim", "run", "hiit", "cardio"];
// the hard content-safety gate — movement as capability, never shrinking/punishment
const DENY = ["calorie", "burn ", "burning", "torch", "shred", "fat loss", "fat burn", "belly fat", "bounce back", "weight loss", "lose weight", "slim", "snatched", "flat tummy", "flat stomach", "beach body", "summer body", "bikini body", "bikini", "melt", "blast", "shrink", "get lean", "no excuses", "guilt", "earn your", "punish", "trim", "drop a dress", "waist", "abs in", "red carpet", "sculpt", "toned", "tone up", "snap back", "snapback", "transformation", "before and after", "get ready",
  // aesthetic body-part / body-sculpting framing — movement-as-shrinking by another name
  "booty", "peachy", "bubble butt", "bum workout", "six pack", "six-pack", "abs workout", "ab workout", "flat abs", "hourglass"];

// how do you want to move today — feeling-led, self-directed (low energy is a valid answer
// that gets a KIND response, never guilt). Each maps to content keywords + a warm line.
const FEELINGS = [
  { key: "energy", label: "Full of it", Icon: Zap, cw: "gold", kws: ["strength", "hiit", "cardio", "dance", "full body", "power"], line: "Good — spend it. Something that asks a lot of you and gives it back." },
  { key: "willing", label: "Low but willing", Icon: Wind, cw: "sage", kws: ["walk", "gentle", "beginner", "yoga", "mobility", "10 min", "low impact"], line: "Then keep it small and kind. A walk counts. Ten minutes counts. Showing up IS the win." },
  { key: "tense", label: "Wound up", Icon: FeatherIcon, cw: "plum", kws: ["stretch", "mobility", "yoga", "release", "restorative", "flexibility"], line: "Let it out through your body — stretch, release, unclench. Nothing to achieve." },
  { key: "foggy", label: "Foggy-headed", Icon: Cloud, cw: "sky", kws: ["walk", "outdoor", "run", "fresh air", "cardio"], line: "Move to clear it, not to fix it. A walk changes a mood faster than a to-do list." },
  { key: "play", label: "Playful", Icon: Sparkles, cw: "blush", kws: ["dance", "barre", "fun", "beginner"], line: "Then play. Dance it out, no one's watching, no form to get right." },
  { key: "rest", label: "Not today", Icon: Moon, cw: "lavender", kws: ["restorative", "gentle", "yoga", "breath", "stretch"], line: "Rest IS training — it's where you get stronger. Maybe just breathe and stretch, or nothing at all. That's allowed." },
];

// the ONE truthful cycle line — mostly mood + energy, never "you're stronger in X" (weak evidence)
const ENERGY_NOTE = {
  menstrual: "Bleed week — energy can dip and that's information, not weakness. Gentle movement often eases cramps and lifts mood; push only if it feels good.",
  follicular: "Energy often builds this week for many women. If you feel like doing more, this can be a good window — but the science on 'phase-programming' is weak, so go by how you actually feel.",
  ovulatory: "Often a high-energy stretch. Enjoy it if it's there — no need to chase it if it isn't.",
  luteal: "Energy can taper and your body runs a touch warmer (real, from progesterone). Be kind with intensity; movement still lifts mood reliably — that part IS well evidenced.",
};
const NOTE_LABEL = { menstrual: "Bleed week", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };

// evidence-backed micro-movement — ≤5 min bouts genuinely improve mood/fitness (2022 Nature Med)
const SNACKS = [
  "One song — put it on and dance the whole thing. That's a complete workout for your mood.",
  "A five-minute walk round the block. No shoes-and-kit ritual, just out the door.",
  "Ten slow shoulder rolls and a big stretch upward. Undo the desk.",
  "Take the stairs like you mean it — one flight, a little out of breath, done.",
  "Stand up and shake out every limb for 60 seconds. Silly on purpose.",
  "A doorway chest stretch, both sides, and three deep breaths. Open you back up.",
];

export default function Move() {
  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [feeling, setFeeling] = useState(FEELINGS[0]);
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

  // SAFE movement pool (denylist enforced) + sub-pools
  const pools = useMemo(() => {
    const move = items.filter((r) => (r.category === "Fitness" || (hasAny(r, MOVE_KW) && !["Food", "Nutrition"].includes(r.category))) && !hasAny(r, DENY));
    const strength = move.filter((r) => hasAny(r, ["strength", "weights", "resistance", "pull-up", "squat", "dumbbell", "power"]));
    const gentle = move.filter((r) => hasAny(r, ["yoga", "mobility", "stretch", "restorative", "gentle", "pilates", "breath"]));
    const mood = move.filter((r) => hasAny(r, ["walk", "outdoor", "dance", "mood", "mental", "fresh air", "run"]));
    return { move, strength, gentle, mood };
  }, [items]);

  // adapter → CoverCard item. VIDEO with a video_id gets `youtubeId` so it PLAYS ON THE FACE
  // (the Phase-2 card-face player) — one tap, in place, no navigation.
  const toCard = useCallback((r, cw) => {
    const isVid = String(r.media_type || "").toUpperCase() === "VIDEO" && r.video_id && r.is_embeddable !== false;
    return {
      id: r.id,
      title: decodeEntities(r.title || ""),
      subtitle: r.channel_name || r.source_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Fitness", cw,
      Icon: isVid ? "Film" : "HeartPulse",
      kind: isVid ? "Watch · Move" : "Read · Move",
      meta: [["Clock", r.duration_label || "a short one"]],
      ...(isVid ? { youtubeId: r.video_id } : {}),
    };
  }, []);

  const feelingPicks = useMemo(() => {
    const matches = pools.move.filter((r) => hasAny(r, feeling.kws));
    const src = matches.length >= 2 ? matches : pools.move;
    return rotateDaily(src, 4).map((r) => toCard(r, feeling.cw));
  }, [pools.move, feeling, toCard]);

  const strengthCards = useMemo(() => rotateDaily(pools.strength, 8).map((r) => toCard(r, "crimson")), [pools.strength, toCard]);
  const gentleCards = useMemo(() => rotateDaily(pools.gentle, 6).map((r) => toCard(r, "sage")), [pools.gentle, toCard]);
  const moodCards = useMemo(() => rotateDaily(pools.mood, 6).map((r) => toCard(r, "sky")), [pools.mood, toCard]);
  const snack = useMemo(() => SNACKS[dayOffset() % SNACKS.length], []);

  const summaryRows = useMemo(() => [
    { Icon: Zap, label: "Today", text: firstName ? `${firstName}, how do you want to MOVE today? Pick a feeling below — even "not today" gets a kind answer.` : "How do you want to move today? Pick a feeling below — even \"not today\" gets a kind answer." },
    { Icon: HeartPulse, label: "The one true thing", text: "Movement lifts mood — that's the best-evidenced part of all this. Not calories, not shrinking. How you feel after." },
    phase ? { Icon: Moon, label: "This week", text: `${NOTE_LABEL[phase]}: ${ENERGY_NOTE[phase]}` } : { Icon: Moon, label: "This week", text: "Add your cycle dates and this reads your energy, honestly, week by week." },
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
      <div className="fw-move-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 8px", scrollbarWidth: "none" }}>
        <style>{`.fw-move-shelf::-webkit-scrollbar{display:none}`}</style>
        {cards.map((it) => <div key={it.id} style={{ flex: "0 0 250px", height: 372 }}><CoverCard item={it} compact onOpen={() => setExpanded(it)} /></div>)}
      </div>
    ) : <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>{empty}</p>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Move" line="Movement for strength, energy and mood — for the pleasure of a body that can, never to shrink it."
          colorway="sage" bloom="cosmos" flankL="sunflower" flankR="iris" titleColor={OXBLOOD} creature="bee" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Move today" accent={sage} rows={summaryRows} /></div>

        {/* A · HOW DO YOU WANT TO MOVE TODAY — feeling-led return hook (low energy is a valid answer) */}
        <Section Icon={Zap} title="How do you want to move today?" accent={cwOf(feeling.cw).petal}
          sub="Not a plan, not a target — how you FEEL. Pick one; the movement meets you there.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {FEELINGS.map((f) => { const on = f.key === feeling.key; const c = cwOf(f.cw).petal; return (
              <button key={f.key} onClick={() => setFeeling(f)} className="fw-elite-press"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? c : `${c}14`, border: `1px solid ${on ? c : c + "55"}`, color: on ? "#fff" : c, fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <f.Icon size={14} /> {f.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{feeling.line}</p>
          <Shelf cards={feelingPicks} empty="Movement lands here as the library fills out." />
        </Section>

        {/* B · A MOVEMENT SNACK — evidence-backed micro-movement (≤5 min); a one-tap joy */}
        <Section Icon={Clock} title="A movement snack" accent={cwOf("gold").petal}
          sub="Five minutes counts — really counts (the science on tiny bouts is genuinely good). Today's:">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("gold").petal}`, borderRadius: 14, padding: "14px 16px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("gold").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Footprints size={17} color={cwOf("gold").petal} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.5 }}>{snack}</span>
          </div>
        </Section>

        {/* C · GET STRONGER (NOT SMALLER) — the deepest pool (194), framed as capability */}
        <Section Icon={Dumbbell} title="Get stronger — not smaller" accent={cwOf("crimson").petal}
          sub="Strength for what your body can DO: carry, lift, keep up, last. Nothing here is about size.">
          <Shelf cards={strengthCards} empty="Strength sessions land here as the library fills out." />
        </Section>

        {/* D · GENTLE IS TRAINING TOO — rest-is-training, restorative */}
        <Section Icon={Wind} title="Gentle is training too" accent={sage}
          sub="Yoga, mobility, a slow stretch — rest and ease are where you actually get stronger, not a lesser option.">
          <Shelf cards={gentleCards} empty="Gentle sessions land here as the library fills out." />
        </Section>

        {/* E · MOVE FOR YOUR MOOD — the one strongly-evidenced claim */}
        <Section Icon={HeartPulse} title="Move for your mood" accent={cwOf("sky").petal}
          sub="The most reliable thing movement does isn't to your body — it's to your head. A walk shifts a mood.">
          <Shelf cards={moodCards} empty="Mood-lifting movement lands here as the library fills out." />
        </Section>

        {/* F · CARRY IT ON — cross-surface */}
        <Section Icon={MessageCircle} title="Carry it on" accent={cwOf("plum").petal} sub="Move doesn't end here.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: MessageCircle, cw: "sage", label: "The movement room in Community", sub: "Celebratory, never competitive — small wins, honest low-energy days.", href: createPageUrl("Community") },
              { Icon: Sparkles, cw: "blush", label: "\"I don't want to but I know I should\"", sub: "Tell Jess that. She's a good friend for the not-wanting-to bit.", href: createPageUrl("Jess") },
              { Icon: CalendarPlus, cw: "gold", label: "Book a walk into your day", sub: "Put it in the Planner — a kept promise to yourself, not a chore.", href: createPageUrl("Planner") },
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
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, maxWidth: 330, lineHeight: 1.55, margin: "0 auto" }}>
            The test for anything here: would you do it even if it changed nothing about your body? Move for that.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} />}
    </div>
  );
}
