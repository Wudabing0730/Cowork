import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pair = getDb().prepare(
    'SELECT * FROM pairs WHERE (user1Id = ? OR user2Id = ?) AND status = ?'
  ).get(auth.userId, auth.userId, 'accepted') as { id: number; user1Id: number; user2Id: number } | undefined;

  if (!pair) return NextResponse.json({ error: 'No active pair' }, { status: 400 });

  getDb().prepare('UPDATE pairs SET nudgeAt = datetime(?) WHERE id = ?').run(new Date().toISOString(), pair.id);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pair = getDb().prepare(
    'SELECT * FROM pairs WHERE (user1Id = ? OR user2Id = ?) AND status = ?'
  ).get(auth.userId, auth.userId, 'accepted') as { nudgeAt: string } | undefined;

  if (!pair) return NextResponse.json({ nudged: false });

  // Return if there's a nudge from the last 24 hours
  const nudged = !!pair.nudgeAt && (Date.now() - new Date(pair.nudgeAt).getTime()) < 86400000;
  return NextResponse.json({ nudged });
}
