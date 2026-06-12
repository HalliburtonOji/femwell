// NutritionDemo5 — "EDITORIAL MAGAZINE" UX direction for FemWell Nutrition.
//
// METAPHOR: a segmented magazine. Each segment is an immersive FULL-BLEED
// editorial SPREAD that fills the screen — a cover-style CSS image-block, a big
// Ephesis script title, ONE feature laid out with strong typographic hierarchy
// and ONE call-to-action. A top segmented control + page dots move between
// spreads. You read a spread (one rich finished page, one action), never a grid
// of competing controls — so decision fatigue dies.
//
// Self-contained DEMO: useState/useEffect ONLY. No base44, no entities, no
// network, no props. All data imported from ./nutritionDemoShared.
import { useState } from "react";
import {
  ME, TODAY, HYDRATION, MEALS, RECENTS, FAVOURITES, LOG_METHODS,
  FOOD_SEARCH_SAMPLE, PLAN, MICROS, RECIPES, AI_RECIPE, MEAL_PLAN, SHOPPING,
  SHOP_META, PROGRESS, JESS, NOT_MEDICAL, FOOTER_LINE, pct, kcalLeft,
} from "./nutritionDemoShared";
import {
  T, SERIF, UI, SCRIPT, HAND, Eyebrow, Rule, Script, InkFilter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  Droplet, Camera, Mic, ScanLine, Search, Sparkles, ChevronRight,
  Heart, Leaf, X, Plus, Clock,
} from "lucide-react";

// ── the five magazine spreads (bundle the 8 surfaces) ──────────────────────
const SPREADS = [
  { id: "plate",  folio: "01", kicker: "Today",            title: "The Plate" },
  { id: "kitchen",folio: "02", kicker: "Recipes & Jess",   title: "The Kitchen" },
  { id: "pantry", folio: "03", kicker: "Meal plan & shop", title: "The Pantry" },
  { id: "body",   folio: "04", kicker: "My plan & insights",title: "The Body" },
  { id: "week",   folio: "05", kicker: "Progress",         title: "The Week" },
];

// ── tiny shared bits ───────────────────────────────────────────────────────
function Standfirst({ children, color = T.inkSoft }) {
  return (
    <div style={{ fontFamily: HAND, fontStyle: "italic", fontWeight: 600, fontSize: 17,
      lineHeight: 1.4, color, marginTop: 8 }}>{children}</div>
  );
}

function TagRow({ tags, color = T.muted }) {
  if (!tags || !tags.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {tags.map((t) => (
        <span key={t} style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700,
          letterSpacing: 0.7, textTransform: "uppercase", color,
          border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "2px 8px" }}>{t}</span>
      ))}
    </div>
  );
}

// One big magazine CTA — the single action on a spread.
function CTA({ children, onClick, icon: Icon }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 9, marginTop: 18,
      background: T.ink, color: T.paper, border: "none", borderRadius: 2,
      padding: "13px 20px", fontFamily: UI, fontSize: 12, fontWeight: 700,
      letterSpacing: 1.3, textTransform: "uppercase", cursor: "pointer", width: "100%",
      justifyContent: "center",
    }}>
      {Icon && <Icon size={15} />}{children}
    </button>
  );
}

// A soft progress meter — "room to nourish", never a scoreboard bar.
function Meter({ had, guide, unit, label }) {
  const p = pct(had, guide);
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{label}</span>
        <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, letterSpacing: 0.4 }}>
          {had}<span style={{ color: T.paperDeep }}> / {guide} {unit}</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", borderRadius: 999,
          background: `linear-gradient(90deg, ${T.gold}, ${T.crimson})`, opacity: 0.78 }} />
      </div>
    </div>
  );
}

