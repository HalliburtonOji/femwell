const F=require("./foliage3.cjs");const M=require("./meadow.cjs");const fs=require("fs");
const A=JSON.parse(fs.readFileSync("flowers-out.txt","utf8").split("@@@JSON@@@")[1]);
const MAIN=[[38,268],[92,228],[150,180],[212,132],[268,92]];
const CM=F.spline(MAIN,22);
const side=[[150,180],[130,146],[120,110]];
const band=M.meadowBand(52,272,7);
const foliage=`<svg viewBox="0 0 300 300" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" aria-hidden="true">${F.DEFS}${M.DEFS}`
 + band.back
 + F.branch(MAIN,16,3.2,{knots:[0.3,0.62]}) + F.knot(150,180)+F.knot(212,132)+F.knot(92,228)
 + F.branch(side,6.2,1.7,{})
 + F.leavesAlong(CM,0.2,0.66,5,33,18,44,"lf3") + F.leavesAlong(F.spline(side,22),0.2,0.9,3,26,15,44,"lf3")
 + band.front
 + `</svg>`;
const bloom=`<div style="position:absolute;left:224px;top:112px;transform:translate(-50%,-50%) scale(0.9);z-index:2">${A.rose_blush_full}</div>`;
const bee=`<div style="position:absolute;left:244px;top:78px;z-index:4">${A.bee}</div>`;
const stage=`<div style="position:relative;width:300px;height:300px">${foliage}${bloom}${bee}</div>`;
fs.writeFileSync("testc.html",`<!doctype html><meta charset=utf-8><body style="margin:0;background:#ECE7DA;padding:16px"><div style="background:linear-gradient(165deg,#F4EFE3,rgba(168,137,63,.13));border:1px solid #D8CFBC;border-radius:16px;padding:6px;width:312px">${stage}</div></body>`);
