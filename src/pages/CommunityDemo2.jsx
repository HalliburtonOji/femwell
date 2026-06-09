// CommunityDemo2 — "The Lounge + Echo" (Community design demo · /Ideas → Community Demos)
// ─────────────────────────────────────────────────────────────────────────────
// The anonymous warm vent / "AIBU" / spill-it room — the daily-engagement engine.
// WHOLE-LIFE, not clinical: career, friendship, dating, money, small joys, hot-takes.
// Kindness-by-design: one-way reactions (held · me too · hear you · saved), NO scores,
// no handles, no leaderboards. Compose runs a mock crisis-lexicon scan → if it reads
// as crisis it NEVER posts and routes to a UK-resources intercept card instead. A small
// Echo Wall strip shows the bridge: a vent can become one scrubbed one-line echo.
//
// From WHOLE_LIFE_REBALANCE.html (The Lounge) + COMMUNITY_MEGA_PLAN §0.5 (D).
// Self-contained, mock data + useState only — no base44/entities. UK voice, no emoji,
// Lucide/SVG only. Palette via T; primary buttons = ink bg + cream text (no gold/espresso).
import { useState } from "react";
import {
  HeartHandshake, Users, Ear, Bookmark, Sparkles, PenLine, ShieldAlert,
  Phone, Check, X, Waves, Heart,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, EditorialFooter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const CREAM = "#F4EFE3"; // cream text on ink buttons

// ── the vent feed — whole-life, NOT health-only (silly → serious) ─────────────
const SEED = [
  { id: "v1", era: "career", body: "Told my manager no for the first time today. Out loud. The ceiling did not cave in. I think I forgot you were allowed to do that.", crest: true,  held: 22, metoo: 9,  hear: 14, saved: 6 },
  { id: "v2", era: "friendship", body: "My oldest friend went quiet for three weeks and I cannot tell if I have done something or if she is just drowning in her own week. Hate the not-knowing.", crest: false, held: 11, metoo: 18, hear: 7,  saved: 2 },
  { id: "v3", era: "dating", body: "He texted back after nine days like nothing happened. Reader, I did not reply with the paragraph I wrote at 1am. Growth, possibly.", crest: false, held: 8,  metoo: 13, hear: 5,  saved: 3 },
  { id: "v4", era: "a small joy", body: "Found a tenner in a coat I had not worn since spring. Bought myself the good coffee. Nobody can take this from me.", crest: true,  held: 31, metoo: 6,  hear: 4,  saved: 9 },
  { id: "v5", era: "money", body: "Opened the banking app for the first time in a fortnight and it was not as bad as the story in my head. Still not great. But the story was worse.", crest: false, held: 19, metoo: 21, hear: 11, saved: 8 },
  { id: "v6", era: null, body: "Is it just me, or is 'let's circle back' the most threatening sentence in the English language.", crest: false, held: 27, metoo: 24, hear: 3,  saved: 4 },
];

// one-way kind reactions — NO competitive counts shown, no scoreboard
const REACTIONS = [
  { key: "held",  icon: HeartHandshake, label: "held" },
  { key: "metoo", icon: Users,          label: "me too" },
  { key: "hear",  icon: Ear,            label: "hear you" },
  { key: "saved", icon: Bookmark,       label: "saved" },
];

// one-line scrubbed echoes that fade (the bridge from a vent)
const ECHOES = [
  "Said the quieter no today. It cost me nothing I'll miss.",
  "The story in my head was worse than the bank app.",
  "Growth looks like the paragraph I didn't send.",
];

// a deliberately broad mock crisis lexicon (mirrors echoConfig.CRISIS_PATTERNS shape)
const CRISIS = ["end it", "no point", "hurt myself", "kill myself", "can't go on", "worthless", "better off without me"];

export default function CommunityDemo2() {
  useEditorialFonts();
  const [feed, setFeed] = useState(SEED);
  const [reacted, setReacted] = useState({});       // { [id]: { held:true, ... } }
  const [composeOpen, setComposeOpen] = useState(false);
  const [echoes, setEchoes] = useState(ECHOES);

  const react = (id, key) => {
    if (reacted[id]?.[key]) return;                  // one-way, on-device dedup
    setReacted((r) => ({ ...r, [id]: { ...r[id], [key]: true } }));
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <DemoBanner label="Community · The Lounge + Echo — design demo · mock data" />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "24px 18px 0" }}>
        {/* masthead */}
        <header style={{ textAlign: "center", marginBottom: 16 }}>
          <Eyebrow mb={9} color={T.muted}>The Lounge · anonymous · 18+</Eyebrow>
          <Script size={54} carve>The Lounge</Script>
          <Hand size={19} color={T.inkSoft} style={{ display: "block", margin: "10px auto 0", maxWidth: 350 }}>
            spill it — silly to serious, kind, no names, no judgment
          </Hand>
        </header>

        {/* be-kind norm line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 13px", margin: "0 0 16px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12 }}>
          <Heart size={13} style={{ color: T.crimson }} />
          <span style={{ fontFamily: UI, fontSize: 11.5, color: T.inkSoft, letterSpacing: 0.2 }}>
            <strong style={{ color: T.ink }}>Be kind, be you.</strong> No names go out. Jess holds the door.
          </span>
        </div>

        {/* compose affordance */}
        <button onClick={() => setComposeOpen(true)} style={{ ...pillBtn(true), width: "100%", justifyContent: "center", padding: "13px 0", marginBottom: 8 }}>
          <PenLine size={15} /> Say it here — Jess keeps it anonymous
        </button>

        {/* Echo Wall strip — the bridge: a vent can become one scrubbed echo */}
        <section style={{ border: `1px dashed ${T.paperDeep}`, borderRadius: 14, padding: "13px 15px 14px", margin: "8px 0 20px", background: "transparent" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
            <Waves size={14} color={T.gold} />
            <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: T.muted }}>
              The Echo Wall · one-line, scrubbed, fading
            </span>
          </div>
          {echoes.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", opacity: 1 - i * 0.22 }}>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: T.gold, marginTop: 11, flexShrink: 0 }} />
              <Hand size={18} color={T.inkSoft}>{e}</Hand>
            </div>
          ))}
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, fontStyle: "italic", marginTop: 7 }}>
            A vent can leave one line here — names stripped, gone in 48h.
          </div>
        </section>

        {/* the vent feed */}
        {feed.map((v) => (
          <VentCard key={v.id} v={v} reacted={reacted[v.id] || {}} onReact={react} />
        ))}

        <div style={{ marginTop: 28 }}><EditorialFooter /></div>
      </div>

      {composeOpen && (
        <Compose
          onClose={() => setComposeOpen(false)}
          onPost={(body) => {
            setFeed((f) => [{ id: "n" + Date.now(), era: "just now", body, crest: false, held: 0, metoo: 0, hear: 0, saved: 0 }, ...f]);
            setComposeOpen(false);
          }}
          onEcho={(line) => { setEchoes((e) => [line, ...e].slice(0, 4)); }}
        />
      )}
    </div>
  );
}

