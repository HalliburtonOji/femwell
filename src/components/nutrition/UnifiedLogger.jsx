// UnifiedLogger — the new heart of FemWell's Nutrition logging.
//
// A calm, bottom-sheet-friendly meal logger built around the master plan vision
// ("2 · Logging — the heart" + "3 · The food database"):
//   · a camera-first METHODS row: Recents/Favourites · Search · Scan · Say · Type · Snap
//   · every method ends at an EDITABLE DRAFT (a confirmable line-item, never a
//     locked verdict) the user confirms with "Add to today"
//   · DB-first: Open Food Facts (free, keyless) for Search + Scan; the existing
//     analyzeMeal function as the LLM fallback parser for Say + Type
//   · no scoreboard — after a log, a single gentle stage-relevant nutrient line
//
// REAL DATA ONLY. No mock macros anywhere. Every external fetch is guarded with an
// AbortController + ~6s timeout + .catch fallback (this app has a documented
// fetch-hang risk). Every entity write is guarded with withTimeout, optimistic,
// with a visible error. Missing data → calm empty states, never a crash.
//
// Brand: Editorial cream/plum tokens, Lucide icons, NO EMOJI, phone-first.
//
// Props: { user, profile, onLogged }
import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Search, ScanBarcode, Mic, Pencil, Camera, History,
  Plus, Loader2, Check, ArrowLeft, Leaf,
} from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { withTimeout } from "@/utils/safeEntity";
import { inferMealTypeFromTime } from "@/utils/nutritionAiAnalysis";
import { offMicrosFromNutriments } from "@/utils/foodModel";
import { mealEstimate, cofidFloorMicros } from "@/utils/cofid";
import { topFoods, frequentFavourites } from "@/utils/personalisation";

const OFF_TIMEOUT_MS = 6000;
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS = { breakfast: "Morning", lunch: "Midday", dinner: "Evening", snack: "Snack" };

// ── stage-relevant nutrient lines (qualitative, never a calorie tally) ─────────
function stageNutrientLine(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const byStage = {
    perimenopause: "A little iron and steady protein this week can soften the dips.",
    menopause: "Calcium and a touch more protein go a long way right now.",
    "post-menopause": "Calcium and protein quietly protect bone and muscle from here.",
    pregnant: "Little and often tends to sit best — whatever stays down is enough.",
    "pregnant-t1": "Little and often tends to sit best — whatever stays down is enough.",
    "pregnant-t2": "Iron and calcium are doing quiet work as baby grows.",
    "pregnant-t3": "Small, frequent plates ease the squeeze — fibre helps too.",
    postpartum: "Hydration and easy-to-reach food first — feeding yourself counts.",
    ttc: "Colour on the plate and good fats are quietly doing a lot this season.",
    "pre-ttc": "Folate-rich greens and wholegrains are a kind foundation now.",
    teen: "Iron and calcium matter most while you're still growing.",
    reproductive: "Iron-rich foods around your period help keep energy steady.",
  };
  return byStage[stage] || "One nourishing thing is plenty — the next plate is always a fresh start.";
}

// ── Open Food Facts helpers (REAL, keyless) ────────────────────────────────────
// All fetches guarded: AbortController + ~6s timeout + .catch → caller falls back.
function withAbort(ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(timer) };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Map an OFF product → a draft (per-portion estimate; OFF gives per-100g, default 100g).
function productToDraft(product, fallbackName) {
  if (!product) return null;
  const n = product.nutriments || {};
  const name = (product.product_name || fallbackName || "").trim();
  if (!name) return null;
  const brand = (product.brands || "").split(",")[0]?.trim();
  // MICROS: OFF stores iron/calcium/folate per 100g in grams; scale to our default
  // 100g portion and convert to mg/µg via the shared spine helper (handles OFF units
  // defensively). These ride along on the draft so the saved meal carries micros.
  const micros = offMicrosFromNutriments(n, 100);
  return {
    name: brand ? `${name} (${brand})` : name,
    portion: "100g",
    // OFF nutriments are per 100g — our default portion is 100g, so 1:1.
    kcal: Math.round(num(n["energy-kcal_100g"])),
    protein_g: Math.round(num(n.proteins_100g)),
    carbs_g: Math.round(num(n.carbohydrates_100g)),
    fat_g: Math.round(num(n.fat_100g)),
    // carried-through micros (mg / µg); undefined when OFF had none for this product
    iron_mg: micros.iron_mg,
    folate_ug: micros.folate_ug,
    calcium_mg: micros.calcium_mg,
    source: "openfoodfacts",
  };
}

