// The Daily Story gate — the contract every surface depends on. These tests pin the two
// things that break quietly: serving a STALE chapter as "today's", and serving a FUTURE
// (forward-seeded) chapter early, which would spoil it.
import { describe, it, expect, vi } from "vitest";

// the gate itself is pure — stub the SDK so importing the module doesn't boot the app client
vi.mock("@/api/base44Client", () => ({ base44: { entities: { DailyStory: { filter: async () => [] } } } }));

const { chapterForDay, framingLine, chapterLabel } = await import("@/components/lifestyle/dailyStory");

const mk = (series_key, series_title, day_number, published_date) => ({
  id: `${series_key}-${day_number}`, series_key, series_title, day_number, published_date,
  is_active: true, segment_text: `## Chapter ${day_number} — X\n\nprose`,
});

// the finished series (published in the past) + a newly authored one, forward-dated
const LONG_ROOM = Array.from({ length: 30 }, (_, i) =>
  mk("the_long_room", "The Long Room", i + 1, isoAdd("2026-05-11", i)));
const SMALL_MENDS = Array.from({ length: 30 }, (_, i) =>
  mk("small_mends", "Small Mends", i + 1, isoAdd("2026-07-18", i)));

function isoAdd(start, days) {
  const d = new Date(start + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const on = (s) => new Date(s + "T12:00:00");

describe("chapterForDay — the one gating contract", () => {
  it("never returns null while any readable chapter exists", () => {
    expect(chapterForDay(LONG_ROOM, on("2026-07-17"))).toBeTruthy();
  });

  it("NEVER presents a stale chapter as fresh (the original bug)", () => {
    const pick = chapterForDay(LONG_ROOM, on("2026-07-17")); // 38 days after the series ended
    expect(pick.fresh).toBe(false);
    expect(framingLine(pick)).toContain("a finished story you can also read straight through");
    expect(framingLine(pick)).not.toContain("new today");
  });

  it("NEVER serves a future-dated chapter early (no spoilers from the seed)", () => {
    const all = [...LONG_ROOM, ...SMALL_MENDS];
    // for every day BEFORE the new series starts, the pick must not be from it
    for (const day of ["2026-07-17", "2026-07-10", "2026-06-20"]) {
      const pick = chapterForDay(all, on(day));
      expect(pick.seriesKey).toBe("the_long_room");
      expect(pick.chapter.published_date <= day).toBe(true);
    }
  });

  it("a chapter published for TODAY wins — the authored series takes over", () => {
    const all = [...LONG_ROOM, ...SMALL_MENDS];
    const pick = chapterForDay(all, on("2026-07-18"));
    expect(pick.fresh).toBe(true);
    expect(pick.seriesKey).toBe("small_mends");
    expect(pick.chapter.day_number).toBe(1);
    expect(framingLine(pick)).toContain("new today");
    expect(chapterLabel(pick)).toBe("Chapter 1 of 30");
  });

  it("serves each authored chapter on its own day, in order", () => {
    const all = [...LONG_ROOM, ...SMALL_MENDS];
    for (const [day, n] of [["2026-07-18", 1], ["2026-07-25", 8], ["2026-08-16", 30]]) {
      const pick = chapterForDay(all, on(day));
      expect(pick.fresh).toBe(true);
      expect(pick.chapter.day_number).toBe(n);
    }
  });

  it("after the new series ends, the evergreen cycles THAT series (not the old one)", () => {
    const all = [...LONG_ROOM, ...SMALL_MENDS];
    const pick = chapterForDay(all, on("2026-08-20"));
    expect(pick.fresh).toBe(false);
    expect(pick.seriesKey).toBe("small_mends");
  });

  it("the evergreen is deterministic and advances exactly one a day", () => {
    const a = chapterForDay(LONG_ROOM, on("2026-07-17"));
    const b = chapterForDay(LONG_ROOM, on("2026-07-17"));
    expect(a.chapter.id).toBe(b.chapter.id); // same day → same chapter for everyone
    const c = chapterForDay(LONG_ROOM, on("2026-07-18"));
    expect(c.index).toBe((a.index + 1) % a.total);
  });

  it("index is safe to hand to the reader's goToChapter (position among readable)", () => {
    const all = [...LONG_ROOM, ...SMALL_MENDS];
    const pick = chapterForDay(all, on("2026-07-25")); // small_mends day 8
    const readable = SMALL_MENDS.filter((c) => c.published_date <= "2026-07-25");
    expect(pick.index).toBe(readable.length - 1);
    expect(pick.index).toBeLessThan(readable.length);
  });
});
