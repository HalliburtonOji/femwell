// Garden — the Nurture Companion's own view. A calm, full-screen home for your living
// bloom; it grows from real engagement and never dies. Reachable at /Garden.
import { PAPER_BG, T, SERIF, UI, Eyebrow, InkFilter, EditorialFooter, useEditorialFonts, PHASE_COLORS } from "@/components/journal/Editorial";
import NurtureGarden, { Bloom } from "@/components/nurture/NurtureGarden";
import { FORM_LIST } from "@/components/nurture/companion";
// Growth Phase-0 (Halli-approved, live): goals + big-life bucket list as living flora,
// a tiny mission that waters the garden. Additive — the companion above is untouched.
import { GardenGrowth } from "@/components/growth/GrowthLive";
// Brand-P2: full-palette page vines (§5.3 Garden = the full palette). The Garden already
// carries the carved Heart + the elevated Bloom centrepiece — this only adds the edge texture.
import { VineMotifV2, floraKeyframes } from "@/components/brand/flora";

// Dev-only art preview (every form × every growth stage × the four cycle phases).
// Open /Garden?preview=blooms to inspect the artwork. Not linked in the UI.
function BloomPreview() {
  const stages = ["Seed", "Sprout", "Budding", "Blooming", "Full bloom"];
  const phases = [["menstrual", "#BC2E27"], ["follicular", "#8FAF8F"], ["ovulatory", "#D4AF37"], ["luteal", "#8E6E8E"]];
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, padding: "30px 16px 80px" }}>
      <InkFilter />
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Eyebrow mb={4}>Companion artwork · dev preview</Eyebrow>
        {FORM_LIST.map((f) => (
          <div key={f.key} style={{ marginTop: 26 }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted, marginBottom: 4 }}>{f.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {stages.map((s, si) => (
                <div key={s} style={{ textAlign: "center" }}>
                  <Bloom form={f} stageIdx={si} color={PHASE_COLORS.luteal || "#8E6E8E"} accent="#D4AF37" resting={false} bright={false} size={96} />
                  <div style={{ fontFamily: UI, fontSize: 9, color: T.muted }}>{s}</div>
                </div>
              ))}
              {/* phase-colour read, at full bloom */}
              {phases.map(([p, c]) => (
                <div key={p} style={{ textAlign: "center" }}>
                  <Bloom form={f} stageIdx={4} color={c} accent="#D4AF37" resting={false} bright={false} size={96} />
                  <div style={{ fontFamily: UI, fontSize: 9, color: T.muted }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Garden() {
  useEditorialFonts();
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "blooms") {
    return <BloomPreview />;
  }
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      {/* Brand-P2 full-palette page vines — one per fold, hairline + low-opacity, clipped */}
      {/* + held behind content (zIndex -1). The Garden's own Bloom stays the centrepiece. */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: -1 }}>
        <style>{floraKeyframes}</style>
        <div style={{ position: "absolute", top: 240, right: -26 }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.1} w={146} /></div>
        <div style={{ position: "absolute", top: 900, left: -28 }}><VineMotifV2 color={T.blush} color2={T.gold} opacity={0.09} w={138} flip /></div>
        <div style={{ position: "absolute", top: 1560, right: -24 }}><VineMotifV2 color="#8E6E8E" color2={T.sage} opacity={0.08} w={138} /></div>
      </div>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "34px 20px 50px", position: "relative" }}>
        <NurtureGarden compact={false} />
        <GardenGrowth />
        <div style={{ marginTop: 40 }}>
          <EditorialFooter />
        </div>
      </div>
    </div>
  );
}