// ── one vent ─────────────────────────────────────────────────────────────────
function VentCard({ v, reacted, onReact }) {
  return (
    <article style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "16px 17px 13px", marginBottom: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {v.era && (
          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, background: `${T.gold}1A`, fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: T.gold }}>
            {v.era}
          </span>
        )}
        {v.crest && (
          <span title="A kindness crest — this one drew especially kind holds" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "auto", fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: T.sage }}>
            <Sparkles size={12} /> kindness crest
          </span>
        )}
      </div>

      <Hand size={22} carve style={{ marginBottom: 12 }}>{v.body}</Hand>
      <Rule c={T.paperDeep} mb={11} />

      {/* kind reactions — one-way, NO counts, no scoreboard */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        {REACTIONS.map(({ key, icon: Icon, label }) => {
          const on = !!reacted[key];
          return (
            <button key={key} onClick={() => onReact(v.id, key)} disabled={on} style={{
              display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999,
              background: on ? `${T.gold}22` : "transparent", border: `1px solid ${on ? T.gold : T.paperDeep}`,
              color: on ? T.gold : T.inkSoft, fontFamily: UI, fontSize: 11.5, fontWeight: 600,
              cursor: on ? "default" : "pointer", letterSpacing: 0.2,
            }}>
              <Icon size={13} /> {label}{on && <Check size={11} />}
            </button>
          );
        })}
      </div>
    </article>
  );
}

