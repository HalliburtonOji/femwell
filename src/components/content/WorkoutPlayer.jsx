import { useState } from "react";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import ManualCompleteButton from "../sessions/ManualCompleteButton";

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url) {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export default function WorkoutPlayer({ item, user }) {
  const [clicked, setClicked] = useState(false);
  const [modsOpen, setModsOpen] = useState(false);

  const embedUrl = item.embed_url || null;
  const ytId = getYoutubeId(embedUrl);
  const thumbUrl = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;

  let iframeSrc = embedUrl;
  if (ytId) {
    iframeSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&rel=0`;
  } else {
    const vimeoId = getVimeoId(embedUrl);
    if (vimeoId) iframeSrc = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1`;
  }

  if (!embedUrl) {
    return (
      <div className="rounded-2xl flex items-center justify-center aspect-video"
        style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
        <p style={{ color: "var(--mauve)", fontSize: 14 }}>No video available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video */}
      {!clicked ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer"
          style={{ backgroundColor: "#111" }} onClick={() => setClicked(true)}>
          {thumbUrl
            ? <img src={thumbUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
            : <div className="w-full h-full" style={{ backgroundColor: "#1a0a1a" }} />
          }
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.92)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
              <Play className="w-7 h-7 ml-1" style={{ color: "var(--rose-dust)" }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe src={iframeSrc} className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Workout" />
        </div>
      )}

      {/* Manual complete */}
      {user && (
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--plum)" }}>Mark as complete</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Log this session</p>
          </div>
          <ManualCompleteButton item={item} user={user} source="CONTENT_PLAYER" />
        </div>
      )}

      {/* Safety notes */}
      {item.safety_notes && (
        <div className="rounded-xl p-3" style={{ backgroundColor: "#FFF8EE", border: "1px solid #F5DFA8" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#7A5A20" }}>Safety notes</p>
          <p className="text-xs" style={{ color: "#7A5A20" }}>{item.safety_notes}</p>
        </div>
      )}

      {/* Modifications */}
      {item.modifications && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <button
            onClick={() => setModsOpen(o => !o)}
            className="w-full flex items-center justify-between p-3"
            style={{ backgroundColor: "var(--ivory-dark)" }}
          >
            <p className="text-xs font-semibold" style={{ color: "var(--plum)" }}>Easier options</p>
            {modsOpen ? <ChevronUp className="w-4 h-4" style={{ color: "var(--mauve)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--mauve)" }} />}
          </button>
          {modsOpen && (
            <div className="p-3" style={{ backgroundColor: "#EEF4FF", borderTop: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "#3D5A8A" }}>{item.modifications}</p>
            </div>
          )}
        </div>
      )}

      {/* Evidence note */}
      {item.evidence_note && (
        <p className="text-xs italic px-1" style={{ color: "var(--mauve)" }}>{item.evidence_note}</p>
      )}
    </div>
  );
}