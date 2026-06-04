// ThreadView — a single thread read as its own small publication (Phase 1b).
//
// Opened from a tappable thread chip (Ledger or the Threads browse strip).
// Shows the thread's name, how many entries it holds, a "write in this
// thread" CTA, and the thread's entries as a ledger. 100% from already-loaded
// entries — no new fetch, no schema field.

import { Feather, ArrowLeft } from "lucide-react";
import { T, UI, HAND, PRESS, Script, Eyebrow, Rule, Hand } from "./Editorial";
import JournalLedger from "./JournalLedger";

export default function ThreadView({ thread, entries, onBack, onTap, onWrite }) {
  const count = entries?.length || 0;
  return (
    <section style={{ marginBottom: 30 }}>
      <button onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
        border: "none", cursor: "pointer", padding: 0, marginBottom: 18,
        fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6,
        textTransform: "uppercase", color: T.muted,
      }}>
        <ArrowLeft size={13} /> All entries
      </button>

      <header style={{ marginBottom: 22 }}>
        <Eyebrow mb={10}>A thread · {count} {count === 1 ? "entry" : "entries"}</Eyebrow>
        <Script size={46} style={{ width: "auto" }}>{thread}</Script>
        <Rule w={28} c={T.gold} mt={12} mb={14} />
        <Hand size={19} color={T.inkSoft}>
          Every page you{"’"}ve filed under this thread, newest first — the shape of one
          story across your cycles.
        </Hand>
        <button onClick={() => onWrite && onWrite(thread)} style={{
          marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
          background: "transparent", border: "none", cursor: "pointer", padding: 0,
          fontFamily: HAND, fontWeight: 600, fontSize: 21, color: T.ink, textShadow: PRESS,
          borderBottom: `1px solid ${T.gold}`, paddingBottom: 3,
        }}>
          <Feather style={{ width: 15, height: 15 }} /> Add to this thread
        </button>
      </header>

      {count > 0 ? (
        <JournalLedger entries={entries} onTap={onTap} />
      ) : (
        <div style={{ textAlign: "center", padding: "30px 20px 46px" }}>
          <Hand size={20} color={T.inkSoft}>This thread is empty now — begin its first page.</Hand>
        </div>
      )}
    </section>
  );
}
