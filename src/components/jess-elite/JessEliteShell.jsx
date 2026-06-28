// JessEliteShell — the LIVE elite Jess surface (flipped onto /Jess and /Assistant).
//
// Promoted from the APPROVED JessClipboardDemo. The brief: keep the WORKING assistant
// (JessDemoPanel, on the `personal_assistant` agent) 100% intact, but brand the SHELL
// — which was on the legacy plum/CSS-var palette — to the v4 Brand Bible.
//
// This shell:
//   • SIGNATURE TOP (§6.8): FwFloraHero (generic "Jess" — OXBLOOD #7A1A12 title, carved
//     heart, foxglove bloom) + ONE SummaryCard.
//   • An ON-BRAND CHAT SURFACE: cream paper, a botanical sigil avatar, Jess's voice in
//     Cormorant italic, brand bubbles + suggestion chips + a branded composer.
//   • WIRED FOR REAL: the composer (type + Enter/Send), every suggestion chip, and the
//     "Open the live Jess" CTA all mount the REAL <AssistantOverlay/> SEEDED with the
//     text — JessDemoPanel auto-sends it and the live agent replies. So Jess genuinely
//     answers from this page; nothing is stripped (chat · history · settings · voice ·
//     Today's-brief / Insights / For-you all live in the preserved panel).
//   • Honours the Ask-Jess deep-link: if a surface stored a prompt in sessionStorage
//     before navigating here (SavedItemCard / AICoachTab), we auto-open the live panel
//     seeded with it — so those flows still answer.
//   • Surfaces what Jess can do as the §6.7 CARD SYSTEM (a clipboard deck of branded cards).
//
// Brand: PAPER_BG, Ephesis/Cormorant, brand tokens, Lucide/SVG, no emoji, reduced-motion-safe.
// Does NOT touch flora.jsx / BRAND_IDENTITY.md / JessDemoPanel internals.
// One-line revert: pages.config "Assistant" → Assistant (and drop the "Jess" entry).

import { useEffect, useState } from "react";
import { Sparkles, Mic, Heart as HeartIcon, Compass, Send, MessageCircle } from "lucide-react";
import {
  PAPER_BG, T, SERIF, UI, Eyebrow, Heart, Script, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { Clipboard, ClipboardSlider } from "@/components/brand/ClipboardSlider";
import { FlowerGlyph } from "@/components/brand/flora";
import { OXBLOOD } from "@/components/brand/SliderKit";
import AssistantOverlay from "@/components/assistant/AssistantOverlay";

// A short glimpse of Jess's VOICE (§10.5 — notice-not-cheerlead, specific, dry UK wit).
// Illustrative, clearly framed as an example; the real conversation is one tap away.
const THREAD = [
  { who: "jess", text: "Rough night? Your check-in clocked a 3am. Be gentle with the list today — and maybe nudge the hard meeting to tomorrow." },
  { who: "me",   text: "yeah, couldn't switch off" },
  { who: "jess", text: "Luteal week and a full moon — your body's running warm, that tracks. A short walk before noon tends to do more for you than a third coffee. (One kettle's allowed.)" },
];

const CHIPS = ["How's my week looking?", "Help me wind down", "What should I eat tonight?", "I had a hard day"];

// Jess's botanical sigil avatar (a meaning-bloom in a soft halo — on-brand, not the legacy orb).
function JessSigil({ size = 44 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: `radial-gradient(circle, ${T.blush}33 0%, ${T.gold}1F 55%, transparent 75%)`, border: `1px solid ${T.paperDeep}` }}>
      <FlowerGlyph variant="foxglove" size={size - 14} color={T.crimson} color2={T.blush} idx="jess-sigil" />
    </div>
  );
}

