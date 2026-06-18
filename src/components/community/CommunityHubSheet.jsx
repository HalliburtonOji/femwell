// CommunityHubSheet — the central "jump to any area" switcher for Community, matching the
// Journal's JournalHubSheet pattern + editorial styling (bottom sheet, "Jump to" header, a
// 2-col grid of areas). A single central control to reach any Community section — alongside
// the existing doors/tabs. Witness/Phase Twin live on the Journal side, so they deep-link there.
// No emoji; Lucide only.

import {
  X, Waves, MessageCircle, Users, HeartHandshake, BookOpen, Dices,
  Heart, Briefcase, Sparkles, Moon, Stethoscope, Eye, HelpCircle,
} from "lucide-react";
import { T, UI, HAND, PRESS, useEscape } from "@/components/journal/Editorial";
import { useScrollLock } from "@/utils/useScrollLock";
import { TWIN_ENABLED } from "@/components/journal/twin/twinConfig";

// id values are Community view keys, except witness/twin which route to the Journal.
const AREAS = [
  { id: "qotd",    icon: HelpCircle,    label: "Question of the day", sub: "Today's one line, and the room's" },
  { id: "echo",    icon: Waves,         label: "Echo Wall",           sub: "Anonymous lines, fading in 48h" },
  { id: "lounge",  icon: MessageCircle, label: "The Lounge",          sub: "Vent, spill it, be heard" },
  { id: "circles", icon: Users,         label: "Circles",             sub: "Cohorts by who you are" },
  { id: "clubs",   icon: HeartHandshake,label: "Clubs",               sub: "Groups for what you do together" },
  { id: "library", icon: BookOpen,      label: "The Library",         sub: "Read together, book clubs" },
  { id: "games",   icon: Dices,         label: "The Games Room",      sub: "Jess's nightly round" },
  { id: "love",    icon: Heart,         label: "Love & Relationships",sub: "Dating, friendship, marriage" },
  { id: "money",   icon: Briefcase,     label: "Money & Work",        sub: "Careers, pay, pensions" },
  { id: "style",   icon: Sparkles,      label: "Style",               sub: "Fashion as confidence" },
  { id: "lighter", icon: Moon,          label: "The Lighter Side",    sub: "Fun, telly, the stars" },
  { id: "health",  icon: Stethoscope,   label: "Health",              sub: "The clinical room, NHS-grounded" },
  { id: "witness", icon: Eye,           label: "Witness",             sub: "Hold space for one sister (in your Journal)" },
  ...(TWIN_ENABLED ? [{ id: "twin", icon: Users, label: "Phase Twin", sub: "Twelve days, paired (in your Journal)" }] : []),
];

export default function CommunityHubSheet({ open, onClose, onSelect }) {
  useEscape(open ? onClose : null);
  useScrollLock(open);   // lock background scroll while the switcher is open
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(51,41,28,0.45)", display: "flex", alignItems: "flex-end" }}>
      <div
        role="dialog" aria-modal="true" aria-label="Community menu"
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.paperHi, width: "100%", borderRadius: "18px 18px 0 0", padding: "20px 16px 36px", maxHeight: "82vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0))" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.paperDeep}` }}>
          <div>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: T.muted, marginBottom: 2 }}>Your Community</div>
            <div style={{ fontFamily: HAND, fontSize: 22, fontWeight: 700, color: T.ink, textShadow: PRESS }}>Jump to</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {AREAS.map((a) => {
            const Ic = a.icon;
            return (
              <button key={a.id} onClick={() => { onSelect(a.id); onClose(); }} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "16px 14px", textAlign: "left", cursor: "pointer", transition: "background 0.15s" }}>
                <div style={{ marginBottom: 8 }}><Ic size={20} style={{ color: T.gold }} /></div>
                <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 17, color: T.ink, textShadow: PRESS, marginBottom: 2, lineHeight: 1.2 }}>{a.label}</div>
                <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{a.sub}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
