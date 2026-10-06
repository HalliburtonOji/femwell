// SkyMovements — movements IV–VIII of the composed horoscope, re-authored in the clean language.
// Each reuses the ORIGINAL section's real data/logic (entities, functions, hooks, classifiers) and
// rebuilds only the presentation (§19.6 rebuild-don't-embed). Split out of SkyFocus so each movement
// stays readable. Parity targets: 6 profections + Saturn · 7 red/white moon · 8 compatibility ·
// 9 ask-the-sky · 10 sky diary (timeline + right-now + void-of-course) · 11 quiet mode ·
// 12 science footer · 13 privacy · 14 atelier · 15 paid shelf.
import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Copy, Check, Lock, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SERIF, UI } from "@/components/journal/Editorial";
import { C, PHASE_CLEAN } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Body, Card, Block, Cta, Quiet, Chip, Meta } from "@/components/brand/cleanKit";
import { decodeSkyPairing, sanitiseSkyLetter, validSkyBirthday } from "./skyCompletion";
import { PLUS_PARKED } from "@/config/plusTier";

const clean = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();
const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s);
const input = { width: "100%", background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: C.ink, outline: "none" };

// ── V · YOUR YEAR — profections + the Saturn-return letter + the transit timeline ──────────────
export function YearMovement({ profections, diary, celestial = false }) {
  const p = profections?.profection || null;
  const saturn = profections?.saturn || null;
  const age = p?.age;
  const showSaturn = saturn && age >= 27 && age <= 30;
  return (
    <Block>
      <Eyebrow cw="plum">Your year</Eyebrow>
      <Title>The house your year is in</Title>
      {p ? (
        <Card wash="plum">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: C.ink, lineHeight: 1 }}>{p.house_label || `House ${p.house}`}</span>
            {p.time_lord ? <Meta>ruled by {p.time_lord}</Meta> : null}
          </div>
          {(p.theme || (celestial && p.lit_house_copy)) ? <Body size={16.5} style={{ textAlign: "center", margin: 0 }}>{clean(p.theme || p.lit_house_copy)}</Body> : null}
          <div style={{ fontFamily: UI, fontSize: celestial ? 12 : 11, color: celestial ? C.slate : C.faint, textAlign: "center", marginTop: 10 }}>{celestial ? "In this tradition, each birthday turns the spotlight to another part of life. No homework attached." : "Annual profections move the emphasis one house each birthday."}</div>
        </Card>
      ) : (
        <Body size={16.5} style={{ textAlign: "center", color: C.slate }}>Add your birth date and your year's house opens here.</Body>
      )}

      {showSaturn ? (
        <Card style={{ marginTop: 14 }}>
          <Eyebrow cw="gold" align="left">Your Saturn return</Eyebrow>
          <Body size={16.5} style={{ fontStyle: "italic" }}>
            {celestial ? <>In astrology, Saturn's return is a coming-of-age chapter: what still fits, and what you've outgrown. Roughly every 29 years; no need to reinvent yourself by Thursday.</> : <>Saturn comes back to where it stood when you were born — roughly once every twenty-nine years.
            It isn't a punishment; it's a structural review. What you built on borrowed shapes gets tested,
            and what's genuinely yours holds. Expect the ground to feel less certain and your own judgement
            to feel more so. Nothing here needs deciding this week.</>}
          </Body>
          <div style={{ fontFamily: UI, fontSize: 11.5, color: C.slate, textAlign: "right" }}>
            {celestial ? "Approximate age-based window · " : ""}{saturn.started ? `From ${new Date(saturn.started).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` : ""}
            {saturn.ends ? ` — ${new Date(saturn.ends).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` : ""} · Astra
          </div>
        </Card>
      ) : null}

      {diary?.columns?.length ? (
        <Card style={{ marginTop: 14 }}>
          <Eyebrow cw="sage" align="left">Your sky diary</Eyebrow>
          <Title align="left" size={20}>The last twelve cycles</Title>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 92, marginBottom: 10 }}>
            {diary.columns.map((col, i) => (
              <div key={i} style={{ flex: 1, position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ height: `${28 + (col.length || 0.5) * 34}%`, borderRadius: 4, background: `${PHASE_CLEAN[col.phase] || C.hair}${col.current ? "" : "66"}` }} />
                {(col.dots || []).map((d, j) => (
                  <span key={j} title={d.label} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: `${18 + j * 16}%`, width: 6, height: 6, borderRadius: 99, background: C.ink }} />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 10.5, color: C.faint, marginBottom: 12 }}><span>12 cycles ago</span><span>now</span></div>
          {diary.rightNow ? (
            <div style={{ paddingTop: 12, borderTop: `1px solid ${C.hair}` }}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>Right now</div>
              <Body size={16} style={{ margin: 0, fontStyle: "italic" }}>{clean(diary.rightNow)}</Body>
            </div>
          ) : null}
          {diary.voidOfCourse ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 12, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: C.slate, background: C.sunk, border: `1px solid ${C.hair}`, borderRadius: 999, padding: "5px 11px" }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.faint }} /> Void-of-course moon · {diary.voidOfCourse}
            </div>
          ) : null}
        </Card>
      ) : null}
    </Block>
  );
}

