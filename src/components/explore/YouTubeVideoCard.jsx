import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Play } from "lucide-react";

function getYouTubeId(videoUrl) {
  const url = new URL(videoUrl);
  if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
  return url.searchParams.get("v");
}

export default function YouTubeVideoCard({ video, bookmarked, onToggleBookmark }) {
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState(video.title || "");
  const [thumbnail, setThumbnail] = useState(video.thumbnail_url || "");
  const videoId = useMemo(() => video.video_id || getYouTubeId(video.url), [video.video_id, video.url]);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1&origin=${encodeURIComponent(window.location.origin)}`;
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
    <div className="overflow-hidden rounded-3xl border border-[#D8CFBC] bg-[#F4EFE3] shadow-sm">
      <div className="relative aspect-video bg-[#EDE7DA]">
        {playing ? (
          <iframe
            src={embedUrl}
            title={title || "YouTube video"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="relative h-full w-full">
            <img src={thumbnail || fallbackThumbnail} alt={title || "YouTube video"} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EFE3]/90 shadow">
                <Play className="ml-1 h-6 w-6 text-[#BC2E27]" fill="currentColor" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 text-sm font-semibold text-[#1A130C]">{title || "Loading title..."}</p>
          <button
            onClick={onToggleBookmark}
            className="flex-shrink-0 text-[#9B8B7A] hover:text-[#BC2E27] transition-colors"
            aria-label={bookmarked ? "Remove favorite" : "Add favorite"}
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-[#BC2E27]" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#4F473A]">YouTube</p>
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-[#BC2E27] hover:text-[#9A241F]"
          >
            Open on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}