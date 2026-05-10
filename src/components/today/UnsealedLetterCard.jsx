import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { readyToUnseal, pickUnsealedForToday } from "@/utils/sealedLetters";

export default function UnsealedLetterCard() {
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user?.id || cancelled) { setLoading(false); return; }

      let letters = await base44.entities.SealedLetters.filter({ user_id: user.id }, '-unsealed_at', 50).catch(() => []);

      const eligible = letters.filter(readyToUnseal);
      if (eligible.length > 0) {
        const now = new Date().toISOString();
        const updated = await Promise.all(
          eligible.map(l => base44.entities.SealedLetters.update(l.id, { unsealed_at: now }).catch(() => l))
        );
        letters = letters.map(l => {
          const u = updated.find(u => u.id === l.id);
          return u || l;
        });
      }

      if (!cancelled) {
        setLetter(pickUnsealedForToday(letters));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !letter) return null;

  return (
    <>
      <style>{`
        @keyframes fwDailyChapterIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fw-unsealed-card { animation: none !important; }
        }
      `}</style>
      <div
        className="fw-unsealed-card"
        onClick={() => navigate(`/SealedLetters?open=${letter.id}`)}
        style={{
          borderRadius: 18, padding: "20px 22px 24px",
          border: "1px solid var(--ink-line)",
          boxShadow: "var(--shadow-card)",
          background: "linear-gradient(225deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)",
          marginBottom: 12, cursor: "pointer",
          animation: "fwDailyChapterIn 200ms ease-out both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Mail size={14} color="var(--mauve)" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)" }}>
            A LETTER OPENED FOR YOU
          </span>
        </div>

        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontStyle: "italic", fontWeight: 400, lineHeight: 1.55, color: "var(--plum-deep)", marginBottom: 16 }}>
          You wrote yourself a letter. The date arrived — it's ready to read.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--rose-primary)" }}>Read your letter</span>
          <ArrowRight size={14} color="var(--rose-primary)" />
        </div>
      </div>
    </>
  );
}