// EchoWall — the Community-side Echo Wall surface (Phase 3).
//
// Everyone's live echoes are eligible; the feed is WEIGHTED toward the viewer's
// phase sisters (a soft boost in ranking, never a hard filter). Reactions are a
// fixed lexicon (held / me too) with no replies and no free text. Echoes fade
// 48h after they go live. Reports auto-hide an echo past a threshold. The author
// sees their own still-cooling echoes with a "pull it back" control, and their
// own expired echoes are auto-unposted on load.
//
// Editorial cream/ink system, Lucide icons only, no emoji, UK voice.

import { useState, useEffect, useMemo, useCallback } from "react";
import { Waves, HeartHandshake, Users, Flag, Undo2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  InkFilter, T, UI, Script, Hand, Eyebrow, Rule, useEditorialFonts,
} from "../Editorial";
import { rankFeed, isCooling, isExpired, hoursLeft } from "./echoSafety";
import {
  authorHash, hasReacted, markReacted, hasReported, markReported, forgetMine,
} from "./echoAnon";
import { REACTIONS, REPORT_AUTOHIDE_THRESHOLD, PHASE_COHORT } from "./echoConfig";

const REACTION_ICON = { held: HeartHandshake, metoo: Users };

function liveCohortLine(echoes, viewerPhase) {
  const n = echoes.filter((e) => viewerPhase && e.phase === viewerPhase).length;
  const cohort = PHASE_COHORT[viewerPhase] || PHASE_COHORT.unknown;
  if (n <= 0) return `Lines held across the cycle, this window.`;
  if (n === 1) return `One of ${cohort} left a line in this window.`;
  return `${n} of ${cohort} left a line in this window.`;
}

function fadeLabel(echo) {
  const h = hoursLeft(echo);
  if (h <= 1) return "fades within the hour";
  if (h < 24) return `fades in ${Math.round(h)}h`;
  return `fades in ${Math.round(h / 24)}d`;
}

