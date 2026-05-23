import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items } = await req.json() as { items: { id: number; sortOrder: number }[] };
  if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const stmt = getDb().prepare('UPDATE todos SET sortOrder = ?, updatedAt = datetime(\'now\') WHERE id = ? AND userId = ?');
  const tx = getDb().transaction((rows: { id: number; sortOrder: number }[]) => {
    for (const row of rows) {
      stmt.run(row.sortOrder, row.id, auth.userId);
    }
  });

  tx(items);
  return NextResponse.json({ ok: true });
}
