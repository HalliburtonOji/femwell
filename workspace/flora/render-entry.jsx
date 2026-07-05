import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RichBloomV2, Bouquet, BloomWithCreature, Butterfly, Bee, Ladybird, Dragonfly, Moth, floraKeyframes, COLORWAYS } from "@/components/brand/flora.jsx";

const cw = (k) => COLORWAYS.find((c) => c.key === k) || COLORWAYS[0];
function Bloom({ form, cwk, size = 150 }) {
  const c = cw(cwk);
  return <RichBloomV2 form={form} color={c.petal} color2={c.tip} accent={c.accent} size={size} animate={false} idx={form + cwk} />;
}
function Cell({ children, label, w = 160 }) {
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: w }}>
    <div style={{ background: "#F4EFE3", border: "1px solid #D8CFBC", borderRadius: 16, padding: 8, display: "flex", justifyContent: "center" }}>{children}</div>
    <div style={{ fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: "#6B5840" }}>{label}</div>
  </div>;
}
const H2 = ({ children }) => <h2 style={{ fontFamily: "Georgia", fontStyle: "italic", color: "#A8893F", fontWeight: 500, margin: "22px 0 6px", fontSize: 22 }}>{children}</h2>;

const App = () => (
  <div style={{ padding: 24, fontFamily: "Georgia, serif" }}>
    <H2>The hero flowers — recognisable at a glance</H2>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
      <Cell label="Rose" w={200}><Bloom form="rose" cwk="crimson" size={186} /></Cell>
      <Cell label="Sunflower" w={200}><Bloom form="sunflower" cwk="gold" size={186} /></Cell>
      <Cell label="Hibiscus" w={200}><Bloom form="hibiscus" cwk="coral" size={186} /></Cell>
    </div>
    <H2>Distinct silhouettes — variety you can see</H2>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
      {[["peony", "blush"], ["dahlia", "plum"], ["lily", "cream"], ["tulip", "crimson"], ["poppy", "crimson"], ["magnolia", "cream"], ["lotus", "sky"], ["cosmos", "plum"], ["ranunculus", "gold"], ["camellia", "blush"]].map(([f, k]) =>
        <Cell key={f + k} label={f}><Bloom form={f} cwk={k} size={120} /></Cell>)}
    </div>
    <H2>Combination — a bouquet, and a creature resting on the bloom</H2>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
      <Cell label="Bouquet" w={260}><Bouquet animate={false} size={230} /></Cell>
      <Cell label="Butterfly on a rose" w={200}><BloomWithCreature form="rose" colorway="crimson" creature="butterfly" at="petal" size={170} animate={false} /></Cell>
      <Cell label="Bee on a sunflower" w={200}><BloomWithCreature form="sunflower" colorway="gold" creature="bee" at="flower" size={170} animate={false} /></Cell>
    </div>
    <H2>Pollinators — earned markers</H2>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
      <Cell label="butterfly·plum"><Butterfly size={86} color="#8E6E8E" color2="#D4AF37" animate={false} idx={1} /></Cell>
      <Cell label="butterfly·monarch"><Butterfly size={86} color="#E08A6A" color2="#BC2E27" pattern="tips" animate={false} idx={2} /></Cell>
      <Cell label="bee"><Bee size={70} animate={false} idx={3} /></Cell>
      <Cell label="dragonfly"><Dragonfly size={80} animate={false} idx={4} /></Cell>
      <Cell label="moth"><Moth size={76} animate={false} idx={5} /></Cell>
      <Cell label="ladybird"><Ladybird size={54} animate={false} idx={6} /></Cell>
    </div>
  </div>
);

const body = renderToStaticMarkup(<App />);
process.stdout.write(`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#ECE7DA}h2{}</style></head><body><style>${floraKeyframes}</style>${body}</body></html>`);
