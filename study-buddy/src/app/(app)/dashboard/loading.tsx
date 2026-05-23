export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 rounded-md animate-pulse" style={{ background: 'var(--border)' }} />
        <div className="h-4 w-16 rounded animate-pulse" style={{ background: 'var(--border)' }} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="h-7 w-12 rounded animate-pulse" style={{ background: 'var(--border)' }} />
            <div className="h-3 w-16 rounded mt-1.5 animate-pulse" style={{ background: 'var(--border)' }} />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 h-10 rounded-md animate-pulse" style={{ background: 'var(--border)' }} />
        <div className="h-10 w-16 rounded-md animate-pulse" style={{ background: 'var(--border)' }} />
      </div>

      <div className="flex gap-1.5">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-6 w-14 rounded-md animate-pulse" style={{ background: 'var(--border)' }} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-16 rounded animate-pulse mb-3" style={{ background: 'var(--border)' }} />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-12 rounded-md animate-pulse" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
