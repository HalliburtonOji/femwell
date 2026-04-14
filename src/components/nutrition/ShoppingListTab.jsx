import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from "date-fns";
import { Loader2, Plus, Trash2, Check, RefreshCw, Mail, Copy, CheckCircle, ShoppingCart, Package, Leaf, Egg, Fish, Archive, Snowflake, Wheat, Droplets, Apple, MoreHorizontal } from "lucide-react";

const CATEGORIES = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Frozen", "Bakery", "Beverages", "Snacks", "Other"];

const CATEGORY_ICONS = {
  "Produce":       Leaf,
  "Dairy & Eggs":  Egg,
  "Meat & Seafood": Fish,
  "Pantry":        Archive,
  "Frozen":        Snowflake,
  "Bakery":        Wheat,
  "Beverages":     Droplets,
  "Snacks":        Apple,
  "Other":         Package,
};

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function ShoppingListTab({ user }) {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [syncing, setSyncing]       = useState(false);
  const [newItem, setNewItem]       = useState("");
  const [newQty, setNewQty]         = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [addingItem, setAddingItem] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [emailSent, setEmailSent]   = useState(false);

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await base44.entities.ShoppingList.filter({ user_id: user.id, week_start: weekStart });
    setItems(data);
    setLoading(false);
  };

  const syncFromMealPlan = async () => {
    setSyncing(true);
    const plans = await base44.entities.MealPlans.filter({ user_id: user.id, week_start: weekStart, is_active: true });
    const plan = plans[0];
    if (!plan) { setSyncing(false); return; }
    // shopping items come from the ShoppingList entity (synced when plan was saved)
    // Re-extract ingredient names from existing meal_plan-sourced ShoppingList rows
    const existingItems = await base44.entities.ShoppingList.filter({ user_id: user.id, week_start: weekStart, source: "meal_plan" });
    const shoppingItems = existingItems.map(i => i.ingredient_name).filter(Boolean);
    if (shoppingItems.length > 0) {
      let categorized = shoppingItems.map(i => ({ ingredient: i, category: "Other", quantity: "" }));
      try {
        const catRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Categorize these grocery items into: Produce, Dairy & Eggs, Meat & Seafood, Pantry, Frozen, Bakery, Beverages, Snacks, Other.
Items: ${shoppingItems.join(", ")}
Return JSON: {"items": [{"ingredient": "name", "category": "CategoryName", "quantity": "estimated amount or empty string"}]}`,
          response_json_schema: { type: "object", properties: { items: { type: "array", items: { type: "object", properties: { ingredient: { type: "string" }, category: { type: "string" }, quantity: { type: "string" } } } } } }
        });
        if (catRes.items?.length) categorized = catRes.items;
      } catch {}
      const old = items.filter(i => i.source === "meal_plan");
      await Promise.all(old.map(i => base44.entities.ShoppingList.delete(i.id)));
      await base44.entities.ShoppingList.bulkCreate(
        categorized.map(ci => ({
          user_id: user.id, week_start: weekStart,
          ingredient_name: ci.ingredient, quantity_text: ci.quantity || "",
          category: CATEGORIES.includes(ci.category) ? ci.category : "Other",
          is_checked: false, source: "meal_plan", meal_plan_id: plan.id,
        }))
      );
      await loadItems();
    }
    setSyncing(false);
  };

  const toggleCheck = async (item) => {
    await base44.entities.ShoppingList.update(item.id, { is_checked: !item.is_checked });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: !i.is_checked } : i));
  };

  const addCustomItem = async () => {
    if (!newItem.trim()) return;
    const created = await base44.entities.ShoppingList.create({
      user_id: user.id, week_start: weekStart,
      ingredient_name: newItem.trim(), quantity_text: newQty.trim(),
      category: newCategory, is_checked: false, source: "manual",
    });
    setItems(prev => [...prev, created]);
    setNewItem(""); setNewQty(""); setAddingItem(false);
  };

  const clearChecked = async () => {
    const checked = items.filter(i => i.is_checked);
    await Promise.all(checked.map(i => base44.entities.ShoppingList.delete(i.id)));
    setItems(prev => prev.filter(i => !i.is_checked));
  };

  const copyList = () => {
    const text = CATEGORIES.map(cat => {
      const catItems = items.filter(i => i.category === cat && !i.is_checked);
      if (!catItems.length) return null;
      return `${cat}:\n${catItems.map(i => `  • ${i.quantity_text ? i.quantity_text + " " : ""}${i.ingredient_name}`).join("\n")}`;
    }).filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(`Shopping List — Week of ${weekStart}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailList = async () => {
    const me = await base44.auth.me();
    const html = CATEGORIES.map(cat => {
      const catItems = items.filter(i => i.category === cat && !i.is_checked);
      if (!catItems.length) return null;
      return `<b>${cat}</b><br>${catItems.map(i => `&nbsp;&nbsp;• ${i.quantity_text ? i.quantity_text + " " : ""}${i.ingredient_name}`).join("<br>")}`;
    }).filter(Boolean).join("<br><br>");
    await base44.integrations.Core.SendEmail({
      to: me.email,
      subject: `Shopping List — Week of ${weekStart}`,
      body: `<h2 style="color:#2A2035;font-family:serif">Your Shopping List</h2><p style="color:#8A7E88">Week of ${weekStart}</p><br>${html}`,
    });
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const uncheckedCount = items.filter(i => !i.is_checked).length;
  const checkedCount   = items.filter(i => i.is_checked).length;
  const totalCount     = items.length;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-[24px] p-5 space-y-4" style={card}>
        <div className="flex items-center justify-between">
          <div>
            <p style={sLabel} className="mb-0.5">This Week</p>
            <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              {uncheckedCount} remaining
              <span className="font-normal ml-1.5" style={{ color: "var(--mauve)" }}>· {checkedCount} done</span>
            </p>
          </div>
          <button onClick={syncFromMealPlan} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", border: "1px solid var(--sage-light)" }}>
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sync Plan
          </button>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(checkedCount / totalCount) * 100}%`, backgroundColor: "var(--sage)" }} />
            </div>
            <p className="text-[10px] mt-1" style={{ color: "var(--mauve)" }}>
              {Math.round((checkedCount / totalCount) * 100)}% complete
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={copyList}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ border: "1.5px solid var(--border)", color: "var(--plum)" }}>
            {copied ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy List"}
          </button>
          <button onClick={emailList}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)" }}>
            {emailSent ? <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} /> : <Mail className="w-3.5 h-3.5" />}
            {emailSent ? "Sent" : "Email Me"}
          </button>
          {checkedCount > 0 && (
            <button onClick={clearChecked}
              className="flex items-center justify-center px-3 py-2 rounded-xl text-xs transition-all"
              style={{ border: "1.5px solid var(--border)", color: "var(--mauve)" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--rose-dust-subtle)"; e.currentTarget.style.color = "var(--rose-dust)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--mauve)"; }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-[24px] py-12 text-center" style={card}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--ivory-dark)" }}>
            <ShoppingCart className="w-6 h-6" style={{ color: "var(--mauve)" }} />
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--plum)" }}>Your shopping list is empty</p>
          <p className="text-xs mb-6 leading-relaxed" style={{ color: "var(--mauve)" }}>
            Generate a meal plan and sync, or add items manually
          </p>
          <button onClick={() => setAddingItem(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{ backgroundColor: "var(--plum)", color: "white" }}>
            <Plus className="w-4 h-4" /> Add First Item
          </button>
        </div>
      )}

      {/* Category groups */}
      {Object.entries(groupedItems).map(([category, catItems]) => {
        const Icon = CATEGORY_ICONS[category] || Package;
        return (
          <div key={category} className="rounded-[24px] overflow-hidden" style={card}>
            <div className="px-5 py-3 flex items-center gap-2.5"
              style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--ivory)" }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
                <Icon className="w-3.5 h-3.5" style={{ color: "var(--rose-dust)" }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{category}</p>
              <span className="ml-auto text-[10px]" style={{ color: "var(--mauve)" }}>
                {catItems.filter(i => !i.is_checked).length}/{catItems.length}
              </span>
            </div>
            <div style={{ backgroundColor: "var(--surface)" }}>
              {catItems.map((item, idx) => (
                <div key={item.id}
                  className="flex items-center gap-3.5 px-5 py-3.5 transition-all"
                  style={{
                    opacity: item.is_checked ? 0.45 : 1,
                    borderBottom: idx < catItems.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                  <button onClick={() => toggleCheck(item)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: item.is_checked ? "var(--sage)" : "transparent",
                      borderColor: item.is_checked ? "var(--sage)" : "var(--border)",
                    }}>
                    {item.is_checked && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug"
                      style={{
                        color: "var(--plum)",
                        textDecoration: item.is_checked ? "line-through" : "none",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: item.is_checked ? 400 : 500,
                      }}>
                      {item.ingredient_name}
                    </p>
                    {item.quantity_text && (
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--mauve)" }}>{item.quantity_text}</p>
                    )}
                  </div>
                  {item.source === "manual" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "var(--ivory)", color: "var(--mauve)", border: "1px solid var(--border)" }}>
                      manual
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add custom item */}
      <div className="rounded-[24px] p-5" style={card}>
        {addingItem ? (
          <div className="space-y-3">
            <p style={sLabel}>Add Item</p>
            <div className="flex gap-2">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                placeholder="Ingredient name…" autoFocus
                className="flex-1 p-3 rounded-2xl text-sm focus:outline-none transition-all"
                style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
              <input value={newQty} onChange={(e) => setNewQty(e.target.value)}
                placeholder="Qty"
                className="w-20 p-3 rounded-2xl text-sm focus:outline-none transition-all"
                style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setNewCategory(c)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{
                    backgroundColor: newCategory === c ? "var(--plum)" : "var(--ivory)",
                    color: newCategory === c ? "white" : "var(--mauve)",
                    border: `1px solid ${newCategory === c ? "var(--plum)" : "var(--border)"}`,
                  }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAddingItem(false); setNewItem(""); setNewQty(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: "1.5px solid var(--border)", color: "var(--plum)" }}>
                Cancel
              </button>
              <button onClick={addCustomItem} disabled={!newItem.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--plum)", color: "white", opacity: !newItem.trim() ? 0.5 : 1 }}>
                Add
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingItem(true)}
            className="flex items-center gap-2.5 text-sm font-medium w-full transition-colors"
            style={{ color: "var(--mauve)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--plum)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--mauve)"}>
            <div className="w-5 h-5 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: "var(--border)" }}>
              <Plus className="w-3 h-3" />
            </div>
            Add custom item
          </button>
        )}
      </div>
    </div>
  );
}