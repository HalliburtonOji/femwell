// V3 sprint Task 6 — minimal offline resilience layer.
// localStorage-backed queue of failed entity creates. The list is replayed
// when the user comes back online (App.jsx attaches the listener) or when
// flushPending(sdk) is called explicitly.

const KEY = "femwell_pending_queue";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function getPending() { return read(); }

export function addToPending(id, entityType, action, data) {
  const list = read();
  list.push({ id, entityType, action, data, ts: Date.now() });
  write(list);
}

export function removePending(id) {
  write(read().filter((x) => x.id !== id));
}

export async function flushPending(sdkRef) {
  const list = read();
  if (list.length === 0) return { flushed: 0, failed: 0 };
  let flushed = 0;
  let failed = 0;
  for (const item of list) {
    try {
      const entity = sdkRef?.entities?.[item.entityType];
      if (!entity) { failed += 1; continue; }
      if (item.action === "create" && typeof entity.create === "function") {
        await entity.create(item.data);
        removePending(item.id);
        flushed += 1;
      } else if (item.action === "update" && typeof entity.update === "function" && item.data?.id) {
        await entity.update(item.data.id, item.data.patch || {});
        removePending(item.id);
        flushed += 1;
      } else {
        // Unknown action — leave in queue.
        failed += 1;
      }
    } catch {
      failed += 1;
      // Stop on the first network failure so we don't burn through retries
      // while still offline.
      break;
    }
  }
  return { flushed, failed };
}

// Local uuid (crypto.randomUUID isn't universally available).
export function genQueueId() {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  return "fw-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
