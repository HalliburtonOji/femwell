import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// AskTheSky — Section 7.
// "Ask the Stars" dark panel: free-text question + prompt chips.
// Copied 1-for-1 from the original HoroscopeTab AskStars function.
// ─────────────────────────────────────────────────────────────────────────────

const ASK_CHIPS = [
  "Should I text him back today?",
  "Is this friendship draining me?",
  "What should I let go of this week?",
];

export default function AskTheSky({ userId }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const threads = await base44.entities.AdviceThreads.filter(
          { user_id: userId, topic: "horoscope" },
          "-created_date",
          5,
        ).catch(() => []);
        if (cancelled || !Array.isArray(threads) || threads.length === 0) return;
        const enriched = await Promise.all(
          threads.map(async (t) => {
            const msgs = await base44.entities.AdviceMessages.filter(
              { thread_id: t.id }, "created_date", 4,
            ).catch(() => []);
            const ans = (msgs || []).find((m) => m.role === "assistant");
            const q = (msgs || []).find((m) => m.role === "user");
            return {
              id: t.id,
              question: q?.content || t.title || "",
              answer: ans?.content || "",
            };
          })
        );
        if (cancelled) return;
        setHistory(enriched.filter((x) => x.answer));
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const submit = async (q) => {
    const text = (q || question).trim();
    if (!text) return;
    if (!userId) { setError("Sign in to ask."); return; }
    setError("");
    setAsking(true);
    setAnswer("");
    try {
      const res = await base44.functions.invoke("askStars", {
        user_id: userId,
        question: text,
      });
      const ans = res?.data?.answer || res?.answer || "";
      if (!ans) {
        setError(res?.data?.error || res?.error || "No answer came through.");
      } else {
        setAnswer(ans);
        setQuestion(text);
        setHistory((prev) => [{ id: res?.data?.thread_id || `temp-${Date.now()}`, question: text, answer: ans }, ...prev].slice(0, 5));
      }
    } catch (e) {
      setError(e?.message || "Couldn't reach Jess.");
    } finally {
      setAsking(false);
    }
  };

  const openHistory = (h) => {
    setQuestion(h.question);
    setAnswer(h.answer);
    setError("");
  };

  return (
    <div style={askShellStyle}>
      <p style={askEyebrowStyle}>Ask the <em style={{ fontStyle: "italic", color: "rgba(255,250,242,0.92)" }}>stars</em></p>
      <p style={askSubStyle}>
        Jess interprets through your chart — grounded, gentle, no fortune-cookie.
      </p>

      <div style={askInputRowStyle}>
        <input
          type="text"
          placeholder="Why do I keep replying too fast?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          style={askInputStyle}
          disabled={asking}
        />
        <button
          type="button"
          onClick={() => submit()}
          disabled={asking || !question.trim()}
          style={askSendBtnStyle}
        >
          {asking ? "Asking\u2026" : "Ask \u2726"}
        </button>
      </div>

      <div style={askChipsStyle}>
        {ASK_CHIPS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => { setQuestion(q); submit(q); }}
            style={askChipStyle}
            disabled={asking}
          >
            {q}
          </button>
        ))}
      </div>

      {error && <p style={askErrorStyle}>{error}</p>}

      {answer && (
        <div style={askAnswerStyle}>
          <p style={askAnswerLabelStyle}>Jess says</p>
          <p style={askAnswerBodyStyle}>{answer}</p>
        </div>
      )}

      {history.length > 0 && (
        <div style={askHistoryStyle}>
          <p style={askHistoryLabelStyle}>Recent asks</p>
          <div style={askHistoryRowStyle}>
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => openHistory(h)}
                style={askHistoryChipStyle}
              >
                {h.question.slice(0, 56)}{h.question.length > 56 ? "\u2026" : ""}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const askShellStyle = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 22,
  padding: "28px 24px",
  marginTop: 32,
  color: "var(--cream, #FAF4EA)",
  background: "radial-gradient(circle at 25% 30%, #3a2a4c 0%, #221a2e 60%, #15101e 100%)",
  boxShadow: "0 2px 4px rgba(43,30,22,0.10), 0 12px 32px rgba(43,30,22,0.18)",
};
const askEyebrowStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 22,
  color: "var(--cream, #FAF4EA)",
  margin: "0 0 4px",
  letterSpacing: "-0.005em",
};
const askSubStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: "rgba(247,239,225,0.74)",
  margin: "0 0 16px",
  lineHeight: 1.5,
};
const askInputRowStyle = {
  display: "flex",
  gap: 8,
  marginBottom: 12,
  flexWrap: "wrap",
};
const askInputStyle = {
  flex: "1 1 240px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  padding: "12px 14px",
  borderRadius: 9999,
  border: "1px solid rgba(247,239,225,0.20)",
  background: "rgba(247,239,225,0.08)",
  color: "var(--cream, #FAF4EA)",
  minHeight: 44,
  outline: "none",
};
const askSendBtnStyle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 13,
  color: "var(--plum-deep, #2b1e16)",
  background: "var(--cream, #FAF4EA)",
  border: "none",
  borderRadius: 9999,
  padding: "12px 20px",
  cursor: "pointer",
  minHeight: 44,
  whiteSpace: "nowrap",
};
const askChipsStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 16,
};
const askChipStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(247,239,225,0.84)",
  background: "rgba(247,239,225,0.08)",
  border: "1px solid rgba(247,239,225,0.18)",
  borderRadius: 9999,
  padding: "8px 14px",
  cursor: "pointer",
  minHeight: 36,
};
const askErrorStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#FFC4BC",
  background: "rgba(255,180,170,0.10)",
  padding: "8px 12px",
  borderRadius: 10,
  margin: "0 0 12px",
};
const askAnswerStyle = {
  background: "rgba(247,239,225,0.06)",
  border: "1px solid rgba(247,239,225,0.14)",
  borderRadius: 16,
  padding: "16px 18px 18px",
};
const askAnswerLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(232,196,208,0.92)",
  margin: "0 0 8px",
};
const askAnswerBodyStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 15.5,
  lineHeight: 1.6,
  color: "rgba(247,239,225,0.96)",
  margin: 0,
  fontStyle: "italic",
};
const askHistoryStyle = { marginTop: 16 };
const askHistoryLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.56)",
  margin: "0 0 8px",
};
const askHistoryRowStyle = { display: "flex", flexWrap: "wrap", gap: 6 };
const askHistoryChipStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: "rgba(247,239,225,0.82)",
  background: "transparent",
  border: "1px solid rgba(247,239,225,0.18)",
  borderRadius: 9999,
  padding: "5px 11px",
  cursor: "pointer",
  minHeight: 28,
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};