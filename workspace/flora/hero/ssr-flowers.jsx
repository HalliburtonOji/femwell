import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RichBloomV2, Pollinator, floraKeyframes } from "@/components/brand/flora";
const B=(form,petal,tip,idx,o)=>renderToStaticMarkup(<RichBloomV2 form={form} color={petal} color2={tip} accent="#A8893F" size={150} animate={false} soft idx={idx} openness={o}/>);
const F={
  rose_blush_full:B("rose","#E8B4B8","#F4D9DC",10,1), rose_blush_bud:B("rose","#E8B4B8","#F4D9DC",11,0.34),
  peony_blush_full:B("peony","#E8B4B8","#F4D9DC",12,1), peony_blush_bud:B("peony","#E8B4B8","#F4D9DC",13,0.4),
  rose_coral_full:B("rose","#E08A6A","#F0B79E",14,1), rose_coral_bud:B("rose","#E08A6A","#F0B79E",15,0.34),
  magnolia_cream_full:B("magnolia","#E4DAC1","#F2EAD6",16,1), magnolia_cream_bud:B("magnolia","#E4DAC1","#F2EAD6",17,0.4),
  hibiscus_crim_full:B("hibiscus","#BC2E27","#D9554E",18,1), hibiscus_crim_bud:B("hibiscus","#BC2E27","#D9554E",19,0.4),
  bee:renderToStaticMarkup(<Pollinator kind="bee" size={40} color="#A8893F" color2="#D9554E" pattern="bands" animate={false} idx={20}/>),
  bfly:renderToStaticMarkup(<Pollinator kind="butterfly" size={38} color="#8E6E8E" color2="#D4AF37" pattern="bands" animate={false} idx={21}/>),
  keyframes:floraKeyframes,
};
process.stdout.write("@@@JSON@@@"+JSON.stringify(F));
