import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bookmark, BookmarkCheck, Heart, HeartOff } from "lucide-react";
import { format } from "date-fns";

export default function LifestyleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const [items, profiles] = await Promise.all([
        base44.entities.LifestyleItems.filter({ id }),
        base44.entities.UserProfile.filter({ user_id: user.id })
      ]);
      const nextProfile = profiles[0] || null;
      setItem(items[0] || null);
      setProfile(nextProfile);
      setProfileId(nextProfile?.id || null);
      setLiked((nextProfile?.liked_item_ids || []).includes(id));
      setSaved((nextProfile?.saved_item_ids || []).includes(id));
    })();
  }, [id]);

  const updateProfileField = async (field, value) => {
    if (!profileId) return;
    await base44.entities.UserProfile.update(profileId, { [field]: value });
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const toggleLiked = async () => {
    const current = profile?.liked_item_ids || [];
    const next = liked ? current.filter((itemId) => itemId !== id) : [...current, id];
    setLiked(!liked);
    await updateProfileField("liked_item_ids", next);
  };

  const toggleSaved = async () => {
    const current = profile?.saved_item_ids || [];
    const next = saved ? current.filter((itemId) => itemId !== id) : [...current, id];
    setSaved(!saved);
    await updateProfileField("saved_item_ids", next);
  };

  const handleReadFull = () => {
    try {
      if (!item?.source_url) return;
      window.open(item.source_url, "_blank");
    } catch {
      // do nothing
    }
  };

  if (!item) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)", color: "var(--mauve)" }}>Article not found</div>;
  }

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-3xl mx-auto px-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleLiked} className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
              {liked ? <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> : <HeartOff className="w-4 h-4 text-gray-500" />}
            </button>
            <button onClick={toggleSaved} className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
              {saved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>

        <div className="card-glass rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{item.title}</h1>
          <p className="mt-3 text-sm text-gray-400">
            {item.source_name} {item.pub_date ? `· ${format(new Date(item.pub_date), "dd MMM yyyy")}` : ""}
          </p>
          {item.summary && <p className="mt-6 text-base leading-8 text-gray-600">{item.summary}</p>}
          <button onClick={handleReadFull} className="mt-8 inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 transition-colors">
            Read full article
          </button>
        </div>
      </div>
    </div>
  );
}