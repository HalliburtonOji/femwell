import { useEffect, useMemo, useState } from "react";
import { Play } from "lucide-react";

function getYouTubeId(videoUrl) {
  const url = new URL(videoUrl);
  if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
  return url.searchParams.get("v");
}

export default function YouTubeVideoCard({ video }) {
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState(video.title || "");
  const [thumbnail, setThumbnail] = useState(video.thumbnail_url || "");
  const videoId = useMemo(() => getYouTubeId(video.url), [video.url]);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
  const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  useEffect(() => {
    if (video.title && video.thumbnail_url) return;
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(video.url)}&format=json`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title || video.title || "YouTube video");
        setThumbnail(data.thumbnail_url || fallbackThumbnail);
      });
  }, [video.url, video.title, video.thumbnail_url, fallbackThumbnail]);

  return (
    <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
      <div className="aspect-video bg-rose-50">
        {playing ? (
          <iframe
            src={embedUrl}
            title={title || "YouTube video"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="relative h-full w-full">
            <img src={thumbnail || fallbackThumbnail} alt={title || "YouTube video"} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <Play className="ml-1 h-6 w-6 text-rose-500" fill="currentColor" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="line-clamp-2 text-sm font-semibold text-gray-800">{title || "Loading title..."}</p>
        <p className="text-xs text-gray-400">YouTube</p>
      </div>
    </div>
  );
}