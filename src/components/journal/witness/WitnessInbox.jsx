// WitnessInbox — the receiver side of Witness Mode (Q3).
//
// "Hold space for someone." We claim one matched handoff (claimWitness), decrypt
// it on-device, and let the receiver answer with exactly one of the four charter
// lines or pass in silence — never free text. Holding (respond OR pass) is what
// earns the right to send your own (the witness gate). Best-effort capture
// discouragement on the read view (web can't truly FLAG_SECURE); an explicit copy
// attempt records a strike. Report hides a harmful entry. All writes go through
// service functions, so the writer stays anonymous.

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Eye, HeartHandshake, Users, HandHeart, Ear, Flag, X, Check, Lock, ShieldOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PAPER_BG, T, UI, Script, Hand, Eyebrow, Rule } from "../Editorial";
import {
  witnessHash, witnessAvailable, charterAccepted, acceptCharter,
  rememberHeld, heldCountLocal, rememberClaim, forgetClaim,
} from "./witnessAnon";
import { openWitness, decryptWithDek } from "./witnessCrypto";
import {
  witnessKeysAvailable, getDevicePublicJwk, getDevicePrivateKey, deriveSharedWrapKey, unwrapDek,
} from "./witnessKeys";
import { RESPONSES, GATE_HOLDS, PHASE_COHORT, CHARTER, WITNESS_ZK_ENABLED } from "./witnessConfig";
import { useCaptureGuard } from "../../safety/CaptureShield";

const zkActive = () => WITNESS_ZK_ENABLED && witnessKeysAvailable();

const RESPONSE_ICON = {
  holding_with_you: HeartHandshake, me_too: Users, not_alone: HandHeart, i_hear_you: Ear,
};

