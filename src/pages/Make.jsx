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
// SCIENCE (Kaimal, Ray & Muniz 2016, cited): 45 min of open art-making lowered cortisol in 75%
// of people, with NO correlation to prior art experience — skill did not matter. That is the
// scientific permission to be bad at it. Everyday creativity → next-day flourishing (Conner
// 2018, causal direction). FIREWALL (two-sided): NO perfectionism (get good/master/level-up)
// AND NO monetisation (Etsy/sell/side-hustle) — the whole competitive set runs on exactly those.
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Palette, Pencil, MessageCircle, Feather, CalendarHeart, Sparkles, Music } from "lucide-react";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { cwOf } from "@/components/brand/flora";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";

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
  const blush = cwOf("blush").petal;

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
  const summaryRows = useMemo(() => [
    { Icon: Palette, label: "Today", text: firstName ? `${firstName}, make something today — badly, pointlessly, just for the pleasure of your hands doing a thing. It doesn't have to be good, or finished, or seen.` : "Make something today — badly, pointlessly, just for the pleasure of your hands doing a thing. It doesn't have to be good, or finished, or seen." },
    { Icon: Sparkles, label: "Badly is allowed", text: "There's a real study on this: 45 minutes of making something dropped people's stress — and it worked exactly as well for beginners as for artists. Skill made no difference at all. So please, be gloriously bad at it." },
    { Icon: Pencil, label: "The doing is the point", text: "This isn't something to get good at, finish, or turn into anything at all. Nothing here has to become a project or earn its keep — the making itself is the whole offer. That's it." },
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

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={19} /></button>

        <FwFloraHero title="Make" line="Making things for the pleasure of it — badly, pointlessly, unfinished, unseen. The doing is the whole reward."
          colorway="blush" bloom="camellia" flankL="poppy" flankR="cosmos" titleColor={OXBLOOD} creature="butterfly" />

        <div style={{ marginTop: 6 }}><SummaryCard eyebrow="Make today" accent={blush} rows={summaryRows} /></div>

        {/* A · MAKE SOMETHING — the editorial spine (the engine; there's no craft library to fake) */}
        <Section Icon={Palette} title="Make something" accent={blush}
          sub="A few tiny invitations to make a thing today. Pick one if it sparks — a biro and the back of an envelope is more than enough kit.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {makes.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${blush}`, borderRadius: 13, padding: "12px 14px" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${blush}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Pencil size={15} color={blush} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>{m}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* B · WHAT ARE YOU MAKING — Community deep-link (no content shelf; don't fake one) */}
        <Section Icon={MessageCircle} title="What are you making?" accent={cwOf("plum").petal}
          sub="The wonky, the half-finished, the 'I don't know what this is yet' — show it (or don't) with people who make for the joy of it too.">
          <a href={createPageUrl("Community")} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${cwOf("plum").petal}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: `${cwOf("plum").petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><MessageCircle size={20} color={cwOf("plum").petal} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.2 }}>Share it in Community</span>
              <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>No masterpieces required — the more gloriously rubbish, the better.</span>
            </span>
          </a>
        </Section>

        {/* C · CARRY IT ON */}
        <Section Icon={Sparkles} title="Carry it on" accent={blush} sub="Making happens all over the place.">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { Icon: Feather, cw: "plum", label: "Make with words in your Journal", sub: "Writing badly on purpose counts — a bad poem, a list, a rant. Your Journal won't tell.", href: createPageUrl("Journal") },
              { Icon: Sparkles, cw: "blush", label: "\"Give me something silly to make\"", sub: "Ask Jess for a ten-minute make from whatever's lying around. No skill, no shopping.", href: createPageUrl("Jess") },
              { Icon: CalendarHeart, cw: "gold", label: "A class, just for the fun of it", sub: "A pottery night, a life-drawing class — for the doing, not to get good. Have a look in Events.", href: createPageUrl("Events") },
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
            You don't have to be good at it. You don't have to finish it. You don't have to show anyone. Making is one of the few things left that can just be for you.
          </p>
        </div>
      </div>
    </div>
  );
}
