// FloraLabDemo — a STANDALONE visual catalogue of the elevated flora system
// (BRAND_FLORA.md). Renders every RichBloomV2 form, every FlowerGlyph species,
// the colourway range, and every pollinator — so the realism + variety lift can be
// reviewed (and QA'd) in one place. Preview-only; not wired into any live page.
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, PAPER_BG, SCRIPT, UI } from "@/components/journal/Editorial";
import {
  RichBloomV2, FlowerGlyph, FLOWER_VARIANTS, COLORWAYS, cwOf, floraKeyframes,
  Butterfly, Bee, Dragonfly, Moth, Ladybird, Bouquet, BloomWithCreature,
} from "@/components/brand/flora";
import {
  FLORA_SPECIES, FLORA_FOLIAGE, FLORA_LIFECYCLE, FLORA_BUDS,
  SpeciesBloom, LifecycleStage, FloraBud,
} from "@/components/brand/floraLibrary";

const LIBRARY_FLOWERS = FLORA_SPECIES.filter((n) => !FLORA_FOLIAGE.includes(n));

const HERO_FLOWERS = [["rose", "crimson"], ["sunflower", "gold"], ["hibiscus", "coral"]];
const BLOOM_FORMS = [
  ["rose", "crimson"], ["hibiscus", "coral"], ["lily", "blush"], ["peony", "gold"],
  ["tulip", "crimson"], ["magnolia", "cream"], ["dahlia", "plum"], ["ranunculus", "blush"],
  ["camellia", "blush"], ["chrysanthemum", "coral"], ["marigold", "gold"], ["cosmos", "blush"],
  ["anemone", "crimson"], ["hellebore", "sage"], ["poppy", "crimson"], ["daisy", "cream"],
  ["forget", "sky"], ["cornflower", "sky"], ["sunflower", "gold"], ["snowdrop", "cream"],
  ["foxglove", "plum"], ["fern", "sage"],
];

function Tile({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 8 }}>
      <div style={{ display: "grid", placeItems: "center", minHeight: 96 }}>{children}</div>
      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted }}>{label}</span>
    </div>
  );
}
function Section({ title, sub, children }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "8px 14px 28px" }}>
      <div style={{ fontFamily: SCRIPT, fontSize: 30, color: T.ink, textAlign: "center", marginBottom: 2 }}>{title}</div>
      {sub && <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", marginBottom: 14 }}>{sub}</div>}
      {children}
    </div>
  );
}

