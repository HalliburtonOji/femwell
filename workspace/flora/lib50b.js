// lib50b — bespoke heads + spike/umbel/bell/branch archetypes + SPECIES registry + bloom()
// (loads after lib50.js)

// ===== BESPOKE ICONIC HEADS =====
function hRose(c,ac,g){const dp=c,dpr=darken(c,0.13),sh=lighten(c,0.62);const G=(L,w)=>`M0 0 C ${-w} ${-L*0.28} ${-w*0.98} ${-L*0.74} ${-w*0.46} ${-L*0.95} C ${-w*0.18} ${-L*1.04} ${w*0.18} ${-L*1.04} ${w*0.46} ${-L*0.95} C ${w*0.98} ${-L*0.74} ${w} ${-L*0.28} 0 0 Z`;const W="M0 0 C -8 -2 -10.5 -11 -3.5 -15.5 C 1.5 -18.5 9.5 -14 8 -6.5 C 7 -1.8 1.2 -2.4 1.6 -7";let s='<g>';for(let i=0;i<5;i++)s+=`<path d="${G(34,15)}" fill="url(#pO-${g})" stroke="${dpr}" stroke-width="0.5" stroke-opacity="0.22" transform="translate(${cx} ${cy}) rotate(${i*72})"/>`;for(let i=0;i<5;i++)s+=`<path d="${G(27,12.5)}" fill="url(#pM-${g})" stroke="${dp}" stroke-width="0.4" stroke-opacity="0.2" transform="translate(${cx} ${cy}) rotate(${36+i*72})"/>`;for(let i=0;i<5;i++)s+=`<path d="${G(20,10)}" fill="url(#pM-${g})" stroke="${dp}" stroke-width="0.4" stroke-opacity="0.2" transform="translate(${cx} ${cy}) rotate(${i*72})"/>`;s+=`<circle cx="${cx}" cy="${cy}" r="14" fill="url(#occ-${g})"/>`;for(let i=0;i<9;i++){const sc=1.45-i*0.115;s+=`<path d="${W}" transform="translate(${cx} ${cy}) rotate(${i*52}) scale(${sc})" fill="url(#${i%2?'pI':'pM'}-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.26"/>`;}s+=`<circle cx="${cx}" cy="${cy}" r="1.8" fill="${dpr}" opacity="0.55"/></g>`;return s;}
function hSunflower(c,ac,g){const dpr=darken(c,0.13),R=(L,w)=>`M0 0 C ${-w} ${-L*0.32} ${-w*0.6} ${-L*0.78} ${-w*0.5} ${-L*0.93} C ${-w*0.3} ${-L} ${w*0.3} ${-L} ${w*0.5} ${-L*0.93} C ${w*0.6} ${-L*0.78} ${w} ${-L*0.32} 0 0 Z`;let s='<g>';for(let i=0;i<24;i++)s+=`<path d="${R(34,5.2)}" fill="url(#pO-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.18" transform="translate(${cx} ${cy}) rotate(${i*15})"/>`;for(let i=0;i<24;i++)s+=`<path d="${R(29,4.6)}" fill="url(#pM-${g})" transform="translate(${cx} ${cy}) rotate(${7.5+i*15})"/>`;s+=`<circle cx="${cx}" cy="${cy}" r="15.5" fill="url(#disc-${g})"/>`;for(let i=0;i<150;i++){const a=i*GA*Math.PI/180,rr=1.32*Math.sqrt(i);if(rr>14.5)continue;s+=`<circle cx="${(cx+Math.cos(a)*rr).toFixed(1)}" cy="${(cy+Math.sin(a)*rr).toFixed(1)}" r="0.82" fill="${i%2?'#5E4419':'#7A5A22'}" opacity="0.92"/>`;}s+=`<circle cx="${cx}" cy="${cy}" r="15.5" fill="none" stroke="${darken(c,0.24)}" stroke-width="0.7" opacity="0.4"/></g>`;return s;}
function hHibiscus(c,ac,g){const dpr=darken(c,0.13);let s='<g>';for(let i=0;i<5;i++){s+=`<g transform="translate(${cx} ${cy}) rotate(${i*72})"><path d="${pBroad(37,16)}" fill="url(#pO-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.18"/>`;for(const k of[-1,0,1])s+=`<path d="M0 -3 Q ${k*3.6} -19 ${k*2.3} -33" stroke="${darken(c,0.24)}" stroke-width="0.45" stroke-opacity="0.32" fill="none" stroke-linecap="round"/>`;s+='</g>';}s+=`<circle cx="${cx}" cy="${cy}" r="11" fill="${darken(c,0.46)}"/><circle cx="${cx}" cy="${cy}" r="13" fill="url(#occ-${g})"/>`;s+=`<path d="M${cx} ${cy} Q ${cx+9} ${cy-17} ${cx+13} ${cy-31}" stroke="${darken(c,0.18)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;for(let i=0;i<11;i++){const t=i/11,px=cx+9*t*1.1+(i%2?2.1:-2.1),py=cy-22*t-6;s+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.25" fill="#E9CF7A" stroke="#B98F2E" stroke-width="0.2"/>`;}for(let i=0;i<5;i++){const a=i*72*Math.PI/180;s+=`<circle cx="${(cx+13+Math.cos(a)*2.4).toFixed(1)}" cy="${(cy-31+Math.sin(a)*2.4).toFixed(1)}" r="1.5" fill="${darken(c,0.05)}"/>`;}s+='</g>';return s;}
function hLily(c,ac,g){const dpr=darken(c,0.13),AN='#9A6B2E';let s='<g>';for(let i=0;i<6;i++)s+=`<g transform="translate(${cx} ${cy}) rotate(${i*60})"><path d="${pLance(38,9)}" fill="url(#p${i%2?'M':'O'}-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.16"/><path d="M0 -3 L 0 -35" stroke="${darken(c,0.18)}" stroke-width="0.45" stroke-opacity="0.26"/><circle cx="0" cy="-12" r="0.7" fill="${darken(c,0.3)}" opacity="0.4"/></g>`;for(let i=0;i<6;i++){const a=(i*60+30)*Math.PI/180,ex=cx+Math.cos(a)*18,ey=cy+Math.sin(a)*18;s+=`<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${lighten(AN,0.18)}" stroke-width="1" stroke-linecap="round"/><ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="2.8" ry="1.4" fill="${AN}" transform="rotate(${i*60+30} ${ex.toFixed(1)} ${ey.toFixed(1)})"/>`;}s+=`<ellipse cx="${cx}" cy="${cy-1}" rx="2.2" ry="3.2" fill="url(#ct-${g})"/></g>`;return s;}
function hMagnolia(c,ac,g){const dpr=darken(c,0.13);let s='<g>';for(let i=0;i<9;i++)s+=`<path d="${pBroad(37,9)}" fill="url(#p${i%2?'O':'M'}-${g})" opacity="0.96" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.14" transform="translate(${cx} ${cy}) rotate(${i*40})"/>`;s+=`<ellipse cx="${cx}" cy="${cy}" rx="4.4" ry="6.8" fill="url(#ct-${g})"/>`;for(let i=0;i<11;i++){const a=i*33*Math.PI/180;s+=`<circle cx="${(cx+Math.cos(a)*3).toFixed(1)}" cy="${(cy+Math.sin(a)*4.6).toFixed(1)}" r="0.7" fill="${darken(ac,0.12)}" opacity="0.7"/>`;}s+='</g>';return s;}
function hTulip(c,ac,g){const dp=c;const tp=(rot,sc,gr,op)=>`<path d="M0 0 C -8.5 -5 -9 -27 0 -36 C 9 -27 8.5 -5 0 0 Z" fill="url(#${gr}-${g})" opacity="${op}" stroke="${dp}" stroke-width="0.3" stroke-opacity="0.2" transform="translate(${cx} ${cy+12}) rotate(${rot}) scale(${sc})"/>`;return `<g>${tp(-22,1,'pO',0.95)}${tp(22,1,'pO',0.95)}${tp(0,1.06,'pM',0.97)}${tp(-11,0.84,'pI',0.98)}${tp(11,0.84,'pI',0.98)}</g>`;}
function hDaffodil(c,ac,g){const dpr=darken(c,0.13);let s='<g>';for(let i=0;i<6;i++)s+=`<path d="${pPoint(30,9)}" fill="url(#p${i%2?'M':'O'}-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.16" transform="translate(${cx} ${cy}) rotate(${i*60})"/>`;// trumpet corona
const tc=darken(ac,0.0);s+=`<ellipse cx="${cx}" cy="${cy}" rx="11" ry="11" fill="${lighten('#E0A22E',0.1)}"/><ellipse cx="${cx}" cy="${cy}" rx="11" ry="11" fill="url(#occ-${g})" opacity="0.5"/>`;for(let i=0;i<14;i++){const a=i*(360/14)*Math.PI/180;s+=`<path d="M${cx} ${cy} L ${(cx+Math.cos(a)*11).toFixed(1)} ${(cy+Math.sin(a)*11).toFixed(1)}" stroke="${darken('#E0A22E',0.2)}" stroke-width="0.5" opacity="0.4"/>`;}s+=`<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="${darken('#E0A22E',0.22)}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="6" fill="#C99022"/><circle cx="${cx}" cy="${cy}" r="6" fill="url(#occ-${g})"/><circle cx="${cx-1.4}" cy="${cy-1.4}" r="1.6" fill="#F0D27A" opacity="0.7"/></g>`;return s;}
function hSnowdrop(c,ac,g){return `<g><path d="M50 18 C 50 30 50 38 50 44" stroke="url(#st-${g})" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M50 38 C 58 38 62 42 59 46" stroke="#7E9A7E" stroke-width="1.3" fill="none" opacity="0.8"/><g transform="translate(50 48)"><path d="M0 1 C -10 5 -11 22 -4 31 C -1 34 1 34 0.6 30 Z" fill="url(#pM-${g})" stroke="${darken(c,0.1)}" stroke-width="0.4" stroke-opacity="0.4"/><path d="M0 1 C 10 5 11 22 4 31 C 1 34 -1 34 -0.6 30 Z" fill="url(#pM-${g})" stroke="${darken(c,0.1)}" stroke-width="0.4" stroke-opacity="0.4"/><path d="M0 1 C -3 9 -3 26 0 32 C 3 26 3 9 0 1 Z" fill="url(#pI-${g})"/><path d="M0 27 C -3 26 -3 22 0 20 C 3 22 3 26 0 27 Z" fill="#7FA77F" opacity="0.85"/></g></g>`;}
function hIris(c,ac,g){const dpr=darken(c,0.13);let s='<g>';// 3 falls (down/out, broad) with a beard
for(const r of[90,210,330]){s+=`<g transform="translate(${cx} ${cy}) rotate(${r})"><path d="${pBroad(34,12)}" fill="url(#pO-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.18"/><path d="M0 -4 C 1.4 -14 1 -22 0 -30" stroke="#E0B84A" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M-1.6 -8 L -3 -7 M1.6 -10 L 3 -9 M-1.4 -14 L -3 -13" stroke="#E0B84A" stroke-width="0.8" opacity="0.7"/></g>`;}
// 3 standards (up, arching) lighter
for(const r of[30,150,270]){s+=`<path d="${pCup(26,9)}" fill="url(#pM-${g})" opacity="0.96" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.16" transform="translate(${cx} ${cy}) rotate(${r}) scale(1,0.9)"/>`;}
s+=`<circle cx="${cx}" cy="${cy}" r="4" fill="url(#pI-${g})"/></g>`;return s;}
function hOrchid(c,ac,g){const dpr=darken(c,0.13),hi=lighten(c,0.4);let s='<g>';// moth orchid: 2 big lateral petals, 3 sepals behind, a lip
// sepals (behind, narrower)
for(const r of[0,120,240])s+=`<path d="${pLance(30,8)}" fill="url(#pM-${g})" opacity="0.92" stroke="${dpr}" stroke-width="0.3" stroke-opacity="0.16" transform="translate(${cx} ${cy}) rotate(${r}) scale(0.92)"/>`;
// 2 big round lateral petals (left/right, upper)
for(const r of[-58,58])s+=`<path d="${pRound(28,18)}" fill="url(#pO-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.18" transform="translate(${cx} ${cy}) rotate(${r})"/>`;
// the lip (lower centre) with throat markings
s+=`<g transform="translate(${cx} ${cy+13})"><path d="M0 -6 C -8 -4 -9 6 -3 11 C -1 13 1 13 3 11 C 9 6 8 -4 0 -6 Z" fill="url(#pI-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.2"/><path d="M-3 -3 C -4 0 -4 4 -2 7 M3 -3 C 4 0 4 4 2 7" stroke="${darken('#C0392E',0)}" stroke-width="1" fill="none" opacity="0.6"/><circle cx="0" cy="-2" r="2.4" fill="#E0B84A"/><path d="M-2 1 L 2 1 M-1.6 3 L 1.6 3" stroke="#B43A78" stroke-width="0.8" opacity="0.7"/></g>`;
s+=`<circle cx="${cx}" cy="${cy}" r="3.4" fill="#E8C24A"/><circle cx="${cx}" cy="${cy}" r="1.6" fill="#B0863A"/></g>`;return s;}
function hCornflower(c,ac,g){const dpr=darken(c,0.13);let s='<g>';// frilly outer florets (tubular, fringed) + smaller inner
for(let i=0;i<10;i++){const a=i*36;s+=`<g transform="translate(${cx} ${cy}) rotate(${a})"><path d="M0 -10 L -3.6 -30 L -2.4 -32 L -1.6 -28 L -0.8 -33 L 0 -29 L 0.8 -33 L 1.6 -28 L 2.4 -32 L 3.6 -30 Z" fill="url(#pO-${g})" stroke="${dpr}" stroke-width="0.3" stroke-opacity="0.2"/></g>`;}
for(let i=0;i<8;i++){const a=18+i*45;s+=`<path d="M0 -6 L -2.2 -18 L 0 -16 L 2.2 -18 Z" fill="url(#pI-${g})" transform="translate(${cx} ${cy}) rotate(${a})"/>`;}
s+=`<circle cx="${cx}" cy="${cy}" r="6" fill="${darken(c,0.34)}"/>`;for(let i=0;i<8;i++){const a=i*45*Math.PI/180;s+=`<circle cx="${(cx+Math.cos(a)*3.6).toFixed(1)}" cy="${(cy+Math.sin(a)*3.6).toFixed(1)}" r="0.9" fill="${darken(c,0.5)}"/>`;}s+='</g>';return s;}
function hMorningGlory(c,ac,g){const dpr=darken(c,0.13);let s=`<g><path d="${(function(){let p='M';for(let i=0;i<=40;i++){const a=(i/40)*Math.PI*2;const r=33+Math.cos(a*5)*1.5;p+=`${(cx+Math.cos(a-Math.PI/2)*r).toFixed(1)} ${(cy+Math.sin(a-Math.PI/2)*r*1).toFixed(1)} ${i<40?'L':'Z'}`;}return p;})()}" fill="url(#pM-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.2"/>`;
for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;s+=`<path d="M${cx} ${cy} L ${(cx+Math.cos(a)*32).toFixed(1)} ${(cy+Math.sin(a)*32).toFixed(1)}" stroke="${lighten(c,0.3)}" stroke-width="2.4" opacity="0.5"/>`;}
s+=`<circle cx="${cx}" cy="${cy}" r="13" fill="url(#pI-${g})"/><circle cx="${cx}" cy="${cy}" r="13" fill="#FFFFFF" opacity="0.4"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="#E8DCA0"/><circle cx="${cx}" cy="${cy}" r="1.4" fill="#C9A227"/></g>`;return s;}
function hCalla(c,ac,g){const dpr=darken(c,0.13);return `<g><path d="M50 86 C 36 70 36 44 50 30 C 60 20 74 26 73 42 C 72 56 60 56 56 46 C 54 40 60 38 62 43" fill="url(#pM-${g})" stroke="${dpr}" stroke-width="0.5" stroke-opacity="0.3"/><path d="M50 86 C 40 72 39 50 50 36" fill="none" stroke="${darken(c,0.18)}" stroke-width="0.6" opacity="0.4"/><path d="M52 40 C 53 50 53 60 52 70" stroke="#E8C24A" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M52 40 C 53 50 53 60 52 70" stroke="#C99A22" stroke-width="1" fill="none" stroke-dasharray="0.5 2" opacity="0.6"/></g>`;}
function hProtea(c,ac,g){const dpr=darken(c,0.13);let s='<g>';// outer pointed bracts in rings (cup of spikes)
for(let ring=0;ring<3;ring++){const n=14-ring*2,L=34-ring*8,w=4.2-ring*0.6,rot=ring*12;for(let i=0;i<n;i++){s+=`<path d="${pLance(L,w)}" fill="url(#p${ring===0?'O':'M'}-${g})" stroke="${dpr}" stroke-width="0.3" stroke-opacity="0.2" transform="translate(${cx} ${cy+6}) rotate(${rot+i*(360/n)}) scale(1,0.6) translate(0,-10)"/>`;}}
// dense fuzzy centre
s+=`<circle cx="${cx}" cy="${cy+2}" r="11" fill="${darken(c,0.1)}"/>`;for(let i=0;i<40;i++){const a=i*GA*Math.PI/180,rr=1.6*Math.sqrt(i);if(rr>10)continue;s+=`<line x1="${cx}" y1="${cy+2}" x2="${(cx+Math.cos(a)*rr).toFixed(1)}" y2="${(cy+2+Math.sin(a)*rr).toFixed(1)}" stroke="${lighten(c,0.3)}" stroke-width="0.6"/>`;}
s+=`<circle cx="${cx}" cy="${cy+2}" r="4" fill="${lighten(c,0.4)}"/></g>`;return s;}

