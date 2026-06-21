// ─────────────────────────────────────────────────────────────────────────────
// GrowthLive.jsx — the REAL-ENTITY-WIRED growth features (Phase 0), baked into
// existing pages additively. Approved by Halli (2026-06-21): build live.
//
// Reads/writes REAL base44 entities — Intention · Goal · BucketItem — scoped by
// user_id (base44.auth.me().id), plus rides the existing HabitLogs dispatcher for
// tiny-mission completion and PersonalTasks for "save a day-off". NO new base44
// function. Reuses the pure visuals + seed data from the demo growthKit
// (GrowGlyph · QuickActionSheet · StageLegend · GrowthStyles + the copy banks) so
// the live build matches the approved demos exactly. Does NOT touch flora.jsx /
// BRAND_IDENTITY.md.
//
// HELD (NOT built — gated, awaiting Halli's safety dials: moderation · 18+ · no
// location): any 1:1 connection (sealed-letter pen-pal, matching, DMs). Only Tier 0
// ANONYMOUS connection (resonance + async prompt rooms, no contact) is in scope.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Sprout, Flower2, TreePine, Heart, Sun, Plus, Check, MapPin, Compass } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow } from "@/components/brand/Card";
import { RichBloomV2, FlowerGlyph } from "@/components/brand/flora";
import {
  GrowthStyles, GrowGlyph, StageLegend, QuickActionSheet,
  INTENTION_SUGGESTIONS, LINES_OF_DAY, TINY_MISSIONS, DAYOFF_ACTIVITIES, RESONANCE,
  pickDaily, daySeed,
} from "@/components/demos/growthKit";

const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const STAGE_LABEL = { seed: "Seed", sprout: "Sprouting", budding: "In bud", bloom: "Blooming", sapling: "Taking root", tree: "A standing tree", orchard: "Your orchard" };
const DOMAINS = ["Career", "Money", "Friendship", "Love", "Creativity", "Travel", "Learn", "Joy", "Identity", "Home"];

