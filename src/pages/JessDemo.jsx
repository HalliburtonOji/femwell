// JessDemo — a redesign DEMO that gives Jess (normally a FAB/overlay) a full-screen home. PREVIEW route
// only (/JessDemo). LIVE Jess overlay UNTOUCHED. Conforms to BRAND_IDENTITY.md (blush→gold→sage sigil
// halo; warm smart-friend voice, NOT a clinician).
//
// DISTINCT FORM (a CHAT SCREEN — not a slider/grid/scene/document): a slim Jess header, a conversation
// THREAD (her opening bubbles, phase-aware), a row of "she can help with" bubbles, life-spanning starter
// prompt chips, and a PINNED INPUT BAR at the bottom. Single conversational surface, so no Jump-to
// (multi-layer rule exempts single-section pages). Whole-life prompts (RULE 1), not symptom-only.

import { useState, useEffect, useMemo } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Script, InkFilter, useEditorialFonts, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { floraKeyframes, RichBloomV2 } from "@/components/brand/flora";
import { Loader, DEMO_CSS, withTimeout } from "@/components/demos/demoKit";
import { Send, Coffee, TrendingUp, Compass, HeartHandshake, Wand2, MessageCircle, Smile, Sparkles } from "lucide-react";

const COL = 460;
const GOLD = "#A8893F";

const PROMPTS = [
  { label: "Help me plan a date-night outfit", Icon: Wand2 },
  { label: "I'm nervous about a work presentation", Icon: Compass },
  { label: "A friend's upset with me — what do I say?", Icon: MessageCircle },
  { label: "Distract me — tell me something fun", Icon: Smile },
  { label: "Why am I so tired this week?", Icon: Sparkles },
];
const HELP = [
  { label: "Today's brief", href: "/Today", Icon: Coffee, accent: GOLD },
  { label: "What I've noticed", href: "/Pulse", Icon: TrendingUp, accent: "#8E6E8E" },
  { label: "For you", href: "/Lifestyle", Icon: Compass, accent: "#8FAF8F" },
  { label: "Just talk", href: "/Assistant", Icon: HeartHandshake, accent: "#BC2E27" },
];

function JessAvatar({ size = 40 }) {
  return (
    <span style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "grid", placeItems: "center" }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 210deg, #E8B4B8, #D4AF37, #8FAF8F, #E8B4B8)", opacity: 0.32 }} />
      <span style={{ position: "absolute", inset: 3, borderRadius: "50%", background: T.paperHi, border: `1px solid ${T.paperDeep}` }} />
      <span style={{ position: "relative", lineHeight: 0 }}><RichBloomV2 form="peony" color="#D4AF37" color2="#F0DDA0" accent="#8E6E8E" size={size - 10} animate={false} soft={false} idx="js-av" /></span>
    </span>
  );
}

function Bubble({ children }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
      <JessAvatar size={34} />
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: "4px 18px 18px 18px", padding: "13px 15px", maxWidth: "86%", boxShadow: "0 2px 12px rgba(58,44,26,0.08)" }}>{children}</div>
    </div>
  );
}

export default function JessDemo() {
  useEditorialFonts();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me()); const id = me?.id || null;
      if (id) { const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id })); if (alive) setProfile((profs || []).filter(Boolean)[0] || null); }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const name = profile?.first_name || profile?.preferred_name || "";
  const BRIEF = {
    menstrual: "You're in your inner winter — lower energy is the plan, not a problem. Want me to make today gentler?",
    follicular: "Energy's climbing. Good week to start the thing you've been circling — shall we sketch it out?",
    ovulatory: "You're at your most outward. If there's a message to send or a date to make, today's the day.",
    luteal: "Things turn inward and the fuse gets short — totally normal. Want help protecting your evening?",
  };
  const brief = hasCycle ? (BRIEF[cycle.phase] || "I've got a read on your week whenever you want it.") : "Tell me where you are in your cycle and I'll tune everything to you — but I'm here for all of it, not just that.";
  const go = (q) => { try { window.location.href = q ? `/Assistant#q=${encodeURIComponent(q.slice(0, 240))}` : "/Assistant"; } catch { window.location.href = "/Assistant"; } };

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 150, position: "relative", overflowX: "clip", display: "flex", flexDirection: "column" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>

      <div style={{ maxWidth: COL, width: "100%", margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px", flex: 1 }}>
        {/* HEADER — slim chat header */}
        <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "20px 0 14px", borderBottom: `1px solid ${T.paperDeep}` }}>
          <JessAvatar size={46} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Script size={34} color={T.ink}>Jess</Script><Heart size={14} />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12, color: T.muted }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: T.sage, display: "inline-block" }} /> Here now · private · not medical advice
            </div>
          </div>
        </header>

        {/* THREAD */}
        <div style={{ paddingTop: 18 }}>
          <Bubble>
            <p style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.5, margin: 0 }}>
              Hi{name ? ` ${name}` : ""} — I'm Jess. Your smart friend who happens to know your cycle. Ask me anything: the date-night nerves, the 3am worries, or why you're so tired this week.
            </p>
          </Bubble>
          <Bubble>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 4 }}>{hasCycle ? `Your ${PHASE_LABEL[cycle.phase]?.toLowerCase()} day` : "Today"}</div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>{brief}</p>
          </Bubble>

          {/* she can help with — tappable bubbles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, margin: "6px 0 4px 44px" }}>
            {HELP.map((h) => (
              <a key={h.label} href={h.href} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${h.accent}`, borderRadius: 999, padding: "8px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, textDecoration: "none" }}>
                <h.Icon size={14} color={h.accent} /> {h.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* PINNED INPUT BAR (above the app bottom-nav) */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 45, paddingBottom: "calc(74px + env(safe-area-inset-bottom))", background: "linear-gradient(180deg, rgba(236,231,218,0) 0%, #ECE7DA 28%)" }}>
        <div style={{ maxWidth: COL, margin: "0 auto", padding: "8px 18px 0" }}>
          {/* starter prompt chips */}
          <div className="demo-noscroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 9, WebkitOverflowScrolling: "touch" }}>
            {PROMPTS.map((p) => (
              <button key={p.label} onClick={() => go(p.label)} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 7, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 13px", fontFamily: SERIF, fontSize: 14, color: T.ink, cursor: "pointer", whiteSpace: "nowrap" }}>
                <p.Icon size={14} color={GOLD} /> {p.label}
              </button>
            ))}
          </div>
          {/* input */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "8px 8px 8px 14px", boxShadow: "0 4px 20px rgba(58,44,26,0.14)" }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={500} placeholder="Ask Jess anything…" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(text.trim()); } }}
              style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.4, color: T.ink, outline: "none", maxHeight: 96, padding: "6px 0" }} />
            <button onClick={() => go(text.trim())} aria-label="Send to Jess" style={{ width: 42, height: 42, borderRadius: 14, flexShrink: 0, background: T.crimson, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}><Send size={18} /></button>
          </div>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, textAlign: "center", margin: "7px 0 8px" }}>Continues in the full Jess chat · your conversations are private</p>
        </div>
      </div>
    </div>
  );
}
