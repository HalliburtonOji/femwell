# FEMWELL WORKFLOW — READ THIS FIRST

## IF YOU ARE STARTING A NEW SESSION OR JUST RESET:
You are working on the FemWell app. Before doing ANYTHING else, confirm you understand this workflow.

## THE ONLY WAY TO BUILD FEATURES:
1. Edit code directly in this repo (React app synced to Base44)
2. Commit each build with git
3. Do NOT use the Base44 web editor chat interface — it costs paid build points
4. Do NOT search for local paths — you already have the repo open
5. Do NOT spin up new task sessions — work happens here

## APP DETAILS:
- Live at: femwells.com
- Base44 App ID: 69a9891a6ccccc1822bbb4bc
- Design tokens: --femwell-cream #F4EDDB, --femwell-espresso #3A2C1A, --femwell-blush #E8B4B8, --femwell-sage #8FAF8F, --femwell-muted #9B8B7A
- 11 life stages: teen, reproductive, pre-ttc, ttc, pregnant-t1/t2/t3, postpartum, perimenopause, menopause, post-menopause
- Test user: ojihalliburton57 / ojihalliburton57@gmail.com

## WHEN DISPATCH (ORCHESTRATOR) RESETS:
If you see "This session is being continued from a previous conversation that ran out of context" — you have reset. STOP. Tell the user immediately: "I've just reset and lost workflow memory. I'm checking CLAUDE.md for the rules. Ready to continue — what's next?" Then wait for instruction before doing anything.

## CURRENT STATE (update after each sprint):
- Sprint 1–4: complete and committed
- Sprint 5: complete and committed
- Sprint 6: ready for specs

### Jess major build (Features 1–3): COMPLETE ✅
- Feature 1 — JessConversation entity + history drawer + auto-naming
- Feature 2 — JessMemory system (extract + inject + settings)
- Feature 3 — Voice Logger (Web Speech → LLM → multi-entity writes)
- /Assistant migration to JessDemoPanel (closes [JESS CONTEXT] leak)
- QA rounds 1–6 landed (day_key, chip parser, drawer delete, memory
  poll-loop, single-turn context, subscribe-log dedupe, dead-code
  cleanup, todayISO unused-var fix)

### Jess Feature 4 (For You real data + 3 Wings): COMPLETE ✅
- For You tab Section 1 — `PHASE_RECS` lookup × 5 categories (nutrition /
  movement / rest / mood / social), horizontal scroll-snap cards
- For You tab Section 2 — `JessNoticedCard` agent call against last 7
  days of DailyCheckins + SymptomLogs, daily cache + Lucide thumbs feedback
- For You tab Section 3 — `NEXT_PHASE_PREVIEW` static lookup, hidden for
  pregnancy/postpartum/menopause stages
- Wing 1: `JessJournalPrompt` on `/Journal` (daily-cached prompt, "Use
  this prompt" pre-fills `NewEntrySheet` via new `seedText` prop)
- Wing 2: `JessPatientSummary` on `/DoctorExport` (weekly-cached clinical
  summary, copy-to-clipboard appends "Not medical advice")
- Wing 3: Astra handoff — `JessDemoPanel` "Talk to Astra" chip after 3+
  user turns → sessionStorage `jess_astra_handoff` (phase/topics/mood)
  → `/Lifestyle?tab=horoscope&from=jess` → `JessAstraBanner` mounts at
  top of `HoroscopeTab` with 2h TTL, dismissable
- Shared service: `src/services/jessAgentService.js` (`callJessAgent`,
  `loadDailyCache`, `saveDailyCache`, `todayKey`, `weekKey`)
- No emoji throughout — Lucide-only icons (Apple, Activity, Moon, Heart,
  Users, ThumbsUp, ThumbsDown, Star, Sparkles, RefreshCw)
- Shipped commit `2359640` on `main`, live bundle `index-DDFcefDF.js`

### Feature 5: TBD by Halli post-QA

### ⚠️ Publish workaround
UI "Publish App" button regularly hangs on "Publishing..." because of a
stale base44 preview-mode lint auto-fix loop. **Deploy via direct API:**
```
POST https://app.base44.com/api/apps/69a9891a6ccccc1822bbb4bc/deploy
Authorization: Bearer <base44_access_token from localStorage>
```
Returns 200 in ~5s. Live bundle hash flips ~60–90s later.
