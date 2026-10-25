export type ExamAnswer = string | Record<string, string>;
export type ExamAnswers = Record<number, ExamAnswer>;

export interface ExamTask {
  number: number;
  page: number;
  passagePage?: number;
  kind: 'choice' | 'binary' | 'matching' | 'order' | 'words' | 'text';
  points: number;
  correct: string[];
  options?: string[];
  ignoreDiacritics?: boolean;
  /** Additional accepted forms, one array for each word in the solution. */
  variants?: string[][];
  /** Zero-based answer positions whose capitalization is part of the solution. */
  caseSensitiveParts?: number[];
  /** These positions tolerate vowel-length accents, but preserve other diacritics. */
  vowelLengthOnlyParts?: number[];
  manualReview?: boolean;
}

export interface CermatExam {
  id: string;
  title: string;
  code: string;
  season: string;
  year: number;
  minutes: number;
  maxPoints: number;
  passPoints: number;
  pages: number;
  bookletUrl: string;
  keyUrl: string;
  commentaryUrl: string;
  sourceUrl: string;
  tasks: ExamTask[];
}

const origin = 'https://maturita.cermat.cz';
const sourceUrl = `${origin}/menu/testy-a-zadani-z-predchozich-obdobi/cesky-jazyk-a-literatura/testy-a-zadani-cesky-jazyk.html`;
const letters = (count: number) => 'ABCDEF'.slice(0, count).split('');
const choice = (number: number, page: number, answer: string, passagePage?: number): ExamTask => ({ number, page, kind: 'choice', points: 1, correct: [answer], options: letters(4), passagePage });
const binary = (number: number, page: number, answers: string, passagePage?: number): ExamTask => ({ number, page, kind: 'binary', points: 2, correct: answers.split(''), options: ['A', 'N'], passagePage });
const matching = (number: number, page: number, answers: string, optionCount: number): ExamTask => ({ number, page, kind: 'matching', points: answers.length, correct: answers.split(''), options: letters(optionCount) });
const order = (number: number, page: number, answers: string): ExamTask => ({ number, page, kind: 'order', points: 3, correct: answers.split(''), options: letters(answers.length) });
const words = (number: number, page: number, correct: string[], config: Partial<ExamTask> = {}): ExamTask => ({ number, page, kind: 'words', points: correct.length, correct, ignoreDiacritics: true, ...config });
const text = (number: number, page: number, correct: string[], config: Partial<ExamTask> = {}): ExamTask => ({ number, page, kind: 'text', points: correct.length, correct, ignoreDiacritics: false, ...config });
const pdf = (name: string) => `${origin}/files/files/${encodeURIComponent(name)}`;

/** The 2023 spring key explicitly permits doubled consonants and, for Gilgameš, i/y errors. */
function nameSpellings(name: string, allowIy = false): string[] {
  return [...name].reduce<string[]>((forms, letter) => {
    const alternatives = allowIy && /[iy]/i.test(letter) ? ['i', 'y']
      : /[bcčdďfghjklmnňpqrřsštťvwxzž]/i.test(letter) ? [letter, letter + letter] : [letter];
    return forms.flatMap(form => alternatives.map(ending => form + ending));
  }, ['']);
}

/** Factual answer keys, transcribed and checked against the original CZVV PDFs.
 * The copyrighted booklets stay at the official source and are embedded by URL.
 * See docs/cermat-sources.md for verification and scoring rules.
 */
