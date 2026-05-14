import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Droplets, Flame, Heart, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS = {
  daily_checkin_reminder: Bell,
  hydration_nudge: Droplets,
  streak_alert: Flame,
  medication_reminder: Heart,
  phase_change: CalendarDays,
  insight_ready: Bell,
  panic_followup: Heart,
  symptom_alert: Bell,
  program_reminder: CalendarDays,
};

const TYPE_COLORS = {
  daily_checkin_reminder: "var(--rose-dust)",
  hydration_nudge: "#6B8AC4",
  streak_alert: "#B89E6A",
  medication_reminder: "var(--rose-dust)",
  phase_change: "var(--sage)",
  insight_ready: "var(--mauve)",
  panic_followup: "var(--rose-dust)",
  symptom_alert: "#B89E6A",
  program_reminder: "var(--sage)",
};

export default function NotificationSheet({ open, onClose, userId, onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !userId) return;
    loadNotifications();
  }, [open, userId]);

  const loadNotifications = async () => {
    setLoading(true);
    const notes = await base44.entities.NotificationLog.filter({ user_id: userId }, "-sent_at", 50);
    setNotifications(notes);
    setLoading(false);
  };

  const handleTap = async (notif) => {
    if (!notif.is_read) {
      await base44.entities.NotificationLog.update(notif.id, { is_read: true, opened_at: new Date().toISOString() });
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      onRead && onRead();
    }
    if (notif.action_route) {
      onClose();
      navigate(notif.action_route);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(42,32,53,0.35)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61,
              backgroundColor: "var(--surface)", borderRadius: "24px 24px 0 0",
              maxHeight: "75vh", display: "flex", flexDirection: "column",
              boxShadow: "var(--shadow-lg)", paddingBottom: "env(safe-area-inset-bottom, 16px)",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
              <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px 10px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>Notifications</p>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9999, border: "none", backgroundColor: "var(--ivory-dark)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X className="w-3.5 h-3.5" style={{ color: "var(--mauve)" }} />
              </button>
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
                  <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => {
                    const Icon = TYPE_ICONS[notif.notification_type] || Bell;
                    const iconColor = TYPE_COLORS[notif.notification_type] || "var(--mauve)";
                    const timeAgo = notif.sent_at ? formatDistanceToNow(new Date(notif.sent_at), { addSuffix: true }) : "";
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleTap(notif)}
                        style={{
                          width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px",
                          background: notif.is_read ? "transparent" : "var(--rose-dust-subtle)",
                          border: "none", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${iconColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <Icon style={{ width: 16, height: 16, color: iconColor }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                            <p style={{ fontSize: 13, fontWeight: notif.is_read ? 500 : 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{notif.title}</p>
                            {!notif.is_read && <div style={{ width: 7, height: 7, borderRadius: 9999, backgroundColor: "var(--rose-dust)", flexShrink: 0 }} />}
                          </div>
                          {notif.body && <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{notif.body}</p>}
                          {timeAgo && <p style={{ fontSize: 10, color: "var(--mauve-light)", fontFamily: "'Inter', sans-serif", marginTop: 3 }}>{timeAgo}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}