// ── III (tail) · RED / WHITE MOON — the archetype, honest when there isn't enough data ─────────
export function RedWhiteMoon({ rw, celestial = false, complete = false, loading, error, onRetry }) {
  if (complete) {
    const phases = { new:"new moon",waxing_crescent:"waxing crescent",first_quarter:"first quarter",waxing_gibbous:"waxing gibbous",full:"full moon",waning_gibbous:"waning gibbous",last_quarter:"last quarter",waning_crescent:"waning crescent" };
    const names = { red_moon:"Red moon",white_moon:"White moon",pink_moon:"Pink moon",purple_moon:"Purple moon",mixed:"A moon of your own",insufficient_data:"Your dates, under the Moon" };
    const counts = (rw?.bleeds_at_phases || []).reduce((result, phase) => ({ ...result, [phase]: (result[phase] || 0) + 1 }), {});
    return <Card style={{marginTop:14}}><Eyebrow cw="crimson" align="left">Your cycle &amp; the Moon</Eyebrow>
      <Title align="left" size={21}>{names[rw?.archetype] || "Your dates, under the Moon"}</Title>
      {loading ? <p role="status">Looking at your logged dates…</p> : error ? <><p role="alert">{error}</p><Quiet onClick={onRetry}>Try again</Quiet></> : <>
        {Object.keys(counts).length ? <><Body size={16}>Your last {rw.bleeds_at_phases.length} logged starts:</Body><ul style={{fontFamily:UI,fontSize:13,color:C.ink,paddingLeft:20}}>{Object.entries(counts).map(([phase,count])=><li key={phase}>{cap(phases[phase] || "phase unavailable")} · {count}</li>)}</ul></> : <Body size={16}>No cycle starts here yet. Add a date and we can put it beside the Moon.</Body>}
        {rw?.archetype === "insufficient_data" && Object.keys(counts).length > 0 && <Body size={16}>A pattern needs at least three logged starts. No rush.</Body>}
        <p style={{fontFamily:UI,fontSize:12,lineHeight:1.5,color:C.slate}}>Colour names vary in lunar folklore. Your logged phases are shown above; they aren't a prediction or a personality test.</p>
        <a href="/Health" style={{fontFamily:UI,fontSize:13,color:C.ink,minHeight:44,display:"inline-flex",alignItems:"center"}}>Your cycle dates</a>
      </>}
    </Card>;
  }
  const map = {
    red_moon: { name: "Red moon", body: "You tend to bleed with the full moon — the old name for the woman who turns her energy outward, teaching and making, rather than inward." },
    white_moon: { name: "White moon", body: "You tend to bleed with the new moon — the old name for the inward season, the one that draws energy home and mothers what's close." },
    pink_moon: { name: "Pink moon", body: "Your bleed tends to land between the phases — the old name for a season that's still finding its rhythm, and that's a perfectly good place to be." },
    mixed: { name: "A moon of your own", body: "Your bleed doesn't follow one lunar pattern — most women's don't. The rhythm is yours rather than the moon's." },
  };
  const a = map[rw?.archetype] || null;
  return (
    <Card style={{ marginTop: 14 }}>
      <Eyebrow cw="crimson" align="left">Red &amp; white moon</Eyebrow>
      {a ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ width: 44, height: 44, borderRadius: 99, flexShrink: 0, background: rw.archetype === "red_moon" ? "radial-gradient(circle at 34% 30%, #D2665E, #9E2F27)" : rw.archetype === "white_moon" ? "radial-gradient(circle at 34% 30%, #FBFAF7, #D9D5CB)" : "radial-gradient(circle at 34% 30%, #E8B4B8, #C98A92)", border: `1px solid ${C.hair}` }} />
            <span style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: C.ink }}>{a.name}</span>
          </div>
          <Body size={16} style={{ margin: 0 }}>{a.body}</Body>
        </>
      ) : (
        <Body size={16} style={{ margin: 0, color: C.slate }}>{celestial ? "Full-moon and new-moon bleeding have their own names in lunar folklore. Your pattern isn't connected here yet. Neither timing is better; your body keeps its own calendar." : "Once you've logged a few cycles, the old red/white-moon reading appears here — whether you tend to bleed with the full moon or the new. Folklore, held lightly."}</Body>
      )}
    </Card>
  );
}

