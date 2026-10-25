export interface Question {
  id: string;
  category: 'Pravopis' | 'Literatura' | 'Mluvnice' | 'Textová návaznost';
  prompt: string;
  passage?: string;
  options: string[];
  correctOption: number; // 0-indexed index
  explanation: string;
}

export interface DidacticTest {
  id: string;
  title: string;
  year: string;
  season: 'Jaro' | 'Podzim' | 'Mimořádný';
  timeLimitMinutes: number;
  questions: Question[];
}

export const CERMAT_TESTS: DidacticTest[] = [
  {
    id: 'cermat-2023-jaro',
    title: 'Didaktický test ČJL - Jaro 2023',
    year: '2023',
    season: 'Jaro',
    timeLimitMinutes: 85,
    questions: [
      {
        id: 'c2023j-1',
        category: 'Pravopis',
        prompt: 'Ve které z následujících větných dvojic jsou OBA pravopisy správné?',
        options: [
          'A) Byli jsme překvapeni výjimkami v pravidlech. / Na stěně visely starožitné hodiny.',
          'B) Zhlédl se v zrcadle s úsměvem. / Shlédli jsme nový film v kině.',
          'C) Běžel vústríc svému osudu. / Připravil vinný střik.',
          'D) Děti se radovali z prázdnin. / Psi hlasitě štěkali na dvoře.'
        ],
        correctOption: 0,
        explanation: 'Slovo "výjimka" se píše s dlouhým "ý" a krátkým "i". "Visely" má příčestí minulého času podle podmětu "hodiny" (ženský rod, Měkké i). Ve variantě B má být "zhlédli jsme film" (spatřili jsme). Ve variantě C "vstříc". Ve variantě D "děti se radovaly" (střední rod / ženský rod v množném čísle - děti).'
      },
      {
        id: 'c2023j-2',
        category: 'Literatura',
        prompt: 'Která z následujících charakteristik nejlépe odpovídá dílu "RUR" od Karla Čapka?',
        options: [
          'A) Románová kronika sledování života na české vesnici v 19. století.',
          'B) Vědeckofantastické drama varující před zneužitím techniky a umělé inteligence, ve kterém poprvé zaznělo slovo "robot".',
          'C) Lyricko-epická báseň s tématem nešťastné lásky a tragické smrti mladého zbojníka.',
          'D) Historický román popisující období vlády Karla IV.'
        ],
        correctOption: 1,
        explanation: 'R.U.R. (Rossum’s Universal Robots) je utopické/sci-fi drama Karla Čapka z roku 1920, kde autor poprvé použil slovo "robot" (které mu doporučil bratr Josef Čapek).'
      },
      {
        id: 'c2023j-3',
        category: 'Mluvnice',
        prompt: 'Určete větný člen podtržený ve větě: "Chlapec běžel **rychle** do školy."',
        options: [
          'A) Předmět',
          'B) Příslovečné určení způsobu',
          'C) Příslovečné určení místa',
          'D) Přívlastek shodný'
        ],
        correctOption: 1,
        explanation: 'Slovo "rychle" vyjadřuje, JAKÝM ZPŮSOBEM chlapec běžel, jedná se tedy o příslovečné určení způsobu (PUM).'
      },
      {
        id: 'c2023j-4',
        category: 'Textová návaznost',
        passage: 'Karel Hynek Mácha byl významný český básník a prozaik. Napsal lyricko-epickou báseň Máj. [???] Byla přijata se značným pochopením až dalšími generacemi čtenářů a literárních kritiků.',
        prompt: 'Která věta nejlépe patří na místo označení [???], aby text navazoval logicky a gramaticky?',
        options: [
          'A) Ve své době však tato skladba nesklidila u soudobé kritiky velký ohlas.',
          'B) Mácha velmi rád cestoval po českých hradech a zámcích.',
          'C) Česká literatura 19. století byla velmi bohatá na různé žánry.',
          'D) Vydal také několik dalších románů pro mládež.'
        ],
        correctOption: 0,
        explanation: 'Následující věta začíná "Byla přijata se značným pochopením až dalšími generacemi...", což přirozeně navazuje na fakt, že ve své době byla nepochopena nebo kritizována.'
      },
      {
        id: 'c2023j-5',
        category: 'Pravopis',
        prompt: 'Které slovo obsahuje chybu v psaní i/ý nebo ě/je?',
        options: [
          'A) Objednávka',
          'B) Běsnění',
          'C) Zapomnětlivý',
          'D) Mětský'
        ],
        correctOption: 3,
        explanation: 'Správně se píše "Městský" (od slova město -> měst-ský).'
      }
    ]
  },
  {
    id: 'cermat-2022-jaro',
    title: 'Didaktický test ČJL - Jaro 2022',
    year: '2022',
    season: 'Jaro',
    timeLimitMinutes: 85,
    questions: [
      {
        id: 'c2022j-1',
        category: 'Literatura',
        prompt: 'Kdo je autorem baladické sbírky "Kytice"?',
        options: [
          'A) Jan Neruda',
          'B) Karel Jaromír Erben',
          'C) Božena Němcová',
          'D) Vítězslav Hálek'
        ],
        correctOption: 1,
        explanation: 'Kytice z pověstí národních je jediná básnická sbírka Karla Jaromíra Erbena.'
      },
      {
        id: 'c2022j-2',
        category: 'Pravopis',
        prompt: 'Ve které z možností jechyba v psaní velikosti písmen?',
        options: [
          'A) Město Praha, Severní moře, Základní škola v Brně',
          'B) Tichý oceán, Karlovy Vary, ulice Na Příkopě',
          'C) Vánoce, Velikonoce, Nový rok',
          'D) Česká Republika, Pražský Hrad, Univerzita Karlova'
        ],
        correctOption: 3,
        explanation: 'Správný zápis je "Česká republika" (republika s malým r) a "Pražský hrad" (hrad s malým h).'
      },
      {
        id: 'c2022j-3',
        category: 'Mluvnice',
        prompt: 'Jaký slovní druh je slovo "zpět" ve větě: "Vráť se ihned zpět!"?',
        options: [
          'A) Předložka',
          'B) Citoslovce',
          'C) Příslovce',
          'D) Částice'
        ],
        correctOption: 2,
        explanation: 'Slovo "zpět" je příslovce (vyjadřuje směr/místo).'
      },
      {
        id: 'c2022j-4',
        category: 'Textová návaznost',
        prompt: 'Vyberte možnost, ve které je správně určen poměr mezi větami hlavním v souvětí: "Slunce svítilo, ale vítr stále studeně foukal."',
        options: [
          'A) Poměr slučovací',
          'B) Poměr odporovací',
          'C) Poměr stupňovací',
          'D) Poměr důsledkový'
        ],
        correctOption: 1,
        explanation: 'Spojka "ale" vyjadřuje odporovací poměr mezi souřadně spojenými větami.'
      }
    ]
  }
];

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
