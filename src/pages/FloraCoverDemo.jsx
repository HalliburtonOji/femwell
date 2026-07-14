// FloraCoverDemo — preview for PIECE 1 (the FloraCover ECOSYSTEM cover system). Seeded,
// read-only, no base44, additive; live Lifestyle untouched. Reachable via the IDEAS pill so
// Halli can see the variety + the segmentation. Route: /FloraCoverDemo.
import FloraCover from "@/components/brand/FloraCover";
import { COLORWAYS } from "@/components/brand/flora";
import { T, SERIF, SCRIPT, UI, PAPER_BG } from "@/components/journal/Editorial";

const OXBLOOD = "#7A1A12";
const GOLD = "#A8893F";

function Section({ eyebrow, title, note, children }) {
  return (
    <section style={{ margin: "30px 0 0" }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>{eyebrow}</div>
      <h2 style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 30, color: OXBLOOD, margin: "2px 0 4px", lineHeight: 1.05 }}>{title}</h2>
      {note && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, margin: "0 0 14px", lineHeight: 1.5, maxWidth: 580 }}>{note}</p>}
      {children}
    </section>
  );
}

// each SEGMENT → its scene + colourway (as the component maps them) + 3 varied sample write-ups
const SEGMENTS = [
  { label: "Story & letters", scene: "duskletter", cw: "plum", cat: "fiction",
    items: [["She left the party early, and", "Story · 8 min"], ["A letter I never sent", "Letter · 5 min"], ["The last chapter, at midnight", "Chapter · 6 min"]] },
  { label: "Astrology & sky", scene: "nightsky", cw: "lavender", cat: "astrology",
    items: [["Reading tonight's waning moon", "Sky · 4 min"], ["Your Venus year, gently", "Horoscope · 5 min"], ["What the new moon is asking", "Ritual · 3 min"]] },
  { label: "Love & relationships", scene: "gathering", cw: "crimson", cat: "relationships",
    items: [["The quiet art of staying", "Essay · 6 min"], ["How to have the hard talk", "Guide · 5 min"], ["On being chosen, and choosing", "Read · 7 min"]] },
  { label: "Friendship & community", scene: "posy", cw: "coral", cat: "friendship",
    items: [["Text the friend you miss", "Note · 2 min"], ["Making friends at 34", "Essay · 6 min"], ["The group chat as a lifeline", "Read · 4 min"]] },
  { label: "Career & money", scene: "bough", cw: "gold", cat: "career",
    items: [["Ask for the raise, kindly", "Guide · 5 min"], ["A gentler kind of ambition", "Essay · 6 min"], ["Your money, without shame", "Read · 5 min"]] },
  { label: "Creativity & making", scene: "wildflower", cw: "plum", cat: "creativity",
    items: [["Make something with your hands", "Prompt · 3 min"], ["The unfinished-project club", "Essay · 5 min"], ["Steal like an artist, softly", "Read · 6 min"]] },
  { label: "Beauty & style", scene: "wildflower", cw: "blush", cat: "beauty",
    items: [["A five-minute glow, no fuss", "Beauty · 3 min"], ["Dressing for the week you have", "Style · 4 min"], ["The one-shelf skincare edit", "Guide · 5 min"]] },
  { label: "Rest & calm", scene: "windowsill", cw: "sky", cat: "rest",
    items: [["A gentler week isn't behind", "Rest · 3 min"], ["The five-minute evening reset", "Guide · 3 min"], ["Permission for a slow Sunday", "Read · 4 min"]] },
  { label: "Movement & nature", scene: "meadow", cw: "sage", cat: "movement",
    items: [["Ten minutes outside, no phone", "Body · 2 min"], ["Walking as a whole practice", "Essay · 5 min"], ["Move for joy, not penance", "Read · 4 min"]] },
  { label: "Food & nourishment", scene: "still", cw: "gold", cat: "nutrition",
    items: [["One warm thing to cook tonight", "Recipe · 4 min"], ["Eat for your luteal week", "Guide · 5 min"], ["The no-recipe dinner", "Read · 3 min"]] },
  { label: "Reading & guides", scene: "bough", cw: "cream", cat: "book",
    items: [["The essay everyone's saving", "Essay · 7 min"], ["A shelf of good, free books", "Books · 4 min"], ["How to romance a Tuesday", "Guide · 4 min"]] },
];

