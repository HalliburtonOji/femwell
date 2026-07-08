import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FwFloraHero } from "@/components/brand/PageTop";
const H=(cw,form,t)=>renderToStaticMarkup(<div style={{width:330,border:"1px solid #D8CFBC",borderRadius:16,background:"linear-gradient(165deg,#F4EFE3,rgba(168,137,63,.13))",padding:8,margin:6}}><FwFloraHero title={t} line="x" bloom={form} colorway={cw} creature="bee" openness={1}/></div>);
process.stdout.write("@@@JSON@@@"+JSON.stringify({html:H("sage","snowdrop","follicular→camellia")+H("crimson","poppy","menstrual poppy")+H("plum","dahlia","luteal dahlia")}));
