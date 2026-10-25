import React from 'react';
import { Play, Pause, RotateCcw, Volume2, X } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  author: string;
  streamUrl: string;
  sourceName: string;
  onClose?: () => void;
}

export default function AudioPlayer({ title, author, streamUrl, sourceName, onClose }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1.0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 border-t border-slate-800 p-3 lg:p-4 shadow-2xl z-50 backdrop-blur-md">
      <audio
        ref={audioRef}
        key={streamUrl}
        src={streamUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <div className="w-9 h-9 rounded-xl bg-[#f5b82e]/10 border border-[#f5b82e]/20 text-[#f5b82e] flex items-center justify-center font-bold text-sm">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-xs text-slate-100 truncate">{title}</h4>
            <p className="text-[11px] text-slate-400 truncate">{author} • <span className="text-[#68baaa] font-medium">{sourceName}</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 w-full md:w-1/2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 10;
              }}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
              title="-10 sec"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 bg-[#ef6453] hover:bg-[#d84e3d] text-white rounded-full transition-transform active:scale-95 shadow-sm flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={toggleSpeed}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded text-[10px] font-bold text-[#f5b82e]"
              title="Rychlost přehrávání"
            >
              {playbackRate}x
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full text-[10px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-[#f5b82e] h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="hidden md:flex items-center gap-1 text-slate-400 hover:text-[#ef6453] text-xs font-medium transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
