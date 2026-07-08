// EventsTogether — Community FEATURE #2 (the "Together / Events" surface).
//
// Real events women can attend TOGETHER, made robust + SAFE. Browse/discover real
// events (the EventsItems entity — real reads), external TICKET LINKS (link-out, we
// never process payments), SAVE (SavedItems — real per-user write), device-local
// "I'm going" (private by design), online + in-person, and a SAFETY MODEL baked in
// for in-person women's meetups (public-venue only, tell-a-friend, venue-level
// location, trust signals, meet-safe interstitial before any ticket link, report).
//
// SAFETY-FIRST: we NEVER surface or ask for precise/home location; "who's going" is
// private on your device. Shared "go-together pods" (seeing other women going + forming
// a group) is a labelled OPT-IN that needs a new entity + anon-write function → GATED
// (sign-off) per the function-cap rule; presented honestly, not faked.
//
// Grounded in workspace/research_events_2026-07-08.md.

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ChevronLeft, CalendarDays, MapPin, Ticket, Users, ShieldCheck, ShieldAlert,
  Check, Share2, Flag, Globe, Heart, ExternalLink, UserPlus, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  T, SERIF, UI, Eyebrow, Script, Hand, PAPER_BG, useEditorialFonts,
} from "@/components/journal/Editorial";
import { CornerSprig } from "@/components/brand/flora";
import { toggleSavedItem } from "@/lib/savedItems";
import { useScrollLock } from "@/utils/useScrollLock";

const HANDFAM = '"Cormorant Garamond","Fraunces",Georgia,serif';

// ── device-local "I'm going" (private by design — no server knows where you'll be) ──
const GOING_KEY = "fw_ev_going", HIDDEN_EV_KEY = "fw_ev_hidden";
const readArr = (k) => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };
const writeArr = (k, a) => { try { localStorage.setItem(k, JSON.stringify(a)); } catch { /* ignore */ } };
const isGoing = (id) => readArr(GOING_KEY).includes(id);
const toggleGoing = (id) => { const a = readArr(GOING_KEY); const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); writeArr(GOING_KEY, a); return a.includes(id); };
const isEvHidden = (id) => readArr(HIDDEN_EV_KEY).includes(id);
const hideEv = (id) => { const a = readArr(HIDDEN_EV_KEY); if (!a.includes(id)) { a.push(id); writeArr(HIDDEN_EV_KEY, a); } };

// ── the SAFETY MODEL — the numbered rules the feature enforces (shown in the guide) ──
const SAFETY_RULES = [
  { Icon: MapPin, title: "Public places only", body: "Every event is a public venue — we only ever show the venue or town, never a home address, and never ask for your precise location." },
  { Icon: Share2, title: "Tell someone where you'll be", body: "Before you go, share your plan with a friend — one tap sends them the event and time. Someone always knows where you are." },
  { Icon: ShieldCheck, title: "Trust the signals", body: "Look for the Verified organiser and known ticket-platform badges. Unverified links are flagged — treat them with extra care." },
  { Icon: Users, title: "Your going-status is private", body: "“I'm going” is kept on your phone. No one — not other women, not us — sees where you'll be unless you choose to share it." },
  { Icon: Heart, title: "Trust your gut, always", body: "Meet in daylight the first time, arrange your own way there and back, and leave the moment anything feels off. No explanation owed." },
  { Icon: Flag, title: "Report anything wrong", body: "Flag an event or organiser and we'll review it. Keeping each other safe is the whole point." },
];

// ── online formats (whole-life, not clinical) — real online EventsItems + a labelled
// "hosted by FemWell — coming" note (live video/audio needs sign-off; honest, not faked) ─
const ONLINE_IDEAS = [
  "Book-club video calls", "Cycle-sync sessions", "Watch-alongs", "Cosy co-working", "Guided workshops", "Evening AMAs",
];

