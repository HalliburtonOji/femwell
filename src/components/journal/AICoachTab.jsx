import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, BookmarkPlus, ChevronRight, Loader2, Settings2, BarChart2, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CoachSettingsSheet from "../coach/CoachSettingsSheet";
import CycleSymptomDashboard from "./CycleSymptomDashboard";

const TOPICS = [
  { id: "womens_health", label: "Women's Health", emoji: "🌸" },
  { id: "cycle_pms", label: "Cycle & PMS", emoji: "🌙" },
  { id: "sleep", label: "Sleep", emoji: "💤" },
  { id: "stress", label: "Stress", emoji: "🌊" },
  { id: "relationships", label: "Relationships", emoji: "💛" },
  { id: "habits", label: "Habits", emoji: "🔥" },
  { id: "programs", label: "Programs", emoji: "🗺️" },
  { id: "nutrition", label: "Nutrition", emoji: "🍽️" },
];

const ARCHETYPE_LABELS = {
  empathetic: "Empathetic Listener",
  motivator: "Direct Motivator",
  analyst: "Data-Driven Analyst",
  nurturing: "Gentle Nurturer",
  bestie: "Your Twin / Bestie 👯",
};

const DEFAULT_STARTERS = [
  "How am I doing this week? 🌸",
  "I'm feeling tired today",
  "Help with PMS symptoms",
  "I need a habit idea",
  "How's my sleep looking?",
  "I'm feeling stressed",
];

function parseOptions(content) {
  if (!content) return { text: content, options: [] };
  const match = content.match(/```options\s*\n([\s\S]*?)\n```/);
  if (!match) return { text: content, options: [] };
  try {
    const options = JSON.parse(match[1].trim());
    const text = content.replace(/```options\s*\n[\s\S]*?\n```/, "").trim();
    return { text, options: Array.isArray(options) ? options : [] };
  } catch {
    return { text: content, options: [] };
  }
}

