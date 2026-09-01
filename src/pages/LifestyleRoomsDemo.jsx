// Lifestyle · B · THE ROOMS — redesign direction. IA: whole-life-DOMAIN-first. The 11 rooms ARE the
// spine (a rich room gallery + a room-of-the-moment). The content boards are preserved below as a
// SECTION DECK — the two-level reveal-in-place interaction: tap a section → its focused cards open in
// place → tap a card → the exact item. Nothing deleted. RETAINS the FwFloraHero header.
import React, { useState } from "react";
import { Feather, Moon, Bookmark, Sparkles, DoorOpen, ChevronRight, LayoutGrid } from "lucide-react";
import { CardFrame, clampLines } from "@/components/brand/flora";
import { AA, SERIF, UI } from "@/components/lifestyle-demos/kit";
import {
  OX, accentText, cwOf, PAPER_TEX, SHELVES, ROOMS, forYouDeck,
  Page, DemoRibbon, FloraHeader, PhaseChip,
  SectionHead, Shelf, SectionDeck, SeeAllOverlay, RoomReader, ItemReader, ClosingLine,
} from "@/components/lifestyle-demos/shelfkit";

// bespoke — B's signature rich room card: sprig + grain, icon, name, sub, the "fresh today" line + a
// live dot, and a "step in" affordance. Greyscale-first; the section's one accent is crimson.
function RoomCard({ room }) {
  return (
    <span style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", background: AA.paperHi, border: `1px solid ${AA.line}`, borderRadius: 16, padding: 14, minHeight: 138, boxShadow: "0 2px 10px rgba(58,44,26,.06)" }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "150px", mixBlendMode: "multiply", opacity: 0.35, pointerEvents: "none" }} />
      <CardFrame color={cwOf("gold").petal} opacity={0.26} size={30} />
      <span style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, background: `${AA.label}14`, display: "grid", placeItems: "center", marginBottom: 9 }}><room.Icon size={19} color={AA.muted} /></span>
        <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: AA.ink, lineHeight: 1.1 }}>{room.label}</span>
        <span style={{ fontFamily: UI, fontSize: 11.5, color: AA.muted, lineHeight: 1.3, marginTop: 2 }}>{room.sub}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: cwOf("sage").petal, flexShrink: 0 }} />
          <span style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: AA.inkSoft, lineHeight: 1.3, ...clampLines(2) }}>{room.fresh}</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: "auto", fontFamily: UI, fontSize: 12.5, fontWeight: 800, color: AA.label }}>Step in <ChevronRight size={14} /></span>
      </span>
    </span>
  );
}

export default function LifestyleRoomsDemo() {
  const [open, setOpen] = useState(null);
  const [seeAll, setSeeAll] = useState(null);
  const [room, setRoom] = useState(null);
  const featured = ROOMS[0];
  const rest = ROOMS.slice(1);
  const forYou = forYouDeck().slice(0, 4);

  return (
    <Page>
      <DemoRibbon label="Lifestyle redesign · B · The Rooms" />
      <FloraHeader colorway="crimson" />
      <PhaseChip />

      {/* ══ THE SPINE · the whole-life rooms ══ */}
      <div style={{ marginTop: 6 }}>
        <SectionHead title="Where would you like to be?" sub="Eleven corners of your life — step into any one" accent="crimson" Icon={DoorOpen} size={26} />

        <button onClick={() => setRoom(featured)} className="fw-ce-press" style={{ position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer", display: "block", background: `linear-gradient(160deg, ${AA.paperHi} 0%, ${AA.crimsonBig}0f 100%)`, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${AA.crimsonBig}`, borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 6px 22px rgba(58,44,26,.10)" }}>
          <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "180px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
          <CardFrame color={cwOf("crimson").petal} opacity={0.42} size={40} />
          <span style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 13 }}>
            <span style={{ width: 50, height: 50, borderRadius: 14, background: `${AA.crimsonBig}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><featured.Icon size={25} color={AA.crimson} /></span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", color: AA.crimson }}>Room of the moment</span>
              <span style={{ display: "block", fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: AA.ink, lineHeight: 1.1, margin: "2px 0 3px" }}>{featured.label}</span>
              <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: AA.inkSoft, lineHeight: 1.45, ...clampLines(2) }}>{featured.body[0]}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 11, fontFamily: UI, fontSize: 13, fontWeight: 800, color: AA.crimson }}>Step into {featured.label} <ChevronRight size={15} /></span>
            </span>
          </span>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {rest.map((r) => (
            <button key={r.key} onClick={() => setRoom(r)} className="fw-ce-press" style={{ display: "block", textAlign: "left", cursor: "pointer", padding: 0, border: "none", background: "transparent" }}>
              <RoomCard room={r} />
            </button>
          ))}
        </div>
      </div>

      {/* ══ FOR YOU TODAY · a cross-room teaser strip (preserved) ══ */}
      <div style={{ marginTop: 48 }}>
        <SectionHead title="For you today" sub="A few picks from across your rooms" accent="gold" Icon={Sparkles} count={9} onSeeAll={() => setSeeAll({ title: "For you today", cw: "gold", items: SHELVES.flatMap((s) => s.items).slice(0, 9) })} />
        <Shelf items={forYou} accent="gold" onOpen={setOpen} />
      </div>

      {/* ══ OR BROWSE BY KIND · the 6 boards as the reveal-in-place SECTION DECK (preserved) ══ */}
      <div style={{ marginTop: 48 }}>
        <SectionHead title="Or browse by kind" sub="Tap a section — its cards open right here" accent="plum" Icon={LayoutGrid} />
        <SectionDeck shelves={SHELVES} onOpen={setOpen} onSeeAll={setSeeAll} />
      </div>

      {/* ══ HANDY + CLOSING ══ */}
      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OX, margin: "0 0 10px" }}>Handy right now</div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {[["Today's chapter", Feather, "crimson", () => setOpen(SHELVES[0].items[0])], ["Your sky tonight", Moon, "gold", () => setOpen(SHELVES[3].items[1])], ["Your saved", Bookmark, "plum", () => setOpen(SHELVES[5].items[0])]].map(([label, Ic, cw, on]) => (
            <button key={label} onClick={on} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "10px 14px", background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `3px solid ${cwOf(cw).petal}`, borderRadius: 12, fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: AA.ink, cursor: "pointer" }}><Ic size={15} color={accentText(cw)} /> {label}</button>
          ))}
        </div>
      </div>
      <ClosingLine>Your whole life has a door — step into any room, or browse by kind. Nothing's owed, and it's all one tap away.</ClosingLine>

      {open && <ItemReader item={open} onClose={() => setOpen(null)} />}
      {seeAll && <SeeAllOverlay shelf={seeAll} onClose={() => setSeeAll(null)} onOpen={(it) => { setSeeAll(null); setOpen(it); }} />}
      {room && <RoomReader room={room} onClose={() => setRoom(null)} />}
    </Page>
  );
}
