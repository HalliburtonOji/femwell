// Garden — the Nurture Companion's own view (phase 1 MVP). A calm, full-screen home for
// your living bloom; it grows from real engagement and never dies. Reachable at /Garden.
import { PAPER_BG, T, SERIF, InkFilter, EditorialFooter, useEditorialFonts } from "@/components/journal/Editorial";
import NurtureGarden from "@/components/nurture/NurtureGarden";

export default function Garden() {
  useEditorialFonts();
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120 }}>
      <InkFilter />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "34px 20px 50px" }}>
        <NurtureGarden compact={false} />
        <div style={{ marginTop: 40 }}>
          <EditorialFooter />
        </div>
      </div>
    </div>
  );
}