// ===== ARCHETYPE: SPIKE (florets up a stem) =====
function spikeStem(g){return `<path d="M50 100 C 49 78 50 50 50 22" stroke="url(#st-${g})" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M50 74 C 42 72 37 67 35 60 C 43 61 49 66 50 74 Z" fill="url(#lf-${g})" opacity="0.9"/><path d="M50 64 C 58 62 63 57 65 50 C 57 51 51 56 50 64 Z" fill="url(#lf-${g})" opacity="0.85"/>`;}
function spike(c,ac,g,floret,{top=20,bot=82,rows=7,spread=9}={}){let s=spikeStem(g);for(let r=0;r<rows;r++){const t=r/(rows-1),y=bot-(bot-top)*t,sc=0.7+0.5*(1-t),dx=spread*(1-t*0.4);
  s+=floret(50-dx,y,sc,g,r)+floret(50+dx,y+1.5,sc*0.95,g,r);if(r<rows-2)s+=floret(50,y-1,sc*1.05,g,r);}
  return `<g>${s}</g>`;}
function flLavender(x,y,sc,g){return `<ellipse cx="${x}" cy="${y}" rx="${2.6*sc}" ry="${3.4*sc}" fill="url(#pM-${g})" stroke="${darken('#7A5AA8',0.1)}" stroke-width="0.2" stroke-opacity="0.4"/>`;}
function flPea(x,y,sc,c,g){return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 0 C -5 -1 -6 -6 -2 -8 C 2 -9 5 -6 4 -2 C 3.4 0 1 -0.5 1 -3" fill="url(#pO-${g})" stroke="${darken(c,0.16)}" stroke-width="0.3" stroke-opacity="0.4"/><ellipse cx="0" cy="2.5" rx="3.6" ry="2.4" fill="url(#pM-${g})"/></g>`;}
function flStar6(x,y,sc,c,g){let s=`<g transform="translate(${x} ${y}) scale(${sc})">`;for(let i=0;i<6;i++)s+=`<path d="M0 0 L -1.6 -5 L 0 -6.4 L 1.6 -5 Z" fill="url(#pM-${g})" transform="rotate(${i*60})"/>`;s+=`<circle r="1.4" fill="url(#pI-${g})"/></g>`;return s;}
function flFunnel(x,y,sc,c,g){return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 4 C -7 2 -8 -7 -3 -9 C -1 -9.6 1 -9.6 3 -9 C 8 -7 7 2 0 4 Z" fill="url(#pO-${g})" stroke="${darken(c,0.16)}" stroke-width="0.3" stroke-opacity="0.4"/><path d="M-3 -9 C -2 -3 2 -3 3 -9" stroke="${lighten(c,0.4)}" stroke-width="0.6" fill="none" opacity="0.6"/><circle cx="0" cy="-2" r="1.4" fill="#E8DCA0"/></g>`;}
function flMouth(x,y,sc,c,g){return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 -6 C -6 -5 -7 1 -4 4 C -1 6 1 6 4 4 C 7 1 6 -5 0 -6 Z" fill="url(#pO-${g})" stroke="${darken(c,0.16)}" stroke-width="0.3" stroke-opacity="0.4"/><ellipse cx="0" cy="2" rx="3" ry="1.6" fill="${darken(c,0.34)}"/><circle cx="0" cy="1.6" r="1" fill="#E8DCA0"/></g>`;}
function flBloom4(x,y,sc,c,g){let s=`<g transform="translate(${x} ${y}) scale(${sc})">`;for(let i=0;i<4;i++)s+=`<path d="${pHeart(7,5)}" fill="url(#pM-${g})" transform="rotate(${i*90})"/>`;s+=`<circle r="1.4" fill="url(#pI-${g})"/><circle r="0.7" fill="#E8DCA0"/></g>`;return s;}

// ===== ARCHETYPE: UMBEL (dome of small florets) =====
function umbel(c,ac,g,floret,{r=24,rings=[[1,0],[6,9],[11,17],[14,24]]}={}){let s=`<path d="M50 100 C 49 82 50 66 50 56" stroke="url(#st-${g})" stroke-width="2.4" fill="none"/><path d="M50 78 C 40 76 33 79 30 86 C 40 88 48 84 50 78 Z" fill="url(#lf-${g})" opacity="0.9"/>`;
  for(const [n,rr] of rings){for(let i=0;i<n;i++){const a=i*(360/n)*Math.PI/180+(rr*0.1);const x=cx+Math.cos(a)*rr, y=(cy-2)+Math.sin(a)*rr*0.78;s+=floret(x,y,0.92-rr*0.006,c,g);}}return `<g>${s}</g>`;}
function flUmbelFloret(x,y,sc,c,g){let s=`<g transform="translate(${x} ${y}) scale(${sc})">`;for(let i=0;i<4;i++)s+=`<path d="M0 0 C -3 -1.4 -3.4 -5 -1 -6 C 1 -6.6 3 -5 3 -2.6 C 3 -1 1.4 -0.6 1 -2.6" fill="url(#pM-${g})" transform="rotate(${i*90})" stroke="${darken(c,0.13)}" stroke-width="0.2" stroke-opacity="0.3"/>`;s+=`<circle r="1.3" fill="url(#pI-${g})"/><circle r="0.6" fill="#E8DCA0"/></g>`;return s;}
function flAllium(x,y,sc,c,g){let s=`<g transform="translate(${x} ${y}) scale(${sc})">`;for(let i=0;i<6;i++)s+=`<path d="M0 0 L -1 -5 L 0 -6 L 1 -5 Z" fill="url(#pM-${g})" transform="rotate(${i*60})"/>`;s+=`<circle r="1" fill="${lighten(c,0.4)}"/></g>`;return s;}

// ===== ARCHETYPE: NODDING BELLS on a gracefully arching stem (bluebell, lily-of-valley) =====
function bellStem(c,ac,g,{n=6,bellW=5,bellL=9,flare=true}={}){const dpr=darken(c,0.13);
  // an arch rising from the base, curving over to the right, the tip drooping
  const stemPath="M50 100 C 47 80 44 58 52 42 C 57 32 65 28 73 30";
  let s=`<path d="${stemPath}" stroke="url(#st-${g})" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M48 80 C 40 78 35 73 33 66 C 41 67 47 72 48 80 Z" fill="url(#lf-${g})" opacity="0.85"/>`;
  // hang bells from points along the rising arch (left→up→right), each clearly drooping down
  for(let i=0;i<n;i++){const t=i/(n-1);
    const x=46+(73-46)*t, y=58+(30-58)*t-Math.sin(t*Math.PI)*5, sc=0.66+0.5*t;
    s+=`<line x1="${x.toFixed(1)}" y1="${(y-1).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y+1).toFixed(1)}" stroke="#5F7E5F" stroke-width="0.8"/>`;
    s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc})"><path d="M0 0 C ${-bellW} 1 ${-bellW} ${bellL*0.7} ${-bellW*0.66} ${bellL} C ${-bellW*0.28} ${bellL+1.6} ${bellW*0.28} ${bellL+1.6} ${bellW*0.66} ${bellL} C ${bellW} ${bellL*0.7} ${bellW} 1 0 0 Z" fill="url(#pM-${g})" stroke="${dpr}" stroke-width="0.3" stroke-opacity="0.35"/>`;
    if(flare)s+=`<path d="M${-bellW*0.66} ${bellL} q ${-1.4} ${1.8} ${-2.4} ${1.4} M0 ${bellL+0.6} l 0 ${2} M${bellW*0.66} ${bellL} q ${1.4} ${1.8} ${2.4} ${1.4}" stroke="${darken(c,0.16)}" stroke-width="0.7" fill="none" opacity="0.6" stroke-linecap="round"/>`;
    s+=`<ellipse cx="${-bellW*0.3}" cy="${bellL*0.4}" rx="${bellW*0.3}" ry="${bellL*0.3}" fill="#FFFFFF" opacity="0.2"/></g>`;}
  return `<g>${s}</g>`;}
// FREESIA — a one-sided arching spray of upward funnel florets
function freesia(c,ac,g){const dpr=darken(c,0.13);let s=`<path d="M50 100 C 50 80 50 60 56 46 C 60 36 66 32 74 32" stroke="url(#st-${g})" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const pts=[[56,52,1],[60,44,0.95],[65,38,0.88],[70,34,0.78],[74,32,0.6]];
  for(const[x,y,sc] of pts){s+=`<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 6 C -7 4 -8 -7 -3 -10 C -1 -10.8 1 -10.8 3 -10 C 8 -7 7 4 0 6 Z" fill="url(#pO-${g})" stroke="${dpr}" stroke-width="0.3" stroke-opacity="0.4"/><path d="M-3 -10 C -2 -3 2 -3 3 -10" stroke="${lighten(c,0.4)}" stroke-width="0.7" fill="none" opacity="0.6"/><circle cx="0" cy="-3" r="1.6" fill="#E8DCA0"/></g>`;}
  return `<g>${s}</g>`;}
// ===== LIFECYCLE (rose: bud → bloom → hip(seed) → rest cane) + a couple of buds =====
function lcBud(c,ac,g){return `<g><path d="M50 100 C 49 80 50 64 50 52" stroke="url(#st-${g})" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M50 72 C 40 70 33 73 31 80 C 40 81 47 77 50 72 Z" fill="url(#lf-${g})"/><g transform="translate(50 46)"><path d="M0 8 C -9 6 -12 -6 -7 -16 C -3 -10 -2 0 0 8 Z" fill="url(#st-${g})" opacity="0.92"/><path d="M0 8 C 9 6 12 -6 7 -16 C 3 -10 2 0 0 8 Z" fill="url(#st-${g})" opacity="0.92"/><path d="M0 9 C -7 6 -8 -10 -3 -18 C 0 -22 2 -14 1.4 -6 C 1 0 0.6 5 0 9 Z" fill="url(#pO-${g})" stroke="${darken(c,0.13)}" stroke-width="0.4" stroke-opacity="0.2"/><path d="M0 9 C 6 5 6 -10 2 -17 C 4 -8 3 0 0 9 Z" fill="url(#pM-${g})"/></g></g>`;}
function lcHip(){return `<g><defs><radialGradient id="hipg" cx="40%" cy="34%" r="70%"><stop offset="0%" stop-color="#E0764A"/><stop offset="55%" stop-color="#C0461F"/><stop offset="100%" stop-color="#8E2E14"/></radialGradient></defs><path d="M50 100 C 49 82 50 70 50 58" stroke="#7E9A7E" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M50 78 C 60 76 66 79 68 86 C 59 87 52 83 50 78 Z" fill="#82A282"/><ellipse cx="50" cy="46" rx="13" ry="15" fill="url(#hipg)"/><ellipse cx="46" cy="40" rx="4" ry="5" fill="#E89A6E" opacity="0.5"/><g stroke="#9E7A3A" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.85"><path d="M50 32 C 49 27 48 24 46 21"/><path d="M50 32 C 51 27 52 24 54 21"/><path d="M50 32 C 50 28 50 25 50 22"/><path d="M50 32 C 47 29 44 28 41 28"/><path d="M50 32 C 53 29 56 28 59 28"/></g></g>`;}
function lcRest(){return `<g><defs><linearGradient id="caneg" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#6E5A43"/><stop offset="100%" stop-color="#8B7355"/></linearGradient></defs><path d="M50 100 C 48 82 54 66 52 50 C 51 42 54 36 60 32" stroke="url(#caneg)" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M52 70 L 47 66 M54 58 L 59 55 M51 84 L 46 81 M53 46 L 58 44" stroke="#6E5A43" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/><g transform="translate(60 31)"><path d="M0 4 C -4 3 -5 -4 -2 -8 C 0 -5 0.6 0 0 4 Z" fill="#9CAE84"/><path d="M0 4 C 4 3 5 -4 2 -8 C 0 -5 -0.6 0 0 4 Z" fill="#8FAF8F"/><path d="M0 4 C -2 1 -2 -6 0 -9 C 2 -6 2 1 0 4 Z" fill="#B6543E"/></g></g>`;}

// ===== ARCHETYPE: BLOSSOM BRANCH (cherry/almond) =====
function branch(c,ac,g,{blossoms}={}){const dpr=darken(c,0.13);let s=`<path d="M14 96 C 30 84 42 64 50 44 C 56 30 64 22 78 16" stroke="#6E5A43" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 60 C 48 54 54 50 62 48 M30 76 C 36 70 40 66 46 64" stroke="#6E5A43" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const blo=blossoms||[[50,44,1.0],[66,24,0.8],[36,64,0.78],[58,52,0.6],[78,16,0.66],[44,52,0.5]];
  for(const [x,y,sc] of blo){s+=`<g transform="translate(${x} ${y}) scale(${sc})">`;for(let i=0;i<5;i++)s+=`<path d="M0 0 C -5 -2 -6 -8 -2.4 -11 C -1 -12 1 -12 1 -10 C 1 -12 1 -10 2.4 -11 C 6 -8 5 -2 0 0 Z" fill="url(#pM-${g})" stroke="${dpr}" stroke-width="0.3" stroke-opacity="0.3" transform="rotate(${i*72})"/>`;
    for(let k=0;k<6;k++){const a=k*60*Math.PI/180;s+=`<line x1="0" y1="0" x2="${(Math.cos(a-Math.PI/2)*4).toFixed(1)}" y2="${(Math.sin(a-Math.PI/2)*4).toFixed(1)}" stroke="#D98AAE" stroke-width="0.4"/>`;}
    s+=`<circle r="1.6" fill="#E8C24A"/></g>`;}
  return `<g>${s}</g>`;}

// ===== FOLIAGE =====
function fFern(c,ac,g){let s='';for(const [rot,len] of [[-20,42],[0,52],[20,42]]){s+=`<g transform="translate(50 64) rotate(${rot})"><path d="M0 0 Q 3 ${-len/2} 1 ${-len}" stroke="url(#lf-${g})" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;for(let i=0;i<7;i++){const t=(i+0.5)/7,yy=-len*t,ll=5.6*(1-t*0.66);s+=`<ellipse cx="${-ll*0.7}" cy="${yy}" rx="${ll}" ry="${ll*0.34}" fill="url(#lf-${g})" opacity="0.92" transform="rotate(-32 ${-ll*0.7} ${yy})"/><ellipse cx="${ll*0.7}" cy="${yy}" rx="${ll}" ry="${ll*0.34}" fill="url(#lf-${g})" opacity="0.92" transform="rotate(32 ${ll*0.7} ${yy})"/>`;}s+='</g>';}return `<g>${s}</g>`;}
function fEucalyptus(c,ac,g){let s=`<path d="M50 100 C 49 76 51 50 50 26" stroke="#7E8F6F" stroke-width="1.6" fill="none"/>`;for(let i=0;i<7;i++){const t=i/6,y=92-66*t,side=i%2?1:-1;s+=`<ellipse cx="${50+side*9}" cy="${y}" rx="7" ry="5.4" fill="url(#lf-${g})" stroke="#7E8F6F" stroke-width="0.4" stroke-opacity="0.4"/><ellipse cx="${50+side*9-side*1}" cy="${y}" rx="2" ry="3" fill="#FFFFFF" opacity="0.12"/>`;}s+=`<circle cx="50" cy="26" r="5" fill="url(#lf-${g})"/>`;return `<g>${s}</g>`;}
function fMonstera(c,ac,g){let s=`<path d="M50 100 C 50 80 50 64 50 56" stroke="url(#st-${g})" stroke-width="2.4" fill="none"/><path d="M50 56 C 30 54 18 40 18 22 C 30 16 48 18 58 30 C 66 40 64 52 50 56 Z" fill="url(#lf-${g})" stroke="#5F7E5F" stroke-width="0.5" stroke-opacity="0.4"/>`;
  // splits
  s+=`<path d="M30 30 L 42 38 M28 40 L 42 44 M34 22 L 44 32 M44 24 L 50 36" stroke="#ECE7DA" stroke-width="2.4" stroke-linecap="round"/><path d="M50 54 C 40 48 30 38 26 26" stroke="#5F7E5F" stroke-width="0.6" fill="none" opacity="0.5"/>`;return `<g>${s}</g>`;}
function fSucculent(c,ac,g){let s='';const rings=[[5,16,'O'],[6,11,'M'],[6,6,'I']];for(const[n,L,code] of rings){for(let i=0;i<n;i++){const a=i*(360/n)+(L*1.2);s+=`<path d="M0 0 C -5 -${L*0.5} -3 -${L} 0 -${L} C 3 -${L} 5 -${L*0.5} 0 0 Z" fill="url(#p${code}-${g})" stroke="${darken('#8FAF8F',0.1)}" stroke-width="0.3" stroke-opacity="0.3" transform="translate(50 56) rotate(${a})"/>`;}}s+=`<circle cx="50" cy="56" r="3" fill="url(#pI-${g})"/>`;return `<g>${s}</g>`;}
function fIvy(c,ac,g){let s=`<path d="M22 96 C 36 80 40 60 50 44 C 56 34 64 30 74 26" stroke="#5F7E5F" stroke-width="1.4" fill="none"/>`;const lv=[[34,72,1],[50,46,1.1],[62,32,0.9],[42,58,0.8],[70,26,0.7]];for(const[x,y,sc] of lv){s+=`<path d="M0 0 C -8 -3 -10 -10 -5 -14 C -2 -16 -1 -12 0 -10 C 1 -12 2 -16 5 -14 C 10 -10 8 -3 0 0 Z" fill="url(#lf-${g})" stroke="#5F7E5F" stroke-width="0.4" stroke-opacity="0.4" transform="translate(${x} ${y}) scale(${sc})"/>`;}return `<g>${s}</g>`;}
function fOlive(c,ac,g){let s=`<path d="M50 100 C 49 76 51 48 50 22" stroke="#8B7355" stroke-width="1.6" fill="none"/>`;for(let i=0;i<8;i++){const t=i/7,y=92-70*t,side=i%2?1:-1;s+=`<path d="M${50+side*4} ${y} C ${50+side*14} ${y-3} ${50+side*16} ${y+2} ${50+side*5} ${y+1} Z" fill="url(#lf-${g})"/>`;if(i%2===0)s+=`<ellipse cx="${50+side*9}" cy="${y+5}" rx="2.4" ry="3.2" fill="#6E7E4E"/>`;}return `<g>${s}</g>`;}

// ===== SPECIES REGISTRY =====
const RING=(spec)=>(c,ac,g)=>ring(c,ac,g,spec);
const SPECIES=[
  // composites
  {n:'sunflower',cw:'gold',f:hSunflower},
  {n:'daisy',cw:'white',f:RING({rings:[[18,30,3.4,0,'M',0.98],[18,26,3,10,'O',0.95]],shape:'spoon',center:'gold'})},
  {n:'marguerite',cw:'white',f:RING({rings:[[16,33,4,0,'M',0.98]],shape:'spoon',center:'gold',cr:8})},
  {n:'gerbera',cw:'pink',f:RING({rings:[[26,32,3,0,'O',0.96],[24,26,2.8,7,'M',0.95],[18,19,2.6,5,'I',0.95]],shape:'strap',center:'dome'})},
  {n:'aster',cw:'violet',f:RING({rings:[[24,28,2.6,0,'O',0.96],[22,22,2.4,8,'M',0.95]],shape:'strap',center:'gold',cr:6})},
  {n:'echinacea',cw:'cerise',f:RING({rings:[[16,30,4.4,0,'O',0.95]],shape:'lance',center:'cone'})},
  {n:'rudbeckia',cw:'gold',f:RING({rings:[[15,30,4.6,0,'O',0.96]],shape:'spoon',center:'dome'})},
  {n:'calendula',cw:'orange',f:RING({rings:[[20,26,3,0,'O',0.96],[18,21,2.8,9,'M',0.97],[15,16,2.6,6,'I',0.98]],shape:'spoon',center:'dome'})},
  {n:'chamomile',cw:'white',f:RING({rings:[[16,22,2.6,0,'M',0.98]],shape:'strap',center:'gold',cr:5.5})},
  {n:'zinnia',cw:'cerise',f:RING({rings:[[14,28,5,0,'O',0.95],[13,22,4.6,13,'M',0.97],[11,16,4,7,'I',0.98]],shape:'round',center:'gold'})},
  {n:'cosmos',cw:'pink',f:RING({rings:[[8,32,7,0,'O',0.96]],shape:'broad',center:'gold',vein:true})},
  {n:'marigold',cw:'amber',f:RING({rings:[[16,24,4,0,'O',0.95],[15,19,3.6,12,'M',0.97],[12,14,3.2,7,'I',0.98],[9,9,2.8,10,'I',0.99]],shape:'round',center:'tuft'})},
  {n:'chrysanthemum',cw:'plum',f:RING({rings:[[20,30,2.6,0,'O',0.95],[18,24,2.4,9,'M',0.97],[15,17,2.2,6,'I',0.98],[11,11,2,8,'I',0.99]],shape:'strap',center:'tuft'})},
  {n:'dahlia',cw:'ruby',f:RING({rings:[[12,32,5,0,'O',0.95],[12,25,4.6,15,'M',0.97],[10,18,4,7,'M',0.98],[8,12,3.4,11,'I',0.99]],shape:'point',center:'tuft'})},
  {n:'osteospermum',cw:'lilacblue',f:RING({rings:[[16,28,4,0,'O',0.96]],shape:'spoon',center:'dome'})},
  // rosettes
  {n:'rose',cw:'crimson',f:hRose},
  {n:'rose-pink',cw:'pink',f:hRose},
  {n:'rose-peach',cw:'peach',f:hRose},
  {n:'peony',cw:'blush',f:(c,ac,g)=>hPeony(c,ac,g)},
  {n:'ranunculus',cw:'coral',f:RING({rings:[[11,24,6,0,'O',0.95],[10,18,5.4,17,'M',0.97],[9,13,4.6,9,'M',0.98],[7,8.5,4,14,'I',0.98],[5,5,3.4,20,'I',0.99]],shape:'cup',center:'tuft',cr:3})},
  {n:'camellia',cw:'pink',f:RING({rings:[[8,28,9,0,'O',0.96],[8,21,7.6,22,'M',0.98],[7,15,6.2,11,'M',0.98],[6,9,5,16,'I',0.99]],shape:'cup',center:'tuft',cr:3})},
  {n:'gardenia',cw:'white',f:RING({rings:[[8,28,9,0,'O',0.96],[8,21,7.6,22,'M',0.98],[7,15,6.2,11,'M',0.98],[6,9,5,16,'I',0.99]],shape:'cup',center:'green'})},
  {n:'carnation',cw:'cerise',f:RING({rings:[[10,26,7,0,'O',0.95],[10,20,6.4,18,'M',0.97],[9,14,5.6,9,'M',0.98],[7,9,4.8,14,'I',0.99]],shape:'frill',center:'tuft',cr:2.5})},
  {n:'begonia',cw:'scarlet',f:RING({rings:[[5,26,12,0,'O',0.96],[5,18,10,36,'M',0.97],[5,11,7,18,'I',0.98]],shape:'broad',center:'gold',cr:4})},
  // cups
  {n:'tulip',cw:'crimson',f:hTulip},
  {n:'poppy',cw:'scarlet',f:RING({rings:[[5,34,15,0,'O',0.96],[5,22,11,36,'M',0.98]],shape:'broad',center:'dome',vein:true})},
  {n:'anemone',cw:'violet',f:RING({rings:[[7,30,9,0,'O',0.96]],shape:'broad',center:'stamen'})},
  {n:'buttercup',cw:'butter',f:RING({rings:[[5,22,9,0,'M',0.98]],shape:'round',center:'green'})},
  {n:'hellebore',cw:'sage',f:RING({rings:[[5,28,11,0,'O',0.95]],shape:'broad',center:'stamen',vein:true})},
  {n:'magnolia',cw:'cream',f:hMagnolia},
  {n:'waterlily',cw:'pink',f:RING({rings:[[10,30,7,0,'O',0.95],[9,23,6,20,'M',0.97],[7,15,5,10,'I',0.98]],shape:'lance',center:'gold',cr:8})},
  {n:'lotus',cw:'blush',f:RING({rings:[[8,34,9,0,'O',0.9],[7,25,8,25,'M',0.95],[6,17,6.6,12,'I',0.98]],shape:'lance',center:'gold',cr:7})},
  // stars
  {n:'cornflower',cw:'blue',f:hCornflower},
  {n:'forget-me-not',cw:'sky',f:RING({rings:[[5,15,9,0,'M',0.98]],shape:'heart',center:'eye'})},
  {n:'primrose',cw:'butter',f:RING({rings:[[5,18,11,0,'M',0.98]],shape:'heart',center:'whiteEye'})},
  {n:'phlox',cw:'pink',f:RING({rings:[[5,17,9,0,'M',0.97]],shape:'heart',center:'eye'})},
  {n:'periwinkle',cw:'blue',f:RING({rings:[[5,18,9,0,'M',0.97]],shape:'round',center:'whiteEye'})},
  {n:'jasmine',cw:'white',f:RING({rings:[[6,18,5,0,'M',0.97]],shape:'lance',center:'eye'})},
  {n:'geranium',cw:'scarlet',f:RING({rings:[[5,16,9,0,'O',0.97]],shape:'round',center:'eye'})},
  {n:'plumeria',cw:'cream',f:RING({rings:[[5,24,12,0,'O',0.96]],shape:'broad',center:'gold',cr:4})},
  {n:'morning-glory',cw:'violet',f:hMorningGlory},
  {n:'hibiscus',cw:'coral',f:hHibiscus},
  // bells / trumpets / complex
  {n:'daffodil',cw:'butter',f:hDaffodil},
  {n:'lily',cw:'white',f:hLily},
  {n:'iris',cw:'violet',f:hIris},
  {n:'orchid',cw:'magenta',f:hOrchid},
  {n:'snowdrop',cw:'white',f:hSnowdrop},
  {n:'calla',cw:'cream',f:hCalla},
  {n:'protea',cw:'pink',f:hProtea},
  {n:'crocus',cw:'violet',f:RING({rings:[[6,30,7,0,'O',0.96],[3,26,6,0,'M',0.97]],shape:'lance',center:'gold',cr:3})},
  // spikes / racemes / umbels
  {n:'lavender',cw:'lavender',f:(c,ac,g)=>spike(c,ac,g,(x,y,sc)=>flLavender(x,y,sc,g),{rows:8,top:18,bot:78,spread:5})},
  {n:'foxglove',cw:'magenta',f:(c,ac,g)=>spike(c,ac,g,(x,y,sc)=>`<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 -3 C -5 -2 -6 7 -4 11 C -2 13 2 13 4 11 C 6 7 5 -2 0 -3 Z" fill="url(#pM-${g})" stroke="${darken(c,0.13)}" stroke-width="0.3" stroke-opacity="0.3"/><circle cx="-1.4" cy="6" r="0.7" fill="${darken(c,0.4)}"/><circle cx="1.4" cy="7" r="0.7" fill="${darken(c,0.4)}"/></g>`,{rows:7,top:16,bot:74,spread:7})},
  {n:'wisteria',cw:'lavender',f:(c,ac,g)=>spike(c,ac,g,(x,y,sc)=>flPea(x,y,sc,c,g),{rows:8,top:30,bot:90,spread:6})},
  {n:'hyacinth',cw:'violet',f:(c,ac,g)=>spike(c,ac,g,(x,y,sc)=>flStar6(x,y,sc,c,g),{rows:7,top:18,bot:74,spread:6})},
  {n:'delphinium',cw:'blue',f:(c,ac,g)=>spike(c,ac,g,(x,y,sc)=>flBloom4(x,y,sc,c,g),{rows:7,top:16,bot:74,spread:7})},
  {n:'gladiolus',cw:'pink',f:(c,ac,g)=>spike(c,ac,g,(x,y,sc)=>flFunnel(x,y,sc,c,g),{rows:6,top:18,bot:78,spread:5})},
  {n:'freesia',cw:'butter',f:freesia},
  {n:'snapdragon',cw:'coral',f:(c,ac,g)=>spike(c,ac,g,(x,y,sc)=>flMouth(x,y,sc,c,g),{rows:6,top:18,bot:76,spread:6})},
  {n:'hydrangea',cw:'blue',f:(c,ac,g)=>umbel(c,ac,g,(x,y,sc)=>flUmbelFloret(x,y,sc,c,g))},
  {n:'allium',cw:'violet',f:(c,ac,g)=>umbel(c,ac,g,(x,y,sc)=>flAllium(x,y,sc,c,g),{rings:[[1,0],[7,8],[12,15],[16,22]]})},
  {n:'bluebell',cw:'blue',f:(c,ac,g)=>bellStem(c,ac,g,{n:6,side:-1,bellW:5,bellL:8})},
  {n:'lily-of-the-valley',cw:'white',f:(c,ac,g)=>bellStem(c,ac,g,{n:7,side:1,bellW:4,bellL:5})},
  // blossom branches
  {n:'cherry-blossom',cw:'blush',f:(c,ac,g)=>branch(c,ac,g,{})},
  {n:'almond-blossom',cw:'white',f:(c,ac,g)=>branch(c,ac,g,{})},
  // foliage
  {n:'fern',cw:'sage',f:fFern},
  {n:'eucalyptus',cw:'sage',f:fEucalyptus},
  {n:'monstera',cw:'sage',f:fMonstera},
  {n:'succulent',cw:'sage',f:fSucculent},
  {n:'ivy',cw:'sage',f:fIvy},
  {n:'olive',cw:'sage',f:fOlive},
];
// peony (needs ruffle helper)
function hPeony(c,ac,g){const dpr=darken(c,0.13);const rf=(L,w)=>`M0 0 C ${-w} ${-L*0.22} ${-w*1.02} ${-L*0.64} ${-w*0.5} ${-L*0.82} C ${-w*0.28} ${-L*0.9} ${-w*0.14} ${-L*0.84} ${-w*0.06} ${-L*0.93} C ${-w*0.02} ${-L*0.99} ${w*0.02} ${-L*0.99} ${w*0.06} ${-L*0.93} C ${w*0.14} ${-L*0.84} ${w*0.28} ${-L*0.9} ${w*0.5} ${-L*0.82} C ${w*1.02} ${-L*0.64} ${w} ${-L*0.22} 0 0 Z`;const RR=[[11,31,12,0,'O',0.96],[11,25,11,16,'M',0.97],[10,19,9.5,9,'M',0.98],[8,13.5,8,13,'I',0.98],[6,8.5,6.4,20,'I',0.99]];let s='<g>';for(const[ct,L,w,rot,cd]of RR)for(let i=0;i<ct;i++)s+=`<path d="${rf(L,w)}" fill="url(#p${cd}-${g})" stroke="${dpr}" stroke-width="0.4" stroke-opacity="0.2" transform="translate(${cx} ${cy}) rotate(${rot+i*(360/ct)})"/>`;s+=`<circle cx="${cx}" cy="${cy}" r="6" fill="url(#pI-${g})"/>`;for(let i=0;i<7;i++){const a=i*51.4*Math.PI/180,r=3.4;s+=`<path d="${rf(7,4)}" fill="url(#pI-${g})" transform="translate(${(cx+Math.cos(a)*r).toFixed(1)} ${(cy+Math.sin(a)*r).toFixed(1)}) rotate(${(i*51.4+90).toFixed(0)})"/>`;}s+='</g>';return s;}

function bloom(name,size){const sp=SPECIES.find(s=>s.n===name)||SPECIES[0];const cw=cwOf(sp.cw),g=name.replace(/[^a-z]/gi,'');const isFol=['fern','eucalyptus','monstera','succulent','ivy','olive'].includes(name);
  const head=sp.f(cw.p,cw.a,g);
  return `<svg viewBox="0 0 100 108" width="${size}" height="${Math.round(size*1.08)}" style="overflow:visible">${defs(g,cw.p,cw.a)}<ellipse cx="${cx}" cy="103" rx="20" ry="4.4" fill="#2E261B" opacity="0.18"/>${isFol?'':stem(g)}${head}</svg>`;}
// lifecycle (rose) + buds — shown in the Flora Lab per the v4 bible
const LIFECYCLE=[
  {n:'bud',cw:'crimson',f:lcBud},
  {n:'bloom',cw:'crimson',f:hRose},
  {n:'seed (hip)',cw:'crimson',f:(c,a,g)=>lcHip()},
  {n:'rest (cane)',cw:'crimson',f:(c,a,g)=>lcRest()},
];
const BUDS=[
  {n:'rose bud',cw:'crimson',f:lcBud},
  {n:'peony bud',cw:'blush',f:lcBud},
  {n:'tulip bud',cw:'gold',f:lcBud},
  {n:'poppy bud',cw:'scarlet',f:lcBud},
];
function bloomList(list,name,size){const sp=list.find(s=>s.n===name);if(!sp)return '';const cw=cwOf(sp.cw),g=('x'+name).replace(/[^a-z]/gi,'');return `<svg viewBox="0 0 100 108" width="${size}" height="${Math.round(size*1.08)}" style="overflow:visible">${defs(g,cw.p,cw.a)}<ellipse cx="${cx}" cy="103" rx="16" ry="3.8" fill="#2E261B" opacity="0.16"/>${sp.f(cw.p,cw.a,g)}</svg>`;}
window.SPECIES=SPECIES; window.bloom=bloom; window.LIFECYCLE=LIFECYCLE; window.BUDS=BUDS; window.bloomList=bloomList;
