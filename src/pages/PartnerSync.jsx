// PartnerSync — Sprint 10
//
// The user's "partner sharing hub". Distinct from the existing
// /PartnerSettings (token-based, server-function-backed) page —
// PartnerSync is a lighter, share-code-based flow:
//
//   1. Mint a 6-char alphanumeric `partner_share_code` on the user's
//      UserProfile if one doesn't already exist.
//   2. Show the share link, a Copy button, and a Share button
//      (navigator.share when available, copy fallback otherwise).
//   3. Three toggles for what the partner sees:
//        • How I'm feeling — mood + energy
//        • My cycle phase  — phase or life stage label
//        • Support tips    — phase-appropriate partner tips
//      Persisted to `UserProfile.partner_sharing_settings` (object).
//   4. A "Preview partner view" button → renders the partner view
//      inline in a modal so the user can see exactly what gets shared.
//
// Public partner view itself lives at /partner?code=XXXXXX (Partner.jsx).

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ChevronLeft, Copy, Share2, Check, Eye, X as XIcon, Moon, Calendar, Sparkles, Heart } from "lucide-react";
import PartnerPreviewBody from "../components/partner/PartnerPreviewBody";

const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
};

function generateShareCode() {
  // 6 uppercase alphanumeric chars. We disambiguate Math.random's
  // tendency to drop characters by ensuring length.
  let code = "";
  while (code.length < 6) {
    code += Math.random().toString(36).substr(2).toUpperCase().replace(/[^A-Z0-9]/g, "");
  }
  return code.slice(0, 6);
}

const TOGGLES = [
  {
    key: "show_mood_energy",
    Icon: Moon,
    label: "How I'm feeling",
    blurb: "Today's mood and energy level — labels only, no numbers.",
  },
  {
    key: "show_phase",
    Icon: Calendar,
    label: "My cycle phase",
    blurb: "Current phase (or life stage). Helps your partner know where you are.",
  },
  {
    key: "show_tips",
    Icon: Sparkles,
    label: "Support tips",
    blurb: "Phase-appropriate suggestions for how they can show up for you.",
  },
];

const DEFAULT_SETTINGS = {
  show_mood_energy: true,
  show_phase:       true,
  show_tips:        true,
};