export const CERMAT_EXAMS: CermatExam[] = [
  {
    id: 'cjl-2026-jaro', title: 'Čeština — jaro 2026', code: 'CJMZD26C0T01', season: 'Jaro', year: 2026,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 12, sourceUrl,
    bookletUrl: `${origin}/files/files/CJL_2026j_TS.pdf`,
    keyUrl: `${origin}/files/files/CJL_2026j_KSR.pdf`,
    commentaryUrl: `${origin}/files/files/CJL_2026j_komentovana_verze.pdf`,
    tasks: [
      binary(1, 2, 'NNAN', 2), choice(2, 2, 'C', 2),
      words(3, 3, ['řadí', 'nechodí'], { passagePage: 2 }),
      choice(4, 3, 'B', 2), choice(5, 3, 'C', 2), choice(6, 3, 'D'),
      order(7, 4, 'BEADC'), choice(8, 4, 'B'), choice(9, 5, 'A'),
      words(10, 5, ['širokou', 'četné'], { manualReview: true, variants: [
        ['široký', 'široká', 'široké', 'širokého', 'široké', 'širokému', 'širokou', 'širokém', 'širokým', 'širocí', 'širokých', 'širokými'],
        ['četný', 'četná', 'četné', 'četného', 'četnému', 'četnou', 'četném', 'četným', 'četní', 'četných', 'četnými'],
      ] }),
      matching(11, 5, 'BCDA', 6), binary(12, 6, 'ANAA', 6),
      choice(13, 6, 'D', 6), choice(14, 7, 'B', 6), choice(15, 7, 'C', 6), choice(16, 7, 'D', 6),
      words(17, 7, ['kráska', 'rychlík'], { manualReview: true, variants: [
        ['krásky', 'krásce', 'krásku', 'krásko', 'kráskou', 'krásek', 'kráskám', 'kráskách', 'kráskami'],
        ['rychlíku', 'rychlíkem', 'rychlíky', 'rychlíků', 'rychlíkům', 'rychlících'],
      ] }),
      binary(18, 8, 'NAAN', 8), choice(19, 9, 'D', 8), choice(20, 9, 'C', 8),
      choice(21, 9, 'D', 8), choice(22, 9, 'A', 8), words(23, 9, ['díky', 'vůči'], { passagePage: 8 }),
      binary(24, 10, 'AAAN', 10), choice(25, 10, 'C', 10), choice(26, 11, 'A', 10),
      choice(27, 11, 'B', 10), choice(28, 11, 'C', 10), matching(29, 11, 'ABD', 5),
      words(30, 12, ['trojrozměrný', 'lososy', 'neosvětlí', 'zdařilých'], { ignoreDiacritics: false, variants: [[], [], ['se neosvětlí', 'neosvětlí se'], []] }),
      choice(31, 12, 'D'), choice(32, 12, 'A'),
    ],
  },
  {
    id: 'cjl-2026-podzim', title: 'Čeština — podzim 2026', code: 'CJMZD26C0T04', season: 'Podzim', year: 2026,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 11, sourceUrl,
    bookletUrl: `${origin}/files/files/CJL_2026p_TS.pdf`,
    keyUrl: `${origin}/files/files/CJL_2026p_KSR.pdf`,
    commentaryUrl: `${origin}/files/files/CJL_2026p_komentovana_verze.pdf`,
    tasks: [
      binary(1, 2, 'NNNN', 2),
      { number: 2, page: 3, passagePage: 2, kind: 'text', points: 2, correct: ['je hitem', 'byl přijat'], ignoreDiacritics: true },
      choice(3, 3, 'D', 2), choice(4, 3, 'D', 2), choice(5, 3, 'B', 2), choice(6, 3, 'A'),
      binary(7, 4, 'ANNA', 4), choice(8, 4, 'C', 4), choice(9, 4, 'B', 4), choice(10, 5, 'B', 4), choice(11, 5, 'A', 4),
      order(12, 5, 'CEADB'), matching(13, 6, 'ACB', 5),
      words(14, 6, ['vědomí', 'média'], { manualReview: true, variants: [
        ['vědomím', 'vědomích', 'vědomím', 'vědomími'],
        ['médium', 'média', 'médiu', 'médiem', 'médií', 'médiím', 'médiích', 'médii'],
      ] }),
      binary(15, 7, 'NNNA', 7), choice(16, 7, 'C', 7), choice(17, 7, 'D', 7), choice(18, 7, 'D', 7),
      choice(19, 8, 'C', 7), choice(20, 8, 'D', 7),
      words(21, 8, ['napadlo', 'připadal'], { passagePage: 7, manualReview: true, variants: [[], ['připadal jsem si', 'jsem si připadal']] }),
      binary(22, 9, 'ANAN', 9), choice(23, 9, 'B', 9), choice(24, 9, 'C', 9),
      words(25, 9, ['játra', 'varhany'], { passagePage: 9, manualReview: true, variants: [
        ['jater', 'játrům', 'játrech', 'játry'], ['varhan', 'varhanám', 'varhanech', 'varhanách', 'varhanami'],
      ] }),
      choice(26, 10, 'B', 9), choice(27, 10, 'D', 9), choice(28, 10, 'C'),
      words(29, 11, ['ovocnými', 'skryli', 'vinné', 'připomnělo'], { ignoreDiacritics: false, variants: [[], ['skryli se', 'se skryli'], [], []] }),
      choice(30, 11, 'A'), choice(31, 11, 'A'), matching(32, 11, 'CBAF', 6),
    ],
  },
  {
    id: 'cjl-2025-jaro', title: 'Čeština — jaro 2025', code: 'CJMZD25C0T01', season: 'Jaro', year: 2025,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 11, sourceUrl,
    bookletUrl: pdf("CJL_2025j_TS.pdf"),
    keyUrl: pdf("CJL_2025j_KSŘ_web.pdf"),
    commentaryUrl: pdf("CJMZD25C0T01_komentovaná_verze_web_FINAL_oprava2.pdf"),
    tasks: [
      binary(1, 2, "ANNN", 2),
      choice(2, 2, "A", 2),
      choice(3, 3, "C", 2),
      text(4, 3, ["hrdými", "věnovaného"], { passagePage: 2 }),
      choice(5, 3, "D", 2),
      choice(6, 3, "C", 3),
      binary(7, 3, "NAAA"),
      matching(8, 4, "BAD", 5),
      choice(9, 4, "B", 4),
      choice(10, 5, "C", 4),
      choice(11, 5, "B", 4),
      text(12, 5, ["nevolí", "pláčem"], { passagePage: 4 }),
      order(13, 5, "BDAEC"),
      binary(14, 6, "NNAN", 6),
      words(15, 6, ["vysláním", "poslů"], { passagePage: 6, ignoreDiacritics: false, manualReview: true, variants: [["vyslání", "vysláních", "vysláními"], ["posel", "posla", "poslu", "poslem", "posli", "poslové", "posly", "poslům", "poslech"]] }),
      choice(16, 6, "A", 6),
      choice(17, 7, "D", 6),
      choice(18, 7, "A", 6),
      choice(19, 7, "C", 7),
      choice(20, 7, "D", 7),
      choice(21, 7, "B"),
      binary(22, 8, "NNNN", 8),
      words(23, 8, ["hrozné", "pořádný"], { passagePage: 8, manualReview: true, variants: [["hrozný", "hrozná", "hrozného", "hroznému", "hroznou", "hrozném", "hrozným", "hrozní", "hrozných", "hroznými"], ["pořádná", "pořádné", "pořádného", "pořádnému", "pořádnou", "pořádném", "pořádným", "pořádní", "pořádných", "pořádnými"]] }),
      choice(24, 9, "D", 8),
      choice(25, 9, "D", 8),
      choice(26, 9, "B", 8),
      choice(27, 9, "A", 9),
      words(28, 10, ["stvořit", "orientovali", "nejznámější", "vydobylo"], { passagePage: 10, ignoreDiacritics: false, variants: [[], ["orientovali se", "se orientovali"], [], []] }),
      choice(29, 10, "D", 10),
      choice(30, 10, "C", 10),
      choice(31, 11, "D", 10),
      matching(32, 11, "AFCB", 6),
    ],
  },
  {
    id: 'cjl-2025-podzim', title: 'Čeština — podzim 2025', code: 'CJMZD25C0T04', season: 'Podzim', year: 2025,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 11, sourceUrl,
    bookletUrl: pdf("CJMAD25C0T04_web.pdf"),
    keyUrl: pdf("CJL_Klíč_správných_řešení.pdf"),
    commentaryUrl: pdf("CJMZD25C0T04_komentovaná_řešení_web_FINAL.pdf"),
    tasks: [
      choice(1, 2, "B", 2),
      choice(2, 2, "D", 2),
      binary(3, 3, "NNAN", 2),
      choice(4, 3, "A", 2),
      choice(5, 3, "D", 2),
      choice(6, 3, "C", 2),
      choice(7, 3, "A"),
      order(8, 4, "DBEAC"),
      matching(9, 4, "DBC", 5),
      words(10, 5, ["žil", "životě"], { passagePage: 5, points: 1, manualReview: true, variants: [["žil jsem", "jsem žil", "žít", "žiji", "žiju", "žiješ", "žije", "žijeme", "žijete", "žijí", "žila", "žilo", "žili", "žily"], ["život", "života", "životu", "životem", "životy", "životů", "životům", "životech"]] }),
      choice(11, 5, "C", 5),
      choice(12, 5, "B", 5),
      choice(13, 5, "C", 5),
      choice(14, 6, "B", 6),
      binary(15, 6, "ANNN", 6),
      text(16, 7, ["mějme", "získali bychom"], { passagePage: 6, ignoreDiacritics: true }),
      choice(17, 7, "B", 6),
      choice(18, 7, "B", 6),
      choice(19, 7, "C", 6),
      binary(20, 7, "AAAN"),
      choice(21, 8, "B", 8),
      choice(22, 8, "D", 8),
      binary(23, 9, "NNNA", 8),
      text(24, 9, ["několik", "kompletně"], { passagePage: 8, ignoreDiacritics: true, variants: [["několika", "pár"], ["úplně"]] }),
      choice(25, 9, "B", 8),
      choice(26, 9, "D", 8),
      choice(27, 9, "D", 9),
      words(28, 10, ["vychytralým", "strhnou", "překvapily", "zaměřili"], { passagePage: 10, ignoreDiacritics: false, variants: [[], [], [], ["zaměřili se", "se zaměřili"]] }),
      choice(29, 10, "C", 10),
      choice(30, 10, "A", 10),
      words(31, 11, ["stylistka", "kněžna", "bohyně"], { passagePage: 11, manualReview: true, variants: [["stylistky", "stylistce", "stylistku", "stylistko", "stylistkou", "stylistek", "stylistkám", "stylistkách", "stylistkami"], ["kněžny", "kněžně", "kněžnu", "kněžno", "kněžnou", "kněžen", "kněžnám", "kněžnách", "kněžnami"], ["bohyni", "bohyní", "bohyň", "bohyním", "bohyních", "bohyněmi"]] }),
      matching(32, 11, "EBDA", 6),
    ],
  },
  {
    id: 'cjl-2024-jaro', title: 'Čeština — jaro 2024', code: 'CJMZD24C0T01', season: 'Jaro', year: 2024,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 12, sourceUrl,
    bookletUrl: pdf("CJL_MZ2024J_DT.pdf"),
    keyUrl: pdf("CJMZD24C0K01_web.pdf"),
    commentaryUrl: pdf("CJMZD24C0T01_komentovaná_verze_web_final.pdf"),
    tasks: [
      binary(1, 2, "NANN", 2),
      text(2, 3, ["jelikož", "ač"], { passagePage: 2, ignoreDiacritics: true }),
      choice(3, 3, "A", 2),
      choice(4, 3, "C", 2),
      choice(5, 3, "C", 2),
      choice(6, 3, "D"),
      choice(7, 4, "A", 4),
      choice(8, 4, "C"),
      matching(9, 4, "AEC", 5),
      text(10, 5, ["popsaném", "bych zapomněl"], { passagePage: 5, variants: [[], ["bych zapomenul"]] }),
      order(11, 5, "ECBAD"),
      binary(12, 6, "NANN", 6),
      words(13, 6, ["dlaní", "ženou", "chováním"], { passagePage: 6, manualReview: true, variants: [["dlaň", "dlaně", "dlani", "dlaním", "dlaních", "dlaněmi"], ["žena", "ženy", "ženě", "ženu", "ženo", "žen", "ženám", "ženách", "ženami"], ["chování", "chováních", "chováními"]] }),
      choice(14, 6, "A", 6),
      choice(15, 7, "B", 6),
      choice(16, 7, "B", 6),
      choice(17, 7, "B", 6),
      choice(18, 7, "B", 7),
      binary(19, 8, "ANNN", 8),
      choice(20, 8, "A", 8),
      choice(21, 9, "C", 8),
      choice(22, 9, "D", 8),
      choice(23, 9, "D", 8),
      binary(24, 9, "NAAA"),
      choice(25, 10, "A", 10),
      choice(26, 10, "A", 10),
      choice(27, 10, "C", 10),
      words(28, 11, ["svý"], { passagePage: 10, ignoreDiacritics: false }),
      matching(29, 11, "ECBD", 6),
      words(30, 12, ["stezce", "skromně", "přemítání", "poctěné"], { passagePage: 12, ignoreDiacritics: false }),
      choice(31, 12, "C", 12),
      choice(32, 12, "D", 12),
    ],
  },
  {
    id: 'cjl-2024-podzim', title: 'Čeština — podzim 2024', code: 'CJMZD24C0T04', season: 'Podzim', year: 2024,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 12, sourceUrl,
    bookletUrl: pdf("ČJL_MZ2024P_TS.pdf"),
    keyUrl: pdf("ČJL_MZ2024P_KSŘ_web.pdf"),
    commentaryUrl: pdf("CJMZD24C0T04_koment_verze_web_FINALNI.pdf"),
    tasks: [
      binary(1, 2, "NNNA", 2),
      text(2, 2, ["ovlivněnou", "vedoucích"], { passagePage: 2 }),
      choice(3, 3, "B", 2),
      choice(4, 3, "A", 2),
      choice(5, 3, "C", 2),
      matching(6, 3, "CED", 5),
      binary(7, 4, "NAAA"),
      words(8, 4, ["po"], { passagePage: 4, ignoreDiacritics: false }),
      choice(9, 4, "A", 4),
      choice(10, 5, "A", 4),
      choice(11, 5, "A", 4),
      order(12, 5, "BAECD"),
      choice(13, 6, "D"),
      choice(14, 6, "B", 6),
      choice(15, 6, "A", 6),
      binary(16, 7, "NNNN", 6),
      choice(17, 7, "D", 6),
      choice(18, 7, "D", 6),
      words(19, 7, ["sušák", "budík", "škrabka"], { passagePage: 7, manualReview: true, variants: [["sušáku", "sušákem", "sušáky", "sušáků", "sušákům", "sušácích"], ["budíku", "budíkem", "budíky", "budíků", "budíkům", "budících"], ["škrabky", "škrabce", "škrabku", "škrabko", "škrabkou", "škrabek", "škrabkám", "škrabkách", "škrabkami"]] }),
      binary(20, 8, "NNAN", 8),
      words(21, 8, ["lidi", "záda"], { passagePage: 8, manualReview: true, variants: [["lidé", "lidí", "lidem", "lidech", "lidmi"], ["zad", "zádům", "zádech", "zády"]] }),
      choice(22, 9, "B", 8),
      choice(23, 9, "D", 8),
      choice(24, 9, "B", 8),
      choice(25, 9, "C", 8),
      choice(26, 9, "D", 8),
      words(27, 10, ["vzájemně", "vysychání", "neprospívají", "ochranou"], { passagePage: 10, ignoreDiacritics: false, variants: [[], ["vysýchání"], [], []] }),
      choice(28, 10, "B", 10),
      choice(29, 10, "B", 10),
      choice(30, 11, "D", 10),
      matching(31, 11, "FEDB", 6),
      choice(32, 12, "A", 12),
    ],
  },
  {
    id: 'cjl-2023-jaro', title: 'Čeština — jaro 2023', code: 'CJMZD23C0T01', season: 'Jaro', year: 2023,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 12, sourceUrl,
    bookletUrl: pdf("CJL_jaro_2023_sada_A_DT.pdf"),
    keyUrl: pdf("CJL_jaro_2023_sada_A_klic_na_web.pdf"),
    commentaryUrl: pdf("CJMZD23C0T01_komentovaná_verze_web_FINAL.pdf"),
    tasks: [
      binary(1, 2, "ANAN", 2),
      words(2, 3, ["příjmení", "střetu", "dceři"], { passagePage: 2, manualReview: true, variants: [["příjmením", "příjmeních", "příjmeními"], ["střet", "střetem", "střety", "střetů", "střetům", "střetech"], ["dcera", "dcery", "dceru", "dcero", "dcerou", "dcer", "dcerám", "dcerách", "dcerami"]] }),
      choice(3, 3, "B", 2),
      choice(4, 3, "A", 2),
      choice(5, 3, "C", 2),
      choice(6, 3, "A", 2),
      choice(7, 4, "B"),
      matching(8, 4, "AEDF", 6),
      words(9, 4, ["obrovský", "nahatý"], { passagePage: 4, manualReview: true, variants: [["obrovská", "obrovské", "obrovského", "obrovskému", "obrovskou", "obrovském", "obrovským", "obrovští", "obrovských", "obrovskými"], ["nahatá", "nahaté", "nahatého", "nahatému", "nahatou", "nahatém", "nahatým", "nahatí", "nahatých", "nahatými"]] }),
      order(10, 5, "CAEDB"),
      choice(11, 5, "A", 5),
      binary(12, 6, "ANNN", 6),
      choice(13, 6, "B", 6),
      choice(14, 7, "A", 6),
      choice(15, 7, "A", 6),
      choice(16, 7, "D", 6),
      choice(17, 7, "C", 6),
      binary(18, 8, "ANAN", 8),
      text(19, 8, ["Epos o Gilgamešovi", "Homér"], { passagePage: 8, ignoreDiacritics: true, vowelLengthOnlyParts: [1], variants: [[...nameSpellings('Gilgameš', true), ...nameSpellings('Gilgamešovi', true).map(name => `Epos o ${name}`)], ['Homéros', ...nameSpellings('Homér'), ...nameSpellings('Homéros')]] }),
      choice(20, 9, "C", 8),
      choice(21, 9, "D", 8),
      choice(22, 9, "D", 8),
      choice(23, 9, "B", 8),
      binary(24, 10, "ANAA"),
      choice(25, 10, "C", 10),
      choice(26, 11, "D", 10),
      choice(27, 11, "B", 10),
      words(28, 11, ["než"], { passagePage: 10, ignoreDiacritics: false }),
      matching(29, 11, "DBE", 5),
      words(30, 12, ["přibyly", "amerických", "výkonnou", "čidly"], { passagePage: 12, ignoreDiacritics: false, caseSensitiveParts: [1] }),
      choice(31, 12, "D", 12),
      choice(32, 12, "D", 12),
    ],
  },
  {
    id: 'cjl-2023-podzim', title: 'Čeština — podzim 2023', code: 'CJMZD23C0T04', season: 'Podzim', year: 2023,
    minutes: 85, maxPoints: 50, passPoints: 22, pages: 12, sourceUrl,
    bookletUrl: pdf("CJL_podzim_2023_DT.pdf"),
    keyUrl: pdf("CJMZD23C0K04_Web_rozsireny_klic.pdf"),
    commentaryUrl: pdf("CJMZD23C0T04_komentovaná_řešení_jednotlivých_úloh_FINAL.pdf"),
    tasks: [
      binary(1, 2, "ANAN", 2),
      words(2, 2, ["srpnové", "mezinárodní", "známém"], { passagePage: 2, manualReview: true, variants: [["srpnový", "srpnová", "srpnového", "srpnovému", "srpnovou", "srpnovém", "srpnovým", "srpnoví", "srpnových", "srpnovými"], ["mezinárodního", "mezinárodnímu", "mezinárodním", "mezinárodních", "mezinárodními"], ["známý", "známá", "známé", "známého", "známému", "známou", "známým", "známí", "známých", "známými"]] }),
      choice(3, 3, "A", 2),
      choice(4, 3, "C", 2),
      choice(5, 3, "A", 2),
      choice(6, 3, "C", 3),
      choice(7, 4, "A", 4),
      matching(8, 4, "DEB", 5),
      order(9, 5, "DCABE"),
      words(10, 5, ["sál", "obrat"], { passagePage: 5 }),
      binary(11, 6, "NANN", 6),
      choice(12, 6, "D", 6),
      choice(13, 7, "B", 6),
      choice(14, 7, "C", 6),
      choice(15, 7, "B", 6),
      choice(16, 7, "C", 6),
      choice(17, 7, "D"),
      binary(18, 8, "ANNA", 8),
      choice(19, 8, "B", 8),
      choice(20, 9, "C", 8),
      choice(21, 9, "A", 8),
      words(22, 9, ["oblast", "ker"], { passagePage: 8, ignoreDiacritics: false }),
      binary(23, 9, "ANNA"),
      choice(24, 10, "D", 10),
      choice(25, 10, "A", 10),
      choice(26, 11, "A", 10),
      words(27, 11, ["v"], { passagePage: 10, ignoreDiacritics: false }),
      matching(28, 11, "CFBD", 6),
      words(29, 12, ["setměním", "zcela", "skleněných", "narušily"], { passagePage: 12, ignoreDiacritics: false }),
      choice(30, 12, "A", 12),
      choice(31, 12, "B", 12),
      choice(32, 12, "B", 12),
    ],
  },
];

