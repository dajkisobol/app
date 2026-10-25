# Kompletní maturitní testy ČJL

## Zdroje

Ověřeno 25. 10. 2026 přímo proti archivu CZVV:

https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi/cesky-jazyk-a-literatura/testy-a-zadani-cesky-jazyk.html

| Termín | Kód | Originální zadání | Oficiální klíč |
| --- | --- | --- | --- |
| Jaro 2026 | CJMZD26C0T01 | https://maturita.cermat.cz/files/files/CJL_2026j_TS.pdf | https://maturita.cermat.cz/files/files/CJL_2026j_KSR.pdf |
| Podzim 2026 | CJMZD26C0T04 | https://maturita.cermat.cz/files/files/CJL_2026p_TS.pdf | https://maturita.cermat.cz/files/files/CJL_2026p_KSR.pdf |
| Jaro 2025 | CJMZD25C0T01 | https://maturita.cermat.cz/files/files/CJL_2025j_TS.pdf | https://maturita.cermat.cz/files/files/CJL_2025j_KS%C5%98_web.pdf |
| Podzim 2025 | CJMZD25C0T04 | https://maturita.cermat.cz/files/files/CJMAD25C0T04_web.pdf | https://maturita.cermat.cz/files/files/CJL_Kl%C3%AD%C4%8D_spr%C3%A1vn%C3%BDch_%C5%99e%C5%A1en%C3%AD.pdf |
| Jaro 2024 | CJMZD24C0T01 | https://maturita.cermat.cz/files/files/CJL_MZ2024J_DT.pdf | https://maturita.cermat.cz/files/files/CJMZD24C0K01_web.pdf |
| Podzim 2024 | CJMZD24C0T04 | https://maturita.cermat.cz/files/files/%C4%8CJL_MZ2024P_TS.pdf | https://maturita.cermat.cz/files/files/%C4%8CJL_MZ2024P_KS%C5%98_web.pdf |
| Jaro 2023 | CJMZD23C0T01 | https://maturita.cermat.cz/files/files/CJL_jaro_2023_sada_A_DT.pdf | https://maturita.cermat.cz/files/files/CJL_jaro_2023_sada_A_klic_na_web.pdf |
| Podzim 2023 | CJMZD23C0T04 | https://maturita.cermat.cz/files/files/CJL_podzim_2023_DT.pdf | https://maturita.cermat.cz/files/files/CJMZD23C0K04_Web_rozsireny_klic.pdf |

Všech osm testů z let 2023–2026 obsahuje 32 hlavních úloh s příslušnými podúlohami, maximálně 50 bodů. Hranice úspěšnosti je 22 bodů / 44 %. Standardní limit ČJL je 85 minut. Staré ukázkové sady označené jako oficiální testy byly odstraněny.

Sešity jsou vložené přímo z oficiálního serveru do PDF prohlížeče. Repo neobsahuje kopie chráněných literárních ukázek ani celé testy. Zůstává zachováno původní formátování, podtržení, tučné písmo, obrázky, stránkování i autorské údaje. Vložení vyžaduje internet a podporu PDF v prohlížeči; pro mobily a nepodporované prohlížeče je vždy dostupné otevření originálního PDF v samostatné kartě. Školní síť či rozšíření prohlížeče mohou načítání externího PDF blokovat.

`src/lib/cermat.ts` obsahuje faktické odpovědní klíče, rozložení úloh a bodovací pravidla přepsaná z oficiálních klíčů. Externí projekt rsamec/cermat byl prozkoumán při hledání podkladů, ale jeho texty ani kód nebyly převzaty.

V knihovně lze filtrovat ročník a jarní či podzimní termín. Přímý odkaz `#testy` otevře seznam testů. Stávající ID sad a formát rozpracovaných odpovědí jsou zachovány.

## Bodování

