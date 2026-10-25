import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface UserBookRecord {
  book_id: string;
  custom_notes?: string;
}

export async function GET() {
  const user = await getCurrentUser();

  let userBookIds: string[] = [];
  const userNotes: Record<string, string> = {};

  if (user) {
    const userBooks = db.prepare('SELECT book_id, custom_notes FROM user_books WHERE user_id = ?').all(user.id) as UserBookRecord[];
    userBookIds = userBooks.map((b) => b.book_id);
    userBooks.forEach((b) => {
      if (b.custom_notes) {
        userNotes[b.book_id] = b.custom_notes;
      }
    });
  }

  return NextResponse.json({
    catalog: BOOK_CATALOG,
    userBookIds,
    userNotes
  });
}

import { BOOK_CATALOG } from '@/lib/data';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Pro tuto akci musíte být přihlášeni.' }, { status: 401 });
  }

  const { bookId, action, notes } = await req.json();

  if (action === 'toggle') {
    const existing = db.prepare('SELECT id FROM user_books WHERE user_id = ? AND book_id = ?').get(user.id, bookId) as { id: string } | undefined;
    if (existing) {
      db.prepare('DELETE FROM user_books WHERE id = ?').run(existing.id);
      return NextResponse.json({ success: true, added: false });
    } else {
      const id = 'ub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      db.prepare('INSERT INTO user_books (id, user_id, book_id) VALUES (?, ?, ?)').run(id, user.id, bookId);
      return NextResponse.json({ success: true, added: true });
    }
  }

  if (action === 'update_notes') {
    db.prepare('UPDATE user_books SET custom_notes = ? WHERE user_id = ? AND book_id = ?').run(notes, user.id, bookId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Neznámá akce' }, { status: 400 });
}
