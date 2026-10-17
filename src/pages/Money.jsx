// Money — Track C board #11 ("Money, gently"). Money as an EMOTIONAL, human thing, met with
// kindness — never shame, never "you should be saving more", never girlboss/hustle-finance,
// never investment advice. A soft, un-anxious corner for a subject that's usually all fear.
//
// DECISION (Halli, 2026-07-23): QUALITATIVE only — reuse the EXISTING `Goal` entity with
// `domain:"Money"` for a gentle money-intention; NO new entity, and NO amount-tracking (which
// would import the exact anxiety/optimisation tone Track C has firewalled throughout). Verified
// before building: Goal.domain is a FREE STRING (no new field needed); "Money" is already in
// GrowthLive's DOMAINS, so a kept intention appears correctly in her goals garden.
//
// Content MEASURED thin (~10 genuine gentle-finance items; the rest is business/shopping/cycle-
// work pollution) → LEAN like Nest: an editorial money-ritual spine + a small real shelf + a
// Deals deep-link. No new function.
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Wallet, PiggyBank, Coins, HeartHandshake, Sparkles, MessageCircle, Feather, Tag } from "lucide-react";
import { ExpandDetailCard, decodeEntities } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { GoodLifeSection as Section, GoodLifeShelf as Shelf } from "./GoodLifeRoomParts";
import { useGoodLifeKeep } from "@/components/lifestyle-elite/useGoodLifeKeep";
import "./GoodLifeRoomsClean.css";
import { pickProfile } from "@/utils/userProfile";
import { createPageUrl } from "@/utils";
import { fmtDuration } from "@/utils/duration";
import { isClickbait } from "@/utils/clickbait";
import { cleanTitle } from "@/utils/cleanTitle";

const dayOffset = () => Math.floor(Date.now() / 86400000);
const rotateDaily = (pool, n = 4) => {
  const a = (pool || []).filter(Boolean);
  if (a.length <= n) return a;
  const start = dayOffset() % a.length;
  return Array.from({ length: n }, (_, i) => a[(start + i) % a.length]);
};
const txtOf = (r) => {
  const tags = Array.isArray(r.tags) ? r.tags.join(" ") : (typeof r.tags === "string" ? r.tags : "");
  return `${r.title || ""} ${r.subtitle || ""} ${r.summary || ""} ${r.excerpt || ""} ${tags} ${r.category || ""}`.toLowerCase();
};
const hasAny = (r, kws) => kws.some((k) => txtOf(r).includes(k));
const isFiction = (r) => /STORY|DAILY/.test(String(r.media_type || "")) || /FICTION/.test(String(r.provider || ""));

const NOT = ["marketing budget", "cycle-sync", "follicular", "decoder ring", "tina turner", "glp-1", "peptide", "workout"];
const MONEY = ["money worries", "money mindset", "budgeting", "saving money", "savings", "pension", "cost of living", "personal finance", "financial wellbeing", "frugal", "money diary", "spending", "paycheck to paycheck", "money and mental", "household bills", "money anxiety", "financial cost of being a woman", "financial behavior", "financial behaviour"];

// gentle money-RITUALS (daily, no save). Shame-free, no "should save more", no hustle, no advice.
const RITUALS = [
  "Open the banking app, look, and close it. No action needed — just look without flinching.",
  "Move a fiver into savings, or don't. Either way, notice you got to choose.",
  "Cancel one thing you don't use. Or keep it. The point is you decided, calmly.",
  "Write one money worry down, then shut the notebook. It'll keep till you're ready.",
  "Notice one lovely thing today that money couldn't buy.",
  "A no-spend hour — not a no-spend life. Just an hour of not buying a thing.",
  "If there's a number you've been avoiding, look when you're ready. No verdict attached.",
  "Thank past-you for anything she put by, however small.",
  "Name one kind thing you'll spend on this week without a scrap of guilt.",
  "Check one bill you've been avoiding. Just the one. Then stop for today.",
  "Money is emotional, not only mathematical. Be as gentle with yourself here as anywhere.",
  "Unfollow one account that quietly makes you feel poor. Your feed, your call.",
  "A pound saved isn't a moral win, a pound spent isn't a sin. Loosen the grip a little.",
  "Look at what you value, not only what you owe. Money's meant to serve a life, not rule one.",
  "Ask for the discount, the payment plan, the help. It's not embarrassing — it's sensible.",
  "Let 'enough for now' be a real answer. Not everything needs optimising.",
  "If money feels frightening right now, that's real, and you're not the only one. One small thing. Be kind.",
  "Round up one thing you're genuinely glad you could afford this week.",
];

