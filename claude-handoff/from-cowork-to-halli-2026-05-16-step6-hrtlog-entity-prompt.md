# STEP 6 — paste-ready base44 AI-builder prompt for HrtLog

**Status:** Repo side of STEP 6 shipped. The HrtLog entity must be created in the live base44 schema before the new "HRT log" card on the Cycle (Patterns) tab can persist data.

## What to do

1. Open base44 builder → Femwell project (`69a9891a6ccccc1822bbb4bc`).
2. Open the AI prompt pane.
3. Paste the prompt below verbatim.
4. After the agent confirms, click **Publish App**.

## The prompt

```
Create a new entity called HrtLog. Do not touch any other entity.

Fields:
- user_id           : string (required)
- type              : string enum, required.
                       Values: oestradiol-patch, oestradiol-gel, oestradiol-tablet,
                       utrogestan, mirena-ius, combined-pill, testosterone-gel,
                       vaginal-oestrogen, other.
- dose              : string (free text — e.g. "75 mcg / 24h").
- route             : string enum, optional.
                       Values: patch, gel, tablet, iud, pessary, injection, other.
- start_date        : string in YYYY-MM-DD format, required.
- end_date          : string in YYYY-MM-DD format, optional. Null while regimen
                       is active.
- notes             : string, optional, max 500 chars.
- is_active         : boolean, default true. Set to false when a new HRT row is
                       created for the same user (so only one is_active=true row
                       per user at a time).
- created_at        : string timestamp (auto).
- updated_at        : string timestamp (auto, on update).

Required: user_id, type, start_date.

Tell me when you're done and I'll Publish.
```

## After the prompt completes

1. Click **Publish App** on the base44 builder.
2. Open femwells.com → Profile → set life_stage = "perimenopause" (assumes STEP 1 schema is live).
3. Open the Planner page → Cycle tab (which should now read "Patterns") → tap "Add HRT" on the HRT card.
4. Fill in type / dose / route / start date → Save.
5. Refresh — the card should now show the saved regimen.

Reply with "HrtLog live" when done and STEP 7 (GP-ready PDF export) will start.
