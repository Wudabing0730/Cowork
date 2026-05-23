import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pair = getDb().prepare(
    'SELECT * FROM pairs WHERE (user1Id = ? OR user2Id = ?) AND status = ?'
  ).get(auth.userId, auth.userId, 'accepted') as { id: number; user1Id: number; user2Id: number; status: string } | undefined;

  if (!pair) return NextResponse.json({ partner: null, todos: [] });

  const partnerId = pair.user1Id === auth.userId ? pair.user2Id : pair.user1Id;
  const partner = getDb().prepare('SELECT id, username FROM users WHERE id = ?').get(partnerId) as { id: number; username: string };
  const todos = getDb().prepare('SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC').all(partnerId);

  return NextResponse.json({ partner, todos });
}
