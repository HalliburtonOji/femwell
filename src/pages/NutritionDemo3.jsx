// NutritionDemo3 — "LOG-FIRST" Nutrition UX direction (preview demo).
// Metaphor: a calm, nearly-empty canvas centred on the user's #1 job — logging
// a meal in seconds. A large always-visible primary "+ Log" action (FAB pinned
// bottom-centre, plus an inline "Log a meal" hero) opens a RICH bottom sheet
// with a segmented switcher (Search / Recents / Favourites / Photo / Voice /
// Barcode). Everything else (My Plan, Recipes, Meal Plan, Shop, Progress,
// Insights) lives behind a single calm "More" entry. This kills decision
// fatigue: the one frequent act (log) is a single thumb-tap; the rest is
// demoted to gentle progressive disclosure so the screen is never busy.
// Self-contained demo: useState/useEffect only. No base44, no entities, no
// network, no props. Mock data from ./nutritionDemoShared. No emoji.
import { useState, useEffect } from "react";
import {
  Plus, X, Search, Clock, Star, Camera, Mic, ScanLine, ChevronRight,
  Droplet, Check, Leaf, ChevronDown, ChevronUp, MoreHorizontal, ArrowRight,
} from "lucide-react";
import {
  T, SERIF, UI, Eyebrow, Rule, Script, Hand, InkFilter,
  useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import {
  ME, SURFACES, TODAY, HYDRATION, MEALS, RECENTS, FAVOURITES, LOG_METHODS,
  FOOD_SEARCH_SAMPLE, PLAN, MICROS, RECIPES, AI_RECIPE, MEAL_PLAN, SHOPPING,
  SHOP_META, PROGRESS, JESS, NOT_MEDICAL, FOOTER_LINE, pct, kcalLeft,
} from "./nutritionDemoShared";

const COL = 430;

// icon lookup for the LOG_METHODS segmented switcher
const METHOD_ICON = {
  search: Search, recent: Clock, fave: Star, photo: Camera, voice: Mic, barcode: ScanLine,
};
// icon lookup for the More menu surfaces
const SURFACE_ICON = {
  plan: Leaf, recipes: Leaf, mealplan: Clock, shop: Search, progress: ChevronRight, insights: Star,
};

export default function NutritionDemo3() {
  useEditorialFonts();

  const [logOpen, setLogOpen] = useState(false);
  const [method, setMethod] = useState("recent");
  const [moreOpen, setMoreOpen] = useState(false);
  const [surface, setSurface] = useState(null);     // which "More" panel is open
  const [plateOpen, setPlateOpen] = useState(false); // today's-plate expander
  const [added, setAdded] = useState([]);            // gentle-feedback log of added foods
  const [toast, setToast] = useState(null);

  // gentle, self-clearing feedback when a food is logged
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const addFood = (name) => {
    setAdded((a) => (a.includes(name) ? a : [...a, name]));
    setToast(`Added ${name} — gently noted`);
  };

  const energyPct = pct(TODAY.energy.had, TODAY.energy.guide);
  const hydPct = pct(HYDRATION.cups, HYDRATION.guide);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 60 }}>
      <InkFilter />

      {/* exact required top banner */}
      <div style={{ background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, textAlign: "center", padding: "6px 10px" }}>
        Nutrition · Log-First — mock data
      </div>

      {/* centered phone column */}
      <div style={{ maxWidth: COL, margin: "0 auto", padding: "0 18px", position: "relative" }}>

        {/* ── masthead ── */}
        <div style={{ paddingTop: 26, paddingBottom: 8 }}>
          <Eyebrow mb={6}>{ME.greetingTime} · {ME.stageLabel}</Eyebrow>
          <Script size={48} style={{ marginBottom: 2 }}>Nourish</Script>
          <Hand size={17} color={T.muted} style={{ marginTop: 2 }}>
            One calm canvas. Your only job: log a meal.
          </Hand>
        </div>

        {/* ── SLIM today strip — warmline framing, not a scoreboard ── */}
        <TodayStrip
          energyPct={energyPct} hydPct={hydPct}
          plateOpen={plateOpen} setPlateOpen={setPlateOpen}
        />

        {/* ── the canvas: nearly empty, centred on the one job ── */}
        <div style={{ marginTop: 22 }}>
          <button
            onClick={() => { setMethod("recent"); setLogOpen(true); }}
            style={{
              width: "100%", textAlign: "left", cursor: "pointer",
              background: T.dusk, color: T.paper, border: "none",
              borderRadius: 18, padding: "20px 20px",
              boxShadow: "0 10px 28px rgba(11,8,5,0.22)",
              display: "flex", alignItems: "center", gap: 16,
            }}
          >
            <span style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: T.crimson, display: "grid", placeItems: "center",
            }}>
              <Plus size={28} color={T.paper} strokeWidth={2.4} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ fontFamily: UI, fontSize: 10, letterSpacing: 1.6, fontWeight: 700, textTransform: "uppercase", color: "rgba(244,239,227,0.66)" }}>
                Your one job
              </span>
              <span style={{ display: "block", fontFamily: SERIF, fontSize: 26, lineHeight: 1.1, marginTop: 2 }}>
                Log a meal
              </span>
              <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "rgba(244,239,227,0.8)", marginTop: 3 }}>
                Search, a recent, a photo — seconds.
              </span>
            </span>
            <ChevronRight size={22} color="rgba(244,239,227,0.7)" />
          </button>

          {/* what was logged just now — gentle, no counts */}
          {added.length > 0 && (
            <div style={{ marginTop: 14, padding: "12px 14px", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14 }}>
              <Eyebrow mb={8} color={T.sage}>Just added today</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {added.map((n) => (
                  <span key={n} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontFamily: SERIF, fontSize: 14, color: T.inkSoft,
                    background: T.paper, border: `1px solid ${T.paperDeep}`,
                    borderRadius: 999, padding: "5px 11px",
                  }}>
                    <Check size={13} color={T.sage} /> {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── the single calm "More" entry — everything else lives here ── */}
        <button
          onClick={() => setMoreOpen(true)}
          style={{
            width: "100%", marginTop: 22, cursor: "pointer",
            background: "transparent", border: `1px dashed ${T.paperDeep}`,
            borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <MoreHorizontal size={20} color={T.muted} />
          <span style={{ flex: 1, textAlign: "left" }}>
            <span style={{ display: "block", fontFamily: SERIF, fontSize: 18, color: T.ink }}>
              Everything else
            </span>
            <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted }}>
              Plan, recipes, week, shop, patterns, insights — when you want them.
            </span>
          </span>
          <ChevronRight size={18} color={T.muted} />
        </button>

        {/* footer voice */}
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <Rule mb={10} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{FOOTER_LINE}</div>
          <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.5, color: T.muted, marginTop: 6 }}>{NOT_MEDICAL}</div>
        </div>
      </div>

      {/* ── persistent FAB, pinned bottom-centre within the column ── */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 22, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 40 }}>
        <div style={{ width: "100%", maxWidth: COL, display: "flex", justifyContent: "center" }}>
          <button
            aria-label="Log a meal"
            onClick={() => { setMethod("recent"); setLogOpen(true); }}
            style={{
              pointerEvents: "auto", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 10,
              background: T.crimson, color: T.paper, border: "none",
              borderRadius: 999, padding: "14px 24px 14px 18px",
              boxShadow: "0 12px 30px rgba(188,46,39,0.4)",
              fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4,
            }}
          >
            <Plus size={22} strokeWidth={2.6} /> Log
          </button>
        </div>
      </div>

      {/* ── gentle toast feedback ── */}
      {toast && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 86, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 70 }}>
          <div style={{ maxWidth: COL, width: "100%", display: "flex", justifyContent: "center", padding: "0 18px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T.ink, color: T.paper, borderRadius: 999,
              padding: "9px 16px", fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
              boxShadow: "0 8px 22px rgba(11,8,5,0.3)",
            }}>
              <Check size={15} color={T.sage} /> {toast}
            </div>
          </div>
        </div>
      )}

      {/* ── THE LOG SHEET (the hero) ── */}
      {logOpen && (
        <LogSheet
          method={method} setMethod={setMethod}
          onClose={() => setLogOpen(false)} addFood={addFood} added={added}
        />
      )}

      {/* ── THE MORE SHEET (calm progressive disclosure) ── */}
      {moreOpen && (
        <MoreSheet
          onClose={() => setMoreOpen(false)}
          onPick={(id) => { setSurface(id); setMoreOpen(false); }}
        />
      )}

      {/* ── a "More" surface panel ── */}
      {surface && (
        <SurfacePanel id={surface} onClose={() => setSurface(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIM TODAY STRIP — gentle energy + hydration, warmline; expands to the plate.
// ─────────────────────────────────────────────────────────────────────────────
function TodayStrip({ energyPct, hydPct, plateOpen, setPlateOpen }) {
  return (
    <div style={{ marginTop: 18, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Eyebrow color={T.muted}>Today, so far</Eyebrow>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.sage }}>
            {kcalLeft()} kcal of room left to nourish
          </span>
        </div>

        {/* gentle energy meter — soft fill, not a score */}
        <div style={{ marginTop: 10 }}>
          <SoftBar pct={energyPct} fill={T.gold} />
        </div>

        {/* hydration — cups, no guilt */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Droplet size={15} color={T.sage} />
          <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft }}>
            {HYDRATION.cups} of {HYDRATION.guide} cups
          </span>
          <div style={{ flex: 1, marginLeft: 4 }}>
            <SoftBar pct={hydPct} fill={T.sage} thin />
          </div>
          <span style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>last {HYDRATION.lastAt}</span>
        </div>

        <Hand size={14.5} color={T.muted} style={{ marginTop: 12 }}>{TODAY.warmline}</Hand>

        <button
          onClick={() => setPlateOpen((v) => !v)}
          style={{
            marginTop: 12, width: "100%", cursor: "pointer",
            background: "transparent", border: "none",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            color: T.muted, padding: 0,
          }}
        >
          {plateOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {plateOpen ? "Hide today's plate" : "See today's plate"}
        </button>
      </div>

      {/* expandable today's plate */}
      {plateOpen && (
        <div style={{ borderTop: `1px solid ${T.paperDeep}`, padding: "14px 16px", background: T.paper }}>
          {MEALS.map((m) => (
            <div key={m.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.gold }}>{m.slot}</span>
                <span style={{ fontFamily: UI, fontSize: 10, color: T.muted }}>{m.time || (m.planned ? "planned" : "")}</span>
                <div style={{ flex: 1 }} />
                {m.kcal > 0 && <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{m.kcal} kcal</span>}
              </div>
              {m.title ? (
                <>
                  <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, marginTop: 2 }}>{m.title}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, marginTop: 1 }}>{m.items.join(" · ")}</div>
                </>
              ) : (
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, marginTop: 2 }}>
                  Planned: {m.planned}
                </div>
              )}
            </div>
          ))}
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, textAlign: "center" }}>
            A picture of the day — not a tally.
          </div>
        </div>
      )}
    </div>
  );
}