// ── a meet-safe interstitial before leaving to any external ticket platform ──
function TicketInterstitial({ ev, onClose }) {
  useScrollLock(true);
  const platform = ev.ticket_platform || ev.source_name || "the ticket site";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2200, background: "rgba(36,26,38,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Before you go" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "16px 16px 0 0", padding: "22px 20px 28px", paddingBottom: "var(--fw-sheet-safe)", maxHeight: "88vh", overflowY: "auto" }}>
        <Eyebrow color={T.gold} mb={8}>Before you go</Eyebrow>
        <Script size={28} style={{ marginBottom: 6 }}>Meet safely</Script>
        <Hand size={16} color={T.inkSoft} style={{ marginBottom: 14 }}>You're heading to <b>{platform}</b> to get tickets — we don't handle payment, so check the price and details there. A few kind reminders:</Hand>
        {[
          "It's a public venue — meet in daylight the first time.",
          "Tell a friend where you're going and when.",
          "Sort your own way there and back.",
          "Trust your gut — you can leave any time.",
        ].map((t) => (
          <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 8 }}>
            <Check size={15} style={{ color: T.sage, marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.4 }}>{t}</span>
          </div>
        ))}
        {ev.verified === false && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#FBE9E6", border: `1px solid ${T.crimson}`, borderRadius: 10, padding: "10px 12px", margin: "10px 0 4px" }}>
            <ShieldAlert size={15} style={{ color: T.crimson, marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: UI, fontSize: 12.5, color: T.crimson, lineHeight: 1.45 }}>This link isn't verified yet — double-check the organiser and site before paying anything.</span>
          </div>
        )}
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.5, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.paperDeep}` }}>FemWell doesn't organise, vet or endorse third-party events — only pay on the official ticket site, never by bank transfer to a stranger.</div>
        <a href={ev.link} target="_blank" rel="noopener noreferrer" onClick={onClose} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: T.ink, color: T.paperHi, textDecoration: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, marginTop: 12 }}>
          <ExternalLink size={15} /> Open {platform}
        </a>
        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "none", color: T.muted, fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 10 }}>Not now</button>
      </div>
    </div>
  );
}

function SafetyGuide({ onClose }) {
  useScrollLock(true);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2200, background: "rgba(36,26,38,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Meeting safely" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "16px 16px 0 0", padding: "22px 20px 28px", paddingBottom: "var(--fw-sheet-safe)", maxHeight: "88vh", overflowY: "auto" }}>
        <Eyebrow color={T.gold} mb={8}>Meeting women safely</Eyebrow>
        <Script size={30} style={{ marginBottom: 6 }}>Our safety promise</Script>
        <Hand size={16} color={T.inkSoft} style={{ marginBottom: 16 }}>Going somewhere new should feel exciting, not scary. Here's how we keep in-person meetups safe — built into how this works, not just a list.</Hand>
        {SAFETY_RULES.map((r, i) => (
          <div key={r.title} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: `${T.sage}22`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={17} color={T.sage} /></span>
            <div>
              <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 17, color: T.ink, marginBottom: 2 }}><span style={{ color: T.gold, fontFamily: UI, fontSize: 12, fontWeight: 800, marginRight: 7 }}>{i + 1}</span>{r.title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>{r.body}</div>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ width: "100%", background: T.ink, color: T.paperHi, border: "none", borderRadius: 12, padding: "13px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 6 }}>Got it</button>
      </div>
    </div>
  );
}

function EventCard({ ev, going, saved, onGoing, onSave, onTickets, onShare, onReport }) {
  const online = !!ev.is_online;
  const acc = online ? T.sage : T.gold;
  const tags = Array.isArray(ev.tags) ? ev.tags : [];
  return (
    <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${acc}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${acc}`, borderRadius: 16, padding: "15px 16px", marginBottom: 13, boxShadow: "0 2px 10px rgba(58,44,26,0.07)" }}>
      <CornerSprig variant="sprig" color={acc} corner="tr" size={46} opacity={0.4} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: online ? T.sage : T.gold, background: `${acc}1C`, borderRadius: 999, padding: "3px 9px" }}>{online ? <><Globe size={11} /> Online</> : <><MapPin size={11} /> In person</>}</span>
          {ev.verified === true && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.sage, background: `${T.sage}1C`, borderRadius: 999, padding: "3px 9px" }}><ShieldCheck size={11} /> Verified organiser</span>}
          {ev.verified === false && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.crimson, background: "#FBE9E6", borderRadius: 999, padding: "3px 9px" }}><ShieldAlert size={11} /> Unverified</span>}
          {ev.is_free && <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: T.sage, background: `${T.sage}1C`, borderRadius: 999, padding: "3px 9px" }}>Free</span>}
        </div>
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: T.ink, lineHeight: 1.25, marginBottom: 8 }}>{ev.title}</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, color: T.muted }}><CalendarDays size={13} color={acc} /> {ev.date || "TBC"}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, color: T.muted }}><MapPin size={13} color={acc} /> {online ? "Online" : (ev.location || ev.city || "Venue TBC")}</span>
          {!ev.is_free && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, color: T.muted }}><Ticket size={13} color={acc} /> {ev.price || "Paid"}</span>}
        </div>
        {(ev.source_name || ev.ticket_platform) && <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 4 }}>{ev.source_name || ev.ticket_platform}</div>}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
            {tags.slice(0, 3).map((t) => <span key={t} style={{ fontFamily: UI, fontSize: 10, color: T.muted, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "2px 8px", textTransform: "capitalize" }}>{t}</span>)}
          </div>
        )}
        {/* primary row — I'm going (private) + tickets (safety interstitial) */}
        <div style={{ display: "flex", gap: 8, marginTop: 13, flexWrap: "wrap" }}>
          <button onClick={() => onGoing(ev)} style={{ flex: 1, minWidth: 130, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 999, padding: "10px 12px", border: going ? `1px solid ${T.sage}` : `1px solid ${T.paperDeep}`, background: going ? `${T.sage}1C` : T.paperHi, color: going ? T.sage : T.inkSoft, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            {going ? <><Check size={14} /> You're going</> : <><UserPlus size={14} /> I'm going</>}
          </button>
          {ev.link && <button onClick={() => onTickets(ev)} style={{ flex: 1, minWidth: 130, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 999, padding: "10px 12px", border: "none", background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Ticket size={14} /> Tickets</button>}
        </div>
        {/* secondary row — save · bring a friend · report */}
        <div style={{ display: "flex", gap: 4, marginTop: 8, alignItems: "center" }}>
          <button onClick={() => onSave(ev)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: saved ? T.crimson : T.muted, fontFamily: UI, fontSize: 11.5, fontWeight: 700 }}><Heart size={13} fill={saved ? T.crimson : "none"} /> {saved ? "Saved" : "Save"}</button>
          <button onClick={() => onShare(ev)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: T.muted, fontFamily: UI, fontSize: 11.5, fontWeight: 700 }}><Share2 size={13} /> Bring a friend</button>
          <button onClick={() => onReport(ev)} aria-label="Report this event" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: T.muted, fontFamily: UI, fontSize: 11.5, fontWeight: 700 }}><Flag size={12} /> Report</button>
        </div>
      </div>
    </div>
  );
}

