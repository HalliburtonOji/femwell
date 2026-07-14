// FloraCoverDemo — preview for PIECE 1 (the FloraCover component). Seeded, read-only,
// no base44, additive; live Lifestyle untouched. Reachable via the IDEAS pill so Halli
// can see the craft he called out (on-brand flora covers, no stock). Route: /FloraCoverDemo.
import FloraCover from "@/components/brand/FloraCover";
import { COLORWAYS } from "@/components/brand/flora";
import { T, SERIF, SCRIPT, UI, PAPER_BG } from "@/components/journal/Editorial";

const OXBLOOD = "#7A1A12";
const GOLD = "#A8893F";

function Section({ eyebrow, title, note, children }) {
  return (
    <section style={{ margin: "28px 0 0" }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>{eyebrow}</div>
      <h2 style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 30, color: OXBLOOD, margin: "2px 0 4px", lineHeight: 1.05 }}>{title}</h2>
      {note && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, margin: "0 0 14px", lineHeight: 1.5, maxWidth: 560 }}>{note}</p>}
      {children}
    </section>
  );
}

// one sample write-up per colourway (title + type/read-time), meaning-matched
const SAMPLES = {
  crimson:  { title: "The quiet art of a slow Sunday", eyebrow: "Essay · 6 min", category: "love & relationships" },
  coral:    { title: "Text the friend you keep meaning to", eyebrow: "Note · 2 min", category: "friendship" },
  gold:     { title: "How to ask for the raise, kindly", eyebrow: "Guide · 5 min", category: "career & money" },
  blush:    { title: "A five-minute glow, no fuss", eyebrow: "Beauty · 3 min", category: "beauty & style" },
  plum:     { title: "Make something with your hands tonight", eyebrow: "Creativity · 4 min", category: "creativity" },
  lavender: { title: "Reading tonight's waning moon", eyebrow: "Sky · 4 min", category: "astrology" },
  sky:      { title: "A gentler week is not falling behind", eyebrow: "Rest · 3 min", category: "mind & calm" },
  sage:     { title: "Ten minutes outside, no phone", eyebrow: "Body · 2 min", category: "nature & movement" },
  cream:    { title: "She left the party early, and", eyebrow: "Story · 8 min", category: "fiction" },
};