function SoftBar({ pct, fill, thin }) {
  return (
    <div style={{ width: "100%", height: thin ? 5 : 8, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: fill, opacity: 0.85 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SHEET SHELL — backdrop + slide-up panel + handle + close.
// ─────────────────────────────────────────────────────────────────────────────
function Sheet({ onClose, title, eyebrow, children, dark }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(11,8,5,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%", maxWidth: COL, maxHeight: "88vh", overflowY: "auto",
          background: dark ? T.dusk : T.paper, color: dark ? T.paper : T.ink,
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          boxShadow: "0 -12px 40px rgba(11,8,5,0.35)",
          padding: "10px 18px 28px",
        }}
      >
        {/* handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
          <div style={{ width: 44, height: 5, borderRadius: 999, background: dark ? "rgba(244,239,227,0.3)" : T.paperDeep }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            {eyebrow && <Eyebrow mb={4} color={dark ? "rgba(244,239,227,0.6)" : T.muted}>{eyebrow}</Eyebrow>}
            <Script size={34} color={dark ? T.paper : T.ink}>{title}</Script>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{ cursor: "pointer", background: "transparent", border: "none", padding: 6, marginTop: 4 }}
          >
            <X size={22} color={dark ? T.paper : T.ink} />
          </button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THE LOG SHEET — segmented switcher, every segment real content.
// ─────────────────────────────────────────────────────────────────────────────
function LogSheet({ method, setMethod, onClose, addFood, added }) {
  return (
    <Sheet onClose={onClose} title="Log a meal" eyebrow="Seconds, not forms">
      {/* segmented switcher */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
        {LOG_METHODS.map((m) => {
          const Icon = METHOD_ICON[m.id] || Search;
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              style={{
                flexShrink: 0, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                background: active ? T.ink : "transparent",
                color: active ? T.paper : T.muted,
                border: `1px solid ${active ? T.ink : T.paperDeep}`,
                borderRadius: 999, padding: "7px 13px",
                fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
              }}
            >
              <Icon size={14} /> {m.label}
            </button>
          );
        })}
      </div>

      <Hand size={14} color={T.muted} style={{ marginBottom: 14 }}>
        {LOG_METHODS.find((m) => m.id === method)?.hint}
      </Hand>

      {method === "search" && <SearchSegment addFood={addFood} added={added} />}
      {method === "recent" && <ChipSegment list={RECENTS} addFood={addFood} added={added} />}
      {method === "fave" && <ChipSegment list={FAVOURITES} addFood={addFood} added={added} fave />}
      {method === "photo" && (
        <CaptureSegment Icon={Camera} title="Snap your plate" line="Point at the meal and we'll estimate it — a starting point you can nudge." cta="Open camera" addFood={addFood} sample="Photo estimate · mixed plate" />
      )}
      {method === "voice" && (
        <CaptureSegment Icon={Mic} title="Just say it" line={'Tell Jess what you ate, like "a bowl of porridge with berries".'} cta="Hold to speak" addFood={addFood} sample="Voice: bowl of porridge" />
      )}
      {method === "barcode" && (
        <CaptureSegment Icon={ScanLine} title="Scan the packet" line="Line up the barcode — we'll pull it from the UK food database." cta="Open scanner" addFood={addFood} sample="Scanned: oat granola" />
      )}
    </Sheet>
  );
}

function SearchSegment({ addFood, added }) {
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: T.paperHi, border: `1px solid ${T.paperDeep}`,
        borderRadius: 12, padding: "11px 14px", marginBottom: 14,
      }}>
        <Search size={17} color={T.muted} />
        <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>spin</span>
        <span style={{ width: 1, height: 16, background: T.ink, marginLeft: -4 }} />
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted }}>UK food database</span>
      </div>
      {FOOD_SEARCH_SAMPLE.map((f) => (
        <FoodRow key={f.id} name={f.name} sub={`${f.per} · ${f.kcal} kcal`} tag={f.tag} added={added.includes(f.name)} onAdd={() => addFood(f.name)} />
      ))}
    </div>
  );
}

