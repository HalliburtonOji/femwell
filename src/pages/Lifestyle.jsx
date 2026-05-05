import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getCyclePhase, getMoonPhase, loadLifestyleProfile, toggleSaveItem, hideItem } from "@/components/lifestyle/lifestyleHelpers";
import ForYouTab from "@/components/lifestyle/tabs/ForYouTab";
import WatchTab from "@/components/lifestyle/tabs/WatchTab";
import SavedTab from "@/components/lifestyle/tabs/SavedTab";
import SourcesTab from "@/components/lifestyle/tabs/SourcesTab";
import SmartFemwellTab from "@/components/lifestyle/SmartFemwellTab";

const TABS = [
  { id: "for-you", label: "For you" },
  { id: "watch",   label: "Watch" },
  { id: "saved",   label: "Saved" },
  { id: "sources", label: "Sources" },
  { id: "stories", label: "Stories" },
];

const PHASE_LABEL = {
  menstrual: "Menstrual", follicular: "Follicular", ovulatory: "Ovulatory", luteal: "Luteal",
};

export default function Lifestyle() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = TABS.some(t => t.id === tabParam) ? tabParam : "for-you";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabRefs = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [lp, ups] = await Promise.all([
          loadLifestyleProfile(u.id),
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        ]);
        setProfile(lp);
        setUserProfile(ups[0] || null);
      } catch (e) {
        // public access — still allow viewing without saves
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // URL ↔ state sync
  useEffect(() => {
    const next = searchParams.get("tab");
    if (next && next !== activeTab && TABS.some(t => t.id === next)) {
      setActiveTab(next);
    }
  }, [searchParams]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id }, { replace: true });
    // scroll active tab into view
    const el = tabRefs.current[id];
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const cycleInfo = useMemo(() => getCyclePhase(userProfile), [userProfile]);
  const phaseLine = useMemo(() => {
    if (cycleInfo) {
      return `Day ${cycleInfo.day} · ${PHASE_LABEL[cycleInfo.phase]} · ${getMoonPhase()}`;
    }
    return "however you're arriving today";
  }, [cycleInfo]);

  const handleSave = async (item) => {
    if (!profile) return;
    const next = await toggleSaveItem(profile, item);
    setProfile(next);
  };
  const handleHide = async (item) => {
    if (!profile) return;
    const next = await hideItem(profile, item);
    setProfile(next);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--cream, #f7f0e6)" }}>
      <style>{`.fw-no-scrollbar::-webkit-scrollbar{display:none}.fw-no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}`}</style>

      {/* Hero strip */}
      <div style={{ padding: "32px 20px 18px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 36,
          color: "var(--plum-deep)", letterSpacing: "-0.01em",
          lineHeight: 1.1, margin: 0,
        }}>
          Lifestyle, slowed down
        </h1>
        <p style={{
          fontFamily: "Inter, sans-serif", fontStyle: "italic", fontSize: 14,
          color: "var(--plum-mute)", margin: "6px 0 0",
        }}>
          {phaseLine}
        </p>
      </div>

      {/* Sticky tab strip */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: "rgba(247,240,230,0.96)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--ink-line)",
      }}>
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
          {/* Fade edges */}
          <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 24, background: "linear-gradient(to right, var(--cream), transparent)", pointerEvents: "none", zIndex: 1 }} />
          <div aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 24, background: "linear-gradient(to left, var(--cream), transparent)", pointerEvents: "none", zIndex: 1 }} />
          <div role="tablist" aria-label="Lifestyle sections"
            className="fw-no-scrollbar"
            style={{ display: "flex", gap: 6, overflowX: "auto", padding: "12px 20px" }}>
            {TABS.map(t => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  ref={el => { if (el) tabRefs.current[t.id] = el; }}
                  onClick={() => handleTabChange(t.id)}
                  style={{
                    flexShrink: 0,
                    padding: "8px 18px", borderRadius: 99,
                    border: "1px solid var(--ink-line)",
                    backgroundColor: active ? "var(--card)" : "transparent",
                    color: "var(--plum-deep)",
                    fontFamily: "Fraunces, serif", fontWeight: active ? 500 : 400,
                    fontSize: 15, cursor: "pointer", whiteSpace: "nowrap",
                    borderBottom: active ? "2px solid var(--rose)" : "1px solid var(--ink-line)",
                    transition: "background-color 0.18s ease",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 40px" }}>
        <div key={activeTab} style={{ animation: "fw-fade 180ms ease-out" }}>
          <style>{`@keyframes fw-fade { from { opacity: 0 } to { opacity: 1 } }`}</style>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--plum-mute)" }}>Loading…</div>
          ) : (
            <>
              {activeTab === "for-you" && profile && (
                <ForYouTab
                  profile={profile}
                  setProfile={setProfile}
                  onSave={handleSave}
                  onHide={handleHide}
                  currentPhase={cycleInfo?.phase}
                />
              )}
              {activeTab === "watch" && profile && (
                <WatchTab profile={profile} onSave={handleSave} onHide={handleHide} />
              )}
              {activeTab === "saved" && profile && (
                <SavedTab profile={profile} onSave={handleSave} onHide={handleHide} />
              )}
              {activeTab === "sources" && profile && (
                <SourcesTab profile={profile} setProfile={setProfile} />
              )}
              {activeTab === "stories" && (
                <SmartFemwellTab onRead={(item) => { window.location.href = `/LifestyleDetail?id=${item.id}`; }} />
              )}
              {!profile && activeTab !== "stories" && (
                <div style={{ textAlign: "center", padding: 48, color: "var(--plum-mute)" }}>
                  Sign in to personalise your feed.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}