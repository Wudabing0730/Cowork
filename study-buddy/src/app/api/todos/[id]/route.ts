import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { POINTS, calculateLevel } from '@/lib/gamification';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const todo = getDb().prepare('SELECT * FROM todos WHERE id = ? AND userId = ?').get(params.id, auth.userId) as { id: number; completed: number } | undefined;
  if (!todo) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });

  const { title, description, completed, tag, priority, dueDate } = await req.json();
  const updates: Record<string, string | number> = { updatedAt: new Date().toISOString() };

  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (completed !== undefined) updates.completed = completed ? 1 : 0;
  if (tag !== undefined) updates.tag = tag;
  if (priority !== undefined) updates.priority = priority;
  if (dueDate !== undefined) updates.dueDate = dueDate;

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  getDb().prepare(`UPDATE todos SET ${setClauses} WHERE id = ?`).run(...values, params.id);
  const updated = getDb().prepare('SELECT * FROM todos WHERE id = ?').get(params.id);

  // Award points for completing a task (first time only)
  if (completed === true && !todo.completed) {
    getDb().prepare('UPDATE users SET points = points + ? WHERE id = ?').run(POINTS.COMPLETE_TASK, auth.userId);
    const u = getDb().prepare('SELECT points FROM users WHERE id = ?').get(auth.userId) as { points: number };
    getDb().prepare('UPDATE users SET level = ? WHERE id = ?').run(calculateLevel(u.points), auth.userId);
  }

  return NextResponse.json({ todo: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const todo = getDb().prepare('SELECT * FROM todos WHERE id = ? AND userId = ?').get(params.id, auth.userId) as { id: number } | undefined;
  if (!todo) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });

  getDb().prepare('DELETE FROM todos WHERE id = ?').run(params.id);
  return NextResponse.json({ success: true });
}
