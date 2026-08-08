// Community · WEB PUSH — client helper (F3, 2026-08-06).
// Registers the push-only service worker, subscribes via the Push API using the PUBLIC VAPID key
// (safe to ship — only the private key is a server secret), and stores the subscription server-side
// (createCommunityPost push.subscribe) against the anonymous author_hash. In-app "your turn" markers
// stay the primary path regardless of push; this is the best-effort background layer.
import { base44 } from "@/api/base44Client";
import { communityHash, communitySecret } from "./communityAnon";

// PUBLIC VAPID key (paired with the VAPID_PRIVATE_KEY server secret). Public by design.
export const VAPID_PUBLIC_KEY = "BDkF9VyuOcG9HCsMBzIR-ZlPz_E2TRvmeL4Ew8WOw9tyRJh9VQPrnjDWs-eCx28D7036tMTLAbBVWq4DamTbRO0";

function urlB64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator
    && typeof window !== "undefined" && "PushManager" in window && "Notification" in window;
}

// iOS only delivers web push to an INSTALLED PWA (standalone display-mode). Detect so the UI can
// nudge "add to home screen" instead of a permission prompt that would silently do nothing.
export function isIOS() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent || "");
}
export function isStandalone() {
  return (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
    || (typeof navigator !== "undefined" && navigator.standalone === true);
}
export function iosNeedsInstall() { return isIOS() && !isStandalone(); }

function platform() {
  if (isIOS()) return isStandalone() ? "ios-pwa" : "ios-web";
  if (typeof navigator !== "undefined" && /android/i.test(navigator.userAgent || "")) return "android";
  return "desktop";
}

export function notifyPermission() {
  return (typeof Notification !== "undefined") ? Notification.permission : "unsupported";
}

async function reg() {
  const r = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  return r;
}

export async function isPushOn() {
  try {
    if (!pushSupported()) return false;
    const r = await navigator.serviceWorker.getRegistration("/");
    const sub = r && (await r.pushManager.getSubscription());
    return !!sub;
  } catch { return false; }
}

// Turn notifications ON: permission → subscribe → store server-side. Returns { ok, reason }.
export async function enablePush(user) {
  try {
    if (!pushSupported()) return { ok: false, reason: "unsupported" };
    if (iosNeedsInstall()) return { ok: false, reason: "ios-install" };
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied" };
    const registration = await reg();
    let sub = await registration.pushManager.getSubscription();
    if (!sub) {
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    const author_hash = await communityHash(user?.id);
    const device_secret = communitySecret();
    const json = sub.toJSON();
    const r = await base44.functions.invoke("createCommunityPost", {
      action: "push.subscribe", user_id: user?.id, author_hash, device_secret,
      subscription: { endpoint: json.endpoint, keys: json.keys }, platform: platform(),
    });
    const data = r?.data ?? r ?? {};
    return data.ok ? { ok: true } : { ok: false, reason: data.error || "server" };
  } catch (e) { return { ok: false, reason: String(e?.message || e).slice(0, 60) }; }
}

// Turn notifications OFF: unsubscribe locally + deactivate server-side.
export async function disablePush(user) {
  try {
    const r = await navigator.serviceWorker.getRegistration("/");
    const sub = r && (await r.pushManager.getSubscription());
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => {});
      await base44.functions.invoke("createCommunityPost", { action: "push.unsubscribe", user_id: user?.id, endpoint }).catch(() => {});
    }
    return { ok: true };
  } catch { return { ok: false }; }
}
