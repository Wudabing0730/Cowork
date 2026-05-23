'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) router.push('/dashboard');
    });
  }, [router]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-6 overflow-hidden">
      {/* Decorative ink blobs */}
      <div
        className="ink-blob hidden sm:block"
        style={{
          width: '500px',
          height: '400px',
          background: 'var(--accent)',
          top: '5%',
          left: '-10%',
          borderRadius: '60% 40% 45% 55% / 50% 55% 45% 50%',
        }}
      />
      <div
        className="ink-blob hidden sm:block"
        style={{
          width: '400px',
          height: '350px',
          background: 'var(--success)',
          bottom: '10%',
          right: '-8%',
          borderRadius: '40% 60% 55% 45% / 55% 45% 55% 45%',
        }}
      />

      {/* Cinnabar accent line */}
      <div className="w-16 h-[2px] mb-16" style={{ background: 'var(--accent)' }} />

      {/* Hero */}
      <h1
        className="text-6xl sm:text-8xl font-black mb-8 tracking-tight leading-none serif-display"
        style={{ color: 'var(--text-primary)' }}
      >
        学习搭子
      </h1>

      <p
        className="text-lg sm:text-xl mb-16 max-w-lg leading-relaxed"
        style={{ color: 'var(--text-secondary)', fontWeight: 400 }}
      >
        以墨为约，与友共进。<br />
        找一位学习搭子，互相查看任务进度，一起成长。
      </p>

      <div className="flex gap-4 mb-24">
        <Link
          href="/register"
          className="ink-hover px-10 py-3.5 text-sm font-semibold tracking-wide"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          免费开始
        </Link>
        <Link
          href="/login"
          className="ink-hover px-10 py-3.5 text-sm font-semibold tracking-wide"
          style={{
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-surface)',
          }}
        >
          登录
        </Link>
      </div>

      {/* Feature grid — refined with artistic borders */}
      <div
        className="w-full max-w-2xl"
        style={{
          border: '1px solid var(--grid-line-strong)',
          borderTop: '2px solid var(--accent)',
        }}
      >
        {[
          { title: '创建任务', desc: '把每日学习计划拆解成可执行的小任务。' },
          { title: '配对搭子', desc: '搜索并邀请好友成为你的学习搭子。' },
          { title: '互相监督', desc: '查看搭子的进度，互相催更、点赞鼓励。' },
        ].map(({ title, desc }, i) => (
          <div
            key={title}
            className="grid grid-cols-[140px_1fr] items-center"
            style={{ borderBottom: i < 2 ? '1px solid var(--grid-line)' : 'none' }}
          >
            <div
              className="px-6 py-5 text-sm font-semibold tracking-wide"
              style={{
                color: 'var(--text-primary)',
                borderRight: '1px solid var(--grid-line)',
              }}
            >
              {title}
            </div>
            <div className="px-6 py-5 text-sm text-left leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Footer decorative element */}
      <div className="mt-20 flex items-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
        <div className="w-8 h-[1px]" style={{ background: 'var(--grid-line-strong)' }} />
        <span className="text-xs label-spaced">墨韵相伴</span>
        <div className="w-8 h-[1px]" style={{ background: 'var(--grid-line-strong)' }} />
      </div>
    </div>
  );
}