// ── VI · ASK THE SKY — the real askStars function + persisted history ──────────────────────────
const ASK_CHIPS = ["What should I put my energy into this week?", "Why does this feel harder than it should?", "What am I not seeing?"];
export function AskTheSky({ userId, inputRef, celestial = false, human=false, complete=false }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [historyRevision, setHistoryRevision] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const owner = useRef(userId); owner.current = userId;

  useEffect(() => {
    let dead = false;
    if (complete) { setHistory([]); setAnswer(""); setQ(""); setHistoryError(""); }
    (async () => {
      if (!userId) return;
      try {
        const threads = await base44.entities.AdviceThreads.filter({ user_id: userId, topic: "horoscope" }, "-created_date", 5);
        if (dead || !Array.isArray(threads)) return;
        const out = [];
        for (const t of threads.filter(thread=> !complete || thread.user_id === userId).slice(0, 5)) {
          try {
            const fetched = await base44.entities.AdviceMessages.filter(complete ? {thread_id:t.id,user_id:userId} : { thread_id: t.id }, "created_date", 4);
            const msgs = complete ? fetched?.filter(message=>message.user_id === userId && message.thread_id === t.id) : fetched;
            const question = msgs?.find((m) => m.role === "user")?.content;
            const ans = msgs?.find((m) => m.role === "assistant")?.content;
            if (question) out.push({ id: t.id, question, answer: ans || "" });
          } catch { if (complete && !dead) setHistoryError("Some earlier answers didn't load. Try again?"); }
        }
        if (!dead) setHistory(out);
      } catch { if (complete && !dead) setHistoryError("Your earlier answers didn't load. Try again?"); }
    })();
    return () => { dead = true; };
  }, [userId, complete, historyRevision]);

  const submit = async (text) => {
    const question = (text || q).trim();
    if (!question || asking) return;
    if (!userId) { setError("Sign in to ask."); return; }
    setError(""); setAsking(true); setAnswer("");
    try {
      const res = await base44.functions.invoke("askStars", { user_id: userId, question });
      if (complete && owner.current !== userId) return;
      const ans = res?.data?.answer || res?.answer || "";
      if (!ans) setError(res?.data?.error || res?.error || "No answer came through.");
      else {
        setAnswer(ans); setQ(question);
        setHistory((prev) => [{ id: res?.data?.thread_id || `t-${Date.now()}`, question, answer: ans }, ...prev].slice(0, 5));
      }
    } catch (e) { setError(e?.message || "Couldn't reach the sky."); }
    finally { setAsking(false); }
  };

  return (
    <Card>
      <Eyebrow cw="lavender" align="left">Ask the sky</Eyebrow>
      <Title align="left" size={21}>Ask it anything</Title>
      {celestial && <p className="sky-note">{human ? "Take a new angle. The deciding vote is still yours." : "A question for the sky. You still get the deciding vote."}</p>}
      {/* notebook-ruled input — the original's signature */}
      <textarea ref={inputRef} aria-label="Your question for the sky" value={q} onChange={(e) => setQ(e.target.value)} rows={3} placeholder="What's on your mind?"
        style={{ ...input, resize: "vertical", lineHeight: "1.7em", backgroundImage: `repeating-linear-gradient(${C.surface} 0px, ${C.surface} calc(1.7em - 1px), ${C.hair} calc(1.7em - 1px), ${C.hair} 1.7em)`, backgroundAttachment: "local" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "10px 0 12px" }}>
        {ASK_CHIPS.map((c) => <Chip key={c} onClick={() => { setQ(c); if (!celestial) submit(c); else inputRef?.current?.focus(); }} style={{ fontSize: celestial ? 12 : 11.5, fontWeight: 600 }}>{celestial ? c : c.length > 34 ? c.slice(0, 32) + "…" : c}</Chip>)}
      </div>
      <Cta Icon={Send} filled={complete} onClick={() => submit()} disabled={asking}>{asking ? "Asking…" : "Ask the sky"}</Cta>
      {error ? <div style={{ fontFamily: UI, fontSize: 12, color: C.crimson, marginTop: 10, textAlign: "center" }}>{error}</div> : null}
      {answer ? (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.hair}` }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, marginBottom: 5 }}>The sky says</div>
          <Body size={16.5} style={{ margin: 0 }}>{clean(answer)}</Body>
        </div>
      ) : null}
      {history.length ? (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.hair}` }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.faint, marginBottom: 6 }}>You've asked before</div>
          {(complete && showHistory ? history : history.slice(0, 3)).map((h) => (
            <button key={h.id} onClick={() => { setQ(h.question); setAnswer(h.answer); }} className="fw-elite-press"
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "8px 0", cursor: "pointer", fontFamily: SERIF, fontSize: 15, color: C.slate, borderTop: `1px solid ${C.hair}` }}>
              <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.question}</span>
              <ChevronRight size={14} color={C.faint} />
            </button>
          ))}
          {complete && history.length > 3 && <Quiet onClick={() => setShowHistory(value => !value)}>{showHistory ? "Show fewer" : `All ${history.length} earlier answers`}</Quiet>}
        </div>
      ) : null}
      {complete && historyError && <div><p role="alert">{historyError}</p><Quiet onClick={()=>setHistoryRevision(value=>value+1)}>Reload earlier answers</Quiet></div>}
    </Card>
  );
}

