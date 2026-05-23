import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = getDb().prepare('SELECT id, username, points, level, createdAt FROM users WHERE id = ?').get(auth.userId) as { id: number; username: string; points: number; level: number; createdAt: string };

  return NextResponse.json({ user: { id: user.id, username: user.username, points: user.points, level: user.level, createdAt: user.createdAt } });
}
