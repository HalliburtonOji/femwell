# COMMUNITY v2 — TIGHT, BOUNDED SCOPE (2026-06-11)

> Mandate (Halli): "complete any remaining [Community] features, upgrade what we currently have to v2."
> This doc is the fence around that work so it does not sprawl. Derived from COMMUNITY_MEGA_PLAN,
> GROUPS_LIBRARY_GAMES_BRAINSTORM, and the current live code (`src/pages/Community.jsx` + configs).
> **Anything not listed under "IN SCOPE" is explicitly OUT (deferred).** Build in batches, commit + push
> per batch, report so Halli deploys + live-verifies between batches.

## LOCKED GUARDRAILS (every batch, no exceptions)
Whole-life not clinical · cream/plum + Ephesis/Cormorant · Lucide only, NO emoji · 18+ · anonymous-first
(service-role writes, namespaced device hashes) · Jess as host · crisis routing on EVERY text input ·
**NO scoreboards / streaks / vanity counts / member counts ever** · k-anon presence only. Base44 gotchas:
functions self-contained (no new `_shared`), NOTHING after `Deno.serve`, fresh endpoint names, `deno check`
before push, entities via repo `.jsonc` with `role:system` RLS (correct public/private read).

## CURRENT LIVE STATE (baseline)
Home (rooms-as-doors): masthead + k-anon presence · QOTD · "Together this week" pool · "Close the week" ·
Book Club card · Living Wisdom card · 7 rooms (lounge / circles / love / money / style / lighter / health).
Rooms = sticky-tab feed + composer (PostCard / RoomComposer, both moderated server-side). Games-master
(`openGameRound`/`submitGameResponse`) lives INSIDE "The Lighter Side". Circles = static catalogue
(`circlesConfig.js`) → directory → consent-gate → scoped feed+composer (`CircleMembership` + `CommunityPost.circle`).
Book Club = Jess-hosted, `BookClubView` + self-attested checkpoints (`bookClubConfig.js`, `BookClubPick`/`ClubCheckpoint`/`ClubNote`).
Living Wisdom (`WisdomEntry` + `wisdomLibrary.js`). Echo Wall / Witness / Phase Twin live on the Journal side (light-touch only this pass).

---

## IN SCOPE — three batches

