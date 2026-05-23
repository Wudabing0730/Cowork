import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { calculateStreak } from '@/lib/streak';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const completed = getDb().prepare(
    "SELECT COUNT(*) as count FROM todos WHERE userId = ? AND completed = 1 AND date(updatedAt) = ?"
  ).get(auth.userId, dateStr) as { count: number };

  const todayCount = (getDb().prepare(
    "SELECT COUNT(*) as count FROM todos WHERE userId = ? AND completed = 1 AND date(updatedAt) = ?"
  ).get(auth.userId, new Date().toISOString().split('T')[0]) as { count: number }).count;

  // Total streak
  const rows = getDb().prepare(`
    SELECT DISTINCT date(updatedAt) as date
    FROM todos WHERE userId = ? AND completed = 1
    ORDER BY date DESC
  `).all(auth.userId) as { date: string }[];

  const streak = calculateStreak(rows.map(r => r.date));

  // Total todos
  const totalTodos = (getDb().prepare(
    "SELECT COUNT(*) as count FROM todos WHERE userId = ?"
  ).get(auth.userId) as { count: number }).count;

  const totalCompleted = (getDb().prepare(
    "SELECT COUNT(*) as count FROM todos WHERE userId = ? AND completed = 1"
  ).get(auth.userId) as { count: number }).count;

  const tagRows = getDb().prepare(
    "SELECT tag, COUNT(*) as count FROM todos WHERE userId = ? AND tag != '' GROUP BY tag"
  ).all(auth.userId) as { tag: string; count: number }[];
  const tagCounts: Record<string, number> = {};
  for (const row of tagRows) { tagCounts[row.tag] = row.count; }

  return NextResponse.json({
    yesterdayCompleted: completed.count,
    todayCompleted: todayCount,
    streak,
    totalTodos,
    totalCompleted,
    tagCounts,
  });
}
