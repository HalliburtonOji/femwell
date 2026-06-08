// AskForWitnessSheet — the writer side of Witness Mode (Q3).
//
// Launched from an entry ("Ask for a witness"). The writer must have HELD three
// others first (the witness gate); if not, we route them to hold space. Once
// gated, the existing entry is encrypted on-device and handed — via the
// postWitnessRequest service function — to one matched sister. created_by never
// leaks (service identity); only writer_hash is stored. The writer can take it
// back within 2h. Crisis content routes to UK support instead of to a stranger.

import { useState, useMemo, useEffect, useRef } from "react";
import { Eye, ShieldAlert, Check, X, Phone, MessageSquareText, Clock, Undo2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PAPER_BG, T, UI, Script, Hand, Eyebrow, Rule } from "../Editorial";
import { crisisCheck } from "../echo/echoScrub";
import { CRISIS_RESOURCES } from "../echo/echoConfig";
import {
  witnessHash, witnessAvailable, rememberSent, mySentId, forgetSent, heldCountLocal,
} from "./witnessAnon";
import { sealForWitness, witnessCryptoAvailable } from "./witnessCrypto";
import {
  GATE_HOLDS, CANCEL_HOURS, OPEN_HOURS, EXPIRE_HOURS, SEND_PER_DAY,
  PHASE_COHORT, RESPONSE_LABEL, MAX_ENTRY_CHARS,
} from "./witnessConfig";

function minsLeft(iso) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
}

