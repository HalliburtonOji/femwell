const M=require("./meadow.cjs");const fs=require("fs");
const band=M.meadowBand(56,272,7);
const svg=`<svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg">${M.DEFS}${band.back}${band.front}</svg>`;
fs.writeFileSync("testm.html",`<!doctype html><meta charset=utf-8><body style="margin:0;background:#ECE7DA;padding:16px"><div style="background:linear-gradient(165deg,#F4EFE3,rgba(168,137,63,.13));border:1px solid #D8CFBC;border-radius:16px;padding:6px;width:312px">${svg}</div></body>`);
