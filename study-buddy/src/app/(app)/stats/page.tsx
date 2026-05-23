'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Heatmap from '@/components/Heatmap';

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [activity, setActivity] = useState<{ date: string; count: number }[]>([]);
  const [summary, setSummary] = useState<{ yesterdayCompleted: number; todayCompleted: number; streak: number } | null>(null);

  const fetchStats = useCallback(async () => {
    const [statsRes, summaryRes] = await Promise.all([
      fetch('/api/stats/activity').then(r => r.ok ? r.json() : { streak: 0, totalCompleted: 0, activity: [] }),
      fetch('/api/stats/summary').then(r => r.ok ? r.json() : null),
    ]);
    setStreak(statsRes.streak || 0);
    setTotalCompleted(statsRes.totalCompleted || 0);
    setActivity(statsRes.activity || []);
    setSummary(summaryRes);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--grid-line)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div style={{ borderBottom: '1px solid var(--grid-line)', paddingBottom: '1.25rem' }}>
        <Link
          href="/dashboard"
          className="text-xs font-semibold transition-colors inline-flex items-center gap-1 mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
            <path d="M9 11L5.5 7.5 9 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回任务列表
        </Link>
        <h1 className="text-xl font-bold tracking-tight serif-display" style={{ color: 'var(--text-primary)' }}>
          学习统计
        </h1>
      </div>

      {activity.length > 0 && (
        <Heatmap activity={activity} streak={streak} totalCompleted={totalCompleted} />
      )}

      <div>
        {summary && (
          <div style={{ border: '1px solid var(--grid-line)' }}>
            <div className="p-5" style={{ borderBottom: '1px solid var(--grid-line)' }}>
              <h3 className="text-xs font-semibold label-spaced" style={{ color: 'var(--text-secondary)' }}>每日小结</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2" style={{ border: '1px solid var(--grid-line)' }}>
                <div
                  className="text-center p-4"
                  style={{ borderRight: '1px solid var(--grid-line)' }}
                >
                  <div className="text-2xl font-bold serif-display" style={{ color: 'var(--accent-strong)' }}>{summary.todayCompleted}</div>
                  <div className="text-[10px] mt-1 font-semibold label-spaced" style={{ color: 'var(--text-tertiary)' }}>今日完成</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold serif-display" style={{ color: 'var(--warn)' }}>{summary.yesterdayCompleted}</div>
                  <div className="text-[10px] mt-1 font-semibold label-spaced" style={{ color: 'var(--text-tertiary)' }}>昨日完成</div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4" style={{ borderTop: '1px solid var(--grid-line)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                连续打卡{' '}
                <span className="font-bold serif-display" style={{ color: 'var(--accent-strong)' }}>{summary.streak}</span>{' '}
                天
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
