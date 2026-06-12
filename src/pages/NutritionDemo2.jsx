// NutritionDemo2 — Nutrition UX direction: "DAILY HUB (one screen + bottom-sheet spokes)"
// Self-contained DEMO (useState/useEffect only). NO base44, NO entities, NO network, NO props.
// Mock data from ./nutritionDemoShared; brand tokens from @/components/journal/Editorial.
import { useState } from "react";
import {
  ME, TODAY, HYDRATION, MEALS, RECENTS, FAVOURITES, LOG_METHODS, FOOD_SEARCH_SAMPLE,
  PLAN, MICROS, RECIPES, AI_RECIPE, MEAL_PLAN, SHOPPING, SHOP_META, PROGRESS, JESS,
  NOT_MEDICAL, FOOTER_LINE, pct, kcalLeft,
} from "./nutritionDemoShared";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  Plus, Check, UtensilsCrossed, Search, Clock3, Star, Camera, Mic, ScanLine,
  Target, BookOpen, CalendarDays, ShoppingBasket, TrendingUp, Sparkles, X,
} from "lucide-react";

// ── small shared atoms ──────────────────────────────────────────────────────
function Tag({ children }) {
  if (!children) return null;
  return (
    <span style={{
      fontFamily: UI, fontSize: 9.5, letterSpacing: 0.5, color: T.muted,
      border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "2px 7px",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function AddChip({ name, kcal, tag }) {
  const [added, setAdded] = useState(false);
  return (
    <button onClick={() => setAdded((v) => !v)} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%",
      background: added ? T.ink : T.paperHi, color: added ? T.paper : T.ink,
      border: `1px solid ${added ? T.ink : T.paperDeep}`, borderRadius: 12,
      padding: "11px 13px", cursor: "pointer", textAlign: "left", marginBottom: 8,
    }}>
      <span style={{
        width: 26, height: 26, flexShrink: 0, borderRadius: 999,
        background: added ? T.paper : T.ink, color: added ? T.ink : T.paper,
        display: "grid", placeItems: "center",
      }}>{added ? <Check size={15} /> : <Plus size={15} />}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, display: "block", lineHeight: 1.2 }}>{name}</span>
        <span style={{ fontFamily: UI, fontSize: 10, color: added ? T.wax : T.muted, letterSpacing: 0.3 }}>
          {kcal} kcal{tag ? ` · ${tag}` : ""}
        </span>
      </span>
      <span style={{ fontFamily: UI, fontSize: 10, letterSpacing: 0.6, color: added ? T.wax : T.muted, textTransform: "uppercase" }}>
        {added ? "added" : "add"}
      </span>
    </button>
  );
}

