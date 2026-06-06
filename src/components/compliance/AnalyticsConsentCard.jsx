// AnalyticsConsentCard — Sprint 12 batch 1
//
// Drop-in for the Privacy section of /Settings. One opt-out toggle
// for anonymous analytics + a small "privacy@femwells.com" contact
// line + footer links to the Privacy Policy and Terms.
//
// Persists to UserProfile.analytics_consent (added to the live
// schema in the same commit). Default true on first read — opt-out
// model rather than opt-in to match the spec.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SettingsCard from "@/components/settings/SettingsCard";
import SettingsToggle from "@/components/settings/SettingsToggle";
import { Check, Mail } from "lucide-react";

export default function AnalyticsConsentCard({ user, profile, onProfileChange }) {
  const [consent, setConsent] = useState(profile?.analytics_consent !== false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConsent(profile?.analytics_consent !== false);
  }, [profile?.id, profile?.analytics_consent]);

  const save = async (next) => {
    if (!user) return;
    setConsent(next);
    setSaving(true);
    try {
      let updated;
      if (profile?.id) {
        updated = await base44.entities.UserProfile.update(profile.id, { analytics_consent: next });
      } else {
        updated = await base44.entities.UserProfile.create({
          user_id: user.id, user_email: user.email, analytics_consent: next,
        });
      }
      if (typeof onProfileChange === "function") {
        onProfileChange({ ...(profile || {}), ...updated, analytics_consent: next });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[analytics-consent] write FAILED:", e?.message || e);
      // Roll back optimistic state.
      setConsent(!next);
    } finally { setSaving(false); }
  };

  return (
    <SettingsCard
      title="Privacy & analytics"
      description="Choose how FemWell uses your data and find the policies."
      footer={
        saved ? (
          <span style={{ fontSize: 12, color: "#059669", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        ) : null
      }
    >
      <SettingsToggle
        label="Help improve FemWell"
        description="Share anonymous usage data to help us improve the app. You can turn this off any time."
        checked={consent}
        onChange={save}
        disabled={saving}
      />

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border, #D4C9B4)" }}>
        <p style={{
          display: "flex", alignItems: "center", gap: 8,
          margin: "0 0 6px",
          fontSize: 13, color: "var(--plum, #3A2C1A)",
          }}>
          <Mail className="w-3.5 h-3.5" />
          <span>Questions? Contact us at <strong>privacy@femwells.com</strong></span>
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "var(--mauve, #9B8B7A)", lineHeight: 1.55 }}>
          <Link to="/Privacy" style={{ color: "var(--plum, #3A2C1A)", textDecoration: "underline" }}>Privacy Policy</Link>
          {" · "}
          <Link to="/Terms" style={{ color: "var(--plum, #3A2C1A)", textDecoration: "underline" }}>Terms &amp; Conditions</Link>
        </p>
      </div>
    </SettingsCard>
  );
}