// Resolve the logged-in user id once (fail-open).
export function useMe() {
  const [id, setId] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    base44.auth.me().then((m) => { if (alive) { setId(m?.id || null); setReady(true); } }).catch(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  return { id, ready };
}

// ═══════════════════════════ DAILY INTENTION (live) ═════════════════════════
export function IntentionLive({ userId }) {
  const [rec, setRec] = useState(null);          // today's Intention entity (or null)
  const [loaded, setLoaded] = useState(false);
  const [setOpen, setSetOpen] = useState(false);
  const [reflectOpen, setReflectOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const accent = T.crimson;
  const dk = dayKey();

  useEffect(() => {
    if (!userId) { setLoaded(true); return; }
    let alive = true;
    base44.entities.Intention.filter({ user_id: userId, day_key: dk }, "-created_date", 1)
      .then((r) => { if (alive) { setRec(r?.[0] || null); setLoaded(true); } })
      .catch(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, [userId, dk]);

  const plant = async (text, source) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const created = await base44.entities.Intention.create({ user_id: userId, day_key: dk, text: text.trim(), source, reflection: "" });
      setRec(created); setSetOpen(false); setDraft("");
    } catch { /* fail-open */ } finally { setBusy(false); }
  };
  const reflect = async (value) => {
    if (!rec || busy) return;
    setBusy(true);
    try { const up = await base44.entities.Intention.update(rec.id, { reflection: value }); setRec(up || { ...rec, reflection: value }); }
    catch { setRec({ ...rec, reflection: value }); }
    finally { setBusy(false); setReflectOpen(false); }
  };

  const reflectionMsg = { bloomed: "Lovely. That one's flowering in your garden now.", half: "Half is growth. Plants don't open in a day.", rested: "Some seeds wait for better weather. No ledger here — plant it again tomorrow if it still matters." };

  return (
    <FwCard accent={accent} Icon={Sprout} eyebrow={rec ? "Today, you're tending" : "Plant the day"} flower="poppy" snap={false} width="100%" minHeight={0} idx="intent-live"
      title={rec ? null : "What do you want to plant today?"}
      line={rec ? null : "A 10-second morning ritual — a value, not a to-do. It rides your day as a quiet compass."}>
      {rec && (
        <div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: T.ink, margin: "0 0 8px", lineHeight: 1.25 }}>“{rec.text}”</p>
          {rec.reflection
            ? <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><FlowerGlyph variant="poppy" size={26} color={accent} idx="intent-done" /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft }}>{reflectionMsg[rec.reflection]}</span></div>
            : <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 12 }}>Carried all day. Tonight, you can water it — no pass or fail.</p>}
        </div>
      )}
      <div style={{ marginTop: "auto", paddingTop: 6 }}>
        {!loaded ? <span style={{ fontFamily: UI, fontSize: 13, color: T.muted }}>…</span>
          : !rec ? <FwCardCTA accent={accent} onClick={() => setSetOpen(true)} icon={Sprout}>Set today's intention</FwCardCTA>
          : !rec.reflection ? <FwCardCTA accent={accent} onClick={() => setReflectOpen(true)} icon={Flower2}>Reflect tonight</FwCardCTA>
          : <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f", display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> Tended today</span>}
      </div>

      <QuickActionSheet open={setOpen} onClose={() => setSetOpen(false)} eyebrow="Set · plant a seed" title="What do you want to plant today?" accent={accent}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
          {INTENTION_SUGGESTIONS.map((s) => <button key={s} disabled={busy} onClick={() => plant(s, "suggestion")} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "7px 12px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.inkSoft, cursor: "pointer" }}>{s}</button>)}
        </div>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="…or write your own" style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none" }} />
        <button onClick={() => plant(draft, "freetext")} disabled={!draft.trim() || busy} style={{ width: "100%", marginTop: 12, background: draft.trim() ? accent : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default" }}>{busy ? "Planting…" : "Plant it"}</button>
      </QuickActionSheet>

      <QuickActionSheet open={reflectOpen} onClose={() => setReflectOpen(false)} eyebrow="Reflect · water it" title={rec ? `How did “${rec.text}” grow today?` : ""} accent={accent}>
        {[["bloomed", "It bloomed", reflectionMsg.bloomed], ["half", "It half-grew", reflectionMsg.half], ["rested", "It rested", reflectionMsg.rested]].map(([val, opt, msg]) => (
          <button key={val} disabled={busy} onClick={() => reflect(val)} style={{ display: "block", width: "100%", textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}>
            <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, display: "block" }}>{opt}</span>
            <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{msg}</span>
          </button>
        ))}
      </QuickActionSheet>
    </FwCard>
  );
}

// ═══════════════════════════ LINE OF THE DAY (live-read) ════════════════════
// Pure render from her signals (daily-seeded); no write. (The full engine layers
// her phase/goal/intention in the app; here it rotates the soulful bank.)
export function LineOfDayLive() {
  const [open, setOpen] = useState(false);
  const lod = pickDaily(LINES_OF_DAY, "lod");
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <FwCard accent={T.gold} Icon={Sun} eyebrow="The line of the day" flower="daffodil" snap={false} width="100%" minHeight={0} idx="lod-live" title={null} line={null}>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, letterSpacing: "0.06em", marginBottom: 6 }}>{today}</div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: T.crimson, lineHeight: 1.4, margin: "0 0 10px" }}>{lod.line}</p>
      <button onClick={() => setOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, padding: 0 }}>Why this line?</button>
      <QuickActionSheet open={open} onClose={() => setOpen(false)} eyebrow="Today's reading" title="Why this line?" accent={T.gold} doneLabel="Lovely" onDone={() => setOpen(false)}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>{lod.why}</p>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>Honest by design: with no real signal it's a gentle seasonal line — never a fake "big things coming." Assembled front-end from your own signals; no new function.</p>
      </QuickActionSheet>
    </FwCard>
  );
}

