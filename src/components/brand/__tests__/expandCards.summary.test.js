// The "empty card" contract (Halli, raised repeatedly): a card with room must not show two
// lines and then a void. These pin the SOURCE half of that — the hook at rest must prefer the
// richest real text the item carries, and the expand must render every distinct paragraph.
import { describe, it, expect, vi } from "vitest";

vi.mock("@/api/base44Client", () => ({ base44: { entities: {} } }));
const { summaryOf, paragraphsOf } = await import("@/components/brand/expandCards");

const LONG = "She had not slept properly in three weeks, and the alterations room was the only place that still felt like her own. The north window gave a flat, honest light that showed every wrong stitch, which was the point of it.";
const SHORT = "A quiet read.";

describe("summaryOf — the hook at rest", () => {
  it("does NOT let a one-line subtitle beat a full body (the original bug)", () => {
    // the adapter sets subtitle = a one-line why_it_matters, body = the real lede
    const s = summaryOf({ title: "T", subtitle: SHORT, body: [LONG] });
    expect(s).toBe(LONG);
  });

  it("prefers a real summary when there is one", () => {
    const s = summaryOf({ title: "T", summary: LONG, subtitle: SHORT, body: ["x"] });
    expect(s).toBe(LONG);
  });

  it("falls back to the RICHEST text available rather than the first short one", () => {
    const mid = "A slightly longer line that still is not really substantial enough on its own.";
    const s = summaryOf({ title: "T", subtitle: SHORT, body: [mid] });
    expect(s).toBe(mid); // longest wins when nothing clears the substantial bar
  });

  it("never echoes the title back as the hook", () => {
    expect(summaryOf({ title: "The Coat", subtitle: "The Coat", body: [] })).toBe("");
  });

  it("returns empty (not a fake) when the item genuinely has no text", () => {
    expect(summaryOf({ title: "T" })).toBe("");
  });
});

describe("paragraphsOf — the expand's full read", () => {
  it("renders text that lives ONLY in summary/subtitle (previously rendered nothing)", () => {
    expect(paragraphsOf({ title: "T", summary: LONG, body: [] })).toEqual([LONG]);
  });

  it("de-dupes so the summary block and the body do not stutter", () => {
    const paras = paragraphsOf({ title: "T", body: [LONG, LONG] });
    expect(paras).toHaveLength(1);
  });

  it("splits one long blob into real paragraphs", () => {
    const blob = LONG + "\n\n" + "The second paragraph carries on from the first and is also of a reasonable length for prose.";
    expect(paragraphsOf({ title: "T", body: [blob] })).toHaveLength(2);
  });

  it("keeps multiple distinct paragraphs", () => {
    const paras = paragraphsOf({ title: "T", body: [LONG, "A different second paragraph entirely."] });
    expect(paras).toHaveLength(2);
  });
});
