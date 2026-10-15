import { beforeEach, describe, expect, it } from "vitest";
import { DOORWAY_KEYS, monthlySet, passBook, setDoorway, getDoorway } from "./booksMonthly";

describe("Books doorway choice", () => {
  const today = new Date(2026, 9, 15);
  beforeEach(() => localStorage.clear());

  it("keeps main's stage-led pick while a calm doorway promotes a matching real book", () => {
    const main = monthlySet(today, null, "words");
    const calm = monthlySet(today, null, "words", true);
    expect(main.featured.gutenberg_id).toBe("1342");
    expect(calm.featured.gutenberg_id).toBe("174");
    expect(calm.alternates.some(book => book.gutenberg_id === "1342")).toBe(true);
    expect([calm.featured, ...calm.alternates].map(book => book.gutenberg_id)).toEqual(expect.arrayContaining(main.alternates.map(book => book.gutenberg_id)));
  });

  it.each(DOORWAY_KEYS)("gives %s an unpassed lead while retaining the other books", doorway => {
    const set = monthlySet(today, null, doorway, true);
    expect(set.featured.doorway).toBe(doorway);
    expect(new Set([set.featured, ...set.alternates].map(book => book.gutenberg_id)).size).toBe(5);
  });

  it("lets a passed book leave the lead without returning under the same choice", () => {
    passBook("174");
    const set = monthlySet(today, null, "words", true);
    expect(set.featured.gutenberg_id).not.toBe("174");
    expect(set.alternates.some(book => book.gutenberg_id === "174")).toBe(false);
  });

  it("stores the taste only on this device", () => {
    expect(getDoorway()).toBeNull();
    setDoorway("place");
    expect(getDoorway()).toBe("place");
  });
});
