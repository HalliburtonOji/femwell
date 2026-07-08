import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FwFloraHero } from "@/components/brand/PageTop";
const H=(cw,form,o,title,creature)=>renderToStaticMarkup(
  <FwFloraHero title={title} line="A gentle plate for today." bloom={form} colorway={cw} creature={creature} flankL="chamomile" flankR="sunflower" titleColor="#7A1A12" openness={o} idx={title.replace(/ /g,"")+cw} />
);
const cells=[
  ["crimson · full (all open)", H("crimson","rose",1,"Your day","bee")],
  ["crimson · mid 0.5", H("crimson","rose",0.5,"Your day","bee")],
  ["crimson · bud 0.12 (one→many)", H("crimson","rose",0.12,"Your day","bee")],
  ["gold · full", H("gold","sunflower",1,"Nutrition","bee")],
  ["plum · full", H("plum","peony",1,"Journal","butterfly")],
  ["sage · full", H("sage","cosmos",1,"Health","bee")],
];
process.stdout.write("@@@JSON@@@"+JSON.stringify({cells}));
