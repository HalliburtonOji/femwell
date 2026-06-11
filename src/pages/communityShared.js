// communityShared — the COMPLETE whole-life Community feature content + mock data,
// shared by all 5 CommunityDemo pages so every demo is feature-identical and only
// the UX/UI differs. Icons are Lucide (shared = content, not UX). No emoji.
//
// Feature surfaces every demo must render (in its own layout):
//   masthead + ambient presence · Question of the Day · the whole-life rooms ·
//   Echo Wall · the non-clinical games · the "one entry, four lives" chooser ·
//   Witness · Audio "Talk It Out".

import {
  MessageCircle, Users, Heart, Briefcase, Sparkles, Moon, Waves, HeartHandshake,
  Stethoscope, Lock, Mail, Mic, Phone, ShieldAlert, Repeat, BookOpen, Dices,
} from "lucide-react";

// ── masthead + ambient presence ──────────────────────────────────────────────
export const MASTHEAD = {
  eyebrow: "FemWell · Community",
  title: "For the whole of you",
  subtitle: "Health is one room here — not the whole house. For the love, the laugh, the money question, the late-night vent. Anonymous, 18+, a room everyone's in.",
};
export const PRESENCE = { count: 31, line: "are here right now — you're not alone tonight." };

// ── Question of the Day (one tap → descriptive-norm reveal, no counts) ────────
export const QOTD = {
  question: "What small thing lifted you today?",
  options: ["a good coffee", "a text from a friend", "a win at work", "fresh air"],
  norm: "a text from a friend",
  normLine: "Most women said: a text from a friend.",
};

// ── the whole-life rooms (Lucide icons; non-competitive hints, never counts) ──
export const ROOMS = [
  { key: "lounge",   name: "The Lounge",            line: "Vent, spill it, be heard — silly to serious, no names.", Icon: MessageCircle, hint: "busy tonight" },
  { key: "circles",  name: "Circles",               line: "Rooms by what you love — books, walks, late nights.",     Icon: Users,         hint: "a few new rooms" },
  { key: "library",  name: "The Library",           line: "Read together — a book club, spoiler-safe, at our own pace.", Icon: BookOpen,    hint: "Jess hosts" },
  { key: "games",    name: "The Games Room",        line: "Play, lightly — Jess's nightly round, no winners, just us.", Icon: Dices,       hint: "tonight's round" },
  { key: "love",     name: "Love & Relationships",  line: "Dating, friendship, marriage — ask the room, kindly.",    Icon: Heart,         hint: "open" },
  { key: "money",    name: "Money & Work",          line: "Careers, pay, pensions — the questions you'd never ask aloud.", Icon: Briefcase, hint: "open" },
  { key: "style",    name: "Style & Self-Expression", line: "Fashion as confidence — rate the choice, never the body.", Icon: Sparkles,    hint: "open" },
  { key: "lighter",  name: "The Lighter Side",      line: "Fun, telly, the stars — a daily smart-friend note.",      Icon: Moon,          hint: "today's note" },
  { key: "health",   name: "Health",                line: "The clinical room — accurate, NHS-grounded. One room, not the house.", Icon: Stethoscope, hint: "one room" },
];

// ── Echo Wall (anonymous one-liners, fade 48h, kind one-way reactions) ────────
export const ECHOES = [
  { id: "e1", body: "The inbox can wait until I have remembered how to breathe.", fadeH: 41 },
  { id: "e2", body: "Told my manager no today. It cost me nothing I will miss.",  fadeH: 38 },
  { id: "e3", body: "First clear morning in a fortnight. I had forgotten the feeling.", fadeH: 33 },
  { id: "e4", body: "Charity-shop dress, four pounds, made my whole week.",        fadeH: 27 },
  { id: "e5", body: "Asked for help before I was drowning. New for me.",          fadeH: 19 },
];
export const ECHO_REACTIONS = ["held", "me too", "hear you", "saved"];

