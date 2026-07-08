import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RichBloomV2, Pollinator } from "@/components/brand/flora";
const B=(form,petal,tip,heart,idx)=>renderToStaticMarkup(<RichBloomV2 form={form} color={petal} color2={tip} accent={heart} size={150} animate={false} soft={false} headOnly idx={idx} openness={1}/>);
// vivid two-tone combos: {petal, tip(contrasting 2nd tone), heart(accent)}
const F={
  coral_gold: B("rose","#E86A44","#F6C066","#B8502E",30),      // coral petals -> gold tips, warm heart
  magenta_cream: B("peony","#C63A75","#F4DCE6","#8E2E52",31),  // magenta -> cream
  violet_butter: B("cosmos","#8A63B4","#CBB8E4","#E8C766",32), // violet petals, butter-yellow heart
  amber_rose: B("camellia","#E8A24E","#F8CE9A","#C05A4E",33),  // warm amber, rose heart
  crimson_gold: B("hibiscus","#C33A2C","#E8895F","#D4AF37",34),// crimson (heart colour) + gold centre
  periwinkle_gold: B("rose","#7C8CC8","#C0CAE6","#E8C766",35), // periwinkle + gold
  blush_deeprose: B("peony","#E098B0","#F8DCE6","#A83E5E",36), // blush -> deep-rose throat
  bee:renderToStaticMarkup(<Pollinator kind="bee" size={40} color="#A8893F" color2="#D9554E" pattern="bands" animate={false} idx={40}/>),
  bfly:renderToStaticMarkup(<Pollinator kind="butterfly" size={38} color="#8E6E8E" color2="#D4AF37" pattern="bands" animate={false} idx={41}/>),
};
process.stdout.write("@@@JSON@@@"+JSON.stringify(F));
