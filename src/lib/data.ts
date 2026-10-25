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

export const BOOK_CATALOG: BookAnalysis[] = [
  {
    id: 'capek-rur',
    title: 'R.U.R.',
    author: 'Karel Čapek',
    isbn: '9788073900137',
    period: 'Česká literatura meziválečného období (1. polovina 20. století)',
    genre: 'Utopické vědeckofantastické drama',
    timeAndPlace: 'Ostrov v blíže neurčené budoucnosti, továrna na výrobu Robotů (Rossum’s Universal Robots)',
    themeAndMotifs: 'Varování před nekontrolovaným technickým pokrokem, ztráta lidskosti, motivy práce, lásky a obrody lidstva.',
    characters: 'Harry Domin (ředitel R.U.R.), Helena Gloryová (manželka Domina, zástupkyně Ligy lidskosti), stavitel Alquist (uznává lidskou práci), ing. Fabry, dr. Gall.',
    plotSummary: 'V továrně R.U.R. vyrábějí umělé lidi – Roboty. Helena přichází bojovat za jejich práva, ale nakonec se provdá za Domina. Po letech se Roboti vzbouří a vyhubí veškeré lidstvo, kromě stavitele Alquista. Roboti však neznají výrobní tajemství a hrozí jim vyhynutí. Nakonec dva Roboti (Primus a Helena) projeví schopnost citu a obětování se pro druhého, což Alquist vidí jako počátek nového lidstva.',
    languageAndStyle: 'Spisovný odborný a hovorový jazyk, rychlé dialogy, dramatický spád, filozofické úvahy. Poprvé použito slovo "robot".',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/r.u.r./',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioSource: 'Český rozhlas / MůjRozhlas'
  },
  {
    id: 'macha-maj',
    title: 'Máj',
    author: 'Karel Hynek Mácha',
    isbn: '9788073900014',
    period: 'Český romantismus (30. léta 19. století)',
    genre: 'Lyricko-epická básnická skladba',
    timeAndPlace: 'Máchův kraj kolem Bezdězu a Doks (Máchovo jezero), květen',
    themeAndMotifs: 'Tragická láska, osudovost, marnost života, láska k přírodě, vina a trest, posmrtný život.',
    characters: 'Vilém (strašný lesů pán, romantický hrdina), Jarmila (jeho milovaná), Hynek (autorovo alter ego/vypravěč).',
    plotSummary: 'Jarmila čeká na svém milovaného Viléma. Dozvídá se však, že Vilém zavraždil svého otce, který ji svedl (aniž by Vilém věděl, že jde o jeho otce). Vilém je uvězněn a čeká na popravu. Noc před popravou uvažuje o smyslu bytí a posmrtném prázdnu. Ráno je popraven. Po letech se na místo vrací sám básník (Hynek) a rozjímá nad pomíjivostí mládí.',
    languageAndStyle: 'Asonance, metafory, kontrast (krása jarní přírody vs. temná poprava), muzikálnost verše, jambický verš.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/maj/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'erben-kytice',
    title: 'Kytice',
    author: 'Karel Jaromír Erben',
    isbn: '9788073900021',
    period: 'Český romantismus / Národní obrození (19. století)',
    genre: 'Sbírka 13 balad',
    timeAndPlace: 'Český venkov, pohádkové a mýtické prostředí, neurčený čas',
    themeAndMotifs: 'Mateřská láska, porušení mravního řádu, vina a trest, osudovost, vztah matky a dítěte.',
    characters: 'Matky, dcery, nadpřirozené bytosti (Polednice, Vodník), lidé porušující přírodní a mravní zákony.',
    plotSummary: 'Sbírka obsahuje balady jako Polednice, Vodník, Svatební košile, Zlatý kolovrat či Štědrý den. Většina postav se dopustí prohřešku proti mravnímu řádu nebo přírodě (např. netrpělivost, neposlušnost, chamtivost) a následuje neúprosný trest.',
    languageAndStyle: 'Tradiční poetika, refrény, zvukomalba, stručné úderné dialogy, lidový jazyk.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/kytice/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioSource: 'Knihovny.cz'
  },
  {
    id: 'orwell-1984',
    title: '1984',
    author: 'George Orwell',
    isbn: '9788020718884',
    period: 'Světová literatura 2. poloviny 20. století',
    genre: 'Antiutopický (dystopický) román',
    timeAndPlace: 'Fiktivní budoucnost (rok 1984), Londýn, Oceánie',
    themeAndMotifs: 'Totalitní režim, manipulace s lidmi a historií, ztráta osobní svobody, Velký Bratr, Ideologie (Newspeak).',
    characters: 'Winston Smith (úředník na Ministerstvu pravdy), Julie (jeho milenka, tajná odpůrkyně režimu), O’Brien (představitel Vnitřní strany).',
    plotSummary: 'Winston Smith žije v totalitním režim pod neustálým dohledem Velkého Bratra. Vede si tajný deník a zamiluje se do Julie. Společně se pokusí zapojit do odboje, ale O’Brien je odhalí. Winston je mučen v Místnosti 101, dokud se nezřekne Julie a plně nepodlehne lásce k Velkému Bratrovi.',
    languageAndStyle: 'Chladný věcný styl, tvorba fiktivního jazyka Newspeak, temná atmosférická architektura.',
    ebookUrl: 'https://oceansofpdf.com/authors/george-orwell/pdf-epub-1984-download/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioSource: 'MůjRozhlas'
  },
  {
    id: 'exupery-maly-princ',
    title: 'Malý princ',
    author: 'Antoine de Saint-Exupéry',
    isbn: '9788000035048',
    period: 'Světová meziválečná literatura (20. století)',
    genre: 'Filozofická pohádka',
    timeAndPlace: 'Saharská poušť a různé fiktivní planetky (A-612)',
    themeAndMotifs: 'Přátelství, láska, odpovědnost, dětský pohled na svět vs. dospělost, hledání smyslu života.',
    characters: 'Malý princ (zvídavý chlapec z planetky B-612), Pilot (vypravěč, autorovo alter ego), Liška (učí ho přátelství), Růže.',
    plotSummary: 'Pilot havaruje v poušti, kde potkává Malého prince. Princ vypráví o cestování po planetkách a o své milované Růži. Potkává Lišku, která mu vysvětluje, že "správně vidíme jen srdcem". Nakonec se princ vrací na svou planetku.',
    languageAndStyle: 'Poetický a jednoduchý jazyk, metafory, alegorie, vlastní ilustrace autora.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/maly-princ/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioSource: 'Český rozhlas Dvojka'
  },
  {
    id: 'nemcova-babicka',
    title: 'Babička',
    author: 'Božena Němcová',
    isbn: '9788073900038',
    period: 'Český realizmus / Národní obrození (19. století)',
    genre: 'Povídkový román / Rozsáhlá próza',
    timeAndPlace: 'Staré Bělidlo v Ratibořickém údolí, 19. století',
    themeAndMotifs: 'Ideál lidskosti, české tradice, mezigenerační porozumění, vztah k přírodě a vlasti.',
    characters: 'Babička (Magdaléna Novotná), Barunka (vypravěčka), kněžna Zaháňská, Viktorka.',
    plotSummary: 'Babička přijíždí na Staré Bělidlo pomoci dceři s výchovou dětí. Svou moudrostí, dobrotou a úctou k tradicím si získává celé okolí včetně kněžny. Kniha zachycuje koloběh života a lidových zvyků v průběhu čtyř ročních období.',
    languageAndStyle: 'Archaismy, lidové výrazy, popisy lidových zvyků, idealizovaný realistický obraz.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/babicka/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'neruda-povidky-malostranske',
    title: 'Povídky malostranské',
    author: 'Jan Neruda',
    isbn: '9788073900045',
    period: 'Český realizmus / Májovci (19. století)',
    genre: 'Sbírka 13 povídek',
    timeAndPlace: 'Pražská Malá Strana, polovina 19. století',
    themeAndMotifs: 'Kritika maloměstského života, lidské osudy, humor, ironie, nostalgie po mládí.',
    characters: 'Pan Rybář (Hastrman), pan Vorel (Přivedla ho k ruině pěnovka), doktor Kazisvět, paní Ruska.',
    plotSummary: 'Soubor povídek popisuje pestrou figurkovou galerii obyvatel Malé Strany. Sledován je jejich každodenní život, předsudky, pomluvy i tragikomické osudy (např. v povídkách Hastrman, Jak si pan Vorel nakouřil pěnovku).',
    languageAndStyle: 'Živý hovorový jazyk, pražský slang, ironie, precizní charakteristiky postav.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/povidky-malostranske/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioSource: 'Český rozhlas Dvojka'
  },
  {
    id: 'jirasek-stare-povesti-ceske',
    title: 'Staré pověsti české',
    author: 'Alois Jirásek',
    isbn: '9788073900052',
    period: 'Česká historická próza (přelom 19. a 20. století)',
    genre: 'Sbírka pověstí a mýtů',
    timeAndPlace: 'České země od příchodu Praotce Čechů po historické události 18. století',
    themeAndMotifs: 'Národní hrdinství, české dějiny, boj za svobodu, tradice a mýty.',
    characters: 'Praotec Čech, Bivoj, Libuše, Přemysl Oráč, Horymír, Jan Žižka, Golem.',
    plotSummary: 'Kniha převypravuje nejznámější české mýty a historii – od příchodu Čechů na Říp, přes zakládání dynastie Přemyslovců, husitství až po pobělohorské období.',
    languageAndStyle: 'Archaizovaný spisovný jazyk, vlastenecký patos, plynulé vyprávění.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/stare-povesti-ceske/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioSource: 'Knihovny.cz'
  },
  {
    id: 'capek-bila-nemoc',
    title: 'Bílá nemoc',
    author: 'Karel Čapek',
    isbn: '9788073900144',
    period: 'Česká literatura meziválečného období (30. léta 20. století)',
    genre: 'Protiválečné protifašistické drama',
    timeAndPlace: 'Fiktivní evropský stát chystající se na válku',
    themeAndMotifs: 'Varování před fašismem a diktaturou, hodnota lidského života, lékařská etika, davová psychóza.',
    characters: 'Dr. Galén (chudý lékař, objevil lék), Maršál (diktátor, touží po válce), Baron Krüg (zbrojař).',
    plotSummary: 'Svět zachvátí smrtonosná "bílá nemoc". Dr. Galén objeví účinný lék, ale vydá ho pouze výměnou za podpis mírové dohody mezi státy. Když se nakonec nemocí nakazí i sám Maršál a souhlasí s mírem, je Galén na ulici ušlapán zfanatizovaným davem toužícím po válce.',
    languageAndStyle: 'Úderné dialogy, gradace napětí, filosofický podtext, charakterový kontrast postav.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/bila-nemoc/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'kafka-promena',
    title: 'Proměna',
    author: 'Franz Kafka',
    isbn: '9788073900151',
    period: 'Pražská německá literatura / Existencialismus (začátek 20. století)',
    genre: 'Existenciální povídka',
    timeAndPlace: 'Byt rodiny Samsů v Praze',
    themeAndMotifs: 'Otcizení, osamělost, neschopnost komunikace, ztráta lidské důstojnosti, rodinné vztahy.',
    characters: 'Řehoř Samsa (obchodní cestující, proměněný v hmyz), Markétka (jeho sestra), Otec, Matka.',
    plotSummary: 'Řehoř Samsa se jednoho rána probudí proměněn v obřího hmyzího tvora. Postupně ho opouští možnost práce i komunikace s rodinou. Přestože zpočátku o něj sestra pečuje, postupně se mu rodina odcizuje a vnímá ho jako břemeno. Řehoř nakonec zchátralý a osamělý umírá.',
    languageAndStyle: 'Chladný věcný popis absuridity, precizní jazyk, metaforické pojetí existence.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/promena/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'remarque-na-zapadni-fronte-klid',
    title: 'Na západní frontě klid',
    author: 'Erich Maria Remarque',
    isbn: '9788024921021',
    period: 'Světová meziválečná literatura / Ztracená generace',
    genre: 'Protiválečný román',
    timeAndPlace: 'Západní fronta 1. světové války (Francie), 1914–1918',
    themeAndMotifs: 'Hrůzy války, ztracená generace, přátelství na život a na smrt, odcizení od běžného života.',
    characters: 'Paul Bäumer (vypravěč, mladý voják), Stanislaus Katczinsky (zkkušený kamarád Katcza), Kantorek (učitel).',
    plotSummary: 'Skupina spolužáků z gymnázia podlehne nacionalistické propagandě a dobrovolně narukuje do války. Paul Bäumer popisuje drsnou realitu zákopů, smrt přátel i psychickou devastaci. V říjnu 1918, v den, kdy je na celém bojišti klid, Paul v boji padne.',
    languageAndStyle: 'Syrový naturalistický jazyk, ich-forma, kontrast vzpomínek na mládí a válečných hrůz.',
    ebookUrl: 'https://oceansofpdf.com/authors/erich-maria-remarque/pdf-epub-all-quiet-on-the-western-front-download/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioSource: 'Český rozhlas Dvojka'
  },
  {
    id: 'hemingway-starec-a-more',
    title: 'Stařec a moře',
    author: 'Ernest Hemingway',
    isbn: '9788020716491',
    period: 'Světová literatura 2. poloviny 20. století / Ztracená generace',
    genre: 'Filozofická novela',
    timeAndPlace: 'Kubánský záliv nedaleko Havany, 40. léta 20. století',
    themeAndMotifs: 'Boj člověka s přírodou, nezlomnost lidské vůle, nezdolnost, motiv "Člověka lze zničit, ale ne porazit".',
    characters: 'Santiago (starý kubánský rybář), Manolin (mladý chlapec, jeho věrný pomocník).',
    plotSummary: 'Rybář Santiago po 84 dnech bez úlovku vyjíždí sám daleko na moře. Chytí obřího marlina, se kterým svádí dvoudenní vyčerpávající boj. Po ulovení ryby však na jeho úlovek zaútočí žraloci. Do přístavu přiváží pouze ohlodanou kostru, ale získává neohroženou úctu okolí.',
    languageAndStyle: 'Metoda ledovce (úsporný vyprávěcí styl), přímočaré věty, symbolika a metafory.',
    ebookUrl: 'https://oceansofpdf.com/authors/ernest-hemingway/pdf-epub-the-old-man-and-the-sea-download/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioSource: 'MůjRozhlas'
  },
  {
    id: 'shakespeare-romeo-a-julie',
    title: 'Romeo a Julie',
    author: 'William Shakespeare',
    isbn: '9788073900069',
    period: 'Alžbětínské divadlo / Světová renesance (16. století)',
    genre: 'Tragédie o 5 dějstvích',
    timeAndPlace: 'Italská Verona a Mantova, 16. století',
    themeAndMotifs: 'Nenaplněná a tragická láska, rodová zášť (Kapuleti vs. Montekové), osudovost, mládí.',
    characters: 'Romeo Montek, Julie Kapuletová, Merkucio, Tybalt, Bratr Vavřinec.',
    plotSummary: 'Dva rodiny ve Veroně spolu soupeří v krvavé zášti. Romeo se zamiluje do Julie na plese Kapuletů. S pomocí bratra Vavřince se tajně oddají. Po potyčce zabije Romeo Tybalta a je vyhnán. Julie se má provdat za Parida, a proto užije uspávací lektvar. Romeo ji považuje za mrtvou a vypije jed. Po probuzení se Julie proklaje jeho dýkou. Rodiny se nad jejich těly smíří.',
    languageAndStyle: 'Blankvers (nerýmovaný pětistopý jamb), vznešený i lidový jazyk, metafory a slovní hříčky.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/romeo-a-julie/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'moliere-lakomec',
    title: 'Lakomec',
    author: 'Molière',
    isbn: '9788073900076',
    period: 'Francouzský klasicismus (17. století)',
    genre: 'Komedie o 5 dějstvích',
    timeAndPlace: 'Paříž, 17. století, dům Harpagonův',
    themeAndMotifs: 'Chamtivost, lakota deformující lidské vztahy, střet generací, pokrytectví.',
    characters: 'Harpagon (vdovec, extrémní lakomec), Kleant (jeho syn), Elisa (jeho dcera), Mariana, Valér.',
    plotSummary: 'Harpagon je chorobný lakomec, který miluje své peníze více než vlastní děti. Chce výhodně provdat dceru i syna bez ohledu na jejich cit. Když mu je ukradena truhlička s penězi, Harpagon šílí. Nakonec souhlasí se svatbami dětí pod podmínkou, že nezaplatí ani soubor a truhla se mu vrátí.',
    languageAndStyle: 'Komedie charakterů, živé dialogy, nedorozumění, nedodržení klasicistní trojednoty děje.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/lakomec/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioSource: 'Český rozhlas Dvojka'
  },
  {
    id: 'hasek-svejk',
    title: 'Osudy dobrého vojáka Švejka za světové války',
    author: 'Jaroslav Hašek',
    isbn: '9788073900083',
    period: 'Česká literatura meziválečného období (1. polovina 20. století)',
    genre: 'Satirický humorný román',
    timeAndPlace: 'Praha, Rakousko-Uhersko, bojiště 1. světové války',
    themeAndMotifs: 'Absurdita války, absurdita byrokracie, pasivní rezistence, geniální předstíraná blbost.',
    characters: 'Josef Švejk (úředně uznaný blb), nadporučík Lukáš, polní kurát Katz, hostinský Palivec.',
    plotSummary: 'Josef Švejk se po atentátu v Sarajevu dostává do kolotoče výslechů, blázince a narukuje do rakousko-uherské armády. Prochází řadou komických situací s nadporučíkem Lukášem i polním kurátem Katzem. Svojí důslednou poslušností a plněním absurdních rozkazů dovádí nadřízené k šílenství.',
    languageAndStyle: 'Lidový pražský jazyk, germanismy, vulgarismy, lidová vyprávění a anekdoty.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/svejk/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioSource: 'Český rozhlas / MůjRozhlas'
  },
  {
    id: 'dyk-krysar',
    title: 'Krysař',
    author: 'Viktor Dyk',
    isbn: '9788073900090',
    period: 'Česká literatura počátku 20. století / Anarchističtí buřiči',
    genre: 'Novela / Filosofická balada',
    timeAndPlace: 'Německé město Hameln, neurčený čas',
    themeAndMotifs: 'Touha po plnosti života vs. maloměstská lhostejnost, láska, pomsta, iluze a realita.',
    characters: 'Krysař (tajemný samotář s čarovnou píšťalou), Agnes (jeho milovaná), Sepp Jörgen (chudý rybář, pomalý myslitel).',
    plotSummary: 'Krysař přijíždí do města Hameln, aby zbavil obyvatele krys pomocí své kouzelné píšťaly. Zamiluje se do Agnes. Radní města mu však odmítnou zaplatit slíbenou odměnu. Když se Agnes ze žalu vrhne do propasti, zklamaný Krysař zahraje na píšťalu plným tónem a odvede všechny obyvatele do propasti. Přežije pouze Sepp Jörgen, který uslyší pláč dítěte.',
    languageAndStyle: 'Kratší úderné věty, refrény, symbolika, romantické a novoromantické prvky.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/krysar/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'bezruc-slezske-pisne',
    title: 'Slezské písně',
    author: 'Petr Bezruč',
    isbn: '9788073900106',
    period: 'Česká literatura přelomu 19. a 20. století / Česká moderna',
    genre: 'Básnická sbírka (sociální balady)',
    timeAndPlace: 'Slezsko a Těšínsko, konec 19. století',
    themeAndMotifs: 'Sociální a národnostní útlak Slezanů, výzva ke vzpouře, láska k rodnému kraji, motivy dolů a těžby.',
    characters: 'Ostrava, slezský lid, markýz GerO (utlačovatel), bard (básník sám).',
    plotSummary: 'Sbírka obsahuje ikonické básně jako Ostrava, Maryčka Magdonova, Bernard Žár či 70.000. Básník vystupuje jako mluvčí utlačovaného slezského lidu, který trpí pod německou a polskou nadvládou i bezohledným kapitalismem.',
    languageAndStyle: 'Slezský dialekt, hornické výrazy, zvolání, řečnické otázky, úderný rytmus.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/slezske-pisne/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioSource: 'Knihovny.cz'
  },
  {
    id: 'hrabal-ostre-sledovane-vlaky',
    title: 'Ostře sledované vlaky',
    author: 'Bohumil Hrabal',
    isbn: '9788020712349',
    period: 'Česká literatura 2. poloviny 20. století (60. léta)',
    genre: 'Próza s válečnou tematikou / Novela',
    timeAndPlace: 'Železniční stanice Kostomlaty za 2. světové války (1945)',
    themeAndMotifs: 'Hrdinství obyčejného člověka, dospívání, odboj proti fašismu, tragika a komika.',
    characters: 'Miloš Hrma (mladý elév na nádraží), výpravčí Hubička (požitkář a odbojář), přednosta stanice.',
    plotSummary: 'Miloš Hrma nastupuje na železniční stanici a potýká se s osobním traumatem nezdaru při milostném splynutí. Na nádraží projíždějí ostře sledované německé vlaky. Výpravčí Hubička naplánuje odpálení německého transportu se zbraněmi. Miloš dostane za úkol hodit na vlak nálož. Úkol splní, ale v přestřelce je smrtelně zraněn.',
    languageAndStyle: 'Hrabalovský pábitelský styl, asociativní vyprávění, hovorový jazyk, tragikomický tón.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/ostre-sledovane-vlaky/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'fuks-spalovac-mrtvol',
    title: 'Spalovač mrtvol',
    author: 'Ladislav Fuks',
    isbn: '9788020713452',
    period: 'Česká literatura 2. poloviny 20. století (60. léta)',
    genre: 'Psychologická groteskně-hororová novela',
    timeAndPlace: 'Praha, obdobé před a na začátku 2. světové války (1937–1938)',
    themeAndMotifs: 'Fašistická manipulace, proměna charakteru v monstrum, iluze čistoty a spásy skrze smrt.',
    characters: 'Karel Kopfrkingl (zaměstnanec krematoria), Lakmé (jeho židovská manželka), Willi Reinke (nacistický přítel).',
    plotSummary: 'Karel Kopfrkingl je příkladný otec a pracovník pražského krematoria. Pod vlivem nacistického přítele Williho Reinkeho a propagandy o árijské krvi podlehne nacismu. Začne věřit, že smrt v krematoriu osvobozuje lidské duše. Aby očistil svou rodinu, zavraždí židovskou manželku i syna Milivoje.',
    languageAndStyle: 'Opakující se motivy a věty, mrazivý až bizarní jazyk, černý humor, psychologická hloubka.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/spalovac-mrtvol/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioSource: 'Český rozhlas Vltava'
  },
  {
    id: 'pavel-smrt-krasnych-srncu',
    title: 'Smrt krásných srnců',
    author: 'Ota Pavel',
    isbn: '9788020714565',
    period: 'Česká literatura 2. poloviny 20. století (70. léta)',
    genre: 'Soubor autobiografických povídek',
    timeAndPlace: 'Pootaví, Křivoklátsko a Praha, před a během 2. světové války',
    themeAndMotifs: 'Láska k přírodě a rybaření, rodinná soudržnost, nacistická perzekuce, optimismus navzdory osudu.',
    characters: 'Leo Popper (tatínek, obratný obchodník a vášnivý rybář), maminka, Prošek (porybný).',
    plotSummary: 'Kniha vzpomíná na dětství a otce Lea Poppera. Tatínek je okouzlující snílek a obchodník s vysavači. Když synům hrozí odtransportování do koncentračního tábora, tatínek se vydává na Křivoklátsko s pomocí psa Holana ulovit srnce, aby chlapcům před odjezdem zajistil maso.',
    languageAndStyle: 'Lyrický vyprávěcí tón, humor, dojetí, autentičnost, vnímavé popisy přírody.',
    ebookUrl: 'https://www.mlp.cz/cz/katalog-sluzeb/eknihy/smrt-krasnych-srncu/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioSource: 'Český rozhlas Dvojka'
  }
];