// ── VI · COMPATIBILITY — the real generateCompatibility fn + the day/month/year drum + copy-link ─
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const Bar = ({ label, val }) => (
  <div style={{ marginBottom: 9 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: C.slate, marginBottom: 4 }}><span>{label}</span><span>{val != null ? `${val}/10` : "—"}</span></div>
    <div style={{ height: 4, borderRadius: 99, background: C.hair, overflow: "hidden" }}><div style={{ width: `${Math.max(0, Math.min(10, val || 0)) * 10}%`, height: "100%", background: C.ink }} /></div>
  </div>
);
export function Compatibility({ userId, celestial = false, human=false, complete=false }) {
  const [name, setName] = useState("");
  const [d, setD] = useState(""); const [m, setM] = useState(""); const [y, setY] = useState("");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [manualLink, setManualLink] = useState("");
  const [resultPair, setResultPair] = useState(null);
  const owner = useRef(userId); owner.current = userId;
  useEffect(() => { if(complete) {setReading(null);setResultPair(null);setManualLink("");} }, [userId, complete]);

  // a shared ?compat= link pre-fills and auto-runs once (the original's shareable-link feature)
  useEffect(() => {
    try {
      const raw = new URLSearchParams(window.location.search).get("compat");
      if (!raw) return;
      const {name:n,birthday:bd} = complete ? decodeSkyPairing(raw) : (()=>{const [name,birthday]=atob(raw).split("|");return {name,birthday};})();
      if (n) setName(n);
      if (bd) { const [yy, mm, dd] = bd.split("-"); setY(yy); setM(String(Number(mm))); setD(String(Number(dd))); }
    } catch (failure) { if(complete) setError(failure.message || "This pairing link couldn't be opened."); }
  }, [complete]);

  const birthday = y && m && d ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` : "";
  const run = async () => {
    if (loading) return;
    setError("");
    if (!userId) { setError("Sign in to run a reading."); return; }
    if (!birthday) { setError("Their birthday is needed."); return; }
    if (complete && !validSkyBirthday(birthday)) { setError("That birthday isn't a real past date. Check the day, month and year."); return; }
    const pair = {name:name.trim(), birthday};
    if (complete) {setReading(null);setCopied(false);setManualLink("");}
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateCompatibility", { user_id: userId, their_name: name.trim(), their_birthday: birthday });
      if (complete && owner.current !== userId) return;
      const row = res?.data?.reading || res?.reading || null;
      if (!row) setError(res?.data?.error || res?.error || "Couldn't read this pairing.");
      else {setReading(row);setResultPair(pair);}
    } catch (e) { setError(e?.message || "Couldn't read this pairing."); }
    finally { setLoading(false); }
  };
  const copyLink = async () => {
    let url = "";
    try {
      const link = new URL(window.location.href);
      if(!human)link.search="";
      link.hash="";link.searchParams.set("compat",complete ? JSON.stringify(resultPair) : btoa(`${name}|${birthday}`));
      url=link.toString();
      await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600);
      if(complete){setManualLink("");setError("");}
    } catch { if(complete){setError("Couldn't copy automatically. Select the link below.");setManualLink(url);} }
  };

  return (
    <Card style={{ marginTop: 14 }}>
      <Eyebrow cw="blush" align="left">You &amp; someone</Eyebrow>
      <Title align="left" size={21}>{human ? "You two, under the stars." : "How you two run"}</Title>
      {celestial && <p className="sky-note">{human ? "Two charts, one conversation starter. Chemistry still has to show up." : "Two charts, plenty to talk about. A conversation starter, never a verdict on someone you love."}</p>}
      <input aria-label="Their name" maxLength={complete ? 100 : undefined} value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name" style={{ ...input, marginBottom: 9 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={d} onChange={(e) => setD(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="Day" inputMode="numeric" aria-label="Day" style={{ ...input, flex: 1, textAlign: "center" }} />
        <select value={m} onChange={(e) => setM(e.target.value)} aria-label="Month" style={{ ...input, flex: 1.3, fontFamily: UI, fontSize: 14 }}>
          <option value="">Month</option>
          {MONTHS.map((mo, i) => <option key={mo} value={i + 1}>{mo}</option>)}
        </select>
        <input value={y} onChange={(e) => setY(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Year" inputMode="numeric" aria-label="Year" style={{ ...input, flex: 1.2, textAlign: "center" }} />
      </div>
      <Cta Icon={Sparkles} onClick={run} disabled={loading}>{loading ? "Reading…" : "Read this pairing"}</Cta>
      {error ? <div style={{ fontFamily: UI, fontSize: 12, color: C.crimson, marginTop: 10, textAlign: "center" }}>{error}</div> : null}
      {reading ? (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.hair}` }}>
          <Bar label="Talk" val={reading.talk_score} />
          <Bar label="Touch" val={reading.touch_score} />
          <Bar label="Trust" val={reading.trust_score} />
          <Bar label="Time" val={reading.time_score ?? reading.grow_score} />
          {reading.summary || reading.body ? <Body size={16} style={{ marginTop: 10 }}>{clean(reading.summary || reading.body)}</Body> : null}
          <div style={{ fontFamily: UI, fontSize: 11, color: C.faint, marginTop: 8 }}>
            <abbr title="Synastry — comparing two charts to each other, the traditional way of reading a pairing." style={{ textDecoration: "none", borderBottom: `1px dotted ${C.faint}`, cursor: "help" }}>Synastry</abbr>, held lightly — never a verdict on a person.
          </div>
          <Quiet onClick={copyLink}>{copied ? <><Check size={13} style={{ verticalAlign: -2 }} /> Link copied</> : <><Copy size={13} style={{ verticalAlign: -2 }} /> Copy a link to this reading</>}</Quiet>
          {complete && <p style={{fontFamily:UI,fontSize:12,color:C.slate}}>The link includes the name and birthday you entered. It opens those details for a new pairing, not your private answer.</p>}
          {complete && manualLink && <input aria-label="Pairing link to copy" readOnly value={manualLink} onFocus={event=>event.target.select()} style={input}/>}
        </div>
      ) : null}
    </Card>
  );
}

