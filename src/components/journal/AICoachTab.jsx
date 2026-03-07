import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, BookmarkPlus, ChevronRight, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const TOPICS = [
  { id: "womens_health", label: "Women's Health", emoji: "🌸" },
  { id: "cycle_pms", label: "Cycle & PMS", emoji: "🌙" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "stress", label: "Stress", emoji: "🌊" },
  { id: "relationships", label: "Relationships", emoji: "💛" },
];

const TONES = ["Gentle", "Calm", "Straight talk"];

const FOLLOW_UPS = [
  "What should I try today?",
  "Can you explain more?",
  "Are there any sessions for this?",
  "When should I see a doctor?",
];

export default function AICoachTab({ user }) {
  const [topic, setTopic] = useState("womens_health");
  const [tone, setTone] = useState("Gentle");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeJournal, setIncludeJournal] = useState(true);
  const [includeCheckins, setIncludeCheckins] = useState(true);
  const [includeCycle, setIncludeCycle] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startOrContinue = async (questionText) => {
    if (!questionText.trim()) return;
    setLoading(true);
    setSaved(false);

    const userMsg = { role: "user", content: questionText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      let convo = conversation;
      if (!convo) {
        convo = await base44.agents.createConversation({
          agent_name: "womens_health_coach",
          metadata: { topic, tone },
        });
        setConversation(convo);
      }

      const contextNote = [];
      if (includeJournal) contextNote.push("journal entries");
      if (includeCheckins) contextNote.push("check-ins");
      if (includeCycle) contextNote.push("cycle data");

      const fullPrompt = contextNote.length > 0
        ? `[Tone: ${tone}. Use context from my ${contextNote.join(", ")} if relevant.]\n\n${questionText}`
        : `[Tone: ${tone}]\n\n${questionText}`;

      const updatedConvo = await base44.agents.addMessage(convo, {
        role: "user",
        content: fullPrompt,
      });

      const assistantMsg = updatedConvo.messages?.slice(-1)[0];
      if (assistantMsg?.role === "assistant") {
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setConversation(updatedConvo);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastUser || !lastAssistant) return;
    await base44.entities.AdviceHistory.create({
      user_id: user.id,
      topic,
      question: lastUser.content,
      advice_summary: lastAssistant.content?.slice(0, 500),
      saved_at: new Date().toISOString(),
    });
    setSaved(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Topic chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTopic(t.id); setConversation(null); setMessages([]); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              topic === t.id ? "bg-rose-500 text-white shadow-sm" : "bg-white/80 text-gray-600 hover:bg-rose-50"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Context toggles */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-400">Using:</span>
        {[
          { label: "Journal", state: includeJournal, set: setIncludeJournal },
          { label: "Check-ins", state: includeCheckins, set: setIncludeCheckins },
          { label: "Cycle", state: includeCycle, set: setIncludeCycle },
        ].map(({ label, state, set }) => (
          <button
            key={label}
            onClick={() => set((v) => !v)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
              state ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400 line-through"
            }`}
          >
            {state ? "✓" : ""} {label}
          </button>
        ))}

        {/* Tone selector */}
        <div className="ml-auto flex gap-1">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`text-xs px-2 py-1 rounded-full transition-all ${
                tone === t ? "bg-rose-100 text-rose-600 font-semibold" : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-96">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            <p className="text-3xl mb-3">🌸</p>
            <p className="font-medium text-gray-600">Ask Luna anything</p>
            <p className="text-xs mt-1">Your personal women's health coach</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-rose-500 text-white rounded-br-sm"
                  : "bg-white/90 text-gray-700 shadow-sm border border-rose-50 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                  components={{
                    p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="text-rose-700">{children}</strong>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content.replace(/^\[Tone:.*?\]\n\n/, "")}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/90 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-rose-50 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
              <span className="text-xs text-gray-400">Luna is thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Follow-up quick buttons */}
      {messages.length > 0 && !loading && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
          {FOLLOW_UPS.map((q) => (
            <button
              key={q}
              onClick={() => startOrContinue(q)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 whitespace-nowrap flex-shrink-0 transition-colors"
            >
              {q} <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Save advice */}
      {messages.some((m) => m.role === "assistant") && !loading && (
        <button
          onClick={handleSave}
          disabled={saved}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-rose-500 transition-colors mb-3 disabled:text-emerald-500"
        >
          <BookmarkPlus className="w-4 h-4" />
          {saved ? "Saved to Advice History ✓" : "Save this advice"}
        </button>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startOrContinue(input); } }}
          placeholder="Ask your coach…"
          rows={2}
          className="flex-1 p-3 rounded-2xl border border-rose-100 bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-700"
        />
        <button
          onClick={() => startOrContinue(input)}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-2xl bg-rose-500 flex items-center justify-center disabled:opacity-40 hover:bg-rose-600 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}