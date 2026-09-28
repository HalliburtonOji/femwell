import React, { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Bookmark, Check, Compass, Feather, MessageCircle, Moon, Settings, Sparkles, Sun, Sunrise, X } from "lucide-react";
import SectionHeader from "@/components/lifestyle-elite/SectionHeader";
import { C, CLEAN_BG, CLEAN_CSS } from "@/components/brand/cleanTokens";
import { Body, Card, Cta, Eyebrow as KitEyebrow, Leaf, Summary, Title } from "@/components/brand/cleanKit";
import { cwOf } from "@/components/brand/flora";
import { T, SERIF, SCRIPT, UI } from "@/components/journal/Editorial";

const Eyebrow = (props) => <KitEyebrow {...props} style={{ color: C.ink }} />;

// An isolated, authored design specimen. No SDK, account reads, AI or backend writes.
const CHAPTERS = ["Today", "Your chart", "Your patterns", "Connect"];
const SAMPLE_NOTES = [
  { date: "24 September", sample: true, text: "Said yes to dinner with an old friend. Glad I went." },
  { date: "21 September", sample: true, text: "An afternoon without a plan turned into a good one." },
  { date: "18 September", sample: true, text: "Made a little room for the project I keep putting off." },
];
const GODDESSES = {
  Mother: "Ceres · care that leaves something for you, too.", Warrior: "Pallas · a fresh angle on a familiar problem.",
  Partner: "Juno · the small agreements that make a relationship kind.", Hearth: "Vesta · give your attention a place to settle.",
  Healer: "Chiron · tenderness is allowed to be practical.", Wild: "Lilith · notice where you have made yourself smaller.",
};
const css = `
.sky-concept{color:${C.ink};font-family:${UI};}
.sky-concept *{box-sizing:border-box}.sky-concept button,.sky-concept a{touch-action:manipulation}
.sky-concept button:focus-visible,.sky-concept a:focus-visible,.sky-concept input:focus-visible,.sky-concept textarea:focus-visible{outline:3px solid ${C.ink};outline-offset:3px}
.sky-concept .demo-control{border:1px solid ${C.hair};background:${C.surface};color:${C.ink};border-radius:14px;min-height:48px;padding:10px 14px;font:600 15px ${UI};cursor:pointer}
.sky-concept .demo-control[aria-pressed=true]{border-color:${C.ink};background:${C.ink};color:${C.surface}}
.sky-concept .demo-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}
.sky-concept .demo-pill{border:0;border-radius:999px;min-height:58px;padding:12px;display:flex;align-items:center;justify-content:center;gap:8px;font:700 15px ${UI};cursor:pointer}
.sky-concept .demo-field{display:grid;gap:8px;font:600 15px ${UI};margin:18px 0}
.sky-concept input,.sky-concept textarea,.sky-concept select{width:100%;min-height:48px;border:1px solid ${C.hair};border-radius:12px;padding:12px;background:${C.surface};color:${C.ink};font:400 16px ${UI}}
.sky-concept textarea{resize:vertical;line-height:1.6}.sky-concept .demo-small{font:400 14px/1.6 ${UI};color:${C.slate}}
.sky-concept .demo-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 0;border-bottom:1px solid ${C.hair}}
.sky-concept .demo-chapters{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:22px 0}
.sky-concept .demo-section{scroll-margin-top:80px}.sky-concept .demo-triad{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.sky-concept .demo-link{color:${C.ink};font:600 15px ${UI};text-underline-offset:4px;display:inline-flex;align-items:center;min-height:48px}
@media(min-width:620px){.sky-concept .demo-chapters{grid-template-columns:repeat(4,1fr)}}
`;

