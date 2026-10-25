# E-knihy a audioknihy: zdroje a hranice dostupnosti

Stav ověřen 25. 10. 2026. Katalog obsahuje 200 titulů. Přímo v repozitáři je 36 úplných českých e-knih (36 EPUB a navíc alternativa R.U.R. v TXT) a jedna úplná nahraná česká audiokniha: Krysař, Viktor Dyk, čte Kudrna, LibriVox, 26 kapitol, 2:18:39.

Není pravda, že všech 200 titulů má ověřenou volnou e-knihu i audioknihu. U zbývajících titulů to rozhraní výslovně uvádí, nabízí vyhledání legální nabídky a import vlastních souborů. Vyhledávač ani stránka katalogu nejsou vykazovány jako dostupný soubor. Nejsou použity pirátské kopie ani demo hudba SoundHelix.

## Původ a licence

EPUB pocházejí z veřejných repozitářů projektu next-book / books-are-next a vydání Městské knihovny v Praze. Importovány byly pouze knihy, jejichž vlastní tiráž výslovně uvádí, že text není vázán autorskými právy, a současně udává licenci vydání CC BY-NC-SA 3.0 CZ. Tiráž každé knihy je uložena vedle nezměněného EPUB v LICENSE.md. Odkazy v manifestu jsou připnuty ke konkrétnímu commitu původního repozitáře. Tato vydání je nutné šířit s atribucí, zachováním licence a nekomerčně; ostatní novodobé překlady a chráněná díla nebyly převzaty.

Alternativní TXT R.U.R. pochází z Project Gutenberg #13083 v češtině. Autor Karel Čapek zemřel v roce 1938. Soubor je nezměněný včetně původní licenční hlavičky a plné licence; samostatná licence je také přiložena.

Nahrávka Krysaře je z https://librivox.org/krysar-by-viktor-dyk/ a https://archive.org/details/krysar_2007_librivox. Archiv ji označuje Public Domain Mark 1.0; původní český text je z roku 1915, autor zemřel 1931. Každý ze 26 MP3 byl při stažení porovnán s MD5 zveřejněným archivem. Následný kontrolní SHA-256 a velikost každého souboru jsou v manifestu. Soubory ani nahrávka nebyly upravovány. Načítají se podle kapitol, ne celá audiokniha naráz.

## Implementace

- `src/lib/book-media.json` je jediný manifest skutečně distribuovaných souborů. Obsahuje skutečný jazyk, původ, licenci, cestu, velikost a kontrolní otisk. Žádné adresy se nehádají z názvu knihy.
- `public/books/` obsahuje hotové soubory. Pro čtení ani poslech distribuovaných knih není potřeba kontaktovat původní web nebo externí CORS proxy. Veškeré cesty respektují basePath z next.config.ts, včetně GitHub Pages pod `/app`.
- Čtečka EPUB respektuje pořadí spine, zobrazuje text všech čitelných kapitol a umožňuje měnit velikost písma. Záměrně nespouští skripty, nenačítá vzdálené zdroje ani nevkládá původní HTML do DOM. Původní sazba, ilustrace a grafická obálka nejsou v textové čtečce reprodukovány; kompletní nezměněný EPUB je ke stažení.
- PDF používá prohlížeč s odkazem na samostatné otevření. EPUB s textovým DRM se neodemyká; uživatel má použít autorizovanou čtečku poskytovatele.
- Syntetické předčítání textu využívá český hlas zařízení a je takto výslovně označeno. Není vydáváno za lidskou nahrávku ani nevyžaduje vymyšlené MP3. Pokud český hlas není dostupný, funkce je vypnutá s vysvětlením. Předčítá se zvolená kapitola, nikoli automaticky všechny kapitoly knihy.
- Skutečný audio přehrávač má seznam kapitol, přechod na další kapitolu, pozici, rychlost, pauzu, opakování a chybové stavy. Stav „hraje“ vzniká až událostí skutečného přehrávání. Zavření je dostupné i na mobilu.
- Ke všem 200 titulům lze připojit vlastní EPUB/PDF/TXT a MP3/M4A/M4B/OGG/OPUS/WAV/AAC. Vlastní soubory zůstávají v IndexedDB daného prohlížeče a uživatelského profilu, neposílají se na server, do Supabase ani na GitHub. Uživateli je vysvětleno, že nejde o zálohu a že smazání dat prohlížeče soubory odstraní. Formát musí podporovat jeho prohlížeč.

## Externí hledání

Staré neexistující adresy `/cz/katalog-sluzeb/eknihy/<název>/` i odkazy OceansOfPDF byly odstraněny z aplikačních dat. Oficiální MLP vyhledávání dnes přesměrovává ze search.mlp.cz na `https://www.mlp.cz/katalog/?query=...`; aplikace používá tuto kanonickou adresu. Ověřena byla HTTP 200 a skutečná hodnota query ve vyhledávání Palmknih (`https://www.palmknihy.cz/vyhledavani?query=...`). Palmknihy jsou označené jako nabídka, která může být placená. LibriVox vyhledávání používá jejich skutečný formulář. Výsledek hledání ani budoucí dostupnost externích služeb nejsou zaručeny.

Kontrola katalogu Knihovny.cz z cloudového klienta dostala ochranu proti botům (418); nejde o důkaz neexistující knihy. Aplikace tento katalog nenabízí jako přímé stažení. Audiolibrix v cloudovém klientu neodpovídal spolehlivě a nebyl použit pro přímé soubory.

## Kontroly

`npm test` kontroluje i identitu titulů, fyzickou přítomnost souborů, SHA-256, velikosti, licence, EPUB kontejnery a jejich pořadí kapitol, úplnost 26 MP3 i absenci falešných aplikačních odkazů. Testy běží v GitHub Actions před nasazením (Node.js 24). Žádný build nestahuje obsah z neověřených stránek.