export default function FloraLabDemo() {
  const navigate = useNavigate();
  const grid = (cols) => ({ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 });
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 96, position: "relative", overflowX: "clip" }}>
      <style>{floraKeyframes}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={() => navigate(createPageUrl("Ideas"))} aria-label="Back to Ideas"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>
          <ArrowLeft size={13} /> Ideas
        </button>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold }}>Flora Lab · elevated</span>
      </div>

      <div style={{ textAlign: "center", padding: "16px 16px 6px" }}>
        <div style={{ fontFamily: SCRIPT, fontSize: 44, color: T.ink, lineHeight: 1.05 }}>Flora Lab</div>
        <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: T.muted, maxWidth: 360, margin: "6px auto 0" }}>The flora engine — bespoke geometry per species so a rose reads as a rose. Recognisable heroes, visible variety, creatures on the plant.</div>
      </div>

      <Section title="The botanical library" sub={`${LIBRARY_FLOWERS.length} named flowers — a real garden, each drawn to read as itself (roses · sunflower · hibiscus · orchid · iris · daffodil · foxglove · lavender · hydrangea · protea · lily-of-the-valley · cherry blossom · cornflower · poppy · peony…).`}>
        <div style={grid(5)}>
          {LIBRARY_FLOWERS.map((n) => <Tile key={n} label={n.replace(/-/g, " ")}><SpeciesBloom name={n} size={76} /></Tile>)}
        </div>
      </Section>

      <Section title="Foliage & greenery" sub="leaves carry the garden too — fern · eucalyptus · monstera · succulent · ivy · olive">
        <div style={grid(6)}>
          {FLORA_FOLIAGE.map((n) => <Tile key={n} label={n}><SpeciesBloom name={n} size={76} /></Tile>)}
        </div>
      </Section>

      <Section title="Lifecycle & buds" sub="the stage is the meaning (v4): bud → bloom → seed (the rose hip) → rest (the bare cane, holding next year's bloom)">
        <div style={grid(4)}>
          {FLORA_LIFECYCLE.map((s) => <Tile key={s.n} label={s.n}><LifecycleStage name={s.n} size={92} /></Tile>)}
        </div>
        <div style={{ ...grid(4), marginTop: 8 }}>
          {FLORA_BUDS.map((s) => <Tile key={s.n} label={s.n}><FloraBud name={s.n} size={80} /></Tile>)}
        </div>
      </Section>

      <Section title="The hero flowers" sub="rose · sunflower · hibiscus — each carries its own signature (spiral heart · seed disc · staminal column)">
        <div style={grid(3)}>
          {HERO_FLOWERS.map(([form, cw]) => {
            const c = cwOf(cw);
            return <Tile key={form} label={form}><RichBloomV2 form={form} color={c.petal} color2={c.tip} accent={c.accent} size={138} idx={`hero-${form}`} /></Tile>;
          })}
        </div>
      </Section>

      <Section title="Combination arrangements" sub="different flowers grouped — a posy, not one lone bloom">
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 }}>
          <Tile label="rose · sunflower · hibiscus"><Bouquet size={210} idx="bqA" /></Tile>
          <Tile label="peony · lily · cosmos"><Bouquet size={190} idx="bqB" items={[
            { form: "peony", colorway: "blush", scale: 1, dx: 0, dy: 0, rot: 0 },
            { form: "lily", colorway: "gold", scale: 0.7, dx: -0.3, dy: 0.16, rot: -15 },
            { form: "cosmos", colorway: "plum", scale: 0.62, dx: 0.3, dy: 0.2, rot: 15 },
            { form: "forget", colorway: "sky", scale: 0.4, dx: 0.12, dy: -0.18, rot: 6 },
          ]} /></Tile>
        </div>
      </Section>

      <Section title="A living garden" sub="creatures resting ON the plant — never floating in empty space">
        <div style={grid(3)}>
          <Tile label="butterfly on a petal"><BloomWithCreature form="rose" colorway="crimson" size={120} creature="butterfly" at="petal" idx="eco1" /></Tile>
          <Tile label="ladybird on a leaf"><BloomWithCreature form="sunflower" colorway="gold" size={120} creature="ladybird" at="leaf" idx="eco2" /></Tile>
          <Tile label="bee on the flower"><BloomWithCreature form="hibiscus" colorway="coral" size={120} creature="bee" at="flower" idx="eco3" /></Tile>
        </div>
      </Section>

      <Section title="Every bloom" sub="RichBloomV2 — bespoke geometry per species, layered petals, lit tips, shadowed throats">
        <div style={grid(3)}>
          {BLOOM_FORMS.map(([form, cw]) => {
            const c = cwOf(cw);
            return <Tile key={form} label={form}><RichBloomV2 form={form} color={c.petal} color2={c.tip} accent={c.accent} size={92} idx={form} /></Tile>;
          })}
        </div>
      </Section>

      <Section title="Colourways" sub="one peony across the 9 meaningful colourways (colour = meaning)">
        <div style={grid(3)}>
          {COLORWAYS.map((c) => <Tile key={c.key} label={c.label}><RichBloomV2 form="peony" color={c.petal} color2={c.tip} accent={c.accent} size={84} idx={`cw-${c.key}`} /></Tile>)}
        </div>
      </Section>

      <Section title="Meaning-blooms" sub={`FlowerGlyph — ${FLOWER_VARIANTS.length} species, notched petals + dimensional centres`}>
        <div style={grid(4)}>
          {FLOWER_VARIANTS.map((v, i) => {
            const c = COLORWAYS[i % COLORWAYS.length];
            return <Tile key={v} label={v}><FlowerGlyph variant={v} color={c.petal} color2={c.tip} accent={c.accent} size={58} idx={`g-${v}`} /></Tile>;
          })}
        </div>
      </Section>

      <Section title="Pollinators" sub="earned markers — butterfly · bee · dragonfly · moth · ladybird">
        <div style={grid(3)}>
          <Tile label="Butterfly · spots"><Butterfly size={52} color={cwOf("plum").petal} color2={cwOf("gold").petal} pattern="spots" idx="bf1" /></Tile>
          <Tile label="Butterfly · bands"><Butterfly size={52} color={cwOf("crimson").petal} color2={cwOf("gold").petal} pattern="bands" idx="bf2" /></Tile>
          <Tile label="Butterfly · eyes"><Butterfly size={52} color={cwOf("sky").petal} color2={cwOf("blush").petal} pattern="eyes" idx="bf3" /></Tile>
          <Tile label="Bee"><Bee size={48} idx="be" /></Tile>
          <Tile label="Dragonfly"><Dragonfly size={56} color={cwOf("plum").petal} idx="df" /></Tile>
          <Tile label="Moth"><Moth size={52} color={cwOf("sage").petal} idx="mo" /></Tile>
          <Tile label="Ladybird"><Ladybird size={34} idx="lb" /></Tile>
        </div>
      </Section>
    </div>
  );
}