export default function AskForWitnessSheet({
  user, phase = null, profile = null, entry = null, onClose, onOpenInbox,
}) {
  const entryText = (entry?.text || "").trim();
  const cohort = PHASE_COHORT[phase] || PHASE_COHORT.unknown;
  const available = useMemo(() => witnessAvailable() && witnessCryptoAvailable(), []);
  const heldLocal = useMemo(() => heldCountLocal(), []);
  const existingSent = useMemo(() => mySentId(), []);

  const initial = existingSent ? "sent" : (heldLocal < GATE_HOLDS ? "gate" : "confirm");
  const [stage, setStage] = useState(initial);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(existingSent ? { id: existingSent } : null);
  const [status, setStatus] = useState(null);   // lifecycle from getWitnessStatus
  const pollRef = useRef(null);

  // Poll the handoff lifecycle while it's live (writer sees holding / answered / passed).
  useEffect(() => {
    if (stage !== "sent" || !sent?.id) return;
    let stop = false;
    const poll = async () => {
      const r = await base44.functions.invoke("getWitnessStatus", {
        user_id: user?.id, writer_hash: await witnessHash(user?.id), request_id: sent.id,
      }).catch(() => null);
      const d = r?.data ?? r;
      if (stop || !d) return;
      if (d.gone) { setStatus({ gone: true }); return; }
      setStatus(d);
      if (["responded", "passed", "archived", "expired"].includes(d.status)) {
        clearInterval(pollRef.current);
      }
    };
    poll();
    pollRef.current = setInterval(poll, 20000);
    return () => { stop = true; clearInterval(pollRef.current); };
  }, [stage, sent, user]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSend = async () => {
    if (!available || busy || !entryText) return;
    if (crisisCheck(entryText).intercept) { setStage("crisis"); return; }
    setBusy(true);
    setStage("sending");
    try {
      const wh = await witnessHash(user?.id);
      const ciphertext = await sealForWitness(entryText.slice(0, MAX_ENTRY_CHARS));
      const now = Date.now();
      const res = await base44.functions.invoke("postWitnessRequest", {
        user_id: user?.id,
        writer_hash: wh,
        entry_ciphertext: ciphertext,
        match_phase: phase || "unknown",
        match_life_stage: profile?.life_stage || undefined,
        match_language: profile?.language || "en-GB",
        sent_at: new Date(now).toISOString(),
        cancel_until: new Date(now + CANCEL_HOURS * 3600e3).toISOString(),
        open_deadline: new Date(now + OPEN_HOURS * 3600e3).toISOString(),
        expires_at: new Date(now + EXPIRE_HOURS * 3600e3).toISOString(),
      });
      const d = res?.data ?? res;
      if (d?.error === "gate") { setReason("gate"); setStage("gate"); return; }
      if (d?.error === "rate") { setReason("rate"); setStage("blocked"); return; }
      if (!d?.ok || !d.request?.id) { setReason("network"); setStage("blocked"); return; }
      rememberSent(d.request.id);
      setSent(d.request);
      setStage("sent");
    } catch (err) {
      console.error("Witness send failed:", err);
      setReason("network");
      setStage("blocked");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!sent?.id || busy) return;
    setBusy(true);
    try {
      const wh = await witnessHash(user?.id);
      await base44.functions.invoke("cancelWitness", { user_id: user?.id, request_id: sent.id, writer_hash: wh });
      forgetSent();
      onClose?.();
    } catch (err) {
      console.error("Witness cancel failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const close = (
    <button onClick={onClose} aria-label="Close" style={{
      position: "absolute", top: 26, right: 18, width: 34, height: 34, borderRadius: "50%",
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <X size={16} style={{ color: T.muted }} />
    </button>
  );
  const head = (sub) => (
    <>
      <Eyebrow mb={10}>Witness · {sub}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Eye size={20} style={{ color: T.gold }} />
        <Script size={42} style={{ width: "auto" }}>Ask for a witness</Script>
      </div>
    </>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, overflowY: "auto", ...PAPER_BG }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 22px 60px", position: "relative" }}>
        {close}

        {stage === "gate" && (
          <>
            {head("Hold before you hand")}
            <Hand size={20} color={T.inkSoft} style={{ marginTop: 8, marginBottom: 18 }}>
              Witness moves at the speed of care. Hold space for {GATE_HOLDS} others before you ask one to hold yours.
            </Hand>
            <Rule mb={18} />
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {Array.from({ length: GATE_HOLDS }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 3,
                  background: i < heldLocal ? T.gold : T.paperDeep }} />
              ))}
            </div>
            <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, marginBottom: 22 }}>
              {Math.max(0, GATE_HOLDS - heldLocal)} more to hold.
            </p>
            <button onClick={() => onOpenInbox?.()} style={primaryBtn}>
              <Eye size={16} style={{ color: T.paperHi }} /> Hold space for someone
            </button>
          </>
        )}

        {stage === "confirm" && (
          <>
            {head("One entry, one sister")}
            <Hand size={20} color={T.inkSoft} style={{ marginTop: 8, marginBottom: 16 }}>
              This entry goes to {cohort}. She reads it once and answers with one of four lines, or holds it in silence. No names, no thread.
            </Hand>
            <Rule mb={16} />
            <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "16px 18px", marginBottom: 18 }}>
              <Hand size={19} color={T.ink}>{entryText ? `“${entryText.slice(0, 600)}”` : "This entry has no words to hand."}</Hand>
            </div>
            <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, marginBottom: 18, display: "flex", gap: 6, alignItems: "center" }}>
              <Clock size={13} /> You can take it back within {CANCEL_HOURS}h. {SEND_PER_DAY} send a day.
            </p>
            <button onClick={handleSend} disabled={!entryText || !available} style={{ ...primaryBtn, opacity: (!entryText || !available) ? 0.5 : 1 }}>
              <Eye size={16} style={{ color: T.paperHi }} /> Send to a witness
            </button>
            {!available && (
              <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 12 }}>
                This browser can{"’"}t encrypt on-device, so the entry can{"’"}t be handed safely here.
              </p>
            )}
          </>
        )}

        {stage === "sending" && (
          <div style={{ paddingTop: 80, textAlign: "center" }}>
            <Hand size={22} color={T.inkSoft}>Sealing your entry and finding one quiet pair of hands…</Hand>
          </div>
        )}

        {stage === "crisis" && (
          <>
            <Eyebrow mb={10}>Someone is there, right now</Eyebrow>
            <div style={{ background: T.ink, borderRadius: 14, padding: "20px 20px 22px", marginBottom: 18 }}>
              <ShieldAlert size={22} style={{ color: T.blush, marginBottom: 8 }} />
              <Hand size={21} color={T.paperHi} carve={false}>
                This reads as heavy. A stranger isn{"’"}t the right shape for tonight. You deserve more than one woman can hold — not less.
              </Hand>
            </div>
            {CRISIS_RESOURCES.map((r) => (
              <div key={r.name} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
                {r.sms ? <MessageSquareText size={16} style={{ color: T.gold, marginTop: 2 }} /> : <Phone size={16} style={{ color: T.gold, marginTop: 2 }} />}
                <div>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>{r.name}</div>
                  <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted }}>{r.detail}</div>
                </div>
              </div>
            ))}
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 8 }}>Close</button>
          </>
        )}

        {stage === "sent" && (
          <>
            {head("Held by one sister")}
            <div style={{ marginTop: 14, marginBottom: 18, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "18px 18px 20px", textAlign: "center" }}>
              <Check size={26} style={{ color: T.sage, marginBottom: 8 }} />
              <Hand size={21} color={T.ink}>{sentLine(status)}</Hand>
            </div>
            {canCancel(sent, status) && (
              <button onClick={handleCancel} disabled={busy} style={secondaryBtn}>
                <Undo2 size={15} style={{ color: T.ink }} /> Take it back
                {sent?.cancel_until ? ` · ${minsLeft(sent.cancel_until)} min left` : ""}
              </button>
            )}
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 12 }}>Done</button>
          </>
        )}

        {stage === "blocked" && (
          <>
            {head("Not just now")}
            <Hand size={21} color={T.inkSoft} style={{ marginTop: 14, marginBottom: 20 }}>
              {reason === "rate"
                ? `One witness a day — you've already handed one. Come back tomorrow.`
                : `That didn't go through. Check your connection and try again.`}
            </Hand>
            <button onClick={onClose} style={primaryBtn}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}

function canCancel(sent, status) {
  if (!sent?.cancel_until) return false;
  if (status && ["responded", "passed", "gone", "archived"].includes(status.status || (status.gone && "gone"))) return false;
  return minsLeft(sent.cancel_until) > 0;
}
function sentLine(status) {
  if (!status) return "Your entry is on its way to one matched sister.";
  if (status.gone) return "This handoff has closed.";
  switch (status.status) {
    case "matched": return status.rerouted ? "Sent on to another sister after waiting. She has it now." : "A sister has been matched. Waiting for her to open it.";
    case "opened":  return "She's reading it now, holding it with you.";
    case "responded": return `She answered: “${RESPONSE_LABEL[status.response] || "held"}”.`;
    case "passed":  return "She held it in silence. Sometimes that's the whole of it.";
    case "archived": case "expired": return "No one opened it in time — it's back in your library.";
    default: return "Your entry is on its way to one matched sister.";
  }
}

const primaryBtn = {
  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: T.ink, color: T.paperHi, border: "none", borderRadius: 12, padding: "13px 16px",
  fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.3, cursor: "pointer",
};
const secondaryBtn = {
  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: "transparent", color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 12,
  padding: "12px 16px", fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
