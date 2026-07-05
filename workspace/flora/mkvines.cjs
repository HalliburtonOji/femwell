const paths = `<path d='M6 6 C 22 10 34 22 40 42 C 43 52 49 58 60 60' stroke-width='1.1'/><path d='M20 9 C 26 6 33 8 36 15 C 29 17 22 14 20 9 Z' stroke-width='1.1'/><path d='M20 9 C 27 11 32 13 36 15' stroke-width='0.6'/><path d='M37 30 C 34 24 36 17 43 13 C 45 20 43 27 37 30 Z' stroke-width='1.1'/><path d='M37 30 C 38 24 40 19 43 14' stroke-width='0.6'/><path d='M41 47 C 47 44 54 46 57 53 C 50 55 43 52 41 47 Z' stroke-width='1.1'/><circle cx='60' cy='60' r='2.4' fill='#A8893F' stroke='none'/><circle cx='6' cy='6' r='1.6' fill='#A8893F' stroke='none'/>`;
const enc = s => s.replace(/</g,'%3C').replace(/>/g,'%3E').replace(/#/g,'%23');
const corner = r => `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' fill='none' stroke='#A8893F' stroke-linecap='round' stroke-linejoin='round' stroke-opacity='0.5'><g transform='rotate(${r} 40 40)'>${paths}</g></svg>`)}")`;
const grain = `url("data:image/svg+xml,${enc(`<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='140' height='140' filter='url(#g)' opacity='0.045'/></svg>`)}")`;
const out =
`  :root{\n`+
`    --vtl:${corner(0)};\n`+
`    --vtr:${corner(90)};\n`+
`    --vbr:${corner(180)};\n`+
`    --vbl:${corner(270)};\n`+
`    --grain:${grain};\n`+
`  }`;
require('fs').writeFileSync('vines-block.css', out);
console.log('bytes', out.length);
