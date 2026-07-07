import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FwFloraHero } from "@/components/brand/PageTop";
import { floraKeyframes } from "@/components/brand/flora";
const H = (v, o, title) => renderToStaticMarkup(
  <FwFloraHero title={title} line="A gentle plate for today." bloom="rose" colorway="blush" creature="bee" flankL="chamomile" flankR="sunflower" titleColor="#7A1A12" openness={o} variant={v} />
);
const cells = [
  ["V1 bough · full", H(0,1,"Your plate")],
  ["V2 arch · full", H(1,1,"Your plate")],
  ["V5 spray · full", H(4,1,"Your plate")],
  ["V1 bough · BUD (rebloom)", H(0,0.34,"Your plate")],
  ["V6 lush · full", H(5,1,"Your plate")],
  ["V3 grounded · full", H(2,1,"Your plate")],
];
process.stdout.write("@@@JSON@@@" + JSON.stringify({ cells, keyframes: floraKeyframes }));
