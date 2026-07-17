import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useEntitlements from "../hooks/useEntitlements";
import { plusUnlocked } from "@/config/plusTier";
import SectionWrap from "../SectionWrap";

// ─────────────────────────────────────────────────────────────────────────────
// AtelierReading — Section 7 (paid hero).
//
// Two variants:
//   - Locked (hasAtelier === false): Plum Night card with attribution chip
//     "ATELIER · BACKED BY ASTRA COLE, MA, FAS" (D2), Fraunces title, italic
//     body, three-line specimen excerpt, CTA "Unlock the Atelier · £8.99/month"
//     calling stripeCheckout for the Plus subscription. When STRIPE_PLUS_PRICE_ID
//     is missing in env, stripeCheckout returns an error — we render with the
//     simulated=true flag and console.warn for the operator.
//
//   - Unlocked (hasAtelier === true): same shell, no CTA. Pulls the latest
//     AtelierLetters row where draft === false. If only a draft row exists for
//     the current month, shows the "Awaiting Astra's sign-off" banner.
//
// Operator panel: when user.is_operator === true, renders a small admin
// list of draft letters with "Publish letter" buttons.
//
// Attribution rule: always "Backed by Astra Cole, MA, FAS" — NEVER Skyfield
// (see H2_DECISIONS.md D2). Real ephemeris is H3 territory.
// ─────────────────────────────────────────────────────────────────────────────

const SPECIMEN_LINES = [
  "Two cycles ago Saturn was still pressing on you. This month it has moved on, and you'll feel the lift in your luteal days.",
  "The work is to let the lightness in without bracing for it. Notice how often you reach for the brace before the weight has actually arrived.",
  "If June asks anything of you, it'll be a small thing said clearly. Three years from now you'll remember the sentence, not the month.",
];

