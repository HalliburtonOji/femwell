import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from "date-fns";
import { Loader2, Plus, Trash2, Check, RefreshCw, Mail, Copy, CheckCircle, ShoppingCart } from "lucide-react";

const CATEGORIES = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Frozen", "Bakery", "Beverages", "Snacks", "Other"];

const CATEGORY_EMOJIS = {
  "Produce": "🥦", "Dairy & Eggs": "🥛", "Meat & Seafood": "🥩",
  "Pantry": "🫙", "Frozen": "🧊", "Bakery": "🍞",
  "Beverages": "💧", "Snacks": "🍎", "Other": "📦",
};

export default function ShoppingListTab({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [addingItem, setAddingItem] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

    let shoppingItems = [];
    try { shoppingItems = JSON.parse(plan.shopping_list_json || "[]"); } catch {}

    if (shoppingItems.length > 0) {
      // AI categorization
      let categorized = shoppingItems.map(i => ({ ingredient: i, category: "Other", quantity: "" }));
      try {
        const catRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Categorize these grocery items into: Produce, Dairy & Eggs, Meat & Seafood, Pantry, Frozen, Bakery, Beverages, Snacks, Other.
Items: ${shoppingItems.join(", ")}
Return JSON: {"items": [{"ingredient": "name", "category": "CategoryName", "quantity": "estimated amount or empty string"}]}`,
          response_json_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    ingredient: { type: "string" },
                    category: { type: "string" },
                    quantity: { type: "string" }
                  }
                }
              }
            }
          }
        });
        if (catRes.items?.length) categorized = catRes.items;
      } catch {}

      // Remove old meal_plan items
      const old = items.filter(i => i.source === "meal_plan");
      await Promise.all(old.map(i => base44.entities.ShoppingList.delete(i.id)));

      await base44.entities.ShoppingList.bulkCreate(
        categorized.map(ci => ({
          user_id: user.id,
          week_start: weekStart,
          ingredient_name: ci.ingredient,
          quantity_text: ci.quantity || "",
          category: CATEGORIES.includes(ci.category) ? ci.category : "Other",
          is_checked: false,
          source: "meal_plan",
          meal_plan_id: plan.id,
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
      user_id: user.id,
      week_start: weekStart,
      ingredient_name: newItem.trim(),
      quantity_text: newQty.trim(),
      category: newCategory,
      is_checked: false,
      source: "manual",
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
      return `${CATEGORY_EMOJIS[cat]} ${cat}:\n${catItems.map(i => `  • ${i.quantity_text ? i.quantity_text + " " : ""}${i.ingredient_name}`).join("\n")}`;
    }).filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(`🛒 Shopping List — Week of ${weekStart}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailList = async () => {
    const me = await base44.auth.me();
    const html = CATEGORIES.map(cat => {
      const catItems = items.filter(i => i.category === cat && !i.is_checked);
      if (!catItems.length) return null;
      return `<b>${CATEGORY_EMOJIS[cat]} ${cat}</b><br>${catItems.map(i => `&nbsp;&nbsp;• ${i.quantity_text ? i.quantity_text + " " : ""}${i.ingredient_name}`).join("<br>")}`;
    }).filter(Boolean).join("<br><br>");
    await base44.integrations.Core.SendEmail({
      to: me.email,
      subject: `🛒 Shopping List — Week of ${weekStart}`,
      body: `<h2 style="color:#c97b8a">Your Shopping List</h2><p style="color:#888">Week of ${weekStart}</p><br>${html}`,
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
  const checkedCount = items.filter(i => i.is_checked).length;
  const totalCount = items.length;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800">Shopping List</p>
            <p className="text-xs text-gray-400">
              {uncheckedCount} remaining • {checkedCount} checked
            </p>
          </div>
          <button onClick={syncFromMealPlan} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50">
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sync Plan
          </button>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${(checkedCount / totalCount) * 100}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {Math.round((checkedCount / totalCount) * 100)}% complete
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={copyList}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/70 text-gray-600 text-xs font-medium border border-gray-100 hover:bg-gray-50 transition-all">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy List"}
          </button>
          <button onClick={emailList}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-medium border border-rose-100 hover:bg-rose-100 transition-all">
            {emailSent ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Mail className="w-3.5 h-3.5" />}
            {emailSent ? "Sent!" : "Email Me"}
          </button>
          {checkedCount > 0 && (
            <button onClick={clearChecked}
              className="flex items-center justify-center px-3 py-2 rounded-xl bg-gray-50 text-gray-400 text-xs font-medium border border-gray-100 hover:bg-red-50 hover:text-red-400 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="card-glass rounded-2xl p-10 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-600">Your shopping list is empty</p>
          <p className="text-xs text-gray-400 mt-1 mb-5 leading-relaxed">
            Generate a meal plan and tap "Sync Plan" to auto-populate,<br />or add items manually below.
          </p>
          <button onClick={() => setAddingItem(true)}
            className="btn-primary py-2.5 px-6 text-sm mx-auto inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add First Item
          </button>
        </div>
      )}

      {/* Category groups */}
      {Object.entries(groupedItems).map(([category, catItems]) => (
        <div key={category} className="card-glass rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 flex items-center gap-2 bg-white/40 border-b border-white/50">
            <span className="text-base">{CATEGORY_EMOJIS[category]}</span>
            <p className="text-xs font-bold text-gray-700">{category}</p>
            <span className="ml-auto text-[10px] text-gray-400">
              {catItems.filter(i => !i.is_checked).length}/{catItems.length}
            </span>
          </div>
          <div className="divide-y divide-white/40">
            {catItems.map((item) => (
              <div key={item.id}
                className={`flex items-center gap-3 px-4 py-3 transition-all ${item.is_checked ? "opacity-40" : ""}`}>
                <button onClick={() => toggleCheck(item)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.is_checked
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-gray-300 hover:border-emerald-400"}`}>
                  {item.is_checked && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-gray-800 leading-snug ${item.is_checked ? "line-through" : "font-medium"}`}>
                    {item.ingredient_name}
                  </p>
                  {item.quantity_text && (
                    <p className="text-[10px] text-gray-400">{item.quantity_text}</p>
                  )}
                </div>
                {item.source === "manual" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100 flex-shrink-0">
                    manual
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add custom item */}
      <div className="card-glass rounded-2xl p-4">
        {addingItem ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                placeholder="Ingredient name…" autoFocus
                className="flex-1 p-2.5 rounded-xl border border-gray-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              <input value={newQty} onChange={(e) => setNewQty(e.target.value)}
                placeholder="Qty" className="w-20 p-2.5 rounded-xl border border-gray-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setNewCategory(c)}
                  className={`text-xs px-2 py-1 rounded-full transition-all ${newCategory === c ? "bg-rose-500 text-white" : "bg-white/70 text-gray-500 border border-gray-100 hover:bg-rose-50"}`}>
                  {CATEGORY_EMOJIS[c]} {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAddingItem(false); setNewItem(""); setNewQty(""); }}
                className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button onClick={addCustomItem} disabled={!newItem.trim()}
                className="btn-primary flex-1 py-2 text-xs">Add Item</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingItem(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 font-medium w-full transition-colors">
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </div>
            Add custom item
          </button>
        )}
      </div>
    </div>
  );
}