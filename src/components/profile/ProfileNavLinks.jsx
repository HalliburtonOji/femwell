import { ChevronRight, Heart, Activity, Bookmark, Ticket, CalendarDays, Stethoscope, Users, Settings, LogOut, Trash2, Feather } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", boxShadow: "var(--shadow-sm)" };
const bodyText = { fontSize: "14px", color: "var(--plum)", fontFamily: "'Inter', sans-serif" };
const mutedText = { fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" };
const rowItem = { display: "flex", alignItems: "center", gap: "12px", padding: "16px", width: "100%", textAlign: "left", backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "none" };
const iconBox = (bg) => ({ width: "34px", height: "34px", borderRadius: "10px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 });

export default function ProfileNavLinks({ profile, daysLoggedSkin, skinConditionMode }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      {/* Life Stage */}
      <a href={createPageUrl("LifeStageCare")} style={{ ...card, padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        <div style={iconBox("var(--ivory-dark)")}><Heart className="w-4 h-4" style={{ color: "var(--mauve)" }} /></div>
        <div className="flex-1">
          <p style={{ ...bodyText, fontWeight: 600 }}>Pregnancy & Menopause Support</p>
          <p style={mutedText}>Daily tracking, setup, and personal guidance</p>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
      </a>

      {/* Pulse */}
      <a href={createPageUrl("Pulse")} style={{ ...card, padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        <div style={iconBox("var(--rose-dust-subtle)")}><Activity className="w-4 h-4" style={{ color: "var(--rose-dust)" }} /></div>
        <div className="flex-1">
          <p style={{ ...bodyText, fontWeight: 600 }}>Pulse</p>
          <p style={mutedText}>Weekly summaries & pattern charts</p>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
      </a>

      {/* Skin & Hair */}
      <a href={createPageUrl("SkinHair")} style={{ ...card, padding: "16px", marginBottom: "16px", display: "block", textDecoration: "none" }}>
        <div className="flex items-center gap-3">
          <div style={iconBox("var(--rose-dust-subtle)")}><Feather className="w-4 h-4" style={{ color: "var(--rose-dust)" }} /></div>
          <div className="flex-1">
            <p style={{ ...bodyText, fontWeight: 600 }}>Skin & Hair</p>
            {daysLoggedSkin === 0 && <p style={mutedText}>Phase patterns, breakouts & shedding trends</p>}
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
        </div>
        {daysLoggedSkin > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            <span style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "3px 10px", fontFamily: "'Inter', sans-serif" }}>{daysLoggedSkin} days logged</span>
            {skinConditionMode && <span style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "3px 10px", fontFamily: "'Inter', sans-serif" }}>{skinConditionMode}</span>}
            {profile?.skin_type && <span style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "3px 10px", fontFamily: "'Inter', sans-serif" }}>{profile.skin_type} skin</span>}
          </div>
        )}
      </a>

      {/* Grid: Saved, Deals, Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {[
          { href: createPageUrl("Saved"),  icon: <Bookmark className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />, bg: "var(--rose-dust-subtle)", label: "Saved",  sub: "Advice, content & programs" },
          { href: createPageUrl("Deals"),  icon: <Ticket className="w-4 h-4" style={{ color: "#B89E6A" }} />,           bg: "#FFF8EE",                  label: "Deals",  sub: "Coupon codes and offers" },
          { href: createPageUrl("Events"), icon: <CalendarDays className="w-4 h-4" style={{ color: "var(--mauve)" }} />, bg: "var(--ivory-dark)",         label: "Events", sub: "Free and paid listings" },
        ].map(({ href, icon, bg, label, sub }) => (
          <a key={label} href={href} style={{ ...card, padding: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={iconBox(bg)}>{icon}</div>
            <div className="flex-1">
              <p style={{ ...bodyText, fontWeight: 600 }}>{label}</p>
              <p style={mutedText}>{sub}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Doctor Export */}
      <a href={createPageUrl("DoctorExport")} style={{ ...card, padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        <div style={iconBox("var(--sage-subtle)")}><Stethoscope className="w-4 h-4" style={{ color: "var(--sage)" }} /></div>
        <div className="flex-1">
          <p style={{ ...bodyText, fontWeight: 600 }}>Share with doctor</p>
          <p style={mutedText}>90-day health summary to screenshot or copy</p>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
      </a>

      {/* Partner access */}
      <a href={createPageUrl("PartnerSettings")} style={{ ...card, padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        <div style={iconBox("var(--rose-dust-subtle)")}><Users className="w-4 h-4" style={{ color: "var(--rose-dust)" }} /></div>
        <div className="flex-1">
          <p style={{ ...bodyText, fontWeight: 600 }}>Partner access</p>
          <p style={mutedText}>Share a gentle read-only view with someone you trust</p>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
      </a>

      {/* Redo Onboarding */}
      <a href="/Onboarding?mode=redo" style={{ ...card, padding: "16px", marginBottom: "16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        <div style={iconBox("var(--ivory-dark)")}><Settings className="w-4 h-4" style={{ color: "var(--mauve)" }} /></div>
        <div className="flex-1">
          <p style={{ ...bodyText, fontWeight: 600 }}>Redo Onboarding</p>
          <p style={mutedText}>Update goals and preferences</p>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
      </a>

      {/* Sign out */}
      <button onClick={async () => { await base44.auth.logout(); window.location.href = "/"; }}
        style={{ ...card, cursor: "pointer", border: "none", backgroundColor: "var(--surface)", padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
        <div style={iconBox("#FFF0F0")}><LogOut className="w-4 h-4" style={{ color: "#D94F4F" }} /></div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#D94F4F", fontFamily: "'Inter', sans-serif" }}>Sign out</p>
      </button>

      {/* Delete Account */}
      {!showDeleteConfirm ? (
        <button onClick={() => setShowDeleteConfirm(true)}
          style={{ ...card, cursor: "pointer", border: "1px solid #FCDCDC", backgroundColor: "#FFF8F8", padding: "16px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
          <div style={iconBox("#FFF0F0")}><Trash2 className="w-4 h-4" style={{ color: "#D94F4F" }} /></div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#D94F4F", fontFamily: "'Inter', sans-serif" }}>Delete account</p>
        </button>
      ) : (
        <div style={{ ...card, border: "1px solid #FCDCDC", backgroundColor: "#FFF8F8", padding: "20px", marginBottom: "32px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#D94F4F", fontFamily: "'Inter', sans-serif", marginBottom: "8px" }}>Are you sure?</p>
          <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: "16px" }}>
            This will permanently delete your profile, cycle data, check-ins, and all personalisation. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowDeleteConfirm(false)}
              style={{ flex: 1, padding: "11px", borderRadius: 9999, border: "1.5px solid var(--border)", backgroundColor: "var(--surface)", fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
              Cancel
            </button>
            <button disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  if (profile) await base44.entities.UserProfile.delete(profile.id);
                  await base44.auth.logout();
                  window.location.href = "/";
                } catch { setDeleting(false); }
              }}
              style={{ flex: 1, padding: "11px", borderRadius: 9999, border: "none", backgroundColor: "#D94F4F", fontSize: 13, fontWeight: 600, color: "white", fontFamily: "'Inter', sans-serif", cursor: deleting ? "default" : "pointer", opacity: deleting ? 0.6 : 1 }}>
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}