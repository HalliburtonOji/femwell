// GardenClipboardDemo — a DEMO redesign of /Garden (NurtureGarden) to the v4 Brand Bible.
// Demo-first, for Halli's approval; NOT live. Reachable from the IDEAS pill (FoundersOS → Current).
//
// WHAT IT DOES (additive — strips NOTHING):
//   • Adds the canonical SIGNATURE TOP (§6.8): FwFloraHero + ONE SummaryCard.
//   • Leans into the FULL LIVING ECOSYSTEM (the Garden is the flora showcase) as a §6.10
//     Clipboard Stack Slider — three peer boards:
//       1. THIS SEASON  — the §10.1 flora LIFECYCLE (bud → bloom → seed → rest), the stage IS
//          the meaning; tap a stage to reveal it.
//       2. YOUR SPECIES — a bouquet drawn from the 64-species library (floraLibrary.jsx),
//          deep-linking the full Flora Lab.
//       3. THE ALMANAC  — the §10.2 omen layer (⏳ PROPOSED, clearly marked "for approval"):
//          a creature + a "they say…" folk line earthed by the kettle-rule wink, with a
//          §6.7.6 QUICK-ACTION POPUP ("press to your journal" — done in place, then it ticks).
//   • PRESERVES everything the live Garden already does by rendering the REAL components
//     verbatim below: <NurtureGarden/> (companion · what's-feeding-it · leave-a-line · make-it-
//     yours · share · accumulating chapters · rare blooms · garden-of-gardens) + <GardenGrowth/>.
//
// Brand: PAPER_BG, Ephesis/Cormorant, brand tokens, Lucide/SVG, no emoji, reduced-motion-safe.
// Reuses brand/PageTop, brand/Card, brand/ClipboardSlider, brand/flora, brand/floraLibrary —
// nothing hand-rolled. Does NOT touch flora.jsx / BRAND_IDENTITY.md.

import { useState } from "react";
import { Sparkles, Sprout, Feather, Leaf, BookOpen, X } from "lucide-react";
import {
  PAPER_BG, T, SERIF, UI, Eyebrow, Heart, Script, Hand, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { Clipboard, ClipboardSlider } from "@/components/brand/ClipboardSlider";
import { FlowerGlyph, Pollinator } from "@/components/brand/flora";
import { LifecycleStage, SpeciesBloom } from "@/components/brand/floraLibrary";
import NurtureGarden from "@/components/nurture/NurtureGarden";
import { GardenGrowth } from "@/components/growth/GrowthLive";

// the §10.1 lifecycle — the SAME flower at a different stage says where she is (no chart, no words).
const LIFECYCLE = [
  { stage: "bud",          label: "Bud",   meaning: "Becoming. A new chapter, a goal just set, the follicular rise — furled, full of what's coming." },
  { stage: "bloom",        label: "Bloom", meaning: "Open. Peak and expression — ovulation, a win, a day you felt like yourself. You're here this week." },
  { stage: "seed (hip)",   label: "Seed",  meaning: "Harvest. The rose hip — integrating, finishing, letting a lesson set. The luteal turn inward." },
  { stage: "rest (cane)",  label: "Rest",  meaning: "Restoration — a bud on old wood. Winter, not death: menstruation, postpartum, a chosen pause. Nothing is lost." },
];
const HERE = "bloom";

// the 64-species library, made visible — a bouquet of recognisable species (each reads as itself).
const BOUQUET = ["rose", "sunflower", "hibiscus", "iris", "lily", "peony", "dahlia", "foxglove", "daisy", "lavender"];

function SectionLabel({ children, sub }) {
  return (
    <div style={{ margin: "30px 0 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Heart size={13} />
        <Script size={27} color={T.ink}>{children}</Script>
      </div>
      {sub && <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "4px 0 0", lineHeight: 1.4 }}>{sub}</p>}
    </div>
  );
}

// a quiet "preserved" divider before the real live Garden
function PreservedDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "36px 0 6px" }}>
      <span style={{ flex: 1, height: 1, background: T.paperDeep }} />
      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>
        Everything your Garden already does
      </span>
      <span style={{ flex: 1, height: 1, background: T.paperDeep }} />
    </div>
  );
}

