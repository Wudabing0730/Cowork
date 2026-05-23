'use client';

interface DayCell {
  date: string;
  count: number;
}

function getColor(count: number): string {
  if (count === 0) return 'var(--grid-line)';
  if (count === 1) return '#E8D5C4';
  if (count === 2) return '#D4A08A';
  if (count === 3) return '#C46852';
  return '#C41E3A';
}

export default function Heatmap({ activity, streak, totalCompleted }: { activity: DayCell[]; streak: number; totalCompleted: number }) {
  const weeks: DayCell[][] = [];
  let currentWeek: DayCell[] = [];

  const firstDay = new Date(activity[0]?.date || '');
  const startPad = firstDay.getDay() || 7;
  for (let i = 1; i < startPad; i++) {
    currentWeek.push({ date: '', count: -1 });
  }

  for (const day of activity) {
    const dow = new Date(day.date).getDay() || 7;
    currentWeek.push(day);
    if (dow === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div style={{ border: '1px solid var(--grid-line)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--grid-line)' }}>
        <h3 className="text-xs font-semibold label-spaced" style={{ color: 'var(--text-secondary)' }}>
          学习热力图
        </h3>
        <span
          className="text-[10px] font-semibold px-2 py-0.5"
          style={{
            background: 'var(--accent-light)',
            color: 'var(--accent-strong)',
            border: '1px solid var(--accent-dim)',
          }}
        >
          {streak} 天连续打卡
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex gap-[2px] overflow-x-auto pb-2 justify-center">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  title={day.date ? `${day.date}: ${day.count} 个任务` : ''}
                  className="w-3 h-3 transition-all hover:scale-125"
                  style={{ background: day.count === -1 ? 'transparent' : getColor(day.count) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--grid-line)' }}>
        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
          <span>少</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-3 h-3" style={{ background: i === 0 ? 'var(--grid-line)' : getColor(i) }} />
          ))}
          <span>多</span>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
          累计完成 {totalCompleted} 个任务
        </span>
      </div>
    </div>
  );
}