// ── compose → mock crisis scan → post OR intercept ───────────────────────────
function Compose({ onClose, onPost, onEcho }) {
  const [raw, setRaw] = useState("");
  const [stage, setStage] = useState("write");      // write · crisis · posted
  const [alsoEcho, setAlsoEcho] = useState(true);

  const submit = () => {
    const lc = raw.toLowerCase();
    if (CRISIS.some((p) => lc.includes(p))) { setStage("crisis"); return; }   // NEVER posts
    if (alsoEcho) {
      // demo scrub → one ≤120-char line, names softened, weekday stripped
      let line = raw.replace(/\b(on )?(mon|tues|wednes|thurs|fri|satur|sun)day\b/gi, "")
        .replace(/\b([A-Z][a-z]{2,})\b/g, (m) => (["The", "I", "My", "It", "She", "He", "We", "Reader"].includes(m) ? m : "someone"))
        .replace(/\s+/g, " ").trim().slice(0, 120);
      if (line) onEcho(line);
    }
    onPost(raw.trim());
    setStage("posted");
  };

  return (
    <Sheet onClose={onClose}>
      {stage === "crisis" ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <ShieldAlert size={20} color={T.crimson} />
            <Eyebrow color={T.crimson}>This one isn't for the room</Eyebrow>
          </div>
          <Script size={30} carve>You deserve more than the Lounge can hold.</Script>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, margin: "10px 0 16px", lineHeight: 1.55 }}>
            Not less — more. The room is for venting, not for this. Nothing was posted; this
            stays with you. People are waiting to talk, day or night.
          </p>
          {[["Samaritans", "116 123"], ["NHS", "111"], ["Shout", "text 85258"], ["Mind", "0300 123 3393"]].map(([n, v]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", border: `1px solid ${T.paperDeep}`, borderRadius: 12, marginBottom: 8, background: T.paperHi }}>
              <Phone size={15} color={T.gold} />
              <span style={{ fontFamily: UI, fontSize: 13, color: T.ink, fontWeight: 600 }}>{n}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: UI, fontSize: 13, color: T.inkSoft }}>{v}</span>
            </div>
          ))}
          <button onClick={onClose} style={{ ...pillBtn(true), width: "100%", justifyContent: "center", marginTop: 8 }}>Keep it private</button>
        </div>
      ) : (
        <div>
          <Eyebrow mb={9} color={T.muted}>Spill it — Jess keeps it anonymous</Eyebrow>
          <Script size={30} carve>What's on your chest?</Script>
          <textarea
            value={raw} onChange={(e) => setRaw(e.target.value)} rows={4} autoFocus
            placeholder="Silly to serious. Career, a friend, a date, a small win, money, a hot-take — no names go out."
            style={{ width: "100%", marginTop: 12, padding: "12px 13px", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: SERIF, fontSize: 15.5, color: T.ink, resize: "none", boxSizing: "border-box", outline: "none", lineHeight: 1.5 }}
          />
          <button onClick={() => setAlsoEcho((v) => !v)} style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 11, width: "100%", textAlign: "left",
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
          }}>
            <span style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${alsoEcho ? T.gold : T.paperDeep}`, background: alsoEcho ? T.gold : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {alsoEcho && <Check size={12} color={CREAM} />}
            </span>
            <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.45 }}>
              Also leave one scrubbed line on the Echo Wall — names stripped, fades in 48h.
            </span>
          </button>
          <button onClick={submit} disabled={!raw.trim()} style={{ ...pillBtn(true), width: "100%", justifyContent: "center", marginTop: 14, opacity: raw.trim() ? 1 : 0.4 }}>
            Spill it
          </button>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
            Anonymous · 18+ · be kind, be you. Jess reads for distress before anything posts.
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────
function Sheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,16,11,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...PAPER_BG, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "18px 20px 30px", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(20,16,11,0.25)" }}>
        <InkFilter />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 2 }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DemoBanner({ label }) {
  return (
    <div style={{ background: T.ink, color: CREAM, padding: "8px 16px", textAlign: "center", fontFamily: UI, fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

const pillBtn = (solid) => ({
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "9px 15px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
  background: solid ? T.ink : "transparent", color: solid ? CREAM : T.inkSoft,
  border: `1px solid ${solid ? T.ink : T.paperDeep}`,
});
