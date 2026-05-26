// ─────────────────────────────────────────────────────────────────────────────
// HealthCornerSkinHair — "✨ HC: Skin & Hair" tab on /Ideas (FoundersOS).
//
// Phase-aware skin and hair hub. Five sections:
//   A. Your Skin This Phase — 3 sub-sections (what's happening, what to use, what to avoid)
//   B. Skin Log (last 7 days)
//   C. Hair & Scalp This Phase + 7-day shedding log
//   D. Hormonal Acne Tracker
//   E. Supplement Suggestions
//
// Data fetched in FoundersOS and passed as props (including SkinHairLogs
// if entity exists, else empty array).
// Spec source: 2026-05-26 Halli — Health Corner 3-tab brief.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles, Plus } from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  border:   "#D4C9B4",
  gold:     "#D4AF37",
  goldSoft: "rgba(212,175,55,0.16)",
  sage:     "#8FAF8F",
  sageLight:"#C8DDC8",
  blush:    "#E8B4B8",
  blushBg:  "rgba(232,180,184,0.22)",
};

const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);

const PHASE_LABEL = {
  follicular: "Follicular", ovulatory: "Ovulatory",
  luteal: "Luteal", menstrual: "Menstrual",
};

const SKIN_CONTENT = {
  follicular: {
    whats: "Rising estrogen increases collagen and hyaluronic acid production — skin tends to look clearer, more hydrated, and more luminous in this phase. Pores appear smaller. This is your skin's 'golden window'.",
    use:   "Lightweight hydration — a hyaluronic acid serum is ideal. Good time to introduce new actives (retinol, AHAs) as your skin barrier is stronger. SPF daily.",
    avoid: "No particular restrictions — this is the safest phase for skin experimentation.",
  },
  ovulatory: {
    whats: "Estrogen peaks and sebum production may increase slightly around ovulation. Some women notice a slight sheen or minor breakouts in this window — this is normal and hormone-driven, not hygiene-related.",
    use:   "Blotting papers over heavy moisturisers. Niacinamide helps regulate sebum. Keep SPF consistent.",
    avoid: "Heavy oils may clog pores. Fragrance can irritate slightly elevated sensitivity.",
  },
  luteal: {
    whats: "Progesterone increases sebum production, which can clog pores and trigger hormonal acne — particularly along the jawline and chin. Skin may appear duller and feel more sensitive. This is when most hormonal breakouts occur.",
    use:   "Salicylic acid spot treatments target hormonal acne. A gentler, barrier-focused routine — less exfoliation, more ceramides. Avoid introducing new actives.",
    avoid: "Avoid alcohol-based toners, harsh exfoliants, and introducing new products. Your skin's inflammatory response is heightened.",
  },
  menstrual: {
    whats: "Estrogen and progesterone are both low, making skin drier and more sensitive. Redness and inflammation are more noticeable. Barrier function is reduced — skin is more reactive to products.",
    use:   "Rich moisturiser and minimal actives. Fragrance-free products only. Calm the skin rather than treat it.",
    avoid: "Retinol, strong acids, and physical scrubs — all too aggressive for skin in this low-barrier state.",
  },
};
const SKIN_MENO = {
  whats: "Declining estrogen means less collagen and less natural oil production — skin becomes drier, thinner, and less elastic. You may notice deeper lines, more sensitivity, and changes in texture.",
  use:   "Hyaluronic acid serums, barrier-supporting moisturisers (ceramides), and SPF daily are the highest-impact interventions. Some women find topical estrogen (prescribed) or phytoestrogen-based creams helpful — discuss with your GP.",
  avoid: "Aggressive exfoliation, fragrance, and alcohol-based products — they amplify the dryness and sensitivity. Less is more in this stage.",
};

