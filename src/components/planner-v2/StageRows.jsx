// StageRows — life-stage-specific row components for PlannerV2Shell.
//
// Each stage that has specific needs gets its own labelled slider row
// that appears ONLY for users in that stage. Standard reproductive
// stage users see no extra row.
//
// Position in shell: inserted directly after BodyTodayRow, before
// TimeOfDayRow. Visual chrome (slider, card layout, kicker eyebrow,
// cardTitle h3, CTA links) matches every other row in the shell.
//
// All data logged in these cards goes to the same entities as the
// rest of the app. v1 of these cards uses local state for tap-feedback;
// real entity wiring lands in a follow-up commit per stage.

import React, { useState } from "react";
import {
  Baby, Stethoscope, Calendar, Activity, Moon as MoonIcon,
  Heart, Droplets, Plus, Check, ChevronRight, ListChecks,
  Thermometer, Sun, Sparkles, Clock, Coffee, Flame, Snowflake,
  Bone, HeartPulse, Award, Pill, BookOpen, MessageCircle,
  TrendingUp, Smile, Frown, Meh, AlertCircle,
} from "lucide-react";
import Row from "./Row";
import { C, PHASE_DEEP, card, kicker, cardTitle, cardSub } from "./tokens";
import { openLogger } from "@/components/UniversalLogger";

// Phase B follow-up: shared nav helper for "Talk to Jess" CTAs.
function goToJess() { try { window.location.href = "/Jess"; } catch {} }

// Shared helpers ─────────────────────────────────────────────────────────────

const ctaLink = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};

function ChipGrid({ chips, selected, onToggle, accent = C.gold }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
      {chips.map((c) => {
        const on = selected.includes(c);
        return (
          <button key={c} onClick={() => onToggle(c)} style={{
            padding: "5px 10px", borderRadius: 9999,
            border: `1px solid ${on ? accent : "rgba(58,44,26,0.16)"}`,
            background: on ? `${accent}22` : "transparent",
            color: C.espresso,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>{c}</button>
        );
      })}
    </div>
  );
}

function SeveritySlider({ value, onChange, accent = C.gold, label = "Severity" }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: "0.08em", fontWeight: 600 }}>
        {label.toUpperCase()} · {value || "—"}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, height: 8, borderRadius: 9999,
            background: value && n <= value ? accent : "rgba(58,44,26,0.10)",
            border: "none", cursor: "pointer", padding: 0,
          }} aria-label={`Severity ${n}`} />
        ))}
      </div>
    </div>
  );
}

function ChecklistItem({ item, onToggle, accent = C.sage }) {
  return (
    <li style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 8px", borderRadius: 10,
      background: item.done ? `${accent}14` : C.cream,
      border: `1px solid ${item.done ? `${accent}33` : "rgba(58,44,26,0.06)"}`,
    }}>
      <button onClick={onToggle} aria-label={`Toggle ${item.text}`} style={{
        width: 20, height: 20, borderRadius: 4,
        background: item.done ? accent : "transparent",
        border: `1.5px solid ${item.done ? accent : "rgba(58,44,26,0.22)"}`,
        cursor: "pointer", padding: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {item.done && <Check size={11} style={{ color: "#fff" }} />}
      </button>
      <span style={{
        flex: 1, fontSize: 12.5, color: C.espresso,
        textDecoration: item.done ? "line-through" : "none",
        opacity: item.done ? 0.6 : 1,
      }}>{item.text}</span>
    </li>
  );
}

// ─── PREGNANCY ──────────────────────────────────────────────────────────────

const PREGNANCY_WEEKS = {
  // Pulled from the existing PREGNANCY_MILESTONES in Planner.jsx; condensed.
  6:  { size: "a sweet pea",  highlights: ["Heart is beating", "Tiny arm + leg buds form", "Neural tube closes"] },
  10: { size: "a strawberry", highlights: ["Organs are forming fast", "Tiny fingernails appear", "Major risk window closes"] },
  14: { size: "a lemon",      highlights: ["Baby can suck their thumb", "Skin is translucent", "T2 begins — energy returns"] },
  20: { size: "a banana",     highlights: ["Anomaly scan due now", "You may feel kicks soon", "Vernix coating forms"] },
  24: { size: "a mango",      highlights: ["Survival viability milestone", "Inner ear matures — they hear you", "Lungs start producing surfactant"] },
  28: { size: "an aubergine", highlights: ["T3 begins — count kicks daily", "REM sleep begins", "Brain wrinkles form"] },
  32: { size: "a coconut",    highlights: ["Practising breathing motions", "Bone hardening accelerates", "You'll feel hiccups"] },
  36: { size: "a romaine lettuce", highlights: ["Head is engaging", "Lungs almost mature", "Hospital bag ready"] },
  40: { size: "a watermelon", highlights: ["Due any day", "Full term", "Rest as much as you can"] },
};

