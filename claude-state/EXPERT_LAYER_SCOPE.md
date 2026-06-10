# EXPERT LAYER — SCOPE ONLY (NOT BUILT) — 2026-06-10

> Pillar 5 of the Phase-4 Community build. **Deliberately NOT shipped.** This surface touches
> medical advice, identity verification, professional liability, and UK clinical-regulation
> territory — building it blind would be reckless. This doc is the design + the exact list of
> what must be Halli-decided/owned before any code is written. Mega-plan source: §3.9 + locked
> principle #11 ("experts moderate; peers never carry medical authority at scale") + §5 monetisation
> ("monetise expert depth, never the peer wall").

## 1. What it is (the design)
A trust + anti-misinformation wedge: **verified UK clinicians** (GMC/NMC/HCPC) provide **general,
non-individualised** content + misinformation correction, in a surface **quarantined from peer
chat** (the Flo model). It is the one monetisable layer — all peer surfaces stay free.

- **IA:** an "Ask an Expert" / AMA surface, separate from the rooms/circles. Scheduled live OR async Q&A.
- **States:** upcoming AMA · live · archived · expert-answered (badged with register + number) ·
  a persistent **"This is general information, not personal medical advice — see your GP / NHS 111"**
  interstitial on every expert answer.
- **Data (designed, not created):** `Expert` (name, register[GMC/NMC/HCPC], number, verified_at,
  scope_of_practice) · `AMASession` (expert_id, topic, starts_at, status) · `AMAQuestion`
  (session_id, author_hash, body — crisis+moderated like every other input) · `AMAAnswer`
  (question_id, expert_id, body, general_only:true). Tier-1 public-in-app.
- **Anonymity model still holds for ASKERS:** questions are anonymous (author_hash), crisis-checked
  and moderated exactly like comments. Only the EXPERT is identified (that's the point — accountable
  authority). So this reuses the existing anonymity + moderation spine on the question side.

## 2. Why it is NOT buildable blind (the hard blockers)
1. **Clinician identity verification.** "Verified" must mean something. Need a real process to check
   a GMC/NMC/HCPC registrant is who they say + on the live register + in good standing. Options:
   manual vetting by Halli (low volume, viable at launch) · a verification vendor · register API
   lookups. **No code until the process + owner exist** — a fake "expert" badge is a serious harm + liability.
2. **The medical-advice boundary (Bolam / GMC Good Medical Practice).** An AMA answer that drifts from
   "general information" into "individualised advice" creates a clinician-patient duty of care +
   professional + platform liability. Needs: a hard product constraint (general-only framing,
   templated disclaimers, an interstitial), AND clinician guidance/training, AND a review step. This
   is a legal/clinical-governance decision, not an engineering one.
3. **Liability + disclaimers + insurance.** Who carries the risk when an expert answer is wrong or is
   read as advice? Platform ToS carve-outs, the experts' own indemnity, the "not medical advice"
   framing — all must be drafted/signed off (overlaps the OSA/ICO legal floor already on the list).
4. **Who vets + who is accountable.** A named human owner for: verifying experts, reviewing answers
   pre/post-publication, handling a complaint about an expert, de-listing. (Halli is already the
   named OSA/ICO accountable person — this likely sits with him + named clinical input.)
5. **Monetisation + relationship.** Experts are the paid layer. Are they paid? volunteer? sponsored?
   This shapes the contract, the expectations, and the liability. A commercial + relationship decision.
6. **Crisis routing for expert Qs.** A question to an expert can still be a crisis disclosure → must
   hit the same crisis intercept (UK resources) BEFORE it ever reaches an expert/queue. (This part is
   reusable from the existing spine — but must be wired, not assumed.)

## 3. NEEDS-HALLI (the exact gate list before any code)
- [ ] **Verification process + owner** — how a clinician's GMC/NMC/HCPC registration is checked + by whom.
- [ ] **Medical-advice boundary policy** — the general-only rule, the disclaimer/interstitial wording,
      the clinician guidance, and the answer-review step (pre- or post-publication). Legal/clinical sign-off.
- [ ] **Liability / ToS / indemnity / insurance** — who carries the risk; disclaimers; experts' own cover.
      (Fold into the OSA/ICO legal floor work.)
- [ ] **Named accountable owner** for expert vetting, answer review, complaints, de-listing.
- [ ] **Commercial model** — paid / volunteer / sponsored; the expert contract.
- [ ] **Scope at launch** — async-only (safer, reviewable) vs live AMA (harder to moderate in real time).
      *Recommendation: async-only first* — every answer is reviewable before it's published.
- [ ] **Confirm Doctor-Export EXCLUDES expert Q&A** (whole-life RULE — already specced; verify when built).

## 4. Recommendation
**Do not build until §3 is resolved.** It is genuinely the strongest buyer-diligence signal (principle #11
+ §5: the part competitors can't trivially clone), so it is worth doing — but it is the highest legal/
clinical-risk surface in the whole plan, and the locked rollout already puts it in **Phase 5**, after the
free peer surfaces (now built) and the legal floor. When §3 is green, the build itself is small and reuses
the existing anonymity + crisis + moderation spine on the question side — the hard part is governance, not code.

**Status: SCOPED, NOT BUILT — gated on Halli (§3).**
