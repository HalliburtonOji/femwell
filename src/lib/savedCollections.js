import { base44 } from "@/api/base44Client";
import { parseSavedMeta } from "@/lib/savedItems";
import { SKY_LESSONS, skyLessonRoute } from "@/components/lifestyle-elite/sky/skyLessons";
const SKY_ROUTES = new Set(["/Lifestyle", "/LivingLifestyleDemo", "/LivingAtelierDemo", "/LivingReadingRoomDemo", "/SkyWorldsDemo"]);
const cleanText = value => String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
function safeSavedHref(value) {
  if (typeof value !== "string" || !value || /[\u0000-\u0020\\]/.test(value)) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}

export function savedReturnRoute(row, lifestyleItem) {
  const meta = parseSavedMeta(row) || {};
  if (meta.kind === "sky-lesson") {
    if (!/^[\w-]{1,160}$/.test(String(meta.lessonId || "")) || !/^\d{1,6}$/.test(String(meta.lessonVersion ?? ""))) return null;
    const lesson = SKY_LESSONS.find(entry => entry.id === meta.lessonId && entry.version === Number(meta.lessonVersion)) || {id:meta.lessonId,version:meta.lessonVersion};
    try {
      const recorded = new URL(meta.route, "https://femwells.com");
      if (recorded.origin !== "https://femwells.com" || !SKY_ROUTES.has(recorded.pathname)) return null;
      return skyLessonRoute(lesson, recorded.searchParams.get("direction") || "letter", recorded.pathname);
    } catch { return null; }
  }
  if (lifestyleItem) {
    const fiction = lifestyleItem.content_type === "FICTION" || /^FEMWELL_FICTION_/.test(lifestyleItem.provider || "");
    return `/${fiction ? "FictionReader" : "LifestyleDetail"}?id=${encodeURIComponent(lifestyleItem.id)}`;
  }
  return safeSavedHref(meta.route) || safeSavedHref(meta.url) || safeSavedHref(meta.content_url)
    || (row.item_type === "ADVICE" ? "/Assistant" : row.item_type === "JOURNAL" ? "/Journal" : null);
}

// Presentation reconciliation only: every physical owner record is retained for an explicit removal.
export function mergeSavedCollections(rows, profile, resolutions) {
  const merged = new Map();
  for (const row of rows) {
    const key = `${row.item_type}:${row.item_id || row.id}`;
    const prior = merged.get(key);
    if (prior) prior._savedRecords.push(row);
    else merged.set(key, { ...row, _savedRecords: [row] });
  }
  for (const id of Array.isArray(profile?.saved_item_ids) ? profile.saved_item_ids : []) {
    const key = `LIFESTYLE:${id}`;
    const result = resolutions.get(id);
    const actual = result?.item;
    const prior = merged.get(key);
    const publicLesson = parseSavedMeta(prior || {})?.kind === "sky-lesson";
    merged.set(key, { ...(prior || { id: `profile:${id}`, user_id: profile.user_id, item_type: "LIFESTYLE", item_id: id, _savedRecords: [] }),
      title: actual?.title || prior?.title || "A kept Lifestyle find",
      preview_text: prior?.preview_text || cleanText(actual?.summary || actual?.lede || actual?.description),
      _profileId: profile.id, _lifestyleItem: actual || null,
      _unavailable: publicLesson ? null : result?.error ? "This find couldn’t load." : !actual ? "This find is no longer available." : null,
    });
  }
  return [...merged.values()].map(row => {
    const meta = parseSavedMeta(row) || {};
    const entityKeep = row.item_type === "LIFESTYLE" && meta.kind !== "sky-lesson";
    const result = entityKeep ? resolutions.get(row.item_id) : null;
    const item = row._lifestyleItem || result?.item;
    // Both stores need a successful exact lookup. A stale saved URL is not proof
    // that its underlying object still exists, and a failed read is not deletion.
    const unavailable = entityKeep
      ? result?.error || !resolutions.has(row.item_id) ? "This find couldn’t load."
        : !item ? "This find is no longer available." : null
      : row._unavailable || null;
    const route = unavailable ? null : savedReturnRoute(row, item);
    return { ...row, _unavailable: unavailable, _href: route, meta_json: JSON.stringify({ ...meta, route, url: null, content_url: null }) };
  }).sort((a, b) => String(b.created_at || b.created_date || "").localeCompare(String(a.created_at || a.created_date || "")));
}

export async function readOwnerSavedRows(userId) {
  const rows = [], seen = new Set();
  for (let skip = 0; ; skip += 150) {
    const page = await base44.entities.SavedItems.filter({ user_id: userId }, "-created_at", 150, skip);
    const fresh = page.filter(row => !seen.has(row.id));
    fresh.forEach(row => { seen.add(row.id); rows.push(row); });
    if (page.length < 150) return rows;
    if (!fresh.length) throw new Error("Saved pagination did not advance");
  }
}