function ChipSegment({ list, addFood, added, fave }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {list.map((item) => {
        const isAdded = added.includes(item.name);
        return (
          <button
            key={item.id}
            onClick={() => addFood(item.name)}
            style={{
              cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 12,
              background: isAdded ? T.paperHi : T.paper,
              border: `1px solid ${isAdded ? T.sage : T.paperDeep}`,
              borderRadius: 12, padding: "11px 14px",
            }}
          >
            <span style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: T.paperHi, border: `1px solid ${T.paperDeep}`,
              display: "grid", placeItems: "center",
            }}>
              {fave ? <Star size={15} color={T.gold} /> : <Clock size={15} color={T.muted} />}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontFamily: SERIF, fontSize: 16.5, color: T.ink }}>{item.name}</span>
              <span style={{ display: "block", fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 1 }}>
                {item.kcal} kcal{item.tag ? ` · ${item.tag}` : ""}
              </span>
            </span>
            <span style={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: UI, fontSize: 11, fontWeight: 700,
              color: isAdded ? T.sage : T.crimson,
            }}>
              {isAdded ? <><Check size={15} /> Added</> : <><Plus size={15} /> Add</>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FoodRow({ name, sub, tag, added, onAdd }) {
  return (
    <button
      onClick={onAdd}
      style={{
        width: "100%", cursor: "pointer", textAlign: "left",
        display: "flex", alignItems: "center", gap: 12,
        background: added ? T.paperHi : "transparent",
        border: "none", borderBottom: `1px solid ${T.paperDeep}`,
        padding: "11px 2px",
      }}
    >
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 16.5, color: T.ink }}>{name}</span>
        <span style={{ display: "block", fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 1 }}>
          {sub}{tag ? ` · ${tag}` : ""}
        </span>
      </span>
      <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, fontWeight: 700, color: added ? T.sage : T.crimson }}>
        {added ? <><Check size={15} /> Added</> : <><Plus size={15} /> Add</>}
      </span>
    </button>
  );
}

