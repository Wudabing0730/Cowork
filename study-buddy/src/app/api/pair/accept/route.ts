import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pairId } = await req.json();
  if (!pairId) return NextResponse.json({ error: 'Pair ID is required' }, { status: 400 });

  const pair = getDb().prepare('SELECT * FROM pairs WHERE id = ? AND user2Id = ? AND status = ?').get(pairId, auth.userId, 'pending') as { id: number } | undefined;
  if (!pair) return NextResponse.json({ error: 'No pending pair request found' }, { status: 404 });

  getDb().prepare('UPDATE pairs SET status = ? WHERE id = ?').run('accepted', pairId);
  return NextResponse.json({ success: true });
}
