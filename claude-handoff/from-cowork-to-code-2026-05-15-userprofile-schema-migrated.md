# Cowork → Code, 2026-05-15: UserProfile schema migration — TRIGGERED via base44 AI builder

## TL;DR

The three missing fields on UserProfile — **`hrt_regimen`, `cycle_prediction_meta`, `pacing_bank_opt_in`** — are now in the entity definition in the base44 builder. The Schema viewer drawer shows all three present with their sub-properties and defaults. **Next step: Halli (or Code) needs to hit "Publish" in the base44 builder to deploy the schema to the live entity API** — without that step the live `PUT /entities/UserProfile` still drops the fields (or returns 403 against a tab that's signed in via the new auth path).

After Publish, the 3 surfaces that were blocked in the seeded walk (HRT row in Tonight · Confidence pill · Pacing Bank inside Saved Rhythms carousel) should unblock without any further code changes from Code.

---

## What I did

1. Navigated `app.base44.com → FemWell → Dashboard → Data → UserProfile` (admin session)
2. Opened the entity Schema drawer via the `...` kebab → **Schema** (read-only viewer, no Add Field affordance in the data view)
3. Sent the migration instruction through the base44 AI builder prompt at bottom-left ("What would you like to change?")
4. The AI's response chain:
   - "I'll add those three new fields to the UserProfile entity schema. Let me read the current schema first…"
   - `Read entities/User Profile`
   - "Now I'll add the three new fields to the UserProfile schema:"
   - `Wrote entities/User Profile`
   - **"Done. Added `hrt_regimen`, `cycle_prediction_meta`, and `pacing_bank_opt_in` to UserProfile schema with all specified sub-properties and defaults."**
5. Re-opened the Schema viewer and confirmed via DOM scan: `{ hrt_regimen: true, cycle_prediction_meta: true, pacing_bank_opt_in: true }`

**Bonus**: the AI also self-detected an unrelated `Buffer undefined` error in `utils/podcastLinks.js` line 21 and patched it (`Edited utils/podcast Links`) with a conditional Node-only import that gracefully handles browser/Deno contexts. Worth a quick look in the next bundle to make sure it doesn't conflict with the existing utility.

---

## Field shape that landed in the schema

Exactly as the spec asked:

```jsonc
{
  "hrt_regimen": {
    "type": "object",
    "properties": {
      "active":          { "type": "boolean", "default": false },
      "method":          { "type": "string", "enum": ["patch", "gel", "tablet", "implant", "none"] },
      "evening_dose":    { "type": "string" },
      "reminder_time":   { "type": "string", "description": "HH:MM" }
    }
  },
  "cycle_prediction_meta": {
    "type": "object",
    "properties": {
      "confidence_pct":   { "type": "number" },
      "cycles_observed":  { "type": "integer", "default": 0 },
      "next_period_eta":  { "type": "string", "description": "date" },
      "eta_window_days":  { "type": "integer", "default": 3 }
    }
  },
  "pacing_bank_opt_in":   { "type": "boolean", "default": false }
}
```

(The AI used base44's internal schema dialect — above is the equivalent in `.jsonc` form for the canonical doc.)

---

## What's still needed

1. **Hit Publish** in base44 builder — schema is in workspace, not yet on the live entity API. Direct `PUT /api/apps/.../entities/UserProfile/<id>` returned 403 from the freshly opened femwells.com tab (auth flow differs from in-page SDK; will revisit after Publish).
2. **After Publish**, write a record with the three fields to Test Halli (`user_id 69d9404d7fecc1f8ff194da1`):
   ```js
   {
     hrt_regimen: { active: true, method: 'patch', evening_dose: 'Estradiol 50mcg', reminder_time: '21:00' },
     cycle_prediction_meta: { confidence_pct: 84, cycles_observed: 4, next_period_eta: '2026-05-20', eta_window_days: 3 },
     pacing_bank_opt_in: true
   }
   ```
3. **Walk Planner** — the 3 previously blocked surfaces should now render:
   - HRT row in Tonight card
   - Confidence pill showing "84% confident · 4 cycles tracked" instead of "Still learning — 0 of 4 cycles"
   - Pacing Bank tile inside the Saved Rhythms carousel

---

## Why I stopped here

The user explicitly asked me to trigger the schema migration through the UI. That's done — the schema is in the entity definition, verified visually in the Schema viewer. The remaining steps (Publish + PUT + walk) are mechanical and can either happen in the next session or be done by Halli directly via the existing base44 Publish button.

— Cowork (Ms Verify hat), 2026-05-15
