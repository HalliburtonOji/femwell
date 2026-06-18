// UnifiedShoppingTab — the master-plan "Shopping & pantry" rebuild.
//
// What it does (all on REAL Base44 data; ShoppingList + MealPlans entities):
//   1. AISLE-GROUPED list  — real ShoppingList rows grouped by aisle so the store
//      path is linear (Produce → Protein → Dairy → Bakery → Cupboard → Frozen → Other).
//      Each item: name, quantity, optimistic check toggle, delete. Checked items
//      sink + strike. Manual items wear a "manual" tag; plan-sourced are plain.
//   2. BUILD FROM THE PLAN — reads this week's real MealPlans.plan_days (the unified
//      planner's meal NAMES), extracts ingredients with a deterministic keyword
//      dictionary (NOT a naive whitespace split), does a UNIT-AWARE MERGE across days
//      (Mon's onion + Tue's onion → "2 onion"), assigns an aisle from a local
//      keyword→aisle map, and only falls back to ONE guarded LLM categorise call for
//      the leftovers the dictionary couldn't place. Re-syncing is NON-DESTRUCTIVE:
//      it replaces only source:"meal_plan" rows; manual + pantry rows are untouched.
//   3. PANTRY — a lightweight "already have it" list persisted as ShoppingList rows
//      with source:"pantry". SET-SUBTRACT: any shopping item whose name matches a
//      pantry item is dimmed + tagged "in pantry" (so you don't buy it twice) and
//      excluded from the buy-count, copy and email output.
//   4. BUDGET — opt-in. A heuristic £-estimate of the un-owned, unchecked list using a
//      small per-aisle price table × parsed quantity. Framed purely as money-saving —
//      no calories, no scoreboard. Plus a per-item "cheaper swap" hint for a few
//      pricey staples.
//   5. COPY / EMAIL the aisle-ordered list (kept from the old tab).
//
// REAL vs HEURISTIC vs LLM:
//   • Real data    — every ShoppingList + MealPlans read/write. No mock rows.
//   • Heuristic    — ingredient dictionary, unit-aware merge, aisle keyword map,
//                    £ price table, swap hints, pantry set-subtract. Pure local logic.
//   • LLM (guarded)— ONE optional InvokeLLM call to aisle-categorise only the items the
//                    dictionary couldn't place; timeout + local "Other" fallback so a
//                    stall never blocks the build.
//
// SAFETY: every read .catch → []; every write withTimeout + optimistic + rollback +
// visible error; the LLM call is withTimeout-wrapped with a local fallback. Nothing
// here can crash the tab or hang the UI. Brand: Editorial cream/plum tokens, Lucide,
// NO EMOJI, no scoreboards, phone-first. The old ShoppingListTab.jsx is left in place.

import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from "date-fns";
import {
  Plus, Trash2, Check, Mail, Copy, CheckCircle, ShoppingCart,
  Package, Leaf, Beef, Milk, Wheat, Snowflake, Archive, Home, PoundSterling,
  Sparkles, X, Loader2,
} from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { withTimeout } from "@/utils/safeEntity";
import { extractIngredients } from "@/utils/foodModel";

// ── aisle order = the linear store path ────────────────────────────────────────
const AISLES = ["Produce", "Protein", "Dairy", "Bakery", "Cupboard", "Frozen", "Other"];

const AISLE_ICON = {
  Produce: Leaf,
  Protein: Beef,
  Dairy: Milk,
  Bakery: Wheat,
  Cupboard: Archive,
  Frozen: Snowflake,
  Other: Package,
};

// Map the legacy ShoppingList.category values (and any free text) onto our aisles,
// so rows written by the old tab / sync still group correctly.
const CATEGORY_TO_AISLE = {
  Produce: "Produce",
  "Meat & Seafood": "Protein",
  Protein: "Protein",
  "Dairy & Eggs": "Dairy",
  Dairy: "Dairy",
  Bakery: "Bakery",
  Pantry: "Cupboard",
  Cupboard: "Cupboard",
  Beverages: "Cupboard",
  Snacks: "Cupboard",
  Frozen: "Frozen",
  Other: "Other",
};
const toAisle = (cat) => CATEGORY_TO_AISLE[cat] || (AISLES.includes(cat) ? cat : "Other");

