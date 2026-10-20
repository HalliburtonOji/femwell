// ReadFocus — the bespoke §19 surface for the Read chip. Reader-forward editorial: continue-reading
// resumes in place first, then the day's editorial pick, her fresh reads (ranked by the feed —
// interests + history + phase), then stories & fiction. Deliberately ordered resume → today → fresh
// → fiction. Reads real state (what she's part-way through, her ranked feed). Tap → resumes /opens
// the exact reader in place. Reuses the real CoverCard reader in the cream design.
import React from "react";
import { BookOpen, Flower2 } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { SERIF } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";
import { SelectedRoomDetail } from "./SelectedLifestyleHeader";
import { CalmFindRow, CalmMore } from "./CalmLifestyle";
import { firstSentences } from "./FocusedLifestyleSheet";

function ReadEditionChoice({ item, onOpen, onDetails, resume = false, compact = false }) {
  if (!item) return null;
  const raw = item._raw || {};
  const archive = item.archived || /^FEMWELL_AI/i.test(String(raw.provider || ""));
  const draftType = /NEWS/i.test(String(raw.content_type || "")) ? "News" : /GUIDE/i.test(String(raw.content_type || "")) ? "Guide" : "Essay";
  const kind = resume ? "Continue reading" : raw.editorial_local ? `Ideas · ${draftType} · unreviewed` : archive ? "Archive · source check pending"
    : /news/i.test(String(raw.provider || "") + String(raw.category || "")) ? "News & context"
    : /guide/i.test(String(raw.content_type || "") + String(raw.media_type || "")) ? "Useful guide"
    : /fiction|story/i.test(String(raw.content_type || "") + String(item.type || "")) ? "Story" : "Article";
  const line = firstSentences(item.subtitle || item.summary || "", 1);
  const source = raw.editorial_local ? raw.duration_label : item.sourceName || raw.source_name || raw.author_name;
  return <div className={`fw-read-edition${compact ? " fw-read-edition--compact" : ""}`}>
    <div className="fw-read-edition-kicker"><Flower2 size={15} aria-hidden="true"/><span>{kind}</span></div>
    <h2>{item.title}</h2>
    <div className="fw-read-edition-bottom">
      {source && <span className="fw-read-edition-source">{source}</span>}
      <button className="fw-read-edition-open" aria-label={`${resume ? "Continue" : "Read"} ${item.title}`} onClick={() => onOpen?.(item)}>{resume ? "Continue" : "Read"} <span aria-hidden="true">→</span></button>
    </div>
    {line && !resume && <p className="fw-read-edition-standfirst">{line}</p>}
    {onDetails && <button className="fw-read-edition-details" onClick={() => onDetails(item)} aria-label={`Details & tools for ${item.title}`}>Details &amp; tools</button>}
  </div>;
}

function ReadIssueBrief({ item, onOpen, onDetails }) {
  const raw = item._raw || {};
  const news = /NEWS/i.test(String(raw.content_type || ""));
  return <div className="fw-read-brief">
    <button className="fw-read-brief-open" onClick={() => onOpen?.(item)} aria-label={`Read ${item.title}`}>
      <span><small>{news ? "News draft · unreviewed" : "Practical guide · unreviewed"}{raw.duration_label ? ` · ${raw.duration_label}` : ""}</small><strong>{item.title}</strong></span>
      <span aria-hidden="true">→</span>
    </button>
    {onDetails && <button className="fw-read-brief-details" onClick={() => onDetails(item)} aria-label={`Details & tools for ${item.title}`}>Details &amp; tools</button>}
  </div>;
}


function ReadCard({ eyebrow, title, accent = "plum", children, style, className }) {
  // CLEAN (§2.7): one shared clean surface — white, a single soft lift, a gold eyebrow carrying its
  // colourway meaning-rosette (the per-card floral detail Halli kept). No texture, no rainbow rim.
  return (
    <CleanCard style={style} className={className}>
      {eyebrow ? <Eyebrow cw={accent} align="left">{eyebrow}</Eyebrow> : null}
      {title ? <Title align="left" size={21}>{title}</Title> : null}
      {children}
    </CleanCard>
  );
}

