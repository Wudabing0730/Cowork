import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pair = getDb().prepare(
    "SELECT * FROM pairs WHERE (user1Id = ? OR user2Id = ?) AND status = 'accepted'"
  ).get(auth.userId, auth.userId) as { id: number } | undefined;

  if (!pair) return NextResponse.json({ error: 'No active pair' }, { status: 400 });

  getDb().prepare('DELETE FROM pairs WHERE id = ?').run(pair.id);

  return NextResponse.json({ success: true });
}