// ═══════════════════════════ TINY MISSION (live) ════════════════════════════
// Rides the existing HabitLogs dispatcher: completing logs habit_type=mission:<id>.
export function TinyMissionLive({ userId }) {
  const m = pickDaily(TINY_MISSIONS, "mission");
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const dk = dayKey();

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    base44.entities.HabitLogs.filter({ user_id: userId, date: dk, habit_type: `mission:${m.id}` }, "-created_date", 1)
      .then((r) => { if (alive && r?.length) setDone(true); }).catch(() => {});
    return () => { alive = false; };
  }, [userId, dk, m.id]);

  const complete = async () => {
    if (busy) return; setBusy(true);
    try { await base44.entities.HabitLogs.create({ user_id: userId, date: dk, habit_type: `mission:${m.id}`, habit_category: "mindfulness", completed: true, amount: 1, unit: "mission" }); }
    catch { /* fail-open: still show the bloom */ }
    finally { setBusy(false); setDone(true); setOpen(false); }
  };

  return (
    <FwCard accent={m.accent} Icon={m.icon} eyebrow={`Today's tiny mission · ${m.domain}`} flower={m.flower} snap={false} width="100%" minHeight={0} idx={`tm-live-${m.id}`}
      title={done ? null : m.text}
      line={done ? null : "One small thing. Optional, always. Skip it and it's just soil resting — never a broken streak."}>
      {done && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 0" }}>
          <RichBloomV2 form={m.flower} color={m.accent} accent={T.gold} size={92} animate soft idx={`tm-live-done-${m.id}`} />
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.inkSoft, textAlign: "center", margin: 0 }}>Done — {m.reward}. Lovely work.</p>
        </div>
      )}
      {skipped && !done && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted }}>No mission today, then. That's soil resting, not a streak broken — it'll keep.</p>}
      {!done && !skipped && (
        <div style={{ marginTop: "auto", paddingTop: 6, display: "flex", gap: 8 }}>
          <FwCardCTA accent={m.accent} onClick={() => setOpen(true)} icon={Check}>Do it</FwCardCTA>
          <button onClick={() => setSkipped(true)} style={{ background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "0 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, cursor: "pointer", whiteSpace: "nowrap" }}>Not today</button>
        </div>
      )}
      <QuickActionSheet open={open} onClose={() => setOpen(false)} eyebrow={`Tiny mission · ${m.domain}`} title={m.text} accent={m.accent} doneLabel={busy ? "Saving…" : "I did it"} onDone={complete}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>Do it now, or tick it once you have. When you do, {m.reward} — the garden notices.</p>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>They say kindness is the only crop that grows back toward the giver. Rides existing HabitLogs — no new function.</p>
      </QuickActionSheet>
    </FwCard>
  );
}

