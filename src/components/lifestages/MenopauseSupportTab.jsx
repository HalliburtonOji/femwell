import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "./SupportMetricSlider";
import SupportInsightCard from "./SupportInsightCard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SymptomDiarySection from "./SymptomDiarySection";
import MenopauseReportCard from "./MenopauseReportCard";
import HotFlashTracker from "./HotFlashTracker";
// Sprint 9 — clinical MRS questionnaire + HRT today card.
import MenopauseRatingScale from "../lifeStage/MenopauseRatingScale";
import HrtTodayCard from "../lifeStage/HrtTodayCard";

const FOCUSES = ["Sleep", "Hot flashes", "Mood", "Energy", "Brain fog", "Joint comfort", "Weight balance", "Libido", "Vaginal health", "Bone health"];
const todayStr = new Date().toISOString().split("T")[0];
const inp = { width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" };
const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };

const STAGE_INFO = {
  perimenopause: {
    label: "Perimenopause", color: "#C4849A", bg: "#F5ECF0",
    description: "Hormones are beginning to fluctuate. Periods may become irregular. Symptoms can come and go.",
    avg_duration: "4–10 years",
  },
  menopause: {
    label: "Menopause", color: "#B89E6A", bg: "#F5F0E6",
    description: "Defined as 12 consecutive months without a period. Average age 51. Oestrogen has dropped significantly.",
    avg_duration: "A single moment in time",
  },
  postmenopause: {
    label: "Postmenopause", color: "#7A9E8E", bg: "#EBF2EF",
    description: "The years after menopause. Many symptoms ease, but bone density and heart health need attention.",
    avg_duration: "Remainder of life",
  },
};

const NUTRITION_BY_STAGE = {
  perimenopause: [
    "Phytoestrogens (flaxseed, soy, tofu) may ease symptoms",
    "Calcium 1000mg/day — dairy, leafy greens, fortified foods",
    "Magnesium for mood, sleep, and muscle function",
    "Reduce alcohol and caffeine — they worsen hot flashes",
    "Iron still important if periods are heavy",
    "Omega-3 fats (salmon, walnuts) for mood and joints",
  ],
  menopause: [
    "Calcium 1200mg/day — essential for bone density",
    "Vitamin D3 800–1000 IU/day with K2",
    "Protein 1.2g/kg/day to preserve muscle mass",
    "Reduce refined sugar — impacts energy and weight",
    "Phytoestrogens daily (soy, lentils, sesame seeds)",
    "Hydrate more — skin and mucosal membranes dry out",
  ],
  postmenopause: [
    "Calcium 1200mg/day remains critical lifelong",
    "Collagen peptides for skin, joints, and bone",
    "Higher protein intake to prevent muscle loss (sarcopenia)",
    "Mediterranean diet pattern — heart and brain protective",
    "Anti-inflammatory foods: berries, olive oil, turmeric",
    "Limit sodium to protect bone density",
  ],
};

const LIFESTYLE_TIPS = {
  perimenopause: [
    { title: "Strength training", body: "Weight-bearing exercise 2–3x/week helps maintain bone density as oestrogen drops. Even 20-min sessions make a measurable difference." },
    { title: "Sleep hygiene", body: "Keep room temperature 16–18°C. Avoid alcohol within 3 hours of sleep. A cooling mattress topper can help with night sweats." },
    { title: "Stress management", body: "Cortisol amplifies hot flashes and disrupts sleep. Yoga, breathwork, and short walks in nature are evidence-backed." },
  ],
  menopause: [
    { title: "HRT conversation", body: "Modern HRT is considered safe for most healthy women and significantly improves quality of life. Speak to your GP about current options." },
    { title: "Pelvic floor", body: "Oestrogen loss weakens pelvic floor tissues. Daily Kegel exercises reduce leakage and improve vaginal comfort. A pelvic physio can help." },
    { title: "Bone health", body: "DEXA scan recommended at menopause. Weight-bearing exercise, calcium, Vitamin D, and avoiding smoking protect bones." },
  ],
  postmenopause: [
    { title: "Cardiovascular health", body: "Heart disease risk increases after menopause. Regular aerobic exercise (150 mins/week), Mediterranean diet, and not smoking are the biggest protectors." },
    { title: "Cognitive health", body: "Mental stimulation, social connection, sleep, and physical activity are evidence-based protectors against cognitive decline." },
    { title: "Vaginal health", body: "Vaginal atrophy is very common and highly treatable. Topical oestrogen (low dose, very safe) or moisturisers work well — speak to your GP." },
  ],
};

