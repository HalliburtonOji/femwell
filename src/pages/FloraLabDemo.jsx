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
  Butterfly, Bee, Dragonfly, Moth, Ladybird,
} from "@/components/brand/flora";

const BLOOM_FORMS = [
  ["peony", "gold"], ["rose", "crimson"], ["ranunculus", "blush"], ["camellia", "blush"],
  ["dahlia", "plum"], ["chrysanthemum", "coral"], ["marigold", "gold"], ["cosmos", "blush"],
  ["anemone", "crimson"], ["magnolia", "cream"], ["hellebore", "sage"], ["poppy", "crimson"],
  ["daisy", "cream"], ["forget", "sky"], ["cornflower", "sky"], ["sunflower", "gold"],
  ["snowdrop", "cream"], ["tulip", "coral"], ["foxglove", "plum"], ["fern", "sage"],
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
        <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: T.muted, maxWidth: 340, margin: "6px auto 0" }}>The elevated bloom + glyph + pollinator library — realism and variety, two levels up.</div>
      </div>

      <Section title="Blooms" sub="RichBloomV2 — 20 forms, layered petals, lit tips, shadowed throats">
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
