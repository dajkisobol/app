import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

interface UserRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
}

export async function POST(req: Request) {
  try {
    const { identifier, password, isGuest } = await req.json();

    if (isGuest) {
      const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@maturyta.cz`;
      const guestUser = {
        id: guestId,
        username: 'Host / Student',
        email: guestEmail,
        isGuest: true
      };

      // Insert guest into DB for foreign key constraint support
      db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)').run(
        guestId,
        `Host_${guestId.substring(6)}`,
        guestEmail,
        'guest'
      );

      const token = signToken(guestUser);
      const res = NextResponse.json({ success: true, user: guestUser });
      res.cookies.set('maturyta_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
      return res;
    }

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Zadejte uživatelské jméno / e-mail a heslo.' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(identifier, identifier) as UserRecord | undefined;
    if (!user) {
      return NextResponse.json({ error: 'Uživatel nenalezen.' }, { status: 401 });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Nesprávné heslo.' }, { status: 401 });
    }

    const userSession = { id: user.id, username: user.username, email: user.email };
    const token = signToken(userSession);

    const res = NextResponse.json({ success: true, user: userSession });
    res.cookies.set('maturyta_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Chyba při přihlášení: ' + message }, { status: 500 });
  }
}
