import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { saveItem } from "@/lib/savedItems";
import {
  Send, BookmarkPlus, Loader2, Settings2, Mic, MicOff,
  X, ArrowLeft, CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import GuideSettingsSheet from "../coach/CoachSettingsSheet";

// ── Smart suggestions — no emojis, action-oriented ─────────────────────────
const SUGGESTIONS = [
  "Plan my day",
  "What should I focus on today?",
  "Help me reset",
  "Recommend something quick",
  "Help with my cycle",
  "What's next in my program?",
  "Help me stay consistent",
  "I need a quick breathing reset",
];

const ARCHETYPE_DESCRIPTIONS = {
  empathetic: "Warm & supportive",
  motivator:  "Direct & action-focused",
  analyst:    "Data-driven & evidence-based",
  nurturing:  "Gentle & holistic",
  bestie:     "Casual & real",
};

// ── Voice orb states ────────────────────────────────────────────────────────
const ORB_STATES = {
  idle:         { label: "Tap to speak",    pulse: false, glow: false },
  listening:    { label: "Listening…",      pulse: true,  glow: true  },
  thinking:     { label: "Thinking…",       pulse: false, glow: true  },
  speaking:     { label: "Speaking…",       pulse: true,  glow: true  },
  paused:       { label: "Paused",          pulse: false, glow: false },
};

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

// ── Voice Mode Overlay ──────────────────────────────────────────────────────
function VoiceMode({ guideName, orbState, setOrbState, transcript, onClose, onSendText }) {
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const orb = ORB_STATES[orbState] || ORB_STATES.idle;

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setOrbState("unavailable");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-GB";
    rec.onstart = () => { setOrbState("listening"); setListening(true); };
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      if (e.results[0].isFinal && t.trim()) {
        setOrbState("thinking");
        setListening(false);
        onSendText(t.trim());
      }
    };
    rec.onerror = () => { setOrbState("paused"); setListening(false); };
    rec.onend = () => { if (orbState === "listening") setOrbState("idle"); setListening(false); };
    recognitionRef.current = rec;
    rec.start();
  }, [onSendText, orbState, setOrbState]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setOrbState("idle");
    setListening(false);
  };

  const handleOrbTap = () => {
    if (listening) stopListening();
    else startListening();
  };

  useEffect(() => {
    if (orbState === "speaking") {
      const t = setTimeout(() => setOrbState("idle"), 3000);
      return () => clearTimeout(t);
    }
  }, [orbState, setOrbState]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(160deg, var(--plum) 0%, #1A1426 60%, #0F0D14 100%)" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>
          <ArrowLeft className="w-4 h-4" />
          Back to chat
        </button>
        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
          {guideName}
        </p>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Central orb */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {/* Orb visual */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow rings */}
          {orb.glow && (
            <>
              <div className="absolute w-64 h-64 rounded-full opacity-10 animate-pulse"
                style={{ backgroundColor: "var(--rose-dust)", animationDuration: "2.5s" }} />
              <div className="absolute w-48 h-48 rounded-full opacity-15 animate-pulse"
                style={{ backgroundColor: "var(--rose-dust)", animationDuration: "1.8s", animationDelay: "0.3s" }} />
            </>
          )}
          {/* Main orb button */}
          <button onClick={handleOrbTap}
            className="relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
            style={{
              background: orb.pulse
                ? "radial-gradient(circle, var(--rose-dust) 0%, #A06078 60%, #7A4060 100%)"
                : "radial-gradient(circle, rgba(196,132,154,0.6) 0%, rgba(120,64,90,0.4) 60%, rgba(80,40,60,0.3) 100%)",
              boxShadow: orb.glow ? "0 0 40px rgba(196,132,154,0.4), 0 0 80px rgba(196,132,154,0.15)" : "none",
              border: "1px solid rgba(196,132,154,0.3)",
            }}>
            {listening
              ? <MicOff className="w-8 h-8 text-white" />
              : muted
              ? <MicOff className="w-8 h-8" style={{ color: "rgba(255,255,255,0.4)" }} />
              : <Mic className="w-8 h-8 text-white" />
            }
          </button>
        </div>

        {/* State label */}
        <p className="text-base font-medium text-center"
          style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Inter', sans-serif" }}>
          {orb.label}
        </p>

        {/* Transcript area */}
        {transcript && (
          <div className="w-full max-w-sm rounded-2xl px-5 py-4 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Inter', sans-serif" }}>
              {transcript}
            </p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-6 px-6 pb-14">
        <button onClick={() => setMuted(v => !v)}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{ backgroundColor: muted ? "rgba(196,132,154,0.25)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: muted ? "var(--rose-dust)" : "rgba(255,255,255,0.55)" }}>
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={onClose}
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}>
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── Main Guide / AICoachTab ─────────────────────────────────────────────────
export default function AICoachTab({ user }) {
  const [profile, setProfile] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic] = useState("guide"); // single topic context key
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [voiceOrbState, setVoiceOrbState] = useState("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [coachPrefs, setCoachPrefs] = useState({
    coach_name: user.coach_name || "Guide",
    coach_archetype: user.coach_archetype || "empathetic",
    coach_tone: user.coach_tone || "Warm",
  });
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const guideName = coachPrefs.coach_name || "Guide";
  const styleDesc = ARCHETYPE_DESCRIPTIONS[coachPrefs.coach_archetype] || "Warm & supportive";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    base44.entities.UserProfile.filter({ user_id: user.id }).then(p => { if (p[0]) setProfile(p[0]); });
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoadingHistory(true);
      const storageKey = `guide_convo_${user.id}`;
      const savedId = localStorage.getItem(storageKey);
      if (!savedId) { setConversation(null); setMessages([]); setLoadingHistory(false); return; }
      try {
        const convo = await base44.agents.getConversation(savedId);
        if (convo?.messages?.length > 0) {
          setConversation(convo);
          setMessages(convo.messages.map(m => ({
            ...m,
            content: m.role === "user" ? m.content.replace(/^\[Guide style:.*?\]\n\n/, "") : m.content,
          })));
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
      setLoadingHistory(false);
    };
    load();
  }, [user.id]);

  const sendMessage = async (questionText) => {
    if (!questionText?.trim() || loading) return;
    setLoading(true);
    setSaved(false);

    const userMsg = { role: "user", content: questionText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      let convo = conversation;
      if (!convo) {
        convo = await base44.agents.createConversation({
          agent_name: "personal_assistant",
          metadata: { tone: coachPrefs.coach_tone, archetype: coachPrefs.coach_archetype },
        });
        setConversation(convo);
        localStorage.setItem(`guide_convo_${user.id}`, convo.id);
      }

      const styleNote = `[Guide style: ${styleDesc}. Tone: ${coachPrefs.coach_tone}. Use context from journal, check-ins, cycle data, habit logs, program progress, and nutrition logs if relevant. You are the private AI guide embedded in FemWell, a premium women's wellness app.]`;
      const fullPrompt = `${styleNote}\n\n${questionText}`;

      const unsubscribe = base44.agents.subscribeToConversation(convo.id, (data) => {
        const assistantMsgs = (data.messages || []).filter(m => m.role === "assistant");
        const last = assistantMsgs[assistantMsgs.length - 1];
        if (last?.content) {
          setMessages(prev => {
            const lastIdx = [...prev].reverse().findIndex(m => m.role === "assistant");
            if (lastIdx === -1) return [...prev, last];
            const idx = prev.length - 1 - lastIdx;
            const updated = [...prev];
            updated[idx] = last;
            return updated;
          });
        }
      });

      await base44.agents.addMessage(convo, { role: "user", content: fullPrompt });
      unsubscribe();

      const final = await base44.agents.getConversation(convo.id);
      const finalAssistant = (final.messages || []).filter(m => m.role === "assistant");
      const lastFinal = finalAssistant[finalAssistant.length - 1];
      if (lastFinal) {
        setMessages(prev => {
          const lastIdx = [...prev].reverse().findIndex(m => m.role === "assistant");
          if (lastIdx === -1) return [...prev, lastFinal];
          const idx = prev.length - 1 - lastIdx;
          const updated = [...prev];
          updated[idx] = lastFinal;
          return updated;
        });
      }
      setConversation(final);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    }
    setLoading(false);
    if (showVoice) setVoiceOrbState("speaking");
  };

  const handleVoiceSend = (text) => {
    setVoiceTranscript(text);
    sendMessage(text);
  };

  const handleSave = async () => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastUser || !lastAssistant) return;
    await saveItem({
      itemType: "ADVICE",
      itemId: `${conversation?.id || topic}-${messages.length}`,
      title: lastUser.content.replace(/^\[Guide style:.*?\]\n\n/, "").slice(0, 80),
      previewText: lastAssistant.content?.replace(/[#*_`]/g, "").slice(0, 180),
      meta: { route: createPageUrl("Assistant"), question: lastUser.content },
    });
    setSaved(true);
  };

  const clearConversation = () => {
    localStorage.removeItem(`guide_convo_${user.id}`);
    setConversation(null);
    setMessages([]);
    setSaved(false);
  };

  // ── Shared card/label styles ──────────────────────────────────────────────
  const sLabel = {
    fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--ivory)" }}>

      {/* ── Voice mode overlay ────────────────────────────────────────────── */}
      {showVoice && (
        <VoiceMode
          guideName={guideName}
          orbState={voiceOrbState}
          setOrbState={setVoiceOrbState}
          transcript={voiceTranscript}
          onClose={() => { setShowVoice(false); setVoiceTranscript(""); setVoiceOrbState("idle"); }}
          onSendText={handleVoiceSend}
        />
      )}

      {/* ── Settings sheet ────────────────────────────────────────────────── */}
      {showSettings && (
        <GuideSettingsSheet
          user={{ ...user, ...coachPrefs }}
          onClose={() => setShowSettings(false)}
          onSaved={(prefs) => {
            setCoachPrefs(prefs);
            clearConversation();
          }}
        />
      )}

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 px-4 pt-10 pb-3 flex items-center justify-between"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
        <div>
          <p style={sLabel} className="mb-0.5">Private</p>
          <h1 className="text-xl font-bold leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
            Guide
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-1">
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

      {/* ── Conversation area ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-3xl w-full mx-auto">
        {loadingHistory && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--rose-dust-light)" }} />
          </div>
        )}

        {/* Smart suggestions — shown when no messages */}
        {!loadingHistory && messages.length === 0 && (
          <div className="space-y-4 pt-2">
            <div className="rounded-[20px] p-5"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                {guideName}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                Your private guide across all of FemWell. Ask about your cycle, habits, programs, nutrition, or anything on your mind.
              </p>
            </div>

            <div>
              <p style={sLabel} className="mb-2.5">Quick starts</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-left text-xs px-3.5 py-3 rounded-[16px] leading-snug transition-all font-medium"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--plum)",
                      fontFamily: "'Inter', sans-serif",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory-dark)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--surface)"}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {!loadingHistory && messages.map((msg, i) => {
          if (msg.role === "assistant") {
            const { text, options } = parseOptions(msg.content);
            const isLast = i === messages.length - 1;
            return (
              <div key={i} className="flex flex-col items-start gap-2.5 max-w-[88%]">
                <div className="rounded-[20px] rounded-tl-sm px-4 py-3.5"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  <ReactMarkdown
                    className="text-sm leading-relaxed prose prose-sm max-w-none"
                    components={{
                      p: ({ children }) => <p className="my-1.5 leading-relaxed" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{children}</p>,
                      strong: ({ children }) => <strong style={{ color: "var(--plum)", fontWeight: 600 }}>{children}</strong>,
                      ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-1">{children}</ul>,
                      li: ({ children }) => <li style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{children}</li>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{children}</h3>,
                    }}>
                    {text}
                  </ReactMarkdown>
                </div>
                {isLast && options.length > 0 && !loading && (
                  <div className="flex flex-wrap gap-1.5 ml-1">
                    {options.map((opt) => (
                      <button key={opt} onClick={() => sendMessage(opt)}
                        className="text-xs px-3 py-2 rounded-full font-medium transition-all"
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
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-[20px] rounded-tr-sm px-4 py-3.5"
                style={{ backgroundColor: "var(--plum)", color: "white" }}>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {msg.content.replace(/^\[Guide style:.*?\]\n\n/, "")}
                </p>
              </div>
            </div>
          );
        })}

        {/* Thinking indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="rounded-[20px] rounded-tl-sm px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ backgroundColor: "var(--mauve)", animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save + clear row */}
        {messages.some(m => m.role === "assistant") && !loading && (
          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleSave} disabled={saved}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: saved ? "var(--sage)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              {saved ? "Saved" : "Save response"}
            </button>
            <button onClick={clearConversation}
              className="text-xs font-medium ml-auto"
              style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              New conversation
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Composer bar ──────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 px-4 py-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", borderTop: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-3xl mx-auto flex items-end gap-2">
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
              className="px-3 py-3 flex-shrink-0 transition-colors"
              style={{ color: "var(--mauve)" }}>
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
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
  );
}