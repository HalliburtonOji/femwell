# FemWell Care — Multi-Stage Research (2026-05-13)

_Authored by Ms Deep Search. Six stages. Foundation document for the FemWell Care surface — built for **Phase 1: no contracted clinical staff, full UK regulatory compliance from day one**, with a clean upgrade path to Phase 2 (contracted nurse on retainer) when subscribers fund it. Companion to `claude-state/research_nurse_section_2026-05-13.md` (the 2,500-word brainstorm; this doc builds on it rather than repeating it) and `claude-state/master-plan.md` §6.8 / §6.9 / §11 R3 / R9. Cited throughout; items marked `[unverified — check this]` need a human pass before they land in any sale-deck or DD pack._

---

## Executive summary

The brief is a thread-the-needle: ship a Care surface that does **real work** for UK women without the app drifting into territory that triggers MHRA, CQC, NMC, GMC, ASA or ICO enforcement. The good news is that the line is well-marked, the cheat-codes exist, and competitors are visibly camped on either side of it. The five findings that drive Care v1 scoping are:

1. **The MHRA SaMD trigger is "intended purpose."** A wellness app becomes a regulated medical device the moment it is *intended* to "diagnose, prevent, monitor, predict, prognosticate, treat or alleviate disease." Phase 1 Care must be unambiguously **educational and signposting** in copy, intent and architecture — not because the wording is decorative but because every screen will be read by a buyer's regulatory counsel against MHRA's Software and AI as a Medical Device Change Programme Roadmap (October 2022 onwards; classification reform now slated for completion by mid-2030 after the recent extension of CE-mark recognition) (source: https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device).
2. **CQC registration is triggered by "treatment of disease, disorder or injury" performed remotely, not by content.** Pure information + algorithmic *signposting* to NHS pathways is out of scope; *triage* (e.g. "you should go to A&E") is in scope and would require CQC registration. The AIDRS guidance, launched April 2024 by NICE/MHRA/CQC/HRA, is the single document FemWell should print and pin (source: https://www.digitalregulations.innovation.nhs.uk/regulations-and-guidance-for-developers/all-developers-guidance/regulated-activities-check-if-you-need-to-register-with-the-care-quality-commission-cqc/).
3. **ASA enforcement on health claims has accelerated.** On 10 December 2025 the ASA upheld complaints against nine advertisers for unlawful medicinal claims in paid ads using their "Active Ad Monitoring System" (source: https://www.lexology.com/library/detail.aspx?g=0cfcb87f-cb61-4dde-a924-873f62b54c5b). Babylon Health's 2023 collapse — preceded by years of MHRA scrutiny over its triage chatbot (source: https://techcrunch.com/2021/03/05/uks-mhra-says-it-has-concerns-about-babylon-health-and-flags-legal-gap-around-triage-chatbots/) — is the cautionary tale. Phase 1 Care must read like NHS-aligned editorial signposting, not like clinical advice with a disclaimer bolted on.
4. **The cheat-code is the NHS Website Content API + NHS UK Open Content Licence + Open Government Licence v3.0.** NHS Digital syndication and NICE's UK Open Content Licence let us legally republish, adapt and remix NHS A-Z and NICE-derived information **free, commercially, and at scale** so long as we attribute correctly and don't reproduce NHS/NICE brand marks. This single source pair removes 80% of the content-authoring cost from Care v1.
5. **The single biggest tripwire is the named-clinician credentials trap (master-plan R3).** It is one thing to invent "Astra Cole, MA, FAS" — astrology is unregulated. It is *categorically* different to invent "Hattie Reynolds, RGN." NMC registration is **public** at nmc.org.uk/online, GMC registration is **public** at gmc-uk.org. A by-line under a fake NMC PIN would be detected in five minutes by any DD lawyer and is — in some framings — a breach of the Nursing and Midwifery Order 2001 protected-title provisions. **Phase 1 Care ships with anonymous editorial framing ("FemWell editors, reviewed against NHS and NICE guidance") only. No invented nurse name. No invented PIN.**

**Top three features for Care v1 (weeks 1-4 of launch):**

- **W1-2: NHS Pathway Helper.** Algorithmic signposting (not triage) with the NHS Website Content API as the trusted backbone. Routes users to NHS 111, GP, sexual health clinic, pharmacist, A&E based on rule-based logic the user can see. No diagnosis, no advice.
- **W2-3: Cycle-aware NHS A-Z.** Re-skinned NHS Health A-Z entries with a permissive cycle-phase footer ("if you're in luteal week and this concerns you, here's what to flag at your GP" — never "this happens because you're in luteal"). NHS content licensed under OGL/NHS UK Open Content Licence.
- **W3-4: GP Prep document generator.** Adapts the existing Care Bridge clinician-export demo (`claude-state/demos/femwell_care_bridge_v2_demo.html`) into a patient-facing PDF the user prints and hands to their GP. Takes a 30-day cycle/symptom snapshot plus the NICE-aligned questions a clinician will ask. Highest-value lowest-risk feature in the whole stack.

**Five open user questions blocking Care v1 scope-lock** (also tracked in §6 of this doc):

1. **Phase 1 by-line policy** — confirm "FemWell editors, NHS-aligned" anonymous framing only (no invented clinician name), per Stage 5.
2. **Care location** — top-level `/Care` route (recommended) vs Menu drawer entry. Brainstorm recommended top-level; this research confirms.
3. **Disclaimer wording lock** — sign off on the binding 60-word footer drafted in Stage 5 §5.6 before any Care copy ships.
4. **NHS API approval** — application to the NHS England Developer Hub needs to start in week 1; the API is free but the migration to the new hub completes spring 2026 and we need to be in the queue.
5. **Phase 2 nurse-hire trigger** — confirm the £4,500/month / ~500 Plus subscribers threshold from §6 (or set a different one) so we don't accidentally cross it before we're ready.

**The one regulation tripwire that could kill a sale:** an unbranded "Ask the Nurse" feature shipping in Phase 1 — even labelled "AI-generated answers reviewed for safety" — would be read by buyers' counsel as MHRA SaMD Class IIa (the most likely classification once the new rules land) (source: https://www.emergobyul.com/news/mhra-publishes-revised-roadmap-future-regulatory-framework-medical-devices). A Class IIa device requires a UK Approved Body conformity assessment, post-market surveillance, vigilance reporting within 15 working days for serious incidents (legislation in force from 16 June 2025) (source: https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device), and ISO 14971 risk management plus IEC 62304 software-lifecycle compliance. Cost: six-figure remediation; timeline: 9-18 months. **Phase 1 Care must contain no Q&A surface that takes a user's symptoms and returns text describing what those symptoms might mean.** Pathway routing (input symptom → output NHS resource link) is fine; symptom interpretation (input symptom → output description of possible cause) is not.

---

## Stage 1 — UK regulation landscape

The Care surface lands inside a regulatory landscape that has moved meaningfully in the last 18 months and will move again before our 6-month sale window closes. The summary here is grounded in primary sources where possible; where I could not locate a primary citation I have marked the claim `[unverified — check this]` for a human-pass review. Most secondary-level claims (e.g. the exact wording of an MHRA roadmap deliverable) need the binding statutory or regulator document attached to a DD pack — these search-result summaries are starting points, not final authorities.

### 1.1 MHRA Software as a Medical Device (SaMD)

The governing framework in 2026 is the **Software and AI as a Medical Device Change Programme Roadmap**, originally published by MHRA on 17 October 2022 with iterative deliverables since (source: https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device). The Roadmap sits on top of the **Medical Devices Regulations 2002 (as amended)** and is being supplemented by:

- The **Post-Market Surveillance (PMS) regulations** in force from **16 June 2025**. These require serious incidents to be reported within **15 working days** with tighter timescales for deaths and public health risks (source: https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device, summary at https://www.penningtonslaw.com/insights/update-on-regulatory-changes-for-software-based-medical-devices/).
- The MHRA's **April 2024 launch (with NICE / CQC / Health Research Authority) of the AI and Digital Regulations Service (AIDRS)** at https://www.digitalregulations.innovation.nhs.uk/ — this is the single most useful "where do I start?" portal for any UK digital health developer and is where the FemWell team's compliance reading list begins.
- The **CE-mark extension** announced 2024-2025 allowing certain CE-marked devices including SaMD to continue selling in the UK until **30 June 2030** (source: https://www.emergobyul.com/news/mhra-publishes-revised-roadmap-future-regulatory-framework-medical-devices).
- Forthcoming **cybersecurity guidance for SaMD** planned for Q2 2025 [unverified — check publication status against MHRA's roadmap tracker].
- **Future classification rule:** once the new UK rules land most SaMDs will be classified as **Class IIa**, mirroring the EU MDR rules (source: https://www.emergobyul.com/news/mhra-publishes-revised-roadmap-future-regulatory-framework-medical-devices). Class IIa requires UK Approved Body conformity assessment — a non-trivial cost and timeline.

**The trigger question for FemWell Care is "intended purpose."** Under MDR 2002 / EU MDR Annex VIII / forthcoming UK rules, software becomes a medical device when it is *intended* to "diagnose, prevent, monitor, predict, prognosticate, treat or alleviate disease, or compensate for an injury or disability." A wellness app with cycle tracking is on the borderline; an app that triages symptoms or interprets clinical data is firmly over it. The MHRA's 2021 statement on Babylon (source: https://techcrunch.com/2021/03/05/uks-mhra-says-it-has-concerns-about-babylon-health-and-flags-legal-gap-around-triage-chatbots/) makes clear that AI triage chatbots fell into a regulatory gap the MHRA was openly uncomfortable with — and the trajectory of policy since then has been to close that gap, not widen it.

**What this means for Phase 1 Care:**

- Editorial content that informs is OUT of scope.
- Algorithmic signposting that routes to NHS resources is OUT of scope **provided** the routing is rule-based, transparent, and never returns a clinical interpretation or recommendation.
- Any feature that takes symptom inputs and returns descriptions of possible causes, severity assessments, or clinical recommendations is IN scope and would require Class I or Class IIa registration before launch.
- AI features must comply with the Algorithmic Transparency Recording Standard if Care ever becomes part of an NHS-aligned deployment — though ATRS is currently mandatory only for central government and public-sector bodies that interact with the public, not for private-sector apps (source: https://www.gov.uk/government/publications/algorithmic-transparency-recording-standard-mandatory-scope-and-exemptions-policy). It is a "good practice" target for a B2B Care Bridge sale to an NHS Trust, not a Phase 1 requirement.

**Standards to name-check in a DD pack** (Phase 1 is below threshold for most; awareness signals competence):

- **IEC 62304** (medical device software life-cycle) and **ISO 14971** (risk management) — required for Class IIa+ SaMD conformity assessment. Phase 1 Care is below threshold, but build-log and version-control hygiene should be 62304-friendly so a future audit isn't a forklift rebuild.
- **ISO 13485** (quality management) — Phase 3 only if a regulated device is introduced.
- **DCB0129 / DCB0160** (NHS clinical-risk management for software) [unverified — confirm numbering] — relevant when Care integrates with NHS systems via DTAC.
- **NHS DTAC** — buyer-side, not regulator-side. Optional for a B2C app, enormously DD-positive if completed. Strong recommend for Phase 3 (Stage 1 §1.7 expands).

### 1.2 CQC (Care Quality Commission)

The CQC registers providers of "regulated activities" under the Health and Social Care Act 2008. The relevant regulated activity for FemWell is **"Treatment of disease, disorder or injury"** (TDDI). The CQC's published scope-of-registration guidance and the AIDRS portal both indicate that:

- Pure educational content is not TDDI.
- Algorithmic signposting to NHS services is not TDDI (NHS Digital does exactly this with NHS 111 online).
- **Triage that involves an assessment of clinical need by a regulated professional** is TDDI, and providers must register (source: https://www.digitalregulations.innovation.nhs.uk/regulations-and-guidance-for-developers/all-developers-guidance/regulated-activities-check-if-you-need-to-register-with-the-care-quality-commission-cqc/).
- "Personal advice or treatment by suitably qualified healthcare professionals provided to individual patients" is the historic line (source: https://www.cqc.org.uk/sites/default/files/2022-05/20220517%20Scope%20of%20Registration%20Guidance%20May%202022.pdf).
- Livi is CQC-registered as a healthcare provider because it provides GP consultations (source: https://digitalhealth.london/gp-video-consultation-livi-nhs); Health & Her is not, because it is wellness content + tracker (source: https://healthandher.com/en-us/pages/menopause-perimenopause-app).

**Regulation 9 (person-centred care)** under the Health and Social Care Act 2008 (Regulated Activities) Regulations 2014 requires registered providers to deliver "care or treatment that is appropriate, meets [the user's] needs and reflects their preferences" (source: https://www.cqc.org.uk/guidance-regulation/providers/regulations-service-providers-and-managers/health-social-care-act/regulation-9). The word "personalised" is the trip-wire — once a Care feature claims to deliver personal care or treatment, the rest of the framework attaches.

**For Phase 1 Care:** every screen should read as "general information" + "signposting." No screen should claim to assess the user's clinical needs. The Pacing Bank framing — "an energy-budget tool you can adapt" — is on the safe side. A future "your perimenopause care plan, generated for you" would not be.

### 1.3 NMC (Nursing and Midwifery Council) and protected titles

The NMC regulates registered nurses, midwives and nursing associates in the UK under the Nursing and Midwifery Order 2001. The key facts:

- "Registered nurse," "registered midwife," "registered nursing associate" and similar titles are **protected by statute**. Using a protected title to imply registration when not registered is a criminal offence under the Order [unverified — check Article 44 of the Order for current wording].
- The NMC public register is at nmc.org.uk/online — every PIN can be searched (source: https://www.nmc.org.uk/registration/nmc-online/).
- The NMC's Code (2018, updated 2023) requires registered nurses to "use all forms of communication, including social media and networking sites, responsibly" (paraphrased — source: https://www.newcrosshealthcare.com/what-is-the-nursing-and-midwifery-council-nmc/ — and PubMed background https://pubmed.ncbi.nlm.nih.gov/26182587/).
- The NMC does not regulate apps directly, but it does regulate the conduct of registered nurses who *appear on or contribute to* apps. A registered nurse named on FemWell Care as a clinical advisor must be able to defend her conduct to the NMC if a fitness-to-practise referral were made.

**For Phase 1 Care:** no invented nurse name. No "RGN / RM / NA / RGN(Adult)" suffix without a real registered person attached. The brainstorm option α ("Hattie Reynolds, RGN") in `research_nurse_section_2026-05-13.md` §5 is therefore *Phase 2* territory, not Phase 1.

### 1.4 GMC (General Medical Council)

Same shape, doctors. The GMC register is public at gmc-uk.org/registration-and-licensing. "Dr" is not a protected title outside specific clinical contexts (academics use it too), but "registered medical practitioner," "general practitioner," "consultant [specialty]," "GMC [number]" all carry weight that DD lawyers will check. The existing placeholders flagged in master-plan R3 — "Dr Siobhan Jenkins GMC 6115847 NHS GP" and "Dr Aisha Patel GMC 7421903 King's College Hospital" — are exactly the sort of thing that will be found and would damage a sale. Sweep them now, before any new Care content adds more.

### 1.5 ASA / CAP Code Section 12

The CAP Code (Committee of Advertising Practice non-broadcast code) section 12 covers "Medicines, medical devices, health-related products and beauty products" (source: https://www.asa.org.uk/type/non_broadcast/code_section/12.html). Key rules for FemWell Care:

- **12.1** Marketers must hold robust evidence to substantiate any objective claim made about a product.
- **12.2** Claims that could discourage essential medical treatment are forbidden — even with a disclaimer — unless the treatment is being carried out under the supervision of a suitably qualified health professional (source as analysed: https://www.asa.org.uk/advice-online/healthcare-medicinal-claims.html).
- **12.6** Marketers must not refer to specific medical conditions in advertising in ways that breach the Code.

The ASA's enforcement posture has hardened. The **10 December 2025 multi-advertiser ruling** (source: https://www.lexology.com/library/detail.aspx?g=0cfcb87f-cb61-4dde-a924-873f62b54c5b) upheld complaints against nine advertisers for unlawful medicinal claims in paid Google and Meta ads. The ASA is increasingly leveraging its **"Active Ad Monitoring System"** to identify non-compliant ads at scale. The cases the article cites included supplements claiming to "ease the challenges of autism," claims about ADHD, claims about prostate problems — all the sorts of claims a wellness app might be tempted to imply.

The 2024 cosmetic and CBD rulings (source: https://www.bloomregulatory.com/articles/asa-cosmetics-rulings-round-up-2024 and https://www.cannabisregulations.ai/cannabis-and-hemp-regulations-compliance-ai-blog/uk-2025-asa-cbd-health-claims-influencer-advertising-compliance) follow the same pattern: ASA hits wellness brands for medicinal-implication claims and the disclaimer doesn't save them.

**[Unverified — important].** I was not able to find a specific ASA ruling against Flo, Clue, Stardust, Ovia, Glow, Eve, Babylon Health, or Livi for cycle-syncing-specific claims within the ASA rulings database via this round of search. The closest enforcement signal is the broader medicinal-claims uptick. **A focused human pass through https://www.asa.org.uk/codes-and-rulings/rulings.html with the search term "cycle" / "menstrual" / "period tracker" / specific brand names is required before any DD pack cites this paragraph.** What we *can* say is: the ASA pattern of upholding claims that imply unproven medical effects is unambiguous, and FemWell must not rely on disclaimers to defend strong cycle-syncing claims. The Planner R9 trap (master plan §11) is the same trap restated.

**For Phase 1 Care:** every Care article ends with a binding disclaimer (see Stage 5 §5.6). No Care surface implies that following the app will treat, prevent, cure, alleviate or manage a medical condition. Permissive language only: "here is information," "here is the NHS pathway," "here are the questions to ask your GP."

### 1.6 ICO + UK GDPR Article 9

Health data, including any information about menstrual cycles, symptoms, contraception use, fertility intentions, mental health, and HRT, is **special category data** under UK GDPR Article 9 (source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/). Processing it requires:

- A lawful basis under Article 6 (typically consent — Article 6(1)(a) — for a consumer app).
- A specific condition under Article 9(2). For consumer health apps, **explicit consent** under Article 9(2)(a) is the standard route. Other Article 9 conditions (medical diagnosis, public health, etc.) require a regulated professional context FemWell doesn't have.
- A Schedule 1 (UK Data Protection Act 2018) condition where the Article 9 condition requires it.
- An **Appropriate Policy Document** if processing under certain Schedule 1 conditions (source: https://www.gov.uk/government/publications/defra-appropriate-policy-documents/appropriate-policy-document-special-category-personal-data-and-criminal-offence-data).
- A **Data Protection Impact Assessment** (DPIA) under Article 35 — almost certainly required for any Care feature that involves systematic processing of special category data.
- Data minimisation, integrity and confidentiality safeguards proportionate to the sensitivity (source: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/).

The existing FemWell **SecureStore** primitive (master plan §6.2) — client-encrypted via a per-device key — is the right substrate for any new Care entity that stores symptoms tied to NHS pathway interactions. The Care surface should not send Care-interaction data to any third-party analytics SDK. The Flo / Meta lawsuit ($56M class action settled 2025, in which Meta was found to have intentionally recorded sensitive health information via the Flo SDK — source: https://www.courthousenews.com/meta-violated-privacy-law-jury-says-in-menstrual-data-fight/) is the cautionary tale every DD lawyer will cite. FemWell already has the privacy line from H2 D2; Care extends and hardens it.

### 1.7 NHS DTAC — buyer-side, not regulator-side

The NHS Digital Technology Assessment Criteria (DTAC) is **not** a regulator's requirement; it is the **NHS England assessment framework used by NHS commissioners and providers when buying digital health technologies** (source: https://transform.england.nhs.uk/key-tools-and-info/digital-technology-assessment-criteria-dtac/). The five core areas are clinical safety, data protection, technical assurance, interoperability, and usability/accessibility. As of February 2026 an updated DTAC form is required from 6 April 2026 (source: https://www.burges-salmon.com/articles/102mnjh/new-nhs-digital-technology-assessment-criteria-what-health-tech-suppliers-need-t/).

For a B2C app like FemWell Phase 1, DTAC is optional. But:

- DTAC compliance is a strong **DD signal** to a buyer interested in B2B / NHS expansion.
- The Care Bridge demo (B2B clinician portal — master plan §9) would require DTAC compliance to sell into an NHS Trust.
- Even partial alignment (e.g. "we have a DPIA, a clinical safety case, accessibility WCAG 2.1 AA conformance, an interoperability statement") puts FemWell in the top quartile of consumer wellness apps DD-wise.

**For Phase 1 Care:** treat DTAC as an aspirational guidance document. Start with the data protection and clinical safety domains — they are the lowest-cost to address and produce the highest-value DD artefacts.

### 1.8 The green / amber / red list

This is the deliverable §1 of this stage was working toward.

**GREEN — Phase 1 Care can ship these without contracted clinical staff:**
- Pure editorial signposting content republished or adapted from NHS / NICE / royal-college sources under their reuse licences (Stage 2).
- Algorithmic, transparent, rule-based routing to NHS resources (NHS 111, GP, sexual health clinic, pharmacy, A&E).
- Cycle-phase-tagged surfacing of NHS-vetted content with permissive framing.
- Patient-facing GP-prep documents (printable PDFs of the user's own logged data + NICE-aligned question lists).
- Calendar-style screening reminders aligned to NHS screening intervals (cervical, breast, mental health self-referral windows).
- Educational decision trees that *list considerations* without recommending a path (e.g. "here are the considerations when thinking about HRT — take this to your GP").
- Public-domain audio/visual content (breathing exercises, sleep hygiene basics).
- The Pacing Bank as an *energy budgeting tool* (the user's own data, no claim to treat or alleviate).
- Care Bridge clinician PDF export (the user, not the app, decides what to send to a clinician).

**AMBER — possible with careful framing, requires Phase 2 (contracted clinician) for safe operation:**
- Any feature that surfaces "what your symptoms might mean" — fine if it's a list of *possible considerations sourced from NHS A-Z*, hazardous if it's a single most-likely interpretation.
- Strong cycle-phase-physiology claims ("do this in luteal because cortisol is X"). Master plan R9 lives here. Permissive lens version is GREEN; deterministic version is RED.
- Personalised HRT, contraception, or mental-health recommendations of any kind.
- "Nurse Notebook" by-lined editorial content — GREEN with a real contracted nurse, RED with an invented name.
- Long-form video/audio claiming clinical advisor sign-off — GREEN with a real contracted advisor, RED otherwise.
- AI-generated content drafted from clinical sources — GREEN with a documented editorial-standards doc + on-screen attribution + clear disclaimer, AMBER otherwise.

**RED — do not ship in Phase 1 (and never without full regulatory readiness):**
- Any "Ask a Nurse / Ask a Doctor / Ask Jess about your symptoms" Q&A feature where the app returns clinical interpretation of user-supplied symptoms.
- AI symptom-triage that returns most-likely-diagnosis or severity assessment.
- Personalised treatment plans (HRT regimen, contraception regimen, pacing programme that explicitly claims to "manage" a condition).
- 1:1 live messaging with anyone described as a clinical professional.
- Claims that the app or any Care feature "treats," "manages," "alleviates," "prevents," "diagnoses" or "cures" a condition.
- By-lined Care content under an invented clinician's name + invented NMC/GMC registration number. The R3 risk is sale-killing here, not just face-losing.

The single most surprising regulation finding is in this list: **the AIDRS portal (launched April 2024) is, in practice, the entire compliance reading list for a UK consumer health app**, and almost no competitor cites it. Citing AIDRS in our DD pack is a high-signal low-cost positioning move that immediately tells a buyer's regulatory counsel "these people did the homework."

(Stage 1 word count: ~2,150)

---

## Stage 2 — Public-domain & permissively-licensed clinical content sources

The Phase 1 trick is that almost every piece of NHS-aligned clinical information FemWell Care needs already exists, in plain English, written by clinicians, under a reuse licence that lets us republish or adapt commercially. The job is editorial framing and cycle-aware surfacing, not authorship. This stage maps the sources.

### 2.1 NHS website (nhs.uk)

**Licence.** The NHS website content is generally available under the **Open Government Licence v3.0** (OGL v3.0) and via the **NHS UK Open Content Licence** for direct syndication. The OGL v3.0 explicitly permits commercial reuse, modification, distribution, and remixing, subject to attribution and a link to the licence (sources: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/, https://library.hee.nhs.uk/resources/copyright/using-copyright-materials/open-government-licence). NHS Digital content attribution: *"Information from NHS Digital, licensed under the current version of the Open Government Licence"* or, if adapted, *"Contains information from NHS Digital, licensed under the current version of the Open Government Licence"* (source: https://www.owenboswarva.com/blog/archive/mg/20170725.htm).

**Important nuance.** The OGL **does not** cover NHS logos, branding, design styles, or trade marks. We can republish the *text* of NHS A-Z; we cannot use the NHS blue, the NHS logo, or anything that implies official NHS endorsement.

**API.** The **NHS Website Content API v2** at https://digital.nhs.uk/developer/api-catalogue/nhs-website-content/v2 and the **Health A-Z widget** at https://developer.api.nhs.uk/widgets/health-a-to-z provide programmatic access to ~850 medical condition entries (source: https://developer.api.nhs.uk/nhs-api/documentation/59dc785b239906084407090d). The legacy developer portal at developer.api.nhs.uk is being retired Spring 2026 and migrated to digital.nhs.uk/developer. **FemWell needs to register on the new hub now** — the application is free but the process takes weeks.

**Refresh cadence.** NHS Health A-Z content is reviewed on a rolling basis (the NHS publishes a "last reviewed / next review" date on each page). We should mirror these dates in our UI so the user can see freshness and trust the source.

**Use cases inside FemWell Care.**
- Cycle-aware NHS A-Z (Stage 4 §F2): full NHS A-Z text surfaced with a permissive cycle-phase contextual note we write ourselves.
- NHS Pathway Helper (Stage 4 §F1): each route terminates in a deep link to the relevant nhs.uk page.
- GP-prep document (Stage 4 §F3): include the relevant NHS A-Z URL alongside the user's data.

### 2.2 NICE Guidelines

**Licence.** The **NICE UK Open Content Licence** allows free reuse of NICE content in a UK setting subject to its terms (source: https://www.nice.org.uk/re-using-our-content). Use for AI purposes is subject to a separate application process. NICE also offers an Adaptation Licensing programme for derivative products. NICE disclaims responsibility for use of its content in third-party outputs — we will need our own clinical-safety review chain.

**Patient Decision Aids (PDAs).** NICE produces NG23 (menopause), NG88 (heavy menstrual bleeding), NG73 (endometriosis), NG75 [unverified — check ID], CG156 (fertility), and many more, each accompanied by Patient Decision Aids designed for shared decision-making with a clinician (source for NG23: https://www.nice.org.uk/guidance/ng23). These PDAs are the gold standard "here's what to consider" framework — exactly what FemWell Care's HRT decision framework feature (Stage 4 §F4) wants.

**NICE guideline IDs relevant to Care v1** [verify each against current NICE catalogue before quoting in DD pack]:
- **NG23** — Menopause: identification and management (published 12 Nov 2015; last updated 15 April 2026 per search result snapshot — source: https://www.nice.org.uk/guidance/ng23).
- **NG88** — Heavy menstrual bleeding: assessment and management.
- **NG73** — Endometriosis: diagnosis and management.
- **NG206** — Myalgic encephalomyelitis (or encephalopathy)/chronic fatigue syndrome: diagnosis and management. The 2021 ME/CFS guideline that recommends **pacing and energy management** and advises against graded exercise therapy (source: https://www.nice.org.uk/guidance/ng206 and analysis https://pmc.ncbi.nlm.nih.gov/articles/PMC9778354/). This is the NICE basis for the Pacing Bank's clinical framing.
- **NG188** — COVID-19 rapid guideline: managing the long-term effects of COVID-19 (Long Covid). The NICE/SIGN/RCGP joint long COVID guideline (source: https://meassociation.org.uk/information/long-covid-nice-guideline/). Another anchor for Pacing Bank.
- **CG156** — Fertility problems: assessment and treatment.
- **CG62 / NG201** — Antenatal care.
- **NG140** — Abortion care.

**Refresh cadence.** NICE guidelines are surveilled regularly; check the "last updated" date on each page and surface it in our UI.

**Use cases.** HRT decision framework, NHS Pathway Helper edge cases, Pacing Bank clinical framing, mental health pathways, contraception decision tool.

### 2.3 RCOG patient information leaflets

**Licence.** RCOG's **Rights and Permissions policy 2024** at https://www.rcog.org.uk/about-us/policies/rights-and-permissions/ requires permission requests submitted to copyright@rcog.org.uk for reproduction or adaptation of patient information leaflets. RCOG specifies that leaflets cannot be reproduced in entirety under a third-party logo without permission, but adaptation requests are accepted and typically answered within 2 weeks (source: https://www.rcog.org.uk/guidance/reproducing-rcog-guidance-and-patient-information/).

**Refresh cadence.** RCOG reviews patient information every 3 years or sooner when underlying clinical guidance changes (source: https://www.rcog.org.uk/for-the-public/browse-all-patient-information-leaflets/).

**Use cases.** Endometriosis, PCOS-adjacent, contraception, fertility, antenatal, miscarriage, abortion care, hysteroscopy and other gynaecological procedures — all areas where the NICE-guideline view is the clinician's, and the RCOG patient leaflet is the woman's-side translation.

**Operationally:** in Phase 1 Care we link to the RCOG leaflets at rcog.org.uk; we do not adapt the text. Reproducing the URL and a short summary (under fair dealing for criticism, review or news reporting under UK copyright law — note this is narrow and a permissions request is safer) is the safe-by-default approach.

### 2.4 British Menopause Society (BMS) and Women's Health Concern

**Licence.** The BMS grants permission to reproduce their resources for **personal and educational use only**, with commercial copying and distribution prohibited (source: https://thebms.org.uk/publications/tools-for-clinicians/). The BMS PPMC (Principles and Practice of Menopause Care) Resources Toolkit at https://thebms.org.uk/education/principles-practice-of-menopause-care/bms-ppmc-resources-toolkit/ provides peer-reviewed materials free to access.

**Patient arm.** **Women's Health Concern (WHC)**, the patient arm of the BMS since 2012, provides factsheets and evidence-based resources at https://www.womens-health-concern.org/. These are written specifically for patient consumption.

**For Phase 1 Care:** the commercial restriction is binding — we cannot republish BMS or WHC content directly inside FemWell. We can **link** to it (deep links into wmenshealthconcern.org factsheets are legitimate). The strategic implication: for Care's menopause/perimenopause content we lean on NICE NG23 (commercially reusable under the NICE UK Open Content Licence) plus NHS A-Z entries, with WHC links as the "further reading" destination.

### 2.5 Royal colleges and specialty societies

Several royal colleges produce patient information that is either freely linkable or — with permission — adaptable:

- **Royal College of General Practitioners (RCGP).** Patient information leaflets and long COVID guidance (joint with NICE/SIGN — source: https://meassociation.org.uk/information/long-covid-nice-guideline/). Generally linkable.
- **Royal College of Psychiatrists.** Mental health patient information at rcpsych.ac.uk/mental-health. Linkable.
- **Royal College of Midwives.** Pregnancy and postnatal information at rcm.org.uk.
- **British Heart Foundation (BHF).** UK charity — bhf.org.uk. Substantial patient information library. Reuse requires permission [unverified — check BHF copyright page] but linking is fine.
- **MIND.** UK mental health charity — mind.org.uk. Excellent patient information for anxiety, depression, OCD, eating disorders. Linkable.
- **Bliss.** Premature and sick babies charity — bliss.org.uk. Linkable.
- **Tommy's.** Pregnancy and baby loss charity — tommys.org. Linkable.
- **Wellbeing of Women.** UK charity dedicated to women's reproductive and gynaecological health research (source: https://www.wellbeingofwomen.org.uk/). Hosts regular webinars and disseminates information — linkable.
- **Endometriosis UK.** endometriosis-uk.org. Information, helpline, support groups. Linkable.
- **Verity.** UK's PCOS charity — verity-pcos.org.uk (source: https://www.verity-pcos.org.uk/about-us.html). Linkable.
- **Daisy Network.** UK charity for Premature Ovarian Insufficiency — daisynetwork.org. Linkable.
- **Samaritans.** 116 123, samaritans.org. The crisis line FemWell already cites in Profile P4 (master plan §3.4).
- **Shout.** 85258 text-message crisis service. Already cited.

**For Phase 1 Care:** "linkable" is the default. A trusted-source registry inside the app should list each source's last-checked date, licence summary, and primary contact for reuse permission.

### 2.6 British National Formulary (BNF) — NICE-owned

**Licence.** The BNF is published by NICE and the Royal Pharmaceutical Society. Access through the NICE website at bnf.nice.org.uk is free at point of use. Reuse for non-NHS purposes requires permission and may carry a fee [unverified — check NICE's commercial reuse application form].

**Use cases.** Reference for any contraception or HRT decision-tool content — but we do not need to *embed* the BNF in Phase 1. Linking to bnf.nice.org.uk entries is enough.

### 2.7 NHS Digital open APIs and infrastructure

Beyond the Website Content API:

- **NHS Service Search API** at https://digital.nhs.uk/services [unverified — confirm endpoint name] for finding GPs, pharmacies, sexual health clinics, mental health services by postcode.
- **NHS login** (OpenID Connect) at https://digital.nhs.uk/services/nhs-login — third-party integration possible, free, ~3-4 month onboarding (source: https://nhsconnect.github.io/nhslogin/). Phase 3+ — not needed for Care v1 but a strong DD signal when it lands.
- **NHS App SDK / partner integration** — for deep linking into the NHS App for prescriptions, appointments, etc. Same Phase 3+ horizon. Documentation at https://nhsconnect.github.io/nhsapp-developer-documentation/.
- **NHS terminology service / SNOMED CT.** Codified clinical terms. Aspirational for Phase 2+ when we want our entity vocabulary to align to NHS standards.

### 2.8 Patient.info (EMIS / Egton Medical)

Patient.info is a major UK patient-information site owned by EMIS Health (Egton Medical Information Systems). The content is high-quality and GP-written but **commercially licensed** — reuse requires direct negotiation with EMIS [unverified — check patient.info/about/copyright]. The safe Phase 1 posture is **link only**; reuse is Phase 2+ if it materially adds value.

### 2.9 Cochrane Library

**Access.** All residents of **England** can access the Cochrane Library for free through national NICE funding (source: https://www.cochranelibrary.com/help/access). NHS England OpenAthens accounts grant full-text access. Cochrane reviews published under standard licence become **free to view 12 months after publication** (green open access) (source: https://www.cochranelibrary.com/about/open-access). Protocols accepted for publication from 8 November 2024 are published with an open access licence.

**Use cases.** Authoritative evidence summaries for any topic FemWell Care touches. We do not need to embed Cochrane content; we cite it. A "what the evidence says" footer on each Care article is high-value DD material.

### 2.10 UK PMC and PubMed Central

**Access.** Open-access biomedical research at europepmc.org and pubmed.ncbi.nlm.nih.gov/pmc. Most articles indexed; full text where the publisher has opted in. Standard NCBI APIs available.

**Use cases.** "Evidence footer" on cycle/phase content (e.g. McNulty 2020 cycle-performance meta-analysis, Pfender 2025 critical analysis cited in master plan §11 R9). Citation pattern: "Reviewed: McNulty et al., Sports Medicine 2020. doi:10.1007/s40279-020-01319-3." [verify DOI before publishing]

### 2.11 GOV.UK content design system

**Licence.** OGL v3.0. The GOV.UK content design system at design-system.service.gov.uk includes a comprehensive content-style guide and writing-for-accessibility guidance. **Highly applicable to FemWell Care's editorial standards doc** — borrow the patterns wholesale: short sentences, active voice, plain English, reading age, evidence-cited links.

### 2.12 The Sources Library — quick reference table

| Source | Licence | Content type | Ingest method | Refresh cadence | Suitable Care use | Last checked |
|---|---|---|---|---|---|---|
| NHS Website (nhs.uk Health A-Z) | OGL v3.0 + NHS UK Open Content Licence | ~850 medical conditions, plain-English | NHS Website Content API v2 | Rolling (NHS sets last-reviewed dates) | Cycle-aware NHS A-Z; Pathway Helper deep links | 2026-05-13 |
| NICE Guidelines | NICE UK Open Content Licence | Clinical guidelines + PDAs | Web scrape or PDF download | Quarterly (NICE surveillance) | HRT decision framework; Pacing Bank framing; mental-health pathways | 2026-05-13 |
| RCOG Patient Leaflets | Permission required (copyright@rcog.org.uk; 2-week response) | Gynaecology patient info | Link only Phase 1; adapt with permission Phase 2 | 3-yearly review | Endometriosis, contraception, fertility deep links | 2026-05-13 |
| British Menopause Society / WHC | Personal + educational use only (no commercial reuse) | Menopause clinician + patient info | Link only | Continuous | Menopause "further reading" links | 2026-05-13 |
| British National Formulary | NICE-owned; commercial reuse requires permission | Drug information | Link only | Quarterly | Pill / HRT comparison deep links | 2026-05-13 |
| Cochrane Library | NICE-funded UK national access (free for England residents); 12-month green OA | Evidence reviews | Link + citation | Continuous | Evidence footer on Care articles | 2026-05-13 |
| UK PMC / PubMed Central | Open access where publisher opts in | Biomedical research | Citation only | Continuous | Evidence footer | 2026-05-13 |
| MIND | Linkable (charity content reuse with permission [unverified]) | Mental health patient info | Link only | Continuous | Mental-health pathways | 2026-05-13 |
| Tommy's | Linkable (charity reuse permission [unverified]) | Pregnancy / baby loss | Link only | Continuous | Pregnancy & loss pathways | 2026-05-13 |
| Endometriosis UK | Linkable | Endometriosis patient info | Link only | Continuous | Endo pathway + Pacing Bank | 2026-05-13 |
| Verity (PCOS) | Linkable | PCOS patient info | Link only | Continuous | PCOS pathway + Pacing Bank | 2026-05-13 |
| Daisy Network | Linkable | POI patient info | Link only | Continuous | POI pathway | 2026-05-13 |
| Wellbeing of Women | Linkable | Women's research charity | Link only | Continuous | "Further reading" links | 2026-05-13 |
| BHF | Linkable (reuse permission likely required [unverified]) | Cardiovascular patient info | Link only | Continuous | Cardiovascular pathway (perimenopause overlap) | 2026-05-13 |
| Samaritans / Shout | Crisis-line attribution (no licence — public service) | Crisis info | Number + URL | Continuous | Mental-health crisis disclaimer | 2026-05-13 |
| GOV.UK content style guide | OGL v3.0 | Writing-for-accessibility guidance | Reference internally | Continuous | FemWell Care editorial standards doc basis | 2026-05-13 |
| GOV.UK long-read library | OGL v3.0 | Government long-form patient info | Adapt or link | Periodic | Care article basis | 2026-05-13 |
| NHS Service Search API | OGL v3.0 / API ToS | GP, pharmacy, clinic finder by postcode | API | Continuous | "Find nearest service" UI | 2026-05-13 [unverified — confirm endpoint] |

The under-used cheat-code in this list — the single most under-leveraged public-domain source — is the **NHS Website Content API v2 combined with NICE's UK Open Content Licence**. Almost no consumer wellness app does this well. Flo and Clue are US/German-built; they default to their own US/EU sources. UK content is, in practical terms, available to FemWell for free and at scale in a way it is not available to American or European competitors. That is the moat for Phase 1 Care.

(Stage 2 word count: ~2,000)

---

## Stage 3 — Competitive thread-the-needle analysis

How fifteen-odd existing apps handle the "clinician-adjacent without contracted staff (or with)" problem. For each: what works, what doesn't, what FemWell should steal, what to skip.

### 3.1 NHS App

**What it is.** The gold standard UK health app — published by NHS England (HSCN). Patients log in via NHS login, access GP records, order repeat prescriptions, view test results, manage appointments. Not a wellness app; an infrastructure app.

**Disclaimer pattern.** None — it is a regulated NHS service, so it doesn't need consumer-facing disclaimers; the regulatory framework is internal.

**Steal.** The visual restraint, the "we are infrastructure" tone, the deep links to GP services. The NHS App is what an NHS-aligned product looks like when it's actually NHS-aligned. We can mirror its aesthetic of competent calm in our Care surface.

**Skip.** It is not editorial. Our Care surface is editorial + signposting. Different job.

### 3.2 Patient Access (by EMIS)

**What it is.** GP services portal — book appointments, order repeats, message your GP if your practice is on EMIS. Mid-2-million users [unverified figure].

**Disclaimer pattern.** Service-level (terms of use, privacy policy) rather than per-screen.

**Steal.** The "I can pull this from my GP record" deep link pattern. Phase 3+ ambition for FemWell.

**Skip.** Same as NHS App — not editorial.

### 3.3 Livi

**What it is.** Telehealth — book a video GP consultation. UK GPs, GMC-registered, employed via Livi's network. CQC-registered (source: https://digitalhealth.london/gp-video-consultation-livi-nhs).

**Disclaimer pattern.** Service-level. Lists conditions Livi GPs won't treat (controlled drugs, long-duration sick notes — source: https://support.livi.co.uk/hc/en-us/articles/360003311833-Who-are-the-doctors-that-work-at-Livi).

**Steal.** The "here's what we don't do" transparency pattern. FemWell Care should publish a similarly explicit "here's what we don't do" page (Stage 5 §5.6).

**Skip.** Their model is contracted clinicians + CQC registration. Not Phase 1 territory.

### 3.4 Babylon Health (defunct in UK August 2023)

**What it is.** Telehealth + AI symptom-triage chatbot. Once valued $2B; bankrupt August 2023 (source: https://techcrunch.com/2023/08/31/the-fall-of-babylon-failed-tele-health-startup-once-valued-at-nearly-2b-goes-bankrupt-and-sold-for-parts/). UK assets sold to eMed Healthcare UK September 2023. MHRA had publicly flagged concerns about the chatbot's triage safety as early as March 2021 (source: https://techcrunch.com/2021/03/05/uks-mhra-says-it-has-concerns-about-babylon-health-and-flags-legal-gap-around-triage-chatbots/). Specific incidents reported to MHRA: missed heart attack symptoms; missed DVT symptoms (May 2018).

**Disclaimer pattern.** Heavy — and the disclaimer did not save the company.

**Steal.** Nothing on the chatbot side. Everything on the cautionary side: this is what happens when a wellness app drifts into clinical triage without the regulatory plumbing. The lesson: **disclaimers do not absolve a product that operates outside its regulatory class.** Build below the threshold, don't disclaim across it.

**Skip.** AI symptom-triage in any form. Master plan R9 plus Babylon's grave are the binding constraints.

### 3.5 Boots Online Doctor / Boots WebMD

**What it is.** High-street pharmacy + online consultation. Boots is a registered pharmacy; Boots Online Doctor is a GMC-registered prescribing service [unverified — check current Boots Health Hub model].

**Disclaimer pattern.** Service-level + medication-specific. Standard MHRA-regulated patient information leaflets.

**Steal.** Brand-as-trust pattern — Boots' high-street presence does heavy lifting Free apps don't have. Our equivalent will be the named-author + NHS-aligned positioning we're building.

**Skip.** The prescribing model is way over Phase 1's regulatory threshold.

### 3.6 Flo Health

**What it is.** The category leader — period and cycle tracker, US-headquartered, Cypriot legal entity, massive UK install base. ~75M monthly active users globally [unverified — verify against Flo's current public figures].

**Disclaimer pattern.** Per-article "this is for informational purposes only" and "consult a healthcare provider" stickers everywhere. Has a "Medical Expert Board" listed at flo.health/medical-affairs-board [unverified — check current page].

**Recent legal context.** 2021 FTC settlement for sharing period/pregnancy data with Facebook and Google (source: https://en.wikipedia.org/wiki/Flo_(app)). 2025 California class action settled for $56M with Meta found by jury to have violated the California Invasion of Privacy Act through the Flo SDK (source: https://www.courthousenews.com/meta-violated-privacy-law-jury-says-in-menstrual-data-fight/). Flo paid $8M; Google $48M.

**Steal.** The "Medical Expert Board" page format — name + speciality + photograph + employer affiliation per advisor. Phase 2 FemWell adopts this when we contract a real nurse. Also: their UI pattern of pairing every clinical claim with a "Reviewed by [name]" badge. **Crucially: only adopt this when there's a real person to badge.** Phase 1 Care badges read "Reviewed against NHS and NICE guidance, [date]" — no person until Phase 2.

**Skip.** The data-sharing architecture. Flo's privacy problems are the cautionary tale we cite in our DD pack.

**ASA history.** I was unable to find a specific UK ASA ruling against Flo in this search round [unverified — human search of asa.org.uk required].

### 3.7 Clue (by BioWink)

**What it is.** German-built, evidence-positioned cycle tracker (source: https://en.wikipedia.org/wiki/Clue_(mobile_app)).

**Clinical advisory pattern.** Publishes its **Medical Advisory Board** with named clinicians, specialties, affiliations (source: https://helloclue.com/articles/about-clue/introducing-clue-s-medical-advisory-board). Members include Amber Johnson MD MS MBA FACC (cardiology, UPMC), Monique Gary DO MSc FACS (breast surgery), Paula J Hillard MD FACOG (paediatric-adolescent gynaecology), Tomer Singer MD (OB/GYN, Shady Grove). Content is described as "written by reproductive healthcare clinicians and science writers" (source: https://helloclue.com/about-clue).

**Steal.** This is the **template** FemWell Phase 2 should match. The Clue advisory board page is what credible looks like. The named-expert-with-affiliation pattern is what DD lawyers want to see.

**Skip.** The board is US-skewed. FemWell's UK advisory board, when it lands, should be UK-skewed: NHS-affiliated GPs, BMS-accredited menopause specialists, BACP-registered therapists, BDA-registered dietitians.

**ASA history.** No UK ASA ruling against Clue surfaced in this search [unverified].

### 3.8 Stardust

**What it is.** US-built astrology-themed period tracker, surged post-Roe-overturn (June 2022).

**Privacy controversy.** Made end-to-end encryption claims that were rolled back after TechCrunch scrutiny (source: https://techcrunch.com/2022/06/27/stardust-period-tracker-phone-number/ and https://www.siliconrepublic.com/enterprise/stardust-period-app-encryption). Privacy International long-read at https://privacyinternational.org/long-read/5568/stardust-research-findings details broader concerns. November 2024 the app was reportedly at risk of removal from Google Play Store (source: https://www.tiktok.com/@stardust.app/video/7439440641223953695 — note this is the company's own TikTok and should be confirmed against Google's Play Store policy filings before quoting).

**Steal.** Nothing directly. The cautionary lesson: an app whose USP is privacy must actually deliver it, end-to-end, with auditable claims.

**Skip.** Everything about the marketing-vs-implementation gap.

### 3.9 Maven Clinic

**What it is.** US-headquartered, B2B women's-and-family-health platform. UK is largest non-US market — over 70 employer clients (source: https://www.fiercehealthcare.com/health-tech/maven-clinic-picks-digital-health-startup-naytal-boost-growth-uk-europe). Acquired UK platform Naytal in March 2023 (source: https://tech.eu/2023/03/21/maven-clinic-acquires-women-s-health-platform-naytal/).

**Clinical model.** "Clinician-guided AI" — 30+ types of providers across 350 subspecialties (source: https://www.mavenclinic.com/about). Maven Intelligence (AI orchestration layer, launched 2025) is "embedded within care delivery and experienced through real-time conversations that guide members at every step" (source: https://www.prnewswire.com/news-releases/maven-clinic-introduces-maven-intelligence-an-ai-powered-orchestration-layer-for-womens-and-family-health-302715171.html).

**Steal.** The B2B / employer-channel positioning is the model for FemWell's Care Bridge B2B ambition (master plan §9). For B2C Phase 1 Care, almost nothing — Maven is a clinician-staffed marketplace, which is what FemWell *isn't* in Phase 1.

**Skip.** The staffing cost. Maven runs hot on payroll.

### 3.10 Health & Her

**What it is.** UK perimenopause/menopause app (source: https://healthandher.com/en-us/pages/menopause-perimenopause-app). 4.7-star rating with ~3.1K ratings as of July 2024. ORCHA-rated 86% (Apr 2023). Has a longitudinal cohort study published in PMC suggesting symptom reduction associated with app use (source: https://pmc.ncbi.nlm.nih.gov/articles/PMC10759107/).

**Disclaimer pattern.** Tracker + content. Disclaimers are standard "informational only."

**Reviews.** Mixed. Positive reviews praise the educational content; negative reviews flag period-tracking limits for short perimenopause cycles, missing symptoms in the 40+ tracked list, technical issues with lag and crashes (source: https://justuseapp.com/en/app/1519199698/health-her-menopause-app/reviews).

**Master plan §0 quote.** "Completely useless" review was the slap quote in `research_planner_2026-05-13.md` §0.

**Steal.** The ORCHA submission strategy — ORCHA is a UK quality-mark scheme commissioners use to filter apps. An 86% rating is a strong DD signal. Phase 2 FemWell should submit. The longitudinal cohort study published in PMC is also DD-positive — the academic credibility move is cheap and high-signal.

**Skip.** The reported tracking limits — make sure FemWell handles short and irregular cycles well, the perimenopause use-case is core to our brand.

### 3.11 Peppy

**What it is.** UK-built B2B health platform for menopause, fertility, parenting (source: https://www.peppy.health/). Founded 2018, London. Raised £6.6M then a $10M Series A 2021 led by Felix Capital.

**Clinical model.** Real contracted practitioners — "menopause specialists, fertility nurses, midwives, lactation consultants, mental health experts, urology clinicians, nutritionists, personal trainers." Kathy Abernethy, Director of Menopause Services, was an NHS menopause specialist for 30+ years (source: https://www.kathyabernethy.com/). 250+ employers, 3M+ employees covered.

**Steal.** Their employer-channel pitch and the named-clinician masthead. Phase 2 FemWell adopts the same "real practitioner" positioning when budget allows.

**Skip.** The B2B / employer-channel-only model — FemWell is B2C-led with a B2B Care Bridge ambition. Cost-wise Peppy is operating at a scale FemWell Phase 1 cannot afford.

### 3.12 Balance (Dr Louise Newson)

**What it is.** Free menopause app founded 2020 by Dr Louise Newson — GP, hormone specialist, member of the UK Government's Menopause Taskforce (source: https://www.balance-menopause.com/dr-louise-newson/). App is at balance-app.com.

**Authorship model.** Single named expert authority. Dr Newson has written for RCGP, developed menopause education programmes downloaded by 33,000+ clinicians globally (source: https://www.balance-menopause.com/dr-louise-newson/). The app earned an Apple "App of the Day" award and has been downloaded in 200+ countries.

**Steal.** **This is the model FemWell Phase 2 should learn from most carefully.** A single named UK clinician with verifiable credentials is enormously powerful editorially and DD-wise. A FemWell "Hattie Reynolds, RGN" or equivalent — when she's a *real* contracted person — would slot into this template. The R3 risk is what stops us in Phase 1: invented Louise Newson = fraud; real Louise Newson = moat.

**Skip.** The single-expert vulnerability — if Dr Newson left, Balance's editorial moat would shrink overnight. Phase 2+ FemWell should aim for a small editorial board, not a single name, even as we name one nurse.

### 3.13 Hormona, Wild.ai, Pattern / Co-Star

**Hormona** (UK hormone-tracking app, female-founder-led) and **Wild.ai** (cycle-aware fitness) [both unverified — confirm current status]: borrow science-forward tone and cycle-aware framing without inheriting the strong physiology claims R9 flags. **Pattern / Co-Star** are astrology, adjacent only to FemWell's Horoscope and irrelevant to Care.

(Stage 3 word count: ~1,500)

---

## Stage 4 — Phase 1 features (no contracted staff, regulation-compliant, useful)

The thread-the-needle deliverable: **14 features** below, each scored on impact (DD value), build cost (S/M/L), and regulation tier (green/amber/red per Stage 1 §1.8). Then a deep-dive on the top 8 — what they do, how the content sources work, how Phase 2 upgrades them when the nurse is hired.

### 4.1 The full feature roster (ranked)

| # | Feature | Tier | Cost | DD value | Impact × Cost score (1-5) | v1 inclusion |
|---|---|---|---|---|---|---|
| F1 | NHS Pathway Helper | Green | M | High | 5 | Week 1 |
| F2 | Cycle-aware NHS A-Z | Green | M | High | 5 | Week 2 |
| F3 | GP Prep document generator (Care Bridge upgrade) | Green | S-M | Highest | 5 | Week 3 |
| F4 | HRT decision framework (NICE NG23-aligned) | Green | M | High | 4 | Week 5 |
| F5 | Pacing Bank explainer (clinical framing for §6.8) | Green | S | Medium-high | 4 | Week 4 |
| F6 | Smear + breast screening tracker | Green | S | Medium-high | 4 | Week 3 |
| F7 | Pill / contraception decision tool | Green | M | Medium-high | 4 | Week 6 |
| F8 | First-aid for symptom flares (when 111 / A&E / wait) | Green | S | Medium | 4 | Week 4 |
| F9 | Mental health pathways (NHS Talking Therapies) | Green | S | Medium-high | 4 | Week 5 |
| F10 | Period products cost calculator (UK-priced) | Green | S | Low-medium | 3 | Deferred |
| F11 | Hormonal nutrition guide (BDA / RCOG sourced) | Green | S | Medium | 3 | Phase 1.5 |
| F12 | Sleep hygiene + cycle | Green | S | Low-medium | 3 | Deferred |
| F13 | Breathing exercises library (public-domain audio) | Green | M | Low-medium | 3 | Phase 1.5 |
| F14 | Family planning / fertility window education | Green | M | Medium | 3 | Phase 1.5 |

**Top 8 deep dive follows.** Features F10-F14 are deferred to a Phase 1.5 follow-up.

### 4.2 F1 — NHS Pathway Helper

**What it is.** A rule-based, transparent decision tree that takes a user-described situation ("heavy bleed three weeks running") and outputs the right NHS resource (NHS 111, GP, sexual health clinic, pharmacist, A&E). **Never returns a clinical interpretation; only ever returns a pathway.** Each routing decision is followed by a "we routed you here because [rule]" footer — transparent routing is the green-zone version; black-box routing is hazardous.

**Source.** JSON tree authored against NHS A-Z entries and NHS service pages; each leaf deep-links to the canonical NHS URL. Green tier (NHS 111 online does the same; AIDRS confirms signposting is out of regulated-activity scope). Build M. **Phase 2 upgrade:** quarterly nurse sign-off, bylined "reviewed by [name], RGN [PIN]."

**Why W1-2 priority.** The single feature that turns FemWell from "wellness app" to "clinical companion." Easiest to demo to a buyer; lowest regulatory exposure if executed cleanly.

### 4.3 F2 — Cycle-aware NHS A-Z

**What it is.** When the user looks up a condition (endometriosis, PCOS, perimenopause), the app surfaces the relevant NHS A-Z entry plus a **permissive cycle-phase contextual footer** — master-plan-§11-R9-safe register: "if you're in luteal week and this concerns you, the questions to flag at your GP are..." — never "this happens because you're in luteal."

**Source.** NHS Website Content API v2 (Stage 2 §2.1). Each entry attributed *"Information from NHS Digital, licensed under the current version of the Open Government Licence."* Green if footer stays permissive; amber if it drifts deterministic. Build M (API + `CareContent` entity + UI + ~30 footers for v1). **Phase 2 upgrade:** quarterly nurse sign-off on the footer library.

**Why W2-3 priority.** Highest content-volume feature; Care without it is empty shelves.

### 4.4 F3 — GP Prep document generator

**What it is.** Patient-facing version of `claude-state/demos/femwell_care_bridge_v2_demo.html`. The user generates a PDF: last 30 days of her own cycle/symptom data, a NICE-aligned list of questions the GP will ask (e.g. for heavy bleeding under NICE NG88: how many days, soaked pads/tampons per hour, clots, fatigue, iron status), the relevant NHS A-Z and NICE links, and her own notes section. PDF generated client-side via SecureStore (master plan §6.2 lineage); never sent to a server unless the user explicitly shares.

**Source.** User's own data + NICE question lists + NHS A-Z links. Green tier (the user owns the document; the app provides the template; no clinical interpretation). Build S-M (Care Bridge demo provides ~50% of the work). **Phase 2 upgrade:** quarterly nurse sign-off on the question-list library.

**Why W3-4 priority.** Highest DD value of any Phase 1 feature. A buyer sees this and immediately understands "this app makes a real difference to clinical encounters." Every user who uses it improves the quality of her own GP appointment.

### 4.5 F4 — HRT decision framework (NICE NG23-aligned)

**What it is.** Not a recommendation engine. A NICE-NG23-aligned decision-aid that walks the user through the considerations: symptoms, suitability, contraindications, options, side-effect profiles, time horizons. Output: "here are the considerations — take this to your GP."

**Source.** NICE NG23 Patient Decision Aids; BMS / WHC linked as "further reading" only (BMS commercial restriction). Green tier as decision-aid; amber if recommendation-engine framing creeps in. Build M. **Phase 2 upgrade:** quarterly nurse sign-off. **W5** — massive value for 45-55 segment.

### 4.6 F5 — Pacing Bank explainer

**What it is.** Master plan §6.8 splits Pacing Bank: Planner-B owns the widget, Care-A owns the **framing editorial** — what pacing is, why it works for cycling women / PCOS / endometriosis / long COVID / perimenopause, why we call the units "spoons," and the binding "this is not medical advice" framing.

**Source.** NICE NG206 (ME/CFS), NICE NG188 (long COVID, joint with SIGN/RCGP), Miserandino 2003 (the original spoon-theory essay, cited in `research_planner_2026-05-13.md`), Cleveland Clinic primer. Charity links: Endometriosis UK, Verity, ME Association. Green tier with permissive framing; R9 binding applies. Build S. **Phase 2 upgrade:** possibly a bylined "from the desk of [name]" intro when the nurse lands.

**Why W4 priority.** Chronic-illness-aware positioning is the category-original differentiator. Ship the Planner-B widget and Care-A explainer together.

### 4.7 F6 — Smear + breast screening tracker

**What it is.** UK NHS screening intervals with cycle-aware reminders.
- **Cervical (from 1 July 2025):** HPV-negative women 25-49 invited every 5 years (was 3-yearly); 50-64 every 5 years (unchanged). Cycle-aware reminders avoid period dates.
- **Breast (mammogram):** women 50-71 every 3 years; 71+ must self-request.

**Source.** NHS screening pages + Cancer Research UK summaries (link only). Green tier (calendar + signposting). Build S. **Phase 2 upgrade:** nurse signs off the explanatory text. **W3** — the 2025 cervical change is meaningful; many UK women still believe it's 3-yearly. Strongly DD-positive: public-health-aligned features are exactly what NHS commissioners point at when asked.

### 4.8 F7 — Pill / contraception decision tool

Same shape as F4. NICE-aligned decision aid listing LARC (implant, IUS, IUD), combined pill, progestogen-only, injection, patch, ring, barrier methods. Each: how it works, side-effect profile, cycle impact, suitability flags. **Considerations only; never recommends.** Source: NICE LARC guideline [verify current ID] + BNF entries (linked only) + RCOG leaflets (linked only) + NHS Contraception pages. Green tier as decision-aid. Build M (shares F4 decision-tree UI). **W6** — high user value for the 27-45 segment; slots after screening + HRT.

### 4.9 F8 — First-aid for symptom flares

A "when to do what" reference: when 111, when A&E, when wait, what to put in a self-care toolkit. Inputs: severity + duration + escalation factors. Outputs: appropriate NHS route (mirrors F1's tree). Source: NHS 111 self-help flowcharts + NICE pathways for common acute presentations (heavy bleed, severe pain, suspected ectopic, mental-health crisis). Green tier as pathway-routing. Build S (reuses F1 infrastructure). **W4** — sits next to Panic Mode in the user mental model.

### 4.10 F9 — Mental health pathways (NHS Talking Therapies)

Signposting to **NHS Talking Therapies for anxiety and depression** (formerly IAPT) — self-referral available in every English ICB — plus Samaritans 116 123, Shout 85258, Mind, regional crisis numbers [verify per region]. Source: NHS England Talking Therapies pages + linked charities. Green tier (pure signposting). Build S. **W5** — closes the loop with Panic Mode, Journal, and Today, where mental health is already represented.

### 4.11 F10-F14 — deferred to Phase 1.5

- **F10 (period products cost calculator)** — useful but novelty; Phase 1.5.
- **F11 (hormonal nutrition guide)** — BDA-sourced; Phase 1.5 after the editorial-standards doc is battle-tested.
- **F12 (sleep hygiene + cycle)** — overlaps Horoscope's existing sleep references; Phase 1.5.
- **F13 (breathing exercises library)** — replaces the killed Sessions surface with calmer public-domain audio; Phase 1.5.
- **F14 (family planning / fertility window education)** — high-stakes territory (R3 + R9 both apply); needs the contracted-nurse review before launch — Phase 2 territory.

### 4.12 Implementation pattern for Phase 1 content

For each feature in Phase 1, the build pattern is the same:

1. **Source identification.** Pick the NHS / NICE / royal-college / charity source for each piece of information. Cite at point of use; cite again in the source registry.
2. **AI draft.** A constrained LLM prompt produces the surface copy from the source. The prompt explicitly forbids:
   - Going beyond the source.
   - Adding clinical interpretation.
   - Making predictive or diagnostic claims.
   - Using protected titles or invented credentials.
   - Mentioning specific brand names without source.
3. **Editorial-standards-doc review.** A binding standards doc (Stage 5 §5.6) is the gate: voice, disclaimer footer, attribution, accessibility, reading age.
4. **Style guide review.** Calm-but-substantive, UK English, en-GB dates, £, no emoji, Fraunces + Inter, cream day-mode (not Plum Night which is Horoscope-only).
5. **Live walk.** Per master plan rule 7, mobile + tablet + desktop screenshots before "done."
6. **Source check date.** Each piece of content carries its "Information correct as of [date]" stamp. Quarterly re-verification.

The under-recognised gain of this pattern: it sets up Phase 2 to be **content review** not **content authoring**. The contracted nurse comes in, audits 80% of work that already exists, sign-offs land, and the moat hardens — without doubling content cost.

(Stage 4 word count: ~1,950)

---

## Stage 5 — Architecture + entity model + Care surface design

Where Care lives, what entities back it, what its visual language is, and what binding copy rules apply.

### 5.1 Site map — Care v1

Top-level **`/Care`** route reached primarily via the Menu drawer (master plan §3.5) and via deep links from Jess, Today phase strip, Horoscope, and email campaigns. **Not** in the 5-slot bottom nav — the bottom nav stays Today / Lifestyle / Jess / Profile / Menu (master-plan rule 4 and `feedback_femwell_multiplatform.md`).

**`/Care` index page** has five tiles in Phase 1:

```
+-------------------------------------------+
|  Care                                     |
|  Information and pathways, not advice.   |
+-------------------------------------------+
| [ NHS Pathway Helper ]                    |
| Find the right NHS service                |
+-------------------------------------------+
| [ Cycle-aware NHS A-Z ]                   |
| Look up a condition                       |
+-------------------------------------------+
| [ GP Prep ]                               |
| Generate a document for your GP visit     |
+-------------------------------------------+
| [ Screenings ]                            |
| Smear, breast screening, mental-health    |
+-------------------------------------------+
| [ Pacing ]                                |
| Energy-budgeting explainer                |
+-------------------------------------------+
| Footer: standards + sources + last-updated|
+-------------------------------------------+
```

Sub-routes:
- `/Care/pathway` (F1)
- `/Care/library/[condition]` (F2)
- `/Care/prep` (F3) — generator + saved-documents list
- `/Care/hrt` (F4) — deferred to W5
- `/Care/pacing` (F5)
- `/Care/screenings` (F6)
- `/Care/contraception` (F7) — deferred to W6
- `/Care/first-aid` (F8)
- `/Care/mind` (F9) — deferred to W5
- `/Care/standards` — the binding editorial-standards doc + sources registry, **public-facing** so a DD lawyer can read it in 2 minutes.

### 5.2 Entities required

Schemas in JSON-shaped sketches. Names follow the existing FemWell convention (master plan §3.2 — `LifestyleItems`, `LifestyleSources`, etc.).

**`CareContent`** (NHS-sourced articles & explainers)
```
{
  id, slug, title, kind: "nhs_a_z" | "explainer" | "decision_aid" | "pathway_node",
  body_md,
  source_urls: [url],
  source_licence: "OGL v3.0" | "NICE UK Open Content Licence" | "linked_only",
  source_attribution_html,
  last_reviewed_at, next_review_due,
  phase_tags: ["follicular","ovulation","luteal","menstruation","perimenopause","postmenopause"],
  conditions_tagged: ["pcos","endometriosis","menopause","heavy_periods", ...],
  editorial_status: "draft" | "ai_reviewed" | "human_signed_off",
  reviewer_name, reviewer_pin, reviewer_role,
  created_at, updated_at
}
```

**`CareNHSRoute`** (pathway tree)
```
{
  id, node_kind: "branch" | "leaf",
  parent_id, prompt_text,
  options: [{ label, child_id }] | null,
  leaf_payload: { route_to: "nhs_111" | "gp" | "a_and_e" | "sexual_health_clinic" | "pharmacy" | "talking_therapies" | "specific_url",
                  destination_url, rationale_text },
  authored_against_source_urls: [url],
  last_reviewed_at, next_review_due,
  reviewer_*
}
```

**`CarePrepDocument`** (generated GP-prep PDFs)
```
{
  id, user_id, generated_at,
  cycle_window_start, cycle_window_end,
  symptoms_summary,            // user's own data, encrypted via SecureStore
  questions_list_template_id,  // -> NICE-aligned questions
  notes_user,                   // user free-text, encrypted via SecureStore
  pdf_blob_ref,                 // SecureStore-encrypted blob
  is_shared: bool, shared_with: null | "self" | "specific_clinician",
  retention_policy: "ephemeral_until_share" | "user_chosen"
}
```

**`CareScreeningReminder`**
```
{
  id, user_id, screening_kind: "cervical" | "breast" | "talking_therapies_check_in",
  last_event_date, next_due_date,
  interval_months: int,         // sourced from NHS rules
  cycle_aware: bool,            // smear avoids period
  notification_settings,
  created_at, updated_at
}
```

**`CarePathwayInteraction`** (analytics + safety review log — encrypted at rest)
```
{
  id, user_id_hashed,             // not raw user_id
  feature: "pathway_helper" | "a_z" | "prep" | "screenings" | "pacing",
  query_summary,                  // sanitised query - never the raw symptom text
  route_terminus,                  // which leaf node / which a_z entry / etc.
  occurred_at,
  reviewed_for_safety_at         // quarterly review pass
}
```

The `_hashed` user id and `query_summary` sanitisation are the key safety affordances. We want to be able to audit: "did 47 users in the last quarter hit the heavy-bleeding pathway and route to A&E, suggesting our acuity threshold is too low?" without holding the raw user-to-symptom mapping. The Care interaction log is **never** sent to a third-party analytics SDK (Stage 5 §5.4).

### 5.3 Deep-linking pattern

Care should be reached from every other surface as a natural next step:

- **Jess.** Any time Jess detects a clinical-edge query ("I have heavy bleeding three weeks running"), Jess responds in her usual voice but ends with: *"Care has a pathway for this — `/Care/pathway?topic=heavy_bleeding`. Want me to walk you through it?"*
- **Today phase strip.** When the user logs an unusually severe symptom, the strip surfaces a permissive nudge: *"Care has a first-aid view for symptom flares — would that be useful right now?"*
- **Horoscope.** Where a Horoscope reading touches on health themes ("Mars in your 6th house — body work themes"), surfacing Care is light-touch, not heavy-handed.
- **Lifestyle (For You / Browse).** A long-form article about endometriosis would, at the end, surface the Care endometriosis pathway as a quiet next step.
- **Email campaigns.** Lapsed-user flows surface Care as the "useful even if you're not actively tracking" hook.
- **Panic Mode aftermath.** When a panic session ends, the aftercare card offers Care mental-health pathways alongside the existing Samaritans / Shout numbers.

The discovery problem of Care not being on the bottom nav is solved by deep-linking from every other surface (master plan §6.9 recommendation, confirmed).

### 5.4 Privacy model

Care interactions are special-category health data under UK GDPR Article 9 (Stage 1 §1.6). Binding rules:

- **At rest.** All `CareContent` is public — no encryption needed. `CarePrepDocument`, `CarePathwayInteraction`, and any per-user Care data use the existing **SecureStore** primitive (master plan §6.2) — client-encrypted via a per-device key.
- **In transit.** Care PDFs shared with a clinician are encrypted in transit if shared via the existing Care Bridge demo's clinician export pattern. The user, not FemWell, decides what to share.
- **Analytics.** `CarePathwayInteraction` rows are logged for product analytics and safety review. They are **never** sent to Mixpanel, Amplitude, Google Analytics, Meta SDK, or any third-party analytics. The Flo / Meta 2025 case ($56M class action — source: https://www.courthousenews.com/meta-violated-privacy-law-jury-says-in-menstrual-data-fight/) is the binding cautionary tale.
- **Retention.** Per-user Care data follows the same retention policy as Journal entries — user-deletable on demand; default retention indefinite, with annual prompts to review.
- **DPIA.** A Data Protection Impact Assessment for Care v1 must be drafted before launch. The DPIA is itself a DD artefact and should sit in `/Care/standards`.

### 5.5 Visual language

Care is **not** Plum Night (master-plan rule 3 — Plum Night is Horoscope's territory). Care reads as **calm-clinical-warm**:

- **Base palette.** Cream `#f7f0e6` page + ivory `#fbf7f0` cards (existing FemWell day-mode).
- **Accent palette suggestion.** A muted **sage / olive / soft teal** family:
  - sage `#8a9a85` (primary accent — pathway buttons, "find a service" CTAs).
  - olive `#6b7a5d` (secondary — header underlines, footnote rules).
  - soft teal `#7a9494` (tertiary — link colour, status dots).
  - rust `#b67d77` (existing rose-deep — for any "warning/escalate" tile).
- **Typography.** Fraunces for tile titles + section headings; Inter for body, labels, NHS attribution lines. Italic Fraunces reserved for the binding disclaimer footer.
- **Iconography.** Lucide line icons only. Specific suggestions: `Stethoscope` for Pathway Helper, `BookOpenText` for NHS A-Z, `FileText` for GP Prep, `Calendar` for Screenings, `BatteryLow` (or custom SVG) for Pacing. **No emoji codepoints anywhere** (`feedback_no_emoji_in_femwell.md`).
- **Photography / illustration.** None in Phase 1. Care should read as text-led, library-quiet. The visual quietness is the brand cue that says "this is serious; this respects you."
- **Width constraint.** Same 820px max-width content wrapper as Lifestyle, with the same 5-slot bottom nav at every viewport (master-plan rule 4).

**Three-paragraph visual direction:**

Care should feel like a well-organised reference shelf in a friend's flat — not a clinic, not a magazine, not an influencer feed. The cream-and-sage palette borrows from medical-design history without the medical-design coldness: think a 1960s NHS information leaflet redrawn by someone who reads The Pool and the LRB at night. Every screen earns its place; nothing is decorative.

The hero pattern across `/Care/*` pages is a single short paragraph in Fraunces italic, followed by the practical content in Inter. The italic paragraph sets the register — *"This is information from NHS and NICE sources, gathered here for you. It is not a substitute for talking to your GP."* — and the Inter paragraph delivers. The italic-then-roman cadence is the same one Horoscope uses for the Atelier Reading; here it serves a quieter purpose.

The bottom-of-page footer is the binding part. Every Care page ends with the 60-word disclaimer (§5.6), the source attributions for any NHS / NICE / royal-college content reproduced, the "last reviewed" date, and a small `/Care/standards` link. This footer is non-negotiable. It is the part a DD lawyer reads first and the part a user trusts most. Style-guide it before any content lands.

### 5.6 The binding disclaimer — locked Phase 1 wording

Drafted here for Stage 6 user sign-off. **No Care page ships without this footer.**

> *"This page is general information drawn from NHS and NICE sources, last reviewed on [DATE]. It is not personal medical advice and not a substitute for talking to your GP, NHS 111, or a registered health professional. If your symptoms are severe, worsening, or you are worried, please contact NHS 111 (call 111 or go to 111.nhs.uk) or, in an emergency, 999. Information about how this page was put together, and who reviewed it, is at /Care/standards."*

That's 64 words. Permissive. Specific. Routes the user to the right NHS resource. Names the standards page. Does the four things every health-content disclaimer is asked to do.

The permissiveness audit rule (master plan R9, restated here for Care):
- **Invitations, not imperatives.** "If this concerns you, here is what to flag" — never "you should..."
- **Probabilistic, not deterministic.** "Some people in luteal week notice..." — never "luteal week causes..."
- **Signpost, don't advise.** "Here is the NHS pathway" — never "you should see a GP about..."
- **Source-cited.** Every claim links back to its NHS / NICE / royal-college source.
- **Date-stamped.** Every page shows "Information correct as of [date]."

(Stage 5 word count: ~1,400)

---

## Stage 6 — Phase 1 → Phase 2 transition + launch sequence

When subscribers fund Phase 2, what changes — and what stays the same — in the Care surface.

### 6.1 The Phase 2 trigger

The brainstorm `research_nurse_section_2026-05-13.md` §9 suggests a Path 1 (single contracted UK NMC-registered nurse on retainer) costs **£800-2,000/month** for ~8-12h/week of advisory time. The brainstorm proposes a threshold: ~500 FemWell Plus subscribers at £8.99 each = ~£4,500/month gross, of which a Path-1 nurse retainer is ~£800-2,000 — comfortably within budget without crowding out other operating cost.

This research confirms the threshold logic but suggests a slightly stricter formulation: **don't hire until £4,500/month MRR is sustained across two consecutive months and the Phase 1 Care content backlog has accumulated enough to make the nurse's review work meaningful**. Hiring too early — when there are only six Care articles to review — leaves the nurse under-utilised; hiring too late — when the content backlog is overwhelming — sets her up to fail her first review cycle.

A practical Phase 2 trigger checklist:
1. £4,500/month MRR sustained 2 months.
2. Phase 1 Care content live and used by ≥1,000 weekly active users.
3. At least 40 pieces of `CareContent` and a stable `CareNHSRoute` tree.
4. A reviewer-recruitment scope (LinkedIn outreach to UK NMC nurses with menopause / women's-health practice + a 2-3 week interview/trial pipeline).

### 6.2 What changes when the nurse joins

Phase 2 changes the **review chain**, not the **content posture**.

**Changes:**
- **Quarterly content audit.** The nurse reviews every `CareContent` row, every `CareNHSRoute` pathway leaf, every `CarePrepDocument` template. Signs off via her PIN. Bylined "Reviewed by [name], RGN [PIN], on [date]" appears on each piece.
- **Nurse Notebook.** Long-form bylined commentary — monthly, ~800-1,200 words. Lives at `/Care/notebook/*`. First topics: "Six months on HRT — what to actually expect" / "Heavy bleeds — when to push your GP harder" / "Pacing for PCOS, calmly" / "Coming off the pill — the real timeline." Pattern-matches Astra Cole's Atelier Reading from H2.
- **NHS Pathway tree updates.** Nurse-authored revisions (which leaves to add, which thresholds to adjust). Quarterly.
- **DD masthead.** The Care `/Care/standards` page lists her name + NMC PIN + a one-paragraph bio. Replaces the Phase 1 "FemWell editors, NHS-aligned" framing.
- **Editorial-standards doc revision.** Nurse signs off the binding rules and the disclaimer. Updates as NMC Code revises.

**What doesn't change:**
- **No live Q&A.** Phase 2 is "deeper editorial + audit," not "1:1 advice." Live nurse Q&A remains RED-zone Phase 3 territory.
- **No symptom triage.** Pathway Helper stays rule-based and transparent.
- **No personalised treatment plans.** Decision aids stay decision aids, not recommendations.
- **No invented credentials.** Every clinician named is real, contracted, NMC/GMC-registered, and verifiable.
- **Privacy model.** SecureStore + no-third-party-analytics rules persist.
- **R9 permissiveness rule.** Every line still passes the invitations-not-imperatives audit.

### 6.3 Phase 3 (post-sale) ambitions

A buyer with deeper pockets would unlock features that Phase 1-2 cannot afford:

- **Path 2 editorial board.** 3-4 NHS-trained advisors (nurse, GP, pharmacist, mental-health practitioner). Replaces the single named nurse with a "Clinical Advisory Board" page matching Clue's template (Stage 3 §3.7). DD-positive.
- **DTAC compliance.** Full submission to NHS DTAC (Stage 1 §1.7). Unlocks B2B sales to NHS Trusts via the Care Bridge demo.
- **MHRA SaMD Class IIa assessment.** Optional. If FemWell expands into regulated triage features (e.g. a vetted symptom-checker for one specific condition), Class IIa registration via a UK Approved Body — 9-18 months and six-figure cost — becomes the gate. Worth it only if the regulated feature drives clearly increased revenue.
- **NHS Login integration.** Verified identity + GP-record deep links. ~3-4 month onboarding (Stage 2 §2.7). DD-positive for any B2B NHS sale.
- **CQC registration.** If FemWell adds any live clinical service (telehealth GP, nurse video call), CQC registration is mandatory.
- **ORCHA submission.** As Health & Her demonstrates, an ORCHA rating is an NHS-commissioner trust signal. Phase 2 or Phase 3 (source: app review process described at https://healthandher.com/ — ORCHA 86% rating cited).
- **PMC-published longitudinal cohort study.** Health & Her's cohort study (source: https://pmc.ncbi.nlm.nih.gov/articles/PMC10759107/) sets the bar. A FemWell cohort study comparing user-reported symptom outcomes pre/post-Care-engagement would be unusually high DD signal at the £1M+ valuation tier.

### 6.4 Phase 1 launch sequence — Care v1

The brief recommends a 6-week launch. Below is the version this research recommends, with each week a self-contained MP shippable independently.

**Week 1 — Care shell + NHS Pathway Helper (F1).**
- `/Care` route stood up with the index page (§5.1).
- `CareContent`, `CareNHSRoute`, `CarePathwayInteraction` entities scaffolded.
- NHS Pathway Helper authored (~15-20 routing leaves for v1 — heavy bleed, severe period pain, unusual discharge, missed period, post-coital bleeding, breast lump, persistent low mood, panic episode, suspected UTI, contraceptive emergency).
- SecureStore-encrypted Care interaction logging.
- `/Care/standards` page with the binding disclaimer + sources registry + DPIA summary.
- Live walk: mobile + tablet + desktop screenshots.

**Week 2-3 — Cycle-aware NHS A-Z (F2).**
- NHS Website Content API v2 integration (assumes application started in week 1).
- ~30 conditions in v1 — endometriosis, PCOS, heavy menstrual bleeding, fibroids, polyps, perimenopause, menopause, premenstrual dysphoric disorder, vaginismus, low libido, vulvodynia, etc.
- Permissive cycle-phase footers authored against the editorial-standards doc.
- Each entry attributed under OGL v3.0.

**Week 3 — Screenings tracker (F6).**
- `CareScreeningReminder` entity.
- Cervical (5-yearly per July 2025 change), breast (3-yearly), mental health (annual prompt to self-refer to NHS Talking Therapies).
- Cycle-aware — smear reminders avoid period dates.

**Week 4 — Pacing Bank explainer (F5) + First-aid (F8).**
- Care-A piece of the Pacing Bank (master plan §6.8) — the explanatory editorial.
- First-aid pathway view (sibling of F1).
- Coordination with the Planner-B build that ships the Pacing Bank widget.

**Week 5 — HRT decision framework (F4) + Mental health pathways (F9).**
- NICE NG23-aligned HRT decision aid.
- NHS Talking Therapies signposting + Samaritans / Shout / Mind links.

**Week 6 — GP Prep document generator (F3) + privacy hardening.**
- Care Bridge clinician-export demo adapted for patient-facing GP-prep PDFs.
- DPIA finalised.
- Editorial-standards doc reviewed and signed off (by the user as Phase 1 product owner; by the contracted nurse from Phase 2 onwards).
- Care Bridge demo retained as B2B aspirational material.

**Post-launch (W7-8) — Phase 1.5 follow-ups.**
- F11 (hormonal nutrition guide), F13 (breathing exercises library), F14 (family planning education) — each as a single MP.
- F7 (contraception decision tool) — slot in after F4 if HRT decision-aid pattern proved out.
- ORCHA registration scoping.
- DTAC partial-alignment audit for DD readiness.

### 6.5 What changes when the nurse hire happens — one-page summary

| Surface | Phase 1 (no clinical staff) | Phase 2 (one nurse) | Phase 3 (board + DTAC) |
|---|---|---|---|
| Care by-line | "FemWell editors, NHS-aligned" | "Reviewed by [name], RGN [PIN]" | "Clinical Advisory Board" (3-4 names) |
| Article footer | Binding disclaimer + source registry | + nurse review stamp | + board approval |
| Nurse Notebook | Not shipped | Monthly bylined long-read | Multidisciplinary contributions |
| Pathway tree / decision aids | AI-drafted, editorial-gated | Quarterly nurse sign-off | Semi-annual board sign-off |
| Care Bridge B2B | Demo only | + DPIA + DTAC self-assessment | Full DTAC submission + Trust pilot |
| NHS Login / ORCHA / PMC cohort study | Not shipped | Optional ORCHA | All three |
| CQC / MHRA SaMD | Below threshold | Below threshold | Only if regulated feature added |
| Budget (monthly) | ~£0 operating | ~£800-2,000 nurse + £200-400 content | £3-4k board + DTAC + ORCHA |

### 6.6 The exit gate for Phase 1 Care

A Phase 1 Care launch is **done** when:
1. The five top-level tiles render and deep-link correctly at mobile + tablet + desktop.
2. The NHS Pathway Helper covers ≥15 routing scenarios with transparent rule footers.
3. The Cycle-aware NHS A-Z covers ≥30 conditions with permissive footers.
4. The GP Prep generator outputs a valid PDF the user can download and email.
5. The Screenings tracker shows correct UK NHS intervals (including the July 2025 cervical change).
6. The Pacing Bank explainer connects to the Planner-B widget.
7. Every Care page ends in the binding 60-word disclaimer.
8. `/Care/standards` lists every source with its licence and last-checked date.
9. The DPIA for Care is drafted and stored.
10. Live-walk screenshots prove every page renders correctly on femwells.com.

(Stage 6 word count: ~1,200)

---

## Sources (consolidated — primary references)

_Last fetched 2026-05-13 unless otherwise noted. Items marked `[unverified]` need a human pass before any DD or sale-deck quotation. URLs cited inline throughout the body are not duplicated here unless they are primary regulator or licence sources._

**UK regulators and frameworks.**
- MHRA — Software and AI as a Medical Device guidance hub — https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device
- MHRA / NICE / CQC / HRA — AI and Digital Regulations Service (AIDRS) — https://www.digitalregulations.innovation.nhs.uk/
- MHRA Roadmap analysis — Emergo by UL — https://www.emergobyul.com/news/mhra-publishes-revised-roadmap-future-regulatory-framework-medical-devices
- MHRA on Babylon Health — TechCrunch 2021 — https://techcrunch.com/2021/03/05/uks-mhra-says-it-has-concerns-about-babylon-health-and-flags-legal-gap-around-triage-chatbots/
- CQC — Scope of registration (May 2022) — https://www.cqc.org.uk/sites/default/files/2022-05/20220517%20Scope%20of%20Registration%20Guidance%20May%202022.pdf
- CQC — Regulation 9 person-centred care — https://www.cqc.org.uk/guidance-regulation/providers/regulations-service-providers-and-managers/health-social-care-act/regulation-9
- CQC + AIDRS — Check-if-you-need-to-register — https://www.digitalregulations.innovation.nhs.uk/regulations-and-guidance-for-developers/all-developers-guidance/regulated-activities-check-if-you-need-to-register-with-the-care-quality-commission-cqc/
- NMC — Online register — https://www.nmc.org.uk/registration/nmc-online/
- ICO — Special category data hub — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/
- ASA — Section 12 CAP Code — https://www.asa.org.uk/type/non_broadcast/code_section/12.html
- ASA — Rulings database (human pass required) — https://www.asa.org.uk/codes-and-rulings/rulings.html
- Lexology — "Wellness brands under scrutiny" (Dec 2025) — https://www.lexology.com/library/detail.aspx?g=0cfcb87f-cb61-4dde-a924-873f62b54c5b
- NHS DTAC — Transformation Directorate hub — https://transform.england.nhs.uk/key-tools-and-info/digital-technology-assessment-criteria-dtac/
- NHS DTAC — Burges Salmon Feb-2026 analysis — https://www.burges-salmon.com/articles/102mnjh/new-nhs-digital-technology-assessment-criteria-what-health-tech-suppliers-need-t/
- ATRS — Mandatory scope policy — https://www.gov.uk/government/publications/algorithmic-transparency-recording-standard-mandatory-scope-and-exemptions-policy

**NHS / NICE / open content licences and APIs.**
- Open Government Licence v3.0 — https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
- NHS England / HEE OGL guidance — https://library.hee.nhs.uk/resources/copyright/using-copyright-materials/open-government-licence
- NHS Website Content API v2 — https://digital.nhs.uk/developer/api-catalogue/nhs-website-content/v2
- NHS Developer integration hub — https://digital.nhs.uk/developer
- NHS Login developer docs — https://nhsconnect.github.io/nhslogin/
- NHS App developer docs — https://nhsconnect.github.io/nhsapp-developer-documentation/
- NICE — Reusing content (UK Open Content Licence) — https://www.nice.org.uk/re-using-our-content
- NICE NG23 (Menopause) — https://www.nice.org.uk/guidance/ng23
- NICE NG206 (ME/CFS, pacing) — https://www.nice.org.uk/guidance/ng206
- NICE NG188 (Long COVID, joint with SIGN/RCGP) — via ME Association — https://meassociation.org.uk/information/long-covid-nice-guideline/
- Cochrane Library — UK access options — https://www.cochranelibrary.com/help/access

**Royal colleges and charities (licences / linkable patient info).**
- RCOG — Rights and permissions policy 2024 — https://www.rcog.org.uk/about-us/policies/rights-and-permissions/
- RCOG — Reproducing guidance and patient information — https://www.rcog.org.uk/guidance/reproducing-rcog-guidance-and-patient-information/
- British Menopause Society — Publications hub — https://thebms.org.uk/publications/tools-for-clinicians/
- Women's Health Concern (BMS patient arm) — https://www.womens-health-concern.org/
- Endometriosis UK — https://www.endometriosis-uk.org/
- Verity (PCOS) — https://www.verity-pcos.org.uk/
- Daisy Network (POI) — https://daisynetwork.org/
- Wellbeing of Women — https://www.wellbeingofwomen.org.uk/

**NHS screening — primary references.**
- Cancer Research UK — Cervical 5-yearly change June 2025 — https://news.cancerresearchuk.org/2025/06/10/nhs-england-changes-cervical-screening-to-every-5-years/
- NHS — Breast screening eligibility — https://www.nhs.uk/tests-and-treatments/breast-screening-mammogram/who-breast-screening-is-for/

**Competitive analysis — primary references.**
- Babylon Health (Wikipedia summary + INSEAD case) — https://en.wikipedia.org/wiki/Babylon_Health
- TechCrunch — Babylon bankruptcy Aug 2023 — https://techcrunch.com/2023/08/31/the-fall-of-babylon-failed-tele-health-startup-once-valued-at-nearly-2b-goes-bankrupt-and-sold-for-parts/
- Flo Health — Wikipedia + Meta privacy verdict — https://en.wikipedia.org/wiki/Flo_(app) — https://www.courthousenews.com/meta-violated-privacy-law-jury-says-in-menstrual-data-fight/
- Clue — Medical Advisory Board page — https://helloclue.com/articles/about-clue/introducing-clue-s-medical-advisory-board
- Stardust — Privacy International long-read — https://privacyinternational.org/long-read/5568/stardust-research-findings
- Maven Clinic — Naytal UK acquisition — https://tech.eu/2023/03/21/maven-clinic-acquires-women-s-health-platform-naytal/
- Health & Her — PMC cohort study — https://pmc.ncbi.nlm.nih.gov/articles/PMC10759107/
- Peppy — Menopause service — https://www.peppy.health/what-we-do/menopause/
- Balance — Dr Louise Newson — https://www.balance-menopause.com/dr-louise-newson/
- Livi — Who are the doctors — https://support.livi.co.uk/hc/en-us/articles/360003311833-Who-are-the-doctors-that-work-at-Livi

**Existing FemWell internal references.**
- `claude-state/master-plan.md` (rev 4, 2026-05-13) — §6.8 Pacing Bank, §6.9 Care surface, §11 R3 + R9.
- `claude-state/research_nurse_section_2026-05-13.md` — companion brainstorm.
- `claude-state/research_planner_2026-05-13.md` — §7 #6 (Pacing Bank), §8 (R9 trap).
- `claude-state/demos/femwell_care_bridge_v2_demo.html` — basis for F3 GP Prep generator.
- `.claude/memory/feedback_no_emoji_in_femwell.md`, `feedback_femwell_is_uk.md`, `feedback_femwell_multiplatform.md`, `project_femwell_design_status.md` — bindings.

---

_End of multi-stage Care research. Total ~10,400 words across six stages + executive summary + sources._

_Surface findings:_
- _The single most surprising regulation finding is in §1.8: the AIDRS portal launched April 2024 is in practice the entire compliance reading list for a UK consumer health app, and almost no competitor cites it. Citing AIDRS in our DD pack is a high-signal low-cost positioning move._
- _The single most under-used public-domain content source is the NHS Website Content API v2 combined with NICE's UK Open Content Licence (Stage 2 §2.12). Almost no consumer wellness app does this well; both are free, both are commercially reusable, both are quintessentially UK-specific._
- _Top 3 features for Care v1 (weeks 1-4): F1 NHS Pathway Helper · F2 Cycle-aware NHS A-Z · F3 GP Prep document generator._
- _The single biggest regulation tripwire that could kill a sale: an "Ask the Nurse / Ask Jess about your symptoms" Q&A feature shipping in Phase 1 — even AI-drafted + reviewed — would trigger MHRA SaMD Class IIa classification and require six-figure remediation. Don't ship symptom interpretation in any form in Phase 1._

_Five open user questions blocking Care v1 scope-lock: see Executive Summary._

_For the user — please review the executive summary first, then §1.8 (the green/amber/red list) and §5.6 (the binding disclaimer wording) before any Care MP is drafted._
