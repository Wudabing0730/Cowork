import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { POINTS, calculateLevel } from '@/lib/gamification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the todo belongs to partner
  const todo = getDb().prepare('SELECT * FROM todos WHERE id = ?').get(params.id) as { id: number; userId: number; likes: number } | undefined;
  if (!todo) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });

  // Check user is paired with the todo owner
  const pair = getDb().prepare(
    'SELECT * FROM pairs WHERE ((user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)) AND status = ?'
  ).get(auth.userId, todo.userId, todo.userId, auth.userId, 'accepted') as { id: number } | undefined;

  if (!pair) return NextResponse.json({ error: 'Not paired with this user' }, { status: 403 });

  const newLikes = todo.likes + 1;
  getDb().prepare('UPDATE todos SET likes = ? WHERE id = ?').run(newLikes, params.id);

  // Award points to the todo owner for receiving a like
  getDb().prepare('UPDATE users SET points = points + ? WHERE id = ?').run(POINTS.RECEIVE_LIKE, todo.userId);
  const u = getDb().prepare('SELECT points FROM users WHERE id = ?').get(todo.userId) as { points: number };
  getDb().prepare('UPDATE users SET level = ? WHERE id = ?').run(calculateLevel(u.points), todo.userId);

  return NextResponse.json({ likes: newLikes });
}
