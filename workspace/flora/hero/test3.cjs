const F=require("./foliage3.cjs");const fs=require("fs");
const MAIN=[[40,264],[92,226],[150,178],[214,130],[270,90]];
const C=F.spline(MAIN,22);
const side=[[150,178],[178,150],[200,114]];
const svg=`<svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg">${F.DEFS}
  ${F.grass(56,266,74,15,32)}
  ${F.branch(MAIN,16,3.2,{knots:[0.32,0.6]})}
  ${F.branch(side,6.5,1.8,{})}
  ${F.knot(150,178)}${F.knot(214,130)}
  ${F.leavesAlong(C,0.24,0.9,6,34,19,42,"lf3")}
  ${F.leavesAlong(F.spline(side,22),0.25,0.92,3,28,16,42,"lf3")}
  ${F.petals(120,244,3)}
</svg>`;
fs.writeFileSync("test3.html",`<!doctype html><meta charset=utf-8><body style="margin:0;background:#ECE7DA;padding:20px"><div style="background:linear-gradient(165deg,#F4EFE3,rgba(168,137,63,.12));border:1px solid #D8CFBC;border-radius:16px;padding:6px;width:312px">${svg}</div></body>`);