export default function FloraCoverDemo() {
  const grid3 = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 16px 0" }}>

        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>FemWell · Lifestyle level-up · Piece 1</div>
        <h1 style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 42, color: OXBLOOD, margin: "2px 0 6px", lineHeight: 1.02 }}>The FloraCover — a living ecosystem</h1>
        <p style={{ fontFamily: SERIF, fontSize: 16.5, color: T.inkSoft, margin: "0 0 4px", lineHeight: 1.5, maxWidth: 600 }}>
          On-brand article covers, composed entirely in-app — no stock, no fetch. Not one flower but the whole garden: blooms, buds, vines, a real dusk meadow &amp; bough, butterflies, bees, dragonflies, moths, ladybirds, a moon &amp; stars, a wax-rose seal. <b>9 scene archetypes × 9 colourways × seeded variation</b>, each chosen by the content's category so different writing reads visibly different. Deterministic — the same piece always wears the same face.
        </p>

        <Section eyebrow="Segmented by content" title="Nine worlds, one per kind of writing" note="Each category maps to its own ecosystem scene + colourway. Three samples per segment (different seeds → different species, creatures, positions) so you can see both the segmentation and the variety within it.">
          {SEGMENTS.map((seg) => (
            <div key={seg.label} style={{ margin: "0 0 20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "6px 2px 8px" }}>
                <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>{seg.label}</span>
                <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>scene <b style={{ color: OXBLOOD }}>{seg.scene}</b> · {seg.cw}</span>
              </div>
              <div style={grid3}>
                {seg.items.map(([title, eyebrow], i) => (
                  <FloraCover key={i} title={title} eyebrow={eyebrow} category={seg.cat} seed={`${seg.scene}-${i}-${title.length}`} height={168} />
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section eyebrow="The whole palette" title="One scene across the colourways" note="The same 'bough' scene, retinted through all nine colourways — each carries its own meaning.">
          <div style={grid3}>
            {COLORWAYS.map((c) => (
              <div key={c.key}>
                <FloraCover title="A good thing to read today" eyebrow="Read · 4 min" scene="bough" colorway={c.key} seed={`cw-${c.key}`} height={150} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}><b style={{ color: T.inkSoft }}>{c.label}</b> · {c.meaning}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="Same piece, same face" title="Deterministic by seed" note="The cover is a pure function of the item — three renders of one seed are identical; change the seed for a new-but-stable cover.">
          <div style={grid3}>
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <FloraCover title="Reading tonight's waning moon" eyebrow="Sky · 4 min" category="astrology" seed="determinism-demo" height={150} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}>render #{n} · seed="determinism-demo"</div>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="One component, many jobs" title="Sizes & variants" note="A wide hero cover; a story with a script (Ephesis) title chosen automatically by scene; an art-only cover with the title off.">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FloraCover title="The essay everyone's saving this week" eyebrow="Editor's pick · 7 min" category="relationships" seed="hero-pick" height={210} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <FloraCover title="A letter I never sent" eyebrow="Story" category="fiction" seed="story-1" height={190} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}>duskletter → Ephesis title auto</div>
              </div>
              <div>
                <FloraCover category="movement" seed="art-only" showTitle={false} height={190} />
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, margin: "5px 2px 0" }}>showTitle={"{false}"} · art-only meadow</div>
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
                  ["category", "string?", "A LifestyleItems.category → picks the SCENE + colourway (the segmentation). Deterministic fallback."],
                  ["colorway", "key?", "Override the colourway (crimson/blush/gold/sage/plum/lavender/cream/coral/sky)."],
                  ["scene", "key?", "Override the ecosystem scene (bough/meadow/still/posy/gathering/wildflower/duskletter/nightsky/windowsill)."],
                  ["seed", "string|number?", "Deterministic seed (pass item.id). Same seed → same cover."],
                  ["species", "string?", "Explicit flora form; else chosen from a curated set by seed."],
                  ["combo", "object?", "Explicit {color,color2,accent}; else the colourway's §2.5.1 vivid combo."],
                  ["width / height", "num/str?", "Default width 100%, height 168."],
                  ["radius / roundTop", "num? / bool?", "Corner radius (16); roundTop rounds only the top two (sits atop a card body)."],
                  ["titleFont", "\"auto\"|\"fraunces\"|\"script\"", "auto = Ephesis for story scenes, else Fraunces."],
                  ["showTitle", "bool?", "false = art-only cover (no lockup)."],
                  ["animate", "bool?", "Subtle bloom/creature motion; default false, reduced-motion-safe."],
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
          Piece 1 of 12 — the ecosystem cover, built small and finished properly. Next (on your go): piece 2, the big ArticleCard deck that drops this cover in. Nothing else changed; live Lifestyle untouched.
        </p>
      </div>
    </div>
  );
}
