# LC-5 — Closeout sweep: 7 pending verifies + Spotify URLs + image_url backfill

> This MP is a HYBRID. Sections A and C are DIRECT-OPERATOR work (Ms Verify Chrome MCP walks + an in-devtools backfill loop). Section B is the ONLY part that gets pasted into the base44 builder. The user should NOT paste Sections A or C — those are scripts for me / Ms Verify to execute directly.
>
> The `## SECTION B — Paste into base44` rule below marks where the paste-ready prompt begins.

---

## §1 Pre-flight (read first)

Read these files before doing anything:
- `mnt/femwell/verify_high_risk_three_2026-05-13.md` (Ms Verify's last walk — sets the baseline for what's already CAN'T-TELL vs OK).
- `mnt/femwell/image_backfill/batch1_results.json` (the prior image backfill batch — the JSON pattern Section C reuses).
- `mnt/femwell/femwell_master_plan_2026-05-13.md` §10 Phase A (the 7 pending verifies are #147 / #151 / #156 / #157 / #158 / #161 / #162; the £55 Spotify URLs are queued; the image backfill is queued).
- `src/components/horoscope/sections/TodaysWeather.jsx` lines 23-36 (the `MOON_SIGN_PLAYLIST` static map).

Pre-flight checks before starting:
1. **Confirm the seven pending verifies are still pending.** Check the user's task tracker for tasks #147 / #151 / #156 / #157 / #158 / #161 / #162. If any are marked done since this MP was authored, skip them in Section A.
2. **Confirm `TodaysWeather.jsx` still uses placeholder Spotify URLs.** Read lines 23-36; expect to see the 12-entry static map with `37i9dQZF1D…` Spotify IDs that look like prefab "decade rewind" playlists, not Astra-curated.
3. **Count empty-image Longreads rows.** Run in dashboard devtools (or via MCP `query_entities`):
   ```js
   const empties = await base44.entities.LifestyleItems.filter(
     { provider: 'RSS', image_url: '' }, '-created_date', 200,
   );
   console.log({ total_empty: empties.length });
   ```
   Expected from master plan §10 Phase A: ~80 rows. If 0, skip Section C.

HEAD SHA expected: after LC-1 + LC-2 + LC-3 + LC-4 ship. If the operator wants to run LC-5 before earlier MPs land, only Section A (verifies) and Section C (image backfill) make sense — Section B's Spotify URL swap is independent and can also run early.

---

## SECTION A — Direct work, no base44 paste needed

**Owner:** Ms Verify (Chrome MCP). Mr Lead Manager dispatches her.

For each of the seven pending verifies, Ms Verify walks the live page on `femwells.com`, captures DOM evidence + a screenshot (when the screenshot tool works; per the 2026-05-13 verify session the tool was broken — re-attempt in a fresh Chrome MCP session), peeks the relevant entity rows if needed, and writes a one-paragraph verdict to `mnt/femwell/verify_lc5_section_a_<task#>.md`.

### A.1 Task #147 — Pipeline Phase 4-A + 4-B
- **What shipped:** Phase 4-A pipeline-fixup (ingestRSS field rename) + Phase 4-B daily caps logic.
- **Walk:**
  - `https://femwells.com/Lifestyle?tab=for_you` — does the editorial hero render with a UK source name (Stylist, Refinery29 UK, MindBodyGreen, etc.)? Does the Bento show ≥6 distinct sources within the last 7 days?
  - Dashboard → Data → `LifestyleItems` — filter `created_at >= last-24h` and count by `source_name`. No source should exceed `daily_item_cap` (typically 5 for RSS, 3 for YouTube).
  - Dashboard → Data → `IngestErrorLog` — filter `function_name=ingestRSS AND logged_at >= last-24h`. Count rows by `stage`. Expect <10 entries; sparse is healthy.
- **Verdict format:** OK / SILENTLY BROKEN / CAN'T TELL — with one sentence on why.

### A.2 Task #151 — Phase 5-A UK source list expansion
- **What shipped:** new UK women's-wellness sources added to `LifestyleSources` (Refinery29 UK, Stylist, Grazia UK, etc.).
- **Walk:**
  - Dashboard → Data → `LifestyleSources` — filter `is_active=true AND category in ['Lifestyle','Mental Wellness','Hormones & Cycle']`. Count rows and visually scan for non-UK domains.
  - `https://femwells.com/Lifestyle?tab=browse&filter=articles` — does the type filter chip page show ≥3 distinct UK sources in the first 20 cards?
- **Verdict format:** same as A.1.

### A.3 Task #156 — Phase 5-B1 (audit + retire dead sources)
- **What shipped:** dead source vet pass — sources whose feed_url 404s should be flipped to `is_active=false`.
- **Walk:**
  - Dashboard → Data → `LifestyleSources` — filter `is_active=false`. Count rows. Expect ≥10 (memory: `project_femwell_content_pipeline_broken.md` says ~10 dead).
  - Dashboard → Data → `IngestErrorLog` — filter `stage in ['feed_fetch','intake'] AND logged_at >= last-7d`. Count rows by `source_identifier`. Repeat offenders should all be `is_active=false`.
- **Verdict format:** same as A.1.

### A.4 Task #157 — Browse tab Type chips
- **What shipped:** the Browse sub-tab Type filter chips (All · Articles · Fiction · Stories · Books · Guides) — `a20f8f4` and follow-up.
- **Walk:**
  - `https://femwells.com/Lifestyle?tab=browse` at mobile + tablet + desktop.
  - Click each chip. Does the grid filter? Are the empty states humane ("No fiction yet — we add a few stories a week")?
  - Bookshop.org UK link present on the Books card (`a45bb0e`)?
- **Verdict format:** same as A.1.

### A.5 Task #158 — Phase 5-B2 (image backfill nightly fold)
- **What shipped:** og:image + Wikipedia + Wikimedia Commons backfill folded into `pipelineOrchestrator` (`88b4231`).
- **Walk:**
  - Dashboard → Data → `LifestyleItems` — filter `provider='RSS' AND image_url IS NULL OR image_url=''`. Count rows. Compare to the count from master plan §10 Phase A (~80 rows). If the count has dropped substantially, Phase 5-B2 is doing its job. If it's still ~80, the nightly fold isn't running.
  - Dashboard → Automations — is the `pipelineOrchestrator` schedule enabled? When was the last run?
- **Verdict format:** same as A.1. Also dictates whether Section C below is still needed.

### A.6 Task #161 — Phase 6 (engagement mirror cards)
- **What shipped:** MP-Eng-1 OnThisDay + Friend6Months + PhaseInbox cards (per `verify_high_risk_three_2026-05-13.md`).
- **Walk:** per Ms Verify's prior diagnosis the cards mount correctly but the test account has no past data. To verify rendering, either:
  - (a) sign in as the user's own account (if her profile is complete with ≥30 days of history) and screenshot the Today page;
  - (b) seed a test fixture: create `DailyCheckins` rows dated `today − 30d` and `today − 6mo`, set `UserProfile.last_period_start_date` to a date that puts the user in luteal today, then walk `/Today` and `/Lifestyle?tab=for_you`.
- **Verdict format:** same as A.1, plus a note on which path was taken.

### A.7 Task #162 — Listen tab (post-LC-1 + LC-3)
- **What shipped:** LC-1's PodcastRail + LC-3's PracticeRail + the new "Practice" chip in place of Sessions.
- **Walk:**
  - `https://femwells.com/Lifestyle?tab=listen` at all three viewports.
  - Three rails stack (Podcasts → Practice → TikTok). Each ≥3 cards.
  - Chip row reads All · Videos · Podcasts · Practice (no Sessions).
  - Tap a podcast card → sheet opens with Play or external link. Tap a practice card → same.
- **Verdict format:** same as A.1.

### A.8 Aggregate report
After all seven walks, Ms Verify writes a single summary file `mnt/femwell/verify_lc5_summary.md` with the seven verdicts in a table + any cross-cutting bugs spotted. Surface immediately to the user.

---

## SECTION B — Paste into base44

This is the ONLY section that gets pasted into the base44 builder. Section A's verdicts and Section C's backfill loop are operator-direct work.

> Paste everything below the rule into the base44 builder. Do NOT include this header or the Section A / Section C content.

---

# LC-5-B — Replace placeholder Spotify URLs in TodaysWeather

## §1 Pre-flight

Read `src/components/horoscope/sections/TodaysWeather.jsx`. The `MOON_SIGN_PLAYLIST` map at lines 23-36 maps each of the 12 zodiac moon-signs to a Spotify playlist URL. The current values are prefab Spotify "decade rewind" type playlists (`37i9dQZF1DXcBWIGoYBM5M` is Spotify's editorial "Today's Top Hits" / "Peaceful Piano" family — not Astra-curated).

Confirm the map still has 12 entries and the values match the placeholder Spotify IDs in §4 below.

## §2 Goal

Replace the 12 placeholder Spotify URLs in `MOON_SIGN_PLAYLIST` with public Spotify editorial playlists whose mood/vibe matches each moon sign archetype. Each URL must resolve to an actually-existing public Spotify playlist (verify by opening each in a browser before paste).

## §3 Constraints

- UK English in any embedded copy. £. en-GB. No emoji. Lucide icons + SVG only.
- Fraunces + Inter only. No Playfair, no `#C084FC`. Same 5-slot bottom nav at all viewports.
- All twelve URLs must be **public** Spotify playlists at the time of paste — operator verifies each in a browser.
- DO NOT add a tracking parameter, UTM, or referrer to the URLs — clean canonical form only.
- DO NOT introduce any new dependencies. The fetch happens client-side at link-time via the browser, not the app.

## §4 Diff plan

| Path | Action | One-line description |
|---|---|---|
| `src/components/horoscope/sections/TodaysWeather.jsx` | EDIT | Replace the 12-entry `MOON_SIGN_PLAYLIST` static map with verified curated URLs. |

Replace lines 23-36:
```js
const MOON_SIGN_PLAYLIST = {
  aries:       "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
  taurus:      "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
  gemini:      "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLusmQ",
  cancer:      "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
  leo:         "https://open.spotify.com/playlist/37i9dQZF1DXdSjVZQzv2tl",
  virgo:       "https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa",
  libra:       "https://open.spotify.com/playlist/37i9dQZF1DX2sUQwD7tbmL",
  scorpio:     "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
  sagittarius: "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n",
  capricorn:   "https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4",
  aquarius:    "https://open.spotify.com/playlist/37i9dQZF1DXcF6B6QPhFDv",
  pisces:      "https://open.spotify.com/playlist/37i9dQZF1DWXLeA8Omikj7",
};
```

With (vibe-mapped, archetype-aligned):
```js
const MOON_SIGN_PLAYLIST = {
  // Aries Moon — energetic, decisive, kinetic ("Power Workout")
  aries:       "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP",
  // Taurus Moon — earthy, languid, sensory ("Calm Vibes")
  taurus:      "https://open.spotify.com/playlist/37i9dQZF1DWVV27DiNWxkR",
  // Gemini Moon — curious, conversational, light ("All The Feels")
  gemini:      "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634",
  // Cancer Moon — tender, nostalgic, home-soft ("Acoustic Calm")
  cancer:      "https://open.spotify.com/playlist/37i9dQZF1DX4E3UdUs7fUx",
  // Leo Moon — warm, dramatic, open-hearted ("Confidence Boost")
  leo:         "https://open.spotify.com/playlist/37i9dQZF1DX4fpCWaHOned",
  // Virgo Moon — focused, devotional, precise ("Deep Focus")
  virgo:       "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
  // Libra Moon — gracious, balanced, aesthetic ("Soft Pop Hits")
  libra:       "https://open.spotify.com/playlist/37i9dQZF1DX1clOuib1KtQ",
  // Scorpio Moon — intense, intimate, undertow ("Late Night Vibes")
  scorpio:     "https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8",
  // Sagittarius Moon — expansive, adventurous, hopeful ("Have a Great Day!")
  sagittarius: "https://open.spotify.com/playlist/37i9dQZF1DX7KNKjOK0o75",
  // Capricorn Moon — structured, monumental, patient ("Peaceful Piano")
  capricorn:   "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
  // Aquarius Moon — futurist, cool, atmospheric ("Electronic Concentration")
  aquarius:    "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS",
  // Pisces Moon — oceanic, surrendered, sleepy ("Sleep")
  pisces:      "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
};
```

Add a comment block above the map explaining the curation logic so future maintainers don't drift back to prefab IDs:

```js
// MOON_SIGN_PLAYLIST — Astra-curated public Spotify playlist per moon sign.
// Each URL is a public Spotify editorial playlist whose mood matches the
// moon-sign archetype (research_horoscope_v2_FINAL §8 + Astra's note 2026-05-13).
// Verify each URL resolves before editing — placeholder IDs were swapped on
// LC-5-B. Re-vet quarterly: Spotify retires editorial playlists silently.
```

> **Operator verification before paste:** open each of the 12 URLs in a fresh browser tab. If any returns a 404 / "Playlist not found", replace it with another Spotify editorial playlist in the same family and update the comment. If you cannot verify URLs at paste time, leave the placeholder URLs in place and add a §11 "deferred" note for next session.

## §5 Schema changes

None.

## §6 LLM prompt changes

None.

## §7 Visual acceptance test (per viewport)

Walk femwells.com/Lifestyle?tab=horoscope.

- **Mobile (toggle → Mobile, ~380px):** Today's Weather card renders. Below the Astra-signed weather line, the "Astra's sound for today →" text-link is visible. Tap → opens the Spotify URL (handled by Spotify deep-link on iOS / Android, web fallback elsewhere). The URL resolves to a real playlist, not a 404.
- **Tablet (toggle → Tablet, ~768px):** Same content, width-constrained to ~600-720px wrapper.
- **Desktop (toggle → Desktop, ~1280px):** Same content, NO sidebar substitution.

Brand checks:
- No emoji codepoints in the link copy.
- "Astra's sound for today" reads as-is (no curly quotes or stray characters).
- The link uses the user's `moonSign` or falls back to `sun`; if neither is set, the link is hidden (existing fallback logic).

## §8 Success criteria (falsifiable)

- The 12 URL values in the new map all return HTTP 200 when fetched (verified by operator click-through before paste, OR by a `curl -I` from a clean network).
- Tapping the "Astra's sound for today" link on the live Horoscope tab opens a real Spotify playlist — NOT a "Playlist not found" page.
- The pre-change behaviour (link hides when moon/sun is unset) is preserved.

## §9 Risks + mitigations

1. **Spotify silently retires editorial playlists.** Mitigation: comment block tells future maintainers to re-vet quarterly. Section C of LC-5 (operator-direct) does not need to repeat this check.
2. **A geographic-restriction may make some playlists unavailable in the UK.** Mitigation: operator-verifies each URL in a UK browser session (not a VPN-routed one).
3. **The curated playlists I'm picking are still editorial, not literally "Astra-curated".** Mitigation: copy says "Astra's sound for today" but doesn't claim Astra hand-built the playlist. If DD requires literal curation (R3 in master plan §11), pivot to a Pisces-Moon-by-Astra-Cole branded playlist in H3. Documented.
4. **If the operator cannot verify all 12 URLs at paste time:** the §4 instructions tell them to skip the swap entirely and add a deferred note. Better placeholders than 404s.

## §10 Rollback

If any URL turns out to be wrong post-publish: edit `TodaysWeather.jsx` directly (single-file change, no MP needed) and push. Click `Revert` on the assistant message to roll back the full diff if multiple URLs are wrong. The placeholder URLs are preserved in version control and can be restored by reverting the commit.

## §11 Sequence

LC-5-B is the only paste section of LC-5. Run after Section A's seven verifies are documented (because the verifies may surface additional issues that change the priority). Sections A and C run in parallel with LC-5-B; they don't depend on it.

Done signal: Horoscope tab renders the Spotify link; click resolves to a real Spotify playlist; visible on all three viewports.

---

## SECTION C — Direct work via base44 SDK loop (operator runs in Chrome devtools)

**Owner:** Mr Lead Manager dispatches to the operator. The operator opens `https://femwells.com` in Chrome, signs in, opens DevTools → Console, and pastes the script below. The script iterates ~80 empty-image Longreads rows and patches each via `base44.entities.LifestyleItems.update`.

This is the third execution of the "Image backfill — direct MCP loop" pattern (the prior task #190 used the same approach — see `mnt/femwell/image_backfill/batch1_results.json` for the previous output format).

### C.1 Pre-flight

1. **Confirm Section A.5 (task #158) didn't already fix the count.** If the nightly fold has reduced empty-image rows to <20, skip Section C. If it's still ~80, proceed.
2. **Confirm the operator is signed in as admin.** `window.base44 ?? null` should be defined in devtools. If it isn't, the SDK is bundled and not exposed on `window` (per Ms Verify's note in `verify_high_risk_three_2026-05-13.md`). In that case, fall back to using `import('@base44/sdk')` via a temporary `<script type="module">` tag — but easier: use the `base44 secrets set` CLI on a laptop with the repo checked out, or use the dashboard Data view + manual paste.

### C.2 The script

The "fetch og:image and patch" loop. Save the JSON results to `mnt/femwell/image_backfill/batch4_results.json` mirroring `batch1_results.json` format.

```js
// Run in DevTools console on https://femwells.com (signed-in as admin).
// Iterates LifestyleItems with provider='RSS' and empty image_url,
// fetches og:image from the content_url, and patches the row.
//
// Output: console.log({ patches: { [id]: image_url, ... }, failures: [...] })
// Copy the output into mnt/femwell/image_backfill/batch4_results.json.

(async () => {
  // Try to get the SDK off window first; fall back to a re-import if vite-bundled.
  let b = window.base44;
  if (!b) {
    const mod = await import('@base44/sdk');
    b = mod.base44 || mod.default;
  }
  if (!b) {
    console.error('base44 SDK unavailable; abort');
    return;
  }

  const empties = await b.entities.LifestyleItems.filter(
    { provider: 'RSS', image_url: '' },
    '-created_date',
    200,
  );
  console.log(`Found ${empties.length} empty-image RSS rows.`);

  const patches = {};
  const failures = [];

  // og:image extractor — fetches the article HTML, parses head meta.
  // Bypasses CORS via the public CORS proxy at corsproxy.io.
  // (Operator: only run this against trusted URLs; verify the proxy is alive.)
  async function extractOgImage(url) {
    try {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      // og:image — try property=og:image then name=og:image then twitter:image.
      const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
              || html.match(/<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["']/i)
              || html.match(/<meta[^>]+property=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
      if (!og) return null;
      const raw = og[1].trim();
      // Resolve relative URLs against the page URL.
      try {
        const abs = new URL(raw, url).toString();
        return /^https?:/.test(abs) ? abs : null;
      } catch { return null; }
    } catch (err) {
      throw err;
    }
  }

  let i = 0;
  for (const row of empties) {
    i += 1;
    if (i % 10 === 0) console.log(`...progress ${i}/${empties.length}`);
    if (!row.content_url) { failures.push({ id: row.id, reason: 'no content_url' }); continue; }
    try {
      const img = await extractOgImage(row.content_url);
      if (!img) {
        failures.push({ id: row.id, reason: 'no og:image found' });
        continue;
      }
      await b.entities.LifestyleItems.update(row.id, { image_url: img });
      patches[row.id] = img;
    } catch (err) {
      failures.push({ id: row.id, reason: err?.message || String(err) });
    }
    // Gentle rate limit — corsproxy.io is community-run.
    await new Promise(r => setTimeout(r, 250));
  }

  const result = { patches, failures, total: empties.length, patched: Object.keys(patches).length };
  console.log('=== RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  console.log(`Patched ${result.patched}/${result.total}. Failures: ${result.failures.length}.`);
})();
```

### C.3 Save the results

After the script finishes:
1. Right-click the final `result` log → "Copy object".
2. Paste into a new file `mnt/femwell/image_backfill/batch4_results.json`.
3. Commit (direct edit — Markdown/JSON outside the repo is operator territory).

### C.4 Success criteria

- After the script finishes, the dashboard devtools count `LifestyleItems.filter({ provider: 'RSS', image_url: '' }).then(r => r.length)` returns < 20 (master-plan target).
- `batch4_results.json` contains both `patches` and `failures` arrays. The patches array maps row id → image URL.
- A spot-check of 5 patched rows in Dashboard → Data → `LifestyleItems` shows the new `image_url` field is populated AND renders correctly on `/Lifestyle?tab=browse` (fetch the row's `content_url` in Chrome, confirm the og:image meta matches what was patched).

### C.5 Risks + mitigations

1. **corsproxy.io rate-limits or goes down.** Mitigation: 250ms sleep between rows + try/catch. If many failures, switch to a different CORS proxy (`api.allorigins.win`, `cors-anywhere.herokuapp.com`).
2. **A row's `content_url` is now a dead link.** Mitigation: failures are logged with `reason`; operator re-runs on a smaller list after a content audit.
3. **`base44` SDK not on `window`.** Mitigation: the script tries `import('@base44/sdk')` as a fallback. If both fail, the operator runs the loop from a local Node script using a service-role token (one-off setup, documented in `mnt/femwell/image_backfill/SETUP.md` if not present).

### C.6 Rollback

If the patches write incorrect images: rows are still recoverable from before-the-write because `image_url: ''` was the prior state. Manual rollback: for any row that ended up with a wrong image, edit `image_url` back to `''` via Dashboard → Data and let the nightly fold try again. To rollback the whole batch: keep `batch4_results.json` as the diff; iterate it in reverse, patching each id back to `image_url: ''`. The operator can write a 4-line reverse loop in devtools to do this.

---

## §11 Sequence (cross-section)

LC-5 is the closeout MP. Run order:
- **Section A (verifies):** run anytime after LC-1 + LC-2 + LC-3 + LC-4 ship. Dispatch Ms Verify.
- **Section B (Spotify URLs):** can run anytime — independent. Paste into base44 after Section A's verdicts are in (because A.5 may surface additional priorities).
- **Section C (image backfill):** run only if A.5 confirms the empty-image count is still ~80. If A.5 says the nightly fold has it under 20, skip C entirely.

Done signal for LC-5:
- `mnt/femwell/verify_lc5_summary.md` exists with seven verdicts.
- `TodaysWeather.jsx` has the curated Spotify URLs committed AND the Horoscope tab shows a working link on all three viewports.
- `mnt/femwell/image_backfill/batch4_results.json` exists with at least 60 patches AND the dashboard count of empty-image Longreads is < 20.

When all three are true, the Lifestyle tab is closed out, the master plan §10 Phase A list collapses to zero open items, and the Planner phase (master plan §10 Phase B item 3) becomes the next sprint.
