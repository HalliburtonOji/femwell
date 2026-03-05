import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, Play, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { createPageUrl } from "@/utils";

const TYPE_EMOJIS = { MEDITATION: "🧘", BREATHWORK: "🌬️", WORKOUT: "💪", MOBILITY: "🤸", GUIDE: "📖" };
const TYPE_GRADIENTS = {
  MEDITATION: "from-purple-200 to-indigo-300",
  BREATHWORK: "from-sky-200 to-cyan-300",
  WORKOUT: "from-orange-200 to-rose-300",
  MOBILITY: "from-emerald-200 to-teal-300",
  GUIDE: "from-amber-200 to-yellow-300",
};

function BreathworkPlayer({ config, contentId, userId }) {
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(0);
  const audioRef = useRef(null);
  const totalRounds = config?.rounds || 4;
  const inhale = config?.inhale_seconds || 4;
  const hold = config?.hold_seconds || 4;
  const exhale = config?.exhale_seconds || 6;

  const phases = [
    { name: "inhale", label: "Inhale", duration: inhale, color: "text-sky-500" },
    ...(hold > 0 ? [{ name: "hold", label: "Hold", duration: hold, color: "text-purple-500" }] : []),
    { name: "exhale", label: "Exhale", duration: exhale, color: "text-teal-500" },
  ];

  const speakPhase = (label) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(label);
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const start = () => {
    setRound(0);
    setPhase(phases[0].name);
    setCount(phases[0].duration);
    speakPhase(phases[0].label);
  };

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const phaseIdx = phases.findIndex((p) => p.name === phase);
    if (phaseIdx === -1) return;
    if (count <= 0) {
      const next = phaseIdx + 1;
      if (next >= phases.length) {
        const nextRound = round + 1;
        if (nextRound >= totalRounds) { setPhase("done"); return; }
        setRound(nextRound);
        setPhase(phases[0].name);
        setCount(phases[0].duration);
        speakPhase(phases[0].label);
      } else {
        setPhase(phases[next].name);
        setCount(phases[next].duration);
        speakPhase(phases[next].label);
      }
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count, round]);

  const currentPhase = phases.find((p) => p.name === phase);
  const scale = phase === "inhale" ? "scale-110" : phase === "exhale" ? "scale-90" : "scale-100";

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="text-sm text-gray-400 font-medium">Round {round + 1} of {totalRounds}</div>
      <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-sky-200 to-teal-200 flex flex-col items-center justify-center transition-all duration-1000 shadow-xl ${scale}`}>
        <p className={`text-lg font-bold ${currentPhase?.color || "text-gray-400"}`}>
          {phase === "idle" ? "Ready" : phase === "done" ? "Done ✓" : currentPhase?.label}
        </p>
        {phase !== "idle" && phase !== "done" && <p className="text-4xl font-bold text-gray-700">{count}</p>}
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

function VideoPlayer({ asset, title }) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = asset.embed_url?.includes("youtube.com")
    ? asset.embed_url.replace("youtube.com", "youtube-nocookie.com")
    : asset.embed_url;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div className="relative aspect-video bg-gray-900">
        {!loaded && (
          <button
            onClick={() => setLoaded(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer group"
          >
            {asset.thumbnail_url && (
              <img src={asset.thumbnail_url} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
            )}
            <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <Play className="w-7 h-7 text-rose-600 ml-1" />
            </div>
            <p className="relative z-10 text-white text-sm font-medium opacity-80">Tap to play</p>
          </button>
        )}
        {loaded && (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden border border-rose-100">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-white/60 text-sm font-medium text-gray-700">
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-2 text-xs text-gray-600 leading-relaxed bg-white/40">{children}</div>}
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
  const [userPlan, setUserPlan] = useState("free");

  useEffect(() => {
    if (!contentId) return;
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [allItems, bks, hist, ents] = await Promise.all([
        base44.entities.ContentItems.list("-created_date", 200),
        base44.entities.ContentBookmarks.filter({ user_id: u.id, content_id: contentId }),
        base44.entities.ContentHistory.filter({ user_id: u.id, content_id: contentId }),
        base44.entities.Entitlements.filter({ user_id: u.id }),
      ]);
      const found = allItems.find((i) => i.id === contentId);
      setItem(found);
      if (found?.primary_media_asset_id) {
        const assets = await base44.entities.MediaAssets.list("-created_date", 200);
        const asset = assets.find((a) => a.id === found.primary_media_asset_id);
        if (asset) setMediaAsset(asset);
      }
      setBookmarked(bks.length > 0);
      setCompleted(hist.length > 0);
      if (ents[0]) setUserPlan(ents[0].plan || "free");
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
      user_id: user.id, content_id: contentId,
      completed_at: new Date().toISOString(), mood_after: mood, helped: helped ?? true,
    });
    setCompleted(true);
    setShowFeedback(false);
  };

  if (loading) return <div className="min-h-screen femwell-gradient flex items-center justify-center"><div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" /></div>;
  if (!item) return <div className="min-h-screen femwell-gradient flex flex-col items-center justify-center gap-4 px-6"><p className="text-gray-500">Content not found.</p><a href={createPageUrl("Explore")} className="btn-secondary">Back to Explore</a></div>;

  const tierOrder = { free: 0, plus: 1, pro: 2 };
  const planOrder = { free: 0, plus: 1, pro: 2 };
  const locked = (tierOrder[item.access_tier] || 0) > (planOrder[userPlan] || 0);
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
          <button onClick={() => window.history.back()} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={toggleBookmark} className="absolute top-12 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
            {bookmarked ? <BookmarkCheck className="w-4 h-4 text-rose-600" /> : <Bookmark className="w-4 h-4 text-gray-500" />}
          </button>
        </div>

        <div className="px-4 py-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-rose-500 uppercase tracking-wide">{item.content_type}</span>
              {completed && <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">✓ Completed</span>}
              {item.access_tier && item.access_tier !== "free" && (
                <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase">{item.access_tier}</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-800">{item.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {item.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration_minutes} min</span>}
              {item.level && <span className="capitalize">{item.level}</span>}
            </div>
          </div>

          {item.summary && <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>}

          {/* Locked overlay */}
          {locked ? (
            <div className="card-glass rounded-2xl p-6 text-center space-y-3">
              <Lock className="w-10 h-10 mx-auto text-rose-300" />
              <p className="font-semibold text-gray-700">This content requires {item.access_tier} plan</p>
              <a href={createPageUrl("Upgrade")} className="btn-primary inline-block">Upgrade to unlock</a>
            </div>
          ) : (
            <>
              {/* Breathwork player */}
              {item.content_type === "BREATHWORK" && item.guided_config && (
                <div className="card-glass rounded-2xl p-4">
                  <BreathworkPlayer config={item.guided_config} contentId={contentId} userId={user?.id} />
                </div>
              )}

              {/* Video */}
              {mediaAsset?.embed_url && item.play_mode === "VIDEO" && (
                <VideoPlayer asset={mediaAsset} title={item.title} />
              )}

              {/* Accordions */}
              {item.safety_notes && (
                <Accordion title="⚠️ Safety Notes">
                  {item.safety_notes}
                </Accordion>
              )}
              {item.modifications && (
                <Accordion title="🌿 Modifications">
                  {item.modifications}
                </Accordion>
              )}
              {item.evidence_snippet && (
                <Accordion title="📚 Evidence">
                  {item.evidence_snippet}
                </Accordion>
              )}

              {/* Mark complete */}
              {!completed && !showFeedback && (
                <button onClick={() => setShowFeedback(true)} className="btn-primary w-full">Mark as Complete</button>
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
                          className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${helped === opt.v ? "border-rose-400 bg-rose-50 text-rose-600" : "border-transparent bg-white/60 text-gray-600"}`}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}