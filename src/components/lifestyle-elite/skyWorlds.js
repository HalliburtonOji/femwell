// Pure data: safe when the pages registry loads every preview together.
export const DEFAULT_SKY_WORLD = "workbench";
export const SELECTED_SKY_WORLD = { id: "petal-press", name: "Petal × Star Press", asset: "/images/sky-worlds/petal-v1.webp", moon: { x: 76, y: 19, size: 18 }, caption: "A little borrowed light." };
export const SKY_WORLDS = [
  { id: "conservatory", name: "Moonlight Conservatory", asset: "/images/sky-worlds/conservatory-v1.webp", moon: { x: 54, y: 20, size: 24 }, caption: "A little light, borrowed." },
  { id: "press", name: "The Star Press", asset: "/images/sky-worlds/press-v1.webp", moon: { x: 77, y: 24, size: 23 }, caption: "The sky has stories." },
  { id: "petal", name: "Petal Observatory", asset: "/images/sky-worlds/petal-v1.webp", moon: { x: 76, y: 19, size: 18 }, caption: "Wonder, with roots." },
  { id: "workbench", name: "Lunar Workbench", asset: "/images/sky-worlds/workbench-v1.webp", moon: { x: 71, y: 38, size: 23 }, caption: "Look up. Stay curious." },
  { id: "light", name: "Light Garden", asset: "/images/sky-worlds/light-v1.webp", moon: { x: 55, y: 26, size: 24 }, caption: "Even the Moon borrows light." },
];
export function normaliseSkyWorld(direction) {
  if (direction === SELECTED_SKY_WORLD.id) return direction;
  return SKY_WORLDS.some(world => world.id === direction) ? direction : DEFAULT_SKY_WORLD;
}
export function getSkyWorld(direction) {
  if (direction === SELECTED_SKY_WORLD.id) return SELECTED_SKY_WORLD;
  return SKY_WORLDS.find(world => world.id === normaliseSkyWorld(direction));
}
