// Route Registry — single source of truth for all valid in-app routes.
// All assistant suggestions and navigation must use keys from this registry.

export const ROUTES = {
  Today:        "/Today",
  Nutrition:    "/Nutrition",
  Journal:      "/Journal",
  Lifestyle:    "/Lifestyle",
  Programs:     "/ProgramsHub",
  Explore:      "/Explore",
  SkinHair:     "/SkinHair",
  Pulse:        "/Pulse",
  LifeStageCare:"/LifeStageCare",
  Profile:      "/Profile",
  Saved:        "/Saved",
  Events:       "/Events",
  Deals:        "/Deals",
  Assistant:    null, // opens overlay via event — not a page route
  // Deep-link helpers (tab-parameterised paths)
  NutritionHydration: "/Nutrition?tab=hydration",
  NutritionToday:     "/Nutrition?tab=today",
  NutritionPlan:      "/Nutrition?tab=plan",
  LifestyleFiction:   "/Lifestyle?tab=femwell",
  LifestyleBooks:     "/Lifestyle?tab=books",
};

export const VALID_ROUTE_KEYS = Object.keys(ROUTES);

/**
 * safeNavigate — call with a route_key and optional toast reference.
 * If the key opens the assistant overlay, dispatches the fw_open_assistant event.
 * If the key is unknown, calls onError (defaults to console.warn).
 */
export function safeNavigate(routeKey, onError) {
  if (!VALID_ROUTE_KEYS.includes(routeKey)) {
    if (onError) onError(`Route "${routeKey}" is not available.`);
    else console.warn(`[safeNavigate] Unknown route key: ${routeKey}`);
    return;
  }
  if (routeKey === "Assistant") {
    window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: {} }));
    return;
  }
  const path = ROUTES[routeKey];
  if (path) window.location.href = path;
}