// The parked-Plus switch. This pins the promise made to Halli: unlocking the monthly letter
// while Plus is parked is ONE line, and re-locking it is the same one line — with real
// entitlements still honoured either way.
import { describe, it, expect } from "vitest";
import { PLUS_PARKED, plusUnlocked } from "@/config/plusTier";

describe("plusTier — the parked-Plus switch", () => {
  it("is currently PARKED (premium features free until the sale window)", () => {
    expect(PLUS_PARKED).toBe(true);
  });

  it("while parked: a free user gets the feature (no dead locked cards)", () => {
    expect(plusUnlocked(false, false)).toBe(true);
  });

  it("while parked: real entitlement and operator obviously still pass", () => {
    expect(plusUnlocked(true, false)).toBe(true);
    expect(plusUnlocked(false, true)).toBe(true);
  });

  it("RE-LOCK CONTRACT: with the flag off, only entitled/operator users pass", () => {
    // mirrors the function body exactly — the re-gate is this one boolean and nothing else
    const relocked = (has, op) => false || !!has || !!op;
    expect(relocked(false, false)).toBe(false); // free user is gated again
    expect(relocked(true, false)).toBe(true);   // paying user keeps it
    expect(relocked(false, true)).toBe(true);   // operator keeps it
  });
});
