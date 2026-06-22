import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  ChevronRight, Bell, Moon, Heart, Shield,
  Calendar, MapPin, Sparkles, Camera, Users,
  Check, AlertCircle, X, ArrowLeft,
  Activity, Bookmark, Ticket, CalendarDays, Stethoscope, Mail, Feather, Settings, LogOut, RefreshCw,
} from "lucide-react";
import ConditionHealthProfile from "../components/conditions/ConditionHealthProfile";
import ProfileDataModals from "../components/profile/ProfileDataModals";
import FirstLaunchStagePicker from "../components/planner/FirstLaunchStagePicker";
import { writeDevStageOverride } from "../components/planner/DevStageSwitcher";
// Brand v4 lush layer — §3 carved heart · §4 botanicals · §5.3 Profile char = blush/gold camellia ·
// §6.8 signature top · §6.10 Clipboard Stack Slider · §6.7.6 quick-action popup.
import { T, UI, SERIF, Script, Heart as BrandHeart, PAPER_BG } from "@/components/journal/Editorial";
import { VineMotifV2, FlowerGlyph, CardFrame, floraKeyframes, cwOf, Butterfly } from "@/components/brand/flora";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { SpeciesBloom } from "@/components/brand/floraLibrary";

// Friendly labels for the 12 supported life_stage enum values — used by the
// prominent "Your Femwell stage" tile to read the current stage.
const STAGE_LABEL = {
  none:             { label: "Not set",                hint: "Tap to choose how Femwell should shape itself for you." },
  teen:             { label: "Teen",                   hint: "Soft copy. Parent Bridge optional. No fertility content by default." },
  reproductive:     { label: "Reproductive years",     hint: "Standard menstrual cycle is the lens — phases, predictions, the full Planner." },
  "pre-ttc":        { label: "Pre-TTC",                hint: "Three months of better data before the TTC switch — folic acid, AMH conversations." },
  ttc:              { label: "Trying to conceive",     hint: "Cycle becomes a clinical tool. BBT, OPK, fertile-window confidence-honest." },
  "pregnant-t1":    { label: "Pregnant · Trimester I", hint: "Cycle tracking is paused. Trimester week ribbon takes over." },
  "pregnant-t2":    { label: "Pregnant · Trimester II",hint: "Cycle tracking is paused. 20-week anomaly scan is the landmark." },
  "pregnant-t3":    { label: "Pregnant · Trimester III",hint: "Cycle tracking is paused. Kick counter + birth plan from here on." },
  pregnancy:        { label: "Pregnant",               hint: "Cycle tracking is paused. Trimester ribbon is the frame." },
  postpartum:       { label: "Postpartum",             hint: "Period may not have returned — that's expected. Recovery is the frame." },
  perimenopause:    { label: "Perimenopause",          hint: "Symptom-pattern ribbon replaces phase prediction. HRT log appears on Patterns." },
  menopause:        { label: "Menopause",              hint: "Symptom-pattern frame. GSM screen + HRT log. No cycle prediction." },
  "post-menopause": { label: "Post-menopause",         hint: "Annual health rhythm — DEXA, smear, mammogram. No cycle frame." },
};

function getCyclePhase(lastPeriodDate, cycleLen = 28, periodLen = 5) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = new Date(lastPeriodDate);
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const cycleDay = (diff % cycleLen) + 1;
  let phase;
  if (cycleDay <= periodLen) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulatory';
  else phase = 'luteal';
  return { phase, day: cycleDay };
}
const PHASE_LABELS_P = { menstrual: 'Menstrual', follicular: 'Follicular', ovulatory: 'Ovulatory', luteal: 'Luteal' };

