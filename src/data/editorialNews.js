import { eligiblePublishedRead } from "../lib/editorialRelease";

export const isNewsSource = row => /NEWS/i.test(String(row?.content_type || "") + " " + String(row?.provider || "") + " " + String(row?.category || "")) ||
  (Array.isArray(row?.tags) && row.tags.some(tag => String(tag).toLowerCase() === "news"));

export function isStaleNews(row, now = Date.now()) {
  if (!isNewsSource(row)) return false;
  const published = String(row?.published_at || "");
  const editorial = row?.provider === "FEMWELL_EDITORIAL";
  const checked = String(editorial ? row?.editorial_source_checked_at || "" : row?.revalidated_at || published);
  const expires = String(row?.expires_at || "");
  const date = new Date(now);
  const today = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  const future = value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? value > today : Date.parse(value) > now;
  const stale = !checked || !Number.isFinite(Date.parse(checked)) || future(checked) || now - Date.parse(checked) > 14 * 86400000;
  return stale || !!(published && (!Number.isFinite(Date.parse(published)) || future(published))) ||
    !!(expires && (!Number.isFinite(Date.parse(expires)) || (/^\d{4}-\d{2}-\d{2}$/.test(expires) ? expires < today : now > Date.parse(expires))));
}

// Today offers a current recommendation; the full Lifestyle archive keeps older articles.
export const eligibleCurrentRead = row => eligiblePublishedRead(row) && !isStaleNews(row);
