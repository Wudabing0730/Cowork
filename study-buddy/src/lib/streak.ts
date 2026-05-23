export function calculateStreak(dateStrings: string[]): number {
  let streak = 0;
  const today = new Date();
  const dateSet = new Set(dateStrings);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}
