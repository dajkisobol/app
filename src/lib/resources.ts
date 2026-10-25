export interface ResourceItem {
  id: string;
  title: string;
  author: string;
  type: 'ebook' | 'audiobook';
  format: string; // EPUB / PDF / MP3 Stream
  sourceName: string;
  sourceUrl: string;
  downloadUrl: string;
  streamUrl?: string;
  description: string;
  coverColor: string;
}

export const FREE_RESOURCES: ResourceItem[] = [
  {
    id: 'res-rur-ebook',
    title: 'R.U.R. (E-kniha zdarma)',
    author: 'Karel Čapek',
    type: 'ebook',
    format: 'EPUB / PDF / PRC',
    sourceName: 'Městská knihovna v Praze (mlp.cz)',
    sourceUrl: 'https://www.mlp.cz',
    downloadUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/r.u.r./',
    description: 'Oficiální e-kniha vydaná Městskou knihovnou v Praze zdarma ke stažení pro maturanty.',
    coverColor: 'from-blue-600 to-indigo-800'
  },
  {
    id: 'res-maj-ebook',
    title: 'Máj (E-kniha zdarma)',
    author: 'Karel Hynek Mácha',
    type: 'ebook',
    format: 'EPUB / PDF',
    sourceName: 'Městská knihovna v Praze (mlp.cz)',
    sourceUrl: 'https://www.mlp.cz',
    downloadUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/maj/',
    description: 'Básnické vrcholné dílo českého romantismu k okamžitému stažení.',
    coverColor: 'from-purple-600 to-pink-700'
  },
  {
    id: 'res-1984-ocean',
    title: '1984 (Světová literatura)',
    author: 'George Orwell',
    type: 'ebook',
    format: 'PDF / EPUB',
    sourceName: 'OceansofPDF',
    sourceUrl: 'https://oceansofpdf.com',
    downloadUrl: 'https://oceansofpdf.com/authors/george-orwell/pdf-epub-1984-download/',
    description: 'Bezplatný přístup k digitálnímu vydání kultovního dystopického románu.',
    coverColor: 'from-amber-600 to-red-800'
  },
  {
    id: 'res-rur-audio',
    title: 'R.U.R. Rozhlasová hra & Audiokniha',
    author: 'Karel Čapek',
    type: 'audiobook',
    format: 'MP3 Audio Stream',
    sourceName: 'Český rozhlas / MůjRozhlas',
    sourceUrl: 'https://www.mujrozhlas.cz',
    downloadUrl: 'https://www.mujrozhlas.cz',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'Kultovní rozhlasové zpracování s výborným obsazením ČRo Vltava.',
    coverColor: 'from-emerald-600 to-teal-800'
  },
  {
    id: 'res-maj-audio',
    title: 'Máj - Umělecký přednes',
    author: 'Karel Hynek Mácha',
    type: 'audiobook',
    format: 'MP3 Audio Stream',
    sourceName: 'Český rozhlas Vltava',
    sourceUrl: 'https://vltava.rozhlas.cz',
    downloadUrl: 'https://vltava.rozhlas.cz',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Kompletní recitace a hudební doprovod v podání předních českých herců.',
    coverColor: 'from-violet-600 to-purple-900'
  },
  {
    id: 'res-kytice-audio',
    title: 'Kytice - Vybrané balady',
    author: 'Karel Jaromír Erben',
    type: 'audiobook',
    format: 'MP3 Audio Stream',
    sourceName: 'Knihovny.cz / MůjRozhlas',
    sourceUrl: 'https://www.knihovny.cz',
    downloadUrl: 'https://www.knihovny.cz',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Dramatizace vybraných balad vhodná k poslechu při studiu.',
    coverColor: 'from-cyan-600 to-blue-800'
  }
];