export function normalizeAnswer(value: string, ignoreDiacritics = false, caseSensitive = false) {
  const trimmed = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  const normalized = caseSensitive ? trimmed : trimmed.toLocaleLowerCase('cs');
  return ignoreDiacritics ? normalized.normalize('NFD').replace(/\p{M}/gu, '') : normalized;
}

export function taskRows(task: ExamTask) {
  return task.kind === 'choice' || task.kind === 'words' ? [] : task.correct.map((_, i) => `${task.number}.${i + 1}`);
}

export function isTaskAnswered(task: ExamTask, answer: ExamAnswer | undefined) {
  if (typeof answer === 'string') return answer.trim().length > 0;
  return !!answer && taskRows(task).every(id => !!answer[id]?.trim());
}

export interface TaskScore { points: number; maxPoints: number; correctParts: number; totalParts: number }

export function scoreTask(task: ExamTask, answer: ExamAnswer | undefined): TaskScore {
  let correctParts = 0;
  let points = 0;
  const matches = (value: string, index: number) => {
    const normalize = (s: string) => {
      const lengthOnly = task.vowelLengthOnlyParts?.includes(index);
      const value = normalizeAnswer(s, task.ignoreDiacritics && !lengthOnly, task.caseSensitiveParts?.includes(index));
      return lengthOnly ? value.normalize('NFD').replace(/\u0301/g, '').normalize('NFC') : value;
    };
    return [task.correct[index], ...(task.variants?.[index] ?? [])].some(expected => normalize(value) === normalize(expected));
  };
  if (task.kind === 'words') {
    const submitted = typeof answer === 'string' ? answer.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [];
    const remaining = new Set(task.correct.map((_, i) => i));
    let extras = 0;
    for (const word of submitted) {
      const index = [...remaining].find(i => matches(word, i));
      if (index === undefined) extras++;
      else { remaining.delete(index); correctParts++; }
    }
    points = Math.max(0, task.points - remaining.size - extras);
  } else if (task.kind === 'choice') {
    correctParts = typeof answer === 'string' && answer === task.correct[0] ? 1 : 0;
    points = correctParts;
  } else {
    const rows = taskRows(task);
    const values = typeof answer === 'object' && answer ? answer : {};
    correctParts = rows.filter((row, i) => matches(values[row] ?? '', i)).length;
    if (task.kind === 'binary') points = correctParts === 4 ? 2 : correctParts === 3 ? 1 : 0;
    else if (task.kind === 'order') points = correctParts === task.correct.length ? task.points : 0;
    else points = correctParts;
  }
  return { points, maxPoints: task.points, correctParts, totalParts: task.correct.length };
}

export function scoreExam(exam: CermatExam, answers: ExamAnswers) {
  const tasks = exam.tasks.map(task => ({ number: task.number, ...scoreTask(task, answers[task.number]) }));
  const points = tasks.reduce((sum, task) => sum + task.points, 0);
  return { points, maxPoints: exam.maxPoints, percentage: Math.round(points / exam.maxPoints * 100), passed: points >= exam.passPoints, tasks };
}

export function formatExamAnswer(task: ExamTask, answer: ExamAnswer | undefined) {
  if (typeof answer === 'string') return answer.trim() || 'Nezodpovězeno';
  return taskRows(task).map(row => `${row}: ${answer?.[row] || '—'}`).join(' · ');
}

export function secondsRemaining(startedAt: number, minutes: number, now = Date.now()) {
  return Math.max(0, Math.ceil((startedAt + minutes * 60_000 - now) / 1000));
}
