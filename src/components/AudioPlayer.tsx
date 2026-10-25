import React from 'react';
import { Play, Pause, Volume2, RotateCcw, FastForward } from 'lucide-react';

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

  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [streamUrl]);

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
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 p-4 shadow-2xl z-50">
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg shadow-md">
            🎧
          </div>
          <div className="truncate">
            <h4 className="font-semibold text-sm truncate">{title}</h4>
            <p className="text-xs text-slate-400 truncate">{author} • <span className="text-indigo-400 font-medium">{sourceName}</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 w-full md:w-1/2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime -= 10;
              }}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="-10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-transform active:scale-95 shadow-lg flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={toggleSpeed}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold text-indigo-300 transition-colors"
              title="Rychlost přehrávání"
            >
              {playbackRate}x
            </button>
          </div>

          <div className="flex items-center gap-2 w-full text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="hidden md:block text-slate-400 hover:text-white text-xs underline"
          >
            Zavřít přehrávač
          </button>
        )}
      </div>
    </div>
  );
}