// ═══════════════════════════ GOALS (live) ═══════════════════════════════════
function AddGoalPopup({ open, onClose, userId, onCreated }) {
  const [title, setTitle] = useState(""); const [type, setType] = useState("short"); const [domain, setDomain] = useState(""); const [busy, setBusy] = useState(false);
  const accent = T.gold;
  const save = async () => {
    if (!title.trim() || busy) return; setBusy(true);
    try {
      const g = await base44.entities.Goal.create({ user_id: userId, title: title.trim(), type, domain, stage: type === "long" ? "sapling" : "seed", status: "active", flower: type === "long" ? "magnolia" : "sunflower", accent: type === "long" ? "#8E6E8E" : T.gold, next_action: "" });
      onCreated(g); setTitle(""); setDomain(""); onClose();
    } catch { onClose(); } finally { setBusy(false); }
  };
  return (
    <QuickActionSheet open={open} onClose={onClose} eyebrow="A new goal" title="Plant a goal" accent={accent}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Framed as identity, not output: “I'm becoming someone who makes things,” not “write 50,000 words.”</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I'm becoming someone who…" style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
        {[["short", "This season (annual)"], ["long", "Life-direction (perennial)"]].map(([v, l]) => (
          <button key={v} onClick={() => setType(v)} style={{ flex: 1, fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "9px 10px", borderRadius: 10, background: type === v ? `${accent}1F` : T.paper, border: `1px solid ${type === v ? accent : T.paperDeep}`, color: type === v ? accent : T.inkSoft, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Which part of life?</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
        {DOMAINS.map((d) => <button key={d} onClick={() => setDomain(d)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "6px 11px", borderRadius: 999, background: domain === d ? `${accent}1F` : T.paper, border: `1px solid ${domain === d ? accent : T.paperDeep}`, color: domain === d ? accent : T.inkSoft, cursor: "pointer" }}>{d}</button>)}
      </div>
      <button onClick={save} disabled={!title.trim() || busy} style={{ width: "100%", background: title.trim() ? accent : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: title.trim() ? "pointer" : "default" }}>{busy ? "Planting…" : "Plant it"}</button>
    </QuickActionSheet>
  );
}

export function GoalsLive({ userId, goals, setGoals }) {
  const [addOpen, setAddOpen] = useState(false);
  const tend = async (g) => { try { await base44.entities.Goal.update(g.id, { progress_note: "tended just now" }); setGoals((gs) => gs.map((x) => x.id === g.id ? { ...x, progress_note: "tended just now" } : x)); } catch {} };
  const items = [...(goals || []), { _add: true }];
  return (
    <>
      <FwCardRow label="What you're growing — goals" Icon={Flower2} accent={T.gold} items={items}
        render={(g) => g._add
          ? <FwCard key="add-goal" accent={T.gold} Icon={Plus} eyebrow="A new goal" flower="primrose" title="Plant a goal"
              line="“I'm becoming someone who…” — a perennial for life-direction, or an annual for this season." idx="add-goal"
              action={<FwCardCTA accent={T.gold} onClick={() => setAddOpen(true)} icon={Plus}>Add a goal</FwCardCTA>} />
          : <FwCard key={g.id} accent={g.accent || T.gold} Icon={g.type === "long" ? TreePine : Flower2}
              eyebrow={`${g.type === "long" ? "Long-term · a perennial" : "This season · an annual"}${g.domain ? " · " + g.domain : ""}`} flower={g.flower || "sunflower"} title={g.title} line={null} idx={`goal-${g.id}`}
              action={<FwCardCTA accent={g.accent || T.gold} onClick={() => tend(g)} icon={Check}>{g.next_action ? `Tend: ${g.next_action}` : "Tend this"}</FwCardCTA>}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0 10px" }}>
                <GrowGlyph stage={g.stage || "seed"} size={56} flower={g.flower || "sunflower"} accent={g.accent || T.gold} color={T.sage} />
                <div>
                  <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: g.accent || T.gold }}>{STAGE_LABEL[g.stage] || "Seed"}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft }}>{g.progress_note || "newly planted"}</div>
                </div>
              </div>
            </FwCard>} />
      <AddGoalPopup open={addOpen} onClose={() => setAddOpen(false)} userId={userId} onCreated={(g) => setGoals((gs) => [g, ...(gs || [])])} />
    </>
  );
}

