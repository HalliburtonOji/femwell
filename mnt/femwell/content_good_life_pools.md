# Good-life content pools — whole-life, daily-rotating

Paste-ready JS arrays for `LifestyleEliteShell.jsx`. Existing items kept (marked), new
ones added. Whole-life by default — health is one room, not the house. UK voice, warm
smart-friend register, no emoji. Colourways: crimson · sage · gold · plum · sky · blush.

---

## 1. TRY_THIS — small, doable joys (~16)

```js
// small, doable "try this today" joys — spans creativity, friendship, nature, fashion,
// home, money-gently, learning, movement, joy. Present-tense, kind, one action each.
const TRY_THIS = [
  { title: "Write one line you're proud of", cw: "crimson" },          // existing
  { title: "Ten minutes outside, no phone", cw: "sage" },              // existing
  { title: "Text the friend you've been meaning to", cw: "gold" },     // existing
  { title: "Wear the good earrings on a nothing day", cw: "blush" },
  { title: "Play the song you loved at fifteen", cw: "plum" },
  { title: "Buy the flowers, not for an occasion", cw: "crimson" },
  { title: "Learn the name of a tree on your street", cw: "sage" },
  { title: "Send a voice note instead of a text", cw: "gold" },
  { title: "Take the long way home for no reason", cw: "sky" },
  { title: "Start the book you keep circling", cw: "plum" },
  { title: "Tuck a little something away for future-you", cw: "sage" },
  { title: "Dance to one song in the kitchen", cw: "crimson" },
  { title: "Move one thing back to where it makes you happy", cw: "blush" },
  { title: "Say the idea out loud in the meeting", cw: "gold" },
  { title: "Read one poem, out loud, to no one", cw: "plum" },
  { title: "Watch the sky change for five whole minutes", cw: "sky" },
];
```

---

## 2. PERMISSION_SLIPS — you're-allowed energy (~12)

```js
// permission slips, not to-do lists. Whole-life: rest, ambition, changing your mind,
// taking up space, joy without reason, saying no, being a beginner, wanting more than
// one thing. No cycle-phase claims dressed as science (handled elsewhere).
const PERMISSION_SLIPS = [
  "You're allowed a slow Sunday.",                                              // existing
  "Rest isn't the reward for the work — it's part of it.",                      // existing
  "You're allowed to want more — and to say so out loud.",
  "You're allowed to change your mind. Yesterday's plan isn't a promise.",
  "You're allowed to take up room — the whole of it.",
  "You're allowed a joy that hasn't earned its keep.",
  "You're allowed to say no without a paragraph after it.",
  "You're allowed to be a beginner. That's the price of the fun.",
  "You're allowed to want the quiet life and the big one, both.",
  "You're allowed to leave the party early.",
  "You're allowed to outgrow the version of you people got used to.",
  "You're allowed a day where good enough is the whole goal.",
];
```

---

## 3. A_DAY_ALTS — a whole day that's just yours (~10)

```js
// "a whole day that's just yours" ideas — guilt-free. Spans slow, creative, out-in-the-
// world, pottering, friends, nature, reading. These are the `alts` inside A_DAY.
const A_DAY_ALTS = [
  "A long walk somewhere new",                                     // existing
  "Cook something that takes all afternoon",                       // existing
  "Visit a gallery alone",                                         // existing
  "A film and an early night",                                     // existing
  "A pottering day — small jobs you actually like, in no order",
  "A making day — paint, write, bake, nobody watching",
  "A whole day with a friend and no plan",
  "A wander through town with nowhere to be",
  "A duvet, a stack of books, and the door shut",
  "A morning market, a long lunch, an afternoon nap",
];
```

---

## 4. GUIDES — short how-to teasers (~9)

```js
// short how-to guide teasers — life-spanning. Keeps the 3 cycle ones; adds hobbies,
// money-gently, friendship, style, home, learning. `why` is a warm one-liner.
const GUIDES = [
  { title: "How to start cycle-syncing", source: "Guide · 4 min", why: "the gentle version" },                      // existing
  { title: "A 5-minute evening reset", source: "Guide · 3 min", why: "wind down without a whole routine" },         // existing
  { title: "Reading your luteal week", source: "Guide · 6 min", why: "what to expect, kindly" },                    // existing
  { title: "Starting a hobby you'll actually keep", source: "Guide · 5 min", why: "low stakes, high joy" },
  { title: "A calmer hour with your money", source: "Guide · 7 min", why: "no dread, no spreadsheet spiral" },
  { title: "Making a friend as a grown-up", source: "Guide · 6 min", why: "it's meant to feel a bit awkward" },
  { title: "Finding your own style, not a trend's", source: "Guide · 5 min", why: "dress a little more like yourself" },
  { title: "Making a room feel like you", source: "Guide · 4 min", why: "small changes, real warmth" },
  { title: "Learning something just for the joy of it", source: "Guide · 5 min", why: "no exam at the end" },
];
```
