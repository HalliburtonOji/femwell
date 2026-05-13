// astrology/glyphs.js
// Lucide icon mapping for planets and zodiac signs. Replaces the legacy
// Unicode astrology codepoints with consistent Lucide icons.
//
// Each export returns a React component (the Lucide icon component itself),
// so callers can do `const Icon = getPlanetIcon('venus'); <Icon size={20}/>`.
//
// Functions accept either lowercase or capitalised input (e.g. both
// 'venus' and 'Venus' return Heart).

import {
  Sun,
  Moon,
  MessageCircle,
  Heart,
  Flame,
  Compass,
  Mountain,
  Sparkles,
  Waves,
  Sprout,
  Wind,
  Wheat,
  Scale,
} from "lucide-react";

const PLANETS = {
  sun: Sun,
  moon: Moon,
  mercury: MessageCircle,
  venus: Heart,
  mars: Flame,
  jupiter: Compass,
  saturn: Mountain,
  uranus: Sparkles,
  neptune: Waves,
  pluto: Waves,
};

// `Bow` doesn't exist in lucide-react → Sagittarius falls back to `Compass`.
const SIGNS = {
  aries: Flame,
  taurus: Sprout,
  gemini: Wind,
  cancer: Moon,
  leo: Sun,
  virgo: Wheat,
  libra: Scale,
  scorpio: Waves,
  sagittarius: Compass,
  capricorn: Mountain,
  aquarius: Wind,
  pisces: Waves,
};

export function getPlanetIcon(name) {
  if (!name) return Sparkles;
  return PLANETS[String(name).toLowerCase()] || Sparkles;
}

export function getSignIcon(name) {
  if (!name) return Sparkles;
  return SIGNS[String(name).toLowerCase()] || Sparkles;
}

// Backwards-compat: legacy rows in HoroscopeReading.transits_json may carry
// a `glyph` string. Map known Unicode astrology codepoints back to a planet
// key so the renderer can pick the right Lucide icon.
const GLYPH_TO_PLANET = {
  "☉": "sun",      // ☉
  "☼": "sun",      // ☼
  "☽": "moon",     // ☽
  "☾": "moon",     // ☾
  "☿": "mercury",  // ☿
  "♀": "venus",    // ♀
  "♂": "mars",     // ♂
  "♃": "jupiter",  // ♃
  "♄": "saturn",   // ♄
  "♅": "uranus",   // ♅
  "♆": "neptune",  // ♆
  "♇": "pluto",    // ♇
};

export function glyphToPlanet(glyph) {
  if (!glyph) return null;
  return GLYPH_TO_PLANET[String(glyph).trim()] || null;
}