const HAIR_CONTENT = {
  follicular: "Estrogen extends the hair growth phase (anagen). Hair tends to be thicker, shinier, and grows faster. Minimal shedding — this is when hair is at its strongest.",
  ovulatory:  "Estrogen extends the hair growth phase (anagen). Hair tends to be thicker, shinier, and grows faster. Minimal shedding — this is when hair is at its strongest.",
  luteal:     "Increased DHT sensitivity in some women can lead to slight shedding. Hair may feel oilier at the roots. Normal — not a sign of hair loss.",
  menstrual:  "The hormonal dip can trigger a brief increase in shedding. This is telogen effluvium — a temporary response to the hormonal shift. Not permanent.",
};
const HAIR_MENO = "Declining estrogen and relative androgen dominance can cause changes in hair density — thinning at the crown, temples, or a widening part. This is androgenic alopecia driven by the hormonal shift. Options include minoxidil (topical, OTC), low-level laser therapy, and GP-prescribed treatments. Iron, ferritin, zinc, and vitamin D levels should be tested — deficiencies are common and treatable.";

const SUPPLEMENTS = [
  { name: "Zinc",          benefit: "Regulates sebum, reduces hormonal acne",                 note: "Common in people who struggle with luteal-phase breakouts. Food sources: pumpkin seeds, chickpeas, cashews." },
  { name: "Omega-3",       benefit: "Anti-inflammatory, supports skin barrier",                note: "Particularly helpful for menstrual-phase dryness and sensitivity." },
  { name: "Collagen (I/III)", benefit: "Supports skin elasticity",                              note: "Most relevant in perimenopause and post-menopause as collagen production declines." },
  { name: "Biotin",        benefit: "Marketed for hair — evidence is mixed",                    note: "Most effective for people with a genuine deficiency. Test before supplementing." },
  { name: "Iron / Ferritin", benefit: "Low iron is a leading cause of hair shedding",           note: "If you're experiencing significant hair loss, ask your GP for a full blood count and ferritin test." },
];

function isoOf(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function dateKeyOf(r)  { return r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0,10) : "") || (r?.created_date ? String(r.created_date).slice(0,10) : ""); }
function lastNDayKeys(n) {
  const out = []; const today = new Date(); today.setHours(0,0,0,0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push(isoOf(d));
  }
  return out;
}
function prettyName(s) { return String(s || "").replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); }

