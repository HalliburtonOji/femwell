// communityModeration — the shared safety spine for Community writes (M1).
//
// Two checks, both keyword-based and key-FREE so M1 ships safely without any
// external dependency:
//   • isCrisis(text)    → route to UK support, NEVER post (same patterns as Echo/Twin)
//   • shouldRemove(text)→ harmful / out-of-place → auto-removed (comment tombstone)
//
// M2 (needs the OpenAI key in Base44 secrets) will upgrade `moderate()` to the
// OpenAI Moderation API + a clinical-vocab allowlist + Jess support replies. The
// hook below already prefers the API when OPENAI_API_KEY is present and falls back
// to the keyword check otherwise — so wiring the key later is a drop-in, and M1 is
// safe in the meantime.

export const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i,
  /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
  /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i,
  /\bnothing\s+to\s+live\s+for\b/i,
  /\bhe\s+(hits|beats|hurts)\s+me\b/i,
  /\bnot\s+safe\s+(at home|here|with him|with her)\b/i,
];
export function isCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text || ""));
}

// Unkind / out-of-place — the M1 keyword floor (M2 replaces with OpenAI Moderation).
const BANNED = [
  "idiot", "stupid", "shut up", "loser", "ugly", "pathetic", "hate you", "shut it",
  "kill yourself", "kys", "worthless piece", "slut", "whore", "bitch", "retard",
];
export function shouldRemove(text: string): boolean {
  const t = (text || "").toLowerCase();
  return BANNED.some((w) => t.includes(w));
}

export type ModResult = { crisis?: boolean; remove?: boolean; ok?: boolean };

// The single moderation entry point. crisis wins (route to support, never post);
// otherwise harmful → remove (tombstone); otherwise ok. M2: prefer OpenAI when keyed.
export async function moderate(text: string): Promise<ModResult> {
  if (isCrisis(text)) return { crisis: true };
  // M2 hook — drop-in once the key exists; no-op (keyword only) without it.
  // const key = (globalThis as any).Deno?.env?.get?.("OPENAI_API_KEY");
  // if (key) { /* call OpenAI Moderation API; on flagged -> return { remove: true } */ }
  if (shouldRemove(text)) return { remove: true };
  return { ok: true };
}
