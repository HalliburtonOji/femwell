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
];

// Sanitised founder summary only. Detailed evidence stays in claude-state/critique/.
// Do not import the ledger: bundled frontend content is publicly downloadable.
export default function CritiqueDoc() {
  const card = { padding: "18px 16px", border: "1px solid #D8CFBC", borderRadius: 18, background: "#F4EFE3", marginTop: 14 };
  const heading = { fontFamily: "Fraunces, Georgia, serif", fontWeight: 500, lineHeight: 1.2, margin: "0 0 10px", color: "#4A2A3A" };
  const action = { display: "inline-flex", alignItems: "center", minHeight: 44, color: "#72251F", textDecoration: "underline", textUnderlineOffset: 4 };
  return (
    <article aria-labelledby="critique-title" style={{ color: "#3A3025", fontFamily: "Inter, sans-serif", lineHeight: 1.55, overflowWrap: "anywhere", paddingBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#685434", fontSize: 12 }}><Sprout size={18} aria-hidden="true" /> Whole app · ongoing polish</div>
      <h1 id="critique-title" style={{ ...heading, fontSize: "clamp(28px, 7vw, 38px)", marginTop: 10 }}>A fresh pair of eyes.</h1>
      <p style={{ margin: 0 }}>One section, properly looked at. Then the next.</p>
      <section style={card} aria-label="Schedule">
        <div style={{ display: "flex", gap: 9, alignItems: "center", fontWeight: 600 }}><Clock3 size={19} aria-hidden="true" /> Every four hours · active</div>
        <p style={{ fontSize: 14, margin: "9px 0 0" }}>Work resumes its saved stage each run. No need to keep typing “continue”. Routine fixes proceed; substantial choices come to you.</p>
      </section>
      <section style={card} aria-labelledby="critique-current">
        <h2 id="critique-current" style={{ ...heading, fontSize: 23 }}>Where we are · Sky</h2>
        <p style={{ margin: 0 }}>Batch 01 · Sky reliability. The accepted design and every tool stay.</p>
        <p style={{ fontSize: 14 }}><strong>This pass:</strong> fresh Moon facts, safer day changes, retries that keep your open reading, and protection against late updates. Failed checks stop before another reading is made.</p>
        <p style={{ fontSize: 14 }}>Saved, Journal and Planner links keep the exact lesson edition—even when it’s unavailable. Earlier previews now show their place in the design history.</p>
        <p style={{ fontSize: 14 }}>Clock and response races have regression checks and independent source review. Live mobile recheck follows release; physical iPhone and VoiceOver remain unverified.</p>
        <p style={{ fontSize: 14 }}><strong>Next:</strong> Read’s full text and exit progress, then Listen’s resume and playback recovery.</p>
        <a href="/Lifestyle?section=sky" style={action}>Open the live Sky room</a>
      </section>
      <section style={card} aria-labelledby="critique-batch">
        <h2 id="critique-batch" style={{ ...heading, fontSize: 23 }}>Next big build</h2>
        <p style={{ margin: 0 }}><strong>Batch 01 · Lifestyle polish & connections</strong></p>
        <p style={{ fontSize: 14 }}>Sky is in release checks. Read and Listen follow, carrying earlier research, shipped fixes and open gaps forward.</p>
        <ol style={{ paddingLeft: 23, fontSize: 14 }}>{buildStages.map((stage) => <li key={stage} style={{ padding: "5px 0" }}>{stage}</li>)}</ol>
        <p style={{ fontSize: 14 }}>Then Community & DM, followed by the remaining app. New substantial features stay in Ideas for your go-ahead.</p>
        <a href="/staged-builds/index.html" style={action}>Open the rolling build plan</a>
      </section>
      <section style={card} aria-labelledby="critique-decisions">
        <h2 id="critique-decisions" style={{ ...heading, fontSize: 23 }}>Your decision desk</h2>
        <p style={{ margin: 0 }}>No new decision needed this time. Earlier reading-nudge and backlog choices remain held.</p>
      </section>
      <details style={card}>
        <summary style={{ cursor: "pointer", minHeight: 44, fontWeight: 600, display: "list-item" }}>What gets a close look</summary>
        <p style={{ fontSize: 14 }}>Whole-page beauty and voice. Real taps and reading effort. Loading, errors and recovery. Owned data, backend wiring and exact returns. Connections across the app. Accessibility and performance.</p>
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
      <p style={{ fontSize: 12, color: "#685434", marginTop: 20 }}>Local runs need the computer on and Codex running. The audit remembers evidence and your feedback; it does not train the model. Brand Bible §§10.5.20–21.</p>
    </article>
  );
}
