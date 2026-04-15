import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Bell } from "lucide-react";
import NotificationSheet from "./NotificationSheet";

export default function NotificationBellButton({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    const notes = await base44.entities.NotificationLog.filter({ user_id: userId, is_read: false }, "-sent_at", 50).catch(() => []);
    setUnreadCount(notes.length);
  }, [userId]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ position: "relative", width: 36, height: 36, borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        <Bell style={{ width: 16, height: 16, color: "var(--mauve)" }} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: 9999,
            backgroundColor: "var(--rose-dust)", color: "white", fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif",
            border: "1.5px solid var(--surface)",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <NotificationSheet
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        onRead={fetchUnread}
      />
    </>
  );
}