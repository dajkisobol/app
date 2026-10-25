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
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--page)]/95 border-t border-[var(--line)] p-3 lg:p-4 shadow-2xl z-50 backdrop-blur-md">
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
          <div className="w-9 h-9 rounded-xl bg-[var(--mustard)]/10 border border-[var(--mustard)]/20 text-[var(--mustard-ink)] flex items-center justify-center font-bold text-sm">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-xs text-[var(--ink)] truncate">{title}</h4>
            <p className="text-[11px] text-[var(--muted)] truncate">{author} • <span className="text-[var(--sage-ink)] font-medium">{sourceName}</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 w-full md:w-1/2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 10;
              }}
              className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] rounded-lg transition-colors"
              title="-10 sec"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 bg-[var(--coral)] hover:bg-[var(--coral-hover)] text-[#293643] rounded-full transition-transform active:scale-95 shadow-sm flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={toggleSpeed}
              className="px-2 py-0.5 bg-[var(--surface-soft)] hover:bg-[var(--surface-hover)]/80 border border-[var(--line)]/60 rounded text-[10px] font-bold text-[var(--mustard-ink)]"
              title="Rychlost přehrávání"
            >
              {playbackRate}x
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full text-[10px] text-[var(--muted)] font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-[var(--mustard)] h-1 bg-[var(--surface-soft)] rounded-lg appearance-none cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="hidden md:flex items-center gap-1 text-[var(--muted)] hover:text-[var(--coral-ink)] text-xs font-medium transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