// ── the Lounge feed (whole-life, NOT clinical) ───────────────────────────────
export const LOUNGE = [
  { id: "l1", domain: "Career",        body: "Told my manager no for the first time today. The ceiling did not cave in.", warm: true },
  { id: "l2", domain: "Friendship",    body: "My oldest friend forgot my birthday and I don't know how to bring it up.", warm: false },
  { id: "l3", domain: "Dating",        body: "Third date and he asked what I actually want. Nearly fell off my chair.",  warm: true },
  { id: "l4", domain: "Money",         body: "Opened the banking app without the pit in my stomach. Small, but new.",    warm: true },
  { id: "l5", domain: "Joy",           body: "Danced in the kitchen to the whole album. No reason. Recommend.",          warm: true },
  { id: "l6", domain: "Is it just me", body: "Is it just me, or are group chats more exhausting than they used to be?",  warm: false },
];

// ── the non-clinical games ───────────────────────────────────────────────────
export const THIS_OR_THAT = [
  { id: "t1", prompt: "Tea or coffee?", a: "Tea", b: "Coffee", split: [58, 42] },
  { id: "t2", prompt: "Night in or night out?", a: "Night in", b: "Night out", split: [71, 29] },
];
export const HOT_TAKES = [
  "Cereal is a soup.",
  "The book is always better — but the film is allowed to be its own thing.",
  "A charity-shop find beats anything full price.",
];
export const STORY_SEED = [
  "She opened the little café at dawn, before the town had woken.",
  "The first customer ordered something that was not on the menu.",
];
export const ROLEPLAY = {
  prompt: "You're opening your dream café — what's its name?",
  entries: ["The Slow Morning", "Brew & Brood", "Page One"],
};

// ── "one entry, four lives" chooser ──────────────────────────────────────────
export const SAMPLE_ENTRY =
  "A hard week at work — I kept handing over more than I had left. And my oldest friend went quiet, which I felt more than I expected. Naming it helped.";
export const FOUR_LIVES = [
  { key: "lock",    label: "Stay locked",        line: "Lives in your Journal, under your key.",            Icon: Lock,           defaultLife: true },
  { key: "echo",    label: "Become an echo",     line: "One scrubbed line to the wall — fades in 48h.",     Icon: Waves },
  { key: "seal",    label: "Be sealed",          line: "A letter to future-you, opened on a date you choose.", Icon: Mail },
  { key: "witness", label: "Handed to a witness", line: "One matched sister reads it once. Four lines back, or silence.", Icon: HeartHandshake },
];

// ── Witness ──────────────────────────────────────────────────────────────────
export const WITNESS = {
  gate: { held: 2, need: 3, line: "You've held space for 2 sisters — one more to unlock sending your own." },
  charter: [
    ["Anonymous", "She sees the entry, your phase and life stage — never a name, photo or region."],
    ["One-shot", "One read, one fixed response. No DM, no follow, no re-view. Then it seals."],
    ["Cancel before she reads", "A two-hour window. Pull it back and it re-seals — she never knew."],
    ["Not for crisis", "Anything heavy routes to support, never to a peer."],
    ["No names or places", "If Jess spots an identifying detail, she asks you to edit first."],
    ["You choose her shape", "Default is your phase and life stage. Tighten or loosen the match."],
  ],
  responses: ["Holding with you", "Me too", "Not alone", "I hear you"],
};

// ── Audio "Talk It Out" ──────────────────────────────────────────────────────
export const AUDIO_MODES = [
  { key: "note",   name: "Voice note", Icon: Mic,           line: "A voice echo — record, optionally mask your voice, a phase-sister holds it. Fades in 48h." },
  { key: "talk",   name: "Talk 1:1",   Icon: Repeat,        line: "Turn-based: 3 minutes you talk, she holds, then swap. Hold, don't fix. No recording." },
  { key: "circle", name: "Live Circle", Icon: Users,        line: "5–8 women, no stage, everyone equal. Listen-only is welcome. A gentle topic, hosted." },
];
export const AUDIO_NOTE = "No recording, ever. Live audio needs an external provider (LiveKit); the async voice note ships first.";

