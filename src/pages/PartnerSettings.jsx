import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Copy, Check, Trash2, Plus, Loader2, Users } from "lucide-react";

const PERMISSIONS = [
  { key: "cycle_phase", label: "Cycle phase", desc: "Current phase & weekly message" },
  { key: "mood", label: "Mood", desc: "Today's mood (emoji only)" },
  { key: "energy", label: "Energy", desc: "Today's energy (emoji only)" },
  { key: "programs", label: "Programs", desc: "Active program progress" },
];

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(18))).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PartnerSettings() {
  const [user, setUser] = useState(null);
  const [accesses, setAccesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [selectedPerms, setSelectedPerms] = useState(['cycle_phase', 'mood', 'energy']);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const items = await base44.entities.PartnerAccess.filter({ owner_user_id: u.id }).catch(() => []);
        setAccesses(items);
      } catch (err) {
        console.error("PartnerSettings init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const togglePerm = (key) => {
    setSelectedPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const createAccess = async () => {
    if (!partnerEmail.trim()) return;
    setCreating(true);
    const token = generateToken();
    const newAccess = await base44.entities.PartnerAccess.create({
      owner_user_id: user.id,
      partner_email: partnerEmail.trim(),
      access_token: token,
      permissions: selectedPerms,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    setAccesses(prev => [...prev, newAccess]);
    setPartnerEmail('');
    setSelectedPerms(['cycle_phase', 'mood', 'energy']);
    setShowForm(false);
    setCreating(false);
  };

  const deactivate = async (id) => {
    await base44.entities.PartnerAccess.update(id, { is_active: false });
    setAccesses(prev => prev.map(a => a.id === id ? { ...a, is_active: false } : a));
  };

  const copyLink = async (token, id) => {
    const link = `${window.location.origin}/PartnerView?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, marginBottom: 12, boxShadow: "var(--shadow-sm)" };
  const sLabel = { fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-10 pb-6">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--plum)" }} />
          </button>
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)" }}>Settings</p>
            <h1 className="fw-display" style={{ marginBottom: 2 }}>Partner</h1>
            <h2 className="fw-heading" style={{ marginBottom: 2 }}>Partner Access</h2>
            <p style={{ fontSize: 12, color: "var(--mauve)", }}>Share a read-only view with someone you trust</p>
          </div>
        </div>

        {/* Info banner */}
        <div style={{ ...card, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", padding: "16px 20px" }}>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--rose-dust)" }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", marginBottom: 4 }}>What partners can see</p>
              <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.6 }}>
                Only what you choose. Never symptoms, journal entries, or sexual health data — regardless of settings.
              </p>
            </div>
          </div>
        </div>

        {/* Create new */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl mb-4"
            style={{ backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            <Plus className="w-4 h-4" /> Create partner link
          </button>
        ) : (
          <div style={card}>
            <p style={{ ...sLabel, marginBottom: 14 }}>New partner link</p>
            <input
              value={partnerEmail}
              onChange={e => setPartnerEmail(e.target.value)}
              placeholder="Partner's email (for your reference)"
              style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 14px", fontSize: 14, color: "var(--plum)", background: "var(--ivory)", outline: "none", marginBottom: 16, boxSizing: "border-box" }}
            />
            <p style={{ ...sLabel, marginBottom: 10 }}>What to share</p>
            <div className="space-y-2 mb-5">
              {PERMISSIONS.map(p => (
                <button
                  key={p.key}
                  onClick={() => togglePerm(p.key)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                  style={{
                    backgroundColor: selectedPerms.includes(p.key) ? "var(--plum)" : "var(--ivory)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${selectedPerms.includes(p.key) ? 'rgba(255,255,255,0.6)' : 'var(--mauve)'}`, backgroundColor: selectedPerms.includes(p.key) ? 'rgba(255,255,255,0.25)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedPerms.includes(p.key) && <Check className="w-3 h-3" style={{ color: 'white' }} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: selectedPerms.includes(p.key) ? 'white' : 'var(--plum)', }}>{p.label}</p>
                    <p style={{ fontSize: 11, color: selectedPerms.includes(p.key) ? 'rgba(255,255,255,0.7)' : 'var(--mauve)', }}>{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "11px", borderRadius: 9999, border: "1.5px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 600, color: "var(--plum)", cursor: "pointer" }}>Cancel</button>
              <button onClick={createAccess} disabled={creating || !partnerEmail.trim()} style={{ flex: 1, padding: "11px", borderRadius: 9999, border: "none", backgroundColor: "var(--plum)", fontSize: 13, fontWeight: 600, color: "white", cursor: creating ? "default" : "pointer", opacity: creating || !partnerEmail.trim() ? 0.6 : 1 }}>
                {creating ? "Creating…" : "Create link"}
              </button>
            </div>
          </div>
        )}

        {/* Existing accesses */}
        {accesses.length > 0 && (
          <>
            <p style={{ ...sLabel, marginBottom: 10 }}>Your partner links</p>
            {accesses.map(access => (
              <div key={access.id} style={{ ...card, opacity: access.is_active ? 1 : 0.5 }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", }}>
                      {access.partner_email || "Unnamed partner"}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(access.permissions || []).map(p => (
                        <span key={p} style={{ fontSize: 11, fontWeight: 500, backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", borderRadius: 9999, padding: "2px 8px", }}>{p.replace('_', ' ')}</span>
                      ))}
                    </div>
                    {access.last_accessed_at && (
                      <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 6 }}>Last viewed: {new Date(access.last_accessed_at).toLocaleDateString('en-GB')}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, backgroundColor: access.is_active ? "var(--sage-subtle)" : "var(--ivory-dark)", color: access.is_active ? "var(--sage)" : "var(--mauve)", flexShrink: 0 }}>
                    {access.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                {access.is_active && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => copyLink(access.access_token, access.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                      style={{ backgroundColor: copiedId === access.id ? "var(--sage-subtle)" : "var(--ivory)", border: "1px solid var(--border)", color: copiedId === access.id ? "var(--sage)" : "var(--plum)", }}>
                      {copiedId === access.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === access.id ? "Copied!" : "Copy link"}
                    </button>
                    <button onClick={() => deactivate(access.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#FFF8F8", border: "1px solid #FCDCDC", color: "#D94F4F", }}>
                      <Trash2 className="w-3 h-3" /> Revoke
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {accesses.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <span style={{ fontSize: 40 }}>💜</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--plum)", marginTop: 12, marginBottom: 6 }}>No partner links yet</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", lineHeight: 1.6 }}>Share a read-only view with a partner, family member, or friend who supports you.</p>
          </div>
        )}
      </div>
    </div>
  );
}