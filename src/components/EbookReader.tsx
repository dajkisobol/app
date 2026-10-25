'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Download, Volume2, X } from 'lucide-react';
import { readEpub, readHtml, speechChunks } from '@/lib/ebook-reader';
import type { BookChapter } from '@/lib/ebook-reader';

export interface ReaderDocument {
  title: string;
  format: string;
  url?: string;
  blob?: Blob;
  sourceName: string;
  license?: string;
  licenseUrl?: string;
}

export default function EbookReader({ book, onClose }: { book: ReaderDocument; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [chapter, setChapter] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState(book.url || '');
  const [fontSize, setFontSize] = useState(18);
  const [speaking, setSpeaking] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const activeSpeech = useRef(false);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); activeSpeech.current = false; window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let localUrl = '';
    let alive = true;
    const load = async () => {
      try {
        let blob = book.blob;
        if (blob) { localUrl = URL.createObjectURL(blob); setUrl(localUrl); }
        if (book.format === 'PDF') return;
        if (!blob) {
          const response = await fetch(book.url!, { signal: controller.signal });
          if (!response.ok) throw new Error(`Soubor není dostupný (HTTP ${response.status}).`);
          blob = await response.blob();
        }
        let result: BookChapter[];
        if (book.format === 'EPUB') result = readEpub(new Uint8Array(await blob.arrayBuffer()));
        else if (book.format === 'HTML') result = readHtml(await blob.text());
        else result = [{ title: 'Celá kniha', text: await blob.text() }];
        if (alive) setChapters(result);
      } catch (e) { if (alive && !controller.signal.aborted) setError(e instanceof Error ? e.message : 'Knihu se nepodařilo otevřít.'); }
      finally { if (alive) setLoading(false); }
    };
    load();
    return () => { alive = false; controller.abort(); if (localUrl) URL.revokeObjectURL(localUrl); };
  }, [book]);

  useEffect(() => {
    const available = () => setSpeechAvailable('speechSynthesis' in window && window.speechSynthesis.getVoices().some(v => v.lang.toLowerCase().startsWith('cs')));
    available();
    window.speechSynthesis?.addEventListener('voiceschanged', available);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', available);
  }, []);

  const stopSpeech = () => { activeSpeech.current = false; window.speechSynthesis?.cancel(); setSpeaking(false); };
  const changeChapter = (index: number) => { stopSpeech(); setChapter(index); content.current?.scrollTo({ top: 0 }); };
  const speak = () => {
    if (!speechAvailable || !chapters[chapter]) return;
    stopSpeech(); activeSpeech.current = true; setSpeaking(true);
    const chunks = speechChunks(chapters[chapter].text);
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('cs'));
    let position = 0;
    const next = () => {
      if (!activeSpeech.current) return;
      if (position >= chunks.length) { activeSpeech.current = false; setSpeaking(false); return; }
      const utterance = new SpeechSynthesisUtterance(chunks[position++]);
      utterance.lang = 'cs-CZ'; if (voice) utterance.voice = voice;
      utterance.onend = next;
      utterance.onerror = () => { if (!activeSpeech.current) return; activeSpeech.current = false; setSpeaking(false); setError('Předčítání bylo přerušeno. Zkus spustit kapitolu znovu.'); };
      window.speechSynthesis.speak(utterance);
    };
    next();
  };

  return <dialog ref={dialog} className="ebook-reader" onCancel={onClose} aria-labelledby="reader-title">
    <header><div><span className="eyebrow"><BookOpen size={13} /> ČTEČKA</span><h2 id="reader-title">{book.title}</h2><p>{book.sourceName}</p></div><button className="media-icon-button" onClick={onClose} aria-label="Zavřít čtečku"><X size={22} /></button></header>
    <div className="reader-toolbar">
      {chapters.length > 1 && <label>Kapitola <select aria-label="Kapitola" value={chapter} onChange={e => changeChapter(Number(e.target.value))}>{chapters.map((c, i) => <option key={i} value={i}>{i + 1}. {c.title.slice(0, 90)}</option>)}</select></label>}
      {book.format !== 'PDF' && <label>Velikost písma <select aria-label="Velikost písma" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}>{[16, 18, 20, 24, 28].map(size => <option key={size}>{size}</option>)}</select></label>}
      {url && <a href={url} download target="_blank" rel="noopener noreferrer"><Download size={14} /> Stáhnout {book.format}</a>}
      {!!chapters.length && <button disabled={!speechAvailable} onClick={speaking ? stopSpeech : speak}><Volume2 size={14} />{speaking ? 'Zastavit předčítání' : 'Předčítat kapitolu (syntetický hlas)'}</button>}
    </div>
    {!loading && chapters.length > 0 && !speechAvailable && <p className="media-note px-5">Prohlížeč nemá dostupný český hlas. Pro předčítání přidej češtinu do hlasových funkcí zařízení. Jde o syntetické předčítání, nikoli nahranou audioknihu.</p>}
    {book.license && <p className="reader-license">{book.license} {book.licenseUrl && <a href={book.licenseUrl} target="_blank" rel="noopener noreferrer">Podmínky vydání</a>}</p>}
    {error && <p role="alert" className="media-error">{error}</p>}
    <div ref={content} className="reader-content" style={{ fontSize }}>
      {loading ? <p role="status">Načítám knihu…</p> : book.format === 'PDF' ? <><iframe title={book.title} src={url} /><a href={url} target="_blank" rel="noopener noreferrer">Pokud se PDF nezobrazuje, otevřít samostatně</a></> : <article><h3>{chapters[chapter]?.title}</h3><div className="reader-text">{chapters[chapter]?.text}</div></article>}
    </div>
    {chapters.length > 1 && <footer><button disabled={chapter === 0} onClick={() => changeChapter(chapter - 1)}>Předchozí kapitola</button><span>{chapter + 1} / {chapters.length}</span><button disabled={chapter === chapters.length - 1} onClick={() => changeChapter(chapter + 1)}>Další kapitola</button></footer>}
  </dialog>;
}
