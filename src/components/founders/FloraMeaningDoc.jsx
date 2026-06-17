// FloraMeaningDoc — Founders Corner mirror of claude-state/BRAND_FLORA.md.
// Flowers as the brand's backbone of MEANING (floriography + folk-herbalism +
// myth), wired to the app. Editorial cream/ink surface, Lucide/SVG only, no emoji.

import React from "react";

const C = {
  cream: "#F4EFE3", paper: "#ECE7DA", paperHi: "#F8F3E8",
  ink: "#0B0805", muted: "#2E261B", blush: "#E8B4B8", sage: "#8FAF8F",
  gold: "#A8893F", crimson: "#BC2E27", plum: "#8E6E8E", rule: "rgba(43,30,22,0.14)",
};
const SCRIPT = '"Ephesis","Pinyon Script",cursive';
const SERIF = '"Cormorant Garamond","Fraunces",Georgia,serif';
const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';

function Eyebrow({ children }) { return <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: C.gold, margin: "0 0 12px" }}>{children}</div>; }
function H2({ n, children }) { return <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: C.ink, margin: "38px 0 4px", lineHeight: 1.18, paddingBottom: 7, borderBottom: `2px solid ${C.rule}` }}>{n != null && <span style={{ fontFamily: SCRIPT, fontSize: 34, color: C.gold, marginRight: 8 }}>{n}</span>}{children}</h2>; }
function H3({ children }) { return <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: C.ink, margin: "20px 0 4px" }}>{children}</h3>; }
function P({ children, lede }) { return <p style={{ fontFamily: SERIF, fontSize: lede ? 18 : 16.5, color: C.ink, lineHeight: 1.55, margin: "9px 0" }}>{children}</p>; }
function Card({ children, accent = C.gold }) { return <div style={{ background: C.paperHi, border: `1px solid ${C.rule}`, borderLeft: `3px solid ${accent}`, borderRadius: 13, padding: "13px 16px", margin: "12px 0" }}>{children}</div>; }
function Pull({ children }) { return <blockquote style={{ margin: "16px 0", padding: "15px 17px", background: C.cream, borderRadius: 11, borderLeft: `3px solid ${C.blush}`, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: C.ink, lineHeight: 1.5 }}>{children}</blockquote>; }

function Row({ dot, term, meaning }) {
  return (
    <li style={{ display: "flex", gap: 11, alignItems: "baseline", margin: "8px 0", fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.5 }}>
      <span style={{ width: 9, height: 9, borderRadius: 9999, background: dot, flexShrink: 0, transform: "translateY(1px)" }} />
      <span><strong style={{ fontWeight: 600 }}>{term}</strong> — {meaning}</span>
    </li>
  );
}

