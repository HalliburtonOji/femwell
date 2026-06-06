import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Save, ExternalLink, CheckCircle, AlertCircle, Loader2, Youtube, Video } from "lucide-react";
import { createPageUrl } from "@/utils";

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const card = { backgroundColor: "var(--surface)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", marginBottom: 16 };
const inputStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--mauve)", marginBottom: 4 };

function StatusBadge({ url }) {
  if (!url) return <span style={{ fontSize: 11, color: "var(--mauve)" }}>Not set</span>;
  return <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--sage)" }}><CheckCircle style={{ width: 12, height: 12 }} /> Set</span>;
}

export default function VideoManager() {
  const [user, setUser] = useState(null);
  const [workoutItems, setWorkoutItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [toast, setToast] = useState(null);
  const [fields, setFields] = useState({ embed_url: "", source_url: "", thumbnail_url: "", tags: "" });
  const [ytPreviewId, setYtPreviewId] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      if (u?.role === "admin") {
        const items = await base44.entities.ContentItems.filter({ content_type: "WORKOUT" });
        setWorkoutItems(items.sort((a, b) => a.title.localeCompare(b.title)));
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedKey) return;
    const item = workoutItems.find((i) => i.content_key === selectedKey);
    setSelectedItem(item || null);
    if (item) {
      setFields({ embed_url: item.embed_url || "", source_url: item.source_url || "", thumbnail_url: item.thumbnail_url || "", tags: item.tags || "" });
      setYtPreviewId(getYoutubeId(item.embed_url || ""));
    }
  }, [selectedKey, workoutItems]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleYoutubeUrl = (url) => {
    const id = getYoutubeId(url);
    setYtPreviewId(id);
    setFields((f) => ({ ...f, embed_url: url, thumbnail_url: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : f.thumbnail_url }));
  };

  const uploadVideo = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); setFields((f) => ({ ...f, source_url: file_url, embed_url: "" })); setYtPreviewId(null); showToast("Video uploaded"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setUploadingVideo(false); }
  };

  const uploadThumbnail = async (file) => {
    if (!file) return;
    setUploadingThumb(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); setFields((f) => ({ ...f, thumbnail_url: file_url })); showToast("Thumbnail uploaded"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setUploadingThumb(false); }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try { await base44.entities.ContentItems.update(selectedItem.id, { embed_url: fields.embed_url, source_url: fields.source_url, thumbnail_url: fields.thumbnail_url, tags: fields.tags, play_mode: "VIDEO" }); showToast("Saved"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}><div className="w-8 h-8 rounded-full animate-spin" style={{ border: "4px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} /></div>;
  if (user.role !== "admin") return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}><p style={{ color: "var(--mauve)", fontSize: 14 }}>Admin access required.</p></div>;

  const previewUrl = ytPreviewId ? `https://www.youtube-nocookie.com/embed/${ytPreviewId}` : fields.source_url || null;

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: "var(--ivory)" }}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white" style={{ backgroundColor: toast.type === "error" ? "#DC4C4C" : "var(--sage)" }}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-10">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--plum)" }}>Video Manager</h1>
        <p className="text-sm mb-6" style={{ color: "var(--mauve)" }}>Manage video content for workouts (yoga, pilates, etc.)</p>

        <div style={card}>
          <label style={labelStyle}>Select Workout Session</label>
          <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} style={inputStyle}>
            <option value="">Choose a session</option>
            {workoutItems.map((i) => <option key={i.content_key} value={i.content_key}>{i.title}{i.tags ? ` (${i.tags})` : ""}</option>)}
          </select>
        </div>

        {selectedKey && (
          <>
            <div style={card}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--plum)" }}>Video Source</h2>
              <div className="mb-4">
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 4 }}>
                  <Youtube style={{ width: 14, height: 14, color: "#DC4C4C" }} /> YouTube URL
                </label>
                <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={fields.embed_url} onChange={(e) => handleYoutubeUrl(e.target.value)} style={inputStyle} />
                {ytPreviewId && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--sage)" }}><CheckCircle style={{ width: 12, height: 12 }} /> Valid YouTube URL — thumbnail auto-set</p>}
              </div>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--mauve)" }}>OR</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
              </div>
              <div>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 4 }}>
                  <Video style={{ width: 14, height: 14, color: "var(--mauve)" }} /> Upload Video File
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }}>
                    {uploadingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {uploadingVideo ? "Uploading..." : "Upload Video"}
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => uploadVideo(e.target.files[0])} disabled={uploadingVideo} />
                  </label>
                  <StatusBadge url={fields.source_url} />
                </div>
                {fields.source_url && !ytPreviewId && <p className="text-xs mt-1 truncate" style={{ color: "var(--mauve)" }}>{fields.source_url}</p>}
              </div>
            </div>

            <div style={card}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--plum)" }}>Thumbnail</h2>
              {fields.thumbnail_url && <img src={fields.thumbnail_url} alt="Thumbnail" className="w-full aspect-video object-cover rounded-xl mb-3" />}
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Thumbnail URL (auto-filled for YouTube)" value={fields.thumbnail_url} onChange={(e) => setFields((f) => ({ ...f, thumbnail_url: e.target.value }))} style={{ ...inputStyle, flex: 1, width: "auto" }} />
                <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap" style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }}>
                  {uploadingThumb ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {uploadingThumb ? "Uploading..." : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadThumbnail(e.target.files[0])} disabled={uploadingThumb} />
                </label>
              </div>
            </div>

            <div style={card}>
              <h2 className="font-semibold mb-3" style={{ color: "var(--plum)" }}>Tags</h2>
              <input type="text" placeholder="e.g. yoga, pilates, strength, stretching" value={fields.tags} onChange={(e) => setFields((f) => ({ ...f, tags: e.target.value }))} style={inputStyle} />
              <p className="text-xs mt-1" style={{ color: "var(--mauve)" }}>Comma-separated tags to categorise this workout.</p>
            </div>

            {previewUrl && (
              <div style={card}>
                <h2 className="font-semibold mb-3" style={{ color: "var(--plum)" }}>Preview</h2>
                <div className="w-full aspect-video rounded-xl overflow-hidden" style={{ backgroundColor: "#000" }}>
                  <iframe src={previewUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen title="Video Preview" />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save"}
              </button>
              <a href={createPageUrl("ContentPlayer") + `?key=${selectedKey}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)", textDecoration: "none" }}>
                <ExternalLink className="w-4 h-4" /> Preview in App
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}