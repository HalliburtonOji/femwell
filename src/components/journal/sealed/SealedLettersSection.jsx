// SealedLettersSection — Sealed Letters, living INSIDE the Journal (Phase 2).
//
// Loads the writer's letters, auto-unseals any whose date has arrived (same
// client-side check the Lifestyle surface uses, so the two stay in sync), and
// shows two quiet lists: ready-to-open and still-sealed. Writing opens the
// encrypting composer; opening a ready letter runs the break-seal ritual.

import { useState, useEffect, useMemo } from "react";
import { Lock, MailOpen, Feather, GitBranch } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, UI, HAND, PRESS, Eyebrow, Hand, Script } from "../Editorial";
import { readyToUnseal, formatCountdown, formatLetterDate } from "@/utils/sealedLetters";
import { readEnvelopeMeta, isEncryptedEnvelope } from "@/utils/journalCrypto";
import { isAnniversaryLetter, buildReplyThread, threadSizes, threadKeyOf } from "./sealedThreads";
import SealedLetterCompose from "./SealedLetterCompose";
import BreakSealReader from "./BreakSealReader";

function triggerLabel(letter) {
  const meta = readEnvelopeMeta(letter.body);
  return meta?.trigger?.label || null;
}

function ThreadBadge({ n }) {
  if (!n || n < 2) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: T.gold, marginTop: 3 }}>
      <GitBranch size={10} /> A thread of {n}
    </span>
  );
}

function SealedRow({ letter, threadN }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: `1px solid ${T.paperDeep}` }}>
      <Lock size={15} style={{ color: T.muted, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {letter.title?.trim() || "A sealed letter"}
        </div>
        {triggerLabel(letter) && (
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: 0.3, marginTop: 2 }}>{triggerLabel(letter)}</div>
        )}
        <ThreadBadge n={threadN} />
      </div>
      <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted, flexShrink: 0, letterSpacing: 0.3 }}>
        {formatCountdown(letter.seal_date)}
      </span>
    </div>
  );
}

function AnniversaryCard({ letter, onOpen }) {
  return (
    <button onClick={() => onOpen(letter)} style={{
      width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 16,
      background: T.paperHi, border: `1px solid ${T.gold}`, borderRadius: 4, padding: "18px 20px",
      display: "block",
    }}>
      <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>An anniversary has come round</div>
      <Script size={26} style={{ marginBottom: 6 }}>{letter.title?.trim() || "A year ago, you sealed this for today"}</Script>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <MailOpen size={15} style={{ color: T.gold }} />
        <span style={{ fontFamily: HAND, fontStyle: "italic", fontWeight: 600, fontSize: 17, color: T.ink }}>
          Open the letter you wrote a year ago · sealed {formatLetterDate(letter.created_at || letter.created_date)}
        </span>
      </div>
    </button>
  );
}

function ReadyRow({ letter, onOpen, threadN }) {
  return (
    <button onClick={() => onOpen(letter)} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 0", width: "100%",
      borderTop: `1px solid ${T.paperDeep}`, background: "transparent", border: "none",
      borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: T.paperDeep, cursor: "pointer", textAlign: "left",
    }}>
      <MailOpen size={15} style={{ color: T.gold, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 800, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {letter.title?.trim() || "A letter is ready to open"}
        </div>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: 0.3, marginTop: 2 }}>The date arrived — break the seal</div>
        <ThreadBadge n={threadN} />
      </div>
      {!letter.unseal_seen_at && <span style={{ width: 7, height: 7, borderRadius: 999, background: T.crimson, flexShrink: 0 }} />}
    </button>
  );
}