V Chromium byly navíc postupně otevřeny všechny distribuované EPUB, ověřeno skutečné vykreslení textu kapitol, osobní import TXT, bezpečné zobrazení doslovného HTML v textu, IndexedDB po obnovení stránky, mazání souboru a skutečné přehrávání zvuku s pauzou, změnou rychlosti a kapitolou. Syntetické hlasy závisí na zařízení a v headless Chromium bez českého hlasu jsou správně nedostupné.

## Distribuované soubory

| Titul | Formát | Původní vydání / nahrávka |
| --- | --- | --- |
| Ílias | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/homeros-ilias/tree/91083a067ada7c9784c73e84f49d348c8f00f3ca) |
| Božská komedie | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/bozska-komedie/tree/9442d4d1328f891841cd4259f3c43f8364a323ae) |
| Hamlet | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/shakespeare-hamlet/tree/2e4b71f03b3181ba8944f3da3113ee1bb7a7ad58) |
| Romeo a Julie | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/romeo-a-julie/tree/b850b8555334165e55e8adb20a1abac734abbf95) |
| Zkrocení zlé ženy | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/zkroceni-zle-zeny/tree/cdf3b107fe328c4183a878f5eb4225fcea6ff978) |
| Lakomec | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/lakomec/tree/584ab2ef4f695b3b729ec4f215bf4abe8d0e1fc2) |
| Robinson Crusoe | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/robinson-crusoe/tree/474fcaa641dcfbe0da6fc2f5749102ff3e917ae5) |
| Dalimilova kronika | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/dalimilova-kronika/tree/3203e55cf62b136e213964ef9ff335ee3a8ca8fd) |
| Labyrint světa a ráj srdce | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/labyrint-sveta-a-raj-srdce/tree/3787d210b02d135aa53d91f01862a26d4cba4a43) |
| Co Bůh? Člověk? | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/co-buh-clovek/tree/0c598950c170a993ebc1c35f31cc878bc67ead76) |
| Křest svatého Vladimíra | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/krest-svateho-vladimira/tree/3c63595beb6219d06420517bcd9bfe046ab4d6d4) |
| Tyrolské elegie | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/tyrolske-elegie/tree/5570c5c75fb126026812ee06eed592aed580bf6c) |
| Epigramy | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/epigramy/tree/d79b4d9012dd3ab4cce5e6e101773222c4189f1e) |
| Strakonický dudák | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/strakonicky-dudak/tree/8b2c61b805b700b8336342c383e7ef0ef7c4c427) |
| Babička | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/babicka/tree/e94ffd84964a839c6fc209644ba8cfbc78ec8c91) |
| Divá Bára | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/diva-bara/tree/3573aa296199b04ba21039682485ceaef352d05a) |
| Faust | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/goethe-faust/tree/eb545102c2a0d3d47106cbdb0d2f35aefaee4dea) |
| Evžen Oněgin | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/puskin-evzen-onegin/tree/5ea2b9d1933c8a62e168326f662732f72a5eb0e8) |
| Červený a černý | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/stendhal-cerveny-a-cerny/tree/a476fbecb66b08ca5978533d4eee92139fb6e1f2) |
| Havran a jiné básně | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/poe-havran/tree/2dd0fd45ebc61e0697767cd4ff67dc964f871bc2) |
| Pes baskervillský | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/pes-baskervillsky/tree/2dcc23287f12e789e329fe16ebfd5ba02c530a91) |
| Máj | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/maj/tree/e3a1834fcd84dcd0579ceba1ca6138944b48fa59) |
| Kytice | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/erben-kytice/tree/a982d55f5af1a961c602527bd2615faeed94d94c) |
| Povídky malostranské | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/povidky-malostranske/tree/74a7f42050dce0d9264644382fdf27c5104b1535) |
| Balady a romance | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/balady-a-romance/tree/0c2bed06c4fa651c214d2d2d97dda7efe234cbe0) |
| Temno | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/temno/tree/696880b426ce3eb2f2a3b6d8ca926961d7cc51ca) |
| Maryša | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/marysa/tree/969e0050cef71798209c8edf9c04bbd0bc6c537f) |
| Krysař | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/dyk-krysar/tree/ecee4fdd69e863bbcbfa740f86820494c34455dd) |
| R.U.R. | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/capek-rur/tree/495c501936594c102f643adb6acc502644e9fc24) |
| Matka | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/matka/tree/3c4c3a82794ca69210622444f874404a1d359f44) |
| Válka s mloky | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/valka-s-mloky/tree/4bffc3268d65b0c65211da736e6656a36da2670d) |
| Krakatit | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/capek-krakatit/tree/a6a4ec0270ab52212388c61fe3d867eb15491594) |
| Rozmarné léto | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/vancura-rozmarne-leto/tree/b5a653426fd69a07791dedb056a7919d54847051) |
| Marketa Lazarová | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/marketa-lazarova/tree/ca4b5c347e980802ac79721a7125973594e39f53) |
| Těžká hodina | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/tezka-hodina/tree/546316eaf5701352d864e99cb9c43bffd9d1a3bb) |
| Petrolejové lampy | EPUB | [Městská knihovna v Praze / next-book](https://github.com/books-are-next/petrolejove-lampy/tree/8ee5e65e74fdf28b78f41d1d6b38d6a5e3f6d91b) |
| R.U.R. | TXT | [Project Gutenberg](https://github.com/GITenberg/R.U.R._13083/tree/7ed743dcd772d0dcbcbfa54aa904169d14a87270) |
| Krysař — celá audiokniha | MP3 | [LibriVox · čte Kudrna](https://librivox.org/krysar-by-viktor-dyk/) |
