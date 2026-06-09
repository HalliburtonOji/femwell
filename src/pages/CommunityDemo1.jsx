// CommunityDemo1 — the COMPLETE whole-life Community, UX: CALM LONG-SCROLL EDITORIAL
// ─────────────────────────────────────────────────────────────────────────────
// The "calm magazine" of the five demos. Every feature surface is the same as the
// other four — only the UX differs. Here it is a single quiet vertical read: sections
// stacked top-to-bottom, generous whitespace, big carved Script section headers,
// hairline rules between sections, airy understated cards. No tabs, no nav — the whole
// Community is one long, unhurried scroll. Everything is reachable by reading downward.
//
// Feature-complete: (1) masthead + ambient presence, (2) Question of the Day,
// (3) whole-life rooms, (4) Echo Wall + kind reactions, (5) the Lounge feed + compose
// + crisis intercept, (6) the games (This-or-That, Hot-Takes, One-Line Story, Role-Play),
// (7) one-entry-four-lives chooser, (8) Witness (gate + charter + responses),
// (9) Audio Talk-It-Out (mode switch + note + signpost). Ends on the footer line.
//
// Self-contained, mock data + useState only — no entities. UK voice, no emoji, Lucide only.
import { useState } from "react";
import { Send, Check, Plus } from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  MASTHEAD, PRESENCE, QOTD, ROOMS, ECHOES, ECHO_REACTIONS, LOUNGE,
  THIS_OR_THAT, HOT_TAKES, STORY_SEED, ROLEPLAY, SAMPLE_ENTRY, FOUR_LIVES,
  WITNESS, AUDIO_MODES, AUDIO_NOTE, crisisCheck, UK_RESOURCES, FOOTER_LINE,
  ShieldAlert,
} from "./communityShared";

// ── a quiet section header: hairline rule above, eyebrow, big carved title ──
function Section({ eyebrow, title, intro, first, children }) {
  return (
    <section style={{ marginTop: first ? 0 : 0 }}>
      {!first && <Rule c={T.paperDeep} mt={44} mb={0} />}
      <div style={{ textAlign: "center", padding: first ? "0 0 0" : "44px 0 0" }}>
        <Eyebrow mb={12} color={T.muted}>{eyebrow}</Eyebrow>
        <Script size={38} carve>{title}</Script>
        {intro && (
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft, margin: "14px auto 0", maxWidth: 340, lineHeight: 1.6 }}>
            {intro}
          </p>
        )}
      </div>
      <div style={{ marginTop: 26 }}>{children}</div>
    </section>
  );
}

// ── airy understated card ──
function Card({ children, style, tint }) {
  return (
    <div style={{
      background: tint || T.paperHi, border: `1px solid ${T.paperDeep}`,
      borderRadius: 16, padding: "16px 17px", ...style,
    }}>{children}</div>
  );
}