function Bubble({ who, text }) {
  const me = who === "me";
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", gap: 8, marginTop: 10 }}>
      {!me && <JessSigil size={30} />}
      <div style={{
        maxWidth: "80%", padding: "10px 13px", borderRadius: me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: me ? `${T.crimson}12` : T.paperHi,
        border: `1px solid ${me ? `${T.crimson}55` : T.paperDeep}`,
        fontFamily: SERIF, fontStyle: me ? "normal" : "italic", fontSize: 16, color: T.ink, lineHeight: 1.5,
      }}>{text}</div>
    </div>
  );
}

function SectionLabel({ children, sub }) {
  return (
    <div style={{ margin: "30px 0 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Heart size={13} />
        <Script size={27} color={OXBLOOD}>{children}</Script>
      </div>
      {sub && <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "4px 0 0", lineHeight: 1.4 }}>{sub}</p>}
    </div>
  );
}

// a small branded capability tile inside a clipboard board
function Cap({ Icon, title, line, accent }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "11px 0", borderTop: `1px solid ${T.paperDeep}` }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: "#EFE3C9", border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={16} style={{ color: accent }} />
      </span>
      <span>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, display: "block", lineHeight: 1.3 }}>{title}</span>
        <span style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, display: "block", lineHeight: 1.45, marginTop: 2 }}>{line}</span>
      </span>
    </div>
  );
}

