// Lifestyle · C · THE ALMANAC (editorial magazine) — redesign direction, the calibration bar-setter.
// THESIS: preserve EVERY feature, relocate behind labelled doors, never delete — cut overwhelm through
// hierarchy + grouping + progressive disclosure, and make it genuinely beautiful (editorial register).
// IA: content-BOARD-first. Lede → For-you → 11 rooms as a bento → the 6 boards as named See-all
// shelves. RETAINS the real FwFloraHero header. Craft + primitives shared via ./shelfkit.
import React, { useState, useRef } from "react";
import { Feather, Moon, Sparkles, Bookmark, Grid2x2, Compass } from "lucide-react";
import { AA, SERIF, UI } from "@/components/lifestyle-demos/kit";
import {
  OX, accentText, cwOf, SHELVES, HERO, forYouDeck, ledeItem,
  Page, DemoRibbon, FloraHeader, ControllerChips, PhaseChip, LedeCard,
  SectionHead, Shelf, SeeAllOverlay, RoomReader, RoomsBento, ItemReader, ClosingLine,
} from "@/components/lifestyle-demos/shelfkit";

export default function LifestyleAlmanacDemo() {
  const [heroI, setHeroI] = useState(0);
  const [open, setOpen] = useState(null);     // reader item
  const [seeAll, setSeeAll] = useState(null); // shelf grid overlay
  const [room, setRoom] = useState(null);     // room reader
  const refs = useRef({});
  const active = HERO[heroI];
  const lede = ledeItem();
  const forYou = forYouDeck().slice(0, 4);
  const jump = (key) => { const i = HERO.findIndex((h) => h.key === key); if (i >= 0) setHeroI(i); const el = refs.current[key]; if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <Page>
      <DemoRibbon label="Lifestyle redesign · C · The Almanac" />

      {/* ══ HEADER (RETAINED — the real FwFloraHero, untouched); colourway follows the active chip ══ */}
      <FloraHeader colorway={active.cw} />
      <ControllerChips activeKey={active.key} onJump={jump} />
      <PhaseChip />

      {/* ══ BAND 1 · THE LEDE — one big editorial pick ══ */}
      <LedeCard onOpen={setOpen} />

      {/* ══ BAND 2 · FOR YOU TODAY — short capped strip + See all ══ */}
      <div style={{ marginTop: 44 }}>
        <SectionHead title="For you today" sub="Gathered for your follicular week" accent="gold" Icon={Sparkles} count={9} onSeeAll={() => setSeeAll({ title: "For you today", cw: "gold", items: SHELVES.flatMap((s) => s.items).slice(0, 9) })} />
        <Shelf items={forYou} accent="gold" onOpen={setOpen} />
      </div>

      {/* ══ BAND 3 · YOUR ROOMS — the 11 domains as a bento (findability fix) ══ */}
      <div style={{ marginTop: 44 }}>
        <SectionHead title="Your rooms" sub="Eleven corners of your life — tap to step in" accent="crimson" Icon={Grid2x2} />
        <RoomsBento onOpen={setRoom} />
      </div>

      {/* ══ BAND 4 · THE CONTENT — named, capped, See-all shelves ══ */}
      {SHELVES.map((s) => (
        <section key={s.key} ref={(el) => (refs.current[s.key] = el)} style={{ marginTop: 44, scrollMarginTop: 12 }}>
          <SectionHead title={s.title} sub={s.sub} accent={s.cw} Icon={s.Icon} count={s.items.length} onSeeAll={() => setSeeAll(s)} />
          <Shelf items={s.items} accent={s.cw} onOpen={setOpen} />
        </section>
      ))}

      {/* ══ BAND 5 · HANDY (slim) + CLOSING ══ */}
      <div style={{ marginTop: 44 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OX, margin: "0 0 10px" }}>Handy right now</div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {[["Today's chapter", Feather, "crimson", () => setOpen(lede)], ["Your sky tonight", Moon, "gold", () => setOpen(SHELVES[3].items[1])], ["Your saved", Bookmark, "plum", () => jump("yours")], ["Jump to…", Compass, "sage", () => jump("read")]].map(([label, Ic, cw, on]) => (
            <button key={label} onClick={on} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "10px 14px", background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `3px solid ${cwOf(cw).petal}`, borderRadius: 12, fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: AA.ink, cursor: "pointer" }}><Ic size={15} color={accentText(cw)} /> {label}</button>
          ))}
        </div>
      </div>
      <ClosingLine>Everything's here — read a little, feel a little — and nothing's owed. A whole life, one calm page.</ClosingLine>

      {open && <ItemReader item={open} onClose={() => setOpen(null)} />}
      {seeAll && <SeeAllOverlay shelf={seeAll} onClose={() => setSeeAll(null)} onOpen={(it) => { setSeeAll(null); setOpen(it); }} />}
      {room && <RoomReader room={room} onClose={() => setRoom(null)} />}
    </Page>
  );
}
