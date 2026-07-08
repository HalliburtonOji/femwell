import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FwFloraHero } from "@/components/brand/PageTop";
const one=(t,f,c)=>renderToStaticMarkup(<div style={{width:330,border:"1px solid #D8CFBC",borderRadius:16,background:"linear-gradient(165deg,#F4EFE3,rgba(168,137,63,.13))",padding:8,margin:6}}><FwFloraHero title={t} line="x" bloom={f} colorway={c} creature="bee"/></div>);
process.stdout.write("@@@JSON@@@"+JSON.stringify({html: one("A · crimson","rose","crimson")+one("B · gold","sunflower","gold")}));
