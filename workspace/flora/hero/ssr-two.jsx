import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FwFloraHero } from "@/components/brand/PageTop";
const html=renderToStaticMarkup(<div><FwFloraHero title="A" bloom="rose" colorway="crimson" creature="bee"/><FwFloraHero title="B" bloom="sunflower" colorway="gold" creature="bee"/></div>);
const ids=[...html.matchAll(/id="(bk3|mYar|mStem)-([^"]+)"/g)].map(m=>m[1]+":"+m[2]);
process.stdout.write("@@@JSON@@@"+JSON.stringify({ bk3count:(html.match(/id="bk3-/g)||[]).length, uniqueSuffixes:[...new Set(ids.map(x=>x.split(":")[1]))], sampleIds:ids.slice(0,4) }));
