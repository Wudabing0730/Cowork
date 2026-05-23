'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : { user: null }))
      .then(d => setUser(d.user));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const isApp = pathname.startsWith('/dashboard') || pathname.startsWith('/stats');

  return (
    <nav
      className="sticky top-0 z-20 h-14 flex items-center px-6"
      style={{
        background: 'var(--bg-root)',
        borderBottom: '1px solid var(--grid-line)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href={user ? '/dashboard' : '/'}
          className="font-bold text-sm tracking-tight serif-display"
          style={{ color: 'var(--text-primary)' }}
        >
          学习搭子
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <ThemeToggle />
          {user ? (
            <>
              {isApp && (
                <>
                  <Link
                    href="/dashboard"
                    className="transition-colors text-xs font-semibold tracking-wide"
                    style={{
                      color: pathname === '/dashboard' ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    任务
                  </Link>
                  <Link
                    href="/stats"
                    className="transition-colors text-xs font-semibold tracking-wide"
                    style={{
                      color: pathname === '/stats' ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    统计
                  </Link>
                </>
              )}
              <span
                className="text-xs px-3 py-1 font-semibold"
                style={{
                  border: '1px solid var(--grid-line)',
                  color: 'var(--text-secondary)',
                }}
              >
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="transition-colors text-xs font-medium"
                style={{ color: 'var(--text-tertiary)' }}
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="transition-colors text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                登录
              </Link>
              <Link
                href="/register"
                className="ink-hover px-4 py-1.5 text-sm font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
