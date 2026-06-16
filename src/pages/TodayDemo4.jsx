// TodayDemo4 — "Card-slider / deck home, FULL" (Today redesign, Direction 4)
// ────────────────────────────────────────────────────────────────────────────
// A swipeable DECK of full cards — focus · garden · journal · nutrition ·
// community · planner · lifestyle. Each card is RICHLY populated (not a single
// line); the next card peeks at the right edge; a dot rail + label rail steer.
// Depth is lateral. Reuses the Nutrition hub's slider language so Today reads as
// one system. No scores / streaks / counts.
//
// Self-contained PREVIEW: useState/useRef/useEffect + computeCycleDay ONLY. No
// base44, no entities, no network, no required props. Brand-pure: Editorial T
// tokens, crimson the single pop, NO emoji, Lucide + inline SVG only.
import { useState, useRef, useEffect } from "react";
import {
  ChevronRight, ChevronLeft, Wind, BookOpen, Salad, Leaf, Users, PenLine, Moon,
  Heart as HeartIcon, Headphones, Phone, Footprints, Droplet, Sparkles,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG, PHASE_COLORS,
} from "@/components/journal/Editorial";
import { computeCycleDay } from "@/hooks/useCycleDay";

const COL = 430;
const CARD_W = 320;
const GAP = 14;
const ME = { name: "Hannah" };
const DATE_LABEL = "Tuesday 16 June";
function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
const MOCK_PROFILE = { last_period_start_date: isoDaysAgo(21), cycle_avg_length: 28, period_length: 5, life_stage: "reproductive" };

function Bloom({ size = 80 }) {
  const cx = 50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Meadowlight, blooming" style={{ flex: "none" }}>
      <path d="M50 92 C 48 70 52 54 50 42" stroke={T.sage} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d="M50 72 C 38 68 31 71 28 79 C 39 81 47 76 50 69 Z" fill={T.sage} opacity={0.9} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={cx} cy={26} rx={7} ry={14} fill={T.blush} opacity={0.94} transform={`rotate(${a} ${cx} 40)`} />
      ))}
      <circle cx={cx} cy={40} r={7.5} fill={T.gold} />
      <circle cx={cx} cy={40} r={3.5} fill={T.crimson} opacity={0.5} />
    </svg>
  );
}

const DECK = ["focus", "garden", "journal", "nutrition", "community", "planner", "lifestyle"];
const LABEL = { focus: "Today", garden: "Garden", journal: "Journal", nutrition: "Nourish", community: "Circle", planner: "Plan", lifestyle: "Read" };

function Doorway({ children, to }) {
  return <a href={`/${to}`} style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted, textDecoration: "none", paddingTop: 12 }}>{children} <ChevronRight size={13} /></a>;
}
function Head({ Icon, eyebrow, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
        <Icon size={16} strokeWidth={1.7} color={accent} />
      </span>
      <Eyebrow color={accent}>{eyebrow}</Eyebrow>
    </div>
  );
}

function CardBody({ id }) {
  if (id === "focus") return (
    <>
      <Head Icon={Wind} eyebrow="Your one thing today" accent={T.crimson} />
      <Script size={28}>A five-minute settle</Script>
      <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.5, color: T.inkSoft, margin: "9px 0 0" }}>
        In luteal your nervous system asks for less input. Before the day picks up, one short breath
        practice to take the edge off. Nothing to finish.
      </p>
      <a href="/Lifestyle" style={{ marginTop: 16, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, background: T.ink, color: T.paper, textDecoration: "none", borderRadius: 999, padding: "10px 18px", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>Begin · 5 min <ChevronRight size={15} /></a>
    </>
  );
  if (id === "garden") return (
    <>
      <Head Icon={Leaf} eyebrow="Your garden · Meadowlight" accent={T.sage} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Bloom size={108} />
        <Script size={24} style={{ marginTop: 2 }}>Blooming</Script>
        <Hand size={15.5} color={T.inkSoft} style={{ marginTop: 6 }}>Tended 5 days this week. Today, the line you left fed her — that&apos;s all it ever takes.</Hand>
      </div>
      <Doorway to="Garden">Visit the garden</Doorway>
    </>
  );
  if (id === "journal") return (
    <>
      <Head Icon={PenLine} eyebrow="Journal · 3 entries this cycle" accent={T.gold} />
      <Hand size={19} color={T.ink}>What would feel like enough today?</Hand>
      <div style={{ marginTop: 12, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 13px" }}>
        <Eyebrow mb={3}>Two days ago</Eyebrow>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft, margin: 0, lineHeight: 1.42 }}>&ldquo;I keep circling the same worry, and I&apos;m tired of being the one who holds it…&rdquo;</p>
      </div>
      <Doorway to="Journal">Write a line</Doorway>
    </>
  );
  if (id === "nutrition") return (
    <>
      <Head Icon={Salad} eyebrow="Today's plate" accent={T.sage} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>2 meals · ~840 kcal</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>protein 38g</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
        <Leaf size={14} color={T.gold} />
        <Hand size={15} color={T.inkSoft}>Iron&apos;s leaning light today — a few pumpkin seeds would help.</Hand>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <Droplet size={14} color={T.sage} />
        <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Water · 3 of 6 glasses</span>
      </div>
      <Doorway to="Nutrition">Open nutrition</Doorway>
    </>
  );
  if (id === "community") return (
    <>
      <Head Icon={Users} eyebrow="From the circle" accent={T.crimson} />
      <Hand size={17} color={T.ink}>What small thing lifted you today?</Hand>
      <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "8px 0 0" }}>A few sisters have answered.</p>
      <div style={{ marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px", display: "flex", alignItems: "center", gap: 9 }}>
        <HeartIcon size={14} color={T.crimson} />
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.inkSoft }}>&ldquo;It&apos;s held.&rdquo;</span>
        <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 10, color: T.muted }}>anonymous</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
        <BookOpen size={13} color={T.muted} />
        <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft }}>Books circle — <em>Little Women</em> together.</span>
      </div>
      <Doorway to="Community">Join in</Doorway>
    </>
  );
  if (id === "planner") return (
    <>
      <Head Icon={Sparkles} eyebrow="Your day, gently" accent={T.gold} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 11, overflow: "hidden", border: `1px solid ${T.paperDeep}` }}>
        {[
          { Icon: Footprints, label: "A 10-minute walk", note: "easy" },
          { Icon: Phone, label: "GP call", note: "3 pm" },
          { Icon: Moon, label: "Wind-down by ten", note: "" },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", background: T.paper }}>
            <it.Icon size={16} color={T.muted} strokeWidth={1.7} />
            <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15.5, color: T.ink }}>{it.label}</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{it.note}</span>
          </div>
        ))}
      </div>
      <Hand size={15} color={T.inkSoft} style={{ marginTop: 11 }}>Lighter energy today — keep it kind.</Hand>
      <Doorway to="Planner">Open the day</Doorway>
    </>
  );
  // lifestyle
  return (
    <>
      <Head Icon={BookOpen} eyebrow="Today's read & programme" accent={T.muted} />
      <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 19, margin: 0, lineHeight: 1.2 }}>The quiet power of luteal rest</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 13px" }}>
        <Headphones size={15} color={T.crimson} />
        <span style={{ flex: 1, fontFamily: SERIF, fontSize: 15, color: T.ink }}>Audio · Winding down</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>8 min</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12 }}>
        <span style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink }}>Sleep, gently · day 4 of 7</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>body-scan</span>
      </div>
      <Doorway to="Lifestyle">More to read</Doorway>
    </>
  );
}

