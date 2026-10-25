import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('maturyta_token', '', { expires: new Date(0), path: '/' });
  return res;
}
