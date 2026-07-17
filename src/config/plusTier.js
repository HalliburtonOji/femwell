// plusTier.js — THE ONE SWITCH for the parked Plus tier.
//
// WHY THIS EXISTS (Halli's call, 2026-07-17): the Plus/premium tier is PARKED until the sale
// window (CLAUDE.md: "Paywall / Plus tier is parked until the sale window — don't pre-build
// it"). Meanwhile premium-gated features were still rendering their LOCKED variants — and a
// premium feature nobody can buy is just a dead locked card taking up space. The Atelier
// monthly letter was the visible casualty: it read as "the monthly reading is missing".
//
// So while Plus is parked, gated features are FREE.
//
// ───────────────────────────────────────────────────────────────────────────────
//  TO RE-LOCK WHEN THE PLUS SALE GOES LIVE:  set PLUS_PARKED = false.
//  That single line restores every paywall. Nothing else needs touching — every
//  gated surface asks plusUnlocked(), and real entitlements keep working either way.
// ───────────────────────────────────────────────────────────────────────────────
export const PLUS_PARKED = true;

// The gate every premium surface should call.
//   hasEntitlement — the user's real entitlement (from useEntitlements etc.)
//   isOperator     — internal/operator bypass
// While parked this returns true for everyone; flip PLUS_PARKED to re-lock instantly.
export function plusUnlocked(hasEntitlement, isOperator) {
  return PLUS_PARKED || !!hasEntitlement || !!isOperator;
}
