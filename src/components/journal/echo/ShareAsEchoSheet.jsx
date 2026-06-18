// ShareAsEchoSheet — "share as an echo" from the Journal (Phase 3).
//
// The entry point for the Echo Wall. The writer offers a line (seeded from what
// they just wrote, or fresh); Jess scrubs it on-device to a single non-identifying
// line; a crisis intercept can divert to UK support instead of posting; a cooling
// pause + late-night/late-luteal throttle decide when it goes live; then it is
// written to the Echo entity carrying only an anonymous, device-derived hash.
//
// Editorial full-screen overlay — same cream/ink system as the rest of the Journal.

import { useState, useMemo, useEffect } from "react";
import { Waves, ShieldAlert, Lock, Check, X, Phone, MessageSquareText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PAPER_BG, T, UI, HAND, SERIF, PRESS, Script, Hand, Eyebrow, Rule } from "../Editorial";
import { scrubToEcho, crisisCheck } from "./echoScrub";
import { computeCooling } from "./echoSafety";
import {
  authorHash, sourceEntryHash, anonAvailable,
  rememberMine, bumpEchoesToday, echoesToday, atDailyLimit,
} from "./echoAnon";
import { DAILY_ECHO_LIMIT, PHASE_COHORT, CRISIS_RESOURCES } from "./echoConfig";
import { useScrollLock } from "@/utils/useScrollLock";

function relTime(d) {
  const mins = Math.max(0, Math.round((new Date(d).getTime() - Date.now()) / 60000));
  if (mins <= 1) return "in about a minute";
  if (mins < 60) return `in about ${mins} minutes`;
  const hrs = Math.round(mins / 60);
  if (hrs <= 1) return "in about an hour";
  if (hrs < 12) return `in about ${hrs} hours`;
  return "tomorrow morning";
}

