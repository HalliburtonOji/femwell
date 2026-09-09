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

const GroupHead = ({ label, accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 12px" }}>
    <span style={{ width: 8, height: 8, borderRadius: 99, background: cwOf(accent || "gold").petal, flexShrink: 0 }} />
    <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 20, color: OXBLOOD, margin: 0, lineHeight: 1.15 }}>{label}</h3>
  </div>
);

const Eyebrow = ({ children, color }) => (
  <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color, margin: "0 2px 6px" }}>{children}</div>
);

// ── STACKS — the section's real sub-groups, kept but turned vertical + labelled. Full-width cards
//    flow straight down; the old peek shelves become clean labelled lists. No sliding. ────────────
function FocusStacks({ groups }) {
  return (
    <div>
      {groups.map((g) => {
        const hasItems = Array.isArray(g.items) && g.items.length > 0;
        return (
          <section key={g.key} style={{ marginTop: 26 }}>
            <GroupHead label={g.label} accent={g.accent} />
            {g.lens ? <div style={{ marginBottom: hasItems ? 14 : 0 }}>{g.lens}</div> : null}
            {hasItems ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {g.items.map((it) => (
                  <div key={it.id}>
                    {g.sectioned && it.forYouSection ? <Eyebrow color={cwOf(it.cw || "gold").petal}>{it.forYouSection}</Eyebrow> : null}
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

export function FocusLayout({ layout, groups }) {
  switch (layout) {
    case "stacks":
    default:
      return <FocusStacks groups={groups} />;
  }
}

export default FocusLayout;
