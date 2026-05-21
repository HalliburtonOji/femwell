import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, Send, Loader2, PanelLeft, Sparkles } from "lucide-react";
import GuideVoiceMode from "../guide/GuideVoiceMode";
import GuideThreadSidebar from "../guide/GuideThreadSidebar";
import ReactMarkdown from "react-markdown";
import AssistantGreetingCard from "./AssistantGreetingCard";

// FemWell tokens — keep aligned with the design system.
const FW = {
  cream:     "#F4EDDB",
  paper:     "#FBF6E6",
  espresso:  "#3A2C1A",
  espressoDeep: "#2A1E0E",
  blush:     "#E8B4B8",
  sage:      "#8FAF8F",
  muted:     "#9B8B7A",
  mutedText: "#6B5B4E", // WCAG AA on cream
  gold:      "#D4AF37",
  goldDeep:  "#A6862B",
  chipBg:    "#EDE6D5",
  chipBorder:"#D4C9B4",
};

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
          style={{
            fontSize: 12, color: FW.espresso,
            backgroundColor: FW.chipBg,
            border: `1px solid ${FW.chipBorder}`,
            borderRadius: 20, padding: "6px 14px", minHeight: 32,
            cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600,
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// Derive cycle phase from UserProfile (same shape as derivePlannerPhase
// in PlannerV2Shell + jessContext). Returns { phase, dayInCycle } or
// { phase: null, dayInCycle: null } when last_period_start_date is missing.
function deriveCyclePhase(profile) {
  if (!profile?.last_period_start_date) return { phase: null, dayInCycle: null };
  const cycleLen  = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length    || 5;
  const start = new Date(profile.last_period_start_date);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
  const raw = Math.floor((t - startDay) / 86400000) + 1;
  const normDay = ((raw - 1) % cycleLen + cycleLen) % cycleLen + 1;
  let phase;
  if (normDay <= periodLen) phase = "menstrual";
  else if (normDay <= Math.floor(cycleLen * 0.43)) phase = "follicular";
  else if (normDay <= Math.floor(cycleLen * 0.5))  phase = "ovulatory";
  else phase = "luteal";
  return { phase, dayInCycle: normDay };
}

const PHASE_DOT = {
  menstrual:  "#8B2635",
  follicular: "#C17B4E",
  ovulatory:  "#C4933F",
  luteal:     "#5B4A8A",
};

// MHRA disclaimer rendered below every Jess bubble.
function BubbleDisclaimer() {
  return (
    <p style={{
      fontSize: 10, fontStyle: "italic", color: FW.muted,
      margin: "4px 0 0 4px", lineHeight: 1.4,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      Not medical advice. Always consult a healthcare professional.
    </p>
  );
}

// Compute consecutive-day chat streak from conversations[]. Uses the
// max(created_date, updated_date) day of each row; counts back from today
// until a gap.
function computeChatStreak(conversations) {
  if (!Array.isArray(conversations) || conversations.length === 0) return 0;
  const days = new Set();
  for (const c of conversations) {
    const t = c?.updated_date || c?.created_date;
    if (!t) continue;
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) continue;
    days.add(d.toISOString().split("T")[0]);
  }
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function AssistantPanel({ initialPrompt, embedded = false, uiMode = "page" }) {  // uiMode: "page" | "overlay"
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [assistantName, setAssistantName] = useState("Guide");
  const [userProfile, setUserProfile] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [listeningVoice, setListeningVoice] = useState(false);
  // Context strip + memory banner state.
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [chatStreak, setChatStreak] = useState(0);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  const startVoiceInput = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-GB";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setListeningVoice(false); };
    recognition.onerror = () => setListeningVoice(false);
    recognition.onend = () => setListeningVoice(false);
    setListeningVoice(true);
    recognition.start();
  };

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      const today = new Date().toISOString().split("T")[0];
      const [profiles, checkins, convos] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        base44.entities.DailyCheckins.filter({ user_id: u.id, date: today }).catch(() => []),
        base44.agents.listConversations({ agent_name: "personal_assistant" }).catch(() => []),
      ]);
      if (profiles[0]) {
        setUserProfile(profiles[0]);
        if (profiles[0].ai_assistant_name) setAssistantName(profiles[0].ai_assistant_name);
      }
      if (checkins[0]) setTodayCheckin(checkins[0]);
      setChatStreak(computeChatStreak(convos || []));
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

  // Derived context for the strip — phase + today's mood/energy.
  const { phase, dayInCycle } = deriveCyclePhase(userProfile);
  const moodNum   = todayCheckin?.mood   ?? todayCheckin?.mood_score   ?? null;
  const energyNum = todayCheckin?.energy ?? todayCheckin?.energy_level ?? null;
  const phaseTone = phase ? PHASE_DOT[phase] : FW.muted;

  return (
    <div style={{ height: "100%", display: "flex", overflow: "hidden", background: FW.cream }}>
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
        {/* Top bar — espresso brand bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: FW.espresso, color: FW.cream,
          flexShrink: 0,
        }}>
          {!embedded && (
            <button onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open conversations"
              className="lg:hidden"
              style={{ border: "none", background: "transparent", cursor: "pointer", color: FW.cream, padding: 4, minHeight: 32 }}>
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <h2 style={{
            flex: 1, margin: 0, fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 17, fontWeight: 600, letterSpacing: "-0.005em",
          }}>{assistantName}</h2>
          {!embedded && (
            <button onClick={() => createNewConversation()}
              aria-label="New conversation"
              style={{
                fontSize: 11, fontWeight: 700, color: FW.cream,
                background: "rgba(244,237,219,0.10)",
                border: "1px solid rgba(244,237,219,0.25)",
                borderRadius: 9999, padding: "6px 12px", minHeight: 32,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
              }}>+ New</button>
          )}
          <button onClick={() => setShowVoice(true)}
            aria-label="Voice mode"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: FW.espresso,
              background: FW.gold, border: "none",
              borderRadius: 9999, padding: "8px 14px", minHeight: 36,
              cursor: "pointer", fontFamily: "'Inter', sans-serif", flexShrink: 0,
            }}>
            <Mic className="w-3.5 h-3.5" /> Voice
          </button>
        </div>

        {/* Memory banner — espresso-deep slim bar */}
        <div style={{
          background: FW.espressoDeep, color: FW.cream,
          padding: "6px 16px", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 8, flexShrink: 0,
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.04em",
          }}>
            <Sparkles size={11} style={{ color: FW.gold }} aria-hidden /> Jess remembers you
          </span>
          {chatStreak >= 1 && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 700,
              color: "#FFE3C2", fontFamily: "'Inter', sans-serif",
            }} aria-label={`${chatStreak}-day conversation streak`}>
              <span aria-hidden>🔥</span>{chatStreak}-day streak
            </span>
          )}
        </div>

        {/* Context strip — phase / mood / energy at a glance */}
        {(phase || moodNum != null || energyNum != null) && (
          <div style={{
            background: FW.paper, borderBottom: `1px solid ${FW.chipBorder}`,
            padding: "8px 16px",
            display: "flex", alignItems: "center", gap: 14,
            fontSize: 11, fontFamily: "'Inter', sans-serif",
            color: FW.mutedText, flexShrink: 0,
          }} aria-label="Today's context">
            {phase && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: phaseTone }} />
                <span style={{ fontWeight: 600, color: FW.espresso }}>
                  {phase[0].toUpperCase() + phase.slice(1)}{dayInCycle ? ` · Day ${dayInCycle}` : ""}
                </span>
              </span>
            )}
            {moodNum != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: FW.sage }} />
                Mood {moodNum}/5
              </span>
            )}
            {energyNum != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: FW.blush }} />
                Energy {energyNum}/5
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "16px 14px 8px",
          display: "flex", flexDirection: "column", gap: 10,
          background: FW.cream,
        }}>
          {loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: FW.muted }} />
            </div>
          ) : (
            <>
              {messages.length === 0 && !assistantTyping && (
                <AssistantGreetingCard
                  assistantName={assistantName}
                  profile={userProfile}
                  onSendPrompt={sendMessage}
                />
              )}
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                const { text, options } = parseOptions(msg.content);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "82%",
                      borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      padding: "10px 14px",
                      fontSize: 13, lineHeight: 1.6,
                      fontFamily: "'Inter', sans-serif",
                      backgroundColor: isUser ? FW.blush : FW.espresso,
                      color: isUser ? FW.espresso : FW.cream,
                      border: isUser ? "none" : "none",
                      boxShadow: isUser ? "none" : "0 2px 8px rgba(58,44,26,0.10)",
                    }}>
                      {isUser ? text : (
                        <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{text || ""}</ReactMarkdown>
                      )}
                    </div>
                    {!isUser && <BubbleDisclaimer />}
                    {!isUser && options.length > 0 && <OptionsBar options={options} onSelect={sendMessage} />}
                  </div>
                );
              })}
              {assistantTyping && (
                <div style={{ display: "flex" }}>
                  <div style={{
                    borderRadius: "18px 18px 18px 4px",
                    padding: "10px 16px",
                    backgroundColor: FW.espresso, color: FW.cream,
                    display: "flex", gap: 4, alignItems: "center",
                  }}>
                    {[0, 1, 2].map(n => <div key={n} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: FW.cream, opacity: 0.7, animation: `fw-bounce 1s ${n * 0.15}s infinite` }} />)}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "10px 14px",
          background: FW.cream,
          borderTop: `1px solid ${FW.chipBorder}`,
          display: "flex", gap: 8, flexShrink: 0,
        }}>
          <button
            onClick={startVoiceInput}
            disabled={assistantTyping || loading || listeningVoice}
            aria-label="Voice input"
            style={{
              border: `1px solid ${FW.chipBorder}`,
              borderRadius: 14, minWidth: 44, minHeight: 44,
              backgroundColor: listeningVoice ? FW.gold : FW.paper,
              padding: "0 12px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
            title="Voice input"
          >
            <Mic className="w-4 h-4" style={{ color: listeningVoice ? FW.espresso : FW.espresso }} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={listeningVoice ? "Listening…" : `Message ${assistantName}…`}
            disabled={assistantTyping || loading}
            aria-label={`Message ${assistantName}`}
            style={{
              flex: 1, borderRadius: 14,
              border: `1px solid ${FW.chipBorder}`,
              backgroundColor: FW.paper,
              padding: "11px 14px", minHeight: 44,
              fontSize: 13, color: FW.espresso,
              fontFamily: "'Inter', sans-serif",
              outline: "none", opacity: assistantTyping ? 0.6 : 1,
            }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || assistantTyping || loading}
            aria-label="Send message"
            style={{
              border: "none", borderRadius: 14,
              backgroundColor: FW.gold, color: FW.espresso,
              padding: "0 18px", minWidth: 44, minHeight: 44,
              cursor: "pointer",
              opacity: (!input.trim() || assistantTyping) ? 0.4 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}