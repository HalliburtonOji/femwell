import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Save, ExternalLink, CheckCircle, AlertCircle, Loader2, Youtube, Video } from "lucide-react";
import { createPageUrl } from "@/utils";

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function StatusBadge({ url }) {
  if (!url) return <span className="text-xs text-gray-400">Not set</span>;
  return (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <CheckCircle className="w-3 h-3" /> Set
    </span>
  );
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
  const [fields, setFields] = useState({
    embed_url: "",
    source_url: "",
    thumbnail_url: "",
    tags: "",
  });
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
      setFields({
        embed_url: item.embed_url || "",
        source_url: item.source_url || "",
        thumbnail_url: item.thumbnail_url || "",
        tags: item.tags || "",
      });
      setYtPreviewId(getYoutubeId(item.embed_url || ""));
    }
  }, [selectedKey, workoutItems]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleYoutubeUrl = (url) => {
    const id = getYoutubeId(url);
    setYtPreviewId(id);
    setFields((f) => ({
      ...f,
      embed_url: url,
      thumbnail_url: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : f.thumbnail_url,
    }));
  };

  const uploadVideo = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFields((f) => ({ ...f, source_url: file_url, embed_url: "" }));
      setYtPreviewId(null);
      showToast("Video uploaded");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setUploadingVideo(false);
    }
  };

  const uploadThumbnail = async (file) => {
    if (!file) return;
    setUploadingThumb(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFields((f) => ({ ...f, thumbnail_url: file_url }));
      showToast("Thumbnail uploaded");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      await base44.entities.ContentItems.update(selectedItem.id, {
        embed_url: fields.embed_url,
        source_url: fields.source_url,
        thumbnail_url: fields.thumbnail_url,
        tags: fields.tags,
        play_mode: "VIDEO",
      });
      showToast("Saved!");
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

  const previewUrl = ytPreviewId
    ? `https://www.youtube-nocookie.com/embed/${ytPreviewId}`
    : fields.source_url || null;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Video Manager</h1>
        <p className="text-sm text-gray-500 mb-6">Manage video content for workouts (yoga, pilates, etc.)</p>

        {/* Select */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Workout Session</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">— Choose a session —</option>
            {workoutItems.map((i) => (
              <option key={i.content_key} value={i.content_key}>
                {i.title}{i.tags ? ` (${i.tags})` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedKey && (
          <>
            {/* Video Source */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4">Video Source</h2>

              {/* YouTube URL */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube URL
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={fields.embed_url}
                  onChange={(e) => handleYoutubeUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                {ytPreviewId && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Valid YouTube URL — thumbnail auto-set
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Direct video upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-purple-500" /> Upload Video File
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors">
                    {uploadingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {uploadingVideo ? "Uploading…" : "Upload Video"}
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => uploadVideo(e.target.files[0])} disabled={uploadingVideo} />
                  </label>
                  <StatusBadge url={fields.source_url} />
                </div>
                {fields.source_url && !ytPreviewId && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{fields.source_url}</p>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4">Thumbnail</h2>

              {fields.thumbnail_url && (
                <img src={fields.thumbnail_url} alt="Thumbnail" className="w-full aspect-video object-cover rounded-xl mb-3" />
              )}

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Thumbnail URL (auto-filled for YouTube)"
                  value={fields.thumbnail_url}
                  onChange={(e) => setFields((f) => ({ ...f, thumbnail_url: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors whitespace-nowrap">
                  {uploadingThumb ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {uploadingThumb ? "Uploading…" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadThumbnail(e.target.files[0])} disabled={uploadingThumb} />
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <h2 className="font-semibold text-gray-800 mb-3">Tags</h2>
              <input
                type="text"
                placeholder="e.g. yoga, pilates, strength, stretching"
                value={fields.tags}
                onChange={(e) => setFields((f) => ({ ...f, tags: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated tags to categorise this workout.</p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                <h2 className="font-semibold text-gray-800 mb-3">Preview</h2>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe src={previewUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen title="Video Preview" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save"}
              </button>
              <a
                href={createPageUrl("ContentPlayer") + `?key=${selectedKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Preview in App
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}