export default function EchoWall({ user, profile, phase = null, lifeStage = null }) {
  useEditorialFonts();
  const [raw, setRaw] = useState([]);
  const [myHash, setMyHash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const viewerPhase = useMemo(() => {
    if (phase) return phase;
    try { return profile?.last_period_start_date ? computeCycleDay(profile).phase : null; } catch { return null; }
  }, [phase, profile]);

  const load = useCallback(async () => {
    try {
      const ah = await authorHash(user?.id).catch(() => null);
      setMyHash(ah);
      // Fetch recent, non-hidden echoes; live/cooling/expired is decided on-device.
      const rows = await base44.entities.Echo.filter({ hidden: false }, "-created_date", 200).catch(() => []);
      const list = Array.isArray(rows) ? rows : [];
      // Auto-unpost: clean up the viewer's OWN expired echoes.
      if (ah) {
        const mineExpired = list.filter((e) => e.author_hash === ah && isExpired(e));
        await Promise.all(mineExpired.map((e) =>
          base44.entities.Echo.delete(e.id).then(() => forgetMine(e.id)).catch(() => {})
        ));
      }
      setRaw(list);
    } catch (err) {
      console.error("Echo wall load failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const feed = useMemo(
    () => rankFeed(raw, { viewerPhase, viewerLifeStage: lifeStage }),
    [raw, viewerPhase, lifeStage]
  );
  const myCooling = useMemo(
    () => (myHash ? raw.filter((e) => e.author_hash === myHash && isCooling(e)) : []),
    [raw, myHash]
  );

  const handleReact = async (echo, kind, field) => {
    if (hasReacted(echo.id, kind)) return;
    markReacted(echo.id, kind);
    const next = (echo[field] || 0) + 1;
    setRaw((prev) => prev.map((e) => (e.id === echo.id ? { ...e, [field]: next } : e)));
    try { await base44.entities.Echo.update(echo.id, { [field]: next }); } catch (err) { console.error("React failed:", err); }
  };

  const handleReport = async (echo) => {
    if (hasReported(echo.id)) return;
    markReported(echo.id);
    const count = (echo.report_count || 0) + 1;
    const hide = count >= REPORT_AUTOHIDE_THRESHOLD;
    setRaw((prev) => (hide ? prev.filter((e) => e.id !== echo.id) : prev.map((e) => (e.id === echo.id ? { ...e, report_count: count } : e))));
    try { await base44.entities.Echo.update(echo.id, { report_count: count, hidden: hide }); } catch (err) { console.error("Report failed:", err); }
  };

  const handleRetract = async (echo) => {
    setRaw((prev) => prev.filter((e) => e.id !== echo.id));
    try { await base44.entities.Echo.delete(echo.id); forgetMine(echo.id); } catch (err) { console.error("Retract failed:", err); }
  };

  // ── loading ──
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(168,137,63,0.25)", borderTopColor: T.gold }} />
    </div>
  );

  // ── error ──
  if (error) return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <Eyebrow mb={8}>The Echo Wall</Eyebrow>
      <Hand size={20} color={T.inkSoft}>The wall couldn{"’"}t open just now. Check your connection and try again.</Hand>
    </div>
  );

  return (
    <div>
      <InkFilter />
      {/* Header */}
      <header style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Waves size={20} style={{ color: T.gold }} />
          <Script size={40} style={{ width: "auto" }}>The Echo Wall</Script>
        </div>
        <Hand size={19} color={T.inkSoft} style={{ marginTop: 6 }}>
          {liveCohortLine(feed, viewerPhase)}
        </Hand>
        <Hand size={16} color={T.muted} carve={false} style={{ marginTop: 4 }}>
          Anonymous. Held, never replied to. Each line fades in two days.
        </Hand>
        <Rule mt={16} />
      </header>

      {/* Your own cooling echoes — pull back before they go up */}
      {myCooling.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <Eyebrow mb={8}>Still cooling · only you can see these</Eyebrow>
          {myCooling.map((e) => (
            <div key={e.id} style={{ ...card, borderStyle: "dashed", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Clock size={15} style={{ color: T.gold, marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Hand size={20} color={T.ink} carve={false}>{"“"}{e.body}{"”"}</Hand>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>
                    goes up {new Date(e.live_at).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                  </span>
                  <button onClick={() => handleRetract(e)} style={pullBack}>
                    <Undo2 size={13} /> Pull it back
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Empty */}
      {feed.length === 0 && (
        <div style={{ textAlign: "center", padding: "44px 20px" }}>
          <Script size={32} style={{ marginBottom: 8 }}>Quiet, for now</Script>
          <Hand size={19} color={T.inkSoft}>
            No echoes in this window yet. If something is true for you, you can leave the first — from your Journal.
          </Hand>
        </div>
      )}

      {/* The feed */}
      {feed.map((e) => {
        const sister = viewerPhase && e.phase === viewerPhase;
        return (
          <div key={e.id} style={card}>
            <Hand size={23} color={T.ink} style={{ lineHeight: 1.42 }}>{"“"}{e.body}{"”"}</Hand>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {sister && (
                <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.gold, border: `1px solid ${T.gold}`, borderRadius: 999, padding: "2px 8px" }}>
                  your phase
                </span>
              )}
              <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.3 }}>{fadeLabel(e)}</span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                {REACTIONS.map((r) => {
                  const Icon = REACTION_ICON[r.id];
                  const reacted = hasReacted(e.id, r.id);
                  const count = e[r.field] || 0;
                  return (
                    <button key={r.id} onClick={() => handleReact(e, r.id, r.field)} disabled={reacted} style={{
                      display: "inline-flex", alignItems: "center", gap: 5, cursor: reacted ? "default" : "pointer",
                      background: reacted ? T.paperHi : "transparent", border: `1px solid ${reacted ? T.gold : T.paperDeep}`,
                      borderRadius: 999, padding: "4px 10px", fontFamily: UI, fontSize: 12, fontWeight: 600,
                      color: reacted ? T.ink : T.muted,
                    }}>
                      <Icon size={13} style={{ color: reacted ? T.gold : T.muted }} />
                      {r.label}{count > 0 ? ` ${count}` : ""}
                    </button>
                  );
                })}
                <button onClick={() => handleReport(e)} disabled={hasReported(e.id)} aria-label="Report this echo" style={{
                  background: "transparent", border: "none", cursor: hasReported(e.id) ? "default" : "pointer", padding: 4, opacity: hasReported(e.id) ? 0.4 : 1,
                }}>
                  <Flag size={13} style={{ color: T.muted }} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <p style={{ fontFamily: UI, fontSize: 11, color: T.muted, textAlign: "center", marginTop: 26, lineHeight: 1.6 }}>
        No handles, no threads, no replies. If a line worries you, the flag hides it from everyone.
      </p>
    </div>
  );
}

const card = {
  background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 3,
  padding: "16px 18px", marginBottom: 12,
};
const pullBack = {
  display: "inline-flex", alignItems: "center", gap: 5, background: "transparent",
  border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 10px", cursor: "pointer",
  fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.inkSoft,
};
