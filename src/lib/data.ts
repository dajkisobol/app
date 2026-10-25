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
        prompt: 'Ve které z možností je chyba v psaní velikosti písmen?',
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

export interface BookAnalysis {
  id: string;
  title: string;
  author: string;
  period: string; // např. Česká literatura 20. století
  genre: string; // např. Drama / Sci-fi
  timeAndPlace: string;
  themeAndMotifs: string;
  characters: string;
  plotSummary: string;
  languageAndStyle: string;
  ebookUrl?: string; // odkaz na stažení z MLP / Oceansofpdf
  audiobookUrl?: string; // mp3 stream nebo odkaz
  audioSource?: string; // MůjRozhlas / Vltava
}

export const BOOK_CATALOG: BookAnalysis[] = [
  {
    id: 'capek-rur',
    title: 'R.U.R.',
    author: 'Karel Čapek',
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
    period: 'Světová literatura 2. poloviny 20. století',
    genre: 'Antiutopický (dystopický) román',
    timeAndPlace: 'Fiktivní budoucnost (rok 1984), Londýn, Oceánie',
    themeAndMotifs: 'Totalitní režim, manipulace s lidmi a historií, loss od osobní svobody, Velký Bratr, Ideologie (Newspeak).',
    characters: 'Winston Smith (úředník na Ministerstvu pravdy), Julie (jeho milenka, tajná odpůrkyně režimu), O’Brien (představitel Vnitřní strany).',
    plotSummary: 'Winston Smith žije v totalitním režim pod neustálým dohledem Velkého Bratra. Vede si tajný deník a zamiluje se do Julie. Společně se pokusí zapojit do odboje, ale O’Brien je odhalí. Winston je mučen v Místnosti 101, dokud se nezřekne Julie a plně nepodlehne lásce k Velkému Bratrovi.',
    languageAndStyle: 'Chladný věcný styl, tvorba fiktivního jazyka Newspeak, temná atmosférická architektura.',
    ebookUrl: 'https://oceansofpdf.com/authors/george-orwell/pdf-epub-1984-download/',
    audiobookUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioSource: 'MůjRozhlas'
  }
];
