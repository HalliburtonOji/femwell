import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PHASE_COLORS = {
  BREATHWORK: { from: "#e8a4b0", to: "#c97b8a", text: "#c97b8a" },
  MEDITATION: { from: "#a8c5d8", to: "#7a9fb8", text: "#5a82a0" },
  GUIDE: { from: "#b8d4c0", to: "#8fada0", text: "#6a9080" },
  WORKOUT: { from: "#f0c080", to: "#d4956a", text: "#b87040" },
  MOBILITY: { from: "#c8b8e0", to: "#9a85c0", text: "#7a60a8" },
};

function WaveAnimation({ playing, color }) {
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: 4,
            background: color,
            height: playing ? `${20 + Math.sin(i * 0.8) * 16}px` : "8px",
            animation: playing ? `wave-bar ${0.8 + i * 0.1}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.08}s`,
            opacity: playing ? 0.85 : 0.3,
            transition: "height 0.5s ease, opacity 0.5s ease",
          }}
        />
      ))}
      <style>{`
        @keyframes wave-bar {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.6); }
        }
      `}</style>
    </div>
  );
}

function BreathOrb({ playing, color, phase }) {
  const [scale, setScale] = useState(1);
  const [phaseLabel, setPhaseLabel] = useState("Breathe");
  const phaseRef = useRef(null);

  useEffect(() => {
    if (!playing) {
      setScale(1);
      setPhaseLabel("Ready");
      clearInterval(phaseRef.current);
      return;
    }
    // Simple 4-in, 4-hold, 6-out cycle for visual
    const CYCLE = [
      { label: "Inhale", scale: 1.35, duration: 4000 },
      { label: "Hold", scale: 1.35, duration: 4000 },
      { label: "Exhale", scale: 0.85, duration: 6000 },
    ];
    let idx = 0;
    const run = () => {
      const p = CYCLE[idx % CYCLE.length];
      setScale(p.scale);
      setPhaseLabel(p.label);
      idx++;
    };
    run();
    phaseRef.current = setInterval(run, 6000);
    return () => clearInterval(phaseRef.current);
  }, [playing]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Outer glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: "100%",
            height: "100%",
            background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
            transform: `scale(${playing ? scale * 1.1 : 1})`,
            transition: `transform ${playing ? 4 : 0.5}s ease-in-out`,
          }}
        />
        {/* Main orb */}
        <div
          className="rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{
            width: 80,
            height: 80,
            background: `radial-gradient(circle, ${color}cc 0%, ${color}88 100%)`,
            transform: `scale(${playing ? scale : 1})`,
            transition: `transform ${playing ? 4 : 0.5}s ease-in-out`,
            boxShadow: playing ? `0 0 30px ${color}66` : "none",
          }}
        >
          {playing ? phaseLabel : ""}
        </div>
      </div>
    </div>
  );
}

function PulseOrb({ playing, color }) {
  return (
    <div className="flex items-center justify-center w-36 h-36 relative">
      {playing && (
        <>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 60 + i * 22,
                height: 60 + i * 22,
                border: `2px solid ${color}`,
                opacity: 0.4 - i * 0.1,
                animation: `pulse-ring 2s ease-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </>
      )}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${color}cc, ${color}55)`,
          animation: playing ? "pulse-orb 2s ease-in-out infinite" : "none",
          boxShadow: playing ? `0 0 20px ${color}44` : "none",
        }}
      />
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes pulse-orb {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

export default function AudioPlayer({ item }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef(null);

  const colors = PHASE_COLORS[item?.content_type] || PHASE_COLORS.GUIDE;
  const isBreathwork = item?.content_type === "BREATHWORK";
  const isMeditation = item?.content_type === "MEDITATION";

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const resolveAudioUrl = async () => {
    const raw = item?.audio_file_url;
    if (!raw) return null;
    // script:// pointer — fetch actual audio from voiceTTS (which may return cached URL)
    if (raw.startsWith('script://')) {
      const scriptKey = raw.replace('script://', '');
      const res = await base44.functions.invoke('voiceTTS', {
        voice_script_key: scriptKey,
        content_key: item?.content_key || '',
      });
      return res.data?.audio_data_url || null;
    }
    // Plain https:// URL (directly uploaded audio file)
    return raw;
  };

  const handlePlayPause = async () => {
    if (finished) {
      // Restart
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setPlaying(true);
        setFinished(false);
      }
      return;
    }

    if (!audioRef.current) {
      if (!item?.audio_file_url) return;
      setLoading(true);
      const resolvedUrl = await resolveAudioUrl();
      if (!resolvedUrl) { setLoading(false); return; }
      const audio = new Audio(resolvedUrl);
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
        setLoading(false);
        audio.play();
        setPlaying(true);
      });

      audio.addEventListener("timeupdate", () => {
        setProgress(audio.currentTime / audio.duration);
      });

      audio.addEventListener("ended", () => {
        setPlaying(false);
        setFinished(true);
        setProgress(1);
      });

      audio.addEventListener("error", () => {
        setLoading(false);
      });
      return;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentTime = audioRef.current ? audioRef.current.currentTime : 0;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col items-center gap-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${colors.from}18 0%, ${colors.to}10 100%)`,
        border: `1px solid ${colors.from}44`,
      }}
    >
      {/* Ambient background */}
      {playing && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.from}22 0%, transparent 70%)`,
            animation: "ambient-pulse 3s ease-in-out infinite",
          }}
        />
      )}
      <style>{`
        @keyframes ambient-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Title */}
      <div className="text-center z-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: colors.text }}>
          {item?.content_type}
        </p>
        <h3 className="text-base font-semibold text-gray-800">{item?.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{item?.duration_minutes}m · {item?.level}</p>
      </div>

      {/* Animation */}
      <div className="z-10">
        {isBreathwork ? (
          <BreathOrb playing={playing} color={colors.from} />
        ) : isMeditation ? (
          <PulseOrb playing={playing} color={colors.from} />
        ) : (
          <WaveAnimation playing={playing} color={colors.from} />
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full z-10">
        <div
          className="w-full h-1 rounded-full cursor-pointer overflow-hidden"
          style={{ background: `${colors.from}33` }}
          onClick={(e) => {
            if (!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = ratio * audioRef.current.duration;
          }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={handlePlayPause}
        disabled={loading || !item?.audio_file_url}
        className="z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        }}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : finished ? (
          <RotateCcw className="w-6 h-6 text-white" />
        ) : playing ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white ml-0.5" />
        )}
      </button>

      {!item?.audio_file_url && (
        <p className="text-xs text-gray-400 z-10">Audio not yet generated</p>
      )}
    </div>
  );
}