// ── crisis safety (shared) ───────────────────────────────────────────────────
export const CRISIS_WORDS = ["end it", "no point", "hurt myself", "kill", "can't go on", "worthless", "want to die"];
export function crisisCheck(text) {
  const t = (text || "").toLowerCase();
  return CRISIS_WORDS.some((w) => t.includes(w));
}
export const UK_RESOURCES = [
  { name: "Samaritans", detail: "Call 116 123 — free, any time.", Icon: Phone },
  { name: "NHS 111",    detail: "Call 111 and choose mental health.", Icon: Phone },
  { name: "Shout",      detail: "Text SHOUT to 85258, 24/7.", Icon: MessageCircle },
  { name: "Mind",       detail: "Call 0300 123 3393 (Mon–Fri).", Icon: Phone },
];

export const FOOTER_LINE = "No handles. No DMs. No likes, no leaderboards. Anonymous, 18+ — a room everyone's in.";

// ── COMMENTS (OPEN-WRITE BY DEFAULT; FLAT, anonymous, no counts) ──────────────
// Comments are OPEN by default — anyone can write one. The poster keeps the
// option to switch a post to reaction-only. Threads are publicly readable
// (lurking is first-class), flat (no reply-to-reply), kind by design. Jess is an
// active participant (by:"jess") — she chips in with support, not just gatekeeps.
// Backend moderation AUTO-REMOVES anything harmful/out-of-place (status:"removed").
export const COMMENTS_BY_POST = {
  l1: { open: true,  list: [
    { id: "c1", body: "This made me sit up straighter. Well done you." },
    { id: "c2", body: "The ceiling never does. Holding this with you." },
  ] },
  l2: { open: true,  list: [
    { id: "c3", body: "I'd want to know too. Maybe a gentle 'I missed you on the day'?" },
    { id: "jx", by: "jess", body: "Birthdays landing quietly can sting more than we expect — you're allowed to want to be remembered. Whatever you decide to say, take your time." },
  ] },
  l3: { open: false, list: [] },   // the poster switched THIS one to reaction-only (still an option)
  l4: { open: true,  list: [
    { id: "c5", body: "Same boat. The app-guilt is real." },
    { id: "rm", status: "removed" },   // auto-removed by backend moderation (shown as a tombstone)
  ] },
  l5: { open: true,  list: [] },   // open but empty → soften, never "0 comments"
  l6: { open: true,  list: [
    { id: "c4", body: "Not just you. I mute them for whole afternoons now." },
    { id: "jy", by: "jess", body: "Group chats can quietly drain you. It's kind — to you — to step back when you need to." },
  ] },
};
export const COMMENT_DISCLAIMER = "Peer support, not medical advice. For anything medical, speak to your GP or NHS 111.";
export const COMMENT_KINDNESS = "Share what helped you — you don't have to fix it. “I hear you” is enough.";
export const COMMENT_MAX = 400;
export const COMMENT_EMPTY = "No replies yet — be the first kind voice, or just send a reaction.";
// Backend auto-moderation (mock here; real = OpenAI Moderation API + crisis check
// via a Base44 serverless function). Every comment is screened; harmful or
// out-of-place ones are AUTO-REMOVED and shown as a gentle tombstone.
export const MOD_NOTE = "Jess screens every comment — anything unkind or out of place is removed.";
export const MOD_REMOVED = "Removed by Jess — this didn't keep the room kind.";
export const MOD_BANNED = ["idiot", "stupid", "shut up", "loser", "ugly", "pathetic", "hate you", "shut it"];
export function modCheck(text) { const t = (text || "").toLowerCase(); return MOD_BANNED.some((w) => t.includes(w)); }

// ── JESS AS GAMES MASTER — a gentle, timed, simultaneous-reveal round ─────────
// One shared prompt, a generous countdown, everyone answers privately, then Jess
// reveals only the AGGREGATE warmly. No winner, no score, no leaderboard.
export const GM_ROUND = {
  host: "Jess",
  intro: "I'm hosting a tiny round — answer whenever, the room reveals together. No winners here, just company.",
  prompt: "If today had a weather, what was yours?",
  options: ["bright spells", "a bit grey", "stormy then calm", "soft and still"],
  seconds: 30,
  reveal: "Most of you said “a bit grey” — and a good few found the calm after the storm. You're in good company tonight.",
};

export { ShieldAlert };