// NOTE: the deterministic ingredient dictionary + per-name extractor now live in the
// shared nutrition spine (src/utils/foodModel.js → extractIngredients / extractFromName),
// so logging and shopping read ONE extractor. This tab consumes extractIngredients()
// below in buildFromPlan; the aisle keyword→canonical mapping is owned there.

// pricey staples → a money-saving swap hint (opt-in budget feature). Heuristic only.
const SWAP_HINTS = {
  Salmon: "Tinned salmon or mackerel is a cheaper omega-3 swap",
  Beef: "Beef mince or a slow-cook cut stretches further per £",
  Prawns: "Frozen prawns are cheaper than fresh and keep longer",
  Berries: "Frozen berries cost less and work the same in porridge",
  Blueberries: "Frozen blueberries are far cheaper for the same goodness",
  "Olive oil": "A larger bottle is cheaper per ml than a small one",
  Halloumi: "Own-brand halloumi is usually a third less",
  Almonds: "Buying nuts in a bigger bag drops the per-gram price",
};

// rough per-item £ for the budget estimate (one unit). Heuristic, UK-ish, money-only.
const PRICE = {
  Produce: 0.7, Protein: 3.2, Dairy: 1.6, Bakery: 1.1, Cupboard: 1.3, Frozen: 2.0, Other: 1.2,
};
const ITEM_PRICE = { // a few overrides where the aisle average lies
  Salmon: 4.5, Beef: 4.0, Prawns: 3.5, Halloumi: 2.5, Eggs: 1.8, Milk: 1.3, Cheese: 2.8,
  Berries: 2.5, Blueberries: 2.5, Olive: 3.5, "Olive oil": 3.5, Avocado: 0.9, Bread: 1.1,
};

// ── unit-aware quantity parse + merge ──────────────────────────────────────────
// parse "2", "200g", "1 tin", "" → { count, unit }. Mergeable when units match.
function parseQty(q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return { count: 1, unit: "" };
  const m = s.match(/^(\d+(?:\.\d+)?)\s*([a-z]*)/);
  if (!m) return { count: 1, unit: "", raw: s };
  return { count: parseFloat(m[1]) || 1, unit: m[2] || "" };
}
function fmtQty({ count, unit }) {
  if (!count) return "";
  const c = Number.isInteger(count) ? count : Math.round(count * 10) / 10;
  return unit ? `${c}${unit.length > 2 ? " " : ""}${unit}` : `${c}`;
}
// merge an array of {name, aisle, qty} where names collide (case-insensitive).
function mergeItems(rows) {
  const byKey = new Map();
  for (const r of rows) {
    const key = r.name.toLowerCase();
    const pq = parseQty(r.qty);
    if (!byKey.has(key)) {
      byKey.set(key, { name: r.name, aisle: r.aisle, count: pq.count, unit: pq.unit, mixed: false });
    } else {
      const cur = byKey.get(key);
      if (cur.unit === pq.unit) cur.count += pq.count;   // same unit → sum (unit-aware)
      else cur.mixed = true;                              // can't safely sum → keep one, flag
      if (!cur.aisle || cur.aisle === "Other") cur.aisle = r.aisle;
    }
  }
  return [...byKey.values()].map((v) => ({
    name: v.name,
    aisle: v.aisle || "Other",
    qty: v.mixed ? "" : fmtQty({ count: v.count, unit: v.unit }),
  }));
}

const sLabel = {
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 1.4,
  textTransform: "uppercase", color: T.muted,
};
const card = { background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18 };

