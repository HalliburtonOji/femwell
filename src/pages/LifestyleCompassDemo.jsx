// Lifestyle · D · THE COMPASS — redesign direction. IA: human-INTENT-first wayfinding. The page opens
// with "what do you feel like?" and six intents (read · watch · listen · move · connect · treat) act
// as a compass — tap one and the picks for that mood surface. Everything else (the 11 rooms, the 6
// content boards, for-you, readers) is preserved below under "or explore it all", so nothing is
// deleted — the page just routes by what you WANT instead of by content-kind or room. Retains the
// FwFloraHero header. Craft + primitives shared via ./shelfkit.
import React, { useState } from "react";
import { BookOpen, Play, Headphones, Dumbbell, MessagesSquare, Sparkles, Feather, Moon, Bookmark, Compass, LayoutGrid, DoorOpen, ChevronRight } from "lucide-react";
import { AA, SERIF, UI } from "@/components/lifestyle-demos/kit";
import {
  OX, accentText, cwOf, SHELVES, ROOMS, forYouDeck,
  Page, DemoRibbon, FloraHeader, PhaseChip, StackCard, SectionDeck,
  SectionHead, Shelf, SeeAllOverlay, RoomReader, RoomsBento, ItemReader, ClosingLine,
} from "@/components/lifestyle-demos/shelfkit";

// the six human intents — the compass. picks resolve to SHELVES[i].items[j]; one owns a room door.
const COMPASS = [
  { key: "read", label: "Read something", sub: "a chapter, a guide, your shelf", Icon: BookOpen, cw: "plum", picks: [[0, 0], [0, 2], [0, 3], [2, 0]] },
  { key: "watch", label: "Watch something", sub: "short, gentle, in place", Icon: Play, cw: "sage", picks: [[1, 1], [1, 2], [1, 4]] },
  { key: "listen", label: "Have a listen", sub: "for the kettle or the commute", Icon: Headphones, cw: "gold", picks: [[1, 0], [1, 3]] },
  { key: "move", label: "Move a little", sub: "five minutes, for your mood", Icon: Dumbbell, cw: "sage", picks: [[4, 0], [1, 1]] },
  { key: "connect", label: "Feel less alone", sub: "the rooms, anonymously", Icon: MessagesSquare, cw: "crimson", picks: [[0, 2], [3, 0]], room: "kindred" },
  { key: "treat", label: "Treat myself", sub: "make · money · the sky", Icon: Sparkles, cw: "gold", picks: [[4, 1], [4, 3], [3, 1]] },
];
const resolve = (picks) => picks.map(([i, j]) => SHELVES[i].items[j]);

export default function LifestyleCompassDemo() {
  const [open, setOpen] = useState(null);
  const [seeAll, setSeeAll] = useState(null);
  const [room, setRoom] = useState(null);
  const [sel, setSel] = useState(null); // selected intent key
  const active = COMPASS.find((c) => c.key === sel);
  const forYou = forYouDeck().slice(0, 4);

  return (
    <Page>
      <DemoRibbon label="Lifestyle redesign · D · The Compass" />
      <FloraHeader colorway={active ? active.cw : "crimson"} />
      <PhaseChip />

      {/* ══ THE COMPASS · what do you feel like? ══ */}
      <div style={{ marginTop: 6 }}>
        <SectionHead title="What do you feel like?" sub="Tap a direction — the rest waits quietly below" accent="crimson" Icon={Compass} size={26} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {COMPASS.map((c) => {
            const on = c.key === sel; const petal = cwOf(c.cw).petal; const at = accentText(c.cw);
            return (
              <button key={c.key} onClick={() => setSel(on ? null : c.key)} aria-pressed={on} className="fw-ce-press" style={{ textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, padding: 14, minHeight: 104, borderRadius: 15, background: on ? `linear-gradient(160deg, ${AA.paperHi} 0%, ${petal}18 100%)` : AA.paperHi, border: `1px solid ${on ? petal : AA.line}`, boxShadow: on ? `0 0 0 1px ${petal}, 0 4px 14px ${petal}33` : "0 1px 3px rgba(58,44,26,.07)", transform: on ? "translateY(-1px)" : "none", transition: "all .15s" }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: on ? `${petal}26` : `${AA.label}14`, display: "grid", placeItems: "center" }}><c.Icon size={20} color={on ? at : AA.muted} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: AA.ink, lineHeight: 1.12 }}>{c.label}</span>
                <span style={{ fontFamily: UI, fontSize: 11.5, color: AA.muted, lineHeight: 1.3 }}>{c.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ THE PICKS · for the chosen intent (or a little of everything by default) ══ */}
      <div style={{ marginTop: 26 }}>
        {active ? (
          <>
            <SectionHead title={active.label} sub="Chosen for that mood, tuned to your week" accent={active.cw} Icon={active.Icon} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {resolve(active.picks).map((it) => <StackCard key={it.id} item={it} accent={active.cw} onOpen={setOpen} />)}
              {active.room && (
                <button onClick={() => setRoom(ROOMS.find((r) => r.key === active.room))} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", minHeight: 48, background: "transparent", border: `1px dashed ${cwOf(active.cw).petal}`, borderRadius: 12, cursor: "pointer", fontFamily: UI, fontSize: 14, fontWeight: 700, color: accentText(active.cw) }}>
                  <DoorOpen size={16} /> Step into the Kindred room <ChevronRight size={15} />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <SectionHead title="A little of everything" sub="Or pick a direction above" accent="gold" Icon={Sparkles} count={9} onSeeAll={() => setSeeAll({ title: "A little of everything", cw: "gold", items: SHELVES.flatMap((s) => s.items).slice(0, 9) })} />
            <Shelf items={forYou} accent="gold" onOpen={setOpen} />
          </>
        )}
      </div>

      {/* ══ OR EXPLORE IT ALL · rooms + boards preserved ══ */}
      <div style={{ marginTop: 44 }}>
        <SectionHead title="Or explore it all" sub="Your rooms and every board — still all here" accent="crimson" Icon={DoorOpen} />
        <RoomsBento onOpen={setRoom} />
      </div>
      <div style={{ marginTop: 44 }}>
        <SectionHead title="Browse by kind" sub="Tap a section — its cards open right here" accent="plum" Icon={LayoutGrid} />
        <SectionDeck shelves={SHELVES} onOpen={setOpen} onSeeAll={setSeeAll} />
      </div>

      {/* ══ HANDY + CLOSING ══ */}
      <div style={{ marginTop: 44 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OX, margin: "0 0 10px" }}>Handy right now</div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {[["Today's chapter", Feather, "crimson", () => setOpen(SHELVES[0].items[0])], ["Your sky tonight", Moon, "gold", () => setOpen(SHELVES[3].items[1])], ["Your saved", Bookmark, "plum", () => setOpen(SHELVES[5].items[0])]].map(([label, Ic, cw, on]) => (
            <button key={label} onClick={on} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "10px 14px", background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `3px solid ${cwOf(cw).petal}`, borderRadius: 12, fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: AA.ink, cursor: "pointer" }}><Ic size={15} color={accentText(cw)} /> {label}</button>
          ))}
        </div>
      </div>
      <ClosingLine>Start from how you feel — the compass points the way. And when you'd rather wander, everything's still here.</ClosingLine>

      {open && <ItemReader item={open} onClose={() => setOpen(null)} />}
      {seeAll && <SeeAllOverlay shelf={seeAll} onClose={() => setSeeAll(null)} onOpen={(it) => { setSeeAll(null); setOpen(it); }} />}
      {room && <RoomReader room={room} onClose={() => setRoom(null)} />}
    </Page>
  );
}
