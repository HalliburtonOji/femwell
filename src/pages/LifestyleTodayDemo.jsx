// Lifestyle · A · TODAY, FIRST — redesign direction. IA: a single calm "here's your today" moment at
// the top (the lede + a few phase-tuned picks in a focused single column), THEN everything else —
// the 11 rooms, the 6 content boards, for-you, readers — preserved but DEMOTED below a clear
// "the rest of your life, when you want it" divider (progressive disclosure done right: nothing is
// deleted, it is just calmly out of the way until asked for). RETAINS the FwFloraHero header.
import React, { useState } from "react";
import { Feather, Moon, Bookmark, Compass, Sun, DoorOpen, ChevronDown, LayoutGrid } from "lucide-react";
import { AA, SERIF, UI } from "@/components/lifestyle-demos/kit";
import {
  OX, accentText, cwOf, SHELVES, forYouDeck,
  Page, DemoRibbon, FloraHeader, PhaseChip, LedeCard, StackCard,
  SectionHead, SectionDeck, SeeAllOverlay, RoomReader, RoomsBento, ItemReader, ClosingLine,
} from "@/components/lifestyle-demos/shelfkit";

// a quiet section divider — the hinge between "today" and "everything else".
function Divider({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "48px 0 16px" }}>
      <span style={{ flex: 1, height: 1, background: AA.line }} />
      <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: AA.label, whiteSpace: "nowrap" }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: AA.line }} />
    </div>
  );
}

export default function LifestyleTodayDemo() {
  const [open, setOpen] = useState(null);
  const [seeAll, setSeeAll] = useState(null);
  const [room, setRoom] = useState(null);
  const [expanded, setExpanded] = useState(false); // the "rest of your life" reveal
  const todayPicks = [SHELVES[1].items[0], SHELVES[4].items[0], SHELVES[0].items[2]]; // a listen · a small joy · a read (lede already IS today's chapter)
  const forYou = forYouDeck().slice(1, 5); // skip [0] — today's chapter, already the lede

  return (
    <Page>
      <DemoRibbon label="Lifestyle redesign · A · Today, first" current="A" />
      <FloraHeader colorway="crimson" />
      <PhaseChip />

      {/* ══ TODAY — the calm focused moment (single column, phase-tuned) ══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px" }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: `${cwOf("gold").petal}1f`, display: "grid", placeItems: "center" }}><Sun size={15} color={AA.label} /></span>
        <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: AA.ink, lineHeight: 1.1, margin: 0, letterSpacing: -0.3 }}>Today, first</h2>
      </div>
      <LedeCard onOpen={setOpen} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {todayPicks.map((it, i) => <StackCard key={it.id} item={it} accent={["sage", "gold", "plum"][i]} onOpen={setOpen} />)}
      </div>

      {/* ══ THE HINGE — everything else is here, just out of the way ══ */}
      <Divider>That's today · the rest is here when you want it</Divider>

      {!expanded && (
        <button onClick={() => setExpanded(true)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 52, background: AA.paperHi, border: `1px solid ${AA.line}`, borderRadius: 14, cursor: "pointer", fontFamily: UI, fontSize: 14.5, fontWeight: 700, color: AA.ink, boxShadow: "0 1px 3px rgba(58,44,26,.06)" }}>
          <DoorOpen size={17} color={AA.label} /> Open the rest of your life <ChevronDown size={16} />
        </button>
      )}

      {expanded && (
        <>
          {/* the 11 rooms (compact bento — demoted, not deleted) */}
          <div style={{ marginTop: 4 }}>
            <SectionHead title="Your rooms" sub="Eleven corners of your life — tap to step in" accent="crimson" Icon={DoorOpen} />
            <RoomsBento onOpen={setRoom} />
          </div>

          {/* for-you — a few more picks, as a focused set */}
          <div style={{ marginTop: 48 }}>
            <SectionHead title="For you today" sub="A few more, from across your life" accent="gold" Icon={Compass} count={9} onSeeAll={() => setSeeAll({ title: "For you today", cw: "gold", items: SHELVES.flatMap((s) => s.items).slice(0, 9) })} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {forYou.map((it) => <StackCard key={it.id} item={it} accent="gold" onOpen={setOpen} />)}
            </div>
          </div>

          {/* the 6 content boards as the reveal-in-place SECTION DECK (preserved) */}
          <div style={{ marginTop: 48 }}>
            <SectionHead title="Browse by kind" sub="Tap a section — its cards open right here" accent="plum" Icon={LayoutGrid} />
            <SectionDeck shelves={SHELVES} onOpen={setOpen} onSeeAll={setSeeAll} />
          </div>
        </>
      )}

      {/* ══ HANDY + CLOSING ══ */}
      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OX, margin: "0 0 10px" }}>Handy right now</div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {[["Today's chapter", Feather, "crimson", () => setOpen(SHELVES[0].items[0])], ["Your sky tonight", Moon, "gold", () => setOpen(SHELVES[3].items[1])], ["Your saved", Bookmark, "plum", () => setOpen(SHELVES[5].items[0])], ["Open everything", DoorOpen, "sage", () => setExpanded(true)]].map(([label, Ic, cw, on]) => (
            <button key={label} onClick={on} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "10px 14px", background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `3px solid ${cwOf(cw).petal}`, borderRadius: 12, fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: AA.ink, cursor: "pointer" }}><Ic size={15} color={accentText(cw)} /> {label}</button>
          ))}
        </div>
      </div>
      <ClosingLine>Today comes first — small and calm. Everything else is one tap away, never in your face, and nothing's owed.</ClosingLine>

      {open && <ItemReader item={open} onClose={() => setOpen(null)} />}
      {seeAll && <SeeAllOverlay shelf={seeAll} onClose={() => setSeeAll(null)} onOpen={(it) => { setSeeAll(null); setOpen(it); }} />}
      {room && <RoomReader room={room} onClose={() => setRoom(null)} />}
    </Page>
  );
}
