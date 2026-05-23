import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requests = getDb().prepare(`
    SELECT p.id, p.user1Id, u.username as user1Name
    FROM pairs p
    JOIN users u ON u.id = p.user1Id
    WHERE p.user2Id = ? AND p.status = 'pending'
  `).all(auth.userId);

  return NextResponse.json({ requests });
}
