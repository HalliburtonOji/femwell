// bloomprint.js — the PERSONAL FLORA IDENTITY ("Bloomprint"), a VIEW over what the Garden
// already persists. NO new entity: her signature = her companion form (CompanionState) ×
// her fingerprint colourway; rare blooms live in CompanionState.milestones; seasons in
// GardenChapter; her disclosure TIER maps onto the existing meadow opt-in (CompanionShare).
// Community presence is seeded from the ANON author_hash — never her account — so it can't
// be linked to her real garden or out her activity.

import { getCompanion } from "@/components/nurture/companion";
import { fingerprintColourway } from "@/components/brand/flora";
import { isShared, isNameShared } from "@/components/nurture/companionShare";

// forms + colourways for the veiled community presence bloom (all RichBloomV2-supported).
export const PRESENCE_FORMS = ["poppy", "daisy", "forget", "cosmos", "camellia", "marigold"];
export const CW_KEYS = ["crimson", "blush", "gold", "sage", "plum", "lavender", "cream", "coral", "sky"];

// tiny FNV hash (matches Community.botanicalAlias + companion.js) → unsigned int
export function bpHash(s) {
  let h = 2166136261 >>> 0;
  const x = String(s || "");
  for (let i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// the VEILED community presence bloom — seeded from the anon author_hash (NOT userId), so it
// stays consistent across her thread but can never be linked to her account or real garden,
// and shows species + colour ONLY (never her growth/activity).
export function presenceBloom(authorHash) {
  const h = bpHash(authorHash);
  return { form: PRESENCE_FORMS[h % PRESENCE_FORMS.length], cwKey: CW_KEYS[(h >>> 4) % CW_KEYS.length] };
}

// her SIGNATURE (deterministic): her companion form × her fingerprint colourway (carries meaning).
export function bloomprintSignature(userId) {
  const comp = userId ? getCompanion(userId) : null;
  const cw = fingerprintColourway(userId || "femwell");
  return { form: comp?.form?.key || "peony", formName: comp?.form?.name || "Peony", name: comp?.name || "", cw };
}

// her disclosure TIER, persisted via the existing meadow opt-in flags (+ CompanionShare row).
// veiled = private (default) · my-flower = a visitable bloom, no name · named = + her chosen name.
export function bloomprintTier() {
  if (!isShared()) return "veiled";
  return isNameShared() ? "named" : "my-flower";
}
export const TIER_LABEL = { veiled: "Veiled", "my-flower": "My flower", named: "Named" };
export const TIER_SUB = {
  veiled: "Private. You appear in the rooms as an anonymous bloom; no one can visit your patch.",
  "my-flower": "Your real signature bloom is visitable — still no name shown.",
  named: "Your bloom is visitable with a name you choose. Never your real name unless you type it.",
};
