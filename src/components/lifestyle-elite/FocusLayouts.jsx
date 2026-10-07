// SLIDER-FREE content layouts for the Lifestyle chip-focus demos. The four demos share ONE base
// interaction (retained header + section chips → tap a chip focuses the page on that section → tap a
// card opens the exact item) and differ ONLY here, in how the focused section (and the landing "for
// you") is laid out — with NO horizontal sliders / carousels anywhere.
//
// The shell computes the section's real content and passes it as `groups`: an array of
//   { key, label, accent, items, open, lens?, empty?, sectioned? }
// where `items` are the real card objects, `open(item)` opens the exact item, `lens` is an optional
// interactive panel (time-picker, sky diary), `empty` is an honest empty-state line, and `sectioned`
// tags each card with its cross-section label (used on the landing deck).
//
// Layouts: 'stacks' (named vertical shelves) implemented; 'column' | 'bento' | 'mood' land in the
// next builds — the dispatcher falls back to stacks until each is built.
import React from "react";
import { CoverCard } from "@/components/brand/expandCards";
import { SERIF, UI, T } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";
import { OXBLOOD } from "@/components/brand/SliderKit";

const GroupHead = ({ label, accent, clean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 12px" }}>
    <span style={{ width: 8, height: 8, borderRadius: 99, background: cwOf(accent || "gold").petal, flexShrink: 0 }} />
    <h3 style={{ fontFamily: SERIF, fontStyle: clean ? "normal" : "italic", fontWeight: 600, fontSize: clean ? 22 : 20, color: clean ? "#191510" : OXBLOOD, margin: 0, lineHeight: 1.2, textShadow: "none" }}>{label}</h3>
  </div>
);

// §2.2 chrome gold — the ONE sanctioned eyebrow/caption colour (clears AA on cream). One accent for
// every section eyebrow; cross-section identity is carried by the label TEXT, not per-card colour.
const EYEBROW = "#A8893F";
const Eyebrow = ({ children }) => (
  <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: EYEBROW, margin: "0 2px 6px" }}>{children}</div>
);

const emptyStyle = { fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "2px 2px 0", lineHeight: 1.5 };

// ── STACKS — the section's real sub-groups, kept but turned vertical + labelled. Full-width cards
//    flow straight down; the old peek shelves become clean labelled lists. No sliding. ────────────
function FocusStacks({ groups, clean }) {
  return (
    <div>
      {groups.map((g) => {
        const hasItems = Array.isArray(g.items) && g.items.length > 0;
        return (
          <section key={g.key} style={{ marginTop: 24 }}>
            <GroupHead label={g.label} accent={g.accent} clean={clean} />
            {g.lens ? <div style={{ marginBottom: hasItems ? 16 : 0 }}>{g.lens}</div> : null}
            {hasItems ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {g.items.map((it) => (
                  <div key={it.id}>
                    {g.sectioned && it.forYouSection ? <Eyebrow>{it.forYouSection}</Eyebrow> : null}
                    <CoverCard item={it} onOpen={() => g.open(it)} />
                  </div>
                ))}
              </div>
            ) : (!g.lens && g.empty ? (
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "2px 2px 0", lineHeight: 1.5 }}>{g.empty}</p>
            ) : null)}
          </section>
        );
      })}
    </div>
  );
}

// ── COLUMN — one flowing editorial column: a big lede card, then a compact continuous feed. No
//    group labels, no shelves — a magazine section-front you read straight down. ─────────────────
function FocusColumn({ groups }) {
  const flat = [];
  groups.forEach((g) => {
    if (g.lens) flat.push({ kind: "lens", key: g.key + "-lens", node: g.lens });
    (g.items || []).forEach((it) => flat.push({ kind: "card", it, open: g.open, section: g.sectioned ? it.forYouSection : null }));
    if ((!g.items || !g.items.length) && !g.lens && g.empty) flat.push({ kind: "empty", key: g.key + "-empty", text: g.empty });
  });
  const firstCard = flat.findIndex((f) => f.kind === "card");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {flat.map((f, i) => {
        if (f.kind === "lens") return <div key={f.key}>{f.node}</div>;
        if (f.kind === "empty") return <p key={f.key} style={emptyStyle}>{f.text}</p>;
        const isLede = i === firstCard;
        return (
          <div key={f.it.id}>
            {isLede ? <Eyebrow>Start here</Eyebrow> : (f.section ? <Eyebrow>{f.section}</Eyebrow> : null)}
            <CoverCard item={f.it} compact={!isLede} onOpen={() => f.open(f.it)} />
          </div>
        );
      })}
    </div>
  );
}

