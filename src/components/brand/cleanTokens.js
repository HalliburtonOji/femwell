// cleanTokens — the "clean & classy" visual reset (BRAND_IDENTITY §2.7 · ✅ AGREED 2026-09-21).
// Halli: "cream on cream doesn't look good" · "remove that burnt look — clean and classy everywhere".
// ADDITIVE: surfaces migrate to these one at a time (SkyFocus first); the legacy `T` in
// journal/Editorial.jsx stays for un-migrated pages until the roll-out completes. Keep the
// per-card floral details (meaning-rosette · colourway wash · corner sprigs · dividers) — the
// reset changes the GROUND and the CONTRAST, never the botanical identity (§0.5).
export const C = {
  ground:   "#F5F4F1",   // alabaster page — calm, restful; retires cream #ECE7DA
  surface:  "#FFFFFF",   // cards lift off the ground with real contrast; retires paperHi #F4EFE3
  sunk:     "#FAF9F6",   // insets
  hair:     "#EAE7E0",   // the single hairline; retires paperDeep #D8CFBC
  goldHair: "#D9C79B",   // fine gold rules (eyebrow rule, state dots)
  ink:      "#191510",   // primary text — near-black, whisper-warm
  slate:    "#6E6A61",   // secondary text (neutral, not brown); retires muted #2E261B as a text colour
  faint:    "#A6A197",   // labels / meta / footers
  crimson:  "#BC2E27",   // THE heart — the sole hero accent (unchanged)
  gold:     "#A8893F",   // fine eyebrows + hairline flourishes only (unchanged)
};

// Phase hues, deepened only where needed to pass AA on white (§2.4 semantics unchanged).
export const PHASE_CLEAN = { menstrual: "#BC2E27", follicular: "#5F8A6B", ovulatory: "#B8912E", luteal: "#7E6A8E" };

// The page ground recipe — a soft top light on alabaster, NO paper grain, NO vignette.
export const CLEAN_BG = {
  backgroundColor: C.ground,
  backgroundImage: "radial-gradient(120% 70% at 30% -10%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 50%)",
  backgroundRepeat: "no-repeat",
};

// One clean, neutral lift for a card (no warm double-glow).
export const CLEAN_SHADOW = "0 1px 3px rgba(25,21,16,0.03), 0 18px 42px -18px rgba(25,21,16,0.12)";

// Scoped type override — wrap a migrated surface in `.fw-clean` and render <style>{CLEAN_CSS}</style>
// once. Lifts the global letterpress text-shadow + 700 headings + 600 body (the "carved" look)
// off that surface only: clean ink headings at 600, body at 500. Nothing app-wide changes.
export const CLEAN_CSS = [
  // type
  `.fw-clean{font-weight:500}`,
  `.fw-clean h1,.fw-clean h2,.fw-clean h3,.fw-clean h4{text-shadow:none;font-weight:600;color:${C.ink}}`,
  `.fw-clean p,.fw-clean li{font-weight:500}.fw-clean strong,.fw-clean b{font-weight:700}`,
  // the shared primitives, carried into the language through their class hooks (inline styles need !important)
  `.fw-clean .fw-card{background:${C.surface}!important;border-top-color:${C.hair}!important;border-right-color:${C.hair}!important;border-bottom-color:${C.hair}!important;border-left-width:3px!important;box-shadow:${CLEAN_SHADOW}!important}`,
  `.fw-clean .fw-card button{border-top-color:${C.hair}!important}`,
  `.fw-clean .fw-ce-press{background:${C.surface}!important;border-color:${C.hair}!important;box-shadow:${CLEAN_SHADOW}!important}`,
  // every cover/expand title in the card language is oxblood — in the clean world it's ink
  `.fw-clean .fw-ce-press div,.fw-clean .fw-ce-press p,.fw-clean .fw-ce-press h3{color:${C.ink}}`,
  `.fw-clean .fw-ce-press [style*="rgb(122, 26, 18)"]{color:${C.ink}!important}`,
  `.fw-clean .fw-quick-row>button{background:${C.surface}!important;border-top-color:${C.hair}!important;border-right-color:${C.hair}!important;border-bottom-color:${C.hair}!important;box-shadow:none!important}`,
  `.fw-clean .fw-topchrome{background:${C.surface}!important;border-color:${C.hair}!important;color:${C.ink}!important;box-shadow:0 2px 12px rgba(25,21,16,.10)!important}`,
  `.fw-clean .fw-corner{opacity:.55}`,
].join("");

// Page-level (outside the shell tree): the Layout footer + body ground. Added/removed on the body.
export const CLEAN_PAGE_CSS = `html:has(body.fw-clean-page){background:${C.ground}!important}body.fw-clean-page{background:${C.ground}!important}` +
  // the app-wide paper grain lives on #main-content > div (index.css) — the clean page drops it
  `body.fw-clean-page #main-content > div{background-image:none!important;background-color:${C.ground}!important}` + `body.fw-clean-page footer[role="contentinfo"]{color:${C.slate}!important}body.fw-clean-page footer[role="contentinfo"] a,body.fw-clean-page footer[role="contentinfo"] span{color:${C.faint}!important}`;
