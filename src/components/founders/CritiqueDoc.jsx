import { Clock3, Search, Sprout } from "lucide-react";

const stages = [
  "Sky", "Read", "Listen", "Books", "Good life", "Yours", "Everything",
  "Today", "Planner", "Community & DM", "Journal", "Garden", "Nutrition",
  "Health", "Movement & rest", "Jess", "Account & Saved",
];
const links = [
  ["Accessibility · W3C", "https://www.w3.org/WAI/WCAG22/quickref/"],
  ["Usability · Nielsen Norman Group", "https://www.nngroup.com/articles/ten-usability-heuristics/"],
  ["Performance · Web Vitals", "https://web.dev/articles/vitals"],
  ["Backend · OWASP ASVS", "https://owasp.org/projects/asvs"],
];
const buildStages = [
  "Sky · daily refresh, recovery and saved editions",
  "Read & Listen · exact resume, progress and real playback",
  "Books & Yours · one shelf, notes and source returns",
  "Good life & shared shell · useful actions and truthful state",
  "Connections · Today, Planner, Journal, Garden and Jess",
  "Legacy surfaces · unfinished builds, popups and every opened state",
];

// Sanitised founder summary only. Detailed evidence stays in claude-state/critique/.
// Do not import the ledger: bundled frontend content is publicly downloadable.
export default function CritiqueDoc() {
  const card = { padding: "18px 16px", border: "1px solid #E6E1DA", borderRadius: 18, background: "#FFFFFF", boxShadow: "0 5px 20px rgba(35,27,32,.035)", marginTop: 14 };
  const heading = { fontFamily: "Cormorant Garamond, Georgia, serif", fontWeight: 500, lineHeight: 1.2, margin: "0 0 10px", color: "#4A2A3A" };
  const action = { display: "inline-flex", alignItems: "center", minHeight: 44, color: "#72251F", textDecoration: "underline", textUnderlineOffset: 4 };
  return (
    <article aria-labelledby="critique-title" style={{ color: "#343036", fontFamily: "system-ui, sans-serif", lineHeight: 1.55, overflowWrap: "anywhere", paddingBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#685434", fontSize: 12 }}><Sprout size={18} aria-hidden="true" /> Whole app · ongoing polish</div>
      <h1 id="critique-title" style={{ ...heading, fontSize: "clamp(28px, 7vw, 38px)", marginTop: 10 }}>A fresh pair of eyes.</h1>
      <p style={{ margin: 0 }}>One section, properly looked at. Then the next.</p>
      <section style={card} aria-label="Schedule">
        <div style={{ display: "flex", gap: 9, alignItems: "center", fontWeight: 600 }}><Clock3 size={19} aria-hidden="true" /> Every four hours · active</div>
        <p style={{ fontSize: 14, margin: "9px 0 0" }}>Work resumes its saved stage each run. No need to keep typing “continue”. Routine fixes proceed; substantial choices come to you.</p>
      </section>
      <section style={card} aria-labelledby="critique-current">
        <h2 id="critique-current" style={{ ...heading, fontSize: 23 }}>Where we are · Books & Yours</h2>
        <p style={{ margin: 0 }}>Batch 01 · Books and Yours are in progress. Sky, Read and Listen’s earlier repairs stay live. The accepted design and every tool stay.</p>
        <p style={{ fontSize: 14 }}><strong>This build:</strong> classics reappear in Continue reading and open their exact edition. Planner returns find the actual club pick, including older ones. Missing books stay honestly missing.</p>
        <p style={{ fontSize: 14 }}><strong>Your words:</strong> private notes confirm storage before saying “Kept”. Failed saves keep the draft. Hunches wait for acknowledgement. The room button now tells the truth: direct sharing still needs wiring.</p>
        <p style={{ fontSize: 14 }}><strong>Less repeated work:</strong> classic continuation reuses the loaded catalogue. Private note confirmation needs no remote call. Each Gutenberg fetch now cancels at its deadline, including a stalled download.</p>
        <p style={{ fontSize: 14 }}><strong>Reader controls:</strong> notes and settings keep their own keys and gestures. Long passages have a real scroll escape, margins change on phones, and a fresh daily read starts at chapter one after midnight too.</p>
        <p style={{ fontSize: 14 }}><strong>8 October · opened tools:</strong> leaving Lifestyle puts its reader and book chooser to sleep. Return to the same place and choices. Saves check the current shelf before saying “Kept”; confirmed removal brings you back to Yours.</p>
        <details><summary style={{ cursor: "pointer", minHeight: 44 }}>Why this repair</summary><p style={{ fontSize: 14 }}>The reader and chooser could cover Today after Back. A detail save could miss a newer keep. These are functional repairs; the remaining popup designs still need their own pass.</p><p style={{ fontSize: 14 }}>Back/Forward, delayed page turns, settings and failed saves have controlled checks. Phone release reproof is recorded separately. No extra chapter download or paid AI/function call; saves use fresh database reads. Simultaneous writes from two devices remain a limit.</p><a href="https://react.dev/reference/react-dom/createPortal" style={action} target="_blank" rel="noreferrer">React · overlays and their page</a></details>
        <details><summary style={{ cursor: "pointer", minHeight: 44 }}>Earlier repairs stay</summary><p style={{ fontSize: 14 }}>Shared recommendations, recoverable keeps, exact reader saves and all 47 Little Women chapters remain. Every word, shelf tool and page control stays.</p></details>
        <p style={{ fontSize: 14 }}>Independent source and regression checks pass. Release verification covers actual 360, 390 and 430px journeys; failures and account changes use controlled tests. Reader, reflection and club design work remains open.</p>
        <p style={{ fontSize: 14 }}>Physical iPhone, VoiceOver and opening an external episode window remain unverified.</p>
        <a href="/Lifestyle?section=books" style={action}>Open Books</a>{" · "}<a href="/Lifestyle?section=yours" style={action}>Open Yours</a>
      </section>
      <section style={card} aria-labelledby="critique-batch">
        <h2 id="critique-batch" style={{ ...heading, fontSize: 23 }}>Next big build</h2>
        <p style={{ margin: 0 }}><strong>Batch 01 · Lifestyle polish & connections</strong></p>
        <p style={{ fontSize: 14 }}>Finish Books and Yours’s opened surfaces: reader, notes, club, details and pickers. Carry the accepted design through loading, errors and Back. Then Good life, the shared shell and cross-app proof.</p>
        <details><summary style={{ cursor: "pointer", minHeight: 44 }}>The reader preview</summary><p style={{ fontSize: 14 }}>An open reading page, with a note slipped into its margin. White ground, clear tools, one genuine bookmark ribbon. Full words, exact place and every preference stay. Opening Reflect adds no new download.</p><a href="/ReaderMarginDemo?gutenberg_id=37106" style={action}>Try the reader &amp; margin note</a><p style={{ fontSize: 14 }}>An opt-in study using the real book and notes. Reading preferences are shared with your usual reader; its main layout stays. Functional page-fit repairs also protect the current reader.</p><details><summary style={{ cursor: "pointer", minHeight: 44 }}>Checks and limits</summary><p style={{ fontSize: 14 }}>Reader, notes and settings use actual mobile taps, exact source returns and independent review. Storage failures, warnings, support and locked chapters also have controlled tests; their complete native state coverage remains open. Physical iPhone and VoiceOver checks still need doing. Club sharing is held at the decision desk.</p></details></details>
        <p style={{ fontSize: 14 }}><strong>The whole journey gets the same care.</strong> Popups, overlays and details must belong to their room. Burnt styling goes; unfinished older builds join the catch-up pass. Features and each section’s personality stay.</p>
        <p style={{ fontSize: 14 }}>This rule is now in the cycle. The actual surface migrations are queued, including earlier rooms whose functional repairs are already complete.</p>
        <ol style={{ paddingLeft: 23, fontSize: 14 }}>{buildStages.map((stage) => <li key={stage} style={{ padding: "5px 0" }}>{stage}</li>)}</ol>
        <p style={{ fontSize: 14 }}>Then Community & DM, followed by the remaining app. New substantial features stay in Ideas for your go-ahead.</p>
        <a href="/staged-builds/index.html" style={action}>Open the rolling build plan</a>
      </section>
      <section style={card} aria-labelledby="critique-growth">
        <h2 id="critique-growth" style={{ ...heading, fontSize: 23 }}>Room to grow. Bills that behave.</h2>
        <p style={{ margin: 0 }}>Cost and capacity now belong in every build, including a review of older work. We keep the features and artwork; cut repeated work.</p>
        <p style={{ fontSize: 14 }}>Database traffic affects speed and limits. AI, media and other services need separate cost checks. Actual bills and supported user numbers still need real usage evidence.</p>
        <details><summary style={{ cursor: "pointer", minHeight: 44 }}>The checks behind it</summary><p style={{ fontSize: 14 }}>Queries, complete history, owner-safe reuse, bytes, paid calls, retries and scheduled work. Current priorities: shared feeds and keeps, book fetching, audio progress, older bundled documents and reminder fan-out.</p><p style={{ fontSize: 14 }}>One live app script measured 3.17 MB compressed. The whole app’s transfer and actual invoices still need measuring.</p><a href="https://docs.base44.com/Account-and-billing/Credits" target="_blank" rel="noreferrer" style={action}>Base44’s billing rules</a></details>
      </section>
      <section style={card} aria-labelledby="critique-decisions">
        <h2 id="critique-decisions" style={{ ...heading, fontSize: 23 }}>Your decision desk</h2>
        <p style={{ margin: 0 }}><strong>Chapter notes → the club.</strong> Private Keep stays. Direct sharing needs a real destination, so this addition is staged.</p>
        <p style={{ fontSize: 14 }}><strong>Recommended:</strong> Add to the room → choose a reached checkpoint for this exact book → preview your words and destination → Post. Cancel returns to the same reading place. Existing club moderation and spoiler gates stay.</p>
        <p style={{ fontSize: 14 }}><strong>Smaller alternative:</strong> open the exact club discussion and paste a note there. Less building, more switching.</p>
        <p style={{ fontSize: 14 }}>No automatic post, age confirmation or private-context attachment. This proposal awaits your choice. Earlier reading-nudge and backlog choices remain held.</p>
      </section>
      <details style={card}>
        <summary style={{ cursor: "pointer", minHeight: 44, fontWeight: 600, display: "list-item" }}>What gets a close look</summary>
        <p style={{ fontSize: 14 }}>Whole-page beauty and voice. Real taps and reading effort. Loading, errors and recovery. Owned data, backend wiring and exact returns. Connections across the app. Accessibility and performance.</p>
        <p style={{ fontSize: 14 }}>We follow each button into its sheet, menu or detail, then back. The same inventory, research, design and independent checks apply there. Shared changes must protect every room that uses them.</p>
        <p style={{ fontSize: 14 }}>Mobile checks use 360, 390 and 430px. Satisfaction needs actual feedback; a test count cannot tell us she loves a page.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}><Search size={17} aria-hidden="true" /> Research starts with the real feature</div>
        {links.map(([label, href]) => <div key={href}><a href={href} target="_blank" rel="noreferrer" style={{ ...action, fontSize: 14 }}>{label}</a></div>)}
        <p style={{ fontSize: 12 }}>Starting references checked 7 October 2026. Each section adds specific research and evidence to the audit memory.</p>
      </details>
      <details style={card}>
        <summary style={{ cursor: "pointer", minHeight: 44, fontWeight: 600 }}>The route through the app</summary>
        <ol style={{ paddingLeft: 23, marginBottom: 0, fontSize: 14 }}>{stages.map((stage) => <li key={stage} style={{ padding: "5px 0" }}>{stage}</li>)}</ol>
        <p style={{ fontSize: 14 }}>A section can take several runs. Regressions take priority; new live rooms join the route as they are discovered.</p>
      </details>
      <p style={{ fontSize: 12, color: "#685434", marginTop: 20 }}>Local runs need the computer on and Codex running. The audit remembers evidence and your feedback; it does not train the model. Brand Bible §§10.5.20–23.</p>
    </article>
  );
}
