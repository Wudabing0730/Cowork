'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: number; username: string; points: number; level: number } | null>(null);
  const [summary, setSummary] = useState<{ streak: number; todayCompleted: number; totalCompleted: number; totalTodos: number } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => setUser(d.user));
  }, []);

  useEffect(() => {
    fetch('/api/stats/summary')
      .then(r => r.ok ? r.json() : null)
      .then(d => setSummary(d));
  }, []);

  const levelProgress = user
    ? Math.min(
        Math.round(
          ((user.points - (user.level - 1) * (user.level - 1) * 100) /
            (user.level * user.level * 100 - (user.level - 1) * (user.level - 1) * 100)) * 100
        ),
        100
      )
    : 0;

  return (
    <aside
      className="hidden lg:flex flex-col w-60 flex-shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto"
      style={{ background: 'var(--bg-root)', borderRight: '1px solid var(--grid-line)' }}
    >
      <div className="flex flex-col h-full">
        {/* User card */}
        {user && (
          <div style={{ borderBottom: '1px solid var(--grid-line)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--grid-line)' }}>
              <p
                className="text-[10px] font-semibold mb-1 label-spaced"
                style={{ color: 'var(--text-tertiary)' }}
              >
                你好
              </p>
              <p className="text-sm font-semibold truncate serif-display" style={{ color: 'var(--text-primary)' }}>
                {user.username}
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] px-2 py-0.5 font-semibold label-spaced"
                  style={{
                    background: 'var(--accent-light)',
                    color: 'var(--accent-strong)',
                    border: '1px solid var(--accent-dim)',
                  }}
                >
                  Lv.{user.level}
                </span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {user.points} 分
                </span>
              </div>
              <div
                className="h-1 mt-3 overflow-hidden"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--grid-line)' }}
              >
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${levelProgress}%`,
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-strong))',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col" style={{ borderBottom: '1px solid var(--grid-line)' }}>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 text-sm transition-all flex items-center gap-3"
            style={{
              color: pathname === '/dashboard' ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: pathname === '/dashboard' ? 600 : 400,
              borderBottom: '1px solid var(--grid-line)',
              borderLeft: pathname === '/dashboard' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <rect x="2" y="2" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8.5" y="2" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="2" y="8.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            任务列表
          </Link>
          <Link
            href="/stats"
            className="px-4 py-2.5 text-sm transition-all flex items-center gap-3"
            style={{
              color: pathname === '/stats' ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: pathname === '/stats' ? 600 : 400,
              borderLeft: pathname === '/stats' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path d="M1.5 11h5v4h-5v-4zM8.5 1.5h5v4h-5v-4zM1.5 1.5h5v4h-5v-4zM8.5 8.5h5v4h-5v-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            学习统计
          </Link>
        </nav>

        {/* Mini progress */}
        {summary && (
          <div className="mt-auto" style={{ borderTop: '1px solid var(--grid-line)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--grid-line)' }}>
              <p className="text-[10px] font-semibold label-spaced" style={{ color: 'var(--text-tertiary)' }}>
                学习进度
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>连续打卡</span>
                  <span className="font-semibold" style={{ color: 'var(--accent-strong)' }}>{summary.streak} 天</span>
                </div>
                <div className="h-1 overflow-hidden" style={{ background: 'var(--bg-hover)', border: '1px solid var(--grid-line)' }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${Math.min(summary.streak * 10, 100)}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-strong))',
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>完成率</span>
                  <span className="font-semibold" style={{ color: 'var(--success)' }}>
                    {summary.totalTodos > 0 ? Math.round((summary.totalCompleted / summary.totalTodos) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1 overflow-hidden" style={{ background: 'var(--bg-hover)', border: '1px solid var(--grid-line)' }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${summary.totalTodos > 0 ? Math.round((summary.totalCompleted / summary.totalTodos) * 100) : 0}%`,
                      background: 'var(--success)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
