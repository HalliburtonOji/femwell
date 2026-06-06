import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { quickChipDates } from "@/utils/sealedLetters";
import Toast from "@/components/lifestyle/foryou/Toast";

const todayISO = () => new Date().toISOString().split('T')[0];

export default function SealedLetterComposeSheet({ open, onClose, onSealed }) {
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [sealDate, setSealDate] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [bodyError, setBodyError] = useState('');
  const [dateError, setDateError] = useState('');
  const [toast, setToast] = useState(null);

  const chips = quickChipDates();

  const reset = () => {
    setBody(''); setTitle(''); setSealDate(''); setCustomMode(false);
    setSealing(false); setBodyError(''); setDateError(''); setToast(null);
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  const validate = () => {
    let ok = true;
    if (body.trim().length < 10) { setBodyError('A few words at least — write something for her.'); ok = false; } else setBodyError('');
    if (!sealDate) { setDateError('Pick a date in the future — even tomorrow works.'); ok = false; }
    else if (sealDate <= todayISO()) { setDateError('Pick a date in the future — even tomorrow works.'); ok = false; }
    else setDateError('');
    return ok;
  };

  const handleSeal = async () => {
    if (!validate()) return;
    setSealing(true);
    const newLetter = await base44.entities.SealedLetters.create({ body: body.trim(), seal_date: sealDate, title: title.trim() });
    setToast('Letter sealed. We\'ll keep it for you.');
    setTimeout(() => { onSealed?.(newLetter); onClose(); }, 1200);
  };

  if (!open) return null;

  const canSeal = body.trim().length >= 10 && sealDate && sealDate > todayISO() && !sealing;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
        backgroundColor: "var(--cream)", borderRadius: "22px 22px 0 0",
        maxHeight: "96vh", display: "flex", flexDirection: "column",
        boxShadow: "0 -8px 32px rgba(42,32,53,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px", flexShrink: 0 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 20px 12px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--mauve)", padding: 0 }}>
            Cancel
          </button>
          <button
            onClick={handleSeal}
            disabled={!canSeal}
            style={{
              fontSize: 14, fontWeight: 600,
              color: "var(--cream)", backgroundColor: canSeal ? "var(--rose-primary)" : "var(--mauve-light)",
              padding: "9px 22px", borderRadius: 9999, border: "none",
              cursor: canSeal ? "pointer" : "default", transition: "background-color 0.15s",
            }}
          >
            {sealing ? "Sealing…" : "Seal it"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 48px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "var(--plum-deep)", marginBottom: 4, lineHeight: 1.3 }}>
            A letter to a future you
          </h2>
          <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.55, marginBottom: 18 }}>
            Write what you want her to know. Pick when she gets to read it.
          </p>

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Dear future me…"
            style={{
              width: "100%", boxSizing: "border-box",
              fontSize: 17, fontStyle: "italic", lineHeight: 1.65,
              padding: 16, backgroundColor: "var(--cream-2)", border: "1px solid var(--ink-line)",
              borderRadius: 12, resize: "none", minHeight: "42vh",
              color: "var(--plum-deep)", outline: "none",
            }}
          />
          {bodyError && <p style={{ fontSize: 12, color: "#D94F4F", marginTop: 4 }}>{bodyError}</p>}

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="(optional) Give it a name"
            style={{
              width: "100%", boxSizing: "border-box", marginTop: 10,
              fontSize: 14,
              padding: "10px 14px", backgroundColor: "var(--cream-2)",
              border: "1px solid var(--ink-line)", borderRadius: 10,
              color: "var(--plum-deep)", outline: "none",
            }}
          />

          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginTop: 20, marginBottom: 10 }}>
            OPEN ON
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chips.map(chip => (
              <button
                key={chip.label}
                onClick={() => { setSealDate(chip.dateISO); setCustomMode(false); setDateError(''); }}
                style={{
                  fontSize: 13, fontWeight: 600,
                  padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer",
                  backgroundColor: sealDate === chip.dateISO ? "var(--rose-soft-bg)" : "var(--cream-2)",
                  color: sealDate === chip.dateISO ? "var(--rose-primary)" : "var(--plum-mute)",
                  transition: "all 0.12s",
                }}
              >
                {chip.label}
              </button>
            ))}
            <button
              onClick={() => setCustomMode(v => !v)}
              style={{
                fontSize: 13, fontWeight: 600,
                padding: "8px 16px", borderRadius: 9999, border: "none", cursor: "pointer",
                backgroundColor: customMode ? "var(--rose-soft-bg)" : "var(--cream-2)",
                color: customMode ? "var(--rose-primary)" : "var(--plum-mute)",
                transition: "all 0.12s",
              }}
            >
              Custom
            </button>
          </div>

          {customMode && (
            <input
              type="date"
              value={sealDate}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              onChange={e => { setSealDate(e.target.value); setDateError(''); }}
              style={{
                marginTop: 10, fontSize: 14,
                padding: "10px 14px", backgroundColor: "var(--cream-2)",
                border: "1px solid var(--ink-line)", borderRadius: 10,
                color: "var(--plum-deep)", outline: "none",
              }}
            />
          )}

          {dateError && <p style={{ fontSize: 12, color: "#D94F4F", marginTop: 6 }}>{dateError}</p>}
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}