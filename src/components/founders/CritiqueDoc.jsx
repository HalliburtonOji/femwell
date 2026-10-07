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
        <p style={{ fontSize: 14, margin: "9px 0 0" }}>The critic reports to Codex. Routine repairs get fixed and checked; substantial choices come to you.</p>
      </section>
      <section style={card} aria-labelledby="critique-current">
        <h2 id="critique-current" style={{ ...heading, fontSize: 23 }}>On the desk: Sky</h2>
        <p style={{ margin: 0 }}>First pass: daily lessons, kept sources and their return paths.</p>
        <p style={{ fontSize: 14 }}><strong>One small repair:</strong> clearer screen-reader structure for the lesson carousel. Same design, full lessons and controls.</p>
        <p style={{ fontSize: 14 }}>Existing lesson and Journal records connect to the exact source. No critical fault established in this reviewed path. This is one checked journey, not a whole-app sign-off.</p>
        <p style={{ fontSize: 14 }}><strong>Next:</strong> Sky’s day-change and failure states, then Read. Independent review and detailed evidence live in the audit memory.</p>
        <a href="/Lifestyle?section=sky" style={action}>Open the live Sky room</a>
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
      <p style={{ fontSize: 12, color: "#685434", marginTop: 20 }}>Local runs need the computer on and Codex running. The audit remembers evidence and your feedback; it does not train the model. Brand Bible §10.5.20.</p>
    </article>
  );
}