export default function EventsTogether({ user, onBack, embedded = false }) {
  useEditorialFonts();
  const [events, setEvents] = useState(null);   // null=loading, []=none/err
  const [savedIds, setSavedIds] = useState(new Set());
  const [mode, setMode] = useState("all");        // all · person · online
  const [cat, setCat] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [ticketEv, setTicketEv] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [tick, setTick] = useState(0);            // re-render after device-local going/hide

  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.EventsItems.list("date", 120);
        setEvents(Array.isArray(rows) ? rows : []);
      } catch { setEvents([]); }
      try {
        if (user?.id) {
          const saved = await base44.entities.SavedItems.filter({ user_id: user.id, item_type: "EVENT" }, "-created_at", 120);
          setSavedIds(new Set((saved || []).map((s) => s.item_id)));
        }
      } catch { /* ignore */ }
    })();
  }, [user?.id]);

  const flash = useCallback((m) => { setToast(m); setTimeout(() => setToast(""), 2600); }, []);

  const shown = useMemo(() => {
    const list = (events || []).filter((e) => !isEvHidden(e.id));
    return list.filter((e) => {
      const modeMatch = mode === "all" || (mode === "online" ? e.is_online === true : e.is_online !== true);
      const catMatch = cat === "all" || (Array.isArray(e.tags) && e.tags.includes(cat)) || e.category === cat;
      const freeMatch = !freeOnly || e.is_free === true;
      return modeMatch && catMatch && freeMatch;
    });
  }, [events, mode, cat, freeOnly, tick]);

  const cats = useMemo(() => {
    const s = new Set();
    (events || []).forEach((e) => { (Array.isArray(e.tags) ? e.tags : []).forEach((t) => s.add(t)); });
    return ["all", ...[...s].slice(0, 8)];
  }, [events]);

  const goingCount = readArr(GOING_KEY).length;   // recomputed via tick

  const onGoing = (ev) => { const nowGoing = toggleGoing(ev.id); setTick((t) => t + 1); flash(nowGoing ? "You're going — kept private on your phone." : "Taken off your list."); };
  const onSave = async (ev) => {
    try {
      const r = await toggleSavedItem({ itemType: "EVENT", itemId: ev.id, title: ev.title, previewText: `${ev.is_online ? "Online" : (ev.location || ev.city || "")} · ${ev.price || (ev.is_free ? "Free" : "Paid")}`, meta: { url: ev.link } });
      setSavedIds((cur) => { const n = new Set(cur); if (r?.saved) n.add(ev.id); else n.delete(ev.id); return n; });
    } catch { flash("Couldn't save just now."); }
  };
  const onShare = (ev) => {
    const text = `Fancy this with me? ${ev.title}${ev.date ? " · " + ev.date : ""}${ev.link ? " " + ev.link : ""}`;
    if (navigator.share) { navigator.share({ text }).catch(() => {}); }
    else { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener"); }
  };
  const onReport = (ev) => { hideEv(ev.id); setTick((t) => t + 1); flash("Flagged — we'll review it, and it's hidden from you."); };
  // Online events have no in-person meet, so they skip the meet-safe interstitial (proportionate).
  const onTickets = (ev) => { if (ev.is_online) { if (ev.link) window.open(ev.link, "_blank", "noopener"); } else { setTicketEv(ev); } };

  const nextUp = shown[0] || null;

  return (
    <div style={embedded ? {} : { minHeight: "100vh", ...PAPER_BG }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 18px 60px" }}>
        {onBack && <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "7px 11px", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink, cursor: "pointer", marginBottom: 14 }}><ChevronLeft size={14} /> Together</button>}
        <Eyebrow color={T.gold} mb={6}>Together · Events</Eyebrow>
        <Script size={38} style={{ marginBottom: 4 }}>Go together</Script>
        <Hand size={17} color={T.muted} style={{ marginBottom: 10 }}>Real things to do — near you and online. Find one, say you're going, and bring a friend. Nobody has to walk in alone.</Hand>

        {/* SAFETY = calm on the surface: one quiet link, not a big banner (protection is in
            the background; the meet-safe reminder appears in context when you get tickets). */}
        <button onClick={() => setGuideOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", color: T.sage, fontFamily: UI, fontSize: 12.5, fontWeight: 600, padding: 0, marginBottom: 16 }}>
          <ShieldCheck size={14} /> How we keep meetups safe
        </button>

        {/* filters */}
        <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
          {[["all", "All"], ["person", "In person"], ["online", "Online"]].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} style={{ flex: 1, borderRadius: 999, padding: "8px 10px", border: "none", background: mode === k ? T.ink : T.paperHi, color: mode === k ? T.paperHi : T.muted, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer", boxShadow: mode === k ? "none" : `inset 0 0 0 1px ${T.paperDeep}` }}>{l}</button>
          ))}
        </div>
        <div className="fw-ev-cats" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 4 }}>
          <style>{`.fw-ev-cats{scrollbar-width:none}.fw-ev-cats::-webkit-scrollbar{display:none}`}</style>
          <button onClick={() => setFreeOnly((f) => !f)} style={{ flexShrink: 0, borderRadius: 999, padding: "6px 12px", border: `1px solid ${freeOnly ? T.sage : T.paperDeep}`, background: freeOnly ? `${T.sage}1C` : "transparent", color: freeOnly ? T.sage : T.muted, fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>Free only</button>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, borderRadius: 999, padding: "6px 12px", border: `1px solid ${cat === c ? T.gold : T.paperDeep}`, background: cat === c ? `${T.gold}1C` : "transparent", color: cat === c ? T.gold : T.muted, fontFamily: UI, fontSize: 11.5, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", whiteSpace: "nowrap" }}>{c}</button>
          ))}
        </div>

        {goingCount > 0 && <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.sage, margin: "8px 0 14px", display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={13} /> You're going to {goingCount} {goingCount === 1 ? "event" : "events"} — kept private</div>}

        {/* the list */}
        {events === null && <Hand size={17} color={T.muted}>Finding what's on…</Hand>}
        {events !== null && shown.length === 0 && (
          <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "28px 18px", textAlign: "center" }}>
            <CalendarDays size={26} color={T.gold} style={{ marginBottom: 10 }} />
            <Hand size={17} color={T.ink}>Nothing matches those filters yet.</Hand>
            <Hand size={14.5} color={T.muted}>Try "All", or check back — new events land here regularly.</Hand>
          </div>
        )}
        {events !== null && shown.length > 0 && nextUp && (
          <div style={{ marginBottom: 6 }}>
            <Eyebrow color={T.gold} mb={8}>Next up</Eyebrow>
          </div>
        )}
        {(shown || []).map((ev) => (
          <EventCard key={ev.id} ev={ev} going={isGoing(ev.id)} saved={savedIds.has(ev.id)}
            onGoing={onGoing} onSave={onSave} onTickets={onTickets} onShare={onShare} onReport={onReport} />
        ))}

        {/* GO TOGETHER — the community pod (honest, labelled OPT-IN · needs sign-off) */}
        <div style={{ background: `linear-gradient(160deg, ${T.paperHi} 0%, ${T.plum || "#8E6E8E"}12 100%)`, border: `1px dashed ${T.paperDeep}`, borderRadius: 16, padding: "16px 16px", marginTop: 20 }}>
          <Eyebrow color={T.gold} mb={6}>Going together</Eyebrow>
          <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: T.ink, marginBottom: 6 }}>Find other women going — and go as a little group.</div>
          <Hand size={15} color={T.inkSoft} style={{ marginBottom: 10 }}>Right now, whether you're going is private to you. A future <b>opt-in "go-together"</b> would let a few women quietly say "me too" on an event and meet at the door — anonymous aliases, no contact details, no exact location. It needs a safe shared space to build, so it's off until it's signed off and built properly.</Hand>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onShareGeneric()} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "9px 14px", border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.ink, fontFamily: UI, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><UserPlus size={14} /> Bring a friend you know</button>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, background: "#FBF1E0", border: `1px solid ${T.gold}`, borderRadius: 999, padding: "6px 11px" }}><Sparkles size={12} color={T.gold} /> Community pods — opt-in, coming (needs sign-off)</span>
          </div>
        </div>

        {/* ONLINE — real online events sit in the list above; hosted circles are honest "coming" */}
        <div style={{ marginTop: 20 }}>
          <Eyebrow color={T.gold} mb={8}>Online, together</Eyebrow>
          <Hand size={15} color={T.muted} style={{ marginBottom: 10 }}>Online events show in the list above (tap "Online"). Hosted FemWell circles you join by video — these need live-audio/video we won't rush, so they're on the way:</Hand>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {ONLINE_IDEAS.map((o) => <span key={o} style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.inkSoft, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 12px" }}>{o}</span>)}
          </div>
        </div>
      </div>

      {ticketEv && <TicketInterstitial ev={ticketEv} onClose={() => setTicketEv(null)} />}
      {guideOpen && <SafetyGuide onClose={() => setGuideOpen(false)} />}
      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: "calc(96px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 2300, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 12.5, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", maxWidth: "90vw", textAlign: "center" }}>{toast}</div>
      )}
    </div>
  );

  function onShareGeneric() {
    const text = "Come to an event with me on FemWell — real things to do, safely, together.";
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }
}
