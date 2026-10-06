// Public pairing links contain the entered details, never a private generated answer.
export function validSkyBirthday(value, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || month < 1 || month > 12 || day < 1) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= today;
}

export function decodeSkyPairing(raw) {
  let name, birthday;
  if (raw.startsWith("{")) ({ name, birthday } = JSON.parse(raw));
  else [name, birthday] = atob(raw).split("|"); // preserve existing shared links
  if (typeof name !== "string" || name.length > 100 || !validSkyBirthday(birthday)) throw new Error("This pairing link isn't quite right. Enter the birthday below.");
  return { name, birthday };
}

export function sanitiseSkyLetter(html) {
  if (!html || typeof DOMParser === "undefined") return "";
  const document = new DOMParser().parseFromString(String(html), "text/html");
  document.querySelectorAll("script,style,iframe,object,embed,svg,math,template").forEach(node => node.remove());
  const allowed = new Set(["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "hr", "a"]);
  [...document.body.querySelectorAll("*")].reverse().forEach(node => {
    if (!allowed.has(node.localName)) { node.replaceWith(...node.childNodes); return; }
    const href = node.getAttribute("href") || "";
    [...node.attributes].forEach(attribute => node.removeAttribute(attribute.name));
    if (node.localName === "a" && /^(https?:\/\/|mailto:)/i.test(href.trim())) {
      node.setAttribute("href", href.trim()); node.setAttribute("rel", "noopener noreferrer"); node.setAttribute("target", "_blank");
    }
  });
  return document.body.innerHTML;
}

export function skyReadingKey(userId, reading) {
  return userId && reading?.id && reading?.reading_date && reading?.narrative
    ? `sky:${reading.reading_date}:${reading.id}` : null;
}