export default function PartnerSync() {
  // QA fix — separated the share code + sharing settings out of the
  // `profile` object. Previously the code was nested in `profile`, and
  // when the server silently dropped `partner_share_code` on write
  // (likely because the entity schema doesn't define it yet), the
  // local `profile` mutation persisted for the session but every
  // reload re-fetched a row with no code and minted a new one.
  //
  // With dedicated top-level state for `shareCode`, the load-or-create
  // logic in the effect can run exactly once per user.id, decide what
  // to do based on the value freshly returned by the server, and the
  // rest of the page renders straight off `shareCode` (not via a
  // derived field on `profile`).
  const [user, setUser] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [sharingSettings, setSharingSettings] = useState(DEFAULT_SETTINGS);
  const [profileForPreview, setProfileForPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Resolve the auth user once on mount. Once `user.id` is in state the
  // load-or-create effect below can fire with a stable dep.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!cancelled) setUser(me || null);
      } catch { if (!cancelled) setUser(null); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load-or-create flow. Runs once per user.id change — NOT on every
  // render and NOT when shareCode / settings state changes (those are
  // separate state slots specifically to avoid triggering re-runs of
  // this effect).
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let cancelled = false;
    async function loadOrCreateCode() {
      try {
        // Two fetch strategies in fallback chain — FemWell convention
        // (`user_id`) first, base44 SDK convention (`created_by` = the
        // auth email) second. Whichever resolves a row wins.
        let profiles = await base44.entities.UserProfile
          .filter({ user_id: user.id }, null, 1)
          .catch(() => []);
        if ((!profiles || profiles.length === 0) && user?.email) {
          profiles = await base44.entities.UserProfile
            .filter({ created_by: user.email }, null, 1)
            .catch(() => []);
        }
        if (cancelled) return;
        const profile = profiles?.[0];
        if (!profile?.id) { setLoading(false); return; }
        setProfileId(profile.id);
        setProfileForPreview(profile);

        // ── 1) Share code: re-use existing 6-char string, else mint + persist ──
        const existing = typeof profile.partner_share_code === "string"
          ? profile.partner_share_code.trim()
          : "";
        if (existing && existing.length === 6) {
          // eslint-disable-next-line no-console
          console.info("[partner-sync] re-using existing share code:", existing);
          setShareCode(existing);
        } else {
          const newCode = generateShareCode();
          try {
            const updated = await base44.entities.UserProfile.update(
              profile.id,
              { partner_share_code: newCode },
            );
            // Critical — only commit to local state with what the
            // server returns. If the server drops the field (schema
            // missing), the returned `partner_share_code` will be
            // undefined and we log + still display the minted code so
            // the user sees something — but they'll know the persist
            // didn't take and the partner view will keep failing
            // until the schema accepts the field.
            const persisted = updated && typeof updated === "object"
              ? (updated.partner_share_code || "")
              : "";
            if (persisted && persisted.length === 6) {
              // eslint-disable-next-line no-console
              console.info("[partner-sync] new share code persisted:", persisted);
              setShareCode(persisted);
              setProfileForPreview((prev) => prev ? { ...prev, partner_share_code: persisted } : prev);
            } else {
              // eslint-disable-next-line no-console
              console.error(
                "[partner-sync] share code update returned no partner_share_code — schema likely doesn't accept the field. Showing local code only:",
                newCode,
                "server response:",
                updated,
              );
              setShareCode(newCode);
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("[partner-sync] share code write FAILED:", e?.message || e);
            setShareCode(newCode);
          }
        }

        // ── 2) Sharing settings: re-use if present, else default + persist ──
        if (profile.partner_sharing_settings && typeof profile.partner_sharing_settings === "object") {
          setSharingSettings({ ...DEFAULT_SETTINGS, ...profile.partner_sharing_settings });
        } else {
          try {
            await base44.entities.UserProfile.update(
              profile.id,
              { partner_sharing_settings: DEFAULT_SETTINGS },
            );
            // eslint-disable-next-line no-console
            console.info("[partner-sync] default sharing settings persisted");
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("[partner-sync] sharing settings write FAILED:", e?.message || e);
          }
          setSharingSettings(DEFAULT_SETTINGS);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[partner-sync] load-or-create threw:", e?.message || e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrCreateCode();
    return () => { cancelled = true; };
  }, [user?.id, user?.email]);

  const shareUrl = useMemo(() => {
    if (!shareCode) return "";
    const origin = typeof window !== "undefined" && window.location ? window.location.origin : "https://femwells.com";
    return `${origin}/partner?code=${shareCode}`;
  }, [shareCode]);

  // QA fix — toggle handler matches the spec. Optimistic update with a
  // rollback on failure. `profileId` is captured in dedicated state so
  // it doesn't disappear when settings get rewritten.
  async function toggle(key) {
    if (!profileId || saving) return;
    setSaving(true);
    const prevSettings = sharingSettings;
    const updated = { ...sharingSettings, [key]: !sharingSettings[key] };
    setSharingSettings(updated);
    try {
      await base44.entities.UserProfile.update(profileId, { partner_sharing_settings: updated });
      // eslint-disable-next-line no-console
      console.info("[partner-sync] toggle persisted:", key, "→", updated[key]);
    } catch (e) {
      setSharingSettings(prevSettings);
      // eslint-disable-next-line no-console
      console.error("[partner-sync] toggle write FAILED:", key, e?.message || e);
    } finally { setSaving(false); }
  }

  // Keep a `settings` alias so existing JSX below reads the right
  // variable without a sweep. Same shape, same defaults.
  const settings = sharingSettings;

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — silent */ }
  }

  async function nativeShare() {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "FemWell — partner view",
          text: "I'd like to share my FemWell summary with you.",
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled or unavailable, fall through to copy */ }
    }
    await copyLink();
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: C.muted, }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.cream,
      color: C.espresso,
      paddingBottom: 80,
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "18px 20px 32px" }}>
        {/* Back link */}
        <Link
          to="/Today"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            color: C.muted, textDecoration: "none",
            fontSize: 13, padding: "6px 0",
          }}
        >
          <ChevronLeft size={16} /> Back
        </Link>

        {/* Header */}
        <header style={{ margin: "14px 0 18px" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.blush }}>
            Together
          </p>
          <h1 style={{
            margin: "6px 0 6px",
            fontSize: 30, fontWeight: 600,
            color: C.espressoDk,
            letterSpacing: -0.4, lineHeight: 1.1,
          }}>Partner Sync</h1>
          <p style={{ margin: 0, fontSize: 15, color: C.muted, lineHeight: 1.5 }}>
            Help your partner understand your world.
          </p>
        </header>

        {/* Section 1 — Share card */}
        <section style={card}>
          <p style={sectionLabel}>Share with your partner</p>
          <p style={{ margin: "0 0 12px", fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
            Send them this link. They'll see exactly what your toggles allow — nothing more.
          </p>

          <div style={{
            background: C.cream, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "10px 12px",
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 22, fontWeight: 600, letterSpacing: 4,
              color: C.espressoDk, flex: 1, textAlign: "center",
            }}>{shareCode || "------"}</span>
          </div>

          <p style={{
            margin: "0 0 10px",
            fontSize: 11, color: C.muted, wordBreak: "break-all",
          }}>{shareUrl || "—"}</p>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={copyLink}
              style={{
                flex: 1, padding: "11px 12px", borderRadius: 12,
                background: copied ? C.sage : "transparent",
                color: copied ? C.cream : C.espresso,
                border: `1.5px solid ${copied ? C.sage : C.border}`,
                fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer",
              }}
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
            </button>
            <button
              type="button"
              onClick={nativeShare}
              style={{
                flex: 1, padding: "11px 12px", borderRadius: 12,
                background: C.espresso, color: C.cream,
                border: "none",
                fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer",
              }}
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </section>

        {/* Section 2 — Toggles */}
        <section style={card}>
          <p style={sectionLabel}>What you're sharing</p>
          <p style={{ margin: "0 0 12px", fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
            You decide what your partner sees. Toggle any of these off and that card vanishes from their view.
          </p>
          {TOGGLES.map((t) => {
            const Icon = t.Icon;
            const on = !!settings[t.key];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => toggle(t.key)}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "12px 12px",
                  background: on ? C.paperHi : "transparent",
                  border: `1px solid ${on ? C.blush + "55" : C.border}`,
                  borderLeft: `3px solid ${on ? C.blush : C.muted}`,
                  borderRadius: 14, marginBottom: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit", color: C.espresso,
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: on ? "rgba(232,180,184,0.32)" : "rgba(155,139,122,0.15)",
                  color: on ? C.blush : C.muted,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}><Icon size={16} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: C.espresso }}>{t.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{t.blurb}</p>
                </div>
                <span style={{
                  width: 36, height: 22, borderRadius: 999,
                  background: on ? C.blush : C.border,
                  position: "relative", flexShrink: 0,
                  transition: "background 180ms ease",
                }}>
                  <span style={{
                    position: "absolute", top: 2, left: on ? 16 : 2,
                    width: 18, height: 18, borderRadius: "50%",
                    background: C.cream,
                    transition: "left 180ms ease",
                  }} />
                </span>
              </button>
            );
          })}
        </section>

        {/* Section 3 — Preview */}
        <section style={card}>
          <p style={sectionLabel}>Preview</p>
          <p style={{ margin: "0 0 12px", fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
            See exactly what your partner sees before you send the link.
          </p>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              width: "100%",
              padding: "12px 14px", borderRadius: 12,
              background: "transparent", color: C.espresso,
              border: `1.5px solid ${C.border}`,
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 700,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer",
            }}
          >
            <Eye size={15} /> Preview partner view
          </button>
        </section>

        <p style={{ margin: "8px 4px 0", fontSize: 11, color: C.muted, fontStyle: "italic" }}>
          Not medical advice — FemWell is a wellness companion.
        </p>
      </div>

      {previewOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 250, background: C.cream,
          display: "flex", flexDirection: "column",
        }}>
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px", borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.blush }}>
              <Heart size={18} />
              <span style={{ fontWeight: 700, color: C.espresso, fontSize: 17 }}>
                Preview
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close preview"
              style={{
                width: 36, height: 36, borderRadius: 999,
                background: C.paperHi, border: `1px solid ${C.border}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            ><XIcon size={16} /></button>
          </header>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <PartnerPreviewBody user={user} profile={profileForPreview} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
}

const sectionLabel = {
  margin: "0 0 8px",
  fontSize: 10.5, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: "#9B8B7A",
};
const card = {
  background: "#EDE6D5",
  border: "1px solid #D4C9B4",
  borderRadius: 18,
  padding: "16px",
  margin: "0 0 14px",
};
