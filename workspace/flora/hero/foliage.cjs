// Reusable on-brand foliage SVG builders (sage/green flora palette from flora.jsx).
// All draw in a stage viewBox; bloom fragments are layered as positioned <div>s over them.
const G = `<defs>
  <linearGradient id="lfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#B4D0B4"/><stop offset="52%" stop-color="#82A282"/><stop offset="100%" stop-color="#5A785A"/></linearGradient>
  <linearGradient id="lfg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9BBE9B"/><stop offset="100%" stop-color="#4F6E4F"/></linearGradient>
  <linearGradient id="stm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8FAF8F"/><stop offset="100%" stop-color="#5F7E5F"/></linearGradient>
  <linearGradient id="bark" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9C8666"/><stop offset="100%" stop-color="#6E5C43"/></linearGradient>
</defs>`;
// almond leaf centered at (x,y), pointing along angle deg, length L, width W, tone gradient id
function leaf(x, y, L, W, ang, g = "lfg", op = 1) {
  const d = `M0 0 C ${W} ${-L*0.28} ${W*0.5} ${-L*0.82} 0 ${-L} C ${-W*0.5} ${-L*0.82} ${-W} ${-L*0.28} 0 0 Z`;
  const vein = `M0 -2 C ${W*0.12} ${-L*0.45} ${W*0.05} ${-L*0.7} 0 ${-L*0.92}`;
  return `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="${d}" fill="url(#${g})" opacity="${op}" stroke="#4F6E4F" stroke-width="0.5" stroke-opacity="0.25"/><path d="${vein}" fill="none" stroke="#4F6E4F" stroke-width="0.6" stroke-opacity="0.35"/></g>`;
}
// slightly curved stem from (x1,y1) to (x2,y2)
function stem(x1, y1, x2, y2, w = 2.4, curve = 6) {
  const mx = (x1+x2)/2 + curve, my = (y1+y2)/2;
  return `<path d="M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" fill="none" stroke="url(#stm)" stroke-width="${w}" stroke-linecap="round"/>`;
}
// tapering woody branch through points [[x,y]...]
function branch(pts, w = 7) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i=1;i<pts.length;i++){ const [px,py]=pts[i-1],[x,y]=pts[i]; d+=` Q ${(px+x)/2+4} ${(py+y)/2} ${x} ${y}`; }
  return `<path d="${d}" fill="none" stroke="url(#bark)" stroke-width="${w}" stroke-linecap="round"/>`;
}
// a small closed bud on a short stalk at (x,y)
function bud(x, y, ang = 0, c = "#E8B4B8") {
  return `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 0 L0 -7" stroke="url(#stm)" stroke-width="1.6" stroke-linecap="round"/><path d="M0 -7 C -3.4 -8 -3.6 -13 0 -15 C 3.6 -13 3.4 -8 0 -7 Z" fill="${c}" stroke="#C98A90" stroke-width="0.5" stroke-opacity="0.5"/><path d="M0 -7 C -1.6 -9 -1.6 -12 0 -14" stroke="#fff" stroke-width="0.5" stroke-opacity="0.5" fill="none"/><path d="M0 -7 C -2.6 -6 -4 -8 -3.4 -10 M0 -7 C 2.6 -6 4 -8 3.4 -10" stroke="#6F8F6F" stroke-width="1" fill="none" stroke-linecap="round"/></g>`;
}
// leaf fan: n leaves from a point spreading over spread deg
function fan(x, y, n, L, W, base, spread, g = "lfg") {
  let s = "";
  for (let i=0;i<n;i++){ const a = base - spread/2 + (spread*i/(n-1)); const l = L*(0.8+0.2*Math.sin(i)); s += leaf(x, y, l, W, a, g, 0.96); }
  return s;
}
// canopy mound: overlapping leaf blobs forming a rounded crown centred (cx,cy) radius R
function canopy(cx, cy, R, layers = 3) {
  let s = "";
  for (let l=0;l<layers;l++){
    const rr = R*(1 - l*0.22); const n = 10 - l*1;
    for (let i=0;i<n;i++){ const a = (360*i/n) + l*17; const rad = a*Math.PI/180; const px = cx + Math.cos(rad)*rr*0.72; const py = cy + Math.sin(rad)*rr*0.62; s += leaf(px, py, rr*0.62, rr*0.3, a+90+ (l*8), l%2?"lfg2":"lfg", 0.97); }
  }
  return s;
}
// vine arc (open ring) around centre (cx,cy) radius R, with small leaves along it; gap at top
function vineArc(cx, cy, R, leaves = 14) {
  const a0 = -60, a1 = 240; // leave a gap at very top
  let path = "";
  const pts = [];
  for (let i=0;i<=40;i++){ const a=(a0 + (a1-a0)*i/40)*Math.PI/180; pts.push([cx+Math.cos(a)*R, cy+Math.sin(a)*R]); }
  path = `<path d="M${pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L ')}" fill="none" stroke="url(#stm)" stroke-width="2.4" stroke-linecap="round"/>`;
  let lv = "";
  for (let i=0;i<leaves;i++){ const t=i/(leaves-1); const a=(a0+(a1-a0)*t); const rad=a*Math.PI/180; const px=cx+Math.cos(rad)*R; const py=cy+Math.sin(rad)*R; const tang=a+90 + (i%2?26:-26); lv += leaf(px, py, 15, 6, tang, i%2?"lfg":"lfg2", 0.95); }
  return path + lv;
}
module.exports = { G, leaf, stem, branch, bud, fan, canopy, vineArc };
