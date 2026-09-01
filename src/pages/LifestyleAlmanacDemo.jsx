// Lifestyle · C · THE ALMANAC (editorial magazine) — redesign direction. IA: content-BOARD-first.
// Lede → For-you → 11 rooms as a bento → the 6 boards as a SECTION DECK (the two-level reveal-in-place
// interaction: tap a section → its focused cards open in place → tap a card → the exact item).
// RETAINS the real FwFloraHero header. Craft + primitives shared via ./shelfkit.
import React, { useState } from "react";
import { Feather, Moon, Sparkles, Bookmark, Grid2x2, LayoutGrid } from "lucide-react";
import { AA, SERIF, UI } from "@/components/lifestyle-demos/kit";
import {
  OX, accentText, cwOf, SHELVES, forYouDeck, ledeItem,
  Page, DemoRibbon, FloraHeader, PhaseChip, LedeCard,
  SectionHead, SectionDeck, SeeAllOverlay, RoomReader, RoomsBento, ItemReader, ClosingLine,
} from "@/components/lifestyle-demos/shelfkit";

export default function LifestyleAlmanacDemo() {
  const [open, setOpen] = useState(null);     // reader item
  const [seeAll, setSeeAll] = useState(null); // shelf grid overlay
  const [room, setRoom] = useState(null);     // room reader
  const lede = ledeItem();
  const forYou = forYouDeck().slice(0, 4);

  return (
    <Page>
      <DemoRibbon label="Lifestyle redesign · C · The Almanac" />

      {/* ══ HEADER (RETAINED — the real FwFloraHero, untouched) ══ */}
      <FloraHeader colorway="crimson" />
      <PhaseChip />

      {/* ══ BAND 1 · THE LEDE — one big editorial pick ══ */}
      <LedeCard onOpen={setOpen} />

      {/* ══ BAND 2 · FOR YOU TODAY — a short focused set ══ */}
      <div style={{ marginTop: 44 }}>
        <SectionHead title="For you today" sub="Gathered for your follicular week" accent="gold" Icon={Sparkles} count={9} onSeeAll={() => setSeeAll({ title: "For you today", cw: "gold", items: SHELVES.flatMap((s) => s.items).slice(0, 9) })} />
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {forYou.map((it, i) => <LedeMini key={it.id} item={it} accent={["sage", "gold", "plum", "crimson"][i % 4]} onOpen={setOpen} />)}
        </div>
      </div>

      {/* ══ BAND 3 · YOUR ROOMS — the 11 domains as a bento ══ */}
      <div style={{ marginTop: 44 }}>
        <SectionHead title="Your rooms" sub="Eleven corners of your life — tap to step in" accent="crimson" Icon={Grid2x2} />
        <RoomsBento onOpen={setRoom} />
      </div>

      {/* ══ BAND 4 · THE CONTENT — the SECTION DECK (tap a section → its cards open in place) ══ */}
      <div style={{ marginTop: 44 }}>
        <SectionHead title="Browse everything" sub="Tap a section — its cards open right here" accent="plum" Icon={LayoutGrid} />
        <SectionDeck shelves={SHELVES} onOpen={setOpen} onSeeAll={setSeeAll} />
      </div>

      {/* ══ BAND 5 · HANDY (slim) + CLOSING ══ */}
      <div style={{ marginTop: 44 }}>
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

// a slim horizontal "for you" card (editorial register — a focused vertical set, no peek-scroller)
function LedeMini({ item, accent, onOpen }) {
  const at = accentText(accent); const petal = cwOf(accent).petal;
  return (
    <button onClick={() => onOpen(item)} className="fw-ce-press" style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left", cursor: "pointer", background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${petal}`, borderRadius: 14, padding: "13px 15px" }}>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: at }}>{item.kicker}</span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: AA.ink, lineHeight: 1.2, marginTop: 2 }}>{item.hook}</span>
      </span>
      <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 800, color: at, whiteSpace: "nowrap" }}>{item.act} ›</span>
    </button>
  );
}
