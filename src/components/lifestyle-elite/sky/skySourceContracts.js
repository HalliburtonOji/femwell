// Source adapters shared by the selected forecast and its historical editions.
// Preserve paragraph boundaries before removing markup; render the result as text.
export function skyParagraphs(value) {
  const separated = String(value || "")
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|div|section|h[1-6]|li|blockquote)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  const decoded = typeof DOMParser === "undefined" ? separated
    : new DOMParser().parseFromString(separated.replace(/</g, "&lt;"), "text/html").body.textContent;
  return String(decoded || "").replace(/\r\n?/g, "\n").split(/\n\s*\n/)
    .map(paragraph => paragraph.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1").trim()).filter(Boolean);
}

export async function readSkyOwnedRows(entity,filter,sort,size) {
  const rows=[],seen=new Set();
  for(let skip=0;;skip+=size){
    const page=await (skip ? entity.filter(filter,sort,size,skip) : entity.filter(filter,sort,size));
    if(!Array.isArray(page))throw new Error("No collection returned");
    const fresh=page.filter(row=>row.id && !seen.has(row.id));
    fresh.forEach(row=>{seen.add(row.id);if(row.user_id===filter.user_id)rows.push(row);});
    if(page.length<size)return rows;
    if(!fresh.length)throw new Error("Collection pagination did not advance");
  }
}

export function skyPairingValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : null;
}

export function skyCheckoutResult(response) {
  const data = response?.data || response || {};
  return { url: data.checkout_url || data.thank_you_url || data.url || "", simulated: data.simulated === true, error: data.error || "" };
}

export function safeSkySavedReturn(route, fallback) {
  try {
    const url = new URL(route, "https://femwells.com");
    const expected=new URL(fallback,"https://femwells.com");
    const allowed = ["/SkyWorldsDemo", "/LivingLifestyleDemo", "/LivingAtelierDemo", "/LivingReadingRoomDemo"];
    if(url.origin!=="https://femwells.com" || !allowed.includes(url.pathname) || url.searchParams.get("lesson")!==expected.searchParams.get("lesson") || url.searchParams.get("lessonVersion")!==expected.searchParams.get("lessonVersion"))return fallback;
    for(const key of [...url.searchParams.keys()])if(!["direction","section","lesson","lessonVersion"].includes(key))url.searchParams.delete(key);
    return `${url.pathname}${url.search}#daily-sky-lesson`;
  } catch { return fallback; }
}
