import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await req.json();
  if (!username) return NextResponse.json({ error: 'Username is required' }, { status: 400 });

  const target = getDb().prepare('SELECT id, username FROM users WHERE username = ?').get(username) as { id: number; username: string } | undefined;
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (target.id === auth.userId) return NextResponse.json({ error: 'Cannot pair with yourself' }, { status: 400 });

  // Check if already paired or pending
  const existing = getDb().prepare(
    'SELECT * FROM pairs WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)'
  ).get(auth.userId, target.id, target.id, auth.userId) as { id: number } | undefined;

  if (existing) {
    return NextResponse.json({ error: 'Pair already exists or is pending' }, { status: 409 });
  }

  getDb().prepare('INSERT INTO pairs (user1Id, user2Id, status) VALUES (?, ?, ?)').run(auth.userId, target.id, 'pending');
  return NextResponse.json({ success: true, status: 'pending' }, { status: 201 });
}
