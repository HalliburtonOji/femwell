import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Save, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

const ROLES = [
  { role: "MAIN",  label: "Main (Intro)", order: 1 },
  { role: "LOOP1", label: "Loop 1",       order: 2 },
  { role: "LOOP2", label: "Loop 2",       order: 3 },
  { role: "LOOP3", label: "Loop 3",       order: 4 },
];

const PLAYER_STYLES = ["BREATH_RING", "BREATH_WAVES", "BREATH_GLOW"];

const card = { backgroundColor: "var(--surface)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", marginBottom: 16 };
const inputStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--mauve)", marginBottom: 4 };

function StatusBadge({ url }) {
  if (!url) return <span style={{ fontSize: 11, color: "var(--mauve)" }}>Not uploaded</span>;
  return <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--sage)" }}><CheckCircle style={{ width: 12, height: 12 }} /> Uploaded</span>;
}

export default function BreathworkAudioManager() {
  const [user, setUser] = useState(null);
  const [breathItems, setBreathItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [segments, setSegments] = useState({});
  const [uploading, setUploading] = useState({});
  const [saving, setSaving] = useState(false);
  const [bulkFiles, setBulkFiles] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [itemFields, setItemFields] = useState({ target_seconds: 300, player_style: "BREATH_RING", accent_color: "#EAD7FF", breath_pattern_label: "", breath_safety_note: "" });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      if (u?.role === "admin") {
        const [bw, med] = await Promise.all([base44.entities.ContentItems.filter({ content_type: "BREATHWORK" }), base44.entities.ContentItems.filter({ content_type: "MEDITATION" })]);
        setBreathItems([...bw, ...med].sort((a, b) => a.title.localeCompare(b.title)));
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedKey) return;
    const item = breathItems.find((i) => i.content_key === selectedKey);
    setSelectedItem(item || null);
    if (item) setItemFields({ target_seconds: item.target_seconds || 300, player_style: item.player_style || "BREATH_RING", accent_color: item.accent_color || "#EAD7FF", breath_pattern_label: item.breath_pattern_label || "", breath_safety_note: item.breath_safety_note || "" });
    base44.entities.AudioSegments.filter({ content_key: selectedKey }).then((segs) => {
      const map = {};
      segs.forEach((s) => { map[s.segment_role] = s; });
      setSegments(map);
    });
  }, [selectedKey, breathItems]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const uploadAndSave = async (role, order, file) => {
    if (!file || !selectedKey) return;
    setUploading((u) => ({ ...u, [role]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const existing = segments[role];
      if (existing) { await base44.entities.AudioSegments.update(existing.id, { audio_url: file_url }); }
      else { await base44.entities.AudioSegments.create({ content_key: selectedKey, segment_role: role, audio_url: file_url, sort_order: order, is_active: true }); }
      const segs = await base44.entities.AudioSegments.filter({ content_key: selectedKey });
      const map = {};
      segs.forEach((s) => { map[s.segment_role] = s; });
      setSegments(map);
      showToast(`${role} uploaded`);
    } catch (e) { showToast(e.message, "error"); }
    finally { setUploading((u) => ({ ...u, [role]: false })); }
  };

  const handleBulkUpload = async () => {
    if (!bulkFiles || !selectedKey) return;
    setBulkUploading(true);
    const fileArr = Array.from(bulkFiles);
    for (const { role, label, order } of ROLES) {
      const pattern = role === "MAIN" ? /main/i : new RegExp(role.replace("LOOP", "Loop"), "i");
      const match = fileArr.find((f) => pattern.test(f.name));
      if (match) await uploadAndSave(role, order, match);
    }
    setBulkUploading(false);
    setBulkFiles(null);
    showToast("Bulk upload complete");
  };

  const handleSaveSettings = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try { await base44.entities.ContentItems.update(selectedItem.id, itemFields); showToast("Settings saved"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}><div className="w-8 h-8 rounded-full animate-spin" style={{ border: "4px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} /></div>;
  if (user.role !== "admin") return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}><p style={{ color: "var(--mauve)", fontSize: 14 }}>Admin access required.</p></div>;

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: "var(--ivory)" }}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white" style={{ backgroundColor: toast.type === "error" ? "#DC4C4C" : "var(--sage)" }}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--plum)" }}>Audio Manager</h1>
        <p className="text-sm mb-6" style={{ color: "var(--mauve)" }}>Upload and manage audio segments for breathwork and meditation sessions.</p>

        <div style={card}>
          <label style={labelStyle}>Select Breathwork / Meditation Session</label>
          <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} style={inputStyle}>
            <option value="">Choose a session</option>
            {breathItems.map((i) => <option key={i.content_key} value={i.content_key}>{i.title}</option>)}
          </select>
        </div>

        {selectedKey && (
          <>
            <div style={card}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--plum)" }}>Audio Segments</h2>
              <div className="space-y-3">
                {ROLES.map(({ role, label, order }) => (
                  <div key={role} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--ivory)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--plum)" }}>{label}</p>
                      <StatusBadge url={segments[role]?.audio_url} />
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }}>
                      {uploading[role] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {uploading[role] ? "Uploading..." : "Upload MP3"}
                      <input type="file" accept="audio/*" className="hidden" onChange={(e) => uploadAndSave(role, order, e.target.files[0])} disabled={uploading[role]} />
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--mauve)" }}>Replace All (bulk)</p>
                <p className="text-xs mb-2" style={{ color: "var(--mauve)", opacity: 0.7 }}>Select all 4 files at once. Files must be named: Main.mp3, Loop1.mp3, Loop2.mp3, Loop3.mp3</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg text-xs" style={{ border: "1px dashed var(--border)", color: "var(--mauve)" }}>
                    <Upload className="w-3 h-3" />
                    {bulkFiles ? `${bulkFiles.length} file(s) selected` : "Select files"}
                    <input type="file" accept="audio/*" multiple className="hidden" onChange={(e) => setBulkFiles(e.target.files)} />
                  </label>
                  {bulkFiles && (
                    <button onClick={handleBulkUpload} disabled={bulkUploading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: "var(--mauve)", color: "white", border: "none", cursor: "pointer", opacity: bulkUploading ? 0.5 : 1 }}>
                      {bulkUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {bulkUploading ? "Uploading..." : "Upload All"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={card}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--plum)" }}>Session Settings</h2>
              <div className="space-y-4">
                <div><label style={labelStyle}>Target Duration (seconds)</label><input type="number" value={itemFields.target_seconds} onChange={(e) => setItemFields((f) => ({ ...f, target_seconds: Number(e.target.value) }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Player Style</label><select value={itemFields.player_style} onChange={(e) => setItemFields((f) => ({ ...f, player_style: e.target.value }))} style={inputStyle}>{PLAYER_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div>
                  <label style={labelStyle}>Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={itemFields.accent_color} onChange={(e) => setItemFields((f) => ({ ...f, accent_color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer" style={{ border: "1px solid var(--border)" }} />
                    <input type="text" value={itemFields.accent_color} onChange={(e) => setItemFields((f) => ({ ...f, accent_color: e.target.value }))} style={{ ...inputStyle, flex: 1, width: "auto", fontFamily: "monospace" }} />
                  </div>
                </div>
                <div><label style={labelStyle}>Breath Pattern Label</label><input type="text" placeholder="e.g. 4-7-8 Breathing" value={itemFields.breath_pattern_label} onChange={(e) => setItemFields((f) => ({ ...f, breath_pattern_label: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Safety Note</label><textarea rows={3} placeholder="Optional safety or contraindication note..." value={itemFields.breath_safety_note} onChange={(e) => setItemFields((f) => ({ ...f, breath_safety_note: e.target.value }))} style={{ ...inputStyle, resize: "none" }} /></div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Settings"}
                </button>
                <a href={createPageUrl("ContentPlayer") + `?key=${selectedKey}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)", textDecoration: "none" }}>
                  <ExternalLink className="w-4 h-4" /> Preview
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}