function currentMonthKey() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${m}`;
}

// ── Tiny HTML sanitiser ─────────────────────────────────────────────────────
// Allows a tight whitelist of tags suitable for the LLM's body_html output.
// Strips scripts, attributes (other than href on <a>), event handlers, and
// any tag not in ALLOWED. No external dependency.
const ALLOWED_TAGS = new Set([
  "p", "br", "h2", "h3", "h4",
  "strong", "b", "em", "i", "u",
  "ul", "ol", "li", "blockquote", "hr",
  "a",
]);

function sanitiseLetterHtml(html) {
  if (!html || typeof html !== "string") return "";
  // Strip scripts + styles completely.
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  // Strip on* event-handler attributes anywhere.
  out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)/gi, "");
  // Walk tags: keep allowed, drop everything else but preserve text.
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (match, tag, attrs) => {
    const tagLower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(tagLower)) return "";
    if (tagLower === "a") {
      // Keep only href, and only http(s)/mailto. Add rel + target.
      const hrefMatch = attrs.match(/\shref\s*=\s*"([^"]*)"/i)
        || attrs.match(/\shref\s*=\s*'([^']*)'/i);
      const raw = hrefMatch ? hrefMatch[1].trim() : "";
      const safe = /^(https?:|mailto:)/i.test(raw) ? raw : "";
      const isClose = match.startsWith("</");
      if (isClose) return "</a>";
      return safe
        ? `<a href="${safe}" rel="noopener noreferrer" target="_blank">`
        : "<a>";
    }
    // For all other allowed tags, drop attributes entirely.
    return match.startsWith("</") ? `</${tagLower}>` : `<${tagLower}>`;
  });
  return out;
}

export default function AtelierReading({ userId, user }) {
  const { hasAtelier, loading } = useEntitlements(userId);
  // Plus is PARKED until the sale window → the monthly letter is free for now.
  // Re-lock = set PLUS_PARKED false in src/config/plusTier.js. Nothing else.
  const unlocked = plusUnlocked(hasAtelier, !!user?.is_operator);
  const [letter, setLetter] = useState(null);     // published row (draft: false)
  const [draftRow, setDraftRow] = useState(null); // current-month draft row
  const [operatorDrafts, setOperatorDrafts] = useState([]);
  const [busyCheckout, setBusyCheckout] = useState(false);
  const isOperator = !!user?.is_operator;

  // Pull the latest published letter + any current-month draft.
  useEffect(() => {
    if (!userId) return undefined;
    if (!unlocked) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.AtelierLetters.filter(
          { user_id: userId }, "-created_at", 6,
        ).catch(() => []);
        if (cancelled) return;
        const published = (all || []).find((r) => r.draft === false) || null;
        const monthKey = currentMonthKey();
        const draft = (all || []).find(
          (r) => r.draft === true && r.month === monthKey,
        ) || null;
        setLetter(published);
        setDraftRow(draft);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [userId, unlocked, isOperator]);

  // Operator-only — list ALL draft rows (any user) so the operator can sign
  // off the monthly cron output. Only fetched when isOperator is true.
  useEffect(() => {
    if (!isOperator) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const drafts = await base44.entities.AtelierLetters.filter(
          { draft: true }, "-created_at", 25,
        ).catch(() => []);
        if (!cancelled) setOperatorDrafts(Array.isArray(drafts) ? drafts : []);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [isOperator]);

  if (loading) return null;

  const handleUnlock = async () => {
    if (busyCheckout) return;
    setBusyCheckout(true);
    try {
      const res = await base44.functions.invoke("stripeCheckout", {
        plan: "plus",
        return_to: "Horoscope",
      });
      const url = res?.data?.url || res?.url;
      if (url) {
        window.location.href = url;
      } else {
        // simulated path — env STRIPE_PLUS_PRICE_ID missing, function fell
        // through. Warn the operator + soft-fail the click. UI stays locked.
        console.warn(
          "[AtelierReading] simulated=true — STRIPE_PLUS_PRICE_ID missing in env."
            + " Checkout returned no URL.",
        );
        alert("Atelier checkout is being prepared. Try again shortly.");
      }
    } catch (err) {
      console.warn("[AtelierReading] checkout error (simulated render):", err?.message || err);
      alert("Atelier checkout is being prepared. Try again shortly.");
    } finally {
      setBusyCheckout(false);
    }
  };

  const handlePublish = async (rowId) => {
    try {
      await base44.entities.AtelierLetters.update(rowId, {
        draft: false,
        published_at: new Date().toISOString(),
      });
      setOperatorDrafts((prev) => prev.filter((r) => r.id !== rowId));
      // Refresh own card if the operator was reading their own letter.
      if (draftRow && draftRow.id === rowId) {
        setDraftRow(null);
        setLetter((prev) => prev || { ...draftRow, draft: false });
      }
    } catch (err) {
      console.warn("[AtelierReading] publish failed:", err?.message || err);
    }
  };

  // ── UNLOCKED variant ────────────────────────────────────────────────────
  if (unlocked) {
    // LC-2 (D6): AI-final for now — letters publish directly. No
    // "Awaiting Astra's sign-off" banner ever surfaces to the user.
    // If a current-month letter exists it renders; if not, the placeholder
    // line shows ("Your first Atelier letter will land...").
    return (
      <SectionWrap>
        <div style={shellStyle}>
        <p style={eyebrowStyle}>ATELIER &middot; BACKED BY ASTRA COLE, MA, FAS</p>

        {letter ? (
          <>
            <h2 style={titleStyle}>{letter.title}</h2>
            <div
              style={bodyHtmlStyle}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: sanitiseLetterHtml(letter.body_html) }}
            />
            <p style={signoffStyle}>&mdash; {letter.signed_by || "Astra Cole, MA, FAS"}</p>
          </>
        ) : (
          <p style={italicBodyStyle}>
            Your first Atelier letter will land on the 1st of next month. Astra writes one for you every month, signed by hand.
          </p>
        )}

        {isOperator && (
          <OperatorPanel drafts={operatorDrafts} onPublish={handlePublish} />
        )}
        </div>
      </SectionWrap>
    );
  }

  // ── LOCKED variant ──────────────────────────────────────────────────────
  return (
    <SectionWrap>
      <div style={shellStyle}>
      <p style={eyebrowStyle}>ATELIER &middot; BACKED BY ASTRA COLE, MA, FAS</p>
      <h2 style={titleStyle}>Your monthly letter from Astra is in the studio.</h2>
      <p style={italicBodyStyle}>
        Long-form, signed, sent on the first of every month. Built from your chart, your cycle, and the month&rsquo;s sky &mdash; not a template. Reads like a New Yorker science feature, not a horoscope.
      </p>
      <div style={specimenStyle}>
        {SPECIMEN_LINES.map((line, i) => (
          <p key={i} style={specimenLineStyle}>&ldquo;{line}&rdquo;</p>
        ))}
      </div>
      <button
        type="button"
        onClick={handleUnlock}
        disabled={busyCheckout}
        style={{ ...ctaStyle, opacity: busyCheckout ? 0.65 : 1 }}
      >
        <Lock size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
        <span>Unlock the Atelier &middot; &pound;8.99/month</span>
      </button>
      <p style={renewalStyle}>Renews monthly. Cancel anytime in Settings.</p>

      {isOperator && (
        <OperatorPanel drafts={operatorDrafts} onPublish={handlePublish} />
      )}
      </div>
    </SectionWrap>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Operator-only panel — visible when user.is_operator === true.
// Lists draft AtelierLetters rows with a Publish button that flips
// draft: false + sets published_at: now().
// ─────────────────────────────────────────────────────────────────────────────
function OperatorPanel({ drafts, onPublish }) {
  if (!drafts || drafts.length === 0) {
    return (
      <div style={operatorShellStyle}>
        <p style={operatorTitleStyle}>Operator &middot; Atelier drafts</p>
        <p style={operatorEmptyStyle}>No drafts awaiting sign-off.</p>
      </div>
    );
  }
  return (
    <div style={operatorShellStyle}>
      <p style={operatorTitleStyle}>Operator &middot; Atelier drafts ({drafts.length})</p>
      <ul style={operatorListStyle}>
        {drafts.map((row) => (
          <li key={row.id} style={operatorRowStyle}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={operatorRowTitleStyle}>{row.title || "(untitled)"}</p>
              <p style={operatorRowMetaStyle}>
                {row.month} &middot; user {String(row.user_id || "").slice(0, 8)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPublish(row.id)}
              style={operatorPublishBtnStyle}
            >
              Publish letter
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles — Plum Night palette, matches the rest of the Horoscope tab.
// ─────────────────────────────────────────────────────────────────────────────
const shellStyle = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 22,
  padding: "22px 22px 20px",
  marginTop: 24,
  color: "var(--cream, #FAF4EA)",
  background: "radial-gradient(circle at 30% 20%, #3a2a4c 0%, #221a2e 60%, #15101e 100%)",
  boxShadow: "0 2px 4px rgba(43,30,22,0.10), 0 12px 32px rgba(43,30,22,0.18)",
};
const eyebrowStyle = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.62)",
  margin: "0 0 10px",
};
const titleStyle = {
  fontWeight: 400,
  fontSize: 22,
  lineHeight: 1.25,
  color: "var(--cream, #FAF4EA)",
  margin: "0 0 12px",
  letterSpacing: "-0.005em",
};
const italicBodyStyle = {
  fontStyle: "italic",
  fontSize: 13.5,
  lineHeight: 1.6,
  color: "rgba(247,239,225,0.78)",
  margin: "0 0 14px",
};
const specimenStyle = {
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(245,230,211,0.05)",
  border: "1px dashed rgba(245,230,211,0.16)",
  marginBottom: 16,
};
const specimenLineStyle = {
  fontStyle: "italic",
  fontSize: 12.5,
  lineHeight: 1.55,
  color: "rgba(247,239,225,0.66)",
  margin: "0 0 6px",
};
const ctaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontWeight: 600,
  fontSize: 14,
  color: "var(--plum-deep, #2b1e16)",
  background: "rgba(232,196,208,0.92)",
  border: "none",
  borderRadius: 9999,
  padding: "12px 22px",
  cursor: "pointer",
  minHeight: 44,
  width: "100%",
  boxShadow: "0 2px 8px rgba(232,196,208,0.22)",
};
const renewalStyle = {
  fontSize: 10.5,
  color: "rgba(247,239,225,0.55)",
  margin: "10px 0 0",
  textAlign: "center",
};
const bodyHtmlStyle = {
  fontSize: 14,
  lineHeight: 1.65,
  color: "rgba(247,239,225,0.86)",
  margin: "0 0 14px",
};
const signoffStyle = {
  fontStyle: "italic",
  fontSize: 13,
  color: "rgba(247,239,225,0.72)",
  margin: "16px 0 0",
};

// Operator panel
const operatorShellStyle = {
  marginTop: 18,
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(0,0,0,0.20)",
  border: "1px dashed rgba(247,239,225,0.20)",
};
const operatorTitleStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.72)",
  margin: "0 0 8px",
};
const operatorEmptyStyle = {
  fontSize: 11,
  color: "rgba(247,239,225,0.55)",
  margin: 0,
};
const operatorListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const operatorRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 10px",
  borderRadius: 10,
  background: "rgba(247,239,225,0.04)",
};
const operatorRowTitleStyle = {
  fontSize: 13,
  color: "var(--cream, #FAF4EA)",
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const operatorRowMetaStyle = {
  fontSize: 10,
  color: "rgba(247,239,225,0.55)",
  margin: "2px 0 0",
};
const operatorPublishBtnStyle = {
  fontWeight: 600,
  fontSize: 11,
  color: "var(--cream, #FAF4EA)",
  background: "rgba(212,94,82,0.85)",
  border: "none",
  borderRadius: 9999,
  padding: "8px 14px",
  cursor: "pointer",
  flexShrink: 0,
};