function pickPregnancyWeek(profile) {
  if (!profile?.pregnancy_start_date) return null;
  try {
    const start = new Date(profile.pregnancy_start_date);
    const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const weeks = Math.max(1, Math.min(42, diff));
    return weeks;
  } catch { return null; }
}

function trimesterOf(stage) {
  if (stage === "pregnant-t1") return 1;
  if (stage === "pregnant-t2") return 2;
  if (stage === "pregnant-t3") return 3;
  return null;
}

function BabyThisWeekCard({ profile, trimester }) {
  const weeks = pickPregnancyWeek(profile) || (trimester === 1 ? 8 : trimester === 2 ? 18 : 32);
  // Find nearest week with content.
  const keys = Object.keys(PREGNANCY_WEEKS).map(Number).sort((a, b) => a - b);
  const nearest = keys.reduce((acc, k) => (Math.abs(k - weeks) < Math.abs(acc - weeks) ? k : acc), keys[0]);
  const data = PREGNANCY_WEEKS[nearest];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Baby size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>BABY THIS WEEK</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Week {weeks}</h3>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: C.muted,
          padding: "3px 9px", borderRadius: 9999,
          background: `${C.gold}1A`, letterSpacing: "0.08em",
        }}>T{trimester || 1}</span>
      </div>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 13, color: C.espresso, margin: "6px 0 0", lineHeight: 1.5,
      }}>Your baby is the size of {data.size}.</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {data.highlights.map((h) => (
          <li key={h} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: C.espresso, lineHeight: 1.45 }}>
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: C.gold, marginTop: 7, flexShrink: 0 }} />
            {h}
          </li>
        ))}
      </ul>
    </article>
  );
}

function KickCounterCard({ trimester }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(null);
  function tap() {
    setCount((c) => c + 1);
    if (!started) setStarted(Date.now());
  }
  function reset() { setCount(0); setStarted(null); }
  if (trimester === 1) {
    return (
      <article style={{ ...card, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <span style={kicker}>KICK COUNTER</span>
        <h3 style={cardTitle}>Coming in trimester 2</h3>
        <p style={cardSub}>Most people start feeling kicks around weeks 16–20.</p>
      </article>
    );
  }
  const minutes = started ? Math.floor((Date.now() - started) / 60000) : 0;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>KICK COUNTER</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{count} / 10 today</h3>
        </div>
      </div>
      <button onClick={tap} style={{
        marginTop: 10, padding: "22px 16px", borderRadius: 16,
        background: C.espresso, color: C.cream, border: "none", cursor: "pointer",
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500,
        boxShadow: "0 2px 12px rgba(58,44,26,0.18)",
      }}>Tap when baby kicks</button>
      <p style={cardSub}>{started ? `Started ${minutes} min ago` : "Aim for 10 kicks in 2 hours"}</p>
      {count > 0 && (
        <button onClick={reset} style={ctaLink}>Reset session <ChevronRight size={11} /></button>
      )}
    </article>
  );
}

function AntenatalTrackerCard() {
  const next = { date: "Mon 26 May", type: "Midwife — 28-week check" };
  const checklist = [
    "Bring maternity notes",
    "Ask about glucose tolerance test",
    "Discuss kick counting from this week",
  ];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Stethoscope size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>ANTENATAL</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{next.type}</h3>
        </div>
      </div>
      <div style={{
        marginTop: 4, padding: "6px 10px", borderRadius: 10,
        background: C.cream, border: `1px solid rgba(58,44,26,0.06)`,
      }}>
        <div style={{ fontSize: 10, color: C.goldDeep, fontWeight: 700, letterSpacing: "0.10em" }}>NEXT</div>
        <div style={{ fontSize: 13.5, color: C.espresso, fontWeight: 600 }}>{next.date}</div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {checklist.map((c) => (
          <li key={c} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: C.espresso, lineHeight: 1.45 }}>
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: C.sage, marginTop: 7, flexShrink: 0 }} />
            {c}
          </li>
        ))}
      </ul>
      <button onClick={() => openLogger("event")} style={ctaLink}><Plus size={11} /> Add appointment <ChevronRight size={11} /></button>
    </article>
  );
}

