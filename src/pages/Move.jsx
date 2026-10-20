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
// NHS start-small guidance supports optional short activity; one snack is not
// a complete workout or a promised mood result.
import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Zap, Wind, Feather as FeatherIcon, Cloud, Sparkles, Moon, Dumbbell, HeartPulse, Footprints, Clock, MessageCircle, CalendarPlus } from "lucide-react";
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
  { key: "energy", label: "Full of it", Icon: Zap, cw: "gold", kws: ["strength", "hiit", "cardio", "dance", "full body", "power"], line: "Got energy? Put it somewhere fun." },
  { key: "willing", label: "Low but willing", Icon: Wind, cw: "sage", kws: ["walk", "gentle", "beginner", "yoga", "mobility", "10 min", "low impact"], line: "Keep it small. A little still counts." },
  { key: "tense", label: "Wound up", Icon: FeatherIcon, cw: "plum", kws: ["stretch", "mobility", "yoga", "release", "restorative", "flexibility"], line: "Stretch, unclench, let the day go." },
  { key: "foggy", label: "Foggy-headed", Icon: Cloud, cw: "sky", kws: ["walk", "outdoor", "run", "fresh air", "cardio"], line: "Fresh air might help. No promises." },
  { key: "play", label: "Playful", Icon: Sparkles, cw: "blush", kws: ["dance", "barre", "fun", "beginner"], line: "Dance badly. That's allowed." },
  { key: "rest", label: "Not today", Icon: Moon, cw: "lavender", kws: ["restorative", "gentle", "yoga", "breath", "stretch"], line: "Rest counts. So does doing absolutely nothing." },
];

