import { useEffect, useRef, useState } from "react";
import { SKY_LESSONS, skyLessonRoute } from "@/components/lifestyle-elite/sky/skyLessons";

// Only recognised app-owned references become links. Never navigate to a URL
// copied from notes/ref, or silently substitute today's lesson for an old one.
export function lifestyleReturnLink(item, route = "/SkyWorldsDemo") {
  const source = item?.source ?? item?._raw?.source;
  const ref = String(item?.ref ?? item?._raw?.ref ?? "");
  if (source === "books") {
    const book = /^gutenberg:([1-9]\d*)$/.exec(ref);
    if (book) return { href: `/BookReader?gutenberg_id=${book[1]}`, label: "Open this book" };
    const club = /^club:([\w-]+)$/.exec(ref);
    if (club) return { href: `/Community?club=${encodeURIComponent(club[1])}`, label: "Open the book club" };
  }
  if (["sky", "sky-lesson", "lifestyle"].includes(source)) {
    const key = /^sky-lesson:([\w-]+):v(\d+)$/.exec(ref);
    const lesson = key && SKY_LESSONS.find(entry => entry.id === key[1] && entry.version === Number(key[2]));
    if (lesson) return { href: skyLessonRoute(lesson, "petal-press", route), label: "Open this Sky lesson" };
  }
  if (source === "lifestyle") {
    const joy = /^joy:([\w-]+)$/.exec(ref);
    if (joy) {
      const page = ["/Lifestyle", "/SkyWorldsDemo"].includes(route) ? route : "/SkyWorldsDemo";
      return { href: `${page}?direction=petal-press&section=good&joy=${encodeURIComponent(joy[1])}`, label: "Open this small joy" };
    }
  }
  return null;
}

export function parseJournalEntryRequest(search) {
  const params = new URLSearchParams(search);
  if (!params.has("entry")) return null;
  const id = params.get("entry") || "";
  const contentKey = params.get("content_key");
  return { id, contentKey, valid: /^[\w-]{1,160}$/.test(id) && (contentKey === null || (contentKey.length > 0 && contentKey.length <= 300 && !/[\u0000-\u001f\u007f]/.test(contentKey))) };
}

export async function loadExactJournalEntry(entity, userId, request) {
  if (!userId || !request?.valid) return null;
  const filter = { user_id: userId, id: request.id };
  if (request.contentKey !== null) filter.content_key = request.contentKey;
  const rows = await entity.filter(filter, "-created_date", 1);
  return (Array.isArray(rows) ? rows : []).find(entry => entry?.id === request.id && entry.user_id === userId && (request.contentKey === null || entry.content_key === request.contentKey)) || null;
}

export function journalSourceReturn(entry) {
  return lifestyleReturnLink({ source: "lifestyle", ref: entry?.content_key });
}

// Independent of the journal's latest-200 list: old linked notes still open.
// Cancellation prevents an in-flight result for a previous owner/URL opening.
export function useExactJournalEntry({ entity, userId, authLoading, search, onOpen }) {
  // Base44 creates a fresh entity handler for every Proxy property access.
  // Its changing object identity must not restart this read every render.
  const entityRef = useRef(entity);
  entityRef.current = entity;
  const [state, setState] = useState({ status: "idle", entry: null });
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const request = parseJournalEntryRequest(search);
    onOpen(null);
    if (!request) { setState({ status: "idle", entry: null }); return; }
    if (authLoading) { setState({ status: "loading", entry: null }); return; }
    if (!userId) { setState({ status: "auth", entry: null }); return; }
    if (!request.valid) { setState({ status: "missing", entry: null }); return; }
    setState({ status: "loading", entry: null });
    loadExactJournalEntry(entityRef.current, userId, request).then(entry => {
      if (cancelled) return;
      setState({ status: entry ? "opened" : "missing", entry });
      if (entry) onOpen(entry);
    }).catch(() => {
      if (!cancelled) setState({ status: "error", entry: null });
    });
    return () => { cancelled = true; };
  }, [userId, authLoading, search, onOpen, retryCount]);
  return { ...state, retry: () => setRetryCount(count => count + 1) };
}
