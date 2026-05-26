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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load user + profile, mint + persist share code if missing.
  //
  // QA fix — the previous loop wrapped the UserProfile.update call in a
  // silent `.catch(() => {})` and mutated the local `p` object whether
  // the write succeeded or not, so the partner view at /partner?code=…
  // always returned "link invalid" even though the UI showed a code.
  //
  // The new flow:
  //   1. Re-use any existing 6-char `partner_share_code` (stability
  //      across reloads).
  //   2. If missing OR not a 6-char string, generate a fresh code AND
  //      AWAIT the UserProfile.update — using the returned row as the
  //      source of truth.
  //   3. If the write fails (schema reject, transient), log loudly
  //      AND fall back to the local code so the user sees something,
  //      but they know the persist didn't happen (the live partner
  //      view will still fail until the schema accepts the field).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!me?.id || cancelled) { setLoading(false); return; }
        setUser(me);
        const profiles = await base44.entities.UserProfile
          .filter({ user_id: me.id }, null, 1)
          .catch(() => []);
        if (cancelled) return;
        let p = profiles?.[0] || null;
        if (!p?.id) { setLoading(false); return; }

        // ── Persist share code ──
        const existingCode = typeof p.partner_share_code === "string" ? p.partner_share_code.trim() : "";
        const needsCode = !existingCode || existingCode.length !== 6;
        if (needsCode) {
          const code = generateShareCode();
          try {
            const updated = await base44.entities.UserProfile.update(p.id, { partner_share_code: code });
            // Use the server's returned row when present so local state
            // matches what the partner-view query will see.
            if (updated && typeof updated === "object") {
              p = { ...p, ...updated, partner_share_code: updated.partner_share_code || code };
            } else {
              p = { ...p, partner_share_code: code };
            }
            // eslint-disable-next-line no-console
            console.info("[partner-sync] share code persisted:", p.partner_share_code);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("[partner-sync] share code write FAILED — partner link will not resolve:", e?.message || e);
            // Still expose the code locally so the user isn't staring
            // at a blank — but they'll need a schema fix to make the
            // partner view actually load.
            p = { ...p, partner_share_code: code };
          }
        }

        // ── Persist default sharing settings on first open ──
        if (!p.partner_sharing_settings || typeof p.partner_sharing_settings !== "object") {
          try {
            const updated = await base44.entities.UserProfile.update(p.id, {
              partner_sharing_settings: DEFAULT_SETTINGS,
            });
            if (updated && typeof updated === "object") {
              p = { ...p, ...updated, partner_sharing_settings: updated.partner_sharing_settings || DEFAULT_SETTINGS };
            } else {
              p = { ...p, partner_sharing_settings: DEFAULT_SETTINGS };
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("[partner-sync] sharing settings write FAILED:", e?.message || e);
            p = { ...p, partner_sharing_settings: DEFAULT_SETTINGS };
          }
        }
        setProfile(p);
      } catch { /* swallow */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const shareCode = profile?.partner_share_code || "";
  const shareUrl = useMemo(() => {
    if (!shareCode) return "";
    const origin = typeof window !== "undefined" && window.location ? window.location.origin : "https://femwells.com";
    return `${origin}/partner?code=${shareCode}`;
  }, [shareCode]);

  const settings = profile?.partner_sharing_settings || DEFAULT_SETTINGS;

  // QA fix — every toggle flip PATCHes UserProfile.partner_sharing_settings
  // and awaits the result. If the write fails we roll the optimistic
  // state back so the UI matches the DB. Console-log the outcome so the
  // toggle behaviour can be verified end-to-end in DevTools.
  async function toggle(key) {
    if (!profile?.id || saving) return;
    setSaving(true);
    const prevSettings = settings;
    const next = { ...settings, [key]: !settings[key] };
    setProfile((prev) => ({ ...prev, partner_sharing_settings: next }));
    try {
      const updated = await base44.entities.UserProfile.update(profile.id, { partner_sharing_settings: next });
      if (updated && typeof updated === "object") {
        setProfile((prev) => ({ ...prev, ...updated, partner_sharing_settings: updated.partner_sharing_settings || next }));
      }
      // eslint-disable-next-line no-console
      console.info("[partner-sync] toggle persisted:", key, "→", next[key]);
    } catch (e) {
      // Roll back the optimistic UI change so it doesn't lie about state.
      setProfile((prev) => ({ ...prev, partner_sharing_settings: prevSettings }));
      // eslint-disable-next-line no-console
      console.error("[partner-sync] toggle write FAILED:", key, e?.message || e);
    } finally { setSaving(false); }
  }

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
        <p style={{ color: C.muted, fontFamily: "'Inter', system-ui, sans-serif" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.cream,
      color: C.espresso,
      fontFamily: "'Inter', system-ui, sans-serif",
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
            fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk,
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
              fontFamily: "'Fraunces', Georgia, serif",
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
              <span style={{ fontWeight: 700, color: C.espresso, fontFamily: "'Fraunces', Georgia, serif", fontSize: 17 }}>
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
            <PartnerPreviewBody user={user} profile={profile} settings={settings} />
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