function PregnancySymptomsCard() {
  const CHIPS = ["Nausea", "Heartburn", "Fatigue", "Swelling", "Back pain", "Braxton Hicks", "Spotting", "Mood", "Other"];
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState(0);
  function toggle(c) {
    setSelected((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOMS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>How is your body today?</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={selected} onToggle={toggle} accent={C.rose} />
      {selected.length > 0 && <SeveritySlider value={severity} onChange={setSeverity} accent={C.rose} />}
      <p style={cardSub}>These patterns help your midwife notice what matters.</p>
    </article>
  );
}

function BirthPrepCard() {
  const dueDays = 28;
  const [items, setItems] = useState([
    { id: "b1", group: "For baby",    text: "Newborn nappies × 24",     done: false },
    { id: "b2", group: "For baby",    text: "2 sleepsuits + 2 vests",    done: false },
    { id: "b3", group: "For you",     text: "Lip balm + hair tie",       done: true  },
    { id: "b4", group: "For you",     text: "Phone charger (long lead)", done: false },
    { id: "b5", group: "Documents",   text: "Maternity notes",           done: false },
  ]);
  function toggle(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it));
  }
  const groups = ["For baby", "For you", "Documents"];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><ListChecks size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>BIRTH PREP</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Hospital bag</h3>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: C.goldDeep,
          padding: "3px 9px", borderRadius: 9999,
          background: `${C.gold}1A`, letterSpacing: "0.08em",
        }}>{dueDays}d to go</span>
      </div>
      {groups.map((g) => (
        <div key={g} style={{ marginTop: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>{g.toUpperCase()}</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            {items.filter((it) => it.group === g).map((it) => (
              <ChecklistItem key={it.id} item={it} onToggle={() => toggle(it.id)} accent={C.gold} />
            ))}
          </ul>
        </div>
      ))}
    </article>
  );
}

export function PregnancyRow({ stage, profile }) {
  const trimester = trimesterOf(stage);
  return (
    <Row label="Your pregnancy">
      <BabyThisWeekCard profile={profile} trimester={trimester} />
      <KickCounterCard trimester={trimester} />
      <AntenatalTrackerCard />
      <PregnancySymptomsCard />
      {trimester === 3 && <BirthPrepCard />}
    </Row>
  );
}

// ─── POSTPARTUM ─────────────────────────────────────────────────────────────

function BabyFeedSleepCard() {
  const [lastFeed, setLastFeed] = useState({ at: "08:45", side: "Left", duration: 22 });
  const [lastSleep] = useState({ at: "11:10", duration: 45 });
  const todays = { feeds: 6, sleepH: 4.2 };
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Baby size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FEED & SLEEP</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today: {todays.feeds} feeds · {todays.sleepH}h sleep</h3>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
        <div style={{ background: C.cream, borderRadius: 10, padding: "8px 10px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: C.muted }}>LAST FEED</div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: C.espresso, marginTop: 2 }}>{lastFeed.at}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lastFeed.side} · {lastFeed.duration} min</div>
        </div>
        <div style={{ background: C.cream, borderRadius: 10, padding: "8px 10px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: C.muted }}>LAST SLEEP</div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, color: C.espresso, marginTop: 2 }}>{lastSleep.at}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lastSleep.duration} min</div>
        </div>
      </div>
      <button onClick={() => setLastFeed({ at: new Date().toTimeString().slice(0, 5), side: "Left", duration: 0 })} style={{
        marginTop: 8, padding: "10px 14px", borderRadius: 9999,
        background: C.espresso, color: C.cream, border: "none",
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, fontWeight: 700,
        cursor: "pointer",
      }}>+ Log feed</button>
    </article>
  );
}

function RecoveryCard() {
  const [items, setItems] = useState([
    { id: "r1", text: "Bleeding (lochia) checked",  done: true  },
    { id: "r2", text: "Stitches / wound cleaned",   done: true  },
    { id: "r3", text: "Pelvic floor exercises × 10", done: false },
    { id: "r4", text: "Pain level logged",          done: false },
  ]);
  const checkInDays = 12;
  function toggle(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it));
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>YOUR RECOVERY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's check</h3>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: C.muted,
          padding: "3px 9px", borderRadius: 9999,
          background: `${C.gold}1A`, letterSpacing: "0.08em",
        }}>{checkInDays}d to 6-wk check</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => (
          <ChecklistItem key={it.id} item={it} onToggle={() => toggle(it.id)} accent={C.sage} />
        ))}
      </ul>
      <button style={ctaLink}>EPDS · How are you really? <ChevronRight size={11} /></button>
    </article>
  );
}

function BreastfeedingSupportCard() {
  const [pumped, setPumped] = useState(120);
  const [latch, setLatch] = useState(0);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Droplets size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FEEDING SUPPORT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{pumped}ml pumped today</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button onClick={() => setPumped((p) => Math.max(0, p - 30))} style={adjustBtn}>−30ml</button>
        <button onClick={() => setPumped((p) => p + 30)} style={{ ...adjustBtn, background: C.espresso, color: C.cream }}>+30ml</button>
      </div>
      <SeveritySlider value={latch} onChange={setLatch} accent={C.blush} label="Latch difficulty" />
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Cluster feeding is normal — it doesn't mean low supply.
      </p>
      <button style={ctaLink}>NHS lactation helpline <ChevronRight size={11} /></button>
    </article>
  );
}

