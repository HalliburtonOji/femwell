import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, Send, Loader2, PanelLeft } from "lucide-react";
import GuideVoiceMode from "../guide/GuideVoiceMode";
import GuideThreadSidebar from "../guide/GuideThreadSidebar";
import ReactMarkdown from "react-markdown";

function parseOptions(content) {
  const match = content?.match(/```options\n(\[[\s\S]*?\])\n```/);
  if (!match) return { text: content, options: [] };
  try {
    const options = JSON.parse(match[1]);
    return { text: content.replace(/```options\n[\s\S]*?\n```/, "").trim(), options };
  } catch {
    return { text: content, options: [] };
  }
}

function OptionsBar({ options, onSelect }) {
  if (!options?.length) return null;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "4px 0 0 0" }}>
      {options.map((opt, i) => (
        <button key={i} onClick={() => onSelect(opt)}
          style={{ fontSize: 12, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 9999, padding: "4px 12px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function AssistantPanel({ initialPrompt, embedded = false, uiMode = "page" }) {  // uiMode: "page" | "overlay"
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [assistantName, setAssistantName] = useState("Guide");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
      if (profiles[0]?.ai_assistant_name) setAssistantName(profiles[0].ai_assistant_name);
    }).catch(() => {});
  }, []);

  const subscribeToConversation = useCallback((id) => {
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = base44.agents.subscribeToConversation(id, (data) => {
      setMessages(data.messages || []);
      const last = (data.messages || []).slice(-1)[0];
      if (last?.role === "assistant") setAssistantTyping(false);
    });
  }, []);

  const loadConversation = useCallback(async (id) => {
    setLoading(true);
    const convo = await base44.agents.getConversation(id);
    setConversationId(id);
    setMessages(convo.messages || []);
    subscribeToConversation(id);
    setLoading(false);
  }, [subscribeToConversation]);

  const createNewConversation = useCallback(async (firstMsg) => {
    setLoading(true);
    const convo = await base44.agents.createConversation({ agent_name: "personal_assistant" });
    setConversationId(convo.id);
    setMessages([]);
    subscribeToConversation(convo.id);
    if (firstMsg) {
      setAssistantTyping(true);
      await base44.agents.addMessage(convo, { role: "user", content: firstMsg });
    }
    setLoading(false);
    return convo;
  }, [subscribeToConversation]);

  useEffect(() => {
    (async () => {
      if (initialPrompt) {
        await createNewConversation(initialPrompt);
        return;
      }
      if (embedded) {
        await createNewConversation();
        return;
      }
      const convos = await base44.agents.listConversations({ agent_name: "personal_assistant" }).catch(() => []);
      const sorted = (convos || []).sort((a, b) => (b.updated_date || "").localeCompare(a.updated_date || ""));
      if (sorted.length > 0) {
        await loadConversation(sorted[0].id);
      } else {
        await createNewConversation();
      }
    })();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assistantTyping]);

  const sendMessage = async (textOverride) => {
    const msg = (textOverride || input).trim();
    if (!msg || !conversationId || assistantTyping) return;
    if (!textOverride) setInput("");
    setAssistantTyping(true);
    const convo = await base44.agents.getConversation(conversationId);
    await base44.agents.addMessage(convo, { role: "user", content: msg });
  };

  const voiceInstructions = `You are ${assistantName}, the FemWell wellness guide. You're warm, direct and concise. Keep voice replies short and conversational. Skip the options block in voice mode.`;

  if (showVoice) {
    return (
      <GuideVoiceMode
        guideName={assistantName}
        voiceId="shimmer"
        instructions={voiceInstructions}
        onClose={() => setShowVoice(false)}
      />
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", overflow: "hidden" }}>
      <style>{`@keyframes fw-bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)} }`}</style>

      {!embedded && (
        <GuideThreadSidebar
          activeConversationId={conversationId}
          onSelect={loadConversation}
          onNewThread={() => createNewConversation()}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          {!embedded && (
            <button onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden"
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--mauve)", padding: 4 }}>
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <div style={{ flex: 1 }}>
            {!embedded && (
              <button onClick={() => createNewConversation()}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)", borderRadius: 9999, padding: "4px 12px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                + New
              </button>
            )}
          </div>
          <button onClick={() => setShowVoice(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "white", backgroundColor: "var(--rose-dust)", border: "none", borderRadius: 9999, padding: "7px 14px", cursor: "pointer", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
            <Mic className="w-3.5 h-3.5" /> Voice
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--mauve-light)" }} />
            </div>
          ) : (
            <>
              {messages.length === 0 && !assistantTyping && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65 }}>
                    Hi, I'm {assistantName}. Ask me anything — your cycle, programs, nutrition, habits, or whatever's on your mind.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                const { text, options } = parseOptions(msg.content);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "82%", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", fontSize: 13, lineHeight: 1.6, fontFamily: "'Inter', sans-serif", backgroundColor: isUser ? "var(--plum)" : "var(--ivory)", color: isUser ? "white" : "var(--plum)", border: isUser ? "none" : "1px solid var(--border)" }}>
                      {isUser ? text : (
                        <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{text || ""}</ReactMarkdown>
                      )}
                    </div>
                    {!isUser && options.length > 0 && <OptionsBar options={options} onSelect={sendMessage} />}
                  </div>
                );
              })}
              {assistantTyping && (
                <div style={{ display: "flex" }}>
                  <div style={{ borderRadius: "18px 18px 18px 4px", padding: "10px 16px", backgroundColor: "var(--ivory)", border: "1px solid var(--border)", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 1, 2].map(n => <div key={n} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--mauve-light)", animation: `fw-bounce 1s ${n * 0.15}s infinite` }} />)}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8, flexShrink: 0 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Message ${assistantName}…`}
            disabled={assistantTyping || loading}
            style={{ flex: 1, borderRadius: 14, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", padding: "11px 14px", fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", outline: "none", opacity: assistantTyping ? 0.6 : 1 }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || assistantTyping || loading}
            style={{ border: "none", borderRadius: 14, backgroundColor: "var(--plum)", color: "white", padding: "0 16px", cursor: "pointer", opacity: (!input.trim() || assistantTyping) ? 0.4 : 1, display: "flex", alignItems: "center" }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}