// HomeRedesignDoc — FoundersOS mirror of claude-state/COMMUNITY_HOME_REDESIGN.html.
// A cleaner Community-home proposal (approval only, NOT built). Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Badge, Table, Foot } from "@/components/founders/DocKit";

const KEEP = <Badge tone="green">KEEP</Badge>;
const DOOR = <Badge tone="amber">DOOR</Badge>;
const SLOT = <Badge tone="plum">SLOT</Badge>;
const HUB = <Badge tone="plum">HUB</Badge>;
const LINK = <Badge tone="plum">LINK</Badge>;
const REC = <Badge tone="green">RECOMMENDED</Badge>;

export default function HomeRedesignDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Community · Home redesign · PROPOSAL — approval only, NOT built</Eyebrow>
      <Title sub="The home has become a wall of cards. A quieter IA — a doorway, not a noticeboard — now that the central Jump switcher guarantees access to everything. Pick an option; nothing's rebuilt until you do. 2026-06-12.">
        A calmer Community doorway
      </Title>

      <Card accent="#4A2A3A">
        <P><b>The principle:</b> the home is a <b>calm doorway</b> — a quiet masthead + ambient presence, <b>one</b> gentle "today" focal point (recommend Question of the day), and the <b>rooms/doors as the spine</b>. Everything else becomes a door, rotates through a single "today" slot, lives in the Jump hub, or demotes to a small link. Because the Jump hub now reaches every area, <b>no secondary card needs to occupy the home</b>.</P>
      </Card>

      <H2>1. Current home — honest inventory</H2>
      <P>Today the home stacks <b>~14 blocks</b>. It reads as a noticeboard: no clear focal point, and the rooms (the spine) are buried below six-plus cards — the doors arrive at block 12.</P>
      <Table rows={[
        ["#", "Block", "What it is"],
        ["1", "Masthead", "Eyebrow + 'For the whole of you' + subtitle"],
        ["2", "Presence + Jump", "'A few women are around…' + the new Jump control"],
        ["3", "Season belonging", "'You're in good company' (life-stage line)"],
        ["4", "Share a thought", "Opens the internal Share-to sheet"],
        ["5", "Jess nudge", "Dismissible 'want a quiet place to write?'"],
        ["6", "Echo Wall card", "Opens the anonymous wall"],
        ["7", "Question of the day", "Today's prompt + the room's answers"],
        ["8", "'Together this week' pool", "Collective-ritual kindness bar + 4 pills"],
        ["9", "Close the week", "Weekly reflection + reveal"],
        ["10", "Clubs card", "Opens the Clubs directory"],
        ["11", "Living wisdom", "Featured line + 'read the collection'"],
        ["12", "Rooms grid (the spine)", "9 doors — Lounge/Circles/Library/Games/Love/Money/Style/Lighter/Health"],
        ["13", "Quietly one-to-one", "Witness + Phase Twin (→ Journal)"],
        ["14", "Talk to Jess · Invite · footer", "Slim affordances + footer"],
      ]} />
      <Card accent="#C4849A"><P><b>Density problem, named:</b> three collective cards (pool, close-week, wisdom) + two belonging beats + two actions + Echo + Clubs all compete above/around the doors. A first-timer scrolls a wall before she sees the place is <b>rooms she can walk into</b>.</P></Card>

      <H2>2. Recommendation per card</H2>
      <P>{KEEP} stays · {DOOR} becomes a room door · {SLOT} into one rotating "Today" slot · {HUB} via Jump · {LINK} demote to a small link.</P>
      <Table rows={[
        ["Card", "Rec", "Rationale"],
        ["Masthead", "KEEP", "The doorway's voice."],
        ["Presence line", "KEEP", "Ambient 'you're not alone' — one line."],
        ["Season belonging", "KEEP→fold", "Fold the life-stage line INTO the presence line (not a card)."],
        ["Question of the day", "KEEP", "The one 'today' focal point, under the masthead."],
        ["Rooms grid", "KEEP↑", "The spine — move UP, under Today, so doors lead."],
        ["Echo Wall card", "DOOR", "Add Echo Wall as a door — it's a place."],
        ["Clubs card", "DOOR", "Add Clubs as a door — consistent with Circles/Library/Games."],
        ["'Together this week' pool", "SLOT", "Rotate through the single Today slot; full version in a door/hub."],
        ["Close the week", "SLOT", "Pairs with the pool — same slot (near week's end)."],
        ["Living wisdom", "SLOT", "Featured line rotates through the Today slot; collection via Jump."],
        ["Share a thought", "LINK", "An action, not a card — a small link (or fold into room composers)."],
        ["Jess nudge", "KEEP", "Conditional, once-per-id, dismissible — low footprint; cap at one."],
        ["Quietly one-to-one", "HUB+link", "Already in the hub — demote to a discreet 'Quietly, one to one →' link."],
        ["Talk to Jess", "KEEP", "Slim footer affordance already."],
        ["Invite a friend", "LINK", "Low-frequency — a small footer link (also in the hub)."],
      ]} />

      <H2>3. Two layout options</H2>
      <H3prop title="Option A · Minimal doorway">
        Masthead → Presence+belonging (one line) · Jump → <b>Question of the day</b> → <b>Rooms/doors</b> (incl. Echo Wall + Clubs) → small links (Quietly one-to-one · Share a thought) → Talk to Jess · Invite · footer.
        <br/><b>~14 blocks → 5.</b> Everything else lives in the doors + the Jump hub. <Badge tone="amber">M</Badge>×<Badge tone="green">High</Badge> — calmest; loses the daily ambient warmth from the home.
      </H3prop>
      <Card accent="#A6862B">
        <P><b>Option B · Doorway + one rotating "today" slot</b> &nbsp; {REC}</P>
        <P>Masthead → Presence+belonging (one line) · Jump → <b>Question of the day</b> → <b>"Today in the community"</b> — ONE rotating slot (a wisdom line · or the kindness pool · or close-the-week · or a book/club spotlight — one at a time, never all) → <b>Rooms/doors</b> (incl. Echo Wall + Clubs) → small links → Talk to Jess · Invite · footer.</P>
        <P><b>~14 blocks → 6</b> (one of which gently rotates). Keeps the warmth without the wall. <Badge tone="amber">M</Badge>×<Badge tone="green">High</Badge>.</P>
      </Card>

      <Card accent="#6B8F5A">
        <P><b>Recommendation: Option B.</b> The calm doorway (masthead → one focal Today → doors), but a single rotating "Today in the community" slot keeps the collective warmth (wisdom, kindness pool, close-the-week, a club spotlight) alive — one at a time, never a stack. The pool's pills + close-week composer still work inside that slot when it's their turn; full versions live in a "Together" door / the hub. Nothing lost, nothing loud.</P>
      </Card>

      <H2>Approval checklist (tick to greenlight)</H2>
      <Bullets items={[
        "Option B — doorway + one rotating 'Today in the community' slot (recommended)",
        "Option A — minimal doorway (no rotating slot)",
        "Add Echo Wall + Clubs as doors in the rooms grid",
        "Move the rooms grid up (directly under Today)",
        "Fold the season belonging line into the presence line",
        "Demote Share-a-thought, Quietly-one-to-one, Invite to small links (all still in the Jump hub)",
        "Rotating slot content: wisdom · kindness pool · close-the-week · club/book spotlight (confirm rotation rule — daily? close-the-week weighted to week's end?)",
      ]} />

      <H2>Guardrails (unchanged)</H2>
      <Bullets items={[
        "Nothing becomes unreachable — the Jump hub reaches every area; Echo/Clubs become doors; pool/close-week/wisdom live in the slot + a door + the hub.",
        "Whole-life not clinical · anonymous-first · NO scoreboards/vanity counts (pool stays aggregate-only) · cream/plum · Ephesis+Cormorant · Lucide only · no emoji · 18+ · crisis routing on every input.",
        "The shipped fixes (kind zero state + pill feedback) carry into whichever slot the pool lives in.",
      ]} />

      <Foot>FemWell — Community Home Redesign · 2026-06-12. PROPOSAL for approval — nothing rebuilt. Once an option is ticked, the home is rebuilt to match (the Jump hub already guarantees access to every area). Companion to QA commit 841d137.</Foot>
    </DocShell>
  );
}

// small helper for an option block with a title
function H3prop({ title, children }) {
  return (
    <Card accent="#7B5E6B">
      <P><b>{title}</b></P>
      <P>{children}</P>
    </Card>
  );
}
