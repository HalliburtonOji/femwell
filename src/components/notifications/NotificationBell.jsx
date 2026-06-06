import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, ChevronRight, Flower2, Pill, BookOpen, Flame, Moon, Sparkles, Heart, AlertTriangle, Droplet } from "lucide-react";
import { createPageUrl } from "@/utils";

function timeAgo(isoStr) {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICONS = {
  daily_checkin_reminder: Flower2,
  medication_reminder: Pill,
  program_reminder: BookOpen,
  streak_alert: Flame,
  phase_change: Moon,
  insight_ready: Sparkles,
  panic_followup: Heart,
  symptom_alert: AlertTriangle,
  hydration_nudge: Droplet,
};

export default function NotificationBell({ userId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = () => {
    if (!userId) return;
    base44.entities.NotificationLog.filter({ user_id: userId })
      .then(items => setNotifications(items.sort((a, b) => (b.sent_at || '').localeCompare(a.sent_at || '')).slice(0, 30)))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const markRead = async (notif) => {
    if (notif.is_read) return;
    await base44.entities.NotificationLog.update(notif.id, {
      is_read: true,
      opened_at: new Date().toISOString(),
    }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    if (notif.action_route) {
      window.location.href = notif.action_route;
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.NotificationLog.update(n.id, { is_read: true, opened_at: new Date().toISOString() }).catch(() => {})));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full"
        style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}
      >
        <Bell className="w-4 h-4" style={{ color: "var(--plum)" }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "var(--rose-dust)", minWidth: 16, height: 16, fontSize: 9, fontWeight: 700, padding: "0 3px" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(42,32,53,0.45)" }} onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-t-3xl overflow-hidden"
            style={{ backgroundColor: "var(--surface)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", }}>Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X className="w-5 h-5" style={{ color: "var(--mauve)" }} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <Bell size={36} style={{ color: "var(--mauve)" }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--plum)", marginTop: 12 }}>All quiet</p>
                  <p style={{ fontSize: 13, color: "var(--mauve)", marginTop: 4 }}>Your notifications will appear here</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => markRead(notif)}
                    className="w-full text-left flex items-start gap-3 px-5 py-4 transition-colors"
                    style={{
                      backgroundColor: notif.is_read ? "transparent" : "var(--rose-dust-subtle)",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    {(() => { const TIcon = TYPE_ICONS[notif.notification_type] || Bell; return <TIcon size={20} style={{ flexShrink: 0, marginTop: 1, color: "var(--rose-dust)" }} />; })()}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 14, fontWeight: notif.is_read ? 500 : 700, color: "var(--plum)", }}>{notif.title}</p>
                      <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: 2, lineHeight: 1.5 }}>{notif.body}</p>
                      <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 4, opacity: 0.7 }}>{timeAgo(notif.sent_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: "var(--rose-dust)" }} />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}