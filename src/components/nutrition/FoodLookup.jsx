import { useState } from "react";
import { Search, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Common foods database with macro estimates per 100g
const FOOD_DB = [
  // Proteins
  { name: "Chicken breast (cooked)", cal: 165, protein: 31, carbs: 0, fat: 3.6, portion: "150g" },
  { name: "Salmon (cooked)", cal: 208, protein: 20, carbs: 0, fat: 13, portion: "150g" },
  { name: "Eggs (2 large)", cal: 143, protein: 13, carbs: 1, fat: 10, portion: "100g" },
  { name: "Greek yoghurt (full fat)", cal: 97, protein: 9, carbs: 4, fat: 5, portion: "200g" },
  { name: "Lentils (cooked)", cal: 116, protein: 9, carbs: 20, fat: 0.4, portion: "200g" },
  { name: "Tofu (firm)", cal: 76, protein: 8, carbs: 2, fat: 4.2, portion: "150g" },
  { name: "Tuna (canned)", cal: 128, protein: 26, carbs: 0, fat: 2.5, portion: "120g" },
  // Grains / Carbs
  { name: "Oats (dry)", cal: 389, protein: 17, carbs: 66, fat: 7, portion: "50g" },
  { name: "Brown rice (cooked)", cal: 111, protein: 2.6, carbs: 23, fat: 0.9, portion: "180g" },
  { name: "Whole wheat bread", cal: 247, protein: 13, carbs: 41, fat: 3.4, portion: "2 slices (70g)" },
  { name: "Pasta (cooked)", cal: 158, protein: 6, carbs: 31, fat: 0.9, portion: "200g" },
  { name: "Sweet potato (cooked)", cal: 90, protein: 2, carbs: 21, fat: 0.1, portion: "150g" },
  { name: "Quinoa (cooked)", cal: 120, protein: 4.4, carbs: 21, fat: 1.9, portion: "185g" },
  // Fruits & Veg
  { name: "Banana", cal: 89, protein: 1.1, carbs: 23, fat: 0.3, portion: "1 medium (120g)" },
  { name: "Apple", cal: 52, protein: 0.3, carbs: 14, fat: 0.2, portion: "1 medium (182g)" },
  { name: "Avocado", cal: 160, protein: 2, carbs: 9, fat: 15, portion: "½ avocado (75g)" },
  { name: "Spinach (raw)", cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, portion: "80g" },
  { name: "Broccoli (cooked)", cal: 55, protein: 3.7, carbs: 11, fat: 0.6, portion: "150g" },
  { name: "Berries (mixed)", cal: 57, protein: 0.7, carbs: 14, fat: 0.3, portion: "150g" },
  // Dairy / Fats
  { name: "Cheddar cheese", cal: 402, protein: 25, carbs: 1.3, fat: 33, portion: "30g" },
  { name: "Almond butter", cal: 614, protein: 21, carbs: 19, fat: 56, portion: "2 tbsp (32g)" },
  { name: "Whole milk", cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, portion: "250ml" },
  { name: "Olive oil", cal: 884, protein: 0, carbs: 0, fat: 100, portion: "1 tbsp (14g)" },
  // Meals
  { name: "Porridge with milk", cal: 140, protein: 6, carbs: 22, fat: 3.5, portion: "1 bowl (300g)" },
  { name: "Caesar salad", cal: 190, protein: 9, carbs: 12, fat: 13, portion: "1 serving (250g)" },
  { name: "Scrambled eggs on toast", cal: 310, protein: 18, carbs: 28, fat: 13, portion: "1 serving" },
  { name: "Chicken stir-fry", cal: 230, protein: 22, carbs: 18, fat: 7, portion: "1 serving (300g)" },
  { name: "Protein shake", cal: 150, protein: 25, carbs: 8, fat: 3, portion: "1 scoop (300ml)" },
  { name: "Dark chocolate (70%+)", cal: 598, protein: 7.8, carbs: 46, fat: 43, portion: "30g (3 squares)" },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "protein", label: "Protein", ids: [0,1,2,3,4,5,6] },
  { id: "carbs", label: "Carbs", ids: [7,8,9,10,11,12] },
  { id: "fruit_veg", label: "Fruit & Veg", ids: [13,14,15,16,17,18] },
  { id: "fats", label: "Fats & Dairy", ids: [19,20,21,22] },
  { id: "meals", label: "Meals", ids: [23,24,25,26,27,28] },
];

function getMacrosForPortion(food) {
  // Scale macros to portion size from per-100g base
  const portions = {
    "150g": 1.5, "120g": 1.2, "200g": 2.0, "50g": 0.5,
    "180g": 1.8, "185g": 1.85, "80g": 0.8, "30g": 0.3,
    "100g": 1.0, "75g": 0.75,
  };
  // Try to parse the portion multiplier
  const match = food.portion.match(/^(\d+)g/);
  const mult = match ? parseInt(match[1]) / 100 : 1;
  return {
    cal: Math.round(food.cal * mult),
    protein: Math.round(food.protein * mult),
    carbs: Math.round(food.carbs * mult),
    fat: Math.round(food.fat * mult),
  };
}