function PostpartumMoodCard() {
  const [mood, setMood] = useState(0);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}14`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>MOOD CHECK</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>How are you, really?</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4, justifyContent: "space-between" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const Icon = n <= 2 ? Frown : n === 3 ? Meh : Smile;
          return (
            <button key={n} onClick={() => setMood(n)} aria-label={`Mood ${n} of 5`} style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              background: mood === n ? `${C.plum}1A` : C.cream,
              border: mood === n ? `1px solid ${C.plum}` : "1px solid rgba(58,44,26,0.08)",
              color: C.espresso, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}><Icon size={18} /></button>
          );
        })}
      </div>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        You are not alone. Postnatal feelings can be heavy and changeable — that's real.
      </p>
      <button onClick={goToJess} style={ctaLink}><MessageCircle size={11} /> Talk to Jess <ChevronRight size={11} /></button>
      <p style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>PANDAS · APNI · Samaritans</p>
    </article>
  );
}

export function PostpartumRow() {
  return (
    <Row label="Your fourth trimester">
      <BabyFeedSleepCard />
      <RecoveryCard />
      <BreastfeedingSupportCard />
      <PostpartumMoodCard />
    </Row>
  );
}

// ─── TTC (Trying to Conceive) ───────────────────────────────────────────────

function FertileWindowCard({ phase, cycleDay }) {
  const inWindow = phase === "ovulatory" || (cycleDay && cycleDay >= 11 && cycleDay <= 16);
  const inTww = cycleDay && cycleDay >= 17;
  const [cm, setCm] = useState(null);
  const CM_OPTS = ["Dry", "Sticky", "Creamy", "Watery", "Egg-white"];
  const status = inWindow
    ? "You're in your fertile window."
    : inTww
      ? `TWW · day ${cycleDay - 16} of 14`
      : "Fertile window approaching.";
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FERTILE WINDOW</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{status}</h3>
        </div>
      </div>
      <p style={cardSub}>This cycle: days 11–16 likely fertile · ovulation predicted day 14.</p>
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: "0.08em", fontWeight: 600 }}>
          CERVICAL MUCUS TODAY
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {CM_OPTS.map((opt) => (
            <button key={opt} onClick={() => setCm(opt)} style={{
              padding: "5px 10px", borderRadius: 9999,
              background: cm === opt ? `${C.gold}22` : "transparent",
              border: `1px solid ${cm === opt ? C.gold : "rgba(58,44,26,0.16)"}`,
              color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{opt}</button>
          ))}
        </div>
      </div>
    </article>
  );
}

function OvulationBbtCard() {
  const [bbt, setBbt] = useState("");
  const [opk, setOpk] = useState(null);
  const points = [36.4, 36.3, 36.5, 36.6, 36.5, 36.7, 36.9];
  const min = 36.2, max = 37.0;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Thermometer size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>OVULATION & BBT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>7-day BBT</h3>
        </div>
      </div>
      <svg viewBox="0 0 200 60" width="100%" height="60" style={{ marginTop: 4 }}>
        <polyline
          points={points.map((p, i) => `${(i * 200) / 6},${60 - ((p - min) * 60) / (max - min)}`).join(" ")}
          fill="none" stroke={C.sage} strokeWidth="2"
        />
        {points.map((p, i) => (
          <circle key={i} cx={(i * 200) / 6} cy={60 - ((p - min) * 60) / (max - min)} r="3" fill={C.gold} />
        ))}
      </svg>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <input type="number" step="0.1" value={bbt} onChange={(e) => setBbt(e.target.value)} placeholder="36.5"
          style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(58,44,26,0.12)", background: C.cream, fontFamily: "inherit", fontSize: 13, color: C.espresso }} />
        <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>°C</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {["Negative", "Peak", "Positive"].map((opt) => (
          <button key={opt} onClick={() => setOpk(opt)} style={{
            flex: 1, padding: "5px 8px", borderRadius: 9999,
            background: opk === opt ? `${C.gold}22` : "transparent",
            border: `1px solid ${opk === opt ? C.gold : "rgba(58,44,26,0.16)"}`,
            color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>{opt}</button>
        ))}
      </div>
    </article>
  );
}

function TimingOptimiseCard({ phase }) {
  const TIPS = {
    follicular: "Energy rising — protein-rich breakfasts and gentle strength training support follicle quality.",
    ovulatory:  "Peak fertility window. Intimacy every other day this week — sperm survive 3–5 days.",
    luteal:     "Progesterone needs support. Magnesium-rich foods + 8h sleep matter most now.",
    menstrual:  "Iron-rich foods and rest. Your body is preparing for a fresh cycle.",
  };
  const SUPPS = ["Folic acid 400mcg", "CoQ10 200mg", "Vitamin D 1000IU"];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>THIS WEEK · CYCLE 3</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Optimise without pressure</h3>
        </div>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic", color: C.plum }}>
        {TIPS[phase] || TIPS.follicular}
      </p>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>SUPPLEMENT REMINDER</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {SUPPS.map((s) => (
            <li key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.espresso }}>
              <Pill size={11} style={{ color: C.sage }} /> {s}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function TwwSupportCard({ cycleDay }) {
  const inTww = cycleDay && cycleDay >= 17;
  const day = inTww ? cycleDay - 16 : 0;
  const CHIPS = ["Implantation cramp", "Spotting", "Tender breasts", "Nausea", "Fatigue"];
  const [picked, setPicked] = useState([]);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  if (!inTww) {
    return (
      <article style={{ ...card, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <span style={kicker}>TWO-WEEK WAIT</span>
        <h3 style={cardTitle}>Active after ovulation</h3>
        <p style={cardSub}>This card unlocks the 14 days between ovulation and your next period.</p>
      </article>
    );
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Clock size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>TWO-WEEK WAIT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Day {day} of 14</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.gold} />
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Test from day 12. Until then — gentle.
      </p>
    </article>
  );
}

export function TtcRow({ phase, cycleDay }) {
  return (
    <Row label="Your conception journey">
      <FertileWindowCard phase={phase} cycleDay={cycleDay} />
      <OvulationBbtCard />
      <TimingOptimiseCard phase={phase} />
      <TwwSupportCard cycleDay={cycleDay} />
    </Row>
  );
}

// ─── PRE-TTC ────────────────────────────────────────────────────────────────

function FoundationChecklistCard() {
  const [items, setItems] = useState([
    { id: "p1", text: "Folic acid started",            done: true  },
    { id: "p2", text: "GP preconception appointment",  done: false },
    { id: "p3", text: "Cervical screening up to date", done: true  },
    { id: "p4", text: "Dental check",                  done: false },
    { id: "p5", text: "Stopped contraception",         done: false },
    { id: "p6", text: "Vitamins started",              done: true  },
  ]);
  function toggle(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it));
  }
  const done = items.filter((it) => it.done).length;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><ListChecks size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FOUNDATION</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{done} of {items.length} complete</h3>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((it) => (
          <ChecklistItem key={it.id} item={it} onToggle={() => toggle(it.id)} accent={C.sage} />
        ))}
      </ul>
    </article>
  );
}

function CycleOptimisationCard({ phase }) {
  const score = 78;
  const luteal = 12;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><TrendingUp size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>CYCLE REGULARITY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Score {score}/100</h3>
        </div>
      </div>
      <div style={{
        marginTop: 6, height: 8, background: "rgba(58,44,26,0.08)", borderRadius: 9999, overflow: "hidden",
      }}>
        <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${C.sage}, ${C.gold})` }} />
      </div>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Your cycles are regular over the last 3 months. Healthy luteal phase length: {luteal} days.
      </p>
      <p style={cardSub}>{phase === "luteal" ? "Late luteal — protect sleep this week." : "Track BBT to confirm ovulation."}</p>
    </article>
  );
}

