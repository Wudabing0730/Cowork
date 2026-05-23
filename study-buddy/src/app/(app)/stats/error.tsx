'use client';

export default function StatsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-20">
      <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>加载统计数据时出错</p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
        style={{ background: 'var(--accent)' }}
      >
        重试
      </button>
    </div>
  );
}
