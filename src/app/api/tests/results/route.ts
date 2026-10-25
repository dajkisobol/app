import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizovaný přístup' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let query = 'SELECT * FROM user_missed_questions WHERE user_id = ? AND mastered = 0';
  const params: any[] = [user.id];

  if (category && category !== 'vse') {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY times_failed DESC, created_at DESC';

  const rows: any[] = db.prepare(query).all(...params);
  const questions = rows.map((r) => ({
    id: r.question_id,
    missedRecordId: r.id,
    test_id: r.test_id,
    category: r.category,
    prompt: r.prompt,
    options: JSON.parse(r.options_json),
    correctOption: r.correct_option,
    explanation: r.explanation,
    timesFailed: r.times_failed
  }));

  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizovaný přístup' }, { status: 401 });
  }

  const { testId, testTitle, score, totalQuestions, timeSpentSeconds, missedQuestions } = await req.json();

  // Save overall test result
  const resultId = 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  db.prepare(`
    INSERT INTO test_results (id, user_id, test_id, test_title, score, total_questions, time_spent_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(resultId, user.id, testId, testTitle, score, totalQuestions, timeSpentSeconds);

  // Process missed questions for weakness practice queue
  if (Array.isArray(missedQuestions) && missedQuestions.length > 0) {
    for (const q of missedQuestions) {
      const existing: any = db.prepare(
        'SELECT id, times_failed FROM user_missed_questions WHERE user_id = ? AND question_id = ?'
      ).get(user.id, q.id);

      if (existing) {
        db.prepare(
          'UPDATE user_missed_questions SET times_failed = times_failed + 1, mastered = 0 WHERE id = ?'
        ).run(existing.id);
      } else {
        const missedId = 'miss_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        db.prepare(`
          INSERT INTO user_missed_questions
          (id, user_id, question_id, test_id, category, prompt, options_json, correct_option, explanation, times_failed, mastered)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
        `).run(
          missedId,
          user.id,
          q.id,
          testId,
          q.category,
          q.prompt,
          JSON.stringify(q.options),
          q.correctOption,
          q.explanation
        );
      }
    }
  }

  return NextResponse.json({ success: true, resultId });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizovaný přístup' }, { status: 401 });
  }

  const { questionId, mastered } = await req.json();
  db.prepare('UPDATE user_missed_questions SET mastered = ? WHERE user_id = ? AND question_id = ?').run(
    mastered ? 1 : 0,
    user.id,
    questionId
  );

  return NextResponse.json({ success: true });
}
