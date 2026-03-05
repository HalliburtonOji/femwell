import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, ChevronRight, Star } from "lucide-react";
import { createPageUrl } from "@/utils";

const TYPE_EMOJIS = {
  MEDITATION: "🧘",
  BREATHWORK: "🌬️",
  WORKOUT: "💪",
  MOBILITY: "🤸",
  GUIDE: "📖",
};

const TYPE_GRADIENTS = {
  MEDITATION: "from-purple-200 to-indigo-300",
  BREATHWORK: "from-sky-200 to-cyan-300",
  WORKOUT: "from-orange-200 to-rose-300",
  MOBILITY: "from-emerald-200 to-teal-300",
  GUIDE: "from-amber-200 to-yellow-300",
};

function BreathworkPlayer({ config }) {
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(0);
  const totalRounds = config?.rounds || 4;
  const inhale = config?.inhale_seconds || 4;
  const hold = config?.hold_seconds || 4;
  const exhale = config?.exhale_seconds || 6;

  const phases = [
    { name: "Inhale", duration: inhale, color: "text-sky-500" },
    ...(hold > 0 ? [{ name: "Hold", duration: hold, color: "text-purple-500" }] : []),
    { name: "Exhale", duration: exhale, color: "text-teal-500" },
  ];

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const phaseIdx = phases.findIndex((p) => p.name.toLowerCase() === phase.toLowerCase());
    if (phaseIdx === -1) return;
    const timer = setTimeout(() => {
      const next = phaseIdx + 1;
      if (next >= phases.length) {
        const nextRound = round + 1;
        if (nextRound >= totalRounds) { setPhase("done"); return; }
        setRound(nextRound);
        setPhase(phases[0].name.toLowerCase());
        setCount(phases[0].duration);
      } else {
        setPhase(phases[next].name.toLowerCase());
        setCount(phases[next].duration);
      }
    }, 1000);
    const countTimer = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => { clearTimeout(timer); clearInterval(countTimer); };
  }, [phase, round]);

  const start = () => { setPhase(phases[0].name.toLowerCase()); setCount(phases[0].duration); setRound(0); };
  const currentPhase = phases.find((p) => p.name.toLowerCase() === phase);
  const size = phase === "inhale" ? "scale-110" : phase === "exhale" ? "scale-90" : "scale-100";

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="text-sm text-gray-400 font-medium">Round {round + 1} of {totalRounds}</div>
      <div className={`w-36 h-36 rounded-full bg-gradient-to-br from-sky-200 to-teal-200 flex flex-col items-center justify-center transition-all duration-1000 shadow-xl ${size}`}>
        <p className={`text-lg font-bold ${currentPhase?.color || "text-gray-400"}`}>{phase === "idle" ? "Ready" : phase === "done" ? "Done ✓" : currentPhase?.name}</p>
        {phase !== "idle" && phase !== "done" && <p className="text-3xl font-bold text-gray-700">{count}</p>}
      </div>
      {phase === "idle" && <button onClick={start} className="btn-primary">Begin Breathwork</button>}
      {phase === "done" && <button onClick={start} className="btn-secondary">Repeat</button>}
      <div className="flex gap-4 text-xs text-gray-400">
        <span>Inhale {inhale}s</span>
        {hold > 0 && <span>Hold {hold}s</span>}
        <span>Exhale {exhale}s</span>
      </div>
    </div>
  );
}