// ── cover image-blocks (CSS gradients/shapes in T tokens — no photos) ───────
function Cover({ kind }) {
  const base = { position: "relative", height: 132, borderRadius: 3, overflow: "hidden",
    border: `1px solid ${T.paperDeep}` };
  const grads = {
    plate:   `radial-gradient(120% 90% at 22% 18%, ${T.wax} 0%, rgba(239,227,201,0) 55%),
              radial-gradient(80% 80% at 82% 88%, ${T.blush}55 0%, rgba(232,180,184,0) 60%),
              linear-gradient(135deg, ${T.paperHi}, ${T.paperDeep})`,
    kitchen: `radial-gradient(90% 90% at 80% 12%, ${T.gold}44 0%, rgba(168,137,63,0) 55%),
              linear-gradient(160deg, ${T.dusk}, ${T.inkSoft})`,
    pantry:  `repeating-linear-gradient(90deg, ${T.paperHi} 0 18px, ${T.wax} 18px 36px),
              linear-gradient(180deg, ${T.paperHi}, ${T.paperDeep})`,
    body:    `radial-gradient(70% 120% at 50% 0%, ${T.blush}66 0%, rgba(232,180,184,0) 60%),
              radial-gradient(60% 90% at 50% 100%, ${T.sage}55 0%, rgba(143,175,143,0) 60%),
              linear-gradient(180deg, ${T.paperHi}, ${T.paperDeep})`,
    week:    `linear-gradient(160deg, ${T.dusk}, ${T.muted})`,
  };
  const dark = kind === "kitchen" || kind === "week";
  return (
    <div style={{ ...base, backgroundImage: grads[kind], backgroundColor: T.paperHi }}>
      {/* abstract editorial shapes */}
      {kind === "week" && (
        <svg viewBox="0 0 320 132" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <polyline points="0,96 53,70 106,104 160,52 213,82 266,40 320,66"
            fill="none" stroke={T.wax} strokeWidth="2.5" strokeLinejoin="round" opacity="0.8" />
        </svg>
      )}
      {kind === "kitchen" && (
        <Leaf size={64} color={T.wax} style={{ position: "absolute", right: 16, bottom: 12, opacity: 0.5 }} />
      )}
      {kind === "body" && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Heart size={52} color={T.crimson} style={{ opacity: 0.55 }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 14, bottom: 11 }}>
        <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6,
          textTransform: "uppercase", color: dark ? T.wax : T.muted, opacity: 0.92 }}>
          FemWell Nutrition
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPREAD 1 — THE PLATE (Today + Hydration + Meals; CTA opens quick-add)
// ─────────────────────────────────────────────────────────────────────────────
function PlateSpread({ openLog }) {
  return (
    <div>
      <Cover kind="plate" />
      <div style={{ marginTop: 14 }}>
        <Script size={50}>The Plate</Script>
      </div>
      <Standfirst>{TODAY.warmline}</Standfirst>

      {/* hydration — gentle, no guilt */}
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <Droplet size={16} color={T.gold} />
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: HYDRATION.guide }).map((_, i) => (
            <span key={i} style={{ width: 13, height: 18, borderRadius: "0 0 7px 7px",
              border: `1px solid ${T.paperDeep}`,
              background: i < HYDRATION.cups ? T.gold : "transparent", opacity: i < HYDRATION.cups ? 0.7 : 1 }} />
          ))}
        </div>
        <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3 }}>
          {HYDRATION.cups} of {HYDRATION.guide} · last {HYDRATION.lastAt}
        </span>
      </div>

      <Rule c={T.paperDeep} mt={18} mb={14} />
      <Eyebrow mb={10}>The day so far</Eyebrow>

      {/* meals list — magazine column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {MEALS.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 52, flexShrink: 0 }}>
              <div style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 1,
                textTransform: "uppercase", color: T.muted }}>{m.slot}</div>
              <div style={{ fontFamily: UI, fontSize: 10, color: T.paperDeep }}>{m.time || "—"}</div>
            </div>
            <div style={{ flex: 1 }}>
              {m.title ? (
                <>
                  <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.25 }}>{m.title}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, lineHeight: 1.4 }}>
                    {m.items.join(" · ")}
                  </div>
                  <div style={{ fontFamily: UI, fontSize: 9.5, color: T.gold, letterSpacing: 0.6,
                    textTransform: "uppercase", marginTop: 3 }}>{m.kcal} kcal · {m.note}</div>
                </>
              ) : (
                <div style={{ fontFamily: HAND, fontStyle: "italic", fontSize: 15, color: T.muted }}>
                  Planned — {m.planned}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CTA onClick={openLog} icon={Plus}>Log a meal</CTA>
    </div>
  );
}

// Quick-add sheet — RECENTS / FAVOURITES / LOG_METHODS + FOOD_SEARCH_SAMPLE.
function QuickAdd({ onClose }) {
  const [q, setQ] = useState("");
  const showSearch = q.trim().length > 0;
  return (
    <div role="dialog" aria-modal="true" style={{
      position: "fixed", inset: 0, zIndex: 100, background: "rgba(11,8,5,0.42)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 430, maxHeight: "86vh", overflowY: "auto",
        background: T.paper, borderRadius: "14px 14px 0 0", padding: "16px 18px 26px",
        border: `1px solid ${T.paperDeep}`, ...PAPER_BG, backgroundColor: T.paper,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Eyebrow>Add to today</Eyebrow>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ marginTop: 6 }}><Script size={30}>Quick add</Script></div>

        {/* search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14,
          border: `1px solid ${T.paperDeep}`, borderRadius: 3, padding: "9px 11px", background: T.paperHi }}>
          <Search size={15} color={T.muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search UK foods… try “spin”"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent",
              fontFamily: SERIF, fontSize: 15, color: T.ink }} />
        </div>

        {showSearch ? (
          <div style={{ marginTop: 12 }}>
            <Eyebrow mb={8}>Results</Eyebrow>
            {FOOD_SEARCH_SAMPLE.map((f) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 0", borderBottom: `1px solid ${T.paperDeep}` }}>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{f.name}</div>
                  <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, letterSpacing: 0.4 }}>
                    {f.per} · {f.kcal} kcal{f.tag ? ` · ${f.tag}` : ""}
                  </div>
                </div>
                <Plus size={17} color={T.crimson} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* log methods */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
              {LOG_METHODS.map((m) => {
                const Icon = m.id === "photo" ? Camera : m.id === "voice" ? Mic
                  : m.id === "barcode" ? ScanLine : m.id === "search" ? Search
                  : m.id === "fave" ? Heart : Clock;
                return (
                  <div key={m.id} style={{ border: `1px solid ${T.paperDeep}`, borderRadius: 3,
                    padding: "11px 12px", background: T.paperHi }}>
                    <Icon size={16} color={T.gold} />
                    <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, marginTop: 5 }}>{m.label}</div>
                    <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, letterSpacing: 0.3 }}>{m.hint}</div>
                  </div>
                );
              })}
            </div>

            {/* recents */}
            <div style={{ marginTop: 16 }}>
              <Eyebrow mb={8}>Recents · one tap to re-add</Eyebrow>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {RECENTS.map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: `1px solid ${T.paperDeep}` }}>
                  <div>
                    <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{r.name}</span>
                    {r.tag && <span style={{ fontFamily: UI, fontSize: 9, color: T.gold, letterSpacing: 0.5,
                      textTransform: "uppercase", marginLeft: 8 }}>{r.tag}</span>}
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>{r.kcal}</span>
                    <Plus size={15} color={T.crimson} />
                  </span>
                </div>
              ))}
            </div>

            {/* favourites */}
            <div style={{ marginTop: 16 }}>
              <Eyebrow mb={8}>Favourites · your go-tos</Eyebrow>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FAVOURITES.map((f) => (
                <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 6,
                  border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 11px",
                  fontFamily: SERIF, fontSize: 14, color: T.ink, background: T.paperHi }}>
                  {f.name} <Plus size={13} color={T.crimson} />
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPREAD 2 — THE KITCHEN (Recipes + AI generator)
// ─────────────────────────────────────────────────────────────────────────────
function KitchenSpread() {
  const [generated, setGenerated] = useState(false);
  return (
    <div>
      <Cover kind="kitchen" />
      <div style={{ marginTop: 14 }}><Script size={50}>The Kitchen</Script></div>
      <Standfirst>Cook what you already have in — gentle, iron-leaning ideas for your stage.</Standfirst>

      <Rule c={T.paperDeep} mt={18} mb={14} />
      <Eyebrow mb={12}>Saved recipes</Eyebrow>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {RECIPES.map((rc) => (
          <div key={rc.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.2 }}>{rc.title}</div>
              <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>
                {rc.mins} min · serves {rc.serves}
              </span>
            </div>
            <div style={{ fontFamily: HAND, fontStyle: "italic", fontSize: 14, color: T.inkSoft, marginTop: 2 }}>{rc.why}</div>
            <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 5, letterSpacing: 0.3 }}>
              <span style={{ color: T.sage, fontWeight: 700 }}>Have</span> {rc.have.join(", ")}
              {rc.need.length > 0 && (
                <> · <span style={{ color: T.crimson, fontWeight: 700 }}>Need</span> {rc.need.join(", ")}</>
              )}
            </div>
            <TagRow tags={rc.tags} />
          </div>
        ))}
      </div>

      {!generated && <CTA onClick={() => setGenerated(true)} icon={Sparkles}>Generate from what's in</CTA>}

      {/* AI recipe reveal */}
      {generated && (
        <div style={{ marginTop: 18, border: `1px solid ${T.gold}`, borderRadius: 3,
          padding: "16px 16px 18px", background: T.paperHi }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={15} color={T.gold} />
            <Eyebrow color={T.gold}>Jess made this from your cupboard</Eyebrow>
          </div>
          <div style={{ marginTop: 6 }}><Script size={28}>{AI_RECIPE.title}</Script></div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 4 }}>
            {AI_RECIPE.mins} min · serves {AI_RECIPE.serves}
          </div>
          <Standfirst>{AI_RECIPE.why}</Standfirst>

          <div style={{ marginTop: 14 }}><Eyebrow mb={6}>Ingredients</Eyebrow></div>
          <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.6 }}>
            {AI_RECIPE.ingredients.join(" · ")}
          </div>

          <div style={{ marginTop: 12 }}><Eyebrow mb={6}>Method</Eyebrow></div>
          <ol style={{ margin: 0, paddingLeft: 18, fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5 }}>
            {AI_RECIPE.steps.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
          </ol>

          <div style={{ marginTop: 12, fontFamily: UI, fontSize: 10, color: T.gold, letterSpacing: 0.5,
            textTransform: "uppercase", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 10 }}>
            {AI_RECIPE.nutrition}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPREAD 3 — THE PANTRY (Meal plan week + Shopping by aisle)
// ─────────────────────────────────────────────────────────────────────────────
function PantrySpread() {
  return (
    <div>
      <Cover kind="pantry" />
      <div style={{ marginTop: 14 }}><Script size={50}>The Pantry</Script></div>
      <Standfirst>{MEAL_PLAN.intro}</Standfirst>

      <Rule c={T.paperDeep} mt={18} mb={12} />
      <Eyebrow mb={10}>The week</Eyebrow>

      {/* meal-plan grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0,
        border: `1px solid ${T.paperDeep}`, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 1fr",
          fontFamily: UI, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
          color: T.muted, background: T.paperHi, padding: "6px 8px", gap: 6 }}>
          <span></span><span>Breakfast</span><span>Lunch</span><span>Dinner</span>
        </div>
        {MEAL_PLAN.days.map((d, i) => (
          <div key={d.day} style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 1fr", gap: 6,
            padding: "8px", borderTop: `1px solid ${T.paperDeep}`,
            background: i % 2 ? "transparent" : T.paperHi }}>
            <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: T.crimson }}>{d.day}</span>
            <span style={{ fontFamily: SERIF, fontSize: 12.5, color: T.ink, lineHeight: 1.25 }}>{d.b}</span>
            <span style={{ fontFamily: SERIF, fontSize: 12.5, color: T.ink, lineHeight: 1.25 }}>{d.l}</span>
            <span style={{ fontFamily: SERIF, fontSize: 12.5, color: T.ink, lineHeight: 1.25 }}>{d.d}</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: HAND, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 8 }}>
        {MEAL_PLAN.note}
      </div>

      <Rule c={T.paperDeep} mt={18} mb={12} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Eyebrow mb={0}>The list, by aisle</Eyebrow>
        <span style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>
          {SHOP_META.items} items · {SHOP_META.est} · {SHOP_META.forDays} days
        </span>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {SHOPPING.map((col) => (
          <div key={col.aisle}>
            <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 1,
              textTransform: "uppercase", color: T.gold, marginBottom: 5 }}>{col.aisle}</div>
            {col.items.map((it) => (
              <div key={it} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <span style={{ width: 11, height: 11, border: `1px solid ${T.paperDeep}`, borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.25 }}>{it}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPREAD 4 — THE BODY (My Plan targets + Micros + Jess.todayLine)
// ─────────────────────────────────────────────────────────────────────────────
function BodySpread() {
  return (
    <div>
      <Cover kind="body" />
      <div style={{ marginTop: 14 }}><Script size={50}>The Body</Script></div>
      <Standfirst>{PLAN.why}</Standfirst>

      <Rule c={T.paperDeep} mt={18} mb={12} />
      <Eyebrow mb={12}>What your body's asking for</Eyebrow>

      {/* my-plan targets */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PLAN.targets.map((t) => (
          <div key={t.key} style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 86, flexShrink: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.1 }}>{t.label}</div>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.crimson, letterSpacing: 0.4 }}>{t.guide}</div>
            </div>
            <div style={{ fontFamily: HAND, fontStyle: "italic", fontSize: 14, color: T.inkSoft, lineHeight: 1.35, flex: 1 }}>
              {t.why}
            </div>
          </div>
        ))}
      </div>

      <Rule c={T.paperDeep} mt={18} mb={12} />
      <Eyebrow mb={12}>Gentle nudges for your stage</Eyebrow>

      {/* micros — stage-aware */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {MICROS.map((m) => (
          <div key={m.key}>
            <Meter had={m.had} guide={m.guide} unit={m.unit} label={m.label} />
            <div style={{ fontFamily: UI, fontSize: 9.5, color: T.sage, letterSpacing: 0.4,
              textTransform: "uppercase", marginTop: -4 }}>{m.foods.join(" · ")}</div>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, lineHeight: 1.4, marginTop: 2 }}>{m.note}</div>
          </div>
        ))}
      </div>

      {/* Jess voice */}
      <div style={{ marginTop: 20, borderLeft: `2px solid ${T.crimson}`, paddingLeft: 14 }}>
        <Eyebrow mb={6} color={T.crimson}>A word from Jess</Eyebrow>
        <div style={{ fontFamily: HAND, fontStyle: "italic", fontSize: 17, color: T.ink, lineHeight: 1.45 }}>
          {JESS.todayLine}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPREAD 5 — THE WEEK (Progress patterns + sparkline + Jess insights)
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, stroke, fill }) {
  const w = 320, h = 64, max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - 6 - ((v - min) / span) * (h - 16)]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 64, display: "block" }}>
      <polygon points={area} fill={fill} opacity="0.16" />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill={stroke} />)}
    </svg>
  );
}

