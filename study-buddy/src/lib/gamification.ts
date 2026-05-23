export const POINTS = {
  CREATE_TASK: 10,
  COMPLETE_TASK: 20,
  RECEIVE_LIKE: 5,
  OVERDUE_PENALTY: -5,
} as const;

export function calculateLevel(points: number): number {
  if (points < 0) return 1;
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

export function pointsForNextLevel(level: number): number {
  return level * level * 100;
}