function BodyPrepCard({ phase }) {
  const FOCUS = {
    follicular: "Strength training this week — builds protein reserves for follicle quality.",
    ovulatory:  "Hydrate intensely. Reduce stress; cortisol blocks ovulation.",
    luteal:     "Wind down by 10pm. Sleep is when conception biology repairs.",
    menstrual:  "Iron-rich foods. Honour the slowdown.",
  };
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Coffee size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>THIS MONTH</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Body prep focus</h3>
        </div>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic", color: C.plum }}>
        {FOCUS[phase] || FOCUS.follicular}
      </p>
      <button style={ctaLink}>Phase meals · Nutrition page <ChevronRight size={11} /></button>
    </article>
  );
}

function FolicAcidTrackerCard() {
  const [streak, setStreak] = useState(14);
  const [todayDone, setTodayDone] = useState(false);
  function tap() {
    if (!todayDone) {
      setTodayDone(true);
      setStreak((s) => s + 1);
    }
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FOLIC ACID</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{streak} days in a row</h3>
        </div>
      </div>
      <button onClick={tap} style={{
        marginTop: 8, padding: "14px 16px", borderRadius: 12,
        background: todayDone ? `${C.sage}22` : C.espresso,
        color: todayDone ? C.sage : C.cream,
        border: todayDone ? `1px solid ${C.sage}33` : "none",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>{todayDone ? <><Check size={13} /> Today done</> : "Tap when taken today"}</button>
      <p style={cardSub}>400mcg daily — from now until 12 weeks pregnant.</p>
      <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Also consider · Vitamin D · Omega-3 · CoQ10 (if 40+)</p>
    </article>
  );
}

export function PreTtcRow({ phase }) {
  return (
    <Row label="Preparing your body">
      <FoundationChecklistCard />
      <CycleOptimisationCard phase={phase} />
      <BodyPrepCard phase={phase} />
      <FolicAcidTrackerCard />
    </Row>
  );
}

// ─── PERIMENOPAUSE ──────────────────────────────────────────────────────────

function PeriSymptomsCard() {
  const CHIPS = ["Hot flush", "Night sweats", "Brain fog", "Joint pain", "Mood changes", "Sleep issues", "Vaginal dryness", "Heart palpitations", "Anxiety", "Irregular bleeding"];
  const [picked, setPicked] = useState(["Hot flush", "Sleep issues"]);
  const [severity, setSeverity] = useState(3);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  const weekTotal = 14;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Flame size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOMS TODAY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{weekTotal} logged this week</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.rose} />
      {picked.length > 0 && <SeveritySlider value={severity} onChange={setSeverity} accent={C.rose} />}
    </article>
  );
}

