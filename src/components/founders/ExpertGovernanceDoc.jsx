// ExpertGovernanceDoc — FoundersOS in-app mirror of claude-state/EXPERT_LAYER_GOVERNANCE.html.
// The decided governance framework for Community Phase-4 Pillar 5 (the Expert layer).
// Recommendations only — not legal advice. Cream/ink editorial, no emoji. (Pillar 5 stays
// SCOPED, NOT BUILT.)

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Table, Foot } from "@/components/founders/DocKit";

const PRODUCT  = <Badge tone="green">PRODUCT</Badge>;
const RATIFY   = <Badge tone="red">LEGAL-RATIFY</Badge>;
const COMMERCIAL = <Badge tone="plum">COMMERCIAL</Badge>;
const CLINICAL = <Badge tone="amber">CLINICAL</Badge>;

export default function ExpertGovernanceDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Community Phase 4 · Pillar 5</Eyebrow>
      <Title sub="Decided product positions + the items a qualified lawyer must ratify before launch. Source: EXPERT_LAYER_SCOPE.md · mega-plan §3.9 + locked principle #11 + §5. Dated 2026-06-11.">
        Expert Layer — Governance Framework
      </Title>

      <Card accent="#4A2A3A">
        <P>Halli asked us to <i>"do the governance calls."</i> This turns the open questions in the scope doc into a decided framework: a recommended answer for every gate, with the rationale, each tagged {PRODUCT} (decided by us), {COMMERCIAL}/{CLINICAL} (Halli owns), or {RATIFY} (a qualified UK lawyer must sign off before launch).</P>
        <P><b>We are not lawyers.</b> Everything below is a recommended position to take <i>to</i> counsel — not legal advice, and it binds no one. The {RATIFY} items need a qualified UK lawyer (with clinical-governance input) before the layer carries real traffic. <b>No code until the gate checklist at the end is green.</b></P>
      </Card>

      <H2>0. What the layer is</H2>
      <P>A trust + anti-misinformation wedge: verified UK clinicians (GMC / NMC / HCPC) give <b>general, non-individualised</b> information + misinformation correction, in a surface <b>quarantined from peer chat</b> (the Flo model). The one monetisable layer — every peer surface stays free. Askers are anonymous (author_hash, crisis-checked + moderated like every input); only the expert is identified.</P>

      <H2>1. Clinician verification {PRODUCT} {RATIFY}</H2>
      <P>"Verified" must mean something — a fake clinician badge is a serious harm. Three checks, not one:</P>
      <Bullets items={[
        <span><b>Register check:</b> confirm the registrant exists, number matches name, status "Registered" with no conditions/suspensions/sanctions — on the live public register: GMC (LRMP), NMC register, HCPC register. All free public lookups, the source of truth.</span>,
        <span><b>Identity check:</b> the register proves a number exists, not that the applicant owns it — add a live video ID check vs photo ID + a corroborating link to the registration (employer/practising letter or registrant-name confirmation).</span>,
        <span><b>Scope + standing:</b> record declared scope of practice (a dietitian doesn't answer on prescribing); confirm good standing at check.</span>,
      ]} />
      <Card><P><b>Recommendation:</b> manual vetting by a named owner at launch (low volume; vendor/register-API later). Re-verify every 6–12 months and before each AMA — status/sanctions change. Store name, body, number, verified_at, verified_by, status_at_check, scope. The badge shows body + registration number so any member can self-verify.</P></Card>
      <P><b>Decided (product):</b> the 3-check process, manual-at-launch, re-verification cadence, badge contents. <b>Ratify (legal/ICO):</b> identity-proofing standard; lawful basis + retention for verification evidence.</P>

      <H2>2. Medical-advice boundary, scope limits + disclaimers {PRODUCT} {CLINICAL} {RATIFY}</H2>
      <P>The danger is drift from <i>general information</i> into <i>individualised advice</i> — that creates a clinician–patient duty of care + liability (GMC Good Medical Practice; Bolam). Enforced by design, not just copy.</P>
      <H3>Hard scope limits (enforced)</H3>
      <Bullets items={[
        "No diagnosis — experts never tell an individual what they have.",
        "No prescription or medication changes.",
        "No individualised treatment advice or triage; no interpreting a specific person's results/scans/symptoms.",
        "No emergency handling — acute routes to 999 / NHS 111, never an expert queue.",
        "General framing only — answer the theme (\"people with PCOS often…\"), never the person.",
      ]} />
      <H3>The disclaimer / interstitial (on every answer)</H3>
      <Pull>This is general information, not personal medical advice. For advice about you, see your GP or call NHS 111. In an emergency, call 999.</Pull>
      <H3>Enforcement mechanics</H3>
      <Bullets items={[
        "Banned-topic routing: diagnosis / dosage / \"should I stop my meds\" / result-interpretation questions are auto-flagged and answered with a templated \"we can't advise on your individual care — here's who can\"; they never reach an expert.",
        "Pre-publication review (async): a named reviewer with clinical input signs off each answer before it publishes.",
        "Clinician guidance: a one-page content policy (general-only, banned list, framing) before they answer.",
      ]} />
      <P><b>Decided (product):</b> hard scope limits, general-only framing, interstitial presence, banned-topic routing, pre-pub review. <b>Ratify (legal + clinical):</b> exact disclaimer wording + sufficiency; the duty-of-care line; clinician guidance signed off by a clinician.</P>

      <H2>3. Quarantine from peer chat {PRODUCT}</H2>
      <Card><P><b>Recommendation:</b> experts operate <b>only</b> in the dedicated "Ask an Expert" / AMA surface — a separate IA node. They do not post in rooms, Circles, the Lounge, comments, Echo Wall, Witness, Phase Twin, games, or Book Club. No expert badge in any peer surface. The expert role is <b>scoped to the AMA entities only</b> (expert accounts cannot author CommunityPost / Comment / Echo). Clinicians never carry medical authority into casual chat (locked principle #11; the Flo separation).</P></Card>
      <P><b>Decided (product):</b> full quarantine, role-scoped to AMA. Askers anonymous; only the expert identified.</P>

      <H2>4. Reporting / escalation + crisis {PRODUCT} {RATIFY}</H2>
      <Bullets items={[
        "Crisis intercept on the question input — the same UK-resources pre-check as every text box, fired BEFORE a question reaches an expert/queue. A crisis disclosure never becomes an expert Q.",
        "Question moderation — same OpenAI-moderation + keyword + health allowlist as comments.",
        "Reporting an answer — members report; reports route to the named reviewer; a serious clinical-safety report temporarily hides the answer pending review.",
        "Escalation ladder — report → human reviewer → (clinical-safety) de-list expert → (unprofessional conduct) consider a referral to their regulator. Complaints + appeals owner named (Halli).",
        "Crisis inside a thread — the intercept fires again if an asker replies with crisis content.",
      ]} />
      <P><b>Decided (product):</b> crisis-on-question, moderation reuse, report routing, escalation ladder, named owner. <b>Ratify (legal/OSA):</b> the threshold/duty for a regulator referral; appeals adequacy under the OSA.</P>

      <H2>5. How it sits under UK rules {RATIFY}</H2>
      <Table rows={[
        ["Regime", "The line", "Our position (recommended)"],
        ["CQC", "General info + peer support is NOT a regulated activity; the line is 'treatment of disease…' or 'diagnostic/screening' via a clinician–service-user relationship.", "Design so no regulated activity occurs — the §2 scope limits keep it outside CQC registration. Lawyer confirms; re-test if scope expands."],
        ["Advertising of health services (ASA/CAP + GMC/NMC)", "Health claims truthful, not misleading; testimonials can mislead; clinicians follow their regulator's advertising rules.", "No efficacy/cure claims; 'general information' framing; experts bound by a content policy reflecting their regulator's guidance; badge must not imply individualised care."],
        ["OSA 2023 (Ofcom)", "Asker side = user-generated content on a user-to-user service → illegal-content + moderation + reporting + appeals duties apply.", "Fold the expert surface into the same OSA risk assessment + moderation/reporting/appeals as Community; the 18+ gate applies."],
        ["ICO / UK GDPR", "Questions = special-category health data → explicit consent + lawful basis. Verification data is personal data needing retention policy.", "Extend the Community DPIA to cover asker health data AND expert verification data; explicit special-category consent on the ask flow."],
      ]} />
      <P><b>All four are LEGAL-RATIFY.</b> The positions above keep the surface in the safest lane; counsel must confirm each before launch. These overlap the OSA/ICO legal floor already on the needs-Halli list.</P>

      <H2>6. Named accountable owner {PRODUCT} {CLINICAL}</H2>
      <Card><P><b>Recommendation:</b> Halli (already the OSA/ICO accountable person) owns vetting, complaints, de-listing. <b>Add a named clinical reviewer</b> — a registered clinician — to sign off answer-review, since Halli is not a clinician. Until that reviewer exists, the layer does not launch.</P></Card>

      <H2>7. Launch scope — async vs live {PRODUCT}</H2>
      <Card><P><b>Recommendation: async-only first.</b> Every answer is reviewable before it publishes — the whole safety model. Live AMA is far harder to moderate in real time + raises real-time crisis/advice-drift risk. Add live only once async is proven and real-time moderation exists.</P></Card>

      <H2>8. Doctor-Export exclusion {PRODUCT}</H2>
      <Card><P><b>Recommendation:</b> the GP/Doctor-Export <b>excludes</b> expert Q&amp;A — general info, not the user's clinical record, and bundling it could imply individualised advice. (Whole-life rule already specced; verify when built.)</P></Card>

      <H2>9. Commercial model {COMMERCIAL} {RATIFY}</H2>
      <Card><P><b>Recommendation:</b> experts are the one monetisable layer (peer surfaces always free). At launch: a few vetted clinicians on a <b>paid sessional/honorarium basis</b> or a reputable-org partnership (e.g. a menopause clinic). <b>Avoid</b> pure-volunteer (weak accountability) and pharma-sponsored experts (conflict + advertising exposure).</P></Card>
      <P><b>Halli's call (commercial):</b> paid vs partnership. <b>Ratify (legal):</b> the expert contract — duties, indemnity, their own professional cover, liability carve-outs.</P>

      <H2>10. Liability / ToS / indemnity / insurance {RATIFY}</H2>
      <P>Who carries the risk when an answer is wrong or read as advice? Wholly a legal item: platform ToS carve-outs, the "not medical advice" framing as a contractual term, the experts' own indemnity, the platform's insurance. Drafted + signed off with the OSA/ICO floor. Nothing here is a product call.</P>

      <H2>Summary — every gate</H2>
      <Table rows={[
        ["#", "Gate", "Decided position", "Owner"],
        ["1", "Clinician verification", "3-check (register+identity+scope), manual at launch, re-verify 6–12mo", "Halli + counsel"],
        ["2", "Medical-advice boundary", "Hard scope limits + interstitial + banned-topic routing + pre-pub review", "Halli + clinician + counsel"],
        ["3", "Quarantine from peer chat", "AMA-only, role-scoped, no badge peer-to-peer", "Product"],
        ["4", "Reporting / escalation / crisis", "Crisis-on-question + moderation reuse + report→reviewer→de-list/regulator", "Halli + counsel"],
        ["5", "UK rules (CQC/ASA/OSA/ICO)", "Stay general-info (not a regulated activity); fold into OSA RA + DPIA", "Counsel"],
        ["6", "Accountable owner", "Halli (governance) + named clinical reviewer (answer sign-off)", "Halli"],
        ["7", "Launch scope", "Async-only first; live AMA later", "Product"],
        ["8", "Doctor-Export exclusion", "Excludes expert Q&A", "Product"],
        ["9", "Commercial model", "Paid sessional / partnership; never pharma-sponsored or pure-volunteer", "Halli + counsel"],
        ["10", "Liability / ToS / indemnity", "ToS carve-outs + experts' indemnity + platform insurance", "Counsel"],
      ]} />

      <H2>Build gate — green ALL before any code</H2>
      <Card accent="#BC2E27">
        <Bullets items={[
          "Verification process written + named owner + named clinical reviewer for answer sign-off.",
          "Disclaimer wording, duty-of-care boundary, clinician guidance — signed off by a lawyer + clinician.",
          "Liability / ToS / indemnity / insurance drafted + signed off (with the OSA/ICO floor).",
          "CQC / ASA / OSA / ICO positions confirmed by counsel; DPIA extended to the expert surface.",
          "Commercial model + expert contract chosen + drafted.",
        ]} />
        <P><b>When green</b>, the build is small and reuses the existing anonymity + crisis + moderation spine on the question side. The hard part was never the code — it is this governance, now decided where it can be and scoped where a lawyer must decide it.</P>
      </Card>

      <Foot>FemWell — Expert Layer Governance Framework · 2026-06-11. Companion to claude-state/EXPERT_LAYER_SCOPE.md. Recommendations only; not legal advice; LEGAL-RATIFY items bind no one until a qualified UK lawyer signs them off. The expert feature remains SCOPED, NOT BUILT.</Foot>
    </DocShell>
  );
}
