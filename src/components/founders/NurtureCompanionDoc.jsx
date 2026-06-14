// NurtureCompanionDoc — in-app FoundersOS mirror of the Nurture Companion brainstorm
// (claude-state / femwell-handoff: nurture-companion-brainstorm_20260614.html).
// Deep IDEATION only — a gentle, no-punishment retention companion she tends over time.
// No build commitment. No emoji. Lucide/SVG only.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Table, Foot, D } from "./DocKit";

// A small inline botanical sketch — a blooming plant in the FemWell palette.
function BloomSketch() {
  return (
    <div style={{ margin: "16px 0", textAlign: "center" }}>
      <svg viewBox="0 0 380 200" width="100%" style={{ maxWidth: 380 }} role="img" aria-label="A blooming plant sketch">
        <rect x="0" y="0" width="380" height="200" rx="14" fill={D.paper} stroke={D.rule} />
        <path d="M150 168 L230 168 L222 196 L158 196 Z" fill="#C98A6B" opacity="0.85" />
        <rect x="146" y="160" width="88" height="10" rx="3" fill="#B57A5C" />
        <ellipse cx="190" cy="162" rx="40" ry="6" fill={D.inkSoft} opacity="0.45" />
        <path d="M190 162 C188 130 192 110 190 86" fill="none" stroke={D.sage} strokeWidth="4" strokeLinecap="round" />
        <path d="M190 138 C168 134 156 120 158 104 C176 110 190 122 190 138 Z" fill={D.sage} />
        <path d="M190 122 C212 118 226 104 224 88 C204 94 190 106 190 122 Z" fill="#9bbd9b" />
        <circle cx="190" cy="74" r="9" fill={D.gold} />
        <g fill={D.rose}>
          <ellipse cx="190" cy="58" rx="7" ry="13" />
          <ellipse cx="206" cy="68" rx="13" ry="7" />
          <ellipse cx="174" cy="68" rx="13" ry="7" />
          <ellipse cx="201" cy="86" rx="9" ry="11" transform="rotate(35 201 86)" />
          <ellipse cx="179" cy="86" rx="9" ry="11" transform="rotate(-35 179 86)" />
        </g>
        <circle cx="190" cy="74" r="5" fill={D.gold} />
        <circle cx="158" cy="100" r="3.5" fill={D.rose} opacity="0.55" />
        <circle cx="224" cy="84" r="3.5" fill={D.rose} opacity="0.55" />
      </svg>
      <div style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 13, color: D.inkSoft, fontStyle: "italic", marginTop: 6 }}>
        A plant that blooms — growth visible, buds always waiting, nothing wilts.
      </div>
    </div>
  );
}