// ── VII · THE ATELIER + the paid shelf — the real Stripe checkouts ─────────────────────────────
const PRODUCTS = [
  { key: "year_ahead", title: "The year ahead", price: "£19", line: "Your twelve months, house by house — written, not generated." },
  { key: "chart_atelier", title: "The chart atelier", price: "£29", line: "Your whole chart read as one piece, in Astra's hand." },
  { key: "choose_the_day", title: "Choose the day", price: "£55", line: "A date chosen with you — a move, a launch, a conversation." },
];
export function Atelier({ userId, hasAtelier, letter, celestial = false, complete = false, loading, error, onRetry }) {
  const [busy, setBusy] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const bodyHtml = complete ? sanitiseSkyLetter(letter?.body_html) : "";
  const checkout = async (fn, payload) => {
    if(complete && (!userId || busy)) {if(!userId)setCheckoutError("Sign in to continue.");return;}
    setCheckoutError("");
    setBusy(payload.product_key || "plus");
    try {
      const res = await base44.functions.invoke(fn, { user_id: userId, ...payload });
      const url = res?.data?.url || res?.url;
      if (url) window.location.assign(url);
      else {if(complete)setCheckoutError(res?.data?.error || res?.error || "Checkout isn't available right now.");else console.warn("[atelier] checkout returned no url — price id likely missing in env", res);}
    } catch (e) { if(complete)setCheckoutError("Couldn't open checkout. Try again?");else console.warn("[atelier] checkout failed", e); }
    finally { setBusy(""); }
  };
  return (
    <Block>
      <Eyebrow cw="gold">The atelier</Eyebrow>
      <Title>{complete ? "A letter for the month" : "Written, not generated"}</Title>
      <Card wash="gold">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>
          <Sparkles size={12} /> {complete ? "Astra · AI-assisted astrology" : "Backed by Astra Cole, MA, FAS"}
        </div>
        {complete && loading ? <p role="status">Opening your monthly letter…</p> : complete && error ? <><p role="alert">{error}</p><Quiet onClick={onRetry}>Try again</Quiet></> : hasAtelier && letter ? (
          <>
            <Title align="left" size={20}>{clean(letter.title) || "This month's letter"}</Title>
            {complete && <p style={{fontFamily:UI,fontSize:12,color:C.slate}}>{letter.month || "Your latest published letter"}</p>}
            {complete && bodyHtml ? <div className="sky-letter-body" style={{fontFamily:SERIF,fontSize:16.5,lineHeight:1.65,color:C.ink}} dangerouslySetInnerHTML={{__html:bodyHtml}} /> : <Body size={16.5} style={{ fontStyle: "italic",whiteSpace:complete ? "pre-wrap" : undefined }}>{complete ? letter.body || "This letter has no text yet." : celestial ? clean(letter.body) : clean(letter.body).slice(0, 460)}</Body>}
          </>
        ) : complete && hasAtelier ? <><Title align="left" size={20}>No letter here just yet.</Title><Body size={16.5}>Your published monthly letter will appear here when there's one to read.</Body>{PLUS_PARKED && <p style={{fontFamily:UI,fontSize:12,color:C.slate}}>Monthly-letter access is open during the build.</p>}</>
        : (
          <>
            <Title align="left" size={20}>{complete ? "Your monthly astrology letter" : "A letter each month, in her hand"}</Title>
            <Body size={16.5} style={{ fontStyle: "italic", color: C.slate }}>
              {complete ? "A longer look at the month, using your chart." : "“The year you're in doesn't ask you to become someone else. It asks you to stop rehearsing the person you already stopped being…”"}
            </Body>
            <Cta Icon={Lock} onClick={() => checkout("stripeCheckout", { plan: "plus" })} disabled={!!busy}>
              {busy === "plus" ? "Opening…" : "Unlock the Atelier · £8.99/month"}
            </Cta>
          </>
        )}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {PRODUCTS.map((p) => (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12, background: C.surface, borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 3px rgba(25,21,16,.03)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink }}>{p.title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: C.slate, lineHeight: 1.4, marginTop: 2 }}>{complete ? ({year_ahead:"Your twelve months, house by house.",chart_atelier:"Your whole chart, in one reading.",choose_the_day:"A date for a move, a launch or a conversation."}[p.key]) : p.line}</div>
            </div>
            <button onClick={() => checkout("createOneShotCheckout", { product_key: p.key })} disabled={!!busy} className="fw-elite-press"
              style={{ flexShrink: 0, background: "transparent", border: `1px solid ${C.ink}`, borderRadius: 999, padding: "8px 14px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: C.ink, cursor: "pointer" }}>
              {busy === p.key ? "…" : p.price}
            </button>
          </div>
        ))}
      </div>
      {complete && checkoutError && <p role="alert" style={{fontFamily:UI,fontSize:13,color:C.crimson}}>{checkoutError}</p>}
    </Block>
  );
}

