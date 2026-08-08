// FemWell service worker — PUSH ONLY (F3, 2026-08-06).
// Deliberately has NO `fetch` handler and caches NOTHING, so it can't interfere with the per-build
// cache-buster (§14.3 — that's a reload mechanism, not SW caching). It only turns an incoming Web
// Push into a notification and routes the tap. No content is stored; the payload is transient.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  const title = data.title || "FemWell";
  const body = data.body || "Something's waiting for you.";
  const route = data.route || "/Community";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.type || "femwell",
      data: { route },
      // gentle: never vibrate aggressively; renotify off so a room doesn't buzz repeatedly
      renotify: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const route = (event.notification.data && event.notification.data.route) || "/Community";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // focus an existing tab if one's open, else open a new one at the route
      for (const c of clients) {
        if ("focus" in c) { c.navigate(route).catch(() => {}); return c.focus(); }
      }
      return self.clients.openWindow(route);
    })
  );
});
