// V3 sprint Task 7 — cross-environment notification scheduler.
// Capacitor (native) path uses @capacitor/local-notifications when
// available; the web fallback uses the standard Notification API.
//
// scheduleNotifications(profile) reads profile.notification_prefs:
//   {
//     checkin_enabled: bool,   checkin_time: "08:00",
//     med_enabled: bool,       med_time: "21:00",
//     habit_enabled: bool,     habit_time: "07:30",
//     cycle_enabled: bool,
//   }
// All time fields are "HH:MM" strings.

const NOTIF_IDS = {
  CHECKIN: 1001,
  MED:     1002,
  HABIT:   1003,
  CYCLE:   1004,
};

function defaultPrefs() {
  return {
    checkin_enabled: false, checkin_time: "08:00",
    med_enabled:     false, med_time:     "21:00",
    habit_enabled:   false, habit_time:   "07:30",
    cycle_enabled:   false,
  };
}

export function readPrefs(profile) {
  const raw = profile?.notification_prefs;
  if (!raw) return defaultPrefs();
  if (typeof raw === "string") {
    try { return { ...defaultPrefs(), ...JSON.parse(raw) }; }
    catch { return defaultPrefs(); }
  }
  if (typeof raw === "object") return { ...defaultPrefs(), ...raw };
  return defaultPrefs();
}

function hasCapacitor() {
  return typeof window !== "undefined" && !!window.Capacitor;
}

async function requestWebPermission() {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const p = await Notification.requestPermission();
    return p === "granted";
  } catch { return false; }
}

function nextOccurrence(hhmm) {
  // Returns a Date for the next occurrence of HH:MM (today if still future,
  // else tomorrow).
  const [h, m] = String(hhmm || "08:00").split(":").map((n) => parseInt(n, 10));
  const now = new Date();
  const next = new Date();
  next.setHours(h || 8, m || 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}

async function scheduleNative(items) {
  try {
    // Vite-ignore via dynamic variable so the build doesn't try to resolve
    // a Capacitor package that isn't installed in the web environment.
    const pkg = "@capacitor/local-notifications";
    const { LocalNotifications } = await import(/* @vite-ignore */ pkg);
    await LocalNotifications.requestPermissions();
    // Cancel any existing ones in our id-space first.
    await LocalNotifications.cancel({
      notifications: Object.values(NOTIF_IDS).map((id) => ({ id })),
    }).catch(() => {});
    if (items.length === 0) return { scheduled: 0 };
    await LocalNotifications.schedule({ notifications: items });
    return { scheduled: items.length };
  } catch (e) {
    return { error: String(e), scheduled: 0 };
  }
}

function scheduleWeb(items) {
  // Browser doesn't expose a real scheduler — best-effort: store the
  // intended times in localStorage and fire a notification on the next
  // page load if a scheduled time has just passed in the last 5 min.
  try {
    localStorage.setItem("femwell_notif_schedule", JSON.stringify(items));
    return { scheduled: items.length, mode: "web-stored" };
  } catch { return { scheduled: 0 }; }
}

export async function scheduleNotifications(profile) {
  const prefs = readPrefs(profile);
  const items = [];

  if (prefs.checkin_enabled) {
    items.push({
      id: NOTIF_IDS.CHECKIN, title: "Today's check-in",
      body: "Two minutes — how was your day?",
      schedule: { at: nextOccurrence(prefs.checkin_time), repeats: true, every: "day" },
    });
  }
  if (prefs.med_enabled) {
    items.push({
      id: NOTIF_IDS.MED, title: "Medication reminder",
      body: "A gentle nudge for tonight's meds + supplements.",
      schedule: { at: nextOccurrence(prefs.med_time), repeats: true, every: "day" },
    });
  }
  if (prefs.habit_enabled) {
    items.push({
      id: NOTIF_IDS.HABIT, title: "Morning rituals",
      body: "Your morning stack is ready when you are.",
      schedule: { at: nextOccurrence(prefs.habit_time), repeats: true, every: "day" },
    });
  }
  if (prefs.cycle_enabled && profile?.last_period_start_date) {
    const start = new Date(profile.last_period_start_date);
    const cycleLen = Number(profile?.cycle_avg_length) || 28;
    if (!Number.isNaN(start.getTime())) {
      const alert = new Date(start);
      alert.setDate(alert.getDate() + Math.max(1, cycleLen - 3));
      alert.setHours(9, 0, 0, 0);
      if (alert > new Date()) {
        items.push({
          id: NOTIF_IDS.CYCLE, title: "Period likely soon",
          body: "Your next cycle is predicted in about 3 days.",
          schedule: { at: alert },
        });
      }
    }
  }

  if (hasCapacitor()) return scheduleNative(items);
  // Web: request permission first; on success, store the intent.
  if (items.length > 0) await requestWebPermission();
  return scheduleWeb(items);
}

export async function cancelAll() {
  if (hasCapacitor()) {
    try {
      const pkg2 = "@capacitor/local-notifications";
      const { LocalNotifications } = await import(/* @vite-ignore */ pkg2);
      await LocalNotifications.cancel({
        notifications: Object.values(NOTIF_IDS).map((id) => ({ id })),
      });
    } catch { /* silent */ }
  } else {
    try { localStorage.removeItem("femwell_notif_schedule"); } catch {}
  }
}
