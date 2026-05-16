# STEP 1 schema migration — paste-ready base44 AI-builder prompt

**Status:** Repo side of STEP 1 shipped (commit pending). The live base44 schema must be migrated through the AI builder before the new "My Stage" UI on Profile can persist data correctly.

## What to do

1. Open base44 builder → Femwell project (`69a9891a6ccccc1822bbb4bc`).
2. Open the AI prompt pane.
3. Paste the prompt below verbatim.
4. After the agent confirms the schema change, click **Publish App**.

## The prompt

```
Update the UserProfile entity in two ways. Do not touch any other entity.

(1) Expand the `life_stage` field. It is currently a string enum with values
    ["none", "pregnancy", "menopause", "ttc"]. Add these new values so the
    final enum is:
      ["none", "teen", "reproductive", "pre-ttc", "ttc",
       "pregnant-t1", "pregnant-t2", "pregnant-t3",
       "postpartum", "perimenopause", "menopause", "post-menopause",
       "pregnancy"]
    Keep "pregnancy" in the list so existing rows aren't invalidated. Change
    the default from "none" to "reproductive". Do not migrate existing rows —
    leave their current value as-is.

(2) Add a new field `conditions` to UserProfile. It is an array of strings
    with this enum on each item:
      ["pcos", "endo", "pmdd", "fibroids", "thyroid",
       "hrt", "cancer-survivor", "ha", "other"]
    Default to an empty array. Add this description on the field: "Cross-
    cutting conditions modifier — overrides ribbon and pillar behaviour
    across life stages."

Do not remove `condition_flags` or `life_stage_focus` — they remain in place
for backwards compatibility. After saving, confirm both fields are visible
in the schema viewer and tell me you're done.
```

## After the prompt completes

1. Click **Publish App** on the base44 builder (don't skip — fields aren't live until publish).
2. Open femwells.com → Profile screen.
3. Confirm the new "My Stage" section renders, with all 11 life-stage pills and 9 condition checkboxes.
4. Pick a stage + a condition, refresh — values should persist.

Reply with "schema live" when done and I'll start STEP 2 (PlannerAdapter utility).
