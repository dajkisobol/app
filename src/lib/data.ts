export interface DatabaseLink {
  name: string;
  category: 'czech' | 'international';
  type: 'fulltext' | 'audio' | 'bibliographic' | 'reviews';
  url: string;
  badge: string;
  note?: string;
}

export interface BookAnalysis {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  period: string;
  genre: string;
  timeAndPlace: string;
  themeAndMotifs: string;
  characters: string;
  plotSummary: string;
  languageAndStyle: string;
  ebookUrl?: string; // MLP / Oceansofpdf full-text
  audiobookUrl?: string; // MP3 stream
  audioSource?: string;
}

export function getDatabaseLinksForBook(book: BookAnalysis): DatabaseLink[] {
  const query = encodeURIComponent(`${book.title} ${book.author}`);
  const isbnQuery = book.isbn ? encodeURIComponent(book.isbn) : query;

  return [
    // PRIMARY CZECH SOURCES
    {
      name: 'ČBDB.cz',
      category: 'czech',
      type: 'reviews',
      url: `https://www.cbdb.cz/vyhledavani?q=${query}`,
      badge: 'Česká databáze knih',
      note: 'Recenze, hodnocení a edice'
    },
    {
      name: 'Národní digitální knihovna (NDK)',
      category: 'czech',
      type: 'bibliographic',
      url: `https://ndk.cz/search?q=${query}`,
      badge: 'Digitalizovaný archiv ČR',
      note: 'Historické a vědecké záznamy'
    },
    {
      name: 'Městská knihovna v Praze (MLP)',
      category: 'czech',
      type: 'fulltext',
      url: book.ebookUrl || `https://www.mlp.cz/cz/katalog-sluzeb/?query=${query}`,
      badge: 'Legální e-knihy zdarma',
      note: 'Digitální edice zdarma'
    },
    {
      name: 'Národní knihovna ČR (NKP SKC)',
      category: 'czech',
      type: 'bibliographic',
      url: `https://aleph.nkp.cz/F/?func=find-b&find_code=WRD&request=${query}`,
      badge: 'Souborný katalog ČR',
      note: 'Oficiální registrace publikací'
    },

    // COMPLEMENTARY INTERNATIONAL SOURCES
    {
      name: 'Open Library',
      category: 'international',
      type: 'bibliographic',
      url: book.isbn ? `https://openlibrary.org/isbn/${book.isbn}` : `https://openlibrary.org/search?q=${query}`,
      badge: 'Open Access Catalog',
      note: 'Soustava mezinárodních edicí a vyhledávání'
    },
    {
      name: 'Goodreads',
      category: 'international',
      type: 'reviews',
      url: `https://www.goodreads.com/search?q=${query}`,
      badge: 'Mezinárodní recenze',
      note: 'Celosvětové hodnocení a komentáře'
    },
    {
      name: 'ISBNdb',
      category: 'international',
      type: 'bibliographic',
      url: `https://isbndb.com/search/books/${isbnQuery}`,
      badge: 'ISBN Registr',
      note: 'Detailní bibliografické údaje vydavatelů'
    },
    {
      name: 'BookDatabase.io',
      category: 'international',
      type: 'bibliographic',
      url: `https://bookdatabase.io/search?q=${query}`,
      badge: 'Katalog knih',
      note: 'Vyhledání v mezinárodním datovém archivu'
    }
  ];
}

import { FULL_BOOK_CATALOG } from './books_catalog_200';

export const BOOK_CATALOG: BookAnalysis[] = FULL_BOOK_CATALOG;
