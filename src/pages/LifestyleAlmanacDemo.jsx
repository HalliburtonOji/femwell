// Lifestyle · C · THE ALMANAC (editorial magazine) — redesign direction. IA: content-BOARD-first.
// Lede → For-you → 11 rooms as a bento → the 6 boards as a SECTION DECK (the two-level reveal-in-place
// interaction: tap a section → its focused cards open in place → tap a card → the exact item).
// RETAINS the real FwFloraHero header. Craft + primitives shared via ./shelfkit.
import React, { useState } from "react";
import { Feather, Moon, Sparkles, Bookmark, Grid2x2, LayoutGrid } from "lucide-react";
import { AA, SERIF, UI } from "@/components/lifestyle-demos/kit";
import {
  OX, accentText, cwOf, SHELVES, forYouDeck, ledeItem,
  Page, DemoRibbon, FloraHeader, PhaseChip, LedeCard, StackCard,
  SectionHead, SectionDeck, SeeAllOverlay, RoomReader, RoomsBento, ItemReader, ClosingLine,
} from "@/components/lifestyle-demos/shelfkit";

export default function LifestyleAlmanacDemo() {
  const [open, setOpen] = useState(null);     // reader item
  const [seeAll, setSeeAll] = useState(null); // shelf grid overlay
  const [room, setRoom] = useState(null);     // room reader
  const lede = ledeItem();
  const forYou = forYouDeck().slice(1, 5); // skip [0] — it's today's chapter, already the lede

  return (
    <Page>
      <DemoRibbon label="Lifestyle redesign · C · The Almanac" current="C" />

      {/* ══ HEADER (RETAINED — the real FwFloraHero, untouched) ══ */}
      <FloraHeader colorway="crimson" />
      <PhaseChip />

      {/* ══ BAND 1 · THE LEDE — one big editorial pick ══ */}
      <LedeCard onOpen={setOpen} />

      {/* ══ BAND 2 · FOR YOU TODAY — a short focused set ══ */}
      <div style={{ marginTop: 48 }}>
        <SectionHead title="For you today" sub="Gathered for your follicular week" accent="gold" Icon={Sparkles} count={9} onSeeAll={() => setSeeAll({ title: "For you today", cw: "gold", items: SHELVES.flatMap((s) => s.items).slice(0, 9) })} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {forYou.map((it) => <StackCard key={it.id} item={it} accent="gold" onOpen={setOpen} />)}
        </div>
      </div>

      {/* ══ BAND 3 · YOUR ROOMS — the 11 domains as a bento ══ */}
      <div style={{ marginTop: 48 }}>
        <SectionHead title="Your rooms" sub="Eleven corners of your life — tap to step in" accent="crimson" Icon={Grid2x2} />
        <RoomsBento onOpen={setRoom} />
      </div>

      {/* ══ BAND 4 · THE CONTENT — the SECTION DECK (tap a section → its cards open in place) ══ */}
      <div style={{ marginTop: 48 }}>
        <SectionHead title="Browse everything" sub="Tap a section — its cards open right here" accent="plum" Icon={LayoutGrid} />
        <SectionDeck shelves={SHELVES} onOpen={setOpen} onSeeAll={setSeeAll} />
      </div>

      {/* ══ BAND 5 · HANDY (slim) + CLOSING ══ */}
      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OX, margin: "0 0 10px" }}>Handy right now</div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {[["Today's chapter", Feather, "crimson", () => setOpen(lede)], ["Your sky tonight", Moon, "gold", () => setOpen(SHELVES[3].items[1])], ["Your saved", Bookmark, "plum", () => setOpen(SHELVES[5].items[0])]].map(([label, Ic, cw, on]) => (
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
