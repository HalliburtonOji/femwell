// Single source of truth for the emoji-codepoint strip.
// Canonical regex from .claude/memory/feedback_no_emoji_in_femwell.md.
// Frontend-side helper — used to scrub display strings defensively before render.
// The backend mirror lives at base44/functions/_shared/stripEmoji.ts — keep the
// regex in lockstep with that file.

const EMOJI_RE = /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu;

export function stripEmoji(s) {
  if (!s) return '';
  return String(s).replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
}

export function hasEmoji(s) {
  if (!s) return false;
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(String(s));
}
