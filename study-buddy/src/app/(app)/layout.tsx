import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex" style={{ borderTop: '1px solid var(--grid-line)' }}>
      <Sidebar />
      <div className="flex-1 min-w-0 max-w-3xl mx-auto px-8 py-10">
        {children}
      </div>
    </div>
  );
}