export default function JessEliteShell() {
  useEditorialFonts();
  const [openLive, setOpenLive] = useState(false);
  const [seed, setSeed] = useState(null);
  const [draft, setDraft] = useState("");

  // Open the REAL working assistant, seeded with a prompt (auto-sends → live agent replies).
  const openWith = (prompt) => {
    const p = (prompt || draft).trim();
    setSeed(p || null);
    setOpenLive(true);
  };

  // Honour Ask-Jess deep-links: a surface (SavedItemCard / AICoachTab) may have stored a
  // prompt before navigating here. Auto-open the live panel seeded with it so it answers.
  useEffect(() => {
    let p = null;
    try {
      p = sessionStorage.getItem("jess_initial_prompt") || sessionStorage.getItem("jess_chat_prompt");
      sessionStorage.removeItem("jess_initial_prompt");
      sessionStorage.removeItem("jess_chat_prompt");
      sessionStorage.removeItem("jess_open_chat");
    } catch (_) { /* private mode */ }
    if (p) { setSeed(p); setOpenLive(true); }
  }, []);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "26px 20px 50px", position: "relative" }}>

        {/* 1 — SIGNATURE TOP (§6.8) — generic "Jess", OXBLOOD title */}
        <FwFloraHero
          title="Jess"
          line="Your wellness companion — she notices, she remembers, and she's a smart friend, never a clinician."
          bloom="foxglove" colorway="blush" flankL="rose" flankR="lavender" creature="butterfly"
          titleColor={OXBLOOD} idx="jess-hero"
        />

        {/* 2 — ONE SUMMARY CARD (§6.8) */}
        <div style={{ marginTop: 18 }}>
          <SummaryCard
            eyebrow="Today with Jess"
            accent={T.crimson}
            rows={[
              { Icon: Sparkles, label: "Today's brief", text: "A gentle read on your day — mood, energy, where you are in your cycle." },
              { Icon: Compass,  label: "Ask anything", text: "Your day, a hard conversation, what to cook — life, not just health." },
              { Icon: Mic,      label: "Voice note", text: "Say it out loud; Jess logs it for you, hands-free." },
            ]}
          />
        </div>

        {/* 3 — THE ON-BRAND CHAT SURFACE (wired to the real agent) */}
        <SectionLabel sub="Type below and Jess answers — the real conversation, in her voice.">Talk to Jess</SectionLabel>
        <div style={{ position: "relative", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.crimson}0E 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.crimson}`, borderRadius: 20, padding: "16px 16px 14px", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <JessSigil size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Heart size={13} />
                <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink }}>Jess</span>
              </div>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, display: "block", lineHeight: 1.4 }}>Wellness companion · not medical advice · private to you</span>
            </div>
          </div>

          {/* a glimpse of her voice (illustrative) */}
          <div style={{ marginTop: 12 }}>
            {THREAD.map((m, i) => <Bubble key={i} who={m.who} text={m.text} />)}
          </div>
          <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, fontStyle: "italic", margin: "8px 2px 0", opacity: 0.85 }}>
            A glimpse of how she sounds. Ask her anything below to start your own.
          </p>

          {/* suggestion chips — each opens the live chat seeded */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 14 }}>
            {CHIPS.map((c) => (
              <button key={c} onClick={() => openWith(c)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 13px", cursor: "pointer" }}>{c}</button>
            ))}
          </div>

          {/* composer — sends to the real agent */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "6px 6px 6px 14px" }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") openWith(); }} placeholder="Tell Jess how you are…"
              style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: SERIF, fontSize: 16, color: T.ink }} />
            <button onClick={() => openWith()} aria-label="Voice" style={{ width: 38, height: 38, borderRadius: 999, background: "transparent", border: `1px solid ${T.paperDeep}`, color: T.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><Mic size={16} /></button>
            <button onClick={() => openWith()} aria-label="Send" style={{ width: 38, height: 38, borderRadius: 999, background: T.crimson, border: "none", color: T.paper, display: "grid", placeItems: "center", cursor: "pointer" }}><Send size={16} /></button>
          </div>
        </div>

        {/* 4 — WHAT JESS CAN DO (the §6.7 card system, as clipboard boards) */}
        <SectionLabel sub="Her capabilities in the brand card family.">What Jess holds</SectionLabel>
        <ClipboardSlider hint="Slide →" accent={T.gold}>
          <Clipboard title="Notices & remembers" sub="The companion layer" accent={T.crimson} flower="rose" idx="cb-jess-1" titleColor={OXBLOOD}>
            <Cap Icon={Sparkles} accent={T.crimson} title="Today's brief" line="A warm read on your mood, energy and cycle phase — the day, not a dashboard." />
            <Cap Icon={HeartIcon} accent={T.crimson} title="Pattern noticing" line="“You tend to dip on day 19” — gentle, at most once a day, never nagging." />
            <Cap Icon={MessageCircle} accent={T.crimson} title="Memory" line="What you've told her carries over — vegetarian, low-energy in luteal, TTC since March." />
          </Clipboard>
          <Clipboard title="Does things for you" sub="The action layer" accent={T.gold} flower="sunflower" idx="cb-jess-2" titleColor={OXBLOOD}>
            <Cap Icon={Mic} accent={T.gold} title="Voice logging" line="Speak it; Jess writes the symptom, meal or mood for you, hands-free." />
            <Cap Icon={Compass} accent={T.gold} title="Ask anything, life-wide" line="A hard conversation, what to cook, a money worry — she holds the whole of life, not just health." />
            <Cap Icon={Send} accent={T.gold} title="For you" line="A pick that fits today — a read, a recipe, a wind-down — with the reason why." />
          </Clipboard>
        </ClipboardSlider>

        {/* 5 — the full working assistant, one tap away */}
        <div style={{ marginTop: 30, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "18px 16px", textAlign: "center" }}>
          <Eyebrow color={T.muted} mb={6}>The full assistant</Eyebrow>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: "0 0 14px" }}>
            Live chat, conversation history, settings &amp; memory, voice mode, and the
            Today's-brief / Insights / For-you tabs — all here.
          </p>
          <button onClick={() => openWith()} style={{
            display: "inline-flex", alignItems: "center", gap: 8, background: T.crimson, color: T.paper, border: "none",
            borderRadius: 999, padding: "13px 22px", cursor: "pointer", fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4,
          }}>
            <MessageCircle size={16} /> Open the live Jess
          </button>
        </div>

        <div style={{ marginTop: 40 }}><EditorialFooter /></div>
      </div>

      {/* the REAL working assistant overlay (preserved verbatim, seeded → live agent replies) */}
      <AssistantOverlay open={openLive} onClose={() => setOpenLive(false)} initialPrompt={seed} />
    </div>
  );
}