function CaptureSegment({ Icon, title, line, cta, addFood, sample }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 4px 4px" }}>
      <div style={{
        width: 84, height: 84, borderRadius: 20, margin: "0 auto 16px",
        background: T.paperHi, border: `1.5px dashed ${T.paperDeep}`,
        display: "grid", placeItems: "center",
      }}>
        <Icon size={34} color={T.gold} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 21, color: T.ink }}>{title}</div>
      <Hand size={15} color={T.muted} style={{ marginTop: 6, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>{line}</Hand>
      <button
        onClick={() => addFood(sample)}
        style={{
          marginTop: 18, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 9,
          background: T.crimson, color: T.paper, border: "none",
          borderRadius: 999, padding: "12px 22px",
          fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: 0.4,
        }}
      >
        <Icon size={17} /> {cta}
      </button>
      <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, marginTop: 12 }}>
        Tap to drop a sample log in (demo).
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THE MORE SHEET — the single calm entry to every non-log surface.
// ─────────────────────────────────────────────────────────────────────────────
function MoreSheet({ onClose, onPick }) {
  const surfaces = SURFACES.filter((s) => s.id !== "today" && s.id !== "log");
  return (
    <Sheet onClose={onClose} title="Everything else" eyebrow="Calmly, when you want it">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {surfaces.map((s) => {
          const Icon = SURFACE_ICON[s.id] || Leaf;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              style={{
                cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 14,
                background: T.paperHi, border: `1px solid ${T.paperDeep}`,
                borderRadius: 14, padding: "14px 16px",
              }}
            >
              <span style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: T.paper, border: `1px solid ${T.paperDeep}`,
                display: "grid", placeItems: "center",
              }}>
                <Icon size={18} color={T.gold} />
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 19, color: T.ink }}>{s.label}</span>
                <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted }}>{s.blurb}</span>
              </span>
              <ChevronRight size={18} color={T.muted} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE PANELS — each "More" item opens its own full-content panel.