// gentle money-INTENTIONS — the pick-and-keep list. Kept ones save as Goal(domain:"Money").
const INTENTIONS = [
  "Build a tiny buffer — a little, whenever I can. A cushion, not a fortune.",
  "Open the banking app without dread.",
  "Do one kind money thing for myself this month.",
  "Know roughly where it goes — gently, no spreadsheet, no judgement.",
  "Forgive myself one past money mistake.",
  "Look at money without it looking back at me like a threat.",
];

export default function Money() {
  const [items, setItems] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [userId, setUserId] = useState(null);
  const [kept, setKept] = useState(() => new Set());
  const [expanded, setExpanded] = useState(null);
  const [itemsStatus, setItemsStatus] = useState("loading");
  const [goalStatus, setGoalStatus] = useState("loading");
  const [itemsRetryKey, setItemsRetryKey] = useState(0);
  const [goalRetryKey, setGoalRetryKey] = useState(0);
  const [keeping, setKeeping] = useState("");
  const [keepError, setKeepError] = useState("");
  const uncertain = useRef(new Set());
  const pending = useRef(new Set());
  const ownerRef = useRef(userId);
  useEffect(() => { ownerRef.current = userId; }, [userId]);
  const { saved, saveError, onSave } = useGoodLifeKeep(userId, expanded);
  const sage = cwOf("sage").petal;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500);
        if (alive) { setItems((Array.isArray(rows) ? rows : []).filter((r) => !isClickbait(r && r.title)).map((r) => (r ? { ...r, title: cleanTitle(r.title) } : r))); setItemsStatus("ready"); }
      } catch { if (alive) setItemsStatus("error"); }
    })();
    return () => { alive = false; };
  }, [itemsRetryKey]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (u?.id && alive) {
          if (ownerRef.current !== u.id) { ownerRef.current = u.id; setKept(new Set()); uncertain.current.clear(); }
          setUserId(u.id);
          const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
          const p = pickProfile(profs);
          const nm = String(p?.display_name || u.full_name || "").trim().split(/\s+/)[0] || "";
          if (nm && !/\d/.test(nm) && nm.length <= 16) setFirstName(nm[0].toUpperCase() + nm.slice(1));
          // which money intentions has she already kept? (so we show "kept", not offer duplicates)
          try {
            const gs = await base44.entities.Goal.filter({ user_id: u.id, domain: "Money" });
            if (alive && ownerRef.current === u.id && Array.isArray(gs)) { setKept(new Set(gs.filter(g => g?.user_id === u.id).map(g => (g.title || "").trim()))); setGoalStatus("ready"); }
          } catch { if (alive) setGoalStatus("error"); }
        } else if (alive) setGoalStatus("ready");
      } catch (error) {
        if (alive) {
          const guest = [401, 403].includes(Number(error?.status || error?.response?.status));
          if (guest) { ownerRef.current = null; setUserId(null); setKept(new Set()); uncertain.current.clear(); }
          setGoalStatus(guest ? "ready" : "error");
        }
      }
    })();
    return () => { alive = false; };
  }, [goalRetryKey]);

  // keep a gentle money intention → a Goal(domain:"Money"), reusing existing fields only.
  const keepIntention = useCallback(async (title) => {
    if (!userId) { window.location.assign(createPageUrl("Profile")); return; }
    const exact = title.trim();
    const owner = userId, key = `${owner}:${exact}`;
    if (pending.current.has(key)) return;
    pending.current.add(key);
    setKeeping(exact); setKeepError("");
    const assertOwner = async () => {
      if (ownerRef.current !== owner) throw new Error("Account changed");
      const current = await base44.auth.me();
      if (current?.id !== owner) {
        ownerRef.current = current?.id || null;
        setUserId(current?.id || null); setKept(new Set()); setKeeping(""); setKeepError(""); setGoalStatus("loading");
        setGoalRetryKey(x => x + 1); // re-read the new owner's qualitative intentions
        throw new Error("Account changed");
      }
      if (ownerRef.current !== owner) throw new Error("Account changed");
    };
    try {
      await assertOwner();
      const before = await base44.entities.Goal.filter({ user_id: owner, domain: "Money" });
      await assertOwner();
      const existing = (Array.isArray(before) ? before : []).find(row => row?.user_id === owner && row?.title?.trim() === exact);
      let expectedId = existing?.id;
      if (!expectedId && !uncertain.current.has(key)) {
        await assertOwner();
        uncertain.current.add(key); // a lost create receipt must not trigger a duplicate on Retry
        const created = await base44.entities.Goal.create({ user_id: owner, title: exact, type: "short", domain: "Money", stage: "seed", status: "active", flower: "sunflower", accent: sage, next_action: "" });
        await assertOwner();
        if (!created?.id || (created.user_id && created.user_id !== owner)) throw new Error("Wrong goal acknowledgement");
        expectedId = created.id;
      }
      await assertOwner();
      const after = await base44.entities.Goal.filter({ user_id: owner, domain: "Money" });
      await assertOwner();
      const confirmed = (Array.isArray(after) ? after : []).find(row => row?.user_id === owner && row?.title?.trim() === exact && (!expectedId || row.id === expectedId));
      if (!confirmed?.id) throw new Error("Goal not confirmed");
      uncertain.current.delete(key);
      setKept(s => new Set(s).add(exact));
    } catch { if (ownerRef.current === owner) setKeepError("That intention isn't confirmed yet. Check again before making another."); }
    finally { pending.current.delete(key); if (ownerRef.current === owner) setKeeping(""); }
  }, [userId, sage]);

  const moneyCards = useMemo(() => rotateDaily(items.filter((r) => !isFiction(r) && !hasAny(r, NOT) && hasAny(r, MONEY)), 8).map((r) => {
    const mt = String(r.media_type || "").toUpperCase();
    const isVid = mt === "VIDEO" && r.video_id && r.is_embeddable !== false;
    const isAudio = mt === "PODCAST" && r.audio_url;
    return {
      id: r.id, type: isVid ? "video" : isAudio ? "audio" : "article", _raw: { ...r, source_url: r.source_url || r.episode_url }, sourceName: r.source_name || r.channel_name || "FemWell", actions: [],
      title: decodeEntities(r.title || ""), subtitle: r.source_name || r.channel_name || r.subtitle || "",
      summary: (r.summary || r.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      category: r.category || "Career & Money", cw: "sage", Icon: isVid ? "Film" : isAudio ? "Headphones" : "Wallet", kind: isVid ? "Watch · Money" : isAudio ? "Listen · Money" : "Read · Money",
      meta: [["Clock", fmtDuration(r) || "a calm few minutes"]],
      ...(isVid ? { youtubeId: r.video_id } : {}), ...(isAudio ? { audioSrc: r.audio_url, playerLabel: decodeEntities(r.title || "") } : {}),
    };
  }), [items]);
  const rituals = useMemo(() => rotateDaily(RITUALS, 4), []);
  const intentionButton = (intent) => {
    const exact = intent.trim(), on = kept.has(exact), busy = keeping === exact, check = uncertain.current.has(`${userId}:${exact}`);
    const checkingAccount = goalStatus === "loading" || goalStatus === "error";
    return <button key={intent} type="button" onClick={() => !on && keepIntention(intent)} disabled={on || busy || checkingAccount} aria-pressed={on} className="fw-money-intention"><span>{intent}</span><strong>{on ? "Kept" : busy ? "Checking…" : goalStatus === "error" ? "Account check needed" : goalStatus === "loading" ? "Checking account…" : check ? "Check again" : "Keep this"}</strong></button>;
  };
  return (
    <div className="fw-good-clean fw-money-clean" style={{ minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(124px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle?section=good")} aria-label="Back to Good life" className="fw-elite-press fw-good-back"><ArrowLeft size={19}/></button>
        <header className="fw-good-hero fw-money-hero"><span className="fw-good-path">GOOD LIFE / MONEY</span><span className="fw-money-ledger" aria-hidden="true"/><span className="fw-money-bloom" aria-hidden="true"/><span className="fw-money-ring" aria-hidden="true"/><h1>Money</h1><p>Gently, and at your pace. No maths lecture.</p></header>
        <details className="fw-good-context"><summary>A note before you begin <span aria-hidden="true">+</span></summary><div className="fw-good-context-body">
          <div className="fw-good-context-row"><HeartHandshake size={16}/><div><strong>No verdict here</strong><p>{firstName ? `${firstName}, ` : ""}money can feel complicated. One small look is enough.</p></div></div>
          <div className="fw-good-context-row"><PiggyBank size={16}/><div><strong>Qualitative only</strong><p>No balance, target, score or investment recommendation. These intentions are yours to change.</p></div></div>
        </div></details>

        <Section Icon={Coins} title="One small money thing" accent={sage}><div className="fw-money-one"><Coins size={22}/><p>{rituals[0]}</p></div></Section>
        <Section Icon={PiggyBank} title="Keep a gentle intention" accent={cwOf("gold").petal} sub="A direction, not a target. It appears in your goals garden.">
          {intentionButton(INTENTIONS[0])}
          {keepError && <p role="alert" className="fw-money-error">{keepError}</p>}
          {goalStatus === "error" && <div role="alert" className="fw-good-load-error">Your kept intentions couldn't be checked. <button type="button" onClick={() => { setGoalStatus("loading"); setGoalRetryKey(x => x + 1); }}>Try again</button></div>}
        </Section>

        <details className="fw-good-library"><summary>More gentle ideas · intentions and reads <span aria-hidden="true">+</span></summary>
          <Section Icon={Coins} title="Three more small things" accent={sage}><div className="fw-money-more">{rituals.slice(1).map((r,i)=><p key={i}>{r}</p>)}</div></Section>
          <Section Icon={PiggyBank} title="Other intentions" accent={cwOf("gold").petal}><div className="fw-money-intentions">{INTENTIONS.slice(1).map(intentionButton)}</div></Section>
          <Section Icon={Wallet} title="Worth a read" accent={cwOf("plum").petal}><Shelf room="money" cards={moneyCards} onOpen={setExpanded} empty={itemsStatus === "loading" ? "Finding money reads…" : itemsStatus === "error" ? "" : "No money read just now."}/></Section>
          {itemsStatus === "error" && <div role="alert" className="fw-good-load-error">The reads didn't arrive. <button type="button" onClick={() => { setItemsStatus("loading"); setItemsRetryKey(x => x + 1); }}>Try again</button></div>}
        </details>
        <details className="fw-good-library"><summary>Elsewhere · Jess, Community, Journal, Deals <span aria-hidden="true">+</span></summary><div className="fw-good-door-list">
          <a href={createPageUrl("Jess")}><Sparkles size={18}/><span>Talk it through with Jess<small>Start with what feels awkward</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Community")}><MessageCircle size={18}/><span>Visit Community<small>Ask or share only if you want to</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Journal")}><Feather size={18}/><span>Put the worry into words<small>A private page, no numbers required</small></span><span aria-hidden="true">→</span></a>
          <a href={createPageUrl("Deals")}><Tag size={18}/><span>See Deals<small>Offers, only for things you already need</small></span><span aria-hidden="true">→</span></a>
        </div></details>
      </div>
      {expanded && <ExpandDetailCard item={expanded} onClose={() => setExpanded(null)} presentation="focused" room="good" saved={saved} onSave={onSave} error={saveError}/>}
    </div>
  );
}