export default function ShareAsEchoSheet({
  user, phase = null, cycleDay = null, lifeStage = null,
  seedText = "", sourceEntryId = null, onClose, onShared,
}) {
  useScrollLock(true);   // lock the background page while this full-screen overlay is open
  const [draft, setDraft] = useState(seedText || "");
  const [stage, setStage] = useState("write");   // write | review | crisis | sending | done | blocked
  const [reason, setReason] = useState("");
  const [posting, setPosting] = useState(false);

  const available = useMemo(() => anonAvailable(), []);
  const limited = useMemo(() => atDailyLimit(DAILY_ECHO_LIMIT), [stage]);
  const cohort = PHASE_COHORT[phase] || PHASE_COHORT.unknown;

  // Scrub + cooling are derived from the current draft when we reach review.
  const scrub = useMemo(() => (stage === "review" ? scrubToEcho(draft) : null), [stage, draft]);
  const cooling = useMemo(
    () => (stage === "review" ? computeCooling({ phase, cycleDay }) : null),
    [stage, phase, cycleDay]
  );

  const onOffer = () => {
    const t = draft.trim();
    if (!t) return;
    if (crisisCheck(t).intercept) { setStage("crisis"); return; }
    const s = scrubToEcho(t);
    if (!s.ok) { setReason(s.reason); setStage("blocked"); return; }
    setStage("review");
  };

  const handleShare = async () => {
    if (!scrub?.ok || !available || posting) return;
    // crisis re-check on the final line, belt and braces
    if (crisisCheck(draft).intercept) { setStage("crisis"); return; }
    setPosting(true);
    setStage("sending");
    try {
      const ah = await authorHash(user?.id);
      const seh = sourceEntryId ? await sourceEntryHash(sourceEntryId) : null;
      const c = computeCooling({ phase, cycleDay });
      // Write through the postEcho function — it creates the row under the service
      // identity so created_by never carries the author's user id (true anonymity).
      const res = await base44.functions.invoke("postEcho", {
        action: "post",
        user_id: user?.id,
        body: scrub.line,
        author_hash: ah,
        phase: phase || "unknown",
        life_stage: lifeStage || undefined,
        cycle_day: typeof cycleDay === "number" ? cycleDay : undefined,
        source_entry_hash: seh || undefined,
        live_at: c.liveAt.toISOString(),
        expires_at: c.expiresAt.toISOString(),
        visibility: "all",
      });
      const data = res?.data ?? res;
      if (data?.intercept) { setStage("crisis"); return; }
      if (data?.error === "rate") { setReason("rate"); setStage("blocked"); return; }   // H5 server cap
      const saved = data?.echo;
      if (!saved?.id) throw new Error(data?.error || "no echo returned");
      rememberMine(saved.id);
      bumpEchoesToday();
      onShared?.(saved);
      setStage("done");
    } catch (err) {
      console.error("Share echo failed:", err);
      setReason("network");
      setStage("blocked");
    } finally {
      setPosting(false);
    }
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", ...PAPER_BG }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 22px 60px", position: "relative" }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 26, right: 18, width: 34, height: 34, borderRadius: "50%",
          background: T.paperHi, border: `1px solid ${T.paperDeep}`, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={16} style={{ color: T.muted }} />
        </button>

        <Eyebrow mb={10}>The Echo Wall · A line, held</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Waves size={20} style={{ color: T.gold }} />
          <Script size={42} style={{ width: "auto" }}>Share as an echo</Script>
        </div>
        <Hand size={20} color={T.inkSoft} style={{ marginTop: 8, marginBottom: 18 }}>
          One line, anonymous, for {cohort}. No replies, no names. It fades in two days.
        </Hand>
        <Rule mb={18} />

        {/* ── WRITE ── */}
        {stage === "write" && (
          <>
            {limited ? (
              <div style={panel}>
                <Hand size={19} color={T.inkSoft}>
                  You{"’"}ve shared {echoesToday()} echoes today — that{"’"}s the gentle daily limit.
                  Come back tomorrow. Your words keep in the Journal until then.
                </Hand>
              </div>
            ) : (
              <>
                <textarea
                  autoFocus value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="What is true for you right now? Write it however it comes — Jess will gently strip anything that could identify you, and offer one line."
                  rows={6}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "14px 15px", borderRadius: 3,
                    background: T.paperHi, border: `1px solid ${T.paperDeep}`, resize: "none",
                    fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.ink, outline: "none",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                  <Lock size={13} style={{ color: T.muted }} />
                  <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: 0.2 }}>
                    Scrubbed on your device before anything leaves it.
                  </span>
                </div>
                <button onClick={onOffer} disabled={!draft.trim()} style={{
                  ...cta, marginTop: 20, opacity: draft.trim() ? 1 : 0.45,
                }}>
                  Offer a line
                </button>
              </>
            )}
          </>
        )}

        {/* ── REVIEW (the scrubbed line) ── */}
        {stage === "review" && scrub && (
          <>
            <Eyebrow mb={8}>Jess offers</Eyebrow>
            <div style={{ ...panel, borderLeft: `2px solid ${T.gold}` }}>
              <Hand size={24} color={T.ink} carve={false} style={{ lineHeight: 1.4 }}>
                {"“"}{scrub.line}{"”"}
              </Hand>
            </div>
            {scrub.removed.length > 0 && (
              <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>
                Removed before sharing: {scrub.removed.join(", ")}.
              </p>
            )}
            {cooling && (
              <div style={{ ...panel, marginTop: 14, background: "transparent", border: `1px dashed ${T.paperDeep}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <ShieldAlert size={15} style={{ color: T.gold }} />
                  <Eyebrow>Before it goes up</Eyebrow>
                </div>
                <Hand size={18} color={T.inkSoft}>{cooling.note}</Hand>
                <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 8 }}>
                  It would go live {relTime(cooling.liveAt)} and fade two days after.
                </p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              <button onClick={handleShare} disabled={!available} style={{ ...cta, flex: 1, minWidth: 150, opacity: available ? 1 : 0.5 }}>
                Share this line
              </button>
              <button onClick={() => setStage("write")} style={ghost}>Edit first</button>
              <button onClick={onClose} style={ghost}>Keep private</button>
            </div>
            {!available && (
              <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 12 }}>
                This browser can{"’"}t create an anonymous token right now, so the echo can{"’"}t be shared. Your words stay safely in the Journal.
              </p>
            )}
          </>
        )}

        {/* ── CRISIS INTERCEPT (never posts) ── */}
        {stage === "crisis" && (
          <>
            <div style={{ ...panel, background: T.dusk, border: "none" }}>
              <Hand size={22} color="#F5E6D3" carve={false} style={{ lineHeight: 1.45 }}>
                This sounds heavy. A peer isn{"’"}t the right shape for tonight. You deserve more than a sister can hold — not less. More.
              </Hand>
            </div>
            <Eyebrow mb={10} color={T.inkSoft} >Someone is there, right now</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CRISIS_RESOURCES.map((r) => (
                <div key={r.name} style={{ ...panel, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {r.sms ? <MessageSquareText size={17} style={{ color: T.gold, marginTop: 2 }} /> : <Phone size={17} style={{ color: T.gold, marginTop: 2 }} />}
                  <div>
                    <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 700, color: T.ink }}>{r.name}</div>
                    <div style={{ fontFamily: UI, fontSize: 13, color: T.inkSoft, marginTop: 2 }}>{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 14, lineHeight: 1.55 }}>
              What you wrote was not shared anywhere. It is still yours, in the Journal.
            </p>
            <button onClick={onClose} style={{ ...cta, marginTop: 18 }}>Close</button>
          </>
        )}

        {/* ── SENDING ── */}
        {stage === "sending" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(168,137,63,0.25)", borderTopColor: T.gold, margin: "0 auto" }} />
            <Hand size={19} color={T.inkSoft} style={{ marginTop: 16 }}>Letting it go…</Hand>
          </div>
        )}

        {/* ── DONE ── */}
        {stage === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", margin: "0 auto 14px", background: T.wax, border: `1px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={20} style={{ color: T.gold }} />
            </div>
            <Script size={34} style={{ marginBottom: 8 }}>It{"’"}s held</Script>
            <Hand size={19} color={T.inkSoft} style={{ marginBottom: 20 }}>
              Your line will sit quietly, then go up for {cohort}. You can pull it back from the wall while it{"’"}s cooling.
            </Hand>
            <button onClick={onClose} style={cta}>Done</button>
          </div>
        )}

        {/* ── BLOCKED ── */}
        {stage === "blocked" && (
          <div style={{ padding: "10px 0" }}>
            <div style={{ ...panel }}>
              <Hand size={20} color={T.inkSoft}>
                {reason === "rate"
                  ? "That’s five echoes today — the wall rests after that. Come back tomorrow."
                  : reason === "network"
                  ? "That didn’t send just now — check your connection and try again. Nothing was shared."
                  : reason === "too-little-left"
                  ? "Once the identifying parts were removed, there wasn’t enough left to share safely. Try a more general feeling."
                  : "Jess couldn’t make this safe to share anonymously — it still held something identifying. Try saying it more generally."}
              </Hand>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => setStage("write")} style={{ ...cta, flex: 1 }}>Try again</button>
              <button onClick={onClose} style={ghost}>Keep private</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const panel = {
  background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3, padding: "16px 18px",
};
const cta = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: T.ink, color: T.paper, border: "none", borderRadius: 3, padding: "13px 22px",
  cursor: "pointer", fontFamily: HAND, fontWeight: 600, fontSize: 20, textShadow: PRESS,
};
const ghost = {
  background: "transparent", color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 3,
  padding: "13px 18px", cursor: "pointer", fontFamily: HAND, fontWeight: 600, fontSize: 18,
};