// ── Board 1 — THIS SEASON (the lifecycle; tap a stage to reveal its meaning) ──
function SeasonBoard() {
  const [open, setOpen] = useState(HERE);
  const active = LIFECYCLE.find((l) => l.stage === open) || LIFECYCLE[1];
  return (
    <Clipboard title="This season" sub="The same flower, at the stage you're in" accent={T.crimson} flower="poppy" idx="cb-season">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {LIFECYCLE.map((l) => {
          const on = l.stage === open;
          return (
            <button key={l.stage} onClick={() => setOpen(l.stage)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 2px",
              background: on ? `${T.crimson}12` : "transparent", border: `1px solid ${on ? T.crimson : "transparent"}`,
              borderRadius: 12, cursor: "pointer",
            }}>
              <LifecycleStage name={l.stage} size={56} />
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? T.crimson : T.muted }}>{l.label}</span>
              {l.stage === HERE && <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.crimson }}>· you ·</span>}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.crimson}`, borderRadius: 12, padding: "12px 14px" }}>
        <Eyebrow color={T.crimson} mb={6}>{active.label} {active.stage === HERE ? "· this week" : ""}</Eyebrow>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: 0 }}>{active.meaning}</p>
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, margin: "12px 0 0", lineHeight: 1.5 }}>
        Rest is a stage, not a failure — the garden never draws nothing.
      </p>
    </Clipboard>
  );
}

// ── Board 2 — YOUR SPECIES (the breadth library, made visible) ──
function SpeciesBoard() {
  return (
    <Clipboard title="Your species" sub="64 recognisable flowers — a real garden, not a handful" accent={T.sage} flower="sunflower" idx="cb-species">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {BOUQUET.map((n) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 60 }}>
            <SpeciesBloom name={n} size={58} />
            <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 1, textTransform: "capitalize" }}>{n}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: "14px 0 0" }}>
        A rose reads as a rose; an iris as an iris. Your garden draws its blooms, companions and chapters from the whole library — colour carries meaning, so no two gardens repeat.
      </p>
      <a href="/FloraLabDemo" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
        See the full Flora Lab <BookOpen size={14} />
      </a>
    </Clipboard>
  );
}

// ── Board 3 — THE ALMANAC (⏳ PROPOSED omen layer · for approval) with a §6.7.6 quick-action popup ──
function AlmanacBoard() {
  const [pressed, setPressed] = useState(false);
  const [popup, setPopup] = useState(false);
  const [note, setNote] = useState("");
  const save = () => { setPressed(true); setPopup(false); setNote(""); };
  return (
    <Clipboard title="The almanac" sub="A garden that speaks — proposed, for your sign-off" accent={T.gold} flower="lavender" idx="cb-almanac">
      <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 10px" }}>
        <Pollinator kind="ladybird" size={34} color={T.crimson} animate idx="almanac-bug" />
      </div>
      <Hand size={17} color={T.ink} style={{ display: "block", textAlign: "center", lineHeight: 1.5, padding: "0 6px" }}>
        “A ladybird settled on your fern. They say it's as many happy months as spots — five, if you're counting.”
      </Hand>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, textAlign: "center", margin: "8px 0 0", lineHeight: 1.5 }}>
        Now put the kettle on.
      </p>
      <div style={{ marginTop: 16 }}>
        {pressed ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `${T.sage}14`, border: `1px solid ${T.sage}`, borderRadius: 12, padding: "11px 14px" }}>
            <FlowerGlyph variant="forget-me-not" size={20} color={T.sage} idx="pressed" />
            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.sage }}>Pressed into your journal</span>
          </div>
        ) : (
          <button onClick={() => setPopup(true)} style={{
            width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "12px 16px",
            cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase",
          }}>
            <Feather size={14} /> Press to your journal
          </button>
        )}
      </div>
      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "12px 0 0", lineHeight: 1.5 }}>
        One real omen a day, hope-only, never a promise — the four safety rails hold. Tapping does it in place (the §6.7.6 quick-action popup), then it ticks.
      </p>

      {/* §6.7.6 QUICK-ACTION POPUP — a small bottom-sheet, do it here, then it ticks (demo, local) */}
      {popup && (
        <div onClick={() => setPopup(false)} role="dialog" aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,8,5,0.44)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "100%", maxWidth: 460, background: T.paperHi, borderRadius: "22px 22px 0 0",
            padding: "18px 18px calc(28px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", border: `1px solid ${T.paperDeep}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Eyebrow color={T.crimson}>Press a line into your journal</Eyebrow>
              <button onClick={() => setPopup(false)} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={15} /></button>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} autoFocus rows={3}
              placeholder="What did the ladybird land on, really?"
              style={{ width: "100%", boxSizing: "border-box", marginTop: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", resize: "none" }} />
            <button onClick={save} style={{ width: "100%", marginTop: 12, background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "13px 16px", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
              Press it
            </button>
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 0 0", lineHeight: 1.5 }}>Demo — in the live app this rides an existing journal action; no new function.</p>
          </div>
        </div>
      )}
    </Clipboard>
  );
}

export default function GardenClipboardDemo() {
  useEditorialFonts();
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "26px 20px 50px", position: "relative" }}>

        {/* demo badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, border: `1px solid ${T.gold}`, borderRadius: 999, padding: "4px 12px" }}>
            Garden redesign · demo · for approval
          </span>
        </div>

        {/* 1 — SIGNATURE TOP (§6.8) */}
        <FwFloraHero
          title="Your garden"
          line="A living thing, unique to you — grown from everything you already do, and it never dies."
          bloom="peony" colorway="gold" flankL="iris" flankR="sunflower" creature="butterfly" idx="garden-hero"
        />

        {/* 2 — ONE SUMMARY CARD (§6.8) */}
        <div style={{ marginTop: 18 }}>
          <SummaryCard
            eyebrow="Your garden today"
            accent={T.sage}
            rows={[
              { Icon: Sparkles, label: "This season", text: "You're in bloom — a season of small attentions showing." },
              { Icon: Sprout,   label: "What fed it", text: "Today: your journal and a check-in fed the garden." },
              { Icon: Leaf,     label: "Almanac",     text: "A ladybird on your fern — they say a little luck. Tap to read." },
            ]}
          />
        </div>

        {/* 3 — THE LIVING ECOSYSTEM (the redesign's signature; §6.10 clipboard) */}
        <SectionLabel sub="Slide between your season, your species, and the almanac.">The living ecosystem</SectionLabel>
        <ClipboardSlider hint="Slide through your garden →" accent={T.sage}>
          <SeasonBoard />
          <SpeciesBoard />
          <AlmanacBoard />
        </ClipboardSlider>

        {/* 4 — PRESERVED: the real live Garden, verbatim (companion + Growth) */}
        <PreservedDivider />
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, textAlign: "center", margin: "10px 0 18px", lineHeight: 1.5 }}>
          The redesign sits on top — nothing below is removed. Your companion, what's feeding it, leave-a-line, make-it-yours, share, your kept chapters, rare blooms, the garden-of-gardens, and your goals &amp; missions all stay.
        </p>
        <NurtureGarden />
        <div style={{ marginTop: 8 }}><GardenGrowth /></div>

        <div style={{ marginTop: 40 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}
