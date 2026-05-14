import { useEffect, useState, useRef } from "react";
import { format, parseISO, differenceInWeeks, differenceInDays, addDays } from "date-fns";
import { base44 } from "@/api/base44Client";
import SupportMetricSlider from "./SupportMetricSlider";
import SupportInsightCard from "./SupportInsightCard";
import { Baby, Heart, Zap, Moon, AlertCircle, Plus, Check, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import PregnancyWeekCard from "./PregnancyWeekCard";
import KickTrackerSection from "./KickTrackerSection";
import ContractionTimerSection from "./ContractionTimerSection";
import { toast } from "sonner";

const FOCUSES = ["Sleep", "Nausea", "Movement", "Nutrition", "Birth prep", "Calm", "Pelvic health", "Breastfeeding prep"];
const todayStr = new Date().toISOString().split("T")[0];
const inp = { width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", resize: "none", boxSizing: "border-box" };
const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };

// Baby size comparisons by week
const BABY_SIZE = {
  4: { fruit: "Poppy seed", size: "0.4mm", emoji: "🌱" }, 6: { fruit: "Sweet pea", size: "6mm", emoji: "🫛" },
  8: { fruit: "Raspberry", size: "1.6cm", emoji: "🍓" }, 10: { fruit: "Strawberry", size: "3cm", emoji: "🍓" },
  12: { fruit: "Lime", size: "5cm", emoji: "🍋‍🟩" }, 14: { fruit: "Lemon", size: "8.5cm", emoji: "🍋" },
  16: { fruit: "Avocado", size: "11.5cm", emoji: "🥑" }, 18: { fruit: "Sweet potato", size: "14cm", emoji: "🍠" },
  20: { fruit: "Banana", size: "16cm", emoji: "🍌" }, 22: { fruit: "Papaya", size: "27cm", emoji: "🫐" },
  24: { fruit: "Corn", size: "30cm", emoji: "🌽" }, 26: { fruit: "Lettuce", size: "35cm", emoji: "🥬" },
  28: { fruit: "Aubergine", size: "37cm", emoji: "🍆" }, 30: { fruit: "Cucumber", size: "40cm", emoji: "🥒" },
  32: { fruit: "Squash", size: "42cm", emoji: "🎃" }, 34: { fruit: "Cantaloupe", size: "45cm", emoji: "🍈" },
  36: { fruit: "Honeydew", size: "47cm", emoji: "🍈" }, 38: { fruit: "Leek", size: "49cm", emoji: "🧅" },
  40: { fruit: "Watermelon", size: "51cm", emoji: "🍉" },
};

function getBabySize(week) {
  const weeks = Object.keys(BABY_SIZE).map(Number).sort((a, b) => a - b);
  const w = weeks.reduce((prev, cur) => (cur <= week ? cur : prev), weeks[0]);
  return BABY_SIZE[w] || BABY_SIZE[40];
}

const TRIMESTER_INFO = {
  first:  { weeks: "Weeks 1–12", color: "#C4849A", bg: "#F5ECF0", tip: "Nausea, fatigue, and implantation are common. Folate, rest, and hydration are your priorities." },
  second: { weeks: "Weeks 13–26", color: "#7A9E8E", bg: "#EBF2EF", tip: "Energy often returns. Baby's movements begin. Focus on iron, calcium, and gentle exercise." },
  third:  { weeks: "Weeks 27–40", color: "#B89E6A", bg: "#F5F0E6", tip: "Preparing for birth. Rest often, focus on birth prep, pelvic floor, and nesting." },
  postpartum: { weeks: "After birth", color: "#8A7E88", bg: "#F0EBF0", tip: "Recovery and bonding. Prioritise sleep, nutrition, and asking for support." },
};

const NUTRITION_BY_TRIMESTER = {
  first:  ["Folic acid 400mcg daily", "Iron-rich foods (spinach, lentils)", "Vitamin B6 for nausea relief", "Avoid raw fish, soft cheese, alcohol", "Stay hydrated — aim 2L+ water"],
  second: ["Iron 27mg/day (meat, beans, fortified cereals)", "Calcium 1000mg/day (dairy, leafy greens)", "Omega-3 DHA for brain development", "Protein 70–100g/day", "Vitamin D 600 IU/day"],
  third:  ["Magnesium for leg cramps", "Fibre for constipation", "Iron continues to be key", "Smaller more frequent meals", "Vitamin K for birth preparation"],
  postpartum: ["Iodine for breastfeeding", "Continue prenatal vitamins", "Collagen & zinc for healing", "Oat-based foods to support milk", "Iron to recover from birth blood loss"],
};

const HOSPITAL_BAG = [
  "Birth plan copies", "ID & insurance cards", "Phone charger", "Maternity notes / records",
  "Comfortable outfit for labour", "Nightgown / pyjamas (front-opening)", "Toiletries & lip balm",
  "Snacks & drinks for partner", "Baby's first outfit", "Car seat (installed)", "Nappies & wipes",
  "Receiving blankets", "Going-home outfit for you", "Breast pads & nipple cream",
];

const KICK_COUNTER_GOAL = 10;

function KickCounter() {
  const [kicks, setKicks] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const addKick = () => {
    if (!startTime) setStartTime(Date.now());
    const newKicks = kicks + 1;
    setKicks(newKicks);
    if (newKicks >= KICK_COUNTER_GOAL) toast.success(`🎉 ${KICK_COUNTER_GOAL} kicks in ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  };

  const reset = () => { setKicks(0); setStartTime(null); setElapsed(0); };
  const mins = Math.floor(elapsed / 60), secs = elapsed % 60;

  return (
    <div style={{ ...card, textAlign: "center" }}>
      <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Kick counter</p>
      <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>Goal: {KICK_COUNTER_GOAL} kicks. Tap for each movement.</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 14 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 42, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif", lineHeight: 1 }}>{kicks}</p>
          <p style={{ fontSize: 10, color: "var(--mauve)" }}>kicks</p>
        </div>
        {startTime && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{mins}:{secs.toString().padStart(2, "0")}</p>
            <p style={{ fontSize: 10, color: "var(--mauve)" }}>elapsed</p>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={addKick} style={{ width: 70, height: 70, borderRadius: "50%", backgroundColor: kicks >= KICK_COUNTER_GOAL ? "var(--sage)" : "var(--rose-dust)", color: "white", border: "none", cursor: "pointer", fontSize: 24 }}>👶</button>
      </div>
      {kicks > 0 && <button onClick={reset} style={{ marginTop: 12, fontSize: 12, color: "var(--mauve)", background: "none", border: "none", cursor: "pointer" }}>Reset</button>}
      {kicks >= KICK_COUNTER_GOAL && <p style={{ marginTop: 8, fontSize: 12, color: "var(--sage)", fontWeight: 600 }}>Goal reached! 🎉 Log time with your midwife if concerned.</p>}
    </div>
  );
}

function HospitalBagChecklist() {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hospital_bag") || "[]"); } catch { return []; }
  });
  const toggle = (item) => {
    const next = checked.includes(item) ? checked.filter(i => i !== item) : [...checked, item];
    setChecked(next);
    localStorage.setItem("hospital_bag", JSON.stringify(next));
  };
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>Hospital bag checklist</p>
        <span style={{ fontSize: 11, color: "var(--mauve)" }}>{checked.length}/{HOSPITAL_BAG.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {HOSPITAL_BAG.map(item => (
          <button key={item} onClick={() => toggle(item)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, backgroundColor: checked.includes(item) ? "var(--sage-subtle)" : "var(--ivory)", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: checked.includes(item) ? "var(--sage)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {checked.includes(item) && <Check style={{ width: 10, height: 10, color: "white" }} />}
            </div>
            <span style={{ fontSize: 12, color: checked.includes(item) ? "var(--mauve)" : "var(--plum)", textDecoration: checked.includes(item) ? "line-through" : "none", fontFamily: "'Inter', sans-serif" }}>{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PregnancySupportTab({ user, profile, setProfile, logs, setLogs }) {
  const [profileForm, setProfileForm] = useState({ due_date: "", pregnancy_week: "", trimester: "first", care_focus: [], birth_preferences: "", notes: "" });
  const [logForm, setLogForm] = useState({ date: todayStr, energy: 3, mood: 3, sleep_quality: 3, nausea: 1, pelvic_pain: 1, swelling: 1, movement_notes: "", notes: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (profile) setProfileForm({ due_date: profile.due_date || "", pregnancy_week: profile.pregnancy_week || "", trimester: profile.trimester || "first", care_focus: profile.care_focus || [], birth_preferences: profile.birth_preferences || "", notes: profile.notes || "" });
  }, [profile]);

  useEffect(() => {
    const todayLog = logs.find(l => l.date === todayStr);
    if (todayLog) setLogForm({ date: todayStr, energy: todayLog.energy || 3, mood: todayLog.mood || 3, sleep_quality: todayLog.sleep_quality || 3, nausea: todayLog.nausea || 1, pelvic_pain: todayLog.pelvic_pain || 1, swelling: todayLog.swelling || 1, movement_notes: todayLog.movement_notes || "", notes: todayLog.notes || "" });
  }, [logs]);

  const toggleFocus = (v) => setProfileForm(c => ({ ...c, care_focus: c.care_focus.includes(v) ? c.care_focus.filter(i => i !== v) : [...c.care_focus, v] }));

  const saveProfile = async () => {
    setSavingProfile(true);
    const payload = { user_id: user.id, due_date: profileForm.due_date || undefined, pregnancy_week: profileForm.pregnancy_week ? Number(profileForm.pregnancy_week) : undefined, trimester: profileForm.trimester, care_focus: profileForm.care_focus, birth_preferences: profileForm.birth_preferences || undefined, notes: profileForm.notes || undefined };
    const saved = profile ? await base44.entities.PregnancyProfile.update(profile.id, payload) : await base44.entities.PregnancyProfile.create(payload);
    setProfile(saved);
    toast.success("Pregnancy setup saved");
    setSavingProfile(false);
  };

  const saveTodayLog = async () => {
    setSavingLog(true);
    const todayLog = logs.find(l => l.date === todayStr);
    const payload = { user_id: user.id, ...logForm };
    const saved = todayLog ? await base44.entities.PregnancyDailyLog.update(todayLog.id, payload) : await base44.entities.PregnancyDailyLog.create(payload);
    setLogs([saved, ...logs.filter(l => l.id !== saved.id)].sort((a, b) => b.date.localeCompare(a.date)));
    toast.success("Today's log saved");
    setSavingLog(false);
  };

  const getWeeklyAiUpdate = async () => {
    if (!profile?.pregnancy_week) return;
    setLoadingAi(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a warm, supportive weekly pregnancy update for week ${profile.pregnancy_week} (${profile.trimester} trimester). Include: 1) What's happening with baby this week, 2) Common symptoms and why they happen, 3) One practical self-care tip, 4) One thing to celebrate. Keep it concise, warm, and non-medical. 3-4 short paragraphs.`,
      });
      setAiInsight(res);
    } catch {}
    setLoadingAi(false);
  };

  const week = profile?.pregnancy_week || null;
  const babySize = week ? getBabySize(week) : null;
  const triInfo = TRIMESTER_INFO[profile?.trimester || "first"];
  const dueDate = profile?.due_date ? parseISO(profile.due_date) : null;
  const daysUntilDue = dueDate ? differenceInDays(dueDate, new Date()) : null;
  const nutritionTips = NUTRITION_BY_TRIMESTER[profile?.trimester || "first"];

  const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "checkin", label: "Daily log" },
    { id: "nutrition", label: "Nutrition" },
    { id: "kicks", label: "Kicks" },
    { id: "contractions", label: "Contractions" },
    { id: "bag", label: "Bag" },
    { id: "setup", label: "Setup" },
  ];

  return (
    <div className="space-y-4">
      {/* Hero stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Week", value: week ? `Week ${week}` : "—", color: triInfo.color, bg: triInfo.bg },
          { label: "Trimester", value: profile?.trimester?.replace("_", " ") || "Set up", color: triInfo.color, bg: triInfo.bg },
          { label: "Due in", value: daysUntilDue !== null ? (daysUntilDue > 0 ? `${daysUntilDue}d` : "Due now!") : "—", color: "#7A9E8E", bg: "#EBF2EF" },
          { label: "Baby size", value: babySize ? babySize.emoji : "🤰", color: "var(--mauve)", bg: "var(--mauve-subtle)" },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: s.bg, border: `1px solid ${s.color}30`, borderRadius: 16, padding: "14px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'Fraunces', serif" }}>{s.value}</p>
            <p style={{ fontSize: 10, color: s.color, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Baby size card */}
      {babySize && (
        <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 42 }}>{babySize.emoji}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>Your baby is the size of a {babySize.fruit}</p>
            <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: 2 }}>About {babySize.size} — Week {week}</p>
            <p style={{ fontSize: 12, color: "var(--rose-dust)", marginTop: 4 }}>{triInfo.tip}</p>
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "none",
              backgroundColor: activeSection === s.id ? "var(--rose-dust)" : "var(--ivory-dark)",
              color: activeSection === s.id ? "white" : "var(--mauve)" }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          <PregnancyWeekCard profile={profile} />
          <SupportInsightCard mode="pregnancy" profile={profile} logs={logs} />

          {/* Weekly AI update */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>Week {week} update</p>
              <button onClick={getWeeklyAiUpdate} disabled={loadingAi || !week}
                style={{ fontSize: 11, fontWeight: 600, backgroundColor: "var(--rose-dust)", color: "white", border: "none", borderRadius: 9999, padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, opacity: !week ? 0.4 : 1 }}>
                {loadingAi ? <Loader2 style={{ width: 12, height: 12, animation: "spin 0.7s linear infinite" }} /> : null}
                {loadingAi ? "Generating…" : "Get update"}
              </button>
            </div>
            {aiInsight ? (
              <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-line" }}>{aiInsight}</p>
            ) : (
              <p style={{ fontSize: 12, color: "var(--mauve)" }}>Tap "Get update" for a personalised week-by-week summary.</p>
            )}
          </div>

          {/* Recent logs */}
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 12 }}>Recent logs</p>
            {logs.length === 0 ? <p style={{ fontSize: 12, color: "var(--mauve)", textAlign: "center", padding: "12px 0" }}>No logs yet — save your first one in Daily log.</p> : (
              <div className="space-y-2">
                {logs.slice(0, 5).map(item => (
                  <div key={item.id} style={{ backgroundColor: "var(--ivory)", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)" }}>{format(parseISO(item.date), "EEE MMM d")}</p>
                      <p style={{ fontSize: 11, color: "var(--rose-dust)" }}>Nausea {item.nausea}/5</p>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 2 }}>Energy {item.energy}/5 · Mood {item.mood}/5 · Sleep {item.sleep_quality}/5</p>
                    {item.movement_notes && <p style={{ fontSize: 11, color: "var(--plum)", marginTop: 4, fontStyle: "italic" }}>"{item.movement_notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily log */}
      {activeSection === "checkin" && (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>Today's support check-in</p>
          <SupportMetricSlider label="Energy" value={logForm.energy} onChange={v => setLogForm(c => ({ ...c, energy: v }))} />
          <SupportMetricSlider label="Mood" value={logForm.mood} onChange={v => setLogForm(c => ({ ...c, mood: v }))} />
          <SupportMetricSlider label="Sleep quality" value={logForm.sleep_quality} onChange={v => setLogForm(c => ({ ...c, sleep_quality: v }))} />
          <SupportMetricSlider label="Nausea (1=none, 5=severe)" value={logForm.nausea} onChange={v => setLogForm(c => ({ ...c, nausea: v }))} />
          <SupportMetricSlider label="Pelvic discomfort" value={logForm.pelvic_pain} onChange={v => setLogForm(c => ({ ...c, pelvic_pain: v }))} />
          <SupportMetricSlider label="Swelling" value={logForm.swelling} onChange={v => setLogForm(c => ({ ...c, swelling: v }))} />
          <textarea rows={2} placeholder="Movement, kicks, or body notes" value={logForm.movement_notes} onChange={e => setLogForm(c => ({ ...c, movement_notes: e.target.value }))} style={inp} />
          <textarea rows={2} placeholder="Anything else from today" value={logForm.notes} onChange={e => setLogForm(c => ({ ...c, notes: e.target.value }))} style={{ ...inp, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveTodayLog} className="btn-primary w-full py-3 text-sm">{savingLog ? "Saving..." : "Save today's log"}</button>
        </div>
      )}

      {/* Nutrition */}
      {activeSection === "nutrition" && (
        <div className="space-y-4">
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", marginBottom: 4 }}>Nutrition for {profile?.trimester?.replace("_", " ") || "pregnancy"}</p>
            <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 12 }}>Evidence-based priorities for this trimester</p>
            {nutritionTips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: triInfo.color, flexShrink: 0, marginTop: 5 }} />
                <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
          <div style={{ ...card, backgroundColor: "#FFF8EE", borderColor: "#F5DFA8" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#7A5A20", marginBottom: 6 }}>⚠️ Always avoid during pregnancy</p>
            {["Raw/undercooked meat, fish, or eggs", "Unpasteurised dairy and soft cheeses", "High-mercury fish (swordfish, shark, tilefish)", "Alcohol", "High-dose vitamin A supplements", "Liver and liver products (excess vitamin A)", "Unwashed raw produce", "Deli meats unless heated through"].map((item, i) => (
              <p key={i} style={{ fontSize: 12, color: "#7A5A20", lineHeight: 1.6 }}>• {item}</p>
            ))}
          </div>
        </div>
      )}

      {/* Kick counter */}
      {activeSection === "kicks" && <KickTrackerSection user={user} />}

      {/* Contraction timer */}
      {activeSection === "contractions" && <ContractionTimerSection user={user} />}

      {/* Hospital bag */}
      {activeSection === "bag" && <HospitalBagChecklist />}

      {/* Setup */}
      {activeSection === "setup" && (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)" }}>Pregnancy setup</p>
          <div>
            <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 4 }}>Due date</p>
            <input type="date" value={profileForm.due_date} onChange={e => setProfileForm(c => ({ ...c, due_date: e.target.value }))} style={{ ...inp, resize: undefined }} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 4 }}>Current pregnancy week</p>
            <input type="number" min="1" max="42" placeholder="e.g. 20" value={profileForm.pregnancy_week} onChange={e => setProfileForm(c => ({ ...c, pregnancy_week: e.target.value }))} style={{ ...inp, resize: undefined }} />
          </div>
          <select value={profileForm.trimester} onChange={e => setProfileForm(c => ({ ...c, trimester: e.target.value }))} style={{ ...inp, resize: undefined }}>
            <option value="first">First trimester (Weeks 1–12)</option>
            <option value="second">Second trimester (Weeks 13–26)</option>
            <option value="third">Third trimester (Weeks 27–40)</option>
            <option value="postpartum">Postpartum</option>
          </select>
          <div>
            <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 8 }}>Care focus areas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOCUSES.map(f => (
                <button key={f} onClick={() => toggleFocus(f)}
                  style={{ padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                    backgroundColor: profileForm.care_focus.includes(f) ? "var(--rose-dust)" : "var(--ivory-dark)",
                    color: profileForm.care_focus.includes(f) ? "white" : "var(--mauve)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <textarea rows={2} placeholder="Birth preferences or support notes" value={profileForm.birth_preferences} onChange={e => setProfileForm(c => ({ ...c, birth_preferences: e.target.value }))} style={inp} />
          <textarea rows={2} placeholder="Important notes" value={profileForm.notes} onChange={e => setProfileForm(c => ({ ...c, notes: e.target.value }))} style={{ ...inp, backgroundColor: "var(--rose-dust-subtle)" }} />
          <button onClick={saveProfile} className="btn-primary w-full py-3 text-sm">{savingProfile ? "Saving..." : "Save setup"}</button>
        </div>
      )}
    </div>
  );
}