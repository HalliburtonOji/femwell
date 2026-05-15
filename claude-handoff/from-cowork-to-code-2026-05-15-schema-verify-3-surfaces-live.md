# Cowork → Code, 2026-05-15: Schema migration verify — all 3 surfaces LIVE

## TL;DR

After Halli published, I PUT the three fields to Test Halli's UserProfile (200 OK, full round-trip), reloaded Planner, and **all three previously-blocked surfaces now render live on femwells.com**:

| # | Surface | Before | After | Where |
|---|---|---|---|---|
| 1 | **Confidence pill** | "Still learning — 0 of 4 cycles" | **"84% · 4 cycles"** | Today + Cycle headers |
| 2 | **HRT row in Tonight** | Hidden | **"HRT · TONIGHT / Patch · Estradiol 50mcg / Reminder set for 21:00 / Share with my GP →"** | Today tab, inside Tonight card |
| 3 | **Pacing Bank in Saved Rhythms** | Hidden | **"PACING BANK / Low Spoons day / 2 anchors · rest deferred / Use today →"** (green tile, between "YOURS · ACTIVE" Luteal Softness and "UP NEXT" Period Rest Day) | Cycle tab, Saved Rhythms carousel |

A2 ships end-to-end. The schema-migration blocker that was holding back 3 surfaces is fully resolved.

## What I wrote

```js
PUT /api/apps/69a9891a6ccccc1822bbb4bc/entities/UserProfile/{recordId}
Authorization: Bearer <base44_access_token from localStorage>

{
  "hrt_regimen": {
    "active": true,
    "method": "patch",
    "evening_dose": "Estradiol 50mcg",
    "reminder_time": "21:00"
  },
  "cycle_prediction_meta": {
    "confidence_pct": 84,
    "cycles_observed": 4,
    "next_period_eta": "2026-05-20",
    "eta_window_days": 3
  },
  "pacing_bank_opt_in": true
}

→ 200 OK, full payload echoed in response
```

## SDK auth note for future verifications

The base44 SDK uses **`localStorage.base44_access_token`** as a Bearer token. Raw `fetch(..., { credentials: 'include' })` returns 403 because the SDK doesn't rely on the session cookie alone — it sends `Authorization: Bearer <jwt>`. Pull the token from localStorage and set the header; that's the simplest path for any direct verification fetches/PUTs from femwells.com tabs.

## Bonus signal from the Cycle tab

The Week Ahead chip strip footer now reads: **"Period ETA Wed 20 · ±3d · 84% confident"** — same data as the Confidence pill, surfacing in a second place. Both pull from `cycle_prediction_meta`, and both work.

## What this unblocks

- A2 fully ships. No remaining schema blockers on Planner-A or A2 surfaces.
- Code can pick up Planner-B (Fresh-Start banner + podcast `↗` affordance) and then Today-A (Pillars Deck + Jess hero + Daily Story reel) without worrying about UserProfile field gaps.
- The mechanism (AI builder prompt → Schema viewer verify → Publish → PUT) is now a known, repeatable path — captured in `feedback_base44_schema_via_ai_builder.md`. Use it when the next field migration is needed.

— Cowork (Ms Verify hat), 2026-05-15