function HrtLogCard() {
  const [taken, setTaken] = useState(true);
  const hoursAgo = 11;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>HRT TODAY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Estradiol patch · 50mcg</h3>
        </div>
      </div>
      <div style={{
        marginTop: 4, padding: "8px 10px", borderRadius: 10,
        background: taken ? `${C.sage}14` : C.cream,
        border: `1px solid ${taken ? `${C.sage}33` : "rgba(58,44,26,0.06)"}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <button onClick={() => setTaken(!taken)} style={{
          width: 22, height: 22, borderRadius: 4,
          background: taken ? C.sage : "transparent",
          border: `1.5px solid ${taken ? C.sage : "rgba(58,44,26,0.22)"}`,
          cursor: "pointer", padding: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {taken && <Check size={13} style={{ color: "#fff" }} />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso }}>
            {taken ? `Applied · ${hoursAgo}h ago` : "Not yet today"}
          </div>
          <div style={{ fontSize: 10.5, color: C.muted }}>Next prescription due in 18 days</div>
        </div>
      </div>
      <button style={ctaLink}><Plus size={11} /> Log side effect <ChevronRight size={11} /></button>
    </article>
  );
}

function SleepTemperatureCard() {
  const [sweat, setSweat] = useState("Mild");
  const sleep = { hours: 6.5, quality: 3 };
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}14`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><MoonIcon size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>LAST NIGHT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{sleep.hours}h · quality {sleep.quality}/5</h3>
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: "0.08em", fontWeight: 600 }}>NIGHT SWEATS</div>
        <div style={{ display: "flex", gap: 4 }}>
          {["None", "Mild", "Moderate", "Severe"].map((opt) => (
            <button key={opt} onClick={() => setSweat(opt)} style={{
              flex: 1, padding: "5px 6px", borderRadius: 9999,
              background: sweat === opt ? `${C.rose}22` : "transparent",
              border: `1px solid ${sweat === opt ? C.rose : "rgba(58,44,26,0.16)"}`,
              color: C.espresso, fontSize: 10.5, fontWeight: 600, cursor: "pointer",
            }}>{opt}</button>
          ))}
        </div>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Bedroom at 18°C and breathable layers help hot flushes.
      </p>
      <p style={cardSub}>Progesterone drops in perimenopause — this affects sleep first.</p>
    </article>
  );
}