// ─────────────────────────────────────────────────────────────────────────────
function SurfacePanel({ id, onClose }) {
  const meta = SURFACES.find((s) => s.id === id);
  return (
    <Sheet onClose={onClose} title={meta?.label || ""} eyebrow={meta?.blurb}>
      {id === "plan" && <PlanPanel />}
      {id === "recipes" && <RecipesPanel />}
      {id === "mealplan" && <MealPlanPanel />}
      {id === "shop" && <ShopPanel />}
      {id === "progress" && <ProgressPanel />}
      {id === "insights" && <InsightsPanel />}
    </Sheet>
  );
}

function PlanPanel() {
  return (
    <div>
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
        <Eyebrow mb={4} color={T.muted}>Gentle daily energy</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: T.ink }}>{PLAN.energyGuide} kcal</div>
        <Hand size={14} color={T.muted} style={{ marginTop: 4 }}>{PLAN.why}</Hand>
      </div>
      {PLAN.targets.map((t) => (
        <div key={t.key} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{t.label}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.gold }}>{t.guide}</span>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 2 }}>{t.why}</div>
        </div>
      ))}
    </div>
  );
}

function RecipesPanel() {
  return (
    <div>
      {/* AI generator card */}
      <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "16px 16px", marginBottom: 16 }}>
        <Eyebrow mb={6} color="rgba(244,239,227,0.6)">Generate from what's in</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 21, marginBottom: 2 }}>{AI_RECIPE.title}</div>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: "rgba(244,239,227,0.7)", marginBottom: 8 }}>
          {AI_RECIPE.mins} mins · serves {AI_RECIPE.serves}
        </div>
        <Hand size={14.5} color="rgba(244,239,227,0.88)" style={{ marginBottom: 10 }}>{AI_RECIPE.why}</Hand>
        <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(244,239,227,0.6)", marginBottom: 4 }}>Ingredients</div>
        <div style={{ fontFamily: SERIF, fontSize: 14.5, color: "rgba(244,239,227,0.92)", marginBottom: 10 }}>{AI_RECIPE.ingredients.join(" · ")}</div>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {AI_RECIPE.steps.map((s, i) => (
            <li key={i} style={{ fontFamily: SERIF, fontSize: 14.5, color: "rgba(244,239,227,0.92)", marginBottom: 4 }}>{s}</li>
          ))}
        </ol>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: "rgba(244,239,227,0.7)", marginTop: 10 }}>{AI_RECIPE.nutrition}</div>
      </div>

      <Eyebrow mb={10} color={T.muted}>Saved recipes</Eyebrow>
      {RECIPES.map((r) => (
        <div key={r.id} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontFamily: SERIF, fontSize: 18.5, color: T.ink }}>{r.title}</div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 2 }}>{r.mins} mins · serves {r.serves} · {r.tags.join(" · ")}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 6 }}>{r.why}</div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.sage, marginTop: 8 }}>
            Have: {r.have.join(", ")}{r.need.length ? ` · Need: ${r.need.join(", ")}` : " · nothing to buy"}
          </div>
        </div>
      ))}
    </div>
  );
}

