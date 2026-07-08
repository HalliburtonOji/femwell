const F=require("./foliage3.cjs");const M=require("./meadow.cjs");
const MAIN=[[38,268],[92,228],[150,180],[212,132],[268,92]];
const CM=F.spline(MAIN,22);
const SIDE=[[150,180],[130,146],[120,110]];
const CS=F.spline(SIDE,22);
const BAND=M.meadowBand(52,272,7);
const HEAD_OFF=19;
function perch(C,t,side,scale,order,budRot){
  const p=F.atT(C,t); const off=14+scale*10;
  const fx=p.x+p.nx*side*off, fy=p.y+p.ny*side*off;
  const ped=`<path d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q ${((p.x+fx)/2).toFixed(1)} ${((p.y+fy)/2).toFixed(1)} ${fx.toFixed(1)} ${fy.toFixed(1)}" fill="none" stroke="url(#mStem)" stroke-width="1.5" stroke-linecap="round"/>`;
  return { ped, left:+fx.toFixed(1), top:+(fy+HEAD_OFF*scale).toFixed(1), scale, order, budRot };
}
const SPECS=[
  {C:CM,t:0.9,side:-1,s:0.82,order:0,budRot:8},
  {C:CM,t:0.68,side:1,s:0.86,order:2,budRot:-14},
  {C:CM,t:0.47,side:-1,s:0.82,order:1,budRot:12},
  {C:CM,t:0.28,side:1,s:0.72,order:3,budRot:20},
  {C:CS,t:0.88,side:-1,s:0.66,order:4,budRot:-10},
];
const perches=SPECS.map(s=>perch(s.C,s.t,s.side,s.s,s.order,s.budRot));
const sceneInner = BAND.back
  + F.branch(MAIN,16,3.2,{knots:[0.3,0.62]})
  + F.knot(150,180)+F.knot(212,132)+F.knot(92,228)
  + F.branch(SIDE,6.2,1.7,{})
  + F.leavesAlong(CM,0.16,0.82,6,30,17,46,"lf3")
  + F.leavesAlong(CS,0.2,0.9,3,24,14,46,"lf3")
  + perches.map(p=>p.ped).join("")
  + BAND.front;
const defs = F.DEFS + M.DEFS;
const blooms = perches.map(p=>({left:p.left,top:p.top,scale:p.scale,order:p.order,budRot:p.budRot}));
require("fs").writeFileSync("scene-out.json", JSON.stringify({ defs, sceneInner, blooms, creature:{left:254,top:54,scale:1} }));
console.log("scene bytes", sceneInner.length, "| blooms", blooms.length);
