# Kompletní maturitní testy ČJL

## Zdroje

Ověřeno 25. 10. 2026 přímo proti archivu CZVV:

https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi/cesky-jazyk-a-literatura/testy-a-zadani-cesky-jazyk.html

| Termín | Kód | Originální zadání | Oficiální klíč |
| --- | --- | --- | --- |
| Jaro 2026 | CJMZD26C0T01 | https://maturita.cermat.cz/files/files/CJL_2026j_TS.pdf | https://maturita.cermat.cz/files/files/CJL_2026j_KSR.pdf |
| Podzim 2026 | CJMZD26C0T04 | https://maturita.cermat.cz/files/files/CJL_2026p_TS.pdf | https://maturita.cermat.cz/files/files/CJL_2026p_KSR.pdf |

Oba testy obsahují 32 úloh (včetně podúloh), maximálně 50 bodů. Hranice úspěšnosti je 22 bodů / 44 %. Standardní limit ČJL je 85 minut. Staré ukázkové sady označené jako oficiální testy byly odstraněny.

Sešity jsou vložené přímo z oficiálního serveru do PDF prohlížeče. Repo neobsahuje kopie chráněných literárních ukázek ani celé testy. Zůstává zachováno původní formátování, podtržení, tučné písmo, obrázky, stránkování i autorské údaje. Vložení vyžaduje internet a podporu PDF v prohlížeči; pro mobily a nepodporované prohlížeče je vždy dostupné otevření originálního PDF v samostatné kartě. Školní síť či rozšíření prohlížeče mohou načítání externího PDF blokovat.

`src/lib/cermat.ts` obsahuje faktické odpovědní klíče, rozložení úloh a bodovací pravidla přepsaná z oficiálních klíčů. Externí projekt rsamec/cermat byl prozkoumán při hledání podkladů, ale jeho texty ani kód nebyly převzaty.

## Bodování

- A–D: 1 bod za správnou odpověď.
- Čtyři tvrzení A/N: 2 body za 4 správná, 1 bod za 3 správná, jinak 0.
- Řazení: 3 body pouze za celé správné pořadí.
- Přiřazování: 1 bod za správnou podúlohu.
- Výpis slov: maximum minus chybějící slova minus nadbytečné odpovědi, nejméně 0 bodů. Pořadí není důležité; opakované slovo je nadbytečné. Oddělovače jsou čárka, středník nebo nový řádek, nikoli mezera uvnitř víceslovné odpovědi.
- Diakritika se toleruje pouze tam, kde ji výslovně připouští klíč. Úlohy oprav pravopisu ji musí zachovat.
- Otevřené úlohy mohou připouštět i jiné náležité tvary. Automatický slovník není morfologický analyzátor; po odevzdání je u těchto úloh uveden úplný klíč, komentované řešení a možnost vlastní opravy bodů. Automatický výsledek je orientační.

Časovač vychází z počátečního času, nikoli z počtu tiknutí; přepnutí karty, uspání počítače ani obnovení stránky čas nezastaví. Po limitu se odpovědi uzamknou. Trénink nemá limit. Odevzdání vyžaduje potvrzení a upozorní na nevyplněné úlohy.

## Ukládání

Rozpracovaný test, poslední výsledek a odkazy na chybné úlohy se ukládají do `localStorage`, odděleně podle ID uživatele (anonymní režim má vlastní klíč). Neukládají se PDF ani výchozí texty. Přihlášenému uživateli se po tlačítku „Uložit výsledek a chyby“ zapisuje výsledek i do stávající tabulky Supabase `test_results`; `total_questions` je skutečný počet úloh (32), `score` jsou získané body z 50. Chybné úlohy se uchovávají pouze v daném prohlížeči, bez změny databázového schématu. Dříve uložené cvičné chyby zůstávají dostupné odděleně.

## Ověření

`npm test` spouští regresní testy dat, úplného skóre, částečných bodů, hranice úspěšnosti, otevřených odpovědí a časovače pomocí vestavěného Node.js test runneru (Node.js 22.18+ / 24).

Při přidání dalšího termínu ověř originální sešit, klíč, komentované řešení, všechny odpovědi a součet maximálních bodů. Nesmí se jen doplnit náhodné otázky do počtu 50.

V cloudovém Chromium bránila přímému HTTPS zobrazení nedůvěra k místnímu síťovému proxy. Originální soubory a odkazy byly ověřeny přes systémový TLS klient bez vypnutí ověřování. Browserové regresní kontroly používají stažené originály jako místní testovací fixture; tyto PDF nejsou součástí repozitáře. Změna trvalého úložiště certifikátů nebyla provedena.
