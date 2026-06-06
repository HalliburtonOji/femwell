import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Trash2, RefreshCw, MessageSquare } from "lucide-react";

const FW = {
  cream: "#F4EDDB",
  espresso: "#3A2C1A",
  muted: "#9B8B7A",
  mutedText: "#6B5B4E",
  gold: "#D4AF37",
  chipBg: "#EDE6D5",
  chipBorder: "#D4C9B4",
  paper: "#FBF6E6",
};

const STATUS_PILL = {
  pending:  { bg: "#FFF3CD", color: "#856404" },
  done:     { bg: "#D1FAE5", color: "#065F46" },
  failed:   { bg: "#FEE2E2", color: "#991B1B" },
};

function pill(status) {
  const s = STATUS_PILL[status] || { bg: FW.chipBg, color: FW.mutedText };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, borderRadius: 9999,
      padding: "2px 10px", background: s.bg, color: s.color,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {status || "—"}
    </span>
  );
}

export default function AdminJessConversations() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("all"); // all | active | deleted

  async function load() {
    setLoading(true);
    setError(null);
    const data = await base44.entities.JessConversation.list("-created_date", 200);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function softDelete(id) {
    await base44.entities.JessConversation.update(id, { is_deleted: true });
    setRows(prev => prev.map(r => r.id === id ? { ...r, is_deleted: true } : r));
  }

  const visible = rows.filter(r => {
    if (filter === "active")  return !r.is_deleted;
    if (filter === "deleted") return  r.is_deleted;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: FW.cream, padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ background: FW.espresso, color: FW.cream, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MessageSquare size={18} style={{ color: FW.gold }} />
          <span style={{ fontSize: 16, fontWeight: 700, }}>Jess Conversations</span>
          <span style={{ fontSize: 12, background: "rgba(212,175,55,0.18)", color: FW.gold, borderRadius: 9999, padding: "2px 10px", fontWeight: 600 }}>
            Admin
          </span>
        </div>
        <button
          onClick={load}
          style={{ border: "none", background: "rgba(244,237,219,0.12)", color: FW.cream, borderRadius: 9999, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: "14px 20px", background: FW.paper, borderBottom: `1px solid ${FW.chipBorder}`, display: "flex", gap: 8 }}>
        {["all", "active", "deleted"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: 12, fontWeight: 700, borderRadius: 9999, padding: "6px 16px",
              border: `1px solid ${filter === f ? FW.espresso : FW.chipBorder}`,
              background: filter === f ? FW.espresso : "transparent",
              color: filter === f ? FW.cream : FW.mutedText,
              cursor: "pointer", textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: FW.muted, alignSelf: "center" }}>
          {visible.length} record{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={24} className="animate-spin" style={{ color: FW.muted }} />
          </div>
        )}
        {!loading && error && (
          <p style={{ color: "#991B1B", textAlign: "center", padding: "40px 0" }}>{error}</p>
        )}
        {!loading && !error && visible.length === 0 && (
          <p style={{ color: FW.muted, textAlign: "center", padding: "60px 0", fontSize: 14 }}>No conversations found.</p>
        )}
        {!loading && !error && visible.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map(row => (
              <div
                key={row.id}
                style={{
                  background: row.is_deleted ? "#FEF2F2" : FW.paper,
                  border: `1px solid ${row.is_deleted ? "#FCA5A5" : FW.chipBorder}`,
                  borderRadius: 14, padding: "14px 16px",
                  opacity: row.is_deleted ? 0.7 : 1,
                  display: "flex", flexDirection: "column", gap: 8,
                }}
              >
                {/* Row top */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: FW.espresso, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.name || <span style={{ color: FW.muted, fontStyle: "italic" }}>Untitled</span>}
                    </p>
                    {row.preview_text && (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: FW.mutedText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.preview_text}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {pill(row.name_status)}
                    {!row.is_deleted && (
                      <button
                        onClick={() => softDelete(row.id)}
                        title="Soft delete"
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#EF4444", padding: 4, display: "flex", alignItems: "center" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 11, color: FW.muted }}>
                  {row.user_id && <span><span style={{ fontWeight: 600, color: FW.mutedText }}>user:</span> {row.user_id}</span>}
                  {row.agent_conv_id && <span><span style={{ fontWeight: 600, color: FW.mutedText }}>conv_id:</span> {row.agent_conv_id}</span>}
                  <span><span style={{ fontWeight: 600, color: FW.mutedText }}>messages:</span> {row.message_count ?? 0}</span>
                  <span><span style={{ fontWeight: 600, color: FW.mutedText }}>created:</span> {row.created_date ? new Date(row.created_date).toLocaleDateString("en-GB") : "—"}</span>
                  {row.is_deleted && <span style={{ color: "#EF4444", fontWeight: 700 }}>deleted</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}