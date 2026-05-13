---
name: Autonomous build-brainstorm loop mode
description: When user heads offline/to work and says to keep building + brainstorming, stay in a continuous loop — produce, save-as-go, self-re-prompt, don't stop until context heavy
type: feedback
originSessionId: current
---
When the user says some variant of "i am going to work, keep working, create stuff + brainstorm + improvements + features in a small loop until its heavy, re-prompt yourself to continue, talk later" — run an autonomous production loop.

**Why:** User explicitly authorised this mode on 2026-04-20 after the Jess v2 demo. Their laptop is open with connectors available; they may message from phone where connectors aren't available; they expect me to keep shipping deliverables and thinking deeply without needing per-step approval.

**How to apply:**
- Alternate between **build** (design demos, write docs, create artefacts) and **brainstorm** (strategic thinking, feature ideation, architecture notes). Call this the "build-brainstorm loop".
- Every deliverable goes to `/sessions/relaxed-loving-brahmagupta/mnt/femwell/` immediately + a memory pointer. Don't wait to confirm. Per `feedback_save_as_you_go.md`.
- Keep a TodoList so progress is visible. Mark items in_progress / completed as I go. Add new tasks mid-loop if ideas emerge.
- If the user messages from phone, answer their question directly but don't block the loop — pick up where I left off after.
- **Phone vs laptop**: connectors (base44 MCP, Chrome MCP, search MCPs) live on laptop only. If user asks from phone something that needs a connector, either (a) queue it for when they're back at laptop, or (b) do my best with file/memory-only context. Don't pretend I ran a connector when I couldn't.
- Stop conditions: (a) context window is clearly running hot, (b) the task list is drained and strategic thinking is comprehensively captured, (c) user returns and redirects.
- When stopping, leave a clear "picked up here" marker — updated memory + top task comment — so the next session or the user resuming can pick up without re-reading everything.
- Tone when delivering in this mode: terse, decisive. No "would you like me to..." asks. Announce what was built, link it, move to the next thing.
