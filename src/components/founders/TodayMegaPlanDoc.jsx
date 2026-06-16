// TodayMegaPlanDoc — Founders Corner: the mega-plan for rebuilding the Today (home) page.
// Audit of every page (what each OWNS → what Today must NOT duplicate), cited research on daily
// home hubs, the new-Today IA + daily logic + edge states + phased build, and the 5 demo
// directions (previewable at /TodayDemo1..5, Founders → Previews). Phone-readable companion:
// femwell-handoff/today-mega-plan_20260616.html. No emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Bullets, Pull, Badge, Table, Foot } from "./DocKit";

export default function TodayMegaPlanDoc() {
  return (
    <DocShell>
      <Eyebrow>Today (home) · audit · research · mega-plan · 5 demos</Eyebrow>
      <Title sub="Today is the messiest page and the most important (it's the home, and one of only 5 bottom-nav slots). The plan: deeply understand the whole app first, then rebuild Today around ONE main thing — greet, orient, surface the right 2–3 things, deep-link the rest. Do NOT strip the live Today until a direction is chosen.">
        Today — the mega-plan
      </Title>

      <Pull>Today became the union of every page instead of doing its own job well — ~25 equal-weight cards re-implementing six other pages. The fix is subtraction + hierarchy: one hero, ≤3 chosen cards, everything else a doorway. FemWell already owns a stronger no-guilt hero than any competitor — the never-dying garden.</Pull>

      <H2>1 · Why Today feels messy (diagnosis)</H2>
      <P>The "today" tab renders ~25+ sibling sections in one flat stack, all the same visual weight, with no "one main thing". The failures:</P>
      <Bullets items={[
        "Duplication epicentre — it re-implements 6 pages inline: Nutrition (meal log + hydration ring + today card), Lifestyle (stories strip + chapter card + nudge = 3 entry points to one page), Journal (prompt + nudge), Community (today card), Programs (active + recommended), Planner (plan card). Today does every page's job badly instead of its own.",
        "Three+ overlapping insight systems stacked (DailyInsight + TodayInsight + ThisWeek + WeeklyInsight + DailyPlan recs + RecommendedForYou + SmartContext) saying similar things in different boxes.",
        "Multiple 'log how you feel' surfaces (inline mood/energy buttons + CheckinModal + symptom quick-action + the global logger FAB).",
        "Competing emotional registers in one scroll: a Panic/crisis button two cards above a playful nostalgia card above a hydration counter.",
        "Phase/life-stage logic only HIDES a few cards — it never prunes to the right 2–3. Everything that can show, shows.",
        "No empty/quiet state: a new user still sees ~20 empty/fallback cards — the most overwhelming first impression.",
        "It already absorbed the old Track page as a 2nd tab — Today is two pages in a trench-coat. (And a once-a-day Morning Brief overlay already greets+orients before Today even renders.)",
      ]} />

      <H2>2 · What each page OWNS (so Today stops duplicating)</H2>
      <P>Bottom nav has only 5 slots — Today · Lifestyle · Jess(FAB) · Profile · Menu — so Today is the de-facto front door into everything in the Menu. It should be a doorway, not a copy.</P>
      <Table rows={[
        ["Page", "Owns", "Today should"],
        ["Journal (hub)", "Writing + inner life (Echo Wall, Witness, Sealed Letters, Threads, Cycle Mirror, Insights)", "ONE journal nudge → deep-link; never host the composer/prompts"],
        ["Community (hub)", "Belonging + rooms + safety rails (QOTD, Lounge, Echo, Lighter, Library, Circles, Health room)", "ONE count-free pulse line → deep-link; never render posts/rooms"],
        ["Nutrition (hub)", "Food + hydration (log, plan, recipes, progress)", "At most ONE nutrition nudge → deep-link; drop inline ring + logger"],
        ["Lifestyle", "Editorial feed (For You/Browse/Listen, daily story, horoscope)", "At most ONE 'today's read'; not 3 entry points"],
        ["Planner", "Day/cycle logistics (tasks, habits, capacity, reminders, logs)", "A thin 'your day' line → deep-link; not the plan card + rituals"],
        ["Garden", "The living companion (accumulating, never dies, resting season)", "LEAD with it or feature it — it's the no-guilt heart, unique to home"],
        ["Health · Programs · Profile · DoctorExport · Jess", "Letters/education · structured practices · identity+life_stage · GP PDF · the AI overlay", "Contextual deep-links only (resume an active program; invoke Jess)"],
      ]} />

      <H2>3 · Research — the best daily hubs (cited)</H2>
      <Table rows={[
        ["Source", "Borrow", "Avoid"],
        ["Oura", "One headline + one sentence; time-of-day reshape; tap to expand", "The numeric score"],
        ["Apple Health", "User-curatable order; surface change, not raw data", "Undifferentiated card wall"],
        ["Flo / Clue", "Cycle-day anchor; one daily insight; one log CTA", "Content cramming, upsell, stage blind spots"],
        ["Finch", "Companion warmth; care-not-duty micro-actions", "Streak / reward currency"],
        ["Headspace / Calm", "One daily ritual / hero recommendation", "Tab + feature bloat"],
        ["Stoic / Day One", "A single phase/time-aware prompt as the home", "—"],
        ["Co-Star", "Editorial, dated, 'written for you today' voice", "Vagueness without utility"],
        ["Things", "An empty Today is a feature; show only today's items", "Backfilling emptiness with filler"],
      ]} />
      <H3>Principles for a whole-life women's-wellness home</H3>
      <Bullets items={[
        "One main thing — first viewport carries a single hero (greet + orient + ≤1 action).",
        "Greet, then orient — name + time-of-day, then one QUALITATIVE phase/stage line ('Inner Autumn · Day 22 — boundaries feel natural'), never a number.",
        "Surface 2–3 chosen things for TODAY — pick by logic, never render the union.",
        "Deep-link, never duplicate — every card is a doorway to the page that owns it.",
        "Cycle / life-stage / phase as the FILTER that selects content (pregnant → journey; menopause → symptom-pattern; TTC → fertility).",
        "No-guilt throughout — no counts, scores, streaks, 'you missed', red states. A quiet day = a resting season.",
        "Progressive disclosure + time-of-day — one line by default, expand on tap; morning orient/journal, midday nourish/move, evening reflect/wind-down.",
      ]} />

      <H2>4 · The new Today — IA + daily logic</H2>
      <H3>Information architecture (pruned hard)</H3>
      <Bullets items={[
        "1. Greeting + orientation hero — name + time-of-day + ONE qualitative phase/stage line + date. (Collapses 3 current cards into 1.)",
        "2. The companion garden — compact, tappable → /Garden. The emotional heartbeat; unique to home.",
        "3. ONE daily focus card — exactly one, chosen by the selector; deep-links its owning page. (Replaces the entire middle stack.)",
        "4. One optional 'noticing' — a single collapsed insight line, only if genuinely fresh. (Collapses 4 insight systems into 1.)",
        "5. A quiet 'anything else' row — 2–3 small doorways for the user who wants more.",
      ]} />
      <H3>Daily logic (the single-focus selector)</H3>
      <P>One selector picks the focus + prunes the rest, from inputs already in the codebase. Priority (first match wins): <strong>active program due today → a relevant unanswered safety/health prompt → time-of-day ritual (journal AM / nutrition midday / reflection PM) → a fresh noticing → garden/lifestyle gentle default.</strong> Filtered first by <code>life_stage</code>, framed by <code>computeCycleDay</code> phase + the qualitative season, shaped by local time. Never nags if already logged; never "you missed".</P>
      <H3>Edge / empty states</H3>
      <Bullets items={[
        "New user — greeting + a warm 'let's begin' + the seeded garden as a seed ('this is yours; it grows as you do') + ONE first action. No fallback wall, no empty rings.",
        "Quiet day — a calm near-empty Today is intended (Things-style): 'Nothing needs you right now. Your garden's resting — that counts too.'",
        "Resting garden — the evergreen state, framed as a season; never an empty pot or wilt.",
        "No cycle data / non-cycling stage — orientation switches to life-stage framing (journey week / recovery / symptom-season); never 'log your last period' for pregnant/menopausal users.",
      ]} />
      <H3>Phased build</H3>
      <Bullets items={[
        "Phase 0 — SUBTRACT: cut Today to hero + garden + one focus + quiet row; remove all duplicated page-cards. (Biggest win, lowest risk.)",
        "Phase 1 — the daily selector + collapse the 4 insight systems into one 'noticing'.",
        "Phase 2 — design the new-user / quiet / resting / no-cycle states properly.",
        "Phase 3 — harmonise with the hub design system (Centerpieces/SurfaceCard) + Ms Atelier brand gate; Ms Verify live-walk each stage. Also decide: does Today's hero absorb the once-a-day Morning Brief (avoid greeting twice)?",
      ]} />

      <H2>5 · The 5 demo directions <Badge tone="green">Built · previewable</Badge></H2>
      <P>Five genuinely different organizing concepts (not reskins), live at <code>/TodayDemo1..5</code> and in Founders → Previews. Pick a direction before stripping the live Today.</P>
      <Bullets items={[
        "1 · Calm single-focus hub — greeting + phase line, a single large focus card, garden footer, everything else behind a 'more' disclosure. (Calm/Things.) The FemWell default.",
        "2 · Cycle-led day — a phase ring/arc hero with day + season; focus chosen by phase; a switcher shows menopause/pregnancy reskinning the spine. (Oura/Flo, qualitative.)",
        "3 · Companion/garden-led home — your garden greets you in her voice; the focus is gentle 'tending'; resting season celebrated, never dies. (Finch, score-free.) Strongest FemWell-native.",
        "4 · Card-slider / deck — a swipeable deck, top card the focus, next peeking; reuses the Hero-Card-Slider language. Depth lateral, not a long scroll.",
        "5 · Editorial 'your day' story — a dated dispatch in Jess's voice weaving greeting + phase + one suggestion into prose, with inline doorways. (Co-Star/Stoic, cream/plum letter.)",
      ]} />

      <Foot>
        <P>Apps cited: Oura, Apple Health/Fitness, Flo, Clue, Finch, Headspace, Calm, Stoic, Day One, Co-Star, Daylio, Things. Full audit + research + key build files: <code>femwell-handoff/today-mega-plan_20260616.html</code>. The live Today is untouched — the 5 demos are previews for choosing a direction. Locked rails honoured: no-guilt, no scores/streaks, cream/plum, Lucide/SVG, no emoji, UK.</P>
      </Foot>
    </DocShell>
  );
}
