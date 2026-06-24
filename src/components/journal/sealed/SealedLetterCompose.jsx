// SealedLetterCompose — write a letter to a future you, then seal it (Phase 2).
//
// Editorial full-screen composer (same cream/ink system as NewEntrySheet). The
// writer chooses one of 4 unlock triggers; on "Seal it" the body is encrypted
// on-device (real AES-GCM via journalCrypto) and only the CIPHERTEXT is written
// to base44 — the server never sees the words. Lives inside the Journal.

import { useState, useMemo } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PAPER_BG, T, UI, HAND, SERIF, PRESS, Script, Hand, Eyebrow, Rule, Chip } from "../Editorial";
import { encryptText, cryptoAvailable } from "@/utils/journalCrypto";
import { TRIGGER_TYPES, futureChips, phaseTriggerOptions, resolveTrigger } from "./sealedTriggers";
import { formatLetterDate } from "@/utils/sealedLetters";
import { useScrollLock } from "@/utils/useScrollLock";

const todayISO = () => new Date().toISOString().split("T")[0];

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 3, boxSizing: "border-box",
  background: T.paperHi, border: `1px solid ${T.paperDeep}`,
  fontFamily: UI, fontSize: 14, color: T.ink, outline: "none",
};

export default function SealedLetterCompose({
  profile, onClose, onSealed, seedBody = "",
  thread = null, seedTriggerType = null, replyToLabel = "",   // v2: writing back into a thread
}) {
  useScrollLock(true);   // lock the background page while this full-screen composer is open
  const [body, setBody] = useState(seedBody || "");
  const [title, setTitle] = useState("");
  const [triggerType, setTriggerType] = useState(seedTriggerType || "future");
  const [futureDate, setFutureDate] = useState("");
  const [phase, setPhase] = useState("follicular");
  const [customDate, setCustomDate] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [error, setError] = useState("");

  const canEncrypt = useMemo(() => cryptoAvailable(), []);
  const chips = useMemo(() => futureChips(), []);
  const phaseOpts = useMemo(() => phaseTriggerOptions(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;

  const resolved = resolveTrigger({ type: triggerType, futureDate, phase, profile });
  const sealDate = resolved?.sealDate || null;
  const canSeal =
    canEncrypt && !sealing && body.trim().length >= 10 && !!sealDate && sealDate > todayISO();

  const handleSeal = async () => {
    setError("");
    if (body.trim().length < 10) { setError("A few words at least — write something for her."); return; }
    if (!resolved?.sealDate || resolved.sealDate <= todayISO()) { setError("Pick when it opens — a future date or your next phase."); return; }
    if (!canEncrypt) { setError("This device can't encrypt right now, so the letter won't be stored. Try a different browser."); return; }
    setSealing(true);
    try {
      // v2: thread linkage rides in the CLEAR envelope meta (no entity change).
      const envelope = await encryptText(body.trim(), resolved.trigger, thread ? { thread } : null);
      // WIRING FIX (2026-06-24): set user_id on create — every reader
      // (SealedLettersSection / Today UnsealedLetterCard / Garden / SealedLetters page)
      // filters by { user_id }, which base44 does NOT auto-populate, so letters
      // sealed without it were invisible to the owner. created_by alone wasn't enough.
      const me = await base44.auth.me().catch(() => null);
      const saved = await base44.entities.SealedLetters.create({
        user_id: me?.id,
        body: envelope,             // CIPHERTEXT — never plaintext
        seal_date: resolved.sealDate,
        title: title.trim(),
      });
      onSealed?.(saved);
      setSealing(false);
      onClose?.();
    } catch (err) {
      console.error("Seal letter failed:", err);
      setSealing(false);
      setError("Something went wrong sealing the letter. Your words are still here — try again.");
    }
  };

  return (
    <div className="fw-sheet-safe" style={{ position: "fixed", inset: 0, zIndex: 92, ...PAPER_BG, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: "30px 26px 44px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Eyebrow>A sealed letter</Eyebrow>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, color: T.muted, fontWeight: 600 }}>Close</button>
        </div>

        <Script size={46} style={{ marginBottom: 6 }}>{thread ? "Write back to her" : "A letter to a future you"}</Script>
        <Hand size={20} color={T.inkSoft} style={{ marginBottom: 18 }}>
          {thread
            ? `Answering ${replyToLabel || "your last letter"} — this seals into the same thread, so you can follow the whole correspondence later.`
            : "Write what you want her to know. Pick when she gets to read it. Sealed and encrypted until then — not even Jess can peek."}
        </Hand>

        {!canEncrypt && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3, padding: "12px 14px", marginBottom: 16 }}>
            <ShieldAlert size={16} style={{ color: T.crimson, flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5 }}>
              <strong>This browser can{"’"}t encrypt on-device</strong>, so a sealed letter can{"’"}t be made here — and we won{"’"}t store your words unencrypted. Rather than lose them, write it as a normal journal entry for now (it{"’"}s still private to you), or come back on a recent browser over https.
            </span>
          </div>
        )}

        {/* the letter — M8: don't let her pour out a long letter that can't be sealed */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={!canEncrypt}
          placeholder={canEncrypt ? "Dear future me…" : "Sealing isn’t available on this browser — see above."}
          style={{
            opacity: canEncrypt ? 1 : 0.55,
            width: "100%", minHeight: 240, background: T.paperHi, border: `1px solid ${T.paperDeep}`,
            padding: "18px 20px", borderRadius: 3, resize: "none", fontFamily: SERIF, fontSize: 21,
            lineHeight: 1.6, color: T.ink, outline: "none", boxSizing: "border-box", marginBottom: 12,
          }} />

        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="(optional) Give it a name" style={{ ...inputStyle, marginBottom: 24 }} />

        {/* trigger type — 4 editorial underline tabs */}
        <Eyebrow mb={10}>When it opens</Eyebrow>
        <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
          {TRIGGER_TYPES.map((t) => {
            const on = t.id === triggerType;
            return (
              <button key={t.id} onClick={() => { setTriggerType(t.id); setError(""); }} style={{
                background: "transparent", border: "none", padding: "0 0 2px", cursor: "pointer",
                fontFamily: UI, fontSize: 12.5, letterSpacing: 0.4, color: on ? T.ink : T.muted,
                fontWeight: on ? 800 : 600, borderBottom: on ? `1px solid ${T.gold}` : "none",
              }}>{t.title}</button>
            );
          })}
        </div>
        <Hand size={17} color={T.muted} style={{ marginBottom: 12 }}>
          {TRIGGER_TYPES.find((t) => t.id === triggerType)?.blurb}
        </Hand>

        {/* per-trigger detail */}
        {triggerType === "future" && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {chips.map((c) => (
                <Chip key={c.label} active={futureDate === c.dateISO && !customDate}
                  onClick={() => { setFutureDate(c.dateISO); setCustomDate(false); setError(""); }}>{c.label}</Chip>
              ))}
              <Chip active={customDate} onClick={() => setCustomDate((v) => !v)}>Custom</Chip>
            </div>
            {customDate && (
              <input type="date" value={futureDate}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={(e) => { setFutureDate(e.target.value); setError(""); }}
                style={{ ...inputStyle, maxWidth: 220 }} />
            )}
          </div>
        )}

        {triggerType === "phase" && (
          <div style={{ marginBottom: 18 }}>
            {!hasCycle ? (
              <Hand size={17} color={T.inkSoft}>
                Add your cycle in Settings and you can seal a letter until your next phase. For now, choose a date instead.
              </Hand>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {phaseOpts.map((p) => (
                  <Chip key={p.phase} active={phase === p.phase} onClick={() => { setPhase(p.phase); setError(""); }}>
                    {p.label}{p.dateISO ? ` · ${formatLetterDate(p.dateISO)}` : ""}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        )}

        {(triggerType === "cycle" || triggerType === "anniversary") && sealDate && (
          <div style={{ marginBottom: 18 }}>
            <Chip active>{`Opens ${formatLetterDate(sealDate)}`}</Chip>
          </div>
        )}

        {sealDate && (
          <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, fontWeight: 600, letterSpacing: 0.4, marginBottom: 18 }}>
            {resolved?.trigger?.label} · {formatLetterDate(sealDate)}
          </div>
        )}

        {error && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginBottom: 14 }}>{error}</div>}

        <Rule w={28} c={T.gold} mb={18} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button onClick={handleSeal} disabled={!canSeal} style={{
            background: "transparent", border: `1px solid ${T.gold}`, padding: "11px 26px",
            cursor: canSeal ? "pointer" : "default", fontFamily: HAND, fontWeight: 600, fontSize: 19,
            color: T.ink, textShadow: PRESS, borderRadius: 3, opacity: canSeal ? 1 : 0.5,
          }}>{sealing ? "Sealing…" : "Seal it"}</button>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 18, fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: 0.5, fontWeight: 600 }}>
          <Lock size={11} /> Encrypted on this device with a key only this device holds. The server stores only the cipher.
        </div>
      </div>
    </div>
  );
}
