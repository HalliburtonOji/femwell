import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { readyToUnseal } from "@/utils/sealedLetters";
import SealedLetterComposeSheet from "@/components/sealedLetters/SealedLetterComposeSheet";
import SealedLetterList from "@/components/sealedLetters/SealedLetterList";
import SealedLettersEmptyState from "@/components/sealedLetters/SealedLettersEmptyState";
import UnsealedLetterReader from "@/components/sealedLetters/UnsealedLetterReader";

export default function SealedLetters() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u?.id || cancelled) { setLoading(false); return; }
      setUser(u);

      let all = await base44.entities.SealedLetters.filter({ user_id: u.id }, '-created_at').catch(() => []);

      const eligible = all.filter(readyToUnseal);
      if (eligible.length > 0) {
        const now = new Date().toISOString();
        const updated = await Promise.all(
          eligible.map(l => base44.entities.SealedLetters.update(l.id, { unsealed_at: now }).catch(() => l))
        );
        all = all.map(l => { const u = updated.find(u => u.id === l.id); return u || l; });
      }

      if (!cancelled) {
        setLetters(all);

        const params = new URLSearchParams(location.search);
        if (params.get('compose') === '1') setComposeOpen(true);
        if (params.get('open')) {
          const found = all.find(l => l.id === params.get('open'));
          if (found) setReaderOpen(found);
        }
        window.history.replaceState({}, '', '/SealedLetters');
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const unsealedLetters = letters.filter(l => l.unsealed_at);
  const sealedLetters = letters.filter(l => !l.unsealed_at);

  const handleMarkSeen = (updated) => {
    setLetters(prev => prev.map(l => l.id === updated.id ? updated : l));
    if (readerOpen?.id === updated.id) setReaderOpen(updated);
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-xl mx-auto px-4 pt-10 pb-6">
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={16} color="var(--mauve)" />
          <span style={{ fontSize: 13, color: "var(--mauve)" }}>Back</span>
        </button>

        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 4 }}>
          LETTERS
        </p>
        <h1 className="fw-display" style={{ marginBottom: 4 }}>
          Letters to yourself
        </h1>
        <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.55, marginBottom: 24 }}>
          Held in private until the date you picked.
        </p>

        {readerOpen && (
          <div style={{ marginBottom: 24 }}>
            <UnsealedLetterReader
              letter={readerOpen}
              onClose={() => setReaderOpen(null)}
              onMarkSeen={handleMarkSeen}
            />
          </div>
        )}

        {!loading && letters.length === 0 && (
          <SealedLettersEmptyState onCompose={() => setComposeOpen(true)} />
        )}

        {!loading && letters.length > 0 && (
          <>
            <SealedLetterList letters={unsealedLetters} kind="unsealed" onOpen={(l) => setReaderOpen(l)} />
            <SealedLetterList letters={sealedLetters} kind="sealed" />

            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <button
                onClick={() => setComposeOpen(true)}
                style={{
                  fontSize: 14, fontWeight: 600,
                  color: "var(--cream)", backgroundColor: "var(--rose-primary)",
                  padding: "12px 24px", borderRadius: 9999, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <Plus size={16} />
                Write a new letter
              </button>
            </div>
          </>
        )}
      </div>

      <SealedLetterComposeSheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSealed={(newLetter) => setLetters(prev => [newLetter, ...prev])}
      />
    </div>
  );
}