- A–D: 1 bod za správnou odpověď.
- Čtyři tvrzení A/N: 2 body za 4 správná, 1 bod za 3 správná, jinak 0.
- Řazení: 3 body pouze za celé správné pořadí.
- Přiřazování: 1 bod za správnou podúlohu.
- Výpis slov: maximum minus chybějící slova minus nadbytečné odpovědi, nejméně 0 bodů. Pořadí není důležité; opakované slovo je nadbytečné. Oddělovače jsou čárka, středník nebo nový řádek, nikoli mezera uvnitř víceslovné odpovědi.
- Dvě hledaná slova v úloze 10 z podzimu 2025 přinášejí dohromady jen 1 bod; neúplná odpověď nebo slovo navíc znamená 0 bodů.
- U slovních tvarů v samostatných podúlohách se respektují výslovně uvedené alternativy (např. „bych zapomněl / bych zapomenul“, „několik / několika / pár“).
- Úloha 30 z jara 2023 vyžaduje malé počáteční písmeno ve slově „amerických“; na jiné odpovědi se toto zvláštní pravidlo nepřenáší.
- Jména v úloze 19 z jara 2023 respektují výjimky pro i/y, zdvojené souhlásky a diakritiku podle klíče. U jména Homér se tolerují chyby v délce samohlásek, nikoli libovolné změny hlásek.
- Diakritika se toleruje pouze tam, kde ji výslovně připouští klíč. Úlohy oprav pravopisu ji musí zachovat.
- Otevřené úlohy mohou připouštět i jiné náležité tvary. Automatický slovník není morfologický analyzátor; po odevzdání je u těchto úloh uveden úplný klíč, komentované řešení a možnost vlastní opravy bodů. Automatický výsledek je orientační.

Časovač vychází z počátečního času, nikoli z počtu tiknutí; přepnutí karty, uspání počítače ani obnovení stránky čas nezastaví. Po limitu se odpovědi uzamknou. Trénink nemá limit. Odevzdání vyžaduje potvrzení a upozorní na nevyplněné úlohy.

## Ukládání

Rozpracovaný test, poslední výsledek a odkazy na chybné úlohy se ukládají do `localStorage`, odděleně podle ID uživatele (anonymní režim má vlastní klíč). Neukládají se PDF ani výchozí texty. Přihlášenému uživateli se po tlačítku „Uložit výsledek a chyby“ zapisuje výsledek i do stávající tabulky Supabase `test_results`; `total_questions` je skutečný počet úloh (32), `score` jsou získané body z 50. Chybné úlohy se uchovávají pouze v daném prohlížeči, bez změny databázového schématu. Dříve uložené cvičné chyby zůstávají dostupné odděleně.

## Ověření

`npm test` spouští regresní testy dat, úplného skóre, částečných bodů, hranice úspěšnosti, otevřených odpovědí a časovače pomocí vestavěného Node.js test runneru (Node.js 22.18+ / 24).

Při přidání dalšího termínu ověř originální sešit, klíč, komentované řešení, všechny odpovědi a součet maximálních bodů. Nesmí se jen doplnit náhodné otázky do počtu 50.

V cloudovém Chromium bránila přímému HTTPS zobrazení nedůvěra k místnímu síťovému proxy. Originální soubory a odkazy byly ověřeny přes systémový TLS klient bez vypnutí ověřování. Browserové regresní kontroly používají stažené originály jako místní testovací fixture; tyto PDF nejsou součástí repozitáře. Změna trvalého úložiště certifikátů nebyla provedena.

## Ověření doplněných ročníků 2023–2025

Ze skutečných odkazů oficiálního archivu bylo přes ověřené HTTPS staženo a zkontrolováno 18 dokumentů: šest zadání, šest klíčů a šest komentovaných řešení. `docs/cermat-source-verification.json` zaznamenává jejich URL, počet stran, velikost, SHA-256 a datum ověření. PDF slouží jen jako místní podklady pro kontrolu a nejsou distribuována v aplikaci.

Odpovědi, počty podúloh, nabízené možnosti a stránky výchozích textů byly porovnány s originály. Některé starší klíče obsahují skryté duplicitní textové vrstvy; nejasné tabulky byly ověřeny i vizuálně v renderovaných původních PDF. Testy zahrnují všech osm sad po 32 úlohách a 50 bodech i příklady částečného bodování a pravopisných výjimek z oficiálních klíčů.

Prošlo všech 44 automatických testů. V Chromium byla každá z šesti nových sad skutečně vyplněna a odevzdána s výsledkem 50/50; ověřeny byly i alternativní správné odpovědi, kombinace filtrů, časový režim, obnovení rozpracované odpovědi a dokončeného výsledku, správné odkazy na zadání a řešení a mobilní šířky 320/390 px. Pro PDF iframe byly použity lokální kopie týchž oficiálních dokumentů jako dočasné browserové fixture, nikoli náhradní nebo zkrácená zadání.
