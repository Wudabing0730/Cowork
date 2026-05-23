export default function StatsLoading() {
  return (
    <div className="space-y-8">
      <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--border)' }} />
      <div className="h-7 w-28 rounded-md animate-pulse" style={{ background: 'var(--border)' }} />
      <div className="h-36 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
        <div className="h-48 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
      </div>
    </div>
  );
}