export default function SkyConceptDemo() {
  const [chapter, setChapter] = useState("Today");
  const [panel, setPanel] = useState(null);
  const [digest, setDigest] = useState(false);
  const [scenario, setScenario] = useState("complete");
  const [quiet, setQuiet] = useState(false);
  const [soft, setSoft] = useState(false);
  const [read, setRead] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asked, setAsked] = useState([]);
  const [friend, setFriend] = useState("");
  const [pairing, setPairing] = useState(false);
  const [goddess, setGoddess] = useState("Mother");
  const [birth, setBirth] = useState({ date: "1995-06-17", time: "08:30", place: "Example town", known: true });
  const [draftBirth, setDraftBirth] = useState(birth);
  const [message, setMessage] = useState("");
  const [plannerDraft, setPlannerDraft] = useState("");
  const [communityDraft, setCommunityDraft] = useState("");
  const opener = useRef(null);
  const askInput = useRef(null);
  const hasChart = scenario !== "new";
  const fullChart = hasChart && birth.known;
  const visibleNotes = scenario === "sparse" ? notes.filter(item => !item.sample) : notes;
  const emptyHistory = visibleNotes.length === 0;
  const unavailable = scenario === "error";
  const open = (name) => { opener.current = document.activeElement; setMessage(""); if (name === "Edit your chart") setDraftBirth(birth); setPanel(name); };
  const switchChapter = (name) => { setChapter(name); setMessage(""); };
  const applyScenario = (key) => { setScenario(key); setBirth(current => ({ ...current, known: !["date-only", "new"].includes(key) })); setMessage(""); };
  const resetDemo = () => { setChapter("Today"); setPanel(null); setDigest(false); setScenario("complete"); setQuiet(false); setSoft(false); setRead(false); setNote(""); setNotes(SAMPLE_NOTES); setQuestion(""); setAnswer(""); setAsked([]); setFriend(""); setPairing(false); setGoddess("Mother"); setBirth({ date: "1995-06-17", time: "08:30", place: "Example town", known: true }); setPlannerDraft(""); setCommunityDraft(""); setMessage("Sample changes reset."); };
  const ask = () => { switchChapter("Connect"); requestAnimationFrame(() => { askInput.current?.focus({ preventScroll: true }); askInput.current?.scrollIntoView({ block: "center" }); }); };
  const saveNote = () => { if (!note.trim()) return; setNotes([{ date: "This preview", sample: false, text: note.trim() }, ...notes]); setNote(""); setPanel(null); setMessage("Your note is kept in this preview until you leave or reload."); };
  const reading = quiet ? "There is no grand instruction for today. Make one ordinary thing a little easier: leave a margin in your afternoon, send the message, or let a plan stay small." : "Not every good thing begins with a big decision. Today, notice the invitation that feels easy: a conversation you have been meaning to start, a small idea asking for half an hour, a little space that is yours.";
  const title = quiet ? "A little less to carry." : "Make room for the good, small things.";
  const pairs = {
    Today: [["Ask the sky", ask, MessageCircle], [hasChart ? "Edit your chart" : "Set up your sky", () => open("Edit your chart"), Settings]],
    "Your chart": [["Edit your chart", () => open("Edit your chart"), Settings], ["Understand my chart", () => open("Your chart, explained"), Compass]],
    "Your patterns": [["Leave a sky note", () => open("Leave a sky note"), Feather], ["Revisit your notes", () => open("Your sky notes"), Bookmark]],
    Connect: [["Ask the sky", ask, MessageCircle], ["Explore a pairing", () => open("You & someone"), Sparkles]],
  };
  const panelBody = () => {
    if (panel === "Edit your chart") return <form onSubmit={(event) => { event.preventDefault(); setBirth(draftBirth); setScenario(current => ["sparse", "error"].includes(current) ? current : (draftBirth.known ? "complete" : "date-only")); setPanel(null); setMessage("Example details updated in this preview. No chart calculation or account change was made."); }}>
      <p className="demo-small">Use made-up details to try the form. This demo does not calculate a birth chart.</p>
      <label className="demo-field">Birth date<input type="date" required max="2026-09-28" value={draftBirth.date} onChange={e => setDraftBirth({ ...draftBirth, date: e.target.value })} /></label>
      <label className="demo-row"><span>I know the birth time</span><input aria-label="I know the birth time" type="checkbox" style={{ width: 24, minHeight: 24 }} checked={draftBirth.known} onChange={e => setDraftBirth({ ...draftBirth, known: e.target.checked })} /></label>
      {draftBirth.known ? <><label className="demo-field">Birth time<input type="time" required value={draftBirth.time} onChange={e => setDraftBirth({ ...draftBirth, time: e.target.value })} /></label><label className="demo-field">Birth town<input required placeholder="Example town" value={draftBirth.place} onChange={e => setDraftBirth({ ...draftBirth, place: e.target.value })} /></label></> : <Body>That's fine. A date-only view stays useful; rising and houses stay unavailable.</Body>}
      <Cta type="submit" filled>Use these example details</Cta>
    </form>;
    if (panel === "Leave a sky note" || panel === "Reflect on this") return <form onSubmit={e => { e.preventDefault(); saveNote(); }}>
      <Body>What would you like to make room for?</Body><label className="demo-field">Your preview note<textarea rows={5} maxLength={1200} value={note} onChange={e => setNote(e.target.value)} placeholder="A thought, a plan, a sentence…" required /></label><Cta filled type="submit">Keep note in this preview</Cta>
    </form>;
    if (panel === "Your sky notes") return <>{visibleNotes.length ? visibleNotes.map((item, i) => <div key={i} style={{ marginBottom: 20 }}><span className="demo-small">{item.date} · {item.sample ? "authored sample" : "your preview note"}</span><Body>{item.text}</Body></div>) : <Body>No notes in this example yet. A first line is enough.</Body>}<Cta onClick={() => setPanel("Leave a sky note")}>Add a note</Cta></>;
    if (panel === "You & someone") return <form onSubmit={e => { e.preventDefault(); setPairing(true); }}><Body>A conversation starter, never a verdict on a relationship.</Body><label className="demo-field">A made-up name<input value={friend} onChange={e => { setFriend(e.target.value); setPairing(false); }} maxLength={50} required placeholder="Alex" /></label><Cta type="submit">Show the sample pairing</Cta>{pairing && <div role="status" style={{ marginTop: 24 }}><Title>You & {friend}</Title><Body>One of you thinks aloud; the other likes a little space to decide. Try asking “Would you like ideas, or would you like me to listen?”</Body><p className="demo-small">Authored example. Not computed from birth data. No relationship score.</p></div>}</form>;
    if (panel === "Your chart, explained") return <>{["Sun · the centre of the symbolic story.", "Moon · how the chart describes comfort and feeling.", "Rising · the chart's horizon; it needs a reliable time and place."].map(text => <Body key={text}>{text}</Body>)}<p className="demo-small">Interpretive traditions, not measured personality traits. The displayed placements are examples.</p></>;
    if (panel === "Jess's read") return <><Body>There is room for both: the thing you want to finish and the person you want to see. Which would make today feel a little more yours?</Body><Cta onClick={() => setPanel("Reflect on this")}>Leave yourself a line</Cta><p className="demo-small">Authored demonstration of the Sky → Jess handoff.</p></>;
    if (panel === "Bring it to your day") return <><Body>Make half an hour for something you have been putting off for the right reasons.</Body><label className="demo-field">Your example intention<input value={plannerDraft} onChange={e => setPlannerDraft(e.target.value)} placeholder="A walk with a friend" /></label><Cta onClick={() => { setPanel(null); setMessage(plannerDraft.trim() ? `Preview intention: ${plannerDraft.trim()}. Nothing added to your real planner.` : "Preview intention: a little time for yourself. Nothing added to your real planner."); }}>Try the planner handoff</Cta></>;
    if (panel === "Start a conversation") return <><Body>What's one small thing you are making room for this week?</Body><label className="demo-field">Your example draft<textarea rows={4} value={communityDraft} onChange={e => setCommunityDraft(e.target.value)} placeholder="Write a draft…" /></label><p className="demo-small">Private preview. Nothing is posted and no community consent is accepted.</p><Cta onClick={() => { setPanel(null); setMessage("Conversation draft kept in this preview. Nothing posted."); }}>Keep draft</Cta></>;
    if (panel === "A letter for this month") return <><Eyebrow>Example letter</Eyebrow><Title>A little room for yourself</Title><Body>There is a particular kind of tiredness that comes from being available for every small thing. This month, try giving one small thing back to yourself.</Body><Body>It need not be impressive. A book taken to the park. Dinner at the table. A long conversation with someone who does not need you to explain the whole backstory.</Body><Body>A little space is still space. You can begin there.</Body><p className="demo-small">Demo copy only. Not a published subscriber letter or a claim of professional authorship.</p></>;
    if (panel === "Your sky, your way") return <>{[["Quiet mode", "A gentler version of the sample reading.", quiet, setQuiet], ["Soft sky", "Leave out the sample challenging-transit note.", soft, setSoft]].map(([label, text, checked, change]) => <div className="demo-row" key={label}><div><strong>{label}</strong><p className="demo-small" style={{ margin: "4px 0 0" }}>{text}</p></div><button type="button" className="demo-control" role="switch" aria-checked={checked} aria-label={label} onClick={() => change(!checked)}>{checked ? "On" : "Off"}</button></div>)}<p className="demo-small">These switches change the demo immediately. Account preferences stay untouched.</p></>;
    if (panel === "Science & privacy") return <><Body>Sky offers symbolic reflection. Lunar phases describe changing illumination; they do not establish a cause for your mood or cycle.</Body><a className="demo-link" href="https://science.nasa.gov/moon/moon-phases/" target="_blank" rel="noreferrer">NASA: the phases of the Moon <ArrowRight size={16} /></a><p className="demo-small">This specimen uses authored examples. Form entries stay in page memory and disappear on reload. It does not send them to FemWell's services.</p></>;
    if (panel === "Share a little sky") return <><Card framed><Eyebrow>A thought for today</Eyebrow><Title>Make room for the good, small things.</Title><Body>One conversation. One idea. A little space that's yours.</Body></Card><p className="demo-small">Share-preview only: no names, birthdays, cycle dates or private notes included.</p><Cta onClick={() => { setPanel(null); setMessage("Share preview reviewed. Nothing has been sent."); }}>Keep it private</Cta></>;
    if (panel === "Jump to") return <div style={{ display: "grid", gap: 8 }}>{CHAPTERS.map(name => <button className="demo-control" key={name} onClick={() => { switchChapter(name); setPanel(null); }}>{name}</button>)}</div>;
    if (panel === "A sound for today") return <><Body>A familiar song is enough. This example opens the existing Sky playlist in Spotify.</Body><a className="demo-link" href="https://open.spotify.com/playlist/37i9dQZF1DWWVULl5wUsL9" target="_blank" rel="noreferrer">Open the playlist <ArrowRight size={16} /></a><p className="demo-small">External service; availability depends on Spotify.</p></>;
    return <><Body>{panel === "The year ahead" ? "A longer reading with room for work, friendships, creativity and rest." : panel === "The chart atelier" ? "A full chart reading with a clear explanation of the details it uses." : "An exploration of possible dates, with no promise that a chosen day controls an outcome."}</Body><p className="demo-small">Offer preview. Authorship, fulfilment and purchasing still need verification; no checkout runs in this demo.</p></>;
  };

  return <div className="sky-concept fw-clean" style={{ ...CLEAN_BG, "--demo-plum": cwOf("plum").petal, minHeight: "100vh", padding: "16px 16px 150px" }}>
    <style>{CLEAN_CSS + css}</style>
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}><a className="demo-link" href="/Ideas?section=skyreview"><ArrowLeft size={16} /> Sky review board</a><span className="demo-small" style={{ fontWeight: 700 }}>Sample preview</span></div>
      <p className="demo-small" style={{ margin: "0 0 16px" }}>Try the proposed design. All content and results are examples.</p>
      <SectionHeader clean active={{ id: "sky", title: "Your sky" }} />
      <details style={{ margin: "20px 0" }}><summary style={{ minHeight: 44, cursor: "pointer", font: `600 15px ${UI}` }}>Try a different state</summary><div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 8 }}>{[["complete", "Example chart"], ["date-only", "Unknown time"], ["new", "No chart yet"], ["sparse", "Little history"], ["error", "Reading unavailable"]].map(([key, label]) => <button className="demo-control" aria-pressed={scenario === key} key={key} onClick={() => applyScenario(key)}>{label}</button>)}<button className="demo-control" onClick={resetDemo}>Reset sample changes</button></div></details>
      <Card framed><div style={{ display: "flex", gap: 8, marginBottom: 18 }}><button className="demo-control" style={{ flex: 1 }} aria-pressed={!digest} onClick={() => setDigest(false)}>Your sky</button><button className="demo-control" style={{ flex: 1 }} aria-pressed={digest} onClick={() => setDigest(true)}>Jess's read</button></div><Summary Icon={digest ? MessageCircle : Moon} cw="plum">{digest ? "A little space for a plan and a person. Both belong in your day." : !hasChart ? "Begin with a birth date, or explore the sky without one." : unavailable ? "Your reading has not arrived. Your notes are still here." : "A thoughtful day, with room for something you enjoy."}</Summary><button className="demo-control" onClick={() => digest ? open("Jess's read") : switchChapter("Today")}>{digest ? "Open Jess's read" : "Today's reading"} <ArrowRight size={14} style={{ display: "inline" }} /></button></Card>
      <div className="demo-pair" aria-label="Sky chapter actions">{pairs[chapter].map(([label, run, Icon], i) => <button className="demo-pill" key={label} onClick={run} style={{ background: i ? C.gold : "var(--demo-plum)", color: T.ink }}><Icon size={17} aria-hidden="true" style={{ flexShrink: 0 }} />{label}</button>)}</div>
      <nav className="demo-chapters" aria-label="Sky chapters">{CHAPTERS.map(name => <button className="demo-control" key={name} aria-pressed={chapter === name} onClick={() => switchChapter(name)}>{name}</button>)}</nav>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><button className="demo-control" onClick={() => open("Jump to")}>Jump to</button><button className="demo-control" onClick={() => open("Your sky, your way")}><Settings size={15} style={{ display: "inline" }} /> Your way</button></div>
      {message && <p role="status" className="demo-small" style={{ padding: "16px 0", color: C.ink }}><Check size={15} style={{ display: "inline" }} /> {message}</p>}
      <div className="demo-section" style={{ marginTop: 28 }}>
        {chapter === "Today" && <>
          <Eyebrow cw="plum">Today · an example reading</Eyebrow>
          {unavailable ? <Card><Title>A little patience with the sky.</Title><Body>The reading could not load. You can retry without losing your notes.</Body><Cta onClick={() => { setScenario("complete"); setMessage("Sample recovery shown. No server request was made."); }}>Try the recovery</Cta></Card> : <>
            <Title size={36}>{title}</Title><div style={{ textAlign: "center", marginBottom: 20 }} className="demo-small">Energy · steady <span aria-hidden="true"> · </span> Mood · open</div><Body size={20}>{reading}</Body><Body>Let the invitation be small enough to accept.</Body><p style={{ fontFamily: SCRIPT, fontSize: 32, color: C.ink, textAlign: "right" }}>Astra</p><p className="demo-small">Authored sample · symbolic reflection, not a prediction.</p>
            {!hasChart && <Cta onClick={() => open("Edit your chart")}>Try birth-date setup</Cta>}
            {!soft && <details style={{ margin: "18px 0" }}><summary className="demo-small" style={{ minHeight: 44, cursor: "pointer" }}>A little friction? Hold it lightly.</summary><Body>This sample note leaves room for a busy or uncertain day. It does not predict a difficult event.</Body></details>}
            <div className="demo-row"><button className="demo-control" onClick={() => open("A sound for today")}>A sound for today</button><button className="demo-control" onClick={() => open("Share a little sky")}>Share preview</button></div>
            <Leaf /><Eyebrow>Carry it with you</Eyebrow><Title>Let it become something small.</Title><div style={{ display: "grid", gap: 10 }}><Cta filled Icon={Feather} onClick={() => open("Reflect on this")}>Reflect on this</Cta><button className="demo-control" onClick={() => open("Bring it to your day")}>Bring it to your day</button><button className="demo-control" onClick={() => open("Start a conversation")}>Start a conversation</button><button className="demo-control" onClick={() => open("Jess's read")}>Take this to Jess</button></div><div style={{ marginTop: 22 }}><Cta onClick={() => { setRead(!read); setMessage(read ? "Reading mark cleared in this preview." : "Read for today in this preview. No streak, no catch-up."); }} Icon={read ? Check : Bookmark}>{read ? "Read today · undo" : "Mark this reading read"}</Cta></div>
          </>}
        </>}
        {chapter === "Your chart" && <><Eyebrow cw="plum">Your chart</Eyebrow><Title>A little language for knowing yourself.</Title><p className="demo-small" style={{ textAlign: "center" }}>Illustrative placements, not calculated from your details.</p>
          {!hasChart ? <Card><Title>Start with what you know.</Title><Body>A birth date is a beginning. An unknown time is not something to guess.</Body><Cta onClick={() => open("Edit your chart")}>Set up the example chart</Cta></Card> : <><div className="demo-triad">{[[Sun,"Sun","Gemini"],[Moon,"Moon",fullChart ? "Libra" : "Uncertain"],[Sunrise,"Rising",fullChart ? "Virgo" : "Time needed"]].map(([Icon, label, value]) => <button className="demo-control" key={label} onClick={() => open("Your chart, explained")} style={{ padding: "16px 4px", display: "grid", gap: 9, justifyItems: "center" }}><Icon size={22}/><span>{label}</span><span style={{ font: `600 17px ${SERIF}` }}>{value}</span></button>)}</div>{!fullChart && <p className="demo-small">With unknown time, rising and houses remain unavailable. Moon precision depends on the date and calculation.</p>}</>}
          <Leaf /><Eyebrow>Beside you</Eyebrow><Title>Your goddess bench</Title><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{Object.keys(GODDESSES).map(name => <button className="demo-control" key={name} aria-pressed={goddess === name} onClick={() => setGoddess(name)}>{name}</button>)}</div><div aria-live="polite" style={{ marginTop: 20 }}><Body>{GODDESSES[goddess]}</Body></div><p className="demo-small">Symbolic archetypes. Example copy, not personality testing.</p>
        </>}
        {chapter === "Your patterns" && <><Eyebrow>Your two tides</Eyebrow><Title>Notice, without making a rule.</Title><Card framed><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}><Moon size={54} color={C.ink} strokeWidth={1}/><div><strong>Moon · illustrative phase</strong><p className="demo-small">Cycle · no measured data in this demo</p></div></div><Body>A sky reading can sit beside your own observations. It cannot tell you what your body will do.</Body></Card>
          <Leaf /><Eyebrow>Your history</Eyebrow><Title>{emptyHistory ? "A beginning is enough." : "A few moments worth keeping."}</Title><p className="demo-small">{emptyHistory ? "The empty space waits for your first observation." : "Example notes and anything you add in this preview. Unobserved days stay empty."}</p>{visibleNotes.slice(0,3).map((item,i) => <div className="demo-row" key={i}><div><span className="demo-small">{item.date} · {item.sample ? "sample" : "your preview note"}</span><Body>{item.text}</Body></div><Feather size={18} aria-hidden="true" style={{ flexShrink: 0 }}/></div>)}<div style={{ marginTop: 18 }}><Cta onClick={() => open("Leave a sky note")}>Leave a sky note</Cta></div>
          <Leaf /><details><summary className="demo-control">Red & white moon traditions</summary><Body>These traditions describe whether bleeding falls near a full or new moon. Sparse history should not become a classification. This demo makes no claim about your pattern.</Body></details><details style={{ marginTop: 12 }}><summary className="demo-control">Your year & Saturn return</summary><Body>Longer symbolic readings need a clear account of what is calculated and what is approximate.</Body><Body>{fullChart ? "Example annual theme: a little more room for home and belonging. No exact transit date is claimed here." : "With time unknown, a house-based annual reading stays unavailable. You can still read and reflect."}</Body></details>
        </>}
        {chapter === "Connect" && <><Eyebrow>Ask & connect</Eyebrow><Title>Bring a real question.</Title><Card><form onSubmit={e => { e.preventDefault(); const text=question.trim(); if (!text) return; const reply="What is the smallest part you can choose today? Give that some room, and leave the rest undecided for now."; setAnswer(reply); setAsked([{ question:text, answer:reply },...asked]); }}><label className="demo-field">Your sample question<textarea ref={askInput} rows={3} value={question} maxLength={600} required onChange={e => setQuestion(e.target.value)} placeholder="What do I want to make room for?" /></label><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>{["A friendship", "A work decision", "Time for myself"].map(topic => <button className="demo-control" type="button" key={topic} onClick={() => { setQuestion(`What could I notice about ${topic.toLowerCase()}?`); askInput.current?.focus(); }}>{topic}</button>)}</div><Cta filled type="submit">Try a sample answer</Cta></form>{answer && <div role="status" style={{ marginTop: 22 }}><Body>{answer}</Body><p className="demo-small">Fixed, authored example—not an AI answer.</p></div>}</Card>
          {asked.length>0 && <details style={{ marginTop: 20 }}><summary className="demo-control">Your preview questions · {asked.length}</summary>{asked.map((item,i)=><div className="demo-row" key={i}><div><strong>{item.question}</strong><Body>{item.answer}</Body></div></div>)}</details>}
          <Leaf /><Eyebrow>You & someone</Eyebrow><Title>A conversation, not a score.</Title><Body>See the kind of questions a pairing could open up. Leave a relationship's worth out of the numbers.</Body><Cta onClick={() => open("You & someone")}>Explore a sample pairing</Cta>
          <Leaf /><Eyebrow>The atelier</Eyebrow><Title>A longer letter, when you want one.</Title><Body>There is a particular kind of tiredness that comes from being available for every small thing…</Body><Cta onClick={() => open("A letter for this month")}>Read the example letter</Cta><p className="demo-small">Demo copy. Publishing, authorship and fulfilment still need verification.</p><div style={{ display: "grid", gap: 8, marginTop: 20 }}>{["The year ahead", "The chart atelier", "Choose the day"].map(name=><button className="demo-control" key={name} onClick={() => open(name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>{name}<ArrowRight size={16}/></button>)}</div>
        </>}
      </div>
      <Leaf /><button className="demo-control" style={{ width: "100%" }} onClick={() => open("Science & privacy")}>Where the science sits · your privacy</button><p className="demo-small" style={{ textAlign: "center", marginTop: 20 }}>Held lightly. A language for noticing, never fate.</p>
      <details style={{ marginTop: 24 }}><summary className="demo-control">What changed · three things</summary><ol className="demo-small" style={{ paddingLeft: 22 }}><li>A clear reading → reflection → return journey.</li><li>Unknown details and sparse history stay honest.</li><li>Useful actions, visible results and gentler preferences.</li></ol><a className="demo-link" href="/sky-review/index.html">Open the detailed audit</a></details>
    </div>
    <Dialog.Root open={!!panel} onOpenChange={value => { if (!value) setPanel(null); }}><Dialog.Portal><Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(25,21,16,.35)", zIndex: 10000 }}/><Dialog.Content className="sky-concept fw-clean fw-dialog-cap" onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus({ preventScroll: true }); }} style={{ position: "fixed", zIndex: 10001, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(540px,calc(100vw - 24px))", maxHeight: "calc(100dvh - var(--fw-sheet-safe,100px) - 24px)", overflowY: "auto", background: C.surface, borderRadius: 24, padding: "28px 22px" }}><Dialog.Title style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.2, paddingRight: 38, margin: "0 0 10px" }}>{panel}</Dialog.Title><Dialog.Description className="demo-small">Sample preview · changes stay on this page.</Dialog.Description><Dialog.Close aria-label="Close preview panel" style={{ position: "absolute", top: 10, right: 10, width: 44, height: 44, border: 0, background: "transparent", display: "grid", placeItems: "center" }}><X size={20}/></Dialog.Close>{panelBody()}</Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}