export default function FloraMeaningDoc() {
  return (
    <div style={{ fontFamily: SERIF }}>
      <Eyebrow>Brand · Flora &amp; Meaning</Eyebrow>
      <h1 style={{ fontFamily: SCRIPT, fontSize: 46, color: C.ink, margin: "0 0 6px", lineHeight: 1.1 }}>The language of flowers</h1>
      <P lede>Flowers aren't decoration here — they're the <em>meaning</em> that connects the app. Every bloom is chosen for what it documents (floriography, folk-herbalism, myth), and means the same thing everywhere it appears: garden, cycle, journal, chapters. Full research + sources: <span style={{ fontFamily: SANS, fontSize: 14 }}>claude-state/BRAND_FLORA.md</span>.</P>

      <H2 n="I">Three timescales</H2>
      <Card accent={C.crimson}><P><strong>The bloom = the day / the cycle.</strong> The phase-coloured bloom — today, this phase.</P></Card>
      <Card accent={C.plum}><P><strong>The butterfly = a moment of change / return.</strong> An <em>earned</em> marker — transformation, a comeback, a milestone. Never ambient.</P></Card>
      <Card accent={C.sage}><P><strong>The tree / orchard = the long arc.</strong> Years, life-stages, community — the garden matures toward a flowering tree; many gardens make an orchard.</P></Card>

      <H2 n="II">Cycle phases → a flower each</H2>
      <P>The ring and the day's bloom take that phase's flower and hue. Over a cycle the bloom literally changes species — the body's season, made visible.</P>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.crimson} term="Menstrual · Poppy" meaning="consolation, restful sleep, letting go (inner winter)" />
        <Row dot={C.sage} term="Follicular · Snowdrop" meaning="hope — the first bloom after winter (inner spring)" />
        <Row dot="#D4AF37" term="Ovulatory · Sunflower" meaning="adoration, radiance; turns to the sun (inner summer)" />
        <Row dot={C.plum} term="Luteal · Dahlia" meaning="inner strength, grace under change (inner autumn)" />
      </ul>

      <H2 n="III">Life stages → a bloom or flowering tree</H2>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.gold} term="Teen" meaning="Daisy — innocence, new beginnings" />
        <Row dot={C.sage} term="Cycling" meaning="the four phase-flowers rotate (§II)" />
        <Row dot={C.blush} term="Pre-TTC / TTC" meaning="Lotus (potential, rising from the mud) + Pomegranate (fertility, the seeds of return)" />
        <Row dot={C.blush} term="Pregnancy" meaning="Almond blossom as a progressing arc — bud → blossom → ripening fruit across trimesters" />
        <Row dot={C.gold} term="Postpartum" meaning="Calendula/Marigold (sun-warmth, real healing) + Daisy (childbirth)" />
        <Row dot={C.plum} term="Perimenopause" meaning="Hellebore, the winter rose (blooms through the change), softened by Lavender (serenity)" />
        <Row dot={C.muted} term="Menopause" meaning="Magnolia — the ancient, dignified tree; a second flowering" />
        <Row dot={C.muted} term="Post-menopause" meaning="the Magnolia/olive in full canopy — the elder arc, wisdom and peace" />
      </ul>

      <H2 n="IV">Emotional / journal states → flowers</H2>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.plum} term="Grief / remembrance" meaning="Forget-me-not + Rosemary + white Lily" />
        <Row dot={C.plum} term="Rest / calm" meaning="Lavender + Poppy + chamomile" />
        <Row dot="#D4AF37" term="Joy" meaning="Sunflower + Daisy" />
        <Row dot={C.sage} term="Courage / growth" meaning="Borage (&ldquo;courage&rdquo;) + Yarrow + Iris" />
        <Row dot={C.crimson} term="Love / connection" meaning="Honeysuckle + Rose" />
        <Row dot={C.sage} term="Hope / fresh start" meaning="Snowdrop + Daffodil + Almond blossom" />
      </ul>

      <H2 n="V">The companion-garden species (meaning, retroactively)</H2>
      <P>The garden's forms stop being arbitrary and become a vocabulary — your companion is a flower that <em>means</em> something:</P>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.blush} term="Peony" meaning="flourishing, compassion, abundance (the lush full bloom = thriving)" />
        <Row dot={C.crimson} term="Foxglove" meaning="the heart-flower — folklore protection, and literally heart-medicine (digitalis)" />
        <Row dot={C.sage} term="Fern" meaning="ancient resilience, shelter, sincerity; the unfurling fiddlehead = new growth" />
        <Row dot={C.gold} term="Daisy" meaning="innocence, beginnings" />
        <Row dot={C.plum} term="Forget-me-not (add)" meaning="memory &amp; true love" />
        <Row dot={C.blush} term="Lotus (add)" meaning="rebirth, potential" />
      </ul>

      <H2 n="VI">Combinations — pairings with intent</H2>
      <P>Pairing two flowers makes a sentence, the way a bouquet does:</P>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.plum} term="Forget-me-not + Rosemary" meaning="remembrance (offered around grief / loss)" />
        <Row dot={C.plum} term="Lavender + Chamomile + Poppy" meaning="rest (luteal, sleep, hard days)" />
        <Row dot={C.sage} term="Snowdrop + Crocus + Daffodil" meaning="a fresh start (follicular, new chapter)" />
        <Row dot={C.blush} term="Lotus + Pomegranate" meaning="fertile potential (TTC)" />
        <Row dot="#D4AF37" term="Sunflower + Daisy" meaning="cheer &amp; friendship (community / joy)" />
        <Row dot={C.gold} term="Marigold + Borage (companion planting)" meaning="&ldquo;we help each other bloom&rdquo; (the garden-of-gardens)" />
      </ul>

      <H2 n="VII">Butterflies &amp; pollinators — earned markers</H2>
      <Pull>Greek <em>psyche</em> means both &ldquo;soul&rdquo; and &ldquo;butterfly.&rdquo; A butterfly is transformation and return — so it <em>visits</em> on a true moment, then drifts off. It is the brand's punctuation, never its wallpaper.</Pull>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.plum} term="Butterfly" meaning="transformation + return — visits when you come back after a rest, complete a chapter, or cross a life-stage (species marks the size of the change)" />
        <Row dot={C.muted} term="Moth (luna)" meaning="transformation through darkness — the menstrual / night / rest surfaces" />
        <Row dot={C.sage} term="Dragonfly" meaning="insight, seeing through — Pulse / patterns" />
        <Row dot="#D4AF37" term="Bee" meaning="community, the sacred feminine — appears where your garden helps others bloom" />
      </ul>

      <H2 n="VIII">Flowering trees — the long arc</H2>
      <P>The accumulating garden chapters grow, over seasons, toward a flowering tree: the companion's garden matures into a cherry/almond tree (the cycle that <em>returns each spring</em>), and across the community many trees become an orchard (the garden-of-gardens). Cherry/almond = the cyclical return; magnolia/olive = the elder canopy.</P>

      <H2 n="IX">How it becomes the backbone</H2>
      <P>Because every surface draws from the <em>same</em> dictionary, a returning user reads the app fluently:</P>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.sage} term="Companion / Garden" meaning="species carry meaning; tending grows the bloom; chapters accrete toward the tree; bees arrive when you help others" />
        <Row dot={C.crimson} term="Cycle" meaning="ring + day-bloom take the phase flower &amp; hue; the moth marks the menstrual dark" />
        <Row dot={C.gold} term="Journal" meaning="entries surface their emotional flower; grief offers the Forget-me-not pairing" />
        <Row dot={C.plum} term="Chapters / milestones" meaning="the butterfly visits on return/completion; life-stage crossings change the governing bloom/tree" />
      </ul>
      <Pull>A sunflower always means peak. A forget-me-not always means memory. A butterfly always means: you changed, and you came back.</Pull>

      <H2 n="X">The variety library — a world, not a logo</H2>
      <P>A large, still-meaningful set so the world feels deep (full list + meanings in BRAND_FLORA §6):</P>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.blush} term="Flowers (extended)" meaning="violet (modesty) · primrose (young love) · camellia (steadfast devotion) · anemone (anticipation) · zinnia (enduring friendship) · marigold (joy, guidance) · freesia (trust) · bluebell (constancy) · cornflower (hope) · heather (quiet resilience)" />
        <Row dot={C.sage} term="Plants" meaning="fern (renewal) · moss (patience) · ivy (loyal connection) · bamboo (strength + flexibility) · succulent (thriving in hardship) · grass (springs back) · clematis (traveller's joy) · the cycle herbs (rosemary, sage, lavender, yarrow, lady's-mantle, mugwort)" />
        <Row dot={C.plum} term="Creatures (earned)" meaning="butterfly (return) · bee (community) · dragonfly (insight) · moth (the dark) · ladybird (luck/healing) · hummingbird (well-being) · firefly (inner light, hope) · snail (patience) · cricket (good cheer)" />
      </ul>

      <H2 n="XI">The flora fingerprint — no two gardens alike</H2>
      <P>A woman's garden is a <em>portrait, not a slot machine</em>. Like a heraldic blazon, it's a small grammar of stable elements combined into a unique, reconstructable identity — <strong>deterministically seeded</strong> from who she is and what she tends (same seed → same garden on every device), then it grows as she does.</P>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.gold} term="Seed" meaning="profile + sign-up season (base palette + signature flower) · life-stage (governing bloom/tree) · cycle phase (active flower) · the life-areas she tends (which plants & companions grow) · what she's earned" />
        <Row dot={C.crimson} term="Rarity (earned, never bought)" meaning="common (base garden) → uncommon (a second species) → rare (a rare bloom / a creature visit on a milestone) → heirloom (the flowering tree, then the orchard)" />
        <Row dot={C.sage} term="Evolves" meaning="stable enough to recognise as hers, alive enough to keep growing — new species as she explores, the bloom shifting with her phase, the tree maturing over years" />
      </ul>
      <P>Because every pick is governed by a rule tied to <em>her</em>, the uniqueness reads as a likeness — a garden that could only be hers. (Why it feels personal not arbitrary: rules + seeds + meaningful constraints, the way Animal Crossing, Sky and heraldry do it — BRAND_FLORA §9.)</P>

      <H2 n="XII">Page character — one identity, different per page</H2>
      <P>Each surface gets a flora <em>signature</em> (a palette lean + a signature species + a creature) drawn from the one dictionary — so the app feels different page to page yet unmistakably FemWell. Character changes the accent + signature only, never the bones (type, tokens, layout).</P>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
        <Row dot={C.gold} term="Journal" meaning="gold + willow/rosemary + a moth — reflection, memory, night-thoughts" />
        <Row dot={C.sage} term="Community" meaning="sage + meadow flowers/clover + a bee — together, pollination" />
        <Row dot={C.blush} term="Nutrition" meaning="warm blush-green + herbs & grasses + a ladybird — the kitchen-garden" />
        <Row dot={C.crimson} term="Cycle / Health" meaning="the phase hue + phase-flower + a dragonfly/moth — the body's season" />
        <Row dot={C.plum} term="Pulse" meaning="plum + a dragonfly — patterns, seeing-through" />
      </ul>

      <div style={{ fontFamily: SANS, fontSize: 13, color: C.muted, margin: "26px 0 8px", lineHeight: 1.6 }}>
        Restraint holds: flowers are chosen for meaning and shown sparingly — one bloom centre-stage, one motif per fold, a butterfly only on a real moment. Craft samples live at <span style={{ fontWeight: 700 }}>/BrandCraftSample</span>; full research + sources in <span style={{ fontWeight: 700 }}>claude-state/BRAND_FLORA.md</span>.
      </div>
    </div>
  );
}
