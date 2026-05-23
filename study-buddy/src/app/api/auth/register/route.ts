import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }
  if (username.length < 2 || password.length < 4) {
    return NextResponse.json({ error: 'Username must be 2+ chars, password 4+ chars' }, { status: 400 });
  }

  const existing = getDb().prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const result = getDb().prepare('INSERT INTO users (username, passwordHash) VALUES (?, ?)').run(username, passwordHash);
  const token = await createToken(result.lastInsertRowid as number);

  const res = NextResponse.json({ success: true, userId: result.lastInsertRowid });
  res.cookies.set('sb-token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
  return res;
}
