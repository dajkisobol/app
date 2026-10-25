import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CERMAT_EXAMS, isTaskAnswered, scoreExam, scoreTask, secondsRemaining, taskRows } from '../src/lib/cermat.ts';

function correctAnswers(exam) {
  return Object.fromEntries(exam.tasks.map(t => [t.number, t.kind === 'choice' ? t.correct[0] : t.kind === 'words' ? t.correct.join(', ') : Object.fromEntries(taskRows(t).map((row, i) => [row, t.correct[i]]))]));
}

for (const exam of CERMAT_EXAMS) {
  test(`${exam.code}: complete 32-task test, 50 points, valid sources`, () => {
    assert.deepEqual(exam.tasks.map(t => t.number), Array.from({ length: 32 }, (_, i) => i + 1));
    assert.equal(exam.tasks.reduce((sum, t) => sum + t.points, 0), 50);
    for (const t of exam.tasks) {
      assert.ok(t.page >= 1 && t.page <= exam.pages);
      assert.ok(!t.passagePage || t.passagePage <= t.page);
      if (t.options) for (const answer of t.correct) assert.ok(t.options.includes(answer));
    }
    for (const key of ['bookletUrl', 'keyUrl', 'commentaryUrl']) assert.equal(new URL(exam[key]).hostname, 'maturita.cermat.cz');
  });
  test(`${exam.code}: official key scores 50/50, blank test scores 0/50`, () => {
    const full = scoreExam(exam, correctAnswers(exam));
    assert.equal(full.points, 50); assert.equal(full.passed, true); assert.equal(full.percentage, 100);
    assert.equal(scoreExam(exam, {}).points, 0);
    assert.equal(scoreExam(exam, {}).passed, false);
  });
}

const spring = CERMAT_EXAMS[0];
const autumn = CERMAT_EXAMS[1];
test('A/N groups score 2 for four, 1 for three, 0 for two correct answers', () => {
  const task = spring.tasks[0];
  assert.equal(scoreTask(task, { '1.1': 'N', '1.2': 'N', '1.3': 'A', '1.4': 'N' }).points, 2);
  assert.equal(scoreTask(task, { '1.1': 'N', '1.2': 'N', '1.3': 'A' }).points, 1);
  assert.equal(scoreTask(task, { '1.1': 'N', '1.2': 'N' }).points, 0);
});
test('ordering is all-or-nothing, matching gives one point per correct pair', () => {
  const ordered = spring.tasks[6];
  const answers = correctAnswers(spring)[7];
  assert.equal(scoreTask(ordered, answers).points, 3);
  assert.equal(scoreTask(ordered, { ...answers, '7.5': 'B' }).points, 0);
  assert.equal(scoreTask(spring.tasks[10], { '11.1': 'B', '11.2': 'C' }).points, 2);
});
test('open-word scoring subtracts missing and extra words as the official key requires', () => {
  const task = spring.tasks[2];
  assert.equal(scoreTask(task, 'řadí, nechodí').points, 2);
  assert.equal(scoreTask(task, 'nechodí\nřadí').points, 2);
  assert.equal(scoreTask(task, 'patří, řadí, nechodí').points, 1);
  assert.equal(scoreTask(task, 'patří, nechodí').points, 0);
  assert.equal(scoreTask(task, 'řadí, řadí, nechodí').points, 1);
  assert.equal(scoreTask(task, 'řadí').points, 1);
  assert.equal(scoreTask(task, '').points, 0);
});
test('diacritics and accepted forms follow the individual task rules', () => {
  assert.equal(scoreTask(spring.tasks[2], 'radi, nechodi').points, 2);
  assert.equal(scoreTask(spring.tasks[16], 'kráskou, rychlíkem').points, 2);
  assert.equal(scoreTask(spring.tasks[29], 'trojrozměrný, lososy, se neosvětlí, zdařilých').points, 4);
  // Three wrong spellings mean three missing correct words plus three extras.
  assert.equal(scoreTask(spring.tasks[29], 'trojrozmerny, lososy, neosvetli, zdarilych').points, 0);
  assert.equal(scoreTask(spring.tasks[29], 'trojrozmerny, lososy, neosvětlí, zdařilých').points, 2);
  assert.equal(scoreTask(autumn.tasks[1], { '2.1': 'je hitem', '2.2': 'byl prijat' }).points, 2);
});
test('wrong input type never gets free points or throws', () => {
  for (const exam of CERMAT_EXAMS) for (const task of exam.tasks) {
    assert.equal(scoreTask(task, undefined).points, 0);
    assert.equal(scoreTask(task, task.kind === 'words' || task.kind === 'choice' ? {} : '').points, 0);
  }
});
test('completion requires every subtask; clearing a selected answer works', () => {
  assert.equal(isTaskAnswered(spring.tasks[0], { '1.1': 'N' }), false);
  assert.equal(isTaskAnswered(spring.tasks[0], correctAnswers(spring)[1]), true);
  assert.equal(isTaskAnswered(spring.tasks[1], ''), false);
  assert.equal(isTaskAnswered(spring.tasks[2], '   '), false);
});
test('timer uses elapsed wall time, including time spent off the page', () => {
  const start = 1_000_000;
  assert.equal(secondsRemaining(start, 85, start), 5100);
  assert.equal(secondsRemaining(start, 85, start + 30_000), 5070);
  assert.equal(secondsRemaining(start, 85, start + 5_101_000), 0);
});
test('the official success boundary is 22 points, not 50 percent', () => {
  const answers = correctAnswers(spring);
  let kept = 0;
  for (const task of spring.tasks) {
    if (kept + task.points <= 22) kept += task.points;
    else delete answers[task.number];
  }
  assert.equal(scoreExam(spring, answers).points, 22);
  assert.equal(scoreExam(spring, answers).passed, true);
});