function BoneHeartCard() {
  const [strength, setStrength] = useState(2);
  const [calcium, setCalcium] = useState(false);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Bone size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>BONE & HEART</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Strength training {strength}/3 this week</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button onClick={() => setStrength((s) => Math.max(0, s - 1))} style={adjustBtn}>−</button>
        <button onClick={() => setStrength((s) => Math.min(7, s + 1))} style={{ ...adjustBtn, background: C.espresso, color: C.cream }}>+</button>
      </div>
      <div style={{
        marginTop: 6, padding: "6px 10px", borderRadius: 10,
        background: calcium ? `${C.sage}14` : C.cream,
        border: `1px solid ${calcium ? `${C.sage}33` : "rgba(58,44,26,0.06)"}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <button onClick={() => setCalcium(!calcium)} style={{
          width: 18, height: 18, borderRadius: 4,
          background: calcium ? C.sage : "transparent",
          border: `1.5px solid ${calcium ? C.sage : "rgba(58,44,26,0.22)"}`,
          cursor: "pointer", padding: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{calcium && <Check size={11} style={{ color: "#fff" }} />}</button>
        <span style={{ fontSize: 12.5, color: C.espresso, flex: 1 }}>Calcium today</span>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Oestrogen decline raises cardiac risk — movement matters now.
      </p>
    </article>
  );
}

export function PerimenopauseRow() {
  return (
    <Row label="Your perimenopause">
      <PeriSymptomsCard />
      <HrtLogCard />
      <SleepTemperatureCard />
      <BoneHeartCard />
    </Row>
  );
}

// ─── MENOPAUSE / POST-MENOPAUSE ─────────────────────────────────────────────

function MenoMedsCard() {
  const [items, setItems] = useState([
    { id: "x1", text: "Estradiol patch 50mcg", done: true  },
    { id: "x2", text: "Vaginal oestrogen",     done: false },
    { id: "x3", text: "Vitamin D 1000IU",      done: true  },
  ]);
  function toggle(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it));
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>HRT & MEDS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's stack</h3>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((it) => (
          <ChecklistItem key={it.id} item={it} onToggle={() => toggle(it.id)} accent={C.sage} />
        ))}
      </ul>
      <p style={cardSub}>Next prescription renewal: 18 days.</p>
    </article>
  );
}

function MenoSymptomCard() {
  const CHIPS = ["Hot flush", "Vaginal dryness", "Urinary symptoms", "Joint pain", "Brain fog", "Mood", "Sleep", "Libido"];
  const [picked, setPicked] = useState([]);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOMS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's check</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.rose} />
      <p style={cardSub}>Tap chips to add. Long-press to set frequency.</p>
    </article>
  );
}

function LifestyleMedicineCard() {
  const [strength, setStrength] = useState(2);
  const [protein, setProtein] = useState(false);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><HeartPulse size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>LIFESTYLE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Bones · heart · muscle</h3>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 4 }}>STRENGTH THIS WEEK · {strength}/3</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStrength((s) => Math.max(0, s - 1))} style={adjustBtn}>−</button>
          <button onClick={() => setStrength((s) => Math.min(7, s + 1))} style={{ ...adjustBtn, background: C.espresso, color: C.cream }}>+</button>
        </div>
      </div>
      <div style={{
        marginTop: 6, padding: "6px 10px", borderRadius: 10,
        background: protein ? `${C.sage}14` : C.cream,
        border: `1px solid ${protein ? `${C.sage}33` : "rgba(58,44,26,0.06)"}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <button onClick={() => setProtein(!protein)} style={{
          width: 18, height: 18, borderRadius: 4,
          background: protein ? C.sage : "transparent",
          border: `1.5px solid ${protein ? C.sage : "rgba(58,44,26,0.22)"}`,
          cursor: "pointer", padding: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{protein && <Check size={11} style={{ color: "#fff" }} />}</button>
        <span style={{ fontSize: 12.5, color: C.espresso, flex: 1 }}>1.2g/kg protein today</span>
      </div>
      <p style={cardSub}>Alcohol slows oestrogen metabolism. Sleep matters most.</p>
    </article>
  );
}

function MenoWellbeingCard() {
  const [mood, setMood] = useState(0);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}14`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>WELLBEING</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today, in this chapter</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4, justifyContent: "space-between" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const Icon = n <= 2 ? Frown : n === 3 ? Meh : Smile;
          return (
            <button key={n} onClick={() => setMood(n)} aria-label={`Mood ${n}`} style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              background: mood === n ? `${C.plum}1A` : C.cream,
              border: mood === n ? `1px solid ${C.plum}` : "1px solid rgba(58,44,26,0.08)",
              color: C.espresso, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}><Icon size={18} /></button>
          );
        })}
      </div>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 13, color: C.muted, margin: "8px 0 0", lineHeight: 1.5,
      }}>
        What's becoming clearer for you this week?
      </p>
      <button onClick={goToJess} style={ctaLink}><MessageCircle size={11} /> Talk to Jess <ChevronRight size={11} /></button>
    </article>
  );
}

export function MenopauseRow() {
  return (
    <Row label="Your menopause">
      <MenoMedsCard />
      <MenoSymptomCard />
      <LifestyleMedicineCard />
      <MenoWellbeingCard />
    </Row>
  );
}

// ─── TEEN ───────────────────────────────────────────────────────────────────

const TEEN_PHASE_COPY = {
  menstrual:  { what: "Your period phase. Energy is naturally lower.", fact: "Cramps come from your uterus muscles squeezing. They're real and they ease." },
  follicular: { what: "Energy is rising. Your body is preparing for ovulation.", fact: "This is when learning new things feels easiest." },
  ovulatory:  { what: "Peak energy. Your body is in 'ovulation' mode.", fact: "Most regular cycles ovulate around day 14 — but variation is normal." },
  luteal:     { what: "Hormones shift before your next period. Moods can swing.", fact: "PMS is real biology — it's not 'in your head'." },
};

function CycleEducationCard({ phase }) {
  const copy = TEEN_PHASE_COPY[phase] || TEEN_PHASE_COPY.follicular;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><BookOpen size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>YOUR PHASE TODAY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{phase ? phase[0].toUpperCase() + phase.slice(1) : "Learning"}</h3>
        </div>
      </div>
      <p style={cardSub}>{copy.what}</p>
      <div style={{
        marginTop: 6, padding: "8px 10px", borderRadius: 10,
        background: C.cream, border: `1px solid rgba(58,44,26,0.06)`,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: C.goldDeep }}>DID YOU KNOW?</div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12.5, color: C.espresso, marginTop: 3, lineHeight: 1.45 }}>
          {copy.fact}
        </div>
      </div>
    </article>
  );
}

function BodyCheckinCard() {
  const [body, setBody] = useState(0);
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>CHECK-IN</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>How is it, really?</h3>
        </div>
      </div>
      {[
        { label: "Body",   value: body,   set: setBody   },
        { label: "Mood",   value: mood,   set: setMood   },
        { label: "Energy", value: energy, set: setEnergy },
      ].map((row) => (
        <div key={row.label} style={{ marginTop: 6 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 3 }}>{row.label.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const Icon = n <= 2 ? Frown : n === 3 ? Meh : Smile;
              return (
                <button key={n} onClick={() => row.set(n)} aria-label={`${row.label} ${n}`} style={{
                  flex: 1, padding: "6px 0", borderRadius: 9999,
                  background: row.value === n ? `${C.gold}22` : C.cream,
                  border: `1px solid ${row.value === n ? C.gold : "rgba(58,44,26,0.08)"}`,
                  color: C.espresso, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}><Icon size={14} /></button>
              );
            })}
          </div>
        </div>
      ))}
      <p style={{ ...cardSub, fontStyle: "italic" }}>No right or wrong answers.</p>
    </article>
  );
}

function PeriodTrackerCard() {
  const FLOWS = ["None", "Light", "Medium", "Heavy"];
  const [flow, setFlow] = useState(null);
  const [pain, setPain] = useState(0);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Droplets size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>PERIOD</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's log</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {FLOWS.map((opt) => (
          <button key={opt} onClick={() => setFlow(opt)} style={{
            flex: 1, padding: "6px 8px", borderRadius: 9999,
            background: flow === opt ? `${C.rose}22` : "transparent",
            border: `1px solid ${flow === opt ? C.rose : "rgba(58,44,26,0.16)"}`,
            color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>{opt}</button>
        ))}
      </div>
      <SeveritySlider value={pain} onChange={setPain} accent={C.rose} label="Pain" />
      <button style={ctaLink}><AlertCircle size={11} /> Is this normal? <ChevronRight size={11} /></button>
    </article>
  );
}

function TalkAboutItCard({ phase }) {
  const PROMPTS = {
    menstrual:  "Something I noticed about my body during my period…",
    follicular: "Something I felt excited or curious about this week…",
    ovulatory:  "A moment I felt confident this week…",
    luteal:     "Something I'm finding hard to say out loud…",
  };
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><MessageCircle size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>TALK ABOUT IT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>A prompt for today</h3>
        </div>
      </div>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 13, color: C.plum, margin: "6px 0 0", lineHeight: 1.5,
      }}>{PROMPTS[phase] || PROMPTS.follicular}</p>
      <p style={cardSub}>In this phase it's normal to feel a lot. You're not alone.</p>
      <button onClick={goToJess} style={ctaLink}><Sparkles size={11} /> Talk to Jess <ChevronRight size={11} /></button>
    </article>
  );
}

export function TeenRow({ phase }) {
  return (
    <Row label="Your cycle journey">
      <CycleEducationCard phase={phase} />
      <BodyCheckinCard />
      <PeriodTrackerCard />
      <TalkAboutItCard phase={phase} />
    </Row>
  );
}

// ─── Router ─────────────────────────────────────────────────────────────────
// Returns the matching stage row, or null for stages without a dedicated
// row (e.g. reproductive — the base experience already covers it).

function StageRow({ stage, profile, phase, cycleDay }) {
  if (!stage) return null;
  if (stage.startsWith("pregnant"))                   return <PregnancyRow stage={stage} profile={profile} />;
  if (stage === "postpartum")                          return <PostpartumRow />;
  if (stage === "ttc")                                 return <TtcRow phase={phase} cycleDay={cycleDay} />;
  if (stage === "pre-ttc")                             return <PreTtcRow phase={phase} />;
  if (stage === "perimenopause")                       return <PerimenopauseRow />;
  if (stage === "menopause" || stage === "post-menopause") return <MenopauseRow />;
  if (stage === "teen")                                return <TeenRow phase={phase} />;
  return null;
}

const adjustBtn = {
  flex: 1, padding: "8px 0", borderRadius: 9999,
  background: C.cream, color: C.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
};

export default React.memo(StageRow);