export default function ReadFocus({ continueCards = [], articleCards = [], storyCards = [], phaseWord, onOpen, onDetails, onBooks, presentation, calmLayout = false, editorialPreview = false, visualEdition = false, segment = "all" }) {
  const hasAny = continueCards.length || articleCards.length || storyCards.length;
  if (!hasAny) {
    if (segment === "rest") return null;
    return (
      <ReadCard eyebrow="Something to read" title="Fresh reads land here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>No new reads just now. Books is next door if you fancy a chapter.</p>
        {onBooks && <button type="button" className="fw-focused-button" onClick={onBooks}>Open Books</button>}
      </ReadCard>
    );
  }
  const featured = articleCards[0] || null;
  const restArticles = featured ? articleCards.slice(1) : articleCards;
  const summary = `${continueCards.length ? `${continueCards.length} on the go · ` : ""}${articleCards.length} fresh read${articleCards.length === 1 ? "" : "s"}${!presentation && phaseWord ? ` tuned to your ${phaseWord} week` : ""}${storyCards.length ? ` · ${storyCards.length} to lose yourself in` : ""}.`;

  if (calmLayout) {
    // A saved place is the strongest honest recommendation we have. An original
    // whole-life essay changes the subject from the existing fiction-heavy
    // archive; the full article/history list stays one tap away.
    const namedResume = continueCards.find(item => !/^Project Gutenberg book \d+$/i.test(item.title || ""));
    const labelledFiction = storyCards.find(item => !item.archived && /fiction/i.test(item._raw?.author_name || item.sourceName || ""));
    const completeEditorial = articleCards.find(item => item._raw?.editorial_local ||
      (!item.archived && item.body?.length));
    const currentStory = storyCards.find(item => !item.archived && item.body?.length);
    const primary = namedResume || continueCards[0] || completeEditorial || labelledFiction || currentStory || null;
    const alternate = continueCards.includes(primary) ? completeEditorial || labelledFiction || currentStory
      : storyCards.includes(primary) ? completeEditorial : labelledFiction || currentStory;
    const second = alternate?.id === primary?.id ? null : alternate;
    const used = new Set([primary?.id, second?.id]);
    const remaining = [
      ...continueCards.map(item => ({ item, label: "Continue" })),
      ...articleCards.map(item => ({ item, label: "Read" })),
      ...storyCards.map(item => ({ item, label: "Read" })),
    ].filter(({ item }) => item && !used.has(item.id) && used.add(item.id));
    const primaryIsResume = continueCards.includes(primary);
    const lead = <ReadCard className="fw-selected-reading-choice fw-selected-lead" eyebrow={visualEdition || editorialPreview ? undefined : primaryIsResume ? "Your saved place" : "Your next page"} accent="plum">
      {presentation && <SelectedRoomDetail section="read"/>}
      {!primary ? <div className="fw-calm-read-empty"><p>No new read just now. Try Books next door.</p>{onBooks && <button type="button" className="fw-focused-button" onClick={onBooks}>Open Books</button>}</div>
        : visualEdition || editorialPreview ? <ReadEditionChoice item={primary} onOpen={onOpen} onDetails={onDetails} resume={primaryIsResume}/>
        : <CalmFindRow item={primary} onOpen={onOpen} onDetails={onDetails} label={primaryIsResume ? "Continue" : "Read"}/>}
    </ReadCard>;
    const more = <>
      {second && <div style={segment === "all" ? { marginTop: 16 } : undefined}>
        {visualEdition || editorialPreview ? <ReadEditionChoice item={second} onOpen={onOpen} onDetails={onDetails} compact/>
          : <CalmFindRow item={second} onOpen={onOpen} onDetails={onDetails} label="Read"/>}
      </div>}
      <CalmMore enabled={remaining.length > 0} title={`Browse all reading · ${remaining.length}`}>
        {remaining.map(({ item, label }) => <CalmFindRow key={item.id} item={item} onOpen={onOpen} onDetails={onDetails} label={label}/>)}
      </CalmMore>
    </>;
    const issueFeature = editorialPreview && articleCards.find(item => item._raw?.editorial_local && String(item._raw?.content_type || "").toUpperCase() === "ARTICLE");
    const issueGuide = editorialPreview && articleCards.find(item => item._raw?.editorial_local && String(item._raw?.content_type || "").toUpperCase() === "GUIDE");
    const issueNews = editorialPreview && articleCards.find(item => {
      const raw=item._raw || {}, now=Date.now(), date=new Date(now);
      const today=[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
      const published=String(raw.published_at || ""), expires=String(raw.expires_at || ""), checked=String(raw.revalidated_at || published);
      const starts=/^\d{4}-\d{2}-\d{2}$/.test(published) ? published <= today : Date.parse(published) <= now;
      const ends=/^\d{4}-\d{2}-\d{2}$/.test(expires) ? expires >= today : Date.parse(expires) >= now;
      const checkedAt=Date.parse(checked), checkedIsCurrent=Number.isFinite(checkedAt) && now-checkedAt <= 14*86400000 &&
        (/^\d{4}-\d{2}-\d{2}$/.test(checked) ? checked <= today : checkedAt <= now);
      return raw.editorial_local && String(raw.content_type || "").toUpperCase() === "NEWS" && starts && ends && checkedIsCurrent;
    });
    const issueLead=issueFeature && issueFeature.id !== primary?.id ? issueFeature : null;
    const issueBriefs=[issueGuide,issueNews].filter(item => item && item.id !== primary?.id);
    const issueUsed=new Set([primary?.id,issueLead?.id,...issueBriefs.map(item=>item.id)]);
    const issueArchive=[...continueCards,...articleCards,...storyCards].filter(item => item && !issueUsed.has(item.id) && issueUsed.add(item.id));
    const issueMore=issueFeature ? <>
      {issueLead && <ReadEditionChoice item={issueLead} onOpen={onOpen} onDetails={onDetails} compact/>}
      {issueBriefs.length > 0 && <div className="fw-read-brief-list" aria-label="Useful reads in this issue">{issueBriefs.map(item=><ReadIssueBrief key={item.id} item={item} onOpen={onOpen} onDetails={onDetails}/>)}</div>}
      <CalmMore enabled={issueArchive.length > 0} title={`Browse all reading · ${issueArchive.length}`}>
        {issueArchive.map(item=><CalmFindRow key={item.id} item={item} onOpen={onOpen} onDetails={onDetails} label={continueCards.includes(item) ? "Continue" : "Read"}/>)}
      </CalmMore>
    </> : more;
    const visibleMore=editorialPreview ? issueMore : more;
    const hasMore=editorialPreview && issueFeature ? !!(issueLead || issueBriefs.length || issueArchive.length) : !!(second || remaining.length);
    if (segment === "lead") return lead;
    if (segment === "rest") return hasMore ? <ReadCard className="fw-selected-reading-rest" eyebrow={editorialPreview && issueFeature ? "In this issue" : "More at the reading desk"} accent="plum">{visibleMore}</ReadCard> : null;
    return <ReadCard className="fw-selected-reading-choice" eyebrow="Your next page" accent="plum">
      {presentation && <SelectedRoomDetail section="read"/>}
      {!primary ? <div className="fw-calm-read-empty"><p>No new read just now. Try Books next door.</p>{onBooks && <button type="button" className="fw-focused-button" onClick={onBooks}>Open Books</button>}</div>
        : visualEdition || editorialPreview ? <ReadEditionChoice item={primary} onOpen={onOpen} onDetails={onDetails} resume={primaryIsResume}/>
        : <CalmFindRow item={primary} onOpen={onOpen} onDetails={onDetails} label={primaryIsResume ? "Continue" : "Read"}/>}
      {visibleMore}
    </ReadCard>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      {!calmLayout && <Summary Icon={BookOpen} cw="plum">{summary}</Summary>}

      {/* 1 · CONTINUE — resume where she left off, in place */}
      {continueCards.length ? (
        <ReadCard className="fw-selected-resume" eyebrow="Pick up where you left off" title="Reading now" accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {continueCards.map((it) => calmLayout ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails} label="Continue"/> : <CoverCard presentation={presentation} key={it.id} item={it} onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation ? () => onOpen?.(it) : undefined} consumeLabel={it._continue ? "Continue" : "Read"} />)}
          </div>
        </ReadCard>
      ) : null}

      {/* 2 · TODAY'S READ — the top personalised editorial pick, featured */}
      {featured ? (
        <ReadCard className="fw-selected-lead" eyebrow={presentation ? "On the reading desk" : "Chosen for you today"} title="Today's read" accent="crimson">
          {presentation && <SelectedRoomDetail section="read"/>}
          <CoverCard presentation={presentation} previewText={calmLayout ? firstSentences(featured.summary || featured.excerpt,1) : undefined} item={featured} onOpen={() => (onDetails || onOpen)?.(featured)} onConsume={presentation ? () => onOpen?.(featured) : undefined} consumeLabel={featured._continue ? "Continue" : "Read"} />
        </ReadCard>
      ) : null}

      {/* 3 · FRESH READS — the ranked feed */}
      {restArticles.length ? (
        <ReadCard className="fw-selected-fresh" eyebrow="A fresh page" title="Fresh reads & guides" accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {restArticles.slice(0, calmLayout ? 1 : undefined).map((it) => calmLayout ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/> : <CoverCard presentation={presentation} key={it.id} item={it} compact onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation ? () => onOpen?.(it) : undefined} consumeLabel={it._continue ? "Continue" : "Read"} />)}
            <CalmMore enabled={calmLayout && restArticles.length > 1} title={`More reads & guides · ${Math.max(0, restArticles.length - 1)}`}>
              {calmLayout && restArticles.slice(1).map(it => <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/>)}
            </CalmMore>
          </div>
        </ReadCard>
      ) : null}

      {/* 4 · STORIES & FICTION */}
      {storyCards.length ? (
        <ReadCard className="fw-selected-fiction" eyebrow="Get lost in one" title="Stories & fiction" accent="crimson">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {storyCards.slice(0, calmLayout ? 1 : undefined).map((it) => calmLayout ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/> : <CoverCard presentation={presentation} key={it.id} item={it} compact onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation ? () => onOpen?.(it) : undefined} consumeLabel={it._continue ? "Continue" : "Read"} />)}
            <CalmMore enabled={calmLayout && storyCards.length > 1} title={`More stories · ${Math.max(0, storyCards.length - 1)}`}>
              {calmLayout && storyCards.slice(1).map(it => <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/>)}
            </CalmMore>
          </div>
        </ReadCard>
      ) : null}

      <Foot>{presentation ? "A rabbit hole, with better punctuation." : "A chapter or an article at a time, at your pace — your place is saved, nothing expires."}</Foot>
    </div>
  );
}
