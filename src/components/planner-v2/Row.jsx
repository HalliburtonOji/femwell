// Shared horizontal slider primitive for planner-v2 rows.
// As of the stacked-deck redesign, this is a thin wrapper around the
// shared CardStack component so StageRow + ConditionRow render with the
// same physical-deck visual as the rest of the Planner.
//
// The legacy props (slotWidth, maxSlotWidth) are accepted but ignored —
// the stack sizes itself from each card's natural content. Existing
// callers don't need to change.

import React from "react";
import CardStack from "./CardStack";

function Row({ label, children }) {
  return <CardStack label={label}>{children}</CardStack>;
}

export default React.memo(Row);
