// echoScrub — the on-device "Jess scrub" + crisis intercept for the Echo Wall.
//
// Nothing identifying may leave the device. The scrub runs ENTIRELY on-device
// (pure regex/string work — the raw text is never sent anywhere, which is the
// whole point), reduces an entry to a single non-identifying line, and removes
// names, places, dates, contact details, money and substances. A final re-scan
// blocks the post if any identifier survives.
//
// The crisis intercept runs first: if a draft reads as crisis, it is NEVER
// turned into a public echo — the sheet shows UK support resources instead.
//
// v1 is regex-based and deterministic (so the rail is testable and guaranteed).
// A future on-device LLM rewrite can sit on TOP of this (it must also run on the
// device — sending raw text to a server to "scrub" it would defeat the privacy
// promise), but regex is the enforcement floor.

import { MAX_ECHO_LEN, CRISIS_PATTERNS } from "./echoConfig";

// ── small lexicons (UK-leaning) ──────────────────────────────────────────────
const MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec";
const WEEKDAYS = "monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun";

const SUBSTANCES = [
  "alcohol","wine","beer","vodka","whisky","whiskey","gin","spirits","booze","drunk","hungover","hangover",
  "weed","cannabis","marijuana","spliff","joint","cocaine","coke","ketamine","ket","mdma","ecstasy","pill",
  "heroin","crack","meth","speed","xanax","valium","diazepam","zopiclone","codeine","tramadol","opioid",
];

// Common first names (a light list — heuristic, not exhaustive; the proper-noun
// pass catches the rest). Lowercase.
const COMMON_NAMES = [
  "tom","james","john","david","mike","michael","chris","paul","mark","dan","daniel","matt","matthew",
  "luke","jack","harry","george","oliver","jacob","charlie","sam","ben","josh","adam","ryan","liam",
  "sarah","emma","laura","hannah","jess","jessica","kate","katie","lucy","emily","sophie","chloe","amy",
  "rachel","megan","ellie","grace","abi","beth","anna","claire","clare","nat","natalie","becky","rebecca",
  "mum","mom","dad","nan","nana","gran","grandma","grandad","grandpa","sister","brother","auntie","aunt","uncle",
  "husband","wife","partner","boyfriend","girlfriend","fiance","fiancee","ex",
];

// A few UK place anchors; the proper-noun pass handles others.
const PLACES = [
  "london","manchester","birmingham","leeds","glasgow","edinburgh","liverpool","bristol","cardiff","belfast",
  "sheffield","newcastle","nottingham","leicester","brighton","oxford","cambridge","york","bath","reading",
  "england","scotland","wales","ireland","uk","britain",
];

const STOPWORDS = new Set([
  "I","I'm","I've","I'd","I'll","A","An","The","And","But","So","My","We","He","She","They","It","This","That",
  "When","Why","How","What","Where","Who","If","Then","Today","Tonight","Yesterday","Tomorrow","Now","Just",
  "Maybe","Sometimes","Always","Never","Still","Even","Because","After","Before","Every","Some","No","Yes","Oh",
  "God","NHS","GP","PMS","PMDD","PCOS","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
]);

function escapeList(arr) {
  return arr.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
}

// ── crisis intercept ─────────────────────────────────────────────────────────
export function crisisCheck(text) {
  const t = String(text || "");
  const hit = CRISIS_PATTERNS.some((re) => re.test(t));
  return { intercept: hit };
}

// ── the scrub ────────────────────────────────────────────────────────────────
// Returns { line, removed: string[], ok: boolean, reason?: string }.
//   ok=false  -> can't be safely shared (block the post).
export function scrubToEcho(rawText) {
  const removed = new Set();
  let text = String(rawText || "").replace(/\s+/g, " ").trim();
  if (!text) return { line: "", removed: [], ok: false, reason: "empty" };

  // Reduce to a single candidate line first: prefer the first sentence; if it's
  // very short, allow up to MAX_ECHO_LEN of the opening.
  const firstSentence = (text.match(/^.*?[.!?](\s|$)/) || [text])[0].trim();
  let line = firstSentence.length >= 24 ? firstSentence : text.slice(0, MAX_ECHO_LEN);

  const strip = (re, token, label) => {
    if (re.test(line)) { removed.add(label); line = line.replace(re, token); }
  };

  // Contact details + handles + links (hard identifiers).
  strip(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "", "an email");
  strip(/\bhttps?:\/\/\S+|\bwww\.\S+/gi, "", "a link");
  strip(/@[A-Za-z0-9_]{2,}/g, "", "a handle");
  strip(/(\+?\d[\d\s().-]{8,}\d)/g, "", "a number");

  // Dates + weekdays + months.
  strip(new RegExp(`\\b(${MONTHS})\\b\\.?(\\s+\\d{1,4})?`, "gi"), "recently", "a date");
  strip(new RegExp(`\\b(${WEEKDAYS})\\b`, "gi"), "the other day", "a day");
  strip(/\b\d{1,2}[\/.\-]\d{1,2}([\/.\-]\d{2,4})?\b/g, "recently", "a date");
  strip(/\b(19|20)\d{2}\b/g, "a while ago", "a year");

  // Ages + money + quantities.
  strip(/\b\d{1,2}\s?(yo|y\/o|years? old)\b/gi, "this age", "an age");
  strip(/£\s?\d[\d,]*(\.\d+)?/g, "money", "an amount");

  // Substances.
  strip(new RegExp(`\\b(${escapeList(SUBSTANCES)})\\b`, "gi"), "something", "a substance");

  // Named relations / common names / places.
  strip(new RegExp(`\\b(${escapeList(COMMON_NAMES)})\\b`, "gi"), "someone", "a name");
  strip(new RegExp(`\\b(${escapeList(PLACES)})\\b`, "gi"), "somewhere", "a place");

  // Proper-noun heuristic: a capitalised word NOT at sentence start and NOT a
  // known safe word reads as a possible name/place -> soften to "someone".
  line = line.replace(/(\w[\s,;:-]+)([A-Z][a-z]{2,})/g, (m, pre, word) => {
    if (STOPWORDS.has(word)) return m;
    removed.add("a name");
    return `${pre}someone`;
  });

  // Tidy doubled spaces / stray punctuation left by removals.
  line = line.replace(/\s{2,}/g, " ").replace(/\s+([.,!?])/g, "$1").replace(/^[\s,;:-]+/, "").trim();
  if (line.length > MAX_ECHO_LEN) line = line.slice(0, MAX_ECHO_LEN).replace(/\s+\S*$/, "").trim();

  // Final leak re-scan — if a hard identifier survived, block rather than post.
  const leak =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(line) ||
    /\bhttps?:\/\/\S+/i.test(line) ||
    /@[A-Za-z0-9_]{2,}/.test(line) ||
    /(\+?\d[\d\s().-]{8,}\d)/.test(line);
  if (leak) return { line, removed: [...removed], ok: false, reason: "identifier-remained" };

  if (line.replace(/[^a-z]/gi, "").length < 3) {
    return { line, removed: [...removed], ok: false, reason: "too-little-left" };
  }

  return { line, removed: [...removed], ok: true };
}
