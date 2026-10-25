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
];

export function normalizeAnswer(value: string, ignoreDiacritics = false) {
  const normalized = value.normalize('NFC').trim().toLocaleLowerCase('cs').replace(/\s+/g, ' ');
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
  const normalize = (s: string) => normalizeAnswer(s, task.ignoreDiacritics);
  if (task.kind === 'words') {
    const submitted = typeof answer === 'string' ? answer.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [];
    const remaining = new Set(task.correct.map((_, i) => i));
    let extras = 0;
    for (const word of submitted) {
      const index = [...remaining].find(i => [task.correct[i], ...(task.variants?.[i] ?? [])].some(v => normalize(v) === normalize(word)));
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
    correctParts = rows.filter((row, i) => normalize(values[row] ?? '') === normalize(task.correct[i])).length;
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