function WeekSpread() {
  return (
    <div>
      <Cover kind="week" />
      <div style={{ marginTop: 14 }}><Script size={50}>The Week</Script></div>
      <Standfirst>{PROGRESS.framing}</Standfirst>

      <Rule c={T.paperDeep} mt={18} mb={12} />
      <Eyebrow mb={8}>Nourishment, gently traced</Eyebrow>
      <Sparkline data={PROGRESS.spark} stroke={T.crimson} fill={T.crimson} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, marginBottom: 4 }}>
        <Droplet size={13} color={T.gold} />
        <Eyebrow mb={0}>Hydration this week</Eyebrow>
      </div>
      <Sparkline data={PROGRESS.hydrationWeek} stroke={T.gold} fill={T.gold} />
      <div style={{ fontFamily: UI, fontSize: 9.5, color: T.paperDeep, letterSpacing: 1,
        textTransform: "uppercase", marginTop: 4, textAlign: "right" }}>
        no streaks · no scores · just the shape of your week
      </div>

      <Rule c={T.paperDeep} mt={18} mb={12} />
      <Eyebrow mb={12}>What we noticed</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PROGRESS.patterns.map((p) => (
          <div key={p.title} style={{ display: "flex", gap: 11 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, marginTop: 7, flexShrink: 0,
              background: p.tone === "good" ? T.sage : T.gold }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.2 }}>{p.title}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, lineHeight: 1.4 }}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <Rule c={T.paperDeep} mt={18} mb={12} />
      <Eyebrow mb={12}>Jess, on the longer view</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {JESS.insights.map((ins) => (
          <div key={ins.title}>
            <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.2 }}>{ins.title}</div>
            <div style={{ fontFamily: HAND, fontStyle: "italic", fontSize: 15, color: T.inkSoft, lineHeight: 1.4 }}>
              {ins.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE — segmented control + page dots + the active spread
// ─────────────────────────────────────────────────────────────────────────────
export default function NutritionDemo5() {
  useEditorialFonts();
  const [idx, setIdx] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const spread = SPREADS[idx];

  const left = kcalLeft();

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />

      {/* exact top banner */}
      <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5,
        letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
        Nutrition · Editorial Magazine — mock data
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 18px" }}>

        {/* masthead */}
        <div style={{ paddingTop: 16, paddingBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Eyebrow mb={0}>FemWell · Nutrition</Eyebrow>
            <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.4 }}>
              {ME.stageLabel} · {ME.cyclePhase}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 2 }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 30, color: T.ink, lineHeight: 1.1 }}>The Nourish Edition</div>
            <span style={{ fontFamily: UI, fontSize: 10, color: T.gold, letterSpacing: 0.6, whiteSpace: "nowrap" }}>
              {left} kcal of room
            </span>
          </div>
          <Rule c={T.ink} mt={8} />
        </div>

        {/* segmented control */}
        <div style={{ display: "flex", gap: 0, marginTop: 12, marginBottom: 4,
          border: `1px solid ${T.paperDeep}`, borderRadius: 3, overflow: "hidden" }}>
          {SPREADS.map((s, i) => (
            <button key={s.id} onClick={() => { setIdx(i); window.scrollTo({ top: 0 }); }} style={{
              flex: 1, padding: "8px 2px", border: "none", cursor: "pointer",
              borderLeft: i === 0 ? "none" : `1px solid ${T.paperDeep}`,
              background: i === idx ? T.ink : "transparent",
              color: i === idx ? T.paper : T.muted,
              fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
              textTransform: "uppercase", lineHeight: 1.2,
            }}>
              {s.title.replace("The ", "")}
            </button>
          ))}
        </div>

        {/* folio line */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: UI, fontSize: 10, color: T.gold, letterSpacing: 1.4, fontWeight: 700 }}>
            № {spread.folio} — {spread.kicker.toUpperCase()}
          </span>
          {/* page dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {SPREADS.map((s, i) => (
              <button key={s.id} onClick={() => { setIdx(i); window.scrollTo({ top: 0 }); }}
                aria-label={`Go to ${s.title}`} style={{
                  width: i === idx ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0, cursor: "pointer",
                  background: i === idx ? T.crimson : T.paperDeep, transition: "width .2s",
                }} />
            ))}
          </div>
        </div>

        {/* the active full-bleed spread */}
        <div style={{ paddingTop: 8, minHeight: "62vh" }}>
          {spread.id === "plate"   && <PlateSpread openLog={() => setLogOpen(true)} />}
          {spread.id === "kitchen" && <KitchenSpread />}
          {spread.id === "pantry"  && <PantrySpread />}
          {spread.id === "body"    && <BodySpread />}
          {spread.id === "week"    && <WeekSpread />}
        </div>

        {/* prev / next turn-the-page */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 22, paddingTop: 14, borderTop: `1px solid ${T.paperDeep}` }}>
          <button onClick={() => { setIdx((i) => Math.max(0, i - 1)); window.scrollTo({ top: 0 }); }}
            disabled={idx === 0} style={{ background: "none", border: "none",
              cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1,
              fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
              color: T.muted }}>
            ‹ {idx > 0 ? SPREADS[idx - 1].title.replace("The ", "") : ""}
          </button>
          <button onClick={() => { setIdx((i) => Math.min(SPREADS.length - 1, i + 1)); window.scrollTo({ top: 0 }); }}
            disabled={idx === SPREADS.length - 1} style={{ display: "inline-flex", alignItems: "center", gap: 5,
              background: "none", border: "none",
              cursor: idx === SPREADS.length - 1 ? "default" : "pointer", opacity: idx === SPREADS.length - 1 ? 0.3 : 1,
              fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
              color: T.crimson }}>
            {idx < SPREADS.length - 1 ? SPREADS[idx + 1].title.replace("The ", "") : ""}
            <ChevronRight size={14} />
          </button>
        </div>

        {/* footer */}
        <div style={{ textAlign: "center", marginTop: 26 }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: HAND, fontStyle: "italic", fontSize: 14, color: T.muted, lineHeight: 1.4 }}>
            {FOOTER_LINE}
          </div>
          <div style={{ fontFamily: UI, fontSize: 9.5, color: T.paperDeep, letterSpacing: 0.5, marginTop: 6 }}>
            {NOT_MEDICAL}
          </div>
        </div>
      </div>

      {logOpen && <QuickAdd onClose={() => setLogOpen(false)} />}
    </div>
  );
}