export default function TodayDemo4() {
  useEditorialFonts();
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const last = DECK.length - 1;
  const cd = computeCycleDay(MOCK_PROFILE); void cd;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(el.scrollLeft / (CARD_W + GAP));
        setActive(Math.max(0, Math.min(last, i)));
      }, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last]);

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" });
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />
      <DemoRibbon n={4} name="Card deck, full" />

      <div style={{ maxWidth: COL, margin: "0 auto", padding: "58px 0 120px" }}>
        {/* greeting + cycle context */}
        <header style={{ padding: "0 20px" }}>
          <Eyebrow color={T.muted}>{DATE_LABEL}</Eyebrow>
          <Script size={40} style={{ marginTop: 4 }}>{`Good afternoon, ${ME.name}.`}</Script>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: T.paper, background: PHASE_COLORS.luteal, borderRadius: 999, padding: "3px 10px" }}>Day 22 · Luteal</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>Inner Autumn</span>
          </div>
          <Hand size={16} color={T.inkSoft} style={{ marginTop: 7 }}>Swipe through your day — one card at a time.</Hand>
        </header>

        {/* label rail */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "14px 20px 12px", scrollbarWidth: "none" }}>
          {DECK.map((id, i) => (
            <button key={id} onClick={() => goTo(i)} style={{
              flex: "none", background: i === active ? T.ink : "transparent", color: i === active ? T.paper : T.muted,
              border: `1px solid ${i === active ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 12px",
              fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
            }}>{LABEL[id]}</button>
          ))}
        </div>

        {/* the deck */}
        <div ref={trackRef} className="td4-track" style={{
          display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory",
          padding: "0 20px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
        }}>
          <style>{`.td4-track::-webkit-scrollbar{display:none}`}</style>
          {DECK.map((id) => (
            <article key={id} style={{
              flex: `0 0 ${CARD_W}px`, scrollSnapAlign: "start", minHeight: 360,
              display: "flex", flexDirection: "column",
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 19,
              padding: "18px 18px 16px", boxShadow: "0 13px 30px rgba(58,48,32,0.10)",
            }}>
              <CardBody id={id} />
            </article>
          ))}
          <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 40)}px` }} aria-hidden />
        </div>

        {/* prev / dots / next */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "16px 20px 0" }}>
          <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous" style={navBtn(active === 0)}><ChevronLeft size={18} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {DECK.map((id, i) => (
              <button key={id} onClick={() => goTo(i)} aria-label={LABEL[id]} style={{
                width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                background: i === active ? T.crimson : T.paperDeep, cursor: "pointer", transition: "width .2s",
              }} />
            ))}
          </div>
          <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next" style={navBtn(active === last)}><ChevronRight size={18} /></button>
        </div>

        {/* Jess footer voice */}
        <div style={{ margin: "20px 20px 0", background: T.dusk, color: T.paper, borderRadius: 16, padding: "16px 17px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}><Leaf size={13} color={T.dusk} /></span>
            <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
          </div>
          <Hand size={17} color={T.paper}>You don&apos;t have to swipe through all of it, Hannah. The first card is plenty for a luteal afternoon.</Hand>
        </div>
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
    borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
    color: disabled ? T.paperDeep : T.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}

function DemoRibbon({ n, name }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000, background: T.ink, color: T.paper, textAlign: "center", fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, padding: "5px 10px", textTransform: "uppercase" }}>
      DEMO · Today direction {n} — {name}
    </div>
  );
}