async function offSearch(query) {
  const q = query.trim();
  if (!q) return [];
  const { signal, done } = withAbort(OFF_TIMEOUT_MS);
  const url =
    "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" +
    encodeURIComponent(q) +
    "&search_simple=1&action=process&json=1&page_size=8" +
    "&fields=product_name,brands,nutriments,code";
  try {
    const res = await fetch(url, { signal });
    done();
    if (!res.ok) return [];
    const data = await res.json();
    const products = Array.isArray(data?.products) ? data.products : [];
    return products
      .map((p) => productToDraft(p))
      .filter((d) => d && d.name);
  } catch {
    done();
    return [];
  }
}

async function offByBarcode(code) {
  const c = String(code || "").trim();
  if (!c) return null;
  const { signal, done } = withAbort(OFF_TIMEOUT_MS);
  const url = "https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(c) + ".json";
  try {
    const res = await fetch(url, { signal });
    done();
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status !== 1 || !data?.product) return null;
    return productToDraft(data.product, "Scanned item");
  } catch {
    done();
    return null;
  }
}

// ── small shared UI bits ───────────────────────────────────────────────────────
const sheetCard = {
  background: T.paperHi,
  border: `1px solid ${T.paperDeep}`,
  borderRadius: 16,
};

function Eyebrow({ children, color = T.muted }) {
  return (
    <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function MethodButton({ Icon, label, note, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: "1 0 28%", minWidth: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "13px 8px",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1,
      }}
    >
      <Icon size={20} color={T.crimson} />
      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.ink, letterSpacing: 0.3 }}>{label}</span>
      {note ? <span style={{ fontFamily: UI, fontSize: 8.5, color: T.muted, textAlign: "center", lineHeight: 1.2 }}>{note}</span> : null}
    </button>
  );
}

function BackBar({ onBack, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <button onClick={onBack} aria-label="Back"
        style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}>
        <ArrowLeft size={15} />
      </button>
      <span style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontWeight: 600 }}>{title}</span>
    </div>
  );
}