export default function UnifiedShoppingTab({ user, profile }) {
  void profile; // stage not used in shopping logic; kept for prop-contract parity
  const [rows, setRows] = useState([]);          // ShoppingList rows (buy + pantry)
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newAisle, setNewAisle] = useState("Other");

  const [pantryOpen, setPantryOpen] = useState(false);
  const [pantryDraft, setPantryDraft] = useState("");
  const [budgetOn, setBudgetOn] = useState(false);

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  // ── load real rows (guarded) ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await base44.entities.ShoppingList
      .filter({ user_id: user.id, week_start: weekStart })
      .catch(() => []);
    setRows((data || []).filter(Boolean));
    setLoading(false);
  }, [user, weekStart]);

  useEffect(() => { load(); }, [load]);

  // shopping (buy) rows vs pantry rows
  const buyRows = useMemo(() => rows.filter((r) => r.source !== "pantry"), [rows]);
  const pantryRows = useMemo(() => rows.filter((r) => r.source === "pantry"), [rows]);

  // pantry set: lowercased canonical names you already own
  const pantrySet = useMemo(
    () => new Set(pantryRows.map((r) => (r.ingredient_name || "").trim().toLowerCase())),
    [pantryRows]
  );
  const owned = useCallback(
    (name) => pantrySet.has((name || "").trim().toLowerCase()),
    [pantrySet]
  );

  // ── BUILD FROM THIS WEEK'S PLAN (non-destructive on manual/pantry) ─────────────
  const buildFromPlan = async () => {
    if (building) return;
    setBuilding(true);
    setError(null);
    try {
      const plans = await base44.entities.MealPlans
        .filter({ user_id: user.id, week_start: weekStart, is_active: true })
        .catch(() => []);
      const plan = (plans || []).filter(Boolean)[0];
      if (!plan) {
        setError("No plan for this week yet — generate one in the planner first.");
        setBuilding(false);
        return;
      }

      // 1+2) SHARED extractor: collect every meal NAME from the real plan_days and run
      //       the deterministic dictionary extraction (NOT a naive split) — now owned by
      //       the nutrition spine (foodModel.extractIngredients), so logging and shopping
      //       share one extractor. Returns { items:[{name,aisle}], unreadNames, names }.
      const { items: dictItems, unreadNames, names } = extractIngredients(plan.plan_days);
      if (names.length === 0) {
        setError("Your plan has no meals yet — add some in the planner, then build.");
        setBuilding(false);
        return;
      }

      let extracted = dictItems.map((it) => ({ name: it.name, aisle: it.aisle, qty: "" }));

      // 3) names the dictionary couldn't read at all → ONE guarded LLM categorise.
      //    We only ask the model for the meals that produced zero dictionary hits,
      //    keeping the call small. Local "Other" fallback if it stalls/fails.
      if (unreadNames.length > 0) {
        try {
          const res = await withTimeout(
            base44.integrations.Core.InvokeLLM({
              prompt:
                `For each UK meal name, list its core shopping ingredients and the supermarket aisle ` +
                `(one of: Produce, Protein, Dairy, Bakery, Cupboard, Frozen, Other).\n` +
                `Meals: ${unreadNames.join("; ")}\n` +
                `Return JSON {"items":[{"name":"ingredient","aisle":"Aisle"}]}. Keep ingredient names simple and singular-ish.`,
              response_json_schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { name: { type: "string" }, aisle: { type: "string" } },
                    },
                  },
                },
              },
            }),
            18000,
            "categorise"
          );
          for (const it of res?.items || []) {
            if (!it?.name) continue;
            extracted.push({ name: it.name.trim(), aisle: toAisle(it.aisle), qty: "" });
          }
        } catch (e) {
          console.error(e);
          // local fallback: drop the unread meal names in as Other so nothing is lost
          for (const n of unreadNames) extracted.push({ name: n, aisle: "Other", qty: "" });
        }
      }

      // 4) unit-aware merge / dedupe across all days
      const merged = mergeItems(extracted);

      // 5) NON-DESTRUCTIVE write: replace ONLY existing source:"meal_plan" rows.
      //    Manual + pantry rows are never touched.
      const oldPlanRows = buyRows.filter((r) => r.source === "meal_plan");
      // optimistic: swap plan rows in local state
      const optimisticPlan = merged.map((m, i) => ({
        id: `tmp_plan_${i}`,
        user_id: user.id, week_start: weekStart,
        ingredient_name: m.name, quantity_text: m.qty || "",
        category: m.aisle, is_checked: false, source: "meal_plan", meal_plan_id: plan.id,
      }));
      const prev = rows;
      setRows([
        ...rows.filter((r) => r.source !== "meal_plan"),
        ...optimisticPlan,
      ]);

      try {
        if (oldPlanRows.length) {
          await withTimeout(
            Promise.all(oldPlanRows.map((r) => base44.entities.ShoppingList.delete(r.id))),
            6000, "save"
          );
        }
        await withTimeout(
          base44.entities.ShoppingList.bulkCreate(
            merged.map((m) => ({
              user_id: user.id, week_start: weekStart,
              ingredient_name: m.name, quantity_text: m.qty || "",
              category: m.aisle, is_checked: false,
              source: "meal_plan", meal_plan_id: plan.id,
            }))
          ),
          8000, "save"
        );
        await load(); // re-fetch for real ids
      } catch (e) {
        console.error(e);
        setRows(prev); // rollback
        setError("Couldn't build your list — please try again.");
      }
    } catch (e) {
      console.error(e);
      setError("Couldn't read your plan — please try again.");
    }
    setBuilding(false);
  };

  // ── item check toggle (optimistic + rollback) ──────────────────────────────────
  const toggleCheck = async (item) => {
    setError(null);
    setRows((p) => p.map((r) => (r.id === item.id ? { ...r, is_checked: !r.is_checked } : r)));
    try {
      await withTimeout(
        base44.entities.ShoppingList.update(item.id, { is_checked: !item.is_checked }),
        6000, "save"
      );
    } catch (e) {
      console.error(e);
      setRows((p) => p.map((r) => (r.id === item.id ? { ...r, is_checked: item.is_checked } : r)));
      setError("Couldn't update your list — please try again.");
    }
  };

  // ── delete one item (optimistic + rollback) ─────────────────────────────────────
  const deleteItem = async (item) => {
    setError(null);
    const prev = rows;
    setRows((p) => p.filter((r) => r.id !== item.id));
    try {
      await withTimeout(base44.entities.ShoppingList.delete(item.id), 6000, "delete");
    } catch (e) {
      console.error(e);
      setRows(prev);
      setError("Couldn't remove that item — please try again.");
    }
  };

  // ── add a manual buy item ───────────────────────────────────────────────────────
  const addManual = async () => {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    const tmp = {
      id: `tmp_${Date.now()}`, user_id: user.id, week_start: weekStart,
      ingredient_name: name, quantity_text: newQty.trim(), category: newAisle,
      is_checked: false, source: "manual",
    };
    setRows((p) => [...p, tmp]);
    setNewName(""); setNewQty(""); setAdding(false);
    try {
      const created = await withTimeout(
        base44.entities.ShoppingList.create({
          user_id: user.id, week_start: weekStart,
          ingredient_name: name, quantity_text: tmp.quantity_text,
          category: newAisle, is_checked: false, source: "manual",
        }),
        6000, "save"
      );
      setRows((p) => p.map((r) => (r.id === tmp.id ? created : r)));
    } catch (e) {
      console.error(e);
      setRows((p) => p.filter((r) => r.id !== tmp.id));
      setError("Couldn't add your item — please try again.");
    }
  };

  // ── add / remove a pantry item (source:"pantry") ───────────────────────────────
  const addPantry = async () => {
    const name = pantryDraft.trim();
    if (!name) return;
    setError(null);
    const tmp = {
      id: `tmp_pan_${Date.now()}`, user_id: user.id, week_start: weekStart,
      ingredient_name: name, quantity_text: "", category: "Other",
      is_checked: false, source: "pantry",
    };
    setRows((p) => [...p, tmp]);
    setPantryDraft("");
    try {
      const created = await withTimeout(
        base44.entities.ShoppingList.create({
          user_id: user.id, week_start: weekStart,
          ingredient_name: name, quantity_text: "", category: "Other",
          is_checked: false, source: "pantry",
        }),
        6000, "save"
      );
      setRows((p) => p.map((r) => (r.id === tmp.id ? created : r)));
    } catch (e) {
      console.error(e);
      setRows((p) => p.filter((r) => r.id !== tmp.id));
      setError("Couldn't save to your pantry — please try again.");
    }
  };

  const removePantry = async (item) => {
    setError(null);
    const prev = rows;
    setRows((p) => p.filter((r) => r.id !== item.id));
    try {
      await withTimeout(base44.entities.ShoppingList.delete(item.id), 6000, "delete");
    } catch (e) {
      console.error(e);
      setRows(prev);
      setError("Couldn't remove that — please try again.");
    }
  };

  // ── grouping: buy rows by aisle, in store-path order. Owned items dim but stay. ──
  const grouped = useMemo(() => {
    const out = {};
    for (const aisle of AISLES) {
      const items = buyRows
        .filter((r) => toAisle(r.category) === aisle)
        .sort((a, b) => Number(a.is_checked) - Number(b.is_checked)); // checked sink
      if (items.length) out[aisle] = items;
    }
    return out;
  }, [buyRows]);

  // a "to buy" item = unchecked AND not already owned in the pantry
  const toBuy = useMemo(
    () => buyRows.filter((r) => !r.is_checked && !owned(r.ingredient_name)),
    [buyRows, owned]
  );
  const checkedCount = buyRows.filter((r) => r.is_checked).length;

  // ── budget estimate (heuristic, money-only, opt-in) ─────────────────────────────
  const budget = useMemo(() => {
    let total = 0;
    for (const r of toBuy) {
      const aisle = toAisle(r.category);
      const per = ITEM_PRICE[r.ingredient_name] ?? PRICE[aisle] ?? 1.2;
      const { count } = parseQty(r.quantity_text);
      const mult = count > 1 && count <= 12 ? count : 1; // only scale on sensible counts
      total += per * mult;
    }
    return total;
  }, [toBuy]);

  const swapsAvailable = useMemo(
    () => toBuy.filter((r) => SWAP_HINTS[r.ingredient_name]).length,
    [toBuy]
  );

  // ── copy / email (aisle-ordered, owned + checked excluded) ──────────────────────
  const listText = () =>
    AISLES.map((aisle) => {
      const items = (grouped[aisle] || []).filter(
        (r) => !r.is_checked && !owned(r.ingredient_name)
      );
      if (!items.length) return null;
      return `${aisle}:\n${items
        .map((r) => `  - ${r.quantity_text ? r.quantity_text + " " : ""}${r.ingredient_name}`)
        .join("\n")}`;
    })
      .filter(Boolean)
      .join("\n\n");

  const copyList = () => {
    try {
      navigator.clipboard?.writeText(`Shopping list — week of ${weekStart}\n\n${listText()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { console.error(e); }
  };

  const emailList = async () => {
    setError(null);
    try {
      const me = await base44.auth.me().catch(() => null);
      if (!me?.email) { setError("Couldn't find your email — please try again."); return; }
      const html = AISLES.map((aisle) => {
        const items = (grouped[aisle] || []).filter(
          (r) => !r.is_checked && !owned(r.ingredient_name)
        );
        if (!items.length) return null;
        return `<b>${aisle}</b><br>${items
          .map((r) => `&nbsp;&nbsp;- ${r.quantity_text ? r.quantity_text + " " : ""}${r.ingredient_name}`)
          .join("<br>")}`;
      }).filter(Boolean).join("<br><br>");
      await withTimeout(
        base44.integrations.Core.SendEmail({
          to: me.email,
          subject: `Shopping list — week of ${weekStart}`,
          body: `<h2 style="font-family:serif;color:${T.ink}">Your shopping list</h2><p style="color:${T.muted}">Week of ${weekStart}</p><br>${html}`,
        }),
        10000, "email"
      );
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (e) {
      console.error(e);
      setError("Couldn't email your list — please try again.");
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "56px 0" }}>
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── header: count + build-from-plan ──────────────────────────────────── */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <p style={sLabel}>This week</p>
            <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, marginTop: 2 }}>
              {toBuy.length} to buy
              <span style={{ color: T.muted, fontSize: 13 }}>
                {checkedCount ? ` · ${checkedCount} in the trolley` : ""}
              </span>
            </p>
          </div>
          <button onClick={buildFromPlan} disabled={building}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: T.ink, color: T.paper, border: "none", borderRadius: 12,
              padding: "10px 13px", cursor: "pointer", opacity: building ? 0.7 : 1,
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
            }}>
            {building
              ? <><Loader2 size={14} className="animate-spin" /> Building…</>
              : <><Sparkles size={14} /> Build from plan</>}
          </button>
        </div>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.4 }}>
          Reads this week's plan, merges repeats, and sorts by aisle. Your manual items
          and pantry stay put.
        </p>

        {/* actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={copyList} style={ghostBtn}>
            {copied ? <CheckCircle size={13} color={T.sage} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={emailList} style={ghostBtn}>
            {emailSent ? <CheckCircle size={13} color={T.sage} /> : <Mail size={13} />}
            {emailSent ? "Sent" : "Email me"}
          </button>
          <button onClick={() => setBudgetOn((v) => !v)}
            style={{ ...ghostBtn, borderColor: budgetOn ? T.gold : T.paperDeep, color: budgetOn ? T.gold : T.ink }}>
            <PoundSterling size={13} /> Budget
          </button>
        </div>

        {error && (
          <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, background: "rgba(188,46,39,0.08)", borderRadius: 10, padding: "8px 10px", marginTop: 12, textAlign: "center" }}>
            {error}
          </p>
        )}
      </div>

      {/* ── budget panel (opt-in, money-saving framing) ──────────────────────── */}
      {budgetOn && (
        <div style={{ ...card, padding: 16, background: T.wax }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <PoundSterling size={14} color={T.gold} />
            <p style={{ ...sLabel, color: T.gold }}>Rough basket cost</p>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: T.ink }}>
            about £{budget.toFixed(2)}
          </p>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>
            A friendly estimate for the {toBuy.length} item{toBuy.length === 1 ? "" : "s"} left to buy —
            owned and ticked items are already off the bill.
          </p>
          {swapsAvailable > 0 && (
            <p style={{ fontFamily: UI, fontSize: 12, color: T.gold, marginTop: 8 }}>
              {swapsAvailable} cheaper swap{swapsAvailable === 1 ? "" : "s"} below could trim it further.
            </p>
          )}
        </div>
      )}

      {/* ── empty state ──────────────────────────────────────────────────────── */}
      {buyRows.length === 0 && (
        <div style={{ ...card, padding: "44px 18px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", margin: "0 auto 14px", background: T.paper }}>
            <ShoppingCart size={22} color={T.muted} />
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, marginBottom: 4 }}>Your list is empty</p>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 18, lineHeight: 1.5 }}>
            Build it from this week's plan, or add a few items by hand.
          </p>
          <button onClick={() => setAdding(true)} style={primaryBtn}>
            <Plus size={15} /> Add first item
          </button>
        </div>
      )}

      {/* ── aisle groups ─────────────────────────────────────────────────────── */}
      {Object.entries(grouped).map(([aisle, items]) => {
        const Icon = AISLE_ICON[aisle] || Package;
        const live = items.filter((r) => !r.is_checked && !owned(r.ingredient_name)).length;
        return (
          <div key={aisle} style={{ ...card, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: `1px solid ${T.paperDeep}`, background: T.paper }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center", background: T.wax }}>
                <Icon size={13} color={T.gold} />
              </div>
              <p style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.ink, letterSpacing: 0.3 }}>{aisle}</p>
              <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 12, color: T.muted }}>{live} to buy</span>
            </div>
            <div>
              {items.map((item, idx) => {
                const isOwned = owned(item.ingredient_name);
                const dim = item.is_checked || isOwned;
                const swap = budgetOn && !dim ? SWAP_HINTS[item.ingredient_name] : null;
                return (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    opacity: dim ? 0.45 : 1,
                    borderBottom: idx < items.length - 1 ? `1px solid ${T.paperDeep}` : "none",
                  }}>
                    <button onClick={() => toggleCheck(item)} aria-label={item.is_checked ? "Untick" : "Tick"}
                      style={{
                        width: 20, height: 20, borderRadius: 999, flexShrink: 0, cursor: "pointer",
                        display: "grid", placeItems: "center",
                        background: item.is_checked ? T.sage : "transparent",
                        border: `2px solid ${item.is_checked ? T.sage : T.paperDeep}`,
                      }}>
                      {item.is_checked && <Check size={11} color={T.paper} />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.25,
                        textDecoration: item.is_checked ? "line-through" : "none",
                      }}>
                        {item.ingredient_name}
                      </p>
                      {item.quantity_text && (
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 2 }}>{item.quantity_text}</p>
                      )}
                      {swap && (
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.gold, marginTop: 3, lineHeight: 1.35 }}>{swap}</p>
                      )}
                    </div>
                    {isOwned && (
                      <span style={tag(T.sage)}>in pantry</span>
                    )}
                    {item.source === "manual" && !isOwned && (
                      <span style={tag(T.muted)}>manual</span>
                    )}
                    <button onClick={() => deleteItem(item)} aria-label="Remove"
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: T.muted, flexShrink: 0 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── add manual item ──────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: 16 }}>
        {adding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={sLabel}>Add item</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
                onKeyDown={(e) => e.key === "Enter" && addManual()}
                placeholder="Ingredient…"
                style={{ ...input, flex: 1 }} />
              <input value={newQty} onChange={(e) => setNewQty(e.target.value)}
                placeholder="Qty" style={{ ...input, width: 76 }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {AISLES.map((a) => (
                <button key={a} onClick={() => setNewAisle(a)} style={chip(newAisle === a)}>{a}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAdding(false); setNewName(""); setNewQty(""); }}
                style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>
                <X size={13} /> Cancel
              </button>
              <button onClick={addManual} disabled={!newName.trim()}
                style={{ ...primaryBtn, flex: 1, opacity: newName.trim() ? 1 : 0.5 }}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", width: "100%", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.muted }}>
            <span style={{ width: 20, height: 20, borderRadius: 999, border: `2px dashed ${T.paperDeep}`, display: "grid", placeItems: "center" }}>
              <Plus size={11} />
            </span>
            Add custom item
          </button>
        )}
      </div>

      {/* ── pantry (what you already have) ───────────────────────────────────── */}
      <div style={{ ...card, padding: 16 }}>
        <button onClick={() => setPantryOpen((v) => !v)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", width: "100%" }}>
          <Home size={14} color={T.muted} />
          <p style={sLabel}>Pantry — already have it</p>
          <span style={{ marginLeft: "auto", fontFamily: UI, fontSize: 12, color: T.muted }}>
            {pantryRows.length ? `${pantryRows.length} item${pantryRows.length === 1 ? "" : "s"}` : "add"}
          </span>
        </button>

        {pantryOpen && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
              Anything here is dimmed on your list and left off the basket — so you don't buy it twice.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={pantryDraft} onChange={(e) => setPantryDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPantry()}
                placeholder="e.g. Olive oil, Rice…"
                style={{ ...input, flex: 1 }} />
              <button onClick={addPantry} disabled={!pantryDraft.trim()}
                style={{ ...primaryBtn, opacity: pantryDraft.trim() ? 1 : 0.5, padding: "10px 14px" }}>
                <Plus size={14} /> Add
              </button>
            </div>
            {pantryRows.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {pantryRows.map((p) => (
                  <span key={p.id} style={{
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px",
                    borderRadius: 999, background: T.wax, border: `1px solid ${T.paperDeep}`,
                    fontFamily: UI, fontSize: 12, color: T.inkSoft,
                  }}>
                    {p.ingredient_name}
                    <button onClick={() => removePantry(p)} aria-label={`Remove ${p.ingredient_name}`}
                      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: T.muted, display: "grid", placeItems: "center" }}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: T.muted, textAlign: "center", marginTop: 2 }}>
        One list — built from your plan, sorted by aisle, kind to your budget.
      </p>
    </div>
  );
}

// ── small style helpers ─────────────────────────────────────────────────────────
const tag = (color) => ({
  flexShrink: 0, fontFamily: UI, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.4,
  textTransform: "uppercase", padding: "3px 7px", borderRadius: 999,
  color, border: `1px solid ${color}`, background: "transparent",
});

const chip = (on) => ({
  padding: "5px 10px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700,
  background: on ? T.ink : "transparent",
  color: on ? T.paper : T.muted,
  border: `1px solid ${on ? T.ink : T.paperDeep}`,
});

const input = {
  padding: "11px 13px", borderRadius: 12, border: `1.5px solid ${T.paperDeep}`,
  background: T.paper, fontFamily: SERIF, fontSize: 14, color: T.ink, outline: "none",
};

const primaryBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
  background: T.ink, color: T.paper, border: "none", borderRadius: 12,
  padding: "11px 15px", cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
};

const ghostBtn = {
  flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 11,
  padding: "9px 12px", cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, color: T.ink,
};
