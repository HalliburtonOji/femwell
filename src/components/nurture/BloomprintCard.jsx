// BloomprintCard — her PERSONAL FLORA IDENTITY, shown on her own pages (Profile · Garden).
// Self-contained: loads its own data (companion + milestones + chapters + tier) so a surface
// only drops it in. Shows her SIGNATURE (her flower × her fingerprint colourway, carrying a
// meaning), her earned shelf (rare blooms + seasons kept), and the 3-tier disclosure control
// that persists via the existing meadow opt-in (CompanionShare) — veiled by default. NO new
// entity. Reversible + additive; nothing private ever shown.
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { T, SERIF, UI, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { RichBloomV2, cwOf } from "@/components/brand/flora";
import { Star, Sprout, EyeOff, Flower2, User as UserIcon } from "lucide-react";
import { getCompanion, loadCompanionState } from "@/components/nurture/companion";
import { bloomprintSignature, TIER_LABEL, TIER_SUB } from "@/components/nurture/bloomprint";
import { localMilestones, loadMilestones } from "@/components/nurture/milestones";
import { loadGardenChapters, currentChapterKey, seasonOf } from "@/components/nurture/garden";
import { isShared, isNameShared, optIntoSharedGarden, optOutOfSharedGarden } from "@/components/nurture/companionShare";

const SCRIPT = '"Ephesis","Pinyon Script",cursive';
// RichBloomV2 renders lush heads; map the 2 companion forms it doesn't support (keeps meaning).
const LUSH = { foxglove: "cosmos", fern: "camellia" };
const lush = (k) => LUSH[k] || k || "peony";

export default function BloomprintCard({ userId: userIdProp = null }) {
  const [userId, setUserId] = useState(userIdProp);
  const [companion, setCompanion] = useState(null);
  const [rareCount, setRareCount] = useState(0);
  const [seasons, setSeasons] = useState(0);
  const [tier, setTier] = useState(() => (isShared() ? (isNameShared() ? "named" : "my-flower") : "veiled"));

  useEffect(() => {
    let alive = true;
    (async () => {
      let id = userIdProp;
      if (!id) { const me = await base44.entities.User.me().catch(() => null); id = me?.id || null; }
      if (!id || !alive) return;
      setUserId(id);
      await loadCompanionState(id).catch(() => {});
      if (!alive) return;
      setCompanion(getCompanion(id));
      setRareCount((localMilestones(id) || []).length);
      loadMilestones(id).then(() => { if (alive) setRareCount((localMilestones(id) || []).length); }).catch(() => {});
      loadGardenChapters(id).then((ch) => { if (alive) setSeasons((ch || []).filter(Boolean).length); }).catch(() => {});
    })();
    return () => { alive = false; };
  }, [userIdProp]);

  const sig = bloomprintSignature(userId);
  const cw = sig.cw;
  const name = companion?.name || sig.name || `${cw.label} ${sig.formName}`;

  const setTierP = (t) => {
    setTier(t);
    const snap = { form_key: sig.form, stage_key: "blooming", accent: companion?.accent || cw.petal, season: seasonOf(currentChapterKey()), display_name: companion?.name || "" };
    if (t === "veiled") optOutOfSharedGarden(userId);
    else optIntoSharedGarden(userId, snap, t === "named");
  };

  return (
    <div style={{ background: `linear-gradient(165deg, ${T.paperHi} 0%, ${cw.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${cw.petal}`, borderRadius: 18, padding: "16px 15px", boxShadow: "0 4px 20px rgba(58,44,26,.09), 0 1px 4px rgba(58,44,26,.05)", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ position: "relative", width: 84, height: 84, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, background: `radial-gradient(circle, ${cw.petal}22 0%, ${cw.petal}0C 55%, transparent 72%)`, border: `1px solid ${cw.petal}55` }}>
          <RichBloomV2 form={lush(sig.form)} color={cw.petal} color2={cw.tip} accent={cw.accent} size={76} soft={false} headOnly animate openness={0.95} idx="bpcard" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: cw.petal, display: "flex", alignItems: "center", gap: 6 }}><Heart size={11} /> Your Bloomprint</div>
          <div style={{ fontFamily: SCRIPT, fontSize: 34, lineHeight: 1.05, color: OXBLOOD, margin: "1px 0 1px" }}>{name}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, lineHeight: 1.35 }}>{sig.formName} · {cw.label.toLowerCase()} for <b style={{ color: cw.accent, fontStyle: "normal" }}>{cw.meaning}</b></div>
          <div style={{ display: "flex", gap: 14, marginTop: 7 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}><Star size={13} color={T.gold} fill={T.gold} /> {rareCount} rare {rareCount === 1 ? "bloom" : "blooms"}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft }}><Sprout size={13} color={T.sage} /> {seasons} {seasons === 1 ? "season" : "seasons"} kept</span>
          </div>
        </div>
      </div>

      {/* 3-tier disclosure control — veiled by default; persists via the meadow opt-in */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", gap: 7 }}>
          {[
            { k: "veiled", Icon: EyeOff },
            { k: "my-flower", Icon: Flower2 },
            { k: "named", Icon: UserIcon },
          ].map((t) => {
            const on = tier === t.k;
            return (
              <button key={t.k} onClick={() => setTierP(t.k)} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 6px", borderRadius: 12, cursor: "pointer", background: on ? `${cw.petal}1A` : T.paperHi, border: `1px solid ${on ? cw.petal : T.paperDeep}`, boxShadow: on ? `0 0 0 1px ${cw.petal}` : "none", fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? cw.petal : T.muted }}>
                <t.Icon size={13} /> {TIER_LABEL[t.k]}
              </button>
            );
          })}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4, marginTop: 8 }}>{TIER_SUB[tier]}</div>
      </div>
    </div>
  );
}
