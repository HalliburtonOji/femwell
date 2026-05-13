// Backend mirror of src/utils/stripEmoji.js.
// Deno-runtime helper; importable by every ingest function via
// `import { stripEmoji } from '../_shared/stripEmoji.ts';`
//
// Keep this file's regex in lockstep with the frontend version. The canonical
// rule lives in .claude/memory/feedback_no_emoji_in_femwell.md.

export const EMOJI_RE = /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu;

export function stripEmoji(s: unknown): string {
  if (!s) return '';
  return String(s).replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
}

export function hasEmoji(s: unknown): boolean {
  if (!s) return false;
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(String(s));
}
