// Make — Track C board #9 (whole-life domain: creativity, crafting, making things with your
// hands). Making for the PLEASURE of it — badly is allowed, finishing is optional, no one has
// to see it, it doesn't have to be good, useful or sellable. Process over product; permission
// to be a beginner forever.
//
// RESEARCHED brainstorm: claude-state/TRACKC_MAKE_BRAINSTORM.html (cited). Content MEASURED and
// found to have ESSENTIALLY NO genuine hands-on craft library (~5-10 items, all pollution on
// inspection: "Crafting a Relationship With Loss", "Stitches of Friendship", "Studded Clogs").
// So — the leanest board on the track — it is the editorial "make something" prompt spine
// (Mx Storyteller) + Community/Events/Jess deep-links, with NO faked craft shelf (the same
// don't-fake-it discipline as Delight's games → Community). No new entity/function.
//
// SCIENCE (Kaimal, Ray & Muniz 2016, cited): a small uncontrolled art-making study observed
// lower cortisol afterwards for many participants; it cannot promise individual stress relief
// or prove equal effects across experience levels. FIREWALL (two-sided): NO perfectionism (get good/master/level-up)
// AND NO monetisation (Etsy/sell/side-hustle) — the whole competitive set runs on exactly those.
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Palette, Pencil, MessageCircle, Feather, CalendarHeart, Sparkles } from "lucide-react";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";
import "./GoodLifeRoomsClean.css";

const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};

// THE SPINE — Mx Storyteller's "make something" prompts. Permission-not-performance: badly is
// allowed, finishing optional, no one's watching, a biro and an envelope is enough.
const MAKES = [
  "Make something badly, on purpose. The wonk is the whole charm.",
  "Doodle in the margin of whatever's nearest. It doesn't have to become anything.",
  "Start something you have no intention of finishing. Stopping is allowed.",
  "Sing the wrong words, loudly, to whatever's on in the kitchen.",
  "Draw your cup of tea. Yes, badly. Especially badly.",
  "Scribble one shape over and over until your hand goes quiet.",
  "Squash a bit of leftover dough into a small, useless creature. Bin it after. That's fine.",
  "Write three sentences that go nowhere. Nobody's reading over your shoulder.",
  "Colour something in. Outside the lines, if you fancy it.",
  "Tear up an old magazine and glue the bits back down wrong.",
  "Make up a silly little tune and hum it once. It can leave forever after.",
  "Draw the view from your window with your eyes half on the page.",
  "Fold a bit of paper into something. It needn't be a swan. It needn't be anything.",
  "Mend a small thing with visible, wonky stitches. Let the repair show.",
  "Build a tiny tower out of whatever's on the table. Knock it down. Build it again.",
  "Write a note to no one. You don't have to keep it.",
  "Fill a page edge to edge with pattern — dots, loops, whatever your biro wants.",
  "Rearrange a shelf just for the pleasure of moving things about.",
  "Draw the same little flower five times and let each one be worse.",
  "Make a collage from the recycling. A cereal box is a perfectly good material.",
  "Hum along to something and get all the notes wrong. Gloriously wrong.",
  "Press a leaf, a petal, a receipt into a book and forget about it.",
  "Sketch someone's hands, or your own. Beginners welcome, forever.",
  "Make a small mess with colour and leave it unfinished on purpose.",
];

export default function Make() {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
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

  const makes = useMemo(() => rotateDaily(MAKES, 4), []);
  return (
    <div className="fw-good-clean fw-make-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press fw-good-back"><ArrowLeft size={19}/></button>
        <header className="fw-good-hero fw-make-hero"><span className="fw-good-path">GOOD LIFE / MAKE</span><span className="fw-make-sheet" aria-hidden="true"/><span className="fw-make-petal" aria-hidden="true"/><span className="fw-make-pencil" aria-hidden="true"/><h1>Make</h1><p>Make a little something. It can be wonderfully wonky.</p></header>
        <details className="fw-good-context"><summary>A note for the maker <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">
          <div className="fw-good-context-row"><Palette size={16}/><div><strong>No masterpiece needed</strong><p>{firstName ? `${firstName}, ` : ""}a biro, a scrap of paper and ten minutes will do.</p></div></div>
          <div className="fw-good-context-row"><Pencil size={16}/><div><strong>Keep it yours</strong><p>No need to finish, post it or turn it into a side hustle.</p></div></div>
          <div className="fw-good-context-row"><Sparkles size={16}/><div><strong>Research, lightly</strong><p>A small art-making study observed lower cortisol afterwards in many participants. It had no control group and makes no promise about your mood.</p></div></div>
        </div></details>

        <section className="fw-make-first" aria-label="Make something today"><div className="fw-make-first-mark" aria-hidden="true"><Pencil size={24}/></div><span>TRY THIS TODAY</span><p>{makes[0]}</p><small>Ten minutes, or ten seconds. You decide.</small></section>

        <a className="fw-make-community" href={createPageUrl("Community")}><MessageCircle size={20}/><span><strong>Meet the Community</strong><small>Share what you made if you want to</small></span><span aria-hidden="true">→</span></a>

        <details className="fw-good-library"><summary>Three more things to try <span aria-hidden="true">+</span></summary><div className="fw-make-more">{makes.slice(1).map((idea,i)=><p key={i}><span aria-hidden="true">0{i+2}</span>{idea}</p>)}</div></details>
        <details className="fw-good-library"><summary>Make it elsewhere · Journal, Jess, Events <span aria-hidden="true">+</span></summary><div className="fw-good-door-list">
          <a href={createPageUrl("Journal")}><Feather size={18}/><span>Write something<small>A note, a line, a glorious bad poem</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Jess")}><Sparkles size={18}/><span>Ask Jess for an idea<small>Tell her what you have to hand</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Events")}><CalendarHeart size={18}/><span>Look at Events<small>Find a class, just for the fun of it</small></span><span aria-hidden="true">→</span></a>
        </div></details>
      </div>
    </div>
  );
}