// ── BENTO — a 2-col mosaic: the first item is a featured tile spanning both columns, the rest are
//    smaller tiles, everything visible at once. Interactive lenses render full-width above. ───────
function FocusBento({ groups }) {
  const items = [], lenses = [], empties = [];
  groups.forEach((g) => {
    if (g.lens) lenses.push({ key: g.key + "-lens", node: g.lens });
    (g.items || []).forEach((it) => items.push({ it, open: g.open, section: g.sectioned ? it.forYouSection : null }));
    if ((!g.items || !g.items.length) && !g.lens && g.empty) empties.push({ key: g.key + "-empty", text: g.empty });
  });
  return (
    <div>
      {lenses.map((l) => <div key={l.key} style={{ marginBottom: 16 }}>{l.node}</div>)}
      {items.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
          {items.map((f, i) => (
            <div key={f.it.id} style={{ gridColumn: i === 0 ? "1 / -1" : "auto", minWidth: 0 }}>
              {f.section ? <Eyebrow>{f.section}</Eyebrow> : null}
              <CoverCard item={f.it} compact={i !== 0} onOpen={() => f.open(f.it)} />
            </div>
          ))}
        </div>
      ) : null}
      {empties.map((e) => <p key={e.key} style={emptyStyle}>{e.text}</p>)}
    </div>
  );
}

// ── MOOD — re-groups the section's items by how you feel / time you have, not by shelf. A quick
//    play · a longer settle-in · fresh reads. Lenses (time-picker, sky diary) lead as their own mood. ─
const MOODS = [
  { key: 0, label: "A quick moment", accent: "sage" },
  { key: 1, label: "Settle in", accent: "plum" },
  { key: 2, label: "Fresh & new", accent: "gold" },
];
const moodOf = (it) => {
  const t = String(it.type || "").toLowerCase();
  if (t === "video" || t === "audio") return 0;                 // something to play, right now
  if (t === "book" || t === "daily_story" || t === "story") return 1; // longer, settle in
  return 2;                                                     // articles/guides/other — fresh reads
};
function FocusMood({ groups }) {
  const all = [], lenses = [], empties = [];
  groups.forEach((g) => {
    if (g.lens) lenses.push({ key: g.key + "-lens", node: g.lens, label: g.label, accent: g.accent });
    (g.items || []).forEach((it) => all.push({ it, open: g.open }));
    if ((!g.items || !g.items.length) && !g.lens && g.empty) empties.push({ key: g.key + "-empty", text: g.empty });
  });
  const buckets = MOODS.map((m) => ({ ...m, items: all.filter((f) => moodOf(f.it) === m.key) })).filter((b) => b.items.length);
  return (
    <div>
      {lenses.map((l) => (
        <section key={l.key} style={{ marginBottom: 24 }}>
          <GroupHead label={l.label} accent={l.accent} />
          {l.node}
        </section>
      ))}
      {buckets.map((b) => (
        <section key={b.label} style={{ marginTop: 24 }}>
          {/* one bucket = don't label it (would alias to Stacks); each mood gets a non-compact anchor */}
          {buckets.length > 1 ? <GroupHead label={b.label} accent={b.accent} /> : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {b.items.map((f, i) => <CoverCard key={f.it.id} item={f.it} compact={i !== 0} onOpen={() => f.open(f.it)} />)}
          </div>
        </section>
      ))}
      {!buckets.length && !lenses.length ? empties.map((e) => <p key={e.key} style={emptyStyle}>{e.text}</p>) : null}
    </div>
  );
}

export function FocusLayout({ layout, groups, clean = false, presentation, onConsume }) {
  if (presentation === "folio") return <section className="fw-selected-overview" aria-label="For you today"><GroupHead label="For you today" clean/><div className="fw-selected-overview__entries">{groups.flatMap(group => (group.items || []).map(item => <div key={item.id}>{item.forYouSection && <Eyebrow>{item.forYouSection}</Eyebrow>}<CoverCard item={item} compact presentation={presentation} onConsume={onConsume ? () => onConsume(item) : undefined} onOpen={() => group.open(item)}/></div>))}</div></section>;

  switch (layout) {
    case "column": return <FocusColumn groups={groups} />;
    case "bento":  return <FocusBento groups={groups} />;
    case "mood":   return <FocusMood groups={groups} />;
    case "stacks":
    default:       return <FocusStacks groups={groups} clean={clean} />;
  }
}

export default FocusLayout;