// ── VIII · YOUR SKY, YOUR WAY — quiet mode + soft sky + the science footer + privacy ───────────
function Toggle({ on, onChange, label, sub, disabled }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => !disabled && onChange(!on)} disabled={disabled} className="fw-elite-press"
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "12px 2px", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1, borderTop: `1px solid ${C.hair}` }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: C.ink }}>{label}</span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: C.slate, lineHeight: 1.4, marginTop: 2 }}>{sub}</span>
      </span>
      <span aria-hidden style={{ width: 42, height: 24, borderRadius: 99, flexShrink: 0, background: on ? C.ink : C.hair, position: "relative", transition: "background .18s" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "left .18s" }} />
      </span>
    </button>
  );
}
export function YourWay({ userId, celestial = false, complete = false }) {
  const [quiet, setQuiet] = useState(false);
  const [soft, setSoft] = useState(false);
  const [rowId, setRowId] = useState(null);
  const [pending, setPending] = useState(complete);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);
  const owner = useRef(userId); owner.current = userId;

  useEffect(() => {
    let dead = false;
    if(complete) { setQuiet(false);setSoft(false);setRowId(null);setError("");setStatus("");setPending(!!userId); }
    (async () => {
      if (!userId) return;
      try {
        const rows = await base44.entities.UserPreferences.filter({ user_id: userId }, complete ? "-updated_at" : "-created_date", 1);
        const row = Array.isArray(rows) ? rows.find(row=> !complete || row.user_id === userId) : null;
        if (dead || !row) return;
        setRowId(row.id); setQuiet(!!row.horoscope_quiet_mode); setSoft(!!row.horoscope_soft_sky);
      } catch { if(complete && !dead) setError("Your settings didn't load. Try again before changing them."); }
      finally { if(complete && !dead) setPending(false); }
    })();
    return () => { dead = true; };
  }, [userId,complete,revision]);

  const persist = async (patch) => {
    if (!userId) return;
    const previous = { quiet, soft };
    if(complete) {
      if(busy.current || pending || error) return;
      busy.current = true;setPending(true);setError("");setStatus("");
    }
    try {
      const payload = complete ? {...patch,updated_at:new Date().toISOString()} : patch;
      let savedId = rowId;
      if (rowId) await base44.entities.UserPreferences.update(rowId, payload);
      else {
        const created = await base44.entities.UserPreferences.create({ user_id: userId, ...payload });
        savedId = created?.id || null;
        if(!complete || owner.current === userId)setRowId(savedId);
      }
      if(complete) {
        if(!savedId) throw new Error("No saved settings returned.");
        const rows = await base44.entities.UserPreferences.filter({ user_id:userId,id:savedId }, "-updated_at",1);
        const row = rows?.find(value=>value.user_id === userId && value.id === savedId);
        if(!row || Object.entries(patch).some(([key,value])=>row[key] !== value)) throw new Error("Settings weren't confirmed.");
        if(owner.current === userId) {setQuiet(!!row.horoscope_quiet_mode);setSoft(!!row.horoscope_soft_sky);setStatus("Saved for future readings.");}
      }
    } catch {
      if(complete && owner.current === userId) {setQuiet(previous.quiet);setSoft(previous.soft);setError("Couldn't confirm that change. Your previous setting is still shown.");}
    } finally {busy.current=false;if(complete && owner.current === userId)setPending(false);}
  };
  const setQuietMode = (v) => {
    if(complete && (!userId || busy.current || pending || error)) return;
    setQuiet(v);
    // turning Quiet off also clears Soft sky — otherwise the reading keeps hiding retrogrades she
    // can no longer see the reason for (the original's rule, kept).
    if (!v) { setSoft(false); persist({ horoscope_quiet_mode: false, horoscope_soft_sky: false }); }
    else persist({ horoscope_quiet_mode: true });
  };

  return (
    <Block>
      <Eyebrow cw="sage">Your sky, your way</Eyebrow>
      <Title>How much you want to hear</Title>
      <Card>
        <Toggle on={quiet} disabled={complete && (!userId || pending || !!error)} onChange={setQuietMode} label="Quiet mode" sub={complete ? "Gentler language in future readings." : "Softens the shadow-language in your readings."} />
        <Toggle on={soft} disabled={!quiet || (complete && (!userId || pending || !!error))} onChange={(v) => { if(complete && busy.current)return;setSoft(v); persist({ horoscope_soft_sky: v }); }} label="Soft sky" sub={complete ? "Leaves retrogrades and storm-windows out of future readings." : "Hides retrogrades and storm-windows entirely."} />
        {complete && pending && <p role="status">Checking your settings…</p>}
        {complete && !userId && <p>Sign in to keep your settings.</p>}
        {complete && error && <><p role="alert">{error}</p><Quiet onClick={()=>setRevision(value=>value+1)}>Reload settings</Quiet></>}
        {complete && status && <p role="status">{status}</p>}
      </Card>
      <div style={{ marginTop: 16, padding: "14px 16px", border: `1px dashed ${C.hair}`, borderRadius: 14 }}>
        <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>Where the science sits</div>
        <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, color: C.ink, lineHeight: 1.55, margin: 0 }}>
          {celestial ? <>Moon phases are astronomy. Chart readings are symbolism. Enjoy the perspective; keep your own judgement. <a href="/sky-review/index.html#research" style={{color:C.ink}}>Read the evidence and its limits.</a></> : <>There is real evidence that the lunar cycle can nudge sleep and, for some women, menstrual timing
          (Helfrich-Förster et al., 2021; Cajochen et al., 2013). Astrology beyond the moon's phase remains
          symbolic — a language for noticing, not a mechanism. We write it that way on purpose.</>}
        </p>
      </div>
      <p style={{ fontFamily: UI, fontSize: 11, color: C.faint, textAlign: "center", lineHeight: 1.6, margin: "14px 10px 0" }}>
        {celestial ? <>Your birth details help personalise this reading. <a href="/Privacy" style={{color:C.ink}}>How your information is used</a> · <a href="/Terms" style={{color:C.ink}}>Terms</a></> : <>Your birth details and cycle dates stay yours — never sold, never used to target you, and never needed to read your sky.
        We don't track your location. Payments are handled by Stripe (PCI-DSS Level 1); we never see your card.</>}
      </p>
    </Block>
  );
}
