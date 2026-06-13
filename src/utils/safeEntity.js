// Tiny, dependency-free safety wrappers for entity / function writes.
//
// Why: a bare awaited base44 write (entity create/update/delete, function invoke,
// or InvokeLLM) has no client-side timeout. If the network stalls, the awaiting
// component sits in its "saving" state forever and the UI hangs. These helpers
// race the promise against a timer so a stalled write rejects instead of hanging,
// letting the caller roll back optimistic state and surface a visible error.
//
// Suggested timeouts:
//   reads            ms = 2500
//   writes           ms = 6000   (default)
//   LLM / fn invokes ms = 15000–20000

/**
 * Race `promise` against a timeout. Resolves with the promise's value, or
 * rejects with `Error("<label> timed out")` once `ms` elapses.
 *
 * Note: this does not cancel the underlying request (base44 has no abort hook
 * on these calls) — it only stops the caller from awaiting forever.
 *
 * @param {Promise<any>} promise  the awaited operation
 * @param {number} ms             timeout in milliseconds (default 6000)
 * @param {string} label          label used in the timeout error message
 * @returns {Promise<any>}
 */
export async function withTimeout(promise, ms = 6000, label = "request") {
  return await Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(label + " timed out")), ms)),
  ]);
}

/**
 * Convenience wrapper for write operations. Same as withTimeout but with
 * write-friendly defaults (6000ms, label "save").
 *
 * @param {Promise<any>} promise
 * @param {{ ms?: number, label?: string }} [opts]
 * @returns {Promise<any>}
 */
export async function safeWrite(promise, { ms = 6000, label = "save" } = {}) {
  return withTimeout(promise, ms, label);
}