// the ONE truthful cycle line — mostly mood + energy, never "you're stronger in X" (weak evidence)
const ENERGY_NOTE = {
  menstrual: "Bleed week — energy can dip and that's information, not weakness. Gentle movement often eases cramps and lifts mood; push only if it feels good.",
  follicular: "Energy often builds this week for many women. If you feel like doing more, this can be a good window — but the science on 'phase-programming' is weak, so go by how you actually feel.",
  ovulatory: "Often a high-energy stretch. Enjoy it if it's there — no need to chase it if it isn't.",
  luteal: "Energy can taper and your body runs a touch warmer (real, from progesterone). Be kind with intensity; movement still lifts mood reliably — that part IS well evidenced.",
};
const NOTE_LABEL = { menstrual: "Bleed week", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal" };

// Six optional small moves, with no promise that one minute is a workout or treatment.
const SNACKS = [
  "Put on one song and dance until it ends. The kitchen floor doesn't mind your technique.",
  "Walk for five minutes, inside or out. Turn round whenever you like.",
  "Roll your shoulders, reach up, let your arms fall. Your desk can wait.",
  "Take one flight of stairs if that appeals. No stopwatch, no second flight owed.",
  "Shake out your arms and legs for a minute. Yes, it looks ridiculous. That's fine.",
  "Try a gentle doorway chest stretch on each side, then a few easy breaths. Stop if it feels uncomfortable.",
];

export default function Move() {
  const [items, setItems] = useState([]);
  const [itemsStatus, setItemsStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [phase, setPhase] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [feeling, setFeeling] = useState(FEELINGS[0]);
  const [expanded, setExpanded] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const { saved, saveError, onSave } = useGoodLifeKeep(ownerId, expanded);
  const sage = cwOf("sage").petal;

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
  }, [retryKey]);

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
    const isAudio = String(r.media_type || "").toUpperCase() === "PODCAST" && !!r.audio_url;
    return {
      id: r.id,
      type: String(r.media_type || "").toUpperCase() === "VIDEO" ? "video" : isAudio ? "audio" : "article",
      _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
      title: decodeEntities(r.title || ""),
      subtitle: r.channel_name || r.source_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Fitness", cw,
      Icon: String(r.media_type || "").toUpperCase() === "VIDEO" ? "Film" : isAudio ? "Headphones" : "HeartPulse",
      kind: String(r.media_type || "").toUpperCase() === "VIDEO" ? "Watch · Move" : isAudio ? "Listen · Move" : "Read · Move",
      meta: [["Clock", fmtDuration(r) || "a short one"]],
      ...(isVid ? { youtubeId: r.video_id } : {}),
      ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
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
    { Icon: Zap, label: "Today", text: firstName ? `${firstName}, pick the feeling that fits. “Not today” counts too.` : "Pick the feeling that fits. “Not today” counts too." },
    { Icon: HeartPulse, label: "Worth knowing", text: "A little movement can help your mood. No promise, no pressure." },
    phase ? { Icon: Moon, label: "This week", text: `${NOTE_LABEL[phase]}: ${ENERGY_NOTE[phase]}` } : { Icon: Moon, label: "This week", text: "Add your cycle dates and this reads your energy, honestly, week by week." },
  ], [firstName, phase]);

  return (
    <div className="fw-good-clean fw-move-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press"
          style={{ width: 44, height: 44, borderRadius: 999, border: "1px solid #EAE7E0", background: "#fff", color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <header className="fw-good-hero fw-move-hero">
          <span className="fw-good-path">GOOD LIFE / MOVE</span>
          <span className="fw-move-flower" aria-hidden="true" />
          <span className="fw-move-track" aria-hidden="true" />
          <h1>Move</h1><p>Any amount counts. Even the tiny, kitchen-dance amount.</p>
        </header>
        <details className="fw-good-context"><summary>A note for today <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">{summaryRows.map(({Icon,label,text}) => <div key={label} className="fw-good-context-row"><Icon size={16} aria-hidden="true"/><div><strong>{label}</strong><p>{text}</p></div></div>)}</div></details>

        {/* A · HOW DO YOU WANT TO MOVE TODAY — feeling-led return hook (low energy is a valid answer) */}
        <Section Icon={Zap} title="Move your way" accent={cwOf(feeling.cw).petal}
          sub="How are you feeling?">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {FEELINGS.map((f) => { const on = f.key === feeling.key; const c = cwOf(f.cw).petal; return (
              <button key={f.key} onClick={() => setFeeling(f)} className="fw-elite-press" aria-pressed={on}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: on ? "#51444e" : `${c}14`, border: `1px solid ${on ? "#51444e" : c + "55"}`, color: on ? "#fff" : "#51444e", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
                <f.Icon size={14} /> {f.label}
              </button>
            ); })}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, lineHeight: 1.5, margin: "0 2px 12px" }}>{feeling.line}</p>
          <Shelf room="move" onOpen={setExpanded} cards={feelingPicks} empty={itemsStatus === "error" ? "" : itemsStatus === "loading" ? "Finding a session…" : "No session here right now. The small action below still works."} />
          {itemsStatus === "error" && <div className="fw-good-load-error" role="alert">The sessions didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setRetryKey(value => value + 1); }}>Try again</button></div>}
        </Section>

        {/* B · A MOVEMENT SNACK — evidence-backed micro-movement (≤5 min); a one-tap joy */}
        <Section Icon={Clock} title="A movement snack" accent={cwOf("gold").petal}
          sub="A small way in, if you fancy it.">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#fff", border: "1px solid #EAE7E0", borderLeft: `3px solid ${cwOf("gold").petal}`, borderRadius: 18, padding: "14px 16px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("gold").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Footprints size={17} color={cwOf("gold").petal} /></span>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.5 }}>{snack}</span>
          </div>
        </Section>

        <details className="fw-good-library"><summary>More ways to move · strength, ease &amp; mood <span aria-hidden="true">+</span></summary>
        {/* C · GET STRONGER (NOT SMALLER) — the deepest pool (194), framed as capability */}
        <Section Icon={Dumbbell} title="Get stronger — not smaller" accent={cwOf("crimson").petal}
          sub="Strength for what your body can DO: carry, lift, keep up, last. Nothing here is about size.">
          <Shelf room="move" onOpen={setExpanded} cards={strengthCards} empty={itemsStatus === "error" ? "" : "No strength session just now."} />
        </Section>

        {/* D · GENTLE IS TRAINING TOO — rest-is-training, restorative */}
        <Section Icon={Wind} title="Gentle is training too" accent={sage}
          sub="Yoga, mobility, a slow stretch — rest and ease are where you actually get stronger, not a lesser option.">
          <Shelf room="move" onOpen={setExpanded} cards={gentleCards} empty={itemsStatus === "error" ? "" : "No gentle session just now."} />
        </Section>

        {/* E · MOVE FOR YOUR MOOD — the one strongly-evidenced claim */}
        <Section Icon={HeartPulse} title="Move for your mood" accent={cwOf("sky").petal}
          sub="A little movement can help your head feel different. It also counts when it doesn't.">
          <Shelf room="move" onOpen={setExpanded} cards={moodCards} empty={itemsStatus === "error" ? "" : "No mood session just now."} />
        </Section>
        </details>

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

        <div style={{ textAlign: "center", margin: "28px 0 0" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, maxWidth: 330, lineHeight: 1.55, margin: "0 auto" }}>
            The test for anything here: would you do it even if it changed nothing about your body? Move for that.
          </p>
        </div>
      </div>

      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError} />}
    </div>
  );
}