// ── the editable draft — the core confirmable pattern ──────────────────────────
function EditableDraft({ draft, onChange, onConfirm, saving, mealType, onMealType }) {
  const field = (label, key, suffix) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <input
          type="number" inputMode="numeric" min="0"
          value={draft[key] ?? ""}
          onChange={(e) => onChange({ ...draft, [key]: e.target.value === "" ? "" : Math.max(0, Number(e.target.value)) })}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontSize: 14, fontFamily: UI, outline: "none", boxSizing: "border-box" }}
        />
        {suffix ? <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{suffix}</span> : null}
      </div>
    </div>
  );

  return (
    <div style={{ ...sheetCard, padding: 16 }}>
      <Eyebrow color={T.crimson}>Editable draft — confirm to log</Eyebrow>

      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>What it is</div>
      <input
        value={draft.name}
        onChange={(e) => onChange({ ...draft, name: e.target.value })}
        placeholder="Name this food"
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontSize: 15, fontFamily: SERIF, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
      />

      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Portion</div>
      <input
        value={draft.portion ?? ""}
        onChange={(e) => onChange({ ...draft, portion: e.target.value })}
        placeholder="e.g. 1 bowl, 150g, 1 serving"
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontSize: 14, fontFamily: UI, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {field("Calories", "kcal", "kcal")}
        {field("Protein", "protein_g", "g")}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {field("Carbs", "carbs_g", "g")}
        {field("Fat", "fat_g", "g")}
      </div>

      <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>When</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {MEAL_TYPES.map((t) => {
          const on = mealType === t;
          return (
            <button key={t} onClick={() => onMealType(t)}
              style={{ flex: 1, minWidth: 64, padding: "8px 0", borderRadius: 999, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${on ? T.ink : T.paperDeep}`, background: on ? T.ink : T.paperHi, color: on ? T.paper : T.muted }}>
              {MEAL_LABELS[t]}
            </button>
          );
        })}
      </div>

      {draft.source === "openfoodfacts" && (
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 12 }}>
          Food data &copy; Open Food Facts (ODbL)
        </div>
      )}

      <button onClick={onConfirm} disabled={saving || !draft.name?.trim()}
        style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "13px 16px",
          fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
          cursor: saving || !draft.name?.trim() ? "default" : "pointer", opacity: saving || !draft.name?.trim() ? 0.5 : 1 }}>
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {saving ? "Adding…" : "Add to today"}
      </button>
    </div>
  );
}

export default function UnifiedLogger({ user, profile, onLogged, initialView }) {
  // view: home | search | scan | say | type | photo | draft | done
  const [view, setView] = useState(initialView || "home");
  const [mealType, setMealType] = useState(() => inferMealTypeFromTime());

  // recents + favourites (real)
  const [recents, setRecents] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loadingChips, setLoadingChips] = useState(true);

  // search
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  // barcode
  const [barcode, setBarcode] = useState("");
  const [scanState, setScanState] = useState("idle"); // idle | scanning | looking | error
  const videoRef = useRef(null);
  const scanStopRef = useRef(null);

  // voice / type
  const [freeText, setFreeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // photo
  const [photoState, setPhotoState] = useState("idle"); // idle | reading | error
  const photoInputRef = useRef(null);

  // draft + save
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const speechSupported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const barcodeSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  // ── load recents + favourites (real, guarded) ────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) { setLoadingChips(false); return; }
      // pull a wider window (60) so MEMORY can rank by how often + how recently a
      // food turns up, not just the newest single log. Guarded + .catch → [].
      const [rows, tmpl] = await Promise.all([
        base44.entities.MealLog.filter({ user_id: user.id }, "-created_date", 60).catch(() => []),
        base44.entities.MealTemplates.filter({ user_id: user.id }).catch(() => []),
      ]);
      if (!alive) return;
      const mealRows = (rows || []).filter(Boolean);

      // RECENTS, ranked by memory: most-logged (recency-weighted) go-tos lead. Keep the
      // freshest underlying row per food so one-tap re-log carries meal_type + ai_analysis.
      const latestByKey = new Map();
      for (const m of mealRows) {
        const k = (m.raw_text || "").trim().toLowerCase();
        if (!k || latestByKey.has(k)) continue; // rows are newest-first → first seen is freshest
        latestByKey.set(k, m);
      }
      const ranked = topFoods(mealRows, { limit: 8 });
      const distinct = ranked.map((f) => {
        const src = latestByKey.get(f.key) || {};
        return { id: src.id || f.key, name: f.name, meal_type: src.meal_type, ai_analysis: src.ai_analysis };
      });
      setRecents(distinct);

      // FAVOURITES: the user's real MealTemplates PLUS learned go-tos (foods logged
      // often enough across days to feel like favourites), deduped + ranked.
      setFavourites(frequentFavourites(mealRows, tmpl));
      setLoadingChips(false);
    })();
    return () => { alive = false; };
  }, [user]);

  // clean up camera + speech on unmount / view change away
  useEffect(() => {
    return () => {
      try { scanStopRef.current?.(); } catch { /* no-op */ }
      try { recognitionRef.current?.stop(); } catch { /* no-op */ }
    };
  }, []);

  // ── create a MealLog (guarded, optimistic-friendly) ──────────────────────────
  // raw_text is the human description; ai_analysis carries macros when we have them
  // (from OFF or a confirmed draft) so the rest of the app reads them via getMealSummary.
  const createMeal = useCallback(async ({ rawText, type, analysis }) => {
    const dayKey = new Date().toISOString().slice(0, 10);
    const payload = {
      user_id: user.id,
      day_key: dayKey,
      logged_at: new Date().toISOString(),
      meal_type: type || mealType,
      method: analysis ? "database" : "text",
      raw_text: rawText,
    };
    if (analysis) payload.ai_analysis = analysis;
    return withTimeout(base44.entities.MealLog.create(payload), 6000, "save");
  }, [user, mealType]);

  // turn an editable draft → ai_analysis shape the app understands.
  // MICROS (iron_mg / folate_ug / calcium_mg) ride along on summary AND items when
  // present, so the nutrition spine (dayNutrition) can read them. Only attach a micro
  // when it actually has a value — never invent a 0 that looks like real data.
  const draftToAnalysis = (d) => {
    const micro = (k) => (num(d[k]) > 0 ? { [k]: num(d[k]) } : null);
    const micros = Object.assign({}, micro("iron_mg"), micro("folate_ug"), micro("calcium_mg"));
    return {
      summary: {
        calories: num(d.kcal),
        protein_g: num(d.protein_g),
        carbs_g: num(d.carbs_g),
        fat_g: num(d.fat_g),
        ...micros,
      },
      items: [{
        name: d.name,
        calories: num(d.kcal),
        protein_g: num(d.protein_g),
        carbs_g: num(d.carbs_g),
        fat_g: num(d.fat_g),
        ...micros,
      }],
      source: d.source || "manual",
    };
  };

  // ── one-tap re-log of a recent / favourite (optimistic, guarded) ─────────────
  const reLog = async (name, type, analysis) => {
    setSaving(true);
    try {
      await createMeal({ rawText: name, type: type || mealType, analysis });
      toast.success("Logged");
      finishLog();
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
      setSaving(false);
    }
  };

  // ── confirm the editable draft → real MealLog ────────────────────────────────
  const confirmDraft = async () => {
    if (!draft?.name?.trim()) return;
    setSaving(true);
    try {
      const hasMacros = num(draft.kcal) || num(draft.protein_g) || num(draft.carbs_g) || num(draft.fat_g)
        || num(draft.iron_mg) || num(draft.folate_ug) || num(draft.calcium_mg);
      const rawText = draft.portion?.trim() ? `${draft.name.trim()} (${draft.portion.trim()})` : draft.name.trim();
      // For a photo draft, keep the rich returned analysis (items / smart_swaps)
      // but overlay the (possibly edited) summary macros so the user's edits win.
      let analysis = hasMacros ? draftToAnalysis(draft) : null;
      if (analysis && draft.source === "photo" && draft.ai_analysis) {
        analysis = { ...draft.ai_analysis, summary: analysis.summary, source: "photo" };
      }
      await createMeal({ rawText, type: mealType, analysis });
      toast.success("Added to today");
      finishLog();
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
      setSaving(false);
    }
  };

  const finishLog = () => {
    setSaving(false);
    setView("done");
    try { onLogged?.(); } catch { /* no-op */ }
  };

  // ── SEARCH (OFF, real keyless) ───────────────────────────────────────────────
  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearched(true);
    const out = await offSearch(q); // already guarded + .catch → []
    setResults(out);
    setSearching(false);
  };

  // OFF empty/timeout → fall back to the existing analyzeMeal free-text parser
  const searchFallbackToLLM = async () => {
    const q = query.trim();
    if (!q) return;
    await parseFreeText(q);
  };

  // ── BARCODE (OFF, real keyless) ──────────────────────────────────────────────
  const lookupBarcode = async (code) => {
    setScanState("looking");
    const d = await offByBarcode(code); // guarded
    if (d) {
      setDraft(d);
      setView("draft");
      setScanState("idle");
    } else {
      setScanState("error");
    }
  };

  const startCameraScan = async () => {
    if (!barcodeSupported) return;
    setScanState("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      // eslint-disable-next-line no-undef
      const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
      let stopped = false;
      const stop = () => {
        stopped = true;
        try { stream.getTracks().forEach((t) => t.stop()); } catch { /* no-op */ }
      };
      scanStopRef.current = stop;
      const tick = async () => {
        if (stopped || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0 && codes[0].rawValue) {
            stop();
            lookupBarcode(codes[0].rawValue);
            return;
          }
        } catch { /* keep trying */ }
        if (!stopped) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch {
      // permission denied / no camera — fall back to manual entry, never crash
      setScanState("idle");
      toast("Camera unavailable — enter the barcode below");
    }
  };

  const stopCameraScan = () => {
    try { scanStopRef.current?.(); } catch { /* no-op */ }
    scanStopRef.current = null;
    setScanState("idle");
  };

  // ── VOICE + TYPE (analyzeMeal, the real existing fn) ─────────────────────────
  const parseFreeText = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setParsing(true);
    try {
      const response = await withTimeout(
        base44.functions.invoke("analyzeMeal", { raw_text: trimmed }),
        18000, "analysis"
      );
      const res = response?.data || response;
      const summary = res?.summary || res?.nutritional_summary;
      const firstItem = Array.isArray(res?.items) ? res.items[0] : null;
      // Build a draft from whatever the parser returned; macros are real or blank
      // (never invented). User edits before confirming.
      // keep any micros analyzeMeal returned (summary-first, item-fallback) so they
      // persist through to ai_analysis via draftToAnalysis.
      const micro = (k) => num(summary?.[k]) || num(firstItem?.[k]) || undefined;
      setDraft({
        name: trimmed,
        portion: "",
        kcal: summary?.calories ? Math.round(summary.calories) : (firstItem?.calories ? Math.round(firstItem.calories) : ""),
        protein_g: summary?.protein_g ? Math.round(summary.protein_g) : "",
        carbs_g: summary?.carbs_g ? Math.round(summary.carbs_g) : "",
        fat_g: summary?.fat_g ? Math.round(summary.fat_g) : "",
        iron_mg: micro("iron_mg"),
        folate_ug: micro("folate_ug"),
        calcium_mg: micro("calcium_mg"),
        source: "manual",
      });
      setView("draft");
    } catch {
      // analyzeMeal slow/errored — still let the user log the text with blank macros
      setDraft({ name: trimmed, portion: "", kcal: "", protein_g: "", carbs_g: "", fat_g: "", source: "manual" });
      setView("draft");
      toast("Logged as text — add details if you like");
    }
    setParsing(false);
  };

  const startListening = () => {
    if (!speechSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      const rec = new SR();
      rec.lang = "en-GB";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const said = e.results?.[0]?.[0]?.transcript || "";
        setFreeText(said);
        setListening(false);
        if (said) parseFreeText(said);
      };
      rec.onerror = () => { setListening(false); toast("Didn't catch that — try typing it"); };
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      toast("Voice unavailable — try typing it");
    }
  };

  // ── PHOTO (analyzeMealPhoto — gpt-4o-mini vision via the existing key) ────────
  // Downscale the chosen image onto a canvas (max ~900px long edge) → a JPEG data
  // URL, so the payload stays small. Then invoke with a timeout guard. Clean
  // degrade on slow/unreadable/not-food — never crash, never invent macros.
  const PHOTO_MAX_EDGE = 900;

  const downscaleToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("decode"));
        img.onload = () => {
          try {
            const longEdge = Math.max(img.width, img.height) || 1;
            const scale = Math.min(1, PHOTO_MAX_EDGE / longEdge);
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("ctx"));
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          } catch {
            reject(new Error("canvas"));
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handlePhotoPicked = async (e) => {
    const file = e.target.files?.[0];
    // allow re-picking the same file next time
    if (e.target) e.target.value = "";
    if (!file) return;
    setPhotoState("reading");
    let imageBase64;
    try {
      imageBase64 = await downscaleToDataUrl(file);
    } catch {
      setPhotoState("error");
      return;
    }
    try {
      const response = await withTimeout(
        base44.functions.invoke("analyzeMealPhoto", {
          image_base64: imageBase64,
          cycle_phase: profile?.cycle_phase,
          wellness_goal: profile?.wellness_goal,
        }),
        28000, "photo"
      );
      const res = response?.data || response;
      const summary = res?.summary;
      const firstItem = Array.isArray(res?.items) ? res.items[0] : null;
      // Clean degrade: explicit unavailable flag, or nothing usable came back.
      if (res?.analysis_unavailable || (!summary && !firstItem)) {
        setPhotoState("error");
        return;
      }
      const lowConfidence =
        typeof res.photo_confidence === "number" && res.photo_confidence < 0.5;
      const name = (firstItem?.name || "").trim() || "Photographed meal";

      // PHOTO ENRICHMENT (no new key — reuses the CoFID spine): the vision model names the
      // dish/ingredients well but its macros/micros can be partial or zero for composite UK
      // dishes (e.g. "katsu curry"). Backfill ONLY the fields the model left empty from the
      // CoFID food table, keyed on the recognised item/dish names. Honest: micros only fill
      // where CoFID actually carries them (0 stays 0), and a real model value always wins.
      const photoText = [
        firstItem?.name,
        ...(Array.isArray(res?.items) ? res.items.map((it) => it?.name) : []),
      ].filter(Boolean).join(", ");
      const est = photoText ? mealEstimate(photoText, inferMealTypeFromTime()) : null;
      const floorMicros = photoText ? cofidFloorMicros(photoText) : null;
      const macro = (k, estKey) => {
        const real = num(summary?.[k]) || num(firstItem?.[k]);
        if (real > 0) return Math.round(real);
        return est && est[estKey] > 0 ? Math.round(est[estKey]) : "";
      };
      const micro = (k) => {
        const real = num(summary?.[k]) || num(firstItem?.[k]);
        if (real > 0) return real;
        return floorMicros && floorMicros[k] > 0 ? floorMicros[k] : undefined;
      };
      setDraft({
        name,
        portion: firstItem?.quantity_text || "",
        kcal: macro("calories", "kcal"),
        protein_g: macro("protein_g", "protein_g"),
        carbs_g: macro("carbs_g", "carbs_g"),
        fat_g: macro("fat_g", "fat_g"),
        iron_mg: micro("iron_mg"),
        folate_ug: micro("folate_ug"),
        calcium_mg: micro("calcium_mg"),
        source: "photo",
        ai_analysis: { ...res, source: "photo" },
        lowConfidence,
      });
      setPhotoState("idle");
      setView("draft");
    } catch {
      // timeout / network / function error — calm degrade, never crash
      setPhotoState("error");
    }
  };

  // ── views ────────────────────────────────────────────────────────────────────
  const goHome = () => {
    stopCameraScan();
    try { recognitionRef.current?.stop(); } catch { /* no-op */ }
    setResults([]); setSearched(false); setScanState("idle"); setPhotoState("idle");
    setView("home");
  };

  // HOME — methods row + recents + favourites
  if (view === "home") {
    return (
      <div>
        <Eyebrow>How would you like to log?</Eyebrow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <MethodButton Icon={History} label="Recents" onClick={() => document.getElementById("ul-recents")?.scrollIntoView({ behavior: "smooth" })} />
          <MethodButton Icon={Search} label="Search" onClick={() => setView("search")} />
          <MethodButton Icon={ScanBarcode} label="Scan" onClick={() => setView("scan")} />
          <MethodButton Icon={Mic} label="Say it" note={speechSupported ? null : "not on this device"} disabled={!speechSupported} onClick={() => { setView("say"); startListening(); }} />
          <MethodButton Icon={Pencil} label="Type it" onClick={() => setView("type")} />
          <MethodButton Icon={Camera} label="Snap" onClick={() => setView("photo")} />
        </div>

        {/* Favourites */}
        {favourites.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <Eyebrow>Favourites — one tap to log</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {favourites.map((f) => {
                // two shapes: a real MealTemplate (learned:false → title + default_meal_type
                // + ai_analysis) or a learned go-to (learned:true → name + key, no macros yet).
                const label = f.learned ? f.name : f.title;
                const key = f.learned ? `learned-${f.key}` : f.id;
                return (
                  <button key={key} disabled={saving}
                    onClick={() => reLog(label, f.default_meal_type, f.ai_analysis)}
                    style={chip}>
                    <Plus size={11} color={T.crimson} />
                    <span style={{ fontFamily: SERIF, fontSize: 12.5, color: T.ink }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recents */}
        <div id="ul-recents">
          <Eyebrow>Recents — one tap to re-add</Eyebrow>
          {loadingChips ? (
            <div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Loading your recents…</div>
          ) : recents.length === 0 ? (
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
              Nothing logged yet — your go-to meals will gather here for one-tap re-adding.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {recents.map((r) => (
                <button key={r.id} disabled={saving}
                  onClick={() => reLog(r.name, r.meal_type, r.ai_analysis)}
                  style={chip}>
                  <Plus size={11} color={T.crimson} />
                  <span style={{ fontFamily: SERIF, fontSize: 12.5, color: T.ink }}>{r.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SEARCH
  if (view === "search") {
    return (
      <div>
        <BackBar onBack={goHome} title="Search foods" />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, ...sheetCard, padding: "10px 12px" }}>
            <Search size={15} color={T.muted} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              placeholder="e.g. greek yoghurt, hummus, oat milk"
              autoFocus
              style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14, fontFamily: UI, color: T.ink }}
            />
          </div>
          <button onClick={runSearch} disabled={!query.trim() || searching}
            style={{ background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "0 16px", fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: !query.trim() || searching ? "default" : "pointer", opacity: !query.trim() || searching ? 0.5 : 1 }}>
            {searching ? <Loader2 size={15} className="animate-spin" /> : "Search"}
          </button>
        </div>

        {searching ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: UI, fontSize: 12, color: T.muted }}>
            <Loader2 size={14} className="animate-spin" /> Searching the food database…
          </div>
        ) : searched && results.length === 0 ? (
          <div style={{ ...sheetCard, padding: 16 }}>
            <div style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, marginBottom: 4 }}>No database match.</div>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", marginBottom: 12 }}>
              We can describe it in your own words instead — we'll estimate from there.
            </div>
            <button onClick={searchFallbackToLLM} disabled={parsing}
              style={{ width: "100%", background: T.crimson, color: T.paper, border: "none", borderRadius: 10, padding: "11px", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: parsing ? "default" : "pointer", opacity: parsing ? 0.6 : 1 }}>
              {parsing ? "Estimating…" : `Estimate "${query.trim()}" from text`}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r, i) => (
              <button key={i} onClick={() => { setDraft({ ...r }); setView("draft"); }}
                style={{ display: "flex", alignItems: "center", gap: 12, ...sheetCard, padding: "12px 14px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{r.name}</div>
                  <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 2 }}>
                    per 100g · {r.kcal} kcal · {r.protein_g}g protein
                  </div>
                </div>
                <Plus size={15} color={T.crimson} />
              </button>
            ))}
            {results.length > 0 && (
              <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 4 }}>
                Food data &copy; Open Food Facts (ODbL)
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // SCAN
  if (view === "scan") {
    return (
      <div>
        <BackBar onBack={goHome} title="Scan a barcode" />
        {barcodeSupported && scanState === "scanning" && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ ...sheetCard, overflow: "hidden", aspectRatio: "4 / 3", position: "relative" }}>
              <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <button onClick={stopCameraScan}
              style={{ width: "100%", marginTop: 8, background: T.paperHi, border: `1px solid ${T.paperDeep}`, color: T.ink, borderRadius: 10, padding: "10px", fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Stop camera
            </button>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 8, textAlign: "center" }}>
              Hold a barcode steady in the frame…
            </div>
          </div>
        )}

        {scanState === "looking" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: UI, fontSize: 12, color: T.muted, marginBottom: 14 }}>
            <Loader2 size={14} className="animate-spin" /> Looking that up…
          </div>
        )}

        {scanState === "error" && (
          <div style={{ ...sheetCard, padding: 14, marginBottom: 14 }}>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.ink }}>Not found in the database.</div>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 2 }}>
              Try another barcode, or search by name instead.
            </div>
          </div>
        )}

        {barcodeSupported && scanState === "idle" && (
          <button onClick={startCameraScan}
            style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "13px", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer", marginBottom: 14 }}>
            <Camera size={15} /> Scan with camera
          </button>
        )}

        {/* manual entry — always available, the universal barcode fallback */}
        <Eyebrow>{barcodeSupported ? "Or enter the barcode" : "Enter the barcode"}</Eyebrow>
        {!barcodeSupported && (
          <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginBottom: 8 }}>
            Live camera scanning isn't supported on this device — type the number under the barcode.
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, ...sheetCard, padding: "10px 12px" }}>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter" && barcode.trim()) lookupBarcode(barcode.trim()); }}
              inputMode="numeric"
              placeholder="e.g. 5000159484695"
              style={{ width: "100%", border: "none", background: "none", outline: "none", fontSize: 14, fontFamily: UI, color: T.ink }}
            />
          </div>
          <button onClick={() => barcode.trim() && lookupBarcode(barcode.trim())} disabled={!barcode.trim() || scanState === "looking"}
            style={{ background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "0 16px", fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: !barcode.trim() ? "default" : "pointer", opacity: !barcode.trim() ? 0.5 : 1 }}>
            Look up
          </button>
        </div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 12 }}>
          Food data &copy; Open Food Facts (ODbL)
        </div>
      </div>
    );
  }

  // SAY
  if (view === "say") {
    return (
      <div>
        <BackBar onBack={goHome} title="Say it" />
        <div style={{ ...sheetCard, padding: 20, textAlign: "center", marginBottom: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, margin: "0 auto 12px", display: "grid", placeItems: "center",
            background: listening ? T.crimson : T.paperHi, border: `1px solid ${listening ? T.crimson : T.paperDeep}` }}>
            <Mic size={26} color={listening ? T.paper : T.crimson} />
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, marginBottom: 4 }}>
            {listening ? "Listening…" : parsing ? "Working it out…" : "Tap to speak your meal"}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginBottom: 14 }}>
            Say it naturally — "porridge with berries and a coffee".
          </div>
          {freeText ? (
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.ink, marginBottom: 14 }}>&ldquo;{freeText}&rdquo;</div>
          ) : null}
          <button onClick={startListening} disabled={listening || parsing}
            style={{ background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "11px 20px", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: listening || parsing ? "default" : "pointer", opacity: listening || parsing ? 0.6 : 1 }}>
            {listening ? "Listening…" : parsing ? "Working…" : "Start"}
          </button>
        </div>
        <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, textAlign: "center" }}>
          Prefer to type? <button onClick={() => setView("type")} style={{ background: "none", border: "none", color: T.crimson, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}>Type it instead</button>
        </div>
      </div>
    );
  }

  // TYPE
  if (view === "type") {
    return (
      <div>
        <BackBar onBack={goHome} title="Type it" />
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="What did you eat? Describe it naturally…"
          rows={3}
          autoFocus
          style={{ width: "100%", padding: "14px", borderRadius: 14, border: `1px solid ${T.paperDeep}`, background: T.paper, color: T.ink, fontSize: 14, fontFamily: SERIF, lineHeight: 1.5, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
        />
        <button onClick={() => parseFreeText(freeText)} disabled={!freeText.trim() || parsing}
          style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "13px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: !freeText.trim() || parsing ? "default" : "pointer", opacity: !freeText.trim() || parsing ? 0.5 : 1 }}>
          {parsing ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {parsing ? "Estimating…" : "Continue to draft"}
        </button>
      </div>
    );
  }

  // PHOTO — real: capture → downscale → analyzeMealPhoto → editable draft.
  if (view === "photo") {
    return (
      <div>
        <BackBar onBack={goHome} title="Snap a photo" />
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoPicked}
          style={{ display: "none" }}
        />

        {photoState === "reading" ? (
          <div style={{ ...sheetCard, padding: 24, textAlign: "center" }}>
            <Loader2 size={26} color={T.crimson} className="animate-spin" style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, marginBottom: 4 }}>Reading your photo…</div>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic" }}>
              This can take a few seconds — hang tight.
            </div>
          </div>
        ) : photoState === "error" ? (
          <div style={{ ...sheetCard, padding: 20, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, margin: "0 auto 14px", display: "grid", placeItems: "center", background: T.paperHi, border: `1px solid ${T.paperDeep}` }}>
              <Camera size={24} color={T.muted} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, marginBottom: 6, fontWeight: 600 }}>Couldn't read that photo</div>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.5, marginBottom: 16 }}>
              Try again with a clearer shot, or type it instead.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setPhotoState("idle"); photoInputRef.current?.click(); }}
                style={{ flex: 1, background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "11px", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>
                Try again
              </button>
              <button onClick={() => { setPhotoState("idle"); setView("type"); }}
                style={{ flex: 1, background: T.paperHi, color: T.ink, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "11px", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>
                Type it instead
              </button>
            </div>
          </div>
        ) : (
          <div style={{ ...sheetCard, padding: 22, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, margin: "0 auto 14px", display: "grid", placeItems: "center", background: T.paperHi, border: `1px solid ${T.paperDeep}` }}>
              <Camera size={24} color={T.crimson} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, marginBottom: 6, fontWeight: 600 }}>Snap your meal</div>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, fontStyle: "italic", lineHeight: 1.5, marginBottom: 16 }}>
              Take a photo of your plate — we'll estimate it, and you can check every number before logging.
            </div>
            <button onClick={() => photoInputRef.current?.click()}
              style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "13px", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>
              <Camera size={15} /> Take or choose a photo
            </button>
          </div>
        )}
      </div>
    );
  }

  // DRAFT
  if (view === "draft" && draft) {
    return (
      <div>
        <BackBar onBack={goHome} title="Check & confirm" />
        {draft.lowConfidence && (
          <div style={{ ...sheetCard, padding: "10px 12px", marginBottom: 10, fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic" }}>
            Rough estimate from the photo — please check the numbers below.
          </div>
        )}
        <EditableDraft
          draft={draft}
          onChange={setDraft}
          onConfirm={confirmDraft}
          saving={saving}
          mealType={mealType}
          onMealType={setMealType}
        />
      </div>
    );
  }

  // DONE — gentle stage-relevant nutrient line, not a calorie tally
  if (view === "done") {
    return (
      <div style={{ textAlign: "center", padding: "12px 6px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, margin: "0 auto 14px", display: "grid", placeItems: "center", background: T.paperHi, border: `1px solid ${T.paperDeep}` }}>
          <Check size={24} color={T.sage} />
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontWeight: 600, marginBottom: 8 }}>Added to today</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, textAlign: "left", ...sheetCard, padding: 14, marginBottom: 16 }}>
          <Leaf size={16} color={T.sage} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>{stageNutrientLine(profile)}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={goHome}
            style={{ flex: 1, background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "12px", fontFamily: UI, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}>
            Log another
          </button>
        </div>
      </div>
    );
  }

  // fallback (should not happen) — return home view shell
  return (
    <div>
      <button onClick={goHome} style={{ background: "none", border: "none", color: T.crimson, fontFamily: UI, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );
}

const chip = {
  display: "inline-flex", alignItems: "center", gap: 6, background: T.wax,
  border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 11px 6px 9px", cursor: "pointer",
};
