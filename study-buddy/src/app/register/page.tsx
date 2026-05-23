'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Registration failed'); return; }
    router.push('/dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div
        className="w-full max-w-sm"
        style={{
          border: '1px solid var(--grid-line-strong)',
          borderTop: '2px solid var(--accent)',
          background: 'var(--bg-surface)',
        }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5" style={{ borderBottom: '1px solid var(--grid-line)' }}>
          <h1 className="text-xl font-bold tracking-tight serif-display" style={{ color: 'var(--text-primary)' }}>
            创建账号
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            开始你的学习搭子之旅
          </p>
        </div>

        {/* Body */}
        <div className="px-7 py-5">
          {error && (
            <div
              className="mb-5 p-3 text-sm"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--grid-line)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 label-spaced" style={{ color: 'var(--text-secondary)' }}>
                用户名
              </label>
              <input
                type="text"
                placeholder="至少2个字符"
                className="w-full px-3 py-2.5 text-sm focus:outline-none"
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--grid-line)',
                }}
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 label-spaced" style={{ color: 'var(--text-secondary)' }}>
                密码
              </label>
              <input
                type="password"
                placeholder="至少4位"
                className="w-full px-3 py-2.5 text-sm focus:outline-none"
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--grid-line)',
                }}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={4}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="ink-hover w-full py-3 text-sm font-semibold tracking-wide disabled:opacity-50 mt-1"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-7 py-4" style={{ borderTop: '1px solid var(--grid-line)' }}>
          <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            已有账号？{' '}
            <Link href="/login" className="font-medium underline underline-offset-2" style={{ color: 'var(--accent)' }}>
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
