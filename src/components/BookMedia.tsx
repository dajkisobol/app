'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Download, ExternalLink, Headphones, Search, Trash2, Upload, X } from 'lucide-react';
import EbookReader from '@/components/EbookReader';
import type { ReaderDocument } from '@/components/EbookReader';
import type { AudioBook } from '@/components/AudioPlayer';
import { FREE_AUDIOBOOK_LINKS } from '@/lib/free-audiobooks';
import { assetUrl, EXTERNAL_RECORDINGS, listeningForBook, MEDIA_ASSETS, mediaForBook, mediaSearchLinks } from '@/lib/media';
import { addPersonalFiles, listPersonalMedia, removePersonalMedia } from '@/lib/media-files';
import type { PersonalMedia, MediaKind } from '@/lib/media-files';
import type { BookAnalysis } from '@/lib/data';

interface PanelProps {
  book: Pick<BookAnalysis, 'id' | 'title' | 'author'>;
  owner: string;
  onPlay: (book: AudioBook) => void;
  onFilesChanged?: () => void;
}

export function BookMediaPanel({ book, owner, onPlay, onFilesChanged }: PanelProps) {
  const [files, setFiles] = useState<PersonalMedia[]>([]);
  const [reader, setReader] = useState<ReaderDocument | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ebookInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const sources = mediaForBook(book.id);
  const ebooks = sources.filter(s => s.kind === 'ebook');
  const recordings = sources.filter(s => s.kind === 'audiobook');
  const externalRecordings = listeningForBook(book.id);
  const ownAudio = files.filter(f => f.kind === 'audiobook');
  const search = mediaSearchLinks(book);

  useEffect(() => {
    let active = true;
    listPersonalMedia(owner, book.id).then(values => { if (active) setFiles(values); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [owner, book.id]);

  const upload = async (input: HTMLInputElement, kind: MediaKind) => {
    const selected = [...(input.files || [])]; if (!selected.length) return;
    setBusy(true); setError('');
    try { await addPersonalFiles(owner, book.id, kind, selected); setFiles(await listPersonalMedia(owner, book.id)); onFilesChanged?.(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Soubor se nepodařilo uložit.'); }
    finally { setBusy(false); input.value = ''; }
  };
  const remove = async (file: PersonalMedia) => {
    try { await removePersonalMedia(file.id, owner); setFiles(list => list.filter(f => f.id !== file.id)); onFilesChanged?.(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Soubor se nepodařilo odebrat.'); }
  };
  const playOwn = (selected: PersonalMedia[]) => onPlay({ title: book.title, author: book.author, sourceName: 'Vlastní soubory v tomto prohlížeči', tracks: selected.map(f => ({ title: f.name, blob: f.blob })) });

  return <section className="book-media-panel" aria-label={`E-kniha a audiokniha: ${book.title}`}>
    <div className="book-media-section"><h3><BookOpen size={18} /> E-kniha</h3>
      {ebooks.map(source => <div key={source.id} className="media-source">
        <strong>{source.title} <span className="media-badge">{source.format} · česky · v aplikaci</span></strong><p>{source.provider}</p>
        <div className="media-actions"><button className="hero-primary" onClick={() => setReader({ title: book.title, format: source.format, url: assetUrl(source.path), sourceName: source.provider, license: source.license, licenseUrl: source.licenseUrl })}><BookOpen size={15} /> Číst v aplikaci</button><a className="hero-secondary" href={assetUrl(source.path)} download><Download size={14} /> Stáhnout {source.format}</a></div>
        <p className="media-note">{source.license} · <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">Původ vydání</a> · <a href={source.licensePath ? assetUrl(source.licensePath) : source.licenseUrl} target="_blank" rel="noopener noreferrer">Tiráž / licence</a></p>
      </div>)}
      {files.filter(f => f.kind === 'ebook').map(file => <div key={file.id} className="media-source"><strong>{file.name} <span className="media-badge">Vlastní soubor</span></strong><div className="media-actions"><button className="hero-secondary" onClick={() => setReader({ title: book.title, format: file.format, blob: file.blob, sourceName: file.name })}>Otevřít {file.format}</button><button className="media-delete" aria-label={`Odebrat ${file.name}`} onClick={() => void remove(file)}><Trash2 size={15} /> Odebrat</button></div></div>)}
      {!ebooks.length && !files.some(f => f.kind === 'ebook') && <p className="media-unavailable">Plnou e-knihu s ověřeným oprávněním k vložení zatím nemáme. Můžeš přidat vlastní soubor nebo vyhledat legální nabídku.</p>}
      <div className="media-actions"><button className="hero-secondary" disabled={busy} onClick={() => ebookInput.current?.click()}><Upload size={14} /> Přidat vlastní e-knihu</button><a href={search.ebook} target="_blank" rel="noopener noreferrer" className="media-search"><Search size={14} /> Vyhledat v katalogu MKP</a></div>
      <input ref={ebookInput} type="file" aria-label={`Přidat e-knihu ${book.title}`} accept=".epub,.pdf,.txt" className="sr-only" tabIndex={-1} onChange={e => void upload(e.currentTarget, 'ebook')} />
    </div>
    <div className="book-media-section"><h3><Headphones size={18} /> Audiokniha</h3>
      {recordings.map(source => <div key={source.id} className="media-source"><strong>{source.title} <span className="media-badge">Nahraná audiokniha · česky · v aplikaci</span></strong><p>{source.provider}{source.tracks ? ` · ${source.tracks.length} kapitol` : ''}{source.durationSeconds ? ` · ${Math.floor(source.durationSeconds / 3600)} h ${Math.floor(source.durationSeconds % 3600 / 60)} min` : ''}</p><button className="hero-primary" onClick={() => onPlay({ title: book.title, author: book.author, sourceName: source.provider, sourceUrl: source.sourceUrl, tracks: source.tracks?.map(t => ({ ...t, url: assetUrl(t.url) })) || [{ title: source.title, url: assetUrl(source.path) }] })}>Otevřít přehrávač</button><p className="media-note">{source.license} · <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">Zdroj nahrávky</a> · <a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">Podmínky šíření</a></p></div>)}
      {(FREE_AUDIOBOOK_LINKS[book.id] || []).map(source => <div key={source.url} className="media-source">
        <strong>{source.title} <span className="media-badge">Zdarma · {source.language}</span></strong>
        <p>{source.provider} · Celý titul na webu poskytovatele; není uložený v aplikaci.</p>
        <a className="hero-secondary" href={source.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> Poslouchat nebo stáhnout zdarma</a>
      </div>)}
      {ownAudio.length > 0 && <div className="media-source"><strong>Vlastní audiokniha · {ownAudio.length} zvukových souborů</strong><button className="hero-primary" onClick={() => playOwn(ownAudio)}><Headphones size={15} /> Otevřít přehrávač</button><ul className="personal-track-list">{ownAudio.map(file => <li key={file.id}><span>{file.name}</span><button className="media-delete" aria-label={`Odebrat ${file.name}`} onClick={() => void remove(file)}><Trash2 size={14} /></button></li>)}</ul></div>}
      {externalRecordings.map(source => <div key={source.url} className="media-source">
        <strong>{source.title} <span className="media-badge">Český poslech · na webu poskytovatele</span></strong>
        <p>{source.provider}</p><p>{source.description}</p>
        <a className="hero-secondary" href={source.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> Poslouchat na mujRozhlas</a>
        <p className="media-note">Poslech vyžaduje internet a otevře se v nové kartě. Nahrávka není uložena v aplikaci; dostupnost určuje Český rozhlas.</p>
      </div>)}
      {!recordings.length && !externalRecordings.length && !ownAudio.length && <p className="media-unavailable">Ověřenou nahranou audioknihu zatím nemáme. Ukázková hudba ji nenahrazuje. V čtečce lze u textových knih využít syntetické předčítání, má-li zařízení český hlas.</p>}
      <div className="media-actions"><button className="hero-secondary" disabled={busy} onClick={() => audioInput.current?.click()}><Upload size={14} /> Přidat vlastní audio</button><a href={search.audiobook} target="_blank" rel="noopener noreferrer" className="media-search"><Search size={14} /> Hledat v nabídce Palmknih (i placené)</a><a href={search.mujrozhlas} target="_blank" rel="noopener noreferrer" className="media-search">Najít českou četbu na mujRozhlas <ExternalLink size={12} /></a><a href={search.librivox} target="_blank" rel="noopener noreferrer" className="media-search">Hledat na LibriVoxu <ExternalLink size={12} /></a><a href={search.naposlech} target="_blank" rel="noopener noreferrer" className="media-search">Najít audioknihu na Naposlech.cz <ExternalLink size={12} /></a></div>
      <input ref={audioInput} type="file" aria-label={`Přidat audio ${book.title}`} accept=".mp3,.m4a,.m4b,.ogg,.opus,.wav,.aac" className="sr-only" tabIndex={-1} multiple onChange={e => void upload(e.currentTarget, 'audiobook')} />
    </div>
    <p className="media-note">Vlastní soubory se ukládají pouze v tomto prohlížeči, nikoli na server ani na GitHub. Vymazání dat prohlížeče je odstraní; své původní soubory si ponech. Nahrávej soubory, které smíš používat. Vyhledávací odkazy nezaručují dostupnost konkrétního vydání.</p>
    {busy && <p role="status">Ukládám soubory…</p>}{error && <p role="alert" className="media-error">{error}</p>}
    {reader && <EbookReader book={reader} onClose={() => setReader(null)} />}
  </section>;
}

export default function MediaLibrary({ books, owner, onPlay }: { books: BookAnalysis[]; owner: string; onPlay: (book: AudioBook) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('available');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BookAnalysis | null>(null);
  const [ownFiles, setOwnFiles] = useState<PersonalMedia[]>([]);
  const refresh = useCallback(() => { listPersonalMedia(owner).then(setOwnFiles).catch(() => {}); }, [owner]);
  useEffect(refresh, [refresh]);
  useEffect(() => {
    if (window.location.hash === '#audioknihy') document.getElementById('audioknihy')?.scrollIntoView();
  }, []);
  const bundledRecordings = MEDIA_ASSETS.filter(s => s.kind === 'audiobook');
  const localEbooks = new Set(MEDIA_ASSETS.filter(s => s.kind === 'ebook').map(s => s.bookId));
  const localAudio = new Set(MEDIA_ASSETS.filter(s => s.kind === 'audiobook').map(s => s.bookId));
  const externalAudio = new Set(EXTERNAL_RECORDINGS.map(s => s.bookId));
  const ownBookIds = new Set(ownFiles.map(f => f.bookId));
  const results = books.filter(book => {
    const matches = `${book.title} ${book.author}`.toLocaleLowerCase('cs').normalize('NFD').replace(/\p{M}/gu, '').includes(query.toLocaleLowerCase('cs').normalize('NFD').replace(/\p{M}/gu, ''));
    return matches && (filter === 'all' || filter === 'available' && (localEbooks.has(book.id) || localAudio.has(book.id) || ownBookIds.has(book.id)) || filter === 'audio' && (localAudio.has(book.id) || ownFiles.some(f => f.bookId === book.id && f.kind === 'audiobook')) || filter === 'onlineAudio' && externalAudio.has(book.id) || filter === 'own' && ownBookIds.has(book.id));
  });
  const totalPages = Math.max(1, Math.ceil(results.length / 12));
  return <section className="media-library space-y-6">
    <div className="media-library-heading"><span className="eyebrow">KNIHY, KTERÉ OPRAVDU OTEVŘEŠ</span><h2>E-knihy a audioknihy</h2><p>Přímo v aplikaci: {localEbooks.size} českých e-knih a {localAudio.size} nahraná audiokniha. U všech {books.length} titulů lze přidat vlastní e-knihu i audioknihu. Nahrávky a syntetické předčítání jsou odlišené.</p></div>
    <section id="audioknihy" className="featured-listening space-y-4" aria-label="České audioknihy">
      <h3>České audioknihy a četba</h3>
      <p>Krysaře si přehraješ přímo v aplikaci. Další českou četbu otevřeš v přehrávači Českého rozhlasu.</p>
      <div className="media-catalog-grid">
        {bundledRecordings.map(source => <article key={source.id} className="media-catalog-card study-card">
          <span className="eyebrow">V APLIKACI · ČESKY</span>
          <h4>{source.title}</h4><p>{books.find(book => book.id === source.bookId)?.author}</p>
          <p>{source.provider} · {source.tracks?.length ?? 1} kapitol</p>
          <button className="hero-primary" onClick={() => onPlay({ title: source.title, author: books.find(book => book.id === source.bookId)?.author ?? source.provider, sourceName: source.provider, sourceUrl: source.sourceUrl, tracks: source.tracks?.map(track => ({ ...track, url: assetUrl(track.url) })) || [{ title: source.title, url: assetUrl(source.path) }] })}><Headphones size={15} /> Přehrát {source.title}</button>
        </article>)}
        {EXTERNAL_RECORDINGS.map(source => <article key={source.url} className="media-catalog-card study-card">
          <span className="eyebrow">MUJROZHLAS · ČESKY</span>
          <h4>{source.title}</h4><p>{books.find(book => book.id === source.bookId)?.author}</p>
          <p>{source.description}</p>
          <a className="hero-secondary" href={source.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> Poslouchat {source.title} na mujRozhlas</a>
        </article>)}
      </div>
      <p className="media-note">Poslech na mujRozhlas vyžaduje internet a otevře se v nové kartě. Dostupnost těchto nahrávek určuje Český rozhlas.</p>
    </section>
    <aside className="study-card space-y-3" aria-label="Další e-knihy zdarma">
      <h3>Další e-knihy zdarma</h3>
      <p>Prohlédni si nabídku knihkupectví. Ke knihám z našeho katalogu můžeš v jejich detailu připojit vlastní EPUB, PDF nebo TXT.</p>
      <div className="media-actions"><a className="hero-secondary" href="https://www.luxor.cz/c/12000/e-knihy-zdarma" target="_blank" rel="noopener noreferrer">Luxor <ExternalLink size={14} /></a><a className="hero-secondary" href="https://www.knihydobrovsky.cz/eknihy-zdarma" target="_blank" rel="noopener noreferrer">Knihy Dobrovský <ExternalLink size={14} /></a></div>
      <p className="media-note">Stažení může vyžadovat účet u knihkupectví. Tyto nabídky nejsou součástí uložené knihovny aplikace.</p>
    </aside>
    <div className="media-library-controls"><label className="media-search-field"><Search size={17} /><input aria-label="Hledat e-knihu nebo audioknihu" placeholder="Název knihy nebo autor…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label><div className="media-filter" aria-label="Dostupnost souborů">{[['available', 'Dostupné v aplikaci'], ['all', `Všechny knihy (${books.length})`], ['audio', 'Nahrané audio'], ['onlineAudio', `Český poslech online (${externalAudio.size})`], ['own', 'Moje soubory']].map(([value, title]) => <button key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setPage(1); }}>{title}</button>)}</div></div>
    <p className="media-note">{results.length} titulů · „V aplikaci“ znamená skutečný uložený soubor. Nabídky knihoven ani vyhledávače se do tohoto počtu nepočítají.</p>
    <div className="media-catalog-grid">{results.slice((page - 1) * 12, page * 12).map(book => <article key={book.id} className="media-catalog-card study-card">
      <span className="eyebrow">{localEbooks.has(book.id) ? 'ČESKÁ E-KNIHA V APLIKACI' : ownBookIds.has(book.id) ? 'VLASTNÍ SOUBORY' : 'BEZ OVĚŘENÉHO SOUBORU'}</span><h3>{book.title}</h3><p>{book.author}</p>
      <div className="media-card-status">
        <span><BookOpen size={14} /> {localEbooks.has(book.id) ? 'Číst / stáhnout' : ownFiles.some(f => f.bookId === book.id && f.kind === 'ebook') ? 'Vlastní e-kniha' : 'E-kniha zatím nedostupná'}</span>
        <span><Headphones size={14} />{localAudio.has(book.id) ? 'Audiokniha' : ownFiles.some(f => f.bookId === book.id && f.kind === 'audiobook') ? 'Vlastní audio' : externalAudio.has(book.id) ? 'Český poslech na mujRozhlas' : 'Nahrané audio zatím nedostupné'}</span>
      </div>
      <button className="hero-secondary" onClick={() => setSelected(book)}>E-kniha, audio a vlastní soubory</button>
    </article>)}</div>
    {!results.length && <div className="media-empty"><Headphones size={30} /><h3>{filter === 'audio' ? 'Žádné ověřené nahrané audio v tomto výběru' : 'Žádné knihy v tomto výběru'}</h3><p>Zkus jiný filtr. Ke kterékoli knize můžeš přidat vlastní zvukové soubory.</p><button className="hero-secondary" onClick={() => { setFilter('all'); setQuery(''); setPage(1); }}>Zobrazit všechny knihy</button></div>}
    {totalPages > 1 && <div className="media-pagination"><button className="hero-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Předchozí</button><span>{page} / {totalPages}</span><button className="hero-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Další</button></div>}
    {selected && <MediaDialog book={selected} owner={owner} onPlay={onPlay} onClose={() => setSelected(null)} onFilesChanged={refresh} />}
  </section>;
}

function MediaDialog({ onClose, ...props }: PanelProps & { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className="media-dialog" onCancel={onClose} aria-labelledby="media-book-title"><header><div><h2 id="media-book-title">{props.book.title}</h2><p>{props.book.author}</p></div><button className="media-icon-button" aria-label="Zavřít soubory knihy" onClick={onClose}><X size={22} /></button></header><BookMediaPanel {...props} onPlay={audio => { props.onPlay(audio); onClose(); }} /></dialog>;
}
