// PhaseTwin — the 12-day Phase Twin container (Q4).
//
// Two women in the same cycle phase are paired for 12 days. Each day one shared
// prompt; you write your answer; your twin's answer stays BLURRED until you write
// yours (the gate is server-enforced in getTwinDay, mirrored here in the UI). Day
// 12 archives the pairing. Anonymous, hashes-only — no names, no chat, one prompt
// and one answer each, mutual. Editorial cream/ink, Lucide only, no emoji.

import { useState, useEffect, useRef, useMemo } from "react";
import { Users, Lock, Check, X, ArrowRight, ShieldAlert, Phone, MessageSquareText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PAPER_BG, T, UI, Script, Hand, Eyebrow, Rule, useEscape } from "../Editorial";
import { twinHash, twinAvailable, currentPair, rememberPair, forgetPair } from "./twinAnon";
import { TWIN_DAYS, MAX_ANSWER_CHARS, promptForDay, PHASE_COHORT } from "./twinConfig";
import { crisisCheck } from "../echo/echoScrub";
import { CRISIS_RESOURCES } from "../echo/echoConfig";
import { useScrollLock } from "@/utils/useScrollLock";

export default function PhaseTwin({ user, phase = null, profile = null, onClose }) {
  useScrollLock(true);   // lock the background page while this full-screen overlay is open
  const available = useMemo(() => twinAvailable(), []);
  const [view, setView] = useState("loading"); // loading|intro|pending|day|archived|error
  const [pair, setPair] = useState(null);
  const [dayData, setDayData] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [staleNote, setStaleNote] = useState(false);   // M11: an earlier pairing closed
  const pollRef = useRef(null);
  const cohort = PHASE_COHORT[phase] || PHASE_COHORT.unknown;
  useEscape(onClose);

  const join = async () => {
    const wh = await twinHash(user?.id);
    const r = await base44.functions.invoke("joinTwin", {
      user_id: user?.id, twin_hash: wh, phase: phase || "unknown",
      life_stage: profile?.life_stage || undefined, language: profile?.language || "en-GB",
    });
    return (r?.data ?? r)?.pair || null;
  };

  const loadDay = async (pairId, day) => {
    const wh = await twinHash(user?.id);
    const r = await base44.functions.invoke("getTwinDay", {
      user_id: user?.id, twin_hash: wh, pair_id: pairId, day,
    }).catch(() => null);
    const d = r?.data ?? r;
    // M11: a remembered pairing that's gone/abandoned shouldn't silently dump the
    // user at "intro" with no explanation — note it so we can say so.
    if (!d || d.gone) { forgetPair(); setPair(null); setStaleNote(true); setView("intro"); return; }
    setPair((prev) => ({ ...(prev || {}), id: pairId, status: d.status, day: d.day, currentDay: d.currentDay, paired: d.paired }));
    if (d.status === "pending") { setView("pending"); startPoll(); return; }
    setDayData({ day: d.day, mine: d.mine, twin: d.twin, twinAnswered: d.twinAnswered });
    setDraft(d.mine?.body || "");
    setView(d.status === "archived" ? "archived" : "day");
  };

  const startPoll = () => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const pr = await join().catch(() => null);
      if (pr?.status === "active") { clearInterval(pollRef.current); loadDay(pr.id); }
    }, 15000);
  };

  useEffect(() => {
    if (!available) { setView("error"); return; }
    const pid = currentPair();
    if (pid) loadDay(pid); else setView("intro");
    return () => clearInterval(pollRef.current);
  }, []);

  const handleJoin = async () => {
    if (busy) return; setBusy(true);
    try {
      const pr = await join();
      if (!pr?.id) { setView("error"); return; }
      rememberPair(pr.id);
      setPair(pr);
      if (pr.status === "active") loadDay(pr.id);
      else { setView("pending"); startPoll(pr.id); }
    } catch (e) { console.error("joinTwin failed:", e); setView("error"); }
    finally { setBusy(false); }
  };

  const handleShare = async () => {
    if (busy || draft.trim().length < 1 || !pair?.id) return;
    // Crisis interception (B1) — a heavy disclosure never goes to a stranger.
    if (crisisCheck(draft).intercept) { setView("crisis"); return; }
    setBusy(true);
    try {
      const wh = await twinHash(user?.id);
      const day = pair.currentDay || pair.day;
      const prompt = promptForDay(day);
      const res = await base44.functions.invoke("postTwinEntry", {
        user_id: user?.id, twin_hash: wh, pair_id: pair.id, day, prompt_key: prompt.key, body: draft.trim(),
      });
      const d = res?.data ?? res;
      if (d?.intercept) { setView("crisis"); return; }     // server belt-and-braces
      // M4: don't ignore the result — on a server error (not active / wrong day) the
      // reload below resyncs the UI to the true state rather than failing silently.
      if (d?.error) console.warn("postTwinEntry rejected:", d.error);
      await loadDay(pair.id, day);
    } catch (e) { console.error("postTwinEntry failed:", e); }
    finally { setBusy(false); }
  };

  const handleLeave = () => {
    // M11: tell the server to drop a pending search so it doesn't linger in the pool.
    if (pair?.id) {
      (async () => {
        try {
          const wh = await twinHash(user?.id);
          base44.functions.invoke("cancelTwin", { user_id: user?.id, twin_hash: wh, pair_id: pair.id }).catch(() => {});
        } catch { /* best effort */ }
      })();
    }
    forgetPair(); clearInterval(pollRef.current);
    setPair(null); setDayData(null); setDraft(""); setView("intro");
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
      <Eyebrow mb={10}>Phase Twin · {sub}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Users size={20} style={{ color: T.gold }} />
        <Script size={42} style={{ width: "auto" }}>Phase Twin</Script>
      </div>
    </>
  );
  const progress = (day) => (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 14, marginBottom: 18 }}>
      {Array.from({ length: TWIN_DAYS }).map((_, i) => (
        <div key={i} style={{ width: 18, height: 5, borderRadius: 3, background: i < day ? T.gold : T.paperDeep }} />
      ))}
    </div>
  );

  const mineWritten = !!(dayData?.mine && (dayData.mine.body || "").trim());
  const day = pair?.day || dayData?.day || 1;
  const prompt = promptForDay(day);

  return (
    <div role="dialog" aria-modal="true" aria-label="Phase Twin" className="fw-sheet-safe" style={{ position: "fixed", inset: 0, zIndex: 60, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", ...PAPER_BG }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 22px 60px", position: "relative" }}>
        {close}

        {view === "loading" && (
          <div style={{ paddingTop: 90, textAlign: "center" }}>
            <Hand size={22} color={T.inkSoft}>Finding your pairing…</Hand>
          </div>
        )}

        {view === "intro" && (
          <>
            {head("Twelve days, alongside someone")}
            {staleNote && (
              <div style={{ marginTop: 12, marginBottom: 4, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "10px 13px" }}>
                <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, fontWeight: 600 }}>Your earlier pairing has closed. You can find a new twin whenever you{"’"}re ready.</span>
              </div>
            )}
            <Hand size={20} color={T.inkSoft} style={{ marginTop: 8, marginBottom: 16 }}>
              You{"’"}ll be paired with {cohort} for twelve days. One shared question a day. You answer; her answer stays sealed until you write yours. No names, no chat — just two people moving through the same season, side by side.
            </Hand>
            <Rule mb={18} />
            <button onClick={handleJoin} disabled={busy} style={primaryBtn}>
              <Users size={16} style={{ color: T.paperHi }} /> {busy ? "Pairing…" : "Find my twin"}
            </button>
          </>
        )}

        {view === "pending" && (
          <>
            {head("Looking for your twin")}
            <Hand size={21} color={T.inkSoft} style={{ marginTop: 14, marginBottom: 20 }}>
              We{"’"}re matching you with someone in your phase. This can take a little while — you can close this and we{"’"}ll have her waiting when you come back.
            </Hand>
            <button onClick={onClose} style={secondaryBtn}>Close for now</button>
            <button onClick={handleLeave} style={{ ...ghostBtn, marginTop: 12 }}>Cancel the search</button>
          </>
        )}

        {view === "day" && (
          <>
            {head(`Day ${day} of ${TWIN_DAYS}`)}
            {progress(day)}
            <Eyebrow mb={8} color={T.gold}>Today, together</Eyebrow>
            <Hand size={23} color={T.ink} style={{ marginBottom: 18 }}>{prompt.text}</Hand>

            {/* your answer */}
            <Eyebrow mb={8}>Your answer</Eyebrow>
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAX_ANSWER_CHARS}
              placeholder="Write yours…"
              style={{ width: "100%", minHeight: 120, background: T.paperHi, border: `1px solid ${T.paperDeep}`,
                padding: "14px 16px", borderRadius: 3, resize: "none", fontFamily: "Cormorant Garamond,serif",
                fontSize: 19, lineHeight: 1.55, color: T.ink, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
            <button onClick={handleShare} disabled={busy || draft.trim().length < 1} style={{ ...primaryBtn, opacity: (busy || draft.trim().length < 1) ? 0.5 : 1 }}>
              {mineWritten ? "Update my answer" : "Share with your twin"}
            </button>

            {/* her answer — blurred until you write */}
            <div style={{ marginTop: 26 }}>
              <Eyebrow mb={8}>Her answer</Eyebrow>
              {!mineWritten ? (
                <div style={{ position: "relative", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3, padding: "18px 18px", overflow: "hidden" }}>
                  <div style={{ filter: "blur(7px)", userSelect: "none", pointerEvents: "none", fontFamily: "Cormorant Garamond,serif", fontSize: 19, color: T.inkSoft, lineHeight: 1.55 }}>
                    She has written something honest and a little tender, the kind of thing you only say to someone in the same season as you.
                  </div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(244,239,227,0.55)" }}>
                    <Lock size={18} style={{ color: T.gold }} />
                    <span style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, fontWeight: 700, letterSpacing: 0.3, textAlign: "center", padding: "0 24px" }}>
                      Write yours first — then hers unlocks.
                    </span>
                  </div>
                </div>
              ) : dayData?.twin?.body ? (
                <div style={{ background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 3, padding: "18px 18px" }}>
                  <Hand size={20} color={T.ink}>{dayData.twin.body}</Hand>
                </div>
              ) : (
                <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3, padding: "16px 18px" }}>
                  <Hand size={18} color={T.muted}>She hasn{"’"}t written today yet. Hers will appear here when she does.</Hand>
                </div>
              )}
            </div>
          </>
        )}

        {view === "archived" && (
          <>
            {head("Twelve days, held alongside someone")}
            {progress(TWIN_DAYS)}
            <div style={{ marginTop: 4, marginBottom: 20, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3, padding: "18px 18px 20px", textAlign: "center" }}>
              <Check size={26} style={{ color: T.sage, marginBottom: 8 }} />
              <Hand size={21} color={T.ink}>Your twelve days together are complete. You moved through a whole phase beside someone who was in it too — and never had to perform it.</Hand>
            </div>
            <button onClick={handleLeave} style={primaryBtn}>
              <Users size={16} style={{ color: T.paperHi }} /> Find a new twin
            </button>
            <button onClick={onClose} style={{ ...secondaryBtn, marginTop: 12 }}>Done</button>
          </>
        )}

        {view === "crisis" && (
          <>
            <Eyebrow mb={10}>Someone is there, right now</Eyebrow>
            <div style={{ background: T.ink, borderRadius: 14, padding: "20px 20px 22px", marginTop: 12, marginBottom: 18 }}>
              <ShieldAlert size={22} style={{ color: T.blush, marginBottom: 8 }} />
              <Hand size={21} color={T.paperHi} carve={false}>
                This reads as heavy. A twin isn{"’"}t the right shape for tonight — you deserve more than one person can hold, not less. These people are there now.
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
            <button onClick={() => setView(pair?.status === "active" ? "day" : "intro")} style={{ ...secondaryBtn, marginTop: 8 }}>Back</button>
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 12 }}>Close</button>
          </>
        )}

        {view === "error" && (
          <>
            {head("Not just now")}
            <Hand size={21} color={T.inkSoft} style={{ marginTop: 14, marginBottom: 20 }}>
              {available ? "Phase Twin couldn’t load just now. Check your connection and try again." : "This browser can’t pair you safely. Try a recent browser over https."}
            </Hand>
            <button onClick={onClose} style={primaryBtn}>Close</button>
          </>
        )}

        {view === "day" && (
          <button onClick={onClose} style={{ ...ghostBtn, marginTop: 26 }}>
            Close — come back tomorrow <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
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
const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
  cursor: "pointer", padding: 0, fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.muted,
};
