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
}

export function getDatabaseLinksForBook(book: BookAnalysis): DatabaseLink[] {
  const query = encodeURIComponent(`${book.title} ${book.author}`);
  return [
    { name: 'Knihovny.cz', category: 'czech', type: 'bibliographic',
      url: `https://www.knihovny.cz/Search/Results?lookfor=${query}&type=AllFields`,
      badge: 'Vyhledávání katalogu', note: 'Hledání knihy; dostupnost e-knihy ani audia není zaručená.' },
    { name: 'Městská knihovna v Praze', category: 'czech', type: 'bibliographic',
      url: `https://www.mlp.cz/katalog/?query=${encodeURIComponent(book.title)}`,
      badge: 'Vyhledávání katalogu', note: 'Hledání v katalogu knihovny, nikoli přímý soubor.' },
    { name: 'Open Library', category: 'international', type: 'bibliographic',
      url: `https://openlibrary.org/search?q=${query}`,
      badge: 'Bibliografické záznamy', note: 'Katalog vydání, nikoli automaticky volně dostupná e-kniha.' },
  ];
}

import { FULL_BOOK_CATALOG } from './books_catalog_200';

export const BOOK_CATALOG: BookAnalysis[] = FULL_BOOK_CATALOG;
