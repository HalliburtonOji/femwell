// UnpackWithJess — Q1 "talk it out, still locked" surface (JOURNAL_BUILD_SPEC §1.8).
//
// Opens from any entry in the EntryReader. A quiet, reflective space where Jess
// helps the writer unpack what she already wrote — OBSERVER, not companion. It
// reuses the existing callJessAgent / InvokeLLM path (which already prepends the
// locked Jess persona + crisis escalation). NOTHING here is saved: no entity
// write, no journal mutation; the agent conversation is ephemeral and the thread
// lives only in component state for this session. The entry stays locked to her.
//
// Editorial styling, observer tone, UK voice, Lucide + no emoji.
import { useEffect, useRef, useState } from "react";
import { Sparkles, Lock, ArrowUp } from "lucide-react";
import { T, UI, SERIF, HAND, Eyebrow, Rule } from "./Editorial";
import { callJessAgent } from "@/services/jessAgentService";

const SYSTEM =
  "You are Jess, a UK-based women's wellness companion, inside the user's PRIVATE journal. " +
  "She has chosen to UNPACK one of her own entries with you. This is a quiet reflective " +
  "space — the entry stays locked to her and nothing said here is saved anywhere. " +
  "Your stance is to OBSERVE, never to companion, fix, reassure on a loop, or cheerlead: " +
  "(1) reflect back, gently and specifically, what you notice in her own words; " +
  "(2) offer at most ONE soft, open question that helps her go a layer deeper; " +
  "(3) keep it to 2-4 short sentences, warm and plain, never clinical; " +
  "(4) never give medical advice, never name a condition, never diagnose; " +
  "(5) no preamble, no sign-off, no quotation marks, no emoji; " +
  "(6) you are company for her own thinking, not a counsellor.";

const PHASE_WORD = { menstrual: "menstrual", follicular: "follicular", ovulatory: "ovulatory", luteal: "luteal" };

function buildUser({ entry, profile, phase, history }) {
  const text = (entry?.text || entry?.content || "").toString().slice(0, 1200).replace(/\s+/g, " ").trim();
  const convo = history.map((m) => `${m.role === "you" ? "She" : "You (Jess)"}: ${m.text}`).join("\n");
  return (
    `Her cycle phase: ${PHASE_WORD[phase] || "unknown"}.\n` +
    `Life stage: ${profile?.life_stage || "reproductive"}.\n` +
    `The journal entry she wants to unpack:\n"${text || "(no words)"}"\n\n` +
    (convo ? `The reflection so far:\n${convo}\n\n` : "") +
    (history.length
      ? "Respond to her latest message — reflect, then at most one soft question."
      : "Open the reflection: reflect back what you notice in her entry, then offer one soft question.")
  );
}

export default function UnpackWithJess({ entry, profile, phase }) {
  const [history, setHistory] = useState([]);   // { role: "jess" | "you", text }
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const startedRef = useRef(false);
  const scrollRef = useRef(null);

  // opening reflection — fires once
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void turn([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, loading]);

  async function turn(priorHistory) {
    setLoading(true);
    try {
      const { text } = await callJessAgent({ system: SYSTEM, user: buildUser({ entry, profile, phase, history: priorHistory }) });
      const cleaned = String(text || "").trim().replace(/^["']|["']$/g, "").trim();
      setHistory((h) => [...h, { role: "jess", text: cleaned || "I'm here, sitting with what you wrote. What feels most alive in it for you right now?" }]);
    } catch {
      setHistory((h) => [...h, { role: "jess", text: "I can't reach my words just now — but what you wrote is still here, still yours. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  function send() {
    const t = input.trim();
    if (!t || loading) return;
    const next = [...history, { role: "you", text: t }];
    setHistory(next);
    setInput("");
    void turn(next);
  }

  return (
    <section style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.paperDeep}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Sparkles size={14} style={{ color: T.gold }} aria-hidden />
        <Eyebrow color={T.gold}>Unpack with Jess</Eyebrow>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, color: T.muted, fontStyle: "italic", marginBottom: 12 }}>
        <Lock size={11} /> Talk it through — still locked to you, nothing here is saved.
      </div>

      <div ref={scrollRef} style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 2 }}>
        {history.map((m, i) => (
          m.role === "jess" ? (
            <p key={i} style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.ink, lineHeight: 1.55 }}>{m.text}</p>
          ) : (
            <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 12px" }}>
              <span style={{ fontFamily: HAND, fontSize: 17, color: T.inkSoft, lineHeight: 1.4 }}>{m.text}</span>
            </div>
          )
        ))}
        {loading && (
          <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, fontStyle: "italic" }}>Jess is sitting with it…</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 14 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          placeholder="Say a little more, if you'd like…"
          style={{ flex: 1, resize: "none", padding: "10px 12px", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.4, outline: "none", boxSizing: "border-box" }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          aria-label="Send to Jess"
          style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 999, border: "none", cursor: input.trim() && !loading ? "pointer" : "default", background: T.ink, color: T.paper, opacity: input.trim() && !loading ? 1 : 0.4, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowUp size={16} />
        </button>
      </div>
      <Rule w={36} c={T.paperDeep} mt={16} />
      <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, fontStyle: "italic", textAlign: "center", marginTop: 8 }}>
        Jess observes — she is not a clinician. Not medical advice.
      </div>
    </section>
  );
}
