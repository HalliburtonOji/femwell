// VoiceNoteComposer (Community M4) — async voice-note capture.
//
// Records in-browser (MediaRecorder) → optional voice mask (a mild offline pitch-shift,
// honest framing: "harder to recognise, not anonymous") → uploads (Base44 UploadFile) →
// postVoiceNote. DELIVERY IS DORMANT: until an STT provider key exists, a posted note is
// HELD and never reaches a listener — the UI says so plainly. This component is mounted
// only when VOICE_NOTES_ENABLED is true, so it stays invisible in the live app for now.
//
// No emoji. Editorial kit. UK English.

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Trash2, Send, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, UI, Eyebrow, Hand } from "@/components/journal/Editorial";
import { communityHash } from "@/components/community/communityAnon";

const MAX_SEC = 90;

// ── a tiny WAV (PCM16) encoder for the masked render ─────────────────────────
function encodeWav(audioBuffer) {
  const numCh = 1;                          // mono is plenty for a voice-note
  const sr = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0);
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  const wstr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  wstr(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); wstr(8, "WAVE");
  wstr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true); view.setUint32(28, sr * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  wstr(36, "data"); view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) { const s = Math.max(-1, Math.min(1, samples[i])); view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); off += 2; }
  return new Blob([view], { type: "audio/wav" });
}

// Mild pitch-shift: render the clip slower so the pitch drops a little. Honest masking —
// it makes a voice harder to place, it does NOT make it anonymous (we say so in the UI).
async function maskBlob(blob) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || !window.OfflineAudioContext) return blob;
    const arrBuf = await blob.arrayBuffer();
    const ctx = new AC();
    const decoded = await ctx.decodeAudioData(arrBuf);
    ctx.close();
    const rate = 0.84;                       // lower = deeper + slightly longer
    const len = Math.ceil(decoded.length / rate);
    const off = new OfflineAudioContext(1, len, decoded.sampleRate);
    const src = off.createBufferSource();
    src.buffer = decoded;
    src.playbackRate.value = rate;
    src.connect(off.destination);
    src.start(0);
    const rendered = await off.startRendering();
    return encodeWav(rendered);
  } catch (e) { console.error("mask failed, sending unmasked:", e); return blob; }
}

export default function VoiceNoteComposer({ user, onCancel, surface = "community" }) {
  const [phase, setPhase] = useState("idle");   // idle | recording | recorded | posting | held
  const [secs, setSecs] = useState(0);
  const [masked, setMasked] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const blobRef = useRef(null);
  const timerRef = useRef(null);

  const stopTracks = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => () => { stopTracks(); if (previewUrl) URL.revokeObjectURL(previewUrl); }, [stopTracks, previewUrl]);

  const start = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser can't record audio. Try a different one.");
      return;
    }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { setError("Microphone access denied. Allow the mic and try again."); return; }
    streamRef.current = stream;
    chunksRef.current = [];
    const rec = new MediaRecorder(stream);
    recRef.current = rec;
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPhase("recorded");
      stopTracks();
    };
    rec.start();
    setSecs(0); setPhase("recording");
    timerRef.current = setInterval(() => {
      setSecs((s) => { const n = s + 1; if (n >= MAX_SEC) stop(); return n; });
    }, 1000);
  };

  const stop = () => { try { recRef.current?.state === "recording" && recRef.current.stop(); } catch { /* noop */ } };

  const discard = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    blobRef.current = null; setPreviewUrl(""); setSecs(0); setError(""); setPhase("idle");
  };

  const post = async () => {
    if (!blobRef.current) return;
    setPhase("posting"); setError("");
    try {
      let blob = blobRef.current;
      if (masked) blob = await maskBlob(blob);
      const ext = blob.type.includes("wav") ? "wav" : "webm";
      const file = new File([blob], `voicenote.${ext}`, { type: blob.type });
      const up = await base44.integrations.Core.UploadFile({ file });
      const audio_url = up?.file_url || up?.data?.file_url;
      if (!audio_url) throw new Error("upload failed");
      const wh = await communityHash(user?.id);
      const r = await base44.functions.invoke("postVoiceNote", {
        user_id: user?.id, author_hash: wh, audio_url, duration_sec: secs, masked, surface: String(surface).slice(0, 40),
      });
      const d = r?.data ?? r;
      if (!d?.ok) throw new Error("post failed");
      setPhase("held");
    } catch (e) {
      console.error("voice note post failed:", e);
      setError("That didn't send. Try again in a moment.");
      setPhase("recorded");
    }
  };

  const mm = String(Math.floor(secs / 60)).padStart(1, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <section style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 6, padding: "16px 17px", marginBottom: 16 }}>
      <Eyebrow color={T.gold} mb={6}>A voice note</Eyebrow>
      <Hand size={16} color={T.muted} style={{ marginBottom: 12 }}>
        Say it out loud — a sister holds it, then it fades. Up to 90 seconds.
      </Hand>

      {phase === "held" ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.sage, marginBottom: 6 }}>
            <ShieldCheck size={16} /> <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700 }}>Held safely.</span>
          </div>
          <Hand size={16} color={T.inkSoft}>
            It's saved, but not passed on yet. Voice notes are screened for safety before anyone hears them — that screening goes live soon. Nothing you record is delivered until it does.
          </Hand>
          <button onClick={onCancel} style={{ ...btnGhost, marginTop: 12 }}>Done</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {phase === "idle" && (
              <button onClick={start} style={btnPrimary}><Mic size={15} /> Record</button>
            )}
            {phase === "recording" && (
              <button onClick={stop} style={{ ...btnPrimary, background: T.crimson }}><Square size={14} /> Stop</button>
            )}
            {(phase === "recording" || phase === "recorded" || phase === "posting") && (
              <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: phase === "recording" ? T.crimson : T.muted, letterSpacing: 0.5 }}>
                {mm}:{ss}{phase === "recording" ? " · recording" : ""}
              </span>
            )}
          </div>

          {phase === "recorded" && previewUrl && (
            <div>
              <audio src={previewUrl} controls style={{ width: "100%", marginBottom: 10 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: UI, fontSize: 12.5, color: T.inkSoft, marginBottom: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={masked} onChange={(e) => setMasked(e.target.checked)} />
                Mask my voice <span style={{ color: T.muted }}>(harder to recognise — not fully anonymous)</span>
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={post} style={btnPrimary}><Send size={14} /> Send it</button>
                <button onClick={discard} style={btnGhost}><Trash2 size={13} /> Re-record</button>
              </div>
            </div>
          )}

          {phase === "posting" && <Hand size={16} color={T.muted}>Sending…</Hand>}
          {error && <div style={{ fontFamily: UI, fontSize: 12, color: T.crimson, marginTop: 10 }}>{error}</div>}
          {phase === "idle" && onCancel && (
            <button onClick={onCancel} style={{ ...btnGhost, marginTop: 4 }}>Cancel</button>
          )}
        </>
      )}
    </section>
  );
}

const btnPrimary = { display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "9px 16px", borderRadius: 999, border: "none", background: T.ink, color: T.paper };
const btnGhost = { display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "8px 14px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: "transparent", color: T.muted };
