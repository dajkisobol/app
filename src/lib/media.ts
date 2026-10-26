import imported from './book-media.json';
import listening from './book-listening.json';

export interface AudioTrack { title: string; url: string; sha256?: string; bytes?: number; durationSeconds?: number }
export interface MediaAsset {
  id: string;
  bookId: string;
  title: string;
  kind: 'ebook' | 'audiobook';
  format: string;
  language: string;
  provider: string;
  sourceUrl: string;
  path: string;
  license: string;
  licenseUrl: string;
  licensePath?: string;
  verifiedAt: string;
  sha256: string;
  bytes: number;
  totalBytes?: number;
  durationSeconds?: number;
  expectedTracks?: number;
  tracks?: AudioTrack[];
}

export const MEDIA_ASSETS: MediaAsset[] = imported as MediaAsset[];

/** These recordings stay with their provider; they are not bundled media files. */
export const EXTERNAL_RECORDINGS = listening;

export function listeningForBook(bookId: string) {
  return EXTERNAL_RECORDINGS.filter(recording => recording.bookId === bookId);
}

export function assetUrl(path: string) {
  if (/^https:\/\//.test(path)) return path;
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Neplatná cesta k souboru.');
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
}

export function mediaForBook(bookId: string) {
  return MEDIA_ASSETS.filter(asset => asset.bookId === bookId);
}

/** Search links are explicitly not proof that a complete file is available. */
export function mediaSearchLinks(book: { title: string; author: string }) {
  const query = encodeURIComponent(book.title);
  return {
    ebook: `https://www.mlp.cz/katalog/?query=${query}`,
    audiobook: `https://www.palmknihy.cz/vyhledavani?query=${query}`,
    librivox: `https://librivox.org/search?title=${encodeURIComponent(book.title)}&search_form=advanced`,
    mujrozhlas: `https://www.google.com/search?q=${encodeURIComponent('site:mujrozhlas.cz/ ' + book.title + ' ' + book.author + ' četba')}`,
    naposlech: `https://www.google.com/search?q=${encodeURIComponent('site:naposlech.cz/audiokniha/ ' + book.title + ' ' + book.author)}`,
  };
}
