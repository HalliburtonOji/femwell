import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { saveItem } from "@/lib/savedItems";
import {
  Send, BookmarkPlus, Loader2, Settings2, Mic,
  CheckCircle2, PanelLeft
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import GuideSettingsSheet from "../coach/CoachSettingsSheet";
import GuideThreadSidebar from "../guide/GuideThreadSidebar";
import GuideVoiceMode from "../guide/GuideVoiceMode";

// ── Intent detection — deterministic action router ────────────────────────
function detectIntent(text) {
  const t = text.toLowerCase().trim();

  // Hydration
  const waterMatch = t.match(/(\d+)\s*(ml|litre|liter|l\b)/) ||
    t.match(/(\d+)\s*glass/) ||
    (/(log|add|drank?|had|drink).*water/.test(t) ? ['', '1', 'glass'] : null);
  if (waterMatch && /(log|add|drank?|had|drink|glass|water|hydrat)/.test(t)) {
    let ml = 250;
    if (waterMatch[2] === 'ml') ml = parseInt(waterMatch[1]);
    else if (/litre|liter|^l$/.test(waterMatch[2])) ml = parseInt(waterMatch[1]) * 1000;
    else if (waterMatch[1]) ml = parseInt(waterMatch[1]) * 250;
    return { action: 'log_hydration', payload: { amount_ml: ml } };
  }

  // Medication — extract drug name and dose regardless of order
  // e.g. "log a 100mg of paracetamol" or "took paracetamol 500mg" or "log paracetamol 100mg"
  if (/(log|took?|taken|i had|give me).*(mg|ml|mcg|tablet|pill|capsule|paracetamol|ibuprofen|aspirin|metformin|medication|supplement|[a-z]+cin|[a-z]+pam|[a-z]+ol\b)/.test(t)) {
    // Extract dose (e.g. 100mg, 500 mg)
    const doseMatch = t.match(/(\d+\s*(?:mg|ml|mcg|g))/i);
    // Extract known drug name — prefer explicit drug names over generic words
    const nameMatch = t.match(/(paracetamol|ibuprofen|aspirin|metformin|omeprazole|sertraline|fluoxetine|amoxicillin|diazepam|[a-z]{4,}(?:cin|pam|ol|in|an)\b)/i);
    // Fall back: last meaningful word that isn't a filler
    let itemName = nameMatch?.[0];
    if (!itemName) {
      const words = t.replace(/(log|took?|taken|i had|give me|a |an |of |for |today|mg|ml|mcg|\d+)/gi, ' ').trim().split(/\s+/).filter(w => w.length > 2);
      itemName = words[words.length - 1] || 'medication';
    }
    return { action: 'log_medication', payload: { item_name: itemName, dose: doseMatch?.[0]?.replace(/\s/g, '') || '' } };
  }

  // Symptom
  const symptomMatch = t.match(/log\s+([a-z ]+?)\s+(?:severity\s+)?(\d+)/i);
  if (symptomMatch && /(headache|cramp|pain|nausea|bloat|fatigue|anxiety|stress|mood)/.test(t)) {
    return { action: 'log_symptom', payload: { symptom_type: symptomMatch[1].trim(), severity: parseInt(symptomMatch[2]) } };
  }
  if (/(log).*(headache|cramp|pain|nausea|bloating|fatigue)/.test(t)) {
    const symMatch = t.match(/(headache|cramp|pain|nausea|bloating|fatigue|anxiety)/);
    const sevMatch = t.match(/(\d+)/);
    return { action: 'log_symptom', payload: { symptom_type: symMatch?.[0] || 'symptom', severity: sevMatch ? parseInt(sevMatch[0]) : 3 } };
  }

  // Cycle
  if (/(period start|my period started|log period|period began|menstruation)/.test(t)) {
    return { action: 'log_cycle_event', payload: { type: 'PeriodStart', flow_level: /heavy/.test(t) ? 'heavy' : /light/.test(t) ? 'light' : 'medium' } };
  }
  if (/(period end|my period ended|period stopped|period over)/.test(t)) {
    return { action: 'log_cycle_event', payload: { type: 'PeriodEnd' } };
  }
  if (/spotting/.test(t)) {
    return { action: 'log_cycle_event', payload: { type: 'Spotting' } };
  }

  // Habit
  if (/(mark|done|complete|finished|did).*(habit|water habit|sleep|meditation|workout|walk|steps|journaling)/.test(t)) {
    const habitMatch = t.match(/(water habit|sleep|meditation|workout|walk|steps|journaling|yoga|reading|exercise|[a-z]+ habit)/i);
    return { action: 'complete_habit', payload: { habit_name: habitMatch?.[0]?.replace(/ habit$/i, '').trim() || 'habit' } };
  }

  // Meal
  if (/(log|ate|had|eaten).*(breakfast|lunch|dinner|snack|meal)/.test(t) || /(log meal|log food|log what i ate)/.test(t)) {
    const mealTypeMatch = t.match(/(breakfast|lunch|dinner|snack)/);
    const mealText = text.replace(/^(log|i ate|i had|eaten?|log meal|log food)/i, '').trim();
    return { action: 'log_meal', payload: { meal_text: mealText || text, meal_type: mealTypeMatch?.[0] || 'meal' } };
  }

  // Program
  if (/(what.?s next|next (?:in my )?program|my program|program day|continue program)/.test(t)) {
    return { action: 'get_program_next', payload: {} };
  }

  // Content search
  if (/(suggest|find|something for|session for|quick session|breathing|meditation|workout|play).*(tonight|now|quick|calm|sleep|stress|energy|relax)/.test(t)) {
    const queryMatch = t.match(/(sleep|stress|calm|energy|anxiety|relax|breathing|focus|pms|cycle)/);
    return { action: 'search_content', payload: { query: queryMatch?.[0] || 'wellness', limit: 3 } };
  }

  return null; // fall through to agent
}

// ── Smart starters ──────────────────────────────────────────────────────────
const STARTERS = [
  { label: "Plan my day",                    action: "plan_day"   },
  { label: "Help me reset",                  action: "reset"      },
  { label: "What's next in my program?",     action: "program"    },
  { label: "Suggest something for tonight",  action: "suggest"    },
  { label: "Help with my cycle",             action: "cycle"      },
  { label: "Log something",                  action: "log"        },
];

const STARTER_PROMPTS = {
  plan_day:  "Help me plan my day based on what you know about me — my energy, upcoming program tasks, and anything I should focus on.",
  reset:     "I need a reset. What do you recommend for me right now based on my recent data?",
  program:   "What's next in my current program? Show me Day details and what I should do today.",
  suggest:   "Suggest something I can do tonight — a session, a breathing exercise, or a wind-down routine based on how I've been doing.",
  cycle:     "Based on my cycle data, where am I in my cycle and what should I be mindful of this week?",
  log:       "I want to log something — what can you help me track right now?",
};

const PENDING = "__guide_pending__";


// ── Action chip helper ──────────────────────────────────────────────────────
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

// ── Context label extractor ─────────────────────────────────────────────────
function extractContextLabel(content) {
  if (!content) return null;
  if (/journal/i.test(content)) return "From your Journal";
  if (/program|day \d/i.test(content)) return "From your Program";
  if (/cycle|period|phase/i.test(content)) return "From your Cycle data";
  if (/nutrition|meal|food|water|hydration/i.test(content)) return "From your Nutrition";
  if (/habit|check.in/i.test(content)) return "From your recent check-ins";
  return null;
}

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

// ── Main component ──────────────────────────────────────────────────────────
export default function AICoachTab({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [appContext, setAppContext] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [voicePrefs, setVoicePrefs] = useState({
    voice_id: user.voice_id || "shimmer",
    speaking_pace: user.speaking_pace || "normal",
    default_mode: user.default_mode || "text",
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coachPrefs, setCoachPrefs] = useState({
    coach_name: user.coach_name || "Guide",
    coach_archetype: user.coach_archetype || "empathetic",
    coach_tone: user.coach_tone || "Warm",
  });

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const conversationRef = useRef(null);
  const guideName = coachPrefs.coach_name || "Guide";
  const STYLE_MAP = {
    empathetic: "Warm & supportive",
    motivator:  "Direct & action-focused",
    analyst:    "Data-driven & evidence-based",
    nurturing:  "Gentle & holistic",
    bestie:     "Real & casual",
  };
  const styleDesc = STYLE_MAP[coachPrefs.coach_archetype] || "Warm & supportive";

  // Keep conversationRef in sync so voice callbacks always have the latest
  useEffect(() => { conversationRef.current = conversation; }, [conversation]);

  // Load live app context once on mount
  useEffect(() => {
    base44.functions.invoke("guideActions", { action: "get_context", payload: {} })
      .then(res => { if (res.data?.success) setAppContext(res.data.data); })
      .catch(() => {});
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load a conversation by ID
  const loadConversation = useCallback(async (id) => {
    setLoadingHistory(true);
    setMessages([]);
    setSaved(false);
    try {
      const convo = await base44.agents.getConversation(id);
      if (convo?.messages?.length > 0) {
        setConversation(convo);
        setMessages(convo.messages
          .filter(m => m.role === "user" || m.role === "assistant")
          .map(m => ({ ...m })));
      } else {
        setConversation(convo);
        setMessages([]);
      }
    } catch {
      setConversation(null);
      setMessages([]);
    }
    setLoadingHistory(false);
  }, []);

  // New thread
  const startNewThread = useCallback(() => {
    setConversation(null);
    setMessages([]);
    setSaved(false);
    setInput("");
  }, []);

  // Build voice instructions (used only for the Realtime API system prompt — never saved to thread)
  const buildVoiceInstructions = useCallback(() => {
    const ctx = appContext;
    const ctxParts = [];
    if (ctx?.active_program) ctxParts.push(`Active program: "${ctx.active_program.title}" Day ${ctx.active_program.current_day}.`);
    if (ctx?.today_checkin?.mood != null) ctxParts.push(`Today mood ${ctx.today_checkin.mood}/10, energy ${ctx.today_checkin.energy}/10.`);
    if (ctx?.hydration_today?.total_ml) ctxParts.push(`Hydration today: ${ctx.hydration_today.total_ml} ml.`);
    const ctxStr = ctxParts.length ? ` Context: ${ctxParts.join(' ')}` : '';
    return `You are ${guideName}, the private operational guide inside FemWell. Style: ${styleDesc}. Be concise, direct, warm. Act immediately when asked. Never ask for user ID.${ctxStr}`;
  }, [guideName, styleDesc, coachPrefs.coach_tone, appContext]);

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (questionText) => {
    if (!questionText?.trim() || loading) return;
    setLoading(true);
    setSaved(false);
    setInput("");

    // Show user bubble + pending assistant immediately
    const userMsg = { role: "user", content: questionText, id: `user_${Date.now()}` };
    const pendingMsg = { role: "assistant", content: "", id: PENDING };
    setMessages(prev => [...prev, userMsg, pendingMsg]);

    // ── Direct action router — bypass agent for deterministic commands
    const intent = detectIntent(questionText);
    if (intent) {
      try {
        const res = await base44.functions.invoke("guideActions", { action: intent.action, payload: intent.payload });
        const data = res.data || {};
        let replyText = data.message || (data.success ? "Done." : "Something went wrong — please try again.");
        if (intent.action === "search_content" && data.success && Array.isArray(data.data) && data.data.length > 0) {
          replyText = `Here's something that might help:\n\n${data.data.map(i => `**${i.title}** (${i.duration_minutes || "?"} min)`).join("\n")}`;
        }
        if (intent.action === "get_program_next" && data.success && data.data?.tasks?.length > 0) {
          replyText += `\n\nToday: ${data.data.tasks.map(t => t.title).join(", ")}.`;
        }
        setMessages(prev => prev.map(m =>
          m.id === PENDING ? { role: "assistant", content: replyText, id: `ast_${Date.now()}` } : m
        ));
        // Save to agent conversation so it appears in history
        try {
          let convo = conversationRef.current;
          if (!convo) {
            convo = await base44.agents.createConversation({
              agent_name: "personal_assistant",
              metadata: { tone: coachPrefs.coach_tone, archetype: coachPrefs.coach_archetype },
            });
            setConversation(convo);
            conversationRef.current = convo;
          }
          await base44.agents.addMessage(convo, { role: "user", content: questionText });
          await base44.agents.addMessage(convo, { role: "assistant", content: replyText });
          const updated = await base44.agents.getConversation(convo.id);
          setConversation(updated);
        } catch {}
      } catch {
        setMessages(prev => prev.map(m =>
          m.id === PENDING ? { role: "assistant", content: "I couldn't complete that action. Please try again.", id: `ast_err_${Date.now()}` } : m
        ));
      }
      setLoading(false);
      return;
    }

    // ── Agent path for conversational / fuzzy requests
    try {
      let convo = conversationRef.current;
      if (!convo) {
        convo = await base44.agents.createConversation({
          agent_name: "personal_assistant",
          metadata: { tone: coachPrefs.coach_tone, archetype: coachPrefs.coach_archetype },
        });
        setConversation(convo);
        conversationRef.current = convo;
      }

      const unsubscribe = base44.agents.subscribeToConversation(convo.id, (data) => {
        const assistantMsgs = (data.messages || []).filter(m => m.role === "assistant");
        const latest = assistantMsgs[assistantMsgs.length - 1];
        if (latest?.content) {
          setMessages(prev =>
            prev.map(m => m.id === PENDING ? { ...m, content: latest.content } : m)
          );
        }
      });

      // Send only the clean user message — no hidden context injected
      await base44.agents.addMessage(convo, { role: "user", content: questionText });
      unsubscribe();

      const final = await base44.agents.getConversation(convo.id);
      const finalAssistant = (final.messages || []).filter(m => m.role === "assistant");
      const lastFinal = finalAssistant[finalAssistant.length - 1];
      setMessages(prev =>
        prev.map(m =>
          m.id === PENDING
            ? { role: "assistant", content: lastFinal?.content || m.content, id: `ast_${Date.now()}` }
            : m
        )
      );
      setConversation(final);
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === PENDING
            ? { role: "assistant", content: "Something went wrong. Please try again.", id: `ast_err_${Date.now()}` }
            : m
        )
      );
    }
    setLoading(false);
  }, [loading, coachPrefs]);

  // ── VOICE CALLBACKS — same thread, ensure a thread exists ──────────────────
  const handleVoiceUserTranscript = useCallback(async (text) => {
    // Ensure a thread exists for voice (creates one if needed)
    if (!conversationRef.current) {
      try {
        const convo = await base44.agents.createConversation({
          agent_name: "personal_assistant",
          metadata: { tone: coachPrefs.coach_tone, archetype: coachPrefs.coach_archetype, source: "voice" },
        });
        setConversation(convo);
        conversationRef.current = convo;
      } catch {}
    }
    setMessages(prev => [...prev, { role: "user", content: text, id: `voice_user_${Date.now()}`, source: "voice" }]);
  }, [coachPrefs]);

  const handleVoiceAssistantTranscript = useCallback((text, isFinal) => {
    if (!isFinal) {
      // Live streaming — update or insert a pending voice assistant message
      setMessages(prev => {
        const hasPending = prev.some(m => m.id === PENDING);
        if (hasPending) return prev.map(m => m.id === PENDING ? { ...m, content: text } : m);
        return [...prev, { role: "assistant", content: text, id: PENDING, source: "voice" }];
      });
    } else {
      // Final — lock the message with a stable ID
      setMessages(prev =>
        prev.map(m =>
          m.id === PENDING
            ? { role: "assistant", content: text, id: `voice_ast_${Date.now()}`, source: "voice" }
            : m
        )
      );
    }
  }, []);

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const lastAst = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastUser || !lastAst) return;
    await saveItem({
      itemType: "ADVICE",
      itemId: `${conversation?.id}-${messages.length}`,
      title: lastUser.content.slice(0, 80),
      previewText: lastAst.content?.replace(/[#*_`]/g, "").slice(0, 180),
      meta: { route: createPageUrl("Assistant") },
    });
    setSaved(true);
  };

  const voiceInstructions = buildVoiceInstructions();

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--ivory)" }}>

      {/* Voice mode overlay — same-thread wiring */}
      {showVoice && (
        <GuideVoiceMode
          guideName={guideName}
          voiceId={voicePrefs.voice_id}
          instructions={voiceInstructions}
          onClose={() => setShowVoice(false)}
          onUserTranscript={handleVoiceUserTranscript}
          onAssistantTranscript={handleVoiceAssistantTranscript}
        />
      )}

      {/* Settings sheet */}
      {showSettings && (
        <GuideSettingsSheet
          user={{ ...user, ...coachPrefs, ...voicePrefs }}
          onClose={() => setShowSettings(false)}
          onSaved={(prefs) => {
            setCoachPrefs({ coach_name: prefs.coach_name, coach_archetype: prefs.coach_archetype, coach_tone: prefs.coach_tone });
            setVoicePrefs({ voice_id: prefs.voice_id, speaking_pace: prefs.speaking_pace, default_mode: prefs.default_mode });
            startNewThread();
          }}
        />
      )}

      {/* Thread sidebar */}
      <GuideThreadSidebar
        activeConversationId={conversation?.id}
        onSelect={loadConversation}
        onNewThread={startNewThread}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main panel */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-10 pb-3 flex-shrink-0"
          style={{ backgroundColor: "rgba(250,248,245,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)", color: "var(--mauve)" }}>
              <PanelLeft className="w-4 h-4" />
            </button>
            <div>
              <p style={sLabel} className="mb-0">Private</p>
              <h1 className="text-xl font-bold leading-tight"
                style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
                Guide
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-1 hidden sm:block">
              <p className="text-xs font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{guideName}</p>
              <p style={{ ...sLabel, fontSize: "0.55rem" }}>{styleDesc}</p>
            </div>
            <button onClick={() => setShowVoice(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: "var(--plum)", color: "white" }}>
              <Mic className="w-4 h-4" />
            </button>
            <button onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)", color: "var(--mauve)" }}>
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <div className="max-w-2xl mx-auto w-full">

            {loadingHistory && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--rose-dust-light)" }} />
              </div>
            )}

            {/* Empty state — smart starters */}
            {!loadingHistory && messages.length === 0 && (
              <div className="space-y-5 pt-4">
                <div className="rounded-[20px] p-5"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    {guideName}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                    Your private guide across all of FemWell. Ask anything, log something, or get a plan — I'll use your data to help you move forward.
                  </p>
                </div>

                <div>
                  <p style={sLabel} className="mb-2.5">Quick starts</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STARTERS.map((s) => (
                      <button key={s.action}
                        onClick={() => sendMessage(STARTER_PROMPTS[s.action])}
                        className="text-left text-xs px-3.5 py-3 rounded-[16px] leading-snug font-medium transition-all"
                        style={{
                          backgroundColor: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--plum)",
                          fontFamily: "'Inter', sans-serif",
                          boxShadow: "var(--shadow-sm)",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory-dark)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--surface)"}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {!loadingHistory && messages.map((msg, i) => {
              if (msg.role === "assistant") {
                const isPending = msg.id === PENDING;
                const { text, options } = parseOptions(msg.content);
                const isLast = i === messages.length - 1;
                const ctxLabel = !isPending ? extractContextLabel(text) : null;

                return (
                  <div key={msg.id || i} className="flex flex-col items-start gap-2 max-w-[88%]">
                    {ctxLabel && (
                      <p className="text-[10px] ml-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}>
                        {ctxLabel}
                      </p>
                    )}
                    <div className="rounded-[20px] rounded-tl-sm px-4 py-3.5 w-full"
                      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                      {isPending && !msg.content ? (
                        <div className="flex gap-1 items-center h-4">
                          {[0, 1, 2].map(j => (
                            <div key={j} className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{ backgroundColor: "var(--mauve)", animationDelay: `${j * 0.15}s`, animationDuration: "0.9s" }} />
                          ))}
                        </div>
                      ) : (
                        <ReactMarkdown
                          className="text-sm leading-relaxed prose prose-sm max-w-none"
                          components={{
                            p: ({ children }) => <p className="my-1.5 leading-relaxed" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{children}</p>,
                            strong: ({ children }) => <strong style={{ color: "var(--plum)", fontWeight: 600 }}>{children}</strong>,
                            ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-1">{children}</ul>,
                            li: ({ children }) => <li style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{children}</li>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{children}</h3>,
                          }}>
                          {text}
                        </ReactMarkdown>
                      )}
                    </div>
                    {isLast && options.length > 0 && !loading && (
                      <div className="flex flex-wrap gap-1.5 ml-1">
                        {options.map((opt) => (
                          <button key={opt} onClick={() => sendMessage(opt)}
                            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)", fontFamily: "'Inter', sans-serif" }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={msg.id || i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-[20px] rounded-tr-sm px-4 py-3.5"
                    style={{ backgroundColor: "var(--plum)" }}>
                    <p className="text-sm leading-relaxed" style={{ color: "white", fontFamily: "'Inter', sans-serif" }}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Save + new row */}
            {messages.some(m => m.role === "assistant" && m.id !== PENDING) && !loading && (
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saved}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: saved ? "var(--sage)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  {saved ? "Saved" : "Save response"}
                </button>
                <button onClick={startNewThread}
                  className="text-xs font-medium ml-auto"
                  style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  New conversation
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Composer bar */}
        <div className="flex-shrink-0 px-4 py-3"
          style={{ backgroundColor: "rgba(250,248,245,0.97)", borderTop: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
          <div className="max-w-2xl mx-auto flex items-end gap-2">
            <div className="flex-1 flex items-end rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
                }}
                placeholder={`Ask ${guideName}…`}
                rows={1}
                className="flex-1 px-4 py-3 bg-transparent text-sm resize-none focus:outline-none"
                style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif", minHeight: "44px", maxHeight: "120px" }}
              />
              <button onClick={() => setShowVoice(true)}
                className="px-3 py-3 flex-shrink-0 transition-opacity hover:opacity-70"
                style={{ color: "var(--mauve)" }}>
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                backgroundColor: input.trim() && !loading ? "var(--plum)" : "var(--ivory-dark)",
                color: input.trim() && !loading ? "white" : "var(--mauve)",
              }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}