// Keep provenance at every row boundary; edited display fields never replace
// the source record or its unrelated notes/repeat/category metadata.
export function plannerItemToBlock(row) {
  if (!row || typeof row !== "object") return null;
  let hour = 9;
  const match = /^(\d{1,2})/.exec(String(row.time || row.start_time || ""));
  const parsed = match ? Number(match[1]) : 9;
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 23) hour = parsed;
  const category = String(row.category || "").toLowerCase();
  const categoryType = ["habit", "wellbeing"].includes(category) ? "habit" : ["reminder", "medication", "med"].includes(category) ? "med" : ["appointment", "event"].includes(category) ? "event" : "task";
  const encodedType = /(?:^|;)t:(\w+)(?:;|$)/.exec(String(row.notes || ""))?.[1];
  const type = ["habit", "task", "med", "event"].includes(encodedType) ? encodedType : categoryType;
  const encodedDuration = Number(/(?:^|;)d:(\d+)(?:;|$)/.exec(String(row.notes || ""))?.[1]);
  return { id: row.id, hour, duration: Number(row.duration_minutes) || encodedDuration || 30, title: row.title || "Untitled", type, anchor: !!(row.is_anchor || row.anchor), done: !!row.is_completed, source: row.source, ref: row.ref, _raw: row };
}

export function plannerItemToPlanRow(row) {
  return { id: row.id, time: String(row.start_time || row.time || "").slice(0, 5), title: row.title || "Untitled", done: !!(row.completed || row.is_completed), source: row.source, ref: row.ref, _raw: row };
}

export function plannerBlockPatch(block) {
  const raw = block._raw || {};
  const original = plannerItemToBlock(raw);
  const hour = Number.isFinite(block.hour) ? String(block.hour).padStart(2, "0") : "09";
  const originalTime = String(raw.time || raw.start_time || "");
  const minutes = original && original.hour === block.hour && /^\d{1,2}:\d{2}/.test(originalTime) ? originalTime.slice(originalTime.indexOf(":") + 1, originalTime.indexOf(":") + 3) : "00";
  const controls = String(raw.notes || "").replace(/(?:^|;)t:[^;]*(?=;|$)/g, "").replace(/(?:^|;)d:\d+(?=;|$)/g, "").replace(/^;/, "");
  const notes = `t:${block.type};d:${block.duration}${controls ? `;${controls}` : ""}`;
  return { title: block.title, time: `${hour}:${minutes}`, duration_minutes: block.duration, notes, is_completed: !!block.done, is_anchor: !!block.anchor, anchor: !!block.anchor,
    category: original && original.type === block.type ? raw.category : ({ habit: "wellbeing", med: "reminder", event: "personal", task: "personal" }[block.type] || "personal"),
    ...(raw.source !== undefined ? { source: raw.source } : {}), ...(raw.ref !== undefined ? { ref: raw.ref } : {}), ...(raw.repeat !== undefined ? { repeat: raw.repeat } : {}) };
}