// ═══════════════════════════ BUCKET LIST (live) ═════════════════════════════
function AddBucketPopup({ open, onClose, userId, onCreated }) {
  const [title, setTitle] = useState(""); const [why, setWhy] = useState(""); const [domain, setDomain] = useState(""); const [busy, setBusy] = useState(false);
  const accent = "#E08A6A";
  const save = async () => {
    if (!title.trim() || busy) return; setBusy(true);
    try { const b = await base44.entities.BucketItem.create({ user_id: userId, title: title.trim(), why: why.trim(), domain, stage: "seed", status: "dreaming", steps: [], flower: "marigold", accent }); onCreated(b); setTitle(""); setWhy(""); setDomain(""); onClose(); }
    catch { onClose(); } finally { setBusy(false); }
  };
  return (
    <QuickActionSheet open={open} onClose={onClose} eyebrow="A new quest" title="Add a big-life mission" accent={accent}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>Dream big and specific — “Go to Spain.” A tree, not a to-do: it grows across seasons, no deadline, no guilt.</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="One day, I want to…" style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", marginBottom: 10 }} />
      <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="why it matters (optional)" style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", marginBottom: 12 }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
        {DOMAINS.map((d) => <button key={d} onClick={() => setDomain(d)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "6px 11px", borderRadius: 999, background: domain === d ? `${accent}1F` : T.paper, border: `1px solid ${domain === d ? accent : T.paperDeep}`, color: domain === d ? accent : T.inkSoft, cursor: "pointer" }}>{d}</button>)}
      </div>
      <button onClick={save} disabled={!title.trim() || busy} style={{ width: "100%", background: title.trim() ? accent : T.paperDeep, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: title.trim() ? "pointer" : "default" }}>{busy ? "Planting…" : "Plant the tree"}</button>
    </QuickActionSheet>
  );
}

export function BucketLive({ userId, items, setItems }) {
  const [addOpen, setAddOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const rows = [...(items || []), { _add: true }];
  return (
    <>
      <FwCardRow label="Big-life missions — your bucket list" Icon={MapPin} accent="#E08A6A" items={rows}
        render={(b) => b._add
          ? <FwCard key="add-bucket" accent="#E08A6A" Icon={Plus} eyebrow="A new quest" flower="marigold" title="Add a big-life mission"
              line="“Go to Spain.” “Learn one whole song.” A tree, not a to-do — long-horizon, no deadline." idx="add-bucket"
              action={<FwCardCTA accent="#E08A6A" onClick={() => setAddOpen(true)} icon={Plus}>Add a quest</FwCardCTA>} />
          : <FwCard key={b.id} accent={b.accent || "#E08A6A"} Icon={MapPin} eyebrow={`Bucket list${b.domain ? " · " + b.domain : ""}`} flower={b.flower || "marigold"} title={b.title} line={b.why || null} idx={`bucket-${b.id}`}
              action={<FwCardCTA accent={b.accent || "#E08A6A"} onClick={() => setOpenId(b.id)} icon={Compass}>See the path</FwCardCTA>}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0 10px" }}>
                <GrowGlyph stage={b.stage || "seed"} size={58} flower={b.flower || "marigold"} accent={b.accent || "#E08A6A"} color="#8FAF8F" />
                <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: b.accent || "#E08A6A" }}>{STAGE_LABEL[b.stage] || "Seed"}</div>
              </div>
              <QuickActionSheet open={openId === b.id} onClose={() => setOpenId(null)} eyebrow={`Bucket list${b.domain ? " · " + b.domain : ""}`} title={b.title} accent={b.accent || "#E08A6A"} doneLabel="Keep tending" onDone={() => setOpenId(null)}>
                <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px" }}>{b.why || "A big mission is a tree, not a to-do — it grows across seasons, and each small step is a bud on the way up."}</p>
                {(b.steps && b.steps.length > 0) && <>
                  <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: b.accent || "#E08A6A", marginBottom: 8 }}>The little steps</div>
                  {b.steps.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "10px 12px", marginBottom: 7 }}><span style={{ width: 22, height: 22, borderRadius: 999, background: `${b.accent || "#E08A6A"}22`, color: b.accent || "#E08A6A", display: "grid", placeItems: "center", fontFamily: UI, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span><span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{s.text || s}</span></div>)}
                </>}
              </QuickActionSheet>
            </FwCard>} />
      <AddBucketPopup open={addOpen} onClose={() => setAddOpen(false)} userId={userId} onCreated={(b) => setItems((it) => [b, ...(it || [])])} />
    </>
  );
}