function MealPlanPanel() {
  return (
    <div>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>{MEAL_PLAN.intro}</Hand>
      {MEAL_PLAN.days.map((d) => (
        <div key={d.day} style={{ display: "flex", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
          <span style={{ width: 38, flexShrink: 0, fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.gold, paddingTop: 2 }}>{d.day}</span>
          <span style={{ flex: 1 }}>
            <Line label="Breakfast" text={d.b} />
            <Line label="Lunch" text={d.l} />
            <Line label="Dinner" text={d.d} />
          </span>
        </div>
      ))}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px" }}>
        <Hand size={14} color={T.muted}>{MEAL_PLAN.note}</Hand>
      </div>
    </div>
  );
}
function Line({ label, text }) {
  return (
    <span style={{ display: "block", marginBottom: 2 }}>
      <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: T.muted, marginRight: 6 }}>{label}</span>
      <span style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink }}>{text}</span>
    </span>
  );
}

function ShopPanel() {
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[["Items", SHOP_META.items], ["Estimate", SHOP_META.est], ["For", `${SHOP_META.forDays} days`]].map(([k, v]) => (
          <div key={k} style={{ flex: 1, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{v}</div>
            <div style={{ fontFamily: UI, fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted, marginTop: 2 }}>{k}</div>
          </div>
        ))}
      </div>
      {SHOPPING.map((group) => (
        <div key={group.aisle} style={{ marginBottom: 16 }}>
          <Eyebrow mb={8} color={T.gold}>{group.aisle}</Eyebrow>
          {group.items.map((it) => (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.paperDeep}` }}>
              <span style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${T.paperDeep}`, flexShrink: 0 }} />
              <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{it}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProgressPanel() {
  const spark = PROGRESS.spark;
  const w = 320, h = 70, pad = 6;
  const max = Math.max(...spark), min = Math.min(...spark);
  const span = max - min || 1;
  const pts = spark.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (spark.length - 1);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  return (
    <div>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>{PROGRESS.framing}</Hand>

      {/* gentle SVG sparkline — no axis, no streaks */}
      <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <Eyebrow mb={10} color={T.muted}>Nourishment, this fortnight</Eyebrow>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }} preserveAspectRatio="none">
          <path d={path} fill="none" stroke={T.sage} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill={i === pts.length - 1 ? T.crimson : T.sage} />
          ))}
        </svg>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, marginTop: 8, textAlign: "center" }}>
          No streaks to keep. Just the gentle shape of your days.
        </div>
      </div>

      {PROGRESS.patterns.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 7, background: p.tone === "good" ? T.sage : T.gold }} />
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontFamily: SERIF, fontSize: 17.5, color: T.ink }}>{p.title}</span>
            <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 1 }}>{p.detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function InsightsPanel() {
  return (
    <div>
      {/* Jess's today line */}
      <div style={{ display: "flex", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <span style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
          <Leaf size={16} color={T.sage} />
        </span>
        <span>
          <Eyebrow mb={3} color={T.sage}>Jess</Eyebrow>
          <Hand size={15} color={T.inkSoft}>{JESS.todayLine}</Hand>
        </span>
      </div>

      {JESS.insights.map((ins, i) => (
        <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.paperDeep}` }}>
          <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink }}>{ins.title}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, marginTop: 2 }}>{ins.body}</div>
        </div>
      ))}

      <Eyebrow mb={10} color={T.gold}>For your stage now</Eyebrow>
      {MICROS.map((m) => (
        <div key={m.key} style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>{m.label}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{m.had}/{m.guide} {m.unit}</span>
          </div>
          <div style={{ marginTop: 7 }}>
            <SoftBar pct={pct(m.had, m.guide)} fill={T.gold} thin />
          </div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.sage, marginTop: 7 }}>{m.foods.join(" · ")}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, marginTop: 4 }}>{m.note}</div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, justifyContent: "center" }}>
        <ArrowRight size={13} color={T.muted} />
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Nourishment for your stage, not a number.</span>
      </div>
    </div>
  );
}