export default function HealthCornerSkinHair({ profile, symptoms = [], skinLogs = [] }) {
  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "follicular";
  const lifeStage = profile?.life_stage || "reproductive";
  const isMeno = MENO_STAGES.has(lifeStage);
  const phaseLabel = isMeno ? prettyName(lifeStage) : (PHASE_LABEL[phase] || prettyName(phase));

  const skinContent = isMeno ? SKIN_MENO : (SKIN_CONTENT[phase] || SKIN_CONTENT.follicular);
  const hairContent = isMeno ? HAIR_MENO : (HAIR_CONTENT[phase] || HAIR_CONTENT.follicular);

  // ── Skin log — last 7 days ─────────────────────────────────────
  const days7 = useMemo(() => lastNDayKeys(7), []);
  const skinByDay = useMemo(() => {
    const m = new Map();
    for (const r of skinLogs) {
      const k = dateKeyOf(r);
      const v = r?.skin_rating ?? r?.skin_score ?? r?.rating;
      if (k && v != null) m.set(k, Number(v));
    }
    return days7.map((d) => ({ d, v: m.get(d) ?? null }));
  }, [skinLogs, days7]);

  const hairByDay = useMemo(() => {
    const m = new Map();
    for (const r of skinLogs) {
      const k = dateKeyOf(r);
      const v = r?.hair_shedding ?? r?.hair_rating ?? r?.shedding;
      if (k && v != null) m.set(k, Number(v));
    }
    return days7.map((d) => ({ d, v: m.get(d) ?? null }));
  }, [skinLogs, days7]);

  // ── Hormonal acne tracker — pull breakout symptom logs ─────────
  const acneLogs = useMemo(() => {
    return symptoms.filter((r) => {
      const t = String(r?.symptom_type || r?.symptom_name || "").toLowerCase();
      return t === "acne" || t === "breakout" || t.includes("breakout") || t.includes("acne");
    });
  }, [symptoms]);

  const acneCycleDays = useMemo(() => {
    if (!profile?.last_period_start_date || !cycle?.cycleLen) return [];
    const start = new Date(profile.last_period_start_date); start.setHours(0,0,0,0);
    const out = [];
    for (const r of acneLogs) {
      const k = dateKeyOf(r); if (!k) continue;
      const d = new Date(k); if (Number.isNaN(d.getTime())) continue;
      const diff = Math.floor((d - start) / 86400000);
      if (diff < 0) continue;
      const cycleDay = (diff % cycle.cycleLen) + 1;
      out.push(cycleDay);
    }
    return out;
  }, [acneLogs, profile, cycle]);

  const lutealAcneCount = useMemo(() => {
    if (!cycle?.cycleLen) return 0;
    const ovulationDay = Math.floor(cycle.cycleLen * 0.5);
    return acneCycleDays.filter((d) => d > ovulationDay).length;
  }, [acneCycleDays, cycle]);

  const acneJessLine = (() => {
    if (acneLogs.length === 0) return "Log acne as a symptom on /Today to track your pattern.";
    if (lutealAcneCount >= 3) return "Your breakouts are clustering in your luteal phase — that's classic hormonal acne. Consider a salicylic acid serum from day 14, and discuss a GP referral if it's impacting your quality of life.";
    return `${acneLogs.length} breakout day${acneLogs.length === 1 ? "" : "s"} logged this month. Not yet a clear pattern — keep tracking and I'll watch for it.`;
  })();

  return (
    <div>
      <DemoPill subtitle="Skin & Hair · phase-aware hub" />

      <article style={canvasStyle()}>
        {/* SECTION A — Skin this phase */}
        <SectionHeader>Skin this {phaseLabel.toLowerCase()}</SectionHeader>
        <div style={{ padding: "0 18px 12px", display: "grid", gap: 12 }}>
          <BriefCard title="What's happening to your skin"   body={skinContent.whats} />
          <BriefCard title="What to use now"                  body={skinContent.use} />
          <BriefCard title="What to avoid now"                body={skinContent.avoid} />
        </div>

        {/* SECTION B — Skin log */}
        <SectionHeader>Skin log · last 7 days</SectionHeader>
        <div style={{ padding: "0 18px 12px" }}>
          <DotRow data={skinByDay} colourFor={skinTint} emptyLabel="Log skin today" />
          <p style={{ marginTop: 12, marginBottom: 0, fontSize: 13.5, color: T.muted, fontFamily: '"Fraunces", Georgia, serif', fontStyle: "italic" }}>
            Tracking your skin daily helps Jess spot hormonal patterns you'd never notice yourself.
          </p>
        </div>

        {/* SECTION C — Hair & scalp */}
        <SectionHeader>Hair & scalp this {phaseLabel.toLowerCase()}</SectionHeader>
        <div style={{ padding: "0 18px 12px", display: "grid", gap: 12 }}>
          <BriefCard title="What's happening to your hair" body={hairContent} />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: T.muted, fontWeight: 700, marginBottom: 10 }}>
              Hair shedding log · last 7 days
            </div>
            <DotRow data={hairByDay} colourFor={hairTint} emptyLabel="Log hair today" />
          </div>
        </div>

        {/* SECTION D — Hormonal acne tracker */}
        <SectionHeader>Hormonal acne tracker</SectionHeader>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 12, padding: 16,
            boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso }}>This month</div>
              <div style={{ fontSize: 13, color: T.muted }}>{acneLogs.length} breakout day{acneLogs.length === 1 ? "" : "s"} logged</div>
            </div>
            {acneCycleDays.length > 0 && (
              <div style={{ fontSize: 13.5, color: T.espresso, marginBottom: 10 }}>
                Breakouts logged on cycle days: <strong>{Array.from(new Set(acneCycleDays)).sort((a,b)=>a-b).join(", ")}</strong>
              </div>
            )}
            <p style={{
              margin: 0, padding: "10px 12px", background: T.blushBg, borderRadius: 8,
              fontFamily: '"Fraunces", Georgia, serif', fontSize: 14.5, lineHeight: 1.6, color: T.espresso,
            }}>{acneJessLine}</p>
          </div>
        </div>

        {/* SECTION E — Supplement suggestions */}
        <SectionHeader>Supplement suggestions · skin & hair</SectionHeader>
        <div style={{ padding: "0 18px 8px", display: "grid", gap: 10 }}>
          {SUPPLEMENTS.map((s) => (
            <div key={s.name} style={{
              background: "#FFFFFF", borderRadius: 12, padding: 14,
              boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 15, color: T.espresso }}>{s.name}</strong>
                <span style={{ fontSize: 12, color: T.muted }}>{s.benefit}</span>
              </div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{s.note}</div>
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 12, color: T.muted, fontStyle: "italic" }}>
            Discuss with your GP or a registered nutritionist before starting any supplement.
          </div>
        </div>

        <div style={{ height: 18 }} />
      </article>

      <ReviewerNote>
        Skin and hair content branches on cycle phase (follicular / ovulatory / luteal / menstrual) or
        on the meno-stages bucket. Skin and hair logs read from the SkinHairLogs entity if present.
        Hormonal acne tracker reads SymptomLogs and maps to cycle days using the user's last_period_start_date.
      </ReviewerNote>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────
function DemoPill({ subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 11px", borderRadius: 999,
        background: T.goldSoft, color: T.gold,
        fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
        border: `1px solid ${T.gold}`,
      }}>
        <Sparkles className="w-3 h-3" /> Design Preview — Health Corner
      </span>
      <span style={{ color: "#9B8B7A", fontSize: 12 }}>{subtitle}</span>
    </div>
  );
}
function canvasStyle() {
  return {
    backgroundColor: T.paper, color: T.espresso, borderRadius: 18,
    overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
    border: `1px solid rgba(212,175,55,0.22)`,
    fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
  };
}
function SectionHeader({ children }) {
  return (
    <div style={{
      padding: "22px 22px 8px",
      fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
      color: T.muted, fontWeight: 700,
    }}>{children}</div>
  );
}
function BriefCard({ title, body }) {
  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      borderRadius: 12, padding: 16,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso, marginBottom: 6 }}>{title}</div>
      <p style={{
        margin: 0, fontSize: 14.5, lineHeight: 1.7,
        color: T.espresso,
        fontFamily: '"Fraunces", Georgia, serif',
      }}>{body}</p>
    </div>
  );
}
function DotRow({ data, colourFor, emptyLabel }) {
  const hasAny = data.some((x) => x.v != null);
  if (!hasAny) {
    return (
      <div style={{
        background: "#FFFFFF", borderRadius: 12, padding: 16, textAlign: "center",
        boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      }}>
        <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 12 }}>No logs yet this week.</div>
        <Link to="/Today" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 999,
          background: T.espresso, color: T.cream, fontSize: 13, fontWeight: 600,
          textDecoration: "none",
        }}><Plus className="w-4 h-4" aria-hidden="true" /> {emptyLabel}</Link>
      </div>
    );
  }
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 12, padding: "14px 16px",
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      display: "flex", gap: 10, alignItems: "center", justifyContent: "space-around",
    }}>
      {data.map(({ d, v }) => (
        <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            title={`${d} · ${v ?? "no log"}`}
            style={{
              width: 22, height: 22, borderRadius: 999,
              background: v != null ? colourFor(v) : "transparent",
              border: v != null ? "none" : `1px dashed ${T.border}`,
            }}
          />
          <div style={{ fontSize: 10.5, color: T.muted, letterSpacing: 0.3 }}>
            {new Date(d).toLocaleDateString("en-GB", { weekday: "short" })}
          </div>
        </div>
      ))}
    </div>
  );
}
function ReviewerNote({ children }) {
  return (
    <div style={{
      marginTop: 14, padding: "12px 14px",
      background: "rgba(212,175,55,0.08)",
      border: `1px dashed rgba(212,175,55,0.45)`,
      borderRadius: 10, fontSize: 12.5, lineHeight: 1.6, color: "#C4B69E",
    }}>
      <strong style={{ color: T.gold }}>Notes for review:</strong> {children}
    </div>
  );
}

function skinTint(v) {
  // 1 = muted, 3 = sage-light, 5 = sage. Linear interpolation.
  if (v == null) return "transparent";
  const x = Math.max(1, Math.min(5, Math.round(v)));
  const stops = ["#D4CEC8", "#D8DECC", "#C8DDC8", "#A8C9A8", "#8FAF8F"];
  return stops[x - 1];
}
function hairTint(v) {
  // 1 = minimal shedding (sage), 5 = heavy shedding (rose).
  if (v == null) return "transparent";
  const x = Math.max(1, Math.min(5, Math.round(v)));
  const stops = ["#8FAF8F", "#C8DDC8", "#E8D5A0", "#E8B4B8", "#C4636F"];
  return stops[x - 1];
}