// ── the hero "today's plate" arc + macro rings ──────────────────────────────
function PlateArc() {
  const energyPct = pct(TODAY.energy.had, TODAY.energy.guide);
  const R = 78, C = 2 * Math.PI * R;
  const dash = (C * energyPct) / 100;
  const macros = [
    { k: "protein", label: "Protein", d: TODAY.protein },
    { k: "fibre", label: "Fibre", d: TODAY.fibre },
    { k: "iron", label: "Iron", d: TODAY.iron },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 190, height: 190 }}>
        <svg width={190} height={190} viewBox="0 0 190 190" style={{ transform: "rotate(-90deg)" }} aria-hidden>
          <circle cx={95} cy={95} r={R} fill="none" stroke={T.paperDeep} strokeWidth={9} />
          <circle cx={95} cy={95} r={R} fill="none" stroke={T.gold} strokeWidth={9}
            strokeLinecap="round" strokeDasharray={`${dash} ${C}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <Script size={46} carve>today</Script>
            <div style={{ fontFamily: UI, fontSize: 10, letterSpacing: 0.8, color: T.muted, marginTop: -4 }}>
              {TODAY.energy.had} of {TODAY.energy.guide} {TODAY.energy.unit}
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.gold, marginTop: 1 }}>
              room for {kcalLeft()} more
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 12 }}>
        {macros.map((m) => (
          <div key={m.k} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1 }}>
              {m.d.had}<span style={{ fontSize: 11, color: T.muted }}>/{m.d.guide}{m.d.unit}</span>
            </div>
            <div style={{ fontFamily: UI, fontSize: 9, letterSpacing: 0.8, color: T.muted, textTransform: "uppercase", marginTop: 3 }}>{m.label}</div>
            <div style={{ width: 44, height: 3, background: T.paperDeep, borderRadius: 999, margin: "4px auto 0", overflow: "hidden" }}>
              <div style={{ width: `${pct(m.d.had, m.d.guide)}%`, height: "100%", background: T.sage }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── the bottom sheet shell ──────────────────────────────────────────────────
function Sheet({ title, eyebrow, onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column",
      justifyContent: "flex-end",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,8,5,0.42)" }} />
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{
        position: "relative", ...PAPER_BG, backgroundColor: T.paper,
        borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "86%",
        display: "flex", flexDirection: "column", boxShadow: "0 -18px 50px rgba(11,8,5,0.32)",
        borderTop: `1px solid ${T.paperDeep}`,
      }}>
        {/* handle + header on the dusk surface */}
        <div style={{
          background: T.dusk, borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: "10px 18px 14px", position: "relative",
        }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(244,239,227,0.4)", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              {eyebrow ? <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.6, color: T.wax, textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>{eyebrow}</div> : null}
              <Script size={36} color={T.paper} carve={false}>{title}</Script>
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              width: 34, height: 34, borderRadius: 999, flexShrink: 0,
              background: "rgba(244,239,227,0.12)", border: "1px solid rgba(244,239,227,0.3)",
              color: T.paper, display: "grid", placeItems: "center", cursor: "pointer",
            }}><X size={17} /></button>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: "16px 18px 26px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── per-spoke sheet bodies ───────────────────────────────────────────────────
function LogBody() {
  const [method, setMethod] = useState(null);
  const m = LOG_METHODS.find((x) => x.id === method);
  const captureNote = {
    photo: "Camera ready — snap your plate and we'll estimate it. No weighing, no fuss.",
    voice: 'Hold and speak — "a bowl of porridge with berries" — we\'ll log it.',
    barcode: "Point at the packet barcode; the UK food database fills the rest in.",
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
        {LOG_METHODS.map((lm) => {
          const Icon = { search: Search, recent: Clock3, fave: Star, photo: Camera, voice: Mic, barcode: ScanLine }[lm.id];
          const on = method === lm.id;
          return (
            <button key={lm.id} onClick={() => setMethod(on ? null : lm.id)} style={{
              background: on ? T.ink : T.paperHi, color: on ? T.paper : T.ink,
              border: `1px solid ${on ? T.ink : T.paperDeep}`, borderRadius: 13,
              padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6,
            }}>
              <Icon size={19} />
              <span style={{ fontFamily: UI, fontSize: 10, letterSpacing: 0.3, textAlign: "center", lineHeight: 1.2 }}>{lm.label}</span>
            </button>
          );
        })}
      </div>

      {!method && (
        <Hand size={17} color={T.muted}>Pick a way in — most days a recent or a favourite is one tap.</Hand>
      )}

      {method === "search" && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: T.paperHi,
            border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", marginBottom: 12,
          }}>
            <Search size={15} color={T.muted} />
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>spin</span>
            <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginLeft: "auto" }}>{m.hint}</span>
          </div>
          {FOOD_SEARCH_SAMPLE.map((f) => (
            <AddChip key={f.id} name={f.name} kcal={f.kcal} tag={`${f.per}${f.tag ? " · " + f.tag : ""}`} />
          ))}
        </div>
      )}

      {method === "recent" && RECENTS.map((r) => <AddChip key={r.id} name={r.name} kcal={r.kcal} tag={r.tag} />)}
      {method === "fave" && FAVOURITES.map((f) => <AddChip key={f.id} name={f.name} kcal={f.kcal} tag={f.tag} />)}

      {(method === "photo" || method === "voice" || method === "barcode") && (
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 18, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, background: T.dusk, color: T.paper, display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
            {method === "photo" ? <Camera size={22} /> : method === "voice" ? <Mic size={22} /> : <ScanLine size={22} />}
          </div>
          <Hand size={17}>{captureNote[method]}</Hand>
          <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase", marginTop: 10 }}>capture mode · available</div>
        </div>
      )}
    </div>
  );
}

function PlanBody() {
  return (
    <div>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <Eyebrow mb={4}>Daily energy · a guide, never a cap</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 30, color: T.ink, lineHeight: 1 }}>{PLAN.energyGuide} <span style={{ fontSize: 15, color: T.muted }}>kcal</span></div>
        <Hand size={16} color={T.muted} style={{ marginTop: 6 }}>{PLAN.why}</Hand>
      </div>
      <Eyebrow mb={10}>What your body's asking for</Eyebrow>
      {PLAN.targets.map((t, i) => (
        <div key={t.key}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink }}>{t.label}</span>
            <span style={{ fontFamily: UI, fontSize: 13, color: T.gold, letterSpacing: 0.4 }}>{t.guide}</span>
          </div>
          <Hand size={15} color={T.muted} style={{ marginTop: 1 }}>{t.why}</Hand>
          {i < PLAN.targets.length - 1 && <Rule mt={11} mb={11} />}
        </div>
      ))}
    </div>
  );
}

function RecipesBody() {
  const [gen, setGen] = useState(false);
  return (
    <div>
      {RECIPES.map((r) => (
        <div key={r.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.15 }}>{r.title}</span>
            <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>{r.mins} min · {r.serves}</span>
          </div>
          <Hand size={15} color={T.muted} style={{ marginTop: 3 }}>{r.why}</Hand>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
            {r.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
          {r.need.length > 0 && (
            <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 8, letterSpacing: 0.3 }}>
              You have most of it — just need: <span style={{ color: T.crimson }}>{r.need.join(", ")}</span>
            </div>
          )}
        </div>
      ))}

      <button onClick={() => setGen((v) => !v)} style={{
        display: "flex", alignItems: "center", gap: 9, width: "100%", justifyContent: "center",
        background: gen ? T.paperHi : T.ink, color: gen ? T.ink : T.paper,
        border: `1px solid ${T.ink}`, borderRadius: 13, padding: "13px", cursor: "pointer", marginTop: 4,
      }}>
        <Sparkles size={16} />
        <span style={{ fontFamily: UI, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 700 }}>
          {gen ? "Hide" : "Generate from what's in"}
        </span>
      </button>

      {gen && (
        <div style={{ background: T.dusk, color: T.paper, borderRadius: 14, padding: 16, marginTop: 12 }}>
          <Eyebrow mb={4} color={T.wax}>Jess cooked this up</Eyebrow>
          <Script size={30} color={T.paper} carve={false}>{AI_RECIPE.title}</Script>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.wax, letterSpacing: 0.4, marginTop: 2 }}>{AI_RECIPE.mins} min · serves {AI_RECIPE.serves}</div>
          <Hand size={16} color={T.wax} style={{ marginTop: 8 }}>{AI_RECIPE.why}</Hand>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1, color: T.wax, textTransform: "uppercase", marginBottom: 6 }}>You'll need</div>
            {AI_RECIPE.ingredients.map((ing) => (
              <div key={ing} style={{ fontFamily: SERIF, fontSize: 15, color: T.paper, padding: "2px 0", opacity: 0.95 }}>· {ing}</div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1, color: T.wax, textTransform: "uppercase", marginBottom: 6 }}>Method</div>
            {AI_RECIPE.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.gold }}>{i + 1}</span>
                <span style={{ fontFamily: SERIF, fontSize: 15, color: T.paper, opacity: 0.95, lineHeight: 1.3 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.wax, letterSpacing: 0.3, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(244,239,227,0.18)" }}>{AI_RECIPE.nutrition}</div>
        </div>
      )}
    </div>
  );
}

function MealPlanBody() {
  return (
    <div>
      <Hand size={16} color={T.muted} style={{ marginBottom: 14 }}>{MEAL_PLAN.intro}</Hand>
      {MEAL_PLAN.days.map((d, i) => (
        <div key={d.day}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 36, flexShrink: 0 }}>
              <Script size={24} carve>{d.day}</Script>
            </div>
            <div style={{ flex: 1, fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.45 }}>
              <div><span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase" }}>B · </span>{d.b}</div>
              <div><span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase" }}>L · </span>{d.l}</div>
              <div><span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase" }}>D · </span>{d.d}</div>
            </div>
          </div>
          {i < MEAL_PLAN.days.length - 1 && <Rule mt={11} mb={11} />}
        </div>
      ))}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: 13, marginTop: 16 }}>
        <Hand size={16} color={T.muted}>{MEAL_PLAN.note}</Hand>
      </div>
    </div>
  );
}

function ShopBody() {
  return (
    <div>
      <div style={{ display: "flex", gap: 18, marginBottom: 16 }}>
        {[["Items", SHOP_META.items], ["Estimate", SHOP_META.est], ["For", `${SHOP_META.forDays} days`]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: SERIF, fontSize: 20, color: T.ink, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: UI, fontSize: 9, letterSpacing: 0.8, color: T.muted, textTransform: "uppercase", marginTop: 2 }}>{k}</div>
          </div>
        ))}
      </div>
      {SHOPPING.map((aisle) => (
        <div key={aisle.aisle} style={{ marginBottom: 14 }}>
          <Eyebrow mb={8}>{aisle.aisle}</Eyebrow>
          {aisle.items.map((it) => (
            <label key={it} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", cursor: "pointer" }}>
              <span style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${T.paperDeep}`, flexShrink: 0 }} />
              <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{it}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProgressBody() {
  const s = PROGRESS.spark;
  const max = Math.max(...s), min = Math.min(...s);
  const W = 320, H = 70, pad = 6;
  const pts = s.map((v, i) => {
    const x = pad + (i * (W - pad * 2)) / (s.length - 1);
    const y = pad + (H - pad * 2) * (1 - (v - min) / (max - min || 1));
    return [x, y];
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - pad} L${pts[0][0].toFixed(1)},${H - pad} Z`;
  return (
    <div>
      <Hand size={17} color={T.muted} style={{ marginBottom: 14 }}>{PROGRESS.framing}</Hand>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <Eyebrow mb={8}>Nourishment, this week</Eyebrow>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
          <path d={area} fill={T.sage} opacity={0.16} />
          <path d={line} fill="none" stroke={T.sage} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill={T.ink} />)}
        </svg>
        <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, letterSpacing: 0.5, marginTop: 4, textAlign: "center" }}>
          a gentle line — not a target to chase
        </div>
      </div>
      {PROGRESS.patterns.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 11, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, marginTop: 7, flexShrink: 0, background: p.tone === "good" ? T.sage : T.gold }} />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1.15 }}>{p.title}</div>
            <Hand size={15} color={T.muted} style={{ marginTop: 1 }}>{p.detail}</Hand>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsBody() {
  return (
    <div>
      {JESS.insights.map((ins, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.2 }}>{ins.title}</div>
          <Hand size={16} color={T.muted} style={{ marginTop: 3 }}>{ins.body}</Hand>
          {i < JESS.insights.length - 1 && <Rule mt={14} />}
        </div>
      ))}
      <Rule mt={4} mb={16} />
      <Eyebrow mb={12}>Gentle nudges for your stage</Eyebrow>
      {MICROS.map((mi) => (
        <div key={mi.key} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 13, padding: 13, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{mi.label}</span>
            <span style={{ fontFamily: UI, fontSize: 11, color: T.gold }}>{mi.had}/{mi.guide} {mi.unit}</span>
          </div>
          <div style={{ width: "100%", height: 3, background: T.paperDeep, borderRadius: 999, margin: "7px 0", overflow: "hidden" }}>
            <div style={{ width: `${pct(mi.had, mi.guide)}%`, height: "100%", background: T.sage }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
            {mi.foods.map((f) => <Tag key={f}>{f}</Tag>)}
          </div>
          <Hand size={15} color={T.muted}>{mi.note}</Hand>
        </div>
      ))}
    </div>
  );
}

function TodayBody() {
  return (
    <div>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <Hand size={17}>{TODAY.warmline}</Hand>
      </div>
      {MEALS.map((meal) => {
        const planned = !meal.title;
        return (
          <div key={meal.id}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 64, flexShrink: 0 }}>
                <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.8, color: T.muted, textTransform: "uppercase" }}>{meal.slot}</div>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.gold }}>{meal.time || "later"}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {planned ? (
                  <>
                    <div style={{ fontFamily: SERIF, fontSize: 17, color: T.muted, fontStyle: "italic" }}>Planned · {meal.planned}</div>
                    <div style={{ fontFamily: UI, fontSize: 10, color: T.gold, letterSpacing: 0.4, marginTop: 2 }}>not logged yet</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.2 }}>{meal.title}</div>
                    <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 2 }}>
                      {meal.kcal} kcal · {meal.protein}g protein{meal.note ? ` · ${meal.note}` : ""}
                    </div>
                  </>
                )}
              </div>
            </div>
            <Rule mt={12} mb={12} />
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "13px 15px" }}>
        <div>
          <Eyebrow mb={3}>Hydration</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{HYDRATION.cups} of {HYDRATION.guide} cups</div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 1 }}>last at {HYDRATION.lastAt}</div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: HYDRATION.guide }).map((_, i) => (
            <span key={i} style={{ width: 9, height: 20, borderRadius: 3, background: i < HYDRATION.cups ? T.sage : T.paperDeep }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── spoke registry ──────────────────────────────────────────────────────────
const SPOKES = [
  { id: "plan", label: "My Plan", sub: "What your body's asking for", Icon: Target },
  { id: "recipes", label: "Recipes", sub: "Cook what you have in", Icon: BookOpen },
  { id: "mealplan", label: "Meal Plan", sub: "A gentle week", Icon: CalendarDays },
  { id: "shop", label: "Shop", sub: "Sorted by aisle", Icon: ShoppingBasket },
  { id: "progress", label: "Progress", sub: "Patterns, not scores", Icon: TrendingUp },
  { id: "insights", label: "Insights", sub: "For your stage", Icon: Sparkles },
];

const SHEET_META = {
  log: { title: "log a meal", eyebrow: "Add in seconds", Body: LogBody },
  today: { title: "today", eyebrow: "Your plate so far", Body: TodayBody },
  plan: { title: "my plan", eyebrow: "A guide, never a cap", Body: PlanBody },
  recipes: { title: "recipes", eyebrow: "Cook what you have in", Body: RecipesBody },
  mealplan: { title: "the week", eyebrow: "A gentle plan", Body: MealPlanBody },
  shop: { title: "the list", eyebrow: "Sorted by aisle", Body: ShopBody },
  progress: { title: "progress", eyebrow: "Patterns, not scores", Body: ProgressBody },
  insights: { title: "insights", eyebrow: "Nourishment for your stage", Body: InsightsBody },
};

// ── page ─────────────────────────────────────────────────────────────────────
export default function NutritionDemo2() {
  useEditorialFonts();
  const [openSheet, setOpenSheet] = useState(null);
  const close = () => setOpenSheet(null);
  const meta = openSheet ? SHEET_META[openSheet] : null;
  const nextRecipe = RECIPES[1]; // Salmon traybake — matches MEALS[3].planned

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />
      <div style={{ maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden", minHeight: "100vh" }}>

        {/* top banner */}
        <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
          Nutrition · Daily Hub — mock data
        </div>

        <div style={{ padding: "18px 18px 0" }}>
          {/* greeting */}
          <Eyebrow mb={4}>{ME.greetingTime}, {ME.name} · {ME.stageLabel} · {ME.cyclePhase}</Eyebrow>
          <Script size={42} carve>your plate today</Script>

          {/* hero arc */}
          <div style={{ marginTop: 14, marginBottom: 6 }}>
            <PlateArc />
          </div>

          {/* Jess's one line */}
          <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "15px 16px", marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
                <Sparkles size={13} color={T.dusk} />
              </span>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
            </div>
            <Hand size={18} color={T.paper}>{JESS.todayLine}</Hand>
          </div>

          {/* ONE primary action */}
          <button onClick={() => setOpenSheet("log")} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
            background: T.crimson, color: T.paper, border: "none", borderRadius: 16,
            padding: "17px", cursor: "pointer", marginTop: 14, boxShadow: "0 6px 18px rgba(188,46,39,0.25)",
          }}>
            <UtensilsCrossed size={19} />
            <span style={{ fontFamily: UI, fontSize: 14, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Log a meal</span>
          </button>

          {/* ONE suggested next action */}
          <button onClick={() => setOpenSheet("recipes")} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
            padding: "13px 15px", cursor: "pointer", marginTop: 10,
          }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: T.ink, color: T.paper, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <UtensilsCrossed size={17} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 1, color: T.muted, textTransform: "uppercase", display: "block" }}>Suggested · dinner</span>
              <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, display: "block", lineHeight: 1.15 }}>{nextRecipe.title}</span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{nextRecipe.mins} min · {nextRecipe.why}</span>
            </span>
          </button>

          {/* "Today" detail opener */}
          <button onClick={() => setOpenSheet("today")} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            background: "transparent", border: "none", borderBottom: `1px solid ${T.paperDeep}`,
            padding: "13px 2px", cursor: "pointer", marginTop: 14,
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>See everything you've eaten today</span>
            <span style={{ fontFamily: UI, fontSize: 18, color: T.muted, lineHeight: 1 }}>+</span>
          </button>

          {/* quiet spoke grid */}
          <Eyebrow mb={10} color={T.muted}>{/* spacer label */}<span style={{ display: "inline-block", marginTop: 18 }}>Everything else, tucked away</span></Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SPOKES.map((sp) => {
              const { Icon } = sp;
              return (
                <button key={sp.id} onClick={() => setOpenSheet(sp.id)} style={{
                  display: "flex", flexDirection: "column", gap: 8, textAlign: "left",
                  background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
                  padding: "14px 14px 13px", cursor: "pointer",
                }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
                    <Icon size={16} color={T.ink} />
                  </span>
                  <span>
                    <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, display: "block", lineHeight: 1.1 }}>{sp.label}</span>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{sp.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* footer */}
          <Rule mt={22} mb={12} />
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3, textAlign: "center" }}>{NOT_MEDICAL}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, textAlign: "center", marginTop: 4, paddingBottom: 16 }}>{FOOTER_LINE}</div>
        </div>

        {/* the bottom sheet */}
        {meta && (
          <Sheet title={meta.title} eyebrow={meta.eyebrow} onClose={close}>
            <meta.Body />
          </Sheet>
        )}
      </div>
    </div>
  );
}
