// LifestyleDeckDemo — preview for PIECE 2 (the big ArticleCard deck). Reachable via the IDEAS
// pill so Halli can verify. The first deck SELF-LOADS real PUBLISHED LifestyleItems (falling back
// to a seeded, curated set if none/slow); the second is forced-seeded to show the never-empty
// fallback. Additive; no backend writes; live Lifestyle untouched. Route: /LifestyleDeckDemo.
import LifestyleArticleDeck from "@/components/lifestyle/LifestyleArticleDeck";
import { T, SERIF, SCRIPT, UI, PAPER_BG } from "@/components/journal/Editorial";

const OXBLOOD = "#7A1A12";
const GOLD = "#A8893F";

function Section({ eyebrow, title, note, children }) {
  return (
    <section style={{ margin: "30px 0 0" }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>{eyebrow}</div>
      <h2 style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 30, color: OXBLOOD, margin: "2px 0 4px", lineHeight: 1.05 }}>{title}</h2>
      {note && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, margin: "0 0 14px", lineHeight: 1.5, maxWidth: 580 }}>{note}</p>}
      {children}
    </section>
  );
}

// explicit seeded set (for the never-empty / forced-fallback demo) — spans life domains
const CURATED = [
  { id: "d-love", type: "article", category: "love & relationships", title: "The quiet art of staying", eyebrow: "Essay · 6 min", hook: "On choosing the same person again on an ordinary Tuesday — the unglamorous, real kind of love." },
  { id: "d-create", type: "guide", category: "creativity & making", title: "Make something with your hands tonight", eyebrow: "Prompt · 3 min", hook: "No talent required. A small, finishable thing — for the pleasure of making, not the result." },
  { id: "d-money", type: "guide", category: "career & money", title: "Look at your money without flinching", eyebrow: "Guide · 5 min", hook: "A ten-minute, shame-free money date — just you, a cuppa, and the actual numbers." },
  { id: "d-story", type: "story", category: "fiction", title: "A letter I never sent", eyebrow: "Story · 7 min", hook: "Short fiction: the things we write at midnight and are grateful we didn't post." },
  { id: "d-beauty", type: "article", category: "beauty & style", title: "Dressing for the week you actually have", eyebrow: "Style · 4 min", hook: "Not the week you wish you had. A kinder, easier way to get dressed in the morning." },
];

export default function LifestyleDeckDemo() {
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "22px 16px 0" }}>

        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>FemWell · Lifestyle level-up · Piece 2</div>
        <h1 style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: 40, color: OXBLOOD, margin: "2px 0 6px", lineHeight: 1.02 }}>The article deck</h1>
        <p style={{ fontFamily: SERIF, fontSize: 16.5, color: T.inkSoft, margin: "0 0 4px", lineHeight: 1.5 }}>
          A showcase deck of BIG article cards — one per view with an edge-peek, sliding sideways like the clipboard. Real <b>FwCard</b> chrome: a deterministic <b>FloraCover</b> on top, then the type &amp; read-time, a Fraunces title, a warm hook line, a Save, and a "Read this" CTA. Curated, roomy, never cramped, never empty.
        </p>

        <Section eyebrow="Live data" title="Reads for you" note="This deck self-loads real PUBLISHED LifestyleItems where present, and falls back to a curated seeded set if the library is empty or slow — so it always looks considered. Each cover is deterministic per item. Slide, or use the arrows.">
          <LifestyleArticleDeck label="Reads for you" />
        </Section>

        <Section eyebrow="Never empty" title="The curated fallback" note="The same deck driven by an explicit curated set (spanning love · creativity · money · fiction · style) — this is what shows when there's no live data yet. Tap the heart to save; tap a card to open.">
          <LifestyleArticleDeck label="A curated shelf" items={CURATED} />
        </Section>

        <Section eyebrow="For piece 3" title="Props" note="Presentational-first so the live Lifestyle shell can drop it into the Read board and drive it with real handlers.">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: UI, fontSize: 12.5 }}>
              <tbody>
                {[
                  ["items", "array?", "Deck items {id,type,category,title,eyebrow,hook,raw?}. If omitted, self-loads PUBLISHED LifestyleItems → seeded fallback."],
                  ["label", "string?", "Header label (default \"Reads for you\")."],
                  ["onOpen", "(item)=>void?", "Open handler; default deep-links /LifestyleDetail?id=. (Piece 3 wires readers per type.)"],
                  ["onSave / isSaved", "fn?", "Save handler + saved check; default is a local optimistic toggle (no write in the demo)."],
                  ["maxItems", "number?", "Curated count (default 5)."],
                ].map(([p, t, d]) => (
                  <tr key={p} style={{ borderBottom: "1px solid #E0D8C6" }}>
                    <td style={{ padding: "7px 8px", verticalAlign: "top", whiteSpace: "nowrap" }}><code style={{ background: "#E4DCC9", borderRadius: 4, padding: "1px 5px", color: OXBLOOD }}>{p}</code></td>
                    <td style={{ padding: "7px 8px", verticalAlign: "top", color: T.muted, whiteSpace: "nowrap" }}>{t}</td>
                    <td style={{ padding: "7px 8px", verticalAlign: "top", color: T.inkSoft }}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, margin: "28px 0 0", lineHeight: 1.55 }}>
          Piece 2 of 12 — the big article deck (drops the piece-1 FloraCover in). Built small and finished properly. Next (on your go): piece 3. Live Lifestyle untouched.
        </p>
      </div>
    </div>
  );
}