// ═══════════════════════════ GARDEN GROWTH SECTION ══════════════════════════
// The flagship live view — appended BELOW the NurtureGarden companion (additive;
// the companion is untouched). Goals + bucket list as living flora; a tiny mission
// that waters the garden; the stage-legend key.
export function GardenGrowth() {
  const { id, ready } = useMe();
  const [goals, setGoals] = useState([]);
  const [bucket, setBucket] = useState([]);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    Promise.all([
      base44.entities.Goal.filter({ user_id: id }, "-created_date", 60).catch(() => []),
      base44.entities.BucketItem.filter({ user_id: id }, "-created_date", 60).catch(() => []),
    ]).then(([g, b]) => { if (alive) { setGoals(g || []); setBucket(b || []); } });
    return () => { alive = false; };
  }, [id]);

  return (
    <div style={{ marginTop: 30 }}>
      <GrowthStyles />
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.gold }}>Your whole life, growing</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.muted, margin: "6px auto 0", maxWidth: 360, lineHeight: 1.5 }}>Intentions are seeds, short goals bloom, long goals and big-life quests grow into trees. The stage is the meaning — and rest is a season, never a failure.</p>
      </div>
      <StageLegend />
      <GoalsLive userId={id} goals={goals} setGoals={setGoals} />
      <BucketLive userId={id} items={bucket} setItems={setBucket} />
      <div style={{ maxWidth: 600, margin: "8px auto 0", padding: "0 16px" }}>
        <TinyMissionLive userId={id} />
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, marginTop: 10, textAlign: "center" }}>Each kept intention, goal step and finished mission feeds this garden — the companion above grows from all of it. {ready && !id ? "Sign in to grow your own." : ""}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════ DAY OFF (live-save) ════════════════════════════
// Solo day-off picks (Lifestyle "A day for you"). "Save it for the day" creates a
// PersonalTask (existing entity) so it lands in her planner — a real persisted write.
export function DayOffLive({ userId }) {
  const [i, setI] = useState(daySeed("dayoff") % DAYOFF_ACTIVITIES.length);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const a = DAYOFF_ACTIVITIES[i];
  const save = async () => {
    if (busy || !userId) { setSaved(true); return; } setBusy(true);
    try { await base44.entities.PersonalTasks.create({ user_id: userId, date: dayKey(), title: `A day for you: ${a.title}`, category: "personal", completed: false, notes: a.why }); setSaved(true); }
    catch { setSaved(true); } finally { setBusy(false); }
  };
  return (
    <FwCard accent={a.accent} Icon={Sun} eyebrow={`A day for you · ${a.kind}`} flower={a.flower} idx={`do-live-${a.id}`}
      title={a.title} line={a.why}
      action={saved
        ? <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f", display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> Saved for the day</span>
        : <FwCardCTA accent={a.accent} onClick={save} icon={Heart}>{busy ? "Saving…" : "Save it for the day"}</FwCardCTA>}
      onOpen={() => { setI((i + 1) % DAYOFF_ACTIVITIES.length); setSaved(false); }} openLabel="Show me another" />
  );
}

// ═══════════════════════════ RESONANCE (Tier 0, read-only) ══════════════════
export function ResonanceLive() {
  const r = pickDaily(RESONANCE, "resonance");
  return (
    <FwCard accent="#8FAF8F" Icon={Heart} eyebrow="Someone like you" flower="clover" idx="reso-live"
      title={r.line} line={r.sub}
      action={<span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Anonymous · no contact · just company</span>} />
  );
}

// ═══════════════════════════ TODAY GROWTH STRIP ═════════════════════════════
// Additive surfacing for the live Today page: the daily loop in one block.
export function TodayGrowth() {
  const { id } = useMe();
  return (
    <div style={{ marginTop: 8 }}>
      <GrowthStyles />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <IntentionLive userId={id} />
        <LineOfDayLive />
        <TinyMissionLive userId={id} />
      </div>
      <FwCardRow label="A day for you" Icon={Sun} accent={T.gold} items={[{ id: "do" }]} render={() => <DayOffLive key="do" userId={id} />} />
      <FwCardRow label="Someone like you" Icon={Heart} accent="#8FAF8F" items={[{ id: "re" }]} render={() => <ResonanceLive key="re" />} />
    </div>
  );
}
