import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Save, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

const ROLES = [
  { role: "MAIN", label: "Main (Intro)", order: 1 },
  { role: "LOOP1", label: "Loop 1", order: 2 },
  { role: "LOOP2", label: "Loop 2", order: 3 },
  { role: "LOOP3", label: "Loop 3", order: 4 },
];

const PLAYER_STYLES = ["BREATH_RING", "BREATH_WAVES", "BREATH_GLOW"];

function StatusBadge({ url }) {
  if (!url) return <span className="text-xs text-gray-400">Not uploaded</span>;
  return (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <CheckCircle className="w-3 h-3" /> Uploaded
    </span>
  );
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
  const [itemFields, setItemFields] = useState({
    target_seconds: 300,
    player_style: "BREATH_RING",
    accent_color: "#EAD7FF",
    breath_pattern_label: "",
    breath_safety_note: "",
  });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      if (u?.role === "admin") {
        const [bw, med] = await Promise.all([
          base44.entities.ContentItems.filter({ content_type: "BREATHWORK" }),
          base44.entities.ContentItems.filter({ content_type: "MEDITATION" }),
        ]);
        const items = [...bw, ...med];
        setBreathItems(items.sort((a, b) => a.title.localeCompare(b.title)));
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedKey) return;
    const item = breathItems.find((i) => i.content_key === selectedKey);
    setSelectedItem(item || null);
    if (item) {
      setItemFields({
        target_seconds: item.target_seconds || 300,
        player_style: item.player_style || "BREATH_RING",
        accent_color: item.accent_color || "#EAD7FF",
        breath_pattern_label: item.breath_pattern_label || "",
        breath_safety_note: item.breath_safety_note || "",
      });
    }
    base44.entities.AudioSegments.filter({ content_key: selectedKey }).then((segs) => {
      const map = {};
      segs.forEach((s) => { map[s.segment_role] = s; });
      setSegments(map);
    });
  }, [selectedKey, breathItems]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const uploadAndSave = async (role, order, file) => {
    if (!file || !selectedKey) return;
    setUploading((u) => ({ ...u, [role]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const existing = segments[role];
      if (existing) {
        await base44.entities.AudioSegments.update(existing.id, { audio_url: file_url });
      } else {
        await base44.entities.AudioSegments.create({
          content_key: selectedKey,
          segment_role: role,
          audio_url: file_url,
          sort_order: order,
          is_active: true,
        });
      }
      // Refresh
      const segs = await base44.entities.AudioSegments.filter({ content_key: selectedKey });
      const map = {};
      segs.forEach((s) => { map[s.segment_role] = s; });
      setSegments(map);
      showToast(`${role} uploaded`);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setUploading((u) => ({ ...u, [role]: false }));
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFiles || !selectedKey) return;
    setBulkUploading(true);
    const fileArr = Array.from(bulkFiles);
    for (const { role, label, order } of ROLES) {
      // match by filename pattern: Main, Loop1, Loop2, Loop3 (case-insensitive)
      const pattern = role === "MAIN" ? /main/i : new RegExp(role.replace("LOOP", "Loop"), "i");
      const match = fileArr.find((f) => pattern.test(f.name));
      if (match) {
        await uploadAndSave(role, order, match);
      }
    }
    setBulkUploading(false);
    setBulkFiles(null);
    showToast("Bulk upload complete");
  };

  const handleSaveSettings = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      await base44.entities.ContentItems.update(selectedItem.id, itemFields);
      showToast("Settings saved");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  if (user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Admin access required.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Breathwork Audio Manager</h1>
        <p className="text-sm text-gray-500 mb-6">Upload and manage audio segments for breathwork sessions.</p>

        {/* Select content item */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Breathwork Session</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">— Choose a session —</option>
            {breathItems.map((i) => (
              <option key={i.content_key} value={i.content_key}>{i.title}</option>
            ))}
          </select>
        </div>

        {selectedKey && (
          <>
            {/* Audio Segments */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4">Audio Segments</h2>

              <div className="space-y-3">
                {ROLES.map(({ role, label, order }) => (
                  <div key={role} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <StatusBadge url={segments[role]?.audio_url} />
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors">
                      {uploading[role]
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Upload className="w-3 h-3" />}
                      {uploading[role] ? "Uploading…" : "Upload MP3"}
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => uploadAndSave(role, order, e.target.files[0])}
                        disabled={uploading[role]}
                      />
                    </label>
                  </div>
                ))}
              </div>

              {/* Replace All */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Replace All (bulk)</p>
                <p className="text-xs text-gray-400 mb-2">Select all 4 files at once. Files must be named: Main.mp3, Loop1.mp3, Loop2.mp3, Loop3.mp3</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-600 text-xs hover:border-purple-300 hover:text-purple-600 transition-colors">
                    <Upload className="w-3 h-3" />
                    {bulkFiles ? `${bulkFiles.length} file(s) selected` : "Select files"}
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setBulkFiles(e.target.files)}
                    />
                  </label>
                  {bulkFiles && (
                    <button
                      onClick={handleBulkUpload}
                      disabled={bulkUploading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {bulkUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {bulkUploading ? "Uploading…" : "Upload All"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4">Session Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Target Duration (seconds)</label>
                  <input
                    type="number"
                    value={itemFields.target_seconds}
                    onChange={(e) => setItemFields((f) => ({ ...f, target_seconds: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Player Style</label>
                  <select
                    value={itemFields.player_style}
                    onChange={(e) => setItemFields((f) => ({ ...f, player_style: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {PLAYER_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={itemFields.accent_color}
                      onChange={(e) => setItemFields((f) => ({ ...f, accent_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={itemFields.accent_color}
                      onChange={(e) => setItemFields((f) => ({ ...f, accent_color: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Breath Pattern Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 4-7-8 Breathing"
                    value={itemFields.breath_pattern_label}
                    onChange={(e) => setItemFields((f) => ({ ...f, breath_pattern_label: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Safety Note</label>
                  <textarea
                    rows={3}
                    placeholder="Optional safety or contraindication note…"
                    value={itemFields.breath_safety_note}
                    onChange={(e) => setItemFields((f) => ({ ...f, breath_safety_note: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : "Save Settings"}
                </button>

                <a
                  href={createPageUrl("ContentPlayer") + `?key=${selectedKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
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