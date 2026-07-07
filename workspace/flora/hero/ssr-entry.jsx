import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RichBloomV2, Pollinator, floraKeyframes } from "@/components/brand/flora";
const rose = (idx, o) => renderToStaticMarkup(<RichBloomV2 form="rose" color="#E8B4B8" color2="#F4D9DC" accent="#A8893F" size={150} animate={false} soft idx={idx} openness={o} />);
const peony = (idx, o) => renderToStaticMarkup(<RichBloomV2 form="peony" color="#E8B4B8" color2="#F4D9DC" accent="#A8893F" size={150} animate={false} soft idx={idx} openness={o} />);
const bee = renderToStaticMarkup(<Pollinator kind="bee" size={40} color="#A8893F" color2="#D9554E" pattern="bands" animate={false} idx={7} />);
const bfly = renderToStaticMarkup(<Pollinator kind="butterfly" size={38} color="#8E6E8E" color2="#D4AF37" pattern="bands" animate={false} idx={8} />);
process.stdout.write("@@@JSON@@@" + JSON.stringify({
  full: rose(0,1), mid: rose(2,0.68), bud: rose(1,0.34),
  peonyFull: peony(3,1), peonyBud: peony(4,0.4),
  bee, bfly, keyframes: floraKeyframes,
}));
