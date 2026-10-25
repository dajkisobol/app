import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Chybí povinné údaje.' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Heslo musí mít alespoň 4 znaky.' }, { status: 400 });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return NextResponse.json({ error: 'Uživatel s tímto jménem nebo e-mailem již existuje.' }, { status: 400 });
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = hashPassword(password);

    db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)').run(
      userId,
      username,
      email,
      passwordHash
    );

    const userSession = { id: userId, username, email };
    const token = signToken(userSession);

    const res = NextResponse.json({ success: true, user: userSession });
    res.cookies.set('maturyta_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Chyba serveru při registraci: ' + message }, { status: 500 });
  }
}
