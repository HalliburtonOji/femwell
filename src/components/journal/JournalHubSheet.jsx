import { X, Stethoscope, Waves, Lock, BarChart2, Hash, Eye, Users } from "lucide-react";
import { T, UI, HAND, PRESS, useEscape } from "../journal/Editorial";
import { TWIN_ENABLED } from "../journal/twin/twinConfig";

const ACTIONS = [
  {
    id: "insights",
    icon: BarChart2,
    label: "Insights",
    sub: "Patterns across your writing",
  },
  {
    id: "threads",
    icon: Hash,
    label: "Threads",
    sub: "Series you are keeping",
  },
  {
    id: "letters",
    icon: Lock,
    label: "Sealed Letters",
    sub: "Time-locked notes to future you",
  },
  {
    id: "doctor",
    icon: Stethoscope,
    label: "GP Summary",
    sub: "Export your entries for your doctor",
  },
  {
    id: "echo",
    icon: Waves,
    label: "Echo Wall",
    sub: "Share one line, anonymously",
  },
  {
    id: "witness",
    icon: Eye,
    label: "Witness",
    sub: "Hold space for one sister, or ask one to hold yours",
  },
  // Phase Twin (Q4) — only appears once its entities + functions are deployed
  // and TWIN_ENABLED is flipped on (default off, so live stays clean).
  ...(TWIN_ENABLED ? [{
    id: "twin",
    icon: Users,
    label: "Phase Twin",
    sub: "Twelve days, paired with one woman in your phase",
  }] : []),
];

export default function JournalHubSheet({ open, onClose, onSelect, threads = [] }) {
  useEscape(open ? onClose : null);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(51,41,28,0.45)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-label="Journal menu"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.paperHi,
          width: "100%",
          borderRadius: "18px 18px 0 0",
          padding: "20px 16px 36px",
          maxHeight: "82vh",
          overflowY: "auto",
          paddingBottom: "calc(36px + env(safe-area-inset-bottom, 0))",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, paddingBottom: 14,
          borderBottom: `1px solid ${T.paperDeep}`,
        }}>
          <div>
            <div style={{
              fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", color: T.muted, marginBottom: 2,
            }}>Your Journal</div>
            <div style={{
              fontFamily: HAND, fontSize: 22, fontWeight: 700, color: T.ink, textShadow: PRESS,
            }}>Jump to</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: T.muted, padding: 4, display: "inline-flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {ACTIONS.map((a) => {
            const Ic = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => { onSelect(a.id); onClose(); }}
                style={{
                  background: T.paperHi, border: `1px solid ${T.paperDeep}`,
                  borderRadius: 12, padding: "16px 14px",
                  textAlign: "left", cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Ic size={20} style={{ color: T.gold }} />
                </div>
                <div style={{
                  fontFamily: HAND, fontWeight: 700, fontSize: 17,
                  color: T.ink, textShadow: PRESS, marginBottom: 2, lineHeight: 1.2,
                }}>{a.label}</div>
                <div style={{
                  fontFamily: UI, fontSize: 11, color: T.muted,
                  lineHeight: 1.4,
                }}>{a.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Threads quick-list */}
        {threads.length > 0 && (
          <div>
            <div style={{
              fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", color: T.muted, marginBottom: 10,
            }}>Threads</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {threads.map((t) => (
                <button
                  key={t.name}
                  onClick={() => { onSelect("thread:" + t.name); onClose(); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "transparent", border: `1px solid ${T.paperDeep}`,
                    borderRadius: 999, padding: "7px 14px",
                    fontFamily: UI, fontSize: 12, fontWeight: 700,
                    color: T.ink, cursor: "pointer",
                    letterSpacing: 0.3,
                  }}
                >
                  <Hash size={11} style={{ color: T.gold }} />
                  {t.name}
                  <span style={{ color: T.muted, fontWeight: 600 }}>{t.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}