// ── §6.8 SIGNATURE TOP — the flora hero (Profile char = blush/gold camellia, §5.3) ──────────────────
// Holds the page-creature crown + identity (photo upload / name / email) + the live phase chips, so
// the whole "who you are" fold sits in one screen instead of a scroll of separate cards.
function ProfileHero({ user, profile, onPhoto, uploadingPhoto, cycleInfo, daysToNextPeriod, checkinStreak }) {
  const cw = cwOf("blush");
  return (
    <section style={{
      position: "relative", overflow: "hidden", borderRadius: 24, padding: "20px 20px 18px", marginBottom: 14,
      background: `linear-gradient(170deg, ${T.paperHi} 0%, ${cw.petal}1f 58%, ${T.gold}14 100%)`,
      border: `1px solid ${T.paperDeep}`, boxShadow: "0 6px 26px rgba(58,44,26,0.12)",
    }}>
      <CardFrame variant="sprig" color={T.blush} size={52} opacity={0.55} />
      <div aria-hidden style={{ position: "absolute", top: -4, right: 16, opacity: 0.9 }}>
        <Butterfly size={38} color={T.blush} color2={T.gold} idx="pf-bf" />
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* page-creature crown — camellia between two meaning-blooms */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 2 }}>
          <FlowerGlyph variant="lavender" size={24} color={cw.petal} color2={cw.tip} accent={cw.accent} idx="pf-l" />
          <SpeciesBloom name="camellia" size={70} />
          <FlowerGlyph variant="camellia" size={24} color={T.gold} idx="pf-r" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BrandHeart size={14} />
          <Script size={34} color={T.ink}>your profile</Script>
        </div>
        {/* identity row — photo upload preserved */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <label style={{ cursor: uploadingPhoto ? "wait" : "pointer", position: "relative", display: "inline-block" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: `2px solid ${cw.petal}`, background: T.paper, display: "grid", placeItems: "center" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 24, fontWeight: 700, color: T.ink }}>{user?.full_name?.[0]?.toUpperCase() || "?"}</span>}
            </div>
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: T.crimson, border: `2px solid ${T.paperHi}`, display: "grid", placeItems: "center" }}>
              <Camera style={{ width: 10, height: 10, color: "#fff" }} />
            </span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={onPhoto} disabled={uploadingPhoto} />
          </label>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: T.ink, margin: 0 }}>{user?.full_name || "You"}</p>
            <p style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "2px 0 0" }}>{user?.email}</p>
          </div>
        </div>
        {/* live phase chips (preserved) */}
        {cycleInfo && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, width: "100%" }}>
            {[
              { label: "Phase", value: PHASE_LABELS_P[cycleInfo.phase] || cycleInfo.phase },
              { label: "Cycle day", value: `Day ${cycleInfo.day}` },
              daysToNextPeriod != null ? { label: "Next period", value: `${daysToNextPeriod}d` } : { label: "Streak", value: `${checkinStreak}d` },
            ].map(c => (
              <div key={c.label} style={{ flex: 1, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "8px 6px", textAlign: "center" }}>
                <p style={{ fontFamily: UI, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: cw.accent, margin: 0 }}>{c.label}</p>
                <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: T.ink, margin: "2px 0 0" }}>{c.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── ONE summary card (§6.8) — at-a-glance stats + this-week dots in a single board ──────────────────
function ProfileSummary({ checkins, avgMood, checkinStreak }) {
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
  const set = new Set(checkins.map(c => c.date));
  const stats = [
    { label: "Check-ins", value: checkins.length },
    { label: "Avg mood", value: avgMood ? `${avgMood}/5` : "—" },
    { label: "Streak", value: `${checkinStreak}d` },
  ];
  return (
    <section style={{
      position: "relative", overflow: "hidden", borderRadius: 20, padding: "16px 18px 14px", marginBottom: 16,
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.sage}12 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, boxShadow: "0 4px 18px rgba(58,44,26,0.10)",
    }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {stats.map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: T.ink, margin: 0 }}>{s.value}</p>
            <p style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, margin: "2px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted }}>This week</span>
        {checkinStreak > 0 && <span style={{ fontFamily: UI, fontSize: 11, color: T.crimson, fontWeight: 700 }}>{checkinStreak}-day streak</span>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {last7.map(ds => {
          const has = set.has(ds);
          const lbl = new Date(ds + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3);
          return (
            <div key={ds} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: has ? T.sage : T.paper, border: has ? "none" : `1px solid ${T.paperDeep}` }} />
              <span style={{ fontFamily: UI, fontSize: 9, color: T.muted }}>{lbl}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── a compact action tile (lives inside a clipboard board) ──────────────────────────────────────────
function ProfileTile({ Icon, label, sub, value, accent = T.gold, onClick, danger, full }) {
  const c = danger ? T.crimson : accent;
  return (
    <button onClick={onClick} style={{
      gridColumn: full ? "1 / -1" : "auto",
      position: "relative", display: "flex", flexDirection: "column", gap: 5,
      textAlign: "left", width: "100%", minHeight: 78, padding: "12px 13px",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c}10 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`,
      borderRadius: 14, cursor: onClick ? "pointer" : "default",
      boxShadow: "0 1px 4px rgba(58,44,26,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: `${c}1c`, flexShrink: 0 }}>
          <Icon size={15} style={{ color: c }} />
        </span>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: c }}>{label}</span>
      </div>
      {value != null && <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.25 }}>{value}</span>}
      {sub && <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.35 }}>{sub}</span>}
    </button>
  );
}

// ── a STRIP card — a full-width settings/navigation row (the OTHER §6.7 card shape: not a box tile but
//    a clear, scannable list row). Mixed WITH the box tiles so the page reads open + laid-out, and so
//    important things (Settings, Cycle, Privacy…) are SURFACED as a visible list — never hidden behind a
//    "more" overlay. href → a real page; onClick → an in-page action/overlay. ────────────────────────
function ProfileStrip({ Icon, label, sub, accent = T.gold, href, onClick, value, danger }) {
  const c = danger ? T.crimson : accent;
  const inner = (
    <>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: `${c}1c`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={17} style={{ color: c }} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: danger ? T.crimson : T.ink, lineHeight: 1.25 }}>{label}</span>
        {sub && <span style={{ display: "block", fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>}
      </span>
      {value
        ? <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: c, flexShrink: 0 }}>{value}</span>
        : <ChevronRight size={17} style={{ color: T.muted, flexShrink: 0 }} />}
    </>
  );
  const style = {
    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
    padding: "13px 14px", marginBottom: 9, borderRadius: 14, cursor: "pointer", textDecoration: "none",
    background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c}0d 100%)`,
    border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`, boxShadow: "0 1px 4px rgba(58,44,26,0.06)",
  };
  if (href) return <a href={href} style={style}>{inner}</a>;
  return <button onClick={onClick} style={style}>{inner}</button>;
}

// ── a clearly-labelled SEGMENT header (script title + small caption) so the page reads as distinct
//    sections, not one undifferentiated list. ─────────────────────────────────────────────────────────
function SegmentHeader({ title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 9, margin: "22px 2px 11px" }}>
      <Script size={26} color={T.ink}>{title}</Script>
      {sub && <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{sub}</span>}
    </div>
  );
}

// ── §6.7.6 QUICK-ACTION POPUP — edit a single field in place without a full page ─────────────────────
function ProfileEditPopup({ cfg, onClose }) {
  const [val, setVal] = useState(cfg?.value ?? "");
  if (!cfg) return null;
  const arr = Array.isArray(val) ? val : [];
  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 130, background: "rgba(11,8,5,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} className="fw-sheet-safe"
        style={{ width: "100%", maxWidth: 440, background: T.paperHi, borderRadius: "22px 22px 0 0", border: `1px solid ${T.paperDeep}`, borderBottom: "none", padding: "18px", boxShadow: "0 -10px 40px rgba(58,44,26,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Script size={26} color={T.ink}>{cfg.title}</Script>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <X size={15} style={{ color: T.muted }} />
          </button>
        </div>
        {cfg.hint && <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "0 0 12px" }}>{cfg.hint}</p>}

        {(cfg.kind === "text" || cfg.kind === "date") && (
          <div style={{ display: "flex", gap: 8 }}>
            <input type={cfg.kind === "date" ? "date" : "text"} value={val} onChange={e => setVal(e.target.value)} placeholder={cfg.placeholder} autoFocus
              style={{ flex: 1, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px 13px", fontSize: 15, color: T.ink, background: T.paper, outline: "none" }} />
            <button onClick={() => { cfg.onSave(val); onClose(); }}
              style={{ background: T.ink, color: T.paperHi, borderRadius: 999, padding: "0 18px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>Save</button>
          </div>
        )}

        {cfg.kind === "chips" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {cfg.options.map(o => {
                const active = arr.includes(o.id);
                return (
                  <button key={o.id} onClick={() => setVal(active ? arr.filter(x => x !== o.id) : [...arr, o.id])}
                    style={{ borderRadius: 999, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "1.5px solid", textTransform: "capitalize",
                      background: active ? T.ink : "transparent", borderColor: active ? T.ink : T.paperDeep, color: active ? T.paperHi : T.muted }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { cfg.onSave(arr); onClose(); }}
              style={{ marginTop: 16, width: "100%", background: T.ink, color: T.paperHi, borderRadius: 999, padding: "11px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>Done</button>
          </>
        )}

        {cfg.kind === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {cfg.options.map(o => {
              const active = val === o.id;
              return (
                <button key={o.id} onClick={() => { cfg.onSave(o.id); onClose(); }}
                  style={{ textAlign: "left", borderRadius: 13, padding: "11px 12px", border: "1.5px solid", cursor: "pointer",
                    background: active ? T.ink : T.paper, borderColor: active ? T.ink : T.paperDeep, color: active ? T.paperHi : T.ink }}>
                  <span style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 700, display: "block" }}>{o.label}</span>
                  <span style={{ fontFamily: UI, fontSize: 10.5, opacity: 0.7, display: "block", marginTop: 2 }}>{o.desc}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── full-screen area overlay (Health & conditions / More areas) — back arrow, no nav loss ───────────
function ProfileAreaOverlay({ title, onClose, children }) {
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 125, ...PAPER_BG, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
        <button onClick={onClose} aria-label="Back" style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, display: "grid", placeItems: "center", cursor: "pointer" }}>
          <ArrowLeft size={17} style={{ color: T.ink }} />
        </button>
        <Script size={26} color={T.ink}>{title}</Script>
      </div>
      <div className="max-w-3xl mx-auto px-4 pb-28">{children}</div>
    </div>
  );
}

export default function ProfileClipboardDemo() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [saveToast, setSaveToast] = useState(null); // { ok, msg } — visible save confirmation / error
  const flash = (ok, msg) => { setSaveToast({ ok, msg }); setTimeout(() => setSaveToast(null), 2200); };
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showDataDeleteModal, setShowDataDeleteModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageToast, setStageToast] = useState(null);
  // Quick-edit popup config + the Health & conditions full-screen overlay.
  const [editing, setEditing] = useState(null);
  const [showCond, setShowCond] = useState(false);
  const handleLogout = async () => { try { await base44.auth.logout(); } catch { /* ignore */ } window.location.href = "/"; };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
      setProfile(p => ({ ...p, avatar_url: file_url }));
      flash(true, "Photo updated");
    } catch (_) { flash(false, "Couldn’t update photo — try again."); }
    setUploadingPhoto(false);
  };

  const saveProfileField = async (field, value) => {
    if (!profile) return;
    try {
      await base44.entities.UserProfile.update(profile.id, { [field]: value });
      setProfile(p => ({ ...p, [field]: value }));
      flash(true, "Saved");
    } catch (_) {
      flash(false, "Couldn’t save — try again.");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, prefs, allCheckins] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.UserPreferences.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }).catch(() => []),
        ]);
        if (profiles[0]) setProfile(profiles[0]);
        if (prefs[0]) setPreferences(prefs[0]);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffStr = cutoff.toISOString().split("T")[0];
        setCheckins(allCheckins.filter(c => c.date >= cutoffStr));
      } catch (err) {
        console.error("Profile page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateTone = async (tone) => {
    if (!profile) return;
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { tone_preference: tone });
      setProfile((p) => ({ ...p, tone_preference: tone }));
      if (preferences) {
        await base44.entities.UserPreferences.update(preferences.id, { coach_tone: tone });
        setPreferences((current) => ({ ...current, coach_tone: tone }));
      }
      flash(true, "Saved");
    } catch (err) {
      console.error("Tone update failed:", err);
      flash(false, "Couldn’t save tone — try again.");
    } finally {
      setSaving(false);
    }
  };

  const tones = [
    { id: "warm",         label: "Warm",         desc: "Nurturing and encouraging" },
    { id: "clinical",     label: "Clinical",      desc: "Factual and precise" },
    { id: "motivational", label: "Motivational",  desc: "Energising and positive" },
    { id: "gentle",       label: "Gentle",        desc: "Soft and reassuring" },
    { id: "straight",     label: "Straight talk", desc: "Direct and no-nonsense" },
    { id: "minimal",      label: "Minimal",       desc: "Short, calm, to the point" },
  ];

  const ALL_GOALS = ["calm", "sleep", "energy", "fitness", "nutrition", "hormone_support", "relationships", "confidence", "mindfulness", "cycle_awareness", "stress_reduction", "better_sleep"];

  const currentTone = tones.find((t) => t.id === (preferences?.coach_tone || profile?.tone_preference)) || tones[0];

  const cycleInfo = profile?.last_period_start_date
    ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
    : null;

  const checkinStreak = (() => {
    if (!checkins.length) return 0;
    let count = 0;
    const dates = new Set(checkins.map(c => c.date));
    const d = new Date();
    while (count <= 365) {
      if (!dates.has(d.toISOString().split('T')[0])) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const avgMood = (() => {
    const moodLogs = checkins.filter(c => c.mood);
    if (!moodLogs.length) return null;
    return Math.round(moodLogs.reduce((s, c) => s + c.mood, 0) / moodLogs.length * 10) / 10;
  })();

  const daysToNextPeriod = (() => {
    if (!profile?.last_period_start_date || !profile?.cycle_avg_length) return null;
    const lastPeriod = new Date(profile.last_period_start_date);
    const today = new Date();
    const daysSince = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    return profile.cycle_avg_length - (daysSince % profile.cycle_avg_length);
  })();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ ...PAPER_BG }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: `${T.blush}66`, borderTopColor: T.blush }} />
    </div>
  );

  const stageKey = profile?.life_stage || "none";
  const stage = STAGE_LABEL[stageKey] || STAGE_LABEL.none;
  const fmtBirthday = profile?.birthday
    ? new Date(profile.birthday + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : "Not set";

  // ── quick-edit popup configs (§6.7.6) ──
  const openAssistant = () => setEditing({ title: "Assistant name", kind: "text", value: profile?.ai_assistant_name || "", placeholder: "e.g. Luna, Sage, Guide…", hint: "How you'd like to call your AI guide.", onSave: (v) => saveProfileField("ai_assistant_name", v) });
  const openBirthday  = () => setEditing({ title: "Birthday", kind: "date", value: profile?.birthday || "", hint: "Used for cycle insights and personalisation.", onSave: (v) => saveProfileField("birthday", v) });
  const openCity      = () => setEditing({ title: "Your city", kind: "text", value: profile?.location_city || "", placeholder: "e.g. London, Manchester…", hint: "For local events and recommendations.", onSave: (v) => saveProfileField("location_city", v) });
  const openGoals     = () => setEditing({ title: "Your goals", kind: "chips", value: profile?.goals || [], options: ALL_GOALS.map(g => ({ id: g, label: g.replace(/_/g, " ") })), hint: "What you'd love Femwell to help you move toward.", onSave: (arr) => saveProfileField("goals", arr) });
  const openTone      = () => setEditing({ title: "Guidance tone", kind: "grid", value: preferences?.coach_tone || profile?.tone_preference || "warm", options: tones, hint: "How Jess and your cards should speak to you.", onSave: (id) => updateTone(id) });

  const toggleAnon = async () => {
    if (!profile) return;
    const next = !profile.anonymous_mode;
    try {
      await base44.entities.UserProfile.update(profile.id, { anonymous_mode: next });
      setProfile(p => ({ ...p, anonymous_mode: next }));
      flash(true, next ? "Anonymous mode on" : "Anonymous mode off");
    } catch (_) { flash(false, "Couldn’t save — try again."); }
  };

  return (
    <div className="min-h-screen pb-28" style={{ ...PAPER_BG, position: "relative", overflowX: "clip" }}>
      {/* botanical page texture — blush/gold vines (§5.3 Profile char), hairline + low-opacity */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <style>{floraKeyframes}</style>
        <div style={{ position: "absolute", top: 180, right: -26 }}><VineMotifV2 color={T.blush} color2={T.gold} opacity={0.12} w={146} /></div>
        <div style={{ position: "absolute", top: 720, left: -28 }}><VineMotifV2 color={T.gold} color2={T.blush} opacity={0.09} w={138} flip /></div>
      </div>

      {/* save toast */}
      {saveToast && (
        <div role="status" style={{
          position: "fixed", left: "50%", bottom: 90, transform: "translateX(-50%)", zIndex: 140,
          display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9999,
          fontSize: 13, fontWeight: 700, color: T.paperHi,
          background: saveToast.ok ? T.ink : "#A84E56", boxShadow: "0 6px 20px rgba(58,44,26,0.28)",
        }}>
          {saveToast.ok ? <Check size={14} /> : <AlertCircle size={14} />} {saveToast.msg}
        </div>
      )}

      <div className="max-w-md mx-auto px-4" style={{ position: "relative", zIndex: 1, paddingTop: 28 }}>
        {/* §6.8 signature top */}
        <ProfileHero
          user={user} profile={profile} onPhoto={handlePhotoUpload} uploadingPhoto={uploadingPhoto}
          cycleInfo={cycleInfo} daysToNextPeriod={daysToNextPeriod} checkinStreak={checkinStreak}
        />
        <ProfileSummary checkins={checkins} avgMood={avgMood} checkinStreak={checkinStreak} />

        {/* PERSONALISE — BOX tiles in a §6.10 clipboard slider (You · Account); each opens a §6.7.6 quick-edit popup */}
        <ClipboardSlider hint="Slide → account" accent={T.gold}>
          {/* Board 1 — You */}
          <Clipboard title="You" sub="Identity & how Femwell speaks to you" accent={T.gold} flower="camellia" idx="cb-you">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <ProfileTile full Icon={Moon} label="Your Femwell stage" value={stage.label} sub={stage.hint} accent={T.gold} onClick={() => setShowStageModal(true)} />
              <ProfileTile Icon={Sparkles} label="Assistant" value={profile?.ai_assistant_name || "Guide"} accent={T.gold} onClick={openAssistant} />
              <ProfileTile Icon={Heart} label="Tone" value={currentTone.label} accent={T.crimson} onClick={openTone} />
              <ProfileTile Icon={Calendar} label="Birthday" value={fmtBirthday} accent={T.sage} onClick={openBirthday} />
              <ProfileTile Icon={MapPin} label="City" value={profile?.location_city || "Not set"} accent={T.blush} onClick={openCity} />
              <ProfileTile full Icon={Check} label="Goals" value={(profile?.goals || []).length ? `${(profile?.goals || []).length} set` : "None yet"} sub={(profile?.goals || []).slice(0, 3).map(g => g.replace(/_/g, " ")).join(" · ") || "Tap to choose what matters"} accent={T.gold} onClick={openGoals} />
            </div>
          </Clipboard>

          {/* Board 2 — Account & data */}
          <Clipboard title="Account" sub="Your plan, privacy and your data" accent={T.sage} flower="rose" idx="cb-acct">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <ProfileTile full Icon={Sparkles} label="Plan" value={profile?.plan ? `${profile.plan} Plan` : "Free Plan"} sub="Tap to see what's in the upgrade" accent={T.gold} onClick={() => navigate(createPageUrl("Upgrade"))} />
              <ProfileTile Icon={Shield} label="Anonymous mode" value={profile?.anonymous_mode ? "On" : "Off"} sub="Not linked to analytics" accent={T.sage} onClick={toggleAnon} />
              <ProfileTile Icon={ChevronRight} label="Data export" value="Download" sub={`${checkins.length} check-ins stored`} accent={T.blush} onClick={() => setShowDataExportModal(true)} />
              <ProfileTile full danger Icon={Shield} label="Delete my data" value="Request permanent deletion" accent={T.crimson} onClick={() => setShowDataDeleteModal(true)} />
            </div>
          </Clipboard>
        </ClipboardSlider>

        {/* SURFACED — clearly-segmented STRIP rows. Halli's note: important things (Settings…) must NOT be
            hidden behind a "more" overlay. They now live as a visible, scannable list; Settings is the first
            row of its own segment. STRIP cards (full-width rows) mixed with the BOX tiles above. */}
        <SegmentHeader title="Settings" sub="nothing buried" />
        <ProfileStrip Icon={Settings} label="Settings" sub="All app settings & preferences" accent={T.gold} href={createPageUrl("Settings")} />
        <ProfileStrip Icon={Moon} label="Cycle settings" sub={profile?.cycle_avg_length ? `${profile.cycle_avg_length}-day cycle` : "Set up your cycle"} accent={T.crimson} href={createPageUrl("CycleSettings")} />
        <ProfileStrip Icon={Bell} label="Reminders & notifications" sub="Check-in & session alerts" accent={T.gold} href={`${createPageUrl("Settings")}?section=notifications`} />
        <ProfileStrip Icon={Shield} label="Health & conditions" sub="Stage, conditions & flags" accent={T.sage} onClick={() => setShowCond(true)} />
        <ProfileStrip Icon={RefreshCw} label="Redo onboarding" sub="Run the setup again" accent={T.muted} href="/Onboarding?mode=redo" />

        <SegmentHeader title="Health & cycle" sub="your body, tracked" />
        <ProfileStrip Icon={Activity} label="Pulse" sub="Weekly summaries & pattern charts" accent="#8E6E8E" href={createPageUrl("Pulse")} />
        <ProfileStrip Icon={Feather} label="Skin & Hair" sub="Phase patterns, breakouts & shedding" accent={T.blush} href={createPageUrl("SkinHair")} />
        <ProfileStrip Icon={Stethoscope} label="Doctor export" sub="A clinician-ready summary of your data" accent={T.sage} href={createPageUrl("DoctorExport")} />
        <ProfileStrip Icon={Heart} label="Pregnancy & Menopause support" sub="Daily tracking, setup & guidance" accent={T.crimson} href={createPageUrl("LifeStageCare")} />
        <ProfileStrip Icon={Users} label="Partner settings" sub="Share what you choose, with whom" accent={T.gold} href={createPageUrl("PartnerSettings")} />

        <SegmentHeader title="Your spaces" sub="rooms & saved things" />
        <ProfileStrip Icon={Users} label="Community" sub="Anonymous, 18+ — a room everyone's in" accent={T.blush} href={createPageUrl("Community")} />
        <ProfileStrip Icon={Bookmark} label="Saved" sub="Advice, content & programs you kept" accent={T.gold} href={createPageUrl("Saved")} />
        <ProfileStrip Icon={Mail} label="Sealed letters" sub="Notes to your future self" accent={T.crimson} href={createPageUrl("SealedLetters")} />
        <ProfileStrip Icon={Ticket} label="Deals" sub="Coupon codes & offers" accent={T.gold} href={createPageUrl("Deals")} />
        <ProfileStrip Icon={CalendarDays} label="Events" sub="Free & paid listings near you" accent={T.sage} href={createPageUrl("Events")} />

        <SegmentHeader title="Account" />
        <ProfileStrip Icon={LogOut} label="Sign out" sub="See you soon" danger onClick={handleLogout} />
        <div style={{ display: "flex", gap: 14, justifyContent: "center", margin: "12px 0 4px", fontFamily: UI, fontSize: 12, fontWeight: 600 }}>
          <a href="/terms" style={{ color: T.muted, textDecoration: "none" }}>Terms</a>
          <span style={{ color: T.paperDeep }}>·</span>
          <a href="/privacy" style={{ color: T.muted, textDecoration: "none" }}>Privacy</a>
        </div>
      </div>

      {/* ── preserved flows ── */}

      {/* Stage edit modal — the 11-stage picker (edit mode) */}
      {showStageModal && profile && (
        <FirstLaunchStagePicker
          profile={profile}
          editMode
          onSaved={(s) => {
            setProfile((p) => p ? { ...p, life_stage: s } : p);
            try { writeDevStageOverride(s); } catch { /* silent */ }
            try { window.dispatchEvent(new Event("femwell:profile-updated")); } catch { /* silent */ }
            setShowStageModal(false);
            setStageToast("Stage updated — your planner will refresh");
            window.setTimeout(() => setStageToast(null), 3500);
          }}
          onSkip={() => setShowStageModal(false)}
        />
      )}
      {stageToast && (
        <div role="status" style={{
          position: "fixed", left: "50%", bottom: 130, transform: "translateX(-50%)", zIndex: 140,
          padding: "8px 14px", background: "rgba(143,175,143,0.95)", borderRadius: 9999,
          fontSize: 12, fontWeight: 700, color: T.ink, boxShadow: "0 6px 20px rgba(58,44,26,0.22)",
        }}>{stageToast}</div>
      )}

      {/* Health & conditions overlay (also the #profile-stage-picker anchor) */}
      {showCond && profile && (
        <ProfileAreaOverlay title="Health & conditions" onClose={() => setShowCond(false)}>
          <div id="profile-stage-picker" style={{ paddingTop: 14 }}>
            <ConditionHealthProfile
              profile={profile}
              onProfileUpdate={(updates) => setProfile(p => ({ ...p, ...updates }))}
            />
          </div>
        </ProfileAreaOverlay>
      )}

      {/* quick-edit popup */}
      {editing && <ProfileEditPopup cfg={editing} onClose={() => setEditing(null)} />}

      {/* preserved data export / delete modals */}
      <ProfileDataModals
        showExport={showDataExportModal}
        showDelete={showDataDeleteModal}
        onCloseExport={() => setShowDataExportModal(false)}
        onCloseDelete={() => setShowDataDeleteModal(false)}
      />

      {/* saving sentinel kept for tone round-trip (no UI; prevents double-submit) */}
      {saving && <span style={{ display: "none" }} aria-hidden />}
    </div>
  );
}
