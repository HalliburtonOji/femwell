// FemWell flora — the 50+ species botanical library (reference build → ports to flora.jsx).
// Archetype engine (composite/rosette/cup/star/bell/spike/umbel/branch) + bespoke heads + a SPECIES registry.
function lighten(h,a){const n=parseInt(h.replace('#',''),16);const r=Math.min(255,((n>>16)&255)+Math.round(255*a)),g=Math.min(255,((n>>8)&255)+Math.round(255*a)),b=Math.min(255,(n&255)+Math.round(255*a));return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function darken(h,a){const n=parseInt(h.replace('#',''),16);const r=Math.max(0,((n>>16)&255)-Math.round(255*a)),g=Math.max(0,((n>>8)&255)-Math.round(255*a)),b=Math.max(0,(n&255)-Math.round(255*a));return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function lum(h){const n=parseInt(h.replace('#',''),16);return(0.299*((n>>16)&255)+0.587*((n>>8)&255)+0.114*(n&255))/255;}
const GA=137.50776, cx=50, cy=52;

// ── colourways (botanically chosen; petal/lit-tip/accent) ──
const CWAY={
  crimson:{p:'#BC2E27',t:'#D9554E',a:'#2E261B'}, scarlet:{p:'#C5362A',t:'#E36A4C',a:'#5E1B12'},
  blush:{p:'#E8B4B8',t:'#F6DCDE',a:'#A8893F'}, pink:{p:'#E86A9E',t:'#F4A8C6',a:'#8E2E5A'},
  peach:{p:'#E8966A',t:'#F4C29E',a:'#8E4B2C'}, coral:{p:'#E08A6A',t:'#F0B79E',a:'#8E3B2C'},
  gold:{p:'#D4AF37',t:'#E8CE78',a:'#6B5840'}, butter:{p:'#E8C84A',t:'#F4E08A',a:'#8A6D1C'},
  orange:{p:'#E08A2E',t:'#F0B257',a:'#8E4B12'}, amber:{p:'#D98A33',t:'#EEB063',a:'#7A4416'},
  sage:{p:'#8FAF8F',t:'#B6CDB6',a:'#2E261B'}, white:{p:'#EDE8DC',t:'#FFFFFF',a:'#C9A227'},
  cream:{p:'#E4DAC1',t:'#F4ECD8',a:'#A8893F'}, plum:{p:'#8E6E8E',t:'#B196B1',a:'#D4AF37'},
  violet:{p:'#7A5AA8',t:'#A88FCB',a:'#E8CE78'}, lavender:{p:'#B6A6C9',t:'#D8CCE6',a:'#8E6E8E'},
  blue:{p:'#5E78C0',t:'#93A8DE',a:'#2E3A5E'}, sky:{p:'#9FB6C9',t:'#C3D2DE',a:'#5F7E8E'},
  cerise:{p:'#C73E78',t:'#E37AA6',a:'#7A1E48'}, magenta:{p:'#B43A8E',t:'#D87CBC',a:'#6E1E54'},
  ruby:{p:'#A8324A',t:'#CC5E74',a:'#5E1626'}, lilacblue:{p:'#8E8FD0',t:'#B6B8E4',a:'#4A4A82'},
};
const cwOf=k=>CWAY[k]||CWAY.crimson;

// ── petal silhouettes ──
function pRound(L,w){return `M0 0 C ${-w} ${-L*0.24} ${-w*0.98} ${-L*0.70} ${-w*0.42} ${-L*0.88} C ${-w*0.18} ${-L*0.97} ${-w*0.05} ${-L} 0 ${-L*0.92} C ${w*0.05} ${-L} ${w*0.18} ${-L*0.97} ${w*0.42} ${-L*0.88} C ${w*0.98} ${-L*0.70} ${w} ${-L*0.24} 0 0 Z`;}
function pPoint(L,w){return `M0 0 C ${-w} ${-L*0.36} ${-w*0.55} ${-L*0.80} 0 ${-L} C ${w*0.55} ${-L*0.80} ${w} ${-L*0.36} 0 0 Z`;}
function pCup(L,w){return `M0 0 C ${-w} ${-L*0.30} ${-w*0.95} ${-L*0.82} ${-w*0.34} ${-L*0.99} C ${-w*0.10} ${-L*1.02} ${w*0.10} ${-L*1.02} ${w*0.34} ${-L*0.99} C ${w*0.95} ${-L*0.82} ${w} ${-L*0.30} 0 0 Z`;}
function pBroad(L,w){return `M0 0 C ${-w*1.05} ${-L*0.20} ${-w*1.04} ${-L*0.62} ${-w*0.52} ${-L*0.90} C ${-w*0.22} ${-L*1.05} ${w*0.22} ${-L*1.05} ${w*0.52} ${-L*0.90} C ${w*1.04} ${-L*0.62} ${w*1.05} ${-L*0.20} 0 0 Z`;}
function pLance(L,w){return `M0 0 C ${-w} ${-L*0.34} ${-w*0.5} ${-L*0.84} 0 ${-L} C ${w*0.5} ${-L*0.84} ${w} ${-L*0.34} 0 0 Z`;}
function pSpoon(L,w){return `M0 0 C ${-w*0.34} ${-L*0.46} ${-w} ${-L*0.80} ${-w*0.52} ${-L*0.96} C ${-w*0.22} ${-L*1.03} ${w*0.22} ${-L*1.03} ${w*0.52} ${-L*0.96} C ${w} ${-L*0.80} ${w*0.34} ${-L*0.46} 0 0 Z`;}
function pStrap(L,w){return `M0 0 C ${-w} ${-L*0.18} ${-w} ${-L*0.82} ${-w*0.45} ${-L*0.96} C ${-w*0.15} ${-L*1.02} ${w*0.15} ${-L*1.02} ${w*0.45} ${-L*0.96} C ${w} ${-L*0.82} ${w} ${-L*0.18} 0 0 Z`;}
function pHeart(L,w){return `M0 0 C ${-w} ${-L*0.24} ${-w} ${-L*0.74} ${-w*0.5} ${-L*0.9} C ${-w*0.28} ${-L*0.98} ${-w*0.1} ${-L*0.9} 0 ${-L*0.78} C ${w*0.1} ${-L*0.9} ${w*0.28} ${-L*0.98} ${w*0.5} ${-L*0.9} C ${w} ${-L*0.74} ${w} ${-L*0.24} 0 0 Z`;}
function pFrill(L,w){let s=`M0 0 C ${-w} ${-L*0.3} ${-w} ${-L*0.7} ${-w*0.7} ${-L*0.84} `;const n=5;for(let i=0;i<=n;i++){const x=(-0.7+1.4*i/n)*w, nx=x+(i<n?0.7*w/n:0); s+=`L ${(x*0.96).toFixed(1)} ${(-L*(0.88+(i%2?0.06:0))).toFixed(1)} `;}s+=`C ${w} ${-L*0.7} ${w} ${-L*0.3} 0 0 Z`;return s;}
const PFN={round:pRound,point:pPoint,cup:pCup,broad:pBroad,lance:pLance,spoon:pSpoon,strap:pStrap,heart:pHeart,frill:pFrill};

// ── gradients ──
function defs(g,c,ac){const pale=lum(c)>0.62,dA=pale?0.26:0.13,kA=pale?0.42:0.3;const li=lighten(c,0.52),l=lighten(c,0.34),m=lighten(c,0.14),dp=c,dpr=darken(c,dA),dk=darken(c,kA);
 return `<defs><linearGradient id="pO-${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${l}"/><stop offset="24%" stop-color="${m}"/><stop offset="68%" stop-color="${dp}"/><stop offset="100%" stop-color="${dpr}"/></linearGradient>
 <linearGradient id="pM-${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${li}"/><stop offset="30%" stop-color="${l}"/><stop offset="72%" stop-color="${m}"/><stop offset="100%" stop-color="${dp}"/></linearGradient>
 <linearGradient id="pI-${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${lighten(c,0.62)}"/><stop offset="45%" stop-color="${li}"/><stop offset="100%" stop-color="${l}"/></linearGradient>
 <radialGradient id="occ-${g}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${dk}" stop-opacity="0.55"/><stop offset="55%" stop-color="${dk}" stop-opacity="0.28"/><stop offset="100%" stop-color="${dk}" stop-opacity="0"/></radialGradient>
 <radialGradient id="ct-${g}" cx="42%" cy="38%" r="64%"><stop offset="0%" stop-color="${lighten(ac,0.34)}"/><stop offset="60%" stop-color="${ac}"/><stop offset="100%" stop-color="${darken(ac,0.16)}"/></radialGradient>
 <radialGradient id="disc-${g}" cx="42%" cy="40%" r="64%"><stop offset="0%" stop-color="#A07A2E"/><stop offset="58%" stop-color="#6E4F1C"/><stop offset="100%" stop-color="#4A3412"/></radialGradient>
 <linearGradient id="st-${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8FAF8F"/><stop offset="100%" stop-color="#5F7E5F"/></linearGradient>
 <linearGradient id="lf-${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#A6C6A6"/><stop offset="55%" stop-color="#82A282"/><stop offset="100%" stop-color="#5F7E5F"/></linearGradient></defs>`;}
function stem(g){return `<path d="M48.4 100 C 47.9 86 49.4 72 49 62 L 51 62 C 51.4 72 52 86 51.5 100 Z" fill="url(#st-${g})"/><path d="M49 80 C 37 76 29 79 26 88 C 37 90 47 85 49 79 Z" fill="url(#lf-${g})" opacity="0.95"/><path d="M51 73 C 63 69 71 72 74 81 C 63 83 53 78 51 72 Z" fill="url(#lf-${g})" opacity="0.9"/>`;}

// ── centres ──
function cGold(c,ac,g,r=7.2){let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#disc-${g})"/>`;const n=Math.round(r*2);for(let i=0;i<n;i++){const a=i*(360/n)*Math.PI/180,rr=r*0.7;s+=`<circle cx="${(cx+Math.cos(a)*rr).toFixed(1)}" cy="${(cy+Math.sin(a)*rr).toFixed(1)}" r="0.9" fill="#7A5A22" opacity="0.78"/>`;}s+=`<circle cx="${cx}" cy="${cy}" r="${(r*0.34).toFixed(1)}" fill="#E9CF7A"/>`;return s;}
function cDome(c,ac,g,r=8.6){let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${darken(c,0.5)}"/><circle cx="${cx}" cy="${cy}" r="${r+1.4}" fill="url(#occ-${g})"/>`;for(let i=0;i<13;i++){const a=i*27.7*Math.PI/180,rr=r*0.72;s+=`<circle cx="${(cx+Math.cos(a)*rr).toFixed(1)}" cy="${(cy+Math.sin(a)*rr).toFixed(1)}" r="1" fill="${darken(c,0.66)}" opacity="0.9"/>`;}return s;}
function cCone(c,ac,g,r=9){let s=`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*1.05}" fill="${darken(ac,0.1)}"/>`;for(let i=0;i<60;i++){const a=i*GA*Math.PI/180,rr=r*0.14*Math.sqrt(i);if(rr>r)continue;s+=`<circle cx="${(cx+Math.cos(a)*rr).toFixed(1)}" cy="${(cy+Math.sin(a)*rr*1.05).toFixed(1)}" r="0.7" fill="${i%2?darken(ac,0.28):lighten(ac,0.1)}"/>`;}return s;}
function cTuft(c,ac,g){let s=`<circle cx="${cx}" cy="${cy}" r="13" fill="url(#occ-${g})"/><circle cx="${cx}" cy="${cy}" r="5.5" fill="url(#ct-${g})"/>`;for(let i=0;i<16;i++){const a=i*22.5*Math.PI/180,r=5;s+=`<circle cx="${(cx+Math.cos(a)*r).toFixed(1)}" cy="${(cy+Math.sin(a)*r).toFixed(1)}" r="1.6" fill="url(#ct-${g})" opacity="0.92"/>`;}return s;}
function cEye(c,ac,g){return `<circle cx="${cx}" cy="${cy}" r="4.6" fill="${darken(c,0.5)}"/><circle cx="${cx}" cy="${cy}" r="3" fill="#E9CF7A"/><circle cx="${cx}" cy="${cy}" r="1.4" fill="${darken(c,0.4)}"/>`;}
function cWhiteEye(c,ac,g){return `<circle cx="${cx}" cy="${cy}" r="4.4" fill="#FFFFFF"/><circle cx="${cx}" cy="${cy}" r="3" fill="#E9CF7A"/><circle cx="${cx}" cy="${cy}" r="1.3" fill="#C9A227"/>`;}
function cStamen(c,ac,g){let s=`<circle cx="${cx}" cy="${cy}" r="6" fill="${lighten(c,0.42)}"/>`;for(let i=0;i<18;i++){const a=i*20*Math.PI/180;s+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*6.4).toFixed(1)}" y2="${(cy+Math.sin(a)*6.4).toFixed(1)}" stroke="${darken(ac,0.05)}" stroke-width="0.5"/><circle cx="${(cx+Math.cos(a)*6.4).toFixed(1)}" cy="${(cy+Math.sin(a)*6.4).toFixed(1)}" r="0.8" fill="${ac}"/>`;}s+=`<circle cx="${cx}" cy="${cy}" r="2.2" fill="#E9CF7A"/>`;return s;}
function cGreen(c,ac,g){let s=`<circle cx="${cx}" cy="${cy}" r="5" fill="#9CB87E"/>`;for(let i=0;i<12;i++){const a=i*30*Math.PI/180;s+=`<circle cx="${(cx+Math.cos(a)*4.6).toFixed(1)}" cy="${(cy+Math.sin(a)*4.6).toFixed(1)}" r="0.9" fill="#7A6D1C"/>`;}s+=`<circle cx="${cx}" cy="${cy}" r="2" fill="#C9D49A"/>`;return s;}
const CENTER={gold:cGold,dome:cDome,cone:cCone,tuft:cTuft,eye:cEye,whiteEye:cWhiteEye,stamen:cStamen,green:cGreen};

// ── ARCHETYPE: ring (rosette / pom / composite) ──
function ring(c,ac,g,{rings,shape='round',center='tuft',vein=false,cr}){
  const dpr=darken(c,0.13),dp=c,m=lighten(c,0.14),sh=lighten(c,0.62),edge={O:dpr,M:dp,I:m};let s='<g>';
  for(const [count,L,w,rot,code,op] of rings){for(let i=0;i<count;i++){const a=rot+i*(360/count);
    s+=`<path d="${(PFN[shape]||pRound)(L,w)}" fill="url(#p${code}-${g})" opacity="${op}" stroke="${edge[code]}" stroke-width="0.4" stroke-opacity="0.16" transform="translate(${cx} ${cy}) rotate(${a})"/>`;
    if(vein)s+=`<path d="M0 -1 Q ${w*0.05} ${-L*0.5} 0 ${-L*0.82}" stroke="${sh}" stroke-width="0.5" stroke-opacity="0.4" fill="none" transform="translate(${cx} ${cy}) rotate(${a})"/>`;}}
  s+=(CENTER[center]||cTuft)(c,ac,g,cr);s+=`<ellipse cx="${cx-8}" cy="${cy-10}" rx="4" ry="2.4" fill="#FFFDF7" opacity="0.2" transform="rotate(-28 ${cx-8} ${cy-10})"/></g>`;return s;}

// quick ring spec helpers
const R=(count,L,w,rot,code,op)=>[count,L,w,rot,code,op];