export default function FoodLookup({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [deckIndex, setDeckIndex] = useState(0);

  const filtered = FOOD_DB.filter(f => {
    const matchesQuery = !query || f.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (category === "all") return true;
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.ids?.includes(FOOD_DB.indexOf(f));
  });

  // Reset deck when filter changes
  const handleCategory = (c) => { setCategory(c); setDeckIndex(0); };
  const handleQuery = (q) => { setQuery(q); setDeckIndex(0); };

  const currentFood = filtered[deckIndex];
  const macros = currentFood ? getMacrosForPortion(currentFood) : null;

  const handleSelect = (food) => {
    const m = getMacrosForPortion(food);
    onSelect({
      text: `${food.name} (${food.portion})`,
      description: `${food.name}, ${food.portion} — approx ${m.cal} kcal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fat}g fat`,
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(8px)" }} />

      {/* Sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0",
        maxHeight: "88vh", display: "flex", flexDirection: "column",
        paddingBottom: "env(safe-area-inset-bottom, 20px)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 14px" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Food Library</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", marginTop: 2 }}>Pick a food</h3>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ width: 14, height: 14, color: "var(--mauve)" }} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "0 20px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "10px 14px" }}>
            <Search style={{ width: 15, height: 15, color: "var(--mauve)", flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => handleQuery(e.target.value)}
              placeholder="Search foods…"
              style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14, color: "var(--plum)", }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 20px 16px", scrollbarWidth: "none" }}>
          <style>{`.fl-scroll::-webkit-scrollbar{display:none}`}</style>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => handleCategory(c.id)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                backgroundColor: category === c.id ? "var(--plum)" : "var(--ivory-dark)",
                color: category === c.id ? "white" : "var(--mauve)",
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Deck of cards */}
        <div className="fw-sheet-safe" style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--mauve)", fontSize: 14, padding: "32px 0", }}>No foods found</p>
          ) : (
            <>
              {/* Stacked deck visual */}
              <div style={{ position: "relative", height: 220, marginBottom: 20 }}>
                {/* Shadow cards behind */}
                {[2, 1].map(offset => (
                  filtered[deckIndex + offset] && (
                    <div key={offset} style={{
                      position: "absolute", top: offset * 6, left: offset * 6, right: -offset * 6,
                      height: 190, borderRadius: 20,
                      backgroundColor: offset === 2 ? "var(--ivory-dark)" : "var(--border)",
                      border: "1px solid var(--border)",
                      opacity: offset === 2 ? 0.5 : 0.75,
                    }} />
                  )
                ))}

                {/* Main card */}
                {currentFood && macros && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    backgroundColor: "var(--surface)", border: "1.5px solid var(--border)",
                    borderRadius: 20, padding: 20, boxShadow: "0 8px 28px rgba(42,32,53,0.12)",
                    zIndex: 2,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", lineHeight: 1.3, maxWidth: 220 }}>{currentFood.name}</h4>
                        <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: 3 }}>{currentFood.portion}</p>
                      </div>
                      <div style={{ textAlign: "center", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 14, padding: "10px 14px" }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", lineHeight: 1 }}>{macros.cal}</p>
                        <p style={{ fontSize: 12, color: "var(--mauve)", }}>kcal</p>
                      </div>
                    </div>

                    {/* Macro chips */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Protein", value: `${macros.protein}g`, color: "#FFF8EE", accent: "#A07830" },
                        { label: "Carbs", value: `${macros.carbs}g`, color: "var(--sage-subtle)", accent: "var(--sage)" },
                        { label: "Fat", value: `${macros.fat}g`, color: "var(--mauve-subtle)", accent: "var(--mauve)" },
                      ].map(m => (
                        <div key={m.label} style={{ flex: 1, backgroundColor: m.color, borderRadius: 10, padding: "7px 6px", textAlign: "center" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: m.accent, lineHeight: 1 }}>{m.value}</p>
                          <p style={{ fontSize: 12, color: m.accent, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{m.label}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSelect(currentFood)}
                      style={{ width: "100%", padding: "11px", borderRadius: 14, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Plus style={{ width: 14, height: 14 }} /> Add to meal log
                    </button>
                  </div>
                )}
              </div>

              {/* Deck nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button onClick={() => setDeckIndex(i => Math.max(0, i - 1))} disabled={deckIndex === 0}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", cursor: deckIndex === 0 ? "default" : "pointer", opacity: deckIndex === 0 ? 0.4 : 1, fontSize: 12, fontWeight: 600, color: "var(--plum)" }}>
                  <ChevronLeft style={{ width: 13, height: 13 }} /> Prev
                </button>
                <p style={{ fontSize: 12, color: "var(--mauve)", }}>
                  {deckIndex + 1} of {filtered.length}
                </p>
                <button onClick={() => setDeckIndex(i => Math.min(filtered.length - 1, i + 1))} disabled={deckIndex >= filtered.length - 1}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", cursor: deckIndex >= filtered.length - 1 ? "default" : "pointer", opacity: deckIndex >= filtered.length - 1 ? 0.4 : 1, fontSize: 12, fontWeight: 600, color: "var(--plum)" }}>
                  Next <ChevronRight style={{ width: 13, height: 13 }} />
                </button>
              </div>

              {/* Quick list below deck */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filtered.map((food, i) => {
                  const m = getMacrosForPortion(food);
                  return (
                    <button key={i} onClick={() => handleSelect(food)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, backgroundColor: i === deckIndex ? "var(--rose-dust-subtle)" : "var(--ivory)", border: `1px solid ${i === deckIndex ? "var(--rose-dust-light)" : "var(--border)"}`, cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => { if (i !== deckIndex) e.currentTarget.style.backgroundColor = "var(--ivory-dark)"; }}
                      onMouseLeave={e => { if (i !== deckIndex) e.currentTarget.style.backgroundColor = "var(--ivory)"; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", marginBottom: 1 }}>{food.name}</p>
                        <p style={{ fontSize: 12, color: "var(--mauve)", }}>{food.portion} · {m.cal} kcal · {m.protein}g protein</p>
                      </div>
                      <Plus style={{ width: 14, height: 14, color: "var(--rose-dust)", flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}