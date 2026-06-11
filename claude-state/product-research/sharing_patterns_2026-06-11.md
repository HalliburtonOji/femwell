# Research Brief — Sharing patterns + safety (FemWell, UK, 18+, anonymous-first) — 2026-06-11

> Feeds SHARING_PROPOSAL.html. Two tracks split by privacy. Every claim cited. Saved verbatim from the research pass.

## 1) Share-card systems (how branded image cards are made + spread)
- Canonical pipeline: design in Figma → export SVG (plain text, CSS/web-fonts) → string-replace placeholders with user data → rasterize to PNG server-side. The pattern behind Spotify Wrapped, Wordle scorecards, Strava stats (Rowy — https://docs.rowy.io/tutorials/spotify-wrapped). Serverless SVG endpoint example (github.com/alexmarqs/spotify-now-playing-svg).
- Duolingo streak card = full-screen, high-contrast, animated, built to Twitter/Instagram aspect ratios; "save, post, or #humblebrag" (blog.duolingo.com/streak-milestone-design-animation/; 60fps.design/shots/duolingo-streak-card-and-share-sheet).
- Shareable = identity-signalling "humble-brag wrapped in data" (startupspells.com/p/duolingo-screenshot-tracking-viral-strategy).
- Growth: Duolingo instrumented screenshot events; optimising the card → reported 5x–10x organic-sharing lift; ~80% organic acquisition via viral loops (startupspells; youngurbanproject.com/duolingo-case-study/).

## 2) Share mechanisms (technical)
- Web Share API navigator.share({title,text,url,files}) — needs ≥1 data property; MUST be user-gesture-triggered; HTTPS only; feature-detect navigator.canShare({files}) before sharing files; NOT Baseline → needs fallbacks (MDN — https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
- Instagram Stories: instagram-stories://share?source_application=… + image via iOS pasteboard (com.instagram.sharedSticker.backgroundImage); Facebook App ID required since Jan 2023; IG must be installed; 720×1280 9:16; NATIVE iOS/Android ONLY — no web implementation (developers.facebook.com/docs/instagram-platform/sharing-to-stories/).
- Consequence for a PWA/mobile-web app: can't reliably do a background-image IG-Stories handoff from the browser. Robust path = render card → navigator.share({files:[png]}) (surfaces IG/WhatsApp/Messages) + WhatsApp/Telegram text-link + copy-link/download fallback (MDN; sudolabs.com/insights/share-visual-content-from-web-to-social-media-without-api-or-sdk).

## 3) Referral / invite growth
- Double-sided ("give X get Y") > one-sided (yotpo.com/blog/how-do-referral-programs-work/; referralcandy.com/health-wellness).
- Wellness: alignment > cash; non-cash/free-product rewards can outperform (referralcandy).
- Works: points/badges/milestones/leaderboards/time-boxed challenges (onesignal.com/blog/7-strategies-to-incentivize-app-referrals/).
- Spammy / avoid: "broadcasting fraud" — blasting links to strangers; users fear spamming friends (alloy.com/blog/how-to-outsmart-referral-fraud).

## 4) Privacy & safety of outbound sharing (sensitive/health/anonymous)
- Authorship attribution re-identifies anonymous medical-forum posters: 97.9% F-score ≥300 words; 83.1% with 50 candidate authors; 6,000 IVF-forum messages (PMC3806358 — https://pmc.ncbi.nlm.nih.gov/articles/PMC3806358/).
- Linkage: rare-disease forum indirect identifiers + condition + username reuse enable re-identification (PMC7457524 — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7457524/).
- UK: health data = special-category; needs Art 6 + Art 9; special-category BY INFERENCE (ICO — https://ico.org.uk/.../special-category-data/what-are-the-conditions-for-processing/).
- OSA (in force Oct 2023) + UK GDPR cross-over: UGC is personal data; DPIA required before processing; SCD by inference (Pinsent Masons — https://www.pinsentmasons.com/out-law/news/ico-guide-addresses-online-safety-act-and-gdpr-cross-over). ICO–Ofcom formal cooperation (insideprivacy.com/online-safety/ofcom-and-ico-issue-joint-statement-on-age-assurance/).
- ASYMMETRY: (a) a user's own NON-personal artifact leaving = low-risk; (b) another user's anonymous personal content leaving = high-risk (exports SCD-by-inference without consent). This justifies the two-track wall.

## 5) Never allow (cautionary)
- Strava global heatmap (2018): default-public aggregate sharing exposed military base locations — default-public + aggregation = leakage (TechCrunch — https://techcrunch.com/2018/01/29/us-military-reviewing-tech-use-after-strava-privacy-snafu/).
- Flo Health (FTC, 2021): women's fertility app shared sensitive health data with Facebook/Google/AppsFlyer/Flurry despite privacy promises; order requires affirmative consent (FTC — https://www.ftc.gov/news-events/news/press-releases/2021/06/ftc-finalizes-order-flo-health-...). Outbound data flows are a regulator magnet for women's-health apps.
- Screenshot leakage of others' posts = re-publishing SCD-by-inference (PMC3806358/PMC7457524).

## Hard privacy rules for outbound sharing
1. Two tracks, hard wall: internal personal content has ZERO external-share affordance; only curated non-personal artifacts (wisdom/horoscope/affirmation/book pick/invite) can leave.
2. NEVER let one user share another user's content out of the app.
3. No health data leaves without an Art 9 condition + affirmative consent; treat user-authored content as SCD-by-inference.
4. Default to private; never opt users into outbound sharing (Strava lesson).
5. No PII/handle/avatar on share cards (username reuse → linkage).
6. DPIA before launching any outbound-sharing/community-moderation processing.
7. No third-party analytics/marketing SDK in the share path (Flo lesson).
8. Referral links content-led + non-broadcast; double-sided non-cash.

## Caveat
ICO pages block automated fetch; SCD/Art-6+9 facts sourced from ICO search excerpts + Pinsent Masons summary — human double-check the live ICO pages before legal sign-off.
