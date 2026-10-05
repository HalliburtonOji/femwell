export const LESSON_VERSION = 1;
export const LESSON_COLLECTION = "sky-lessons-2026-10-v1";
const phases = "https://science.nasa.gov/moon/moon-phases/";
const viewing = "https://science.nasa.gov/moon/viewing-tips/";
const watching = "https://science.nasa.gov/skywatching/";
const faq = "https://science.nasa.gov/skywatching/faq/";
const meteors = "https://science.nasa.gov/solar-system/meteors-meteorites/";
const saturn = "https://science.nasa.gov/saturn/facts/";
const sun = "https://science.nasa.gov/sun/facts/";
// Authored astronomy, checked against the linked primary sources. Order is editorial, not a prediction.
export const SKY_LESSONS = [
  ["borrowed-light","The Moon borrows its glow","Moonlight is sunlight reflected from the Moon’s surface. Our silver neighbour has no lamp of its own; its changing shape reveals how much of the sunlit side we see.","Find the lit edge; imagine where the Sun sits.",phases],
  ["steady-planets","That steady light might be a planet","Bright planets tend to shine steadily, while stars often flicker. It is a useful first clue, not a verdict. A local sky chart can settle the identity.","Compare a bright steady point with nearby flickering stars.",watching],
  ["terminator","Where lunar shadows tell stories","The boundary between lunar day and night is called the terminator. Near it, long shadows make craters and ridges clearer. The best detail often lives at the edge.","With binoculars, inspect the light–dark boundary on a partial Moon.",viewing],
  ["meteor","A shooting star is no star","A meteor is the bright effect of a small space rock entering an atmosphere. If material survives to reach the ground, it becomes a meteorite. Same traveller, different name.",null,meteors],
  ["north-star","A star that keeps its place","In the Northern Hemisphere, Polaris stays nearly fixed in the sky and indicates north. The two outer stars of the Plough’s bowl point towards it. A quiet guide.","Find the Plough; follow its two outer bowl stars towards Polaris.",faq],
  ["sun-surface","Our star has no solid floor","The Sun has no solid surface to stand on. Its visible layer is called the photosphere, part of a vast ball of plasma. A bright boundary, not a floor.",null,sun],
  ["earthshine","Earth lends a little light","Sometimes a crescent carries a faint outline of the whole Moon. That soft glow is earthshine: sunlight reflected from Earth, lighting the Moon’s otherwise darkened face.","On a clear crescent evening, look for the faint outline.",phases],
  ["saturn-rings","Saturn wears a moving collection","Saturn’s rings contain billions of pieces of ice and rock, from tiny grains to enormous chunks. They are orbiting material, not one solid hoop. Excellent jewellery; complicated storage.",null,saturn],
  ["lunar-seas","These seas have no waves","The Moon’s dark patches are ancient lava flows, cooled into rock. Astronomers call them maria, or seas. Beautiful name; very little opportunity for a paddle.","Find a dark patch and compare it with a lunar map.",viewing],
  ["moon-illusion","The horizon has a little theatre","A Moon near the horizon can look enormous, although photographs show no matching increase in width. This is the Moon illusion; its full explanation remains unsettled.","Compare two photographs using the same zoom, horizon and high sky.","https://science.nasa.gov/solar-system/moon/the-moon-illusion-why-does-the-moon-look-so-big-sometimes/"],
  ["wandering-planets","Planets do not keep the backdrop","Planets change position against the much more distant stars. Over time, the bright point you noticed shifts within the pattern. The scenery is not quite standing still.","Sketch a planet beside nearby stars; compare another clear evening.",watching],
  ["later-moonrise","The Moon keeps changing its appointment","The Moon rises about fifty minutes later each day on average because it moves along its orbit. Your local timing varies; yesterday’s appointment is only a rough clue.","Compare local moonrise times for two consecutive dates.",faq],
  ["daytime-moon","The Moon does daylight, too","The Moon often appears in daytime as a pale visitor. Its visibility depends on phase, season and location. The night sky never had an exclusive contract.","Notice whether a pale Moon joins your next daylight walk.",phases],
  ["meteor-shower","Earth crosses an old trail","Meteor showers happen as Earth passes through trails of space debris. Many are left by comets. The flashes are nearby encounters with old crumbs, rather than falling stars.",null,meteors],
  ["crater-rays","An impact leaves its handwriting","Bright streaks around some lunar craters are ray systems. They formed when impacts scattered material outwards across the surface: a collision leaving a surprisingly delicate signature.","On a lunar map, follow the rays around Tycho.",viewing],
  ["sun-fusion","The light starts deep inside","Nuclear fusion in the Sun’s core joins hydrogen into helium and powers its heat and light. The daylight on your windowsill begins in a very different kind of room.",null,sun],
  ["milky-way","Our galaxy, seen from inside","In a dark sky, the Milky Way appears as a faint band of light. We live within its disc, so this view looks along our galaxy’s crowded plane.","Away from bright lights, look for a faint band across the sky.",watching],
  ["supermoon","Supermoon, with the small print","A supermoon is a full Moon near its closest approach to Earth. It can appear larger and brighter than a distant full Moon, rather than physically swelling.",null,"https://www.rmg.co.uk/stories/space-astronomy/what-supermoon"],
  ["highlands","The pale parts are ancient","The Moon’s lighter highlands preserve its earliest crust. They contain rock rich in pale minerals, giving the surface its contrast with the darker lava-filled lunar seas.","Compare a pale highland with a neighbouring dark patch.",viewing],
  ["saturn-year","Saturn takes its time","A year on Saturn lasts about 29.4 Earth years, but its day takes only about 10.7 hours. Slow around the Sun, quick on its own axis.",null,saturn],
  ["libration","A small lunar peek","The Moon seems to nod and turn slightly during its orbit. This apparent wobble, called libration, lets observers glimpse a little beyond its usual visible edges.","Compare the same edge in Moon photographs taken weeks apart.",phases],
  ["wide-sky","Your eyes have the wide view","Telescopes show small patches of sky; your eyes take in broad patterns. Constellations, planet line-ups and the Milky Way reward that wider view. Equipment is optional company.","Spend a moment finding patterns before reaching for a telescope.",watching],
  ["binocular-moon","A familiar face becomes a landscape","Binoculars can turn the Moon’s smooth-looking patches into craters and mountain ridges. Away from full Moon, shadows help its terrain emerge. Familiar does not mean fully known.","Steady your binoculars and explore a partial Moon.",viewing],
  ["same-face","Turning, without turning away","The Moon spins once for each orbit around Earth. These matching movements keep roughly the same face towards us. It is turning; we simply keep meeting its familiar side.",null,faq],
].map(([id,title,body,tryThis,source])=>({id,title,body,tryThis,source,version:LESSON_VERSION}));

export function localSkyDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
export function dailyLessonDeck(day, exactId) {
  const [year,month,date] = day.split("-").map(Number);
  const ordinal = Math.round((Date.UTC(year,month-1,date)-Date.UTC(2026,9,5))/86400000);
  const index = ((ordinal % SKY_LESSONS.length)+SKY_LESSONS.length)%SKY_LESSONS.length;
  const daily = [0,5,11,17,23].map(offset=>SKY_LESSONS[(index+offset)%SKY_LESSONS.length]);
  const exact = SKY_LESSONS.find(lesson=>lesson.id===exactId);
  return exact ? [exact,...daily.filter(lesson=>lesson.id!==exact.id)].slice(0,5) : daily;
}
export const skyLessonKey = lesson => `sky-lesson:${lesson.id}:v${lesson.version}`;
export const skyLessonRoute = (lesson,direction="letter",previewRoute="/LivingLifestyleDemo") => `${previewRoute === "/LivingAtelierDemo" ? previewRoute : "/LivingLifestyleDemo"}?direction=${encodeURIComponent(direction)}&section=sky&lesson=${encodeURIComponent(lesson.id)}&lessonVersion=${lesson.version}#daily-sky-lesson`;
