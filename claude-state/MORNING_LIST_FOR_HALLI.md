# MORNING LIST FOR HALLI — overnight autonomous run (2026-06-10 → 11)

Running list of everything that needs Halli (deploy, probe, keys, legal). Updated as the night goes. Each batch also has its own report in the chat.

## DEPLOYS TO FIRE + LIVE-VERIFY (per batch — newest at bottom)
- **TASK 1 — Journal compose redesign** (commit `2b914d8`): client-only (no new entities/functions). Deploy the bundle; live-verify the Journal compose sheet reads cleaner (HOW YOU WRITE segmented bar · WHAT KIND format chips · "Add a topic" disclosure) and the ledger filter (format row + Topics ▾). Markers to grep: `How you write`, `What kind`, `Add a topic`.

## NEEDS-HALLI ITEMS (accumulated)
- **OpenAI key** — CONFIRMED IN Base44 secrets (M2 unblocked). ✓
- **STT key (AssemblyAI / Deepgram)** — needed to ACTIVATE async voice-note delivery (M4). Voice-note capture/store/UI ships dormant behind `TRANSCRIPTION_ENABLED=false` until this exists; no unscreened audio is ever delivered.
- **B3 / RLS non-owner verify** — confirm a NON-owner (test account `ojihalliburton57`) direct write to the locked entities (WitnessRequest/WitnessStrike/TwinPair/TwinEntry/Echo/CommunityPost/Comment/Reaction/QotdResponse/GameRound/GameResponse/VoiceNote) returns 403, reads where-public 200. Owner token can't tell (owner bypasses RLS). Dashboard or test account.
- **Live 2-account round-trips** — witness send + claim; twin pairing (same phase); a real Community post→comment; a game round; once confirmed, mark those features fully verified.
- **OSA / legal floor (before PUBLIC Community launch)** — illegal-content risk assessment; ToS proactive-moderation disclosure; APD + DPIA; explicit special-category consent; 18+ age-assurance method sign-off (AgeGate copy is placeholder); named human-review + appeals owner (Halli).
- **Base44 fn-deploy gotchas** (for re-firing): a NEW `_shared/*.ts` isn't picked up same-sync (inline instead); a failed registration is sticky per name (rename to a fresh endpoint). A bundle-hash flip ≠ functions registered — probe each 400-not-404.
