'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Pause, Play, RotateCcw, X } from 'lucide-react';

export interface AudioBook {
  title: string;
  author: string;
  sourceName: string;
  sourceUrl?: string;
  tracks: { title: string; url?: string; blob?: Blob }[];
}

function time(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function AudioPlayer({ book, onClose }: { book: AudioBook; onClose: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState(0);
  const [url, setUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState('');
  const continuePlaying = useRef(false);

  useEffect(() => {
    const entry = book.tracks[track];
    if (!entry) return;
    const localUrl = entry.blob ? URL.createObjectURL(entry.blob) : '';
    // Synchronize a new audio resource; object URLs exist only while in use.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(localUrl || entry.url || '');
    setPosition(0); setDuration(0); setError(''); setPlaying(false); setLoading(false);
    return () => { if (localUrl) URL.revokeObjectURL(localUrl); };
  }, [book, track]);

  const play = async () => {
    if (!audio.current) return;
    setError(''); setLoading(true);
    try { await audio.current.play(); }
    catch (e) {
      setLoading(false); setPlaying(false);
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof DOMException && e.name === 'NotAllowedError' ? 'Prohlížeč přehrávání pozastavil. Zkus znovu stisknout Přehrát.' : 'Zvuk nelze přehrát. Ověř soubor nebo připojení; pro nejširší podporu použij MP3.');
    }
  };
  const selectTrack = (index: number) => { continuePlaying.current = audio.current ? !audio.current.paused : false; audio.current?.pause(); setTrack(index); };

  return <section className="audio-player" aria-label={`Přehrávač audioknihy ${book.title}`}>
    <audio ref={audio} key={url} src={url || undefined} preload="metadata"
      onPlay={() => { setPlaying(true); setLoading(false); }}
      onPause={() => setPlaying(false)} onWaiting={() => setLoading(true)} onPlaying={() => setLoading(false)}
      onTimeUpdate={() => setPosition(audio.current?.currentTime || 0)}
      onLoadedMetadata={() => { const element = audio.current; if (!element) return; setDuration(Number.isFinite(element.duration) ? element.duration : 0); element.playbackRate = rate; if (continuePlaying.current) { continuePlaying.current = false; void play(); } }}
      onEnded={() => { setPlaying(false); if (track < book.tracks.length - 1) { continuePlaying.current = true; setTrack(t => t + 1); } }}
      onError={() => { setPlaying(false); setLoading(false); setError('Zvukový soubor není dostupný, je poškozený nebo jeho formát tento prohlížeč nepodporuje.'); }} />
    <div className="audio-player-inner">
      <div className="audio-description"><strong>{book.title}</strong><span>{book.author} · {book.sourceName}</span>{book.tracks.length > 1 && <label className="sr-only" htmlFor="audio-track">Kapitola audioknihy</label>}<select id="audio-track" aria-label="Kapitola audioknihy" value={track} onChange={e => selectTrack(Number(e.target.value))}>{book.tracks.map((t, i) => <option key={i} value={i}>{i + 1}. {t.title}</option>)}</select></div>
      <div className="audio-controls"><div className="flex items-center justify-center gap-3">
        <button aria-label="Předchozí zvuková kapitola" disabled={track === 0} onClick={() => selectTrack(track - 1)}><ChevronLeft size={18} /></button>
        <button aria-label="Vrátit o 10 sekund" disabled={!duration} onClick={() => { if (audio.current) audio.current.currentTime = Math.max(0, audio.current.currentTime - 10); }}><RotateCcw size={17} /></button>
        <button className="audio-play" aria-label={playing ? 'Pozastavit audioknihu' : 'Přehrát audioknihu'} disabled={!url} onClick={() => playing ? audio.current?.pause() : void play()}>{playing ? <Pause size={19} /> : <Play size={19} />}</button>
        <select aria-label="Rychlost přehrávání" value={rate} onChange={e => { const speed = Number(e.target.value); setRate(speed); if (audio.current) audio.current.playbackRate = speed; }}>{[.75, 1, 1.25, 1.5, 2].map(r => <option key={r} value={r}>{r}×</option>)}</select>
        <button aria-label="Další zvuková kapitola" disabled={track === book.tracks.length - 1} onClick={() => selectTrack(track + 1)}><ChevronRight size={18} /></button>
      </div><div className="audio-progress"><span>{time(position)}</span><input aria-label="Pozice přehrávání" type="range" min={0} max={duration || 1} step={.1} value={Math.min(position, duration || 0)} disabled={!duration} onChange={e => { const target = Number(e.target.value); if (audio.current) audio.current.currentTime = target; setPosition(target); }} /><span>{time(duration)}</span></div>
      {loading && <p role="status">Načítám zvuk…</p>}{error && <div role="alert" className="audio-error">{error}<button onClick={() => { audio.current?.load(); void play(); }}>Zkusit znovu</button>{book.sourceUrl && <a href={book.sourceUrl} target="_blank" rel="noopener noreferrer">Otevřít původní zdroj</a>}</div>}
      </div>
      <div className="flex items-center gap-3">{url && <a href={url} download target="_blank" rel="noopener noreferrer" aria-label="Stáhnout zvukovou kapitolu"><Download size={18} /></a>}<button className="media-icon-button" aria-label="Zavřít přehrávač" onClick={() => { audio.current?.pause(); onClose(); }}><X size={22} /></button></div>
    </div>
  </section>;
}
