import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { POINTS, calculateLevel } from '@/lib/gamification';

const SORT_ORDERS: Record<string, string> = {
  priority: "CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END ASC, sortOrder ASC",
  dueDate: "CASE WHEN dueDate = '' THEN 1 ELSE 0 END, dueDate ASC, sortOrder ASC",
  createdAt: "sortOrder ASC",
  completed: "completed ASC, sortOrder ASC",
};

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tag = req.nextUrl.searchParams.get('tag');
  const sort = req.nextUrl.searchParams.get('sort') || 'createdAt';
  const orderBy = SORT_ORDERS[sort] || SORT_ORDERS.createdAt;

  let todos;
  if (tag) {
    todos = getDb().prepare(`SELECT * FROM todos WHERE userId = ? AND tag = ? ORDER BY ${orderBy}`).all(auth.userId, tag);
  } else {
    todos = getDb().prepare(`SELECT * FROM todos WHERE userId = ? ORDER BY ${orderBy}`).all(auth.userId);
  }
  return NextResponse.json({ todos });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, tag, priority, dueDate } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  // New todos go to top: find min sortOrder and subtract 1
  const minOrder = (getDb().prepare(
    'SELECT COALESCE(MIN(sortOrder), 0) as val FROM todos WHERE userId = ?'
  ).get(auth.userId) as { val: number }).val;

  const result = getDb().prepare(
    'INSERT INTO todos (userId, title, description, tag, priority, dueDate, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(auth.userId, title, description || '', tag || '', priority || 'medium', dueDate || '', minOrder - 1);

  // Award points for creating a task
  getDb().prepare('UPDATE users SET points = points + ? WHERE id = ?').run(POINTS.CREATE_TASK, auth.userId);
  const updatedUser = getDb().prepare('SELECT points FROM users WHERE id = ?').get(auth.userId) as { points: number };
  getDb().prepare('UPDATE users SET level = ? WHERE id = ?').run(calculateLevel(updatedUser.points), auth.userId);

  const todo = getDb().prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ todo }, { status: 201 });
}