export default function SealedLettersSection({ user, profile }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [compose, setCompose] = useState(null);   // null | { thread?, seedTriggerType?, replyToLabel? }
  const [openLetter, setOpenLetter] = useState(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        let all = await base44.entities.SealedLetters.filter({ user_id: user.id }, "-created_at").catch(() => []);
        all = Array.isArray(all) ? all : [];
        const eligible = all.filter(readyToUnseal);
        if (eligible.length > 0) {
          const now = new Date().toISOString();
          const updated = await Promise.all(eligible.map((l) =>
            base44.entities.SealedLetters.update(l.id, { unsealed_at: now }).catch(() => l)));
          all = all.map((l) => updated.find((u) => u.id === l.id) || l);
        }
        if (!cancelled) setLetters(all);
      } catch (err) {
        console.error("Sealed letters load failed:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const onSealed = (l) => setLetters((prev) => [l, ...prev]);
  const onSeen = (updated) => {
    setLetters((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setOpenLetter((o) => (o && o.id === updated.id ? updated : o));
  };

  // v2: write back into the same thread (continue a correspondence / annual ritual).
  const onWriteBack = (letter) => {
    setOpenLetter(null);
    setCompose({
      thread: buildReplyThread(letter),
      seedTriggerType: isAnniversaryLetter(letter) ? "anniversary" : "future",
      replyToLabel: letter.title?.trim() || "your last letter",
    });
  };

  const ready = letters.filter((l) => l.unsealed_at);
  const sealed = letters.filter((l) => !l.unsealed_at);
  const sizes = useMemo(() => threadSizes(letters), [letters]);
  // v2: anniversary letters that have arrived but not yet been opened — auto-surfaced.
  const anniversaries = ready.filter((l) => isAnniversaryLetter(l) && !l.unseal_seen_at);

  return (
    <section style={{ marginBottom: 34 }}>
      {compose && (
        <SealedLetterCompose
          profile={profile} onClose={() => setCompose(null)} onSealed={onSealed}
          thread={compose.thread} seedTriggerType={compose.seedTriggerType} replyToLabel={compose.replyToLabel}
        />
      )}
      {openLetter && (
        <BreakSealReader letter={openLetter} onClose={() => setOpenLetter(null)} onSeen={onSeen} onWriteBack={onWriteBack} />
      )}

      <Eyebrow mb={10}>Sealed letters · You, across time</Eyebrow>

      {/* loading */}
      {loading && (
        <Hand size={18} color={T.muted}>Gathering your letters…</Hand>
      )}

      {/* error — still let her write one */}
      {!loading && error && (
        <Hand size={18} color={T.inkSoft}>We couldn{"’"}t reach your letters just now. You can still seal a new one.</Hand>
      )}

      {/* empty */}
      {!loading && !error && letters.length === 0 && (
        <div style={{ background: T.paperHi, borderRadius: 3, padding: "20px 22px", boxShadow: "0 0 0 1px rgba(51,41,28,0.05)" }}>
          <Script size={28} style={{ marginBottom: 6 }}>Write to who you{"’"}ll be</Script>
          <Hand size={18} color={T.inkSoft} style={{ marginBottom: 14 }}>
            A letter to a future you — sealed and encrypted until a date, your next phase, or a year from now. Not even Jess can open it early.
          </Hand>
        </div>
      )}

      {/* v2: anniversary auto-surfacing — a featured card for each arrived anniversary */}
      {!loading && anniversaries.map((l) => (
        <AnniversaryCard key={"anniv-" + l.id} letter={l} onOpen={setOpenLetter} />
      ))}

      {/* populated */}
      {!loading && (ready.length > 0 || sealed.length > 0) && (
        <div>
          {ready.length > 0 && (
            <div style={{ marginBottom: sealed.length ? 18 : 8 }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: T.gold, marginBottom: 2 }}>Ready to open</div>
              {ready.map((l) => <ReadyRow key={l.id} letter={l} onOpen={setOpenLetter} threadN={sizes[threadKeyOf(l)] || 0} />)}
            </div>
          )}
          {sealed.length > 0 && (
            <div>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, marginBottom: 2 }}>Still held</div>
              {sealed.map((l) => <SealedRow key={l.id} letter={l} threadN={sizes[threadKeyOf(l)] || 0} />)}
            </div>
          )}
        </div>
      )}

      {/* write CTA */}
      {!loading && (
        <button onClick={() => setCompose({})} style={{
          marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, background: "transparent",
          border: "none", cursor: "pointer", padding: 0, paddingBottom: 3,
          fontFamily: HAND, fontWeight: 600, fontSize: 20, color: T.ink, textShadow: PRESS, borderBottom: `1px solid ${T.gold}`,
        }}>
          <Feather style={{ width: 14, height: 14 }} /> Write a sealed letter
        </button>
      )}
    </section>
  );
}

// quiet re-export so a future surface can detect encrypted bodies without
// importing the crypto module directly.
export { isEncryptedEnvelope };