### BATCH 1 — BUILD: Library + Games rooms + the Club primitive
**A1. Library room (fixed, Jess-presided).** New room `library` in the rooms grid. Its view = a reading home:
the existing BookReader catalogue entry-point + the Book Club (reframed as the flagship **Jess-hosted Club**,
mechanics unchanged) + a small list of Jess-hosted reading/conversation Clubs. The standalone home Book Club
card folds INTO the Library room (de-clutter the home).
**A2. Games room (fixed, Jess-presided).** New room `games`. Move the games-master (`GameRoundCard`) here from
"The Lighter Side"; Lighter keeps its telly/stars daily-note identity. Games view = Jess's round + (later) game Clubs.
**A3. The Club primitive (infra + Jess-hosted live).** Clubs = "what you do together" (distinct from Circles =
"who you are"); see the brainstorm. Build, mirroring the proven Circles path:
  - **Static `clubsConfig.js`** — a small seed of **Jess-hosted Clubs** (live immediately, no DB seed needed; same
    precedent as circles/bookclub). 2–3 to prove the primitive (e.g. a walkers' Club, a creativity Club) + the
    Book Club as the flagship reading Club.
  - **`ClubMembership` entity** (mirror `CircleMembership`: device hash + club_key + consented; FULL `role:system` RLS incl. read).
  - **`CommunityPost.club` field** (mirror `.circle`; a club-scoped post pins to the club, shows only there).
  - **`Club` entity** (read-public for future member-created discovery; write `role:system`) — schema only; **no live
    member-created rows** (member creation flagged OFF).
  - **Functions** (self-contained, `Deno.serve` last, fresh names): `joinClub`, `leaveClub` (mirror joinCircle/leaveCircle);
    `createClub` (member-creation path) **shipped behind `CLUBS_USER_CREATE_ENABLED=false`** + admin-only guard — built,
    not enabled. `createCommunityPost` extended for `club` scope (same central moderation as every post).
  - **Client:** a Clubs directory + scoped feed+composer (reuse PostCard/RoomComposer), lurk-first, consent reuse;
    "create a Club" entry rendered as a flagged-off "coming" affordance (never a live create button).
**A4. Nav coherence.** Home rooms grid + room tab strip handle 9 rooms cleanly (scroll, order, active state).
**Entities to probe:** `ClubMembership` read→403 (non-owner) · `Club` read→200, client create→403 · `CommunityPost` read→200 (now has `.club`).
**Functions to probe:** `joinClub` / `leaveClub` → 400-not-404 · `createClub` → 400-not-404 (registers; returns "disabled" when flag off) · `createCommunityPost` → still 400.

### BATCH 2 — UPGRADE: v2 polish of the existing live surfaces
**B1. Lounge + comments + all room feeds.** Complete empty / loading / error states everywhere; kinder
microcopy; clearer thread display (poster→comments, reaction-only vs open, "Removed by Jess" tombstone styling);
gentle "be the first word" empty states per room. No counts.
**B2. Question of the Day v2.** Your-own answer history + the day's answers, presented as a quiet archive —
**no streaks, no counts, no pressure** ("a thread of your days," not a tally).
**B3. Games v2.** More prompt variety + warmth (expand the client fallback prompt set; warmer reveal copy);
keep aggregate-only, no winners/scores.
**B4. Circles depth.** A "circles you're in" surface (device-local joined state) + a warmer directory; lurk-first preserved.
**B5. Living Wisdom v2.** Topic chips + gentle rotation + an honest source label decision (curated vs from-the-wall).
**B6. Ambient presence v2.** Warmer, room-aware k-anon presence lines (still bucketed, never identifying).

### BATCH 3 — BUILD remaining (safe, non-legal-gated) + final polish
**C1. Tier-0 "others in your season" belonging card** (mega-plan §2.0 — smallest, highest-belonging). A home card
that reflects the user's life-stage cohort with k-anon framing ("women in your season are here this week"), **no exact
small count.** Server aggregate only if it can stay k-anon; otherwise a gentle qualitative line. Zero-moderation, read-only.
**C2. Rituals / pool polish.** "Together this week" + "Close the week" microcopy + states pass (aggregate-only, already server-safe).
**C3. Final brand + a11y + nav pass.** Emoji-zero re-scan, palette/font audit, focus/keyboard on new surfaces,
z-index/overlay coherence, console-clean across all Community views.

---

## OUT OF SCOPE (deferred — do NOT build/enable this pass)
- **Member-created Clubs ENABLEMENT** — infra built but `CLUBS_USER_CREATE_ENABLED=false`; gated behind the OSA/ICO legal floor.
- **Secret/invite-only Clubs**, co-host tooling, abandonment/Jess-caretaker lifecycle automation — post-floor.
- **Expert / AMA layer** — governance decided (`EXPERT_LAYER_GOVERNANCE.html`), still gated; no code.
- **Async voice-notes** — dormant, needs an STT key. **Live audio** — deferred.
- **Witness / Phase Twin / Echo Wall** deep rework — light-touch only (they're mature + on the Journal side).
- Anything needing the **OSA/ICO legal floor**, a new **API key**, or **native** capability (FLAG_SECURE).

## NEEDS-HALLI (standing list — accumulates across batches)
- **Per-batch deploys + live-verify** (entities/functions to probe listed per batch above).
- **OSA / ICO legal floor** — the gate to ENABLE member-created Clubs (flip `CLUBS_USER_CREATE_ENABLED`) + public Community scale.
- **Expert-layer governance** ratification (the LEGAL-RATIFY items in `EXPERT_LAYER_GOVERNANCE.html`).
- **STT key** (AssemblyAI / Deepgram) — to activate dormant voice-notes (not this pass).
- **B3 RLS non-owner probe** — confirm direct client `.filter()` on locked entities → 403 (now incl. `ClubMembership`), reads-where-public 200.
- **Open curation decision** — Living Wisdom source labelling (curated vs from-the-wall) + Book Club pick rotation.
- **Naming confirm** — "Clubs" for the user/Jess-created primitive (brainstorm Q1; working name, trivially renamable).

## DONE-WHEN
All three batches built + `deno check`/`vite build` green + Playwright webkit verified (render + behaviour + brand + console-clean)
+ committed/pushed per batch, with the needs-Halli list current. Member-created Clubs remain flagged off pending the legal floor.
