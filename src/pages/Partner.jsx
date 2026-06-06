// Partner — Sprint 10
//
// Public-ish read-only partner share view at /partner?code=XXXXXX.
//
// Looks up the UserProfile whose partner_share_code matches the URL
// param, then renders the shared cards via PartnerPreviewBody. If the
// query fails (no match, no auth, network), shows a warm error card
// rather than a stack trace.
//
// Note: this route is mounted OUTSIDE of <AuthenticatedApp /> so the
// auth-loading spinner doesn't gate the partner's access. base44's
// SDK may still require an authenticated session for the entity
// query — if the partner isn't logged in, the catch path explains
// what to do.

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Heart } from "lucide-react";
import PartnerPreviewBody from "../components/partner/PartnerPreviewBody";

const C = {
  cream:    "#F4EDDB",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  border:   "#D4C9B4",
  blush:    "#E8B4B8",
};

export default function Partner() {
  const [code, setCode] = useState("");
  const [profile, setProfile] = useState(null);
  const [shareUser, setShareUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const c = (params.get("code") || "").toUpperCase().trim();
    setCode(c);

    if (!c) {
      setError("no_code");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.UserProfile
          .filter({ partner_share_code: c }, null, 1)
          .catch(() => []);
        if (cancelled) return;
        const p = rows?.[0];
        if (!p) {
          setError("not_found");
          setLoading(false);
          return;
        }
        setProfile(p);
        // Resolve the share owner as a "user" stub so the cards can
        // query her DailyCheckins. We don't need their full auth user
        // object — just the id is enough for filter().
        setShareUser({ id: p.user_id, full_name: p.display_name || p.first_name || "" });
      } catch {
        if (!cancelled) setError("fetch_failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div style={shell}>
        <p style={{ color: C.muted, }}>Loading…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={shell}>
        <article style={errorCard}>
          <Heart size={22} style={{ color: C.blush, marginBottom: 8 }} />
          <h1 style={{
            margin: 0, fontSize: 20, fontWeight: 600,
            color: C.espresso,
            lineHeight: 1.2,
          }}>This link isn't valid or has expired.</h1>
          <p style={{ margin: "10px 0 0", fontSize: 13.5, color: C.muted, lineHeight: 1.55 }}>
            {error === "no_code"
              ? "The share link is missing the code. Ask whoever sent it for a fresh one."
              : error === "not_found"
              ? "We couldn't find an active FemWell sharing setup for this code."
              : "We couldn't open this view right now. Try again in a minute."}
          </p>
          <p style={{ margin: "14px 0 0", fontSize: 11.5, color: C.muted }}>
            FemWell helps women track their health across every life stage.
            Learn more at <span style={{ color: C.espresso, fontWeight: 600 }}>femwells.com</span>.
          </p>
        </article>
      </div>
    );
  }

  const settings = profile.partner_sharing_settings || {
    show_mood_energy: true,
    show_phase: true,
    show_tips: true,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      <div style={{ padding: "20px 16px 0", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted }}>FemWell</p>
        <h1 className="fw-display" style={{ margin: "4px 0 0" }}>Partner</h1>
      </div>
      <PartnerPreviewBody user={shareUser} profile={profile} settings={settings} />
    </div>
  );
}

const shell = {
  minHeight: "100vh",
  background: C.cream,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "24px",
};
const errorCard = {
  background: "#FBF6E6",
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: "22px 22px 20px",
  maxWidth: 420,
  textAlign: "center",
  };