export default function WitnessInbox({ user, phase = null, profile = null, onClose }) {
  const available = useMemo(() => witnessAvailable(), []);
  const [stage, setStage] = useState(charterAccepted() ? "loading" : "charter"); // charter|loading|reading|done|idle|removed|error
  const [request, setRequest] = useState(null);
  const [entryText, setEntryText] = useState("");
  const [rerouted, setRerouted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState("");      // responded label | passed | reported
  const [held, setHeld] = useState(heldCountLocal());
  const openedRef = useRef(false);
  const keyTriesRef = useRef(0);          // B2: bound the ZK key-pending wait
  const MAX_KEY_WAITS = 22;               // ~3 min of 8s polls before we stop waiting

  // Decode the handed entry for whichever envelope it uses. FWWT1 opens directly
  // (key inside). FWWT2 (zero-knowledge) needs the writer's wrapped data-key: if it
  // has been delivered we derive the shared secret + unwrap + decrypt; if not yet,
  // we wait in "keypending" and poll until the writer's device hands it over.
  const decodeAndShow = async (request) => {
    const ev = zkActive() ? (request.env_version || 1) : 1;
    if (ev === 2) {
      if (request.wrapped_key && request.writer_pub) {
        try {
          const priv = await getDevicePrivateKey();
          const wrapKey = await deriveSharedWrapKey(priv, JSON.parse(request.writer_pub));
          const dekB64 = await unwrapDek(request.wrapped_key, wrapKey);
          setEntryText(await decryptWithDek(request.entry_ciphertext, dekB64));
        } catch { setEntryText(""); }
        setStage("reading");
      } else {
        setStage("keypending");
      }
      return;
    }
    try { setEntryText(await openWitness(request.entry_ciphertext)); }
    catch { setEntryText(""); }
    setStage("reading");
  };

  const claim = async () => {
    if (!available) { setStage("error"); return; }
    setStage("loading");
    openedRef.current = false;
    try {
      const wh = await witnessHash(user?.id);
      const res = await base44.functions.invoke("claimWitness", {
        user_id: user?.id, receiver_hash: wh,
        phase: phase || "unknown", life_stage: profile?.life_stage || undefined,
        language: profile?.language || "en-GB",
        // ZK (FWWT2): publish this device's public key so the writer can wrap to us.
        ...(zkActive() ? { receiver_pub: JSON.stringify(await getDevicePublicJwk()) } : {}),
      });
      const d = res?.data ?? res;
      // H4: claimWitness's inFlight path RESUMES a held row (returns the one already
      // matched to me rather than a new stranger), so re-opening resumes correctly.
      // Keep currentClaim() consistent: remember the active row, forget it when the
      // server hands back nothing (the held row expired/was removed) so it can't go stale.
      if (d?.removed) { forgetClaim(); setStage("removed"); return; }
      if (d?.request?.id) {
        setRequest(d.request); setRerouted(!!d.rerouted); rememberClaim(d.request.id);
        await decodeAndShow(d.request);
      } else {
        forgetClaim();
        setStage("idle");
      }
    } catch (err) { console.error("claimWitness failed:", err); setStage("error"); }
  };

  // ZK (FWWT2): while waiting for the writer to deliver the wrapped key, re-claim
  // (the in-flight path returns our same row) until wrapped_key appears, then decode.
  // B2: while waiting for the writer to deliver the wrapped key, re-claim until it
  // arrives — but DON'T wait forever. Stop after MAX_KEY_WAITS (or if the handoff
  // expired) and show an honest "still sealed" terminal state with a way out.
  useEffect(() => {
    if (stage !== "keypending" || !request?.id) return;
    let stop = false;
    keyTriesRef.current = 0;
    const tick = async () => {
      keyTriesRef.current += 1;
      if (request.expires_at && new Date(request.expires_at).getTime() < Date.now()) {
        if (!stop) setStage("keytimeout"); return;
      }
      try {
        const wh = await witnessHash(user?.id);
        const res = await base44.functions.invoke("claimWitness", {
          user_id: user?.id, receiver_hash: wh,
          phase: phase || "unknown", life_stage: profile?.life_stage || undefined,
          language: profile?.language || "en-GB",
          receiver_pub: JSON.stringify(await getDevicePublicJwk()),
        }).catch(() => null);
        const d = res?.data ?? res;
        if (stop) return;
        if (d?.request?.id === request.id && d.request.wrapped_key) {
          setRequest(d.request);
          await decodeAndShow(d.request);
          return;
        }
      } catch { /* keep waiting */ }
      if (!stop && keyTriesRef.current >= MAX_KEY_WAITS) setStage("keytimeout");
    };
    const iv = setInterval(tick, 8000);
    return () => { stop = true; clearInterval(iv); };
  }, [stage, request, user, phase, profile]);

  useEffect(() => { if (stage === "loading") claim(); }, []);

  // Mark opened once the entry is on screen (starts the receiver's read record).
  useEffect(() => {
    if (stage !== "reading" || !request?.id || openedRef.current) return;
    openedRef.current = true;
    (async () => {
      const wh = await witnessHash(user?.id);
      base44.functions.invoke("respondWitness", { user_id: user?.id, request_id: request.id, receiver_hash: wh, action: "open" }).catch(() => {});
    })();
  }, [stage, request, user]);

  // Best-effort capture discouragement (CaptureShield): copy/context-menu are
  // blocked + earn a strike; the entry blurs the moment the app is backgrounded
  // (so the OS app-switcher thumbnail shows nothing); a PrintScreen flashes a
  // reminder. True OS-level blocking (FLAG_SECURE) needs a native wrapper.
  const onCapture = useCallback((kind) => {
    if (!request?.id) return;
    (async () => {
      const wh = await witnessHash(user?.id);
      base44.functions.invoke("flagWitness", {
        user_id: user?.id, request_id: request.id, receiver_hash: wh,
        kind: "strike", reason: kind === "screenshot" ? "screenshot_attempt" : "capture_attempt",
      }).catch(() => {});
    })();
  }, [request, user]);
  const { obscured } = useCaptureGuard({ onCapture, enabled: stage === "reading" });

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const act = async (action, response) => {
    if (!request?.id || busy) return;
    setBusy(true);
    try {
      const wh = await witnessHash(user?.id);
      await base44.functions.invoke("respondWitness", { user_id: user?.id, request_id: request.id, receiver_hash: wh, action, response });
      rememberHeld(request.id); forgetClaim();
      setHeld(heldCountLocal());
      setOutcome(action === "pass" ? "passed" : response);
      setStage("done");
    } catch (err) { console.error("respondWitness failed:", err); }
    finally { setBusy(false); }
  };

  const report = async () => {
    if (!request?.id || busy) return;
    setBusy(true);
    try {
      const wh = await witnessHash(user?.id);
      await base44.functions.invoke("flagWitness", { user_id: user?.id, request_id: request.id, receiver_hash: wh, kind: "report" });
      forgetClaim();
      setOutcome("reported");
      setStage("done");
    } catch (err) { console.error("flagWitness failed:", err); }
    finally { setBusy(false); }
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
        <Script size={42} style={{ width: "auto" }}>Hold space</Script>
      </div>
    </>
  );
  const gateChip = (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "4px 10px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi }}>
      <HeartHandshake size={13} style={{ color: T.gold }} />
      <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, fontWeight: 600 }}>
        {Math.min(held, GATE_HOLDS)}/{GATE_HOLDS} held{held >= GATE_HOLDS ? " · you can send your own" : ""}
      </span>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, overflowY: "auto", ...PAPER_BG }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 22px 60px", position: "relative" }}>
        {close}

        {stage === "charter" && (
          <>
            <Eyebrow mb={10}>{CHARTER.title}</Eyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Lock size={18} style={{ color: T.gold }} />
              <Script size={38} style={{ width: "auto" }}>Before you hold</Script>
            </div>
            <Rule mb={16} mt={8} />
            {CHARTER.lines.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <Check size={16} style={{ color: T.sage, marginTop: 3, flexShrink: 0 }} />
                <Hand size={19} color={T.inkSoft}>{l}</Hand>
              </div>
            ))}
            <button onClick={() => { acceptCharter(); setStage("loading"); }} style={{ ...primaryBtn, marginTop: 14 }}>
              {CHARTER.cta}
            </button>
          </>
        )}

        {stage === "loading" && (
          <div style={{ paddingTop: 90, textAlign: "center" }}>
            <Hand size={22} color={T.inkSoft}>Looking for someone to hold…</Hand>
          </div>
        )}

        {stage === "keypending" && (
          <>
            {head("Held under lock")}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, marginBottom: 14 }}>
              <Lock size={14} style={{ color: T.gold }} />
              <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, fontWeight: 600 }}>End-to-end encrypted</span>
            </div>
            <Hand size={21} color={T.inkSoft} style={{ marginBottom: 22 }}>
              She wrote this for one pair of hands only. Her key is on its way to yours — no one in between can read it, not even us. This opens the moment it arrives.
            </Hand>
            <button onClick={onClose} style={primaryBtn}>I{"’"}ll come back</button>
          </>
        )}

        {stage === "keytimeout" && (
          <>
            {head("Still sealed")}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, marginBottom: 14 }}>
              <Lock size={14} style={{ color: T.gold }} />
              <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, fontWeight: 600 }}>End-to-end encrypted</span>
            </div>
            <Hand size={21} color={T.inkSoft} style={{ marginBottom: 22 }}>
              Her key hasn{"’"}t reached your device yet — with maximum-privacy entries, only her device can hand it over, and she hasn{"’"}t been back since. Nothing is lost: it can still open if she returns, and it goes back to her if it isn{"’"}t opened in time. You don{"’"}t need to keep waiting.
            </Hand>
            <button onClick={() => { keyTriesRef.current = 0; setStage("keypending"); }} style={secondaryBtn}>Check once more</button>
            <button onClick={claim} style={{ ...secondaryBtn, marginTop: 12 }}>Hold someone else</button>
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 12 }}>Done</button>
          </>
        )}

        {stage === "idle" && (
          <>
            {head("Quiet for now")}
            {gateChip}
            <Hand size={21} color={T.inkSoft} style={{ marginTop: 16, marginBottom: 22 }}>
              No one is waiting to be held this moment. That{"’"}s a good thing. Come back later and hold space then.
            </Hand>
            <button onClick={claim} style={secondaryBtn}>Look again</button>
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 12 }}>Done</button>
          </>
        )}

        {stage === "reading" && (
          <>
            {head("One sister wrote this")}
            <Hand size={19} color={T.inkSoft} style={{ marginTop: 8, marginBottom: 6 }}>
              From {PHASE_COHORT[request?.match_phase] || PHASE_COHORT.unknown}. {rerouted ? "Sent on to you after waiting. " : ""}Read it once. Answer with one line, or hold it in silence.
            </Hand>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <ShieldOff size={13} style={{ color: T.muted }} />
              <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>Held in confidence — please don{"’"}t screenshot or copy.</span>
            </div>
            <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "20px 20px 22px", marginBottom: 20, userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none", filter: obscured ? "blur(18px)" : "none", transition: "filter 80ms" }}>
              <Hand size={22} color={T.ink}>{entryText ? `“${entryText}”` : "This entry couldn’t be opened on this device."}</Hand>
            </div>

            <Eyebrow mb={10}>Answer with one line</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {RESPONSES.map((r) => {
                const Icon = RESPONSE_ICON[r.code];
                return (
                  <button key={r.code} onClick={() => act("respond", r.code)} disabled={busy} style={{
                    display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                    background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12,
                    padding: "12px 10px", fontFamily: UI, fontSize: 13, fontWeight: 600, color: T.ink,
                    cursor: busy ? "default" : "pointer" }}>
                    <Icon size={15} style={{ color: T.gold }} /> {r.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => act("pass")} disabled={busy} style={{ ...secondaryBtn, flex: 1 }}>Pass in silence</button>
              <button onClick={report} disabled={busy} aria-label="Report this entry" style={{
                width: 46, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12, cursor: "pointer" }}>
                <Flag size={15} style={{ color: T.muted }} />
              </button>
            </div>
          </>
        )}

        {stage === "done" && (
          <>
            {head("Held")}
            {gateChip}
            <div style={{ marginTop: 16, marginBottom: 20, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "18px 18px 20px", textAlign: "center" }}>
              <Check size={26} style={{ color: T.sage, marginBottom: 8 }} />
              <Hand size={21} color={T.ink}>{doneLine(outcome)}</Hand>
            </div>
            <button onClick={claim} style={secondaryBtn}>Hold another</button>
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 12 }}>Done</button>
          </>
        )}

        {stage === "removed" && (
          <>
            {head("Resting from holding")}
            <Hand size={21} color={T.inkSoft} style={{ marginTop: 14, marginBottom: 20 }}>
              You{"’"}re paused from holding space for now. The wall keeps everyone safe, including you. You can still write and ask for a witness.
            </Hand>
            <button onClick={onClose} style={primaryBtn}>Close</button>
          </>
        )}

        {stage === "error" && (
          <>
            {head("Not just now")}
            <Hand size={21} color={T.inkSoft} style={{ marginTop: 14, marginBottom: 20 }}>
              {available ? "That didn’t open just now. Check your connection and try again." : "This browser can’t open held entries safely. Try a recent browser over https."}
            </Hand>
            <button onClick={onClose} style={primaryBtn}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}

function doneLine(outcome) {
  if (outcome === "passed") return "You held it in silence. That counts.";
  if (outcome === "reported") return "Reported and hidden. Thank you for keeping the space safe.";
  const map = { holding_with_you: "Holding with you", me_too: "Me too", not_alone: "Not alone", i_hear_you: "I hear you" };
  return `You answered: “${map[outcome] || "held"}”. One line was enough.`;
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