const COMMON_SYMPTOMS_INFO = [
  { symptom: "Hot flashes", tips: "Cool room, layered clothing, cold water spray. Avoid triggers: spicy food, alcohol, stress, caffeine. Black cohosh and phytoestrogens may help." },
  { symptom: "Night sweats", tips: "Cotton or bamboo sheets, cooler room, avoid alcohol before bed. HRT is the most effective treatment." },
  { symptom: "Brain fog", tips: "Omega-3s, quality sleep, aerobic exercise, and reducing alcohol all support cognitive clarity. Stress management is key." },
  { symptom: "Joint pain", tips: "Anti-inflammatory diet, omega-3s, turmeric, and movement. Swimming and yoga are gentle on joints. Low-dose oestrogen can help." },
  { symptom: "Mood changes", tips: "Regular exercise is as effective as antidepressants for mild-moderate mood changes. Therapy, social support, and omega-3s help too." },
  { symptom: "Low libido", tips: "Common due to oestrogen and testosterone drops. Vaginal dryness can be treated. Testosterone therapy is available. DHEA is an option." },
];

function SymptomInfo() {
  const [open, setOpen] = useState(null);
  return (
    <div style={card}>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 12 }}>Symptom guide</p>
      {COMMON_SYMPTOMS_INFO.map(({ symptom, tips }) => (
        <div key={symptom} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <button onClick={() => setOpen(open === symptom ? null : symptom)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)" }}>{symptom}</span>
            <span style={{ fontSize: 18, color: "var(--mauve)" }}>{open === symptom ? "−" : "+"}</span>
          </button>
          {open === symptom && (
            <p style={{ fontSize: 12, color: "var(--mauve)", lineHeight: 1.7, paddingBottom: 10 }}>{tips}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function PatternChart({ logs }) {
  if (logs.length < 3) return null;
  const last14 = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).reverse();
  const metrics = [
    { key: "hot_flashes", label: "Hot flashes", color: "#f43f5e" },
    { key: "sleep_quality", label: "Sleep", color: "#6366f1" },
    { key: "energy", label: "Energy", color: "#f59e0b" },
    { key: "mood", label: "Mood", color: "#10b981" },
  ];
  return (
    <div style={card}>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 14 }}>14-day symptom pattern</p>
      {metrics.map(({ key, label, color }) => {
        const values = last14.map(l => l[key] || 0);
        const max = 5;
        return (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)" }}>{label}</span>
              <span style={{ fontSize: 11, color: "var(--mauve)" }}>avg {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}/5</span>
            </div>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 32 }}>
              {values.map((v, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: color, borderRadius: 3, opacity: 0.7 + (v / max) * 0.3, height: `${(v / max) * 100}%`, minHeight: 2, transition: "height 0.3s" }} title={`${format(parseISO(last14[i].date), "MMM d")}: ${v}`} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MenopauseSupportTab({ user, profile, setProfile, logs, setLogs }) {
  const [profileForm, setProfileForm] = useState({ stage: "perimenopause", care_focus: [], cycle_changes: "", current_supports: "", notes: "" });
  const [logForm, setLogForm] = useState({ date: todayStr, hot_flashes: 1, night_sweats: 1, sleep_quality: 3, mood: 3, energy: 3, brain_fog: 1, joint_pain: 1, vaginal_dryness: 1, libido: 3, notes: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (profile) setProfileForm({ stage: profile.stage || "perimenopause", care_focus: profile.care_focus || [], cycle_changes: profile.cycle_changes || "", current_supports: profile.current_supports || "", notes: profile.notes || "" });
  }, [profile]);

  useEffect(() => {
    const todayLog = logs.find(l => l.date === todayStr);
    if (todayLog) setLogForm({ date: todayStr, hot_flashes: todayLog.hot_flashes || 1, night_sweats: todayLog.night_sweats || 1, sleep_quality: todayLog.sleep_quality || 3, mood: todayLog.mood || 3, energy: todayLog.energy || 3, brain_fog: todayLog.brain_fog || 1, joint_pain: todayLog.joint_pain || 1, vaginal_dryness: todayLog.vaginal_dryness || 1, libido: todayLog.libido || 3, notes: todayLog.notes || "" });
  }, [logs]);

  const toggleFocus = (v) => setProfileForm(c => ({ ...c, care_focus: c.care_focus.includes(v) ? c.care_focus.filter(i => i !== v) : [...c.care_focus, v] }));

  const saveProfile = async () => {
    setSavingProfile(true);
    const payload = { user_id: user.id, stage: profileForm.stage, care_focus: profileForm.care_focus, cycle_changes: profileForm.cycle_changes || undefined, current_supports: profileForm.current_supports || undefined, notes: profileForm.notes || undefined };
    const saved = profile ? await base44.entities.MenopauseProfile.update(profile.id, payload) : await base44.entities.MenopauseProfile.create(payload);
    setProfile(saved);
    toast.success("Menopause setup saved");
    setSavingProfile(false);
  };

  const saveTodayLog = async () => {
    setSavingLog(true);
    const todayLog = logs.find(l => l.date === todayStr);
    const payload = { user_id: user.id, ...logForm };
    const saved = todayLog ? await base44.entities.MenopauseDailyLog.update(todayLog.id, payload) : await base44.entities.MenopauseDailyLog.create(payload);
    setLogs([saved, ...logs.filter(l => l.id !== saved.id)].sort((a, b) => b.date.localeCompare(a.date)));
    toast.success("Today's log saved");
    setSavingLog(false);
  };

  const getAiInsight = async () => {
    setLoadingAi(true);
    const recent = logs.slice(0, 7);
    const avgHotFlashes = recent.length ? (recent.reduce((a, l) => a + (l.hot_flashes || 0), 0) / recent.length).toFixed(1) : "unknown";
    const avgSleep = recent.length ? (recent.reduce((a, l) => a + (l.sleep_quality || 0), 0) / recent.length).toFixed(1) : "unknown";
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `I'm in ${profile?.stage || "perimenopause"} and my recent symptoms over 7 days show: hot flashes avg ${avgHotFlashes}/5, sleep quality avg ${avgSleep}/5. My care focus is: ${profile?.care_focus?.join(", ") || "general support"}. Give me 3 personalised, warm, practical tips tailored to my current patterns. Be specific — not generic. No medical claims, say "may help" etc. 3 short paragraphs.`,
      });
      setAiInsight(res);
    } catch {}
    setLoadingAi(false);
  };

  const stageInfo = STAGE_INFO[profile?.stage || "perimenopause"];
  const nutritionTips = NUTRITION_BY_STAGE[profile?.stage || "perimenopause"];
  const lifestyleTips = LIFESTYLE_TIPS[profile?.stage || "perimenopause"];

  const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "hotflash", label: "Hot flashes" },
    { id: "checkin", label: "Daily log" },
    { id: "diary", label: "Symptom diary" },
    { id: "report", label: "Weekly report" },
    { id: "patterns", label: "Patterns" },
    { id: "nutrition", label: "Nutrition" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "symptoms", label: "Symptom guide" },
    { id: "setup", label: "Setup" },
  ];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div style={{ backgroundColor: stageInfo.bg, border: `1px solid ${stageInfo.color}30`, borderRadius: 16, padding: "16px 20px" }}>
        <p style={{ fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: stageInfo.color, marginBottom: 4, }}>Your stage</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", }}>{stageInfo.label}</p>
        <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: 4, lineHeight: 1.6 }}>{stageInfo.description}</p>
      </div>

      {/* Sprint 9 — HRT today (above the AI tips) + MRS monthly
          check-in card. Visible for every peri/meno/post-meno user
          who lands on this tab. */}
      <HrtTodayCard user={user} profile={profile} />
      <MenopauseRatingScale user={user} profile={profile} />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Focus areas", value: `${profile?.care_focus?.length || 0}`, color: stageInfo.color },
          { label: "Logs tracked", value: `${logs.length}`, color: "#7A9E8E" },
          { label: "This week", value: `${logs.filter(l => l.date >= new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]).length}`, color: "#B89E6A" },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 12, textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, }}>{s.value}</p>
            <p style={{ fontSize: 10, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
              backgroundColor: activeSection === s.id ? stageInfo.color : "var(--ivory-dark)",
              color: activeSection === s.id ? "white" : "var(--mauve)" }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          <SupportInsightCard mode="menopause" profile={profile} logs={logs} />
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>AI personal tips</p>
              <button onClick={getAiInsight} disabled={loadingAi}
                style={{ fontSize: 11, fontWeight: 600, backgroundColor: stageInfo.color, color: "white", border: "none", borderRadius: 9999, padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                {loadingAi ? <Loader2 style={{ width: 11, height: 11, animation: "spin 0.7s linear infinite" }} /> : null}
                {loadingAi ? "Generating…" : "Get tips"}
              </button>
            </div>
            {aiInsight ? (
              <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{aiInsight}</p>
            ) : (
              <p style={{ fontSize: 12, color: "var(--mauve)" }}>Tap "Get tips" for personalised advice based on your recent logs.</p>
            )}
          </div>
          {logs.length > 0 && (
            <div style={card}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 10 }}>Recent logs</p>
              {logs.slice(0, 5).map(item => (
                <div key={item.id} style={{ backgroundColor: "var(--ivory)", borderRadius: 10, padding: "10px 14px", marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)" }}>{format(parseISO(item.date), "EEE MMM d")}</p>
                    <p style={{ fontSize: 11, color: stageInfo.color }}>Hot flashes {item.hot_flashes}/5</p>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 2 }}>Sleep {item.sleep_quality}/5 · Mood {item.mood}/5 · Energy {item.energy}/5 · Brain fog {item.brain_fog}/5</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hot flash tracker */}
      {activeSection === "hotflash" && <HotFlashTracker user={user} />}

      {/* Daily log */}
      {activeSection === "checkin" && (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>Today's symptom check-in</p>
          <SupportMetricSlider label="Hot flashes (1=none, 5=severe)" value={logForm.hot_flashes} onChange={v => setLogForm(c => ({ ...c, hot_flashes: v }))} />
          <SupportMetricSlider label="Night sweats" value={logForm.night_sweats} onChange={v => setLogForm(c => ({ ...c, night_sweats: v }))} />
          <SupportMetricSlider label="Sleep quality" value={logForm.sleep_quality} onChange={v => setLogForm(c => ({ ...c, sleep_quality: v }))} />
          <SupportMetricSlider label="Mood" value={logForm.mood} onChange={v => setLogForm(c => ({ ...c, mood: v }))} />
          <SupportMetricSlider label="Energy" value={logForm.energy} onChange={v => setLogForm(c => ({ ...c, energy: v }))} />
          <SupportMetricSlider label="Brain fog" value={logForm.brain_fog} onChange={v => setLogForm(c => ({ ...c, brain_fog: v }))} />
          <SupportMetricSlider label="Joint pain" value={logForm.joint_pain} onChange={v => setLogForm(c => ({ ...c, joint_pain: v }))} />
          <SupportMetricSlider label="Vaginal dryness (1=none)" value={logForm.vaginal_dryness} onChange={v => setLogForm(c => ({ ...c, vaginal_dryness: v }))} />
          <SupportMetricSlider label="Libido (1=very low, 5=normal)" value={logForm.libido} onChange={v => setLogForm(c => ({ ...c, libido: v }))} />
          <textarea rows={3} placeholder="Notes from today" value={logForm.notes} onChange={e => setLogForm(c => ({ ...c, notes: e.target.value }))} style={{ ...inp, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveTodayLog} className="btn-primary w-full py-3 text-sm">{savingLog ? "Saving..." : "Save today's log"}</button>
        </div>
      )}

      {/* Symptom diary */}
      {activeSection === "diary" && <SymptomDiarySection user={user} />}

      {/* Weekly report */}
      {activeSection === "report" && <MenopauseReportCard user={user} />}

      {/* Patterns chart */}
      {activeSection === "patterns" && (
        logs.length < 3 ? (
          <div style={{ ...card, textAlign: "center", padding: "32px" }}>
            <p style={{ fontSize: 13, color: "var(--mauve)" }}>Log at least 3 days to see your symptom patterns here.</p>
          </div>
        ) : <PatternChart logs={logs} />
      )}

      {/* Nutrition */}
      {activeSection === "nutrition" && (
        <div className="space-y-4">
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 12 }}>Nutrition for {stageInfo.label}</p>
            {nutritionTips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: stageInfo.color, flexShrink: 0, marginTop: 5 }} />
                <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
          <div style={{ ...card, backgroundColor: "var(--sage-subtle)", borderColor: "var(--sage-light)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--sage)", marginBottom: 8 }}>Phytoestrogen-rich foods</p>
            {["Flaxseeds & linseeds", "Soy & edamame", "Tofu & tempeh", "Lentils & chickpeas", "Sesame seeds", "Whole grains (oats, barley)", "Dried apricots & prunes"].map((item, i) => (
              <p key={i} style={{ fontSize: 12, color: "var(--plum)", lineHeight: 1.6 }}>• {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle */}
      {activeSection === "lifestyle" && (
        <div className="space-y-4">
          {lifestyleTips.map(({ title, body }) => (
            <div key={title} style={card}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
          <div style={{ ...card, backgroundColor: "#FFF8EE", borderColor: "#F5DFA8" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#7A5A20", marginBottom: 8 }}>When to speak to your GP</p>
            {["Hot flashes severely disrupting sleep or work", "Mood changes affecting daily life", "Vaginal dryness or pain causing distress", "Palpitations or new heart symptoms", "Joint or bone pain", "Low mood or anxiety that is new"].map((item, i) => (
              <p key={i} style={{ fontSize: 12, color: "#7A5A20", lineHeight: 1.6 }}>• {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Symptom guide */}
      {activeSection === "symptoms" && (
        <div className="space-y-4">
          <SymptomInfo />
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 10 }}>Trusted resources</p>
            {[
              { label: "NICE Menopause Guidelines", url: "https://www.nice.org.uk/guidance/ng23" },
              { label: "British Menopause Society", url: "https://thebms.org.uk/" },
              { label: "NHS Menopause Overview", url: "https://www.nhs.uk/conditions/menopause/" },
            ].map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", padding: "10px 14px", borderRadius: 12, backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)", marginBottom: 6, textDecoration: "none" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", }}>{r.label}</p>
                <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 2 }}>Opens in new tab →</p>
              </a>
            ))}
            <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 8, lineHeight: 1.6 }}>
              Please discuss HRT and treatment options with your GP. These resources offer evidence-based information to support your conversation.
            </p>
          </div>
        </div>
      )}

      {/* Setup */}
      {activeSection === "setup" && (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>Menopause setup</p>
          <div>
            <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 4 }}>Stage</p>
            <select value={profileForm.stage} onChange={e => setProfileForm(c => ({ ...c, stage: e.target.value }))} style={{ ...inp, resize: undefined }}>
              <option value="perimenopause">Perimenopause</option>
              <option value="menopause">Menopause</option>
              <option value="postmenopause">Postmenopause</option>
            </select>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 8 }}>Care focus areas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOCUSES.map(f => (
                <button key={f} onClick={() => toggleFocus(f)}
                  style={{ padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                    backgroundColor: profileForm.care_focus.includes(f) ? stageInfo.color : "var(--ivory-dark)",
                    color: profileForm.care_focus.includes(f) ? "white" : "var(--mauve)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <textarea rows={2} placeholder="Cycle changes or patterns you've noticed" value={profileForm.cycle_changes} onChange={e => setProfileForm(c => ({ ...c, cycle_changes: e.target.value }))} style={inp} />
          <textarea rows={2} placeholder="Current support (HRT, supplements, other)" value={profileForm.current_supports} onChange={e => setProfileForm(c => ({ ...c, current_supports: e.target.value }))} style={inp} />
          <textarea rows={2} placeholder="Important notes" value={profileForm.notes} onChange={e => setProfileForm(c => ({ ...c, notes: e.target.value }))} style={{ ...inp, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveProfile} className="btn-primary w-full py-3 text-sm">{savingProfile ? "Saving..." : "Save setup"}</button>
        </div>
      )}
    </div>
  );
}