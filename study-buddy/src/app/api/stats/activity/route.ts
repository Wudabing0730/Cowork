import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { calculateStreak } from '@/lib/streak';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get all completed task dates
  const rows = getDb().prepare(`
    SELECT DISTINCT date(updatedAt) as date, COUNT(*) as count
    FROM todos
    WHERE userId = ? AND completed = 1
    GROUP BY date(updatedAt)
    ORDER BY date DESC
  `).all(auth.userId) as { date: string; count: number }[];

  // Calculate streak
  const dateMap = new Map(rows.map(r => [r.date, r.count]));
  const streak = calculateStreak(rows.map(r => r.date));

  // Activity for last 90 days
  const today = new Date();
  const activity: { date: string; count: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    activity.push({ date: dateStr, count: dateMap.get(dateStr) || 0 });
  }

  const totalCompleted = rows.reduce((sum, r) => sum + r.count, 0);

  return NextResponse.json({ streak, totalCompleted, activity });
}