export default function FloraCoverDemo() {
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "22px 16px 0" }}>

        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>FemWell · Lifestyle level-up · Piece 1</div>
        <h1 style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 42, color: OXBLOOD, margin: "2px 0 6px", lineHeight: 1.02 }}>The FloraCover</h1>
        <p style={{ fontFamily: SERIF, fontSize: 16.5, color: T.inkSoft, margin: "0 0 4px", lineHeight: 1.5, maxWidth: 580 }}>
          On-brand article covers, composed entirely in-app — a colour-graded paper wash + a two-tone bloom + a garden sprig + a Fraunces title lockup. No stock photos, ever. Deterministic: the same piece always wears the same face.
        </p>

        <Section eyebrow="The whole garden" title="One cover per colourway" note="Nine colourways, each carrying its own meaning — a live sample write-up on each. Every cover is drawn, not fetched.">
          <div style={grid2}>
            {COLORWAYS.map((c) => {
              const s = SAMPLES[c.key] || { title: "A good thing to read today", eyebrow: "Read · 4 min" };
              return (
                <div key={c.key}>
                  <FloraCover title={s.title} eyebrow={s.eyebrow} colorway={c.key} seed={`sample-${c.key}`} height={168} />
                  <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}><b style={{ color: T.inkSoft }}>{c.label}</b> · {c.meaning}</div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section eyebrow="Same piece, same face" title="Deterministic by seed" note="The cover is a pure function of the item — three renders of the same seed are pixel-identical (species, colour, sprig corner, tilt all frozen). Change the seed, get a new but stable cover.">
          <div style={grid2}>
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <FloraCover title="Romance a Tuesday" eyebrow="Guide · 4 min" colorway="gold" seed="determinism-demo" height={168} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}>render #{n} · <code style={{ background: "#E4DCC9", borderRadius: 4, padding: "0 4px" }}>seed="determinism-demo"</code></div>
              </div>
            ))}
            {["alpha", "bravo", "charlie"].map((k) => (
              <div key={k}>
                <FloraCover title="Romance a Tuesday" eyebrow="Guide · 4 min" colorway="gold" seed={k} height={168} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}>seed="{k}" · different species/tilt</div>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="It reads the content" title="Colour from category" note="With no colourway given, the cover picks one from the item's category (relationships → crimson, career → gold, creativity → plum, astrology → lavender…), with a deterministic fallback so nothing is ever off-brand.">
          <div style={grid2}>
            {["love & relationships", "career & money", "creativity & art", "beauty & fashion", "astrology & moon", "nature & movement"].map((cat, i) => (
              <div key={cat}>
                <FloraCover title={cat.replace(/&/, "and")} eyebrow="Category → colourway" category={cat} seed={`cat-${i}`} height={150} />
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="One component, many jobs" title="Sizes & variants" note="A wide hero cover for an editor's pick; a script (Ephesis) title for a story; an art-only cover with the title off — the same component, different props.">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FloraCover title="The essay everyone's saving this week" eyebrow="Editor's pick · 7 min" colorway="crimson" seed="hero-pick" height={210} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <FloraCover title="She left the party early" eyebrow="Story" colorway="plum" seed="story-1" titleFont="script" height={190} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}>titleFont="script" (Ephesis)</div>
              </div>
              <div>
                <FloraCover colorway="sage" seed="art-only" species="sunflower" showTitle={false} height={190} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}>showTitle={"{false}"} · art-only</div>
              </div>
            </div>
          </div>
        </Section>

        <Section eyebrow="For piece 2" title="Props" note="A clean, reusable API so the big ArticleCard deck can drop it in.">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: UI, fontSize: 12.5 }}>
              <tbody>
                {[
                  ["title", "string", "The write-up title in the lockup."],
                  ["eyebrow", "string?", "Kicker over the title, e.g. \"Essay · 6 min\"."],
                  ["colorway", "key?", "One of 9: crimson/blush/gold/sage/plum/lavender/cream/coral/sky. Wins over category."],
                  ["category", "string?", "A LifestyleItems.category → mapped to a colourway when colorway is absent."],
                  ["seed", "string|number?", "Deterministic seed (pass item.id). Same seed → same cover."],
                  ["species", "string?", "Explicit flora form; else chosen from a curated set by seed."],
                  ["combo", "object?", "Explicit {color,color2,accent}; else the colourway's §2.5.1 vivid combo."],
                  ["width / height", "num/str?", "Default width 100%, height 168."],
                  ["radius / roundTop", "num? / bool?", "Corner radius (16); roundTop rounds only the top two (sits atop a card body)."],
                  ["titleFont", "\"fraunces\"|\"script\"", "Fraunces (default) or Ephesis for stories."],
                  ["showTitle", "bool?", "false = art-only cover (no lockup)."],
                  ["animate", "bool?", "Subtle bloom breath; default false (covers are calm), reduced-motion-safe."],
                ].map(([p, t, d]) => (
                  <tr key={p} style={{ borderBottom: "1px solid #E0D8C6" }}>
                    <td style={{ padding: "7px 8px", verticalAlign: "top", whiteSpace: "nowrap" }}><code style={{ background: "#E4DCC9", borderRadius: 4, padding: "1px 5px", color: OXBLOOD }}>{p}</code></td>
                    <td style={{ padding: "7px 8px", verticalAlign: "top", color: T.muted, whiteSpace: "nowrap" }}>{t}</td>
                    <td style={{ padding: "7px 8px", verticalAlign: "top", color: T.inkSoft }}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, margin: "28px 0 0", lineHeight: 1.55 }}>
          Piece 1 of 12 — built small and finished properly. Next (on your go): piece 2, the big ArticleCard deck that drops this cover in. Nothing else changed; live Lifestyle untouched.
        </p>
      </div>
    </div>
  );
}
