// sealedThreads — Sealed Letters v2 threading + anniversary helpers.
//
// A "thread" is a chain of sealed letters that write back to one another — you,
// answering a past letter, or continuing an annual ritual ("seal one for next
// year"). The linkage lives in the CLEAR envelope meta (journalCrypto extraMeta),
// so the vault groups threads WITHOUT decrypting anything. No entity change: a
// reply is an ordinary SealedLetters row whose body carries { thread: {...} }.

import { readEnvelopeMeta } from "@/utils/journalCrypto";

export function letterMeta(letter) {
  return readEnvelopeMeta(letter?.body) || null;
}
export function threadInfoOf(letter) {
  return letterMeta(letter)?.meta?.thread || null;
}

// The key that groups a letter with its thread: replies carry the root's id;
// a root (no thread meta) keys on its own id, so it joins its own replies.
export function threadKeyOf(letter) {
  const t = threadInfoOf(letter);
  return (t && t.rootId) ? t.rootId : letter?.id;
}

export function isAnniversaryLetter(letter) {
  return letterMeta(letter)?.trigger?.type === "anniversary";
}

// Build the thread meta for a NEW letter written back to `parent`.
export function buildReplyThread(parent) {
  if (!parent?.id) return null;
  const pt = threadInfoOf(parent);
  const rootId = (pt && pt.rootId) ? pt.rootId : parent.id;
  const seq = (pt && Number.isFinite(pt.seq)) ? pt.seq + 1 : 1;
  return { rootId, replyTo: parent.id, seq };
}

function seqOf(letter) {
  const t = threadInfoOf(letter);
  return (t && Number.isFinite(t.seq)) ? t.seq : 0; // root = 0
}
function timeOf(letter) {
  return new Date(letter?.created_at || letter?.created_date || 0).getTime() || 0;
}

// Map of threadKey -> number of letters in that thread (1 = a lone letter).
export function threadSizes(letters) {
  const m = {};
  (letters || []).forEach((l) => { const k = threadKeyOf(l); m[k] = (m[k] || 0) + 1; });
  return m;
}

// Group letters into threads — newest thread first, oldest letter first within.
export function groupThreads(letters) {
  const map = new Map();
  (letters || []).forEach((l) => {
    const k = threadKeyOf(l);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(l);
  });
  const groups = [...map.entries()].map(([key, ls]) => ({
    key,
    letters: [...ls].sort((a, b) => (seqOf(a) - seqOf(b)) || (timeOf(a) - timeOf(b))),
  }));
  groups.sort((a, b) =>
    Math.max(...b.letters.map(timeOf)) - Math.max(...a.letters.map(timeOf)));
  return groups;
}