export default function CommunityDemo1() {
  useEditorialFonts();

  // QOTD
  const [picked, setPicked] = useState(null);
  // Echo reactions — which echo has had which reaction left (one-way, no counts)
  const [echoReacted, setEchoReacted] = useState({}); // {echoId: reactionLabel}
  // Lounge compose + crisis
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState(LOUNGE);
  const [crisis, setCrisis] = useState(false);
  // This-or-That voting
  const [totVote, setTotVote] = useState({}); // {id: "a"|"b"}
  // One-line story
  const [story, setStory] = useState(STORY_SEED);
  const [line, setLine] = useState("");
  // Role-play
  const [rpEntries, setRpEntries] = useState(ROLEPLAY.entries);
  const [rpDraft, setRpDraft] = useState("");
  // Four lives
  const [life, setLife] = useState(FOUR_LIVES.find((l) => l.defaultLife)?.key || FOUR_LIVES[0].key);
  // Witness response
  const [witnessReply, setWitnessReply] = useState(null);
  // Audio mode
  const [audioMode, setAudioMode] = useState(AUDIO_MODES[0].key);

  const chosenLife = FOUR_LIVES.find((l) => l.key === life);
  const audio = AUDIO_MODES.find((m) => m.key === audioMode);

  // four-lives preview text per path
  const lifePreview = {
    lock: "Sealed in your Journal. No one else will ever see this line — it stays under your key.",
    echo: "“I kept handing over more than I had left.” — one scrubbed line drifts to the wall, then fades in 48 hours.",
    seal: "A letter to future-you. We'll keep it shut until the date you choose, then it opens — only for you.",
    witness: "One matched sister reads it once. She holds it, sends four lines back, or stays quiet. Then it seals.",
  };

  function submitPost() {
    const text = draft.trim();
    if (!text) return;
    if (crisisCheck(text)) { setCrisis(true); return; } // intercept — never post
    setPosts((p) => [{ id: "new" + Date.now(), domain: "You", body: text, warm: true }, ...p]);
    setDraft("");
    setCrisis(false);
  }

  function addLine() {
    const text = line.trim();
    if (!text) return;
    setStory((s) => [...s, text]);
    setLine("");
  }

  function addRoleplay() {
    const text = rpDraft.trim();
    if (!text) return;
    setRpEntries((e) => [...e, text]);
    setRpDraft("");
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* ───────────── (1) MASTHEAD + AMBIENT PRESENCE ───────────── */}
        <header style={{ textAlign: "center", marginBottom: 22 }}>
          <Eyebrow mb={12} color={T.muted}>{MASTHEAD.eyebrow}</Eyebrow>
          <Script size={58} carve>{MASTHEAD.title}</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft, margin: "16px auto 0", maxWidth: 360, lineHeight: 1.6 }}>
            {MASTHEAD.subtitle}
          </p>
        </header>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "11px 16px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, maxWidth: 360, margin: "0 auto" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: T.sage, flexShrink: 0 }} />
          <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, letterSpacing: 0.2 }}>
            <strong style={{ color: T.ink }}>{PRESENCE.count} women</strong> {PRESENCE.line}
          </span>
        </div>

        {/* ───────────── (2) QUESTION OF THE DAY ───────────── */}
        <Section eyebrow="A small daily" title="Question of the day">
          <Card>
            <Script size={26} carve style={{ marginBottom: 16 }}>{QOTD.question}</Script>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {QOTD.options.map((o) => {
                const on = picked === o;
                const dim = picked && !on;
                return (
                  <button key={o} onClick={() => setPicked(o)} disabled={!!picked}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 13px",
                      borderRadius: 12, textAlign: "left",
                      background: on ? T.ink : "transparent",
                      border: `1px solid ${on ? T.ink : T.paperDeep}`,
                      color: on ? T.paper : (dim ? T.muted : T.inkSoft),
                      fontFamily: UI, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.2,
                      cursor: picked ? "default" : "pointer", opacity: dim ? 0.5 : 1, transition: "all .18s ease",
                    }}>
                    <span>{o}</span>
                    {on && <Check size={14} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
            {picked && (
              <div style={{ marginTop: 16 }}>
                <Rule c={T.paperDeep} mb={13} />
                <Hand size={20} carve>{QOTD.normLine}</Hand>
                <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "7px 0 0", lineHeight: 1.5 }}>
                  No tally, no names — just the shape of the room.
                </p>
              </div>
            )}
          </Card>
        </Section>

        {/* ───────────── (3) THE WHOLE-LIFE ROOMS ───────────── */}
        <Section eyebrow="Where to wander" title="The rooms"
          intro="Health is one room here — not the whole house.">
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {ROOMS.map((r) => (
              <div key={r.key} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 15, padding: "15px 16px" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${T.ink}0D`, color: T.ink }}>
                  <r.Icon size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.2 }}>{r.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: T.sage }} />{r.hint}
                    </span>
                  </div>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.inkSoft, margin: "4px 0 0", lineHeight: 1.5 }}>{r.line}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ───────────── (4) ECHO WALL ───────────── */}
        <Section eyebrow="One line, then it fades" title="The Echo Wall"
          intro="Anonymous one-liners that fade within 48 hours. Leave a kind one-way reaction — never a reply, never a count.">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ECHOES.map((e) => {
              const reacted = echoReacted[e.id];
              return (
                <Card key={e.id}>
                  <p style={{ fontFamily: SERIF, fontSize: 16.5, color: T.ink, margin: 0, lineHeight: 1.5 }}>“{e.body}”</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>fades in {e.fadeH}h</span>
                    <span style={{ flex: 1 }} />
                    {reacted ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.sage, letterSpacing: 0.4 }}>
                        <Check size={13} /> {reacted}
                      </span>
                    ) : (
                      ECHO_REACTIONS.map((rx) => (
                        <button key={rx} onClick={() => setEchoReacted((p) => ({ ...p, [e.id]: rx }))}
                          style={{ background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 11px", fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: T.muted, cursor: "pointer" }}>
                          {rx}
                        </button>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* ───────────── (5) THE LOUNGE FEED + COMPOSE + CRISIS ───────────── */}
        <Section eyebrow="Silly to serious, no names" title="The Lounge"
          intro="Say the thing. Whole-life, never clinical.">
          {/* compose */}
          <Card style={{ marginBottom: 18 }}>
            <textarea
              value={draft}
              onChange={(e) => { setDraft(e.target.value); if (crisis) setCrisis(false); }}
              placeholder="What's on your mind tonight?"
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", resize: "none", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 12px", fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, outline: "none" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11 }}>
              <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.3 }}>Anonymous — no handle attached.</span>
              <button onClick={submitPost}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.ink, color: T.paper, border: "none", borderRadius: 999, padding: "8px 16px", fontFamily: UI, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer" }}>
                <Send size={13} /> Share
              </button>
            </div>

            {/* crisis intercept — never posts, surfaces UK support instead */}
            {crisis && (
              <div style={{ marginTop: 14, background: "#241a26", border: `1px solid ${T.crimson}`, borderRadius: 13, padding: "15px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                  <ShieldAlert size={17} color={T.blush} />
                  <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.paper }}>This deserves more than a feed</span>
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#F4EFE3", margin: "0 0 12px", lineHeight: 1.55 }}>
                  We didn't post this. What you're carrying sounds heavy — please reach a real person who can hold it properly, right now.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {UK_RESOURCES.map((u) => (
                    <div key={u.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "9px 11px" }}>
                      <u.Icon size={15} color={T.blush} style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.paper }}>{u.name}</span>
                        <p style={{ fontFamily: UI, fontSize: 11.5, color: "#D8CFBC", margin: "1px 0 0", lineHeight: 1.45 }}>{u.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((p) => (
              <Card key={p.id}>
                <Eyebrow mb={7} color={T.muted}>{p.domain}</Eyebrow>
                <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, margin: 0, lineHeight: 1.5 }}>{p.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* ───────────── (6) THE GAMES ───────────── */}
        <Section eyebrow="For the lighter side" title="Play a little"
          intro="No winners, no scores. Just the shape of the room.">

          {/* This-or-That */}
          <Eyebrow mb={12} color={T.muted}>This or that</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
            {THIS_OR_THAT.map((t) => {
              const v = totVote[t.id];
              return (
                <Card key={t.id}>
                  <p style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, margin: "0 0 12px", lineHeight: 1.4 }}>{t.prompt}</p>
                  {!v ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                      {["a", "b"].map((side) => (
                        <button key={side} onClick={() => setTotVote((p) => ({ ...p, [t.id]: side }))}
                          style={{ background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, cursor: "pointer" }}>
                          {t[side]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {["a", "b"].map((side, i) => {
                        const pct = t.split[i];
                        const mine = v === side;
                        return (
                          <div key={side}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: mine ? T.ink : T.muted, marginBottom: 4 }}>
                              <span>{t[side]}{mine && " · you"}</span><span>{pct}%</span>
                            </div>
                            <div style={{ height: 8, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: mine ? T.ink : T.paperDeep }} />
                            </div>
                          </div>
                        );
                      })}
                      <p style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontStyle: "italic", margin: "2px 0 0" }}>No winner here — just where the room leans.</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Kind Hot-Takes */}
          <Eyebrow mb={12} color={T.muted}>Kind hot-takes</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 26 }}>
            {HOT_TAKES.map((h, i) => (
              <Card key={i} style={{ padding: "13px 15px" }}>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.ink, margin: 0, lineHeight: 1.5 }}>“{h}”</p>
              </Card>
            ))}
          </div>

          {/* One-Line Story */}
          <Eyebrow mb={12} color={T.muted}>One-line story</Eyebrow>
          <Card style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 13 }}>
              {story.map((s, i) => (
                <p key={i} style={{ fontFamily: SERIF, fontSize: 15.5, color: i === story.length - 1 ? T.ink : T.inkSoft, margin: 0, lineHeight: 1.5 }}>{s}</p>
              ))}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <input value={line} onChange={(e) => setLine(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLine()}
                placeholder="Add the next line…"
                style={{ flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px", fontFamily: SERIF, fontSize: 14.5, color: T.ink, outline: "none" }} />
              <button onClick={addLine} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.ink, color: T.paper, border: "none", borderRadius: 999, padding: "0 14px", fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
                <Plus size={13} /> Add
              </button>
            </div>
          </Card>

          {/* Role-Play */}
          <Eyebrow mb={12} color={T.muted}>Role-play</Eyebrow>
          <Card>
            <p style={{ fontFamily: SERIF, fontSize: 16.5, color: T.ink, margin: "0 0 13px", lineHeight: 1.45 }}>{ROLEPLAY.prompt}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 13 }}>
              {rpEntries.map((e, i) => (
                <span key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 13px" }}>{e}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <input value={rpDraft} onChange={(e) => setRpDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRoleplay()}
                placeholder="Name yours…"
                style={{ flex: 1, minWidth: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "9px 11px", fontFamily: SERIF, fontSize: 14.5, color: T.ink, outline: "none" }} />
              <button onClick={addRoleplay} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.ink, color: T.paper, border: "none", borderRadius: 999, padding: "0 14px", fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer" }}>
                <Plus size={13} /> Add
              </button>
            </div>
          </Card>
        </Section>

        {/* ───────────── (7) ONE ENTRY, FOUR LIVES ───────────── */}
        <Section eyebrow="What becomes of a feeling" title="One entry, four lives"
          intro="The same private line can take four different paths. Choose one to see where it goes.">
          <Card style={{ marginBottom: 16 }}>
            <Eyebrow mb={8} color={T.muted}>Your entry</Eyebrow>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.ink, margin: 0, lineHeight: 1.55 }}>“{SAMPLE_ENTRY}”</p>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 16 }}>
            {FOUR_LIVES.map((l) => {
              const on = life === l.key;
              return (
                <button key={l.key} onClick={() => setLife(l.key)}
                  style={{ textAlign: "left", background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`, borderRadius: 13, padding: "12px 13px", cursor: "pointer", transition: "all .18s ease" }}>
                  <l.Icon size={16} color={on ? T.paper : T.ink} />
                  <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: on ? T.paper : T.ink, marginTop: 8 }}>{l.label}</div>
                  <div style={{ fontFamily: UI, fontSize: 10.5, color: on ? "#D8CFBC" : T.muted, marginTop: 3, lineHeight: 1.4 }}>{l.line}</div>
                </button>
              );
            })}
          </div>

          <Card tint={T.paperDeep}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <chosenLife.Icon size={15} color={T.ink} />
              <Eyebrow color={T.muted}>If you {chosenLife.label.toLowerCase()}</Eyebrow>
            </div>
            <Hand size={19} carve>{lifePreview[life]}</Hand>
          </Card>
        </Section>

        {/* ───────────── (8) WITNESS ───────────── */}
        <Section eyebrow="Held once, by one sister" title="Witness"
          intro={WITNESS.gate.line}>
          {/* gate progress */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {Array.from({ length: WITNESS.gate.need }).map((_, i) => (
                <span key={i} style={{ flex: 1, height: 7, borderRadius: 999, background: i < WITNESS.gate.held ? T.sage : T.paper, border: `1px solid ${i < WITNESS.gate.held ? T.sage : T.paperDeep}` }} />
              ))}
            </div>
            <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "10px 0 0", lineHeight: 1.5 }}>
              Held {WITNESS.gate.held} of {WITNESS.gate.need}. Hold space for one more sister to unlock sending your own.
            </p>
          </Card>

          {/* the 6-rail charter */}
          <Eyebrow mb={12} color={T.muted}>The charter</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 22 }}>
            {WITNESS.charter.map(([head, body], i) => (
              <div key={head} style={{ padding: "13px 0", borderTop: i === 0 ? "none" : `1px solid ${T.paperDeep}` }}>
                <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: T.ink }}>{head}</div>
                <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, margin: "5px 0 0", lineHeight: 1.5 }}>{body}</p>
              </div>
            ))}
          </div>

          {/* the 4 fixed responses — the fragile plum card (the ONLY dark surface) */}
          <div style={{ background: "#241a26", borderRadius: 16, padding: "18px 18px" }}>
            <Eyebrow mb={6} color="#c9a9cf">When you witness</Eyebrow>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: "#F4EFE3", margin: "0 0 15px", lineHeight: 1.55 }}>
              You read her entry once, then send one fixed line back — or stay quiet. No words of your own.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {WITNESS.responses.map((r) => {
                const on = witnessReply === r;
                return (
                  <button key={r} onClick={() => setWitnessReply(r)}
                    style={{ background: on ? "#F4EFE3" : "transparent", border: `1px solid ${on ? "#F4EFE3" : "rgba(244,239,227,0.3)"}`, borderRadius: 12, padding: "11px", fontFamily: SERIF, fontSize: 14.5, fontWeight: on ? 600 : 400, color: on ? "#241a26" : "#F4EFE3", cursor: "pointer", transition: "all .18s ease" }}>
                    {r}
                  </button>
                );
              })}
            </div>
            {witnessReply && (
              <p style={{ fontFamily: UI, fontSize: 11, color: "#c9a9cf", fontStyle: "italic", margin: "13px 0 0", lineHeight: 1.5 }}>
                “{witnessReply}” sent. She receives this once. Then it seals — for both of you.
              </p>
            )}
          </div>
        </Section>

        {/* ───────────── (9) AUDIO — TALK IT OUT ───────────── */}
        <Section eyebrow="Out loud, gently" title="Talk it out"
          intro="When typing isn't enough. Three ways to be heard — no recording stays.">
          {/* mode switcher */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {AUDIO_MODES.map((m) => {
              const on = audioMode === m.key;
              return (
                <button key={m.key} onClick={() => setAudioMode(m.key)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : T.paperDeep}`, borderRadius: 13, padding: "12px 6px", cursor: "pointer", transition: "all .18s ease" }}>
                  <m.Icon size={17} color={on ? T.paper : T.ink} />
                  <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, color: on ? T.paper : T.inkSoft }}>{m.name}</span>
                </button>
              );
            })}
          </div>

          <Card style={{ marginBottom: 14 }}>
            <Script size={22} carve style={{ marginBottom: 8 }}>{audio.name}</Script>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft, margin: 0, lineHeight: 1.6 }}>{audio.line}</p>
          </Card>

          <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", textAlign: "center", margin: "0 auto 16px", maxWidth: 340, lineHeight: 1.55 }}>
            {AUDIO_NOTE}
          </p>

          {/* always-visible signpost */}
          <Card tint={T.paperHi}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ShieldAlert size={15} color={T.crimson} />
              <Eyebrow color={T.muted}>If it gets heavy</Eyebrow>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {UK_RESOURCES.map((u) => (
                <div key={u.name} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <u.Icon size={14} color={T.ink} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.ink }}>{u.name}</span>
                    <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}> — {u.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ───────────── FOOTER ───────────── */}
        <Rule c={T.paperDeep} mt={46} mb={0} />
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, textAlign: "center", margin: "26px auto 0", maxWidth: 360, lineHeight: 1.65 }}>
          {FOOTER_LINE}
        </p>
        <div style={{ marginTop: 28 }}><EditorialFooter /></div>
      </div>
    </div>
  );
}