export default function AICoachTab({ user }) {
  const [coachView, setCoachView] = useState("chat"); // "chat" | "dashboard"
  const [profile, setProfile] = useState(null);
  const [topic, setTopic] = useState("womens_health");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeJournal, setIncludeJournal] = useState(true);
  const [includeCheckins, setIncludeCheckins] = useState(true);
  const [includeCycle, setIncludeCycle] = useState(true);
  const [includeHabits, setIncludeHabits] = useState(true);
  const [includePrograms, setIncludePrograms] = useState(true);
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [coachPrefs, setCoachPrefs] = useState({
    coach_name: user.coach_name || "Luna",
    coach_archetype: user.coach_archetype || "empathetic",
    coach_tone: user.coach_tone || "Warm",
  });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    (async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      if (profiles[0]) setProfile(profiles[0]);
    })();
  }, [user]);

  // Load existing conversation for this topic from localStorage
  useEffect(() => {
    const loadConversation = async () => {
      const storageKey = `coach_convo_${user.id}_${topic}`;
      const savedId = localStorage.getItem(storageKey);
      if (!savedId) { setConversation(null); setMessages([]); return; }
      setLoadingHistory(true);
      try {
        const convo = await base44.agents.getConversation(savedId);
        if (convo && convo.messages?.length > 0) {
          setConversation(convo);
          // Deduplicate: only keep user messages with style prefix stripped + assistant messages
          const cleaned = convo.messages.map((m) => ({
            ...m,
            content: m.role === "user" ? m.content.replace(/^\[Coaching style:.*?\]\n\n/, "") : m.content,
          }));
          setMessages(cleaned);
        } else {
          setConversation(null);
          setMessages([]);
        }
      } catch {
        localStorage.removeItem(storageKey);
        setConversation(null);
        setMessages([]);
      }
      setLoadingHistory(false);
    };
    loadConversation();
  }, [topic, user.id]);

  const coachName = coachPrefs.coach_name || "Luna";
  const archetypeLabel = ARCHETYPE_LABELS[coachPrefs.coach_archetype] || "Empathetic Listener";

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
          agent_name: "personal_assistant",
          metadata: { topic, tone: coachPrefs.coach_tone, archetype: coachPrefs.coach_archetype },
        });
        setConversation(convo);
        localStorage.setItem(`coach_convo_${user.id}_${topic}`, convo.id);
      }

      const contextNote = [];
      if (includeJournal) contextNote.push("journal entries");
      if (includeCheckins) contextNote.push("check-ins");
      if (includeCycle) contextNote.push("cycle data");
      if (includeHabits) contextNote.push("habit logs");
      if (includePrograms) contextNote.push("program progress");
      if (includeNutrition) contextNote.push("nutrition logs");

      const styleNote = `[Coaching style: ${archetypeLabel}. Tone: ${coachPrefs.coach_tone}.${contextNote.length > 0 ? ` Use context from my ${contextNote.join(", ")} if relevant.` : " Respond with general health and wellness advice if no user data is available."}]`;
      const fullPrompt = `${styleNote}\n\n${questionText}`;

      // Subscribe to streaming updates
      const unsubscribe = base44.agents.subscribeToConversation(convo.id, (data) => {
        const allMsgs = data.messages || [];
        const assistantMsgs = allMsgs.filter((m) => m.role === "assistant");
        const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
        if (lastAssistant?.content) {
          setMessages((prev) => {
            const withoutLast = prev.filter((m) => m.role !== "assistant" || prev.indexOf(m) < prev.length - 1 || m !== prev[prev.length - 1]);
            // Replace or append the streaming assistant message
            const lastIdx = withoutLast.map((m) => m.role).lastIndexOf("assistant");
            if (lastIdx >= 0 && withoutLast[lastIdx].content !== lastAssistant.content) {
              const updated = [...withoutLast];
              updated[lastIdx] = lastAssistant;
              return updated;
            }
            if (lastIdx === -1) return [...withoutLast, lastAssistant];
            return withoutLast;
          });
        }
      });

      await base44.agents.addMessage(convo, { role: "user", content: fullPrompt });
      unsubscribe();

      // Final state: fetch latest convo
      const finalConvo = await base44.agents.getConversation(convo.id);
      const finalMsgs = finalConvo.messages || [];
      const assistantMsgs = finalMsgs.filter((m) => m.role === "assistant");
      const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
      if (lastAssistant) {
        setMessages((prev) => {
          const lastIdx = prev.map((m) => m.role).lastIndexOf("assistant");
          if (lastIdx >= 0) {
            const updated = [...prev];
            updated[lastIdx] = lastAssistant;
            return updated;
          }
          return [...prev, lastAssistant];
        });
      }
      setConversation(finalConvo);
    } catch (e) {
      console.error("AI Coach error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again." }]);
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
      {/* View switcher */}
      <div className="flex gap-1 mb-4 bg-white/60 rounded-2xl p-1">
        <button
          onClick={() => setCoachView("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${coachView === "chat" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Chat
        </button>
        <button
          onClick={() => setCoachView("dashboard")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${coachView === "dashboard" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
        >
          <BarChart2 className="w-3.5 h-3.5" /> Insights
        </button>
      </div>

      {showSettings && (
        <CoachSettingsSheet
          user={{ ...user, ...coachPrefs }}
          onClose={() => setShowSettings(false)}
          onSaved={(prefs) => {
            setCoachPrefs(prefs);
            setConversation(null);
            setMessages([]);
          }}
        />
      )}

      {coachView === "dashboard" ? (
        <CycleSymptomDashboard user={user} profile={profile} />
      ) : (
        <>
          {/* Coach header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-sm">
                🌸
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{coachName}</p>
                <p className="text-[10px] text-gray-400">{archetypeLabel}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-rose-50 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Customise</span>
            </button>
          </div>

          {/* Topic chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTopic(t.id); }}
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
              { label: "Habits", state: includeHabits, set: setIncludeHabits },
              { label: "Programs", state: includePrograms, set: setIncludePrograms },
              { label: "Nutrition", state: includeNutrition, set: setIncludeNutrition },
            ].map(({ label, state, set }) => (
              <button
                key={label}
                onClick={() => set((v) => !v)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                  state ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400 line-through"
                }`}
              >
                {state ? "✓ " : ""}{label}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 max-h-96">
            {loadingHistory && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-rose-300 animate-spin" />
              </div>
            )}
            {!loadingHistory && messages.length === 0 && (
              <div className="py-4">
                <div className="text-center mb-4 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">🌸</p>
                  <p className="font-medium text-gray-600">Ask {coachName} anything</p>
                  <p className="text-xs mt-1">{archetypeLabel} · {coachPrefs.coach_tone} tone</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_STARTERS.map((q) => (
                    <button
                      key={q}
                      onClick={() => startOrContinue(q)}
                      className="text-left text-xs px-3 py-2.5 rounded-2xl bg-white/80 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border border-rose-100 transition-all font-medium leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!loadingHistory && messages.map((msg, i) => {
              if (msg.role === "assistant") {
                const { text, options } = parseOptions(msg.content);
                const isLast = i === messages.length - 1;
                return (
                  <div key={i} className="flex flex-col items-start gap-2">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-white/90 text-gray-700 shadow-sm border border-rose-50">
                      <ReactMarkdown
                        className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                        components={{
                          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="text-rose-700">{children}</strong>,
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    </div>
                    {isLast && options.length > 0 && !loading && (
                      <div className="flex flex-wrap gap-2 ml-1">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => startOrContinue(opt)}
                            className="text-xs px-3 py-2 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-medium transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 text-sm bg-rose-500 text-white">
                    <p>{msg.content.replace(/^\[Coaching style:.*?\]\n\n/, "")}</p>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/90 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-rose-50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                  <span className="text-xs text-gray-400">{coachName} is thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

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
              placeholder={`Ask ${coachName}…`}
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
        </>
      )}
    </div>
  );
}