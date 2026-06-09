// DocKit — shared editorial primitives for the FoundersOS in-app plan mirrors
// (Community Plan / Whole-Life / Audio). Light, readable, cream/ink editorial —
// the dev-surface render of the claude-state plan docs. No emoji.

import React from "react";

export const D = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#F8F2E4",
  page:     "#ECE7DA",
  ink:      "#2E261B",
  inkSoft:  "#5b4f3e",
  plum:     "#4A2A3A",
  plumMid:  "#7B5E6B",
  rose:     "#C4849A",
  sage:     "#6B8F5A",
  gold:     "#A6862B",
  rule:     "rgba(58,44,26,0.12)",
};

const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif';
const SERIF = '"Cormorant Garamond","Georgia",serif';

export function DocShell({ children }) {
  return (
    <div style={{ background: D.page, padding: "8px 0 60px", fontFamily: SERIF, color: D.ink }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 18px" }}>{children}</div>
    </div>
  );
}

export function Eyebrow({ children, color = D.gold }) {
  return <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color, margin: "0 0 6px" }}>{children}</div>;
}

export function Title({ children, sub }) {
  return (
    <header style={{ margin: "10px 0 18px" }}>
      <h1 style={{ fontSize: 30, lineHeight: 1.15, margin: "0 0 6px", color: D.plum, fontWeight: 600 }}>{children}</h1>
      {sub && <p style={{ fontFamily: SANS, fontSize: 13.5, color: D.inkSoft, margin: 0, lineHeight: 1.5 }}>{sub}</p>}
    </header>
  );
}

export function H2({ children }) {
  return <h2 style={{ fontSize: 23, fontWeight: 600, color: D.plum, margin: "30px 0 6px", lineHeight: 1.2, borderBottom: `2px solid ${D.rule}`, paddingBottom: 5 }}>{children}</h2>;
}
export function H3({ children }) {
  return <h3 style={{ fontSize: 18, fontWeight: 600, color: D.ink, margin: "18px 0 2px" }}>{children}</h3>;
}
export function P({ children }) {
  return <p style={{ fontSize: 16, color: D.ink, lineHeight: 1.6, margin: "8px 0" }}>{children}</p>;
}

export function Card({ children, accent = D.gold }) {
  return <div style={{ background: D.paper, border: `1px solid ${D.rule}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "13px 16px", margin: "12px 0" }}>{children}</div>;
}

export function Bullets({ items, dot = D.gold }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "8px 0" }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "6px 0", fontSize: 15.5, color: D.ink, lineHeight: 1.5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: dot, marginTop: 9, flexShrink: 0 }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function Pull({ children }) {
  return <blockquote style={{ margin: "16px 0", padding: "14px 16px", background: D.cream, borderRadius: 10, borderLeft: `3px solid ${D.rose}`, fontStyle: "italic", fontSize: 17, color: D.plum, lineHeight: 1.5 }}>{children}</blockquote>;
}

export function Badge({ children, tone = "gold" }) {
  const bg = { red: "#BC2E27", amber: D.gold, green: D.sage, plum: D.plum }[tone] || D.gold;
  return <span style={{ display: "inline-block", borderRadius: 99, padding: "2px 9px", fontSize: 11.5, fontWeight: 700, fontFamily: SANS, color: "#fff", background: bg, whiteSpace: "nowrap" }}>{children}</span>;
}

export function Pills({ items }) {
  return (
    <div style={{ margin: "8px 0" }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-block", background: D.paperHi, border: `1px solid ${D.rule}`, borderRadius: 99, padding: "3px 11px", margin: "3px 4px 3px 0", fontSize: 13, fontFamily: SANS, color: D.inkSoft }}>{it}</span>
      ))}
    </div>
  );
}

// rows: array of arrays (first row = header)
export function Table({ rows }) {
  const [head, ...body] = rows;
  return (
    <div style={{ overflowX: "auto", margin: "12px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SANS, fontSize: 13.5 }}>
        <thead>
          <tr>{head.map((h, i) => <th key={i} style={{ textAlign: "left", padding: "7px 9px", background: D.paperHi, color: D.inkSoft, fontSize: 11.5, letterSpacing: ".5px", textTransform: "uppercase", borderBottom: `1px solid ${D.rule}` }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri}>{r.map((c, ci) => <td key={ci} style={{ padding: "7px 9px", borderBottom: `1px solid ${D.rule}`, color: D.ink, verticalAlign: "top" }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Foot({ children }) {
  return <div style={{ marginTop: 36, borderTop: `2px solid ${D.rule}`, paddingTop: 12, fontFamily: SANS, fontSize: 12.5, color: D.inkSoft }}>{children}</div>;
}