export default function NurtureCompanionDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Ideation · Not a build · 2026-06-14</Eyebrow>
      <Title sub="A deep brainstorm for a gentle, warm, bring-her-back companion she tends over time — designed to pull WITHOUT guilt, decay, death or streak-shame. A thinking document, not a commitment.">
        The Nurture Companion
      </Title>

      <Pull>She doesn't come back because something is dying without her. She comes back because something is quietly growing with her — and it is glad to see her, however long it's been.</Pull>

      <Card>
        <P><strong>The core idea (Halli's).</strong> Every FemWell user has a living thing — a plant, an animal, a garden, a constellation — that she nurtures over time. As she shows up for herself, it grows: a soft, emotional reason to return — a companion and a witness, not a scoreboard.</P>
        <P><strong>The hard constraint.</strong> FemWell is no-scoreboard, no-shame, wellbeing-first, and serves a sometimes-vulnerable audience (postpartum, perimenopause, grief, fertility, ED histories). The companion must never punish, die, decay from neglect, guilt-trip, or weaponise a streak. The whole craft: <strong>keep the retention pull, drop every dark pattern.</strong></P>
      </Card>

      {/* 1 */}
      <H2>01 · What the companion could BE</H2>
      <P>Several forms could carry the idea, each with a different emotional register. The question isn't "which is cutest" — it's "which can grow gently, hold rest as valid, and never imply she failed it."</P>
      <BloomSketch />
      <Table rows={[
        ["Form", "For this audience — pro / con"],
        ["Plant that blooms", <span><Badge tone="green">strong fit</Badge> Calm, feminine, growth-as-metaphor; rest reads as dormancy. Con: must design dormancy as resting, never dying.</span>],
        ["Animal / familiar", <span><Badge tone="green">strong fit</Badge> Warmest "glad to see you" reciprocity (Finch). Con: carries the deepest neglect-guilt (Tamagotchi) — needs no-hunger, no-sadness design.</span>],
        ["Garden that fills", <span><Badge>good</Badge> Accumulating, never-emptying. Con: a sparse garden could read as "behind" — frame as what she's grown, never what's missing.</span>],
        ["Self-bloom / avatar", <span><Badge tone="plum">interesting</Badge> Literally tending yourself. Con: her body/face as avatar risks self-judgement — safer as an abstract bloom or aura.</span>],
        ["Constellation", <span><Badge>good</Badge> Each act lights a star; stars never go out — built-in no-decay; ties to cycle/moon. Con: cooler, less "company."</span>],
        ["Tree through seasons", <span><Badge tone="green">strong fit</Badge> Maps to life-stage and cycle seasons; bare winter is valid, not death. Con: slow — needs ambient micro-life.</span>],
        ["Nest", <span><Badge tone="plum">tender</Badge> Soft, safe, "home." Con: nest/egg imagery can wound around fertility, loss, postpartum — handle carefully or make optional.</span>],
        ["Hearth", <span><Badge>good</Badge> Embers never fully die, instantly relightable — a lovely no-punishment model. Con: more a place than a "someone."</span>],
      ]} />
      <Card accent={D.sage}>
        <P><strong>Recommended lead direction:</strong> a <strong>living garden with one signature bloom/companion at its heart</strong> — the heart-element gives warmth and someone to greet; the garden gives permanent accumulation. Constellation as the night/cycle mode.</P>
        <P>Let her <strong>choose</strong> her form at onboarding (bloom / companion creature / constellation) and rename it. Choice = agency = less infantilising, more "mine."</P>
      </Card>

      {/* 2 */}
      <H2>02 · How it grows from real engagement</H2>
      <P>It must grow from genuine self-care moments already in the app — not a synthetic points economy bolted on. Every existing action emits a quiet "tending" signal. Crucially: <strong>signals only ever add warmth; nothing subtracts.</strong></P>
      <Table rows={[
        ["App action", "Gentle growth signal"],
        ["Daily check-in / mood", "A little light / dew — 'you visited'"],
        ["Journalling", "A new leaf or petal unfurls (reflection = depth)"],
        ["Meal / hydration log", "Soil enriches; the plant looks nourished"],
        ["Cycle / symptom tracking", "The companion shifts to match her season"],
        ["Community presence / kindness", "A visiting bird / butterfly arrives"],
        ["Rest logged / a gap returned-from", "A warm 'welcome back' bloom — rest counts"],
        ["Programme / breath / audio", "A soft glow; a calmer companion"],
      ]} />
      <H3>Growth philosophy</H3>
      <Bullets items={[
        <span><strong>No points, no number, no score.</strong> Growth shows as state (lush, glowing, in-bloom, resting) — never a counter she can fall behind on.</span>,
        <span><strong>Breadth over volume.</strong> Variety of self-care makes a richer garden than hammering one metric — discourages obsessive single-metric behaviour.</span>,
        <span><strong>Diminishing, never punishing.</strong> The first gentle act of the day moves the most; no incentive to over-log. You can't win, so you can't lose.</span>,
        <span><strong>Permanent gains.</strong> Like Forest's trees or Finch's items, what she grows stays grown. A living record, not a fragile streak.</span>,
      ]} dot={D.sage} />

      {/* 3 */}
      <H2>03 · Tied to whole-life, cycle &amp; stage</H2>
      <P>This is where a generic pet becomes a FemWell companion: it breathes with her body and her life — uncannily personal, and reframing her natural rhythms as beautiful rather than as performance.</P>
      <H3>It reflects her season</H3>
      <Bullets items={[
        <span><strong>Cycle phase</strong> tints the scene: menstrual = soft, resting garden ("a season of rest"); follicular = fresh shoots; ovulatory = full bloom; luteal = warm golden, drawing inward.</span>,
        <span><strong>Life stage</strong> sets palette and tone: teen's playful garden → reproductive → soft greens of pregnancy → a tender, low-demand postpartum mode → perimenopause as rich autumn → menopause as a wise, golden, evergreen garden. It matures with her — never "downgrades."</span>,
        <span><strong>Rest is valid progress.</strong> On a period / hard / low-energy day the garden softens: "Resting is tending too." She's rewarded visually for honouring her body, not for output.</span>,
      ]} />
      <Pull>The companion blooms with self-kindness, not productivity. A nap honoured is a petal earned.</Pull>
      <P>Because FemWell is whole-life (relationships, career, joy, creativity — not just clinical), the garden should also respond to non-clinical care: a creative journal entry, a kind word in the Lounge, planning something joyful. It celebrates her whole life, not her symptoms.</P>

      {/* 4 */}
      <H2>04 · The emotional hook</H2>
      <P>Why does a woman actually come back? Not for a number — for a relationship. The proven warm hooks, from the gentlest exemplars:</P>
      <Bullets items={[
        <span><strong>Companionship.</strong> Something is there, glad to see her (Finch waves; Neko Atsume's cats turn up). Low-key company for someone who may feel unseen.</span>,
        <span><strong>Witness.</strong> It has watched her show up for herself — living proof of "look how far we've grown" when her own inner voice forgets.</span>,
        <span><strong>A living record of self-care.</strong> Scroll the garden and see months of tending — more tender than a stats page; it feels like a life.</span>,
        <span><strong>Gentle reciprocity.</strong> She tends it; it responds with warmth. A bond, never a debt. (The line Tamagotchi crossed: reciprocity became obligation.)</span>,
        <span><strong>Curiosity &amp; surprise.</strong> Ambient, unpredictable delight — a new visitor, a rare night-flower. A reason to peek that isn't a demand.</span>,
      ]} dot={D.rose} />
      <H3>What the exemplars teach</H3>
      <Table rows={[
        ["App", "Take / leave"],
        ["Finch", <span><Badge tone="green">model</Badge> Self-care bird, never sad with you; rest counts; "your bird is proud." The gentlest blueprint — borrow heavily.</span>],
        ["Forest", <span><Badge tone="green">take</Badge> permanent, tangible growth. <Badge tone="red">leave</Badge> the "tree dies if you leave" punishment.</span>],
        ["Neko Atsume", <span><Badge tone="green">take</Badge> Zero-pressure, ambient, can't-fail, delight-on-return.</span>],
        ["Animal Crossing", <span><Badge tone="green">take</Badge> Slow, seasonal, warm; rewards presence not grinding.</span>],
        ["Tamagotchi", <span><Badge tone="red">cautionary</Badge> Death + neglect-guilt. The exact trauma to design out.</span>],
        ["Duolingo", <span><Badge tone="red">cautionary</Badge> Streak-guilt, the disappointed owl, loss-aversion as a weapon.</span>],
        ["Habitica", <span><Badge tone="red">cautionary</Badge> HP loss / avatar "dies" on missed habits — punishment-driven.</span>],
      ]} />

      {/* 5 */}
      <H2>05 · Nurture WITHOUT punishment</H2>
      <Card accent="#BC2E27">
        <P><strong>The non-negotiable.</strong> No guilt. No punishment. No death. No neglect-decay. No streak-shaming. A vulnerable user must never open FemWell to find she has harmed something, fallen behind, or "killed it." This single rule separates a kind retention mechanic from a harmful one — and it is fully achievable while keeping the pull.</P>
      </Card>
      <H3>Keep the pull, drop the dark patterns</H3>
      <Table rows={[
        ["Dark pattern", "FemWell does instead"],
        ["Pet dies / withers from neglect", "It cannot die. After a gap it simply rests — sleeping softly, never sick, never sad."],
        ["'You broke your streak!'", "No streaks exist. Returning triggers a warm welcome-back bloom: 'Lovely to see you. Let's pick up gently.'"],
        ["Guilt-trip on return", "The companion is always pleased to see her — never reproachful, never 'where were you.'"],
        ["Decay / losing progress", "Growth is permanent. A gap pauses; it never deletes."],
        ["Loss-aversion pressure", "The pull is positive anticipation (something nice to return to), never fear of loss."],
        ["Notifications that nag", "Warm, infrequent, opt-in invitations ('a new visitor in your garden'), never 'your pet is hungry.'"],
      ]} />
      <H3>The "rest" mechanic — the heart of it</H3>
      <P>Inactivity is reframed as a <strong>resting season</strong>, identical to a menstrual or low-energy phase. The garden dims gently and goes quiet, like a real garden in winter — explicitly beautiful and intentional, not degraded. On return (a day or three months later) there is a small genuine welcome and the garden wakes. <strong>Rest is the same visual language as her period.</strong> The app already says rest is valid; the companion lives it.</P>
      <Pull>A real garden in winter isn't dying. It's waiting, on purpose. Returning is spring — and spring is always welcome.</Pull>

      {/* 6 */}
      <H2>06 · How it spans the pages</H2>
      <Table rows={[
        ["Surface", "The companion's role"],
        ["Today", "Its home. A small living vignette greets her, reflects today's cycle/mood season, offers one gentle invitation. The emotional front door."],
        ["Journal", "Reflection makes it visibly flourish — a new leaf/petal on save. It can witness gently: 'that was a brave thing to write down.'"],
        ["Nutrition", "Nourishing herself nourishes the soil; hydration as morning dew. Joy-foods and shared meals count too, not just macros."],
        ["Community", "Kindness sends a visiting butterfly to her garden — and maybe another woman's. Optional friend-garden peeking, never a leaderboard."],
        ["Profile", "The full living record — her garden over time, the seasons she's moved through, what she's grown. Customisation lives here."],
      ]} />
      <P><em>Consistency rule:</em> one companion, one state, seen from different rooms — never a different pet per page. It is her companion, accompanying her through the whole app.</P>

      {/* 7 */}
      <H2>07 · Risks &amp; open questions</H2>
      <H3>Risks — and how to avoid them</H3>
      <Bullets items={[
        <span><strong>Emotional harm.</strong> Any whiff of decay/death could hurt a fragile user. Mitigation: the never-dies / always-rests rule is absolute, tested with vulnerable-state walkthroughs.</span>,
        <span><strong>Infantilising adult women.</strong> A cutesy pet can feel condescending. Mitigation: elegant, botanical, editorial art in the FemWell palette — closer to William Morris than a cartoon; let her choose a sophisticated form; allow it off entirely.</span>,
        <span><strong>Fertility / loss sensitivity.</strong> Nest/egg/seed imagery can wound. Mitigation: avoid pregnancy-coded growth as defaults; make those forms opt-in; sensitivity-review postpartum &amp; TTC modes.</span>,
        <span><strong>It becomes a hidden scoreboard.</strong> Lushness read competitively. Mitigation: no comparison, no numbers, no "complete"; celebrate variety, not volume.</span>,
        <span><strong>Dev complexity / scope.</strong> Seasonal art × 11 stages × 4 phases is large. Mitigation: phase it — one form, a few states first; layer art over time.</span>,
        <span><strong>Gimmick / churn.</strong> Could feel bolted-on. Mitigation: wire it to genuine actions from day one; it must mean something.</span>,
      ]} dot="#BC2E27" />
      <H3>Open questions</H3>
      <Bullets items={[
        "One companion for life, or start fresh / keep several? (Risk: 'starting over' implying the old one was lost.)",
        "How visible by default — a quiet Today vignette, or a full dedicated space she opts into?",
        "Any social layer (peeking at a friend's garden) without tipping into comparison?",
        "How does it behave for a brand-new user with no history — warm from minute one, or earn warmth?",
        "Naming & tone of the companion's 'voice' — present and warm, or near-silent and ambient?",
        "Does it ever proactively notify, and if so, what is the single gentlest possible message?",
      ]} />

      {/* 8 */}
      <H2>08 · Phased build path</H2>
      <P style={{ fontSize: 14 }}><Badge>IDEATION</Badge> &nbsp;A sketch of a possible path — explicitly not a commitment. Sequenced so the kind, no-punishment core ships first.</P>
      <Card accent={D.sage}>
        <H3>Phase 0 — MVP: one bloom, on Today</H3>
        <Bullets items={[
          "A single plant/bloom on the Today screen.",
          "Grows from a few existing signals (check-in, journal, one nutrition log).",
          "3–4 visible states; the rest / welcome-back mechanic working end to end.",
          "No streaks, no numbers, no notifications. Prove the warmth.",
        ]} dot={D.sage} />
      </Card>
      <Card>
        <H3>Phase 1 — Season-aware</H3>
        <Bullets items={[
          "Cycle phase tints the scene; rest-day messaging live.",
          "Life-stage palette so it matures with her.",
          "The Profile 'living record' view.",
        ]} />
      </Card>
      <Card accent={D.rose}>
        <H3>Phase 2 — Companion &amp; garden</H3>
        <Bullets items={[
          "Add the heart-companion (bird/butterfly) and a fuller garden.",
          "Wire Journal, Nutrition, Community signals.",
          "User customisation & choice of form; gentle opt-in visitor moments.",
        ]} dot={D.rose} />
      </Card>
      <Card>
        <H3>Phase 3 — Richer ambient life</H3>
        <Bullets items={[
          "Constellation / night mode tied to the moon & cycle.",
          "Seasonal & rare delights; optional gentle friend-garden peeking.",
          "Deeper, sensitivity-reviewed stage-specific worlds.",
        ]} />
      </Card>

      <Foot>
        <P><strong>One-line stance.</strong> Build a companion that is a witness and friend to her self-care — that grows with every kindness, rests when she rests, and is always glad she came back. Retention through warmth, never through fear.</P>
        <P>FemWell · Nurture Companion brainstorm · ideation only · no build, no commit, no deploy · 2026-06-14. Sources referenced lightly from memory: Finch, Forest, Neko Atsume, Animal Crossing, Tamagotchi, Duolingo, Habitica, Pou, Alba.</P>
      </Foot>
    </DocShell>
  );
}
