import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Loader2, Pencil, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function threadTitle(convo) {
  const msgs = convo?.messages || [];
  const first = msgs.find(m => m.role === "user");
  if (!first) return "New conversation";
  const cleaned = first.content.replace(/^\[Guide style:.*?\]\n\n/, "").trim();
  return cleaned.length > 48 ? cleaned.slice(0, 48) + "…" : cleaned;
}

function threadDate(convo) {
  const ts = convo?.updated_date || convo?.created_date;
  if (!ts) return "";
  try { return formatDistanceToNow(new Date(ts), { addSuffix: true }); }
  catch { return ""; }
}

const sLabel = {
  fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function GuideThreadSidebar({
  activeConversationId,
  onSelect,
  onNewThread,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.agents.listConversations({ agent_name: "personal_assistant" });
      setThreads((list || []).sort((a, b) => {
        const da = a.updated_date || a.created_date || "";
        const db = b.updated_date || b.created_date || "";
        return db.localeCompare(da);
      }));
    } catch { setThreads([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeConversationId]);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const handleRename = (convo) => {
    setEditingId(convo.id);
    setEditingTitle(threadTitle(convo));
  };

  const commitRename = async (id) => {
    if (editingTitle.trim()) {
      try {
        await base44.agents.updateConversation(id, { metadata: { custom_title: editingTitle.trim() } });
        await load();
      } catch {}
    }
    setEditingId(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-5"
        style={{ borderBottom: "1px solid var(--border)" }}>
        {!collapsed && (
          <div>
            <p style={sLabel} className="mb-0.5">Conversations</p>
            <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>Guide history</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ml-auto transition-colors"
          style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* New thread button */}
          <div className="px-3 pt-3 pb-2">
            <button onClick={onNewThread}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
              <Plus className="w-3.5 h-3.5" />
              New conversation
            </button>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--mauve-light)" }} />
              </div>
            ) : threads.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-xs" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No conversations yet</p>
              </div>
            ) : (
              threads.map(convo => {
                const isActive = convo.id === activeConversationId;
                const title = convo.metadata?.custom_title || threadTitle(convo);
                const date = threadDate(convo);
                return (
                  <div key={convo.id}
                    className="group rounded-xl px-3 py-2.5 cursor-pointer transition-all relative"
                    style={{
                      backgroundColor: isActive ? "var(--plum)" : "transparent",
                      color: isActive ? "white" : "var(--plum)",
                    }}
                    onClick={() => { onSelect(convo.id); onCloseMobile?.(); }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--ivory-dark)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: isActive ? "rgba(255,255,255,0.6)" : "var(--mauve)" }} />
                      <div className="flex-1 min-w-0">
                        {editingId === convo.id ? (
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <input
                              ref={editRef}
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") commitRename(convo.id); if (e.key === "Escape") setEditingId(null); }}
                              className="flex-1 text-xs bg-transparent border-b outline-none font-medium"
                              style={{ borderColor: isActive ? "rgba(255,255,255,0.4)" : "var(--border)", color: isActive ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }} />
                            <button onClick={() => commitRename(convo.id)}>
                              <Check className="w-3 h-3" style={{ color: isActive ? "rgba(255,255,255,0.7)" : "var(--sage)" }} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-medium leading-snug truncate"
                              style={{ color: isActive ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                              {title}
                            </p>
                            {date && (
                              <p className="text-[10px] mt-0.5" style={{ color: isActive ? "rgba(255,255,255,0.5)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                                {date}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      {!editingId && (
                        <button
                          onClick={e => { e.stopPropagation(); handleRename(convo); }}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                          style={{ color: isActive ? "rgba(255,255,255,0.5)" : "var(--mauve)" }}>
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col h-full transition-all duration-200 flex-shrink-0"
        style={{
          width: collapsed ? "52px" : "220px",
          backgroundColor: "var(--surface)",
          borderRight: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(42,32,53,0.35)", backdropFilter: "blur(4px)" }}
            onClick={onCloseMobile} />
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col"
            style={{ backgroundColor: "var(--surface)", borderRight: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}