export default function ContentPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [item, setItem] = useState(null);
  const [mediaAsset, setMediaAsset] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [mood, setMood] = useState(3);
  const [helped, setHelped] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!contentId) return;
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const items = await base44.entities.ContentItems.filter({ id: contentId });
      const found = items[0] || (await base44.entities.ContentItems.list("-created_date", 100)).find((i) => i.id === contentId);
      setItem(found);
      if (found?.primary_media_asset_id) {
        const assets = await base44.entities.MediaAssets.filter({ id: found.primary_media_asset_id });
        if (assets[0]) setMediaAsset(assets[0]);
      }
      const bks = await base44.entities.ContentBookmarks.filter({ user_id: u.id, content_id: contentId });
      setBookmarked(bks.length > 0);
      const hist = await base44.entities.ContentHistory.filter({ user_id: u.id, content_id: contentId });
      setCompleted(hist.length > 0);
      setLoading(false);
    })();
  }, [contentId]);

  const toggleBookmark = async () => {
    if (bookmarked) {
      const bks = await base44.entities.ContentBookmarks.filter({ user_id: user.id, content_id: contentId });
      if (bks[0]) await base44.entities.ContentBookmarks.delete(bks[0].id);
      setBookmarked(false);
    } else {
      await base44.entities.ContentBookmarks.create({ user_id: user.id, content_id: contentId, created_at: new Date().toISOString() });
      setBookmarked(true);
    }
  };

  const markComplete = async () => {
    await base44.entities.ContentHistory.create({
      user_id: user.id,
      content_id: contentId,
      completed_at: new Date().toISOString(),
      mood_after: mood,
      helped: helped ?? true,
    });
    setCompleted(true);
    setShowFeedback(false);
  };

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen femwell-gradient flex flex-col items-center justify-center gap-4 px-6">
      <p className="text-gray-500">Content not found.</p>
      <a href={createPageUrl("Explore")} className="btn-secondary">Back to Explore</a>
    </div>
  );

  const gradient = TYPE_GRADIENTS[item.content_type] || "from-rose-200 to-pink-200";

  return (
    <div className="min-h-screen femwell-gradient pb-10">
      <div className="max-w-md mx-auto">
        {/* Hero */}
        <div className={`relative h-56 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">{TYPE_EMOJIS[item.content_type]}</span>
          )}
          <div className="absolute inset-0 bg-black/20" />

          {/* Back button */}
          <button
            onClick={() => window.history.back()}
            className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className="absolute top-12 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
          >
            {bookmarked ? <BookmarkCheck className="w-4 h-4 text-rose-600" /> : <Bookmark className="w-4 h-4 text-gray-500" />}
          </button>
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-rose-500 uppercase tracking-wide">{item.content_type}</span>
              {completed && <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">✓ Completed</span>}
            </div>
            <h1 className="text-xl font-bold text-gray-800">{item.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {item.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration_minutes} min</span>}
              {item.level && <span className="capitalize">{item.level}</span>}
            </div>
          </div>

          {item.summary && <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>}

          {/* Breathwork player */}
          {item.play_mode === "GUIDED" && item.content_type === "BREATHWORK" && item.guided_config && (
            <div className="card-glass rounded-2xl p-4">
              <BreathworkPlayer config={item.guided_config} />
            </div>
          )}

          {/* Video embed */}
          {mediaAsset?.embed_url && item.play_mode === "VIDEO" && (
            <div className="rounded-2xl overflow-hidden aspect-video shadow-md">
              <iframe
                src={mediaAsset.embed_url}
                title={item.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}

          {/* Safety notes */}
          {item.safety_notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
              <p className="text-xs font-medium text-amber-600 mb-0.5">⚠️ Note</p>
              <p className="text-xs text-amber-700">{item.safety_notes}</p>
            </div>
          )}

          {/* Modifications */}
          {item.modifications && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3">
              <p className="text-xs font-medium text-teal-600 mb-0.5">🌿 Modifications</p>
              <p className="text-xs text-teal-700">{item.modifications}</p>
            </div>
          )}

          {/* Evidence */}
          {item.evidence_snippet && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3">
              <p className="text-xs font-medium text-purple-600 mb-0.5">📚 Evidence</p>
              <p className="text-xs text-purple-700">{item.evidence_snippet}</p>
            </div>
          )}

          {/* Mark complete */}
          {!completed && !showFeedback && (
            <button onClick={() => setShowFeedback(true)} className="btn-primary w-full">
              Mark as Complete
            </button>
          )}

          {showFeedback && (
            <div className="card-glass rounded-2xl p-4 space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm">How was it?</h3>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Mood after: <span className="font-bold text-rose-600">{mood}/5</span></label>
                <input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">Did this help?</label>
                <div className="flex gap-2">
                  {[{ v: true, l: "Yes 💚" }, { v: false, l: "Not really" }].map((opt) => (
                    <button
                      key={String(opt.v)}
                      onClick={() => setHelped(opt.v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        helped === opt.v ? "border-rose-400 bg-rose-50 text-rose-600" : "border-transparent bg-white/60 text-gray-600"
                      }`}
                    >{opt.l}</button>
                  ))}
                </div>
              </div>
              <button onClick={markComplete} className="btn-primary w-full">Save & Complete</button>
            </div>
          )}

          {completed && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <p className="text-emerald-600 font-semibold">✓ Completed</p>
              <p className="text-xs text-emerald-500 mt-0.5">Great work! Keep going.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}