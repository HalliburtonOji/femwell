import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FLORA_SPECIES, speciesBloomSVG, FLORA_LIFECYCLE, lifecycleStageSVG } from "@/components/brand/floraLibrary.jsx";
const cell=(svg,nm,w=100)=>`<div style="width:${w}px;display:flex;flex-direction:column;align-items:center"><div style="background:#F4EFE3;border:1px solid #D8CFBC;border-radius:12px;padding:5px;width:${w}px;height:104px;display:flex;align-items:flex-end;justify-content:center">${svg}</div><div style="font-family:ui-sans-serif;font-size:10px;text-transform:uppercase;color:#6B5840;text-align:center">${nm.replace(/-/g,' ')}</div></div>`;
const grid=FLORA_SPECIES.map(n=>cell(speciesBloomSVG(n,84),n)).join('');
const lc=FLORA_LIFECYCLE.map(s=>cell(lifecycleStageSVG(s.n,90),s.n)).join('');
const html=`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#ECE7DA;font-family:Georgia}.wrap{padding:16px}h1{font-style:italic;color:#A8893F;font-size:22px;margin:0 0 2px}.sub{font-family:ui-sans-serif;font-size:13px;color:#6B5840;margin-bottom:12px}.g{display:flex;flex-wrap:wrap;gap:8px}h2{font-style:italic;color:#A8893F;font-size:18px;margin:16px 0 6px}</style></head><body><div class="wrap"><h1>FemWell Flora — the botanical library</h1><div class="sub">${FLORA_SPECIES.length} named species, rendered by the PRODUCTION floraLibrary module — each drawn to read as itself.</div><div class="g">${grid}</div><h2>Lifecycle (rose) — the stage is the meaning (v4)</h2><div class="g">${lc}</div></div></body></html>`;
process.stdout.write(html);
