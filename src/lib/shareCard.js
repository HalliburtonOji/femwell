// shareCard — the FemWell external share-card engine + THE WALL (a code guard, not a
// convention). Generates an on-brand 1080x1920 card on-device (canvas → PNG) and shares
// it via the Web Share API with graceful fallbacks. NO backend, NO third-party SDK in the
// share path (the Flo lesson). Cream/plum, Ephesis + Cormorant, no emoji.
//
// THE WALL: only NON-personal artifacts may leave the app — a Living Wisdom line, a
// horoscope, an affirmation, a book pick, an invite. The ONE personal exception is the
// user's OWN words, and only by explicit opt-in. Anyone's anonymous echo, any journal
// entry, any witnessed disclosure, or another member's post can NEVER be externally shared.
// assertExternallyShareable() throws ShareBlockedError on anything disallowed; shareArtifact()
// calls it FIRST, so a disallowed share is blocked in code before any card is even rendered.

export class ShareBlockedError extends Error {
  constructor(message) { super(message); this.name = "ShareBlockedError"; }
}

// Artifact kinds allowed to leave the app. Everything else is blocked by default.
export const ALLOWED_KINDS = new Set([
  "wisdom", "horoscope", "affirmation", "bookpick", "resonated", "invite", "own-words",
]);
// Sources that can NEVER be externally shared (personal / anonymous / another user).
export const BLOCKED_SOURCES = new Set([
  "echo", "witness", "twin", "member-post", "community-post", "journal-entry", "anonymous", "sealed",
]);

export function assertExternallyShareable(artifact) {
  if (!artifact || typeof artifact !== "object") throw new ShareBlockedError("Nothing to share.");
  if (!ALLOWED_KINDS.has(artifact.kind)) throw new ShareBlockedError("This can't be shared outside the app.");
  if (artifact.source && BLOCKED_SOURCES.has(artifact.source)) {
    throw new ShareBlockedError("Personal or anonymous content stays inside the app — it can't be shared out.");
  }
  // The one personal case — the user's own words — needs an explicit opt-in.
  if (artifact.kind === "own-words" && artifact.optIn !== true) {
    throw new ShareBlockedError("Your own words need your explicit say-so to share.");
  }
  return true;
}

// ── card rendering (on-device canvas) ────────────────────────────────────────
const W = 1080, H = 1920;
const CREAM = "#F4EDDB", PAPER = "#FBF6E6", INK = "#2E261B", PLUM = "#4A2A3A", GOLD = "#A6862B", MUTED = "#7B5E6B";
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SCRIPT = '"Ephesis", "Pinyon Script", cursive';
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

const LABELS = {
  wisdom: "Living wisdom", horoscope: "Today's sky", affirmation: "An affirmation",
  bookpick: "Reading", resonated: "This resonated", invite: "An invitation", "own-words": "In my words",
};

async function ensureFonts() {
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load(`600 96px ${SERIF}`),
        document.fonts.load(`400 120px ${SCRIPT}`),
        document.fonts.load(`700 28px ${SANS}`),
      ]);
      await document.fonts.ready;
    }
  } catch { /* fall back to system serifs */ }
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// Renders the artifact to a PNG Blob. Pure on-device; no network.
export async function renderShareCardBlob(artifact) {
  assertExternallyShareable(artifact);
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // background
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAPER); g.addColorStop(1, CREAM);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // gold frame
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  ctx.textAlign = "center";

  // eyebrow / label
  ctx.fillStyle = GOLD;
  ctx.font = `700 30px ${SANS}`;
  const label = (LABELS[artifact.kind] || "FemWell").toUpperCase();
  ctx.fillText(letterSpace(label, 4), W / 2, 280);

  // the line (wrapped serif)
  const body = String(artifact.line || artifact.text || "").trim();
  ctx.fillStyle = PLUM;
  let size = body.length > 220 ? 60 : body.length > 120 ? 74 : 92;
  ctx.font = `600 ${size}px ${SERIF}`;
  let lines = wrapLines(ctx, `“${body}”`, W - 280);
  // shrink to fit vertical space
  while (lines.length * (size * 1.32) > H - 760 && size > 40) {
    size -= 6; ctx.font = `600 ${size}px ${SERIF}`; lines = wrapLines(ctx, `“${body}”`, W - 280);
  }
  const lineH = size * 1.32;
  let y = H / 2 - (lines.length * lineH) / 2 + lineH / 2;
  for (const ln of lines) { ctx.fillText(ln, W / 2, y); y += lineH; }

  // attribution (e.g. author for a book pick)
  if (artifact.sub) {
    ctx.fillStyle = MUTED; ctx.font = `italic 40px ${SERIF}`;
    ctx.fillText(String(artifact.sub).slice(0, 80), W / 2, y + 30);
  }

  // wordmark + invite line (bottom)
  ctx.fillStyle = INK; ctx.font = `400 120px ${SCRIPT}`;
  ctx.fillText("FemWell", W / 2, H - 320);
  ctx.fillStyle = MUTED; ctx.font = `700 28px ${SANS}`;
  const foot = artifact.footer || "Whole-life wellbeing, in your season";
  ctx.fillText(letterSpace(String(foot).toUpperCase(), 2), W / 2, H - 240);
  if (artifact.url) {
    ctx.fillStyle = GOLD; ctx.font = `700 30px ${SANS}`;
    ctx.fillText(String(artifact.url).replace(/^https?:\/\//, ""), W / 2, H - 170);
  }

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png", 0.95));
}

function letterSpace(s, px) {
  // canvas has no letter-spacing pre-2023; emulate with thin spaces for the small caps labels.
  return String(s).split("").join(px >= 4 ? "  " : " ");
}

// ── the share action ─────────────────────────────────────────────────────────
// Returns { ok, via } on success/cancel, or { ok:false, via:"fallback", blob, file, shareText, url }
// so the caller can render download / copy-link / WhatsApp fallbacks.
export async function shareArtifact(artifact) {
  assertExternallyShareable(artifact);   // THE WALL — before anything is rendered
  const blob = await renderShareCardBlob(artifact);
  const file = new File([blob], "femwell.png", { type: "image/png" });
  const shareText = artifact.shareText || "";
  const url = artifact.url || "";
  const canFiles = typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] });
  if (canFiles && navigator.share) {
    try {
      await navigator.share({ files: [file], ...(shareText ? { text: shareText } : {}), ...(url ? { url } : {}) });
      return { ok: true, via: "web-share" };
    } catch (e) {
      if (e && e.name === "AbortError") return { ok: false, via: "cancelled" };
      // fall through to fallbacks
    }
  }
  return { ok: false, via: "fallback", blob, file, shareText, url };
}

// Fallback helpers (used by the ShareButton when Web Share is unavailable).
export function downloadBlob(blob, filename = "femwell.png") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
export function whatsappHref(text, url) {
  const msg = [text, url].filter(Boolean).join(" ");
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
// Instagram Stories background-image handoff is NATIVE-ONLY (no web path); we don't attempt it.
